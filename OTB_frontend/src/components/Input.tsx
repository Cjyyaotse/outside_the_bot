import React, { useEffect, useRef, useState } from "react";
import Marker from "../assets/icons/Marker.svg"

interface InputTypes {
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isText: string;
  placeholder?: React.ReactNode;
  borderColor?: string
}

const Input: React.FC<InputTypes> = ({ className, onChange, isText, placeholder, borderColor }) => {

  const [focus, setFocus] = useState(false);
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFocus = (event: MouseEvent) => {
      if (divRef.current && divRef.current.contains(event.target as Node)) {
        setFocus(true)
      } else {
        setFocus(false)
      }
    }

    document.addEventListener("mousedown", handleFocus);
    return () => document.removeEventListener("mousedown", handleFocus)
  }, [])

  return (
    <div className={`flex items-center border-[2px]  rounded-full w-full px-[6px] py-[8px] relative ${focus ? "border-[#1DA1F2] bg-[#1DA1F21A]" : `${borderColor ?? ""}`} ${className ?? ''}`} ref={divRef}>
      <div className={`absolute flex items-center gap-2`}>
        <img src={Marker} alt='marker' className='w-[20px] h-[20px]' />
        {
          !isText &&
          <>
            {placeholder ?? <p className="text-[#808080]">Search</p>}
          </>

        }
      </div>
      <input className='bg-transparent h-full w-full rounded-full px-7 focus:outline-none z-50' onChange={onChange} />
    </div>
  )
}

export default Input