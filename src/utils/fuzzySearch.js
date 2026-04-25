// Расстояние Левенштейна между двумя строками
const levenshtein = (a, b) => {
  const m = a.length;
  const n = b.length;
  const dp = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
};

// Возвращает оценку схожести от 0 до 1 (1 = точное совпадение)
export const fuzzyScore = (query, text) => {
  if (!query) return 1;

  const q = query.toLowerCase().trim();
  const t = text.toLowerCase().trim();

  if (!q) return 1;

  // Точное вхождение подстроки
  if (t.includes(q)) return 1;

  // Поиск по отдельным словам текста
  const words = t.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) return 0.95;
    if (word.includes(q)) return 0.9;
  }

  // Нечёткое совпадение на основе расстояния Левенштейна
  // Сравниваем запрос с каждым словом текста, берём лучший результат
  let bestWordScore = 0;
  for (const word of words) {
    const maxLen = Math.max(q.length, word.length);
    if (maxLen === 0) continue;
    const dist = levenshtein(q, word);
    const score = 1 - dist / maxLen;
    if (score > bestWordScore) bestWordScore = score;
  }

  // Также сравниваем запрос с полным текстом
  const fullMaxLen = Math.max(q.length, t.length);
  const fullScore = fullMaxLen > 0 ? 1 - levenshtein(q, t) / fullMaxLen : 0;

  return Math.max(bestWordScore, fullScore);
};

// Фильтрует массив записей по нечёткому поиску в поле workType
// threshold — минимальный порог схожести (0..1)
export const fuzzyFilter = (records, query, threshold = 0.35) => {
  if (!query || query.trim() === '') return records;

  const scored = records
    .map(record => ({
      ...record,
      _score: fuzzyScore(query.trim(), record.workType),
    }))
    .filter(record => record._score >= threshold)
    .sort((a, b) => b._score - a._score);

  return scored.map(({ _score, ...record }) => record);
};
