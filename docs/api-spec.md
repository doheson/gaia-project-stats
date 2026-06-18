# 가이아 전적사이트 — 게임 결과 자동 등록 API 스펙

게임이 끝나면 아래 API로 결과를 전송하면 전적사이트에 자동으로 기록됩니다.

---

## 엔드포인트

```
POST https://gaia-stats.vercel.app/api/record-match
```

---

## 요청

### Headers

| 헤더 | 값 |
|------|----|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer <공유받은_시크릿_키>` |

### Body (JSON)

```json
{
  "played_at": "2026-06-18",
  "memo": "보드게임아레나 게임 #123456",
  "players": [
    {
      "name": "준혁/97",
      "faction": "테란",
      "bid_score": 3,
      "total_score": 48
    },
    {
      "name": "루다/90",
      "faction": "Lantids",
      "bid_score": 0,
      "total_score": 41
    },
    {
      "name": "성태/98",
      "faction": "xenos",
      "bid_score": 1,
      "total_score": 37
    },
    {
      "name": "도희/95",
      "faction": "글린",
      "bid_score": 0,
      "total_score": 33
    }
  ]
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `played_at` | string | ✅ | 게임 날짜. `YYYY-MM-DD` 형식 |
| `memo` | string | ❌ | 메모. 게임 ID나 출처 등 자유롭게 입력 |
| `players` | array | ✅ | 정확히 **4명** |
| `players[].name` | string | ✅ | 플레이어 이름. 아래 등록된 이름 목록과 **정확히 일치** 필요 |
| `players[].faction` | string | ✅ | 종족. 한국어·영어·코드 모두 허용 (아래 표 참고) |
| `players[].bid_score` | integer | ✅ | 비딩(입찰) 점수. 0 이상 정수 |
| `players[].total_score` | integer | ✅ | 게임 종료 시 원점수 (비딩 차감 전). `bid_score` 이상 정수 |

> **순위와 최종점수는 서버가 자동 계산합니다.**  
> `final_score = total_score − bid_score` 기준 내림차순으로 1~4위 결정.

---

## 종족 이름 목록

`faction` 필드에 아래 중 어느 값이든 사용 가능합니다.

| 한국어 | 영어 | 코드 |
|--------|------|------|
| 테란 | Terrans | terrans |
| 란티다 | Lantids | lantids |
| 제노스 | Xenos | xenos |
| 글린 | Gleens | gleens |
| 타클론 | Taklons | taklons |
| 엠바스 | Ambas | ambas |
| 하드쉬 할라 | Hadsch Hallas | hadsch_hallas |
| 발타크 | Baltaks | bal_taks |
| 기오덴 | Geodens | geodens |
| 파이락 | Firaks | firaks |
| 매드 안드로이드 | Bescods | bescods |
| 네블라 | Nevlas | nevlas |
| 아이타 | Itars | itars |
| 하이브 | Ivits | ivits |
| 다카니안 | Darkanian | darkanians |
| 팅커로이드 | Tinkeroid | tinkeroids |
| 스페이스 자이언트 | Space Giant | space_giants |
| 모웨이드 | Mowayde | mowyed |

---

## 플레이어 이름 목록

```
준혁/97
루다/90
(실제 목록은 전달받을 것)
```

### 이름 매칭 규칙

이름은 두 가지 방식으로 보낼 수 있습니다.

| 전송값 | 매칭 방식 | 결과 |
|--------|-----------|------|
| `"준혁/97"` | 정확히 일치 | ✅ 매칭 |
| `"준혁"` | 이름 부분만 일치 | ✅ 매칭 (동명이인 없을 때) |
| `"준혁"` | 이름 부분만 일치 | ❌ 에러 (동명이인 있을 때) |
| `"준혁/00"` | 정확히 일치 | ❌ 에러 (등록 안 된 이름) |

- 이름만 보낼 경우, DB에서 해당 이름을 가진 플레이어가 **1명뿐**이면 자동 매칭됩니다.
- **동명이인**이 있으면 `"이름/연도"` 형식으로 보내야 합니다. 에러 메시지에 후보 목록이 포함되어 있으니 그걸 참고하면 됩니다.
  ```json
  { "ok": false, "error": "이름 \"준혁\"이 여러 명과 일치합니다: 준혁/97, 준혁/02 — 이름/연도 형식으로 보내주세요" }
  ```

---

## 응답

### 성공 (`200 OK`)

```json
{
  "ok": true,
  "match_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 실패

```json
{
  "ok": false,
  "error": "등록되지 않은 플레이어: \"철수/85\""
}
```

| HTTP 상태코드 | 의미 |
|---|---|
| `400` | 요청 데이터 오류 (필드 누락, 이름 불일치, 종족 불일치 등) |
| `401` | 인증 실패 (시크릿 키 없거나 틀림) |
| `405` | POST 이외 메서드 사용 |
| `500` | 서버/DB 오류 |

---

## 예시 코드

```js
const response = await fetch('https://gaia-stats.vercel.app/api/record-match', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <시크릿_키>',
  },
  body: JSON.stringify({
    played_at: '2026-06-18',
    memo: '보드게임아레나 #123456',
    players: [
      { name: '준혁/97', faction: 'terrans',  bid_score: 3, total_score: 48 },
      { name: '루다/90', faction: 'lantids',   bid_score: 0, total_score: 41 },
      { name: '성현/89', faction: 'xenos',     bid_score: 1, total_score: 37 },
      { name: '민준/95', faction: 'gleens',    bid_score: 0, total_score: 33 },
    ],
  }),
})

const result = await response.json()
if (!result.ok) {
  console.error('등록 실패:', result.error)
}
```
