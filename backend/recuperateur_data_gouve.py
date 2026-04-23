import os
import time

import django
import requests

# 1. On donne la "clé" pour lire le coffre-fort GTFS-RT
from google.transit import gtfs_realtime_pb2

# 2. On branche le script à Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from map.models import Vehicule

URL_SNCF = "https://proxy.transport.data.gouv.fr/resource/sncf-gtfs-rt-trip-updates"


def recuperer_donnees_sncf():
    print("🚂 Connexion aux serveurs de la SNCF...")
    try:
        # On télécharge le fichier compressé
        reponse = requests.get(URL_SNCF)

        # On prépare notre décodeur
        feed = gtfs_realtime_pb2.FeedMessage()

        # On insère le fichier brut dans le décodeur
        feed.ParseFromString(reponse.content)

        # On fouille dans la liste des trains mis à jour
        # (On va juste prendre les 10 premiers pour tester)
        compteur = 0
        for entite in feed.entity:
            if entite.HasField("trip_update") and compteur < 10:
                mise_a_jour = entite.trip_update
                id_train = mise_a_jour.trip.trip_id

                # On regarde s'il y a des infos sur le prochain arrêt
                if len(mise_a_jour.stop_time_update) > 0:
                    prochain_arret = mise_a_jour.stop_time_update[0]

                    # On calcule le retard (delay) en secondes s'il y en a un
                    retard = 0
                    if prochain_arret.HasField(
                        "arrival"
                    ) and prochain_arret.arrival.HasField("delay"):
                        retard = prochain_arret.arrival.delay

                    # --- LOGIQUE POUR TON APPLICATION ---
                    # On cherche si on a ce train dans la base (ou on le crée)
                    train, a_ete_cree = Vehicule.objects.get_or_create(
                        immatriculation=id_train[:20],
                        defaults={
                            "nom": f"Train SNCF {id_train[:8]}",
                            "est_actif": True,
                        },
                    )

                    # S'il a plus de 5 minutes de retard (300 secondes), on le met "en panne"
                    # C'est une astuce pour utiliser tes filtres existants !
                    if retard > 300:
                        train.en_panne = True
                        print(
                            f"⚠️ Alerte ! {train.nom} a {retard / 60:.0f} minutes de retard !"
                        )
                    else:
                        train.en_panne = False
                        print(f"✅ {train.nom} est à l'heure.")

                    train.save()
                    compteur += 1

    except Exception as e:
        print(f"❌ Oups, problème de lecture : {e}")


# 3. La boucle du livreur
if __name__ == "__main__":
    print("🚀 Radar SNCF activé (Ctrl+C pour arrêter)...")
    while True:
        recuperer_donnees_sncf()
        print("⏳ Attente de 60 secondes avant la prochaine vérification...")
        time.sleep(
            60
        )  # On demande toutes les minutes (la SNCF n'aime pas être spammée)
