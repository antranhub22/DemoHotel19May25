const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/vapi-B7_TMExs.js',
      'assets/charts-ceMktdbA.js',
      'assets/css-utils-BkLtITBR.js',
      'assets/react-core-C6DwaHZM.js',
      'assets/vendor-BXT5a8vO.js',
      'assets/ui-vendor-BQCqNqg0.js',
      'assets/charts-utils-DdC1WR7j.js',
      'assets/daily-B2K33vhj.js',
    ])
) => i.map(i => d[i]);
import { t as C, c as x } from './css-utils-BkLtITBR.js';
import { _ as V } from './hooks-context-CVvU1W40.js';
import { ad as L } from './vendor-BXT5a8vO.js';
function ne(...e) {
  return C(x(e));
}
function N(e, t) {
  if (e === t) return 1;
  if (e.length === 0 || t.length === 0) return 0;
  const n = e.length > t.length ? e : t,
    o = e.length > t.length ? t : e;
  if (n.includes(o)) return o.length / n.length;
  let s = 0;
  for (let r = 0; r < o.length; r++) n.includes(o[r]) && s++;
  return s / o.length;
}
function R(e, t = 0.8) {
  const n = [],
    o = new Map();
  for (const s of e) {
    const r = s.name.toLowerCase().replace(/\s+/g, ' ').trim();
    let i = !1;
    const a = Array.from(o.keys());
    for (const u of a)
      if (N(r, u) > t) {
        i = !0;
        break;
      }
    i || (o.set(r, !0), n.push(s));
  }
  return n;
}
const A = {
  roomNumber:
    /(?:room(?:\s+number)?|room|phòng)(?:\s*[:#\-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/i,
  specialInstructions:
    /(?:special|additional|extra|note|instruction|request|preference)[:\s]*([^\.]+)/i,
  deliveryTime: /(?:delivery|arrival|ready|serve|bring)[:\s]*([^\.]+)/i,
  totalAmount:
    /(?:total|amount|cost|price|bill|charge)[:\s]*(\d+(?:,\d+)*(?:\.\d+)?)/i,
};
function z(e) {
  const t = e.match(A.roomNumber);
  return t ? t[1] || t[2] : null;
}
function M(e) {
  const t = e.match(A.specialInstructions);
  return t ? t[1].trim() : null;
}
function $(e) {
  const t = e.match(A.deliveryTime);
  return t ? t[1].trim() : null;
}
function _(e) {
  const t = e.match(A.totalAmount);
  return t ? parseFloat(t[1].replace(/,/g, '')) : null;
}
const l = {
    roomNumber:
      /(?:room(?:\s+number)?|room|phòng)(?:\s*[:#\-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/i,
    food: /food|beverage|breakfast|lunch|dinner|meal|drink|snack|restaurant/i,
    housekeeping: /housekeeping|cleaning|towel|cleaning\s*service|laundry/i,
    roomService: /room\s*service/i,
    spa: /spa|massage|wellness|treatment/i,
    transportation: /transportation|taxi|car|shuttle|airport\s*transfer/i,
    tours: /tour|sightseeing|excursion|attraction|visit|activity/i,
    technical:
      /wifi|internet|tv|television|remote|device|technical|connection/i,
    concierge: /reservation|booking|restaurant|ticket|arrangement|concierge/i,
    wellness: /gym|fitness|exercise|yoga|swimming|pool|sauna/i,
    security: /safe|security|lost|found|key|card|lock|emergency/i,
    specialOccasion:
      /birthday|anniversary|celebration|honeymoon|proposal|wedding|special occasion/i,
    other:
      /currency\s*exchange|money\s*change|exchange\s*money|foreign\s*currency|bus\s*ticket|train\s*ticket|sell|purchase|buy/i,
    items: /items?[:\s]*([^\.]+)/i,
    request:
      /(?:requested|asked for|ordered|booking|reservation for|inquired about)\s+([^\.;]+)/gi,
    bullets: /(?:^|\n)[-•*]\s*([^\n]+)/g,
    sentences: /\.(?:\s|$)/,
  },
  F = {
    roomService: 'room-service',
    food: 'food-beverage',
    housekeeping: 'housekeeping',
    transportation: 'transportation',
    spa: 'spa',
    tours: 'tours-activities',
    technical: 'technical-support',
    concierge: 'concierge',
    wellness: 'wellness-fitness',
    security: 'security',
    specialOccasion: 'special-occasions',
    wifi: 'wifi-faq',
    checkIn: 'check-in-out',
    checkOut: 'check-in-out',
    information: 'hotel-info',
    tourism: 'attractions',
    feedback: 'feedback',
    support: 'support',
    other: 'other',
  };
function oe(e) {
  const t = e.match(l.roomNumber);
  if (t) return t[1] || t[2] || null;
  const n = e.match(
    /(?:room details|room number|phòng số)(?:\s*[:#\-]?\s*)([0-9]{1,4}[A-Za-z]?)/i
  );
  if (n && n[1]) return n[1];
  const o = e.match(
    /(?:details[\s\S]*?room(?:\s+number)?[\s\S]*?)([0-9]{1,4}[A-Za-z]?)/i
  );
  return o && o[1] ? o[1] : null;
}
function U(e) {
  const t = [];
  (l.food.test(e) && t.push('food'),
    l.housekeeping.test(e) && t.push('housekeeping'),
    l.transportation.test(e) && t.push('transportation'),
    l.roomService.test(e) && t.push('roomService'),
    l.spa.test(e) && t.push('spa'),
    l.tours.test(e) && t.push('tours'),
    l.technical.test(e) && t.push('technical'),
    l.concierge.test(e) && t.push('concierge'),
    l.wellness.test(e) && t.push('wellness'),
    l.security.test(e) && t.push('security'),
    l.specialOccasion.test(e) && t.push('specialOccasion'),
    l.other.test(e) && t.push('other'));
  const n = t.map(o => F[o] || 'other');
  return n.length > 0 ? n : ['other'];
}
function H(e) {
  return U(e).join(',');
}
function j(e) {
  const t = e.match(l.items);
  let n = [];
  const o = e.match(l.bullets);
  if (o && o.length > 0) {
    const r = o
      .map((i, a) => {
        const u = i.replace(/^[-•*]\s*/, '').trim();
        return y(u, a);
      })
      .filter(i => i.name.length > 0);
    n = [...n, ...r];
  }
  {
    const r = e.match(l.request);
    if (r && r.length > 0) {
      const i = r
        .map((a, u) => {
          const g = a
            .replace(
              /(?:requested|asked for|ordered|booking|reservation for|inquired about)\s+/i,
              ''
            )
            .trim();
          return y(g, u);
        })
        .filter(a => a.name.length > 0);
      n = [...n, ...i];
    }
  }
  if (t) {
    const a = t[1]
      .split(/(?:,\s*|\s+and\s+|\s*&\s*|\s*\+\s*)/)
      .map((u, g) => y(u, g))
      .filter(u => u.name.length > 0);
    n = [...n, ...a];
  }
  if (n.length === 0) {
    const r = e.split(l.sentences);
    for (let i = 0; i < r.length; i++) {
      const a = r[i].trim();
      (a.toLowerCase().includes('request') ||
        a.toLowerCase().includes('book') ||
        a.toLowerCase().includes('order') ||
        a.toLowerCase().includes('exchange') ||
        a.toLowerCase().includes('inquired')) &&
        n.push(y(a, n.length));
    }
  }
  return R(n, 0.8).map((r, i) => ({ ...r, id: (i + 1).toString() }));
}
function y(e, t) {
  const n = e
      .trim()
      .replace(/^[-•*]\s+/, '')
      .replace(/^- /, ''),
    o = n.match(/^([0-9]+)\s+(.+)$/),
    s = o ? parseInt(o[1]) : 1,
    r = o ? o[2] : n;
  let i = '';
  const a = n.match(
      /(?:on|for)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i
    ),
    u = a ? `Date: ${a[1]}` : '',
    g = n.match(/(\d+)\s+(?:people|person|pax|guest|adult|child|passenger)/i),
    D = g ? `Guests: ${g[1]} people` : '',
    v = n.match(
      /(?:to|in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z][A-Z]+|[A-Z][a-z]+)/
    ),
    P = v ? `Location: ${v[1]}` : '',
    k = n.match(/(?:at|from)\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i),
    E = k ? `Time: ${k[1]}` : '',
    d = n.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:USD|US dollars|\$|VND|dong)/i),
    q = d
      ? `Amount: ${d[1]} ${d[0].includes('USD') || d[0].includes('US') || d[0].includes('$') ? 'USD' : 'VND'}`
      : '',
    I = [u, D, P, E, q].filter(O => O.length > 0);
  return (
    I.length > 0
      ? (i = I.join(`
`))
      : (i = `Details for ${r.charAt(0).toLowerCase() + r.slice(1)}`),
    {
      id: (t + 1).toString(),
      name: r.charAt(0).toUpperCase() + r.slice(1),
      description: i,
      quantity: s,
      price: G(r),
    }
  );
}
function G(e) {
  const t = e.toLowerCase();
  return /sandwich|burger|pasta|steak|fish|chicken|breakfast|lunch|dinner/.test(
    t
  )
    ? 15
    : /coffee|tea|juice|water|soda|wine|beer|cocktail|drink/.test(t)
      ? 8
      : /towel|soap|shampoo|toothbrush|toothpaste|amenities/.test(t)
        ? 5
        : /cleaning|housekeeping|laundry|ironing/.test(t)
          ? 20
          : /taxi|car|shuttle|transfer/.test(t)
            ? 30
            : 10;
}
function re(e) {
  if (!e) return {};
  const t = z(e) || '',
    n = H(e),
    o = $(e) || '',
    s = M(e) || '',
    r = j(e),
    i = _(e) || 0;
  return {
    roomNumber: t,
    orderType: n,
    deliveryTime: o,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialInstructions: s,
    items: r,
    totalAmount: i,
  };
}
let h = null;
const Z = async () => {
    if (h) return h;
    try {
      console.log('🔄 [VAPI] Loading Vapi module...');
      const e = await V(
        () => import('./vapi-B7_TMExs.js').then(t => t.v),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7])
      );
      if (((h = e.default || e), typeof h == 'function'))
        return (
          console.log('✅ [VAPI] Successfully loaded via dynamic import'),
          h
        );
      throw new Error('Dynamic import failed, trying alternative...');
    } catch (e) {
      console.warn('⚠️ [VAPI] Dynamic import failed:', e.message);
      try {
        if (typeof window < 'u' && window.Vapi)
          return (
            (h = window.Vapi),
            console.log('✅ [VAPI] Found Vapi on window object'),
            h
          );
        throw new Error('No Vapi available');
      } catch (t) {
        throw (
          console.error('❌ [VAPI] All import methods failed:', t),
          new Error('Failed to load Vapi: ' + t.message)
        );
      }
    }
  },
  w = 'pk_c3e56893-4a8b-45bb-b3d6-b5a2a0edd8f8';
console.log('[vapiClient] Environment public key:', w);
let c = null,
  f = !1;
const T = async e => {
    try {
      if (
        (console.log(
          '🚀 [REAL VAPI] Initializing with key:',
          e?.substring(0, 10) + '...'
        ),
        f)
      )
        return (
          console.log(
            '⏳ [REAL VAPI] Already initializing, waiting for current initialization...'
          ),
          new Promise((n, o) => {
            const s = setInterval(() => {
              f || (clearInterval(s), n(c));
            }, 100);
            setTimeout(() => {
              (clearInterval(s), o(new Error('Vapi initialization timeout')));
            }, 5e3);
          })
        );
      f = !0;
      const t = await Z();
      if ((console.log('🚀 [REAL VAPI] Vapi class loaded:', typeof t), c)) {
        console.log('🧹 [REAL VAPI] Cleaning up existing instance...');
        try {
          (typeof c.stop == 'function' && c.stop(),
            typeof c.cleanup == 'function' && c.cleanup(),
            typeof c.disconnect == 'function' && c.disconnect(),
            typeof c.removeAllListeners == 'function' && c.removeAllListeners(),
            console.log(
              '✅ [REAL VAPI] Existing instance cleaned up successfully'
            ));
        } catch (n) {
          console.warn('⚠️ [REAL VAPI] Cleanup error (continuing anyway):', n);
        }
        await new Promise(n => setTimeout(n, 200));
      }
      return (
        console.log('🚀 [REAL VAPI] Creating new Vapi instance...'),
        (c = new t(e, { allowMultipleCallInstances: !1 })),
        console.log('✅ [REAL VAPI] Instance created successfully!'),
        c.on('call-start', () => {
          console.log('[vapiClient] Call started');
        }),
        c.on('call-end', () => {
          console.log('[vapiClient] Call ended');
        }),
        c.on('speech-start', () => {
          console.log('[vapiClient] Speech started');
        }),
        c.on('speech-end', () => {
          console.log('[vapiClient] Speech ended');
        }),
        c.on('volume-level', n => {
          console.log('[vapiClient] Volume level:', n);
        }),
        c.on('message', n => {
          console.log('[vapiClient] Message received:', n);
        }),
        c.on('error', n => {
          console.error('[vapiClient] Vapi error:', n);
        }),
        (f = !1),
        console.log('✅ [REAL VAPI] Initialization completed successfully'),
        c
      );
    } catch (t) {
      throw (
        (f = !1),
        console.error('[vapiClient] Failed to initialize Vapi:', t),
        t
      );
    }
  },
  J = () => c;
(console.log('[vapiClient] Auto-initializing with environment key'),
  T(w).catch(e => {
    console.error('[vapiClient] Auto-initialization failed:', e);
  }));
const se = Object.freeze(
  Object.defineProperty(
    { __proto__: null, getVapiInstance: J, initVapi: T, publicKey: w },
    Symbol.toStringTag,
    { value: 'Module' }
  )
);
async function S(e) {
  if (!e.ok) {
    const t = (await e.text()) || e.statusText;
    throw new Error(`${e.status}: ${t}`);
  }
}
async function p({ url: e, method: t = 'GET', body: n = void 0 }) {
  const o = await fetch(e, {
    method: t,
    headers: n ? { 'Content-Type': 'application/json' } : {},
    body: n ? JSON.stringify(n) : void 0,
    credentials: 'include',
  });
  await S(o);
  try {
    return await o.json();
  } catch {
    return o;
  }
}
const B =
  ({ on401: e }) =>
  async ({ queryKey: t }) => {
    const n = await fetch(t[0], { credentials: 'include' });
    return (await S(n), await n.json());
  };
new L({
  defaultOptions: {
    queries: {
      queryFn: B({ on401: 'throw' }),
      refetchInterval: !1,
      refetchOnWindowFocus: !1,
      staleTime: 1 / 0,
      retry: !1,
    },
    mutations: { retry: !1 },
  },
});
class K {
  constructor() {
    this.baseUrl = '/api/dashboard';
  }
  async researchHotel(t) {
    try {
      return await p({
        url: `${this.baseUrl}/research-hotel`,
        method: 'POST',
        body: t,
      });
    } catch (n) {
      throw (
        console.error('Hotel research failed:', n),
        this.handleApiError(n)
      );
    }
  }
  async generateAssistant(t) {
    try {
      return await p({
        url: `${this.baseUrl}/generate-assistant`,
        method: 'POST',
        body: t,
      });
    } catch (n) {
      throw (
        console.error('Assistant generation failed:', n),
        this.handleApiError(n)
      );
    }
  }
  async getHotelProfile() {
    try {
      return await p({ url: `${this.baseUrl}/hotel-profile`, method: 'GET' });
    } catch (t) {
      throw (
        console.error('Failed to fetch hotel profile:', t),
        this.handleApiError(t)
      );
    }
  }
  async updateAssistantConfig(t) {
    try {
      return await p({
        url: `${this.baseUrl}/assistant-config`,
        method: 'PUT',
        body: t,
      });
    } catch (n) {
      throw (
        console.error('Failed to update assistant config:', n),
        this.handleApiError(n)
      );
    }
  }
  async getAnalytics() {
    try {
      return await p({ url: `${this.baseUrl}/analytics`, method: 'GET' });
    } catch (t) {
      throw (
        console.error('Failed to fetch analytics:', t),
        this.handleApiError(t)
      );
    }
  }
  async getServiceHealth() {
    try {
      return await p({ url: `${this.baseUrl}/service-health`, method: 'GET' });
    } catch (t) {
      throw (
        console.error('Failed to fetch service health:', t),
        this.handleApiError(t)
      );
    }
  }
  async resetAssistant() {
    try {
      return await p({
        url: `${this.baseUrl}/reset-assistant`,
        method: 'POST',
      });
    } catch (t) {
      throw (
        console.error('Failed to reset assistant:', t),
        this.handleApiError(t)
      );
    }
  }
  handleApiError(t) {
    if (t.error) return t;
    const n = t.message || 'An unexpected error occurred',
      o = n.match(/^(\d+):\s*(.+)$/);
    if (o) {
      const [, s, r] = o,
        i = parseInt(s);
      try {
        const a = JSON.parse(r);
        return {
          error: a.error || r,
          details: a.details,
          feature: a.feature,
          currentPlan: a.currentPlan,
          upgradeRequired: a.upgradeRequired,
          setupRequired: a.setupRequired,
          assistantRequired: a.assistantRequired,
          requiresResearch: a.requiresResearch,
        };
      } catch {
        return { error: r, details: { statusCode: i } };
      }
    }
    return { error: n, details: { originalError: t } };
  }
}
const ae = new K(),
  ie = e =>
    e &&
    typeof e.name == 'string' &&
    typeof e.address == 'string' &&
    Array.isArray(e.services) &&
    Array.isArray(e.amenities) &&
    e.policies &&
    Array.isArray(e.roomTypes),
  ce = e =>
    e &&
    [
      'professional',
      'friendly',
      'luxurious',
      'casual',
      'enthusiastic',
    ].includes(e.personality) &&
    ['formal', 'friendly', 'warm', 'energetic', 'calm'].includes(e.tone) &&
    Array.isArray(e.languages) &&
    e.languages.length > 0 &&
    ['office', 'off', 'hotel-lobby'].includes(e.backgroundSound),
  le = [
    {
      value: 'professional',
      label: 'Chuyên nghiệp',
      description: 'Lịch sự, trang trọng và đáng tin cậy',
    },
    {
      value: 'friendly',
      label: 'Thân thiện',
      description: 'Ấm áp, dễ gần và hữu ích',
    },
    {
      value: 'luxurious',
      label: 'Sang trọng',
      description: 'Tinh tế, đẳng cấp và chuyên nghiệp',
    },
    {
      value: 'casual',
      label: 'Thoải mái',
      description: 'Tự nhiên, gần gũi và dễ chịu',
    },
    {
      value: 'enthusiastic',
      label: 'Nhiệt tình',
      description: 'Tích cực, năng động và sôi nổi',
    },
  ],
  ue = [
    {
      value: 'formal',
      label: 'Trang trọng',
      description: 'Lịch sự và chuyên nghiệp',
    },
    { value: 'friendly', label: 'Thân thiện', description: 'Ấm áp và dễ gần' },
    { value: 'warm', label: 'Ấm áp', description: 'Gần gũi và chăm sóc' },
    {
      value: 'energetic',
      label: 'Năng động',
      description: 'Tích cực và sôi nổi',
    },
    { value: 'calm', label: 'Điềm tĩnh', description: 'Bình tĩnh và thư thái' },
  ],
  he = [
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  ],
  pe = [
    {
      value: 'hotel-lobby',
      label: 'Sảnh khách sạn',
      description: 'Nhạc nền nhẹ nhàng',
    },
    { value: 'office', label: 'Văn phòng', description: 'Âm thanh văn phòng' },
    {
      value: 'off',
      label: 'Tắt âm thanh',
      description: 'Không có âm thanh nền',
    },
  ],
  Q = e => {
    try {
      const n = JSON.parse(atob(e.split('.')[1])).exp * 1e3,
        o = Date.now(),
        s = o >= n;
      return (
        s &&
          console.log(
            '⏰ [AuthHelper] Token expired:',
            new Date(n),
            'vs now:',
            new Date(o)
          ),
        s
      );
    } catch (t) {
      return (console.error('❌ [AuthHelper] Failed to decode token:', t), !0);
    }
  },
  b = async () => {
    let e = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (e)
      if (Q(e))
        (console.log('⏰ [AuthHelper] Token expired, generating new one...'),
          localStorage.removeItem('token'),
          sessionStorage.removeItem('token'),
          (e = null));
      else return (console.log('✅ [AuthHelper] Valid token found'), e);
    return null;
  },
  m = async () => {
    const e = { 'Content-Type': 'application/json' },
      t = await b();
    return (t && (e.Authorization = `Bearer ${t}`), e);
  },
  W = async (e, t = {}) => {
    const n = async r => fetch(e, { ...t, headers: { ...r, ...t.headers } });
    let o = await m(),
      s = await n(o);
    return (
      s.status === 403 &&
        (console.log('🔄 [AuthHelper] 403 error, retrying with fresh token...'),
        localStorage.removeItem('token'),
        sessionStorage.removeItem('token'),
        (o = await m()),
        (s = await n(o)),
        s.status === 403
          ? console.error(
              '❌ [AuthHelper] Still 403 after token refresh - auth may be broken'
            )
          : console.log('✅ [AuthHelper] Success after token refresh!')),
      s
    );
  },
  ge = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        authenticatedFetch: W,
        getAuthHeaders: m,
        getAuthToken: b,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  Y = {
    async testLogin(e = 'manager') {
      console.log(`🔐 [DebugAuth] Testing login with ${e}...`);
      const t = {
          manager: { username: 'manager', password: 'manager123' },
          frontdesk: { username: 'frontdesk', password: 'frontdesk123' },
          itmanager: { username: 'itmanager', password: 'itmanager123' },
        },
        n = t[e] || t.manager;
      try {
        const o = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n),
        });
        if (
          (console.log('📋 [DebugAuth] Login response status:', o.status), o.ok)
        ) {
          const s = await o.json();
          return (console.log('✅ [DebugAuth] Login successful:', s), s);
        } else {
          const s = await o.text();
          return (
            console.error('❌ [DebugAuth] Login failed:', s),
            e === 'manager'
              ? (console.log(
                  '🔄 [DebugAuth] Manager failed, trying frontdesk...'
                ),
                await this.testLogin('frontdesk'))
              : null
          );
        }
      } catch (o) {
        return (console.error('❌ [DebugAuth] Login error:', o), null);
      }
    },
    async testGetAuthToken() {
      console.log('🎫 [DebugAuth] Testing getAuthToken...');
      try {
        const e = await b();
        return (console.log('✅ [DebugAuth] Got token:', e ? 'YES' : 'NO'), e);
      } catch (e) {
        return (console.error('❌ [DebugAuth] getAuthToken error:', e), null);
      }
    },
    async testAuthHeaders() {
      console.log('📋 [DebugAuth] Testing auth headers...');
      try {
        const e = await m();
        return (console.log('✅ [DebugAuth] Auth headers:', e), e);
      } catch (e) {
        return (console.error('❌ [DebugAuth] Auth headers error:', e), null);
      }
    },
    async testApiRequest() {
      console.log('🌐 [DebugAuth] Testing authenticated API request...');
      try {
        const e = await m(),
          t = await fetch('/api/request', { method: 'GET', headers: e });
        if (
          (console.log('📋 [DebugAuth] API request status:', t.status), t.ok)
        ) {
          const n = await t.json();
          return (console.log('✅ [DebugAuth] API request successful'), n);
        } else {
          const n = await t.text();
          return (console.error('❌ [DebugAuth] API request failed:', n), null);
        }
      } catch (e) {
        return (console.error('❌ [DebugAuth] API request error:', e), null);
      }
    },
    async clearTokens() {
      (console.log('🧹 [DebugAuth] Clearing all stored tokens...'),
        localStorage.removeItem('token'),
        sessionStorage.removeItem('token'),
        localStorage.removeItem('dev_auth_token'),
        console.log('✅ [DebugAuth] Tokens cleared'));
    },
    async forceRefreshToken() {
      return (
        console.log('🔄 [DebugAuth] Force refreshing token...'),
        await this.clearTokens(),
        await this.testGetAuthToken()
      );
    },
    async runFullTest() {
      console.log('🧪 [DebugAuth] Running full authentication test...');
      const e = {
        login: await this.testLogin(),
        token: await this.testGetAuthToken(),
        headers: await this.testAuthHeaders(),
        apiRequest: await this.testApiRequest(),
      };
      if (
        (console.log('📊 [DebugAuth] Full test results:', e), !e.apiRequest)
      ) {
        (console.log(
          '🔄 [DebugAuth] API request failed, trying with fresh token...'
        ),
          await this.forceRefreshToken());
        const t = await this.testApiRequest();
        e.retryWithFreshToken = t;
      }
      return e;
    },
  };
typeof window < 'u' && (window.debugAuth = Y);
export {
  pe as B,
  he as L,
  le as P,
  ue as T,
  ce as a,
  b,
  ne as c,
  ae as d,
  oe as e,
  se as f,
  J as g,
  ge as h,
  T as i,
  re as p,
  ie as v,
};
