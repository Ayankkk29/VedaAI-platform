'use client';

import React from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { 
  Home, 
  Users, 
  FileText, 
  Sparkles, 
  Library, 
  Settings, 
  Plus
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    setViewMode, 
    assignments 
  } = useAssignmentStore();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-groups', label: 'My Groups', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: FileText, badge: assignments.length || 0 },
    { id: 'toolkit', label: 'AI Teacher Toolkit', icon: Sparkles },
    { id: 'library', label: 'My Library', icon: Library },
  ];

  const handleCreateClick = () => {
    setActiveTab('assignments');
    setViewMode('create');
  };

  return (
    <div className="w-64 bg-white border border-gray-100 flex flex-col justify-between p-4 h-[calc(100vh-2rem)] my-4 ml-4 rounded-3xl shadow-sm">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-orange-100">
            V
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-800">VedaAI</span>
        </div>

        {/* CTA Create Assignment Button - Refined to match mockup perfectly */}
        <button 
          onClick={handleCreateClick}
          className="w-full flex items-center justify-center gap-2.5 bg-[#171717] hover:bg-[#262626] text-white font-medium py-3 px-4 rounded-full border border-[#E05A47] shadow-[0_0_10px_rgba(224,90,71,0.12)] transition-all duration-200 hover:shadow-[0_0_14px_rgba(224,90,71,0.25)] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-white fill-white" />
          <span className="text-[14px] tracking-tight">Create Assignment</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'assignments') {
                    setViewMode('list');
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group text-left ${
                  isActive 
                    ? 'bg-neutral-50 text-neutral-900 font-semibold' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span className="text-[15px]">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        {/* Settings Button */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${
            activeTab === 'settings' 
              ? 'bg-neutral-50 text-neutral-900 font-semibold' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/70'
          }`}
        >
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-[15px]">Settings</span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-100/50 rounded-2xl">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-amber-200 border border-amber-200/60 flex items-center justify-center shrink-0 shadow-inner">
            <svg viewBox="0 0 64 64" className="w-full h-full" fill="currentColor">
              {/* Background fill */}
              <rect width="64" height="64" fill="#FDE68A" opacity="0.3" />
              {/* Skin */}
              <circle cx="32" cy="32" r="16" fill="#FDBA74" />
              {/* Cap (Brown) */}
              <path d="M16 28 C16 14, 48 14, 48 28 Z" fill="#B45309" />
              {/* Cap Brim */}
              <path d="M12 25 H52 V28 H12 Z" fill="#78350F" />
              {/* Eyes */}
              <circle cx="26" cy="32" r="2.5" fill="#1F2937" />
              <circle cx="38" cy="32" r="2.5" fill="#1F2937" />
              {/* Glasses frame */}
              <rect x="21" y="28" width="10" height="7" rx="2" fill="none" stroke="#1F2937" strokeWidth="2" />
              <rect x="33" y="28" width="10" height="7" rx="2" fill="none" stroke="#1F2937" strokeWidth="2" />
              <line x1="31" y1="31" x2="33" y2="31" stroke="#1F2937" strokeWidth="2" />
              {/* Smile */}
              <path d="M28 40 Q32 43 36 40" fill="none" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
              {/* Clothes */}
              <path d="M14 56 C14 44, 50 44, 50 56 Z" fill="#475569" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-[14px] font-bold text-gray-800 truncate leading-tight">Delhi Public School</h4>
            <p className="text-[11px] text-gray-400 truncate leading-none mt-1">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </div>
  );
}
