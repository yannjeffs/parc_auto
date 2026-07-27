from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend

from config.permissions import PeutCreerOuGestionnaire
from vehicules.utils import vehicule_actif_pour
from .models import Maintenance
from .serializers import MaintenanceSerializer


def _est_conducteur_seul(user) -> bool:
    if user.is_superuser:
        return False
    groupes = set(user.groups.values_list("name", flat=True))
    return "Conducteur" in groupes and not ({"Admin", "Gestionnaire", "LectureSeule"} & groupes)


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.filter(is_active=True)
    serializer_class = MaintenanceSerializer
    permission_classes = [PeutCreerOuGestionnaire]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["vehicule", "type_maintenance", "statut"]

    def get_queryset(self):
        qs = super().get_queryset()
        if _est_conducteur_seul(self.request.user):
            vehicule = vehicule_actif_pour(self.request.user)
            return qs.filter(vehicule=vehicule) if vehicule else qs.none()
        return qs

    def perform_create(self, serializer):
        if _est_conducteur_seul(self.request.user):
            # Un conducteur ne peut que "signaler un problème" sur SON véhicule :
            # on ignore tout ce qu'il aurait pu envoyer pour ces champs et on
            # force des valeurs sûres côté serveur, plutôt que de faire confiance
            # au payload client.
            vehicule = vehicule_actif_pour(self.request.user)
            if not vehicule:
                raise PermissionDenied("Aucun véhicule ne t'est actuellement affecté.")
            serializer.save(
                vehicule=vehicule,
                type_maintenance="curative",
                statut="planifiee",
                cout=0,
                prestataire="",
                prochaine_echeance_date=None,
                prochaine_echeance_km=None,
            )
        else:
            serializer.save()