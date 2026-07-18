from django.contrib import admin

from .models import PleinCarburant


@admin.register(PleinCarburant)
class PleinCarburantAdmin(admin.ModelAdmin):
    list_display = (
        "vehicule", "conducteur", "date_plein",
        "litres", "cout_total", "kilometrage_au_plein",
    )
    list_filter = ("date_plein",)
    search_fields = ("vehicule__immatriculation", "station")
    ordering = ("-date_plein",)