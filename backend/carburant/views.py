from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from config.permissions import IsGestionnaireOuAdmin
from .models import PleinCarburant
from .serializers import PleinCarburantSerializer


class PleinCarburantViewSet(viewsets.ModelViewSet):
    queryset = PleinCarburant.objects.filter(is_active=True)
    serializer_class = PleinCarburantSerializer
    permission_classes = [IsGestionnaireOuAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vehicule", "conducteur"]