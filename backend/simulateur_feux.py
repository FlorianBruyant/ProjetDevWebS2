import os
import random
import time

import django

# --- CONFIGURATION DJANGO ---
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from map.models import Feu


def simuler_ville():
    print("🚦 Simulateur de Smart City démarré...")

    while True:
        # On ne récupère que les feux qui ne sont pas en maintenance
        feux = Feu.objects.filter(en_panne=False, est_actif=True)

        if not feux.exists():
            print("💤 Aucun feu actif à simuler (tous en maintenance ou désactivés).")

        for feu in feux:
            # 1. On diminue le temps restant
            feu.temps_avant_changement -= 2

            # 2. Si le temps est écoulé, on change de couleur
            if feu.temps_avant_changement <= 0:
                if feu.etat_actuel == "VERT":
                    feu.etat_actuel = "ORANGE"
                    feu.temps_avant_changement = 5  # L'orange dure moins longtemps
                elif feu.etat_actuel == "ORANGE":
                    feu.etat_actuel = "ROUGE"
                    feu.temps_avant_changement = random.randint(15, 30)
                else:  # Était ROUGE
                    feu.etat_actuel = "VERT"
                    feu.temps_avant_changement = random.randint(20, 40)

                print(f"✨ {feu.nom} est passé au {feu.etat_actuel}")

            # Sauvegarde en BDD
            feu.save()

        time.sleep(2)  # Mise à jour toutes les 2 secondes


if __name__ == "__main__":
    try:
        simuler_ville()
    except KeyboardInterrupt:
        print("\n🛑 Simulateur arrêté.")
