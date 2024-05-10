
import express from 'express';
import Student from '../schemas/studentSchema.mjs';

const router = express.Router();

// Endpoint to fetch all students currently in the db, show them on the spreadsheet
router.get('/', async (req, res) => {
  try {
    const students = await Student.find(); // Fetches all students
    res.json(students); // Sends the list of students as a JSON response
  } catch (error) {
    console.error("Failed to retrieve students:", error);
    res.status(500).json({ message: "Error retrieving students from the database." });
  }
});


// Endpoint to fetch all students who are not deleted
router.get('/active-students', async (req, res) => {
  try {
    // Fetches all students where 'deleted' is either false or not set
    const activeStudents = await Student.find({ deleted: false });
    res.json(activeStudents); // Sends the list of active students as a JSON response
  } catch (error) {
    console.error("Failed to retrieve active students:", error);
    res.status(500).json({ message: "Error retrieving active students from the database." });
  }
});


export default router;
