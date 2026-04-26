"""Vues API minimales utilisées pour vérifier rapidement que le backend répond.

Ce module sert surtout de point de test technique. Il ne porte pas de logique
métier lourde, mais il reste utile pour comprendre que Django est bien démarré.
"""

import datetime

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def test(request):
    """Retourne un petit message de santé du serveur.

    Entrée : une requête HTTP GET.
    Traitement : construit une réponse JSON très simple.
    Sortie : un objet Response avec un statut et l'heure courante.
    """
    return Response({
        "status": "ok",
        "message": "Django fonctionne !",
        "heure": datetime.datetime.now().strftime("%H:%M:%S"),
    })