import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  NNumber: String,
  Name: String,
  Email: String,
  Session: {type: String, default: null},
  SessionModality: String,
  AdmissionStatus: { type: String, default: "" },
  MatriculationStatus: { type: String, default: "" },
  UnityStatus: { type: String, default: "" },
  CourseraStatus: { type: String, default: "" },
  SurveyStatus: { type: String, default: "" }
});

// Create a table called 'Student', with our defined schemas
const Student = mongoose.model('Student', studentSchema);

// Export this table
export default Student;