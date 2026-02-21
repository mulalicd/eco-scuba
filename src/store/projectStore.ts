import { create } from 'zustand';
import { Project, ProjectSection } from '@/types';

interface ProjectState {
    currentProject: Project | null;
    sections: ProjectSection[];
    setCurrentProject: (project: Project | null) => void;
    setSections: (sections: ProjectSection[]) => void;
    updateSection: (sectionKey: string, updates: Partial<ProjectSection>) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    currentProject: null,
    sections: [],
    setCurrentProject: (project) => set({ currentProject: project }),
    setSections: (sections) => set({ sections }),
    updateSection: (sectionKey, updates) => set((state) => ({
        sections: state.sections.map((s) =>
            s.section_key === sectionKey ? { ...s, ...updates } : s
        )
    })),
}));
