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
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5 text-[var(--text-main)]">
      <NavBar />
      {loading ? (
        <div className="flex justify-center mt-20">
          <Loader />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] p-6 flex items-center justify-center">
          <div className="bg-[var(--card-bg)] p-8 rounded-lg shadow-lg text-center border border-[var(--line)] w-full max-w-md">
            <h1 className="text-3xl font-bold text-red-400 mb-4">Delete Book</h1>
            <h3 className="text-lg mb-6 text-[var(--text-soft)]">Are you sure you want to delete this book?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-[#b43b41] hover:bg-[#9f2f35] text-white px-4 py-2 rounded-md"
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
