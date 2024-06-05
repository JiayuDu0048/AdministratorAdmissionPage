import express from 'express';
import Student from '../schemas/studentSchema.mjs';
import {  calculateSessionStats, calculateStatusCompletion, updateBarStatsAndEmit} from './calculations.mjs';


const router = express.Router();
router.post('/recover', async (req, res) => {
    const { NNumbers } = req.body; 
    try {
        // Update the 'deleted' field to false and reset 'deletedAt' for all provided NNumbers
        const result = await Student.updateMany(
            { NNumber: { $in: NNumbers } },
            { $set: { deleted: false, deletedAt: null } }
        );

        // Update the stats in AreaCards by socket
        const sessionStats = await calculateSessionStats();
        const statusCompletion = await calculateStatusCompletion();   
        
        await updateBarStatsAndEmit(req);
        req.io.emit('update sessions', sessionStats);
        req.io.emit('status update', statusCompletion);

        res.status(200).send(result);
    } catch (error) {
        console.error('Failed to recover rows:', error);
        res.status(500).send('Error recovering data');
    }
});

export default router;

