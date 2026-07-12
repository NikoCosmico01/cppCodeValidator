// src/store/codeStore.js
import { create } from 'zustand';

const STORAGE_KEY = 'cpp_submissions';
const MAX_HISTORY = 50;

function loadSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(submissions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch {
    //Storage Full or Unavailable
  }
}

const useCppStore = create((set) => ({
  submissions: loadSubmissions(),
  currentCode: '',
  fileName: 'main.cpp',
  std: 'c++17',

  setCurrentCode: (code) => set({ currentCode: code }),
  setFileName: (fileName) => set({ fileName }),
  setStd: (std) => set({ std }),

  addSubmission: (submission) =>
    set((state) => {
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...submission
      };
      const updated = [entry, ...state.submissions].slice(0, MAX_HISTORY);
      persist(updated);
      return { submissions: updated };
    }),

  deleteSubmission: (id) =>
    set((state) => {
      const updated = state.submissions.filter((s) => s.id !== id);
      persist(updated);
      return { submissions: updated };
    }),

  clearHistory: () => {
    persist([]);
    set({ submissions: [] });
  },

  loadSubmission: (id) =>
    set((state) => {
      const submission = state.submissions.find((s) => s.id === id);
      if (!submission) return {};
      return {
        currentCode: submission.code,
        fileName: submission.fileName || 'main.cpp',
        std: submission.std || 'c++17'
      };
    })
}));

export default useCppStore;
