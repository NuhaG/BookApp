import React, { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, getApiErrorMessage } from '../api/client';
import { getToken } from '../utils/session';
import NavBar from '../components/NavBar';

const DeleteBook = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [location.pathname, navigate, token]);

  const handleDelete = () => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    setLoading(true);
    api
      .delete(`/books/${id}`)
      .then(() => {
        setLoading(false);
        navigate('/');
      })
      .catch((err) => {
        setLoading(false);
        alert(getApiErrorMessage(err, 'An error occurred while deleting the book.'));
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <NavBar />
      {loading ? (
        <div className="flex justify-center mt-20">
          <Loader />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-6 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-teal-400 w-full max-w-md">
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
        </div>
      )}
    </div>
  );
};

export default DeleteBook;
