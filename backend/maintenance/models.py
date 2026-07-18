"""
App: maintenance
=================
"""

from django.db import models

from vehicules.models import BaseModel


class Maintenance(BaseModel):
    class TypeMaintenance(models.TextChoices):
        PREVENTIVE = "preventive", "Préventive (planifiée)"
        CURATIVE = "curative", "Curative (panne)"

    class StatutMaintenance(models.TextChoices):
        PLANIFIEE = "planifiee", "Planifiée"
        EN_COURS = "en_cours", "En cours"
        TERMINEE = "terminee", "Terminée"
        ANNULEE = "annulee", "Annulée"

    vehicule = models.ForeignKey(
        "vehicules.Vehicule", on_delete=models.CASCADE, related_name="maintenances"
    )
    type_maintenance = models.CharField(max_length=20, choices=TypeMaintenance.choices)
    statut = models.CharField(
        max_length=20, choices=StatutMaintenance.choices,
        default=StatutMaintenance.PLANIFIEE,
    )
    description = models.TextField()
    date_intervention = models.DateField()
    kilometrage_intervention = models.PositiveIntegerField()
    cout = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    prestataire = models.CharField(max_length=150, blank=True)

    # Planification du prochain entretien
    prochaine_echeance_date = models.DateField(null=True, blank=True)
    prochaine_echeance_km = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-date_intervention"]
        indexes = [models.Index(fields=["vehicule", "date_intervention"])]

    def __str__(self):
        return f"{self.vehicule} — {self.get_type_maintenance_display()} du {self.date_intervention}"