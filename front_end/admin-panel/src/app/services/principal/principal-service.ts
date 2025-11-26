import { Injectable } from '@angular/core';
import { ApiService } from '../apiservice/api-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrincipalService {
  private endpoint = 'principals';

  constructor(private api: ApiService) {}

  getPrincipals(): Observable<any> {
    return this.api.get(`${this.endpoint}`);
  }

  createPrincipal(formData: FormData): Observable<any> {
    return this.api.post(`${this.endpoint}`, formData);
  }

  deletePrincipal(id: number): Observable<any> {
    return this.api.delete(`${this.endpoint}/${id}`);
  }

  updatePrincipal(id: number, formData: FormData): Observable<any> {
    return this.api.post(`${this.endpoint}/${id}`, formData);
  }
}
