from django.test import TestCase

from .models import AlerteObjet, HistoriqueObjet, Parking, Point, RegleAlerte, Zone
from .services.detection_anomalies import verifier_consommation_et_declencher_alerte


class DetectionAnomaliesTests(TestCase):
    def setUp(self):
        self.zone = Zone.objects.create(nom="Zone Nord")
        self.point = Point.objects.create(latitude=48.85, longitude=2.35)
        self.parking = Parking.objects.create(
            nom="Parking Capteurs A",
            position=self.point,
            places_totales=120,
            consommation_actuelle=4.8,
            zone=self.zone,
        )
        RegleAlerte.objects.create(
            nom="Regle parking",
            type_objet="parking",
            seuil_surconsommation=1.5,
            seuil_absolu_kwh=0.5,
            fenetre_analyse_heures=24,
            echantillons_minimum=4,
            cooldown_minutes=30,
        )

    def test_declenche_une_alerte_sur_surconsommation(self):
        for _ in range(6):
            HistoriqueObjet.objects.create(
                objet_id=self.parking.id,
                type_objet="parking",
                consommation_kwh=2.0,
            )

        resultat = verifier_consommation_et_declencher_alerte(self.parking)

        self.assertTrue(resultat.anomalie_detectee)
        self.assertEqual(AlerteObjet.objects.count(), 1)
        self.assertIsNotNone(resultat.alerte_id)

    def test_ne_declenche_pas_d_alerte_si_consommation_normale(self):
        for _ in range(6):
            HistoriqueObjet.objects.create(
                objet_id=self.parking.id,
                type_objet="parking",
                consommation_kwh=3.8,
            )

        resultat = verifier_consommation_et_declencher_alerte(self.parking)

        self.assertFalse(resultat.anomalie_detectee)
        self.assertEqual(AlerteObjet.objects.count(), 0)
