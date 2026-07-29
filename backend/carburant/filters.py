"""
FilterSet dédié à PleinCarburant : ajoute des filtres par plage de dates.
Même usage que pour Maintenance — historique d'une affectation.
"""

import django_filters

from .models import PleinCarburant


class PleinCarburantFilter(django_filters.FilterSet):
    date_debut = django_filters.DateFilter(field_name="date_plein", lookup_expr="date__gte")
    date_fin = django_filters.DateFilter(field_name="date_plein", lookup_expr="date__lte")

    class Meta:
        model = PleinCarburant
        fields = ["vehicule", "conducteur", "date_debut", "date_fin"]