import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';
import { CommService } from '../_services/comm.service';

@Injectable({
  providedIn: 'root'
})
export class PreventUnsavedChangesGuard implements CanDeactivate<MemberEditComponent> {
  editFormDirty: boolean;

  constructor(private commService: CommService) {
    this.commService.observableMemberEditFormDirty.subscribe(editFormDirty => this.editFormDirty = editFormDirty);
  }

  canDeactivate(component: MemberEditComponent) {
    if (this.editFormDirty) {
      return confirm('Are you sure you want to continue? Any unsaved changes will be lost');
    }
    return true;
  }
}
