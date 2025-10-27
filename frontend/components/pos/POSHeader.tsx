'use client';

import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Pause, 
  FileText, 
  Calculator, 
  RefreshCw, 
  X, 
  MapPin, 
  Settings 
} from 'lucide-react';
import { Location } from '@/hooks/pos/useLocations';

interface POSHeaderProps {
  selectedLocation: Location | null;
  onLocationSwitch: () => void;
  onNavigateToDashboard: () => void;
}

export default function POSHeader({ 
  selectedLocation, 
  onLocationSwitch, 
  onNavigateToDashboard 
}: POSHeaderProps) {
  return (
    <div className="bg-blue-600 px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-white text-2xl font-bold">Point Of Sale</h1>
        <div className="flex items-center gap-2 bg-blue-700 px-3 py-1 rounded-md">
          <MapPin className="w-4 h-4 text-blue-200" />
          <span className="text-blue-100 text-sm font-medium">
            {selectedLocation?.name || 'No Location Selected'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onLocationSwitch}
            className="text-blue-200 hover:text-white hover:bg-blue-600 p-1 h-6 w-6"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Payment
        </Button>
        <Button className="bg-gray-200 text-gray-800 flex items-center gap-2">
          <Pause className="w-4 h-4" /> Hold
        </Button>
        <Button className="bg-orange-500 text-white flex items-center gap-2">
          <FileText className="w-4 h-4" /> View Invoice
        </Button>
        <Button className="bg-cyan-500 text-white flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Cash Register
        </Button>
        <Button className="bg-cyan-500 text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
        <Button className="bg-green-600 text-white flex items-center gap-2">
          <FileText className="w-4 h-4" /> Hold Invoice
        </Button>
        <Button 
          className="bg-red-600 text-white flex items-center gap-2"
          onClick={onNavigateToDashboard}
        >
          <X className="w-4 h-4" /> Close
        </Button>
      </div>
    </div>
  );
}
