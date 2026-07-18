from django.contrib import admin

from .models import Vehicule, Affectation


class AffectationInline(admin.TabularInline):
    model = Affectation
    extra = 0
    fields = ("conducteur", "date_debut", "date_fin", "motif")
    ordering = ("-date_debut",)


@admin.register(Vehicule)
class VehiculeAdmin(admin.ModelAdmin):
    list_display = (
        "immatriculation", "marque", "modele", "annee",
        "statut", "kilometrage_actuel", "is_active",
    )
    list_filter = ("statut", "type_vehicule", "type_carburant", "is_active")
    search_fields = ("immatriculation", "numero_chassis", "marque", "modele")
    ordering = ("immatriculation",)
    inlines = [AffectationInline]


@admin.register(Affectation)
class AffectationAdmin(admin.ModelAdmin):
    list_display = ("vehicule", "conducteur", "date_debut", "date_fin")
    list_filter = ("date_debut", "date_fin")
    search_fields = ("vehicule__immatriculation", "conducteur__nom", "conducteur__prenom")