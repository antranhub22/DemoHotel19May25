import {
  j as e,
  aP as te,
  r as o,
  ai as at,
  aj as fe,
  ak as tt,
  an as Le,
  ag as nt,
  ah as js,
  aw as lt,
  ax as it,
  al as Aa,
  am as pe,
  aR as be,
  aS as ye,
  aT as oe,
  aU as rs,
  aV as Ie,
  aq as Is,
  aW as cs,
  ar as ds,
  aQ as U,
  aX as Re,
  aY as He,
  aZ as Us,
  a_ as Ds,
  O as Ye,
  p as Je,
  a$ as rt,
  b0 as ss,
  b1 as Xs,
  b2 as Ys,
  b3 as ct,
  b4 as dt,
  b5 as ca,
  b6 as ht,
  b7 as ge,
  b8 as da,
  b9 as Js,
  ba as We,
  bb as ea,
  au as ls,
  bc as sa,
  af as ce,
  bd as Da,
  be as aa,
  as as ta,
  at as La,
  bf as xe,
  ao as ha,
  bg as _e,
  bh as na,
  bi as ze,
  bj as Qe,
  bk as ot,
  bl as xt,
  bm as gs,
  bn as qs,
  ae as ps,
  bo as Ia,
  bp as mt,
  bq as ut,
  br as vs,
  bs as is,
  bt as fs,
  bu as Ks,
  bv as Pe,
  bw as Fs,
  bx as jt,
  by as Fa,
  bz as gt,
  bA as pt,
  bB as $s,
} from './react-core-C6DwaHZM.js';
import {
  C as u,
  b as j,
  l as q,
  S as vt,
  c as Nt,
  B as g,
  D as ft,
  d as yt,
  A as bt,
  e as wt,
  f as Ct,
  g as St,
  h as kt,
  i as oa,
  j as Os,
  k as y,
  m as b,
  n as M,
  P as Me,
  a as R,
  o as la,
  p as ia,
  L as h,
  q as C,
  r as W,
  s as X,
  t as Y,
  v as J,
  w as N,
  x as Tt,
  T as we,
  y as Ce,
  z as H,
  E as z,
  F as ue,
  G as B,
  H as Ne,
  J as Pa,
  K as Ma,
  M as Ra,
  N as Ea,
  O as qa,
  Q as Oa,
  R as Ha,
  U as za,
  V as Ba,
  W as Be,
  X as Ue,
  Y as Ke,
  Z as $e,
  _ as Xe,
  $ as Ee,
  a0 as qe,
  a1 as de,
  a2 as F,
  a3 as Oe,
  a4 as P,
  a5 as ws,
} from './components-LYkGJCyk.js';
import { u as Ua } from './react-router-B7s-G-0E.js';
import {
  R as Ae,
  P as Vs,
  a as Gs,
  C as Zs,
  T as De,
  B as Ka,
  b as as,
  X as ts,
  Y as ns,
  L as xa,
  c as $a,
  d as ra,
  e as us,
  A as At,
  f as Dt,
} from './charts-ceMktdbA.js';
import { C as Va, L as ie, E as Lt } from './vendor-BXT5a8vO.js';
import { S as It } from './dashboard-components-DUmeA-4i.js';
import { g as Se } from './hooks-context-BUKIDDkP.js';
import {
  P as Ft,
  T as Pt,
  L as Mt,
  B as Rt,
  d as Ga,
  v as Et,
  a as qt,
  c as V,
} from './services-BvUATxiy.js';
function Zn() {
  return e.jsx('div', {
    className:
      'min-h-screen w-full flex items-center justify-center bg-gray-50',
    children: e.jsx(u, {
      className: 'w-full max-w-md mx-4',
      children: e.jsxs(j, {
        className: 'pt-6',
        children: [
          e.jsxs('div', {
            className: 'flex mb-4 gap-2',
            children: [
              e.jsx(te, { className: 'h-8 w-8 text-red-500' }),
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
const Ot = ({ onLogin: s }) => {
    const [n, r] = o.useState(''),
      [t, a] = o.useState(''),
      [l, i] = o.useState(''),
      [d, x] = o.useState(!1),
      m = async w => {
        if ((w.preventDefault(), !n || !t)) {
          i('Please enter both username and password.');
          return;
        }
        i('');
        try {
          const c = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: n, password: t }),
          });
          if (!c.ok) {
            const S = await c.json();
            i(S.error || 'Login failed.');
            return;
          }
          const p = await c.json();
          p.success && p.token
            ? (localStorage.setItem('token', p.token), s())
            : i('Login failed: No token received.');
        } catch {
          i('Login failed: Network or server error.');
        }
      };
    return e.jsx('div', {
      className:
        'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300',
      children: e.jsxs('form', {
        onSubmit: m,
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
                value: n,
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
                    type: d ? 'text' : 'password',
                    className:
                      'w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400',
                    value: t,
                    onChange: w => a(w.target.value),
                  }),
                  e.jsx('button', {
                    type: 'button',
                    className:
                      'absolute inset-y-0 right-0 pr-3 flex items-center',
                    onClick: () => x(!d),
                    children: d
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
  Hs = [
    'Tất cả',
    'Đã ghi nhận',
    'Đang thực hiện',
    'Đã thực hiện và đang bàn giao cho khách',
    'Hoàn thiện',
    'Lưu ý khác',
  ],
  ma = s => {
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
  Ht = () => {
    const [s, n] = o.useState([]),
      [r, t] = o.useState(null),
      [a, l] = o.useState(!1),
      [i, d] = o.useState(!1),
      [x, m] = o.useState([]),
      [w, c] = o.useState(!1),
      [p, S] = o.useState('Tất cả'),
      [T, D] = o.useState(''),
      [se, ae] = o.useState(''),
      [ne, le] = o.useState(null),
      [k, ee] = o.useState(!1),
      [L, Q] = o.useState(!1),
      [G, he] = o.useState(''),
      [re, I] = o.useState(''),
      [v, O] = o.useState({}),
      Z = Ua(),
      ke = () => localStorage.getItem('staff_token'),
      hs = async () => {
        const f = ke();
        if (!f) {
          Z('/staff');
          return;
        }
        try {
          const E = await fetch('/api/staff/requests', {
            headers: { Authorization: `Bearer ${f}` },
            credentials: 'include',
          });
          if (E.status === 401) {
            (localStorage.removeItem('staff_token'), Z('/staff'));
            return;
          }
          const $ = await E.json();
          (q.debug('Fetched requests data:', 'Component', $), n($));
        } catch (E) {
          q.error('Failed to fetch requests:', 'Component', E);
        }
      };
    o.useEffect(() => {
      hs();
      const f = setInterval(hs, 3e4);
      return () => clearInterval(f);
    }, []);
    const Ms = () => {
        (l(!1), t(null));
      },
      os = async (f, E) => {
        const $ = ke();
        if (!$) return Z('/staff');
        try {
          (await fetch(`/api/staff/requests/${E}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${$}`,
            },
            credentials: 'include',
            body: JSON.stringify({ status: f }),
          }),
            n(xs => xs.map(Ge => (Ge.id === E ? { ...Ge, status: f } : Ge))),
            r && r.id === E && t({ ...r, status: f }));
        } catch (xs) {
          q.error('Failed to update status:', 'Component', xs);
        }
      },
      Ve = async () => {
        if ((d(!0), !r)) return;
        const f = ke();
        if (!f) return Z('/staff');
        try {
          const $ = await (
            await fetch(`/api/staff/requests/${r.id}/messages`, {
              headers: { Authorization: `Bearer ${f}` },
              credentials: 'include',
            })
          ).json();
          m($);
        } catch {
          m([]);
        }
      },
      Rs = () => d(!1),
      Es = async f => {
        c(!0);
        const E = ke();
        if (!E) return Z('/staff');
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
            m($ => [
              ...$,
              {
                id: ($.length + 1).toString(),
                sender: 'staff',
                content: f,
                time: new Date().toLocaleTimeString().slice(0, 5),
              },
            ]));
        } catch {}
        c(!1);
      },
      ys = async () => {
        (Q(!0), he(''), I(''));
      },
      bs = async () => {
        if (G !== '2208') {
          I('Mật khẩu không đúng');
          return;
        }
        ee(!0);
        try {
          const f = ke();
          if (!f) return (Q(!1), Z('/staff'));
          const $ = await (
            await fetch('/api/staff/requests/all', {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${f}` },
              credentials: 'include',
            })
          ).json();
          (Q(!1),
            $.success
              ? (alert(`${$.message}`), n([]))
              : alert(`Lỗi: ${$.error || 'Không thể xóa requests'}`));
        } catch (f) {
          (q.error('Error deleting all requests:', 'Component', f),
            alert('Đã xảy ra lỗi khi xóa requests'),
            Q(!1));
        } finally {
          (ee(!1), he(''));
        }
      },
      A = s.filter(f => {
        if (p !== 'Tất cả' && f.status !== p) return !1;
        if (T || se) {
          const E = new Date(f.created_at);
          if (T) {
            const $ = new Date(T);
            if (($.setHours(0, 0, 0, 0), E < $)) return !1;
          }
          if (se) {
            const $ = new Date(se);
            if (($.setHours(23, 59, 59, 999), E > $)) return !1;
          }
        }
        return !0;
      }),
      K = f => {
        (f.key === 'Enter' && bs(), re && I(''));
      },
      Te = f => {
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
                  onClick: () => Z('/analytics'),
                  className:
                    'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition',
                  children: 'View Analytics',
                }),
                e.jsxs('div', {
                  className: 'flex gap-4',
                  children: [
                    e.jsx('button', {
                      onClick: ys,
                      disabled: k || s.length === 0,
                      className: `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition ${k || s.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`,
                      children: k ? 'Deleting...' : 'Delete All Requests',
                    }),
                    e.jsx('button', {
                      onClick: hs,
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
                      value: p,
                      onChange: f => S(f.target.value),
                      children: Hs.map(f =>
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
                              value: T,
                              onChange: f => D(f.target.value),
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
                              value: se,
                              onChange: f => ae(f.target.value),
                            }),
                          ],
                        }),
                        (T || se) &&
                          e.jsx('button', {
                            onClick: () => {
                              (D(''), ae(''));
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
                  (q.debug(
                    'Mobile rendering - filteredRequests:',
                    'Component',
                    A
                  ),
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
                                      className: `px-2 py-1 rounded-full text-xs font-semibold ${ma(f.status)}`,
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
                                        le(ne === f.id ? null : f.id),
                                      className:
                                        'w-full flex justify-between items-center py-1 px-2 border rounded bg-gray-50 hover:bg-gray-100',
                                      children: [
                                        e.jsx('span', {
                                          className:
                                            'text-sm font-medium text-blue-700',
                                          children:
                                            ne === f.id
                                              ? 'Ẩn nội dung'
                                              : 'Xem nội dung',
                                        }),
                                        e.jsx('svg', {
                                          className: `w-4 h-4 text-blue-700 transition-transform ${ne === f.id ? 'rotate-180' : ''}`,
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
                                    ne === f.id &&
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
                                        O($ => ({
                                          ...$,
                                          [f.id]: E.target.value,
                                        })),
                                      children: Hs.filter(
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
                                              (await os(E, f.id),
                                              O($ => {
                                                const { [f.id]: xs, ...Ge } = $;
                                                return Ge;
                                              }));
                                          },
                                          children: 'Cập Nhật',
                                        }),
                                        e.jsx('button', {
                                          className:
                                            'bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded text-sm font-semibold',
                                          onClick: () => {
                                            (t(f), Ve());
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
                                  className: `px-2 py-1 rounded-full text-xs font-semibold ${ma(f.status)} break-words whitespace-normal block text-center`,
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
                                      O($ => ({
                                        ...$,
                                        [f.id]: E.target.value,
                                      })),
                                    children: Hs.filter(
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
                                        (await os(E, f.id),
                                        O($ => {
                                          const { [f.id]: xs, ...Ge } = $;
                                          return Ge;
                                        }));
                                    },
                                    children: 'Cập Nhật',
                                  }),
                                  e.jsx('button', {
                                    className:
                                      'bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold',
                                    onClick: () => {
                                      (t(f), Ve());
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
        a &&
          r &&
          e.jsx(vt, {
            request: r,
            onClose: Ms,
            onStatusChange: f => os(f, r.id),
            onOpenMessage: Ve,
          }),
        i &&
          r &&
          e.jsx(Nt, { messages: x, onClose: Rs, onSend: Es, loading: w }),
        L &&
          e.jsx('div', {
            className:
              'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            children: e.jsxs('div', {
              className:
                'bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4',
              onClick: Te,
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
                      value: G,
                      onChange: f => he(f.target.value),
                      onKeyDown: K,
                      className: `w-full px-3 py-2 border rounded ${re ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-red-500`,
                      placeholder: 'Nhập mật khẩu xác nhận',
                      autoFocus: !0,
                    }),
                    re &&
                      e.jsx('p', {
                        className: 'text-red-500 text-sm mt-1',
                        children: re,
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
                      onClick: () => Q(!1),
                      className:
                        'px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition duration-200',
                      children: 'Hủy',
                    }),
                    e.jsx('button', {
                      onClick: bs,
                      disabled: k,
                      className:
                        'px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition duration-200 flex items-center disabled:opacity-70',
                      children: k
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
  _n = () => {
    const [s, n] = o.useState(!1),
      r = () => n(!0);
    return s ? e.jsx(Ht, {}) : e.jsx(Ot, { onLogin: r });
  },
  ua = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'],
  Qn = () => {
    const [s, n] = o.useState(null),
      [r, t] = o.useState([]),
      [a, l] = o.useState([]),
      i = Ua(),
      d = async x => {
        const m = localStorage.getItem('staff_token');
        if (!m) return (i('/staff'), null);
        try {
          const w = await fetch(x, {
            headers: { Authorization: `Bearer ${m}` },
          });
          return w.status === 401 ? (i('/staff'), null) : w.json();
        } catch (w) {
          return (
            q.error('Failed to fetch from ${url}:', 'Component', w),
            null
          );
        }
      };
    return (
      o.useEffect(() => {
        (async () => {
          const m = await d('/api/analytics/overview'),
            w = await d('/api/analytics/service-distribution'),
            c = await d('/api/analytics/hourly-activity');
          (m && n(m), w && t(w), c && l(c));
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
                    e.jsx(Ae, {
                      width: '100%',
                      height: 150,
                      children: e.jsxs(Vs, {
                        children: [
                          e.jsx(Gs, {
                            data: s?.languageDistribution,
                            dataKey: 'count',
                            nameKey: 'language',
                            cx: '50%',
                            cy: '50%',
                            outerRadius: 60,
                            fill: '#8884d8',
                            label: !0,
                            children: s?.languageDistribution.map((x, m) =>
                              e.jsx(
                                Zs,
                                { fill: ua[m % ua.length] },
                                `cell-${m}`
                              )
                            ),
                          }),
                          e.jsx(De, {}),
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
                    e.jsx(Ae, {
                      width: '100%',
                      height: 300,
                      children: e.jsxs(Ka, {
                        data: r,
                        margin: { top: 5, right: 20, left: 10, bottom: 5 },
                        children: [
                          e.jsx(as, { strokeDasharray: '3 3' }),
                          e.jsx(ts, { dataKey: 'serviceType' }),
                          e.jsx(ns, {}),
                          e.jsx(De, {}),
                          e.jsx(xa, {}),
                          e.jsx($a, { dataKey: 'count', fill: '#8884d8' }),
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
                    e.jsx(Ae, {
                      width: '100%',
                      height: 300,
                      children: e.jsxs(ra, {
                        data: a,
                        margin: { top: 5, right: 20, left: 10, bottom: 5 },
                        children: [
                          e.jsx(as, { strokeDasharray: '3 3' }),
                          e.jsx(ts, { dataKey: 'hour' }),
                          e.jsx(ns, {}),
                          e.jsx(De, {}),
                          e.jsx(xa, {}),
                          e.jsx(us, {
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
  es = {
    id: 'tenant-1',
    hotelName: 'Mi Nhon Hotel',
    subscriptionPlan: 'premium',
    subscriptionStatus: 'active',
    remainingDays: 15,
  },
  zt = [
    {
      href: '/dashboard',
      icon: at,
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
      icon: tt,
      label: 'Phân tích',
      description: 'Báo cáo và thống kê chi tiết',
    },
    {
      href: '/dashboard/settings',
      icon: Le,
      label: 'Cài đặt',
      description: 'Quản lý thông tin khách sạn',
    },
  ],
  Bt = s => {
    const n = [];
    return (
      s !== 'trial' &&
        n.push({
          href: '/dashboard/billing',
          icon: Aa,
          label: 'Thanh toán',
          description: 'Quản lý subscription và billing',
        }),
      s === 'enterprise' &&
        n.push({
          href: '/dashboard/team',
          icon: pe,
          label: 'Nhóm',
          description: 'Quản lý team và permissions',
        }),
      n
    );
  },
  Wn = ({ children: s }) => {
    const [n, r] = o.useState(!1);
    Va();
    const { tenant: t, logout: a } = Se();
    return (
      [...zt, ...Bt(t?.subscriptionPlan || es.subscriptionPlan)],
      e.jsxs('div', {
        className: 'min-h-screen bg-gray-50 dark:bg-gray-900',
        children: [
          n &&
            e.jsx('div', {
              className: 'fixed inset-0 z-40 bg-black/50 lg:hidden',
              onClick: () => r(!1),
            }),
          e.jsx(It, { isOpen: n, onClose: () => r(!1), tenantData: t || es }),
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
                        e.jsx(g, {
                          variant: 'ghost',
                          size: 'icon',
                          className: 'lg:hidden',
                          onClick: () => r(!0),
                          children: e.jsx(nt, { className: 'h-5 w-5' }),
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
                        e.jsxs(g, {
                          variant: 'ghost',
                          size: 'icon',
                          className: 'relative',
                          children: [
                            e.jsx(js, { className: 'h-5 w-5' }),
                            e.jsx('span', {
                              className:
                                'absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white',
                              children: '2',
                            }),
                          ],
                        }),
                        e.jsxs(ft, {
                          children: [
                            e.jsx(yt, {
                              asChild: !0,
                              children: e.jsx(g, {
                                variant: 'ghost',
                                className: 'relative h-10 w-10 rounded-full',
                                children: e.jsxs(bt, {
                                  className: 'h-10 w-10',
                                  children: [
                                    e.jsx(wt, {
                                      src: '',
                                      alt: (t || es).hotelName,
                                    }),
                                    e.jsx(Ct, {
                                      className:
                                        'bg-primary text-primary-foreground',
                                      children: (t || es).hotelName
                                        .charAt(0)
                                        .toUpperCase(),
                                    }),
                                  ],
                                }),
                              }),
                            }),
                            e.jsxs(St, {
                              className: 'w-56',
                              align: 'end',
                              children: [
                                e.jsxs(kt, {
                                  className: 'flex flex-col',
                                  children: [
                                    e.jsx('div', {
                                      className: 'font-medium',
                                      children: (t || es).hotelName,
                                    }),
                                    e.jsxs('div', {
                                      className:
                                        'text-xs text-muted-foreground',
                                      children: ['ID: ', (t || es).id],
                                    }),
                                  ],
                                }),
                                e.jsx(oa, {}),
                                e.jsxs(Os, {
                                  children: [
                                    e.jsx(Le, { className: 'mr-2 h-4 w-4' }),
                                    'Cài đặt tài khoản',
                                  ],
                                }),
                                e.jsxs(Os, {
                                  children: [
                                    e.jsx(lt, { className: 'mr-2 h-4 w-4' }),
                                    'Trợ giúp',
                                  ],
                                }),
                                e.jsx(oa, {}),
                                e.jsxs(Os, {
                                  className: 'text-red-600 focus:text-red-600',
                                  onClick: a,
                                  children: [
                                    e.jsx(it, { className: 'mr-2 h-4 w-4' }),
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
  Ze = { usageLimit: 5e3, currentUsage: 1247, resetDate: '2024-01-01' },
  Cs = ({
    title: s,
    value: n,
    change: r,
    icon: t,
    description: a,
    suffix: l = '',
  }) =>
    e.jsxs(u, {
      children: [
        e.jsxs(y, {
          className:
            'flex flex-row items-center justify-between space-y-0 pb-2',
          children: [
            e.jsx(b, { className: 'text-sm font-medium', children: s }),
            e.jsx(t, { className: 'h-4 w-4 text-muted-foreground' }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsxs('div', {
              className: 'text-2xl font-bold',
              children: [n, l],
            }),
            e.jsxs('div', {
              className: 'flex items-center pt-1',
              children: [
                e.jsx('div', {
                  className: 'text-xs text-muted-foreground',
                  children: a,
                }),
                r !== void 0 &&
                  e.jsxs('div', {
                    className: `ml-auto flex items-center text-xs ${r > 0 ? 'text-green-600' : 'text-red-600'}`,
                    children: [
                      e.jsx(oe, {
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
  Ut = ({ time: s, action: n, type: r }) => {
    const t = () => {
      switch (r) {
        case 'call':
          return e.jsx(be, { className: 'h-4 w-4 text-blue-500' });
        case 'service':
          return e.jsx(fe, { className: 'h-4 w-4 text-green-500' });
        case 'inquiry':
          return e.jsx(ds, { className: 'h-4 w-4 text-purple-500' });
        case 'complaint':
          return e.jsx(te, { className: 'h-4 w-4 text-red-500' });
        default:
          return e.jsx(Ie, { className: 'h-4 w-4 text-gray-500' });
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
              children: n,
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
  Kt = () =>
    e.jsxs(u, {
      children: [
        e.jsxs(y, {
          children: [
            e.jsxs(b, {
              className: 'flex items-center gap-2',
              children: [e.jsx(Le, { className: 'h-5 w-5' }), 'Thao tác nhanh'],
            }),
            e.jsx(M, { children: 'Các tính năng thường dùng' }),
          ],
        }),
        e.jsxs(j, {
          className: 'space-y-3',
          children: [
            e.jsx(ie, {
              href: '/dashboard/setup',
              children: e.jsxs(g, {
                variant: 'outline',
                className: 'w-full justify-start',
                children: [
                  e.jsx(fe, { className: 'h-4 w-4 mr-2' }),
                  'Cấu hình AI Assistant',
                ],
              }),
            }),
            e.jsx(ie, {
              href: '/dashboard/analytics',
              children: e.jsxs(g, {
                variant: 'outline',
                className: 'w-full justify-start',
                children: [
                  e.jsx(Is, { className: 'h-4 w-4 mr-2' }),
                  'Xem báo cáo chi tiết',
                ],
              }),
            }),
            e.jsx(ie, {
              href: '/dashboard/settings',
              children: e.jsxs(g, {
                variant: 'outline',
                className: 'w-full justify-start',
                children: [
                  e.jsx(Le, { className: 'h-4 w-4 mr-2' }),
                  'Cài đặt khách sạn',
                ],
              }),
            }),
          ],
        }),
      ],
    }),
  $t = () => {
    const s = (Ze.currentUsage / Ze.usageLimit) * 100;
    return e.jsxs(u, {
      children: [
        e.jsxs(y, {
          children: [
            e.jsxs(b, {
              className: 'flex items-center gap-2',
              children: [
                e.jsx(Ie, { className: 'h-5 w-5' }),
                'Sử dụng tháng này',
              ],
            }),
            e.jsx(M, { children: 'Theo dõi giới hạn subscription' }),
          ],
        }),
        e.jsxs(j, {
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
                        Ze.currentUsage.toLocaleString(),
                        ' /',
                        ' ',
                        Ze.usageLimit.toLocaleString(),
                      ],
                    }),
                  ],
                }),
                e.jsx(Me, { value: s, className: 'h-2' }),
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
                    (Ze.usageLimit - Ze.currentUsage).toLocaleString(),
                    ' ',
                    'cuộc gọi',
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className:
                'flex items-center gap-2 text-sm text-muted-foreground',
              children: [
                e.jsx(ye, { className: 'h-4 w-4' }),
                e.jsxs('span', { children: ['Reset vào ', Ze.resetDate] }),
              ],
            }),
          ],
        }),
      ],
    });
  },
  Vt = () =>
    e.jsxs(u, {
      children: [
        e.jsx(y, {
          children: e.jsxs(b, {
            className: 'flex items-center gap-2',
            children: [
              e.jsx(cs, { className: 'h-5 w-5 text-green-500' }),
              'Trạng thái hệ thống',
            ],
          }),
        }),
        e.jsxs(j, {
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
  Xn = () =>
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
            e.jsx(Cs, {
              title: 'Tổng cuộc gọi',
              value: ve.totalCalls.toLocaleString(),
              change: ve.totalCallsGrowth,
              icon: be,
              description: 'Tháng này',
            }),
            e.jsx(Cs, {
              title: 'Thời gian trung bình',
              value: Math.floor(ve.averageCallDuration / 60),
              change: ve.callDurationGrowth,
              icon: ye,
              description: 'Phút/cuộc gọi',
              suffix: 'm',
            }),
            e.jsx(Cs, {
              title: 'Người dùng hoạt động',
              value: ve.activeUsers,
              change: ve.activeUsersGrowth,
              icon: pe,
              description: 'Trong 7 ngày',
            }),
            e.jsx(Cs, {
              title: 'Điểm hài lòng',
              value: ve.satisfactionScore,
              change: ve.satisfactionGrowth,
              icon: oe,
              description: 'Trên 5 điểm',
              suffix: '/5',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
          children: [
            e.jsxs(u, {
              className: 'lg:col-span-2',
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(rs, { className: 'h-5 w-5' }),
                        'Phân bố ngôn ngữ',
                      ],
                    }),
                    e.jsx(M, {
                      children: 'Ngôn ngữ được sử dụng trong các cuộc gọi',
                    }),
                  ],
                }),
                e.jsx(j, {
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
                            e.jsx(Me, {
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
              children: [e.jsx(Kt, {}), e.jsx($t, {})],
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(Ie, { className: 'h-5 w-5' }),
                        'Hoạt động gần đây',
                      ],
                    }),
                    e.jsx(M, {
                      children: 'Các sự kiện mới nhất từ AI Assistant',
                    }),
                  ],
                }),
                e.jsx(j, {
                  children: e.jsx('div', {
                    className: 'space-y-1',
                    children: ve.recentActivity.map((s, n) =>
                      e.jsx(
                        Ut,
                        { time: s.time, action: s.action, type: s.type },
                        n
                      )
                    ),
                  }),
                }),
              ],
            }),
            e.jsx(Vt, {}),
          ],
        }),
      ],
    }),
  Gt = ({ state: s, onNext: n, onError: r, onUpdateState: t }) => {
    const a = (d, x) => {
        t({
          formData: { ...s.formData, [d]: x },
          validation: { ...s.validation, [d]: null },
        });
      },
      l = () => {
        const d = {};
        return (
          s.formData.hotelName.trim()
            ? s.formData.hotelName.length < 2 &&
              (d.hotelName = 'Tên khách sạn phải có ít nhất 2 ký tự')
            : (d.hotelName = 'Tên khách sạn là bắt buộc'),
          t({ validation: { ...s.validation, ...d } }),
          Object.keys(d).length === 0
        );
      },
      i = async () => {
        if (l()) {
          t({ isResearching: !0, error: null });
          try {
            const d = await Ga.researchHotel({
              hotelName: s.formData.hotelName,
              location: s.formData.location || void 0,
              researchTier: s.formData.researchTier,
            });
            d.success && Et(d.hotelData)
              ? n(d.hotelData)
              : r({ error: 'Dữ liệu khách sạn không hợp lệ' });
          } catch (d) {
            r(d);
          } finally {
            t({ isResearching: !1 });
          }
        }
      };
    return e.jsxs(u, {
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
                children: e.jsx(Re, { className: 'h-6 w-6' }),
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
        e.jsxs(j, {
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
                      onChange: d => a('hotelName', d.target.value),
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
                      onChange: d => a('location', d.target.value),
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
                    e.jsxs(W, {
                      value: s.formData.researchTier,
                      onValueChange: d => a('researchTier', d),
                      children: [
                        e.jsx(X, { className: 'mt-1', children: e.jsx(Y, {}) }),
                        e.jsxs(J, {
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
              e.jsxs(la, {
                variant: 'destructive',
                children: [
                  e.jsx(te, { className: 'h-4 w-4' }),
                  e.jsxs(ia, {
                    children: [
                      s.error.error,
                      s.error.upgradeRequired &&
                        e.jsx('div', {
                          className: 'mt-2',
                          children: e.jsx(g, {
                            variant: 'outline',
                            size: 'sm',
                            children: 'Nâng cấp gói dịch vụ',
                          }),
                        }),
                    ],
                  }),
                ],
              }),
            e.jsx(g, {
              onClick: i,
              disabled: !s.formData.hotelName.trim() || s.isResearching,
              className: 'w-full',
              size: 'lg',
              children: s.isResearching
                ? e.jsxs(e.Fragment, {
                    children: [
                      e.jsx(He, { className: 'w-4 h-4 mr-2 animate-spin' }),
                      'Đang tìm kiếm...',
                    ],
                  })
                : e.jsxs(e.Fragment, {
                    children: [
                      e.jsx(Re, { className: 'w-4 h-4 mr-2' }),
                      'Tìm kiếm khách sạn',
                    ],
                  }),
            }),
          ],
        }),
      ],
    });
  },
  Zt = ({ state: s, onNext: n, onBack: r, onError: t, onUpdateState: a }) => {
    const [l, i] = o.useState(!1),
      [d] = o.useState(s.hotelData),
      [x, m] = o.useState(new Set(['basic'])),
      w = S => {
        const T = new Set(x);
        (T.has(S) ? T.delete(S) : T.add(S), m(T));
      },
      c = () => {
        (i(!l), l && d && a({ hotelData: d }));
      },
      p = () => {
        s.hotelData && n();
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
                    children: e.jsx(cs, { className: 'h-6 w-6' }),
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
                e.jsxs(g, {
                  variant: l ? 'default' : 'outline',
                  onClick: c,
                  size: 'sm',
                  children: [
                    e.jsx(Le, { className: 'w-4 h-4 mr-2' }),
                    l ? 'Lưu thay đổi' : 'Chỉnh sửa',
                  ],
                }),
                e.jsxs(g, {
                  variant: 'outline',
                  onClick: r,
                  size: 'sm',
                  children: [
                    e.jsx(Us, { className: 'w-4 h-4 mr-2' }),
                    'Tìm kiếm lại',
                  ],
                }),
              ],
            }),
            e.jsxs('div', {
              className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
              children: [
                e.jsxs(u, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => w('basic'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(Ds, { className: 'h-5 w-5' }),
                              'Thông tin cơ bản',
                            ],
                          }),
                          x.has('basic')
                            ? e.jsx(Ye, { className: 'h-4 w-4' })
                            : e.jsx(Je, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    x.has('basic') &&
                      e.jsxs(j, {
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
                                    e.jsx(rt, { className: 'h-3 w-3' }),
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
                                    e.jsx(ss, {
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
                e.jsxs(u, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => w('services'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(Le, { className: 'h-5 w-5' }),
                              'Dịch vụ (',
                              s.hotelData.services.length,
                              ')',
                            ],
                          }),
                          x.has('services')
                            ? e.jsx(Ye, { className: 'h-4 w-4' })
                            : e.jsx(Je, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    x.has('services') &&
                      e.jsx(j, {
                        children: e.jsx('div', {
                          className: 'space-y-2',
                          children: s.hotelData.services.map((S, T) =>
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
                              T
                            )
                          ),
                        }),
                      }),
                  ],
                }),
                e.jsxs(u, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => w('amenities'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(Xs, { className: 'h-5 w-5' }),
                              'Tiện nghi (',
                              s.hotelData.amenities.length,
                              ')',
                            ],
                          }),
                          x.has('amenities')
                            ? e.jsx(Ye, { className: 'h-4 w-4' })
                            : e.jsx(Je, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    x.has('amenities') &&
                      e.jsx(j, {
                        children: e.jsx('div', {
                          className: 'flex flex-wrap gap-2',
                          children: s.hotelData.amenities.map((S, T) =>
                            e.jsx(R, { variant: 'secondary', children: S }, T)
                          ),
                        }),
                      }),
                  ],
                }),
                e.jsxs(u, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => w('rooms'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(pe, { className: 'h-5 w-5' }),
                              'Loại phòng (',
                              s.hotelData.roomTypes.length,
                              ')',
                            ],
                          }),
                          x.has('rooms')
                            ? e.jsx(Ye, { className: 'h-4 w-4' })
                            : e.jsx(Je, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    x.has('rooms') &&
                      e.jsx(j, {
                        children: e.jsx('div', {
                          className: 'space-y-3',
                          children: s.hotelData.roomTypes.map((S, T) =>
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
                              T
                            )
                          ),
                        }),
                      }),
                  ],
                }),
                e.jsxs(u, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => w('policies'),
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
                          x.has('policies')
                            ? e.jsx(Ye, { className: 'h-4 w-4' })
                            : e.jsx(Je, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    x.has('policies') &&
                      e.jsxs(j, {
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
                e.jsxs(u, {
                  children: [
                    e.jsx(y, {
                      className: 'cursor-pointer',
                      onClick: () => w('attractions'),
                      children: e.jsxs(b, {
                        className: 'flex items-center justify-between',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(Ys, { className: 'h-5 w-5' }),
                              'Điểm tham quan (',
                              s.hotelData.localAttractions.length,
                              ')',
                            ],
                          }),
                          x.has('attractions')
                            ? e.jsx(Ye, { className: 'h-4 w-4' })
                            : e.jsx(Je, { className: 'h-4 w-4' }),
                        ],
                      }),
                    }),
                    x.has('attractions') &&
                      e.jsx(j, {
                        children: e.jsx('div', {
                          className: 'space-y-2',
                          children: s.hotelData.localAttractions.map((S, T) =>
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
                              T
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
                e.jsxs(g, {
                  variant: 'outline',
                  onClick: r,
                  children: [
                    e.jsx(Us, { className: 'w-4 h-4 mr-2' }),
                    'Quay lại',
                  ],
                }),
                e.jsxs(g, {
                  onClick: p,
                  size: 'lg',
                  children: [
                    'Tiếp tục',
                    e.jsx(ct, { className: 'w-4 h-4 ml-2' }),
                  ],
                }),
              ],
            }),
          ],
        })
      : e.jsx(u, {
          className: 'max-w-2xl mx-auto',
          children: e.jsxs(j, {
            className: 'text-center py-8',
            children: [
              e.jsx(te, {
                className: 'h-12 w-12 text-yellow-500 mx-auto mb-4',
              }),
              e.jsx('p', {
                children: 'Không tìm thấy dữ liệu khách sạn. Vui lòng thử lại.',
              }),
              e.jsx(g, { onClick: r, className: 'mt-4', children: 'Quay lại' }),
            ],
          }),
        });
  },
  _t = ({ state: s, onNext: n, onBack: r, onError: t, onUpdateState: a }) => {
    const l = (m, w) => {
        a({
          customization: { ...s.customization, [m]: w },
          validation: { ...s.validation, [m]: null },
        });
      },
      i = (m, w) => {
        let c = [...s.customization.languages];
        (w ? c.push(m) : (c = c.filter(p => p !== m)), l('languages', c));
      },
      d = () => {
        const m = {};
        return (
          s.customization.languages.length === 0 &&
            (m.languages = 'Vui lòng chọn ít nhất một ngôn ngữ'),
          a({ validation: { ...s.validation, ...m } }),
          Object.keys(m).length === 0
        );
      },
      x = async () => {
        if (!(!d() || !s.hotelData)) {
          if (!qt(s.customization)) {
            t({ error: 'Cấu hình Assistant không hợp lệ' });
            return;
          }
          a({ isGenerating: !0, error: null });
          try {
            const m = await Ga.generateAssistant({
              hotelData: s.hotelData,
              customization: s.customization,
            });
            m.success
              ? n(m.assistantId)
              : t({ error: 'Không thể tạo Assistant' });
          } catch (m) {
            t(m);
          } finally {
            a({ isGenerating: !1 });
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
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(dt, { className: 'h-5 w-5' }),
                        'Tính cách',
                      ],
                    }),
                    e.jsx(M, {
                      children: 'Chọn phong cách giao tiếp của AI Assistant',
                    }),
                  ],
                }),
                e.jsx(j, {
                  children: e.jsxs(W, {
                    value: s.customization.personality,
                    onValueChange: m => l('personality', m),
                    children: [
                      e.jsx(X, { children: e.jsx(Y, {}) }),
                      e.jsx(J, {
                        children: Ft.map(m =>
                          e.jsx(
                            N,
                            {
                              value: m.value,
                              children: e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium',
                                    children: m.label,
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-500',
                                    children: m.description,
                                  }),
                                ],
                              }),
                            },
                            m.value
                          )
                        ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(ca, { className: 'h-5 w-5' }),
                        'Giọng điệu',
                      ],
                    }),
                    e.jsx(M, { children: 'Chọn cách thức giao tiếp' }),
                  ],
                }),
                e.jsx(j, {
                  children: e.jsxs(W, {
                    value: s.customization.tone,
                    onValueChange: m => l('tone', m),
                    children: [
                      e.jsx(X, { children: e.jsx(Y, {}) }),
                      e.jsx(J, {
                        children: Pt.map(m =>
                          e.jsx(
                            N,
                            {
                              value: m.value,
                              children: e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium',
                                    children: m.label,
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-500',
                                    children: m.description,
                                  }),
                                ],
                              }),
                            },
                            m.value
                          )
                        ),
                      }),
                    ],
                  }),
                }),
              ],
            }),
            e.jsxs(u, {
              className: 'md:col-span-2',
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(rs, { className: 'h-5 w-5' }),
                        'Ngôn ngữ hỗ trợ',
                      ],
                    }),
                    e.jsx(M, {
                      children:
                        'Chọn các ngôn ngữ mà AI Assistant có thể giao tiếp',
                    }),
                  ],
                }),
                e.jsxs(j, {
                  children: [
                    e.jsx('div', {
                      className: 'grid grid-cols-2 md:grid-cols-3 gap-3',
                      children: Mt.map(m =>
                        e.jsxs(
                          'div',
                          {
                            className: 'flex items-center space-x-2',
                            children: [
                              e.jsx(Tt, {
                                id: m.value,
                                checked: s.customization.languages.includes(
                                  m.value
                                ),
                                onCheckedChange: w => i(m.value, w),
                              }),
                              e.jsxs(h, {
                                htmlFor: m.value,
                                className:
                                  'flex items-center gap-2 cursor-pointer',
                                children: [
                                  e.jsx('span', { children: m.flag }),
                                  e.jsx('span', { children: m.label }),
                                ],
                              }),
                            ],
                          },
                          m.value
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
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(ht, { className: 'h-5 w-5' }),
                        'Cài đặt giọng nói',
                      ],
                    }),
                    e.jsx(M, { children: 'Điều chỉnh thời gian và âm thanh' }),
                  ],
                }),
                e.jsxs(j, {
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
                          onChange: m =>
                            l('silenceTimeout', parseInt(m.target.value)),
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
                          onChange: m =>
                            l('maxDuration', parseInt(m.target.value)),
                          className: 'mt-1',
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsxs(b, {
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(ca, { className: 'h-5 w-5' }),
                        'Âm thanh nền',
                      ],
                    }),
                    e.jsx(M, { children: 'Chọn âm thanh nền cho cuộc gọi' }),
                  ],
                }),
                e.jsx(j, {
                  children: e.jsxs(W, {
                    value: s.customization.backgroundSound,
                    onValueChange: m => l('backgroundSound', m),
                    children: [
                      e.jsx(X, { children: e.jsx(Y, {}) }),
                      e.jsx(J, {
                        children: Rt.map(m =>
                          e.jsx(
                            N,
                            {
                              value: m.value,
                              children: e.jsxs('div', {
                                children: [
                                  e.jsx('div', {
                                    className: 'font-medium',
                                    children: m.label,
                                  }),
                                  e.jsx('div', {
                                    className: 'text-xs text-gray-500',
                                    children: m.description,
                                  }),
                                ],
                              }),
                            },
                            m.value
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
          e.jsxs(la, {
            variant: 'destructive',
            children: [
              e.jsx(te, { className: 'h-4 w-4' }),
              e.jsxs(ia, {
                children: [
                  s.error.error,
                  s.error.upgradeRequired &&
                    e.jsx('div', {
                      className: 'mt-2',
                      children: e.jsx(g, {
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
            e.jsxs(g, {
              variant: 'outline',
              onClick: r,
              children: [e.jsx(Us, { className: 'w-4 h-4 mr-2' }), 'Quay lại'],
            }),
            e.jsx(g, {
              onClick: x,
              disabled:
                s.customization.languages.length === 0 || s.isGenerating,
              size: 'lg',
              children: s.isGenerating
                ? e.jsxs(e.Fragment, {
                    children: [
                      e.jsx(He, { className: 'w-4 h-4 mr-2 animate-spin' }),
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
  Qt = ({ state: s, onUpdateState: n }) => {
    const [, r] = Va(),
      t = () => {
        r('/dashboard');
      },
      a = () => {
        r('/dashboard/assistant');
      };
    return e.jsxs(u, {
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
                children: e.jsx(cs, { className: 'h-8 w-8' }),
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
        e.jsxs(j, {
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
                          'ID:',
                          ' ',
                          e.jsx('code', {
                            className: 'bg-blue-100 px-1 rounded',
                            children: s.assistantId,
                          }),
                        ],
                      }),
                      e.jsxs('div', {
                        children: [
                          'Tính cách:',
                          ' ',
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
                    e.jsxs(g, {
                      onClick: a,
                      variant: 'outline',
                      className: 'flex-1',
                      children: [
                        e.jsx(be, { className: 'w-4 h-4 mr-2' }),
                        'Kiểm tra Assistant',
                      ],
                    }),
                    e.jsx(g, {
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
  Yn = () => {
    const [s, n] = o.useState({
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
      a = w => {
        n(c => ({ ...c, ...w }));
      },
      l = w => {
        s.currentStep === 1 && w
          ? a({ hotelData: w, currentStep: 2, error: null })
          : s.currentStep === 2
            ? a({ currentStep: 3, error: null })
            : s.currentStep === 3 &&
              w &&
              a({ assistantId: w, currentStep: 4, error: null });
      },
      i = () => {
        s.currentStep > 1 && a({ currentStep: s.currentStep - 1, error: null });
      },
      d = w => {
        a({ error: w });
      },
      x = () => {
        a({ error: null, retryCount: s.retryCount + 1 });
      },
      m = { state: s, onNext: l, onBack: i, onError: d, onUpdateState: a };
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
              e.jsx(Me, { value: t, className: 'h-2' }),
            ],
          }),
          s.error &&
            e.jsx('div', {
              className: 'max-w-2xl mx-auto mb-6',
              children: e.jsxs(la, {
                variant: 'destructive',
                children: [
                  e.jsx(te, { className: 'h-4 w-4' }),
                  e.jsxs(ia, {
                    className: 'flex items-center justify-between',
                    children: [
                      e.jsx('span', { children: s.error.error }),
                      e.jsxs(g, {
                        variant: 'outline',
                        size: 'sm',
                        onClick: x,
                        children: [
                          e.jsx(U, { className: 'w-4 h-4 mr-2' }),
                          'Thử lại',
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          s.currentStep === 1 && e.jsx(Gt, { ...m }),
          s.currentStep === 2 && e.jsx(Zt, { ...m }),
          s.currentStep === 3 && e.jsx(_t, { ...m }),
          s.currentStep === 4 && e.jsx(Qt, { ...m }),
        ],
      }),
    });
  },
  Ts = {
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
  ms = {
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
  Wt = () => {
    const [s, n] = o.useState(Ts),
      [r, t] = o.useState(!1),
      a = async () => {
        t(!0);
        try {
          (await new Promise(l => setTimeout(l, 1e3)),
            q.debug('Saving configuration:', 'Component', s));
        } catch (l) {
          q.error('Failed to save configuration:', 'Component', l);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(Le, { className: 'h-5 w-5' }),
                    'Cấu hình cơ bản',
                  ],
                }),
                e.jsx(M, {
                  children: 'Thiết lập thông tin và hành vi của AI Assistant',
                }),
              ],
            }),
            e.jsxs(j, {
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
                            n(i => ({ ...i, name: l.target.value })),
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
                        e.jsxs(W, {
                          value: s.voiceId,
                          onValueChange: l => n(i => ({ ...i, voiceId: l })),
                          children: [
                            e.jsx(X, {
                              className: 'mt-1',
                              children: e.jsx(Y, {}),
                            }),
                            e.jsxs(J, {
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
                        e.jsxs(W, {
                          value: s.personality,
                          onValueChange: l =>
                            n(i => ({ ...i, personality: l })),
                          children: [
                            e.jsx(X, {
                              className: 'mt-1',
                              children: e.jsx(Y, {}),
                            }),
                            e.jsxs(J, {
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
                        e.jsxs(W, {
                          value: s.tone,
                          onValueChange: l => n(i => ({ ...i, tone: l })),
                          children: [
                            e.jsx(X, {
                              className: 'mt-1',
                              children: e.jsx(Y, {}),
                            }),
                            e.jsxs(J, {
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
                            n(i => ({
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
                            n(i => ({
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
                    e.jsxs(W, {
                      value: s.backgroundSound,
                      onValueChange: l =>
                        n(i => ({ ...i, backgroundSound: l })),
                      children: [
                        e.jsx(X, { className: 'mt-1', children: e.jsx(Y, {}) }),
                        e.jsxs(J, {
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
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(ds, { className: 'h-5 w-5' }),
                    'System Prompt',
                  ],
                }),
                e.jsx(M, {
                  children:
                    'Hướng dẫn chi tiết cho AI Assistant về cách hành xử và trả lời',
                }),
              ],
            }),
            e.jsx(j, {
              children: e.jsx(ue, {
                value: s.systemPrompt,
                onChange: l => n(i => ({ ...i, systemPrompt: l.target.value })),
                rows: 8,
                className: 'font-mono text-sm',
                placeholder: 'Nhập system prompt cho AI Assistant...',
              }),
            }),
          ],
        }),
        e.jsx('div', {
          className: 'flex justify-end',
          children: e.jsx(g, {
            onClick: a,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(He, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(ge, { className: 'w-4 h-4 mr-2' }),
                    'Lưu cấu hình',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  Xt = () => {
    const [s, n] = o.useState(!1),
      [r, t] = o.useState(''),
      [a, l] = o.useState(''),
      [i, d] = o.useState(!1),
      x = async () => {
        if (r.trim()) {
          d(!0);
          try {
            (await new Promise(m => setTimeout(m, 2e3)),
              l(
                `Xin chào! Tôi là AI Assistant của Mi Nhon Hotel. Tôi có thể giúp bạn về ${r}. Bạn có cần tôi hỗ trợ gì thêm không?`
              ));
          } catch {
            l('Đã xảy ra lỗi khi kiểm tra. Vui lòng thử lại.');
          } finally {
            d(!1);
          }
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(da, { className: 'h-5 w-5' }),
                    'Test AI Assistant',
                  ],
                }),
                e.jsx(M, {
                  children:
                    'Kiểm tra phản hồi của AI Assistant với các câu hỏi mẫu',
                }),
              ],
            }),
            e.jsxs(j, {
              className: 'space-y-4',
              children: [
                e.jsxs('div', {
                  className: 'flex items-center space-x-2',
                  children: [
                    e.jsx(B, {
                      id: 'test-mode',
                      checked: s,
                      onCheckedChange: n,
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
                                onChange: m => t(m.target.value),
                                placeholder: 'Ví dụ: Tôi muốn đặt phòng',
                                className: 'flex-1',
                              }),
                              e.jsx(g, {
                                onClick: x,
                                disabled: !r.trim() || i,
                                children: i
                                  ? e.jsx(He, {
                                      className: 'w-4 h-4 animate-spin',
                                    })
                                  : e.jsx(da, { className: 'w-4 h-4' }),
                              }),
                            ],
                          }),
                        ],
                      }),
                      a &&
                        e.jsxs('div', {
                          className: 'p-4 bg-gray-50 rounded-lg',
                          children: [
                            e.jsx(h, {
                              className: 'text-sm font-medium',
                              children: 'Phản hồi của AI:',
                            }),
                            e.jsx('p', {
                              className: 'text-sm text-gray-700 mt-1',
                              children: a,
                            }),
                          ],
                        }),
                    ],
                  }),
              ],
            }),
          ],
        }),
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsx(b, { children: 'Mẫu câu hỏi thường gặp' }),
                e.jsx(M, { children: 'Các câu hỏi mà khách hàng thường hỏi' }),
              ],
            }),
            e.jsx(j, {
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
                ].map((m, w) =>
                  e.jsxs(
                    g,
                    {
                      variant: 'outline',
                      size: 'sm',
                      className: 'justify-start text-left h-auto p-2',
                      onClick: () => t(m),
                      children: [
                        e.jsx(ds, { className: 'w-3 h-3 mr-2 shrink-0' }),
                        e.jsx('span', { className: 'text-xs', children: m }),
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
  Yt = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          children: [
            e.jsxs(u, {
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
                e.jsxs(j, {
                  children: [
                    e.jsx('div', {
                      className: 'text-2xl font-bold',
                      children: ms.totalCalls.toLocaleString(),
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-muted-foreground',
                      children: 'Tháng này',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  className:
                    'flex flex-row items-center justify-between space-y-0 pb-2',
                  children: [
                    e.jsx(b, {
                      className: 'text-sm font-medium',
                      children: 'Đánh giá trung bình',
                    }),
                    e.jsx(Ie, { className: 'h-4 w-4 text-muted-foreground' }),
                  ],
                }),
                e.jsxs(j, {
                  children: [
                    e.jsxs('div', {
                      className: 'text-2xl font-bold',
                      children: [ms.averageRating, '/5'],
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-muted-foreground',
                      children: 'Điểm hài lòng',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(u, {
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
                e.jsxs(j, {
                  children: [
                    e.jsxs('div', {
                      className: 'text-2xl font-bold',
                      children: [ms.responseTime, 's'],
                    }),
                    e.jsx('p', {
                      className: 'text-xs text-muted-foreground',
                      children: 'Trung bình',
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  className:
                    'flex flex-row items-center justify-between space-y-0 pb-2',
                  children: [
                    e.jsx(b, {
                      className: 'text-sm font-medium',
                      children: 'Tỷ lệ thành công',
                    }),
                    e.jsx(cs, { className: 'h-4 w-4 text-muted-foreground' }),
                  ],
                }),
                e.jsxs(j, {
                  children: [
                    e.jsxs('div', {
                      className: 'text-2xl font-bold',
                      children: [ms.successRate, '%'],
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
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsx(b, { children: 'Ý định phổ biến' }),
                e.jsx(M, {
                  children: 'Các yêu cầu mà khách hàng thường hỏi nhất',
                }),
              ],
            }),
            e.jsx(j, {
              children: e.jsx('div', {
                className: 'space-y-4',
                children: ms.topIntents.map((s, n) =>
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
                    n
                  )
                ),
              }),
            }),
          ],
        }),
      ],
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
                  e.jsx(cs, { className: 'w-3 h-3 mr-1' }),
                  'Hoạt động',
                ],
              }),
            }),
          ],
        }),
        e.jsxs(u, {
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
            e.jsx(j, {
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
                        children: Ts.name,
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
                        children: Ts.id,
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
                        children: new Date(Ts.lastUpdated).toLocaleString(
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
                e.jsx(H, { value: 'config', children: 'Cấu hình' }),
                e.jsx(H, { value: 'test', children: 'Kiểm tra' }),
                e.jsx(H, { value: 'performance', children: 'Hiệu suất' }),
              ],
            }),
            e.jsx(z, {
              value: 'config',
              className: 'space-y-4',
              children: e.jsx(Wt, {}),
            }),
            e.jsx(z, {
              value: 'test',
              className: 'space-y-4',
              children: e.jsx(Xt, {}),
            }),
            e.jsx(z, {
              value: 'performance',
              className: 'space-y-4',
              children: e.jsx(Yt, {}),
            }),
          ],
        }),
      ],
    }),
  me = {
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
  Ss = ({
    title: s,
    value: n,
    change: r,
    icon: t,
    description: a,
    suffix: l = '',
  }) =>
    e.jsxs(u, {
      children: [
        e.jsxs(y, {
          className:
            'flex flex-row items-center justify-between space-y-0 pb-2',
          children: [
            e.jsx(b, { className: 'text-sm font-medium', children: s }),
            e.jsx(t, { className: 'h-4 w-4 text-muted-foreground' }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsxs('div', {
              className: 'text-2xl font-bold',
              children: [n, l],
            }),
            e.jsxs('div', {
              className: 'flex items-center pt-1',
              children: [
                e.jsx('div', {
                  className: 'text-xs text-muted-foreground',
                  children: a,
                }),
                r !== void 0 &&
                  e.jsxs('div', {
                    className: `ml-auto flex items-center text-xs ${r > 0 ? 'text-green-600' : 'text-red-600'}`,
                    children: [
                      e.jsx(oe, {
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
  Jt = ({ data: s, dataKey: n, nameKey: r, title: t }) => {
    const a = Math.max(...s.map(l => l[n]));
    return e.jsxs(u, {
      children: [
        e.jsx(y, {
          children: e.jsx(b, { className: 'text-base', children: t }),
        }),
        e.jsx(j, {
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
                        style: { width: `${(l[n] / a) * 100}%` },
                      }),
                    }),
                    e.jsx('div', {
                      className: 'w-16 text-sm font-medium text-right',
                      children: l[n],
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
  en = () => {
    const [s, n] = o.useState('30d'),
      [r, t] = o.useState('all');
    return e.jsxs(u, {
      children: [
        e.jsx(y, {
          children: e.jsxs(b, {
            className: 'flex items-center gap-2',
            children: [e.jsx(ea, { className: 'h-5 w-5' }), 'Bộ lọc'],
          }),
        }),
        e.jsx(j, {
          children: e.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-3 gap-4',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx('label', {
                    className: 'text-sm font-medium',
                    children: 'Khoảng thời gian',
                  }),
                  e.jsxs(W, {
                    value: s,
                    onValueChange: n,
                    children: [
                      e.jsx(X, { className: 'mt-1', children: e.jsx(Y, {}) }),
                      e.jsxs(J, {
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
                  e.jsxs(W, {
                    value: r,
                    onValueChange: t,
                    children: [
                      e.jsx(X, { className: 'mt-1', children: e.jsx(Y, {}) }),
                      e.jsxs(J, {
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
                  e.jsxs(g, {
                    variant: 'outline',
                    size: 'sm',
                    children: [
                      e.jsx(U, { className: 'h-4 w-4 mr-2' }),
                      'Làm mới',
                    ],
                  }),
                  e.jsxs(g, {
                    variant: 'outline',
                    size: 'sm',
                    children: [
                      e.jsx(We, { className: 'h-4 w-4 mr-2' }),
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
  sn = () =>
    e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
          children: [
            e.jsx(Ss, {
              title: 'Tổng cuộc gọi',
              value: me.overview.totalCalls.toLocaleString(),
              change: me.overview.totalCallsGrowth,
              icon: be,
              description: 'Tháng này',
            }),
            e.jsx(Ss, {
              title: 'Thời gian trung bình',
              value: Math.floor(me.overview.averageCallDuration / 60),
              change: me.overview.callDurationGrowth,
              icon: ye,
              description: 'Phút/cuộc gọi',
              suffix: 'm',
            }),
            e.jsx(Ss, {
              title: 'Người dùng duy nhất',
              value: me.overview.uniqueUsers,
              change: me.overview.uniqueUsersGrowth,
              icon: pe,
              description: 'Tháng này',
            }),
            e.jsx(Ss, {
              title: 'Điểm hài lòng',
              value: me.overview.satisfactionScore,
              change: me.overview.satisfactionGrowth,
              icon: oe,
              description: 'Trên 5 điểm',
              suffix: '/5',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsx(Jt, {
              data: me.callsByDay,
              dataKey: 'calls',
              nameKey: 'day',
              title: 'Cuộc gọi theo ngày trong tuần',
            }),
            e.jsxs(u, {
              children: [
                e.jsx(y, {
                  children: e.jsxs(b, {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(rs, { className: 'h-5 w-5' }),
                      'Phân bố ngôn ngữ',
                    ],
                  }),
                }),
                e.jsx(j, {
                  children: e.jsx('div', {
                    className: 'space-y-3',
                    children: me.languageDistribution.map((s, n) =>
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
                        n
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
  an = () =>
    e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs('div', {
        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
        children: [
          e.jsxs(u, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Cuộc gọi theo giờ' }),
                  e.jsx(M, { children: 'Phân bố cuộc gọi trong 24 giờ' }),
                ],
              }),
              e.jsx(j, {
                children: e.jsx('div', {
                  className: 'space-y-2',
                  children: me.callsByHour.map((s, n) =>
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
                      n
                    )
                  ),
                }),
              }),
            ],
          }),
          e.jsxs(u, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Ý định cuộc gọi' }),
                  e.jsx(M, { children: 'Phân loại theo mục đích' }),
                ],
              }),
              e.jsx(j, {
                children: e.jsx('div', {
                  className: 'space-y-3',
                  children: me.intentDistribution.map((s, n) =>
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
                      n
                    )
                  ),
                }),
              }),
            ],
          }),
        ],
      }),
    }),
  tn = () =>
    e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs('div', {
        className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
        children: [
          e.jsxs(u, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Điểm hài lòng theo ý định' }),
                  e.jsx(M, {
                    children: 'Đánh giá khách hàng cho từng loại dịch vụ',
                  }),
                ],
              }),
              e.jsx(j, {
                children: e.jsx('div', {
                  className: 'space-y-4',
                  children: me.satisfactionByIntent.map((s, n) =>
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
                      n
                    )
                  ),
                }),
              }),
            ],
          }),
          e.jsxs(u, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Xu hướng điểm hài lòng' }),
                  e.jsx(M, { children: 'Thay đổi theo thời gian' }),
                ],
              }),
              e.jsx(j, {
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
  el = () =>
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
                e.jsxs(g, {
                  variant: 'outline',
                  size: 'sm',
                  children: [
                    e.jsx(Js, { className: 'h-4 w-4 mr-2' }),
                    'Tùy chỉnh khoảng thời gian',
                  ],
                }),
                e.jsxs(g, {
                  variant: 'outline',
                  size: 'sm',
                  children: [
                    e.jsx(We, { className: 'h-4 w-4 mr-2' }),
                    'Xuất báo cáo',
                  ],
                }),
              ],
            }),
          ],
        }),
        e.jsx(en, {}),
        e.jsxs(we, {
          defaultValue: 'overview',
          className: 'space-y-4',
          children: [
            e.jsxs(Ce, {
              className: 'grid w-full grid-cols-3',
              children: [
                e.jsx(H, { value: 'overview', children: 'Tổng quan' }),
                e.jsx(H, { value: 'patterns', children: 'Mẫu cuộc gọi' }),
                e.jsx(H, { value: 'satisfaction', children: 'Hài lòng' }),
              ],
            }),
            e.jsx(z, {
              value: 'overview',
              className: 'space-y-4',
              children: e.jsx(sn, {}),
            }),
            e.jsx(z, {
              value: 'patterns',
              className: 'space-y-4',
              children: e.jsx(an, {}),
            }),
            e.jsx(z, {
              value: 'satisfaction',
              className: 'space-y-4',
              children: e.jsx(tn, {}),
            }),
          ],
        }),
      ],
    }),
  Ps = {
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
  nn = () => {
    const [s, n] = o.useState(Ps.basicInfo),
      [r, t] = o.useState(!1),
      a = async () => {
        t(!0);
        try {
          (await new Promise(l => setTimeout(l, 1e3)),
            q.debug('Saving hotel settings:', 'Component', s));
        } catch (l) {
          q.error('Failed to save settings:', 'Component', l);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(Ds, { className: 'h-5 w-5' }),
                    'Thông tin cơ bản',
                  ],
                }),
                e.jsx(M, {
                  children: 'Cập nhật thông tin chi tiết về khách sạn',
                }),
              ],
            }),
            e.jsxs(j, {
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
                            n(i => ({ ...i, name: l.target.value })),
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
                            n(i => ({ ...i, phone: l.target.value })),
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
                        n(i => ({ ...i, address: l.target.value })),
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
                            n(i => ({ ...i, email: l.target.value })),
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
                            n(i => ({ ...i, website: l.target.value })),
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
                    e.jsx(ue, {
                      id: 'description',
                      value: s.description,
                      onChange: l =>
                        n(i => ({ ...i, description: l.target.value })),
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
                            n(i => ({ ...i, checkInTime: l.target.value })),
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
                            n(i => ({ ...i, checkOutTime: l.target.value })),
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
                            n(i => ({ ...i, currency: l.target.value })),
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
                            n(i => ({ ...i, timezone: l.target.value })),
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
          children: e.jsx(g, {
            onClick: a,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(He, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(ge, { className: 'w-4 h-4 mr-2' }),
                    'Lưu thay đổi',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  ln = () => {
    const [s, n] = o.useState(Ps.notifications),
      [r, t] = o.useState(!1),
      a = i => {
        n(d => ({ ...d, [i]: !d[i] }));
      },
      l = async () => {
        t(!0);
        try {
          (await new Promise(i => setTimeout(i, 1e3)),
            q.debug('Saving notification settings:', 'Component', s));
        } catch (i) {
          q.error('Failed to save settings:', 'Component', i);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(js, { className: 'h-5 w-5' }),
                    'Cài đặt thông báo',
                  ],
                }),
                e.jsx(M, { children: 'Tùy chọn thông báo và báo cáo' }),
              ],
            }),
            e.jsxs(j, {
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
                            e.jsx(B, {
                              checked: s.emailNotifications,
                              onCheckedChange: () => a('emailNotifications'),
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
                            e.jsx(B, {
                              checked: s.smsNotifications,
                              onCheckedChange: () => a('smsNotifications'),
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
                            e.jsx(B, {
                              checked: s.pushNotifications,
                              onCheckedChange: () => a('pushNotifications'),
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
                            e.jsx(B, {
                              checked: s.dailyReports,
                              onCheckedChange: () => a('dailyReports'),
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
                            e.jsx(B, {
                              checked: s.weeklyReports,
                              onCheckedChange: () => a('weeklyReports'),
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
                            e.jsx(B, {
                              checked: s.monthlyReports,
                              onCheckedChange: () => a('monthlyReports'),
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
                            e.jsx(B, {
                              checked: s.alertOnErrors,
                              onCheckedChange: () => a('alertOnErrors'),
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
                            e.jsx(B, {
                              checked: s.alertOnLowRating,
                              onCheckedChange: () => a('alertOnLowRating'),
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
          children: e.jsx(g, {
            onClick: l,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(He, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(ge, { className: 'w-4 h-4 mr-2' }),
                    'Lưu cài đặt',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  rn = () => {
    const [s, n] = o.useState(Ps.privacy),
      [r, t] = o.useState(!1),
      a = i => {
        n(d => ({ ...d, [i]: !d[i] }));
      },
      l = async () => {
        t(!0);
        try {
          (await new Promise(i => setTimeout(i, 1e3)),
            q.debug('Saving privacy settings:', 'Component', s));
        } catch (i) {
          q.error('Failed to save settings:', 'Component', i);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(ce, { className: 'h-5 w-5' }),
                    'Quyền riêng tư & Bảo mật',
                  ],
                }),
                e.jsx(M, {
                  children: 'Cấu hình bảo mật và quyền riêng tư dữ liệu',
                }),
              ],
            }),
            e.jsxs(j, {
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
                        e.jsx(B, {
                          checked: s.recordCalls,
                          onCheckedChange: () => a('recordCalls'),
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
                        e.jsx(B, {
                          checked: s.shareAnalytics,
                          onCheckedChange: () => a('shareAnalytics'),
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
                        e.jsx(B, {
                          checked: s.allowDataExport,
                          onCheckedChange: () => a('allowDataExport'),
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
                        e.jsx(B, {
                          checked: s.gdprCompliance,
                          onCheckedChange: () => a('gdprCompliance'),
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
                            n(d => ({
                              ...d,
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
                            ' ',
                            'ngày',
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
          children: e.jsx(g, {
            onClick: l,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(He, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(ge, { className: 'w-4 h-4 mr-2' }),
                    'Lưu cài đặt',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  cn = () => {
    const [s, n] = o.useState(Ps.api),
      [r, t] = o.useState(!1),
      a = async () => {
        t(!0);
        try {
          (await new Promise(l => setTimeout(l, 1e3)),
            q.debug('Saving API settings:', 'Component', s));
        } catch (l) {
          q.error('Failed to save settings:', 'Component', l);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(Da, { className: 'h-5 w-5' }),
                    'Cấu hình API',
                  ],
                }),
                e.jsx(M, { children: 'Quản lý API keys và webhook' }),
              ],
            }),
            e.jsxs(j, {
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
                        n(i => ({ ...i, webhookUrl: l.target.value })),
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
                            e.jsx(te, { className: 'h-4 w-4 text-yellow-600' }),
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
                            n(i => ({
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
                            n(i => ({
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
          children: e.jsx(g, {
            onClick: a,
            disabled: r,
            children: r
              ? e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(He, { className: 'w-4 h-4 mr-2 animate-spin' }),
                    'Đang lưu...',
                  ],
                })
              : e.jsxs(e.Fragment, {
                  children: [
                    e.jsx(ge, { className: 'w-4 h-4 mr-2' }),
                    'Lưu cài đặt',
                  ],
                }),
          }),
        }),
      ],
    });
  },
  dn = () => {
    const s = [
        { name: 'Database Connection', status: 'healthy', icon: ls },
        { name: 'Vapi API', status: 'healthy', icon: be },
        { name: 'OpenAI API', status: 'healthy', icon: fe },
        { name: 'Email Service', status: 'healthy', icon: sa },
        { name: 'Webhook Endpoint', status: 'warning', icon: rs },
        { name: 'SSL Certificate', status: 'healthy', icon: ce },
      ],
      n = t => {
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
    return e.jsxs(u, {
      children: [
        e.jsxs(y, {
          children: [
            e.jsxs(b, {
              className: 'flex items-center gap-2',
              children: [
                e.jsx(cs, { className: 'h-5 w-5' }),
                'Trạng thái hệ thống',
              ],
            }),
            e.jsx(M, { children: 'Kiểm tra tình trạng các dịch vụ' }),
          ],
        }),
        e.jsx(j, {
          children: e.jsx('div', {
            className: 'space-y-4',
            children: s.map((t, a) =>
              e.jsxs(
                'div',
                {
                  className:
                    'flex items-center justify-between p-3 border rounded-lg',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center gap-3',
                      children: [
                        e.jsx(t.icon, { className: `h-5 w-5 ${n(t.status)}` }),
                        e.jsx('span', {
                          className: 'font-medium',
                          children: t.name,
                        }),
                      ],
                    }),
                    r(t.status),
                  ],
                },
                a
              )
            ),
          }),
        }),
      ],
    });
  },
  sl = () =>
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
        e.jsx(dn, {}),
        e.jsxs(we, {
          defaultValue: 'hotel',
          className: 'space-y-4',
          children: [
            e.jsxs(Ce, {
              className: 'grid w-full grid-cols-4',
              children: [
                e.jsx(H, { value: 'hotel', children: 'Khách sạn' }),
                e.jsx(H, { value: 'notifications', children: 'Thông báo' }),
                e.jsx(H, { value: 'privacy', children: 'Quyền riêng tư' }),
                e.jsx(H, { value: 'api', children: 'API' }),
              ],
            }),
            e.jsx(z, {
              value: 'hotel',
              className: 'space-y-4',
              children: e.jsx(nn, {}),
            }),
            e.jsx(z, {
              value: 'notifications',
              className: 'space-y-4',
              children: e.jsx(ln, {}),
            }),
            e.jsx(z, {
              value: 'privacy',
              className: 'space-y-4',
              children: e.jsx(rn, {}),
            }),
            e.jsx(z, {
              value: 'api',
              className: 'space-y-4',
              children: e.jsx(cn, {}),
            }),
          ],
        }),
      ],
    }),
  _ = {
    calls: { total: 156, today: 23 },
    requests: { pending: 8, inProgress: 12, completed: 45, totalToday: 18 },
    satisfaction: { rating: 4.7, trend: '+0.2' },
    system: { uptime: 99.8, responseTime: 150, errors: 2 },
  },
  je = ({
    title: s,
    value: n,
    description: r,
    icon: t,
    trend: a,
    color: l = 'blue',
  }) =>
    e.jsxs(u, {
      children: [
        e.jsxs(y, {
          className:
            'flex flex-row items-center justify-between space-y-0 pb-2',
          children: [
            e.jsx(b, { className: 'text-sm font-medium', children: s }),
            e.jsx(t, { className: `h-4 w-4 text-${l}-600` }),
          ],
        }),
        e.jsxs(j, {
          children: [
            e.jsx('div', { className: 'text-2xl font-bold', children: n }),
            r &&
              e.jsx('p', {
                className: 'text-xs text-muted-foreground',
                children: r,
              }),
            a &&
              e.jsxs('div', {
                className: 'flex items-center text-xs text-green-600 mt-1',
                children: [e.jsx(oe, { className: 'h-3 w-3 mr-1' }), a],
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
            e.jsx(je, {
              title: 'Tổng cuộc gọi',
              value: _.calls.total,
              description: 'Hôm nay: +23',
              icon: be,
              trend: '+15.2%',
              color: 'blue',
            }),
            e.jsx(je, {
              title: 'Đánh giá trung bình',
              value: `${_.satisfaction.rating}/5`,
              description: '89 phản hồi',
              icon: ss,
              trend: _.satisfaction.trend,
              color: 'green',
            }),
            e.jsx(je, {
              title: 'Yêu cầu đang chờ',
              value: _.requests.pending,
              description: 'Cần xử lý ngay',
              icon: te,
              color: 'orange',
            }),
            e.jsx(je, {
              title: 'Uptime hệ thống',
              value: `${_.system.uptime}%`,
              description: '30 ngày qua',
              icon: Ie,
              trend: '+0.1%',
              color: 'purple',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Hành động nhanh' }),
                    e.jsx(M, { children: 'Các tác vụ thường xuyên' }),
                  ],
                }),
                e.jsxs(j, {
                  className: 'space-y-3',
                  children: [
                    e.jsx(Ne, {
                      requiredPermission: 'assistant:configure',
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/settings',
                        children: e.jsxs(g, {
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
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/analytics',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(Is, { className: 'mr-2 h-4 w-4' }),
                            'Xem báo cáo chi tiết',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'staff:manage',
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/staff-management',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(pe, { className: 'mr-2 h-4 w-4' }),
                            'Quản lý nhân viên',
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Hoạt động gần đây' }),
                    e.jsx(M, { children: 'Cập nhật hệ thống mới nhất' }),
                  ],
                }),
                e.jsx(j, {
                  children: e.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          e.jsx(xe, { className: 'h-4 w-4 text-green-500' }),
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
                          e.jsx(te, { className: 'h-4 w-4 text-orange-500' }),
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
                          e.jsx(oe, { className: 'h-4 w-4 text-blue-500' }),
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
  on = () =>
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
            e.jsx(je, {
              title: 'Yêu cầu hôm nay',
              value: _.requests.totalToday,
              description: 'Mới trong ngày',
              icon: ha,
              color: 'green',
            }),
            e.jsx(je, {
              title: 'Đang chờ xử lý',
              value: _.requests.pending,
              description: 'Cần hành động',
              icon: ye,
              color: 'orange',
            }),
            e.jsx(je, {
              title: 'Đã hoàn thành',
              value: _.requests.completed,
              description: 'Tuần này',
              icon: xe,
              color: 'blue',
            }),
            e.jsx(je, {
              title: 'Cuộc gọi hôm nay',
              value: _.calls.today,
              description: 'Thời gian TB: 2.3 phút',
              icon: be,
              color: 'purple',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Công việc của tôi' }),
                    e.jsx(M, { children: 'Nhiệm vụ cần thực hiện' }),
                  ],
                }),
                e.jsxs(j, {
                  className: 'space-y-3',
                  children: [
                    e.jsx(Ne, {
                      requiredPermission: 'requests:view',
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/requests',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(ha, { className: 'mr-2 h-4 w-4' }),
                            'Xem yêu cầu khách hàng (',
                            _.requests.pending,
                            ')',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'calls:view',
                      children: e.jsx(ie, {
                        href: '/dashboard/calls',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(ds, { className: 'mr-2 h-4 w-4' }),
                            'Lịch sử cuộc gọi',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'guests:manage',
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/guest-management',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(pe, { className: 'mr-2 h-4 w-4' }),
                            'Quản lý khách hàng',
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Trạng thái yêu cầu' }),
                    e.jsx(M, { children: 'Phân bố theo trạng thái' }),
                  ],
                }),
                e.jsx(j, {
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
                            children: _.requests.pending,
                          }),
                        ],
                      }),
                      e.jsx(Me, {
                        value:
                          (_.requests.pending /
                            (_.requests.pending +
                              _.requests.inProgress +
                              _.requests.completed)) *
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
                            children: _.requests.inProgress,
                          }),
                        ],
                      }),
                      e.jsx(Me, {
                        value:
                          (_.requests.inProgress /
                            (_.requests.pending +
                              _.requests.inProgress +
                              _.requests.completed)) *
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
                            children: _.requests.completed,
                          }),
                        ],
                      }),
                      e.jsx(Me, {
                        value:
                          (_.requests.completed /
                            (_.requests.pending +
                              _.requests.inProgress +
                              _.requests.completed)) *
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
  xn = () =>
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
            e.jsx(je, {
              title: 'Uptime hệ thống',
              value: `${_.system.uptime}%`,
              description: '30 ngày qua',
              icon: aa,
              trend: '+0.1%',
              color: 'purple',
            }),
            e.jsx(je, {
              title: 'Response Time',
              value: `${_.system.responseTime}ms`,
              description: 'Trung bình 24h',
              icon: Ie,
              color: 'blue',
            }),
            e.jsx(je, {
              title: 'Lỗi hệ thống',
              value: _.system.errors,
              description: 'Hôm nay',
              icon: te,
              color: 'red',
            }),
            e.jsx(je, {
              title: 'API Calls',
              value: '12.5K',
              description: 'Hôm nay',
              icon: ls,
              trend: '+8.2%',
              color: 'green',
            }),
          ],
        }),
        e.jsxs('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
          children: [
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Công cụ IT' }),
                    e.jsx(M, { children: 'Quản lý hệ thống và bảo mật' }),
                  ],
                }),
                e.jsxs(j, {
                  className: 'space-y-3',
                  children: [
                    e.jsx(Ne, {
                      requiredPermission: 'system:monitor',
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/system-monitoring',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(ta, { className: 'mr-2 h-4 w-4' }),
                            'Giám sát hệ thống',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'logs:view',
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/logs',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(ls, { className: 'mr-2 h-4 w-4' }),
                            'Xem system logs',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'security:manage',
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/security',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(ce, { className: 'mr-2 h-4 w-4' }),
                            'Cấu hình bảo mật',
                          ],
                        }),
                      }),
                    }),
                    e.jsx(Ne, {
                      requiredPermission: 'integrations:manage',
                      children: e.jsx(ie, {
                        href: '/unified-dashboard/integrations',
                        children: e.jsxs(g, {
                          className: 'w-full justify-start',
                          variant: 'outline',
                          children: [
                            e.jsx(La, { className: 'mr-2 h-4 w-4' }),
                            'Quản lý tích hợp',
                          ],
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
            e.jsxs(u, {
              children: [
                e.jsxs(y, {
                  children: [
                    e.jsx(b, { children: 'Cảnh báo hệ thống' }),
                    e.jsx(M, { children: 'Thông báo kỹ thuật quan trọng' }),
                  ],
                }),
                e.jsx(j, {
                  children: e.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      e.jsxs('div', {
                        className: 'flex items-center space-x-3',
                        children: [
                          e.jsx(xe, { className: 'h-4 w-4 text-green-500' }),
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
                          e.jsx(te, { className: 'h-4 w-4 text-orange-500' }),
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
                          e.jsx(ce, { className: 'h-4 w-4 text-blue-500' }),
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
  al = () => {
    const { user: s } = Se(),
      n = s?.role || 'front-desk',
      r = () => {
        switch (n) {
          case 'hotel-manager':
            return e.jsx(hn, {});
          case 'front-desk':
            return e.jsx(on, {});
          case 'it-manager':
            return e.jsx(xn, {});
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
  Za = [
    'Tất cả',
    'Đã ghi nhận',
    'Đang thực hiện',
    'Đã thực hiện và đang bàn giao cho khách',
    'Hoàn thiện',
    'Lưu ý khác',
  ],
  _a = s => {
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
  Qa = s => {
    switch (s) {
      case 'Đã ghi nhận':
        return e.jsx(ye, { className: 'h-3 w-3' });
      case 'Đang thực hiện':
        return e.jsx(te, { className: 'h-3 w-3' });
      case 'Đã thực hiện và đang bàn giao cho khách':
        return e.jsx(U, { className: 'h-3 w-3' });
      case 'Hoàn thiện':
        return e.jsx(xe, { className: 'h-3 w-3' });
      case 'Lưu ý khác':
        return e.jsx(te, { className: 'h-3 w-3' });
      default:
        return e.jsx(ye, { className: 'h-3 w-3' });
    }
  },
  mn = ({
    request: s,
    isOpen: n,
    onClose: r,
    onStatusChange: t,
    onOpenMessage: a,
  }) => {
    const [l, i] = o.useState(s.status),
      d = () => {
        l !== s.status && t(l);
      };
    return e.jsx(Be, {
      open: n,
      onOpenChange: r,
      children: e.jsxs(Ue, {
        className: 'max-w-2xl',
        children: [
          e.jsxs(Ke, {
            children: [
              e.jsxs($e, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(Ys, { className: 'h-5 w-5' }),
                  'Phòng ',
                  s.roomNumber,
                  ' - ',
                  s.orderId,
                ],
              }),
              e.jsx(Xe, { children: 'Chi tiết yêu cầu khách hàng' }),
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
                          e.jsx(na, { className: 'h-4 w-4 text-gray-500' }),
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
                          e.jsx(Js, { className: 'h-4 w-4 text-gray-500' }),
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
                        className: V('mt-2', _a(s.status)),
                        children: [
                          Qa(s.status),
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
                      e.jsxs(W, {
                        value: l,
                        onValueChange: i,
                        children: [
                          e.jsx(X, {
                            className: 'mt-2',
                            children: e.jsx(Y, {}),
                          }),
                          e.jsx(J, {
                            children: Za.filter(x => x !== 'Tất cả').map(x =>
                              e.jsx(N, { value: x, children: x }, x)
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
                  e.jsxs(g, {
                    onClick: d,
                    disabled: l === s.status,
                    children: [
                      e.jsx(Qe, { className: 'h-4 w-4 mr-2' }),
                      'Cập nhật trạng thái',
                    ],
                  }),
                  e.jsxs(g, {
                    variant: 'outline',
                    onClick: a,
                    children: [
                      e.jsx(ds, { className: 'h-4 w-4 mr-2' }),
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
  un = ({
    request: s,
    messages: n,
    isOpen: r,
    onClose: t,
    onSendMessage: a,
    loading: l,
  }) => {
    const [i, d] = o.useState(''),
      x = () => {
        i.trim() && (a(i.trim()), d(''));
      };
    return e.jsx(Be, {
      open: r,
      onOpenChange: t,
      children: e.jsxs(Ue, {
        className: 'max-w-md',
        children: [
          e.jsx(Ke, {
            children: e.jsxs($e, {
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
                  n.length === 0
                    ? e.jsx('div', {
                        className: 'text-center text-gray-500 py-8',
                        children: 'Chưa có tin nhắn nào',
                      })
                    : n.map(m =>
                        e.jsx(
                          'div',
                          {
                            className: V(
                              'flex',
                              m.sender === 'staff'
                                ? 'justify-end'
                                : 'justify-start'
                            ),
                            children: e.jsxs('div', {
                              className: V(
                                'max-w-[70%] p-2 rounded-lg text-sm',
                                m.sender === 'staff'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              ),
                              children: [
                                e.jsx('p', { children: m.content }),
                                e.jsx('p', {
                                  className: V(
                                    'text-xs mt-1',
                                    m.sender === 'staff'
                                      ? 'text-blue-100'
                                      : 'text-gray-500'
                                  ),
                                  children: m.time,
                                }),
                              ],
                            }),
                          },
                          m.id
                        )
                      ),
              }),
              e.jsxs('div', {
                className: 'space-y-2',
                children: [
                  e.jsx(ue, {
                    placeholder: 'Nhập tin nhắn...',
                    value: i,
                    onChange: m => d(m.target.value),
                    className: 'min-h-[60px]',
                  }),
                  e.jsx('div', {
                    className: 'flex justify-end',
                    children: e.jsxs(g, {
                      onClick: x,
                      disabled: !i.trim() || l,
                      size: 'sm',
                      children: [
                        l
                          ? e.jsx(U, { className: 'h-4 w-4 mr-2 animate-spin' })
                          : e.jsx(ot, { className: 'h-4 w-4 mr-2' }),
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
  tl = () => {
    const { user: s } = Se(),
      [n, r] = o.useState([]),
      [t, a] = o.useState(!0),
      [l, i] = o.useState(null),
      [d, x] = o.useState(!1),
      [m, w] = o.useState(!1),
      [c, p] = o.useState([]),
      [S, T] = o.useState(!1),
      [D, se] = o.useState('Tất cả'),
      [ae, ne] = o.useState(''),
      [le, k] = o.useState(''),
      [ee, L] = o.useState(''),
      [Q, G] = o.useState(''),
      [he, re] = o.useState(''),
      [I, v] = o.useState(!1),
      O = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      }),
      Z = async () => {
        try {
          a(!0);
          const A = await fetch('/api/staff/requests', { headers: O() });
          if (A.status === 401) {
            q.error('Unauthorized access', 'Component');
            return;
          }
          if (!A.ok) throw new Error('Failed to fetch requests');
          const K = await A.json();
          r(K);
        } catch (A) {
          q.error('Failed to fetch requests:', 'Component', A);
        } finally {
          a(!1);
        }
      },
      ke = async (A, K) => {
        try {
          (await fetch(`/api/staff/requests/${A}/status`, {
            method: 'PATCH',
            headers: O(),
            body: JSON.stringify({ status: K }),
          }),
            r(Te => Te.map(f => (f.id === A ? { ...f, status: K } : f))),
            l && l.id === A && i({ ...l, status: K }));
        } catch (Te) {
          q.error('Failed to update status:', 'Component', Te);
        }
      },
      hs = async A => {
        try {
          const K = await fetch(`/api/staff/requests/${A}/messages`, {
            headers: O(),
          });
          if (K.ok) {
            const Te = await K.json();
            p(Te);
          }
        } catch (K) {
          (q.error('Failed to fetch messages:', 'Component', K), p([]));
        }
      },
      Ms = async A => {
        if (l) {
          T(!0);
          try {
            await fetch(`/api/staff/requests/${l.id}/message`, {
              method: 'POST',
              headers: O(),
              body: JSON.stringify({ content: A }),
            });
            const K = {
              id: Date.now().toString(),
              sender: 'staff',
              content: A,
              time: new Date().toLocaleTimeString().slice(0, 5),
            };
            p(Te => [...Te, K]);
          } catch (K) {
            q.error('Failed to send message:', 'Component', K);
          } finally {
            T(!1);
          }
        }
      },
      os = async () => {
        if (Q !== '2208') {
          re('Mật khẩu không đúng');
          return;
        }
        v(!0);
        try {
          const K = await (
            await fetch('/api/staff/requests/all', {
              method: 'DELETE',
              headers: O(),
            })
          ).json();
          K.success
            ? (r([]), G(''), re(''))
            : re(K.error || 'Không thể xóa requests');
        } catch (A) {
          (q.error('Error deleting requests:', 'Component', A),
            re('Đã xảy ra lỗi khi xóa requests'));
        } finally {
          v(!1);
        }
      },
      Ve = n.filter(A => {
        if (D !== 'Tất cả' && A.status !== D) return !1;
        if (ae || le) {
          const K = new Date(A.createdAt);
          if (
            (ae && K < new Date(ae)) ||
            (le && K > new Date(`${le}T23:59:59`))
          )
            return !1;
        }
        if (ee) {
          const K = ee.toLowerCase();
          return (
            A.roomNumber.toLowerCase().includes(K) ||
            A.guestName.toLowerCase().includes(K) ||
            A.requestContent.toLowerCase().includes(K) ||
            A.orderId.toLowerCase().includes(K)
          );
        }
        return !0;
      });
    o.useEffect(() => {
      Z();
      const A = setInterval(Z, 3e4);
      return () => clearInterval(A);
    }, []);
    const Rs = A => {
        (i(A), x(!0));
      },
      Es = () => {
        (x(!1), i(null));
      },
      ys = async () => {
        l && (w(!0), await hs(l.id));
      },
      bs = () => {
        (w(!1), p([]));
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
                e.jsxs(g, {
                  variant: 'outline',
                  onClick: Z,
                  disabled: t,
                  children: [
                    e.jsx(U, {
                      className: V('h-4 w-4 mr-2', t && 'animate-spin'),
                    }),
                    'Làm mới',
                  ],
                }),
                e.jsxs(Pa, {
                  children: [
                    e.jsx(Ma, {
                      asChild: !0,
                      children: e.jsxs(g, {
                        variant: 'destructive',
                        disabled: n.length === 0,
                        children: [
                          e.jsx(_e, { className: 'h-4 w-4 mr-2' }),
                          'Xóa tất cả',
                        ],
                      }),
                    }),
                    e.jsxs(Ra, {
                      children: [
                        e.jsxs(Ea, {
                          children: [
                            e.jsx(qa, {
                              children: 'Xác nhận xóa tất cả requests',
                            }),
                            e.jsx(Oa, {
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
                              value: Q,
                              onChange: A => G(A.target.value),
                              className: he ? 'border-red-500' : '',
                            }),
                            he &&
                              e.jsx('p', {
                                className: 'text-red-500 text-sm mt-1',
                                children: he,
                              }),
                          ],
                        }),
                        e.jsxs(Ha, {
                          children: [
                            e.jsx(za, {
                              onClick: () => {
                                (G(''), re(''));
                              },
                              children: 'Hủy',
                            }),
                            e.jsx(Ba, {
                              onClick: os,
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
        e.jsxs(u, {
          children: [
            e.jsx(y, {
              children: e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [e.jsx(ea, { className: 'h-5 w-5' }), 'Bộ lọc'],
              }),
            }),
            e.jsxs(j, {
              children: [
                e.jsxs('div', {
                  className:
                    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Trạng thái' }),
                        e.jsxs(W, {
                          value: D,
                          onValueChange: se,
                          children: [
                            e.jsx(X, { children: e.jsx(Y, {}) }),
                            e.jsx(J, {
                              children: Za.map(A =>
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
                          value: ae,
                          onChange: A => ne(A.target.value),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Đến ngày' }),
                        e.jsx(C, {
                          type: 'date',
                          value: le,
                          onChange: A => k(A.target.value),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Tìm kiếm' }),
                        e.jsxs('div', {
                          className: 'relative',
                          children: [
                            e.jsx(Re, {
                              className:
                                'absolute left-3 top-3 h-4 w-4 text-gray-400',
                            }),
                            e.jsx(C, {
                              placeholder: 'Tìm theo phòng, khách...',
                              value: ee,
                              onChange: A => L(A.target.value),
                              className: 'pl-10',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (D !== 'Tất cả' || ae || le || ee) &&
                  e.jsx('div', {
                    className: 'mt-4',
                    children: e.jsx(g, {
                      variant: 'outline',
                      size: 'sm',
                      onClick: () => {
                        (se('Tất cả'), ne(''), k(''), L(''));
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
            e.jsx(u, {
              children: e.jsx(j, {
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
                          children: n.filter(A => A.status === 'Đã ghi nhận')
                            .length,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
            e.jsx(u, {
              children: e.jsx(j, {
                className: 'p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(U, { className: 'h-5 w-5 text-yellow-500' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium',
                          children: 'Đang xử lý',
                        }),
                        e.jsx('p', {
                          className: 'text-2xl font-bold',
                          children: n.filter(A => A.status === 'Đang thực hiện')
                            .length,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
            e.jsx(u, {
              children: e.jsx(j, {
                className: 'p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(xe, { className: 'h-5 w-5 text-green-500' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium',
                          children: 'Hoàn thành',
                        }),
                        e.jsx('p', {
                          className: 'text-2xl font-bold',
                          children: n.filter(A => A.status === 'Hoàn thiện')
                            .length,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
            e.jsx(u, {
              children: e.jsx(j, {
                className: 'p-4',
                children: e.jsxs('div', {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(te, { className: 'h-5 w-5 text-blue-500' }),
                    e.jsxs('div', {
                      children: [
                        e.jsx('p', {
                          className: 'text-sm font-medium',
                          children: 'Tổng cộng',
                        }),
                        e.jsx('p', {
                          className: 'text-2xl font-bold',
                          children: n.length,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            }),
          ],
        }),
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsx(b, { children: 'Danh sách yêu cầu' }),
                e.jsxs(M, {
                  children: [
                    'Hiển thị ',
                    Ve.length,
                    ' / ',
                    n.length,
                    ' yêu cầu',
                  ],
                }),
              ],
            }),
            e.jsx(j, {
              children: t
                ? e.jsxs('div', {
                    className: 'text-center py-8',
                    children: [
                      e.jsx(U, {
                        className: 'h-8 w-8 animate-spin mx-auto mb-4',
                      }),
                      e.jsx('p', { children: 'Đang tải...' }),
                    ],
                  })
                : Ve.length === 0
                  ? e.jsxs('div', {
                      className: 'text-center py-8',
                      children: [
                        e.jsx(te, {
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
                      children: Ve.sort(
                        (A, K) =>
                          new Date(K.createdAt).getTime() -
                          new Date(A.createdAt).getTime()
                      ).map(A =>
                        e.jsx(
                          u,
                          {
                            className: 'hover:shadow-md transition-shadow',
                            children: e.jsx(j, {
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
                                          e.jsx(Ys, {
                                            className: 'h-4 w-4 text-gray-500',
                                          }),
                                          e.jsxs('span', {
                                            className: 'font-semibold',
                                            children: ['Phòng ', A.roomNumber],
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
                                          e.jsx(na, {
                                            className: 'h-4 w-4 text-gray-500',
                                          }),
                                          e.jsx('span', {
                                            className: 'text-sm text-gray-600',
                                            children: A.guestName,
                                          }),
                                          e.jsx(Js, {
                                            className:
                                              'h-4 w-4 text-gray-500 ml-4',
                                          }),
                                          e.jsx('span', {
                                            className: 'text-sm text-gray-600',
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
                                          className: V('text-xs', _a(A.status)),
                                          children: [
                                            Qa(A.status),
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
                                      e.jsxs(g, {
                                        variant: 'outline',
                                        size: 'sm',
                                        onClick: () => Rs(A),
                                        children: [
                                          e.jsx(ze, {
                                            className: 'h-4 w-4 mr-2',
                                          }),
                                          'Chi tiết',
                                        ],
                                      }),
                                      e.jsxs(g, {
                                        variant: 'outline',
                                        size: 'sm',
                                        onClick: () => {
                                          (i(A), ys());
                                        },
                                        children: [
                                          e.jsx(ds, {
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
              e.jsx(mn, {
                request: l,
                isOpen: d,
                onClose: Es,
                onStatusChange: A => ke(l.id, A),
                onOpenMessage: ys,
              }),
              e.jsx(un, {
                request: l,
                messages: c,
                isOpen: m,
                onClose: bs,
                onSendMessage: Ms,
                loading: S,
              }),
            ],
          }),
      ],
    });
  },
  Fe = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'],
  ks = ({
    title: s,
    value: n,
    change: r,
    changeType: t,
    icon: a,
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
      d = () => {
        switch (t) {
          case 'positive':
            return e.jsx(oe, { className: 'h-3 w-3' });
          case 'negative':
            return e.jsx(xt, { className: 'h-3 w-3' });
          default:
            return e.jsx(oe, { className: 'h-3 w-3' });
        }
      };
    return e.jsx(u, {
      children: e.jsx(j, {
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
                e.jsx('p', { className: 'text-2xl font-bold', children: n }),
                r &&
                  e.jsxs('div', {
                    className: V('flex items-center gap-1 text-sm mt-1', i()),
                    children: [d(), e.jsx('span', { children: r })],
                  }),
                l &&
                  e.jsx('p', {
                    className: 'text-xs text-gray-500 mt-1',
                    children: l,
                  }),
              ],
            }),
            e.jsx(a, { className: 'h-8 w-8 text-gray-400' }),
          ],
        }),
      }),
    });
  },
  zs = ({ active: s, payload: n, label: r }) =>
    s && n && n.length
      ? e.jsxs('div', {
          className: 'bg-white p-2 border rounded shadow',
          children: [
            e.jsx('p', { className: 'font-medium', children: r }),
            n.map((t, a) =>
              e.jsx(
                'p',
                {
                  style: { color: t.color },
                  children: `${t.dataKey}: ${t.value}`,
                },
                a
              )
            ),
          ],
        })
      : null,
  nl = () => {
    const { user: s } = Se(),
      [n, r] = o.useState(null),
      [t, a] = o.useState(!0),
      [l, i] = o.useState('30d'),
      [d, x] = o.useState('all'),
      m = {
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
          (a(!0),
            setTimeout(() => {
              (r(m), a(!1));
            }, 1e3));
        } catch (c) {
          (q.error('Failed to fetch analytics:', 'Component', c), a(!1));
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
              e.jsx(U, { className: 'h-8 w-8 animate-spin text-blue-600' }),
              e.jsx('span', {
                className: 'ml-2',
                children: 'Đang tải analytics...',
              }),
            ],
          })
        : n
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
                        e.jsxs(W, {
                          value: l,
                          onValueChange: i,
                          children: [
                            e.jsx(X, {
                              className: 'w-32',
                              children: e.jsx(Y, {}),
                            }),
                            e.jsxs(J, {
                              children: [
                                e.jsx(N, { value: '7d', children: '7 ngày' }),
                                e.jsx(N, { value: '30d', children: '30 ngày' }),
                                e.jsx(N, { value: '90d', children: '90 ngày' }),
                                e.jsx(N, { value: '365d', children: '1 năm' }),
                              ],
                            }),
                          ],
                        }),
                        e.jsxs(g, {
                          variant: 'outline',
                          onClick: w,
                          children: [
                            e.jsx(U, { className: 'h-4 w-4 mr-2' }),
                            'Làm mới',
                          ],
                        }),
                        e.jsxs(g, {
                          variant: 'outline',
                          children: [
                            e.jsx(We, { className: 'h-4 w-4 mr-2' }),
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
                    e.jsx(ks, {
                      title: 'Tổng cuộc gọi',
                      value: n.overview.totalCalls.toLocaleString(),
                      change: `+${n.overview.growthRate}%`,
                      changeType: 'positive',
                      icon: be,
                      description: '30 ngày qua',
                    }),
                    e.jsx(ks, {
                      title: 'Thời gian TB',
                      value: n.overview.averageCallDuration,
                      change: '+12 giây',
                      changeType: 'positive',
                      icon: ye,
                      description: 'So với tháng trước',
                    }),
                    e.jsx(ks, {
                      title: 'Tỷ lệ thành công',
                      value: `${n.overview.successRate}%`,
                      change: '+2.1%',
                      changeType: 'positive',
                      icon: Ie,
                      description: 'Cuộc gọi hoàn thành',
                    }),
                    e.jsx(ks, {
                      title: 'Tháng này',
                      value: n.overview.callsThisMonth.toLocaleString(),
                      change: '+23 hôm nay',
                      changeType: 'positive',
                      icon: oe,
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
                        e.jsx(H, { value: 'overview', children: 'Tổng quan' }),
                        e.jsx(H, { value: 'services', children: 'Dịch vụ' }),
                        e.jsx(H, { value: 'activity', children: 'Hoạt động' }),
                        e.jsx(H, { value: 'languages', children: 'Ngôn ngữ' }),
                      ],
                    }),
                    e.jsx(z, {
                      value: 'overview',
                      className: 'space-y-4',
                      children: e.jsxs('div', {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
                        children: [
                          e.jsxs(u, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, {
                                    children: 'Xu hướng cuộc gọi theo ngày',
                                  }),
                                  e.jsx(M, { children: '7 ngày gần đây' }),
                                ],
                              }),
                              e.jsx(j, {
                                children: e.jsx(Ae, {
                                  width: '100%',
                                  height: 300,
                                  children: e.jsxs(At, {
                                    data: n.dailyTrends,
                                    children: [
                                      e.jsx(as, { strokeDasharray: '3 3' }),
                                      e.jsx(ts, { dataKey: 'date' }),
                                      e.jsx(ns, {}),
                                      e.jsx(De, { content: e.jsx(zs, {}) }),
                                      e.jsx(Dt, {
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
                          e.jsxs(u, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Mức độ hài lòng' }),
                                  e.jsx(M, {
                                    children: 'Điểm trung bình theo ngày',
                                  }),
                                ],
                              }),
                              e.jsx(j, {
                                children: e.jsx(Ae, {
                                  width: '100%',
                                  height: 300,
                                  children: e.jsxs(ra, {
                                    data: n.dailyTrends,
                                    children: [
                                      e.jsx(as, { strokeDasharray: '3 3' }),
                                      e.jsx(ts, { dataKey: 'date' }),
                                      e.jsx(ns, { domain: [4, 5] }),
                                      e.jsx(De, { content: e.jsx(zs, {}) }),
                                      e.jsx(us, {
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
                    e.jsx(z, {
                      value: 'services',
                      className: 'space-y-4',
                      children: e.jsxs('div', {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
                        children: [
                          e.jsxs(u, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Phân bố dịch vụ' }),
                                  e.jsx(M, {
                                    children: 'Theo số lượng cuộc gọi',
                                  }),
                                ],
                              }),
                              e.jsx(j, {
                                children: e.jsx(Ae, {
                                  width: '100%',
                                  height: 300,
                                  children: e.jsxs(Vs, {
                                    children: [
                                      e.jsx(Gs, {
                                        data: n.serviceDistribution,
                                        cx: '50%',
                                        cy: '50%',
                                        labelLine: !1,
                                        label: ({ name: c, percentage: p }) =>
                                          `${c} (${p}%)`,
                                        outerRadius: 80,
                                        fill: '#8884d8',
                                        dataKey: 'calls',
                                        children: n.serviceDistribution.map(
                                          (c, p) =>
                                            e.jsx(
                                              Zs,
                                              { fill: Fe[p % Fe.length] },
                                              `cell-${p}`
                                            )
                                        ),
                                      }),
                                      e.jsx(De, {}),
                                    ],
                                  }),
                                }),
                              }),
                            ],
                          }),
                          e.jsxs(u, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Top dịch vụ' }),
                                  e.jsx(M, {
                                    children: 'Xếp hạng theo lượng sử dụng',
                                  }),
                                ],
                              }),
                              e.jsx(j, {
                                children: e.jsx('div', {
                                  className: 'space-y-3',
                                  children: n.serviceDistribution.map((c, p) =>
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
                                                    Fe[p % Fe.length],
                                                },
                                              }),
                                              e.jsx('span', {
                                                className: 'font-medium',
                                                children: c.service,
                                              }),
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className: 'text-right',
                                            children: [
                                              e.jsxs('div', {
                                                className: 'font-semibold',
                                                children: [
                                                  c.calls,
                                                  ' cuộc gọi',
                                                ],
                                              }),
                                              e.jsxs('div', {
                                                className:
                                                  'text-sm text-gray-500',
                                                children: [c.percentage, '%'],
                                              }),
                                            ],
                                          }),
                                        ],
                                      },
                                      c.service
                                    )
                                  ),
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    e.jsx(z, {
                      value: 'activity',
                      className: 'space-y-4',
                      children: e.jsxs(u, {
                        children: [
                          e.jsxs(y, {
                            children: [
                              e.jsx(b, { children: 'Hoạt động theo giờ' }),
                              e.jsx(M, {
                                children: 'Phân bố cuộc gọi trong 24h',
                              }),
                            ],
                          }),
                          e.jsx(j, {
                            children: e.jsx(Ae, {
                              width: '100%',
                              height: 400,
                              children: e.jsxs(Ka, {
                                data: n.hourlyActivity,
                                children: [
                                  e.jsx(as, { strokeDasharray: '3 3' }),
                                  e.jsx(ts, { dataKey: 'hour' }),
                                  e.jsx(ns, {}),
                                  e.jsx(De, { content: e.jsx(zs, {}) }),
                                  e.jsx($a, {
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
                    e.jsx(z, {
                      value: 'languages',
                      className: 'space-y-4',
                      children: e.jsxs('div', {
                        className: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
                        children: [
                          e.jsxs(u, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Phân bố ngôn ngữ' }),
                                  e.jsx(M, {
                                    children: 'Tỷ lệ sử dụng các ngôn ngữ',
                                  }),
                                ],
                              }),
                              e.jsx(j, {
                                children: e.jsx(Ae, {
                                  width: '100%',
                                  height: 300,
                                  children: e.jsxs(Vs, {
                                    children: [
                                      e.jsx(Gs, {
                                        data: n.languageDistribution,
                                        cx: '50%',
                                        cy: '50%',
                                        labelLine: !1,
                                        label: ({ name: c, percentage: p }) =>
                                          `${c} (${p}%)`,
                                        outerRadius: 80,
                                        fill: '#8884d8',
                                        dataKey: 'calls',
                                        children: n.languageDistribution.map(
                                          (c, p) =>
                                            e.jsx(
                                              Zs,
                                              { fill: Fe[p % Fe.length] },
                                              `cell-${p}`
                                            )
                                        ),
                                      }),
                                      e.jsx(De, {}),
                                    ],
                                  }),
                                }),
                              }),
                            ],
                          }),
                          e.jsxs(u, {
                            children: [
                              e.jsxs(y, {
                                children: [
                                  e.jsx(b, { children: 'Thống kê ngôn ngữ' }),
                                  e.jsx(M, { children: 'Chi tiết sử dụng' }),
                                ],
                              }),
                              e.jsx(j, {
                                children: e.jsx('div', {
                                  className: 'space-y-4',
                                  children: n.languageDistribution.map((c, p) =>
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
                                                children: c.language,
                                              }),
                                              e.jsxs('span', {
                                                className:
                                                  'text-sm text-gray-500',
                                                children: [
                                                  c.calls,
                                                  ' cuộc gọi (',
                                                  c.percentage,
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
                                                width: `${c.percentage}%`,
                                                backgroundColor:
                                                  Fe[p % Fe.length],
                                              },
                                            }),
                                          }),
                                        ],
                                      },
                                      c.language
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
                    e.jsxs(u, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Ngôn ngữ phổ biến' }),
                        }),
                        e.jsx(j, {
                          children: e.jsx('div', {
                            className: 'flex flex-wrap gap-2',
                            children: n.overview.topLanguages.map((c, p) =>
                              e.jsx(R, { variant: 'secondary', children: c }, c)
                            ),
                          }),
                        }),
                      ],
                    }),
                    e.jsxs(u, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Giờ cao điểm' }),
                        }),
                        e.jsx(j, {
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
                    e.jsxs(u, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Xu hướng' }),
                        }),
                        e.jsx(j, {
                          children: e.jsxs('div', {
                            className: 'space-y-2',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  e.jsx(oe, {
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
                                  e.jsx(oe, {
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
                                  e.jsx(oe, {
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
  Ls = {
    'hotel-manager': {
      label: 'Quản lý khách sạn',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: e.jsx(ce, { className: 'h-3 w-3' }),
      description: 'Quyền truy cập đầy đủ',
    },
    'front-desk': {
      label: 'Lễ tân',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: e.jsx(pe, { className: 'h-3 w-3' }),
      description: 'Quản lý yêu cầu khách hàng',
    },
    'it-manager': {
      label: 'Quản lý IT',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: e.jsx(Le, { className: 'h-3 w-3' }),
      description: 'Quản lý hệ thống kỹ thuật',
    },
  },
  ja = ({
    isOpen: s,
    onClose: n,
    onSubmit: r,
    staff: t = null,
    loading: a = !1,
  }) => {
    const l = !!t,
      [i, d] = o.useState({
        username: t?.username || '',
        email: t?.email || '',
        displayName: t?.displayName || '',
        role: t?.role || 'front-desk',
        password: '',
        confirmPassword: '',
        isActive: t?.isActive ?? !0,
      }),
      [x, m] = o.useState({}),
      [w, c] = o.useState(!1);
    o.useEffect(() => {
      s &&
        (d({
          username: t?.username || '',
          email: t?.email || '',
          displayName: t?.displayName || '',
          role: t?.role || 'front-desk',
          password: '',
          confirmPassword: '',
          isActive: t?.isActive ?? !0,
        }),
        m({}));
    }, [s, t]);
    const p = () => {
        const T = {};
        return (
          i.username.trim()
            ? i.username.length < 3 &&
              (T.username = 'Tên đăng nhập phải có ít nhất 3 ký tự')
            : (T.username = 'Tên đăng nhập là bắt buộc'),
          i.email.trim()
            ? /\S+@\S+\.\S+/.test(i.email) || (T.email = 'Email không hợp lệ')
            : (T.email = 'Email là bắt buộc'),
          i.displayName.trim() || (T.displayName = 'Tên hiển thị là bắt buộc'),
          l ||
            (i.password
              ? i.password.length < 6 &&
                (T.password = 'Mật khẩu phải có ít nhất 6 ký tự')
              : (T.password = 'Mật khẩu là bắt buộc'),
            i.password !== i.confirmPassword &&
              (T.confirmPassword = 'Mật khẩu xác nhận không khớp')),
          m(T),
          Object.keys(T).length === 0
        );
      },
      S = T => {
        (T.preventDefault(), p() && r(i));
      };
    return e.jsx(Be, {
      open: s,
      onOpenChange: n,
      children: e.jsxs(Ue, {
        className: 'max-w-md',
        children: [
          e.jsxs(Ke, {
            children: [
              e.jsx($e, {
                children: l ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới',
              }),
              e.jsx(Xe, {
                children: l
                  ? 'Cập nhật thông tin nhân viên'
                  : 'Tạo tài khoản nhân viên mới',
              }),
            ],
          }),
          e.jsxs('form', {
            onSubmit: S,
            className: 'space-y-4',
            children: [
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'username', children: 'Tên đăng nhập' }),
                  e.jsx(C, {
                    id: 'username',
                    value: i.username,
                    onChange: T => d(D => ({ ...D, username: T.target.value })),
                    className: x.username ? 'border-red-500' : '',
                    disabled: l,
                  }),
                  x.username &&
                    e.jsx('p', {
                      className: 'text-red-500 text-sm mt-1',
                      children: x.username,
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
                    onChange: T => d(D => ({ ...D, email: T.target.value })),
                    className: x.email ? 'border-red-500' : '',
                  }),
                  x.email &&
                    e.jsx('p', {
                      className: 'text-red-500 text-sm mt-1',
                      children: x.email,
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
                    onChange: T =>
                      d(D => ({ ...D, displayName: T.target.value })),
                    className: x.displayName ? 'border-red-500' : '',
                  }),
                  x.displayName &&
                    e.jsx('p', {
                      className: 'text-red-500 text-sm mt-1',
                      children: x.displayName,
                    }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'role', children: 'Vai trò' }),
                  e.jsxs(W, {
                    value: i.role,
                    onValueChange: T => d(D => ({ ...D, role: T })),
                    children: [
                      e.jsx(X, { children: e.jsx(Y, {}) }),
                      e.jsx(J, {
                        children: Object.entries(Ls).map(([T, D]) =>
                          e.jsx(
                            N,
                            {
                              value: T,
                              children: e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  D.icon,
                                  e.jsx('span', { children: D.label }),
                                ],
                              }),
                            },
                            T
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
                              onChange: T =>
                                d(D => ({ ...D, password: T.target.value })),
                              className: x.password ? 'border-red-500' : '',
                            }),
                            e.jsx(g, {
                              type: 'button',
                              variant: 'ghost',
                              size: 'sm',
                              className:
                                'absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent',
                              onClick: () => c(!w),
                              children: w
                                ? e.jsx(Ia, { className: 'h-4 w-4' })
                                : e.jsx(ze, { className: 'h-4 w-4' }),
                            }),
                          ],
                        }),
                        x.password &&
                          e.jsx('p', {
                            className: 'text-red-500 text-sm mt-1',
                            children: x.password,
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
                          onChange: T =>
                            d(D => ({ ...D, confirmPassword: T.target.value })),
                          className: x.confirmPassword ? 'border-red-500' : '',
                        }),
                        x.confirmPassword &&
                          e.jsx('p', {
                            className: 'text-red-500 text-sm mt-1',
                            children: x.confirmPassword,
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
                    onChange: T =>
                      d(D => ({ ...D, isActive: T.target.checked })),
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
                  e.jsx(g, {
                    type: 'button',
                    variant: 'outline',
                    onClick: n,
                    children: 'Hủy',
                  }),
                  e.jsxs(g, {
                    type: 'submit',
                    disabled: a,
                    children: [
                      a
                        ? e.jsx(U, { className: 'h-4 w-4 mr-2 animate-spin' })
                        : e.jsx(gs, { className: 'h-4 w-4 mr-2' }),
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
  jn = ({ staff: s, isOpen: n, onClose: r }) => {
    if (!s) return null;
    const t = Ls[s.role];
    return e.jsx(Be, {
      open: n,
      onOpenChange: r,
      children: e.jsxs(Ue, {
        className: 'max-w-lg',
        children: [
          e.jsxs(Ke, {
            children: [
              e.jsxs($e, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(ce, { className: 'h-5 w-5' }),
                  'Quyền hạn của ',
                  s.displayName,
                ],
              }),
              e.jsx(Xe, { children: 'Chi tiết quyền truy cập và vai trò' }),
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
                    className: V('mt-1', t.color),
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
                      children: s.permissions.map(a =>
                        e.jsxs(
                          'div',
                          {
                            className: 'flex items-center gap-2 text-sm',
                            children: [
                              e.jsx(Da, { className: 'h-3 w-3 text-gray-400' }),
                              e.jsx('span', {
                                className: 'font-mono text-xs',
                                children: a,
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
              e.jsx('div', {
                className: 'flex justify-end',
                children: e.jsx(g, { onClick: r, children: 'Đóng' }),
              }),
            ],
          }),
        ],
      }),
    });
  },
  ll = () => {
    const { user: s } = Se(),
      [n, r] = o.useState([]),
      [t, a] = o.useState(!0),
      [l, i] = o.useState(''),
      [d, x] = o.useState('all'),
      [m, w] = o.useState('all'),
      [c, p] = o.useState(!1),
      [S, T] = o.useState(!1),
      [D, se] = o.useState(!1),
      [ae, ne] = o.useState(null),
      [le, k] = o.useState(!1),
      ee = [
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
      L = async () => {
        try {
          (a(!0),
            setTimeout(() => {
              (r(ee), a(!1));
            }, 1e3));
        } catch (I) {
          (q.error('Failed to fetch staff:', 'Component', I), a(!1));
        }
      },
      Q = async I => {
        try {
          if ((k(!0), await new Promise(v => setTimeout(v, 1e3)), ae))
            (r(v =>
              v.map(O =>
                O.id === ae.id
                  ? { ...O, ...I, updatedAt: new Date().toISOString() }
                  : O
              )
            ),
              T(!1));
          else {
            const v = {
              id: Date.now().toString(),
              ...I,
              permissions: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            (r(O => [...O, v]), p(!1));
          }
          ne(null);
        } catch (v) {
          q.error('Failed to save staff:', 'Component', v);
        } finally {
          k(!1);
        }
      },
      G = async I => {
        try {
          (await new Promise(v => setTimeout(v, 500)),
            r(v => v.filter(O => O.id !== I)));
        } catch (v) {
          q.error('Failed to delete staff:', 'Component', v);
        }
      },
      he = async I => {
        try {
          r(v =>
            v.map(O =>
              O.id === I
                ? {
                    ...O,
                    isActive: !O.isActive,
                    updatedAt: new Date().toISOString(),
                  }
                : O
            )
          );
        } catch (v) {
          q.error('Failed to toggle staff status:', 'Component', v);
        }
      },
      re = n.filter(I => {
        const v =
            I.displayName.toLowerCase().includes(l.toLowerCase()) ||
            I.username.toLowerCase().includes(l.toLowerCase()) ||
            I.email.toLowerCase().includes(l.toLowerCase()),
          O = d === 'all' || I.role === d,
          Z =
            m === 'all' ||
            (m === 'active' && I.isActive) ||
            (m === 'inactive' && !I.isActive);
        return v && O && Z;
      });
    return (
      o.useEffect(() => {
        L();
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
                  e.jsxs(g, {
                    variant: 'outline',
                    onClick: L,
                    disabled: t,
                    children: [
                      e.jsx(U, {
                        className: V('h-4 w-4 mr-2', t && 'animate-spin'),
                      }),
                      'Làm mới',
                    ],
                  }),
                  e.jsxs(g, {
                    onClick: () => p(!0),
                    children: [
                      e.jsx(gs, { className: 'h-4 w-4 mr-2' }),
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
              e.jsx(u, {
                children: e.jsx(j, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(pe, { className: 'h-5 w-5 text-blue-500' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm font-medium',
                            children: 'Tổng nhân viên',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: n.length,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              e.jsx(u, {
                children: e.jsx(j, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(qs, { className: 'h-5 w-5 text-green-500' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm font-medium',
                            children: 'Đang hoạt động',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: n.filter(I => I.isActive).length,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              e.jsx(u, {
                children: e.jsx(j, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ce, { className: 'h-5 w-5 text-blue-500' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm font-medium',
                            children: 'Quản lý',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: n.filter(I => I.role === 'hotel-manager')
                              .length,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              }),
              e.jsx(u, {
                children: e.jsx(j, {
                  className: 'p-4',
                  children: e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(pe, { className: 'h-5 w-5 text-green-500' }),
                      e.jsxs('div', {
                        children: [
                          e.jsx('p', {
                            className: 'text-sm font-medium',
                            children: 'Lễ tân',
                          }),
                          e.jsx('p', {
                            className: 'text-2xl font-bold',
                            children: n.filter(I => I.role === 'front-desk')
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
          e.jsxs(u, {
            children: [
              e.jsx(y, {
                children: e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [e.jsx(ea, { className: 'h-5 w-5' }), 'Bộ lọc'],
                }),
              }),
              e.jsx(j, {
                children: e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-3 gap-4',
                  children: [
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, { children: 'Tìm kiếm' }),
                        e.jsxs('div', {
                          className: 'relative',
                          children: [
                            e.jsx(Re, {
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
                        e.jsxs(W, {
                          value: d,
                          onValueChange: x,
                          children: [
                            e.jsx(X, { children: e.jsx(Y, {}) }),
                            e.jsxs(J, {
                              children: [
                                e.jsx(N, {
                                  value: 'all',
                                  children: 'Tất cả vai trò',
                                }),
                                Object.entries(Ls).map(([I, v]) =>
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
                        e.jsxs(W, {
                          value: m,
                          onValueChange: w,
                          children: [
                            e.jsx(X, { children: e.jsx(Y, {}) }),
                            e.jsxs(J, {
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
          e.jsxs(u, {
            children: [
              e.jsxs(y, {
                children: [
                  e.jsx(b, { children: 'Danh sách nhân viên' }),
                  e.jsxs(M, {
                    children: [
                      'Hiển thị ',
                      re.length,
                      ' / ',
                      n.length,
                      ' nhân viên',
                    ],
                  }),
                ],
              }),
              e.jsx(j, {
                children: t
                  ? e.jsxs('div', {
                      className: 'text-center py-8',
                      children: [
                        e.jsx(U, {
                          className: 'h-8 w-8 animate-spin mx-auto mb-4',
                        }),
                        e.jsx('p', { children: 'Đang tải...' }),
                      ],
                    })
                  : e.jsx('div', {
                      className: 'overflow-x-auto',
                      children: e.jsxs(Ee, {
                        children: [
                          e.jsx(qe, {
                            children: e.jsxs(de, {
                              children: [
                                e.jsx(F, { children: 'Nhân viên' }),
                                e.jsx(F, { children: 'Vai trò' }),
                                e.jsx(F, { children: 'Trạng thái' }),
                                e.jsx(F, { children: 'Lần đăng nhập cuối' }),
                                e.jsx(F, { children: 'Thao tác' }),
                              ],
                            }),
                          }),
                          e.jsx(Oe, {
                            children: re.map(I => {
                              const v = Ls[I.role];
                              return e.jsxs(
                                de,
                                {
                                  children: [
                                    e.jsx(P, {
                                      children: e.jsxs('div', {
                                        className: 'flex items-center gap-3',
                                        children: [
                                          e.jsx('div', {
                                            className:
                                              'h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center',
                                            children: e.jsx(pe, {
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
                                                e.jsx(qs, {
                                                  className: 'h-3 w-3 mr-1',
                                                }),
                                                'Hoạt động',
                                              ],
                                            })
                                          : e.jsxs(e.Fragment, {
                                              children: [
                                                e.jsx(ps, {
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
                                          e.jsx(g, {
                                            variant: 'ghost',
                                            size: 'sm',
                                            onClick: () => {
                                              (ne(I), se(!0));
                                            },
                                            children: e.jsx(ce, {
                                              className: 'h-4 w-4',
                                            }),
                                          }),
                                          e.jsx(g, {
                                            variant: 'ghost',
                                            size: 'sm',
                                            onClick: () => {
                                              (ne(I), T(!0));
                                            },
                                            children: e.jsx(Qe, {
                                              className: 'h-4 w-4',
                                            }),
                                          }),
                                          e.jsx(g, {
                                            variant: 'ghost',
                                            size: 'sm',
                                            onClick: () => he(I.id),
                                            children: I.isActive
                                              ? e.jsx(ps, {
                                                  className: 'h-4 w-4',
                                                })
                                              : e.jsx(qs, {
                                                  className: 'h-4 w-4',
                                                }),
                                          }),
                                          e.jsxs(Pa, {
                                            children: [
                                              e.jsx(Ma, {
                                                asChild: !0,
                                                children: e.jsx(g, {
                                                  variant: 'ghost',
                                                  size: 'sm',
                                                  children: e.jsx(_e, {
                                                    className: 'h-4 w-4',
                                                  }),
                                                }),
                                              }),
                                              e.jsxs(Ra, {
                                                children: [
                                                  e.jsxs(Ea, {
                                                    children: [
                                                      e.jsx(qa, {
                                                        children:
                                                          'Xác nhận xóa',
                                                      }),
                                                      e.jsxs(Oa, {
                                                        children: [
                                                          'Bạn có chắc muốn xóa nhân viên "',
                                                          I.displayName,
                                                          '"? Hành động này không thể hoàn tác.',
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                  e.jsxs(Ha, {
                                                    children: [
                                                      e.jsx(za, {
                                                        children: 'Hủy',
                                                      }),
                                                      e.jsx(Ba, {
                                                        onClick: () => G(I.id),
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
          e.jsx(ja, {
            isOpen: c,
            onClose: () => p(!1),
            onSubmit: Q,
            loading: le,
          }),
          e.jsx(ja, {
            isOpen: S,
            onClose: () => {
              (T(!1), ne(null));
            },
            onSubmit: Q,
            staff: ae,
            loading: le,
          }),
          e.jsx(jn, {
            staff: ae,
            isOpen: D,
            onClose: () => {
              (se(!1), ne(null));
            },
          }),
        ],
      })
    );
  },
  ga = {
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
  pa = [
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
  va = [
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
  gn = [
    { time: '00:00', cpu: 35, memory: 40, disk: 15 },
    { time: '04:00', cpu: 28, memory: 35, disk: 15 },
    { time: '08:00', cpu: 45, memory: 50, disk: 18 },
    { time: '12:00', cpu: 65, memory: 60, disk: 22 },
    { time: '16:00', cpu: 55, memory: 58, disk: 20 },
    { time: '20:00', cpu: 42, memory: 45, disk: 17 },
    { time: '24:00', cpu: 35, memory: 40, disk: 15 },
  ],
  pn = ({ metrics: s }) => {
    const n = t =>
        t < 50 ? 'text-green-600' : t < 80 ? 'text-yellow-600' : 'text-red-600',
      r = t => {
        switch (t) {
          case 'running':
          case 'connected':
          case 'healthy':
            return e.jsx(xe, { className: 'h-4 w-4 text-green-500' });
          case 'error':
            return e.jsx(fs, { className: 'h-4 w-4 text-red-500' });
          case 'stopped':
            return e.jsx(is, { className: 'h-4 w-4 text-yellow-500' });
          default:
            return e.jsx(te, { className: 'h-4 w-4 text-gray-500' });
        }
      };
    return e.jsxs('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      children: [
        e.jsx(u, {
          children: e.jsxs(j, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ut, { className: 'h-5 w-5 text-blue-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'CPU',
                      }),
                    ],
                  }),
                  e.jsxs('span', {
                    className: V('text-lg font-bold', n(s.cpu.usage)),
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
        e.jsx(u, {
          children: e.jsxs(j, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ta, { className: 'h-5 w-5 text-green-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'Memory',
                      }),
                    ],
                  }),
                  e.jsxs('span', {
                    className: V('text-lg font-bold', n(s.memory.usage)),
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
        e.jsx(u, {
          children: e.jsxs(j, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(vs, { className: 'h-5 w-5 text-purple-500' }),
                      e.jsx('span', {
                        className: 'font-medium',
                        children: 'Disk',
                      }),
                    ],
                  }),
                  e.jsxs('span', {
                    className: V('text-lg font-bold', n(s.disk.usage)),
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
        e.jsx(u, {
          children: e.jsxs(j, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(Xs, { className: 'h-5 w-5 text-blue-500' }),
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
        e.jsx(u, {
          children: e.jsxs(j, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(ls, { className: 'h-5 w-5 text-green-500' }),
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
        e.jsx(u, {
          children: e.jsxs(j, {
            className: 'p-4',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between mb-2',
                children: [
                  e.jsxs('div', {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(aa, { className: 'h-5 w-5 text-orange-500' }),
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
                      'Running:',
                      ' ',
                      s.services.filter(t => t.status === 'running').length,
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      'Stopped:',
                      ' ',
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
  vn = ({ alerts: s }) => {
    const n = a => {
        switch (a) {
          case 'error':
            return e.jsx(fs, { className: 'h-4 w-4 text-red-500' });
          case 'warning':
            return e.jsx(is, { className: 'h-4 w-4 text-yellow-500' });
          case 'info':
            return e.jsx(Ks, { className: 'h-4 w-4 text-blue-500' });
          default:
            return e.jsx(te, { className: 'h-4 w-4 text-gray-500' });
        }
      },
      r = a => {
        switch (a) {
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
      t = s.filter(a => !a.resolved);
    return e.jsx('div', {
      className: 'space-y-3',
      children:
        t.length === 0
          ? e.jsxs('div', {
              className: 'text-center py-8 text-gray-500',
              children: [
                e.jsx(xe, {
                  className: 'h-12 w-12 mx-auto mb-4 text-green-500',
                }),
                e.jsx('p', { children: 'Không có cảnh báo nào' }),
              ],
            })
          : t.map(a =>
              e.jsx(
                'div',
                {
                  className: V('border rounded-lg p-4', r(a.type)),
                  children: e.jsxs('div', {
                    className: 'flex items-start gap-3',
                    children: [
                      n(a.type),
                      e.jsxs('div', {
                        className: 'flex-1',
                        children: [
                          e.jsxs('div', {
                            className: 'flex items-center justify-between mb-1',
                            children: [
                              e.jsx('h4', {
                                className: 'font-medium',
                                children: a.title,
                              }),
                              e.jsx('span', {
                                className: 'text-sm text-gray-500',
                                children: new Date(
                                  a.timestamp
                                ).toLocaleTimeString(),
                              }),
                            ],
                          }),
                          e.jsx('p', {
                            className: 'text-sm text-gray-600',
                            children: a.message,
                          }),
                        ],
                      }),
                    ],
                  }),
                },
                a.id
              )
            ),
    });
  },
  Nn = ({ services: s }) => {
    const n = r => {
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
                    e.jsx('td', { className: 'p-3', children: n(r.status) }),
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
                          e.jsx(g, {
                            variant: 'ghost',
                            size: 'sm',
                            children: e.jsx(ze, { className: 'h-4 w-4' }),
                          }),
                          e.jsx(g, {
                            variant: 'ghost',
                            size: 'sm',
                            children: e.jsx(Le, { className: 'h-4 w-4' }),
                          }),
                          e.jsx(g, {
                            variant: 'ghost',
                            size: 'sm',
                            children: e.jsx(U, { className: 'h-4 w-4' }),
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
  fn = ({ logs: s }) => {
    const [n, r] = o.useState(null),
      t = a => {
        switch (a) {
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
      children: s.map(a =>
        e.jsx(
          'div',
          {
            className: 'border rounded-lg p-3 hover:bg-gray-50',
            children: e.jsxs('div', {
              className: 'flex items-start gap-3',
              children: [
                e.jsx(R, {
                  variant: 'outline',
                  className: V('text-xs', t(a.level)),
                  children: a.level,
                }),
                e.jsxs('div', {
                  className: 'flex-1',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between mb-1',
                      children: [
                        e.jsx('span', {
                          className: 'font-medium text-sm',
                          children: a.service,
                        }),
                        e.jsx('span', {
                          className: 'text-xs text-gray-500',
                          children: new Date(a.timestamp).toLocaleString(),
                        }),
                      ],
                    }),
                    e.jsx('p', {
                      className: 'text-sm text-gray-700',
                      children: a.message,
                    }),
                    a.details &&
                      e.jsx('p', {
                        className: 'text-xs text-gray-500 mt-1 font-mono',
                        children: a.details,
                      }),
                  ],
                }),
              ],
            }),
          },
          a.id
        )
      ),
    });
  },
  il = () => {
    const { user: s } = Se(),
      [n, r] = o.useState(ga),
      [t, a] = o.useState(pa),
      [l, i] = o.useState(va),
      [d, x] = o.useState(!1),
      [m, w] = o.useState(!0),
      c = async () => {
        try {
          (x(!0),
            setTimeout(() => {
              (r(ga), a(pa), i(va), x(!1));
            }, 1e3));
        } catch (p) {
          (q.error('Failed to fetch metrics:', 'Component', p), x(!1));
        }
      };
    return (
      o.useEffect(() => {
        if ((c(), m)) {
          const p = setInterval(c, 3e4);
          return () => clearInterval(p);
        }
      }, [m]),
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
                  e.jsxs(g, {
                    variant: 'outline',
                    onClick: () => w(!m),
                    className: m ? 'bg-green-50' : '',
                    children: [
                      e.jsx(Ie, { className: 'h-4 w-4 mr-2' }),
                      m ? 'Auto ON' : 'Auto OFF',
                    ],
                  }),
                  e.jsxs(g, {
                    variant: 'outline',
                    onClick: c,
                    disabled: d,
                    children: [
                      e.jsx(U, {
                        className: V('h-4 w-4 mr-2', d && 'animate-spin'),
                      }),
                      'Làm mới',
                    ],
                  }),
                  e.jsxs(g, {
                    variant: 'outline',
                    children: [
                      e.jsx(We, { className: 'h-4 w-4 mr-2' }),
                      'Xuất báo cáo',
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsx(pn, { metrics: n }),
          e.jsxs(we, {
            defaultValue: 'performance',
            className: 'space-y-4',
            children: [
              e.jsxs(Ce, {
                className: 'grid w-full grid-cols-4',
                children: [
                  e.jsx(H, { value: 'performance', children: 'Hiệu suất' }),
                  e.jsx(H, { value: 'alerts', children: 'Cảnh báo' }),
                  e.jsx(H, { value: 'services', children: 'Dịch vụ' }),
                  e.jsx(H, { value: 'logs', children: 'Logs' }),
                ],
              }),
              e.jsx(z, {
                value: 'performance',
                className: 'space-y-4',
                children: e.jsxs(u, {
                  children: [
                    e.jsxs(y, {
                      children: [
                        e.jsx(b, { children: 'Hiệu suất hệ thống 24h' }),
                        e.jsx(M, { children: 'CPU, Memory và Disk usage' }),
                      ],
                    }),
                    e.jsx(j, {
                      children: e.jsx(Ae, {
                        width: '100%',
                        height: 300,
                        children: e.jsxs(ra, {
                          data: gn,
                          children: [
                            e.jsx(as, { strokeDasharray: '3 3' }),
                            e.jsx(ts, { dataKey: 'time' }),
                            e.jsx(ns, {}),
                            e.jsx(De, {}),
                            e.jsx(us, {
                              type: 'monotone',
                              dataKey: 'cpu',
                              stroke: '#8884d8',
                              strokeWidth: 2,
                            }),
                            e.jsx(us, {
                              type: 'monotone',
                              dataKey: 'memory',
                              stroke: '#82ca9d',
                              strokeWidth: 2,
                            }),
                            e.jsx(us, {
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
              e.jsx(z, {
                value: 'alerts',
                className: 'space-y-4',
                children: e.jsxs(u, {
                  children: [
                    e.jsxs(y, {
                      children: [
                        e.jsxs(b, {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx(js, { className: 'h-5 w-5' }),
                            'Cảnh báo hệ thống',
                          ],
                        }),
                        e.jsxs(M, {
                          children: [
                            t.filter(p => !p.resolved).length,
                            ' cảnh báo chưa xử lý',
                          ],
                        }),
                      ],
                    }),
                    e.jsx(j, { children: e.jsx(vn, { alerts: t }) }),
                  ],
                }),
              }),
              e.jsx(z, {
                value: 'services',
                className: 'space-y-4',
                children: e.jsxs(u, {
                  children: [
                    e.jsxs(y, {
                      children: [
                        e.jsx(b, { children: 'Dịch vụ hệ thống' }),
                        e.jsx(M, {
                          children: 'Trạng thái và hiệu suất các dịch vụ',
                        }),
                      ],
                    }),
                    e.jsx(j, { children: e.jsx(Nn, { services: n.services }) }),
                  ],
                }),
              }),
              e.jsx(z, {
                value: 'logs',
                className: 'space-y-4',
                children: e.jsxs(u, {
                  children: [
                    e.jsxs(y, {
                      children: [
                        e.jsxs(b, {
                          className: 'flex items-center gap-2',
                          children: [
                            e.jsx(mt, { className: 'h-5 w-5' }),
                            'System Logs',
                          ],
                        }),
                        e.jsx(M, { children: 'Logs hệ thống gần đây' }),
                      ],
                    }),
                    e.jsx(j, { children: e.jsx(fn, { logs: l }) }),
                  ],
                }),
              }),
            ],
          }),
        ],
      })
    );
  },
  rl = () => {
    const [s, n] = o.useState(!1),
      [r, t] = o.useState('idle'),
      [a, l] = o.useState({
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
      [i, d] = o.useState({
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
      [x, m] = o.useState({
        emailNotifications: !0,
        smsNotifications: !1,
        pushNotifications: !0,
        newRequestAlert: !0,
        systemAlerts: !0,
        dailyReports: !0,
      }),
      w = async () => {
        (n(!0), t('saving'));
        try {
          (await new Promise(c => setTimeout(c, 1e3)),
            t('success'),
            setTimeout(() => t('idle'), 2e3));
        } catch {
          (t('error'), setTimeout(() => t('idle'), 2e3));
        } finally {
          n(!1);
        }
      };
    return s
      ? e.jsxs('div', {
          className: 'flex items-center justify-center h-64',
          children: [
            e.jsx(U, { className: 'h-8 w-8 animate-spin text-blue-600' }),
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
                    e.jsxs(H, {
                      value: 'general',
                      className: 'flex items-center gap-2',
                      children: [e.jsx(Ds, { className: 'h-4 w-4' }), 'Chung'],
                    }),
                    e.jsxs(H, {
                      value: 'ai',
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(fe, { className: 'h-4 w-4' }),
                        'AI Assistant',
                      ],
                    }),
                    e.jsxs(H, {
                      value: 'notifications',
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(js, { className: 'h-4 w-4' }),
                        'Thông báo',
                      ],
                    }),
                    e.jsxs(H, {
                      value: 'security',
                      className: 'flex items-center gap-2',
                      children: [
                        e.jsx(ce, { className: 'h-4 w-4' }),
                        'Bảo mật',
                      ],
                    }),
                  ],
                }),
                e.jsx(z, {
                  value: 'general',
                  children: e.jsxs(u, {
                    children: [
                      e.jsxs(y, {
                        children: [
                          e.jsxs(b, {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(Ds, { className: 'h-5 w-5' }),
                              'Cài đặt chung',
                            ],
                          }),
                          e.jsx(M, {
                            children:
                              'Thông tin cơ bản về khách sạn và cấu hình hệ thống',
                          }),
                        ],
                      }),
                      e.jsxs(j, {
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
                                        value: a.hotelName,
                                        onChange: c =>
                                          l({
                                            ...a,
                                            hotelName: c.target.value,
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
                                        value: a.phone,
                                        onChange: c =>
                                          l({ ...a, phone: c.target.value }),
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
                                        value: a.email,
                                        onChange: c =>
                                          l({ ...a, email: c.target.value }),
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
                                        value: a.website,
                                        onChange: c =>
                                          l({ ...a, website: c.target.value }),
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
                                      e.jsx(ue, {
                                        id: 'description',
                                        value: a.description,
                                        onChange: c =>
                                          l({
                                            ...a,
                                            description: c.target.value,
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
                                      e.jsx(ue, {
                                        id: 'address',
                                        value: a.address,
                                        onChange: c =>
                                          l({ ...a, address: c.target.value }),
                                        placeholder: 'Địa chỉ đầy đủ',
                                        rows: 3,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsx(ws, {}),
                          e.jsxs('div', {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  r === 'success' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(xe, {
                                          className: 'h-4 w-4 text-green-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-green-600',
                                          children: 'Đã lưu thành công',
                                        }),
                                      ],
                                    }),
                                  r === 'error' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(te, {
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
                              e.jsx(g, {
                                onClick: w,
                                disabled: s,
                                children: s
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(U, {
                                          className:
                                            'h-4 w-4 mr-2 animate-spin',
                                        }),
                                        'Đang lưu...',
                                      ],
                                    })
                                  : e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(ge, {
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
                e.jsx(z, {
                  value: 'ai',
                  children: e.jsxs(u, {
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
                      e.jsxs(j, {
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
                              e.jsx(B, {
                                checked: i.enabled,
                                onCheckedChange: c => d({ ...i, enabled: c }),
                              }),
                            ],
                          }),
                          e.jsx(ws, {}),
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
                                        value: i.name,
                                        onChange: c =>
                                          d({ ...i, name: c.target.value }),
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
                                        value: i.responseDelay,
                                        onChange: c =>
                                          d({
                                            ...i,
                                            responseDelay: parseInt(
                                              c.target.value
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
                                        value: i.confidenceThreshold,
                                        onChange: c =>
                                          d({
                                            ...i,
                                            confidenceThreshold: parseFloat(
                                              c.target.value
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
                                        e.jsx(B, {
                                          id: 'enableSmallTalk',
                                          checked: i.enableSmallTalk,
                                          onCheckedChange: c =>
                                            d({ ...i, enableSmallTalk: c }),
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
                                        e.jsx(B, {
                                          id: 'enableTranscription',
                                          checked: i.enableTranscription,
                                          onCheckedChange: c =>
                                            d({ ...i, enableTranscription: c }),
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
                              e.jsx(ue, {
                                id: 'customInstructions',
                                value: i.customInstructions,
                                onChange: c =>
                                  d({
                                    ...i,
                                    customInstructions: c.target.value,
                                  }),
                                placeholder:
                                  'Hướng dẫn chi tiết cho AI về cách phục vụ khách hàng...',
                                rows: 4,
                              }),
                            ],
                          }),
                          e.jsx(ws, {}),
                          e.jsxs('div', {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  r === 'success' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(xe, {
                                          className: 'h-4 w-4 text-green-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-green-600',
                                          children: 'Đã lưu thành công',
                                        }),
                                      ],
                                    }),
                                  r === 'error' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(te, {
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
                              e.jsx(g, {
                                onClick: w,
                                disabled: s,
                                children: s
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(U, {
                                          className:
                                            'h-4 w-4 mr-2 animate-spin',
                                        }),
                                        'Đang lưu...',
                                      ],
                                    })
                                  : e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(ge, {
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
                e.jsx(z, {
                  value: 'notifications',
                  children: e.jsxs(u, {
                    children: [
                      e.jsxs(y, {
                        children: [
                          e.jsxs(b, {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(js, { className: 'h-5 w-5' }),
                              'Cài đặt thông báo',
                            ],
                          }),
                          e.jsx(M, {
                            children:
                              'Quản lý cách thức nhận thông báo và cảnh báo',
                          }),
                        ],
                      }),
                      e.jsxs(j, {
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
                                            e.jsx(B, {
                                              checked: x.emailNotifications,
                                              onCheckedChange: c =>
                                                m({
                                                  ...x,
                                                  emailNotifications: c,
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
                                            e.jsx(B, {
                                              checked: x.smsNotifications,
                                              onCheckedChange: c =>
                                                m({
                                                  ...x,
                                                  smsNotifications: c,
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
                                            e.jsx(B, {
                                              checked: x.pushNotifications,
                                              onCheckedChange: c =>
                                                m({
                                                  ...x,
                                                  pushNotifications: c,
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
                                            e.jsx(B, {
                                              checked: x.newRequestAlert,
                                              onCheckedChange: c =>
                                                m({ ...x, newRequestAlert: c }),
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
                                            e.jsx(B, {
                                              checked: x.systemAlerts,
                                              onCheckedChange: c =>
                                                m({ ...x, systemAlerts: c }),
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
                                            e.jsx(B, {
                                              checked: x.dailyReports,
                                              onCheckedChange: c =>
                                                m({ ...x, dailyReports: c }),
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
                          e.jsx(ws, {}),
                          e.jsxs('div', {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-center gap-2',
                                children: [
                                  r === 'success' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(xe, {
                                          className: 'h-4 w-4 text-green-500',
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm text-green-600',
                                          children: 'Đã lưu thành công',
                                        }),
                                      ],
                                    }),
                                  r === 'error' &&
                                    e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(te, {
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
                              e.jsx(g, {
                                onClick: w,
                                disabled: s,
                                children: s
                                  ? e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(U, {
                                          className:
                                            'h-4 w-4 mr-2 animate-spin',
                                        }),
                                        'Đang lưu...',
                                      ],
                                    })
                                  : e.jsxs(e.Fragment, {
                                      children: [
                                        e.jsx(ge, {
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
                e.jsx(z, {
                  value: 'security',
                  children: e.jsxs(u, {
                    children: [
                      e.jsxs(y, {
                        children: [
                          e.jsxs(b, {
                            className: 'flex items-center gap-2',
                            children: [
                              e.jsx(ce, { className: 'h-5 w-5' }),
                              'Cài đặt bảo mật',
                            ],
                          }),
                          e.jsx(M, {
                            children: 'Quản lý bảo mật tài khoản và hệ thống',
                          }),
                        ],
                      }),
                      e.jsx(j, {
                        children: e.jsxs('div', {
                          className: 'text-center py-12',
                          children: [
                            e.jsx(ce, {
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
  Na = [
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
  yn = [
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
  bn = [
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
  Wa = s => {
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
  Xa = s => {
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
  wn = s => {
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
  _s = s =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(s),
  As = s =>
    new Date(s).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
  Cn = ({ guest: s, isOpen: n, onClose: r, onUpdate: t }) => {
    const [a, l] = o.useState(!1),
      [i, d] = o.useState(s),
      [x, m] = o.useState(!1);
    o.useEffect(() => {
      d(s);
    }, [s]);
    const w = async () => {
      if (i) {
        m(!0);
        try {
          (await new Promise(c => setTimeout(c, 1e3)), t(i), l(!1));
        } catch (c) {
          q.error('Failed to update guest:', 'Component', c);
        } finally {
          m(!1);
        }
      }
    };
    return !s || !i
      ? null
      : e.jsx(Be, {
          open: n,
          onOpenChange: r,
          children: e.jsxs(Ue, {
            className: 'max-w-4xl max-h-[90vh] overflow-y-auto',
            children: [
              e.jsxs(Ke, {
                children: [
                  e.jsxs($e, {
                    className: 'flex items-center gap-2',
                    children: [
                      e.jsx(na, { className: 'h-5 w-5' }),
                      s.firstName,
                      ' ',
                      s.lastName,
                      e.jsx(R, {
                        className: V('ml-2', Wa(s.membershipTier)),
                        children: s.membershipTier.toUpperCase(),
                      }),
                      e.jsx(R, {
                        className: V('ml-1', Xa(s.status)),
                        children: s.status.toUpperCase(),
                      }),
                    ],
                  }),
                  e.jsx(Xe, {
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
                      e.jsx(H, { value: 'info', children: 'Thông tin' }),
                      e.jsx(H, {
                        value: 'bookings',
                        children: 'Lịch sử đặt phòng',
                      }),
                      e.jsx(H, { value: 'notes', children: 'Ghi chú' }),
                    ],
                  }),
                  e.jsxs(z, {
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
                          e.jsxs(g, {
                            variant: 'outline',
                            size: 'sm',
                            onClick: () => l(!a),
                            children: [
                              e.jsx(Qe, { className: 'h-4 w-4 mr-2' }),
                              a ? 'Hủy' : 'Chỉnh sửa',
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
                                    onChange: c =>
                                      d({ ...i, firstName: c.target.value }),
                                    disabled: !a,
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
                                    onChange: c =>
                                      d({ ...i, lastName: c.target.value }),
                                    disabled: !a,
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
                                    onChange: c =>
                                      d({ ...i, email: c.target.value }),
                                    disabled: !a,
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
                                    onChange: c =>
                                      d({ ...i, phone: c.target.value }),
                                    disabled: !a,
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
                                    onChange: c =>
                                      d({ ...i, nationality: c.target.value }),
                                    disabled: !a,
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
                                    onChange: c =>
                                      d({ ...i, dateOfBirth: c.target.value }),
                                    disabled: !a,
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
                                    onChange: c =>
                                      d({ ...i, idNumber: c.target.value }),
                                    disabled: !a,
                                  }),
                                ],
                              }),
                              e.jsxs('div', {
                                children: [
                                  e.jsx(h, {
                                    htmlFor: 'address',
                                    children: 'Địa chỉ',
                                  }),
                                  e.jsx(ue, {
                                    id: 'address',
                                    value: i.address,
                                    onChange: c =>
                                      d({ ...i, address: c.target.value }),
                                    disabled: !a,
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
                                    onChange: c =>
                                      d({ ...i, city: c.target.value }),
                                    disabled: !a,
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
                                    onChange: c =>
                                      d({ ...i, country: c.target.value }),
                                    disabled: !a,
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
                          e.jsx(ue, {
                            id: 'notes',
                            value: i.notes,
                            onChange: c => d({ ...i, notes: c.target.value }),
                            disabled: !a,
                            rows: 3,
                          }),
                        ],
                      }),
                      a &&
                        e.jsx('div', {
                          className: 'flex justify-end gap-2',
                          children: e.jsx(g, {
                            onClick: w,
                            disabled: x,
                            children: x
                              ? e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx(U, {
                                      className: 'h-4 w-4 mr-2 animate-spin',
                                    }),
                                    'Đang lưu...',
                                  ],
                                })
                              : e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx(ge, { className: 'h-4 w-4 mr-2' }),
                                    'Lưu thay đổi',
                                  ],
                                }),
                          }),
                        }),
                    ],
                  }),
                  e.jsxs(z, {
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
                                children: ['Chi tiêu: ', _s(s.totalSpent)],
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx('div', {
                        className: 'space-y-4',
                        children: yn
                          .filter(c => c.guestId === s.id)
                          .map(c =>
                            e.jsx(
                              u,
                              {
                                children: e.jsxs(j, {
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
                                                c.roomNumber,
                                              ],
                                            }),
                                            e.jsx(R, {
                                              variant: 'outline',
                                              children: c.roomType,
                                            }),
                                            e.jsx(R, {
                                              className: V(wn(c.status)),
                                              children: c.status,
                                            }),
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'text-sm text-muted-foreground',
                                          children: [
                                            As(c.checkIn),
                                            ' -',
                                            ' ',
                                            As(c.checkOut),
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
                                            c.guests,
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
                                            _s(c.totalAmount),
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
                                                [...Array(5)].map((p, S) =>
                                                  e.jsx(
                                                    ss,
                                                    {
                                                      className: V(
                                                        'h-3 w-3',
                                                        S < c.rating
                                                          ? 'fill-yellow-400 text-yellow-400'
                                                          : 'text-gray-300'
                                                      ),
                                                    },
                                                    S
                                                  )
                                                ),
                                                e.jsxs('span', {
                                                  className: 'ml-1',
                                                  children: [
                                                    '(',
                                                    c.rating,
                                                    '/5)',
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    c.review &&
                                      e.jsxs('div', {
                                        className:
                                          'mt-2 p-2 bg-gray-50 rounded text-sm',
                                        children: [
                                          e.jsx('span', {
                                            className: 'text-muted-foreground',
                                            children: 'Đánh giá:',
                                          }),
                                          ' ',
                                          c.review,
                                        ],
                                      }),
                                  ],
                                }),
                              },
                              c.id
                            )
                          ),
                      }),
                    ],
                  }),
                  e.jsxs(z, {
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
                          e.jsxs(g, {
                            size: 'sm',
                            children: [
                              e.jsx(Pe, { className: 'h-4 w-4 mr-2' }),
                              'Thêm ghi chú',
                            ],
                          }),
                        ],
                      }),
                      e.jsx('div', {
                        className: 'space-y-3',
                        children: bn
                          .filter(c => c.guestId === s.id)
                          .map(c =>
                            e.jsx(
                              u,
                              {
                                children: e.jsxs(j, {
                                  className: 'p-4',
                                  children: [
                                    e.jsxs('div', {
                                      className:
                                        'flex items-center justify-between mb-2',
                                      children: [
                                        e.jsx(R, {
                                          variant: 'outline',
                                          children: c.type,
                                        }),
                                        e.jsxs('div', {
                                          className:
                                            'text-sm text-muted-foreground',
                                          children: [
                                            c.staffMember,
                                            ' • ',
                                            As(c.createdAt),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsx('p', {
                                      className: 'text-sm',
                                      children: c.note,
                                    }),
                                  ],
                                }),
                              },
                              c.id
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
  Sn = ({ isOpen: s, onClose: n, onAdd: r }) => {
    const [t, a] = o.useState({
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
      d = async x => {
        (x.preventDefault(), i(!0));
        try {
          await new Promise(w => setTimeout(w, 1e3));
          const m = {
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
          (r(m),
            n(),
            a({
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
        } catch (m) {
          q.error('Failed to add guest:', 'Component', m);
        } finally {
          i(!1);
        }
      };
    return e.jsx(Be, {
      open: s,
      onOpenChange: n,
      children: e.jsxs(Ue, {
        className: 'max-w-2xl max-h-[90vh] overflow-y-auto',
        children: [
          e.jsxs(Ke, {
            children: [
              e.jsxs($e, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(gs, { className: 'h-5 w-5' }),
                  'Thêm khách hàng mới',
                ],
              }),
              e.jsx(Xe, {
                children: 'Nhập thông tin khách hàng để tạo hồ sơ mới',
              }),
            ],
          }),
          e.jsxs('form', {
            onSubmit: d,
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
                        onChange: x => a({ ...t, firstName: x.target.value }),
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
                        onChange: x => a({ ...t, lastName: x.target.value }),
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
                        onChange: x => a({ ...t, email: x.target.value }),
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
                        onChange: x => a({ ...t, phone: x.target.value }),
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
                        onChange: x => a({ ...t, nationality: x.target.value }),
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
                        onChange: x => a({ ...t, dateOfBirth: x.target.value }),
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
                        onChange: x => a({ ...t, idNumber: x.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, {
                        htmlFor: 'preferredLanguage',
                        children: 'Ngôn ngữ ưa thích',
                      }),
                      e.jsxs(W, {
                        value: t.preferredLanguage,
                        onValueChange: x => a({ ...t, preferredLanguage: x }),
                        children: [
                          e.jsx(X, { children: e.jsx(Y, {}) }),
                          e.jsxs(J, {
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
                  e.jsx(ue, {
                    id: 'address',
                    value: t.address,
                    onChange: x => a({ ...t, address: x.target.value }),
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
                        onChange: x => a({ ...t, city: x.target.value }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'country', children: 'Quốc gia' }),
                      e.jsx(C, {
                        id: 'country',
                        value: t.country,
                        onChange: x => a({ ...t, country: x.target.value }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'notes', children: 'Ghi chú' }),
                  e.jsx(ue, {
                    id: 'notes',
                    value: t.notes,
                    onChange: x => a({ ...t, notes: x.target.value }),
                    placeholder: 'Thông tin bổ sung về khách hàng...',
                    rows: 3,
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex justify-end gap-2',
                children: [
                  e.jsx(g, {
                    type: 'button',
                    variant: 'outline',
                    onClick: n,
                    children: 'Hủy',
                  }),
                  e.jsx(g, {
                    type: 'submit',
                    disabled: l,
                    children: l
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(U, {
                              className: 'h-4 w-4 mr-2 animate-spin',
                            }),
                            'Đang tạo...',
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(Pe, { className: 'h-4 w-4 mr-2' }),
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
  cl = () => {
    const { user: s } = Se(),
      [n, r] = o.useState(Na),
      [t, a] = o.useState(!1),
      [l, i] = o.useState(''),
      [d, x] = o.useState('all'),
      [m, w] = o.useState('all'),
      [c, p] = o.useState(null),
      [S, T] = o.useState(!1),
      [D, se] = o.useState(!1),
      ae = n.filter(L => {
        const Q =
            !l ||
            L.firstName.toLowerCase().includes(l.toLowerCase()) ||
            L.lastName.toLowerCase().includes(l.toLowerCase()) ||
            L.email.toLowerCase().includes(l.toLowerCase()) ||
            L.phone.includes(l),
          G = d === 'all' || L.membershipTier === d,
          he = m === 'all' || L.status === m;
        return Q && G && he;
      }),
      ne = L => {
        (p(L), T(!0));
      },
      le = L => {
        (r(Q => Q.map(G => (G.id === L.id ? L : G))), p(L));
      },
      k = L => {
        r(Q => [...Q, L]);
      },
      ee = async () => {
        a(!0);
        try {
          (await new Promise(L => setTimeout(L, 1e3)), r(Na));
        } catch (L) {
          q.error('Failed to fetch guests:', 'Component', L);
        } finally {
          a(!1);
        }
      };
    return (
      o.useEffect(() => {
        ee();
      }, []),
      t
        ? e.jsxs('div', {
            className: 'flex items-center justify-center h-64',
            children: [
              e.jsx(U, { className: 'h-8 w-8 animate-spin text-green-600' }),
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
                  e.jsxs(g, {
                    onClick: () => se(!0),
                    children: [
                      e.jsx(gs, { className: 'h-4 w-4 mr-2' }),
                      'Thêm khách hàng',
                    ],
                  }),
                ],
              }),
              e.jsxs(u, {
                children: [
                  e.jsx(y, {
                    children: e.jsx(b, {
                      className: 'text-lg',
                      children: 'Tìm kiếm và lọc',
                    }),
                  }),
                  e.jsx(j, {
                    children: e.jsxs('div', {
                      className: 'flex flex-col sm:flex-row gap-4',
                      children: [
                        e.jsx('div', {
                          className: 'flex-1',
                          children: e.jsxs('div', {
                            className: 'relative',
                            children: [
                              e.jsx(Re, {
                                className:
                                  'absolute left-3 top-3 h-4 w-4 text-gray-400',
                              }),
                              e.jsx(C, {
                                placeholder:
                                  'Tìm kiếm theo tên, email hoặc số điện thoại...',
                                value: l,
                                onChange: L => i(L.target.value),
                                className: 'pl-10',
                              }),
                            ],
                          }),
                        }),
                        e.jsxs('div', {
                          className: 'flex gap-2',
                          children: [
                            e.jsxs(W, {
                              value: d,
                              onValueChange: x,
                              children: [
                                e.jsx(X, {
                                  className: 'w-[180px]',
                                  children: e.jsx(Y, {
                                    placeholder: 'Membership tier',
                                  }),
                                }),
                                e.jsxs(J, {
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
                            e.jsxs(W, {
                              value: m,
                              onValueChange: w,
                              children: [
                                e.jsx(X, {
                                  className: 'w-[150px]',
                                  children: e.jsx(Y, {
                                    placeholder: 'Trạng thái',
                                  }),
                                }),
                                e.jsxs(J, {
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
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: n.length,
                              }),
                            ],
                          }),
                          e.jsx(pe, { className: 'h-8 w-8 text-blue-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: n.filter(L => L.status === 'vip')
                                  .length,
                              }),
                            ],
                          }),
                          e.jsx(ss, { className: 'h-8 w-8 text-purple-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: n.filter(
                                  L =>
                                    new Date(L.createdAt) >
                                    new Date(
                                      Date.now() - 30 * 24 * 60 * 60 * 1e3
                                    )
                                ).length,
                              }),
                            ],
                          }),
                          e.jsx(gs, { className: 'h-8 w-8 text-green-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                  n.reduce((L, Q) => L + Q.averageRating, 0) /
                                  n.length
                                ).toFixed(1),
                              }),
                            ],
                          }),
                          e.jsx(ss, { className: 'h-8 w-8 text-yellow-500' }),
                        ],
                      }),
                    }),
                  }),
                ],
              }),
              e.jsxs(u, {
                children: [
                  e.jsxs(y, {
                    children: [
                      e.jsx(b, { children: 'Danh sách khách hàng' }),
                      e.jsxs(M, {
                        children: [
                          'Hiển thị ',
                          ae.length,
                          ' trong tổng số ',
                          n.length,
                          ' khách hàng',
                        ],
                      }),
                    ],
                  }),
                  e.jsx(j, {
                    children: e.jsx('div', {
                      className: 'overflow-x-auto',
                      children: e.jsxs(Ee, {
                        children: [
                          e.jsx(qe, {
                            children: e.jsxs(de, {
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
                          e.jsx(Oe, {
                            children: ae.map(L =>
                              e.jsxs(
                                de,
                                {
                                  children: [
                                    e.jsx(P, {
                                      children: e.jsxs('div', {
                                        children: [
                                          e.jsxs('div', {
                                            className: 'font-medium',
                                            children: [
                                              L.firstName,
                                              ' ',
                                              L.lastName,
                                            ],
                                          }),
                                          e.jsx('div', {
                                            className:
                                              'text-sm text-muted-foreground',
                                            children: L.nationality,
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
                                              e.jsx(sa, {
                                                className: 'h-3 w-3',
                                              }),
                                              L.email,
                                            ],
                                          }),
                                          e.jsxs('div', {
                                            className:
                                              'flex items-center gap-1 text-sm',
                                            children: [
                                              e.jsx(be, {
                                                className: 'h-3 w-3',
                                              }),
                                              L.phone,
                                            ],
                                          }),
                                        ],
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsx(R, {
                                        className: Wa(L.membershipTier),
                                        children:
                                          L.membershipTier.toUpperCase(),
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: e.jsx(R, {
                                        className: Xa(L.status),
                                        children: L.status.toUpperCase(),
                                      }),
                                    }),
                                    e.jsx(P, { children: L.totalStays }),
                                    e.jsx(P, { children: _s(L.totalSpent) }),
                                    e.jsx(P, {
                                      children: e.jsxs('div', {
                                        className: 'flex items-center gap-1',
                                        children: [
                                          e.jsx(ss, {
                                            className:
                                              'h-4 w-4 fill-yellow-400 text-yellow-400',
                                          }),
                                          e.jsx('span', {
                                            children: L.averageRating,
                                          }),
                                        ],
                                      }),
                                    }),
                                    e.jsx(P, {
                                      children: L.lastStay
                                        ? As(L.lastStay)
                                        : 'Chưa lưu trú',
                                    }),
                                    e.jsx(P, {
                                      children: e.jsx(g, {
                                        variant: 'ghost',
                                        size: 'sm',
                                        onClick: () => ne(L),
                                        children: e.jsx(ze, {
                                          className: 'h-4 w-4',
                                        }),
                                      }),
                                    }),
                                  ],
                                },
                                L.id
                              )
                            ),
                          }),
                        ],
                      }),
                    }),
                  }),
                ],
              }),
              e.jsx(Cn, {
                guest: c,
                isOpen: S,
                onClose: () => T(!1),
                onUpdate: le,
              }),
              e.jsx(Sn, { isOpen: D, onClose: () => se(!1), onAdd: k }),
            ],
          })
    );
  },
  fa = {
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
  ya = [
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
  ba = [
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
  kn = s => {
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
  Ns = s =>
    new Date(s).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  Tn = ({ config: s, onUpdate: n }) => {
    const [r, t] = o.useState(!1),
      [a, l] = o.useState(!1),
      i = async () => {
        t(!0);
        try {
          await new Promise(d => setTimeout(d, 1e3));
        } catch (d) {
          q.error('Failed to save firewall config:', 'Component', d);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(ce, { className: 'h-5 w-5' }),
                    'Cấu hình Firewall',
                  ],
                }),
                e.jsx(M, { children: 'Quản lý tường lửa và bảo mật mạng' }),
              ],
            }),
            e.jsxs(j, {
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
                    e.jsx(B, {
                      checked: s.enabled,
                      onCheckedChange: d => n({ enabled: d }),
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
                        e.jsx(B, {
                          checked: s.ddosProtection,
                          onCheckedChange: d => n({ ddosProtection: d }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'Rate Limiting' }),
                        e.jsx(B, {
                          checked: s.rateLimiting,
                          onCheckedChange: d => n({ rateLimiting: d }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsxs('div', {
                  children: [
                    e.jsx(h, { children: 'Blocked IPs' }),
                    e.jsx(ue, {
                      value: s.blockedIPs.join(`
`),
                      onChange: d =>
                        n({
                          blockedIPs: d.target.value
                            .split(
                              `
`
                            )
                            .filter(x => x.trim()),
                        }),
                      placeholder: `192.168.1.100
10.0.0.50`,
                      rows: 3,
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'flex justify-end',
                  children: e.jsx(g, {
                    onClick: i,
                    disabled: r,
                    children: r
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(U, {
                              className: 'h-4 w-4 mr-2 animate-spin',
                            }),
                            'Đang lưu...',
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(ge, { className: 'h-4 w-4 mr-2' }),
                            'Lưu cấu hình',
                          ],
                        }),
                  }),
                }),
              ],
            }),
          ],
        }),
        e.jsxs(u, {
          children: [
            e.jsx(y, {
              children: e.jsxs(b, {
                className: 'flex items-center justify-between',
                children: [
                  e.jsx('span', { children: 'Firewall Rules' }),
                  e.jsxs(g, {
                    size: 'sm',
                    onClick: () => l(!a),
                    children: [
                      e.jsx(Pe, { className: 'h-4 w-4 mr-2' }),
                      'Thêm Rule',
                    ],
                  }),
                ],
              }),
            }),
            e.jsx(j, {
              children: e.jsxs(Ee, {
                children: [
                  e.jsx(qe, {
                    children: e.jsxs(de, {
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
                  e.jsx(Oe, {
                    children: s.rules.map(d =>
                      e.jsxs(
                        de,
                        {
                          children: [
                            e.jsx(P, {
                              className: 'font-medium',
                              children: d.name,
                            }),
                            e.jsx(P, { children: d.source }),
                            e.jsx(P, { children: d.destination }),
                            e.jsx(P, { children: d.port }),
                            e.jsx(P, { children: d.protocol.toUpperCase() }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                variant:
                                  d.action === 'allow'
                                    ? 'default'
                                    : 'destructive',
                                children: d.action.toUpperCase(),
                              }),
                            }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                variant: d.enabled ? 'default' : 'secondary',
                                children: d.enabled ? 'Enabled' : 'Disabled',
                              }),
                            }),
                            e.jsx(P, {
                              children: e.jsxs('div', {
                                className: 'flex gap-2',
                                children: [
                                  e.jsx(g, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(Qe, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                  e.jsx(g, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(_e, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                ],
                              }),
                            }),
                          ],
                        },
                        d.id
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
  An = ({ config: s, onUpdate: n }) => {
    const [r, t] = o.useState(!1),
      a = async () => {
        t(!0);
        try {
          await new Promise(l => setTimeout(l, 1e3));
        } catch (l) {
          q.error('Failed to save SSL config:', 'Component', l);
        } finally {
          t(!1);
        }
      };
    return e.jsxs('div', {
      className: 'space-y-6',
      children: [
        e.jsxs(u, {
          children: [
            e.jsxs(y, {
              children: [
                e.jsxs(b, {
                  className: 'flex items-center gap-2',
                  children: [
                    e.jsx(ps, { className: 'h-5 w-5' }),
                    'Cấu hình SSL/TLS',
                  ],
                }),
                e.jsx(M, { children: 'Quản lý chứng chỉ SSL và cấu hình TLS' }),
              ],
            }),
            e.jsxs(j, {
              className: 'space-y-6',
              children: [
                e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
                  children: [
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'Kích hoạt SSL' }),
                        e.jsx(B, {
                          checked: s.enabled,
                          onCheckedChange: l => n({ enabled: l }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'Force HTTPS' }),
                        e.jsx(B, {
                          checked: s.forceHttps,
                          onCheckedChange: l => n({ forceHttps: l }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      className: 'flex items-center justify-between',
                      children: [
                        e.jsx(h, { children: 'HSTS Enabled' }),
                        e.jsx(B, {
                          checked: s.hstsEnabled,
                          onCheckedChange: l => n({ hstsEnabled: l }),
                        }),
                      ],
                    }),
                  ],
                }),
                e.jsx('div', {
                  className: 'flex justify-end',
                  children: e.jsx(g, {
                    onClick: a,
                    disabled: r,
                    children: r
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(U, {
                              className: 'h-4 w-4 mr-2 animate-spin',
                            }),
                            'Đang lưu...',
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(ge, { className: 'h-4 w-4 mr-2' }),
                            'Lưu cấu hình',
                          ],
                        }),
                  }),
                }),
              ],
            }),
          ],
        }),
        e.jsxs(u, {
          children: [
            e.jsx(y, {
              children: e.jsxs(b, {
                className: 'flex items-center justify-between',
                children: [
                  e.jsx('span', { children: 'SSL Certificates' }),
                  e.jsxs(g, {
                    size: 'sm',
                    children: [
                      e.jsx(Pe, { className: 'h-4 w-4 mr-2' }),
                      'Thêm Certificate',
                    ],
                  }),
                ],
              }),
            }),
            e.jsx(j, {
              children: e.jsxs(Ee, {
                children: [
                  e.jsx(qe, {
                    children: e.jsxs(de, {
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
                  e.jsx(Oe, {
                    children: s.certificates.map(l =>
                      e.jsxs(
                        de,
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
                            e.jsx(P, { children: Ns(l.validFrom) }),
                            e.jsx(P, { children: Ns(l.validTo) }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                className: V(
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
                                  e.jsx(g, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(We, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                  e.jsx(g, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(U, {
                                      className: 'h-4 w-4',
                                    }),
                                  }),
                                  e.jsx(g, {
                                    variant: 'ghost',
                                    size: 'sm',
                                    children: e.jsx(_e, {
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
  Dn = ({ alerts: s }) => {
    const [n, r] = o.useState('all'),
      t = s.filter(a => n === 'all' || a.severity === n);
    return e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs(u, {
        children: [
          e.jsxs(y, {
            children: [
              e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(is, { className: 'h-5 w-5' }),
                  'Cảnh báo bảo mật',
                ],
              }),
              e.jsx(M, { children: 'Theo dõi và xử lý các cảnh báo bảo mật' }),
            ],
          }),
          e.jsxs(j, {
            children: [
              e.jsxs('div', {
                className: 'flex justify-between items-center mb-4',
                children: [
                  e.jsxs('div', {
                    className: 'flex gap-2',
                    children: [
                      e.jsxs(g, {
                        variant: n === 'all' ? 'default' : 'outline',
                        size: 'sm',
                        onClick: () => r('all'),
                        children: ['Tất cả (', s.length, ')'],
                      }),
                      e.jsxs(g, {
                        variant: n === 'critical' ? 'default' : 'outline',
                        size: 'sm',
                        onClick: () => r('critical'),
                        children: [
                          'Critical (',
                          s.filter(a => a.severity === 'critical').length,
                          ')',
                        ],
                      }),
                      e.jsxs(g, {
                        variant: n === 'high' ? 'default' : 'outline',
                        size: 'sm',
                        onClick: () => r('high'),
                        children: [
                          'High (',
                          s.filter(a => a.severity === 'high').length,
                          ')',
                        ],
                      }),
                    ],
                  }),
                  e.jsxs(g, {
                    size: 'sm',
                    children: [
                      e.jsx(U, { className: 'h-4 w-4 mr-2' }),
                      'Refresh',
                    ],
                  }),
                ],
              }),
              e.jsx('div', {
                className: 'space-y-4',
                children: t.map(a =>
                  e.jsx(
                    u,
                    {
                      className: V(
                        'border-l-4',
                        a.severity === 'critical'
                          ? 'border-l-red-500'
                          : a.severity === 'high'
                            ? 'border-l-orange-500'
                            : a.severity === 'medium'
                              ? 'border-l-yellow-500'
                              : 'border-l-blue-500'
                      ),
                      children: e.jsx(j, {
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
                                      className: kn(a.severity),
                                      children: a.severity.toUpperCase(),
                                    }),
                                    e.jsx(R, {
                                      variant: 'outline',
                                      children: a.type,
                                    }),
                                    e.jsx('span', {
                                      className:
                                        'text-sm text-muted-foreground',
                                      children: Ns(a.timestamp),
                                    }),
                                  ],
                                }),
                                e.jsx('h4', {
                                  className: 'font-medium',
                                  children: a.message,
                                }),
                                e.jsx('p', {
                                  className:
                                    'text-sm text-muted-foreground mt-1',
                                  children: a.details,
                                }),
                              ],
                            }),
                            e.jsxs('div', {
                              className: 'flex gap-2',
                              children: [
                                !a.resolved &&
                                  e.jsxs(g, {
                                    size: 'sm',
                                    variant: 'outline',
                                    children: [
                                      e.jsx(xe, { className: 'h-4 w-4 mr-2' }),
                                      'Resolve',
                                    ],
                                  }),
                                e.jsx(g, {
                                  size: 'sm',
                                  variant: 'ghost',
                                  children: e.jsx(ze, { className: 'h-4 w-4' }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    },
                    a.id
                  )
                ),
              }),
            ],
          }),
        ],
      }),
    });
  },
  Ln = ({ logs: s }) => {
    const [n, r] = o.useState(''),
      [t, a] = o.useState('all'),
      l = s.filter(i => {
        const d =
            !n ||
            i.event.toLowerCase().includes(n.toLowerCase()) ||
            i.details.toLowerCase().includes(n.toLowerCase()) ||
            i.ip.includes(n),
          x = t === 'all' || i.severity === t;
        return d && x;
      });
    return e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs(u, {
        children: [
          e.jsxs(y, {
            children: [
              e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(Fs, { className: 'h-5 w-5' }),
                  'Security Logs',
                ],
              }),
              e.jsx(M, { children: 'Nhật ký hoạt động bảo mật của hệ thống' }),
            ],
          }),
          e.jsxs(j, {
            children: [
              e.jsxs('div', {
                className: 'flex gap-4 mb-4',
                children: [
                  e.jsx('div', {
                    className: 'flex-1',
                    children: e.jsxs('div', {
                      className: 'relative',
                      children: [
                        e.jsx(Re, {
                          className:
                            'absolute left-3 top-3 h-4 w-4 text-gray-400',
                        }),
                        e.jsx(C, {
                          placeholder: 'Tìm kiếm logs...',
                          value: n,
                          onChange: i => r(i.target.value),
                          className: 'pl-10',
                        }),
                      ],
                    }),
                  }),
                  e.jsxs(W, {
                    value: t,
                    onValueChange: a,
                    children: [
                      e.jsx(X, {
                        className: 'w-[150px]',
                        children: e.jsx(Y, {}),
                      }),
                      e.jsxs(J, {
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
              e.jsxs(Ee, {
                children: [
                  e.jsx(qe, {
                    children: e.jsxs(de, {
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
                  e.jsx(Oe, {
                    children: l.map(i =>
                      e.jsxs(
                        de,
                        {
                          children: [
                            e.jsx(P, {
                              className: 'font-mono text-sm',
                              children: Ns(i.timestamp),
                            }),
                            e.jsx(P, { children: i.source }),
                            e.jsx(P, {
                              className: 'font-medium',
                              children: i.event,
                            }),
                            e.jsx(P, {
                              children: e.jsx(R, {
                                className: V(
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
  In = ({ config: s, onUpdate: n }) => {
    const [r, t] = o.useState(!1),
      a = async () => {
        t(!0);
        try {
          (await new Promise(l => setTimeout(l, 3e3)),
            n({ lastBackup: new Date().toISOString(), status: 'success' }));
        } catch (l) {
          (q.error('Backup failed:', 'Component', l), n({ status: 'failed' }));
        } finally {
          t(!1);
        }
      };
    return e.jsx('div', {
      className: 'space-y-6',
      children: e.jsxs(u, {
        children: [
          e.jsxs(y, {
            children: [
              e.jsxs(b, {
                className: 'flex items-center gap-2',
                children: [
                  e.jsx(vs, { className: 'h-5 w-5' }),
                  'Backup & Recovery',
                ],
              }),
              e.jsx(M, { children: 'Quản lý sao lưu và khôi phục dữ liệu' }),
            ],
          }),
          e.jsx(j, {
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
                        e.jsx(B, {
                          checked: s.enabled,
                          onCheckedChange: l => n({ enabled: l }),
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
                          onChange: l => n({ schedule: l.target.value }),
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
                            n({ retention: parseInt(l.target.value) }),
                        }),
                      ],
                    }),
                    e.jsxs('div', {
                      children: [
                        e.jsx(h, {
                          htmlFor: 'location',
                          children: 'Vị trí lưu trữ',
                        }),
                        e.jsxs(W, {
                          value: s.location,
                          onValueChange: l => n({ location: l }),
                          children: [
                            e.jsx(X, { children: e.jsx(Y, {}) }),
                            e.jsxs(J, {
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
                        e.jsx(B, {
                          checked: s.encryption,
                          onCheckedChange: l => n({ encryption: l }),
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
                                ? Ns(s.lastBackup)
                                : 'Chưa có backup',
                            }),
                            e.jsx(R, {
                              className: V(
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
                            e.jsx(Me, { value: 65, className: 'h-2' }),
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
                        e.jsx(g, {
                          onClick: a,
                          disabled: r,
                          children: r
                            ? e.jsxs(e.Fragment, {
                                children: [
                                  e.jsx(U, {
                                    className: 'h-4 w-4 mr-2 animate-spin',
                                  }),
                                  'Đang backup...',
                                ],
                              })
                            : e.jsxs(e.Fragment, {
                                children: [
                                  e.jsx(jt, { className: 'h-4 w-4 mr-2' }),
                                  'Backup ngay',
                                ],
                              }),
                        }),
                        e.jsxs(g, {
                          variant: 'outline',
                          children: [
                            e.jsx(We, { className: 'h-4 w-4 mr-2' }),
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
  dl = () => {
    const { user: s } = Se(),
      [n, r] = o.useState(fa),
      [t, a] = o.useState(ya),
      [l, i] = o.useState(ba),
      [d, x] = o.useState(!1),
      m = (c, p) => {
        r(S => ({ ...S, [c]: { ...S[c], ...p } }));
      },
      w = async () => {
        x(!0);
        try {
          (await new Promise(c => setTimeout(c, 1e3)), r(fa), a(ya), i(ba));
        } catch (c) {
          q.error('Failed to fetch security data:', 'Component', c);
        } finally {
          x(!1);
        }
      };
    return (
      o.useEffect(() => {
        w();
      }, []),
      d
        ? e.jsxs('div', {
            className: 'flex items-center justify-center h-64',
            children: [
              e.jsx(U, { className: 'h-8 w-8 animate-spin text-purple-600' }),
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
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: n.firewall.enabled ? 'ON' : 'OFF',
                              }),
                            ],
                          }),
                          e.jsx(ce, {
                            className: V(
                              'h-8 w-8',
                              n.firewall.enabled
                                ? 'text-green-500'
                                : 'text-gray-400'
                            ),
                          }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: n.ssl.enabled ? 'ACTIVE' : 'INACTIVE',
                              }),
                            ],
                          }),
                          e.jsx(ps, {
                            className: V(
                              'h-8 w-8',
                              n.ssl.enabled ? 'text-green-500' : 'text-gray-400'
                            ),
                          }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: t.filter(c => !c.resolved).length,
                              }),
                            ],
                          }),
                          e.jsx(is, { className: 'h-8 w-8 text-orange-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                  n.backup.status === 'success'
                                    ? 'OK'
                                    : 'FAILED',
                              }),
                            ],
                          }),
                          e.jsx(vs, {
                            className: V(
                              'h-8 w-8',
                              n.backup.status === 'success'
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
                      e.jsxs(H, {
                        value: 'firewall',
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx(ce, { className: 'h-4 w-4' }),
                          'Firewall',
                        ],
                      }),
                      e.jsxs(H, {
                        value: 'ssl',
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx(ps, { className: 'h-4 w-4' }),
                          'SSL/TLS',
                        ],
                      }),
                      e.jsxs(H, {
                        value: 'alerts',
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx(is, { className: 'h-4 w-4' }),
                          'Cảnh báo',
                        ],
                      }),
                      e.jsxs(H, {
                        value: 'logs',
                        className: 'flex items-center gap-2',
                        children: [e.jsx(Fs, { className: 'h-4 w-4' }), 'Logs'],
                      }),
                      e.jsxs(H, {
                        value: 'backup',
                        className: 'flex items-center gap-2',
                        children: [
                          e.jsx(vs, { className: 'h-4 w-4' }),
                          'Backup',
                        ],
                      }),
                    ],
                  }),
                  e.jsx(z, {
                    value: 'firewall',
                    children: e.jsx(Tn, {
                      config: n.firewall,
                      onUpdate: c => m('firewall', c),
                    }),
                  }),
                  e.jsx(z, {
                    value: 'ssl',
                    children: e.jsx(An, {
                      config: n.ssl,
                      onUpdate: c => m('ssl', c),
                    }),
                  }),
                  e.jsx(z, {
                    value: 'alerts',
                    children: e.jsx(Dn, { alerts: t }),
                  }),
                  e.jsx(z, { value: 'logs', children: e.jsx(Ln, { logs: l }) }),
                  e.jsx(z, {
                    value: 'backup',
                    children: e.jsx(In, {
                      config: n.backup,
                      onUpdate: c => m('backup', c),
                    }),
                  }),
                ],
              }),
            ],
          })
    );
  },
  wa = [
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
  Ca = {
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
  Ya = s => {
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
  Qs = s => {
    switch (s) {
      case 'debug':
        return e.jsx(Ks, { className: 'h-4 w-4' });
      case 'info':
        return e.jsx(xe, { className: 'h-4 w-4' });
      case 'warn':
        return e.jsx(is, { className: 'h-4 w-4' });
      case 'error':
        return e.jsx(fs, { className: 'h-4 w-4' });
      case 'fatal':
        return e.jsx(te, { className: 'h-4 w-4' });
      default:
        return e.jsx(Ks, { className: 'h-4 w-4' });
    }
  },
  Ws = s => {
    switch (s) {
      case 'auth':
        return e.jsx(ce, { className: 'h-4 w-4' });
      case 'api':
        return e.jsx(rs, { className: 'h-4 w-4' });
      case 'database':
        return e.jsx(ls, { className: 'h-4 w-4' });
      case 'websocket':
        return e.jsx(Xs, { className: 'h-4 w-4' });
      case 'email':
        return e.jsx(Fs, { className: 'h-4 w-4' });
      case 'ai':
        return e.jsx(Fa, { className: 'h-4 w-4' });
      case 'backup':
        return e.jsx(vs, { className: 'h-4 w-4' });
      case 'security':
        return e.jsx(ce, { className: 'h-4 w-4' });
      case 'system':
        return e.jsx(aa, { className: 'h-4 w-4' });
      default:
        return e.jsx(ta, { className: 'h-4 w-4' });
    }
  },
  Ja = s =>
    new Date(s).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }),
  et = s => (s ? (s < 1e3 ? `${s}ms` : `${(s / 1e3).toFixed(2)}s`) : '-'),
  Fn = ({ log: s, isOpen: n, onClose: r }) =>
    s
      ? e.jsx('div', {
          className: V(
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
            n ? 'block' : 'hidden'
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
                  e.jsx(g, {
                    variant: 'ghost',
                    size: 'sm',
                    onClick: r,
                    children: e.jsx(fs, { className: 'h-4 w-4' }),
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
                            children: Ja(s.timestamp),
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
                              Qs(s.level),
                              e.jsx(R, {
                                className: Ya(s.level),
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
                              Ws(s.module),
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
                            children: et(s.duration),
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
  hl = () => {
    const { user: s } = Se(),
      [n, r] = o.useState(wa),
      [t, a] = o.useState(Ca),
      [l, i] = o.useState(!1),
      [d, x] = o.useState(!1),
      [m, w] = o.useState(null),
      [c, p] = o.useState(!1),
      [S, T] = o.useState({
        level: 'all',
        module: 'all',
        startTime: '',
        endTime: '',
        search: '',
        requestId: '',
        userId: '',
        ip: '',
      }),
      D = n.filter(k => {
        const ee = S.level === 'all' || k.level === S.level,
          L = S.module === 'all' || k.module === S.module,
          Q =
            !S.search ||
            k.message.toLowerCase().includes(S.search.toLowerCase()) ||
            k.details?.toLowerCase().includes(S.search.toLowerCase()),
          G = !S.requestId || k.requestId?.includes(S.requestId),
          he = !S.userId || k.userId?.includes(S.userId),
          re = !S.ip || k.ip?.includes(S.ip);
        let I = !0;
        return (
          S.startTime &&
            (I = I && new Date(k.timestamp) >= new Date(S.startTime)),
          S.endTime && (I = I && new Date(k.timestamp) <= new Date(S.endTime)),
          ee && L && Q && G && he && re && I
        );
      }),
      se = k => {
        (w(k), p(!0));
      },
      ae = async () => {
        i(!0);
        try {
          await new Promise(G => setTimeout(G, 2e3));
          const k = D.map(
              G =>
                `${G.timestamp},${G.level},${G.module},"${G.message}",${G.requestId || ''},${G.userId || ''},${G.ip || ''},${G.statusCode || ''}`
            ).join(`
`),
            ee = new Blob([k], { type: 'text/csv' }),
            L = window.URL.createObjectURL(ee),
            Q = document.createElement('a');
          ((Q.href = L),
            (Q.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`),
            Q.click(),
            window.URL.revokeObjectURL(L));
        } catch (k) {
          q.error('Export failed:', 'Component', k);
        } finally {
          i(!1);
        }
      },
      ne = async () => {
        i(!0);
        try {
          (await new Promise(k => setTimeout(k, 1e3)), r(wa), a(Ca));
        } catch (k) {
          q.error('Failed to fetch logs:', 'Component', k);
        } finally {
          i(!1);
        }
      },
      le = () => {
        T({
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
        ne();
      }, []),
      o.useEffect(() => {
        if (!d) return;
        const k = setInterval(() => {
          const ee = {
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
          r(L => [ee, ...L.slice(0, 99)]);
        }, 3e3);
        return () => clearInterval(k);
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
                      e.jsx(B, { checked: d, onCheckedChange: x }),
                      e.jsx(h, { className: 'text-sm', children: 'Real-time' }),
                    ],
                  }),
                  e.jsxs(g, {
                    onClick: ne,
                    disabled: l,
                    children: [
                      e.jsx(U, {
                        className: V('h-4 w-4 mr-2', l && 'animate-spin'),
                      }),
                      'Refresh',
                    ],
                  }),
                  e.jsxs(g, {
                    onClick: ae,
                    disabled: l,
                    children: [
                      e.jsx(We, { className: 'h-4 w-4 mr-2' }),
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
              e.jsx(u, {
                children: e.jsx(j, {
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
                      e.jsx(Fs, { className: 'h-8 w-8 text-blue-500' }),
                    ],
                  }),
                }),
              }),
              e.jsx(u, {
                children: e.jsx(j, {
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
                      e.jsx(te, { className: 'h-8 w-8 text-red-500' }),
                    ],
                  }),
                }),
              }),
              e.jsx(u, {
                children: e.jsx(j, {
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
                      e.jsx(oe, { className: 'h-8 w-8 text-green-500' }),
                    ],
                  }),
                }),
              }),
              e.jsx(u, {
                children: e.jsx(j, {
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
                      e.jsx(Is, { className: 'h-8 w-8 text-orange-500' }),
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
                  e.jsx(H, { value: 'logs', children: 'Logs' }),
                  e.jsx(H, { value: 'stats', children: 'Statistics' }),
                ],
              }),
              e.jsxs(z, {
                value: 'logs',
                className: 'space-y-4',
                children: [
                  e.jsxs(u, {
                    children: [
                      e.jsx(y, {
                        children: e.jsx(b, {
                          className: 'text-lg',
                          children: 'Filters',
                        }),
                      }),
                      e.jsxs(j, {
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
                                  e.jsxs(W, {
                                    value: S.level,
                                    onValueChange: k => T({ ...S, level: k }),
                                    children: [
                                      e.jsx(X, { children: e.jsx(Y, {}) }),
                                      e.jsxs(J, {
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
                                  e.jsxs(W, {
                                    value: S.module,
                                    onValueChange: k => T({ ...S, module: k }),
                                    children: [
                                      e.jsx(X, { children: e.jsx(Y, {}) }),
                                      e.jsxs(J, {
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
                                      e.jsx(Re, {
                                        className:
                                          'absolute left-3 top-3 h-4 w-4 text-gray-400',
                                      }),
                                      e.jsx(C, {
                                        id: 'search',
                                        placeholder: 'Search logs...',
                                        value: S.search,
                                        onChange: k =>
                                          T({ ...S, search: k.target.value }),
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
                                    value: S.startTime,
                                    onChange: k =>
                                      T({ ...S, startTime: k.target.value }),
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
                                    value: S.endTime,
                                    onChange: k =>
                                      T({ ...S, endTime: k.target.value }),
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
                                    value: S.requestId,
                                    onChange: k =>
                                      T({ ...S, requestId: k.target.value }),
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsx('div', {
                            className: 'flex justify-end',
                            children: e.jsx(g, {
                              variant: 'outline',
                              onClick: le,
                              children: 'Clear Filters',
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs(u, {
                    children: [
                      e.jsx(y, {
                        children: e.jsxs(b, {
                          className: 'flex items-center justify-between',
                          children: [
                            e.jsx('span', { children: 'System Logs' }),
                            e.jsxs('div', {
                              className: 'flex items-center gap-2',
                              children: [
                                d &&
                                  e.jsxs(R, {
                                    variant: 'outline',
                                    className: 'text-green-600',
                                    children: [
                                      e.jsx(Ie, { className: 'h-3 w-3 mr-1' }),
                                      'Live',
                                    ],
                                  }),
                                e.jsxs('span', {
                                  className: 'text-sm text-muted-foreground',
                                  children: [
                                    'Showing ',
                                    D.length,
                                    ' of ',
                                    n.length,
                                    ' logs',
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      e.jsx(j, {
                        children: e.jsx('div', {
                          className: 'overflow-x-auto',
                          children: e.jsxs(Ee, {
                            children: [
                              e.jsx(qe, {
                                children: e.jsxs(de, {
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
                              e.jsx(Oe, {
                                children: D.map(k =>
                                  e.jsxs(
                                    de,
                                    {
                                      children: [
                                        e.jsx(P, {
                                          className: 'font-mono text-sm',
                                          children: Ja(k.timestamp),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsxs('div', {
                                            className:
                                              'flex items-center gap-2',
                                            children: [
                                              Qs(k.level),
                                              e.jsx(R, {
                                                className: Ya(k.level),
                                                children: k.level.toUpperCase(),
                                              }),
                                            ],
                                          }),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsxs('div', {
                                            className:
                                              'flex items-center gap-2',
                                            children: [Ws(k.module), k.module],
                                          }),
                                        }),
                                        e.jsx(P, {
                                          className: 'max-w-xs',
                                          children: e.jsx('div', {
                                            className: 'truncate',
                                            title: k.message,
                                            children: k.message,
                                          }),
                                        }),
                                        e.jsx(P, {
                                          className: 'font-mono text-sm',
                                          children:
                                            k.requestId &&
                                            e.jsx('span', {
                                              className:
                                                'text-blue-600 cursor-pointer hover:underline',
                                              children: k.requestId,
                                            }),
                                        }),
                                        e.jsx(P, { children: et(k.duration) }),
                                        e.jsx(P, {
                                          children:
                                            k.statusCode &&
                                            e.jsx(R, {
                                              variant:
                                                k.statusCode >= 400
                                                  ? 'destructive'
                                                  : 'default',
                                              children: k.statusCode,
                                            }),
                                        }),
                                        e.jsx(P, {
                                          children: e.jsx(g, {
                                            variant: 'ghost',
                                            size: 'sm',
                                            onClick: () => se(k),
                                            children: e.jsx(ze, {
                                              className: 'h-4 w-4',
                                            }),
                                          }),
                                        }),
                                      ],
                                    },
                                    k.id
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
              e.jsx(z, {
                value: 'stats',
                className: 'space-y-4',
                children: e.jsxs('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                  children: [
                    e.jsxs(u, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Logs by Level' }),
                        }),
                        e.jsx(j, {
                          children: e.jsx('div', {
                            className: 'space-y-3',
                            children: Object.entries(t.byLevel).map(([k, ee]) =>
                              e.jsxs(
                                'div',
                                {
                                  className:
                                    'flex items-center justify-between',
                                  children: [
                                    e.jsxs('div', {
                                      className: 'flex items-center gap-2',
                                      children: [
                                        Qs(k),
                                        e.jsx('span', {
                                          className: 'capitalize',
                                          children: k,
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
                                              width: `${(ee / t.total) * 100}%`,
                                            },
                                          }),
                                        }),
                                        e.jsx('span', {
                                          className: 'text-sm font-medium',
                                          children: ee,
                                        }),
                                      ],
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
                    e.jsxs(u, {
                      children: [
                        e.jsx(y, {
                          children: e.jsx(b, { children: 'Logs by Module' }),
                        }),
                        e.jsx(j, {
                          children: e.jsx('div', {
                            className: 'space-y-3',
                            children: Object.entries(t.byModule).map(
                              ([k, ee]) =>
                                e.jsxs(
                                  'div',
                                  {
                                    className:
                                      'flex items-center justify-between',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'flex items-center gap-2',
                                        children: [
                                          Ws(k),
                                          e.jsx('span', {
                                            className: 'capitalize',
                                            children: k,
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
                                                width: `${(ee / t.total) * 100}%`,
                                              },
                                            }),
                                          }),
                                          e.jsx('span', {
                                            className: 'text-sm font-medium',
                                            children: ee,
                                          }),
                                        ],
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
              }),
            ],
          }),
          e.jsx(Fn, { log: m, isOpen: c, onClose: () => p(!1) }),
        ],
      })
    );
  },
  Sa = [
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
  ka = [
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
  Ta = [
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
  Pn = s => {
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
  st = s => {
    switch (s) {
      case 'api':
        return e.jsx(rs, { className: 'h-4 w-4' });
      case 'webhook':
        return e.jsx(pt, { className: 'h-4 w-4' });
      case 'database':
        return e.jsx(ls, { className: 'h-4 w-4' });
      case 'payment':
        return e.jsx(Aa, { className: 'h-4 w-4' });
      case 'notification':
        return e.jsx(sa, { className: 'h-4 w-4' });
      case 'ai':
        return e.jsx(Fa, { className: 'h-4 w-4' });
      case 'analytics':
        return e.jsx(Is, { className: 'h-4 w-4' });
      case 'security':
        return e.jsx(ce, { className: 'h-4 w-4' });
      default:
        return e.jsx(gt, { className: 'h-4 w-4' });
    }
  },
  Bs = s =>
    new Date(s).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  Mn = s => new Intl.NumberFormat('vi-VN').format(s),
  Rn = ({ integration: s, isOpen: n, onClose: r, onSave: t }) => {
    const [a, l] = o.useState(s),
      [i, d] = o.useState(!1),
      [x, m] = o.useState(!1);
    o.useEffect(() => {
      l(s);
    }, [s]);
    const w = async () => {
        if (a) {
          d(!0);
          try {
            (await new Promise(p => setTimeout(p, 1e3)), t(a), r());
          } catch (p) {
            q.error('Failed to save integration:', 'Component', p);
          } finally {
            d(!1);
          }
        }
      },
      c = async () => {
        d(!0);
        try {
          (await new Promise(p => setTimeout(p, 2e3)),
            alert('Integration test successful!'));
        } catch {
          alert('Integration test failed!');
        } finally {
          d(!1);
        }
      };
    return !s || !a
      ? null
      : e.jsx(Be, {
          open: n,
          onOpenChange: r,
          children: e.jsxs(Ue, {
            className: 'max-w-2xl max-h-[90vh] overflow-y-auto',
            children: [
              e.jsxs(Ke, {
                children: [
                  e.jsxs($e, {
                    className: 'flex items-center gap-2',
                    children: [st(s.type), s.name],
                  }),
                  e.jsx(Xe, { children: 'Cấu hình chi tiết cho integration' }),
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
                            value: a.name,
                            onChange: p => l({ ...a, name: p.target.value }),
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
                            value: a.provider,
                            onChange: p =>
                              l({ ...a, provider: p.target.value }),
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'description', children: 'Mô tả' }),
                      e.jsx(ue, {
                        id: 'description',
                        value: a.description,
                        onChange: p => l({ ...a, description: p.target.value }),
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
                            value: a.config.baseUrl || '',
                            onChange: p =>
                              l({
                                ...a,
                                config: {
                                  ...a.config,
                                  baseUrl: p.target.value,
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
                            value: a.config.timeout || '',
                            onChange: p =>
                              l({
                                ...a,
                                config: {
                                  ...a.config,
                                  timeout: parseInt(p.target.value),
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
                            type: x ? 'text' : 'password',
                            value: a.config.apiKey || '',
                            onChange: p =>
                              l({
                                ...a,
                                config: { ...a.config, apiKey: p.target.value },
                              }),
                          }),
                          e.jsx(g, {
                            type: 'button',
                            variant: 'outline',
                            size: 'sm',
                            onClick: () => m(!x),
                            children: x
                              ? e.jsx(Ia, { className: 'h-4 w-4' })
                              : e.jsx(ze, { className: 'h-4 w-4' }),
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
                            value: a.config.retryCount || '',
                            onChange: p =>
                              l({
                                ...a,
                                config: {
                                  ...a.config,
                                  retryCount: parseInt(p.target.value),
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
                            value: a.config.rateLimitPerMinute || '',
                            onChange: p =>
                              l({
                                ...a,
                                config: {
                                  ...a.config,
                                  rateLimitPerMinute: parseInt(p.target.value),
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
                      e.jsx(B, {
                        checked: a.enabled,
                        onCheckedChange: p => l({ ...a, enabled: p }),
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    className: 'flex justify-end gap-2',
                    children: [
                      e.jsxs(g, {
                        variant: 'outline',
                        onClick: c,
                        disabled: i,
                        children: [
                          e.jsx(xe, { className: 'h-4 w-4 mr-2' }),
                          'Test Connection',
                        ],
                      }),
                      e.jsx(g, {
                        onClick: w,
                        disabled: i,
                        children: i
                          ? e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(U, {
                                  className: 'h-4 w-4 mr-2 animate-spin',
                                }),
                                'Đang lưu...',
                              ],
                            })
                          : e.jsxs(e.Fragment, {
                              children: [
                                e.jsx(ge, { className: 'h-4 w-4 mr-2' }),
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
  En = ({ isOpen: s, onClose: n, onAdd: r }) => {
    const [t, a] = o.useState({
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
      d = async x => {
        (x.preventDefault(), i(!0));
        try {
          await new Promise(w => setTimeout(w, 1e3));
          const m = {
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
          (r(m),
            n(),
            a({
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
        } catch (m) {
          q.error('Failed to add integration:', 'Component', m);
        } finally {
          i(!1);
        }
      };
    return e.jsx(Be, {
      open: s,
      onOpenChange: n,
      children: e.jsxs(Ue, {
        className: 'max-w-2xl',
        children: [
          e.jsxs(Ke, {
            children: [
              e.jsx($e, { children: 'Thêm Integration mới' }),
              e.jsx(Xe, {
                children: 'Tạo integration mới với third-party service',
              }),
            ],
          }),
          e.jsxs('form', {
            onSubmit: d,
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
                        onChange: x => a({ ...t, name: x.target.value }),
                        required: !0,
                      }),
                    ],
                  }),
                  e.jsxs('div', {
                    children: [
                      e.jsx(h, { htmlFor: 'type', children: 'Loại *' }),
                      e.jsxs(W, {
                        value: t.type,
                        onValueChange: x => a({ ...t, type: x }),
                        children: [
                          e.jsx(X, { children: e.jsx(Y, {}) }),
                          e.jsxs(J, {
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
                    onChange: x => a({ ...t, provider: x.target.value }),
                    required: !0,
                  }),
                ],
              }),
              e.jsxs('div', {
                children: [
                  e.jsx(h, { htmlFor: 'description', children: 'Mô tả' }),
                  e.jsx(ue, {
                    id: 'description',
                    value: t.description,
                    onChange: x => a({ ...t, description: x.target.value }),
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
                    onChange: x => a({ ...t, baseUrl: x.target.value }),
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
                    onChange: x => a({ ...t, apiKey: x.target.value }),
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
                        onChange: x =>
                          a({ ...t, timeout: parseInt(x.target.value) }),
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
                        onChange: x =>
                          a({ ...t, retryCount: parseInt(x.target.value) }),
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
                        onChange: x =>
                          a({
                            ...t,
                            rateLimitPerMinute: parseInt(x.target.value),
                          }),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'flex justify-end gap-2',
                children: [
                  e.jsx(g, {
                    type: 'button',
                    variant: 'outline',
                    onClick: n,
                    children: 'Hủy',
                  }),
                  e.jsx(g, {
                    type: 'submit',
                    disabled: l,
                    children: l
                      ? e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(U, {
                              className: 'h-4 w-4 mr-2 animate-spin',
                            }),
                            'Đang tạo...',
                          ],
                        })
                      : e.jsxs(e.Fragment, {
                          children: [
                            e.jsx(Pe, { className: 'h-4 w-4 mr-2' }),
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
  ol = () => {
    const { user: s } = Se(),
      [n, r] = o.useState(Sa),
      [t, a] = o.useState(ka),
      [l, i] = o.useState(Ta),
      [d, x] = o.useState(!1),
      [m, w] = o.useState(null),
      [c, p] = o.useState(!1),
      [S, T] = o.useState(!1),
      [D, se] = o.useState('all'),
      [ae, ne] = o.useState('all'),
      [le, k] = o.useState(''),
      ee = n.filter(v => {
        const O = D === 'all' || v.status === D,
          Z = ae === 'all' || v.type === ae,
          ke =
            !le ||
            v.name.toLowerCase().includes(le.toLowerCase()) ||
            v.provider.toLowerCase().includes(le.toLowerCase());
        return O && Z && ke;
      }),
      L = v => {
        (w(v), p(!0));
      },
      Q = v => {
        (r(O => O.map(Z => (Z.id === v.id ? v : Z))), w(null));
      },
      G = v => {
        r(O => [...O, v]);
      },
      he = v => {
        confirm('Bạn có chắc muốn xóa integration này?') &&
          r(O => O.filter(Z => Z.id !== v));
      },
      re = v => {
        r(O =>
          O.map(Z =>
            Z.id === v
              ? {
                  ...Z,
                  enabled: !Z.enabled,
                  status: Z.enabled ? 'inactive' : 'active',
                }
              : Z
          )
        );
      },
      I = async () => {
        x(!0);
        try {
          (await new Promise(v => setTimeout(v, 1e3)), r(Sa), a(ka), i(Ta));
        } catch (v) {
          q.error('Failed to fetch integrations:', 'Component', v);
        } finally {
          x(!1);
        }
      };
    return (
      o.useEffect(() => {
        I();
      }, []),
      d
        ? e.jsxs('div', {
            className: 'flex items-center justify-center h-64',
            children: [
              e.jsx(U, { className: 'h-8 w-8 animate-spin text-purple-600' }),
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
                  e.jsxs(g, {
                    onClick: () => T(!0),
                    children: [
                      e.jsx(Pe, { className: 'h-4 w-4 mr-2' }),
                      'Thêm Integration',
                    ],
                  }),
                ],
              }),
              e.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-4 gap-4',
                children: [
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: n.length,
                              }),
                            ],
                          }),
                          e.jsx(La, { className: 'h-8 w-8 text-blue-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: n.filter(v => v.status === 'active')
                                  .length,
                              }),
                            ],
                          }),
                          e.jsx(xe, { className: 'h-8 w-8 text-green-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                children: n.filter(v => v.status === 'error')
                                  .length,
                              }),
                            ],
                          }),
                          e.jsx(fs, { className: 'h-8 w-8 text-red-500' }),
                        ],
                      }),
                    }),
                  }),
                  e.jsx(u, {
                    children: e.jsx(j, {
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
                                    n.reduce(
                                      (v, O) => v + O.metrics.successRate,
                                      0
                                    ) / n.length
                                  ).toFixed(1),
                                  '%',
                                ],
                              }),
                            ],
                          }),
                          e.jsx(oe, { className: 'h-8 w-8 text-blue-500' }),
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
                      e.jsx(H, {
                        value: 'integrations',
                        children: 'Integrations',
                      }),
                      e.jsx(H, { value: 'webhooks', children: 'Webhooks' }),
                      e.jsx(H, {
                        value: 'credentials',
                        children: 'Credentials',
                      }),
                    ],
                  }),
                  e.jsxs(z, {
                    value: 'integrations',
                    className: 'space-y-4',
                    children: [
                      e.jsxs(u, {
                        children: [
                          e.jsx(y, {
                            children: e.jsx(b, { children: 'Filters' }),
                          }),
                          e.jsx(j, {
                            children: e.jsxs('div', {
                              className: 'flex flex-col sm:flex-row gap-4',
                              children: [
                                e.jsx('div', {
                                  className: 'flex-1',
                                  children: e.jsxs('div', {
                                    className: 'relative',
                                    children: [
                                      e.jsx(Re, {
                                        className:
                                          'absolute left-3 top-3 h-4 w-4 text-gray-400',
                                      }),
                                      e.jsx(C, {
                                        placeholder: 'Tìm kiếm integrations...',
                                        value: le,
                                        onChange: v => k(v.target.value),
                                        className: 'pl-10',
                                      }),
                                    ],
                                  }),
                                }),
                                e.jsxs('div', {
                                  className: 'flex gap-2',
                                  children: [
                                    e.jsxs(W, {
                                      value: D,
                                      onValueChange: se,
                                      children: [
                                        e.jsx(X, {
                                          className: 'w-[150px]',
                                          children: e.jsx(Y, {}),
                                        }),
                                        e.jsxs(J, {
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
                                    e.jsxs(W, {
                                      value: ae,
                                      onValueChange: ne,
                                      children: [
                                        e.jsx(X, {
                                          className: 'w-[150px]',
                                          children: e.jsx(Y, {}),
                                        }),
                                        e.jsxs(J, {
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
                        children: ee.map(v =>
                          e.jsxs(
                            u,
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
                                            st(v.type),
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
                                              className: Pn(v.status),
                                              children: v.status.toUpperCase(),
                                            }),
                                            e.jsx(B, {
                                              checked: v.enabled,
                                              onCheckedChange: () => re(v.id),
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsx(M, { children: v.description }),
                                  ],
                                }),
                                e.jsxs(j, {
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
                                          children: Mn(v.metrics.totalRequests),
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
                                            e.jsx(Me, {
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
                                            'Last sync:',
                                            ' ',
                                            v.lastSync
                                              ? Bs(v.lastSync)
                                              : 'Never',
                                          ],
                                        }),
                                        e.jsxs('div', {
                                          className: 'flex gap-1',
                                          children: [
                                            e.jsx(g, {
                                              variant: 'ghost',
                                              size: 'sm',
                                              onClick: () => L(v),
                                              children: e.jsx(Qe, {
                                                className: 'h-4 w-4',
                                              }),
                                            }),
                                            e.jsx(g, {
                                              variant: 'ghost',
                                              size: 'sm',
                                              onClick: () => he(v.id),
                                              children: e.jsx(_e, {
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
                  e.jsx(z, {
                    value: 'webhooks',
                    className: 'space-y-4',
                    children: e.jsxs(u, {
                      children: [
                        e.jsx(y, {
                          children: e.jsxs(b, {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsx('span', { children: 'Webhook Endpoints' }),
                              e.jsxs(g, {
                                size: 'sm',
                                children: [
                                  e.jsx(Pe, { className: 'h-4 w-4 mr-2' }),
                                  'Add Webhook',
                                ],
                              }),
                            ],
                          }),
                        }),
                        e.jsx(j, {
                          children: e.jsxs(Ee, {
                            children: [
                              e.jsx(qe, {
                                children: e.jsxs(de, {
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
                              e.jsx(Oe, {
                                children: t.map(v =>
                                  e.jsxs(
                                    de,
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
                                              v.events
                                                .slice(0, 2)
                                                .map((O, Z) =>
                                                  e.jsx(
                                                    R,
                                                    {
                                                      variant: 'secondary',
                                                      className: 'text-xs',
                                                      children: O,
                                                    },
                                                    Z
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
                                              e.jsx(g, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(Qe, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                              e.jsx(g, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(ze, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                              e.jsx(g, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(_e, {
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
                  e.jsx(z, {
                    value: 'credentials',
                    className: 'space-y-4',
                    children: e.jsxs(u, {
                      children: [
                        e.jsx(y, {
                          children: e.jsxs(b, {
                            className: 'flex items-center justify-between',
                            children: [
                              e.jsx('span', { children: 'API Credentials' }),
                              e.jsxs(g, {
                                size: 'sm',
                                children: [
                                  e.jsx(Pe, { className: 'h-4 w-4 mr-2' }),
                                  'Add Credential',
                                ],
                              }),
                            ],
                          }),
                        }),
                        e.jsx(j, {
                          children: e.jsxs(Ee, {
                            children: [
                              e.jsx(qe, {
                                children: e.jsxs(de, {
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
                              e.jsx(Oe, {
                                children: l.map(v =>
                                  e.jsxs(
                                    de,
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
                                            className: V(
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
                                            ? Bs(v.expiresAt)
                                            : 'Never',
                                        }),
                                        e.jsx(P, {
                                          children: v.lastUsed
                                            ? Bs(v.lastUsed)
                                            : 'Never',
                                        }),
                                        e.jsx(P, {
                                          children: e.jsxs('div', {
                                            className: 'flex gap-2',
                                            children: [
                                              e.jsx(g, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(Qe, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                              e.jsx(g, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(U, {
                                                  className: 'h-4 w-4',
                                                }),
                                              }),
                                              e.jsx(g, {
                                                variant: 'ghost',
                                                size: 'sm',
                                                children: e.jsx(_e, {
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
              e.jsx(Rn, {
                integration: m,
                isOpen: c,
                onClose: () => p(!1),
                onSave: Q,
              }),
              e.jsx(En, { isOpen: S, onClose: () => T(!1), onAdd: G }),
            ],
          })
    );
  },
  qn = () => {
    const [s, n] = o.useState(24),
      [r, t] = o.useState(''),
      {
        data: a,
        isLoading: l,
        isError: i,
        refetch: d,
      } = $s({
        queryKey: ['summaries', 'recent', s],
        queryFn: async () => {
          const p = await fetch(`/api/summaries/recent/${s}`);
          if (!p.ok) throw new Error('Failed to fetch recent call summaries');
          return p.json();
        },
      }),
      x = p =>
        (p instanceof Date ? p : new Date(p)).toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      m = p => {
        if (!p) return '00:00';
        const S = parseInt(p, 10);
        if (!isNaN(S) && /^\d+$/.test(p)) {
          const T = Math.floor(S / 60)
              .toString()
              .padStart(2, '0'),
            D = (S % 60).toString().padStart(2, '0');
          return `${T}:${D}`;
        }
        return p;
      },
      w = p => {
        n(p);
      },
      c = a?.summaries.filter(p =>
        r
          ? p.roomNumber && p.roomNumber.toLowerCase().includes(r.toLowerCase())
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
                    e.jsx(ie, {
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
                      onClick: () => d(),
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
                        onChange: p => t(p.target.value),
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
                        onClick: () => d(),
                        className:
                          'mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors',
                        children: 'Try Again',
                      }),
                    ],
                  }),
                })
              : c?.length
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
                            children: c.map(p =>
                              e.jsxs(
                                'tr',
                                {
                                  className:
                                    'border-t border-gray-100 hover:bg-gray-50',
                                  children: [
                                    e.jsx('td', {
                                      className: 'p-3 text-sm text-gray-700',
                                      children: x(p.timestamp),
                                    }),
                                    e.jsx('td', {
                                      className: 'p-3 text-sm text-gray-700',
                                      children: p.roomNumber || 'Unknown',
                                    }),
                                    e.jsx('td', {
                                      className: 'p-3 text-sm text-gray-700',
                                      children: m(p.duration),
                                    }),
                                    e.jsx('td', {
                                      className:
                                        'p-3 text-sm text-gray-700 max-w-md',
                                      children: e.jsx('div', {
                                        className: 'truncate',
                                        children: p.content,
                                      }),
                                    }),
                                    e.jsx('td', {
                                      className: 'p-3 text-center',
                                      children: e.jsx(ie, {
                                        to: `/call-details/${p.callId}`,
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
                                p.id
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
              ' hours • Total:',
              ' ',
              a?.count || 0,
              ' calls',
            ],
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
  ),
  On = () => {
    const n = Lt().callId,
      [r, t] = o.useState(!1),
      {
        data: a,
        isLoading: l,
        isError: i,
      } = $s({
        queryKey: ['summary', n],
        queryFn: async () => {
          const D = await fetch(`/api/summaries/${n}`);
          if (!D.ok) throw new Error('Failed to fetch call summary');
          return D.json();
        },
      }),
      {
        data: d,
        isLoading: x,
        isError: m,
      } = $s({
        queryKey: ['transcripts', n],
        queryFn: async () => {
          const D = await fetch(`/api/transcripts/${n}`);
          if (!D.ok) throw new Error('Failed to fetch call transcripts');
          return D.json();
        },
      }),
      w = D =>
        D
          ? (D instanceof Date ? D : new Date(D)).toLocaleString('en-US', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : 'Unknown',
      c = D => D || '00:00',
      p = async () => {
        if (d?.length)
          try {
            t(!0);
            const D = d.map(
              se =>
                `${se.role === 'assistant' ? 'Assistant' : 'Guest'}: ${se.content}`
            ).join(`

`);
            (await navigator.clipboard.writeText(D),
              setTimeout(() => {
                t(!1);
              }, 1500));
          } catch (D) {
            (q.error('Could not copy text: ', 'Component', D), t(!1));
          }
      },
      S = l || x,
      T = i || m;
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
                  e.jsx(ie, {
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
                  e.jsx(ie, {
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
          children: S
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
            : T
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
                      e.jsx(ie, {
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
                                children: ['ID: ', n],
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
                                    children: w(a?.timestamp),
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
                                    children: a?.roomNumber || 'Unknown',
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
                                    children: c(a?.duration),
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
                                    children: d?.length || 0,
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
                                onClick: p,
                                disabled: r || !d?.length,
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
                          d?.length
                            ? e.jsx('div', {
                                className:
                                  'space-y-4 overflow-y-auto max-h-[500px] pr-2',
                                children: d.map(D =>
                                  e.jsx(
                                    'div',
                                    {
                                      className: `flex ${D.role === 'assistant' ? 'justify-start' : 'justify-end'}`,
                                      children: e.jsxs('div', {
                                        className: `max-w-[75%] p-3 rounded-lg relative ${D.role === 'assistant' ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-900'}`,
                                        children: [
                                          e.jsxs('div', {
                                            className:
                                              'text-xs text-gray-500 mb-1',
                                            children: [
                                              D.role === 'assistant'
                                                ? 'Assistant'
                                                : 'Guest',
                                              ' ',
                                              '• ',
                                              w(D.timestamp),
                                            ],
                                          }),
                                          e.jsx('p', {
                                            className: 'text-sm',
                                            children: D.content,
                                          }),
                                        ],
                                      }),
                                    },
                                    D.id
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
                          a?.content
                            ? e.jsxs('div', {
                                className:
                                  'p-4 bg-blue-50 rounded-lg overflow-y-auto',
                                style: { maxHeight: '500px' },
                                children: [
                                  e.jsx('div', {
                                    className:
                                      'text-sm text-blue-900 whitespace-pre-line',
                                    children: a.content,
                                  }),
                                  e.jsx('div', {
                                    className: 'mt-3 text-right',
                                    children: e.jsxs('span', {
                                      className: 'text-xs text-gray-500',
                                      children: [
                                        'Generated at ',
                                        w(a.timestamp),
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
  ml = Object.freeze(
    Object.defineProperty(
      { __proto__: null, default: On },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  );
export {
  Qn as A,
  tl as C,
  Wn as D,
  cl as G,
  ol as I,
  Zn as N,
  _n as S,
  al as U,
  Ht as a,
  nl as b,
  ll as c,
  il as d,
  rl as e,
  dl as f,
  hl as g,
  Xn as h,
  Yn as i,
  Jn as j,
  el as k,
  sl as l,
  xl as m,
  ml as n,
};
