import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Navigation } from "~/components/global/navigation-admin";
import { Search, Trash2 } from "lucide-react";
import { useRouter } from "next/router";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  dateJoined: string;
  lastActive: string;
}

// Main UserManagement Component
const UserManagement: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Sample user data
  const users: User[] = [
    {
      id: "USR001",
      firstName: "John",
      lastName: "Smith",
      dateJoined: "2023-05-12",
      lastActive: "2025-04-05"
    },
    {
      id: "USR002",
      firstName: "Emily",
      lastName: "Johnson",
      dateJoined: "2023-07-23",
      lastActive: "2025-04-02"
    },
    {
      id: "USR003",
      firstName: "Michael",
      lastName: "Williams",
      dateJoined: "2023-08-15",
      lastActive: "2025-04-06"
    },
    {
      id: "USR004",
      firstName: "Sarah",
      lastName: "Brown",
      dateJoined: "2023-10-28",
      lastActive: "2025-03-25"
    },
    {
      id: "USR005",
      firstName: "David",
      lastName: "Miller",
      dateJoined: "2024-01-14",
      lastActive: "2025-04-01"
    },
    {
      id: "USR006",
      firstName: "Jessica",
      lastName: "Davis",
      dateJoined: "2024-02-19",
      lastActive: "2025-03-30"
    },
    {
      id: "USR007",
      firstName: "Robert",
      lastName: "Wilson",
      dateJoined: "2024-03-07",
      lastActive: "2025-04-04"
    }
  ];

  // Handle navigation to different sections
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Navigation>
      <div className="flex min-h-screen flex-col">
        {/* Top Header Bar */}
        <header className="bg-blue-500 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for a user..."
                  className="w-64 rounded-md bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="secondary" className="flex items-center gap-1">
                <Search size={16} />
                Search
              </Button>
              <Button variant="secondary" className="bg-green-600 text-white hover:bg-green-700">
                Add New User
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1">
          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">UserID</TableHead>
                      <TableHead className="font-semibold">First Name</TableHead>
                      <TableHead className="font-semibold">Last Name</TableHead>
                      <TableHead className="font-semibold">Date Joined</TableHead>
                      <TableHead className="font-semibold">Last Active</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.firstName}</TableCell>
                        <TableCell>{user.lastName}</TableCell>
                        <TableCell>{user.dateJoined}</TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            className="bg-red-600 hover:bg-red-700"
                            size="sm"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Select a user to manage.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </Navigation>
  );
};

export default UserManagement;