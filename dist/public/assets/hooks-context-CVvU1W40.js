const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/services-CkHkMpnV.js',
      'assets/css-utils-BkLtITBR.js',
      'assets/vendor-BXT5a8vO.js',
      'assets/react-core-C6DwaHZM.js',
      'assets/ui-vendor-BQCqNqg0.js',
      'assets/charts-ceMktdbA.js',
      'assets/charts-utils-DdC1WR7j.js',
      'assets/components-CjbIaAhs.js',
      'assets/siri-components-3HsV-8c_.js',
      'assets/siri-components-GqxCBkk7.css',
      'assets/react-router-B7s-G-0E.js',
      'assets/components-BlTBQwkB.css',
    ])
) => i.map(i => d[i]);
import {
  r as e,
  j as N,
  R as z,
  aP as Ve,
  aQ as Ue,
} from './react-core-C6DwaHZM.js';
import { I as ee, u as me } from './components-CjbIaAhs.js';
import { g as G, i as Be } from './services-CkHkMpnV.js';
import { j as qe } from './validation-VWaDGczM.js';
const We = (function () {
    const n = typeof document < 'u' && document.createElement('link').relList;
    return n && n.supports && n.supports('modulepreload')
      ? 'modulepreload'
      : 'preload';
  })(),
  $e = function (o) {
    return '/' + o;
  },
  he = {},
  K = function (n, t, i) {
    let c = Promise.resolve();
    if (t && t.length > 0) {
      document.getElementsByTagName('link');
      const g = document.querySelector('meta[property=csp-nonce]'),
        l = g?.nonce || g?.getAttribute('nonce');
      c = Promise.allSettled(
        t.map(f => {
          if (((f = $e(f)), f in he)) return;
          he[f] = !0;
          const y = f.endsWith('.css'),
            p = y ? '[rel="stylesheet"]' : '';
          if (document.querySelector(`link[href="${f}"]${p}`)) return;
          const r = document.createElement('link');
          if (
            ((r.rel = y ? 'stylesheet' : We),
            y || (r.as = 'script'),
            (r.crossOrigin = ''),
            (r.href = f),
            l && r.setAttribute('nonce', l),
            document.head.appendChild(r),
            y)
          )
            return new Promise((s, a) => {
              (r.addEventListener('load', s),
                r.addEventListener('error', () =>
                  a(new Error(`Unable to preload CSS for ${f}`))
                ));
            });
        })
      );
    }
    function m(g) {
      const l = new Event('vite:preloadError', { cancelable: !0 });
      if (((l.payload = g), window.dispatchEvent(l), !l.defaultPrevented))
        throw g;
    }
    return c.then(g => {
      for (const l of g || []) l.status === 'rejected' && m(l.reason);
      return n().catch(m);
    });
  },
  Ge = 1,
  ze = 1e6;
let ce = 0;
function je() {
  return ((ce = (ce + 1) % Number.MAX_SAFE_INTEGER), ce.toString());
}
const ue = new Map(),
  Ce = o => {
    if (ue.has(o)) return;
    const n = setTimeout(() => {
      (ue.delete(o), j({ type: 'REMOVE_TOAST', toastId: o }));
    }, ze);
    ue.set(o, n);
  },
  Ke = (o, n) => {
    switch (n.type) {
      case 'ADD_TOAST':
        return { ...o, toasts: [n.toast, ...o.toasts].slice(0, Ge) };
      case 'UPDATE_TOAST':
        return {
          ...o,
          toasts: o.toasts.map(t =>
            t.id === n.toast.id ? { ...t, ...n.toast } : t
          ),
        };
      case 'DISMISS_TOAST': {
        const { toastId: t } = n;
        return (
          t
            ? Ce(t)
            : o.toasts.forEach(i => {
                Ce(i.id);
              }),
          {
            ...o,
            toasts: o.toasts.map(i =>
              i.id === t || t === void 0 ? { ...i, open: !1 } : i
            ),
          }
        );
      }
      case 'REMOVE_TOAST':
        return n.toastId === void 0
          ? { ...o, toasts: [] }
          : { ...o, toasts: o.toasts.filter(t => t.id !== n.toastId) };
    }
  },
  te = [];
let ne = { toasts: [] };
function j(o) {
  ((ne = Ke(ne, o)),
    te.forEach(n => {
      n(ne);
    }));
}
function Ye({ ...o }) {
  const n = je(),
    t = c => j({ type: 'UPDATE_TOAST', toast: { ...c, id: n } }),
    i = () => j({ type: 'DISMISS_TOAST', toastId: n });
  return (
    j({
      type: 'ADD_TOAST',
      toast: {
        ...o,
        id: n,
        open: !0,
        onOpenChange: c => {
          c || i();
        },
      },
    }),
    { id: n, dismiss: i, update: t }
  );
}
function gt() {
  const [o, n] = e.useState(ne);
  return (
    e.useEffect(
      () => (
        te.push(n),
        () => {
          const t = te.indexOf(n);
          t > -1 && te.splice(t, 1);
        }
      ),
      [o]
    ),
    { ...o, toast: Ye, dismiss: t => j({ type: 'DISMISS_TOAST', toastId: t }) }
  );
}
const ht = 120,
  Ct = 350,
  St = 20,
  yt = {
    conversation: {
      icon: '🔴',
      title: 'Conversation',
      color: '#FF3B30',
      bgColor: 'rgba(255, 59, 48, 0.1)',
    },
    staff: {
      icon: '💬',
      title: 'Staff Messages',
      color: '#007AFF',
      bgColor: 'rgba(0, 122, 255, 0.1)',
    },
    notification: {
      icon: '📢',
      title: 'Hotel Notifications',
      color: '#FF9500',
      bgColor: 'rgba(255, 149, 0, 0.1)',
    },
    alert: {
      icon: '⚠️',
      title: 'Alert',
      color: '#FF3B30',
      bgColor: 'rgba(255, 59, 48, 0.1)',
    },
    order: {
      icon: '🛎️',
      title: 'Room Service',
      color: '#5856D6',
      bgColor: 'rgba(88, 86, 214, 0.1)',
    },
    summary: {
      icon: '📋',
      title: 'Call Summary',
      color: '#34C759',
      bgColor: 'rgba(52, 199, 89, 0.1)',
    },
  },
  ye = e.createContext(null);
let Je = 0;
const Et = ({ children: o }) => {
    const [n, t] = e.useState([]),
      [i, c] = e.useState(null),
      m = e.useCallback(s => {
        const a = `popup-${++Je}`,
          h = { ...s, id: a, timestamp: new Date() };
        return (
          t(d => {
            if (s.priority === 'high') {
              const b = d.filter(C => C.type !== s.type);
              return [h, ...b];
            }
            return [h, ...d];
          }),
          (s.priority === 'high' || s.isActive) && c(a),
          a
        );
      }, []),
      g = e.useCallback(s => {
        (t(a => a.filter(h => h.id !== s)), c(a => (a === s ? null : a)));
      }, []),
      l = e.useCallback(s => {
        (c(s), s && t(a => a.map(h => ({ ...h, isActive: h.id === s }))));
      }, []),
      f = e.useCallback((s, a) => {
        t(h => h.map(d => (d.id === s ? { ...d, ...a } : d)));
      }, []),
      y = e.useCallback(() => {
        (t([]), c(null));
      }, []),
      p = e.useCallback(s => n.filter(a => a.type === s), [n]),
      r = {
        popups: n,
        activePopup: i,
        addPopup: m,
        removePopup: g,
        setActivePopup: l,
        updatePopup: f,
        clearAllPopups: y,
        getPopupsByType: p,
      };
    return N.jsx(ye.Provider, { value: r, children: o });
  },
  Qe = () => {
    const o = e.useContext(ye);
    return (
      o ||
      (console.warn(
        'usePopupContext used outside PopupProvider - returning safe defaults'
      ),
      {
        popups: [],
        activePopup: null,
        addPopup: () => '',
        removePopup: () => {},
        setActivePopup: () => {},
        updatePopup: () => {},
        clearAllPopups: () => {},
        getPopupsByType: () => [],
      })
    );
  },
  Xe = {
    'hotel-manager': {
      dashboard: ['view', 'edit'],
      analytics: ['view', 'export'],
      calls: ['view', 'manage'],
      requests: ['view', 'manage'],
    },
    'front-desk': {
      dashboard: ['view'],
      calls: ['view'],
      requests: ['view', 'manage'],
    },
    'it-manager': {
      dashboard: ['view'],
      system: ['view', 'debug'],
      calls: ['view'],
    },
    admin: {
      dashboard: ['view', 'edit'],
      analytics: ['view', 'export'],
      calls: ['view', 'manage'],
      requests: ['view', 'manage'],
    },
    staff: { dashboard: ['view'], requests: ['view'] },
    manager: {
      dashboard: ['view', 'edit'],
      analytics: ['view', 'export'],
      calls: ['view', 'manage'],
      requests: ['view', 'manage'],
    },
    frontdesk: {
      dashboard: ['view'],
      calls: ['view'],
      requests: ['view', 'manage'],
    },
    itmanager: {
      dashboard: ['view'],
      system: ['view', 'debug'],
      calls: ['view'],
    },
    'super-admin': {
      dashboard: ['view', 'edit'],
      analytics: ['view', 'export'],
      calls: ['view', 'manage'],
      requests: ['view', 'manage'],
      system: ['view', 'debug', 'manage'],
    },
  },
  Ze = o => {
    const n = Xe[o] || {},
      t = [];
    for (const [i, c] of Object.entries(n))
      for (const m of c) t.push({ module: i, action: m, allowed: !0 });
    return t;
  },
  Ee = e.createContext(void 0),
  vt = () => {
    const o = e.useContext(Ee);
    return o === void 0
      ? (console.warn(
          'useAuth used outside AuthProvider - returning safe defaults'
        ),
        {
          user: null,
          tenant: null,
          isLoading: !1,
          isAuthenticated: !1,
          login: async () => {},
          logout: () => {},
          hasPermission: () => !1,
          hasRole: () => !1,
          refreshAuth: async () => {},
          hasFeature: () => !1,
          isWithinLimits: () => !0,
        })
      : o;
  },
  et = o => {
    switch (o) {
      case 'admin':
      case 'manager':
      case 'hotel-manager':
        return 'hotel-manager';
      case 'staff':
      case 'front-desk':
        return 'front-desk';
      case 'it':
      case 'tech':
      case 'it-manager':
        return 'it-manager';
      default:
        return 'front-desk';
    }
  },
  wt = ({ children: o }) => {
    console.log('[DEBUG] AuthProvider render');
    const [n, t] = e.useState(null),
      [i, c] = e.useState(null),
      [m, g] = e.useState(!0);
    e.useEffect(() => {
      console.log('[DEBUG] AuthProvider useEffect - checking token');
      const r = localStorage.getItem('token');
      if (!r) {
        (console.log(
          '[DEBUG] AuthProvider - no token found, setting loading false'
        ),
          g(!1));
        return;
      }
      try {
        console.log('[DEBUG] AuthProvider - decoding token');
        const s = qe(r);
        console.log('[DEBUG] AuthProvider - token decoded:', s);
        const a = et(s.role),
          h = {
            id: s.username,
            name: s.username,
            email: s.username,
            tenantId: s.tenantId,
            role: a,
            permissions: Ze(a),
          },
          d = {
            id: s.tenantId,
            hotelName: 'Mi Nhon Hotel',
            subdomain: 'minhonmuine',
            subscriptionPlan: 'premium',
            subscriptionStatus: 'active',
          };
        (t(h), c(d));
      } catch (s) {
        (console.log('[DEBUG] AuthProvider - token decode error:', s),
          localStorage.removeItem('token'));
      } finally {
        (console.log('[DEBUG] AuthProvider - setting loading false'), g(!1));
      }
    }, []);
    const l = e.useCallback(async (r, s) => {
        g(!0);
        try {
          const a = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: r, password: s }),
          });
          if (!a.ok) throw new Error('Sai tài khoản hoặc mật khẩu');
          const h = await a.json();
          if (!h.success || !h.token)
            throw new Error('Không nhận được token từ server');
          localStorage.setItem('token', h.token);
          const d = {
              id: h.user.id,
              name: h.user.displayName || h.user.username,
              email: h.user.email,
              tenantId: h.user.tenantId,
              role: h.user.role,
              permissions: h.user.permissions || [],
            },
            b = {
              id: h.user.tenantId,
              hotelName: 'Mi Nhon Hotel',
              subdomain: 'minhonmuine',
              subscriptionPlan: 'premium',
              subscriptionStatus: 'active',
            };
          (t(d), c(b));
        } catch (a) {
          throw (localStorage.removeItem('token'), t(null), c(null), a);
        } finally {
          g(!1);
        }
      }, []),
      f = e.useCallback(() => {
        (console.log('[DEBUG] AuthProvider logout called'),
          t(null),
          c(null),
          localStorage.removeItem('token'),
          (window.location.href = '/login'));
      }, []),
      y = e.useCallback(
        (r, s) =>
          !n || !n.permissions
            ? !1
            : n.permissions.some(
                a => a.module === r && a.action === s && a.allowed
              ),
        [n]
      ),
      p = e.useCallback(r => n?.role === r, [n]);
    return (
      console.log('[DEBUG] AuthProvider state:', {
        user: n,
        tenant: i,
        isLoading: m,
      }),
      N.jsx(Ee.Provider, {
        value: {
          user: n,
          tenant: i,
          isLoading: m,
          login: l,
          logout: f,
          isAuthenticated: !!n,
          refreshAuth: async () => {},
          hasFeature: () => !1,
          hasRole: p,
          hasPermission: y,
          isWithinLimits: () => !0,
        },
        children: o,
      })
    );
  },
  tt = () => {
    const [o, n] = e.useState(null);
    return (
      e.useEffect(() => {
        if (typeof window > 'u') return;
        const t = window.location.hostname,
          i = t === 'localhost' || t === '127.0.0.1',
          c = /^\d+\.\d+\.\d+\.\d+$/.test(t),
          m = t === 'talk2go.online' || t === 'www.talk2go.online';
        let g = null,
          l = !1,
          f;
        if (!i && !c && !m)
          if (t.includes('.talk2go.online')) {
            const p = t.split('.');
            p.length > 2 && ((g = p[0]), (l = !0));
          } else ((f = t), (l = !1));
        n({
          subdomain: g,
          isMiNhon:
            i ||
            t === 'minhotel.talk2go.online' ||
            t === 'talk2go.online' ||
            t === 'www.talk2go.online' ||
            g === 'minhon',
          isSubdomain: l,
          customDomain: f,
        });
      }, []),
      o
    );
  },
  Se = { BASE_URL: '/', DEV: !1, MODE: 'production', PROD: !0, SSR: !1 },
  X = {
    hotelName: 'Mi Nhon Hotel Mui Ne',
    logoUrl: '/assets/references/images/minhon-logo.jpg',
    primaryColor: '#2C3E50',
    headerText: 'Mi Nhon Hotel Mui Ne',
    vapiPublicKey: '',
    vapiAssistantId: '',
    branding: {
      logo: '/assets/references/images/minhon-logo.jpg',
      colors: { primary: '#2C3E50', secondary: '#34495E', accent: '#E74C3C' },
      fonts: { primary: 'Poppins', secondary: 'Inter' },
    },
    features: {
      callHistory: !0,
      multiLanguage: !0,
      analytics: !0,
      customization: !0,
    },
    services: [
      { type: 'room_service', name: 'Room Service', enabled: !0 },
      { type: 'concierge', name: 'Concierge', enabled: !0 },
      { type: 'housekeeping', name: 'Housekeeping', enabled: !0 },
      { type: 'maintenance', name: 'Maintenance', enabled: !0 },
      { type: 'restaurant', name: 'Restaurant', enabled: !0 },
    ],
    supportedLanguages: ['en', 'fr', 'zh', 'ru', 'ko', 'vi'],
  },
  ve = () => {
    console.log('[DEBUG] useHotelConfiguration hook called');
    const [o, n] = e.useState(null),
      [t, i] = e.useState(!0),
      [c, m] = e.useState(null);
    tt();
    const g = () => {
        const f = window.location.hostname;
        if (f === 'localhost' || f === '127.0.0.1')
          return { type: 'default', identifier: 'mi-nhon-hotel' };
        const p = f.split('.');
        return p.length >= 3 &&
          p[p.length - 2] === 'talk2go' &&
          p[p.length - 1] === 'online'
          ? { type: 'subdomain', identifier: p[0] }
          : { type: 'custom', identifier: f };
      },
      l = e.useCallback(async () => {
        console.log('[DEBUG] loadConfiguration called');
        try {
          (i(!0), m(null));
          const { type: f, identifier: y } = g();
          if (
            (console.log('[DEBUG] extractHotelIdentifier', {
              type: f,
              identifier: y,
            }),
            f === 'default')
          ) {
            n(X);
            return;
          }
          if (f === 'subdomain') {
            const p = `/api/hotels/by-subdomain/${y}`;
            console.log('[DEBUG] Fetching hotel config from', p);
            try {
              const r = await fetch(p);
              if ((console.log('[DEBUG] fetch response', r), !r.ok))
                throw new Error('Failed to load hotel configuration');
              const s = await r.json();
              (console.log('[DEBUG] hotelData', s),
                n({
                  hotelName: s.name,
                  logoUrl: s.branding.logo,
                  primaryColor: s.branding.primaryColor,
                  headerText: s.name,
                  vapiPublicKey: '',
                  vapiAssistantId: '',
                  branding: {
                    ...s.branding,
                    colors: {
                      primary: s.branding.primaryColor || '#2C3E50',
                      secondary: s.branding.secondaryColor || '#34495E',
                      accent: s.branding.accentColor || '#E74C3C',
                    },
                    fonts: {
                      primary: s.branding.PrimaryFont || 'Inter',
                      secondary: s.branding.SecondaryFont || 'Roboto',
                    },
                  },
                  features: s.features,
                  services: s.services,
                  supportedLanguages: s.supportedLanguages,
                }));
              return;
            } catch (r) {
              (console.error('[DEBUG] fetch hotel config error', r), n(X));
              return;
            }
          }
          n(X);
        } catch (f) {
          (m(f instanceof Error ? f.message : 'Failed to load configuration'),
            n(X));
        } finally {
          i(!1);
        }
      }, []);
    return (
      e.useEffect(() => {
        l();
      }, [l]),
      { config: o, isLoading: t, error: c, reload: l, isMiNhon: !1 }
    );
  },
  Z = {},
  we = async o => {
    if (Z[o]) return Z[o];
    try {
      const n = await fetch(`/api/vapi/config/${o}`);
      if (!n.ok) throw new Error(`Failed to fetch Vapi config: ${n.status}`);
      const t = await n.json();
      return (
        console.log(`🔧 [fetchVapiConfig] Received config for ${o}:`, {
          publicKey: t.publicKey
            ? t.publicKey.substring(0, 10) + '...'
            : 'NOT SET',
          assistantId: t.assistantId
            ? t.assistantId.substring(0, 10) + '...'
            : 'NOT SET',
          fallback: t.fallback,
        }),
        (Z[o] = t),
        t
      );
    } catch (n) {
      console.error(
        `[fetchVapiConfig] Error fetching Vapi config for ${o}:`,
        n
      );
      const t = {
        publicKey:
          o === 'en'
            ? ''
            : Se[`VITE_VAPI_PUBLIC_KEY_${o.toUpperCase()}`] || void 0 || '',
        assistantId:
          o === 'en'
            ? ''
            : Se[`VITE_VAPI_ASSISTANT_ID_${o.toUpperCase()}`] || void 0 || '',
        fallback: !0,
      };
      return (
        console.log(`[fetchVapiConfig] Using fallback config for ${o}:`, {
          publicKey: t.publicKey
            ? t.publicKey.substring(0, 10) + '...'
            : 'NOT SET',
          assistantId: t.assistantId
            ? t.assistantId.substring(0, 10) + '...'
            : 'NOT SET',
        }),
        (Z[o] = t),
        t
      );
    }
  },
  nt = async (o, n) => {
    if (n.hotelName === 'Mi Nhon Hotel Mui Ne')
      try {
        return (await we(o)).publicKey || n.vapiPublicKey;
      } catch (t) {
        return (
          console.error(`[getVapiPublicKeyByLanguage] Error for ${o}:`, t),
          n.vapiPublicKey
        );
      }
    return n.vapiPublicKey || void 0;
  },
  ot = async (o, n) => {
    if (n.hotelName === 'Mi Nhon Hotel Mui Ne')
      try {
        const t = await we(o);
        return (
          console.log(
            `🤖 [getVapiAssistantIdByLanguage] Selected assistant for ${o}:`,
            {
              assistantId: t.assistantId
                ? t.assistantId.substring(0, 10) + '...'
                : 'NOT SET',
              fallback: t.fallback,
            }
          ),
          t.assistantId || n.vapiAssistantId
        );
      } catch (t) {
        return (
          console.error(`[getVapiAssistantIdByLanguage] Error for ${o}:`, t),
          n.vapiAssistantId
        );
      }
    return n.vapiAssistantId || void 0;
  },
  st = {
    orderType: 'Room Service',
    deliveryTime: 'asap',
    roomNumber: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialInstructions: '',
    items: [
      {
        id: '1',
        name: 'Club Sandwich',
        description: 'Served with french fries and side salad',
        quantity: 1,
        price: 15,
      },
      {
        id: '2',
        name: 'Fresh Orange Juice',
        description: 'Large size',
        quantity: 1,
        price: 8,
      },
    ],
    totalAmount: 23,
  },
  be = e.createContext(void 0);
function bt({ children: o }) {
  console.log('[DEBUG] AssistantProvider render');
  const [n, t] = e.useState([]),
    [i, c] = e.useState(null),
    [m, g] = e.useState(null),
    [l, f] = e.useState(null),
    [y, p] = e.useState(0),
    [r, s] = e.useState(null),
    [a, h] = e.useState(!1),
    [d, b] = e.useState(null),
    [C, I] = e.useState([]),
    [P, k] = e.useState(null),
    [H, U] = e.useState(!1),
    [B, se] = e.useState(null),
    [V, Y] = e.useState(!1),
    W = e.useRef(!0),
    [re, J] = e.useState([]),
    ae = e.useCallback(
      u => (
        J(S => [...S, u]),
        () => {
          J(S => S.filter(v => v !== u));
        }
      ),
      []
    ),
    [x, L] = e.useState(() => {
      if (typeof window > 'u') return [];
      try {
        const u = localStorage.getItem('activeOrders');
        return u
          ? JSON.parse(u).map(v => ({
              ...v,
              requestedAt: new Date(v.requestedAt),
            }))
          : [];
      } catch (u) {
        return (
          console.error('Failed to parse activeOrders from localStorage', u),
          []
        );
      }
    }),
    [Q, Ae] = e.useState(0),
    [pe, le] = e.useState([]),
    [A, Te] = e.useState(() => {
      if (typeof window < 'u') {
        const u = localStorage.getItem('selectedLanguage');
        if (u && ['en', 'fr', 'zh', 'ru', 'ko', 'vi'].includes(u))
          return (
            console.log('🌍 [AssistantContext] Loading saved language:', u),
            u
          );
      }
      return (
        console.log('🌍 [AssistantContext] Using default language: en'),
        'en'
      );
    }),
    [F, Ie] = e.useState(null),
    [O, xe] = e.useState(null),
    [fe, Re] = e.useState(null),
    ke = z.useCallback(u => {
      (console.log('🌍 [AssistantContext] setLanguage called with:', u),
        Te(u),
        typeof window < 'u' &&
          (localStorage.setItem('selectedLanguage', u),
          console.log(
            '🌍 [AssistantContext] Language saved to localStorage:',
            u
          )));
    }, []),
    De = u => {
      (console.log('🗑️ AssistantContext: setOrder called with:', u),
        console.log('🗑️ Previous order:', l),
        f(u),
        console.log('✅ AssistantContext: setOrder completed'));
    };
  (e.useEffect(() => {
    if (!(typeof window > 'u'))
      try {
        localStorage.setItem('activeOrders', JSON.stringify(x));
      } catch {
        console.error('Failed to persist activeOrders to localStorage');
      }
  }, [x]),
    e.useEffect(() => {}, [l]),
    e.useEffect(() => {}, [x]),
    e.useEffect(() => {}, [F]),
    e.useEffect(() => {}, [A]),
    e.useEffect(() => {}, [m]),
    e.useEffect(() => {}, [n]),
    e.useEffect(() => {}, [i]),
    e.useEffect(() => {}, [d]),
    e.useEffect(() => {}, [C]),
    e.useEffect(() => {}, [pe]),
    e.useEffect(() => {}, [Q]),
    e.useEffect(() => {}, [a]),
    e.useEffect(() => {}, [y]),
    e.useEffect(() => {}, [H]),
    e.useEffect(() => {}, [B]),
    e.useEffect(() => {}, [P]),
    e.useEffect(() => {}, [O]),
    e.useEffect(() => {}, [fe]));
  const Pe = u => {
      L(S => [...S, { ...u, status: u.status || 'Đã ghi nhận' }]);
    },
    Oe = z.useCallback(
      u => {
        const S = {
          ...u,
          callId: m?.id || `call-${Date.now()}`,
          timestamp: new Date(),
          tenantId: O || 'default',
        };
        (t(T => [...T, S]),
          (async () => {
            try {
              const T = await fetch('/api/transcripts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callId: S.callId,
                  role: S.role,
                  content: S.content,
                  tenantId: S.tenantId,
                }),
              });
              if (!T.ok)
                throw new Error(`Failed to save transcript: ${T.status}`);
              const w = await T.json();
              console.log('Transcript saved to database:', w);
            } catch (T) {
              console.error('Error saving transcript to server:', T);
            }
          })());
      },
      [m?.id, O]
    );
  (e.useEffect(() => {
    if (V) {
      console.log(
        '🛑 [setupVapi] Skipping Vapi initialization - call is ending'
      );
      return;
    }
    return (
      (async () => {
        try {
          (console.log('🔧 [setupVapi] Language changed to:', A),
            console.log('🔧 [setupVapi] Hotel config available:', !!F));
          const S = F ? await nt(A, F) : void 0;
          if (
            (console.log(
              '🔑 [setupVapi] Selected publicKey for language',
              A,
              ':',
              S ? S.substring(0, 10) + '...' : 'undefined'
            ),
            !S)
          )
            throw new Error('Vapi public key is not configured');
          const v = await Be(S);
          let T = 0;
          const w = 100;
          v.on('volume-level', E => {
            try {
              const D = Date.now();
              D - T > w && (Ae(E), (T = D));
            } catch (D) {
              console.warn('Error handling volume-level:', D);
            }
          });
          const R = E => {
              try {
                if (typeof window < 'u' && window.WebSocket) {
                  const D =
                      window.location.origin.replace('http', 'ws') + '/ws',
                    M = new WebSocket(D);
                  ((M.onopen = () => {
                    (M.send(
                      JSON.stringify({
                        type: 'transcript',
                        call_id: E.callId,
                        role: E.role,
                        content: E.content,
                        timestamp: E.timestamp,
                      })
                    ),
                      M.close());
                  }),
                    (M.onerror = ie => {
                      console.warn(
                        'Failed to send transcript to WebSocket:',
                        ie
                      );
                    }));
                }
              } catch (D) {
                console.warn('Error sending transcript to WebSocket:', D);
              }
            },
            $ = async E => {
              if (
                (console.log('Raw message received:', E),
                console.log('Message type:', E.type),
                console.log('Message role:', E.role),
                console.log('Message content structure:', {
                  content: E.content,
                  text: E.text,
                  transcript: E.transcript,
                }),
                E.type === 'model-output')
              ) {
                console.log('Model output detected - Full message:', E);
                const D = E.content || E.text || E.transcript || E.output;
                if (D) {
                  console.log('Adding model output to conversation:', D);
                  const M = {
                    callId: m?.id || `call-${Date.now()}`,
                    role: 'assistant',
                    content: D,
                    timestamp: new Date(),
                    isModelOutput: !0,
                    tenantId: O || 'default',
                  };
                  (console.log('Adding new transcript for model output:', M),
                    t(ie => {
                      const ge = [...ie, M];
                      return (
                        console.log('Updated transcripts array:', ge),
                        ge
                      );
                    }),
                    R(M));
                } else
                  console.warn(
                    'Model output message received but no content found:',
                    E
                  );
              }
              if (E.type === 'transcript') {
                console.log('Adding transcript:', E);
                const D = {
                  callId: m?.id || `call-${Date.now()}`,
                  role: E.role,
                  content: E.content || E.transcript || '',
                  timestamp: new Date(),
                  tenantId: O || 'default',
                };
                (t(M => [...M, D]), R(D));
              }
            };
          (v.on('message', E => {
            try {
              $(E);
            } catch (D) {
              console.warn('Error handling Vapi message:', D);
            }
          }),
            v.on('call-end', () => {
              (console.log(
                '📞 [AssistantContext] Vapi call-end event received'
              ),
                console.log('📊 [AssistantContext] Call-end context:', {
                  transcriptsCount: n.length,
                  hasCallSummary: !!d,
                  hasServiceRequests: C?.length > 0,
                  callDuration: y,
                  isEndingCall: V,
                }));
              try {
                setTimeout(() => {
                  (console.log(
                    '🔔 [AssistantContext] Triggering call end listeners...'
                  ),
                    re.forEach(E => {
                      try {
                        E();
                      } catch (D) {
                        console.error(
                          '❌ [AssistantContext] Error in call end listener:',
                          D
                        );
                      }
                    }),
                    console.log(
                      '✅ [AssistantContext] Call end listeners triggered successfully'
                    ));
                }, 1e3);
              } catch (E) {
                console.error(
                  '❌ [AssistantContext] Error triggering call end listeners:',
                  E
                );
              }
            }));
        } catch (S) {
          console.error('Error setting up Vapi:', S);
        }
      })(),
      () => {
        W.current = !1;
        const S = G();
        S &&
          (console.log(
            '🧹 [setupVapi] Cleanup: Stopping Vapi due to dependency change'
          ),
          S.stop());
      }
    );
  }, [A, F, O, V]),
    e.useEffect(
      () => (
        (W.current = !0),
        () => {
          W.current = !1;
        }
      ),
      []
    ));
  const _e = () => {
      const u = G();
      u && (u.setMuted(!a), h(!a));
    },
    Ne = z.useCallback(async () => {
      try {
        U(!1);
        const u = `call-${Date.now()}`;
        (g({ id: u, roomNumber: '', duration: '', category: '', language: A }),
          t([]),
          le([]));
        const S = G();
        if (!S)
          throw (
            console.error('❌ [startCall] Vapi instance not initialized'),
            new Error(
              'Voice assistant not initialized. Please refresh the page and try again.'
            )
          );
        const v = F ? await ot(A, F) : void 0;
        if (
          (console.log(
            '🤖 [startCall] Selected assistantId for language',
            A,
            ':',
            v ? v.substring(0, 10) + '...' : 'undefined'
          ),
          !v)
        )
          throw (
            console.error(
              '❌ [startCall] Assistant ID not configured for language:',
              A
            ),
            new Error(
              `Voice assistant not configured for ${A}. Please contact support.`
            )
          );
        console.log('🚀 [startCall] Starting Vapi call...');
        const T = await S.start(v);
        if (!T)
          throw (
            console.error(
              '❌ [startCall] Vapi.start() returned null/undefined'
            ),
            new Error(
              'Failed to start voice call. Please check your internet connection and try again.'
            )
          );
        (console.log('✅ [startCall] Call started successfully:', T), p(0));
        const w = setInterval(() => {
          p(R => R + 1);
        }, 1e3);
        s(w);
      } catch (u) {
        console.error('❌ [startCall] Error starting call:', u);
        const S = u instanceof Error ? u.message : 'Unknown error occurred';
        (console.error('❌ [startCall] Detailed error:', {
          error: u,
          language: A,
          hasHotelConfig: !!F,
          vapiInstance: !!G(),
        }),
          typeof window < 'u' && alert(`Failed to start voice call: ${S}`),
          p(0),
          r && (clearInterval(r), s(null)));
      }
    }, [A, F, O]),
    Le = e.useCallback(() => {
      (console.log('🛑 [AssistantContext] endCall() called'),
        console.log('🔍 [AssistantContext] Current state before endCall:', {
          callDuration: y,
          transcriptsCount: n.length,
          hasCallDetails: !!m,
          hasCallTimer: !!r,
          language: A,
          tenantId: O,
          isEndingCall: V,
        }),
        console.log(
          '🚫 [AssistantContext] Step 0: Setting isEndingCall flag to prevent Vapi reinitialization...'
        ),
        Y(!0));
      try {
        console.log(
          '🔄 [AssistantContext] Step 1: Stopping VAPI IMMEDIATELY...'
        );
        try {
          const u = G();
          u
            ? (console.log(
                '📞 [AssistantContext] Step 1a: VAPI instance found, calling stop()...'
              ),
              u.stop(),
              typeof u.cleanup == 'function' &&
                (console.log(
                  '🧹 [AssistantContext] Step 1b: Calling vapi.cleanup()...'
                ),
                u.cleanup()),
              typeof u.disconnect == 'function' &&
                (console.log(
                  '🔌 [AssistantContext] Step 1c: Calling vapi.disconnect()...'
                ),
                u.disconnect()),
              console.log(
                '✅ [AssistantContext] Step 1: VAPI fully stopped and cleaned up'
              ))
            : console.log(
                '⚠️ [AssistantContext] Step 1a: No VAPI instance to stop'
              );
        } catch (u) {
          (console.error(
            '❌ [AssistantContext] Step 1 ERROR: Error stopping VAPI:',
            u
          ),
            console.log(
              '🔄 [AssistantContext] Continuing with cleanup despite VAPI error...'
            ));
        }
        console.log('🔄 [AssistantContext] Step 2: Batch state updates...');
        try {
          console.log(
            '🔄 [AssistantContext] Step 2a: Formatting call duration...'
          );
          const u = y
            ? `${Math.floor(y / 60)}:${(y % 60).toString().padStart(2, '0')}`
            : '0:00';
          (console.log('✅ [AssistantContext] Step 2a: Duration formatted:', u),
            console.log('🔄 [AssistantContext] Step 2b: Updating states...'),
            (() => {
              (console.log(
                '🔄 [AssistantContext] Step 2b-1: Stopping timer...'
              ),
                r
                  ? (clearInterval(r),
                    s(null),
                    console.log(
                      '✅ [AssistantContext] Timer stopped and cleared'
                    ))
                  : console.log('⚠️ [AssistantContext] No timer to stop'),
                console.log(
                  '🔄 [AssistantContext] Step 2b-2: Setting initial order summary...'
                ),
                c(st),
                console.log(
                  '✅ [AssistantContext] Step 2b: State cleanup completed'
                ));
            })(),
            console.log(
              '🔄 [AssistantContext] Step 3: Processing summary generation...'
            ));
          try {
            const v = n.map(T => ({ role: T.role, content: T.content }));
            if (
              (console.log('🔍 [AssistantContext] Transcript data prepared:', {
                count: v.length,
                firstFew: v.slice(0, 2),
              }),
              v.length >= 2)
            ) {
              console.log(
                '📝 [AssistantContext] Step 3a: Sufficient transcript data, processing call summary...'
              );
              const T = {
                callId: m?.id || `call-${Date.now()}`,
                content: 'Generating AI summary of your conversation...',
                timestamp: new Date(),
                tenantId: O || 'default',
              };
              (b(T),
                console.log('✅ [AssistantContext] Loading summary state set'),
                console.log(
                  '🔄 [AssistantContext] Step 3b: Sending transcript data to server for OpenAI processing...'
                ),
                fetch('/api/store-summary', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    summary: '',
                    transcripts: v,
                    timestamp: new Date().toISOString(),
                    callId: m?.id || `call-${Date.now()}`,
                    callDuration: u,
                    forceBasicSummary: !1,
                    language: A,
                    tenantId: O || 'default',
                  }),
                })
                  .then(w => {
                    if (
                      (console.log(
                        '📡 [AssistantContext] Store-summary API response received:',
                        w.status
                      ),
                      !w.ok)
                    )
                      throw new Error(
                        `Network response was not ok: ${w.status}`
                      );
                    return w.json();
                  })
                  .then(w => {
                    if (
                      (console.log(
                        '✅ [AssistantContext] Store-summary API data received:',
                        w
                      ),
                      w.success && w.summary && w.summary.content)
                    ) {
                      console.log(
                        '📋 [AssistantContext] Valid summary received, updating state...'
                      );
                      const R = w.summary.content,
                        $ = {
                          callId: m?.id || `call-${Date.now()}`,
                          content: R,
                          timestamp: new Date(
                            w.summary.timestamp || Date.now()
                          ),
                          tenantId: O || 'default',
                        };
                      (b($),
                        console.log(
                          '✅ [AssistantContext] Summary state updated successfully'
                        ),
                        w.serviceRequests &&
                        Array.isArray(w.serviceRequests) &&
                        w.serviceRequests.length > 0
                          ? (console.log(
                              '📝 [AssistantContext] Service requests received:',
                              w.serviceRequests.length
                            ),
                            I(w.serviceRequests))
                          : console.log(
                              '⚠️ [AssistantContext] No service requests in response'
                            ));
                    } else
                      console.log(
                        '⚠️ [AssistantContext] Invalid summary data received:',
                        w
                      );
                  })
                  .catch(w => {
                    console.error(
                      '❌ [AssistantContext] Error processing summary:',
                      w
                    );
                    const R = {
                      callId: m?.id || `call-${Date.now()}`,
                      content:
                        'An error occurred while generating the call summary.',
                      timestamp: new Date(),
                      tenantId: O || 'default',
                    };
                    (b(R),
                      console.log(
                        '✅ [AssistantContext] Error summary state set'
                      ));
                  }));
            } else {
              (console.log(
                '⚠️ [AssistantContext] Step 3a: Not enough transcript data for summary'
              ),
                console.log(
                  '🔍 [AssistantContext] Transcript data count:',
                  v.length
                ));
              const T = {
                callId: m?.id || `call-${Date.now()}`,
                content:
                  'Call was too short to generate a summary. Please try a more detailed conversation.',
                timestamp: new Date(),
                tenantId: O || 'default',
              };
              (b(T),
                console.log(
                  '✅ [AssistantContext] No transcript summary state set'
                ));
            }
          } catch (v) {
            console.error(
              '❌ [AssistantContext] Step 3 ERROR: Error in summary processing:',
              v
            );
          }
        } catch (u) {
          (console.error(
            '❌ [AssistantContext] Step 2 ERROR: Error during state cleanup:',
            u
          ),
            console.log(
              '🔄 [AssistantContext] Attempting force cleanup of critical states...'
            ));
          try {
            r &&
              (clearInterval(r),
              s(null),
              console.log(
                '✅ [AssistantContext] Force timer cleanup completed'
              ));
          } catch (S) {
            console.error('❌ [AssistantContext] Failed to clear timer:', S);
          }
        }
        console.log('✅ [AssistantContext] endCall() completed successfully');
      } catch (u) {
        (console.error('❌ [AssistantContext] CRITICAL ERROR in endCall():', u),
          console.error('❌ [AssistantContext] Error name:', u.name),
          console.error('❌ [AssistantContext] Error message:', u.message),
          console.error('❌ [AssistantContext] Error stack:', u.stack),
          console.log('🔄 [AssistantContext] Attempting emergency cleanup...'));
        try {
          r &&
            (clearInterval(r),
            s(null),
            console.log(
              '✅ [AssistantContext] Emergency timer cleanup completed'
            ));
        } catch (S) {
          console.error('🚨 [AssistantContext] Emergency cleanup failed:', S);
        }
        console.log(
          '🔄 [AssistantContext] endCall() error handled gracefully, continuing normal operation'
        );
      } finally {
        setTimeout(() => {
          (console.log('🔄 [AssistantContext] Resetting isEndingCall flag...'),
            Y(!1));
        }, 2e3);
      }
    }, [r, y, n, m?.id, O, A, V]),
    Fe = async u => {
      try {
        console.log('Requesting Vietnamese translation for summary...');
        const S = await fetch('/api/translate-to-vietnamese', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: u }),
        });
        if (!S.ok) throw new Error(`Network response was not ok: ${S.status}`);
        const v = await S.json();
        if (v.success && v.translatedText)
          return (k(v.translatedText), v.translatedText);
        throw new Error('Translation failed');
      } catch (S) {
        return (
          console.error('Error translating to Vietnamese:', S),
          'Không thể dịch nội dung này sang tiếng Việt. Vui lòng thử lại sau.'
        );
      }
    },
    Me = u => {
      le(S => [...S, u]);
    };
  e.useEffect(() => {
    let u = null;
    const S = async () => {
      try {
        const { authenticatedFetch: v } = await K(
            async () => {
              const { authenticatedFetch: R } = await import(
                './services-CkHkMpnV.js'
              ).then($ => $.h);
              return { authenticatedFetch: R };
            },
            __vite__mapDeps([0, 1, 2, 3, 4, 5, 6])
          ),
          T = await v('/api/request');
        if (!T.ok) {
          (T.status === 401 || T.status === 403) &&
            console.warn(
              '⚠️ [AssistantContext] Auth failed - token may be invalid or missing'
            );
          return;
        }
        const w = await T.json();
        (console.log('[AssistantContext] Fetched orders from API:', w),
          Array.isArray(w) &&
            L(
              w.map(R => ({
                reference:
                  R.specialInstructions || R.reference || R.callId || '',
                requestedAt: R.createdAt ? new Date(R.createdAt) : new Date(),
                estimatedTime: R.deliveryTime || '',
                status:
                  R.status === 'completed'
                    ? 'Hoàn thiện'
                    : R.status === 'pending'
                      ? 'Đã ghi nhận'
                      : R.status,
                ...R,
              }))
            ));
      } catch {}
    };
    return (
      S(),
      (u = setInterval(S, 5e3)),
      () => {
        u && clearInterval(u);
      }
    );
  }, []);
  const He = {
    transcripts: n,
    setTranscripts: t,
    addTranscript: Oe,
    orderSummary: i,
    setOrderSummary: c,
    callDetails: m,
    setCallDetails: g,
    order: l,
    setOrder: De,
    callDuration: y,
    setCallDuration: p,
    isMuted: a,
    toggleMute: _e,
    startCall: Ne,
    endCall: Le,
    callSummary: d,
    setCallSummary: b,
    serviceRequests: C,
    setServiceRequests: I,
    vietnameseSummary: P,
    setVietnameseSummary: k,
    translateToVietnamese: Fe,
    emailSentForCurrentSession: H,
    setEmailSentForCurrentSession: U,
    requestReceivedAt: B,
    setRequestReceivedAt: se,
    activeOrders: x,
    addActiveOrder: Pe,
    setActiveOrders: L,
    micLevel: Q,
    modelOutput: pe,
    setModelOutput: le,
    addModelOutput: Me,
    language: A,
    setLanguage: ke,
    hotelConfig: F,
    setHotelConfig: Ie,
    tenantId: O,
    setTenantId: xe,
    tenantConfig: fe,
    setTenantConfig: Re,
    addCallEndListener: ae,
  };
  return N.jsx(be.Provider, { value: He, children: o });
}
function oe() {
  const o = e.useContext(be);
  return o === void 0
    ? (console.warn(
        'useAssistant used outside AssistantProvider - returning safe defaults'
      ),
      {
        transcripts: [],
        setTranscripts: () => {},
        addTranscript: () => {},
        orderSummary: null,
        setOrderSummary: () => {},
        callDetails: null,
        setCallDetails: () => {},
        order: null,
        setOrder: () => {},
        callDuration: 0,
        setCallDuration: () => {},
        isMuted: !1,
        toggleMute: () => {},
        startCall: async () => {},
        endCall: () => {},
        callSummary: null,
        setCallSummary: () => {},
        serviceRequests: [],
        setServiceRequests: () => {},
        vietnameseSummary: null,
        setVietnameseSummary: () => {},
        translateToVietnamese: async () => '',
        emailSentForCurrentSession: !1,
        setEmailSentForCurrentSession: () => {},
        requestReceivedAt: null,
        setRequestReceivedAt: () => {},
        activeOrders: [],
        addActiveOrder: () => {},
        setActiveOrders: () => {},
        micLevel: 0,
        modelOutput: [],
        setModelOutput: () => {},
        addModelOutput: () => {},
        language: 'en',
        setLanguage: () => {},
        hotelConfig: null,
        setHotelConfig: () => {},
        tenantId: null,
        setTenantId: () => {},
        tenantConfig: null,
        setTenantConfig: () => {},
        addCallEndListener: () => () => {},
      })
    : o;
}
const rt = ({ isActive: o }) => {
    const [n, t] = e.useState(!1),
      i = e.useRef(null),
      c = e.useRef(null),
      m = e.useRef(null),
      g = e.useRef(null),
      l = (p, r) => {
        let s,
          a = 0;
        return (...h) => {
          const d = Date.now();
          d - a > r
            ? (p(...h), (a = d))
            : (clearTimeout(s),
              (s = setTimeout(
                () => {
                  (p(...h), (a = Date.now()));
                },
                r - (d - a)
              )));
        };
      };
    return (
      e.useEffect(() => {
        const r = l(() => {
          const s = window.scrollY;
          t(s > ee.SCROLL_THRESHOLD);
          const a = i.current,
            h = c.current;
          if (a && h) {
            a.getBoundingClientRect();
            const d = h.getBoundingClientRect();
            d.top < window.innerHeight &&
              d.bottom > 0 &&
              (d.top < 0 || d.bottom > window.innerHeight) &&
              d.top < ee.SCROLL_OFFSETS.NEGATIVE_TOP_THRESHOLD &&
              h.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
              });
          }
        }, ee.THROTTLE_DELAY);
        return (
          window.addEventListener('scroll', r),
          () => window.removeEventListener('scroll', r)
        );
      }, []),
      e.useEffect(() => {
        o || window.scrollTo({ top: 0, behavior: 'smooth' });
      }, [o]),
      {
        showScrollButton: n,
        scrollToTop: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        scrollToSection: p => {
          const s = { hero: i, services: c, conversation: m }[p];
          s.current &&
            s.current.scrollIntoView({
              behavior: 'smooth',
              block: p === 'hero' ? 'start' : 'center',
              inline: 'nearest',
            });
        },
        heroSectionRef: i,
        serviceGridRef: c,
        conversationRef: m,
        rightPanelRef: g,
      }
    );
  },
  at = ({ conversationRef: o }) => {
    const {
        startCall: n,
        endCall: t,
        callDuration: i,
        transcripts: c,
        setLanguage: m,
      } = oe(),
      [g, l] = e.useState(!1),
      [f, y] = e.useState(!1),
      [p, r] = e.useState(!1);
    (e.useEffect(() => {
      const d = i > 0;
      (console.log('🔄 [useConversationState] Syncing call states:', {
        callDuration: i,
        isActive: d,
        isCallStarted: g,
        manualCallStarted: p,
        transcriptsCount: c.length,
      }),
        d && !g && !p
          ? (console.log(
              '✅ [useConversationState] Active call detected - syncing isCallStarted = true'
            ),
            l(!0))
          : !d && g && !p
            ? (console.log(
                '❌ [useConversationState] Call ended - syncing isCallStarted = false'
              ),
              l(!1))
            : p
              ? console.log(
                  '⏳ [useConversationState] Manual call start in progress - keeping isCallStarted = true'
                )
              : (console.log(
                  '❌ [useConversationState] No active call and no manual start - syncing isCallStarted = false'
                ),
                l(!1)));
    }, [i, g, p]),
      e.useEffect(() => {
        const d = i > 0,
          b = d || c.length > 0 || p;
        (console.log('🔄 [useConversationState] Evaluating showConversation:', {
          isActive: d,
          transcriptsCount: c.length,
          manualCallStarted: p,
          currentShowConversation: f,
          shouldShowConversation: b,
        }),
          f !== b
            ? (console.log(
                `🔄 [useConversationState] Updating showConversation: ${f} → ${b}`
              ),
              y(b))
            : console.log(
                '✅ [useConversationState] showConversation unchanged - no re-render'
              ));
      }, [c.length, p, i]),
      e.useEffect(() => {
        f &&
          o.current &&
          setTimeout(() => {
            o.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
          }, ee.AUTO_SCROLL_DELAY);
      }, [f, o]));
    const s = e.useCallback(
        async d => {
          (console.log(
            '🎤 [useConversationState] Starting call with language:',
            d
          ),
            console.log(
              '🎤 [useConversationState] Current state before call:',
              {
                isCallStarted: g,
                manualCallStarted: p,
                callDuration: i,
                transcriptsCount: c.length,
              }
            ));
          const b = !1;
          console.log('🔍 [useConversationState] Environment check:', {
            isDevelopment: !1,
            forceVapiInDev: b,
            hasVapiCredentials: !1,
            publicKey: 'MISSING',
            assistantId: 'MISSING',
            publicKey_VI: 'MISSING',
            assistantId_VI: 'MISSING',
          });
          const C = void 0;
          console.log('🔍 [useConversationState] hasAnyVapiCredentials:', !1);
          const I = !1;
          try {
            return (
              console.log('🚀 [PRODUCTION MODE] Using real VAPI call start'),
              l(!0),
              r(!0),
              await n(),
              console.log(
                '✅ [useConversationState] Real call started successfully'
              ),
              { success: !0 }
            );
          } catch (P) {
            (console.error('❌ [useConversationState] Error starting call:', P),
              l(!1),
              r(!1));
            const k = P instanceof Error ? P.message : 'Unknown error occurred';
            return k.includes('webCallUrl')
              ? {
                  success: !1,
                  error:
                    'Voice call initialization failed. Please check your internet connection and try again.',
                }
              : k.includes('assistant')
                ? {
                    success: !1,
                    error:
                      'Voice assistant configuration issue. Please contact support.',
                  }
                : k.includes('network') || k.includes('fetch')
                  ? {
                      success: !1,
                      error:
                        'Network error. Please check your internet connection and try again.',
                    }
                  : k.includes('permissions') || k.includes('microphone')
                    ? {
                        success: !1,
                        error:
                          'Microphone access required. Please enable microphone permissions and try again.',
                      }
                    : {
                        success: !1,
                        error: `Failed to start voice call: ${k}`,
                      };
          }
        },
        [g, p, i, c, n, m]
      ),
      a = e.useCallback(() => {
        (console.log('🛑 [useConversationState] Ending call'),
          console.log(
            '🔍 [useConversationState] Current isCallStarted state:',
            g
          ),
          console.log(
            '📞 [useConversationState] Step 1: Calling endCall() to stop VAPI...'
          ));
        try {
          (t(),
            console.log(
              '✅ [useConversationState] endCall() completed - VAPI stopped'
            ));
        } catch (d) {
          console.error('❌ [useConversationState] Error in endCall():', d);
        }
        (console.log('📞 [useConversationState] Step 2: Updating UI state...'),
          l(!1),
          r(!1),
          console.log('✅ [useConversationState] UI state updated'),
          console.log(
            '🔍 [useConversationState] Step 3: Checking development mode...'
          ),
          console.log('🚀 [PRODUCTION MODE] Real call end completed'),
          console.log(
            '📝 [useConversationState] Staying in Interface1 - No interface switching'
          ));
      }, [t, g]),
      h = e.useCallback(() => {
        console.log('❌ [useConversationState] Canceling call - FULL RESET');
        try {
          (l(!1), y(!1), r(!1));
          try {
            (t(),
              console.log(
                '✅ [useConversationState] endCall() executed successfully'
              ));
          } catch (d) {
            console.error(
              '⚠️ [useConversationState] endCall() failed but continuing with cancel:',
              d
            );
          }
          (console.log(
            '✅ [useConversationState] Cancel completed - all states reset'
          ),
            console.log(
              '📊 [useConversationState] Final state: isCallStarted=false, showConversation=false'
            ));
        } catch (d) {
          (console.error('❌ [useConversationState] Error in handleCancel:', d),
            l(!1),
            y(!1),
            r(!1),
            console.log(
              '🔄 [useConversationState] Forced state reset after error'
            ));
        }
      }, [t]);
    return {
      isCallStarted: g,
      showConversation: f,
      handleCallStart: s,
      handleCallEnd: a,
      handleCancel: h,
    };
  },
  lt = ({
    conversationState: o,
    conversationPopupId: n,
    setConversationPopupId: t,
    setShowRightPanel: i,
    transcripts: c,
  }) => {
    const { removePopup: m } = me();
    return {
      handleCancel: e.useCallback(() => {
        (console.log(
          '❌ [useCancelHandler] Cancel button clicked - Returning to Interface1 initial state'
        ),
          console.log('📊 [useCancelHandler] Current state:', {
            isCallStarted: o.isCallStarted,
            conversationPopupId: n,
            transcriptsCount: c.length,
          }));
        try {
          if (n)
            try {
              (console.log(
                '🗑️ [useCancelHandler] Removing conversation popup:',
                n
              ),
                m(n),
                t(null),
                console.log(
                  '✅ [useCancelHandler] Popup removed successfully'
                ));
            } catch (l) {
              (console.error(
                '⚠️ [useCancelHandler] Failed to remove popup but continuing:',
                l
              ),
                t(null));
            }
          try {
            (o.handleCancel(),
              console.log(
                '✅ [useCancelHandler] conversationState.handleCancel() completed'
              ));
          } catch (l) {
            console.error(
              '⚠️ [useCancelHandler] conversationState.handleCancel() failed:',
              l
            );
          }
          try {
            (i(!1), console.log('✅ [useCancelHandler] Right panel closed'));
          } catch (l) {
            console.error(
              '⚠️ [useCancelHandler] Failed to close right panel:',
              l
            );
          }
          try {
            (window.scrollTo({ top: 0, behavior: 'smooth' }),
              console.log('✅ [useCancelHandler] Scrolled to top'));
          } catch (l) {
            console.error('⚠️ [useCancelHandler] Failed to scroll to top:', l);
          }
          console.log(
            '✅ [useCancelHandler] Cancel completed - Interface1 returned to initial state'
          );
        } catch (l) {
          console.error(
            '❌ [useCancelHandler] Critical error in handleCancel:',
            l
          );
          try {
            (n && (m(n), t(null)),
              i(!1),
              window.scrollTo({ top: 0, behavior: 'auto' }),
              console.log('🚨 [useCancelHandler] Emergency cleanup completed'));
          } catch (f) {
            console.error('🚨 [useCancelHandler] Emergency cleanup failed:', f);
          }
          console.log(
            '🔄 [useCancelHandler] Cancel operation completed despite errors - UI restored'
          );
        }
      }, [o, n, m, c.length, i, t]),
    };
  },
  it = ({ endCall: o, transcripts: n, callSummary: t, serviceRequests: i }) => {
    const { showSummary: c } = me(),
      m = e.useRef(null),
      g = e.useRef(!1),
      l = e.useRef(!0),
      f = e.useCallback(() => {
        (console.log(
          '✅ [useConfirmHandler] Confirm button clicked in SiriButtonContainer'
        ),
          console.log('📊 [useConfirmHandler] Current state:', {
            transcriptsCount: n.length,
            hasCallSummary: !!t,
            hasServiceRequests: i?.length > 0,
          }));
        const p = async () => {
          try {
            if (
              (console.log(
                '📋 [useConfirmHandler] Step 1: Showing immediate loading popup...'
              ),
              !l.current)
            ) {
              console.warn(
                '⚠️ [useConfirmHandler] Component unmounted, aborting'
              );
              return;
            }
            try {
              const r = e.createElement(
                'div',
                {
                  id: 'summary-loading-popup',
                  style: {
                    padding: '20px',
                    textAlign: 'center',
                    maxWidth: '400px',
                  },
                },
                [
                  e.createElement(
                    'h3',
                    {
                      key: 'title',
                      style: {
                        marginBottom: '16px',
                        color: '#333',
                        fontSize: '18px',
                        fontWeight: '600',
                      },
                    },
                    '📋 Call Summary'
                  ),
                  e.createElement(
                    'div',
                    { key: 'loading', style: { marginBottom: '16px' } },
                    [
                      e.createElement('div', {
                        key: 'spinner',
                        style: {
                          display: 'inline-block',
                          width: '24px',
                          height: '24px',
                          border: '3px solid #f3f3f3',
                          borderTop: '3px solid #3498db',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginRight: '12px',
                        },
                      }),
                      e.createElement(
                        'span',
                        {
                          key: 'text',
                          style: {
                            fontSize: '16px',
                            color: '#555',
                            fontWeight: '500',
                          },
                        },
                        'Processing call...'
                      ),
                    ]
                  ),
                  e.createElement(
                    'p',
                    {
                      key: 'message',
                      style: {
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.5',
                        marginBottom: '16px',
                      },
                    },
                    'Please wait while we finalize your conversation.'
                  ),
                  e.createElement(
                    'div',
                    {
                      key: 'time',
                      style: {
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '12px',
                      },
                    },
                    'Call ended at: ' + new Date().toLocaleTimeString()
                  ),
                ]
              );
              if (!document.getElementById('spinner-animation'))
                try {
                  const s = document.createElement('style');
                  ((s.id = 'spinner-animation'),
                    (s.textContent = `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `),
                    document.head.appendChild(s));
                } catch (s) {
                  console.warn(
                    '⚠️ [useConfirmHandler] Failed to add spinner styles:',
                    s
                  );
                }
              (console.log(
                '🚀 [useConfirmHandler] Step 1b: Calling showSummary...'
              ),
                c(r, { title: 'Processing Call...', priority: 'high' }),
                console.log(
                  '✅ [useConfirmHandler] Step 1c: Loading popup shown successfully'
                ));
            } catch (r) {
              console.error(
                '❌ [useConfirmHandler] Step 1 ERROR: Loading popup creation failed:',
                r
              );
            }
            if (
              (console.log(
                '⏳ [useConfirmHandler] Step 1.5: Brief delay before ending call...'
              ),
              await new Promise(r => setTimeout(r, 300)),
              !l.current)
            ) {
              console.warn(
                '⚠️ [useConfirmHandler] Component unmounted during delay, aborting'
              );
              return;
            }
            console.log(
              '🔄 [useConfirmHandler] Step 2: Ending call immediately...'
            );
            try {
              if (l.current) {
                (console.log(
                  '📞 [useConfirmHandler] Step 2a: Calling endCall() immediately...'
                ),
                  o(),
                  console.log(
                    '✅ [useConfirmHandler] Step 2a: Call ended successfully'
                  ));
                try {
                  const { getVapiInstance: r } = await K(
                      async () => {
                        const { getVapiInstance: a } = await import(
                          './services-CkHkMpnV.js'
                        ).then(h => h.f);
                        return { getVapiInstance: a };
                      },
                      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6])
                    ),
                    s = r();
                  s
                    ? (console.log(
                        '🔧 [useConfirmHandler] Step 2b: Force stopping Vapi instance as backup...'
                      ),
                      s.stop(),
                      console.log(
                        '✅ [useConfirmHandler] Step 2b: Vapi instance force stopped'
                      ))
                    : console.log(
                        '⚠️ [useConfirmHandler] Step 2b: No Vapi instance found to force stop'
                      );
                } catch (r) {
                  console.warn(
                    '⚠️ [useConfirmHandler] Step 2b: Backup Vapi stop failed:',
                    r
                  );
                }
              }
            } catch (r) {
              console.error('⚠️ [useConfirmHandler] endCall() failed:', r);
            }
            (console.log(
              '🔄 [useConfirmHandler] Step 3: Showing completion message...'
            ),
              setTimeout(() => {
                if (l.current)
                  try {
                    const r = e.createElement(
                      'div',
                      {
                        style: {
                          padding: '20px',
                          textAlign: 'center',
                          maxWidth: '400px',
                        },
                      },
                      [
                        e.createElement(
                          'h3',
                          {
                            key: 'title',
                            style: {
                              marginBottom: '16px',
                              color: '#333',
                              fontSize: '18px',
                              fontWeight: '600',
                            },
                          },
                          '📋 Call Complete'
                        ),
                        e.createElement(
                          'div',
                          {
                            key: 'icon',
                            style: { fontSize: '48px', marginBottom: '16px' },
                          },
                          '✅'
                        ),
                        e.createElement(
                          'p',
                          {
                            key: 'message',
                            style: {
                              marginBottom: '16px',
                              lineHeight: '1.5',
                              color: '#333',
                              fontSize: '16px',
                            },
                          },
                          'Your call has been completed successfully!'
                        ),
                        n.length > 0 &&
                          e.createElement(
                            'div',
                            {
                              key: 'transcript-info',
                              style: {
                                marginBottom: '16px',
                                padding: '12px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '6px',
                                fontSize: '14px',
                              },
                            },
                            [
                              e.createElement(
                                'div',
                                {
                                  key: 'transcript-title',
                                  style: {
                                    fontWeight: '600',
                                    marginBottom: '4px',
                                    color: '#1e40af',
                                  },
                                },
                                'Conversation Summary:'
                              ),
                              e.createElement(
                                'div',
                                {
                                  key: 'transcript-count',
                                  style: { color: '#374151' },
                                },
                                `${n.length} messages recorded`
                              ),
                            ]
                          ),
                        i?.length > 0 &&
                          e.createElement(
                            'div',
                            {
                              key: 'requests',
                              style: {
                                marginBottom: '16px',
                                padding: '12px',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '6px',
                                fontSize: '14px',
                              },
                            },
                            [
                              e.createElement(
                                'div',
                                {
                                  key: 'req-title',
                                  style: {
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                    color: '#15803d',
                                  },
                                },
                                'Service Requests:'
                              ),
                              e.createElement(
                                'ul',
                                {
                                  key: 'req-list',
                                  style: {
                                    listStyle: 'disc',
                                    marginLeft: '20px',
                                    color: '#374151',
                                  },
                                },
                                i.slice(0, 3).map((s, a) =>
                                  e.createElement(
                                    'li',
                                    {
                                      key: a,
                                      style: { marginBottom: '4px' },
                                    },
                                    `${s.serviceType || 'Request'}: ${(s.requestText || s.description || 'Service request').substring(0, 50)}...`
                                  )
                                )
                              ),
                            ]
                          ),
                        e.createElement(
                          'p',
                          {
                            key: 'note',
                            style: {
                              fontSize: '14px',
                              color: '#666',
                              marginBottom: '16px',
                            },
                          },
                          'Thank you for using our voice assistant service.'
                        ),
                        e.createElement(
                          'div',
                          {
                            key: 'contact',
                            style: {
                              fontSize: '12px',
                              color: '#999',
                              borderTop: '1px solid #eee',
                              paddingTop: '12px',
                              marginTop: '16px',
                            },
                          },
                          'For immediate assistance, please contact the front desk.'
                        ),
                      ]
                    );
                    (c(r, { title: 'Call Complete', priority: 'high' }),
                      console.log(
                        '✅ [useConfirmHandler] Completion message shown successfully'
                      ));
                  } catch (r) {
                    (console.error(
                      '❌ [useConfirmHandler] Error showing completion message:',
                      r
                    ),
                      l.current &&
                        setTimeout(
                          () =>
                            alert(
                              'Call completed successfully! Thank you for using our service.'
                            ),
                          100
                        ));
                  }
              }, 1e3),
              console.log(
                '✅ [useConfirmHandler] Confirm flow completed successfully'
              ));
          } catch (r) {
            if (
              (console.error(
                '❌ [useConfirmHandler] CRITICAL ERROR in handleConfirm:',
                r
              ),
              l.current)
            )
              try {
                const s = e.createElement(
                  'div',
                  {
                    style: {
                      padding: '20px',
                      textAlign: 'center',
                      maxWidth: '400px',
                    },
                  },
                  [
                    e.createElement(
                      'h3',
                      {
                        key: 'title',
                        style: {
                          marginBottom: '16px',
                          color: '#dc2626',
                          fontSize: '18px',
                          fontWeight: '600',
                        },
                      },
                      '⚠️ Call Processing Issue'
                    ),
                    e.createElement(
                      'p',
                      {
                        key: 'message',
                        style: {
                          marginBottom: '16px',
                          color: '#374151',
                          fontSize: '16px',
                        },
                      },
                      'Your call was completed, but there was an issue processing the summary.'
                    ),
                    e.createElement(
                      'p',
                      {
                        key: 'instruction',
                        style: {
                          fontSize: '14px',
                          color: '#666',
                          marginBottom: '16px',
                        },
                      },
                      'Please contact the front desk if you need assistance with your requests.'
                    ),
                    e.createElement(
                      'div',
                      {
                        key: 'timestamp',
                        style: {
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '12px',
                        },
                      },
                      'Call ended at: ' + new Date().toLocaleTimeString()
                    ),
                  ]
                );
                c(s, {
                  title: 'Call Complete (with issue)',
                  priority: 'medium',
                });
              } catch (s) {
                (console.error(
                  '❌ [useConfirmHandler] Fallback popup also failed:',
                  s
                ),
                  setTimeout(() => {
                    l.current &&
                      alert(
                        'Call completed! There was a technical issue with the summary. Please contact front desk for assistance.'
                      );
                  }, 500));
              }
          }
        };
        try {
          p();
        } catch (r) {
          (console.error('❌ [useConfirmHandler] OUTER ERROR BOUNDARY:', r),
            setTimeout(() => {
              l.current &&
                alert(
                  'Call completed! Technical issue occurred. Please contact front desk.'
                );
            }, 100));
        }
      }, [o, n, t, i, c]),
      y = e.useCallback(() => {
        ((l.current = !1),
          (g.current = !1),
          m.current && (clearInterval(m.current), (m.current = null)));
      }, []);
    return (
      z.useEffect(() => ((l.current = !0), y), [y]),
      { handleConfirm: f }
    );
  },
  At = ({ isActive: o }) => {
    const {
        micLevel: n,
        transcripts: t,
        callSummary: i,
        serviceRequests: c,
        endCall: m,
        addCallEndListener: g,
      } = oe(),
      { config: l, isLoading: f, error: y } = ve(),
      { showNotification: p, showSummary: r } = me(),
      [s, a] = e.useState(null),
      h = rt({ isActive: o }),
      d = at({ conversationRef: h.conversationRef }),
      [b, C] = e.useState(!1),
      I = e.useMemo(
        () => ({
          conversationState: d,
          conversationPopupId: s,
          setConversationPopupId: a,
          setShowRightPanel: C,
          transcripts: t,
        }),
        [d, s, t]
      ),
      P = e.useMemo(
        () => ({
          endCall: m,
          transcripts: t,
          callSummary: i,
          serviceRequests: c,
        }),
        [m, t, i, c]
      ),
      { handleCancel: k } = lt(I),
      { handleConfirm: H } = it(P),
      { popups: U } = Qe(),
      [B, se] = e.useState(!1);
    e.useEffect(() => {
      const L = !!U.find(Q => Q.type === 'summary');
      B !== L && se(L);
    }, [U, B]);
    const V = e.useCallback(() => {
      try {
        r(void 0, { title: 'Call Summary', priority: 'high' });
      } catch (x) {
        (console.error(
          '❌ [useInterface1] Error auto-showing summary popup:',
          x
        ),
          setTimeout(() => {
            alert('Call completed! Please check your conversation summary.');
          }, 500));
      }
    }, [r]);
    e.useEffect(() => {
      const x = g(V);
      return () => {
        x();
      };
    }, [g, V]);
    const Y = e.useCallback(() => {
        C(x => !x);
      }, []),
      W = e.useCallback(() => {
        C(!1);
      }, []),
      re = e.useCallback(() => {}, []),
      J = e.useCallback(() => {
        K(
          () => import('./components-CjbIaAhs.js').then(x => x.aa),
          __vite__mapDeps([7, 3, 2, 1, 5, 6, 4, 0, 8, 9, 10, 11])
        )
          .then(x => {
            const { NotificationDemoContent: L } = x;
            p(e.createElement(L), {
              title: 'Pool Maintenance',
              priority: 'medium',
              badge: 1,
            });
          })
          .catch(() => {
            p(
              e.createElement('div', { style: { padding: '16px' } }, [
                e.createElement('h4', { key: 'title' }, 'Hotel Notification'),
                e.createElement(
                  'p',
                  { key: 'content' },
                  'Pool maintenance from 2-4 PM today.'
                ),
              ]),
              { title: 'Pool Maintenance', priority: 'medium', badge: 1 }
            );
          });
      }, [p]),
      ae = e.useCallback(() => {
        K(
          () => import('./components-CjbIaAhs.js').then(x => x.aa),
          __vite__mapDeps([7, 3, 2, 1, 5, 6, 4, 0, 8, 9, 10, 11])
        )
          .then(x => {
            const { SummaryPopupContent: L } = x;
            r(e.createElement(L), { title: 'Call Summary', priority: 'high' });
          })
          .catch(() => {
            const x = new Date().toLocaleTimeString();
            r(
              e.createElement(
                'div',
                { style: { padding: '16px', fontSize: '12px' } },
                [
                  e.createElement(
                    'div',
                    {
                      key: 'title',
                      style: { fontWeight: 'bold', marginBottom: '8px' },
                    },
                    '📋 Call Summary'
                  ),
                  e.createElement('div', { key: 'room' }, 'Room: 101'),
                  e.createElement('div', { key: 'items' }, 'Items: 3 requests'),
                  e.createElement(
                    'div',
                    {
                      key: 'time',
                      style: {
                        fontSize: '10px',
                        color: '#666',
                        marginTop: '8px',
                      },
                    },
                    `Generated at ${x}`
                  ),
                ]
              ),
              { title: 'Call Summary', priority: 'high' }
            );
          });
      }, [r]);
    return {
      isLoading: f || !l,
      error: y,
      hotelConfig: l,
      micLevel: n,
      ...h,
      isCallStarted: d.isCallStarted,
      showConversation: d.showConversation,
      handleCallStart: d.handleCallStart,
      handleCallEnd: d.handleCallEnd,
      handleCancel: k,
      handleConfirm: H,
      showingSummary: B,
      showRightPanel: b,
      handleRightPanelToggle: Y,
      handleRightPanelClose: W,
      handleShowConversationPopup: re,
      handleShowNotificationDemo: J,
      handleShowSummaryDemo: ae,
    };
  },
  _ = {
    ORDER_TYPE_DEFAULT: 'Room Service',
    DELIVERY_TIME_DEFAULT: 'asap',
    SERVICE_NAME_DEFAULT: 'General Service',
    ROOM_NUMBER_FALLBACK: 'unknown',
    ORDER_PREFIX: 'ORD',
    ORDER_MIN: 1e4,
    ORDER_RANGE: 9e4,
    STATUS_PENDING: 'pending',
  },
  q = {
    NO_ORDER_DATA: 'No order information available to send!',
    REQUEST_FAILED: 'Failed to send request to Front Desk!',
    NETWORK_ERROR: 'Network error occurred while sending request',
    SERVER_ERROR: 'Server error occurred while processing request',
  },
  ct = { REQUEST_SENT: '✅ Request sent to Front Desk successfully!' },
  Tt = ({ onSuccess: o, onError: n } = {}) => {
    const {
        callSummary: t,
        serviceRequests: i,
        orderSummary: c,
        setOrder: m,
      } = oe(),
      [g, l] = e.useState(!1),
      f = e.useMemo(
        () => ({
          id: '1',
          name: _.SERVICE_NAME_DEFAULT,
          description: 'Service request from voice call',
          quantity: 1,
          price: 0,
        }),
        []
      ),
      y = e.useMemo(
        () =>
          c ||
          (!t && (!i || i.length === 0)
            ? null
            : {
                orderType: _.ORDER_TYPE_DEFAULT,
                deliveryTime: _.DELIVERY_TIME_DEFAULT,
                roomNumber: '',
                guestName: '',
                guestEmail: '',
                guestPhone: '',
                specialInstructions: '',
                items: i?.map((C, I) => ({
                  id: (I + 1).toString(),
                  name: C.serviceType || _.SERVICE_NAME_DEFAULT,
                  description: C.requestText || 'No details provided',
                  quantity: 1,
                  price: 0,
                })) || [f],
                totalAmount: 0,
              }),
        [c, t, i, f]
      ),
      p = e.useCallback((C, I) => {
        if (C?.roomNumber && C.roomNumber !== _.ROOM_NUMBER_FALLBACK)
          return C.roomNumber;
        if (I) {
          const P = /Room Number:?\s*(\w+)/i,
            k = I.match(P);
          if (k && k[1]) return k[1];
        }
        return _.ROOM_NUMBER_FALLBACK;
      }, []),
      r = e.useCallback(() => {
        const C = Math.floor(_.ORDER_MIN + Math.random() * _.ORDER_RANGE);
        return `${_.ORDER_PREFIX}-${C}`;
      }, []),
      s = e.useCallback(
        C => {
          const I = r(),
            P = C.items && C.items.length > 0 ? C.items : [f];
          return {
            callId: I,
            roomNumber: p(C, t?.content),
            orderType: C.orderType || _.ORDER_TYPE_DEFAULT,
            deliveryTime: C.deliveryTime || _.DELIVERY_TIME_DEFAULT,
            specialInstructions: I,
            items: P,
            totalAmount: C.totalAmount || 0,
            status: _.STATUS_PENDING,
            createdAt: new Date().toISOString(),
          };
        },
        [p, r, f, t?.content]
      ),
      a = e.useCallback(async C => {
        console.log(
          '📤 [useSendToFrontDeskHandler] Submitting request to /api/request:',
          C
        );
        const { authenticatedFetch: I } = await K(
          async () => {
            const { authenticatedFetch: H } = await import(
              './services-CkHkMpnV.js'
            ).then(U => U.h);
            return { authenticatedFetch: H };
          },
          __vite__mapDeps([0, 1, 2, 3, 4, 5, 6])
        );
        console.log(
          '🔐 [useSendToFrontDeskHandler] Using authenticated fetch with auto-retry'
        );
        const P = await I('/api/request', {
          method: 'POST',
          body: JSON.stringify(C),
        });
        if (!P.ok) {
          const H = P.status;
          throw H >= 500
            ? new Error(q.SERVER_ERROR)
            : H >= 400
              ? new Error(q.REQUEST_FAILED)
              : new Error(q.NETWORK_ERROR);
        }
        const k = await P.json();
        if (!k.success) throw new Error(k.error || q.REQUEST_FAILED);
        return k.data;
      }, []),
      h = e.useCallback(
        (C, I) => {
          (console.log(
            '✅ [useSendToFrontDeskHandler] Request sent to Front Desk successfully'
          ),
            m({
              reference: C.reference || C.orderId,
              estimatedTime:
                C.estimatedTime || I.deliveryTime || _.DELIVERY_TIME_DEFAULT,
              summary: I,
            }),
            o ? o() : alert(ct.REQUEST_SENT));
        },
        [m, o]
      ),
      d = e.useCallback(
        C => {
          console.error(
            '❌ [useSendToFrontDeskHandler] Failed to send request:',
            C
          );
          const I = C.message || q.REQUEST_FAILED;
          n ? n(I) : alert(`❌ ${I}`);
        },
        [n]
      );
    return {
      handleSendToFrontDesk: e.useCallback(async () => {
        if (
          (console.log(
            '🏨 [useSendToFrontDeskHandler] Send to FrontDesk initiated'
          ),
          !y)
        ) {
          console.warn(
            '⚠️ [useSendToFrontDeskHandler] No order summary available'
          );
          const C = q.NO_ORDER_DATA;
          n ? n(C) : alert(C);
          return;
        }
        l(!0);
        try {
          const C = s(y),
            I = await a(C);
          h(I, y);
        } catch (C) {
          d(C);
        } finally {
          l(!1);
        }
      }, [y, s, a, h, d, n]),
      isSubmitting: g,
    };
  },
  It = () => {
    const [o, n] = e.useState(() =>
      typeof window > 'u' ? !1 : window.innerWidth >= 768
    );
    return (
      e.useEffect(() => {
        const t = () => {
          const i = window.innerWidth >= 768;
          i !== o &&
            (n(i),
            console.log(
              '🔄 [useSiriResponsiveSize] Platform changed:',
              i ? 'Desktop' : 'Mobile'
            ));
        };
        return (
          window.addEventListener('resize', t),
          () => window.removeEventListener('resize', t)
        );
      }, [o]),
      o
        ? {
            width: '320px',
            height: '320px',
            minWidth: '320px',
            minHeight: '320px',
            maxWidth: '320px',
            maxHeight: '320px',
          }
        : {
            width: 'min(300px, 80vw)',
            height: 'min(300px, 80vw)',
            minWidth: '240px',
            minHeight: '240px',
            maxWidth: '300px',
            maxHeight: '300px',
          }
    );
  },
  de = 768;
function xt() {
  const [o, n] = e.useState(void 0);
  return (
    e.useEffect(() => {
      const t = window.matchMedia(`(max-width: ${de - 1}px)`),
        i = () => {
          n(window.innerWidth < de);
        };
      return (
        t.addEventListener('change', i),
        n(window.innerWidth < de),
        () => t.removeEventListener('change', i)
      );
    }, []),
    !!o
  );
}
const ut = e.createContext(void 0);
class Rt extends z.Component {
  constructor(n) {
    (super(n), (this.state = { hasError: !1, error: null }));
  }
  static getDerivedStateFromError(n) {
    return { hasError: !0, error: n };
  }
  componentDidCatch(n, t) {
    console.error('Hotel configuration error:', n, t);
  }
  render() {
    return this.state.hasError
      ? this.props.fallback ||
          N.jsx('div', {
            className:
              'min-h-screen flex items-center justify-center bg-gray-50',
            children: N.jsxs('div', {
              className:
                'max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center',
              children: [
                N.jsx(Ve, { className: 'w-16 h-16 text-red-500 mx-auto mb-4' }),
                N.jsx('h2', {
                  className: 'text-xl font-bold text-gray-900 mb-2',
                  children: 'Configuration Error',
                }),
                N.jsx('p', {
                  className: 'text-gray-600 mb-4',
                  children:
                    'Failed to load hotel configuration. Please try refreshing the page.',
                }),
                N.jsxs('button', {
                  onClick: () => window.location.reload(),
                  className:
                    'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md',
                  children: [
                    N.jsx(Ue, { className: 'w-4 h-4 inline mr-2' }),
                    'Reload Page',
                  ],
                }),
              ],
            }),
          })
      : this.props.children;
  }
}
const kt = ({ children: o }) => {
  console.log('[DEBUG] HotelProvider rendered');
  const n = ve(),
    { config: t, isLoading: i, error: c } = n,
    m = b => '',
    g = b => '',
    l = b => t?.features?.[b] ?? !1,
    f = () => t?.supportedLanguages || [],
    y = b => t?.services || [],
    p = () => ({
      primary: t?.branding?.colors.primary || '#2E7D32',
      secondary: t?.branding?.colors.secondary || '#FFC107',
      accent: t?.branding?.colors.accent || '#FF6B6B',
    }),
    r = () => ({
      primary: t?.branding?.fonts.primary || 'Inter',
      secondary: t?.branding?.fonts.secondary || 'Roboto',
    }),
    s = () => null,
    a = () => null,
    h = () => 'UTC',
    d = () => 'USD';
  return N.jsx(ut.Provider, {
    value: {
      config: t,
      loading: i,
      error: c,
      reload: async () => {},
      getVapiPublicKey: m,
      getVapiAssistantId: g,
      hasFeature: l,
      getSupportedLanguages: f,
      getAvailableServices: y,
      getThemeColors: p,
      getFontFamilies: r,
      getContactInfo: s,
      getLocation: a,
      getTimezone: h,
      getCurrency: d,
    },
    children: o,
  });
};
function Dt() {
  const [o, n] = e.useState(null),
    [t, i] = e.useState(!1),
    c = oe(),
    m = e.useRef(0),
    g = e.useCallback(() => {
      (console.log('useWebSocket env VITE_API_HOST:', void 0),
        o !== null && o.close());
      const p = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
      console.log('Attempting WebSocket connection to', p);
      const r = new WebSocket(p);
      return (
        (r.onopen = () => {
          (console.log('WebSocket connection established'),
            i(!0),
            (m.current = 0),
            c.callDetails &&
              r.send(
                JSON.stringify({ type: 'init', callId: c.callDetails.id })
              ));
        }),
        (r.onmessage = s => {
          try {
            const a = JSON.parse(s.data);
            (console.log('[useWebSocket] Message received:', a),
              a.type === 'transcript' &&
                (console.log('[useWebSocket] Transcript message:', a),
                c.addTranscript({
                  callId: a.callId,
                  role: a.role,
                  content: a.content,
                  tenantId: 'default',
                })),
              a.type === 'connected' &&
                console.log('[useWebSocket] Connected to server:', a.message),
              a.type === 'order_status_update' &&
                (a.orderId || a.reference) &&
                a.status &&
                (console.log('[useWebSocket] Order status update:', a),
                c.setActiveOrders(h =>
                  h.map(d =>
                    (a.reference && d.reference === a.reference) ||
                    (a.orderId && d.reference === a.orderId)
                      ? { ...d, status: a.status }
                      : d
                  )
                )));
          } catch (a) {
            console.error('Error parsing WebSocket message:', a);
          }
        }),
        (r.onclose = s => {
          if (
            (console.log('WebSocket connection closed', s),
            i(!1),
            m.current < 5)
          ) {
            const a = Math.pow(2, m.current) * 1e3;
            (console.log(
              `Reconnecting WebSocket in ${a}ms (attempt ${m.current + 1})`
            ),
              setTimeout(g, a),
              m.current++);
          } else console.warn('Max WebSocket reconnection attempts reached');
        }),
        (r.onerror = s => {
          (console.error('WebSocket encountered error', s),
            r.readyState !== WebSocket.CLOSED && r.close());
        }),
        n(r),
        () => {
          r.close();
        }
      );
    }, [c.callDetails, c.addTranscript, c.activeOrders, c.setActiveOrders]),
    l = e.useCallback(
      y => {
        o && t
          ? o.send(JSON.stringify(y))
          : console.error('Cannot send message, WebSocket not connected');
      },
      [o, t]
    ),
    f = e.useCallback(() => {
      t || g();
    }, [t, g]);
  return (
    e.useEffect(
      () => (
        g(),
        () => {
          o && o.close();
        }
      ),
      []
    ),
    e.useEffect(() => {
      o &&
        t &&
        c.callDetails?.id &&
        (console.log(
          'Sending init message with callId after availability',
          c.callDetails.id
        ),
        o.send(JSON.stringify({ type: 'init', callId: c.callDetails.id })));
    }, [c.callDetails?.id, o, t]),
    { connected: t, sendMessage: l, reconnect: f }
  );
}
export {
  wt as A,
  kt as H,
  yt as P,
  St as S,
  K as _,
  oe as a,
  Qe as b,
  ht as c,
  Ct as d,
  Tt as e,
  At as f,
  vt as g,
  xt as h,
  Et as i,
  It as j,
  bt as k,
  Dt as l,
  tt as m,
  gt as u,
};
