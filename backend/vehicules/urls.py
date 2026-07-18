from rest_framework.routers import DefaultRouter

from .views import VehiculeViewSet, AffectationViewSet

router = DefaultRouter()
router.register("vehicules", VehiculeViewSet, basename="vehicule")
router.register("affectations", AffectationViewSet, basename="affectation")

urlpatterns = router.urls