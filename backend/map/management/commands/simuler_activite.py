import random

from django.core.management.base import BaseCommand
from django.utils import timezone
from map.models import Evenement, Feu, HistoriqueObjet, LieuInteret, Parking, Vehicule


class Command(BaseCommand):
    help = "Simule la consommation énergétique et la fréquentation des objets"

    def handle(self, *args, **options):
        maintenant = timezone.now()

        # 1. Véhicules (Vitesse actuelle)
        for v in Vehicule.objects.all():
            nouvelle_vitesse = random.randint(0, 50) if not v.en_panne else 0
            v.vitesse = nouvelle_vitesse  # Mise à jour de l'objet
            v.save()

            HistoriqueObjet.objects.create(
                objet_id=v.id,
                type_objet="vehicule",
                consommation_kwh=random.uniform(5.0, 15.0) if not v.en_panne else 0.5,
                est_en_panne=v.en_panne,
                date_mesure=maintenant,
            )

        # 2. Simulation pour les Feux
        for f in Feu.objects.all():
            HistoriqueObjet.objects.create(
                objet_id=f.id,
                type_objet="feu",
                consommation_kwh=random.uniform(0.1, 0.3),
                est_en_panne=f.en_panne,
                date_mesure=maintenant,
            )

        # 3. Simulation pour les Parkings
        for p in Parking.objects.all():
            nouvelle_occup = random.randint(0, p.places_totales)
            p.places_occupees = nouvelle_occup  # Synchronisation du présent
            p.save()

            HistoriqueObjet.objects.create(
                objet_id=p.id,
                type_objet="parking",
                consommation_kwh=random.uniform(1.0, 3.0),
                frequentation=nouvelle_occup,  # Cohérence avec l'historique
                est_en_panne=p.en_panne,
                date_mesure=maintenant,
            )

        # 4. Simulation pour les Lieux d'intérêt (Musées, Parcs...)
        for l in LieuInteret.objects.all():
            heure = maintenant.hour
            base_frequentation = random.randint(10, 100)
            if 10 <= heure <= 18:
                base_frequentation *= 3

            l.frequentation = base_frequentation  # Mise à jour du champ temps réel
            l.save()

            HistoriqueObjet.objects.create(
                objet_id=l.id,
                type_objet="lieu",
                frequentation=base_frequentation,
                consommation_kwh=random.uniform(2.0, 8.0),
                est_en_panne=l.en_panne,
                date_mesure=maintenant,
            )

        # 5. Simulation pour les Événements
        for e in Evenement.objects.all():
            frequence = random.randint(100, 1000) if e.est_actif else 0
            e.frequentation = frequence  # Mise à jour du champ temps réel
            e.save()

            HistoriqueObjet.objects.create(
                objet_id=e.id,
                type_objet="evenement",
                frequentation=frequence,
                consommation_kwh=random.uniform(10.0, 50.0) if e.est_actif else 0,
                est_en_panne=e.en_panne,
                date_mesure=maintenant,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Données synchronisées (Historique + Temps Réel) à {maintenant}"
            )
        )
