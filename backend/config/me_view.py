"""
GET /api/auth/me/ — informations sur l'utilisateur connecté, dont son rôle.
Le frontend s'en sert pour adapter l'interface (masquer les boutons création/
suppression selon le rôle) sans dupliquer la logique de permission déjà
présente côté API — c'est purement pour l'UX, le backend reste la seule
source de vérité pour ce qui est réellement autorisé.
"""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def _determiner_role(user) -> str:
    if user.is_superuser or user.groups.filter(name="Admin").exists():
        return "admin"
    if user.groups.filter(name="Gestionnaire").exists():
        return "gestionnaire"
    return "lecture_seule"


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "role": _determiner_role(user),
        })