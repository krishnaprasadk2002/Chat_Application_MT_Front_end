import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ICreateNewChatSuccessfullAPIResponse } from '../Models/IChatResponses';
import { UserAPIEndUrl } from '../enum/apiEndUrls';
import { IMessage } from '../Models/IMessage';
import { userResponse } from '../Models/user.model';
import { SocketIoService } from './socket-io.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private httpClient: HttpClient = inject(HttpClient);
  private baseUrl: string = environment.baseUrl;

  constructor() { }
  private socketIoService = inject(SocketIoService)

  createNewChat(reciverId: string): Observable<ICreateNewChatSuccessfullAPIResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.CREATE_NEW_CHAT}`

    return this.httpClient.post<ICreateNewChatSuccessfullAPIResponse>(api, { reciverId }).pipe(
      catchError(error => {
        console.error('Error creating chat:', error);
        return throwError(error);
      })
    );
  }


  // Listen for new messages via WebSocket
  onNewMessage(): Observable<IMessage> {
    return this.socketIoService.on<IMessage>('receiveMessage');
}
  // Listen chat history
  onChatHistoryFetched(): Observable<IMessage[]> {
    return this.socketIoService.on<IMessage[]>('messagesFetched');
  }

  // Fetch chat history 
  fetchChatHistory(chatId: string): void {
    this.socketIoService.emit('fetchMessages', chatId);
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

  getUserId(): Observable<{ success: boolean; message: string; userId: string }> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.GET_USER_ID}`;
    return this.httpClient.get<{ success: boolean; message: string; userId: string }>(api).pipe(
      catchError(error => {
        console.error('Error getting userId', error);
        return throwError(error);
      })
    )
  }

  getReceiverDataProfile(userId: string): Observable<userResponse> {
    const api: string = `${this.baseUrl}${UserAPIEndUrl.GET_RECEIVER_PROFILE}`
    return this.httpClient.get<userResponse>(api, { params: { userId } }).pipe(
      catchError(error => {
        console.error('Error getting receiver data', error);
        return throwError(error);
      })
    );
  }



}
