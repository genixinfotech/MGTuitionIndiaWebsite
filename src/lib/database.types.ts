export type AppRole = 'parent' | 'tutor' | 'staff' | 'student' | 'student_consultant'
export type EnquiryKind = 'trial' | 'contact' | 'tutor'
export type EnquiryStatus = 'new' | 'contacted' | 'enrolled' | 'closed'
export type AssessmentStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'

export type Profile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: AppRole
  created_at: string
  updated_at: string
}

export type Enquiry = {
  id: number
  user_id: string | null
  kind: EnquiryKind
  name: string
  email: string
  phone: string | null
  payload: Record<string, string>
  status: EnquiryStatus
  created_at: string
}

export type Student = {
  id: number
  parent_id: string
  user_id: string | null
  email: string | null
  full_name: string
  city: string | null
  state: string | null
  school_name: string | null
  board: string | null
  grade: string | null
  notes: string | null
  created_at: string
}

export type AssessmentRequest = {
  id: number
  student_id: number
  parent_id: string
  requested_by: string
  status: AssessmentStatus
  preferred_date: string | null
  preferred_time: string | null
  notes: string | null
  report: string | null
  report_path: string | null
  weak_subjects: WeakSubjectNote[] | null
  created_at: string
  updated_at: string
}

export type WeakSubjectNote = {
  subject: string
  note: string
}

export type StudentSubject = {
  id: number
  student_id: number
  subject: string
  monthly_rate: number
  created_at: string
}

export type AdmissionStatus = 'unpaid' | 'paid'

export type Admission = {
  id: number
  student_id: number
  parent_id: string
  amount: number
  status: AdmissionStatus
  subjects: string[]
  created_at: string
  paid_at: string | null
}

export type AssessmentRequestDetails = AssessmentRequest & {
  student: Student | null
  parent: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'> | null
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id: string
          full_name?: string
          email: string
          phone?: string | null
          role?: AppRole
        }
        Update: {
          full_name?: string
          phone?: string | null
        }
        Relationships: []
      }
      enquiries: {
        Row: Enquiry
        Insert: {
          user_id?: string | null
          kind: EnquiryKind
          name: string
          email: string
          phone?: string | null
          payload?: Record<string, string>
          status?: EnquiryStatus
        }
        Update: {
          status?: EnquiryStatus
        }
        Relationships: []
      }
      students: {
        Row: Student
        Insert: {
          parent_id: string
          user_id?: string | null
          email?: string | null
          full_name: string
          city?: string | null
          state?: string | null
          school_name?: string | null
          board?: string | null
          grade?: string | null
          notes?: string | null
        }
        Update: {
          full_name?: string
          email?: string | null
          user_id?: string | null
          city?: string | null
          state?: string | null
          school_name?: string | null
          board?: string | null
          grade?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      assessment_requests: {
        Row: AssessmentRequest
        Insert: {
          student_id: number
          parent_id: string
          requested_by: string
          status?: AssessmentStatus
          preferred_date?: string | null
          preferred_time?: string | null
          notes?: string | null
          report?: string | null
          report_path?: string | null
          weak_subjects?: WeakSubjectNote[]
        }
        Update: {
          status?: AssessmentStatus
          notes?: string | null
          report?: string | null
          report_path?: string | null
          weak_subjects?: WeakSubjectNote[]
        }
        Relationships: []
      }
      student_subjects: {
        Row: StudentSubject
        Insert: {
          student_id: number
          subject: string
          monthly_rate: number
        }
        Update: {
          subject?: string
          monthly_rate?: number
        }
        Relationships: []
      }
      admissions: {
        Row: Admission
        Insert: {
          student_id: number
          parent_id: string
          amount: number
          status?: AdmissionStatus
          subjects?: string[]
          paid_at?: string | null
        }
        Update: {
          amount?: number
          status?: AdmissionStatus
          subjects?: string[]
          paid_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      app_role: AppRole
      enquiry_kind: EnquiryKind
      enquiry_status: EnquiryStatus
      assessment_status: AssessmentStatus
      admission_status: AdmissionStatus
    }
  }
}
