import requests
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.models import ActionLog
from users.permissions import IsAdminOrReadOnly

# Import des modèles et serializers
# 👇 AJOUT DE 'Scenario'
from .models import Feu, Parking, Point, Scenario, Vehicule, Zone
from .serializers import (
    FeuSerializer,
    ParkingSerializer,
    PointSerializer,
    ScenarioSerializer,  # 👇 AJOUT DE 'ScenarioSerializer'
    VehiculeSerializer,
    ZoneSerializer,
)

# --- VIEWSETS (CRUD AUTOMATIQUE) ---


class PointViewSet(viewsets.ModelViewSet):
    queryset = Point.objects.all()
    serializer_class = PointSerializer
    permission_classes = [IsAdminOrReadOnly]


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all().order_by("nom")
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["nom", "zone__nom"]


class ParkingViewSet(viewsets.ModelViewSet):
    queryset = Parking.objects.all()
    serializer_class = ParkingSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ["nom", "zone__nom"]


# 👇 NOUVEAU VIEWSET POUR LES SCÉNARIOS
class ScenarioViewSet(viewsets.ModelViewSet):
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer
    permission_classes = [IsAdminOrReadOnly]


# --- VUE GLOBALE POUR LA CARTE ---


@api_view(["GET"])
def get_global_data(request):
    try:
        query = request.query_params.get("search", "").strip()
        zone_id = request.query_params.get("zone", "").strip()

        # On pré-charge la zone pour éviter des centaines de requêtes SQL (optimisation)
        vehicules = Vehicule.objects.select_related("zone").all()
        feux = Feu.objects.select_related("zone").all()
        parkings = Parking.objects.select_related("zone").all()

        # filtrage par zones
        if zone_id and zone_id != "undefined":
            vehicules = vehicules.filter(zone_id=zone_id)
            feux = feux.filter(zone_id=zone_id)
            parkings = parkings.filter(zone_id=zone_id)
        # recherche textuelle
        if query:
            # On définit le filtre de base
            # icontains sur une relation (zone__nom) fonctionne même si zone est null
            filtre_base = Q(nom__icontains=query) | Q(zone__nom__icontains=query)

            vehicules = vehicules.filter(
                filtre_base | Q(immatriculation__icontains=query)
            ).distinct()
            feux = feux.filter(filtre_base).distinct()
            parkings = parkings.filter(filtre_base).distinct()

        # On sérialise
        v_data = VehiculeSerializer(vehicules, many=True).data
        f_data = FeuSerializer(feux, many=True).data
        p_data = ParkingSerializer(parkings, many=True).data

        # Fusion des listes
        return Response(list(v_data) + list(f_data) + list(p_data))

    except Exception as e:
        print(f"❌ ERREUR SERVEUR : {str(e)}")
        return Response(
            {"error": "Erreur interne du serveur", "details": str(e)}, status=500
        )


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
