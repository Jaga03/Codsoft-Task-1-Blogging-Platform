import express from 'express';
import {
  createPost,
  getAllPosts,
  searchPosts,
  updatePost,
  deletePost,toggleLike,getPostById
} from '../controller/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();


router.post('/', protect, upload.single('image'), createPost);


router.get('/', getAllPosts);


router.get('/search', searchPosts);


router.put('/:id', protect, upload.single('image'), updatePost);


router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLike);

router.get('/:id', getPostById);
export default router;
