const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      'assets/pages-BP7abP3S.js',
      'assets/react-core-C6DwaHZM.js',
      'assets/vendor-BXT5a8vO.js',
      'assets/css-utils-BkLtITBR.js',
      'assets/charts-ceMktdbA.js',
      'assets/charts-utils-DdC1WR7j.js',
      'assets/ui-vendor-BQCqNqg0.js',
      'assets/components-C2YZ6kZf.js',
      'assets/hooks-context-BiQZNc7S.js',
      'assets/services-CFg-LAtT.js',
      'assets/validation-VWaDGczM.js',
      'assets/siri-components-DrKSOfrR.js',
      'assets/siri-components-GqxCBkk7.css',
      'assets/react-router-B7s-G-0E.js',
      'assets/components-BlTBQwkB.css',
      'assets/dashboard-components-WlZzPKd9.js',
    ])
) => i.map(i => d[i]);
import { R as b, j as e, r as c, bE as q } from './react-core-C6DwaHZM.js';
import {
  _ as N,
  A as L,
  H as M,
  k as E,
  l as D,
  m as _,
  g as y,
} from './hooks-context-BiQZNc7S.js';
import {
  l as r,
  a7 as P,
  a8 as T,
  a9 as m,
  aa as a,
} from './components-C2YZ6kZf.js';
import { af as R, ag as t, L as v, C as k } from './vendor-BXT5a8vO.js';
import {
  S as z,
  a as B,
  A as I,
  U as F,
  C as U,
  b as H,
  c as G,
  d as W,
  e as Q,
  G as V,
  f as K,
  g as O,
  I as Y,
  D as o,
  h as $,
  i as J,
  j as X,
  k as Z,
  l as ee,
  N as te,
} from './pages-BP7abP3S.js';
import { B as ne } from './react-router-B7s-G-0E.js';
import { b as se } from './services-CFg-LAtT.js';
import './ui-vendor-BQCqNqg0.js';
import './charts-ceMktdbA.js';
import './css-utils-BkLtITBR.js';
import './charts-utils-DdC1WR7j.js';
import './validation-VWaDGczM.js';
import './siri-components-DrKSOfrR.js';
import './dashboard-components-WlZzPKd9.js';
const n = ({
    children: s,
    requireAuth: i = !0,
    requiredRole: p,
    redirectTo: l = '/login',
  }) => {
    const { user: j, isAuthenticated: d, isLoading: h } = y(),
      [, u] = k();
    return (
      c.useEffect(() => {
        if (!h && i && !d) {
          u(l);
          return;
        }
      }, [d, h, j, i, p, l, u]),
      h ? e.jsx(f, {}) : i && !d ? null : e.jsx(e.Fragment, { children: s })
    );
  },
  re = b.lazy(() =>
    N(
      () => import('./pages-BP7abP3S.js').then(s => s.m),
      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    )
  ),
  ae = b.lazy(() =>
    N(
      () => import('./pages-BP7abP3S.js').then(s => s.n),
      __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    )
  ),
  f = () =>
    e.jsx('div', {
      className: 'flex items-center justify-center h-screen bg-gray-50',
      children: e.jsxs('div', {
        className: 'flex flex-col items-center',
        children: [
          e.jsx('div', {
            className:
              'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4',
          }),
          e.jsx('p', { className: 'text-gray-500', children: 'Đang tải...' }),
        ],
      }),
    }),
  ie = () =>
    e.jsx('div', {
      className: 'min-h-screen bg-gray-50 py-8',
      children: e.jsx('div', {
        className: 'container mx-auto',
        children: e.jsxs('div', {
          className: 'flex justify-between items-center mb-6',
          children: [
            e.jsx('h1', {
              className: 'text-2xl font-bold text-gray-800',
              children: 'Kiểm tra Tính năng Email',
            }),
            e.jsx(v, {
              href: '/',
              className:
                'px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90',
              children: 'Quay lại Trang Chính',
            }),
          ],
        }),
      }),
    }),
  oe = () => {
    const { login: s, isLoading: i } = y(),
      [, p] = k(),
      [l, j] = c.useState(''),
      [d, h] = c.useState(''),
      [u, A] = c.useState(''),
      [g, w] = c.useState(!1),
      C = async x => {
        (x.preventDefault(), A(''));
        try {
          (await s(l, d), p('/dashboard'));
        } catch (S) {
          A(S.message || 'Đăng nhập thất bại');
        }
      };
    return e.jsx('div', {
      className:
        'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8',
      children: e.jsxs('div', {
        className: 'max-w-md w-full space-y-8',
        children: [
          e.jsxs('div', {
            children: [
              e.jsx('h2', {
                className:
                  'mt-6 text-center text-3xl font-extrabold text-gray-900',
                children: 'Đăng nhập Dashboard',
              }),
              e.jsxs('p', {
                className: 'mt-2 text-center text-sm text-gray-600',
                children: [
                  'Hoặc',
                  ' ',
                  e.jsx(v, {
                    href: '/',
                    className:
                      'font-medium text-indigo-600 hover:text-indigo-500',
                    children: 'quay lại trang chính',
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('form', {
            className: 'mt-8 space-y-6',
            onSubmit: C,
            children: [
              e.jsxs('div', {
                className: 'rounded-md shadow-sm -space-y-px',
                children: [
                  e.jsx('div', {
                    children: e.jsx('input', {
                      id: 'email',
                      name: 'email',
                      type: 'text',
                      autoComplete: 'username',
                      required: !0,
                      className:
                        'appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
                      placeholder: 'Tên đăng nhập hoặc email',
                      value: l,
                      onChange: x => j(x.target.value),
                    }),
                  }),
                  e.jsxs('div', {
                    className: 'relative',
                    children: [
                      e.jsx('input', {
                        id: 'password',
                        name: 'password',
                        type: g ? 'text' : 'password',
                        autoComplete: 'current-password',
                        required: !0,
                        className:
                          'appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm',
                        placeholder: 'Mật khẩu',
                        value: d,
                        onChange: x => h(x.target.value),
                      }),
                      e.jsx('button', {
                        type: 'button',
                        className:
                          'absolute inset-y-0 right-0 pr-3 flex items-center',
                        onClick: () => w(!g),
                        children: g
                          ? e.jsx('svg', {
                              className: 'h-5 w-5 text-gray-400',
                              fill: 'none',
                              viewBox: '0 0 24 24',
                              stroke: 'currentColor',
                              children: e.jsx('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: 2,
                                d: 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21',
                              }),
                            })
                          : e.jsxs('svg', {
                              className: 'h-5 w-5 text-gray-400',
                              fill: 'none',
                              viewBox: '0 0 24 24',
                              stroke: 'currentColor',
                              children: [
                                e.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeWidth: 2,
                                  d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                                }),
                                e.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeWidth: 2,
                                  d: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
                                }),
                              ],
                            }),
                      }),
                    ],
                  }),
                ],
              }),
              u &&
                e.jsx('div', {
                  className: 'text-red-600 text-sm text-center',
                  children: u,
                }),
              e.jsx('div', {
                children: e.jsx('button', {
                  type: 'submit',
                  disabled: i,
                  className:
                    'group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50',
                  children: i ? 'Đang đăng nhập...' : 'Đăng nhập',
                }),
              }),
            ],
          }),
        ],
      }),
    });
  },
  de = () =>
    e.jsx('div', {
      className: 'min-h-screen flex items-center justify-center bg-gray-50',
      children: e.jsxs('div', {
        className: 'max-w-md w-full text-center',
        children: [
          e.jsx('h1', {
            className: 'text-2xl font-bold text-gray-900 mb-4',
            children: 'Không có quyền truy cập',
          }),
          e.jsx('p', {
            className: 'text-gray-600 mb-6',
            children: 'Bạn không có quyền truy cập vào trang này.',
          }),
          e.jsx(v, {
            href: '/',
            className: 'text-indigo-600 hover:text-indigo-500',
            children: 'Quay lại trang chính',
          }),
        ],
      }),
    });
function ce() {
  const s = _(),
    { isAuthenticated: i } = y();
  return (
    r.debug('[DEBUG] Router render', 'Component', {
      tenantInfo: s,
      isAuthenticated: i,
    }),
    s
      ? e.jsx(c.Suspense, {
          fallback: e.jsx(f, {}),
          children: e.jsxs(R, {
            children: [
              e.jsx(t, { path: '/', component: m }),
              e.jsx(t, { path: '/interface1', component: m }),
              e.jsx(t, { path: '/interface2', component: m }),
              e.jsx(t, { path: '/interface3', component: m }),
              e.jsx(t, { path: '/interface4', component: m }),
              e.jsx(t, { path: '/call-history', component: re }),
              e.jsx(t, { path: '/call-details/:callId', component: ae }),
              e.jsx(t, { path: '/email-test', component: ie }),
              e.jsx(t, { path: '/staff', component: z }),
              e.jsx(t, { path: '/staff/dashboard', component: B }),
              e.jsx(t, { path: '/analytics', component: I }),
              e.jsx(t, { path: '/login', component: oe }),
              e.jsx(t, { path: '/unauthorized', component: de }),
              e.jsx(t, {
                path: '/unified-dashboard',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(F, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/requests',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(U, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/analytics',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(H, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/staff-management',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(G, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/system-monitoring',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(W, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/settings',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(Q, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/guest-management',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(V, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/security',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(K, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/logs',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(O, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/unified-dashboard/integrations',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(a, { children: e.jsx(Y, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/dashboard',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(o, { children: e.jsx($, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/dashboard/setup',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(o, { children: e.jsx(J, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/dashboard/assistant',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(o, { children: e.jsx(X, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/dashboard/analytics',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(o, { children: e.jsx(Z, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/dashboard/settings',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(o, { children: e.jsx(ee, {}) }),
                }),
              }),
              e.jsx(t, {
                path: '/dashboard/billing',
                children: e.jsx(n, {
                  requireAuth: !0,
                  children: e.jsx(o, {
                    children: e.jsxs('div', {
                      className: 'p-6',
                      children: [
                        e.jsx('h1', {
                          className: 'text-2xl font-bold mb-4',
                          children: 'Thanh toán & Đăng ký',
                        }),
                        e.jsx('p', {
                          className: 'text-gray-600',
                          children:
                            'Trang quản lý thanh toán đang được phát triển...',
                        }),
                      ],
                    }),
                  }),
                }),
              }),
              e.jsx(t, {
                path: '/dashboard/team',
                children: e.jsx(n, {
                  requireAuth: !0,
                  requiredRole: 'admin',
                  children: e.jsx(o, {
                    children: e.jsxs('div', {
                      className: 'p-6',
                      children: [
                        e.jsx('h1', {
                          className: 'text-2xl font-bold mb-4',
                          children: 'Quản lý Nhóm',
                        }),
                        e.jsx('p', {
                          className: 'text-gray-600',
                          children:
                            'Trang quản lý nhóm đang được phát triển...',
                        }),
                      ],
                    }),
                  }),
                }),
              }),
              e.jsx(t, { component: te }),
            ],
          }),
        })
      : e.jsx(f, {})
  );
}
function le() {
  return (
    r.debug('[DEBUG] AppContent render', 'Component'),
    D(),
    e.jsxs(P, { children: [e.jsx(ce, {}), e.jsx(T, {})] })
  );
}
function he() {
  return (
    r.debug('[DEBUG] App render', 'Component'),
    e.jsx(ne, {
      children: e.jsx(L, {
        children: e.jsx(M, { children: e.jsx(E, { children: e.jsx(le, {}) }) }),
      }),
    })
  );
}
const ue = async () => {
  try {
    (r.debug(
      '🚀 [Main] Starting authentication initialization...',
      'Component'
    ),
      localStorage.removeItem('token'),
      sessionStorage.removeItem('token'),
      localStorage.removeItem('dev_auth_token'),
      r.debug(
        '🧹 [Main] Cleared all existing tokens to test new credentials',
        'Component'
      ),
      (await se())
        ? (r.debug(
            '✅ [Main] Fresh authentication token generated successfully',
            'Component'
          ),
          r.debug('🎫 [Main] Token stored in localStorage', 'Component'))
        : (r.warn(
            '⚠️ [Main] Failed to generate authentication token',
            'Component'
          ),
          r.debug(
            '🔧 [Main] You can run: debugAuth.runFullTest() in console to debug',
            'Component'
          )));
  } catch (s) {
    (r.error('❌ [Main] Failed to initialize authentication:', 'Component', s),
      r.debug(
        '🔧 [Main] You can run: debugAuth.runFullTest() in console to debug',
        'Component'
      ));
  }
};
r.debug('🚀 [Main] App starting - initializing authentication...', 'Component');
ue();
q.createRoot(document.getElementById('root')).render(
  e.jsx(b.StrictMode, { children: e.jsx(he, {}) })
);
