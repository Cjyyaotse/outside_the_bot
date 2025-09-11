
interface PlusType {
  color?: string;
  size?: number;
  className?: string;
  onClick?: () => void
}

const Plus: React.FC<PlusType> = ({ color, size, className, onClick }) => {
  return (
    <svg width={size ?? 16} height={size ?? 16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className ?? ""} onClick={onClick}>
      <path d="M8.5 7.5V3H7.5V7.5H3V8.5H7.5V13H8.5V8.5H13V7.5H8.5Z" fill="#0F1621" />
      <path d="M8.5 7.5V3H7.5V7.5H3V8.5H7.5V13H8.5V8.5H13V7.5H8.5Z" fill={color ?? "black"} fill-opacity="0.2" />
      <path d="M8.5 7.5V3H7.5V7.5H3V8.5H7.5V13H8.5V8.5H13V7.5H8.5Z" fill={color ?? "black"} fill-opacity="0.2" />
      <path d="M8.5 7.5V3H7.5V7.5H3V8.5H7.5V13H8.5V8.5H13V7.5H8.5Z" fill={color ?? "black"} fill-opacity="0.2" />
      <path d="M8.5 7.5V3H7.5V7.5H3V8.5H7.5V13H8.5V8.5H13V7.5H8.5Z" fill={color ?? "black"} fill-opacity="0.2" />
    </svg>

  )
}

export default Plus