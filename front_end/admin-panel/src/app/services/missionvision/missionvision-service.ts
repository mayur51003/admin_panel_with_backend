import { Injectable } from '@angular/core';
import { ApiService } from '../apiservice/api-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MissionvisionService {
  private endpoint = 'mission-vision';

  constructor(private api: ApiService) {}

  getMissionVision(): Observable<any> {
    return this.api.get(`${this.endpoint}`);
  }

  storeOrUpdateMissionVision(formData: FormData): Observable<any> {
    return this.api.post(`${this.endpoint}`, formData);
  }
}
