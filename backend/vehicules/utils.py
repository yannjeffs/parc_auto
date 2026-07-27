"""
Utilitaires partagés pour scoper les données d'un Conducteur connecté à son
véhicule assigné. Importé depuis plusieurs apps (maintenance, carburant,
documents) — centralisé ici pour éviter de dupliquer la logique.
"""


def conducteur_pour(user):
    """Renvoie le profil Conducteur lié à ce compte de connexion, ou None."""
    from conducteurs.models import Conducteur
    return Conducteur.objects.filter(utilisateur=user, is_active=True).first()


def vehicule_actif_pour(user):
    """Renvoie le véhicule actuellement affecté à ce conducteur, ou None."""
    conducteur = conducteur_pour(user)
    if not conducteur:
        return None
    affectation = (
        conducteur.affectations.filter(date_fin__isnull=True)
        .select_related("vehicule")
        .first()
    )
    return affectation.vehicule if affectation else None