from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    est_valide = serializers.BooleanField(read_only=True)
    jours_avant_expiration = serializers.IntegerField(read_only=True)

    class Meta:
        model = Document
        fields = [
            "id", "vehicule", "type_document", "numero_document",
            "date_emission", "date_expiration", "fichier",
            "est_valide", "jours_avant_expiration",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]