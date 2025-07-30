import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { BiShow } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import BookModel from './BookModel';

const Card = ({ books }) => {
    const [show, setShow] = useState(null); // show will hold the selected book or null

    return (
        <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {books.length > 0 ? (
                books.map((book) => (
                    <div
                        key={book._id}
                        className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-5 flex flex-col justify-between hover:shadow-teal-500 transition"
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-teal-300">{book.title}</h2>
                            <p className="text-gray-400 mt-1">Author: {book.author}</p>
                            <p className="text-gray-400 text-sm mt-1">Year: {book.publishedYear}</p>
                        </div>
                        <div className="flex justify-end gap-4 text-teal-400 mt-4">
                            <button
                                onClick={() => setShow(book)}
                                className="hover:text-teal-300"
                                title="Quick View"
                            >
                                <BiShow size={22} />
                            </button>
                            <Link to={`/books/details/${book._id}`} className="hover:text-teal-300" title="Details Page">
                                <BsInfoCircle size={22} />
                            </Link>
                            <Link to={`/books/edit/${book._id}`} className="hover:text-teal-300" title="Edit Book">
                                <AiOutlineEdit size={22} />
                            </Link>
                            <Link to={`/books/delete/${book._id}`} className="hover:text-red-400" title="Delete Book">
                                <MdOutlineDelete size={22} />
                            </Link>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center text-teal-300 py-8">
                    <p className="mb-2">No books available.</p>
                    <Link to="/books/create" className="underline hover:text-teal-400">
                        Add one now
                    </Link>
                </div>
            )}

            {show && (
                <BookModel book={show} onClose={() => setShow(null)} />
            )}
        </div>
    );
};

export default Card;
