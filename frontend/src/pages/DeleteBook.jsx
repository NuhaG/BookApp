import React, { useState } from 'react';
import BackButton from '../components/backButton';
import Loader from '../components/Loader';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const DeleteBook = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleDelete = () => {
    setLoading(true);
    axios
      .delete(`http://localhost:5555/books/${id}`)
      .then(() => {
        setLoading(false);
        navigate('/');
      })
      .catch((err) => {
        setLoading(false);
        alert('An Error Occurred while Deleting the book.');
        console.log(err);
      });
  };

  return (
    loading ? <Loader /> : (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-teal-400">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Delete Book</h1>
          <h3 className="text-lg mb-6">Are you sure you want to delete this book?</h3>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Delete
            </button>
            <BackButton />
          </div>
        </div>
      </div>)
  );
};

export default DeleteBook;
