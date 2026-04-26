import random
import time

from django.core.management.base import BaseCommand
from django.utils import timezone
from map.models import AlerteObjet, Evenement, Feu, Parking, Point, Vehicule


class Command(BaseCommand):
    help = "Simulateur Smart City Paris : Incidents localisés sur des zones réelles."

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS("🚀 Moteur Cergy-IoT : Mode Paris Intra-muros activé...")
        )

        while True:
            # --- PARTIE 1 : MOUVEMENT DES VÉHICULES ---
            vehicules = Vehicule.objects.filter(est_actif=True, en_panne=False)
            for v in vehicules:
                if v.point_actuel:
                    v.vitesse = random.uniform(30.0, 60.0)
                    p = v.point_actuel
                    # Déplacement léger
                    p.latitude += random.uniform(-0.0002, 0.0002)
                    p.longitude += random.uniform(-0.0002, 0.0002)
                    p.save()
                    v.save()

            # --- PARTIE 2 : GÉNÉRATION D'INCIDENTS SUR ZONES EXISTANTES ---
            if random.random() < 0.2:  # 10% de chance d'incident
                # On récupère tous les points d'intérêt existants (Feux, Parkings, Bus)
                # pour être SUR de spawner à Paris là où il y a de l'activité
                cibles = list(Feu.objects.all()) + list(Parking.objects.all())

                if cibles:
                    cible = random.choice(cibles)
                    # On récupère les coordonnées de l'objet existant
                    point_reference = cible.position

                    # On crée un nouveau point très proche de l'objet existant
                    lat_noise = point_reference.latitude + random.uniform(
                        -0.0005, 0.0005
                    )
                    lon_noise = point_reference.longitude + random.uniform(
                        -0.0005, 0.0005
                    )

                    nouveau_point = Point.objects.create(
                        latitude=lat_noise, longitude=lon_noise
                    )

                    types = [
                        (
                            "ACCIDENT GÉANT",
                            "Carambolage impliquant plusieurs véhicules",
                            "critical",
                        ),
                        (
                            "INONDATION",
                            "Rupture de canalisation, chaussée impraticable",
                            "critical",
                        ),
                        (
                            "INCENDIE",
                            "Départ de feu sur transformateur électrique",
                            "critical",
                        ),
                    ]
                    code, desc, niv = random.choice(types)

                    # Création de l'événement (qui apparaîtra sur la carte)
                    # Le save() auto-déterminera la rue exacte via l'API Gouv
                    evt = Evenement.objects.create(
                        nom=f"ALERTE : {code}",
                        description=desc,
                        position=nouveau_point,
                        type_evenement="autre",
                        date_debut=timezone.now(),
                        en_panne=True,
                    )

                    # Création de l'alerte pour le Dashboard et les Notifs
                    AlerteObjet.objects.create(
                        type_objet="evenement",
                        objet_id=evt.id,
                        zone=evt.zone,
                        code=code,
                        niveau=niv,
                        message=f"⚠️ {code} signalé à proximité de {cible.nom}. {desc}.",
                        statut="active",
                    )

                    self.stdout.write(
                        self.style.ERROR(
                            f"💥 INCIDENT CRÉÉ : {code} près de {cible.nom}"
                        )
                    )

            time.sleep(5)  # On ralentit un peu pour laisser l'API Gouv respirer
