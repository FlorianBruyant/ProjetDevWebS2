import os

import django
import requests

# 1. Config Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from map.models import Parking, Point

# L'URL est la bonne, mais les noms des champs à l'intérieur changent
URL_API = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/stationnement-voie-publique-emplacements/records?limit=50"


def maj_enfin_reussie():
    print(f"📊 État actuel : {Parking.objects.count()} parkings en base.")

    try:
        response = requests.get(URL_API)
        data = response.json()
        records = data.get("results", [])

        print(f"📡 API : {len(records)} éléments reçus. Analyse des champs...")

        for i, rec in enumerate(records):
            try:
                # 🚨 CORRECTION : Dans cette API, c'est 'geo_point_2d'
                coords = rec.get("geo_point_2d")

                if not coords:
                    print(f"⚠️ Élément {i} ignoré : 'geo_point_2d' introuvable.")
                    continue

                lat = coords.get("lat")
                lon = coords.get("lon")

                # Nom de la rue
                nom_rue = rec.get("nom_voie", f"Rue Inconnue {i}")
                # Nombre de places
                nb_places = int(rec.get("nb_places", 1))

                # 1. Création du Point
                p = Point.objects.create(latitude=lat, longitude=lon)

                # 2. Création du Parking
                pk = Parking.objects.create(
                    nom=f"Place : {nom_rue}",
                    position=p,
                    places_totales=nb_places,
                    places_occupees=0,
                    est_actif=True,
                )
                print(f"✅ [{i}] Enregistré : {pk.nom} ({lat}, {lon})")

            except Exception as e:
                print(f"❌ Erreur sur l'élément {i} : {e}")

        print(f"\n🏁 TERMINÉ ! Total en base : {Parking.objects.count()} parkings.")

    except Exception as e:
        print(f"💥 Erreur réseau : {e}")


if __name__ == "__main__":
    maj_enfin_reussie()
