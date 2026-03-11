import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home';
import CreateBook from './pages/CreateBook';
import EditBook from './pages/EditBook';
import DeleteBook from './pages/DeleteBook';
import ShowBook from './pages/ShowBook';
import Login from './pages/Login';
import Register from './pages/Register';
import Reviews from './pages/Reviews';

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/reviews' element={<Reviews />} />
      <Route path='/books/create' element={<CreateBook/>} />
      <Route path='/books/edit/:id' element={<EditBook/>} />
      <Route path='/books/delete/:id' element={<DeleteBook/>} />
      <Route path='/books/details/:id' element={<ShowBook/>} />
    </Routes>
  )
}

export default App
