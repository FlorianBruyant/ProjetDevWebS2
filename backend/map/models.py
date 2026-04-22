from django.db import models


class Point(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        # Pour que ça s'affiche bien, ex: "Point (49.0, 2.0)"
        return f"Point ({self.latitude}, {self.longitude})"


class Parking(models.Model):
    # Voici notre fameuse corde magique qui relie le parking à un Point de la carte !
    position = models.ForeignKey(Point, on_delete=models.CASCADE)

    # Des cases pour les nombres
    places_occupees = models.IntegerField(default=0)
    places_totales = models.IntegerField()

    def __str__(self):
        return f"Parking ({self.places_occupees}/{self.places_totales} places)"


class Incident(models.Model):
    # Une case pour le texte (ex: "Accident", "Travaux")
    type_incident = models.CharField(max_length=100)

    # Des cases pour la date et l'heure
    debut = models.DateTimeField()
    fin = models.DateTimeField(
        null=True, blank=True
    )  # null=True veut dire qu'on a le droit de laisser cette case vide (si l'incident n'est pas encore fini !)

    # La corde magique vers le Point
    position = models.ForeignKey(Point, on_delete=models.CASCADE)

    def __str__(self):
        return f"Incident: {self.type_incident}"
