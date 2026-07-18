from rest_framework.routers import DefaultRouter

from .views import PleinCarburantViewSet

router = DefaultRouter()
router.register("pleins-carburant", PleinCarburantViewSet, basename="plein-carburant")

urlpatterns = router.urls