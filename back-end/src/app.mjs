import express from 'express';
import url from 'url';
import path from 'path';
import multer from "multer";
import cors from 'cors';
import dotenv from 'dotenv';
import "dotenv/config"
import morgan from 'morgan';
import session from 'express-session';
import mongoose from 'mongoose';  
import passport from 'passport'
import populateDataRouter from './routes/populateDataRouter.mjs';
import updateRouter from './routes/updateRouter.mjs'
import deleteRowsRouter from './routes/deleteRowsRouter.mjs';
// import CustomJwtStrategy from './config/jwt-config.mjs';

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
app.post('/populate/data', populateDataRouter);
app.delete('/delete/rows', deleteRowsRouter);



// session to auto-save user data (like id) when they login
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized:true,
//   cookie: {httpOnly: true, secure: process.env.NODE_ENV==="production"}
// }))
// console.log('Session secret:', process.env.SESSION_SECRET);

// // jwt strategy
// passport.use(CustomJwtStrategy)
// // initialize passport
// app.use(passport.initialize())


export default app;