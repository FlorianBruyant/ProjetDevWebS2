import requests
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.models import ActionLog
from users.permissions import IsAdminOrReadOnly

# Import des modèles et serializers
from .models import Feu, Parking, Vehicule, Zone
from .serializers import (
    FeuSerializer,
    ParkingSerializer,
    VehiculeSerializer,
    ZoneSerializer,
)

# --- VIEWSETS (CRUD AUTOMATIQUE) ---


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


# --- VUE GLOBALE POUR LA CARTE ---


@api_view(["GET"])
def get_global_data(request):
    """
    Rassemble tous les objets et injecte le 'type_api'.
    """
    try:
        vehicules = Vehicule.objects.all()
        feux = Feu.objects.all()
        parkings = Parking.objects.all()

        v_data = VehiculeSerializer(vehicules, many=True).data
        f_data = FeuSerializer(feux, many=True).data
        p_data = ParkingSerializer(parkings, many=True).data

        # On transforme en listes simples pour être sûr de pouvoir modifier
        v_list = list(v_data)
        f_list = list(f_data)
        p_list = list(p_data)

        for item in v_list:
            item["type_api"] = "vehicules"
        for item in f_list:
            item["type_api"] = "feux"
        for item in p_list:
            item["type_api"] = "parkings"

        print(
            f"✅ Data Global : {len(v_list)} véhicules, {len(f_list)} feux, {len(p_list)} parkings"
        )

        return Response(v_list + f_list + p_list)
    except Exception as e:
        print(f"❌ ERREUR DANS GET_GLOBAL_DATA : {str(e)}")
        return Response({"error": str(e)}, status=500)


# --- VUES COMPLÉMENTAIRES ---


@api_view(["GET"])
def get_horaires_gare(request):
    gare_id = request.query_params.get("gare", "STIF:StopPoint:Q:474151:")
    url = f"https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef={gare_id}"
    headers = {
        "apikey": "vUB1gblQmNUwSJrp1q9moR22Cc9eIu0d",
        "Accept": "application/json",
    }
    try:
        reponse = requests.get(url, headers=headers, timeout=10)
        return Response(reponse.json())
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def consulter_objet(request, objet_id):
    user = request.user
    user.points += 0.50
    user.verifier_et_mettre_a_jour_niveau()
    user.save()
    ActionLog.objects.create(
        utilisateur=user,
        action=f"Consultation de l'équipement (ID: {objet_id})",
        points_gagnes=0.50,
    )
    return Response({"message": "Points ajoutés !"})
