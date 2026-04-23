import os
import random

import django
import requests

# 1. Configuration de l'environnement Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# 2. Import des modèles (APRES django.setup())
from map.models import Feu, Point

# URL du dataset Signalisation Tricolore (100 premiers feux)
URL_API = "https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/signalisation-tricolore/records?limit=100"


def importer_feux():
    print("🧹 Nettoyage de la table des feux...")
    Feu.objects.all().delete()

    print("📡 Connexion à l'API Paris Open Data...")

    try:
        response = requests.get(URL_API, timeout=15)
        data = response.json()
        records = data.get("results", [])

        if not records:
            print("❌ Aucun résultat reçu.")
            return

        for rec in records:
            try:
                # Extraction des coordonnées
                coords = rec.get("geo_point_2d")
                if not coords:
                    continue

                # Création du point GPS
                p = Point.objects.create(
                    latitude=coords["lat"], longitude=coords["lon"]
                )

                # Création du feu selon ton modèle
                nom_voie = rec.get("lib_voiedo", "Voie inconnue")
                Feu.objects.create(
                    nom=f"Feu - {nom_voie}",
                    position=p,
                    etat_actuel=random.choice(["VERT", "ORANGE", "ROUGE"]),
                    temps_avant_changement=random.randint(
                        10, 30
                    ),  # Temps aléatoire au départ
                    est_actif=True,
                    en_panne=False,
                )
                print(f"✅ Importé : {nom_voie}")

            except Exception as e:
                print(f"⚠️ Erreur sur un élément : {e}")

        print(f"\n🏁 Terminé ! {Feu.objects.count()} feux créés.")

    except Exception as e:
        print(f"❌ Erreur réseau : {e}")


if __name__ == "__main__":
    importer_feux()
