export type TaskStatus = 'Todo' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskItem = {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string | null;
  dueDate?: string | null;
  assignee?: { _id?: string; name?: string; email?: string } | null;
  creator?: { _id?: string; name?: string; email?: string } | null;
  comments?: Array<{ _id?: string; text: string; author?: { name?: string } }>; 
  createdAt?: string;
  updatedAt?: string;
};
