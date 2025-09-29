import React, { useState } from 'react';
import { TimetableGenerator } from '@/components/TimetableGenerator';
import { TimetableDisplay } from '@/components/TimetableDisplay';
import { TimetableInputs } from '@/types/timetable';

const Index = () => {
  const [currentView, setCurrentView] = useState<'generator' | 'display'>('generator');
  const [timetableInputs, setTimetableInputs] = useState<TimetableInputs | null>(null);

  const handleGenerate = (inputs: TimetableInputs) => {
    setTimetableInputs(inputs);
    setCurrentView('display');
  };

  const handleBack = () => {
    setCurrentView('generator');
  };

  return (
    <>
      {currentView === 'generator' && (
        <TimetableGenerator onGenerate={handleGenerate} />
      )}
      {currentView === 'display' && timetableInputs && (
        <TimetableDisplay inputs={timetableInputs} onBack={handleBack} />
      )}
    </>
  );
};

export default Index;
