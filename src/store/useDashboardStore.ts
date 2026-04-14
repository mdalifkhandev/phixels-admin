import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TabType = 'leads' | 'messages' | 'newsletter' | 'jobs';

interface DashboardState {
  activeTab: TabType;
  searchTerm: string;
  progressFilter: string;
  setActiveTab: (tab: TabType) => void;
  setSearchTerm: (term: string) => void;
  setProgressFilter: (filter: string) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activeTab: 'leads',
      searchTerm: '',
      progressFilter: 'All',
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setProgressFilter: (filter) => set({ progressFilter: filter }),
      resetFilters: () => set({ searchTerm: '', progressFilter: 'All' }),
    }),
    {
      name: 'dashboard-storage', // saves to localStorage
      partialize: (state) => ({ 
        activeTab: state.activeTab,
        progressFilter: state.progressFilter 
      }), // only persist These
    }
  )
);
