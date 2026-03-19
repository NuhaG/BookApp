import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 rounded-md border border-[var(--line)] bg-[#111b2d] px-3 py-2 text-[var(--text-soft)] hover:text-white hover:bg-[#1a2940] transition-colors"
    >
      <HiArrowLeft className="w-5 h-5" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
};

export default BackButton;
