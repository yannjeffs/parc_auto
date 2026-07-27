from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from config.permissions import IsGestionnaireOuAdmin
from .models import Vehicule, Affectation
from .serializers import VehiculeSerializer, VehiculeListSerializer, AffectationSerializer
from .filters import AffectationFilter
from .utils import conducteur_pour


def _est_conducteur_seul(user) -> bool:
    """True si l'utilisateur n'a que le rôle Conducteur (pas admin/gestionnaire/lecture)."""
    if user.is_superuser:
        return False
    groupes = set(user.groups.values_list("name", flat=True))
    return "Conducteur" in groupes and not ({"Admin", "Gestionnaire", "LectureSeule"} & groupes)


class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.filter(is_active=True)
    permission_classes = [IsGestionnaireOuAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["statut", "type_vehicule", "type_carburant"]
    search_fields = ["immatriculation", "marque", "modele", "numero_chassis"]
    ordering_fields = ["immatriculation", "annee", "kilometrage_actuel"]

    def get_queryset(self):
        qs = super().get_queryset()
        if _est_conducteur_seul(self.request.user):
            conducteur = conducteur_pour(self.request.user)
            if not conducteur:
                return qs.none()
            return qs.filter(affectations__conducteur=conducteur, affectations__date_fin__isnull=True)

        if self.request.query_params.get("disponible") == "true":
            # Exclut les véhicules ayant déjà une affectation active (date_fin NULL)
            # — utilisé par le sélecteur du formulaire "Nouvelle affectation".
            qs = qs.exclude(affectations__date_fin__isnull=True)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return VehiculeListSerializer
        return VehiculeSerializer

    def perform_destroy(self, instance):
        # Soft delete : on ne supprime jamais physiquement un véhicule
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class AffectationViewSet(viewsets.ModelViewSet):
    queryset = Affectation.objects.all().order_by("-date_debut")
    serializer_class = AffectationSerializer
    permission_classes = [IsGestionnaireOuAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_class = AffectationFilter

    def get_queryset(self):
        qs = super().get_queryset()
        if _est_conducteur_seul(self.request.user):
            conducteur = conducteur_pour(self.request.user)
            return qs.filter(conducteur=conducteur) if conducteur else qs.none()
        return qs