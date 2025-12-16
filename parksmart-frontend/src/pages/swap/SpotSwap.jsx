import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import { createSwapRequest, getNearbySwaps, matchSwapRequest, completeSwap } from '../../api/swapApi';
import { sendMessage, getMessages } from '../../api/messageApi';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { MapPin, Navigation, Clock, CheckCircle, RefreshCw, Car, User, MessageCircle, Send, X } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '../../hooks/useGSAP';

const SpotSwap = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [mode, setMode] = useState('select'); // 'select', 'leaving', 'looking', 'matched'
    const [loading, setLoading] = useState(false);
    const [nearbySwaps, setNearbySwaps] = useState([]);
    const [mySwap, setMySwap] = useState(null);
    const [match, setMatch] = useState(null);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');

    // Chat State
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const chatEndRef = useRef(null);

    useGSAP(() => {
        gsap.from('.mode-card', {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: 'power2.out'
        });
    }, [mode]);

    useEffect(() => {
        // Get user location on mount
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        type: 'Point',
                        coordinates: [position.coords.longitude, position.coords.latitude]
                    });
                },
                (err) => setError('Location permission is required for Spot Swap.')
            );
        }

        if (socket) {
            socket.on('swap:new', (newSwap) => {
                if (mode === 'looking' && newSwap.type === 'leaving') {
                    setNearbySwaps(prev => [newSwap, ...prev]);
                }
            });

            socket.on('swap:matched', (data) => {
                if (mySwap && data.swapId === mySwap._id) {
                    setMode('matched');
                    setMatch(data);
                    setMySwap(prev => ({
                        ...prev,
                        status: 'matched',
                        matchedWith: data.matchedBy
                    }));
                }
            });

            socket.on('swap:completed', (data) => {
                if (mySwap && data.swapId === mySwap._id) {
                    alert('Swap Completed! Credits Transferred.');
                    setMode('select');
                    setMySwap(null);
                    setMatch(null);
                }
            });

            socket.on('chat:message', (msg) => {
                if (mySwap && msg.swapId === mySwap._id) {
                    setMessages(prev => [...prev, msg]);
                    if (!showChat) setShowChat(true); // Auto-open on new message
                }
            });

            return () => {
                socket.off('swap:new');
                socket.off('swap:matched');
                socket.off('swap:completed');
                socket.off('chat:message');
            };
        }
    }, [socket, mode, mySwap, showChat]);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showChat]);

    // Fetch messages on match
    useEffect(() => {
        if (mode === 'matched' && mySwap) {
            getMessages(mySwap._id).then(res => setMessages(res.data.data));
        }
    }, [mode, mySwap]);

    const handleCreateRequest = async (type) => {
        if (!location) return setError('Location not found yet.');
        setLoading(true);
        try {
            const res = await createSwapRequest({
                type,
                location,
                spotDetails: type === 'leaving' ? { spotNumber: 'Any', parkingAreaName: 'Current Location' } : {}
            });
            setMySwap(res.data.data);
            if (res.data.matches && res.data.matches.length > 0) {
                setNearbySwaps(res.data.matches);
            }
            setMode(type);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    const handleMatch = async (swapId) => {
        setLoading(true);
        try {
            const res = await matchSwapRequest(swapId);
            setMySwap(res.data.data); // Update local state to the matched request
            setMode('matched');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to match');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await completeSwap(mySwap._id);
            // Socket will handle the UI reset
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete swap');
            setLoading(false);
        }
    };

    if (!location && !error) return <Loader fullScreen text="Getting your location..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-center mb-8 text-gradient">Spot Swap</h1>

            {error && <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />}

            {mode === 'select' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="mode-card hover:border-indigo-500 cursor-pointer transition-all hover:shadow-xl group" onClick={() => handleCreateRequest('looking')}>
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Car className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm Arriving</h2>
                            <p className="text-gray-500">Find someone leaving a spot nearby. Pay credits to reserve it.</p>
                        </div>
                    </Card>

                    <Card className="mode-card hover:border-emerald-500 cursor-pointer transition-all hover:shadow-xl group" onClick={() => handleCreateRequest('leaving')}>
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Navigation className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">I'm Leaving</h2>
                            <p className="text-gray-500">Leaving a spot? Wait for someone and earn credits.</p>
                        </div>
                    </Card>
                </div>
            )}

            {mode === 'looking' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Nearby Spot Leavers</h2>
                        <Button variant="secondary" onClick={() => setMode('select')} size="sm">Cancel</Button>
                    </div>

                    {nearbySwaps.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Scanning for people leaving nearby...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {nearbySwaps.map(swap => (
                                <Card key={swap._id} className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{swap.spotDetails?.parkingAreaName || 'Unknown User'}</h3>
                                        <p className="text-sm text-gray-500">Leaving in ~5 mins</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-emerald-600">{swap.askingPrice} Credits</span>
                                        <Button className="gradient-primary" onClick={() => handleMatch(swap._id)}>
                                            Request Swap
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {mode === 'leaving' && (
                <div className="text-center py-12 animate-fade-in">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <User className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">You are now visible!</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Waiting for someone nearby to request your spot. Stay on this screen.
                    </p>
                    <Button variant="outline" onClick={() => { setMode('select'); setMySwap(null); }}>
                        Cancel Availability
                    </Button>
                </div>
            )}

            {mode === 'matched' && (
                <div className="text-center py-12 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">It's a Match!</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        {mySwap?.type === 'looking' ? "You matched with a seller! Go to their location." : "A buyer is coming to your spot!"}
                    </p>

                    <div className="bg-slate-50 p-6 rounded-xl max-w-md mx-auto mb-8 border border-slate-200">
                        <h3 className="font-bold text-gray-900 mb-2">Transaction Details</h3>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span>Swap Fee</span>
                            <span className="font-bold text-emerald-600">{mySwap?.askingPrice} Credits</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span>Status</span>
                            <span className="font-bold text-indigo-600 uppercase">{mySwap?.status || 'Matched'}</span>
                        </div>
                    </div>

                    {mySwap?.type === 'looking' && ( // Only Buyer usually confirms payment/arrival
                        <Button className="w-full max-w-md gradient-success text-lg py-4" onClick={handleComplete} loading={loading}>
                            Confirm Arrival & Pay
                        </Button>
                    )}
                    {mySwap?.type === 'leaving' && (
                        <p className="text-sm text-gray-500 italic">Waiting for buyer to confirm arrival...</p>
                    )}
                </div>
            )}


            {/* Chat Floating Button & Window - Only when matched */}
            {
                mode === 'matched' && (
                    <>
                        {/* Floating Toggle Button */}
                        {!showChat && (
                            <button
                                onClick={() => setShowChat(true)}
                                className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all z-50 animate-bounce-subtle"
                            >
                                <MessageCircle className="w-8 h-8" />
                            </button>
                        )}

                        {/* Chat Window */}
                        {showChat && (
                            <div className="fixed bottom-6 right-6 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col h-[500px] animate-slide-up">
                                {/* Header */}
                                <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5" /> Chat
                                    </h3>
                                    <button onClick={() => setShowChat(false)} className="hover:bg-indigo-700 p-1 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {messages.length === 0 ? (
                                        <p className="text-center text-gray-400 text-sm mt-4">Start messaging...</p>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMe = msg.sender === user._id;
                                            return (
                                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                                                        <p>{msg.content}</p>
                                                        <span className={`text-xs block mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!newMessage.trim() || sending) return;
                                        setSending(true);
                                        try {
                                            // Robust ID extraction
                                            const currentUserId = user._id;
                                            const creatorId = mySwap.user._id || mySwap.user;
                                            const matchedId = mySwap.matchedWith?._id || mySwap.matchedWith;

                                            const receiverId = currentUserId === creatorId ? matchedId : creatorId;

                                            if (!receiverId) {
                                                console.error("Could not determine receiver ID", { currentUserId, creatorId, matchedId });
                                                setSending(false);
                                                return;
                                            }

                                            await sendMessage({
                                                swapId: mySwap._id,
                                                content: newMessage,
                                                receiverId: receiverId
                                            });
                                            // Creating optimistic update to avoid lag? No, socket is fast enough usually.
                                            // But clears input
                                            setNewMessage('');
                                        } catch (err) {
                                            console.error('Send failed', err);
                                        } finally {
                                            setSending(false);
                                        }
                                    }}
                                    className="p-3 bg-white border-t border-gray-100 flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                    <button type="submit" disabled={!newMessage.trim() || sending} className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50">
                                        {sending ? <Loader size="xs" color="white" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )
            }
        </div>
    )
}

export default SpotSwap;
