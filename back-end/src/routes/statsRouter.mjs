import express from 'express';
import Student from '../schemas/studentSchema.mjs';

const router = express.Router();

// Endpoint to fetch the number of students per session
router.get('/session-stats', async (req, res) => {
  try {
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
    res.json(sessionStats);
  } catch (error) {
    console.error('Error fetching session statistics:', error);
    res.status(500).send('Server error');
  }
});



// Endpoint to fetch the number of finished status per status
router.get('/status-completion', async (req, res) => {
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
        res.json({
          data: [
            { id: 1, name: "Admission Status", percentValues: (result.AdmissionCompleted / totalStudents) * 100 },
            { id: 2, name: "Matriculation Status", percentValues: (result.MatriculationCompleted / totalStudents) * 100 },
            { id: 3, name: "Unity Status", percentValues: (result.UnityCompleted / totalStudents) * 100 },
            { id: 4, name: "Coursera Status", percentValues: (result.CourseraCompleted / totalStudents) * 100 },
            { id: 5, name: "Survey Status", percentValues: (result.SurveyCompleted / totalStudents) * 100 }
          ]
        });
      } else {
        res.json({ data: [] });
      }
    } catch (error) {
      console.error('Error fetching status completion rates:', error);
      res.status(500).send('Server error');
    }
  });
  

  router.get('/monthly-stats', async (req, res) => {
    try {
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

        res.json({ newAdditions, deletions });
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        res.status(500).send('Server error');
    }
});


export default router;
