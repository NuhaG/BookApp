import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import Table from '../components/home/table';
import Card from '../components/home/card';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState('table');

  useEffect(() => {
    if (window.innerWidth < 768) {
      setShow('card');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:5555/books')
      .then((response) => {
        setBooks(response.data.books || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="selection:bg-teal-900 text-center p-5 min-h-screen bg-gradient-to-b from-teal-300 via-violet-500 to-teal-300">
      <div className="p-5 flex flex-col md:flex-row items-center md:justify-between gap-4 bg-gray-900 text-teal-300 rounded-md">
        <h1 className="text-2xl">Books App</h1>
        <div className="flex gap-4 flex-wrap justify-center">
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => setShow('table')}
              className={`px-4 py-2 rounded-md ${show === 'table' ? 'bg-teal-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
            >
              Table View
            </button>
            <button
              onClick={() => setShow('card')}
              className={`px-4 py-2 rounded-md ${show === 'card' ? 'bg-teal-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
            >
              Card View
            </button>
          </div>

          <Link to="/books/create" className="flex items-center gap-2 hover:text-teal-400">
            <MdAdd size={29} /> <span>Add Book</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loader />
      ) : window.innerWidth < 768 ?
        <Card books={books} /> :
        show === 'table' ? (
          <Table books={books} />
        ) : (
          <Card books={books} />
        )}
    </div>
  );
};

export default Home;
