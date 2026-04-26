from django.apps import AppConfig


class UsersConfig(AppConfig):
    """Configuration de l'application users.

    Django utilise cette classe pour charger l'application et ses signaux au
    démarrage du projet.
    """

    name = 'users'
