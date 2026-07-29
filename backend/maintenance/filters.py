"""
FilterSet dédié à Maintenance : ajoute des filtres par plage de dates
(date_debut/date_fin) en plus des champs exacts déjà couverts. Utilisé
notamment pour afficher l'historique des opérations durant une affectation
véhicule/conducteur donnée.
"""

import django_filters

from .models import Maintenance


class MaintenanceFilter(django_filters.FilterSet):
    date_debut = django_filters.DateFilter(field_name="date_intervention", lookup_expr="gte")
    date_fin = django_filters.DateFilter(field_name="date_intervention", lookup_expr="lte")

    class Meta:
        model = Maintenance
        fields = ["vehicule", "type_maintenance", "statut", "date_debut", "date_fin"]