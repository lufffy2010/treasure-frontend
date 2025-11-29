// frontend/src/App.tsx
import { Routes, Route, useNavigate } from 'react-router-dom'
import TreasureTrackPage from './pages/TreasureTrackPage'
import { AuthPage } from './components/AuthPage'
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react"


function App() {
  const navigate = useNavigate()

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<AuthPage onAuth={() => navigate('/treasure')} />} />
        <Route path="/treasure" element={<TreasureTrackPage />} />
        <Route path="*" element={<AuthPage onAuth={() => navigate('/treasure')} />} />
      </Routes>
      <Toaster />
      <Analytics />
    </div>
  )
}

export default App
