from django.urls import path

from .views import VehiculeExportPDFView, FlotteExportExcelView
from .dashboard_stats_view import DashboardStatsView

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
    path(
        'dashboard-stats/',
        DashboardStatsView.as_view(),
        name='dashboard-stats',
    ),
]