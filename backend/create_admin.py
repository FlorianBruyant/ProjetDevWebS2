import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv("ADMIN_USERNAME", "admin")
password = os.getenv("ADMIN_PASSWORD")
email = os.getenv("ADMIN_EMAIL", "admin@exemple.com")

if password:  # On ne crée rien si le mot de passe n'est pas configuré
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"✅ Superuser '{username}' créé.")
    else:
        print("ℹ️ Le superuser existe déjà.")
else:
    print("❌ Erreur : ADMIN_PASSWORD n'est pas défini dans Render.")
