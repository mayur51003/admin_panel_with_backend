import { Injectable } from '@angular/core';
import { ApiService } from '../apiservice/api-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AboutCollegeService {
  private endpoint = 'aboutCollege';
  private imageEndpoint = 'college-image';

  constructor(private api: ApiService) {}

  getAboutCollege(): Observable<any> {
    return this.api.get(`${this.endpoint}`);
  }

  createAboutCollege(formData: FormData): Observable<any> {
    return this.api.post(`${this.endpoint}`, formData);
  }

  updateAboutCollege(formData: FormData): Observable<any> {
    return this.api.post(`${this.endpoint}`, formData);
  }

  deleteCollegeImage(id: number): Observable<any> {
    return this.api.delete(`${this.imageEndpoint}/${id}`);
  }

  updateCollegeImage(id: number, formData: FormData): Observable<any> {
    return this.api.post(`${this.imageEndpoint}/${id}`, formData);
  }
}
