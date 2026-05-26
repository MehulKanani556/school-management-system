import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Book, BookmarkPlus, Library as LibIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/axiosInstance';

const ChildLibrary = () => {
    const { selectedChild } = useSelector((state) => state.parent);
    const [books, setBooks] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('catalog');

    useEffect(() => {
        if (selectedChild?._id) fetchData();
    }, [selectedChild?._id]);

    const fetchData = async () => {
        if (!selectedChild?._id) return;
        try {
            setLoading(true);
            const [booksRes, resRes] = await Promise.all([
                api.get(`/parent/child/${selectedChild._id}/library/books`),
                api.get(`/parent/child/${selectedChild._id}/library/reservations`),
            ]);
            setBooks(booksRes.data);
            setReservations(resRes.data);
        } catch {
            toast.error('Failed to load library');
        } finally {
            setLoading(false);
        }
    };

    const handleReserve = async (bookId) => {
        try {
            const { data } = await api.post(`/parent/child/${selectedChild._id}/library/reserve`, { bookId });
            toast.success(data.message);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reservation failed');
        }
    };

    if (!selectedChild) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-500 italic">
                Select a child to view the school library
            </div>
        );
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-400 text-sm">Loading library...</div>;
    }

    const catalogBooks = books.filter((b) => (b.type || 'Physical') === 'Physical');

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                    <LibIcon className="text-parent-primary" size={28} />
                    Library — {selectedChild.firstName}
                </h1>
                <p className="text-sm text-slate-400 mt-1">Browse and reserve books for your child.</p>
            </div>

            <div className="flex gap-2">
                {['catalog', 'reservations'].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-[10px] font-black uppercase ${
                            activeTab === tab ? 'bg-parent-primary text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                        {tab === 'catalog' ? 'Catalog' : `Reservations (${reservations.length})`}
                    </button>
                ))}
            </div>

            {activeTab === 'catalog' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catalogBooks.map((book) => (
                        <div key={book._id} className="bg-slate-900 border border-slate-800 rounded-md p-5">
                            <h3 className="font-bold text-white mb-1">{book.title}</h3>
                            <p className="text-xs text-slate-500 mb-3">{book.author}</p>
                            <p className="text-[10px] text-slate-400 mb-4">
                                Available: {book.availableCopies ?? 0} / {book.totalCopies ?? 0}
                            </p>
                            <button
                                type="button"
                                onClick={() => handleReserve(book._id)}
                                disabled={
                                    (book.availableCopies ?? 0) > 0 ||
                                    reservations.some((r) => r.bookId?._id === book._id && r.status === 'pending')
                                }
                                className="w-full py-2 bg-parent-primary/20 text-parent-primary border border-parent-primary/30 rounded-md text-[10px] font-black uppercase disabled:opacity-40"
                            >
                                Reserve
                            </button>
                        </div>
                    ))}
                    {catalogBooks.length === 0 && (
                        <p className="text-slate-500 col-span-full text-center py-12">No books in catalog.</p>
                    )}
                </div>
            )}

            {activeTab === 'reservations' && (
                <div className="space-y-3">
                    {reservations.map((res) => (
                        <div key={res._id} className="bg-slate-900 border border-slate-800 rounded-md p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-white">{res.bookId?.title}</p>
                                <p className="text-xs text-slate-500">{res.status}</p>
                            </div>
                            <BookmarkPlus size={18} className="text-parent-primary" />
                        </div>
                    ))}
                    {reservations.length === 0 && (
                        <p className="text-slate-500 text-center py-12">No reservations yet.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChildLibrary;
