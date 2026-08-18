export function normalizeRegion(value = '') {
  const trimmed = String(value).trim().toUpperCase()
  return trimmed === 'GCC' ? 'GCC' : 'India'
}

const brands = {
  India: {
    name: 'MG Tuition India',
    legal: 'IdealMG Educare LLP',
    tagline: 'Small-batch live tuition for CBSE, ICSE & IGCSE',
    emailDefault: 'info@mgtuition.in',
  },
  GCC: {
    name: 'MG Tuition GCC',
    legal: 'IdealMG Educare FZC',
    tagline: 'Small-batch live tuition for CBSE, ICSE & IGCSE',
    emailDefault: 'info@mgtuition.ae',
  },
}

export function getSiteBrand(env) {
  const region = normalizeRegion(env.Region || env.VITE_REGION)
  return { region, ...brands[region] }
}
