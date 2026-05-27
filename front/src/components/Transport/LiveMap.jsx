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

// Component to fetch and display OSRM road-network route lines styled in glowing orange
const RoadNetworkPath = ({ stops }) => {
    const [roadPoints, setRoadPoints] = useState([]);

    useEffect(() => {
        const sorted = [...stops]
            .filter(s => s && typeof s.lat === 'number' && typeof s.lng === 'number');

        if (sorted.length < 2) {
            setRoadPoints([]);
            return;
        }

        let isMounted = true;
        const fetchRoute = async () => {
            try {
                const coordsString = sorted.map(s => `${s.lng},${s.lat}`).join(';');
                const resp = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
                if (!resp.ok) throw new Error('OSRM request failed');
                const data = await resp.json();
                if (data.routes && data.routes[0] && data.routes[0].geometry) {
                    const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]); // OSRM returns [lng, lat]
                    
                    // High-accuracy coordinate snapping patch:
                    // Force the route line to pass EXACTLY through the actual marker coordinates of every stop,
                    // by inserting/matching the exact marker coordinates into the OSRM path geometry.
                    const correctedCoords = [...coords];
                    
                    const findClosestIndex = (path, target) => {
                        let minD = Infinity;
                        let closestIdx = 0;
                        const [tLat, tLng] = target;
                        for (let i = 0; i < path.length; i++) {
                            const [cLat, cLng] = path[i];
                            const d = (cLat - tLat) ** 2 + (cLng - tLng) ** 2;
                            if (d < minD) {
                                minD = d;
                                closestIdx = i;
                            }
                        }
                        return closestIdx;
                    };

                    sorted.forEach((stop, index) => {
                        const actual = [stop.lat, stop.lng];
                        if (index === 0) {
                            correctedCoords[0] = actual;
                        } else if (index === sorted.length - 1) {
                            correctedCoords[correctedCoords.length - 1] = actual;
                        } else {
                            const closestIdx = findClosestIndex(correctedCoords, actual);
                            // Insert to form a perfect path touching the marker directly
                            correctedCoords.splice(closestIdx, 0, actual);
                        }
                    });

                    if (isMounted) {
                        setRoadPoints(correctedCoords);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch OSRM road route, falling back to straight lines:', err);
                if (isMounted) {
                    setRoadPoints([]); // Fall back to straight line
                }
            }
        };

        fetchRoute();
        return () => { isMounted = false; };
    }, [stops]);

    const fallbackPoints = [...stops]
        .filter(s => s && typeof s.lat === 'number' && typeof s.lng === 'number')
        .map(s => [s.lat, s.lng]);

    const activePoints = roadPoints.length > 0 ? roadPoints : fallbackPoints;

    if (activePoints.length < 2) return null;

    return (
        <>
            <Polyline
                positions={activePoints}
                pathOptions={{ color: '#ea580c', weight: 8, opacity: 0.2 }}
            />
            <Polyline
                positions={activePoints}
                pathOptions={{ color: '#f97316', weight: 3, opacity: 0.8, dashArray: '5, 10' }}
            />
        </>
    );
};

const LiveMap = ({ vehicleLocation, allLocations = {}, stops = [], autoCenter = true, mapTheme = 'dark' }) => {
    const defaultCenter = [21.1702, 72.8311]; // Default point (Surat center)

    const center = (vehicleLocation && typeof vehicleLocation.lat === 'number' && typeof vehicleLocation.lng === 'number')
        ? [vehicleLocation.lat, vehicleLocation.lng]
        : defaultCenter;

    const validStops = stops.filter(stop =>
        stop && typeof stop.lat === 'number' && typeof stop.lng === 'number'
    );

    const tileUrl = mapTheme === 'satellite' 
        ? "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" 
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    const subdomains = mapTheme === 'satellite' ? ['mt0','mt1','mt2','mt3'] : ['a','b','c','d'];

    return (
        <div className="h-full w-full rounded-md overflow-hidden border border-slate-800 relative shadow-2xl">
            <MapContainer
                center={center}
                zoom={14}
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                zoomControl={false}
            >
                <TileLayer
                    key={mapTheme}
                    url={mapTheme === 'satellite' ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" : tileUrl}
                    subdomains={subdomains}
                    attribution={mapTheme === 'satellite' ? '&copy; Esri' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'}
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
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">{stop.isTarget ? 'Your Stop' : 'Route Stop'}</p>
                                <p className="text-sm font-bold text-slate-900 leading-none">{stop.name}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Real Road-Network Route path joining all stops dynamically */}
                <RoadNetworkPath stops={validStops} />

                {/* Multiple Vehicles */}
                {Object.entries(allLocations).map(([vid, loc]) => {
                    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return null;
                    const isSelected = vehicleLocation && vehicleLocation.vehicleId === vid;
                    
                    return (
                        <Marker
                            key={vid}
                            position={[loc.lat, loc.lng]}
                            icon={createBusIcon(loc.heading || 0)}
                            zIndexOffset={isSelected ? 1000 : 0}
                        >
                            <Popup className="custom-popup">
                                <div className="font-outfit p-1">
                                    <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest leading-none mb-1">Live Location</p>
                                    <p className="text-sm font-bold text-slate-900 leading-none">{loc.registrationNumber || 'School Bus'}</p>
                                    <div className="mt-2 flex items-center gap-2 pt-2 border-t border-slate-100">
                                        <Navigation size={12} className="text-emerald-500" />
                                        <span className="text-[9px] font-black text-slate-500 uppercase leading-none">Connection Active</span>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase italic">SPEED: {loc.speed?.toFixed(1) || 0} KM/H</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Map Overlay Info */}
            <div className="absolute top-4 right-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-md shadow-2xl pointer-events-none">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                    <span className="text-[9px] font-black text-white uppercase tracking-widest italic leading-none">Live GPS Feed</span>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-container { font-family: 'Outfit', sans-serif; }
                .custom-popup .leaflet-popup-content-wrapper { background: white; border-radius: 4px; padding: 0; overflow: hidden; }
                .custom-popup .leaflet-popup-content { margin: 8px 12px; }
                .custom-popup .leaflet-popup-tip { background: white; }
            `}} />
        </div>
    );
};

export default LiveMap;
