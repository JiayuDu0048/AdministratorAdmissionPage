import express from 'express';
import Student from '../schemas/studentSchema.mjs'; // Import Mongoose model


const router = express.Router();

const getStatus = (sessionStr) => {

    if (sessionStr == "1") {
      return "Online";
    } else if (sessionStr == "2") {
      return "In-person";
    } else if (sessionStr == "3") {
      return "In-person";
    } else {
      return "Unknown";
    }
  };

// Test whether the server reaches updateRouter.mjs
router.get('/test', (req, res) => {
    res.send('Router is accessible');
  });



// Update email endpoint
router.post('/updateEmail', async (req, res) => { 
  
  const NNumber = req.body[Object.keys(req.body)[0]];
  const newEmail = req.body[Object.keys(req.body)[1]]
  //console.log(NNumber, newEmail)

  try {
    const result = await Student.findOneAndUpdate({ NNumber }, { Email: newEmail }, { new: true });
    console.log('Update result:', result); // If null->cannot find this user.
    res.json(result); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Update all status + session endpoint
router.post('/updateStatus', async (req, res) => {
  const { NNumber, StatusName} = req.body;

  // Convert "Finished" or "Unfinished" to true or false
  let newStatus = req.body.newStatus;
  if (newStatus === "Finished") {
    newStatus = true;
  } else if (newStatus === "Unfinished") {
    newStatus = false;
  }

  try {
    const update = { [StatusName]: newStatus };
    const result = await Student.findOneAndUpdate({ NNumber }, update, { new: true });
    if(StatusName === "Session"){
        const modality = getStatus(newStatus);
        const update = {"SessionModality": modality };
        const result = await Student.findOneAndUpdate({ NNumber }, update, { new: true });

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
    }else {
      
      const statusCompletion = await calculateStatusCompletion();    
      console.log('Emitting status update:', statusCompletion);   
      req.io.emit('status update', statusCompletion);

    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




//Update only Unity Status Endpoint
router.post('/updateOnlyUnityStatus', async(req, res) => {
  //Include NNumber as a query param, http://localhost:3001/api/updateOnlyUnityStatus?NNumber= xxx
  const NNumber = req.query.NNumber;
  try{
    const update = {"UnityStatus": true}
    const result = await Student.findOneAndUpdate({ NNumber }, update, { new: true });
    res.json(result);
  }catch(error){
    res.status(500).json({ message: error.message });
  }
});



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



export default router;
