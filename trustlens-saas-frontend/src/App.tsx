import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ArchitecturePage from './pages/ArchitecturePage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import SaasStrategyPage from './pages/SaasStrategyPage'
import SignInPage from './pages/SignInPage'
import { getSessionToken } from './security/auth'

function ProtectedRoute({ children }: { children: ReactElement }) {
  return getSessionToken() ? children : <Navigate to="/signin" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/architecture" element={<ArchitecturePage />} />
      <Route path="/saas-strategy" element={<SaasStrategyPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
