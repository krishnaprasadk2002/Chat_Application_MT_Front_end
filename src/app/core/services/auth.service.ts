import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User } from '../Models/user.model';
import { AuthResponse, LoginResponse } from '../Models/authresponse.model';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.baseUrl

  constructor(private http:HttpClient) { }

  userRegister(userData: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/user/register`, userData);
  }

// Inside your AuthService
userLogin(email: string, password: string): Observable<LoginResponse> {
  console.log("Login data:", { email, password });
  return this.http.post<LoginResponse>(`${this.baseUrl}/user/login`, { email, password },{ withCredentials: true });
}


}
