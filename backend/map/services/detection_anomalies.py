from dataclasses import asdict, dataclass
from datetime import timedelta

from django.db.models import Avg, Count, Q
from django.utils import timezone

from ..models import (
    AlerteObjet,
    Evenement,
    Feu,
    HistoriqueObjet,
    LieuInteret,
    Parking,
    RegleAlerte,
    Vehicule,
)

TYPE_MODEL_MAP = {
    "vehicule": Vehicule,
    "feu": Feu,
    "parking": Parking,
    "lieu": LieuInteret,
    "evenement": Evenement,
}


@dataclass
class ResultatAnomalieConsommation:
    anomalie_detectee: bool
    type_objet: str
    objet_id: int
    consommation_actuelle: float
    moyenne_historique: float
    seuil_declenchement: float
    seuil_absolu_kwh: float
    echantillons: int
    message: str
    regle_id: int | None = None
    alerte_id: int | None = None

    def to_dict(self):
        return asdict(self)


def recuperer_objet(type_objet, objet_id):
    model = TYPE_MODEL_MAP.get(type_objet)
    if model is None:
        return None
    return model.objects.select_related("zone").filter(pk=objet_id).first()


def determiner_type_objet(instance):
    for type_objet, model in TYPE_MODEL_MAP.items():
        if isinstance(instance, model):
            return type_objet
    raise ValueError("Type d'objet non supporte pour l'analyse de consommation.")


def recuperer_regle_alerte(instance, type_objet):
    zone = getattr(instance, "zone", None)
    regle = (
        RegleAlerte.objects.filter(type_objet=type_objet, est_active=True)
        .filter(Q(zone=zone) | Q(zone__isnull=True))
        .order_by("-zone_id", "id")
        .first()
    )

    if regle:
        return regle

    # Cette regle par defaut permet d'utiliser le service meme avant parametrage.
    return RegleAlerte(
        nom=f"Regle par defaut {type_objet}",
        type_objet=type_objet,
    )


def analyser_anomalie_consommation(instance, consommation_actuelle=None):
    """
    Analyse la consommation d'un objet (feu, parking, etc.) par rapport à son historique.
    Si la consommation dépasse le seuil défini, une anomalie est détectée.
    - Entrée: instance de l'objet, consommation actuelle (optionnel)
    - Traitement: Récupère l'historique récent, calcule la moyenne, et compare la consommation actuelle.
    - Sortie: Objet ResultatAnomalieConsommation avec le diagnostic.
    """
    type_objet = determiner_type_objet(instance)
    regle = recuperer_regle_alerte(instance, type_objet)
    
    # Récupérer la valeur actuelle à tester
    valeur_actuelle = float(
        consommation_actuelle
        if consommation_actuelle is not None
        else getattr(instance, "consommation_actuelle", 0.0) or 0.0
    )

    # Délimiter la période d'analyse
    date_limite = timezone.now() - timedelta(hours=regle.fenetre_analyse_heures)
    
    # Calculer la moyenne de consommation historique sur la période
    agr = HistoriqueObjet.objects.filter(
        type_objet=type_objet,
        objet_id=instance.id,
        date_mesure__gte=date_limite,
    ).aggregate(moyenne=Avg("consommation_kwh"), echantillons=Count("id"))

    moyenne = float(agr["moyenne"] or 0.0)
    echantillons = int(agr["echantillons"] or 0)

    # S'il n'y a pas assez de données pour établir une base fiable
    if echantillons < regle.echantillons_minimum or moyenne <= 0:
        return ResultatAnomalieConsommation(
            anomalie_detectee=False,
            type_objet=type_objet,
            objet_id=instance.id,
            consommation_actuelle=valeur_actuelle,
            moyenne_historique=moyenne,
            seuil_declenchement=0.0,
            seuil_absolu_kwh=regle.seuil_absolu_kwh,
            echantillons=echantillons,
            message="Historique insuffisant pour evaluer une anomalie fiable.",
            regle_id=regle.id,
        )

    seuil_declenchement = moyenne * regle.seuil_surconsommation
    ecart_kwh = valeur_actuelle - moyenne
    anomalie = (
        valeur_actuelle >= seuil_declenchement
        and ecart_kwh >= regle.seuil_absolu_kwh
    )

    if anomalie:
        message = (
            f"Surconsommation detectee sur {instance.nom}: "
            f"{valeur_actuelle:.2f} kWh contre une moyenne de {moyenne:.2f} kWh."
        )
    else:
        message = "Consommation dans la plage attendue."

    return ResultatAnomalieConsommation(
        anomalie_detectee=anomalie,
        type_objet=type_objet,
        objet_id=instance.id,
        consommation_actuelle=valeur_actuelle,
        moyenne_historique=moyenne,
        seuil_declenchement=seuil_declenchement,
        seuil_absolu_kwh=regle.seuil_absolu_kwh,
        echantillons=echantillons,
        message=message,
        regle_id=regle.id,
    )


def declencher_alerte_consommation(instance, resultat):
    """
    Crée une alerte en base de données si une anomalie est détectée, tout en évitant le spam (cooldown).
    - Entrée: instance de l'objet, résultat de l'analyse
    - Traitement: Vérifie si une alerte existe déjà récemment, sinon en crée une avec une sévérité adaptée.
    - Sortie: Instance de l'alerte créée ou existante, ou None.
    """
    if not resultat.anomalie_detectee:
        return None

    regle = recuperer_regle_alerte(instance, resultat.type_objet)
    date_cooldown = timezone.now() - timedelta(minutes=regle.cooldown_minutes)
    
    # Éviter de créer de multiples alertes pour le même objet trop rapidement (système de cooldown)
    alerte_existante = (
        AlerteObjet.objects.filter(
            type_objet=resultat.type_objet,
            objet_id=resultat.objet_id,
            code="SURCONSOMMATION",
            statut__in=["active", "acknowledged"],
            declenchee_le__gte=date_cooldown,
        )
        .order_by("-declenchee_le")
        .first()
    )

    if alerte_existante:
        resultat.alerte_id = alerte_existante.id
        return alerte_existante

    ecart_percent = 0.0
    if resultat.moyenne_historique > 0:
        ecart_percent = (
            (resultat.consommation_actuelle - resultat.moyenne_historique)
            / resultat.moyenne_historique
        ) * 100

    niveau = "critical" if ecart_percent >= 80 else "warning"
    alerte = AlerteObjet.objects.create(
        type_objet=resultat.type_objet,
        objet_id=resultat.objet_id,
        zone=getattr(instance, "zone", None),
        code="SURCONSOMMATION",
        niveau=niveau,
        message=resultat.message,
        valeur_mesuree=resultat.consommation_actuelle,
        valeur_reference=resultat.moyenne_historique,
        ecart_percent=round(ecart_percent, 2),
        contexte={
            "nom_objet": getattr(instance, "nom", ""),
            "regle_id": regle.id,
            "seuil_declenchement": round(resultat.seuil_declenchement, 3),
            "echantillons": resultat.echantillons,
        },
    )
    resultat.alerte_id = alerte.id
    return alerte


def verifier_consommation_et_declencher_alerte(instance, consommation_actuelle=None):
    resultat = analyser_anomalie_consommation(instance, consommation_actuelle)
    declencher_alerte_consommation(instance, resultat)
    return resultat
