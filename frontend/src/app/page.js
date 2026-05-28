'use client';

import React, { useEffect, useState } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import Sidebar from '../components/Sidebar';
import AssignmentsList from '../components/AssignmentsList';
import CreateAssignmentForm from '../components/CreateAssignmentForm';
import QuestionPaperView from '../components/QuestionPaperView';
import { io } from 'socket.io-client';
import { Wifi, WifiOff, Bell } from 'lucide-react';
const SOCKET_URI = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const {
    viewMode,
    activeTab,
    fetchAssignments,
    updateAssignmentStatus,
    wsConnected,
    setWsConnected,
    assignments,
    setActiveTab,
    setViewMode,
  } = useAssignmentStore();

  const [socket, setSocket] = useState(null);

  // Initialize Socket.IO connection and data fetching
  useEffect(() => {
    // 1. Fetch initial assignment list from REST API
    fetchAssignments();

    // 2. Establish connection to Socket.IO backend
    const socketConnection = io(SOCKET_URI, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketConnection.on('connect', () => {
      console.log('📡 Connected to Socket.IO server:', socketConnection.id);
      setWsConnected(true);
    });

    socketConnection.on('disconnect', () => {
      console.warn('⚠️ Disconnected from Socket.IO server');
      setWsConnected(false);
    });

    // Handle real-time updates for assignments in the list
    socketConnection.on('assignment_status_update', (payload) => {
      console.log('📢 Received real-time assignment status update:', payload);
      updateAssignmentStatus(payload);
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, [fetchAssignments, updateAssignmentStatus, setWsConnected]);

  // Join direct monitoring room when a specific assignment is selected/generating
  useEffect(() => {
    if (socket && assignments.length > 0) {
      assignments.forEach((a) => {
        if (a.status === 'queued' || a.status === 'processing') {
          socket.emit('join_assignment_room', a._id);
        }
      });
    }
  }, [socket, assignments]);

  // Fallback Polling: if WebSocket is down or as a double safety, poll if any assignment is generating
  useEffect(() => {
    const hasGenerating = assignments.some(
      (a) => a.status === 'queued' || a.status === 'processing'
    );

    if (!hasGenerating) return;

    // Poll every 2.5 seconds silently
    const interval = setInterval(() => {
      console.log('🔄 Polling assignments status fallback...');
      fetchAssignments(true);
    }, 2500);

    return () => clearInterval(interval);
  }, [assignments, fetchAssignments]);

  const renderContent = () => {
    // Check if active sidebar tab is assignments, if not show simple screen placeholder
    if (activeTab !== 'assignments') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-50/50">
          <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-xl mb-4">
            {activeTab.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
            This module is part of the AI toolkit. Click on &quot;Assignments&quot; in the sidebar to create and view question papers.
          </p>
        </div>
      );
    }

    switch (viewMode) {
      case 'create':
        return <CreateAssignmentForm />;
      case 'view-paper':
        return <QuestionPaperView />;
      case 'list':
      default:
        return <AssignmentsList />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row bg-neutral-50 min-h-screen font-sans antialiased text-gray-600">
      {/* Real-time WS connection bar indicator */}
      <div className="fixed top-2 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold z-50 border shadow-sm backdrop-blur bg-white/80 md:right-4">
        {wsConnected ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 hidden xs:inline">Server Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-rose-500 hidden xs:inline">Offline (Local Queue Fallback)</span>
          </>
        )}
      </div>

      {/* MOBILE TOP HEADER (Figma Mobile Viewport) */}
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-orange-100">
            V
          </div>
          <span className="font-extrabold text-lg tracking-tight text-gray-800">VedaAI</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-1.5 rounded-full hover:bg-neutral-50 text-gray-500 hover:text-gray-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </button>

          {/* User profile avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-100 border border-gray-200">
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-amber-300 flex items-center justify-center text-xs font-bold text-orange-700">
              JD
            </div>
          </div>

          {/* Hamburger menu */}
          <button 
            onClick={() => {
              alert("Menu options: School Profile - Delhi Public School, Settings, Log Out.");
            }}
            className="p-1 text-gray-500 hover:text-gray-800"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* DESKTOP SIDEBAR - hidden on mobile */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-2rem)] overflow-y-auto md:overflow-hidden pb-20 md:pb-0 md:my-4 md:mr-4 md:ml-2 md:rounded-3xl md:bg-white md:border md:border-gray-100 md:shadow-sm md:h-[calc(100vh-2rem)]">
        {renderContent()}
      </div>

      {/* MOBILE BOTTOM TAB BAR (Figma Mobile Viewport) */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-neutral-950 text-gray-400 rounded-2xl flex items-center justify-around py-3 px-2 shadow-xl z-40 border border-neutral-800">
        {[
          { id: 'home', label: 'Home', icon: (active) => (
            <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-white' : 'text-neutral-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          )},
          { id: 'assignments', label: 'Assignments', icon: (active) => (
            <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-white' : 'text-neutral-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          )},
          { id: 'library', label: 'Library', icon: (active) => (
            <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-white' : 'text-neutral-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          )},
          { id: 'toolkit', label: 'AI Toolkit', icon: (active) => (
            <svg viewBox="0 0 24 24" className={`w-5 h-5 ${active ? 'text-white' : 'text-neutral-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          )}
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'assignments') {
                  setViewMode('list');
                }
              }}
              className="flex flex-col items-center gap-1 flex-1 py-1"
            >
              {tab.icon(isActive)}
              <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-white' : 'text-neutral-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
