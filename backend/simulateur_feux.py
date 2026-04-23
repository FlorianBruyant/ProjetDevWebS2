import os
import time

import django

# 1. Configuration de l'environnement Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from map.models import Feu


def lancer_simulation():
    print("🚦 Simulateur de feux intelligent lancé (Ctrl+C pour arrêter)...")

    while True:
        feux = Feu.objects.filter(est_actif=True, en_panne=False)

        for feu in feux:
            # On décrémente le temps restant
            if feu.temps_avant_changement > 0:
                feu.temps_avant_changement -= 1
            else:
                # Logique de cycle : VERT -> ORANGE -> ROUGE -> VERT
                if feu.etat_actuel == "VERT":
                    feu.etat_actuel = "ORANGE"
                    feu.temps_avant_changement = 5  # L'orange dure moins longtemps
                elif feu.etat_actuel == "ORANGE":
                    feu.etat_actuel = "ROUGE"
                    feu.temps_avant_changement = 30
                else:
                    feu.etat_actuel = "VERT"
                    feu.temps_avant_changement = 30

            feu.save()

        # On attend 1 seconde avant la prochaine mise à jour
        time.sleep(1)


if __name__ == "__main__":
    lancer_simulation()
