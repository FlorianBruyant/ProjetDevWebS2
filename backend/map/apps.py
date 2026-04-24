import threading
import time

from django.apps import AppConfig


class MapConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "map"

    def ready(self):
        # On importe ici pour éviter les erreurs de chargement au démarrage
        from .management.commands.simuler_activite import Command

        def run_simulation():
            sim = Command()
            while True:
                # Temps d'attente entre chaque simu en secondes
                time.sleep(5)
                try:
                    sim.handle()
                    print(" Simulation auto : Historique mis à jour.")
                except Exception as e:
                    print(f"Erreur simulation : {e}")

        # On lance le thread seulement si on n'est pas en mode "reloader"
        # (pour éviter que ça tourne en double)
        import os

        if os.environ.get("RUN_MAIN") == "true":
            thread = threading.Thread(target=run_simulation, daemon=True)
            thread.start()
