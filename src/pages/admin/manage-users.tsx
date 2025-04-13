import React, { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Navigation } from "~/components/global/navigation-admin";
import { Search, Trash2, Edit2 } from "lucide-react";
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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState<boolean>(false);
  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>>({
    firstName: "",
    lastName: "",
    dateJoined: new Date().toISOString().slice(0, 10),
    lastActive: new Date().toISOString().slice(0, 10)
  });
  
  // Sample user data - converted to state so we can update it
  const [users, setUsers] = useState<User[]>([
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
  ]);

  // State for filtered users - initially set to all users
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

  // Function to check if any word in a string starts with the search query
  const matchesWordStart = (text: string, query: string): boolean => {
    // If query contains wildcard, use the wildcard pattern
    if (query.includes('*')) {
      const pattern = createWildcardPattern(query);
      return pattern.test(text);
    }
    
    // Split the text into words and check if any word starts with the query
    const words = text.split(/\s+/);
    return words.some(word => word.toLowerCase().startsWith(query.toLowerCase()));
  };
  
  // Function to convert user input with wildcards (*) to RegExp pattern
  const createWildcardPattern = (input: string): RegExp => {
    // Escape special RegExp characters except asterisk
    const escapedInput = input.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace * with .* for wildcard matching
    const pattern = escapedInput.replace(/\*/g, '.*');
    
    // Create RegExp that matches anywhere in string
    return new RegExp(pattern);
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.trim().toLowerCase();
      
      const filtered = users.filter(user => {
        // For ID, check if it contains the query
        const idMatch = user.id.toLowerCase().includes(query);
        
        // For first name, check if any word starts with the query
        const firstNameMatch = matchesWordStart(user.firstName, query);
        
        // For last name, check if any word starts with the query
        const lastNameMatch = matchesWordStart(user.lastName, query);
        
        return idMatch || firstNameMatch || lastNameMatch;
      });
      
      setFilteredUsers(filtered);
    }
    
    console.log("Searching for:", searchQuery);
  };

  // Handle key press for search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle navigation to different sections
  const handleNavigation = async (path: string) => {
    void router.push(path);
  };
  
  // Handle edit button click
  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({...user});
  };
  
  // Handle save after editing
  const handleSaveEdit = () => {
    if (editFormData) {
      // Update the users array with the edited data
      const updatedUsers = users.map(user => 
        user.id === editingUserId ? editFormData : user
      );
      
      // Update state with the new users array
      setUsers(updatedUsers);
      
      // Update filteredUsers to reflect the changes
      setFilteredUsers(prevFiltered => 
        prevFiltered.map(user => 
          user.id === editingUserId ? editFormData : user
        )
      );
      
      // In a real app, you would also save changes to your backend here
      
      // Reset editing state
      setEditingUserId(null);
      setEditFormData(null);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData(null);
  };
  
  // Handle adding a new user
  const handleAddNewUser = () => {
    setIsAddingUser(true);
  };
  
  // Handle canceling new user addition
  const handleCancelNewUser = () => {
    setIsAddingUser(false);
    setNewUserData({
      firstName: "",
      lastName: "",
      dateJoined: new Date().toISOString().slice(0, 10),
      lastActive: new Date().toISOString().slice(0, 10)
    });
  };
  
  // Handle saving new user
  const handleSaveNewUser = () => {
    // Validate that all fields are filled
    if (
      !newUserData.firstName.trim() || 
      !newUserData.lastName.trim() || 
      !newUserData.dateJoined || 
      !newUserData.lastActive
    ) {
      alert("Please fill in all fields before saving.");
      return;
    }
    
    // Generate a new ID (in a real app, this would likely come from the backend)
    const newId = `USR${String(users.length + 1).padStart(3, '0')}`;
    
    // Create new user object
    const newUser: User = {
      id: newId,
      ...newUserData
    };
    
    // Add to users array
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Also update filteredUsers to include the new user
    setFilteredUsers([...filteredUsers, newUser]);
    
    // Reset the form
    handleCancelNewUser();
  };
  
  // Handle new user form changes
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Omit<User, 'id'>) => {
    setNewUserData({
      ...newUserData,
      [field]: e.target.value
    });
  };
  
  // Handle delete
  const handleDelete = (userId: string) => {
    // Filter out the deleted user
    const updatedUsers = users.filter(user => user.id !== userId);
    
    // Update state with the new users array
    setUsers(updatedUsers);
    
    // Also update filteredUsers
    setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
    
    // In a real app, you would also delete from your backend here
  };
  
  // Handle form field changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof User) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: e.target.value
      });
    }
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
                  placeholder="Search by ID or Name"
                  className="w-64 rounded-md bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </div>
              <Button 
                variant="secondary" 
                className="flex items-center gap-1"
                onClick={handleSearch}
              >
                <Search size={16} />
                Search
              </Button>
              <Button 
                variant="secondary" 
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={handleAddNewUser}
              >
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
                {filteredUsers.length === 0 ? (
                  <div className="my-4 text-center">
                    <p className="text-gray-500">No users found matching &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (
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
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          {editingUserId === user.id ? (
                            <>
                              <TableCell>
                                <Input 
                                  value={editFormData?.firstName} 
                                  onChange={(e) => handleEditFormChange(e, 'firstName')} 
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={editFormData?.lastName} 
                                  onChange={(e) => handleEditFormChange(e, 'lastName')} 
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="date"
                                  value={editFormData?.dateJoined} 
                                  onChange={(e) => handleEditFormChange(e, 'dateJoined')} 
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="date"
                                  value={editFormData?.lastActive} 
                                  onChange={(e) => handleEditFormChange(e, 'lastActive')} 
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    size="sm"
                                    onClick={handleSaveEdit}
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="bg-gray-500 text-white hover:bg-gray-600"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{user.firstName}</TableCell>
                              <TableCell>{user.lastName}</TableCell>
                              <TableCell>{user.dateJoined}</TableCell>
                              <TableCell>{user.lastActive}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    size="sm"
                                    onClick={() => handleEditClick(user)}
                                  >
                                    <Edit2 size={16} className="mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    className="bg-red-600 hover:bg-red-700"
                                    size="sm"
                                    onClick={() => handleDelete(user.id)}
                                  >
                                    <Trash2 size={16} className="mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                      
                      {/* Add new user row */}
                      {isAddingUser && (
                        <TableRow>
                          <TableCell>New</TableCell>
                          <TableCell>
                            <Input 
                              value={newUserData.firstName} 
                              onChange={(e) => handleNewUserChange(e, 'firstName')} 
                              className="w-full"
                              placeholder="First Name"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={newUserData.lastName} 
                              onChange={(e) => handleNewUserChange(e, 'lastName')} 
                              className="w-full"
                              placeholder="Last Name"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="date"
                              value={newUserData.dateJoined} 
                              onChange={(e) => handleNewUserChange(e, 'dateJoined')} 
                              className="w-full"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="date"
                              value={newUserData.lastActive} 
                              onChange={(e) => handleNewUserChange(e, 'lastActive')} 
                              className="w-full"
                              required
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                className="bg-green-600 text-white hover:bg-green-700"
                                size="sm"
                                onClick={handleSaveNewUser}
                              >
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                className="bg-gray-500 text-white hover:bg-gray-600"
                                size="sm"
                                onClick={handleCancelNewUser}
                              >
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}

                {searchQuery.trim() !== '' && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Showing {filteredUsers.length} of {users.length} users
                  </p>
                )}
                
                {searchQuery.trim() === '' && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Select a user to manage.
                  </p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </Navigation>
  );
};

export default UserManagement;