from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

#  on importe notre gestionnaire de permission
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
    # On imagine que le modèle Vehicule a un champ 'nom' ou 'immatriculation',
    # TODO A remplacer par les champs du modèle
    search_fields = ["nom", "immatriculation"]

    # --- SÉCURITÉ PAR RÔLE ---
    # Public en lecture, Admin uniquement pour l'ajout/modif
    permission_classes = [IsAdminOrReadOnly]
