// src/engine/createManagerAppState.ts
import { createManagerDashboardData } from "./createManagerDashboardData.js";
import { createManagerDashboardViewModel } from "./createManagerDashboardViewModel.js";
import { createManagerInsight } from "./createManagerInsight.js";
function getStateStatus(insight) {
    if (!insight.setup.isComplete) {
        return "incomplete";
    }
    const hasCriticalActions = insight.topActions.some((action) => action.priority === "critical");
    if (hasCriticalActions) {
        return "has_critical_issues";
    }
    const hasWarnings = insight.topActions.some((action) => action.priority === "high" || action.priority === "medium");
    if (hasWarnings) {
        return "has_warnings";
    }
    return "ready";
}
function buildSummary(status, insight) {
    if (status === "incomplete") {
        return "App-state er opprettet, men laget er ikke komplett. UI bør vise dette som foreløpig vurdering.";
    }
    if (status === "has_critical_issues") {
        return "App-state er opprettet med kritiske problemer. UI bør vise topphandlingene tydelig først.";
    }
    if (status === "has_warnings") {
        return "App-state er opprettet med tydelige forbedringspunkter. UI bør vise tiltak, svakheter og treningsfokus.";
    }
    return `App-state er klar. ${insight.summary}`;
}
export function createManagerAppState(input) {
    const insight = createManagerInsight({
        team: input.team,
        tactic: input.tactic,
        roles: input.roles,
        knowledgePrinciples: input.knowledgePrinciples ?? [],
    });
    const dashboardData = createManagerDashboardData(insight);
    const dashboardViewModel = createManagerDashboardViewModel(dashboardData);
    const status = getStateStatus(insight);
    return {
        teamId: input.team.id,
        tacticId: input.tactic.id,
        status,
        insight,
        dashboardData,
        dashboardViewModel,
        summary: buildSummary(status, insight),
    };
}
