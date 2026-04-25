import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as adminService from "../services/adminService";



// --- SUB-COMPONENTS ---
const CoordinatorCard = ({ coordinator, onClick }) => (
  <div 
    onClick={() => onClick(coordinator)}
    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer p-5 flex flex-col h-full"
  >
    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg border border-gray-200 shrink-0">
        {coordinator.name.split(" ").map(n => n[0]).join("")}
      </div>
      <div>
        <h3 className="font-extrabold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{coordinator.name}</h3>
        <p className="text-xs text-amber-500 font-bold mt-0.5">{"★".repeat(Math.round(coordinator.avgRating))} {coordinator.avgRating}</p>
      </div>
    </div>
    
    <div className="mt-auto grid grid-cols-2 gap-2">
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Events</p>
        <p className="text-lg font-extrabold text-gray-800">{coordinator.eventsHandled}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Users Handled</p>
        <p className="text-lg font-extrabold text-gray-800">{coordinator.totalParticipants}</p>
      </div>
    </div>
  </div>
);

const ReviewItem = ({ review }) => (
  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
    <div className="flex justify-between items-start mb-2">
      <span className="font-bold text-gray-900 text-sm">{review.name}</span>
      <span className="text-amber-500 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span>
    </div>
    <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
  </div>
);

const RequestRow = ({ request, onApprove, onReject }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm border border-gray-200 shrink-0">
        {request.name.split(" ").map(n => n[0]).join("")}
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{request.name}</h3>
        <p className="text-xs text-gray-500 font-medium">{request.email}</p>
      </div>
    </div>
    
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
      <div className="text-right sm:text-left w-full sm:w-auto">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Requested</p>
        <p className="text-sm text-gray-700 font-medium">{request.requestDate}</p>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button 
          onClick={() => onReject(request.id)}
          className="flex-1 sm:flex-none px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-lg transition-colors shadow-sm"
        >
          Reject ✕
        </button>
        <button 
          onClick={() => onApprove(request)}
          className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
        >
          Approve ✓
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function AdminCoordinatorsModule() {
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState("list");
  const [coordinators, setCoordinators] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [approveLoading, setApproveLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pendingData = await adminService.getPendingCoordinators();
        setRequests((pendingData || []).map(r => ({
          id: r._id, name: r.name, email: r.email,
          requestDate: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        })));
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCoordinatorClick = (coordinator) => {
    setSelectedCoordinator(coordinator);
    setViewMode("detail");
  };

  const approveRequest = async (request) => {
    setApproveLoading(request.id);
    try {
      await adminService.approveCoordinator(request.id);
      const newCoord = {
        id: request.id, name: request.name,
        eventsHandled: 0, avgRating: 0, totalParticipants: 0,
        reviews: [], eventsHandledList: []
      };
      setCoordinators(prev => [...prev, newCoord]);
      setRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve coordinator');
    } finally {
      setApproveLoading(null);
    }
  };

  const rejectRequest = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const filteredCoordinators = coordinators.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* Navbar Continuation */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          {viewMode !== "list" ? (
            <button onClick={() => setViewMode("list")} className="mr-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-bold flex items-center gap-1">
              <span>←</span> Back
            </button>
          ) : (
            <>
              <button onClick={() => navigate(-1)} className="mr-2 text-gray-400 hover:text-gray-800 transition-colors text-sm font-bold">← Back</button>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">⚡</span>
              <span className="text-base font-bold text-gray-900 tracking-tight hidden sm:block">SMART Event Manager</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200 uppercase tracking-wider">
            {viewMode === "list" ? "Admin Panel" : viewMode === "requests" ? "Access Control" : "Coordinator Analytics"}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* ========================================= */}
        {/* VIEW 1: COORDINATORS LIST PAGE            */}
        {/* ========================================= */}
        {viewMode === "list" && (
          <div className="space-y-6 fade-in">
            
            {/* Header & Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Coordinators</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and analyze event coordinator performance.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input
                    type="text" placeholder="Search coordinators..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                
                <button 
                  onClick={() => setViewMode("requests")}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  View Requests 
                  {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCoordinators.map(coord => (
                <CoordinatorCard key={coord.id} coordinator={coord} onClick={handleCoordinatorClick} />
              ))}
              {filteredCoordinators.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                  No coordinators found matching '{searchTerm}'.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 2: COORDINATOR DETAIL PAGE           */}
        {/* ========================================= */}
        {viewMode === "detail" && selectedCoordinator && (
          <div className="space-y-6 fade-in">
            
            {/* Detail Header / Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center font-extrabold text-gray-400 text-4xl border-4 border-white shadow-lg shrink-0">
                {selectedCoordinator.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{selectedCoordinator.name}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-1">
                    🏅 Verified Coordinator
                  </span>
                  <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                    {"★".repeat(Math.round(selectedCoordinator.avgRating))} {selectedCoordinator.avgRating} Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Events Handled</p>
                <p className="text-3xl font-extrabold text-gray-900">{selectedCoordinator.eventsHandled}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Participants</p>
                <p className="text-3xl font-extrabold text-gray-900">{selectedCoordinator.totalParticipants}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Participants/Event</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  {selectedCoordinator.eventsHandled > 0 ? Math.round(selectedCoordinator.totalParticipants / selectedCoordinator.eventsHandled) : 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Events Handled List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Event History</h2>
                {selectedCoordinator.eventsHandledList.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCoordinator.eventsHandledList.map(event => (
                      <div key={event.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{event.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">{event.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Participants</p>
                          <p className="font-bold text-gray-900 text-sm">{event.participants}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">No events assigned yet.</p>
                )}
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Participant Feedback</h2>
                  <span className="text-xs font-bold text-gray-500">{selectedCoordinator.reviews.length} Reviews</span>
                </div>
                {selectedCoordinator.reviews.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedCoordinator.reviews.map(rev => (
                      <ReviewItem key={rev.id} review={rev} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-4">No feedback available.</p>
                )}
              </div>
            </div>
            
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 3: COORDINATOR REQUESTS PAGE         */}
        {/* ========================================= */}
        {viewMode === "requests" && (
          <div className="space-y-6 fade-in max-w-4xl mx-auto">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center sm:text-left">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Coordinator Requests</h1>
              <p className="text-sm text-gray-500 mt-1">Review and approve applications to become event coordinators.</p>
            </div>

            <div className="space-y-4">
              {requests.map(req => (
                <RequestRow 
                  key={req.id} 
                  request={req} 
                  onApprove={approveRequest} 
                  onReject={rejectRequest} 
                />
              ))}
              
              {requests.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                  <span className="text-4xl block mb-3">📭</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Pending Requests</h3>
                  <p className="text-gray-500 text-sm">You're all caught up! There are no new coordinator applications.</p>
                  <button 
                    onClick={() => setViewMode("list")}
                    className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
                  >
                    Return to Coordinators
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}
