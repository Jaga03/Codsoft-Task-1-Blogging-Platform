import Comment from '../models/Comment.js';

export const addComment = async (req, res) => {
  try {
    const { text, postId, parentId = null } = req.body;

    const comment = new Comment({
      text,
      postId,
      parentId, // supports reply
      author: req.user.id
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error('Error adding comment:', err.message);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId, parentId: null })
      .populate('author', 'username')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username' },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    comment.text = text;
    await comment.save();
    res.json({ message: 'Comment updated', comment });
  } catch (err) {
    console.error('Error updating comment:', err.message);
    res.status(500).json({ message: 'Failed to update comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Comment.deleteMany({ parentId: comment._id }); 
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
