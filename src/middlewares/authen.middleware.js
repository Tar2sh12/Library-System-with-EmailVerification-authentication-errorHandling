// authentication middleware
// 1) export const auth = async ()=>{} when calling it => auth
// if want to send parameter probably this parameter will be sent request (we does not support that bec this parameter only related to the back-end)
//___________________________________________________________________________
// 2)
/**
 * 1- destruct the token from headers
 *
 */
import Author from "../../DB/models/Author.model.js";
import jwt from "jsonwebtoken";
export const auth = () => {
  return async (req, res, next) => {
    try {
      const { token } = req.headers;
      if (!token) {
        return res.status(400).json({ msg: "please sign in first" });
      }
      if (!token.startsWith("library")) {
        return res.status(400).json({ msg: "invalid token" });
      }
      const originalToken = token.split(" ")[1];
      //decode
      const decodedData = jwt.verify(originalToken, "accessToken");
      if (!decodedData?.authorId) {
        return res.status(400).json({ msg: "invalid token payload " });
      }
      //find author
      const author = await Author.findById(decodedData.authorId).select(
        "-password"
      );
      if (!author) {
        return res.status(404).json("please signUp and try to login ");
      }
      if(!author?.isConfirmed){
        return res.status(400).json("please go to your email and verify your account ");
      }
      req.authenAuthor = author;
      next(); // the parameters next recieves is errors only
    } catch (error) {
        console.log("error in auth middleware");
        res.status(500).json({ msg: "internal server error" });
    }
  };
};
// when calling it => auth()
// parameters sent in the parameters 3ady
