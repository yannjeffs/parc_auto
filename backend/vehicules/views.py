from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Vehicule, Affectation
from .serializers import VehiculeSerializer, VehiculeListSerializer, AffectationSerializer


class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["statut", "type_vehicule", "type_carburant"]
    search_fields = ["immatriculation", "marque", "modele", "numero_chassis"]
    ordering_fields = ["immatriculation", "annee", "kilometrage_actuel"]

    def get_serializer_class(self):
        if self.action == "list":
            return VehiculeListSerializer
        return VehiculeSerializer

    def perform_destroy(self, instance):
        # Soft delete : on ne supprime jamais physiquement un véhicule
        instance.is_active = False
        instance.save(update_fields=["is_active"])


class AffectationViewSet(viewsets.ModelViewSet):
    queryset = Affectation.objects.all()
    serializer_class = AffectationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vehicule", "conducteur", "date_fin"]