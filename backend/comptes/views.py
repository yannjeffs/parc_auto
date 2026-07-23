from django.contrib.auth.models import User
from rest_framework import viewsets

from config.permissions import IsAdminSeul
from .serializers import UtilisateurSerializer


class UtilisateurViewSet(viewsets.ModelViewSet):
    """
    Gestion des comptes de connexion. Pas de suppression réelle exposée —
    on désactive un compte (`is_active=False`) via PATCH plutôt que de le
    supprimer, pour garder une trace de qui a créé/modifié quoi ailleurs
    dans l'historique de l'application.
    """

    queryset = User.objects.all().order_by("username")
    serializer_class = UtilisateurSerializer
    permission_classes = [IsAdminSeul]
    http_method_names = ["get", "post", "patch", "head", "options"]