import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

interface JwtPayload { rol?: string }

function parseJwt(token: string): JwtPayload {
  try {
    const base64Payload = token.split('.')[1];
    const jsonPayload = decodeURIComponent(
      atob(base64Payload)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');
  if (token) {
    const payload = parseJwt(token);
    if (payload.rol === 'ADMIN') return true;
  }
  return router.createUrlTree(['/']);
};
