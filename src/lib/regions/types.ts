export type RegionId = 'India' | 'GCC'

export type SiteOffice = {
  id: string
  label: string
  lines: string[]
}

export type SiteBoard = {
  id: string
  name: string
  tag: string
  eyebrow: string
  levels: string
  oneToOne: boolean
  topBadge: string
  description: string
  topics: readonly string[]
}

export type SiteConfig = {
  name: string
  brand: string
  regionLabel: string
  legal: string
  tagline: string
  syllabusCoverage: string
  email: string
  phoneDisplay: string
  phoneHref: string
  showPhone: boolean
  whatsappNumber: string
  whatsappMessage: string
  assessmentCta: string
  facebook: string
  instagram: string
  mapEmbed?: string
  footerBadge: string
  headerOfficeLine: string
  contactSectionTitle: string
  contactSectionDescription: string
  offices: SiteOffice[]
  boards: SiteBoard[]
  subjects: string[]
  stats: { label: string; value: string }[]
  people: {
    founder: { name: string; role: string; photo: string; quote: string }
    head: { name: string; role: string; photo: string; quote: string }
  }
  nav: { label: string; path: string }[]
  formDisclaimer: string
  enrolmentDisclaimer: string
  privacyLaw: string
  notesPlaceholder: string
  testimonialSubtitle: string
  aboutTeaserHub: string
  aboutTeaserTrustLine: string
  aboutTeaserBody: string
  aboutHeroDescription: string
  aboutLocationEyebrow: string
  aboutLocationTitle: string
  aboutLocationBody: string
  aboutLocationImage: string
  aboutLocationImageAlt: string
  aboutPrinciplesLine: string
  aboutJourneySubtitle: string
  aboutTimelineReach: string
  schedulingFlexNote: string
}

export type TuitionPlan = {
  grade: string
  sessionsMin: number
  sessionsMax: number
  rate: number
}

export type PricingBoard = {
  id: 'cbse' | 'icse' | 'igcse'
  label: string
  oneToOne: boolean
  showPrices: boolean
}

export type TuitionConfig = {
  batchSizeLabel: string
  pricingBoards: PricingBoard[]
  tuitionPlans: TuitionPlan[]
  pricingReady: boolean
  currency: 'INR' | 'USD'
  formatPrice: (amount: number) => string
  plansForBoard: (boardId: PricingBoard['id']) => TuitionPlan[]
  monthlyRateForGrade: (grade: string | null | undefined) => number
  minEnrolmentGrade: number
  maxEnrolmentGrade: number
}

export type RegionBundle = {
  site: SiteConfig
  tuition: TuitionConfig
  locationOptions: readonly string[]
}
