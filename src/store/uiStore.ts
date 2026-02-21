import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    pageTitle: string;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setPageTitle: (title: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    pageTitle: "",
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setPageTitle: (title) => set({ pageTitle: title }),
}));

