import mongoose from 'mongoose';

const { Schema } = mongoose;

const QuestionSchema = new Schema({
  question: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'moderate'], required: true },
  marks: { type: Number, required: true },
  type: { type: String, enum: ['mcq', 'short', 'long', 'true_false'], required: true },
  options: [{ type: String }],
  answer: { type: String },
});

const SectionSchema = new Schema({
  title: { type: String, required: true },
  instruction: { type: String, required: true },
  questions: [QuestionSchema],
});

const GeneratedPaperSchema = new Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  sections: [SectionSchema],
  answerKey: [{ type: String }],
});

const AssignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    dueDate: { type: String, required: true },
    instructions: { type: String },
    uploadedFile: {
      name: { type: String },
      size: { type: Number },
      url: { type: String },
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
    },
    errorMessage: { type: String },
    generatedPaper: { type: GeneratedPaperSchema },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model('Assignment', AssignmentSchema);

// --- IN-MEMORY DB FALLBACK (for offline development and testing) ---
export class InMemoryDB {
  static assignments = [];

  static async find() {
    return [...this.assignments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async findById(id) {
    return this.assignments.find((a) => a._id === id) || null;
  }

  static async create(data) {
    const newAssignment = {
      _id: Math.random().toString(36).substring(2, 11),
      ...data,
      status: data.status || 'queued',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.assignments.push(newAssignment);
    return newAssignment;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const index = this.assignments.findIndex((a) => a._id === id);
    if (index === -1) return null;

    const updated = {
      ...this.assignments[index],
      ...update,
      updatedAt: new Date(),
    };

    if (update.generatedPaper) {
      updated.generatedPaper = {
        ...this.assignments[index].generatedPaper,
        ...update.generatedPaper,
      };
    }

    this.assignments[index] = updated;
    return updated;
  }

  static async findByIdAndDelete(id) {
    const index = this.assignments.findIndex((a) => a._id === id);
    if (index === -1) return null;
    const deleted = this.assignments.splice(index, 1);
    return deleted[0];
  }
}
