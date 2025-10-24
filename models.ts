export interface Todo {
  id: string;
  listName: string;
  text?: string;
  completed?: boolean;
  reminder?: boolean;
  reminderDate?: Date | null;
}
