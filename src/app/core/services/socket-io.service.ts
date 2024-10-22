import { Injectable } from '@angular/core';
import socketio, { Socket } from "socket.io-client";
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketIoService {
  private socketio: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  constructor() {
    this.socketio = socketio(environment.baseUrl, {
      withCredentials: true
    });

    
    // Listen for the connection event
    this.socketio.on("connect_error", (err) => {
      console.log('error', err);
    });

    // Listen for the disconnect event
    this.socketio.on('disconnect', () => {
      this.connectedSubject.next(false);
      console.log('Disconnected from WebSocket server');
    });
  }

  emit<T>(event: string, payload: T) {
    this.socketio.emit(event, payload);
  }

  on<T>(event: string): Observable<T> {
    return new Observable<T>(observer => {
      this.socketio.on(event, (response: T) => {
        observer.next(response);
      });
    });
  }
}