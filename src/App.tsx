import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { AuthProvider } from '@/context/AuthContext'
import { TrialProvider } from '@/context/TrialContext'
import { HomePage } from '@/pages/HomePage'
import { SubjectsPage } from '@/pages/SubjectsPage'
import { AboutPage } from '@/pages/AboutPage'
import { WhyChooseUsPage } from '@/pages/WhyChooseUsPage'
import { BecomeTutorPage } from '@/pages/BecomeTutorPage'
import { ContactPage } from '@/pages/ContactPage'
import { TrialLandingPage } from '@/pages/TrialLandingPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { PortalPage } from '@/pages/PortalPage'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <TrialProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/courses" element={<Navigate to="/subjects" replace />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
            <Route path="/become-tutor" element={<BecomeTutorPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/enroll-for-trial-session" element={<TrialLandingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TrialProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
