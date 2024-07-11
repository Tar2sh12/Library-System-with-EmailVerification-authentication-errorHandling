import mongoose from "mongoose";
import { Schema, model } from "mongoose";
const authorSchema = new Schema(
  {
    email:{
      type:String,
      required:true,
      unique:true
    },
    password:{
      type:String,
      required:true
    },
    bio: String,
    bdate: Date,
    books: [
      {
        type: Schema.Types.ObjectId,
        default: [],
        ref: "Book",
      },
    ],
    isConfirmed:{
      type:Boolean,
      default:false
    },

  },
  { timestamps: true }
);
export default mongoose.models.Author || model("Author", authorSchema);
