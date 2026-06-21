import { storeToRefs } from "pinia";
import { useTaskSelectionStore } from "@/stores/taskSelection";

export function useTaskSelection() {
    const store = useTaskSelectionStore();
    const refs = storeToRefs(store);

    return {
        ...refs,
        openModal: store.openModal,
        closeModal: store.closeModal,
        handleAgentSelection: store.handleAgentSelection,
        handleFileSelection: store.handleFileSelection,
    };
}
