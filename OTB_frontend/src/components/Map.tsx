import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { reverseGeocode } from '../utils/helpers';
import type { LocationSuggestion } from '../utils/types';

interface MapCanvasProps {
  location?: { lng: number, lat: number };
  onMapSelect?: (location: LocationSuggestion) => void;
  zoomLevel?: number;
}

const MapCanvas: React.FC<MapCanvasProps> = ({ location, onMapSelect, zoomLevel = 15 }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_DEFAULT_PUBLIC_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          theme: "default",
          lightPreset: 'night',
        },
      },
      center: [-0.1860, 5.6061], // [longitude, latitude]
      zoom: zoomLevel,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    mapRef.current = map;

    map.on('load', () => {
      setIsLoading(false); // hide skeleton when map is ready
    });

    map.on('style.load', () => {
      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    mapRef.current.on("load", () => {
      setIsLoading(true);
    });

    mapRef.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      console.log("Clicked coordinates:", lng, lat);

      const features = mapRef?.current?.queryRenderedFeatures(e.point);
      console.log("Features:", features);

      const location = await reverseGeocode(lng, lat)

      if (onMapSelect) {
        onMapSelect(location as LocationSuggestion);
      }
    });

    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    console.log("Flying to location:", location);
    if (location && mapRef.current) {
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: zoomLevel,
        duration: 800
      })
    }
  }, [location, zoomLevel]);

  return (
    <div className="relative h-full w-full">
      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F1621] animate-pulse rounded-lg">
          <p className="text-gray-400">Loading map...</p>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      />
    </div>
  );
};

export default MapCanvas;
