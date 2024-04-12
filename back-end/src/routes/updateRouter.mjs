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

// Update all status endpoint
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
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//Update only Unity Status Endpoint
router.post('/updateOnlyUnityStatus', async(req, res) => {
  const { NNumber} = req.body;
  try{
    const update = {"UnityStatus": true}
    const result = await Student.findOneAndUpdate({ NNumber }, update, { new: true });
    res.json(result);
  }catch(error){
    res.status(500).json({ message: error.message });
  }
});


export default router;
