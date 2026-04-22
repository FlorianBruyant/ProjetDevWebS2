from django.contrib import admin

from .models import Feu, Incident, Parking, Point, Route, Vehicule, Zone

# On enregistre tous nos modèles pour qu'ils soient visibles dans l'admin
admin.site.register(Point)
admin.site.register(Zone)
admin.site.register(Feu)
admin.site.register(Parking)
admin.site.register(Vehicule)
admin.site.register(Route)
admin.site.register(Incident)
