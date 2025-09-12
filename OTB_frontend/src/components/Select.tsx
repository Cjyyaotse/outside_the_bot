import { useState, useRef, useEffect } from "react";
import FilterIcon from "../assets/icons/FilterIcon.svg";

const options = [
  { value: "5km", label: "5km - Neighborhood" },
  { value: "10km", label: "10km - Local Area" },
  { value: "25km", label: "25km - City Wide" },
  { value: "50km", label: "50km - Metropolitan" },
  { value: "100km", label: "100km - Regional" },
];

const Select = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(options[2]); // default 25km
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section ref={ref}>
      {/* Search Radius */}
      <div className="space-y-2 relative">
        <div className="flex gap-2 items-center">
          <img src={FilterIcon} alt="filter" className="cursor-pointer" />
          <p className="text-[#808080] font-semibold text-[16px]">Search Radius</p>
        </div>

        {/* Selected box */}
        <div
          className="flex items-center justify-between h-[48px] w-full border border-[#808080] rounded-full px-4 bg-transparent text-white cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <span>{selected.label}</span>
          {/* <ChevronDown
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            size={20}
          /> */}
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute mt-2 w-full bg-[#000000] rounded-[16px] shadow-sm shadow-[#FFFFFFBF] z-50 max-h-[295px] overflow-y-scroll scrollbar-hide">
            {options.map((option) => (
              <button
                key={option.value}
                className={`px-4 text-left w-full py-3 cursor-pointer hover:bg-[#16181C] text-white flex items-start gap-3 transition-colors duration-150 ${selected.value === option.value ? "bg-[#16181C]" : ""
                  }`}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Select;
