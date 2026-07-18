"""
App: conducteurs
=================
"""

from django.conf import settings
from django.db import models
from django.utils import timezone

from vehicules.models import BaseModel


class Conducteur(BaseModel):
    class CategoriePermis(models.TextChoices):
        A = "A", "A — Moto"
        B = "B", "B — Véhicule léger"
        C = "C", "C — Poids lourd"
        D = "D", "D — Transport en commun"
        EB = "EB", "EB — Remorque"

    class StatutConducteur(models.TextChoices):
        DISPONIBLE = "disponible", "Disponible"
        EN_MISSION = "en_mission", "En mission"
        EN_CONGE = "en_conge", "En congé"
        SUSPENDU = "suspendu", "Suspendu"

    # Lien optionnel vers un compte utilisateur (si le conducteur se connecte
    # à une appli mobile / PWA pour saisir ses pleins et incidents)
    utilisateur = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="conducteur",
    )

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20)
    numero_permis = models.CharField(max_length=50, unique=True)
    categorie_permis = models.CharField(max_length=5, choices=CategoriePermis.choices)
    date_expiration_permis = models.DateField()

    date_embauche = models.DateField()
    statut = models.CharField(
        max_length=20, choices=StatutConducteur.choices,
        default=StatutConducteur.DISPONIBLE, db_index=True,
    )
    photo = models.ImageField(upload_to="conducteurs/photos/", null=True, blank=True)

    class Meta:
        ordering = ["nom", "prenom"]

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.numero_permis})"

    @property
    def permis_valide(self):
        return self.date_expiration_permis >= timezone.now().date()