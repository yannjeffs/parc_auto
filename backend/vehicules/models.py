"""
App: vehicules
===============
Contient BaseModel (abstrait, partagé par toutes les apps), Vehicule et Affectation.

Les autres apps importeront BaseModel via :
    from vehicules.models import BaseModel
"""

import uuid

from django.db import models
from django.db.models import Q, UniqueConstraint
from django.utils import timezone


# ---------------------------------------------------------------------------
# Abstraction commune : UUID en clé primaire + timestamps + soft delete
# ---------------------------------------------------------------------------

class BaseModel(models.Model):
    """
    Modèle abstrait de base, partagé par toutes les apps du projet.

    - UUID plutôt qu'un entier auto-incrémenté : évite les collisions et
      les fuites d'information (nombre de véhicules) si l'API expose les ids.
    - Soft delete via `is_active` : on ne supprime jamais physiquement un
      véhicule ou un conducteur qui a un historique de maintenance/carburant.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        abstract = True


# ---------------------------------------------------------------------------
# VÉHICULES
# ---------------------------------------------------------------------------

class Vehicule(BaseModel):
    class TypeVehicule(models.TextChoices):
        BERLINE = "berline", "Berline"
        SUV = "suv", "SUV"
        UTILITAIRE = "utilitaire", "Utilitaire"
        CAMION = "camion", "Camion"
        MOTO = "moto", "Moto"
        BUS = "bus", "Bus / Minibus"

    class TypeCarburant(models.TextChoices):
        ESSENCE = "essence", "Essence"
        DIESEL = "diesel", "Diesel"
        HYBRIDE = "hybride", "Hybride"
        ELECTRIQUE = "electrique", "Électrique"

    class StatutVehicule(models.TextChoices):
        EN_SERVICE = "en_service", "En service"
        EN_MAINTENANCE = "en_maintenance", "En maintenance"
        EN_PANNE = "en_panne", "En panne"
        HORS_SERVICE = "hors_service", "Hors service"
        VENDU = "vendu", "Vendu / réformé"

    # Identification
    immatriculation = models.CharField(max_length=20, unique=True, db_index=True)
    numero_chassis = models.CharField(max_length=50, unique=True)
    marque = models.CharField(max_length=50)
    modele = models.CharField(max_length=50)
    annee = models.PositiveIntegerField()
    type_vehicule = models.CharField(max_length=20, choices=TypeVehicule.choices)

    # Caractéristiques techniques
    type_carburant = models.CharField(max_length=20, choices=TypeCarburant.choices)
    cylindree_cm3 = models.PositiveIntegerField(null=True, blank=True)
    nombre_places = models.PositiveSmallIntegerField(default=5)
    # JSONB PostgreSQL : specs variables selon le type de véhicule
    caracteristiques = models.JSONField(default=dict, blank=True)

    # Exploitation
    statut = models.CharField(
        max_length=20, choices=StatutVehicule.choices,
        default=StatutVehicule.EN_SERVICE, db_index=True,
    )
    kilometrage_actuel = models.PositiveIntegerField(default=0)
    site_affectation = models.CharField(max_length=100, blank=True)

    # Acquisition / valeur
    date_acquisition = models.DateField()
    prix_acquisition = models.DecimalField(max_digits=12, decimal_places=2)
    valeur_actuelle_estimee = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    photo = models.ImageField(upload_to="vehicules/photos/", null=True, blank=True)

    class Meta:
        ordering = ["immatriculation"]
        indexes = [
            models.Index(fields=["statut", "is_active"]),
            models.Index(fields=["type_vehicule"]),
        ]

    def __str__(self):
        return f"{self.immatriculation} — {self.marque} {self.modele}"


# ---------------------------------------------------------------------------
# AFFECTATIONS (véhicule <-> conducteur, avec historique)
# ---------------------------------------------------------------------------

class Affectation(BaseModel):
    """
    Historique des affectations véhicule/conducteur.
    Une seule affectation active à la fois par véhicule (contrainte ci-dessous).

    Note : la FK vers Conducteur utilise la notation en chaîne 'conducteurs.Conducteur'
    pour éviter un import circulaire (l'app conducteurs n'a pas besoin de connaître
    vehicules, mais vehicules a besoin de conducteurs.Conducteur).
    """
    vehicule = models.ForeignKey(
        Vehicule, on_delete=models.CASCADE, related_name="affectations"
    )
    conducteur = models.ForeignKey(
        "conducteurs.Conducteur", on_delete=models.CASCADE, related_name="affectations"
    )
    date_debut = models.DateField(default=timezone.now)
    date_fin = models.DateField(null=True, blank=True)
    motif = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-date_debut"]
        constraints = [
            UniqueConstraint(
                fields=["vehicule"],
                condition=Q(date_fin__isnull=True),
                name="un_seul_conducteur_actif_par_vehicule",
            )
        ]

    def __str__(self):
        return f"{self.vehicule} → {self.conducteur} (depuis {self.date_debut})"