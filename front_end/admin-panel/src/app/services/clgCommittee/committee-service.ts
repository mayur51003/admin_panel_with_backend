import { Injectable } from '@angular/core';
import { ApiService } from '../apiservice/api-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommitteeService {
  constructor(private api: ApiService) {}

  getCommittees() {
    return this.api.get(`committees`);
  }

  getCommittee(id: number): Observable<any> {
    return this.api.get(`committees/${id}`);
  }

  createCommittee(formData: FormData): Observable<any> {
    return this.api.post(`committees`, formData);
  }

  updateCommittee(id: number, formData: FormData): Observable<any> {
    return this.api.post(`committees/${id}`, formData);
  }

  deleteCommittee(id: number): Observable<any> {
    return this.api.delete(`committees/${id}`);
  }

  getCommitteeMembers(): Observable<any> {
    return this.api.get(`committee-members`);
  }

  getCommitteeMember(id: number): Observable<any> {
    return this.api.get(`committee-members/${id}`);
  }

  createCommitteeMember(formData: FormData): Observable<any> {
    return this.api.post(`committee-members`, formData);
  }

  updateCommitteeMember(id: number, formData: FormData): Observable<any> {
    return this.api.post(`committee-members/${id}`, formData);
  }

  deleteCommitteeMember(id: number): Observable<any> {
    return this.api.delete(`committee-members/${id}`);
  }
}
