from django.db import models


class Point(models.Model):
    # Un point c'est juste deux chiffres à virgule (FloatField)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        # Pour que ça s'affiche bien, ex: "Point (49.0, 2.0)"
        return f"Point ({self.latitude}, {self.longitude})"
