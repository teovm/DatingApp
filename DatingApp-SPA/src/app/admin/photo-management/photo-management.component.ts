import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AdminService } from 'src/app/_services/admin.service';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.css']
})
export class PhotoManagementComponent implements OnInit {
  usersWithNewPhotos: any[];

  constructor(private adminService: AdminService, private alertify: AlertifyService) { }

  ngOnInit() {
    this.adminService
      .getPhotosForModeration()
      .subscribe(
        (res) => {
          this.usersWithNewPhotos = res;
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  approvePhoto(idPhoto: number, idUser: number) {
    this.adminService.approvePhoto(idPhoto)
    .subscribe(() => {
        this.removePhoto(idPhoto, idUser);
      },
      error => {
        this.alertify.error('Failed to delete the message');
      }
    );
  }

  rejectPhoto(idPhoto: number, idUser: number) {
    this.adminService.rejectPhoto(idPhoto)
    .subscribe(() => {
        this.removePhoto(idPhoto, idUser);
      },
      error => {
        this.alertify.error('Failed to delete the message');
      }
    );
  }

  private removePhoto(idPhoto: number, idUser: number) {
    const indexUser = this.usersWithNewPhotos.findIndex(u => u.idUser === idUser);
    const indexPhoto = this.usersWithNewPhotos[indexUser].photosForModeration.findIndex(p => p.id === idPhoto);
    this.usersWithNewPhotos[indexUser].photosForModeration.splice(indexPhoto, 1);

    console.log(this.usersWithNewPhotos[indexUser].photosForModeration);


    if (this.usersWithNewPhotos[indexUser].photosForModeration.length === 0) {
      this.usersWithNewPhotos.splice(indexUser, 1);
    }
  }
}
