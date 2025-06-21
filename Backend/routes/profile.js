import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile } from '../controller/profileController.js';

const router = express.Router();

router.get('/', protect, getProfile);

export default router;
