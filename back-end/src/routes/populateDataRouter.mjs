import Student from '../schemas/studentSchema.mjs';
import { calculateSessionStats, calculateStatusCompletion, updateBarStatsAndEmit } from './calculations.mjs';

// Populate all student info to db, and check whether each student already exists in db
const populateDataRouter = async (req, res) => {
    // console.log("Received data:", JSON.stringify(req.body, null, 2));
    const newStudents = [];
    const students = req.body;
    try{
        
        for(const student of students){
            const exist = await Student.findOne({NNumber: student.NNumber});
            if(!exist){
                newStudents.push(student);
            }
        }
        const insertedStudents = await Student.insertMany(newStudents); // Save into db

        // Update the stats in AreaCards by socket
        const sessionStats = await calculateSessionStats();
        const statusCompletion = await calculateStatusCompletion();
        
        await updateBarStatsAndEmit(req);   
        req.io.emit('update sessions', sessionStats);
        req.io.emit('status update', statusCompletion);

        res.status(201).send(insertedStudents);
    }catch(error){
        return res.status(400).json({message: "Error Parsing Data", error:error.message})
    }
}

export default populateDataRouter;