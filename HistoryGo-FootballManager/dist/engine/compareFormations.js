// src/engine/compareFormations.ts
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
function groupTacticsByFormation(tactics) {
    const groups = new Map();
    for (const tactic of tactics) {
        const existing = groups.get(tactic.formation) ?? [];
        existing.push(tactic);
        groups.set(tactic.formation, existing);
    }
    return groups;
}
function getStatus(itemScore, bestScore) {
    if (itemScore === bestScore) {
        return "best_formation";
    }
    if (itemScore >= bestScore - 5) {
        return "strong_formation";
    }
    if (itemScore >= 65) {
        return "usable_formation";
    }
    return "weak_formation";
}
function buildItemSummary(formation, tactic, evaluation, averageRoleFit) {
    if (!evaluation.isComplete) {
        return `${formation} kan ikke vurderes fullt fordi startelleveren ikke er komplett.`;
    }
    if (evaluation.setupScore >= 85) {
        return `${formation} fungerer svært godt med ${tactic.name}. Rollenivå og lagbalanse peker i samme retning.`;
    }
    if (evaluation.setupScore >= 75) {
        return `${formation} fungerer godt med ${tactic.name}, men noen detaljer kan fortsatt forbedres.`;
    }
    if (evaluation.setupScore >= 65) {
        return `${formation} er brukbar med ${tactic.name}, men laget får ikke fullt utbytte. Gjennomsnittlig rollefit er ${averageRoleFit}.`;
    }
    return `${formation} passer svakt i dette oppsettet. Laget mister for mye kvalitet gjennom rollebruk eller balanse.`;
}
function getBestTacticForFormation(team, formation, tactics, roles) {
    const evaluated = tactics
        .map((tactic) => {
        const evaluation = evaluateTeamSetup({
            team,
            tactic,
            roles,
        });
        return {
            tactic,
            evaluation,
            averageRoleFit: getAverageRoleFit(evaluation),
        };
    })
        .sort((a, b) => b.evaluation.setupScore - a.evaluation.setupScore);
    const best = evaluated[0];
    if (!best) {
        throw new Error(`Ingen taktikker å vurdere for formasjonen ${formation}.`);
    }
    return {
        formation,
        bestTacticId: best.tactic.id,
        bestTacticName: best.tactic.name,
        setupScore: best.evaluation.setupScore,
        teamBalanceScore: best.evaluation.teamBalance.finalBalance,
        averageRoleFit: best.averageRoleFit,
        evaluatedTacticCount: evaluated.length,
        summary: buildItemSummary(formation, best.tactic, best.evaluation, best.averageRoleFit),
        strengths: best.evaluation.strengths,
        issues: best.evaluation.issues.map((issue) => issue.label),
        evaluation: best.evaluation,
    };
}
function buildSummary(items) {
    if (items.length === 0) {
        return "Ingen formasjoner ble vurdert.";
    }
    const best = items[0];
    if (!best) {
        return "Ingen formasjoner ble vurdert.";
    }
    const strongAlternatives = items.filter((item) => item.status === "strong_formation").length;
    if (best.setupScore >= 85) {
        return `${best.formation} er tydelig beste formasjon akkurat nå, særlig med ${best.bestTacticName}.`;
    }
    if (best.setupScore >= 75) {
        return `${best.formation} er beste formasjon akkurat nå, men laget har fortsatt forbedringspunkter.`;
    }
    if (strongAlternatives > 0) {
        return `${best.formation} er marginalt best, men laget har ${strongAlternatives} annet sterkt formasjonsalternativ.`;
    }
    return `${best.formation} er best av alternativene, men ingen formasjon gir fullgod utnyttelse av laget ennå.`;
}
export function compareFormations(input) {
    const groupedTactics = groupTacticsByFormation(input.tactics);
    const baseItems = [...groupedTactics.entries()]
        .map(([formation, tactics]) => getBestTacticForFormation(input.team, formation, tactics, input.roles))
        .sort((a, b) => b.setupScore - a.setupScore);
    const bestScore = baseItems[0]?.setupScore ?? 0;
    const items = baseItems.map((item) => ({
        ...item,
        status: getStatus(item.setupScore, bestScore),
    }));
    const bestFormation = items[0] ?? null;
    const alternatives = items.slice(1);
    return {
        teamId: input.team.id,
        bestFormation,
        alternatives,
        items,
        summary: buildSummary(items),
    };
}
