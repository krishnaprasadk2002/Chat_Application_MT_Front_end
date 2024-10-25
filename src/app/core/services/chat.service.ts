import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ICreateNewChatSuccessfullAPIResponse } from '../Models/IChatResponses';
import { UserAPIEndUrl } from '../enum/apiEndUrls';
import { IMessage } from '../Models/IMessage';
import { userResponse } from '../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl:string = environment.baseUrl;

  constructor() { }

  createNewChat(reciverId: string): Observable<ICreateNewChatSuccessfullAPIResponse>{
    const api:string =`${this.baseUrl}/${UserAPIEndUrl.CREATE_NEW_CHAT}`
  
    return this.httpClient.post<ICreateNewChatSuccessfullAPIResponse>(api,{reciverId}).pipe(
      catchError(error => {
        console.error('Error creating chat:', error);
        return throwError(error);
      })
    );
  }

  sendMessage(message: string): Observable<IMessage> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.SEND_MESSAGE}`;
    return this.httpClient.post<IMessage>(api, { message }).pipe(
      catchError(error => {
        console.error('Error sending message', error);
        return throwError(error);
      })
    );
  }


  GetAllUsers(): Observable<userResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.GET_ALL_USERS}`;
    return this.httpClient.get<userResponse>(api, { withCredentials: true }).pipe(
      catchError(error => {
        console.error('Error getting users', error);
        return throwError(error);
      })
    );
  }
  
  
}
