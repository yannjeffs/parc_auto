from django.urls import path

from .views import VehiculeExportPDFView, FlotteExportExcelView

urlpatterns = [
    path(
        'vehicules/<uuid:vehicule_id>/export-pdf/',
        VehiculeExportPDFView.as_view(),
        name='vehicule-export-pdf',
    ),
    path(
        'flotte/export-excel/',
        FlotteExportExcelView.as_view(),
        name='flotte-export-excel',
    ),
]