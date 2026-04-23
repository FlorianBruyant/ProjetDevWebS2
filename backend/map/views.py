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
    # 1. On va chercher TOUT le monde dans la base de données
    vehicules = Vehicule.objects.all()
    feux = Feu.objects.all()
    parkings = Parking.objects.all()

    # 2. On les transforme en texte JSON
    v_data = VehiculeSerializer(vehicules, many=True).data
    f_data = FeuSerializer(feux, many=True).data
    p_data = ParkingSerializer(parkings, many=True).data

    # 3. 🚨 LE MOMENT CRUCIAL : On fusionne les 3 listes
    # Si tu as juste écrit "return Response(v_data)", tu n'auras QUE les vélos.
    tout_le_monde = v_data + f_data + p_data

    print(
        f"📦 Envoi de {len(tout_le_monde)} objets à la carte"
    )  # Regarde ton terminal !

    return Response(tout_le_monde)


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
