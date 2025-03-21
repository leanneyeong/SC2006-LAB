import React from 'react';

// Define TypeScript interface
interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  evCharging: boolean;
  setEvCharging: (checked: boolean) => void;
  shelteredCarpark: boolean;
  setShelteredCarpark: (checked: boolean) => void;
}

// TopBar Component
export const TopBar: React.FC<TopBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  evCharging, 
  setEvCharging, 
  shelteredCarpark, 
  setShelteredCarpark 
}) => {
  return (
    <header className="bg-blue-500 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">ParkSMART</h1>
      </div>
    </header>
  );
};