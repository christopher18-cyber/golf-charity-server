export function countMatches(userScores, drawnNumbers) {
	return userScores((s) => drawnNumbers.includes(s.score)).length;
}
