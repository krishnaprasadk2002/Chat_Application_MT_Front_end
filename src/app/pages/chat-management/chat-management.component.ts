import { Component, OnInit } from '@angular/core';
import { SocketIoService } from '../../core/services/socket-io.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../core/services/chat.service';
import { response } from 'express';
import { User,userResponse } from '../../core/Models/user.model';

@Component({
  selector: 'app-chat-management',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './chat-management.component.html',
  styleUrl: './chat-management.component.css'
})
export class ChatManagementComponent implements OnInit {
  isConnected: boolean = false;
  Message!: string;
  Users: User[] = [];
  selectedUserId: string | null = null;

  constructor(private socketService: SocketIoService, private http: HttpClient, private chatService: ChatService) {}

  ngOnInit() {
      this.socketService.connected$.subscribe(connected => {
          this.isConnected = connected;
      });

      this.getAllUsers();
  }

  sendMessage() {
      this.chatService.sendMessage(this.Message).subscribe(
          response => {
              console.log('Message sent successfully', response);
              this.Message = ''; 
          },
          error => {
              console.error('Error sending message', error);
          }
      );
  }

  getAllUsers() {
      this.chatService.GetAllUsers().subscribe(
          (response: userResponse) => {
              console.log('Fetched users:', response); 
              this.Users = response.data.filter(user => user._id !== undefined);
              console.log(this.Users);
              
          },
          (error: any) => {
              console.error('Error fetching users', error);
          }
      );
  }

  onUserClick(userId: string) {
      this.selectedUserId = userId; 
      console.log('Selected User ID:', this.selectedUserId);
  }
}