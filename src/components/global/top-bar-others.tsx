import React from 'react';
import { UserButton } from "@clerk/nextjs";

// TopBar Component
export const TopBar: React.FC = () => {
  return (
    <header className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Parking made Smarter</h1>
        <div className="ml-auto">
          <UserButton />
        </div>
      </div>
    </header>
  );
};