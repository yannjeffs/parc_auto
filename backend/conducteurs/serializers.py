from rest_framework import serializers

from .models import Conducteur


class ConducteurSerializer(serializers.ModelSerializer):
    permis_valide = serializers.BooleanField(read_only=True)

    class Meta:
        model = Conducteur
        fields = [
            "id", "utilisateur", "nom", "prenom", "telephone",
            "numero_permis", "categorie_permis", "date_expiration_permis",
            "permis_valide", "date_embauche", "statut", "photo",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]