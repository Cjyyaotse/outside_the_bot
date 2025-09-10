import React from "react";
import Marker from "../assets/icons/Marker.svg"

interface InputTypes {
  className?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isText: string;
  placeholder?: React.ReactNode
}

const Input: React.FC<InputTypes> = ({ className, onChange, isText, placeholder }) => {

  return (
    <div className={`flex items-center border-[2px] border-white rounded-full w-full px-[6px] py-[8px] relative  ${className ?? ''}`}>
      <div className={`absolute flex items-center gap-2`}>
        <img src={Marker} alt='marker' className='w-[20px] h-[20px]' />
        {
          !isText &&
          <>
            {placeholder ?? <p>Search</p>}
          </>
         
        }
      </div>
      <input className='bg-transparent h-full w-full rounded-full px-7 focus:outline-none z-50' onChange={onChange} />
    </div>
  )
}

export default Input