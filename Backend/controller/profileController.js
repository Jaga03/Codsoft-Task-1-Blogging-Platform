import User from '../models/User.js';
import Post from '../models/Post.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ author: req.user.id }).sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
