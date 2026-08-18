import type { RegionBundle, TuitionPlan } from '@/lib/regions/types'

const sharedBoards = [
  {
    id: 'cbse',
    name: 'CBSE',
    tag: 'Most requested',
    eyebrow: 'Indian syllabus',
    levels: 'Classes 4–12',
    oneToOne: false,
    topBadge: '6–8 Students per Batch',
    description:
      'Personalised coaching aligned to the CBSE syllabus — from Class 4 through Class 12 board readiness.',
    topics: [
      'Classes 4–8 concept building across Maths, Science & English',
      'Classes 9–10 board-focused practice and revision cycles',
      'Classes 11–12 stream support (PCM / PCB / Commerce basics)',
      'Mapped to the CBSE textbook and exam calendar',
    ],
  },
  {
    id: 'icse',
    name: 'ICSE / ISC',
    tag: 'Concept depth',
    eyebrow: 'Indian syllabus',
    levels: 'Classes 4–12',
    oneToOne: false,
    topBadge: '6–8 Students per Batch',
    description:
      'Structured support for ICSE and ISC from Class 4, with focus on conceptual clarity and exam technique.',
    topics: [
      'ICSE Classes 4–8 concept building and reinforcement',
      'ICSE Class 9–10 subject mastery and paper technique',
      'ISC Class 11–12 depth with application focus',
      'English language & literature support',
    ],
  },
  {
    id: 'igcse',
    name: 'IGCSE Syllabus',
    tag: 'Individual Attention',
    eyebrow: 'Cambridge syllabus',
    levels: 'One-to-one · Classes 6–12',
    oneToOne: true,
    topBadge: 'One-to-one tuition only',
    description:
      'Cambridge IGCSE tuition from Class 6, offered on a one-to-one basis only — so every session is paced to your child, not a batch.',
    topics: [
      'One-to-one tuition only — no group batches for this syllabus',
      'Maths, Sciences & English mapped to the Cambridge IGCSE syllabus',
      'Past-paper technique, exam skills and checkpoint support',
      'Personalised pace for international and IGCSE-track students',
    ],
  },
] as const

const tuitionPlans: TuitionPlan[] = [
  { grade: '4th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 2500 },
  { grade: '5th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 2500 },
  { grade: '6th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 2500 },
  { grade: '7th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 2500 },
  { grade: '8th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 3000 },
  { grade: '9th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 3000 },
  { grade: '10th Grade/Class', sessionsMin: 12, sessionsMax: 12, rate: 3500 },
  { grade: '11th Grade/Class', sessionsMin: 12, sessionsMax: 12, rate: 3500 },
  { grade: '12th Grade/Class', sessionsMin: 12, sessionsMax: 12, rate: 3500 },
]

function formatInr(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function monthlyRateForGrade(grade: string | null | undefined) {
  const number = grade?.match(/\d+/)?.[0]
  if (!number) return 3000
  const plan = tuitionPlans.find(
    (item) =>
      item.grade.startsWith(`${number}th`) ||
      item.grade.startsWith(`${number}st`) ||
      item.grade.startsWith(`${number}nd`) ||
      item.grade.startsWith(`${number}rd`),
  )
  if (plan) return plan.rate
  const n = Number(number)
  if (n <= 7) return 2500
  if (n <= 9) return 3000
  return 3500
}

function plansForBoard(boardId: 'cbse' | 'icse' | 'igcse') {
  if (boardId === 'igcse') {
    return tuitionPlans.filter((plan) => Number(plan.grade.match(/^(\d+)/)?.[1]) >= 6)
  }
  return tuitionPlans
}

export const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const

export const indiaRegion: RegionBundle = {
  site: {
    name: 'MG Tuition India',
    brand: 'MG Tuition',
    regionLabel: 'India',
    legal: 'IdealMG Educare LLP',
    tagline: 'Small-Batch Live Tuition for Indian Boards',
    syllabusCoverage: 'CBSE, ICSE & IGCSE',
    email: 'info@mgtuition.in',
    phoneDisplay: '+91 98765 43210',
    phoneHref: 'tel:+919876543210',
    showPhone: true,
    whatsappNumber: '919876543210',
    whatsappMessage: 'Hi, I would like to get a free assessment with MG Tuition India.',
    assessmentCta: 'Get Free Assessment',
    facebook: 'https://www.facebook.com/MGTuitionOnline',
    instagram: 'https://www.instagram.com/mgonlinetuition/',
    mapEmbed:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31459.17776312193!2d76.33305186232045!3d9.732380149020502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087b489c5ef99b%3A0xfe4679ffcaec1d9e!2sIdealMG%20Educare%20LLP!5e0!3m2!1sen!2sin!4v1768660529521!5m2!1sen!2sin',
    footerBadge: 'Trusted since 2015 · Kerala & across India',
    headerOfficeLine: 'Offices in Cherthala & Kottayam, Kerala',
    contactSectionTitle: 'Kerala offices, India-wide classes',
    contactSectionDescription:
      'Live online tuition for students across India — with regional hubs in Cherthala and Kottayam.',
    offices: [
      {
        id: 'cherthala',
        label: 'Regional Office',
        lines: ['IdealMG Educare LLP', 'Infopark, Kelamangalam Rd', 'Cherthala, Kerala 688531'],
      },
      {
        id: 'kottayam',
        label: 'Kottayam Office',
        lines: ['IdealMG Educare LLP', 'Ashirwad Arcade, 2nd Floor', 'Kottayam, Kerala 686001'],
      },
    ],
    boards: [...sharedBoards],
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Social Science'],
    stats: [
      { label: 'Years of excellence', value: '10+' },
      { label: 'Expert tutors', value: '500+' },
      { label: 'Students guided', value: '10,000+' },
      { label: 'Parent rating', value: '4.9/5' },
    ],
    people: {
      founder: {
        name: 'Biju Paul',
        role: 'Founder',
        photo: '/images/biju-paul.jpeg',
        quote:
          'Every child deserves to be seen in class — not lost in a crowd. We keep batches very small so tutors can truly know each student. That belief started MG Tuition, and it drives every class we run in India today.',
      },
      head: {
        name: 'Deepu George',
        role: 'Head of Institution',
        photo: '/images/deepu.jpg',
        quote:
          'We train tutors to Indian board standards and measure progress honestly. Parents should always know how their child is growing.',
      },
    },
    nav: [
      { label: 'Home', path: '/' },
      { label: 'Subjects', path: '/subjects' },
      { label: 'About', path: '/about' },
      { label: 'Why Us', path: '/why-choose-us' },
      { label: 'Become a Tutor', path: '/become-tutor' },
      { label: 'Contact', path: '/contact' },
    ],
    formDisclaimer:
      'By submitting this form you agree to be contacted by MG Tuition about this enquiry. We use your details only to respond and do not sell personal data.',
    enrolmentDisclaimer:
      'IdealMG Educare LLP provides live online tuition for CBSE, ICSE and IGCSE. IGCSE is offered one-to-one only. An assessment or contact request does not create a tuition contract until enrolment is confirmed in writing.',
    privacyLaw: 'applicable Indian law',
    notesPlaceholder: 'Class 4 or above, subjects, goals',
    testimonialSubtitle:
      'Families from Kochi to Hyderabad — the same small-batch care, the same honest updates.',
    aboutTeaserHub: 'Kerala',
    aboutTeaserTrustLine: 'Trusted by families across India & abroad',
    aboutTeaserBody:
      'From our Kerala hubs in Cherthala and Kottayam, we deliver live classes in very small batches for CBSE and ICSE, and one-to-one tuition for IGCSE.',
    aboutHeroDescription:
      'Since 2015, IdealMG Educare has delivered live online tuition from Kerala — personal, honest, and built around CBSE, ICSE and IGCSE. IGCSE is offered one-to-one only.',
    aboutLocationEyebrow: 'Rooted in Kerala',
    aboutLocationTitle: 'Operating from Cherthala & Kottayam',
    aboutLocationBody:
      'IdealMG Educare LLP runs regional hubs in Kerala while delivering live small-batch classes to students across India',
    aboutLocationImage: '/images/infopark-cherthala.jpg',
    aboutLocationImageAlt: 'IdealMG Educare office in Cherthala',
    aboutPrinciplesLine:
      'These principles still guide every class we run for families across India today.',
    aboutJourneySubtitle:
      'From a parent\'s idea to a trusted tutoring network across India and abroad.',
    aboutTimelineReach:
      'International curricula grow — India hubs in Cherthala and Kottayam strengthen operations.',
    schedulingFlexNote:
      'Sessions that fit school, exams, and family life across Indian time zones.',
  },
  tuition: {
    batchSizeLabel: '6–8',
    pricingBoards: [
      { id: 'cbse', label: 'CBSE', oneToOne: false, showPrices: true },
      { id: 'icse', label: 'ICSE', oneToOne: false, showPrices: true },
      { id: 'igcse', label: 'IGCSE', oneToOne: true, showPrices: false },
    ],
    tuitionPlans,
    pricingReady: true,
    currency: 'INR',
    formatPrice: formatInr,
    plansForBoard,
    monthlyRateForGrade,
    minEnrolmentGrade: 4,
    maxEnrolmentGrade: 12,
  },
  locationOptions: indianStates,
}
