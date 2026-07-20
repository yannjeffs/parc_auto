"""
FilterSet dédié aux affectations : ajoute un filtre booléen `actif` en plus des
champs exacts (`vehicule`, `conducteur`) déjà couverts par filterset_fields.
`actif=true` renvoie les affectations en cours (date_fin NULL), `actif=false`
renvoie l'historique terminé.
"""

import django_filters

from .models import Affectation


class AffectationFilter(django_filters.FilterSet):
    actif = django_filters.BooleanFilter(field_name="date_fin", lookup_expr="isnull")

    class Meta:
        model = Affectation
        fields = ["vehicule", "conducteur", "actif"]