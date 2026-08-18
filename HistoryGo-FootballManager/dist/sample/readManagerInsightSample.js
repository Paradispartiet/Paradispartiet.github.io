// src/sample/readManagerInsightSample.ts
import { createManagerInsight } from "../engine/createManagerInsight.js";
import { sampleRoles, sampleTactic, sampleTeam, } from "./elite433Sample.js";
function toReadableAction(action) {
    return {
        priority: action.priority,
        source: action.source,
        label: action.label,
        rationale: action.rationale,
        relatedPlayerIds: action.relatedPlayerIds,
    };
}
function toReadableTrainingFocus(item) {
    return {
        area: item.area,
        intensity: item.intensity,
        priority: item.priority,
        label: item.label,
        suggestedSession: item.suggestedSession,
        relatedPlayerIds: item.relatedPlayerIds,
    };
}
export function readManagerInsightSample(insight = createManagerInsight({
    team: sampleTeam,
    tactic: sampleTactic,
    roles: sampleRoles,
})) {
    return {
        teamId: insight.teamId,
        tacticId: insight.tacticId,
        setupScore: insight.setup.setupScore,
        reportLevel: insight.report.level,
        summary: insight.summary,
        reportSummary: insight.report.overallSummary,
        weakPointSummary: insight.weakPointAnalysis.summary,
        roleChangeSummary: insight.roleChangeRecommendations.summary,
        trainingFocusSummary: insight.trainingFocusPlan.summary,
        topActions: insight.topActions.map(toReadableAction),
        keyStrengths: insight.report.keyStrengths,
        keyProblems: insight.report.keyProblems,
        mainWeakPoint: insight.weakPointAnalysis.mainWeakPoint?.label ?? null,
        primaryTrainingFocus: insight.trainingFocusPlan.primaryFocus
            ? toReadableTrainingFocus(insight.trainingFocusPlan.primaryFocus)
            : null,
        weeklyTrainingPlan: insight.trainingFocusPlan.weeklyPlan.map(toReadableTrainingFocus),
        strongRoleChanges: insight.roleChangeRecommendations.strongChanges.map((recommendation) => recommendation.label),
        consideredRoleChanges: insight.roleChangeRecommendations.consideredChanges.map((recommendation) => recommendation.label),
    };
}
export const managerInsightSample = createManagerInsight({
    team: sampleTeam,
    tactic: sampleTactic,
    roles: sampleRoles,
});
export const readableManagerInsightSample = readManagerInsightSample(managerInsightSample);
