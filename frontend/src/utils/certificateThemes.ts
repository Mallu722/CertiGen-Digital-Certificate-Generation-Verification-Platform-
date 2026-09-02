export interface StoreColorTheme {
  id: string;
  name: string;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  bgTint: string;
  description: string;
}

export const STORE_COLOR_THEMES: StoreColorTheme[] = [
  {
    id: 'royal-gold-navy',
    name: 'Royal Imperial Gold & Navy',
    label: 'Royal Standard',
    primary: '#0f2744',   // Deep Diplomatic Navy
    secondary: '#c59b27', // Imperial Gold
    accent: '#e2d19f',
    bgTint: '#fdfdfe',
    description: 'Traditional university & honors diploma style with gold filigree.'
  },
  {
    id: 'emerald-prestige',
    name: 'Emerald Prestige & Gold',
    label: 'Emerald Academy',
    primary: '#064e3b',   // British Racing / Forest Emerald
    secondary: '#d97706', // Antique Amber Gold
    accent: '#a7f3d0',
    bgTint: '#fdfefe',
    description: 'Prestigious academic academy and executive completion certificate.'
  },
  {
    id: 'crimson-burgundy',
    name: 'Burgundy Crimson & Champagne',
    label: 'Burgundy Honor',
    primary: '#7f1d1d',   // Harvard / Oxford Crimson
    secondary: '#ca8a04', // Champagne Gold
    accent: '#fecdd3',
    bgTint: '#fffdfd',
    description: 'Distinguished scholarly merit and honorary fellowship awards.'
  },
  {
    id: 'sapphire-tech',
    name: 'Sapphire & Cyber Cyan',
    label: 'Tech & Hackathon',
    primary: '#0f172a',   // Slate Onyx
    secondary: '#0284c7', // Sapphire Sky
    accent: '#38bdf8',
    bgTint: '#fafcff',
    description: 'Modern innovation, engineering hackathons, and technical bootcamps.'
  },
  {
    id: 'regal-purple',
    name: 'Regal Purple & Rose Gold',
    label: 'Presidential Award',
    primary: '#581c87',   // Imperial Purple
    secondary: '#e11d48', // Rose Gold / Ruby
    accent: '#fbcfe8',
    bgTint: '#fdfaff',
    description: 'Leadership excellence, community champions, and prestigious recognitions.'
  },
  {
    id: 'corporate-platinum',
    name: 'Onyx Black & Platinum Silver',
    label: 'Corporate Executive',
    primary: '#18181b',   // Pure Onyx
    secondary: '#4f46e5', // Deep Indigo / Silver Accent
    accent: '#cbd5e1',
    bgTint: '#fbfbfb',
    description: 'Corporate certification, professional tenure, and business excellence.'
  }
];

export interface PresetInstituteLogo {
  id: string;
  name: string;
  subtitle: string;
  type: 'academic' | 'tech' | 'corporate' | 'excellence';
  svgDataUri: string;
}

// Crisp inline SVG vector crests for instant institute branding
export const PRESET_INSTITUTE_LOGOS: PresetInstituteLogo[] = [
  {
    id: 'academic-crest',
    name: 'Royal Academic University',
    subtitle: 'Faculty of Excellence',
    type: 'academic',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" stroke="%23c59b27" stroke-width="3" fill="%230f2744"/><circle cx="50" cy="50" r="41" stroke="%23e2d19f" stroke-width="1" stroke-dasharray="3 3"/><path d="M50 18L30 26V46C30 62 38 72 50 78C62 72 70 62 70 46V26L50 18Z" fill="%23c59b27"/><path d="M50 24L34 30V44C34 57 41 65 50 70C59 65 66 57 66 44V30L50 24Z" fill="%230f2744"/><path d="M43 40C43 40 46 38 50 38C54 38 57 40 57 40V54C57 54 54 52 50 52C46 52 43 54 43 54V40Z" fill="%23e2d19f"/><line x1="50" y1="38" x2="50" y2="52" stroke="%230f2744" stroke-width="1.5"/><path d="M47 34L50 28L53 34" stroke="%23c59b27" stroke-width="2" stroke-linecap="round"/></svg>`
  },
  {
    id: 'tech-institute',
    name: 'Institute of Advanced Technology',
    subtitle: 'Engineering & Computing',
    type: 'tech',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><polygon points="50,8 88,28 88,72 50,92 12,72 12,28" stroke="%230284c7" stroke-width="3" fill="%230f172a"/><polygon points="50,16 80,32 80,68 50,84 20,68 20,32" stroke="%2338bdf8" stroke-width="1.5" fill="%231e293b"/><circle cx="50" cy="50" r="14" fill="%230284c7"/><circle cx="50" cy="50" r="8" fill="%2338bdf8"/><line x1="50" y1="22" x2="50" y2="36" stroke="%2338bdf8" stroke-width="2"/><line x1="50" y1="64" x2="50" y2="78" stroke="%2338bdf8" stroke-width="2"/><line x1="26" y1="50" x2="36" y2="50" stroke="%2338bdf8" stroke-width="2"/><line x1="64" y1="50" x2="74" y2="50" stroke="%2338bdf8" stroke-width="2"/></svg>`
  },
  {
    id: 'corporate-crest',
    name: 'Global Corporate Enterprise',
    subtitle: 'Executive Leadership',
    type: 'corporate',
    svgDataUri: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="44" stroke="%23ca8a04" stroke-width="3" fill="%2318181b"/><path d="M50 18L56 34L73 34L60 45L65 61L50 51L35 61L40 45L27 34L44 34Z" fill="%23ca8a04"/><path d="M26 70C33 76 41 80 50 80C59 80 67 76 74 70" stroke="%23ca8a04" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="7" fill="%23fef08a"/></svg>`
  },
  {
    id: 'certigen-official',
    name: 'CertiGen Verification Authority',
    subtitle: 'National Credential Register',
    type: 'excellence',
    svgDataUri: '/favicon.svg'
  }
];
