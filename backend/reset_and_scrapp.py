import os
import threading
import time

import django

# 1. Connexion au cerveau de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# 2. Imports de tes fichiers spécifiques
# Import des modèles pour le nettoyage
from map.models import Feu, Parking, Point, Vehicule, Zone
from recuperateur_feux import importer_feux
from recuperateur_parking import maj_parkings_ouvrage
from recuperateur_velos import maj_carte_en_temps_reel


def clear_total():
    print("🧨 DESTRUCTION TOTALE DES DONNÉES...")
    # Suppression dans l'ordre pour respecter les contraintes de clés étrangères
    Vehicule.objects.all().delete()
    Parking.objects.all().delete()
    Feu.objects.all().delete()
    Point.objects.all().delete()
    Zone.objects.all().delete()
    print("✅ Base de données nettoyée.\n")


def lancer_scrapping_global():
    # Création des threads
    t1 = threading.Thread(target=importer_feux)
    t2 = threading.Thread(target=maj_parkings_ouvrage)
    t3 = threading.Thread(target=maj_carte_en_temps_reel)

    # Lancement simultané
    t1.start()
    t2.start()
    t3.start()

    # Attente que tout le monde ait fini
    t1.join()
    t2.join()
    t3.join()


if __name__ == "__main__":
    start_time = time.time()

    # On vide tout
    clear_total()

    # On relance tout
    lancer_scrapping_global()

    duree = time.time() - start_time
    print(f"\n✨ OPÉRATION TERMINÉE en {round(duree, 2)} secondes.")

    # Vérification des zones créées automatiquement par l'API Géo
    zones = Zone.objects.all()
    print(f"📊 {zones.count()} zones détectées automatiquement :")
    for z in zones:
        print(f"   - {z.nom}")
