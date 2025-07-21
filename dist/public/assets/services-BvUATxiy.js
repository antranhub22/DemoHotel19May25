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
import { t as x, c as V } from './css-utils-BkLtITBR.js';
import { _ as L } from './hooks-context-BUKIDDkP.js';
import { ad as N } from './vendor-BXT5a8vO.js';
import { l as s } from './components-LYkGJCyk.js';
function oe(...e) {
  return x(V(e));
}
function R(e, t) {
  if (e === t) return 1;
  if (e.length === 0 || t.length === 0) return 0;
  const n = e.length > t.length ? e : t,
    r = e.length > t.length ? t : e;
  if (n.includes(r)) return r.length / n.length;
  let a = 0;
  for (let o = 0; o < r.length; o++) n.includes(r[o]) && a++;
  return a / r.length;
}
function $(e, t = 0.8) {
  const n = [],
    r = new Map();
  for (const a of e) {
    const o = a.name.toLowerCase().replace(/\s+/g, ' ').trim();
    let c = !1;
    const i = Array.from(r.keys());
    for (const h of i)
      if (R(o, h) > t) {
        c = !0;
        break;
      }
    c || (r.set(o, !0), n.push(a));
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
function _(e) {
  const t = e.match(A.deliveryTime);
  return t ? t[1].trim() : null;
}
function F(e) {
  const t = e.match(A.totalAmount);
  return t ? parseFloat(t[1].replace(/,/g, '')) : null;
}
const u = {
    roomNumber:
      /(?:room(?:\s+number)?|room|phòng)(?:\s*[:#-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/i,
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
    items: /items?[:\s]*([^.]+)/i,
    request:
      /(?:requested|asked for|ordered|booking|reservation for|inquired about)\s+([^.;]+)/gi,
    bullets: /(?:^|\n)[-•*]\s*([^\n]+)/g,
    sentences: /\.(?:\s|$)/,
  },
  U = {
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
function se(e) {
  const t = e.match(u.roomNumber);
  if (t) return t[1] || t[2] || null;
  const n = e.match(
    /(?:room details|room number|phòng số)(?:\s*[:#-]?\s*)([0-9]{1,4}[A-Za-z]?)/i
  );
  if (n && n[1]) return n[1];
  const r = e.match(
    /(?:details[\s\S]*?room(?:\s+number)?[\s\S]*?)([0-9]{1,4}[A-Za-z]?)/i
  );
  return r && r[1] ? r[1] : null;
}
function H(e) {
  const t = [];
  (u.food.test(e) && t.push('food'),
    u.housekeeping.test(e) && t.push('housekeeping'),
    u.transportation.test(e) && t.push('transportation'),
    u.roomService.test(e) && t.push('roomService'),
    u.spa.test(e) && t.push('spa'),
    u.tours.test(e) && t.push('tours'),
    u.technical.test(e) && t.push('technical'),
    u.concierge.test(e) && t.push('concierge'),
    u.wellness.test(e) && t.push('wellness'),
    u.security.test(e) && t.push('security'),
    u.specialOccasion.test(e) && t.push('specialOccasion'),
    u.other.test(e) && t.push('other'));
  const n = t.map(r => U[r] || 'other');
  return n.length > 0 ? n : ['other'];
}
function j(e) {
  return H(e).join(',');
}
function G(e) {
  const t = e.match(u.items);
  let n = [];
  const r = e.match(u.bullets);
  if (r && r.length > 0) {
    const o = r
      .map((c, i) => {
        const h = c.replace(/^[-•*]\s*/, '').trim();
        return y(h, i);
      })
      .filter(c => c.name.length > 0);
    n = [...n, ...o];
  }
  {
    const o = e.match(u.request);
    if (o && o.length > 0) {
      const c = o
        .map((i, h) => {
          const d = i
            .replace(
              /(?:requested|asked for|ordered|booking|reservation for|inquired about)\s+/i,
              ''
            )
            .trim();
          return y(d, h);
        })
        .filter(i => i.name.length > 0);
      n = [...n, ...c];
    }
  }
  if (t) {
    const i = t[1]
      .split(/(?:,\s*|\s+and\s+|\s*&\s*|\s*\+\s*)/)
      .map((h, d) => y(h, d))
      .filter(h => h.name.length > 0);
    n = [...n, ...i];
  }
  if (n.length === 0) {
    const o = e.split(u.sentences);
    for (let c = 0; c < o.length; c++) {
      const i = o[c].trim();
      (i.toLowerCase().includes('request') ||
        i.toLowerCase().includes('book') ||
        i.toLowerCase().includes('order') ||
        i.toLowerCase().includes('exchange') ||
        i.toLowerCase().includes('inquired')) &&
        n.push(y(i, n.length));
    }
  }
  return $(n, 0.8).map((o, c) => ({ ...o, id: (c + 1).toString() }));
}
function y(e, t) {
  const n = e
      .trim()
      .replace(/^[-•*]\s+/, '')
      .replace(/^- /, ''),
    r = n.match(/^([0-9]+)\s+(.+)$/),
    a = r ? parseInt(r[1]) : 1,
    o = r ? r[2] : n;
  let c = '';
  const i = n.match(
      /(?:on|for)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i
    ),
    h = i ? `Date: ${i[1]}` : '',
    d = n.match(/(\d+)\s+(?:people|person|pax|guest|adult|child|passenger)/i),
    D = d ? `Guests: ${d[1]} people` : '',
    C = n.match(
      /(?:to|in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z][A-Z]+|[A-Z][a-z]+)/
    ),
    P = C ? `Location: ${C[1]}` : '',
    k = n.match(/(?:at|from)\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i),
    E = k ? `Time: ${k[1]}` : '',
    m = n.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:USD|US dollars|\$|VND|dong)/i),
    q = m
      ? `Amount: ${m[1]} ${m[0].includes('USD') || m[0].includes('US') || m[0].includes('$') ? 'USD' : 'VND'}`
      : '',
    I = [h, D, P, E, q].filter(O => O.length > 0);
  return (
    I.length > 0
      ? (c = I.join(`
`))
      : (c = `Details for ${o.charAt(0).toLowerCase() + o.slice(1)}`),
    {
      id: (t + 1).toString(),
      name: o.charAt(0).toUpperCase() + o.slice(1),
      description: c,
      quantity: a,
      price: Z(o),
    }
  );
}
function Z(e) {
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
function ae(e) {
  if (!e) return {};
  const t = z(e) || '',
    n = j(e),
    r = _(e) || '',
    a = M(e) || '',
    o = G(e),
    c = F(e) || 0;
  return {
    roomNumber: t,
    orderType: n,
    deliveryTime: r,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialInstructions: a,
    items: o,
    totalAmount: c,
  };
}
let p = null;
const J = async () => {
    if (p) return p;
    try {
      logger.debug('🔄 [VAPI] Loading Vapi module...', 'Component');
      const e = await L(
        () => import('./vapi-B7_TMExs.js').then(t => t.v),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7])
      );
      if (((p = e.default || e), typeof p == 'function'))
        return (
          logger.debug(
            '✅ [VAPI] Successfully loaded via dynamic import',
            'Component'
          ),
          p
        );
      throw new Error('Dynamic import failed, trying alternative...');
    } catch (e) {
      logger.warn('⚠️ [VAPI] Dynamic import failed:', 'Component', e.message);
      try {
        if (typeof window < 'u' && window.Vapi)
          return (
            (p = window.Vapi),
            logger.debug('✅ [VAPI] Found Vapi on window object', 'Component'),
            p
          );
        throw new Error('No Vapi available');
      } catch (t) {
        throw (
          logger.error('❌ [VAPI] All import methods failed:', 'Component', t),
          new Error(`Failed to load Vapi: ${t.message}`)
        );
      }
    }
  },
  w = 'pk_c3e56893-4a8b-45bb-b3d6-b5a2a0edd8f8';
logger.debug('[vapiClient] Environment public key:', 'Component', w);
let l = null,
  f = !1;
const T = async e => {
    try {
      if (
        (logger.debug(
          '🚀 [REAL VAPI] Initializing with key:',
          'Component',
          `${e?.substring(0, 10)}...`
        ),
        f)
      )
        return (
          logger.debug(
            '⏳ [REAL VAPI] Already initializing, waiting for current initialization...',
            'Component'
          ),
          new Promise((n, r) => {
            const a = setInterval(() => {
              f || (clearInterval(a), n(l));
            }, 100);
            setTimeout(() => {
              (clearInterval(a), r(new Error('Vapi initialization timeout')));
            }, 5e3);
          })
        );
      f = !0;
      const t = await J();
      if (
        (logger.debug(
          '🚀 [REAL VAPI] Vapi class loaded:',
          'Component',
          typeof t
        ),
        l)
      ) {
        logger.debug(
          '🧹 [REAL VAPI] Cleaning up existing instance...',
          'Component'
        );
        try {
          (typeof l.stop == 'function' && l.stop(),
            typeof l.cleanup == 'function' && l.cleanup(),
            typeof l.disconnect == 'function' && l.disconnect(),
            typeof l.removeAllListeners == 'function' && l.removeAllListeners(),
            logger.debug(
              '✅ [REAL VAPI] Existing instance cleaned up successfully',
              'Component'
            ));
        } catch (n) {
          logger.warn(
            '⚠️ [REAL VAPI] Cleanup error (continuing anyway):',
            'Component',
            n
          );
        }
        await new Promise(n => setTimeout(n, 200));
      }
      return (
        logger.debug(
          '🚀 [REAL VAPI] Creating new Vapi instance...',
          'Component'
        ),
        (l = new t(e, { allowMultipleCallInstances: !1 })),
        logger.debug(
          '✅ [REAL VAPI] Instance created successfully!',
          'Component'
        ),
        l.on('call-start', () => {
          logger.debug('[vapiClient] Call started', 'Component');
        }),
        l.on('call-end', () => {
          logger.debug('[vapiClient] Call ended', 'Component');
        }),
        l.on('speech-start', () => {
          logger.debug('[vapiClient] Speech started', 'Component');
        }),
        l.on('speech-end', () => {
          logger.debug('[vapiClient] Speech ended', 'Component');
        }),
        l.on('volume-level', n => {
          logger.debug('[vapiClient] Volume level:', 'Component', n);
        }),
        l.on('message', n => {
          logger.debug('[vapiClient] Message received:', 'Component', n);
        }),
        l.on('error', n => {
          logger.error('[vapiClient] Vapi error:', 'Component', n);
        }),
        (f = !1),
        logger.debug(
          '✅ [REAL VAPI] Initialization completed successfully',
          'Component'
        ),
        l
      );
    } catch (t) {
      throw (
        (f = !1),
        logger.error('[vapiClient] Failed to initialize Vapi:', 'Component', t),
        t
      );
    }
  },
  B = () => l;
(logger.debug(
  '[vapiClient] Auto-initializing with environment key',
  'Component'
),
  T(w).catch(e => {
    logger.error('[vapiClient] Auto-initialization failed:', 'Component', e);
  }));
const ie = Object.freeze(
  Object.defineProperty(
    { __proto__: null, getVapiInstance: B, initVapi: T, publicKey: w },
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
async function g({ url: e, method: t = 'GET', body: n = void 0 }) {
  const r = await fetch(e, {
    method: t,
    headers: n ? { 'Content-Type': 'application/json' } : {},
    body: n ? JSON.stringify(n) : void 0,
    credentials: 'include',
  });
  await S(r);
  try {
    return await r.json();
  } catch {
    return r;
  }
}
const K =
  ({ on401: e }) =>
  async ({ queryKey: t }) => {
    const n = await fetch(t[0], { credentials: 'include' });
    return (await S(n), await n.json());
  };
new N({
  defaultOptions: {
    queries: {
      queryFn: K({ on401: 'throw' }),
      refetchInterval: !1,
      refetchOnWindowFocus: !1,
      staleTime: 1 / 0,
      retry: !1,
    },
    mutations: { retry: !1 },
  },
});
class Q {
  baseUrl = '/api/dashboard';
  async researchHotel(t) {
    try {
      return await g({
        url: `${this.baseUrl}/research-hotel`,
        method: 'POST',
        body: t,
      });
    } catch (n) {
      throw (
        s.error('Hotel research failed:', 'Component', n),
        this.handleApiError(n)
      );
    }
  }
  async generateAssistant(t) {
    try {
      return await g({
        url: `${this.baseUrl}/generate-assistant`,
        method: 'POST',
        body: t,
      });
    } catch (n) {
      throw (
        s.error('Assistant generation failed:', 'Component', n),
        this.handleApiError(n)
      );
    }
  }
  async getHotelProfile() {
    try {
      return await g({ url: `${this.baseUrl}/hotel-profile`, method: 'GET' });
    } catch (t) {
      throw (
        s.error('Failed to fetch hotel profile:', 'Component', t),
        this.handleApiError(t)
      );
    }
  }
  async updateAssistantConfig(t) {
    try {
      return await g({
        url: `${this.baseUrl}/assistant-config`,
        method: 'PUT',
        body: t,
      });
    } catch (n) {
      throw (
        s.error('Failed to update assistant config:', 'Component', n),
        this.handleApiError(n)
      );
    }
  }
  async getAnalytics() {
    try {
      return await g({ url: `${this.baseUrl}/analytics`, method: 'GET' });
    } catch (t) {
      throw (
        s.error('Failed to fetch analytics:', 'Component', t),
        this.handleApiError(t)
      );
    }
  }
  async getServiceHealth() {
    try {
      return await g({ url: `${this.baseUrl}/service-health`, method: 'GET' });
    } catch (t) {
      throw (
        s.error('Failed to fetch service health:', 'Component', t),
        this.handleApiError(t)
      );
    }
  }
  async resetAssistant() {
    try {
      return await g({
        url: `${this.baseUrl}/reset-assistant`,
        method: 'POST',
      });
    } catch (t) {
      throw (
        s.error('Failed to reset assistant:', 'Component', t),
        this.handleApiError(t)
      );
    }
  }
  handleApiError(t) {
    if (t.error) return t;
    const n = t.message || 'An unexpected error occurred',
      r = n.match(/^(\d+):\s*(.+)$/);
    if (r) {
      const [, a, o] = r,
        c = parseInt(a);
      try {
        const i = JSON.parse(o);
        return {
          error: i.error || o,
          details: i.details,
          feature: i.feature,
          currentPlan: i.currentPlan,
          upgradeRequired: i.upgradeRequired,
          setupRequired: i.setupRequired,
          assistantRequired: i.assistantRequired,
          requiresResearch: i.requiresResearch,
        };
      } catch {
        return { error: o, details: { statusCode: c } };
      }
    }
    return { error: n, details: { originalError: t } };
  }
}
const ce = new Q(),
  le = e =>
    e &&
    typeof e.name == 'string' &&
    typeof e.address == 'string' &&
    Array.isArray(e.services) &&
    Array.isArray(e.amenities) &&
    e.policies &&
    Array.isArray(e.roomTypes),
  ue = e =>
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
  he = [
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
  pe = [
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
  ge = [
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
  ],
  de = [
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
  W = e => {
    try {
      const n = JSON.parse(atob(e.split('.')[1])).exp * 1e3,
        r = Date.now(),
        a = r >= n;
      return (
        a &&
          logger.debug(
            '⏰ [AuthHelper] Token expired:',
            'Component',
            new Date(n),
            'vs now:',
            new Date(r)
          ),
        a
      );
    } catch (t) {
      return (
        logger.error('❌ [AuthHelper] Failed to decode token:', 'Component', t),
        !0
      );
    }
  },
  v = async () => {
    let e = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (e)
      if (W(e))
        (logger.debug(
          '⏰ [AuthHelper] Token expired, generating new one...',
          'Component'
        ),
          localStorage.removeItem('token'),
          sessionStorage.removeItem('token'),
          (e = null));
      else
        return (
          logger.debug('✅ [AuthHelper] Valid token found', 'Component'),
          e
        );
    return null;
  },
  b = async () => {
    const e = { 'Content-Type': 'application/json' },
      t = await v();
    return (t && (e.Authorization = `Bearer ${t}`), e);
  },
  Y = async (e, t = {}) => {
    const n = async o => fetch(e, { ...t, headers: { ...o, ...t.headers } });
    let r = await b(),
      a = await n(r);
    return (
      a.status === 403 &&
        (logger.debug(
          '🔄 [AuthHelper] 403 error, retrying with fresh token...',
          'Component'
        ),
        localStorage.removeItem('token'),
        sessionStorage.removeItem('token'),
        (r = await b()),
        (a = await n(r)),
        a.status === 403
          ? logger.error(
              '❌ [AuthHelper] Still 403 after token refresh - auth may be broken',
              'Component'
            )
          : logger.debug(
              '✅ [AuthHelper] Success after token refresh!',
              'Component'
            )),
      a
    );
  },
  me = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        authenticatedFetch: Y,
        getAuthHeaders: b,
        getAuthToken: v,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  X = {
    async testLogin(e = 'manager') {
      s.debug('🔐 [DebugAuth] Testing login with ${userType}...', 'Component');
      const t = {
          manager: { username: 'manager', password: 'manager123' },
          frontdesk: { username: 'frontdesk', password: 'frontdesk123' },
          itmanager: { username: 'itmanager', password: 'itmanager123' },
        },
        n = t[e] || t.manager;
      try {
        const r = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n),
        });
        if (
          (s.debug(
            '📋 [DebugAuth] Login response status:',
            'Component',
            r.status
          ),
          r.ok)
        ) {
          const a = await r.json();
          return (
            s.debug('✅ [DebugAuth] Login successful:', 'Component', a),
            a
          );
        } else {
          const a = await r.text();
          return (
            s.error('❌ [DebugAuth] Login failed:', 'Component', a),
            e === 'manager'
              ? (s.debug(
                  '🔄 [DebugAuth] Manager failed, trying frontdesk...',
                  'Component'
                ),
                await this.testLogin('frontdesk'))
              : null
          );
        }
      } catch (r) {
        return (s.error('❌ [DebugAuth] Login error:', 'Component', r), null);
      }
    },
    async testGetAuthToken() {
      s.debug('🎫 [DebugAuth] Testing getAuthToken...', 'Component');
      try {
        const e = await v();
        return (
          s.debug('✅ [DebugAuth] Got token:', 'Component', e ? 'YES' : 'NO'),
          e
        );
      } catch (e) {
        return (
          s.error('❌ [DebugAuth] getAuthToken error:', 'Component', e),
          null
        );
      }
    },
    async testAuthHeaders() {
      s.debug('📋 [DebugAuth] Testing auth headers...', 'Component');
      try {
        const e = await b();
        return (s.debug('✅ [DebugAuth] Auth headers:', 'Component', e), e);
      } catch (e) {
        return (
          s.error('❌ [DebugAuth] Auth headers error:', 'Component', e),
          null
        );
      }
    },
    async testApiRequest() {
      s.debug(
        '🌐 [DebugAuth] Testing authenticated API request...',
        'Component'
      );
      try {
        const e = await b(),
          t = await fetch('/api/request', { method: 'GET', headers: e });
        if (
          (s.debug('📋 [DebugAuth] API request status:', 'Component', t.status),
          t.ok)
        ) {
          const n = await t.json();
          return (
            s.debug('✅ [DebugAuth] API request successful', 'Component'),
            n
          );
        } else {
          const n = await t.text();
          return (
            s.error('❌ [DebugAuth] API request failed:', 'Component', n),
            null
          );
        }
      } catch (e) {
        return (
          s.error('❌ [DebugAuth] API request error:', 'Component', e),
          null
        );
      }
    },
    async clearTokens() {
      (s.debug('🧹 [DebugAuth] Clearing all stored tokens...', 'Component'),
        localStorage.removeItem('token'),
        sessionStorage.removeItem('token'),
        localStorage.removeItem('dev_auth_token'),
        s.debug('✅ [DebugAuth] Tokens cleared', 'Component'));
    },
    async forceRefreshToken() {
      return (
        s.debug('🔄 [DebugAuth] Force refreshing token...', 'Component'),
        await this.clearTokens(),
        await this.testGetAuthToken()
      );
    },
    async runFullTest() {
      s.debug(
        '🧪 [DebugAuth] Running full authentication test...',
        'Component'
      );
      const e = {
        login: await this.testLogin(),
        token: await this.testGetAuthToken(),
        headers: await this.testAuthHeaders(),
        apiRequest: await this.testApiRequest(),
      };
      if (
        (s.debug('📊 [DebugAuth] Full test results:', 'Component', e),
        !e.apiRequest)
      ) {
        (s.debug(
          '🔄 [DebugAuth] API request failed, trying with fresh token...',
          'Component'
        ),
          await this.forceRefreshToken());
        const t = await this.testApiRequest();
        e.retryWithFreshToken = t;
      }
      return e;
    },
  };
typeof window < 'u' && (window.debugAuth = X);
export {
  de as B,
  ge as L,
  he as P,
  pe as T,
  ue as a,
  v as b,
  oe as c,
  ce as d,
  se as e,
  ie as f,
  B as g,
  me as h,
  T as i,
  ae as p,
  le as v,
};
