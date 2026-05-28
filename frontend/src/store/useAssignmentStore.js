import { create } from 'zustand';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

export const useAssignmentStore = create((set, get) => ({
  assignments: [],
  activeTab: 'assignments', // active nav bar item: 'home' | 'my-groups' | 'assignments' | 'toolkit' | 'library'
  viewMode: 'list', // 'list' | 'create' | 'view-paper'
  selectedAssignmentId: null,
  isLoading: false,
  isGenerating: false,
  wsConnected: false,
  searchQuery: '',
  filterSubject: 'all',
  
  // Fetch assignments from Express API
  fetchAssignments: async (silent = false) => {
    if (!silent) set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/assignments`);
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      set({ assignments: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      set({ assignments: [], isLoading: false });
    }
  },

  // Create new assignment
  createAssignment: async (formData) => {
    set({ isGenerating: true });
    try {
      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create assignment');
      const newAssignment = await res.json();

      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        selectedAssignmentId: newAssignment._id,
        viewMode: 'list', // return to list so we can see generation status
        isGenerating: false,
      }));
      return newAssignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      set({ isGenerating: false });
      return null;
    }
  },

  // Regenerate questions
  regenerateAssignment: async (id, params = {}) => {
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Failed to regenerate assignment');
      const updated = await res.json();

      set((state) => ({
        assignments: state.assignments.map((a) => (a._id === id ? updated : a)),
      }));
    } catch (error) {
      console.error('Error regenerating assignment:', error);
    }
  },

  // Delete assignment
  deleteAssignment: async (id) => {
    // Optimistic UI update
    const previousAssignments = get().assignments;
    set((state) => ({
      assignments: state.assignments.filter((a) => a._id !== id),
      selectedAssignmentId: state.selectedAssignmentId === id ? null : state.selectedAssignmentId,
      viewMode: state.selectedAssignmentId === id ? 'list' : state.viewMode,
    }));

    try {
      const res = await fetch(`${API_BASE}/assignments/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete assignment');
    } catch (error) {
      console.error('Error deleting assignment, rolling back:', error);
      set({ assignments: previousAssignments });
    }
  },

  // Real-time WebSockets event updater
  updateAssignmentStatus: (payload) => {
    const { assignmentId, status, generatedPaper, errorMessage } = payload;
    
    set((state) => {
      const updated = state.assignments.map((a) => {
        if (a._id === assignmentId) {
          return {
            ...a,
            status,
            ...(generatedPaper ? { generatedPaper } : {}),
            ...(errorMessage ? { errorMessage } : {}),
          };
        }
        return a;
      });
      return { assignments: updated };
    });
  },

  // UI state mutators
  setActiveTab: (activeTab) => set({ activeTab }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedAssignmentId: (id) => set({ selectedAssignmentId: id }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterSubject: (filterSubject) => set({ filterSubject }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
}));
