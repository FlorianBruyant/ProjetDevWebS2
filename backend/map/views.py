import requests
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

# on importe notre gestionnaire de permission
from users.permissions import IsAdminOrReadOnly

from .models import Vehicule, Zone
from .serializers import VehiculeSerializer, ZoneSerializer


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    # On protège aussi les zones
    permission_classes = [IsAdminOrReadOnly]


class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["est_actif", "en_panne", "point_actuel__zone"]

    # Recherche textuelle (pour barre de recherche)
    search_fields = ["nom", "immatriculation"]

    # --- SÉCURITÉ PAR RÔLE ---
    # Public en lecture, Admin uniquement pour l'ajout/modif
    permission_classes = [IsAdminOrReadOnly]


# =====================================================================
# NOUVELLE PASSERELLE POUR LES HORAIRES EN TEMPS RÉEL (API PRIM)
# =====================================================================
@api_view(["GET"])
def get_horaires_gare(request):
    # On récupère l'ID de la gare depuis l'URL (Cergy Préfecture par défaut)
    # Plus tard, ton Frontend pourra envoyer d'autres ID pour voir d'autres gares !
    # ID de Châtelet-Les Halles (RER)
    gare_id = request.query_params.get("gare", "STIF:StopPoint:Q:474151:")

    url = f"https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef={gare_id}"

    headers = {
        # 🚨 N'OUBLIE PAS DE METTRE TA VRAIE CLÉ API ICI :
        "apikey": "vUB1gblQmNUwSJrp1q9moR22Cc9eIu0d ",
        "Accept": "application/json",
    }

    try:
        # Ton backend Django fait la requête à PRIM (comme un bouclier)
        reponse = requests.get(url, headers=headers)

        # S'il y a une erreur d'autorisation (ex: mauvaise clé)
        if reponse.status_code == 401:
            return Response({"error": "Clé API PRIM invalide ou expirée."}, status=401)

        # On renvoie directement les données JSON à ton frontend React
        return Response(reponse.json())

    except Exception as e:
        return Response({"error": str(e)}, status=500)
