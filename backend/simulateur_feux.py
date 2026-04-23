import os
import random
import time

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from map.models import Feu


def lancer_simulation_robuste():
    print("🚦 Simulateur lancé...")
    print("💡 Astuce : Change la proba_panne à 1.0 en bas pour tout casser d'un coup.")

    while True:
        feux = Feu.objects.all()

        for feu in feux:
            # --- 1. LOGIQUE DE PANNE ---
            # Proba de 5% par seconde pour tester (c'est énorme, juste pour ton test)
            proba_panne = 0.9

            if not feu.en_panne and random.random() < proba_panne:
                feu.en_panne = True
                feu.est_actif = False
                feu.etat_actuel = (
                    "ROUGE"  # On peut imaginer qu'il se bloque au rouge par sécu
                )
                print(f"🚨 PANNE SUR : {feu.nom}")

            # --- 2. LOGIQUE DE CYCLE (Seulement si PAS en panne) ---
            if not feu.en_panne and feu.est_actif:
                if feu.temps_avant_changement > 0:
                    feu.temps_avant_changement -= 1
                else:
                    # Changement de couleur classique
                    if feu.etat_actuel == "VERT":
                        feu.etat_actuel = "ORANGE"
                        feu.temps_avant_changement = 5
                    elif feu.etat_actuel == "ORANGE":
                        feu.etat_actuel = "ROUGE"
                        feu.temps_avant_changement = 30
                    else:
                        feu.etat_actuel = "VERT"
                        feu.temps_avant_changement = 30

            # --- 3. ÉTAT ÉTEINT ---
            # Si le feu est en panne, on force le chrono à 0 pour l'affichage
            if feu.en_panne:
                feu.temps_avant_changement = 0

            feu.save()

        time.sleep(1)


if __name__ == "__main__":
    lancer_simulation_robuste()
