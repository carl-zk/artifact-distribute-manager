import { computed, type Ref } from "vue";
import type { Agent } from "@/types/Agent";
import { toAgentGroups } from "@/types/AgentGroup";

const parseSearchRegex = (query: string): RegExp | null => {
    if (!query.startsWith("/") || !query.endsWith("/")) return null;

    try {
        return new RegExp(query.slice(1, -1), "i");
    } catch {
        return null;
    }
};

export function useAgentGroupFilter(agents: Ref<Agent[] | undefined>, searchTerm: Ref<string>) {
    const agentGroups = computed(() => toAgentGroups(agents.value ?? []));

    const normalizedSearch = computed(() => searchTerm.value.trim().toLowerCase());

    const filteredAgentGroups = computed(() => {
        const query = normalizedSearch.value;
        if (!query) return agentGroups.value;

        const regex = parseSearchRegex(searchTerm.value.trim());

        return agentGroups.value
            .map((group) => ({
                ...group,
                agents: group.agents.filter((agent) => {
                    const fields = [agent.namespace, agent.agentId, agent.hostname, agent.ip].filter(
                        Boolean,
                    ) as string[];

                    if (regex) {
                        return fields.some((value) => regex.test(value));
                    }

                    return fields.some((value) => value.toLowerCase().includes(query));
                }),
            }))
            .filter((group) => group.agents.length > 0);
    });

    return {
        filteredAgentGroups,
    };
}
