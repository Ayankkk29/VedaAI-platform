'use client';

import React from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import AssignmentCard from './AssignmentCard';
import EmptyState from './EmptyState';
import { Search, SlidersHorizontal, Plus, Bell, ArrowLeft } from 'lucide-react';

export default function AssignmentsList() {
  const {
    assignments,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterSubject,
    setFilterSubject,
    setActiveTab,
  } = useAssignmentStore();

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.class.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesSubject = 
      filterSubject === 'all' || 
      a.subject.toLowerCase() === filterSubject.toLowerCase();

    return matchesSearch && matchesSubject;
  });

  const subjects = ['all', ...new Set(assignments.map((a) => a.subject.toLowerCase()))];

  const handleCreateClick = () => {
    setViewMode('create');
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] md:min-h-0 md:h-full relative">
      {/* Desktop-only Header Bar */}
      <header className="hidden md:flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('home')}
            className="p-1.5 rounded-full hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="h-4 w-[1px] bg-gray-200" />
          
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="text-[14px] font-bold text-gray-500">Assignment</span>
          </div>
        </div>
        <button className="relative p-2 rounded-full hover:bg-neutral-50 text-gray-550 hover:text-gray-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 sm:p-8 space-y-5 overflow-y-auto">
        {/* Title Block with Back Arrow on Mobile (replicating Screen 2) - Hidden on desktop when empty to match Figma */}
        {assignments.length > 0 && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('home')}
              className="md:hidden p-2 rounded-full border border-gray-200 bg-white hover:bg-neutral-50 shadow-sm text-gray-550 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="hidden md:block w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-emerald-100 animate-pulse" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight leading-none">Assignments</h1>
                <p className="hidden md:block text-xs text-gray-400 mt-1">Manage and create AI-generated assignments for your classes.</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar Container (styled to match Screen 2 on mobile) */}
        {assignments.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-gray-150 shadow-sm w-full">
            {/* Filter Selector on the left */}
            <div className="relative flex items-center gap-1.5 bg-neutral-50 border border-gray-150 px-2.5 py-2 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-neutral-100 transition-colors shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer uppercase text-[10px] pr-1"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === 'all' ? 'Filter' : sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input on the right */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-150 text-[11px] focus:outline-none focus:border-gray-300 transition-all placeholder-gray-400 bg-neutral-50/50"
              />
            </div>
          </div>
        )}

        {/* Assignment Cards List / Empty State */}
        {assignments.length === 0 ? (
          <EmptyState />
        ) : filteredAssignments.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-3xl bg-white shadow-sm">
            No assignments match your search queries.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Create Button - Optimized for both Desktop & Mobile layouts */}
      {assignments.length > 0 && (
        <>
          {/* Desktop Floating Action Button */}
          <button
            onClick={handleCreateClick}
            className="hidden md:flex fixed bottom-8 right-8 items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3.5 px-6 rounded-full border border-orange-500/30 transition-all duration-300 shadow-lg shadow-neutral-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
          >
            <Plus className="w-5 h-5 text-orange-500" />
            <span>Create Assignment</span>
          </button>

          {/* Mobile Floating Action Button (White circle with orange plus sign matching Screen 2) */}
          <button
            onClick={handleCreateClick}
            className="md:hidden fixed bottom-24 right-6 w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-lg active:scale-95 transition-transform z-30"
          >
            <Plus className="w-6 h-6 text-orange-500 stroke-[3]" />
          </button>
        </>
      )}

      {/* If empty state is active on mobile, show the mobile floating button as well */}
      {assignments.length === 0 && (
        <button
          onClick={handleCreateClick}
          className="md:hidden fixed bottom-24 right-6 w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-lg active:scale-95 transition-transform z-30"
        >
          <Plus className="w-6 h-6 text-orange-500 stroke-[3]" />
        </button>
      )}
    </div>
  );
}
