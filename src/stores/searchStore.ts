import { create } from 'zustand';

interface SearchState {
  query: string;
  location: string;
  keywords: string[];
  setSearch: (query: string, location: string, keywords: string[]) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  location: '',
  keywords: [],
  setSearch: (query: string, location: string, keywords: string[]) => {
    set({ query, location, keywords });
  }
}));