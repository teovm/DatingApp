import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommService {
  editMemberFormDirty = new BehaviorSubject<boolean>(false);
  observableMemberEditFormDirty = this.editMemberFormDirty.asObservable();

  constructor() { }

  changeEditMemberFormDirty(dirty: boolean) {
    this.editMemberFormDirty.next(dirty);
  }
}
