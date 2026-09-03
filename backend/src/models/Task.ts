import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskComment {
  author: mongoose.Types.ObjectId | string;
  text: string;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  startDate?: Date | null;
  dueDate?: Date | null;
  assignee: mongoose.Types.ObjectId | string | null;
  creator: mongoose.Types.ObjectId | string;
  comments: ITaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ITaskComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Done'],
      default: 'Todo'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    startDate: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [commentSchema]
  },
  { timestamps: true }
);

export const Task = mongoose.model<ITask>('Task', taskSchema);
