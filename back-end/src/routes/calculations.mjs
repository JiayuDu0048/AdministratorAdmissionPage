import Student from "../schemas/studentSchema.mjs";

export const calculateSessionStats = async() => {
    return Student.aggregate([
        { $match: { Session: { $ne: null }, deleted: false } },
        {
          $group: {
            _id: "$Session",
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } } // Sort "1""2""3" in ascending order (_id:1)
      ]);
}



export const calculateStatusCompletion = async() => {
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
          }else {
          return [];
        }
      } catch (error) {
        console.error('Error fetching status completion rates:', error);
        throw new Error('Server Error in Calculating Status Completion');
      }
}



export const calculateMonthlyStats = async() => {
    const newAdditions = await Student.aggregate([
        { $match: { addedAt: { $exists: true }, deleted: false } },
        { 
            $group: {
                _id: { month: { $month: "$addedAt" }, year: { $year: "$addedAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const deletions = await Student.aggregate([
        { $match: { deletedAt: { $exists: true }, deleted: true } },
        { 
            $group: {
                _id: { month: { $month: "$deletedAt" }, year: { $year: "$deletedAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
   
    return { newAdditions, deletions};
}



export const updateBarStatsAndEmit = async (req) => {
    const activeStudentsCount = await Student.countDocuments({ deleted: false });
    const monthlyStats = await calculateMonthlyStats();

    // Emit the updated stats
    req.io.emit('update-stats', { totalStudents: activeStudentsCount, monthlyStats });
};