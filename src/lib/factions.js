// 색상 그룹 (게임 공식 색상 기준)
// 빨간색: 하이브, 하드쉬할라
// 주황색: 기오덴, 발타크
// 회색:   매안, 파이락
// 흰색:   네블라, 아이타
// 파란색: 테란, 란티다
// 분홍색: 다카니안, 팅커로이드
// 에메랄드: 스자, 모웨이드
// 갈색:   엠바스, 타클론
// 노란색: 제노스, 글린
export const FACTIONS = [
  { code: 'terrans',       nameEn: 'Terrans',       nameKo: '테란',              color: '#3b82f6', colorGroup: 'blue'    },
  { code: 'lantids',       nameEn: 'Lantids',       nameKo: '란티다',            color: '#60a5fa', colorGroup: 'blue'    },
  { code: 'xenos',         nameEn: 'Xenos',         nameKo: '제노스',            color: '#eab308', colorGroup: 'yellow'  },
  { code: 'gleens',        nameEn: 'Gleens',        nameKo: '글린',              color: '#facc15', colorGroup: 'yellow'  },
  { code: 'taklons',       nameEn: 'Taklons',       nameKo: '타클론',            color: '#92400e', colorGroup: 'brown'   },
  { code: 'ambas',         nameEn: 'Ambas',         nameKo: '엠바스',            color: '#b45309', colorGroup: 'brown'   },
  { code: 'hadsch_hallas', nameEn: 'Hadsch Hallas', nameKo: '하드쉬 할라',       color: '#ef4444', colorGroup: 'red'     },
  { code: 'bal_taks',      nameEn: 'Baltaks',       nameKo: '발타크',            color: '#f97316', colorGroup: 'orange'  },
  { code: 'geodens',       nameEn: 'Geodens',       nameKo: '기오덴',            color: '#fb923c', colorGroup: 'orange'  },
  { code: 'firaks',        nameEn: 'Firaks',        nameKo: '파이락',            color: '#94a3b8', colorGroup: 'gray'    },
  { code: 'bescods',       nameEn: 'Bescods',       nameKo: '매안',              color: '#64748b', colorGroup: 'gray'    },
  { code: 'nevlas',        nameEn: 'Nevlas',        nameKo: '네블라',            color: '#e2e8f0', colorGroup: 'white'   },
  { code: 'itars',         nameEn: 'Itars',         nameKo: '아이타',            color: '#cbd5e1', colorGroup: 'white'   },
  { code: 'ivits',         nameEn: 'Ivits',         nameKo: '하이브',            color: '#dc2626', colorGroup: 'red'     },
  { code: 'darkanians',    nameEn: 'Darkanian',     nameKo: '다카니안',          color: '#f472b6', colorGroup: 'pink'    },
  { code: 'tinkeroids',    nameEn: 'Tinkeroid',     nameKo: '팅커로이드',        color: '#ec4899', colorGroup: 'pink'    },
  { code: 'space_giants',  nameEn: 'Space Giant',   nameKo: '스자',             color: '#10b981', colorGroup: 'emerald' },
  { code: 'mowyed',        nameEn: 'Mowayde',       nameKo: '모웨이드',          color: '#34d399', colorGroup: 'emerald' },
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
