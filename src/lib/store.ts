
import { Flashcard, Topic, Folder, User } from "@/types";

// Mock data store - in a real app this would be replaced with API calls
class Store {
  private users: Map<string, User>;
  private topics: Map<string, Topic>;
  private flashcards: Map<string, Flashcard>;
  private folders: Map<string, Folder>;

  constructor() {
    this.users = new Map();
    this.topics = new Map();
    this.flashcards = new Map();
    this.folders = new Map();

    // Add admin user
    this.users.set("2023305700", {
      id: "2023305700",
      folders: [],
      sharedTopics: [],
      createdTopics: [],
      isAdmin: true,
    });

    // Add some sample data for demo purposes
    const exampleTopicId = "topic-1";
    const sampleTopic: Topic = {
      id: exampleTopicId,
      title: "Introduction to JavaScript",
      description: "Learn the basics of JavaScript programming language",
      isPublic: true,
      createdBy: "2023305700",
      createdAt: new Date(),
      flashcards: [],
    };

    const sampleFlashcards: Flashcard[] = [
      {
        id: "card-1",
        topicId: exampleTopicId,
        question: "What is JavaScript?",
        answer: "JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification.",
        createdBy: "2023305700",
        createdAt: new Date(),
      },
      {
        id: "card-2",
        topicId: exampleTopicId,
        question: "What is a variable?",
        answer: "A variable is a container for a value, like a number or a string.",
        createdBy: "2023305700",
        createdAt: new Date(),
      }
    ];

    this.topics.set(sampleTopic.id, sampleTopic);
    sampleFlashcards.forEach(card => this.flashcards.set(card.id, card));
    
    // Update the admin user's createdTopics
    const adminUser = this.users.get("2023305700");
    if (adminUser) {
      adminUser.createdTopics.push(exampleTopicId);
    }
  }

  // User management
  createUser(id: string): User {
    const newUser: User = {
      id,
      folders: [],
      sharedTopics: [],
      createdTopics: [],
      isAdmin: false,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Topic management
  createTopic(topic: Omit<Topic, "id" | "createdAt">): Topic {
    const id = `topic-${Date.now()}`;
    const newTopic: Topic = {
      ...topic,
      id,
      createdAt: new Date(),
      flashcards: [],
    };
    
    this.topics.set(id, newTopic);
    
    // Update user's createdTopics
    const user = this.users.get(topic.createdBy);
    if (user) {
      user.createdTopics.push(id);
    }
    
    return newTopic;
  }

  getTopic(id: string): Topic | undefined {
    return this.topics.get(id);
  }

  getUserTopics(userId: string): Topic[] {
    const user = this.users.get(userId);
    if (!user) return [];

    const topics: Topic[] = [];
    
    // Get created topics
    user.createdTopics.forEach(topicId => {
      const topic = this.topics.get(topicId);
      if (topic) topics.push(topic);
    });
    
    // Get shared topics
    user.sharedTopics.forEach(topicId => {
      const topic = this.topics.get(topicId);
      if (topic) topics.push(topic);
    });
    
    return topics;
  }

  getPublicTopics(): Topic[] {
    return Array.from(this.topics.values()).filter(topic => topic.isPublic);
  }

  updateTopic(topic: Topic): void {
    this.topics.set(topic.id, topic);
  }

  deleteTopic(id: string): boolean {
    // Find and remove all flashcards for this topic
    Array.from(this.flashcards.values())
      .filter(card => card.topicId === id)
      .forEach(card => this.flashcards.delete(card.id));
    
    // Remove topic from users' lists
    this.users.forEach(user => {
      user.createdTopics = user.createdTopics.filter(topicId => topicId !== id);
      user.sharedTopics = user.sharedTopics.filter(topicId => topicId !== id);
    });
    
    // Remove the topic itself
    return this.topics.delete(id);
  }

  // Flashcard management
  createFlashcard(flashcard: Omit<Flashcard, "id" | "createdAt">): Flashcard {
    const id = `card-${Date.now()}`;
    const newFlashcard: Flashcard = {
      ...flashcard,
      id,
      createdAt: new Date(),
    };
    
    this.flashcards.set(id, newFlashcard);
    
    // Add to topic's flashcards array
    const topic = this.topics.get(flashcard.topicId);
    if (topic) {
      topic.flashcards.push(newFlashcard);
    }
    
    return newFlashcard;
  }

  getFlashcard(id: string): Flashcard | undefined {
    return this.flashcards.get(id);
  }

  getFlashcardsByTopic(topicId: string): Flashcard[] {
    return Array.from(this.flashcards.values())
      .filter(card => card.topicId === topicId);
  }

  updateFlashcard(flashcard: Flashcard): void {
    this.flashcards.set(flashcard.id, flashcard);
    
    // Update in topic's flashcards array
    const topic = this.topics.get(flashcard.topicId);
    if (topic) {
      const index = topic.flashcards.findIndex(card => card.id === flashcard.id);
      if (index !== -1) {
        topic.flashcards[index] = flashcard;
      }
    }
  }

  deleteFlashcard(id: string): boolean {
    const flashcard = this.flashcards.get(id);
    if (!flashcard) return false;
    
    // Remove from topic's flashcards array
    const topic = this.topics.get(flashcard.topicId);
    if (topic) {
      topic.flashcards = topic.flashcards.filter(card => card.id !== id);
    }
    
    // Delete the flashcard
    return this.flashcards.delete(id);
  }

  // Folder management
  createFolder(folder: Omit<Folder, "id">): Folder {
    const id = `folder-${Date.now()}`;
    const newFolder: Folder = {
      ...folder,
      id,
    };
    
    this.folders.set(id, newFolder);
    
    // Add to user's folders
    const user = this.users.get(folder.createdBy);
    if (user) {
      user.folders.push(newFolder);
    }
    
    return newFolder;
  }

  getFolder(id: string): Folder | undefined {
    return this.folders.get(id);
  }

  getUserFolders(userId: string): Folder[] {
    const user = this.users.get(userId);
    if (!user) return [];
    return user.folders;
  }

  updateFolder(folder: Folder): void {
    this.folders.set(folder.id, folder);
    
    // Update in user's folders
    const user = this.users.get(folder.createdBy);
    if (user) {
      const index = user.folders.findIndex(f => f.id === folder.id);
      if (index !== -1) {
        user.folders[index] = folder;
      }
    }
  }

  deleteFolder(id: string): boolean {
    const folder = this.folders.get(id);
    if (!folder) return false;
    
    // Remove from user's folders
    const user = this.users.get(folder.createdBy);
    if (user) {
      user.folders = user.folders.filter(f => f.id !== id);
    }
    
    // Delete the folder
    return this.folders.delete(id);
  }

  // Sharing management
  shareTopic(topicId: string, userId: string): boolean {
    const topic = this.topics.get(topicId);
    const user = this.users.get(userId);
    
    if (!topic || !user) return false;
    
    if (!user.sharedTopics.includes(topicId)) {
      user.sharedTopics.push(topicId);
    }
    
    return true;
  }

  unshareTopicWithUser(topicId: string, userId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    
    user.sharedTopics = user.sharedTopics.filter(id => id !== topicId);
    return true;
  }
}

export const store = new Store();
