import express from 'express';
import fetch from 'node-fetch'; 
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const baseURL = "https://create.nyu.edu/dreamx/public/api";

router.post('/login', async (req, res) => {
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (response.ok) {
      // Set a cookie with the received token
      res.cookie('token', data.access_token, { httpOnly: true, maxAge: 86400000 }); // 1 day
      res.status(200).json({ success: true });
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
