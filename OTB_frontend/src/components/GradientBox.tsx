
interface GradientBoxTypes {
  title: string;
  value: string
}

const GradientBox: React.FC<GradientBoxTypes> = ({ title, value }) => {
  return (
    <div className='h-[66.17px] px-[24px] py-[10px] border-[1px] border-[#1DA1F2] rounded-[16px] bg-gradient-to-r from-[#041B29] via-[#07273B]  to-[#041B29] sm:max-w-[225px] md:max-w-[173.5px]'>
      <p className='font-medium text-[12.76px] text-white w-[50px] text-nowrap truncate lg:w-full'>{title}</p>
      <p className='font-semibold text-[24px]'>{value}</p>
    </div>
  )
}

export default GradientBox