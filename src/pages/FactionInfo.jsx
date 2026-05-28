import { useState } from 'react'
import { getFaction } from '../lib/factions'

// ── 아이콘 ──────────────────────────────────────────────
function CreditIcon() {
  return (
    <span className="inline-block w-3.5 h-3.5 rounded-full bg-yellow-400 border border-yellow-600/50 shrink-0" />
  )
}
function OreIcon() {
  return (
    <span className="inline-block w-3.5 h-3.5 bg-slate-200 border border-slate-400/50 shrink-0" style={{ borderRadius: 2 }} />
  )
}
function KnowledgeIcon() {
  return (
    <span className="inline-block w-3.5 h-3.5 rounded-full bg-blue-400 border border-blue-600/50 shrink-0" />
  )
}
function QICIcon() {
  return (
    <span className="inline-block w-3.5 h-3.5 bg-green-400 border border-green-600/50 shrink-0" style={{ borderRadius: 3 }} />
  )
}

function Res({ Icon, value, plus = false }) {
  const textColor = plus ? 'text-emerald-300' : 'text-slate-100'
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      <Icon />
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
        {plus && value > 0 ? `+${value}` : value}
      </span>
    </span>
  )
}

function BrainstoneIcon() {
  return (
    <span
      className="inline-block w-2 h-2 shrink-0"
      style={{
        backgroundColor: '#c084fc',
        clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
      }}
    />
  )
}

function PowerCell({ bowls, brainstone = false }) {
  const [i, ii, iii] = bowls
  return (
    <div className="flex items-center gap-0.5 text-xs tabular-nums whitespace-nowrap">
      <span className="text-slate-400">{i}</span>
      {brainstone && <BrainstoneIcon />}
      <span className="text-slate-700 mx-px">/</span>
      <span className="text-violet-300">{ii}</span>
      <span className="text-slate-700 mx-px">/</span>
      <span className={`font-bold ${iii > 0 ? 'text-violet-100' : 'text-slate-600'}`}>{iii}</span>
    </div>
  )
}

// ── 데이터 (18종족 통합) ─────────────────────────────────
const FACTION_DATA = [
  {
    code: 'terrans',
    initial:  { power: [4,4,0], brainstone: false, credits: 15, ore: 4, knowledge: 3, qic: 1, gaiaformers: 1 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 1, note: null },
    afterPower: [4,4,0],
  },
  {
    code: 'lantids',
    initial:  { power: [5,0,0], brainstone: false, credits: 13, ore: 4, knowledge: 3, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 1, note: null },
    afterPower: [5,0,0],
  },
  {
    code: 'xenos',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 4, knowledge: 3, qic: 2, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 1, note: null },
    afterPower: [2,4,0],
  },
  {
    code: 'gleens',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 5, knowledge: 3, qic: 0, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 1, note: null },
    afterPower: [2,4,0],
  },
  {
    code: 'taklons',
    initial:  { power: [2,4,0], brainstone: true, credits: 15, ore: 4, knowledge: 3, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 1, note: '브레인스톤 보유' },
    afterPower: [2,4,0],
  },
  {
    code: 'ambas',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 4, knowledge: 3, qic: 2, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 4, knowledge: 1, note: '광석수입 기본2' },
    afterPower: [2,4,0],
  },
  {
    code: 'hadsch_hallas',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 4, knowledge: 3, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 1, powerTokens: 0, qic: 0, credits: 5, ore: 3, knowledge: 1, note: '+5크레딧, +1충전' },
    afterPower: [1,5,0],
  },
  {
    code: 'ivits', label: '하이브',
    initial:  { power: [2,2,0], brainstone: false, credits: 15, ore: 4, knowledge: 3, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 4, powerTokens: 1, qic: 1, credits: 0, ore: 1, knowledge: 1, note: '의회 시작·QIC+1' },
    afterPower: [1,2,2],
  },
  {
    code: 'bal_taks',
    initial:  { power: [2,2,0], brainstone: false, credits: 15, ore: 4, knowledge: 3, qic: 0, gaiaformers: 1 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 1, note: null },
    afterPower: [2,2,0],
  },
  {
    code: 'geodens',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 6, knowledge: 3, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 1, note: null },
    afterPower: [2,4,0],
  },
  {
    code: 'bescods', label: '매드 안드로이드',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 4, knowledge: 3, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 0, note: '지식수입 없음' },
    afterPower: [2,4,0],
  },
  {
    code: 'firaks',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 3, knowledge: 2, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 2, note: '지식수입 2' },
    afterPower: [2,4,0],
  },
  {
    code: 'nevlas',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 4, knowledge: 3, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 3, knowledge: 1, note: null },
    afterPower: [2,4,0],
  },
  {
    code: 'itars',
    initial:  { power: [4,4,0], brainstone: false, credits: 15, ore: 5, knowledge: 3, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 1, qic: 0, credits: 0, ore: 3, knowledge: 1, note: '파워토큰+1' },
    afterPower: [5,4,0],
  },
  {
    code: 'darkanians',
    initial:  { power: [2,4,0], brainstone: false, credits: 15, ore: 7, knowledge: 3, qic: 2, gaiaformers: 0 },
    income:   { powerCharge: 1, powerTokens: 0, qic: 0, credits: 2, ore: 2, knowledge: 1, note: '+2크레딧, +1충전' },
    afterPower: [1,5,0],
  },
  {
    code: 'tinkeroids',
    initial:  { power: [4,2,0], brainstone: false, credits: 15, ore: 4, knowledge: 2, qic: 1, gaiaformers: 0 },
    income:   { powerCharge: 4, powerTokens: 1, qic: 0, credits: 0, ore: 1, knowledge: 2, note: '의회 시작·지식수입2' },
    afterPower: [1,6,0],
  },
  {
    code: 'space_giants',
    initial:  { power: [4,4,0], brainstone: false, credits: 15, ore: 6, knowledge: 3, qic: 2, gaiaformers: 0 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 2, knowledge: 1, note: '광산 1개 시작' },
    afterPower: [4,4,0],
  },
  {
    code: 'mowyed',
    initial:  { power: [4,4,0], brainstone: false, credits: 15, ore: 6, knowledge: 5, qic: 2, gaiaformers: 1 },
    income:   { powerCharge: 0, powerTokens: 0, qic: 0, credits: 0, ore: 2, knowledge: 1, note: '광산 1개 시작' },
    afterPower: [4,4,0],
  },
]

// ── 유틸 ──────────────────────────────────────────────────
function computeAfter(row) {
  const { initial, income, afterPower } = row
  return {
    power:      afterPower,
    brainstone: initial.brainstone,
    credits:    initial.credits   + income.credits,
    ore:        initial.ore       + income.ore,
    knowledge:  initial.knowledge + income.knowledge,
    qic:        initial.qic       + income.qic,
    gaiaformers: initial.gaiaformers,
  }
}

// ── 셀 컴포넌트 ──────────────────────────────────────────
function FactionCell({ row }) {
  const f = getFaction(row.label || row.code)
  const name = row.label || f?.nameKo || row.code
  const color = f?.color || '#64748b'
  return (
    <td className="px-3 py-2.5 whitespace-nowrap">
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
        style={{ backgroundColor: `${color}20`, color, borderColor: `${color}50` }}
      >
        {name}
      </span>
    </td>
  )
}

function GaiaCell({ count }) {
  return (
    <td className="px-3 py-2.5 text-center">
      {count > 0
        ? <span className="text-xs text-slate-300 font-semibold">{count}</span>
        : <span className="text-slate-700 text-xs">—</span>}
    </td>
  )
}

// ── 뷰별 행 ─────────────────────────────────────────────
function InitialRow({ row }) {
  const { initial } = row
  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
      <FactionCell row={row} />
      <td className="px-3 py-2.5"><PowerCell bowls={initial.power} brainstone={initial.brainstone} /></td>
      <td className="px-3 py-2.5"><Res Icon={CreditIcon} value={initial.credits} /></td>
      <td className="px-3 py-2.5"><Res Icon={OreIcon} value={initial.ore} /></td>
      <td className="px-3 py-2.5"><Res Icon={KnowledgeIcon} value={initial.knowledge} /></td>
      <td className="px-3 py-2.5"><Res Icon={QICIcon} value={initial.qic} /></td>
      <GaiaCell count={initial.gaiaformers} />
    </tr>
  )
}

function IncomeRow({ row }) {
  const { income } = row
  const powerDesc = []
  if (income.powerCharge > 0) powerDesc.push(`충전+${income.powerCharge}`)
  if (income.powerTokens > 0) powerDesc.push(`토큰+${income.powerTokens}`)
  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
      <FactionCell row={row} />
      <td className="px-3 py-2.5 text-xs text-violet-300 whitespace-nowrap">
        {powerDesc.length > 0 ? powerDesc.join(', ') : <span className="text-slate-700">—</span>}
      </td>
      <td className="px-3 py-2.5">
        {income.credits > 0
          ? <Res Icon={CreditIcon} value={income.credits} plus />
          : <span className="text-slate-700 text-xs">—</span>}
      </td>
      <td className="px-3 py-2.5"><Res Icon={OreIcon} value={income.ore} plus /></td>
      <td className="px-3 py-2.5">
        {income.knowledge > 0
          ? <Res Icon={KnowledgeIcon} value={income.knowledge} plus />
          : <span className="text-slate-700 text-xs">—</span>}
      </td>
      <td className="px-3 py-2.5">
        {income.qic > 0
          ? <Res Icon={QICIcon} value={income.qic} plus />
          : <span className="text-slate-700 text-xs">—</span>}
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[160px]">
        {income.note ?? ''}
      </td>
    </tr>
  )
}

function AfterRow({ row }) {
  const after = computeAfter(row)
  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
      <FactionCell row={row} />
      <td className="px-3 py-2.5"><PowerCell bowls={after.power} brainstone={after.brainstone} /></td>
      <td className="px-3 py-2.5"><Res Icon={CreditIcon} value={after.credits} /></td>
      <td className="px-3 py-2.5"><Res Icon={OreIcon} value={after.ore} /></td>
      <td className="px-3 py-2.5"><Res Icon={KnowledgeIcon} value={after.knowledge} /></td>
      <td className="px-3 py-2.5"><Res Icon={QICIcon} value={after.qic} /></td>
      <GaiaCell count={after.gaiaformers} />
    </tr>
  )
}

// ── 연방 데이터 ──────────────────────────────────────────
const TURN_STYLE = {
  '5턴':  'text-emerald-400',
  '6턴':  'text-sky-400',
  '7턴':  'text-yellow-400',
  '8턴+': 'text-orange-400',
  '9턴+': 'text-red-400',
}

const FEDERATION_DATA = [
  { turns: '5턴', entries: [
    { code: 'xenos',   label: null,            options: ['의회 + 교역소 + 광산'],    note: '시작 광산 세 개를 모두 가까이 놓았을 경우' },
    { code: 'bescods', label: '매드 안드로이드', options: ['의회 + 광산'],            note: '시작 광산 두 개를 가까이 놓았을 경우' },
  ]},
  { turns: '6턴', entries: [
    { code: 'ivits',      label: '하이브', options: ['의회 + 교역소 + 광산 + 우주정거장'],                                         note: null },
    { code: 'xenos',      label: null,     options: ['의회 + 연구소'],                                                             note: null },
    { code: 'tinkeroids', label: null,     options: ['의회 + 교역소 + 교역소', '의회 + 교역소 + 광산 + 광산', '의회★ + 연구소 + 광산'], note: null },
    { code: 'mowyed',     label: null,     options: ['의회 + 광산 + 광산', '의회 + 교역소'],                                      note: 'T. F. 마스 기술연방 기준, 2파워 즉발 가이아포밍을 하면 1턴 느려지니 주의' },
  ]},
  { turns: '7턴', entries: [
    { code: 'space_giants', label: '스페이스 자이언트', options: ['의회 + 교역소 + 광산'], note: null },
  ]},
  { turns: '8턴+', entries: [
    { code: 'gleens',     label: null, options: ['교역소 + 교역소 + 광산 + 광산 + 광산'],            note: null },
    { code: 'taklons',    label: null, options: ['아카데미 + 교역소 + 광산', '아카데미 + 광산 + 광산 + 광산'], note: null },
    { code: 'darkanians', label: null, options: ['의회 + 교역소 + 광산 + 광산'],                     note: null },
    { code: 'firaks',     label: null, options: ['의회 + 연구소 + 광산'],                            note: null },
    { code: 'geodens',    label: null, options: ['의회 + 광산 × 4'],                                note: null },
  ]},
  { turns: '9턴+', entries: [
    { code: 'lantids', label: null,  options: ['의회 + 기생 × 4', '의회 + 교역소 + 기생 × 2'], note: null },
    { code: null,      label: '그 외', options: ['연구소 + 교역소 + 광산 + 광산 + 광산'],      note: null },
  ]},
]

function FactionFedBadge({ code, label }) {
  const f = code ? getFaction(code) : null
  const name = label || f?.nameKo || code || '?'
  const color = f?.color || '#64748b'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap"
      style={{ backgroundColor: `${color}20`, color, borderColor: `${color}50` }}
    >
      {name}
    </span>
  )
}

function CompText({ text }) {
  const parts = text.split('★')
  if (parts.length === 1) return <>{text}</>
  return <>{parts[0]}<span className="text-purple-400 font-bold">★</span>{parts[1]}</>
}

function FederationTable() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200">🤝 연방 구성 속도</h2>
        <p className="text-slate-500 text-xs mt-0.5">종족별 첫 연방 구성 예상 시점</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-3 py-2 text-xs font-medium text-slate-500 text-left">종족</th>
              <th className="px-3 py-2 text-xs font-medium text-slate-500 text-left">연방 구성</th>
              <th className="px-3 py-2 text-xs font-medium text-slate-500 text-left">비고</th>
            </tr>
          </thead>
          <tbody>
            {FEDERATION_DATA.flatMap(({ turns, entries }) => [
              <tr key={`h-${turns}`}>
                <td colSpan={3} className={`px-3 py-1.5 text-xs font-bold tracking-wide bg-slate-950/60 ${TURN_STYLE[turns]}`}>
                  {turns}
                </td>
              </tr>,
              ...entries.map((entry, i) => (
                <tr key={`${turns}-${i}`} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="px-3 py-2.5 align-top whitespace-nowrap">
                    <FactionFedBadge code={entry.code} label={entry.label} />
                  </td>
                  <td className="px-3 py-2.5 align-top">
                    <div className="space-y-0.5">
                      {entry.options.map((opt, j) => (
                        <div key={j} className="flex items-start gap-1 text-xs text-slate-300">
                          {j > 0 && <span className="text-slate-600 shrink-0 mt-px">/</span>}
                          <span className={j > 0 ? '' : ''}><CompText text={opt} /></span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs text-slate-500 max-w-[200px]">
                    {entry.note || ''}
                  </td>
                </tr>
              )),
            ])}
          </tbody>
        </table>
      </div>
      <p className="sm:hidden text-xs text-slate-700 text-right px-4 py-2">← 좌우로 스크롤</p>
    </div>
  )
}

// ── 메인 ─────────────────────────────────────────────────
const VIEWS = [
  { id: 'after',   label: '시작 자원' },    // 실제 게임 시작 자원 (1R 수입 후)
  { id: 'initial', label: '기본 자원' },    // 수입 전 초기값
  { id: 'income',  label: '1라운드 수입' },
]

const POWER_COL = '파워 (I / II / III)'

const HEADERS = {
  after:   ['종족', POWER_COL, '크레딧', '광석', '지식', 'QIC', '가이아포머'],
  initial: ['종족', POWER_COL, '크레딧', '광석', '지식', 'QIC', '가이아포머'],
  income:  ['종족', '파워 수입', '크레딧', '광석', '지식', 'QIC', '비고'],
}

function HeaderCell({ label }) {
  if (label === '크레딧') return <span className="flex items-center gap-1"><CreditIcon />{label}</span>
  if (label === '광석')   return <span className="flex items-center gap-1"><OreIcon />{label}</span>
  if (label === '지식')   return <span className="flex items-center gap-1"><KnowledgeIcon />{label}</span>
  if (label === 'QIC')    return <span className="flex items-center gap-1"><QICIcon />{label}</span>
  return label
}


export default function FactionInfo() {
  const [view, setView] = useState('after')

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100">📋 종족 정보</h1>
        <p className="text-slate-400 text-sm mt-1">18종족 시작 자원 및 파워 토큰 현황</p>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><CreditIcon /> 크레딧</span>
        <span className="flex items-center gap-1.5"><OreIcon /> 광석</span>
        <span className="flex items-center gap-1.5"><KnowledgeIcon /> 지식</span>
        <span className="flex items-center gap-1.5"><QICIcon /> 정보큐브(QIC)</span>
        <span className="flex items-center gap-1.5">
          <span className="text-violet-300 text-[11px] font-mono">I / II / III</span>
          파워 그릇 (대기 · 충전중 · 사용가능)
        </span>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit">
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === v.id
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-700">
                {HEADERS[view].map((h, i) => (
                  <th key={i} className="px-3 py-2.5 text-xs font-medium text-slate-500 text-left">
                    <HeaderCell label={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FACTION_DATA.map((row, i) => (
                view === 'after'   ? <AfterRow   key={i} row={row} /> :
                view === 'initial' ? <InitialRow key={i} row={row} /> :
                                    <IncomeRow  key={i} row={row} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="sm:hidden text-xs text-slate-700 text-right px-4 py-2">← 좌우로 스크롤</p>
      </div>

      {/* 주의사항 */}
      <div className="text-xs text-slate-600 space-y-0.5">
        <p>* 파이락: 기본 시작 광석 3, 지식 2 (수입 후 광석 6, 지식 4)</p>
        <p>* 팅커로이드·하이브: 광산 없이 행성의회로 시작 — 광석 수입 기본1만 적용</p>
        <p>* 타클론: 브레인스톤은 파워토큰처럼 이동하지만 별도 관리</p>
      </div>

      {/* 연방 정보 */}
      <FederationTable />
    </div>
  )
}
