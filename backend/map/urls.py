from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"zones", views.ZoneViewSet)
router.register(r"vehicules", views.VehiculeViewSet)
router.register(r"feux", views.FeuViewSet)
router.register(r"parkings", views.ParkingViewSet)
# 👇 LA NOUVELLE LIGNE QUI DÉBLOQUE TOUT
router.register(r"points", views.PointViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("horaires/", views.get_horaires_gare),
    path("global/", views.get_global_data),
    path("consulter/<int:objet_id>/", views.consulter_objet),
]
