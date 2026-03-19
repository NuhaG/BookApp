import React, { useEffect, useMemo, useState } from 'react';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '../api/client';
import { resolveCoverImageSrc } from '../utils/images';
import { getToken } from '../utils/session';
import { GENRES } from '../utils/genres';
import NavBar from '../components/NavBar';

const CreateBook = () => {
    const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [description, setDescription] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [genre, setGenre] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const previewSrc = useMemo(() => {
    if (coverFile && coverPreview) {
      return coverPreview;
    }
    return resolveCoverImageSrc(coverImg);
  }, [coverFile, coverImg, coverPreview]);

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }

    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      return;
    }

    setCoverFile(null);
    setCoverPreview('');
  };

  const handleSaveBook = () => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    const year = Number(publishedYear);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('publishedYear', Number.isNaN(year) ? publishedYear : String(year));
    formData.append('description', description);
    formData.append('coverImg', coverImg.trim());
    formData.append('genre', JSON.stringify(genre));
    if (coverFile) {
      formData.set('coverImg', coverFile);
    }

    setLoading(true);
    api
      .post('/books', formData)
      .then((res) => {
        setLoading(false);
        const createdId = res?.data?.book?._id;
        if (createdId) {
          navigate(`/books/edit/${createdId}`);
          return;
        }
        navigate('/my-books');
      })
      .catch((err) => {
        setLoading(false);
        alert(getApiErrorMessage(err, 'An error occurred while saving the book.'));
        console.log(err);
      });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[0_8px_26px_rgba(0,0,0,0.35)]">
        <NavBar />

        <div className="m-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Create Book</h1>
        </div>

        {loading && (
          <div className="flex justify-center mb-4">
            <Loader />
          </div>
        )}

        <div className="max-w-3xl mx-auto bg-[var(--card-bg)] p-6 rounded-lg shadow-lg border border-[var(--line)]">
          <div className="flex flex-col gap-4">
            <label className="text-sm text-[var(--text-soft)]">
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full p-2 rounded-md bg-[#0b1220] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
              />
            </label>

            <label className="text-sm text-[var(--text-soft)]">
              Author
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 w-full p-2 rounded-md bg-[#0b1220] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
              />
            </label>

            <label className="text-sm text-[var(--text-soft)]">
              Published Year
              <input
                type="text"
                value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                className="mt-1 w-full p-2 rounded-md bg-[#0b1220] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
              />
            </label>

            <label className="text-sm text-[var(--text-soft)]">
              Description (optional)
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full p-2 rounded-md bg-[#0b1220] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
              />
            </label>

            <label className="text-sm text-[var(--text-soft)]">
              Upload cover image (optional)
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="mt-1 w-full p-2 rounded-md bg-[#0b1220] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
              />
              <p className="text-xs text-[var(--text-soft)] mt-1">Max file size: 5MB.</p>
            </label>

            <label className="text-sm text-[var(--text-soft)]">
              Or paste cover image URL (optional)
              <input
                type="text"
                value={coverImg}
                onChange={(e) => setCoverImg(e.target.value)}
                className="mt-1 w-full p-2 rounded-md bg-[#0b1220] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="https://..."
              />
            </label>

            {previewSrc ? (
              <div>
                <p className="text-sm text-[var(--text-soft)] mb-2">Cover preview</p>
                <img
                  src={previewSrc}
                  alt="Cover preview"
                  className="w-32 h-44 object-cover rounded-md border border-[var(--line)]"
                />
              </div>
            ) : null}

            <label className="text-sm text-[var(--text-soft)]">
              Genres (optional)
              <select
                multiple
                value={genre}
                onChange={(e) => setGenre(Array.from(e.target.selectedOptions).map((o) => o.value))}
                className="mt-1 w-full p-2 rounded-md bg-[#0b1220] border border-[var(--line)] focus:border-[var(--accent)] focus:outline-none"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--text-soft)] mt-1">Hold Ctrl/Cmd to select multiple.</p>
            </label>
          </div>

          <button
            onClick={handleSaveBook}
            className="w-full mt-6 bg-[var(--accent)] hover:bg-blue-500 text-white font-semibold py-2 rounded-md transition-colors"
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


