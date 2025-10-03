import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TimetableInputs, TimetableData, Course, FacultyConflict } from '@/types/timetable';
import { timetableService } from '@/services/timetableService';

interface TimetableDisplayProps {
  inputs: TimetableInputs;
  onBack: () => void;
}

import { SLOT_TIMINGS, getTotalSlots, BREAK_TIME } from '@/utils/slotTimings';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SLOTS_PER_DAY = getTotalSlots();

export const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ inputs, onBack }) => {
  const [timetable, setTimetable] = useState<{ [day: string]: string[] }>({});
  const [conflicts, setConflicts] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    generateTimetable();
  }, [inputs]);

  const loadExistingTimetables = (): TimetableData[] => {
    const existing = localStorage.getItem('savedTimetables');
    return existing ? JSON.parse(existing) : [];
  };

  const checkGlobalFacultyConflicts = async (day: string, slot: number, facultyId: string): Promise<FacultyConflict[]> => {
    try {
      return await timetableService.checkFacultyConflicts(day, slot, facultyId);
    } catch (error) {
      console.error('Error checking faculty conflicts:', error);
      toast({
        title: "Conflict Check Failed",
        description: "Unable to verify faculty availability. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  };

  const getRandomDay = (exclude: string[] = []): string => {
    const available = DAYS.filter(d => !exclude.includes(d));
    return available[Math.floor(Math.random() * available.length)];
  };

  const placeSlots = async (day: string, course: Course, count: number, timetableData: { [day: string]: string[] }): Promise<boolean> => {
    const slots = timetableData[day];
    const { facultyId } = course;

    for (let i = 0; i < slots.length; i++) {
      if (i === 3) continue; // Skip break slot

      // Check if this position is available and doesn't conflict
      let fits = true;
      for (let j = 0; j < count; j++) {
        if (i + j >= slots.length || slots[i + j] !== "" || (i + j === 3)) {
          fits = false;
          break;
        }

        // Check global conflicts for each potential slot
        const globalConflicts = await checkGlobalFacultyConflicts(day, i + j, facultyId);
        if (globalConflicts.length > 0) {
          fits = false;
          break;
        }
      }

      if (fits) {
        for (let j = 0; j < count; j++) {
          slots[i + j] = `${course.subject}<br/><span class="text-xs text-gray-600">(${course.faculty})<br/>${facultyId}</span>`;
        }
        return true;
      }
    }
    return false;
  };

  const generateTimetable = async () => {
    // Initialize empty timetable
    const newTimetable: { [day: string]: string[] } = {};
    DAYS.forEach(day => {
      newTimetable[day] = new Array(SLOTS_PER_DAY).fill("");
    });

    const conflictMessages: string[] = [];
    let hasConflicts = false;

    for (const course of inputs.courses) {
      let remaining = course.slots;
      const consecCount = course.consecutive === 'yes' ? course.consecutiveSlots : 1;

      while (remaining > 0) {
        const day = getRandomDay();
        const toPlace = Math.min(consecCount, remaining);

        if (await placeSlots(day, course, toPlace, newTimetable)) {
          remaining -= toPlace;
        } else {
          // Try other days
          const otherDays = DAYS.filter(d => d !== day);
          let placed = false;

          for (const otherDay of otherDays) {
            if (await placeSlots(otherDay, course, toPlace, newTimetable)) {
              remaining -= toPlace;
              placed = true;
              break;
            }
          }

          if (!placed) {
            hasConflicts = true;
            conflictMessages.push(`Could not place all slots for ${course.subject} (${course.facultyId}) due to conflicts`);
            break;
          }
        }
      }
    }

    setTimetable(newTimetable);
    setConflicts(conflictMessages);

    if (hasConflicts) {
      toast({
        title: "Scheduling Conflicts",
        description: "Some courses could not be fully scheduled due to conflicts.",
        variant: "destructive"
      });
    }
  };

  const saveTimetable = async () => {
    try {
      const timetableId = await timetableService.saveTimetable(inputs, timetable);
      
      toast({
        title: "Success",
        description: "Timetable saved successfully to database!"
      });
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast({
        title: "Error",
        description: "Failed to save timetable. Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadPDF = () => {
    toast({
      title: "Feature Coming Soon",
      description: "PDF download will be available after backend integration."
    });
  };

  const downloadExcel = () => {
    toast({
      title: "Feature Coming Soon", 
      description: "Excel download will be available after backend integration."
    });
  };

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
          Dept: {inputs.department} | Semester: {inputs.semester} | Classroom: {inputs.classroom} | Block: {inputs.block}
        </h2>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-destructive p-4 rounded mb-5">
          <div className="text-destructive">
            <strong>⚠ Scheduling Conflicts Detected:</strong>
            <br />
            {conflicts.map((conflict, index) => (
              <div key={index}>{conflict}</div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-sm border border-amrita-border mb-5">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-white text-left p-3 border border-gray-300 text-black font-semibold">Course Code</th>
              <th className="bg-white text-left p-3 border border-gray-300 text-black font-semibold">Course</th>
              <th className="bg-white text-left p-3 border border-gray-300 text-black font-semibold">Handling Faculty</th>
            </tr>
          </thead>
          <tbody>
            {inputs.courses.map((course, index) => (
              <tr key={index}>
                <td className="bg-white p-3 border border-gray-300 text-black">{course.courseCode}</td>
                <td className="bg-white p-3 border border-gray-300 text-black">{course.subject}</td>
                <td className="bg-white p-3 border border-gray-300 text-black">{course.faculty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-amrita-border">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th rowSpan={2} className="bg-amrita-primary text-white p-3 border border-amrita-border font-semibold">
                Day / Time
              </th>
              {SLOT_TIMINGS.slice(0, 3).map((time, index) => (
                <th key={index} className="bg-amrita-primary text-white p-3 border border-amrita-border font-semibold">
                  Slot {index + 1}
                </th>
              ))}
              <th rowSpan={2} className="bg-white text-amrita-dark p-3 border border-amrita-border font-bold">
                Break<br />{BREAK_TIME}
              </th>
              {SLOT_TIMINGS.slice(3).map((time, index) => (
                <th key={index + 4} className="bg-amrita-primary text-white p-3 border border-amrita-border font-semibold">
                  Slot {index + 4}
                </th>
              ))}
            </tr>
            <tr>
              {SLOT_TIMINGS.slice(0, 3).map((time, index) => (
                <th key={index} className="bg-amrita-primary text-white p-2 border border-amrita-border text-sm">
                  {time}
                </th>
              ))}
              {SLOT_TIMINGS.slice(3).map((time, index) => (
                <th key={index + 3} className="bg-amrita-primary text-white p-2 border border-amrita-border text-sm">
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day}>
                <td className="bg-white p-3 border border-amrita-border font-semibold text-amrita-dark">
                  {day}
                </td>
                {Array.from({ length: 11 }, (_, index) => {
                  if (index === 3) {
                    return (
                      <td key={index} className="bg-white p-3 border border-amrita-border font-bold text-amrita-dark text-center">
                        Break
                      </td>
                    );
                  }
                  const slotIndex = index > 3 ? index - 1 : index;
                  return (
                    <td 
                      key={index}
                      className="bg-white p-3 border border-amrita-border text-center text-sm min-w-20"
                      dangerouslySetInnerHTML={{ __html: timetable[day]?.[slotIndex] || "" }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-8 space-x-4">
        <Button variant="excel" onClick={downloadPDF}>
          Download PDF
        </Button>
        <Button variant="excel" onClick={downloadExcel}>
          Download Excel
        </Button>
        <Button variant="excel" onClick={saveTimetable}>
          💾 Save Timetable
        </Button>
      </div>
    </div>
  );
};