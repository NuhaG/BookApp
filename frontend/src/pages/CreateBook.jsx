import React, { useState } from 'react';
import BackButton from '../components/backButton';
import Loader from '../components/Loader';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSaveBook = () => {
    const data = { title, author, publishedYear };
    setLoading(true);
    axios
      .post('http://localhost:5555/books', data)
      .then(() => {
        setLoading(false);
        navigate('/');
      })
      .catch((err) => {
        setLoading(false);
        alert('An Error Occurred while Saving the book.');
        console.log(err);
      });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="mb-4">
        <BackButton />
      </div>

      <h1 className="text-3xl font-bold text-teal-400 mb-6 text-center md:text-left">
        Create Book
      </h1>

      {loading && (
        <div className="flex justify-center mb-4">
          <Loader />
        </div>
      )}

      <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg border border-teal-500">
        <div className="flex flex-col gap-4">
          <label className="text-sm text-gray-300">
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-300">
            Author
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-300">
            Published Year
            <input
              type="text"
              value={publishedYear}
              onChange={(e) => setPublishedYear(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
            />
          </label>
        </div>

        <button
          onClick={handleSaveBook}
          className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-md transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default CreateBook;
