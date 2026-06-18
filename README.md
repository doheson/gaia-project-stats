# 🪐 가이아 전적사이트

상도 전략회 멤버들의 보드게임 **가이아 프로젝트(Gaia Project)** 플레이 기록을 관리하고 통계를 확인할 수 있는 전적 사이트입니다.

---

## 소개

가이아 프로젝트는 항상 **4인 플레이**로 진행되며, **18종족** 중 비딩(경매) 방식으로 종족을 선택합니다.

### 점수 체계
| 항목 | 설명 |
|------|------|
| **비딩 점수** | 해당 종족을 가져가기 위해 지불한 입찰 점수 |
| **종료 점수** | 게임 종료 시점의 원점수 |
| **최종 점수** | 종료 점수 − 비딩 점수 (순위 결정 기준) |

최종 점수 기준으로 1~4등이 결정됩니다.

---

## 주요 기능

- **대시보드** — 전체 게임 수, 플레이어 순위, 최근 게임, 최고 승률 종족 한눈에 확인
- **게임 목록** — 전체 게임 기록 조회 (날짜·종족·점수·순위)
- **게임 상세** — 단일 게임의 4인 결과 상세 확인
- **플레이어 통계** — 플레이어별 승률, 평균 점수, 최고점 등 통계 (정렬 가능)
- **플레이어 상세** — 개인 점수 추이 차트, 종족별 전적
- **종족 통계** — 18종족별 픽률, 승률, 평균 점수 비교 + 비딩 순위별 승률 분석
- **🏆 명예의 전당** — 역대 최고 기록 (종료점수·최종점수·우승 횟수 TOP 5, 종족별 최고 기록)
- **📋 종족 정보** — 18종족 시작 자원·1라운드 수입 표, 종족별 연방 구성 속도 표
- **게임 입력** — 새 게임 결과 입력 (최종 점수·순위 자동 계산)
- **플레이어 관리** — 플레이어 추가·삭제

---

## 시즌 시스템

통계는 **반기(6개월)** 단위 시즌으로 필터링할 수 있습니다.

| 시즌 | 기간 |
|------|------|
| 시즌 1 | 1월 ~ 6월 |
| 시즌 2 | 7월 ~ 12월 |

대시보드, 게임 목록, 플레이어, 종족 통계, 명예의 전당 페이지에서 시즌 필터를 사용할 수 있습니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + Vite 8 |
| 스타일 | Tailwind CSS v4 |
| 백엔드/DB | Supabase (PostgreSQL) |
| 차트 | Recharts |
| 라우팅 | React Router v7 |
| 배포 | Vercel |

---

## 프로젝트 구조

```
src/
├── lib/
│   ├── supabase.js        # Supabase 클라이언트
│   ├── factions.js        # 18종족 데이터 및 색상 정의
│   ├── seasons.js         # 시즌 계산 (반기 단위)
│   ├── stats.js           # 플레이어·종족·비딩순위 통계 집계 함수
│   ├── matches.js         # 게임 목록 그룹핑 유틸
│   └── chartStyle.js      # Recharts 공통 스타일
├── hooks/
│   └── useSeasonFilter.js # 시즌 필터 상태 훅
├── components/
│   ├── Layout.jsx         # 네비게이션 + 레이아웃
│   ├── SeasonFilter.jsx   # 시즌 선택 드롭다운
│   ├── CustomSelect.jsx   # 공용 셀렉트 컴포넌트
│   ├── FactionBadge.jsx   # 종족 색상 뱃지
│   ├── RankBadge.jsx      # 순위 뱃지 (1~4등)
│   ├── StatCard.jsx       # 통계 요약 카드
│   └── LoadingSpinner.jsx
├── pages/
│   ├── Dashboard.jsx      # 메인 대시보드
│   ├── MatchList.jsx      # 게임 목록
│   ├── MatchDetail.jsx    # 게임 상세
│   ├── Players.jsx        # 플레이어 통계 목록
│   ├── PlayerDetail.jsx   # 플레이어 상세
│   ├── Factions.jsx       # 종족 통계
│   ├── HallOfFame.jsx     # 명예의 전당
│   ├── FactionInfo.jsx    # 종족 정보
│   ├── NewMatch.jsx       # 게임 입력 폼
│   └── ManagePlayers.jsx  # 플레이어 관리
└── App.jsx                # 라우터 설정
```

---

## DB 구조 (Supabase)

| 테이블 | 설명 |
|--------|------|
| `players` | 플레이어 정보 |
| `factions` | 18종족 정보 |
| `matches` | 게임 기록 (날짜, 메모) |
| `match_results` | 게임별 플레이어 결과 (종족, 점수, 순위) |

| 뷰 | 설명 |
|----|------|
| `match_results_view` | 게임 결과 상세 조인 뷰 |
| `player_stats_view` | 플레이어별 통계 집계 뷰 |
| `faction_stats_view` | 종족별 통계 집계 뷰 |

---

## 환경 변수

`.env` 파일에 아래 두 값을 설정합니다.

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 로컬 실행

```bash
npm install
npm run dev
```
