export const site = {
  name: 'MG Tuition India',
  brand: 'MG Tuition',
  legal: 'IdealMG Educare LLP',
  tagline: 'Small-Batch Live Tuition for Indian Boards',
  syllabusCoverage: 'CBSE, ICSE & Kerala State Board',
  email: 'info@mgtuition.com',
  // Update these when India numbers are confirmed
  phoneDisplay: '+91 98765 43210',
  phoneHref: 'tel:+919876543210',
  whatsappNumber: '919876543210',
  whatsappMessage: 'Hi, I would like to get a free assessment with MG Tuition India.',
  assessmentCta: 'Get Free Assessment',
  facebook: 'https://www.facebook.com/MGTuitionOnline',
  instagram: 'https://www.instagram.com/mgonlinetuition/',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31459.17776312193!2d76.33305186232045!3d9.732380149020502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b087b489c5ef99b%3A0xfe4679ffcaec1d9e!2sIdealMG%20Educare%20LLP!5e0!3m2!1sen!2sin!4v1768660529521!5m2!1sen!2sin',
  offices: [
    {
      id: 'cherthala',
      label: 'Regional Office',
      lines: [
        'IdealMG Educare LLP',
        'Infopark, Kelamangalam Rd',
        'Cherthala, Kerala 688531',
      ],
    },
    {
      id: 'kottayam',
      label: 'Kottayam Office',
      lines: [
        'IdealMG Educare LLP',
        'Ashirwad Arcade, 2nd Floor',
        'Kottayam, Kerala 686001',
      ],
    },
  ],
  boards: [
    {
      id: 'cbse',
      name: 'CBSE',
      tag: 'Most requested',
      levels: 'Classes 1–12',
      description:
        'Personalised coaching aligned to the CBSE syllabus — from foundational maths to Class 12 board readiness.',
      topics: [
        'Classes 1–5 foundational literacy & numeracy',
        'Classes 6–8 concept building across Maths, Science & English',
        'Classes 9–10 board-focused practice and revision cycles',
        'Classes 11–12 stream support (PCM / PCB / Commerce basics)',
      ],
    },
    {
      id: 'icse',
      name: 'ICSE / ISC',
      tag: 'Concept depth',
      levels: 'Classes 1–12',
      description:
        'Structured support for ICSE and ISC with focus on conceptual clarity and exam technique.',
      topics: [
        'ICSE middle-school reinforcement',
        'ICSE Class 9–10 subject mastery and paper technique',
        'ISC Class 11–12 depth with application focus',
        'English language & literature support',
      ],
    },
    {
      id: 'kerala',
      name: 'Kerala State Board',
      tag: 'Local expertise',
      levels: 'SSLC & Plus Two',
      description:
        'Local expertise for Kerala SSLC and Higher Secondary, taught in a language and pace that fits your child.',
      topics: [
        'SSLC syllabus coverage in English or Malayalam medium',
        'Plus One & Plus Two Science and Commerce streams',
        'Chapter-wise tests and model exam drills',
        'Aligned to the Kerala board exam calendar',
      ],
    },
  ],
  subjects: [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Social Science',
  ],
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
} as const

export function whatsappUrl(message?: string) {
  const text = message ?? site.whatsappMessage
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`
}
