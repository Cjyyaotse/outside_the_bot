import React, { useEffect, useRef, useState } from "react";

interface InputTypes {
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
}

const Input: React.FC<InputTypes> = ({ className, onChange, value }) => {

  const [focus, setFocus] = useState(false);
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleFocus = (event: MouseEvent) => {
      if (divRef?.current?.contains(event.target as Node)) {
        setFocus(true)
      } else {
        setFocus(false)
      }
    }

    document.addEventListener("mousedown", handleFocus);
    return () => document.removeEventListener("mousedown", handleFocus)
  }, [])

  return (
    <div className={`flex items-center border-[2px] rounded-full w-full py-[8px] relative ${focus ? "border-[#1DA1F2] bg-[#1DA1F21A]" : "border-[#808080]"} ${className ?? ''}`} ref={divRef}>

      <input className='bg-transparent h-full w-full rounded-full px-4 focus:outline-none' value={value} onChange={onChange} placeholder="eg. food, art, clothes" />
    </div>
  )
}

export default Input