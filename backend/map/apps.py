import threading
import time

from django.apps import AppConfig


class MapConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "map"

    def ready(self):
        # On importe ici pour éviter les erreurs de chargement au démarrage
        from .management.commands.simuler_activite import Command

        def run_simulation_conso():
            sim = Command()
            while True:
                # Temps d'attente entre chaque simu en secondes
                time.sleep(30)
                try:
                    sim.handle()
                    print(" Simulation auto : Historique mis à jour.")
                except Exception as e:
                    print(f"Erreur simulation : {e}")

        # On lance le thread seulement si on n'est pas en mode "reloader"
        # (pour éviter que ça tourne en double)
        import os

        if os.environ.get("RUN_MAIN") == "true":
            from .management.commands.simulateur_feux import demarrer_simulation_feux

            # 1. On crée et on lance le thread pour les FEUX
            thread_feux = threading.Thread(target=demarrer_simulation_feux, daemon=True)
            thread_feux.start()

            # 2. On crée et on lance le thread pour la CONSOMMATION
            thread_conso = threading.Thread(target=run_simulation_conso, daemon=True)
            thread_conso.start()
