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
                className="bg-gray-900 text-white w-11/12 max-w-lg p-6 rounded-lg shadow-lg relative border border-teal-500"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <AiOutlineClose size={22} />
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <PiBookOpenTextLight size={28} className="text-teal-400" />
                    <h2 className="text-2xl font-semibold text-teal-300">{book.title}</h2>
                </div>
                <p className="flex items-center gap-2 text-gray-400">
                    <BiUserCircle size={20} /> Author: {book.author}
                </p>
                <p className="text-gray-500 text-sm mt-2">Year: {book.publishedYear}</p>

                <div className="mt-5">
                    <h3 className="text-lg font-semibold text-teal-300 mb-2">Description:</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit numquam eveniet
                        quisquam nam libero tempora dolorum quam reprehenderit nisi ex. Quia, esse.
                        Excepturi sapiente neque magnam sit dolores incidunt officiis!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookModel;
