import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ICreateNewChatSuccessfullAPIResponse } from '../Models/IChatResponses';
import { UserAPIEndUrl } from '../enum/apiEndUrls';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl:string = environment.baseUrl;

  constructor() { }

  createNewChat(reciverId: string): Observable<ICreateNewChatSuccessfullAPIResponse>{
    const api:string =`${this.baseUrl}${UserAPIEndUrl.CREATE_NEW_CHAT}`
  
    return this.httpClient.post<ICreateNewChatSuccessfullAPIResponse>(api,{reciverId}).pipe(
      catchError(error => {
        console.error('Error creating chat:', error);
        return throwError(error);
      })
    );
  }
  
}
