// src/engine/createFootballKnowledgeRecommendations.ts
function priorityRank(priority) {
    if (priority === "high")
        return 3;
    if (priority === "medium")
        return 2;
    return 1;
}
function matchedWeakPoints(principle, weakPoints) {
    const codes = new Set(principle.appliesToWeakPoints);
    return weakPoints.filter((weakPoint) => codes.has(weakPoint.code));
}
function matchedTrainingFocus(principle, weeklyPlan) {
    const areas = new Set(principle.appliesToTrainingAreas);
    return weeklyPlan.filter((item) => areas.has(item.area));
}
function resolvePriority(matchedWeak, matchedTraining, mainWeakPointCode, highPriorityCodes) {
    const matchesMainOrHigh = matchedWeak.some((weakPoint) => weakPoint.code === mainWeakPointCode || highPriorityCodes.has(weakPoint.code));
    if (matchesMainOrHigh) {
        return "high";
    }
    if (matchedTraining.length > 0) {
        return "medium";
    }
    return "low";
}
function buildReason(matchedWeak, matchedTraining) {
    const parts = [];
    if (matchedWeak.length > 0) {
        const labels = matchedWeak.map((weakPoint) => weakPoint.label).join(" ");
        parts.push(`Knyttet til svakhet i oppsettet: ${labels}`);
    }
    if (matchedTraining.length > 0) {
        const areas = [...new Set(matchedTraining.map((item) => item.area))].join(", ");
        parts.push(`Støtter ukens treningsfokus: ${areas}.`);
    }
    if (parts.length === 0) {
        return "Generelt fotballfaglig prinsipp for dette oppsettet.";
    }
    return parts.join(" ");
}
/**
 * Kobler fotballfaglige prinsipper mot managerinnsikten.
 *
 * Funksjonen leser svakhetsanalysen og treningsfokuset i innsikten, men viser
 * bare Fotballboka når et prinsipp faktisk treffer en weakPoint fra motoren.
 * Treningsområdet kan løfte og forklare anbefalingen, men kan ikke alene fylle
 * plassen med teori. Det bevarer eksisterende feedback som trygg fallback.
 */
export function createFootballKnowledgeRecommendations(input) {
    const { weakPointAnalysis, trainingFocusPlan, principles } = input;
    const weakPoints = weakPointAnalysis.weakPoints;
    const weeklyPlan = trainingFocusPlan.weeklyPlan;
    const mainWeakPointCode = weakPointAnalysis.mainWeakPoint?.code ?? null;
    const highPriorityCodes = new Set(weakPointAnalysis.highPriorityWeakPoints.map((weakPoint) => weakPoint.code));
    const seen = new Set();
    const recommendations = [];
    for (const principle of principles) {
        if (seen.has(principle.id)) {
            continue;
        }
        const matchedWeak = matchedWeakPoints(principle, weakPoints);
        const matchedTraining = matchedTrainingFocus(principle, weeklyPlan);
        if (matchedWeak.length === 0) {
            continue;
        }
        seen.add(principle.id);
        const priority = resolvePriority(matchedWeak, matchedTraining, mainWeakPointCode, highPriorityCodes);
        recommendations.push({
            principleId: principle.id,
            title: principle.title,
            category: principle.category,
            priority,
            reason: buildReason(matchedWeak, matchedTraining),
            coachAdvice: principle.coachAdvice,
            trainingSession: principle.trainingSession,
            tooltipText: principle.tooltipText,
            assistantText: principle.assistantText,
            trainingText: principle.trainingText,
            matchReportText: principle.matchReportText,
            handbookText: principle.handbookText,
        });
    }
    return recommendations.sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
}
