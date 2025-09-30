import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Timetable Generator</h1>
            <p className="text-sm text-gray-600">
              Welcome, {profile?.username || user.email}
              {profile?.role && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {profile.role}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;