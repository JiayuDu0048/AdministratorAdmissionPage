import Student from '../schemas/studentSchema.mjs';

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
        const sessionStats = await Student.aggregate([
            { $match: { Session: { $ne: null }, deleted: false } },
            {
              $group: {
                _id: "$Session",
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } } // Sort "1""2""3" in ascending order (_id:1)
          ]);
          
        req.io.emit('update sessions', sessionStats);

        res.status(201).send(insertedStudents);
    }catch(error){
        return res.status(400).json({message: "Error Parsing Data", error:error.message})
    }
}

export default populateDataRouter;