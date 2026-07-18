from rest_framework.routers import DefaultRouter

from .views import MaintenanceViewSet

router = DefaultRouter()
router.register("maintenances", MaintenanceViewSet, basename="maintenance")

urlpatterns = router.urls