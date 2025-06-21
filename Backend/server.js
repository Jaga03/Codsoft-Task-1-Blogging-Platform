import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './lib/db.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import commentRoutes from './routes/comments.js'
import profileRoutes from './routes/profile.js'

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/comments',commentRoutes)
app.use('/api/profile',profileRoutes)

const port = process.env.PORT || 5000;

app.listen(port, () => {
   console.log(`The server is running at port ${port}`);
   
});
