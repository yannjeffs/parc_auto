from rest_framework import serializers

from .models import PleinCarburant


class PleinCarburantSerializer(serializers.ModelSerializer):
    prix_par_litre = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = PleinCarburant
        fields = [
            "id", "vehicule", "conducteur", "date_plein", "litres",
            "cout_total", "prix_par_litre", "kilometrage_au_plein", "station",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]