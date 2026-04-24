import requests
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from users.models import ActionLog  # Important pour l'historique des points
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

    v_data = VehiculeSerializer(vehicules, many=True).data
    f_data = FeuSerializer(feux, many=True).data
    p_data = ParkingSerializer(parkings, many=True).data

    tout_le_monde = v_data + f_data + p_data
    print(f"📦 Envoi de {len(tout_le_monde)} objets à la carte")
    return Response(tout_le_monde)


# --- VUE POUR LES HORAIRES PRIM ---


@api_view(["GET"])
def get_horaires_gare(request):
    gare_id = request.query_params.get("gare", "STIF:StopPoint:Q:474151:")
    url = f"https://prim.iledefrance-mobilites.fr/marketplace/stop-monitoring?MonitoringRef={gare_id}"
    headers = {
        "apikey": "vUB1gblQmNUwSJrp1q9moR22Cc9eIu0d",
        "Accept": "application/json",
    }
    try:
        reponse = requests.get(url, headers=headers)
        return Response(reponse.json())
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# --- NOUVEAUTÉS : MOTEUR DE RECHERCHE ET CONSULTATION (MODULES 1 & 2) ---


@api_view(["GET"])
@permission_classes([AllowAny])
def rechercher_objets(request):
    """Recherche avec 2 filtres : Mot-clé (q) et État (actif) [cite: 51, 80, 81]"""
    mot_cle = request.GET.get("q", "")
    est_actif = request.GET.get("actif", "")

    resultats = Feu.objects.all()

    if mot_cle:
        resultats = resultats.filter(
            Q(nom__icontains=mot_cle) | Q(description__icontains=mot_cle)
        )

    if est_actif.lower() == "true":
        resultats = resultats.filter(est_actif=True)
    elif est_actif.lower() == "false":
        resultats = resultats.filter(est_actif=False)

    data = FeuSerializer(resultats, many=True).data
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def consulter_objet(request, objet_id):
    """Fait gagner 0.50 pts à l'utilisateur quand il consulte un objet [cite: 109, 110, 115]"""
    user = request.user
    user.points += 0.50
    user.verifier_et_mettre_a_jour_niveau()
    user.save()

    ActionLog.objects.create(
        utilisateur=user,
        action=f"Consultation de l'objet ID: {objet_id}",
        points_gagnes=0.50,
    )

    return Response(
        {
            "message": "Objet consulté. +0.50 points !",
            "points_actuels": user.points,
            "niveau_actuel": user.get_niveau_display(),
        }
    )
