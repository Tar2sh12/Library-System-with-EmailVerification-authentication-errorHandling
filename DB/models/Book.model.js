import mongoose from "mongoose";
import { Schema, model } from "mongoose";
const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publishedDate: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true }
);
export default mongoose.models.Book || model("Book", bookSchema);
