import { useEffect, useRef, useState } from "react";
import Marker from "../assets/icons/Marker.svg";

interface LocationInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const mockSuggestions = [
  { name: "Greenfield Retail Store", subtitle: "Nairobi, Kenya" },
  { name: "Omotosho Road Basic", subtitle: "Birmingham, UK" },
  { name: "First Rizz Bank", subtitle: "Bali" },
  { name: "International Locked Centre", subtitle: "South Africa" },
  { name: "Public Dance Museum", subtitle: "Denmark" },
];

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, placeholder }) => {
  const [focus, setFocus] = useState(false);
  const [query, setQuery] = useState(value);
  const divRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = mockSuggestions.filter(
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

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setQuery(suggestion);
    setFocus(false);
  };

  return (
    <div className="relative w-full" ref={divRef}>
      <div
        className={`flex items-center border-[2px] rounded-full px-[6px] py-[8px] relative ${focus ? "border-[#1DA1F2] bg-[#1DA1F21A]" : "border-[#808080]"
          }`}
      >
        <img src={Marker} alt="marker" className="w-[20px] h-[20px] mr-2" />
        <input
          className="bg-transparent h-full w-full rounded-full focus:outline-none text-white"
          placeholder={placeholder}
          value={query}
          onFocus={() => setFocus(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
        />
      </div>

      {focus && query && (
        <div className="absolute mt-2 w-full bg-[#0F1621] rounded-lg border border-[#1DA1F2] shadow-lg z-50">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item, i) => (
              <div
                key={i}
                className="px-4 py-2 cursor-pointer hover:bg-[#1DA1F2]/20 text-white"
                onClick={() => handleSelect(`${item.name}, ${item.subtitle}`)}
              >
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-400">{item.subtitle}</p>
              </div>
            ))
          ) : (
            <p className="px-4 py-2 text-gray-400">No results</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
