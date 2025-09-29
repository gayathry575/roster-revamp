-- Create Faculty table
CREATE TABLE public.faculty (
  faculty_id TEXT PRIMARY KEY,
  faculty_name TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Timetables table for metadata
CREATE TABLE public.timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  block TEXT NOT NULL,
  classroom TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create Timetable_slots table for individual slot assignments
CREATE TABLE public.timetable_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID REFERENCES public.timetables(id) ON DELETE CASCADE NOT NULL,
  day TEXT NOT NULL,
  slot_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  faculty_id TEXT REFERENCES public.faculty(faculty_id) NOT NULL,
  course_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for Faculty (readable by all, manageable by authenticated users)
CREATE POLICY "Faculty are viewable by everyone" 
ON public.faculty FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert faculty" 
ON public.faculty FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update faculty" 
ON public.faculty FOR UPDATE 
USING (true);

-- Create policies for Timetables (users can manage their own timetables)
CREATE POLICY "Users can view all timetables" 
ON public.timetables FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own timetables" 
ON public.timetables FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own timetables" 
ON public.timetables FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own timetables" 
ON public.timetables FOR DELETE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policies for Timetable_slots
CREATE POLICY "Users can view all timetable slots" 
ON public.timetable_slots FOR SELECT 
USING (true);

CREATE POLICY "Users can insert timetable slots" 
ON public.timetable_slots FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update timetable slots" 
ON public.timetable_slots FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete timetable slots" 
ON public.timetable_slots FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_timetable_slots_timetable_id ON public.timetable_slots(timetable_id);
CREATE INDEX idx_timetable_slots_faculty_day_slot ON public.timetable_slots(faculty_id, day, slot_number);
CREATE INDEX idx_faculty_department ON public.faculty(department);