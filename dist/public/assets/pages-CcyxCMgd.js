import {
  j as e,
  aP as ae,
  r as o,
  ai as st,
  aj as fe,
  ak as at,
  an as De,
  ag as tt,
  ah as us,
  aw as nt,
  ax as lt,
  al as Ta,
  am as ge,
  aR as be,
  aS as ye,
  aT as he,
  aU as is,
  aV as Le,
  aq as Ls,
  aW as rs,
  ar as cs,
  aQ as B,
  aX as Me,
  aY as Oe,
  aZ as Bs,
  a_ as As,
  O as Xe,
  p as Ye,
  a$ as it,
  b0 as es,
  b1 as Ws,
  b2 as Xs,
  b3 as rt,
  b4 as ct,
  b5 as ra,
  b6 as dt,
  b7 as je,
  b8 as ca,
  b9 as Ys,
  ba as Qe,
  bb as Js,
  au as ns,
  bc as ea,
  af as re,
  bd as Aa,
  be as sa,
  as as aa,
  at as Da,
  bf as oe,
  ao as da,
  bg as Ze,
  bh as ta,
  bi as He,
  bj as _e,
  bk as ht,
  bl as ot,
  bm as js,
  bn as Es,
  ae as gs,
  bo as La,
  bp as xt,
  bq as mt,
  br as ps,
  bs as ls,
  bt as Ns,
  bu as Us,
  bv as Fe,
  bw as Is,
  bx as ut,
  by as Ia,
  bz as jt,
  bA as gt,
  bB as Ks,
} from './react-core-C6DwaHZM.js';
import {
  C as j,
  b as g,
  S as pt,
  c as vt,
  B as p,
  D as Nt,
  d as ft,
  A as yt,
  e as bt,
  f as wt,
  g as Ct,
  h as St,
  i as ha,
  j as qs,
  k as y,
  l as b,
  m as M,
  P as Pe,
  a as R,
  n as na,
  o as la,
  L as h,
  p as C,
  q as Q,
  r as W,
  s as X,
  t as Y,
  v as N,
  w as kt,
  T as we,
  x as Ce,
  y as O,
  z as H,
  E as me,
  F as z,
  G as Ne,
  H as Fa,
  J as Pa,
  K as Ma,
  M as Ra,
  N as Ea,
  O as qa,
  Q as Oa,
  R as Ha,
  U as za,
  V as ze,
  W as Be,
  X as Ue,
  Y as Ke,
  Z as We,
  _ as Re,
  $ as Ee,
  a0 as ce,
  a1 as F,
  a2 as qe,
  a3 as P,
  a4 as bs,
} from './components-CjbIaAhs.js';
import { u as Ba } from './react-router-B7s-G-0E.js';
import {
  R as Te,
  P as $s,
  a as Vs,
  C as Gs,
  T as Ae,
  B as Ua,
  b as ss,
  X as as,
  Y as ts,
  L as oa,
  c as Ka,
  d as ia,
  e as ms,
  A as Tt,
  f as At,
} from './charts-ceMktdbA.js';
import { C as $a, L as le, E as Dt } from './vendor-BXT5a8vO.js';
import { S as Lt } from './dashboard-components-CRP6l__9.js';
import { g as pe } from './hooks-context-CVvU1W40.js';
import {
  P as It,
  T as Ft,
  L as Pt,
  B as Mt,
  d as Va,
  v as Rt,
  a as Et,
  c as $,
} from './services-CkHkMpnV.js';
function Gn() {
  return e.jsx('div', {
    className:
      'min-h-screen w-full flex items-center justify-center bg-gray-50',
    children: e.jsx(j, {
      className: 'w-full max-w-md mx-4',
      children: e.jsxs(g, {
        className: 'pt-6',
        children: [
          e.jsxs('div', {
            className: 'flex mb-4 gap-2',
            children: [
              e.jsx(ae, { className: 'h-8 w-8 text-red-500' }),
              e.jsx('h1', {
                className: 'text-2xl font-bold text-gray-900',
                children: '404 Page Not Found',
              }),
            ],
          }),
          e.jsx('p', {
            className: 'mt-4 text-sm text-gray-600',
            children: 'Did you forget to add the page to the router?',
          }),
        ],
      }),
    }),
  });
}
const qt = ({ onLogin: s }) => {
    const [a, r] = o.useState(''),
      [t, n] = o.useState(''),
      [l, i] = o.useState(''),
      [c, u] = o.useState(!1),
      d = async w => {
        if ((w.preventDefault(), !a || !t)) {
          i('Please enter both username and password.');
          return;
        }
        i('');
        try {
          const m = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: a, password: t }),
          });
          if (!m.ok) {
            const L = await m.json();
            i(L.error || 'Login failed.');
            return;
          }
          const x = await m.json();
          x.success && x.token
            ? (localStorage.setItem('token', x.token), s())
            : i('Login failed: No token received.');
        } catch {
          i('Login failed: Network or server error.');
        }
      };
    return e.jsx('div', {
      className:
        'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300',
      children: e.jsxs('form', {
        onSubmit: d,
        className:
          'bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6 border border-gray-200',
        children: [
          e.jsx('h2', {
            className: 'text-2xl font-bold text-blue-900 mb-4 text-center',
            children: 'Staff Login',
          }),
          l &&
            e.jsx('div', {
              className: 'text-red-500 text-sm mb-2',
              children: l,
            }),
          e.jsxs('div', {
            children: [
              e.jsx('label', {
                className: 'block text-gray-700 font-medium mb-1',
                children: 'Username',
              }),
              e.jsx('input', {
                type: 'text',
                className:
                  'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400',
                value: a,
                onChange: w => r(w.target.value),
                autoFocus: !0,
              }),
            ],
          }),
          e.jsxs('div', {
            children: [
              e.jsx('label', {
                className: 'block text-gray-700 font-medium mb-1',
                children: 'Password',
              }),
              e.jsxs('div', {
                className: 'relative',
                children: [
                  e.jsx('input', {
                    type: c ? 'text' : 'password',
                    className:
                      'w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400',
                    value: t,
                    onChange: w => n(w.target.value),
                  }),
                  e.jsx('button', {
                    type: 'button',
                    className:
                      'absolute inset-y-0 right-0 pr-3 flex items-center',
                    onClick: () => u(!c),
                    children: c
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
          e.jsx('button', {
            type: 'submit',
            className:
              'w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition',
            children: 'Login',
          }),
        ],
      }),
    });
  },
  Os = [
    'Tất cả',
    'Đã ghi nhận',
    'Đang thực hiện',
    'Đã thực hiện và đang bàn giao cho khách',
    'Hoàn thiện',
    'Lưu ý khác',
  ],
  xa = s => {
    switch (s) {
      case 'Đã ghi nhận':
        return 'bg-gray-300 text-gray-800';
      case 'Đang thực hiện':
        return 'bg-yellow-200 text-yellow-800';
      case 'Đã thực hiện và đang bàn giao cho khách':
        return 'bg-blue-200 text-blue-800';
      case 'Hoàn thiện':
        return 'bg-green-200 text-green-800';
      case 'Lưu ý khác':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  },
  Ot = () => {
    const [s, a] = o.useState([]),
      [r, t] = o.useState(null),
      [n, l] = o.useState(!1),
      [i, c] = o.useState(!1),
      [u, d] = o.useState([]),
      [w, m] = o.useState(!1),
      [x, L] = o.useState('Tất cả'),
      [S, k] = o.useState(''),
      [ee, se] = o.useState(''),
      [te, ne] = o.useState(null),
      [T, J] = o.useState(!1),
      [D, _] = o.useState(!1),
      [V, de] = o.useState(''),
      [ie, I] = o.useState(''),
      [v, q] = o.useState({}),
      G = Ba(),
      Se = () => localStorage.getItem('staff_token'),
      ds = async () => {
        const f = Se();
        if (!f) {
          G('/staff');
          return;
        }
        try {
          const E = await fetch('/api/staff/requests', {
            headers: { Authorization: `Bearer ${f}` },
            credentials: 'include',
          });
          if (E.status === 401) {
            (localStorage.removeItem('staff_token'), G('/staff'));
            return;
          }
          const K = await E.json();
          (console.log('Fetched requests data:', K), a(K));
        } catch (E) {
          console.error('Failed to fetch requests:', E);
        }
      };
    o.useEffect(() => {
      ds();
      const f = setInterval(ds, 3e4);
      return () => clearInterval(f);
    }, []);
    const Ps = () => {
        (l(!1), t(null));
      },
      hs = async (f, E) => {
        const K = Se();
        if (!K) return G('/staff');
        try {
          (await fetch(`/api/staff/requests/${E}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${K}`,
            },
            credentials: 'include',
            body: JSON.stringify({ status: f }),
          }),
            a(os => os.map(Ve => (Ve.id === E ? { ...Ve, status: f } : Ve))),
            r && r.id === E && t({ ...r, status: f }));
        } catch (os) {
          console.error('Failed to update status:', os);
        }
      },
      $e = async () => {
        if ((c(!0), !r)) return;
        const f = Se();
        if (!f) return G('/staff');
        try {
          const K = await (
            await fetch(`/api/staff/requests/${r.id}/messages`, {
              headers: { Authorization: `Bearer ${f}` },
              credentials: 'include',
            })
          ).json();
          d(K);
        } catch {
          d([]);
        }
      },
      Ms = () => c(!1),
      Rs = async f => {
        m(!0);
        const E = Se();
        if (!E) return G('/staff');
        try {
          (await fetch(`/api/staff/requests/${r.id}/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${E}`,
            },
            credentials: 'include',
            body: JSON.stringify({ content: f }),
          }),
            d(K => [
              ...K,
              {
                id: (K.length + 1).toString(),
                sender: 'staff',
                content: f,
                time: new Date().toLocaleTimeString().slice(0, 5),
              },
            ]));
        } catch {}
        m(!1);
      },
      fs = async () => {
        (_(!0), de(''), I(''));
      },
      ys = async () => {
        if (V !== '2208') {
          I('Mật khẩu không đúng');
          return;
        }
        J(!0);
        try {
          const f = Se();
          if (!f) return (_(!1), G('/staff'));
          const K = await (
            await fetch('/api/staff/requests/all', {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${f}` },
              credentials: 'include',
            })
          ).json();
          (_(!1),
            K.success
              ? (alert(`${K.message}`), a([]))
              : alert(`Lỗi: ${K.error || 'Không thể xóa requests'}`));
        } catch (f) {
          (console.error('Error deleting all requests:', f),
            alert('Đã xảy ra lỗi khi xóa requests'),
            _(!1));
        } finally {
          (J(!1), de(''));
        }
      },
      A = s.filter(f => {
        if (x !== 'Tất cả' && f.status !== x) return !1;
        if (S || ee) {
          const E = new Date(f.created_at);
          if (S) {
            const K = new Date(S);
            if ((K.setHours(0, 0, 0, 0), E < K)) return !1;
          }
          if (ee) {
            const K = new Date(ee);
            if ((K.setHours(23, 59, 59, 999), E > K)) return !1;
          }
        }
        return !0;
      }),
      U = f => {
        (f.key === 'Enter' && ys(), ie && I(''));
      },
      ke = f => {
        f.stopPropagation();
      };
    return e.jsxs('div', {
      className:
        'min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-2 sm:p-6',
      children: [
        e.jsxs('div', {
          className:
            'max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-3 sm:p-6 border border-gray-200',
          children: [
            e.jsxs('div', {
              className: 'flex flex-col items-center mb-6',
              children: [
                e.jsx('img', {
                  src: '/assets/references/images/minhon-logo.jpg',
                  alt: 'Minhon Logo',
                  className: 'h-16 object-contain mb-2',
                }),
                e.jsx('h2', {
                  className:
                    'text-xl sm:text-2xl font-bold text-blue-900 text-center',
                  children: 'Staff Request Management',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex justify-between items-center mb-4',
              children: [
                e.jsx('button', {
                  onClick: () => G('/analytics'),
                  className:
                    'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition',
                  children: 'View Analytics',
                }),
                e.jsxs('div', {
                  className: 'flex gap-4',
                  children: [
                    e.jsx('button', {
                      onClick: fs,
                      disabled: T || s.length === 0,
                      className: `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition ${T || s.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`,
                      children: T ? 'Deleting...' : 'Delete All Requests',
                    }),
                    e.jsx('button', {
                      onClick: ds,
                      className:
                        'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition',
                      children: 'Refresh',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'mb-4 grid grid-cols-1 gap-4',
              children: [
                e.jsxs('div', {
                  className: 'flex flex-wrap items-center gap-2 sm:gap-3',
                  children: [
                    e.jsx('label', {
                      className: 'font-semibold text-blue-900 w-full sm:w-auto',
                      children: 'Lọc theo trạng thái:',
                    }),
                    e.jsx('select', {
                      className:
                        'w-full sm:w-auto border rounded px-3 py-1 text-sm',
                      value: x,
                      onChange: f => L(f.target.value),
                      children: Os.map(f =>
                        e.jsx('option', { value: f, children: f }, f)
                      ),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex flex-wrap items-center gap-2 sm:gap-3',
                  children: [
                    e.jsx('label', {
                      className: 'font-semibold text-blue-900 w-full sm:w-auto',
                      children: 'Lọc theo thời gian:',
                    }),
                    e.jsxs('div', {
                      className:
                        'flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center gap-2 w-full sm:w-auto',
                          children: [
                            e.jsx('label', {
                              className: 'text-sm text-gray-600 min-w-10',
                              children: 'Từ:',
                            }),
                            e.jsx('input', {
                              type: 'date',
                              className:
                                'border rounded px-2 py-1 text-sm w-full',
                              value: S,
                              onChange: f => k(f.target.value),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center gap-2 w-full sm:w-auto',
                          children: [
                            e.jsx('label', {
                              className: 'text-sm text-gray-600 min-w-10',
                              children: 'Đến:',
                            }),
                            e.jsx('input', {
                              type: 'date',
                              className:
                                'border rounded px-2 py-1 text-sm w-full',
                              value: ee,
                              onChange: f => se(f.target.value),
                            }),
                          ],
                        }),
                        (S || ee) &&
                          e.jsx('button', {
                            onClick: () => {
                              (k(''), se(''));
                            },
                            className:
                              'text-blue-600 hover:text-blue-800 text-sm mt-2 sm:mt-0',
                            children: 'Xóa lọc',
                          }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsx('div', {
              className: 'block sm:hidden',
              children: e.jsxs('div', {
                className: 'space-y-4',
                children: [
                  (console.log('Mobile rendering - filteredRequests:', A),
                  null),
                  A.length > 0
                    ? [...A]
                        .sort(
                          (f, E) =>
                            new Date(E.created_at).getTime() -
                            new Date(f.created_at).getTime()
                        )
                        .map(f =>
                          e.jsxs(
                            'div',
                            {
                              className:
                                'border rounded-lg p-3 bg-white shadow-sm',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex justify-between mb-2',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'font-semibold',
                                      children: [
                                        'Phòng: ',
                                        f.room_number || 'N/A',
                                      ],
                                    }),
                                    e.jsx('div', {
                                      className: `px-2 py-1 rounded-full text-xs font-semibold ${xa(f.status)}`,
                                      children: f.status || 'Chưa xác định',
                                    }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className: 'text-sm text-gray-500 mb-2',
                                  children: [
                                    'Order ID: ',
                                    f.orderId || f.id || 'N/A',
                                  ],
                                }),
                                e.jsx('div', {
                                  className: 'text-xs text-gray-500 mb-3',
                                  children: f.created_at
                                    ? e.jsxs(e.Fragment, {
                                        children: [
                                          new Date(
                                            f.created_at
                                          ).toLocaleDateString(),
                                          ' ',
                                          new Date(
                                            f.created_at
                                          ).toLocaleTimeString(),
                                        ],
                                      })
                                    : 'Thời gian không xác định',
                                }),
                                e.jsxs('div', {
                                  className: 'mb-3',
                                  children: [
                                    e.jsxs('button', {
                                      onClick: () =>
                                        ne(te === f.id ? null : f.id),
                                      className:
                                        'w-full flex justify-between items-center py-1 px-2 border rounded bg-gray-50 hover:bg-gray-100',
                                      children: [
                                        e.jsx('span', {
                                          className:
                                            'text-sm font-medium text-blue-700',
                                          children:
                                            te === f.id
                                              ? 'Ẩn nội dung'
                                              : 'Xem nội dung',
                                        }),
                                        e.jsx('svg', {
                                          className: `w-4 h-4 text-blue-700 transition-transform ${te === f.id ? 'rotate-180' : ''}`,
                                          fill: 'none',
                                          stroke: 'currentColor',
                                          viewBox: '0 0 24 24',
                                          children: e.jsx('path', {
                                            strokeLinecap: 'round',
                                            strokeLinejoin: 'round',
                                            strokeWidth: '2',
                                            d: 'M19 9l-7 7-7-7',
                                          }),
                                        }),
                                      ],
                                    }),
                                    te === f.id &&
                                      e.jsx('div', {
                                        className:
                                          'mt-2 p-2 bg-gray-50 rounded-md whitespace-pre-line break-words text-sm',
                                        children:
                                          f.request_content ||
                                          'Không có nội dung',
                                      }),
                                  ],
                                }),
                                e.jsxs('div', {
                                  className: 'flex flex-col gap-2',
                                  children: [
                                    e.jsx('select', {
                                      className:
                                        'border rounded px-2 py-2 text-sm w-full',
                                      value: v[f.id] ?? f.status,
                                      onChange: E =>
                                        q(K => ({
                                          ...K,
                                          [f.id]: E.target.value,
                                        })),
                                      children: Os.filter(
                                        E => E !== 'Tất cả'
                                      ).map(E =>
                                        e.jsx(
                                          'option',
                                          { value: E, children: E },
                                          E
                                        )
                                      ),
                                    }),
                                    e.jsxs('div', {
                                      className: 'grid grid-cols-2 gap-2',
                                      children: [
                                        e.jsx('button', {
                                          className:
                                            'bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded text-sm font-semibold',
                                          onClick: async () => {
                                            const E = v[f.id];
                                            E &&
                                              E !== f.status &&
                                              (await hs(E, f.id),
                                              q(K => {
                                                const { [f.id]: os, ...Ve } = K;
                                                return Ve;
                                              }));
                                          },
                                          children: 'Cập Nhật',
                                        }),
                                        e.jsx('button', {
                                          className:
                                            'bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded text-sm font-semibold',
                                          onClick: () => {
                                            (t(f), $e());
                                          },
                                          children: 'Nhắn khách',
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            },
                            f.id
                          )
                        )
                    : e.jsxs('div', {
                        className: 'text-center py-8 text-gray-500',
                        children: [
                          e.jsx('p', { children: 'Không có yêu cầu nào' }),
                          e.jsx('p', {
                            className: 'mt-2 text-sm',
                            children: 'Nhấn Refresh để tải lại dữ liệu',
                          }),
                        ],
                      }),
                ],
              }),
            }),
            e.jsx('div', {
              className: 'hidden sm:block overflow-x-auto',
              children: e.jsxs('table', {
                className: 'min-w-full text-sm',
                children: [
                  e.jsx('thead', {
                    children: e.jsxs('tr', {
                      className: 'bg-blue-100 text-blue-900',
                      children: [
                        e.jsx('th', {
                          className: 'py-2 px-3 text-left',
                          children: 'Room',
                        }),
                        e.jsx('th', {
                          className: 'py-2 px-3 text-left',
                          children: 'Order ID',
                        }),
                        e.jsx('th', {
                          className: 'py-2 px-6 text-left w-3/5',
                          children: 'Content',
                        }),
                        e.jsx('th', {
                          className: 'py-2 px-3 text-left',
                          children: 'Time',
                        }),
                        e.jsx('th', {
                          className: 'py-2 px-2 text-left w-1/12',
                          children: 'Status',
                        }),
                        e.jsx('th', {
                          className: 'py-2 px-3 text-left',
                          children: 'Action',
                        }),
                      ],
                    }),
                  }),
                  e.jsxs('tbody', {
                    children: [
                      (Array.isArray(A)
                        ? [...A].sort(
                            (f, E) =>
                              new Date(E.created_at).getTime() -
                              new Date(f.created_at).getTime()
                          )
                        : []
                      ).map(f =>
                        e.jsxs(
                          'tr',
                          {
                            className: 'border-b hover:bg-blue-50',
                            children: [
                              e.jsx('td', {
                                className: 'py-2 px-3 font-semibold',
                                children: f.room_number,
                              }),
                              e.jsx('td', {
                                className: 'py-2 px-3',
                                children: f.orderId || f.id,
                              }),
                              e.jsx('td', {
                                className:
                                  'py-2 px-6 whitespace-pre-line break-words max-w-4xl',
                                children: f.request_content,
                              }),
                              e.jsxs('td', {
                                className: 'py-2 px-3',
                                children: [
                                  f.created_at &&
                                    e.jsx('span', {
                                      className: 'block whitespace-nowrap',
                                      children: new Date(
                                        f.created_at
                                      ).toLocaleDateString(),
                                    }),
                                  f.created_at &&
                                    e.jsx('span', {
                                      className:
                                        'block whitespace-nowrap text-xs text-gray-500',
                                      children: new Date(
                                        f.created_at
                                      ).toLocaleTimeString(),
                                    }),
                                ],
                              }),
                              e.jsx('td', {
                                className: 'py-2 px-2',
                                children: e.jsx('span', {
                                  className: `px-2 py-1 rounded-full text-xs font-semibold ${xa(f.status)} break-words whitespace-normal block text-center`,
                                  children: f.status,
                                }),
                              }),
                              e.jsxs('td', {
                                className: 'py-2 px-3 space-x-2',
                                children: [
                                  e.jsx('select', {
                                    className:
                                      'border rounded px-2 py-1 text-xs',
                                    value: v[f.id] ?? f.status,
                                    onChange: E =>
                                      q(K => ({
                                        ...K,
                                        [f.id]: E.target.value,
                                      })),
                                    children: Os.filter(
                                      E => E !== 'Tất cả'
                                    ).map(E =>
                                      e.jsx(
                                        'option',
                                        { value: E, children: E },
                                        E
                                      )
                                    ),
                                  }),
                                  e.jsx('button', {
                                    className:
                                      'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold',
                                    onClick: async () => {
                                      const E = v[f.id];
                                      E &&
                                        E !== f.status &&
                                        (await hs(E, f.id),
                                        q(K => {
                                          const { [f.id]: os, ...Ve } = K;
                                          return Ve;
                                        }));
                                    },
                                    children: 'Cập Nhật',
                                  }),
                                  e.jsx('button', {
                                    className:
                                      'bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold',
                                    onClick: () => {
                                      (t(f), $e());
                                    },
                                    children: 'Nhắn khách',
                                  }),
                                ],
                              }),
                            ],
                          },
                          f.id
                        )
                      ),
                      A.length === 0 &&
                        e.jsx('tr', {
                          children: e.jsx('td', {
                            colSpan: 6,
                            className: 'py-8 text-center text-gray-500',
                            children: 'Không có yêu cầu nào',
                          }),
                        }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
        n &&
          r &&
          e.jsx(pt, {
            request: r,
            onClose: Ps,
            onStatusChange: f => hs(f, r.id),
            onOpenMessage: $e,
          }),
        i &&
          r &&
          e.jsx(vt, { messages: u, onClose: Ms, onSend: Rs, loading: w }),
        D &&
          e.jsx('div', {
            className:
              'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            children: e.jsxs('div', {
              className:
                'bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4',
              onClick: ke,
              children: [
                e.jsx('h3', {
                  className: 'text-lg font-bold text-red-600 mb-4',
                  children: 'Xác nhận xóa toàn bộ requests',
                }),
                e.jsx('p', {
                  className: 'mb-4 text-gray-700',
                  children:
                    'Hành động này sẽ xóa tất cả requests và không thể hoàn tác. Vui lòng nhập mật khẩu để xác nhận:',
                }),
                e.jsxs('div', {
                  className: 'mb-4',
                  children: [
                    e.jsx('input', {
                      type: 'password',
                      value: V,
                      onChange: f => de(f.target.value),
                      onKeyDown: U,
                      className: `w-full px-3 py-2 border rounded ${ie ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-red-500`,
                      placeholder: 'Nhập mật khẩu xác nhận',
                      autoFocus: !0,
                    }),
                    ie &&
                      e.jsx('p', {
                        className: 'text-red-500 text-sm mt-1',
                        children: ie,
                      }),
                    e.jsx('p', {
                      className: 'text-gray-500 text-xs mt-2 italic',
                      children:
                        'Biện pháp bảo vệ: Chức năng xóa yêu cầu mật khẩu xác nhận để ngăn ngừa xóa dữ liệu do nhầm lẫn.',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'flex justify-end space-x-3',
                  children: [
                    e.jsx('button', {
                      onClick: () => _(!1),
                      className:
                        'px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition duration-200',
                      children: 'Hủy',
                    }),
                    e.jsx('button', {
                      onClick: ys,
                      disabled: T,
                      className:
                        'px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition duration-200 flex items-center disabled:opacity-70',
                      children: T
                        ? e.jsxs(e.Fragment, {
                            children: [
                              e.jsxs('svg', {
                                className:
                                  'animate-spin -ml-1 mr-2 h-4 w-4 text-white',
                                xmlns: 'http://www.w3.org/2000/svg',
                                fill: 'none',
                                viewBox: '0 0 24 24',
                                children: [
                                  e.jsx('circle', {
                                    className: 'opacity-25',
                                    cx: '12',
                                    cy: '12',
                                    r: '10',
                                    stroke: 'currentColor',
                                    strokeWidth: '4',
                                  }),
                                  e.jsx('path', {
                                    className: 'opacity-75',
                                    fill: 'currentColor',
                                    d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                  }),
                                ],
                              }),
                              'Đang xóa...',
                            ],
                          })
                        : e.jsxs(e.Fragment, {
                            children: [
                              e.jsx('svg', {
                                xmlns: 'http://www.w3.org/2000/svg',
                                className: 'h-4 w-4 mr-1',
                                fill: 'none',
                                viewBox: '0 0 24 24',
                                stroke: 'currentColor',
                                children: e.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeWidth: 2,
                                  d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
                                }),
                              }),
                              'Xác nhận xóa',
                            ],
                          }),
                    }),
                  ],
                }),
              ],
            }),
          }),
      ],
    });
  },
  Zn = () => {
    const [s, a] = o.useState(!1),
      r = () => a(!0);
    return s ? e.jsx(Ot, {}) : e.jsx(qt, { onLogin: r });
  },
  ma = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'],
  _n = () => {
    const [s, a] = o.useState(null),
      [r, t] = o.useState([]),
      [n, l] = o.useState([]),
      i = Ba(),
      c = async u => {
        const d = localStorage.getItem('staff_token');
        if (!d) return (i('/staff'), null);
        try {
          const w = await fetch(u, {
            headers: { Authorization: `Bearer ${d}` },
          });
          return w.status === 401 ? (i('/staff'), null) : w.json();
        } catch (w) {
          return (console.error(`Failed to fetch from ${u}:`, w), null);
        }
      };
    return (
      o.useEffect(() => {
        (async () => {
          const d = await c('/api/analytics/overview'),
            w = await c('/api/analytics/service-distribution'),
            m = await c('/api/analytics/hourly-activity');
          (d && a(d), w && t(w), m && l(m));
        })();
      }, []),
      e.jsx('div', {
        className:
          'min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-6',
        children: e.jsxs('div', {
          className: 'max-w-7xl mx-auto',
          children: [
            e.jsxs('div', {
              className: 'flex justify-between items-center mb-6',
              children: [
                e.jsx('h1', {
                  className: 'text-2xl sm:text-3xl font-bold text-gray-800',
                  children: 'Analytics Dashboard',
                }),
                e.jsx('button', {
                  onClick: () => i('/staff/dashboard'),
                  className:
                    'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition',
                  children: 'Back to Staff Dashboard',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-6',
              children: [
                e.jsxs('div', {
                  className:
                    'bg-white p-6 rounded-xl shadow-md border border-gray-200',
                  children: [
                    e.jsx('h3', {
                      className: 'text-lg font-semibold text-gray-700',
                      children: 'Total Calls',
                    }),
                    e.jsx('p', {
                      className: 'text-3xl font-bold text-blue-600',
                      children: s?.totalCalls || '...',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'bg-white p-6 rounded-xl shadow-md border border-gray-200',
                  children: [
                    e.jsx('h3', {
                      className: 'text-lg font-semibold text-gray-700',
                      children: 'Avg. Call Duration',
                    }),
                    e.jsxs('p', {
                      className: 'text-3xl font-bold text-green-600',
                      children: [s?.averageCallDuration || '...', 's'],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'bg-white p-6 rounded-xl shadow-md border border-gray-200',
                  children: [
                    e.jsx('h3', {
                      className: 'text-lg font-semibold text-gray-700',
                      children: 'Languages',
                    }),
                    e.jsx(Te, {
                      width: '100%',
                      height: 150,
                      children: e.jsxs($s, {
                        children: [
                          e.jsx(Vs, {
                            data: s?.languageDistribution,
                            dataKey: 'count',
                            nameKey: 'language',
                            cx: '50%',
                            cy: '50%',
                            outerRadius: 60,
                            fill: '#8884d8',
                            label: !0,
                            children: s?.languageDistribution.map((u, d) =>
                              e.jsx(
                                Gs,
                                { fill: ma[d % ma.length] },
                                `cell-${d}`
                              )
                            ),
                          }),
                          e.jsx(Ae, {}),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
              children: [
                e.jsxs('div', {
                  className:
                    'bg-white p-6 rounded-xl shadow-md border border-gray-200',
                  children: [
                    e.jsx('h3', {
                      className: 'text-xl font-semibold text-gray-700 mb-4',
                      children: 'Popular Services',
                    }),
                    e.jsx(Te, {
                      width: '100%',
                      height: 300,
                      children: e.jsxs(Ua, {
                        data: r,
                        margin: { top: 5, right: 20, left: 10, bottom: 5 },
                        children: [
                          e.jsx(ss, { strokeDasharray: '3 3' }),
                          e.jsx(as, { dataKey: 'serviceType' }),
                          e.jsx(ts, {}),
                          e.jsx(Ae, {}),
                          e.jsx(oa, {}),
                          e.jsx(Ka, { dataKey: 'count', fill: '#8884d8' }),
                        ],
                      }),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'bg-white p-6 rounded-xl shadow-md border border-gray-200',
                  children: [
                    e.jsx('h3', {
                      className: 'text-xl font-semibold text-gray-700 mb-4',
                      children: 'Hourly Activity',
                    }),
                    e.jsx(Te, {
                      width: '100%',
                      height: 300,
                      children: e.jsxs(ia, {
                        data: n,
                        margin: { top: 5, right: 20, left: 10, bottom: 5 },
                        children: [
                          e.jsx(ss, { strokeDasharray: '3 3' }),
                          e.jsx(as, { dataKey: 'hour' }),
                          e.jsx(ts, {}),
                          e.jsx(Ae, {}),
                          e.jsx(oa, {}),
                          e.jsx(ms, {
                            type: 'monotone',
                            dataKey: 'count',
                            stroke: '#82ca9d',
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      })
    );
  },
  Je = {
    id: 'tenant-1',
    hotelName: 'Mi Nhon Hotel',
    subscriptionPlan: 'premium',
    subscriptionStatus: 'active',
    remainingDays: 15,
  },
  Ht = [
    {
      href: '/dashboard',
      icon: st,
      label: 'Tổng quan',
      description: 'Metrics và thống kê tổng quan',
    },
    {
      href: '/dashboard/setup',
      icon: fe,
      label: 'Thiết lập Assistant',
      description: 'Cấu hình và tùy chỉnh AI Assistant',
    },
    {
      href: '/dashboard/analytics',
      icon: at,
      label: 'Phân tích',
      description: 'Báo cáo và thống kê chi tiết',
    },
    {
      href: '/dashboard/settings',
      icon: De,
      label: 'Cài đặt',
      description: 'Quản lý thông tin khách sạn',
    },
  ],
  zt = s => {
    const a = [];
    return (
      s !== 'trial' &&
        a.push({
          href: '/dashboard/billing',
          icon: Ta,
          label: 'Thanh toán',
          description: 'Quản lý subscription và billing',
        }),
      s === 'enterprise' &&
        a.push({
          href: '/dashboard/team',
          icon: ge,
          label: 'Nhóm',
          description: 'Quản lý team và permissions',
        }),
      a
    );
  },
  Qn = ({ children: s }) => {
    const [a, r] = o.useState(!1);
    $a();
    const { tenant: t, logout: n } = pe();
    return (
      [...Ht, ...zt(t?.subscriptionPlan || Je.subscriptionPlan)],
      e.jsxs('div', {
        className: 'min-h-screen bg-gray-50 dark:bg-gray-900',
        children: [
          a &&
            e.jsx('div', {
              className: 'fixed inset-0 z-40 bg-black/50 lg:hidden',
              onClick: () => r(!1),
            }),
          e.jsx(Lt, { isOpen: a, onClose: () => r(!1), tenantData: t || Je }),
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
                        e.jsx(p, {
                          variant: 'ghost',
                          size: 'icon',
                          className: 'lg:hidden',
                          onClick: () => r(!0),
                          children: e.jsx(tt, { className: 'h-5 w-5' }),
                        }),
                        e.jsxs('div', {
                          children: [
                            e.jsx('h1', {
                              className:
                                'text-xl font-semibold text-gray-900 dark:text-white',
                              children: 'Dashboard',
                            }),
                            e.jsx('p', {
                              className: 'text-sm text-muted-foreground',
                              children: 'Quản lý khách sạn và AI Assistant',
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center gap-4',
                      children: [
                        e.jsxs(p, {
                          variant: 'ghost',
                          size: 'icon',
                          className: 'relative',
                          children: [
                            e.jsx(us, { className: 'h-5 w-5' }),
                            e.jsx('span', {
                              className:
                                'absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white',
                              children: '2',
                            }),
                          ],
                        }),
                        e.jsxs(Nt, {
                          children: [
                            e.jsx(ft, {
                              asChild: !0,
                              children: e.jsx(p, {
                                variant: 'ghost',
                                className: 'relative h-10 w-10 rounded-full',
                                children: e.jsxs(yt, {
                                  className: 'h-10 w-10',
                                  children: [
                                    e.jsx(bt, {
                                      src: '',
                                      alt: (t || Je).hotelName,
                                    }),
                                    e.jsx(wt, {
                                      className:
                                        'bg-primary text-primary-foreground',
                                      children: (t || Je).hotelName
                                        .charAt(0)
                                        .toUpperCase(),
                                    }),
                                  ],
                                }),
                              }),
                            }),
                            e.jsxs(Ct, {
                              className: 'w-56',
                              align: 'end',
                              children: [
                                e.jsxs(St, {
                                  className: 'flex flex-col',
                                  children: [
                                    e.jsx('div', {
                                      className: 'font-medium',
                                      children: (t || Je).hotelName,
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'text-xs text-muted-foreground',
                                      children: ['ID: ', (t || Je).id],
                                    }),
                                  ],
                                }),
                                e.jsx(ha, {}),
                                e.jsxs(qs, {
                                  children: [
                                    e.jsx(De, { className: 'mr-2 h-4 w-4' }),
                                    'Cài đặt tài khoản',
                                  ],
                                }),
                                e.jsxs(qs, {
                                  children: [
                                    e.jsx(nt, { className: 'mr-2 h-4 w-4' }),
                                    'Trợ giúp',
                                  ],
                                }),
                                e.jsx(ha, {}),
                                e.jsxs(qs, {
                                  className: 'text-red-600 focus:text-red-600',
                                  onClick: n,
                                  children: [
                                    e.jsx(lt, { className: 'mr-2 h-4 w-4' }),
                                    'Đăng xuất',
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              e.jsx('main', { className: 'p-6', children: s }),
            ],
          }),
        ],
      })
    );
  },
  ve = {
    totalCalls: 1247,
    totalCallsGrowth: 12.5,
    averageCallDuration: 245,
    callDurationGrowth: -5.2,
    activeUsers: 89,
    activeUsersGrowth: 8.3,
    satisfactionScore: 4.7,
    satisfactionGrowth: 2.1,
    languageDistribution: [
      { language: 'Tiếng Việt', count: 687, percentage: 55.1 },
      { language: 'English', count: 423, percentage: 33.9 },
      { language: 'Français', count: 137, percentage: 11 },
    ],
    recentActivity: [
      { time: '2 phút trước', action: 'Cuộc gọi từ phòng 205', type: 'call' },
      {
        time: '5 phút trước',
        action: 'Đặt room service từ phòng 301',
        type: 'service',
      },
      {
        time: '12 phút trước',
        action: 'Hỏi thông tin về spa',
        type: 'inquiry',
      },
      {
        time: '18 phút trước',
        action: 'Phàn nàn về tiếng ồn',
        type: 'complaint',
      },
    ],
  },
  Ge = { usageLimit: 5e3, currentUsage: 1247, resetDate: '2024-01-01' },
  ws = ({
    title: s,
    value: a,
    change: r,
    icon: t,
    description: n,
    suffix: l = '',
  }) =>
    e.jsxs(j, {
      children: [
        e.jsxs(y, {
          className:
            'flex flex-row items-center justify-between space-y-0 pb-2',
          children: [
            e.jsx(b, { className: 'text-sm font-medium', children: s }),
            e.jsx(t, { className: 'h-4 w-4 text-muted-foreground' }),
          ],
        }),
        e.jsxs(g, {
          children: [
            e.jsxs('div', {
              className: 'text-2xl font-bold',
              children: [a, l],
            }),
            e.jsxs('div', {
              className: 'flex items-center pt-1',
              children: [
                e.jsx('div', {
                  className: 'text-xs text-muted-foreground',
                  children: n,
                }),
                r !== void 0 &&
                  e.jsxs('div', {
                    className: `ml-auto flex items-center text-xs ${r > 0 ? 'text-green-600' : 'text-red-600'}`,
                    children: [
                      e.jsx(he, {
                        className: `h-3 w-3 mr-1 ${r < 0 ? 'rotate-180' : ''}`,
                      }),
                      Math.abs(r),
                      '%',
                    ],
                  }),
              ],
            }),
          ],
        }),
      ],
    }),
  Bt = ({ time: s, action: a, type: r }) => {
    const t = () => {
      switch (r) {
        case 'call':
          return e.jsx(be, { className: 'h-4 w-4 text-blue-500' });
        case 'service':
          return e.jsx(fe, { className: 'h-4 w-4 text-green-500' });
        case 'inquiry':
          return e.jsx(cs, { className: 'h-4 w-4 text-purple-500' });
        case 'complaint':
          return e.jsx(ae, { className: 'h-4 w-4 text-red-500' });
        default:
          return e.jsx(Le, { className: 'h-4 w-4 text-gray-500' });
      }
    };
    return e.jsxs('div', {
      className:
        'flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg',
      children: [
        e.jsx('div', { className: 'flex-shrink-0', children: t() }),
        e.jsxs('div', {
          className: 'flex-1 min-w-0',
          children: [
            e.jsx('p', {
              className:
                'text-sm font-medium text-gray-900 dark:text-white truncate',
              children: a,
            }),
            e.jsx('p', {
              className: 'text-xs text-gray-500 dark:text-gray-400',
              children: s,
            }),
          ],
        }),
      ],
    });
  },
  Ut = () =>
    e.jsxs(j, {
      children: [
        e.jsxs(y, {
          children: [
            e.jsxs(b, {
              className: 'flex items-center gap-2',
              children: [e.jsx(De, { className: 'h-5 w-5' }), 'Thao tác nhanh'],
            }),
            e.jsx(M, { children: 'Các tính năng thường dùng' }),
          ],
        }),
        e.jsxs(g, {
          className: 'space-y-3',
          children: [
            e.jsx(le, {
              href: '/dashboard/setup',
              children: e.jsxs(p, {
                variant: 'outline',
                className: 'w-full justify-start',
                children: [
                  e.jsx(fe, { className: 'h-4 w-4 mr-2' }),
                  'Cấu hình AI Assistant',
                ],
              }),
            }),
            e.jsx(le, {
              href: '/dashboard/analytics',
              children: e.jsxs(p, {
                variant: 'outline',
                className: 'w-full justify-start',
                children: [
                  e.jsx(Ls, { className: 'h-4 w-4 mr-2' }),
                  'Xem báo cáo chi tiết',
                ],
              }),
            }),
            e.jsx(le, {
              href: '/dashboard/settings',
              children: e.jsxs(p, {
                variant: 'outline',
                className: 'w-full justify-start',
                children: [
                  e.jsx(De, { className: 'h-4 w-4 mr-2' }),
                  'Cài đặt khách sạn',
                ],
              }),
            }),
          ],
        }),
      ],
    }),
  Kt = () => {
    const s = (Ge.currentUsage / Ge.usageLimit) * 100;
    return e.jsxs(j, {
      children: [
        e.jsxs(y, {
          children: [
            e.jsxs(b, {
              className: 'flex items-center gap-2',
              children: [
                e.jsx(Le, { className: 'h-5 w-5' }),
                'Sử dụng tháng này',
              ],
            }),
            e.jsx(M, { children: 'Theo dõi giới hạn subscription' }),
          ],
        }),
        e.jsxs(g, {
          className: 'space-y-4',
          children: [
            e.jsxs('div', {
              className: 'space-y-2',
              children: [
                e.jsxs('div', {
                  className: 'flex justify-between text-sm',
                  children: [
                    e.jsx('span', { children: 'Cuộc gọi' }),
                    e.jsxs('span', {
                      children: [
                        Ge.currentUsage.toLocaleString(),
                        ' / ',
                        Ge.usageLimit.toLocaleString(),
                      ],
                    }),
                  ],
                }),
                e.jsx(Pe, { value: s, className: 'h-2' }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex items-center justify-between text-sm',
              children: [
                e.jsx('span', {
                  className: 'text-muted-foreground',
                  children: 'Còn lại',
                }),
                e.jsxs('span', {
                  className: 'font-medium',
                  children: [
                    (Ge.usageLimit - Ge.currentUsage).toLocaleString(),
                    ' cuộc gọi',
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className:
                'flex items-center gap-2 text-sm text-muted-foreground',
              children: [
                e.jsx(ye, { className: 'h-4 w-4' }),
                e.jsxs('span', { children: ['Reset vào ', Ge.resetDate] }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  $t = () =>
    e.jsxs(j, {
      children: [
        e.jsx(y, {
          children: e.jsxs(b, {
            className: 'flex items-center gap-2',
            children: [
              e.jsx(rs, { className: 'h-5 w-5 text-green-500' }),
              'Trạng thái hệ thống',
            ],
          }),
        }),
        e.jsxs(g, {
          className: 'space-y-3',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx('div', {
                      className: 'h-2 w-2 bg-green-500 rounded-full',
                    }),
                    e.jsx('span', {
                      className: 'text-sm',
                      children: 'AI Assistant',
                    }),
                  ],
                }),
                e.jsx(R, {
                  variant: 'outline',
                  className: 'text-green-600',
                  children: 'Hoạt động',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex items-center justify-between',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx('div', {
                      className: 'h-2 w-2 bg-green-500 rounded-full',
                    }),
                    e.jsx('span', {
                      className: 'text-sm',
                      children: 'Voice API',
                    }),
                  ],
                }),
                e.jsx(R, {
                  variant: 'outline',
                  className: 'text-green-600',
                  children: 'Hoạt động',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex items-center justify-between',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx('div', {
                      className: 'h-2 w-2 bg-green-500 rounded-full',
                    }),
                    e.jsx('span', {
                      className: 'text-sm',
                      children: 'Analytics',
                    }),
                  ],
                }),
                e.jsx(R, {
                  variant: 'outline',
                  className: 'text-green-600',
                  children: 'Hoạt động',
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  Wn = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          children: [
            e.jsx('h1', {
              className: 'text-3xl font-bold text-gray-900 dark:text-white',
              children: 'Tổng quan',
            }),
            e.jsx('p', {
              className: 'text-gray-600 dark:text-gray-400 mt-2',
              children:
                'Theo dõi hiệu suất AI Assistant và hoạt động khách sạn',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
          children: [
            e.jsx(ws, {
              title: 'Tổng cuộc gọi',
              value: ve.totalCalls.toLocaleString(),
              change: ve.totalCallsGrowth,
              icon: be,
              description: 'Tháng này',
            }),
            e.jsx(ws, {
              title: 'Thời gian trung bình',
              value: Math.floor(ve.averageCallDuration / 60),
              change: ve.callDurationGrowth,
              icon: ye,
              description: 'Phút/cuộc gọi',
              suffix: 'm',
            }),
            e.jsx(ws, {
              title: 'Người dùng hoạt động',
              value: ve.activeUsers,
              change: ve.activeUsersGrowth,
              icon: ge,
              description: 'Trong 7 ngày',
            }),
            e.jsx(ws, {
              title: 'Điểm hài lòng',
              value: ve.satisfactionScore,
              change: ve.satisfactionGrowth,
              icon: he,
              description: 'Trên 5 điểm',
              suffix: '/5',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
          children: [
            e.jsxs(j, {
              className: 'lg:col-span-2',
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(is, { className: 'h-5 w-5' }),
                        'Phân bố ngôn ngữ',
                      ],
                    }),
                    e.jsx(M, {
                      children: 'Ngôn ngữ được sử dụng trong các cuộc gọi',
                    }),
                  ],
                }),
                e.jsx(g, {
                  children: e.jsx('div', {
                    className: 'space-y-4',
                    children: ve.languageDistribution.map(s =>
                      e.jsxs(
                        'div',
                        {
                          className: 'space-y-2',
                          children: [
                            e.jsxs('div', {
                              className: 'flex justify-between text-sm',
                              children: [
                                e.jsx('span', {
                                  className: 'font-medium',
                                  children: s.language,
                                }),
                                e.jsxs('span', {
                                  className: 'text-muted-foreground',
                                  children: [s.count, ' (', s.percentage, '%)'],
                                }),
                              ],
                            }),
                            e.jsx(Pe, {
                              value: s.percentage,
                              className: 'h-2',
                            }),
                          ],
                        },
                        s.language
                      )
                    ),
                  }),
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'space-y-6',
              children: [e.jsx(Ut, {}), e.jsx(Kt, {})],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(Le, { className: 'h-5 w-5' }),
                        'Hoạt động gần đây',
                      ],
                    }),
                    e.jsx(M, {
                      children: 'Các sự kiện mới nhất từ AI Assistant',
                    }),
                  ],
                }),
                e.jsx(g, {
                  children: e.jsx('div', {
                    className: 'space-y-1',
                    children: ve.recentActivity.map((s, a) =>
                      e.jsx(
                        Bt,
                        { time: s.time, action: s.action, type: s.type },
                        a
                      )
                    ),
                  }),
                }),
              ],
            }),
            e.jsx($t, {}),
          ],
        }),
      ],
    }),
  Vt = ({ state: s, onNext: a, onError: r, onUpdateState: t }) => {
    const n = (c, u) => {
        t({
          formData: { ...s.formData, [c]: u },
          validation: { ...s.validation, [c]: null },
        });
      },
      l = () => {
        const c = {};
        return (
          s.formData.hotelName.trim()
            ? s.formData.hotelName.length < 2 &&
              (c.hotelName = 'Tên khách sạn phải có ít nhất 2 ký tự')
            : (c.hotelName = 'Tên khách sạn là bắt buộc'),
          t({ validation: { ...s.validation, ...c } }),
          Object.keys(c).length === 0
        );
      },
      i = async () => {
        if (l()) {
          t({ isResearching: !0, error: null });
          try {
            const c = await Va.researchHotel({
              hotelName: s.formData.hotelName,
              location: s.formData.location || void 0,
              researchTier: s.formData.researchTier,
            });
            c.success && Rt(c.hotelData)
              ? a(c.hotelData)
              : r({ error: 'Dữ liệu khách sạn không hợp lệ' });
          } catch (c) {
            r(c);
          } finally {
            t({ isResearching: !1 });
          }
        }
      };
    return e.jsxs(j, {
      className: 'max-w-2xl mx-auto',
      children: [
        e.jsxs(y, {
          className: 'text-center',
          children: [
            e.jsx('div', {
              className: 'flex justify-center mb-4',
              children: e.jsx('div', {
                className:
                  'flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground',
                children: e.jsx(Me, { className: 'h-6 w-6' }),
              }),
            }),
            e.jsx(b, {
              className: 'text-2xl',
              children: 'Tìm kiếm thông tin khách sạn',
            }),
            e.jsx(M, {
              children:
                'Chúng tôi sẽ tự động nghiên cứu và thu thập thông tin về khách sạn của bạn',
            }),
          ],
        }),
        e.jsxs(g, {
          className: 'space-y-6',
          children: [
            e.jsxs('div', {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx(h, {
                      htmlFor: 'hotel-name',
                      children: 'Tên khách sạn *',
                    }),
                    e.jsx(C, {
                      id: 'hotel-name',
                      placeholder: 'Ví dụ: Grand Hotel Saigon',
                      value: s.formData.hotelName,
                      onChange: c => n('hotelName', c.target.value),
                      className: `mt-1 ${s.validation.hotelName ? 'border-red-500' : ''}`,
                    }),
                    s.validation.hotelName &&
                      e.jsx('p', {
                        className: 'text-sm text-red-500 mt-1',
                        children: s.validation.hotelName,
                      }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx(h, {
                      htmlFor: 'location',
                      children: 'Địa điểm (không bắt buộc)',
                    }),
                    e.jsx(C, {
                      id: 'location',
                      placeholder: 'Ví dụ: Ho Chi Minh City, Vietnam',
                      value: s.formData.location,
                      onChange: c => n('location', c.target.value),
                      className: 'mt-1',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx(h, {
                      htmlFor: 'research-tier',
                      children: 'Mức độ nghiên cứu',
                    }),
                    e.jsxs(Q, {
                      value: s.formData.researchTier,
                      onValueChange: c => n('researchTier', c),
                      children: [
                        e.jsx(W, { className: 'mt-1', children: e.jsx(X, {}) }),
                        e.jsxs(Y, {
                          children: [
                            e.jsx(N, {
                              value: 'basic',
                              children: 'Cơ bản (Miễn phí)',
                            }),
                            e.jsx(N, {
                              value: 'advanced',
                              children: 'Nâng cao (Premium)',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'bg-blue-50 p-4 rounded-lg',
              children: [
                e.jsx('h4', {
                  className: 'font-medium text-blue-900 mb-2',
                  children: 'Thông tin sẽ được thu thập:',
                }),
                e.jsxs('ul', {
                  className: 'text-sm text-blue-800 space-y-1',
                  children: [
                    e.jsx('li', {
                      children:
                        '• Thông tin cơ bản (địa chỉ, số điện thoại, website)',
                    }),
                    e.jsx('li', { children: '• Dịch vụ và tiện nghi' }),
                    e.jsx('li', { children: '• Các loại phòng và giá cả' }),
                    e.jsx('li', {
                      children: '• Chính sách check-in/check-out',
                    }),
                    e.jsx('li', { children: '• Các điểm tham quan gần đó' }),
                    s.formData.researchTier === 'advanced' &&
                      e.jsxs(e.Fragment, {
                        children: [
                          e.jsx('li', { children: '• Dữ liệu mạng xã hội' }),
                          e.jsx('li', {
                            children: '• Phân tích đánh giá khách hàng',
                          }),
                          e.jsx('li', {
                            children: '• Thông tin đối thủ cạnh tranh',
                          }),
                        ],
                      }),
                  ],
                }),
              ],
            }),
            s.error &&
              e.jsxs(na, {
                variant: 'destructive',
                children: [
                  e.jsx(ae, { className: 'h-4 w-4' }),
                  e.jsxs(la, {
                    children: [
                      s.error.error,
                      s.error.upgradeRequired &&
                        e.jsx('div', {
                          className: 'mt-2',
                          children: e.jsx(p, {
                            variant: 'outline',
                            size: 'sm',
                            children: 'Nâng cấp gói dịch vụ',
                          }),
                        }),
                    ],
                  }),
                ],
              }),
            e.jsx(p, {
              onClick: i,
              disabled: !s.formData.hotelName.trim() || s.isResearching,
              className: 'w-full',
              size: 'lg',
              children: s.isResearching
                ? e.jsxs(e.Fragment, {
                    children: [
                      e.jsx(Oe, { className: 'w-4 h-4 mr-2 animate-spin' }),
                      'Đang tìm kiếm...',
                    ],
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsx(Me, { className: 'w-4 h-4 mr-2' }),
                      'Tìm kiếm khách sạn',
                    ],
                  }),
            }),
          ],
        }),
      ],
    });
  },
  Gt = ({ state: s, onNext: a, onBack: r, onError: t, onUpdateState: n }) => {
    const [l, i] = o.useState(!1),
      [c, u] = o.useState(s.hotelData),
      [d, w] = o.useState(new Set(['basic'])),
      m = S => {
        const k = new Set(d);
        (k.has(S) ? k.delete(S) : k.add(S), w(k));
      },
      x = () => {
        (i(!l), l && c && n({ hotelData: c }));
      },
      L = () => {
        s.hotelData && a();
      };
    return s.hotelData
      ? e.jsxs('div', {
          className: 'max-w-4xl mx-auto space-y-6',
          children: [
            e.jsxs('div', {
              className: 'text-center',
              children: [
                e.jsx('div', {
                  className: 'flex justify-center mb-4',
                  children: e.jsx('div', {
                    className:
                      'flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600',
                    children: e.jsx(rs, { className: 'h-6 w-6' }),
                  }),
                }),
                e.jsx('h2', {
                  className: 'text-2xl font-bold',
                  children: 'Xác nhận thông tin khách sạn',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 mt-2',
                  children:
                    'Vui lòng kiểm tra và xác nhận thông tin đã thu thập',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex justify-center gap-2 mb-6',
              children: [
                e.jsxs(p, {
                  variant: l ? 'default' : 'outline',
                  onClick: x,
                  size: 'sm',
                  children: [
                    e.jsx(De, { className: 'w-4 h-4 mr-2' }),
                    l ? 'Lưu thay đổi' : 'Chỉnh sửa',
                  ],
                }),
                e.jsxs(p, {
                  variant: 'outline',
                  onClick: r,
                  size: 'sm',
                  children: [
                    e.jsx(Bs, { className: 'w-4 h-4 mr-2' }),
                    'Tìm kiếm lại',
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
              children: [
                e.jsxs(j, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => m('basic'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(As, { className: 'h-5 w-5' }),
                              'Thông tin cơ bản',
                            ],
                          }),
                          d.has('basic')
                            ? e.jsx(Xe, { className: 'h-4 w-4' })
                            : e.jsx(Ye, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    d.has('basic') &&
                      e.jsxs(g, {
                        className: 'space-y-3',
                        children: [
                          e.jsxs('div', {
                            className: 'space-y-2',
                            children: [
                              e.jsx(h, { children: 'Tên khách sạn' }),
                              e.jsx('p', {
                                className: 'font-medium',
                                children: s.hotelData.name,
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'space-y-2',
                            children: [
                              e.jsx(h, { children: 'Địa chỉ' }),
                              e.jsx('p', {
                                className: 'text-sm text-gray-600',
                                children: s.hotelData.address,
                              }),
                            ],
                          }),
                          s.hotelData.phone &&
                            e.jsxs('div', {
                              className: 'space-y-2',
                              children: [
                                e.jsx(h, { children: 'Số điện thoại' }),
                                e.jsx('p', {
                                  className: 'text-sm',
                                  children: s.hotelData.phone,
                                }),
                              ],
                            }),
                          s.hotelData.website &&
                            e.jsxs('div', {
                              className: 'space-y-2',
                              children: [
                                e.jsx(h, { children: 'Website' }),
                                e.jsxs('a', {
                                  href: s.hotelData.website,
                                  target: '_blank',
                                  rel: 'noopener noreferrer',
                                  className:
                                    'text-blue-600 hover:underline text-sm flex items-center gap-1',
                                  children: [
                                    s.hotelData.website,
                                    e.jsx(it, { className: 'h-3 w-3' }),
                                  ],
                                }),
                              ],
                            }),
                          s.hotelData.rating &&
                            e.jsxs('div', {
                              className: 'space-y-2',
                              children: [
                                e.jsx(h, { children: 'Đánh giá' }),
                                e.jsxs('div', {
                                  className: 'flex items-center gap-1',
                                  children: [
                                    e.jsx(es, {
                                      className:
                                        'h-4 w-4 fill-yellow-400 text-yellow-400',
                                    }),
                                    e.jsx('span', {
                                      className: 'font-medium',
                                      children: s.hotelData.rating,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                        ],
                      }),
                  ],
                }),
                e.jsxs(j, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => m('services'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(De, { className: 'h-5 w-5' }),
                              'Dịch vụ (',
                              s.hotelData.services.length,
                              ')',
                            ],
                          }),
                          d.has('services')
                            ? e.jsx(Xe, { className: 'h-4 w-4' })
                            : e.jsx(Ye, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    d.has('services') &&
                      e.jsx(g, {
                        children: e.jsx('div', {
                          className: 'space-y-2',
                          children: s.hotelData.services.map((S, k) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'p-2 bg-gray-50 rounded',
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium text-sm',
                                    children: S.name,
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-600',
                                    children: S.description,
                                  }),
                                ],
                              },
                              k
                            )
                          ),
                        }),
                      }),
                  ],
                }),
                e.jsxs(j, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => m('amenities'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(Ws, { className: 'h-5 w-5' }),
                              'Tiện nghi (',
                              s.hotelData.amenities.length,
                              ')',
                            ],
                          }),
                          d.has('amenities')
                            ? e.jsx(Xe, { className: 'h-4 w-4' })
                            : e.jsx(Ye, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    d.has('amenities') &&
                      e.jsx(g, {
                        children: e.jsx('div', {
                          className: 'flex flex-wrap gap-2',
                          children: s.hotelData.amenities.map((S, k) =>
                            e.jsx(R, { variant: 'secondary', children: S }, k)
                          ),
                        }),
                      }),
                  ],
                }),
                e.jsxs(j, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => m('rooms'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(ge, { className: 'h-5 w-5' }),
                              'Loại phòng (',
                              s.hotelData.roomTypes.length,
                              ')',
                            ],
                          }),
                          d.has('rooms')
                            ? e.jsx(Xe, { className: 'h-4 w-4' })
                            : e.jsx(Ye, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    d.has('rooms') &&
                      e.jsx(g, {
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: s.hotelData.roomTypes.map((S, k) =>
                            e.jsx(
                              'div',
                              {
                                className: 'p-3 border rounded',
                                children: e.jsxs('div', {
                                  className: 'flex justify-between items-start',
                                  children: [
                                    e.jsxs('div', {
                                      children: [
                                        e.jsx('div', {
                                          className: 'font-medium',
                                          children: S.name,
                                        }),
                                        e.jsx('div', {
                                          className: 'text-sm text-gray-600',
                                          children: S.description,
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className: 'text-right',
                                      children: [
                                        e.jsxs('div', {
                                          className: 'font-bold text-green-600',
                                          children: [
                                            S.price.toLocaleString(),
                                            ' VND',
                                          ],
                                        }),
                                        e.jsx('div', {
                                          className: 'text-xs text-gray-500',
                                          children: '/ đêm',
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              },
                              k
                            )
                          ),
                        }),
                      }),
                  ],
                }),
                e.jsxs(j, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => m('policies'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(ye, { className: 'h-5 w-5' }),
                              'Chính sách',
                            ],
                          }),
                          d.has('policies')
                            ? e.jsx(Xe, { className: 'h-4 w-4' })
                            : e.jsx(Ye, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    d.has('policies') &&
                      e.jsxs(g, {
                        className: 'space-y-3',
                        children: [
                          e.jsxs('div', {
                            className: 'flex justify-between',
                            children: [
                              e.jsx('span', {
                                className: 'text-sm',
                                children: 'Check-in:',
                              }),
                              e.jsx('span', {
                                className: 'font-medium',
                                children: s.hotelData.policies.checkIn,
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex justify-between',
                            children: [
                              e.jsx('span', {
                                className: 'text-sm',
                                children: 'Check-out:',
                              }),
                              e.jsx('span', {
                                className: 'font-medium',
                                children: s.hotelData.policies.checkOut,
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'flex justify-between',
                            children: [
                              e.jsx('span', {
                                className: 'text-sm',
                                children: 'Hủy phòng:',
                              }),
                              e.jsx('span', {
                                className: 'font-medium',
                                children: s.hotelData.policies.cancellation,
                              }),
                            ],
                          }),
                        ],
                      }),
                  ],
                }),
                e.jsxs(j, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => m('attractions'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(Xs, { className: 'h-5 w-5' }),
                              'Điểm tham quan (',
                              s.hotelData.localAttractions.length,
                              ')',
                            ],
                          }),
                          d.has('attractions')
                            ? e.jsx(Xe, { className: 'h-4 w-4' })
                            : e.jsx(Ye, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    d.has('attractions') &&
                      e.jsx(g, {
                        children: e.jsx('div', {
                          className: 'space-y-2',
                          children: s.hotelData.localAttractions.map((S, k) =>
                            e.jsxs(
                              'div',
                              {
                                className: 'p-2 bg-gray-50 rounded',
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium text-sm',
                                    children: S.name,
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-600',
                                    children: S.description,
                                  }),
                                  S.distance &&
                                    e.jsxs('div', {
                                      className: 'text-xs text-blue-600 mt-1',
                                      children: ['Cách ', S.distance],
                                    }),
                                ],
                              },
                              k
                            )
                          ),
                        }),
                      }),
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex justify-between',
              children: [
                e.jsxs(p, {
                  variant: 'outline',
                  onClick: r,
                  children: [
                    e.jsx(Bs, { className: 'w-4 h-4 mr-2' }),
                    'Quay lại',
                  ],
                }),
                e.jsxs(p, {
                  onClick: L,
                  size: 'lg',
                  children: [
                    'Tiếp tục',
                    e.jsx(rt, { className: 'w-4 h-4 ml-2' }),
                  ],
                }),
              ],
            }),
          ],
        })
      : e.jsx(j, {
          className: 'max-w-2xl mx-auto',
          children: e.jsxs(g, {
            className: 'text-center py-8',
            children: [
              e.jsx(ae, {
                className: 'h-12 w-12 text-yellow-500 mx-auto mb-4',
              }),
              e.jsx('p', {
                children: 'Không tìm thấy dữ liệu khách sạn. Vui lòng thử lại.',
              }),
              e.jsx(p, { onClick: r, className: 'mt-4', children: 'Quay lại' }),
            ],
          }),
        });
  },
  Zt = ({ state: s, onNext: a, onBack: r, onError: t, onUpdateState: n }) => {
    const l = (d, w) => {
        n({
          customization: { ...s.customization, [d]: w },
          validation: { ...s.validation, [d]: null },
        });
      },
      i = (d, w) => {
        let m = [...s.customization.languages];
        (w ? m.push(d) : (m = m.filter(x => x !== d)), l('languages', m));
      },
      c = () => {
        const d = {};
        return (
          s.customization.languages.length === 0 &&
            (d.languages = 'Vui lòng chọn ít nhất một ngôn ngữ'),
          n({ validation: { ...s.validation, ...d } }),
          Object.keys(d).length === 0
        );
      },
      u = async () => {
        if (!(!c() || !s.hotelData)) {
          if (!Et(s.customization)) {
            t({ error: 'Cấu hình Assistant không hợp lệ' });
            return;
          }
          n({ isGenerating: !0, error: null });
          try {
            const d = await Va.generateAssistant({
              hotelData: s.hotelData,
              customization: s.customization,
            });
            d.success
              ? a(d.assistantId)
              : t({ error: 'Không thể tạo Assistant' });
          } catch (d) {
            t(d);
          } finally {
            n({ isGenerating: !1 });
          }
        }
      };
    return e.jsxs('div', {
      className: 'max-w-3xl mx-auto space-y-6',
      children: [
        e.jsxs('div', {
          className: 'text-center',
          children: [
            e.jsx('div', {
              className: 'flex justify-center mb-4',
              children: e.jsx('div', {
                className:
                  'flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600',
                children: e.jsx(fe, { className: 'h-6 w-6' }),
              }),
            }),
            e.jsx('h2', {
              className: 'text-2xl font-bold',
              children: 'Tùy chỉnh AI Assistant',
            }),
            e.jsx('p', {
              className: 'text-gray-600 mt-2',
              children:
                'Cá nhân hóa AI Assistant theo phong cách khách sạn của bạn',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
          children: [
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(ct, { className: 'h-5 w-5' }),
                        'Tính cách',
                      ],
                    }),
                    e.jsx(M, {
                      children: 'Chọn phong cách giao tiếp của AI Assistant',
                    }),
                  ],
                }),
                e.jsx(g, {
                  children: e.jsxs(Q, {
                    value: s.customization.personality,
                    onValueChange: d => l('personality', d),
                    children: [
                      e.jsx(W, { children: e.jsx(X, {}) }),
                      e.jsx(Y, {
                        children: It.map(d =>
                          e.jsx(
                            N,
                            {
                              value: d.value,
                              children: e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium',
                                    children: d.label,
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-500',
                                    children: d.description,
                                  }),
                                ],
                              }),
                            },
                            d.value
                          )
                        ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(ra, { className: 'h-5 w-5' }),
                        'Giọng điệu',
                      ],
                    }),
                    e.jsx(M, { children: 'Chọn cách thức giao tiếp' }),
                  ],
                }),
                e.jsx(g, {
                  children: e.jsxs(Q, {
                    value: s.customization.tone,
                    onValueChange: d => l('tone', d),
                    children: [
                      e.jsx(W, { children: e.jsx(X, {}) }),
                      e.jsx(Y, {
                        children: Ft.map(d =>
                          e.jsx(
                            N,
                            {
                              value: d.value,
                              children: e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium',
                                    children: d.label,
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-500',
                                    children: d.description,
                                  }),
                                ],
                              }),
                            },
                            d.value
                          )
                        ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
            e.jsxs(j, {
              className: 'md:col-span-2',
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(is, { className: 'h-5 w-5' }),
                        'Ngôn ngữ hỗ trợ',
                      ],
                    }),
                    e.jsx(M, {
                      children:
                        'Chọn các ngôn ngữ mà AI Assistant có thể giao tiếp',
                    }),
                  ],
                }),
                e.jsxs(g, {
                  children: [
                    e.jsx('div', {
                      className: 'grid grid-cols-2 md:grid-cols-3 gap-3',
                      children: Pt.map(d =>
                        e.jsxs(
                          'div',
                          {
                            className: 'flex items-center space-x-2',
                            children: [
                              e.jsx(kt, {
                                id: d.value,
                                checked: s.customization.languages.includes(
                                  d.value
                                ),
                                onCheckedChange: w => i(d.value, w),
                              }),
                              e.jsxs(h, {
                                htmlFor: d.value,
                                className:
                                  'flex items-center gap-2 cursor-pointer',
                                children: [
                                  e.jsx('span', { children: d.flag }),
                                  e.jsx('span', { children: d.label }),
                                ],
                              }),
                            ],
                          },
                          d.value
                        )
                      ),
                    }),
                    s.validation.languages &&
                      e.jsx('p', {
                        className: 'text-sm text-red-500 mt-2',
                        children: s.validation.languages,
                      }),
                  ],
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(dt, { className: 'h-5 w-5' }),
                        'Cài đặt giọng nói',
                      ],
                    }),
                    e.jsx(M, { children: 'Điều chỉnh thời gian và âm thanh' }),
                  ],
                }),
                e.jsxs(g, {
                  className: 'space-y-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Thời gian chờ (giây)' }),
                        e.jsx(C, {
                          type: 'number',
                          min: '10',
                          max: '120',
                          value: s.customization.silenceTimeout || 30,
                          onChange: d =>
                            l('silenceTimeout', parseInt(d.target.value)),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Thời gian tối đa (giây)' }),
                        e.jsx(C, {
                          type: 'number',
                          min: '300',
                          max: '3600',
                          value: s.customization.maxDuration || 1800,
                          onChange: d =>
                            l('maxDuration', parseInt(d.target.value)),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(ra, { className: 'h-5 w-5' }),
                        'Âm thanh nền',
                      ],
                    }),
                    e.jsx(M, { children: 'Chọn âm thanh nền cho cuộc gọi' }),
                  ],
                }),
                e.jsx(g, {
                  children: e.jsxs(Q, {
                    value: s.customization.backgroundSound,
                    onValueChange: d => l('backgroundSound', d),
                    children: [
                      e.jsx(W, { children: e.jsx(X, {}) }),
                      e.jsx(Y, {
                        children: Mt.map(d =>
                          e.jsx(
                            N,
                            {
                              value: d.value,
                              children: e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium',
                                    children: d.label,
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-500',
                                    children: d.description,
                                  }),
                                ],
                              }),
                            },
                            d.value
                          )
                        ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
        s.error &&
          e.jsxs(na, {
            variant: 'destructive',
            children: [
              e.jsx(ae, { className: 'h-4 w-4' }),
              e.jsxs(la, {
                children: [
                  s.error.error,
                  s.error.upgradeRequired &&
                    e.jsx('div', {
                      className: 'mt-2',
                      children: e.jsx(p, {
                        variant: 'outline',
                        size: 'sm',
                        children: 'Nâng cấp gói dịch vụ',
                      }),
                    }),
                ],
              }),
            ],
          }),
        e.jsxs('div', {
          className: 'flex justify-between',
          children: [
            e.jsxs(p, {
              variant: 'outline',
              onClick: r,
              children: [e.jsx(Bs, { className: 'w-4 h-4 mr-2' }), 'Quay lại'],
            }),
            e.jsx(p, {
              onClick: u,
              disabled:
                s.customization.languages.length === 0 || s.isGenerating,
              size: 'lg',
              children: s.isGenerating
                ? e.jsxs(e.Fragment, {
                    children: [
                      e.jsx(Oe, { className: 'w-4 h-4 mr-2 animate-spin' }),
                      'Đang tạo Assistant...',
                    ],
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsx(fe, { className: 'w-4 h-4 mr-2' }),
                      'Tạo AI Assistant',
                    ],
                  }),
            }),
          ],
        }),
      ],
    });
  },
  _t = ({ state: s, onUpdateState: a }) => {
    const [, r] = $a(),
      t = () => {
        r('/dashboard');
      },
      n = () => {
        r('/dashboard/assistant');
      };
    return e.jsxs(j, {
      className: 'max-w-2xl mx-auto',
      children: [
        e.jsxs(y, {
          className: 'text-center',
          children: [
            e.jsx('div', {
              className: 'flex justify-center mb-4',
              children: e.jsx('div', {
                className:
                  'flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600',
                children: e.jsx(rs, { className: 'h-8 w-8' }),
              }),
            }),
            e.jsx(b, {
              className: 'text-2xl',
              children: 'AI Assistant đã sẵn sàng!',
            }),
            e.jsx(M, {
              className: 'text-base',
              children:
                'Khách sạn của bạn đã được thiết lập thành công. AI Assistant hiện có thể phục vụ khách hàng 24/7.',
            }),
          ],
        }),
        e.jsxs(g, {
          className: 'space-y-6',
          children: [
            e.jsxs('div', {
              className: 'bg-green-50 p-4 rounded-lg',
              children: [
                e.jsx('h4', {
                  className: 'font-medium text-green-900 mb-2',
                  children: 'Những gì đã được thiết lập:',
                }),
                e.jsxs('ul', {
                  className: 'text-sm text-green-800 space-y-1',
                  children: [
                    e.jsx('li', {
                      children: '✓ Thông tin khách sạn đã được lưu trữ',
                    }),
                    e.jsx('li', { children: '✓ Knowledge base đã được tạo' }),
                    e.jsx('li', {
                      children: '✓ AI Assistant đã được cấu hình',
                    }),
                    e.jsx('li', { children: '✓ Voice API đã được kích hoạt' }),
                    e.jsx('li', {
                      children: '✓ Dashboard đã sẵn sàng sử dụng',
                    }),
                  ],
                }),
              ],
            }),
            s.assistantId &&
              e.jsxs('div', {
                className: 'bg-blue-50 p-4 rounded-lg',
                children: [
                  e.jsx('h4', {
                    className: 'font-medium text-blue-900 mb-2',
                    children: 'Thông tin Assistant:',
                  }),
                  e.jsxs('div', {
                    className: 'text-sm text-blue-800 space-y-1',
                    children: [
                      e.jsxs('div', {
                        children: [
                          'ID: ',
                          e.jsx('code', {
                            className: 'bg-blue-100 px-1 rounded',
                            children: s.assistantId,
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          'Tính cách: ',
                          e.jsx('span', {
                            className: 'capitalize',
                            children: s.customization.personality,
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          'Ngôn ngữ: ',
                          s.customization.languages.join(', '),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            e.jsxs('div', {
              className: 'text-center space-y-4',
              children: [
                e.jsx('p', {
                  className: 'text-sm text-gray-600',
                  children:
                    'Bạn có thể bắt đầu sử dụng AI Assistant ngay bây giờ hoặc tùy chỉnh thêm trong cài đặt.',
                }),
                e.jsxs('div', {
                  className: 'flex gap-3',
                  children: [
                    e.jsxs(p, {
                      onClick: n,
                      variant: 'outline',
                      className: 'flex-1',
                      children: [
                        e.jsx(be, { className: 'w-4 h-4 mr-2' }),
                        'Kiểm tra Assistant',
                      ],
                    }),
                    e.jsx(p, {
                      onClick: t,
                      size: 'lg',
                      className: 'flex-1',
                      children: 'Đi tới Dashboard',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  Xn = () => {
    const [s, a] = o.useState({
        currentStep: 1,
        hotelData: null,
        customization: {
          personality: 'professional',
          tone: 'friendly',
          languages: ['vi'],
          backgroundSound: 'hotel-lobby',
        },
        isLoading: !1,
        error: null,
        isResearching: !1,
        isGenerating: !1,
        assistantId: null,
        retryCount: 0,
        formData: { hotelName: '', location: '', researchTier: 'basic' },
        validation: { hotelName: null, languages: null },
      }),
      r = 4,
      t = (s.currentStep / r) * 100,
      n = w => {
        a(m => ({ ...m, ...w }));
      },
      l = w => {
        s.currentStep === 1 && w
          ? n({ hotelData: w, currentStep: 2, error: null })
          : s.currentStep === 2
            ? n({ currentStep: 3, error: null })
            : s.currentStep === 3 &&
              w &&
              n({ assistantId: w, currentStep: 4, error: null });
      },
      i = () => {
        s.currentStep > 1 && n({ currentStep: s.currentStep - 1, error: null });
      },
      c = w => {
        n({ error: w });
      },
      u = () => {
        n({ error: null, retryCount: s.retryCount + 1 });
      },
      d = { state: s, onNext: l, onBack: i, onError: c, onUpdateState: n };
    return e.jsx('div', {
      className: 'min-h-screen bg-gray-50 py-8',
      children: e.jsxs('div', {
        className: 'container mx-auto px-4',
        children: [
          e.jsxs('div', {
            className: 'max-w-2xl mx-auto mb-8',
            children: [
              e.jsxs('div', {
                className: 'flex justify-between items-center mb-2',
                children: [
                  e.jsxs('span', {
                    className: 'text-sm text-gray-600',
                    children: ['Bước ', s.currentStep, ' / ', r],
                  }),
                  e.jsxs('span', {
                    className: 'text-sm text-gray-600',
                    children: [Math.round(t), '%'],
                  }),
                ],
              }),
              e.jsx(Pe, { value: t, className: 'h-2' }),
            ],
          }),
          s.error &&
            e.jsx('div', {
              className: 'max-w-2xl mx-auto mb-6',
              children: e.jsxs(na, {
                variant: 'destructive',
                children: [
                  e.jsx(ae, { className: 'h-4 w-4' }),
                  e.jsxs(la, {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsx('span', { children: s.error.error }),
                      e.jsxs(p, {
                        variant: 'outline',
                        size: 'sm',
                        onClick: u,
                        children: [
                          e.jsx(B, { className: 'w-4 h-4 mr-2' }),
                          'Thử lại',
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          s.currentStep === 1 && e.jsx(Vt, { ...d }),
          s.currentStep === 2 && e.jsx(Gt, { ...d }),
          s.currentStep === 3 && e.jsx(Zt, { ...d }),
          s.currentStep === 4 && e.jsx(_t, { ...d }),
        ],
      }),
    });
  },
  ks = {
    id: 'asst_abc123',
    name: 'Mi Nhon Hotel AI Concierge',
    personality: 'professional',
    tone: 'friendly',
    languages: ['vi', 'en', 'fr'],
    voiceId: 'jennifer',
    silenceTimeout: 30,
    maxDuration: 600,
    backgroundSound: 'hotel-lobby',
    systemPrompt: 'You are the AI concierge for Mi Nhon Hotel...',
    status: 'active',
    lastUpdated: '2024-01-15T10:30:00Z',
  },
  xs = {
    totalCalls: 1247,
    averageRating: 4.7,
    responseTime: 1.2,
    successRate: 96.5,
    topIntents: [
      { intent: 'Room Service', count: 342, percentage: 27.4 },
      { intent: 'Hotel Information', count: 298, percentage: 23.9 },
      { intent: 'Spa Booking', count: 187, percentage: 15 },
      { intent: 'Restaurant Reservation', count: 156, percentage: 12.5 },
    ],
  },
  Qt = () => {
    const [s, a] = o.useState(ks),
      [r, t] = o.useState(!1),
      n = async () => {
        t(!0);
        try {
          (await new Promise(l => setTimeout(l, 1e3)),
            console.log('Saving configuration:', s));
        } catch (l) {
          console.error('Failed to save configuration:', l);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(De, { className: 'h-5 w-5' }),
                    'Cấu hình cơ bản',
                  ],
                }),
                e.jsx(M, {
                  children: 'Thiết lập thông tin và hành vi của AI Assistant',
                }),
              ],
            }),
            e.jsxs(g, {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'assistant-name',
                          children: 'Tên Assistant',
                        }),
                        e.jsx(C, {
                          id: 'assistant-name',
                          value: s.name,
                          onChange: l =>
                            a(i => ({ ...i, name: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'voice-id',
                          children: 'Giọng nói',
                        }),
                        e.jsxs(Q, {
                          value: s.voiceId,
                          onValueChange: l => a(i => ({ ...i, voiceId: l })),
                          children: [
                            e.jsx(W, {
                              className: 'mt-1',
                              children: e.jsx(X, {}),
                            }),
                            e.jsxs(Y, {
                              children: [
                                e.jsx(N, {
                                  value: 'jennifer',
                                  children: 'Jennifer (Nữ, Tiếng Anh)',
                                }),
                                e.jsx(N, {
                                  value: 'david',
                                  children: 'David (Nam, Tiếng Anh)',
                                }),
                                e.jsx(N, {
                                  value: 'linh',
                                  children: 'Linh (Nữ, Tiếng Việt)',
                                }),
                                e.jsx(N, {
                                  value: 'duc',
                                  children: 'Đức (Nam, Tiếng Việt)',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'personality',
                          children: 'Tính cách',
                        }),
                        e.jsxs(Q, {
                          value: s.personality,
                          onValueChange: l =>
                            a(i => ({ ...i, personality: l })),
                          children: [
                            e.jsx(W, {
                              className: 'mt-1',
                              children: e.jsx(X, {}),
                            }),
                            e.jsxs(Y, {
                              children: [
                                e.jsx(N, {
                                  value: 'professional',
                                  children: 'Chuyên nghiệp',
                                }),
                                e.jsx(N, {
                                  value: 'friendly',
                                  children: 'Thân thiện',
                                }),
                                e.jsx(N, {
                                  value: 'luxurious',
                                  children: 'Sang trọng',
                                }),
                                e.jsx(N, {
                                  value: 'casual',
                                  children: 'Thoải mái',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { htmlFor: 'tone', children: 'Giọng điệu' }),
                        e.jsxs(Q, {
                          value: s.tone,
                          onValueChange: l => a(i => ({ ...i, tone: l })),
                          children: [
                            e.jsx(W, {
                              className: 'mt-1',
                              children: e.jsx(X, {}),
                            }),
                            e.jsxs(Y, {
                              children: [
                                e.jsx(N, {
                                  value: 'formal',
                                  children: 'Lịch sự',
                                }),
                                e.jsx(N, {
                                  value: 'friendly',
                                  children: 'Thân thiện',
                                }),
                                e.jsx(N, { value: 'warm', children: 'Ấm áp' }),
                                e.jsx(N, {
                                  value: 'energetic',
                                  children: 'Năng động',
                                }),
                                e.jsx(N, {
                                  value: 'calm',
                                  children: 'Bình tĩnh',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'silence-timeout',
                          children: 'Thời gian chờ (giây)',
                        }),
                        e.jsx(C, {
                          id: 'silence-timeout',
                          type: 'number',
                          value: s.silenceTimeout,
                          onChange: l =>
                            a(i => ({
                              ...i,
                              silenceTimeout: parseInt(l.target.value),
                            })),
                          className: 'mt-1',
                          min: '10',
                          max: '120',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'max-duration',
                          children: 'Thời lượng tối đa (giây)',
                        }),
                        e.jsx(C, {
                          id: 'max-duration',
                          type: 'number',
                          value: s.maxDuration,
                          onChange: l =>
                            a(i => ({
                              ...i,
                              maxDuration: parseInt(l.target.value),
                            })),
                          className: 'mt-1',
                          min: '300',
                          max: '3600',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx(h, {
                      htmlFor: 'background-sound',
                      children: 'Âm thanh nền',
                    }),
                    e.jsxs(Q, {
                      value: s.backgroundSound,
                      onValueChange: l =>
                        a(i => ({ ...i, backgroundSound: l })),
                      children: [
                        e.jsx(W, { className: 'mt-1', children: e.jsx(X, {}) }),
                        e.jsxs(Y, {
                          children: [
                            e.jsx(N, {
                              value: 'hotel-lobby',
                              children: 'Sảnh khách sạn',
                            }),
                            e.jsx(N, {
                              value: 'office',
                              children: 'Văn phòng',
                            }),
                            e.jsx(N, {
                              value: 'off',
                              children: 'Tắt âm thanh nền',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(cs, { className: 'h-5 w-5' }),
                    'System Prompt',
                  ],
                }),
                e.jsx(M, {
                  children:
                    'Hướng dẫn chi tiết cho AI Assistant về cách hành xử và trả lời',
                }),
              ],
            }),
            e.jsx(g, {
              children: e.jsx(me, {
                value: s.systemPrompt,
                onChange: l => a(i => ({ ...i, systemPrompt: l.target.value })),
                rows: 8,
                className: 'font-mono text-sm',
                placeholder: 'Nhập system prompt cho AI Assistant...',
              }),
            }),
          ],
        }),
        e.jsx('div', {
          className: 'flex justify-end',
          children: e.jsx(p, {
            onClick: n,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(Oe, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(je, { className: 'w-4 h-4 mr-2' }),
                    'Lưu cấu hình',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  Wt = () => {
    const [s, a] = o.useState(!1),
      [r, t] = o.useState(''),
      [n, l] = o.useState(''),
      [i, c] = o.useState(!1),
      u = async () => {
        if (r.trim()) {
          c(!0);
          try {
            (await new Promise(d => setTimeout(d, 2e3)),
              l(
                `Xin chào! Tôi là AI Assistant của Mi Nhon Hotel. Tôi có thể giúp bạn về ${r}. Bạn có cần tôi hỗ trợ gì thêm không?`
              ));
          } catch {
            l('Đã xảy ra lỗi khi kiểm tra. Vui lòng thử lại.');
          } finally {
            c(!1);
          }
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(ca, { className: 'h-5 w-5' }),
                    'Test AI Assistant',
                  ],
                }),
                e.jsx(M, {
                  children:
                    'Kiểm tra phản hồi của AI Assistant với các câu hỏi mẫu',
                }),
              ],
            }),
            e.jsxs(g, {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center space-x-2',
                  children: [
                    e.jsx(z, {
                      id: 'test-mode',
                      checked: s,
                      onCheckedChange: a,
                    }),
                    e.jsx(h, {
                      htmlFor: 'test-mode',
                      children: 'Chế độ kiểm tra',
                    }),
                  ],
                }),
                s &&
                  e.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            htmlFor: 'test-phrase',
                            children: 'Câu hỏi thử nghiệm',
                          }),
                          e.jsxs('div', {
                            className: 'flex gap-2 mt-1',
                            children: [
                              e.jsx(C, {
                                id: 'test-phrase',
                                value: r,
                                onChange: d => t(d.target.value),
                                placeholder: 'Ví dụ: Tôi muốn đặt phòng',
                                className: 'flex-1',
                              }),
                              e.jsx(p, {
                                onClick: u,
                                disabled: !r.trim() || i,
                                children: i
                                  ? e.jsx(Oe, {
                                      className: 'w-4 h-4 animate-spin',
                                    })
                                  : e.jsx(ca, { className: 'w-4 h-4' }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      n &&
                        e.jsxs('div', {
                          className: 'p-4 bg-gray-50 rounded-lg',
                          children: [
                            e.jsx(h, {
                              className: 'text-sm font-medium',
                              children: 'Phản hồi của AI:',
                            }),
                            e.jsx('p', {
                              className: 'text-sm text-gray-700 mt-1',
                              children: n,
                            }),
                          ],
                        }),
                    ],
                  }),
              ],
            }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsx(b, { children: 'Mẫu câu hỏi thường gặp' }),
                e.jsx(M, { children: 'Các câu hỏi mà khách hàng thường hỏi' }),
              ],
            }),
            e.jsx(g, {
              children: e.jsx('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-2',
                children: [
                  'Tôi muốn đặt phòng',
                  'Giờ check-in là mấy giờ?',
                  'Khách sạn có dịch vụ spa không?',
                  'Tôi muốn đặt bàn ăn tối',
                  'Làm sao để đi sân bay?',
                  'Có wifi miễn phí không?',
                  'Tôi muốn gọi room service',
                  'Khách sạn có hồ bơi không?',
                ].map((d, w) =>
                  e.jsxs(
                    p,
                    {
                      variant: 'outline',
                      size: 'sm',
                      className: 'justify-start text-left h-auto p-2',
                      onClick: () => t(d),
                      children: [
                        e.jsx(cs, { className: 'w-3 h-3 mr-2 shrink-0' }),
                        e.jsx('span', { className: 'text-xs', children: d }),
                      ],
                    },
                    w
                  )
                ),
              }),
            }),
          ],
        }),
      ],
    });
  },
  Xt = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          children: [
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  className:
                    'flex flex-row items-center justify-between space-y-0 pb-2',
                  children: [
                    e.jsx(b, {
                      className: 'text-sm font-medium',
                      children: 'Tổng cuộc gọi',
                    }),
                    e.jsx(be, { className: 'h-4 w-4 text-muted-foreground' }),
                  ],
                }),
                e.jsxs(g, {
                  children: [
                    e.jsx('div', {
                      className: 'text-2xl font-bold',
                      children: xs.totalCalls.toLocaleString(),
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-muted-foreground',
                      children: 'Tháng này',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  className:
                    'flex flex-row items-center justify-between space-y-0 pb-2',
                  children: [
                    e.jsx(b, {
                      className: 'text-sm font-medium',
                      children: 'Đánh giá trung bình',
                    }),
                    e.jsx(Le, { className: 'h-4 w-4 text-muted-foreground' }),
                  ],
                }),
                e.jsxs(g, {
                  children: [
                    e.jsxs('div', {
                      className: 'text-2xl font-bold',
                      children: [xs.averageRating, '/5'],
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-muted-foreground',
                      children: 'Điểm hài lòng',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  className:
                    'flex flex-row items-center justify-between space-y-0 pb-2',
                  children: [
                    e.jsx(b, {
                      className: 'text-sm font-medium',
                      children: 'Thời gian phản hồi',
                    }),
                    e.jsx(ye, { className: 'h-4 w-4 text-muted-foreground' }),
                  ],
                }),
                e.jsxs(g, {
                  children: [
                    e.jsxs('div', {
                      className: 'text-2xl font-bold',
                      children: [xs.responseTime, 's'],
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-muted-foreground',
                      children: 'Trung bình',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  className:
                    'flex flex-row items-center justify-between space-y-0 pb-2',
                  children: [
                    e.jsx(b, {
                      className: 'text-sm font-medium',
                      children: 'Tỷ lệ thành công',
                    }),
                    e.jsx(rs, { className: 'h-4 w-4 text-muted-foreground' }),
                  ],
                }),
                e.jsxs(g, {
                  children: [
                    e.jsxs('div', {
                      className: 'text-2xl font-bold',
                      children: [xs.successRate, '%'],
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-muted-foreground',
                      children: 'Cuộc gọi thành công',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsx(b, { children: 'Ý định phổ biến' }),
                e.jsx(M, {
                  children: 'Các yêu cầu mà khách hàng thường hỏi nhất',
                }),
              ],
            }),
            e.jsx(g, {
              children: e.jsx('div', {
                className: 'space-y-4',
                children: xs.topIntents.map((s, a) =>
                  e.jsxs(
                    'div',
                    {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center gap-3',
                          children: [
                            e.jsx('div', {
                              className: 'w-2 h-2 bg-primary rounded-full',
                            }),
                            e.jsx('span', {
                              className: 'font-medium',
                              children: s.intent,
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className:
                            'flex items-center gap-2 text-sm text-muted-foreground',
                          children: [
                            e.jsx('span', { children: s.count }),
                            e.jsxs(R, {
                              variant: 'outline',
                              children: [s.percentage, '%'],
                            }),
                          ],
                        }),
                      ],
                    },
                    a
                  )
                ),
              }),
            }),
          ],
        }),
      ],
    }),
  Yn = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('h1', {
                  className: 'text-3xl font-bold text-gray-900 dark:text-white',
                  children: 'AI Assistant',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 dark:text-gray-400 mt-2',
                  children: 'Quản lý và tùy chỉnh AI Assistant cho khách sạn',
                }),
              ],
            }),
            e.jsx('div', {
              className: 'flex items-center gap-2',
              children: e.jsxs(R, {
                variant: 'outline',
                className: 'text-green-600',
                children: [
                  e.jsx(rs, { className: 'w-3 h-3 mr-1' }),
                  'Hoạt động',
                ],
              }),
            }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsx(y, {
              children: e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(fe, { className: 'h-5 w-5' }),
                  'Trạng thái Assistant',
                ],
              }),
            }),
            e.jsx(g, {
              children: e.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-3 gap-4',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        className: 'text-sm font-medium',
                        children: 'Tên Assistant',
                      }),
                      e.jsx('p', {
                        className: 'text-sm text-gray-600',
                        children: ks.name,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        className: 'text-sm font-medium',
                        children: 'ID Assistant',
                      }),
                      e.jsx('p', {
                        className: 'text-sm text-gray-600 font-mono',
                        children: ks.id,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        className: 'text-sm font-medium',
                        children: 'Cập nhật lần cuối',
                      }),
                      e.jsx('p', {
                        className: 'text-sm text-gray-600',
                        children: new Date(ks.lastUpdated).toLocaleString(
                          'vi-VN'
                        ),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
        e.jsxs(we, {
          defaultValue: 'config',
          className: 'space-y-4',
          children: [
            e.jsxs(Ce, {
              className: 'grid w-full grid-cols-3',
              children: [
                e.jsx(O, { value: 'config', children: 'Cấu hình' }),
                e.jsx(O, { value: 'test', children: 'Kiểm tra' }),
                e.jsx(O, { value: 'performance', children: 'Hiệu suất' }),
              ],
            }),
            e.jsx(H, {
              value: 'config',
              className: 'space-y-4',
              children: e.jsx(Qt, {}),
            }),
            e.jsx(H, {
              value: 'test',
              className: 'space-y-4',
              children: e.jsx(Wt, {}),
            }),
            e.jsx(H, {
              value: 'performance',
              className: 'space-y-4',
              children: e.jsx(Xt, {}),
            }),
          ],
        }),
      ],
    }),
  xe = {
    overview: {
      totalCalls: 1247,
      totalCallsGrowth: 12.5,
      averageCallDuration: 245,
      callDurationGrowth: -5.2,
      uniqueUsers: 89,
      uniqueUsersGrowth: 8.3,
      satisfactionScore: 4.7,
      satisfactionGrowth: 2.1,
    },
    callsByHour: [
      { hour: '00', calls: 12 },
      { hour: '01', calls: 8 },
      { hour: '02', calls: 5 },
      { hour: '03', calls: 3 },
      { hour: '04', calls: 2 },
      { hour: '05', calls: 4 },
      { hour: '06', calls: 15 },
      { hour: '07', calls: 28 },
      { hour: '08', calls: 45 },
      { hour: '09', calls: 67 },
      { hour: '10', calls: 89 },
      { hour: '11', calls: 78 },
      { hour: '12', calls: 95 },
      { hour: '13', calls: 87 },
      { hour: '14', calls: 92 },
      { hour: '15', calls: 85 },
      { hour: '16', calls: 78 },
      { hour: '17', calls: 65 },
      { hour: '18', calls: 82 },
      { hour: '19', calls: 75 },
      { hour: '20', calls: 58 },
      { hour: '21', calls: 45 },
      { hour: '22', calls: 32 },
      { hour: '23', calls: 22 },
    ],
    languageDistribution: [
      { language: 'Tiếng Việt', calls: 687, percentage: 55.1 },
      { language: 'English', calls: 423, percentage: 33.9 },
      { language: 'Français', calls: 137, percentage: 11 },
    ],
    intentDistribution: [
      { intent: 'Room Service', calls: 342, percentage: 27.4 },
      { intent: 'Hotel Information', calls: 298, percentage: 23.9 },
      { intent: 'Spa Booking', calls: 187, percentage: 15 },
      { intent: 'Restaurant Reservation', calls: 156, percentage: 12.5 },
      { intent: 'Housekeeping', calls: 98, percentage: 7.9 },
      { intent: 'Concierge', calls: 87, percentage: 7 },
      { intent: 'Complaints', calls: 45, percentage: 3.6 },
      { intent: 'Other', calls: 34, percentage: 2.7 },
    ],
    callsByDay: [
      { day: 'Thứ 2', calls: 145 },
      { day: 'Thứ 3', calls: 178 },
      { day: 'Thứ 4', calls: 189 },
      { day: 'Thứ 5', calls: 234 },
      { day: 'Thứ 6', calls: 267 },
      { day: 'Thứ 7', calls: 156 },
      { day: 'Chủ nhật', calls: 78 },
    ],
    satisfactionByIntent: [
      { intent: 'Room Service', rating: 4.8 },
      { intent: 'Hotel Information', rating: 4.9 },
      { intent: 'Spa Booking', rating: 4.6 },
      { intent: 'Restaurant Reservation', rating: 4.7 },
      { intent: 'Housekeeping', rating: 4.5 },
      { intent: 'Concierge', rating: 4.8 },
      { intent: 'Complaints', rating: 3.2 },
    ],
  },
  Cs = ({
    title: s,
    value: a,
    change: r,
    icon: t,
    description: n,
    suffix: l = '',
  }) =>
    e.jsxs(j, {
      children: [
        e.jsxs(y, {
          className:
            'flex flex-row items-center justify-between space-y-0 pb-2',
          children: [
            e.jsx(b, { className: 'text-sm font-medium', children: s }),
            e.jsx(t, { className: 'h-4 w-4 text-muted-foreground' }),
          ],
        }),
        e.jsxs(g, {
          children: [
            e.jsxs('div', {
              className: 'text-2xl font-bold',
              children: [a, l],
            }),
            e.jsxs('div', {
              className: 'flex items-center pt-1',
              children: [
                e.jsx('div', {
                  className: 'text-xs text-muted-foreground',
                  children: n,
                }),
                r !== void 0 &&
                  e.jsxs('div', {
                    className: `ml-auto flex items-center text-xs ${r > 0 ? 'text-green-600' : 'text-red-600'}`,
                    children: [
                      e.jsx(he, {
                        className: `h-3 w-3 mr-1 ${r < 0 ? 'rotate-180' : ''}`,
                      }),
                      Math.abs(r),
                      '%',
                    ],
                  }),
              ],
            }),
          ],
        }),
      ],
    }),
  Yt = ({ data: s, dataKey: a, nameKey: r, title: t }) => {
    const n = Math.max(...s.map(l => l[a]));
    return e.jsxs(j, {
      children: [
        e.jsx(y, {
          children: e.jsx(b, { className: 'text-base', children: t }),
        }),
        e.jsx(g, {
          children: e.jsx('div', {
            className: 'space-y-2',
            children: s.map((l, i) =>
              e.jsxs(
                'div',
                {
                  className: 'flex items-center gap-3',
                  children: [
                    e.jsx('div', {
                      className: 'w-20 text-sm text-gray-600 text-right',
                      children: l[r],
                    }),
                    e.jsx('div', {
                      className: 'flex-1 bg-gray-200 rounded-full h-2',
                      children: e.jsx('div', {
                        className: 'bg-primary h-2 rounded-full',
                        style: { width: `${(l[a] / n) * 100}%` },
                      }),
                    }),
                    e.jsx('div', {
                      className: 'w-16 text-sm font-medium text-right',
                      children: l[a],
                    }),
                  ],
                },
                i
              )
            ),
          }),
        }),
      ],
    });
  },
  Jt = () => {
    const [s, a] = o.useState('30d'),
      [r, t] = o.useState('all');
    return e.jsxs(j, {
      children: [
        e.jsx(y, {
          children: e.jsxs(b, {
            className: 'flex items-center gap-2',
            children: [e.jsx(Js, { className: 'h-5 w-5' }), 'Bộ lọc'],
          }),
        }),
        e.jsx(g, {
          children: e.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-3 gap-4',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className: 'text-sm font-medium',
                    children: 'Khoảng thời gian',
                  }),
                  e.jsxs(Q, {
                    value: s,
                    onValueChange: a,
                    children: [
                      e.jsx(W, { className: 'mt-1', children: e.jsx(X, {}) }),
                      e.jsxs(Y, {
                        children: [
                          e.jsx(N, { value: '7d', children: '7 ngày qua' }),
                          e.jsx(N, { value: '30d', children: '30 ngày qua' }),
                          e.jsx(N, { value: '90d', children: '90 ngày qua' }),
                          e.jsx(N, { value: '1y', children: '1 năm qua' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className: 'text-sm font-medium',
                    children: 'Ngôn ngữ',
                  }),
                  e.jsxs(Q, {
                    value: r,
                    onValueChange: t,
                    children: [
                      e.jsx(W, { className: 'mt-1', children: e.jsx(X, {}) }),
                      e.jsxs(Y, {
                        children: [
                          e.jsx(N, { value: 'all', children: 'Tất cả' }),
                          e.jsx(N, { value: 'vi', children: 'Tiếng Việt' }),
                          e.jsx(N, { value: 'en', children: 'English' }),
                          e.jsx(N, { value: 'fr', children: 'Français' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex items-end gap-2',
                children: [
                  e.jsxs(p, {
                    variant: 'outline',
                    size: 'sm',
                    children: [
                      e.jsx(B, { className: 'h-4 w-4 mr-2' }),
                      'Làm mới',
                    ],
                  }),
                  e.jsxs(p, {
                    variant: 'outline',
                    size: 'sm',
                    children: [
                      e.jsx(Qe, { className: 'h-4 w-4 mr-2' }),
                      'Xuất Excel',
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  },
  en = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          children: [
            e.jsx(Cs, {
              title: 'Tổng cuộc gọi',
              value: xe.overview.totalCalls.toLocaleString(),
              change: xe.overview.totalCallsGrowth,
              icon: be,
              description: 'Tháng này',
            }),
            e.jsx(Cs, {
              title: 'Thời gian trung bình',
              value: Math.floor(xe.overview.averageCallDuration / 60),
              change: xe.overview.callDurationGrowth,
              icon: ye,
              description: 'Phút/cuộc gọi',
              suffix: 'm',
            }),
            e.jsx(Cs, {
              title: 'Người dùng duy nhất',
              value: xe.overview.uniqueUsers,
              change: xe.overview.uniqueUsersGrowth,
              icon: ge,
              description: 'Tháng này',
            }),
            e.jsx(Cs, {
              title: 'Điểm hài lòng',
              value: xe.overview.satisfactionScore,
              change: xe.overview.satisfactionGrowth,
              icon: he,
              description: 'Trên 5 điểm',
              suffix: '/5',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsx(Yt, {
              data: xe.callsByDay,
              dataKey: 'calls',
              nameKey: 'day',
              title: 'Cuộc gọi theo ngày trong tuần',
            }),
            e.jsxs(j, {
              children: [
                e.jsx(y, {
                  children: e.jsxs(b, {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(is, { className: 'h-5 w-5' }),
                      'Phân bố ngôn ngữ',
                    ],
                  }),
                }),
                e.jsx(g, {
                  children: e.jsx('div', {
                    className: 'space-y-3',
                    children: xe.languageDistribution.map((s, a) =>
                      e.jsxs(
                        'div',
                        {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsx('div', {
                                  className: 'w-3 h-3 bg-primary rounded-full',
                                }),
                                e.jsx('span', {
                                  className: 'font-medium',
                                  children: s.language,
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                e.jsx('span', {
                                  className: 'text-sm text-gray-600',
                                  children: s.calls,
                                }),
                                e.jsxs(R, {
                                  variant: 'outline',
                                  children: [s.percentage, '%'],
                                }),
                              ],
                            }),
                          ],
                        },
                        a
                      )
                    ),
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  sn = () =>
    e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs('div', {
        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
        children: [
          e.jsxs(j, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Cuộc gọi theo giờ' }),
                  e.jsx(M, { children: 'Phân bố cuộc gọi trong 24 giờ' }),
                ],
              }),
              e.jsx(g, {
                children: e.jsx('div', {
                  className: 'space-y-2',
                  children: xe.callsByHour.map((s, a) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsxs('div', {
                            className: 'w-8 text-xs text-gray-600',
                            children: [s.hour, 'h'],
                          }),
                          e.jsx('div', {
                            className: 'flex-1 bg-gray-200 rounded-full h-2',
                            children: e.jsx('div', {
                              className: 'bg-blue-500 h-2 rounded-full',
                              style: { width: `${(s.calls / 95) * 100}%` },
                            }),
                          }),
                          e.jsx('div', {
                            className: 'w-8 text-xs font-medium text-right',
                            children: s.calls,
                          }),
                        ],
                      },
                      a
                    )
                  ),
                }),
              }),
            ],
          }),
          e.jsxs(j, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Ý định cuộc gọi' }),
                  e.jsx(M, { children: 'Phân loại theo mục đích' }),
                ],
              }),
              e.jsx(g, {
                children: e.jsx('div', {
                  className: 'space-y-3',
                  children: xe.intentDistribution.map((s, a) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsx('span', {
                            className: 'text-sm font-medium',
                            children: s.intent,
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx('span', {
                                className: 'text-sm text-gray-600',
                                children: s.calls,
                              }),
                              e.jsxs(R, {
                                variant: 'outline',
                                children: [s.percentage, '%'],
                              }),
                            ],
                          }),
                        ],
                      },
                      a
                    )
                  ),
                }),
              }),
            ],
          }),
        ],
      }),
    }),
  an = () =>
    e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs('div', {
        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
        children: [
          e.jsxs(j, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Điểm hài lòng theo ý định' }),
                  e.jsx(M, {
                    children: 'Đánh giá khách hàng cho từng loại dịch vụ',
                  }),
                ],
              }),
              e.jsx(g, {
                children: e.jsx('div', {
                  className: 'space-y-4',
                  children: xe.satisfactionByIntent.map((s, a) =>
                    e.jsxs(
                      'div',
                      {
                        className: 'space-y-2',
                        children: [
                          e.jsxs('div', {
                            className: 'flex justify-between items-center',
                            children: [
                              e.jsx('span', {
                                className: 'text-sm font-medium',
                                children: s.intent,
                              }),
                              e.jsxs(R, {
                                variant:
                                  s.rating >= 4.5
                                    ? 'default'
                                    : s.rating >= 4
                                      ? 'secondary'
                                      : 'destructive',
                                children: [s.rating, '/5'],
                              }),
                            ],
                          }),
                          e.jsx('div', {
                            className: 'w-full bg-gray-200 rounded-full h-2',
                            children: e.jsx('div', {
                              className: `h-2 rounded-full ${s.rating >= 4.5 ? 'bg-green-500' : s.rating >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`,
                              style: { width: `${(s.rating / 5) * 100}%` },
                            }),
                          }),
                        ],
                      },
                      a
                    )
                  ),
                }),
              }),
            ],
          }),
          e.jsxs(j, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Xu hướng điểm hài lòng' }),
                  e.jsx(M, { children: 'Thay đổi theo thời gian' }),
                ],
              }),
              e.jsx(g, {
                children: e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsxs('div', {
                      className: 'text-center',
                      children: [
                        e.jsx('div', {
                          className: 'text-3xl font-bold text-green-600',
                          children: '4.7/5',
                        }),
                        e.jsx('div', {
                          className: 'text-sm text-gray-600',
                          children: 'Điểm trung bình tháng này',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'space-y-2',
                      children: [
                        e.jsxs('div', {
                          className: 'flex justify-between text-sm',
                          children: [
                            e.jsx('span', { children: '5 sao' }),
                            e.jsx('span', { children: '68%' }),
                          ],
                        }),
                        e.jsx('div', {
                          className: 'w-full bg-gray-200 rounded-full h-2',
                          children: e.jsx('div', {
                            className: 'bg-green-500 h-2 rounded-full',
                            style: { width: '68%' },
                          }),
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between text-sm',
                          children: [
                            e.jsx('span', { children: '4 sao' }),
                            e.jsx('span', { children: '22%' }),
                          ],
                        }),
                        e.jsx('div', {
                          className: 'w-full bg-gray-200 rounded-full h-2',
                          children: e.jsx('div', {
                            className: 'bg-blue-500 h-2 rounded-full',
                            style: { width: '22%' },
                          }),
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between text-sm',
                          children: [
                            e.jsx('span', { children: '3 sao' }),
                            e.jsx('span', { children: '7%' }),
                          ],
                        }),
                        e.jsx('div', {
                          className: 'w-full bg-gray-200 rounded-full h-2',
                          children: e.jsx('div', {
                            className: 'bg-yellow-500 h-2 rounded-full',
                            style: { width: '7%' },
                          }),
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between text-sm',
                          children: [
                            e.jsx('span', { children: '2 sao' }),
                            e.jsx('span', { children: '2%' }),
                          ],
                        }),
                        e.jsx('div', {
                          className: 'w-full bg-gray-200 rounded-full h-2',
                          children: e.jsx('div', {
                            className: 'bg-orange-500 h-2 rounded-full',
                            style: { width: '2%' },
                          }),
                        }),
                        e.jsxs('div', {
                          className: 'flex justify-between text-sm',
                          children: [
                            e.jsx('span', { children: '1 sao' }),
                            e.jsx('span', { children: '1%' }),
                          ],
                        }),
                        e.jsx('div', {
                          className: 'w-full bg-gray-200 rounded-full h-2',
                          children: e.jsx('div', {
                            className: 'bg-red-500 h-2 rounded-full',
                            style: { width: '1%' },
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    }),
  Jn = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('h1', {
                  className: 'text-3xl font-bold text-gray-900 dark:text-white',
                  children: 'Phân tích & Báo cáo',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 dark:text-gray-400 mt-2',
                  children: 'Thống kê chi tiết về hiệu suất AI Assistant',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                e.jsxs(p, {
                  variant: 'outline',
                  size: 'sm',
                  children: [
                    e.jsx(Ys, { className: 'h-4 w-4 mr-2' }),
                    'Tùy chỉnh khoảng thời gian',
                  ],
                }),
                e.jsxs(p, {
                  variant: 'outline',
                  size: 'sm',
                  children: [
                    e.jsx(Qe, { className: 'h-4 w-4 mr-2' }),
                    'Xuất báo cáo',
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsx(Jt, {}),
        e.jsxs(we, {
          defaultValue: 'overview',
          className: 'space-y-4',
          children: [
            e.jsxs(Ce, {
              className: 'grid w-full grid-cols-3',
              children: [
                e.jsx(O, { value: 'overview', children: 'Tổng quan' }),
                e.jsx(O, { value: 'patterns', children: 'Mẫu cuộc gọi' }),
                e.jsx(O, { value: 'satisfaction', children: 'Hài lòng' }),
              ],
            }),
            e.jsx(H, {
              value: 'overview',
              className: 'space-y-4',
              children: e.jsx(en, {}),
            }),
            e.jsx(H, {
              value: 'patterns',
              className: 'space-y-4',
              children: e.jsx(sn, {}),
            }),
            e.jsx(H, {
              value: 'satisfaction',
              className: 'space-y-4',
              children: e.jsx(an, {}),
            }),
          ],
        }),
      ],
    }),
  Fs = {
    basicInfo: {
      name: 'Mi Nhon Hotel',
      address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
      phone: '+84 28 3829 2999',
      email: 'info@minhonhotel.com',
      website: 'https://minhonhotel.com',
      description:
        'Khách sạn 4 sao sang trọng tại trung tâm thành phố với view biển tuyệt đẹp và dịch vụ chuyên nghiệp.',
      checkInTime: '14:00',
      checkOutTime: '12:00',
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    notifications: {
      emailNotifications: !0,
      smsNotifications: !1,
      pushNotifications: !0,
      dailyReports: !0,
      weeklyReports: !0,
      monthlyReports: !0,
      alertOnErrors: !0,
      alertOnLowRating: !0,
    },
    privacy: {
      recordCalls: !0,
      dataRetentionDays: 90,
      shareAnalytics: !1,
      allowDataExport: !0,
      gdprCompliance: !0,
    },
    api: {
      webhookUrl: 'https://minhonhotel.com/webhook',
      apiKeys: { vapi: 'vapi_***************', openai: 'sk-***************' },
    },
  },
  tn = () => {
    const [s, a] = o.useState(Fs.basicInfo),
      [r, t] = o.useState(!1),
      n = async () => {
        t(!0);
        try {
          (await new Promise(l => setTimeout(l, 1e3)),
            console.log('Saving hotel settings:', s));
        } catch (l) {
          console.error('Failed to save settings:', l);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(As, { className: 'h-5 w-5' }),
                    'Thông tin cơ bản',
                  ],
                }),
                e.jsx(M, {
                  children: 'Cập nhật thông tin chi tiết về khách sạn',
                }),
              ],
            }),
            e.jsxs(g, {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'hotel-name',
                          children: 'Tên khách sạn',
                        }),
                        e.jsx(C, {
                          id: 'hotel-name',
                          value: s.name,
                          onChange: l =>
                            a(i => ({ ...i, name: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'phone',
                          children: 'Số điện thoại',
                        }),
                        e.jsx(C, {
                          id: 'phone',
                          value: s.phone,
                          onChange: l =>
                            a(i => ({ ...i, phone: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx(h, { htmlFor: 'address', children: 'Địa chỉ' }),
                    e.jsx(C, {
                      id: 'address',
                      value: s.address,
                      onChange: l =>
                        a(i => ({ ...i, address: l.target.value })),
                      className: 'mt-1',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { htmlFor: 'email', children: 'Email' }),
                        e.jsx(C, {
                          id: 'email',
                          type: 'email',
                          value: s.email,
                          onChange: l =>
                            a(i => ({ ...i, email: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { htmlFor: 'website', children: 'Website' }),
                        e.jsx(C, {
                          id: 'website',
                          value: s.website,
                          onChange: l =>
                            a(i => ({ ...i, website: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx(h, {
                      htmlFor: 'description',
                      children: 'Mô tả khách sạn',
                    }),
                    e.jsx(me, {
                      id: 'description',
                      value: s.description,
                      onChange: l =>
                        a(i => ({ ...i, description: l.target.value })),
                      className: 'mt-1',
                      rows: 3,
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'check-in',
                          children: 'Giờ check-in',
                        }),
                        e.jsx(C, {
                          id: 'check-in',
                          type: 'time',
                          value: s.checkInTime,
                          onChange: l =>
                            a(i => ({ ...i, checkInTime: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'check-out',
                          children: 'Giờ check-out',
                        }),
                        e.jsx(C, {
                          id: 'check-out',
                          type: 'time',
                          value: s.checkOutTime,
                          onChange: l =>
                            a(i => ({ ...i, checkOutTime: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'currency',
                          children: 'Đơn vị tiền tệ',
                        }),
                        e.jsx(C, {
                          id: 'currency',
                          value: s.currency,
                          onChange: l =>
                            a(i => ({ ...i, currency: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { htmlFor: 'timezone', children: 'Múi giờ' }),
                        e.jsx(C, {
                          id: 'timezone',
                          value: s.timezone,
                          onChange: l =>
                            a(i => ({ ...i, timezone: l.target.value })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsx('div', {
          className: 'flex justify-end',
          children: e.jsx(p, {
            onClick: n,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(Oe, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(je, { className: 'w-4 h-4 mr-2' }),
                    'Lưu thay đổi',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  nn = () => {
    const [s, a] = o.useState(Fs.notifications),
      [r, t] = o.useState(!1),
      n = i => {
        a(c => ({ ...c, [i]: !c[i] }));
      },
      l = async () => {
        t(!0);
        try {
          (await new Promise(i => setTimeout(i, 1e3)),
            console.log('Saving notification settings:', s));
        } catch (i) {
          console.error('Failed to save settings:', i);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(us, { className: 'h-5 w-5' }),
                    'Cài đặt thông báo',
                  ],
                }),
                e.jsx(M, { children: 'Tùy chọn thông báo và báo cáo' }),
              ],
            }),
            e.jsxs(g, {
              className: 'space-y-6',
              children: [
                e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsx('h4', {
                      className: 'font-medium',
                      children: 'Phương thức thông báo',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-3',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className: 'font-medium',
                                  children: 'Email notifications',
                                }),
                                e.jsx('div', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Nhận thông báo qua email',
                                }),
                              ],
                            }),
                            e.jsx(z, {
                              checked: s.emailNotifications,
                              onCheckedChange: () => n('emailNotifications'),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className: 'font-medium',
                                  children: 'SMS notifications',
                                }),
                                e.jsx('div', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Nhận thông báo qua SMS',
                                }),
                              ],
                            }),
                            e.jsx(z, {
                              checked: s.smsNotifications,
                              onCheckedChange: () => n('smsNotifications'),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className: 'font-medium',
                                  children: 'Push notifications',
                                }),
                                e.jsx('div', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Thông báo đẩy trên trình duyệt',
                                }),
                              ],
                            }),
                            e.jsx(z, {
                              checked: s.pushNotifications,
                              onCheckedChange: () => n('pushNotifications'),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsx('h4', {
                      className: 'font-medium',
                      children: 'Báo cáo định kỳ',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-3',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className: 'font-medium',
                                  children: 'Báo cáo hàng ngày',
                                }),
                                e.jsx('div', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Tóm tắt hoạt động hàng ngày',
                                }),
                              ],
                            }),
                            e.jsx(z, {
                              checked: s.dailyReports,
                              onCheckedChange: () => n('dailyReports'),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className: 'font-medium',
                                  children: 'Báo cáo hàng tuần',
                                }),
                                e.jsx('div', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Thống kê tuần',
                                }),
                              ],
                            }),
                            e.jsx(z, {
                              checked: s.weeklyReports,
                              onCheckedChange: () => n('weeklyReports'),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className: 'font-medium',
                                  children: 'Báo cáo hàng tháng',
                                }),
                                e.jsx('div', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Tổng quan tháng',
                                }),
                              ],
                            }),
                            e.jsx(z, {
                              checked: s.monthlyReports,
                              onCheckedChange: () => n('monthlyReports'),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsx('h4', {
                      className: 'font-medium',
                      children: 'Cảnh báo',
                    }),
                    e.jsxs('div', {
                      className: 'space-y-3',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className: 'font-medium',
                                  children: 'Cảnh báo lỗi',
                                }),
                                e.jsx('div', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Thông báo khi có lỗi hệ thống',
                                }),
                              ],
                            }),
                            e.jsx(z, {
                              checked: s.alertOnErrors,
                              onCheckedChange: () => n('alertOnErrors'),
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsxs('div', {
                              children: [
                                e.jsx('div', {
                                  className: 'font-medium',
                                  children: 'Cảnh báo điểm thấp',
                                }),
                                e.jsx('div', {
                                  className: 'text-sm text-gray-600',
                                  children: 'Thông báo khi điểm hài lòng thấp',
                                }),
                              ],
                            }),
                            e.jsx(z, {
                              checked: s.alertOnLowRating,
                              onCheckedChange: () => n('alertOnLowRating'),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsx('div', {
          className: 'flex justify-end',
          children: e.jsx(p, {
            onClick: l,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(Oe, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(je, { className: 'w-4 h-4 mr-2' }),
                    'Lưu cài đặt',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  ln = () => {
    const [s, a] = o.useState(Fs.privacy),
      [r, t] = o.useState(!1),
      n = i => {
        a(c => ({ ...c, [i]: !c[i] }));
      },
      l = async () => {
        t(!0);
        try {
          (await new Promise(i => setTimeout(i, 1e3)),
            console.log('Saving privacy settings:', s));
        } catch (i) {
          console.error('Failed to save settings:', i);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(re, { className: 'h-5 w-5' }),
                    'Quyền riêng tư & Bảo mật',
                  ],
                }),
                e.jsx(M, {
                  children: 'Cấu hình bảo mật và quyền riêng tư dữ liệu',
                }),
              ],
            }),
            e.jsxs(g, {
              className: 'space-y-6',
              children: [
                e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('div', {
                              className: 'font-medium',
                              children: 'Ghi âm cuộc gọi',
                            }),
                            e.jsx('div', {
                              className: 'text-sm text-gray-600',
                              children:
                                'Lưu trữ cuộc gọi để cải thiện chất lượng',
                            }),
                          ],
                        }),
                        e.jsx(z, {
                          checked: s.recordCalls,
                          onCheckedChange: () => n('recordCalls'),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('div', {
                              className: 'font-medium',
                              children: 'Chia sẻ dữ liệu phân tích',
                            }),
                            e.jsx('div', {
                              className: 'text-sm text-gray-600',
                              children:
                                'Giúp cải thiện sản phẩm (dữ liệu ẩn danh)',
                            }),
                          ],
                        }),
                        e.jsx(z, {
                          checked: s.shareAnalytics,
                          onCheckedChange: () => n('shareAnalytics'),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('div', {
                              className: 'font-medium',
                              children: 'Cho phép xuất dữ liệu',
                            }),
                            e.jsx('div', {
                              className: 'text-sm text-gray-600',
                              children:
                                'Khách hàng có thể yêu cầu xuất dữ liệu',
                            }),
                          ],
                        }),
                        e.jsx(z, {
                          checked: s.allowDataExport,
                          onCheckedChange: () => n('allowDataExport'),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsxs('div', {
                          children: [
                            e.jsx('div', {
                              className: 'font-medium',
                              children: 'Tuân thủ GDPR',
                            }),
                            e.jsx('div', {
                              className: 'text-sm text-gray-600',
                              children: 'Bảo vệ quyền riêng tư theo chuẩn EU',
                            }),
                          ],
                        }),
                        e.jsx(z, {
                          checked: s.gdprCompliance,
                          onCheckedChange: () => n('gdprCompliance'),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsx('h4', {
                      className: 'font-medium',
                      children: 'Lưu trữ dữ liệu',
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'retention-days',
                          children: 'Thời gian lưu trữ (ngày)',
                        }),
                        e.jsx(C, {
                          id: 'retention-days',
                          type: 'number',
                          value: s.dataRetentionDays,
                          onChange: i =>
                            a(c => ({
                              ...c,
                              dataRetentionDays: parseInt(i.target.value),
                            })),
                          className: 'mt-1 max-w-xs',
                          min: '30',
                          max: '365',
                        }),
                        e.jsxs('div', {
                          className: 'text-sm text-gray-600 mt-1',
                          children: [
                            'Dữ liệu sẽ được tự động xóa sau ',
                            s.dataRetentionDays,
                            ' ngày',
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsx('div', {
          className: 'flex justify-end',
          children: e.jsx(p, {
            onClick: l,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(Oe, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(je, { className: 'w-4 h-4 mr-2' }),
                    'Lưu cài đặt',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  rn = () => {
    const [s, a] = o.useState(Fs.api),
      [r, t] = o.useState(!1),
      n = async () => {
        t(!0);
        try {
          (await new Promise(l => setTimeout(l, 1e3)),
            console.log('Saving API settings:', s));
        } catch (l) {
          console.error('Failed to save settings:', l);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(Aa, { className: 'h-5 w-5' }),
                    'Cấu hình API',
                  ],
                }),
                e.jsx(M, { children: 'Quản lý API keys và webhook' }),
              ],
            }),
            e.jsxs(g, {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx(h, {
                      htmlFor: 'webhook-url',
                      children: 'Webhook URL',
                    }),
                    e.jsx(C, {
                      id: 'webhook-url',
                      value: s.webhookUrl,
                      onChange: l =>
                        a(i => ({ ...i, webhookUrl: l.target.value })),
                      className: 'mt-1',
                      placeholder: 'https://yourhotel.com/webhook',
                    }),
                    e.jsx('div', {
                      className: 'text-sm text-gray-600 mt-1',
                      children: 'URL để nhận thông báo về các sự kiện',
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsx('h4', {
                      className: 'font-medium',
                      children: 'API Keys',
                    }),
                    e.jsxs('div', {
                      className: 'bg-yellow-50 p-4 rounded-lg',
                      children: [
                        e.jsxs('div', {
                          className: 'flex items-center gap-2 mb-2',
                          children: [
                            e.jsx(ae, { className: 'h-4 w-4 text-yellow-600' }),
                            e.jsx('span', {
                              className: 'font-medium text-yellow-800',
                              children: 'Lưu ý bảo mật',
                            }),
                          ],
                        }),
                        e.jsx('p', {
                          className: 'text-sm text-yellow-700',
                          children:
                            'Không chia sẻ API keys với người khác. Thay đổi ngay nếu bị lộ.',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'vapi-key',
                          children: 'Vapi API Key',
                        }),
                        e.jsx(C, {
                          id: 'vapi-key',
                          type: 'password',
                          value: s.apiKeys.vapi,
                          onChange: l =>
                            a(i => ({
                              ...i,
                              apiKeys: { ...i.apiKeys, vapi: l.target.value },
                            })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'openai-key',
                          children: 'OpenAI API Key',
                        }),
                        e.jsx(C, {
                          id: 'openai-key',
                          type: 'password',
                          value: s.apiKeys.openai,
                          onChange: l =>
                            a(i => ({
                              ...i,
                              apiKeys: { ...i.apiKeys, openai: l.target.value },
                            })),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsx('div', {
          className: 'flex justify-end',
          children: e.jsx(p, {
            onClick: n,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(Oe, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(je, { className: 'w-4 h-4 mr-2' }),
                    'Lưu cài đặt',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  cn = () => {
    const s = [
        { name: 'Database Connection', status: 'healthy', icon: ns },
        { name: 'Vapi API', status: 'healthy', icon: be },
        { name: 'OpenAI API', status: 'healthy', icon: fe },
        { name: 'Email Service', status: 'healthy', icon: ea },
        { name: 'Webhook Endpoint', status: 'warning', icon: is },
        { name: 'SSL Certificate', status: 'healthy', icon: re },
      ],
      a = t => {
        switch (t) {
          case 'healthy':
            return 'text-green-600';
          case 'warning':
            return 'text-yellow-600';
          case 'error':
            return 'text-red-600';
          default:
            return 'text-gray-600';
        }
      },
      r = t => {
        switch (t) {
          case 'healthy':
            return e.jsx(R, {
              className: 'bg-green-100 text-green-800',
              children: 'Hoạt động',
            });
          case 'warning':
            return e.jsx(R, {
              className: 'bg-yellow-100 text-yellow-800',
              children: 'Cảnh báo',
            });
          case 'error':
            return e.jsx(R, {
              className: 'bg-red-100 text-red-800',
              children: 'Lỗi',
            });
          default:
            return e.jsx(R, { variant: 'outline', children: 'Không xác định' });
        }
      };
    return e.jsxs(j, {
      children: [
        e.jsxs(y, {
          children: [
            e.jsxs(b, {
              className: 'flex items-center gap-2',
              children: [
                e.jsx(rs, { className: 'h-5 w-5' }),
                'Trạng thái hệ thống',
              ],
            }),
            e.jsx(M, { children: 'Kiểm tra tình trạng các dịch vụ' }),
          ],
        }),
        e.jsx(g, {
          children: e.jsx('div', {
            className: 'space-y-4',
            children: s.map((t, n) =>
              e.jsxs(
                'div',
                {
                  className:
                    'flex items-center justify-between p-3 border rounded-lg',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        e.jsx(t.icon, { className: `h-5 w-5 ${a(t.status)}` }),
                        e.jsx('span', {
                          className: 'font-medium',
                          children: t.name,
                        }),
                      ],
                    }),
                    r(t.status),
                  ],
                },
                n
              )
            ),
          }),
        }),
      ],
    });
  },
  el = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          children: [
            e.jsx('h1', {
              className: 'text-3xl font-bold text-gray-900 dark:text-white',
              children: 'Cài đặt',
            }),
            e.jsx('p', {
              className: 'text-gray-600 dark:text-gray-400 mt-2',
              children: 'Quản lý thông tin khách sạn và cấu hình hệ thống',
            }),
          ],
        }),
        e.jsx(cn, {}),
        e.jsxs(we, {
          defaultValue: 'hotel',
          className: 'space-y-4',
          children: [
            e.jsxs(Ce, {
              className: 'grid w-full grid-cols-4',
              children: [
                e.jsx(O, { value: 'hotel', children: 'Khách sạn' }),
                e.jsx(O, { value: 'notifications', children: 'Thông báo' }),
                e.jsx(O, { value: 'privacy', children: 'Quyền riêng tư' }),
                e.jsx(O, { value: 'api', children: 'API' }),
              ],
            }),
            e.jsx(H, {
              value: 'hotel',
              className: 'space-y-4',
              children: e.jsx(tn, {}),
            }),
            e.jsx(H, {
              value: 'notifications',
              className: 'space-y-4',
              children: e.jsx(nn, {}),
            }),
            e.jsx(H, {
              value: 'privacy',
              className: 'space-y-4',
              children: e.jsx(ln, {}),
            }),
            e.jsx(H, {
              value: 'api',
              className: 'space-y-4',
              children: e.jsx(rn, {}),
            }),
          ],
        }),
      ],
    }),
  Z = {
    calls: { total: 156, today: 23 },
    requests: { pending: 8, inProgress: 12, completed: 45, totalToday: 18 },
    satisfaction: { rating: 4.7, trend: '+0.2' },
    system: { uptime: 99.8, responseTime: 150, errors: 2 },
  },
  ue = ({
    title: s,
    value: a,
    description: r,
    icon: t,
    trend: n,
    color: l = 'blue',
  }) =>
    e.jsxs(j, {
      children: [
        e.jsxs(y, {
          className:
            'flex flex-row items-center justify-between space-y-0 pb-2',
          children: [
            e.jsx(b, { className: 'text-sm font-medium', children: s }),
            e.jsx(t, { className: `h-4 w-4 text-${l}-600` }),
          ],
        }),
        e.jsxs(g, {
          children: [
            e.jsx('div', { className: 'text-2xl font-bold', children: a }),
            r &&
              e.jsx('p', {
                className: 'text-xs text-muted-foreground',
                children: r,
              }),
            n &&
              e.jsxs('div', {
                className: 'flex items-center text-xs text-green-600 mt-1',
                children: [e.jsx(he, { className: 'h-3 w-3 mr-1' }), n],
              }),
          ],
        }),
      ],
    }),
  dn = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className:
            'bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg',
          children: [
            e.jsx('h2', {
              className: 'text-2xl font-bold mb-2',
              children: 'Chào mừng đến với Dashboard Quản lý',
            }),
            e.jsx('p', {
              className: 'text-blue-100',
              children: 'Tổng quan hoạt động khách sạn và AI Assistant',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          children: [
            e.jsx(ue, {
              title: 'Tổng cuộc gọi',
              value: Z.calls.total,
              description: 'Hôm nay: +23',
              icon: be,
              trend: '+15.2%',
              color: 'blue',
            }),
            e.jsx(ue, {
              title: 'Đánh giá trung bình',
              value: `${Z.satisfaction.rating}/5`,
              description: '89 phản hồi',
              icon: es,
              trend: Z.satisfaction.trend,
              color: 'green',
            }),
            e.jsx(ue, {
              title: 'Yêu cầu đang chờ',
              value: Z.requests.pending,
              description: 'Cần xử lý ngay',
              icon: ae,
              color: 'orange',
            }),
            e.jsx(ue, {
              title: 'Uptime hệ thống',
              value: `${Z.system.uptime}%`,
              description: '30 ngày qua',
              icon: Le,
              trend: '+0.1%',
              color: 'purple',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Hành động nhanh' }),
                    e.jsx(M, { children: 'Các tác vụ thường xuyên' }),
                  ],
                }),
                e.jsxs(g, {
                  className: 'space-y-3',
                  children: [
                    e.jsx(Ne, {
                      requiredPermission: 'assistant:configure',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/settings',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(fe, { className: 'mr-2 h-4 w-4' }),
                            'Cấu hình AI Assistant',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'analytics:view_advanced',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/analytics',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(Ls, { className: 'mr-2 h-4 w-4' }),
                            'Xem báo cáo chi tiết',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'staff:manage',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/staff-management',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(ge, { className: 'mr-2 h-4 w-4' }),
                            'Quản lý nhân viên',
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Hoạt động gần đây' }),
                    e.jsx(M, { children: 'Cập nhật hệ thống mới nhất' }),
                  ],
                }),
                e.jsx(g, {
                  children: e.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          e.jsx(oe, { className: 'h-4 w-4 text-green-500' }),
                          e.jsxs('div', {
                            className: 'flex-1',
                            children: [
                              e.jsx('p', {
                                className: 'text-sm',
                                children: 'AI Assistant được cập nhật',
                              }),
                              e.jsx('p', {
                                className: 'text-xs text-muted-foreground',
                                children: '2 phút trước',
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          e.jsx(ae, { className: 'h-4 w-4 text-orange-500' }),
                          e.jsxs('div', {
                            className: 'flex-1',
                            children: [
                              e.jsx('p', {
                                className: 'text-sm',
                                children: '8 yêu cầu mới cần xử lý',
                              }),
                              e.jsx('p', {
                                className: 'text-xs text-muted-foreground',
                                children: '15 phút trước',
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          e.jsx(he, { className: 'h-4 w-4 text-blue-500' }),
                          e.jsxs('div', {
                            className: 'flex-1',
                            children: [
                              e.jsx('p', {
                                className: 'text-sm',
                                children: 'Satisfaction tăng 0.2 điểm',
                              }),
                              e.jsx('p', {
                                className: 'text-xs text-muted-foreground',
                                children: '1 giờ trước',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  hn = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className:
            'bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg',
          children: [
            e.jsx('h2', {
              className: 'text-2xl font-bold mb-2',
              children: 'Dashboard Lễ tân',
            }),
            e.jsx('p', {
              className: 'text-green-100',
              children: 'Quản lý yêu cầu khách hàng và cuộc gọi',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          children: [
            e.jsx(ue, {
              title: 'Yêu cầu hôm nay',
              value: Z.requests.totalToday,
              description: 'Mới trong ngày',
              icon: da,
              color: 'green',
            }),
            e.jsx(ue, {
              title: 'Đang chờ xử lý',
              value: Z.requests.pending,
              description: 'Cần hành động',
              icon: ye,
              color: 'orange',
            }),
            e.jsx(ue, {
              title: 'Đã hoàn thành',
              value: Z.requests.completed,
              description: 'Tuần này',
              icon: oe,
              color: 'blue',
            }),
            e.jsx(ue, {
              title: 'Cuộc gọi hôm nay',
              value: Z.calls.today,
              description: 'Thời gian TB: 2.3 phút',
              icon: be,
              color: 'purple',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Công việc của tôi' }),
                    e.jsx(M, { children: 'Nhiệm vụ cần thực hiện' }),
                  ],
                }),
                e.jsxs(g, {
                  className: 'space-y-3',
                  children: [
                    e.jsx(Ne, {
                      requiredPermission: 'requests:view',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/requests',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(da, { className: 'mr-2 h-4 w-4' }),
                            'Xem yêu cầu khách hàng (',
                            Z.requests.pending,
                            ')',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'calls:view',
                      children: e.jsx(le, {
                        href: '/dashboard/calls',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(cs, { className: 'mr-2 h-4 w-4' }),
                            'Lịch sử cuộc gọi',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'guests:manage',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/guest-management',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(ge, { className: 'mr-2 h-4 w-4' }),
                            'Quản lý khách hàng',
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Trạng thái yêu cầu' }),
                    e.jsx(M, { children: 'Phân bố theo trạng thái' }),
                  ],
                }),
                e.jsx(g, {
                  children: e.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsx('span', {
                            className: 'text-sm',
                            children: 'Đang chờ',
                          }),
                          e.jsx(R, {
                            variant: 'outline',
                            children: Z.requests.pending,
                          }),
                        ],
                      }),
                      e.jsx(Pe, {
                        value:
                          (Z.requests.pending /
                            (Z.requests.pending +
                              Z.requests.inProgress +
                              Z.requests.completed)) *
                          100,
                        className: 'h-2',
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsx('span', {
                            className: 'text-sm',
                            children: 'Đang xử lý',
                          }),
                          e.jsx(R, {
                            variant: 'outline',
                            children: Z.requests.inProgress,
                          }),
                        ],
                      }),
                      e.jsx(Pe, {
                        value:
                          (Z.requests.inProgress /
                            (Z.requests.pending +
                              Z.requests.inProgress +
                              Z.requests.completed)) *
                          100,
                        className: 'h-2',
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsx('span', {
                            className: 'text-sm',
                            children: 'Hoàn thành',
                          }),
                          e.jsx(R, {
                            variant: 'outline',
                            children: Z.requests.completed,
                          }),
                        ],
                      }),
                      e.jsx(Pe, {
                        value:
                          (Z.requests.completed /
                            (Z.requests.pending +
                              Z.requests.inProgress +
                              Z.requests.completed)) *
                          100,
                        className: 'h-2',
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  on = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className:
            'bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg',
          children: [
            e.jsx('h2', {
              className: 'text-2xl font-bold mb-2',
              children: 'Dashboard IT Manager',
            }),
            e.jsx('p', {
              className: 'text-purple-100',
              children: 'Giám sát hệ thống và quản lý kỹ thuật',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          children: [
            e.jsx(ue, {
              title: 'Uptime hệ thống',
              value: `${Z.system.uptime}%`,
              description: '30 ngày qua',
              icon: sa,
              trend: '+0.1%',
              color: 'purple',
            }),
            e.jsx(ue, {
              title: 'Response Time',
              value: `${Z.system.responseTime}ms`,
              description: 'Trung bình 24h',
              icon: Le,
              color: 'blue',
            }),
            e.jsx(ue, {
              title: 'Lỗi hệ thống',
              value: Z.system.errors,
              description: 'Hôm nay',
              icon: ae,
              color: 'red',
            }),
            e.jsx(ue, {
              title: 'API Calls',
              value: '12.5K',
              description: 'Hôm nay',
              icon: ns,
              trend: '+8.2%',
              color: 'green',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Công cụ IT' }),
                    e.jsx(M, { children: 'Quản lý hệ thống và bảo mật' }),
                  ],
                }),
                e.jsxs(g, {
                  className: 'space-y-3',
                  children: [
                    e.jsx(Ne, {
                      requiredPermission: 'system:monitor',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/system-monitoring',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(aa, { className: 'mr-2 h-4 w-4' }),
                            'Giám sát hệ thống',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'logs:view',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/logs',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(ns, { className: 'mr-2 h-4 w-4' }),
                            'Xem system logs',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'security:manage',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/security',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(re, { className: 'mr-2 h-4 w-4' }),
                            'Cấu hình bảo mật',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'integrations:manage',
                      children: e.jsx(le, {
                        href: '/unified-dashboard/integrations',
                        children: e.jsxs(p, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(Da, { className: 'mr-2 h-4 w-4' }),
                            'Quản lý tích hợp',
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(j, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Cảnh báo hệ thống' }),
                    e.jsx(M, { children: 'Thông báo kỹ thuật quan trọng' }),
                  ],
                }),
                e.jsx(g, {
                  children: e.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          e.jsx(oe, { className: 'h-4 w-4 text-green-500' }),
                          e.jsxs('div', {
                            className: 'flex-1',
                            children: [
                              e.jsx('p', {
                                className: 'text-sm',
                                children: 'Database backup completed',
                              }),
                              e.jsx('p', {
                                className: 'text-xs text-muted-foreground',
                                children: '5 phút trước',
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          e.jsx(ae, { className: 'h-4 w-4 text-orange-500' }),
                          e.jsxs('div', {
                            className: 'flex-1',
                            children: [
                              e.jsx('p', {
                                className: 'text-sm',
                                children: 'High memory usage: 85%',
                              }),
                              e.jsx('p', {
                                className: 'text-xs text-muted-foreground',
                                children: '10 phút trước',
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          e.jsx(re, { className: 'h-4 w-4 text-blue-500' }),
                          e.jsxs('div', {
                            className: 'flex-1',
                            children: [
                              e.jsx('p', {
                                className: 'text-sm',
                                children: 'Security scan completed',
                              }),
                              e.jsx('p', {
                                className: 'text-xs text-muted-foreground',
                                children: '1 giờ trước',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  sl = () => {
    const { user: s } = pe(),
      a = s?.role || 'front-desk',
      r = () => {
        switch (a) {
          case 'hotel-manager':
            return e.jsx(dn, {});
          case 'front-desk':
            return e.jsx(hn, {});
          case 'it-manager':
            return e.jsx(on, {});
          default:
            return e.jsxs('div', {
              className: 'text-center py-12',
              children: [
                e.jsx('h2', {
                  className: 'text-2xl font-bold text-gray-900 mb-4',
                  children: 'Chào mừng đến với Dashboard',
                }),
                e.jsx('p', {
                  className: 'text-gray-600',
                  children:
                    'Vai trò của bạn chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
                }),
              ],
            });
        }
      };
    return e.jsx('div', { className: 'space-y-6', children: r() });
  },
  Ga = [
    'Tất cả',
    'Đã ghi nhận',
    'Đang thực hiện',
    'Đã thực hiện và đang bàn giao cho khách',
    'Hoàn thiện',
    'Lưu ý khác',
  ],
  Za = s => {
    switch (s) {
      case 'Đã ghi nhận':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Đang thực hiện':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Đã thực hiện và đang bàn giao cho khách':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Hoàn thiện':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Lưu ý khác':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  },
  _a = s => {
    switch (s) {
      case 'Đã ghi nhận':
        return e.jsx(ye, { className: 'h-3 w-3' });
      case 'Đang thực hiện':
        return e.jsx(ae, { className: 'h-3 w-3' });
      case 'Đã thực hiện và đang bàn giao cho khách':
        return e.jsx(B, { className: 'h-3 w-3' });
      case 'Hoàn thiện':
        return e.jsx(oe, { className: 'h-3 w-3' });
      case 'Lưu ý khác':
        return e.jsx(ae, { className: 'h-3 w-3' });
      default:
        return e.jsx(ye, { className: 'h-3 w-3' });
    }
  },
  xn = ({
    request: s,
    isOpen: a,
    onClose: r,
    onStatusChange: t,
    onOpenMessage: n,
  }) => {
    const [l, i] = o.useState(s.status),
      c = () => {
        l !== s.status && t(l);
      };
    return e.jsx(ze, {
      open: a,
      onOpenChange: r,
      children: e.jsxs(Be, {
        className: 'max-w-2xl',
        children: [
          e.jsxs(Ue, {
            children: [
              e.jsxs(Ke, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(Xs, { className: 'h-5 w-5' }),
                  'Phòng ',
                  s.roomNumber,
                  ' - ',
                  s.orderId,
                ],
              }),
              e.jsx(We, { children: 'Chi tiết yêu cầu khách hàng' }),
            ],
          }),
          e.jsxs('div', {
            className: 'space-y-4',
            children: [
              e.jsxs('div', {
                className: 'grid grid-cols-2 gap-4',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { children: 'Khách hàng' }),
                      e.jsxs('div', {
                        className: 'flex items-center gap-2 mt-1',
                        children: [
                          e.jsx(ta, { className: 'h-4 w-4 text-gray-500' }),
                          e.jsx('span', { children: s.guestName }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { children: 'Thời gian tạo' }),
                      e.jsxs('div', {
                        className: 'flex items-center gap-2 mt-1',
                        children: [
                          e.jsx(Ys, { className: 'h-4 w-4 text-gray-500' }),
                          e.jsx('span', {
                            children: new Date(s.createdAt).toLocaleString(),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { children: 'Nội dung yêu cầu' }),
                  e.jsx('div', {
                    className:
                      'mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap',
                    children: s.requestContent,
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-2 gap-4',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { children: 'Trạng thái hiện tại' }),
                      e.jsxs(R, {
                        variant: 'outline',
                        className: $('mt-2', Za(s.status)),
                        children: [
                          _a(s.status),
                          e.jsx('span', {
                            className: 'ml-1',
                            children: s.status,
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { children: 'Cập nhật trạng thái' }),
                      e.jsxs(Q, {
                        value: l,
                        onValueChange: i,
                        children: [
                          e.jsx(W, {
                            className: 'mt-2',
                            children: e.jsx(X, {}),
                          }),
                          e.jsx(Y, {
                            children: Ga.filter(u => u !== 'Tất cả').map(u =>
                              e.jsx(N, { value: u, children: u }, u)
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex gap-3 pt-4',
                children: [
                  e.jsxs(p, {
                    onClick: c,
                    disabled: l === s.status,
                    children: [
                      e.jsx(_e, { className: 'h-4 w-4 mr-2' }),
                      'Cập nhật trạng thái',
                    ],
                  }),
                  e.jsxs(p, {
                    variant: 'outline',
                    onClick: n,
                    children: [
                      e.jsx(cs, { className: 'h-4 w-4 mr-2' }),
                      'Nhắn tin với khách',
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  mn = ({
    request: s,
    messages: a,
    isOpen: r,
    onClose: t,
    onSendMessage: n,
    loading: l,
  }) => {
    const [i, c] = o.useState(''),
      u = () => {
        i.trim() && (n(i.trim()), c(''));
      };
    return e.jsx(ze, {
      open: r,
      onOpenChange: t,
      children: e.jsxs(Be, {
        className: 'max-w-md',
        children: [
          e.jsx(Ue, {
            children: e.jsxs(Ke, {
              children: ['Tin nhắn với khách - Phòng ', s.roomNumber],
            }),
          }),
          e.jsxs('div', {
            className: 'space-y-4',
            children: [
              e.jsx('div', {
                className:
                  'h-60 overflow-y-auto border rounded-lg p-3 space-y-2',
                children:
                  a.length === 0
                    ? e.jsx('div', {
                        className: 'text-center text-gray-500 py-8',
                        children: 'Chưa có tin nhắn nào',
                      })
                    : a.map(d =>
                        e.jsx(
                          'div',
                          {
                            className: $(
                              'flex',
                              d.sender === 'staff'
                                ? 'justify-end'
                                : 'justify-start'
                            ),
                            children: e.jsxs('div', {
                              className: $(
                                'max-w-[70%] p-2 rounded-lg text-sm',
                                d.sender === 'staff'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              ),
                              children: [
                                e.jsx('p', { children: d.content }),
                                e.jsx('p', {
                                  className: $(
                                    'text-xs mt-1',
                                    d.sender === 'staff'
                                      ? 'text-blue-100'
                                      : 'text-gray-500'
                                  ),
                                  children: d.time,
                                }),
                              ],
                            }),
                          },
                          d.id
                        )
                      ),
              }),
              e.jsxs('div', {
                className: 'space-y-2',
                children: [
                  e.jsx(me, {
                    placeholder: 'Nhập tin nhắn...',
                    value: i,
                    onChange: d => c(d.target.value),
                    className: 'min-h-[60px]',
                  }),
                  e.jsx('div', {
                    className: 'flex justify-end',
                    children: e.jsxs(p, {
                      onClick: u,
                      disabled: !i.trim() || l,
                      size: 'sm',
                      children: [
                        l
                          ? e.jsx(B, { className: 'h-4 w-4 mr-2 animate-spin' })
                          : e.jsx(ht, { className: 'h-4 w-4 mr-2' }),
                        'Gửi',
                      ],
                    }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  al = () => {
    const { user: s } = pe(),
      [a, r] = o.useState([]),
      [t, n] = o.useState(!0),
      [l, i] = o.useState(null),
      [c, u] = o.useState(!1),
      [d, w] = o.useState(!1),
      [m, x] = o.useState([]),
      [L, S] = o.useState(!1),
      [k, ee] = o.useState('Tất cả'),
      [se, te] = o.useState(''),
      [ne, T] = o.useState(''),
      [J, D] = o.useState(''),
      [_, V] = o.useState(''),
      [de, ie] = o.useState(''),
      [I, v] = o.useState(!1),
      q = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }),
      G = async () => {
        try {
          n(!0);
          const A = await fetch('/api/staff/requests', { headers: q() });
          if (A.status === 401) {
            console.error('Unauthorized access');
            return;
          }
          if (!A.ok) throw new Error('Failed to fetch requests');
          const U = await A.json();
          r(U);
        } catch (A) {
          console.error('Failed to fetch requests:', A);
        } finally {
          n(!1);
        }
      },
      Se = async (A, U) => {
        try {
          (await fetch(`/api/staff/requests/${A}/status`, {
            method: 'PATCH',
            headers: q(),
            body: JSON.stringify({ status: U }),
          }),
            r(ke => ke.map(f => (f.id === A ? { ...f, status: U } : f))),
            l && l.id === A && i({ ...l, status: U }));
        } catch (ke) {
          console.error('Failed to update status:', ke);
        }
      },
      ds = async A => {
        try {
          const U = await fetch(`/api/staff/requests/${A}/messages`, {
            headers: q(),
          });
          if (U.ok) {
            const ke = await U.json();
            x(ke);
          }
        } catch (U) {
          (console.error('Failed to fetch messages:', U), x([]));
        }
      },
      Ps = async A => {
        if (l) {
          S(!0);
          try {
            await fetch(`/api/staff/requests/${l.id}/message`, {
              method: 'POST',
              headers: q(),
              body: JSON.stringify({ content: A }),
            });
            const U = {
              id: Date.now().toString(),
              sender: 'staff',
              content: A,
              time: new Date().toLocaleTimeString().slice(0, 5),
            };
            x(ke => [...ke, U]);
          } catch (U) {
            console.error('Failed to send message:', U);
          } finally {
            S(!1);
          }
        }
      },
      hs = async () => {
        if (_ !== '2208') {
          ie('Mật khẩu không đúng');
          return;
        }
        v(!0);
        try {
          const U = await (
            await fetch('/api/staff/requests/all', {
              method: 'DELETE',
              headers: q(),
            })
          ).json();
          U.success
            ? (r([]), V(''), ie(''))
            : ie(U.error || 'Không thể xóa requests');
        } catch (A) {
          (console.error('Error deleting requests:', A),
            ie('Đã xảy ra lỗi khi xóa requests'));
        } finally {
          v(!1);
        }
      },
      $e = a.filter(A => {
        if (k !== 'Tất cả' && A.status !== k) return !1;
        if (se || ne) {
          const U = new Date(A.createdAt);
          if (
            (se && U < new Date(se)) ||
            (ne && U > new Date(ne + 'T23:59:59'))
          )
            return !1;
        }
        if (J) {
          const U = J.toLowerCase();
          return (
            A.roomNumber.toLowerCase().includes(U) ||
            A.guestName.toLowerCase().includes(U) ||
            A.requestContent.toLowerCase().includes(U) ||
            A.orderId.toLowerCase().includes(U)
          );
        }
        return !0;
      });
    o.useEffect(() => {
      G();
      const A = setInterval(G, 3e4);
      return () => clearInterval(A);
    }, []);
    const Ms = A => {
        (i(A), u(!0));
      },
      Rs = () => {
        (u(!1), i(null));
      },
      fs = async () => {
        l && (w(!0), await ds(l.id));
      },
      ys = () => {
        (w(!1), x([]));
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('h1', {
                  className: 'text-2xl font-bold',
                  children: 'Yêu cầu khách hàng',
                }),
                e.jsx('p', {
                  className: 'text-gray-600',
                  children: 'Quản lý và xử lý các yêu cầu từ khách hàng',
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'flex gap-2',
              children: [
                e.jsxs(p, {
                  variant: 'outline',
                  onClick: G,
                  disabled: t,
                  children: [
                    e.jsx(B, {
                      className: $('h-4 w-4 mr-2', t && 'animate-spin'),
                    }),
                    'Làm mới',
                  ],
                }),
                e.jsxs(Fa, {
                  children: [
                    e.jsx(Pa, {
                      asChild: !0,
                      children: e.jsxs(p, {
                        variant: 'destructive',
                        disabled: a.length === 0,
                        children: [
                          e.jsx(Ze, { className: 'h-4 w-4 mr-2' }),
                          'Xóa tất cả',
                        ],
                      }),
                    }),
                    e.jsxs(Ma, {
                      children: [
                        e.jsxs(Ra, {
                          children: [
                            e.jsx(Ea, {
                              children: 'Xác nhận xóa tất cả requests',
                            }),
                            e.jsx(qa, {
                              children:
                                'Hành động này sẽ xóa tất cả yêu cầu và không thể hoàn tác. Vui lòng nhập mật khẩu để xác nhận:',
                            }),
                          ],
                        }),
                        e.jsxs('div', {
                          className: 'py-4',
                          children: [
                            e.jsx(C, {
                              type: 'password',
                              placeholder: 'Nhập mật khẩu xác nhận',
                              value: _,
                              onChange: A => V(A.target.value),
                              className: de ? 'border-red-500' : '',
                            }),
                            de &&
                              e.jsx('p', {
                                className: 'text-red-500 text-sm mt-1',
                                children: de,
                              }),
                          ],
                        }),
                        e.jsxs(Oa, {
                          children: [
                            e.jsx(Ha, {
                              onClick: () => {
                                (V(''), ie(''));
                              },
                              children: 'Hủy',
                            }),
                            e.jsx(za, {
                              onClick: hs,
                              disabled: I,
                              className: 'bg-red-600 hover:bg-red-700',
                              children: I ? 'Đang xóa...' : 'Xóa tất cả',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsx(y, {
              children: e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [e.jsx(Js, { className: 'h-5 w-5' }), 'Bộ lọc'],
              }),
            }),
            e.jsxs(g, {
              children: [
                e.jsxs('div', {
                  className:
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Trạng thái' }),
                        e.jsxs(Q, {
                          value: k,
                          onValueChange: ee,
                          children: [
                            e.jsx(W, { children: e.jsx(X, {}) }),
                            e.jsx(Y, {
                              children: Ga.map(A =>
                                e.jsx(N, { value: A, children: A }, A)
                              ),
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Từ ngày' }),
                        e.jsx(C, {
                          type: 'date',
                          value: se,
                          onChange: A => te(A.target.value),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Đến ngày' }),
                        e.jsx(C, {
                          type: 'date',
                          value: ne,
                          onChange: A => T(A.target.value),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Tìm kiếm' }),
                        e.jsxs('div', {
                          className: 'relative',
                          children: [
                            e.jsx(Me, {
                              className:
                                'absolute left-3 top-3 h-4 w-4 text-gray-400',
                            }),
                            e.jsx(C, {
                              placeholder: 'Tìm theo phòng, khách...',
                              value: J,
                              onChange: A => D(A.target.value),
                              className: 'pl-10',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (k !== 'Tất cả' || se || ne || J) &&
                  e.jsx('div', {
                    className: 'mt-4',
                    children: e.jsx(p, {
                      variant: 'outline',
                      size: 'sm',
                      onClick: () => {
                        (ee('Tất cả'), te(''), T(''), D(''));
                      },
                      children: 'Xóa bộ lọc',
                    }),
                  }),
              ],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-4 gap-4',
          children: [
            e.jsx(j, {
              children: e.jsx(g, {
                className: 'p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(ye, { className: 'h-5 w-5 text-orange-500' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium',
                          children: 'Đang chờ',
                        }),
                        e.jsx('p', {
                          className: 'text-2xl font-bold',
                          children: a.filter(A => A.status === 'Đã ghi nhận')
                            .length,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
            e.jsx(j, {
              children: e.jsx(g, {
                className: 'p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(B, { className: 'h-5 w-5 text-yellow-500' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium',
                          children: 'Đang xử lý',
                        }),
                        e.jsx('p', {
                          className: 'text-2xl font-bold',
                          children: a.filter(A => A.status === 'Đang thực hiện')
                            .length,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
            e.jsx(j, {
              children: e.jsx(g, {
                className: 'p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(oe, { className: 'h-5 w-5 text-green-500' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium',
                          children: 'Hoàn thành',
                        }),
                        e.jsx('p', {
                          className: 'text-2xl font-bold',
                          children: a.filter(A => A.status === 'Hoàn thiện')
                            .length,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
            e.jsx(j, {
              children: e.jsx(g, {
                className: 'p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(ae, { className: 'h-5 w-5 text-blue-500' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium',
                          children: 'Tổng cộng',
                        }),
                        e.jsx('p', {
                          className: 'text-2xl font-bold',
                          children: a.length,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsx(b, { children: 'Danh sách yêu cầu' }),
                e.jsxs(M, {
                  children: [
                    'Hiển thị ',
                    $e.length,
                    ' / ',
                    a.length,
                    ' yêu cầu',
                  ],
                }),
              ],
            }),
            e.jsx(g, {
              children: t
                ? e.jsxs('div', {
                    className: 'text-center py-8',
                    children: [
                      e.jsx(B, {
                        className: 'h-8 w-8 animate-spin mx-auto mb-4',
                      }),
                      e.jsx('p', { children: 'Đang tải...' }),
                    ],
                  })
                : $e.length === 0
                  ? e.jsxs('div', {
                      className: 'text-center py-8',
                      children: [
                        e.jsx(ae, {
                          className: 'h-12 w-12 text-gray-400 mx-auto mb-4',
                        }),
                        e.jsx('p', {
                          className: 'text-gray-500',
                          children: 'Không có yêu cầu nào',
                        }),
                      ],
                    })
                  : e.jsx('div', {
                      className: 'space-y-4',
                      children: $e
                        .sort(
                          (A, U) =>
                            new Date(U.createdAt).getTime() -
                            new Date(A.createdAt).getTime()
                        )
                        .map(A =>
                          e.jsx(
                            j,
                            {
                              className: 'hover:shadow-md transition-shadow',
                              children: e.jsx(g, {
                                className: 'p-4',
                                children: e.jsxs('div', {
                                  className: 'flex items-start justify-between',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex-1',
                                      children: [
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center gap-2 mb-2',
                                          children: [
                                            e.jsx(Xs, {
                                              className:
                                                'h-4 w-4 text-gray-500',
                                            }),
                                            e.jsxs('span', {
                                              className: 'font-semibold',
                                              children: [
                                                'Phòng ',
                                                A.roomNumber,
                                              ],
                                            }),
                                            e.jsx(R, {
                                              variant: 'outline',
                                              className: 'text-xs',
                                              children: A.orderId,
                                            }),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center gap-2 mb-2',
                                          children: [
                                            e.jsx(ta, {
                                              className:
                                                'h-4 w-4 text-gray-500',
                                            }),
                                            e.jsx('span', {
                                              className:
                                                'text-sm text-gray-600',
                                              children: A.guestName,
                                            }),
                                            e.jsx(Ys, {
                                              className:
                                                'h-4 w-4 text-gray-500 ml-4',
                                            }),
                                            e.jsx('span', {
                                              className:
                                                'text-sm text-gray-600',
                                              children: new Date(
                                                A.createdAt
                                              ).toLocaleString(),
                                            }),
                                          ],
                                        }),
                                        e.jsx('p', {
                                          className:
                                            'text-sm text-gray-800 mb-3 line-clamp-2',
                                          children: A.requestContent,
                                        }),
                                        e.jsx('div', {
                                          className: 'flex items-center gap-2',
                                          children: e.jsxs(R, {
                                            variant: 'outline',
                                            className: $(
                                              'text-xs',
                                              Za(A.status)
                                            ),
                                            children: [
                                              _a(A.status),
                                              e.jsx('span', {
                                                className: 'ml-1',
                                                children: A.status,
                                              }),
                                            ],
                                          }),
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex flex-col gap-2 ml-4',
                                      children: [
                                        e.jsxs(p, {
                                          variant: 'outline',
                                          size: 'sm',
                                          onClick: () => Ms(A),
                                          children: [
                                            e.jsx(He, {
                                              className: 'h-4 w-4 mr-2',
                                            }),
                                            'Chi tiết',
                                          ],
                                        }),
                                        e.jsxs(p, {
                                          variant: 'outline',
                                          size: 'sm',
                                          onClick: () => {
                                            (i(A), fs());
                                          },
                                          children: [
                                            e.jsx(cs, {
                                              className: 'h-4 w-4 mr-2',
                                            }),
                                            'Nhắn tin',
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                            },
                            A.id
                          )
                        ),
                    }),
            }),
          ],
        }),
        l &&
          e.jsxs(e.Fragment, {
            children: [
              e.jsx(xn, {
                request: l,
                isOpen: c,
                onClose: Rs,
                onStatusChange: A => Se(l.id, A),
                onOpenMessage: fs,
              }),
              e.jsx(mn, {
                request: l,
                messages: m,
                isOpen: d,
                onClose: ys,
                onSendMessage: Ps,
                loading: L,
              }),
            ],
          }),
      ],
    });
  },
  Ie = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'],
  Ss = ({
    title: s,
    value: a,
    change: r,
    changeType: t,
    icon: n,
    description: l,
  }) => {
    const i = () => {
        switch (t) {
          case 'positive':
            return 'text-green-600';
          case 'negative':
            return 'text-red-600';
          default:
            return 'text-gray-600';
        }
      },
      c = () => {
        switch (t) {
          case 'positive':
            return e.jsx(he, { className: 'h-3 w-3' });
          case 'negative':
            return e.jsx(ot, { className: 'h-3 w-3' });
          default:
            return e.jsx(he, { className: 'h-3 w-3' });
        }
      };
    return e.jsx(j, {
      children: e.jsx(g, {
        className: 'p-6',
        children: e.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('p', {
                  className: 'text-sm font-medium text-gray-600',
                  children: s,
                }),
                e.jsx('p', { className: 'text-2xl font-bold', children: a }),
                r &&
                  e.jsxs('div', {
                    className: $('flex items-center gap-1 text-sm mt-1', i()),
                    children: [c(), e.jsx('span', { children: r })],
                  }),
                l &&
                  e.jsx('p', {
                    className: 'text-xs text-gray-500 mt-1',
                    children: l,
                  }),
              ],
            }),
            e.jsx(n, { className: 'h-8 w-8 text-gray-400' }),
          ],
        }),
      }),
    });
  },
  Hs = ({ active: s, payload: a, label: r }) =>
    s && a && a.length
      ? e.jsxs('div', {
          className: 'bg-white p-2 border rounded shadow',
          children: [
            e.jsx('p', { className: 'font-medium', children: r }),
            a.map((t, n) =>
              e.jsx(
                'p',
                {
                  style: { color: t.color },
                  children: `${t.dataKey}: ${t.value}`,
                },
                n
              )
            ),
          ],
        })
      : null,
  tl = () => {
    const { user: s } = pe(),
      [a, r] = o.useState(null),
      [t, n] = o.useState(!0),
      [l, i] = o.useState('30d'),
      [c, u] = o.useState('all'),
      d = {
        overview: {
          totalCalls: 1247,
          averageCallDuration: '2:34',
          successRate: 94.2,
          topLanguages: ['Vietnamese', 'English', 'Korean'],
          callsThisMonth: 423,
          growthRate: 15.3,
        },
        serviceDistribution: [
          { service: 'Room Service', calls: 450, percentage: 36.1 },
          { service: 'Concierge', calls: 300, percentage: 24.1 },
          { service: 'Housekeeping', calls: 250, percentage: 20.1 },
          { service: 'Front Desk', calls: 150, percentage: 12 },
          { service: 'Spa & Wellness', calls: 97, percentage: 7.8 },
        ],
        hourlyActivity: [
          { hour: '06:00', calls: 5 },
          { hour: '07:00', calls: 12 },
          { hour: '08:00', calls: 25 },
          { hour: '09:00', calls: 35 },
          { hour: '10:00', calls: 45 },
          { hour: '11:00', calls: 40 },
          { hour: '12:00', calls: 55 },
          { hour: '13:00', calls: 48 },
          { hour: '14:00', calls: 52 },
          { hour: '15:00', calls: 38 },
          { hour: '16:00', calls: 42 },
          { hour: '17:00', calls: 35 },
          { hour: '18:00', calls: 45 },
          { hour: '19:00', calls: 52 },
          { hour: '20:00', calls: 38 },
          { hour: '21:00', calls: 25 },
          { hour: '22:00', calls: 15 },
          { hour: '23:00', calls: 8 },
        ],
        dailyTrends: [
          { date: '2024-01-01', calls: 45, duration: 154, satisfaction: 4.5 },
          { date: '2024-01-02', calls: 52, duration: 162, satisfaction: 4.6 },
          { date: '2024-01-03', calls: 38, duration: 148, satisfaction: 4.4 },
          { date: '2024-01-04', calls: 41, duration: 156, satisfaction: 4.7 },
          { date: '2024-01-05', calls: 48, duration: 159, satisfaction: 4.5 },
          { date: '2024-01-06', calls: 55, duration: 165, satisfaction: 4.8 },
          { date: '2024-01-07', calls: 42, duration: 151, satisfaction: 4.6 },
        ],
        languageDistribution: [
          { language: 'Vietnamese', calls: 687, percentage: 55.1 },
          { language: 'English', calls: 423, percentage: 33.9 },
          { language: 'Korean', calls: 87, percentage: 7 },
          { language: 'Chinese', calls: 50, percentage: 4 },
        ],
      },
      w = async () => {
        try {
          (n(!0),
            setTimeout(() => {
              (r(d), n(!1));
            }, 1e3));
        } catch (m) {
          (console.error('Failed to fetch analytics:', m), n(!1));
        }
      };
    return (
      o.useEffect(() => {
        w();
      }, [l]),
      t
        ? e.jsxs('div', {
            className: 'flex items-center justify-center h-64',
            children: [
              e.jsx(B, { className: 'h-8 w-8 animate-spin text-blue-600' }),
              e.jsx('span', {
                className: 'ml-2',
                children: 'Đang tải analytics...',
              }),
            ],
          })
        : a
          ? e.jsxs('div', {
              className: 'space-y-6',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx('h1', {
                          className: 'text-2xl font-bold',
                          children: 'Analytics nâng cao',
                        }),
                        e.jsx('p', {
                          className: 'text-gray-600',
                          children:
                            'Phân tích chi tiết hoạt động AI Assistant và khách hàng',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex gap-2',
                      children: [
                        e.jsxs(Q, {
                          value: l,
                          onValueChange: i,
                          children: [
                            e.jsx(W, {
                              className: 'w-32',
                              children: e.jsx(X, {}),
                            }),
                            e.jsxs(Y, {
                              children: [
                                e.jsx(N, { value: '7d', children: '7 ngày' }),
                                e.jsx(N, { value: '30d', children: '30 ngày' }),
                                e.jsx(N, { value: '90d', children: '90 ngày' }),
                                e.jsx(N, { value: '365d', children: '1 năm' }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs(p, {
                          variant: 'outline',
                          onClick: w,
                          children: [
                            e.jsx(B, { className: 'h-4 w-4 mr-2' }),
                            'Làm mới',
                          ],
                        }),
                        e.jsxs(p, {
                          variant: 'outline',
                          children: [
                            e.jsx(Qe, { className: 'h-4 w-4 mr-2' }),
                            'Xuất báo cáo',
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className:
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
                  children: [
                    e.jsx(Ss, {
                      title: 'Tổng cuộc gọi',
                      value: a.overview.totalCalls.toLocaleString(),
                      change: `+${a.overview.growthRate}%`,
                      changeType: 'positive',
                      icon: be,
                      description: '30 ngày qua',
                    }),
                    e.jsx(Ss, {
                      title: 'Thời gian TB',
                      value: a.overview.averageCallDuration,
                      change: '+12 giây',
                      changeType: 'positive',
                      icon: ye,
                      description: 'So với tháng trước',
                    }),
                    e.jsx(Ss, {
                      title: 'Tỷ lệ thành công',
                      value: `${a.overview.successRate}%`,
                      change: '+2.1%',
                      changeType: 'positive',
                      icon: Le,
                      description: 'Cuộc gọi hoàn thành',
                    }),
                    e.jsx(Ss, {
                      title: 'Tháng này',
                      value: a.overview.callsThisMonth.toLocaleString(),
                      change: '+23 hôm nay',
                      changeType: 'positive',
                      icon: he,
                      description: 'Cuộc gọi trong tháng',
                    }),
                  ],
                }),
                e.jsxs(we, {
                  defaultValue: 'overview',
                  className: 'space-y-4',
                  children: [
                    e.jsxs(Ce, {
                      className: 'grid w-full grid-cols-4',
                      children: [
                        e.jsx(O, { value: 'overview', children: 'Tổng quan' }),
                        e.jsx(O, { value: 'services', children: 'Dịch vụ' }),
                        e.jsx(O, { value: 'activity', children: 'Hoạt động' }),
                        e.jsx(O, { value: 'languages', children: 'Ngôn ngữ' }),
                      ],
                    }),
                    e.jsx(H, {
                      value: 'overview',
                      className: 'space-y-4',
                      children: e.jsxs('div', {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
                        children: [
                          e.jsxs(j, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, {
                                    children: 'Xu hướng cuộc gọi theo ngày',
                                  }),
                                  e.jsx(M, { children: '7 ngày gần đây' }),
                                ],
                              }),
                              e.jsx(g, {
                                children: e.jsx(Te, {
                                  width: '100%',
                                  height: 300,
                                  children: e.jsxs(Tt, {
                                    data: a.dailyTrends,
                                    children: [
                                      e.jsx(ss, { strokeDasharray: '3 3' }),
                                      e.jsx(as, { dataKey: 'date' }),
                                      e.jsx(ts, {}),
                                      e.jsx(Ae, { content: e.jsx(Hs, {}) }),
                                      e.jsx(At, {
                                        type: 'monotone',
                                        dataKey: 'calls',
                                        stroke: '#8884d8',
                                        fill: '#8884d8',
                                        fillOpacity: 0.6,
                                      }),
                                    ],
                                  }),
                                }),
                              }),
                            ],
                          }),
                          e.jsxs(j, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Mức độ hài lòng' }),
                                  e.jsx(M, {
                                    children: 'Điểm trung bình theo ngày',
                                  }),
                                ],
                              }),
                              e.jsx(g, {
                                children: e.jsx(Te, {
                                  width: '100%',
                                  height: 300,
                                  children: e.jsxs(ia, {
                                    data: a.dailyTrends,
                                    children: [
                                      e.jsx(ss, { strokeDasharray: '3 3' }),
                                      e.jsx(as, { dataKey: 'date' }),
                                      e.jsx(ts, { domain: [4, 5] }),
                                      e.jsx(Ae, { content: e.jsx(Hs, {}) }),
                                      e.jsx(ms, {
                                        type: 'monotone',
                                        dataKey: 'satisfaction',
                                        stroke: '#00C49F',
                                        strokeWidth: 2,
                                      }),
                                    ],
                                  }),
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    e.jsx(H, {
                      value: 'services',
                      className: 'space-y-4',
                      children: e.jsxs('div', {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
                        children: [
                          e.jsxs(j, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Phân bố dịch vụ' }),
                                  e.jsx(M, {
                                    children: 'Theo số lượng cuộc gọi',
                                  }),
                                ],
                              }),
                              e.jsx(g, {
                                children: e.jsx(Te, {
                                  width: '100%',
                                  height: 300,
                                  children: e.jsxs($s, {
                                    children: [
                                      e.jsx(Vs, {
                                        data: a.serviceDistribution,
                                        cx: '50%',
                                        cy: '50%',
                                        labelLine: !1,
                                        label: ({ name: m, percentage: x }) =>
                                          `${m} (${x}%)`,
                                        outerRadius: 80,
                                        fill: '#8884d8',
                                        dataKey: 'calls',
                                        children: a.serviceDistribution.map(
                                          (m, x) =>
                                            e.jsx(
                                              Gs,
                                              { fill: Ie[x % Ie.length] },
                                              `cell-${x}`
                                            )
                                        ),
                                      }),
                                      e.jsx(Ae, {}),
                                    ],
                                  }),
                                }),
                              }),
                            ],
                          }),
                          e.jsxs(j, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Top dịch vụ' }),
                                  e.jsx(M, {
                                    children: 'Xếp hạng theo lượng sử dụng',
                                  }),
                                ],
                              }),
                              e.jsx(g, {
                                children: e.jsx('div', {
                                  className: 'space-y-3',
                                  children: a.serviceDistribution.map((m, x) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className:
                                          'flex items-center justify-between',
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'flex items-center gap-3',
                                            children: [
                                              e.jsx('div', {
                                                className: 'w-4 h-4 rounded',
                                                style: {
                                                  backgroundColor:
                                                    Ie[x % Ie.length],
                                                },
                                              }),
                                              e.jsx('span', {
                                                className: 'font-medium',
                                                children: m.service,
                                              }),
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className: 'text-right',
                                            children: [
                                              e.jsxs('div', {
                                                className: 'font-semibold',
                                                children: [
                                                  m.calls,
                                                  ' cuộc gọi',
                                                ],
                                              }),
                                              e.jsxs('div', {
                                                className:
                                                  'text-sm text-gray-500',
                                                children: [m.percentage, '%'],
                                              }),
                                            ],
                                          }),
                                        ],
                                      },
                                      m.service
                                    )
                                  ),
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    e.jsx(H, {
                      value: 'activity',
                      className: 'space-y-4',
                      children: e.jsxs(j, {
                        children: [
                          e.jsxs(y, {
                            children: [
                              e.jsx(b, { children: 'Hoạt động theo giờ' }),
                              e.jsx(M, {
                                children: 'Phân bố cuộc gọi trong 24h',
                              }),
                            ],
                          }),
                          e.jsx(g, {
                            children: e.jsx(Te, {
                              width: '100%',
                              height: 400,
                              children: e.jsxs(Ua, {
                                data: a.hourlyActivity,
                                children: [
                                  e.jsx(ss, { strokeDasharray: '3 3' }),
                                  e.jsx(as, { dataKey: 'hour' }),
                                  e.jsx(ts, {}),
                                  e.jsx(Ae, { content: e.jsx(Hs, {}) }),
                                  e.jsx(Ka, {
                                    dataKey: 'calls',
                                    fill: '#8884d8',
                                  }),
                                ],
                              }),
                            }),
                          }),
                        ],
                      }),
                    }),
                    e.jsx(H, {
                      value: 'languages',
                      className: 'space-y-4',
                      children: e.jsxs('div', {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
                        children: [
                          e.jsxs(j, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Phân bố ngôn ngữ' }),
                                  e.jsx(M, {
                                    children: 'Tỷ lệ sử dụng các ngôn ngữ',
                                  }),
                                ],
                              }),
                              e.jsx(g, {
                                children: e.jsx(Te, {
                                  width: '100%',
                                  height: 300,
                                  children: e.jsxs($s, {
                                    children: [
                                      e.jsx(Vs, {
                                        data: a.languageDistribution,
                                        cx: '50%',
                                        cy: '50%',
                                        labelLine: !1,
                                        label: ({ name: m, percentage: x }) =>
                                          `${m} (${x}%)`,
                                        outerRadius: 80,
                                        fill: '#8884d8',
                                        dataKey: 'calls',
                                        children: a.languageDistribution.map(
                                          (m, x) =>
                                            e.jsx(
                                              Gs,
                                              { fill: Ie[x % Ie.length] },
                                              `cell-${x}`
                                            )
                                        ),
                                      }),
                                      e.jsx(Ae, {}),
                                    ],
                                  }),
                                }),
                              }),
                            ],
                          }),
                          e.jsxs(j, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Thống kê ngôn ngữ' }),
                                  e.jsx(M, { children: 'Chi tiết sử dụng' }),
                                ],
                              }),
                              e.jsx(g, {
                                children: e.jsx('div', {
                                  className: 'space-y-4',
                                  children: a.languageDistribution.map((m, x) =>
                                    e.jsxs(
                                      'div',
                                      {
                                        className: 'space-y-2',
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'flex justify-between items-center',
                                            children: [
                                              e.jsx('span', {
                                                className: 'font-medium',
                                                children: m.language,
                                              }),
                                              e.jsxs('span', {
                                                className:
                                                  'text-sm text-gray-500',
                                                children: [
                                                  m.calls,
                                                  ' cuộc gọi (',
                                                  m.percentage,
                                                  '%)',
                                                ],
                                              }),
                                            ],
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'w-full bg-gray-200 rounded-full h-2',
                                            children: e.jsx('div', {
                                              className: 'h-2 rounded-full',
                                              style: {
                                                width: `${m.percentage}%`,
                                                backgroundColor:
                                                  Ie[x % Ie.length],
                                              },
                                            }),
                                          }),
                                        ],
                                      },
                                      m.language
                                    )
                                  ),
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 lg:grid-cols-3 gap-4',
                  children: [
                    e.jsxs(j, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Ngôn ngữ phổ biến' }),
                        }),
                        e.jsx(g, {
                          children: e.jsx('div', {
                            className: 'flex flex-wrap gap-2',
                            children: a.overview.topLanguages.map((m, x) =>
                              e.jsx(R, { variant: 'secondary', children: m }, m)
                            ),
                          }),
                        }),
                      ],
                    }),
                    e.jsxs(j, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Giờ cao điểm' }),
                        }),
                        e.jsx(g, {
                          children: e.jsxs('div', {
                            className: 'space-y-2',
                            children: [
                              e.jsxs('div', {
                                className: 'flex justify-between',
                                children: [
                                  e.jsx('span', { children: 'Sáng:' }),
                                  e.jsx('span', {
                                    className: 'font-medium',
                                    children: '08:00 - 12:00',
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'flex justify-between',
                                children: [
                                  e.jsx('span', { children: 'Chiều:' }),
                                  e.jsx('span', {
                                    className: 'font-medium',
                                    children: '14:00 - 18:00',
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'flex justify-between',
                                children: [
                                  e.jsx('span', { children: 'Tối:' }),
                                  e.jsx('span', {
                                    className: 'font-medium',
                                    children: '19:00 - 21:00',
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    e.jsxs(j, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Xu hướng' }),
                        }),
                        e.jsx(g, {
                          children: e.jsxs('div', {
                            className: 'space-y-2',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  e.jsx(he, {
                                    className: 'h-4 w-4 text-green-500',
                                  }),
                                  e.jsx('span', {
                                    className: 'text-sm',
                                    children: 'Tăng trưởng 15.3%',
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  e.jsx(he, {
                                    className: 'h-4 w-4 text-green-500',
                                  }),
                                  e.jsx('span', {
                                    className: 'text-sm',
                                    children: 'Thời gian gọi tăng',
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  e.jsx(he, {
                                    className: 'h-4 w-4 text-green-500',
                                  }),
                                  e.jsx('span', {
                                    className: 'text-sm',
                                    children: 'Hài lòng cải thiện',
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          : e.jsx('div', {
              className: 'text-center py-8',
              children: e.jsx('p', {
                className: 'text-gray-500',
                children: 'Không thể tải dữ liệu analytics',
              }),
            })
    );
  },
  Ds = {
    'hotel-manager': {
      label: 'Quản lý khách sạn',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: e.jsx(re, { className: 'h-3 w-3' }),
      description: 'Quyền truy cập đầy đủ',
    },
    'front-desk': {
      label: 'Lễ tân',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: e.jsx(ge, { className: 'h-3 w-3' }),
      description: 'Quản lý yêu cầu khách hàng',
    },
    'it-manager': {
      label: 'Quản lý IT',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: e.jsx(De, { className: 'h-3 w-3' }),
      description: 'Quản lý hệ thống kỹ thuật',
    },
  },
  ua = ({
    isOpen: s,
    onClose: a,
    onSubmit: r,
    staff: t = null,
    loading: n = !1,
  }) => {
    const l = !!t,
      [i, c] = o.useState({
        username: t?.username || '',
        email: t?.email || '',
        displayName: t?.displayName || '',
        role: t?.role || 'front-desk',
        password: '',
        confirmPassword: '',
        isActive: t?.isActive ?? !0,
      }),
      [u, d] = o.useState({}),
      [w, m] = o.useState(!1);
    o.useEffect(() => {
      s &&
        (c({
          username: t?.username || '',
          email: t?.email || '',
          displayName: t?.displayName || '',
          role: t?.role || 'front-desk',
          password: '',
          confirmPassword: '',
          isActive: t?.isActive ?? !0,
        }),
        d({}));
    }, [s, t]);
    const x = () => {
        const S = {};
        return (
          i.username.trim()
            ? i.username.length < 3 &&
              (S.username = 'Tên đăng nhập phải có ít nhất 3 ký tự')
            : (S.username = 'Tên đăng nhập là bắt buộc'),
          i.email.trim()
            ? /\S+@\S+\.\S+/.test(i.email) || (S.email = 'Email không hợp lệ')
            : (S.email = 'Email là bắt buộc'),
          i.displayName.trim() || (S.displayName = 'Tên hiển thị là bắt buộc'),
          l ||
            (i.password
              ? i.password.length < 6 &&
                (S.password = 'Mật khẩu phải có ít nhất 6 ký tự')
              : (S.password = 'Mật khẩu là bắt buộc'),
            i.password !== i.confirmPassword &&
              (S.confirmPassword = 'Mật khẩu xác nhận không khớp')),
          d(S),
          Object.keys(S).length === 0
        );
      },
      L = S => {
        (S.preventDefault(), x() && r(i));
      };
    return e.jsx(ze, {
      open: s,
      onOpenChange: a,
      children: e.jsxs(Be, {
        className: 'max-w-md',
        children: [
          e.jsxs(Ue, {
            children: [
              e.jsx(Ke, {
                children: l ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới',
              }),
              e.jsx(We, {
                children: l
                  ? 'Cập nhật thông tin nhân viên'
                  : 'Tạo tài khoản nhân viên mới',
              }),
            ],
          }),
          e.jsxs('form', {
            onSubmit: L,
            className: 'space-y-4',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'username', children: 'Tên đăng nhập' }),
                  e.jsx(C, {
                    id: 'username',
                    value: i.username,
                    onChange: S => c(k => ({ ...k, username: S.target.value })),
                    className: u.username ? 'border-red-500' : '',
                    disabled: l,
                  }),
                  u.username &&
                    e.jsx('p', {
                      className: 'text-red-500 text-sm mt-1',
                      children: u.username,
                    }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'email', children: 'Email' }),
                  e.jsx(C, {
                    id: 'email',
                    type: 'email',
                    value: i.email,
                    onChange: S => c(k => ({ ...k, email: S.target.value })),
                    className: u.email ? 'border-red-500' : '',
                  }),
                  u.email &&
                    e.jsx('p', {
                      className: 'text-red-500 text-sm mt-1',
                      children: u.email,
                    }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, {
                    htmlFor: 'displayName',
                    children: 'Tên hiển thị',
                  }),
                  e.jsx(C, {
                    id: 'displayName',
                    value: i.displayName,
                    onChange: S =>
                      c(k => ({ ...k, displayName: S.target.value })),
                    className: u.displayName ? 'border-red-500' : '',
                  }),
                  u.displayName &&
                    e.jsx('p', {
                      className: 'text-red-500 text-sm mt-1',
                      children: u.displayName,
                    }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'role', children: 'Vai trò' }),
                  e.jsxs(Q, {
                    value: i.role,
                    onValueChange: S => c(k => ({ ...k, role: S })),
                    children: [
                      e.jsx(W, { children: e.jsx(X, {}) }),
                      e.jsx(Y, {
                        children: Object.entries(Ds).map(([S, k]) =>
                          e.jsx(
                            N,
                            {
                              value: S,
                              children: e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  k.icon,
                                  e.jsx('span', { children: k.label }),
                                ],
                              }),
                            },
                            S
                          )
                        ),
                      }),
                    ],
                  }),
                ],
              }),
              !l &&
                e.jsxs(e.Fragment, {
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { htmlFor: 'password', children: 'Mật khẩu' }),
                        e.jsxs('div', {
                          className: 'relative',
                          children: [
                            e.jsx(C, {
                              id: 'password',
                              type: w ? 'text' : 'password',
                              value: i.password,
                              onChange: S =>
                                c(k => ({ ...k, password: S.target.value })),
                              className: u.password ? 'border-red-500' : '',
                            }),
                            e.jsx(p, {
                              type: 'button',
                              variant: 'ghost',
                              size: 'sm',
                              className:
                                'absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent',
                              onClick: () => m(!w),
                              children: w
                                ? e.jsx(La, { className: 'h-4 w-4' })
                                : e.jsx(He, { className: 'h-4 w-4' }),
                            }),
                          ],
                        }),
                        u.password &&
                          e.jsx('p', {
                            className: 'text-red-500 text-sm mt-1',
                            children: u.password,
                          }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'confirmPassword',
                          children: 'Xác nhận mật khẩu',
                        }),
                        e.jsx(C, {
                          id: 'confirmPassword',
                          type: 'password',
                          value: i.confirmPassword,
                          onChange: S =>
                            c(k => ({ ...k, confirmPassword: S.target.value })),
                          className: u.confirmPassword ? 'border-red-500' : '',
                        }),
                        u.confirmPassword &&
                          e.jsx('p', {
                            className: 'text-red-500 text-sm mt-1',
                            children: u.confirmPassword,
                          }),
                      ],
                    }),
                  ],
                }),
              e.jsxs('div', {
                className: 'flex items-center space-x-2',
                children: [
                  e.jsx('input', {
                    type: 'checkbox',
                    id: 'isActive',
                    checked: i.isActive,
                    onChange: S =>
                      c(k => ({ ...k, isActive: S.target.checked })),
                    className:
                      'rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                  }),
                  e.jsx(h, {
                    htmlFor: 'isActive',
                    children: 'Tài khoản hoạt động',
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex justify-end gap-2 pt-4',
                children: [
                  e.jsx(p, {
                    type: 'button',
                    variant: 'outline',
                    onClick: a,
                    children: 'Hủy',
                  }),
                  e.jsxs(p, {
                    type: 'submit',
                    disabled: n,
                    children: [
                      n
                        ? e.jsx(B, { className: 'h-4 w-4 mr-2 animate-spin' })
                        : e.jsx(js, { className: 'h-4 w-4 mr-2' }),
                      l ? 'Cập nhật' : 'Tạo tài khoản',
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  un = ({ staff: s, isOpen: a, onClose: r }) => {
    if (!s) return null;
    const t = Ds[s.role];
    return e.jsx(ze, {
      open: a,
      onOpenChange: r,
      children: e.jsxs(Be, {
        className: 'max-w-lg',
        children: [
          e.jsxs(Ue, {
            children: [
              e.jsxs(Ke, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(re, { className: 'h-5 w-5' }),
                  'Quyền hạn của ',
                  s.displayName,
                ],
              }),
              e.jsx(We, { children: 'Chi tiết quyền truy cập và vai trò' }),
            ],
          }),
          e.jsxs('div', {
            className: 'space-y-4',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx(h, { children: 'Vai trò' }),
                  e.jsxs(R, {
                    variant: 'outline',
                    className: $('mt-1', t.color),
                    children: [
                      t.icon,
                      e.jsx('span', { className: 'ml-1', children: t.label }),
                    ],
                  }),
                  e.jsx('p', {
                    className: 'text-sm text-gray-600 mt-1',
                    children: t.description,
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsxs(h, {
                    children: ['Quyền hạn (', s.permissions.length, ')'],
                  }),
                  e.jsx('div', {
                    className:
                      'mt-2 max-h-48 overflow-y-auto border rounded-lg p-3',
                    children: e.jsx('div', {
                      className: 'grid grid-cols-1 gap-1',
                      children: s.permissions.map(n =>
                        e.jsxs(
                          'div',
                          {
                            className: 'flex items-center gap-2 text-sm',
                            children: [
                              e.jsx(Aa, { className: 'h-3 w-3 text-gray-400' }),
                              e.jsx('span', {
                                className: 'font-mono text-xs',
                                children: n,
                              }),
                            ],
                          },
                          n
                        )
                      ),
                    }),
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'flex justify-end',
                children: e.jsx(p, { onClick: r, children: 'Đóng' }),
              }),
            ],
          }),
        ],
      }),
    });
  },
  nl = () => {
    const { user: s } = pe(),
      [a, r] = o.useState([]),
      [t, n] = o.useState(!0),
      [l, i] = o.useState(''),
      [c, u] = o.useState('all'),
      [d, w] = o.useState('all'),
      [m, x] = o.useState(!1),
      [L, S] = o.useState(!1),
      [k, ee] = o.useState(!1),
      [se, te] = o.useState(null),
      [ne, T] = o.useState(!1),
      J = [
        {
          id: '1',
          username: 'manager',
          email: 'manager@hotel.com',
          displayName: 'Hotel Manager',
          role: 'hotel-manager',
          permissions: [
            'dashboard:view',
            'analytics:view_advanced',
            'staff:manage',
            'settings:manage',
          ],
          isActive: !0,
          lastLogin: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          username: 'frontdesk',
          email: 'frontdesk@hotel.com',
          displayName: 'Front Desk Staff',
          role: 'front-desk',
          permissions: [
            'dashboard:view',
            'requests:view',
            'calls:view',
            'guests:manage',
          ],
          isActive: !0,
          lastLogin: '2024-01-15T09:15:00Z',
          createdAt: '2024-01-02T10:00:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
        },
        {
          id: '3',
          username: 'itmanager',
          email: 'it@hotel.com',
          displayName: 'IT Manager',
          role: 'it-manager',
          permissions: [
            'dashboard:view',
            'system:monitor',
            'logs:view',
            'security:manage',
          ],
          isActive: !0,
          lastLogin: '2024-01-14T16:45:00Z',
          createdAt: '2024-01-03T11:00:00Z',
          updatedAt: '2024-01-14T16:45:00Z',
        },
        {
          id: '4',
          username: 'receptionist2',
          email: 'receptionist2@hotel.com',
          displayName: 'Receptionist 2',
          role: 'front-desk',
          permissions: ['dashboard:view', 'requests:view', 'calls:view'],
          isActive: !1,
          lastLogin: '2024-01-10T14:20:00Z',
          createdAt: '2024-01-05T08:30:00Z',
          updatedAt: '2024-01-10T14:20:00Z',
        },
      ],
      D = async () => {
        try {
          (n(!0),
            setTimeout(() => {
              (r(J), n(!1));
            }, 1e3));
        } catch (I) {
          (console.error('Failed to fetch staff:', I), n(!1));
        }
      },
      _ = async I => {
        try {
          if ((T(!0), await new Promise(v => setTimeout(v, 1e3)), se))
            (r(v =>
              v.map(q =>
                q.id === se.id
                  ? { ...q, ...I, updatedAt: new Date().toISOString() }
                  : q
              )
            ),
              S(!1));
          else {
            const v = {
              id: Date.now().toString(),
              ...I,
              permissions: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            (r(q => [...q, v]), x(!1));
          }
          te(null);
        } catch (v) {
          console.error('Failed to save staff:', v);
        } finally {
          T(!1);
        }
      },
      V = async I => {
        try {
          (await new Promise(v => setTimeout(v, 500)),
            r(v => v.filter(q => q.id !== I)));
        } catch (v) {
          console.error('Failed to delete staff:', v);
        }
      },
      de = async I => {
        try {
          r(v =>
            v.map(q =>
              q.id === I
                ? {
                    ...q,
                    isActive: !q.isActive,
                    updatedAt: new Date().toISOString(),
                  }
                : q
            )
          );
        } catch (v) {
          console.error('Failed to toggle staff status:', v);
        }
      },
      ie = a.filter(I => {
        const v =
            I.displayName.toLowerCase().includes(l.toLowerCase()) ||
            I.username.toLowerCase().includes(l.toLowerCase()) ||
            I.email.toLowerCase().includes(l.toLowerCase()),
          q = c === 'all' || I.role === c,
          G =
            d === 'all' ||
            (d === 'active' && I.isActive) ||
            (d === 'inactive' && !I.isActive);
        return v && q && G;
      });
    return (
      o.useEffect(() => {
        D();
      }, []),
      e.jsxs('div', {
        className: 'space-y-6',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('h1', {
                    className: 'text-2xl font-bold',
                    children: 'Quản lý nhân viên',
                  }),
                  e.jsx('p', {
                    className: 'text-gray-600',
                    children:
                      'Thêm, sửa, xóa tài khoản nhân viên và quản lý quyền hạn',
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex gap-2',
                children: [
                  e.jsxs(p, {
                    variant: 'outline',
                    onClick: D,
                    disabled: t,
                    children: [
                      e.jsx(B, {
                        className: $('h-4 w-4 mr-2', t && 'animate-spin'),
                      }),
                      'Làm mới',
                    ],
                  }),
                  e.jsxs(p, {
                    onClick: () => x(!0),
                    children: [
                      e.jsx(js, { className: 'h-4 w-4 mr-2' }),
                      'Thêm nhân viên',
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-4 gap-4',
            children: [
              e.jsx(j, {
                children: e.jsx(g, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ge, { className: 'h-5 w-5 text-blue-500' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm font-medium',
                            children: 'Tổng nhân viên',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: a.length,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              e.jsx(j, {
                children: e.jsx(g, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(Es, { className: 'h-5 w-5 text-green-500' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm font-medium',
                            children: 'Đang hoạt động',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: a.filter(I => I.isActive).length,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              e.jsx(j, {
                children: e.jsx(g, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(re, { className: 'h-5 w-5 text-blue-500' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm font-medium',
                            children: 'Quản lý',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: a.filter(I => I.role === 'hotel-manager')
                              .length,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              e.jsx(j, {
                children: e.jsx(g, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ge, { className: 'h-5 w-5 text-green-500' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm font-medium',
                            children: 'Lễ tân',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: a.filter(I => I.role === 'front-desk')
                              .length,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
            ],
          }),
          e.jsxs(j, {
            children: [
              e.jsx(y, {
                children: e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [e.jsx(Js, { className: 'h-5 w-5' }), 'Bộ lọc'],
                }),
              }),
              e.jsx(g, {
                children: e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-3 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Tìm kiếm' }),
                        e.jsxs('div', {
                          className: 'relative',
                          children: [
                            e.jsx(Me, {
                              className:
                                'absolute left-3 top-3 h-4 w-4 text-gray-400',
                            }),
                            e.jsx(C, {
                              placeholder: 'Tên, username, email...',
                              value: l,
                              onChange: I => i(I.target.value),
                              className: 'pl-10',
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Vai trò' }),
                        e.jsxs(Q, {
                          value: c,
                          onValueChange: u,
                          children: [
                            e.jsx(W, { children: e.jsx(X, {}) }),
                            e.jsxs(Y, {
                              children: [
                                e.jsx(N, {
                                  value: 'all',
                                  children: 'Tất cả vai trò',
                                }),
                                Object.entries(Ds).map(([I, v]) =>
                                  e.jsx(N, { value: I, children: v.label }, I)
                                ),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Trạng thái' }),
                        e.jsxs(Q, {
                          value: d,
                          onValueChange: w,
                          children: [
                            e.jsx(W, { children: e.jsx(X, {}) }),
                            e.jsxs(Y, {
                              children: [
                                e.jsx(N, { value: 'all', children: 'Tất cả' }),
                                e.jsx(N, {
                                  value: 'active',
                                  children: 'Hoạt động',
                                }),
                                e.jsx(N, {
                                  value: 'inactive',
                                  children: 'Ngưng hoạt động',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
          e.jsxs(j, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Danh sách nhân viên' }),
                  e.jsxs(M, {
                    children: [
                      'Hiển thị ',
                      ie.length,
                      ' / ',
                      a.length,
                      ' nhân viên',
                    ],
                  }),
                ],
              }),
              e.jsx(g, {
                children: t
                  ? e.jsxs('div', {
                      className: 'text-center py-8',
                      children: [
                        e.jsx(B, {
                          className: 'h-8 w-8 animate-spin mx-auto mb-4',
                        }),
                        e.jsx('p', { children: 'Đang tải...' }),
                      ],
                    })
                  : e.jsx('div', {
                      className: 'overflow-x-auto',
                      children: e.jsxs(Re, {
                        children: [
                          e.jsx(Ee, {
                            children: e.jsxs(ce, {
                              children: [
                                e.jsx(F, { children: 'Nhân viên' }),
                                e.jsx(F, { children: 'Vai trò' }),
                                e.jsx(F, { children: 'Trạng thái' }),
                                e.jsx(F, { children: 'Lần đăng nhập cuối' }),
                                e.jsx(F, { children: 'Thao tác' }),
                              ],
                            }),
                          }),
                          e.jsx(qe, {
                            children: ie.map(I => {
                              const v = Ds[I.role];
                              return e.jsxs(
                                ce,
                                {
                                  children: [
                                    e.jsx(P, {
                                      children: e.jsxs('div', {
                                        className: 'flex items-center gap-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center',
                                            children: e.jsx(ge, {
                                              className:
                                                'h-5 w-5 text-gray-500',
                                            }),
                                          }),
                                          e.jsxs('div', {
                                            children: [
                                              e.jsx('div', {
                                                className: 'font-medium',
                                                children: I.displayName,
                                              }),
                                              e.jsxs('div', {
                                                className:
                                                  'text-sm text-gray-500',
                                                children: [
                                                  '@',
                                                  I.username,
                                                  ' • ',
                                                  I.email,
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsxs(R, {
                                        variant: 'outline',
                                        className: v.color,
                                        children: [
                                          v.icon,
                                          e.jsx('span', {
                                            className: 'ml-1',
                                            children: v.label,
                                          }),
                                        ],
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsx(R, {
                                        variant: I.isActive
                                          ? 'default'
                                          : 'secondary',
                                        children: I.isActive
                                          ? e.jsxs(e.Fragment, {
                                              children: [
                                                e.jsx(Es, {
                                                  className: 'h-3 w-3 mr-1',
                                                }),
                                                'Hoạt động',
                                              ],
                                            })
                                          : e.jsxs(e.Fragment, {
                                              children: [
                                                e.jsx(gs, {
                                                  className: 'h-3 w-3 mr-1',
                                                }),
                                                'Ngưng',
                                              ],
                                            }),
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsx('div', {
                                        className: 'text-sm',
                                        children: I.lastLogin
                                          ? e.jsxs(e.Fragment, {
                                              children: [
                                                e.jsx('div', {
                                                  children: new Date(
                                                    I.lastLogin
                                                  ).toLocaleDateString(),
                                                }),
                                                e.jsx('div', {
                                                  className: 'text-gray-500',
                                                  children: new Date(
                                                    I.lastLogin
                                                  ).toLocaleTimeString(),
                                                }),
                                              ],
                                            })
                                          : e.jsx('span', {
                                              className: 'text-gray-400',
                                              children: 'Chưa đăng nhập',
                                            }),
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsxs('div', {
                                        className: 'flex gap-2',
                                        children: [
                                          e.jsx(p, {
                                            variant: 'ghost',
                                            size: 'sm',
                                            onClick: () => {
                                              (te(I), ee(!0));
                                            },
                                            children: e.jsx(re, {
                                              className: 'h-4 w-4',
                                            }),
                                          }),
                                          e.jsx(p, {
                                            variant: 'ghost',
                                            size: 'sm',
                                            onClick: () => {
                                              (te(I), S(!0));
                                            },
                                            children: e.jsx(_e, {
                                              className: 'h-4 w-4',
                                            }),
                                          }),
                                          e.jsx(p, {
                                            variant: 'ghost',
                                            size: 'sm',
                                            onClick: () => de(I.id),
                                            children: I.isActive
                                              ? e.jsx(gs, {
                                                  className: 'h-4 w-4',
                                                })
                                              : e.jsx(Es, {
                                                  className: 'h-4 w-4',
                                                }),
                                          }),
                                          e.jsxs(Fa, {
                                            children: [
                                              e.jsx(Pa, {
                                                asChild: !0,
                                                children: e.jsx(p, {
                                                  variant: 'ghost',
                                                  size: 'sm',
                                                  children: e.jsx(Ze, {
                                                    className: 'h-4 w-4',
                                                  }),
                                                }),
                                              }),
                                              e.jsxs(Ma, {
                                                children: [
                                                  e.jsxs(Ra, {
                                                    children: [
                                                      e.jsx(Ea, {
                                                        children:
                                                          'Xác nhận xóa',
                                                      }),
                                                      e.jsxs(qa, {
                                                        children: [
                                                          'Bạn có chắc muốn xóa nhân viên "',
                                                          I.displayName,
                                                          '"? Hành động này không thể hoàn tác.',
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsxs(Oa, {
                                                    children: [
                                                      e.jsx(Ha, {
                                                        children: 'Hủy',
                                                      }),
                                                      e.jsx(za, {
                                                        onClick: () => V(I.id),
                                                        className:
                                                          'bg-red-600 hover:bg-red-700',
                                                        children: 'Xóa',
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    }),
                                  ],
                                },
                                I.id
                              );
                            }),
                          }),
                        ],
                      }),
                    }),
              }),
            ],
          }),
          e.jsx(ua, {
            isOpen: m,
            onClose: () => x(!1),
            onSubmit: _,
            loading: ne,
          }),
          e.jsx(ua, {
            isOpen: L,
            onClose: () => {
              (S(!1), te(null));
            },
            onSubmit: _,
            staff: se,
            loading: ne,
          }),
          e.jsx(un, {
            staff: se,
            isOpen: k,
            onClose: () => {
              (ee(!1), te(null));
            },
          }),
        ],
      })
    );
  },
  ja = {
    cpu: { usage: 45.2, cores: 4, temperature: 62, processes: 156 },
    memory: { used: 6.8, total: 16, available: 9.2, usage: 42.5 },
    disk: { used: 85.4, total: 500, available: 414.6, usage: 17.1 },
    network: {
      downloadSpeed: 125.5,
      uploadSpeed: 25.2,
      latency: 12,
      status: 'connected',
    },
    database: {
      connections: 15,
      queries: 1250,
      responseTime: 45,
      status: 'healthy',
    },
    services: [
      {
        name: 'Hotel API',
        status: 'running',
        uptime: '15d 4h 23m',
        memory: 256,
        cpu: 12.5,
      },
      {
        name: 'Database',
        status: 'running',
        uptime: '15d 4h 23m',
        memory: 512,
        cpu: 8.2,
      },
      {
        name: 'Web Server',
        status: 'running',
        uptime: '15d 4h 23m',
        memory: 128,
        cpu: 5.1,
      },
      {
        name: 'Socket Server',
        status: 'running',
        uptime: '15d 4h 23m',
        memory: 64,
        cpu: 3.8,
      },
      {
        name: 'Email Service',
        status: 'error',
        uptime: '0d 0h 0m',
        memory: 0,
        cpu: 0,
      },
    ],
  },
  ga = [
    {
      id: '1',
      type: 'error',
      title: 'Email Service Down',
      message: 'Email service has been down for 2 hours',
      timestamp: '2024-01-15T10:30:00Z',
      resolved: !1,
    },
    {
      id: '2',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'System memory usage is above 80%',
      timestamp: '2024-01-15T09:15:00Z',
      resolved: !1,
    },
    {
      id: '3',
      type: 'info',
      title: 'Database Backup Completed',
      message: 'Daily database backup completed successfully',
      timestamp: '2024-01-15T02:00:00Z',
      resolved: !0,
    },
  ],
  pa = [
    {
      id: '1',
      timestamp: '2024-01-15T10:35:22Z',
      level: 'ERROR',
      service: 'EmailService',
      message: 'Failed to connect to SMTP server',
      details: 'Connection timeout after 30 seconds',
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:30:15Z',
      level: 'WARN',
      service: 'HotelAPI',
      message: 'High response time detected',
      details: 'Average response time: 2.5s (threshold: 1s)',
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:25:08Z',
      level: 'INFO',
      service: 'Database',
      message: 'Query executed successfully',
      details: 'SELECT * FROM requests - 156 rows returned',
    },
    {
      id: '4',
      timestamp: '2024-01-15T10:20:03Z',
      level: 'DEBUG',
      service: 'WebServer',
      message: 'Static file served',
      details: 'GET /assets/logo.png - 200 OK',
    },
  ],
  jn = [
    { time: '00:00', cpu: 35, memory: 40, disk: 15 },
    { time: '04:00', cpu: 28, memory: 35, disk: 15 },
    { time: '08:00', cpu: 45, memory: 50, disk: 18 },
    { time: '12:00', cpu: 65, memory: 60, disk: 22 },
    { time: '16:00', cpu: 55, memory: 58, disk: 20 },
    { time: '20:00', cpu: 42, memory: 45, disk: 17 },
    { time: '24:00', cpu: 35, memory: 40, disk: 15 },
  ],
  gn = ({ metrics: s }) => {
    const a = t =>
        t < 50 ? 'text-green-600' : t < 80 ? 'text-yellow-600' : 'text-red-600',
      r = t => {
        switch (t) {
          case 'running':
          case 'connected':
          case 'healthy':
            return e.jsx(oe, { className: 'h-4 w-4 text-green-500' });
          case 'error':
            return e.jsx(Ns, { className: 'h-4 w-4 text-red-500' });
          case 'stopped':
            return e.jsx(ls, { className: 'h-4 w-4 text-yellow-500' });
          default:
            return e.jsx(ae, { className: 'h-4 w-4 text-gray-500' });
        }
      };
    return e.jsxs('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      children: [
        e.jsx(j, {
          children: e.jsxs(g, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(mt, { className: 'h-5 w-5 text-blue-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'CPU',
                      }),
                    ],
                  }),
                  e.jsxs('span', {
                    className: $('text-lg font-bold', a(s.cpu.usage)),
                    children: [s.cpu.usage, '%'],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'text-sm text-gray-500 space-y-1',
                children: [
                  e.jsxs('div', { children: ['Cores: ', s.cpu.cores] }),
                  e.jsxs('div', {
                    children: ['Temperature: ', s.cpu.temperature, '°C'],
                  }),
                  e.jsxs('div', { children: ['Processes: ', s.cpu.processes] }),
                ],
              }),
            ],
          }),
        }),
        e.jsx(j, {
          children: e.jsxs(g, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(aa, { className: 'h-5 w-5 text-green-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'Memory',
                      }),
                    ],
                  }),
                  e.jsxs('span', {
                    className: $('text-lg font-bold', a(s.memory.usage)),
                    children: [s.memory.usage, '%'],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'text-sm text-gray-500 space-y-1',
                children: [
                  e.jsxs('div', { children: ['Used: ', s.memory.used, 'GB'] }),
                  e.jsxs('div', {
                    children: ['Total: ', s.memory.total, 'GB'],
                  }),
                  e.jsxs('div', {
                    children: ['Available: ', s.memory.available, 'GB'],
                  }),
                ],
              }),
            ],
          }),
        }),
        e.jsx(j, {
          children: e.jsxs(g, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ps, { className: 'h-5 w-5 text-purple-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'Disk',
                      }),
                    ],
                  }),
                  e.jsxs('span', {
                    className: $('text-lg font-bold', a(s.disk.usage)),
                    children: [s.disk.usage, '%'],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'text-sm text-gray-500 space-y-1',
                children: [
                  e.jsxs('div', { children: ['Used: ', s.disk.used, 'GB'] }),
                  e.jsxs('div', { children: ['Total: ', s.disk.total, 'GB'] }),
                  e.jsxs('div', {
                    children: ['Available: ', s.disk.available, 'GB'],
                  }),
                ],
              }),
            ],
          }),
        }),
        e.jsx(j, {
          children: e.jsxs(g, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(Ws, { className: 'h-5 w-5 text-blue-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'Network',
                      }),
                    ],
                  }),
                  r(s.network.status),
                ],
              }),
              e.jsxs('div', {
                className: 'text-sm text-gray-500 space-y-1',
                children: [
                  e.jsxs('div', {
                    children: ['Download: ', s.network.downloadSpeed, ' Mbps'],
                  }),
                  e.jsxs('div', {
                    children: ['Upload: ', s.network.uploadSpeed, ' Mbps'],
                  }),
                  e.jsxs('div', {
                    children: ['Latency: ', s.network.latency, 'ms'],
                  }),
                ],
              }),
            ],
          }),
        }),
        e.jsx(j, {
          children: e.jsxs(g, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ns, { className: 'h-5 w-5 text-green-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'Database',
                      }),
                    ],
                  }),
                  r(s.database.status),
                ],
              }),
              e.jsxs('div', {
                className: 'text-sm text-gray-500 space-y-1',
                children: [
                  e.jsxs('div', {
                    children: ['Connections: ', s.database.connections],
                  }),
                  e.jsxs('div', {
                    children: ['Queries: ', s.database.queries],
                  }),
                  e.jsxs('div', {
                    children: ['Response: ', s.database.responseTime, 'ms'],
                  }),
                ],
              }),
            ],
          }),
        }),
        e.jsx(j, {
          children: e.jsxs(g, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(sa, { className: 'h-5 w-5 text-orange-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'Services',
                      }),
                    ],
                  }),
                  e.jsxs('span', {
                    className: 'text-lg font-bold text-green-600',
                    children: [
                      s.services.filter(t => t.status === 'running').length,
                      '/',
                      s.services.length,
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'text-sm text-gray-500 space-y-1',
                children: [
                  e.jsxs('div', {
                    children: [
                      'Running: ',
                      s.services.filter(t => t.status === 'running').length,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      'Stopped: ',
                      s.services.filter(t => t.status === 'stopped').length,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      'Error: ',
                      s.services.filter(t => t.status === 'error').length,
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  },
  pn = ({ alerts: s }) => {
    const a = n => {
        switch (n) {
          case 'error':
            return e.jsx(Ns, { className: 'h-4 w-4 text-red-500' });
          case 'warning':
            return e.jsx(ls, { className: 'h-4 w-4 text-yellow-500' });
          case 'info':
            return e.jsx(Us, { className: 'h-4 w-4 text-blue-500' });
          default:
            return e.jsx(ae, { className: 'h-4 w-4 text-gray-500' });
        }
      },
      r = n => {
        switch (n) {
          case 'error':
            return 'border-red-200 bg-red-50';
          case 'warning':
            return 'border-yellow-200 bg-yellow-50';
          case 'info':
            return 'border-blue-200 bg-blue-50';
          default:
            return 'border-gray-200 bg-gray-50';
        }
      },
      t = s.filter(n => !n.resolved);
    return e.jsx('div', {
      className: 'space-y-3',
      children:
        t.length === 0
          ? e.jsxs('div', {
              className: 'text-center py-8 text-gray-500',
              children: [
                e.jsx(oe, {
                  className: 'h-12 w-12 mx-auto mb-4 text-green-500',
                }),
                e.jsx('p', { children: 'Không có cảnh báo nào' }),
              ],
            })
          : t.map(n =>
              e.jsx(
                'div',
                {
                  className: $('border rounded-lg p-4', r(n.type)),
                  children: e.jsxs('div', {
                    className: 'flex items-start gap-3',
                    children: [
                      a(n.type),
                      e.jsxs('div', {
                        className: 'flex-1',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center justify-between mb-1',
                            children: [
                              e.jsx('h4', {
                                className: 'font-medium',
                                children: n.title,
                              }),
                              e.jsx('span', {
                                className: 'text-sm text-gray-500',
                                children: new Date(
                                  n.timestamp
                                ).toLocaleTimeString(),
                              }),
                            ],
                          }),
                          e.jsx('p', {
                            className: 'text-sm text-gray-600',
                            children: n.message,
                          }),
                        ],
                      }),
                    ],
                  }),
                },
                n.id
              )
            ),
    });
  },
  vn = ({ services: s }) => {
    const a = r => {
      switch (r) {
        case 'running':
          return e.jsx(R, {
            className: 'bg-green-100 text-green-800',
            children: 'Running',
          });
        case 'stopped':
          return e.jsx(R, {
            className: 'bg-gray-100 text-gray-800',
            children: 'Stopped',
          });
        case 'error':
          return e.jsx(R, {
            className: 'bg-red-100 text-red-800',
            children: 'Error',
          });
        default:
          return e.jsx(R, { variant: 'secondary', children: 'Unknown' });
      }
    };
    return e.jsx('div', {
      className: 'overflow-x-auto',
      children: e.jsxs('table', {
        className: 'w-full',
        children: [
          e.jsx('thead', {
            children: e.jsxs('tr', {
              className: 'border-b',
              children: [
                e.jsx('th', {
                  className: 'text-left p-3',
                  children: 'Service',
                }),
                e.jsx('th', { className: 'text-left p-3', children: 'Status' }),
                e.jsx('th', { className: 'text-left p-3', children: 'Uptime' }),
                e.jsx('th', { className: 'text-left p-3', children: 'Memory' }),
                e.jsx('th', { className: 'text-left p-3', children: 'CPU' }),
                e.jsx('th', {
                  className: 'text-left p-3',
                  children: 'Actions',
                }),
              ],
            }),
          }),
          e.jsx('tbody', {
            children: s.map((r, t) =>
              e.jsxs(
                'tr',
                {
                  className: 'border-b hover:bg-gray-50',
                  children: [
                    e.jsx('td', {
                      className: 'p-3 font-medium',
                      children: r.name,
                    }),
                    e.jsx('td', { className: 'p-3', children: a(r.status) }),
                    e.jsx('td', {
                      className: 'p-3 text-sm text-gray-600',
                      children: r.uptime,
                    }),
                    e.jsxs('td', {
                      className: 'p-3 text-sm',
                      children: [r.memory, 'MB'],
                    }),
                    e.jsxs('td', {
                      className: 'p-3 text-sm',
                      children: [r.cpu, '%'],
                    }),
                    e.jsx('td', {
                      className: 'p-3',
                      children: e.jsxs('div', {
                        className: 'flex gap-2',
                        children: [
                          e.jsx(p, {
                            variant: 'ghost',
                            size: 'sm',
                            children: e.jsx(He, { className: 'h-4 w-4' }),
                          }),
                          e.jsx(p, {
                            variant: 'ghost',
                            size: 'sm',
                            children: e.jsx(De, { className: 'h-4 w-4' }),
                          }),
                          e.jsx(p, {
                            variant: 'ghost',
                            size: 'sm',
                            children: e.jsx(B, { className: 'h-4 w-4' }),
                          }),
                        ],
                      }),
                    }),
                  ],
                },
                t
              )
            ),
          }),
        ],
      }),
    });
  },
  Nn = ({ logs: s }) => {
    const [a, r] = o.useState(null),
      t = n => {
        switch (n) {
          case 'ERROR':
            return 'bg-red-100 text-red-800';
          case 'WARN':
            return 'bg-yellow-100 text-yellow-800';
          case 'INFO':
            return 'bg-blue-100 text-blue-800';
          case 'DEBUG':
            return 'bg-gray-100 text-gray-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
      };
    return e.jsx('div', {
      className: 'space-y-2',
      children: s.map(n =>
        e.jsx(
          'div',
          {
            className: 'border rounded-lg p-3 hover:bg-gray-50',
            children: e.jsxs('div', {
              className: 'flex items-start gap-3',
              children: [
                e.jsx(R, {
                  variant: 'outline',
                  className: $('text-xs', t(n.level)),
                  children: n.level,
                }),
                e.jsxs('div', {
                  className: 'flex-1',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between mb-1',
                      children: [
                        e.jsx('span', {
                          className: 'font-medium text-sm',
                          children: n.service,
                        }),
                        e.jsx('span', {
                          className: 'text-xs text-gray-500',
                          children: new Date(n.timestamp).toLocaleString(),
                        }),
                      ],
                    }),
                    e.jsx('p', {
                      className: 'text-sm text-gray-700',
                      children: n.message,
                    }),
                    n.details &&
                      e.jsx('p', {
                        className: 'text-xs text-gray-500 mt-1 font-mono',
                        children: n.details,
                      }),
                  ],
                }),
              ],
            }),
          },
          n.id
        )
      ),
    });
  },
  ll = () => {
    const { user: s } = pe(),
      [a, r] = o.useState(ja),
      [t, n] = o.useState(ga),
      [l, i] = o.useState(pa),
      [c, u] = o.useState(!1),
      [d, w] = o.useState(!0),
      m = async () => {
        try {
          (u(!0),
            setTimeout(() => {
              (r(ja), n(ga), i(pa), u(!1));
            }, 1e3));
        } catch (x) {
          (console.error('Failed to fetch metrics:', x), u(!1));
        }
      };
    return (
      o.useEffect(() => {
        if ((m(), d)) {
          const x = setInterval(m, 3e4);
          return () => clearInterval(x);
        }
      }, [d]),
      e.jsxs('div', {
        className: 'space-y-6',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('h1', {
                    className: 'text-2xl font-bold',
                    children: 'Giám sát hệ thống',
                  }),
                  e.jsx('p', {
                    className: 'text-gray-600',
                    children: 'Theo dõi hiệu suất, trạng thái và logs hệ thống',
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex gap-2',
                children: [
                  e.jsxs(p, {
                    variant: 'outline',
                    onClick: () => w(!d),
                    className: d ? 'bg-green-50' : '',
                    children: [
                      e.jsx(Le, { className: 'h-4 w-4 mr-2' }),
                      d ? 'Auto ON' : 'Auto OFF',
                    ],
                  }),
                  e.jsxs(p, {
                    variant: 'outline',
                    onClick: m,
                    disabled: c,
                    children: [
                      e.jsx(B, {
                        className: $('h-4 w-4 mr-2', c && 'animate-spin'),
                      }),
                      'Làm mới',
                    ],
                  }),
                  e.jsxs(p, {
                    variant: 'outline',
                    children: [
                      e.jsx(Qe, { className: 'h-4 w-4 mr-2' }),
                      'Xuất báo cáo',
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsx(gn, { metrics: a }),
          e.jsxs(we, {
            defaultValue: 'performance',
            className: 'space-y-4',
            children: [
              e.jsxs(Ce, {
                className: 'grid w-full grid-cols-4',
                children: [
                  e.jsx(O, { value: 'performance', children: 'Hiệu suất' }),
                  e.jsx(O, { value: 'alerts', children: 'Cảnh báo' }),
                  e.jsx(O, { value: 'services', children: 'Dịch vụ' }),
                  e.jsx(O, { value: 'logs', children: 'Logs' }),
                ],
              }),
              e.jsx(H, {
                value: 'performance',
                className: 'space-y-4',
                children: e.jsxs(j, {
                  children: [
                    e.jsxs(y, {
                      children: [
                        e.jsx(b, { children: 'Hiệu suất hệ thống 24h' }),
                        e.jsx(M, { children: 'CPU, Memory và Disk usage' }),
                      ],
                    }),
                    e.jsx(g, {
                      children: e.jsx(Te, {
                        width: '100%',
                        height: 300,
                        children: e.jsxs(ia, {
                          data: jn,
                          children: [
                            e.jsx(ss, { strokeDasharray: '3 3' }),
                            e.jsx(as, { dataKey: 'time' }),
                            e.jsx(ts, {}),
                            e.jsx(Ae, {}),
                            e.jsx(ms, {
                              type: 'monotone',
                              dataKey: 'cpu',
                              stroke: '#8884d8',
                              strokeWidth: 2,
                            }),
                            e.jsx(ms, {
                              type: 'monotone',
                              dataKey: 'memory',
                              stroke: '#82ca9d',
                              strokeWidth: 2,
                            }),
                            e.jsx(ms, {
                              type: 'monotone',
                              dataKey: 'disk',
                              stroke: '#ffc658',
                              strokeWidth: 2,
                            }),
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              }),
              e.jsx(H, {
                value: 'alerts',
                className: 'space-y-4',
                children: e.jsxs(j, {
                  children: [
                    e.jsxs(y, {
                      children: [
                        e.jsxs(b, {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx(us, { className: 'h-5 w-5' }),
                            'Cảnh báo hệ thống',
                          ],
                        }),
                        e.jsxs(M, {
                          children: [
                            t.filter(x => !x.resolved).length,
                            ' cảnh báo chưa xử lý',
                          ],
                        }),
                      ],
                    }),
                    e.jsx(g, { children: e.jsx(pn, { alerts: t }) }),
                  ],
                }),
              }),
              e.jsx(H, {
                value: 'services',
                className: 'space-y-4',
                children: e.jsxs(j, {
                  children: [
                    e.jsxs(y, {
                      children: [
                        e.jsx(b, { children: 'Dịch vụ hệ thống' }),
                        e.jsx(M, {
                          children: 'Trạng thái và hiệu suất các dịch vụ',
                        }),
                      ],
                    }),
                    e.jsx(g, { children: e.jsx(vn, { services: a.services }) }),
                  ],
                }),
              }),
              e.jsx(H, {
                value: 'logs',
                className: 'space-y-4',
                children: e.jsxs(j, {
                  children: [
                    e.jsxs(y, {
                      children: [
                        e.jsxs(b, {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx(xt, { className: 'h-5 w-5' }),
                            'System Logs',
                          ],
                        }),
                        e.jsx(M, { children: 'Logs hệ thống gần đây' }),
                      ],
                    }),
                    e.jsx(g, { children: e.jsx(Nn, { logs: l }) }),
                  ],
                }),
              }),
            ],
          }),
        ],
      })
    );
  },
  il = () => {
    const { user: s } = pe(),
      [a, r] = o.useState(!1),
      [t, n] = o.useState('idle'),
      [l, i] = o.useState({
        hotelName: 'Minh Hồng Hotel',
        description: 'Premium hotel with AI-powered guest services',
        address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
        phone: '+84 28 3823 4567',
        email: 'info@minhhonghotel.com',
        website: 'https://minhhonghotel.com',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi',
        currency: 'VND',
      }),
      [c, u] = o.useState({
        enabled: !0,
        name: 'Minh Hồng Assistant',
        language: 'vi',
        responseDelay: 500,
        enableSmallTalk: !0,
        enableTranscription: !0,
        confidenceThreshold: 0.8,
        customInstructions:
          'Bạn là trợ lý AI của khách sạn Minh Hồng. Luôn lịch sự, nhiệt tình và chuyên nghiệp.',
      }),
      [d, w] = o.useState({
        emailNotifications: !0,
        smsNotifications: !1,
        pushNotifications: !0,
        newRequestAlert: !0,
        systemAlerts: !0,
        dailyReports: !0,
      }),
      m = async () => {
        (r(!0), n('saving'));
        try {
          (await new Promise(x => setTimeout(x, 1e3)),
            n('success'),
            setTimeout(() => n('idle'), 2e3));
        } catch {
          (n('error'), setTimeout(() => n('idle'), 2e3));
        } finally {
          r(!1);
        }
      };
    return a
      ? e.jsxs('div', {
          className: 'flex items-center justify-center h-64',
          children: [
            e.jsx(B, { className: 'h-8 w-8 animate-spin text-blue-600' }),
            e.jsx('span', {
              className: 'ml-2',
              children: 'Đang tải cài đặt...',
            }),
          ],
        })
      : e.jsxs('div', {
          className: 'space-y-6',
          children: [
            e.jsxs('div', {
              children: [
                e.jsx('h1', {
                  className: 'text-2xl font-bold text-gray-900',
                  children: 'Cài đặt hệ thống',
                }),
                e.jsx('p', {
                  className: 'text-gray-600 mt-2',
                  children:
                    'Quản lý cấu hình khách sạn, AI Assistant và các tính năng khác',
                }),
              ],
            }),
            e.jsxs(we, {
              defaultValue: 'general',
              className: 'space-y-6',
              children: [
                e.jsxs(Ce, {
                  className: 'grid w-full grid-cols-4',
                  children: [
                    e.jsxs(O, {
                      value: 'general',
                      className: 'flex items-center gap-2',
                      children: [e.jsx(As, { className: 'h-4 w-4' }), 'Chung'],
                    }),
                    e.jsxs(O, {
                      value: 'ai',
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(fe, { className: 'h-4 w-4' }),
                        'AI Assistant',
                      ],
                    }),
                    e.jsxs(O, {
                      value: 'notifications',
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(us, { className: 'h-4 w-4' }),
                        'Thông báo',
                      ],
                    }),
                    e.jsxs(O, {
                      value: 'security',
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(re, { className: 'h-4 w-4' }),
                        'Bảo mật',
                      ],
                    }),
                  ],
                }),
                e.jsx(H, {
                  value: 'general',
                  children: e.jsxs(j, {
                    children: [
                      e.jsxs(y, {
                        children: [
                          e.jsxs(b, {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(As, { className: 'h-5 w-5' }),
                              'Cài đặt chung',
                            ],
                          }),
                          e.jsx(M, {
                            children:
                              'Thông tin cơ bản về khách sạn và cấu hình hệ thống',
                          }),
                        ],
                      }),
                      e.jsxs(g, {
                        className: 'space-y-6',
                        children: [
                          e.jsxs('div', {
                            className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                            children: [
                              e.jsxs('div', {
                                className: 'space-y-4',
                                children: [
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'hotelName',
                                        children: 'Tên khách sạn',
                                      }),
                                      e.jsx(C, {
                                        id: 'hotelName',
                                        value: l.hotelName,
                                        onChange: x =>
                                          i({
                                            ...l,
                                            hotelName: x.target.value,
                                          }),
                                        placeholder: 'Tên khách sạn',
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'phone',
                                        children: 'Số điện thoại',
                                      }),
                                      e.jsx(C, {
                                        id: 'phone',
                                        value: l.phone,
                                        onChange: x =>
                                          i({ ...l, phone: x.target.value }),
                                        placeholder: '+84 28 3823 4567',
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'email',
                                        children: 'Email',
                                      }),
                                      e.jsx(C, {
                                        id: 'email',
                                        type: 'email',
                                        value: l.email,
                                        onChange: x =>
                                          i({ ...l, email: x.target.value }),
                                        placeholder: 'info@hotel.com',
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'website',
                                        children: 'Website',
                                      }),
                                      e.jsx(C, {
                                        id: 'website',
                                        value: l.website,
                                        onChange: x =>
                                          i({ ...l, website: x.target.value }),
                                        placeholder: 'https://hotel.com',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'space-y-4',
                                children: [
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'description',
                                        children: 'Mô tả',
                                      }),
                                      e.jsx(me, {
                                        id: 'description',
                                        value: l.description,
                                        onChange: x =>
                                          i({
                                            ...l,
                                            description: x.target.value,
                                          }),
                                        placeholder: 'Mô tả về khách sạn...',
                                        rows: 3,
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'address',
                                        children: 'Địa chỉ',
                                      }),
                                      e.jsx(me, {
                                        id: 'address',
                                        value: l.address,
                                        onChange: x =>
                                          i({ ...l, address: x.target.value }),
                                        placeholder: 'Địa chỉ đầy đủ',
                                        rows: 3,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsx(bs, {}),
                          e.jsxs('div', {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  t === 'success' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(oe, {
                                          className: 'h-4 w-4 text-green-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-green-600',
                                          children: 'Đã lưu thành công',
                                        }),
                                      ],
                                    }),
                                  t === 'error' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(ae, {
                                          className: 'h-4 w-4 text-red-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-red-600',
                                          children: 'Lỗi khi lưu',
                                        }),
                                      ],
                                    }),
                                ],
                              }),
                              e.jsx(p, {
                                onClick: m,
                                disabled: a,
                                children: a
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(B, {
                                          className:
                                            'h-4 w-4 mr-2 animate-spin',
                                        }),
                                        'Đang lưu...',
                                      ],
                                    })
                                  : e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(je, {
                                          className: 'h-4 w-4 mr-2',
                                        }),
                                        'Lưu thay đổi',
                                      ],
                                    }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                e.jsx(H, {
                  value: 'ai',
                  children: e.jsxs(j, {
                    children: [
                      e.jsxs(y, {
                        children: [
                          e.jsxs(b, {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(fe, { className: 'h-5 w-5' }),
                              'Cài đặt AI Assistant',
                            ],
                          }),
                          e.jsx(M, {
                            children:
                              'Cấu hình trợ lý AI cho dịch vụ khách hàng',
                          }),
                        ],
                      }),
                      e.jsxs(g, {
                        className: 'space-y-6',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsxs('div', {
                                children: [
                                  e.jsx('h3', {
                                    className: 'text-lg font-medium',
                                    children: 'AI Assistant',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-sm text-muted-foreground',
                                    children:
                                      'Kích hoạt trợ lý AI cho dịch vụ khách hàng',
                                  }),
                                ],
                              }),
                              e.jsx(z, {
                                checked: c.enabled,
                                onCheckedChange: x => u({ ...c, enabled: x }),
                              }),
                            ],
                          }),
                          e.jsx(bs, {}),
                          e.jsxs('div', {
                            className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                            children: [
                              e.jsxs('div', {
                                className: 'space-y-4',
                                children: [
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'assistantName',
                                        children: 'Tên trợ lý',
                                      }),
                                      e.jsx(C, {
                                        id: 'assistantName',
                                        value: c.name,
                                        onChange: x =>
                                          u({ ...c, name: x.target.value }),
                                        placeholder: 'Tên trợ lý AI',
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'responseDelay',
                                        children: 'Độ trễ phản hồi (ms)',
                                      }),
                                      e.jsx(C, {
                                        id: 'responseDelay',
                                        type: 'number',
                                        value: c.responseDelay,
                                        onChange: x =>
                                          u({
                                            ...c,
                                            responseDelay: parseInt(
                                              x.target.value
                                            ),
                                          }),
                                        min: '0',
                                        max: '5000',
                                      }),
                                    ],
                                  }),
                                  e.jsxs('div', {
                                    children: [
                                      e.jsx(h, {
                                        htmlFor: 'confidenceThreshold',
                                        children: 'Ngưỡng tin cậy',
                                      }),
                                      e.jsx(C, {
                                        id: 'confidenceThreshold',
                                        type: 'number',
                                        step: '0.1',
                                        value: c.confidenceThreshold,
                                        onChange: x =>
                                          u({
                                            ...c,
                                            confidenceThreshold: parseFloat(
                                              x.target.value
                                            ),
                                          }),
                                        min: '0',
                                        max: '1',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsx('div', {
                                className: 'space-y-4',
                                children: e.jsxs('div', {
                                  className: 'space-y-3',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between',
                                      children: [
                                        e.jsx(h, {
                                          htmlFor: 'enableSmallTalk',
                                          children:
                                            'Kích hoạt trò chuyện phiếm',
                                        }),
                                        e.jsx(z, {
                                          id: 'enableSmallTalk',
                                          checked: c.enableSmallTalk,
                                          onCheckedChange: x =>
                                            u({ ...c, enableSmallTalk: x }),
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between',
                                      children: [
                                        e.jsx(h, {
                                          htmlFor: 'enableTranscription',
                                          children:
                                            'Kích hoạt chuyển đổi văn bản',
                                        }),
                                        e.jsx(z, {
                                          id: 'enableTranscription',
                                          checked: c.enableTranscription,
                                          onCheckedChange: x =>
                                            u({ ...c, enableTranscription: x }),
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            children: [
                              e.jsx(h, {
                                htmlFor: 'customInstructions',
                                children: 'Hướng dẫn tùy chỉnh',
                              }),
                              e.jsx(me, {
                                id: 'customInstructions',
                                value: c.customInstructions,
                                onChange: x =>
                                  u({
                                    ...c,
                                    customInstructions: x.target.value,
                                  }),
                                placeholder:
                                  'Hướng dẫn chi tiết cho AI về cách phục vụ khách hàng...',
                                rows: 4,
                              }),
                            ],
                          }),
                          e.jsx(bs, {}),
                          e.jsxs('div', {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  t === 'success' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(oe, {
                                          className: 'h-4 w-4 text-green-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-green-600',
                                          children: 'Đã lưu thành công',
                                        }),
                                      ],
                                    }),
                                  t === 'error' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(ae, {
                                          className: 'h-4 w-4 text-red-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-red-600',
                                          children: 'Lỗi khi lưu',
                                        }),
                                      ],
                                    }),
                                ],
                              }),
                              e.jsx(p, {
                                onClick: m,
                                disabled: a,
                                children: a
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(B, {
                                          className:
                                            'h-4 w-4 mr-2 animate-spin',
                                        }),
                                        'Đang lưu...',
                                      ],
                                    })
                                  : e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(je, {
                                          className: 'h-4 w-4 mr-2',
                                        }),
                                        'Lưu cấu hình',
                                      ],
                                    }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                e.jsx(H, {
                  value: 'notifications',
                  children: e.jsxs(j, {
                    children: [
                      e.jsxs(y, {
                        children: [
                          e.jsxs(b, {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(us, { className: 'h-5 w-5' }),
                              'Cài đặt thông báo',
                            ],
                          }),
                          e.jsx(M, {
                            children:
                              'Quản lý cách thức nhận thông báo và cảnh báo',
                          }),
                        ],
                      }),
                      e.jsxs(g, {
                        className: 'space-y-6',
                        children: [
                          e.jsxs('div', {
                            className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                            children: [
                              e.jsx('div', {
                                className: 'space-y-4',
                                children: e.jsxs('div', {
                                  children: [
                                    e.jsx('h4', {
                                      className: 'font-medium mb-3',
                                      children: 'Kênh thông báo',
                                    }),
                                    e.jsxs('div', {
                                      className: 'space-y-3',
                                      children: [
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center justify-between',
                                          children: [
                                            e.jsx(h, {
                                              children: 'Email notifications',
                                            }),
                                            e.jsx(z, {
                                              checked: d.emailNotifications,
                                              onCheckedChange: x =>
                                                w({
                                                  ...d,
                                                  emailNotifications: x,
                                                }),
                                            }),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center justify-between',
                                          children: [
                                            e.jsx(h, {
                                              children: 'SMS notifications',
                                            }),
                                            e.jsx(z, {
                                              checked: d.smsNotifications,
                                              onCheckedChange: x =>
                                                w({
                                                  ...d,
                                                  smsNotifications: x,
                                                }),
                                            }),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center justify-between',
                                          children: [
                                            e.jsx(h, {
                                              children: 'Push notifications',
                                            }),
                                            e.jsx(z, {
                                              checked: d.pushNotifications,
                                              onCheckedChange: x =>
                                                w({
                                                  ...d,
                                                  pushNotifications: x,
                                                }),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                              e.jsx('div', {
                                className: 'space-y-4',
                                children: e.jsxs('div', {
                                  children: [
                                    e.jsx('h4', {
                                      className: 'font-medium mb-3',
                                      children: 'Loại thông báo',
                                    }),
                                    e.jsxs('div', {
                                      className: 'space-y-3',
                                      children: [
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center justify-between',
                                          children: [
                                            e.jsx(h, {
                                              children: 'Yêu cầu mới',
                                            }),
                                            e.jsx(z, {
                                              checked: d.newRequestAlert,
                                              onCheckedChange: x =>
                                                w({ ...d, newRequestAlert: x }),
                                            }),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center justify-between',
                                          children: [
                                            e.jsx(h, {
                                              children: 'Cảnh báo hệ thống',
                                            }),
                                            e.jsx(z, {
                                              checked: d.systemAlerts,
                                              onCheckedChange: x =>
                                                w({ ...d, systemAlerts: x }),
                                            }),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center justify-between',
                                          children: [
                                            e.jsx(h, {
                                              children: 'Báo cáo hàng ngày',
                                            }),
                                            e.jsx(z, {
                                              checked: d.dailyReports,
                                              onCheckedChange: x =>
                                                w({ ...d, dailyReports: x }),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          }),
                          e.jsx(bs, {}),
                          e.jsxs('div', {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  t === 'success' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(oe, {
                                          className: 'h-4 w-4 text-green-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-green-600',
                                          children: 'Đã lưu thành công',
                                        }),
                                      ],
                                    }),
                                  t === 'error' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(ae, {
                                          className: 'h-4 w-4 text-red-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-red-600',
                                          children: 'Lỗi khi lưu',
                                        }),
                                      ],
                                    }),
                                ],
                              }),
                              e.jsx(p, {
                                onClick: m,
                                disabled: a,
                                children: a
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(B, {
                                          className:
                                            'h-4 w-4 mr-2 animate-spin',
                                        }),
                                        'Đang lưu...',
                                      ],
                                    })
                                  : e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(je, {
                                          className: 'h-4 w-4 mr-2',
                                        }),
                                        'Lưu cài đặt',
                                      ],
                                    }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                e.jsx(H, {
                  value: 'security',
                  children: e.jsxs(j, {
                    children: [
                      e.jsxs(y, {
                        children: [
                          e.jsxs(b, {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(re, { className: 'h-5 w-5' }),
                              'Cài đặt bảo mật',
                            ],
                          }),
                          e.jsx(M, {
                            children: 'Quản lý bảo mật tài khoản và hệ thống',
                          }),
                        ],
                      }),
                      e.jsx(g, {
                        children: e.jsxs('div', {
                          className: 'text-center py-12',
                          children: [
                            e.jsx(re, {
                              className: 'h-12 w-12 mx-auto text-gray-400 mb-4',
                            }),
                            e.jsx('h3', {
                              className:
                                'text-lg font-medium text-gray-900 mb-2',
                              children: 'Cài đặt bảo mật',
                            }),
                            e.jsx('p', {
                              className: 'text-gray-600',
                              children:
                                'Các tùy chọn bảo mật nâng cao sẽ sớm ra mắt',
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                }),
              ],
            }),
          ],
        });
  },
  va = [
    {
      id: '1',
      firstName: 'Nguyen',
      lastName: 'Van A',
      email: 'nguyenvana@email.com',
      phone: '+84 90 123 4567',
      nationality: 'Vietnam',
      dateOfBirth: '1985-03-15',
      idNumber: '123456789',
      address: '123 Le Loi Street',
      city: 'Ho Chi Minh City',
      country: 'Vietnam',
      zipCode: '700000',
      preferredLanguage: 'vi',
      membershipTier: 'gold',
      totalStays: 12,
      totalSpent: 45e6,
      averageRating: 4.8,
      notes: 'VIP customer, prefers quiet rooms',
      createdAt: '2023-01-15T10:00:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      lastStay: '2024-01-10T14:30:00Z',
      status: 'vip',
      preferences: {
        roomType: 'Suite',
        floorPreference: 'High floor',
        smokingPreference: 'Non-smoking',
        bedPreference: 'King bed',
        specialRequests: ['Late check-out', 'Extra towels'],
      },
    },
    {
      id: '2',
      firstName: 'Kim',
      lastName: 'Min Jun',
      email: 'kim.minjun@email.com',
      phone: '+82 10 9876 5432',
      nationality: 'South Korea',
      dateOfBirth: '1990-07-22',
      idNumber: 'KOR987654321',
      address: '456 Gangnam-gu',
      city: 'Seoul',
      country: 'South Korea',
      zipCode: '06543',
      preferredLanguage: 'ko',
      membershipTier: 'silver',
      totalStays: 5,
      totalSpent: 18e6,
      averageRating: 4.5,
      notes: 'Business traveler, needs early breakfast',
      createdAt: '2023-08-20T09:00:00Z',
      updatedAt: '2024-01-05T11:15:00Z',
      lastStay: '2024-01-05T11:15:00Z',
      status: 'active',
      preferences: {
        roomType: 'Deluxe',
        floorPreference: 'Mid floor',
        smokingPreference: 'Non-smoking',
        bedPreference: 'Twin beds',
        specialRequests: ['Early breakfast', 'Business center access'],
      },
    },
    {
      id: '3',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 555 123 4567',
      nationality: 'United States',
      dateOfBirth: '1988-12-03',
      idNumber: 'USA123456789',
      address: '789 Broadway',
      city: 'New York',
      country: 'United States',
      zipCode: '10001',
      preferredLanguage: 'en',
      membershipTier: 'platinum',
      totalStays: 25,
      totalSpent: 95e6,
      averageRating: 4.9,
      notes: 'Frequent traveler, allergic to shellfish',
      createdAt: '2022-05-10T16:00:00Z',
      updatedAt: '2024-01-12T09:45:00Z',
      lastStay: '2024-01-12T09:45:00Z',
      status: 'vip',
      preferences: {
        roomType: 'Presidential Suite',
        floorPreference: 'Top floor',
        smokingPreference: 'Non-smoking',
        bedPreference: 'King bed',
        specialRequests: [
          'Shellfish allergy',
          'Concierge service',
          'Airport transfer',
        ],
      },
    },
  ],
  fn = [
    {
      id: '1',
      guestId: '1',
      roomNumber: '2101',
      roomType: 'Suite',
      checkIn: '2024-01-10T15:00:00Z',
      checkOut: '2024-01-13T11:00:00Z',
      guests: 2,
      totalAmount: 12e6,
      status: 'checked-out',
      paymentStatus: 'paid',
      specialRequests: ['Late check-out', 'Extra towels'],
      rating: 5,
      review: 'Excellent service and room quality',
      createdAt: '2024-01-05T10:00:00Z',
    },
    {
      id: '2',
      guestId: '2',
      roomNumber: '1505',
      roomType: 'Deluxe',
      checkIn: '2024-01-05T14:00:00Z',
      checkOut: '2024-01-07T12:00:00Z',
      guests: 1,
      totalAmount: 6e6,
      status: 'checked-out',
      paymentStatus: 'paid',
      specialRequests: ['Early breakfast'],
      rating: 4,
      review: 'Good stay, helpful staff',
      createdAt: '2024-01-01T09:00:00Z',
    },
  ],
  yn = [
    {
      id: '1',
      guestId: '1',
      note: 'Guest requested room upgrade, complimentary provided',
      type: 'general',
      staffMember: 'Front Desk Staff',
      createdAt: '2024-01-10T16:00:00Z',
    },
    {
      id: '2',
      guestId: '1',
      note: 'Prefers high floor rooms with city view',
      type: 'preference',
      staffMember: 'Front Desk Staff',
      createdAt: '2024-01-10T15:30:00Z',
    },
  ],
  Qa = s => {
    switch (s) {
      case 'platinum':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      case 'bronze':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
  Wa = s => {
    switch (s) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
  bn = s => {
    switch (s) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'checked-in':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
  Zs = s =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(s),
  Ts = s =>
    new Date(s).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  wn = ({ guest: s, isOpen: a, onClose: r, onUpdate: t }) => {
    const [n, l] = o.useState(!1),
      [i, c] = o.useState(s),
      [u, d] = o.useState(!1);
    o.useEffect(() => {
      c(s);
    }, [s]);
    const w = async () => {
      if (i) {
        d(!0);
        try {
          (await new Promise(m => setTimeout(m, 1e3)), t(i), l(!1));
        } catch (m) {
          console.error('Failed to update guest:', m);
        } finally {
          d(!1);
        }
      }
    };
    return !s || !i
      ? null
      : e.jsx(ze, {
          open: a,
          onOpenChange: r,
          children: e.jsxs(Be, {
            className: 'max-w-4xl max-h-[90vh] overflow-y-auto',
            children: [
              e.jsxs(Ue, {
                children: [
                  e.jsxs(Ke, {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ta, { className: 'h-5 w-5' }),
                      s.firstName,
                      ' ',
                      s.lastName,
                      e.jsx(R, {
                        className: $('ml-2', Qa(s.membershipTier)),
                        children: s.membershipTier.toUpperCase(),
                      }),
                      e.jsx(R, {
                        className: $('ml-1', Wa(s.status)),
                        children: s.status.toUpperCase(),
                      }),
                    ],
                  }),
                  e.jsx(We, {
                    children:
                      'Chi tiết thông tin khách hàng và lịch sử đặt phòng',
                  }),
                ],
              }),
              e.jsxs(we, {
                defaultValue: 'info',
                className: 'w-full',
                children: [
                  e.jsxs(Ce, {
                    className: 'grid w-full grid-cols-3',
                    children: [
                      e.jsx(O, { value: 'info', children: 'Thông tin' }),
                      e.jsx(O, {
                        value: 'bookings',
                        children: 'Lịch sử đặt phòng',
                      }),
                      e.jsx(O, { value: 'notes', children: 'Ghi chú' }),
                    ],
                  }),
                  e.jsxs(H, {
                    value: 'info',
                    className: 'space-y-4',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsx('h3', {
                            className: 'text-lg font-medium',
                            children: 'Thông tin cá nhân',
                          }),
                          e.jsxs(p, {
                            variant: 'outline',
                            size: 'sm',
                            onClick: () => l(!n),
                            children: [
                              e.jsx(_e, { className: 'h-4 w-4 mr-2' }),
                              n ? 'Hủy' : 'Chỉnh sửa',
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                        children: [
                          e.jsxs('div', {
                            className: 'space-y-4',
                            children: [
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'firstName',
                                    children: 'Họ',
                                  }),
                                  e.jsx(C, {
                                    id: 'firstName',
                                    value: i.firstName,
                                    onChange: m =>
                                      c({ ...i, firstName: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'lastName',
                                    children: 'Tên',
                                  }),
                                  e.jsx(C, {
                                    id: 'lastName',
                                    value: i.lastName,
                                    onChange: m =>
                                      c({ ...i, lastName: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'email',
                                    children: 'Email',
                                  }),
                                  e.jsx(C, {
                                    id: 'email',
                                    type: 'email',
                                    value: i.email,
                                    onChange: m =>
                                      c({ ...i, email: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'phone',
                                    children: 'Số điện thoại',
                                  }),
                                  e.jsx(C, {
                                    id: 'phone',
                                    value: i.phone,
                                    onChange: m =>
                                      c({ ...i, phone: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'nationality',
                                    children: 'Quốc tịch',
                                  }),
                                  e.jsx(C, {
                                    id: 'nationality',
                                    value: i.nationality,
                                    onChange: m =>
                                      c({ ...i, nationality: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className: 'space-y-4',
                            children: [
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'dateOfBirth',
                                    children: 'Ngày sinh',
                                  }),
                                  e.jsx(C, {
                                    id: 'dateOfBirth',
                                    type: 'date',
                                    value: i.dateOfBirth,
                                    onChange: m =>
                                      c({ ...i, dateOfBirth: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'idNumber',
                                    children: 'Số CMND/CCCD',
                                  }),
                                  e.jsx(C, {
                                    id: 'idNumber',
                                    value: i.idNumber,
                                    onChange: m =>
                                      c({ ...i, idNumber: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'address',
                                    children: 'Địa chỉ',
                                  }),
                                  e.jsx(me, {
                                    id: 'address',
                                    value: i.address,
                                    onChange: m =>
                                      c({ ...i, address: m.target.value }),
                                    disabled: !n,
                                    rows: 2,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'city',
                                    children: 'Thành phố',
                                  }),
                                  e.jsx(C, {
                                    id: 'city',
                                    value: i.city,
                                    onChange: m =>
                                      c({ ...i, city: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'country',
                                    children: 'Quốc gia',
                                  }),
                                  e.jsx(C, {
                                    id: 'country',
                                    value: i.country,
                                    onChange: m =>
                                      c({ ...i, country: m.target.value }),
                                    disabled: !n,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, { htmlFor: 'notes', children: 'Ghi chú' }),
                          e.jsx(me, {
                            id: 'notes',
                            value: i.notes,
                            onChange: m => c({ ...i, notes: m.target.value }),
                            disabled: !n,
                            rows: 3,
                          }),
                        ],
                      }),
                      n &&
                        e.jsx('div', {
                          className: 'flex justify-end gap-2',
                          children: e.jsx(p, {
                            onClick: w,
                            disabled: u,
                            children: u
                              ? e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx(B, {
                                      className: 'h-4 w-4 mr-2 animate-spin',
                                    }),
                                    'Đang lưu...',
                                  ],
                                })
                              : e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx(je, { className: 'h-4 w-4 mr-2' }),
                                    'Lưu thay đổi',
                                  ],
                                }),
                          }),
                        }),
                    ],
                  }),
                  e.jsxs(H, {
                    value: 'bookings',
                    className: 'space-y-4',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsx('h3', {
                            className: 'text-lg font-medium',
                            children: 'Lịch sử đặt phòng',
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsxs('span', {
                                className: 'text-sm text-muted-foreground',
                                children: [
                                  'Tổng cộng: ',
                                  s.totalStays,
                                  ' lần lưu trú',
                                ],
                              }),
                              e.jsx('span', {
                                className: 'text-sm text-muted-foreground',
                                children: '•',
                              }),
                              e.jsxs('span', {
                                className: 'text-sm text-muted-foreground',
                                children: ['Chi tiêu: ', Zs(s.totalSpent)],
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx('div', {
                        className: 'space-y-4',
                        children: fn
                          .filter(m => m.guestId === s.id)
                          .map(m =>
                            e.jsx(
                              j,
                              {
                                children: e.jsxs(g, {
                                  className: 'p-4',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between mb-2',
                                      children: [
                                        e.jsxs('div', {
                                          className: 'flex items-center gap-2',
                                          children: [
                                            e.jsxs('span', {
                                              className: 'font-medium',
                                              children: [
                                                'Phòng ',
                                                m.roomNumber,
                                              ],
                                            }),
                                            e.jsx(R, {
                                              variant: 'outline',
                                              children: m.roomType,
                                            }),
                                            e.jsx(R, {
                                              className: $(bn(m.status)),
                                              children: m.status,
                                            }),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'text-sm text-muted-foreground',
                                          children: [
                                            Ts(m.checkIn),
                                            ' - ',
                                            Ts(m.checkOut),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'grid grid-cols-1 md:grid-cols-3 gap-4 text-sm',
                                      children: [
                                        e.jsxs('div', {
                                          children: [
                                            e.jsx('span', {
                                              className:
                                                'text-muted-foreground',
                                              children: 'Số khách:',
                                            }),
                                            ' ',
                                            m.guests,
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          children: [
                                            e.jsx('span', {
                                              className:
                                                'text-muted-foreground',
                                              children: 'Tổng tiền:',
                                            }),
                                            ' ',
                                            Zs(m.totalAmount),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          children: [
                                            e.jsx('span', {
                                              className:
                                                'text-muted-foreground',
                                              children: 'Đánh giá:',
                                            }),
                                            e.jsxs('div', {
                                              className:
                                                'flex items-center gap-1 ml-1',
                                              children: [
                                                [...Array(5)].map((x, L) =>
                                                  e.jsx(
                                                    es,
                                                    {
                                                      className: $(
                                                        'h-3 w-3',
                                                        L < m.rating
                                                          ? 'fill-yellow-400 text-yellow-400'
                                                          : 'text-gray-300'
                                                      ),
                                                    },
                                                    L
                                                  )
                                                ),
                                                e.jsxs('span', {
                                                  className: 'ml-1',
                                                  children: [
                                                    '(',
                                                    m.rating,
                                                    '/5)',
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    m.review &&
                                      e.jsxs('div', {
                                        className:
                                          'mt-2 p-2 bg-gray-50 rounded text-sm',
                                        children: [
                                          e.jsx('span', {
                                            className: 'text-muted-foreground',
                                            children: 'Đánh giá:',
                                          }),
                                          ' ',
                                          m.review,
                                        ],
                                      }),
                                  ],
                                }),
                              },
                              m.id
                            )
                          ),
                      }),
                    ],
                  }),
                  e.jsxs(H, {
                    value: 'notes',
                    className: 'space-y-4',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsx('h3', {
                            className: 'text-lg font-medium',
                            children: 'Ghi chú dịch vụ',
                          }),
                          e.jsxs(p, {
                            size: 'sm',
                            children: [
                              e.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                              'Thêm ghi chú',
                            ],
                          }),
                        ],
                      }),
                      e.jsx('div', {
                        className: 'space-y-3',
                        children: yn
                          .filter(m => m.guestId === s.id)
                          .map(m =>
                            e.jsx(
                              j,
                              {
                                children: e.jsxs(g, {
                                  className: 'p-4',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between mb-2',
                                      children: [
                                        e.jsx(R, {
                                          variant: 'outline',
                                          children: m.type,
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'text-sm text-muted-foreground',
                                          children: [
                                            m.staffMember,
                                            ' • ',
                                            Ts(m.createdAt),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsx('p', {
                                      className: 'text-sm',
                                      children: m.note,
                                    }),
                                  ],
                                }),
                              },
                              m.id
                            )
                          ),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        });
  },
  Cn = ({ isOpen: s, onClose: a, onAdd: r }) => {
    const [t, n] = o.useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        dateOfBirth: '',
        idNumber: '',
        address: '',
        city: '',
        country: '',
        zipCode: '',
        preferredLanguage: 'vi',
        membershipTier: 'bronze',
        notes: '',
      }),
      [l, i] = o.useState(!1),
      c = async u => {
        (u.preventDefault(), i(!0));
        try {
          await new Promise(w => setTimeout(w, 1e3));
          const d = {
            id: Date.now().toString(),
            ...t,
            totalStays: 0,
            totalSpent: 0,
            averageRating: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastStay: '',
            status: 'active',
            preferences: {
              roomType: '',
              floorPreference: '',
              smokingPreference: 'Non-smoking',
              bedPreference: '',
              specialRequests: [],
            },
          };
          (r(d),
            a(),
            n({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              nationality: '',
              dateOfBirth: '',
              idNumber: '',
              address: '',
              city: '',
              country: '',
              zipCode: '',
              preferredLanguage: 'vi',
              membershipTier: 'bronze',
              notes: '',
            }));
        } catch (d) {
          console.error('Failed to add guest:', d);
        } finally {
          i(!1);
        }
      };
    return e.jsx(ze, {
      open: s,
      onOpenChange: a,
      children: e.jsxs(Be, {
        className: 'max-w-2xl max-h-[90vh] overflow-y-auto',
        children: [
          e.jsxs(Ue, {
            children: [
              e.jsxs(Ke, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(js, { className: 'h-5 w-5' }),
                  'Thêm khách hàng mới',
                ],
              }),
              e.jsx(We, {
                children: 'Nhập thông tin khách hàng để tạo hồ sơ mới',
              }),
            ],
          }),
          e.jsxs('form', {
            onSubmit: c,
            className: 'space-y-4',
            children: [
              e.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'firstName', children: 'Họ *' }),
                      e.jsx(C, {
                        id: 'firstName',
                        value: t.firstName,
                        onChange: u => n({ ...t, firstName: u.target.value }),
                        required: !0,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'lastName', children: 'Tên *' }),
                      e.jsx(C, {
                        id: 'lastName',
                        value: t.lastName,
                        onChange: u => n({ ...t, lastName: u.target.value }),
                        required: !0,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'email', children: 'Email *' }),
                      e.jsx(C, {
                        id: 'email',
                        type: 'email',
                        value: t.email,
                        onChange: u => n({ ...t, email: u.target.value }),
                        required: !0,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'phone',
                        children: 'Số điện thoại *',
                      }),
                      e.jsx(C, {
                        id: 'phone',
                        value: t.phone,
                        onChange: u => n({ ...t, phone: u.target.value }),
                        required: !0,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'nationality',
                        children: 'Quốc tịch',
                      }),
                      e.jsx(C, {
                        id: 'nationality',
                        value: t.nationality,
                        onChange: u => n({ ...t, nationality: u.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'dateOfBirth',
                        children: 'Ngày sinh',
                      }),
                      e.jsx(C, {
                        id: 'dateOfBirth',
                        type: 'date',
                        value: t.dateOfBirth,
                        onChange: u => n({ ...t, dateOfBirth: u.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'idNumber',
                        children: 'Số CMND/CCCD',
                      }),
                      e.jsx(C, {
                        id: 'idNumber',
                        value: t.idNumber,
                        onChange: u => n({ ...t, idNumber: u.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'preferredLanguage',
                        children: 'Ngôn ngữ ưa thích',
                      }),
                      e.jsxs(Q, {
                        value: t.preferredLanguage,
                        onValueChange: u => n({ ...t, preferredLanguage: u }),
                        children: [
                          e.jsx(W, { children: e.jsx(X, {}) }),
                          e.jsxs(Y, {
                            children: [
                              e.jsx(N, { value: 'vi', children: 'Tiếng Việt' }),
                              e.jsx(N, { value: 'en', children: 'English' }),
                              e.jsx(N, { value: 'ko', children: '한국어' }),
                              e.jsx(N, { value: 'ja', children: '日本語' }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'address', children: 'Địa chỉ' }),
                  e.jsx(me, {
                    id: 'address',
                    value: t.address,
                    onChange: u => n({ ...t, address: u.target.value }),
                    rows: 2,
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'city', children: 'Thành phố' }),
                      e.jsx(C, {
                        id: 'city',
                        value: t.city,
                        onChange: u => n({ ...t, city: u.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'country', children: 'Quốc gia' }),
                      e.jsx(C, {
                        id: 'country',
                        value: t.country,
                        onChange: u => n({ ...t, country: u.target.value }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'notes', children: 'Ghi chú' }),
                  e.jsx(me, {
                    id: 'notes',
                    value: t.notes,
                    onChange: u => n({ ...t, notes: u.target.value }),
                    placeholder: 'Thông tin bổ sung về khách hàng...',
                    rows: 3,
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex justify-end gap-2',
                children: [
                  e.jsx(p, {
                    type: 'button',
                    variant: 'outline',
                    onClick: a,
                    children: 'Hủy',
                  }),
                  e.jsx(p, {
                    type: 'submit',
                    disabled: l,
                    children: l
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(B, {
                              className: 'h-4 w-4 mr-2 animate-spin',
                            }),
                            'Đang tạo...',
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                            'Tạo khách hàng',
                          ],
                        }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  rl = () => {
    const { user: s } = pe(),
      [a, r] = o.useState(va),
      [t, n] = o.useState(!1),
      [l, i] = o.useState(''),
      [c, u] = o.useState('all'),
      [d, w] = o.useState('all'),
      [m, x] = o.useState(null),
      [L, S] = o.useState(!1),
      [k, ee] = o.useState(!1),
      se = a.filter(D => {
        const _ =
            !l ||
            D.firstName.toLowerCase().includes(l.toLowerCase()) ||
            D.lastName.toLowerCase().includes(l.toLowerCase()) ||
            D.email.toLowerCase().includes(l.toLowerCase()) ||
            D.phone.includes(l),
          V = c === 'all' || D.membershipTier === c,
          de = d === 'all' || D.status === d;
        return _ && V && de;
      }),
      te = D => {
        (x(D), S(!0));
      },
      ne = D => {
        (r(_ => _.map(V => (V.id === D.id ? D : V))), x(D));
      },
      T = D => {
        r(_ => [..._, D]);
      },
      J = async () => {
        n(!0);
        try {
          (await new Promise(D => setTimeout(D, 1e3)), r(va));
        } catch (D) {
          console.error('Failed to fetch guests:', D);
        } finally {
          n(!1);
        }
      };
    return (
      o.useEffect(() => {
        J();
      }, []),
      t
        ? e.jsxs('div', {
            className: 'flex items-center justify-center h-64',
            children: [
              e.jsx(B, { className: 'h-8 w-8 animate-spin text-green-600' }),
              e.jsx('span', {
                className: 'ml-2',
                children: 'Đang tải danh sách khách hàng...',
              }),
            ],
          })
        : e.jsxs('div', {
            className: 'space-y-6',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('h1', {
                        className: 'text-2xl font-bold text-gray-900',
                        children: 'Quản lý khách hàng',
                      }),
                      e.jsx('p', {
                        className: 'text-gray-600 mt-2',
                        children:
                          'Quản lý thông tin khách hàng và lịch sử lưu trú',
                      }),
                    ],
                  }),
                  e.jsxs(p, {
                    onClick: () => ee(!0),
                    children: [
                      e.jsx(js, { className: 'h-4 w-4 mr-2' }),
                      'Thêm khách hàng',
                    ],
                  }),
                ],
              }),
              e.jsxs(j, {
                children: [
                  e.jsx(y, {
                    children: e.jsx(b, {
                      className: 'text-lg',
                      children: 'Tìm kiếm và lọc',
                    }),
                  }),
                  e.jsx(g, {
                    children: e.jsxs('div', {
                      className: 'flex flex-col sm:flex-row gap-4',
                      children: [
                        e.jsx('div', {
                          className: 'flex-1',
                          children: e.jsxs('div', {
                            className: 'relative',
                            children: [
                              e.jsx(Me, {
                                className:
                                  'absolute left-3 top-3 h-4 w-4 text-gray-400',
                              }),
                              e.jsx(C, {
                                placeholder:
                                  'Tìm kiếm theo tên, email hoặc số điện thoại...',
                                value: l,
                                onChange: D => i(D.target.value),
                                className: 'pl-10',
                              }),
                            ],
                          }),
                        }),
                        e.jsxs('div', {
                          className: 'flex gap-2',
                          children: [
                            e.jsxs(Q, {
                              value: c,
                              onValueChange: u,
                              children: [
                                e.jsx(W, {
                                  className: 'w-[180px]',
                                  children: e.jsx(X, {
                                    placeholder: 'Membership tier',
                                  }),
                                }),
                                e.jsxs(Y, {
                                  children: [
                                    e.jsx(N, {
                                      value: 'all',
                                      children: 'Tất cả membership',
                                    }),
                                    e.jsx(N, {
                                      value: 'bronze',
                                      children: 'Bronze',
                                    }),
                                    e.jsx(N, {
                                      value: 'silver',
                                      children: 'Silver',
                                    }),
                                    e.jsx(N, {
                                      value: 'gold',
                                      children: 'Gold',
                                    }),
                                    e.jsx(N, {
                                      value: 'platinum',
                                      children: 'Platinum',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            e.jsxs(Q, {
                              value: d,
                              onValueChange: w,
                              children: [
                                e.jsx(W, {
                                  className: 'w-[150px]',
                                  children: e.jsx(X, {
                                    placeholder: 'Trạng thái',
                                  }),
                                }),
                                e.jsxs(Y, {
                                  children: [
                                    e.jsx(N, {
                                      value: 'all',
                                      children: 'Tất cả trạng thái',
                                    }),
                                    e.jsx(N, {
                                      value: 'active',
                                      children: 'Active',
                                    }),
                                    e.jsx(N, {
                                      value: 'inactive',
                                      children: 'Inactive',
                                    }),
                                    e.jsx(N, { value: 'vip', children: 'VIP' }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-4 gap-4',
                children: [
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Tổng khách hàng',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold',
                                children: a.length,
                              }),
                            ],
                          }),
                          e.jsx(ge, { className: 'h-8 w-8 text-blue-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Khách VIP',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold',
                                children: a.filter(D => D.status === 'vip')
                                  .length,
                              }),
                            ],
                          }),
                          e.jsx(es, { className: 'h-8 w-8 text-purple-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Khách hàng mới',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold',
                                children: a.filter(
                                  D =>
                                    new Date(D.createdAt) >
                                    new Date(
                                      Date.now() - 30 * 24 * 60 * 60 * 1e3
                                    )
                                ).length,
                              }),
                            ],
                          }),
                          e.jsx(js, { className: 'h-8 w-8 text-green-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Đánh giá TB',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold',
                                children: (
                                  a.reduce((D, _) => D + _.averageRating, 0) /
                                  a.length
                                ).toFixed(1),
                              }),
                            ],
                          }),
                          e.jsx(es, { className: 'h-8 w-8 text-yellow-500' }),
                        ],
                      }),
                    }),
                  }),
                ],
              }),
              e.jsxs(j, {
                children: [
                  e.jsxs(y, {
                    children: [
                      e.jsx(b, { children: 'Danh sách khách hàng' }),
                      e.jsxs(M, {
                        children: [
                          'Hiển thị ',
                          se.length,
                          ' trong tổng số ',
                          a.length,
                          ' khách hàng',
                        ],
                      }),
                    ],
                  }),
                  e.jsx(g, {
                    children: e.jsx('div', {
                      className: 'overflow-x-auto',
                      children: e.jsxs(Re, {
                        children: [
                          e.jsx(Ee, {
                            children: e.jsxs(ce, {
                              children: [
                                e.jsx(F, { children: 'Khách hàng' }),
                                e.jsx(F, { children: 'Liên hệ' }),
                                e.jsx(F, { children: 'Membership' }),
                                e.jsx(F, { children: 'Trạng thái' }),
                                e.jsx(F, { children: 'Lần lưu trú' }),
                                e.jsx(F, { children: 'Chi tiêu' }),
                                e.jsx(F, { children: 'Đánh giá' }),
                                e.jsx(F, { children: 'Lần cuối' }),
                                e.jsx(F, { children: 'Hành động' }),
                              ],
                            }),
                          }),
                          e.jsx(qe, {
                            children: se.map(D =>
                              e.jsxs(
                                ce,
                                {
                                  children: [
                                    e.jsx(P, {
                                      children: e.jsxs('div', {
                                        children: [
                                          e.jsxs('div', {
                                            className: 'font-medium',
                                            children: [
                                              D.firstName,
                                              ' ',
                                              D.lastName,
                                            ],
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'text-sm text-muted-foreground',
                                            children: D.nationality,
                                          }),
                                        ],
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsxs('div', {
                                        className: 'space-y-1',
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'flex items-center gap-1 text-sm',
                                            children: [
                                              e.jsx(ea, {
                                                className: 'h-3 w-3',
                                              }),
                                              D.email,
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className:
                                              'flex items-center gap-1 text-sm',
                                            children: [
                                              e.jsx(be, {
                                                className: 'h-3 w-3',
                                              }),
                                              D.phone,
                                            ],
                                          }),
                                        ],
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsx(R, {
                                        className: Qa(D.membershipTier),
                                        children:
                                          D.membershipTier.toUpperCase(),
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsx(R, {
                                        className: Wa(D.status),
                                        children: D.status.toUpperCase(),
                                      }),
                                    }),
                                    e.jsx(P, { children: D.totalStays }),
                                    e.jsx(P, { children: Zs(D.totalSpent) }),
                                    e.jsx(P, {
                                      children: e.jsxs('div', {
                                        className: 'flex items-center gap-1',
                                        children: [
                                          e.jsx(es, {
                                            className:
                                              'h-4 w-4 fill-yellow-400 text-yellow-400',
                                          }),
                                          e.jsx('span', {
                                            children: D.averageRating,
                                          }),
                                        ],
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: D.lastStay
                                        ? Ts(D.lastStay)
                                        : 'Chưa lưu trú',
                                    }),
                                    e.jsx(P, {
                                      children: e.jsx(p, {
                                        variant: 'ghost',
                                        size: 'sm',
                                        onClick: () => te(D),
                                        children: e.jsx(He, {
                                          className: 'h-4 w-4',
                                        }),
                                      }),
                                    }),
                                  ],
                                },
                                D.id
                              )
                            ),
                          }),
                        ],
                      }),
                    }),
                  }),
                ],
              }),
              e.jsx(wn, {
                guest: m,
                isOpen: L,
                onClose: () => S(!1),
                onUpdate: ne,
              }),
              e.jsx(Cn, { isOpen: k, onClose: () => ee(!1), onAdd: T }),
            ],
          })
    );
  },
  Na = {
    firewall: {
      enabled: !0,
      rules: [
        {
          id: '1',
          name: 'Allow HTTP',
          source: 'any',
          destination: 'server',
          port: 80,
          protocol: 'tcp',
          action: 'allow',
          enabled: !0,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Allow HTTPS',
          source: 'any',
          destination: 'server',
          port: 443,
          protocol: 'tcp',
          action: 'allow',
          enabled: !0,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'Block Suspicious IP',
          source: '192.168.1.100',
          destination: 'any',
          port: 0,
          protocol: 'tcp',
          action: 'deny',
          enabled: !0,
          createdAt: '2024-01-10T10:00:00Z',
        },
      ],
      allowedPorts: [80, 443, 22, 25, 587],
      blockedIPs: ['192.168.1.100', '10.0.0.50'],
      ddosProtection: !0,
      rateLimiting: !0,
    },
    ssl: {
      enabled: !0,
      certificates: [
        {
          id: '1',
          domain: 'minhhonghotel.com',
          issuer: "Let's Encrypt",
          validFrom: '2024-01-01T00:00:00Z',
          validTo: '2024-04-01T00:00:00Z',
          status: 'valid',
          type: 'ssl',
        },
        {
          id: '2',
          domain: '*.minhhonghotel.com',
          issuer: 'DigiCert',
          validFrom: '2023-12-01T00:00:00Z',
          validTo: '2024-12-01T00:00:00Z',
          status: 'valid',
          type: 'wildcard',
        },
      ],
      forceHttps: !0,
      hstsEnabled: !0,
      cipherSuites: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'],
    },
    authentication: {
      mfaEnabled: !0,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: !0,
        requireNumbers: !0,
        requireSymbols: !0,
        expirationDays: 90,
      },
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
    },
    monitoring: {
      logLevel: 'info',
      alertsEnabled: !0,
      alertThresholds: {
        failedLogins: 10,
        diskUsage: 85,
        memoryUsage: 90,
        cpuUsage: 95,
      },
      retentionPeriod: 90,
    },
    backup: {
      enabled: !0,
      schedule: '0 2 * * *',
      retention: 30,
      encryption: !0,
      location: 'AWS S3',
      lastBackup: '2024-01-15T02:00:00Z',
      status: 'success',
    },
    compliance: {
      gdprCompliant: !0,
      pciCompliant: !1,
      iso27001: !0,
      auditEnabled: !0,
      dataRetentionDays: 365,
    },
  },
  fa = [
    {
      id: '1',
      type: 'authentication',
      severity: 'high',
      message: 'Multiple failed login attempts detected',
      timestamp: '2024-01-15T14:30:00Z',
      resolved: !1,
      details:
        'User attempted to login with incorrect credentials 8 times from IP 192.168.1.100',
    },
    {
      id: '2',
      type: 'ssl',
      severity: 'medium',
      message: 'SSL certificate expiring soon',
      timestamp: '2024-01-15T10:00:00Z',
      resolved: !1,
      details: 'Certificate for minhhonghotel.com will expire in 30 days',
    },
    {
      id: '3',
      type: 'firewall',
      severity: 'low',
      message: 'Port scan detected',
      timestamp: '2024-01-15T08:15:00Z',
      resolved: !0,
      details: 'Port scan from 10.0.0.50 was blocked by firewall',
    },
  ],
  ya = [
    {
      id: '1',
      timestamp: '2024-01-15T15:00:00Z',
      source: 'auth',
      event: 'LOGIN_SUCCESS',
      severity: 'info',
      details: 'User logged in successfully',
      ip: '192.168.1.50',
      user: 'admin',
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:45:00Z',
      source: 'firewall',
      event: 'BLOCKED_IP',
      severity: 'warning',
      details: 'Blocked connection from suspicious IP',
      ip: '192.168.1.100',
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:30:00Z',
      source: 'auth',
      event: 'LOGIN_FAILED',
      severity: 'error',
      details: 'Failed login attempt',
      ip: '192.168.1.100',
      user: 'admin',
    },
  ],
  Sn = s => {
    switch (s) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
  vs = s =>
    new Date(s).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  kn = ({ config: s, onUpdate: a }) => {
    const [r, t] = o.useState(!1),
      [n, l] = o.useState(!1),
      i = async () => {
        t(!0);
        try {
          await new Promise(c => setTimeout(c, 1e3));
        } catch (c) {
          console.error('Failed to save firewall config:', c);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(re, { className: 'h-5 w-5' }),
                    'Cấu hình Firewall',
                  ],
                }),
                e.jsx(M, { children: 'Quản lý tường lửa và bảo mật mạng' }),
              ],
            }),
            e.jsxs(g, {
              className: 'space-y-6',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          className: 'text-base font-medium',
                          children: 'Kích hoạt Firewall',
                        }),
                        e.jsx('p', {
                          className: 'text-sm text-muted-foreground',
                          children: 'Bật/tắt tường lửa cho hệ thống',
                        }),
                      ],
                    }),
                    e.jsx(z, {
                      checked: s.enabled,
                      onCheckedChange: c => a({ enabled: c }),
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'DDoS Protection' }),
                        e.jsx(z, {
                          checked: s.ddosProtection,
                          onCheckedChange: c => a({ ddosProtection: c }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'Rate Limiting' }),
                        e.jsx(z, {
                          checked: s.rateLimiting,
                          onCheckedChange: c => a({ rateLimiting: c }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx(h, { children: 'Blocked IPs' }),
                    e.jsx(me, {
                      value: s.blockedIPs.join(`
`),
                      onChange: c =>
                        a({
                          blockedIPs: c.target.value
                            .split(
                              `
`
                            )
                            .filter(u => u.trim()),
                        }),
                      placeholder: `192.168.1.100
10.0.0.50`,
                      rows: 3,
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'flex justify-end',
                  children: e.jsx(p, {
                    onClick: i,
                    disabled: r,
                    children: r
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(B, {
                              className: 'h-4 w-4 mr-2 animate-spin',
                            }),
                            'Đang lưu...',
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(je, { className: 'h-4 w-4 mr-2' }),
                            'Lưu cấu hình',
                          ],
                        }),
                  }),
                }),
              ],
            }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsx(y, {
              children: e.jsxs(b, {
                className: 'flex items-center justify-between',
                children: [
                  e.jsx('span', { children: 'Firewall Rules' }),
                  e.jsxs(p, {
                    size: 'sm',
                    onClick: () => l(!n),
                    children: [
                      e.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                      'Thêm Rule',
                    ],
                  }),
                ],
              }),
            }),
            e.jsx(g, {
              children: e.jsxs(Re, {
                children: [
                  e.jsx(Ee, {
                    children: e.jsxs(ce, {
                      children: [
                        e.jsx(F, { children: 'Tên' }),
                        e.jsx(F, { children: 'Source' }),
                        e.jsx(F, { children: 'Destination' }),
                        e.jsx(F, { children: 'Port' }),
                        e.jsx(F, { children: 'Protocol' }),
                        e.jsx(F, { children: 'Action' }),
                        e.jsx(F, { children: 'Trạng thái' }),
                        e.jsx(F, { children: 'Hành động' }),
                      ],
                    }),
                  }),
                  e.jsx(qe, {
                    children: s.rules.map(c =>
                      e.jsxs(
                        ce,
                        {
                          children: [
                            e.jsx(P, {
                              className: 'font-medium',
                              children: c.name,
                            }),
                            e.jsx(P, { children: c.source }),
                            e.jsx(P, { children: c.destination }),
                            e.jsx(P, { children: c.port }),
                            e.jsx(P, { children: c.protocol.toUpperCase() }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                variant:
                                  c.action === 'allow'
                                    ? 'default'
                                    : 'destructive',
                                children: c.action.toUpperCase(),
                              }),
                            }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                variant: c.enabled ? 'default' : 'secondary',
                                children: c.enabled ? 'Enabled' : 'Disabled',
                              }),
                            }),
                            e.jsx(P, {
                              children: e.jsxs('div', {
                                className: 'flex gap-2',
                                children: [
                                  e.jsx(p, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(_e, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                  e.jsx(p, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(Ze, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                ],
                              }),
                            }),
                          ],
                        },
                        c.id
                      )
                    ),
                  }),
                ],
              }),
            }),
          ],
        }),
      ],
    });
  },
  Tn = ({ config: s, onUpdate: a }) => {
    const [r, t] = o.useState(!1),
      n = async () => {
        t(!0);
        try {
          await new Promise(l => setTimeout(l, 1e3));
        } catch (l) {
          console.error('Failed to save SSL config:', l);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(j, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(gs, { className: 'h-5 w-5' }),
                    'Cấu hình SSL/TLS',
                  ],
                }),
                e.jsx(M, { children: 'Quản lý chứng chỉ SSL và cấu hình TLS' }),
              ],
            }),
            e.jsxs(g, {
              className: 'space-y-6',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'Kích hoạt SSL' }),
                        e.jsx(z, {
                          checked: s.enabled,
                          onCheckedChange: l => a({ enabled: l }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'Force HTTPS' }),
                        e.jsx(z, {
                          checked: s.forceHttps,
                          onCheckedChange: l => a({ forceHttps: l }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'HSTS Enabled' }),
                        e.jsx(z, {
                          checked: s.hstsEnabled,
                          onCheckedChange: l => a({ hstsEnabled: l }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'flex justify-end',
                  children: e.jsx(p, {
                    onClick: n,
                    disabled: r,
                    children: r
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(B, {
                              className: 'h-4 w-4 mr-2 animate-spin',
                            }),
                            'Đang lưu...',
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(je, { className: 'h-4 w-4 mr-2' }),
                            'Lưu cấu hình',
                          ],
                        }),
                  }),
                }),
              ],
            }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsx(y, {
              children: e.jsxs(b, {
                className: 'flex items-center justify-between',
                children: [
                  e.jsx('span', { children: 'SSL Certificates' }),
                  e.jsxs(p, {
                    size: 'sm',
                    children: [
                      e.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                      'Thêm Certificate',
                    ],
                  }),
                ],
              }),
            }),
            e.jsx(g, {
              children: e.jsxs(Re, {
                children: [
                  e.jsx(Ee, {
                    children: e.jsxs(ce, {
                      children: [
                        e.jsx(F, { children: 'Domain' }),
                        e.jsx(F, { children: 'Issuer' }),
                        e.jsx(F, { children: 'Type' }),
                        e.jsx(F, { children: 'Valid From' }),
                        e.jsx(F, { children: 'Valid To' }),
                        e.jsx(F, { children: 'Status' }),
                        e.jsx(F, { children: 'Actions' }),
                      ],
                    }),
                  }),
                  e.jsx(qe, {
                    children: s.certificates.map(l =>
                      e.jsxs(
                        ce,
                        {
                          children: [
                            e.jsx(P, {
                              className: 'font-medium',
                              children: l.domain,
                            }),
                            e.jsx(P, { children: l.issuer }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                variant: 'outline',
                                children: l.type.toUpperCase(),
                              }),
                            }),
                            e.jsx(P, { children: vs(l.validFrom) }),
                            e.jsx(P, { children: vs(l.validTo) }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                className: $(
                                  l.status === 'valid'
                                    ? 'bg-green-100 text-green-800'
                                    : l.status === 'expired'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-orange-100 text-orange-800'
                                ),
                                children: l.status.toUpperCase(),
                              }),
                            }),
                            e.jsx(P, {
                              children: e.jsxs('div', {
                                className: 'flex gap-2',
                                children: [
                                  e.jsx(p, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(Qe, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                  e.jsx(p, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(B, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                  e.jsx(p, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(Ze, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                ],
                              }),
                            }),
                          ],
                        },
                        l.id
                      )
                    ),
                  }),
                ],
              }),
            }),
          ],
        }),
      ],
    });
  },
  An = ({ alerts: s }) => {
    const [a, r] = o.useState('all'),
      t = s.filter(n => a === 'all' || n.severity === a);
    return e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs(j, {
        children: [
          e.jsxs(y, {
            children: [
              e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(ls, { className: 'h-5 w-5' }),
                  'Cảnh báo bảo mật',
                ],
              }),
              e.jsx(M, { children: 'Theo dõi và xử lý các cảnh báo bảo mật' }),
            ],
          }),
          e.jsxs(g, {
            children: [
              e.jsxs('div', {
                className: 'flex justify-between items-center mb-4',
                children: [
                  e.jsxs('div', {
                    className: 'flex gap-2',
                    children: [
                      e.jsxs(p, {
                        variant: a === 'all' ? 'default' : 'outline',
                        size: 'sm',
                        onClick: () => r('all'),
                        children: ['Tất cả (', s.length, ')'],
                      }),
                      e.jsxs(p, {
                        variant: a === 'critical' ? 'default' : 'outline',
                        size: 'sm',
                        onClick: () => r('critical'),
                        children: [
                          'Critical (',
                          s.filter(n => n.severity === 'critical').length,
                          ')',
                        ],
                      }),
                      e.jsxs(p, {
                        variant: a === 'high' ? 'default' : 'outline',
                        size: 'sm',
                        onClick: () => r('high'),
                        children: [
                          'High (',
                          s.filter(n => n.severity === 'high').length,
                          ')',
                        ],
                      }),
                    ],
                  }),
                  e.jsxs(p, {
                    size: 'sm',
                    children: [
                      e.jsx(B, { className: 'h-4 w-4 mr-2' }),
                      'Refresh',
                    ],
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'space-y-4',
                children: t.map(n =>
                  e.jsx(
                    j,
                    {
                      className: $(
                        'border-l-4',
                        n.severity === 'critical'
                          ? 'border-l-red-500'
                          : n.severity === 'high'
                            ? 'border-l-orange-500'
                            : n.severity === 'medium'
                              ? 'border-l-yellow-500'
                              : 'border-l-blue-500'
                      ),
                      children: e.jsx(g, {
                        className: 'p-4',
                        children: e.jsxs('div', {
                          className: 'flex items-start justify-between',
                          children: [
                            e.jsxs('div', {
                              className: 'flex-1',
                              children: [
                                e.jsxs('div', {
                                  className: 'flex items-center gap-2 mb-2',
                                  children: [
                                    e.jsx(R, {
                                      className: Sn(n.severity),
                                      children: n.severity.toUpperCase(),
                                    }),
                                    e.jsx(R, {
                                      variant: 'outline',
                                      children: n.type,
                                    }),
                                    e.jsx('span', {
                                      className:
                                        'text-sm text-muted-foreground',
                                      children: vs(n.timestamp),
                                    }),
                                  ],
                                }),
                                e.jsx('h4', {
                                  className: 'font-medium',
                                  children: n.message,
                                }),
                                e.jsx('p', {
                                  className:
                                    'text-sm text-muted-foreground mt-1',
                                  children: n.details,
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex gap-2',
                              children: [
                                !n.resolved &&
                                  e.jsxs(p, {
                                    size: 'sm',
                                    variant: 'outline',
                                    children: [
                                      e.jsx(oe, { className: 'h-4 w-4 mr-2' }),
                                      'Resolve',
                                    ],
                                  }),
                                e.jsx(p, {
                                  size: 'sm',
                                  variant: 'ghost',
                                  children: e.jsx(He, { className: 'h-4 w-4' }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    },
                    n.id
                  )
                ),
              }),
            ],
          }),
        ],
      }),
    });
  },
  Dn = ({ logs: s }) => {
    const [a, r] = o.useState(''),
      [t, n] = o.useState('all'),
      l = s.filter(i => {
        const c =
            !a ||
            i.event.toLowerCase().includes(a.toLowerCase()) ||
            i.details.toLowerCase().includes(a.toLowerCase()) ||
            i.ip.includes(a),
          u = t === 'all' || i.severity === t;
        return c && u;
      });
    return e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs(j, {
        children: [
          e.jsxs(y, {
            children: [
              e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(Is, { className: 'h-5 w-5' }),
                  'Security Logs',
                ],
              }),
              e.jsx(M, { children: 'Nhật ký hoạt động bảo mật của hệ thống' }),
            ],
          }),
          e.jsxs(g, {
            children: [
              e.jsxs('div', {
                className: 'flex gap-4 mb-4',
                children: [
                  e.jsx('div', {
                    className: 'flex-1',
                    children: e.jsxs('div', {
                      className: 'relative',
                      children: [
                        e.jsx(Me, {
                          className:
                            'absolute left-3 top-3 h-4 w-4 text-gray-400',
                        }),
                        e.jsx(C, {
                          placeholder: 'Tìm kiếm logs...',
                          value: a,
                          onChange: i => r(i.target.value),
                          className: 'pl-10',
                        }),
                      ],
                    }),
                  }),
                  e.jsxs(Q, {
                    value: t,
                    onValueChange: n,
                    children: [
                      e.jsx(W, {
                        className: 'w-[150px]',
                        children: e.jsx(X, {}),
                      }),
                      e.jsxs(Y, {
                        children: [
                          e.jsx(N, { value: 'all', children: 'Tất cả' }),
                          e.jsx(N, { value: 'info', children: 'Info' }),
                          e.jsx(N, { value: 'warning', children: 'Warning' }),
                          e.jsx(N, { value: 'error', children: 'Error' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs(Re, {
                children: [
                  e.jsx(Ee, {
                    children: e.jsxs(ce, {
                      children: [
                        e.jsx(F, { children: 'Timestamp' }),
                        e.jsx(F, { children: 'Source' }),
                        e.jsx(F, { children: 'Event' }),
                        e.jsx(F, { children: 'Severity' }),
                        e.jsx(F, { children: 'IP' }),
                        e.jsx(F, { children: 'User' }),
                        e.jsx(F, { children: 'Details' }),
                      ],
                    }),
                  }),
                  e.jsx(qe, {
                    children: l.map(i =>
                      e.jsxs(
                        ce,
                        {
                          children: [
                            e.jsx(P, {
                              className: 'font-mono text-sm',
                              children: vs(i.timestamp),
                            }),
                            e.jsx(P, { children: i.source }),
                            e.jsx(P, {
                              className: 'font-medium',
                              children: i.event,
                            }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                className: $(
                                  i.severity === 'error'
                                    ? 'bg-red-100 text-red-800'
                                    : i.severity === 'warning'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-blue-100 text-blue-800'
                                ),
                                children: i.severity.toUpperCase(),
                              }),
                            }),
                            e.jsx(P, {
                              className: 'font-mono text-sm',
                              children: i.ip,
                            }),
                            e.jsx(P, { children: i.user || '-' }),
                            e.jsx(P, {
                              className: 'max-w-xs truncate',
                              children: i.details,
                            }),
                          ],
                        },
                        i.id
                      )
                    ),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  Ln = ({ config: s, onUpdate: a }) => {
    const [r, t] = o.useState(!1),
      n = async () => {
        t(!0);
        try {
          (await new Promise(l => setTimeout(l, 3e3)),
            a({ lastBackup: new Date().toISOString(), status: 'success' }));
        } catch (l) {
          (console.error('Backup failed:', l), a({ status: 'failed' }));
        } finally {
          t(!1);
        }
      };
    return e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs(j, {
        children: [
          e.jsxs(y, {
            children: [
              e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(ps, { className: 'h-5 w-5' }),
                  'Backup & Recovery',
                ],
              }),
              e.jsx(M, { children: 'Quản lý sao lưu và khôi phục dữ liệu' }),
            ],
          }),
          e.jsx(g, {
            className: 'space-y-6',
            children: e.jsxs('div', {
              className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
              children: [
                e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'Kích hoạt backup tự động' }),
                        e.jsx(z, {
                          checked: s.enabled,
                          onCheckedChange: l => a({ enabled: l }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'schedule',
                          children: 'Lịch backup (Cron)',
                        }),
                        e.jsx(C, {
                          id: 'schedule',
                          value: s.schedule,
                          onChange: l => a({ schedule: l.target.value }),
                          placeholder: '0 2 * * *',
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'retention',
                          children: 'Thời gian lưu trữ (ngày)',
                        }),
                        e.jsx(C, {
                          id: 'retention',
                          type: 'number',
                          value: s.retention,
                          onChange: l =>
                            a({ retention: parseInt(l.target.value) }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'location',
                          children: 'Vị trí lưu trữ',
                        }),
                        e.jsxs(Q, {
                          value: s.location,
                          onValueChange: l => a({ location: l }),
                          children: [
                            e.jsx(W, { children: e.jsx(X, {}) }),
                            e.jsxs(Y, {
                              children: [
                                e.jsx(N, {
                                  value: 'AWS S3',
                                  children: 'AWS S3',
                                }),
                                e.jsx(N, {
                                  value: 'Google Cloud',
                                  children: 'Google Cloud',
                                }),
                                e.jsx(N, { value: 'Azure', children: 'Azure' }),
                                e.jsx(N, {
                                  value: 'Local',
                                  children: 'Local Storage',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  className: 'space-y-4',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'Mã hóa backup' }),
                        e.jsx(z, {
                          checked: s.encryption,
                          onCheckedChange: l => a({ encryption: l }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Backup cuối cùng' }),
                        e.jsxs('div', {
                          className: 'flex items-center gap-2 mt-1',
                          children: [
                            e.jsx('span', {
                              className: 'text-sm',
                              children: s.lastBackup
                                ? vs(s.lastBackup)
                                : 'Chưa có backup',
                            }),
                            e.jsx(R, {
                              className: $(
                                'ml-2',
                                s.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : s.status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                              ),
                              children: s.status.toUpperCase(),
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Dung lượng backup' }),
                        e.jsxs('div', {
                          className: 'mt-1',
                          children: [
                            e.jsx(Pe, { value: 65, className: 'h-2' }),
                            e.jsx('span', {
                              className: 'text-sm text-muted-foreground',
                              children: '2.1 GB / 5 GB',
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex gap-2',
                      children: [
                        e.jsx(p, {
                          onClick: n,
                          disabled: r,
                          children: r
                            ? e.jsxs(e.Fragment, {
                                children: [
                                  e.jsx(B, {
                                    className: 'h-4 w-4 mr-2 animate-spin',
                                  }),
                                  'Đang backup...',
                                ],
                              })
                            : e.jsxs(e.Fragment, {
                                children: [
                                  e.jsx(ut, { className: 'h-4 w-4 mr-2' }),
                                  'Backup ngay',
                                ],
                              }),
                        }),
                        e.jsxs(p, {
                          variant: 'outline',
                          children: [
                            e.jsx(Qe, { className: 'h-4 w-4 mr-2' }),
                            'Khôi phục',
                          ],
                        }),
                      ],
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
  cl = () => {
    const { user: s } = pe(),
      [a, r] = o.useState(Na),
      [t, n] = o.useState(fa),
      [l, i] = o.useState(ya),
      [c, u] = o.useState(!1),
      d = (m, x) => {
        r(L => ({ ...L, [m]: { ...L[m], ...x } }));
      },
      w = async () => {
        u(!0);
        try {
          (await new Promise(m => setTimeout(m, 1e3)), r(Na), n(fa), i(ya));
        } catch (m) {
          console.error('Failed to fetch security data:', m);
        } finally {
          u(!1);
        }
      };
    return (
      o.useEffect(() => {
        w();
      }, []),
      c
        ? e.jsxs('div', {
            className: 'flex items-center justify-center h-64',
            children: [
              e.jsx(B, { className: 'h-8 w-8 animate-spin text-purple-600' }),
              e.jsx('span', {
                className: 'ml-2',
                children: 'Đang tải cấu hình bảo mật...',
              }),
            ],
          })
        : e.jsxs('div', {
            className: 'space-y-6',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('h1', {
                    className: 'text-2xl font-bold text-gray-900',
                    children: 'Cài đặt bảo mật',
                  }),
                  e.jsx('p', {
                    className: 'text-gray-600 mt-2',
                    children:
                      'Quản lý tường lửa, SSL, cảnh báo bảo mật và sao lưu hệ thống',
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-4 gap-4',
                children: [
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Firewall',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold text-green-600',
                                children: a.firewall.enabled ? 'ON' : 'OFF',
                              }),
                            ],
                          }),
                          e.jsx(re, {
                            className: $(
                              'h-8 w-8',
                              a.firewall.enabled
                                ? 'text-green-500'
                                : 'text-gray-400'
                            ),
                          }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'SSL',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold text-green-600',
                                children: a.ssl.enabled ? 'ACTIVE' : 'INACTIVE',
                              }),
                            ],
                          }),
                          e.jsx(gs, {
                            className: $(
                              'h-8 w-8',
                              a.ssl.enabled ? 'text-green-500' : 'text-gray-400'
                            ),
                          }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Cảnh báo',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold text-orange-600',
                                children: t.filter(m => !m.resolved).length,
                              }),
                            ],
                          }),
                          e.jsx(ls, { className: 'h-8 w-8 text-orange-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Backup',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold text-blue-600',
                                children:
                                  a.backup.status === 'success'
                                    ? 'OK'
                                    : 'FAILED',
                              }),
                            ],
                          }),
                          e.jsx(ps, {
                            className: $(
                              'h-8 w-8',
                              a.backup.status === 'success'
                                ? 'text-blue-500'
                                : 'text-red-500'
                            ),
                          }),
                        ],
                      }),
                    }),
                  }),
                ],
              }),
              e.jsxs(we, {
                defaultValue: 'firewall',
                className: 'space-y-6',
                children: [
                  e.jsxs(Ce, {
                    className: 'grid w-full grid-cols-5',
                    children: [
                      e.jsxs(O, {
                        value: 'firewall',
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx(re, { className: 'h-4 w-4' }),
                          'Firewall',
                        ],
                      }),
                      e.jsxs(O, {
                        value: 'ssl',
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx(gs, { className: 'h-4 w-4' }),
                          'SSL/TLS',
                        ],
                      }),
                      e.jsxs(O, {
                        value: 'alerts',
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx(ls, { className: 'h-4 w-4' }),
                          'Cảnh báo',
                        ],
                      }),
                      e.jsxs(O, {
                        value: 'logs',
                        className: 'flex items-center gap-2',
                        children: [e.jsx(Is, { className: 'h-4 w-4' }), 'Logs'],
                      }),
                      e.jsxs(O, {
                        value: 'backup',
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx(ps, { className: 'h-4 w-4' }),
                          'Backup',
                        ],
                      }),
                    ],
                  }),
                  e.jsx(H, {
                    value: 'firewall',
                    children: e.jsx(kn, {
                      config: a.firewall,
                      onUpdate: m => d('firewall', m),
                    }),
                  }),
                  e.jsx(H, {
                    value: 'ssl',
                    children: e.jsx(Tn, {
                      config: a.ssl,
                      onUpdate: m => d('ssl', m),
                    }),
                  }),
                  e.jsx(H, {
                    value: 'alerts',
                    children: e.jsx(An, { alerts: t }),
                  }),
                  e.jsx(H, { value: 'logs', children: e.jsx(Dn, { logs: l }) }),
                  e.jsx(H, {
                    value: 'backup',
                    children: e.jsx(Ln, {
                      config: a.backup,
                      onUpdate: m => d('backup', m),
                    }),
                  }),
                ],
              }),
            ],
          })
    );
  },
  ba = [
    {
      id: '1',
      timestamp: '2024-01-15T15:30:25.123Z',
      level: 'info',
      module: 'auth',
      message: 'User login successful',
      details: 'User authenticated successfully with email',
      requestId: 'req_123456',
      userId: 'user_001',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      duration: 125,
      statusCode: 200,
      endpoint: '/api/auth/login',
    },
    {
      id: '2',
      timestamp: '2024-01-15T15:29:45.456Z',
      level: 'error',
      module: 'database',
      message: 'Connection timeout',
      details:
        'Database connection pool exhausted, unable to acquire connection within timeout',
      requestId: 'req_123455',
      ip: '192.168.1.101',
      duration: 5e3,
      statusCode: 500,
      endpoint: '/api/staff/requests',
    },
    {
      id: '3',
      timestamp: '2024-01-15T15:28:15.789Z',
      level: 'warn',
      module: 'api',
      message: 'Rate limit exceeded',
      details: 'Client has exceeded rate limit of 100 requests per minute',
      requestId: 'req_123454',
      ip: '192.168.1.102',
      duration: 1,
      statusCode: 429,
      endpoint: '/api/staff/requests',
    },
    {
      id: '4',
      timestamp: '2024-01-15T15:27:30.012Z',
      level: 'debug',
      module: 'websocket',
      message: 'WebSocket connection established',
      details: 'New WebSocket connection from client',
      requestId: 'ws_123453',
      ip: '192.168.1.103',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    {
      id: '5',
      timestamp: '2024-01-15T15:26:45.345Z',
      level: 'info',
      module: 'email',
      message: 'Email notification sent',
      details: 'Daily report email sent to admin@hotel.com',
      requestId: 'email_123452',
      duration: 890,
      statusCode: 200,
    },
    {
      id: '6',
      timestamp: '2024-01-15T15:25:20.678Z',
      level: 'error',
      module: 'ai',
      message: 'OpenAI API call failed',
      details: 'OpenAI API returned 503 Service Unavailable',
      requestId: 'req_123451',
      ip: '192.168.1.100',
      duration: 2e3,
      statusCode: 503,
      endpoint: '/api/ai/chat',
    },
    {
      id: '7',
      timestamp: '2024-01-15T15:24:55.901Z',
      level: 'info',
      module: 'backup',
      message: 'Backup completed successfully',
      details: 'Database backup completed, size: 2.1GB',
      duration: 45e3,
      statusCode: 200,
    },
    {
      id: '8',
      timestamp: '2024-01-15T15:23:10.234Z',
      level: 'warn',
      module: 'security',
      message: 'Failed login attempt',
      details: 'User attempted login with incorrect credentials',
      requestId: 'req_123450',
      userId: 'user_002',
      ip: '192.168.1.104',
      userAgent: 'curl/7.68.0',
      duration: 100,
      statusCode: 401,
      endpoint: '/api/auth/login',
    },
  ],
  wa = {
    total: 15420,
    byLevel: { debug: 3240, info: 8950, warn: 2100, error: 1050, fatal: 80 },
    byModule: {
      auth: 2340,
      api: 4560,
      database: 1890,
      websocket: 890,
      email: 1200,
      ai: 890,
      backup: 340,
      security: 1450,
      system: 1860,
    },
    recentErrors: 25,
    averageResponseTime: 245,
    errorRate: 6.8,
  },
  Xa = s => {
    switch (s) {
      case 'debug':
        return 'bg-blue-100 text-blue-800';
      case 'info':
        return 'bg-green-100 text-green-800';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'fatal':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
  _s = s => {
    switch (s) {
      case 'debug':
        return e.jsx(Us, { className: 'h-4 w-4' });
      case 'info':
        return e.jsx(oe, { className: 'h-4 w-4' });
      case 'warn':
        return e.jsx(ls, { className: 'h-4 w-4' });
      case 'error':
        return e.jsx(Ns, { className: 'h-4 w-4' });
      case 'fatal':
        return e.jsx(ae, { className: 'h-4 w-4' });
      default:
        return e.jsx(Us, { className: 'h-4 w-4' });
    }
  },
  Qs = s => {
    switch (s) {
      case 'auth':
        return e.jsx(re, { className: 'h-4 w-4' });
      case 'api':
        return e.jsx(is, { className: 'h-4 w-4' });
      case 'database':
        return e.jsx(ns, { className: 'h-4 w-4' });
      case 'websocket':
        return e.jsx(Ws, { className: 'h-4 w-4' });
      case 'email':
        return e.jsx(Is, { className: 'h-4 w-4' });
      case 'ai':
        return e.jsx(Ia, { className: 'h-4 w-4' });
      case 'backup':
        return e.jsx(ps, { className: 'h-4 w-4' });
      case 'security':
        return e.jsx(re, { className: 'h-4 w-4' });
      case 'system':
        return e.jsx(sa, { className: 'h-4 w-4' });
      default:
        return e.jsx(aa, { className: 'h-4 w-4' });
    }
  },
  Ya = s =>
    new Date(s).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }),
  Ja = s => (s ? (s < 1e3 ? `${s}ms` : `${(s / 1e3).toFixed(2)}s`) : '-'),
  In = ({ log: s, isOpen: a, onClose: r }) =>
    s
      ? e.jsx('div', {
          className: $(
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            a ? 'block' : 'hidden'
          ),
          children: e.jsxs('div', {
            className:
              'bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-4',
                children: [
                  e.jsx('h2', {
                    className: 'text-xl font-bold',
                    children: 'Log Details',
                  }),
                  e.jsx(p, {
                    variant: 'ghost',
                    size: 'sm',
                    onClick: r,
                    children: e.jsx(Ns, { className: 'h-4 w-4' }),
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'space-y-4',
                children: [
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            className: 'text-sm font-medium',
                            children: 'Timestamp',
                          }),
                          e.jsx('p', {
                            className: 'text-sm font-mono',
                            children: Ya(s.timestamp),
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            className: 'text-sm font-medium',
                            children: 'Level',
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              _s(s.level),
                              e.jsx(R, {
                                className: Xa(s.level),
                                children: s.level.toUpperCase(),
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            className: 'text-sm font-medium',
                            children: 'Module',
                          }),
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              Qs(s.module),
                              e.jsx('span', {
                                className: 'text-sm',
                                children: s.module,
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            className: 'text-sm font-medium',
                            children: 'Request ID',
                          }),
                          e.jsx('p', {
                            className: 'text-sm font-mono',
                            children: s.requestId || '-',
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            className: 'text-sm font-medium',
                            children: 'User ID',
                          }),
                          e.jsx('p', {
                            className: 'text-sm font-mono',
                            children: s.userId || '-',
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            className: 'text-sm font-medium',
                            children: 'IP Address',
                          }),
                          e.jsx('p', {
                            className: 'text-sm font-mono',
                            children: s.ip || '-',
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            className: 'text-sm font-medium',
                            children: 'Duration',
                          }),
                          e.jsx('p', {
                            className: 'text-sm',
                            children: Ja(s.duration),
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            className: 'text-sm font-medium',
                            children: 'Status Code',
                          }),
                          e.jsx('p', {
                            className: 'text-sm',
                            children: s.statusCode || '-',
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        className: 'text-sm font-medium',
                        children: 'Message',
                      }),
                      e.jsx('p', {
                        className: 'text-sm bg-gray-50 p-3 rounded border',
                        children: s.message,
                      }),
                    ],
                  }),
                  s.details &&
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          className: 'text-sm font-medium',
                          children: 'Details',
                        }),
                        e.jsx('p', {
                          className:
                            'text-sm bg-gray-50 p-3 rounded border whitespace-pre-wrap',
                          children: s.details,
                        }),
                      ],
                    }),
                  s.userAgent &&
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          className: 'text-sm font-medium',
                          children: 'User Agent',
                        }),
                        e.jsx('p', {
                          className:
                            'text-sm bg-gray-50 p-3 rounded border break-all',
                          children: s.userAgent,
                        }),
                      ],
                    }),
                  s.endpoint &&
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          className: 'text-sm font-medium',
                          children: 'Endpoint',
                        }),
                        e.jsx('p', {
                          className:
                            'text-sm bg-gray-50 p-3 rounded border font-mono',
                          children: s.endpoint,
                        }),
                      ],
                    }),
                ],
              }),
            ],
          }),
        })
      : null,
  dl = () => {
    const { user: s } = pe(),
      [a, r] = o.useState(ba),
      [t, n] = o.useState(wa),
      [l, i] = o.useState(!1),
      [c, u] = o.useState(!1),
      [d, w] = o.useState(null),
      [m, x] = o.useState(!1),
      [L, S] = o.useState({
        level: 'all',
        module: 'all',
        startTime: '',
        endTime: '',
        search: '',
        requestId: '',
        userId: '',
        ip: '',
      }),
      k = a.filter(T => {
        const J = L.level === 'all' || T.level === L.level,
          D = L.module === 'all' || T.module === L.module,
          _ =
            !L.search ||
            T.message.toLowerCase().includes(L.search.toLowerCase()) ||
            T.details?.toLowerCase().includes(L.search.toLowerCase()),
          V = !L.requestId || T.requestId?.includes(L.requestId),
          de = !L.userId || T.userId?.includes(L.userId),
          ie = !L.ip || T.ip?.includes(L.ip);
        let I = !0;
        return (
          L.startTime &&
            (I = I && new Date(T.timestamp) >= new Date(L.startTime)),
          L.endTime && (I = I && new Date(T.timestamp) <= new Date(L.endTime)),
          J && D && _ && V && de && ie && I
        );
      }),
      ee = T => {
        (w(T), x(!0));
      },
      se = async () => {
        i(!0);
        try {
          await new Promise(V => setTimeout(V, 2e3));
          const T = k.map(
              V =>
                `${V.timestamp},${V.level},${V.module},"${V.message}",${V.requestId || ''},${V.userId || ''},${V.ip || ''},${V.statusCode || ''}`
            ).join(`
`),
            J = new Blob([T], { type: 'text/csv' }),
            D = window.URL.createObjectURL(J),
            _ = document.createElement('a');
          ((_.href = D),
            (_.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`),
            _.click(),
            window.URL.revokeObjectURL(D));
        } catch (T) {
          console.error('Export failed:', T);
        } finally {
          i(!1);
        }
      },
      te = async () => {
        i(!0);
        try {
          (await new Promise(T => setTimeout(T, 1e3)), r(ba), n(wa));
        } catch (T) {
          console.error('Failed to fetch logs:', T);
        } finally {
          i(!1);
        }
      },
      ne = () => {
        S({
          level: 'all',
          module: 'all',
          startTime: '',
          endTime: '',
          search: '',
          requestId: '',
          userId: '',
          ip: '',
        });
      };
    return (
      o.useEffect(() => {
        te();
      }, []),
      o.useEffect(() => {
        if (!c) return;
        const T = setInterval(() => {
          const J = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            level: ['debug', 'info', 'warn', 'error'][
              Math.floor(Math.random() * 4)
            ],
            module: ['auth', 'api', 'database', 'websocket'][
              Math.floor(Math.random() * 4)
            ],
            message: `Real-time log entry ${Date.now()}`,
            details: 'Generated for real-time demonstration',
            requestId: `req_${Date.now()}`,
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          };
          r(D => [J, ...D.slice(0, 99)]);
        }, 3e3);
        return () => clearInterval(T);
      }, [c]),
      e.jsxs('div', {
        className: 'space-y-6',
        children: [
          e.jsxs('div', {
            className: 'flex items-center justify-between',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('h1', {
                    className: 'text-2xl font-bold text-gray-900',
                    children: 'System Logs',
                  }),
                  e.jsx('p', {
                    className: 'text-gray-600 mt-2',
                    children: 'Theo dõi và phân tích logs hệ thống',
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex items-center gap-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(z, { checked: c, onCheckedChange: u }),
                      e.jsx(h, { className: 'text-sm', children: 'Real-time' }),
                    ],
                  }),
                  e.jsxs(p, {
                    onClick: te,
                    disabled: l,
                    children: [
                      e.jsx(B, {
                        className: $('h-4 w-4 mr-2', l && 'animate-spin'),
                      }),
                      'Refresh',
                    ],
                  }),
                  e.jsxs(p, {
                    onClick: se,
                    disabled: l,
                    children: [
                      e.jsx(Qe, { className: 'h-4 w-4 mr-2' }),
                      'Export',
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
            children: [
              e.jsx(j, {
                children: e.jsx(g, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm text-muted-foreground',
                            children: 'Total Logs',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: t.total.toLocaleString(),
                          }),
                        ],
                      }),
                      e.jsx(Is, { className: 'h-8 w-8 text-blue-500' }),
                    ],
                  }),
                }),
              }),
              e.jsx(j, {
                children: e.jsx(g, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm text-muted-foreground',
                            children: 'Recent Errors',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold text-red-600',
                            children: t.recentErrors,
                          }),
                        ],
                      }),
                      e.jsx(ae, { className: 'h-8 w-8 text-red-500' }),
                    ],
                  }),
                }),
              }),
              e.jsx(j, {
                children: e.jsx(g, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm text-muted-foreground',
                            children: 'Avg Response Time',
                          }),
                          e.jsxs('p', {
                            className: 'text-2xl font-bold',
                            children: [t.averageResponseTime, 'ms'],
                          }),
                        ],
                      }),
                      e.jsx(he, { className: 'h-8 w-8 text-green-500' }),
                    ],
                  }),
                }),
              }),
              e.jsx(j, {
                children: e.jsx(g, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm text-muted-foreground',
                            children: 'Error Rate',
                          }),
                          e.jsxs('p', {
                            className: 'text-2xl font-bold text-orange-600',
                            children: [t.errorRate, '%'],
                          }),
                        ],
                      }),
                      e.jsx(Ls, { className: 'h-8 w-8 text-orange-500' }),
                    ],
                  }),
                }),
              }),
            ],
          }),
          e.jsxs(we, {
            defaultValue: 'logs',
            className: 'space-y-6',
            children: [
              e.jsxs(Ce, {
                children: [
                  e.jsx(O, { value: 'logs', children: 'Logs' }),
                  e.jsx(O, { value: 'stats', children: 'Statistics' }),
                ],
              }),
              e.jsxs(H, {
                value: 'logs',
                className: 'space-y-4',
                children: [
                  e.jsxs(j, {
                    children: [
                      e.jsx(y, {
                        children: e.jsx(b, {
                          className: 'text-lg',
                          children: 'Filters',
                        }),
                      }),
                      e.jsxs(g, {
                        className: 'space-y-4',
                        children: [
                          e.jsxs('div', {
                            className:
                              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
                            children: [
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'level',
                                    children: 'Log Level',
                                  }),
                                  e.jsxs(Q, {
                                    value: L.level,
                                    onValueChange: T => S({ ...L, level: T }),
                                    children: [
                                      e.jsx(W, { children: e.jsx(X, {}) }),
                                      e.jsxs(Y, {
                                        children: [
                                          e.jsx(N, {
                                            value: 'all',
                                            children: 'All Levels',
                                          }),
                                          e.jsx(N, {
                                            value: 'debug',
                                            children: 'Debug',
                                          }),
                                          e.jsx(N, {
                                            value: 'info',
                                            children: 'Info',
                                          }),
                                          e.jsx(N, {
                                            value: 'warn',
                                            children: 'Warning',
                                          }),
                                          e.jsx(N, {
                                            value: 'error',
                                            children: 'Error',
                                          }),
                                          e.jsx(N, {
                                            value: 'fatal',
                                            children: 'Fatal',
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'module',
                                    children: 'Module',
                                  }),
                                  e.jsxs(Q, {
                                    value: L.module,
                                    onValueChange: T => S({ ...L, module: T }),
                                    children: [
                                      e.jsx(W, { children: e.jsx(X, {}) }),
                                      e.jsxs(Y, {
                                        children: [
                                          e.jsx(N, {
                                            value: 'all',
                                            children: 'All Modules',
                                          }),
                                          e.jsx(N, {
                                            value: 'auth',
                                            children: 'Auth',
                                          }),
                                          e.jsx(N, {
                                            value: 'api',
                                            children: 'API',
                                          }),
                                          e.jsx(N, {
                                            value: 'database',
                                            children: 'Database',
                                          }),
                                          e.jsx(N, {
                                            value: 'websocket',
                                            children: 'WebSocket',
                                          }),
                                          e.jsx(N, {
                                            value: 'email',
                                            children: 'Email',
                                          }),
                                          e.jsx(N, {
                                            value: 'ai',
                                            children: 'AI',
                                          }),
                                          e.jsx(N, {
                                            value: 'backup',
                                            children: 'Backup',
                                          }),
                                          e.jsx(N, {
                                            value: 'security',
                                            children: 'Security',
                                          }),
                                          e.jsx(N, {
                                            value: 'system',
                                            children: 'System',
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'search',
                                    children: 'Search',
                                  }),
                                  e.jsxs('div', {
                                    className: 'relative',
                                    children: [
                                      e.jsx(Me, {
                                        className:
                                          'absolute left-3 top-3 h-4 w-4 text-gray-400',
                                      }),
                                      e.jsx(C, {
                                        id: 'search',
                                        placeholder: 'Search logs...',
                                        value: L.search,
                                        onChange: T =>
                                          S({ ...L, search: T.target.value }),
                                        className: 'pl-10',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'startTime',
                                    children: 'Start Time',
                                  }),
                                  e.jsx(C, {
                                    id: 'startTime',
                                    type: 'datetime-local',
                                    value: L.startTime,
                                    onChange: T =>
                                      S({ ...L, startTime: T.target.value }),
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'endTime',
                                    children: 'End Time',
                                  }),
                                  e.jsx(C, {
                                    id: 'endTime',
                                    type: 'datetime-local',
                                    value: L.endTime,
                                    onChange: T =>
                                      S({ ...L, endTime: T.target.value }),
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'requestId',
                                    children: 'Request ID',
                                  }),
                                  e.jsx(C, {
                                    id: 'requestId',
                                    placeholder: 'Filter by request ID...',
                                    value: L.requestId,
                                    onChange: T =>
                                      S({ ...L, requestId: T.target.value }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsx('div', {
                            className: 'flex justify-end',
                            children: e.jsx(p, {
                              variant: 'outline',
                              onClick: ne,
                              children: 'Clear Filters',
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs(j, {
                    children: [
                      e.jsx(y, {
                        children: e.jsxs(b, {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsx('span', { children: 'System Logs' }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                c &&
                                  e.jsxs(R, {
                                    variant: 'outline',
                                    className: 'text-green-600',
                                    children: [
                                      e.jsx(Le, { className: 'h-3 w-3 mr-1' }),
                                      'Live',
                                    ],
                                  }),
                                e.jsxs('span', {
                                  className: 'text-sm text-muted-foreground',
                                  children: [
                                    'Showing ',
                                    k.length,
                                    ' of ',
                                    a.length,
                                    ' logs',
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      e.jsx(g, {
                        children: e.jsx('div', {
                          className: 'overflow-x-auto',
                          children: e.jsxs(Re, {
                            children: [
                              e.jsx(Ee, {
                                children: e.jsxs(ce, {
                                  children: [
                                    e.jsx(F, {
                                      className: 'w-[180px]',
                                      children: 'Timestamp',
                                    }),
                                    e.jsx(F, { children: 'Level' }),
                                    e.jsx(F, { children: 'Module' }),
                                    e.jsx(F, { children: 'Message' }),
                                    e.jsx(F, { children: 'Request ID' }),
                                    e.jsx(F, { children: 'Duration' }),
                                    e.jsx(F, { children: 'Status' }),
                                    e.jsx(F, { children: 'Actions' }),
                                  ],
                                }),
                              }),
                              e.jsx(qe, {
                                children: k.map(T =>
                                  e.jsxs(
                                    ce,
                                    {
                                      children: [
                                        e.jsx(P, {
                                          className: 'font-mono text-sm',
                                          children: Ya(T.timestamp),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsxs('div', {
                                            className:
                                              'flex items-center gap-2',
                                            children: [
                                              _s(T.level),
                                              e.jsx(R, {
                                                className: Xa(T.level),
                                                children: T.level.toUpperCase(),
                                              }),
                                            ],
                                          }),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsxs('div', {
                                            className:
                                              'flex items-center gap-2',
                                            children: [Qs(T.module), T.module],
                                          }),
                                        }),
                                        e.jsx(P, {
                                          className: 'max-w-xs',
                                          children: e.jsx('div', {
                                            className: 'truncate',
                                            title: T.message,
                                            children: T.message,
                                          }),
                                        }),
                                        e.jsx(P, {
                                          className: 'font-mono text-sm',
                                          children:
                                            T.requestId &&
                                            e.jsx('span', {
                                              className:
                                                'text-blue-600 cursor-pointer hover:underline',
                                              children: T.requestId,
                                            }),
                                        }),
                                        e.jsx(P, { children: Ja(T.duration) }),
                                        e.jsx(P, {
                                          children:
                                            T.statusCode &&
                                            e.jsx(R, {
                                              variant:
                                                T.statusCode >= 400
                                                  ? 'destructive'
                                                  : 'default',
                                              children: T.statusCode,
                                            }),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsx(p, {
                                            variant: 'ghost',
                                            size: 'sm',
                                            onClick: () => ee(T),
                                            children: e.jsx(He, {
                                              className: 'h-4 w-4',
                                            }),
                                          }),
                                        }),
                                      ],
                                    },
                                    T.id
                                  )
                                ),
                              }),
                            ],
                          }),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsx(H, {
                value: 'stats',
                className: 'space-y-4',
                children: e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                  children: [
                    e.jsxs(j, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Logs by Level' }),
                        }),
                        e.jsx(g, {
                          children: e.jsx('div', {
                            className: 'space-y-3',
                            children: Object.entries(t.byLevel).map(([T, J]) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center justify-between',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2',
                                      children: [
                                        _s(T),
                                        e.jsx('span', {
                                          className: 'capitalize',
                                          children: T,
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2',
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'w-32 bg-gray-200 rounded-full h-2',
                                          children: e.jsx('div', {
                                            className:
                                              'bg-blue-600 h-2 rounded-full',
                                            style: {
                                              width: `${(J / t.total) * 100}%`,
                                            },
                                          }),
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm font-medium',
                                          children: J,
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                T
                              )
                            ),
                          }),
                        }),
                      ],
                    }),
                    e.jsxs(j, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Logs by Module' }),
                        }),
                        e.jsx(g, {
                          children: e.jsx('div', {
                            className: 'space-y-3',
                            children: Object.entries(t.byModule).map(([T, J]) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center justify-between',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2',
                                      children: [
                                        Qs(T),
                                        e.jsx('span', {
                                          className: 'capitalize',
                                          children: T,
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2',
                                      children: [
                                        e.jsx('div', {
                                          className:
                                            'w-32 bg-gray-200 rounded-full h-2',
                                          children: e.jsx('div', {
                                            className:
                                              'bg-green-600 h-2 rounded-full',
                                            style: {
                                              width: `${(J / t.total) * 100}%`,
                                            },
                                          }),
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm font-medium',
                                          children: J,
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                T
                              )
                            ),
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
          e.jsx(In, { log: d, isOpen: m, onClose: () => x(!1) }),
        ],
      })
    );
  },
  Ca = [
    {
      id: '1',
      name: 'OpenAI GPT',
      type: 'ai',
      provider: 'OpenAI',
      description: 'AI-powered chatbot and content generation',
      status: 'active',
      enabled: !0,
      config: {
        baseUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-...',
        timeout: 3e4,
        retryCount: 3,
        rateLimitPerMinute: 60,
      },
      metrics: {
        totalRequests: 15420,
        successRate: 98.5,
        averageResponseTime: 1250,
        lastRequest: '2024-01-15T15:30:00Z',
        uptime: 99.8,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      lastSync: '2024-01-15T15:30:00Z',
    },
    {
      id: '2',
      name: 'Stripe Payment',
      type: 'payment',
      provider: 'Stripe',
      description: 'Payment processing and billing',
      status: 'active',
      enabled: !0,
      config: {
        baseUrl: 'https://api.stripe.com/v1',
        apiKey: 'sk_live_...',
        timeout: 1e4,
        retryCount: 2,
        rateLimitPerMinute: 100,
      },
      metrics: {
        totalRequests: 8950,
        successRate: 99.9,
        averageResponseTime: 450,
        lastRequest: '2024-01-15T15:25:00Z',
        uptime: 99.9,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
      lastSync: '2024-01-15T15:25:00Z',
    },
    {
      id: '3',
      name: 'Twilio SMS',
      type: 'notification',
      provider: 'Twilio',
      description: 'SMS notifications and alerts',
      status: 'active',
      enabled: !0,
      config: {
        baseUrl: 'https://api.twilio.com/2010-04-01',
        apiKey: 'AC...',
        timeout: 5e3,
        retryCount: 3,
        rateLimitPerMinute: 200,
      },
      metrics: {
        totalRequests: 2340,
        successRate: 97.8,
        averageResponseTime: 890,
        lastRequest: '2024-01-15T14:45:00Z',
        uptime: 98.5,
      },
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
      lastSync: '2024-01-15T14:45:00Z',
    },
    {
      id: '4',
      name: 'Google Places',
      type: 'api',
      provider: 'Google',
      description: 'Location data and place information',
      status: 'error',
      enabled: !1,
      config: {
        baseUrl: 'https://maps.googleapis.com/maps/api/place',
        apiKey: 'AIza...',
        timeout: 8e3,
        retryCount: 2,
        rateLimitPerMinute: 50,
      },
      metrics: {
        totalRequests: 1250,
        successRate: 45.2,
        averageResponseTime: 2100,
        lastRequest: '2024-01-15T13:20:00Z',
        uptime: 78.3,
      },
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T13:20:00Z',
      lastSync: '2024-01-15T13:20:00Z',
    },
    {
      id: '5',
      name: 'Slack Notifications',
      type: 'webhook',
      provider: 'Slack',
      description: 'Team notifications and alerts',
      status: 'active',
      enabled: !0,
      config: {
        webhookUrl: 'https://hooks.slack.com/services/...',
        timeout: 3e3,
        retryCount: 2,
        rateLimitPerMinute: 1,
      },
      metrics: {
        totalRequests: 450,
        successRate: 100,
        averageResponseTime: 320,
        lastRequest: '2024-01-15T15:00:00Z',
        uptime: 100,
      },
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
      lastSync: '2024-01-15T15:00:00Z',
    },
  ],
  Sa = [
    {
      id: '1',
      name: 'Payment Webhook',
      url: 'https://api.hotel.com/webhooks/payment',
      method: 'POST',
      events: ['payment.completed', 'payment.failed', 'payment.refunded'],
      active: !0,
      secret: 'whsec_...',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'hotel-system',
      },
      retryPolicy: { enabled: !0, maxRetries: 3, retryDelay: 1e3 },
      logs: [
        {
          id: '1',
          timestamp: '2024-01-15T15:30:00Z',
          event: 'payment.completed',
          statusCode: 200,
          responseTime: 245,
          success: !0,
        },
        {
          id: '2',
          timestamp: '2024-01-15T15:25:00Z',
          event: 'payment.failed',
          statusCode: 500,
          responseTime: 1e3,
          success: !1,
          error: 'Internal server error',
        },
      ],
    },
    {
      id: '2',
      name: 'Booking Webhook',
      url: 'https://api.hotel.com/webhooks/booking',
      method: 'POST',
      events: ['booking.created', 'booking.updated', 'booking.cancelled'],
      active: !0,
      secret: 'whsec_...',
      headers: { 'Content-Type': 'application/json' },
      retryPolicy: { enabled: !0, maxRetries: 5, retryDelay: 2e3 },
      logs: [],
    },
  ],
  ka = [
    {
      id: '1',
      name: 'OpenAI Production',
      service: 'OpenAI',
      type: 'api_key',
      environment: 'production',
      credentials: { apiKey: 'sk-...' },
      lastUsed: '2024-01-15T15:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      name: 'Stripe Live',
      service: 'Stripe',
      type: 'api_key',
      environment: 'production',
      credentials: { apiKey: 'sk_live_...' },
      lastUsed: '2024-01-15T15:25:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T12:00:00Z',
    },
    {
      id: '3',
      name: 'Google OAuth',
      service: 'Google',
      type: 'oauth',
      environment: 'production',
      credentials: {
        clientId: '123456789-...',
        clientSecret: 'GOCSPX-...',
        accessToken: 'ya29.a0A...',
        refreshToken: '1//0G...',
      },
      expiresAt: '2024-01-16T15:30:00Z',
      lastUsed: '2024-01-15T13:20:00Z',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T13:20:00Z',
    },
  ],
  Fn = s => {
    switch (s) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
  et = s => {
    switch (s) {
      case 'api':
        return e.jsx(is, { className: 'h-4 w-4' });
      case 'webhook':
        return e.jsx(gt, { className: 'h-4 w-4' });
      case 'database':
        return e.jsx(ns, { className: 'h-4 w-4' });
      case 'payment':
        return e.jsx(Ta, { className: 'h-4 w-4' });
      case 'notification':
        return e.jsx(ea, { className: 'h-4 w-4' });
      case 'ai':
        return e.jsx(Ia, { className: 'h-4 w-4' });
      case 'analytics':
        return e.jsx(Ls, { className: 'h-4 w-4' });
      case 'security':
        return e.jsx(re, { className: 'h-4 w-4' });
      default:
        return e.jsx(jt, { className: 'h-4 w-4' });
    }
  },
  zs = s =>
    new Date(s).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  Pn = s => new Intl.NumberFormat('vi-VN').format(s),
  Mn = ({ integration: s, isOpen: a, onClose: r, onSave: t }) => {
    const [n, l] = o.useState(s),
      [i, c] = o.useState(!1),
      [u, d] = o.useState(!1);
    o.useEffect(() => {
      l(s);
    }, [s]);
    const w = async () => {
        if (n) {
          c(!0);
          try {
            (await new Promise(x => setTimeout(x, 1e3)), t(n), r());
          } catch (x) {
            console.error('Failed to save integration:', x);
          } finally {
            c(!1);
          }
        }
      },
      m = async () => {
        c(!0);
        try {
          (await new Promise(x => setTimeout(x, 2e3)),
            alert('Integration test successful!'));
        } catch {
          alert('Integration test failed!');
        } finally {
          c(!1);
        }
      };
    return !s || !n
      ? null
      : e.jsx(ze, {
          open: a,
          onOpenChange: r,
          children: e.jsxs(Be, {
            className: 'max-w-2xl max-h-[90vh] overflow-y-auto',
            children: [
              e.jsxs(Ue, {
                children: [
                  e.jsxs(Ke, {
                    className: 'flex items-center gap-2',
                    children: [et(s.type), s.name],
                  }),
                  e.jsx(We, { children: 'Cấu hình chi tiết cho integration' }),
                ],
              }),
              e.jsxs('div', {
                className: 'space-y-4',
                children: [
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, { htmlFor: 'name', children: 'Tên' }),
                          e.jsx(C, {
                            id: 'name',
                            value: n.name,
                            onChange: x => l({ ...n, name: x.target.value }),
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            htmlFor: 'provider',
                            children: 'Provider',
                          }),
                          e.jsx(C, {
                            id: 'provider',
                            value: n.provider,
                            onChange: x =>
                              l({ ...n, provider: x.target.value }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'description', children: 'Mô tả' }),
                      e.jsx(me, {
                        id: 'description',
                        value: n.description,
                        onChange: x => l({ ...n, description: x.target.value }),
                        rows: 2,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            htmlFor: 'baseUrl',
                            children: 'Base URL',
                          }),
                          e.jsx(C, {
                            id: 'baseUrl',
                            value: n.config.baseUrl || '',
                            onChange: x =>
                              l({
                                ...n,
                                config: {
                                  ...n.config,
                                  baseUrl: x.target.value,
                                },
                              }),
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            htmlFor: 'timeout',
                            children: 'Timeout (ms)',
                          }),
                          e.jsx(C, {
                            id: 'timeout',
                            type: 'number',
                            value: n.config.timeout || '',
                            onChange: x =>
                              l({
                                ...n,
                                config: {
                                  ...n.config,
                                  timeout: parseInt(x.target.value),
                                },
                              }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'apiKey', children: 'API Key' }),
                      e.jsxs('div', {
                        className: 'flex gap-2',
                        children: [
                          e.jsx(C, {
                            id: 'apiKey',
                            type: u ? 'text' : 'password',
                            value: n.config.apiKey || '',
                            onChange: x =>
                              l({
                                ...n,
                                config: { ...n.config, apiKey: x.target.value },
                              }),
                          }),
                          e.jsx(p, {
                            type: 'button',
                            variant: 'outline',
                            size: 'sm',
                            onClick: () => d(!u),
                            children: u
                              ? e.jsx(La, { className: 'h-4 w-4' })
                              : e.jsx(He, { className: 'h-4 w-4' }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'grid grid-cols-2 gap-4',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            htmlFor: 'retryCount',
                            children: 'Retry Count',
                          }),
                          e.jsx(C, {
                            id: 'retryCount',
                            type: 'number',
                            value: n.config.retryCount || '',
                            onChange: x =>
                              l({
                                ...n,
                                config: {
                                  ...n.config,
                                  retryCount: parseInt(x.target.value),
                                },
                              }),
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, {
                            htmlFor: 'rateLimit',
                            children: 'Rate Limit/min',
                          }),
                          e.jsx(C, {
                            id: 'rateLimit',
                            type: 'number',
                            value: n.config.rateLimitPerMinute || '',
                            onChange: x =>
                              l({
                                ...n,
                                config: {
                                  ...n.config,
                                  rateLimitPerMinute: parseInt(x.target.value),
                                },
                              }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsxs('div', {
                        children: [
                          e.jsx(h, { children: 'Kích hoạt' }),
                          e.jsx('p', {
                            className: 'text-sm text-muted-foreground',
                            children: 'Bật/tắt integration này',
                          }),
                        ],
                      }),
                      e.jsx(z, {
                        checked: n.enabled,
                        onCheckedChange: x => l({ ...n, enabled: x }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex justify-end gap-2',
                    children: [
                      e.jsxs(p, {
                        variant: 'outline',
                        onClick: m,
                        disabled: i,
                        children: [
                          e.jsx(oe, { className: 'h-4 w-4 mr-2' }),
                          'Test Connection',
                        ],
                      }),
                      e.jsx(p, {
                        onClick: w,
                        disabled: i,
                        children: i
                          ? e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(B, {
                                  className: 'h-4 w-4 mr-2 animate-spin',
                                }),
                                'Đang lưu...',
                              ],
                            })
                          : e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(je, { className: 'h-4 w-4 mr-2' }),
                                'Lưu',
                              ],
                            }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        });
  },
  Rn = ({ isOpen: s, onClose: a, onAdd: r }) => {
    const [t, n] = o.useState({
        name: '',
        type: 'api',
        provider: '',
        description: '',
        baseUrl: '',
        apiKey: '',
        timeout: 3e4,
        retryCount: 3,
        rateLimitPerMinute: 100,
      }),
      [l, i] = o.useState(!1),
      c = async u => {
        (u.preventDefault(), i(!0));
        try {
          await new Promise(w => setTimeout(w, 1e3));
          const d = {
            id: Date.now().toString(),
            name: t.name,
            type: t.type,
            provider: t.provider,
            description: t.description,
            status: 'inactive',
            enabled: !1,
            config: {
              baseUrl: t.baseUrl,
              apiKey: t.apiKey,
              timeout: t.timeout,
              retryCount: t.retryCount,
              rateLimitPerMinute: t.rateLimitPerMinute,
            },
            metrics: {
              totalRequests: 0,
              successRate: 0,
              averageResponseTime: 0,
              lastRequest: '',
              uptime: 0,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastSync: '',
          };
          (r(d),
            a(),
            n({
              name: '',
              type: 'api',
              provider: '',
              description: '',
              baseUrl: '',
              apiKey: '',
              timeout: 3e4,
              retryCount: 3,
              rateLimitPerMinute: 100,
            }));
        } catch (d) {
          console.error('Failed to add integration:', d);
        } finally {
          i(!1);
        }
      };
    return e.jsx(ze, {
      open: s,
      onOpenChange: a,
      children: e.jsxs(Be, {
        className: 'max-w-2xl',
        children: [
          e.jsxs(Ue, {
            children: [
              e.jsx(Ke, { children: 'Thêm Integration mới' }),
              e.jsx(We, {
                children: 'Tạo integration mới với third-party service',
              }),
            ],
          }),
          e.jsxs('form', {
            onSubmit: c,
            className: 'space-y-4',
            children: [
              e.jsxs('div', {
                className: 'grid grid-cols-2 gap-4',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'name', children: 'Tên *' }),
                      e.jsx(C, {
                        id: 'name',
                        value: t.name,
                        onChange: u => n({ ...t, name: u.target.value }),
                        required: !0,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'type', children: 'Loại *' }),
                      e.jsxs(Q, {
                        value: t.type,
                        onValueChange: u => n({ ...t, type: u }),
                        children: [
                          e.jsx(W, { children: e.jsx(X, {}) }),
                          e.jsxs(Y, {
                            children: [
                              e.jsx(N, { value: 'api', children: 'API' }),
                              e.jsx(N, {
                                value: 'webhook',
                                children: 'Webhook',
                              }),
                              e.jsx(N, {
                                value: 'database',
                                children: 'Database',
                              }),
                              e.jsx(N, {
                                value: 'payment',
                                children: 'Payment',
                              }),
                              e.jsx(N, {
                                value: 'notification',
                                children: 'Notification',
                              }),
                              e.jsx(N, { value: 'ai', children: 'AI' }),
                              e.jsx(N, {
                                value: 'analytics',
                                children: 'Analytics',
                              }),
                              e.jsx(N, {
                                value: 'security',
                                children: 'Security',
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'provider', children: 'Provider *' }),
                  e.jsx(C, {
                    id: 'provider',
                    value: t.provider,
                    onChange: u => n({ ...t, provider: u.target.value }),
                    required: !0,
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'description', children: 'Mô tả' }),
                  e.jsx(me, {
                    id: 'description',
                    value: t.description,
                    onChange: u => n({ ...t, description: u.target.value }),
                    rows: 2,
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'baseUrl', children: 'Base URL *' }),
                  e.jsx(C, {
                    id: 'baseUrl',
                    value: t.baseUrl,
                    onChange: u => n({ ...t, baseUrl: u.target.value }),
                    placeholder: 'https://api.example.com',
                    required: !0,
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'apiKey', children: 'API Key *' }),
                  e.jsx(C, {
                    id: 'apiKey',
                    type: 'password',
                    value: t.apiKey,
                    onChange: u => n({ ...t, apiKey: u.target.value }),
                    required: !0,
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-3 gap-4',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'timeout',
                        children: 'Timeout (ms)',
                      }),
                      e.jsx(C, {
                        id: 'timeout',
                        type: 'number',
                        value: t.timeout,
                        onChange: u =>
                          n({ ...t, timeout: parseInt(u.target.value) }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'retryCount',
                        children: 'Retry Count',
                      }),
                      e.jsx(C, {
                        id: 'retryCount',
                        type: 'number',
                        value: t.retryCount,
                        onChange: u =>
                          n({ ...t, retryCount: parseInt(u.target.value) }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'rateLimit',
                        children: 'Rate Limit/min',
                      }),
                      e.jsx(C, {
                        id: 'rateLimit',
                        type: 'number',
                        value: t.rateLimitPerMinute,
                        onChange: u =>
                          n({
                            ...t,
                            rateLimitPerMinute: parseInt(u.target.value),
                          }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex justify-end gap-2',
                children: [
                  e.jsx(p, {
                    type: 'button',
                    variant: 'outline',
                    onClick: a,
                    children: 'Hủy',
                  }),
                  e.jsx(p, {
                    type: 'submit',
                    disabled: l,
                    children: l
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(B, {
                              className: 'h-4 w-4 mr-2 animate-spin',
                            }),
                            'Đang tạo...',
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                            'Tạo Integration',
                          ],
                        }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    });
  },
  hl = () => {
    const { user: s } = pe(),
      [a, r] = o.useState(Ca),
      [t, n] = o.useState(Sa),
      [l, i] = o.useState(ka),
      [c, u] = o.useState(!1),
      [d, w] = o.useState(null),
      [m, x] = o.useState(!1),
      [L, S] = o.useState(!1),
      [k, ee] = o.useState('all'),
      [se, te] = o.useState('all'),
      [ne, T] = o.useState(''),
      J = a.filter(v => {
        const q = k === 'all' || v.status === k,
          G = se === 'all' || v.type === se,
          Se =
            !ne ||
            v.name.toLowerCase().includes(ne.toLowerCase()) ||
            v.provider.toLowerCase().includes(ne.toLowerCase());
        return q && G && Se;
      }),
      D = v => {
        (w(v), x(!0));
      },
      _ = v => {
        (r(q => q.map(G => (G.id === v.id ? v : G))), w(null));
      },
      V = v => {
        r(q => [...q, v]);
      },
      de = v => {
        confirm('Bạn có chắc muốn xóa integration này?') &&
          r(q => q.filter(G => G.id !== v));
      },
      ie = v => {
        r(q =>
          q.map(G =>
            G.id === v
              ? {
                  ...G,
                  enabled: !G.enabled,
                  status: G.enabled ? 'inactive' : 'active',
                }
              : G
          )
        );
      },
      I = async () => {
        u(!0);
        try {
          (await new Promise(v => setTimeout(v, 1e3)), r(Ca), n(Sa), i(ka));
        } catch (v) {
          console.error('Failed to fetch integrations:', v);
        } finally {
          u(!1);
        }
      };
    return (
      o.useEffect(() => {
        I();
      }, []),
      c
        ? e.jsxs('div', {
            className: 'flex items-center justify-center h-64',
            children: [
              e.jsx(B, { className: 'h-8 w-8 animate-spin text-purple-600' }),
              e.jsx('span', {
                className: 'ml-2',
                children: 'Đang tải integrations...',
              }),
            ],
          })
        : e.jsxs('div', {
            className: 'space-y-6',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  e.jsxs('div', {
                    children: [
                      e.jsx('h1', {
                        className: 'text-2xl font-bold text-gray-900',
                        children: 'Integrations',
                      }),
                      e.jsx('p', {
                        className: 'text-gray-600 mt-2',
                        children: 'Quản lý tích hợp với các dịch vụ bên thứ ba',
                      }),
                    ],
                  }),
                  e.jsxs(p, {
                    onClick: () => S(!0),
                    children: [
                      e.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                      'Thêm Integration',
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-4 gap-4',
                children: [
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Total Integrations',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold',
                                children: a.length,
                              }),
                            ],
                          }),
                          e.jsx(Da, { className: 'h-8 w-8 text-blue-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Active',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold text-green-600',
                                children: a.filter(v => v.status === 'active')
                                  .length,
                              }),
                            ],
                          }),
                          e.jsx(oe, { className: 'h-8 w-8 text-green-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Errors',
                              }),
                              e.jsx('p', {
                                className: 'text-2xl font-bold text-red-600',
                                children: a.filter(v => v.status === 'error')
                                  .length,
                              }),
                            ],
                          }),
                          e.jsx(Ns, { className: 'h-8 w-8 text-red-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsx(g, {
                      className: 'p-4',
                      children: e.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            children: [
                              e.jsx('p', {
                                className: 'text-sm text-muted-foreground',
                                children: 'Avg Success Rate',
                              }),
                              e.jsxs('p', {
                                className: 'text-2xl font-bold',
                                children: [
                                  (
                                    a.reduce(
                                      (v, q) => v + q.metrics.successRate,
                                      0
                                    ) / a.length
                                  ).toFixed(1),
                                  '%',
                                ],
                              }),
                            ],
                          }),
                          e.jsx(he, { className: 'h-8 w-8 text-blue-500' }),
                        ],
                      }),
                    }),
                  }),
                ],
              }),
              e.jsxs(we, {
                defaultValue: 'integrations',
                className: 'space-y-6',
                children: [
                  e.jsxs(Ce, {
                    className: 'grid w-full grid-cols-3',
                    children: [
                      e.jsx(O, {
                        value: 'integrations',
                        children: 'Integrations',
                      }),
                      e.jsx(O, { value: 'webhooks', children: 'Webhooks' }),
                      e.jsx(O, {
                        value: 'credentials',
                        children: 'Credentials',
                      }),
                    ],
                  }),
                  e.jsxs(H, {
                    value: 'integrations',
                    className: 'space-y-4',
                    children: [
                      e.jsxs(j, {
                        children: [
                          e.jsx(y, {
                            children: e.jsx(b, { children: 'Filters' }),
                          }),
                          e.jsx(g, {
                            children: e.jsxs('div', {
                              className: 'flex flex-col sm:flex-row gap-4',
                              children: [
                                e.jsx('div', {
                                  className: 'flex-1',
                                  children: e.jsxs('div', {
                                    className: 'relative',
                                    children: [
                                      e.jsx(Me, {
                                        className:
                                          'absolute left-3 top-3 h-4 w-4 text-gray-400',
                                      }),
                                      e.jsx(C, {
                                        placeholder: 'Tìm kiếm integrations...',
                                        value: ne,
                                        onChange: v => T(v.target.value),
                                        className: 'pl-10',
                                      }),
                                    ],
                                  }),
                                }),
                                e.jsxs('div', {
                                  className: 'flex gap-2',
                                  children: [
                                    e.jsxs(Q, {
                                      value: k,
                                      onValueChange: ee,
                                      children: [
                                        e.jsx(W, {
                                          className: 'w-[150px]',
                                          children: e.jsx(X, {}),
                                        }),
                                        e.jsxs(Y, {
                                          children: [
                                            e.jsx(N, {
                                              value: 'all',
                                              children: 'All Status',
                                            }),
                                            e.jsx(N, {
                                              value: 'active',
                                              children: 'Active',
                                            }),
                                            e.jsx(N, {
                                              value: 'inactive',
                                              children: 'Inactive',
                                            }),
                                            e.jsx(N, {
                                              value: 'error',
                                              children: 'Error',
                                            }),
                                            e.jsx(N, {
                                              value: 'testing',
                                              children: 'Testing',
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs(Q, {
                                      value: se,
                                      onValueChange: te,
                                      children: [
                                        e.jsx(W, {
                                          className: 'w-[150px]',
                                          children: e.jsx(X, {}),
                                        }),
                                        e.jsxs(Y, {
                                          children: [
                                            e.jsx(N, {
                                              value: 'all',
                                              children: 'All Types',
                                            }),
                                            e.jsx(N, {
                                              value: 'api',
                                              children: 'API',
                                            }),
                                            e.jsx(N, {
                                              value: 'webhook',
                                              children: 'Webhook',
                                            }),
                                            e.jsx(N, {
                                              value: 'payment',
                                              children: 'Payment',
                                            }),
                                            e.jsx(N, {
                                              value: 'notification',
                                              children: 'Notification',
                                            }),
                                            e.jsx(N, {
                                              value: 'ai',
                                              children: 'AI',
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        ],
                      }),
                      e.jsx('div', {
                        className:
                          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
                        children: J.map(v =>
                          e.jsxs(
                            j,
                            {
                              children: [
                                e.jsxs(y, {
                                  className: 'pb-3',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between',
                                      children: [
                                        e.jsxs('div', {
                                          className: 'flex items-center gap-2',
                                          children: [
                                            et(v.type),
                                            e.jsx(b, {
                                              className: 'text-lg',
                                              children: v.name,
                                            }),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className: 'flex items-center gap-2',
                                          children: [
                                            e.jsx(R, {
                                              className: Fn(v.status),
                                              children: v.status.toUpperCase(),
                                            }),
                                            e.jsx(z, {
                                              checked: v.enabled,
                                              onCheckedChange: () => ie(v.id),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsx(M, { children: v.description }),
                                  ],
                                }),
                                e.jsxs(g, {
                                  className: 'space-y-3',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between text-sm',
                                      children: [
                                        e.jsx('span', {
                                          className: 'text-muted-foreground',
                                          children: 'Provider:',
                                        }),
                                        e.jsx('span', {
                                          className: 'font-medium',
                                          children: v.provider,
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between text-sm',
                                      children: [
                                        e.jsx('span', {
                                          className: 'text-muted-foreground',
                                          children: 'Success Rate:',
                                        }),
                                        e.jsxs('span', {
                                          className: 'font-medium',
                                          children: [
                                            v.metrics.successRate,
                                            '%',
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between text-sm',
                                      children: [
                                        e.jsx('span', {
                                          className: 'text-muted-foreground',
                                          children: 'Requests:',
                                        }),
                                        e.jsx('span', {
                                          className: 'font-medium',
                                          children: Pn(v.metrics.totalRequests),
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between text-sm',
                                      children: [
                                        e.jsx('span', {
                                          className: 'text-muted-foreground',
                                          children: 'Avg Response:',
                                        }),
                                        e.jsxs('span', {
                                          className: 'font-medium',
                                          children: [
                                            v.metrics.averageResponseTime,
                                            'ms',
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className: 'text-sm',
                                      children: [
                                        e.jsx('span', {
                                          className: 'text-muted-foreground',
                                          children: 'Uptime:',
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'flex items-center gap-2 mt-1',
                                          children: [
                                            e.jsx(Pe, {
                                              value: v.metrics.uptime,
                                              className: 'h-2',
                                            }),
                                            e.jsxs('span', {
                                              className: 'font-medium',
                                              children: [v.metrics.uptime, '%'],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'flex justify-between items-center pt-2 border-t',
                                      children: [
                                        e.jsxs('div', {
                                          className:
                                            'text-xs text-muted-foreground',
                                          children: [
                                            'Last sync: ',
                                            v.lastSync
                                              ? zs(v.lastSync)
                                              : 'Never',
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className: 'flex gap-1',
                                          children: [
                                            e.jsx(p, {
                                              variant: 'ghost',
                                              size: 'sm',
                                              onClick: () => D(v),
                                              children: e.jsx(_e, {
                                                className: 'h-4 w-4',
                                              }),
                                            }),
                                            e.jsx(p, {
                                              variant: 'ghost',
                                              size: 'sm',
                                              onClick: () => de(v.id),
                                              children: e.jsx(Ze, {
                                                className: 'h-4 w-4',
                                              }),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            },
                            v.id
                          )
                        ),
                      }),
                    ],
                  }),
                  e.jsx(H, {
                    value: 'webhooks',
                    className: 'space-y-4',
                    children: e.jsxs(j, {
                      children: [
                        e.jsx(y, {
                          children: e.jsxs(b, {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsx('span', { children: 'Webhook Endpoints' }),
                              e.jsxs(p, {
                                size: 'sm',
                                children: [
                                  e.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                                  'Add Webhook',
                                ],
                              }),
                            ],
                          }),
                        }),
                        e.jsx(g, {
                          children: e.jsxs(Re, {
                            children: [
                              e.jsx(Ee, {
                                children: e.jsxs(ce, {
                                  children: [
                                    e.jsx(F, { children: 'Name' }),
                                    e.jsx(F, { children: 'URL' }),
                                    e.jsx(F, { children: 'Method' }),
                                    e.jsx(F, { children: 'Events' }),
                                    e.jsx(F, { children: 'Status' }),
                                    e.jsx(F, { children: 'Actions' }),
                                  ],
                                }),
                              }),
                              e.jsx(qe, {
                                children: t.map(v =>
                                  e.jsxs(
                                    ce,
                                    {
                                      children: [
                                        e.jsx(P, {
                                          className: 'font-medium',
                                          children: v.name,
                                        }),
                                        e.jsx(P, {
                                          className: 'font-mono text-sm',
                                          children: v.url,
                                        }),
                                        e.jsx(P, {
                                          children: e.jsx(R, {
                                            variant: 'outline',
                                            children: v.method,
                                          }),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsxs('div', {
                                            className: 'flex flex-wrap gap-1',
                                            children: [
                                              v.events.slice(0, 2).map((q, G) =>
                                                e.jsx(
                                                  R,
                                                  {
                                                    variant: 'secondary',
                                                    className: 'text-xs',
                                                    children: q,
                                                  },
                                                  G
                                                )
                                              ),
                                              v.events.length > 2 &&
                                                e.jsxs(R, {
                                                  variant: 'secondary',
                                                  className: 'text-xs',
                                                  children: [
                                                    '+',
                                                    v.events.length - 2,
                                                  ],
                                                }),
                                            ],
                                          }),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsx(R, {
                                            className: v.active
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-gray-100 text-gray-800',
                                            children: v.active
                                              ? 'Active'
                                              : 'Inactive',
                                          }),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsxs('div', {
                                            className: 'flex gap-2',
                                            children: [
                                              e.jsx(p, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(_e, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                              e.jsx(p, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(He, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                              e.jsx(p, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(Ze, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                            ],
                                          }),
                                        }),
                                      ],
                                    },
                                    v.id
                                  )
                                ),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  }),
                  e.jsx(H, {
                    value: 'credentials',
                    className: 'space-y-4',
                    children: e.jsxs(j, {
                      children: [
                        e.jsx(y, {
                          children: e.jsxs(b, {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsx('span', { children: 'API Credentials' }),
                              e.jsxs(p, {
                                size: 'sm',
                                children: [
                                  e.jsx(Fe, { className: 'h-4 w-4 mr-2' }),
                                  'Add Credential',
                                ],
                              }),
                            ],
                          }),
                        }),
                        e.jsx(g, {
                          children: e.jsxs(Re, {
                            children: [
                              e.jsx(Ee, {
                                children: e.jsxs(ce, {
                                  children: [
                                    e.jsx(F, { children: 'Name' }),
                                    e.jsx(F, { children: 'Service' }),
                                    e.jsx(F, { children: 'Type' }),
                                    e.jsx(F, { children: 'Environment' }),
                                    e.jsx(F, { children: 'Expires' }),
                                    e.jsx(F, { children: 'Last Used' }),
                                    e.jsx(F, { children: 'Actions' }),
                                  ],
                                }),
                              }),
                              e.jsx(qe, {
                                children: l.map(v =>
                                  e.jsxs(
                                    ce,
                                    {
                                      children: [
                                        e.jsx(P, {
                                          className: 'font-medium',
                                          children: v.name,
                                        }),
                                        e.jsx(P, { children: v.service }),
                                        e.jsx(P, {
                                          children: e.jsx(R, {
                                            variant: 'outline',
                                            children: v.type,
                                          }),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsx(R, {
                                            className: $(
                                              v.environment === 'production'
                                                ? 'bg-red-100 text-red-800'
                                                : v.environment === 'staging'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-blue-100 text-blue-800'
                                            ),
                                            children: v.environment,
                                          }),
                                        }),
                                        e.jsx(P, {
                                          children: v.expiresAt
                                            ? zs(v.expiresAt)
                                            : 'Never',
                                        }),
                                        e.jsx(P, {
                                          children: v.lastUsed
                                            ? zs(v.lastUsed)
                                            : 'Never',
                                        }),
                                        e.jsx(P, {
                                          children: e.jsxs('div', {
                                            className: 'flex gap-2',
                                            children: [
                                              e.jsx(p, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(_e, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                              e.jsx(p, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(B, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                              e.jsx(p, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(Ze, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                            ],
                                          }),
                                        }),
                                      ],
                                    },
                                    v.id
                                  )
                                ),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  }),
                ],
              }),
              e.jsx(Mn, {
                integration: d,
                isOpen: m,
                onClose: () => x(!1),
                onSave: _,
              }),
              e.jsx(Rn, { isOpen: L, onClose: () => S(!1), onAdd: V }),
            ],
          })
    );
  },
  En = () => {
    const [s, a] = o.useState(24),
      [r, t] = o.useState(''),
      {
        data: n,
        isLoading: l,
        isError: i,
        refetch: c,
      } = Ks({
        queryKey: ['summaries', 'recent', s],
        queryFn: async () => {
          const x = await fetch(`/api/summaries/recent/${s}`);
          if (!x.ok) throw new Error('Failed to fetch recent call summaries');
          return x.json();
        },
      }),
      u = x =>
        (x instanceof Date ? x : new Date(x)).toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      d = x => {
        if (!x) return '00:00';
        const L = parseInt(x, 10);
        if (!isNaN(L) && /^\d+$/.test(x)) {
          const S = Math.floor(L / 60)
              .toString()
              .padStart(2, '0'),
            k = (L % 60).toString().padStart(2, '0');
          return `${S}:${k}`;
        }
        return x;
      },
      w = x => {
        a(x);
      },
      m = n?.summaries.filter(x =>
        r
          ? x.roomNumber && x.roomNumber.toLowerCase().includes(r.toLowerCase())
          : !0
      );
    return e.jsxs('div', {
      className: 'container mx-auto p-5',
      children: [
        e.jsxs('header', {
          className: 'mb-8',
          children: [
            e.jsxs('div', {
              className: 'flex items-center justify-between mb-4',
              children: [
                e.jsx('h1', {
                  className: 'text-3xl font-bold text-primary',
                  children: 'Call History',
                }),
                e.jsxs('div', {
                  className: 'flex space-x-3',
                  children: [
                    e.jsx(le, {
                      to: '/',
                      children: e.jsxs('button', {
                        className:
                          'px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center',
                        children: [
                          e.jsx('span', {
                            className:
                              'material-icons align-middle mr-1 text-sm',
                            children: 'home',
                          }),
                          'Home',
                        ],
                      }),
                    }),
                    e.jsxs('button', {
                      onClick: () => c(),
                      className:
                        'px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center',
                      children: [
                        e.jsx('span', {
                          className: 'material-icons align-middle mr-1 text-sm',
                          children: 'refresh',
                        }),
                        'Refresh',
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsx('div', {
              className: 'bg-white p-4 rounded-lg shadow-sm mb-4',
              children: e.jsxs('div', {
                className:
                  'flex flex-col md:flex-row md:items-center md:justify-between gap-4',
                children: [
                  e.jsxs('div', {
                    className: 'space-y-2',
                    children: [
                      e.jsx('h3', {
                        className: 'font-medium text-gray-700',
                        children: 'Time Period',
                      }),
                      e.jsxs('div', {
                        className: 'flex space-x-2',
                        children: [
                          e.jsx('button', {
                            onClick: () => w(24),
                            className: `px-3 py-1 rounded-md ${s === 24 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`,
                            children: '24 hours',
                          }),
                          e.jsx('button', {
                            onClick: () => w(48),
                            className: `px-3 py-1 rounded-md ${s === 48 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`,
                            children: '48 hours',
                          }),
                          e.jsx('button', {
                            onClick: () => w(72),
                            className: `px-3 py-1 rounded-md ${s === 72 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`,
                            children: '72 hours',
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'space-y-2 md:w-1/3',
                    children: [
                      e.jsx('h3', {
                        className: 'font-medium text-gray-700',
                        children: 'Filter by Room',
                      }),
                      e.jsx('input', {
                        type: 'text',
                        placeholder: 'Enter room number...',
                        value: r,
                        onChange: x => t(x.target.value),
                        className:
                          'w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                      }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        }),
        e.jsx('main', {
          children: l
            ? e.jsx('div', {
                className:
                  'bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-64',
                children: e.jsxs('div', {
                  className: 'flex flex-col items-center',
                  children: [
                    e.jsx('div', {
                      className:
                        'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4',
                    }),
                    e.jsx('p', {
                      className: 'text-gray-500',
                      children: 'Loading call history...',
                    }),
                  ],
                }),
              })
            : i
              ? e.jsx('div', {
                  className:
                    'bg-red-50 p-6 rounded-lg shadow-sm flex justify-center items-center h-64',
                  children: e.jsxs('div', {
                    className: 'flex flex-col items-center text-center',
                    children: [
                      e.jsx('span', {
                        className: 'material-icons text-red-500 text-4xl mb-3',
                        children: 'error_outline',
                      }),
                      e.jsx('p', {
                        className: 'text-red-700 mb-2',
                        children: 'Unable to load call history',
                      }),
                      e.jsx('p', {
                        className: 'text-red-500 text-sm',
                        children:
                          'Please try again later or contact administrator.',
                      }),
                      e.jsx('button', {
                        onClick: () => c(),
                        className:
                          'mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors',
                        children: 'Try Again',
                      }),
                    ],
                  }),
                })
              : m?.length
                ? e.jsx('div', {
                    className: 'bg-white p-4 rounded-lg shadow overflow-hidden',
                    children: e.jsx('div', {
                      className: 'overflow-x-auto',
                      children: e.jsxs('table', {
                        className: 'w-full',
                        children: [
                          e.jsx('thead', {
                            children: e.jsxs('tr', {
                              className: 'bg-gray-50',
                              children: [
                                e.jsx('th', {
                                  className:
                                    'p-3 text-left text-sm font-medium text-gray-500',
                                  children: 'Time',
                                }),
                                e.jsx('th', {
                                  className:
                                    'p-3 text-left text-sm font-medium text-gray-500',
                                  children: 'Room',
                                }),
                                e.jsx('th', {
                                  className:
                                    'p-3 text-left text-sm font-medium text-gray-500',
                                  children: 'Duration',
                                }),
                                e.jsx('th', {
                                  className:
                                    'p-3 text-left text-sm font-medium text-gray-500',
                                  children: 'Summary',
                                }),
                                e.jsx('th', {
                                  className:
                                    'p-3 text-center text-sm font-medium text-gray-500',
                                  children: 'Actions',
                                }),
                              ],
                            }),
                          }),
                          e.jsx('tbody', {
                            children: m.map(x =>
                              e.jsxs(
                                'tr',
                                {
                                  className:
                                    'border-t border-gray-100 hover:bg-gray-50',
                                  children: [
                                    e.jsx('td', {
                                      className: 'p-3 text-sm text-gray-700',
                                      children: u(x.timestamp),
                                    }),
                                    e.jsx('td', {
                                      className: 'p-3 text-sm text-gray-700',
                                      children: x.roomNumber || 'Unknown',
                                    }),
                                    e.jsx('td', {
                                      className: 'p-3 text-sm text-gray-700',
                                      children: d(x.duration),
                                    }),
                                    e.jsx('td', {
                                      className:
                                        'p-3 text-sm text-gray-700 max-w-md',
                                      children: e.jsx('div', {
                                        className: 'truncate',
                                        children: x.content,
                                      }),
                                    }),
                                    e.jsx('td', {
                                      className: 'p-3 text-center',
                                      children: e.jsx(le, {
                                        to: `/call-details/${x.callId}`,
                                        children: e.jsxs('button', {
                                          className:
                                            'inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-xs',
                                          children: [
                                            e.jsx('span', {
                                              className:
                                                'material-icons text-sm mr-1',
                                              children: 'visibility',
                                            }),
                                            'View Details',
                                          ],
                                        }),
                                      }),
                                    }),
                                  ],
                                },
                                x.id
                              )
                            ),
                          }),
                        ],
                      }),
                    }),
                  })
                : e.jsx('div', {
                    className:
                      'bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-64',
                    children: e.jsxs('div', {
                      className: 'flex flex-col items-center text-center',
                      children: [
                        e.jsx('span', {
                          className:
                            'material-icons text-gray-400 text-4xl mb-3',
                          children: 'history',
                        }),
                        e.jsx('p', {
                          className: 'text-gray-500 mb-2',
                          children: 'No calls found',
                        }),
                        e.jsx('p', {
                          className: 'text-gray-400 text-sm',
                          children: r
                            ? `No calls from room "${r}" in the last ${s} hours.`
                            : `No calls found in the last ${s} hours.`,
                        }),
                      ],
                    }),
                  }),
        }),
        e.jsx('div', {
          className: 'mt-6 text-center text-gray-500 text-sm',
          children: e.jsxs('p', {
            children: [
              'Showing call history from the last ',
              s,
              ' hours • Total: ',
              n?.count || 0,
              ' calls',
            ],
          }),
        }),
      ],
    });
  },
  ol = Object.freeze(
    Object.defineProperty(
      { __proto__: null, default: En },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  qn = () => {
    const a = Dt().callId,
      [r, t] = o.useState(!1),
      {
        data: n,
        isLoading: l,
        isError: i,
      } = Ks({
        queryKey: ['summary', a],
        queryFn: async () => {
          const k = await fetch(`/api/summaries/${a}`);
          if (!k.ok) throw new Error('Failed to fetch call summary');
          return k.json();
        },
      }),
      {
        data: c,
        isLoading: u,
        isError: d,
      } = Ks({
        queryKey: ['transcripts', a],
        queryFn: async () => {
          const k = await fetch(`/api/transcripts/${a}`);
          if (!k.ok) throw new Error('Failed to fetch call transcripts');
          return k.json();
        },
      }),
      w = k =>
        k
          ? (k instanceof Date ? k : new Date(k)).toLocaleString('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : 'Unknown',
      m = k => k || '00:00',
      x = async () => {
        if (c?.length)
          try {
            t(!0);
            const k = c.map(
              ee =>
                `${ee.role === 'assistant' ? 'Assistant' : 'Guest'}: ${ee.content}`
            ).join(`

`);
            (await navigator.clipboard.writeText(k),
              setTimeout(() => {
                t(!1);
              }, 1500));
          } catch (k) {
            (console.error('Could not copy text: ', k), t(!1));
          }
      },
      L = l || u,
      S = i || d;
    return e.jsxs('div', {
      className: 'container mx-auto p-5',
      children: [
        e.jsx('header', {
          className: 'mb-8',
          children: e.jsxs('div', {
            className: 'flex items-center justify-between mb-4',
            children: [
              e.jsx('h1', {
                className: 'text-3xl font-bold text-primary',
                children: 'Call Details',
              }),
              e.jsxs('div', {
                className: 'flex space-x-3',
                children: [
                  e.jsx(le, {
                    to: '/call-history',
                    children: e.jsxs('button', {
                      className:
                        'px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center',
                      children: [
                        e.jsx('span', {
                          className: 'material-icons align-middle mr-1 text-sm',
                          children: 'history',
                        }),
                        'Call History',
                      ],
                    }),
                  }),
                  e.jsx(le, {
                    to: '/',
                    children: e.jsxs('button', {
                      className:
                        'px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center',
                      children: [
                        e.jsx('span', {
                          className: 'material-icons align-middle mr-1 text-sm',
                          children: 'home',
                        }),
                        'Home',
                      ],
                    }),
                  }),
                ],
              }),
            ],
          }),
        }),
        e.jsx('main', {
          className: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
          children: L
            ? e.jsx('div', {
                className:
                  'col-span-1 lg:col-span-3 bg-white p-6 rounded-lg shadow-sm flex justify-center items-center h-64',
                children: e.jsxs('div', {
                  className: 'flex flex-col items-center',
                  children: [
                    e.jsx('div', {
                      className:
                        'animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4',
                    }),
                    e.jsx('p', {
                      className: 'text-gray-500',
                      children: 'Loading call details...',
                    }),
                  ],
                }),
              })
            : S
              ? e.jsx('div', {
                  className:
                    'col-span-1 lg:col-span-3 bg-red-50 p-6 rounded-lg shadow-sm flex justify-center items-center h-64',
                  children: e.jsxs('div', {
                    className: 'flex flex-col items-center text-center',
                    children: [
                      e.jsx('span', {
                        className: 'material-icons text-red-500 text-4xl mb-3',
                        children: 'error_outline',
                      }),
                      e.jsx('p', {
                        className: 'text-red-700 mb-2',
                        children: 'Unable to load call details',
                      }),
                      e.jsx('p', {
                        className: 'text-red-500 text-sm',
                        children: 'The call may not exist or has been deleted.',
                      }),
                      e.jsx(le, {
                        to: '/call-history',
                        children: e.jsx('button', {
                          className:
                            'mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors',
                          children: 'Return to Call History',
                        }),
                      }),
                    ],
                  }),
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx('div', {
                      className: 'col-span-1 lg:col-span-3',
                      children: e.jsxs('div', {
                        className: 'bg-white p-6 rounded-lg shadow-sm',
                        children: [
                          e.jsxs('div', {
                            className: 'flex justify-between items-start mb-4',
                            children: [
                              e.jsx('h2', {
                                className: 'text-xl font-bold text-gray-800',
                                children: 'Call Information',
                              }),
                              e.jsxs('div', {
                                className:
                                  'bg-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-medium',
                                children: ['ID: ', a],
                              }),
                            ],
                          }),
                          e.jsxs('div', {
                            className:
                              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6',
                            children: [
                              e.jsxs('div', {
                                className: 'bg-gray-50 p-3 rounded-lg',
                                children: [
                                  e.jsx('p', {
                                    className: 'text-xs text-gray-500 mb-1',
                                    children: 'Time',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-sm font-medium',
                                    children: w(n?.timestamp),
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'bg-gray-50 p-3 rounded-lg',
                                children: [
                                  e.jsx('p', {
                                    className: 'text-xs text-gray-500 mb-1',
                                    children: 'Room',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-sm font-medium',
                                    children: n?.roomNumber || 'Unknown',
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'bg-gray-50 p-3 rounded-lg',
                                children: [
                                  e.jsx('p', {
                                    className: 'text-xs text-gray-500 mb-1',
                                    children: 'Duration',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-sm font-medium',
                                    children: m(n?.duration),
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                className: 'bg-gray-50 p-3 rounded-lg',
                                children: [
                                  e.jsx('p', {
                                    className: 'text-xs text-gray-500 mb-1',
                                    children: 'Messages',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-sm font-medium',
                                    children: c?.length || 0,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    e.jsx('div', {
                      className: 'col-span-1 lg:col-span-2',
                      children: e.jsxs('div', {
                        className: 'bg-white p-6 rounded-lg shadow-sm h-full',
                        children: [
                          e.jsxs('div', {
                            className: 'flex justify-between items-center mb-4',
                            children: [
                              e.jsx('h2', {
                                className: 'text-xl font-bold text-gray-800',
                                children: 'Conversation History',
                              }),
                              e.jsxs('button', {
                                onClick: x,
                                disabled: r || !c?.length,
                                className: `px-3 py-1 rounded-md text-sm flex items-center ${r ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`,
                                children: [
                                  e.jsx('span', {
                                    className: 'material-icons text-sm mr-1',
                                    children: r ? 'check' : 'content_copy',
                                  }),
                                  r ? 'Copied' : 'Copy',
                                ],
                              }),
                            ],
                          }),
                          c?.length
                            ? e.jsx('div', {
                                className:
                                  'space-y-4 overflow-y-auto max-h-[500px] pr-2',
                                children: c.map(k =>
                                  e.jsx(
                                    'div',
                                    {
                                      className: `flex ${k.role === 'assistant' ? 'justify-start' : 'justify-end'}`,
                                      children: e.jsxs('div', {
                                        className: `max-w-[75%] p-3 rounded-lg relative ${k.role === 'assistant' ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-900'}`,
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'text-xs text-gray-500 mb-1',
                                            children: [
                                              k.role === 'assistant'
                                                ? 'Assistant'
                                                : 'Guest',
                                              ' • ',
                                              w(k.timestamp),
                                            ],
                                          }),
                                          e.jsx('p', {
                                            className: 'text-sm',
                                            children: k.content,
                                          }),
                                        ],
                                      }),
                                    },
                                    k.id
                                  )
                                ),
                              })
                            : e.jsxs('div', {
                                className:
                                  'flex flex-col items-center justify-center h-64 text-center',
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'material-icons text-gray-300 text-4xl mb-2',
                                    children: 'chat',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-gray-500',
                                    children: 'No conversation data',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-gray-400 text-sm',
                                    children:
                                      'Conversation details may have been deleted or not recorded.',
                                  }),
                                ],
                              }),
                        ],
                      }),
                    }),
                    e.jsx('div', {
                      className: 'col-span-1',
                      children: e.jsxs('div', {
                        className: 'bg-white p-6 rounded-lg shadow-sm h-full',
                        children: [
                          e.jsx('h2', {
                            className: 'text-xl font-bold text-gray-800 mb-4',
                            children: 'Call Summary',
                          }),
                          n?.content
                            ? e.jsxs('div', {
                                className:
                                  'p-4 bg-blue-50 rounded-lg overflow-y-auto',
                                style: { maxHeight: '500px' },
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'text-sm text-blue-900 whitespace-pre-line',
                                    children: n.content,
                                  }),
                                  e.jsx('div', {
                                    className: 'mt-3 text-right',
                                    children: e.jsxs('span', {
                                      className: 'text-xs text-gray-500',
                                      children: [
                                        'Generated at ',
                                        w(n.timestamp),
                                      ],
                                    }),
                                  }),
                                ],
                              })
                            : e.jsxs('div', {
                                className:
                                  'flex flex-col items-center justify-center h-64 text-center',
                                children: [
                                  e.jsx('span', {
                                    className:
                                      'material-icons text-gray-300 text-4xl mb-2',
                                    children: 'summarize',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-gray-500',
                                    children: 'No summary available',
                                  }),
                                  e.jsx('p', {
                                    className: 'text-gray-400 text-sm',
                                    children:
                                      'Call summary could not be generated.',
                                  }),
                                ],
                              }),
                        ],
                      }),
                    }),
                  ],
                }),
        }),
        e.jsx('div', {
          className: 'mt-6 text-center text-gray-500 text-sm',
          children: e.jsx('p', {
            children: 'Call history is stored for the last 24 hours',
          }),
        }),
      ],
    });
  },
  xl = Object.freeze(
    Object.defineProperty(
      { __proto__: null, default: qn },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export {
  _n as A,
  al as C,
  Qn as D,
  rl as G,
  hl as I,
  Gn as N,
  Zn as S,
  sl as U,
  Ot as a,
  tl as b,
  nl as c,
  ll as d,
  il as e,
  cl as f,
  dl as g,
  Wn as h,
  Xn as i,
  Yn as j,
  Jn as k,
  el as l,
  ol as m,
  xl as n,
};
