import type { RegionBundle, TuitionPlan } from '@/lib/regions/types'

const gccBoards = [
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
  { grade: '4th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 35 },
  { grade: '5th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 35 },
  { grade: '6th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 35 },
  { grade: '7th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 35 },
  { grade: '8th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 40 },
  { grade: '9th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 40 },
  { grade: '10th Grade/Class', sessionsMin: 12, sessionsMax: 12, rate: 60 },
  { grade: '11th Grade/Class', sessionsMin: 12, sessionsMax: 12, rate: 60 },
  { grade: '12th Grade/Class', sessionsMin: 12, sessionsMax: 12, rate: 60 },
]

function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatPrice(amount: number) {
  if (amount <= 0) return 'Contact us'
  return formatUsd(amount)
}

function monthlyRateForGrade(grade: string | null | undefined) {
  const number = grade?.match(/\d+/)?.[0]
  if (!number) return 40
  const plan = tuitionPlans.find(
    (item) =>
      item.grade.startsWith(`${number}th`) ||
      item.grade.startsWith(`${number}st`) ||
      item.grade.startsWith(`${number}nd`) ||
      item.grade.startsWith(`${number}rd`),
  )
  if (plan) return plan.rate
  const n = Number(number)
  if (n <= 7) return 35
  if (n <= 9) return 40
  return 60
}

function plansForBoard(boardId: 'cbse' | 'icse' | 'igcse') {
  if (boardId === 'igcse') {
    return tuitionPlans.filter((plan) => Number(plan.grade.match(/^(\d+)/)?.[1]) >= 6)
  }
  return tuitionPlans
}

export const gccRegions = [
  'UAE — Abu Dhabi',
  'UAE — Dubai',
  'UAE — Sharjah',
  'UAE — Ajman',
  'UAE — Umm Al Quwain',
  'UAE — Ras Al Khaimah',
  'UAE — Fujairah',
  'Bahrain',
  'Kuwait',
  'Oman',
  'Qatar',
  'Saudi Arabia',
] as const

export const gccRegion: RegionBundle = {
  site: {
    name: 'MG Tuition GCC',
    brand: 'MG Tuition',
    regionLabel: 'GCC',
    legal: 'IdealMG Educare FZC',
    tagline: 'Small-Batch Live Tuition for CBSE, ICSE & IGCSE',
    syllabusCoverage: 'CBSE, ICSE & IGCSE',
    email: 'info@mgtuition.ae',
    phoneDisplay: '+971 50 374 9145',
    phoneHref: 'tel:+971503749145',
    showPhone: true,
    whatsappNumber: '971503749145',
    whatsappMessage: 'Hi, I would like to get a free assessment with MG Tuition GCC.',
    assessmentCta: 'Get Free Assessment',
    facebook: 'https://www.facebook.com/MGTuitionOnline',
    instagram: 'https://www.instagram.com/mgonlinetuition/',
    mapEmbed: undefined,
    footerBadge: 'Trusted since 2015 · UAE & across the GCC',
    headerOfficeLine: 'UAE · Serving the GCC',
    contactSectionTitle: 'Our UAE office, GCC-wide classes',
    contactSectionDescription:
      'Live online tuition for students across the GCC — operated by IdealMG Educare FZC.',
    offices: [
      {
        id: 'uae',
        label: 'Registered Office',
        lines: ['IdealMG Educare FZC', 'Address to be updated'],
      },
    ],
    boards: [...gccBoards],
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
          'Every child deserves to be seen in class — not lost in a crowd. We keep batches very small so tutors can truly know each student. That belief started MG Tuition, and it drives every class we run for GCC families today.',
      },
      head: {
        name: 'Deepu George',
        role: 'Head of Institution',
        photo: '/images/deepu.jpg',
        quote:
          'We train tutors to board standards and measure progress honestly. Parents should always know how their child is growing.',
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
      'IdealMG Educare FZC provides live online tuition for CBSE, ICSE and IGCSE. IGCSE is offered one-to-one only. An assessment or contact request does not create a tuition contract until enrolment is confirmed in writing.',
    privacyLaw: 'applicable UAE law',
    notesPlaceholder: 'Class 4 or above, subjects, goals',
    testimonialSubtitle:
      'Families from Dubai to Riyadh — the same small-batch care, the same honest updates.',
    aboutTeaserHub: 'UAE',
    aboutTeaserTrustLine: 'Trusted by families across the GCC & abroad',
    aboutTeaserBody:
      'From our UAE base, we deliver live classes in very small batches for CBSE and ICSE, and one-to-one tuition for IGCSE.',
    aboutHeroDescription:
      'Since 2015, IdealMG Educare has delivered live online tuition — personal, honest, and built around CBSE, ICSE and IGCSE. IGCSE is offered one-to-one only. IdealMG Educare FZC serves families across the GCC.',
    aboutLocationEyebrow: 'Serving the GCC',
    aboutLocationTitle: 'IdealMG Educare FZC',
    aboutLocationBody:
      'IdealMG Educare FZC delivers live small-batch classes to students across the GCC. Full office address details will be published here soon.',
    aboutLocationImage: '/images/hero-bg.png',
    aboutLocationImageAlt: 'MG Tuition GCC — live online tuition for the GCC',
    aboutPrinciplesLine:
      'These principles still guide every class we run for families across the GCC today.',
    aboutJourneySubtitle:
      'From a parent\'s idea to a trusted tutoring network across the GCC and abroad.',
    aboutTimelineReach:
      'International curricula grow — our UAE base strengthens operations across the GCC.',
    schedulingFlexNote:
      'Sessions that fit school, exams, and family life across GCC time zones.',
  },
  tuition: {
    batchSizeLabel: '6–8',
    pricingBoards: [
      { id: 'cbse', label: 'CBSE', oneToOne: false, showPrices: false },
      { id: 'icse', label: 'ICSE', oneToOne: false, showPrices: false },
      { id: 'igcse', label: 'IGCSE', oneToOne: true, showPrices: false },
    ],
    tuitionPlans,
    pricingReady: false,
    currency: 'USD',
    formatPrice,
    plansForBoard,
    monthlyRateForGrade,
    minEnrolmentGrade: 4,
    maxEnrolmentGrade: 12,
  },
  locationOptions: gccRegions,
}
