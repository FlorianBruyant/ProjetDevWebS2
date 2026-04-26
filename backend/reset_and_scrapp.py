import os
import random
import threading
import time

import django
from django.utils import timezone

# 1. Connexion au cerveau de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# 2. Imports de tes modèles et scrappeurs
from map.models import AlerteObjet, Evenement, Feu, Parking, Point, Vehicule, Zone
from recuperateur_feux import importer_feux
from recuperateur_parking import maj_parkings_ouvrage
from recuperateur_velos import maj_carte_en_temps_reel


def clear_total():
    print("🧨 DESTRUCTION TOTALE DES DONNÉES...")
    # On vide tout pour repartir sur une base propre
    Vehicule.objects.all().delete()
    Evenement.objects.all().delete()
    AlerteObjet.objects.all().delete()
    Parking.objects.all().delete()
    Feu.objects.all().delete()
    Point.objects.all().delete()
    Zone.objects.all().delete()
    print("✅ Base de données nettoyée.\n")


def lancer_scrapping_global():
    print("📡 SCRAPPING DES DONNÉES RÉELLES DE PARIS (Threads)...")
    t1 = threading.Thread(target=importer_feux)
    t2 = threading.Thread(target=maj_parkings_ouvrage)
    t3 = threading.Thread(target=maj_carte_en_temps_reel)

    t1.start()
    t2.start()
    t3.start()

    t1.join()
    t2.join()
    t3.join()
    print("✅ Données Paris récupérées.")


def generer_incidents_initiaux(nombre=3):
    """Crée quelques incidents tout de suite pour peupler la carte au démarrage."""
    print(f"⚠️  GÉNÉRATION DE {nombre} INCIDENTS DE DÉPART...")
    ancres = list(Feu.objects.all()) + list(Parking.objects.all())
    if not ancres:
        return

    for _ in range(nombre):
        ancre = random.choice(ancres)
        pt = Point.objects.create(
            latitude=ancre.position.latitude + random.uniform(-0.0004, 0.0004),
            longitude=ancre.position.longitude + random.uniform(-0.0004, 0.0004),
        )
        evt = Evenement.objects.create(
            nom="Incident Initial",
            position=pt,
            type_evenement="autre",
            date_debut=timezone.now(),
            en_panne=True,
        )
        # La zone sera remplie auto par le save() via ton API Gouv
    print("✅ Incidents de départ créés.")


if __name__ == "__main__":
    start_time = time.time()

    # 1. Nettoyage
    clear_total()

    # 2. Remplissage avec les vraies données
    lancer_scrapping_global()

    # 3. Quelques incidents pour la route
    generer_incidents_initiaux(4)

    duree = time.time() - start_time
    print(f"\n✨ SCRAPPING TERMINÉ en {round(duree, 2)} secondes.")
