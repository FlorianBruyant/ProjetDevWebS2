import requests
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from users.permissions import IsAdminOrReadOnly

# Import des modèles et serializers
from .models import Feu, Parking, Vehicule, Zone
from .serializers import (
    FeuSerializer,
    ParkingSerializer,
    VehiculeSerializer,
    ZoneSerializer,
)

# --- VIEWSETS CLASSIQUES (Pour le routeur) ---


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    permission_classes = [IsAdminOrReadOnly]


class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["est_actif", "en_panne"]
    search_fields = ["nom", "immatriculation"]
    permission_classes = [IsAdminOrReadOnly]


class FeuViewSet(viewsets.ModelViewSet):
    queryset = Feu.objects.all()
    serializer_class = FeuSerializer
    permission_classes = [IsAdminOrReadOnly]


class ParkingViewSet(viewsets.ModelViewSet):
    queryset = Parking.objects.all()
    serializer_class = ParkingSerializer
    permission_classes = [IsAdminOrReadOnly]


# --- VUE GLOBALE POUR LA CARTE (Tout en un) ---


@api_view(["GET"])
def get_global_data(request):
    vehicules = Vehicule.objects.all()
    feux = Feu.objects.all()
    parkings = Parking.objects.all()

    # On sérialise chaque groupe
    v_json = VehiculeSerializer(vehicules, many=True).data
    f_json = FeuSerializer(feux, many=True).data
    p_json = ParkingSerializer(parkings, many=True).data

    # IMPORTANT : On fusionne les trois listes en une seule !
    return Response(v_json + f_json + p_json)


# --- VUE POUR LES HORAIRES PRIM ---


@api_view(["GET"])
def get_horaires_gare(request):
    gare_id = request.query_params.get("gare", "STIF:StopPoint:Q:474151:")
    url = f"https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef={gare_id}"
    headers = {
        "apikey": "vUB1gblQmNUwSJrp1q9moR22Cc9eIu0d",  # Ta clé
        "Accept": "application/json",
    }
    try:
        reponse = requests.get(url, headers=headers)
        return Response(reponse.json())
    except Exception as e:
        return Response({"error": str(e)}, status=500)
