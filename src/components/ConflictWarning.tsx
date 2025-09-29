import React from 'react';

interface ConflictWarningProps {
  conflicts: string[];
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({ conflicts }) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-destructive p-4 rounded mt-4">
      <div className="text-destructive text-sm">
        <strong>⚠ Faculty Conflicts Detected:</strong>
        <br />
        {conflicts.map((conflict, index) => (
          <div key={index}>{conflict}</div>
        ))}
      </div>
    </div>
  );
};