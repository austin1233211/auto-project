export const ARTIFACT_ROUNDS = new Set([3, 8, 13]);
export const MINION_ROUNDS = new Set([5, 10, 15, 20]);

export function isArtifactRound(roundNumber) {
  return ARTIFACT_ROUNDS.has(roundNumber);
}

export function isMinionRound(roundNumber) {
  return MINION_ROUNDS.has(roundNumber);
}

export function isSpecialRound(roundNumber) {
  return isArtifactRound(roundNumber) || isMinionRound(roundNumber);
}
