// v7 선택지 다양화 로직 참고용 스니펫
// 기존 pickStoryCards/cardWeight를 대체하거나 병합해서 사용하세요.

function pickStoryCardsV7(storyRound) {
  const slots = normalizeCardSlots(storyRound.cardSlots);
  const picked = [];
  const offeredRecently = state.recentOfferedCards || [];

  for (const slot of slots.slice(0, 3)) {
    const candidates = slot.candidateCardIds
      .map((id) => data.cards.find((card) => card.id === id))
      .filter(Boolean)
      .filter((card) => !picked.some((item) => item.id === card.id));

    if (!candidates.length) continue;

    const item = weightedPick(
      candidates.map((card) => ({
        item: card,
        weight: cardWeightV7(card, storyRound, slot.role, offeredRecently),
      })),
    );
    picked.push(item);
  }

  const diversified = diversifyCategories(picked, storyRound);
  state.recentOfferedCards = [...diversified.map((card) => card.id), ...(state.recentOfferedCards || [])].slice(0, 6);
  return diversified.slice(0, 3);
}

function cardWeightV7(card, storyRound, slotRole, offeredRecently = []) {
  const roundTags = storyRound.situationTags || [];
  let weight = 1;

  // 1. 상황 태그 적합도
  weight += card.tags.filter((tag) => roundTags.includes(tag)).length * 1.2;
  weight += (card.fits || []).filter((tag) => roundTags.includes(tag)).length * 1.5;

  // 2. 안 맞는 상황이면 감산
  if ((card.badFits || []).some((tag) => roundTags.includes(tag))) weight -= 3;

  // 3. 최근 반복 방지
  if (offeredRecently.includes(card.id)) weight -= 3;
  if (state.recentCards?.some((recent) => recent.name === card.name && state.round - recent.round <= 2)) weight -= 4;

  // 4. 상태보정 슬롯은 현재 약점 보정
  if (slotRole === "상태보정") {
    if (state.money < data.stageDefaults.clearConditions.moneyGte && card.risk?.budgetRisk < 0) weight += 2.5;
    if (state.score < Math.max(4, state.round / 2) && card.score?.[1] >= 2) weight += 2;
    if (state.mental <= 4 && card.secondary?.mental > 0) weight += 2;
    if (state.trust <= 4 && card.secondary?.trust > 0) weight += 2;
    if ((state.build?.budgetControl || 0) <= 1 && card.build?.budgetControl > 0) weight += 1.5;
    if ((state.build?.performance || 0) <= 1 && card.build?.performance > 0) weight += 1.5;
    if ((state.build?.operations || 0) <= 1 && card.build?.operations > 0) weight += 1.5;
  }

  return Math.max(0.1, weight);
}

function diversifyCategories(cards, storyRound) {
  const result = [...cards];
  if (result.length < 3) return result;

  const categories = result.map((card) => card.category);
  const allSame = categories.every((category) => category === categories[0]);
  if (!allSame) return result;

  const allCandidates = normalizeCardSlots(storyRound.cardSlots)
    .flatMap((slot) => slot.candidateCardIds)
    .map((id) => data.cards.find((card) => card.id === id))
    .filter(Boolean)
    .filter((card) => !result.some((picked) => picked.id === card.id))
    .filter((card) => card.category !== categories[0]);

  if (allCandidates.length) result[2] = weightedPick(allCandidates.map((card) => ({ item: card, weight: 1 })));
  return result;
}
