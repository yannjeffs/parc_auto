from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from config.permissions import IsGestionnaireOuAdmin
from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.filter(is_active=True)
    serializer_class = DocumentSerializer
    permission_classes = [IsGestionnaireOuAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vehicule", "type_document"]