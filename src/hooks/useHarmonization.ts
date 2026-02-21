import { useCallback } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { APACollectedData } from '@/types';

export function useHarmonization() {
    const { currentProject, setCurrentProject, sections, updateSection } = useProjectStore();

    const propagateChange = useCallback((changeDescription: string, affectedFields: Partial<APACollectedData>) => {
        if (!currentProject) return;

        // 1. Update the State Register (apa_collected_data)
        const updatedData = {
            ...currentProject.apa_collected_data,
            ...affectedFields
        };

        const updatedProject = {
            ...currentProject,
            apa_collected_data: updatedData
        };

        setCurrentProject(updatedProject);

        // 2. Identify sections that need re-generation
        // In a real implementation, this would involve APA analysis.
        // For now, we mark affected sections as 'pending' or 'revision_requested'
        const sectionsToUpdate = sections.filter(s => {
            // Logic to determine if section is affected by these specific fields
            return true; // Simple version: all sections might be affected
        });

        sectionsToUpdate.forEach(s => {
            updateSection(s.section_key, { status: 'revision_requested' });
        });

        console.log(`Change propagated: ${changeDescription}`);
    }, [currentProject, sections, setCurrentProject, updateSection]);

    return { propagateChange };
}
