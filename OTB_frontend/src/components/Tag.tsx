
export interface TagTypes {
  name: string
}
const Tag: React.FC<TagTypes> = ({ name }) => {
  return (
    <div className='border-[1px] border-white text-white text-[12px] rounded-[24px] px-[8px] py-[4px] w-fit cursor-pointer hover:bg-gray-50 hover:text-black transition-all duration-300 ease-in'>
      {name}
    </div>
  )
}

export default Tag