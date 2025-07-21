import {
  r as a,
  j as e,
  V as Q,
  b as Z,
  c as J,
  C as ee,
  X as R,
  T as te,
  D as se,
  P as gt,
  F as _t,
  d as ht,
  e as U,
  f as ft,
  g as xt,
  h as bt,
  i as vt,
  k as yt,
  l as jt,
  S as Nt,
  m as ne,
  I as oe,
  n as ae,
  o as re,
  p as wt,
  q as ie,
  s as $t,
  t as ce,
  u as le,
  v as de,
  w as me,
  x as H,
  y as ue,
  z as kt,
  L as pe,
  B as ge,
  E as Ct,
  G as St,
  H as _e,
  J as Tt,
  K as he,
  M as fe,
  N as Rt,
  O as xe,
  Q as be,
  U as It,
  W as ve,
  Y as At,
  Z as ye,
  _ as Dt,
  $ as je,
  a0 as Ne,
  a1 as Et,
  a2 as Pt,
  a3 as we,
  a4 as zt,
  a5 as Ft,
  a6 as $e,
  a7 as Mt,
  a8 as ke,
  a9 as Bt,
  aa as Ce,
  ab as Se,
  ac as Te,
  ad as Lt,
  ae as Ht,
  af as F,
  ag as qt,
  ah as Re,
  ai as Ot,
  aj as Vt,
  ak as Gt,
  al as Wt,
  am as Ut,
  an as Ie,
  ao as Yt,
  ap as Xt,
  aq as Kt,
  ar as Qt,
  as as Zt,
  at as Jt,
  au as es,
  av as ts,
  aw as ss,
  ax as ns,
  ay as Ae,
  az as os,
  aA as De,
  aB as as,
  aC as Ee,
  aD as Pe,
  aE as rs,
  aF as ze,
  aG as is,
  aH as Fe,
  aI as Me,
  aJ as Be,
  aK as Le,
  aL as He,
  aM as cs,
  aN as ls,
  aO as qe,
} from './react-core-C6DwaHZM.js';
import {
  u as ds,
  P as ms,
  a as q,
  b as O,
  S as us,
  c as ps,
  d as gs,
  e as _s,
  f as hs,
  g as P,
  h as fs,
  i as xs,
} from './hooks-context-CVvU1W40.js';
import { B as I, C as bs, L as Oe } from './vendor-BXT5a8vO.js';
import { c as r, e as vs, p as ys } from './services-CkHkMpnV.js';
import { S as Y } from './siri-components-3HsV-8c_.js';
import { u as js, a as Ns } from './react-router-B7s-G-0E.js';
class ws extends a.Component {
  constructor(s) {
    (super(s),
      (this.retryTimeoutId = null),
      (this.handleRetry = () => {
        console.log(
          '🔄 [ErrorBoundary] Executing retry attempt:',
          this.state.retryCount + 1
        );
        try {
          (['conversationState', 'interface1State', 'vapiState'].forEach(o => {
            (localStorage.removeItem(o), sessionStorage.removeItem(o));
          }),
            console.log('🧹 [ErrorBoundary] Cleared problematic state'));
        } catch (n) {
          console.warn('⚠️ [ErrorBoundary] Error during state cleanup:', n);
        }
        (this.setState(n => ({
          hasError: !1,
          error: void 0,
          errorInfo: void 0,
          retryCount: n.retryCount + 1,
          isRecovering: !1,
        })),
          this.retryTimeoutId &&
            (clearTimeout(this.retryTimeoutId), (this.retryTimeoutId = null)));
      }),
      (this.state = { hasError: !1, retryCount: 0, isRecovering: !1 }));
  }
  static getDerivedStateFromError(s) {
    return { hasError: !0, error: s };
  }
  componentDidCatch(s, n) {
    (console.error('🚨 [ErrorBoundary] Uncaught error in component tree:', s),
      console.error('🚨 [ErrorBoundary] Component stack:', n.componentStack));
    const o = this.categorizeError(s);
    (console.log('🔍 [ErrorBoundary] Error category:', o),
      this.props.onError && this.props.onError(s, n),
      this.setState({ errorInfo: n }));
    const c = this.props.maxRetries || 2;
    if (this.shouldAutoRetry(s, o) && this.state.retryCount < c) {
      (console.log('🔄 [ErrorBoundary] Attempting auto-recovery for:', o),
        this.setState({ isRecovering: !0 }));
      const l = this.getRetryDelay(o);
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, l);
    }
  }
  categorizeError(s) {
    const n = s.message.toLowerCase(),
      o = s.stack?.toLowerCase() || '';
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
  shouldAutoRetry(s, n) {
    return ['react-hooks', 'canvas-siri'].includes(n)
      ? (console.log('🚫 [ErrorBoundary] Non-retryable error category:', n), !1)
      : ['chunk-loading', 'network', 'vapi', 'react-render'].includes(n);
  }
  getRetryDelay(s) {
    return (
      {
        'chunk-loading': 1e3,
        network: 2e3,
        vapi: 1500,
        'react-render': 500,
        unknown: 1e3,
      }[s] || 1e3
    );
  }
  componentWillUnmount() {
    this.retryTimeoutId && clearTimeout(this.retryTimeoutId);
  }
  render() {
    if (this.state.hasError) {
      const s = this.props.fallbackComponent;
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
        : s
          ? e.jsx(s, { error: this.state.error, onRetry: this.handleRetry })
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
const $s = gt,
  Ve = a.forwardRef(({ className: t, ...s }, n) =>
    e.jsx(Q, {
      ref: n,
      className: r(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        t
      ),
      ...s,
    })
  );
Ve.displayName = Q.displayName;
const ks = I(
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
  Ge = a.forwardRef(({ className: t, variant: s, ...n }, o) =>
    e.jsx(Z, { ref: o, className: r(ks({ variant: s }), t), ...n })
  );
Ge.displayName = Z.displayName;
const Cs = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(J, {
    ref: n,
    className: r(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      t
    ),
    ...s,
  })
);
Cs.displayName = J.displayName;
const We = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(ee, {
    ref: n,
    className: r(
      'absolute right-2 top-2 rounded-md p-1 text-dark/50 opacity-0 transition-opacity hover:text-dark focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      t
    ),
    'toast-close': '',
    ...s,
    children: e.jsx(R, { className: 'h-4 w-4' }),
  })
);
We.displayName = ee.displayName;
const Ue = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(te, { ref: n, className: r('text-sm font-semibold', t), ...s })
);
Ue.displayName = te.displayName;
const Ye = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(se, { ref: n, className: r('text-sm opacity-90', t), ...s })
);
Ye.displayName = se.displayName;
function yg() {
  const { toasts: t } = ds();
  return e.jsxs($s, {
    children: [
      t.map(function ({ id: s, title: n, description: o, action: c, ...l }) {
        return e.jsxs(
          Ge,
          {
            ...l,
            children: [
              e.jsxs('div', {
                className: 'grid gap-1',
                children: [
                  n && e.jsx(Ue, { children: n }),
                  o && e.jsx(Ye, { children: o }),
                ],
              }),
              c,
              e.jsx(We, {}),
            ],
          },
          s
        );
      }),
      e.jsx(Ve, {}),
    ],
  });
}
const Ss = '_popupCard_1ombn_1',
  Ts = '_popupCardActive_1ombn_15',
  Rs = '_popupCardTop_1ombn_20',
  Is = '_popupCardInner_1ombn_24',
  As = '_popupCardHeader_1ombn_38',
  Ds = '_popupCardInfo_1ombn_46',
  Es = '_popupCardIcon_1ombn_54',
  Ps = '_popupCardTitleWrapper_1ombn_64',
  zs = '_popupCardTitle_1ombn_64',
  Fs = '_popupCardBadge_1ombn_79',
  Ms = '_popupCardMeta_1ombn_90',
  Bs = '_popupCardTimestamp_1ombn_97',
  Ls = '_popupCardDismiss_1ombn_103',
  Hs = '_popupCardPreview_1ombn_122',
  qs = '_popupCardPreviewText_1ombn_126',
  Os = '_popupCardContent_1ombn_136',
  v = {
    popupCard: Ss,
    popupCardActive: Ts,
    popupCardTop: Rs,
    popupCardInner: Is,
    popupCardHeader: As,
    popupCardInfo: Ds,
    popupCardIcon: Es,
    popupCardTitleWrapper: Ps,
    popupCardTitle: zs,
    popupCardBadge: Fs,
    popupCardMeta: Ms,
    popupCardTimestamp: Bs,
    popupCardDismiss: Ls,
    popupCardPreview: Hs,
    popupCardPreviewText: qs,
    popupCardContent: Os,
  },
  X = ({
    popup: t,
    index: s,
    isActive: n,
    onClick: o,
    onDismiss: c,
    maxVisible: l = 3,
  }) => {
    const d = ms[t.type],
      i = s < l,
      p = Math.min(s, l - 1),
      m = 1 - p * 0.03,
      u = p * 12,
      g = i ? 1 - p * 0.1 : 0,
      f = 1e3 - s,
      N = y => {
        const $ = new Date().getTime() - y.getTime(),
          C = Math.floor($ / (1e3 * 60));
        if (C < 1) return 'now';
        if (C < 60) return `${C}m ago`;
        const S = Math.floor(C / 60);
        return S < 24 ? `${S}h ago` : `${Math.floor(S / 24)}d ago`;
      };
    if (!i && s >= l) return null;
    const _ = [
      v.popupCard,
      n ? v.popupCardActive : '',
      s === 0 ? v.popupCardTop : '',
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
                      t.badge &&
                        t.badge > 0 &&
                        e.jsx('span', {
                          className: v.popupCardBadge,
                          style: { background: d.color },
                          children: t.badge,
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
                    children: N(t.timestamp),
                  }),
                  e.jsx('button', {
                    className: v.popupCardDismiss,
                    onClick: y => {
                      (y.stopPropagation(), c());
                    },
                    'aria-label': 'Dismiss notification',
                    children: e.jsx(R, { size: 14 }),
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
                children: t.title,
              }),
            }),
          n &&
            e.jsx('div', {
              className: v.popupCardContent,
              children: t.content,
            }),
        ],
      }),
    });
  },
  Vs = '_popupStack_1urkl_1',
  Gs = '_popupStackContainer_1urkl_5',
  Ws = '_popupStackHeader_1urkl_10',
  Us = '_popupStackMore_1urkl_11',
  Ys = '_popupStackActive_1urkl_56',
  Xs = '_popupStackInactive_1urkl_60',
  T = {
    popupStack: Vs,
    popupStackContainer: Gs,
    popupStackHeader: Ws,
    popupStackMore: Us,
    popupStackActive: Ys,
    popupStackInactive: Xs,
  },
  Ks = ({
    popups: t,
    activePopup: s,
    maxVisible: n = 4,
    onPopupSelect: o,
    onPopupDismiss: c,
    position: l = 'bottom',
  }) => {
    if (t.length === 0) return null;
    const d = [...t].sort((i, p) => {
      const m = { high: 0, medium: 1, low: 2 };
      return m[i.priority] !== m[p.priority]
        ? m[i.priority] - m[p.priority]
        : p.timestamp.getTime() - i.timestamp.getTime();
    });
    return e.jsx('div', {
      className: T.popupStack,
      style: {
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '400px',
        zIndex: 1e3,
        pointerEvents: 'none',
        ...(l === 'top' && { top: '20px' }),
        ...(l === 'bottom' && { bottom: '260px' }),
        ...(l === 'center' && {
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          width: 'auto',
        }),
      },
      children: e.jsxs('div', {
        className: T.popupStackContainer,
        style: {
          display: 'flex',
          flexDirection: l === 'bottom' ? 'column-reverse' : 'column',
          gap: '4px',
          padding: l === 'center' ? '0' : '0 16px',
          pointerEvents: 'auto',
        },
        children: [
          d.length > 1 &&
            e.jsx('div', {
              className: T.popupStackHeader,
              style: {
                textAlign: 'center',
                padding: '8px 0',
                color: '#8E8E93',
                fontSize: '14px',
                fontWeight: '600',
                order: l === 'bottom' ? 1 : -1,
              },
              children: 'Notification Centre',
            }),
          s &&
            e.jsx('div', {
              className: T.popupStackActive,
              style: { order: 0 },
              children: d
                .filter(i => i.id === s)
                .map((i, p) =>
                  e.jsx(
                    X,
                    {
                      popup: i,
                      index: 0,
                      isActive: !0,
                      onClick: () => o(i.id),
                      onDismiss: () => c(i.id),
                      maxVisible: n,
                    },
                    i.id
                  )
                ),
            }),
          e.jsx('div', {
            className: T.popupStackInactive,
            style: { order: l === 'bottom' ? 2 : 1 },
            children: d
              .filter(i => i.id !== s)
              .slice(0, n - 1)
              .map((i, p) =>
                e.jsx(
                  X,
                  {
                    popup: i,
                    index: p + 1,
                    isActive: !1,
                    onClick: () => o(i.id),
                    onDismiss: () => c(i.id),
                    maxVisible: n,
                  },
                  i.id
                )
              ),
          }),
          d.filter(i => i.id !== s).length > n - 1 &&
            e.jsxs('div', {
              className: T.popupStackMore,
              style: {
                textAlign: 'center',
                padding: '8px 0',
                color: '#8E8E93',
                fontSize: '12px',
                fontWeight: '500',
                order: l === 'bottom' ? 3 : 2,
              },
              children: [
                '+',
                d.filter(i => i.id !== s).length - (n - 1),
                ' more',
              ],
            }),
        ],
      }),
    });
  },
  Qs = 'Hotel Mui Ne',
  Zs = 'AI-powered Voice Assistant - Supporting All Your Needs',
  Js = 'Tap To Speak',
  en = 'Room & Stay',
  tn = 'Room Services',
  sn = 'Bookings & Facilities',
  nn = 'Tourism & Exploration',
  on = 'Support to book external services',
  an = 'Order Ref',
  rn = 'Requested At',
  cn = 'Estimated Completion',
  ln = 'Time Remaining',
  dn = 'Mute',
  mn = 'Unmute',
  un = 'Confirm',
  pn = 'Please speak to the assistant first.',
  gn = 'Tap to speak',
  _n = 'Order Summary',
  hn = 'Confirm',
  fn = 'Add Note',
  xn = 'Room Number',
  bn = 'Enter room number',
  vn = 'Enter additional notes',
  yn = 'Summary',
  jn = 'Generated at',
  Nn = 'Order Confirmed!',
  wn =
    'Your request has been confirmed and forwarded to our staff. They will process it right away.',
  $n = 'Order Reference',
  kn = 'Estimated delivery time:',
  Cn = 'Return to Home',
  Sn = 'Language',
  Tn = 'English',
  Rn = 'French',
  In = 'Send',
  An = 'Cancel',
  Dn = 'End Call',
  En = 'Room',
  Pn = 'Order ID',
  zn = 'Guest Name',
  Fn = 'Content',
  Mn = 'Time',
  Bn = 'Status',
  Ln = 'Action',
  Hn = 'Message Guest',
  qn = 'Staff Request Management',
  On = 'Login',
  Vn = 'Username',
  Gn = 'Password',
  Wn = 'Tap the call button to start your request.',
  Un = 'Review and confirm your request for accuracy.',
  Yn = 'Your request will be sent to the reception for processing.',
  Xn = 'Acknowledged',
  Kn = 'In Progress',
  Qn = 'Delivering to You',
  Zn = 'Completed',
  Jn = 'Special Note',
  eo = 'Check-in/Check-out',
  to = 'Extended Stay Request',
  so = 'Room Information',
  no = 'Hotel Policies',
  oo = 'Wi-Fi Services',
  ao = 'Room Service Food',
  ro = 'Drinks & Bar Service',
  io = 'Room Cleaning',
  co = 'Laundry Service',
  lo = 'Wake-up Call',
  mo = 'Additional Amenities',
  uo = 'Maintenance Request',
  po = 'Restaurant Reservation',
  go = 'Spa Services',
  _o = 'Fitness Center',
  ho = 'Swimming Pool',
  fo = 'Car Rental',
  xo = 'Medical Assistance',
  bo = 'Customer Support',
  vo = 'Local Attractions',
  yo = 'Local Restaurants',
  jo = 'Public Transportation',
  No = 'Local Events',
  wo = 'Shopping Areas',
  $o = 'Area Maps',
  ko = 'Translation Services',
  Co = 'Leave a Review',
  So = 'Report an Issue',
  To = 'Luggage Services',
  Ro = 'Generating your summary...',
  Io = 'Speak Multiple Languages with Our AI Voice Assistant',
  Ao = {
    hotel_name: Qs,
    hotel_subtitle: Zs,
    press_to_call: Js,
    room_and_stay: en,
    room_services: tn,
    bookings_and_facilities: sn,
    tourism_and_exploration: nn,
    support_external_services: on,
    order_ref: an,
    requested_at: rn,
    estimated_completion: cn,
    time_remaining: ln,
    mute: dn,
    unmute: mn,
    confirm: un,
    need_conversation: pn,
    tap_to_speak: gn,
    order_summary: _n,
    send_to_reception: hn,
    add_note: fn,
    room_number: xn,
    enter_room_number: bn,
    enter_notes: vn,
    summary: yn,
    generated_at: jn,
    order_confirmed: Nn,
    order_confirmed_message: wn,
    order_reference: $n,
    estimated_delivery_time: kn,
    return_to_home: Cn,
    language: Sn,
    english: Tn,
    french: Rn,
    send: In,
    cancel: An,
    confirm_request: Dn,
    room: En,
    order_id: Pn,
    guest_name: zn,
    content: Fn,
    time: Mn,
    status: Bn,
    action: Ln,
    message_guest: Hn,
    request_management: qn,
    login: On,
    username: Vn,
    password: Gn,
    press_to_call_desc: Wn,
    confirm_request_desc: Un,
    send_to_reception_desc: Yn,
    status_acknowledged: Xn,
    status_in_progress: Kn,
    status_delivering: Qn,
    status_completed: Zn,
    status_note: Jn,
    icon_login: eo,
    icon_hourglass_empty: to,
    icon_info: so,
    icon_policy: no,
    icon_wifi: oo,
    icon_restaurant: ao,
    icon_local_bar: ro,
    icon_cleaning_services: io,
    icon_local_laundry_service: co,
    icon_alarm: lo,
    icon_add_circle: mo,
    icon_build: uo,
    icon_event_seat: po,
    icon_spa: go,
    icon_fitness_center: _o,
    icon_pool: ho,
    icon_directions_car: fo,
    icon_medical_services: xo,
    icon_support_agent: bo,
    icon_location_on: vo,
    icon_local_dining: yo,
    icon_directions_bus: jo,
    icon_event: No,
    icon_shopping_bag: wo,
    icon_map: $o,
    icon_translate: ko,
    icon_rate_review: Co,
    icon_report_problem: So,
    icon_luggage: To,
    generating_your_summary: Ro,
    speak_multiple_languages: Io,
  },
  Do = 'Bienvenue à Mi Nhon Hotel',
  Eo = 'Commencer',
  Po = 'Langue',
  zo = 'Anglais',
  Fo = 'Français',
  Mo = 'Envoyer',
  Bo = 'Annuler',
  Lo = 'Confirmer la demande',
  Ho = 'Chambre',
  qo = 'ID de commande',
  Oo = 'Nom du client',
  Vo = 'Contenu',
  Go = 'Heure',
  Wo = 'Statut',
  Uo = 'Action',
  Yo = 'Message au client',
  Xo = 'Gestion des demandes du personnel',
  Ko = 'Connexion',
  Qo = "Nom d'utilisateur",
  Zo = 'Mot de passe',
  Jo = 'Hotel Mui Ne',
  ea = 'Assistant vocal IA - À votre service pour tous vos besoins',
  ta = 'Appuyez pour appeler',
  sa = 'Chambre & Séjour',
  na = 'Services de chambre',
  oa = 'Réservations & Installations',
  aa = 'Tourisme & Exploration',
  ra = 'Assistance pour services externes',
  ia = 'Réf. commande',
  ca = 'Demandé à',
  la = 'Fin estimée',
  da = 'Temps restant',
  ma = 'Muet',
  ua = 'Rétablir le son',
  pa = 'Confirmer',
  ga = "Veuillez d'abord parler avec l'assistant.",
  _a = 'Appuyez pour parler',
  ha = 'Récapitulatif de la commande',
  fa = 'Envoyer à la réception',
  xa = 'Ajouter une note',
  ba = 'Numéro de chambre',
  va = 'Saisir le numéro de chambre',
  ya = 'Saisir des notes supplémentaires',
  ja = 'Résumé',
  Na = 'Généré à',
  wa = 'Commande confirmée !',
  $a =
    'Votre demande a été confirmée et transmise à notre personnel. Elle sera traitée immédiatement.',
  ka = 'Référence de la commande',
  Ca = 'Heure de livraison estimée :',
  Sa = "Retour à l'accueil",
  Ta = "Appuyez sur le bouton d'appel pour démarrer votre demande.",
  Ra = 'Vérifiez et confirmez votre demande pour plus de précision.',
  Ia = 'Votre demande sera envoyée à la réception pour traitement.',
  Aa = 'Reçue',
  Da = 'En cours',
  Ea = 'En livraison',
  Pa = 'Terminée',
  za = 'Note spéciale',
  Fa = 'Arrivée/Départ',
  Ma = 'Prolongation de séjour',
  Ba = 'Informations sur la chambre',
  La = "Politiques de l'hôtel",
  Ha = 'Services Wi-Fi',
  qa = 'Service de restauration',
  Oa = 'Service de bar',
  Va = 'Nettoyage de chambre',
  Ga = 'Service de blanchisserie',
  Wa = 'Service de réveil',
  Ua = 'Aménités supplémentaires',
  Ya = 'Demande de maintenance',
  Xa = 'Réservation au restaurant',
  Ka = 'Services de spa',
  Qa = 'Centre de fitness',
  Za = 'Piscine',
  Ja = 'Location de voiture',
  er = 'Assistance médicale',
  tr = 'Service client',
  sr = 'Attractions locales',
  nr = 'Restaurants locaux',
  or = 'Transports publics',
  ar = 'Événements locaux',
  rr = 'Zones commerciales',
  ir = 'Cartes de la région',
  cr = 'Services de traduction',
  lr = 'Laisser un avis',
  dr = 'Signaler un problème',
  mr = 'Services de bagagerie',
  ur = 'Génération de votre résumé...',
  pr = 'Parlez Plusieurs Langues avec Notre Assistant Vocal IA',
  gr = {
    welcome: Do,
    start: Eo,
    language: Po,
    english: zo,
    french: Fo,
    send: Mo,
    cancel: Bo,
    confirm_request: Lo,
    room: Ho,
    order_id: qo,
    guest_name: Oo,
    content: Vo,
    time: Go,
    status: Wo,
    action: Uo,
    message_guest: Yo,
    request_management: Xo,
    login: Ko,
    username: Qo,
    password: Zo,
    hotel_name: Jo,
    hotel_subtitle: ea,
    press_to_call: ta,
    room_and_stay: sa,
    room_services: na,
    bookings_and_facilities: oa,
    tourism_and_exploration: aa,
    support_external_services: ra,
    order_ref: ia,
    requested_at: ca,
    estimated_completion: la,
    time_remaining: da,
    mute: ma,
    unmute: ua,
    confirm: pa,
    need_conversation: ga,
    tap_to_speak: _a,
    order_summary: ha,
    send_to_reception: fa,
    add_note: xa,
    room_number: ba,
    enter_room_number: va,
    enter_notes: ya,
    summary: ja,
    generated_at: Na,
    order_confirmed: wa,
    order_confirmed_message: $a,
    order_reference: ka,
    estimated_delivery_time: Ca,
    return_to_home: Sa,
    press_to_call_desc: Ta,
    confirm_request_desc: Ra,
    send_to_reception_desc: Ia,
    status_acknowledged: Aa,
    status_in_progress: Da,
    status_delivering: Ea,
    status_completed: Pa,
    status_note: za,
    icon_login: Fa,
    icon_hourglass_empty: Ma,
    icon_info: Ba,
    icon_policy: La,
    icon_wifi: Ha,
    icon_restaurant: qa,
    icon_local_bar: Oa,
    icon_cleaning_services: Va,
    icon_local_laundry_service: Ga,
    icon_alarm: Wa,
    icon_add_circle: Ua,
    icon_build: Ya,
    icon_event_seat: Xa,
    icon_spa: Ka,
    icon_fitness_center: Qa,
    icon_pool: Za,
    icon_directions_car: Ja,
    icon_medical_services: er,
    icon_support_agent: tr,
    icon_location_on: sr,
    icon_local_dining: nr,
    icon_directions_bus: or,
    icon_event: ar,
    icon_shopping_bag: rr,
    icon_map: ir,
    icon_translate: cr,
    icon_rate_review: lr,
    icon_report_problem: dr,
    icon_luggage: mr,
    generating_your_summary: ur,
    speak_multiple_languages: pr,
  },
  _r = '欢迎来到美农酒店 (Mi Nhon Hotel)',
  hr = '开始',
  fr = '语言',
  xr = '英语',
  br = '法语',
  vr = '发送',
  yr = '取消',
  jr = '确认请求',
  Nr = '房间',
  wr = '订单编号',
  $r = '客人姓名',
  kr = '内容',
  Cr = '时间',
  Sr = '状态',
  Tr = '操作',
  Rr = '给客人的消息',
  Ir = '员工请求管理',
  Ar = '登录',
  Dr = '用户名',
  Er = '密码',
  Pr = '酒店 Mui Ne',
  zr = 'AI语音助手 - 满足您的所有需求',
  Fr = '按下呼叫',
  Mr = '房间与住宿',
  Br = '客房服务',
  Lr = '预订与设施',
  Hr = '旅游与探索',
  qr = '支持外部服务',
  Or = '订单参考',
  Vr = '请求时间',
  Gr = '预计完成时间',
  Wr = '剩余时间',
  Ur = '静音',
  Yr = '取消静音',
  Xr = '确认',
  Kr = '请先与助手对话。',
  Qr = '点击说话',
  Zr = '订单摘要',
  Jr = '发送到前台',
  ei = '添加备注',
  ti = '房间号',
  si = '输入房间号',
  ni = '输入附加备注',
  oi = '摘要',
  ai = '生成时间',
  ri = '订单已确认！',
  ii = '您的请求已确认并发送给我们的员工。我们会立即处理。',
  ci = '订单参考',
  li = '预计送达时间：',
  di = '返回首页',
  mi = '点击呼叫按钮开始您的请求。',
  ui = '请检查并确认您的请求以确保准确。',
  pi = '您的请求将被发送到前台进行处理。',
  gi = '已确认',
  _i = '处理中',
  hi = '配送中',
  fi = '已完成',
  xi = '特别说明',
  bi = '入住/退房',
  vi = '延长住宿请求',
  yi = '房间信息',
  ji = '酒店政策',
  Ni = '无线网络服务',
  wi = '客房餐饮服务',
  $i = '饮品与酒吧服务',
  ki = '房间清洁',
  Ci = '洗衣服务',
  Si = '唤醒服务',
  Ti = '额外设施',
  Ri = '维修请求',
  Ii = '餐厅预订',
  Ai = '水疗服务',
  Di = '健身中心',
  Ei = '游泳池',
  Pi = '租车服务',
  zi = '医疗援助',
  Fi = '客户支持',
  Mi = '当地景点',
  Bi = '当地餐厅',
  Li = '公共交通',
  Hi = '当地活动',
  qi = '购物区域',
  Oi = '区域地图',
  Vi = '翻译服务',
  Gi = '留下评论',
  Wi = '报告问题',
  Ui = '行李服务',
  Yi = '正在生成您的摘要...',
  Xi = {
    welcome: _r,
    start: hr,
    language: fr,
    english: xr,
    french: br,
    send: vr,
    cancel: yr,
    confirm_request: jr,
    room: Nr,
    order_id: wr,
    guest_name: $r,
    content: kr,
    time: Cr,
    status: Sr,
    action: Tr,
    message_guest: Rr,
    request_management: Ir,
    login: Ar,
    username: Dr,
    password: Er,
    hotel_name: Pr,
    hotel_subtitle: zr,
    press_to_call: Fr,
    room_and_stay: Mr,
    room_services: Br,
    bookings_and_facilities: Lr,
    tourism_and_exploration: Hr,
    support_external_services: qr,
    order_ref: Or,
    requested_at: Vr,
    estimated_completion: Gr,
    time_remaining: Wr,
    mute: Ur,
    unmute: Yr,
    confirm: Xr,
    need_conversation: Kr,
    tap_to_speak: Qr,
    order_summary: Zr,
    send_to_reception: Jr,
    add_note: ei,
    room_number: ti,
    enter_room_number: si,
    enter_notes: ni,
    summary: oi,
    generated_at: ai,
    order_confirmed: ri,
    order_confirmed_message: ii,
    order_reference: ci,
    estimated_delivery_time: li,
    return_to_home: di,
    press_to_call_desc: mi,
    confirm_request_desc: ui,
    send_to_reception_desc: pi,
    status_acknowledged: gi,
    status_in_progress: _i,
    status_delivering: hi,
    status_completed: fi,
    status_note: xi,
    icon_login: bi,
    icon_hourglass_empty: vi,
    icon_info: yi,
    icon_policy: ji,
    icon_wifi: Ni,
    icon_restaurant: wi,
    icon_local_bar: $i,
    icon_cleaning_services: ki,
    icon_local_laundry_service: Ci,
    icon_alarm: Si,
    icon_add_circle: Ti,
    icon_build: Ri,
    icon_event_seat: Ii,
    icon_spa: Ai,
    icon_fitness_center: Di,
    icon_pool: Ei,
    icon_directions_car: Pi,
    icon_medical_services: zi,
    icon_support_agent: Fi,
    icon_location_on: Mi,
    icon_local_dining: Bi,
    icon_directions_bus: Li,
    icon_event: Hi,
    icon_shopping_bag: qi,
    icon_map: Oi,
    icon_translate: Vi,
    icon_rate_review: Gi,
    icon_report_problem: Wi,
    icon_luggage: Ui,
    generating_your_summary: Yi,
  },
  Ki = 'Добро пожаловать в отель Mi Nhon',
  Qi = 'Начать',
  Zi = 'Язык',
  Ji = 'Английский',
  ec = 'Французский',
  tc = 'Русский',
  sc = 'Отправить',
  nc = 'Отмена',
  oc = 'Подтвердить запрос',
  ac = 'Номер',
  rc = 'ID заказа',
  ic = 'Имя гостя',
  cc = 'Содержание',
  lc = 'Время',
  dc = 'Статус',
  mc = 'Действие',
  uc = 'Сообщение гостю',
  pc = 'Управление запросами персонала',
  gc = 'Вход',
  _c = 'Имя пользователя',
  hc = 'Пароль',
  fc = 'Отель Mui Ne',
  xc = 'ИИ-ассистент - Поддержка всех ваших потребностей',
  bc = 'Нажмите для звонка',
  vc = 'Номер и проживание',
  yc = 'Услуги номера',
  jc = 'Бронирование и удобства',
  Nc = 'Туризм и исследование',
  wc = 'Поддержка внешних услуг',
  $c = 'Ссылка на заказ',
  kc = 'Запрошено в',
  Cc = 'Предполагаемое завершение',
  Sc = 'Оставшееся время',
  Tc = 'Без звука',
  Rc = 'Включить звук',
  Ic = 'Подтвердить',
  Ac = 'Пожалуйста, сначала поговорите с ассистентом.',
  Dc = 'Нажмите, чтобы говорить',
  Ec = 'Сводка заказа',
  Pc = 'Отправить на ресепшен',
  zc = 'Добавить заметку',
  Fc = 'Номер комнаты',
  Mc = 'Введите номер комнаты',
  Bc = 'Введите дополнительные заметки',
  Lc = 'Сводка',
  Hc = 'Сгенерировано в',
  qc = 'Заказ подтвержден!',
  Oc =
    'Ваш запрос подтвержден и передан нашему персоналу. Они обработают его немедленно.',
  Vc = 'Ссылка на заказ',
  Gc = 'Предполагаемое время доставки:',
  Wc = 'Вернуться на главную',
  Uc = 'Нажмите кнопку вызова, чтобы начать ваш запрос.',
  Yc = 'Проверьте и подтвердите ваш запрос для точности.',
  Xc = 'Ваш запрос будет отправлен на ресепшен для обработки.',
  Kc = 'Подтверждено',
  Qc = 'В процессе',
  Zc = 'Доставляется',
  Jc = 'Завершено',
  el = 'Особая заметка',
  tl = 'Регистрация/Выселение',
  sl = 'Запрос на продление проживания',
  nl = 'Информация о номере',
  ol = 'Правила отеля',
  al = 'Wi-Fi услуги',
  rl = 'Ресторанное обслуживание номеров',
  il = 'Напитки и бар',
  cl = 'Уборка номера',
  ll = 'Услуги прачечной',
  dl = 'Услуга будильника',
  ml = 'Дополнительные удобства',
  ul = 'Запрос на техническое обслуживание',
  pl = 'Бронирование ресторана',
  gl = 'СПА услуги',
  _l = 'Фитнес-центр',
  hl = 'Бассейн',
  fl = 'Аренда автомобиля',
  xl = 'Медицинская помощь',
  bl = 'Поддержка клиентов',
  vl = 'Местные достопримечательности',
  yl = 'Местные рестораны',
  jl = 'Общественный транспорт',
  Nl = 'Местные мероприятия',
  wl = 'Торговые зоны',
  $l = 'Карты местности',
  kl = 'Услуги перевода',
  Cl = 'Оставить отзыв',
  Sl = 'Сообщить о проблеме',
  Tl = 'Услуги багажа',
  Rl = 'Генерируется ваш итог...',
  Il = {
    welcome: Ki,
    start: Qi,
    language: Zi,
    english: Ji,
    french: ec,
    russian: tc,
    send: sc,
    cancel: nc,
    confirm_request: oc,
    room: ac,
    order_id: rc,
    guest_name: ic,
    content: cc,
    time: lc,
    status: dc,
    action: mc,
    message_guest: uc,
    request_management: pc,
    login: gc,
    username: _c,
    password: hc,
    hotel_name: fc,
    hotel_subtitle: xc,
    press_to_call: bc,
    room_and_stay: vc,
    room_services: yc,
    bookings_and_facilities: jc,
    tourism_and_exploration: Nc,
    support_external_services: wc,
    order_ref: $c,
    requested_at: kc,
    estimated_completion: Cc,
    time_remaining: Sc,
    mute: Tc,
    unmute: Rc,
    confirm: Ic,
    need_conversation: Ac,
    tap_to_speak: Dc,
    order_summary: Ec,
    send_to_reception: Pc,
    add_note: zc,
    room_number: Fc,
    enter_room_number: Mc,
    enter_notes: Bc,
    summary: Lc,
    generated_at: Hc,
    order_confirmed: qc,
    order_confirmed_message: Oc,
    order_reference: Vc,
    estimated_delivery_time: Gc,
    return_to_home: Wc,
    press_to_call_desc: Uc,
    confirm_request_desc: Yc,
    send_to_reception_desc: Xc,
    status_acknowledged: Kc,
    status_in_progress: Qc,
    status_delivering: Zc,
    status_completed: Jc,
    status_note: el,
    icon_login: tl,
    icon_hourglass_empty: sl,
    icon_info: nl,
    icon_policy: ol,
    icon_wifi: al,
    icon_restaurant: rl,
    icon_local_bar: il,
    icon_cleaning_services: cl,
    icon_local_laundry_service: ll,
    icon_alarm: dl,
    icon_add_circle: ml,
    icon_build: ul,
    icon_event_seat: pl,
    icon_spa: gl,
    icon_fitness_center: _l,
    icon_pool: hl,
    icon_directions_car: fl,
    icon_medical_services: xl,
    icon_support_agent: bl,
    icon_location_on: vl,
    icon_local_dining: yl,
    icon_directions_bus: jl,
    icon_event: Nl,
    icon_shopping_bag: wl,
    icon_map: $l,
    icon_translate: kl,
    icon_rate_review: Cl,
    icon_report_problem: Sl,
    icon_luggage: Tl,
    generating_your_summary: Rl,
  },
  Al = '미년 호텔에 오신 것을 환영합니다',
  Dl = '시작',
  El = '언어',
  Pl = '영어',
  zl = '프랑스어',
  Fl = '러시아어',
  Ml = '한국어',
  Bl = '보내기',
  Ll = '취소',
  Hl = '요청 확인',
  ql = '객실',
  Ol = '주문 ID',
  Vl = '투숙객 이름',
  Gl = '내용',
  Wl = '시간',
  Ul = '상태',
  Yl = '동작',
  Xl = '게스트에게 메시지 보내기',
  Kl = '직원 요청 관리',
  Ql = '로그인',
  Zl = '사용자 이름',
  Jl = '비밀번호',
  ed = '무이네 호텔',
  td = 'AI 어시스턴트 - 모든 필요를 지원합니다',
  sd = '호출하려면 누르세요',
  nd = '객실 및 숙박',
  od = '객실 서비스',
  ad = '예약 및 시설',
  rd = '관광 및 탐험',
  id = '외부 서비스 지원',
  cd = '주문 참조',
  ld = '요청 시간',
  dd = '예상 완료 시간',
  md = '남은 시간',
  ud = '음소거',
  pd = '음소거 해제',
  gd = '확인',
  _d = '먼저 어시스턴트와 대화해 주세요.',
  hd = '말하려면 누르세요',
  fd = '주문 요약',
  xd = '프런트로 보내기',
  bd = '메모 추가',
  vd = '객실 번호',
  yd = '객실 번호를 입력하세요',
  jd = '추가 메모를 입력하세요',
  Nd = '요약',
  wd = '생성 시간',
  $d = '주문이 확인되었습니다!',
  kd = '귀하의 요청이 확인되어 직원에게 전달되었습니다. 즉시 처리하겠습니다.',
  Cd = '주문 참조',
  Sd = '예상 배달 시간:',
  Td = '홈으로 돌아가기',
  Rd = '요청을 시작하려면 호출 버튼을 누르세요.',
  Id = '정확성을 위해 요청을 확인하세요.',
  Ad = '귀하의 요청이 프런트로 전송되어 처리됩니다.',
  Dd = '접수됨',
  Ed = '처리 중',
  Pd = '배달 중',
  zd = '완료됨',
  Fd = '특별 안내',
  Md = '체크인/체크아웃',
  Bd = '숙박 연장 요청',
  Ld = '객실 정보',
  Hd = '호텔 정책',
  qd = '와이파이 서비스',
  Od = '룸서비스 음식',
  Vd = '음료 및 바 서비스',
  Gd = '객실 청소',
  Wd = '세탁 서비스',
  Ud = '모닝콜 서비스',
  Yd = '추가 편의 시설',
  Xd = '유지보수 요청',
  Kd = '레스토랑 예약',
  Qd = '스파 서비스',
  Zd = '피트니스 센터',
  Jd = '수영장',
  em = '렌터카',
  tm = '의료 지원',
  sm = '고객 지원',
  nm = '지역 명소',
  om = '지역 레스토랑',
  am = '대중교통',
  rm = '지역 이벤트',
  im = '쇼핑 지역',
  cm = '지역 지도',
  lm = '번역 서비스',
  dm = '리뷰 남기기',
  mm = '문제 신고',
  um = '수화물 서비스',
  pm = '요약을 생성하는 중...',
  gm = {
    welcome: Al,
    start: Dl,
    language: El,
    english: Pl,
    french: zl,
    russian: Fl,
    korean: Ml,
    send: Bl,
    cancel: Ll,
    confirm_request: Hl,
    room: ql,
    order_id: Ol,
    guest_name: Vl,
    content: Gl,
    time: Wl,
    status: Ul,
    action: Yl,
    message_guest: Xl,
    request_management: Kl,
    login: Ql,
    username: Zl,
    password: Jl,
    hotel_name: ed,
    hotel_subtitle: td,
    press_to_call: sd,
    room_and_stay: nd,
    room_services: od,
    bookings_and_facilities: ad,
    tourism_and_exploration: rd,
    support_external_services: id,
    order_ref: cd,
    requested_at: ld,
    estimated_completion: dd,
    time_remaining: md,
    mute: ud,
    unmute: pd,
    confirm: gd,
    need_conversation: _d,
    tap_to_speak: hd,
    order_summary: fd,
    send_to_reception: xd,
    add_note: bd,
    room_number: vd,
    enter_room_number: yd,
    enter_notes: jd,
    summary: Nd,
    generated_at: wd,
    order_confirmed: $d,
    order_confirmed_message: kd,
    order_reference: Cd,
    estimated_delivery_time: Sd,
    return_to_home: Td,
    press_to_call_desc: Rd,
    confirm_request_desc: Id,
    send_to_reception_desc: Ad,
    status_acknowledged: Dd,
    status_in_progress: Ed,
    status_delivering: Pd,
    status_completed: zd,
    status_note: Fd,
    icon_login: Md,
    icon_hourglass_empty: Bd,
    icon_info: Ld,
    icon_policy: Hd,
    icon_wifi: qd,
    icon_restaurant: Od,
    icon_local_bar: Vd,
    icon_cleaning_services: Gd,
    icon_local_laundry_service: Wd,
    icon_alarm: Ud,
    icon_add_circle: Yd,
    icon_build: Xd,
    icon_event_seat: Kd,
    icon_spa: Qd,
    icon_fitness_center: Zd,
    icon_pool: Jd,
    icon_directions_car: em,
    icon_medical_services: tm,
    icon_support_agent: sm,
    icon_location_on: nm,
    icon_local_dining: om,
    icon_directions_bus: am,
    icon_event: rm,
    icon_shopping_bag: im,
    icon_map: cm,
    icon_translate: lm,
    icon_rate_review: dm,
    icon_report_problem: mm,
    icon_luggage: um,
    generating_your_summary: pm,
  },
  _m = 'Khách sạn Mui Ne',
  hm = 'Trợ lý giọng nói AI - Hỗ trợ mọi nhu cầu của bạn',
  fm = 'Nhấn để nói',
  xm = 'Phòng & Lưu trú',
  bm = 'Dịch vụ phòng',
  vm = 'Đặt chỗ & Tiện ích',
  ym = 'Du lịch & Khám phá',
  jm = 'Hỗ trợ đặt dịch vụ bên ngoài',
  Nm = 'Mã đơn',
  wm = 'Thời gian yêu cầu',
  $m = 'Dự kiến hoàn thành',
  km = 'Thời gian còn lại',
  Cm = 'Tắt mic',
  Sm = 'Bật mic',
  Tm = 'Xác nhận',
  Rm = 'Vui lòng nói chuyện với trợ lý trước.',
  Im = 'Chạm để nói',
  Am = 'Tóm tắt đơn hàng',
  Dm = 'Xác nhận',
  Em = 'Thêm ghi chú',
  Pm = 'Số phòng',
  zm = 'Nhập số phòng',
  Fm = 'Nhập ghi chú bổ sung',
  Mm = 'Tóm tắt',
  Bm = 'Tạo lúc',
  Lm = 'Đã xác nhận đơn!',
  Hm =
    'Yêu cầu của bạn đã được xác nhận và chuyển đến nhân viên. Chúng tôi sẽ xử lý ngay lập tức.',
  qm = 'Mã tham chiếu',
  Om = 'Thời gian giao dự kiến:',
  Vm = 'Về trang chủ',
  Gm = 'Ngôn ngữ',
  Wm = 'Tiếng Anh',
  Um = 'Tiếng Pháp',
  Ym = 'Gửi',
  Xm = 'Hủy',
  Km = 'Kết thúc cuộc gọi',
  Qm = 'Phòng',
  Zm = 'Mã đơn',
  Jm = 'Tên khách',
  eu = 'Nội dung',
  tu = 'Thời gian',
  su = 'Trạng thái',
  nu = 'Hành động',
  ou = 'Nhắn khách',
  au = 'Quản lý yêu cầu nhân viên',
  ru = 'Đăng nhập',
  iu = 'Tên đăng nhập',
  cu = 'Mật khẩu',
  lu = 'Nhấn nút gọi để bắt đầu yêu cầu của bạn.',
  du = 'Xem lại và xác nhận yêu cầu của bạn.',
  mu = 'Yêu cầu của bạn sẽ được gửi đến lễ tân để xử lý.',
  uu = 'Đã ghi nhận',
  pu = 'Đang xử lý',
  gu = 'Đang giao cho bạn',
  _u = 'Đã hoàn thành',
  hu = 'Lưu ý đặc biệt',
  fu = 'Nhận/Trả phòng',
  xu = 'Yêu cầu gia hạn lưu trú',
  bu = 'Thông tin phòng',
  vu = 'Chính sách khách sạn',
  yu = 'Dịch vụ Wi-Fi',
  ju = 'Đồ ăn tại phòng',
  Nu = 'Dịch vụ đồ uống & quầy bar',
  wu = 'Dọn phòng',
  $u = 'Giặt là',
  ku = 'Báo thức',
  Cu = 'Tiện ích bổ sung',
  Su = 'Yêu cầu bảo trì',
  Tu = 'Đặt chỗ nhà hàng',
  Ru = 'Dịch vụ Spa',
  Iu = 'Trung tâm thể hình',
  Au = 'Hồ bơi',
  Du = 'Thuê xe',
  Eu = 'Hỗ trợ y tế',
  Pu = 'Chăm sóc khách hàng',
  zu = 'Điểm tham quan',
  Fu = 'Nhà hàng địa phương',
  Mu = 'Phương tiện công cộng',
  Bu = 'Sự kiện địa phương',
  Lu = 'Khu mua sắm',
  Hu = 'Bản đồ khu vực',
  qu = 'Dịch vụ phiên dịch',
  Ou = 'Đánh giá',
  Vu = 'Báo sự cố',
  Gu = 'Dịch vụ hành lý',
  Wu = 'Đang tạo tóm tắt của bạn...',
  Uu = 'Nói Nhiều Ngôn Ngữ với Trợ Lý AI của Chúng Tôi',
  Yu = {
    hotel_name: _m,
    hotel_subtitle: hm,
    press_to_call: fm,
    room_and_stay: xm,
    room_services: bm,
    bookings_and_facilities: vm,
    tourism_and_exploration: ym,
    support_external_services: jm,
    order_ref: Nm,
    requested_at: wm,
    estimated_completion: $m,
    time_remaining: km,
    mute: Cm,
    unmute: Sm,
    confirm: Tm,
    need_conversation: Rm,
    tap_to_speak: Im,
    order_summary: Am,
    send_to_reception: Dm,
    add_note: Em,
    room_number: Pm,
    enter_room_number: zm,
    enter_notes: Fm,
    summary: Mm,
    generated_at: Bm,
    order_confirmed: Lm,
    order_confirmed_message: Hm,
    order_reference: qm,
    estimated_delivery_time: Om,
    return_to_home: Vm,
    language: Gm,
    english: Wm,
    french: Um,
    send: Ym,
    cancel: Xm,
    confirm_request: Km,
    room: Qm,
    order_id: Zm,
    guest_name: Jm,
    content: eu,
    time: tu,
    status: su,
    action: nu,
    message_guest: ou,
    request_management: au,
    login: ru,
    username: iu,
    password: cu,
    press_to_call_desc: lu,
    confirm_request_desc: du,
    send_to_reception_desc: mu,
    status_acknowledged: uu,
    status_in_progress: pu,
    status_delivering: gu,
    status_completed: _u,
    status_note: hu,
    icon_login: fu,
    icon_hourglass_empty: xu,
    icon_info: bu,
    icon_policy: vu,
    icon_wifi: yu,
    icon_restaurant: ju,
    icon_local_bar: Nu,
    icon_cleaning_services: wu,
    icon_local_laundry_service: $u,
    icon_alarm: ku,
    icon_add_circle: Cu,
    icon_build: Su,
    icon_event_seat: Tu,
    icon_spa: Ru,
    icon_fitness_center: Iu,
    icon_pool: Au,
    icon_directions_car: Du,
    icon_medical_services: Eu,
    icon_support_agent: Pu,
    icon_location_on: zu,
    icon_local_dining: Fu,
    icon_directions_bus: Mu,
    icon_event: Bu,
    icon_shopping_bag: Lu,
    icon_map: Hu,
    icon_translate: qu,
    icon_rate_review: Ou,
    icon_report_problem: Vu,
    icon_luggage: Gu,
    generating_your_summary: Wu,
    speak_multiple_languages: Uu,
  },
  Xu = { en: Ao, fr: gr, zh: Xi, ru: Il, ko: gm, vi: Yu };
function M(t, s = 'en') {
  return Xu[s][t] || t;
}
const Ku = () =>
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
  Qu = () =>
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
  Zu = () =>
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
        callSummary: t,
        serviceRequests: s,
        language: n,
        callDetails: o,
      } = q(),
      l = (() => {
        if (t && t.content) {
          const d = vs(t.content),
            i = ys(t.content);
          return {
            source: 'Vapi.ai',
            roomNumber: d || 'Unknown',
            content: t.content,
            items: i.items || [],
            timestamp: t.timestamp,
            hasData: !0,
          };
        }
        return s && s.length > 0
          ? {
              source: 'OpenAI Enhanced',
              roomNumber: s[0]?.details?.roomNumber || 'Unknown',
              content: s.map(i => `${i.serviceType}: ${i.requestText}`).join(`
`),
              items: s.map(i => ({
                name: i.serviceType,
                description: i.requestText,
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
              children: ['📋 ', M('summary', n)],
            }),
            e.jsx('span', {
              className: 'text-gray-500 text-[10px]',
              children: l.source,
            }),
          ],
        }),
        l.hasData
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
                          children: l.roomNumber,
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
                          children: l.items.length,
                        }),
                      ],
                    }),
                  ],
                }),
                l.items.length > 0 &&
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
                          l.items
                            .slice(0, 3)
                            .map((d, i) =>
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
                                i
                              )
                            ),
                          l.items.length > 3 &&
                            e.jsxs('div', {
                              className: 'text-[10px] text-gray-500 italic',
                              children: [
                                '+',
                                l.items.length - 3,
                                ' more items...',
                              ],
                            }),
                        ],
                      }),
                    ],
                  }),
                e.jsx('div', {
                  className: 'text-[10px] text-gray-400 text-right',
                  children: l.timestamp.toLocaleTimeString(),
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
  jg = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        AlertDemoContent: Zu,
        ConversationDemoContent: Ku,
        NotificationDemoContent: Qu,
        SummaryPopupContent: V,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  Ju = ({
    position: t = 'bottom',
    maxVisible: s = 4,
    autoCloseDelay: n,
    isMobile: o = !1,
  }) => {
    const {
      popups: c,
      activePopup: l,
      setActivePopup: d,
      removePopup: i,
    } = O();
    a.useEffect(() => {
      if (!n) return;
      const g = [];
      return (
        c.forEach(f => {
          if (f.priority === 'low') {
            const N = setTimeout(() => {
              i(f.id);
            }, n);
            g.push(N);
          }
        }),
        () => {
          g.forEach(f => clearTimeout(f));
        }
      );
    }, [c, n, i]);
    const p = g => {
        d(l === g ? null : g);
      },
      m = g => {
        if ((i(g), l === g && c.length > 1)) {
          const f = c.filter(N => N.id !== g);
          f.length > 0 && d(f[0].id);
        }
      },
      u = c.filter(g => g.type !== 'summary');
    return e.jsxs(e.Fragment, {
      children: [
        u.length > 0 &&
          e.jsx(Ks, {
            popups: u,
            activePopup: l,
            maxVisible: s,
            onPopupSelect: p,
            onPopupDismiss: m,
            position: t,
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
  Ng = () => {
    const { addPopup: t, removePopup: s, setActivePopup: n } = O();
    return {
      showConversation: (m, u) =>
        t({
          type: 'conversation',
          title: u?.title || 'Realtime Conversation',
          content: m,
          priority: u?.priority || 'high',
          isActive: !0,
          badge: u?.badge,
        }),
      showStaffMessage: (m, u) =>
        t({
          type: 'staff',
          title: u?.title || 'Staff Message',
          content: m,
          priority: u?.priority || 'medium',
          isActive: !1,
          badge: u?.badge,
        }),
      showNotification: (m, u) =>
        t({
          type: 'notification',
          title: u?.title || 'Hotel Notification',
          content: m,
          priority: u?.priority || 'low',
          isActive: !1,
          badge: u?.badge,
        }),
      showAlert: (m, u) =>
        t({
          type: 'alert',
          title: u?.title || 'System Alert',
          content: m,
          priority: u?.priority || 'high',
          isActive: !0,
          badge: u?.badge,
        }),
      showOrderUpdate: (m, u) =>
        t({
          type: 'order',
          title: u?.title || 'Order Update',
          content: m,
          priority: u?.priority || 'medium',
          isActive: !1,
          badge: u?.badge,
        }),
      showSummary: (m, u) =>
        t({
          type: 'summary',
          title: u?.title || 'Call Summary',
          content: m || e.jsx(V, {}),
          priority: u?.priority || 'high',
          isActive: !1,
        }),
      removePopup: s,
      setActivePopup: n,
    };
  },
  j = {
    colors: { primary: '#1B4E8B', secondary: '#3B82F6', error: '#EF4444' },
    fonts: {
      primary:
        "'Inter', 'Poppins', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    spacing: { xl: '40px' },
    shadows: { card: '0 4px 16px rgba(0, 0, 0, 0.15)' },
    transitions: { normal: '0.3s ease-in-out' },
  },
  ep = {
    SCROLL_THRESHOLD: 300,
    THROTTLE_DELAY: 100,
    AUTO_SCROLL_DELAY: 300,
    COLORS: { BACKGROUND: '#2C3E50' },
    SCROLL_OFFSETS: { NEGATIVE_TOP_THRESHOLD: -100 },
  },
  Xe = ({ children: t, className: s = '' }) =>
    e.jsx('div', {
      className: `relative min-h-screen w-full scroll-smooth overflow-y-auto ${s}`,
      style: {
        fontFamily: j.fonts.primary,
        backgroundColor: ep.COLORS.BACKGROUND,
      },
      children: e.jsx('div', {
        className: 'container mx-auto px-4 py-8 relative z-10',
        children: e.jsx('div', {
          className:
            'flex flex-col items-center justify-center space-y-8 md:space-y-12',
          children: t,
        }),
      }),
    }),
  Ke = () =>
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
  tp = ({ error: t, onRetry: s }) => {
    const n = () => {
      try {
        (localStorage.removeItem('conversationState'),
          sessionStorage.removeItem('interface1State'),
          window.scrollTo({ top: 0, behavior: 'smooth' }),
          s ? s() : window.location.reload());
      } catch (o) {
        (console.error('Failed to reset Interface1:', o),
          window.location.reload());
      }
    };
    return e.jsx(Xe, {
      children: e.jsxs('div', {
        className: 'relative',
        children: [
          e.jsx(Ke, {}),
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
                t &&
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
                        children: t.toString(),
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
  sp = () =>
    e.jsx('div', {
      className:
        'absolute w-full min-h-screen h-full flex items-center justify-center z-10',
      style: {
        background: `linear-gradient(135deg, ${j.colors.primary}, ${j.colors.secondary})`,
        fontFamily: j.fonts.primary,
      },
      children: e.jsxs('div', {
        className: 'text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl',
        style: { boxShadow: j.shadows.card },
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
  np = ({ error: t }) =>
    e.jsx('div', {
      className:
        'absolute w-full min-h-screen h-full flex items-center justify-center z-10',
      style: {
        background: `linear-gradient(135deg, ${j.colors.primary}, ${j.colors.error})`,
        fontFamily: j.fonts.primary,
      },
      children: e.jsxs('div', {
        className: 'text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl',
        style: { boxShadow: j.shadows.card },
        children: [
          e.jsx('div', {
            className: 'text-white text-xl font-semibold mb-4',
            children: 'Failed to load hotel configuration',
          }),
          e.jsx('p', { className: 'text-white/80', children: t }),
        ],
      }),
    }),
  D = [
    {
      name: 'Room Service',
      icon: _t,
      description: 'In-room dining and housekeeping services',
    },
    {
      name: 'Restaurant',
      icon: ht,
      description: 'Hotel restaurants and dining options',
    },
    { name: 'Concierge', icon: U, description: 'Concierge and guest services' },
    {
      name: 'Pool & Gym',
      icon: ft,
      description: 'Swimming pool and fitness facilities',
    },
    {
      name: 'Spa & Wellness',
      icon: xt,
      description: 'Spa treatments and wellness services',
    },
    { name: 'Bar & Lounge', icon: bt, description: 'Hotel bars and lounges' },
    {
      name: 'Transportation',
      icon: vt,
      description: 'Transportation and taxi services',
    },
    {
      name: 'Local Guide',
      icon: yt,
      description: 'Local area guide and information',
    },
    {
      name: 'Reception',
      icon: jt,
      description: 'Front desk and reception services',
    },
    {
      name: 'Guest Services',
      icon: U,
      description: 'Additional guest services',
    },
  ],
  op = () =>
    e.jsxs('div', {
      className: 'w-full max-w-full',
      children: [
        e.jsx('div', {
          className: 'block md:hidden space-y-4 px-4 py-6',
          children: D.map((t, s) => {
            const n = t.icon;
            return e.jsxs(
              'div',
              {
                className: 'flex items-center space-x-4 p-4 rounded-xl',
                style: {
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: j.transitions.normal,
                  cursor: 'pointer',
                  boxShadow: j.shadows.card,
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
                        children: t.name,
                      }),
                      t.description &&
                        e.jsx('div', {
                          className: 'text-sm text-gray-300 mt-1',
                          children: t.description,
                        }),
                    ],
                  }),
                ],
              },
              s
            );
          }),
        }),
        e.jsxs('div', {
          className: 'hidden md:block w-full max-w-6xl mx-auto px-6 py-8',
          children: [
            e.jsx('div', {
              className: 'grid grid-cols-5 gap-4 mb-4',
              children: D.slice(0, 5).map((t, s) => {
                const n = t.icon;
                return e.jsxs(
                  'div',
                  {
                    className:
                      'relative group w-full h-32 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105',
                    style: {
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: j.shadows.card,
                    },
                    children: [
                      e.jsx('div', {
                        className: 'text-white mb-2',
                        children: e.jsx(n, { size: 28 }),
                      }),
                      e.jsx('div', {
                        className: 'text-white text-center text-sm font-medium',
                        children: t.name,
                      }),
                      t.description &&
                        e.jsx('div', {
                          className:
                            'absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-white text-xs text-center rounded-xl',
                          children: t.description,
                        }),
                    ],
                  },
                  s
                );
              }),
            }),
            D.length > 5 &&
              e.jsx('div', {
                className: 'grid grid-cols-5 gap-4',
                children: D.slice(5).map((t, s) => {
                  const n = t.icon;
                  return e.jsxs(
                    'div',
                    {
                      className:
                        'relative group w-full h-32 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105',
                      style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: j.shadows.card,
                      },
                      children: [
                        e.jsx('div', {
                          className: 'text-white mb-2',
                          children: e.jsx(n, { size: 28 }),
                        }),
                        e.jsx('div', {
                          className:
                            'text-white text-center text-sm font-medium',
                          children: t.name,
                        }),
                        t.description &&
                          e.jsx('div', {
                            className:
                              'absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 text-white text-xs text-center rounded-xl',
                            children: t.description,
                          }),
                      ],
                    },
                    s + 5
                  );
                }),
              }),
          ],
        }),
      ],
    }),
  Qe = a.forwardRef(({ className: t = '' }, s) =>
    e.jsx('div', {
      ref: s,
      className: `w-full max-w-full hidden md:block ${t}`,
      children: e.jsx(op, {}),
    })
  );
Qe.displayName = 'ServiceGridContainer';
const K = ({
    isOpen: t,
    onClose: s,
    layout: n = 'overlay',
    className: o = '',
  }) => {
    const {
        transcripts: c,
        modelOutput: l,
        language: d,
        callDuration: i,
      } = q(),
      p = a.useRef(null),
      m = a.useRef({}),
      [u, g] = a.useState(!1),
      [f, N] = a.useState({}),
      [_, y] = a.useState([]);
    a.useEffect(() => {
      t && !u ? g(!0) : t || g(!1);
    }, [t, u]);
    const W = () => {
      (Object.values(m.current).forEach(w => {
        w && cancelAnimationFrame(w);
      }),
        (m.current = {}));
    };
    if (
      (a.useEffect(() => W, []),
      a.useEffect(() => {
        if (!c || c.length === 0) {
          y([]);
          return;
        }
        const w = [...c].sort(
            (h, A) => h.timestamp.getTime() - A.timestamp.getTime()
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
      }, [c]),
      a.useEffect(() => {
        _.filter(x => x.role === 'assistant')
          .flatMap(x => x.messages)
          .forEach(x => {
            if (!f[x.id]) {
              N(h => ({ ...h, [x.id]: 0 }));
              const b = () => {
                N(h => {
                  const A = h[x.id] || 0;
                  if (A < x.content.length) {
                    const pt = requestAnimationFrame(b);
                    return ((m.current[x.id] = pt), { ...h, [x.id]: A + 1 });
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
      !t)
    )
      return null;
    const $ = n === 'grid',
      C = a.useMemo(
        () =>
          $
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
                maxWidth: `${gs}px`,
                height: `${ps}px`,
                maxHeight: `${us}vh`,
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
        [$]
      ),
      S = () =>
        e.jsxs('div', {
          className: `relative z-30 overflow-hidden shadow-2xl chat-popup ${$ ? 'grid-layout' : 'overlay-layout'} ${!$ && u ? 'mx-auto animate-slide-up' : 'mx-auto'}`,
          style: C,
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
                    children: ['💬 ', M('chat', d)],
                  }),
                }),
                e.jsx('button', {
                  onClick: s,
                  className:
                    'p-1.5 hover:bg-gray-100 rounded-full transition-colors',
                  children: e.jsx(R, { className: 'w-4 h-4 text-gray-500' }),
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
                    children: M('tap_to_speak', d),
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
    return $
      ? e.jsx(S, {})
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
                children: e.jsx(S, {}),
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
  Ze = ({
    isOpen: t,
    onClose: s,
    layout: n = 'center-modal',
    className: o = '',
  }) => {
    const { handleSendToFrontDesk: c, isSubmitting: l } = _s({
      onSuccess: () => {
        (alert('✅ Request sent to Front Desk successfully!'), s());
      },
      onError: p => {
        alert(`❌ ${p}`);
      },
    });
    if (!t) return null;
    const d = n === 'grid',
      i = () =>
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
                  onClick: s,
                  className:
                    'p-1 hover:bg-gray-100 rounded-full transition-colors',
                  'aria-label': 'Close summary',
                  children: e.jsx(R, { size: 20, className: 'text-gray-500' }),
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
                      onClick: s,
                      disabled: l,
                      className:
                        'flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors',
                      children: 'Cancel',
                    }),
                    e.jsx('button', {
                      onClick: c,
                      disabled: l,
                      className:
                        'flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center',
                      children: l
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
      ? e.jsx('div', { className: `relative ${o}`, children: e.jsx(i, {}) })
      : e.jsxs(e.Fragment, {
          children: [
            e.jsx('div', {
              className: 'fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md',
              onClick: s,
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
                children: e.jsx(i, {}),
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
  ap = () => {
    const { popups: t, removePopup: s } = O(),
      [n, o] = a.useState(!1);
    a.useEffect(() => {
      const l = t.find(d => d.type === 'summary');
      o(!!l);
    }, [t]);
    const c = () => {
      t.filter(l => l.type === 'summary').forEach(l => s(l.id));
    };
    return e.jsx(Ze, { isOpen: n, onClose: c, layout: 'center-modal' });
  },
  rp = ({ isActive: t }) => {
    const {
      isLoading: s,
      error: n,
      micLevel: o,
      heroSectionRef: c,
      serviceGridRef: l,
      isCallStarted: d,
      showConversation: i,
      handleCallStart: p,
      handleCallEnd: m,
      handleCancel: u,
      handleConfirm: g,
      showingSummary: f,
      showRightPanel: N,
      handleRightPanelClose: _,
    } = hs({ isActive: t });
    return (
      console.log('🔍 [Interface1] Popup States:', {
        isCallStarted: d,
        showConversation: i,
        chatPopupOpen: i && d,
        summaryPopupOpen: i && !d,
      }),
      s
        ? e.jsx(sp, {})
        : n
          ? e.jsx(np, { error: n })
          : e.jsxs(Xe, {
              children: [
                e.jsxs('div', {
                  ref: c,
                  className: 'relative',
                  children: [
                    e.jsx(Ke, {}),
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
                                  children: e.jsx(K, {
                                    isOpen: i && d,
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
                                    children: e.jsx(Y, {
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
                                  children: e.jsx(Ze, {
                                    isOpen: N,
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
                                children: e.jsx(Y, {
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
                            e.jsx(K, {
                              isOpen: i,
                              onClose: () => {},
                              layout: 'overlay',
                              className: 'fixed bottom-0 left-0 right-0 z-40',
                            }),
                            e.jsx(ap, {}),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'mt-16 relative z-10',
                  children: e.jsx(Qe, { ref: l }),
                }),
              ],
            })
    );
  },
  wg = () => {
    const t = js(),
      s = Ns(),
      { language: n, setLanguage: o } = q(),
      [c, l] = a.useState(n),
      [d, i] = a.useState(!1);
    a.useEffect(() => {
      localStorage.getItem('hasVisited') ||
        (i(!0), localStorage.setItem('hasVisited', 'true'));
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
        (l(y), o(y));
      },
      { logout: g } = P(),
      f = fs(),
      N = () => {
        (g(), t('/login'));
      };
    return e.jsx(xs, {
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
                      value: c,
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
                    s.pathname.includes('/staff') &&
                      e.jsx('button', {
                        onClick: N,
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
            children: e.jsx(ws, {
              fallbackComponent: tp,
              onError: (_, y) => {
                (console.error('🚨 [VoiceAssistant] Interface1 Error:', _),
                  console.error('🚨 [VoiceAssistant] Error Info:', y));
              },
              children: e.jsx(
                rp,
                { isActive: p.interface1 },
                'stable-interface1'
              ),
            }),
          }),
          e.jsx(Ju, {
            position: 'bottom',
            maxVisible: 4,
            autoCloseDelay: 1e4,
            isMobile: f,
          }),
        ],
      }),
    });
  },
  ip = I(
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
  cp = a.forwardRef(({ className: t, variant: s, size: n, ...o }, c) =>
    e.jsx('div', {
      ref: c,
      className: r(ip({ variant: s, size: n, className: t })),
      ...o,
    })
  );
cp.displayName = 'Card';
const lp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('div', { ref: n, className: r('flex flex-col space-y-1.5', t), ...s })
);
lp.displayName = 'CardHeader';
const dp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('h3', {
    ref: n,
    className: r('text-2xl font-semibold leading-none tracking-tight', t),
    ...s,
  })
);
dp.displayName = 'CardTitle';
const mp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('p', { ref: n, className: r('text-sm text-muted-foreground', t), ...s })
);
mp.displayName = 'CardDescription';
const up = a.forwardRef(({ className: t, padded: s = !0, ...n }, o) =>
  e.jsx('div', { ref: o, className: r(s && 'p-6 pt-0', t), ...n })
);
up.displayName = 'CardContent';
const pp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('div', { ref: n, className: r('flex items-center p-6 pt-0', t), ...s })
);
pp.displayName = 'CardFooter';
const gp = a.forwardRef(({ className: t, color: s = 'primary', ...n }, o) => {
  const c = {
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
      c[s],
      t
    ),
    ...n,
  });
});
gp.displayName = 'CardBadge';
const _p = a.forwardRef(({ className: t, alt: s, ...n }, o) =>
  e.jsx('img', {
    ref: o,
    className: r('w-full h-48 object-cover rounded-t-lg', t),
    alt: s,
    ...n,
  })
);
_p.displayName = 'CardImage';
const hp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('div', {
    ref: n,
    className: r('absolute top-4 right-4 flex items-center gap-2', t),
    ...s,
  })
);
hp.displayName = 'CardActions';
const fp = [
    'Đã ghi nhận',
    'Đang thực hiện',
    'Đã thực hiện và đang bàn giao cho khách',
    'Hoàn thiện',
    'Lưu ý khác',
  ],
  $g = ({ request: t, onClose: s, onStatusChange: n, onOpenMessage: o }) => {
    const [c, l] = a.useState(t.status);
    return t
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
                onClick: s,
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
                    children: [e.jsx('b', { children: 'Room:' }), ' ', t.room],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('b', { children: 'Order ID:' }),
                      ' ',
                      t.id,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('b', { children: 'Guest Name:' }),
                      ' ',
                      t.guestName,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('b', { children: 'Content:' }),
                      ' ',
                      t.content,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [e.jsx('b', { children: 'Time:' }), ' ', t.time],
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx('b', { children: 'Status:' }),
                      e.jsx('select', {
                        className: 'border rounded px-2 py-1 text-xs',
                        value: c,
                        onChange: d => l(d.target.value),
                        children: fp.map(d =>
                          e.jsx('option', { value: d, children: d }, d)
                        ),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx('b', { children: 'Notes:' }),
                      ' ',
                      t.notes || '-',
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
                      c !== t.status && n(c);
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
                    onClick: s,
                    children: 'Đóng',
                  }),
                ],
              }),
            ],
          }),
        })
      : null;
  },
  kg = ({ messages: t, onSend: s, onClose: n, loading: o }) => {
    const [c, l] = a.useState(''),
      d = () => {
        c.trim() && (s(c), l(''));
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
              t.length === 0
                ? e.jsx('div', {
                    className: 'text-gray-400 text-sm text-center',
                    children: 'Chưa có tin nhắn',
                  })
                : t.map(i =>
                    e.jsxs(
                      'div',
                      {
                        className: `mb-2 ${i.sender === 'staff' ? 'text-right' : 'text-left'}`,
                        children: [
                          e.jsxs('div', {
                            className: `inline-block px-3 py-1 rounded-lg ${i.sender === 'staff' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`,
                            children: [
                              e.jsxs('span', {
                                className: 'font-semibold',
                                children: [
                                  i.sender === 'staff' ? 'Staff' : 'Guest',
                                  ':',
                                ],
                              }),
                              ' ',
                              i.content,
                            ],
                          }),
                          e.jsx('div', {
                            className: 'text-xs text-gray-400 mt-0.5',
                            children: i.time,
                          }),
                        ],
                      },
                      i.id
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
                value: c,
                onChange: i => l(i.target.value),
                onKeyDown: i => {
                  i.key === 'Enter' && d();
                },
                disabled: o,
              }),
              e.jsx('button', {
                className:
                  'bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded font-semibold',
                onClick: d,
                disabled: o || !c.trim(),
                children: 'Gửi',
              }),
            ],
          }),
        ],
      }),
    });
  },
  G = I(
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
  k = a.forwardRef(
    ({ className: t, variant: s, size: n, asChild: o = !1, ...c }, l) => {
      const d = o ? Nt : 'button';
      return e.jsx(d, {
        className: r(G({ variant: s, size: n, className: t })),
        ref: l,
        ...c,
      });
    }
  );
k.displayName = 'Button';
const xp = I(
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
function Je({ className: t, variant: s, ...n }) {
  return e.jsx('div', { className: r(xp({ variant: s }), t), ...n });
}
const et = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(ne, {
    ref: n,
    className: r(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      t
    ),
    ...s,
  })
);
et.displayName = ne.displayName;
const tt = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(oe, { ref: n, className: r('aspect-square h-full w-full', t), ...s })
);
tt.displayName = oe.displayName;
const st = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(ae, {
    ref: n,
    className: r(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      t
    ),
    ...s,
  })
);
st.displayName = ae.displayName;
const bp = Ct,
  vp = St,
  yp = a.forwardRef(({ className: t, inset: s, children: n, ...o }, c) =>
    e.jsxs(re, {
      ref: c,
      className: r(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
        s && 'pl-8',
        t
      ),
      ...o,
      children: [n, e.jsx(wt, { className: 'ml-auto h-4 w-4' })],
    })
  );
yp.displayName = re.displayName;
const jp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(ie, {
    ref: n,
    className: r(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      t
    ),
    ...s,
  })
);
jp.displayName = ie.displayName;
const nt = a.forwardRef(({ className: t, sideOffset: s = 4, ...n }, o) =>
  e.jsx($t, {
    children: e.jsx(ce, {
      ref: o,
      sideOffset: s,
      className: r(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        t
      ),
      ...n,
    }),
  })
);
nt.displayName = ce.displayName;
const E = a.forwardRef(({ className: t, inset: s, ...n }, o) =>
  e.jsx(le, {
    ref: o,
    className: r(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      s && 'pl-8',
      t
    ),
    ...n,
  })
);
E.displayName = le.displayName;
const Np = a.forwardRef(({ className: t, children: s, checked: n, ...o }, c) =>
  e.jsxs(de, {
    ref: c,
    className: r(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      t
    ),
    checked: n,
    ...o,
    children: [
      e.jsx('span', {
        className:
          'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        children: e.jsx(me, { children: e.jsx(H, { className: 'h-4 w-4' }) }),
      }),
      s,
    ],
  })
);
Np.displayName = de.displayName;
const wp = a.forwardRef(({ className: t, children: s, ...n }, o) =>
  e.jsxs(ue, {
    ref: o,
    className: r(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      t
    ),
    ...n,
    children: [
      e.jsx('span', {
        className:
          'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        children: e.jsx(me, {
          children: e.jsx(kt, { className: 'h-2 w-2 fill-current' }),
        }),
      }),
      s,
    ],
  })
);
wp.displayName = ue.displayName;
const ot = a.forwardRef(({ className: t, inset: s, ...n }, o) =>
  e.jsx(pe, {
    ref: o,
    className: r('px-2 py-1.5 text-sm font-semibold', s && 'pl-8', t),
    ...n,
  })
);
ot.displayName = pe.displayName;
const B = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(ge, { ref: n, className: r('-mx-1 my-1 h-px bg-muted', t), ...s })
);
B.displayName = ge.displayName;
const $p = a.forwardRef(({ className: t, value: s, ...n }, o) =>
  e.jsx(_e, {
    ref: o,
    className: r(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      t
    ),
    ...n,
    children: e.jsx(Tt, {
      className: 'h-full w-full flex-1 bg-primary transition-all',
      style: { transform: `translateX(-${100 - (s || 0)}%)` },
    }),
  })
);
$p.displayName = _e.displayName;
const kp = a.forwardRef(({ className: t, type: s, ...n }, o) =>
  e.jsx('input', {
    type: s,
    className: r(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm font-medium text-dark placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      t
    ),
    ref: o,
    ...n,
  })
);
kp.displayName = 'Input';
const Cp = I(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
  ),
  Sp = a.forwardRef(({ className: t, ...s }, n) =>
    e.jsx(he, { ref: n, className: r(Cp(), t), ...s })
  );
Sp.displayName = he.displayName;
const Cg = zt,
  Sg = Ft,
  Tp = a.forwardRef(({ className: t, children: s, ...n }, o) =>
    e.jsxs(fe, {
      ref: o,
      className: r(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        t
      ),
      ...n,
      children: [
        s,
        e.jsx(Rt, {
          asChild: !0,
          children: e.jsx(xe, { className: 'h-4 w-4 opacity-50' }),
        }),
      ],
    })
  );
Tp.displayName = fe.displayName;
const at = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(be, {
    ref: n,
    className: r('flex cursor-default items-center justify-center py-1', t),
    ...s,
    children: e.jsx(It, { className: 'h-4 w-4' }),
  })
);
at.displayName = be.displayName;
const rt = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(ve, {
    ref: n,
    className: r('flex cursor-default items-center justify-center py-1', t),
    ...s,
    children: e.jsx(xe, { className: 'h-4 w-4' }),
  })
);
rt.displayName = ve.displayName;
const Rp = a.forwardRef(
  ({ className: t, children: s, position: n = 'popper', ...o }, c) =>
    e.jsx(At, {
      children: e.jsxs(ye, {
        ref: c,
        className: r(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          n === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          t
        ),
        position: n,
        ...o,
        children: [
          e.jsx(at, {}),
          e.jsx(Dt, {
            className: r(
              'p-1',
              n === 'popper' &&
                'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
            ),
            children: s,
          }),
          e.jsx(rt, {}),
        ],
      }),
    })
);
Rp.displayName = ye.displayName;
const Ip = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(je, {
    ref: n,
    className: r('py-1.5 pl-8 pr-2 text-sm font-semibold', t),
    ...s,
  })
);
Ip.displayName = je.displayName;
const Ap = a.forwardRef(({ className: t, children: s, ...n }, o) =>
  e.jsxs(Ne, {
    ref: o,
    className: r(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      t
    ),
    ...n,
    children: [
      e.jsx('span', {
        className:
          'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
        children: e.jsx(Et, { children: e.jsx(H, { className: 'h-4 w-4' }) }),
      }),
      e.jsx(Pt, { children: s }),
    ],
  })
);
Ap.displayName = Ne.displayName;
const Dp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(we, { ref: n, className: r('-mx-1 my-1 h-px bg-muted', t), ...s })
);
Dp.displayName = we.displayName;
const Ep = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx($e, {
    ref: n,
    className: r(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      t
    ),
    ...s,
    children: e.jsx(Mt, {
      className: r('flex items-center justify-center text-current'),
      children: e.jsx(H, { className: 'h-4 w-4' }),
    }),
  })
);
Ep.displayName = $e.displayName;
const Pp = I(
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
  it = a.forwardRef(({ className: t, variant: s, ...n }, o) =>
    e.jsx('div', {
      ref: o,
      role: 'alert',
      className: r(Pp({ variant: s }), t),
      ...n,
    })
  );
it.displayName = 'Alert';
const zp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('h5', {
    ref: n,
    className: r('mb-1 font-medium leading-none tracking-tight', t),
    ...s,
  })
);
zp.displayName = 'AlertTitle';
const ct = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('div', {
    ref: n,
    className: r('text-sm [&_p]:leading-relaxed', t),
    ...s,
  })
);
ct.displayName = 'AlertDescription';
const Fp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('textarea', {
    className: r(
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      t
    ),
    ref: n,
    ...s,
  })
);
Fp.displayName = 'Textarea';
const Mp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(ke, {
    className: r(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      t
    ),
    ...s,
    ref: n,
    children: e.jsx(Bt, {
      className: r(
        'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
      ),
    }),
  })
);
Mp.displayName = ke.displayName;
const Tg = Lt,
  Bp = a.forwardRef(({ className: t, ...s }, n) =>
    e.jsx(Ce, {
      ref: n,
      className: r(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        t
      ),
      ...s,
    })
  );
Bp.displayName = Ce.displayName;
const Lp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(Se, {
    ref: n,
    className: r(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-dark data-[state=active]:shadow-sm',
      t
    ),
    ...s,
  })
);
Lp.displayName = Se.displayName;
const Hp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(Te, {
    ref: n,
    className: r(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      t
    ),
    ...s,
  })
);
Hp.displayName = Te.displayName;
const z = ({ requiredPermission: t, requiredRole: s, variant: n = 'alert' }) =>
    n === 'minimal'
      ? e.jsxs('div', {
          className: 'text-gray-400 text-sm flex items-center gap-2',
          children: [
            e.jsx(Ht, { className: 'h-4 w-4' }),
            e.jsx('span', { children: 'Không có quyền truy cập' }),
          ],
        })
      : n === 'placeholder'
        ? e.jsxs('div', {
            className:
              'border-2 border-dashed border-gray-200 rounded-lg p-8 text-center',
            children: [
              e.jsx(F, { className: 'h-12 w-12 text-gray-300 mx-auto mb-4' }),
              e.jsx('h3', {
                className: 'text-lg font-medium text-gray-600 mb-2',
                children: 'Quyền truy cập bị hạn chế',
              }),
              e.jsxs('p', {
                className: 'text-gray-500',
                children: [t && `Cần quyền: ${t}`, s && `Cần vai trò: ${s}`],
              }),
            ],
          })
        : e.jsxs(it, {
            className: 'border-orange-200 bg-orange-50',
            children: [
              e.jsx(F, { className: 'h-4 w-4 text-orange-600' }),
              e.jsxs(ct, {
                className: 'text-orange-800',
                children: [
                  e.jsx('strong', { children: 'Không có quyền truy cập.' }),
                  ' ',
                  t && `Cần quyền: ${t}. `,
                  s && `Cần vai trò: ${s}. `,
                  'Vui lòng liên hệ quản trị viên để được cấp quyền.',
                ],
              }),
            ],
          }),
  lt = ({
    children: t,
    requiredPermission: s,
    requiredRole: n,
    fallback: o,
    showFallback: c = !0,
  }) => {
    const { user: l, hasPermission: d } = P();
    if (!l)
      return c
        ? e.jsx(z, {
            requiredPermission: s,
            requiredRole: n,
            variant: 'minimal',
          })
        : null;
    if (n && l.role !== n)
      return c ? o || e.jsx(z, { requiredRole: n, variant: 'alert' }) : null;
    if (s) {
      let i, p;
      if (
        (s.includes(':') ? ([i, p] = s.split(':')) : ([i, p] = s.split('.')),
        !d(i, p))
      )
        return c
          ? o || e.jsx(z, { requiredPermission: s, variant: 'alert' })
          : null;
    }
    return e.jsx(e.Fragment, { children: t });
  },
  qp = () => {
    const { user: t, hasPermission: s } = P(),
      n = i => {
        if (!t) return !1;
        const [p, m] = i.split('.');
        return s(p, m);
      },
      o = i => t?.role === i;
    return {
      canAccess: n,
      hasRole: o,
      isManager: () => o('hotel-manager'),
      isStaff: () => o('front-desk'),
      isIT: () => o('it-manager'),
      user: t,
    };
  },
  Op = [
    {
      href: '/dashboard',
      icon: Ot,
      label: 'Tổng quan',
      description: 'Thống kê và metrics tổng quan',
      permission: 'dashboard:view',
    },
    {
      href: '/dashboard/setup',
      icon: Vt,
      label: 'Thiết lập Assistant',
      description: 'Cấu hình và tùy chỉnh AI Assistant',
      permission: 'assistant:configure',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/unified-dashboard/analytics',
      icon: Gt,
      label: 'Phân tích nâng cao',
      description: 'Báo cáo và thống kê chi tiết',
      permission: 'analytics:view_advanced',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/dashboard/billing',
      icon: Wt,
      label: 'Thanh toán',
      description: 'Quản lý subscription và billing',
      permission: 'billing:view',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/unified-dashboard/staff-management',
      icon: Ut,
      label: 'Quản lý nhân viên',
      description: 'Thêm, sửa, xóa tài khoản nhân viên',
      permission: 'staff:manage',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/dashboard/settings',
      icon: Ie,
      label: 'Cài đặt hệ thống',
      description: 'Cấu hình khách sạn và hệ thống',
      permission: 'settings:manage',
      roleSpecific: ['hotel-manager'],
    },
    {
      href: '/unified-dashboard/requests',
      icon: Yt,
      label: 'Yêu cầu khách hàng',
      description: 'Xem và xử lý yêu cầu từ khách',
      permission: 'requests:view',
      roleSpecific: ['front-desk'],
    },
    {
      href: '/dashboard/guest-management',
      icon: Xt,
      label: 'Quản lý khách hàng',
      description: 'Thông tin và lịch sử khách hàng',
      permission: 'guests:manage',
      roleSpecific: ['front-desk'],
    },
    {
      href: '/dashboard/basic-analytics',
      icon: Kt,
      label: 'Thống kê cơ bản',
      description: 'Báo cáo hoạt động hàng ngày',
      permission: 'analytics:view_basic',
      roleSpecific: ['front-desk'],
    },
    {
      href: '/dashboard/calls',
      icon: Qt,
      label: 'Lịch sử cuộc gọi',
      description: 'Xem lịch sử cuộc gọi và transcript',
      permission: 'calls:view',
      roleSpecific: ['front-desk'],
    },
    {
      href: '/unified-dashboard/system-monitoring',
      icon: Zt,
      label: 'Giám sát hệ thống',
      description: 'Theo dõi hiệu suất và sức khỏe hệ thống',
      permission: 'system:monitor',
      roleSpecific: ['it-manager'],
    },
    {
      href: '/dashboard/integrations',
      icon: Jt,
      label: 'Tích hợp',
      description: 'Quản lý API và tích hợp bên thứ 3',
      permission: 'integrations:manage',
      roleSpecific: ['it-manager'],
    },
    {
      href: '/dashboard/logs',
      icon: es,
      label: 'Nhật ký hệ thống',
      description: 'Xem logs và debug issues',
      permission: 'logs:view',
      roleSpecific: ['it-manager'],
    },
    {
      href: '/dashboard/security',
      icon: F,
      label: 'Bảo mật',
      description: 'Cấu hình và giám sát bảo mật',
      permission: 'security:manage',
      roleSpecific: ['it-manager'],
    },
  ],
  dt = t => {
    switch (t) {
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
  L = t => {
    switch (t) {
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
  Vp = ({
    href: t,
    icon: s,
    label: n,
    description: o,
    isActive: c,
    theme: l,
  }) =>
    e.jsx(Oe, {
      href: t,
      children: e.jsxs(k, {
        variant: c ? 'default' : 'ghost',
        className: r(
          'w-full justify-start gap-3 px-3 py-6 h-auto',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          c &&
            `${l.primary} text-white hover:${l.primary.replace('bg-', 'bg-').replace('600', '700')}`
        ),
        children: [
          e.jsx(s, { className: 'h-5 w-5 shrink-0' }),
          e.jsxs('div', {
            className: 'flex-1 text-left',
            children: [
              e.jsx('div', { className: 'font-medium', children: n }),
              e.jsx('div', {
                className: r(
                  'text-xs text-muted-foreground',
                  c && 'text-white/80'
                ),
                children: o,
              }),
            ],
          }),
        ],
      }),
    }),
  Gp = ({ user: t, role: s, onLogout: n }) => {
    const o = dt(s);
    return e.jsxs(bp, {
      children: [
        e.jsx(vp, {
          asChild: !0,
          children: e.jsx(k, {
            variant: 'ghost',
            className: 'relative h-10 w-10 rounded-full',
            children: e.jsxs(et, {
              className: 'h-10 w-10',
              children: [
                e.jsx(tt, {
                  src: t.avatar_url || '',
                  alt: t.display_name || t.email,
                }),
                e.jsx(st, {
                  className: o.primary,
                  children: (t.display_name || t.email || '')
                    .charAt(0)
                    .toUpperCase(),
                }),
              ],
            }),
          }),
        }),
        e.jsxs(nt, {
          className: 'w-56',
          align: 'end',
          children: [
            e.jsxs(ot, {
              className: 'flex flex-col',
              children: [
                e.jsx('div', {
                  className: 'font-medium',
                  children: t.display_name || t.email,
                }),
                e.jsx('div', {
                  className: 'text-xs text-muted-foreground',
                  children: L(s),
                }),
              ],
            }),
            e.jsx(B, {}),
            e.jsxs(E, {
              children: [
                e.jsx(Ie, { className: 'mr-2 h-4 w-4' }),
                'Cài đặt tài khoản',
              ],
            }),
            e.jsxs(E, {
              children: [e.jsx(ss, { className: 'mr-2 h-4 w-4' }), 'Trợ giúp'],
            }),
            e.jsx(B, {}),
            e.jsxs(E, {
              className: 'text-red-600 focus:text-red-600',
              onClick: n,
              children: [e.jsx(ns, { className: 'mr-2 h-4 w-4' }), 'Đăng xuất'],
            }),
          ],
        }),
      ],
    });
  },
  Wp = ({ isOpen: t, onClose: s, user: n, role: o, theme: c }) => {
    const [l] = bs(),
      i = qp().canAccess,
      p = Op.filter(
        m =>
          !(!i(m.permission) || (m.roleSpecific && !m.roleSpecific.includes(o)))
      );
    return e.jsx('aside', {
      className: r(
        'fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        t ? 'translate-x-0' : '-translate-x-full'
      ),
      children: e.jsxs('div', {
        className: 'flex h-full flex-col',
        children: [
          e.jsxs('div', {
            className: r(
              'flex items-center justify-between p-6 border-b',
              c.accent
            ),
            children: [
              e.jsxs('div', {
                className: 'flex items-center gap-3',
                children: [
                  e.jsx('div', {
                    className: r(
                      'flex h-10 w-10 items-center justify-center rounded-lg text-white',
                      c.primary
                    ),
                    children: e.jsx(ts, { className: 'h-6 w-6' }),
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
              e.jsx(k, {
                variant: 'ghost',
                size: 'icon',
                className: 'lg:hidden',
                onClick: s,
                children: e.jsx(R, { className: 'h-5 w-5' }),
              }),
            ],
          }),
          e.jsxs('div', {
            className: r('px-6 py-4 border-b', c.accent),
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
                  e.jsx(Je, {
                    variant: 'outline',
                    className: c.badge,
                    children: L(o),
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'mt-3 flex gap-2',
                children: [
                  e.jsx(lt, {
                    requiredPermission: 'dashboard:view_client_interface',
                    children: e.jsx(Oe, {
                      href: '/interface1',
                      className: r(
                        'flex-1 px-3 py-2 text-white text-sm rounded hover:opacity-90 transition text-center',
                        c.primary
                      ),
                      children: 'Giao diện khách',
                    }),
                  }),
                  e.jsxs(k, {
                    variant: 'outline',
                    size: 'sm',
                    className: 'flex-1',
                    children: [
                      e.jsx(Re, { className: 'h-4 w-4 mr-1' }),
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
              const u = l === m.href;
              return e.jsx(
                Vp,
                {
                  href: m.href,
                  icon: m.icon,
                  label: m.label,
                  description: m.description,
                  isActive: u,
                  theme: c,
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
  Rg = ({ children: t }) => {
    const [s, n] = a.useState(!1),
      { user: o, logout: c } = P(),
      l = o?.role || 'front-desk',
      d = dt(l),
      i = () => {
        switch (l) {
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
        s &&
          e.jsx('div', {
            className: 'fixed inset-0 z-40 bg-black/50 lg:hidden',
            onClick: () => n(!1),
          }),
        e.jsx(Wp, {
          isOpen: s,
          onClose: () => n(!1),
          user: o,
          role: l,
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
                      e.jsx(k, {
                        variant: 'ghost',
                        size: 'icon',
                        className: 'lg:hidden',
                        onClick: () => n(!0),
                        children: e.jsx(qt, { className: 'h-5 w-5' }),
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('h1', {
                            className:
                              'text-xl font-semibold text-gray-900 dark:text-white',
                            children: i(),
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
                      e.jsx(lt, {
                        requiredPermission: 'notifications:view',
                        children: e.jsxs(k, {
                          variant: 'ghost',
                          size: 'icon',
                          className: 'relative',
                          children: [
                            e.jsx(Re, { className: 'h-5 w-5' }),
                            e.jsx(Je, {
                              variant: 'destructive',
                              className:
                                'absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs',
                              children: '3',
                            }),
                          ],
                        }),
                      }),
                      e.jsx(Gp, { user: o, role: l, onLogout: c }),
                    ],
                  }),
                ],
              }),
            }),
            e.jsx('main', { className: 'p-6', children: t }),
          ],
        }),
      ],
    });
  },
  Ig = rs,
  Up = os,
  mt = a.forwardRef(({ className: t, ...s }, n) =>
    e.jsx(Ae, {
      ref: n,
      className: r(
        'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        t
      ),
      ...s,
    })
  );
mt.displayName = Ae.displayName;
const Yp = a.forwardRef(({ className: t, children: s, ...n }, o) =>
  e.jsxs(Up, {
    children: [
      e.jsx(mt, {}),
      e.jsxs(De, {
        ref: o,
        className: r(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          t
        ),
        ...n,
        children: [
          s,
          e.jsxs(as, {
            className:
              'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
            children: [
              e.jsx(R, { className: 'h-4 w-4' }),
              e.jsx('span', { className: 'sr-only', children: 'Close' }),
            ],
          }),
        ],
      }),
    ],
  })
);
Yp.displayName = De.displayName;
const Xp = ({ className: t, ...s }) =>
  e.jsx('div', {
    className: r('flex flex-col space-y-1.5 text-center sm:text-left', t),
    ...s,
  });
Xp.displayName = 'DialogHeader';
const Kp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(Ee, {
    ref: n,
    className: r('text-lg font-semibold leading-none tracking-tight', t),
    ...s,
  })
);
Kp.displayName = Ee.displayName;
const Qp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(Pe, { ref: n, className: r('text-sm text-muted-foreground', t), ...s })
);
Qp.displayName = Pe.displayName;
const Ag = cs,
  Dg = ls,
  Zp = is,
  ut = a.forwardRef(({ className: t, ...s }, n) =>
    e.jsx(ze, {
      className: r(
        'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        t
      ),
      ...s,
      ref: n,
    })
  );
ut.displayName = ze.displayName;
const Jp = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsxs(Zp, {
    children: [
      e.jsx(ut, {}),
      e.jsx(Fe, {
        ref: n,
        className: r(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          t
        ),
        ...s,
      }),
    ],
  })
);
Jp.displayName = Fe.displayName;
const eg = ({ className: t, ...s }) =>
  e.jsx('div', {
    className: r('flex flex-col space-y-2 text-center sm:text-left', t),
    ...s,
  });
eg.displayName = 'AlertDialogHeader';
const tg = ({ className: t, ...s }) =>
  e.jsx('div', {
    className: r(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      t
    ),
    ...s,
  });
tg.displayName = 'AlertDialogFooter';
const sg = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(Me, { ref: n, className: r('text-lg font-semibold', t), ...s })
);
sg.displayName = Me.displayName;
const ng = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(Be, { ref: n, className: r('text-sm text-muted-foreground', t), ...s })
);
ng.displayName = Be.displayName;
const og = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(Le, { ref: n, className: r(G(), t), ...s })
);
og.displayName = Le.displayName;
const ag = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx(He, {
    ref: n,
    className: r(G({ variant: 'outline' }), 'mt-2 sm:mt-0', t),
    ...s,
  })
);
ag.displayName = He.displayName;
const rg = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('div', {
    className: 'relative w-full overflow-auto',
    children: e.jsx('table', {
      ref: n,
      className: r('w-full caption-bottom text-sm', t),
      ...s,
    }),
  })
);
rg.displayName = 'Table';
const ig = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('thead', { ref: n, className: r('[&_tr]:border-b', t), ...s })
);
ig.displayName = 'TableHeader';
const cg = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('tbody', {
    ref: n,
    className: r('[&_tr:last-child]:border-0', t),
    ...s,
  })
);
cg.displayName = 'TableBody';
const lg = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('tfoot', {
    ref: n,
    className: r('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', t),
    ...s,
  })
);
lg.displayName = 'TableFooter';
const dg = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('tr', {
    ref: n,
    className: r(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      t
    ),
    ...s,
  })
);
dg.displayName = 'TableRow';
const mg = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('th', {
    ref: n,
    className: r(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      t
    ),
    ...s,
  })
);
mg.displayName = 'TableHead';
const ug = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('td', {
    ref: n,
    className: r('p-4 align-middle [&:has([role=checkbox])]:pr-0', t),
    ...s,
  })
);
ug.displayName = 'TableCell';
const pg = a.forwardRef(({ className: t, ...s }, n) =>
  e.jsx('caption', {
    ref: n,
    className: r('mt-4 text-sm text-muted-foreground', t),
    ...s,
  })
);
pg.displayName = 'TableCaption';
const gg = a.forwardRef(
  (
    { className: t, orientation: s = 'horizontal', decorative: n = !0, ...o },
    c
  ) =>
    e.jsx(qe, {
      ref: c,
      decorative: n,
      orientation: s,
      className: r(
        'shrink-0 bg-border',
        s === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        t
      ),
      ...o,
    })
);
gg.displayName = qe.displayName;
export {
  ig as $,
  et as A,
  k as B,
  cp as C,
  bp as D,
  Fp as E,
  Mp as F,
  lt as G,
  Ag as H,
  ep as I,
  Dg as J,
  Jp as K,
  Sp as L,
  eg as M,
  sg as N,
  ng as O,
  $p as P,
  tg as Q,
  ag as R,
  $g as S,
  Tg as T,
  og as U,
  Ig as V,
  Yp as W,
  Xp as X,
  Kp as Y,
  Qp as Z,
  rg as _,
  Je as a,
  dg as a0,
  mg as a1,
  cg as a2,
  ug as a3,
  gg as a4,
  j as a5,
  ws as a6,
  yg as a7,
  wg as a8,
  Rg as a9,
  jg as aa,
  up as b,
  kg as c,
  vp as d,
  tt as e,
  st as f,
  nt as g,
  ot as h,
  B as i,
  E as j,
  lp as k,
  dp as l,
  mp as m,
  it as n,
  ct as o,
  kp as p,
  Cg as q,
  Tp as r,
  Sg as s,
  Rp as t,
  Ng as u,
  Ap as v,
  Ep as w,
  Bp as x,
  Lp as y,
  Hp as z,
};
