import os
import random

import django
import requests

# 1. Configuration Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from map.models import Parking, Point

# L'URL exacte que tu as demandée
URL_API = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/stationnement-en-ouvrage/records?limit=100"


def maj_parkings_ouvrage():
    print("🧹 Nettoyage de la base de données...")
    Parking.objects.all().delete()

    print("📡 Connexion à l'API : stationnement-en-ouvrage...")

    try:
        response = requests.get(URL_API, timeout=15)
        data = response.json()
        records = data.get("results", [])

        if not records:
            print("❌ Aucun parking trouvé. Vérifie ton accès internet.")
            return

        print(f"✅ {len(records)} parkings détectés. Importation...")

        for rec in records:
            try:
                # 🚨 Mapping des champs spécifiques à ce dataset
                nom = rec.get("nom", "Parking Public")
                total = int(rec.get("nb_places", 0))

                # GPS : Dans la v2.1, geo_point_2d est un dictionnaire {'lat': ..., 'lon': ...}
                coords = rec.get("geo_point_2d")
                if not coords or total <= 0:
                    continue

                lat, lon = coords["lat"], coords["lon"]

                # Simulation : Comme ce dataset ne donne pas le "temps réel",
                # on génère un nombre de places occupées réaliste pour ta démo.
                occupees = random.randint(int(total * 0.2), int(total * 0.9))

                # 2. Enregistrement Django
                p = Point.objects.create(latitude=lat, longitude=lon)
                Parking.objects.create(
                    nom=nom,
                    position=p,
                    places_totales=total,
                    places_occupees=occupees,
                    est_actif=True,
                )
                print(f"📍 {nom[:30]} | Capacité : {total} places")

            except Exception:
                # print(f"⚠️ Erreur sur une ligne : {e}")
                continue

        print(f"\n🏁 Terminé ! {Parking.objects.count()} parkings en ouvrage importés.")

    except Exception as e:
        print(f"❌ Erreur réseau : {e}")


if __name__ == "__main__":
    maj_parkings_ouvrage()
