'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Building2, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'react-hot-toast';

interface Location {
  id: string;
  name: string;
  address?: string;
  type?: string;
}

interface LocationSelectionModalProps {
  isOpen: boolean;
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
}

export default function LocationSelectionModal({ 
  isOpen, 
  onLocationSelect, 
  onClose 
}: LocationSelectionModalProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Load locations when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/locations');
      const data = response.data;
      setLocations(data.data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = () => {
    if (!selectedLocationId) {
      toast.error('Please select a location');
      return;
    }

    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    if (selectedLocation) {
      // Store selected location in sessionStorage for persistence
      sessionStorage.setItem('pos-selected-location', JSON.stringify(selectedLocation));
      onLocationSelect(selectedLocation);
      // Don't call onClose() here - let the parent handle closing the modal
    }
  };

  const getLocationIcon = (type?: string) => {
    switch (type) {
      case 'WAREHOUSE':
        return <Warehouse className="w-5 h-5 text-blue-600" />;
      case 'STORE':
        return <Building2 className="w-5 h-5 text-green-600" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-600" />;
    }
  };

  const getLocationTypeColor = (type?: string) => {
    switch (type) {
      case 'WAREHOUSE':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'STORE':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Location for POS</h2>
            <p className="text-sm text-gray-600 mt-1">Choose the location to operate from</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading locations...</span>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Available</h3>
                <p className="text-gray-600 mb-4">Please add a location before using the POS system.</p>
                <Button 
                  onClick={() => window.open('/dashboard/locations', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Go to Locations
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pb-2">
              {locations.map((location) => (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedLocationId === location.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : getLocationTypeColor(location.type)
                  }`}
                  onClick={() => setSelectedLocationId(location.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      {getLocationIcon(location.type)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{location.name}</h3>
                        {location.address && (
                          <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                        )}
                        {location.type && (
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                            location.type === 'WAREHOUSE' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {location.type}
                          </span>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedLocationId === location.id
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedLocationId === location.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}
            {/* Scroll hint when there are many locations */}
            {locations.length > 3 && (
              <div className="text-center text-xs text-gray-500 mt-2 pb-2">
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                <span>Scroll to see more locations</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <Button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 hover:border-gray-400 px-6 py-2 font-medium transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLocationSelect}
            disabled={!selectedLocationId}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-2"
          >
            Select Location
          </Button>
        </div>
      </div>
    </div>
  );
}
