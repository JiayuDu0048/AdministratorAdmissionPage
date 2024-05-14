import dotenv from 'dotenv';
import "dotenv/config";

import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import url from 'url';
import path from 'path';
import cors from 'cors';

import morgan from 'morgan';
import mongoose from 'mongoose';  
import populateDataRouter from './routes/populateDataRouter.mjs';
import updateRouter from './routes/updateRouter.mjs';
import deleteRowsRouter from './routes/deleteRowsRouter.mjs';
import getStudentRouter from './routes/getStudentRouter.mjs';
import loginRouter from './routes/loginRouter.mjs';
import fetchAllStudentsRouter from './routes/fetchAllStudentsRouter.mjs'
import sessionStatsRouter from './routes/statsRouter.mjs';
import recoverRowsRouter from './routes/recoverRowsRouter.mjs';
import chatBoxRouter from './routes/chatBoxRouter.mjs';



const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
      origin: "*",  // Adjust as necessary for your setup
      methods: ["GET", "POST"]
  },
  path: '/socket.io' 
});


// serve static files
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
app.use("/static", express.static(path.join(__dirname, 'public')));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Print the OpenAI API key to verify it's loaded
console.log('API key from dotenv in app.mjs:', process.env.API_KEY);


// WebSocket setup
io.on('connection', (socket) => {
  console.log('A client connected with id:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middlewares
app.use(morgan("dev")); // morgan: log all incoming http requests
app.use(express.json()); // decode JSON-formatted incoming POST data
app.use(express.urlencoded({ extended: true })); // decode url-encoded incoming POST data



// cors
const corsOptions = {
  credentials: true,
  origin: process.env.CLIENT_URL.replace(/\/$/, ""),
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
}
app.use(cors(corsOptions));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB...');
  })
  .catch(err => console.error('Could not connect to MongoDB...', err));

 
// Routers
app.use('/api', updateRouter);
app.use('/api', getStudentRouter);
app.use('/api', sessionStatsRouter);
app.use('/api', recoverRowsRouter);
app.use('/api', chatBoxRouter);
app.use('/api/students', fetchAllStudentsRouter);
app.post('/populate/data', populateDataRouter);
app.delete('/delete/rows', deleteRowsRouter);
app.use('/auth', loginRouter); //for every HTTP request that matches the path /auth/*, it should use the loginRouter middleware to handle that request. 



export { server, app }; 