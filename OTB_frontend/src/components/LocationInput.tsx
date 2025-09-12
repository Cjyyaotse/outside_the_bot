import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Store,
  Building2,
  Utensils,
  Car,
  GraduationCap,
  Heart,
  Plane,
  Home,
  ShoppingBag,
  Coffee,
  Fuel,
  Hotel,
  TreePine,
  Dumbbell
} from "lucide-react";
import type { LocationType } from "./SideBar";

interface LocationSuggestion {
  id: string;
  name: string;
  subtitle: string;
  type: LocationType;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// type LocationType =
//   | 'restaurant'
//   | 'retail_store'
//   | 'bank'
//   | 'hospital'
//   | 'school'
//   | 'hotel'
//   | 'gas_station'
//   | 'cafe'
//   | 'airport'
//   | 'residential'
//   | 'shopping_mall'
//   | 'park'
//   | 'gym'
//   | 'default';

interface LocationInputProps {
  value: string;
  onChange: (val: string, location?: LocationSuggestion) => void;
  placeholder?: string;
  suggestions: LocationSuggestion[];
  isLoading?: boolean;
}

const getLocationIcon = (type: LocationType) => {
  const iconProps = { size: 18, className: "text-[#1DA1F2]" };
  switch (type) {
    case 'restaurant':
      return <Utensils {...iconProps} />;
    case 'retail_store':
      return <Store {...iconProps} />;
    case 'bank':
      return <Building2 {...iconProps} />;
    case 'hospital':
      return <Heart {...iconProps} />;
    case 'school':
      return <GraduationCap {...iconProps} />;
    case 'hotel':
      return <Hotel {...iconProps} />;
    case 'gas_station':
      return <Fuel {...iconProps} />;
    case 'cafe':
      return <Coffee {...iconProps} />;
    case 'airport':
      return <Plane {...iconProps} />;
    case 'residential':
      return <Home {...iconProps} />;
    case 'shopping_mall':
      return <ShoppingBag {...iconProps} />;
    case 'park':
      return <TreePine {...iconProps} />;
    case 'gym':
      return <Dumbbell {...iconProps} />;
    default:
      return <MapPin {...iconProps} />;
  }
};

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  placeholder,
  suggestions,
  isLoading = false
}) => {

  const [focus, setFocus] = useState(false);
  const [query, setQuery] = useState(value);
  const divRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setFocus(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: LocationSuggestion) => {
    const fullLocation = `${suggestion.name}, ${suggestion.subtitle}`;
    onChange(fullLocation, suggestion);
    setQuery(fullLocation);
    setFocus(false);
  };

  return (
    <div className="relative w-full" ref={divRef}>
      <div
        className={`flex items-center border-[2px] rounded-full px-[6px] h-[60px] py-[8px] relative ${focus ? "border-[#1DA1F2] bg-[#1DA1F21A]" : "border-white"
          }`}
      >
        <MapPin size={20} className="text-white mr-2" />
        <input
          className="bg-transparent h-full w-full focus:outline-none text-white z-50"
          placeholder={placeholder}
          value={query}
          onFocus={() => setFocus(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
        />
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1DA1F2] mr-2"></div>
        )}
      </div>

      {focus && query && (
        <div className="absolute mt-2 w-full bg-[#000000] rounded-[16px] shadow-sm shadow-[#FFFFFFBF] max-h-[295px] overflow-y-scroll scrollbar-hide" style={{ zIndex: 1000 }}>
          {isLoading ? (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1DA1F2] mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Searching locations...</p>
            </div>
          ) : filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item) => (
              <button
                key={item.id}
                className="px-4 text-left w-full py-3 cursor-pointer hover:bg-[#16181C] text-white flex items-start gap-3 transition-colors duration-150"
                onClick={() => handleSelect(item)}
              >
                <div className="mt-1 flex-shrink-0">
                  {getLocationIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white truncate">{item.name}</p>
                  <p className="text-sm text-[#71767B] font-normal truncate">{item.subtitle}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center">
              <MapPin size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No locations found</p>
              <p className="text-gray-500 text-xs mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;