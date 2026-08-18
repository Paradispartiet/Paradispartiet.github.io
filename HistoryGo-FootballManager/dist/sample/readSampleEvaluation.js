// src/sample/readSampleEvaluation.ts
import { sampleEvaluation } from "./elite433Sample.js";
function getKeyReasons(reasons, limit = 3) {
    return [...reasons]
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, limit)
        .map((reason) => reason.label);
}
function toReadableFitSummary(result) {
    return {
        playerId: result.playerId,
        roleId: result.roleId,
        position: result.position,
        finalFit: result.finalFit,
        attributeFit: result.attributeFit,
        traitFit: result.traitFit,
        positionFit: result.positionFit,
        tacticFit: result.tacticFit,
        keyReasons: getKeyReasons(result.reasons),
    };
}
export function readSampleEvaluation(evaluation = sampleEvaluation) {
    return {
        teamId: evaluation.teamId,
        tacticId: evaluation.tacticId,
        isComplete: evaluation.isComplete,
        setupScore: evaluation.setupScore,
        summary: evaluation.summary,
        validAssignmentCount: evaluation.validAssignmentCount,
        totalAssignmentCount: evaluation.totalAssignmentCount,
        strengths: evaluation.strengths,
        issues: evaluation.issues.map((issue) => issue.label),
        teamBalance: {
            finalBalance: evaluation.teamBalance.finalBalance,
            attackingBalance: evaluation.teamBalance.attackingBalance,
            defensiveBalance: evaluation.teamBalance.defensiveBalance,
            midfieldControl: evaluation.teamBalance.midfieldControl,
            pressingCoherence: evaluation.teamBalance.pressingCoherence,
            widthBalance: evaluation.teamBalance.widthBalance,
            riskBalance: evaluation.teamBalance.riskBalance,
            keyReasons: getKeyReasons(evaluation.teamBalance.reasons, 5),
        },
        bestFits: evaluation.bestFits.map(toReadableFitSummary),
        worstFits: evaluation.worstFits.map(toReadableFitSummary),
    };
}
export const readableSampleEvaluation = readSampleEvaluation();
