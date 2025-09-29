import React, { useState } from 'react';
import { TimetableGenerator } from '@/components/TimetableGenerator';
import { TimetableDisplay } from '@/components/TimetableDisplay';
import { SavedTimetables } from '@/components/SavedTimetables';
import { TimetableInputs } from '@/types/timetable';
import { timetableService } from '@/services/timetableService';

type View = 'generator' | 'display' | 'saved' | 'view-saved';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('generator');
  const [timetableInputs, setTimetableInputs] = useState<TimetableInputs | null>(null);
  const [viewingTimetableId, setViewingTimetableId] = useState<string | null>(null);

  const handleGenerateTimetable = (inputs: TimetableInputs) => {
    setTimetableInputs(inputs);
    setCurrentView('display');
  };

  const handleBackToGenerator = () => {
    setCurrentView('generator');
    setTimetableInputs(null);
  };

  const handleViewSaved = () => {
    setCurrentView('saved');
  };

  const handleViewTimetable = async (timetableId: string) => {
    try {
      const { timetable, slots } = await timetableService.getTimetableById(timetableId);
      
      // Convert database format back to TimetableInputs format
      const timetableInputs: TimetableInputs = {
        department: timetable.department,
        semester: timetable.semester,
        block: timetable.block,
        classroom: timetable.classroom,
        courses: [] // We'll populate this from slots if needed
      };
      
      setTimetableInputs(timetableInputs);
      setViewingTimetableId(timetableId);
      setCurrentView('view-saved');
    } catch (error) {
      console.error('Error loading timetable:', error);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'generator':
        return (
          <TimetableGenerator 
            onGenerate={handleGenerateTimetable}
            onViewSaved={handleViewSaved}
          />
        );
      case 'display':
        return timetableInputs ? (
          <TimetableDisplay 
            inputs={timetableInputs} 
            onBack={handleBackToGenerator}
          />
        ) : null;
      case 'saved':
        return (
          <SavedTimetables
            onBack={handleBackToGenerator}
            onViewTimetable={handleViewTimetable}
          />
        );
      case 'view-saved':
        return timetableInputs ? (
          <TimetableDisplay 
            inputs={timetableInputs} 
            onBack={() => setCurrentView('saved')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return <div className="min-h-screen">{renderView()}</div>;
};

export default Index;
