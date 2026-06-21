import { defineStore } from "pinia";
import type { Agent } from "@/types/Agent";
import type { FileEntry } from "@/types/FileEntity";

type ModalName = "agents" | "files";

export const useTaskSelectionStore = defineStore("taskSelection", {
    state: () => ({
        activeModal: null as ModalName | null,
        selectedAgents: [] as Agent[],
        selectedFiles: [] as FileEntry[],
        agents: [] as Agent[],
    }),
    actions: {
        openModal(modalName: ModalName) {
            this.activeModal = modalName;
        },
        closeModal() {
            this.activeModal = null;
        },
        handleAgentSelection(items: Agent[]) {
            this.selectedAgents = items;
        },
        handleFileSelection(items: FileEntry[]) {
            this.selectedFiles = items;
        },
    },
});
