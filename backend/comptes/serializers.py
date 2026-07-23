"""
App: comptes
=============
Gère les comptes de connexion (auth.User de Django) depuis l'interface, en
mappant un rôle simple ("admin" / "gestionnaire" / "lecture_seule") sur les
groupes Django déjà utilisés par les permissions (config/permissions.py).

Volontairement, cette API ne touche jamais à `is_superuser` — un utilisateur
"admin" créé ici obtient les droits Admin via le groupe uniquement, ce qui
reste cohérent avec RolePermission/IsGestionnaireOuAdmin sans donner accès
aux super-pouvoirs Django (accès shell, etc.) réservés à un vrai superuser
créé en ligne de commande.
"""

from django.contrib.auth.models import User, Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

ROLE_VERS_GROUPE = {
    "admin": "Admin",
    "gestionnaire": "Gestionnaire",
    "lecture_seule": "LectureSeule",
}


def _role_depuis_groupes(user) -> str:
    if user.is_superuser or user.groups.filter(name="Admin").exists():
        return "admin"
    if user.groups.filter(name="Gestionnaire").exists():
        return "gestionnaire"
    return "lecture_seule"


class UtilisateurSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    role_saisi = serializers.ChoiceField(
        choices=list(ROLE_VERS_GROUPE.keys()),
        write_only=True,
        required=False,
        help_text="Rôle à assigner (mappé sur un groupe Django).",
    )
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, style={"input_type": "password"}
    )

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "is_active",
            "role", "role_saisi", "password",
            "date_joined", "last_login",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def get_role(self, obj):
        return _role_depuis_groupes(obj)

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as exc:
                raise serializers.ValidationError(list(exc.messages))
        return value

    def _appliquer_role(self, user, role):
        nom_groupe = ROLE_VERS_GROUPE.get(role)
        if not nom_groupe:
            return
        groupe, _ = Group.objects.get_or_create(name=nom_groupe)
        # Retire l'utilisateur des autres groupes de rôle avant d'assigner le nouveau
        # (un compte n'a qu'un seul rôle à la fois dans ce modèle simplifié)
        user.groups.remove(*Group.objects.filter(name__in=ROLE_VERS_GROUPE.values()))
        user.groups.add(groupe)

    def create(self, validated_data):
        role = validated_data.pop("role_saisi", "lecture_seule")
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        user.set_password(password or User.objects.make_random_password(length=16))
        user.save()
        self._appliquer_role(user, role)
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop("role_saisi", None)
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if role:
            self._appliquer_role(instance, role)
        return instance