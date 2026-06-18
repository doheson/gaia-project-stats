# 가이아 전적사이트 — Claude 작업 컨텍스트

> 다른 컴퓨터에서 작업 시작할 때: "docs/claude-context.md 읽고 이어서 작업해줘"

---

## 프로젝트 개요

**가이아 프로젝트(보드게임)** 소규모 지인 그룹(상도 전략회)의 전적 통계 사이트.

- **스택:** React 19 + Vite 8 + Tailwind v4 + Supabase + Recharts + React Router v7
- **배포:** Vercel
- **로컬 실행:** `npm run dev` → http://localhost:5173
- **git 유저:** doheson

---

## 게임 규칙

- 고정 4인 플레이
- 18종족 중 비딩(경매)으로 종족 선택
- 점수 체계:
  - `bid_score` — 비딩(입찰) 점수
  - `total_score` — 종료 점수 (게임 종료 시 원점수)
  - `final_score` — 최종 점수 = total_score − bid_score (DB GENERATED 컬럼, 순위 결정 기준)
- 플레이어 이름 형식: `이름/출생연도2자리` (예: 준혁/97, 루다/90)

---

## DB 구조 (Supabase)

**테이블:** `players`, `factions` (18종족), `matches`, `match_results`

**뷰:**
- `match_results_view` — 게임 결과 상세 조인 (주로 이걸 씀)
- `player_stats_view` — PlayerDetail에서 사용
- `faction_stats_view`

**RLS:** 전체 허용(Allow all) 정책

---

## 파일 구조

```
src/
├── lib/
│   ├── supabase.js        # Supabase 클라이언트
│   ├── factions.js        # 18종족 색상·colorGroup 매핑 (code/nameEn/nameKo 키로 조회)
│   ├── seasons.js         # 시즌 계산 유틸
│   ├── stats.js           # 통계 집계 함수 (aggregatePlayerStats, aggregateFactionStats, aggregateBidRankStats)
│   ├── matches.js         # groupByMatch (played_at → created_at 이중 정렬)
│   └── chartStyle.js      # Recharts 공통 스타일 (CHART_STYLE)
├── hooks/
│   └── useSeasonFilter.js # useState(getCurrentSeason()) 래퍼, 기본값 override 가능
├── components/
│   ├── Layout.jsx         # 네비게이션 + 레이아웃
│   ├── SeasonFilter.jsx   # 시즌 선택 드롭다운
│   ├── CustomSelect.jsx   # 공용 셀렉트 컴포넌트
│   ├── FactionBadge.jsx   # 종족 색상 뱃지 (name=영어, nameKo=한국어)
│   ├── RankBadge.jsx      # 순위 뱃지 (1~4등)
│   ├── StatCard.jsx       # 통계 요약 카드
│   └── LoadingSpinner.jsx
├── pages/
│   ├── Dashboard.jsx      # 메인 대시보드
│   ├── MatchList.jsx      # 전체 게임 목록 (rowspan 테이블)
│   ├── MatchDetail.jsx    # 게임 상세 (/matches/:id)
│   ├── Players.jsx        # 플레이어 통계 테이블 (정렬 가능)
│   ├── PlayerDetail.jsx   # 플레이어 상세 (/players/:id)
│   ├── Factions.jsx       # 종족 통계 + 비딩 순위별 승률
│   ├── HallOfFame.jsx     # 명예의 전당 (/hall-of-fame)
│   ├── FactionInfo.jsx    # 종족 정보 (/faction-info)
│   ├── NewMatch.jsx       # 게임 입력 폼
│   └── ManagePlayers.jsx  # 플레이어 관리 (/manage-players)
└── App.jsx
```

---

## 네비게이션 탭 순서

대시보드 / 게임 목록 / 플레이어 / 통계 / 🏆 명예의 전당 / 📋 종족 정보

(헤더 우측: **+ 게임 입력** 버튼 → /new-match)

---

## 시즌 시스템 (src/lib/seasons.js)

- **반기(6개월)** 단위
  - 시즌 1: 1~6월
  - 시즌 2: 7~12월
- 키 형식: `2025-S1`, `2025-S2`
- 시작 연도: 2025
- 주요 함수: `getCurrentSeason()`, `getSeasonRange()`, `getSeasonLabel()`, `getAvailableSeasons()`, `applySeasonFilter(query, season)`
- `applySeasonFilter`는 Supabase 쿼리에 `played_at` 날짜 범위 조건을 붙임

> ⚠️ 과거에는 분기(Q1~Q4) 단위였으나 2025-05-26에 반기로 변경함. DB 데이터는 그대로이고 프론트 필터 로직만 바뀐 것.

---

## 페이지별 주요 특이사항

### NewMatch.jsx (게임 입력)
- `final_score` 기준으로 순위 자동 계산 (동점 시 `total_score` 내림차순 타이브레이커)
- 종족 선택 시 같은 **colorGroup** (색상 그룹)이면 이미 선택된 것으로 간주해 비활성화
- 폼 제출: `matches` 테이블에 먼저 insert → `match_results` insert 실패 시 match 롤백

### ManagePlayers.jsx (플레이어 관리)
- 플레이어 삭제 시 비밀번호 **`1228`** 필요
- 게임 기록이 있는 플레이어는 삭제 불가

### HallOfFame.jsx (명예의 전당)
- `useSeasonFilter('all')` — 기본값이 전체 기간이지만 시즌 필터 변경 가능
- 상단 3카드: 종료점수 TOP5 / 최종점수 TOP5 / 우승횟수 TOP5
- 하단: 종족별 최고 기록 통합 테이블 (total_score 내림차순)

### FactionInfo.jsx (종족 정보)
- DB 조회 없음 — 하드코딩된 `FACTION_DATA` 사용
- 탭 3개: 시작 자원(1R 수입 후) / 기본 자원(수입 전) / 1라운드 수입
- 하단: 연방 구성 속도 테이블 (`FEDERATION_DATA`, 5~9턴+ 분류)
- ★ 기호 = 큰큰이 기술타일 뗀 건물

### Factions.jsx (종족 통계)
- 종족별 승률 BarChart (Recharts)
- 정렬 가능 테이블 (픽수/승률/우승수/평균총점/평균최종/평균비딩/평균순위)
- 비딩 순위별 승률 차트 + 테이블 (`aggregateBidRankStats` — 같은 게임 내 bid_score 높은 순)

---

## 명예의 전당 레이아웃

```
[종료점수 TOP5] [최종점수 TOP5] [우승횟수 TOP5]   ← 상단 3개 카드 (sm:grid-cols-3)

[종족별 최고 기록 통합 테이블]                     ← 하단 1개 테이블
종족 | 최고 종료점수 | 달성자 | 최고 최종점수 | 달성자
```

---

## 작업 이력

### 2025-05-26
1. **시즌 단위 변경** — 분기(3개월, Q1~Q4) → 반기(6개월, S1~S2)
   - 수정 파일: `src/lib/seasons.js`
2. **명예의 전당 탭 추가**
   - 신규: `src/pages/HallOfFame.jsx`
   - 수정: `src/App.jsx` (라우트 추가), `src/components/Layout.jsx` (네비 추가)

### 이후 추가된 기능 (현재 코드 기준)
- **종족 정보 탭** (`/faction-info`) — 18종족 시작자원·수입 표 + 연방 구성 속도 표
- **플레이어 관리** (`/manage-players`) — 플레이어 추가/삭제
- **비딩 순위별 승률** — 종족 통계 페이지 하단에 추가
- **명예의 전당 시즌 필터** — 전체 기간 기본값이지만 시즌별 조회 가능
- **lib 파일 추가** — `matches.js` (groupByMatch), `chartStyle.js` (Recharts 공통 스타일)
- **hooks 추가** — `src/hooks/useSeasonFilter.js`

---

## 참고: 자주 쓰는 쿼리 패턴

```js
// 시즌 필터 적용
let query = supabase.from('match_results_view').select('...')
query = applySeasonFilter(query, season)
const { data } = await query

// 전체 기간 조회 (명예의 전당 등)
const { data } = await supabase.from('match_results_view').select('...')

// 정렬 + 상위 N개
const { data } = await supabase
  .from('match_results_view')
  .select('...')
  .order('total_score', { ascending: false })
  .limit(5)

// groupByMatch: rows → match 단위로 그룹핑 (played_at → created_at 이중 정렬)
import { groupByMatch } from '../lib/matches'
const matches = groupByMatch(rows)

// 종족 정보 조회 (code / nameEn / nameKo 모두 가능)
import { getFaction, getFactionColor } from '../lib/factions'
getFaction('terrans')   // code
getFaction('Terrans')   // nameEn
getFaction('테란')       // nameKo
```
