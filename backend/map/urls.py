from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"zones", views.ZoneViewSet)
router.register(r"vehicules", views.VehiculeViewSet)  # 👈 L'erreur venait d'ici
router.register(r"feux", views.FeuViewSet)
router.register(r"parkings", views.ParkingViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("horaires/", views.get_horaires_gare),
    path("global/", views.get_global_data),  # 👈 Route pour charger tout d'un coup
]
