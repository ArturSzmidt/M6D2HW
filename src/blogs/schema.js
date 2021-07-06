import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const BlogsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    readTimeValue: {
      type: String,
      required: true,
    },
    readTimeUnit: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // adding createdAt and modifiedAt automatically
  }
);

export default model('Blog', BlogsSchema); // bounded to "users" collection
