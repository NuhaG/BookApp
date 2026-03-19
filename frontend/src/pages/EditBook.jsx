import React, { useEffect, useMemo, useState } from 'react';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, getApiErrorMessage } from '../api/client';
import { resolveCoverImageSrc } from '../utils/images';
import { getToken } from '../utils/session';
import { GENRES } from '../utils/genres';
import NavBar from '../components/NavBar';

const EditBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [description, setDescription] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [genre, setGenre] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [chapterSaving, setChapterSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    setLoading(true);
    api
      .get(`/books/${id}`)
      .then((res) => {
        setAuthor(res.data.book.author);
        setTitle(res.data.book.title);
        setPublishedYear(res.data.book.publishedYear);
        setDescription(res.data.book.description || '');
        setCoverImg(res.data.book.coverImg || '');
        setGenre(Array.isArray(res.data.book.genre) ? res.data.book.genre : []);
        setChapters(Array.isArray(res.data.book.chapters) ? res.data.book.chapters : []);
      })
      .catch((err) => {
        console.log(err);
        alert(getApiErrorMessage(err, 'An error occurred while loading the book.'));
      })
      .finally(() => setLoading(false));
  }, [id, location.pathname, navigate]);

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

  const handleEditBook = () => {
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
      .patch(`/books/${id}`, formData)
      .then(() => {
        alert('Book updated successfully.');
      })
      .catch((err) => {
        alert(getApiErrorMessage(err, 'An error occurred while saving the book.'));
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const handlePublishChapter = () => {
    if (!getToken()) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    const numberValue = Number(chapterNumber);
    const payload = {
      title: chapterTitle,
      content: chapterContent,
      chapterNumber: Number.isNaN(numberValue) ? chapterNumber : numberValue,
    };

    setChapterSaving(true);
    api
      .post(`/books/${id}/chapters`, payload)
      .then((res) => {
        const nextChapters = Array.isArray(res.data?.book?.chapters) ? res.data.book.chapters : [];
        setChapters(nextChapters);
        setChapterTitle('');
        setChapterNumber('');
        setChapterContent('');
      })
      .catch((err) => {
        alert(getApiErrorMessage(err, 'Failed to publish chapter.'));
      })
      .finally(() => setChapterSaving(false));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)]">
        <NavBar />

        <div className="m-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Edit Book</h1>
        </div>

        {loading ? (
          <div className="mb-4 flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl rounded-lg border border-[var(--line)] bg-[var(--card-bg)] p-6 shadow-lg">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-4">
                <label className="text-sm text-[var(--text-soft)]">
                  Title
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Author
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Published Year
                  <input
                    type="text"
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Description (optional)
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Upload new cover image (optional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-[var(--text-soft)]">Max file size: 5MB.</p>
                </label>

                <label className="text-sm text-[var(--text-soft)]">
                  Or paste cover image URL (optional)
                  <input
                    type="text"
                    value={coverImg}
                    onChange={(e) => setCoverImg(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="https://..."
                  />
                </label>

                {previewSrc ? (
                  <div>
                    <p className="mb-2 text-sm text-[var(--text-soft)]">Cover preview</p>
                    <img
                      src={previewSrc}
                      alt="Cover preview"
                      className="h-44 w-32 rounded-md border border-[var(--line)] object-cover"
                    />
                  </div>
                ) : null}

                <label className="text-sm text-[var(--text-soft)]">
                  Genres (optional)
                  <select
                    multiple
                    value={genre}
                    onChange={(e) => setGenre(Array.from(e.target.selectedOptions).map((o) => o.value))}
                    className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[var(--text-soft)]">Hold Ctrl/Cmd to select multiple.</p>
                </label>
              </div>

              <div className="rounded-md border border-[var(--line)] bg-[var(--bg-muted)] p-4">
                <h2 className="mb-3 text-lg font-semibold text-[var(--text-main)]">Publish Chapter</h2>
                <div className="flex flex-col gap-3">
                  <label className="text-sm text-[var(--text-soft)]">
                    Chapter Number
                    <input
                      type="number"
                      min="1"
                      value={chapterNumber}
                      onChange={(e) => setChapterNumber(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </label>

                  <label className="text-sm text-[var(--text-soft)]">
                    Chapter Title
                    <input
                      type="text"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </label>

                  <label className="text-sm text-[var(--text-soft)]">
                    Chapter Content
                    <textarea
                      value={chapterContent}
                      onChange={(e) => setChapterContent(e.target.value)}
                      rows={8}
                      className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-2 text-[var(--text-main)] focus:border-[var(--accent)] focus:outline-none"
                    />
                  </label>

                  <button
                    onClick={handlePublishChapter}
                    disabled={chapterSaving}
                    className="w-full rounded-md bg-[var(--accent)] py-2 font-semibold text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
                  >
                    {chapterSaving ? 'Publishing...' : 'Publish Chapter'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-md border border-[var(--line)] bg-[var(--bg-muted)] p-4">
              <h3 className="mb-3 text-md font-semibold text-[var(--text-main)]">Published Chapters ({chapters.length})</h3>
              {chapters.length === 0 ? (
                <p className="text-sm text-[var(--text-soft)]">No chapters published yet.</p>
              ) : (
                <div className="space-y-2">
                  {chapters
                    .slice()
                    .sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber))
                    .map((chapter) => (
                      <div key={chapter._id} className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-3">
                        <p className="font-semibold text-[var(--text-strong)]">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <button
              onClick={handleEditBook}
              className="mt-6 w-full rounded-md bg-[var(--accent)] py-2 font-semibold text-[var(--text-inverse)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Save
            </button>
            <div className="mb-3 mt-4">
              <BackButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBook;




