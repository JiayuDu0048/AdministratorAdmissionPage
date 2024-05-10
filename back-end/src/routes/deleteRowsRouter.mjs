import Student from '../schemas/studentSchema.mjs';

const deleteRowsRouter = async(req, res) => {

  const { selectedNNumbers } = req.body;

    try {
        // Select documents where 'NNumber' is in the 'selectedNNumbers' array
        // const deletionResult = await Student.deleteMany({ NNumber: { $in: selectedNNumbers } });
        const softDeleteResult = await Student.updateMany(
            { NNumber: { $in: selectedNNumbers } },
            { $set: { deleted: true, deletedAt: new Date() } }
          );

        
        if (softDeleteResult.modifiedCount > 0) {
            res.status(200).json({ message: `${softDeleteResult.modifiedCount} rows marked as deleted.`  });

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
            const statusCompletion = await calculateStatusCompletion();    
            req.io.emit('status update', statusCompletion);

        } else {
            res.status(404).json({ message: "No rows found to delete." });
        }
    } catch (error) {
        console.error("Deletion error:", error);
        res.status(500).json({ message: "Internal server error during deletion." });
    }
}



async function calculateStatusCompletion() {
    try {
      const totalStudents = await Student.countDocuments({ deleted: false });
      const statusCompletion = await Student.aggregate([
        { $match: { deleted: false } },
        {
          $group: {
            _id: null,
            AdmissionCompleted: { $sum: { $cond: ["$AdmissionStatus", 1, 0] } },
            MatriculationCompleted: { $sum: { $cond: ["$MatriculationStatus", 1, 0] } },
            UnityCompleted: { $sum: { $cond: ["$UnityStatus", 1, 0] } },
            CourseraCompleted: { $sum: { $cond: ["$CourseraStatus", 1, 0] } },
            SurveyCompleted: { $sum: { $cond: ["$SurveyStatus", 1, 0] } }
          }
        }
      ]);
  
      // Convert counts to percentages
      if (statusCompletion.length > 0) {
        const result = statusCompletion[0];
        return [
          { id: 1, name: "Admission Status", percentValues: (result.AdmissionCompleted / totalStudents) * 100 },
          { id: 2, name: "Matriculation Status", percentValues: (result.MatriculationCompleted / totalStudents) * 100 },
          { id: 3, name: "Unity Status", percentValues: (result.UnityCompleted / totalStudents) * 100 },
          { id: 4, name: "Coursera Status", percentValues: (result.CourseraCompleted / totalStudents) * 100 },
          { id: 5, name: "Survey Status", percentValues: (result.SurveyCompleted / totalStudents) * 100 }
        ];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error calculating status completion:', error);
      throw error; // Rethrow to handle it in the calling context
    }
  }
  


export default deleteRowsRouter;