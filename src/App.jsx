import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MatchList from './pages/MatchList'
import MatchDetail from './pages/MatchDetail'
import Players from './pages/Players'
import PlayerDetail from './pages/PlayerDetail'
import Factions from './pages/Factions'
import HallOfFame from './pages/HallOfFame'
import FactionInfo from './pages/FactionInfo'
import NewMatch from './pages/NewMatch'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="matches" element={<MatchList />} />
          <Route path="matches/:id" element={<MatchDetail />} />
          <Route path="players" element={<Players />} />
          <Route path="players/:id" element={<PlayerDetail />} />
          <Route path="factions" element={<Factions />} />
          <Route path="hall-of-fame" element={<HallOfFame />} />
          <Route path="faction-info" element={<FactionInfo />} />
          <Route path="new-match" element={<NewMatch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
