import express from 'express';
import { calculateMonthlyStats, calculateSessionStats, calculateStatusCompletion } from './calculations.mjs';

const router = express.Router();

// Endpoint to fetch the number of students per session
router.get('/session-stats', async (req, res) => {
  try {
    const sessionStats = await calculateSessionStats();
    res.json(sessionStats);
  } catch (error) {
    console.error('Error fetching session statistics:', error);
    res.status(500).send('Server error');
  }
});

// Endpoint to fetch the number of finished status per status
router.get('/status-completion', async (req, res) => {
    try {
      const statusCompletion =  await calculateStatusCompletion();
      res.json(statusCompletion);
      
    } catch (error) {
      console.error('Error fetching status completion rates:', error);
      res.status(500).send('Server error');
    }
  });
  
  // Endpoint to fetch monthly increase & loss
  router.get('/monthly-stats', async (req, res) => {
    try {
       const { newAdditions, deletions } = await calculateMonthlyStats();
        res.json({ newAdditions, deletions });
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        res.status(500).send('Server error');
    }
});



export default router;
