const DATA_URL = "./marketer_survival_v3_data.json";
const STORY_OVERLAY_URL = "./marketer_survival_story_card_patch_v2.json";

const effectLabels = {
  money: "돈",
  score: "EXP",
  mental: "멘탈",
  trust: "신뢰",
  budgetControl: "예산관리",
  performance: "퍼포먼스",
  content: "콘텐츠",
  brand: "브랜드",
  politics: "사내정치",
  operations: "운영력",
  budgetRisk: "예산위험",
  approvalRisk: "컨펌위험",
  brandRisk: "브랜드위험",
  reportPressure: "보고압박",
  operationRisk: "운영위험",
  burnoutRisk: "번아웃위험",
};

const categoryPressure = {
  예산: { budgetRisk: 2, reportPressure: 1, money: -5000 },
  보고: { reportPressure: 2, trust: -1 },
  운영: { operationRisk: 2, mental: -1 },
  컨펌: { approvalRisk: 2, mental: -1 },
  브랜드: { brandRisk: 2, trust: -1 },
  반응: { reportPressure: 1 },
  콘텐츠: { approvalRisk: 1, burnoutRisk: 1 },
  기회: { reportPressure: 1 },
};

const outcomeToneByCategory = {
  예산: {
    matched: "예산 흐름을 크게 흔들지 않고 정리했습니다.",
    missed: "숫자는 남겼지만 예산 판단은 조금 애매해졌습니다.",
  },
  보고: {
    matched: "보고할 근거를 하나 만들었습니다.",
    missed: "설명은 가능하지만 핵심 질문은 조금 남았습니다.",
  },
  운영: {
    matched: "일이 터지기 전에 정리했습니다.",
    missed: "급한 불은 껐지만 뒤처리가 필요합니다.",
  },
  컨펌: {
    matched: "컨펌 리스크를 낮추는 쪽으로 움직였습니다.",
    missed: "방향은 잡았지만 다시 물어볼 여지가 남았습니다.",
  },
  브랜드: {
    matched: "톤을 크게 망치지 않고 다음 선택지를 남겼습니다.",
    missed: "반응은 노렸지만 브랜드 쪽 부담이 조금 생겼습니다.",
  },
  반응: {
    matched: "멈춰 보게 만들 단서를 잡았습니다.",
    missed: "반응을 보려 했지만 아직 결정적인 숫자는 아닙니다.",
  },
  콘텐츠: {
    matched: "소재를 더 써볼 만한 방향으로 다듬었습니다.",
    missed: "아이디어는 남겼지만 바로 성과로 이어지진 않았습니다.",
  },
  기회: {
    matched: "올라온 흐름을 놓치지 않았습니다.",
    missed: "기회는 살렸지만 리스크도 조금 따라왔습니다.",
  },
};

const els = {
  roundLabel: document.querySelector("#roundLabel"),
  phaseLabel: document.querySelector("#phaseLabel"),
  moneyValue: document.querySelector("#moneyValue"),
  mentalValue: document.querySelector("#mentalValue"),
  performanceValue: document.querySelector("#performanceValue"),
  trustValue: document.querySelector("#trustValue"),
  moneyBar: document.querySelector("#moneyBar"),
  mentalBar: document.querySelector("#mentalBar"),
  performanceBar: document.querySelector("#performanceBar"),
  trustBar: document.querySelector("#trustBar"),
  buildStats: document.querySelector("#buildStats"),
  riskStats: document.querySelector("#riskStats"),
  recentCards: document.querySelector("#recentCards"),
  situationCategory: document.querySelector("#situationCategory"),
  situationRisk: document.querySelector("#situationRisk"),
  situationName: document.querySelector("#situationName"),
  situationText: document.querySelector("#situationText"),
  advisorText: document.querySelector("#advisorText"),
  advisorName: document.querySelector("#advisorName"),
  stageHeading: document.querySelector("#stageHeading"),
  stageSubcopy: document.querySelector("#stageSubcopy"),
  cardChoices: document.querySelector("#cardChoices"),
  confirmChoiceButton: document.querySelector("#confirmChoiceButton"),
  startScreen: document.querySelector("#startScreen"),
  startButton: document.querySelector("#startButton"),
  turnResult: document.querySelector("#turnResult"),
  turnResultBadge: document.querySelector("#turnResultBadge"),
  turnResultTitle: document.querySelector("#turnResultTitle"),
  turnResultText: document.querySelector("#turnResultText"),
  turnResultDelta: document.querySelector("#turnResultDelta"),
  continueButton: document.querySelector("#continueButton"),
  logList: document.querySelector("#logList"),
  restartButton: document.querySelector("#restartButton"),
  modalRestartButton: document.querySelector("#modalRestartButton"),
  resultModal: document.querySelector("#resultModal"),
  resultBadge: document.querySelector("#resultBadge"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  resultStats: document.querySelector("#resultStats"),
};

let data;
let storyOverlay;
let state;

async function boot() {
  const response = await fetch(DATA_URL);
  data = await response.json();
  storyOverlay = await loadStoryOverlay();
  mergeStoryPatch();
  state = initialState("intro");
  render();
}

async function loadStoryOverlay() {
  try {
    const response = await fetch(STORY_OVERLAY_URL);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function mergeStoryPatch() {
  if (!storyOverlay) return;

  if (storyOverlay.newCards?.length) {
    const existingIds = new Set(data.cards.map((card) => card.id));
    data.cards = [...data.cards, ...storyOverlay.newCards.filter((card) => !existingIds.has(card.id))];
  }

  if (storyOverlay.newSituations?.length) {
    const existingIds = new Set(data.situations.map((situation) => situation.id));
    data.situations = [...data.situations, ...storyOverlay.newSituations.filter((situation) => !existingIds.has(situation.id))];
  }



  if (storyOverlay.stageDefaultsPatch) {
    data.stageDefaults = deepMerge(data.stageDefaults, storyOverlay.stageDefaultsPatch);
  }

    const patches = normalizeCardPatches(storyOverlay.cardPatches);
  for (const [cardId, patch] of Object.entries(patches)) {
    const index = data.cards.findIndex((card) => card.id === cardId);
    if (index === -1) continue;
    data.cards[index] = deepMerge(data.cards[index], patch);
  }
}

function normalizeCardPatches(cardPatches) {
  if (!cardPatches) return {};
  if (!Array.isArray(cardPatches)) return cardPatches;
  return Object.fromEntries(cardPatches.map((patch) => [patch.id, patch]));
}

function deepMerge(base, patch) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (key === "id") continue;
    if (isPlainObject(value) && isPlainObject(base[key])) merged[key] = deepMerge(base[key], value);
    else merged[key] = value;
  }
  return merged;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function initialState(screen = "choice") {
  const defaults = data.stageDefaults;
  return {
    screen,
    round: 1,
    money: defaults.startingMoney,
    score: defaults.startingScore,
    mental: defaults.startingMental,
    trust: defaults.startingTrust,
    build: Object.fromEntries(data.buildStats.map((key) => [key, 2])),
    risk: Object.fromEntries(data.riskStats.map((key) => [key, 0])),
    recentCards: [],
    recentOfferedCards: [],
    recentChoiceSets: [],
    recentSituations: [],
    recentTags: [],
    triggeredSynergies: new Set(),
    currentSituation: null,
    currentStoryRound: null,
    offeredCards: [],
    selectedCardId: null,
    turnResult: null,
    logs: [],
    finished: false,
  };
}

function startGame() {
  state = initialState("choice");
  addLog("입사 첫날", "첫 업무는 작은 광고 테스트. 예산은 적고, 팀장님 기대는 생각보다 큽니다.");
  nextRound();
}

function nextRound() {
  if (shouldFinish()) {
    finishGame();
    return;
  }

  state.currentSituation = pickSituation();
  state.currentStoryRound = state.currentSituation.storyRound || null;
  state.offeredCards = pickCards(state.currentSituation);
  state.selectedCardId = state.offeredCards[0]?.id || null;
  state.recentOfferedCards = [...state.offeredCards.map((card) => ({ id: card.id, name: card.name, round: state.round })), ...state.recentOfferedCards].slice(0, 12);
  state.recentSituations = [state.currentSituation.id, ...state.recentSituations].slice(0, 2);
  render();
}

function shouldFinish() {
  return state.round > data.stageDefaults.rounds || state.mental <= 0 || state.money <= 0 || state.trust <= 0;
}

function pickSituation() {
  const storyRound = getStoryRound();
  if (storyRound) return buildStorySituation(storyRound);

  const weighted = data.situations.map((item) => {
    let weight = 1;
    weight += item.preferredTags.filter((tag) => state.recentTags.includes(tag)).length * 0.8;
    if (state.recentSituations.includes(item.id)) weight -= 2;
    if (state.money < data.stageDefaults.clearConditions.moneyGte && item.category === "예산") weight += 2;
    if (state.score < state.round / 2 && item.category === "보고") weight += 2;
    if (state.mental <= 4 && item.category === "운영") weight += 1.5;
    if (state.trust <= 3 && item.category === "컨펌") weight += 1.5;

    const pressure = categoryPressure[item.category] || {};
    for (const key of data.riskStats) {
      if (pressure[key] > 0) weight += state.risk[key] * 0.5;
    }

    return { item, weight: Math.max(0.15, weight) };
  });

  return weightedPick(weighted);
}

function getStoryRound() {
  if (!storyOverlay?.storyRounds?.length) return null;
  return storyOverlay.storyRounds.find((round) => round.round === state.round) || null;
}

function buildStorySituation(storyRound) {
  const linked = data.situations.find((item) => item.id === storyRound.linkedSituationId || item.id === storyRound.situationId);
  const variantText = pickVariantText(storyRound);
  return {
    id: storyRound.id,
    name: storyRound.title,
    category: linked?.category || inferCategoryFromTags(storyRound.situationTags),
    phase: storyRound.phase,
    speaker: storyRound.speaker,
    line: storyRound.line,
    description: variantText,
    preferredTags: storyRound.situationTags || linked?.preferredTags || [],
    storyRound,
  };
}

function pickVariantText(storyRound) {
  const rules = [...(storyRound.variantRules || storyRound.variants || [])].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const matched = rules.find((rule) => matchesVariantCondition(rule.condition));
  return matched?.text || storyRound.baseText;
}

function matchesVariantCondition(condition) {
  if (!condition || condition === "default") return true;
  if (condition.moneyLte !== undefined && state.money > condition.moneyLte) return false;
  if (condition.moneyGte !== undefined && state.money < condition.moneyGte) return false;
  if (condition.scoreLte !== undefined && state.score > condition.scoreLte) return false;
  if (condition.scoreGte !== undefined && state.score < condition.scoreGte) return false;
  if (condition.trustLte !== undefined && state.trust > condition.trustLte) return false;
  if (condition.trustGte !== undefined && state.trust < condition.trustGte) return false;
  if (condition.mentalLte !== undefined && state.mental > condition.mentalLte) return false;
  if (condition.mentalGte !== undefined && state.mental < condition.mentalGte) return false;
  if (condition.statLte) {
    for (const [key, value] of Object.entries(condition.statLte)) {
      if ((state[key] || 0) > value) return false;
    }
  }
  if (condition.statGte) {
    for (const [key, value] of Object.entries(condition.statGte)) {
      if ((state[key] || 0) < value) return false;
    }
  }
  if (condition.buildGte) {
    for (const [key, value] of Object.entries(condition.buildGte)) {
      if ((state.build[key] || 0) < value) return false;
    }
  }
  if (condition.buildLte) {
    for (const [key, value] of Object.entries(condition.buildLte)) {
      if ((state.build[key] || 0) > value) return false;
    }
  }
  if (condition.buildDiff) {
    const [left, right, diff] = condition.buildDiff;
    if ((state.build[left] || 0) - (state.build[right] || 0) < diff) return false;
  }
  return true;
}

function inferCategoryFromTags(tags = []) {
  if (tags.includes("운영") || tags.includes("파일관리")) return "운영";
  if (tags.includes("예산")) return "예산";
  if (tags.includes("보고")) return "보고";
  if (tags.includes("컨펌")) return "컨펌";
  if (tags.includes("브랜드")) return "브랜드";
  if (tags.includes("반응") || tags.includes("성과")) return "반응";
  return "콘텐츠";
}

function pickCards(situation) {
  if (normalizeCardSlots(situation.storyRound?.cardSlots).length) return pickStoryCards(situation.storyRound);

  const preferred = data.cards.filter((card) => card.tags.some((tag) => situation.preferredTags.includes(tag)));
  const picks = shuffle(preferred).slice(0, 2);
  const randomPool = data.cards.filter((card) => !picks.includes(card));
  picks.push(weightedPick(randomPool.map((card) => ({ item: card, weight: cardWeight(card, situation) }))));
  return shuffle(uniqueById(picks)).slice(0, 3);
}

function pickStoryCards(storyRound) {
  if (storyRound.choiceSets?.length) return pickChoiceSetCards(storyRound);

  const slots = normalizeCardSlots(storyRound.cardSlots);
  const allCandidates = flattenStoryCandidates(storyRound, slots);
  const picked = [];

  const coreSlot = slots.find((slot) => ["핵심", "정석", "main"].includes(slot.role));
  if (coreSlot && Math.random() < 0.75) {
    const coreCandidates = coreSlot.candidateCardIds
      .map((id) => data.cards.find((card) => card.id === id))
      .filter(Boolean);
    if (coreCandidates.length) {
      const pickedCore = weightedPick(coreCandidates.map((card) => ({
        item: attachChoiceMeta(card, coreSlot.role),
        weight: storyCardWeight(card, storyRound, coreSlot.role),
      })));
      picked.push(pickedCore);
    }
  }

  while (picked.length < 3 && allCandidates.length) {
    const candidates = allCandidates
      .filter(({ card }) => !picked.some((item) => item.id === card.id))
      .filter(({ card }) => canAddCardWithoutCategoryFlood(card, picked));

    if (!candidates.length) break;

    const selected = weightedPick(candidates.map(({ card, role }) => ({
      item: attachChoiceMeta(card, role),
      weight: storyCardWeight(card, storyRound, role),
    })));
    picked.push(selected);
  }

  return fillChoiceFallback(picked, storyRound).slice(0, 3);
}

function pickChoiceSetCards(storyRound) {
  const sets = storyRound.choiceSets.filter((set) => matchesVariantCondition(set.condition || "default"));
  const selectedSet = weightedPick(sets.map((set) => ({
    item: set,
    weight: choiceSetWeight(set, storyRound),
  })));

  state.recentChoiceSets = [{ id: selectedSet.id, round: state.round }, ...state.recentChoiceSets].slice(0, 6);

  const picked = [];
  for (const choice of selectedSet.choices || []) {
    const pool = (choice.cardIds || [])
      .map((id) => data.cards.find((card) => card.id === id))
      .filter(Boolean)
      .filter((card) => !picked.some((item) => item.id === card.id));

    if (!pool.length) continue;
    const selected = weightedPick(pool.map((card) => ({
      item: attachChoiceMeta(card, choice.role || selectedSet.label || "선택"),
      weight: storyCardWeight(card, storyRound, choice.role || selectedSet.label || "선택") * offeredPenalty(card),
    })));
    picked.push(selected);
  }

  return fillChoiceFallback(picked, storyRound).slice(0, 3);
}

function choiceSetWeight(set, storyRound) {
  let weight = set.weight || 1;
  const recent = state.recentChoiceSets.find((item) => item.id === set.id);
  if (recent) {
    const age = state.round - recent.round;
    if (age <= 2) weight *= 0.35;
    else if (age <= 4) weight *= 0.65;
  }

  const allIds = (set.choices || []).flatMap((choice) => choice.cardIds || []);
  const stateBonus = allIds
    .map((id) => data.cards.find((card) => card.id === id))
    .filter(Boolean)
    .reduce((sum, card) => sum + getStateNeedBonus(card) * 0.12, 0);
  return Math.max(0.1, weight + stateBonus);
}

function offeredPenalty(card) {
  const recent = state.recentOfferedCards?.find((item) => item.id === card.id || item.name === card.name);
  if (!recent) return 1;
  const age = state.round - recent.round;
  if (age <= 1) return 0.1;
  if (age <= 2) return 0.3;
  if (age <= 3) return 0.55;
  return 0.8;
}

function fillChoiceFallback(picked, storyRound) {
  const fallbackPool = data.cards
    .filter((card) => !picked.some((item) => item.id === card.id))
    .filter((card) => canAddCardWithoutCategoryFlood(card, picked))
    .filter((card) => !card.badFits?.some((tag) => (storyRound.situationTags || []).includes(tag)));

  while (picked.length < 3 && fallbackPool.length) {
    const selected = weightedPick(fallbackPool.map((card) => ({
      item: attachChoiceMeta(card, "보정"),
      weight: Math.max(0.1, cardWeight(card, { preferredTags: storyRound.situationTags || [] }) * 0.25 * offeredPenalty(card)),
    })));
    picked.push(selected);
    const idx = fallbackPool.findIndex((card) => card.id === selected.id);
    if (idx >= 0) fallbackPool.splice(idx, 1);
  }
  return picked;
}

function flattenStoryCandidates(storyRound, slots) {
  const map = new Map();
  for (const slot of slots) {
    for (const id of slot.candidateCardIds || []) {
      const card = data.cards.find((item) => item.id === id);
      if (!card) continue;
      const existing = map.get(card.id);
      if (existing) existing.roles.push(slot.role);
      else map.set(card.id, { card, roles: [slot.role] });
    }
  }
  return [...map.values()].map(({ card, roles }) => ({ card, role: roles[0] }));
}

function attachChoiceMeta(card, role) {
  return { ...card, _choiceRole: normalizeChoiceRole(role) };
}

function normalizeChoiceRole(role = "선택") {
  const mapping = {
    핵심: "핵심 대응",
    정석: "정석 대응",
    맥락: "맥락 대응",
    방어: "방어 대응",
    정리: "정리 대응",
    상태보정: "상태 대응",
    공격: "공격 대응",
    리스크: "리스크 대응",
    보정: "보정 선택",
  };
  return mapping[role] || `${role} 대응`;
}

function canAddCardWithoutCategoryFlood(card, picked) {
  return picked.filter((item) => item.category === card.category).length < 2;
}

function storyCardWeight(card, storyRound, role) {
  let weight = 1;
  const tags = storyRound.situationTags || [];
  const fits = card.fits || [];
  const badFits = card.badFits || [];

  weight += card.tags.filter((tag) => tags.includes(tag)).length * 1.2;
  weight += fits.filter((tag) => tags.includes(tag)).length * 1.8;
  if (badFits.some((tag) => tags.includes(tag))) weight *= 0.25;

  // 슬롯별 기본값. 핵심은 살리되 매번 고정되지 않도록 과하게 높이지 않는다.
  if (["핵심", "정석", "main"].includes(role)) weight += 1.2;
  if (["맥락", "정리"].includes(role)) weight += 0.9;
  if (["상태보정", "보정"].includes(role)) weight += getStateNeedBonus(card) * 1.4;
  else weight += getStateNeedBonus(card) * 0.8;

  // 최근 카드 반복 방지
  const recentPick = state.recentCards.find((recent) => recent.name === card.name);
  if (recentPick) {
    const age = state.round - recentPick.round;
    if (age <= 1) weight *= 0.15;
    else if (age <= 2) weight *= 0.35;
    else if (age <= 3) weight *= 0.65;
  }

  const lastCardName = state.recentCards[0]?.name;
  const lastCard = data.cards.find((item) => item.name === lastCardName);
  if (lastCard && lastCard.category === card.category) weight *= 0.7;

  return Math.max(0.05, weight);
}

function getStateNeedBonus(card) {
  let bonus = 0;
  if (state.money < data.stageDefaults.clearConditions.moneyGte && card.risk.budgetRisk < 0) bonus += 2;
  if (state.score < Math.max(4, state.round * 0.75) && card.score[1] >= 2) bonus += 1.8;
  if (state.mental <= 5 && card.secondary.mental > 0) bonus += 1.8;
  if (state.trust <= 4 && card.secondary.trust > 0) bonus += 1.6;

  const lowBuilds = Object.entries(state.build).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([key]) => key);
  for (const key of lowBuilds) {
    if ((card.build[key] || 0) > 0) bonus += 0.9;
  }
  return bonus;
}

function normalizeCardSlots(cardSlots) {
  if (!cardSlots) return [];
  if (Array.isArray(cardSlots)) return cardSlots;
  return Object.entries(cardSlots).map(([role, candidateCardIds]) => ({ role, candidateCardIds }));
}

function cardWeight(card, situation) {
  let weight = 1 + card.tags.filter((tag) => situation.preferredTags.includes(tag)).length;
  if (card.fits) weight += card.fits.filter((tag) => situation.preferredTags.includes(tag)).length * 1.5;
  if (card.badFits?.some((tag) => situation.preferredTags.includes(tag))) weight *= 0.3;
  if (state.money < data.stageDefaults.clearConditions.moneyGte && card.risk.budgetRisk < 0) weight += 1.5;
  if (state.score < 6 && card.score[1] >= 2) weight += 1.3;
  if (state.mental <= 4 && card.secondary.mental > 0) weight += 1.5;
  if (state.trust <= 3 && card.secondary.trust > 0) weight += 1.5;
  const recentPick = state.recentCards.find((recent) => recent.name === card.name);
  if (recentPick && state.round - recentPick.round <= 2) weight *= 0.35;
  return Math.max(0.05, weight);
}

function isCardContextMatch(card, situation) {
  const storyRound = situation.storyRound;
  const situationTags = situation.preferredTags || [];
  if (card.badFits?.some((tag) => situationTags.includes(tag))) return false;
  const inStorySlot = storyRound && normalizeCardSlots(storyRound.cardSlots)
    .some((slot) => slot.candidateCardIds?.includes(card.id));
  if (inStorySlot) return true;
  if (card.fits?.some((tag) => situationTags.includes(tag))) return true;
  return card.tags.some((tag) => situationTags.includes(tag));
}

const categoryBuildKey = {
  "예산관리": "budgetControl",
  "퍼포먼스": "performance",
  "콘텐츠": "content",
  "브랜드": "brand",
  "사내정치": "politics",
  "운영력": "operations",
  "보고": "politics",
};

const categoryRiskKey = {
  "예산관리": "budgetRisk",
  "퍼포먼스": "budgetRisk",
  "콘텐츠": "approvalRisk",
  "브랜드": "brandRisk",
  "사내정치": "reportPressure",
  "운영력": "operationRisk",
  "보고": "reportPressure",
};

const roleLabels = {
  prep: "준비",
  improve: "개선",
  revenue: "수익",
  defense: "방어",
  report: "보고",
  gamble: "도박",
};

const routeLabels = {
  test_route: "테스트형",
  content_burst: "콘텐츠 폭발형",
  conversion_route: "전환형",
  brand_stable: "브랜드 안정형",
  politics_route: "정치 생존형",
  ops_route: "운영 안정형",
  budget_route: "예산 관리형",
};

const roleOutcomeProbabilities = {
  prep: { bigFail: 2, fail: 8, breakEven: 60, success: 27, bigSuccess: 3 },
  defense: { bigFail: 1, fail: 9, breakEven: 65, success: 23, bigSuccess: 2 },
  improve: { bigFail: 6, fail: 18, breakEven: 38, success: 30, bigSuccess: 8 },
  revenue: { bigFail: 12, fail: 24, breakEven: 27, success: 25, bigSuccess: 12 },
  gamble: { bigFail: 18, fail: 25, breakEven: 20, success: 22, bigSuccess: 15 },
  report: { bigFail: 3, fail: 12, breakEven: 50, success: 30, bigSuccess: 5 },
};

const moneyWeightScale = {
  low: 0.25,
  lowMid: 0.52,
  mid: 0.82,
  high: 1.25,
  veryHigh: 1.45,
  eval: 0.45,
};

function calculateEarnedMoney(card, situation, baseEarned, cost, matched) {
  const mainKey = categoryBuildKey[card.category];
  const mainStat = mainKey ? state.build[mainKey] || 0 : 2;
  const supportStat = getSupportStat(card);
  const riskKey = categoryRiskKey[card.category];
  const riskValue = riskKey ? state.risk[riskKey] || 0 : 0;
  const role = card.role || outcomeProfileType(card);
  const routeCombo = getRouteCombo(card);
  const moneyWeight = situation.storyRound?.moneyWeight || "mid";
  const roundScale = moneyWeightScale[moneyWeight] ?? 0.72;

  let multiplier = 1;
  multiplier *= 0.74 + Math.min(mainStat, 10) * 0.045;
  multiplier *= 0.86 + Math.min(supportStat, 10) * 0.024;
  multiplier *= matched ? 1.05 : 0.58;
  multiplier *= Math.max(0.62, 1 - riskValue * 0.052);
  multiplier *= roundScale;
  multiplier *= routeCombo.multiplier;

  // 준비 없이 큰돈을 쓰면 회수 실패 가능성을 확실히 키운다.
  if (cost >= 50000 && mainStat < 4) multiplier *= 0.58;
  if (cost >= 50000 && (state.build.budgetControl || 0) < 4) multiplier *= 0.76;
  if ((role === "revenue" || role === "gamble") && state.score < 6 && !routeCombo.count) multiplier *= 0.82;
  if (card.category === "퍼포먼스" && (state.build.performance || 0) < 4 && (state.build.content || 0) < 4) multiplier *= 0.72;
  if (role === "prep" || role === "defense" || role === "report") multiplier *= 0.82;

  const profile = storyOverlay?.earnedMultiplierProfile || {};
  const minMultiplier = profile.minMultiplier ?? 0.12;
  const maxMultiplier = profile.maxMultiplier ?? 1.7;
  multiplier = Math.max(minMultiplier, Math.min(maxMultiplier, multiplier));

  const tier = pickOutcomeTier(card, matched, mainStat, supportStat, riskValue, routeCombo);
  const tierMultiplier = rollRange(outcomeTierMultiplierRange(tier), 0.05);
  const amount = Math.max(0, Math.round((baseEarned * multiplier * tierMultiplier) / 1000) * 1000);

  return {
    amount,
    baseEarned,
    multiplier,
    tierMultiplier,
    tier,
    outcome: tier.id,
    role,
    mainKey,
    mainStat,
    supportStat,
    riskKey,
    riskValue,
    matched,
    moneyWeight,
    roundScale,
    routeCombo,
    probabilities: tier.probabilities,
  };
}

const outcomeTierMeta = {
  bigFail: { label: "대실패", className: "tier-big-fail" },
  fail: { label: "실패", className: "tier-fail" },
  breakEven: { label: "본전", className: "tier-break-even" },
  success: { label: "성공", className: "tier-success" },
  bigSuccess: { label: "대성공", className: "tier-big-success" },
};

function pickOutcomeTier(card, matched, mainStat, supportStat, riskValue, routeCombo = { count: 0 }) {
  const probabilities = outcomeTierProbabilities(card, matched, mainStat, supportStat, riskValue, routeCombo);
  const roll = Math.random() * 100;
  let cursor = 0;
  for (const [id, value] of Object.entries(probabilities)) {
    cursor += value;
    if (roll <= cursor) return { id, ...outcomeTierMeta[id], probabilities };
  }
  return { id: "breakEven", ...outcomeTierMeta.breakEven, probabilities };
}

function outcomeTierProbabilities(card, matched, mainStat, supportStat, riskValue, routeCombo = { count: 0 }) {
  const role = card.role || outcomeProfileType(card);
  const base = { ...(roleOutcomeProbabilities[role] || roleOutcomeProbabilities.improve) };
  const p = { ...base };

  const expStage = Math.min(4, Math.floor((state.score || 0) / 5));
  p.bigFail -= expStage * 0.5;
  p.fail -= expStage * 1;
  p.breakEven -= expStage * 0.5;
  p.success += expStage * 1.2;
  p.bigSuccess += expStage * 0.8;

  if (matched) {
    p.fail -= 2.2;
    p.success += 1.5;
    p.bigSuccess += 0.7;
  } else {
    p.bigFail += 4.5;
    p.fail += 5.5;
    p.success -= 4.2;
    p.bigSuccess -= 2.2;
  }

  if (routeCombo.count) {
    p.bigFail -= routeCombo.count * 0.6;
    p.fail -= routeCombo.count * 1.1;
    p.success += routeCombo.count * 1.0;
    p.bigSuccess += routeCombo.count * 0.7;
  }

  if (mainStat >= 6) {
    p.fail -= 1.4;
    p.success += 1;
    p.bigSuccess += 0.8;
  }
  if (supportStat >= 6) {
    p.fail -= 1;
    p.success += 0.8;
    p.bigSuccess += 0.5;
  }
  if (mainStat < 3) {
    p.bigFail += 2.2;
    p.fail += 2.4;
    p.success -= 2.1;
  }
  if (riskValue >= 4) {
    p.bigFail += 3;
    p.fail += 2.3;
    p.bigSuccess -= 1.4;
  }

  if ((role === "revenue" || role === "gamble") && card.cost >= 50000 && (state.build.budgetControl || 0) < 4) {
    p.bigFail += 2.5;
    p.fail += 2.5;
    p.success -= 2;
  }

  return normalizeOutcomeProbabilities(p);
}

function outcomeProfileType(card) {
  if (card.role) return card.role;
  if (card.tags?.includes("고위험") || card.tags?.includes("도박") || card.cost >= 50000) return "gamble";
  if (card.category === "운영력" || card.category === "사내정치") return "defense";
  if (card.category === "예산관리" || card.category === "브랜드") return "prep";
  if (card.category === "퍼포먼스") return "revenue";
  return "improve";
}

function getRouteCombo(card) {
  const cardRoutes = card.routeTags || [];
  if (!cardRoutes.length) return { count: 0, route: null, label: null, multiplier: 1, expBonus: 0 };
  const recent = state.recentCards
    .map((recentCard) => data.cards.find((item) => item.name === recentCard.name))
    .filter(Boolean)
    .slice(0, 4);

  let bestRoute = null;
  let bestCount = 0;
  for (const route of cardRoutes) {
    const count = recent.filter((recentCard) => (recentCard.routeTags || []).includes(route)).length;
    if (count > bestCount) {
      bestRoute = route;
      bestCount = count;
    }
  }

  if (!bestCount) return { count: 0, route: null, label: null, multiplier: 1, expBonus: 0 };
  const multiplier = Math.min(1.24, 1 + bestCount * 0.08);
  const expBonus = bestCount >= 2 ? 1 : 0;
  return {
    count: bestCount,
    route: bestRoute,
    label: routeLabels[bestRoute] || bestRoute,
    multiplier,
    expBonus,
  };
}

function normalizeOutcomeProbabilities(probabilities) {
  const min = { bigFail: 0.5, fail: 3, breakEven: 10, success: 5, bigSuccess: 1 };
  const adjusted = {};
  for (const key of Object.keys(probabilities)) adjusted[key] = Math.max(min[key] || 0, probabilities[key]);
  const total = Object.values(adjusted).reduce((sum, value) => sum + value, 0);
  for (const key of Object.keys(adjusted)) adjusted[key] = (adjusted[key] / total) * 100;
  return adjusted;
}

function outcomeTierMultiplierRange(tier) {
  const ranges = {
    bigFail: [0, 0],
    fail: [0.25, 0.6],
    breakEven: [0.8, 1.08],
    success: [1.2, 1.6],
    bigSuccess: [2.0, 2.8],
  };
  return ranges[tier.id] || ranges.breakEven;
}

function calculateExpGain(card, baseExp, earnedBreakdown) {
  const id = earnedBreakdown?.tier?.id || earnedBreakdown?.outcome || "breakEven";
  const bonus = { bigFail: -baseExp, fail: -Math.max(0, baseExp - 1), breakEven: 0, success: 1, bigSuccess: 3 }[id] || 0;
  const comboBonus = earnedBreakdown?.routeCombo?.expBonus || 0;
  return Math.max(0, baseExp + bonus + comboBonus);
}

function getSupportStat(card) {
  if (card.category === "퍼포먼스") return averageNumbers([state.build.content, state.build.brand, state.trust]);
  if (card.category === "콘텐츠") return averageNumbers([state.build.performance, state.build.brand]);
  if (card.category === "브랜드") return averageNumbers([state.build.content, state.trust]);
  if (card.category === "사내정치" || card.category === "보고") return averageNumbers([state.build.operations, state.trust]);
  if (card.category === "운영력") return averageNumbers([state.build.politics, state.mental]);
  if (card.category === "예산관리") return averageNumbers([state.build.performance, state.score]);
  return 2;
}

function averageNumbers(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return 2;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function chooseCard(cardId) {
  if (state.finished || state.screen !== "choice") return;

  const card = data.cards.find((item) => item.id === cardId);
  if (!card) return;
  const situation = state.currentSituation;
  const before = snapshotCore();
  const cost = card.cost;
  const baseEarned = rollRange(card.earned, 1000);
  const baseExpGain = rollRange(card.score);
  const matchedSituation = isCardContextMatch(card, situation);
  const earnedBreakdown = calculateEarnedMoney(card, situation, baseEarned, cost, matchedSituation);
  const earned = earnedBreakdown.amount;
  const scoreGain = calculateExpGain(card, baseExpGain, earnedBreakdown);

  state.money -= cost;
  state.money += earned;
  state.score += scoreGain;
  state.mental += card.secondary.mental;
  state.trust += card.secondary.trust;
  applyObject(card.build, state.build);
  applyObject(card.risk, state.risk);
  if (!matchedSituation) applySituationPressure(situation);

  state.recentCards = [{ name: card.name, round: state.round }, ...state.recentCards].slice(0, 4);
  state.recentTags = [...card.tags, ...state.recentTags].slice(0, 10);

  const synergyMessages = applySynergies();
  decayRisks();
  clampState();

  const delta = diffCore(before, snapshotCore());
  const resultText = buildResultText(card, situation, cost, earned, scoreGain, matchedSituation, synergyMessages, earnedBreakdown);
  state.turnResult = {
    round: state.round,
    cardName: card.name,
    text: resultText,
    delta,
  };
  addLog(`${state.round}R ${card.name}`, stripHtml(resultText));

  state.round += 1;
  state.screen = "result";
  render();
}

function selectCard(cardId) {
  if (state.finished || state.screen !== "choice") return;
  if (!state.offeredCards.some((card) => card.id === cardId)) return;
  state.selectedCardId = cardId;
  render();
}

function confirmSelectedCard() {
  if (state.finished || state.screen !== "choice" || !state.selectedCardId) return;
  chooseCard(state.selectedCardId);
}

function applySituationPressure(situation) {
  const pressure = categoryPressure[situation.category] || {};
  for (const [key, value] of Object.entries(pressure)) {
    if (key in state.risk) state.risk[key] += value;
    if (key in state) state[key] += value;
  }
}

function applySynergies() {
  const messages = [];
  for (const synergy of data.synergies) {
    if (state.triggeredSynergies.has(synergy.id)) continue;
    const matched = synergy.requiredRecentCards.every((name) =>
      state.recentCards.some((card) => card.name === name && state.round - card.round < synergy.withinTurns),
    );
    if (!matched) continue;

    applySynergyEffect(synergy.effect);
    state.triggeredSynergies.add(synergy.id);
    messages.push(`[${synergy.name}] ${synergy.message}`);
  }
  return messages;
}

function applySynergyEffect(effect) {
  const mapping = {
    moneyBonus: ["money", 1],
    scoreBonus: ["score", 1],
    mentalBonus: ["mental", 1],
    trustBonus: ["trust", 1],
    budgetRiskDelta: ["budgetRisk", 1],
    approvalRiskDelta: ["approvalRisk", 1],
    brandRiskDelta: ["brandRisk", 1],
    reportPressureDelta: ["reportPressure", 1],
    operationRiskDelta: ["operationRisk", 1],
    burnoutRiskDelta: ["burnoutRisk", 1],
  };

  for (const [key, value] of Object.entries(effect)) {
    const target = mapping[key];
    if (!target) continue;
    const [field, multiplier] = target;
    if (field in state) state[field] += value * multiplier;
    if (field in state.risk) state.risk[field] += value * multiplier;
  }
}

function continueAfterResult() {
  if (state.finished || state.screen !== "result") return;
  if (shouldFinish()) {
    finishGame();
    return;
  }
  state.turnResult = null;
  state.screen = "choice";
  nextRound();
}

function finishGame() {
  state.finished = true;
  state.screen = "finished";
  render();

  const clear = data.stageDefaults.clearConditions;
  const excellent = data.stageDefaults.excellentClear;
  const excellentClear =
    state.score >= excellent.scoreGte &&
    state.money >= excellent.moneyGte &&
    state.mental >= excellent.mentalGte &&
    state.trust >= excellent.trustGte;
  const cleared =
    state.score >= clear.scoreGte &&
    state.money >= clear.moneyGte &&
    state.mental >= clear.mentalGte &&
    state.trust >= clear.trustGte;

  els.resultBadge.textContent = excellentClear ? "우수 클리어" : cleared ? "사원 전환" : "평가 보류";
  els.resultTitle.textContent = excellentClear ? "인턴인데 꽤 하는데요" : cleared ? "다음 스테이지로 출근합니다" : failTitle();
  els.resultSummary.textContent = resultSummary(cleared, excellentClear);
  els.resultStats.innerHTML = [
    ["돈", formatMoney(state.money)],
    ["EXP", state.score],
    ["멘탈", state.mental],
    ["신뢰", state.trust],
  ]
    .map(([label, value]) => `<div class="result-stat"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  els.resultModal.classList.remove("hidden");
}

function failTitle() {
  if (state.money <= 0) return "예산이 먼저 끝났습니다";
  if (state.mental <= 0) return "번아웃으로 로그아웃";
  if (state.trust <= 0) return "신뢰를 잃었습니다";
  return "보고서가 조금 얇았습니다";
}

function resultSummary(cleared, excellent) {
  if (excellent) return "EXP와 예산 회수까지 모두 챙겼습니다. 다음 캠페인 예산을 맡겨볼 만합니다.";
  if (cleared) return "목표 예산과 EXP 기준을 넘겼습니다. 인턴 테스트는 통과입니다.";
  if (state.score < data.stageDefaults.clearConditions.scoreGte) return "열심히 한 흔적은 있지만 EXP가 부족했습니다.";
  if (state.money < data.stageDefaults.clearConditions.moneyGte) return "숫자는 만들었지만 남은 예산이 너무 얇습니다.";
  if (state.trust < data.stageDefaults.clearConditions.trustGte) return "EXP는 있지만 보고와 컨펌에서 신뢰를 잃었습니다.";
  return "클리어 기준에 아깝게 닿지 못했습니다.";
}

function render() {
  if (!data || !state) return;

  document.body.classList.toggle("is-intro", state.screen === "intro");
  document.body.classList.toggle("is-choice", state.screen === "choice");
  document.body.classList.toggle("is-result", state.screen === "result");
  els.startScreen.classList.toggle("hidden", state.screen !== "intro");
  els.cardChoices.classList.toggle("hidden", state.screen !== "choice");
  els.turnResult.classList.toggle("hidden", state.screen !== "result");
  if (els.confirmChoiceButton) els.confirmChoiceButton.classList.toggle("hidden", state.screen !== "choice");

  els.roundLabel.textContent = `Round ${Math.min(state.round, data.stageDefaults.rounds)} / ${data.stageDefaults.rounds}`;
  els.phaseLabel.textContent = state.finished ? "평가 완료" : state.screen === "result" ? "결과 확인" : state.mental <= 3 ? "번아웃 주의" : "인턴 생존 중";
  els.stageHeading.textContent = state.screen === "result" ? "선택 결과" : "선택 카드";
  els.stageSubcopy.textContent = state.screen === "result" ? "이번 선택으로 바뀐 결과입니다." : "이번 턴에 사용할 카드를 선택하세요.";

  setMeter("money", state.money, storyOverlay?.balanceProfileV12?.moneyMeterMax || storyOverlay?.balanceProfileV11?.moneyMeterMax || 600000);
  setMeter("mental", state.mental, 15);
  setMeter("performance", state.score, 22);
  setMeter("trust", state.trust, 12);

  renderBuildStats();
  renderRiskStats();
  renderRecentCards();
  renderSituation();
  renderChoices();
  renderAdvisor();
  renderTurnResult();
  renderLogs();
}

function setMeter(key, value, max) {
  const labelValue = key === "money" ? formatStatusMoney(value) : value;
  els[`${key}Value`].textContent = labelValue;
  els[`${key}Bar`].style.width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
}

function renderBuildStats() {
  if (!els.buildStats) return;
  els.buildStats.innerHTML = data.buildStats
    .map((key) => statRow(key, state.build[key], 12, "stat-row"))
    .join("");
}

function renderRiskStats() {
  if (!els.riskStats) return;
  els.riskStats.innerHTML = data.riskStats
    .map((key) => statRow(key, state.risk[key], 8, "risk-row"))
    .join("");
}

function statRow(key, value, max, className) {
  return `<div class="${className}"><div><span>${effectLabels[key]}</span><strong>${value}</strong></div><div class="thin-meter"><span style="width:${(value / max) * 100}%"></span></div></div>`;
}

function renderRecentCards() {
  if (!els.recentCards) return;
  els.recentCards.innerHTML = state.recentCards.length
    ? state.recentCards.map((card) => `<div class="recent-chip">${card.name}</div>`).join("")
    : `<div class="recent-chip">아직 선택 없음</div>`;
}

function renderSituation() {
  if (!state.currentSituation) {
    els.situationCategory.textContent = data.version;
    els.situationRisk.textContent = "12라운드 평가";
    els.situationName.textContent = data.gameTitle;
    els.situationText.textContent = "첫 캠페인은 작은 테스트로 시작합니다. 돈을 너무 태우면 끝나고, 아무 숫자도 못 만들면 평가에서 막힙니다.";
    return;
  }

  els.situationCategory.textContent = state.currentSituation.category;
  if (state.currentSituation.phase) els.situationCategory.textContent = state.currentSituation.phase;
  els.situationRisk.textContent = state.currentSituation.preferredTags.join(" / ");
  els.situationName.textContent = state.currentSituation.name;
  els.situationText.textContent = formatSituationDialogue(state.currentSituation);
}

function formatSituationDialogue(situation) {
  if (!situation.speaker || !situation.line) return situation.description;
  return `${situation.speaker}: “${situation.line}” ${situation.description}`;
}

function renderChoices() {
  if (state.screen !== "choice") return;
  els.cardChoices.innerHTML = state.offeredCards.map(renderChoiceCard).join("");
  for (const button of els.cardChoices.querySelectorAll("button")) {
    button.addEventListener("click", () => selectCard(button.dataset.cardId));
  }
}

function renderChoiceCard(card) {
  const selected = card.id === state.selectedCardId;
  return `
    <button class="choice-card ${categoryClass(card.category)} ${selected ? "is-selected" : ""}" type="button" data-card-id="${card.id}" ${state.finished ? "disabled" : ""} aria-pressed="${selected}">
      <div class="card-icon" aria-hidden="true">${cardIcon(card)}</div>
      <div class="card-main">
        <h3>${card.name}</h3>
      </div>
      <div class="effect-list">
        <span class="cost-label">비용</span>
        <strong>${formatMoney(card.cost)}</strong>
      </div>
      <span class="selected-check" aria-hidden="true">✓</span>
    </button>
  `;
}

function renderAdvisor() {
  if (!els.advisorText || !els.advisorName) return;
  const card = state.offeredCards.find((item) => item.id === state.selectedCardId);
  els.advisorName.textContent = "인턴 지우";
  if (!card) {
    els.advisorText.textContent = "카드를 하나 골라보면 제가 실행 방향을 정리해볼게요.";
    if (els.confirmChoiceButton) els.confirmChoiceButton.disabled = true;
    return;
  }
  els.advisorText.textContent = getCardDescription(card);
  if (els.confirmChoiceButton) els.confirmChoiceButton.disabled = false;
}

function getCardDescription(card) {
  const roundId = state.currentStoryRound?.id;
  if (roundId && card.contextDescriptions?.[roundId]) return card.contextDescriptions[roundId];

  const descriptions = storyOverlay?.contextDescriptions;
  if (!roundId || !descriptions) return card.description;

  const byCard = descriptions[card.id] || descriptions[card.name];
  if (typeof byCard === "string") return byCard;
  if (byCard?.[roundId]) return byCard[roundId];

  const byRound = descriptions[roundId];
  if (byRound?.[card.id]) return byRound[card.id];
  if (byRound?.[card.name]) return byRound[card.name];

  return card.description;
}

function cardIcon(card) {
  const icons = {
    "예산관리": "₩",
    "퍼포먼스": "↗",
    "콘텐츠": "✎",
    "브랜드": "◆",
    "사내정치": "☷",
    "운영력": "▣",
  };
  return icons[card.category] || "✦";
}

function categoryClass(category = "") {
  const mapping = {
    "예산관리": "category-budget",
    "퍼포먼스": "category-performance",
    "콘텐츠": "category-content",
    "브랜드": "category-brand",
    "사내정치": "category-politics",
    "운영력": "category-operations",
  };
  return mapping[category] || "category-default";
}

function renderTurnResult() {
  if (!state.turnResult) return;
  els.turnResultBadge.textContent = `${state.turnResult.round}R 선택 결과`;
  els.turnResultTitle.textContent = state.turnResult.cardName;
  els.turnResultText.innerHTML = state.turnResult.text;
  els.turnResultDelta.innerHTML = state.turnResult.delta
    .map((part) => `<span>${part}</span>`)
    .join("");
  els.continueButton.textContent = shouldFinish() ? "최종 평가 보기" : "다음 턴";
}

function renderLogs() {
  if (!els.logList) return;
  els.logList.innerHTML = state.logs
    .map((entry) => `<div class="log-entry"><strong>${entry.title}</strong><span>${entry.text}</span></div>`)
    .join("");
}

function buildResultText(card, situation, cost, earned, scoreGain, matched, synergies, earnedBreakdown) {
  const patchedLine = getPatchedResultLine(card, matched, situation);
  const noRecovery = cost > 0 && earned <= 0;
  const narration = noRecovery
    ? noRecoveryNarration(card)
    : patchedLine?.narration || fallbackResultNarration(card, situation, matched);
  const dialogue = noRecovery
    ? makeDynamicResultDialogue(card, situation, cost, earned, scoreGain, matched, earnedBreakdown)
    : patchedLine?.line
      ? formatDialogue(patchedLine.speaker || getResultSpeaker(situation), patchedLine.line)
      : makeDynamicResultDialogue(card, situation, cost, earned, scoreGain, matched, earnedBreakdown);

  const net = earned - cost;
  const scoreText = scoreGain > 0 ? `+${scoreGain}` : `${scoreGain}`;
  const tierMeta = earnedBreakdown?.tier || outcomeTierMeta.breakEven;
  const multiplierText = earnedBreakdown
    ? `회수 보정 ×${earnedBreakdown.multiplier.toFixed(2)} · 결과 배수 ×${earnedBreakdown.tierMultiplier.toFixed(2)} · ${roleLabels[earnedBreakdown.role] || "선택"} 카드 · ${effectLabels[earnedBreakdown.mainKey] || "상태"} ${earnedBreakdown.mainStat.toFixed(1)}`
    : "";
  const reasonHtml = earnedBreakdown ? buildReasonHtml(card, situation, earnedBreakdown, matched, cost, earned, scoreGain) : "";

  const synergyHtml = synergies.length
    ? `<div class="result-synergy">${synergies.map((item) => `<span>${item}</span>`).join("")}</div>`
    : "";

  return `
    <div class="result-tier ${tierMeta.className}">${tierMeta.label}</div>
    <span class="result-narration">${narration}</span>
    <div class="result-dialogue"><span>${dialogueSpeaker(dialogue)}</span><strong>${dialogueLine(dialogue)}</strong></div>
    <div class="result-money-grid">
      <div><span>쓴 예산</span><strong>-${cost.toLocaleString("ko-KR")}원</strong></div>
      <div class="${earned > 0 ? "" : "is-zero-recovery"}"><span>회수 금액</span><strong>${formatRecoveryMoney(earned)}</strong></div>
      <div class="${net >= 0 ? "is-positive" : "is-negative"}"><span>순손익</span><strong>${formatMoneyDelta(net)}</strong></div>
      <div><span>EXP</span><strong>${scoreText}</strong></div>
    </div>
    ${multiplierText ? `<div class="result-multiplier">${multiplierText}</div>` : ""}
    ${reasonHtml}
    ${synergyHtml}
  `;
}

function getPatchedResultLine(card, matched, situation) {
  const mode = matched ? "matched" : "missed";
  const roundId = situation.storyRound?.id;
  const overrides = storyOverlay?.resultLineOverrides || {};
  const roundOverrides = roundId ? overrides[roundId] : null;
  const exact = roundOverrides?.[card.id]?.[mode];
  if (exact) return exact;
  const byCategory = roundOverrides?.[`category:${card.category}`]?.[mode];
  if (byCategory) return byCategory;
  const cardDefault = card.resultLines?.[mode];
  if (cardDefault) return cardDefault;
  return null;
}

function noRecoveryNarration(card) {
  const byCategory = {
    "예산관리": "판단은 했지만 이번 선택에서는 뚜렷한 회수 금액을 만들지 못했습니다.",
    "퍼포먼스": "예산을 태웠지만 이번 집행에서는 구매나 회수로 이어지지 않았습니다.",
    "콘텐츠": "소재를 손봤지만 이번에는 반응이 숫자로 돌아오지 않았습니다.",
    "브랜드": "톤은 정리했지만 당장 회수되는 돈은 없었습니다.",
    "사내정치": "설명할 여지는 만들었지만 이번 선택 자체로 회수된 금액은 없었습니다.",
    "운영력": "일은 정리했지만 이번 선택에서 바로 돌아온 돈은 없었습니다.",
  };
  return byCategory[card.category] || "이번 선택에서는 돈이 바로 돌아오지 않았습니다.";
}

function fallbackResultNarration(card, situation, matched) {
  if (!matched) return "선택 자체는 의미가 있었지만, 지금 상황의 핵심과는 조금 빗나갔습니다.";
  const byCategory = {
    "예산관리": "예산 흐름을 확인하고 손실을 줄이는 쪽으로 움직였습니다.",
    "퍼포먼스": "성과를 만들기 위해 더 직접적인 액션을 선택했습니다.",
    "콘텐츠": "반응을 만들 수 있도록 메시지와 소재를 손봤습니다.",
    "브랜드": "브랜드 톤이 무너지지 않도록 방향을 정리했습니다.",
    "사내정치": "보고와 컨펌에서 설명 가능한 근거를 챙겼습니다.",
    "운영력": "일이 터지기 전에 범위와 진행 방식을 정리했습니다.",
  };
  return byCategory[card.category] || "현재 상황에 맞춰 다음 선택을 준비했습니다.";
}

function makeDynamicResultDialogue(card, situation, cost, earned, scoreGain, matched, earnedBreakdown = null) {
  const speaker = getResultSpeaker(situation);
  const tierId = earnedBreakdown?.tier?.id || "breakEven";
  const role = card.role || outcomeProfileType(card);
  const net = earned - cost;
  const action = cardActionPhrase(card);
  const acceptance = dialogueAcceptanceLine(role, tierId, action);
  const interpretation = dialogueInterpretationLine(role, tierId, matched, net, cost, earned, scoreGain, earnedBreakdown);
  return formatDialogue(speaker, [acceptance, interpretation].filter(Boolean).join(" "));
}

function cardActionPhrase(card) {
  const byRole = {
    prep: "기준을 먼저 잡은 판단",
    improve: "문제를 직접 고친 판단",
    revenue: "회수를 노린 판단",
    defense: "리스크를 막은 판단",
    report: "보고 근거를 정리한 판단",
    gamble: "크게 걸어본 판단",
  };
  return byRole[card.role] || `${card.category || "업무"} 쪽 판단`;
}

function dialogueAcceptanceLine(role, tierId, action) {
  if (tierId === "bigSuccess") return `${action}은 확실히 먹혔습니다.`;
  if (tierId === "success") return `${action}은 방향이 맞았습니다.`;
  if (tierId === "breakEven") return `${action} 자체는 이해됩니다.`;
  if (tierId === "fail") return `${action}은 의도는 알겠습니다.`;
  if (tierId === "bigFail") return `${action}은 이번엔 무리였습니다.`;
  return `${action}은 확인했습니다.`;
}

function dialogueInterpretationLine(role, tierId, matched, net, cost, earned, scoreGain, earnedBreakdown) {
  if (!matched && tierId !== "bigSuccess") return "다만 지금 문제와는 조금 빗나가서 결과가 약했습니다.";
  if (net <= -40000 && (role === "revenue" || role === "gamble")) return "쓴 비용에 비해 돌아온 숫자가 부족했습니다.";
  if (earned <= 0 && cost > 0) return "설명할 여지는 있지만 회수된 금액은 없었습니다.";
  if (tierId === "bigSuccess") return scoreGain >= 3 ? "회수와 EXP가 같이 붙어서 꽤 좋은 결과입니다." : "회수 금액이 분명하게 붙은 좋은 결과입니다.";
  if (tierId === "success") return net >= 0 ? "숫자가 움직였고 손익도 나쁘지 않습니다." : "반응은 있었지만 비용 부담은 남았습니다.";
  if (tierId === "breakEven") return "크게 망하진 않았지만 확신을 주는 숫자는 아닙니다.";
  if (tierId === "fail") return "일부 의미는 남았지만 기대한 성과에는 못 미쳤습니다.";
  if (tierId === "bigFail") return "리스크가 결과를 크게 깎았습니다.";
  if (earnedBreakdown?.routeCombo?.count) return "이어진 선택 흐름 덕분에 효과가 일부 살아났습니다.";
  return "이번 결과만으로는 강한 근거가 부족합니다.";
}

function buildReasonHtml(card, situation, breakdown, matched, cost, earned, scoreGain) {
  const positives = [];
  const negatives = [];
  const role = breakdown.role || card.role || outcomeProfileType(card);

  if (matched) positives.push("현재 상황과 카드가 잘 맞았습니다.");
  else negatives.push("지금 문제와 카드의 방향이 조금 어긋났습니다.");

  if (breakdown.routeCombo?.count) positives.push(`${breakdown.routeCombo.label} 선택이 이어지며 효과가 커졌습니다.`);
  if (breakdown.mainStat >= 6) positives.push("관련 역량이 쌓여 결과가 좋아졌습니다.");
  if (Math.floor((state.score || 0) / 5) > 0) positives.push("EXP가 쌓여 판단 성공률이 조금 올랐습니다.");
  if (breakdown.riskValue <= 1 && breakdown.riskKey) positives.push("누적 리스크가 낮아 회수 효율이 유지됐습니다.");

  if (breakdown.riskValue >= 4) negatives.push("누적된 리스크 때문에 효율이 깎였습니다.");
  if (breakdown.mainStat < 3 && (role === "revenue" || role === "gamble" || role === "improve")) negatives.push("아직 이 선택을 크게 밀 만큼 준비가 부족했습니다.");
  if (cost >= 50000 && (state.build.budgetControl || 0) < 4) negatives.push("큰 예산을 쓰기엔 예산 관리 근거가 부족했습니다.");
  if (breakdown.moneyWeight === "low" && earned > 0) negatives.push("이 라운드는 수익보다 준비 성격이 강해 회수가 제한됐습니다.");
  if ((state.risk.brandRisk || 0) >= 4) negatives.push("반응은 노렸지만 브랜드 부담이 생겼습니다.");

  const pos = positives.slice(0, 2);
  const neg = negatives.slice(0, 2);
  const items = [...pos.map((text) => `<li class="good">+ ${text}</li>`), ...neg.map((text) => `<li class="bad">- ${text}</li>`)].slice(0, 3);
  if (!items.length) return "";
  return `<div class="result-reasons"><strong>왜 이런 결과가 나왔나요?</strong><ul>${items.join("")}</ul></div>`;
}

function getResultSpeaker(situation) {
  return situation.storyRound?.resultSpeaker || situation.storyRound?.speaker || "팀장님";
}

function formatDialogue(speaker, line) {
  if (!speaker || !line) return "";
  return `${speaker}: “${line}”`;
}

function dialogueSpeaker(dialogue) {
  const index = dialogue.indexOf(":");
  if (index === -1) return "팀장님";
  return dialogue.slice(0, index);
}

function dialogueLine(dialogue) {
  const index = dialogue.indexOf(":");
  const raw = index === -1 ? dialogue : dialogue.slice(index + 1).trim();
  return raw.replace(/^[“”"']+|[“”"']+$/g, "");
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function diffCore(before, after) {
  return Object.keys(before)
    .map((key) => [key, after[key] - before[key]])
    .filter(([, value]) => value !== 0)
    .map(([key, value]) => `${effectLabels[key]} ${key === "money" ? formatMoneyDelta(value) : signed(value)}`);
}

function snapshotCore() {
  return {
    money: state.money,
    score: state.score,
    mental: state.mental,
    trust: state.trust,
  };
}

function addLog(title, text) {
  state.logs = [{ title, text }, ...state.logs].slice(0, 8);
}

function applyObject(source, target) {
  for (const [key, value] of Object.entries(source)) {
    if (key in target) target[key] += value;
  }
}

function decayRisks() {
  for (const key of data.riskStats) {
    if (state.risk[key] > 0) state.risk[key] -= 1;
    if (state.risk[key] < 0) state.risk[key] += 1;
  }
}

function clampState() {
  state.money = Math.min(storyOverlay?.balanceProfileV12?.moneyClampMax || storyOverlay?.balanceProfileV11?.moneyClampMax || 650000, state.money);
  state.score = Math.min(24, state.score);
  state.mental = Math.min(15, state.mental);
  state.trust = Math.min(12, state.trust);
  for (const key of data.buildStats) state.build[key] = Math.max(0, Math.min(12, state.build[key]));
  for (const key of data.riskStats) state.risk[key] = Math.max(0, Math.min(8, state.risk[key]));
}

function rollRange(range, step = 1) {
  const [min, max] = range;
  const raw = min + Math.random() * (max - min);
  return Math.round(raw / step) * step;
}

function weightedPick(weightedItems) {
  const total = weightedItems.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;
  for (const weighted of weightedItems) {
    cursor -= weighted.weight;
    if (cursor <= 0) return weighted.item;
  }
  return weightedItems[weightedItems.length - 1].item;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function formatMoney(value) {
  return `${Math.max(0, value).toLocaleString("ko-KR")}원`;
}

function formatShortMoney(value) {
  if (value === 0) return "0";
  return `${Math.round(value / 10000)}만`;
}

function formatCost(value) {
  if (value === 0) return "0";
  return value.toLocaleString("ko-KR");
}


function formatRangeCompact(range) {
  if (!range) return "-";
  return `${formatShortMoney(range[0])}~${formatShortMoney(range[1])}`;
}

function formatScoreRange(range) {
  if (!range) return "-";
  if (range[0] === range[1]) return `${range[0] > 0 ? "+" : ""}${range[0]}`;
  return `${range[0] > 0 ? "+" : ""}${range[0]}~+${range[1]}`;
}

function formatCostCompact(value) {
  if (value === 0) return "0";
  return `${Math.round(value / 10000)}만`;
}

function formatStatusMoney(value) {
  return Math.max(0, value).toLocaleString("ko-KR");
}

function formatRecoveryMoney(value) {
  if (value <= 0) return "회수 없음";
  return `+${value.toLocaleString("ko-KR")}원`;
}

function formatMoneyDelta(value) {
  const sign = value > 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toLocaleString("ko-KR")}원`;
}

function signed(value) {
  return `${value > 0 ? "+" : ""}${value}`;
}

els.startButton.addEventListener("click", startGame);
els.continueButton.addEventListener("click", continueAfterResult);
if (els.confirmChoiceButton) els.confirmChoiceButton.addEventListener("click", confirmSelectedCard);
els.restartButton.addEventListener("click", () => {
  els.resultModal.classList.add("hidden");
  startGame();
});
els.modalRestartButton.addEventListener("click", () => {
  els.resultModal.classList.add("hidden");
  startGame();
});

boot();
