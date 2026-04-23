import requests

# L'URL officielle pour la requête globale des prochains passages (Format SIRI)
URL_GLOBALE = "https://prim.iledefrance-mobilites.fr/marketplace/estimated-timetable"

# Ton fameux jeton d'accès PRIM
HEADERS = {
    "apikey": "vUB1gblQmNUwSJrp1q9moR22Cc9eIu0d ",
    # Très important : On force le serveur à nous répondre en JSON (plus lisible que le XML)
    "Accept": "application/json",
}


def lire_panneau_affichage():
    print(
        "📥 Téléchargement des horaires de TOUTE l'Île-de-France (patiente un peu)..."
    )
    try:
        reponse = requests.get(URL_GLOBALE, headers=HEADERS)

        if reponse.status_code == 401:
            print("❌ Jeton API invalide ou expiré.")
            return

        donnees = reponse.json()

        # Le format SIRI est un peu complexe, il faut fouiller dans plusieurs "boîtes" (dictionnaires)
        livraisons = (
            donnees.get("Siri", {})
            .get("ServiceDelivery", {})
            .get("EstimatedTimetableDelivery", [])
        )

        print("\n🚉 --- PROCHAINS DÉPARTS ---")
        compteur = 0

        for livraison in livraisons:
            trajets = livraison.get("EstimatedJourneyVersionFrame", [])
            for trajet in trajets:
                vehicules = trajet.get("EstimatedVehicleJourney", [])
                for vehicule in vehicules:
                    # On récupère l'ID de la ligne
                    ligne = vehicule.get("LineRef", {}).get("value", "Ligne Inconnue")

                    # On regarde tous les prochains arrêts prévus pour ce bus/train
                    arrets = vehicule.get("EstimatedCalls", {}).get("EstimatedCall", [])
                    for arret in arrets:
                        # Nom de l'arrêt et heure prévue
                        noms_arret = arret.get("StopPointName", [])
                        nom = (
                            noms_arret[0].get("value", "Inconnu")
                            if noms_arret
                            else "Inconnu"
                        )

                        heure_depart = arret.get(
                            "ExpectedDepartureTime", "Heure inconnue"
                        )

                        print(
                            f"🚏 Arrêt : {nom} | 🚌 Ligne : {ligne[-5:]} | ⏱️ Heure : {heure_depart[11:16]}"
                        )
                        compteur += 1

                        # 🚨 SÉCURITÉ : On s'arrête après 10 résultats pour ne pas faire exploser le PC !
                        if compteur >= 10:
                            print(
                                "...\n✅ (Des dizaines de milliers d'autres résultats ont été masqués)"
                            )
                            return

    except Exception as e:
        print(f"❌ Erreur lors de la lecture : {e}")


if __name__ == "__main__":
    lire_panneau_affichage()
