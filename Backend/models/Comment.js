import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, minlength: 1, maxlength: 1000 },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId'
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
