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
                        className="bg-[var(--bg-surface-alt)] border border-[var(--line)] rounded-lg shadow-lg p-5 flex flex-col justify-between hover:shadow-[0_0_22px_var(--accent)] transition"
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--text-link)]">{book.title}</h2>
                            <p className="text-[var(--text-soft)] mt-1">Author: {book.author}</p>
                            <p className="text-[var(--text-soft)] text-sm mt-1">Year: {book.publishedYear}</p>
                            <p className="text-[var(--text-soft)] text-sm mt-1">
                                Rating:{" "}
                                {typeof book.ratingsAverage === "number"
                                    ? book.ratingsAverage.toFixed(1)
                                    : book.ratingsAverage || "-"}
                                {" "}({book.ratingsQuantity ?? 0})
                            </p>
                            {Array.isArray(book.genre) && book.genre.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {book.genre.slice(0, 3).map((g) => (
                                        <span
                                            key={g}
                                            className="text-xs px-2 py-1 rounded-full bg-[var(--card-bg)] border border-[var(--line)] text-[var(--text-brand)]"
                                        >
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                        <div className="flex justify-end gap-4 text-[var(--accent)] mt-4">
                            <button
                                onClick={() => setShow(book)}
                                className="hover:text-[var(--text-link)]"
                                title="Quick View"
                            >
                                <BiShow size={22} />
                            </button>
                            <Link to={`/books/details/${book._id}`} className="hover:text-[var(--text-link)]" title="Details Page">
                                <BsInfoCircle size={22} />
                            </Link>
                            <Link to={`/books/edit/${book._id}`} className="hover:text-[var(--text-link)]" title="Edit Book">
                                <AiOutlineEdit size={22} />
                            </Link>
                            <Link to={`/books/delete/${book._id}`} className="hover:text-[var(--danger)]" title="Delete Book">
                                <MdOutlineDelete size={22} />
                            </Link>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center text-[var(--text-link)] py-8">
                    <p className="mb-2">No books available.</p>
                    <Link to="/books/create" className="underline hover:text-[var(--accent)]">
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

