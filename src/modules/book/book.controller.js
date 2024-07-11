import Book from "./../../../DB/models/Book.model.js";
import Author from "./../../../DB/models/Author.model.js";
import { ErrorClass } from "../../utils/error-class.utils.js";
export const addBook = async (req, res, next) => {
    const { title, content, author, publishedDate } = req.body;
    const users = await Author.find().countDocuments();
    if (!users) {
      return res.status(404).json({ msg: "there is no authors to asign this book to" });
    }

    const isAuthorFound = await Author.findOne({ email: author });
    if (!isAuthorFound) {
      return res.status(404).json({ msg: "no author exists with this email" });
    }
    const instanceOfBook = new Book({
      title,
      content,
      author,
      publishedDate,
    });
    isAuthorFound.books.push(instanceOfBook._id);
    const authorFound = await isAuthorFound.save();
    const book = await instanceOfBook.save();

    res.status(201).json({ msg: "book created ", book: book });

};

export const updateBook = async (req, res, next) => {

    const { title } = req.body;
    const { id } = req.params;
    const bookFound = await Book.findById(id);
    if (!bookFound) {
      return res.status(404).json({ msg: "book not found" });
    }
    bookFound.title = title;
    const newBook = await bookFound.save();
    res.json(newBook);

};

//special API to chanllenge myself
//API for switching from author to another
export const updateBookAuthor = async (req, res, next) => {

    const { author } = req.body;
    const { id } = req.params;
    const bookFound = await Book.findById(id);
    if (!bookFound) {
      return res.status(404).json({ msg: "book not found" });
    }
    const oldAuthor = await Author.findOne({ email: bookFound.author });
    const newAuthor = await Author.findOne({ email: author });
    if (!newAuthor) {
      return res
        .status(404)
        .json({ msg: "author u want to switch to does not exist" });
    }
    // find index of objectId of this book
    const found = oldAuthor.books.indexOf(id);
    //remove book from old author's array
    oldAuthor.books.splice(found, 1);
    //add book for new author's array
    newAuthor.books.push(bookFound._id);
    //update name of author in book document
    bookFound.author = author;
    await newAuthor.save();
    await oldAuthor.save();
    const newBook = await bookFound.save();
    res.status(200).json({ msg: newBook });

};
export const deleteBook = async (req, res, next) => {

    const { id } = req.params;
    const bookFound = await Book.findById(id);
    if (!bookFound) {
      return res.status(404).json({ msg: "book not found" });
    }
    const oldAuthor = await Author.findOne({ email: bookFound.author });
    const found = oldAuthor.books.indexOf(id);
    oldAuthor.books.splice(found, 1);
    await oldAuthor.save();
    const book = await Book.deleteOne({ _id: id }); // returns deleted count
    res.json(book);

};

export const getAllBooks = async (req, res, next) => {

    const { email } = req.authenAuthor;
    const books = await Book.find({ author: email }).limit(5);
    res.status(200).json(books);

};

export const getABook = async (req, res, next) => {
    const { id } = req.params;
    const book = await Book.findById(id);
    if(!book){
      return next(
        new ErrorClass(
          "Not Found",
          404,
          "Book not found."
        )
      );
    }
    res.json(book);

};

export const search = async (req, res, next) => {

    const { search } = req.body;
    const result = await Book.find({
      $or: [
        { title: { $regex: search, $options: "i" } }, // for making it case insensitive search
        { author: { $regex: search, $options: "i" } },
      ],
    });
    res.json({ msg: result });

};
