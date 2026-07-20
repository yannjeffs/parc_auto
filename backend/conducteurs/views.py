from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

from config.permissions import IsGestionnaireOuAdmin
from .models import Conducteur
from .serializers import ConducteurSerializer


class ConducteurViewSet(viewsets.ModelViewSet):
    queryset = Conducteur.objects.filter(is_active=True)
    serializer_class = ConducteurSerializer
    permission_classes = [IsGestionnaireOuAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["statut", "categorie_permis"]
    search_fields = ["nom", "prenom", "numero_permis"]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active"])