import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Navigation } from "~/components/global/navigation-admin";
import { Search, Trash2, Edit2 } from "lucide-react";
import { useRouter } from "next/router";

interface Carpark {
  id: string;
  name: string;
  area: string;
  availability: number;
  agency: string;
  price: number;
}

// Main CarparkManagement Component
const CarparkManagement: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingCarparkId, setEditingCarparkId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Carpark | null>(null);
  const [isAddingCarpark, setIsAddingCarpark] = useState<boolean>(false);
  const [newCarparkData, setNewCarparkData] = useState<Omit<Carpark, 'id'>>({
    name: "",
    area: "",
    availability: 0,
    agency: "",
    price: 0.00
  });
  
  // Sample carpark data - converted to state so we can update it
  const [carparks, setCarparks] = useState<Carpark[]>([
    {
      id: "CP001",
      name: "Central Plaza Parking",
      area: "Downtown",
      availability: 45,
      agency: "Urban Parking Ltd",
      price: 2.50
    },
    {
      id: "CP002",
      name: "Riverside Garage",
      area: "Waterfront",
      availability: 12,
      agency: "City Spaces Inc",
      price: 3.00
    },
    {
      id: "CP003",
      name: "Market Square Lot",
      area: "Commercial District",
      availability: 0,
      agency: "Urban Parking Ltd",
      price: 2.75
    },
    {
      id: "CP004",
      name: "Tech Hub Parking",
      area: "Innovation Park",
      availability: 78,
      agency: "Smart Park Solutions",
      price: 4.50
    },
    {
      id: "CP005",
      name: "Stadium Lot A",
      area: "Sports Complex",
      availability: 120,
      agency: "Event Parking Co",
      price: 5.00
    },
    {
      id: "CP006",
      name: "Airport Terminal Garage",
      area: "Airport",
      availability: 35,
      agency: "Transit Authority",
      price: 6.25
    },
    {
      id: "CP007",
      name: "Mall Central Parking",
      area: "Shopping District",
      availability: 24,
      agency: "Retail Park Management",
      price: 2.00
    }
  ]);

  // State for filtered carparks - initially set to all carparks
  const [filteredCarparks, setFilteredCarparks] = useState<Carpark[]>(carparks);

  // Function to convert user input with wildcards (*) to RegExp pattern
  const createWildcardPattern = (input: string): RegExp => {
    // Escape special RegExp characters except asterisk
    const escapedInput = input.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace * with .* for wildcard matching
    const pattern = escapedInput.replace(/\*/g, '.*');
    
    // Create RegExp that matches anywhere in string
    return new RegExp(pattern);
  };

  // Function to check if a string matches a pattern
  const matches = (text: string, pattern: RegExp): boolean => {
    return pattern.test(text);
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredCarparks(carparks);
    } else {
      const searchPattern = createWildcardPattern(searchQuery.trim().toLowerCase());
      
      const filtered = carparks.filter(carpark => {
        // Search only in carpark ID and name fields
        return (
          matches(carpark.id.toLowerCase(), searchPattern) ||
          matches(carpark.name.toLowerCase(), searchPattern)
        );
      });
      
      setFilteredCarparks(filtered);
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
  const handleNavigation = (path: string) => {
    void router.push(path);
  };
  
  // Handle edit button click
  const handleEditClick = (carpark: Carpark) => {
    setEditingCarparkId(carpark.id);
    setEditFormData({...carpark});
  };
  
  // Handle save after editing
  const handleSaveEdit = () => {
    if (editFormData) {
      // Update the carparks array with the edited data
      const updatedCarparks = carparks.map(carpark => 
        carpark.id === editingCarparkId ? editFormData : carpark
      );
      
      // Update state with the new carparks array
      setCarparks(updatedCarparks);
      
      // Update filteredCarparks to reflect the changes
      setFilteredCarparks(prevFiltered => 
        prevFiltered.map(carpark => 
          carpark.id === editingCarparkId ? editFormData : carpark
        )
      );
      
      // In a real app, you would also save changes to your backend here
      
      // Reset editing state
      setEditingCarparkId(null);
      setEditFormData(null);
    }
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCarparkId(null);
    setEditFormData(null);
  };
  
  // Handle delete
  const handleDelete = (carparkId: string) => {
    // Filter out the deleted carpark
    const updatedCarparks = carparks.filter(carpark => carpark.id !== carparkId);
    
    // Update state with the new carparks array
    setCarparks(updatedCarparks);
    
    // Also update filteredCarparks
    setFilteredCarparks(filteredCarparks.filter(carpark => carpark.id !== carparkId));
    
    // In a real app, you would also delete from your backend here
  };
  
  // Handle adding a new carpark
  const handleAddNewCarpark = () => {
    setIsAddingCarpark(true);
  };
  
  // Handle canceling new carpark addition
  const handleCancelNewCarpark = () => {
    setIsAddingCarpark(false);
    setNewCarparkData({
      name: "",
      area: "",
      availability: 0,
      agency: "",
      price: 0.00
    });
  };
  
  // Handle saving new carpark
  const handleSaveNewCarpark = () => {
    // Validate that all fields are filled
    if (
      !newCarparkData.name.trim() || 
      !newCarparkData.area.trim() || 
      !newCarparkData.agency.trim() || 
      newCarparkData.availability === null || 
      newCarparkData.price === null
    ) {
      alert("Please fill in all fields before saving.");
      return;
    }
    
    // Generate a new ID (in a real app, this would likely come from the backend)
    const newId = `CP${String(carparks.length + 1).padStart(3, '0')}`;
    
    // Create new carpark object
    const newCarpark: Carpark = {
      id: newId,
      ...newCarparkData
    };
    
    // Add to carparks array
    const updatedCarparks = [...carparks, newCarpark];
    setCarparks(updatedCarparks);
    
    // Also update filteredCarparks to include the new carpark
    setFilteredCarparks([...filteredCarparks, newCarpark]);
    
    // Reset the form
    handleCancelNewCarpark();
  };
  
  // Handle form field changes for editing
  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: keyof Carpark
  ) => {
    if (editFormData) {
      let value: string | number = e.target.value;
      
      // Handle numeric values
      if (field === 'availability') {
        value = parseInt(value) || 0;
      } else if (field === 'price') {
        // Only allow numeric input for price
        const numericValue = e.target.value.replace(/[^0-9.]/g, '');
        if (numericValue === '' || !isNaN(parseFloat(numericValue))) {
          value = numericValue;
        } else {
          return; // Don't update if not a valid number
        }
      }
      
      setEditFormData({
        ...editFormData,
        [field]: value
      });
    }
  };
  
  // Handle new carpark form changes
  const handleNewCarparkChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: keyof Omit<Carpark, 'id'>
  ) => {
    let value: string | number = e.target.value;
      
    // Handle numeric values
    if (field === 'availability') {
      value = parseInt(value) || 0;
    } else if (field === 'price') {
      // Only allow numeric input for price
      const numericValue = e.target.value.replace(/[^0-9.]/g, '');
      if (numericValue === '' || !isNaN(parseFloat(numericValue))) {
        value = numericValue;
      } else {
        return; // Don't update if not a valid number
      }
    }
    
    setNewCarparkData({
      ...newCarparkData,
      [field]: value
    });
  };

  return (
    <Navigation>
      <div className="flex min-h-screen flex-col">
        {/* Top Header Bar */}
        <header className="bg-blue-500 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Car Park Management</h1>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by ID or name"
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
                onClick={handleAddNewCarpark}
              >
                Add New Carpark
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
                {filteredCarparks.length === 0 ? (
                  <div className="my-4 text-center">
                    <p className="text-gray-500">No carparks found matching &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">CarparkID</TableHead>
                        <TableHead className="font-semibold">Carpark Name</TableHead>
                        <TableHead className="font-semibold">Area</TableHead>
                        <TableHead className="font-semibold">Availability</TableHead>
                        <TableHead className="font-semibold">Agency</TableHead>
                        <TableHead className="text-right font-semibold">Price</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCarparks.map((carpark) => (
                        <TableRow key={carpark.id}>
                          <TableCell>{carpark.id}</TableCell>
                          {editingCarparkId === carpark.id ? (
                            <>
                              <TableCell>
                                <Input 
                                  value={editFormData?.name} 
                                  onChange={(e) => handleEditFormChange(e, 'name')} 
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={editFormData?.area} 
                                  onChange={(e) => handleEditFormChange(e, 'area')} 
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number"
                                  step="1"
                                  value={editFormData?.availability} 
                                  onChange={(e) => handleEditFormChange(e, 'availability')} 
                                  className="w-full"
                                  onKeyDown={(e) => {
                                    // Prevent up/down arrow keys
                                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={editFormData?.agency} 
                                  onChange={(e) => handleEditFormChange(e, 'agency')} 
                                  className="w-full"
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="text"
                                  value={editFormData?.price} 
                                  onChange={(e) => handleEditFormChange(e, 'price')} 
                                  className="w-full"
                                  placeholder="0"
                                  onKeyDown={(e) => {
                                    // Only allow numbers, backspace, delete, tab, etc.
                                    if (!/^[0-9.]$/.test(e.key) && 
                                        e.key !== 'Backspace' && 
                                        e.key !== 'Delete' && 
                                        e.key !== 'Tab' && 
                                        e.key !== 'ArrowLeft' && 
                                        e.key !== 'ArrowRight') {
                                      // Allow Copy/Paste
                                      if (!(e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a'))) {
                                        e.preventDefault();
                                      }
                                    }
                                  }}
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
                              <TableCell>{carpark.name}</TableCell>
                              <TableCell>{carpark.area}</TableCell>
                              <TableCell>{carpark.availability}</TableCell>
                              <TableCell>{carpark.agency}</TableCell>
                              <TableCell className="text-right">${carpark.price}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    size="sm"
                                    onClick={() => handleEditClick(carpark)}
                                  >
                                    <Edit2 size={16} className="mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    className="bg-red-600 hover:bg-red-700"
                                    size="sm"
                                    onClick={() => handleDelete(carpark.id)}
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
                      
                      {/* Add new carpark row */}
                      {isAddingCarpark && (
                        <TableRow>
                          <TableCell>New</TableCell>
                          <TableCell>
                            <Input 
                              value={newCarparkData.name} 
                              onChange={(e) => handleNewCarparkChange(e, 'name')} 
                              className="w-full"
                              placeholder="Carpark Name"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={newCarparkData.area} 
                              onChange={(e) => handleNewCarparkChange(e, 'area')} 
                              className="w-full"
                              placeholder="Area"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number"
                              step="1"
                              value={newCarparkData.availability} 
                              onChange={(e) => handleNewCarparkChange(e, 'availability')} 
                              className="w-full"
                              placeholder="Availability"
                              required
                              min="0"
                              onKeyDown={(e) => {
                                // Prevent up/down arrow keys
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={newCarparkData.agency} 
                              onChange={(e) => handleNewCarparkChange(e, 'agency')} 
                              className="w-full"
                              placeholder="Agency"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="text"
                              value={newCarparkData.price} 
                              onChange={(e) => handleNewCarparkChange(e, 'price')} 
                              className="w-full"
                              placeholder="0"
                              required
                              onKeyDown={(e) => {
                                // Only allow numbers, backspace, delete, tab, etc.
                                if (!/^[0-9.]$/.test(e.key) && 
                                    e.key !== 'Backspace' && 
                                    e.key !== 'Delete' && 
                                    e.key !== 'Tab' && 
                                    e.key !== 'ArrowLeft' && 
                                    e.key !== 'ArrowRight') {
                                  // Allow Copy/Paste
                                  if (!(e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a'))) {
                                    e.preventDefault();
                                  }
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                className="bg-green-600 text-white hover:bg-green-700"
                                size="sm"
                                onClick={handleSaveNewCarpark}
                              >
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                className="bg-gray-500 text-white hover:bg-gray-600"
                                size="sm"
                                onClick={handleCancelNewCarpark}
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
                    Showing {filteredCarparks.length} of {carparks.length} carparks
                  </p>
                )}
                
                {searchQuery.trim() === '' && (
                  <p className="mt-4 text-center text-sm text-gray-500">
                    Select Car Park to manage.
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

export default CarparkManagement;