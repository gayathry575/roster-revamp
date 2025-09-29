export interface Course {
  courseCode: string;
  subject: string;
  faculty: string;
  facultyId: string;
  slots: number;
  consecutive: 'yes' | 'no';
  consecutiveSlots: number;
}

export interface TimetableInputs {
  department: string;
  semester: string;
  block: string;
  classroom: string;
  courses: Course[];
}

export interface TimetableData extends TimetableInputs {
  timetable: { [day: string]: string[] };
  generatedAt: string;
}

export interface FacultyConflict {
  timetable: string;
  department: string;
  semester: string;
  day: string;
  slot: number;
}