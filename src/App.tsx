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
import { ProfilePage } from '@/pages/ProfilePage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { UpdatePasswordPage } from '@/pages/UpdatePasswordPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { StudentPortalPage } from '@/pages/StudentPortalPage'
import { PortalLayout } from '@/pages/portal/PortalLayout'
import { PortalOverviewPage } from '@/pages/portal/PortalOverviewPage'
import { PortalStudentsPage } from '@/pages/portal/PortalStudentsPage'
import { PortalStudentProfilePage } from '@/pages/portal/PortalStudentProfilePage'
import { PortalProfilePage } from '@/pages/portal/PortalProfilePage'
import { PortalClassesPage } from '@/pages/portal/PortalClassesPage'
import { portalAccessRoles } from '@/lib/portal-nav'
import { OneViewLayout } from '@/pages/oneview/OneViewLayout'
import { OneViewOverviewPage } from '@/pages/oneview/OneViewOverviewPage'
import { OneViewStudentsPage } from '@/pages/oneview/OneViewStudentsPage'
import { OneViewParentsPage } from '@/pages/oneview/OneViewParentsPage'
import { OneViewTutorsPage } from '@/pages/oneview/OneViewTutorsPage'
import { OneViewTutorProfilePage } from '@/pages/oneview/OneViewTutorProfilePage'
import { OneViewEnquiriesPage } from '@/pages/oneview/OneViewEnquiriesPage'
import { OneViewWebAssessmentsPage } from '@/pages/oneview/OneViewWebAssessmentsPage'
import { OneViewPortalAssessmentsPage } from '@/pages/oneview/OneViewPortalAssessmentsPage'
import { OneViewHrPage } from '@/pages/oneview/OneViewHrPage'
import { OneViewHrTutorEnquiriesPage } from '@/pages/oneview/OneViewHrTutorEnquiriesPage'
import { OneViewSectionPage } from '@/pages/oneview/OneViewSectionPage'
import { OneViewUsersPage } from '@/pages/oneview/OneViewUsersPage'
import { OneViewOperationsPage } from '@/pages/oneview/OneViewOperationsPage'
import { OneViewOperationsBatchesPage } from '@/pages/oneview/OneViewOperationsBatchesPage'
import { oneViewAccessRoles } from '@/lib/oneview-nav'

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
            <Route
              path="/portal"
              element={
                <RequireAuth roles={[...portalAccessRoles]}>
                  <PortalLayout />
                </RequireAuth>
              }
            >
              <Route index element={<PortalOverviewPage />} />
              <Route path="students" element={<PortalStudentsPage />} />
              <Route path="students/:studentId" element={<PortalStudentProfilePage />} />
              <Route path="profile" element={<PortalProfilePage />} />
              <Route path="classes" element={<PortalClassesPage />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/student" element={<StudentPortalPage />} />
            <Route
              path="/oneview"
              element={
                <RequireAuth roles={[...oneViewAccessRoles]}>
                  <OneViewLayout />
                </RequireAuth>
              }
            >
              <Route index element={<OneViewOverviewPage />} />
              <Route path="operations" element={<OneViewOperationsPage />} />
              <Route path="operations/batches" element={<OneViewOperationsBatchesPage />} />
              <Route path="users" element={<OneViewUsersPage />} />
              <Route path="students" element={<OneViewStudentsPage />} />
              <Route path="parents" element={<OneViewParentsPage />} />
              <Route path="tutors" element={<OneViewTutorsPage />} />
              <Route path="tutors/:tutorId" element={<OneViewTutorProfilePage />} />
              <Route path="enquiries" element={<OneViewEnquiriesPage />} />
              <Route path="assessments" element={<Navigate to="/oneview/assessments/web" replace />} />
              <Route path="assessments/web" element={<OneViewWebAssessmentsPage />} />
              <Route path="assessments/portal" element={<OneViewPortalAssessmentsPage />} />
              <Route path="admissions" element={<OneViewSectionPage />} />
              <Route path="finance" element={<OneViewSectionPage />} />
              <Route path="marketing" element={<OneViewSectionPage />} />
              <Route path="hr" element={<OneViewHrPage />} />
              <Route path="hr/tutor-enquiries" element={<OneViewHrTutorEnquiriesPage />} />
              <Route path="quality" element={<OneViewSectionPage />} />
              <Route path="settings" element={<OneViewSectionPage />} />
            </Route>
            <Route path="/dashboard" element={<Navigate to="/oneview/assessments/web" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TrialProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
