from django.contrib import admin

from .models import Conducteur


@admin.register(Conducteur)
class ConducteurAdmin(admin.ModelAdmin):
    list_display = (
        "nom", "prenom", "numero_permis", "categorie_permis",
        "date_expiration_permis", "statut", "is_active",
    )
    list_filter = ("statut", "categorie_permis", "is_active")
    search_fields = ("nom", "prenom", "numero_permis", "telephone")
    ordering = ("nom", "prenom")