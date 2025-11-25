export interface Todo {
  _id: string;
  userId: string;
  listName: string;
  text?: string;
  completed?: boolean;
  reminder?: boolean;
  reminderDate?: Date | null;
}
