import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoutesSlice, addRouteSlice, updateRouteSlice, deleteRouteSlice, fetchVehicles, clearTransportMessage, fetchTransportApplicantsSlice, assignStudentSlice, unassignStudentSlice } from '../../redux/slice/transport.slice';
import {
    Navigation, Plus, MapPin, Trash2, Edit3, Bus, Loader2, X, Users, Activity, Crosshair,
    UserPlus, UserMinus, ShieldCheck, Search, Home, Info, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchStudents } from '../../redux/slice/schoolAdmin.slice';

// Leaflet sizing invalidation helper for dynamic modal layouts
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 450);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

// Component to fetch and display OSRM road-network route lines with high-fidelity glow
const RoadNetworkPath = ({ stops, color1 = '#06b6d4', color2 = '#22d3ee', weight1 = 8, weight2 = 3 }) => {
    const [roadPoints, setRoadPoints] = React.useState([]);

    useEffect(() => {
        const sorted = [...stops]
            .filter(s => s.lat && s.lng)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

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
        .filter(s => s.lat && s.lng)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(s => [s.lat, s.lng]);

    const activePoints = roadPoints.length > 0 ? roadPoints : fallbackPoints;

    if (activePoints.length < 2) return null;

    return (
        <>
            <Polyline
                positions={activePoints}
                pathOptions={{ color: color1, weight: weight1, opacity: 0.3 }}
            />
            <Polyline
                positions={activePoints}
                pathOptions={{ color: color2, weight: weight2, opacity: 0.9, dashArray: '5, 10' }}
            />
        </>
    );
};

// Map component for picking coordinates
const StopPickerMap = ({ onPick, stops = [], center }) => {
    const map = useMap();
    useMapEvents({
        click(e) {
            onPick(e.latlng);
        },
    });

    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { animate: true });
        }
    }, [center, map]);

    useEffect(() => {
        // Enforce bounds recalculation on mounting
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 450);
        return () => clearTimeout(timer);
    }, [map]);

    return (
        <>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
            />
            {stops.map((stop, idx) => (
                stop.lat && stop.lng && (
                    <Marker
                        key={idx}
                        position={[stop.lat, stop.lng]}
                        icon={L.divIcon({
                            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>`,
                            className: 'custom-marker',
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                        })}
                    />
                )
            ))}
        </>
    );
};

const Routes = () => {
    const dispatch = useDispatch();
    const { routes, vehicles, applicants, loading, message, error } = useSelector((state) => state.transport);
    const { students } = useSelector((state) => state.schoolAdmin);

    // Build set of all assigned student IDs across all routes to filter out duplicates in assignment
    const assignedStudentIds = React.useMemo(() => {
        const ids = new Set();
        routes.forEach(r => {
            if (r.assignedStudents) {
                r.assignedStudents.forEach(s => {
                    const id = s.studentId?._id || s.studentId;
                    if (id) ids.add(id.toString());
                });
            }
        });
        return ids;
    }, [routes]);
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [isAssignOpen, setIsAssignOpen] = React.useState(false);
    const [selectedRoute, setSelectedRoute] = React.useState(null);
    const [selectedRouteForAssign, setSelectedRouteForAssign] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        vehicleId: '',
        stops: [
            {
                name: 'School',
                order: 1,
                estimatedTime: '08:00 AM',
                lat: 21.1702,
                lng: 72.8311
            }
        ],
        status: 'active',
        fee: 0,
        startTime: '08:00 AM'
    });
    const [newStop, setNewStop] = React.useState({ name: '', order: 2, estimatedTime: '08:00 AM', lat: null, lng: null });
    const [searchTerm, setSearchTerm] = React.useState('');
    const [mapSearch, setMapSearch] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [isLocating, setIsLocating] = React.useState(false);
    const [isAutoTime, setIsAutoTime] = React.useState(true);
    const [schoolLoc, setSchoolLoc] = React.useState({ lat: 21.1702, lng: 72.8311 }); // Default to Surat center fallback
    const [assignData, setAssignData] = React.useState({ studentId: '', pickupStop: '', dropoffStop: '', seatNumber: '' });
    const [studentSearch, setStudentSearch] = React.useState('');
    const [activeMapRoute, setActiveMapRoute] = React.useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setSchoolLoc({ lat: latitude, lng: longitude });
                    setFormData(prev => {
                        // If it has only the default placeholder school coordinates, update them
                        const updatedStops = [...prev.stops];
                        if (updatedStops.length > 0 && updatedStops[0].name === 'School' && updatedStops[0].lat === 21.1702 && updatedStops[0].lng === 72.8311) {
                            updatedStops[0] = { ...updatedStops[0], lat: latitude, lng: longitude };
                            return { ...prev, stops: updatedStops };
                        }
                        return prev;
                    });
                },
                (error) => {
                    console.log("Auto-location failed or denied, using Surat default:", error);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }, []);

    useEffect(() => {
        dispatch(fetchRoutesSlice());
        dispatch(fetchVehicles());
        dispatch(fetchTransportApplicantsSlice());
        dispatch(fetchStudents());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(clearTransportMessage());
            dispatch(fetchTransportApplicantsSlice());
            setIsAddOpen(false);
            setIsEditOpen(false);
            setIsAssignOpen(false);
            resetForm();
        }
        if (error) {
            toast.error(error);
            dispatch(clearTransportMessage());
        }
    }, [message, error, dispatch]);

    const resetForm = () => {
        setFormData({
            name: '',
            vehicleId: '',
            stops: [
                {
                    name: 'School',
                    order: 1,
                    estimatedTime: '08:00 AM',
                    lat: schoolLoc.lat,
                    lng: schoolLoc.lng
                }
            ],
            status: 'active',
            fee: 0,
            startTime: '08:00 AM'
        });
        setNewStop({ name: '', order: 2, estimatedTime: '08:00 AM', lat: null, lng: null });
        setSelectedRoute(null);
        setAssignData({ studentId: '', pickupStop: '', dropoffStop: '', seatNumber: '' });
    }

    const helperDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const helperAddTime = (baseTime, distKm) => {
        const speed = 25; // km/h
        const addedMins = (distKm / speed) * 60 + 2; // 2 min buffer
        const [h, m_ap] = baseTime.split(':');
        const [m, ap] = m_ap.split(' ');
        let hours = parseInt(h);
        let mins = parseInt(m);
        if (ap === 'PM' && hours < 12) hours += 12;
        if (ap === 'AM' && hours === 12) hours = 0;
        let total = hours * 60 + mins + Math.round(addedMins);
        let nh = Math.floor(total / 60) % 24;
        let nm = total % 60;
        let nap = nh >= 12 ? 'PM' : 'AM';
        return `${(nh % 12 || 12).toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')} ${nap}`;
    };

    const handleMapSearch = async (query = mapSearch) => {
        if (!query) return;
        setIsSearching(true);
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
            const data = await resp.json();
            if (data.length > 0) {
                setSuggestions(data);
                if (query === mapSearch) {
                    const { lat, lon } = data[0];
                    setNewStop({ ...newStop, lat: parseFloat(lat), lng: parseFloat(lon) });
                }
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleGetMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setSchoolLoc({ lat: latitude, lng: longitude });
                setNewStop(prev => ({ ...prev, lat: latitude, lng: longitude }));
                toast.success("Location fetched successfully!");
                setIsLocating(false);
            },
            (error) => {
                console.error("Error fetching location:", error);
                toast.error("Unable to retrieve location. Please check browser permissions.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (mapSearch.length > 2) {
                handleMapSearch(mapSearch);
            } else {
                setSuggestions([]);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [mapSearch]);

    const selectSuggestion = (s) => {
        const lat = parseFloat(s.lat);
        const lon = parseFloat(s.lon);
        setNewStop({ ...newStop, lat, lng: lon, name: s.display_name.split(',')[0] });
        setMapSearch(s.display_name);
        setSuggestions([]);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        dispatch(addRouteSlice(formData));
    }

    const handleEdit = (e) => {
        e.preventDefault();
        dispatch(updateRouteSlice({ id: selectedRoute._id, data: formData }));
    }

    const handleAssign = (e) => {
        e.preventDefault();
        if (!assignData.studentId || !selectedRouteForAssign) return toast.error('Please select a student');
        dispatch(assignStudentSlice({ routeId: selectedRouteForAssign._id, data: assignData }));
    }

    const handleUnassign = async (studentId) => {
        if (await window.confirm('Remove student from this route?')) {
            dispatch(unassignStudentSlice({ routeId: selectedRouteForAssign._id, studentId }));
        }
    }

    const openAssign = (route) => {
        setSelectedRouteForAssign(route);
        // Pre-fill stops if possible
        const nonSchoolStops = route.stops.filter(s => s.name !== 'School');
        const defaultStop = nonSchoolStops[0]?.name || '';
        setAssignData({ studentId: '', pickupStop: defaultStop, dropoffStop: defaultStop, seatNumber: '' });
        setIsAssignOpen(true);
    }

    const toggleStatus = (route) => {
        const newStatus = route.status === 'active' ? 'inactive' : 'active';
        dispatch(updateRouteSlice({ id: route._id, data: { status: newStatus } }));
    }

    const openEdit = (route) => {
        setSelectedRoute(route);
        setFormData({
            name: route.name,
            vehicleId: route.vehicleId?._id || '',
            stops: [...route.stops],
            status: route.status || 'active',
            fee: route.fee || 0,
            startTime: route.stops?.[0]?.estimatedTime || '08:00 AM'
        });
        setIsEditOpen(true);
    }

    const addStop = () => {
        if (!newStop.name) return toast.error('Stop name is required');
        if (!newStop.lat || !newStop.lng) return toast.error('Select location on map');

        let finalTime = newStop.estimatedTime;
        if (isAutoTime) {
            if (formData.stops.length === 0) {
                // First stop always starts exactly at the route's specified Start Time
                finalTime = formData.startTime;
            } else {
                const prevStop = formData.stops[formData.stops.length - 1];
                const dist = helperDistance(prevStop.lat, prevStop.lng, newStop.lat, newStop.lng);
                finalTime = helperAddTime(prevStop.estimatedTime, dist);
            }
        }

        const order = formData.stops.length + 1;
        setFormData({ ...formData, stops: [...formData.stops, { ...newStop, order, estimatedTime: finalTime }] });
        setNewStop({ name: '', order: order + 1, estimatedTime: finalTime, lat: null, lng: null });
    }

    const removeStop = (index) => {
        const stopToRemove = formData.stops[index];
        if (stopToRemove && stopToRemove.name === 'School' && index === 0) {
            toast.error('The school base stop cannot be removed.');
            return;
        }
        const updatedStops = formData.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
        setFormData({ ...formData, stops: updatedStops });
    }

    const handleDelete = async (id) => {
        if (await window.confirm('Delete this route? This action cannot be undone.')) {
            dispatch(deleteRouteSlice(id));
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0, transitionEnd: { transform: "none" } }} className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-2 font-outfit gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1 leading-none text-transporter-primary">Routes</h1>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-70 leading-none">Manage your bus routes and stops.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="SEARCH ROUTES..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-slate-800 rounded-md py-3 pl-10 pr-4 text-[10px] font-black uppercase italic text-white focus:border-blue-500/50 outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsAddOpen(true); }}
                        className="px-6 py-4 bg-transporter-primary text-white text-[11px] font-black italic uppercase tracking-widest rounded-md shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:translate-y-[-2px] transition-all flex items-center gap-2 group h-[42px] leading-none"
                    >
                        <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Create Route
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 font-outfit">
                {routes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? routes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((route, i) => (
                    <div key={route._id} className={`bg-neutral-900 border ${route.status === 'inactive' ? 'border-rose-900/40 opacity-70' : 'border-slate-800/60'} rounded-md p-8 shadow-2xl group hover:border-blue-600/30 transition-all relative`}>
                        {/* Title and Quick Actions Row */}
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-800/40 gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className={`p-3 bg-neutral-950 border border-slate-800 rounded-md shrink-0 ${route.status === 'inactive' ? 'text-rose-500' : 'text-cyan-500'}`}><Navigation size={20} /></div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-200 uppercase italic tracking-tighter leading-tight">{route.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase italic tracking-widest shrink-0 ${route.status === 'active' ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-600/20' : 'bg-rose-600/10 text-rose-500 border border-rose-600/20'}`}>
                                            {route.status || 'active'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase italic opacity-60 tracking-widest mt-1.5">
                                        Bus Number: {route.vehicleId?.registrationNumber || 'NOT SET'}
                                    </p>
                                </div>
                            </div>

                            {/* Compact Quick Admin Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => toggleStatus(route)}
                                    title={route.status === 'active' ? 'Deactivate Route' : 'Activate Route'}
                                    className={`p-2.5 bg-neutral-950 border border-slate-800 hover:border-slate-700 rounded-md transition-all shadow-lg ${route.status === 'active' ? 'text-emerald-500 hover:text-rose-500' : 'text-rose-500 hover:text-emerald-500'}`}
                                >
                                    <Activity size={14} />
                                </button>
                                <button
                                    onClick={() => openEdit(route)}
                                    title="Edit Route"
                                    className="p-2.5 text-slate-400 hover:text-blue-400 bg-neutral-950 border border-slate-800 hover:border-slate-700 rounded-md transition-all shadow-lg"
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(route._id)}
                                    title="Delete Route"
                                    className="p-2.5 text-slate-400 hover:text-rose-500 bg-neutral-950 border border-slate-800 hover:border-slate-700 rounded-md transition-all shadow-lg"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Interactive Main Actions & Telemetry Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveMapRoute(route)}
                                    className="flex-1 py-3 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-600/20 hover:border-cyan-500 rounded-md transition-all shadow-lg text-cyan-400 hover:text-white flex items-center justify-center gap-2 text-[10px] font-black uppercase italic leading-none animate-pulse hover:animate-none"
                                >
                                    <MapPin size={14} /> Map View
                                </button>
                                <button
                                    onClick={() => openAssign(route)}
                                    className="flex-1 py-3 bg-blue-600/10 hover:bg-blue-600 border border-blue-600/20 hover:border-blue-500 rounded-md transition-all shadow-lg text-blue-400 hover:text-white flex items-center justify-center gap-2 text-[10px] font-black uppercase italic leading-none"
                                >
                                    <Users size={14} /> Enrollments
                                </button>
                            </div>

                            <div className="flex items-center justify-around px-4 py-2 bg-neutral-950/40 rounded-md border border-slate-800/60 text-slate-300">
                                <div className="flex items-center gap-2">
                                    <Users size={12} className="text-cyan-500" />
                                    <span className="text-[10px] font-black uppercase italic tracking-tighter">{route.assignedStudents?.length || 0} Students</span>
                                </div>
                                <div className="text-[9px] text-slate-500 uppercase font-black italic tracking-widest">
                                    Capacity: <span className="text-slate-300">{route.vehicleId?.capacity || 0}</span>
                                </div>
                                <div className="text-[9px] text-slate-500 uppercase font-black italic tracking-widest">
                                    Load: <span className="text-slate-300">{Math.round(((route.assignedStudents?.length || 0) / (route.vehicleId?.capacity || 1)) * 100)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Mini Map Preview */}
                        {route.stops?.some(s => s.lat) && (
                            <div
                                onClick={() => setActiveMapRoute(route)}
                                className="h-32 mb-6 rounded border border-slate-800 overflow-hidden grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100 cursor-pointer relative group/map"
                            >
                                {/* Overlay Prompt */}
                                <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-[1px] opacity-0 group-hover/map:opacity-100 transition-all flex items-center justify-center z-[400]">
                                    <span className="px-4 py-2 bg-neutral-900 border border-slate-800 text-[9px] font-black uppercase tracking-[0.2em] italic text-cyan-400 rounded-md shadow-2xl flex items-center gap-2">
                                        <MapPin size={10} className="animate-bounce" /> Click to Expand Interactive Map
                                    </span>
                                </div>
                                <MapContainer
                                    center={[route.stops.find(s => s.lat).lat, route.stops.find(s => s.lat).lng]}
                                    zoom={11}
                                    className="h-full w-full"
                                    zoomControl={false}
                                    dragging={false}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                                    {/* Real Road-Network Route path joining all stops dynamically */}
                                    <RoadNetworkPath
                                        stops={route.stops}
                                        color1="#06b6d4"
                                        color2="#22d3ee"
                                        weight1={4}
                                        weight2={1.5}
                                    />
                                    {route.stops.map((s, idx) => s.lat && (
                                        <Marker
                                            key={idx}
                                            position={[s.lat, s.lng]}
                                            icon={L.divIcon({ html: '<div class="w-2.5 h-2.5 bg-cyan-500 rounded-full border border-slate-900 shadow-md"></div>', className: 'm-0', iconSize: [10, 10] })}
                                        />
                                    ))}
                                </MapContainer>
                            </div>
                        )}

                        <div className="space-y-6">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic mb-4">Bus Stops</h4>
                            <div className="relative pl-6 space-y-6">
                                {/* The Continuous Elegant Timeline Axis Line */}
                                <div className="absolute left-[4px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-500/50 via-slate-800 to-cyan-500/50"></div>

                                {[...route.stops].sort((a, b) => a.order - b.order).map((stop, idx) => (
                                    <div key={idx} className="relative flex items-center group/stop">
                                        {/* Glowing Dot on the Axis (absolutely positioned relative to the list parent) */}
                                        <div className="absolute left-[-26px] w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.65)] z-10"></div>

                                        {/* Stop Card */}
                                        <div className="flex-1 bg-neutral-950/40 p-3 rounded-md border border-slate-800/60 group-hover/stop:border-cyan-500/30 transition-all flex justify-between items-center ml-2">
                                            <div>
                                                <p className="text-[11px] font-black text-slate-300 uppercase italic leading-none mb-1">{stop.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] font-bold text-slate-600 uppercase italic opacity-60 leading-none">STOP NO. {stop.order}</p>
                                                    {stop.lat && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"><MapPin size={8} /> LIVE LOCATION</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black italic opacity-85 leading-none text-cyan-400">{stop.estimatedTime}</p>
                                                <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-0.5">TIME</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {route.stops.length === 0 && <p className="text-[10px] font-black uppercase text-slate-700 italic border border-slate-800/40 border-dashed p-10 rounded-md text-center">No stops added for this route.</p>}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="xl:col-span-2 p-20 border border-slate-800 border-dashed rounded-md text-center bg-neutral-900/40 shadow-2xl">
                        <p className="text-[11px] font-black italic uppercase text-slate-600 tracking-[0.2em] opacity-40">No routes found.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {(isAddOpen || isEditOpen) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0 font-outfit">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-neutral-900 w-full max-w-4xl rounded-md border border-slate-800 shadow-2xl relative z-10 overflow-y-auto xl:overflow-hidden custom-scrollbar max-h-[95vh] flex flex-col xl:flex-row">

                            {/* Left: Form */}
                            <form onSubmit={isEditOpen ? handleEdit : handleAdd} className="flex-1 space-y-6 p-10 overflow-y-visible xl:overflow-y-auto shrink-0">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-100 mb-8 pb-4 border-b border-slate-800/60 leading-none">
                                    {isEditOpen ? 'Edit Route' : 'Add Route'}
                                </h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Route Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-blue-600/50 transition-all italic leading-none h-[42px]"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 text-blue-500">Start Time</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.startTime}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormData(prev => {
                                                        const updatedStops = [...prev.stops];
                                                        if (updatedStops.length > 0 && updatedStops[0].name === 'School') {
                                                            updatedStops[0] = { ...updatedStops[0], estimatedTime: val };
                                                        }
                                                        return { ...prev, startTime: val, stops: updatedStops };
                                                    });
                                                }}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-blue-500 focus:outline-none focus:border-blue-600/50 transition-all italic leading-none h-[42px]"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1 text-emerald-500/80">Fee (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                value={formData.fee}
                                                onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) })}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-xs font-bold text-emerald-500 focus:outline-none focus:border-emerald-600/50 transition-all italic leading-none h-[42px]"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none appearance-none h-[42px] leading-none"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Select Bus</label>
                                        <select
                                            required
                                            value={formData.vehicleId}
                                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                            className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-3 px-4 text-[11px] font-black uppercase italic text-slate-300 focus:outline-none focus:border-blue-600/50 appearance-none h-[42px] leading-none"
                                        >
                                            <option value="">Select vehicle...</option>
                                            {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber} ({v.driverId?.name || 'NO DRIVER'})</option>)}
                                        </select>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800/40">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic mb-6">Bus Stops</h4>
                                        <div className="space-y-4 mb-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Stop Name"
                                                    value={newStop.name}
                                                    onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                                                    className="bg-neutral-950 border border-slate-800/60 rounded-md py-2 px-3 text-[10px] font-black uppercase text-slate-200 focus:border-blue-600/40 h-[38px] leading-none"
                                                />
                                                <div className="relative flex items-center h-[38px]">
                                                    <input
                                                        type="text"
                                                        placeholder="HH:MM AM/PM"
                                                        disabled={isAutoTime}
                                                        value={isAutoTime ? 'Auto-Calculated' : newStop.estimatedTime}
                                                        onChange={(e) => setNewStop({ ...newStop, estimatedTime: e.target.value })}
                                                        className="w-full bg-neutral-950 border border-slate-800/60 rounded-md py-2 pl-3 pr-16 text-[10px] font-black uppercase text-slate-200 focus:border-blue-600/40 h-full leading-none disabled:opacity-40 disabled:text-cyan-400"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsAutoTime(!isAutoTime)}
                                                        className={`absolute right-1 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider rounded-md border transition-all h-[30px] flex items-center leading-none ${isAutoTime ? 'bg-cyan-600/10 border-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                                    >
                                                        {isAutoTime ? 'Auto' : 'Manual'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 bg-black/40 p-3 rounded-md border border-slate-800/40 flex-wrap">
                                                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 italic">
                                                    <Crosshair size={12} className={newStop.lat ? 'text-emerald-500' : ''} />
                                                    {newStop.lat ? `COORD: ${newStop.lat.toFixed(4)}, ${newStop.lng.toFixed(4)}` : 'SELECT ON MAP'}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={addStop}
                                                    disabled={!newStop.lat}
                                                    className="ml-auto bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-md text-[9px] font-black uppercase tracking-widest px-6 py-2 hover:bg-blue-600 hover:text-white transition-all italic leading-none h-[38px] disabled:opacity-30"
                                                >
                                                    add stop
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {formData.stops.map((s, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-neutral-950/60 rounded-md border border-slate-800/40 group/item transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase italic w-4">{idx + 1}.</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-200 uppercase italic">{s.name}</span>
                                                            <span className="text-[9px] font-bold text-blue-500 italic">{s.estimatedTime}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-slate-600 italic uppercase">
                                                            {s.lat && s.lng ? `[${s.lat.toFixed(4)}, ${s.lng.toFixed(4)}]` : 'NO COORD'}
                                                        </span>
                                                        {s.name === 'School' && idx === 0 ? (
                                                            <button
                                                                type="button"
                                                                title="Set School Location from Map Selection"
                                                                onClick={() => {
                                                                    if (newStop.lat) {
                                                                        setFormData(prev => {
                                                                            const updatedStops = [...prev.stops];
                                                                            updatedStops[0] = { ...updatedStops[0], lat: newStop.lat, lng: newStop.lng };
                                                                            return { ...prev, stops: updatedStops };
                                                                        });
                                                                        setSchoolLoc({ lat: newStop.lat, lng: newStop.lng });
                                                                        toast.success('School base location set from map selection!');
                                                                    } else {
                                                                        toast.error('Click on the map first to select the location.');
                                                                    }
                                                                }}
                                                                className="p-1.5 text-emerald-500 hover:text-emerald-400 bg-neutral-950 border border-slate-800 rounded-md transition-all"
                                                            >
                                                                <MapPin size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeStop(idx)}
                                                                className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all bg-neutral-950 border border-slate-800 rounded-md"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                                        className="flex-1 px-6 py-4 border border-slate-800 text-[10px] font-black uppercase tracking-widest italic text-slate-500 hover:bg-slate-800 transition-all rounded-md leading-none h-[42px]"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="flex-1 px-6 py-4 bg-transporter-primary text-[10px] font-black uppercase tracking-widest italic text-white rounded-md hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 leading-none h-[42px] disabled:opacity-50">
                                        {loading ? 'Processing...' : (isEditOpen ? 'Update Route' : 'Create Route')}
                                    </button>
                                </div>
                            </form>

                            {/* Right: Map for Picking */}
                            <div className="w-full xl:w-[450px] bg-neutral-950 border-t xl:border-t-0 xl:border-l border-slate-800 flex flex-col shrink-0">
                                <div className="p-6 border-b border-slate-800/60 space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Route Map</h4>
                                        <p className="text-[8px] font-bold text-slate-600 uppercase italic mt-1.5">Click map to add bus stops</p>
                                    </div>
                                    <div className="flex gap-2 relative">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="SEARCH LOCATION..."
                                                value={mapSearch}
                                                onChange={(e) => setMapSearch(e.target.value)}
                                                className="w-full bg-neutral-900 border border-slate-800 rounded-md py-2 px-3 text-[9px] font-black text-white focus:border-blue-500 outline-none uppercase"
                                            />
                                            {suggestions.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-slate-800 rounded-md shadow-2xl z-[1000] overflow-hidden">
                                                    {suggestions.map((s, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => selectSuggestion(s)}
                                                            className="w-full text-left px-3 py-2 text-[8px] font-black uppercase text-slate-400 hover:bg-slate-800 hover:text-white border-b border-slate-800/40 last:border-0 truncate"
                                                        >
                                                            {s.display_name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <Loader2 size={12} className="animate-spin text-blue-500" />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleMapSearch()}
                                            className="p-2 bg-blue-600/10 border border-blue-600/20 rounded-md text-blue-400 hover:bg-blue-600 hover:text-white transition-all"
                                        >
                                            <Search size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGetMyLocation}
                                            title="Use My Current Location"
                                            className="p-2 bg-cyan-600/10 border border-cyan-600/20 rounded-md text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all"
                                        >
                                            <Compass size={14} className={isLocating ? "animate-spin" : ""} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (newStop.lat) {
                                                    setSchoolLoc({ lat: newStop.lat, lng: newStop.lng });
                                                    setFormData(prev => {
                                                        const updatedStops = [...prev.stops];
                                                        if (updatedStops.length > 0 && updatedStops[0].name === 'School') {
                                                            updatedStops[0] = { ...updatedStops[0], lat: newStop.lat, lng: newStop.lng };
                                                        }
                                                        return { ...prev, stops: updatedStops };
                                                    });
                                                    toast.success('School base location updated');
                                                } else {
                                                    toast.error('Please click on the map to pick coordinates first');
                                                }
                                            }}
                                            title="Set as School Base"
                                            className="p-2 bg-emerald-600/10 border border-emerald-600/20 rounded-md text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all"
                                        >
                                            <Home size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="h-[400px] xl:flex-1 w-full relative">
                                    <MapContainer
                                        center={[
                                            formData.stops.find(s => s.lat)?.lat || schoolLoc.lat,
                                            formData.stops.find(s => s.lat)?.lng || schoolLoc.lng
                                        ]}
                                        zoom={13}
                                        className="h-full w-full"
                                        zoomControl={false}
                                    >
                                        <MapResizer />
                                        <StopPickerMap
                                            stops={formData.stops}
                                            center={newStop.lat ? [newStop.lat, newStop.lng] : null}
                                            onPick={(latlng) => setNewStop({ ...newStop, lat: latlng.lat, lng: latlng.lng })}
                                        />
                                        <RoadNetworkPath stops={formData.stops} />
                                        <Marker
                                            position={[schoolLoc.lat, schoolLoc.lng]}
                                            icon={L.divIcon({
                                                html: `<div class="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>`,
                                                className: 'school-marker',
                                                iconSize: [32, 32],
                                                iconAnchor: [16, 16]
                                            })}
                                        />
                                        {newStop.lat && (
                                            <Marker
                                                position={[newStop.lat, newStop.lng]}
                                                icon={L.divIcon({
                                                    html: `<div class="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-xl animate-pulse"></div>`,
                                                    className: 'target-marker',
                                                    iconSize: [24, 24],
                                                    iconAnchor: [12, 12]
                                                })}
                                            />
                                        )}
                                    </MapContainer>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isAssignOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 pt-16 font-outfit">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignOpen(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"></motion.div>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-brand-surface/95 backdrop-blur-2xl w-full max-w-5xl h-[85vh] rounded-2xl border border-brand-border/40 shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row">

                            {/* Left: Assignment Form */}
                            <div className="w-full md:w-1/3 p-6 border-r border-brand-border/30 overflow-y-auto">
                                <div className="flex items-center gap-3 mb-8">
                                    <UserPlus className="text-cyan-400" size={24} />
                                    <h3 className="text-xl font-black italic uppercase text-white leading-none">Add Student</h3>
                                </div>

                                <form onSubmit={handleAssign} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 italic ml-1">Select Student</label>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={12} />
                                            <input
                                                type="text"
                                                placeholder="SEARCH STUDENT BY NAME/ADM..."
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-2.5 pl-9 pr-4 text-[9px] font-black text-slate-300 uppercase italic focus:outline-none focus:border-cyan-500/50 transition-all outline-none"
                                            />
                                        </div>
                                        <select
                                            required
                                            value={assignData.studentId}
                                            onChange={(e) => setAssignData({ ...assignData, studentId: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-3 px-4 text-[11px] font-black uppercase text-slate-300 italic focus:outline-none focus:border-cyan-500/50 transition-all appearance-none outline-none"
                                        >
                                            <option value="">Select Student...</option>
                                            {/* Priority 1: Applicants (Those who applied via portal) */}
                                            {applicants.filter(a => !assignedStudentIds.has(a._id.toString())).length > 0 && (
                                                <optgroup label="PENDING APPLICATIONS" className="bg-slate-950 text-cyan-400">
                                                    {applicants
                                                        .filter(a => !assignedStudentIds.has(a._id.toString()))
                                                        .map(a => (
                                                            <option key={a._id} value={a._id}>{a.firstName} {a.lastName} (ADM: {a.admissionNumber || 'N/A'})</option>
                                                        ))
                                                    }
                                                </optgroup>
                                            )}
                                            {/* Priority 2: All Other Students */}
                                            <optgroup label="ALL STUDENTS" className="bg-slate-950 text-slate-500">
                                                {students
                                                    .filter(s =>
                                                        !assignedStudentIds.has(s._id.toString()) &&
                                                        !applicants.some(a => a._id === s._id) &&
                                                        (`${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase().includes(studentSearch.toLowerCase()))
                                                    )
                                                    .map(s => (
                                                        <option key={s._id} value={s._id}>{s.firstName} {s.lastName} (ADM: {s.admissionNumber || 'N/A'})</option>
                                                    ))
                                                }
                                            </optgroup>
                                        </select>
                                        <div className="flex items-start gap-2 bg-cyan-500/5 p-3 rounded-xl border border-brand-border/20 mt-2">
                                            <Info size={12} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[8px] font-bold text-slate-500 uppercase italic leading-relaxed">
                                                You can now enroll ANY student directly. Students who applied via the <span className="text-cyan-400">Parent Portal</span> are highlighted at the top.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 italic ml-1">Student Stop</label>
                                        <select
                                            value={assignData.pickupStop}
                                            onChange={(e) => setAssignData({
                                                ...assignData,
                                                pickupStop: e.target.value,
                                                dropoffStop: e.target.value
                                            })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-3 px-4 text-[10px] font-black uppercase text-slate-300 italic focus:outline-none focus:border-cyan-500/50 transition-all appearance-none outline-none"
                                        >
                                            <option value="">Select Stop...</option>
                                            {selectedRouteForAssign?.stops
                                                .filter(s => s.name !== 'School')
                                                .map(s => <option key={s.name} value={s.name}>{s.name}</option>)
                                            }
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-500 italic ml-1">Seat Assignment</label>
                                        <input
                                            type="number"
                                            placeholder="Seat Number"
                                            value={assignData.seatNumber}
                                            onChange={(e) => setAssignData({ ...assignData, seatNumber: e.target.value })}
                                            className="w-full bg-slate-950 border border-brand-border/40 rounded-xl py-3 px-4 text-xs font-bold text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all outline-none"
                                        />
                                        {selectedRouteForAssign?.assignedStudents?.some(s => s.seatNumber) && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                <span className="text-[8px] font-black text-slate-600 uppercase italic mr-1">Occupied Seats:</span>
                                                {selectedRouteForAssign.assignedStudents
                                                    .filter(s => s.seatNumber)
                                                    .map((s, idx) => (
                                                        <span key={idx} className="text-[8px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-lg text-[8px] font-mono">#{s.seatNumber}</span>
                                                    ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-[11px] font-black uppercase italic tracking-[.2em] text-white rounded-xl shadow-xl shadow-cyan-600/20 hover:translate-y-[-2px] transition-all mt-4"
                                    >
                                        Add to Route
                                    </button>
                                </form>
                            </div>

                            {/* Right: Current Students */}
                            <div className="flex-1 bg-slate-950/20 shadow-inner overflow-y-auto custom-scrollbar">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-border/20">
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none font-outfit">{selectedRouteForAssign?.name} Students</h3>
                                            <p className="text-[10px] font-black italic uppercase text-slate-400 tracking-widest mt-2">{selectedRouteForAssign?.assignedStudents?.length || 0} Students Assigned</p>
                                        </div>
                                        <button onClick={() => setIsAssignOpen(false)} className="p-2 text-slate-400 hover:text-cyan-400 bg-slate-950/40 hover:bg-slate-950 border border-transparent hover:border-brand-border/40 rounded-lg transition-all"><X size={20} /></button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedRouteForAssign?.assignedStudents?.length > 0 ? selectedRouteForAssign.assignedStudents.map((entry, idx) => (
                                            <div key={idx} className="bg-slate-950/40 border border-brand-border/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between group hover:border-cyan-500/30 transition-all shadow-inner">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-brand-border/30 flex items-center justify-center text-cyan-400 shadow-md">
                                                        <Bus size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-sm font-black text-slate-200 uppercase italic tracking-wide">{entry.studentId?.firstName} {entry.studentId?.lastName}</h4>
                                                            <ShieldCheck size={14} className="text-emerald-500" />
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase italic tracking-widest mt-1">Seat: {entry.seatNumber || 'N/A'} // {entry.studentId?.admissionNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 mt-4 md:mt-0 px-5 py-2.5 bg-slate-950/60 rounded-xl border border-brand-border/30 shadow-inner">
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Pickup</p>
                                                        <p className="text-[10px] font-black text-cyan-400 uppercase italic">{entry.pickupStop}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic mb-1">Drop</p>
                                                        <p className="text-[10px] font-black text-rose-400 uppercase italic">{entry.dropoffStop}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUnassign(entry.studentId?._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-brand-border/30 hover:border-rose-500/25 rounded-lg transition-all mt-4 md:mt-0 md:ml-6 animate-none"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="p-20 border border-brand-border/30 border-dashed rounded-xl text-center bg-slate-950/20">
                                                <p className="text-[11px] font-black italic uppercase tracking-widest text-slate-500">No students assigned to this route.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeMapRoute && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 font-outfit">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveMapRoute(null)}
                            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-brand-surface/95 backdrop-blur-2xl w-full max-w-5xl h-[80vh] rounded-2xl border border-brand-border/40 shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Left Column: Interactive Map */}
                            <div className="flex-1 h-full relative min-h-[400px]">
                                <MapContainer
                                    center={[
                                        activeMapRoute.stops.find(s => s.lat)?.lat || schoolLoc.lat,
                                        activeMapRoute.stops.find(s => s.lat)?.lng || schoolLoc.lng
                                    ]}
                                    zoom={13}
                                    className="h-full w-full animate-fadeIn"
                                    zoomControl={true}
                                >
                                    <MapResizer />
                                    <TileLayer
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                        attribution='&copy; CARTO'
                                    />

                                    {/* Real Road-Network Route path joining all stops dynamically */}
                                    <RoadNetworkPath stops={activeMapRoute.stops} />

                                    {activeMapRoute.stops.map((s, idx) => s.lat && (
                                        <Marker
                                            key={idx}
                                            position={[s.lat, s.lng]}
                                            icon={L.divIcon({
                                                html: `
                                                    <div class="relative flex items-center justify-center">
                                                        <div class="absolute w-4 h-4 rounded-full bg-cyan-500/35 animate-ping"></div>
                                                        <div class="w-4 h-4 rounded-full bg-cyan-500 border border-slate-900 shadow-md flex items-center justify-center text-[7px] font-black text-slate-950">${s.order}</div>
                                                    </div>
                                                `,
                                                className: 'custom-route-marker',
                                                iconSize: [16, 16],
                                                iconAnchor: [8, 8]
                                            })}
                                        >
                                            <Popup>
                                                <div className="p-2 font-outfit text-xs text-slate-100 bg-slate-950 border border-brand-border/40 rounded-xl shadow-md leading-relaxed">
                                                    <strong className="block text-slate-200 uppercase tracking-widest text-[9px] font-black">Stop {s.order}: {s.name}</strong>
                                                    <span className="text-cyan-400 font-bold">Time: {s.estimatedTime}</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>

                                <button
                                    onClick={() => setActiveMapRoute(null)}
                                    className="absolute top-4 right-4 z-[1000] p-2.5 bg-slate-950/80 hover:bg-slate-950 border border-brand-border/40 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all shadow-xl backdrop-blur-md"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Right Column: Route Details */}
                            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-brand-border/30 p-6 flex flex-col justify-between overflow-y-auto bg-slate-950/40 backdrop-blur-md">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Navigation size={16} className="text-cyan-400" />
                                            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tighter italic">{activeMapRoute.name}</h3>
                                        </div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Route Telemetry & Stops</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[...activeMapRoute.stops].sort((a, b) => a.order - b.order).map((s, idx) => (
                                            <div key={idx} className="flex gap-4 items-start group/telemetry">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[8px] font-black text-cyan-400 shrink-0">
                                                        {s.order}
                                                    </div>
                                                    {idx !== activeMapRoute.stops.length - 1 && (
                                                        <div className="w-px h-12 bg-brand-border/30 my-1"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 bg-slate-950/60 border border-brand-border/20 group-hover/telemetry:border-cyan-500/30 rounded-xl p-3 transition-all leading-tight shadow-inner">
                                                    <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-wide">{s.name}</h4>
                                                    <div className="flex justify-between items-center mt-1.5">
                                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Eta</span>
                                                        <span className="text-[9px] font-black text-cyan-400">{s.estimatedTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-5 border-t border-brand-border/20 mt-6 flex flex-col gap-2 bg-transparent">
                                    <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                                        <span>Total Stops</span>
                                        <span className="font-black text-slate-300">{activeMapRoute.stops.length}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                                        <span>Assigned Students</span>
                                        <span className="font-black text-cyan-400">{activeMapRoute.assignedStudents?.length || 0} Students</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Routes;
