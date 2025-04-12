import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Star, User } from 'lucide-react';
import { Navigation } from '~/components/global/navigation';
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { TopBar } from '~/components/global/top-bar-others';
import { useRouter } from 'next/router';
import { ScrollArea } from '~/components/ui/scroll-area';

// Define the CarPark interface
interface CarParkProps {
  name: string;
  location: string;
  price: string;
  availability: string;
  sheltered: boolean;
  evCharging: boolean;
}

// Define Review interface
interface ReviewProps {
  rating: number;
  title: string;
  content: string;
  author: string;
  date: string;
}

const LeaveReviewPage: React.FC = () => {
  const router = useRouter();
  
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
    date: new Date().toLocaleDateString('en-GB'), // Current date in DD/MM/YY format
    image: '/images/avatar.jpg'
  };
  
  // State for car park information (will be updated from query params)
  const [carPark, setCarPark] = useState<CarParkProps>({
    name: 'Loading...',
    location: '',
    price: '',
    availability: '',
    sheltered: true,
    evCharging: true
  });

  // Sample previous reviews data
  const previousReviews: ReviewProps[] = [
    {
      rating: 4,
      title: "Convenient but PRICEY",
      content: "The car park is well-maintained with plenty of available spaces, even during peak hours. It's well-lit and safe, but the hourly rates are quite high compared to nearby options. Great for short stays but might not be the best for long-term parking.",
      author: "Rachel Tan",
      date: "27/01/23"
    },
    {
      rating: 5,
      title: "Best parking in Marina area",
      content: "Absolutely worth every dollar! Clean, spacious parking spots and the EV charging stations are always well-maintained. Security is visible and I've never had any issues leaving my car here even overnight.",
      author: "Michael Chen",
      date: "15/02/23"
    },
    {
      rating: 3,
      title: "Decent but expensive",
      content: "The location is perfect if you're visiting Suntec City Mall. Sheltered parking is a plus during rainy days. However, weekend rates are excessive. Consider public transport if staying more than 2 hours.",
      author: "Sarah Wong",
      date: "03/03/23"
    },
    {
      rating: 5,
      title: "EV charging is excellent",
      content: "As an electric vehicle owner, I appreciate the number of charging stations available. Never had to wait for a spot, even on weekends. The app integration with payment makes the experience seamless.",
      author: "Lim Teck Wee",
      date: "19/04/23"
    },
    {
      rating: 2,
      title: "Narrow parking spaces",
      content: "While the location is convenient, the parking spaces are too narrow for larger vehicles. Had a difficult time maneuvering my SUV. The price doesn't justify the stress of parking here. Will avoid in future.",
      author: "Jason Koh",
      date: "08/06/23"
    },
    {
      rating: 4,
      title: "Good for weekend shopping",
      content: "I regularly park here when shopping at Suntec. The rates are reasonable on weekends if you get the mall discount. The sheltered parking means your car doesn't turn into an oven during hot days. Recommended!",
      author: "Priya Sharma",
      date: "27/09/23"
    },
    {
      rating: 3,
      title: "Hit or miss during events",
      content: "Normal days it's fine, but during events at Suntec Convention Centre it becomes a nightmare to find a spot. If there's an exhibition, come early or use alternative transport. Otherwise, it's a decent car park with good security.",
      author: "David Lau",
      date: "14/11/23"
    }
  ];

  // Helper function to ensure string type from query parameters
  const getQueryParamAsString = (param: string | string[] | undefined): string => {
    if (!param) return '';
    return Array.isArray(param) ? param[0] : param;
  };

  // Fetch car park details from query parameters when the component mounts
  useEffect(() => {
    if (router.isReady) {
      const carparkName = getQueryParamAsString(router.query.carparkName);
      const carparkLocation = getQueryParamAsString(router.query.carparkLocation);
      const lots = getQueryParamAsString(router.query.lots);
      const type = getQueryParamAsString(router.query.type);
      
      // Get carpark details from query params or use default values
      setCarPark(prevState => ({
        ...prevState,
        name: carparkName || 'Unknown Carpark',
        location: carparkLocation || 'Unknown Location',
        // If lots and type are provided, use them, otherwise use a default value
        availability: lots && type ? `${lots} ${type}` : (
          lots ? `${lots} Lots` : (
            carparkLocation === 'Orchard' ? '27 Lots' : '15 Lots'
          )
        ),
        // Determine price based on location (can be enhanced with actual pricing data)
        price: carparkLocation === 'Orchard' ? '$12/hr' : 
               carparkLocation === 'Downtown' ? '$10/hr' : '$5/hr',
      }));
    }
  }, [router.isReady, router.query]);

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

  // Render stars for display only (not clickable)
  const renderDisplayStars = (starRating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-5 h-5 ${i <= starRating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300 dark:text-gray-500'}`}
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
    
    // Navigate back to the carpark details page
    router.back();
  };

  // Function to handle cancellation
  const handleCancel = () => {
    router.back();
  };

  return (
    <Navigation>
      <div className="flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <TopBar />

        {/* Content */}
        <main className="flex-grow p-4 bg-gray-50 dark:bg-gray-800">
          {/* Title Bar */}
          <div className="bg-white dark:bg-gray-700 p-3 mb-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <button 
              onClick={handleCancel}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm dark:bg-gray-600 dark:text-white"
            >
              Back
            </button>
            <h2 className="text-xl font-bold dark:text-white">Leave A Review</h2>
            <div className="w-16"></div> {/* Spacer for centering */}
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
                <CardContent className="dark:text-white p-0">
                  <ScrollArea className="h-80 px-4">
                    <div className="space-y-4 py-4">
                      {previousReviews.map((review, index) => (
                        <div key={index} className="border-b dark:border-gray-600 pb-4 last:border-b-0">
                          <div className="flex mb-2">
                            {renderDisplayStars(review.rating)}
                          </div>
                          <p className="font-bold mb-1">{review.title}</p>
                          <p className="text-sm mb-3 dark:text-gray-200">
                            {review.content}
                          </p>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden mr-3">
                              <User className="h-full w-full p-1" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{review.author}</p>
                              <p className="text-gray-500 dark:text-gray-300 text-xs">{review.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
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
                  
                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleSubmitReview}
                      disabled={!reviewText || rating === 0}
                    >
                      Submit Review
                    </Button>
                  </div>
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