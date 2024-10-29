import { AfterViewInit, Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SocketIoService } from '../../core/services/socket-io.service';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../core/services/chat.service';
import { User, userResponse } from '../../core/Models/user.model';
import { IChatWithParticipantDetails } from '../../core/Models/IChat';
import { ICreateNewChatSuccessfullAPIResponse } from '../../core/Models/IChatResponses';
import { IMessage } from '../../core/Models/IMessage';
import { Subject, Subscription } from 'rxjs';
import { log } from 'console';

@Component({
  selector: 'app-chat-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-management.component.html',
  styleUrl: './chat-management.component.css'
})
export class ChatManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  isConnected: boolean = false;
  Message!: string;
  Users: User[] = [];
  receiverData: User[] = [];
  selectedUserId: string | undefined;
  currentUserId: string | undefined;
  currentChatId!: string;
  messages: IMessage[] = []; 
  loading: boolean = false;
  private subscriptions: Subscription = new Subscription();
  chatHistory: IMessage[] = [];
  newGroupChatModal: boolean = false;
  isCreateGroupModalOpen: boolean = false;
  newGroupForm!: FormGroup;
  groupMembers: string[] = [];
  availableUsers: User[] = [];
  groupName!:string
  groupChats:any[]=[]
  isGroupChat: boolean = false;

  

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('createGroupModal') createGroupModal!: TemplateRef<any>;

 // Observable to track selected user changes
 private selectedUserSubject = new Subject<string>();

 constructor(
   private socketService: SocketIoService,
   private chatService: ChatService,
   private ngZone: NgZone 
 ) { 
   this.newGroupForm = new FormGroup({
     groupName: new FormControl("", [Validators.required])
   });
 }

 ngOnInit() {
  this.subscriptions.add(
    this.socketService.connected$.subscribe(connected => {
      this.isConnected = connected;
    })
  );

  // Subscribe to selected user changes
  this.subscriptions.add(
    this.selectedUserSubject.asObservable().subscribe((userId: string) => {
      this.onUserChange(userId);
    })
  );

  this.getAllUsers();
  this.getUserId();
  this.ReceivingMessage();
  this.getUsersDetailsUsingGroup()
  this.getUserGroupChats()

  // Listen for chat history
  this.subscriptions.add(
    this.chatService.onChatHistoryFetched().subscribe(messages => {
      console.log('Chat history fetched:', messages);
      this.chatHistory.push(...messages);
    })
  );
}
ngAfterViewInit(): void {
  this.scrollToBottom()
}

private scrollToBottom(): void {
  this.chatContainer?.nativeElement.scrollTo({
    top: this.chatContainer.nativeElement.scrollHeight,
    behavior: 'smooth'
  });
}


ngOnDestroy() {
  this.subscriptions.unsubscribe();
}


  // Call this method when a user is clicked
  onUserChange(userId: string) {
    this.selectedUserId = userId;
    this.messages = [];
    this.chatHistory = [];
    this.isGroupChat = false; 
    this.createChat(userId);
  

    // Fetch receiver profile
    this.chatService.getReceiverDataProfile(userId).subscribe({
      next: (res: userResponse) => {
        this.receiverData = Array.isArray(res.data) ? res.data : [res.data];
      },
      error: this.handleError
    });
  }

  createChat(receiverId: string): void {
    this.chatService.createNewChat(receiverId).subscribe({
      next: (response: ICreateNewChatSuccessfullAPIResponse) => {
        const chatId = response.data['_doc'].chatId;
        this.currentChatId = chatId;

        // Fetch chat history after creating the chat
        this.chatService.fetchChatHistory(chatId);
        this.joinChat(chatId);
      },
      error: this.handleError
    });
  }

  sendMessage(): void {
    if (!this.Message || !this.currentChatId) {
      console.warn('Message or chat ID is missing.');
      return;
    }
  
    const messageData: IMessage = {
      chatId: this.currentChatId,
      senderId: this.currentUserId || '',
      receiverId: this.isGroupChat ? '' : this.selectedUserId || '',
      message: this.Message,
      type: 'text',
      isRead: false,
      createdAt: new Date(),
    };
  
    if (this.isGroupChat) {
      // Emit group message
      this.socketService.emit('sendGroupMessage', messageData);
    } else {
      // Emit one-to-one message
      this.socketService.emit('sendMessage', messageData);
    }
  
    this.Message = ''; 
    this.scrollToBottom(); 
  }
  

  ReceivingMessage() {
    // Listening for one-to-one messages
    this.socketService.on<IMessage>('receiveMessage').subscribe(message => {
      if (message.chatId === this.currentChatId && !this.isGroupChat) {
        console.log('Received direct message:', message);
        this.chatHistory.push(message);
        this.scrollToBottom();
      }
    });
  
    // Listening for group messages
    this.socketService.on<IMessage>('receiveGroupMessage').subscribe(message => {
      if (message.chatId === this.currentChatId && this.isGroupChat) {
        console.log('Received group message:', message);
        this.chatHistory.push(message);
        this.scrollToBottom();
      }
    });
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

  getUserNameById(userId: string): string {
    const user = this.Users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  }

  getUserColor(userId: string): string {
    return userId === this.currentUserId ? 'green' : 'blue';
  }

  joinChat(chatId: string) {
    this.socketService.emit('join-chat', chatId)
  }

  trackByMessageId(index: number, message: IMessage): string {
    return message._id!;
  }


  //Group chat starting
  openOrCloseNewChatOrGroupChatModal() {
    this.ngZone.run(() => {
      this.isCreateGroupModalOpen = !this.isCreateGroupModalOpen;
      console.log(this.isCreateGroupModalOpen);
    });
  }

  addToGroupMember(userId: string) {
    const index = this.groupMembers.indexOf(userId);
    if (index === -1) {
      this.groupMembers.push(userId);
    } else {
      this.groupMembers.splice(index, 1);
    }
    console.log('Current group members:', this.groupMembers);
  }

  isInNewGroup(userId: string): boolean {
    return this.groupMembers.includes(userId);
  }

  createNewGroup() {

    this.groupMembers = this.availableUsers
        .filter(user => user.selected)
        .map(user => user._id)
        .filter((id): id is string => id !== undefined);
    
    console.log('Group Members:', this.groupMembers);

    if (this.groupMembers.length > 0 && this.groupName) { 
        this.chatService.createGroupChat(this.groupName, this.groupMembers).subscribe({
            next: (response) => {
                console.log('Group created:', response);
                this.resetGroupCreation();
            },
            error: (error) => {
                console.error('Error creating group:', error);
            }
        });
    } else {
        console.warn('No users selected for the group or group name is empty.');
    }
}

  
  
  

  private resetGroupCreation() {
    this.newGroupForm.reset();
    this.groupMembers = [];
    this.isCreateGroupModalOpen = false;
    this.newGroupChatModal = false;
    this.availableUsers = [];
    this.getAllUsers();
  }

  searchToStartOrCreateNewGroupChatOrChat(event: KeyboardEvent) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.availableUsers = this.Users.filter(user => 
      user.name.toLowerCase().includes(searchTerm)
    );
  }

  getUsersDetailsUsingGroup() {
    this.chatService.GetAllUsers().subscribe({
      next: (res: userResponse) => {
        console.log(res.data);
        
        this.availableUsers = res.data;
      },
      error: (err) => {
        console.error('Error fetching users', err);
      }
    });
  }

  userSelectingInGroup(user: User){
    if (user.selected) {
      console.log(`User selected: ${user.name}`);
    } else {
      console.log(`User deselected: ${user.name}`);
    }
  }

  getUserGroupChats() {
    this.chatService.getUserGroupChats().subscribe({
      next: (res: userResponse) => {
        this.groupChats = res.data; 
        console.log(this.groupChats);
        
      },
      error: this.handleError
    });
  }
  selectGroupChat(chatId: string) {
    this.currentChatId = chatId;
    this.groupSocketJoin(chatId)
    this.messages = [];
    this.chatHistory = [];
    this.isGroupChat = true; 
    
    this.chatService.fetchChatHistory(chatId);
    this.joinChat(chatId);
  }


  groupSocketJoin(chatId:string){
    console.log('join group chat Id',chatId);
    this.socketService.emit('joinGroupChat',chatId)
  }
  
  
}
