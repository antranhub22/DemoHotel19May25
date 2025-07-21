const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/services-BvUATxiy.js',
      'assets/css-utils-BkLtITBR.js',
      'assets/vendor-BXT5a8vO.js',
      'assets/react-core-C6DwaHZM.js',
      'assets/ui-vendor-BQCqNqg0.js',
      'assets/charts-ceMktdbA.js',
      'assets/charts-utils-DdC1WR7j.js',
      'assets/components-LYkGJCyk.js',
      'assets/siri-components-BXrmXl8X.js',
      'assets/siri-components-GqxCBkk7.css',
      'assets/react-router-B7s-G-0E.js',
      'assets/components-BlTBQwkB.css',
    ])
) => i.map(i => d[i]);
import {
  r as t,
  j as L,
  R as j,
  aP as Ue,
  aQ as Be,
} from './react-core-C6DwaHZM.js';
import { l as e, I as te, u as pe } from './components-LYkGJCyk.js';
import { g as z, i as $e } from './services-BvUATxiy.js';
import { j as qe } from './validation-VWaDGczM.js';
const We = (function () {
    const o = typeof document < 'u' && document.createElement('link').relList;
    return o && o.supports && o.supports('modulepreload')
      ? 'modulepreload'
      : 'preload';
  })(),
  Ge = function (s) {
    return '/' + s;
  },
  he = {},
  Y = function (o, n, c) {
    let u = Promise.resolve();
    if (n && n.length > 0) {
      document.getElementsByTagName('link');
      const C = document.querySelector('meta[property=csp-nonce]'),
        l = C?.nonce || C?.getAttribute('nonce');
      u = Promise.allSettled(
        n.map(f => {
          if (((f = Ge(f)), f in he)) return;
          he[f] = !0;
          const b = f.endsWith('.css'),
            p = b ? '[rel="stylesheet"]' : '';
          if (document.querySelector(`link[href="${f}"]${p}`)) return;
          const a = document.createElement('link');
          if (
            ((a.rel = b ? 'stylesheet' : We),
            b || (a.as = 'script'),
            (a.crossOrigin = ''),
            (a.href = f),
            l && a.setAttribute('nonce', l),
            document.head.appendChild(a),
            b)
          )
            return new Promise((r, i) => {
              (a.addEventListener('load', r),
                a.addEventListener('error', () =>
                  i(new Error(`Unable to preload CSS for ${f}`))
                ));
            });
        })
      );
    }
    function g(C) {
      const l = new Event('vite:preloadError', { cancelable: !0 });
      if (((l.payload = C), window.dispatchEvent(l), !l.defaultPrevented))
        throw C;
    }
    return u.then(C => {
      for (const l of C || []) l.status === 'rejected' && g(l.reason);
      return o().catch(g);
    });
  },
  ze = 1,
  je = 1e6;
let ue = 0;
function Ke() {
  return ((ue = (ue + 1) % Number.MAX_SAFE_INTEGER), ue.toString());
}
const de = new Map(),
  ye = s => {
    if (de.has(s)) return;
    const o = setTimeout(() => {
      (de.delete(s), K({ type: 'REMOVE_TOAST', toastId: s }));
    }, je);
    de.set(s, o);
  },
  Ye = (s, o) => {
    switch (o.type) {
      case 'ADD_TOAST':
        return { ...s, toasts: [o.toast, ...s.toasts].slice(0, ze) };
      case 'UPDATE_TOAST':
        return {
          ...s,
          toasts: s.toasts.map(n =>
            n.id === o.toast.id ? { ...n, ...o.toast } : n
          ),
        };
      case 'DISMISS_TOAST': {
        const { toastId: n } = o;
        return (
          n
            ? ye(n)
            : s.toasts.forEach(c => {
                ye(c.id);
              }),
          {
            ...s,
            toasts: s.toasts.map(c =>
              c.id === n || n === void 0 ? { ...c, open: !1 } : c
            ),
          }
        );
      }
      case 'REMOVE_TOAST':
        return o.toastId === void 0
          ? { ...s, toasts: [] }
          : { ...s, toasts: s.toasts.filter(n => n.id !== o.toastId) };
    }
  },
  ne = [];
let oe = { toasts: [] };
function K(s) {
  ((oe = Ye(oe, s)),
    ne.forEach(o => {
      o(oe);
    }));
}
function Je({ ...s }) {
  const o = Ke(),
    n = u => K({ type: 'UPDATE_TOAST', toast: { ...u, id: o } }),
    c = () => K({ type: 'DISMISS_TOAST', toastId: o });
  return (
    K({
      type: 'ADD_TOAST',
      toast: {
        ...s,
        id: o,
        open: !0,
        onOpenChange: u => {
          u || c();
        },
      },
    }),
    { id: o, dismiss: c, update: n }
  );
}
function Ct() {
  const [s, o] = t.useState(oe);
  return (
    t.useEffect(
      () => (
        ne.push(o),
        () => {
          const n = ne.indexOf(o);
          n > -1 && ne.splice(n, 1);
        }
      ),
      [s]
    ),
    { ...s, toast: Je, dismiss: n => K({ type: 'DISMISS_TOAST', toastId: n }) }
  );
}
const ht = 120,
  yt = 350,
  St = 20,
  bt = {
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
  be = t.createContext(null);
let Qe = 0;
const Et = ({ children: s }) => {
    const [o, n] = t.useState([]),
      [c, u] = t.useState(null),
      g = t.useCallback(r => {
        const i = `popup-${++Qe}`,
          h = { ...r, id: i, timestamp: new Date() };
        return (
          n(m => {
            if (r.priority === 'high') {
              const A = m.filter(y => y.type !== r.type);
              return [h, ...A];
            }
            return [h, ...m];
          }),
          (r.priority === 'high' || r.isActive) && u(i),
          i
        );
      }, []),
      C = t.useCallback(r => {
        (n(i => i.filter(h => h.id !== r)), u(i => (i === r ? null : i)));
      }, []),
      l = t.useCallback(r => {
        (u(r), r && n(i => i.map(h => ({ ...h, isActive: h.id === r }))));
      }, []),
      f = t.useCallback((r, i) => {
        n(h => h.map(m => (m.id === r ? { ...m, ...i } : m)));
      }, []),
      b = t.useCallback(() => {
        (n([]), u(null));
      }, []),
      p = t.useCallback(r => o.filter(i => i.type === r), [o]),
      a = {
        popups: o,
        activePopup: c,
        addPopup: g,
        removePopup: C,
        setActivePopup: l,
        updatePopup: f,
        clearAllPopups: b,
        getPopupsByType: p,
      };
    return L.jsx(be.Provider, { value: a, children: s });
  },
  Xe = () => {
    const s = t.useContext(be);
    return (
      s ||
      (e.warn(
        'usePopupContext used outside PopupProvider - returning safe defaults',
        'Component'
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
  Ze = {
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
  et = s => {
    const o = Ze[s] || {},
      n = [];
    for (const [c, u] of Object.entries(o))
      for (const g of u) n.push({ module: c, action: g, allowed: !0 });
    return n;
  },
  Ee = t.createContext(void 0),
  vt = () => {
    const s = t.useContext(Ee);
    return s === void 0
      ? (e.warn(
          'useAuth used outside AuthProvider - returning safe defaults',
          'Component'
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
      : s;
  },
  tt = s => {
    switch (s) {
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
  wt = ({ children: s }) => {
    e.debug('[DEBUG] AuthProvider render', 'Component');
    const [o, n] = t.useState(null),
      [c, u] = t.useState(null),
      [g, C] = t.useState(!0);
    t.useEffect(() => {
      e.debug('[DEBUG] AuthProvider useEffect - checking token', 'Component');
      const a = localStorage.getItem('token');
      if (!a) {
        (e.debug(
          '[DEBUG] AuthProvider - no token found, setting loading false',
          'Component'
        ),
          C(!1));
        return;
      }
      try {
        e.debug('[DEBUG] AuthProvider - decoding token', 'Component');
        const r = qe(a);
        e.debug('[DEBUG] AuthProvider - token decoded:', 'Component', r);
        const i = tt(r.role),
          h = {
            id: r.username,
            name: r.username,
            email: r.username,
            tenantId: r.tenantId,
            role: i,
            permissions: et(i),
          },
          m = {
            id: r.tenantId,
            hotelName: 'Mi Nhon Hotel',
            subdomain: 'minhonmuine',
            subscriptionPlan: 'premium',
            subscriptionStatus: 'active',
          };
        (n(h), u(m));
      } catch (r) {
        (e.debug('[DEBUG] AuthProvider - token decode error:', 'Component', r),
          localStorage.removeItem('token'));
      } finally {
        (e.debug('[DEBUG] AuthProvider - setting loading false', 'Component'),
          C(!1));
      }
    }, []);
    const l = t.useCallback(async (a, r) => {
        C(!0);
        try {
          const i = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: a, password: r }),
          });
          if (!i.ok) throw new Error('Sai tài khoản hoặc mật khẩu');
          const h = await i.json();
          if (!h.success || !h.token)
            throw new Error('Không nhận được token từ server');
          localStorage.setItem('token', h.token);
          const m = {
              id: h.user.id,
              name: h.user.displayName || h.user.username,
              email: h.user.email,
              tenantId: h.user.tenantId,
              role: h.user.role,
              permissions: h.user.permissions || [],
            },
            A = {
              id: h.user.tenantId,
              hotelName: 'Mi Nhon Hotel',
              subdomain: 'minhonmuine',
              subscriptionPlan: 'premium',
              subscriptionStatus: 'active',
            };
          (n(m), u(A));
        } catch (i) {
          throw (localStorage.removeItem('token'), n(null), u(null), i);
        } finally {
          C(!1);
        }
      }, []),
      f = t.useCallback(() => {
        (e.debug('[DEBUG] AuthProvider logout called', 'Component'),
          n(null),
          u(null),
          localStorage.removeItem('token'),
          (window.location.href = '/login'));
      }, []),
      b = t.useCallback(
        (a, r) =>
          !o || !o.permissions
            ? !1
            : o.permissions.some(
                i => i.module === a && i.action === r && i.allowed
              ),
        [o]
      ),
      p = t.useCallback(a => o?.role === a, [o]);
    return (
      e.debug('[DEBUG] AuthProvider state:', 'Component', {
        user: o,
        tenant: c,
        isLoading: g,
      }),
      L.jsx(Ee.Provider, {
        value: {
          user: o,
          tenant: c,
          isLoading: g,
          login: l,
          logout: f,
          isAuthenticated: !!o,
          refreshAuth: async () => {},
          hasFeature: () => !1,
          hasRole: p,
          hasPermission: b,
          isWithinLimits: () => !0,
        },
        children: s,
      })
    );
  },
  nt = () => {
    const [s, o] = t.useState(null);
    return (
      t.useEffect(() => {
        if (typeof window > 'u') return;
        const n = window.location.hostname,
          c = n === 'localhost' || n === '127.0.0.1',
          u = /^\d+\.\d+\.\d+\.\d+$/.test(n),
          g = n === 'talk2go.online' || n === 'www.talk2go.online';
        let C = null,
          l = !1,
          f;
        if (!c && !u && !g)
          if (n.includes('.talk2go.online')) {
            const p = n.split('.');
            p.length > 2 && ((C = p[0]), (l = !0));
          } else ((f = n), (l = !1));
        o({
          subdomain: C,
          isMiNhon:
            c ||
            n === 'minhotel.talk2go.online' ||
            n === 'talk2go.online' ||
            n === 'www.talk2go.online' ||
            C === 'minhon',
          isSubdomain: l,
          customDomain: f,
        });
      }, []),
      s
    );
  },
  Se = { BASE_URL: '/', DEV: !1, MODE: 'development', PROD: !0, SSR: !1 },
  Z = {
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
    e.debug('[DEBUG] useHotelConfiguration hook called', 'Component');
    const [s, o] = t.useState(null),
      [n, c] = t.useState(!0),
      [u, g] = t.useState(null);
    nt();
    const C = () => {
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
      l = t.useCallback(async () => {
        e.debug('[DEBUG] loadConfiguration called', 'Component');
        try {
          (c(!0), g(null));
          const { type: f, identifier: b } = C();
          if (
            (e.debug('[DEBUG] extractHotelIdentifier', 'Component', {
              type: f,
              identifier: b,
            }),
            f === 'default')
          ) {
            o(Z);
            return;
          }
          if (f === 'subdomain') {
            const p = `/api/hotels/by-subdomain/${b}`;
            e.debug('[DEBUG] Fetching hotel config from', 'Component', p);
            try {
              const a = await fetch(p);
              if ((e.debug('[DEBUG] fetch response', 'Component', a), !a.ok))
                throw new Error('Failed to load hotel configuration');
              const r = await a.json();
              (e.debug('[DEBUG] hotelData', 'Component', r),
                o({
                  hotelName: r.name,
                  logoUrl: r.branding.logo,
                  primaryColor: r.branding.primaryColor,
                  headerText: r.name,
                  vapiPublicKey: '',
                  vapiAssistantId: '',
                  branding: {
                    ...r.branding,
                    colors: {
                      primary: r.branding.primaryColor || '#2C3E50',
                      secondary: r.branding.secondaryColor || '#34495E',
                      accent: r.branding.accentColor || '#E74C3C',
                    },
                    fonts: {
                      primary: r.branding.PrimaryFont || 'Inter',
                      secondary: r.branding.SecondaryFont || 'Roboto',
                    },
                  },
                  features: r.features,
                  services: r.services,
                  supportedLanguages: r.supportedLanguages,
                }));
              return;
            } catch (a) {
              (e.error('[DEBUG] fetch hotel config error', 'Component', a),
                o(Z));
              return;
            }
          }
          o(Z);
        } catch (f) {
          (g(f instanceof Error ? f.message : 'Failed to load configuration'),
            o(Z));
        } finally {
          c(!1);
        }
      }, []);
    return (
      t.useEffect(() => {
        l();
      }, [l]),
      { config: s, isLoading: n, error: u, reload: l, isMiNhon: !1 }
    );
  },
  ee = {},
  we = async s => {
    if (ee[s]) return ee[s];
    try {
      const o = await fetch(`/api/vapi/config/${s}`);
      if (!o.ok) throw new Error(`Failed to fetch Vapi config: ${o.status}`);
      const n = await o.json();
      return (
        e.debug(
          '🔧 [fetchVapiConfig] Received config for ${language}:',
          'Component',
          {
            publicKey: n.publicKey
              ? `${n.publicKey.substring(0, 10)}...`
              : 'NOT SET',
            assistantId: n.assistantId
              ? `${n.assistantId.substring(0, 10)}...`
              : 'NOT SET',
            fallback: n.fallback,
          }
        ),
        (ee[s] = n),
        n
      );
    } catch (o) {
      e.error(
        '[fetchVapiConfig] Error fetching Vapi config for ${language}:',
        'Component',
        o
      );
      const n = {
        publicKey:
          s === 'en'
            ? ''
            : Se[`VITE_VAPI_PUBLIC_KEY_${s.toUpperCase()}`] || void 0 || '',
        assistantId:
          s === 'en'
            ? ''
            : Se[`VITE_VAPI_ASSISTANT_ID_${s.toUpperCase()}`] || void 0 || '',
        fallback: !0,
      };
      return (
        e.debug(
          '[fetchVapiConfig] Using fallback config for ${language}:',
          'Component',
          {
            publicKey: n.publicKey
              ? `${n.publicKey.substring(0, 10)}...`
              : 'NOT SET',
            assistantId: n.assistantId
              ? `${n.assistantId.substring(0, 10)}...`
              : 'NOT SET',
          }
        ),
        (ee[s] = n),
        n
      );
    }
  },
  ot = async (s, o) => {
    if (o.hotelName === 'Mi Nhon Hotel Mui Ne')
      try {
        return (await we(s)).publicKey || o.vapiPublicKey;
      } catch (n) {
        return (
          e.error(
            '[getVapiPublicKeyByLanguage] Error for ${language}:',
            'Component',
            n
          ),
          o.vapiPublicKey
        );
      }
    return o.vapiPublicKey || void 0;
  },
  st = async (s, o) => {
    if (o.hotelName === 'Mi Nhon Hotel Mui Ne')
      try {
        const n = await we(s);
        return (
          e.debug(
            '🤖 [getVapiAssistantIdByLanguage] Selected assistant for ${language}:',
            'Component',
            {
              assistantId: n.assistantId
                ? `${n.assistantId.substring(0, 10)}...`
                : 'NOT SET',
              fallback: n.fallback,
            }
          ),
          n.assistantId || o.vapiAssistantId
        );
      } catch (n) {
        return (
          e.error(
            '[getVapiAssistantIdByLanguage] Error for ${language}:',
            'Component',
            n
          ),
          o.vapiAssistantId
        );
      }
    return o.vapiAssistantId || void 0;
  },
  rt = {
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
  Ae = t.createContext(void 0);
function At({ children: s }) {
  e.debug('[DEBUG] AssistantProvider render', 'Component');
  const [o, n] = t.useState([]),
    [c, u] = t.useState(null),
    [g, C] = t.useState(null),
    [l, f] = t.useState(null),
    [b, p] = t.useState(0),
    [a, r] = t.useState(null),
    [i, h] = t.useState(!1),
    [m, A] = t.useState(null),
    [y, x] = t.useState([]),
    [O, D] = t.useState(null),
    [V, B] = t.useState(!1),
    [$, re] = t.useState(null),
    [U, J] = t.useState(!1),
    W = t.useRef(!0),
    [ae, Q] = t.useState([]),
    ie = t.useCallback(
      d => (
        Q(S => [...S, d]),
        () => {
          Q(S => S.filter(v => v !== d));
        }
      ),
      []
    ),
    [R, F] = t.useState(() => {
      if (typeof window > 'u') return [];
      try {
        const d = localStorage.getItem('activeOrders');
        return d
          ? JSON.parse(d).map(v => ({
              ...v,
              requestedAt: new Date(v.requestedAt),
            }))
          : [];
      } catch (d) {
        return (
          e.error(
            'Failed to parse activeOrders from localStorage',
            'Component',
            d
          ),
          []
        );
      }
    }),
    [X, Te] = t.useState(0),
    [ge, le] = t.useState([]),
    [T, Ie] = t.useState(() => {
      if (typeof window < 'u') {
        const d = localStorage.getItem('selectedLanguage');
        if (d && ['en', 'fr', 'zh', 'ru', 'ko', 'vi'].includes(d))
          return (
            e.debug(
              '🌍 [AssistantContext] Loading saved language:',
              'Component',
              d
            ),
            d
          );
      }
      return (
        e.debug(
          '🌍 [AssistantContext] Using default language: en',
          'Component'
        ),
        'en'
      );
    }),
    [M, xe] = t.useState(null),
    [_, Re] = t.useState(null),
    [fe, ke] = t.useState(null),
    De = j.useCallback(d => {
      (e.debug(
        '🌍 [AssistantContext] setLanguage called with:',
        'Component',
        d
      ),
        Ie(d),
        typeof window < 'u' &&
          (localStorage.setItem('selectedLanguage', d),
          e.debug(
            '🌍 [AssistantContext] Language saved to localStorage:',
            'Component',
            d
          )));
    }, []),
    Pe = d => {
      (e.debug('🗑️ AssistantContext: setOrder called with:', 'Component', d),
        e.debug('🗑️ Previous order:', 'Component', l),
        f(d),
        e.debug('✅ AssistantContext: setOrder completed', 'Component'));
    };
  (t.useEffect(() => {
    if (!(typeof window > 'u'))
      try {
        localStorage.setItem('activeOrders', JSON.stringify(R));
      } catch {
        e.error('Failed to persist activeOrders to localStorage', 'Component');
      }
  }, [R]),
    t.useEffect(() => {}, [l]),
    t.useEffect(() => {}, [R]),
    t.useEffect(() => {}, [M]),
    t.useEffect(() => {}, [T]),
    t.useEffect(() => {}, [g]),
    t.useEffect(() => {}, [o]),
    t.useEffect(() => {}, [c]),
    t.useEffect(() => {}, [m]),
    t.useEffect(() => {}, [y]),
    t.useEffect(() => {}, [ge]),
    t.useEffect(() => {}, [X]),
    t.useEffect(() => {}, [i]),
    t.useEffect(() => {}, [b]),
    t.useEffect(() => {}, [V]),
    t.useEffect(() => {}, [$]),
    t.useEffect(() => {}, [O]),
    t.useEffect(() => {}, [_]),
    t.useEffect(() => {}, [fe]));
  const Oe = d => {
      F(S => [...S, { ...d, status: d.status || 'Đã ghi nhận' }]);
    },
    _e = j.useCallback(
      d => {
        const S = {
          ...d,
          callId: g?.id || `call-${Date.now()}`,
          timestamp: new Date(),
          tenantId: _ || 'default',
        };
        (n(I => [...I, S]),
          (async () => {
            try {
              const I = await fetch('/api/transcripts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callId: S.callId,
                  role: S.role,
                  content: S.content,
                  tenantId: S.tenantId,
                }),
              });
              if (!I.ok)
                throw new Error(`Failed to save transcript: ${I.status}`);
              const w = await I.json();
              e.debug('Transcript saved to database:', 'Component', w);
            } catch (I) {
              e.error('Error saving transcript to server:', 'Component', I);
            }
          })());
      },
      [g?.id, _]
    );
  (t.useEffect(() => {
    if (U) {
      e.debug(
        '🛑 [setupVapi] Skipping Vapi initialization - call is ending',
        'Component'
      );
      return;
    }
    return (
      (async () => {
        try {
          (e.debug('🔧 [setupVapi] Language changed to:', 'Component', T),
            e.debug(
              '🔧 [setupVapi] Hotel config available:',
              'Component',
              !!M
            ));
          const S = M ? await ot(T, M) : void 0;
          if (
            (e.debug(
              '🔑 [setupVapi] Selected publicKey for language',
              'Component',
              T,
              ':',
              S ? `${S.substring(0, 10)}...` : 'undefined'
            ),
            !S)
          )
            throw new Error('Vapi public key is not configured');
          const v = await $e(S);
          let I = 0;
          const w = 100;
          v.on('volume-level', E => {
            try {
              const P = Date.now();
              P - I > w && (Te(E), (I = P));
            } catch (P) {
              e.warn('Error handling volume-level:', 'Component', P);
            }
          });
          const k = E => {
              try {
                if (typeof window < 'u' && window.WebSocket) {
                  const P = `${window.location.origin.replace('http', 'ws')}/ws`,
                    H = new WebSocket(P);
                  ((H.onopen = () => {
                    (H.send(
                      JSON.stringify({
                        type: 'transcript',
                        call_id: E.callId,
                        role: E.role,
                        content: E.content,
                        timestamp: E.timestamp,
                      })
                    ),
                      H.close());
                  }),
                    (H.onerror = ce => {
                      e.warn(
                        'Failed to send transcript to WebSocket:',
                        'Component',
                        ce
                      );
                    }));
                }
              } catch (P) {
                e.warn(
                  'Error sending transcript to WebSocket:',
                  'Component',
                  P
                );
              }
            },
            G = async E => {
              if (
                (e.debug('Raw message received:', 'Component', E),
                e.debug('Message type:', 'Component', E.type),
                e.debug('Message role:', 'Component', E.role),
                e.debug('Message content structure:', 'Component', {
                  content: E.content,
                  text: E.text,
                  transcript: E.transcript,
                }),
                E.type === 'model-output')
              ) {
                e.debug(
                  'Model output detected - Full message:',
                  'Component',
                  E
                );
                const P = E.content || E.text || E.transcript || E.output;
                if (P) {
                  e.debug(
                    'Adding model output to conversation:',
                    'Component',
                    P
                  );
                  const H = {
                    callId: g?.id || `call-${Date.now()}`,
                    role: 'assistant',
                    content: P,
                    timestamp: new Date(),
                    isModelOutput: !0,
                    tenantId: _ || 'default',
                  };
                  (e.debug(
                    'Adding new transcript for model output:',
                    'Component',
                    H
                  ),
                    n(ce => {
                      const Ce = [...ce, H];
                      return (
                        e.debug('Updated transcripts array:', 'Component', Ce),
                        Ce
                      );
                    }),
                    k(H));
                } else
                  e.warn(
                    'Model output message received but no content found:',
                    'Component',
                    E
                  );
              }
              if (E.type === 'transcript') {
                e.debug('Adding transcript:', 'Component', E);
                const P = {
                  callId: g?.id || `call-${Date.now()}`,
                  role: E.role,
                  content: E.content || E.transcript || '',
                  timestamp: new Date(),
                  tenantId: _ || 'default',
                };
                (n(H => [...H, P]), k(P));
              }
            };
          (v.on('message', E => {
            try {
              G(E);
            } catch (P) {
              e.warn('Error handling Vapi message:', 'Component', P);
            }
          }),
            v.on('call-end', () => {
              (e.debug(
                '📞 [AssistantContext] Vapi call-end event received',
                'Component'
              ),
                e.debug(
                  '📊 [AssistantContext] Call-end context:',
                  'Component',
                  {
                    transcriptsCount: o.length,
                    hasCallSummary: !!m,
                    hasServiceRequests: y?.length > 0,
                    callDuration: b,
                    isEndingCall: U,
                  }
                ));
              try {
                setTimeout(() => {
                  (e.debug(
                    '🔔 [AssistantContext] Triggering call end listeners...',
                    'Component'
                  ),
                    ae.forEach(E => {
                      try {
                        E();
                      } catch (P) {
                        e.error(
                          '❌ [AssistantContext] Error in call end listener:',
                          'Component',
                          P
                        );
                      }
                    }),
                    e.debug(
                      '✅ [AssistantContext] Call end listeners triggered successfully',
                      'Component'
                    ));
                }, 1e3);
              } catch (E) {
                e.error(
                  '❌ [AssistantContext] Error triggering call end listeners:',
                  'Component',
                  E
                );
              }
            }));
        } catch (S) {
          e.error('Error setting up Vapi:', 'Component', S);
        }
      })(),
      () => {
        W.current = !1;
        const S = z();
        S &&
          (e.debug(
            '🧹 [setupVapi] Cleanup: Stopping Vapi due to dependency change',
            'Component'
          ),
          S.stop());
      }
    );
  }, [T, M, _, U]),
    t.useEffect(
      () => (
        (W.current = !0),
        () => {
          W.current = !1;
        }
      ),
      []
    ));
  const Ne = () => {
      const d = z();
      d && (d.setMuted(!i), h(!i));
    },
    Le = j.useCallback(async () => {
      try {
        B(!1);
        const d = `call-${Date.now()}`;
        (C({ id: d, roomNumber: '', duration: '', category: '', language: T }),
          n([]),
          le([]));
        const S = z();
        if (!S)
          throw (
            e.error(
              '❌ [startCall] Vapi instance not initialized',
              'Component'
            ),
            new Error(
              'Voice assistant not initialized. Please refresh the page and try again.'
            )
          );
        const v = M ? await st(T, M) : void 0;
        if (
          (e.debug(
            '🤖 [startCall] Selected assistantId for language',
            'Component',
            T,
            ':',
            v ? `${v.substring(0, 10)}...` : 'undefined'
          ),
          !v)
        )
          throw (
            e.error(
              '❌ [startCall] Assistant ID not configured for language:',
              'Component',
              T
            ),
            new Error(
              `Voice assistant not configured for ${T}. Please contact support.`
            )
          );
        e.debug('🚀 [startCall] Starting Vapi call...', 'Component');
        const I = await S.start(v);
        if (!I)
          throw (
            e.error(
              '❌ [startCall] Vapi.start() returned null/undefined',
              'Component'
            ),
            new Error(
              'Failed to start voice call. Please check your internet connection and try again.'
            )
          );
        (e.debug('✅ [startCall] Call started successfully:', 'Component', I),
          p(0));
        const w = setInterval(() => {
          p(k => k + 1);
        }, 1e3);
        r(w);
      } catch (d) {
        e.error('❌ [startCall] Error starting call:', 'Component', d);
        const S = d instanceof Error ? d.message : 'Unknown error occurred';
        (e.error('❌ [startCall] Detailed error:', 'Component', {
          error: d,
          language: T,
          hasHotelConfig: !!M,
          vapiInstance: !!z(),
        }),
          typeof window < 'u' && alert(`Failed to start voice call: ${S}`),
          p(0),
          a && (clearInterval(a), r(null)));
      }
    }, [T, M, _]),
    Fe = t.useCallback(() => {
      (e.debug('🛑 [AssistantContext] endCall() called', 'Component'),
        e.debug(
          '🔍 [AssistantContext] Current state before endCall:',
          'Component',
          {
            callDuration: b,
            transcriptsCount: o.length,
            hasCallDetails: !!g,
            hasCallTimer: !!a,
            language: T,
            tenantId: _,
            isEndingCall: U,
          }
        ),
        e.debug(
          '🚫 [AssistantContext] Step 0: Setting isEndingCall flag to prevent Vapi reinitialization...',
          'Component'
        ),
        J(!0));
      try {
        e.debug(
          '🔄 [AssistantContext] Step 1: Stopping VAPI IMMEDIATELY...',
          'Component'
        );
        try {
          const d = z();
          d
            ? (e.debug(
                '📞 [AssistantContext] Step 1a: VAPI instance found, calling stop()...',
                'Component'
              ),
              d.stop(),
              typeof d.cleanup == 'function' &&
                (e.debug(
                  '🧹 [AssistantContext] Step 1b: Calling vapi.cleanup()...',
                  'Component'
                ),
                d.cleanup()),
              typeof d.disconnect == 'function' &&
                (e.debug(
                  '🔌 [AssistantContext] Step 1c: Calling vapi.disconnect()...',
                  'Component'
                ),
                d.disconnect()),
              e.debug(
                '✅ [AssistantContext] Step 1: VAPI fully stopped and cleaned up',
                'Component'
              ))
            : e.debug(
                '⚠️ [AssistantContext] Step 1a: No VAPI instance to stop',
                'Component'
              );
        } catch (d) {
          (e.error(
            '❌ [AssistantContext] Step 1 ERROR: Error stopping VAPI:',
            'Component',
            d
          ),
            e.debug(
              '🔄 [AssistantContext] Continuing with cleanup despite VAPI error...',
              'Component'
            ));
        }
        e.debug(
          '🔄 [AssistantContext] Step 2: Batch state updates...',
          'Component'
        );
        try {
          e.debug(
            '🔄 [AssistantContext] Step 2a: Formatting call duration...',
            'Component'
          );
          const d = b
            ? `${Math.floor(b / 60)}:${(b % 60).toString().padStart(2, '0')}`
            : '0:00';
          (e.debug(
            '✅ [AssistantContext] Step 2a: Duration formatted:',
            'Component',
            d
          ),
            e.debug(
              '🔄 [AssistantContext] Step 2b: Updating states...',
              'Component'
            ),
            (() => {
              (e.debug(
                '🔄 [AssistantContext] Step 2b-1: Stopping timer...',
                'Component'
              ),
                a
                  ? (clearInterval(a),
                    r(null),
                    e.debug(
                      '✅ [AssistantContext] Timer stopped and cleared',
                      'Component'
                    ))
                  : e.debug(
                      '⚠️ [AssistantContext] No timer to stop',
                      'Component'
                    ),
                e.debug(
                  '🔄 [AssistantContext] Step 2b-2: Setting initial order summary...',
                  'Component'
                ),
                u(rt),
                e.debug(
                  '✅ [AssistantContext] Step 2b: State cleanup completed',
                  'Component'
                ));
            })(),
            e.debug(
              '🔄 [AssistantContext] Step 3: Processing summary generation...',
              'Component'
            ));
          try {
            const v = o.map(I => ({ role: I.role, content: I.content }));
            if (
              (e.debug(
                '🔍 [AssistantContext] Transcript data prepared:',
                'Component',
                { count: v.length, firstFew: v.slice(0, 2) }
              ),
              v.length >= 2)
            ) {
              e.debug(
                '📝 [AssistantContext] Step 3a: Sufficient transcript data, processing call summary...',
                'Component'
              );
              const I = {
                callId: g?.id || `call-${Date.now()}`,
                content: 'Generating AI summary of your conversation...',
                timestamp: new Date(),
                tenantId: _ || 'default',
              };
              (A(I),
                e.debug(
                  '✅ [AssistantContext] Loading summary state set',
                  'Component'
                ),
                e.debug(
                  '🔄 [AssistantContext] Step 3b: Sending transcript data to server for OpenAI processing...',
                  'Component'
                ),
                fetch('/api/store-summary', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    summary: '',
                    transcripts: v,
                    timestamp: new Date().toISOString(),
                    callId: g?.id || `call-${Date.now()}`,
                    callDuration: d,
                    forceBasicSummary: !1,
                    language: T,
                    tenantId: _ || 'default',
                  }),
                })
                  .then(w => {
                    if (
                      (e.debug(
                        '📡 [AssistantContext] Store-summary API response received:',
                        'Component',
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
                      (e.debug(
                        '✅ [AssistantContext] Store-summary API data received:',
                        'Component',
                        w
                      ),
                      w.success && w.summary && w.summary.content)
                    ) {
                      e.debug(
                        '📋 [AssistantContext] Valid summary received, updating state...',
                        'Component'
                      );
                      const k = w.summary.content,
                        G = {
                          callId: g?.id || `call-${Date.now()}`,
                          content: k,
                          timestamp: new Date(
                            w.summary.timestamp || Date.now()
                          ),
                          tenantId: _ || 'default',
                        };
                      (A(G),
                        e.debug(
                          '✅ [AssistantContext] Summary state updated successfully',
                          'Component'
                        ),
                        w.serviceRequests &&
                        Array.isArray(w.serviceRequests) &&
                        w.serviceRequests.length > 0
                          ? (e.debug(
                              '📝 [AssistantContext] Service requests received:',
                              'Component',
                              w.serviceRequests.length
                            ),
                            x(w.serviceRequests))
                          : e.debug(
                              '⚠️ [AssistantContext] No service requests in response',
                              'Component'
                            ));
                    } else
                      e.debug(
                        '⚠️ [AssistantContext] Invalid summary data received:',
                        'Component',
                        w
                      );
                  })
                  .catch(w => {
                    e.error(
                      '❌ [AssistantContext] Error processing summary:',
                      'Component',
                      w
                    );
                    const k = {
                      callId: g?.id || `call-${Date.now()}`,
                      content:
                        'An error occurred while generating the call summary.',
                      timestamp: new Date(),
                      tenantId: _ || 'default',
                    };
                    (A(k),
                      e.debug(
                        '✅ [AssistantContext] Error summary state set',
                        'Component'
                      ));
                  }));
            } else {
              (e.debug(
                '⚠️ [AssistantContext] Step 3a: Not enough transcript data for summary',
                'Component'
              ),
                e.debug(
                  '🔍 [AssistantContext] Transcript data count:',
                  'Component',
                  v.length
                ));
              const I = {
                callId: g?.id || `call-${Date.now()}`,
                content:
                  'Call was too short to generate a summary. Please try a more detailed conversation.',
                timestamp: new Date(),
                tenantId: _ || 'default',
              };
              (A(I),
                e.debug(
                  '✅ [AssistantContext] No transcript summary state set',
                  'Component'
                ));
            }
          } catch (v) {
            e.error(
              '❌ [AssistantContext] Step 3 ERROR: Error in summary processing:',
              'Component',
              v
            );
          }
        } catch (d) {
          (e.error(
            '❌ [AssistantContext] Step 2 ERROR: Error during state cleanup:',
            'Component',
            d
          ),
            e.debug(
              '🔄 [AssistantContext] Attempting force cleanup of critical states...',
              'Component'
            ));
          try {
            a &&
              (clearInterval(a),
              r(null),
              e.debug(
                '✅ [AssistantContext] Force timer cleanup completed',
                'Component'
              ));
          } catch (S) {
            e.error(
              '❌ [AssistantContext] Failed to clear timer:',
              'Component',
              S
            );
          }
        }
        e.debug(
          '✅ [AssistantContext] endCall() completed successfully',
          'Component'
        );
      } catch (d) {
        (e.error(
          '❌ [AssistantContext] CRITICAL ERROR in endCall():',
          'Component',
          d
        ),
          e.error('❌ [AssistantContext] Error name:', 'Component', d.name),
          e.error(
            '❌ [AssistantContext] Error message:',
            'Component',
            d.message
          ),
          e.error('❌ [AssistantContext] Error stack:', 'Component', d.stack),
          e.debug(
            '🔄 [AssistantContext] Attempting emergency cleanup...',
            'Component'
          ));
        try {
          a &&
            (clearInterval(a),
            r(null),
            e.debug(
              '✅ [AssistantContext] Emergency timer cleanup completed',
              'Component'
            ));
        } catch (S) {
          e.error(
            '🚨 [AssistantContext] Emergency cleanup failed:',
            'Component',
            S
          );
        }
        e.debug(
          '🔄 [AssistantContext] endCall() error handled gracefully, continuing normal operation',
          'Component'
        );
      } finally {
        setTimeout(() => {
          (e.debug(
            '🔄 [AssistantContext] Resetting isEndingCall flag...',
            'Component'
          ),
            J(!1));
        }, 2e3);
      }
    }, [a, b, o, g?.id, _, T, U]),
    Me = async d => {
      try {
        e.debug(
          'Requesting Vietnamese translation for summary...',
          'Component'
        );
        const S = await fetch('/api/translate-to-vietnamese', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: d }),
        });
        if (!S.ok) throw new Error(`Network response was not ok: ${S.status}`);
        const v = await S.json();
        if (v.success && v.translatedText)
          return (D(v.translatedText), v.translatedText);
        throw new Error('Translation failed');
      } catch (S) {
        return (
          e.error('Error translating to Vietnamese:', 'Component', S),
          'Không thể dịch nội dung này sang tiếng Việt. Vui lòng thử lại sau.'
        );
      }
    },
    He = d => {
      le(S => [...S, d]);
    };
  t.useEffect(() => {
    let d = null;
    const S = async () => {
      try {
        const { authenticatedFetch: v } = await Y(
            async () => {
              const { authenticatedFetch: k } = await import(
                './services-BvUATxiy.js'
              ).then(G => G.h);
              return { authenticatedFetch: k };
            },
            __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
          ),
          I = await v('/api/request');
        if (!I.ok) {
          (I.status === 401 || I.status === 403) &&
            e.warn(
              '⚠️ [AssistantContext] Auth failed - token may be invalid or missing',
              'Component'
            );
          return;
        }
        const w = await I.json();
        (e.debug('[AssistantContext] Fetched orders from API:', 'Component', w),
          Array.isArray(w) &&
            F(
              w.map(k => ({
                reference:
                  k.specialInstructions || k.reference || k.callId || '',
                requestedAt: k.createdAt ? new Date(k.createdAt) : new Date(),
                estimatedTime: k.deliveryTime || '',
                status:
                  k.status === 'completed'
                    ? 'Hoàn thiện'
                    : k.status === 'pending'
                      ? 'Đã ghi nhận'
                      : k.status,
                ...k,
              }))
            ));
      } catch {}
    };
    return (
      S(),
      (d = setInterval(S, 5e3)),
      () => {
        d && clearInterval(d);
      }
    );
  }, []);
  const Ve = {
    transcripts: o,
    setTranscripts: n,
    addTranscript: _e,
    orderSummary: c,
    setOrderSummary: u,
    callDetails: g,
    setCallDetails: C,
    order: l,
    setOrder: Pe,
    callDuration: b,
    setCallDuration: p,
    isMuted: i,
    toggleMute: Ne,
    startCall: Le,
    endCall: Fe,
    callSummary: m,
    setCallSummary: A,
    serviceRequests: y,
    setServiceRequests: x,
    vietnameseSummary: O,
    setVietnameseSummary: D,
    translateToVietnamese: Me,
    emailSentForCurrentSession: V,
    setEmailSentForCurrentSession: B,
    requestReceivedAt: $,
    setRequestReceivedAt: re,
    activeOrders: R,
    addActiveOrder: Oe,
    setActiveOrders: F,
    micLevel: X,
    modelOutput: ge,
    setModelOutput: le,
    addModelOutput: He,
    language: T,
    setLanguage: De,
    hotelConfig: M,
    setHotelConfig: xe,
    tenantId: _,
    setTenantId: Re,
    tenantConfig: fe,
    setTenantConfig: ke,
    addCallEndListener: ie,
  };
  return L.jsx(Ae.Provider, { value: Ve, children: s });
}
function se() {
  const s = t.useContext(Ae);
  return s === void 0
    ? (e.warn(
        'useAssistant used outside AssistantProvider - returning safe defaults',
        'Component'
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
    : s;
}
const at = ({ isActive: s }) => {
    const [o, n] = t.useState(!1),
      c = t.useRef(null),
      u = t.useRef(null),
      g = t.useRef(null),
      C = t.useRef(null),
      l = (p, a) => {
        let r,
          i = 0;
        return (...h) => {
          const m = Date.now();
          m - i > a
            ? (p(...h), (i = m))
            : (clearTimeout(r),
              (r = setTimeout(
                () => {
                  (p(...h), (i = Date.now()));
                },
                a - (m - i)
              )));
        };
      };
    return (
      t.useEffect(() => {
        const a = l(() => {
          const r = window.scrollY;
          n(r > te.SCROLL_THRESHOLD);
          const i = c.current,
            h = u.current;
          if (i && h) {
            i.getBoundingClientRect();
            const m = h.getBoundingClientRect();
            m.top < window.innerHeight &&
              m.bottom > 0 &&
              (m.top < 0 || m.bottom > window.innerHeight) &&
              m.top < te.SCROLL_OFFSETS.NEGATIVE_TOP_THRESHOLD &&
              h.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest',
              });
          }
        }, te.THROTTLE_DELAY);
        return (
          window.addEventListener('scroll', a),
          () => window.removeEventListener('scroll', a)
        );
      }, []),
      t.useEffect(() => {
        s || window.scrollTo({ top: 0, behavior: 'smooth' });
      }, [s]),
      {
        showScrollButton: o,
        scrollToTop: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        scrollToSection: p => {
          const r = { hero: c, services: u, conversation: g }[p];
          r.current &&
            r.current.scrollIntoView({
              behavior: 'smooth',
              block: p === 'hero' ? 'start' : 'center',
              inline: 'nearest',
            });
        },
        heroSectionRef: c,
        serviceGridRef: u,
        conversationRef: g,
        rightPanelRef: C,
      }
    );
  },
  it = ({ conversationRef: s }) => {
    const {
        startCall: o,
        endCall: n,
        callDuration: c,
        transcripts: u,
        setLanguage: g,
      } = se(),
      [C, l] = t.useState(!1),
      [f, b] = t.useState(!1),
      [p, a] = t.useState(!1);
    (t.useEffect(() => {
      const m = c > 0;
      (e.debug('🔄 [useConversationState] Syncing call states:', 'Component', {
        callDuration: c,
        isActive: m,
        isCallStarted: C,
        manualCallStarted: p,
        transcriptsCount: u.length,
      }),
        m && !C && !p
          ? (e.debug(
              '✅ [useConversationState] Active call detected - syncing isCallStarted = true',
              'Component'
            ),
            l(!0))
          : !m && C && !p
            ? (e.debug(
                '❌ [useConversationState] Call ended - syncing isCallStarted = false',
                'Component'
              ),
              l(!1))
            : p
              ? e.debug(
                  '⏳ [useConversationState] Manual call start in progress - keeping isCallStarted = true',
                  'Component'
                )
              : (e.debug(
                  '❌ [useConversationState] No active call and no manual start - syncing isCallStarted = false',
                  'Component'
                ),
                l(!1)));
    }, [c, C, p]),
      t.useEffect(() => {
        const m = c > 0,
          A = m || u.length > 0 || p;
        (e.debug(
          '🔄 [useConversationState] Evaluating showConversation:',
          'Component',
          {
            isActive: m,
            transcriptsCount: u.length,
            manualCallStarted: p,
            currentShowConversation: f,
            shouldShowConversation: A,
          }
        ),
          f !== A
            ? (e.debug(
                '🔄 [useConversationState] Updating showConversation: ${showConversation} → ${shouldShowConversation}',
                'Component'
              ),
              b(A))
            : e.debug(
                '✅ [useConversationState] showConversation unchanged - no re-render',
                'Component'
              ));
      }, [u.length, p, c]),
      t.useEffect(() => {
        f &&
          s.current &&
          setTimeout(() => {
            s.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
          }, te.AUTO_SCROLL_DELAY);
      }, [f, s]));
    const r = t.useCallback(
        async m => {
          (e.debug(
            '🎤 [useConversationState] Starting call with language:',
            'Component',
            m
          ),
            e.debug(
              '🎤 [useConversationState] Current state before call:',
              'Component',
              {
                isCallStarted: C,
                manualCallStarted: p,
                callDuration: c,
                transcriptsCount: u.length,
              }
            ));
          const A = !1;
          e.debug('🔍 [useConversationState] Environment check:', 'Component', {
            isDevelopment: !1,
            forceVapiInDev: A,
            hasVapiCredentials: !1,
            publicKey: 'MISSING',
            assistantId: 'MISSING',
            publicKey_VI: 'MISSING',
            assistantId_VI: 'MISSING',
          });
          const y = void 0;
          e.debug(
            '🔍 [useConversationState] hasAnyVapiCredentials:',
            'Component',
            !1
          );
          const x = !1;
          try {
            return (
              e.debug(
                '🚀 [PRODUCTION MODE] Using real VAPI call start',
                'Component'
              ),
              l(!0),
              a(!0),
              await o(),
              e.debug(
                '✅ [useConversationState] Real call started successfully',
                'Component'
              ),
              { success: !0 }
            );
          } catch (O) {
            (e.error(
              '❌ [useConversationState] Error starting call:',
              'Component',
              O
            ),
              l(!1),
              a(!1));
            const D = O instanceof Error ? O.message : 'Unknown error occurred';
            return D.includes('webCallUrl')
              ? {
                  success: !1,
                  error:
                    'Voice call initialization failed. Please check your internet connection and try again.',
                }
              : D.includes('assistant')
                ? {
                    success: !1,
                    error:
                      'Voice assistant configuration issue. Please contact support.',
                  }
                : D.includes('network') || D.includes('fetch')
                  ? {
                      success: !1,
                      error:
                        'Network error. Please check your internet connection and try again.',
                    }
                  : D.includes('permissions') || D.includes('microphone')
                    ? {
                        success: !1,
                        error:
                          'Microphone access required. Please enable microphone permissions and try again.',
                      }
                    : {
                        success: !1,
                        error: `Failed to start voice call: ${D}`,
                      };
          }
        },
        [C, p, c, u, o, g]
      ),
      i = t.useCallback(() => {
        (e.debug('🛑 [useConversationState] Ending call', 'Component'),
          e.debug(
            '🔍 [useConversationState] Current isCallStarted state:',
            'Component',
            C
          ),
          e.debug(
            '📞 [useConversationState] Step 1: Calling endCall() to stop VAPI...',
            'Component'
          ));
        try {
          (n(),
            e.debug(
              '✅ [useConversationState] endCall() completed - VAPI stopped',
              'Component'
            ));
        } catch (m) {
          e.error(
            '❌ [useConversationState] Error in endCall():',
            'Component',
            m
          );
        }
        (e.debug(
          '📞 [useConversationState] Step 2: Updating UI state...',
          'Component'
        ),
          l(!1),
          a(!1),
          e.debug('✅ [useConversationState] UI state updated', 'Component'),
          e.debug(
            '🔍 [useConversationState] Step 3: Checking development mode...',
            'Component'
          ),
          e.debug('🚀 [PRODUCTION MODE] Real call end completed', 'Component'),
          e.debug(
            '📝 [useConversationState] Staying in Interface1 - No interface switching',
            'Component'
          ));
      }, [n, C]),
      h = t.useCallback(() => {
        e.debug(
          '❌ [useConversationState] Canceling call - FULL RESET',
          'Component'
        );
        try {
          (l(!1), b(!1), a(!1));
          try {
            (n(),
              e.debug(
                '✅ [useConversationState] endCall() executed successfully',
                'Component'
              ));
          } catch (m) {
            e.error(
              '⚠️ [useConversationState] endCall() failed but continuing with cancel:',
              'Component',
              m
            );
          }
          (e.debug(
            '✅ [useConversationState] Cancel completed - all states reset',
            'Component'
          ),
            e.debug(
              '📊 [useConversationState] Final state: isCallStarted=false, showConversation=false',
              'Component'
            ));
        } catch (m) {
          (e.error(
            '❌ [useConversationState] Error in handleCancel:',
            'Component',
            m
          ),
            l(!1),
            b(!1),
            a(!1),
            e.debug(
              '🔄 [useConversationState] Forced state reset after error',
              'Component'
            ));
        }
      }, [n]);
    return {
      isCallStarted: C,
      showConversation: f,
      handleCallStart: r,
      handleCallEnd: i,
      handleCancel: h,
    };
  },
  lt = ({
    conversationState: s,
    conversationPopupId: o,
    setConversationPopupId: n,
    setShowRightPanel: c,
    transcripts: u,
  }) => {
    const { removePopup: g } = pe();
    return {
      handleCancel: t.useCallback(() => {
        (e.debug(
          '❌ [useCancelHandler] Cancel button clicked - Returning to Interface1 initial state',
          'Component'
        ),
          e.debug('📊 [useCancelHandler] Current state:', 'Component', {
            isCallStarted: s.isCallStarted,
            conversationPopupId: o,
            transcriptsCount: u.length,
          }));
        try {
          if (o)
            try {
              (e.debug(
                '🗑️ [useCancelHandler] Removing conversation popup:',
                'Component',
                o
              ),
                g(o),
                n(null),
                e.debug(
                  '✅ [useCancelHandler] Popup removed successfully',
                  'Component'
                ));
            } catch (l) {
              (e.error(
                '⚠️ [useCancelHandler] Failed to remove popup but continuing:',
                'Component',
                l
              ),
                n(null));
            }
          try {
            (s.handleCancel(),
              e.debug(
                '✅ [useCancelHandler] conversationState.handleCancel() completed',
                'Component'
              ));
          } catch (l) {
            e.error(
              '⚠️ [useCancelHandler] conversationState.handleCancel() failed:',
              'Component',
              l
            );
          }
          try {
            (c(!1),
              e.debug('✅ [useCancelHandler] Right panel closed', 'Component'));
          } catch (l) {
            e.error(
              '⚠️ [useCancelHandler] Failed to close right panel:',
              'Component',
              l
            );
          }
          try {
            (window.scrollTo({ top: 0, behavior: 'smooth' }),
              e.debug('✅ [useCancelHandler] Scrolled to top', 'Component'));
          } catch (l) {
            e.error(
              '⚠️ [useCancelHandler] Failed to scroll to top:',
              'Component',
              l
            );
          }
          e.debug(
            '✅ [useCancelHandler] Cancel completed - Interface1 returned to initial state',
            'Component'
          );
        } catch (l) {
          e.error(
            '❌ [useCancelHandler] Critical error in handleCancel:',
            'Component',
            l
          );
          try {
            (o && (g(o), n(null)),
              c(!1),
              window.scrollTo({ top: 0, behavior: 'auto' }),
              e.debug(
                '🚨 [useCancelHandler] Emergency cleanup completed',
                'Component'
              ));
          } catch (f) {
            e.error(
              '🚨 [useCancelHandler] Emergency cleanup failed:',
              'Component',
              f
            );
          }
          e.debug(
            '🔄 [useCancelHandler] Cancel operation completed despite errors - UI restored',
            'Component'
          );
        }
      }, [s, o, g, u.length, c, n]),
    };
  },
  ct = ({ endCall: s, transcripts: o, callSummary: n, serviceRequests: c }) => {
    const { showSummary: u } = pe(),
      g = t.useRef(null),
      C = t.useRef(!1),
      l = t.useRef(!0),
      f = t.useCallback(() => {
        (e.debug(
          '✅ [useConfirmHandler] Confirm button clicked in SiriButtonContainer',
          'Component'
        ),
          e.debug('📊 [useConfirmHandler] Current state:', 'Component', {
            transcriptsCount: o.length,
            hasCallSummary: !!n,
            hasServiceRequests: c?.length > 0,
          }));
        const p = async () => {
          try {
            if (
              (e.debug(
                '📋 [useConfirmHandler] Step 1: Showing immediate loading popup...',
                'Component'
              ),
              !l.current)
            ) {
              e.warn(
                '⚠️ [useConfirmHandler] Component unmounted, aborting',
                'Component'
              );
              return;
            }
            try {
              const a = t.createElement(
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
                  t.createElement(
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
                  t.createElement(
                    'div',
                    { key: 'loading', style: { marginBottom: '16px' } },
                    [
                      t.createElement('div', {
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
                      t.createElement(
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
                  t.createElement(
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
                  t.createElement(
                    'div',
                    {
                      key: 'time',
                      style: {
                        fontSize: '12px',
                        color: '#999',
                        marginTop: '12px',
                      },
                    },
                    `Call ended at: ${new Date().toLocaleTimeString()}`
                  ),
                ]
              );
              if (!document.getElementById('spinner-animation'))
                try {
                  const r = document.createElement('style');
                  ((r.id = 'spinner-animation'),
                    (r.textContent = `
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `),
                    document.head.appendChild(r));
                } catch (r) {
                  e.warn(
                    '⚠️ [useConfirmHandler] Failed to add spinner styles:',
                    'Component',
                    r
                  );
                }
              (e.debug(
                '🚀 [useConfirmHandler] Step 1b: Calling showSummary...',
                'Component'
              ),
                u(a, { title: 'Processing Call...', priority: 'high' }),
                e.debug(
                  '✅ [useConfirmHandler] Step 1c: Loading popup shown successfully',
                  'Component'
                ));
            } catch (a) {
              e.error(
                '❌ [useConfirmHandler] Step 1 ERROR: Loading popup creation failed:',
                'Component',
                a
              );
            }
            if (
              (e.debug(
                '⏳ [useConfirmHandler] Step 1.5: Brief delay before ending call...',
                'Component'
              ),
              await new Promise(a => setTimeout(a, 300)),
              !l.current)
            ) {
              e.warn(
                '⚠️ [useConfirmHandler] Component unmounted during delay, aborting',
                'Component'
              );
              return;
            }
            e.debug(
              '🔄 [useConfirmHandler] Step 2: Ending call immediately...',
              'Component'
            );
            try {
              if (l.current) {
                (e.debug(
                  '📞 [useConfirmHandler] Step 2a: Calling endCall() immediately...',
                  'Component'
                ),
                  s(),
                  e.debug(
                    '✅ [useConfirmHandler] Step 2a: Call ended successfully',
                    'Component'
                  ));
                try {
                  const { getVapiInstance: a } = await Y(
                      async () => {
                        const { getVapiInstance: i } = await import(
                          './services-BvUATxiy.js'
                        ).then(h => h.f);
                        return { getVapiInstance: i };
                      },
                      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                    ),
                    r = a();
                  r
                    ? (e.debug(
                        '🔧 [useConfirmHandler] Step 2b: Force stopping Vapi instance as backup...',
                        'Component'
                      ),
                      r.stop(),
                      e.debug(
                        '✅ [useConfirmHandler] Step 2b: Vapi instance force stopped',
                        'Component'
                      ))
                    : e.debug(
                        '⚠️ [useConfirmHandler] Step 2b: No Vapi instance found to force stop',
                        'Component'
                      );
                } catch (a) {
                  e.warn(
                    '⚠️ [useConfirmHandler] Step 2b: Backup Vapi stop failed:',
                    'Component',
                    a
                  );
                }
              }
            } catch (a) {
              e.error(
                '⚠️ [useConfirmHandler] endCall() failed:',
                'Component',
                a
              );
            }
            (e.debug(
              '🔄 [useConfirmHandler] Step 3: Showing completion message...',
              'Component'
            ),
              setTimeout(() => {
                if (l.current)
                  try {
                    const a = t.createElement(
                      'div',
                      {
                        style: {
                          padding: '20px',
                          textAlign: 'center',
                          maxWidth: '400px',
                        },
                      },
                      [
                        t.createElement(
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
                        t.createElement(
                          'div',
                          {
                            key: 'icon',
                            style: { fontSize: '48px', marginBottom: '16px' },
                          },
                          '✅'
                        ),
                        t.createElement(
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
                        o.length > 0 &&
                          t.createElement(
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
                              t.createElement(
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
                              t.createElement(
                                'div',
                                {
                                  key: 'transcript-count',
                                  style: { color: '#374151' },
                                },
                                `${o.length} messages recorded`
                              ),
                            ]
                          ),
                        c?.length > 0 &&
                          t.createElement(
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
                              t.createElement(
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
                              t.createElement(
                                'ul',
                                {
                                  key: 'req-list',
                                  style: {
                                    listStyle: 'disc',
                                    marginLeft: '20px',
                                    color: '#374151',
                                  },
                                },
                                c
                                  .slice(0, 3)
                                  .map((r, i) =>
                                    t.createElement(
                                      'li',
                                      {
                                        key: i,
                                        style: { marginBottom: '4px' },
                                      },
                                      `${r.serviceType || 'Request'}: ${(r.requestText || r.description || 'Service request').substring(0, 50)}...`
                                    )
                                  )
                              ),
                            ]
                          ),
                        t.createElement(
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
                        t.createElement(
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
                    (u(a, { title: 'Call Complete', priority: 'high' }),
                      e.debug(
                        '✅ [useConfirmHandler] Completion message shown successfully',
                        'Component'
                      ));
                  } catch (a) {
                    (e.error(
                      '❌ [useConfirmHandler] Error showing completion message:',
                      'Component',
                      a
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
              e.debug(
                '✅ [useConfirmHandler] Confirm flow completed successfully',
                'Component'
              ));
          } catch (a) {
            if (
              (e.error(
                '❌ [useConfirmHandler] CRITICAL ERROR in handleConfirm:',
                'Component',
                a
              ),
              l.current)
            )
              try {
                const r = t.createElement(
                  'div',
                  {
                    style: {
                      padding: '20px',
                      textAlign: 'center',
                      maxWidth: '400px',
                    },
                  },
                  [
                    t.createElement(
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
                    t.createElement(
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
                    t.createElement(
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
                    t.createElement(
                      'div',
                      {
                        key: 'timestamp',
                        style: {
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '12px',
                        },
                      },
                      `Call ended at: ${new Date().toLocaleTimeString()}`
                    ),
                  ]
                );
                u(r, {
                  title: 'Call Complete (with issue)',
                  priority: 'medium',
                });
              } catch (r) {
                (e.error(
                  '❌ [useConfirmHandler] Fallback popup also failed:',
                  'Component',
                  r
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
        } catch (a) {
          (e.error(
            '❌ [useConfirmHandler] OUTER ERROR BOUNDARY:',
            'Component',
            a
          ),
            setTimeout(() => {
              l.current &&
                alert(
                  'Call completed! Technical issue occurred. Please contact front desk.'
                );
            }, 100));
        }
      }, [s, o, n, c, u]),
      b = t.useCallback(() => {
        ((l.current = !1),
          (C.current = !1),
          g.current && (clearInterval(g.current), (g.current = null)));
      }, []);
    return (
      j.useEffect(() => ((l.current = !0), b), [b]),
      { handleConfirm: f }
    );
  },
  Tt = ({ isActive: s }) => {
    const {
        micLevel: o,
        transcripts: n,
        callSummary: c,
        serviceRequests: u,
        endCall: g,
        addCallEndListener: C,
      } = se(),
      { config: l, isLoading: f, error: b } = ve(),
      { showNotification: p, showSummary: a } = pe(),
      [r, i] = t.useState(null),
      h = at({ isActive: s }),
      m = it({ conversationRef: h.conversationRef }),
      [A, y] = t.useState(!1),
      x = t.useMemo(
        () => ({
          conversationState: m,
          conversationPopupId: r,
          setConversationPopupId: i,
          setShowRightPanel: y,
          transcripts: n,
        }),
        [m, r, n]
      ),
      O = t.useMemo(
        () => ({
          endCall: g,
          transcripts: n,
          callSummary: c,
          serviceRequests: u,
        }),
        [g, n, c, u]
      ),
      { handleCancel: D } = lt(x),
      { handleConfirm: V } = ct(O),
      { popups: B } = Xe(),
      [$, re] = t.useState(!1);
    t.useEffect(() => {
      const F = !!B.find(X => X.type === 'summary');
      $ !== F && re(F);
    }, [B, $]);
    const U = t.useCallback(() => {
      try {
        a(void 0, { title: 'Call Summary', priority: 'high' });
      } catch (R) {
        (e.error('Error auto-showing summary popup', 'useInterface1', R),
          setTimeout(() => {
            alert('Call completed! Please check your conversation summary.');
          }, 500));
      }
    }, [a]);
    t.useEffect(() => {
      const R = C(U);
      return () => {
        R();
      };
    }, [C, U]);
    const J = t.useCallback(() => {
        y(R => !R);
      }, []),
      W = t.useCallback(() => {
        y(!1);
      }, []),
      ae = t.useCallback(() => {}, []),
      Q = t.useCallback(() => {
        Y(
          () => import('./components-LYkGJCyk.js').then(R => R.ab),
          __vite__mapDeps([7, 3, 2, 1, 5, 6, 4, 0, 8, 9, 10, 11])
        )
          .then(R => {
            const { NotificationDemoContent: F } = R;
            p(t.createElement(F), {
              title: 'Pool Maintenance',
              priority: 'medium',
              badge: 1,
            });
          })
          .catch(() => {
            p(
              t.createElement('div', { style: { padding: '16px' } }, [
                t.createElement('h4', { key: 'title' }, 'Hotel Notification'),
                t.createElement(
                  'p',
                  { key: 'content' },
                  'Pool maintenance from 2-4 PM today.'
                ),
              ]),
              { title: 'Pool Maintenance', priority: 'medium', badge: 1 }
            );
          });
      }, [p]),
      ie = t.useCallback(() => {
        Y(
          () => import('./components-LYkGJCyk.js').then(R => R.ab),
          __vite__mapDeps([7, 3, 2, 1, 5, 6, 4, 0, 8, 9, 10, 11])
        )
          .then(R => {
            const { SummaryPopupContent: F } = R;
            a(t.createElement(F), { title: 'Call Summary', priority: 'high' });
          })
          .catch(() => {
            const R = new Date().toLocaleTimeString();
            a(
              t.createElement(
                'div',
                { style: { padding: '16px', fontSize: '12px' } },
                [
                  t.createElement(
                    'div',
                    {
                      key: 'title',
                      style: { fontWeight: 'bold', marginBottom: '8px' },
                    },
                    '📋 Call Summary'
                  ),
                  t.createElement('div', { key: 'room' }, 'Room: 101'),
                  t.createElement('div', { key: 'items' }, 'Items: 3 requests'),
                  t.createElement(
                    'div',
                    {
                      key: 'time',
                      style: {
                        fontSize: '10px',
                        color: '#666',
                        marginTop: '8px',
                      },
                    },
                    `Generated at ${R}`
                  ),
                ]
              ),
              { title: 'Call Summary', priority: 'high' }
            );
          });
      }, [a]);
    return {
      isLoading: f || !l,
      error: b,
      hotelConfig: l,
      micLevel: o,
      ...h,
      isCallStarted: m.isCallStarted,
      showConversation: m.showConversation,
      handleCallStart: m.handleCallStart,
      handleCallEnd: m.handleCallEnd,
      handleCancel: D,
      handleConfirm: V,
      showingSummary: $,
      showRightPanel: A,
      handleRightPanelToggle: J,
      handleRightPanelClose: W,
      handleShowConversationPopup: ae,
      handleShowNotificationDemo: Q,
      handleShowSummaryDemo: ie,
    };
  },
  N = {
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
  ut = { REQUEST_SENT: '✅ Request sent to Front Desk successfully!' },
  It = ({ onSuccess: s, onError: o } = {}) => {
    const {
        callSummary: n,
        serviceRequests: c,
        orderSummary: u,
        setOrder: g,
      } = se(),
      [C, l] = t.useState(!1),
      f = t.useMemo(
        () => ({
          id: '1',
          name: N.SERVICE_NAME_DEFAULT,
          description: 'Service request from voice call',
          quantity: 1,
          price: 0,
        }),
        []
      ),
      b = t.useMemo(
        () =>
          u ||
          (!n && (!c || c.length === 0)
            ? null
            : {
                orderType: N.ORDER_TYPE_DEFAULT,
                deliveryTime: N.DELIVERY_TIME_DEFAULT,
                roomNumber: '',
                guestName: '',
                guestEmail: '',
                guestPhone: '',
                specialInstructions: '',
                items: c?.map((y, x) => ({
                  id: (x + 1).toString(),
                  name: y.serviceType || N.SERVICE_NAME_DEFAULT,
                  description: y.requestText || 'No details provided',
                  quantity: 1,
                  price: 0,
                })) || [f],
                totalAmount: 0,
              }),
        [u, n, c, f]
      ),
      p = t.useCallback((y, x) => {
        if (y?.roomNumber && y.roomNumber !== N.ROOM_NUMBER_FALLBACK)
          return y.roomNumber;
        if (x) {
          const O = /Room Number:?\s*(\w+)/i,
            D = x.match(O);
          if (D && D[1]) return D[1];
        }
        return N.ROOM_NUMBER_FALLBACK;
      }, []),
      a = t.useCallback(() => {
        const y = Math.floor(N.ORDER_MIN + Math.random() * N.ORDER_RANGE);
        return `${N.ORDER_PREFIX}-${y}`;
      }, []),
      r = t.useCallback(
        y => {
          const x = a(),
            O = y.items && y.items.length > 0 ? y.items : [f];
          return {
            callId: x,
            roomNumber: p(y, n?.content),
            orderType: y.orderType || N.ORDER_TYPE_DEFAULT,
            deliveryTime: y.deliveryTime || N.DELIVERY_TIME_DEFAULT,
            specialInstructions: x,
            items: O,
            totalAmount: y.totalAmount || 0,
            status: N.STATUS_PENDING,
            createdAt: new Date().toISOString(),
          };
        },
        [p, a, f, n?.content]
      ),
      i = t.useCallback(async y => {
        e.debug(
          '📤 [useSendToFrontDeskHandler] Submitting request to /api/request:',
          'Component',
          y
        );
        const { authenticatedFetch: x } = await Y(
          async () => {
            const { authenticatedFetch: V } = await import(
              './services-BvUATxiy.js'
            ).then(B => B.h);
            return { authenticatedFetch: V };
          },
          __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        );
        e.debug(
          '🔐 [useSendToFrontDeskHandler] Using authenticated fetch with auto-retry',
          'Component'
        );
        const O = await x('/api/request', {
          method: 'POST',
          body: JSON.stringify(y),
        });
        if (!O.ok) {
          const V = O.status;
          throw V >= 500
            ? new Error(q.SERVER_ERROR)
            : V >= 400
              ? new Error(q.REQUEST_FAILED)
              : new Error(q.NETWORK_ERROR);
        }
        const D = await O.json();
        if (!D.success) throw new Error(D.error || q.REQUEST_FAILED);
        return D.data;
      }, []),
      h = t.useCallback(
        (y, x) => {
          (e.debug(
            '✅ [useSendToFrontDeskHandler] Request sent to Front Desk successfully',
            'Component'
          ),
            g({
              reference: y.reference || y.orderId,
              estimatedTime:
                y.estimatedTime || x.deliveryTime || N.DELIVERY_TIME_DEFAULT,
              summary: x,
            }),
            s ? s() : alert(ut.REQUEST_SENT));
        },
        [g, s]
      ),
      m = t.useCallback(
        y => {
          e.error(
            '❌ [useSendToFrontDeskHandler] Failed to send request:',
            'Component',
            y
          );
          const x = y.message || q.REQUEST_FAILED;
          o ? o(x) : alert(`❌ ${x}`);
        },
        [o]
      );
    return {
      handleSendToFrontDesk: t.useCallback(async () => {
        if (
          (e.debug(
            '🏨 [useSendToFrontDeskHandler] Send to FrontDesk initiated',
            'Component'
          ),
          !b)
        ) {
          e.warn(
            '⚠️ [useSendToFrontDeskHandler] No order summary available',
            'Component'
          );
          const y = q.NO_ORDER_DATA;
          o ? o(y) : alert(y);
          return;
        }
        l(!0);
        try {
          const y = r(b),
            x = await i(y);
          h(x, b);
        } catch (y) {
          m(y);
        } finally {
          l(!1);
        }
      }, [b, r, i, h, m, o]),
      isSubmitting: C,
    };
  },
  xt = () => {
    const [s, o] = t.useState(() =>
      typeof window > 'u' ? !1 : window.innerWidth >= 768
    );
    return (
      t.useEffect(() => {
        const n = () => {
          const c = window.innerWidth >= 768;
          c !== s &&
            (o(c),
            e.debug(
              '🔄 [useSiriResponsiveSize] Platform changed:',
              'Component',
              c ? 'Desktop' : 'Mobile'
            ));
        };
        return (
          window.addEventListener('resize', n),
          () => window.removeEventListener('resize', n)
        );
      }, [s]),
      s
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
  me = 768;
function Rt() {
  const [s, o] = t.useState(void 0);
  return (
    t.useEffect(() => {
      const n = window.matchMedia(`(max-width: ${me - 1}px)`),
        c = () => {
          o(window.innerWidth < me);
        };
      return (
        n.addEventListener('change', c),
        o(window.innerWidth < me),
        () => n.removeEventListener('change', c)
      );
    }, []),
    !!s
  );
}
const dt = t.createContext(void 0);
class kt extends j.Component {
  constructor(o) {
    (super(o), (this.state = { hasError: !1, error: null }));
  }
  static getDerivedStateFromError(o) {
    return { hasError: !0, error: o };
  }
  componentDidCatch(o, n) {
    e.error('Hotel configuration error:', 'Component', o, n);
  }
  render() {
    return this.state.hasError
      ? this.props.fallback ||
          L.jsx('div', {
            className:
              'min-h-screen flex items-center justify-center bg-gray-50',
            children: L.jsxs('div', {
              className:
                'max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center',
              children: [
                L.jsx(Ue, { className: 'w-16 h-16 text-red-500 mx-auto mb-4' }),
                L.jsx('h2', {
                  className: 'text-xl font-bold text-gray-900 mb-2',
                  children: 'Configuration Error',
                }),
                L.jsx('p', {
                  className: 'text-gray-600 mb-4',
                  children:
                    'Failed to load hotel configuration. Please try refreshing the page.',
                }),
                L.jsxs('button', {
                  onClick: () => window.location.reload(),
                  className:
                    'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md',
                  children: [
                    L.jsx(Be, { className: 'w-4 h-4 inline mr-2' }),
                    'Reload Page',
                  ],
                }),
              ],
            }),
          })
      : this.props.children;
  }
}
const Dt = ({ children: s }) => {
  e.debug('[DEBUG] HotelProvider rendered', 'Component');
  const o = ve(),
    { config: n, isLoading: c, error: u } = o,
    g = A => '',
    C = A => '',
    l = A => n?.features?.[A] ?? !1,
    f = () => n?.supportedLanguages || [],
    b = A => n?.services || [],
    p = () => ({
      primary: n?.branding?.colors.primary || '#2E7D32',
      secondary: n?.branding?.colors.secondary || '#FFC107',
      accent: n?.branding?.colors.accent || '#FF6B6B',
    }),
    a = () => ({
      primary: n?.branding?.fonts.primary || 'Inter',
      secondary: n?.branding?.fonts.secondary || 'Roboto',
    }),
    r = () => null,
    i = () => null,
    h = () => 'UTC',
    m = () => 'USD';
  return L.jsx(dt.Provider, {
    value: {
      config: n,
      loading: c,
      error: u,
      reload: async () => {},
      getVapiPublicKey: g,
      getVapiAssistantId: C,
      hasFeature: l,
      getSupportedLanguages: f,
      getAvailableServices: b,
      getThemeColors: p,
      getFontFamilies: a,
      getContactInfo: r,
      getLocation: i,
      getTimezone: h,
      getCurrency: m,
    },
    children: s,
  });
};
function Pt() {
  const [s, o] = t.useState(null),
    [n, c] = t.useState(!1),
    u = se(),
    g = t.useRef(0),
    C = t.useCallback(() => {
      (e.debug('useWebSocket env VITE_API_HOST:', 'Component', void 0),
        s !== null && s.close());
      const p = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
      e.debug('Attempting WebSocket connection to', 'Component', p);
      const a = new WebSocket(p);
      return (
        (a.onopen = () => {
          (e.debug('WebSocket connection established', 'Component'),
            c(!0),
            (g.current = 0),
            u.callDetails &&
              a.send(
                JSON.stringify({ type: 'init', callId: u.callDetails.id })
              ));
        }),
        (a.onmessage = r => {
          try {
            const i = JSON.parse(r.data);
            (e.debug('[useWebSocket] Message received:', 'Component', i),
              i.type === 'transcript' &&
                (e.debug('[useWebSocket] Transcript message:', 'Component', i),
                u.addTranscript({
                  callId: i.callId,
                  role: i.role,
                  content: i.content,
                  tenantId: 'default',
                })),
              i.type === 'connected' &&
                e.debug(
                  '[useWebSocket] Connected to server:',
                  'Component',
                  i.message
                ),
              i.type === 'order_status_update' &&
                (i.orderId || i.reference) &&
                i.status &&
                (e.debug('[useWebSocket] Order status update:', 'Component', i),
                u.setActiveOrders(h =>
                  h.map(m =>
                    (i.reference && m.reference === i.reference) ||
                    (i.orderId && m.reference === i.orderId)
                      ? { ...m, status: i.status }
                      : m
                  )
                )));
          } catch (i) {
            e.error('Error parsing WebSocket message:', 'Component', i);
          }
        }),
        (a.onclose = r => {
          if (
            (e.debug('WebSocket connection closed', 'Component', r),
            c(!1),
            g.current < 5)
          ) {
            const i = Math.pow(2, g.current) * 1e3;
            (e.debug(
              'Reconnecting WebSocket in ${delay}ms (attempt ${retryRef.current + 1})',
              'Component'
            ),
              setTimeout(C, i),
              g.current++);
          } else
            e.warn('Max WebSocket reconnection attempts reached', 'Component');
        }),
        (a.onerror = r => {
          (e.error('WebSocket encountered error', 'Component', r),
            a.readyState !== WebSocket.CLOSED && a.close());
        }),
        o(a),
        () => {
          a.close();
        }
      );
    }, [u.callDetails, u.addTranscript, u.activeOrders, u.setActiveOrders]),
    l = t.useCallback(
      b => {
        s && n
          ? s.send(JSON.stringify(b))
          : e.error(
              'Cannot send message, WebSocket not connected',
              'Component'
            );
      },
      [s, n]
    ),
    f = t.useCallback(() => {
      n || C();
    }, [n, C]);
  return (
    t.useEffect(
      () => (
        C(),
        () => {
          s && s.close();
        }
      ),
      []
    ),
    t.useEffect(() => {
      s &&
        n &&
        u.callDetails?.id &&
        (e.debug(
          'Sending init message with callId after availability',
          'Component',
          u.callDetails.id
        ),
        s.send(JSON.stringify({ type: 'init', callId: u.callDetails.id })));
    }, [u.callDetails?.id, s, n]),
    { connected: n, sendMessage: l, reconnect: f }
  );
}
export {
  wt as A,
  Dt as H,
  bt as P,
  St as S,
  Y as _,
  se as a,
  Xe as b,
  ht as c,
  yt as d,
  It as e,
  Tt as f,
  vt as g,
  Rt as h,
  Et as i,
  xt as j,
  At as k,
  Pt as l,
  nt as m,
  Ct as u,
};
