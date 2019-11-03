import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { User } from 'src/app/_models/user';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/_services/user.service';
import { AuthService } from 'src/app/_services/auth.service';
import { CommService } from 'src/app/_services/comm.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit, OnDestroy {
  @ViewChild('editForm', {static: true}) editForm: NgForm;
  subscription: Subscription;
  user: User;
  photoUrl: string;
  editFormDirty: boolean;
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.editForm.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(private route: ActivatedRoute, private alertify: AlertifyService, private userService: UserService,
    private authService: AuthService, private commService: CommService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    this.commService.observableMemberEditFormDirty.subscribe(editFormDirty => this.editFormDirty = editFormDirty);
    this.subscription = this.editForm.valueChanges.subscribe(() => {
      if (this.editForm.dirty && !this.editFormDirty) {
        this.commService.changeEditMemberFormDirty(true);
      }
    });
  }

  updateUser() {
    this.userService.updateUser(this.authService.decodedToken.nameid, this.user).subscribe(next => {
      this.alertify.success('Profile update succesfully');
      this.editForm.reset(this.user);
      this.commService.changeEditMemberFormDirty(false);
    }, error => {
      this.alertify.error('error');
    });
  }

  updateMainPhoto(photoUrl) {
    this.user.photoUrl = photoUrl;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.editFormDirty) {
      this.commService.changeEditMemberFormDirty(false);
    }
  }
}
