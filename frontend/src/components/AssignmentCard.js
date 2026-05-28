'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { MoreVertical, Trash2, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssignmentCard({ assignment }) {
  const { 
    setSelectedAssignmentId, 
    setViewMode, 
    deleteAssignment,
    regenerateAssignment 
  } = useAssignmentStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    if (assignment.status === 'completed') {
      setSelectedAssignmentId(assignment._id);
      setViewMode('view-paper');
    }
  };

  const handleView = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (assignment.status === 'completed') {
      setSelectedAssignmentId(assignment._id);
      setViewMode('view-paper');
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignment(assignment._id);
    }
  };

  const handleRegenerate = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    regenerateAssignment(assignment._id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    if (dateStr.includes('-')) return dateStr;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB').replace(/\//g, '-');
    } catch {
      return dateStr;
    }
  };

  // Status rendering logic
  const renderStatusInfo = () => {
    switch (assignment.status) {
      case 'queued':
        return (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-semibold w-fit border border-amber-100">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Queued for generation...</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold w-fit border border-indigo-100">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>AI generating questions...</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold w-fit border border-red-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Failed. Tap menu to retry</span>
          </div>
        );
      case 'completed':
      default:
        return (
          <>
            {/* Desktop dates view (split bottom line) */}
            <div className="hidden sm:flex items-center justify-between text-gray-500 text-[13px] mt-4 pt-4 border-t border-gray-100/60">
              <div>
                <span className="text-gray-400">Assigned on : </span>
                <span className="font-semibold text-gray-700">{formatDate(assignment.createdAt)}</span>
              </div>
              {assignment.dueDate && (
                <div>
                  <span className="text-gray-400">Due : </span>
                  <span className="font-semibold text-gray-700">{formatDate(assignment.dueDate)}</span>
                </div>
              )}
            </div>

            {/* Mobile dates view (single responsive line below title matching Screen 2) */}
            <div className="sm:hidden flex flex-wrap items-center gap-x-3 text-[12px] text-gray-500 mt-2">
              <div>
                <span className="text-gray-400">Assigned on : </span>
                <span className="font-semibold text-gray-700">{formatDate(assignment.createdAt)}</span>
              </div>
              {assignment.dueDate && (
                <div>
                  <span className="text-gray-400">Due : </span>
                  <span className="font-semibold text-gray-700">{formatDate(assignment.dueDate)}</span>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative group bg-white border border-gray-150 p-5 rounded-3xl transition-all duration-300 ${
        assignment.status === 'completed' 
          ? 'cursor-pointer hover:shadow-md hover:shadow-gray-100/80 hover:border-gray-300' 
          : 'opacity-90 select-none'
      }`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start gap-2 mb-1">
        <div className="min-w-0">
          <span className="text-[10px] sm:text-[12px] font-bold text-orange-500 tracking-wider uppercase">
            {assignment.subject} • Class {assignment.class}
          </span>
          <h3 className="text-[16px] sm:text-lg font-bold text-neutral-800 leading-tight truncate mt-0.5 group-hover:text-orange-600 transition-colors">
            {assignment.title}
          </h3>
        </div>

        {/* 3-Dot Dropdown */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-1 w-44 bg-white border border-gray-150 rounded-2xl shadow-lg shadow-neutral-100/60 py-1.5 z-10"
              >
                {assignment.status === 'completed' && (
                  <button
                    onClick={handleView}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
                  >
                    <Eye className="w-4 h-4 text-neutral-400" />
                    <span>View Assignment</span>
                  </button>
                )}
                {assignment.status === 'failed' && (
                  <button
                    onClick={handleRegenerate}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-neutral-50 transition-colors text-left"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Generation</span>
                  </button>
                )}
                {assignment.status === 'completed' && (
                  <button
                    onClick={handleRegenerate}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
                  >
                    <RefreshCw className="w-4 h-4 text-neutral-400" />
                    <span>Regenerate AI</span>
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="mt-2">
        {renderStatusInfo()}
      </div>

      {/* Subtle indicator decoration */}
      {assignment.status === 'completed' && (
        <div className="absolute top-0 left-12 w-8 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
      )}
    </div>
  );
}
