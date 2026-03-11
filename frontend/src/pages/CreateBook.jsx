import React, { useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '../api/client';
import { getToken } from '../utils/session';
import { GENRES } from '../utils/genres';
import NavBar from '../components/NavBar';

const CreateBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [description, setDescription] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [genre, setGenre] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [location.pathname, navigate]);

  const handleSaveBook = () => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    const year = Number(publishedYear);
    const data = {
      title,
      author,
      publishedYear: Number.isNaN(year) ? publishedYear : year,
      description,
      coverImg,
      genre,
    };
    setLoading(true);
    api
      .post('/books', data)
      .then(() => {
        setLoading(false);
        navigate('/');
      })
      .catch((err) => {
        setLoading(false);
        alert(getApiErrorMessage(err, 'An error occurred while saving the book.'));
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <NavBar />
      <div className="max-w-6xl mx-auto p-6">
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

          <label className="text-sm text-gray-300">
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-300">
            Cover image URL (optional)
            <input
              type="text"
              value={coverImg}
              onChange={(e) => setCoverImg(e.target.value)}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
              placeholder="https://..."
            />
          </label>

          <label className="text-sm text-gray-300">
            Genres (optional)
            <select
              multiple
              value={genre}
              onChange={(e) => setGenre(Array.from(e.target.selectedOptions).map((o) => o.value))}
              className="mt-1 w-full p-2 rounded-md bg-gray-900 border border-gray-700 focus:border-teal-400 focus:outline-none"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple.</p>
          </label>
        </div>

        <button
          onClick={handleSaveBook}
          className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-md transition-colors"
        >
          Save
        </button>
        <div className="m-4">
          <BackButton />
        </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBook;
