import { useState } from "react"
import Input from "./Input"
import FilterIcon from "../assets/icons/FilterIcon.svg"
import Search from "../assets/icons/Search.svg"
import { tags } from "../constants"
import Tag from "./Tag"

const SideBar = () => {

  const [typing, setTyping] = useState("")

  return (
    <section className='rounded-[20px] space-y-[20px] border-[0.5px] border-[#808080] p-[20px]'>
      {/* Search location */}
      <Input onChange={(e) => setTyping(e.target.value)} isText={typing} className='h-[60px]' placeholder={
        <div className='flex flex-col'>
          <p className='font-semibold text-[#808080] text-[18px]'>
            Location
          </p>
          <span className='text-[#FFFFFF] font-normal text-[10px]'>Click on map</span>
        </div>
      } />

      {/* Search Radius */}
      <div className='space-y-2'>
        <div className='flex gap-2'>
          <img src={FilterIcon} alt='filter' className="cursor-pointer" />
          <p className='text-[#808080] font-semibold text-[18px]'>
            Search Radius
          </p>
        </div>
        <Input onChange={(e) => setTyping(e.target.value)} isText={typing} className='h-[48px]' />
      </div>

      {/* Topic Filter */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <img src={Search} alt='search' className='w-[20px] h-[20px]' />
          <p className='text-[#808080] font-semibold text-[18px]'>Topic Filter</p>
        </div>
        <Input onChange={(e) => setTyping(e.target.value)} isText={typing} className='h-[48px]' placeholder={<p className='text-white'>Enter keywords</p>} />
      </div>

      {/* Popular tags */}
      <div className='flex flex-wrap gap-2 items-center'>
        <p className='text-[#CBD5E0] text-[12px] font-normal'>Popular:</p>
        {
          tags.slice(0, 4).map((item, index) => (
            <Tag name={item.name} key={index} />
          ))
        }
        <p className='text-[12px] font-normal text-[#1DA1F2] cursor-pointer'>show more</p>
      </div>

      {/* Action Buttons */}
      <section className='space-y-4'>
        <button className='cursor-pointer text-black bg-white w-full rounded-[24px] flex justify-center items-center text-base font-semibold h-[48px] transition-all duration-300 ease-in hover:bg-gray-200'>
          Ananlyze This Region
        </button>

        <button className='cursor-pointer text-white shadow-sm  shadow-white bg-[#1DA1F21F] w-full rounded-[24px] flex justify-center items-center text-base font-semibold h-[48px] transition-all duration-300 ease-in hover:bg-[#1da0f236]'>
          Compare Regions
        </button>
      </section>

    </section>
  )
}

export default SideBar