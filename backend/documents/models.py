"""
App: documents
===============
"""

from django.db import models
from django.utils import timezone

from vehicules.models import BaseModel


class Document(BaseModel):
    class TypeDocument(models.TextChoices):
        ASSURANCE = "assurance", "Assurance"
        VISITE_TECHNIQUE = "visite_technique", "Visite technique"
        CARTE_GRISE = "carte_grise", "Carte grise"
        VIGNETTE = "vignette", "Vignette"
        AUTRE = "autre", "Autre"

    vehicule = models.ForeignKey(
        "vehicules.Vehicule", on_delete=models.CASCADE, related_name="documents"
    )
    type_document = models.CharField(max_length=30, choices=TypeDocument.choices)
    numero_document = models.CharField(max_length=100, blank=True)
    date_emission = models.DateField()
    date_expiration = models.DateField(null=True, blank=True)
    fichier = models.FileField(upload_to="vehicules/documents/", null=True, blank=True)

    class Meta:
        ordering = ["date_expiration"]
        indexes = [models.Index(fields=["date_expiration"])]

    def __str__(self):
        return f"{self.get_type_document_display()} — {self.vehicule}"

    @property
    def est_valide(self):
        if not self.date_expiration:
            return True
        return self.date_expiration >= timezone.now().date()

    @property
    def jours_avant_expiration(self):
        if not self.date_expiration:
            return None
        return (self.date_expiration - timezone.now().date()).days