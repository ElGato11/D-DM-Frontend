import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { AuthRequest } from './AuthRequest';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = 'http://localhost:8080/';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  login(credentials: AuthRequest): Observable<string> {
    return this.http.post<{ token: string }>(this.apiUrl + 'auth/login', credentials).pipe(
      tap(userData => {
        sessionStorage.setItem('token', userData.token);
      }),
      map(userData => userData.token),
      catchError(this.handleError)
    );
  }

  getUsuario(): any {
  const token = sessionStorage.getItem('token');
  if (!token) return null;

  const payload = token.split('.')[1];
  try {
    const decoded = JSON.parse(atob(payload));
    return {
      nombre: decoded.sub,
      rol: decoded.rol,
      id: decoded.id // solo si has incluido el ID en los claims del token
    };
  } catch (e) {
    return null;
  }
}

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!sessionStorage.getItem('token');
  }

  isAdmin(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);
      return payload?.rol === 'ADMIN';
    } catch (e) {
      console.error('Error al decodificar token:', e);
      return false;
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('token');
    }
  }

  get userToken(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return sessionStorage.getItem('token') || '';
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Se ha producido un error:', error.error);
    } else {
      console.error('Backend retornó el código de estado:', error.status, error.message);
    }
    return throwError(() => new Error('Algo falló. Por favor intente nuevamente.'));
  }
}
