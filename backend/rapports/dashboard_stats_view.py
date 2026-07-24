"""
GET /api/rapports/dashboard-stats/
====================================
Agrège en une seule requête tout ce dont le tableau de bord a besoin :
compteurs par période (jour/semaine/mois) pour maintenance/carburant/
affectations, et une série de 6 mois pour les courbes de coûts.

Calculé côté serveur plutôt que côté client : évite de rapatrier des
centaines d'enregistrements dans le navigateur juste pour les compter.
"""

import calendar
from datetime import timedelta, date

from django.db.models import Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from maintenance.models import Maintenance
from carburant.models import PleinCarburant
from vehicules.models import Affectation

MOIS_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]


def _limites_mois(annee: int, mois: int) -> tuple[date, date]:
    debut = date(annee, mois, 1)
    dernier_jour = calendar.monthrange(annee, mois)[1]
    fin = date(annee, mois, dernier_jour)
    return debut, fin


def _mois_moins_n(annee: int, mois: int, n: int) -> tuple[int, int]:
    m = mois - n
    a = annee
    while m <= 0:
        m += 12
        a -= 1
    return a, m


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        aujourdhui = timezone.now().date()
        debut_semaine = aujourdhui - timedelta(days=6)  # fenêtre glissante de 7 jours
        debut_mois = aujourdhui.replace(day=1)

        def compter_maintenance(type_m, depuis):
            return Maintenance.objects.filter(
                type_maintenance=type_m, date_intervention__gte=depuis, is_active=True,
            ).count()

        maintenances = {
            "preventive": {
                "semaine": compter_maintenance("preventive", debut_semaine),
                "mois": compter_maintenance("preventive", debut_mois),
            },
            "curative": {
                "semaine": compter_maintenance("curative", debut_semaine),
                "mois": compter_maintenance("curative", debut_mois),
            },
        }

        carburant = {
            "jour": PleinCarburant.objects.filter(date_plein__date=aujourdhui, is_active=True).count(),
            "semaine": PleinCarburant.objects.filter(date_plein__date__gte=debut_semaine, is_active=True).count(),
            "mois": PleinCarburant.objects.filter(date_plein__date__gte=debut_mois, is_active=True).count(),
        }

        affectations = {
            "jour": Affectation.objects.filter(date_debut=aujourdhui, is_active=True).count(),
            "semaine": Affectation.objects.filter(date_debut__gte=debut_semaine, is_active=True).count(),
            "mois": Affectation.objects.filter(date_debut__gte=debut_mois, is_active=True).count(),
        }

        # Tendances des coûts sur les 6 derniers mois (mois courant inclus)
        tendances = []
        for i in range(5, -1, -1):
            annee, mois = _mois_moins_n(aujourdhui.year, aujourdhui.month, i)
            debut, fin = _limites_mois(annee, mois)

            cout_maintenance = Maintenance.objects.filter(
                date_intervention__gte=debut, date_intervention__lte=fin, is_active=True,
            ).aggregate(total=Sum("cout"))["total"] or 0

            cout_carburant = PleinCarburant.objects.filter(
                date_plein__date__gte=debut, date_plein__date__lte=fin, is_active=True,
            ).aggregate(total=Sum("cout_total"))["total"] or 0

            tendances.append({
                "mois": f"{MOIS_LABELS[mois - 1]} {annee}",
                "cout_maintenance": float(cout_maintenance),
                "cout_carburant": float(cout_carburant),
            })

        return Response({
            "maintenances": maintenances,
            "carburant": carburant,
            "affectations": affectations,
            "tendances": tendances,
        })