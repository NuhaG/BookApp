import { AiOutlineClose } from "react-icons/ai";
import { PiBookOpenTextLight } from "react-icons/pi";
import { BiUserCircle } from "react-icons/bi";

const BookModel = ({ book, onClose }) => {
    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-opacity-60 backdrop-blur-lg flex justify-center items-center z-50"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--card-bg)] text-[var(--text-inverse)] w-11/12 max-w-lg p-6 rounded-lg shadow-lg relative border border-[var(--accent)]"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-soft)] hover:text-[var(--text-inverse)]"
                >
                    <AiOutlineClose size={22} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <PiBookOpenTextLight size={28} className="text-[var(--accent)]" />
                    <h2 className="text-2xl font-semibold text-[var(--text-link)]">{book.title}</h2>
                </div>
                <p className="flex items-center gap-2 text-[var(--text-soft)]">
                    <BiUserCircle size={20} /> Author: {book.author}
                </p>
                <p className="text-[var(--text-muted-2)] text-sm mt-2">Year: {book.publishedYear}</p>
                <p className="text-[var(--text-muted-2)] text-sm mt-2">
                    Rating:{" "}
                    {typeof book.ratingsAverage === "number"
                        ? book.ratingsAverage.toFixed(1)
                        : book.ratingsAverage || "-"}{" "}
                    ({book.ratingsQuantity ?? 0})
                </p>
                {Array.isArray(book.genre) && book.genre.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {book.genre.map((g) => (
                            <span
                                key={g}
                                className="text-xs px-2 py-1 rounded-full bg-[var(--overlay-dim)] border border-[var(--line)] text-[var(--text-brand)]"
                            >
                                {g}
                            </span>
                        ))}
                    </div>
                ) : null}

                <div className="mt-5">
                    <h3 className="text-lg font-semibold text-[var(--text-link)] mb-2">Description:</h3>
                    <p className="text-[var(--text-main)] text-sm leading-relaxed">
                        {book.description ? book.description : "No description provided."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookModel;

