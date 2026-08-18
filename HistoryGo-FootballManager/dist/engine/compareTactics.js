// src/engine/compareTactics.ts
import { evaluateTeamSetup } from "./evaluateTeamSetup.js";
function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}
function average(values, fallback = 0) {
    if (values.length === 0)
        return fallback;
    return clampScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}
function getAverageRoleFit(evaluation) {
    return average(evaluation.roleFitResults.map((result) => result.finalFit), 0);
}
function getStatus(itemScore, bestScore) {
    if (itemScore === bestScore) {
        return "best_fit";
    }
    if (itemScore >= bestScore - 5) {
        return "strong_option";
    }
    if (itemScore >= 65) {
        return "usable_option";
    }
    return "weak_option";
}
function buildItemSummary(tactic, evaluation, averageRoleFit) {
    if (!evaluation.isComplete) {
        return `${tactic.name} kan ikke vurderes fullt fordi startelleveren ikke er komplett.`;
    }
    if (evaluation.setupScore >= 85) {
        return `${tactic.name} passer svært godt. Lagbalanse og rollebruk peker tydelig i samme retning.`;
    }
    if (evaluation.setupScore >= 75) {
        return `${tactic.name} passer godt, men har fortsatt noen justeringspunkter.`;
    }
    if (evaluation.setupScore >= 65) {
        return `${tactic.name} fungerer brukbart, men laget får ikke fullt utbytte av spillerne. Gjennomsnittlig rollefit er ${averageRoleFit}.`;
    }
    return `${tactic.name} passer svakt. Oppsettet skjuler for mye kvalitet gjennom rollebruk eller lagbalanse.`;
}
function toComparisonItem(team, tactic, roles) {
    const evaluation = evaluateTeamSetup({
        team,
        tactic,
        roles,
    });
    const averageRoleFit = getAverageRoleFit(evaluation);
    return {
        tacticId: tactic.id,
        tacticName: tactic.name,
        formation: tactic.formation,
        setupScore: evaluation.setupScore,
        teamBalanceScore: evaluation.teamBalance.finalBalance,
        averageRoleFit,
        summary: buildItemSummary(tactic, evaluation, averageRoleFit),
        strengths: evaluation.strengths,
        issues: evaluation.issues.map((issue) => issue.label),
        evaluation,
    };
}
function buildSummary(items) {
    if (items.length === 0) {
        return "Ingen taktikker ble vurdert.";
    }
    const best = items[0];
    if (!best) {
        return "Ingen taktikker ble vurdert.";
    }
    const strongAlternatives = items.filter((item) => item.status === "strong_option").length;
    if (best.setupScore >= 85) {
        return `${best.tacticName} er tydelig beste taktikk for laget akkurat nå. Den gir ${best.setupScore} i setup-score.`;
    }
    if (best.setupScore >= 75) {
        return `${best.tacticName} er beste taktikk akkurat nå, men laget har fortsatt forbedringspunkter.`;
    }
    if (strongAlternatives > 0) {
        return `${best.tacticName} er marginalt best, men laget har ${strongAlternatives} annet sterkt taktisk alternativ.`;
    }
    return `${best.tacticName} er best av alternativene, men ingen taktikk gir fullgod utnyttelse av laget ennå.`;
}
export function compareTactics(input) {
    const baseItems = input.tactics
        .map((tactic) => toComparisonItem(input.team, tactic, input.roles))
        .sort((a, b) => b.setupScore - a.setupScore);
    const bestScore = baseItems[0]?.setupScore ?? 0;
    const items = baseItems.map((item) => ({
        ...item,
        status: getStatus(item.setupScore, bestScore),
    }));
    const bestTactic = items[0] ?? null;
    const alternatives = items.slice(1);
    return {
        teamId: input.team.id,
        bestTactic,
        alternatives,
        items,
        summary: buildSummary(items),
    };
}
