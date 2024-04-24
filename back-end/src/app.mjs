import express from 'express';
import url from 'url';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import "dotenv/config";
import morgan from 'morgan';
import mongoose from 'mongoose';  
import populateDataRouter from './routes/populateDataRouter.mjs';
import updateRouter from './routes/updateRouter.mjs';
import deleteRowsRouter from './routes/deleteRowsRouter.mjs';
import getStudentRouter from './routes/getStudentRouter.mjs';
import loginRouter from './routes/loginRouter.mjs';

const app = express();

// Middlewares
app.use(morgan("dev")); // morgan: log all incoming http requests
app.use(express.json()); // decode JSON-formatted incoming POST data
app.use(express.urlencoded({ extended: true })); // decode url-encoded incoming POST data

// serve static files
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
app.use("/static", express.static(path.join(__dirname, 'public')));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
app.post('/populate/data', populateDataRouter);
app.delete('/delete/rows', deleteRowsRouter);
app.use('/auth', loginRouter); //for every HTTP request that matches the path /auth/*, it should use the loginRouter middleware to handle that request. 





export default app;