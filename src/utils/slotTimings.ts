// Updated slot timings: 8:00 AM - 4:35 PM, 50-minute slots with break from 10:30-10:45
export const SLOT_TIMINGS = [
  '8:00 - 8:50',    // Slot 1
  '8:50 - 9:40',    // Slot 2
  '9:40 - 10:30',   // Slot 3
  '10:45 - 11:35',  // Slot 4 (after break)
  '11:35 - 12:25',  // Slot 5
  '12:25 - 1:15',   // Slot 6
  '1:15 - 2:05',    // Slot 7
  '2:05 - 2:55',    // Slot 8
  '2:55 - 3:45',    // Slot 9
  '3:45 - 4:35'     // Slot 10
];

export const BREAK_TIME = '10:30 - 10:45';

export const getSlotTiming = (slotIndex: number): string => {
  return SLOT_TIMINGS[slotIndex] || `Slot ${slotIndex + 1}`;
};

export const getTotalSlots = (): number => {
  return SLOT_TIMINGS.length;
};