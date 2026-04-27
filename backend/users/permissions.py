from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Règle : Tout le monde peut LIRE (GET).
    Mais seul l'utilisateur avec le rôle 'ADMIN' peut MODIFIER (POST, PUT, DELETE).
    """

    def has_permission(self, request, view):
        # On autorise la lecture à tout le monde (Public)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Pour modifier, il faut être connecté ET avoir le rôle ADMIN
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsAdminOrComplexe(permissions.BasePermission):
    """
    Règle : Seuls les utilisateurs avec le rôle 'ADMIN' ou 'COMPLEXE'
    peuvent accéder à la vue (lecture et modification).
    """

    def has_permission(self, request, view):
        # 1. Vérifier si l'utilisateur est bien connecté
        if not request.user or not request.user.is_authenticated:
            return False

        # Un superutilisateur Django doit aussi avoir accès, même si son champ
        # métier role n'est pas forcément renseigné sur ADMIN.
        if request.user.is_superuser:
            return True

        # 2. Vérifier si son rôle est autorisé
        # On utilise une liste pour faciliter l'ajout de futurs rôles si besoin
        roles_autorises = ["ADMIN", "COMPLEXE"]

        return request.user.role in roles_autorises
