import { computed, ref, watch } from "vue";
import type { Agent } from "@/types/Agent";
import { fetchAgents } from "@/services/clientApi";

export type AgentTableProps = {
    visible?: boolean;
    agents?: Agent[];
    selectable?: boolean;
};

export function useAgentTable(props: AgentTableProps, emit: (event: "selectionChange", items: Agent[]) => void) {
    const loadedAgents = ref<Agent[]>([]);
    const selectedIds = ref<string[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const sortKey = ref<keyof Agent | null>(null);
    const sortAscending = ref(true);

    const displayedAgents = computed(() => props.agents ?? loadedAgents.value);

    const sortedAgents = computed(() => {
        const key = sortKey.value;
        if (!key) return displayedAgents.value;

        return [...displayedAgents.value].sort((a, b) => {
            const left = String(a[key] ?? "");
            const right = String(b[key] ?? "");
            const result = left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
            return sortAscending.value ? result : -result;
        });
    });

    async function loadAgents() {
        if (props.agents) return;

        loading.value = true;
        error.value = null;
        loadedAgents.value = [];
        selectedIds.value = [];

        try {
            loadedAgents.value = await fetchAgents();
        } catch (err: any) {
            console.error("AgentTable: failed to fetch agents", err);
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    watch(
        () => props.visible,
        (value) => {
            if (value) loadAgents();
        },
        { immediate: true },
    );

    function emitSelection() {
        emit(
            "selectionChange",
            displayedAgents.value.filter((agent) => selectedIds.value.includes(agent.agentId)),
        );
    }

    function toggle(id: string) {
        if (!props.selectable) return;

        const index = selectedIds.value.indexOf(id);
        if (index === -1) selectedIds.value.push(id);
        else selectedIds.value.splice(index, 1);

        emitSelection();
    }

    function setSort(key: keyof Agent) {
        if (sortKey.value === key) {
            sortAscending.value = !sortAscending.value;
        } else {
            sortKey.value = key;
            sortAscending.value = true;
        }
    }

    function sortIndicator(key: keyof Agent) {
        if (sortKey.value !== key) return "";
        return sortAscending.value ? " ▲" : " ▼";
    }

    return {
        loading,
        error,
        selectedIds,
        sortedAgents,
        toggle,
        setSort,
        sortIndicator,
    };
}
