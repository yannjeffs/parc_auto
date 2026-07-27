from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend

from config.permissions import IsGestionnaireOuAdmin
from vehicules.utils import vehicule_actif_pour
from .models import Document
from .serializers import DocumentSerializer


def _est_conducteur_seul(user) -> bool:
    if user.is_superuser:
        return False
    groupes = set(user.groups.values_list("name", flat=True))
    return "Conducteur" in groupes and not ({"Admin", "Gestionnaire", "LectureSeule"} & groupes)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.filter(is_active=True)
    serializer_class = DocumentSerializer
    permission_classes = [IsGestionnaireOuAdmin]  # écriture jamais pour un Conducteur, cohérent ici
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vehicule", "type_document"]

    def get_queryset(self):
        qs = super().get_queryset()
        if _est_conducteur_seul(self.request.user):
            vehicule = vehicule_actif_pour(self.request.user)
            return qs.filter(vehicule=vehicule) if vehicule else qs.none()
        return qs