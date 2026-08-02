"""
GET /api/sante/ — health check public (sans authentification), utilisé par
Render pour vérifier que le service répond avant de router du trafic vers lui.
Volontairement minimaliste : ne touche pas à la base de données, pour que ce
endpoint reste rapide et ne fasse pas planter le health check si la DB a un
souci temporaire de connexion (Render redémarrerait le service inutilement).
"""

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class SanteView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"status": "ok"})