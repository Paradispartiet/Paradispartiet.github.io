// src/sample/readManagerDashboardViewModelSample.ts
import { createManagerDashboardData } from "../engine/createManagerDashboardData.js";
import { createManagerDashboardViewModel } from "../engine/createManagerDashboardViewModel.js";
import { createManagerInsight } from "../engine/createManagerInsight.js";
import { sampleRoles, sampleTactic, sampleTeam, } from "./elite433Sample.js";
export const managerDashboardViewModelSampleInsight = createManagerInsight({
    team: sampleTeam,
    tactic: sampleTactic,
    roles: sampleRoles,
});
export const managerDashboardViewModelSampleData = createManagerDashboardData(managerDashboardViewModelSampleInsight);
export const managerDashboardViewModelSample = createManagerDashboardViewModel(managerDashboardViewModelSampleData);
export function readManagerDashboardViewModelSample(viewModel = managerDashboardViewModelSample) {
    return {
        teamId: viewModel.teamId,
        tacticId: viewModel.tacticId,
        score: {
            label: viewModel.score.label,
            setupScoreText: viewModel.score.setupScoreText,
            teamBalanceText: viewModel.score.teamBalanceText,
            reportLevelText: viewModel.score.reportLevelText,
            className: viewModel.score.className,
        },
        summary: {
            title: viewModel.summary.title,
            summary: viewModel.summary.summary,
            reportSummary: viewModel.summary.reportSummary,
        },
        metrics: viewModel.metrics.map((metric) => ({
            code: metric.code,
            label: metric.label,
            valueText: metric.valueText,
            className: metric.className,
        })),
        topActions: viewModel.topActions.map((action) => ({
            priorityText: action.priorityText,
            sourceText: action.sourceText,
            label: action.label,
            rationale: action.rationale,
            relatedPlayerText: action.relatedPlayerText,
            className: action.className,
        })),
        keyStrengths: viewModel.keyStrengths,
        keyProblems: viewModel.keyProblems,
        trainingPlan: viewModel.trainingPlan.map((item) => ({
            areaText: item.areaText,
            intensityText: item.intensityText,
            priorityText: item.priorityText,
            label: item.label,
            suggestedSession: item.suggestedSession,
            relatedPlayerText: item.relatedPlayerText,
        })),
        roleChanges: viewModel.roleChanges.map((change) => ({
            playerId: change.playerId,
            position: change.position,
            currentRoleNameText: change.currentRoleNameText,
            currentFitText: change.currentFitText,
            statusText: change.statusText,
            label: change.label,
        })),
        weakPoints: viewModel.weakPoints.map((weakPoint) => ({
            categoryText: weakPoint.categoryText,
            severityText: weakPoint.severityText,
            scoreText: weakPoint.scoreText,
            label: weakPoint.label,
            suggestedAction: weakPoint.suggestedAction,
            relatedPlayerText: weakPoint.relatedPlayerText,
            className: weakPoint.className,
        })),
        emptyStates: viewModel.emptyStates,
    };
}
export const readableManagerDashboardViewModelSample = readManagerDashboardViewModelSample(managerDashboardViewModelSample);
