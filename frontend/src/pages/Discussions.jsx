import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import NavBar from '../components/NavBar';
import { api, getApiErrorMessage } from '../api/client';
import { getToken, getUser } from '../utils/session';

const Discussions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = getUser();
    const currentUserId = currentUser?.id || currentUser?._id;

    const [book, setBook] = useState(null);
    const [threads, setThreads] = useState([]);
    const [messagesByThread, setMessagesByThread] = useState({});
    const [loading, setLoading] = useState(false);
    const [threadsLoading, setThreadsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});
    const [replyTarget, setReplyTarget] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingThread, setEditingThread] = useState(null);
    const [editThreadTitle, setEditThreadTitle] = useState('');
    const [editThreadContent, setEditThreadContent] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [editMessageText, setEditMessageText] = useState('');

    const token = getToken();

    const canModifyThread = (thread) => {
        if (!token) return false;
        return currentUser?.role === 'admin' || String(thread.createdBy?._id || thread.createdBy) === String(currentUserId);
    };

    const canModifyMessage = (message) => {
        if (!token) return false;
        return currentUser?.role === 'admin' || String(message.createdBy?._id || message.createdBy) === String(currentUserId);
    };

    const loadBook = useCallback(() => {
        setLoading(true);
        api
            .get(`/books/${id}`)
            .then((res) => setBook(res.data.book))
            .catch((err) => {
                console.log(err);
                alert(getApiErrorMessage(err, 'Failed to load book.'));
            })
            .finally(() => setLoading(false));
    }, [id]);

    const loadThreads = useCallback(() => {
        setThreadsLoading(true);
        api
            .get(`/books/${id}/threads`)
            .then((res) => {
                const loadedThreads = res.data?.data || [];
                setThreads(loadedThreads);
                setExpanded(
                    loadedThreads.reduce((acc, thread) => {
                        acc[thread._id] = true;
                        return acc;
                    }, {}),
                );
            })
            .catch((err) => {
                if (err?.code !== 'ERR_CANCELED') console.log(err);
            })
            .finally(() => setThreadsLoading(false));
    }, [id]);

    const loadThreadMessages = useCallback(
        async (threadId) => {
            try {
                const res = await api.get(`/books/${id}/threads/${threadId}/messages`);
                setMessagesByThread((prev) => ({ ...prev, [threadId]: res.data?.data || [] }));
            } catch (err) {
                if (err?.code !== 'ERR_CANCELED') console.log(err);
            }
        },
        [id],
    );

    useEffect(() => {
        loadBook();
        loadThreads();
    }, [loadBook, loadThreads]);

    useEffect(() => {
        Object.keys(expanded).forEach((threadId) => {
            if (expanded[threadId] && !messagesByThread[threadId]) {
                loadThreadMessages(threadId);
            }
        });
    }, [expanded, messagesByThread, loadThreadMessages]);

    const requireLogin = () => {
        navigate('/login', { replace: true, state: { from: location.pathname } });
    };

    const submitThread = async () => {
        if (!token) return requireLogin();
        if (!title.trim() || !content.trim()) {
            setError('Please provide both a title and content for the discussion.');
            return;
        }

        try {
            setError('');
            await api.post(`/books/${id}/threads`, {
                title: title.trim(),
                content: content.trim(),
            });
            setTitle('');
            setContent('');
            loadThreads();
        } catch (err) {
            alert(getApiErrorMessage(err, 'Failed to create thread.'));
        }
    };

    const toggleThread = (threadId) => {
        setExpanded((prev) => ({ ...prev, [threadId]: !prev[threadId] }));
    };

    const startReply = (threadId, parentId = null) => {
        setReplyTarget({ threadId, parentId });
        setReplyText('');
        setEditingMessage(null);
    };

    const cancelReply = () => {
        setReplyTarget(null);
        setReplyText('');
    };

    const submitReply = async (threadId, parentId = null) => {
        if (!token) return requireLogin();
        if (!replyText.trim()) {
            setError('Enter a reply before posting.');
            return;
        }
        setError('');
        try {
            await api.post(`/books/${id}/threads/${threadId}/messages`, {
                content: replyText.trim(),
                ...(parentId ? { parentMessage: parentId } : {}),
            });
            setReplyText('');
            setReplyTarget(null);
            await loadThreadMessages(threadId);
        } catch (err) {
            alert(getApiErrorMessage(err, 'Failed to post reply.'));
        }
    };

    const startEditingThread = (thread) => {
        setEditingThread(thread._id);
        setEditThreadTitle(thread.title || '');
        setEditThreadContent(thread.content || '');
    };

    const cancelEditingThread = () => {
        setEditingThread(null);
        setEditThreadTitle('');
        setEditThreadContent('');
    };

    const submitThreadUpdate = async (threadId) => {
        if (!token) return requireLogin();
        try {
            await api.patch(`/books/${id}/threads/${threadId}`, {
                title: editThreadTitle.trim(),
                content: editThreadContent.trim(),
            });
            cancelEditingThread();
            loadThreads();
        } catch (err) {
            alert(getApiErrorMessage(err, 'Failed to update thread.'));
        }
    };

    const deleteThread = async (threadId) => {
        if (!token) return requireLogin();
        if (!confirm('Delete this thread?')) return;
        try {
            await api.delete(`/books/${id}/threads/${threadId}`);
            loadThreads();
        } catch (err) {
            alert(getApiErrorMessage(err, 'Failed to delete thread.'));
        }
    };

    const startEditingMessage = (message) => {
        setEditingMessage(message._id);
        setEditMessageText(message.content || '');
        setReplyTarget(null);
    };

    const cancelEditingMessage = () => {
        setEditingMessage(null);
        setEditMessageText('');
    };

    const submitMessageUpdate = async (messageId, threadId) => {
        if (!token) return requireLogin();
        if (!editMessageText.trim()) {
            setError('Enter a message before saving.');
            return;
        }
        setError('');
        try {
            await api.patch(`/books/${id}/threads/${threadId}/messages/${messageId}`, {
                content: editMessageText.trim(),
            });
            cancelEditingMessage();
            await loadThreadMessages(threadId);
        } catch (err) {
            alert(getApiErrorMessage(err, 'Failed to update message.'));
        }
    };

    const deleteMessage = async (messageId, threadId) => {
        if (!token) return requireLogin();
        if (!confirm('Delete this message?')) return;
        try {
            await api.delete(`/books/${id}/threads/${threadId}/messages/${messageId}`);
            await loadThreadMessages(threadId);
        } catch (err) {
            alert(getApiErrorMessage(err, 'Failed to delete message.'));
        }
    };

    const renderMessage = (message, threadId, depth = 0) => {
        return (
            <div
                key={message._id}
                className={`rounded-md border border-[var(--line)] bg-[var(--bg-shell)] p-4 ${depth > 0 ? 'ml-6 border-l-4 border-[var(--accent)]' : ''
                    }`}
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-[var(--text-strong)]">{message.createdBy?.name || 'Anonymous'}</p>
                        <p className="text-xs text-[var(--text-soft)]">
                            {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => startReply(threadId, message._id)}
                            className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                        >
                            Reply
                        </button>
                        {canModifyMessage(message) ? (
                            <>
                                <button
                                    onClick={() => startEditingMessage(message)}
                                    className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteMessage(message._id, threadId)}
                                    className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-3 py-1 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/20"
                                >
                                    Delete
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>

                {editingMessage === message._id ? (
                    <div className="mt-3 space-y-3">
                        <textarea
                            value={editMessageText}
                            onChange={(e) => setEditMessageText(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                        />
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => submitMessageUpdate(message._id, threadId)}
                                className="rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                            >
                                Save
                            </button>
                            <button
                                onClick={cancelEditingMessage}
                                className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-3 text-sm text-[var(--text-soft)] whitespace-pre-wrap">{message.content}</p>
                )}

                {replyTarget?.threadId === threadId && replyTarget?.parentId === message._id ? (
                    <div className="mt-4 rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-4">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            placeholder="Write your reply..."
                            className="w-full rounded-md border border-[var(--line)] bg-[var(--bg-shell)] px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                onClick={() => submitReply(threadId, message._id)}
                                className="rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                            >
                                Post reply
                            </button>
                            <button
                                onClick={cancelReply}
                                className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : null}

                {Array.isArray(message.replies) && message.replies.length > 0 ? (
                    <div className="mt-4 space-y-4">
                        {message.replies.map((reply) => renderMessage(reply, threadId, depth + 1))}
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--bg-app)] p-3 md:p-5">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel-bg)] shadow-[var(--shadow-elev)]">
                <NavBar />

                <section className="p-4 md:p-5">
                    <div className="mb-4 flex flex-col gap-4 border-b border-[var(--line)] pb-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-main)]">Book Discussions</h1>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <BackButton to={`/books/details/${id}`} />
                            <Link
                                to="/explore"
                                className="inline-flex items-center justify-center rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                            >
                                Browse books
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-4 shadow-sm">
                        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--text-main)]">Create a discussion thread</h2>
                                <p className="mt-1 text-sm text-[var(--text-soft)]">Start with a conversation topic that others can reply to directly.</p>
                                <div className="mt-4 space-y-3">
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Thread title"
                                        className="w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                                    />
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={4}
                                        placeholder="Write the thread content..."
                                        className="w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                                    />
                                    {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={submitThread}
                                            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                                        >
                                            Post thread
                                        </button>
                                        {!token ? (
                                            <p className="text-xs text-[var(--text-soft)]">Login to create a thread.</p>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md border border-[var(--line)] bg-[var(--bg-muted)] p-4">
                                <h3 className="text-lg font-semibold text-[var(--text-main)]">Book summary</h3>
                                {book ? (
                                    <div className="mt-4 space-y-3">
                                        <p className="text-sm font-semibold text-[var(--text-strong)]">{book.title}</p>
                                        <p className="text-sm text-[var(--text-soft)]">by {book.author}</p>
                                        <p className="text-sm text-[var(--text-soft)]">{book.publishedYear}</p>
                                        <p className="text-sm text-[var(--text-soft)] whitespace-pre-wrap">{book.description || 'No description available.'}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-soft)]">Book data not available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-md border border-[var(--line)] bg-[var(--card-bg)] p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-xl font-semibold text-[var(--text-main)]">Discussion Tree</h2>
                            <span className="text-sm text-[var(--text-soft)]">{threads.length} thread{threads.length === 1 ? '' : 's'}</span>
                        </div>

                        {threadsLoading ? (
                            <div className="mt-4">
                                <Loader />
                            </div>
                        ) : threads.length === 0 ? (
                            <p className="mt-4 text-[var(--text-soft)]">No discussion threads yet. Start one above.</p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {threads.map((thread) => (
                                    <div key={thread._id} className="rounded-md border border-[var(--line)] bg-[var(--bg-muted)] p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                {editingThread === thread._id ? (
                                                    <div className="space-y-3">
                                                        <input
                                                            value={editThreadTitle}
                                                            onChange={(e) => setEditThreadTitle(e.target.value)}
                                                            className="w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                                                        />
                                                        <textarea
                                                            value={editThreadContent}
                                                            onChange={(e) => setEditThreadContent(e.target.value)}
                                                            rows={3}
                                                            className="w-full rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                                                        />
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => submitThreadUpdate(thread._id)}
                                                                className="rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={cancelEditingThread}
                                                                className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-lg font-semibold text-[var(--text-strong)]">{thread.title}</p>
                                                        <p className="mt-1 text-sm text-[var(--text-soft)]">
                                                            {thread.createdBy?.name || 'Anonymous'} • {thread.createdAt ? new Date(thread.createdAt).toLocaleString() : ''}
                                                        </p>
                                                        <p className="mt-3 text-sm text-[var(--text-soft)] whitespace-pre-wrap">{thread.content}</p>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => toggleThread(thread._id)}
                                                    title={expanded[thread._id] ? 'Collapse' : 'Expand'}
                                                    className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                                                >
                                                    {expanded[thread._id] ? '-' : '+'}
                                                </button>
                                                <button
                                                    onClick={() => startReply(thread._id, null)}
                                                    title="Reply to thread"
                                                    className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                                                >
                                                    Reply
                                                </button>
                                                {canModifyThread(thread) ? (
                                                    <>
                                                        <button
                                                            onClick={() => startEditingThread(thread)}
                                                            className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteThread(thread._id)}
                                                            className="rounded-md border border-[var(--danger)] bg-[var(--danger)]/10 px-3 py-1 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger)]/20"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>

                                        {expanded[thread._id] ? (
                                            <div className="mt-4 space-y-4">
                                                {replyTarget?.threadId === thread._id && replyTarget?.parentId === null ? (
                                                    <div className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-4">
                                                        <textarea
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            rows={3}
                                                            placeholder="Write a reply to this thread..."
                                                            className="w-full rounded-md border border-[var(--line)] bg-[var(--bg-shell)] px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                                                        />
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => submitReply(thread._id, null)}
                                                                className="rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--text-inverse)] hover:bg-[var(--accent-hover)]"
                                                            >
                                                                Post reply
                                                            </button>
                                                            <button
                                                                onClick={cancelReply}
                                                                className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] px-3 py-2 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {messagesByThread[thread._id] ? (
                                                    <div className="space-y-4">
                                                        {messagesByThread[thread._id].map((message) => renderMessage(message, thread._id))}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-md border border-[var(--line)] bg-[var(--bg-input)] p-4 text-sm text-[var(--text-soft)]">
                                                        Loading replies...
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Discussions;
