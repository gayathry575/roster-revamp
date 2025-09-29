import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Course, TimetableInputs } from '@/types/timetable';
import { CourseTable } from './CourseTable';
import { ConflictWarning } from './ConflictWarning';

const DEPARTMENTS = ["CSE", "ECE", "EEE", "Civil", "Mechanical"];
const SEMESTERS = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4", 
  "Semester 5", "Semester 6", "Semester 7", "Semester 8"
];

interface TimetableGeneratorProps {
  onGenerate: (inputs: TimetableInputs) => void;
  onViewSaved: () => void;
}

export const TimetableGenerator: React.FC<TimetableGeneratorProps> = ({ onGenerate, onViewSaved }) => {
  const [inputs, setInputs] = useState<TimetableInputs>({
    department: '',
    semester: '',
    block: '',
    classroom: '',
    courses: []
  });
  
  const [conflicts, setConflicts] = useState<string[]>([]);
  const { toast } = useToast();

  // Load saved data
  useEffect(() => {
    const savedData = localStorage.getItem('timetableInputs');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setInputs(parsed);
      } catch (error) {
        console.error('Failed to parse saved data:', error);
      }
    }
    
    // Add initial course if none exist
    if (inputs.courses.length === 0) {
      addCourse();
    }
  }, []);

  // Check faculty conflicts
  useEffect(() => {
    checkFacultyConflicts();
  }, [inputs.courses]);

  const updateInputs = (field: keyof Omit<TimetableInputs, 'courses'>, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const addCourse = () => {
    const newCourse: Course = {
      courseCode: '',
      subject: '',
      faculty: '',
      facultyId: '',
      slots: 1,
      consecutive: 'no',
      consecutiveSlots: 1
    };
    setInputs(prev => ({ ...prev, courses: [...prev.courses, newCourse] }));
  };

  const updateCourse = (index: number, course: Course) => {
    setInputs(prev => ({
      ...prev,
      courses: prev.courses.map((c, i) => i === index ? course : c)
    }));
  };

  const removeCourse = (index: number) => {
    setInputs(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }));
  };

  const checkFacultyConflicts = () => {
    const facultySlots: { [facultyId: string]: number } = {};
    const newConflicts: string[] = [];

    inputs.courses.forEach(course => {
      const { facultyId, slots } = course;
      if (facultyId && slots > 0) {
        facultySlots[facultyId] = (facultySlots[facultyId] || 0) + slots;
      }
    });

    Object.entries(facultySlots).forEach(([facultyId, totalSlots]) => {
      if (totalSlots > 10) {
        newConflicts.push(`Faculty ${facultyId} has ${totalSlots} slots (max 10 allowed)`);
      }
    });

    setConflicts(newConflicts);
  };

  const handleGenerate = () => {
    // Validate inputs
    if (!inputs.department || !inputs.semester || !inputs.block || !inputs.classroom) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const validCourses = inputs.courses.filter(course => 
      course.courseCode && course.subject && course.faculty && course.facultyId && course.slots > 0
    );

    if (validCourses.length === 0) {
      toast({
        title: "No Valid Courses",
        description: "Please add at least one complete course.",
        variant: "destructive"
      });
      return;
    }

    if (conflicts.length > 0) {
      if (!confirm("There are faculty slot conflicts. Do you want to proceed anyway?")) {
        return;
      }
    }

    const finalInputs = { ...inputs, courses: validCourses };
    
    // Save to localStorage
    localStorage.setItem('timetableInputs', JSON.stringify(finalInputs));
    
    onGenerate(finalInputs);
  };

  return (
    <div className="amrita-gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="amrita-container p-8 w-full max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="amrita-logo">A</div>
          <h1 className="text-3xl font-bold text-amrita-primary">Amrita Timetable Generator</h1>
        </div>

        <div className="amrita-form-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department" className="text-amrita-dark font-semibold">Department</Label>
              <Select value={inputs.department} onValueChange={(value) => updateInputs('department', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semester" className="text-amrita-dark font-semibold">Semester</Label>
              <Select value={inputs.semester} onValueChange={(value) => updateInputs('semester', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map(sem => (
                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="block" className="text-amrita-dark font-semibold">Block</Label>
              <Input 
                id="block"
                placeholder="e.g., AB1"
                value={inputs.block}
                onChange={(e) => updateInputs('block', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="classroom" className="text-amrita-dark font-semibold">Classroom</Label>
              <Input 
                id="classroom"
                placeholder="e.g., 101"
                value={inputs.classroom}
                onChange={(e) => updateInputs('classroom', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-amrita-primary border-b-2 border-amrita-accent pb-2 mb-4">
          Courses / Subjects
        </h3>

        <CourseTable 
          courses={inputs.courses}
          onUpdateCourse={updateCourse}
          onRemoveCourse={removeCourse}
        />

        <Button variant="add-course" onClick={addCourse}>
          ➕ Add Course
        </Button>

        <ConflictWarning conflicts={conflicts} />

        <div className="text-center space-x-4 mt-6">
          <Button variant="generate" size="lg" onClick={handleGenerate}>
            🚀 Generate Timetable
          </Button>
          <Button variant="back" onClick={onViewSaved}>
            📋 View Saved Timetables
          </Button>
        </div>
      </div>
    </div>
  );
};