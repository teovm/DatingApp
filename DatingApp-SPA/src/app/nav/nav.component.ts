import { Component, OnInit } from '@angular/core';
import { logging } from 'protractor';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
import { CommService } from '../_services/comm.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  photoUrl: string;
  editFormDirty: boolean;

  constructor(public authService: AuthService, private alertify: AlertifyService, private router: Router,
    private commService: CommService) { }

  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    this.commService.observableMemberEditFormDirty.subscribe(editFormDirty => this.editFormDirty = editFormDirty);
  }

  login() {
    this.authService.login(this.model).subscribe(next => {
      this.alertify.success('Logged in successfully');
    }, error => {
      this.alertify.error(error);
    },
    () => {
      this.router.navigate(['/members']);
    });
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
    if (!this.editFormDirty
        || (this.editFormDirty && confirm('Are you sure you want to continue? Any unsaved changes will be lost'))) {
      if (this.editFormDirty) {
        this.commService.changeEditMemberFormDirty(false);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      this.authService.decodedToken = null;
      this.authService.currentUser = null;
      this.alertify.message('logged out');
      this.router.navigate(['/home']);
    }
  }
}
