import { useState, useEffect } from 'react';
import { timetableService } from '@/services/timetableService';

interface FacultyAvailability {
  day: string;
  slot: number;
  subject: string;
  timetable: string;
}

export const useFacultyAvailability = (facultyId: string | null) => {
  const [availability, setAvailability] = useState<FacultyAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facultyId) {
      setAvailability([]);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await timetableService.getFacultyAvailability(facultyId);
        setAvailability(data);
      } catch (err) {
        console.error('Error fetching faculty availability:', err);
        setError('Failed to fetch faculty availability');
        setAvailability([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [facultyId]);

  return { availability, loading, error };
};