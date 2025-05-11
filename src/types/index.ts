
export interface Flashcard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  flashcards: Flashcard[];
}

export interface Folder {
  id: string;
  name: string;
  topics: string[]; // Topic IDs
  createdBy: string;
}

export interface User {
  id: string;
  folders: Folder[];
  sharedTopics: string[]; // Topic IDs
  createdTopics: string[]; // Topic IDs
  isAdmin: boolean;
}
