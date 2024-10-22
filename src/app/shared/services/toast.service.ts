import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import IToastOption from '../../core/Models/Toast.model';


export const TOAST_STATE = {  
  success: 'success-toast',  
  warning: 'warning-toast',  
  danger: 'danger-toast'
};

@Injectable({  
  providedIn: 'root'
})

export class ToastService {  
  private toastOptionSubject: Subject<IToastOption> = new Subject<IToastOption>;
  
  toastOption$: Observable<IToastOption> = this.toastOptionSubject.asObservable();

  showToast(toastOption: IToastOption) {
    this.toastOptionSubject.next(toastOption);
  }
}