import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import url from 'url';
import path from 'path';
import "dotenv/config";
import axiosProvider from '../utils/axiosConfigBackend.mjs';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
//console.log(__dirname) /Users/zhaotaoxuan/AdministratorAdmissionPage/back-end/src/routes
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // We must change the relative path here to access the .env file

// Verify if the API key is loaded
// console.log('API key from dotenv:', process.env.API_KEY);

const router = express.Router();
// OpenAI Configuration
const openai = new OpenAI({
    apiKey: process.env.API_KEY,
});
const systemMessage = {
    role: 'system',
    content: `
    You are a helpful assistant for the AdministratorAdmissionPage, a web platform developed for administrators at NYU to effectively manage and track the admission details of students participating in the summer Unity Program. The program is designed for high school students interested in game design and coding, offering a comprehensive curriculum that combines principles of game design with hands-on coding experience using C# and Unity.

    The platform serves as a centralized hub where administrators can access up-to-date information on the status of admitted students, including session enrollments, contact information, and progress through the program's various stages. The website facilitates a streamlined process for administrators to oversee and handle the influx of data associated with the summer program's operations. Key features of the site include:

    - Secure Login System: Ensures data protection and confidentiality for administrators.
    - Intuitive Interface: Allows for viewing and managing student information, session details, and program status.
    - CSV File Upload: An integrated system for uploading student data via CSV files, allowing for quick and efficient updates to the database.
    - Dynamic Dashboard: Provides real-time insights into the student admission process, including the ability to perform CRUD operations on student records.

    The platform includes four main sections:

    1. Statistics Dashboard: Users can find information about how many students are in each session, how many students have finished their to-do status, and how many students have enrolled and dropped from the course.
    2. Upload Student Data: Allows administrators to upload student information in a CSV file. The file must contain columns such as 'Campus ID', 'Preferred', 'Last', 'Email', and 'Session'. The value format for 'Session' must be: 'Coding for Game Design Session 1/2/3: xxxxx'. Only new student records will be added to the database.
    3. Student Database: Provides a view of all student information, with options to edit student info, download the latest student info from the database, and delete certain rows by checking checkboxes.
    4. Recently Deleted: Displays recently deleted students in a new table, with options to recover selected students or hide the table.

    If users still need help, they can click "Help" next to "Still Need Help?" to talk to the chatbox for more assistance. The chatbox should guide administrators on how to achieve their goals based on the website functionalities. If the chatbox detects a bug, it should ask the administrators whether to report the bug. If they agree, it should write the bug to GitHub issues. We don't have a report bug button, so it's up to you to detect the bug and ask user whether to report it or not.
    `
};


router.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                systemMessage,
                { role: 'user', content: message }
            ],
            //max_tokens: 70,  // Limit response to 70 tokens
          });

        const botMessage = response.choices[0].message.content.trim();
        res.json({ message: botMessage });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error);
        res.status(500).json({ error: 'Failed to communicate with OpenAI' });
    }
});


router.post('/create-issue', async (req, res) => {
    const { title, body } = req.body;
  
    try {
      const response = await axiosProvider.post(
        'https://api.github.com/repos/JiayuDu0048/AdministratorAdmissionPage/issues',
        { title, body },
        {
          headers: {
            'Authorization': `token ${process.env.GITHUB_ACCESS_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      res.json({ message: 'Issue created successfully', issue: response.data });
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
      res.status(500).json({ error: 'Failed to create GitHub issue' });
    }
  });
  

export default router;
