import express from 'express';
import Student from '../schemas/studentSchema.mjs'; // Import Mongoose model

const router = express.Router();

router.get('/test', (req, res) => {
    res.send('Router is accessible');
  });

// Update email endpoint
router.post('/updateEmail', async (req, res) => { 
  
  const NNumber = Object.keys(req.body)[0];
  const newEmail = req.body[NNumber];

  try {
    const result = await Student.findOneAndUpdate({ NNumber }, { Email: newEmail }, { new: true });
    console.log('Update result:', result); // If null->cannot find this user.
    res.json(result); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update status endpoint
router.post('/updateStatus', async (req, res) => {
  const { NNumber, StatusName, newStatus } = req.body;
  try {
    const update = { [StatusName]: newStatus };
    const result = await Student.findOneAndUpdate({ NNumber }, update, { new: true });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
