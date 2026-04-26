#!/usr/bin/env python
"""Point d'entrée de la ligne de commande Django.

Ce script permet de lancer les commandes d'administration comme `runserver`,
`migrate`, `createsuperuser` ou les commandes personnalisées de l'application.
"""
import os
import sys


def main():
    """Prépare l'environnement Django puis délègue à la commande demandée."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    # Quand le fichier est exécuté directement, on passe la main à Django.
    main()
