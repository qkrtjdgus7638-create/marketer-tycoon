# 마케터로 살아남기 - MVP 구현 정리

원본: `marketer_survival_dev_handoff.md`

## 1. 확정된 구현 기준

- 카드 효과는 `visibleEffect`, `buildEffect`, `riskEffect`로 분리한다.
- 숨은 위험값은 6개로 고정한다.
  - `budgetRisk`
  - `approvalRisk`
  - `brandRisk`
  - `reportPressure`
  - `operationRisk`
  - `burnoutRisk`
- 상황 선택은 고정 분기가 아니라 가중치 방식으로 처리한다.
- 시너지는 보유 카드 기준이 아니라 최근 3턴 선택 이력 기준으로 판정한다.
- 카드의 `followUpCandidates`는 다음 상황을 직접 지정하지 않는다. 상황 가중치, 결과 멘트, 시너지 로그 후보로만 사용한다.

## 2. 기본 데이터 스키마 초안

```ts
type CoreEffect = {
  money?: number;
  mental?: number;
  performance?: number;
  trust?: number;
};

type BuildEffect = {
  budgetControl?: number;
  growth?: number;
  content?: number;
  brand?: number;
  politics?: number;
  operations?: number;
};

type RiskEffect = {
  budgetRisk?: number;
  approvalRisk?: number;
  brandRisk?: number;
  reportPressure?: number;
  operationRisk?: number;
  burnoutRisk?: number;
};

type Card = {
  id: string;
  name: string;
  family: string;
  axis: string[];
  copy: string;
  visibleEffect: CoreEffect;
  buildEffect: BuildEffect;
  riskEffect: RiskEffect;
  hiddenRule: string;
  tags: string[];
  followUpCandidates: string[];
};

type Situation = {
  id: string;
  name: string;
  category: string;
  text: string;
  riskSummary: string;
  favorableCards: string[];
  tags: string[];
  weightRules: SituationWeightRule[];
};

type SituationWeightRule = {
  field: keyof CoreEffect | keyof BuildEffect | keyof RiskEffect | "recentTag";
  op: "gte" | "lte" | "eq" | "includes";
  value: number | string;
  weightDelta: number;
};

type Synergy = {
  id: string;
  requiredRecentCards: string[];
  name: string;
  effect: CoreEffect & RiskEffect;
  logText: string;
};
```

## 3. 후속 상황 후보 분류

### 3.1 기존 상황 카드에 매핑

| 후보 문구 | 매핑 상황 |
|---|---|
| 그래서 배운 게 뭐죠? | I-S18 그래서 배운 게 뭐죠? |
| 테스트 예산 10만 원 | I-S07 테스트 예산 10만 원 |
| 소액으로 기적 요구 | I-S08 소액으로 기적 요구 |
| 돈 녹는 중 | I-S09 돈 녹는 중 |
| 팀장님 컨펌 대기 | I-S12 팀장님 컨펌 대기 |
| 이런 느낌 말고 | I-S11 이런 느낌 말고 |
| 문구가 너무 광고 같다 | I-S05 문구가 너무 광고 같다 |
| 보고 D-day | I-S19 보고 D-day |
| 오늘 안에 가능하죠? | I-S15 오늘 안에 가능하죠? |

### 3.2 새 상황 카드 후보

다음 항목은 플레이어의 다음 선택지와 위험값에 영향을 주기 좋으므로 상황 카드로 승격하는 편이 맞다.

| 후보 문구 | 제안 카테고리 | 주요 위험값 | 유리한 카드 후보 |
|---|---|---|---|
| 예산은 남았는데 숫자가 없다 | 예산/성과 | `reportPressure`, `budgetRisk` | 구매자 포착 / 초반 부스팅 / 보고서 방패 |
| 팀장님이 더 태워보자고 함 | 예산/압박 | `budgetRisk`, `approvalRisk` | 예산 방어 / 채널 분산 / 질문 먼저 |
| 클릭값이 비싸다 | 예산/성과 | `budgetRisk` | 예산 방어 / 구매자 포착 / 분할 실험 |
| 갑자기 구매 붙음 | 기회/전환 | `budgetRisk` | 구매자 포착 / 초반 부스팅 / 채널 분산 |
| 그래서 계속 태울까요? | 예산/판단 | `budgetRisk`, `reportPressure` | 소액 테스트 / 예산 방어 / 보고서 방패 |
| 클릭만 맛집 | 콘텐츠/반응 | `reportPressure`, `brandRisk` | 구매자 포착 / 톤 정리 / 보고서 방패 |
| 사람은 왔는데 안 산다 | 성과/전환 | `reportPressure` | 구매자 포착 / 분할 실험 / 소액 테스트 |
| 썸네일 의심 | 콘텐츠/반응 | `brandRisk` | 썸네일 리롤 / 소재 강화 / 후킹 카피 |
| 팀장님 기대 상승 | 보고/압박 | `reportPressure`, `burnoutRisk` | 보고서 방패 / 일정 방어 / 질문 먼저 |
| 예쁜데 쓸모없는 자료 | 콘텐츠/리서치 | `reportPressure`, `burnoutRisk` | 질문 먼저 / 요청서 받기 / 보고서 방패 |
| 팀장님이 방향을 다시 물음 | 컨펌/방향 | `approvalRisk` | 질문 먼저 / 레퍼런스 수집 / 감도 연출 |
| 최종의 최종 수정 | 운영/수정 | `operationRisk`, `burnoutRisk` | 파일 정리 / 긴급 수정 / 요청서 받기 |
| 예쁜데 안 눌린다 | 브랜드/반응 | `reportPressure` | 클릭 유도 / 썸네일 리롤 / 분할 실험 |
| 그래서 매출은? | 보고/평가 | `reportPressure`, `approvalRisk` | 보고서 방패 / 구매자 포착 / 소액 테스트 |
| 톤은 맞는데 임팩트가 약함 | 브랜드/반응 | `reportPressure` | 후킹 카피 / 클릭 유도 / 소재 강화 |
| 클릭 반응 저조 | 콘텐츠/반응 | `reportPressure` | 소재 강화 / 후킹 카피 / 분할 실험 |
| 그건 알아서 해줘요 | 컨펌/부조리 | `approvalRisk`, `burnoutRisk` | 질문 먼저 / 레퍼런스 수집 / 일정 방어 |
| 나중에 들킴 | 컨펌/리스크 | `approvalRisk`, `brandRisk` | 보고서 방패 / 톤 정리 / 긴급 수정 |
| 최종 파일과 다름 | 운영/파일 | `operationRisk` | 파일 정리 / 요청서 받기 / 긴급 수정 |
| 다 수정했는데 하나 더 있음 | 운영/긴급 | `operationRisk`, `burnoutRisk` | 일정 방어 / 긴급 수정 / 요청서 받기 |

### 3.3 Flavor text 유지

다음 항목은 별도 선택지를 만들기보다 선택 직후 결과 로그로 쓰는 편이 낫다.

| 후보 문구 | 사용처 |
|---|---|
| 소극적 운영 | 예산 방어 선택 결과 로그 |
| 무난한 숫자 | 채널 분산 선택 결과 로그 |
| 보고할 건 생겼다 | 채널 분산 또는 소액 테스트 선택 결과 로그 |
| 대박은 없지만 망하지도 않음 | 안정 계열 선택 결과 로그 |
| 돈은 썼고 숫자는 보인다 | 초반 부스팅 선택 결과 로그 |
| A안은 망하고 B안은 산다 | 분할 실험 선택 결과 로그 |
| 클릭은 늘었다 | 후킹 카피 또는 클릭 유도 선택 결과 로그 |
| 소재 떡상 | 썸네일 리롤 성공 결과 로그 |
| 스크롤 패스 | 썸네일 리롤 실패 결과 로그 |
| 대표님이 좋아할 수도 | 감도 연출 선택 결과 로그 |
| 팀장님은 안정적이라고 함 | 톤 정리 선택 결과 로그 |
| 방향성 확인 | 질문 먼저 선택 결과 로그 |
| 팀장님이 생각보다 모름 | 질문 먼저 선택 결과 로그 |
| 조용히 통과 | 컨펌 회피 또는 컨펌 회피 + 보고서 방패 시너지 로그 |
| 좋은 지표만 골라내기 | 보고서 방패 선택 결과 로그 |
| 파일명을 찾았다 | 파일 정리 선택 결과 로그 |
| 아무도 안 알아줌 | 파일 정리 선택 결과 로그 |
| 실수 방지 | 파일 정리 선택 결과 로그 |
| 팀장님 표정이 굳음 | 일정 방어 선택 결과 로그 |
| 일정이 다시 정리됨 | 일정 방어 선택 결과 로그 |
| 말이 바뀌지 않는다 | 요청서 받기 선택 결과 로그 |
| 요청자가 조용해짐 | 요청서 받기 선택 결과 로그 |
| 그냥 해달라고 함 | 요청서 받기 선택 결과 로그 |
| 팀장님이 고마워함 | 긴급 수정 선택 결과 로그 |

### 3.4 시너지 문구로 분리

다음 항목은 단일 상황보다 특정 카드 조합의 결과 문구로 쓰는 편이 자연스럽다.

| 후보 문구 | 연결 시너지 |
|---|---|
| 소재 반응 회복 | 소재 강화 + 분할 실험 |
| 테스트 데이터 확보 | 소액 테스트 + 보고서 방패 또는 소재 강화 + 분할 실험 |
| 브랜드팀이 조용히 본다 | 클릭 유도 + 후킹 카피 |

## 4. 위험값 감쇠 규칙

- 모든 `riskEffect`는 적용 시 현재 위험값에 더한다.
- 매 턴 종료 시 위험값은 0을 향해 1씩 감쇠한다.
- 특정 시너지는 위험값을 즉시 낮추거나 다음 피해 계산에 일회성 보정값을 둔다.
- 위험값은 상황 가중치와 결과 평가에만 사용하고, 자원 수치와 별도로 표시한다.

```ts
function decayRisk(value: number): number {
  if (value > 0) return value - 1;
  if (value < 0) return value + 1;
  return 0;
}
```

## 5. 최근 3턴 시너지 판정

- `recentCards`는 최근 선택 카드 id를 최신순 또는 오래된순 중 하나로 고정해 최대 3개만 유지한다.
- 카드 선택 직후 `recentCards`에 추가한 다음 시너지를 검사한다.
- 동일 시너지는 같은 3턴 창에서 1회만 발동한다.
- 3턴 밖으로 밀려난 카드는 시너지 판정 대상에서 제외한다.

```ts
function hasRecentSynergy(recentCards: string[], requiredCards: string[]): boolean {
  return requiredCards.every((cardId) => recentCards.includes(cardId));
}
```

## 6. 상황 가중치 설계 원칙

- 기본 가중치는 모든 상황에 `1`을 둔다.
- 현재 상황의 유리 카드 태그와 최근 카드 태그가 맞으면 관련 상황 가중치를 올린다.
- 위험값이 높으면 해당 위험을 다루는 상황 가중치를 올린다.
- 같은 상황이 너무 자주 반복되지 않도록 최근 2턴 상황은 가중치를 낮춘다.
- 카드가 제안한 `followUpCandidates` 중 상황 카드로 분류된 항목은 다음 1~2턴 동안 보너스 가중치를 준다.

```ts
function clampWeight(weight: number): number {
  return Math.max(0, weight);
}
```

