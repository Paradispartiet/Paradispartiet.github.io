// src/engine/selectFootballBookText.ts
const textFieldBySurface = {
    tooltip: "tooltipText",
    assistant: "assistantText",
    training: "trainingText",
    matchReport: "matchReportText",
    handbook: "handbookText",
};
const WEAK_POINT_ALIAS_GROUPS = [
    ["pressing_weak", "press_weak", "pressing_coherence_weak", "weak_pressing_coherence"],
    ["rest_defense_weak", "defensive_balance_weak", "weak_defensive_balance", "risk_balance_weak", "weak_risk_balance"],
    ["team_balance_weak", "defensive_balance_weak", "weak_defensive_balance", "risk_balance_weak", "weak_risk_balance"],
    ["relationships_weak", "role_balance_weak", "role_understanding_weak", "team_balance_weak"],
    ["role_fit_weak", "average_role_fit_weak", "individual_role_fit_weak", "weak_average_role_fit"],
    ["attack_weak", "attacking_balance_weak"],
    ["build_up_weak", "midfield_control_weak"],
    ["width_weak", "width_balance_weak", "weak_width_balance"],
];
const WEAK_POINT_ALIASES = WEAK_POINT_ALIAS_GROUPS.reduce((aliases, group) => {
    for (const code of group) {
        aliases[code] = group.filter((candidate) => candidate !== code);
    }
    return aliases;
}, {});
function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function normalize(value) {
    return value.trim().toLowerCase();
}
function expandWeakPointCodes(codes = []) {
    const result = new Set();
    for (const code of codes) {
        const normalized = normalize(code);
        result.add(normalized);
        for (const alias of WEAK_POINT_ALIASES[normalized] ?? []) {
            result.add(normalize(alias));
        }
    }
    return result;
}
function toNormalizedSet(values = []) {
    return new Set(values.map(normalize).filter(Boolean));
}
function hasIntersection(values, candidates) {
    return values.some((value) => candidates.has(normalize(value)));
}
function surfaceAllowsMatch(surface, matchType) {
    if (surface === "assistant" || surface === "matchReport") {
        return matchType === "weakPoint";
    }
    if (surface === "training") {
        return matchType === "weakPoint" || matchType === "trainingArea";
    }
    return true;
}
function scorePrinciple(principle, context) {
    const weakPoints = expandWeakPointCodes(context.weakPoints);
    const matchesWeakPoint = weakPoints.size > 0 && hasIntersection(principle.appliesToWeakPoints, weakPoints);
    const trainingAreas = toNormalizedSet(context.trainingAreas);
    const matchesTrainingArea = trainingAreas.size > 0 && hasIntersection(principle.appliesToTrainingAreas, trainingAreas);
    if (weakPoints.size > 0 && !matchesWeakPoint) {
        return null;
    }
    if (context.surface === "training" && weakPoints.size > 0 && trainingAreas.size > 0) {
        if (matchesWeakPoint && matchesTrainingArea) {
            return "weakPoint";
        }
        return null;
    }
    if (matchesWeakPoint) {
        return surfaceAllowsMatch(context.surface, "weakPoint") ? "weakPoint" : null;
    }
    if (matchesTrainingArea) {
        return surfaceAllowsMatch(context.surface, "trainingArea") ? "trainingArea" : null;
    }
    const tags = toNormalizedSet(context.relatedTags);
    if (tags.size > 0 && hasIntersection(principle.relatedTags, tags)) {
        return surfaceAllowsMatch(context.surface, "tag") ? "tag" : null;
    }
    return null;
}
function matchScore(matchType, principle, context) {
    const base = matchType === "weakPoint" ? 300 : matchType === "trainingArea" ? 200 : 100;
    const phaseBonus = context.phase && principle.phase === context.phase ? 25 : 0;
    return base + phaseBonus;
}
/**
 * Matcher tilpasset Fotballboka-spilltekst mot eksisterende spillkontekst.
 * Prioritet er bevisst: weak points først, deretter training areas, deretter
 * tags. På treningsflaten må en oppgitt weakPoint og en oppgitt øktflate
 * peke på samme prinsipp, slik at teksten både forklarer problemet og passer
 * eksisterende treningsområde. Uten eksplisitt match returneres ingen teori,
 * bare eksisterende fallback.
 */
export function getFootballBookGameText(context) {
    const field = textFieldBySurface[context.surface];
    const maxResults = context.maxResults ?? (context.surface === "handbook" ? 2 : 1);
    const principles = context.principles ?? [];
    return principles
        .map((principle) => {
        const text = principle[field];
        if (!hasText(text))
            return null;
        const matchType = scorePrinciple(principle, context);
        if (!matchType)
            return null;
        return {
            principleId: principle.id,
            title: principle.title,
            text,
            score: matchScore(matchType, principle, context),
            matchType,
        };
    })
        .filter((match) => match !== null)
        .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
        .slice(0, Math.max(0, maxResults));
}
/**
 * Bakoverkompatibel helper for kode som allerede har valgt et prinsipp.
 */
export function selectFootballBookText(input) {
    const field = textFieldBySurface[input.context];
    const value = input.principle?.[field];
    if (hasText(value)) {
        return value;
    }
    return input.existingFeedback;
}
