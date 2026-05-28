'use client';

import React from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { Plus } from 'lucide-react';

export default function EmptyState() {
  const { setViewMode } = useAssignmentStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] md:min-h-[70vh] max-w-2xl mx-auto animate-fade-in">
      {/* Figma Center Illustration - Enlarged */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-6">
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Soft background green circle glow */}
          <circle cx="100" cy="95" r="55" fill="#10B981" opacity="0.09" />
          
          {/* Swirly line (solid dark/black) */}
          <path d="M52 80 C32 90 40 102 55 102 C65 102 75 90 62 108" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Four-pointed black star on left */}
          <path d="M60 140 Q65 140 65 135 Q65 140 70 140 Q65 140 65 145 Q65 140 60 140 Z" fill="#10B981" />
          <path d="M57 142 Q60 142 60 139 Q60 142 63 142 Q60 142 60 145 Q60 142 57 142 Z" fill="#1F2937" />
          <path d="M115 67 Q118 67 118 64 Q118 67 121 67 Q118 67 118 70 Q118 67 115 67 Z" fill="#1F2937" opacity="0.7" />

          {/* Document Sheet */}
          <rect x="75" y="55" width="62" height="82" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
          <line x1="88" y1="72" x2="108" y2="72" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="84" x2="124" y2="84" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="96" x2="118" y2="96" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="108" x2="110" y2="108" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />

          {/* Top-right small card details */}
          <rect x="132" y="65" width="22" height="10" rx="3" fill="#E2E8F0" />
          <circle cx="148" cy="70" r="2.5" fill="#94A3B8" />

          {/* Small floating blue dot on right */}
          <circle cx="160" cy="115" r="3.5" fill="#2563EB" />

          {/* Search Glass & X Red Circle */}
          <circle cx="128" cy="110" r="24" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.5" />
          {/* Inner glass overlay */}
          <circle cx="128" cy="110" r="18" fill="#E0F2FE" opacity="0.6" />
          
          {/* Red X Circle */}
          <circle cx="128" cy="110" r="12" fill="#EF4444" />
          <path d="M124 106 L132 114 M132 106 L124 114" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Handle of magnifying glass */}
          <line x1="145" y1="127" x2="160" y2="142" stroke="#94A3B8" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Description Text - Enlarged */}
      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">No assignments yet</h3>
      <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 px-6 max-w-xl">
        Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      {/* Button - Hidden on mobile in favor of floating button but kept for desktop - Enlarged */}
      <button 
        onClick={() => setViewMode('create')}
        className="hidden md:flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3.5 px-8 rounded-full border border-neutral-800 transition-all duration-200 hover:-translate-y-[1px] shadow-sm text-sm"
      >
        <Plus className="w-4 h-4 text-white stroke-[3]" />
        <span>Create Your First Assignment</span>
      </button>
    </div>
  );
}
