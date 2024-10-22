import { Component, OnInit } from '@angular/core';
import { SocketIoService } from '../../core/services/socket-io.service';

@Component({
  selector: 'app-chat-management',
  standalone: true,
  imports: [],
  templateUrl: './chat-management.component.html',
  styleUrl: './chat-management.component.css'
})
export class ChatManagementComponent implements OnInit {

  isConnected: boolean = false;

  constructor(private socketService:SocketIoService){}

  ngOnInit() {
    this.socketService.connected$.subscribe(connected => {
      this.isConnected = connected;
      console.log('Socket connection status:', this.isConnected);
    });
  }
  

}
