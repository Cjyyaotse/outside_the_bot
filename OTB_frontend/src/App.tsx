import { useEffect, useState } from 'react'
import './App.css'
import XLogo from "./assets/icons/XLogo.svg"
import GradientBox from './components/GradientBox'
import MapCanvas from './components/Map'
import SideBar from './components/SideBar'
import type { LocationSuggestion } from './utils/types'
import { radiusToZoomMap } from './utils/constants'
import { formatMetric } from './utils/helpers'


function App() {
  const [selected, setSelected] = useState<{ lng: number; lat: number; place: string }>();

  const [mapSelect, setMapSelect] = useState<LocationSuggestion>();
  const [radius, setRadius] = useState<string>("25"); // Default radius
  const [staticMetrics, setStaticMetrics] = useState<{ active_hotspots: number, total_conversations: number }>({ active_hotspots: 0, total_conversations: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);




  useEffect(() => {
    const getStaticMetrics = async () => {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/get_static_metrics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      if (!response.ok) {
        console.error("Failed to fetch static metrics");
        return;
      }
      const data = await response.json()
      console.log("static metrics:", data)

      return data
    }
    setIsLoading(true)
    getStaticMetrics().then(data => setStaticMetrics(data)).then(() => setIsLoading(false))

  }, [])




  return (
    <main className='font-manrope flex h-full w-[100vw]'>
      <section className="bg-hd-wpaper w-[300px] lg:w-[395px] max-w-[500px] max-h-[100vh] px-6 flex flex-col ">
        <header className='flex gap-[12px] items-center pt-2 mb-[10px]'>
          <img src={XLogo} alt='logo' className='w-[20px] h-[20px]' />
          <p className='font-medium text-[30.32px]'>chirpmap</p>
        </header>

        <section className='flex flex-row gap-4 mb-[20px]'>
          <GradientBox value={formatMetric(staticMetrics.active_hotspots)} title='Active Hotspots' isLoading={isLoading} />
          <GradientBox value={formatMetric(staticMetrics.total_conversations)} title='Conversations' isLoading={isLoading} />
        </section>

        <SideBar onInputSelectLocation={(lng, lat, place) =>
          setSelected({ lng, lat, place })
        } mapSelect={mapSelect} radius={radius} onRadiusChange={setRadius} />
      </section>

      <div className='flex-1 p-4 max-h-[100vh]'>
        <MapCanvas location={selected} onMapSelect={setMapSelect} zoomLevel={radiusToZoomMap[radius]} />
      </div>
    </main>
  )
}

export default App
