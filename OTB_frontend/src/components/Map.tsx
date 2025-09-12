import StaticMap from "../assets/images/OutbotMap.png"

const MapCanvas = () => {
  return (
    <main className="h-full w-full">
      <img src={StaticMap} alt="map" className="w-full h-full" />
    </main>
  )
}

export default MapCanvas