from django.apps import AppConfig


class MapConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "map"

    def ready(self):
        pass  # Import des signaux pour les scénarios de trafic
