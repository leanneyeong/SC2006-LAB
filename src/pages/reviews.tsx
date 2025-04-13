import React, { useState, useEffect, useRef } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Star, User } from 'lucide-react';
import { Navigation } from '~/components/global/navigation';
import { TopBar } from '~/components/global/top-bar-others';
import { useRouter } from 'next/router';
import { ScrollArea } from '~/components/ui/scroll-area';
import { api, RouterOutputs } from '~/utils/api';
import getAvailabilityColour from "~/utils/get-availability-colour";
import getDistanceBetweenCarPark from "~/utils/get-distance-between-carpark";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Form, FormField, FormItem, FormMessage } from "~/components/ui/form";
import toast from "react-hot-toast";
import { TRPCClientError } from "@trpc/client";

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

// Define UserData interface to properly type user information
interface UserData {
  id?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

// Define Review interface from database using the API's output type
type DBReviewProps = RouterOutputs["carPark"]["getReviews"][number];

// Define Review display interface
interface ReviewProps {
  rating: number;
  content: string;
  author: string;
  date: string;
}

// Form validation schema
const formSchema = z.object({
  rating: z.number().min(0).max(5),
  description: z.string().min(1)
});

type FormValues = z.infer<typeof formSchema>;

const LeaveReviewPage: React.FC = () => {
  const router = useRouter();

  // State for TopBar component
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [evCharging, setEvCharging] = useState<boolean>(false);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);

  // State for showing toast messages
  const [toastId, setToastId] = useState<string | null>(null);
  // Add state for dialog for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Add query status state
  const [queryStatus, setQueryStatus] = useState<string>('idle');

  // Get current user information from authentication
  const userQuery = api.user.get.useQuery();
  // Explicitly type the userData to avoid 'any' assignment
  const userData: (UserData & { id?: string }) | undefined = userQuery.data as (UserData & { id?: string }) | undefined;
  const isUserLoading = userQuery.isLoading;

  // UseEffect to clear any lingering toasts when component unmounts
  useEffect(() => {
    return () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, [toastId]);

  // Format user data for display
  const currentUser = {
    name: userData ? `${userData.firstName} ${userData.lastName}` : 'Loading...',
    date: new Date().toLocaleDateString('en-GB'), // Current date in DD/MM/YY format
    image: userData?.avatarUrl ?? ''
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

  // Get the car park context for invalidation after mutation
  const carParkContext = api.useUtils().carPark;

  // Get the review mutations
  const reviewMutation = api.carPark.review.useMutation();
  const updateReviewMutation = api.carPark.updateReview.useMutation();
  const deleteReviewMutation = api.carPark.deleteReview.useMutation();

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: undefined,
      description: ""
    }
  });

  // Fetch reviews from API using the car park ID
  const fetchReviews = async (carParkId: string): Promise<void> => {
    console.log('fetchReviews called with ID:', carParkId);
    setQueryStatus('loading');
    try {
      // Use fetch instead of direct tRPC client call to avoid hooks issue
      console.log('Making direct API call to fetch reviews...');
      // Add cache-busting parameter to prevent browser caching
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/api/reviews/${carParkId}?_=${cacheBuster}`, {
        // Add cache control headers to prevent caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reviewData = await response.json() as DBReviewProps[];
      console.log('Review data received:', reviewData);
      console.log('Number of reviews fetched:', reviewData?.length || 0);
      
      // Transform database reviews to the format expected by the UI
      const transformedReviews: ReviewProps[] = reviewData.map((dbReview: DBReviewProps): ReviewProps => {
        return {
          rating: dbReview.rating,
          content: dbReview.description,
          author: `${dbReview.userFirstName} ${dbReview.userLastName}`,
          date: new Date(dbReview.createdAt as string | number | Date).toLocaleDateString('en-GB')
        };
      });
      
      console.log('Transformed reviews:', transformedReviews);
      // Set the reviews with proper typing
      setPreviousReviews(transformedReviews);
      
      // Check if the current user has already submitted a review for this carpark
      if (userData) {
        // First try to match by userId if available
        let userReviewFromDB: DBReviewProps | undefined;
        
        if (userData.id) {
          userReviewFromDB = reviewData.find((review: DBReviewProps) => 
            review.userId === userData.id
          );
        }
        
        // If userId match fails, try matching by name as fallback
        if (!userReviewFromDB) {
          const currentUserFullName = `${userData.firstName} ${userData.lastName}`;
          userReviewFromDB = reviewData.find((review: DBReviewProps) => 
            `${review.userFirstName} ${review.userLastName}` === currentUserFullName
          );
        }
        
        if (userReviewFromDB) {
          console.log('Found existing user review:', userReviewFromDB);
          // User has already submitted a review, set to edit mode
          setUserReview({
            rating: userReviewFromDB.rating,
            content: userReviewFromDB.description
          });
          // Also update the form fields for edit
          setRating(userReviewFromDB.rating);
          setReviewText(userReviewFromDB.description);
          setReviewMode('edit');
        } else {
          // No existing review, set to write mode
          setReviewMode('write');
          setUserReview(null);
        }
      }
      
      setQueryStatus('success');
    } catch (error) {
      console.error('Error fetching reviews:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      if (error instanceof TRPCClientError) {
        console.error('TRPC specific error details:', error.data);
      }
      // Fallback to empty reviews array
      setPreviousReviews([]);
      setQueryStatus('error');
    }
  };

  // Fetch car park details from query parameters when the component mounts
  useEffect(() => {
    if (router.isReady) {
      const carparkId = getQueryParamAsString(router.query.id);
      console.log('Carpark ID from URL:', carparkId);
      
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
      
      // If we have a carpark ID and user data, fetch reviews for it
      if (carparkId && !isUserLoading && userData) {
        console.log('Attempting to fetch reviews for carpark ID:', carparkId);
        void fetchReviews(carparkId);
      } else if (!userData) {
        // Wait for user data to be loaded before fetching reviews
        console.log('User data not yet loaded, waiting before fetching reviews');
      } else {
        console.log('No carpark ID available, skipping review fetch');
      }
    }
  }, [router.isReady, router.query, isUserLoading, userData]);

  // Reference to track if this is an edit operation
  const isEditingRef = useRef<boolean>(false);

  // State for star rating and review text
  const [reviewText, setReviewText] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  // Add new state for review mode - can be 'write', 'edit', or 'view'
  const [reviewMode, setReviewMode] = useState<'write' | 'edit' | 'view'>('write');
  // Add state for user's own review
  const [userReview, setUserReview] = useState<{rating: number, content: string} | null>(null);

  // Function to handle star rating
  const handleRatingClick = (selectedRating: number): void => {
    setRating(selectedRating);
  };

  // Determine which submit function to use based on whether we're editing
  const handleReviewSubmit = async (): Promise<void> => {
    if (isEditingRef.current) {
      await handleUpdateReview();
      // Reset editing state after update
      isEditingRef.current = false;
    } else {
      await handleSubmitReview();
    }
  };

  // Render star rating component
  const renderStars = (currentRating: number, isInteractive = true): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-6 h-6 ${isInteractive ? 'cursor-pointer' : ''} ${i <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}`}
          onClick={isInteractive ? () => handleRatingClick(i) : undefined}
        />
      );
    }
    return stars;
  };

  // Function to handle submit review
  const handleSubmitReview = async (): Promise<void> => {
    try {
      // Check if user data is loaded
      if (isUserLoading || !userData) {
        toast.error('User data is not loaded. Please try again.');
        return;
      }
      
      if (!carPark.id) {
        toast.error('Carpark ID is missing. Cannot submit review.');
        return;
      }
      
      console.log('Submitting review for carpark ID:', carPark.id);
      
      // Show loading toast
      const loadingId = toast.loading('Submitting your review...');
      setToastId(loadingId);
      
      // Submit the review using the already initialized mutation
      await reviewMutation.mutateAsync({
        id: carPark.id,
        rating: rating,
        description: reviewText
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingId);
      setToastId(null);
      
      console.log('Review submitted successfully');
      
      // Store the user's review for edit mode
      setUserReview({
        rating: rating,
        content: reviewText
      });
      
      // Change to edit mode
      setReviewMode('edit');
      
      // Show success message
      toast.success('Your review has been submitted!');
      
      // Refresh the reviews list
      console.log('Refreshing reviews after submission');
      void fetchReviews(carPark.id);
    } catch (error) {
      console.error('Error submitting review:', error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      if (error instanceof TRPCClientError) {
        console.error('TRPC specific error details:', error.data);
      }
      toast.error('Failed to submit review. Please try again.');
    }
  };

  // Function to handle edit review
  const handleEditReview = (): void => {
    // Mark that we're editing an existing review
    isEditingRef.current = true;
    // Switch back to write mode, but keep the current review text and rating
    setReviewMode('write');
    // Set the form values to the current review values
    if (userReview) {
      setReviewText(userReview.content);
      setRating(userReview.rating);
    }
  };

  // Function to handle update review
  const handleUpdateReview = async (): Promise<void> => {
    try {
      // Check if user data is loaded
      if (isUserLoading || !userData) {
        toast.error('User data is not loaded. Please try again.');
        return;
      }
      
      if (!carPark.id) {
        toast.error('Carpark ID is missing. Cannot update review.');
        return;
      }
      
      console.log('Updating review for carpark ID:', carPark.id);
      
      // Show loading toast
      const loadingId = toast.loading('Updating your review...');
      setToastId(loadingId);
      
      // Update the review using the update mutation
      await updateReviewMutation.mutateAsync({
        id: carPark.id,
        rating: rating,
        description: reviewText
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingId);
      setToastId(null);
      
      console.log('Review updated successfully');
      
      // Update the user review state
      setUserReview({
        rating: rating,
        content: reviewText
      });
      
      // Change back to edit mode
      setReviewMode('edit');
      
      // Show success message
      toast.success('Your review has been updated!');
      
      // Refresh the reviews list
      console.log('Refreshing reviews after update');
      void fetchReviews(carPark.id);
    } catch (error) {
      console.error('Error updating review:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      if (error instanceof TRPCClientError) {
        console.error('TRPC specific error details:', error.data);
      }
      toast.error('Failed to update review. Please try again.');
    }
  };

  // Function to handle delete review
  const handleDeleteReview = async (): Promise<void> => {
    try {
      if (!carPark.id) {
        toast.error('Carpark ID is missing. Cannot delete review.');
        return;
      }

      // Open the delete confirmation dialog
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error('Error preparing to delete review:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Function to confirm and process deletion
  const confirmDeleteReview = async (): Promise<void> => {
    try {
      if (!carPark.id) {
        toast.error('Carpark ID is missing. Cannot delete review.');
        return;
      }

      // Close the dialog
      setDeleteDialogOpen(false);
      
      // Show loading toast while deleting
      const loadingId = toast.loading('Deleting your review...');
      setToastId(loadingId);
      
      await deleteReviewMutation.mutateAsync({
        id: carPark.id
      });
      
      // Dismiss loading toast
      toast.dismiss(loadingId);
      setToastId(null);
      
      // Reset review state
      setUserReview(null);
      setReviewText('');
      setRating(0);
      setReviewMode('write');
      
      // Show success message
      toast.success('Your review has been deleted!');
      
      // Invalidate the tRPC cache to ensure fresh data
      await carParkContext.getReviews.invalidate({ id: carPark.id });
      
      // Force clear the cache for this specific API route
      // This ensures the direct API call to /api/reviews/[id] gets fresh data
      const cacheKey = `/api/reviews/${carPark.id}`;
      const caches = await window.caches?.open('next-data');
      if (caches) {
        await caches.delete(cacheKey);
      }
      
      // Add a slight delay before refetching to allow the cache to clear
      setTimeout(() => {
        void fetchReviews(carPark.id);
      }, 300);
    } catch (error) {
      console.error('Error deleting review:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      if (error instanceof TRPCClientError) {
        console.error('TRPC specific error details:', error.data);
      }
      toast.error('Failed to delete review. Please try again.');
    }
  };

  // Render star rating component for display only
  const renderDisplayStars = (rating: number): JSX.Element[] => {
    return renderStars(rating, false);
  };

  // Function to handle navigation back
  const handleBack = (): void => {
    void router.back();
  };

  // If user data is loading, show a loading spinner
  if (isUserLoading) {
    return (
      <Navigation>
        <div className="flex flex-col min-h-screen">
          <TopBar />
          <div className="flex-grow flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading your information...</p>
            </div>
          </div>
        </div>
      </Navigation>
    );
  }

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
              onClick={handleBack}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm dark:bg-gray-600 dark:text-white"
            >
              Back
            </button>
            <h2 className="text-xl font-bold dark:text-white">Leave A Review</h2>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          
          {/* Debug Information - Only show in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="bg-yellow-100 p-3 mb-4 text-xs border border-yellow-300 rounded">
              <p className="font-bold">Debug Information:</p>
              <p>Carpark ID: {carPark.id || 'Not set'}</p>
              <p>Previous Reviews Count: {previousReviews.length}</p>
              <p>User Loading: {isUserLoading ? 'Yes' : 'No'}</p>
              <p>User Data: {userData ? 'Available' : 'Not Available'}</p>
              <p>Query Status: {queryStatus}</p>
              <p>Review Mode: {reviewMode}</p>
            </div>
          )}
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Review</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your review? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={confirmDeleteReview}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
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
                      {getDistanceBetweenCarPark({x: carPark.location.x, y: carPark.location.y})} km
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
            
            {/* Right Column - Review Form or Display based on mode */}
            <Card className="dark:bg-gray-700 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  {reviewMode === 'edit' ? 'Edit Your Review' : 'Write Your Review'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden mr-3">
                        {isUserLoading ? (
                          <div className="animate-pulse h-full w-full bg-gray-400 dark:bg-gray-500" />
                        ) : currentUser.image ? (
                          <div className="relative h-full w-full">
                            <Image 
                              src={currentUser.image}
                              alt="User avatar"
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        ) : (
                          <User className="h-full w-full p-1" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm dark:text-white">
                          {isUserLoading ? (
                            <span className="animate-pulse inline-block w-24 h-4 bg-gray-300 dark:bg-gray-500 rounded"></span>
                          ) : (
                            currentUser.name
                          )}
                        </p>
                        <p className="text-gray-500 dark:text-gray-300 text-xs">{currentUser.date}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Loading state */}
                  {queryStatus === 'loading' && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="ml-3 text-gray-600 dark:text-gray-300">Checking your review status...</p>
                    </div>
                  )}
                  
                  {/* Error state */}
                  {queryStatus === 'error' && (
                    <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md text-red-800 dark:text-red-200 text-center">
                      <p>There was an error loading review data.</p>
                      <Button 
                        className="mt-2 bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => carPark.id && fetchReviews(carPark.id)}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                  
                  {/* Content when loaded */}
                  {queryStatus !== 'loading' && queryStatus !== 'error' && (
                    <>
                      {reviewMode === 'write' ? (
                        // Write Mode
                        <>
                          <div>
                            <Label htmlFor="rating" className="block mb-2 dark:text-white">Rating</Label>
                            <div className="flex space-x-1" id="rating">
                              {renderStars(rating)}
                            </div>
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
                              onClick={handleBack}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={handleReviewSubmit}
                              disabled={!reviewText || rating === 0}
                            >
                              {isEditingRef.current ? 'Update Review' : 'Submit Review'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        // Edit Mode
                        <>
                          <div>
                            <Label htmlFor="rating" className="block mb-2 dark:text-white">Rating</Label>
                            <div className="flex space-x-1" id="rating">
                              {renderDisplayStars(userReview?.rating ?? 0)}
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="review" className="block mb-2 dark:text-white">Review</Label>
                            <div className="w-full min-h-32 p-3 border rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500 overflow-y-auto">
                              {userReview?.content ?? ''}
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <Button 
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={handleEditReview}
                            >
                              Edit Review
                            </Button>
                            <Button 
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                              onClick={handleDeleteReview}
                            >
                              Delete Review
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}
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