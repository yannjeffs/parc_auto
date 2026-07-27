import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, shareReplay, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RefreshResponse } from '../../models/auth.model';

const ACCESS_TOKEN_KEY = 'parc_auto_access_token';
const REFRESH_TOKEN_KEY = 'parc_auto_refresh_token';
const ROLE_KEY = 'parc_auto_role';

export type Role = 'admin' | 'gestionnaire' | 'lecture_seule' | 'conducteur';

export interface MeResponse {
  username: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private refreshInProgress$: Observable<RefreshResponse> | null = null;
  private roleSubject = new BehaviorSubject<Role | null>(
    (localStorage.getItem(ROLE_KEY) as Role | null) ?? null,
  );
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login/`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh);
        })
      );
  }

  /**
   * Récupère le rôle de l'utilisateur connecté et le met en cache (mémoire +
   * localStorage, pour survivre à un rechargement de page). À appeler après
   * le login, et une fois au démarrage de l'app si un token est déjà présent.
   * Rappel : ceci sert uniquement à adapter l'UI — la vraie autorisation est
   * toujours vérifiée côté API (RolePermission), jamais côté client seul.
   */
  fetchMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${environment.apiUrl}/auth/me/`).pipe(
      tap((response) => {
        localStorage.setItem(ROLE_KEY, response.role);
        this.roleSubject.next(response.role);
      }),
    );
  }

  getRole(): Role | null {
    return this.roleSubject.value;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  estConducteur(): boolean {
    return this.getRole() === 'conducteur';
  }

  /** Peut créer/modifier (Admin ou Gestionnaire) */
  peutEcrire(): boolean {
    return this.getRole() === 'admin' || this.getRole() === 'gestionnaire';
  }

  /** Peut supprimer (Admin uniquement) */
  peutSupprimer(): boolean {
    return this.getRole() === 'admin';
  }

  refreshToken(): Observable<RefreshResponse> {
    const refresh = this.getRefreshToken();
    return this.http
      .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh/`, { refresh })
      .pipe(
        tap((response) => {
          localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
        })
      );
  }

  /**
   * À utiliser depuis l'intercepteur : si un refresh est déjà en cours (déclenché par
   * une autre requête tombée en 401 au même moment), on renvoie ce même appel en cours
   * plutôt que d'en déclencher un second — évite d'invalider le refresh token en le
   * consommant deux fois (ROTATE_REFRESH_TOKENS côté Django).
   */
  getSharedRefresh(): Observable<RefreshResponse> {
    if (!this.refreshInProgress$) {
      this.refreshInProgress$ = this.refreshToken().pipe(
        shareReplay(1),
        finalize(() => {
          this.refreshInProgress$ = null;
        }),
      );
    }
    return this.refreshInProgress$;
  }

  logout(): void {
    const refresh = this.getRefreshToken();
    if (refresh) {
      // Blackliste le refresh token côté serveur (best-effort, pas bloquant)
      this.http
        .post(`${environment.apiUrl}/auth/logout/`, { refresh })
        .subscribe({ error: () => undefined });
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    this.roleSubject.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
