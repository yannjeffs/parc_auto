from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "vehicule", "type_document", "numero_document",
        "date_emission", "date_expiration", "est_valide",
    )
    list_filter = ("type_document",)
    search_fields = ("vehicule__immatriculation", "numero_document")
    ordering = ("date_expiration",)