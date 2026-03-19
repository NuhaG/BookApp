import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { Link } from 'react-router-dom';


const Table = ({books}) => {
    return (
        <table className="w-full border border-[var(--line)] rounded-lg overflow-hidden mt-4">
            <thead className="bg-[var(--bg-surface-alt)] text-[var(--text-link)]">
                <tr>
                    <th className="p-4 border-b border-[var(--line)]">#</th>
                    <th className="p-4 border-b border-[var(--line)]">Title</th>
                    <th className="p-4 border-b border-[var(--line)]">Author</th>
                    <th className="p-4 border-b border-[var(--line)]">Year</th>
                    <th className="p-4 border-b border-[var(--line)]">Rating</th>
                    <th className="p-4 border-b border-[var(--line)]">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-[var(--card-bg)] text-[var(--text-main)]">
                {books.length > 0 ? (
                    books.map((book, index) => (
                        <tr
                            key={book._id}
                            className="hover:bg-[var(--bg-surface-alt)] transition border-b border-[var(--line)]"
                        >
                            <td className="p-4">{index + 1}</td>
                            <td className="p-4">{book.title}</td>
                            <td className="p-4">{book.author}</td>
                            <td className="p-4">{book.publishedYear}</td>
                            <td className="p-4">
                                {typeof book.ratingsAverage === "number"
                                    ? book.ratingsAverage.toFixed(1)
                                    : book.ratingsAverage || "-"}{" "}
                                <span className="text-[var(--text-soft)] text-xs">({book.ratingsQuantity ?? 0})</span>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-row justify-center gap-4 text-[var(--accent)]">
                                    <Link to={`/books/details/${book._id}`} className="hover:text-[var(--text-link)]">
                                        <BsInfoCircle size={20} />
                                    </Link>
                                    <Link to={`/books/edit/${book._id}`} className="hover:text-[var(--text-link)]">
                                        <AiOutlineEdit size={20} />
                                    </Link>
                                    <Link to={`/books/delete/${book._id}`} className="hover:text-[var(--danger)]">
                                        <MdOutlineDelete size={20} />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="py-6 text-center text-[var(--text-link)]">
                            No books available.{' '}
                            <Link to="/books/create" className="underline hover:text-[var(--accent)]">
                                Add one now
                            </Link>.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    )
}

export default Table

