import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { Link } from 'react-router-dom';


const Table = ({books}) => {
    return (
        <table className="w-full border border-gray-700 rounded-lg overflow-hidden mt-4">
            <thead className="bg-gray-800 text-teal-300">
                <tr>
                    <th className="p-4 border-b border-gray-700">#</th>
                    <th className="p-4 border-b border-gray-700">Title</th>
                    <th className="p-4 border-b border-gray-700">Author</th>
                    <th className="p-4 border-b border-gray-700">Year</th>
                    <th className="p-4 border-b border-gray-700">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-gray-900 text-gray-200">
                {books.length > 0 ? (
                    books.map((book, index) => (
                        <tr
                            key={book._id}
                            className="hover:bg-gray-800 transition border-b border-gray-700"
                        >
                            <td className="p-4">{index + 1}</td>
                            <td className="p-4">{book.title}</td>
                            <td className="p-4">{book.author}</td>
                            <td className="p-4">{book.publishedYear}</td>
                            <td className="p-4">
                                <div className="flex flex-row justify-center gap-4 text-teal-400">
                                    <Link to={`/books/details/${book._id}`} className="hover:text-teal-300">
                                        <BsInfoCircle size={20} />
                                    </Link>
                                    <Link to={`/books/edit/${book._id}`} className="hover:text-teal-300">
                                        <AiOutlineEdit size={20} />
                                    </Link>
                                    <Link to={`/books/delete/${book._id}`} className="hover:text-red-400">
                                        <MdOutlineDelete size={20} />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="py-6 text-center text-teal-300">
                            No books available.{' '}
                            <Link to="/books/create" className="underline hover:text-teal-400">
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