import { useState } from "react";
import type { CountryStates } from "../utils/helpers";


interface AvailableLocationsPopupProps {
  countryStates: CountryStates[];
  isOpen: boolean;
  onClose: () => void;
}


export function AvailableLocationsPopup({ countryStates, isOpen, onClose }: AvailableLocationsPopupProps) {
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());

  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(country)) {
        newSet.delete(country);
      } else {
        newSet.add(country);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom  flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-black text-white rounded-lg shadow-xl w-full max-w-2xl max-h-[100vh] border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold ">Available Regions</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="space-y-3">
            {countryStates.map((countryData) => (
              <div key={countryData.country} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCountry(countryData.country)}
                  className="w-full p-4 bg-black flex justify-between items-center transition-colors"
                >
                  <span className="font-semibold ">{countryData.country}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white bg-black border px-2 py-1 rounded-full">
                      {countryData.states.length} {countryData.states.length === 1 ? 'state' : 'states'}
                    </span>
                    <span className={`transform transition-transform ${expandedCountries.has(countryData.country) ? 'rotate-180' : ''
                      }`}>
                      ▼
                    </span>
                  </div>
                </button>

                {expandedCountries.has(countryData.country) && (
                  <div className="p-4 bg-black border-t">
                    <ul className="space-y-2">
                      {countryData.states.map((state) => (
                        <li key={state} className="pl-4 py-2 border-2 border-blue-200 bg-black/70 text-white rounded">
                          <span >{state}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors float-right"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}