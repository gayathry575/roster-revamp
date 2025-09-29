import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { timetableService, DatabaseTimetable } from '@/services/timetableService';

interface SavedTimetablesProps {
  onBack: () => void;
  onViewTimetable: (timetableId: string) => void;
}

export const SavedTimetables: React.FC<SavedTimetablesProps> = ({ onBack, onViewTimetable }) => {
  const [timetables, setTimetables] = useState<DatabaseTimetable[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTimetables();
  }, []);

  const loadTimetables = async () => {
    try {
      setLoading(true);
      const data = await timetableService.getAllTimetables();
      setTimetables(data);
    } catch (error) {
      console.error('Error loading timetables:', error);
      toast({
        title: "Error",
        description: "Failed to load saved timetables.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amrita-light p-5">
        <div className="flex items-center justify-center h-64">
          <div className="text-amrita-primary">Loading saved timetables...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amrita-light p-5">
      <header className="flex items-center justify-between mb-5 pb-4 border-b-2 border-amrita-accent">
        <Button variant="back" onClick={onBack}>
          ⬅ Back to Generator
        </Button>
        <div className="amrita-logo text-2xl w-15 h-15">A</div>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-amrita-border mb-5">
        <h2 className="text-xl font-bold text-amrita-primary text-center">
          Saved Timetables
        </h2>
      </div>

      {timetables.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No saved timetables found.</div>
          <div className="text-gray-400 mt-2">Generate and save a timetable to see it here.</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {timetables.map((timetable) => (
            <Card key={timetable.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-amrita-primary">
                  {timetable.department} - {timetable.semester}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div><strong>Block:</strong> {timetable.block}</div>
                  <div><strong>Classroom:</strong> {timetable.classroom}</div>
                  <div><strong>Created:</strong> {new Date(timetable.created_at).toLocaleDateString()}</div>
                </div>
                <div className="mt-4 space-x-2">
                  <Button 
                    variant="generate" 
                    size="sm"
                    onClick={() => onViewTimetable(timetable.id)}
                  >
                    View Timetable
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};