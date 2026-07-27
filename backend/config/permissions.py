"""
Permissions par rôle, basées sur les groupes Django natifs — aucune modification
du modèle User n'est nécessaire.

Rôles (noms de groupes exacts, sensibles à la casse) :
    - "Admin"         : lecture, écriture, suppression — sur tout le parc
    - "Gestionnaire"  : lecture, écriture — sur tout le parc, PAS de suppression
    - "LectureSeule"  : lecture uniquement — sur tout le parc
    - "Conducteur"    : lecture + création limitées à SON véhicule assigné
                        (le filtrage par véhicule se fait dans get_queryset()
                        des ViewSets concernés, pas ici — cette permission ne
                        gère que le POST/GET/DELETE au niveau global)

Un superuser Django a toujours les droits Admin, peu importe son groupe.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


def _groupes(user) -> set[str]:
    return set(user.groups.values_list("name", flat=True))


class IsGestionnaireOuAdmin(BasePermission):
    """
    À utiliser comme permission_classes sur les ViewSets réservés à la gestion
    globale du parc (véhicules, conducteurs, documents, affectations).

    - Lecture (GET/HEAD/OPTIONS) : tout utilisateur authentifié (le queryset
      scope ensuite ce qu'un Conducteur voit réellement — voir get_queryset).
    - Écriture (POST/PUT/PATCH) : Gestionnaire ou Admin uniquement.
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


class PeutCreerOuGestionnaire(BasePermission):
    """
    Variante pour Maintenance et PleinCarburant : un Conducteur peut créer
    (POST) — pour ajouter un plein ou signaler un problème sur son véhicule —
    mais ne peut jamais modifier (PATCH) ni supprimer (DELETE) une entrée,
    même la sienne. Gestionnaire/Admin gardent leurs droits habituels.
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

        if request.method == "POST":
            return "Admin" in groupes or "Gestionnaire" in groupes or "Conducteur" in groupes

        # PUT / PATCH : jamais pour un Conducteur
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