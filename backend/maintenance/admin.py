from django.contrib import admin

from .models import Maintenance


@admin.register(Maintenance)
class MaintenanceAdmin(admin.ModelAdmin):
    list_display = (
        "vehicule", "type_maintenance", "statut",
        "date_intervention", "cout", "prochaine_echeance_date",
    )
    list_filter = ("type_maintenance", "statut")
    search_fields = ("vehicule__immatriculation", "prestataire", "description")
    ordering = ("-date_intervention",)