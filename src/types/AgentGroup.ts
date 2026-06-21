import type { Agent } from "./Agent";

export type AgentGroup = {
    env: string,
    agents: Agent[],
}

function groupAgentsByEnv(
    agents: Agent[]
): Record<string, Agent[]> {
    return agents.reduce(
        (acc, agent) => {
            (acc[agent.env] ??= []).push(agent);
            return acc;
        },
        {} as Record<string, Agent[]>
    );
}

export function toAgentGroups(
    agents: Agent[]
): AgentGroup[] {
    return Object.entries(groupAgentsByEnv(agents))
        .map(([env, agents]) => ({
            env,
            agents,
        }));
}