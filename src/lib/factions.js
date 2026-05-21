// 색상 그룹 (게임 공식 색상 기준)
// 빨간색: 하이브, 하드쉬할라
// 주황색: 기오덴, 발타크
// 회색:   매드안드로이드, 파이락
// 흰색:   네블라, 아이타
// 파란색: 테란, 란티다
// 분홍색: 다카니안, 팅커로이드
// 에메랄드: 스페이스자이언트, 모웨이드
// 갈색:   엠바스, 타클론
// 노란색: 제노스, 글린
export const FACTIONS = [
  { code: 'terrans',       nameEn: 'Terrans',       nameKo: '테란',              color: '#3b82f6' }, // 파란색
  { code: 'lantids',       nameEn: 'Lantids',       nameKo: '란티다',            color: '#60a5fa' }, // 파란색
  { code: 'xenos',         nameEn: 'Xenos',         nameKo: '제노스',            color: '#eab308' }, // 노란색
  { code: 'gleens',        nameEn: 'Gleens',        nameKo: '글린',              color: '#facc15' }, // 노란색
  { code: 'taklons',       nameEn: 'Taklons',       nameKo: '타클론',            color: '#92400e' }, // 갈색
  { code: 'ambas',         nameEn: 'Ambas',         nameKo: '엠바스',            color: '#b45309' }, // 갈색
  { code: 'hadsch_hallas', nameEn: 'Hadsch Hallas', nameKo: '하드쉬 할라',       color: '#ef4444' }, // 빨간색
  { code: 'bal_taks',      nameEn: 'Baltaks',       nameKo: '발타크',            color: '#f97316' }, // 주황색
  { code: 'geodens',       nameEn: 'Geodens',       nameKo: '기오덴',            color: '#fb923c' }, // 주황색
  { code: 'firaks',        nameEn: 'Firaks',        nameKo: '파이락',            color: '#94a3b8' }, // 회색
  { code: 'bescods',       nameEn: 'Bescods',       nameKo: '매드 안드로이드',    color: '#64748b' }, // 회색
  { code: 'nevlas',        nameEn: 'Nevlas',        nameKo: '네블라',            color: '#e2e8f0' }, // 흰색
  { code: 'itars',         nameEn: 'Itars',         nameKo: '아이타',            color: '#cbd5e1' }, // 흰색
  { code: 'ivits',         nameEn: 'Ivits',         nameKo: '하이브',            color: '#dc2626' }, // 빨간색
  { code: 'darkanians',    nameEn: 'Darkanian',     nameKo: '다카니안',          color: '#f472b6' }, // 분홍색
  { code: 'tinkeroids',    nameEn: 'Tinkeroid',     nameKo: '팅커로이드',        color: '#ec4899' }, // 분홍색
  { code: 'space_giants',  nameEn: 'Space Giant',   nameKo: '스페이스 자이언트', color: '#10b981' }, // 에메랄드
  { code: 'mowyed',        nameEn: 'Mowayde',       nameKo: '모웨이드',          color: '#34d399' }, // 에메랄드
]

const byCode   = Object.fromEntries(FACTIONS.map(f => [f.code, f]))
const byNameEn = Object.fromEntries(FACTIONS.map(f => [f.nameEn, f]))
const byNameKo = Object.fromEntries(FACTIONS.map(f => [f.nameKo, f]))

export function getFaction(key) {
  return byCode[key] || byNameEn[key] || byNameKo[key] || null
}

export function getFactionColor(key) {
  return getFaction(key)?.color || '#64748b'
}
