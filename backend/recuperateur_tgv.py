import os
import time

import django
import requests

# 1. Connexion à ton projet
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from map.models import Point, Vehicule

# 2. L'API magique de la SNCF (100% gratuite et sans compte)
URL_SNCF = "https://ressources.data.sncf.com/api/explore/v2.1/catalog/datasets/geolocalisation-des-trains-en-mouvement/records?limit=100"


def maj_tgv_france():
    print("🛰️ Scan satellite de la SNCF en cours...")
    try:
        reponse = requests.get(URL_SNCF)
        donnees = reponse.json()

        resultats = donnees.get("results", [])
        compteur = 0

        for item in resultats:
            numero_train = str(item.get("numero", "Inconnu"))
            etat = item.get("etat", "En mouvement")

            # Extraction des coordonnées GPS (format officiel SNCF)
            lat, lon = None, None
            if "geo_point_2d" in item and item["geo_point_2d"]:
                lat = item["geo_point_2d"].get("lat")
                lon = item["geo_point_2d"].get("lon")

            if lat and lon:
                train, a_ete_cree = Vehicule.objects.get_or_create(
                    immatriculation=numero_train[:20],
                    defaults={
                        "nom": f"TGV/TER {numero_train}",
                        "est_actif": True,
                        "etat_actuel": etat,
                    },
                )

                # Mise à jour du point GPS sur la carte
                if not train.point_actuel:
                    train.point_actuel = Point.objects.create(
                        latitude=lat, longitude=lon
                    )
                else:
                    # C'est ici que le train "bouge" dans ta base de données !
                    train.point_actuel.latitude = lat
                    train.point_actuel.longitude = lon
                    train.point_actuel.save()

                train.save()
                compteur += 1

        print(f"✅ {compteur} trains flashés et mis à jour sur la carte !")

    except Exception as e:
        print(f"❌ Erreur radar : {e}")


if __name__ == "__main__":
    # On fait le ménage avant de commencer
    print("🧹 On vide la carte de ses anciennes données...")
    Vehicule.objects.all().delete()
    Point.objects.all().delete()

    print("🚀 Lancement du radar TGV National ! (Ctrl+C pour arrêter)")
    while True:
        maj_tgv_france()
        # On attend 15 secondes (Le temps que le train avance d'un kilomètre dans la vraie vie)
        print("⏳ Le satellite recharge... (10s)")
        time.sleep(10)
