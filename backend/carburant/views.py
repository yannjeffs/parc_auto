from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from config.permissions import PeutCreerOuGestionnaire
from vehicules.utils import vehicule_actif_pour, conducteur_pour
from .models import PleinCarburant
from .serializers import PleinCarburantSerializer


def _est_conducteur_seul(user) -> bool:
    if user.is_superuser:
        return False
    groupes = set(user.groups.values_list("name", flat=True))
    return "Conducteur" in groupes and not ({"Admin", "Gestionnaire", "LectureSeule"} & groupes)


class PleinCarburantViewSet(viewsets.ModelViewSet):
    queryset = PleinCarburant.objects.filter(is_active=True)
    serializer_class = PleinCarburantSerializer
    permission_classes = [PeutCreerOuGestionnaire]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vehicule", "conducteur"]

    def get_queryset(self):
        qs = super().get_queryset()
        if _est_conducteur_seul(self.request.user):
            vehicule = vehicule_actif_pour(self.request.user)
            return qs.filter(vehicule=vehicule) if vehicule else qs.none()
        return qs

    def perform_create(self, serializer):
        if _est_conducteur_seul(self.request.user):
            vehicule = vehicule_actif_pour(self.request.user)
            if not vehicule:
                raise PermissionDenied("Aucun véhicule ne t'est actuellement affecté.")
            serializer.save(vehicule=vehicule, conducteur=conducteur_pour(self.request.user))
        else:
            serializer.save()