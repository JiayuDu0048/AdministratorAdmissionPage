// import User from "../models/User.mjs";
import jwt from 'jsonwebtoken';
import axios from 'axios';

const axiosMongoDB = axios.create({
  baseURL: process.env.MONGODB_DATA_API,
  headers: {
    'Content-Type': 'application/json',
    'api-key': process.env.MONGODB_API_KEY
  }
});

const deleteRouter = async(req, res) => {


  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Authorization token is missing" });
    }

    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.id;
    console.log(userID)

    // Find the user
    // const user = await User.findOne({ uuid: userID });
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }
    
    const findUserResponse = await axiosMongoDB.post('/action/find', {
      collection: 'users',
      database: 'bakerdb',
      dataSource: 'bakerdb',
      filter: { uuid: userID }
    });
    const user = findUserResponse.data.documents[0];
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // await User.deleteOne({ uuid: userID });
    await axiosMongoDB.post('/action/deleteOne', {
      collection: 'users',
      database: 'bakerdb',
      dataSource: 'bakerdb',
      filter: { uuid: userID }
    });
    
    res.status(200).json({ message: "Account successfully deleted" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid Token" });
    } else {
      res.status(500).json({ message: "Server error occurred", error });
    }
  }
}

export default deleteRouter;