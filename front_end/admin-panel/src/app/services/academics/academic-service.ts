import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../apiservice/api-service';

@Injectable({
  providedIn: 'root',
})
export class AcademicService {
  constructor(private api: ApiService) {}

  getCategories(): Observable<any> {
    return this.api.get(`categories`);
  }

  getCategory(id: number): Observable<any> {
    return this.api.get(`categories/${id}`);
  }

  createCategory(formData: FormData): Observable<any> {
    return this.api.post(`categories`, formData);
  }

  updateCategory(id: number, formData: FormData): Observable<any> {
    return this.api.put(`categories/${id}`, formData);
  }

  deleteCategory(id: number): Observable<any> {
    return this.api.delete(`categories/${id}`);
  }

  getPrograms(): Observable<any> {
    return this.api.get(`programs`);
  }

  getProgram(id: number): Observable<any> {
    return this.api.get(`programs/${id}`);
  }

  createProgram(formData: FormData): Observable<any> {
    return this.api.post(`programs`, formData);
  }

  updateProgram(id: number, formData: FormData): Observable<any> {
    return this.api.put(`programs/${id}`, formData);
  }

  deleteProgram(id: number): Observable<any> {
    return this.api.delete(`programs/${id}`);
  }

  getCurriculums(): Observable<any> {
    return this.api.get(`curriculums`);
  }

  getCurriculum(id: number): Observable<any> {
    return this.api.get(`curriculums/${id}`);
  }

  createCurriculum(formData: FormData): Observable<any> {
    return this.api.post(`curriculums`, formData);
  }

  updateCurriculum(id: number, formData: FormData): Observable<any> {
    return this.api.post(`curriculums/${id}`, formData);
  }

  deleteCurriculum(id: number): Observable<any> {
    return this.api.delete(`curriculums/${id}`);
  }

  getAcademics(): Observable<any> {
    return this.api.get(`academics`);
  }

  getAcademic(id: number): Observable<any> {
    return this.api.get(`academics/${id}`);
  }

  createAcademic(formData: FormData): Observable<any> {
    return this.api.post(`academics`, formData);
  }

  updateAcademic(id: number, formData: FormData): Observable<any> {
    return this.api.post(`academics/${id}`, formData);
  }

  deleteAcademic(id: number): Observable<any> {
    return this.api.delete(`academics/${id}`);
  }

  getSurveys(): Observable<any> {
    return this.api.get(`surveys`);
  }

  getSurvey(id: number): Observable<any> {
    return this.api.get(`surveys/${id}`);
  }

  createSurvey(formData: FormData): Observable<any> {
    return this.api.post(`surveys`, formData);
  }

  updateSurvey(id: number, formData: FormData): Observable<any> {
    return this.api.post(`surveys/${id}`, formData);
  }

  deleteSurvey(id: number): Observable<any> {
    return this.api.delete(`surveys/${id}`);
  }
}
