// interfaces
import { IMessage, IMessagesGroupedByDate, IMessageWithSenderDetails } from "./IMessage";
import { User } from "./user.model";


export interface IChat {
    _id: string;
    chatId: string;
    participants: string[]; // User IDs
    type: "one-to-one" | "group";
    groupName?: string;
    groupProfilePicture?: {
        key: string | null,
        url: string
    };
    groupAdmin?: string;
    lastMessage: string;
    createdAt: Date;
}

export interface IChatWithParticipantDetails extends IChat {
    participantsData: User[];
    lastMessageData: IMessage;
    unReadMessages: number;
}

export interface IMessagesAndChatData {
    messages: IMessagesGroupedByDate[];
    chat: IChatWithParticipantDetails;
}