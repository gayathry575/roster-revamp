import { supabase } from '@/integrations/supabase/client';
import { TimetableInputs, Course, FacultyConflict } from '@/types/timetable';

export interface DatabaseTimetable {
  id: string;
  department: string;
  semester: string;
  block: string;
  classroom: string;
  created_at: string;
  user_id?: string;
}

export interface DatabaseTimetableSlot {
  id: string;
  timetable_id: string;
  day: string;
  slot_number: number;
  subject: string;
  faculty_id: string;
  course_code?: string;
}

export const timetableService = {
  // Save faculty to database (upsert to avoid duplicates)
  async saveFaculty(courses: Course[]): Promise<void> {
    const facultyData = courses.map(course => ({
      faculty_id: course.facultyId,
      faculty_name: course.faculty,
      department: course.subject // Using subject as department for now
    }));

    const { error } = await supabase
      .from('faculty')
      .upsert(facultyData, { onConflict: 'faculty_id' });

    if (error) {
      console.error('Error saving faculty:', error);
      throw new Error('Failed to save faculty data');
    }
  },

  // Save complete timetable
  async saveTimetable(
    inputs: TimetableInputs,
    timetableData: { [day: string]: string[] }
  ): Promise<string> {
    try {
      // Validate no conflicts exist before saving
      const validation = await this.validateTimetableConflicts(timetableData);
      if (!validation.valid) {
        throw new Error(`Cannot save timetable due to faculty conflicts:\n${validation.conflicts.join('\n')}`);
      }

      // First save faculty data
      await this.saveFaculty(inputs.courses);

      // Save timetable metadata
      const { data: timetableResult, error: timetableError } = await supabase
        .from('timetables')
        .insert({
          department: inputs.department,
          semester: inputs.semester,
          block: inputs.block,
          classroom: inputs.classroom,
          user_id: null // Will be set when authentication is added
        })
        .select('id')
        .single();

      if (timetableError) {
        console.error('Error saving timetable:', timetableError);
        throw new Error('Failed to save timetable');
      }

      const timetableId = timetableResult.id;

      // Parse and save individual slots
      const slots: Omit<DatabaseTimetableSlot, 'id'>[] = [];
      
      Object.entries(timetableData).forEach(([day, daySlots]) => {
        daySlots.forEach((slotContent, slotIndex) => {
          if (slotContent && slotContent.trim() !== '') {
            // Parse the slot content to extract subject and faculty_id
            const match = slotContent.match(/^(.+?)<br\/><span[^>]*>\([^)]+\)<br\/>(.+?)<\/span>$/);
            if (match) {
              const subject = match[1];
              const facultyId = match[2];
              
              slots.push({
                timetable_id: timetableId,
                day,
                slot_number: slotIndex,
                subject,
                faculty_id: facultyId
              });
            }
          }
        });
      });

      if (slots.length > 0) {
        const { error: slotsError } = await supabase
          .from('timetable_slots')
          .insert(slots);

        if (slotsError) {
          console.error('Error saving timetable slots:', slotsError);
          throw new Error('Failed to save timetable slots');
        }
      }

      return timetableId;
    } catch (error) {
      console.error('Error in saveTimetable:', error);
      throw error;
    }
  },

  // Check for faculty conflicts across all saved timetables
  async checkFacultyConflicts(day: string, slotNumber: number, facultyId: string): Promise<FacultyConflict[]> {
    const { data: conflictingSlots, error } = await supabase
      .from('timetable_slots')
      .select(`
        *,
        timetables!inner (
          id,
          department,
          semester,
          block,
          classroom
        )
      `)
      .eq('day', day)
      .eq('slot_number', slotNumber)
      .eq('faculty_id', facultyId);

    if (error) {
      console.error('Error checking faculty conflicts:', error);
      throw new Error('Failed to check faculty conflicts');
    }

    return conflictingSlots.map((slot: any) => ({
      timetable: `${slot.timetables.department} - ${slot.timetables.semester} (${slot.timetables.block})`,
      department: slot.timetables.department,
      semester: slot.timetables.semester,
      day,
      slot: slotNumber + 1
    }));
  },

  // Validate entire timetable for conflicts before saving
  async validateTimetableConflicts(timetableData: { [day: string]: string[] }): Promise<{ valid: boolean; conflicts: string[] }> {
    const conflicts: string[] = [];

    for (const [day, daySlots] of Object.entries(timetableData)) {
      for (let slotIndex = 0; slotIndex < daySlots.length; slotIndex++) {
        const slotContent = daySlots[slotIndex];
        if (slotContent && slotContent.trim() !== '') {
          const match = slotContent.match(/^(.+?)<br\/><span[^>]*>\([^)]+\)<br\/>(.+?)<\/span>$/);
          if (match) {
            const facultyId = match[2];
            const existingConflicts = await this.checkFacultyConflicts(day, slotIndex, facultyId);
            
            if (existingConflicts.length > 0) {
              conflicts.push(
                `${facultyId} is already teaching on ${day} slot ${slotIndex + 1} in ${existingConflicts[0].timetable}`
              );
            }
          }
        }
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts
    };
  },

  // Get all saved timetables
  async getAllTimetables(): Promise<DatabaseTimetable[]> {
    const { data, error } = await supabase
      .from('timetables')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching timetables:', error);
      throw new Error('Failed to fetch timetables');
    }

    return data || [];
  },

  // Get timetable with slots by ID
  async getTimetableById(timetableId: string) {
    const { data: timetable, error: timetableError } = await supabase
      .from('timetables')
      .select('*')
      .eq('id', timetableId)
      .single();

    if (timetableError) {
      console.error('Error fetching timetable:', timetableError);
      throw new Error('Failed to fetch timetable');
    }

    const { data: slots, error: slotsError } = await supabase
      .from('timetable_slots')
      .select('*')
      .eq('timetable_id', timetableId)
      .order('day')
      .order('slot_number');

    if (slotsError) {
      console.error('Error fetching timetable slots:', slotsError);
      throw new Error('Failed to fetch timetable slots');
    }

    return { timetable, slots: slots || [] };
  },

  // Get faculty availability for a specific faculty member
  async getFacultyAvailability(facultyId: string): Promise<{ day: string; slot: number; subject: string; timetable: string }[]> {
    const { data: slots, error } = await supabase
      .from('timetable_slots')
      .select(`
        day,
        slot_number,
        subject,
        timetables!inner (
          department,
          semester,
          block,
          classroom
        )
      `)
      .eq('faculty_id', facultyId);

    if (error) {
      console.error('Error fetching faculty availability:', error);
      return [];
    }

    return slots.map((slot: any) => ({
      day: slot.day,
      slot: slot.slot_number + 1,
      subject: slot.subject,
      timetable: `${slot.timetables.department} - ${slot.timetables.semester} (${slot.timetables.block})`
    }));
  }
};