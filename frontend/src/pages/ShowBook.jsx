import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/backButton';
import Loader from '../components/Loader';

const ShowBook = () => {
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5555/books/${id}`)
      .then((response) => {
        setBook(response.data.book);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="p-5 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center md:text-left">
        Book Details
      </h1>

      {loading ? (
        <div className="flex justify-center mt-20">
          <Loader />
        </div>
      ) : book && book.title ? (
        <div className="bg-gray-800 border border-teal-500 rounded-xl p-6 shadow-lg max-w-xl mx-auto">
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-gray-400">ID</span>
              <p className="text-lg">{book._id}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Title</span>
              <p className="text-xl font-semibold text-teal-300">{book.title}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Author</span>
              <p className="text-lg">{book.author}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Published Year</span>
              <p className="text-lg">{book.publishedYear}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Created At</span>
              <p className="text-lg">{book.createdAt ? new Date(book.createdAt).toLocaleString() : '-'}</p>
            </div>
            <div>
              <span className="block text-sm text-gray-400">Last Updated</span>
              <p className="text-lg">{book.updatedAt ? new Date(book.updatedAt).toLocaleString() : '-'}</p>
            </div>
          </div>
          <div className="m-4 w-[50%] align-middle">
            <BackButton />
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-20">Book not found.</p>
      )}
    </div>
  );
};

export default ShowBook;
