import { useState, useEffect } from "react"
import Input from "./Input"
import Search from "../assets/icons/Search.svg"
import { tags } from "../utils/constants"
import Tag from "./Tag"
import Plus from "../assets/icons/Plus"
import Select from "./Select"
import Minus from "../assets/icons/Minus"
import LocationInput from "./LocationInput"
import EchoGridModal from "../components/EchoGridModal"
import TweetResults from "../components/TweetResults"
import CompareTweets from "../components/CompareTweets"
import { searchLocations } from "./MapBoxSearch"
import type { LocationSuggestion, RawTweetData } from "../utils/types"
import { useDebounce } from "../hooks/useDebounce"
import { useAnalysis } from "../hooks/useAnalysis"
import toast from "react-hot-toast"



type ModalType = 'echogrid' | 'search' | 'compare' | null;

interface LocationData {
  query: string;
  selectedLocation?: LocationSuggestion;
}

interface SideBarProps {
  onInputSelectLocation: (lng: number, lat: number, place: string) => void;
  mapSelect: LocationSuggestion | undefined;
  radius: string;
  onRadiusChange: (radius: string) => void;
}


export interface TweetsResponseTypes {
  summary: {
    description: string;
    "trending topics": string;
  },
  tweets: string[]
}

const SideBar = ({ onInputSelectLocation, mapSelect, radius, onRadiusChange }: SideBarProps) => {
  const [topics, setTopics] = useState("")
  const [locations, setLocations] = useState<LocationData[]>([{ query: "" }]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const [suggestionsList, setSuggestionsList] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);

  const [analysisData, setAnalysisData] = useState<any>()

  const { fetchAnalysisTweets, isLoading } = useAnalysis(topics, Number(radius), locations[0].selectedLocation?.coordinates)


  // console.log("fetchAnalysisTweets::", )

  // consolidating data from all fields on sidebar
  // to pass to analysis or comparison modals
  const getConsolidatedData = () => {
    return {
      locations: locations.map(loc => loc.selectedLocation?.coordinates).filter(Boolean),
      radius,
      topics: topics
    };
  };

  // Add this function to handle input focus
  const handleInputFocus = (index: number) => {
    setActiveInputIndex(index);
  };

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestionsList([])
      return;
    }

    let active = true;
    setLoading(true);

    searchLocations(debouncedQuery).then((results) => {
      if (active) {
        setSuggestionsList(results);
        setLoading(false)
      }
    })

    return () => {
      active = false;
    }

  }, [debouncedQuery])


  const addLocation = () => {
    if (locations.length < 2) {
      setLocations([...locations, { query: "" }]);
    }
  };

  const removeLocation = (index: number) => {
    const updated = [...locations];
    updated.splice(index, 1);
    setLocations(updated);
  };

  // useEffect(()=> {
  //   console.log("consolidatedDAta:::", getConsolidatedData())
  // })

  const closeModal = () => {
    setIsAnimating(true);
    setIsVisible(false);

    // Wait for animation to complete before removing modal
    setTimeout(() => {
      setActiveModal(null);
      setIsAnimating(false);
    }, 300);
  };

  const openModal = (modalType: ModalType) => {
    setActiveModal(modalType);
    setIsAnimating(true);

    // Trigger entrance animation on next frame
    requestAnimationFrame(() => {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(false), 300);
    });
  };

  const handleAnalyzeRegion = async () => {
    // Pass selected locations to your analysis
    if (!locations[0].selectedLocation?.coordinates?.lat && !locations[0].selectedLocation?.coordinates?.lng) {
      toast.error('Please select or reselect a location')
      return
    }
    setIsVisible(true)
    setActiveModal("search")
    const response = await fetchAnalysisTweets()
    setAnalysisData(response)
  };

  const formatAnalysisData = (data: TweetsResponseTypes) => {
    const rawTweets: RawTweetData[] = data?.tweets?.map((tweet, index) => ({
      id: `tweet-${index}`, // Generate unique ID for each tweet
      content: tweet,
      timeAgo: "recent", // Since original data doesn't include time, using placeholder
      verified: false // Default value since original data doesn't include verification status
    }));
    return { rawTweets, summary: data?.summary };
  }

  const handleCompareRegions = () => {
    // Pass selected locations for comparison
    const selectedLocations = locations
      .filter(loc => loc.selectedLocation)
      .map(loc => loc.selectedLocation!);

    if (selectedLocations.length < 2) {
      alert('Please select at least 2 locations to compare');
      return;
    }

    console.log('Comparing regions:', selectedLocations);
    openModal('compare');
  };

  const handleShowMore = () => {
    openModal('echogrid');
  };

  const handleChangeTopics = (topics: string[]) => {
    setTopics(topics.join(', '));
  }

  // Check if compare button should be enabled
  const canCompareRegions = locations.filter(loc => loc.selectedLocation).length >= 2;

  // Reset animation states when modal changes
  useEffect(() => {
    if (activeModal) {
      setIsVisible(true);
    }
  }, [activeModal]);

  return (
    <>
      <section className='rounded-[20px] space-y-[20px] border-[0.5px] border-[#808080] p-[20px] max-h-[540px] overflow-y-scroll scrollbar-hide'>
        {/* Search location */}
        <div className="flex flex-col space-y-2">
          {locations.map((locationData, index) => (
            <div key={index} className="flex items-center gap-2">
              <LocationInput
                value={locationData.query}
                onChange={(val, location) => {
                  setQuery(val);
                  const updated = [...locations];
                  updated[index] = {
                    query: val,
                    selectedLocation: location,
                  };
                  setLocations(updated);

                  // Inform parent (App) so map flies
                  if (location?.coordinates) {
                    onInputSelectLocation(location.coordinates.lng, location.coordinates.lat, val);
                  }
                }}
                onFocus={() => handleInputFocus(index)}
                isActive={activeInputIndex === index}
                placeholder={`Location ${index + 1}`}
                suggestions={suggestionsList}
                isLoading={loading}
                externalLocation={mapSelect}
              />


              {index === 0 ? (
                <Plus
                  color={locations.length > 1 ? "#475568" : "#1DA1F2"}
                  size={26}
                  className={`${locations.length > 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onClick={addLocation}
                />
              ) : (
                <Minus onClick={() => removeLocation(index)} className="cursor-pointer" />
              )}
            </div>
          ))}

          {locations.length === 1 && (
            <p className="text-[#64748A] text-[12px] mt-1 text-nowrap">
              Hit + to enable Compare Regions button
            </p>
          )}

          {activeInputIndex !== null && (
            <p className="text-[#1DA1F2] text-[10px] mt-1 text-">
              Click on the map to set location for {`Location ${activeInputIndex + 1}`}
            </p>
          )}
        </div>

        {/* Search Radius */}
        <div className='space-y-2'>
          <Select value={radius} onChange={onRadiusChange} />
        </div>

        {/* Topic Filter */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <img src={Search} alt='search' className='w-[20px] h-[20px]' />
            <p className='text-[#808080] font-semibold text-[16px]'>Topic Filter</p>
          </div>
          <Input onChange={(e) => setTopics(e.target.value)} value={topics} className='h-[48px]' />
        </div>

        {/* Popular tags */}
        <div className='flex flex-wrap gap-2 items-center'>
          <p className='text-[#CBD5E0] text-[12px] font-normal'>Popular:</p>
          {
            tags.slice(0, 4).map((item, index) => (
              <Tag name={item.name} key={`${item.name}_${index}`} />
            ))
          }
          <button
            className="text-[12px] font-normal text-[#1DA1F2] cursor-pointer"
            onClick={handleShowMore}
          >
            show more
          </button>
        </div>

        {/* Action Buttons */}
        <section className='space-y-4'>
          <button
            onClick={handleAnalyzeRegion}
            disabled={!locations[0]?.selectedLocation}
            className={`cursor-pointer text-black w-full rounded-[24px] flex justify-center items-center text-base font-semibold h-[48px] transition-all duration-300 ease-in ${locations[0]?.selectedLocation
              ? 'bg-white hover:bg-gray-200'
              : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            Analyze This Region
          </button>

          <button
            onClick={handleCompareRegions}
            disabled={!canCompareRegions}
            className={`cursor-pointer text-white shadow-sm shadow-white w-full rounded-[24px] flex justify-center items-center text-base font-semibold h-[48px] transition-all duration-300 ease-in ${canCompareRegions
              ? 'bg-[#1DA1F21F] hover:bg-[#1da0f236]'
              : 'bg-gray-600 cursor-not-allowed'
              }`}
          >
            Compare Regions
          </button>
        </section>
      </section>


      {/* Modal Overlay - keeping your existing modal code */}
      {activeModal && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ease-in-out ${isVisible ? 'bg-black/50' : 'bg-transparent'
            }`}
        >
          {/* EchoGrid Modal */}
          {activeModal === 'echogrid' && (
            <EchoGridModal onClick={closeModal} onChangeTopics={handleChangeTopics} />
          )}

          {/* Right-side Modal Container */}
          <div
            className={`fixed right-0 top-0 h-full transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            style={{
              transitionProperty: 'transform, opacity',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >

            {/* Search Results Modal */}
            {activeModal === 'search' && (
              <div className="h-full w-[400px] relative shadow-2xl">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 text-2xl font-bold transition-colors duration-200 bg-black bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm"
                >
                  ×
                </button>
                <div className={`h-full transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                  }`}>
                  <TweetResults location={locations[0].query.trim()} rawTweets={formatAnalysisData(analysisData)} isLoading={isLoading} />
                </div>
              </div>
            )}

            {/* Compare Tweets Modal */}
            {activeModal === 'compare' && (
              <div className="h-full w-[800px] relative shadow-2xl">
                <div className={`h-full transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-4 opacity-0'
                  }`}>
                  <CompareTweets />
                </div>
              </div>
            )}
          </div>

          {/* Click outside to close */}
          <button
            className="absolute inset-0 -z-10"
            onClick={closeModal}
          />
        </div>
      )}
    </>
  )
}

export default SideBar