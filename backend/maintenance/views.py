from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from config.permissions import IsGestionnaireOuAdmin
from .models import Maintenance
from .serializers import MaintenanceSerializer


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.filter(is_active=True)
    serializer_class = MaintenanceSerializer
    permission_classes = [IsGestionnaireOuAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vehicule", "type_maintenance", "statut"]