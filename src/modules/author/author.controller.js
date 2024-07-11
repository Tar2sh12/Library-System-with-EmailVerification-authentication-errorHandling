import { hashSync, compareSync } from "bcrypt";
import Author from "./../../../DB/models/Author.model.js";
import Book from "./../../../DB/models/Book.model.js";
import jwt from "jsonwebtoken";
import { sendEmailService } from "../../services/send-email.services.js";
import { ErrorClass } from "../../utils/error-class.utils.js";
export const signUp = async (req, res, next) => {
  const { email, bio, bdate, password } = req.body;
  const isEmailExist = await Author.findOne({ email });
  if (isEmailExist) {
    return res.status(409).json({ message: "email already exists" }); // client error bec he entered wrong data that cause conflict with already existing data in the DB
  }
  // hashing password
  const hashedPassword = hashSync(password, 12);
  const instanceOfAuthor = new Author({
    email,
    bio,
    bdate,
    password: hashedPassword,
  });
  //generate token instead of sending _id
  const confirmationToken = jwt.sign(
    { author: instanceOfAuthor },
    "confirmTokenAccess",
    { expiresIn: "1h" }
  );
  // generate email confirmation link
  const confirmationLink = `${req.protocol}://${req.headers.host}/auhtor/confirmation/${confirmationToken}`;
  //sending email
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "welcome",
    // textMessage:"hamsolah bymsi 3alek mn gowa l back-end"
    htmlMessage: `<a href=${confirmationLink}>please verify your account</a>`,
  });
  if (isEmailSent.rejected.length) {
    return res
      .status(500)
      .json({ msg: "verification email sending is failed " });
  }
  //create author
  const author = await instanceOfAuthor.save();
  res.status(201).json({ msg: "author added ", author: author }); // created
};

export const verifyEmail = async (req, res, next) => {
  const { confirmationToken } = req.params;
  const data = jwt.verify(confirmationToken, "confirmTokenAccess");
  const confirmedAuthor = await Author.findOneAndUpdate(
    { _id: data?.author?._id, isConfirmed: false },
    { isConfirmed: true },
    { new: true }
  );
  if (!confirmedAuthor) {
    return res.status(404).json({ msg: "not confirmed" });
  }
  res
    .status(200)
    .json({ msg: "author email successfully confirmed ", confirmedAuthor });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const isEmailExist = await Author.findOne({ email });
  if (!isEmailExist) {
    return res.status(404).json({ message: "invalid Login credentials" }); //not found
  }
  //                          plain text ,    hashed
  const isMatch = compareSync(password, isEmailExist.password);
  if (!isMatch) {
    return res.status(404).json({ message: "invalid Login credentials" }); //not found
  }

  //generate token ---- 2 way encryption
  /**
   * things to be considered when generating tokens :
   * 1) data
   * 2) signature
   * 3) expiration date
   */
  const token = jwt.sign(
    { authorId: isEmailExist._id, email: isEmailExist.email },
    "accessToken",
    { expiresIn: "1h" }
  );
  //response
  res.status(200).json({ msg: "Login success", token });
};

export const getAllAuthors = async (req, res, next) => {
  const authors = await Author.find().populate([{ path: "books" }]);
  res.json(authors);
};

export const getAnAuthor = async (req, res, next) => {
  const { id } = req.params;
  const authors = await Author.findById(id);
  res.json(authors);
};
export const updateAuthor = async (req, res, next) => {
  const { email } = req.body;
  const { _id } = req.authenAuthor;
  const isNewAuthorExists = await Author.findOne({ email });
  if (!isNewAuthorExists) {
    return next(
      new ErrorClass(
        "this email does not exist",
        400,
        "this email does not exist"
      )
    );
  }
  const author = await Author.findById(_id);
  author.books.forEach(async (element) => {
    try {
      const bookFound = await Book.findById(element);
      bookFound.author = email;
      bookFound.save();
    } catch (error) {
      res.status(500).json({ msg: "internal server error" });
    }
  });
  author.email = email;
  const newAuthor = await author.save();
  res.json(newAuthor);
};
export const deleteAuthor = async (req, res, next) => {
  const { _id } = req.authenAuthor;
  const author = await Author.findById(_id);
  author.books.forEach(async (element) => {
    try {
      await Book.deleteOne({ _id: element });
    } catch (error) {
      res.status(500).json({ msg: "internal server error" });
    }
  });
  const authordeleted = await Author.deleteOne({ _id }); // returns deleted count
  res.json(authordeleted);
};

export const search = async (req, res, next) => {
  const { search } = req.body;
  const result = await Author.find({
    $or: [
      { email: { $regex: search, $options: "i" } }, // for making it case insensitive search
      { bio: { $regex: search, $options: "i" } },
    ],
  });
  res.json({ msg: result });
};
