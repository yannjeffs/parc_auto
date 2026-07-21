from rest_framework import serializers

from .models import Vehicule, Affectation


class AffectationSerializer(serializers.ModelSerializer):
    conducteur_nom = serializers.CharField(source="conducteur.__str__", read_only=True)
    vehicule_immatriculation = serializers.CharField(source="vehicule.immatriculation", read_only=True)

    class Meta:
        model = Affectation
        fields = [
            "id", "vehicule", "vehicule_immatriculation", "conducteur", "conducteur_nom",
            "date_debut", "date_fin", "motif",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class VehiculeSerializer(serializers.ModelSerializer):
    conducteur_actuel = serializers.SerializerMethodField()

    class Meta:
        model = Vehicule
        fields = [
            "id", "immatriculation", "numero_chassis", "marque", "modele", "annee",
            "type_vehicule", "type_carburant", "cylindree_cm3", "nombre_places",
            "caracteristiques", "statut", "kilometrage_actuel", "site_affectation",
            "date_acquisition", "prix_acquisition", "valeur_actuelle_estimee",
            "photo", "conducteur_actuel", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_conducteur_actuel(self, obj):
        affectation = obj.affectations.filter(date_fin__isnull=True).first()
        return str(affectation.conducteur) if affectation else None


class VehiculeListSerializer(serializers.ModelSerializer):
    """Version allégée pour les listes (évite de calculer conducteur_actuel à chaque ligne)."""

    class Meta:
        model = Vehicule
        fields = [
            "id", "immatriculation", "marque", "modele",
            "statut", "kilometrage_actuel", "photo",
        ]