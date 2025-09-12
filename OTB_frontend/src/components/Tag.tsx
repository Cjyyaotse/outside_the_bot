
export interface TagTypes {
  name: string
}
const Tag: React.FC<TagTypes> = ({ name }) => {
  return (
    <div className='border-[1px] border-white text-white text-[12px] rounded-[24px] px-[8px] py-[4px] w-fit'>
      {name}
    </div>
  )
}

export default Tag