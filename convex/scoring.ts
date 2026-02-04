import type { Doc } from "./_generated/dataModel";

const normalizeText = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s']/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const tokenize = (text: string) => {
    const normalized = normalizeText(text);
    return normalized.length ? normalized.split(" ") : [];
};

const countKeywordMatches = (text: string, keywords: string[]) => {
    const normalized = normalizeText(text);
    let matches = 0;
    for (const keyword of keywords) {
        const phrase = normalizeText(keyword);
        if (phrase && normalized.includes(phrase)) {
            matches += 1;
        }
    }
    return matches;
};

const wordOverlapScore = (target: string, answer: string) => {
    const targetTokens = tokenize(target);
    const answerTokens = tokenize(answer);
    const answerCounts = new Map<string, number>();

    for (const token of answerTokens) {
        answerCounts.set(token, (answerCounts.get(token) ?? 0) + 1);
    }

    let matches = 0;
    for (const token of targetTokens) {
        const remaining = answerCounts.get(token) ?? 0;
        if (remaining > 0) {
            matches += 1;
            answerCounts.set(token, remaining - 1);
        }
    }

    return { matches, max: targetTokens.length };
};

const scoreRubricText = (question: Doc<"questions">, text: string) => {
    const rubric = question.rubric ?? {};
    const wordCount = tokenize(text).length;
    let rawScore = 0;
    let maxScore = 0;
    const traitScores: Record<string, number> = {};

    const keyPhrases = [
        ...(rubric.keywords ?? []),
        ...(rubric.keypoints ?? []),
    ];

    if (keyPhrases.length) {
        const keywordMatches = countKeywordMatches(text, keyPhrases);
        rawScore += keywordMatches;
        maxScore += keyPhrases.length;
        traitScores.content = keyPhrases.length
            ? keywordMatches / keyPhrases.length
            : 0;
    }

    if (rubric.minWords || rubric.maxWords) {
        const minWords = rubric.minWords ?? 0;
        const maxWords = rubric.maxWords ?? Number.POSITIVE_INFINITY;
        const inRange = wordCount >= minWords && wordCount <= maxWords;
        rawScore += inRange ? 1 : 0;
        maxScore += 1;
        traitScores.form = inRange ? 1 : 0;
    }

    if (!maxScore) {
        maxScore = 1;
        rawScore = wordCount > 0 ? 1 : 0;
        traitScores.content = wordCount > 0 ? 1 : 0;
    }

    return { rawScore, maxScore, traitScores };
};

const scoreMultiChoice = (answer: string[], correct: string[]) => {
    const correctSet = new Set(correct);
    let correctSelected = 0;
    let incorrectSelected = 0;

    for (const option of answer) {
        if (correctSet.has(option)) {
            correctSelected += 1;
        } else {
            incorrectSelected += 1;
        }
    }

    const rawScore = Math.max(0, correctSelected - incorrectSelected);
    return { rawScore, maxScore: correct.length };
};

const scoreBlanks = (answers: string[], blanks: { answer: string }[]) => {
    let rawScore = 0;
    for (let i = 0; i < blanks.length; i += 1) {
        const expected = normalizeText(blanks[i].answer);
        const actual = normalizeText(answers[i] ?? "");
        if (expected && actual === expected) {
            rawScore += 1;
        }
    }
    return { rawScore, maxScore: blanks.length };
};

const scoreOrder = (answers: string[], correct: string[]) => {
    let rawScore = 0;
    for (let i = 0; i < correct.length; i += 1) {
        if (answers[i] === correct[i]) {
            rawScore += 1;
        }
    }
    return { rawScore, maxScore: correct.length };
};

const scoreHighlights = (answers: number[], correct: number[]) => {
    const correctSet = new Set(correct);
    let correctSelected = 0;
    let incorrectSelected = 0;
    for (const index of answers) {
        if (correctSet.has(index)) {
            correctSelected += 1;
        } else {
            incorrectSelected += 1;
        }
    }
    const rawScore = Math.max(0, correctSelected - incorrectSelected);
    return { rawScore, maxScore: correct.length };
};

export const scoreResponse = (
    question: Doc<"questions">,
    answer: unknown,
    transcript?: string,
) => {
    const inputMode = question.inputMode;
    const textAnswer =
        typeof answer === "string" && answer.length
            ? answer
            : (transcript ?? "");

    if (inputMode === "mcq_single") {
        const isCorrect = answer === question.correctAnswer;
        return {
            rawScore: isCorrect ? 1 : 0,
            maxScore: 1,
            traitScores: {},
        };
    }

    if (inputMode === "mcq_multi") {
        const selected = Array.isArray(answer) ? answer : [];
        const correct = Array.isArray(question.correctAnswer)
            ? question.correctAnswer
            : [];
        const scored = scoreMultiChoice(
            selected as string[],
            correct as string[],
        );
        return { ...scored, traitScores: {} };
    }

    if (
        inputMode === "fill_blanks_dropdown" ||
        inputMode === "fill_blanks_text"
    ) {
        const selected = Array.isArray(answer) ? answer : [];
        const blanks = question.blanks ?? [];
        const scored = scoreBlanks(selected as string[], blanks);
        return { ...scored, traitScores: {} };
    }

    if (inputMode === "reorder_paragraphs") {
        const selected = Array.isArray(answer) ? answer : [];
        const correct = Array.isArray(question.correctAnswer)
            ? question.correctAnswer
            : [];
        const scored = scoreOrder(selected as string[], correct as string[]);
        return { ...scored, traitScores: {} };
    }

    if (inputMode === "highlight_words") {
        const selected = Array.isArray(answer) ? answer : [];
        const correct = Array.isArray(question.correctAnswer)
            ? question.correctAnswer
            : [];
        const scored = scoreHighlights(
            selected as number[],
            correct as number[],
        );
        return { ...scored, traitScores: {} };
    }

    if (question.correctAnswer && typeof question.correctAnswer === "string") {
        const reference = question.correctAnswer;
        const { matches, max } = wordOverlapScore(reference, textAnswer);
        return {
            rawScore: matches,
            maxScore: max || 1,
            traitScores: {},
        };
    }

    if (Array.isArray(question.correctAnswer)) {
        const normalizedAnswer = normalizeText(textAnswer);
        const acceptable = question.correctAnswer
            .map((value) => normalizeText(String(value)))
            .filter(Boolean);
        const isCorrect = acceptable.some(
            (value) => value === normalizedAnswer,
        );
        return {
            rawScore: isCorrect ? 1 : 0,
            maxScore: 1,
            traitScores: {},
        };
    }

    const scored = scoreRubricText(question, textAnswer);
    return scored;
};
