"""
Commande : python manage.py seed_data
=======================================
Peuple la base avec des données réalistes : conducteurs, véhicules,
affectations, maintenances, pleins de carburant et documents.

Options :
    --flush   Supprime les données existantes avant de seeder (attention, destructif)
"""

import random
from datetime import timedelta, date
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

from vehicules.models import Vehicule, Affectation
from conducteurs.models import Conducteur
from maintenance.models import Maintenance
from carburant.models import PleinCarburant
from documents.models import Document


NB_CONDUCTEURS = 25
NB_VEHICULES = 60

MARQUES_MODELES = [
    ("Toyota", ["Hilux", "Corolla", "Land Cruiser", "RAV4", "Hiace"]),
    ("Hyundai", ["Tucson", "Accent", "H1", "Santa Fe"]),
    ("Kia", ["Sportage", "Rio", "Sorento"]),
    ("Nissan", ["Navara", "Patrol", "Almera"]),
    ("Renault", ["Duster", "Logan", "Master"]),
    ("Suzuki", ["Grand Vitara", "Jimny"]),
    ("Mitsubishi", ["Pajero", "L200"]),
    ("Mercedes-Benz", ["Sprinter", "Actros"]),
]

REGIONS_PLAQUES = ["LT", "CE", "OU", "NO", "SU", "ES"]  # codes région Cameroun (simplifiés)

VILLES = ["Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua", "Buea"]

PRESTATAIRES = [
    "Garage Étoile Douala", "SGA Motors", "AutoPlus Yaoundé",
    "Garage Centrale Bafoussam", "TechAuto Cameroun",
]

STATIONS = ["Total Energies", "Ola Energy", "Neptune Oil", "Tradex"]


class Command(BaseCommand):
    help = "Peuple la base de données avec des données de test réalistes"

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush", action="store_true",
            help="Supprime les données existantes avant de seeder",
        )

    def handle(self, *args, **options):
        fake = Faker("fr_FR")

        if options["flush"]:
            self.stdout.write("Suppression des données existantes...")
            Document.objects.all().delete()
            PleinCarburant.objects.all().delete()
            Maintenance.objects.all().delete()
            Affectation.objects.all().delete()
            Vehicule.objects.all().delete()
            Conducteur.objects.all().delete()

        conducteurs = self._seed_conducteurs(fake)
        vehicules = self._seed_vehicules(fake)
        self._seed_affectations(vehicules, conducteurs)
        self._seed_maintenances(vehicules)
        self._seed_carburant(vehicules, conducteurs)
        self._seed_documents(vehicules)

        self.stdout.write(self.style.SUCCESS(
            f"Terminé : {len(conducteurs)} conducteurs, {len(vehicules)} véhicules, "
            f"avec historiques de maintenance, carburant et documents."
        ))

    # ------------------------------------------------------------------
    def _telephone_cm(self, fake):
        # Format Cameroun : +237 6XX XXX XXX
        return f"+237 6{random.randint(50,99)}{fake.numerify('# ### ###')}"

    def _seed_conducteurs(self, fake):
        self.stdout.write("Création des conducteurs...")
        conducteurs = []
        for i in range(NB_CONDUCTEURS):
            date_expiration = fake.date_between(start_date="-30d", end_date="+3y")
            conducteur = Conducteur.objects.create(
                nom=fake.last_name(),
                prenom=fake.first_name(),
                telephone=self._telephone_cm(fake),
                numero_permis=f"CM-PERM-{100000 + i}",
                categorie_permis=random.choice(["B", "B", "B", "C", "D"]),
                date_expiration_permis=date_expiration,
                date_embauche=fake.date_between(start_date="-5y", end_date="-1m"),
                statut=random.choice(
                    ["disponible", "disponible", "en_mission", "en_conge"]
                ),
            )
            conducteurs.append(conducteur)
        return conducteurs

    def _seed_vehicules(self, fake):
        self.stdout.write("Création des véhicules...")
        vehicules = []
        for i in range(NB_VEHICULES):
            marque, modeles = random.choice(MARQUES_MODELES)
            modele = random.choice(modeles)
            annee = random.randint(2014, 2025)
            region = random.choice(REGIONS_PLAQUES)
            immatriculation = f"{region} {1000 + i} {random.choice('ABCDEFGH')}"
            type_carburant = random.choices(
                ["diesel", "essence", "hybride"], weights=[60, 35, 5]
            )[0]
            statut = random.choices(
                ["en_service", "en_maintenance", "en_panne", "hors_service"],
                weights=[75, 12, 8, 5],
            )[0]

            vehicule = Vehicule.objects.create(
                immatriculation=immatriculation,
                numero_chassis=fake.bothify(text="VF#?#########", letters="ABCDEFGHJKLMNPRSTUVWXYZ"),
                marque=marque,
                modele=modele,
                annee=annee,
                type_vehicule=random.choice(
                    ["berline", "suv", "utilitaire", "camion"]
                ),
                type_carburant=type_carburant,
                cylindree_cm3=random.choice([1400, 1600, 2000, 2200, 2500, 3000]),
                nombre_places=random.choice([4, 5, 5, 7, 9]),
                caracteristiques={
                    "transmission": random.choice(["manuelle", "automatique"]),
                    "traction": random.choice(["FWD", "4x4", "AWD"]),
                    "puissance_ch": random.randint(90, 250),
                },
                statut=statut,
                kilometrage_actuel=random.randint(5000, 180000),
                site_affectation=random.choice(VILLES),
                date_acquisition=fake.date_between(start_date="-6y", end_date="-1m"),
                prix_acquisition=Decimal(random.randrange(8_000_000, 35_000_000, 500_000)),
            )
            vehicules.append(vehicule)
        return vehicules

    def _seed_affectations(self, vehicules, conducteurs):
        self.stdout.write("Création des affectations...")
        # ~70% des véhicules ont un conducteur actif assigné
        for vehicule in vehicules:
            if random.random() < 0.7:
                conducteur = random.choice(conducteurs)
                Affectation.objects.create(
                    vehicule=vehicule,
                    conducteur=conducteur,
                    date_debut=timezone.now().date() - timedelta(days=random.randint(10, 400)),
                    date_fin=None,
                    motif="Affectation initiale",
                )

    def _seed_maintenances(self, vehicules):
        self.stdout.write("Création de l'historique de maintenance...")
        for vehicule in vehicules:
            nb_maintenances = random.randint(1, 5)
            km_base = vehicule.kilometrage_actuel
            for _ in range(nb_maintenances):
                type_m = random.choices(
                    ["preventive", "curative"], weights=[70, 30]
                )[0]
                jours_avant = random.randint(15, 500)
                Maintenance.objects.create(
                    vehicule=vehicule,
                    type_maintenance=type_m,
                    statut="terminee",
                    description=(
                        "Vidange, filtres et contrôle général"
                        if type_m == "preventive"
                        else random.choice([
                            "Remplacement plaquettes de frein",
                            "Réparation système de refroidissement",
                            "Panne électrique - alternateur",
                            "Remplacement pneus avant",
                        ])
                    ),
                    date_intervention=timezone.now().date() - timedelta(days=jours_avant),
                    kilometrage_intervention=max(0, km_base - jours_avant * 30),
                    cout=Decimal(random.randrange(15_000, 450_000, 5_000)),
                    prestataire=random.choice(PRESTATAIRES),
                    prochaine_echeance_date=(
                        timezone.now().date() + timedelta(days=random.randint(30, 180))
                        if type_m == "preventive" else None
                    ),
                    prochaine_echeance_km=(
                        km_base + random.randint(5000, 10000)
                        if type_m == "preventive" else None
                    ),
                )

    def _seed_carburant(self, vehicules, conducteurs):
        self.stdout.write("Création de l'historique de carburant...")
        for vehicule in vehicules:
            nb_pleins = random.randint(5, 15)
            km_base = vehicule.kilometrage_actuel
            for i in range(nb_pleins):
                litres = Decimal(random.randrange(20, 80))
                prix_litre = Decimal(random.choice([730, 750, 820]))  # FCFA/L approx.
                jours_avant = (nb_pleins - i) * random.randint(5, 15)
                PleinCarburant.objects.create(
                    vehicule=vehicule,
                    conducteur=random.choice(conducteurs) if conducteurs else None,
                    date_plein=timezone.now() - timedelta(days=jours_avant),
                    litres=litres,
                    cout_total=litres * prix_litre,
                    kilometrage_au_plein=max(0, km_base - jours_avant * 25),
                    station=random.choice(STATIONS),
                )

    def _seed_documents(self, vehicules):
        self.stdout.write("Création des documents...")
        for vehicule in vehicules:
            # Assurance : certaines expirées volontairement pour tester les alertes
            expiration_assurance = timezone.now().date() + timedelta(
                days=random.randint(-20, 300)
            )
            Document.objects.create(
                vehicule=vehicule,
                type_document="assurance",
                numero_document=f"ASS-{random.randint(100000, 999999)}",
                date_emission=expiration_assurance - timedelta(days=365),
                date_expiration=expiration_assurance,
            )
            expiration_visite = timezone.now().date() + timedelta(
                days=random.randint(-10, 180)
            )
            Document.objects.create(
                vehicule=vehicule,
                type_document="visite_technique",
                numero_document=f"VT-{random.randint(100000, 999999)}",
                date_emission=expiration_visite - timedelta(days=180),
                date_expiration=expiration_visite,
            )