import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { AuthProvider } from '@/context/AuthContext'
import { TrialProvider } from '@/context/TrialContext'
import { site } from '@/lib/site'
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
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { UpdatePasswordPage } from '@/pages/UpdatePasswordPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { StudentPortalPage } from '@/pages/StudentPortalPage'

export default function App() {
  useEffect(() => {
    document.title = `${site.name} | Small-Batch Online Tuition`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        `${site.name} — ${site.tagline}. ${site.legal}.`,
      )
    }
  }, [])

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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/student" element={<StudentPortalPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth roles={['staff', 'student_consultant']}>
                  <DashboardPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TrialProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
