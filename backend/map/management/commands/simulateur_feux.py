import os
import random
import time

import django

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()

from map.models import Feu


def demarrer_simulation_feux():
    print("🚦 Simulateur de feux lancé en arrière-plan...")
    while True:
        feux = Feu.objects.filter(en_panne=False, est_actif=True)

        for feu in feux:
            feu.temps_avant_changement -= 2
            if feu.temps_avant_changement <= 0:
                if feu.etat_actuel == "VERT":
                    feu.etat_actuel = "ORANGE"
                    feu.temps_avant_changement = 5
                elif feu.etat_actuel == "ORANGE":
                    feu.etat_actuel = "ROUGE"
                    feu.temps_avant_changement = random.randint(15, 30)
                else:
                    feu.etat_actuel = "VERT"
                    feu.temps_avant_changement = random.randint(20, 40)
                print(f"✨ {feu.nom} -> {feu.etat_actuel}")
            feu.save()

        time.sleep(2)


if __name__ == "__main__":
    try:
        demarrer_simulation_feux()
    except KeyboardInterrupt:
        print("\n🛑 Simulateur arrêté.")
