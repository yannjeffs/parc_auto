"""
Permissions par rôle, basées sur les groupes Django natifs — aucune modification
du modèle User n'est nécessaire.

Rôles (noms de groupes exacts, sensibles à la casse) :
    - "Admin"         : lecture, écriture, suppression
    - "Gestionnaire"  : lecture, écriture — PAS de suppression
    - "LectureSeule"  : lecture uniquement

Un superuser Django a toujours les droits Admin, peu importe son groupe.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


def _groupes(user) -> set[str]:
    return set(user.groups.values_list("name", flat=True))


class IsGestionnaireOuAdmin(BasePermission):
    """
    À utiliser comme permission_classes sur les ViewSets métier (véhicules,
    conducteurs, maintenance, carburant, documents).

    - Lecture (GET/HEAD/OPTIONS) : tout utilisateur authentifié.
    - Écriture (POST/PUT/PATCH) : Gestionnaire ou Admin.
    - Suppression (DELETE) : Admin uniquement.
    """

    message = "Ton rôle ne permet pas cette action."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        if user.is_superuser:
            return True

        groupes = _groupes(user)

        if request.method == "DELETE":
            return "Admin" in groupes

        # POST / PUT / PATCH
        return "Admin" in groupes or "Gestionnaire" in groupes


class IsAdminSeul(BasePermission):
    """
    Réservée aux vues sensibles où même la lecture doit être limitée aux
    administrateurs — typiquement la gestion des comptes utilisateurs.
    """

    message = "Réservé aux administrateurs."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_superuser or _groupes(user).__contains__("Admin")