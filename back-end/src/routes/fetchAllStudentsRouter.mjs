
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

export default router;
