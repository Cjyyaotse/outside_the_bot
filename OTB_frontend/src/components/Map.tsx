import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapCanvas = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_DEFAULT_PUBLIC_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          theme: "default",
          lightPreset: 'night',
        },
      },
      center: [-0.1860, 5.6061], //[longitude, latitude]
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    mapRef.current.on('style.load', () => {
      const layers = mapRef?.current?.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer?.layout?.['text-field']
      )?.id;

      mapRef?.current?.addLayer(
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


    return () => mapRef.current?.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />;
};

export default MapCanvas;