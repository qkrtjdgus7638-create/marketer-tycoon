const EVENTS_URL = "./data/events_intern_v1.json";
const CARDS_URL = "./data/cards_intern_v1.json";
const ROUNDS_URL = "./data/rounds_intern_v1.json";

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
  situationCategory: document.querySelector("#situationCategory"),
  situationRisk: document.querySelector("#situationRisk"),
  situationName: document.querySelector("#situationName"),
  situationText: document.querySelector("#situationText"),
  situationHint: document.querySelector("#situationHint"),
  situationTags: document.querySelector("#situationTags"),
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
  restartButton: document.querySelector("#restartButton"),
  modalRestartButton: document.querySelector("#modalRestartButton"),
  resultModal: document.querySelector("#resultModal"),
  resultBadge: document.querySelector("#resultBadge"),
  resultTitle: document.querySelector("#resultTitle"),
  resultSummary: document.querySelector("#resultSummary"),
  resultStats: document.querySelector("#resultStats"),
};

const scoreKeys = [
  "performanceScore",
  "creativeScore",
  "operationScore",
  "reportScore",
  "budgetScore",
  "gambleScore",
  "brandScore",
];

const scoreLabels = {
  performanceScore: "성과형",
  creativeScore: "콘텐츠형",
  operationScore: "운영형",
  reportScore: "보고형",
  budgetScore: "절약형",
  gambleScore: "도박형",
  brandScore: "브랜드형",
};

const tierLabels = {
  basic: "기본",
  strategy: "전략",
  special: "특수",
};

const typeLabels = {
  stable: "안정",
  attack: "공격",
  defense: "방어",
  build: "빌드",
  combo: "연계",
  convert: "전환",
  gamble: "도박",
  chaos: "혼돈",
};

const tierClass = {
  basic: "choice-card--basic",
  strategy: "choice-card--strategy",
  special: "choice-card--special",
};

const roleByType = {
  stable: "prep",
  defense: "defense",
  attack: "revenue",
  build: "improve",
  combo: "improve",
  convert: "report",
  gamble: "gamble",
  chaos: "gamble",
};

const roleIconPaths = {
  prep: "./assets/role-icons/prep.png",
  improve: "./assets/role-icons/improve.png",
  revenue: "./assets/role-icons/revenue.png",
  defense: "./assets/role-icons/defense.png",
  report: "./assets/role-icons/report.png",
  gamble: "./assets/role-icons/gamble.png",
};

let internData = null;
let state = null;

async function boot() {
  const [events, cards, rounds] = await Promise.all([
    fetchJson(EVENTS_URL),
    fetchJson(CARDS_URL),
    fetchJson(ROUNDS_URL),
  ]);

  internData = {
    events: events.events,
    cards: cards.cards,
    config: rounds,
  };

  startIntro();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} 로드 실패`);
  return response.json();
}

function startIntro() {
  state = createState("intro");
  render();
}

function startGame() {
  state = createState("choice");
  prepareRound();
  render();
}

function createState(screen) {
  const start = internData.config.starting;
  return {
    screen,
    round: 1,
    budget: start.budget,
    exp: start.exp,
    mental: start.mental,
    trust: start.trust,
    scores: Object.fromEntries(scoreKeys.map((key) => [key, 0])),
    risks: {},
    usedEventIds: [],
    offeredHistory: [],
    selectedHistory: [],
    usedSpecialIds: [],
    biasTags: [],
    flags: {},
    currentEvent: null,
    offeredCards: [],
    selectedCardId: null,
    turnResult: null,
    finished: false,
  };
}

function prepareRound() {
  if (state.round > internData.config.totalRounds) {
    finishGame();
    return;
  }

  state.currentEvent = pickRoundEvent();
  state.offeredCards = pickCardsForEvent(state.currentEvent);
  state.selectedCardId = null;
  state.screen = "choice";
  state.turnResult = null;
}

function pickRoundEvent() {
  const fixed = internData.config.fixedRounds[String(state.round)];
  if (fixed?.type === "fixed") return normalizeEvent(fixed);
  if (fixed?.phase === "first_report") return firstReportEvent();
  if (fixed?.phase === "mid_review") return midReviewEvent();
  if (fixed?.phase === "final") return finalReviewEvent();

  const phase = roundPhase(state.round);
  const pool = internData.events.filter((event) => {
    if (event.phase !== phase) return false;
    if (event.oncePerRun && state.usedEventIds.includes(event.id)) return false;
    return state.round >= event.roundRange[0] && state.round <= event.roundRange[1];
  });

  const event = weightedPick(pool.map((item) => ({ item, weight: eventWeight(item) }))) || pool[0];
  if (event?.oncePerRun) state.usedEventIds.push(event.id);
  return normalizeEvent(event);
}

function normalizeEvent(event) {
  return {
    ...event,
    type: event.type || "random",
    tags: event.tags || [],
    riskTags: event.riskTags || [],
    preferredCardTags: event.preferredCardTags || event.tags || [],
    weakCardTags: event.weakCardTags || [],
  };
}

function roundPhase(round) {
  if (round <= 4) return "early";
  if (round <= 9) return "mid";
  return "late";
}

function eventWeight(event) {
  let weight = event.baseWeight || 10;
  if (state.biasTags.some((tag) => event.tags.includes(tag))) weight += 3;
  if (state.budget < 45000 && event.tags.includes("budget")) weight += 2;
  if (state.mental <= 4 && event.tags.includes("burnout")) weight += 3;
  if (state.trust <= 3 && event.tags.includes("trust")) weight += 2;
  if (state.scores.gambleScore >= 5 && (event.tags.includes("gamble") || event.tags.includes("crisis"))) weight += 2;
  return weight;
}

function firstReportEvent() {
  const totalRisk = riskTotal();
  if (state.mental <= 4 || state.scores.gambleScore >= 3 || totalRisk >= 7) {
    return branchEvent("branch_first_chaos", "첫 보고: 혼돈형", "일은 많이 한 것 같은데, 지금 정리가 하나도 안 되어 있어요.", ["burnout", "operation_risk", "trust_drop"], ["burnout_risk", "operation_risk"]);
  }
  if (state.trust >= 7 || state.scores.reportScore + state.scores.operationScore >= 5) {
    return branchEvent("branch_first_report", "첫 보고: 보고형", "정리는 잘했네요. 이제 숫자로 보여줄 수 있으면 좋겠어요.", ["trust", "report", "performance_request"], ["trust_risk"]);
  }
  if (state.budget >= 95000 && (state.exp <= 4 || state.scores.budgetScore >= 4)) {
    return branchEvent("branch_first_saving", "첫 보고: 절약형", "돈은 아꼈는데… 그래서 뭘 배웠죠?", ["budget_safe", "low_performance", "growth_pressure"], ["performance_risk"]);
  }
  return branchEvent("branch_first_performance", "첫 보고: 성과형", "성과는 보이는데, 이 비용은 어떻게 설명할 수 있죠?", ["performance", "budget_pressure", "report"], ["budget_risk", "trust_risk"]);
}

function midReviewEvent() {
  const top = dominantScore();
  if (state.scores.gambleScore >= 5) {
    state.biasTags = ["special", "gamble", "crisis"];
    return branchEvent("branch_mid_gamble", "중간 평가: 도박형", "터질 때는 터지는데, 이 방식 계속해도 괜찮을까요?", ["gamble", "crisis", "performance"], ["budget_risk", "trust_risk"]);
  }
  if (state.scores.reportScore >= 5 && state.trust >= 7) {
    state.biasTags = ["report", "trust"];
    return branchEvent("branch_mid_report", "중간 평가: 정치/보고형", "보고는 잘하는데, 실제 성과도 같이 따라와야 해요.", ["report", "trust", "performance"], ["performance_risk"]);
  }
  if (state.scores.operationScore >= 5 && riskTotal() <= 4) {
    state.biasTags = ["operation", "report"];
    return branchEvent("branch_mid_operation", "중간 평가: 운영형", "정리는 잘하는데, 본인이 만든 임팩트가 조금 약해요.", ["operation", "report", "growth"], ["performance_risk"]);
  }
  if (top === "creativeScore" || top === "brandScore") {
    state.biasTags = ["creative", "brand", "approval"];
    return branchEvent("branch_mid_creative", "중간 평가: 콘텐츠형", "방향은 좋아요. 근데 이거 브랜드 톤이랑 맞나요?", ["creative", "brand", "approval"], ["brand_risk", "approval_risk"]);
  }
  state.biasTags = ["performance", "budget"];
  return branchEvent("branch_mid_performance", "중간 평가: 퍼포먼스형", "숫자는 나쁘지 않은데, 이게 재현 가능한 성과인가요?", ["performance", "budget", "data"], ["budget_risk", "performance_risk"]);
}

function finalReviewEvent() {
  return branchEvent("branch_final_review", "최종 평가", "마지막으로 이 캠페인에서 무엇을 배웠는지 보여주세요.", ["final", "report", "performance", "trust"], ["trust_risk"]);
}

function branchEvent(id, title, description, tags, riskTags) {
  return normalizeEvent({
    id,
    type: "branch",
    phase: state.round === 5 ? "first_report" : state.round === 10 ? "mid_review" : "final",
    title,
    speaker: "팀장님",
    description,
    tags,
    riskTags,
    preferredCardTags: tags,
    weakCardTags: [],
    baseWeight: 10,
  });
}

function dominantScore() {
  return scoreKeys.reduce((best, key) => (state.scores[key] > state.scores[best] ? key : best), scoreKeys[0]);
}

function pickCardsForEvent(event) {
  const fixedIds = event.fixedCardIds || [];
  if (fixedIds.length) return fixedIds.map((id) => cardById(id)).filter(Boolean);

  const excluded = new Set(recentOfferedIds());
  const candidates = internData.cards.filter((card) => !excluded.has(card.id));
  const matching = candidates.filter((card) => cardMatchScore(card, event) > 0);
  const basics = candidates.filter((card) => card.tier === "basic");
  const pool = uniqueById([...matching, ...basics]);
  while (pool.length < 7) {
    const fallback = candidates.find((card) => !pool.some((item) => item.id === card.id));
    if (!fallback) break;
    pool.push(fallback);
  }

  const slot1 = pickSlot(pool, event, (card) => card.tier === "basic" || ["stable", "defense"].includes(card.cardType), []);
  const slot2 = pickSlot(pool, event, (card) => card.tier === "strategy" || ["attack", "build"].includes(card.cardType), [slot1]);
  const specialAllowed = shouldOfferSpecial(event);
  const slot3 = pickSlot(
    pool,
    event,
    (card) => (specialAllowed && card.tier === "special") || ["gamble", "chaos", "convert"].includes(card.cardType),
    [slot1, slot2],
  );

  const picks = uniqueById([slot1, slot2, slot3].filter(Boolean));
  for (const card of pool) {
    if (picks.length >= 3) break;
    if (!picks.some((item) => item.id === card.id)) picks.push(card);
  }

  state.offeredHistory.push({ round: state.round, ids: picks.map((card) => card.id) });
  state.offeredHistory = state.offeredHistory.slice(-2);
  return picks.slice(0, 3);
}

function cardById(id) {
  return internData.cards.find((card) => card.id === id);
}

function recentOfferedIds() {
  return state.offeredHistory.flatMap((entry) => entry.ids);
}

function shouldOfferSpecial(event) {
  if (state.usedSpecialIds.length >= 2) return false;
  let chance = 0.16;
  if (["boss", "viral", "crisis", "gamble"].some((tag) => event.tags.includes(tag))) chance += 0.18;
  if (state.scores.gambleScore >= 5) chance += 0.12;
  return Math.random() < chance;
}

function pickSlot(pool, event, predicate, used) {
  const usedIds = new Set(used.filter(Boolean).map((card) => card.id));
  let candidates = pool.filter((card) => !usedIds.has(card.id) && predicate(card));
  if (!candidates.length) candidates = pool.filter((card) => !usedIds.has(card.id));
  candidates = candidates.filter((card) => card.tier !== "special" || !state.usedSpecialIds.includes(card.id));
  return weightedPick(candidates.map((card) => ({ item: card, weight: cardWeight(card, event) })));
}

function cardWeight(card, event) {
  let weight = 1 + cardMatchScore(card, event);
  if (card.goodAgainst?.some((tag) => event.riskTags.includes(tag))) weight += 2.5;
  if (card.badAgainst?.some((tag) => event.tags.includes(tag) || event.riskTags.includes(tag))) weight *= 0.35;
  if (state.biasTags.some((tag) => card.tags.includes(tag))) weight += 1.4;
  if (state.budget < 45000 && (card.tags.includes("budget") || card.cardType === "defense")) weight += 2;
  if (state.mental <= 4 && (card.tags.includes("burnout") || card.goodAgainst?.includes("burnout_risk"))) weight += 2;
  if (state.trust <= 3 && (card.tags.includes("report") || card.tags.includes("trust"))) weight += 2;
  if (state.exp < state.round && (card.tags.includes("performance") || card.tags.includes("growth"))) weight += 1.5;
  if (card.tier === "special") weight *= 0.45;
  const repeats = state.selectedHistory.filter((id) => id === card.id).length;
  return Math.max(0.1, weight / (1 + repeats));
}

function cardMatchScore(card, event) {
  const preferred = event.preferredCardTags || [];
  const tagOverlap = card.tags.filter((tag) => event.tags.includes(tag)).length;
  const preferredOverlap = card.tags.filter((tag) => preferred.includes(tag)).length;
  return tagOverlap + preferredOverlap * 1.4;
}

function selectCard(cardId) {
  state.selectedCardId = cardId;
  render();
}

function confirmSelectedCard() {
  if (state.screen !== "choice") return;
  const card = state.offeredCards.find((item) => item.id === state.selectedCardId);
  if (!card) return;

  const before = snapshot();
  const outcome = resolveCard(card, state.currentEvent);
  applyCardResult(card, outcome);
  state.selectedHistory.push(card.id);
  if (card.tier === "special") state.usedSpecialIds.push(card.id);

  state.turnResult = {
    card,
    outcome,
    before,
    after: snapshot(),
    event: state.currentEvent,
  };
  state.screen = "result";
  render();
}

function resolveCard(card, event) {
  const match = cardMatchScore(card, event);
  const good = card.goodAgainst?.filter((tag) => event.riskTags.includes(tag)).length || 0;
  const bad = card.badAgainst?.filter((tag) => event.tags.includes(tag) || event.riskTags.includes(tag)).length || 0;
  const scoreFit = Object.entries(card.scoreDelta || {}).reduce((sum, [key, value]) => sum + Math.min(2, (state.scores[key] || 0) / 4) * Math.sign(value || 0), 0);
  const riskPenalty = (event.riskTags || []).reduce((sum, tag) => sum + Math.max(0, state.risks[tag] || 0) * 0.04, 0);
  const tierBase = card.tier === "basic" ? 0.58 : card.tier === "strategy" ? 0.53 : 0.43;
  const chance = clamp(tierBase + match * 0.055 + good * 0.09 + scoreFit * 0.025 - bad * 0.12 - riskPenalty, 0.12, 0.9);
  const roll = Math.random();
  const tier = outcomeTier(roll, chance, card.tier);
  const multiplier = tier.multiplier;
  const rawBudget = rollRange(card.budgetDeltaRange || [0, 0]);
  const budgetReturn = Math.round(rawBudget * multiplier);
  const budgetChange = (card.cost || 0) + budgetReturn;
  const expBase = rollRange(card.expDeltaRange || [0, 0]);
  const expChange = Math.max(0, Math.round(expBase + tier.expBonus));

  return {
    tier,
    chance,
    match,
    good,
    bad,
    cost: card.cost || 0,
    budgetReturn,
    budgetChange,
    expChange,
    mentalChange: card.mentalDelta || 0,
    trustChange: card.trustDelta || 0,
    reasons: resultReasons(card, event, { match, good, bad, tier }),
  };
}

function outcomeTier(roll, chance, tier) {
  const specialSwing = tier === "special" ? 0.07 : 0;
  if (roll < Math.max(0.04, chance * 0.12 + specialSwing)) return { id: "bigSuccess", label: "대성공", className: "tier-big-success", multiplier: 1.65, expBonus: 2 };
  if (roll < chance) return { id: "success", label: "성공", className: "tier-success", multiplier: 1.18, expBonus: 1 };
  if (roll < chance + 0.22) return { id: "breakEven", label: "본전", className: "tier-break-even", multiplier: 0.82, expBonus: 0 };
  if (roll < chance + 0.4) return { id: "fail", label: "실패", className: "tier-fail", multiplier: 0.38, expBonus: -0.5 };
  return { id: "bigFail", label: "대실패", className: "tier-big-fail", multiplier: -0.25, expBonus: -1 };
}

function resultReasons(card, event, meta) {
  const reasons = [];
  if (meta.match >= 2) reasons.push("현재 상황 태그와 카드 방향이 잘 맞았습니다.");
  if (meta.good) reasons.push("카드가 이번 위험 태그를 직접 방어했습니다.");
  if (meta.bad) reasons.push("카드의 약점이 이번 상황과 부딪혔습니다.");
  if (card.tier === "special") reasons.push("특수 카드는 보상이 큰 대신 결과 편차도 큽니다.");
  if (!reasons.length) reasons.push("결정적인 궁합은 아니지만 기본 효과는 적용됐습니다.");
  return reasons.slice(0, 2);
}

function applyCardResult(card, outcome) {
  state.budget += outcome.budgetChange;
  state.exp += outcome.expChange;
  state.mental += outcome.mentalChange;
  state.trust += outcome.trustChange;
  applyDelta(state.scores, card.scoreDelta || {});
  applyDelta(state.risks, card.riskDelta || {});
  for (const riskTag of state.currentEvent.riskTags || []) {
    state.risks[riskTag] = (state.risks[riskTag] || 0) + (outcome.tier.id === "fail" || outcome.tier.id === "bigFail" ? 1 : 0);
  }
  if (state.currentEvent.id === "event_boss_comment" && outcome.tier.id === "success") state.flags.bossPick = true;
  if (outcome.tier.id === "bigSuccess") state.flags.bigSuccess = true;
  if (outcome.tier.id === "bigFail") state.flags.bigFail = true;
  clampState();
}

function applyDelta(target, delta) {
  for (const [key, value] of Object.entries(delta)) {
    target[key] = (target[key] || 0) + value;
  }
}

function continueAfterResult() {
  if (shouldStopRun()) {
    finishGame();
    return;
  }
  state.round += 1;
  if (state.round > internData.config.totalRounds) {
    finishGame();
    return;
  }
  prepareRound();
  render();
}

function shouldStopRun() {
  return state.budget <= 0 || state.mental <= 0 || state.trust <= 0;
}

function finishGame() {
  state.finished = true;
  state.screen = "finished";
  renderEnding();
  render();
}

function render() {
  if (!state) return;
  document.body.classList.toggle("is-intro", state.screen === "intro");
  document.body.classList.toggle("is-choice", state.screen === "choice");
  document.body.classList.toggle("is-result", state.screen === "result");
  els.startScreen.classList.toggle("hidden", state.screen !== "intro");
  els.cardChoices.classList.toggle("hidden", state.screen !== "choice");
  els.turnResult.classList.toggle("hidden", state.screen !== "result");
  els.confirmChoiceButton.classList.toggle("hidden", state.screen !== "choice");

  els.roundLabel.textContent = `Round ${Math.min(state.round, internData.config.totalRounds)} / ${internData.config.totalRounds}`;
  els.phaseLabel.textContent = phaseLabel();
  els.stageHeading.textContent = state.screen === "result" ? "선택 결과" : "선택 카드";
  els.stageSubcopy.textContent = state.screen === "result" ? "이번 선택의 변화입니다." : "이번 라운드에 사용할 카드를 선택하세요.";

  setMeter("money", state.budget, internData.config.meters.budget);
  setMeter("mental", state.mental, internData.config.meters.mental);
  setMeter("performance", state.exp, internData.config.meters.exp);
  setMeter("trust", state.trust, internData.config.meters.trust);
  renderEvent();
  renderChoices();
  renderAdvisor();
  renderTurnResult();
}

function phaseLabel() {
  if (state.finished) return "평가 완료";
  if (state.screen === "result") return "결과 확인";
  if (state.round === 5) return "첫 보고";
  if (state.round === 10) return "중간 평가";
  if (state.round === 15) return "최종 평가";
  return "인턴 생존 중";
}

function setMeter(key, value, max) {
  const valueEl = els[`${key}Value`];
  const barEl = els[`${key}Bar`];
  valueEl.textContent = key === "money" ? formatNumber(Math.max(0, value)) : Math.max(0, value);
  barEl.style.width = `${clamp((Math.max(0, value) / max) * 100, 0, 100)}%`;
}

function renderEvent() {
  const event = state.currentEvent;
  if (!event) return;
  const tags = event.riskTags.length ? event.riskTags : event.tags;
  els.situationCategory.textContent = `${state.round}R / ${eventLabel(event)}`;
  els.situationRisk.textContent = tags.length ? `위험: ${compactTags(tags, 2)}` : "위험 낮음";
  els.situationName.textContent = event.title;
  els.situationText.textContent = `${event.speaker}: “${event.description}”`;
  els.situationHint.textContent = situationHint(event);
  els.situationTags.innerHTML = tags.slice(0, 4).map((tag) => `<span>${tag}</span>`).join("");
}

function situationHint(event) {
  if (event.phase === "first_report") return "인턴 지우: 첫 보고에서는 성과보다 설명 구조가 먼저 보입니다.";
  if (event.phase === "mid_review") return "인턴 지우: 지금부터는 누적된 선택 성향이 평가에 영향을 줍니다.";
  if (event.phase === "final") return "인턴 지우: 마지막 라운드입니다. 남은 자원을 보고 가장 설득력 있는 선택을 골라야 합니다.";
  if (event.riskTags.includes("budget")) return "인턴 지우: 예산을 쓰기 전에 이번 선택이 다음 판단 근거를 남기는지 봐야 합니다.";
  if (event.riskTags.includes("mental")) return "인턴 지우: 멘탈을 더 쓰면 버틸 수는 있지만, 다음 라운드가 흔들릴 수 있어요.";
  if (event.riskTags.includes("trust")) return "인턴 지우: 신뢰가 걸린 상황입니다. 성과만큼 설명 가능한 선택이 중요해요.";
  return "인턴 지우: 상황을 먼저 읽고, 이번 라운드에서 가장 덜 흔들릴 대응을 고르세요.";
}

function eventLabel(event) {
  if (event.phase === "early") return "초반 이벤트";
  if (event.phase === "mid") return "중반 이벤트";
  if (event.phase === "late") return "후반 이벤트";
  if (event.phase === "first_report") return "첫 보고";
  if (event.phase === "mid_review") return "중간 평가";
  if (event.phase === "final") return "최종 평가";
  return "고정 이벤트";
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
  const role = roleByType[card.cardType] || "prep";
  return `
    <button class="choice-card ${tierClass[card.tier] || ""} role-${role} ${selected ? "is-selected choice-card--selected" : ""}" type="button" data-card-id="${card.id}" aria-pressed="${selected}">
      <div class="card-icon" aria-hidden="true">${cardIconMarkup(role)}</div>
      <div class="card-main">
        <span class="role-badge">${tierLabels[card.tier] || card.tier}</span>
        <h3>${card.name}</h3>
      </div>
      <div class="cost-chip">
        <span>Cost</span>
        <strong>${formatSignedMoney(card.cost)}</strong>
      </div>
      ${selected ? `<span class="selected-check" aria-hidden="true">✓</span>` : ""}
    </button>
  `;
}

function cardIconMarkup(role) {
  const path = roleIconPaths[role];
  if (path) return `<img src="${path}" alt="" loading="lazy" />`;
  return "•";
}

function effectPreview(card) {
  const exp = rangeText(card.expDeltaRange, "+");
  const budget = budgetPreview(card);
  return `EXP ${exp} / ${budget}`;
}

function budgetPreview(card) {
  const spend = card.cost < 0 ? Math.abs(card.cost) : 0;
  const maxReturn = Math.max(...(card.budgetDeltaRange || [0, 0]));
  if (spend && maxReturn) return `예산 -${formatShortMoney(spend)}~+${formatShortMoney(maxReturn)}`;
  if (spend) return `예산 -${formatShortMoney(spend)}`;
  if (maxReturn) return `예산 +${formatShortMoney(maxReturn)}`;
  return "예산 0";
}

function riskPreview(card) {
  const riskEntries = Object.entries(card.riskDelta || {}).filter(([, value]) => value > 0);
  if (!riskEntries.length) return "리스크 낮음";
  return `리스크 ${riskEntries[0][0].replace("_risk", "")} ↑`;
}

function renderAdvisor() {
  const card = state.offeredCards.find((item) => item.id === state.selectedCardId);
  els.advisorName.textContent = "인턴 마케터";
  if (!card) {
    els.advisorText.textContent = "이번 상황에서는 어떤 방식으로 대응할까요?";
    els.confirmChoiceButton.disabled = true;
    return;
  }
  els.advisorText.textContent = cardAdvice(card);
  els.confirmChoiceButton.disabled = false;
}

function cardAdvice(card) {
  const name = card.name;
  if (name.includes("소액 테스트")) {
    return "일단 크게 태우기보다는 작게 반응을 보는 게 안전할 것 같아요. 성과가 크진 않아도 다음 판단 근거는 만들 수 있습니다.";
  }
  if (name.includes("몰빵") || card.cardType === "gamble" || card.cardType === "chaos") {
    return "위험하긴 한데 지금 흐름이면 한 번쯤 크게 걸어볼 만합니다. 실패하면 예산이나 신뢰가 꽤 아플 수 있어요.";
  }
  if (name.includes("보고서 방패") || card.cardType === "defense") {
    return "성과가 애매할수록 정리가 중요합니다. 이번 선택은 당장 대박은 아니어도 팀장님 설득에는 도움이 될 거예요.";
  }
  if (card.cardType === "convert" || card.cardType === "combo") {
    return `${card.description} 지금까지 쌓인 흐름을 다음 판단으로 연결하는 선택입니다.`;
  }
  if (card.cardType === "attack") {
    return `${card.description} 반응을 빠르게 만들 수 있지만, 그만큼 비용 관리도 같이 봐야 합니다.`;
  }
  if (card.cardType === "build") {
    return `${card.description} 바로 터지는 선택은 아니지만 뒤쪽 라운드에서 힘이 붙을 수 있어요.`;
  }
  return `${card.description} 이번 상황에서 무리하지 않고 기준을 잡는 선택입니다.`;
}

function renderTurnResult() {
  if (!state.turnResult) return;
  const { card, outcome, event } = state.turnResult;
  els.turnResultBadge.textContent = `${state.round}R 선택 결과`;
  els.turnResultTitle.textContent = card.name;
  els.turnResultText.innerHTML = `
    <div class="result-tier ${outcome.tier.className}">${outcome.tier.label}</div>
    <span class="result-narration">${resultNarration(card, outcome)}</span>
    <div class="result-dialogue"><span>${event.speaker}</span><strong>${resultDialogue(outcome)}</strong></div>
    <div class="result-money-grid">
      <div><span>예산 변화</span><strong class="${outcome.budgetChange >= 0 ? "is-good" : "is-bad"}">${formatSignedMoney(outcome.budgetChange)}</strong></div>
      <div><span>EXP</span><strong>${signed(outcome.expChange)}</strong></div>
      <div><span>멘탈</span><strong>${signed(outcome.mentalChange)}</strong></div>
      <div><span>신뢰</span><strong>${signed(outcome.trustChange)}</strong></div>
    </div>
    <div class="result-reasons"><strong>왜 이런 결과가 나왔나요?</strong><ul>${outcome.reasons.map((reason) => `<li>+ ${reason}</li>`).join("")}</ul></div>
  `;
  els.turnResultDelta.innerHTML = "";
  els.continueButton.textContent = state.round >= internData.config.totalRounds || shouldStopRun() ? "최종 평가 보기" : "다음 라운드";
}

function resultNarration(card, outcome) {
  if (outcome.tier.id === "bigSuccess") return `${card.name} 선택이 크게 먹혔습니다. 이번 판단은 확실한 근거가 됐습니다.`;
  if (outcome.tier.id === "success") return `${card.name} 선택이 현재 상황에 맞게 작동했습니다.`;
  if (outcome.tier.id === "breakEven") return `${card.name} 선택은 큰 손실 없이 다음 판단의 근거를 남겼습니다.`;
  if (outcome.tier.id === "fail") return `${card.name} 선택은 의도는 있었지만 기대한 만큼 돌아오지 않았습니다.`;
  return `${card.name} 선택은 이번 상황과 맞지 않아 크게 흔들렸습니다.`;
}

function resultDialogue(outcome) {
  if (outcome.tier.id === "bigSuccess") return "좋아요. 이 정도면 다음 보고에서 말할 숫자가 생겼습니다.";
  if (outcome.tier.id === "success") return "방향은 맞았습니다. 이제 이 흐름을 이어가면 됩니다.";
  if (outcome.tier.id === "breakEven") return "크게 망치진 않았지만, 아직 결정적인 숫자는 아닙니다.";
  if (outcome.tier.id === "fail") return "설명할 여지는 있지만, 결과는 조금 약했습니다.";
  return "이번 선택은 리스크가 더 커졌습니다. 다음 판단은 조심해야 합니다.";
}

function renderEnding() {
  const ending = chooseEnding();
  els.resultBadge.textContent = "최종 평가";
  els.resultTitle.textContent = ending.title;
  els.resultSummary.textContent = ending.summary;
  els.resultStats.innerHTML = [
    ["예산", formatNumber(Math.max(0, state.budget))],
    ["EXP", state.exp],
    ["멘탈", state.mental],
    ["신뢰", state.trust],
    ["성향", scoreLabels[dominantScore()]],
    ["라운드", `${Math.min(state.round, internData.config.totalRounds)} / ${internData.config.totalRounds}`],
  ].map(([label, value]) => `<div class="result-stat"><span>${label}</span><strong>${value}</strong></div>`).join("");
  els.resultModal.classList.remove("hidden");
}

function chooseEnding() {
  if (state.mental <= 0 || state.trust <= 0 || state.exp < 8) return endingById("failed");
  if (state.flags.bossPick && state.trust >= 7 && (state.scores.brandScore >= 5 || state.scores.gambleScore >= 5)) return endingById("boss_pick");
  if (state.scores.gambleScore >= 8 && state.flags.bigSuccess && state.flags.bigFail) return endingById("chaos_marketer");
  if (state.exp >= 24 && state.mental <= 4) return endingById("burnout_performer");
  if (state.exp >= 24 && state.budget < 50000 && state.scores.performanceScore >= 7) return endingById("budget_genius");
  if (state.exp >= 23 && state.budget >= 80000 && state.trust >= 8 && state.mental >= 6) return endingById("ace");
  if (state.trust >= 8 && state.scores.reportScore >= 7 && state.exp >= 12) return endingById("report_survivor");
  if (state.exp >= 16 && state.budget >= 50000 && state.trust >= 6) return endingById("regular");
  return endingById("survived_barely");
}

function endingById(id) {
  return internData.config.endings.find((ending) => ending.id === id) || internData.config.endings[0];
}

function snapshot() {
  return { budget: state.budget, exp: state.exp, mental: state.mental, trust: state.trust };
}

function riskTotal() {
  return Object.values(state.risks).reduce((sum, value) => sum + Math.max(0, value), 0);
}

function clampState() {
  state.budget = Math.max(-50000, Math.min(300000, state.budget));
  state.exp = Math.max(0, Math.min(40, state.exp));
  state.mental = Math.max(0, Math.min(12, state.mental));
  state.trust = Math.max(0, Math.min(12, state.trust));
  for (const key of scoreKeys) state.scores[key] = Math.max(0, Math.min(30, state.scores[key] || 0));
  for (const key of Object.keys(state.risks)) state.risks[key] = Math.max(0, Math.min(8, state.risks[key]));
}

function rollRange(range = [0, 0]) {
  const [min, max] = range;
  return Math.round(min + Math.random() * (max - min));
}

function weightedPick(weightedItems) {
  const valid = weightedItems.filter((item) => item.item && item.weight > 0);
  if (!valid.length) return null;
  const total = valid.reduce((sum, item) => sum + item.weight, 0);
  let cursor = Math.random() * total;
  for (const weighted of valid) {
    cursor -= weighted.weight;
    if (cursor <= 0) return weighted.item;
  }
  return valid.at(-1).item;
}

function uniqueById(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function compactTags(tags = [], limit = 3) {
  return tags.slice(0, limit).join(" / ") || "none";
}

function rangeText(range = [0, 0], sign = "") {
  const [min, max] = range;
  if (min === max) return `${sign}${min}`;
  return `${sign}${min}~${sign}${max}`;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("ko-KR");
}

function formatShortMoney(value) {
  if (!value) return "0";
  return `${Math.round(value / 10000)}만`;
}

function formatSignedMoney(value) {
  if (value === 0) return "0원";
  return `${value > 0 ? "+" : "-"}${formatNumber(Math.abs(value))}원`;
}

function signed(value) {
  if (value === 0) return "0";
  return `${value > 0 ? "+" : ""}${value}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

els.startButton.addEventListener("click", startGame);
els.continueButton.addEventListener("click", continueAfterResult);
els.confirmChoiceButton.addEventListener("click", confirmSelectedCard);
els.restartButton.addEventListener("click", () => {
  els.resultModal.classList.add("hidden");
  startGame();
});
els.modalRestartButton.addEventListener("click", () => {
  els.resultModal.classList.add("hidden");
  startGame();
});

boot().catch((error) => {
  console.error(error);
  els.startScreen.querySelector("p:last-of-type").textContent = "게임 데이터를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.";
});
