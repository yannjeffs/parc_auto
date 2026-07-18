from rest_framework import serializers

from .models import Maintenance


class MaintenanceSerializer(serializers.ModelSerializer):
    vehicule_immatriculation = serializers.CharField(
        source="vehicule.immatriculation", read_only=True
    )

    class Meta:
        model = Maintenance
        fields = [
            "id", "vehicule", "vehicule_immatriculation", "type_maintenance", "statut",
            "description", "date_intervention", "kilometrage_intervention", "cout",
            "prestataire", "prochaine_echeance_date", "prochaine_echeance_km",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]