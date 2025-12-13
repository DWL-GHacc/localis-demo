import { useMemo } from  "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api"

const wrapperStyle = {
    width: "100%",
    height: "280px",
    borderTopLeftRadius: "0.5rem",
    borderTopRightRadius: "0.5rem",
    overflow: "hidden",
};

const containerStyle = {
    width: "100%",
    height: "100%",
};

const REGION_SETTINGS = {
  Noosa: {
    center: { lat: -26.394, lng: 153.091 },
    zoom: 11,
  },
  Cairns: {
    center: { lat: -16.9186, lng: 145.7781 },
    zoom: 11,
  },
  Whitsundays: {
    center: { lat: -20.2762, lng: 148.7557 },
    zoom: 9,
  },
  "Gold Coast": {
    center: { lat: -28.0167, lng: 153.4 },
    zoom: 11,
  },
};

export default function RegionMapBanner({ region }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const mapConfig = useMemo(() => {
    if (!region || !REGION_SETTINGS[region]) return null;
    return REGION_SETTINGS[region];
  }, [region]);

  if (loadError) {
    return (
      <div style={wrapperStyle} className="d-flex align-items-center justify-content-center bg-light">
        <span className="text-muted small">Map could not be loaded.</span>
      </div>
    );
  }

  if (!isLoaded || !mapConfig) {
    return (
      <div style={wrapperStyle} className="d-flex align-items-center justify-content-center bg-light">
        <span className="text-muted small">
          {region ? "Loading map…" : "Select a region to view the map."}
        </span>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        }}
      >
        <Marker position={mapConfig.center} />
      </GoogleMap>
    </div>
  );
} 