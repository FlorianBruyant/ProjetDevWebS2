"""Routes minimales de l'application api.

Ici, on expose surtout une route de test pour valider que le backend est
accessible avant d'attaquer les endpoints métier plus complets.
"""

from django.urls import path
from api import views

urlpatterns = [
    path('', views.test, name='api_root'),
    path('test/', views.test),
]