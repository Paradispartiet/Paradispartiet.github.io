// src/sample/readManagerAppStateSample.ts
import { createManagerAppState } from "../engine/createManagerAppState.js";
import { sampleRoles, sampleTactic, sampleTeam, } from "./elite433Sample.js";
export const managerAppStateSample = createManagerAppState({
    team: sampleTeam,
    tactic: sampleTactic,
    roles: sampleRoles,
});
export function readManagerAppStateSample(state = managerAppStateSample) {
    return {
        teamId: state.teamId,
        tacticId: state.tacticId,
        status: state.status,
        summary: state.summary,
        setupScore: state.dashboardViewModel.score.setupScoreText,
        teamBalance: state.dashboardViewModel.score.teamBalanceText,
        reportLevel: state.dashboardViewModel.score.reportLevelText,
        managerSummary: state.dashboardViewModel.summary.summary,
        reportSummary: state.dashboardViewModel.summary.reportSummary,
        topActions: state.dashboardViewModel.topActions.map((action) => ({
            priority: action.priorityText,
            source: action.sourceText,
            label: action.label,
            rationale: action.rationale,
            relatedPlayerIds: action.relatedPlayerText === "Ingen spesifikke spillere"
                ? []
                : action.relatedPlayerText.split(", "),
        })),
        metrics: state.dashboardViewModel.metrics.map((metric) => ({
            code: metric.code,
            label: metric.label,
            value: metric.valueText,
            className: metric.className,
        })),
        trainingPlan: state.dashboardViewModel.trainingPlan.map((item) => ({
            area: item.areaText,
            intensity: item.intensityText,
            priority: item.priorityText,
            label: item.label,
            suggestedSession: item.suggestedSession,
        })),
        roleChanges: state.dashboardViewModel.roleChanges.map((change) => ({
            playerId: change.playerId,
            position: change.position,
            role: change.currentRoleNameText,
            currentFit: change.currentFitText,
            status: change.statusText,
            label: change.label,
        })),
        weakPoints: state.dashboardViewModel.weakPoints.map((weakPoint) => ({
            category: weakPoint.categoryText,
            severity: weakPoint.severityText,
            score: weakPoint.scoreText,
            label: weakPoint.label,
            suggestedAction: weakPoint.suggestedAction,
        })),
        emptyStates: state.dashboardViewModel.emptyStates,
    };
}
export const readableManagerAppStateSample = readManagerAppStateSample(managerAppStateSample);
