import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Course } from '@/types/timetable';

interface CourseTableProps {
  courses: Course[];
  onUpdateCourse: (index: number, course: Course) => void;
  onRemoveCourse: (index: number) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({ courses, onUpdateCourse, onRemoveCourse }) => {
  const handleCourseChange = (index: number, field: keyof Course, value: string | number) => {
    const updatedCourse = { ...courses[index], [field]: value };
    onUpdateCourse(index, updatedCourse);
  };

  const handleConsecutiveChange = (index: number, value: 'yes' | 'no') => {
    const updatedCourse = { 
      ...courses[index], 
      consecutive: value,
      consecutiveSlots: value === 'yes' ? courses[index].consecutiveSlots : 1
    };
    onUpdateCourse(index, updatedCourse);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-amrita-border">
      <table className="w-full">
        <thead>
          <tr className="bg-amrita-primary text-white">
            <th className="p-3 text-left font-semibold border border-amrita-border min-w-[110px]">Course Code</th>
            <th className="p-3 text-left font-semibold border border-amrita-border min-w-[220px]">Subject Name</th>
            <th className="p-3 text-left font-semibold border border-amrita-border min-w-[120px]">Faculty Name</th>
            <th className="p-3 text-left font-semibold border border-amrita-border min-w-[120px]">Faculty ID</th>
            <th className="p-3 text-left font-semibold border border-amrita-border min-w-[110px]">Slots per Week</th>
            <th className="p-3 text-left font-semibold border border-amrita-border min-w-[180px]">Consecutive?</th>
            <th className="p-3 text-center font-semibold border border-amrita-border min-w-[90px]">Action</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={index} className="border-b border-amrita-border">
              <td className="p-2 border border-amrita-border">
                <Input 
                  value={course.courseCode}
                  onChange={(e) => handleCourseChange(index, 'courseCode', e.target.value)}
                  placeholder="e.g., CS101"
                  className="border-0 p-1 h-8 text-sm"
                />
              </td>
              <td className="p-2 border border-amrita-border">
                <Input 
                  value={course.subject}
                  onChange={(e) => handleCourseChange(index, 'subject', e.target.value)}
                  placeholder="e.g., Data Structures"
                  className="border-0 p-1 h-8 text-sm"
                />
              </td>
              <td className="p-2 border border-amrita-border">
                <Input 
                  value={course.faculty}
                  onChange={(e) => handleCourseChange(index, 'faculty', e.target.value)}
                  placeholder="e.g., Dr. Smith"
                  className="border-0 p-1 h-8 text-sm"
                />
              </td>
              <td className="p-2 border border-amrita-border">
                <Input 
                  value={course.facultyId}
                  onChange={(e) => handleCourseChange(index, 'facultyId', e.target.value)}
                  placeholder="e.g., F001"
                  className="border-0 p-1 h-8 text-sm"
                />
              </td>
              <td className="p-2 border border-amrita-border">
                <Input 
                  type="number"
                  min="1"
                  value={course.slots}
                  onChange={(e) => handleCourseChange(index, 'slots', parseInt(e.target.value) || 1)}
                  className="border-0 p-1 h-8 text-sm"
                />
              </td>
              <td className="p-2 border border-amrita-border">
                <div className="flex items-center gap-2">
                  <Select 
                    value={course.consecutive}
                    onValueChange={(value: 'yes' | 'no') => handleConsecutiveChange(index, value)}
                  >
                    <SelectTrigger className="border-0 h-8 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  {course.consecutive === 'yes' && (
                    <Input 
                      type="number"
                      min="1"
                      max="9"
                      value={course.consecutiveSlots}
                      onChange={(e) => handleCourseChange(index, 'consecutiveSlots', parseInt(e.target.value) || 1)}
                      placeholder="#"
                      title="Enter how many consecutive slots (1–9)"
                      className="border-0 p-1 h-8 text-sm w-12"
                    />
                  )}
                </div>
              </td>
              <td className="p-2 border border-amrita-border text-center">
                <Button 
                  variant="remove"
                  onClick={() => onRemoveCourse(index)}
                >
                  ❌
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};