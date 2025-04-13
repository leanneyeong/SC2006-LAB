import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Star, User } from 'lucide-react';
import { Navigation } from '~/components/global/navigation';
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { TopBar } from '~/components/global/top-bar-others';
import { useRouter } from 'next/router';
import { ScrollArea } from '~/components/ui/scroll-area';
import { api, RouterOutputs } from '~/utils/api';
import getAvailabilityColour from "~/utils/get-availability-colour";
import getDistanceBetweenCarPark from "~/utils/get-distance-between-carpark";

// Define the CarPark interface to match index.tsx
interface CarParkProps {
  id: string;
  address: string;
  carParkType: string;
  typeOfParkingSystem: string;
  availableLots: number;
  carParkNo: string;
  location: {
    x: number;
    y: number;
  };
  price: string;
  isFavourited?: boolean;
}

// Define Review interface from database using the API's output type
type DBReviewProps = RouterOutputs["carPark"]["getReviews"][number];

// Define Review display interface
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
    id: '',
    address: 'Loading...',
    carParkType: '',
    typeOfParkingSystem: '',
    availableLots: 0,
    carParkNo: '',
    location: { x: 0, y: 0 },
    price: '',
    isFavourited: false
  });

  // State for reviews from database
  const [previousReviews, setPreviousReviews] = useState<ReviewProps[]>([]);

  // Helper function to ensure string type from query parameters
  const getQueryParamAsString = (param: string | string[] | undefined): string => {
    if (!param) return '';
    return Array.isArray(param) ? param[0] : param;
  };

  // Fetch reviews from API using the car park ID
  const fetchReviews = async (carParkId: string) => {
    try {
      // Define the reviews query
      const reviewsQuery = api.carPark.getReviews;
      
      // Call the tRPC method to get reviews for the carpark
      const carparkReviews = await reviewsQuery.fetch({ id: carParkId });
      
      // Transform database reviews to the format expected by the UI
      const transformedReviews: ReviewProps[] = carparkReviews.map((dbReview) => ({
        rating: dbReview.rating,
        title: "", // Title not stored in database, show first part of description instead
        content: dbReview.description,
        author: `${dbReview.userFirstName} ${dbReview.userLastName}`,
        date: new Date().toLocaleDateString('en-GB') // Using current date as created date not returned
      }));
      
      setPreviousReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to empty reviews array
      setPreviousReviews([]);
    }
  };

  // Fetch car park details from query parameters when the component mounts
  useEffect(() => {
    if (router.isReady) {
      const carparkId = getQueryParamAsString(router.query.id);
      const carparkAddress = getQueryParamAsString(router.query.name);
      const carparkType = getQueryParamAsString(router.query.carParkType);
      const parkingSystem = getQueryParamAsString(router.query.typeOfParkingSystem);
      const availableLots = getQueryParamAsString(router.query.availableLots);
      const carparkNo = getQueryParamAsString(router.query.carParkNo);
      const locationX = parseFloat(getQueryParamAsString(router.query.locationX) || '0');
      const locationY = parseFloat(getQueryParamAsString(router.query.locationY) || '0');
      const isFavorited = getQueryParamAsString(router.query.isFavorite) === 'true';
      
      // Calculate pricing using the same logic as in index.tsx
      let price = '0.60/30min';
      const central_area = ["ACB", "BBB", "BRBI", "CY", "DUXM", "HLM", "KAB", "KAM", "KAS", "PRM", "SLS", "SR1", "SR2", "TPM", "UCS", "WCB"];
      const peak_hour = ["ACB", "CY", "SE21", "SE22", "SE24", "MP14", "MP15", "MP16", "HG9", "HG9T", "HG15", "HG16"];
      const lub = ["GSML", "BRBL", "JCML", "T55", "GEML", "KAML", "J57L", "J60L", "TPL", "EPL", "BL8L"];
      
      if (lub.includes(carparkNo)) {
        price = "$2-$4/30min";
      } else if (peak_hour.includes(carparkNo)) {
        price = "$0.60-$1.20/ 30min";
      } else if (central_area.includes(carparkNo)) {
        price = "$0.60-$1.20/30min";
      }
      
      // Set carpark details to match index.tsx format
      setCarPark({
        id: carparkId || '',
        address: carparkAddress || 'Unknown Carpark',
        carParkType: carparkType || '',
        typeOfParkingSystem: parkingSystem || '',
        availableLots: parseInt(availableLots || '0'),
        carParkNo: carparkNo || '',
        location: { 
          x: locationX,
          y: locationY
        },
        price: price,
        isFavourited: isFavorited
      });
      
      // If we have a carpark ID, fetch reviews for it
      if (carparkId) {
        void fetchReviews(carparkId);
      }
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
  const handleSubmitReview = async () => {
    try {
      const carparkId = getQueryParamAsString(router.query.id);
      
      if (!carparkId) {
        alert('Carpark ID is missing. Cannot submit review.');
        return;
      }
      
      // Get the review mutation
      const reviewMutation = api.carPark.review;
      
      // Call the tRPC API to save the review
      await reviewMutation.mutate({
        id: carparkId,
        rating: rating,
        description: title ? `${title}: ${reviewText}` : reviewText
      });
      
      // Reset form after submission
      setTitle('');
      setReviewText('');
      setRating(0);
      
      // Show success message
      alert('Review submitted successfully!');
      
      // Refresh the reviews list
      void fetchReviews(carparkId);
      
      // Navigate back to the carpark details page
      void router.back();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  // Function to handle cancellation
  const handleCancel = () => {
    void router.back();
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
              <Card className="overflow-hidden border border-gray-200 dark:border-gray-600 dark:bg-gray-700">
                <CardContent className="p-6 dark:text-white">
                  <h3 className="mb-2 text-xl font-bold">{carPark.address}</h3>
                  <p>
                    <span className="font-medium">Carpark Type:</span>{" "}
                    {carPark.carParkType}
                  </p>
                  <p>
                    <span className="font-medium">Parking System:</span>{" "}
                    {carPark.typeOfParkingSystem}
                  </p>
                  <p>
                    <span className="font-medium">Availability:</span>{" "}
                    <span className={getAvailabilityColour(carPark.availableLots)}>
                      {carPark.availableLots}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Pricing:</span>{" "}
                    {carPark.price}
                  </p>
                  {/* Display distance from current location */}
                  <p>
                    <span className="font-medium">Distance:</span>{" "}
                    <span className="text-blue-600">
                      {getDistanceBetweenCarPark(carPark.location)} km
                    </span>
                  </p>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="dark:text-white">Previous Reviews</CardTitle>
                </CardHeader>
                <CardContent className="dark:text-white p-0">
                  <ScrollArea className="h-80 px-4">
                    <div className="space-y-4 py-4">
                      {previousReviews.length > 0 ? (
                        previousReviews.map((review, index) => (
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
                        ))
                      ) : (
                        <div className="flex justify-center items-center h-40">
                          <p className="text-gray-500 dark:text-gray-300">No reviews yet</p>
                        </div>
                      )}
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