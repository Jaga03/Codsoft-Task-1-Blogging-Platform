import Post from '../models/Post.js';
import { v2 as cloudinary } from 'cloudinary';

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageUrl = req.file?.path || null;

    const post = new Post({
      title,
      content,
      image: imageUrl,
      author: req.user.id
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err.message);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.author) filter.author = req.query.author;
    if (req.query.date) {
      const start = new Date(req.query.date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const posts = await Post.find(filter)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    const posts = await Post.find({
      $or: [
        { title: new RegExp(q, 'i') },
        { content: new RegExp(q, 'i') }
      ]
    }).populate('author', 'username');
    res.json(posts);
  } catch (err) {
    console.error('Error searching posts:', err.message);
    res.status(500).json({ message: 'Search failed' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.file && post.image) {
      const publicId = post.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`blog_images/${publicId}`);
    }

    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    if (req.file?.path) post.image = req.file.path;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error('Error updating post:', err.message);
    res.status(500).json({ message: 'Update failed' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (post.image) {
      const publicId = post.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`blog_images/${publicId}`);
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err.message);
    res.status(500).json({ message: 'Delete failed' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: alreadyLiked ? 'Unliked' : 'Liked', likes: post.likes.length ,liked: !alreadyLiked});
  } catch (err) {
    console.error('Error toggling like:', err.message);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Error fetching single post:', err.message);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};
