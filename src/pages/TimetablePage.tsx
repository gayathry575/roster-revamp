import React from 'react';
import { Navigate } from 'react-router-dom';
import { TimetableDisplay } from '@/components/TimetableDisplay';

const TimetablePage = () => {
  const savedInputs = localStorage.getItem('timetableInputs');
  
  if (!savedInputs) {
    return <Navigate to="/" replace />;
  }

  const inputs = JSON.parse(savedInputs);

  const handleBack = () => {
    window.history.back();
  };

  return <TimetableDisplay inputs={inputs} onBack={handleBack} />;
};

export default TimetablePage;