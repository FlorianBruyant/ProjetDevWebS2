import os
import time

import django
import requests

# 1. Connexion au cerveau de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from map.models import Point, Vehicule

URL_API = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=50"


def maj_carte_en_temps_reel():
    print("🌍 Récupération des positions GPS en cours...")
    try:
        reponse = requests.get(URL_API)
        donnees = reponse.json()

        resultats = donnees.get("results", [])

        for item in resultats:
            # On récupère les infos
            nom_station = item["name"]
            velos_dispo = item["numbikesavailable"]
            lat = item["coordonnees_geo"]["lat"]
            lon = item["coordonnees_geo"]["lon"]

            # On crée ou on met à jour notre "Véhicule"
            # (On triche un peu : on utilise le champ "vitesse" pour stocker le nombre de vélos dispos !)
            vehicule, a_ete_cree = Vehicule.objects.get_or_create(
                immatriculation=nom_station[:20],
                defaults={
                    "nom": f"Station {nom_station}",
                    "vitesse": velos_dispo,
                    "est_actif": True,
                },
            )

            # On gère le point GPS sur la carte
            if not vehicule.point_actuel:
                nouveau_point = Point.objects.create(latitude=lat, longitude=lon)
                vehicule.point_actuel = nouveau_point
            else:
                vehicule.point_actuel.latitude = lat
                vehicule.point_actuel.longitude = lon
                vehicule.point_actuel.save()

            vehicule.save()
            print(f"📍 Placé sur la carte : {vehicule.nom} (Vélos: {velos_dispo})")

    except Exception as e:
        print(f"❌ Erreur : {e}")


if __name__ == "__main__":
    # Avant de commencer, on vide l'entrepôt pour avoir une carte propre
    print("🧹 Nettoyage des anciennes données...")
    Vehicule.objects.all().delete()
    Point.objects.all().delete()

    print("🚀 Décollage du récupérateur (Ctrl+C pour arrêter)")
    while True:
        maj_carte_en_temps_reel()
        print("⏳ Pause de 10 secondes pour voir la mise à jour sur React...")
        time.sleep(10)
