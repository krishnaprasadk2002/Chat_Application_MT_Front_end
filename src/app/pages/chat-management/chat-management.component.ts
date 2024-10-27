import { Component, OnInit } from '@angular/core';
import { SocketIoService } from '../../core/services/socket-io.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../core/services/chat.service';
import { User, userResponse } from '../../core/Models/user.model';
import { IChatWithParticipantDetails } from '../../core/Models/IChat';
import { ICreateNewChatSuccessfullAPIResponse } from '../../core/Models/IChatResponses';
import { IMessage } from '../../core/Models/IMessage';
import { Subscription } from 'rxjs';

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
  currentUserId: string | undefined;
  currentChatId!: string;
  messages: IMessage[] = []; // Array to hold chat messages
  loading: boolean = false;
  private subscriptions: Subscription = new Subscription();
  chatHistory:any[] =[]

  constructor(
    private socketService: SocketIoService,
    private http: HttpClient,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.socketService.connected$.subscribe(connected => {
        this.isConnected = connected;
      })
    );

    this.getAllUsers();
    this.getUserId();
    this.ReceivingMessage()


    // // Listen for new messages
    // this.subscriptions.add(this.chatService.onNewMessage().subscribe(message => {
    //   console.log('New message received:', message);
    //   this.messages.push(message); 
    // }));

    // Listen for chat history
    this.subscriptions.add(this.chatService.onChatHistoryFetched().subscribe(messages => {
      console.log('Chat history fetched:', messages);
      this.messages = messages; 
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  createChat(receiverId: string): void {
    this.chatService.createNewChat(receiverId).subscribe({
      next: (response: ICreateNewChatSuccessfullAPIResponse) => {
        const chatId = response.data['_doc'].chatId;
        this.currentChatId = chatId;

        // Fetch chat history after creating the chat
        this.chatService.fetchChatHistory(chatId);
      },
      error: this.handleError
    });
  }

  sendMessage(): void {
    if (!this.Message || !this.selectedUserId || !this.currentChatId) {
      console.warn('Message, selected user, or current chat ID is missing.');
      return;
    }

    const messageData: IMessage = {
      chatId: this.currentChatId,
      senderId: this.currentUserId || '',
      receiverId: this.selectedUserId,
      message: this.Message,
      type: 'text',
      isRead: false,
      createdAt: new Date(),
    };

    // Emit WebSocket
    this.socketService.emit('sendMessage', messageData);
    console.log(messageData);
    this.Message = '';
  }

  ReceivingMessage() {
    this.socketService.on<IMessage>('receiveMessage').subscribe(message => {
      console.log('Received message on front-end:', message);
      this.messages.push(message);
    });
  }

    // // Fetch chat history via WebSocket
    // fetchChatHistory(chatId: string): void {
    //   this.socketService.emit('fetchMessages', chatId);
    // }

    receiveMessagesByChatId(){
      this.socketService.on('messagesFetched').subscribe(message =>{
        console.log('Received chatHistory message on front-end:', message);
        this.chatHistory.push(message)

      })
    }


  getAllUsers() {
    this.loading = true;
    this.chatService.GetAllUsers().subscribe(
      (response: userResponse) => {
        this.Users = response.data.filter(user => user._id !== undefined);
        this.loading = false;
      },
      (error) => {
        this.handleError(error);
        this.loading = false;
      }
    );
  }

  onUserClick(userId: string) {
    this.selectedUserId = userId;
    this.createChat(userId);

    this.chatService.getReceiverDataProfile(userId).subscribe({
      next: (res: userResponse) => {
        this.receiverData = Array.isArray(res.data) ? res.data : [res.data];
      },
      error: this.handleError
    });
  }

  getReceiverProfileData(chat: IChatWithParticipantDetails) {
    return chat.participantsData.find(participant => participant._id !== this.currentUserId) || null;
  }

  getUserId() {
    this.chatService.getUserId().subscribe({
      next: (res) => {
        if (res.success) {
          this.currentUserId = res.userId;
        } else {
          console.error('Failed to fetch user ID:', res.message);
        }
      },
      error: this.handleError
    });
  }

  private handleError(error: any): void {
    console.error('An error occurred:', error);
  }



}