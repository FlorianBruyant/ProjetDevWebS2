from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views  # 👈 TRÈS IMPORTANT : Importe tes vues ici

router = DefaultRouter()
router.register(r"vehicules", views.VehiculeViewSet)
router.register(r"zones", views.ZoneViewSet)

urlpatterns = [
    # Tes routes automatiques du router
    path("", include(router.urls)),
    # 🚨 LA LIGNE MANQUANTE EST ICI :
    # Attention : ne mets pas de "/" au début, mais mets-en un à la fin
    path("horaires/", views.get_horaires_gare, name="horaires-gare"),
]
