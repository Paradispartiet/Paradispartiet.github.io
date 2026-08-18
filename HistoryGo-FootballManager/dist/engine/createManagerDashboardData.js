// src/engine/createManagerDashboardData.ts
function averageScore(values) {
    if (values.length === 0)
        return 0;
    const sum = values.reduce((total, value) => total + value, 0);
    return Math.max(0, Math.min(100, Math.round(sum / values.length)));
}
function findDuplicatePlayerIds(playerIds) {
    const counts = new Map();
    for (const id of playerIds) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return [...counts.entries()]
        .filter(([, count]) => count > 1)
        .map(([id]) => id);
}
function severityFromScore(score) {
    if (score >= 78)
        return "positive";
    if (score >= 65)
        return "neutral";
    if (score >= 50)
        return "warning";
    return "critical";
}
function severityFromPriority(priority) {
    if (priority === "critical")
        return "critical";
    if (priority === "high")
        return "warning";
    if (priority === "medium")
        return "neutral";
    return "positive";
}
function buildScoreLabel(score) {
    if (score >= 85) {
        return "Svært sterkt oppsett";
    }
    if (score >= 75) {
        return "Godt oppsett";
    }
    if (score >= 65) {
        return "Ustabilt, men brukbart oppsett";
    }
    return "Svakt oppsett";
}
function toKnowledgeCard(recommendation) {
    return {
        principleId: recommendation.principleId,
        title: recommendation.title,
        category: recommendation.category,
        priority: recommendation.priority,
        reason: recommendation.reason,
        coachAdvice: recommendation.coachAdvice,
        trainingSession: recommendation.trainingSession,
        tooltipText: recommendation.tooltipText,
        handbookText: recommendation.handbookText,
    };
}
function toActionCard(action) {
    return {
        code: action.code,
        priority: action.priority,
        severity: severityFromPriority(action.priority),
        source: action.source,
        label: action.label,
        rationale: action.rationale,
        relatedPlayerIds: action.relatedPlayerIds,
    };
}
export function createManagerDashboardData(insight) {
    const setup = insight.setup;
    const setupScore = setup.setupScore;
    const teamBalance = setup.teamBalance;
    const roleFitResults = setup.roleFitResults;
    const roleFitAverage = averageScore(roleFitResults.map((result) => result.finalFit));
    const tacticFitAverage = averageScore(roleFitResults.map((result) => result.tacticFit));
    const duplicatePlayerIds = findDuplicatePlayerIds(roleFitResults.map((result) => result.playerId));
    return {
        teamId: insight.teamId,
        tacticId: insight.tacticId,
        scorePanel: {
            teamId: insight.teamId,
            tacticId: insight.tacticId,
            setupScore,
            teamBalanceScore: teamBalance.finalBalance,
            reportLevel: insight.report.level,
            severity: severityFromScore(setupScore),
            label: buildScoreLabel(setupScore),
        },
        summaryPanel: {
            title: "Managerinnsikt",
            summary: insight.summary,
            reportSummary: insight.report.overallSummary,
        },
        completion: {
            completeCount: setup.validAssignmentCount,
            totalSlots: setup.totalAssignmentCount,
            isComplete: setup.isComplete,
            roleFitAverage,
            tacticFitAverage,
            duplicatePlayerIds,
            duplicateCount: duplicatePlayerIds.length,
        },
        metrics: [
            {
                code: "attacking_balance",
                label: "Angrep",
                value: teamBalance.attackingBalance,
                severity: severityFromScore(teamBalance.attackingBalance),
            },
            {
                code: "defensive_balance",
                label: "Forsvar",
                value: teamBalance.defensiveBalance,
                severity: severityFromScore(teamBalance.defensiveBalance),
            },
            {
                code: "midfield_control",
                label: "Midtbane",
                value: teamBalance.midfieldControl,
                severity: severityFromScore(teamBalance.midfieldControl),
            },
            {
                code: "pressing_coherence",
                label: "Press",
                value: teamBalance.pressingCoherence,
                severity: severityFromScore(teamBalance.pressingCoherence),
            },
            {
                code: "width_balance",
                label: "Bredde",
                value: teamBalance.widthBalance,
                severity: severityFromScore(teamBalance.widthBalance),
            },
            {
                code: "risk_balance",
                label: "Risiko",
                value: teamBalance.riskBalance,
                severity: severityFromScore(teamBalance.riskBalance),
            },
        ],
        topActions: insight.topActions.map(toActionCard),
        keyStrengths: insight.report.keyStrengths,
        keyProblems: insight.report.keyProblems,
        trainingPlan: insight.trainingFocusPlan.weeklyPlan.map((item) => ({
            area: item.area,
            intensity: item.intensity,
            priority: item.priority,
            label: item.label,
            suggestedSession: item.suggestedSession,
            relatedPlayerIds: item.relatedPlayerIds,
        })),
        roleChanges: [
            ...insight.roleChangeRecommendations.strongChanges,
            ...insight.roleChangeRecommendations.consideredChanges,
        ].map((recommendation) => ({
            playerId: recommendation.playerId,
            position: recommendation.position,
            currentRoleId: recommendation.currentRoleId,
            ...(recommendation.currentRoleName !== undefined
                ? { currentRoleName: recommendation.currentRoleName }
                : {}),
            ...(recommendation.currentFit !== undefined
                ? { currentFit: recommendation.currentFit }
                : {}),
            status: recommendation.status,
            label: recommendation.label,
        })),
        weakPoints: insight.weakPointAnalysis.weakPoints.map((weakPoint) => ({
            code: weakPoint.code,
            category: weakPoint.category,
            severity: weakPoint.severity,
            score: weakPoint.score,
            label: weakPoint.label,
            suggestedAction: weakPoint.suggestedAction,
            relatedPlayerIds: weakPoint.relatedPlayerIds,
        })),
        knowledgeRecommendations: insight.knowledgeRecommendations.map(toKnowledgeCard),
    };
}
