import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserWithRoles() {
    return this.http.get(this.baseUrl + 'admin/usersWithRoles');
  }

  udpateUserRoles(user: User, roles: {}) {
    return this.http.post(this.baseUrl + 'admin/editRoles/' + user.username, roles);
  }

  getPhotosForModeration(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl + 'admin/photosForModeration');
  }

  approvePhoto(id: number) {
    return this.http.put(this.baseUrl + 'admin/approvePhoto/' + id, {});
  }

  rejectPhoto(id: number) {
    return this.http.delete(this.baseUrl + 'admin/rejectPhoto/' + id);
  }
}
