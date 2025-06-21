import express from 'express'
import { addComment,getCommentsByPost,updateComment,deleteComment} from '../controller/commentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router =  express.Router();

router.post('/', protect, addComment);
router.get('/post/:postId', getCommentsByPost);
router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);

export default router;