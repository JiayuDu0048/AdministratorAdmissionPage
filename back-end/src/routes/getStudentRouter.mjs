import express from 'express';
import Student from '../schemas/studentSchema.mjs'; // Import Mongoose model

const router = express.Router();

// Endpoint to fetch a student record by NNumber
router.get('/getStudentRecord', async(req, res) => {
  const NNumber = req.query.NNumber;

  try{
    const studentRecord = await Student.findOne({NNumber});
    if(studentRecord){
        res.json(studentRecord);
    }else{
        res.status(404).send("Student not found");
    }
  }catch(error){
    res.status(500).json({message: error.message});
  }
});

export default router;