import mongoose from "mongoose";
export const db_connection = async ()=>{
    try {
         await mongoose.connect("mongodb://localhost:27017/library-email-auth")
        console.log("connected successfully ");
    } catch (error) {
        console.log("Error in db connection");
    }
}