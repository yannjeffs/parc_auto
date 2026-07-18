"""
App: carburant
===============
"""

from django.db import models
from django.utils import timezone

from vehicules.models import BaseModel


class PleinCarburant(BaseModel):
    vehicule = models.ForeignKey(
        "vehicules.Vehicule", on_delete=models.CASCADE, related_name="pleins_carburant"
    )
    conducteur = models.ForeignKey(
        "conducteurs.Conducteur", on_delete=models.SET_NULL,
        null=True, related_name="pleins_carburant",
    )
    date_plein = models.DateTimeField(default=timezone.now)
    litres = models.DecimalField(max_digits=6, decimal_places=2)
    cout_total = models.DecimalField(max_digits=10, decimal_places=2)
    kilometrage_au_plein = models.PositiveIntegerField()
    station = models.CharField(max_length=150, blank=True)

    class Meta:
        ordering = ["-date_plein"]
        indexes = [models.Index(fields=["vehicule", "date_plein"])]

    def __str__(self):
        return f"{self.vehicule} — {self.litres} L le {self.date_plein:%Y-%m-%d}"

    @property
    def prix_par_litre(self):
        return self.cout_total / self.litres if self.litres else 0