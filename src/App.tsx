// frontend/src/App.tsx
import { Routes, Route, useNavigate } from 'react-router-dom'
import TreasureTrackPage from './pages/TreasureTrackPage'
import { AuthPage } from './components/AuthPage'
import { Toaster } from "@/components/ui/sonner"

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
    </div>
  )
}

export default App
