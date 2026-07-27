"""
Commande : python manage.py creer_groupes
============================================
Crée les 4 groupes de rôles s'ils n'existent pas déjà. Idempotent — peut être
relancée sans risque (get_or_create). L'assignation des utilisateurs aux
groupes se fait ensuite simplement depuis l'admin Django (/admin/auth/user/)
ou depuis la page "Comptes utilisateurs" de l'application.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

GROUPES = ["Admin", "Gestionnaire", "LectureSeule", "Conducteur"]


class Command(BaseCommand):
    help = "Crée les groupes de rôles : Admin, Gestionnaire, LectureSeule, Conducteur"

    def handle(self, *args, **options):
        for nom in GROUPES:
            groupe, cree = Group.objects.get_or_create(name=nom)
            if cree:
                self.stdout.write(self.style.SUCCESS(f"Groupe '{nom}' créé."))
            else:
                self.stdout.write(f"Groupe '{nom}' existe déjà.")