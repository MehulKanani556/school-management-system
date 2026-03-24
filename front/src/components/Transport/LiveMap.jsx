import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, MapPin, Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Bus Icon
const createBusIcon = (heading = 0) => {
    const html = renderToStaticMarkup(
        <div style={{ transform: `rotate(${heading}deg)`, transition: 'transform 0.5s ease' }}>
            <div className="bg-orange-600 p-2 rounded-md border-2 border-white shadow-xl flex items-center justify-center text-white">
                <Bus size={20} />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-orange-600"></div>
        </div>
    );
    return L.divIcon({
        html,
        className: 'custom-bus-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
};

// Custom Stop Icon
const createStopIcon = (color = '#64748b') => {
    const html = renderToStaticMarkup(
        <div className="flex flex-col items-center">
             <div style={{ backgroundColor: color }} className="p-1 rounded-full border-2 border-white shadow-md text-white">
                <MapPin size={12} />
            </div>
        </div>
    );
    return L.divIcon({
        html,
        className: 'custom-stop-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Component to handle map center updates
const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo([coords.lat, coords.lng], map.getZoom(), {
                animate: true,
                duration: 1.5
            });
        }
    }, [coords, map]);
    return null;
};

const LiveMap = ({ vehicleLocation, stops = [], autoCenter = true }) => {
    const defaultCenter = [23.0225, 72.5714]; // Default point
    
    // Ensure center has valid numbers
    const center = (vehicleLocation && typeof vehicleLocation.lat === 'number' && typeof vehicleLocation.lng === 'number')
        ? [vehicleLocation.lat, vehicleLocation.lng] 
        : defaultCenter;

    // Filter valid stops
    const validStops = stops.filter(stop => 
        stop && typeof stop.lat === 'number' && typeof stop.lng === 'number'
    );

    return (
        <div className="h-full w-full rounded-md overflow-hidden border border-slate-800 relative shadow-2xl">
            <MapContainer 
                center={center} 
                zoom={14} 
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {autoCenter && vehicleLocation && typeof vehicleLocation.lat === 'number' && typeof vehicleLocation.lng === 'number' && (
                    <RecenterMap coords={vehicleLocation} />
                )}

                {/* Stops */}
                {validStops.map((stop, idx) => (
                    <Marker 
                        key={`${stop.name || 'stop'}-${idx}`} 
                        position={[stop.lat, stop.lng]} 
                        icon={createStopIcon(stop.isTarget ? '#f43f5e' : '#64748b')}
                    >
                        <Popup className="custom-popup">
                            <div className="font-outfit p-1">
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stop.isTarget ? 'Your Stop' : 'Route Stop'}</p>
                                <p className="text-sm font-bold text-slate-900">{stop.name}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Path */}
                {validStops.length > 1 && (
                    <Polyline 
                        positions={validStops.map(s => [s.lat, s.lng])} 
                        pathOptions={{ color: '#f97316', weight: 3, dashArray: '10, 10', opacity: 0.4 }} 
                    />
                )}

                {/* Vehicle */}
                {vehicleLocation && typeof vehicleLocation.lat === 'number' && typeof vehicleLocation.lng === 'number' && (
                    <Marker 
                        position={[vehicleLocation.lat, vehicleLocation.lng]} 
                        icon={createBusIcon(vehicleLocation.heading || 0)}
                    >
                        <Popup className="custom-popup">
                            <div className="font-outfit p-1">
                                <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest leading-none mb-1">Live Vehicle</p>
                                <p className="text-sm font-bold text-slate-900 leading-none">{vehicleLocation.vehicleNumber || 'School Bus'}</p>
                                <div className="mt-2 flex items-center gap-2 pt-2 border-t border-slate-100">
                                    <Navigation size={12} className="text-emerald-500" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Uplink Stable</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Map Overlay Info */}
            <div className="absolute top-4 right-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-md shadow-2xl pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                    <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Encrypted Satellite Feed</span>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .leaflet-container { font-family: 'Outfit', sans-serif; }
                .custom-popup .leaflet-popup-content-wrapper { background: white; border-radius: 4px; padding: 0; overflow: hidden; }
                .custom-popup .leaflet-popup-content { margin: 8px 12px; }
                .custom-popup .leaflet-popup-tip { background: white; }
            `}} />
        </div>
    );
};

export default LiveMap;
