import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../apiservice/api-service';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  constructor(private api: ApiService) {}

  getDepartments(): Observable<any> {
    return this.api.get(`departments`);
  }

  getDepartment(id: number): Observable<any> {
    return this.api.get(`departments/${id}`);
  }

  createDepartment(formData: FormData): Observable<any> {
    return this.api.post(`departments`, formData);
  }

  updateDepartment(id: number, formData: FormData): Observable<any> {
    return this.api.post(`departments/${id}`, formData);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.api.delete(`departments/${id}`);
  }

  getAllHods(): Observable<any> {
    return this.api.get(`department-hods`);
  }

  createOrUpdateHod(departmentId: number, formData: FormData): Observable<any> {
    return this.api.post(`departments/${departmentId}/hod`, formData);
  }

  updateHod(departmentId: number, hodId: number, formData: FormData): Observable<any> {
    return this.api.post(`departments/${departmentId}/hod/${hodId}`, formData);
  }

  deleteHod(departmentId: number, hodId: number): Observable<any> {
    return this.api.delete(`departments/${departmentId}/hod/${hodId}`);
  }

  getPreviousHods(departmentId: number): Observable<any> {
    return this.api.get(`departments/${departmentId}/previous-hods`);
  }

  createPreviousHod(departmentId: number, data: any): Observable<any> {
    return this.api.post(`departments/${departmentId}/previous-hods`, data);
  }

  updatePreviousHod(departmentId: number, previousHodId: number, data: any): Observable<any> {
    return this.api.put(`departments/${departmentId}/previous-hods/${previousHodId}`, data);
  }

  deletePreviousHod(departmentId: number, previousHodId: number): Observable<any> {
    return this.api.delete(`departments/${departmentId}/previous-hods/${previousHodId}`);
  }

  getFaculties(departmentId: number): Observable<any> {
    return this.api.get(`departments/${departmentId}/faculties`);
  }

  createFaculty(departmentId: number, formData: FormData): Observable<any> {
    return this.api.post(`departments/${departmentId}/faculties`, formData);
  }

  updateFaculty(departmentId: number, facultyId: number, formData: FormData): Observable<any> {
    return this.api.post(`departments/${departmentId}/faculties/${facultyId}`, formData);
  }

  deleteFaculty(departmentId: number, facultyId: number): Observable<any> {
    return this.api.delete(`departments/${departmentId}/faculties/${facultyId}`);
  }

  getCourses(departmentId: number): Observable<any> {
    return this.api.get(`departments/${departmentId}/courses`);
  }

  createCourse(departmentId: number, data: any): Observable<any> {
    return this.api.post(`departments/${departmentId}/courses`, data);
  }

  updateCourse(departmentId: number, courseId: number, data: any): Observable<any> {
    return this.api.put(`departments/${departmentId}/courses/${courseId}`, data);
  }

  deleteCourse(departmentId: number, courseId: number): Observable<any> {
    return this.api.delete(`departments/${departmentId}/courses/${courseId}`);
  }

  getValueAddedPrograms(departmentId: number): Observable<any> {
    return this.api.get(`departments/${departmentId}/value-added-programs`);
  }

  createValueAddedProgram(departmentId: number, data: any): Observable<any> {
    return this.api.post(`departments/${departmentId}/value-added-programs`, data);
  }

  updateValueAddedProgram(departmentId: number, programId: number, data: any): Observable<any> {
    return this.api.put(`departments/${departmentId}/value-added-programs/${programId}`, data);
  }

  deleteValueAddedProgram(departmentId: number, programId: number): Observable<any> {
    return this.api.delete(`departments/${departmentId}/value-added-programs/${programId}`);
  }

  getImages(departmentId: number): Observable<any> {
    return this.api.get(`departments/${departmentId}/images`);
  }

  uploadImages(departmentId: number, formData: FormData): Observable<any> {
    return this.api.post(`departments/${departmentId}/images`, formData);
  }

  updateImage(departmentId: number, imageId: number, formData: FormData): Observable<any> {
    return this.api.post(`departments/${departmentId}/images/${imageId}`, formData);
  }

  deleteImage(departmentId: number, imageId: number): Observable<any> {
    return this.api.delete(`departments/${departmentId}/images/${imageId}`);
  }

  reorderImages(departmentId: number, data: any): Observable<any> {
    return this.api.post(`departments/${departmentId}/images/reorder`, data);
  }
}
