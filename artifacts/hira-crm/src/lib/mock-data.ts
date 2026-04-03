import { SiWhatsapp, SiFacebook, SiInstagram } from "react-icons/si";

export type Agent = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: 'admin' | 'agent';
  activeConversations: number;
  resolvedToday: number;
  rating: number;
};

export type Message = {
  id: string;
  sender: 'customer' | 'agent' | 'bot';
  content: string;
  timestamp: string;
};

export type Customer = {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  channel: 'whatsapp' | 'facebook' | 'instagram';
  tags: string[];
  totalConversations: number;
  lastSeen: string;
  notes: string;
};

export type Conversation = {
  id: string;
  customer: Pick<Customer, 'name' | 'avatar' | 'phone'>;
  channel: 'whatsapp' | 'facebook' | 'instagram';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  messages: Message[];
  assignedAgent: Agent | null;
  unreadCount: number;
  lastMessageAt: string;
};

export type Campaign = {
  id: string;
  name: string;
  channel: 'whatsapp' | 'facebook' | 'instagram';
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  sentAt: string | null;
  message: string;
  openRate: number;
  clickRate: number;
};

export function getChannelIcon(channel: 'whatsapp' | 'facebook' | 'instagram') {
  switch (channel) {
    case 'whatsapp': return SiWhatsapp;
    case 'facebook': return SiFacebook;
    case 'instagram': return SiInstagram;
    default: return SiWhatsapp;
  }
}

export function getChannelColor(channel: 'whatsapp' | 'facebook' | 'instagram') {
  switch (channel) {
    case 'whatsapp': return 'text-[#25D366]';
    case 'facebook': return 'text-[#1877F2]';
    case 'instagram': return 'text-[#E4405F]';
    default: return 'text-muted-foreground';
  }
}

export function getStatusColor(status: 'open' | 'pending' | 'resolved' | 'closed') {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    default: return 'bg-gray-100 text-gray-800';
  }
}
