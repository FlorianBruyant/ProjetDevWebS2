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
