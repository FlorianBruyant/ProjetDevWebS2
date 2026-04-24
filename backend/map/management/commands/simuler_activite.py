import random

from django.core.management.base import BaseCommand
from map.models import Feu, HistoriqueObjet, Parking, Vehicule


class Command(BaseCommand):
    help = "Simule la consommation énergétique et l'état des objets"

    def handle(self, *args, **options):
        # Simulation pour les Véhicules (Bus/Velibs)
        for v in Vehicule.objects.all():
            HistoriqueObjet.objects.create(
                objet_id=v.id,
                type_objet="vehicule",
                consommation_kwh=random.uniform(5.0, 15.0) if not v.en_panne else 0.5,
                est_en_panne=v.en_panne,
            )

        # Simulation pour les Feux (Consommation stable sauf si panne)
        for f in Feu.objects.all():
            HistoriqueObjet.objects.create(
                objet_id=f.id,
                type_objet="feu",
                consommation_kwh=random.uniform(0.1, 0.3),
                est_en_panne=f.etat_actuel == "PANNE",
            )

        # Simulation pour les Parkings (% de remplissage)
        for p in Parking.objects.all():
            HistoriqueObjet.objects.create(
                objet_id=p.id,
                type_objet="parking",
                consommation_kwh=random.uniform(1.0, 3.0),
                valeur_specifique=random.randint(0, 100),  # Taux d'occupation
            )

        self.stdout.write(
            self.style.SUCCESS("Données d'historique générées avec succès")
        )
