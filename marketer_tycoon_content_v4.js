// marketer_tycoon_content_v4.js
// 마케터로 살아남기 v4 이벤트/공유 카드풀 데이터
// 브라우저 직접 삽입용: window.MARKETER_TYCOON_CONTENT_V4 로 접근 가능
// 모듈 환경에서는 마지막 export 구문을 사용하거나 필요한 데이터만 복사해도 됨.

(function () {
  const TOTAL_ROUNDS = 15;

  const cardFamilies = {
    organize: {
      id: "organize",
      name: "자료정리 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "일단 보기 좋게 정리해보겠습니다",
          description: "자료의 실질보다 보기 좋은 정돈감을 먼저 만든다.",
          effects: { exp: 6, trust: 0, mental: -1, budget: 0 },
          resultText: "자료가 완벽해진 것은 아니지만, 적어도 어디부터 봐야 할지는 보이기 시작했다. 팀장은 일단 보기 좋아졌다고 말했다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "필요한 자료만 추려서 보고 가능하게 만들겠습니다",
          description: "산더미 같은 자료에서 보고에 필요한 것만 골라낸다.",
          effects: { exp: 12, trust: 1, mental: -1, budget: 0 },
          resultText: "쓸모 있는 자료만 남기자 보고 흐름이 훨씬 가벼워졌다. 팀장은 필요한 것만 잘 추렸다고 평가했다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "내용은 그대로인데 정리된 것처럼 보이게 만든다",
          description: "팀장이 처음 열어볼 화면과 구조를 멀쩡하게 만들어 정리된 인상을 준다.",
          effects: { exp: 18, trust: 2, mental: -1, budget: 0 },
          resultText: "내용은 크게 바뀌지 않았지만 첫 화면과 폴더 구조가 멀쩡해지자 자료가 갑자기 정리된 것처럼 보였다. 팀장은 ‘오, 이제 좀 보이네’라고 말했다."
        }
      }
    },

    reportPackaging: {
      id: "reportPackaging",
      name: "보고서 포장 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "제가 진행한 내용부터 정리해서 공유드리겠습니다",
          description: "일단 내가 무엇을 했는지 빠짐없이 정리한다.",
          effects: { exp: 6, trust: 0, mental: -1, budget: 0 },
          resultText: "진행한 일을 정리하자 최소한 아무것도 하지 않은 사람처럼 보이진 않았다. 다만 다음 판단까지 이어지기엔 조금 부족했다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "잘된 점이랑 아쉬운 점을 같이 정리하겠습니다",
          description: "성과와 문제를 함께 보여줘 보고의 신뢰도를 높인다.",
          effects: { exp: 13, trust: 1, mental: -2, budget: 0 },
          resultText: "좋은 점과 아쉬운 점을 함께 말하자 보고가 훨씬 안정적으로 보였다. 팀장은 숫자를 숨기지 않은 점을 좋게 봤다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "보고서의 단어 몇 개를 영어로 바꾼다",
          description: "실질은 거의 그대로지만 보고서가 갑자기 있어 보이는 회사식 포장술.",
          effects: { exp: 18, trust: 2, mental: 1, budget: 0 },
          resultText: "문제점은 Issue가 되었고, 다음 할 일은 Next Action이 되었다. 내용은 거의 그대로였지만 보고서는 갑자기 임원 보고용처럼 보였다. 팀장은 흐뭇하게 고개를 끄덕였다."
        }
      }
    },

    dataRead: {
      id: "dataRead",
      name: "데이터 해석 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "팀장님, 숫자 먼저 확인하고 말씀드리겠습니다",
          description: "느낌보다 지표를 먼저 확인한다.",
          effects: { exp: 7, trust: 0, mental: -1, budget: 0 },
          resultText: "숫자를 먼저 확인하자 적어도 감으로 말하는 상황은 피할 수 있었다. 아직 깊은 분석은 아니지만 출발은 나쁘지 않았다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "이건 클릭 전후를 나눠서 봐야 원인이 보입니다",
          description: "노출-클릭-전환을 나눠 문제 구간을 좁힌다.",
          effects: { exp: 14, trust: 1, mental: -2, budget: 0 },
          resultText: "클릭 전후를 나누자 문제의 위치가 조금씩 보였다. 팀장은 원인을 쪼개서 보려는 태도를 좋게 봤다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "좋은 숫자는 성과로, 나쁜 숫자는 개선 포인트로 바꾼다",
          description: "같은 숫자도 보고서에서 덜 망한 구조로 재배치한다.",
          effects: { exp: 20, trust: 2, mental: -1, budget: 0 },
          resultText: "좋은 숫자는 앞에서 성과로 보이고, 나쁜 숫자는 뒤에서 개선 포인트가 되었다. 숫자는 그대로였지만 보고서는 훨씬 덜 위험해 보였다."
        }
      }
    },

    direction: {
      id: "direction",
      name: "방향성 정리 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "혹시 방향을 한 번만 더 확인해도 될까요?",
          description: "애매한 지시를 그대로 받지 않고 조심스럽게 확인한다.",
          effects: { exp: 6, trust: 0, mental: 0, budget: 0 },
          resultText: "방향을 다시 묻자 팀장은 잠깐 고민했다. 완벽한 답은 아니었지만 최소한 완전히 빗나가진 않게 되었다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "A안, B안, 현실적으로 가능한 C안까지 정리하겠습니다",
          description: "막연한 요청을 선택 가능한 안으로 바꾼다.",
          effects: { exp: 13, trust: 1, mental: -1, budget: 0 },
          resultText: "선택지가 생기자 회의가 조금 덜 떠다니기 시작했다. 팀장은 그중 현실적으로 가능한 안을 고르기 시작했다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "방향 없는 요청을 고를 수 있는 척 만들어준다",
          description: "사실 정해진 건 없지만, 팀장이 고른 것처럼 보이는 선택지를 만든다.",
          effects: { exp: 19, trust: 2, mental: -1, budget: 0 },
          resultText: "방향은 여전히 애매했지만 보기 좋은 선택지가 생기자 모두가 결정한 기분을 느꼈다. 팀장은 ‘이 중에서 2안으로 가자’고 말했다."
        }
      }
    },

    copyPackaging: {
      id: "copyPackaging",
      name: "카피 포장 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "문구가 조금 광고처럼 보여서 톤만 다듬겠습니다",
          description: "너무 노골적인 표현을 살짝 부드럽게 만든다.",
          effects: { exp: 6, trust: 0, mental: -1, budget: 0 },
          resultText: "문구가 조금 덜 딱딱해졌다. 큰 변화는 아니지만 적어도 대놓고 광고처럼 보이진 않게 됐다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "제품 자랑보다 고객 상황에서 시작하는 게 좋아 보입니다",
          description: "제품 장점을 소비자의 문제와 연결한다.",
          effects: { exp: 13, trust: 1, mental: -1, budget: 0 },
          resultText: "고객 상황에서 시작하자 제품 장점이 조금 더 자연스럽게 읽혔다. 팀장은 이전보다 판매 페이지답다고 말했다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "바이럴은 원래 운입니다^^",
          description: "모두가 바이럴을 원하지만 아무도 보장할 수 없다는 사실을 웃으면서 넘긴다.",
          effects: { exp: 18, trust: 1, mental: 1, budget: 0 },
          resultText: "회의실은 잠깐 조용해졌다. 모두가 바이럴을 원했지만, 아무도 바이럴이 왜 되는지는 정확히 설명하지 못했다. 결국 문구는 ‘바이럴 가능성 있는 톤’으로 정리되었다."
        }
      }
    },

    brandDefense: {
      id: "brandDefense",
      name: "브랜드 방어 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "브랜드 톤이랑 조금만 맞춰보겠습니다",
          description: "브랜드 톤에서 크게 벗어난 부분만 살짝 조정한다.",
          effects: { exp: 6, trust: 0, mental: -1, budget: 0 },
          resultText: "브랜드 톤이 완전히 살아난 것은 아니지만, 적어도 크게 어긋난 부분은 줄어들었다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "후킹은 살리되, 싸 보이지 않게 정리하겠습니다",
          description: "클릭 요소는 남기고 브랜드 체면을 지킨다.",
          effects: { exp: 14, trust: 1, mental: -2, budget: 0 },
          resultText: "후킹은 남기고 표현 수위를 낮추자 MD와 브랜드 쪽 모두 완전히 만족하진 않았지만, 모두가 크게 반대하지 않는 안이 나왔다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "싸 보이는 부분만 조용히 걷어낸다",
          description: "모두의 요구를 건드리지 않는 척하면서 브랜드가 망가지는 부분만 덜어낸다.",
          effects: { exp: 20, trust: 2, mental: -1, budget: 0 },
          resultText: "할인율과 제품은 남아 있었지만 묘하게 싼티 나는 표현만 사라졌다. 아무도 정확히 무엇이 빠졌는지 몰랐지만 결과물은 확실히 덜 부끄러워졌다."
        }
      }
    },

    agency: {
      id: "agency",
      name: "대행사 대응 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "대행사에 조금 더 구체적으로 요청해보겠습니다",
          description: "두루뭉술한 답변을 한 번 더 캐묻는다.",
          effects: { exp: 6, trust: 0, mental: -1, budget: 0 },
          resultText: "대행사는 조금 더 자세한 설명을 보내왔다. 완전히 만족스럽진 않았지만 처음보다는 덜 공허했다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "분석 말고 다음 액션까지 같이 받아보겠습니다",
          description: "원인 분석과 다음 조정안을 함께 요구한다.",
          effects: { exp: 14, trust: 1, mental: -2, budget: 0 },
          resultText: "대행사에서 다음 조정안까지 보내오자 회의에서 바로 논의할 수 있는 재료가 생겼다. 팀장은 이제 좀 회의가 되겠다고 말했다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "대행사의 애매한 말을 팀장님이 좋아할 액션처럼 바꿔온다",
          description: "대행사 리포트의 빈말을 내부 보고용 액션 문장으로 번역한다.",
          effects: { exp: 19, trust: 2, mental: -1, budget: 0 },
          resultText: "‘학습 중’은 ‘소재 2번 교체, 타겟 A 축소 검토’가 되었다. 같은 리포트였지만 팀장님이 좋아하는 액션 문장으로 바뀌자 회의가 굴러가기 시작했다."
        }
      }
    },

    budget: {
      id: "budget",
      name: "예산 운영 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "일단 어디서 예산이 많이 빠지는지 확인하겠습니다",
          description: "예산이 빠르게 소진되는 구간을 먼저 파악한다.",
          effects: { exp: 7, trust: 0, mental: -1, budget: 3000 },
          resultText: "어디서 예산이 빠르게 나가는지 확인하자 최소한 손실 구간은 보이기 시작했다. 아직 조정은 남아 있다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "성과 안 나오는 세트만 먼저 줄이겠습니다",
          description: "전체를 멈추지 않고 비효율 세트만 줄인다.",
          effects: { exp: 15, trust: 1, mental: -2, budget: 9000 },
          resultText: "성과가 낮은 세트만 줄이자 전체 캠페인은 유지되면서 예산 누수는 줄었다. 팀장은 판단이 현실적이었다고 봤다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "예산을 줄인 게 아니라 효율화한 것처럼 말한다",
          description: "삭감처럼 보이지 않게 비효율 구간 정리로 포장한다.",
          effects: { exp: 20, trust: 2, mental: -1, budget: 14000 },
          resultText: "돈이 새는 구간을 줄였지만 보고서에는 ‘효율 중심 재배분’이라고 적었다. 팀장은 예산을 줄인 게 아니라 운영을 잘한 것으로 받아들였다."
        }
      }
    },

    risk: {
      id: "risk",
      name: "검수/책임 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "이건 지금 바로 공유드리는 게 맞을 것 같습니다",
          description: "문제를 혼자 안고 있지 않고 빠르게 공유한다.",
          effects: { exp: 7, trust: 1, mental: -1, budget: 0 },
          resultText: "문제를 바로 공유하자 큰 사고로 번지기 전에 모두가 상황을 알게 됐다. 적어도 혼자 뒤집어쓰진 않게 됐다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "수정본까지 같이 전달드리겠습니다",
          description: "문제만 말하지 않고 해결 가능한 대안을 함께 보낸다.",
          effects: { exp: 14, trust: 2, mental: -2, budget: 0 },
          resultText: "문제와 수정본을 함께 보내자 처리 속도가 빨라졌다. 팀장은 문제를 발견한 것보다 바로 고친 점을 좋게 봤다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "확인한 사람을 도망 못 가게 만든다",
          description: "검수 책임이 공중분해되지 않게 기록으로 남긴다.",
          effects: { exp: 20, trust: 2, mental: -1, budget: 0 },
          resultText: "확인자와 확인 범위를 남기자 모두가 갑자기 신중해졌다. 아무도 책임지고 싶지 않았지만, 이제 아무도 못 봤다고 하긴 어려워졌다."
        }
      }
    },

    schedule: {
      id: "schedule",
      name: "일정 조율 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "오늘 나가야 하는 것부터 먼저 처리하겠습니다",
          description: "당장 터질 산출물부터 막는다.",
          effects: { exp: 7, trust: 0, mental: -1, budget: 0 },
          resultText: "급한 것부터 처리하자 오늘 터질 불은 일단 막았다. 다만 뒤로 밀린 일은 그대로 남았다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "필수 노출물만 먼저 확정하고 나머지는 후순위로 빼겠습니다",
          description: "필수 산출물과 부가 산출물을 나눠 마감을 맞춘다.",
          effects: { exp: 14, trust: 1, mental: -2, budget: 0 },
          resultText: "필수 노출물을 먼저 확정하자 최소한 오픈에 필요한 것은 살아남았다. 팀장은 우선순위를 나눈 점을 좋게 봤다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "퀄리티를 포기한 게 아니라 일정에 맞춘 결과물이라고 말한다",
          description: "조진 결과물을 마감 대응 버전으로 포장한다.",
          effects: { exp: 18, trust: 1, mental: 1, budget: 0 },
          resultText: "결과물은 솔직히 조금 거칠었지만, 보고서에는 ‘일정 대응 버전’이라고 적혔다. 팀장은 마감에 맞춘 점을 더 크게 봤고, 완성도 이야기는 다음 단계로 밀렸다."
        }
      }
    },

    meetingNote: {
      id: "meetingNote",
      name: "회의록 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "회의 내용부터 다시 정리해보겠습니다",
          description: "흩어진 회의 내용을 다시 묶는다.",
          effects: { exp: 6, trust: 0, mental: -1, budget: 0 },
          resultText: "회의 내용이 다시 정리되자 적어도 무엇을 말했는지는 보이기 시작했다. 아직 결정은 남아 있다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "결정사항과 논의사항을 나눠서 공유하겠습니다",
          description: "정해진 것과 아직 떠 있는 것을 나눠 혼선을 줄인다.",
          effects: { exp: 13, trust: 1, mental: -1, budget: 0 },
          resultText: "결정사항과 논의사항을 나누자 회의 후 일이 조금 덜 불어났다. 팀장은 정리가 깔끔하다고 말했다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "누가 말했는지 남겨서 나중에 모른 척 못 하게 한다",
          description: "떠다니던 의견에 발화자를 붙여 책임을 기록으로 남긴다.",
          effects: { exp: 19, trust: 2, mental: -1, budget: 0 },
          resultText: "회의록에 이름이 붙자 모두의 말이 갑자기 신중해졌다. 아무도 강하게 반박하진 않았지만, 이제 나중에 모른 척하긴 어려워졌다."
        }
      }
    },

    failureSpin: {
      id: "failureSpin",
      name: "실패 포장 카드",
      cards: {
        silver: {
          tier: "silver",
          tierLabel: "실버",
          effectLabel: "미미한 효과",
          title: "좋았던 내용부터 먼저 정리하겠습니다",
          description: "좋은 부분을 먼저 보여줘 분위기를 방어한다.",
          effects: { exp: 6, trust: 0, mental: 0, budget: 0 },
          resultText: "좋았던 내용부터 말하자 보고 분위기는 무난하게 시작됐다. 하지만 아쉬운 부분을 피하긴 어려웠다."
        },
        gold: {
          tier: "gold",
          tierLabel: "골드",
          effectLabel: "괜찮은 효과",
          title: "실패 원인과 다음 액션을 같이 정리하겠습니다",
          description: "실패를 숨기지 않고 다음 행동으로 연결한다.",
          effects: { exp: 15, trust: 2, mental: -2, budget: 0 },
          resultText: "실패 원인과 다음 액션을 함께 말하자 보고가 훨씬 탄탄해졌다. 팀장은 실패 자체보다 다음 판단을 좋게 봤다."
        },
        platinum: {
          tier: "platinum",
          tierLabel: "플래티넘",
          effectLabel: "진짜 좋은 효과",
          title: "삽질을 인사이트처럼 보이게 만든다",
          description: "실패와 낭비를 다음 캠페인에 쓸 수 있는 학습처럼 포장한다.",
          effects: { exp: 20, trust: 2, mental: 1, budget: 0 },
          resultText: "망한 소재는 ‘반응이 낮았던 패턴 확인’이 되었고, 늦은 판단은 ‘운영 기준 보완점’이 되었다. 삽질은 사라지지 않았지만 보고서 안에서는 인사이트처럼 보였다."
        }
      }
    }
  };

  const stage1RandomEvents = [
    {
      id: "stage1_organize_fear",
      stage: 1,
      title: "“이거 한 번 정리해줘”의 공포",
      risk: "낮음",
      description: "팀장이 지난 캠페인 자료 폴더를 공유하며 “이거 한 번 정리해줘”라고 말했다. 정리 기준도, 마감 시간도, 보고 대상도 없다. 폴더 안에는 최종_final_진짜최종_수정2 파일이 18개 있고, 그중 절반은 열리지 않는다. 이건 자료 정리가 아니라 회사의 고대 문명을 발굴하는 일에 가깝다. 문제는 이 유물을 오늘 안에 보고 가능한 형태로 바꿔야 한다는 점이다.",
      question: "이 모호한 자료 정리 요청에 어떻게 대응할까요?",
      allowedCardFamilies: ["organize", "direction", "schedule"]
    },
    {
      id: "stage1_modern_feeling",
      stage: 1,
      title: "회의에서 나온 “요즘 느낌” 해석하기",
      risk: "낮음",
      description: "회의 중 누군가 “좀 더 요즘 느낌으로 가면 좋겠다”고 말했다. 모두 고개를 끄덕였지만, 아무도 그 요즘이 어느 요즘인지 설명하지 않았다. 팀장은 레퍼런스를 찾아보자고 했고, 그 일은 자연스럽게 당신에게 넘어왔다. 이제 당신은 세대 감각, 브랜드 톤, 대표님 취향을 한 장의 기획안으로 번역해야 한다. 문제는 아무도 정답을 모르지만, 틀리면 당신 자료가 틀린 것이 된다는 점이다.",
      question: "정의되지 않은 ‘요즘 느낌’을 어떻게 정리할까요?",
      allowedCardFamilies: ["direction", "meetingNote", "reportPackaging"]
    },
    {
      id: "stage1_sns_caption_adlike",
      stage: 1,
      title: "SNS 캡션이 광고 같다고 한다",
      risk: "낮음",
      description: "신제품 SNS 캡션을 작성했더니 팀장이 “너무 광고 같아”라고 말했다. 그런데 제품 장점은 다 들어가야 하고, 행사 혜택도 빠지면 안 되고, 브랜드 톤도 살아야 한다. 광고 같으면 안 되지만 광고의 목적은 달성해야 하는 이상한 퍼즐이 시작됐다. 결국 당신은 “팔아야 하지만 팔려는 티는 나면 안 되는” 문장을 만들어야 한다.",
      question: "광고 같지만 광고 같지 않아야 하는 캡션을 어떻게 바꿀까요?",
      allowedCardFamilies: ["copyPackaging", "brandDefense", "direction"]
    },
    {
      id: "stage1_report_numbers_no_answer",
      stage: 1,
      title: "리포트 숫자는 많은데 답은 없다",
      risk: "보통",
      description: "광고 리포트에는 숫자가 많다. 노출도 있고, 클릭도 있고, CPC도 있고, 전환도 있다. 그런데 팀장은 “그래서 좋은 거야 나쁜 거야?”라고 물었다. 숫자는 많지만 결론은 자동으로 나오지 않는다. 이제 당신은 숫자 더미에서 의미를 꺼내, 회의실 사람들이 이해할 수 있는 한 문장으로 바꿔야 한다.",
      question: "숫자만 많은 리포트를 어떻게 보고할까요?",
      allowedCardFamilies: ["dataRead", "reportPackaging", "failureSpin"]
    },
    {
      id: "stage1_pretty_refs",
      stage: 1,
      title: "예쁜 레퍼런스만 잔뜩 모았다가 혼났다",
      risk: "낮음",
      description: "경쟁 브랜드 레퍼런스를 열심히 모아갔다. 화면에는 감각적인 이미지들이 가득했고, 당신은 꽤 그럴듯하다고 생각했다. 하지만 팀장은 “그래서 우리가 참고할 포인트가 뭔데?”라고 물었다. 예쁜 이미지를 모으는 것과 쓸모 있는 인사이트를 정리하는 것은 전혀 다른 일이었다. 이제 레퍼런스를 감상 자료가 아니라 실행 근거로 바꿔야 한다.",
      question: "레퍼런스 자료를 어떻게 다시 살릴까요?",
      allowedCardFamilies: ["organize", "reportPackaging", "copyPackaging"]
    },
    {
      id: "stage1_no_permission",
      stage: 1,
      title: "자료는 급한데 권한은 없다",
      risk: "보통",
      description: "오후 회의 자료에 필요한 수치를 확인하려고 했지만, 광고 계정 접근 권한이 없다. 대행사에 요청하자 담당자는 회의 중이고, 팀장은 곧 자료가 필요하다고 한다. 책임은 이미 당신에게 내려왔지만, 권한은 아직 초대 메일에도 도착하지 않았다. 회사는 가끔 사람에게 열쇠 없이 문을 열라고 시킨다. 이제 당신은 권한 없는 책임을 어떻게든 보고 가능한 상태로 만들어야 한다.",
      question: "권한 없는 책임을 어떻게 버틸까요?",
      allowedCardFamilies: ["agency", "schedule", "organize"]
    },
    {
      id: "stage1_brand_guide",
      stage: 1,
      title: "아무도 안 보는 브랜드 가이드를 발견했다",
      risk: "보통",
      description: "공유 폴더 깊숙한 곳에서 브랜드 가이드를 발견했다. 그런데 최근 제작된 배너들은 가이드와 묘하게 다르다. 이걸 말하면 일이 늘어날 것 같고, 모른 척하면 앞으로 더 이상한 결과물이 나올 것 같다. 브랜드 가이드는 원래 아무도 안 보다가 문제가 생기면 갑자기 성경처럼 소환된다. 이제 당신은 조용히 넘어갈지, 지금 선을 그을지 선택해야 한다.",
      question: "브랜드 가이드 문제를 어떻게 꺼낼까요?",
      allowedCardFamilies: ["brandDefense", "risk", "meetingNote"]
    }
  ];

  const stage2RandomEvents = [
    {
      id: "stage2_algorithm_learning",
      stage: 2,
      title: "“알고리즘 학습 중입니다”라는 마법의 문장",
      risk: "보통",
      description: "광고 성과가 기대보다 낮아 대행사에 이유를 물었다. 돌아온 답은 “현재 알고리즘 학습 중으로 보입니다”였다. 이 문장은 이상하게 모든 질문을 흡수하지만, 아무런 해결책도 주지 않는다. 팀장은 그래서 다음 액션이 뭐냐고 묻고 있고, 예산은 여전히 조용히 타고 있다. 이제 당신은 ‘학습 중’이라는 안개 속에서 실제로 바꿀 수 있는 것을 끌어내야 한다.",
      question: "대행사의 애매한 답변을 어떻게 처리할까요?",
      allowedCardFamilies: ["agency", "dataRead", "budget"]
    },
    {
      id: "stage2_md_big_brand_small",
      stage: 2,
      title: "MD는 크게, 브랜드는 작게",
      risk: "높음",
      description: "온라인몰 MD는 할인율을 더 크게 넣어달라고 했다. 브랜드팀은 로고 여백과 톤앤매너를 지켜달라고 했다. 대표님은 제품이 더 커야 한다고 했다. 배너 사이즈는 그대로인데 모두의 욕망만 커지고 있다. 이대로 다 넣으면 광고가 아니라 요구사항 전시회가 될 가능성이 높다.",
      question: "서로 다른 요구를 어떻게 한 장 안에 넣을까요?",
      allowedCardFamilies: ["brandDefense", "direction", "meetingNote"]
    },
    {
      id: "stage2_budget_burning",
      stage: 2,
      title: "예산이 녹고 있다",
      risk: "높음",
      description: "광고 예산이 예상보다 빠르게 사라지고 있다. 노출은 잘 나오는데 전환은 따라오지 않고, 대시보드는 조용히 빨간 숫자를 보여준다. 팀장은 “일단 더 봐야 하나?”라고 묻지만, 더 보는 동안 돈은 계속 나간다. 광고비는 기다려주지 않는다. 지금 멈추지 않으면 학습이 아니라 소각이 될 수 있다.",
      question: "예산이 녹는 상황을 어떻게 수습할까요?",
      allowedCardFamilies: ["budget", "dataRead", "agency"]
    },
    {
      id: "stage2_influencer_homeshopping",
      stage: 2,
      title: "인플루언서가 브랜드를 홈쇼핑으로 만들었다",
      risk: "보통",
      description: "협업 인플루언서가 업로드 전 콘텐츠를 보내왔다. 제품은 잘 보이지만 멘트가 지나치게 과장되어 브랜드가 갑자기 심야 홈쇼핑처럼 보인다. 일정은 내일 오전이고, 수정 요청을 세게 하면 관계가 불편해질 수 있다. 하지만 그대로 올리면 댓글창이 먼저 불편해질 것 같다. 지금 필요한 건 착한 피드백이 아니라 브랜드가 살아남는 수정 요청이다.",
      question: "인플루언서 콘텐츠를 어떻게 조정할까요?",
      allowedCardFamilies: ["brandDefense", "risk", "copyPackaging"]
    },
    {
      id: "stage2_typo_before_live",
      stage: 2,
      title: "라이브 10분 전 오타 발견",
      risk: "높음",
      description: "프로모션 배너가 곧 라이브된다. 그런데 최종 확인 중 제품명 오타를 발견했다. 이미 퍼블리싱 담당자는 업로드 준비를 마쳤고, 누군가는 “그 정도는 티 안 나지 않나?”라고 말했다. 이상하게 작은 오타일수록 라이브 후에는 제일 크게 보인다. 지금 넘기면 빠르지만, 나중에 캡처로 돌아올 가능성이 높다.",
      question: "라이브 직전 오타를 어떻게 처리할까요?",
      allowedCardFamilies: ["risk", "schedule", "meetingNote"]
    },
    {
      id: "stage2_schedule_pulled",
      stage: 2,
      title: "일정이 하루 앞당겨졌다",
      risk: "높음",
      description: "프로모션 일정이 갑자기 하루 앞당겨졌다. 이유는 “위에서 그렇게 하래”였다. 배너, 상세페이지, 광고 소재, 문구 검수가 모두 덜 끝났지만, 일정표는 이미 바뀌었다. 불가능은 결정권자의 한마디로 가능해 보이지만, 실제 작업자는 여전히 사람이다. 이제 남은 일은 무리한 일정을 어디까지 현실로 쪼갤지 정하는 것이다.",
      question: "앞당겨진 일정을 어떻게 맞출까요?",
      allowedCardFamilies: ["schedule", "risk", "organize"]
    },
    {
      id: "stage2_meeting_added_work",
      stage: 2,
      title: "회의가 끝났는데 일이 늘었다",
      risk: "보통",
      description: "회의는 분명히 정리하려고 들어간 자리였다. 그런데 끝나고 보니 해야 할 일이 3개에서 9개가 되어 있었다. 누가 결정했는지는 불분명하지만, 담당자는 이상하게 당신으로 적혀 있다. 회의록이 없었다면 이것은 꿈이었을지도 모른다. 이제 당신은 떠다니는 의견들을 실제 결정사항으로 묶어야 한다.",
      question: "회의 후 늘어난 일을 어떻게 정리할까요?",
      allowedCardFamilies: ["meetingNote", "direction", "schedule"]
    }
  ];

  const stage3RandomEvents = [
    {
      id: "stage3_click_no_purchase",
      stage: 3,
      title: "클릭은 되는데 구매는 안 된다",
      risk: "높음",
      description: "광고 클릭률은 나쁘지 않다. 그런데 구매 전환율이 낮다. 사람들은 들어오긴 하는데 조용히 나가고 있다. 마치 매장 문은 열었는데 손님들이 가격표를 보고 뒷걸음질 치는 느낌이다. 이제 문제를 광고 소재 탓으로 넘길지, 구매까지 가는 길목을 제대로 볼지 결정해야 한다.",
      question: "클릭 이후의 전환 문제를 어떻게 볼까요?",
      allowedCardFamilies: ["dataRead", "budget", "agency"]
    },
    {
      id: "stage3_brand_cheap_performance_good",
      stage: 3,
      title: "성과는 좋은데 브랜드가 싸 보인다",
      risk: "높음",
      description: "강한 후킹 문구를 넣은 광고가 좋은 클릭률을 기록했다. 문제는 댓글 반응과 내부 피드백에서 브랜드가 너무 저렴해 보인다는 말이 나오기 시작했다는 점이다. 숫자는 이 소재를 살리라고 말하고, 브랜드 감각은 이대로 두면 위험하다고 말한다. 마케터는 오늘도 클릭률과 품격 사이에서 줄타기를 한다. 이 성과가 진짜 성과인지, 브랜드를 깎아 만든 숫자인지 판단해야 한다.",
      question: "성과와 브랜드 톤이 충돌할 때 어떻게 조정할까요?",
      allowedCardFamilies: ["brandDefense", "copyPackaging", "dataRead"]
    },
    {
      id: "stage3_competitor_discount",
      stage: 3,
      title: "경쟁사가 갑자기 미친 할인율을 들고 나왔다",
      risk: "높음",
      description: "경쟁사가 같은 카테고리에서 강한 할인 프로모션을 시작했다. 우리 할인율은 갑자기 소박해 보이고, 소비자 관심은 경쟁사 쪽으로 쏠릴 수 있다. 그렇다고 가격을 따라 내리면 마진이 먼저 죽는다. 할인 전쟁은 늘 시작한 쪽보다 따라가는 쪽이 더 피곤하다. 이제 가격으로 맞불을 놓을지, 다른 구매 이유를 만들어낼지 선택해야 한다.",
      question: "경쟁사 할인 공세에 어떻게 대응할까요?",
      allowedCardFamilies: ["brandDefense", "budget", "copyPackaging"]
    },
    {
      id: "stage3_negative_comment",
      stage: 3,
      title: "부정 댓글 하나가 회의 안건이 됐다",
      risk: "보통",
      description: "광고 게시물에 부정 댓글이 달렸다. 댓글은 하나였지만, 캡처되어 단체방에 올라간 순간 그것은 하나가 아니게 됐다. 누군가는 바로 숨기자고 하고, 누군가는 답변을 달자고 하고, 누군가는 왜 이런 댓글이 달렸는지 원인을 분석하자고 한다. 작은 댓글 하나가 브랜드 위기관리 훈련으로 진화했다. 지금은 감정적으로 반응하지 않으면서도 브랜드가 도망치지 않는 태도를 보여줘야 한다.",
      question: "부정 댓글 이슈를 어떻게 다룰까요?",
      allowedCardFamilies: ["risk", "brandDefense", "copyPackaging"]
    },
    {
      id: "stage3_report_failure",
      stage: 3,
      title: "최종 보고서에 실패를 넣을 것인가",
      risk: "보통",
      description: "최종 보고 자료를 정리하다 보니 잘한 일만 넣고 싶은 마음이 든다. 하지만 실제로는 망한 소재도 있었고, 늦게 판단한 순간도 있었고, 예산이 아깝게 녹은 시간도 있었다. 실패를 빼면 보고서는 깔끔해지지만 성장 서사는 사라진다. 회사는 실패를 좋아하지 않지만, 이상하게 실패에서 배운 척은 좋아한다. 이제 당신은 실패를 숨길지, 다음 액션으로 포장할지 선택해야 한다.",
      question: "최종 보고서에서 실패를 어떻게 다룰까요?",
      allowedCardFamilies: ["failureSpin", "reportPackaging", "dataRead"]
    },
    {
      id: "stage3_next_action",
      stage: 3,
      title: "“다음 액션은 뭐야?”라는 마지막 질문",
      risk: "높음",
      description: "중간 보고를 마친 뒤 팀장이 마지막으로 물었다. “그래서 다음 액션은 뭐야?” 지금까지는 지난 성과를 설명하는 데 집중했지만, 이 질문은 앞으로 뭘 바꿀 수 있는지를 묻고 있다. 보고가 끝난 줄 알았는데 사실 이제부터가 진짜 평가였다. 숫자를 읽는 사람으로 남을지, 다음 판단을 만드는 사람으로 보일지 갈리는 순간이다.",
      question: "다음 액션을 어떻게 제시할까요?",
      allowedCardFamilies: ["dataRead", "failureSpin", "reportPackaging"]
    },
    {
      id: "stage3_team_review_screen",
      stage: 3,
      title: "팀 전체가 보는 자리에서 내 자료가 열린다",
      risk: "높음",
      description: "팀 전체 회의에서 당신이 정리한 자료가 화면에 띄워졌다. 평소에는 아무도 안 보던 작은 수치와 문구들이 갑자기 모두의 시선을 받는다. 누군가 “이 부분은 왜 이렇게 했어요?”라고 묻는 순간, 자료는 더 이상 파일이 아니라 당신의 생존 기록이 된다. 이제 필요한 건 변명이 아니라, 내가 왜 그렇게 판단했는지를 설명할 수 있는 구조다.",
      question: "팀 전체 앞에서 자료를 어떻게 방어할까요?",
      allowedCardFamilies: ["organize", "meetingNote", "risk", "reportPackaging"]
    }
  ];

  const fixedEventsByRound = {
    5: {
      id: "fixed_round_5_midcheck",
      stage: 1,
      round: 5,
      title: "첫 중간 점검: “그래서 뭐가 된 거야?”",
      risk: "고정 평가",
      description: "5라운드까지 어찌저찌 업무를 처리했지만, 팀장은 이제 결과를 묻기 시작했다. “그래서 뭐가 좋아졌어?”라는 질문 앞에서, 단순히 바빴다는 말은 아무 힘이 없다. 열심히 한 일은 많지만, 회사는 열심히보다 변화한 숫자와 설명 가능한 판단을 좋아한다. 이제 당신은 흩어진 업무를 성과처럼 보이게 정리해야 한다.",
      question: "첫 중간 점검을 어떻게 넘길까요?",
      allowedCardFamilies: ["reportPackaging", "dataRead", "failureSpin"]
    },
    10: {
      id: "fixed_round_10_crisis",
      stage: 2,
      round: 10,
      title: "후반 위기: 성과는 떨어지고 의견은 늘어난다",
      risk: "고정 위기",
      description: "캠페인 후반에 접어들자 성과가 흔들리기 시작했다. 초반에 반응이 좋던 소재는 피로도가 쌓였고, 예산은 꾸준히 소진되고 있으며, 회의에서는 각자 다른 해결책이 쏟아지고 있다. 누군가는 소재를 바꾸자고 하고, 누군가는 예산을 줄이자고 하고, 누군가는 “그냥 더 세게 가자”고 한다. 성과가 떨어질수록 의견은 많아지고, 책임은 흐려진다. 이제 당신은 의견이 아니라 구조를 잡아야 한다.",
      question: "후반 위기를 어떻게 정리할까요?",
      allowedCardFamilies: ["dataRead", "budget", "failureSpin", "agency"]
    },
    15: {
      id: "fixed_round_15_final",
      stage: 3,
      round: 15,
      title: "최종 평가: 마케터로 살아남았는가",
      risk: "최종 평가",
      description: "마지막 15라운드, 최종 리뷰 자리에 들어갔다. 지금까지 당신은 애매한 지시, 불타는 일정, 녹아내리는 예산, 갑작스러운 피드백, 흔들리는 성과 속에서 어떻게든 살아남았다. 캠페인 결과가 완벽하지는 않지만, 중요한 것은 어떤 상황에서 어떤 판단을 했고, 무엇을 배웠으며, 다음에는 어떻게 덜 망할 수 있는지다. 회사는 완벽한 인턴보다 다시 써먹을 수 있는 인턴을 원한다. 이제 당신의 생존 기록을 성과 보고서로 바꿀 시간이다.",
      question: "최종 평가를 어떻게 넘길까요?",
      allowedCardFamilies: ["reportPackaging", "dataRead", "failureSpin", "organize"]
    }
  };

  function getStageByRound(round) {
    if (round >= 1 && round <= 5) return 1;
    if (round >= 6 && round <= 10) return 2;
    if (round >= 11 && round <= 15) return 3;
    return null;
  }

  function getRandomPoolByStage(stage) {
    if (stage === 1) return stage1RandomEvents;
    if (stage === 2) return stage2RandomEvents;
    if (stage === 3) return stage3RandomEvents;
    return [];
  }

  function pickOne(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getEventForRound(round, usedEventIdsByStage = { 1: [], 2: [], 3: [] }) {
    if (fixedEventsByRound[round]) return fixedEventsByRound[round];

    const stage = getStageByRound(round);
    const pool = getRandomPoolByStage(stage);
    const usedIds = usedEventIdsByStage[stage] || [];
    const available = pool.filter((event) => !usedIds.includes(event.id));
    return pickOne(available.length ? available : pool);
  }

  function getCardsForEvent(event) {
    const familyIds = event.allowedCardFamilies || [];
    // MVP 기본: 허용 계열 중 앞 3개 계열에서 실버/골드/플래티넘 1장씩 노출.
    // 카드가 4계열 이상 허용된 최종/고정 이벤트는 앞 3개 또는 랜덤 3개로 처리 가능.
    const selectedFamilies = familyIds.slice(0, 3).map((id) => cardFamilies[id]).filter(Boolean);
    if (!selectedFamilies.length) return [];

    const tiers = ["silver", "gold", "platinum"];
    return selectedFamilies.map((family, index) => ({
      familyId: family.id,
      familyName: family.name,
      ...family.cards[tiers[index]]
    }));
  }

  function applyCardEffects(state, card) {
    const effects = card.effects || {};
    return {
      ...state,
      exp: Math.max(0, (state.exp || 0) + (effects.exp || 0)),
      trust: Math.max(0, (state.trust || 0) + (effects.trust || 0)),
      mental: Math.max(0, (state.mental || 0) + (effects.mental || 0)),
      budget: Math.max(0, (state.budget || 0) + (effects.budget || 0))
    };
  }

  const content = {
    TOTAL_ROUNDS,
    cardFamilies,
    stage1RandomEvents,
    stage2RandomEvents,
    stage3RandomEvents,
    fixedEventsByRound,
    helpers: {
      getStageByRound,
      getRandomPoolByStage,
      getEventForRound,
      getCardsForEvent,
      applyCardEffects
    }
  };

  if (typeof window !== "undefined") {
    window.MARKETER_TYCOON_CONTENT_V4 = content;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = content;
  }
})();
