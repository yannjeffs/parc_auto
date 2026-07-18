from rest_framework.routers import DefaultRouter

from .views import ConducteurViewSet

router = DefaultRouter()
router.register("conducteurs", ConducteurViewSet, basename="conducteur")

urlpatterns = router.urls