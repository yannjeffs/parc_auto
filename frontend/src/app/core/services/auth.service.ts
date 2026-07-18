import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RefreshResponse } from '../../models/auth.model';

const ACCESS_TOKEN_KEY = 'parc_auto_access_token';
const REFRESH_TOKEN_KEY = 'parc_auto_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
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
