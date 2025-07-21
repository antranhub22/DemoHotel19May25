import {
  r as a,
  j as e,
  V as Z,
  b as J,
  c as ee,
  C as te,
  X as I,
  T as se,
  D as ne,
  P as ht,
  F as ft,
  d as xt,
  e as Y,
  f as bt,
  g as vt,
  h as yt,
  i as Nt,
  k as jt,
  l as wt,
  S as $t,
  m as oe,
  I as ae,
  n as re,
  o as ie,
  p as kt,
  q as ce,
  s as Ct,
  t as le,
  u as de,
  v as me,
  w as ue,
  x as O,
  y as pe,
  z as St,
  L as ge,
  B as _e,
  E as Tt,
  G as Rt,
  H as he,
  J as It,
  K as fe,
  M as xe,
  N as At,
  O as be,
  Q as ve,
  U as Dt,
  W as ye,
  Y as Et,
  Z as Ne,
  _ as Pt,
  $ as je,
  a0 as we,
  a1 as Ft,
  a2 as zt,
  a3 as $e,
  a4 as Mt,
  a5 as Bt,
  a6 as ke,
  a7 as Ht,
  a8 as Ce,
  a9 as Lt,
  aa as Se,
  ab as Te,
  ac as Re,
  ad as Ot,
  ae as qt,
  af as M,
  ag as Gt,
  ah as Ie,
  ai as Vt,
  aj as Wt,
  ak as Ut,
  al as Yt,
  am as Xt,
  an as Ae,
  ao as Kt,
  ap as Qt,
  aq as Zt,
  ar as Jt,
  as as es,
  at as ts,
  au as ss,
  av as ns,
  aw as os,
  ax as as,
  ay as De,
  az as rs,
  aA as Ee,
  aB as is,
  aC as Pe,
  aD as Fe,
  aE as cs,
  aF as ze,
  aG as ls,
  aH as Me,
  aI as Be,
  aJ as He,
  aK as Le,
  aL as Oe,
  aM as ds,
  aN as ms,
  aO as qe,
} from './react-core-C6DwaHZM.js';
import {
  u as us,
  P as ps,
  a as q,
  b as G,
  S as gs,
  c as _s,
  d as hs,
  e as fs,
  f as xs,
  g as F,
  h as bs,
  i as vs,
} from './hooks-context-BUKIDDkP.js';
import { B as A, C as ys, L as Ge } from './vendor-BXT5a8vO.js';
import { c as r, e as Ns, p as js } from './services-BvUATxiy.js';
import { S as X } from './siri-components-BXrmXl8X.js';
import { u as ws, a as $s } from './react-router-B7s-G-0E.js';
var ks = {},
  Ve = (s => (
    (s[(s.DEBUG = 0)] = 'DEBUG'),
    (s[(s.INFO = 1)] = 'INFO'),
    (s[(s.WARN = 2)] = 'WARN'),
    (s[(s.ERROR = 3)] = 'ERROR'),
    s
  ))(Ve || {});
class Cs {
  logLevel;
  isDevelopment;
  constructor() {
    ((this.logLevel = this.getLogLevel()), (this.isDevelopment = !1));
  }
  getLogLevel() {
    switch (ks.LOG_LEVEL?.toUpperCase()) {
      case 'DEBUG':
        return 0;
      case 'INFO':
        return 1;
      case 'WARN':
        return 2;
      case 'ERROR':
        return 3;
      default:
        return this.isDevelopment ? 0 : 1;
    }
  }
  formatMessage(t, n, o, i) {
    const c = new Date().toISOString(),
      d = Ve[t],
      l = { timestamp: c, level: d, message: n, context: o, data: i };
    if (this.isDevelopment) {
      let p = `${c} [${d}]`;
      return (
        o && (p += ` [${o}]`),
        (p += ` ${n}`),
        i && (p += ` ${JSON.stringify(i)}`),
        p
      );
    } else return JSON.stringify(l);
  }
  log(t, n, o, i) {
    if (t < this.logLevel) return;
    const c = this.formatMessage(t, n, o, i);
    switch (t) {
      case 0:
        console.debug(c);
        break;
      case 1:
        console.info(c);
        break;
      case 2:
        console.warn(c);
        break;
      case 3:
        console.error(c);
        break;
    }
  }
  debug(t, n, o) {
    this.log(0, t, n, o);
  }
  info(t, n, o) {
    this.log(1, t, n, o);
  }
  warn(t, n, o) {
    this.log(2, t, n, o);
  }
  error(t, n, o) {
    this.log(3, t, n, o);
  }
  success(t, n, o) {
    this.info(`✅ ${t}`, n, o);
  }
  loading(t, n, o) {
    this.info(`⏳ ${t}`, n, o);
  }
  progress(t, n, o) {
    this.info(`🔄 ${t}`, n, o);
  }
  database(t, n, o) {
    this.info(`🗄️ ${t}`, n, o);
  }
  api(t, n, o) {
    this.info(`🌐 ${t}`, n, o);
  }
  email(t, n, o) {
    this.info(`📧 ${t}`, n, o);
  }
  hotel(t, n, o) {
    this.info(`🏨 ${t}`, n, o);
  }
  assistant(t, n, o) {
    this.info(`🤖 ${t}`, n, o);
  }
}
const $ = new Cs();
class Ss extends a.Component {
  retryTimeoutId = null;
  constructor(t) {
    (super(t),
      (this.state = { hasError: !1, retryCount: 0, isRecovering: !1 }));
  }
  static getDerivedStateFromError(t) {
    return { hasError: !0, error: t };
  }
  componentDidCatch(t, n) {
    ($.error(
      '🚨 [ErrorBoundary] Uncaught error in component tree:',
      'Component',
      t
    ),
      $.error(
        '🚨 [ErrorBoundary] Component stack:',
        'Component',
        n.componentStack
      ));
    const o = this.categorizeError(t);
    ($.debug('🔍 [ErrorBoundary] Error category:', 'Component', o),
      this.props.onError && this.props.onError(t, n),
      this.setState({ errorInfo: n }));
    const i = this.props.maxRetries || 2;
    if (this.shouldAutoRetry(t, o) && this.state.retryCount < i) {
      ($.debug(
        '🔄 [ErrorBoundary] Attempting auto-recovery for:',
        'Component',
        o
      ),
        this.setState({ isRecovering: !0 }));
      const c = this.getRetryDelay(o);
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, c);
    }
  }
  categorizeError(t) {
    const n = t.message.toLowerCase(),
      o = t.stack?.toLowerCase() || '';
    return n.includes('chunk') || n.includes('loading chunk')
      ? 'chunk-loading'
      : n.includes('network') || n.includes('fetch')
        ? 'network'
        : n.includes('vapi') || n.includes('webCallUrl')
          ? 'vapi'
          : n.includes('hook') ||
              o.includes('useeffect') ||
              o.includes('usestate')
            ? 'react-hooks'
            : n.includes('render') || o.includes('render')
              ? 'react-render'
              : n.includes('canvas') || n.includes('siri')
                ? 'canvas-siri'
                : 'unknown';
  }
  shouldAutoRetry(t, n) {
    return ['react-hooks', 'canvas-siri'].includes(n)
      ? ($.debug(
          '🚫 [ErrorBoundary] Non-retryable error category:',
          'Component',
          n
        ),
        !1)
      : ['chunk-loading', 'network', 'vapi', 'react-render'].includes(n);
  }
  getRetryDelay(t) {
    return (
      {
        'chunk-loading': 1e3,
        network: 2e3,
        vapi: 1500,
        'react-render': 500,
        unknown: 1e3,
      }[t] || 1e3
    );
  }
  handleRetry = () => {
    $.debug(
      '🔄 [ErrorBoundary] Executing retry attempt:',
      'Component',
      this.state.retryCount + 1
    );
    try {
      (['conversationState', 'interface1State', 'vapiState'].forEach(n => {
        (localStorage.removeItem(n), sessionStorage.removeItem(n));
      }),
        $.debug('🧹 [ErrorBoundary] Cleared problematic state', 'Component'));
    } catch (t) {
      $.warn('⚠️ [ErrorBoundary] Error during state cleanup:', 'Component', t);
    }
    (this.setState(t => ({
      hasError: !1,
      error: void 0,
      errorInfo: void 0,
      retryCount: t.retryCount + 1,
      isRecovering: !1,
    })),
      this.retryTimeoutId &&
        (clearTimeout(this.retryTimeoutId), (this.retryTimeoutId = null)));
  };
  componentWillUnmount() {
    this.retryTimeoutId && clearTimeout(this.retryTimeoutId);
  }
  render() {
    if (this.state.hasError) {
      const t = this.props.fallbackComponent;
      return this.state.isRecovering
        ? e.jsx('div', {
            className:
              'flex items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-white',
            children: e.jsxs('div', {
              className:
                'text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200',
              children: [
                e.jsx('div', {
                  className:
                    'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4',
                }),
                e.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-800 mb-2',
                  children: 'Đang khôi phục trợ lý...',
                }),
                e.jsx('p', {
                  className: 'text-gray-600',
                  children: 'Vui lòng chờ trong giây lát',
                }),
              ],
            }),
          })
        : t
          ? e.jsx(t, { error: this.state.error, onRetry: this.handleRetry })
          : e.jsx('div', {
              className:
                'flex items-center justify-center min-h-[400px] bg-gradient-to-br from-red-50 to-white',
              children: e.jsxs('div', {
                className:
                  'text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-red-200 max-w-md',
                children: [
                  e.jsx('div', { className: 'text-6xl mb-4', children: '⚠️' }),
                  e.jsx('h2', {
                    className: 'text-xl font-bold text-gray-800 mb-4',
                    children: 'Có lỗi xảy ra',
                  }),
                  e.jsx('p', {
                    className: 'text-gray-600 mb-6',
                    children:
                      'Trợ lý gặp sự cố tạm thời. Chúng tôi sẽ thử khôi phục tự động.',
                  }),
                  e.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      e.jsxs('button', {
                        onClick: this.handleRetry,
                        className:
                          'w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-all duration-200 active:scale-95',
                        children: [
                          '🔄 Thử lại (',
                          this.state.retryCount + 1,
                          '/',
                          this.props.maxRetries || 2,
                          ')',
                        ],
                      }),
                      e.jsx('button', {
                        onClick: () => window.location.reload(),
                        className:
                          'w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-semibold transition-all duration-200 active:scale-95',
                        children: '🔄 Tải lại trang',
                      }),
                    ],
                  }),
                  this.state.error &&
                    e.jsxs('details', {
                      className: 'mt-6 text-left',
                      children: [
                        e.jsx('summary', {
                          className:
                            'cursor-pointer text-sm text-gray-500 hover:text-gray-700',
                          children: 'Chi tiết lỗi',
                        }),
                        e.jsxs('pre', {
                          className:
                            'mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-32',
                          children: [
                            this.state.error.toString(),
                            this.state.errorInfo?.componentStack &&
                              e.jsxs(e.Fragment, {
                                children: [
                                  `

Component Stack:`,
                                  this.state.errorInfo.componentStack,
                                ],
                              }),
                          ],
                        }),
                      ],
                    }),
                ],
              }),
            });
    }
    return this.props.children;
  }
}
const Ts = ht,
  We = a.forwardRef(({ className: s, ...t }, n) =>
    e.jsx(Z, {
      ref: n,
      className: r(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        s
      ),
      ...t,
    })
  );
We.displayName = Z.displayName;
const Rs = A(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
    {
      variants: {
        variant: {
          default: 'border bg-background text-dark',
          destructive:
            'destructive group border-destructive bg-destructive text-destructive-foreground',
        },
      },
      defaultVariants: { variant: 'default' },
    }
  ),
  Ue = a.forwardRef(({ className: s, variant: t, ...n }, o) =>
    e.jsx(J, { ref: o, className: r(Rs({ variant: t }), s), ...n })
  );
Ue.displayName = J.displayName;
const Is = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(ee, {
    ref: n,
    className: r(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      s
    ),
    ...t,
  })
);
Is.displayName = ee.displayName;
const Ye = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(te, {
    ref: n,
    className: r(
      'absolute right-2 top-2 rounded-md p-1 text-dark/50 opacity-0 transition-opacity hover:text-dark focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      s
    ),
    'toast-close': '',
    ...t,
    children: e.jsx(I, { className: 'h-4 w-4' }),
  })
);
Ye.displayName = te.displayName;
const Xe = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(se, { ref: n, className: r('text-sm font-semibold', s), ...t })
);
Xe.displayName = se.displayName;
const Ke = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(ne, { ref: n, className: r('text-sm opacity-90', s), ...t })
);
Ke.displayName = ne.displayName;
function $g() {
  const { toasts: s } = us();
  return e.jsxs(Ts, {
    children: [
      s.map(function ({ id: t, title: n, description: o, action: i, ...c }) {
        return e.jsxs(
          Ue,
          {
            ...c,
            children: [
              e.jsxs('div', {
                className: 'grid gap-1',
                children: [
                  n && e.jsx(Xe, { children: n }),
                  o && e.jsx(Ke, { children: o }),
                ],
              }),
              i,
              e.jsx(Ye, {}),
            ],
          },
          t
        );
      }),
      e.jsx(We, {}),
    ],
  });
}
const As = '_popupCard_1ombn_1',
  Ds = '_popupCardActive_1ombn_15',
  Es = '_popupCardTop_1ombn_20',
  Ps = '_popupCardInner_1ombn_24',
  Fs = '_popupCardHeader_1ombn_38',
  zs = '_popupCardInfo_1ombn_46',
  Ms = '_popupCardIcon_1ombn_54',
  Bs = '_popupCardTitleWrapper_1ombn_64',
  Hs = '_popupCardTitle_1ombn_64',
  Ls = '_popupCardBadge_1ombn_79',
  Os = '_popupCardMeta_1ombn_90',
  qs = '_popupCardTimestamp_1ombn_97',
  Gs = '_popupCardDismiss_1ombn_103',
  Vs = '_popupCardPreview_1ombn_122',
  Ws = '_popupCardPreviewText_1ombn_126',
  Us = '_popupCardContent_1ombn_136',
  v = {
    popupCard: As,
    popupCardActive: Ds,
    popupCardTop: Es,
    popupCardInner: Ps,
    popupCardHeader: Fs,
    popupCardInfo: zs,
    popupCardIcon: Ms,
    popupCardTitleWrapper: Bs,
    popupCardTitle: Hs,
    popupCardBadge: Ls,
    popupCardMeta: Os,
    popupCardTimestamp: qs,
    popupCardDismiss: Gs,
    popupCardPreview: Vs,
    popupCardPreviewText: Ws,
    popupCardContent: Us,
  },
  K = ({
    popup: s,
    index: t,
    isActive: n,
    onClick: o,
    onDismiss: i,
    maxVisible: c = 3,
  }) => {
    const d = ps[s.type],
      l = t < c,
      p = Math.min(t, c - 1),
      m = 1 - p * 0.03,
      u = p * 12,
      g = l ? 1 - p * 0.1 : 0,
      f = 1e3 - t,
      j = y => {
        const k = new Date().getTime() - y.getTime(),
          S = Math.floor(k / (1e3 * 60));
        if (S < 1) return 'now';
        if (S < 60) return `${S}m ago`;
        const T = Math.floor(S / 60);
        return T < 24 ? `${T}h ago` : `${Math.floor(T / 24)}d ago`;
      };
    if (!l && t >= c) return null;
    const _ = [
      v.popupCard,
      n ? v.popupCardActive : '',
      t === 0 ? v.popupCardTop : '',
    ]
      .filter(Boolean)
      .join(' ');
    return e.jsx('div', {
      className: _,
      style: {
        transform: `translateY(${u}px) scale(${m})`,
        opacity: g,
        zIndex: f,
        '--translate-y': `${u}px`,
        '--scale-hover': m * 1.02,
      },
      onClick: o,
      children: e.jsxs('div', {
        className: v.popupCardInner,
        children: [
          e.jsxs('div', {
            className: v.popupCardHeader,
            style: { background: d.bgColor },
            children: [
              e.jsxs('div', {
                className: v.popupCardInfo,
                children: [
                  e.jsx('div', {
                    className: v.popupCardIcon,
                    children: d.icon,
                  }),
                  e.jsxs('div', {
                    className: v.popupCardTitleWrapper,
                    children: [
                      e.jsx('span', {
                        className: v.popupCardTitle,
                        style: { color: d.color },
                        children: d.title,
                      }),
                      s.badge &&
                        s.badge > 0 &&
                        e.jsx('span', {
                          className: v.popupCardBadge,
                          style: { background: d.color },
                          children: s.badge,
                        }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: v.popupCardMeta,
                children: [
                  e.jsx('span', {
                    className: v.popupCardTimestamp,
                    children: j(s.timestamp),
                  }),
                  e.jsx('button', {
                    className: v.popupCardDismiss,
                    onClick: y => {
                      (y.stopPropagation(), i());
                    },
                    'aria-label': 'Dismiss notification',
                    children: e.jsx(I, { size: 14 }),
                  }),
                ],
              }),
            ],
          }),
          !n &&
            e.jsx('div', {
              className: v.popupCardPreview,
              children: e.jsx('span', {
                className: v.popupCardPreviewText,
                children: s.title,
              }),
            }),
          n &&
            e.jsx('div', {
              className: v.popupCardContent,
              children: s.content,
            }),
        ],
      }),
    });
  },
  Ys = '_popupStack_1urkl_1',
  Xs = '_popupStackContainer_1urkl_5',
  Ks = '_popupStackHeader_1urkl_10',
  Qs = '_popupStackMore_1urkl_11',
  Zs = '_popupStackActive_1urkl_56',
  Js = '_popupStackInactive_1urkl_60',
  R = {
    popupStack: Ys,
    popupStackContainer: Xs,
    popupStackHeader: Ks,
    popupStackMore: Qs,
    popupStackActive: Zs,
    popupStackInactive: Js,
  },
  en = ({
    popups: s,
    activePopup: t,
    maxVisible: n = 4,
    onPopupSelect: o,
    onPopupDismiss: i,
    position: c = 'bottom',
  }) => {
    if (s.length === 0) return null;
    const d = [...s].sort((l, p) => {
      const m = { high: 0, medium: 1, low: 2 };
      return m[l.priority] !== m[p.priority]
        ? m[l.priority] - m[p.priority]
        : p.timestamp.getTime() - l.timestamp.getTime();
    });
    return e.jsx('div', {
      className: R.popupStack,
      style: {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '400px',
        zIndex: 1e3,
        pointerEvents: 'none',
        ...(c === 'top' && { top: '20px' }),
        ...(c === 'bottom' && { bottom: '260px' }),
        ...(c === 'center' && {
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          width: 'auto',
        }),
      },
      children: e.jsxs('div', {
        className: R.popupStackContainer,
        style: {
          display: 'flex',
          flexDirection: c === 'bottom' ? 'column-reverse' : 'column',
          gap: '4px',
          padding: c === 'center' ? '0' : '0 16px',
          pointerEvents: 'auto',
        },
        children: [
          d.length > 1 &&
            e.jsx('div', {
              className: R.popupStackHeader,
              style: {
                textAlign: 'center',
                padding: '8px 0',
                color: '#8E8E93',
                fontSize: '14px',
                fontWeight: '600',
                order: c === 'bottom' ? 1 : -1,
              },
              children: 'Notification Centre',
            }),
          t &&
            e.jsx('div', {
              className: R.popupStackActive,
              style: { order: 0 },
              children: d
                .filter(l => l.id === t)
                .map((l, p) =>
                  e.jsx(
                    K,
                    {
                      popup: l,
                      index: 0,
                      isActive: !0,
                      onClick: () => o(l.id),
                      onDismiss: () => i(l.id),
                      maxVisible: n,
                    },
                    l.id
                  )
                ),
            }),
          e.jsx('div', {
            className: R.popupStackInactive,
            style: { order: c === 'bottom' ? 2 : 1 },
            children: d
              .filter(l => l.id !== t)
              .slice(0, n - 1)
              .map((l, p) =>
                e.jsx(
                  K,
                  {
                    popup: l,
                    index: p + 1,
                    isActive: !1,
                    onClick: () => o(l.id),
                    onDismiss: () => i(l.id),
                    maxVisible: n,
                  },
                  l.id
                )
              ),
          }),
          d.filter(l => l.id !== t).length > n - 1 &&
            e.jsxs('div', {
              className: R.popupStackMore,
              style: {
                textAlign: 'center',
                padding: '8px 0',
                color: '#8E8E93',
                fontSize: '12px',
                fontWeight: '500',
                order: c === 'bottom' ? 3 : 2,
              },
              children: [
                '+',
                d.filter(l => l.id !== t).length - (n - 1),
                ' ',
                'more',
              ],
            }),
        ],
      }),
    });
  },
  tn = 'Hotel Mui Ne',
  sn = 'AI-powered Voice Assistant - Supporting All Your Needs',
  nn = 'Tap To Speak',
  on = 'Room & Stay',
  an = 'Room Services',
  rn = 'Bookings & Facilities',
  cn = 'Tourism & Exploration',
  ln = 'Support to book external services',
  dn = 'Order Ref',
  mn = 'Requested At',
  un = 'Estimated Completion',
  pn = 'Time Remaining',
  gn = 'Mute',
  _n = 'Unmute',
  hn = 'Confirm',
  fn = 'Please speak to the assistant first.',
  xn = 'Tap to speak',
  bn = 'Order Summary',
  vn = 'Confirm',
  yn = 'Add Note',
  Nn = 'Room Number',
  jn = 'Enter room number',
  wn = 'Enter additional notes',
  $n = 'Summary',
  kn = 'Generated at',
  Cn = 'Order Confirmed!',
  Sn =
    'Your request has been confirmed and forwarded to our staff. They will process it right away.',
  Tn = 'Order Reference',
  Rn = 'Estimated delivery time:',
  In = 'Return to Home',
  An = 'Language',
  Dn = 'English',
  En = 'French',
  Pn = 'Send',
  Fn = 'Cancel',
  zn = 'End Call',
  Mn = 'Room',
  Bn = 'Order ID',
  Hn = 'Guest Name',
  Ln = 'Content',
  On = 'Time',
  qn = 'Status',
  Gn = 'Action',
  Vn = 'Message Guest',
  Wn = 'Staff Request Management',
  Un = 'Login',
  Yn = 'Username',
  Xn = 'Password',
  Kn = 'Tap the call button to start your request.',
  Qn = 'Review and confirm your request for accuracy.',
  Zn = 'Your request will be sent to the reception for processing.',
  Jn = 'Acknowledged',
  eo = 'In Progress',
  to = 'Delivering to You',
  so = 'Completed',
  no = 'Special Note',
  oo = 'Check-in/Check-out',
  ao = 'Extended Stay Request',
  ro = 'Room Information',
  io = 'Hotel Policies',
  co = 'Wi-Fi Services',
  lo = 'Room Service Food',
  mo = 'Drinks & Bar Service',
  uo = 'Room Cleaning',
  po = 'Laundry Service',
  go = 'Wake-up Call',
  _o = 'Additional Amenities',
  ho = 'Maintenance Request',
  fo = 'Restaurant Reservation',
  xo = 'Spa Services',
  bo = 'Fitness Center',
  vo = 'Swimming Pool',
  yo = 'Car Rental',
  No = 'Medical Assistance',
  jo = 'Customer Support',
  wo = 'Local Attractions',
  $o = 'Local Restaurants',
  ko = 'Public Transportation',
  Co = 'Local Events',
  So = 'Shopping Areas',
  To = 'Area Maps',
  Ro = 'Translation Services',
  Io = 'Leave a Review',
  Ao = 'Report an Issue',
  Do = 'Luggage Services',
  Eo = 'Generating your summary...',
  Po = 'Speak Multiple Languages with Our AI Voice Assistant',
  Fo = {
    hotel_name: tn,
    hotel_subtitle: sn,
    press_to_call: nn,
    room_and_stay: on,
    room_services: an,
    bookings_and_facilities: rn,
    tourism_and_exploration: cn,
    support_external_services: ln,
    order_ref: dn,
    requested_at: mn,
    estimated_completion: un,
    time_remaining: pn,
    mute: gn,
    unmute: _n,
    confirm: hn,
    need_conversation: fn,
    tap_to_speak: xn,
    order_summary: bn,
    send_to_reception: vn,
    add_note: yn,
    room_number: Nn,
    enter_room_number: jn,
    enter_notes: wn,
    summary: $n,
    generated_at: kn,
    order_confirmed: Cn,
    order_confirmed_message: Sn,
    order_reference: Tn,
    estimated_delivery_time: Rn,
    return_to_home: In,
    language: An,
    english: Dn,
    french: En,
    send: Pn,
    cancel: Fn,
    confirm_request: zn,
    room: Mn,
    order_id: Bn,
    guest_name: Hn,
    content: Ln,
    time: On,
    status: qn,
    action: Gn,
    message_guest: Vn,
    request_management: Wn,
    login: Un,
    username: Yn,
    password: Xn,
    press_to_call_desc: Kn,
    confirm_request_desc: Qn,
    send_to_reception_desc: Zn,
    status_acknowledged: Jn,
    status_in_progress: eo,
    status_delivering: to,
    status_completed: so,
    status_note: no,
    icon_login: oo,
    icon_hourglass_empty: ao,
    icon_info: ro,
    icon_policy: io,
    icon_wifi: co,
    icon_restaurant: lo,
    icon_local_bar: mo,
    icon_cleaning_services: uo,
    icon_local_laundry_service: po,
    icon_alarm: go,
    icon_add_circle: _o,
    icon_build: ho,
    icon_event_seat: fo,
    icon_spa: xo,
    icon_fitness_center: bo,
    icon_pool: vo,
    icon_directions_car: yo,
    icon_medical_services: No,
    icon_support_agent: jo,
    icon_location_on: wo,
    icon_local_dining: $o,
    icon_directions_bus: ko,
    icon_event: Co,
    icon_shopping_bag: So,
    icon_map: To,
    icon_translate: Ro,
    icon_rate_review: Io,
    icon_report_problem: Ao,
    icon_luggage: Do,
    generating_your_summary: Eo,
    speak_multiple_languages: Po,
  },
  zo = 'Bienvenue à Mi Nhon Hotel',
  Mo = 'Commencer',
  Bo = 'Langue',
  Ho = 'Anglais',
  Lo = 'Français',
  Oo = 'Envoyer',
  qo = 'Annuler',
  Go = 'Confirmer la demande',
  Vo = 'Chambre',
  Wo = 'ID de commande',
  Uo = 'Nom du client',
  Yo = 'Contenu',
  Xo = 'Heure',
  Ko = 'Statut',
  Qo = 'Action',
  Zo = 'Message au client',
  Jo = 'Gestion des demandes du personnel',
  ea = 'Connexion',
  ta = "Nom d'utilisateur",
  sa = 'Mot de passe',
  na = 'Hotel Mui Ne',
  oa = 'Assistant vocal IA - À votre service pour tous vos besoins',
  aa = 'Appuyez pour appeler',
  ra = 'Chambre & Séjour',
  ia = 'Services de chambre',
  ca = 'Réservations & Installations',
  la = 'Tourisme & Exploration',
  da = 'Assistance pour services externes',
  ma = 'Réf. commande',
  ua = 'Demandé à',
  pa = 'Fin estimée',
  ga = 'Temps restant',
  _a = 'Muet',
  ha = 'Rétablir le son',
  fa = 'Confirmer',
  xa = "Veuillez d'abord parler avec l'assistant.",
  ba = 'Appuyez pour parler',
  va = 'Récapitulatif de la commande',
  ya = 'Envoyer à la réception',
  Na = 'Ajouter une note',
  ja = 'Numéro de chambre',
  wa = 'Saisir le numéro de chambre',
  $a = 'Saisir des notes supplémentaires',
  ka = 'Résumé',
  Ca = 'Généré à',
  Sa = 'Commande confirmée !',
  Ta =
    'Votre demande a été confirmée et transmise à notre personnel. Elle sera traitée immédiatement.',
  Ra = 'Référence de la commande',
  Ia = 'Heure de livraison estimée :',
  Aa = "Retour à l'accueil",
  Da = "Appuyez sur le bouton d'appel pour démarrer votre demande.",
  Ea = 'Vérifiez et confirmez votre demande pour plus de précision.',
  Pa = 'Votre demande sera envoyée à la réception pour traitement.',
  Fa = 'Reçue',
  za = 'En cours',
  Ma = 'En livraison',
  Ba = 'Terminée',
  Ha = 'Note spéciale',
  La = 'Arrivée/Départ',
  Oa = 'Prolongation de séjour',
  qa = 'Informations sur la chambre',
  Ga = "Politiques de l'hôtel",
  Va = 'Services Wi-Fi',
  Wa = 'Service de restauration',
  Ua = 'Service de bar',
  Ya = 'Nettoyage de chambre',
  Xa = 'Service de blanchisserie',
  Ka = 'Service de réveil',
  Qa = 'Aménités supplémentaires',
  Za = 'Demande de maintenance',
  Ja = 'Réservation au restaurant',
  er = 'Services de spa',
  tr = 'Centre de fitness',
  sr = 'Piscine',
  nr = 'Location de voiture',
  or = 'Assistance médicale',
  ar = 'Service client',
  rr = 'Attractions locales',
  ir = 'Restaurants locaux',
  cr = 'Transports publics',
  lr = 'Événements locaux',
  dr = 'Zones commerciales',
  mr = 'Cartes de la région',
  ur = 'Services de traduction',
  pr = 'Laisser un avis',
  gr = 'Signaler un problème',
  _r = 'Services de bagagerie',
  hr = 'Génération de votre résumé...',
  fr = 'Parlez Plusieurs Langues avec Notre Assistant Vocal IA',
  xr = {
    welcome: zo,
    start: Mo,
    language: Bo,
    english: Ho,
    french: Lo,
    send: Oo,
    cancel: qo,
    confirm_request: Go,
    room: Vo,
    order_id: Wo,
    guest_name: Uo,
    content: Yo,
    time: Xo,
    status: Ko,
    action: Qo,
    message_guest: Zo,
    request_management: Jo,
    login: ea,
    username: ta,
    password: sa,
    hotel_name: na,
    hotel_subtitle: oa,
    press_to_call: aa,
    room_and_stay: ra,
    room_services: ia,
    bookings_and_facilities: ca,
    tourism_and_exploration: la,
    support_external_services: da,
    order_ref: ma,
    requested_at: ua,
    estimated_completion: pa,
    time_remaining: ga,
    mute: _a,
    unmute: ha,
    confirm: fa,
    need_conversation: xa,
    tap_to_speak: ba,
    order_summary: va,
    send_to_reception: ya,
    add_note: Na,
    room_number: ja,
    enter_room_number: wa,
    enter_notes: $a,
    summary: ka,
    generated_at: Ca,
    order_confirmed: Sa,
    order_confirmed_message: Ta,
    order_reference: Ra,
    estimated_delivery_time: Ia,
    return_to_home: Aa,
    press_to_call_desc: Da,
    confirm_request_desc: Ea,
    send_to_reception_desc: Pa,
    status_acknowledged: Fa,
    status_in_progress: za,
    status_delivering: Ma,
    status_completed: Ba,
    status_note: Ha,
    icon_login: La,
    icon_hourglass_empty: Oa,
    icon_info: qa,
    icon_policy: Ga,
    icon_wifi: Va,
    icon_restaurant: Wa,
    icon_local_bar: Ua,
    icon_cleaning_services: Ya,
    icon_local_laundry_service: Xa,
    icon_alarm: Ka,
    icon_add_circle: Qa,
    icon_build: Za,
    icon_event_seat: Ja,
    icon_spa: er,
    icon_fitness_center: tr,
    icon_pool: sr,
    icon_directions_car: nr,
    icon_medical_services: or,
    icon_support_agent: ar,
    icon_location_on: rr,
    icon_local_dining: ir,
    icon_directions_bus: cr,
    icon_event: lr,
    icon_shopping_bag: dr,
    icon_map: mr,
    icon_translate: ur,
    icon_rate_review: pr,
    icon_report_problem: gr,
    icon_luggage: _r,
    generating_your_summary: hr,
    speak_multiple_languages: fr,
  },
  br = '欢迎来到美农酒店 (Mi Nhon Hotel)',
  vr = '开始',
  yr = '语言',
  Nr = '英语',
  jr = '法语',
  wr = '发送',
  $r = '取消',
  kr = '确认请求',
  Cr = '房间',
  Sr = '订单编号',
  Tr = '客人姓名',
  Rr = '内容',
  Ir = '时间',
  Ar = '状态',
  Dr = '操作',
  Er = '给客人的消息',
  Pr = '员工请求管理',
  Fr = '登录',
  zr = '用户名',
  Mr = '密码',
  Br = '酒店 Mui Ne',
  Hr = 'AI语音助手 - 满足您的所有需求',
  Lr = '按下呼叫',
  Or = '房间与住宿',
  qr = '客房服务',
  Gr = '预订与设施',
  Vr = '旅游与探索',
  Wr = '支持外部服务',
  Ur = '订单参考',
  Yr = '请求时间',
  Xr = '预计完成时间',
  Kr = '剩余时间',
  Qr = '静音',
  Zr = '取消静音',
  Jr = '确认',
  ei = '请先与助手对话。',
  ti = '点击说话',
  si = '订单摘要',
  ni = '发送到前台',
  oi = '添加备注',
  ai = '房间号',
  ri = '输入房间号',
  ii = '输入附加备注',
  ci = '摘要',
  li = '生成时间',
  di = '订单已确认！',
  mi = '您的请求已确认并发送给我们的员工。我们会立即处理。',
  ui = '订单参考',
  pi = '预计送达时间：',
  gi = '返回首页',
  _i = '点击呼叫按钮开始您的请求。',
  hi = '请检查并确认您的请求以确保准确。',
  fi = '您的请求将被发送到前台进行处理。',
  xi = '已确认',
  bi = '处理中',
  vi = '配送中',
  yi = '已完成',
  Ni = '特别说明',
  ji = '入住/退房',
  wi = '延长住宿请求',
  $i = '房间信息',
  ki = '酒店政策',
  Ci = '无线网络服务',
  Si = '客房餐饮服务',
  Ti = '饮品与酒吧服务',
  Ri = '房间清洁',
  Ii = '洗衣服务',
  Ai = '唤醒服务',
  Di = '额外设施',
  Ei = '维修请求',
  Pi = '餐厅预订',
  Fi = '水疗服务',
  zi = '健身中心',
  Mi = '游泳池',
  Bi = '租车服务',
  Hi = '医疗援助',
  Li = '客户支持',
  Oi = '当地景点',
  qi = '当地餐厅',
  Gi = '公共交通',
  Vi = '当地活动',
  Wi = '购物区域',
  Ui = '区域地图',
  Yi = '翻译服务',
  Xi = '留下评论',
  Ki = '报告问题',
  Qi = '行李服务',
  Zi = '正在生成您的摘要...',
  Ji = {
    welcome: br,
    start: vr,
    language: yr,
    english: Nr,
    french: jr,
    send: wr,
    cancel: $r,
    confirm_request: kr,
    room: Cr,
    order_id: Sr,
    guest_name: Tr,
    content: Rr,
    time: Ir,
    status: Ar,
    action: Dr,
    message_guest: Er,
    request_management: Pr,
    login: Fr,
    username: zr,
    password: Mr,
    hotel_name: Br,
    hotel_subtitle: Hr,
    press_to_call: Lr,
    room_and_stay: Or,
    room_services: qr,
    bookings_and_facilities: Gr,
    tourism_and_exploration: Vr,
    support_external_services: Wr,
    order_ref: Ur,
    requested_at: Yr,
    estimated_completion: Xr,
    time_remaining: Kr,
    mute: Qr,
    unmute: Zr,
    confirm: Jr,
    need_conversation: ei,
    tap_to_speak: ti,
    order_summary: si,
    send_to_reception: ni,
    add_note: oi,
    room_number: ai,
    enter_room_number: ri,
    enter_notes: ii,
    summary: ci,
    generated_at: li,
    order_confirmed: di,
    order_confirmed_message: mi,
    order_reference: ui,
    estimated_delivery_time: pi,
    return_to_home: gi,
    press_to_call_desc: _i,
    confirm_request_desc: hi,
    send_to_reception_desc: fi,
    status_acknowledged: xi,
    status_in_progress: bi,
    status_delivering: vi,
    status_completed: yi,
    status_note: Ni,
    icon_login: ji,
    icon_hourglass_empty: wi,
    icon_info: $i,
    icon_policy: ki,
    icon_wifi: Ci,
    icon_restaurant: Si,
    icon_local_bar: Ti,
    icon_cleaning_services: Ri,
    icon_local_laundry_service: Ii,
    icon_alarm: Ai,
    icon_add_circle: Di,
    icon_build: Ei,
    icon_event_seat: Pi,
    icon_spa: Fi,
    icon_fitness_center: zi,
    icon_pool: Mi,
    icon_directions_car: Bi,
    icon_medical_services: Hi,
    icon_support_agent: Li,
    icon_location_on: Oi,
    icon_local_dining: qi,
    icon_directions_bus: Gi,
    icon_event: Vi,
    icon_shopping_bag: Wi,
    icon_map: Ui,
    icon_translate: Yi,
    icon_rate_review: Xi,
    icon_report_problem: Ki,
    icon_luggage: Qi,
    generating_your_summary: Zi,
  },
  ec = 'Добро пожаловать в отель Mi Nhon',
  tc = 'Начать',
  sc = 'Язык',
  nc = 'Английский',
  oc = 'Французский',
  ac = 'Русский',
  rc = 'Отправить',
  ic = 'Отмена',
  cc = 'Подтвердить запрос',
  lc = 'Номер',
  dc = 'ID заказа',
  mc = 'Имя гостя',
  uc = 'Содержание',
  pc = 'Время',
  gc = 'Статус',
  _c = 'Действие',
  hc = 'Сообщение гостю',
  fc = 'Управление запросами персонала',
  xc = 'Вход',
  bc = 'Имя пользователя',
  vc = 'Пароль',
  yc = 'Отель Mui Ne',
  Nc = 'ИИ-ассистент - Поддержка всех ваших потребностей',
  jc = 'Нажмите для звонка',
  wc = 'Номер и проживание',
  $c = 'Услуги номера',
  kc = 'Бронирование и удобства',
  Cc = 'Туризм и исследование',
  Sc = 'Поддержка внешних услуг',
  Tc = 'Ссылка на заказ',
  Rc = 'Запрошено в',
  Ic = 'Предполагаемое завершение',
  Ac = 'Оставшееся время',
  Dc = 'Без звука',
  Ec = 'Включить звук',
  Pc = 'Подтвердить',
  Fc = 'Пожалуйста, сначала поговорите с ассистентом.',
  zc = 'Нажмите, чтобы говорить',
  Mc = 'Сводка заказа',
  Bc = 'Отправить на ресепшен',
  Hc = 'Добавить заметку',
  Lc = 'Номер комнаты',
  Oc = 'Введите номер комнаты',
  qc = 'Введите дополнительные заметки',
  Gc = 'Сводка',
  Vc = 'Сгенерировано в',
  Wc = 'Заказ подтвержден!',
  Uc =
    'Ваш запрос подтвержден и передан нашему персоналу. Они обработают его немедленно.',
  Yc = 'Ссылка на заказ',
  Xc = 'Предполагаемое время доставки:',
  Kc = 'Вернуться на главную',
  Qc = 'Нажмите кнопку вызова, чтобы начать ваш запрос.',
  Zc = 'Проверьте и подтвердите ваш запрос для точности.',
  Jc = 'Ваш запрос будет отправлен на ресепшен для обработки.',
  el = 'Подтверждено',
  tl = 'В процессе',
  sl = 'Доставляется',
  nl = 'Завершено',
  ol = 'Особая заметка',
  al = 'Регистрация/Выселение',
  rl = 'Запрос на продление проживания',
  il = 'Информация о номере',
  cl = 'Правила отеля',
  ll = 'Wi-Fi услуги',
  dl = 'Ресторанное обслуживание номеров',
  ml = 'Напитки и бар',
  ul = 'Уборка номера',
  pl = 'Услуги прачечной',
  gl = 'Услуга будильника',
  _l = 'Дополнительные удобства',
  hl = 'Запрос на техническое обслуживание',
  fl = 'Бронирование ресторана',
  xl = 'СПА услуги',
  bl = 'Фитнес-центр',
  vl = 'Бассейн',
  yl = 'Аренда автомобиля',
  Nl = 'Медицинская помощь',
  jl = 'Поддержка клиентов',
  wl = 'Местные достопримечательности',
  $l = 'Местные рестораны',
  kl = 'Общественный транспорт',
  Cl = 'Местные мероприятия',
  Sl = 'Торговые зоны',
  Tl = 'Карты местности',
  Rl = 'Услуги перевода',
  Il = 'Оставить отзыв',
  Al = 'Сообщить о проблеме',
  Dl = 'Услуги багажа',
  El = 'Генерируется ваш итог...',
  Pl = {
    welcome: ec,
    start: tc,
    language: sc,
    english: nc,
    french: oc,
    russian: ac,
    send: rc,
    cancel: ic,
    confirm_request: cc,
    room: lc,
    order_id: dc,
    guest_name: mc,
    content: uc,
    time: pc,
    status: gc,
    action: _c,
    message_guest: hc,
    request_management: fc,
    login: xc,
    username: bc,
    password: vc,
    hotel_name: yc,
    hotel_subtitle: Nc,
    press_to_call: jc,
    room_and_stay: wc,
    room_services: $c,
    bookings_and_facilities: kc,
    tourism_and_exploration: Cc,
    support_external_services: Sc,
    order_ref: Tc,
    requested_at: Rc,
    estimated_completion: Ic,
    time_remaining: Ac,
    mute: Dc,
    unmute: Ec,
    confirm: Pc,
    need_conversation: Fc,
    tap_to_speak: zc,
    order_summary: Mc,
    send_to_reception: Bc,
    add_note: Hc,
    room_number: Lc,
    enter_room_number: Oc,
    enter_notes: qc,
    summary: Gc,
    generated_at: Vc,
    order_confirmed: Wc,
    order_confirmed_message: Uc,
    order_reference: Yc,
    estimated_delivery_time: Xc,
    return_to_home: Kc,
    press_to_call_desc: Qc,
    confirm_request_desc: Zc,
    send_to_reception_desc: Jc,
    status_acknowledged: el,
    status_in_progress: tl,
    status_delivering: sl,
    status_completed: nl,
    status_note: ol,
    icon_login: al,
    icon_hourglass_empty: rl,
    icon_info: il,
    icon_policy: cl,
    icon_wifi: ll,
    icon_restaurant: dl,
    icon_local_bar: ml,
    icon_cleaning_services: ul,
    icon_local_laundry_service: pl,
    icon_alarm: gl,
    icon_add_circle: _l,
    icon_build: hl,
    icon_event_seat: fl,
    icon_spa: xl,
    icon_fitness_center: bl,
    icon_pool: vl,
    icon_directions_car: yl,
    icon_medical_services: Nl,
    icon_support_agent: jl,
    icon_location_on: wl,
    icon_local_dining: $l,
    icon_directions_bus: kl,
    icon_event: Cl,
    icon_shopping_bag: Sl,
    icon_map: Tl,
    icon_translate: Rl,
    icon_rate_review: Il,
    icon_report_problem: Al,
    icon_luggage: Dl,
    generating_your_summary: El,
  },
  Fl = '미년 호텔에 오신 것을 환영합니다',
  zl = '시작',
  Ml = '언어',
  Bl = '영어',
  Hl = '프랑스어',
  Ll = '러시아어',
  Ol = '한국어',
  ql = '보내기',
  Gl = '취소',
  Vl = '요청 확인',
  Wl = '객실',
  Ul = '주문 ID',
  Yl = '투숙객 이름',
  Xl = '내용',
  Kl = '시간',
  Ql = '상태',
  Zl = '동작',
  Jl = '게스트에게 메시지 보내기',
  ed = '직원 요청 관리',
  td = '로그인',
  sd = '사용자 이름',
  nd = '비밀번호',
  od = '무이네 호텔',
  ad = 'AI 어시스턴트 - 모든 필요를 지원합니다',
  rd = '호출하려면 누르세요',
  id = '객실 및 숙박',
  cd = '객실 서비스',
  ld = '예약 및 시설',
  dd = '관광 및 탐험',
  md = '외부 서비스 지원',
  ud = '주문 참조',
  pd = '요청 시간',
  gd = '예상 완료 시간',
  _d = '남은 시간',
  hd = '음소거',
  fd = '음소거 해제',
  xd = '확인',
  bd = '먼저 어시스턴트와 대화해 주세요.',
  vd = '말하려면 누르세요',
  yd = '주문 요약',
  Nd = '프런트로 보내기',
  jd = '메모 추가',
  wd = '객실 번호',
  $d = '객실 번호를 입력하세요',
  kd = '추가 메모를 입력하세요',
  Cd = '요약',
  Sd = '생성 시간',
  Td = '주문이 확인되었습니다!',
  Rd = '귀하의 요청이 확인되어 직원에게 전달되었습니다. 즉시 처리하겠습니다.',
  Id = '주문 참조',
  Ad = '예상 배달 시간:',
  Dd = '홈으로 돌아가기',
  Ed = '요청을 시작하려면 호출 버튼을 누르세요.',
  Pd = '정확성을 위해 요청을 확인하세요.',
  Fd = '귀하의 요청이 프런트로 전송되어 처리됩니다.',
  zd = '접수됨',
  Md = '처리 중',
  Bd = '배달 중',
  Hd = '완료됨',
  Ld = '특별 안내',
  Od = '체크인/체크아웃',
  qd = '숙박 연장 요청',
  Gd = '객실 정보',
  Vd = '호텔 정책',
  Wd = '와이파이 서비스',
  Ud = '룸서비스 음식',
  Yd = '음료 및 바 서비스',
  Xd = '객실 청소',
  Kd = '세탁 서비스',
  Qd = '모닝콜 서비스',
  Zd = '추가 편의 시설',
  Jd = '유지보수 요청',
  em = '레스토랑 예약',
  tm = '스파 서비스',
  sm = '피트니스 센터',
  nm = '수영장',
  om = '렌터카',
  am = '의료 지원',
  rm = '고객 지원',
  im = '지역 명소',
  cm = '지역 레스토랑',
  lm = '대중교통',
  dm = '지역 이벤트',
  mm = '쇼핑 지역',
  um = '지역 지도',
  pm = '번역 서비스',
  gm = '리뷰 남기기',
  _m = '문제 신고',
  hm = '수화물 서비스',
  fm = '요약을 생성하는 중...',
  xm = {
    welcome: Fl,
    start: zl,
    language: Ml,
    english: Bl,
    french: Hl,
    russian: Ll,
    korean: Ol,
    send: ql,
    cancel: Gl,
    confirm_request: Vl,
    room: Wl,
    order_id: Ul,
    guest_name: Yl,
    content: Xl,
    time: Kl,
    status: Ql,
    action: Zl,
    message_guest: Jl,
    request_management: ed,
    login: td,
    username: sd,
    password: nd,
    hotel_name: od,
    hotel_subtitle: ad,
    press_to_call: rd,
    room_and_stay: id,
    room_services: cd,
    bookings_and_facilities: ld,
    tourism_and_exploration: dd,
    support_external_services: md,
    order_ref: ud,
    requested_at: pd,
    estimated_completion: gd,
    time_remaining: _d,
    mute: hd,
    unmute: fd,
    confirm: xd,
    need_conversation: bd,
    tap_to_speak: vd,
    order_summary: yd,
    send_to_reception: Nd,
    add_note: jd,
    room_number: wd,
    enter_room_number: $d,
    enter_notes: kd,
    summary: Cd,
    generated_at: Sd,
    order_confirmed: Td,
    order_confirmed_message: Rd,
    order_reference: Id,
    estimated_delivery_time: Ad,
    return_to_home: Dd,
    press_to_call_desc: Ed,
    confirm_request_desc: Pd,
    send_to_reception_desc: Fd,
    status_acknowledged: zd,
    status_in_progress: Md,
    status_delivering: Bd,
    status_completed: Hd,
    status_note: Ld,
    icon_login: Od,
    icon_hourglass_empty: qd,
    icon_info: Gd,
    icon_policy: Vd,
    icon_wifi: Wd,
    icon_restaurant: Ud,
    icon_local_bar: Yd,
    icon_cleaning_services: Xd,
    icon_local_laundry_service: Kd,
    icon_alarm: Qd,
    icon_add_circle: Zd,
    icon_build: Jd,
    icon_event_seat: em,
    icon_spa: tm,
    icon_fitness_center: sm,
    icon_pool: nm,
    icon_directions_car: om,
    icon_medical_services: am,
    icon_support_agent: rm,
    icon_location_on: im,
    icon_local_dining: cm,
    icon_directions_bus: lm,
    icon_event: dm,
    icon_shopping_bag: mm,
    icon_map: um,
    icon_translate: pm,
    icon_rate_review: gm,
    icon_report_problem: _m,
    icon_luggage: hm,
    generating_your_summary: fm,
  },
  bm = 'Khách sạn Mui Ne',
  vm = 'Trợ lý giọng nói AI - Hỗ trợ mọi nhu cầu của bạn',
  ym = 'Nhấn để nói',
  Nm = 'Phòng & Lưu trú',
  jm = 'Dịch vụ phòng',
  wm = 'Đặt chỗ & Tiện ích',
  $m = 'Du lịch & Khám phá',
  km = 'Hỗ trợ đặt dịch vụ bên ngoài',
  Cm = 'Mã đơn',
  Sm = 'Thời gian yêu cầu',
  Tm = 'Dự kiến hoàn thành',
  Rm = 'Thời gian còn lại',
  Im = 'Tắt mic',
  Am = 'Bật mic',
  Dm = 'Xác nhận',
  Em = 'Vui lòng nói chuyện với trợ lý trước.',
  Pm = 'Chạm để nói',
  Fm = 'Tóm tắt đơn hàng',
  zm = 'Xác nhận',
  Mm = 'Thêm ghi chú',
  Bm = 'Số phòng',
  Hm = 'Nhập số phòng',
  Lm = 'Nhập ghi chú bổ sung',
  Om = 'Tóm tắt',
  qm = 'Tạo lúc',
  Gm = 'Đã xác nhận đơn!',
  Vm =
    'Yêu cầu của bạn đã được xác nhận và chuyển đến nhân viên. Chúng tôi sẽ xử lý ngay lập tức.',
  Wm = 'Mã tham chiếu',
  Um = 'Thời gian giao dự kiến:',
  Ym = 'Về trang chủ',
  Xm = 'Ngôn ngữ',
  Km = 'Tiếng Anh',
  Qm = 'Tiếng Pháp',
  Zm = 'Gửi',
  Jm = 'Hủy',
  eu = 'Kết thúc cuộc gọi',
  tu = 'Phòng',
  su = 'Mã đơn',
  nu = 'Tên khách',
  ou = 'Nội dung',
  au = 'Thời gian',
  ru = 'Trạng thái',
  iu = 'Hành động',
  cu = 'Nhắn khách',
  lu = 'Quản lý yêu cầu nhân viên',
  du = 'Đăng nhập',
  mu = 'Tên đăng nhập',
  uu = 'Mật khẩu',
  pu = 'Nhấn nút gọi để bắt đầu yêu cầu của bạn.',
  gu = 'Xem lại và xác nhận yêu cầu của bạn.',
  _u = 'Yêu cầu của bạn sẽ được gửi đến lễ tân để xử lý.',
  hu = 'Đã ghi nhận',
  fu = 'Đang xử lý',
  xu = 'Đang giao cho bạn',
  bu = 'Đã hoàn thành',
  vu = 'Lưu ý đặc biệt',
  yu = 'Nhận/Trả phòng',
  Nu = 'Yêu cầu gia hạn lưu trú',
  ju = 'Thông tin phòng',
  wu = 'Chính sách khách sạn',
  $u = 'Dịch vụ Wi-Fi',
  ku = 'Đồ ăn tại phòng',
  Cu = 'Dịch vụ đồ uống & quầy bar',
  Su = 'Dọn phòng',
  Tu = 'Giặt là',
  Ru = 'Báo thức',
  Iu = 'Tiện ích bổ sung',
  Au = 'Yêu cầu bảo trì',
  Du = 'Đặt chỗ nhà hàng',
  Eu = 'Dịch vụ Spa',
  Pu = 'Trung tâm thể hình',
  Fu = 'Hồ bơi',
  zu = 'Thuê xe',
  Mu = 'Hỗ trợ y tế',
  Bu = 'Chăm sóc khách hàng',
  Hu = 'Điểm tham quan',
  Lu = 'Nhà hàng địa phương',
  Ou = 'Phương tiện công cộng',
  qu = 'Sự kiện địa phương',
  Gu = 'Khu mua sắm',
  Vu = 'Bản đồ khu vực',
  Wu = 'Dịch vụ phiên dịch',
  Uu = 'Đánh giá',
  Yu = 'Báo sự cố',
  Xu = 'Dịch vụ hành lý',
  Ku = 'Đang tạo tóm tắt của bạn...',
  Qu = 'Nói Nhiều Ngôn Ngữ với Trợ Lý AI của Chúng Tôi',
  Zu = {
    hotel_name: bm,
    hotel_subtitle: vm,
    press_to_call: ym,
    room_and_stay: Nm,
    room_services: jm,
    bookings_and_facilities: wm,
    tourism_and_exploration: $m,
    support_external_services: km,
    order_ref: Cm,
    requested_at: Sm,
    estimated_completion: Tm,
    time_remaining: Rm,
    mute: Im,
    unmute: Am,
    confirm: Dm,
    need_conversation: Em,
    tap_to_speak: Pm,
    order_summary: Fm,
    send_to_reception: zm,
    add_note: Mm,
    room_number: Bm,
    enter_room_number: Hm,
    enter_notes: Lm,
    summary: Om,
    generated_at: qm,
    order_confirmed: Gm,
    order_confirmed_message: Vm,
    order_reference: Wm,
    estimated_delivery_time: Um,
    return_to_home: Ym,
    language: Xm,
    english: Km,
    french: Qm,
    send: Zm,
    cancel: Jm,
    confirm_request: eu,
    room: tu,
    order_id: su,
    guest_name: nu,
    content: ou,
    time: au,
    status: ru,
    action: iu,
    message_guest: cu,
    request_management: lu,
    login: du,
    username: mu,
    password: uu,
    press_to_call_desc: pu,
    confirm_request_desc: gu,
    send_to_reception_desc: _u,
    status_acknowledged: hu,
    status_in_progress: fu,
    status_delivering: xu,
    status_completed: bu,
    status_note: vu,
    icon_login: yu,
    icon_hourglass_empty: Nu,
    icon_info: ju,
    icon_policy: wu,
    icon_wifi: $u,
    icon_restaurant: ku,
    icon_local_bar: Cu,
    icon_cleaning_services: Su,
    icon_local_laundry_service: Tu,
    icon_alarm: Ru,
    icon_add_circle: Iu,
    icon_build: Au,
    icon_event_seat: Du,
    icon_spa: Eu,
    icon_fitness_center: Pu,
    icon_pool: Fu,
    icon_directions_car: zu,
    icon_medical_services: Mu,
    icon_support_agent: Bu,
    icon_location_on: Hu,
    icon_local_dining: Lu,
    icon_directions_bus: Ou,
    icon_event: qu,
    icon_shopping_bag: Gu,
    icon_map: Vu,
    icon_translate: Wu,
    icon_rate_review: Uu,
    icon_report_problem: Yu,
    icon_luggage: Xu,
    generating_your_summary: Ku,
    speak_multiple_languages: Qu,
  },
  Ju = { en: Fo, fr: xr, zh: Ji, ru: Pl, ko: xm, vi: Zu };
function B(s, t = 'en') {
  return Ju[t][s] || s;
}
const ep = () =>
    e.jsxs('div', {
      style: { padding: '16px', minHeight: '200px' },
      children: [
        e.jsxs('div', {
          style: { marginBottom: '16px' },
          children: [
            e.jsx('h3', {
              style: {
                color: '#1F2937',
                marginBottom: '8px',
                fontSize: '18px',
              },
              children: '🎤 Realtime Conversation',
            }),
            e.jsx('p', {
              style: { color: '#6B7280', fontSize: '14px', lineHeight: '1.5' },
              children:
                'This is the new iOS-style popup system! Voice conversation content will appear here when a call is active.',
            }),
          ],
        }),
        e.jsxs('div', {
          style: {
            background: '#F3F4F6',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
          },
          children: [
            e.jsxs('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              },
              children: [
                e.jsx('div', {
                  style: {
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  },
                  children: 'U',
                }),
                e.jsx('span', {
                  style: { fontSize: '14px', color: '#374151' },
                  children: 'Guest',
                }),
              ],
            }),
            e.jsx('p', {
              style: { margin: 0, fontSize: '14px', color: '#111827' },
              children: '"Hi, I need room service please"',
            }),
          ],
        }),
        e.jsxs('div', {
          style: {
            background: '#ECFDF5',
            borderRadius: '8px',
            padding: '12px',
          },
          children: [
            e.jsxs('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              },
              children: [
                e.jsx('div', {
                  style: {
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  },
                  children: 'A',
                }),
                e.jsx('span', {
                  style: { fontSize: '14px', color: '#374151' },
                  children: 'Assistant',
                }),
              ],
            }),
            e.jsx('p', {
              style: { margin: 0, fontSize: '14px', color: '#111827' },
              children: `"Of course! I'd be happy to help you with room service. What would you like to order?"`,
            }),
          ],
        }),
      ],
    }),
  tp = () =>
    e.jsxs('div', {
      style: { padding: '16px' },
      children: [
        e.jsxs('div', {
          style: { marginBottom: '12px' },
          children: [
            e.jsx('h4', {
              style: {
                color: '#1F2937',
                marginBottom: '8px',
                fontSize: '16px',
              },
              children: '🏊‍♂️ Pool Maintenance Notice',
            }),
            e.jsx('p', {
              style: {
                color: '#6B7280',
                fontSize: '14px',
                lineHeight: '1.5',
                margin: 0,
              },
              children:
                'The hotel pool will be temporarily closed for routine maintenance from 2:00 PM to 4:00 PM today.',
            }),
          ],
        }),
        e.jsx('div', {
          style: {
            background: '#FEF3C7',
            border: '1px solid #F59E0B',
            borderRadius: '6px',
            padding: '8px 12px',
          },
          children: e.jsx('p', {
            style: {
              margin: 0,
              fontSize: '13px',
              color: '#92400E',
              fontWeight: '500',
            },
            children: '⚠️ We apologize for any inconvenience caused.',
          }),
        }),
      ],
    }),
  sp = () =>
    e.jsxs('div', {
      style: { padding: '16px' },
      children: [
        e.jsxs('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          },
          children: [
            e.jsx('div', {
              style: {
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
              },
              children: '⚠️',
            }),
            e.jsxs('div', {
              children: [
                e.jsx('h4', {
                  style: { color: '#1F2937', margin: 0, fontSize: '16px' },
                  children: 'System Alert',
                }),
                e.jsx('p', {
                  style: { color: '#6B7280', margin: 0, fontSize: '13px' },
                  children: 'High Priority',
                }),
              ],
            }),
          ],
        }),
        e.jsx('p', {
          style: {
            color: '#374151',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '12px',
          },
          children:
            'Connection to voice service temporarily unstable. Please try again in a few moments.',
        }),
        e.jsxs('div', {
          style: { display: 'flex', gap: '8px' },
          children: [
            e.jsx('button', {
              style: {
                background: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              },
              children: 'Retry',
            }),
            e.jsx('button', {
              style: {
                background: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              },
              children: 'Dismiss',
            }),
          ],
        }),
      ],
    }),
  V = () => {
    const {
        callSummary: s,
        serviceRequests: t,
        language: n,
        callDetails: o,
      } = q(),
      c = (() => {
        if (s && s.content) {
          const d = Ns(s.content),
            l = js(s.content);
          return {
            source: 'Vapi.ai',
            roomNumber: d || 'Unknown',
            content: s.content,
            items: l.items || [],
            timestamp: s.timestamp,
            hasData: !0,
          };
        }
        return t && t.length > 0
          ? {
              source: 'OpenAI Enhanced',
              roomNumber: t[0]?.details?.roomNumber || 'Unknown',
              content: t.map(l => `${l.serviceType}: ${l.requestText}`).join(`
`),
              items: t.map(l => ({
                name: l.serviceType,
                description: l.requestText,
                quantity: 1,
                price: 10,
              })),
              timestamp: new Date(),
              hasData: !0,
            }
          : {
              source: 'No data',
              roomNumber: o?.roomNumber || 'Unknown',
              content: 'Call summary not available yet',
              items: [],
              timestamp: new Date(),
              hasData: !1,
            };
      })();
    return e.jsxs('div', {
      className: 'space-y-3',
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between text-xs',
          children: [
            e.jsxs('span', {
              className: 'font-medium text-green-700',
              children: ['📋 ', B('summary', n)],
            }),
            e.jsx('span', {
              className: 'text-gray-500 text-[10px]',
              children: c.source,
            }),
          ],
        }),
        c.hasData
          ? e.jsxs(e.Fragment, {
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-2 gap-2 text-xs',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('span', {
                          className: 'font-medium text-gray-600',
                          children: 'Room:',
                        }),
                        e.jsx('span', {
                          className: 'ml-1 font-semibold text-blue-800',
                          children: c.roomNumber,
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('span', {
                          className: 'font-medium text-gray-600',
                          children: 'Items:',
                        }),
                        e.jsx('span', {
                          className: 'ml-1 font-semibold text-green-700',
                          children: c.items.length,
                        }),
                      ],
                    }),
                  ],
                }),
                c.items.length > 0 &&
                  e.jsxs('div', {
                    className: 'space-y-1',
                    children: [
                      e.jsx('div', {
                        className: 'text-[11px] font-medium text-gray-600',
                        children: 'Requests:',
                      }),
                      e.jsxs('div', {
                        className: 'space-y-1 max-h-16 overflow-y-auto',
                        children: [
                          c.items
                            .slice(0, 3)
                            .map((d, l) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center gap-2 text-[10px]',
                                  children: [
                                    e.jsx('span', {
                                      className:
                                        'w-1 h-1 bg-green-500 rounded-full flex-shrink-0',
                                    }),
                                    e.jsx('span', {
                                      className: 'text-gray-700 truncate',
                                      children: d.name,
                                    }),
                                  ],
                                },
                                l
                              )
                            ),
                          c.items.length > 3 &&
                            e.jsxs('div', {
                              className: 'text-[10px] text-gray-500 italic',
                              children: [
                                '+',
                                c.items.length - 3,
                                ' more items...',
                              ],
                            }),
                        ],
                      }),
                    ],
                  }),
                e.jsx('div', {
                  className: 'text-[10px] text-gray-400 text-right',
                  children: c.timestamp.toLocaleTimeString(),
                }),
              ],
            })
          : e.jsxs('div', {
              className: 'text-center py-2 text-gray-500',
              children: [
                e.jsx('div', {
                  className: 'text-xs',
                  children: '⏳ Processing call summary...',
                }),
                e.jsx('div', {
                  className: 'text-[10px] mt-1',
                  children: 'Please wait a moment',
                }),
              ],
            }),
      ],
    });
  },
  kg = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        AlertDemoContent: sp,
        ConversationDemoContent: ep,
        NotificationDemoContent: tp,
        SummaryPopupContent: V,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  np = ({
    position: s = 'bottom',
    maxVisible: t = 4,
    autoCloseDelay: n,
    isMobile: o = !1,
  }) => {
    const {
      popups: i,
      activePopup: c,
      setActivePopup: d,
      removePopup: l,
    } = G();
    a.useEffect(() => {
      if (!n) return;
      const g = [];
      return (
        i.forEach(f => {
          if (f.priority === 'low') {
            const j = setTimeout(() => {
              l(f.id);
            }, n);
            g.push(j);
          }
        }),
        () => {
          g.forEach(f => clearTimeout(f));
        }
      );
    }, [i, n, l]);
    const p = g => {
        d(c === g ? null : g);
      },
      m = g => {
        if ((l(g), c === g && i.length > 1)) {
          const f = i.filter(j => j.id !== g);
          f.length > 0 && d(f[0].id);
        }
      },
      u = i.filter(g => g.type !== 'summary');
    return e.jsxs(e.Fragment, {
      children: [
        u.length > 0 &&
          e.jsx(en, {
            popups: u,
            activePopup: c,
            maxVisible: t,
            onPopupSelect: p,
            onPopupDismiss: m,
            position: s,
          }),
        e.jsx('style', {
          children: `
        @keyframes modalSlideIn {
          from {
            transform: scale(0.95) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `,
        }),
      ],
    });
  },
  Cg = () => {
    const { addPopup: s, removePopup: t, setActivePopup: n } = G();
    return {
      showConversation: (m, u) =>
        s({
          type: 'conversation',
          title: u?.title || 'Realtime Conversation',
          content: m,
          priority: u?.priority || 'high',
          isActive: !0,
          badge: u?.badge,
        }),
      showStaffMessage: (m, u) =>
        s({
          type: 'staff',
          title: u?.title || 'Staff Message',
          content: m,
          priority: u?.priority || 'medium',
          isActive: !1,
          badge: u?.badge,
        }),
      showNotification: (m, u) =>
        s({
          type: 'notification',
          title: u?.title || 'Hotel Notification',
          content: m,
          priority: u?.priority || 'low',
          isActive: !1,
          badge: u?.badge,
        }),
      showAlert: (m, u) =>
        s({
          type: 'alert',
          title: u?.title || 'System Alert',
          content: m,
          priority: u?.priority || 'high',
          isActive: !0,
          badge: u?.badge,
        }),
      showOrderUpdate: (m, u) =>
        s({
          type: 'order',
          title: u?.title || 'Order Update',
          content: m,
          priority: u?.priority || 'medium',
          isActive: !1,
          badge: u?.badge,
        }),
      showSummary: (m, u) =>
        s({
          type: 'summary',
          title: u?.title || 'Call Summary',
          content: m || e.jsx(V, {}),
          priority: u?.priority || 'high',
          isActive: !1,
        }),
      removePopup: t,
      setActivePopup: n,
    };
  },
  N = {
    colors: { primary: '#1B4E8B', secondary: '#3B82F6', error: '#EF4444' },
    fonts: {
      primary:
        "'Inter', 'Poppins', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    spacing: { xl: '40px' },
    shadows: { card: '0 4px 16px rgba(0, 0, 0, 0.15)' },
    transitions: { normal: '0.3s ease-in-out' },
  },
  op = {
    SCROLL_THRESHOLD: 300,
    THROTTLE_DELAY: 100,
    AUTO_SCROLL_DELAY: 300,
    COLORS: { BACKGROUND: '#2C3E50' },
    SCROLL_OFFSETS: { NEGATIVE_TOP_THRESHOLD: -100 },
  },
  Qe = ({ children: s, className: t = '' }) =>
    e.jsx('div', {
      className: `relative min-h-screen w-full scroll-smooth overflow-y-auto ${t}`,
      style: {
        fontFamily: N.fonts.primary,
        backgroundColor: op.COLORS.BACKGROUND,
      },
      children: e.jsx('div', {
        className: 'container mx-auto px-4 py-8 relative z-10',
        children: e.jsx('div', {
          className:
            'flex flex-col items-center justify-center space-y-8 md:space-y-12',
          children: s,
        }),
      }),
    }),
  Ze = () =>
    e.jsx('div', {
      className: 'w-full flex justify-center items-center py-8',
      children: e.jsx('h1', {
        className:
          'hidden sm:block text-3xl md:text-4xl font-bold text-white text-center',
        style: {
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        },
        children: 'Speak in Multiple Languages',
      }),
    }),
  ap = ({ error: s, onRetry: t }) => {
    const n = () => {
      try {
        (localStorage.removeItem('conversationState'),
          sessionStorage.removeItem('interface1State'),
          window.scrollTo({ top: 0, behavior: 'smooth' }),
          t ? t() : window.location.reload());
      } catch (o) {
        ($.error('Failed to reset Interface1', 'Interface1ErrorFallback', o),
          window.location.reload());
      }
    };
    return e.jsx(Qe, {
      children: e.jsxs('div', {
        className: 'relative',
        children: [
          e.jsx(Ze, {}),
          e.jsx('div', {
            className:
              'relative min-h-[400px] px-4 flex items-center justify-center',
            children: e.jsxs('div', {
              className:
                'max-w-md text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20',
              children: [
                e.jsx('div', { className: 'text-6xl mb-4', children: '🤖' }),
                e.jsx('h2', {
                  className: 'text-2xl font-bold text-white mb-4',
                  children: 'Trợ lý tạm thời gặp sự cố',
                }),
                e.jsx('p', {
                  className: 'text-white/80 mb-6',
                  children:
                    'Đừng lo lắng! Chúng tôi sẽ khôi phục trợ lý về trạng thái ban đầu.',
                }),
                e.jsxs('div', {
                  className: 'space-y-3',
                  children: [
                    e.jsx('button', {
                      onClick: n,
                      className:
                        'w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-all duration-200 active:scale-95',
                      children: '🔄 Khôi phục trợ lý',
                    }),
                    e.jsx('button', {
                      onClick: () => (window.location.href = '/'),
                      className:
                        'w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition-all duration-200 active:scale-95',
                      children: '🏠 Về trang chủ',
                    }),
                  ],
                }),
                s &&
                  e.jsxs('details', {
                    className: 'mt-6 text-left',
                    children: [
                      e.jsx('summary', {
                        className:
                          'cursor-pointer text-sm text-white/60 hover:text-white/80',
                        children: 'Chi tiết kỹ thuật',
                      }),
                      e.jsx('pre', {
                        className:
                          'mt-2 p-3 bg-black/20 rounded text-xs text-white/70 overflow-auto max-h-32',
                        children: s.toString(),
                      }),
                    ],
                  }),
              ],
            }),
          }),
        ],
      }),
    });
  },
  rp = () =>
    e.jsx('div', {
      className:
        'absolute w-full min-h-screen h-full flex items-center justify-center z-10',
      style: {
        background: `linear-gradient(135deg, ${N.colors.primary}, ${N.colors.secondary})`,
        fontFamily: N.fonts.primary,
      },
      children: e.jsxs('div', {
        className: 'text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl',
        style: { boxShadow: N.shadows.card },
        children: [
          e.jsx('div', {
            className:
              'animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto mb-6',
            style: { width: '64px', height: '64px' },
          }),
          e.jsx('p', {
            className: 'text-white text-lg font-medium',
            children: 'Loading hotel configuration...',
          }),
        ],
      }),
    }),
  ip = ({ error: s }) =>
    e.jsx('div', {
      className:
        'absolute w-full min-h-screen h-full flex items-center justify-center z-10',
      style: {
        background: `linear-gradient(135deg, ${N.colors.primary}, ${N.colors.error})`,
        fontFamily: N.fonts.primary,
      },
      children: e.jsxs('div', {
        className: 'text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl',
        style: { boxShadow: N.shadows.card },
        children: [
          e.jsx('div', {
            className: 'text-white text-xl font-semibold mb-4',
            children: 'Failed to load hotel configuration',
          }),
          e.jsx('p', { className: 'text-white/80', children: s }),
        ],
      }),
    }),
  E = [
    {
      name: 'Room Service',
      icon: ft,
      description: 'In-room dining and housekeeping services',
    },
    {
      name: 'Restaurant',
      icon: xt,
      description: 'Hotel restaurants and dining options',
    },
    { name: 'Concierge', icon: Y, description: 'Concierge and guest services' },
    {
      name: 'Pool & Gym',
      icon: bt,
      description: 'Swimming pool and fitness facilities',
    },
    {
      name: 'Spa & Wellness',
      icon: vt,
      description: 'Spa treatments and wellness services',
    },
    { name: 'Bar & Lounge', icon: yt, description: 'Hotel bars and lounges' },
    {
      name: 'Transportation',
      icon: Nt,
      description: 'Transportation and taxi services',
    },
    {
      name: 'Local Guide',
      icon: jt,
      description: 'Local area guide and information',
    },
    {
      name: 'Reception',
      icon: wt,
      description: 'Front desk and reception services',
    },
    {
      name: 'Guest Services',
      icon: Y,
      description: 'Additional guest services',
    },
  ],
  cp = () =>
    e.jsxs('div', {
      className: 'w-full max-w-full',
      children: [
        e.jsx('div', {
          className: 'block md:hidden space-y-4 px-4 py-6',
          children: E.map((s, t) => {
            const n = s.icon;
            return e.jsxs(
              'div',
              {
                className: 'flex items-center space-x-4 p-4 rounded-xl',
                style: {
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: N.transitions.normal,
                  cursor: 'pointer',
                  boxShadow: N.shadows.card,
                },
                children: [
                  e.jsx('div', {
                    className: 'text-white flex-shrink-0',
                    children: e.jsx(n, { size: 32 }),
                  }),
                  e.jsxs('div', {
                    className: 'text-white',
                    children: [
                      e.jsx('div', {
                        className: 'font-medium text-lg',
                        children: s.name,
                      }),
                      s.description &&
                        e.jsx('div', {
                          className: 'text-sm text-gray-300 mt-1',
                          children: s.description,
                        }),
                    ],
                  }),
                ],
              },
              t
            );
          }),
        }),
        e.jsxs('div', {
          className: 'hidden md:block w-full max-w-6xl mx-auto px-6 py-8',
          children: [
            e.jsx('div', {
              className: 'grid grid-cols-5 gap-4 mb-4',
              children: E.slice(0, 5).map((s, t) => {
                const n = s.icon;
                return e.jsxs(
                  'div',
                  {
                    className:
                      'relative group w-full h-32 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105',
                    style: {
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: N.shadows.card,
                    },
                    children: [
                      e.jsx('div', {
                        className: 'text-white mb-2',
                        children: e.jsx(n, { size: 28 }),
                      }),
                      e.jsx('div', {
                        className: 'text-white text-center text-sm font-medium',
                        children: s.name,
                      }),
                      s.description &&
                        e.jsx('div', {
                          className:
                            'absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-white text-xs text-center rounded-xl',
                          children: s.description,
                        }),
                    ],
                  },
                  t
                );
              }),
            }),
            E.length > 5 &&
              e.jsx('div', {
                className: 'grid grid-cols-5 gap-4',
                children: E.slice(5).map((s, t) => {
                  const n = s.icon;
                  return e.jsxs(
                    'div',
                    {
                      className:
                        'relative group w-full h-32 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105',
                      style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: N.shadows.card,
                      },
                      children: [
                        e.jsx('div', {
                          className: 'text-white mb-2',
                          children: e.jsx(n, { size: 28 }),
                        }),
                        e.jsx('div', {
                          className:
                            'text-white text-center text-sm font-medium',
                          children: s.name,
                        }),
                        s.description &&
                          e.jsx('div', {
                            className:
                              'absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-white text-xs text-center rounded-xl',
                            children: s.description,
                          }),
                      ],
                    },
                    t + 5
                  );
                }),
              }),
          ],
        }),
      ],
    }),
  Je = a.forwardRef(({ className: s = '' }, t) =>
    e.jsx('div', {
      ref: t,
      className: `w-full max-w-full hidden md:block ${s}`,
      children: e.jsx(cp, {}),
    })
  );
Je.displayName = 'ServiceGridContainer';
const Q = ({
    isOpen: s,
    onClose: t,
    layout: n = 'overlay',
    className: o = '',
  }) => {
    const {
        transcripts: i,
        modelOutput: c,
        language: d,
        callDuration: l,
      } = q(),
      p = a.useRef(null),
      m = a.useRef({}),
      [u, g] = a.useState(!1),
      [f, j] = a.useState({}),
      [_, y] = a.useState([]);
    a.useEffect(() => {
      s && !u ? g(!0) : s || g(!1);
    }, [s, u]);
    const U = () => {
      (Object.values(m.current).forEach(w => {
        w && cancelAnimationFrame(w);
      }),
        (m.current = {}));
    };
    if (
      (a.useEffect(() => U, []),
      a.useEffect(() => {
        if (!i || i.length === 0) {
          y([]);
          return;
        }
        const w = [...i].sort(
            (h, D) => h.timestamp.getTime() - D.timestamp.getTime()
          ),
          x = [];
        let b = null;
        (w.forEach(h => {
          h.role === 'user'
            ? ((b = {
                id: h.id.toString(),
                role: 'user',
                timestamp: h.timestamp,
                messages: [
                  {
                    id: h.id.toString(),
                    content: h.content,
                    timestamp: h.timestamp,
                  },
                ],
              }),
              x.push(b))
            : ((!b || b.role === 'user') &&
                ((b = {
                  id: h.id.toString(),
                  role: 'assistant',
                  timestamp: h.timestamp,
                  messages: [],
                }),
                x.push(b)),
              b.messages.push({
                id: h.id.toString(),
                content: h.content,
                timestamp: h.timestamp,
              }));
        }),
          y(x));
      }, [i]),
      a.useEffect(() => {
        _.filter(x => x.role === 'assistant')
          .flatMap(x => x.messages)
          .forEach(x => {
            if (!f[x.id]) {
              j(h => ({ ...h, [x.id]: 0 }));
              const b = () => {
                j(h => {
                  const D = h[x.id] || 0;
                  if (D < x.content.length) {
                    const _t = requestAnimationFrame(b);
                    return ((m.current[x.id] = _t), { ...h, [x.id]: D + 1 });
                  } else return (delete m.current[x.id], h);
                });
              };
              setTimeout(b, 100);
            }
          });
      }, [_]),
      a.useEffect(() => {
        p.current && (p.current.scrollTop = p.current.scrollHeight);
      }, [_]),
      !s)
    )
      return null;
    const k = n === 'grid',
      S = a.useMemo(
        () =>
          k
            ? {
                width: '100%',
                maxWidth: '100%',
                height: '320px',
                maxHeight: '320px',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                borderRadius: 16,
                marginBottom: 0,
              }
            : {
                width: '100%',
                maxWidth: `${hs}px`,
                height: `${_s}px`,
                maxHeight: `${gs}vh`,
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1.5px solid rgba(255,255,255,0.25)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                marginBottom: 0,
              },
        [k]
      ),
      T = () =>
        e.jsxs('div', {
          className: `relative z-30 overflow-hidden shadow-2xl chat-popup ${k ? 'grid-layout' : 'overlay-layout'} ${!k && u ? 'mx-auto animate-slide-up' : 'mx-auto'}`,
          style: S,
          children: [
            e.jsxs('div', {
              className:
                'flex items-center justify-between px-4 py-2 border-b border-gray-200/40 bg-white/10',
              style: { backdropFilter: 'blur(4px)' },
              children: [
                e.jsx('div', {
                  className: 'flex items-center space-x-2',
                  children: e.jsxs('span', {
                    className: 'text-sm font-medium text-gray-700',
                    children: ['💬 ', B('chat', d)],
                  }),
                }),
                e.jsx('button', {
                  onClick: t,
                  className:
                    'p-1.5 hover:bg-gray-100 rounded-full transition-colors',
                  children: e.jsx(I, { className: 'w-4 h-4 text-gray-500' }),
                }),
              ],
            }),
            e.jsxs('div', {
              ref: p,
              className: 'px-3 py-2 h-[calc(100%-3rem)] overflow-y-auto',
              children: [
                _.length === 0 &&
                  e.jsx('div', {
                    className:
                      'text-gray-400 text-base text-center select-none',
                    style: { opacity: 0.7 },
                    children: B('tap_to_speak', d),
                  }),
                _.map((w, x) =>
                  e.jsx(
                    'div',
                    {
                      className: 'mb-2',
                      children: e.jsx('div', {
                        className: 'flex items-start gap-2',
                        children: e.jsxs('div', {
                          className: 'flex-1',
                          children: [
                            w.role === 'user'
                              ? e.jsx('div', {
                                  className: 'bg-gray-100 rounded-lg p-2',
                                  children: e.jsx('p', {
                                    className: 'text-gray-800 text-sm',
                                    children: w.messages[0].content,
                                  }),
                                })
                              : e.jsx('div', {
                                  className: 'space-y-1',
                                  children: w.messages.map((b, h) =>
                                    e.jsx(
                                      'div',
                                      {
                                        className: 'bg-blue-50 rounded-lg p-2',
                                        children: e.jsxs('p', {
                                          className: 'text-blue-900 text-sm',
                                          children: [
                                            b.content.slice(0, f[b.id] || 0),
                                            (f[b.id] || 0) < b.content.length &&
                                              e.jsx('span', {
                                                className:
                                                  'opacity-60 animate-pulse',
                                                children: '|',
                                              }),
                                          ],
                                        }),
                                      },
                                      b.id
                                    )
                                  ),
                                }),
                            e.jsx('span', {
                              className: 'text-xs text-gray-500 mt-0.5 block',
                              children: w.timestamp.toLocaleTimeString(),
                            }),
                          ],
                        }),
                      }),
                    },
                    w.id
                  )
                ),
              ],
            }),
          ],
        });
    return k
      ? e.jsx(T, {})
      : e.jsxs(e.Fragment, {
          children: [
            e.jsx('div', {
              className: o,
              style: {
                position: 'fixed',
                bottom: '40px',
                left: 0,
                right: 0,
                zIndex: 40,
                pointerEvents: 'none',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
              },
              children: e.jsx('div', {
                style: {
                  pointerEvents: 'auto',
                  position: 'relative',
                  transform: 'translateZ(0)',
                },
                children: e.jsx(T, {}),
              }),
            }),
            e.jsx('style', {
              children: `
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }

        /* ✅ FIX: Correct CSS selectors for space-separated classes */
        @media (max-width: 640px) {
          .chat-popup.overlay-layout {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 120px !important;
            max-height: 20vh !important;
            margin: 0 !important;
            border-top-left-radius: 16px !important;
            border-top-right-radius: 16px !important;
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            /* ✅ FIX: Prevent mobile jerky behavior */
            position: relative !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
          }
        }

        /* ✅ FIX: Add mobile optimization for smooth rendering */
        .chat-popup {
          transform: translateZ(0); /* Force hardware acceleration */
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          -webkit-perspective: 1000;
          perspective: 1000;
          /* ✅ FIX: Prevent sub-pixel rendering issues */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .chat-popup.overlay-layout {
          will-change: transform; /* Optimize for animations */
          /* ✅ FIX: Stabilize mobile rendering */
          contain: layout style paint;
        }

        /* ✅ FIX: Prevent layout shift during scroll */
        .chat-popup .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          /* ✅ FIX: Prevent scroll bounce on iOS */
          overscroll-behavior: contain;
        }

        /* ✅ FIX: Prevent mobile tap delays */
        .chat-popup * {
          touch-action: manipulation;
        }
      `,
            }),
          ],
        });
  },
  et = ({
    isOpen: s,
    onClose: t,
    layout: n = 'center-modal',
    className: o = '',
  }) => {
    const { handleSendToFrontDesk: i, isSubmitting: c } = fs({
      onSuccess: () => {
        (alert('✅ Request sent to Front Desk successfully!'), t());
      },
      onError: p => {
        alert(`❌ ${p}`);
      },
    });
    if (!s) return null;
    const d = n === 'grid',
      l = () =>
        e.jsxs('div', {
          className:
            'bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden',
          style: {
            ...(d
              ? {
                  width: '100%',
                  maxWidth: '100%',
                  minHeight: '300px',
                  maxHeight: '500px',
                }
              : { width: '90vw', maxWidth: '400px', maxHeight: '80vh' }),
          },
          children: [
            e.jsxs('div', {
              className:
                'flex items-center justify-between p-4 border-b border-gray-100 bg-white/90',
              children: [
                e.jsx('h3', {
                  className: 'text-lg font-semibold text-gray-800',
                  children: '🔮 Call Summary',
                }),
                e.jsx('button', {
                  onClick: t,
                  className:
                    'p-1 hover:bg-gray-100 rounded-full transition-colors',
                  'aria-label': 'Close summary',
                  children: e.jsx(I, { size: 20, className: 'text-gray-500' }),
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'p-4 space-y-4',
              children: [
                e.jsx('div', {
                  className: 'overflow-y-auto',
                  style: { maxHeight: d ? '320px' : '50vh' },
                  children: e.jsx(V, {}),
                }),
                e.jsxs('div', {
                  className: 'flex gap-3 pt-3 border-t border-gray-100',
                  children: [
                    e.jsx('button', {
                      onClick: t,
                      disabled: c,
                      className:
                        'flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors',
                      children: 'Cancel',
                    }),
                    e.jsx('button', {
                      onClick: i,
                      disabled: c,
                      className:
                        'flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
                      children: c
                        ? e.jsxs(e.Fragment, {
                            children: [
                              e.jsx('div', {
                                className:
                                  'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2',
                              }),
                              'Sending...',
                            ],
                          })
                        : 'Send to FrontDesk',
                    }),
                  ],
                }),
              ],
            }),
            e.jsx('div', {
              className: 'px-4 py-3 border-t border-gray-100 bg-gray-50/50',
              children: e.jsx('div', {
                className: 'flex justify-center',
                children: e.jsx('span', {
                  className: 'text-xs text-gray-400',
                  children: 'Call Summary Panel',
                }),
              }),
            }),
          ],
        });
    return d
      ? e.jsx('div', { className: `relative ${o}`, children: e.jsx(l, {}) })
      : e.jsxs(e.Fragment, {
          children: [
            e.jsx('div', {
              className: 'fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md',
              onClick: t,
              style: {
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              },
            }),
            e.jsx('div', {
              className: `fixed inset-0 z-[9999] flex items-center justify-center p-4 ${o}`,
              style: { pointerEvents: 'none' },
              children: e.jsx('div', {
                style: {
                  pointerEvents: 'auto',
                  animation: 'modalSlideIn 0.3s ease-out',
                },
                children: e.jsx(l, {}),
              }),
            }),
            e.jsx('style', {
              children: `
        @keyframes modalSlideIn {
          from {
            transform: scale(0.95) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `,
            }),
          ],
        });
  },
  lp = () => {
    const { popups: s, removePopup: t } = G(),
      [n, o] = a.useState(!1);
    a.useEffect(() => {
      const c = s.find(d => d.type === 'summary');
      o(!!c);
    }, [s]);
    const i = () => {
      s.filter(c => c.type === 'summary').forEach(c => t(c.id));
    };
    return e.jsx(et, { isOpen: n, onClose: i, layout: 'center-modal' });
  },
  dp = ({ isActive: s }) => {
    const {
      isLoading: t,
      error: n,
      micLevel: o,
      heroSectionRef: i,
      serviceGridRef: c,
      isCallStarted: d,
      showConversation: l,
      handleCallStart: p,
      handleCallEnd: m,
      handleCancel: u,
      handleConfirm: g,
      showingSummary: f,
      showRightPanel: j,
      handleRightPanelClose: _,
    } = xs({ isActive: s });
    return (
      $.debug('Interface1 Popup States', 'Interface1', {
        isCallStarted: d,
        showConversation: l,
        chatPopupOpen: l && d,
        summaryPopupOpen: l && !d,
      }),
      t
        ? e.jsx(rp, {})
        : n
          ? e.jsx(ip, { error: n })
          : e.jsxs(Qe, {
              children: [
                e.jsxs('div', {
                  ref: i,
                  className: 'relative',
                  children: [
                    e.jsx(Ze, {}),
                    e.jsxs('div', {
                      className: 'relative min-h-[400px] px-4',
                      children: [
                        e.jsxs('div', {
                          className: 'hidden md:block',
                          children: [
                            e.jsxs('div', {
                              className:
                                'grid grid-cols-3 gap-8 items-center justify-items-center min-h-[400px] mb-8',
                              children: [
                                e.jsx('div', {
                                  className: 'w-full max-w-sm',
                                  children: e.jsx(Q, {
                                    isOpen: l && d,
                                    onClose: () => {},
                                    layout: 'grid',
                                  }),
                                }),
                                e.jsx('div', {
                                  className:
                                    'flex flex-col items-center justify-center w-full max-w-md',
                                  children: e.jsx('div', {
                                    className:
                                      'flex items-center justify-center p-4',
                                    children: e.jsx(X, {
                                      isCallStarted: d,
                                      micLevel: o,
                                      onCallStart: async y => {
                                        await p(y);
                                      },
                                      onCallEnd: m,
                                      onCancel: u,
                                      onConfirm: g,
                                      showingSummary: f,
                                    }),
                                  }),
                                }),
                                e.jsx('div', {
                                  className: 'w-full max-w-sm',
                                  children: e.jsx(et, {
                                    isOpen: j,
                                    onClose: _,
                                    layout: 'grid',
                                    className: 'relative z-30 ml-10',
                                  }),
                                }),
                              ],
                            }),
                            e.jsx('div', {
                              className: 'flex justify-center mb-8',
                              children: e.jsx('div', {
                                className: 'w-full max-w-sm',
                              }),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'block md:hidden',
                          children: [
                            e.jsx('div', {
                              className:
                                'w-full flex flex-col items-center justify-center min-h-[400px] relative z-50',
                              children: e.jsx('div', {
                                className:
                                  'flex flex-col items-center justify-center',
                                children: e.jsx(X, {
                                  isCallStarted: d,
                                  micLevel: o,
                                  onCallStart: async y => {
                                    await p(y);
                                  },
                                  onCallEnd: m,
                                  onCancel: u,
                                  onConfirm: g,
                                  showingSummary: f,
                                }),
                              }),
                            }),
                            e.jsx(Q, {
                              isOpen: l,
                              onClose: () => {},
                              layout: 'overlay',
                              className: 'fixed bottom-0 left-0 right-0 z-40',
                            }),
                            e.jsx(lp, {}),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'mt-16 relative z-10',
                  children: e.jsx(Je, { ref: c }),
                }),
              ],
            })
    );
  },
  Sg = () => {
    const s = ws(),
      t = $s(),
      { language: n, setLanguage: o } = q(),
      [i, c] = a.useState(n),
      [d, l] = a.useState(!1);
    a.useEffect(() => {
      localStorage.getItem('hasVisited') ||
        (l(!0), localStorage.setItem('hasVisited', 'true'));
    }, []);
    const [p] = a.useState({
        interface1: !0,
        interface2: !1,
        interface3: !1,
        interface3vi: !1,
        interface3fr: !1,
        interface4: !1,
      }),
      m = [
        { value: 'en', label: '🇺🇸 English', flag: '🇺🇸' },
        { value: 'vi', label: '🇻🇳 Tiếng Việt', flag: '🇻🇳' },
        { value: 'fr', label: '🇫🇷 Français', flag: '🇫🇷' },
        { value: 'zh', label: '🇨🇳 中文', flag: '🇨🇳' },
        { value: 'ru', label: '🇷🇺 Русский', flag: '🇷🇺' },
        { value: 'ko', label: '🇰🇷 한국어', flag: '🇰🇷' },
      ],
      u = _ => {
        const y = _;
        (c(y), o(y));
      },
      { logout: g } = F(),
      f = bs(),
      j = () => {
        (g(), s('/login'));
      };
    return e.jsx(vs, {
      children: e.jsxs('div', {
        className:
          'relative w-full h-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50',
        children: [
          e.jsx('div', {
            className:
              'fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50 h-[42px]',
            children: e.jsxs('div', {
              className: 'flex justify-between items-center px-4 h-full',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx('span', {
                      className: 'font-bold text-blue-600 text-lg',
                      children: 'Mi Nhon Hotel',
                    }),
                    e.jsx('span', {
                      className: 'hidden sm:inline text-sm text-gray-500',
                      children: 'Voice Assistant',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx('select', {
                      value: i,
                      onChange: _ => u(_.target.value),
                      className:
                        'text-sm bg-white/50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500',
                      children: m.map(_ =>
                        e.jsxs(
                          'option',
                          {
                            value: _.value,
                            children: [_.flag, ' ', _.label.split(' ')[1]],
                          },
                          _.value
                        )
                      ),
                    }),
                    t.pathname.includes('/staff') &&
                      e.jsx('button', {
                        onClick: j,
                        className:
                          'flex items-center gap-1 px-3 py-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors text-sm',
                        children: '🚪 Logout',
                      }),
                  ],
                }),
              ],
            }),
          }),
          e.jsx('div', {
            className: 'relative w-full h-full',
            id: 'interfaceContainer',
            style: { marginTop: '42px', minHeight: 'calc(100vh - 42px)' },
            children: e.jsx(Ss, {
              fallbackComponent: ap,
              onError: (_, y) => {
                ($.error(
                  '🚨 [VoiceAssistant] Interface1 Error:',
                  'Component',
                  _
                ),
                  $.error('🚨 [VoiceAssistant] Error Info:', 'Component', y));
              },
              children: e.jsx(
                dp,
                { isActive: p.interface1 },
                'stable-interface1'
              ),
            }),
          }),
          e.jsx(np, {
            position: 'bottom',
            maxVisible: 4,
            autoCloseDelay: 1e4,
            isMobile: f,
          }),
        ],
      }),
    });
  },
  mp = A(
    'rounded-lg border bg-card text-card-foreground transition-all duration-200',
    {
      variants: {
        variant: {
          default: 'shadow-sm hover:shadow-md',
          elevated: 'shadow-md hover:shadow-lg transform hover:-translate-y-1',
          ghost: 'border-none shadow-none hover:bg-accent/50',
          outline: 'bg-transparent hover:bg-accent/50',
        },
        size: { default: 'p-6', sm: 'p-4', lg: 'p-8' },
      },
      defaultVariants: { variant: 'default', size: 'default' },
    }
  ),
  up = a.forwardRef(({ className: s, variant: t, size: n, ...o }, i) =>
    e.jsx('div', {
      ref: i,
      className: r(mp({ variant: t, size: n, className: s })),
      ...o,
    })
  );
up.displayName = 'Card';
const pp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('div', { ref: n, className: r('flex flex-col space-y-1.5', s), ...t })
);
pp.displayName = 'CardHeader';
const gp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('h3', {
    ref: n,
    className: r('text-2xl font-semibold leading-none tracking-tight', s),
    ...t,
  })
);
gp.displayName = 'CardTitle';
const _p = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('p', { ref: n, className: r('text-sm text-muted-foreground', s), ...t })
);
_p.displayName = 'CardDescription';
const hp = a.forwardRef(({ className: s, padded: t = !0, ...n }, o) =>
  e.jsx('div', { ref: o, className: r(t && 'p-6 pt-0', s), ...n })
);
hp.displayName = 'CardContent';
const fp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('div', { ref: n, className: r('flex items-center p-6 pt-0', s), ...t })
);
fp.displayName = 'CardFooter';
const xp = a.forwardRef(({ className: s, color: t = 'primary', ...n }, o) => {
  const i = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };
  return e.jsx('div', {
    ref: o,
    className: r(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      i[t],
      s
    ),
    ...n,
  });
});
xp.displayName = 'CardBadge';
const bp = a.forwardRef(({ className: s, alt: t, ...n }, o) =>
  e.jsx('img', {
    ref: o,
    className: r('w-full h-48 object-cover rounded-t-lg', s),
    alt: t,
    ...n,
  })
);
bp.displayName = 'CardImage';
const vp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('div', {
    ref: n,
    className: r('absolute top-4 right-4 flex items-center gap-2', s),
    ...t,
  })
);
vp.displayName = 'CardActions';
const yp = [
    'Đã ghi nhận',
    'Đang thực hiện',
    'Đã thực hiện và đang bàn giao cho khách',
    'Hoàn thiện',
    'Lưu ý khác',
  ],
  Tg = ({ request: s, onClose: t, onStatusChange: n, onOpenMessage: o }) => {
    const [i, c] = a.useState(s.status);
    return s
      ? e.jsx('div', {
          className:
            'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40',
          children: e.jsxs('div', {
            className:
              'bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative',
            children: [
              e.jsx('button', {
                className:
                  'absolute top-2 right-2 text-gray-500 hover:text-blue-700',
                onClick: t,
                children: '×',
              }),
              e.jsx('h3', {
                className: 'text-xl font-bold text-blue-900 mb-4',
                children: 'Request Details',
              }),
              e.jsxs('div', {
                className: 'space-y-2 mb-4',
                children: [
                  e.jsxs('div', {
                    children: [e.jsx('b', { children: 'Room:' }), ' ', s.room],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('b', { children: 'Order ID:' }),
                      ' ',
                      s.id,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('b', { children: 'Guest Name:' }),
                      ' ',
                      s.guestName,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('b', { children: 'Content:' }),
                      ' ',
                      s.content,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [e.jsx('b', { children: 'Time:' }), ' ', s.time],
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx('b', { children: 'Status:' }),
                      e.jsx('select', {
                        className: 'border rounded px-2 py-1 text-xs',
                        value: i,
                        onChange: d => c(d.target.value),
                        children: yp.map(d =>
                          e.jsx('option', { value: d, children: d }, d)
                        ),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('b', { children: 'Notes:' }),
                      ' ',
                      s.notes || '-',
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex gap-2 justify-end',
                children: [
                  e.jsx('button', {
                    className:
                      'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold',
                    onClick: () => {
                      i !== s.status && n(i);
                    },
                    children: 'Cập Nhật',
                  }),
                  e.jsx('button', {
                    className:
                      'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold',
                    onClick: o,
                    children: 'Nhắn khách',
                  }),
                  e.jsx('button', {
                    className:
                      'bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold',
                    onClick: t,
                    children: 'Đóng',
                  }),
                ],
              }),
            ],
          }),
        })
      : null;
  },
  Rg = ({ messages: s, onSend: t, onClose: n, loading: o }) => {
    const [i, c] = a.useState(''),
      d = () => {
        i.trim() && (t(i), c(''));
      };
    return e.jsx('div', {
      className:
        'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40',
      children: e.jsxs('div', {
        className:
          'bg-white rounded-xl shadow-xl p-5 w-full max-w-md relative flex flex-col',
        children: [
          e.jsx('button', {
            className:
              'absolute top-2 right-2 text-gray-500 hover:text-blue-700',
            onClick: n,
            children: '×',
          }),
          e.jsx('h3', {
            className: 'text-lg font-bold text-blue-900 mb-3',
            children: 'Nhắn tin tới Guest',
          }),
          e.jsx('div', {
            className:
              'flex-1 overflow-y-auto mb-3 max-h-60 border rounded p-2 bg-gray-50',
            children:
              s.length === 0
                ? e.jsx('div', {
                    className: 'text-gray-400 text-sm text-center',
                    children: 'Chưa có tin nhắn',
                  })
                : s.map(l =>
                    e.jsxs(
                      'div',
                      {
                        className: `mb-2 ${l.sender === 'staff' ? 'text-right' : 'text-left'}`,
                        children: [
                          e.jsxs('div', {
                            className: `inline-block px-3 py-1 rounded-lg ${l.sender === 'staff' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`,
                            children: [
                              e.jsxs('span', {
                                className: 'font-semibold',
                                children: [
                                  l.sender === 'staff' ? 'Staff' : 'Guest',
                                  ':',
                                ],
                              }),
                              ' ',
                              l.content,
                            ],
                          }),
                          e.jsx('div', {
                            className: 'text-xs text-gray-400 mt-0.5',
                            children: l.time,
                          }),
                        ],
                      },
                      l.id
                    )
                  ),
          }),
          e.jsxs('div', {
            className: 'flex gap-2 mt-2',
            children: [
              e.jsx('input', {
                type: 'text',
                className: 'flex-1 border rounded px-2 py-1',
                placeholder: 'Nhập tin nhắn...',
                value: i,
                onChange: l => c(l.target.value),
                onKeyDown: l => {
                  l.key === 'Enter' && d();
                },
                disabled: o,
              }),
              e.jsx('button', {
                className:
                  'bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded font-semibold',
                onClick: d,
                disabled: o || !i.trim(),
                children: 'Gửi',
              }),
            ],
          }),
        ],
      }),
    });
  },
  W = A(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-base font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 shadow-sm px-5 py-2',
    {
      variants: {
        variant: {
          default:
            'bg-gradient-to-tr from-[#4e5ab7] to-[#3f51b5] text-white hover:brightness-110 hover:shadow-lg',
          yellow:
            'bg-gradient-to-b from-[#ffe066] to-[#ffd700] text-blue-900 border-2 border-[#d4af37] shadow-xl hover:brightness-105 hover:shadow-2xl text-shadow-white',
          outline:
            'border-2 border-[#4e5ab7] bg-white text-[#4e5ab7] hover:bg-[#f5f7fa]',
          secondary:
            'bg-white text-[#4e5ab7] border border-[#4e5ab7] hover:bg-[#e8eaf6]',
          destructive: 'bg-red-500 text-white hover:bg-red-600',
          ghost: 'hover:bg-accent hover:text-accent-foreground',
          link: 'text-primary underline-offset-4 hover:underline',
        },
        size: {
          default: 'h-12 px-6 py-2',
          sm: 'h-10 rounded-md px-4 py-2 text-sm',
          lg: 'h-14 rounded-xl px-8 py-3 text-lg',
          icon: 'h-12 w-12',
        },
      },
      defaultVariants: { variant: 'default', size: 'default' },
    }
  ),
  C = a.forwardRef(
    ({ className: s, variant: t, size: n, asChild: o = !1, ...i }, c) => {
      const d = o ? $t : 'button';
      return e.jsx(d, {
        className: r(W({ variant: t, size: n, className: s })),
        ref: c,
        ...i,
      });
    }
  );
C.displayName = 'Button';
const Np = A(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-dark',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);
function tt({ className: s, variant: t, ...n }) {
  return e.jsx('div', { className: r(Np({ variant: t }), s), ...n });
}
const st = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(oe, {
    ref: n,
    className: r(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      s
    ),
    ...t,
  })
);
st.displayName = oe.displayName;
const nt = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(ae, { ref: n, className: r('aspect-square h-full w-full', s), ...t })
);
nt.displayName = ae.displayName;
const ot = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(re, {
    ref: n,
    className: r(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      s
    ),
    ...t,
  })
);
ot.displayName = re.displayName;
const jp = Tt,
  wp = Rt,
  $p = a.forwardRef(({ className: s, inset: t, children: n, ...o }, i) =>
    e.jsxs(ie, {
      ref: i,
      className: r(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
        t && 'pl-8',
        s
      ),
      ...o,
      children: [n, e.jsx(kt, { className: 'ml-auto h-4 w-4' })],
    })
  );
$p.displayName = ie.displayName;
const kp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(ce, {
    ref: n,
    className: r(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      s
    ),
    ...t,
  })
);
kp.displayName = ce.displayName;
const at = a.forwardRef(({ className: s, sideOffset: t = 4, ...n }, o) =>
  e.jsx(Ct, {
    children: e.jsx(le, {
      ref: o,
      sideOffset: t,
      className: r(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        s
      ),
      ...n,
    }),
  })
);
at.displayName = le.displayName;
const P = a.forwardRef(({ className: s, inset: t, ...n }, o) =>
  e.jsx(de, {
    ref: o,
    className: r(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      t && 'pl-8',
      s
    ),
    ...n,
  })
);
P.displayName = de.displayName;
const Cp = a.forwardRef(({ className: s, children: t, checked: n, ...o }, i) =>
  e.jsxs(me, {
    ref: i,
    className: r(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      s
    ),
    checked: n,
    ...o,
    children: [
      e.jsx('span', {
        className:
          'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        children: e.jsx(ue, { children: e.jsx(O, { className: 'h-4 w-4' }) }),
      }),
      t,
    ],
  })
);
Cp.displayName = me.displayName;
const Sp = a.forwardRef(({ className: s, children: t, ...n }, o) =>
  e.jsxs(pe, {
    ref: o,
    className: r(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      s
    ),
    ...n,
    children: [
      e.jsx('span', {
        className:
          'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        children: e.jsx(ue, {
          children: e.jsx(St, { className: 'h-2 w-2 fill-current' }),
        }),
      }),
      t,
    ],
  })
);
Sp.displayName = pe.displayName;
const rt = a.forwardRef(({ className: s, inset: t, ...n }, o) =>
  e.jsx(ge, {
    ref: o,
    className: r('px-2 py-1.5 text-sm font-semibold', t && 'pl-8', s),
    ...n,
  })
);
rt.displayName = ge.displayName;
const H = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(_e, { ref: n, className: r('-mx-1 my-1 h-px bg-muted', s), ...t })
);
H.displayName = _e.displayName;
const Tp = a.forwardRef(({ className: s, value: t, ...n }, o) =>
  e.jsx(he, {
    ref: o,
    className: r(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      s
    ),
    ...n,
    children: e.jsx(It, {
      className: 'h-full w-full flex-1 bg-primary transition-all',
      style: { transform: `translateX(-${100 - (t || 0)}%)` },
    }),
  })
);
Tp.displayName = he.displayName;
const Rp = a.forwardRef(({ className: s, type: t, ...n }, o) =>
  e.jsx('input', {
    type: t,
    className: r(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm font-medium text-dark placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      s
    ),
    ref: o,
    ...n,
  })
);
Rp.displayName = 'Input';
const Ip = A(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ),
  Ap = a.forwardRef(({ className: s, ...t }, n) =>
    e.jsx(fe, { ref: n, className: r(Ip(), s), ...t })
  );
Ap.displayName = fe.displayName;
const Ig = Mt,
  Ag = Bt,
  Dp = a.forwardRef(({ className: s, children: t, ...n }, o) =>
    e.jsxs(xe, {
      ref: o,
      className: r(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        s
      ),
      ...n,
      children: [
        t,
        e.jsx(At, {
          asChild: !0,
          children: e.jsx(be, { className: 'h-4 w-4 opacity-50' }),
        }),
      ],
    })
  );
Dp.displayName = xe.displayName;
const it = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(ve, {
    ref: n,
    className: r('flex cursor-default items-center justify-center py-1', s),
    ...t,
    children: e.jsx(Dt, { className: 'h-4 w-4' }),
  })
);
it.displayName = ve.displayName;
const ct = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(ye, {
    ref: n,
    className: r('flex cursor-default items-center justify-center py-1', s),
    ...t,
    children: e.jsx(be, { className: 'h-4 w-4' }),
  })
);
ct.displayName = ye.displayName;
const Ep = a.forwardRef(
  ({ className: s, children: t, position: n = 'popper', ...o }, i) =>
    e.jsx(Et, {
      children: e.jsxs(Ne, {
        ref: i,
        className: r(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          n === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          s
        ),
        position: n,
        ...o,
        children: [
          e.jsx(it, {}),
          e.jsx(Pt, {
            className: r(
              'p-1',
              n === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            ),
            children: t,
          }),
          e.jsx(ct, {}),
        ],
      }),
    })
);
Ep.displayName = Ne.displayName;
const Pp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(je, {
    ref: n,
    className: r('py-1.5 pl-8 pr-2 text-sm font-semibold', s),
    ...t,
  })
);
Pp.displayName = je.displayName;
const Fp = a.forwardRef(({ className: s, children: t, ...n }, o) =>
  e.jsxs(we, {
    ref: o,
    className: r(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      s
    ),
    ...n,
    children: [
      e.jsx('span', {
        className:
          'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        children: e.jsx(Ft, { children: e.jsx(O, { className: 'h-4 w-4' }) }),
      }),
      e.jsx(zt, { children: t }),
    ],
  })
);
Fp.displayName = we.displayName;
const zp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx($e, { ref: n, className: r('-mx-1 my-1 h-px bg-muted', s), ...t })
);
zp.displayName = $e.displayName;
const Mp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(ke, {
    ref: n,
    className: r(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      s
    ),
    ...t,
    children: e.jsx(Ht, {
      className: r('flex items-center justify-center text-current'),
      children: e.jsx(O, { className: 'h-4 w-4' }),
    }),
  })
);
Mp.displayName = ke.displayName;
const Bp = A(
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-dark',
    {
      variants: {
        variant: {
          default: 'bg-background text-dark',
          destructive:
            'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        },
      },
      defaultVariants: { variant: 'default' },
    }
  ),
  lt = a.forwardRef(({ className: s, variant: t, ...n }, o) =>
    e.jsx('div', {
      ref: o,
      role: 'alert',
      className: r(Bp({ variant: t }), s),
      ...n,
    })
  );
lt.displayName = 'Alert';
const Hp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('h5', {
    ref: n,
    className: r('mb-1 font-medium leading-none tracking-tight', s),
    ...t,
  })
);
Hp.displayName = 'AlertTitle';
const dt = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('div', {
    ref: n,
    className: r('text-sm [&_p]:leading-relaxed', s),
    ...t,
  })
);
dt.displayName = 'AlertDescription';
const Lp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('textarea', {
    className: r(
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      s
    ),
    ref: n,
    ...t,
  })
);
Lp.displayName = 'Textarea';
const Op = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(Ce, {
    className: r(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      s
    ),
    ...t,
    ref: n,
    children: e.jsx(Lt, {
      className: r(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      ),
    }),
  })
);
Op.displayName = Ce.displayName;
const Dg = Ot,
  qp = a.forwardRef(({ className: s, ...t }, n) =>
    e.jsx(Se, {
      ref: n,
      className: r(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        s
      ),
      ...t,
    })
  );
qp.displayName = Se.displayName;
const Gp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(Te, {
    ref: n,
    className: r(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-dark data-[state=active]:shadow-sm',
      s
    ),
    ...t,
  })
);
Gp.displayName = Te.displayName;
const Vp = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(Re, {
    ref: n,
    className: r(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      s
    ),
    ...t,
  })
);
Vp.displayName = Re.displayName;
const z = ({ requiredPermission: s, requiredRole: t, variant: n = 'alert' }) =>
    n === 'minimal'
      ? e.jsxs('div', {
          className: 'text-gray-400 text-sm flex items-center gap-2',
          children: [
            e.jsx(qt, { className: 'h-4 w-4' }),
            e.jsx('span', { children: 'Không có quyền truy cập' }),
          ],
        })
      : n === 'placeholder'
        ? e.jsxs('div', {
            className:
              'border-2 border-dashed border-gray-200 rounded-lg p-8 text-center',
            children: [
              e.jsx(M, { className: 'h-12 w-12 text-gray-300 mx-auto mb-4' }),
              e.jsx('h3', {
                className: 'text-lg font-medium text-gray-600 mb-2',
                children: 'Quyền truy cập bị hạn chế',
              }),
              e.jsxs('p', {
                className: 'text-gray-500',
                children: [s && `Cần quyền: ${s}`, t && `Cần vai trò: ${t}`],
              }),
            ],
          })
        : e.jsxs(lt, {
            className: 'border-orange-200 bg-orange-50',
            children: [
              e.jsx(M, { className: 'h-4 w-4 text-orange-600' }),
              e.jsxs(dt, {
                className: 'text-orange-800',
                children: [
                  e.jsx('strong', { children: 'Không có quyền truy cập.' }),
                  ' ',
                  s && `Cần quyền: ${s}. `,
                  t && `Cần vai trò: ${t}. `,
                  'Vui lòng liên hệ quản trị viên để được cấp quyền.',
                ],
              }),
            ],
          }),
  mt = ({
    children: s,
    requiredPermission: t,
    requiredRole: n,
    fallback: o,
    showFallback: i = !0,
  }) => {
    const { user: c, hasPermission: d } = F();
    if (!c)
      return i
        ? e.jsx(z, {
            requiredPermission: t,
            requiredRole: n,
            variant: 'minimal',
          })
        : null;
    if (n && c.role !== n)
      return i ? o || e.jsx(z, { requiredRole: n, variant: 'alert' }) : null;
    if (t) {
      let l, p;
      if (
        (t.includes(':') ? ([l, p] = t.split(':')) : ([l, p] = t.split('.')),
        !d(l, p))
      )
        return i
          ? o || e.jsx(z, { requiredPermission: t, variant: 'alert' })
          : null;
    }
    return e.jsx(e.Fragment, { children: s });
  },
  Wp = () => {
    const { user: s, hasPermission: t } = F(),
      n = l => {
        if (!s) return !1;
        const [p, m] = l.split('.');
        return t(p, m);
      },
      o = l => s?.role === l;
    return {
      canAccess: n,
      hasRole: o,
      isManager: () => o('hotel-manager'),
      isStaff: () => o('front-desk'),
      isIT: () => o('it-manager'),
      user: s,
    };
  },
  Up = [
    {
      href: '/dashboard',
      icon: Vt,
      label: 'Tổng quan',
      description: 'Thống kê và metrics tổng quan',
      permission: 'dashboard:view',
    },
    {
      href: '/dashboard/setup',
      icon: Wt,
      label: 'Thiết lập Assistant',
      description: 'Cấu hình và tùy chỉnh AI Assistant',
      permission: 'assistant:configure',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/unified-dashboard/analytics',
      icon: Ut,
      label: 'Phân tích nâng cao',
      description: 'Báo cáo và thống kê chi tiết',
      permission: 'analytics:view_advanced',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/dashboard/billing',
      icon: Yt,
      label: 'Thanh toán',
      description: 'Quản lý subscription và billing',
      permission: 'billing:view',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/unified-dashboard/staff-management',
      icon: Xt,
      label: 'Quản lý nhân viên',
      description: 'Thêm, sửa, xóa tài khoản nhân viên',
      permission: 'staff:manage',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/dashboard/settings',
      icon: Ae,
      label: 'Cài đặt hệ thống',
      description: 'Cấu hình khách sạn và hệ thống',
      permission: 'settings:manage',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/unified-dashboard/requests',
      icon: Kt,
      label: 'Yêu cầu khách hàng',
      description: 'Xem và xử lý yêu cầu từ khách',
      permission: 'requests:view',
      roleSpecific: ['front-desk'],
    },
    {
      href: '/dashboard/guest-management',
      icon: Qt,
      label: 'Quản lý khách hàng',
      description: 'Thông tin và lịch sử khách hàng',
      permission: 'guests:manage',
      roleSpecific: ['front-desk'],
    },
    {
      href: '/dashboard/basic-analytics',
      icon: Zt,
      label: 'Thống kê cơ bản',
      description: 'Báo cáo hoạt động hàng ngày',
      permission: 'analytics:view_basic',
      roleSpecific: ['front-desk'],
    },
    {
      href: '/dashboard/calls',
      icon: Jt,
      label: 'Lịch sử cuộc gọi',
      description: 'Xem lịch sử cuộc gọi và transcript',
      permission: 'calls:view',
      roleSpecific: ['front-desk'],
    },
    {
      href: '/unified-dashboard/system-monitoring',
      icon: es,
      label: 'Giám sát hệ thống',
      description: 'Theo dõi hiệu suất và sức khỏe hệ thống',
      permission: 'system:monitor',
      roleSpecific: ['it-manager'],
    },
    {
      href: '/dashboard/integrations',
      icon: ts,
      label: 'Tích hợp',
      description: 'Quản lý API và tích hợp bên thứ 3',
      permission: 'integrations:manage',
      roleSpecific: ['it-manager'],
    },
    {
      href: '/dashboard/logs',
      icon: ss,
      label: 'Nhật ký hệ thống',
      description: 'Xem logs và debug issues',
      permission: 'logs:view',
      roleSpecific: ['it-manager'],
    },
    {
      href: '/dashboard/security',
      icon: M,
      label: 'Bảo mật',
      description: 'Cấu hình và giám sát bảo mật',
      permission: 'security:manage',
      roleSpecific: ['it-manager'],
    },
  ],
  ut = s => {
    switch (s) {
      case 'hotel-manager':
        return {
          primary: 'bg-blue-600 hover:bg-blue-700',
          accent: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
        };
      case 'front-desk':
        return {
          primary: 'bg-green-600 hover:bg-green-700',
          accent: 'border-green-200',
          badge: 'bg-green-100 text-green-800',
        };
      case 'it-manager':
        return {
          primary: 'bg-purple-600 hover:bg-purple-700',
          accent: 'border-purple-200',
          badge: 'bg-purple-100 text-purple-800',
        };
      default:
        return {
          primary: 'bg-gray-600 hover:bg-gray-700',
          accent: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-800',
        };
    }
  },
  L = s => {
    switch (s) {
      case 'hotel-manager':
        return 'Quản lý khách sạn';
      case 'front-desk':
        return 'Lễ tân';
      case 'it-manager':
        return 'Quản lý IT';
      default:
        return 'Người dùng';
    }
  },
  Yp = ({
    href: s,
    icon: t,
    label: n,
    description: o,
    isActive: i,
    theme: c,
  }) =>
    e.jsx(Ge, {
      href: s,
      children: e.jsxs(C, {
        variant: i ? 'default' : 'ghost',
        className: r(
          'w-full justify-start gap-3 px-3 py-6 h-auto',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          i &&
            `${c.primary} text-white hover:${c.primary.replace('bg-', 'bg-').replace('600', '700')}`
        ),
        children: [
          e.jsx(t, { className: 'h-5 w-5 shrink-0' }),
          e.jsxs('div', {
            className: 'flex-1 text-left',
            children: [
              e.jsx('div', { className: 'font-medium', children: n }),
              e.jsx('div', {
                className: r(
                  'text-xs text-muted-foreground',
                  i && 'text-white/80'
                ),
                children: o,
              }),
            ],
          }),
        ],
      }),
    }),
  Xp = ({ user: s, role: t, onLogout: n }) => {
    const o = ut(t);
    return e.jsxs(jp, {
      children: [
        e.jsx(wp, {
          asChild: !0,
          children: e.jsx(C, {
            variant: 'ghost',
            className: 'relative h-10 w-10 rounded-full',
            children: e.jsxs(st, {
              className: 'h-10 w-10',
              children: [
                e.jsx(nt, {
                  src: s.avatar_url || '',
                  alt: s.display_name || s.email,
                }),
                e.jsx(ot, {
                  className: o.primary,
                  children: (s.display_name || s.email || '')
                    .charAt(0)
                    .toUpperCase(),
                }),
              ],
            }),
          }),
        }),
        e.jsxs(at, {
          className: 'w-56',
          align: 'end',
          children: [
            e.jsxs(rt, {
              className: 'flex flex-col',
              children: [
                e.jsx('div', {
                  className: 'font-medium',
                  children: s.display_name || s.email,
                }),
                e.jsx('div', {
                  className: 'text-xs text-muted-foreground',
                  children: L(t),
                }),
              ],
            }),
            e.jsx(H, {}),
            e.jsxs(P, {
              children: [
                e.jsx(Ae, { className: 'mr-2 h-4 w-4' }),
                'Cài đặt tài khoản',
              ],
            }),
            e.jsxs(P, {
              children: [e.jsx(os, { className: 'mr-2 h-4 w-4' }), 'Trợ giúp'],
            }),
            e.jsx(H, {}),
            e.jsxs(P, {
              className: 'text-red-600 focus:text-red-600',
              onClick: n,
              children: [e.jsx(as, { className: 'mr-2 h-4 w-4' }), 'Đăng xuất'],
            }),
          ],
        }),
      ],
    });
  },
  Kp = ({ isOpen: s, onClose: t, user: n, role: o, theme: i }) => {
    const [c] = ys(),
      l = Wp().canAccess,
      p = Up.filter(
        m =>
          !(!l(m.permission) || (m.roleSpecific && !m.roleSpecific.includes(o)))
      );
    return e.jsx('aside', {
      className: r(
        'fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        s ? 'translate-x-0' : '-translate-x-full'
      ),
      children: e.jsxs('div', {
        className: 'flex h-full flex-col',
        children: [
          e.jsxs('div', {
            className: r(
              'flex items-center justify-between p-6 border-b',
              i.accent
            ),
            children: [
              e.jsxs('div', {
                className: 'flex items-center gap-3',
                children: [
                  e.jsx('div', {
                    className: r(
                      'flex h-10 w-10 items-center justify-center rounded-lg text-white',
                      i.primary
                    ),
                    children: e.jsx(ns, { className: 'h-6 w-6' }),
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('h1', {
                        className: 'text-lg font-semibold',
                        children: 'Talk2Go',
                      }),
                      e.jsx('p', {
                        className: 'text-sm text-muted-foreground',
                        children: 'Hotel Management',
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx(C, {
                variant: 'ghost',
                size: 'icon',
                className: 'lg:hidden',
                onClick: t,
                children: e.jsx(I, { className: 'h-5 w-5' }),
              }),
            ],
          }),
          e.jsxs('div', {
            className: r('px-6 py-4 border-b', i.accent),
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('div', {
                        className: 'font-semibold text-lg',
                        children: n.display_name || n.email,
                      }),
                      e.jsx('div', {
                        className: 'text-xs text-gray-500',
                        children: L(o),
                      }),
                    ],
                  }),
                  e.jsx(tt, {
                    variant: 'outline',
                    className: i.badge,
                    children: L(o),
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'mt-3 flex gap-2',
                children: [
                  e.jsx(mt, {
                    requiredPermission: 'dashboard:view_client_interface',
                    children: e.jsx(Ge, {
                      href: '/interface1',
                      className: r(
                        'flex-1 px-3 py-2 text-white text-sm rounded hover:opacity-90 transition text-center',
                        i.primary
                      ),
                      children: 'Giao diện khách',
                    }),
                  }),
                  e.jsxs(C, {
                    variant: 'outline',
                    size: 'sm',
                    className: 'flex-1',
                    children: [
                      e.jsx(Ie, { className: 'h-4 w-4 mr-1' }),
                      'Thông báo',
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsx('nav', {
            className: 'flex-1 p-4 space-y-2 overflow-y-auto',
            children: p.map(m => {
              const u = c === m.href;
              return e.jsx(
                Yp,
                {
                  href: m.href,
                  icon: m.icon,
                  label: m.label,
                  description: m.description,
                  isActive: u,
                  theme: i,
                },
                m.href
              );
            }),
          }),
          e.jsx('div', {
            className: 'p-4 border-t',
            children: e.jsx('div', {
              className: 'text-xs text-center text-muted-foreground',
              children: '© 2024 Talk2Go - Hotel AI Assistant',
            }),
          }),
        ],
      }),
    });
  },
  Eg = ({ children: s }) => {
    const [t, n] = a.useState(!1),
      { user: o, logout: i } = F(),
      c = o?.role || 'front-desk',
      d = ut(c),
      l = () => {
        switch (c) {
          case 'hotel-manager':
            return 'Dashboard Quản lý';
          case 'front-desk':
            return 'Dashboard Lễ tân';
          case 'it-manager':
            return 'Dashboard IT';
          default:
            return 'Dashboard';
        }
      };
    return e.jsxs('div', {
      className: 'min-h-screen bg-gray-50 dark:bg-gray-900',
      children: [
        t &&
          e.jsx('div', {
            className: 'fixed inset-0 z-40 bg-black/50 lg:hidden',
            onClick: () => n(!1),
          }),
        e.jsx(Kp, {
          isOpen: t,
          onClose: () => n(!1),
          user: o,
          role: c,
          theme: d,
        }),
        e.jsxs('div', {
          className: 'lg:ml-80',
          children: [
            e.jsx('header', {
              className:
                'sticky top-0 z-30 bg-white dark:bg-gray-800 border-b shadow-sm',
              children: e.jsxs('div', {
                className: 'flex items-center justify-between p-4',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-4',
                    children: [
                      e.jsx(C, {
                        variant: 'ghost',
                        size: 'icon',
                        className: 'lg:hidden',
                        onClick: () => n(!0),
                        children: e.jsx(Gt, { className: 'h-5 w-5' }),
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('h1', {
                            className:
                              'text-xl font-semibold text-gray-900 dark:text-white',
                            children: l(),
                          }),
                          e.jsx('p', {
                            className: 'text-sm text-muted-foreground',
                            children: 'Quản lý khách sạn với AI Assistant',
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center gap-4',
                    children: [
                      e.jsx(mt, {
                        requiredPermission: 'notifications:view',
                        children: e.jsxs(C, {
                          variant: 'ghost',
                          size: 'icon',
                          className: 'relative',
                          children: [
                            e.jsx(Ie, { className: 'h-5 w-5' }),
                            e.jsx(tt, {
                              variant: 'destructive',
                              className:
                                'absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs',
                              children: '3',
                            }),
                          ],
                        }),
                      }),
                      e.jsx(Xp, { user: o, role: c, onLogout: i }),
                    ],
                  }),
                ],
              }),
            }),
            e.jsx('main', { className: 'p-6', children: s }),
          ],
        }),
      ],
    });
  },
  Pg = cs,
  Qp = rs,
  pt = a.forwardRef(({ className: s, ...t }, n) =>
    e.jsx(De, {
      ref: n,
      className: r(
        'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        s
      ),
      ...t,
    })
  );
pt.displayName = De.displayName;
const Zp = a.forwardRef(({ className: s, children: t, ...n }, o) =>
  e.jsxs(Qp, {
    children: [
      e.jsx(pt, {}),
      e.jsxs(Ee, {
        ref: o,
        className: r(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          s
        ),
        ...n,
        children: [
          t,
          e.jsxs(is, {
            className:
              'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
            children: [
              e.jsx(I, { className: 'h-4 w-4' }),
              e.jsx('span', { className: 'sr-only', children: 'Close' }),
            ],
          }),
        ],
      }),
    ],
  })
);
Zp.displayName = Ee.displayName;
const Jp = ({ className: s, ...t }) =>
  e.jsx('div', {
    className: r('flex flex-col space-y-1.5 text-center sm:text-left', s),
    ...t,
  });
Jp.displayName = 'DialogHeader';
const eg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(Pe, {
    ref: n,
    className: r('text-lg font-semibold leading-none tracking-tight', s),
    ...t,
  })
);
eg.displayName = Pe.displayName;
const tg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(Fe, { ref: n, className: r('text-sm text-muted-foreground', s), ...t })
);
tg.displayName = Fe.displayName;
const Fg = ds,
  zg = ms,
  sg = ls,
  gt = a.forwardRef(({ className: s, ...t }, n) =>
    e.jsx(ze, {
      className: r(
        'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        s
      ),
      ...t,
      ref: n,
    })
  );
gt.displayName = ze.displayName;
const ng = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsxs(sg, {
    children: [
      e.jsx(gt, {}),
      e.jsx(Me, {
        ref: n,
        className: r(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          s
        ),
        ...t,
      }),
    ],
  })
);
ng.displayName = Me.displayName;
const og = ({ className: s, ...t }) =>
  e.jsx('div', {
    className: r('flex flex-col space-y-2 text-center sm:text-left', s),
    ...t,
  });
og.displayName = 'AlertDialogHeader';
const ag = ({ className: s, ...t }) =>
  e.jsx('div', {
    className: r(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      s
    ),
    ...t,
  });
ag.displayName = 'AlertDialogFooter';
const rg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(Be, { ref: n, className: r('text-lg font-semibold', s), ...t })
);
rg.displayName = Be.displayName;
const ig = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(He, { ref: n, className: r('text-sm text-muted-foreground', s), ...t })
);
ig.displayName = He.displayName;
const cg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(Le, { ref: n, className: r(W(), s), ...t })
);
cg.displayName = Le.displayName;
const lg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx(Oe, {
    ref: n,
    className: r(W({ variant: 'outline' }), 'mt-2 sm:mt-0', s),
    ...t,
  })
);
lg.displayName = Oe.displayName;
const dg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('div', {
    className: 'relative w-full overflow-auto',
    children: e.jsx('table', {
      ref: n,
      className: r('w-full caption-bottom text-sm', s),
      ...t,
    }),
  })
);
dg.displayName = 'Table';
const mg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('thead', { ref: n, className: r('[&_tr]:border-b', s), ...t })
);
mg.displayName = 'TableHeader';
const ug = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('tbody', {
    ref: n,
    className: r('[&_tr:last-child]:border-0', s),
    ...t,
  })
);
ug.displayName = 'TableBody';
const pg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('tfoot', {
    ref: n,
    className: r('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', s),
    ...t,
  })
);
pg.displayName = 'TableFooter';
const gg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('tr', {
    ref: n,
    className: r(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      s
    ),
    ...t,
  })
);
gg.displayName = 'TableRow';
const _g = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('th', {
    ref: n,
    className: r(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      s
    ),
    ...t,
  })
);
_g.displayName = 'TableHead';
const hg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('td', {
    ref: n,
    className: r('p-4 align-middle [&:has([role=checkbox])]:pr-0', s),
    ...t,
  })
);
hg.displayName = 'TableCell';
const fg = a.forwardRef(({ className: s, ...t }, n) =>
  e.jsx('caption', {
    ref: n,
    className: r('mt-4 text-sm text-muted-foreground', s),
    ...t,
  })
);
fg.displayName = 'TableCaption';
const xg = a.forwardRef(
  (
    { className: s, orientation: t = 'horizontal', decorative: n = !0, ...o },
    i
  ) =>
    e.jsx(qe, {
      ref: i,
      decorative: n,
      orientation: t,
      className: r(
        'shrink-0 bg-border',
        t === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        s
      ),
      ...o,
    })
);
xg.displayName = qe.displayName;
export {
  dg as $,
  st as A,
  C as B,
  up as C,
  jp as D,
  Vp as E,
  Lp as F,
  Op as G,
  mt as H,
  op as I,
  Fg as J,
  zg as K,
  Ap as L,
  ng as M,
  og as N,
  rg as O,
  Tp as P,
  ig as Q,
  ag as R,
  Tg as S,
  Dg as T,
  lg as U,
  cg as V,
  Pg as W,
  Zp as X,
  Jp as Y,
  eg as Z,
  tg as _,
  tt as a,
  mg as a0,
  gg as a1,
  _g as a2,
  ug as a3,
  hg as a4,
  xg as a5,
  N as a6,
  Ss as a7,
  $g as a8,
  Sg as a9,
  Eg as aa,
  kg as ab,
  hp as b,
  Rg as c,
  wp as d,
  nt as e,
  ot as f,
  at as g,
  rt as h,
  H as i,
  P as j,
  pp as k,
  $ as l,
  gp as m,
  _p as n,
  lt as o,
  dt as p,
  Rp as q,
  Ig as r,
  Dp as s,
  Ag as t,
  Cg as u,
  Ep as v,
  Fp as w,
  Mp as x,
  qp as y,
  Gp as z,
};
