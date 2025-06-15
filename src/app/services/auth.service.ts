import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthRequest } from './AuthRequest';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })

export class AuthService {
    private apiUrl: string= "http://localhost:8080/";

    constructor(private http: HttpClient){}

    login(credentials: AuthRequest): Observable<String>{
      return this.http.post<any>(this.apiUrl+"auth/login",credentials).pipe(
        tap( (userData) => {
            sessionStorage.setItem("token", userData.token)
          }),
          map((userData)=> userData.token),
          catchError(this.handleError)
        );
    }

    isLoggedIn(): boolean {
      if (typeof window !== 'undefined') {
        return !!sessionStorage.getItem('token');
      }
      return false;
}

    logout(): void {
      sessionStorage.removeItem("token");
    }


    get userToken():String{
        return sessionStorage.getItem("token")||'';
    }

    private handleError(error:HttpErrorResponse){
        if(error.status===0){
          console.error('Se ha producio un error ', error.error);
        }
        else{
          console.error('Backend retornó el código de estado ', error);
        }
        return throwError(()=> new Error('Algo falló. Por favor intente nuevamente.'));
      }
  }