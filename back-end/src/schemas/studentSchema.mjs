import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  NNumber: String,
  Name: String,
  Email: String,
  Session: {type: String, default: null},
  SessionModality: String,
  AdmissionStatus: { type: Boolean, default: false },
  MatriculationStatus: { type: Boolean, default: false },
  UnityStatus: { type: Boolean, default: false },
  CourseraStatus: { type: Boolean, default: false },
  SurveyStatus: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  addedAt: { type: Date, default: Date.now }
});

// Create a table called 'Student', with our defined schemas
const Student = mongoose.model('Student', studentSchema);

// Export this table
export default Student;