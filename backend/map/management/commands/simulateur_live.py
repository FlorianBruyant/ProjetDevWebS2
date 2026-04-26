import random
import time

from django.core.management.base import BaseCommand
from django.utils import timezone
from map.models import (
    AlerteObjet,
    Evenement,
    Feu,
    LieuInteret,
    Parking,
    Point,
    Vehicule,
)


class Command(BaseCommand):
    help = (
        "Simulateur Smart City Paris : Pannes globales sur tous les objets connectés."
    )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS(
                " Moteur Paris-Live : Pannes globales et Mouvement Fluide activés..."
            )
        )

        while True:
            # ==========================================
            # 1. VÉHICULES (Mouvement, Consommation et Batterie)
            # ==========================================
            vehicules = Vehicule.objects.filter(est_actif=True, en_panne=False)
            for v in vehicules:
                if v.point_actuel:
                    # Aléatoire pour la batterie (Panne à 2%)
                    if random.random() < 0.02:
                        v.en_panne = True
                        v.vitesse = 0
                        v.save()

                        AlerteObjet.objects.create(
                            type_objet="vehicule",
                            objet_id=v.id,
                            zone=v.zone,
                            code="PANNE_BATTERIE",
                            niveau="warning",
                            message=f" Véhicule {v.immatriculation} immobilisé : Batterie épuisée.",
                            statut="active",
                        )
                        self.stdout.write(
                            self.style.WARNING(f" Panne sèche : {v.immatriculation}")
                        )
                        continue

                    # Logique de mouvement proportionnelle à la vitesse
                    v.vitesse = random.uniform(30.0, 70.0)
                    intervalle = 5  # Temps de pause du simulateur en secondes
                    deplacement = (v.vitesse / 3600) * intervalle * 0.009

                    p = v.point_actuel
                    p.latitude += random.uniform(-deplacement, deplacement)
                    p.longitude += random.uniform(-deplacement, deplacement)
                    p.save()

                    # Augmentation de la consommation liée à la vitesse
                    v.consommation_actuelle = (v.vitesse * 1.5) + random.uniform(5, 15)
                    v.save()

            # ==========================================
            # 2. FEUX TRICOLORES (Pannes matérielles)
            # ==========================================
            feux_actifs = Feu.objects.filter(est_actif=True, en_panne=False)
            if random.random() < 0.05:  # 5% de chance par boucle
                if feux_actifs.exists():
                    f = random.choice(feux_actifs)
                    f.en_panne = True
                    f.etat_actuel = "ORANGE"  # Clignotant par défaut en cas de panne
                    f.save()

                    AlerteObjet.objects.create(
                        type_objet="feu",
                        objet_id=f.id,
                        zone=f.zone,
                        code="PANNE_FEU",
                        niveau="critical",
                        message=f" Dysfonctionnement critique : Feu {f.nom} hors service.",
                        statut="active",
                    )
                    self.stdout.write(self.style.NOTICE(f" Feu en panne : {f.nom}"))

            # ==========================================
            # 3. PARKINGS (Pannes capteurs ou barrières)
            # ==========================================
            parkings_actifs = Parking.objects.filter(est_actif=True, en_panne=False)
            if random.random() < 0.05:  # 5% de chance
                if parkings_actifs.exists():
                    p_obj = random.choice(parkings_actifs)
                    p_obj.en_panne = True
                    p_obj.save()

                    AlerteObjet.objects.create(
                        type_objet="parking",
                        objet_id=p_obj.id,
                        zone=p_obj.zone,
                        code="PANNE_CAPTEUR",
                        niveau="warning",
                        message=f"️ Erreur système : Parking {p_obj.nom} bloqué / Capteurs inopérants.",
                        statut="active",
                    )
                    self.stdout.write(
                        self.style.WARNING(f"️ Parking bloqué : {p_obj.nom}")
                    )

            # ==========================================
            # 4. LIEUX D'INTÉRÊT (Coupures ou fermetures)
            # ==========================================
            lieux_actifs = LieuInteret.objects.filter(est_actif=True, en_panne=False)
            if random.random() < 0.03:  # 3% de chance
                if lieux_actifs.exists():
                    l = random.choice(lieux_actifs)
                    l.en_panne = True
                    l.save()

                    AlerteObjet.objects.create(
                        type_objet="lieu",
                        objet_id=l.id,
                        zone=l.zone,
                        code="COUPURE_INFRA",
                        niveau="warning",
                        message=f"️ Incident infrastructure : Fermeture d'urgence à {l.nom}.",
                        statut="active",
                    )
                    self.stdout.write(
                        self.style.WARNING(f"️ Lieu hors-service : {l.nom}")
                    )

            # ==========================================
            # 5. INCIDENTS GÉOLOCALISÉS (Événements majeurs)
            # ==========================================
            if random.random() < 0.08:  # 8% de chance de pop
                cibles = (
                    list(Feu.objects.all())
                    + list(Parking.objects.all())
                    + list(LieuInteret.objects.all())
                )
                if cibles:
                    cible = random.choice(cibles)
                    pt_ref = cible.position

                    nouveau_point = Point.objects.create(
                        latitude=pt_ref.latitude + random.uniform(-0.0005, 0.0005),
                        longitude=pt_ref.longitude + random.uniform(-0.0005, 0.0005),
                    )

                    types = [
                        (
                            "ACCIDENT MAJEUR",
                            "Collision détectée entre plusieurs usagers.",
                            "critical",
                        ),
                        (
                            "INONDATION",
                            "Alerte inondation : réseau d'évacuation saturé.",
                            "critical",
                        ),
                        (
                            "INCENDIE",
                            "Départ de feu à proximité de l'infrastructure.",
                            "critical",
                        ),
                        (
                            "ÉBOULEMENT",
                            "Obstruction majeure de la voie publique.",
                            "warning",
                        ),
                    ]
                    code, desc, niv = random.choice(types)

                    evt = Evenement.objects.create(
                        nom=f"ALERTE : {code}",
                        description=desc,
                        position=nouveau_point,
                        type_evenement="autre",
                        date_debut=timezone.now(),
                        en_panne=True,
                    )

                    AlerteObjet.objects.create(
                        type_objet="evenement",
                        objet_id=evt.id,
                        zone=evt.zone,
                        code=code.replace(" ", "_"),
                        niveau=niv,
                        message=f"️ {code} à {evt.zone.nom if evt.zone else 'Paris'}. {desc}",
                        statut="active",
                    )
                    self.stdout.write(
                        self.style.ERROR(f" Incident grave : {code} vers {evt.zone}")
                    )

            time.sleep(10)


def demarrer_simulation_live():
    print("\n" + "=" * 50)
    print(" LANCEMENT DU SIMULATEUR EN TEMPS RÉEL")
    print("=" * 50)
    try:
        sim = Command()
        sim.handle()
    except KeyboardInterrupt:
        print("\n Simulation arrêtée par l'utilisateur.")
