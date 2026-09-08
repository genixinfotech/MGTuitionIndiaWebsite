import type { AppRole } from '@/lib/roles'
export type { AppRole } from '@/lib/roles'
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
  subject: string
  assigned_expert_id: string | null
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
  subject_months: Record<string, number>
  created_at: string
  paid_at: string | null
}

export type TuitionPaymentProvider = 'stripe' | 'razorpay' | 'manual'
export type TuitionPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export type TuitionPayment = {
  id: number
  student_id: number
  parent_id: string
  provider: TuitionPaymentProvider
  status: TuitionPaymentStatus
  amount: number
  currency: string
  subjects: string[]
  renewal: boolean
  provider_session_id: string | null
  provider_payment_id: string | null
  receipt_url: string | null
  created_at: string
  paid_at: string | null
}

export type AssessmentRequestDetails = AssessmentRequest & {
  student: Student | null
  parent: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'> | null
  assigned_expert: Pick<Profile, 'id' | 'full_name' | 'email'> | null
}

export type WebAssessmentRequest = {
  id: number
  parent_name: string
  student_name: string
  email: string
  phone: string | null
  board: string
  grade: string
  subject: string
  status: AssessmentStatus
  assigned_expert_id: string | null
  notes: string | null
  referral: string | null
  created_at: string
  updated_at: string
}

export type StudentWithParent = Student & {
  parent: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'> | null
}

export type Parent = {
  id: string
  created_at: string
  updated_at: string
}

export type Tutor = {
  id: string
  timezone: string
  created_at: string
  updated_at: string
}

export type QualityManager = {
  id: string
  created_at: string
  updated_at: string
}

export type Batch = {
  id: number
  name: string
  hero_full_name: string
  subject: string
  syllabus: string
  grade: string
  start_date: string
  days_of_week: number[]
  start_time: string
  end_time: string
  quality_manager_id: string
  tutor_id: string
  min_students: number
  max_students: number
  meeting_link: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type BatchStudent = {
  id: number
  batch_id: number
  student_id: number
  created_at: string
}

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

export type Session = {
  id: number
  batch_id: number
  student_id: number
  session_date: string
  starts_at: string
  ends_at: string
  status: SessionStatus
  attended: boolean | null
  recording_link: string | null
  created_at: string
  updated_at: string
}

export type StudentConsultant = {
  id: string
  created_at: string
  updated_at: string
}

export type Syllabus = {
  id: number
  name: string
  code: string
  sort_order: number
  created_at: string
}

export type Grade = {
  id: number
  label: string
  sort_order: number
  created_at: string
}

export type Subject = {
  id: number
  name: string
  sort_order: number
  created_at: string
}

export type SyllabusGradeSubject = {
  syllabus_id: number
  grade_id: number
  subject_id: number
  created_at: string
}

export type TutorScheduleSlot = {
  id: number
  tutor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
}

export type TutorVerificationStatus = 'pending' | 'verified' | 'rejected'

export type TutorBankDetails = {
  tutor_id: string
  bank_name: string | null
  account_holder_name: string | null
  account_number: string | null
  ifsc_code: string | null
  branch: string | null
  verification_status: TutorVerificationStatus
  created_at: string
  updated_at: string
}

export type TutorPanDetails = {
  tutor_id: string
  name_on_pan: string | null
  date_of_birth: string | null
  pan_number: string | null
  verification_status: TutorVerificationStatus
  created_at: string
  updated_at: string
}

export type TutorSpecialization = {
  id: number
  tutor_id: string
  subject: string
  grade_range: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type TutorTeachingExperience = {
  id: number
  tutor_id: string
  organization: string
  role_title: string
  start_date: string | null
  end_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type TutorQualification = {
  id: number
  tutor_id: string
  degree_title: string
  institution: string
  year_from: number | null
  year_to: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type TutorProfileDetails = {
  bank: TutorBankDetails | null
  pan: TutorPanDetails | null
  specializations: TutorSpecialization[]
  experience: TutorTeachingExperience[]
  qualifications: TutorQualification[]
}

export type ParentWithStudents = Profile & {
  students: Student[]
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
      parents: {
        Row: Parent
        Insert: {
          id: string
        }
        Update: {
          updated_at?: string
        }
        Relationships: []
      }
      tutors: {
        Row: Tutor
        Insert: {
          id: string
          timezone?: string
        }
        Update: {
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      batch_students: {
        Row: BatchStudent
        Insert: {
          batch_id: number
          student_id: number
        }
        Update: {
          batch_id?: number
          student_id?: number
        }
        Relationships: []
      }
      sessions: {
        Row: Session
        Insert: {
          batch_id: number
          student_id: number
          session_date: string
          starts_at: string
          ends_at: string
          status?: SessionStatus
          attended?: boolean | null
          recording_link?: string | null
        }
        Update: {
          status?: SessionStatus
          attended?: boolean | null
          recording_link?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quality_managers: {
        Row: QualityManager
        Insert: {
          id: string
        }
        Update: {
          updated_at?: string
        }
        Relationships: []
      }
      batches: {
        Row: Batch
        Insert: {
          name: string
          hero_full_name: string
          subject: string
          syllabus: string
          grade: string
          start_date: string
          days_of_week: number[]
          start_time: string
          end_time: string
          quality_manager_id: string
          tutor_id: string
          min_students?: number
          max_students?: number
          meeting_link?: string | null
          notes?: string | null
        }
        Update: {
          name?: string
          hero_full_name?: string
          subject?: string
          syllabus?: string
          grade?: string
          start_date?: string
          days_of_week?: number[]
          start_time?: string
          end_time?: string
          quality_manager_id?: string
          tutor_id?: string
          min_students?: number
          max_students?: number
          meeting_link?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      student_consultants: {
        Row: StudentConsultant
        Insert: {
          id: string
        }
        Update: {
          updated_at?: string
        }
        Relationships: []
      }
      grades: {
        Row: Grade
        Insert: {
          label: string
          sort_order: number
        }
        Update: {
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      syllabi: {
        Row: Syllabus
        Insert: {
          name: string
          code: string
          sort_order: number
        }
        Update: {
          name?: string
          code?: string
          sort_order?: number
        }
        Relationships: []
      }
      subjects: {
        Row: Subject
        Insert: {
          name: string
          sort_order: number
        }
        Update: {
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      syllabus_grade_subjects: {
        Row: SyllabusGradeSubject
        Insert: {
          syllabus_id: number
          grade_id: number
          subject_id: number
        }
        Update: Record<string, never>
        Relationships: []
      }
      tutor_schedule_slots: {
        Row: TutorScheduleSlot
        Insert: {
          tutor_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Update: {
          day_of_week?: number
          start_time?: string
          end_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor_bank_details: {
        Row: TutorBankDetails
        Insert: {
          tutor_id: string
          bank_name?: string | null
          account_holder_name?: string | null
          account_number?: string | null
          ifsc_code?: string | null
          branch?: string | null
          verification_status?: TutorVerificationStatus
        }
        Update: {
          bank_name?: string | null
          account_holder_name?: string | null
          account_number?: string | null
          ifsc_code?: string | null
          branch?: string | null
          verification_status?: TutorVerificationStatus
          updated_at?: string
        }
        Relationships: []
      }
      tutor_pan_details: {
        Row: TutorPanDetails
        Insert: {
          tutor_id: string
          name_on_pan?: string | null
          date_of_birth?: string | null
          pan_number?: string | null
          verification_status?: TutorVerificationStatus
        }
        Update: {
          name_on_pan?: string | null
          date_of_birth?: string | null
          pan_number?: string | null
          verification_status?: TutorVerificationStatus
          updated_at?: string
        }
        Relationships: []
      }
      tutor_specializations: {
        Row: TutorSpecialization
        Insert: {
          tutor_id: string
          subject: string
          grade_range: string
          sort_order?: number
        }
        Update: {
          subject?: string
          grade_range?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tutor_teaching_experience: {
        Row: TutorTeachingExperience
        Insert: {
          tutor_id: string
          organization: string
          role_title: string
          start_date?: string | null
          end_date?: string | null
          sort_order?: number
        }
        Update: {
          organization?: string
          role_title?: string
          start_date?: string | null
          end_date?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tutor_qualifications: {
        Row: TutorQualification
        Insert: {
          tutor_id: string
          degree_title: string
          institution: string
          year_from?: number | null
          year_to?: number | null
          sort_order?: number
        }
        Update: {
          degree_title?: string
          institution?: string
          year_from?: number | null
          year_to?: number | null
          sort_order?: number
          updated_at?: string
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
          subject?: string
          assigned_expert_id?: string | null
          status?: AssessmentStatus
          preferred_date?: string | null
          preferred_time?: string | null
          notes?: string | null
          report?: string | null
          report_path?: string | null
          weak_subjects?: WeakSubjectNote[]
        }
        Update: {
          subject?: string
          assigned_expert_id?: string | null
          status?: AssessmentStatus
          notes?: string | null
          report?: string | null
          report_path?: string | null
          weak_subjects?: WeakSubjectNote[]
        }
        Relationships: []
      }
      web_assessment_requests: {
        Row: WebAssessmentRequest
        Insert: {
          parent_name: string
          student_name: string
          email: string
          phone?: string | null
          board: string
          grade: string
          subject: string
          status?: AssessmentStatus
          assigned_expert_id?: string | null
          notes?: string | null
          referral?: string | null
        }
        Update: {
          status?: AssessmentStatus
          assigned_expert_id?: string | null
          notes?: string | null
          referral?: string | null
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
      tuition_payments: {
        Row: TuitionPayment
        Insert: {
          student_id: number
          parent_id: string
          provider: TuitionPaymentProvider
          status?: TuitionPaymentStatus
          amount: number
          currency: string
          subjects?: string[]
          renewal?: boolean
          provider_session_id?: string | null
          provider_payment_id?: string | null
          receipt_url?: string | null
          paid_at?: string | null
        }
        Update: {
          status?: TuitionPaymentStatus
          provider_session_id?: string | null
          provider_payment_id?: string | null
          receipt_url?: string | null
          paid_at?: string | null
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
          subject_months?: Record<string, number>
          paid_at?: string | null
        }
        Update: {
          amount?: number
          status?: AdmissionStatus
          subjects?: string[]
          subject_months?: Record<string, number>
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
      session_status: SessionStatus
      tuition_payment_provider: TuitionPaymentProvider
      tuition_payment_status: TuitionPaymentStatus
    }
  }
}
