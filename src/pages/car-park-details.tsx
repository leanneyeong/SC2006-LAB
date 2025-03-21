import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Star } from 'lucide-react';
import { Navigation } from '~/components/global/navigation';
import { TopBar } from '~/components/global/top-bar-others';

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
  // Add state for TopBar component
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [evCharging, setEvCharging] = useState<boolean>(true);
  const [shelteredCarpark, setShelteredCarpark] = useState<boolean>(false);

  const carParkDetail: CarParkDetailProps = {
    name: 'Takashimaya Parking',
    location: 'Orchard',
    price: '$12/hr',
    availability: '27 Lots',
    sheltered: true,
    evCharging: true,
    rating: 4,
    review: {
      text: 'The car park is well-maintained with plenty of available spaces, even during peak hours. It\'s well-lit and safe, but the parking rates are among the priciest compared to nearby options. Great for short stays but might not be the best for long-term parking.',
      reviewer: {
        name: 'Rachel Tan',
        date: '27/01/23',
        image: '/images/avatar.jpg'
      }
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-5 h-5 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-none text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <Navigation>
      <div className="flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <TopBar />

        {/* Details Content */}
        <main className="flex-grow p-4">
          {/* Title Bar */}
          <div className="bg-white p-3 mb-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <h2 className="text-xl font-bold">{carParkDetail.name}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Car Park Details */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold mb-4">Car Park Details:</h3>
                <p className="mb-2">
                  <span className="font-medium">Location:</span> {carParkDetail.location}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Price:</span> {carParkDetail.price}
                </p>
                <p className="mb-4">
                  <span className="font-medium">Availability:</span>{' '}
                  <span className="text-green-600">{carParkDetail.availability}</span>
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={carParkDetail.sheltered} 
                      readOnly 
                      className="form-checkbox h-4 w-4 text-blue-500 mr-2"
                    />
                    <span>Sheltered</span>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={carParkDetail.evCharging} 
                      readOnly 
                      className="form-checkbox h-4 w-4 text-blue-500 mr-2"
                    />
                    <span>EV Parking</span>
                  </div>
                </div>
              </div>
              
              {/* Reviews */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex mb-4">
                  {renderStars(carParkDetail.rating)}
                </div>
                <p className="font-bold mb-2">Convenient but PRICEY</p>
                <p className="text-sm mb-4">
                  {carParkDetail.review.text}
                </p>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-300 overflow-hidden mr-3">
                    <img src={carParkDetail.review.reviewer.image} alt="Reviewer" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{carParkDetail.review.reviewer.name}</p>
                    <p className="text-gray-500 text-xs">{carParkDetail.review.reviewer.date}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Map */}
            <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative min-h-96">
              <img 
                src="/api/placeholder/800/600"
                alt="Google Map" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">Leave Review</Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">Get Directions</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Navigation>
  );
};

export default CarParkDetailPage;