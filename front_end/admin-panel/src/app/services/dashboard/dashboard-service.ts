import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  id: number;
  name: string;
  age: number;
  class_id: number;
  classroom?: { id: number; name: string };
  marks?: { id: number; marks: number; subject: { id: number; name: string } }[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = 'http://localhost:8000/api'; // Laravel API base URL

  constructor(private http: HttpClient) {}

  getStudents(search: string = '', page: number = 1, perPage: number = 10): Observable<any> {
    let url = `${this.baseUrl}/students?search=${search}&page=${page}&per_page=${perPage}`;
    return this.http.get<any>(url);
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/students/${id}`);
  }
}
