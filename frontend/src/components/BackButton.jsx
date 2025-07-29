import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi'; 

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-teal-300 hover:text-teal-400 transition-colors"
    >
      <HiArrowLeft className="w-5 h-5" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
};

export default BackButton;
