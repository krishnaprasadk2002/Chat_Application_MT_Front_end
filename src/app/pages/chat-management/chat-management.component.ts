import { Component, OnInit } from '@angular/core';
import { SocketIoService } from '../../core/services/socket-io.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../core/services/chat.service';
import { response } from 'express';
import { User, userResponse } from '../../core/Models/user.model';
import { IChatWithParticipantDetails } from '../../core/Models/IChat';

@Component({
  selector: 'app-chat-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-management.component.html',
  styleUrl: './chat-management.component.css'
})
export class ChatManagementComponent implements OnInit {
  isConnected: boolean = false;
  Message!: string;
  Users: User[] = [];
  receiverData: User[] = [];
  selectedUserId: string | undefined;
  currentUserId:string | undefined

  constructor(private socketService: SocketIoService, private http: HttpClient, private chatService: ChatService) { }

  ngOnInit() {
    this.socketService.connected$.subscribe(connected => {
      this.isConnected = connected;
    });

    this.getAllUsers();
    this.getUserId(); 
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

    this.chatService.getReceiverDataProfile(userId).subscribe({
        next: (res: userResponse) => {
            // Ensure res.data is an array
            this.receiverData = Array.isArray(res.data) ? res.data : [res.data]; 
            console.log('Receiver Data:', this.receiverData);
        },
        error: (err: any) => {
            console.error('Error fetching receiver data', err);
        }
    });
}


  getReceiverProfileData(chat: IChatWithParticipantDetails) {
    const receiver = chat.participantsData.find(
      participant => participant._id !== this.currentUserId
    );
    if (!receiver) {
      console.warn('Receiver not found in participants data');
      return null; 
    }
    return receiver; 
  }
  

  getUserId() {
    this.chatService.getUserId().subscribe({
        next: (res) => {
            if (res.success) {
                this.currentUserId = res.userId; 
                console.log('Current User ID:', this.currentUserId);
            } else {
                console.error('Failed to fetch user ID:', res.message);
            }
        },
        error: (err: any) => {
            console.error('Error fetching User ID:', err);
        }
    });
}

}


