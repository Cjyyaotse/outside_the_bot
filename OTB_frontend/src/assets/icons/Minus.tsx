
interface MinusType {
  color?: string;
  size?: number;
  className?: string;
  onClick?: () => void
}

const Minus: React.FC<MinusType> = ({ color, size, className, onClick }) => {
  return (
    <svg width={size ?? 20} height={size ?? 20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className ?? ""} onClick={onClick}>
      <path d="M5 10H15" stroke={color ?? "#1DA1F2"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

  )
}

export default Minus