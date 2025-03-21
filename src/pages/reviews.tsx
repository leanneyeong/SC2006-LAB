import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Star, User } from 'lucide-react';
import { Navigation } from '~/components/global/navigation';
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { TopBar } from '~/components/global/top-bar-others'; // Updated import path

const LeaveReviewPage: React.FC = () => {
  // State for TopBar component
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [evCharging, setEvCharging] = useState<boolean>(false);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);
  
  // State for the review form
  const [title, setTitle] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  
  // Current user information (in a real app, this would come from authentication)
  const currentUser = {
    name: 'Jeremy Lim',
    date: '05/03/25',
    image: '/images/avatar.jpg'
  };
  
  // Car park information (in a real app, this would be fetched from an API)
  const carPark = {
    name: 'Takashimaya Parking',
    location: 'Orchard',
    price: '$12/hr',
    availability: '27 Lots',
    sheltered: true,
    evCharging: true
  };

  // Function to handle star rating
  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  // Render star rating component
  const renderStars = (currentRating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-6 h-6 cursor-pointer ${i <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}`}
          onClick={() => handleRatingClick(i)}
        />
      );
    }
    return stars;
  };

  // Submit review handler
  const handleSubmitReview = () => {
    // In a real app, this would send the review to a backend API
    console.log({
      carPark: carPark.name,
      title,
      reviewText,
      rating,
      user: currentUser.name,
      date: new Date().toLocaleDateString()
    });
    
    // Reset form after submission
    setTitle('');
    setReviewText('');
    setRating(0);
    
    // Show success message (in a real app, this would be a toast)
    alert('Review submitted successfully!');
  };

  return (
    <Navigation>
      <div className="flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <TopBar />

        {/* Content */}
        <main className="flex-grow p-4 bg-gray-50 dark:bg-gray-800">
          {/* Title Bar */}
          <div className="bg-white dark:bg-gray-700 p-3 mb-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 text-center">
            <h2 className="text-xl font-bold dark:text-white">Leave A Review</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Car Park Info */}
            <div className="space-y-6">
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="dark:text-white">Car Park Details</CardTitle>
                </CardHeader>
                <CardContent className="dark:text-white">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{carPark.name}</h3>
                      <p className="text-gray-500 dark:text-gray-300">{carPark.location}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Price</p>
                        <p className="font-medium">{carPark.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Availability</p>
                        <p className="font-medium text-green-600">{carPark.availability}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={carPark.sheltered} 
                          readOnly 
                          className="form-checkbox h-4 w-4 text-blue-500 mr-2"
                        />
                        <span>Sheltered</span>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={carPark.evCharging} 
                          readOnly 
                          className="form-checkbox h-4 w-4 text-blue-500 mr-2"
                        />
                        <span>EV Parking</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="dark:text-white">Previous Reviews</CardTitle>
                </CardHeader>
                <CardContent className="dark:text-white">
                  <div className="space-y-4">
                    <div className="border-b dark:border-gray-600 pb-4">
                      <div className="flex mb-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <Star className="w-5 h-5 fill-none text-gray-300 dark:text-gray-500" />
                      </div>
                      <p className="font-bold mb-1">Convenient but PRICEY</p>
                      <p className="text-sm mb-3 dark:text-gray-200">
                        The car park is well-maintained with plenty of available spaces, even during peak hours. 
                        It's well-lit and safe, but the hourly rates are quite high compared to nearby options. 
                        Great for short stays but might not be the best for long-term parking.
                      </p>
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden mr-3">
                          <User className="h-full w-full p-1" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Rachel Tan</p>
                          <p className="text-gray-500 dark:text-gray-300 text-xs">27/01/23</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Review Form */}
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">Write Your Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden mr-3">
                        <User className="h-full w-full p-1" />
                      </div>
                      <div>
                        <p className="font-medium text-sm dark:text-white">{currentUser.name}</p>
                        <p className="text-gray-500 dark:text-gray-300 text-xs">{currentUser.date}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="rating" className="block mb-2 dark:text-white">Rating</Label>
                    <div className="flex space-x-1" id="rating">
                      {renderStars(rating)}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="title" className="block mb-2 dark:text-white">Title</Label>
                    <Input
                      id="title"
                      placeholder="Add a title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full dark:bg-gray-600 dark:text-white dark:border-gray-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="review" className="block mb-2 dark:text-white">Review</Label>
                    <Textarea
                      id="review"
                      placeholder="Share your experience with this car park..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full min-h-32 dark:bg-gray-600 dark:text-white dark:border-gray-500"
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleSubmitReview}
                    disabled={!reviewText || rating === 0}
                  >
                    Submit Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </Navigation>
  );
};

export default LeaveReviewPage;