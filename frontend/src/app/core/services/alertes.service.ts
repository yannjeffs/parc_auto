import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { DocumentService } from './document.service';
import { ConducteurService } from './conducteur.service';

export interface Alerte {
  id: string;
  titre: string;
  dateExpiration: string;
  expire: boolean;
  route: string[];
}

const FENETRE_JOURS = 30;

@Injectable({ providedIn: 'root' })
export class AlertesService {
  private documentService = inject(DocumentService);
  private conducteurService = inject(ConducteurService);

  /**
   * Récupère les documents et permis expirés ou expirant sous 30 jours.
   * Filtré côté client (volumes raisonnables pour ce type d'app) plutôt que
   * d'ajouter des filtres API dédiés — cohérent avec l'approche du dashboard.
   */
  getAlertes(): Observable<Alerte[]> {
    return forkJoin({
      documents: this.documentService.list({ page_size: 200 }),
      conducteurs: this.conducteurService.list({ page_size: 200 }),
    }).pipe(
      map(({ documents, conducteurs }) => {
        const seuil = new Date();
        seuil.setDate(seuil.getDate() + FENETRE_JOURS);

        const alertesDocuments: Alerte[] = documents.results
          .filter((d) => d.date_expiration && new Date(d.date_expiration) <= seuil)
          .map((d) => ({
            id: `doc-${d.id}`,
            titre: `${d.type_document} — ${d.vehicule_immatriculation}`,
            dateExpiration: d.date_expiration!,
            expire: !d.est_valide,
            route: ['/vehicules', d.vehicule],
          }));

        const alertesPermis: Alerte[] = conducteurs.results
          .filter((c) => new Date(c.date_expiration_permis) <= seuil)
          .map((c) => ({
            id: `permis-${c.id}`,
            titre: `Permis — ${c.prenom} ${c.nom}`,
            dateExpiration: c.date_expiration_permis,
            expire: !c.permis_valide,
            route: ['/conducteurs'],
          }));

        return [...alertesDocuments, ...alertesPermis].sort(
          (a, b) => new Date(a.dateExpiration).getTime() - new Date(b.dateExpiration).getTime(),
        );
      }),
    );
  }
}
