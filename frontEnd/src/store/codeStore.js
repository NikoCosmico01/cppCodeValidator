// src/store/codeStore.js
import { create } from 'zustand';

const useCppStore = create((set) => ({
  submissions: JSON.parse(localStorage.getItem('cpp_submissions')) || [],
  currentCode: '',
  selectedSubmissionId: null,

  // Add new submission
  addSubmission: (submission) =>
    set((state) => {
      const newSubmission = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...submission
      };
      const updated = [newSubmission, ...state.submissions];
      localStorage.setItem('cpp_submissions', JSON.stringify(updated));
      return { submissions: updated };
    }),

  // Delete submission
  deleteSubmission: (id) =>
    set((state) => {
      const updated = state.submissions.filter(s => s.id !== id);
      localStorage.setItem('cpp_submissions', JSON.stringify(updated));
      return { submissions: updated };
    }),

  // Clear all history
  clearHistory: () => {
    set({ submissions: [] });
    localStorage.removeItem('cpp_submissions');
  },

  // Set current code
  setCurrentCode: (code) => set({ currentCode: code }),

  // Select submission to view
  selectSubmission: (id) => set({ selectedSubmissionId: id }),

  // Export history as JSON
  exportHistory: () => {
    const state = useCppStore.getState();
    return JSON.stringify(state.submissions, null, 2);
  }
}));

export default useCppStore;