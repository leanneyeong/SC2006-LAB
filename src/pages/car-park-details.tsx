import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Star } from 'lucide-react';
import { Navigation } from '~/components/global/navigation';
import { TopBar } from '~/components/global/top-bar-others';
import { useRouter } from 'next/router';

interface CarParkDetailProps {
  name: string;
  location: string;
  price: string;
  availability: string;
  sheltered: boolean;
  evCharging: boolean;
  rating: number;
  review: {
    text: string;
    reviewer: {
      name: string;
      date: string;
      image: string;
    }
  }
}

const CarParkDetailPage: React.FC = () => {
  const router = useRouter();
  
  // Add state for TopBar component
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [evCharging, setEvCharging] = useState<boolean>(true);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);
  
  // State for carpark details
  const [carParkDetail, setCarParkDetail] = useState<CarParkDetailProps>({
    name: 'Loading...',
    location: '',
    price: '',
    availability: '',
    sheltered: false,
    evCharging: false,
    rating: 4,
    review: {
      text: 'The car park is well-maintained with plenty of available spaces, even during peak hours. It\'s well-lit and safe, but the parking rates are among the priciest compared to nearby options. Great for short stays but might not be the best for long-term parking.',
      reviewer: {
        name: 'Rachel Tan',
        date: '27/01/23',
        image: '/images/avatar.jpg'
      }
    }
  });

  // Get query parameters when the component mounts
  useEffect(() => {
    if (router.isReady) {
      // Extract carpark details from the query parameters
      const { name, area, lots, type, agency } = router.query;
      
      // Update the carpark details with the query parameters
      setCarParkDetail(prevDetails => ({
        ...prevDetails,
        name: name as string || 'Unknown Carpark',
        location: area as string || 'Unknown Location',
        availability: `${lots || 0} ${type || 'Lots'}`,
        // You can add logic here to determine price based on location or other factors
        price: area === 'Orchard' ? '$12/hr' : area === 'Downtown' ? '$10/hr' : '$5/hr',
      }));
    }
  }, [router.isReady, router.query]);

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-5 w-5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  // Handle the back button click
  const handleBackClick = () => {
    router.back();
  };

  return (
    <Navigation>
      <div className="flex min-h-screen flex-col">
        {/* Top Navigation Bar */}
        <TopBar />

        {/* Details Content */}
        <main className="flex-grow bg-gray-50 p-4 dark:bg-gray-800">
          {/* Title Bar with Back Button */}
          <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-600 dark:bg-gray-700">
            <button 
              onClick={handleBackClick}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm dark:bg-gray-600 dark:text-white"
            >
              Back
            </button>
            <h2 className="text-xl font-bold dark:text-white">{carParkDetail.name}</h2>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Car Park Details */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
                <h3 className="mb-4 text-xl font-bold dark:text-white">Car Park Details:</h3>
                <p className="mb-2 dark:text-white">
                  <span className="font-medium">Location:</span> {carParkDetail.location}
                </p>
                <p className="mb-2 dark:text-white">
                  <span className="font-medium">Price:</span> {carParkDetail.price}
                </p>
                <p className="mb-4 dark:text-white">
                  <span className="font-medium">Availability:</span>{' '}
                  <span className="text-green-600">{carParkDetail.availability}</span>
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={carParkDetail.sheltered} 
                      readOnly 
                      className="form-checkbox mr-2 h-4 w-4 text-blue-500"
                    />
                    <span className="dark:text-white">Sheltered</span>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={carParkDetail.evCharging} 
                      readOnly 
                      className="form-checkbox mr-2 h-4 w-4 text-blue-500"
                    />
                    <span className="dark:text-white">EV Parking</span>
                  </div>
                </div>
              </div>
              
              {/* Reviews */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-600 dark:bg-gray-700">
                <div className="mb-4 flex">
                  {renderStars(carParkDetail.rating)}
                </div>
                <p className="mb-2 font-bold dark:text-white">Convenient but PRICEY</p>
                <p className="mb-4 text-sm dark:text-gray-200">
                  {carParkDetail.review.text}
                </p>
                <div className="flex items-center">
                  <div className="mr-3 h-8 w-8 overflow-hidden rounded-full bg-gray-300">
                    <img src={carParkDetail.review.reviewer.image} alt="Reviewer" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{carParkDetail.review.reviewer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{carParkDetail.review.reviewer.date}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Map */}
            <div className="relative min-h-96 overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-600 dark:bg-gray-700">
              <img 
                src="/api/placeholder/800/600"
                alt="Google Map" 
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button className="bg-blue-500 text-white hover:bg-blue-600">Leave Review</Button>
                <Button className="bg-blue-500 text-white hover:bg-blue-600">Get Directions</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Navigation>
  );
};

export default CarParkDetailPage;