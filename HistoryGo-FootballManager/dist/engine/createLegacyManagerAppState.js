// src/engine/createLegacyManagerAppState.ts
import { adaptLegacyRoles, adaptLegacyTactic, adaptLegacyTeam, } from "./adaptLegacyFootballData.js";
import { createManagerAppState } from "./createManagerAppState.js";
function buildAdaptTeamInput(input) {
    return {
        teamId: input.teamId,
        teamName: input.teamName,
        players: input.players,
    };
}
function buildAdaptTacticInput(input) {
    return {
        tactic: input.tactic,
        formation: input.formation,
        lineup: input.lineup,
    };
}
function buildSummary(appState) {
    if (appState.status === "incomplete") {
        return "Legacy-data er adaptert, men startelleveren er ikke komplett.";
    }
    if (appState.status === "has_critical_issues") {
        return "Legacy-data er adaptert, og manager-motoren finner kritiske problemer i oppsettet.";
    }
    if (appState.status === "has_warnings") {
        return "Legacy-data er adaptert, og manager-motoren finner tydelige forbedringspunkter.";
    }
    return "Legacy-data er adaptert, og manager-motoren vurderer oppsettet som klart.";
}
export function createLegacyManagerAppState(input) {
    const adaptedTeam = adaptLegacyTeam(buildAdaptTeamInput(input));
    const adaptedRoles = adaptLegacyRoles(input.roles);
    const adaptedTactic = adaptLegacyTactic(buildAdaptTacticInput(input));
    const appState = createManagerAppState({
        team: adaptedTeam,
        tactic: adaptedTactic,
        roles: adaptedRoles,
        knowledgePrinciples: input.knowledgePrinciples ?? [],
    });
    return {
        teamId: adaptedTeam.id,
        tacticId: adaptedTactic.id,
        adaptedTeam,
        adaptedRoles,
        adaptedTactic,
        appState,
        summary: buildSummary(appState),
    };
}
