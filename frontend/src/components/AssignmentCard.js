'use client';

import React from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { 
  FileText, 
  Trash2, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function AssignmentCard({ assignment }) {
  const { deleteAssignment, setSelectedAssignmentId, setViewMode } = useAssignmentStore();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
            Generating Paper
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <Clock className="w-3 h-3 text-blue-500" />
            Queued
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const getSubjectColor = (subject) => {
    const sub = subject?.toLowerCase() || '';
    if (sub.includes('math')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (sub.includes('sci') || sub.includes('phys') || sub.includes('chem') || sub.includes('bio')) {
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
    if (sub.includes('eng') || sub.includes('lang')) return 'bg-purple-50 text-purple-600 border-purple-100';
    if (sub.includes('hist') || sub.includes('civ') || sub.includes('soc')) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-neutral-50 text-neutral-600 border-neutral-100';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleView = () => {
    if (assignment.status === 'completed') {
      setSelectedAssignmentId(assignment._id);
      setViewMode('view-paper');
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      deleteAssignment(assignment._id);
    }
  };

  return (
    <div 
      onClick={handleView}
      className={`group relative bg-white border border-gray-150 rounded-3xl p-5 md:p-6 transition-all duration-200 shadow-sm ${
        assignment.status === 'completed' 
          ? 'cursor-pointer hover:shadow-md hover:border-gray-300' 
          : 'cursor-default'
      }`}
    >
      <div className="flex justify-between items-start gap-4 mb-4">
        {/* Title & Badge */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getSubjectColor(assignment.subject)}`}>
              {assignment.subject}
            </span>
            <span className="text-[10px] bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded-full">
              Grade {assignment.class}
            </span>
          </div>
          <h4 className="font-extrabold text-neutral-900 text-sm md:text-md tracking-tight truncate group-hover:text-orange-500 transition-colors">
            {assignment.title}
          </h4>
        </div>

        {/* Delete Trigger */}
        <button 
          onClick={handleDelete}
          className="text-gray-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50/50 transition-colors duration-150 shrink-0"
          title="Delete assignment"
        >
          <Trash2 className="w-4 h-4 stroke-[2]" />
        </button>
      </div>

      {/* Description / Instructions */}
      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-5">
        {assignment.instructions || `Automatic AI generated question paper containing ${assignment.numQuestions || 5} structured assessments.`}
      </p>

      {/* Footer Info Row */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-[10px] md:text-xs">
        <div className="flex items-center gap-1.5 text-gray-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>Due {formatDate(assignment.dueDate)}</span>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(assignment.status)}
          
          {assignment.status === 'completed' && (
            <span className="text-orange-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 flex items-center gap-1 font-bold text-xs">
              View Paper
              <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Display errors if generation failed */}
      {assignment.status === 'failed' && assignment.errorMessage && (
        <div className="mt-3 p-3 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-rose-600 font-semibold leading-relaxed">
            Generation Failed: {assignment.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}
