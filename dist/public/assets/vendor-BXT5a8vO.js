import { r as k, bD as $i } from './react-core-C6DwaHZM.js';
import { c as ca } from './css-utils-BkLtITBR.js';
import { i as ht, h as M } from './charts-ceMktdbA.js';
var Oi = { exports: {} },
  Ei = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(b, A) {
    var S = b.length;
    b.push(A);
    e: for (; 0 < S; ) {
      var q = (S - 1) >>> 1,
        B = b[q];
      if (0 < i(B, A)) ((b[q] = A), (b[S] = B), (S = q));
      else break e;
    }
  }
  function r(b) {
    return b.length === 0 ? null : b[0];
  }
  function n(b) {
    if (b.length === 0) return null;
    var A = b[0],
      S = b.pop();
    if (S !== A) {
      b[0] = S;
      e: for (var q = 0, B = b.length, lt = B >>> 1; q < lt; ) {
        var Oe = 2 * (q + 1) - 1,
          Ht = b[Oe],
          Ee = Oe + 1,
          ft = b[Ee];
        if (0 > i(Ht, S))
          Ee < B && 0 > i(ft, Ht)
            ? ((b[q] = ft), (b[Ee] = S), (q = Ee))
            : ((b[q] = Ht), (b[Oe] = S), (q = Oe));
        else if (Ee < B && 0 > i(ft, S)) ((b[q] = ft), (b[Ee] = S), (q = Ee));
        else break e;
      }
    }
    return A;
  }
  function i(b, A) {
    var S = b.sortIndex - A.sortIndex;
    return S !== 0 ? S : b.id - A.id;
  }
  if (typeof performance == 'object' && typeof performance.now == 'function') {
    var s = performance;
    e.unstable_now = function () {
      return s.now();
    };
  } else {
    var a = Date,
      o = a.now();
    e.unstable_now = function () {
      return a.now() - o;
    };
  }
  var u = [],
    c = [],
    l = 1,
    f = null,
    h = 3,
    p = !1,
    g = !1,
    d = !1,
    v = typeof setTimeout == 'function' ? setTimeout : null,
    y = typeof clearTimeout == 'function' ? clearTimeout : null,
    m = typeof setImmediate < 'u' ? setImmediate : null;
  typeof navigator < 'u' &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function w(b) {
    for (var A = r(c); A !== null; ) {
      if (A.callback === null) n(c);
      else if (A.startTime <= b)
        (n(c), (A.sortIndex = A.expirationTime), t(u, A));
      else break;
      A = r(c);
    }
  }
  function $(b) {
    if (((d = !1), w(b), !g))
      if (r(u) !== null) ((g = !0), te(O));
      else {
        var A = r(c);
        A !== null && V($, A.startTime - b);
      }
  }
  function O(b, A) {
    ((g = !1), d && ((d = !1), y(C), (C = -1)), (p = !0));
    var S = h;
    try {
      for (
        w(A), f = r(u);
        f !== null && (!(f.expirationTime > A) || (b && !R()));

      ) {
        var q = f.callback;
        if (typeof q == 'function') {
          ((f.callback = null), (h = f.priorityLevel));
          var B = q(f.expirationTime <= A);
          ((A = e.unstable_now()),
            typeof B == 'function' ? (f.callback = B) : f === r(u) && n(u),
            w(A));
        } else n(u);
        f = r(u);
      }
      if (f !== null) var lt = !0;
      else {
        var Oe = r(c);
        (Oe !== null && V($, Oe.startTime - A), (lt = !1));
      }
      return lt;
    } finally {
      ((f = null), (h = S), (p = !1));
    }
  }
  var x = !1,
    E = null,
    C = -1,
    I = 5,
    j = -1;
  function R() {
    return !(e.unstable_now() - j < I);
  }
  function P() {
    if (E !== null) {
      var b = e.unstable_now();
      j = b;
      var A = !0;
      try {
        A = E(!0, b);
      } finally {
        A ? W() : ((x = !1), (E = null));
      }
    } else x = !1;
  }
  var W;
  if (typeof m == 'function')
    W = function () {
      m(P);
    };
  else if (typeof MessageChannel < 'u') {
    var Q = new MessageChannel(),
      z = Q.port2;
    ((Q.port1.onmessage = P),
      (W = function () {
        z.postMessage(null);
      }));
  } else
    W = function () {
      v(P, 0);
    };
  function te(b) {
    ((E = b), x || ((x = !0), W()));
  }
  function V(b, A) {
    C = v(function () {
      b(e.unstable_now());
    }, A);
  }
  ((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (b) {
      b.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      g || p || ((g = !0), te(O));
    }),
    (e.unstable_forceFrameRate = function (b) {
      0 > b || 125 < b
        ? console.error(
            'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported'
          )
        : (I = 0 < b ? Math.floor(1e3 / b) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return h;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return r(u);
    }),
    (e.unstable_next = function (b) {
      switch (h) {
        case 1:
        case 2:
        case 3:
          var A = 3;
          break;
        default:
          A = h;
      }
      var S = h;
      h = A;
      try {
        return b();
      } finally {
        h = S;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (b, A) {
      switch (b) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          b = 3;
      }
      var S = h;
      h = b;
      try {
        return A();
      } finally {
        h = S;
      }
    }),
    (e.unstable_scheduleCallback = function (b, A, S) {
      var q = e.unstable_now();
      switch (
        (typeof S == 'object' && S !== null
          ? ((S = S.delay), (S = typeof S == 'number' && 0 < S ? q + S : q))
          : (S = q),
        b)
      ) {
        case 1:
          var B = -1;
          break;
        case 2:
          B = 250;
          break;
        case 5:
          B = 1073741823;
          break;
        case 4:
          B = 1e4;
          break;
        default:
          B = 5e3;
      }
      return (
        (B = S + B),
        (b = {
          id: l++,
          callback: A,
          priorityLevel: b,
          startTime: S,
          expirationTime: B,
          sortIndex: -1,
        }),
        S > q
          ? ((b.sortIndex = S),
            t(c, b),
            r(u) === null &&
              b === r(c) &&
              (d ? (y(C), (C = -1)) : (d = !0), V($, S - q)))
          : ((b.sortIndex = B), t(u, b), g || p || ((g = !0), te(O))),
        b
      );
    }),
    (e.unstable_shouldYield = R),
    (e.unstable_wrapCallback = function (b) {
      var A = h;
      return function () {
        var S = h;
        h = A;
        try {
          return b.apply(this, arguments);
        } finally {
          h = S;
        }
      };
    }));
})(Ei);
Oi.exports = Ei;
var Qw = Oi.exports;
function la(e, t) {
  if (e instanceof RegExp) return { keys: !1, pattern: e };
  var r,
    n,
    i,
    s,
    a = [],
    o = '',
    u = e.split('/');
  for (u[0] || u.shift(); (i = u.shift()); )
    ((r = i[0]),
      r === '*'
        ? (a.push(r), (o += i[1] === '?' ? '(?:/(.*))?' : '/(.*)'))
        : r === ':'
          ? ((n = i.indexOf('?', 1)),
            (s = i.indexOf('.', 1)),
            a.push(i.substring(1, ~n ? n : ~s ? s : i.length)),
            (o += ~n && !~s ? '(?:/([^/]+?))?' : '/([^/]+?)'),
            ~s && (o += (~n ? '?' : '') + '\\' + i.substring(s)))
          : (o += '/' + i));
  return {
    keys: a,
    pattern: new RegExp('^' + o + (t ? '(?=$|/)' : '/?$'), 'i'),
  };
}
var Ai = { exports: {} },
  Si = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var je = k;
function fa(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var ha = typeof Object.is == 'function' ? Object.is : fa,
  da = je.useState,
  pa = je.useEffect,
  va = je.useLayoutEffect,
  ga = je.useDebugValue;
function ya(e, t) {
  var r = t(),
    n = da({ inst: { value: r, getSnapshot: t } }),
    i = n[0].inst,
    s = n[1];
  return (
    va(
      function () {
        ((i.value = r), (i.getSnapshot = t), Gt(i) && s({ inst: i }));
      },
      [e, r, t]
    ),
    pa(
      function () {
        return (
          Gt(i) && s({ inst: i }),
          e(function () {
            Gt(i) && s({ inst: i });
          })
        );
      },
      [e]
    ),
    ga(r),
    r
  );
}
function Gt(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var r = t();
    return !ha(e, r);
  } catch {
    return !0;
  }
}
function ma(e, t) {
  return t();
}
var ba =
  typeof window > 'u' ||
  typeof window.document > 'u' ||
  typeof window.document.createElement > 'u'
    ? ma
    : ya;
Si.useSyncExternalStore =
  je.useSyncExternalStore !== void 0 ? je.useSyncExternalStore : ba;
Ai.exports = Si;
var wa = Ai.exports;
const _a = 'popstate',
  _r = 'pushState',
  $r = 'replaceState',
  $a = 'hashchange',
  Jr = [_a, _r, $r, $a],
  Oa = e => {
    for (const t of Jr) addEventListener(t, e);
    return () => {
      for (const t of Jr) removeEventListener(t, e);
    };
  },
  xi = (e, t) => wa.useSyncExternalStore(Oa, e, t),
  Ea = () => location.search,
  Aa = ({ ssrSearch: e = '' } = {}) => xi(Ea, () => e),
  Zr = () => location.pathname,
  Sa = ({ ssrPath: e } = {}) => xi(Zr, e ? () => e : Zr),
  xa = (e, { replace: t = !1, state: r = null } = {}) =>
    history[t ? $r : _r](r, '', e),
  Ca = (e = {}) => [Sa(e), xa],
  en = Symbol.for('wouter_v3');
if (typeof history < 'u' && typeof window[en] > 'u') {
  for (const e of [_r, $r]) {
    const t = history[e];
    history[e] = function () {
      const r = t.apply(this, arguments),
        n = new Event(e);
      return ((n.arguments = arguments), dispatchEvent(n), r);
    };
  }
  Object.defineProperty(window, en, { value: !0 });
}
const Pa = (e, t) =>
    t.toLowerCase().indexOf(e.toLowerCase())
      ? '~' + t
      : t.slice(e.length) || '/',
  Ci = (e = '') => (e === '/' ? '' : e),
  Ta = (e, t) => (e[0] === '~' ? e.slice(1) : Ci(t) + e),
  Ra = (e = '', t) => Pa(tn(Ci(e)), tn(t)),
  tn = e => {
    try {
      return decodeURI(e);
    } catch {
      return e;
    }
  },
  Pi = {
    hook: Ca,
    searchHook: Aa,
    parser: la,
    base: '',
    ssrPath: void 0,
    ssrSearch: void 0,
    ssrContext: void 0,
    hrefs: e => e,
  },
  Ti = k.createContext(Pi),
  st = () => k.useContext(Ti),
  Ri = {},
  Li = k.createContext(Ri),
  La = () => k.useContext(Li),
  Tt = e => {
    const [t, r] = e.hook(e);
    return [Ra(e.base, t), $i((n, i) => r(Ta(n, e.base), i))];
  },
  zw = () => Tt(st()),
  Mi = (e, t, r, n) => {
    const { pattern: i, keys: s } =
        t instanceof RegExp ? { keys: !1, pattern: t } : e(t || '*', n),
      a = i.exec(r) || [],
      [o, ...u] = a;
    return o !== void 0
      ? [
          !0,
          (() => {
            const c =
              s !== !1
                ? Object.fromEntries(s.map((f, h) => [f, u[h]]))
                : a.groups;
            let l = { ...u };
            return (c && Object.assign(l, c), l);
          })(),
          ...(n ? [o] : []),
        ]
      : [!1, null];
  },
  Ma = ({ children: e, ...t }) => {
    const r = st(),
      n = t.hook ? Pi : r;
    let i = n;
    const [s, a] = t.ssrPath?.split('?') ?? [];
    (a && ((t.ssrSearch = a), (t.ssrPath = s)),
      (t.hrefs = t.hrefs ?? t.hook?.hrefs));
    let o = k.useRef({}),
      u = o.current,
      c = u;
    for (let l in n) {
      const f = l === 'base' ? n[l] + (t[l] || '') : t[l] || n[l];
      (u === c && f !== c[l] && (o.current = c = { ...c }),
        (c[l] = f),
        f !== n[l] && (i = c));
    }
    return k.createElement(Ti.Provider, { value: i, children: e });
  },
  rn = ({ children: e, component: t }, r) =>
    t ? k.createElement(t, { params: r }) : typeof e == 'function' ? e(r) : e,
  Ia = e => {
    let t = k.useRef(Ri);
    const r = t.current;
    return (t.current =
      Object.keys(e).length !== Object.keys(r).length ||
      Object.entries(e).some(([n, i]) => i !== r[n])
        ? e
        : r);
  },
  Vw = ({ path: e, nest: t, match: r, ...n }) => {
    const i = st(),
      [s] = Tt(i),
      [a, o, u] = r ?? Mi(i.parser, e, s, t),
      c = Ia({ ...La(), ...o });
    if (!a) return null;
    const l = u ? k.createElement(Ma, { base: u }, rn(n, c)) : rn(n, c);
    return k.createElement(Li.Provider, { value: c, children: l });
  },
  Xw = k.forwardRef((e, t) => {
    const r = st(),
      [n, i] = Tt(r),
      {
        to: s = '',
        href: a = s,
        onClick: o,
        asChild: u,
        children: c,
        className: l,
        replace: f,
        state: h,
        ...p
      } = e,
      g = $i(v => {
        v.ctrlKey ||
          v.metaKey ||
          v.altKey ||
          v.shiftKey ||
          v.button !== 0 ||
          (o?.(v), v.defaultPrevented || (v.preventDefault(), i(a, e)));
      }),
      d = r.hrefs(a[0] === '~' ? a.slice(1) : r.base + a, r);
    return u && k.isValidElement(c)
      ? k.cloneElement(c, { onClick: g, href: d })
      : k.createElement('a', {
          ...p,
          onClick: g,
          href: d,
          className: l?.call ? l(n === a) : l,
          children: c,
          ref: t,
        });
  }),
  Ii = e =>
    Array.isArray(e)
      ? e.flatMap(t => Ii(t && t.type === k.Fragment ? t.props.children : t))
      : [e],
  Yw = ({ children: e, location: t }) => {
    const r = st(),
      [n] = Tt(r);
    for (const i of Ii(e)) {
      let s = 0;
      if (
        k.isValidElement(i) &&
        (s = Mi(r.parser, i.props.path, t || n, i.props.nest))[0]
      )
        return k.cloneElement(i, { match: s });
    }
    return null;
  },
  nn = e => (typeof e == 'boolean' ? `${e}` : e === 0 ? '0' : e),
  sn = ca,
  Jw = (e, t) => r => {
    var n;
    if (t?.variants == null) return sn(e, r?.class, r?.className);
    const { variants: i, defaultVariants: s } = t,
      a = Object.keys(i).map(c => {
        const l = r?.[c],
          f = s?.[c];
        if (l === null) return null;
        const h = nn(l) || nn(f);
        return i[c][h];
      }),
      o =
        r &&
        Object.entries(r).reduce((c, l) => {
          let [f, h] = l;
          return (h === void 0 || (c[f] = h), c);
        }, {}),
      u =
        t == null || (n = t.compoundVariants) === null || n === void 0
          ? void 0
          : n.reduce((c, l) => {
              let { class: f, className: h, ...p } = l;
              return Object.entries(p).every(g => {
                let [d, v] = g;
                return Array.isArray(v)
                  ? v.includes({ ...s, ...o }[d])
                  : { ...s, ...o }[d] === v;
              })
                ? [...c, f, h]
                : c;
            }, []);
    return sn(e, a, u, r?.class, r?.className);
  };
/**
 * @remix-run/router v1.23.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function Ze() {
  return (
    (Ze = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    Ze.apply(this, arguments)
  );
}
var Me;
(function (e) {
  ((e.Pop = 'POP'), (e.Push = 'PUSH'), (e.Replace = 'REPLACE'));
})(Me || (Me = {}));
const an = 'popstate';
function Zw(e) {
  e === void 0 && (e = {});
  function t(n, i) {
    let { pathname: s, search: a, hash: o } = n.location;
    return ir(
      '',
      { pathname: s, search: a, hash: o },
      (i.state && i.state.usr) || null,
      (i.state && i.state.key) || 'default'
    );
  }
  function r(n, i) {
    return typeof i == 'string' ? i : Fi(i);
  }
  return Da(t, r, null, e);
}
function bt(e, t) {
  if (e === !1 || e === null || typeof e > 'u') throw new Error(t);
}
function Fa() {
  return Math.random().toString(36).substr(2, 8);
}
function on(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function ir(e, t, r, n) {
  return (
    r === void 0 && (r = null),
    Ze(
      { pathname: typeof e == 'string' ? e : e.pathname, search: '', hash: '' },
      typeof t == 'string' ? Or(t) : t,
      { state: r, key: (t && t.key) || n || Fa() }
    )
  );
}
function Fi(e) {
  let { pathname: t = '/', search: r = '', hash: n = '' } = e;
  return (
    r && r !== '?' && (t += r.charAt(0) === '?' ? r : '?' + r),
    n && n !== '#' && (t += n.charAt(0) === '#' ? n : '#' + n),
    t
  );
}
function Or(e) {
  let t = {};
  if (e) {
    let r = e.indexOf('#');
    r >= 0 && ((t.hash = e.substr(r)), (e = e.substr(0, r)));
    let n = e.indexOf('?');
    (n >= 0 && ((t.search = e.substr(n)), (e = e.substr(0, n))),
      e && (t.pathname = e));
  }
  return t;
}
function Da(e, t, r, n) {
  n === void 0 && (n = {});
  let { window: i = document.defaultView, v5Compat: s = !1 } = n,
    a = i.history,
    o = Me.Pop,
    u = null,
    c = l();
  c == null && ((c = 0), a.replaceState(Ze({}, a.state, { idx: c }), ''));
  function l() {
    return (a.state || { idx: null }).idx;
  }
  function f() {
    o = Me.Pop;
    let v = l(),
      y = v == null ? null : v - c;
    ((c = v), u && u({ action: o, location: d.location, delta: y }));
  }
  function h(v, y) {
    o = Me.Push;
    let m = ir(d.location, v, y);
    c = l() + 1;
    let w = on(m, c),
      $ = d.createHref(m);
    try {
      a.pushState(w, '', $);
    } catch (O) {
      if (O instanceof DOMException && O.name === 'DataCloneError') throw O;
      i.location.assign($);
    }
    s && u && u({ action: o, location: d.location, delta: 1 });
  }
  function p(v, y) {
    o = Me.Replace;
    let m = ir(d.location, v, y);
    c = l();
    let w = on(m, c),
      $ = d.createHref(m);
    (a.replaceState(w, '', $),
      s && u && u({ action: o, location: d.location, delta: 0 }));
  }
  function g(v) {
    let y = i.location.origin !== 'null' ? i.location.origin : i.location.href,
      m = typeof v == 'string' ? v : Fi(v);
    return (
      (m = m.replace(/ $/, '%20')),
      bt(
        y,
        'No window.location.(origin|href) available to create URL for href: ' +
          m
      ),
      new URL(m, y)
    );
  }
  let d = {
    get action() {
      return o;
    },
    get location() {
      return e(i, a);
    },
    listen(v) {
      if (u) throw new Error('A history only accepts one active listener');
      return (
        i.addEventListener(an, f),
        (u = v),
        () => {
          (i.removeEventListener(an, f), (u = null));
        }
      );
    },
    createHref(v) {
      return t(i, v);
    },
    createURL: g,
    encodeLocation(v) {
      let y = g(v);
      return { pathname: y.pathname, search: y.search, hash: y.hash };
    },
    push: h,
    replace: p,
    go(v) {
      return a.go(v);
    },
  };
  return d;
}
var un;
(function (e) {
  ((e.data = 'data'),
    (e.deferred = 'deferred'),
    (e.redirect = 'redirect'),
    (e.error = 'error'));
})(un || (un = {}));
function e_(e, t) {
  if (t === '/') return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let r = t.endsWith('/') ? t.length - 1 : t.length,
    n = e.charAt(r);
  return n && n !== '/' ? null : e.slice(r) || '/';
}
function ja(e, t) {
  t === void 0 && (t = '/');
  let {
    pathname: r,
    search: n = '',
    hash: i = '',
  } = typeof e == 'string' ? Or(e) : e;
  return {
    pathname: r ? (r.startsWith('/') ? r : Na(r, t)) : t,
    search: ka(n),
    hash: Ua(i),
  };
}
function Na(e, t) {
  let r = t.replace(/\/+$/, '').split('/');
  return (
    e.split('/').forEach(i => {
      i === '..' ? r.length > 1 && r.pop() : i !== '.' && r.push(i);
    }),
    r.length > 1 ? r.join('/') : '/'
  );
}
function Wt(e, t, r, n) {
  return (
    "Cannot include a '" +
    e +
    "' character in a manually specified " +
    ('`to.' +
      t +
      '` field [' +
      JSON.stringify(n) +
      '].  Please separate it out to the ') +
    ('`to.' + r + '` field. Alternatively you may provide the full path as ') +
    'a string in <Link to="..."> and the router will parse it for you.'
  );
}
function qa(e) {
  return e.filter(
    (t, r) => r === 0 || (t.route.path && t.route.path.length > 0)
  );
}
function t_(e, t) {
  let r = qa(e);
  return t
    ? r.map((n, i) => (i === r.length - 1 ? n.pathname : n.pathnameBase))
    : r.map(n => n.pathnameBase);
}
function r_(e, t, r, n) {
  n === void 0 && (n = !1);
  let i;
  typeof e == 'string'
    ? (i = Or(e))
    : ((i = Ze({}, e)),
      bt(
        !i.pathname || !i.pathname.includes('?'),
        Wt('?', 'pathname', 'search', i)
      ),
      bt(
        !i.pathname || !i.pathname.includes('#'),
        Wt('#', 'pathname', 'hash', i)
      ),
      bt(!i.search || !i.search.includes('#'), Wt('#', 'search', 'hash', i)));
  let s = e === '' || i.pathname === '',
    a = s ? '/' : i.pathname,
    o;
  if (a == null) o = r;
  else {
    let f = t.length - 1;
    if (!n && a.startsWith('..')) {
      let h = a.split('/');
      for (; h[0] === '..'; ) (h.shift(), (f -= 1));
      i.pathname = h.join('/');
    }
    o = f >= 0 ? t[f] : '/';
  }
  let u = ja(i, o),
    c = a && a !== '/' && a.endsWith('/'),
    l = (s || a === '.') && r.endsWith('/');
  return (!u.pathname.endsWith('/') && (c || l) && (u.pathname += '/'), u);
}
const n_ = e => e.join('/').replace(/\/\/+/g, '/'),
  ka = e => (!e || e === '?' ? '' : e.startsWith('?') ? e : '?' + e),
  Ua = e => (!e || e === '#' ? '' : e.startsWith('#') ? e : '#' + e),
  Di = ['post', 'put', 'patch', 'delete'];
new Set(Di);
const Ba = ['get', ...Di];
new Set(Ba);
var at = class {
    constructor() {
      ((this.listeners = new Set()),
        (this.subscribe = this.subscribe.bind(this)));
    }
    subscribe(e) {
      return (
        this.listeners.add(e),
        this.onSubscribe(),
        () => {
          (this.listeners.delete(e), this.onUnsubscribe());
        }
      );
    }
    hasListeners() {
      return this.listeners.size > 0;
    }
    onSubscribe() {}
    onUnsubscribe() {}
  },
  Ne = typeof window > 'u' || 'Deno' in globalThis;
function Z() {}
function Ha(e, t) {
  return typeof e == 'function' ? e(t) : e;
}
function sr(e) {
  return typeof e == 'number' && e >= 0 && e !== 1 / 0;
}
function ji(e, t) {
  return Math.max(e + (t || 0) - Date.now(), 0);
}
function Ie(e, t) {
  return typeof e == 'function' ? e(t) : e;
}
function re(e, t) {
  return typeof e == 'function' ? e(t) : e;
}
function cn(e, t) {
  const {
    type: r = 'all',
    exact: n,
    fetchStatus: i,
    predicate: s,
    queryKey: a,
    stale: o,
  } = e;
  if (a) {
    if (n) {
      if (t.queryHash !== Er(a, t.options)) return !1;
    } else if (!tt(t.queryKey, a)) return !1;
  }
  if (r !== 'all') {
    const u = t.isActive();
    if ((r === 'active' && !u) || (r === 'inactive' && u)) return !1;
  }
  return !(
    (typeof o == 'boolean' && t.isStale() !== o) ||
    (i && i !== t.state.fetchStatus) ||
    (s && !s(t))
  );
}
function ln(e, t) {
  const { exact: r, status: n, predicate: i, mutationKey: s } = e;
  if (s) {
    if (!t.options.mutationKey) return !1;
    if (r) {
      if (et(t.options.mutationKey) !== et(s)) return !1;
    } else if (!tt(t.options.mutationKey, s)) return !1;
  }
  return !((n && t.state.status !== n) || (i && !i(t)));
}
function Er(e, t) {
  return (t?.queryKeyHashFn || et)(e);
}
function et(e) {
  return JSON.stringify(e, (t, r) =>
    or(r)
      ? Object.keys(r)
          .sort()
          .reduce((n, i) => ((n[i] = r[i]), n), {})
      : r
  );
}
function tt(e, t) {
  return e === t
    ? !0
    : typeof e != typeof t
      ? !1
      : e && t && typeof e == 'object' && typeof t == 'object'
        ? Object.keys(t).every(r => tt(e[r], t[r]))
        : !1;
}
function Ni(e, t) {
  if (e === t) return e;
  const r = fn(e) && fn(t);
  if (r || (or(e) && or(t))) {
    const n = r ? e : Object.keys(e),
      i = n.length,
      s = r ? t : Object.keys(t),
      a = s.length,
      o = r ? [] : {};
    let u = 0;
    for (let c = 0; c < a; c++) {
      const l = r ? c : s[c];
      ((!r && n.includes(l)) || r) && e[l] === void 0 && t[l] === void 0
        ? ((o[l] = void 0), u++)
        : ((o[l] = Ni(e[l], t[l])), o[l] === e[l] && e[l] !== void 0 && u++);
    }
    return i === a && u === i ? e : o;
  }
  return t;
}
function ar(e, t) {
  if (!t || Object.keys(e).length !== Object.keys(t).length) return !1;
  for (const r in e) if (e[r] !== t[r]) return !1;
  return !0;
}
function fn(e) {
  return Array.isArray(e) && e.length === Object.keys(e).length;
}
function or(e) {
  if (!hn(e)) return !1;
  const t = e.constructor;
  if (t === void 0) return !0;
  const r = t.prototype;
  return !(
    !hn(r) ||
    !r.hasOwnProperty('isPrototypeOf') ||
    Object.getPrototypeOf(e) !== Object.prototype
  );
}
function hn(e) {
  return Object.prototype.toString.call(e) === '[object Object]';
}
function Ga(e) {
  return new Promise(t => {
    setTimeout(t, e);
  });
}
function ur(e, t, r) {
  return typeof r.structuralSharing == 'function'
    ? r.structuralSharing(e, t)
    : r.structuralSharing !== !1
      ? Ni(e, t)
      : t;
}
function Wa(e, t, r = 0) {
  const n = [...e, t];
  return r && n.length > r ? n.slice(1) : n;
}
function Ka(e, t, r = 0) {
  const n = [t, ...e];
  return r && n.length > r ? n.slice(0, -1) : n;
}
var Ar = Symbol();
function qi(e, t) {
  return !e.queryFn && t?.initialPromise
    ? () => t.initialPromise
    : !e.queryFn || e.queryFn === Ar
      ? () => Promise.reject(new Error(`Missing queryFn: '${e.queryHash}'`))
      : e.queryFn;
}
function i_(e, t) {
  return typeof e == 'function' ? e(...t) : !!e;
}
var Qa = class extends at {
    #t;
    #e;
    #r;
    constructor() {
      (super(),
        (this.#r = e => {
          if (!Ne && window.addEventListener) {
            const t = () => e();
            return (
              window.addEventListener('visibilitychange', t, !1),
              () => {
                window.removeEventListener('visibilitychange', t);
              }
            );
          }
        }));
    }
    onSubscribe() {
      this.#e || this.setEventListener(this.#r);
    }
    onUnsubscribe() {
      this.hasListeners() || (this.#e?.(), (this.#e = void 0));
    }
    setEventListener(e) {
      ((this.#r = e),
        this.#e?.(),
        (this.#e = e(t => {
          typeof t == 'boolean' ? this.setFocused(t) : this.onFocus();
        })));
    }
    setFocused(e) {
      this.#t !== e && ((this.#t = e), this.onFocus());
    }
    onFocus() {
      const e = this.isFocused();
      this.listeners.forEach(t => {
        t(e);
      });
    }
    isFocused() {
      return typeof this.#t == 'boolean'
        ? this.#t
        : globalThis.document?.visibilityState !== 'hidden';
    }
  },
  Sr = new Qa(),
  za = class extends at {
    #t = !0;
    #e;
    #r;
    constructor() {
      (super(),
        (this.#r = e => {
          if (!Ne && window.addEventListener) {
            const t = () => e(!0),
              r = () => e(!1);
            return (
              window.addEventListener('online', t, !1),
              window.addEventListener('offline', r, !1),
              () => {
                (window.removeEventListener('online', t),
                  window.removeEventListener('offline', r));
              }
            );
          }
        }));
    }
    onSubscribe() {
      this.#e || this.setEventListener(this.#r);
    }
    onUnsubscribe() {
      this.hasListeners() || (this.#e?.(), (this.#e = void 0));
    }
    setEventListener(e) {
      ((this.#r = e), this.#e?.(), (this.#e = e(this.setOnline.bind(this))));
    }
    setOnline(e) {
      this.#t !== e &&
        ((this.#t = e),
        this.listeners.forEach(r => {
          r(e);
        }));
    }
    isOnline() {
      return this.#t;
    }
  },
  _t = new za();
function cr() {
  let e, t;
  const r = new Promise((i, s) => {
    ((e = i), (t = s));
  });
  ((r.status = 'pending'), r.catch(() => {}));
  function n(i) {
    (Object.assign(r, i), delete r.resolve, delete r.reject);
  }
  return (
    (r.resolve = i => {
      (n({ status: 'fulfilled', value: i }), e(i));
    }),
    (r.reject = i => {
      (n({ status: 'rejected', reason: i }), t(i));
    }),
    r
  );
}
function Va(e) {
  return Math.min(1e3 * 2 ** e, 3e4);
}
function ki(e) {
  return (e ?? 'online') === 'online' ? _t.isOnline() : !0;
}
var Ui = class extends Error {
  constructor(e) {
    (super('CancelledError'),
      (this.revert = e?.revert),
      (this.silent = e?.silent));
  }
};
function Kt(e) {
  return e instanceof Ui;
}
function Bi(e) {
  let t = !1,
    r = 0,
    n = !1,
    i;
  const s = cr(),
    a = d => {
      n || (h(new Ui(d)), e.abort?.());
    },
    o = () => {
      t = !0;
    },
    u = () => {
      t = !1;
    },
    c = () =>
      Sr.isFocused() &&
      (e.networkMode === 'always' || _t.isOnline()) &&
      e.canRun(),
    l = () => ki(e.networkMode) && e.canRun(),
    f = d => {
      n || ((n = !0), e.onSuccess?.(d), i?.(), s.resolve(d));
    },
    h = d => {
      n || ((n = !0), e.onError?.(d), i?.(), s.reject(d));
    },
    p = () =>
      new Promise(d => {
        ((i = v => {
          (n || c()) && d(v);
        }),
          e.onPause?.());
      }).then(() => {
        ((i = void 0), n || e.onContinue?.());
      }),
    g = () => {
      if (n) return;
      let d;
      const v = r === 0 ? e.initialPromise : void 0;
      try {
        d = v ?? e.fn();
      } catch (y) {
        d = Promise.reject(y);
      }
      Promise.resolve(d)
        .then(f)
        .catch(y => {
          if (n) return;
          const m = e.retry ?? (Ne ? 0 : 3),
            w = e.retryDelay ?? Va,
            $ = typeof w == 'function' ? w(r, y) : w,
            O =
              m === !0 ||
              (typeof m == 'number' && r < m) ||
              (typeof m == 'function' && m(r, y));
          if (t || !O) {
            h(y);
            return;
          }
          (r++,
            e.onFail?.(r, y),
            Ga($)
              .then(() => (c() ? void 0 : p()))
              .then(() => {
                t ? h(y) : g();
              }));
        });
    };
  return {
    promise: s,
    cancel: a,
    continue: () => (i?.(), s),
    cancelRetry: o,
    continueRetry: u,
    canStart: l,
    start: () => (l() ? g() : p().then(g), s),
  };
}
var Xa = e => setTimeout(e, 0);
function Ya() {
  let e = [],
    t = 0,
    r = o => {
      o();
    },
    n = o => {
      o();
    },
    i = Xa;
  const s = o => {
      t
        ? e.push(o)
        : i(() => {
            r(o);
          });
    },
    a = () => {
      const o = e;
      ((e = []),
        o.length &&
          i(() => {
            n(() => {
              o.forEach(u => {
                r(u);
              });
            });
          }));
    };
  return {
    batch: o => {
      let u;
      t++;
      try {
        u = o();
      } finally {
        (t--, t || a());
      }
      return u;
    },
    batchCalls:
      o =>
      (...u) => {
        s(() => {
          o(...u);
        });
      },
    schedule: s,
    setNotifyFunction: o => {
      r = o;
    },
    setBatchNotifyFunction: o => {
      n = o;
    },
    setScheduler: o => {
      i = o;
    },
  };
}
var G = Ya(),
  Hi = class {
    #t;
    destroy() {
      this.clearGcTimeout();
    }
    scheduleGc() {
      (this.clearGcTimeout(),
        sr(this.gcTime) &&
          (this.#t = setTimeout(() => {
            this.optionalRemove();
          }, this.gcTime)));
    }
    updateGcTime(e) {
      this.gcTime = Math.max(
        this.gcTime || 0,
        e ?? (Ne ? 1 / 0 : 5 * 60 * 1e3)
      );
    }
    clearGcTimeout() {
      this.#t && (clearTimeout(this.#t), (this.#t = void 0));
    }
  },
  Ja = class extends Hi {
    #t;
    #e;
    #r;
    #n;
    #i;
    #o;
    #a;
    constructor(e) {
      (super(),
        (this.#a = !1),
        (this.#o = e.defaultOptions),
        this.setOptions(e.options),
        (this.observers = []),
        (this.#n = e.client),
        (this.#r = this.#n.getQueryCache()),
        (this.queryKey = e.queryKey),
        (this.queryHash = e.queryHash),
        (this.#t = Za(this.options)),
        (this.state = e.state ?? this.#t),
        this.scheduleGc());
    }
    get meta() {
      return this.options.meta;
    }
    get promise() {
      return this.#i?.promise;
    }
    setOptions(e) {
      ((this.options = { ...this.#o, ...e }),
        this.updateGcTime(this.options.gcTime));
    }
    optionalRemove() {
      !this.observers.length &&
        this.state.fetchStatus === 'idle' &&
        this.#r.remove(this);
    }
    setData(e, t) {
      const r = ur(this.state.data, e, this.options);
      return (
        this.#s({
          data: r,
          type: 'success',
          dataUpdatedAt: t?.updatedAt,
          manual: t?.manual,
        }),
        r
      );
    }
    setState(e, t) {
      this.#s({ type: 'setState', state: e, setStateOptions: t });
    }
    cancel(e) {
      const t = this.#i?.promise;
      return (this.#i?.cancel(e), t ? t.then(Z).catch(Z) : Promise.resolve());
    }
    destroy() {
      (super.destroy(), this.cancel({ silent: !0 }));
    }
    reset() {
      (this.destroy(), this.setState(this.#t));
    }
    isActive() {
      return this.observers.some(e => re(e.options.enabled, this) !== !1);
    }
    isDisabled() {
      return this.getObserversCount() > 0
        ? !this.isActive()
        : this.options.queryFn === Ar ||
            this.state.dataUpdateCount + this.state.errorUpdateCount === 0;
    }
    isStale() {
      return this.state.isInvalidated
        ? !0
        : this.getObserversCount() > 0
          ? this.observers.some(e => e.getCurrentResult().isStale)
          : this.state.data === void 0;
    }
    isStaleByTime(e = 0) {
      return (
        this.state.isInvalidated ||
        this.state.data === void 0 ||
        !ji(this.state.dataUpdatedAt, e)
      );
    }
    onFocus() {
      (this.observers
        .find(t => t.shouldFetchOnWindowFocus())
        ?.refetch({ cancelRefetch: !1 }),
        this.#i?.continue());
    }
    onOnline() {
      (this.observers
        .find(t => t.shouldFetchOnReconnect())
        ?.refetch({ cancelRefetch: !1 }),
        this.#i?.continue());
    }
    addObserver(e) {
      this.observers.includes(e) ||
        (this.observers.push(e),
        this.clearGcTimeout(),
        this.#r.notify({ type: 'observerAdded', query: this, observer: e }));
    }
    removeObserver(e) {
      this.observers.includes(e) &&
        ((this.observers = this.observers.filter(t => t !== e)),
        this.observers.length ||
          (this.#i &&
            (this.#a ? this.#i.cancel({ revert: !0 }) : this.#i.cancelRetry()),
          this.scheduleGc()),
        this.#r.notify({ type: 'observerRemoved', query: this, observer: e }));
    }
    getObserversCount() {
      return this.observers.length;
    }
    invalidate() {
      this.state.isInvalidated || this.#s({ type: 'invalidate' });
    }
    fetch(e, t) {
      if (this.state.fetchStatus !== 'idle') {
        if (this.state.data !== void 0 && t?.cancelRefetch)
          this.cancel({ silent: !0 });
        else if (this.#i) return (this.#i.continueRetry(), this.#i.promise);
      }
      if ((e && this.setOptions(e), !this.options.queryFn)) {
        const o = this.observers.find(u => u.options.queryFn);
        o && this.setOptions(o.options);
      }
      const r = new AbortController(),
        n = o => {
          Object.defineProperty(o, 'signal', {
            enumerable: !0,
            get: () => ((this.#a = !0), r.signal),
          });
        },
        i = () => {
          const o = qi(this.options, t),
            u = { client: this.#n, queryKey: this.queryKey, meta: this.meta };
          return (
            n(u),
            (this.#a = !1),
            this.options.persister ? this.options.persister(o, u, this) : o(u)
          );
        },
        s = {
          fetchOptions: t,
          options: this.options,
          queryKey: this.queryKey,
          client: this.#n,
          state: this.state,
          fetchFn: i,
        };
      (n(s),
        this.options.behavior?.onFetch(s, this),
        (this.#e = this.state),
        (this.state.fetchStatus === 'idle' ||
          this.state.fetchMeta !== s.fetchOptions?.meta) &&
          this.#s({ type: 'fetch', meta: s.fetchOptions?.meta }));
      const a = o => {
        ((Kt(o) && o.silent) || this.#s({ type: 'error', error: o }),
          Kt(o) ||
            (this.#r.config.onError?.(o, this),
            this.#r.config.onSettled?.(this.state.data, o, this)),
          this.scheduleGc());
      };
      return (
        (this.#i = Bi({
          initialPromise: t?.initialPromise,
          fn: s.fetchFn,
          abort: r.abort.bind(r),
          onSuccess: o => {
            if (o === void 0) {
              a(new Error(`${this.queryHash} data is undefined`));
              return;
            }
            try {
              this.setData(o);
            } catch (u) {
              a(u);
              return;
            }
            (this.#r.config.onSuccess?.(o, this),
              this.#r.config.onSettled?.(o, this.state.error, this),
              this.scheduleGc());
          },
          onError: a,
          onFail: (o, u) => {
            this.#s({ type: 'failed', failureCount: o, error: u });
          },
          onPause: () => {
            this.#s({ type: 'pause' });
          },
          onContinue: () => {
            this.#s({ type: 'continue' });
          },
          retry: s.options.retry,
          retryDelay: s.options.retryDelay,
          networkMode: s.options.networkMode,
          canRun: () => !0,
        })),
        this.#i.start()
      );
    }
    #s(e) {
      const t = r => {
        switch (e.type) {
          case 'failed':
            return {
              ...r,
              fetchFailureCount: e.failureCount,
              fetchFailureReason: e.error,
            };
          case 'pause':
            return { ...r, fetchStatus: 'paused' };
          case 'continue':
            return { ...r, fetchStatus: 'fetching' };
          case 'fetch':
            return {
              ...r,
              ...Gi(r.data, this.options),
              fetchMeta: e.meta ?? null,
            };
          case 'success':
            return {
              ...r,
              data: e.data,
              dataUpdateCount: r.dataUpdateCount + 1,
              dataUpdatedAt: e.dataUpdatedAt ?? Date.now(),
              error: null,
              isInvalidated: !1,
              status: 'success',
              ...(!e.manual && {
                fetchStatus: 'idle',
                fetchFailureCount: 0,
                fetchFailureReason: null,
              }),
            };
          case 'error':
            const n = e.error;
            return Kt(n) && n.revert && this.#e
              ? { ...this.#e, fetchStatus: 'idle' }
              : {
                  ...r,
                  error: n,
                  errorUpdateCount: r.errorUpdateCount + 1,
                  errorUpdatedAt: Date.now(),
                  fetchFailureCount: r.fetchFailureCount + 1,
                  fetchFailureReason: n,
                  fetchStatus: 'idle',
                  status: 'error',
                };
          case 'invalidate':
            return { ...r, isInvalidated: !0 };
          case 'setState':
            return { ...r, ...e.state };
        }
      };
      ((this.state = t(this.state)),
        G.batch(() => {
          (this.observers.forEach(r => {
            r.onQueryUpdate();
          }),
            this.#r.notify({ query: this, type: 'updated', action: e }));
        }));
    }
  };
function Gi(e, t) {
  return {
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchStatus: ki(t.networkMode) ? 'fetching' : 'paused',
    ...(e === void 0 && { error: null, status: 'pending' }),
  };
}
function Za(e) {
  const t =
      typeof e.initialData == 'function' ? e.initialData() : e.initialData,
    r = t !== void 0,
    n = r
      ? typeof e.initialDataUpdatedAt == 'function'
        ? e.initialDataUpdatedAt()
        : e.initialDataUpdatedAt
      : 0;
  return {
    data: t,
    dataUpdateCount: 0,
    dataUpdatedAt: r ? (n ?? Date.now()) : 0,
    error: null,
    errorUpdateCount: 0,
    errorUpdatedAt: 0,
    fetchFailureCount: 0,
    fetchFailureReason: null,
    fetchMeta: null,
    isInvalidated: !1,
    status: r ? 'success' : 'pending',
    fetchStatus: 'idle',
  };
}
var eo = class extends at {
    constructor(e = {}) {
      (super(), (this.config = e), (this.#t = new Map()));
    }
    #t;
    build(e, t, r) {
      const n = t.queryKey,
        i = t.queryHash ?? Er(n, t);
      let s = this.get(i);
      return (
        s ||
          ((s = new Ja({
            client: e,
            queryKey: n,
            queryHash: i,
            options: e.defaultQueryOptions(t),
            state: r,
            defaultOptions: e.getQueryDefaults(n),
          })),
          this.add(s)),
        s
      );
    }
    add(e) {
      this.#t.has(e.queryHash) ||
        (this.#t.set(e.queryHash, e), this.notify({ type: 'added', query: e }));
    }
    remove(e) {
      const t = this.#t.get(e.queryHash);
      t &&
        (e.destroy(),
        t === e && this.#t.delete(e.queryHash),
        this.notify({ type: 'removed', query: e }));
    }
    clear() {
      G.batch(() => {
        this.getAll().forEach(e => {
          this.remove(e);
        });
      });
    }
    get(e) {
      return this.#t.get(e);
    }
    getAll() {
      return [...this.#t.values()];
    }
    find(e) {
      const t = { exact: !0, ...e };
      return this.getAll().find(r => cn(t, r));
    }
    findAll(e = {}) {
      const t = this.getAll();
      return Object.keys(e).length > 0 ? t.filter(r => cn(e, r)) : t;
    }
    notify(e) {
      G.batch(() => {
        this.listeners.forEach(t => {
          t(e);
        });
      });
    }
    onFocus() {
      G.batch(() => {
        this.getAll().forEach(e => {
          e.onFocus();
        });
      });
    }
    onOnline() {
      G.batch(() => {
        this.getAll().forEach(e => {
          e.onOnline();
        });
      });
    }
  },
  to = class extends Hi {
    #t;
    #e;
    #r;
    constructor(e) {
      (super(),
        (this.mutationId = e.mutationId),
        (this.#e = e.mutationCache),
        (this.#t = []),
        (this.state = e.state || ro()),
        this.setOptions(e.options),
        this.scheduleGc());
    }
    setOptions(e) {
      ((this.options = e), this.updateGcTime(this.options.gcTime));
    }
    get meta() {
      return this.options.meta;
    }
    addObserver(e) {
      this.#t.includes(e) ||
        (this.#t.push(e),
        this.clearGcTimeout(),
        this.#e.notify({ type: 'observerAdded', mutation: this, observer: e }));
    }
    removeObserver(e) {
      ((this.#t = this.#t.filter(t => t !== e)),
        this.scheduleGc(),
        this.#e.notify({
          type: 'observerRemoved',
          mutation: this,
          observer: e,
        }));
    }
    optionalRemove() {
      this.#t.length ||
        (this.state.status === 'pending'
          ? this.scheduleGc()
          : this.#e.remove(this));
    }
    continue() {
      return this.#r?.continue() ?? this.execute(this.state.variables);
    }
    async execute(e) {
      const t = () => {
        this.#n({ type: 'continue' });
      };
      this.#r = Bi({
        fn: () =>
          this.options.mutationFn
            ? this.options.mutationFn(e)
            : Promise.reject(new Error('No mutationFn found')),
        onFail: (i, s) => {
          this.#n({ type: 'failed', failureCount: i, error: s });
        },
        onPause: () => {
          this.#n({ type: 'pause' });
        },
        onContinue: t,
        retry: this.options.retry ?? 0,
        retryDelay: this.options.retryDelay,
        networkMode: this.options.networkMode,
        canRun: () => this.#e.canRun(this),
      });
      const r = this.state.status === 'pending',
        n = !this.#r.canStart();
      try {
        if (r) t();
        else {
          (this.#n({ type: 'pending', variables: e, isPaused: n }),
            await this.#e.config.onMutate?.(e, this));
          const s = await this.options.onMutate?.(e);
          s !== this.state.context &&
            this.#n({ type: 'pending', context: s, variables: e, isPaused: n });
        }
        const i = await this.#r.start();
        return (
          await this.#e.config.onSuccess?.(i, e, this.state.context, this),
          await this.options.onSuccess?.(i, e, this.state.context),
          await this.#e.config.onSettled?.(
            i,
            null,
            this.state.variables,
            this.state.context,
            this
          ),
          await this.options.onSettled?.(i, null, e, this.state.context),
          this.#n({ type: 'success', data: i }),
          i
        );
      } catch (i) {
        try {
          throw (
            await this.#e.config.onError?.(i, e, this.state.context, this),
            await this.options.onError?.(i, e, this.state.context),
            await this.#e.config.onSettled?.(
              void 0,
              i,
              this.state.variables,
              this.state.context,
              this
            ),
            await this.options.onSettled?.(void 0, i, e, this.state.context),
            i
          );
        } finally {
          this.#n({ type: 'error', error: i });
        }
      } finally {
        this.#e.runNext(this);
      }
    }
    #n(e) {
      const t = r => {
        switch (e.type) {
          case 'failed':
            return {
              ...r,
              failureCount: e.failureCount,
              failureReason: e.error,
            };
          case 'pause':
            return { ...r, isPaused: !0 };
          case 'continue':
            return { ...r, isPaused: !1 };
          case 'pending':
            return {
              ...r,
              context: e.context,
              data: void 0,
              failureCount: 0,
              failureReason: null,
              error: null,
              isPaused: e.isPaused,
              status: 'pending',
              variables: e.variables,
              submittedAt: Date.now(),
            };
          case 'success':
            return {
              ...r,
              data: e.data,
              failureCount: 0,
              failureReason: null,
              error: null,
              status: 'success',
              isPaused: !1,
            };
          case 'error':
            return {
              ...r,
              data: void 0,
              error: e.error,
              failureCount: r.failureCount + 1,
              failureReason: e.error,
              isPaused: !1,
              status: 'error',
            };
        }
      };
      ((this.state = t(this.state)),
        G.batch(() => {
          (this.#t.forEach(r => {
            r.onMutationUpdate(e);
          }),
            this.#e.notify({ mutation: this, type: 'updated', action: e }));
        }));
    }
  };
function ro() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: !1,
    status: 'idle',
    variables: void 0,
    submittedAt: 0,
  };
}
var no = class extends at {
  constructor(e = {}) {
    (super(),
      (this.config = e),
      (this.#t = new Set()),
      (this.#e = new Map()),
      (this.#r = 0));
  }
  #t;
  #e;
  #r;
  build(e, t, r) {
    const n = new to({
      mutationCache: this,
      mutationId: ++this.#r,
      options: e.defaultMutationOptions(t),
      state: r,
    });
    return (this.add(n), n);
  }
  add(e) {
    this.#t.add(e);
    const t = dt(e);
    if (typeof t == 'string') {
      const r = this.#e.get(t);
      r ? r.push(e) : this.#e.set(t, [e]);
    }
    this.notify({ type: 'added', mutation: e });
  }
  remove(e) {
    if (this.#t.delete(e)) {
      const t = dt(e);
      if (typeof t == 'string') {
        const r = this.#e.get(t);
        if (r)
          if (r.length > 1) {
            const n = r.indexOf(e);
            n !== -1 && r.splice(n, 1);
          } else r[0] === e && this.#e.delete(t);
      }
    }
    this.notify({ type: 'removed', mutation: e });
  }
  canRun(e) {
    const t = dt(e);
    if (typeof t == 'string') {
      const n = this.#e.get(t)?.find(i => i.state.status === 'pending');
      return !n || n === e;
    } else return !0;
  }
  runNext(e) {
    const t = dt(e);
    return typeof t == 'string'
      ? (this.#e
          .get(t)
          ?.find(n => n !== e && n.state.isPaused)
          ?.continue() ?? Promise.resolve())
      : Promise.resolve();
  }
  clear() {
    G.batch(() => {
      (this.#t.forEach(e => {
        this.notify({ type: 'removed', mutation: e });
      }),
        this.#t.clear(),
        this.#e.clear());
    });
  }
  getAll() {
    return Array.from(this.#t);
  }
  find(e) {
    const t = { exact: !0, ...e };
    return this.getAll().find(r => ln(t, r));
  }
  findAll(e = {}) {
    return this.getAll().filter(t => ln(e, t));
  }
  notify(e) {
    G.batch(() => {
      this.listeners.forEach(t => {
        t(e);
      });
    });
  }
  resumePausedMutations() {
    const e = this.getAll().filter(t => t.state.isPaused);
    return G.batch(() => Promise.all(e.map(t => t.continue().catch(Z))));
  }
};
function dt(e) {
  return e.options.scope?.id;
}
function dn(e) {
  return {
    onFetch: (t, r) => {
      const n = t.options,
        i = t.fetchOptions?.meta?.fetchMore?.direction,
        s = t.state.data?.pages || [],
        a = t.state.data?.pageParams || [];
      let o = { pages: [], pageParams: [] },
        u = 0;
      const c = async () => {
        let l = !1;
        const f = g => {
            Object.defineProperty(g, 'signal', {
              enumerable: !0,
              get: () => (
                t.signal.aborted
                  ? (l = !0)
                  : t.signal.addEventListener('abort', () => {
                      l = !0;
                    }),
                t.signal
              ),
            });
          },
          h = qi(t.options, t.fetchOptions),
          p = async (g, d, v) => {
            if (l) return Promise.reject();
            if (d == null && g.pages.length) return Promise.resolve(g);
            const y = {
              client: t.client,
              queryKey: t.queryKey,
              pageParam: d,
              direction: v ? 'backward' : 'forward',
              meta: t.options.meta,
            };
            f(y);
            const m = await h(y),
              { maxPages: w } = t.options,
              $ = v ? Ka : Wa;
            return {
              pages: $(g.pages, m, w),
              pageParams: $(g.pageParams, d, w),
            };
          };
        if (i && s.length) {
          const g = i === 'backward',
            d = g ? io : pn,
            v = { pages: s, pageParams: a },
            y = d(n, v);
          o = await p(v, y, g);
        } else {
          const g = e ?? s.length;
          do {
            const d = u === 0 ? (a[0] ?? n.initialPageParam) : pn(n, o);
            if (u > 0 && d == null) break;
            ((o = await p(o, d)), u++);
          } while (u < g);
        }
        return o;
      };
      t.options.persister
        ? (t.fetchFn = () =>
            t.options.persister?.(
              c,
              {
                client: t.client,
                queryKey: t.queryKey,
                meta: t.options.meta,
                signal: t.signal,
              },
              r
            ))
        : (t.fetchFn = c);
    },
  };
}
function pn(e, { pages: t, pageParams: r }) {
  const n = t.length - 1;
  return t.length > 0 ? e.getNextPageParam(t[n], t, r[n], r) : void 0;
}
function io(e, { pages: t, pageParams: r }) {
  return t.length > 0 ? e.getPreviousPageParam?.(t[0], t, r[0], r) : void 0;
}
var s_ = class {
    #t;
    #e;
    #r;
    #n;
    #i;
    #o;
    #a;
    #s;
    constructor(e = {}) {
      ((this.#t = e.queryCache || new eo()),
        (this.#e = e.mutationCache || new no()),
        (this.#r = e.defaultOptions || {}),
        (this.#n = new Map()),
        (this.#i = new Map()),
        (this.#o = 0));
    }
    mount() {
      (this.#o++,
        this.#o === 1 &&
          ((this.#a = Sr.subscribe(async e => {
            e && (await this.resumePausedMutations(), this.#t.onFocus());
          })),
          (this.#s = _t.subscribe(async e => {
            e && (await this.resumePausedMutations(), this.#t.onOnline());
          }))));
    }
    unmount() {
      (this.#o--,
        this.#o === 0 &&
          (this.#a?.(), (this.#a = void 0), this.#s?.(), (this.#s = void 0)));
    }
    isFetching(e) {
      return this.#t.findAll({ ...e, fetchStatus: 'fetching' }).length;
    }
    isMutating(e) {
      return this.#e.findAll({ ...e, status: 'pending' }).length;
    }
    getQueryData(e) {
      const t = this.defaultQueryOptions({ queryKey: e });
      return this.#t.get(t.queryHash)?.state.data;
    }
    ensureQueryData(e) {
      const t = this.defaultQueryOptions(e),
        r = this.#t.build(this, t),
        n = r.state.data;
      return n === void 0
        ? this.fetchQuery(e)
        : (e.revalidateIfStale &&
            r.isStaleByTime(Ie(t.staleTime, r)) &&
            this.prefetchQuery(t),
          Promise.resolve(n));
    }
    getQueriesData(e) {
      return this.#t.findAll(e).map(({ queryKey: t, state: r }) => {
        const n = r.data;
        return [t, n];
      });
    }
    setQueryData(e, t, r) {
      const n = this.defaultQueryOptions({ queryKey: e }),
        s = this.#t.get(n.queryHash)?.state.data,
        a = Ha(t, s);
      if (a !== void 0)
        return this.#t.build(this, n).setData(a, { ...r, manual: !0 });
    }
    setQueriesData(e, t, r) {
      return G.batch(() =>
        this.#t
          .findAll(e)
          .map(({ queryKey: n }) => [n, this.setQueryData(n, t, r)])
      );
    }
    getQueryState(e) {
      const t = this.defaultQueryOptions({ queryKey: e });
      return this.#t.get(t.queryHash)?.state;
    }
    removeQueries(e) {
      const t = this.#t;
      G.batch(() => {
        t.findAll(e).forEach(r => {
          t.remove(r);
        });
      });
    }
    resetQueries(e, t) {
      const r = this.#t;
      return G.batch(
        () => (
          r.findAll(e).forEach(n => {
            n.reset();
          }),
          this.refetchQueries({ type: 'active', ...e }, t)
        )
      );
    }
    cancelQueries(e, t = {}) {
      const r = { revert: !0, ...t },
        n = G.batch(() => this.#t.findAll(e).map(i => i.cancel(r)));
      return Promise.all(n).then(Z).catch(Z);
    }
    invalidateQueries(e, t = {}) {
      return G.batch(
        () => (
          this.#t.findAll(e).forEach(r => {
            r.invalidate();
          }),
          e?.refetchType === 'none'
            ? Promise.resolve()
            : this.refetchQueries(
                { ...e, type: e?.refetchType ?? e?.type ?? 'active' },
                t
              )
        )
      );
    }
    refetchQueries(e, t = {}) {
      const r = { ...t, cancelRefetch: t.cancelRefetch ?? !0 },
        n = G.batch(() =>
          this.#t
            .findAll(e)
            .filter(i => !i.isDisabled())
            .map(i => {
              let s = i.fetch(void 0, r);
              return (
                r.throwOnError || (s = s.catch(Z)),
                i.state.fetchStatus === 'paused' ? Promise.resolve() : s
              );
            })
        );
      return Promise.all(n).then(Z);
    }
    fetchQuery(e) {
      const t = this.defaultQueryOptions(e);
      t.retry === void 0 && (t.retry = !1);
      const r = this.#t.build(this, t);
      return r.isStaleByTime(Ie(t.staleTime, r))
        ? r.fetch(t)
        : Promise.resolve(r.state.data);
    }
    prefetchQuery(e) {
      return this.fetchQuery(e).then(Z).catch(Z);
    }
    fetchInfiniteQuery(e) {
      return ((e.behavior = dn(e.pages)), this.fetchQuery(e));
    }
    prefetchInfiniteQuery(e) {
      return this.fetchInfiniteQuery(e).then(Z).catch(Z);
    }
    ensureInfiniteQueryData(e) {
      return ((e.behavior = dn(e.pages)), this.ensureQueryData(e));
    }
    resumePausedMutations() {
      return _t.isOnline()
        ? this.#e.resumePausedMutations()
        : Promise.resolve();
    }
    getQueryCache() {
      return this.#t;
    }
    getMutationCache() {
      return this.#e;
    }
    getDefaultOptions() {
      return this.#r;
    }
    setDefaultOptions(e) {
      this.#r = e;
    }
    setQueryDefaults(e, t) {
      this.#n.set(et(e), { queryKey: e, defaultOptions: t });
    }
    getQueryDefaults(e) {
      const t = [...this.#n.values()],
        r = {};
      return (
        t.forEach(n => {
          tt(e, n.queryKey) && Object.assign(r, n.defaultOptions);
        }),
        r
      );
    }
    setMutationDefaults(e, t) {
      this.#i.set(et(e), { mutationKey: e, defaultOptions: t });
    }
    getMutationDefaults(e) {
      const t = [...this.#i.values()],
        r = {};
      return (
        t.forEach(n => {
          tt(e, n.mutationKey) && Object.assign(r, n.defaultOptions);
        }),
        r
      );
    }
    defaultQueryOptions(e) {
      if (e._defaulted) return e;
      const t = {
        ...this.#r.queries,
        ...this.getQueryDefaults(e.queryKey),
        ...e,
        _defaulted: !0,
      };
      return (
        t.queryHash || (t.queryHash = Er(t.queryKey, t)),
        t.refetchOnReconnect === void 0 &&
          (t.refetchOnReconnect = t.networkMode !== 'always'),
        t.throwOnError === void 0 && (t.throwOnError = !!t.suspense),
        !t.networkMode && t.persister && (t.networkMode = 'offlineFirst'),
        t.queryFn === Ar && (t.enabled = !1),
        t
      );
    }
    defaultMutationOptions(e) {
      return e?._defaulted
        ? e
        : {
            ...this.#r.mutations,
            ...(e?.mutationKey && this.getMutationDefaults(e.mutationKey)),
            ...e,
            _defaulted: !0,
          };
    }
    clear() {
      (this.#t.clear(), this.#e.clear());
    }
  },
  a_ = class extends at {
    constructor(e, t) {
      (super(),
        (this.options = t),
        (this.#t = e),
        (this.#s = null),
        (this.#a = cr()),
        this.options.experimental_prefetchInRender ||
          this.#a.reject(
            new Error(
              'experimental_prefetchInRender feature flag is not enabled'
            )
          ),
        this.bindMethods(),
        this.setOptions(t));
    }
    #t;
    #e = void 0;
    #r = void 0;
    #n = void 0;
    #i;
    #o;
    #a;
    #s;
    #v;
    #h;
    #d;
    #c;
    #l;
    #u;
    #p = new Set();
    bindMethods() {
      this.refetch = this.refetch.bind(this);
    }
    onSubscribe() {
      this.listeners.size === 1 &&
        (this.#e.addObserver(this),
        vn(this.#e, this.options) ? this.#f() : this.updateResult(),
        this.#b());
    }
    onUnsubscribe() {
      this.hasListeners() || this.destroy();
    }
    shouldFetchOnReconnect() {
      return lr(this.#e, this.options, this.options.refetchOnReconnect);
    }
    shouldFetchOnWindowFocus() {
      return lr(this.#e, this.options, this.options.refetchOnWindowFocus);
    }
    destroy() {
      ((this.listeners = new Set()),
        this.#w(),
        this.#_(),
        this.#e.removeObserver(this));
    }
    setOptions(e) {
      const t = this.options,
        r = this.#e;
      if (
        ((this.options = this.#t.defaultQueryOptions(e)),
        this.options.enabled !== void 0 &&
          typeof this.options.enabled != 'boolean' &&
          typeof this.options.enabled != 'function' &&
          typeof re(this.options.enabled, this.#e) != 'boolean')
      )
        throw new Error(
          'Expected enabled to be a boolean or a callback that returns a boolean'
        );
      (this.#$(),
        this.#e.setOptions(this.options),
        t._defaulted &&
          !ar(this.options, t) &&
          this.#t
            .getQueryCache()
            .notify({
              type: 'observerOptionsUpdated',
              query: this.#e,
              observer: this,
            }));
      const n = this.hasListeners();
      (n && gn(this.#e, r, this.options, t) && this.#f(),
        this.updateResult(),
        n &&
          (this.#e !== r ||
            re(this.options.enabled, this.#e) !== re(t.enabled, this.#e) ||
            Ie(this.options.staleTime, this.#e) !== Ie(t.staleTime, this.#e)) &&
          this.#g());
      const i = this.#y();
      n &&
        (this.#e !== r ||
          re(this.options.enabled, this.#e) !== re(t.enabled, this.#e) ||
          i !== this.#u) &&
        this.#m(i);
    }
    getOptimisticResult(e) {
      const t = this.#t.getQueryCache().build(this.#t, e),
        r = this.createResult(t, e);
      return (
        ao(this, r) &&
          ((this.#n = r), (this.#o = this.options), (this.#i = this.#e.state)),
        r
      );
    }
    getCurrentResult() {
      return this.#n;
    }
    trackResult(e, t) {
      return new Proxy(e, {
        get: (r, n) => (this.trackProp(n), t?.(n), Reflect.get(r, n)),
      });
    }
    trackProp(e) {
      this.#p.add(e);
    }
    getCurrentQuery() {
      return this.#e;
    }
    refetch({ ...e } = {}) {
      return this.fetch({ ...e });
    }
    fetchOptimistic(e) {
      const t = this.#t.defaultQueryOptions(e),
        r = this.#t.getQueryCache().build(this.#t, t);
      return r.fetch().then(() => this.createResult(r, t));
    }
    fetch(e) {
      return this.#f({ ...e, cancelRefetch: e.cancelRefetch ?? !0 }).then(
        () => (this.updateResult(), this.#n)
      );
    }
    #f(e) {
      this.#$();
      let t = this.#e.fetch(this.options, e);
      return (e?.throwOnError || (t = t.catch(Z)), t);
    }
    #g() {
      this.#w();
      const e = Ie(this.options.staleTime, this.#e);
      if (Ne || this.#n.isStale || !sr(e)) return;
      const r = ji(this.#n.dataUpdatedAt, e) + 1;
      this.#c = setTimeout(() => {
        this.#n.isStale || this.updateResult();
      }, r);
    }
    #y() {
      return (
        (typeof this.options.refetchInterval == 'function'
          ? this.options.refetchInterval(this.#e)
          : this.options.refetchInterval) ?? !1
      );
    }
    #m(e) {
      (this.#_(),
        (this.#u = e),
        !(
          Ne ||
          re(this.options.enabled, this.#e) === !1 ||
          !sr(this.#u) ||
          this.#u === 0
        ) &&
          (this.#l = setInterval(() => {
            (this.options.refetchIntervalInBackground || Sr.isFocused()) &&
              this.#f();
          }, this.#u)));
    }
    #b() {
      (this.#g(), this.#m(this.#y()));
    }
    #w() {
      this.#c && (clearTimeout(this.#c), (this.#c = void 0));
    }
    #_() {
      this.#l && (clearInterval(this.#l), (this.#l = void 0));
    }
    createResult(e, t) {
      const r = this.#e,
        n = this.options,
        i = this.#n,
        s = this.#i,
        a = this.#o,
        u = e !== r ? e.state : this.#r,
        { state: c } = e;
      let l = { ...c },
        f = !1,
        h;
      if (t._optimisticResults) {
        const C = this.hasListeners(),
          I = !C && vn(e, t),
          j = C && gn(e, r, t, n);
        ((I || j) && (l = { ...l, ...Gi(c.data, e.options) }),
          t._optimisticResults === 'isRestoring' && (l.fetchStatus = 'idle'));
      }
      let { error: p, errorUpdatedAt: g, status: d } = l;
      h = l.data;
      let v = !1;
      if (t.placeholderData !== void 0 && h === void 0 && d === 'pending') {
        let C;
        (i?.isPlaceholderData && t.placeholderData === a?.placeholderData
          ? ((C = i.data), (v = !0))
          : (C =
              typeof t.placeholderData == 'function'
                ? t.placeholderData(this.#d?.state.data, this.#d)
                : t.placeholderData),
          C !== void 0 && ((d = 'success'), (h = ur(i?.data, C, t)), (f = !0)));
      }
      if (t.select && h !== void 0 && !v)
        if (i && h === s?.data && t.select === this.#v) h = this.#h;
        else
          try {
            ((this.#v = t.select),
              (h = t.select(h)),
              (h = ur(i?.data, h, t)),
              (this.#h = h),
              (this.#s = null));
          } catch (C) {
            this.#s = C;
          }
      this.#s &&
        ((p = this.#s), (h = this.#h), (g = Date.now()), (d = 'error'));
      const y = l.fetchStatus === 'fetching',
        m = d === 'pending',
        w = d === 'error',
        $ = m && y,
        O = h !== void 0,
        E = {
          status: d,
          fetchStatus: l.fetchStatus,
          isPending: m,
          isSuccess: d === 'success',
          isError: w,
          isInitialLoading: $,
          isLoading: $,
          data: h,
          dataUpdatedAt: l.dataUpdatedAt,
          error: p,
          errorUpdatedAt: g,
          failureCount: l.fetchFailureCount,
          failureReason: l.fetchFailureReason,
          errorUpdateCount: l.errorUpdateCount,
          isFetched: l.dataUpdateCount > 0 || l.errorUpdateCount > 0,
          isFetchedAfterMount:
            l.dataUpdateCount > u.dataUpdateCount ||
            l.errorUpdateCount > u.errorUpdateCount,
          isFetching: y,
          isRefetching: y && !m,
          isLoadingError: w && !O,
          isPaused: l.fetchStatus === 'paused',
          isPlaceholderData: f,
          isRefetchError: w && O,
          isStale: xr(e, t),
          refetch: this.refetch,
          promise: this.#a,
        };
      if (this.options.experimental_prefetchInRender) {
        const C = R => {
            E.status === 'error'
              ? R.reject(E.error)
              : E.data !== void 0 && R.resolve(E.data);
          },
          I = () => {
            const R = (this.#a = E.promise = cr());
            C(R);
          },
          j = this.#a;
        switch (j.status) {
          case 'pending':
            e.queryHash === r.queryHash && C(j);
            break;
          case 'fulfilled':
            (E.status === 'error' || E.data !== j.value) && I();
            break;
          case 'rejected':
            (E.status !== 'error' || E.error !== j.reason) && I();
            break;
        }
      }
      return E;
    }
    updateResult() {
      const e = this.#n,
        t = this.createResult(this.#e, this.options);
      if (
        ((this.#i = this.#e.state),
        (this.#o = this.options),
        this.#i.data !== void 0 && (this.#d = this.#e),
        ar(t, e))
      )
        return;
      this.#n = t;
      const r = () => {
        if (!e) return !0;
        const { notifyOnChangeProps: n } = this.options,
          i = typeof n == 'function' ? n() : n;
        if (i === 'all' || (!i && !this.#p.size)) return !0;
        const s = new Set(i ?? this.#p);
        return (
          this.options.throwOnError && s.add('error'),
          Object.keys(this.#n).some(a => {
            const o = a;
            return this.#n[o] !== e[o] && s.has(o);
          })
        );
      };
      this.#O({ listeners: r() });
    }
    #$() {
      const e = this.#t.getQueryCache().build(this.#t, this.options);
      if (e === this.#e) return;
      const t = this.#e;
      ((this.#e = e),
        (this.#r = e.state),
        this.hasListeners() && (t?.removeObserver(this), e.addObserver(this)));
    }
    onQueryUpdate() {
      (this.updateResult(), this.hasListeners() && this.#b());
    }
    #O(e) {
      G.batch(() => {
        (e.listeners &&
          this.listeners.forEach(t => {
            t(this.#n);
          }),
          this.#t
            .getQueryCache()
            .notify({ query: this.#e, type: 'observerResultsUpdated' }));
      });
    }
  };
function so(e, t) {
  return (
    re(t.enabled, e) !== !1 &&
    e.state.data === void 0 &&
    !(e.state.status === 'error' && t.retryOnMount === !1)
  );
}
function vn(e, t) {
  return so(e, t) || (e.state.data !== void 0 && lr(e, t, t.refetchOnMount));
}
function lr(e, t, r) {
  if (re(t.enabled, e) !== !1) {
    const n = typeof r == 'function' ? r(e) : r;
    return n === 'always' || (n !== !1 && xr(e, t));
  }
  return !1;
}
function gn(e, t, r, n) {
  return (
    (e !== t || re(n.enabled, e) === !1) &&
    (!r.suspense || e.state.status !== 'error') &&
    xr(e, r)
  );
}
function xr(e, t) {
  return re(t.enabled, e) !== !1 && e.isStaleByTime(Ie(t.staleTime, e));
}
function ao(e, t) {
  return !ar(e.getCurrentResult(), t);
}
var oo = Array.isArray,
  K = oo,
  uo = typeof ht == 'object' && ht && ht.Object === Object && ht,
  Wi = uo,
  co = Wi,
  lo = typeof self == 'object' && self && self.Object === Object && self,
  fo = co || lo || Function('return this')(),
  ce = fo,
  ho = ce,
  po = ho.Symbol,
  ot = po,
  yn = ot,
  Ki = Object.prototype,
  vo = Ki.hasOwnProperty,
  go = Ki.toString,
  Ye = yn ? yn.toStringTag : void 0;
function yo(e) {
  var t = vo.call(e, Ye),
    r = e[Ye];
  try {
    e[Ye] = void 0;
    var n = !0;
  } catch {}
  var i = go.call(e);
  return (n && (t ? (e[Ye] = r) : delete e[Ye]), i);
}
var mo = yo,
  bo = Object.prototype,
  wo = bo.toString;
function _o(e) {
  return wo.call(e);
}
var $o = _o,
  mn = ot,
  Oo = mo,
  Eo = $o,
  Ao = '[object Null]',
  So = '[object Undefined]',
  bn = mn ? mn.toStringTag : void 0;
function xo(e) {
  return e == null
    ? e === void 0
      ? So
      : Ao
    : bn && bn in Object(e)
      ? Oo(e)
      : Eo(e);
}
var ge = xo;
function Co(e) {
  return e != null && typeof e == 'object';
}
var ye = Co,
  Po = ge,
  To = ye,
  Ro = '[object Symbol]';
function Lo(e) {
  return typeof e == 'symbol' || (To(e) && Po(e) == Ro);
}
var ke = Lo,
  Mo = K,
  Io = ke,
  Fo = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
  Do = /^\w*$/;
function jo(e, t) {
  if (Mo(e)) return !1;
  var r = typeof e;
  return r == 'number' || r == 'symbol' || r == 'boolean' || e == null || Io(e)
    ? !0
    : Do.test(e) || !Fo.test(e) || (t != null && e in Object(t));
}
var Cr = jo;
function No(e) {
  var t = typeof e;
  return e != null && (t == 'object' || t == 'function');
}
var _e = No;
const o_ = M(_e);
var qo = ge,
  ko = _e,
  Uo = '[object AsyncFunction]',
  Bo = '[object Function]',
  Ho = '[object GeneratorFunction]',
  Go = '[object Proxy]';
function Wo(e) {
  if (!ko(e)) return !1;
  var t = qo(e);
  return t == Bo || t == Ho || t == Uo || t == Go;
}
var Pr = Wo;
const u_ = M(Pr);
var Ko = ce,
  Qo = Ko['__core-js_shared__'],
  zo = Qo,
  Qt = zo,
  wn = (function () {
    var e = /[^.]+$/.exec((Qt && Qt.keys && Qt.keys.IE_PROTO) || '');
    return e ? 'Symbol(src)_1.' + e : '';
  })();
function Vo(e) {
  return !!wn && wn in e;
}
var Xo = Vo,
  Yo = Function.prototype,
  Jo = Yo.toString;
function Zo(e) {
  if (e != null) {
    try {
      return Jo.call(e);
    } catch {}
    try {
      return e + '';
    } catch {}
  }
  return '';
}
var Qi = Zo,
  eu = Pr,
  tu = Xo,
  ru = _e,
  nu = Qi,
  iu = /[\\^$.*+?()[\]{}|]/g,
  su = /^\[object .+?Constructor\]$/,
  au = Function.prototype,
  ou = Object.prototype,
  uu = au.toString,
  cu = ou.hasOwnProperty,
  lu = RegExp(
    '^' +
      uu
        .call(cu)
        .replace(iu, '\\$&')
        .replace(
          /hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,
          '$1.*?'
        ) +
      '$'
  );
function fu(e) {
  if (!ru(e) || tu(e)) return !1;
  var t = eu(e) ? lu : su;
  return t.test(nu(e));
}
var hu = fu;
function du(e, t) {
  return e?.[t];
}
var pu = du,
  vu = hu,
  gu = pu;
function yu(e, t) {
  var r = gu(e, t);
  return vu(r) ? r : void 0;
}
var Te = yu,
  mu = Te,
  bu = mu(Object, 'create'),
  Rt = bu,
  _n = Rt;
function wu() {
  ((this.__data__ = _n ? _n(null) : {}), (this.size = 0));
}
var _u = wu;
function $u(e) {
  var t = this.has(e) && delete this.__data__[e];
  return ((this.size -= t ? 1 : 0), t);
}
var Ou = $u,
  Eu = Rt,
  Au = '__lodash_hash_undefined__',
  Su = Object.prototype,
  xu = Su.hasOwnProperty;
function Cu(e) {
  var t = this.__data__;
  if (Eu) {
    var r = t[e];
    return r === Au ? void 0 : r;
  }
  return xu.call(t, e) ? t[e] : void 0;
}
var Pu = Cu,
  Tu = Rt,
  Ru = Object.prototype,
  Lu = Ru.hasOwnProperty;
function Mu(e) {
  var t = this.__data__;
  return Tu ? t[e] !== void 0 : Lu.call(t, e);
}
var Iu = Mu,
  Fu = Rt,
  Du = '__lodash_hash_undefined__';
function ju(e, t) {
  var r = this.__data__;
  return (
    (this.size += this.has(e) ? 0 : 1),
    (r[e] = Fu && t === void 0 ? Du : t),
    this
  );
}
var Nu = ju,
  qu = _u,
  ku = Ou,
  Uu = Pu,
  Bu = Iu,
  Hu = Nu;
function Ue(e) {
  var t = -1,
    r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
Ue.prototype.clear = qu;
Ue.prototype.delete = ku;
Ue.prototype.get = Uu;
Ue.prototype.has = Bu;
Ue.prototype.set = Hu;
var Gu = Ue;
function Wu() {
  ((this.__data__ = []), (this.size = 0));
}
var Ku = Wu;
function Qu(e, t) {
  return e === t || (e !== e && t !== t);
}
var Tr = Qu,
  zu = Tr;
function Vu(e, t) {
  for (var r = e.length; r--; ) if (zu(e[r][0], t)) return r;
  return -1;
}
var Lt = Vu,
  Xu = Lt,
  Yu = Array.prototype,
  Ju = Yu.splice;
function Zu(e) {
  var t = this.__data__,
    r = Xu(t, e);
  if (r < 0) return !1;
  var n = t.length - 1;
  return (r == n ? t.pop() : Ju.call(t, r, 1), --this.size, !0);
}
var ec = Zu,
  tc = Lt;
function rc(e) {
  var t = this.__data__,
    r = tc(t, e);
  return r < 0 ? void 0 : t[r][1];
}
var nc = rc,
  ic = Lt;
function sc(e) {
  return ic(this.__data__, e) > -1;
}
var ac = sc,
  oc = Lt;
function uc(e, t) {
  var r = this.__data__,
    n = oc(r, e);
  return (n < 0 ? (++this.size, r.push([e, t])) : (r[n][1] = t), this);
}
var cc = uc,
  lc = Ku,
  fc = ec,
  hc = nc,
  dc = ac,
  pc = cc;
function Be(e) {
  var t = -1,
    r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
Be.prototype.clear = lc;
Be.prototype.delete = fc;
Be.prototype.get = hc;
Be.prototype.has = dc;
Be.prototype.set = pc;
var Mt = Be,
  vc = Te,
  gc = ce,
  yc = vc(gc, 'Map'),
  Rr = yc,
  $n = Gu,
  mc = Mt,
  bc = Rr;
function wc() {
  ((this.size = 0),
    (this.__data__ = {
      hash: new $n(),
      map: new (bc || mc)(),
      string: new $n(),
    }));
}
var _c = wc;
function $c(e) {
  var t = typeof e;
  return t == 'string' || t == 'number' || t == 'symbol' || t == 'boolean'
    ? e !== '__proto__'
    : e === null;
}
var Oc = $c,
  Ec = Oc;
function Ac(e, t) {
  var r = e.__data__;
  return Ec(t) ? r[typeof t == 'string' ? 'string' : 'hash'] : r.map;
}
var It = Ac,
  Sc = It;
function xc(e) {
  var t = Sc(this, e).delete(e);
  return ((this.size -= t ? 1 : 0), t);
}
var Cc = xc,
  Pc = It;
function Tc(e) {
  return Pc(this, e).get(e);
}
var Rc = Tc,
  Lc = It;
function Mc(e) {
  return Lc(this, e).has(e);
}
var Ic = Mc,
  Fc = It;
function Dc(e, t) {
  var r = Fc(this, e),
    n = r.size;
  return (r.set(e, t), (this.size += r.size == n ? 0 : 1), this);
}
var jc = Dc,
  Nc = _c,
  qc = Cc,
  kc = Rc,
  Uc = Ic,
  Bc = jc;
function He(e) {
  var t = -1,
    r = e == null ? 0 : e.length;
  for (this.clear(); ++t < r; ) {
    var n = e[t];
    this.set(n[0], n[1]);
  }
}
He.prototype.clear = Nc;
He.prototype.delete = qc;
He.prototype.get = kc;
He.prototype.has = Uc;
He.prototype.set = Bc;
var Lr = He,
  zi = Lr,
  Hc = 'Expected a function';
function Mr(e, t) {
  if (typeof e != 'function' || (t != null && typeof t != 'function'))
    throw new TypeError(Hc);
  var r = function () {
    var n = arguments,
      i = t ? t.apply(this, n) : n[0],
      s = r.cache;
    if (s.has(i)) return s.get(i);
    var a = e.apply(this, n);
    return ((r.cache = s.set(i, a) || s), a);
  };
  return ((r.cache = new (Mr.Cache || zi)()), r);
}
Mr.Cache = zi;
var Vi = Mr;
const c_ = M(Vi);
var Gc = Vi,
  Wc = 500;
function Kc(e) {
  var t = Gc(e, function (n) {
      return (r.size === Wc && r.clear(), n);
    }),
    r = t.cache;
  return t;
}
var Qc = Kc,
  zc = Qc,
  Vc =
    /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
  Xc = /\\(\\)?/g,
  Yc = zc(function (e) {
    var t = [];
    return (
      e.charCodeAt(0) === 46 && t.push(''),
      e.replace(Vc, function (r, n, i, s) {
        t.push(i ? s.replace(Xc, '$1') : n || r);
      }),
      t
    );
  }),
  Jc = Yc;
function Zc(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length, i = Array(n); ++r < n; )
    i[r] = t(e[r], r, e);
  return i;
}
var Ir = Zc,
  On = ot,
  el = Ir,
  tl = K,
  rl = ke,
  En = On ? On.prototype : void 0,
  An = En ? En.toString : void 0;
function Xi(e) {
  if (typeof e == 'string') return e;
  if (tl(e)) return el(e, Xi) + '';
  if (rl(e)) return An ? An.call(e) : '';
  var t = e + '';
  return t == '0' && 1 / e == -1 / 0 ? '-0' : t;
}
var nl = Xi,
  il = nl;
function sl(e) {
  return e == null ? '' : il(e);
}
var Yi = sl,
  al = K,
  ol = Cr,
  ul = Jc,
  cl = Yi;
function ll(e, t) {
  return al(e) ? e : ol(e, t) ? [e] : ul(cl(e));
}
var Ji = ll,
  fl = ke;
function hl(e) {
  if (typeof e == 'string' || fl(e)) return e;
  var t = e + '';
  return t == '0' && 1 / e == -1 / 0 ? '-0' : t;
}
var Ft = hl,
  dl = Ji,
  pl = Ft;
function vl(e, t) {
  t = dl(t, e);
  for (var r = 0, n = t.length; e != null && r < n; ) e = e[pl(t[r++])];
  return r && r == n ? e : void 0;
}
var Fr = vl,
  gl = Fr;
function yl(e, t, r) {
  var n = e == null ? void 0 : gl(e, t);
  return n === void 0 ? r : n;
}
var Zi = yl;
const l_ = M(Zi);
function ml(e) {
  return e == null;
}
var bl = ml;
const f_ = M(bl);
var wl = ge,
  _l = K,
  $l = ye,
  Ol = '[object String]';
function El(e) {
  return typeof e == 'string' || (!_l(e) && $l(e) && wl(e) == Ol);
}
var Al = El;
const h_ = M(Al);
var Sl = ge,
  xl = ye,
  Cl = '[object Number]';
function Pl(e) {
  return typeof e == 'number' || (xl(e) && Sl(e) == Cl);
}
var es = Pl;
const d_ = M(es);
var Tl = es;
function Rl(e) {
  return Tl(e) && e != +e;
}
var Ll = Rl;
const p_ = M(Ll);
function Ml(e, t, r) {
  var n = -1,
    i = e.length;
  (t < 0 && (t = -t > i ? 0 : i + t),
    (r = r > i ? i : r),
    r < 0 && (r += i),
    (i = t > r ? 0 : (r - t) >>> 0),
    (t >>>= 0));
  for (var s = Array(i); ++n < i; ) s[n] = e[n + t];
  return s;
}
var Il = Ml,
  Fl = Il;
function Dl(e, t, r) {
  var n = e.length;
  return ((r = r === void 0 ? n : r), !t && r >= n ? e : Fl(e, t, r));
}
var jl = Dl,
  Nl = '\\ud800-\\udfff',
  ql = '\\u0300-\\u036f',
  kl = '\\ufe20-\\ufe2f',
  Ul = '\\u20d0-\\u20ff',
  Bl = ql + kl + Ul,
  Hl = '\\ufe0e\\ufe0f',
  Gl = '\\u200d',
  Wl = RegExp('[' + Gl + Nl + Bl + Hl + ']');
function Kl(e) {
  return Wl.test(e);
}
var ts = Kl;
function Ql(e) {
  return e.split('');
}
var zl = Ql,
  rs = '\\ud800-\\udfff',
  Vl = '\\u0300-\\u036f',
  Xl = '\\ufe20-\\ufe2f',
  Yl = '\\u20d0-\\u20ff',
  Jl = Vl + Xl + Yl,
  Zl = '\\ufe0e\\ufe0f',
  ef = '[' + rs + ']',
  fr = '[' + Jl + ']',
  hr = '\\ud83c[\\udffb-\\udfff]',
  tf = '(?:' + fr + '|' + hr + ')',
  ns = '[^' + rs + ']',
  is = '(?:\\ud83c[\\udde6-\\uddff]){2}',
  ss = '[\\ud800-\\udbff][\\udc00-\\udfff]',
  rf = '\\u200d',
  as = tf + '?',
  os = '[' + Zl + ']?',
  nf = '(?:' + rf + '(?:' + [ns, is, ss].join('|') + ')' + os + as + ')*',
  sf = os + as + nf,
  af = '(?:' + [ns + fr + '?', fr, is, ss, ef].join('|') + ')',
  of = RegExp(hr + '(?=' + hr + ')|' + af + sf, 'g');
function uf(e) {
  return e.match(of) || [];
}
var cf = uf,
  lf = zl,
  ff = ts,
  hf = cf;
function df(e) {
  return ff(e) ? hf(e) : lf(e);
}
var pf = df,
  vf = jl,
  gf = ts,
  yf = pf,
  mf = Yi;
function bf(e) {
  return function (t) {
    t = mf(t);
    var r = gf(t) ? yf(t) : void 0,
      n = r ? r[0] : t.charAt(0),
      i = r ? vf(r, 1).join('') : t.slice(1);
    return n[e]() + i;
  };
}
var wf = bf,
  _f = wf,
  $f = _f('toUpperCase'),
  Of = $f;
const v_ = M(Of);
var Ef = Mt;
function Af() {
  ((this.__data__ = new Ef()), (this.size = 0));
}
var Sf = Af;
function xf(e) {
  var t = this.__data__,
    r = t.delete(e);
  return ((this.size = t.size), r);
}
var Cf = xf;
function Pf(e) {
  return this.__data__.get(e);
}
var Tf = Pf;
function Rf(e) {
  return this.__data__.has(e);
}
var Lf = Rf,
  Mf = Mt,
  If = Rr,
  Ff = Lr,
  Df = 200;
function jf(e, t) {
  var r = this.__data__;
  if (r instanceof Mf) {
    var n = r.__data__;
    if (!If || n.length < Df - 1)
      return (n.push([e, t]), (this.size = ++r.size), this);
    r = this.__data__ = new Ff(n);
  }
  return (r.set(e, t), (this.size = r.size), this);
}
var Nf = jf,
  qf = Mt,
  kf = Sf,
  Uf = Cf,
  Bf = Tf,
  Hf = Lf,
  Gf = Nf;
function Ge(e) {
  var t = (this.__data__ = new qf(e));
  this.size = t.size;
}
Ge.prototype.clear = kf;
Ge.prototype.delete = Uf;
Ge.prototype.get = Bf;
Ge.prototype.has = Hf;
Ge.prototype.set = Gf;
var us = Ge,
  Wf = '__lodash_hash_undefined__';
function Kf(e) {
  return (this.__data__.set(e, Wf), this);
}
var Qf = Kf;
function zf(e) {
  return this.__data__.has(e);
}
var Vf = zf,
  Xf = Lr,
  Yf = Qf,
  Jf = Vf;
function $t(e) {
  var t = -1,
    r = e == null ? 0 : e.length;
  for (this.__data__ = new Xf(); ++t < r; ) this.add(e[t]);
}
$t.prototype.add = $t.prototype.push = Yf;
$t.prototype.has = Jf;
var cs = $t;
function Zf(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length; ++r < n; )
    if (t(e[r], r, e)) return !0;
  return !1;
}
var ls = Zf;
function eh(e, t) {
  return e.has(t);
}
var fs = eh,
  th = cs,
  rh = ls,
  nh = fs,
  ih = 1,
  sh = 2;
function ah(e, t, r, n, i, s) {
  var a = r & ih,
    o = e.length,
    u = t.length;
  if (o != u && !(a && u > o)) return !1;
  var c = s.get(e),
    l = s.get(t);
  if (c && l) return c == t && l == e;
  var f = -1,
    h = !0,
    p = r & sh ? new th() : void 0;
  for (s.set(e, t), s.set(t, e); ++f < o; ) {
    var g = e[f],
      d = t[f];
    if (n) var v = a ? n(d, g, f, t, e, s) : n(g, d, f, e, t, s);
    if (v !== void 0) {
      if (v) continue;
      h = !1;
      break;
    }
    if (p) {
      if (
        !rh(t, function (y, m) {
          if (!nh(p, m) && (g === y || i(g, y, r, n, s))) return p.push(m);
        })
      ) {
        h = !1;
        break;
      }
    } else if (!(g === d || i(g, d, r, n, s))) {
      h = !1;
      break;
    }
  }
  return (s.delete(e), s.delete(t), h);
}
var hs = ah,
  oh = ce,
  uh = oh.Uint8Array,
  ch = uh;
function lh(e) {
  var t = -1,
    r = Array(e.size);
  return (
    e.forEach(function (n, i) {
      r[++t] = [i, n];
    }),
    r
  );
}
var fh = lh;
function hh(e) {
  var t = -1,
    r = Array(e.size);
  return (
    e.forEach(function (n) {
      r[++t] = n;
    }),
    r
  );
}
var Dr = hh,
  Sn = ot,
  xn = ch,
  dh = Tr,
  ph = hs,
  vh = fh,
  gh = Dr,
  yh = 1,
  mh = 2,
  bh = '[object Boolean]',
  wh = '[object Date]',
  _h = '[object Error]',
  $h = '[object Map]',
  Oh = '[object Number]',
  Eh = '[object RegExp]',
  Ah = '[object Set]',
  Sh = '[object String]',
  xh = '[object Symbol]',
  Ch = '[object ArrayBuffer]',
  Ph = '[object DataView]',
  Cn = Sn ? Sn.prototype : void 0,
  zt = Cn ? Cn.valueOf : void 0;
function Th(e, t, r, n, i, s, a) {
  switch (r) {
    case Ph:
      if (e.byteLength != t.byteLength || e.byteOffset != t.byteOffset)
        return !1;
      ((e = e.buffer), (t = t.buffer));
    case Ch:
      return !(e.byteLength != t.byteLength || !s(new xn(e), new xn(t)));
    case bh:
    case wh:
    case Oh:
      return dh(+e, +t);
    case _h:
      return e.name == t.name && e.message == t.message;
    case Eh:
    case Sh:
      return e == t + '';
    case $h:
      var o = vh;
    case Ah:
      var u = n & yh;
      if ((o || (o = gh), e.size != t.size && !u)) return !1;
      var c = a.get(e);
      if (c) return c == t;
      ((n |= mh), a.set(e, t));
      var l = ph(o(e), o(t), n, i, s, a);
      return (a.delete(e), l);
    case xh:
      if (zt) return zt.call(e) == zt.call(t);
  }
  return !1;
}
var Rh = Th;
function Lh(e, t) {
  for (var r = -1, n = t.length, i = e.length; ++r < n; ) e[i + r] = t[r];
  return e;
}
var ds = Lh,
  Mh = ds,
  Ih = K;
function Fh(e, t, r) {
  var n = t(e);
  return Ih(e) ? n : Mh(n, r(e));
}
var Dh = Fh;
function jh(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length, i = 0, s = []; ++r < n; ) {
    var a = e[r];
    t(a, r, e) && (s[i++] = a);
  }
  return s;
}
var Nh = jh;
function qh() {
  return [];
}
var kh = qh,
  Uh = Nh,
  Bh = kh,
  Hh = Object.prototype,
  Gh = Hh.propertyIsEnumerable,
  Pn = Object.getOwnPropertySymbols,
  Wh = Pn
    ? function (e) {
        return e == null
          ? []
          : ((e = Object(e)),
            Uh(Pn(e), function (t) {
              return Gh.call(e, t);
            }));
      }
    : Bh,
  Kh = Wh;
function Qh(e, t) {
  for (var r = -1, n = Array(e); ++r < e; ) n[r] = t(r);
  return n;
}
var zh = Qh,
  Vh = ge,
  Xh = ye,
  Yh = '[object Arguments]';
function Jh(e) {
  return Xh(e) && Vh(e) == Yh;
}
var Zh = Jh,
  Tn = Zh,
  ed = ye,
  ps = Object.prototype,
  td = ps.hasOwnProperty,
  rd = ps.propertyIsEnumerable,
  nd = Tn(
    (function () {
      return arguments;
    })()
  )
    ? Tn
    : function (e) {
        return ed(e) && td.call(e, 'callee') && !rd.call(e, 'callee');
      },
  jr = nd,
  Ot = { exports: {} };
function id() {
  return !1;
}
var sd = id;
Ot.exports;
(function (e, t) {
  var r = ce,
    n = sd,
    i = t && !t.nodeType && t,
    s = i && !0 && e && !e.nodeType && e,
    a = s && s.exports === i,
    o = a ? r.Buffer : void 0,
    u = o ? o.isBuffer : void 0,
    c = u || n;
  e.exports = c;
})(Ot, Ot.exports);
var vs = Ot.exports,
  ad = 9007199254740991,
  od = /^(?:0|[1-9]\d*)$/;
function ud(e, t) {
  var r = typeof e;
  return (
    (t = t ?? ad),
    !!t &&
      (r == 'number' || (r != 'symbol' && od.test(e))) &&
      e > -1 &&
      e % 1 == 0 &&
      e < t
  );
}
var Nr = ud,
  cd = 9007199254740991;
function ld(e) {
  return typeof e == 'number' && e > -1 && e % 1 == 0 && e <= cd;
}
var qr = ld,
  fd = ge,
  hd = qr,
  dd = ye,
  pd = '[object Arguments]',
  vd = '[object Array]',
  gd = '[object Boolean]',
  yd = '[object Date]',
  md = '[object Error]',
  bd = '[object Function]',
  wd = '[object Map]',
  _d = '[object Number]',
  $d = '[object Object]',
  Od = '[object RegExp]',
  Ed = '[object Set]',
  Ad = '[object String]',
  Sd = '[object WeakMap]',
  xd = '[object ArrayBuffer]',
  Cd = '[object DataView]',
  Pd = '[object Float32Array]',
  Td = '[object Float64Array]',
  Rd = '[object Int8Array]',
  Ld = '[object Int16Array]',
  Md = '[object Int32Array]',
  Id = '[object Uint8Array]',
  Fd = '[object Uint8ClampedArray]',
  Dd = '[object Uint16Array]',
  jd = '[object Uint32Array]',
  F = {};
F[Pd] = F[Td] = F[Rd] = F[Ld] = F[Md] = F[Id] = F[Fd] = F[Dd] = F[jd] = !0;
F[pd] =
  F[vd] =
  F[xd] =
  F[gd] =
  F[Cd] =
  F[yd] =
  F[md] =
  F[bd] =
  F[wd] =
  F[_d] =
  F[$d] =
  F[Od] =
  F[Ed] =
  F[Ad] =
  F[Sd] =
    !1;
function Nd(e) {
  return dd(e) && hd(e.length) && !!F[fd(e)];
}
var qd = Nd;
function kd(e) {
  return function (t) {
    return e(t);
  };
}
var gs = kd,
  Et = { exports: {} };
Et.exports;
(function (e, t) {
  var r = Wi,
    n = t && !t.nodeType && t,
    i = n && !0 && e && !e.nodeType && e,
    s = i && i.exports === n,
    a = s && r.process,
    o = (function () {
      try {
        var u = i && i.require && i.require('util').types;
        return u || (a && a.binding && a.binding('util'));
      } catch {}
    })();
  e.exports = o;
})(Et, Et.exports);
var Ud = Et.exports,
  Bd = qd,
  Hd = gs,
  Rn = Ud,
  Ln = Rn && Rn.isTypedArray,
  Gd = Ln ? Hd(Ln) : Bd,
  ys = Gd,
  Wd = zh,
  Kd = jr,
  Qd = K,
  zd = vs,
  Vd = Nr,
  Xd = ys,
  Yd = Object.prototype,
  Jd = Yd.hasOwnProperty;
function Zd(e, t) {
  var r = Qd(e),
    n = !r && Kd(e),
    i = !r && !n && zd(e),
    s = !r && !n && !i && Xd(e),
    a = r || n || i || s,
    o = a ? Wd(e.length, String) : [],
    u = o.length;
  for (var c in e)
    (t || Jd.call(e, c)) &&
      !(
        a &&
        (c == 'length' ||
          (i && (c == 'offset' || c == 'parent')) ||
          (s && (c == 'buffer' || c == 'byteLength' || c == 'byteOffset')) ||
          Vd(c, u))
      ) &&
      o.push(c);
  return o;
}
var ep = Zd,
  tp = Object.prototype;
function rp(e) {
  var t = e && e.constructor,
    r = (typeof t == 'function' && t.prototype) || tp;
  return e === r;
}
var np = rp;
function ip(e, t) {
  return function (r) {
    return e(t(r));
  };
}
var ms = ip,
  sp = ms,
  ap = sp(Object.keys, Object),
  op = ap,
  up = np,
  cp = op,
  lp = Object.prototype,
  fp = lp.hasOwnProperty;
function hp(e) {
  if (!up(e)) return cp(e);
  var t = [];
  for (var r in Object(e)) fp.call(e, r) && r != 'constructor' && t.push(r);
  return t;
}
var dp = hp,
  pp = Pr,
  vp = qr;
function gp(e) {
  return e != null && vp(e.length) && !pp(e);
}
var ut = gp,
  yp = ep,
  mp = dp,
  bp = ut;
function wp(e) {
  return bp(e) ? yp(e) : mp(e);
}
var Dt = wp,
  _p = Dh,
  $p = Kh,
  Op = Dt;
function Ep(e) {
  return _p(e, Op, $p);
}
var Ap = Ep,
  Mn = Ap,
  Sp = 1,
  xp = Object.prototype,
  Cp = xp.hasOwnProperty;
function Pp(e, t, r, n, i, s) {
  var a = r & Sp,
    o = Mn(e),
    u = o.length,
    c = Mn(t),
    l = c.length;
  if (u != l && !a) return !1;
  for (var f = u; f--; ) {
    var h = o[f];
    if (!(a ? h in t : Cp.call(t, h))) return !1;
  }
  var p = s.get(e),
    g = s.get(t);
  if (p && g) return p == t && g == e;
  var d = !0;
  (s.set(e, t), s.set(t, e));
  for (var v = a; ++f < u; ) {
    h = o[f];
    var y = e[h],
      m = t[h];
    if (n) var w = a ? n(m, y, h, t, e, s) : n(y, m, h, e, t, s);
    if (!(w === void 0 ? y === m || i(y, m, r, n, s) : w)) {
      d = !1;
      break;
    }
    v || (v = h == 'constructor');
  }
  if (d && !v) {
    var $ = e.constructor,
      O = t.constructor;
    $ != O &&
      'constructor' in e &&
      'constructor' in t &&
      !(
        typeof $ == 'function' &&
        $ instanceof $ &&
        typeof O == 'function' &&
        O instanceof O
      ) &&
      (d = !1);
  }
  return (s.delete(e), s.delete(t), d);
}
var Tp = Pp,
  Rp = Te,
  Lp = ce,
  Mp = Rp(Lp, 'DataView'),
  Ip = Mp,
  Fp = Te,
  Dp = ce,
  jp = Fp(Dp, 'Promise'),
  Np = jp,
  qp = Te,
  kp = ce,
  Up = qp(kp, 'Set'),
  bs = Up,
  Bp = Te,
  Hp = ce,
  Gp = Bp(Hp, 'WeakMap'),
  Wp = Gp,
  dr = Ip,
  pr = Rr,
  vr = Np,
  gr = bs,
  yr = Wp,
  ws = ge,
  We = Qi,
  In = '[object Map]',
  Kp = '[object Object]',
  Fn = '[object Promise]',
  Dn = '[object Set]',
  jn = '[object WeakMap]',
  Nn = '[object DataView]',
  Qp = We(dr),
  zp = We(pr),
  Vp = We(vr),
  Xp = We(gr),
  Yp = We(yr),
  Ae = ws;
((dr && Ae(new dr(new ArrayBuffer(1))) != Nn) ||
  (pr && Ae(new pr()) != In) ||
  (vr && Ae(vr.resolve()) != Fn) ||
  (gr && Ae(new gr()) != Dn) ||
  (yr && Ae(new yr()) != jn)) &&
  (Ae = function (e) {
    var t = ws(e),
      r = t == Kp ? e.constructor : void 0,
      n = r ? We(r) : '';
    if (n)
      switch (n) {
        case Qp:
          return Nn;
        case zp:
          return In;
        case Vp:
          return Fn;
        case Xp:
          return Dn;
        case Yp:
          return jn;
      }
    return t;
  });
var Jp = Ae,
  Vt = us,
  Zp = hs,
  ev = Rh,
  tv = Tp,
  qn = Jp,
  kn = K,
  Un = vs,
  rv = ys,
  nv = 1,
  Bn = '[object Arguments]',
  Hn = '[object Array]',
  pt = '[object Object]',
  iv = Object.prototype,
  Gn = iv.hasOwnProperty;
function sv(e, t, r, n, i, s) {
  var a = kn(e),
    o = kn(t),
    u = a ? Hn : qn(e),
    c = o ? Hn : qn(t);
  ((u = u == Bn ? pt : u), (c = c == Bn ? pt : c));
  var l = u == pt,
    f = c == pt,
    h = u == c;
  if (h && Un(e)) {
    if (!Un(t)) return !1;
    ((a = !0), (l = !1));
  }
  if (h && !l)
    return (
      s || (s = new Vt()),
      a || rv(e) ? Zp(e, t, r, n, i, s) : ev(e, t, u, r, n, i, s)
    );
  if (!(r & nv)) {
    var p = l && Gn.call(e, '__wrapped__'),
      g = f && Gn.call(t, '__wrapped__');
    if (p || g) {
      var d = p ? e.value() : e,
        v = g ? t.value() : t;
      return (s || (s = new Vt()), i(d, v, r, n, s));
    }
  }
  return h ? (s || (s = new Vt()), tv(e, t, r, n, i, s)) : !1;
}
var av = sv,
  ov = av,
  Wn = ye;
function _s(e, t, r, n, i) {
  return e === t
    ? !0
    : e == null || t == null || (!Wn(e) && !Wn(t))
      ? e !== e && t !== t
      : ov(e, t, r, n, _s, i);
}
var kr = _s,
  uv = us,
  cv = kr,
  lv = 1,
  fv = 2;
function hv(e, t, r, n) {
  var i = r.length,
    s = i,
    a = !n;
  if (e == null) return !s;
  for (e = Object(e); i--; ) {
    var o = r[i];
    if (a && o[2] ? o[1] !== e[o[0]] : !(o[0] in e)) return !1;
  }
  for (; ++i < s; ) {
    o = r[i];
    var u = o[0],
      c = e[u],
      l = o[1];
    if (a && o[2]) {
      if (c === void 0 && !(u in e)) return !1;
    } else {
      var f = new uv();
      if (n) var h = n(c, l, u, e, t, f);
      if (!(h === void 0 ? cv(l, c, lv | fv, n, f) : h)) return !1;
    }
  }
  return !0;
}
var dv = hv,
  pv = _e;
function vv(e) {
  return e === e && !pv(e);
}
var $s = vv,
  gv = $s,
  yv = Dt;
function mv(e) {
  for (var t = yv(e), r = t.length; r--; ) {
    var n = t[r],
      i = e[n];
    t[r] = [n, i, gv(i)];
  }
  return t;
}
var bv = mv;
function wv(e, t) {
  return function (r) {
    return r == null ? !1 : r[e] === t && (t !== void 0 || e in Object(r));
  };
}
var Os = wv,
  _v = dv,
  $v = bv,
  Ov = Os;
function Ev(e) {
  var t = $v(e);
  return t.length == 1 && t[0][2]
    ? Ov(t[0][0], t[0][1])
    : function (r) {
        return r === e || _v(r, e, t);
      };
}
var Av = Ev;
function Sv(e, t) {
  return e != null && t in Object(e);
}
var xv = Sv,
  Cv = Ji,
  Pv = jr,
  Tv = K,
  Rv = Nr,
  Lv = qr,
  Mv = Ft;
function Iv(e, t, r) {
  t = Cv(t, e);
  for (var n = -1, i = t.length, s = !1; ++n < i; ) {
    var a = Mv(t[n]);
    if (!(s = e != null && r(e, a))) break;
    e = e[a];
  }
  return s || ++n != i
    ? s
    : ((i = e == null ? 0 : e.length),
      !!i && Lv(i) && Rv(a, i) && (Tv(e) || Pv(e)));
}
var Fv = Iv,
  Dv = xv,
  jv = Fv;
function Nv(e, t) {
  return e != null && jv(e, t, Dv);
}
var qv = Nv,
  kv = kr,
  Uv = Zi,
  Bv = qv,
  Hv = Cr,
  Gv = $s,
  Wv = Os,
  Kv = Ft,
  Qv = 1,
  zv = 2;
function Vv(e, t) {
  return Hv(e) && Gv(t)
    ? Wv(Kv(e), t)
    : function (r) {
        var n = Uv(r, e);
        return n === void 0 && n === t ? Bv(r, e) : kv(t, n, Qv | zv);
      };
}
var Xv = Vv;
function Yv(e) {
  return e;
}
var Ke = Yv;
function Jv(e) {
  return function (t) {
    return t?.[e];
  };
}
var Zv = Jv,
  eg = Fr;
function tg(e) {
  return function (t) {
    return eg(t, e);
  };
}
var rg = tg,
  ng = Zv,
  ig = rg,
  sg = Cr,
  ag = Ft;
function og(e) {
  return sg(e) ? ng(ag(e)) : ig(e);
}
var ug = og,
  cg = Av,
  lg = Xv,
  fg = Ke,
  hg = K,
  dg = ug;
function pg(e) {
  return typeof e == 'function'
    ? e
    : e == null
      ? fg
      : typeof e == 'object'
        ? hg(e)
          ? lg(e[0], e[1])
          : cg(e)
        : dg(e);
}
var le = pg;
function vg(e, t, r, n) {
  for (var i = e.length, s = r + (n ? 1 : -1); n ? s-- : ++s < i; )
    if (t(e[s], s, e)) return s;
  return -1;
}
var Es = vg;
function gg(e) {
  return e !== e;
}
var yg = gg;
function mg(e, t, r) {
  for (var n = r - 1, i = e.length; ++n < i; ) if (e[n] === t) return n;
  return -1;
}
var bg = mg,
  wg = Es,
  _g = yg,
  $g = bg;
function Og(e, t, r) {
  return t === t ? $g(e, t, r) : wg(e, _g, r);
}
var Eg = Og,
  Ag = Eg;
function Sg(e, t) {
  var r = e == null ? 0 : e.length;
  return !!r && Ag(e, t, 0) > -1;
}
var xg = Sg;
function Cg(e, t, r) {
  for (var n = -1, i = e == null ? 0 : e.length; ++n < i; )
    if (r(t, e[n])) return !0;
  return !1;
}
var Pg = Cg;
function Tg() {}
var Rg = Tg,
  Xt = bs,
  Lg = Rg,
  Mg = Dr,
  Ig = 1 / 0,
  Fg =
    Xt && 1 / Mg(new Xt([, -0]))[1] == Ig
      ? function (e) {
          return new Xt(e);
        }
      : Lg,
  Dg = Fg,
  jg = cs,
  Ng = xg,
  qg = Pg,
  kg = fs,
  Ug = Dg,
  Bg = Dr,
  Hg = 200;
function Gg(e, t, r) {
  var n = -1,
    i = Ng,
    s = e.length,
    a = !0,
    o = [],
    u = o;
  if (r) ((a = !1), (i = qg));
  else if (s >= Hg) {
    var c = t ? null : Ug(e);
    if (c) return Bg(c);
    ((a = !1), (i = kg), (u = new jg()));
  } else u = t ? [] : o;
  e: for (; ++n < s; ) {
    var l = e[n],
      f = t ? t(l) : l;
    if (((l = r || l !== 0 ? l : 0), a && f === f)) {
      for (var h = u.length; h--; ) if (u[h] === f) continue e;
      (t && u.push(f), o.push(l));
    } else i(u, f, r) || (u !== o && u.push(f), o.push(l));
  }
  return o;
}
var Wg = Gg,
  Kg = le,
  Qg = Wg;
function zg(e, t) {
  return e && e.length ? Qg(e, Kg(t)) : [];
}
var Vg = zg;
const g_ = M(Vg);
var Kn = ot,
  Xg = jr,
  Yg = K,
  Qn = Kn ? Kn.isConcatSpreadable : void 0;
function Jg(e) {
  return Yg(e) || Xg(e) || !!(Qn && e && e[Qn]);
}
var Zg = Jg,
  ey = ds,
  ty = Zg;
function As(e, t, r, n, i) {
  var s = -1,
    a = e.length;
  for (r || (r = ty), i || (i = []); ++s < a; ) {
    var o = e[s];
    t > 0 && r(o)
      ? t > 1
        ? As(o, t - 1, r, n, i)
        : ey(i, o)
      : n || (i[i.length] = o);
  }
  return i;
}
var Ss = As;
function ry(e) {
  return function (t, r, n) {
    for (var i = -1, s = Object(t), a = n(t), o = a.length; o--; ) {
      var u = a[e ? o : ++i];
      if (r(s[u], u, s) === !1) break;
    }
    return t;
  };
}
var ny = ry,
  iy = ny,
  sy = iy(),
  ay = sy,
  oy = ay,
  uy = Dt;
function cy(e, t) {
  return e && oy(e, t, uy);
}
var xs = cy,
  ly = ut;
function fy(e, t) {
  return function (r, n) {
    if (r == null) return r;
    if (!ly(r)) return e(r, n);
    for (
      var i = r.length, s = t ? i : -1, a = Object(r);
      (t ? s-- : ++s < i) && n(a[s], s, a) !== !1;

    );
    return r;
  };
}
var hy = fy,
  dy = xs,
  py = hy,
  vy = py(dy),
  Ur = vy,
  gy = Ur,
  yy = ut;
function my(e, t) {
  var r = -1,
    n = yy(e) ? Array(e.length) : [];
  return (
    gy(e, function (i, s, a) {
      n[++r] = t(i, s, a);
    }),
    n
  );
}
var Cs = my;
function by(e, t) {
  var r = e.length;
  for (e.sort(t); r--; ) e[r] = e[r].value;
  return e;
}
var wy = by,
  zn = ke;
function _y(e, t) {
  if (e !== t) {
    var r = e !== void 0,
      n = e === null,
      i = e === e,
      s = zn(e),
      a = t !== void 0,
      o = t === null,
      u = t === t,
      c = zn(t);
    if (
      (!o && !c && !s && e > t) ||
      (s && a && u && !o && !c) ||
      (n && a && u) ||
      (!r && u) ||
      !i
    )
      return 1;
    if (
      (!n && !s && !c && e < t) ||
      (c && r && i && !n && !s) ||
      (o && r && i) ||
      (!a && i) ||
      !u
    )
      return -1;
  }
  return 0;
}
var $y = _y,
  Oy = $y;
function Ey(e, t, r) {
  for (
    var n = -1, i = e.criteria, s = t.criteria, a = i.length, o = r.length;
    ++n < a;

  ) {
    var u = Oy(i[n], s[n]);
    if (u) {
      if (n >= o) return u;
      var c = r[n];
      return u * (c == 'desc' ? -1 : 1);
    }
  }
  return e.index - t.index;
}
var Ay = Ey,
  Yt = Ir,
  Sy = Fr,
  xy = le,
  Cy = Cs,
  Py = wy,
  Ty = gs,
  Ry = Ay,
  Ly = Ke,
  My = K;
function Iy(e, t, r) {
  t.length
    ? (t = Yt(t, function (s) {
        return My(s)
          ? function (a) {
              return Sy(a, s.length === 1 ? s[0] : s);
            }
          : s;
      }))
    : (t = [Ly]);
  var n = -1;
  t = Yt(t, Ty(xy));
  var i = Cy(e, function (s, a, o) {
    var u = Yt(t, function (c) {
      return c(s);
    });
    return { criteria: u, index: ++n, value: s };
  });
  return Py(i, function (s, a) {
    return Ry(s, a, r);
  });
}
var Fy = Iy;
function Dy(e, t, r) {
  switch (r.length) {
    case 0:
      return e.call(t);
    case 1:
      return e.call(t, r[0]);
    case 2:
      return e.call(t, r[0], r[1]);
    case 3:
      return e.call(t, r[0], r[1], r[2]);
  }
  return e.apply(t, r);
}
var jy = Dy,
  Ny = jy,
  Vn = Math.max;
function qy(e, t, r) {
  return (
    (t = Vn(t === void 0 ? e.length - 1 : t, 0)),
    function () {
      for (
        var n = arguments, i = -1, s = Vn(n.length - t, 0), a = Array(s);
        ++i < s;

      )
        a[i] = n[t + i];
      i = -1;
      for (var o = Array(t + 1); ++i < t; ) o[i] = n[i];
      return ((o[t] = r(a)), Ny(e, this, o));
    }
  );
}
var ky = qy;
function Uy(e) {
  return function () {
    return e;
  };
}
var By = Uy,
  Hy = Te,
  Gy = (function () {
    try {
      var e = Hy(Object, 'defineProperty');
      return (e({}, '', {}), e);
    } catch {}
  })(),
  Ps = Gy,
  Wy = By,
  Xn = Ps,
  Ky = Ke,
  Qy = Xn
    ? function (e, t) {
        return Xn(e, 'toString', {
          configurable: !0,
          enumerable: !1,
          value: Wy(t),
          writable: !0,
        });
      }
    : Ky,
  zy = Qy,
  Vy = 800,
  Xy = 16,
  Yy = Date.now;
function Jy(e) {
  var t = 0,
    r = 0;
  return function () {
    var n = Yy(),
      i = Xy - (n - r);
    if (((r = n), i > 0)) {
      if (++t >= Vy) return arguments[0];
    } else t = 0;
    return e.apply(void 0, arguments);
  };
}
var Zy = Jy,
  em = zy,
  tm = Zy,
  rm = tm(em),
  nm = rm,
  im = Ke,
  sm = ky,
  am = nm;
function om(e, t) {
  return am(sm(e, t, im), e + '');
}
var um = om,
  cm = Tr,
  lm = ut,
  fm = Nr,
  hm = _e;
function dm(e, t, r) {
  if (!hm(r)) return !1;
  var n = typeof t;
  return (n == 'number' ? lm(r) && fm(t, r.length) : n == 'string' && t in r)
    ? cm(r[t], e)
    : !1;
}
var jt = dm,
  pm = Ss,
  vm = Fy,
  gm = um,
  Yn = jt,
  ym = gm(function (e, t) {
    if (e == null) return [];
    var r = t.length;
    return (
      r > 1 && Yn(e, t[0], t[1])
        ? (t = [])
        : r > 2 && Yn(t[0], t[1], t[2]) && (t = [t[0]]),
      vm(e, pm(t, 1), [])
    );
  }),
  mm = ym;
const y_ = M(mm);
var bm = ce,
  wm = function () {
    return bm.Date.now();
  },
  _m = wm,
  $m = /\s/;
function Om(e) {
  for (var t = e.length; t-- && $m.test(e.charAt(t)); );
  return t;
}
var Em = Om,
  Am = Em,
  Sm = /^\s+/;
function xm(e) {
  return e && e.slice(0, Am(e) + 1).replace(Sm, '');
}
var Cm = xm,
  Pm = Cm,
  Jn = _e,
  Tm = ke,
  Zn = NaN,
  Rm = /^[-+]0x[0-9a-f]+$/i,
  Lm = /^0b[01]+$/i,
  Mm = /^0o[0-7]+$/i,
  Im = parseInt;
function Fm(e) {
  if (typeof e == 'number') return e;
  if (Tm(e)) return Zn;
  if (Jn(e)) {
    var t = typeof e.valueOf == 'function' ? e.valueOf() : e;
    e = Jn(t) ? t + '' : t;
  }
  if (typeof e != 'string') return e === 0 ? e : +e;
  e = Pm(e);
  var r = Lm.test(e);
  return r || Mm.test(e) ? Im(e.slice(2), r ? 2 : 8) : Rm.test(e) ? Zn : +e;
}
var Ts = Fm,
  Dm = _e,
  Jt = _m,
  ei = Ts,
  jm = 'Expected a function',
  Nm = Math.max,
  qm = Math.min;
function km(e, t, r) {
  var n,
    i,
    s,
    a,
    o,
    u,
    c = 0,
    l = !1,
    f = !1,
    h = !0;
  if (typeof e != 'function') throw new TypeError(jm);
  ((t = ei(t) || 0),
    Dm(r) &&
      ((l = !!r.leading),
      (f = 'maxWait' in r),
      (s = f ? Nm(ei(r.maxWait) || 0, t) : s),
      (h = 'trailing' in r ? !!r.trailing : h)));
  function p(x) {
    var E = n,
      C = i;
    return ((n = i = void 0), (c = x), (a = e.apply(C, E)), a);
  }
  function g(x) {
    return ((c = x), (o = setTimeout(y, t)), l ? p(x) : a);
  }
  function d(x) {
    var E = x - u,
      C = x - c,
      I = t - E;
    return f ? qm(I, s - C) : I;
  }
  function v(x) {
    var E = x - u,
      C = x - c;
    return u === void 0 || E >= t || E < 0 || (f && C >= s);
  }
  function y() {
    var x = Jt();
    if (v(x)) return m(x);
    o = setTimeout(y, d(x));
  }
  function m(x) {
    return ((o = void 0), h && n ? p(x) : ((n = i = void 0), a));
  }
  function w() {
    (o !== void 0 && clearTimeout(o), (c = 0), (n = u = i = o = void 0));
  }
  function $() {
    return o === void 0 ? a : m(Jt());
  }
  function O() {
    var x = Jt(),
      E = v(x);
    if (((n = arguments), (i = this), (u = x), E)) {
      if (o === void 0) return g(u);
      if (f) return (clearTimeout(o), (o = setTimeout(y, t)), p(u));
    }
    return (o === void 0 && (o = setTimeout(y, t)), a);
  }
  return ((O.cancel = w), (O.flush = $), O);
}
var Um = km,
  Bm = Um,
  Hm = _e,
  Gm = 'Expected a function';
function Wm(e, t, r) {
  var n = !0,
    i = !0;
  if (typeof e != 'function') throw new TypeError(Gm);
  return (
    Hm(r) &&
      ((n = 'leading' in r ? !!r.leading : n),
      (i = 'trailing' in r ? !!r.trailing : i)),
    Bm(e, t, { leading: n, maxWait: t, trailing: i })
  );
}
var Km = Wm;
const m_ = M(Km);
class b_ extends Map {
  constructor(t, r = Vm) {
    if (
      (super(),
      Object.defineProperties(this, {
        _intern: { value: new Map() },
        _key: { value: r },
      }),
      t != null)
    )
      for (const [n, i] of t) this.set(n, i);
  }
  get(t) {
    return super.get(ti(this, t));
  }
  has(t) {
    return super.has(ti(this, t));
  }
  set(t, r) {
    return super.set(Qm(this, t), r);
  }
  delete(t) {
    return super.delete(zm(this, t));
  }
}
function ti({ _intern: e, _key: t }, r) {
  const n = t(r);
  return e.has(n) ? e.get(n) : r;
}
function Qm({ _intern: e, _key: t }, r) {
  const n = t(r);
  return e.has(n) ? e.get(n) : (e.set(n, r), r);
}
function zm({ _intern: e, _key: t }, r) {
  const n = t(r);
  return (e.has(n) && ((r = e.get(n)), e.delete(n)), r);
}
function Vm(e) {
  return e !== null && typeof e == 'object' ? e.valueOf() : e;
}
var Xm = ke;
function Ym(e, t, r) {
  for (var n = -1, i = e.length; ++n < i; ) {
    var s = e[n],
      a = t(s);
    if (a != null && (o === void 0 ? a === a && !Xm(a) : r(a, o)))
      var o = a,
        u = s;
  }
  return u;
}
var Nt = Ym;
function Jm(e, t) {
  return e > t;
}
var Rs = Jm,
  Zm = Nt,
  eb = Rs,
  tb = Ke;
function rb(e) {
  return e && e.length ? Zm(e, tb, eb) : void 0;
}
var nb = rb;
const w_ = M(nb);
function ib(e, t) {
  return e < t;
}
var Ls = ib,
  sb = Nt,
  ab = Ls,
  ob = Ke;
function ub(e) {
  return e && e.length ? sb(e, ob, ab) : void 0;
}
var cb = ub;
const __ = M(cb);
var lb = Ir,
  fb = le,
  hb = Cs,
  db = K;
function pb(e, t) {
  var r = db(e) ? lb : hb;
  return r(e, fb(t));
}
var vb = pb,
  gb = Ss,
  yb = vb;
function mb(e, t) {
  return gb(yb(e, t), 1);
}
var bb = mb;
const $_ = M(bb);
var wb = kr;
function _b(e, t) {
  return wb(e, t);
}
var $b = _b;
const O_ = M($b);
var Qe = 1e9,
  Ob = {
    precision: 20,
    rounding: 4,
    toExpNeg: -7,
    toExpPos: 21,
    LN10: '2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286',
  },
  Hr,
  N = !0,
  ee = '[DecimalError] ',
  xe = ee + 'Invalid argument: ',
  Br = ee + 'Exponent out of range: ',
  ze = Math.floor,
  Se = Math.pow,
  Eb = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
  Y,
  H = 1e7,
  D = 7,
  Ms = 9007199254740991,
  At = ze(Ms / D),
  _ = {};
_.absoluteValue = _.abs = function () {
  var e = new this.constructor(this);
  return (e.s && (e.s = 1), e);
};
_.comparedTo = _.cmp = function (e) {
  var t,
    r,
    n,
    i,
    s = this;
  if (((e = new s.constructor(e)), s.s !== e.s)) return s.s || -e.s;
  if (s.e !== e.e) return (s.e > e.e) ^ (s.s < 0) ? 1 : -1;
  for (n = s.d.length, i = e.d.length, t = 0, r = n < i ? n : i; t < r; ++t)
    if (s.d[t] !== e.d[t]) return (s.d[t] > e.d[t]) ^ (s.s < 0) ? 1 : -1;
  return n === i ? 0 : (n > i) ^ (s.s < 0) ? 1 : -1;
};
_.decimalPlaces = _.dp = function () {
  var e = this,
    t = e.d.length - 1,
    r = (t - e.e) * D;
  if (((t = e.d[t]), t)) for (; t % 10 == 0; t /= 10) r--;
  return r < 0 ? 0 : r;
};
_.dividedBy = _.div = function (e) {
  return he(this, new this.constructor(e));
};
_.dividedToIntegerBy = _.idiv = function (e) {
  var t = this,
    r = t.constructor;
  return L(he(t, new r(e), 0, 1), r.precision);
};
_.equals = _.eq = function (e) {
  return !this.cmp(e);
};
_.exponent = function () {
  return U(this);
};
_.greaterThan = _.gt = function (e) {
  return this.cmp(e) > 0;
};
_.greaterThanOrEqualTo = _.gte = function (e) {
  return this.cmp(e) >= 0;
};
_.isInteger = _.isint = function () {
  return this.e > this.d.length - 2;
};
_.isNegative = _.isneg = function () {
  return this.s < 0;
};
_.isPositive = _.ispos = function () {
  return this.s > 0;
};
_.isZero = function () {
  return this.s === 0;
};
_.lessThan = _.lt = function (e) {
  return this.cmp(e) < 0;
};
_.lessThanOrEqualTo = _.lte = function (e) {
  return this.cmp(e) < 1;
};
_.logarithm = _.log = function (e) {
  var t,
    r = this,
    n = r.constructor,
    i = n.precision,
    s = i + 5;
  if (e === void 0) e = new n(10);
  else if (((e = new n(e)), e.s < 1 || e.eq(Y))) throw Error(ee + 'NaN');
  if (r.s < 1) throw Error(ee + (r.s ? 'NaN' : '-Infinity'));
  return r.eq(Y)
    ? new n(0)
    : ((N = !1), (t = he(rt(r, s), rt(e, s), s)), (N = !0), L(t, i));
};
_.minus = _.sub = function (e) {
  var t = this;
  return (
    (e = new t.constructor(e)),
    t.s == e.s ? Ds(t, e) : Is(t, ((e.s = -e.s), e))
  );
};
_.modulo = _.mod = function (e) {
  var t,
    r = this,
    n = r.constructor,
    i = n.precision;
  if (((e = new n(e)), !e.s)) throw Error(ee + 'NaN');
  return r.s
    ? ((N = !1), (t = he(r, e, 0, 1).times(e)), (N = !0), r.minus(t))
    : L(new n(r), i);
};
_.naturalExponential = _.exp = function () {
  return Fs(this);
};
_.naturalLogarithm = _.ln = function () {
  return rt(this);
};
_.negated = _.neg = function () {
  var e = new this.constructor(this);
  return ((e.s = -e.s || 0), e);
};
_.plus = _.add = function (e) {
  var t = this;
  return (
    (e = new t.constructor(e)),
    t.s == e.s ? Is(t, e) : Ds(t, ((e.s = -e.s), e))
  );
};
_.precision = _.sd = function (e) {
  var t,
    r,
    n,
    i = this;
  if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(xe + e);
  if (
    ((t = U(i) + 1), (n = i.d.length - 1), (r = n * D + 1), (n = i.d[n]), n)
  ) {
    for (; n % 10 == 0; n /= 10) r--;
    for (n = i.d[0]; n >= 10; n /= 10) r++;
  }
  return e && t > r ? t : r;
};
_.squareRoot = _.sqrt = function () {
  var e,
    t,
    r,
    n,
    i,
    s,
    a,
    o = this,
    u = o.constructor;
  if (o.s < 1) {
    if (!o.s) return new u(0);
    throw Error(ee + 'NaN');
  }
  for (
    e = U(o),
      N = !1,
      i = Math.sqrt(+o),
      i == 0 || i == 1 / 0
        ? ((t = se(o.d)),
          (t.length + e) % 2 == 0 && (t += '0'),
          (i = Math.sqrt(t)),
          (e = ze((e + 1) / 2) - (e < 0 || e % 2)),
          i == 1 / 0
            ? (t = '5e' + e)
            : ((t = i.toExponential()),
              (t = t.slice(0, t.indexOf('e') + 1) + e)),
          (n = new u(t)))
        : (n = new u(i.toString())),
      r = u.precision,
      i = a = r + 3;
    ;

  )
    if (
      ((s = n),
      (n = s.plus(he(o, s, a + 2)).times(0.5)),
      se(s.d).slice(0, a) === (t = se(n.d)).slice(0, a))
    ) {
      if (((t = t.slice(a - 3, a + 1)), i == a && t == '4999')) {
        if ((L(s, r + 1, 0), s.times(s).eq(o))) {
          n = s;
          break;
        }
      } else if (t != '9999') break;
      a += 4;
    }
  return ((N = !0), L(n, r));
};
_.times = _.mul = function (e) {
  var t,
    r,
    n,
    i,
    s,
    a,
    o,
    u,
    c,
    l = this,
    f = l.constructor,
    h = l.d,
    p = (e = new f(e)).d;
  if (!l.s || !e.s) return new f(0);
  for (
    e.s *= l.s,
      r = l.e + e.e,
      u = h.length,
      c = p.length,
      u < c && ((s = h), (h = p), (p = s), (a = u), (u = c), (c = a)),
      s = [],
      a = u + c,
      n = a;
    n--;

  )
    s.push(0);
  for (n = c; --n >= 0; ) {
    for (t = 0, i = u + n; i > n; )
      ((o = s[i] + p[n] * h[i - n - 1] + t),
        (s[i--] = o % H | 0),
        (t = (o / H) | 0));
    s[i] = (s[i] + t) % H | 0;
  }
  for (; !s[--a]; ) s.pop();
  return (t ? ++r : s.shift(), (e.d = s), (e.e = r), N ? L(e, f.precision) : e);
};
_.toDecimalPlaces = _.todp = function (e, t) {
  var r = this,
    n = r.constructor;
  return (
    (r = new n(r)),
    e === void 0
      ? r
      : (oe(e, 0, Qe),
        t === void 0 ? (t = n.rounding) : oe(t, 0, 8),
        L(r, e + U(r) + 1, t))
  );
};
_.toExponential = function (e, t) {
  var r,
    n = this,
    i = n.constructor;
  return (
    e === void 0
      ? (r = Ce(n, !0))
      : (oe(e, 0, Qe),
        t === void 0 ? (t = i.rounding) : oe(t, 0, 8),
        (n = L(new i(n), e + 1, t)),
        (r = Ce(n, !0, e + 1))),
    r
  );
};
_.toFixed = function (e, t) {
  var r,
    n,
    i = this,
    s = i.constructor;
  return e === void 0
    ? Ce(i)
    : (oe(e, 0, Qe),
      t === void 0 ? (t = s.rounding) : oe(t, 0, 8),
      (n = L(new s(i), e + U(i) + 1, t)),
      (r = Ce(n.abs(), !1, e + U(n) + 1)),
      i.isneg() && !i.isZero() ? '-' + r : r);
};
_.toInteger = _.toint = function () {
  var e = this,
    t = e.constructor;
  return L(new t(e), U(e) + 1, t.rounding);
};
_.toNumber = function () {
  return +this;
};
_.toPower = _.pow = function (e) {
  var t,
    r,
    n,
    i,
    s,
    a,
    o = this,
    u = o.constructor,
    c = 12,
    l = +(e = new u(e));
  if (!e.s) return new u(Y);
  if (((o = new u(o)), !o.s)) {
    if (e.s < 1) throw Error(ee + 'Infinity');
    return o;
  }
  if (o.eq(Y)) return o;
  if (((n = u.precision), e.eq(Y))) return L(o, n);
  if (((t = e.e), (r = e.d.length - 1), (a = t >= r), (s = o.s), a)) {
    if ((r = l < 0 ? -l : l) <= Ms) {
      for (
        i = new u(Y), t = Math.ceil(n / D + 4), N = !1;
        r % 2 && ((i = i.times(o)), ni(i.d, t)), (r = ze(r / 2)), r !== 0;

      )
        ((o = o.times(o)), ni(o.d, t));
      return ((N = !0), e.s < 0 ? new u(Y).div(i) : L(i, n));
    }
  } else if (s < 0) throw Error(ee + 'NaN');
  return (
    (s = s < 0 && e.d[Math.max(t, r)] & 1 ? -1 : 1),
    (o.s = 1),
    (N = !1),
    (i = e.times(rt(o, n + c))),
    (N = !0),
    (i = Fs(i)),
    (i.s = s),
    i
  );
};
_.toPrecision = function (e, t) {
  var r,
    n,
    i = this,
    s = i.constructor;
  return (
    e === void 0
      ? ((r = U(i)), (n = Ce(i, r <= s.toExpNeg || r >= s.toExpPos)))
      : (oe(e, 1, Qe),
        t === void 0 ? (t = s.rounding) : oe(t, 0, 8),
        (i = L(new s(i), e, t)),
        (r = U(i)),
        (n = Ce(i, e <= r || r <= s.toExpNeg, e))),
    n
  );
};
_.toSignificantDigits = _.tosd = function (e, t) {
  var r = this,
    n = r.constructor;
  return (
    e === void 0
      ? ((e = n.precision), (t = n.rounding))
      : (oe(e, 1, Qe), t === void 0 ? (t = n.rounding) : oe(t, 0, 8)),
    L(new n(r), e, t)
  );
};
_.toString =
  _.valueOf =
  _.val =
  _.toJSON =
  _[Symbol.for('nodejs.util.inspect.custom')] =
    function () {
      var e = this,
        t = U(e),
        r = e.constructor;
      return Ce(e, t <= r.toExpNeg || t >= r.toExpPos);
    };
function Is(e, t) {
  var r,
    n,
    i,
    s,
    a,
    o,
    u,
    c,
    l = e.constructor,
    f = l.precision;
  if (!e.s || !t.s) return (t.s || (t = new l(e)), N ? L(t, f) : t);
  if (
    ((u = e.d),
    (c = t.d),
    (a = e.e),
    (i = t.e),
    (u = u.slice()),
    (s = a - i),
    s)
  ) {
    for (
      s < 0
        ? ((n = u), (s = -s), (o = c.length))
        : ((n = c), (i = a), (o = u.length)),
        a = Math.ceil(f / D),
        o = a > o ? a + 1 : o + 1,
        s > o && ((s = o), (n.length = 1)),
        n.reverse();
      s--;

    )
      n.push(0);
    n.reverse();
  }
  for (
    o = u.length,
      s = c.length,
      o - s < 0 && ((s = o), (n = c), (c = u), (u = n)),
      r = 0;
    s;

  )
    ((r = ((u[--s] = u[s] + c[s] + r) / H) | 0), (u[s] %= H));
  for (r && (u.unshift(r), ++i), o = u.length; u[--o] == 0; ) u.pop();
  return ((t.d = u), (t.e = i), N ? L(t, f) : t);
}
function oe(e, t, r) {
  if (e !== ~~e || e < t || e > r) throw Error(xe + e);
}
function se(e) {
  var t,
    r,
    n,
    i = e.length - 1,
    s = '',
    a = e[0];
  if (i > 0) {
    for (s += a, t = 1; t < i; t++)
      ((n = e[t] + ''), (r = D - n.length), r && (s += me(r)), (s += n));
    ((a = e[t]), (n = a + ''), (r = D - n.length), r && (s += me(r)));
  } else if (a === 0) return '0';
  for (; a % 10 === 0; ) a /= 10;
  return s + a;
}
var he = (function () {
  function e(n, i) {
    var s,
      a = 0,
      o = n.length;
    for (n = n.slice(); o--; )
      ((s = n[o] * i + a), (n[o] = s % H | 0), (a = (s / H) | 0));
    return (a && n.unshift(a), n);
  }
  function t(n, i, s, a) {
    var o, u;
    if (s != a) u = s > a ? 1 : -1;
    else
      for (o = u = 0; o < s; o++)
        if (n[o] != i[o]) {
          u = n[o] > i[o] ? 1 : -1;
          break;
        }
    return u;
  }
  function r(n, i, s) {
    for (var a = 0; s--; )
      ((n[s] -= a), (a = n[s] < i[s] ? 1 : 0), (n[s] = a * H + n[s] - i[s]));
    for (; !n[0] && n.length > 1; ) n.shift();
  }
  return function (n, i, s, a) {
    var o,
      u,
      c,
      l,
      f,
      h,
      p,
      g,
      d,
      v,
      y,
      m,
      w,
      $,
      O,
      x,
      E,
      C,
      I = n.constructor,
      j = n.s == i.s ? 1 : -1,
      R = n.d,
      P = i.d;
    if (!n.s) return new I(n);
    if (!i.s) throw Error(ee + 'Division by zero');
    for (
      u = n.e - i.e,
        E = P.length,
        O = R.length,
        p = new I(j),
        g = p.d = [],
        c = 0;
      P[c] == (R[c] || 0);

    )
      ++c;
    if (
      (P[c] > (R[c] || 0) && --u,
      s == null
        ? (m = s = I.precision)
        : a
          ? (m = s + (U(n) - U(i)) + 1)
          : (m = s),
      m < 0)
    )
      return new I(0);
    if (((m = (m / D + 2) | 0), (c = 0), E == 1))
      for (l = 0, P = P[0], m++; (c < O || l) && m--; c++)
        ((w = l * H + (R[c] || 0)), (g[c] = (w / P) | 0), (l = w % P | 0));
    else {
      for (
        l = (H / (P[0] + 1)) | 0,
          l > 1 &&
            ((P = e(P, l)), (R = e(R, l)), (E = P.length), (O = R.length)),
          $ = E,
          d = R.slice(0, E),
          v = d.length;
        v < E;

      )
        d[v++] = 0;
      ((C = P.slice()), C.unshift(0), (x = P[0]), P[1] >= H / 2 && ++x);
      do
        ((l = 0),
          (o = t(P, d, E, v)),
          o < 0
            ? ((y = d[0]),
              E != v && (y = y * H + (d[1] || 0)),
              (l = (y / x) | 0),
              l > 1
                ? (l >= H && (l = H - 1),
                  (f = e(P, l)),
                  (h = f.length),
                  (v = d.length),
                  (o = t(f, d, h, v)),
                  o == 1 && (l--, r(f, E < h ? C : P, h)))
                : (l == 0 && (o = l = 1), (f = P.slice())),
              (h = f.length),
              h < v && f.unshift(0),
              r(d, f, v),
              o == -1 &&
                ((v = d.length),
                (o = t(P, d, E, v)),
                o < 1 && (l++, r(d, E < v ? C : P, v))),
              (v = d.length))
            : o === 0 && (l++, (d = [0])),
          (g[c++] = l),
          o && d[0] ? (d[v++] = R[$] || 0) : ((d = [R[$]]), (v = 1)));
      while (($++ < O || d[0] !== void 0) && m--);
    }
    return (g[0] || g.shift(), (p.e = u), L(p, a ? s + U(p) + 1 : s));
  };
})();
function Fs(e, t) {
  var r,
    n,
    i,
    s,
    a,
    o,
    u = 0,
    c = 0,
    l = e.constructor,
    f = l.precision;
  if (U(e) > 16) throw Error(Br + U(e));
  if (!e.s) return new l(Y);
  for (N = !1, o = f, a = new l(0.03125); e.abs().gte(0.1); )
    ((e = e.times(a)), (c += 5));
  for (
    n = ((Math.log(Se(2, c)) / Math.LN10) * 2 + 5) | 0,
      o += n,
      r = i = s = new l(Y),
      l.precision = o;
    ;

  ) {
    if (
      ((i = L(i.times(e), o)),
      (r = r.times(++u)),
      (a = s.plus(he(i, r, o))),
      se(a.d).slice(0, o) === se(s.d).slice(0, o))
    ) {
      for (; c--; ) s = L(s.times(s), o);
      return ((l.precision = f), t == null ? ((N = !0), L(s, f)) : s);
    }
    s = a;
  }
}
function U(e) {
  for (var t = e.e * D, r = e.d[0]; r >= 10; r /= 10) t++;
  return t;
}
function Zt(e, t, r) {
  if (t > e.LN10.sd())
    throw (
      (N = !0),
      r && (e.precision = r),
      Error(ee + 'LN10 precision limit exceeded')
    );
  return L(new e(e.LN10), t);
}
function me(e) {
  for (var t = ''; e--; ) t += '0';
  return t;
}
function rt(e, t) {
  var r,
    n,
    i,
    s,
    a,
    o,
    u,
    c,
    l,
    f = 1,
    h = 10,
    p = e,
    g = p.d,
    d = p.constructor,
    v = d.precision;
  if (p.s < 1) throw Error(ee + (p.s ? 'NaN' : '-Infinity'));
  if (p.eq(Y)) return new d(0);
  if ((t == null ? ((N = !1), (c = v)) : (c = t), p.eq(10)))
    return (t == null && (N = !0), Zt(d, c));
  if (
    ((c += h),
    (d.precision = c),
    (r = se(g)),
    (n = r.charAt(0)),
    (s = U(p)),
    Math.abs(s) < 15e14)
  ) {
    for (; (n < 7 && n != 1) || (n == 1 && r.charAt(1) > 3); )
      ((p = p.times(e)), (r = se(p.d)), (n = r.charAt(0)), f++);
    ((s = U(p)),
      n > 1 ? ((p = new d('0.' + r)), s++) : (p = new d(n + '.' + r.slice(1))));
  } else
    return (
      (u = Zt(d, c + 2, v).times(s + '')),
      (p = rt(new d(n + '.' + r.slice(1)), c - h).plus(u)),
      (d.precision = v),
      t == null ? ((N = !0), L(p, v)) : p
    );
  for (
    o = a = p = he(p.minus(Y), p.plus(Y), c), l = L(p.times(p), c), i = 3;
    ;

  ) {
    if (
      ((a = L(a.times(l), c)),
      (u = o.plus(he(a, new d(i), c))),
      se(u.d).slice(0, c) === se(o.d).slice(0, c))
    )
      return (
        (o = o.times(2)),
        s !== 0 && (o = o.plus(Zt(d, c + 2, v).times(s + ''))),
        (o = he(o, new d(f), c)),
        (d.precision = v),
        t == null ? ((N = !0), L(o, v)) : o
      );
    ((o = u), (i += 2));
  }
}
function ri(e, t) {
  var r, n, i;
  for (
    (r = t.indexOf('.')) > -1 && (t = t.replace('.', '')),
      (n = t.search(/e/i)) > 0
        ? (r < 0 && (r = n), (r += +t.slice(n + 1)), (t = t.substring(0, n)))
        : r < 0 && (r = t.length),
      n = 0;
    t.charCodeAt(n) === 48;

  )
    ++n;
  for (i = t.length; t.charCodeAt(i - 1) === 48; ) --i;
  if (((t = t.slice(n, i)), t)) {
    if (
      ((i -= n),
      (r = r - n - 1),
      (e.e = ze(r / D)),
      (e.d = []),
      (n = (r + 1) % D),
      r < 0 && (n += D),
      n < i)
    ) {
      for (n && e.d.push(+t.slice(0, n)), i -= D; n < i; )
        e.d.push(+t.slice(n, (n += D)));
      ((t = t.slice(n)), (n = D - t.length));
    } else n -= i;
    for (; n--; ) t += '0';
    if ((e.d.push(+t), N && (e.e > At || e.e < -At))) throw Error(Br + r);
  } else ((e.s = 0), (e.e = 0), (e.d = [0]));
  return e;
}
function L(e, t, r) {
  var n,
    i,
    s,
    a,
    o,
    u,
    c,
    l,
    f = e.d;
  for (a = 1, s = f[0]; s >= 10; s /= 10) a++;
  if (((n = t - a), n < 0)) ((n += D), (i = t), (c = f[(l = 0)]));
  else {
    if (((l = Math.ceil((n + 1) / D)), (s = f.length), l >= s)) return e;
    for (c = s = f[l], a = 1; s >= 10; s /= 10) a++;
    ((n %= D), (i = n - D + a));
  }
  if (
    (r !== void 0 &&
      ((s = Se(10, a - i - 1)),
      (o = (c / s) % 10 | 0),
      (u = t < 0 || f[l + 1] !== void 0 || c % s),
      (u =
        r < 4
          ? (o || u) && (r == 0 || r == (e.s < 0 ? 3 : 2))
          : o > 5 ||
            (o == 5 &&
              (r == 4 ||
                u ||
                (r == 6 &&
                  (n > 0 ? (i > 0 ? c / Se(10, a - i) : 0) : f[l - 1]) % 10 &
                    1) ||
                r == (e.s < 0 ? 8 : 7))))),
    t < 1 || !f[0])
  )
    return (
      u
        ? ((s = U(e)),
          (f.length = 1),
          (t = t - s - 1),
          (f[0] = Se(10, (D - (t % D)) % D)),
          (e.e = ze(-t / D) || 0))
        : ((f.length = 1), (f[0] = e.e = e.s = 0)),
      e
    );
  if (
    (n == 0
      ? ((f.length = l), (s = 1), l--)
      : ((f.length = l + 1),
        (s = Se(10, D - n)),
        (f[l] = i > 0 ? ((c / Se(10, a - i)) % Se(10, i) | 0) * s : 0)),
    u)
  )
    for (;;)
      if (l == 0) {
        (f[0] += s) == H && ((f[0] = 1), ++e.e);
        break;
      } else {
        if (((f[l] += s), f[l] != H)) break;
        ((f[l--] = 0), (s = 1));
      }
  for (n = f.length; f[--n] === 0; ) f.pop();
  if (N && (e.e > At || e.e < -At)) throw Error(Br + U(e));
  return e;
}
function Ds(e, t) {
  var r,
    n,
    i,
    s,
    a,
    o,
    u,
    c,
    l,
    f,
    h = e.constructor,
    p = h.precision;
  if (!e.s || !t.s)
    return (t.s ? (t.s = -t.s) : (t = new h(e)), N ? L(t, p) : t);
  if (
    ((u = e.d),
    (f = t.d),
    (n = t.e),
    (c = e.e),
    (u = u.slice()),
    (a = c - n),
    a)
  ) {
    for (
      l = a < 0,
        l
          ? ((r = u), (a = -a), (o = f.length))
          : ((r = f), (n = c), (o = u.length)),
        i = Math.max(Math.ceil(p / D), o) + 2,
        a > i && ((a = i), (r.length = 1)),
        r.reverse(),
        i = a;
      i--;

    )
      r.push(0);
    r.reverse();
  } else {
    for (i = u.length, o = f.length, l = i < o, l && (o = i), i = 0; i < o; i++)
      if (u[i] != f[i]) {
        l = u[i] < f[i];
        break;
      }
    a = 0;
  }
  for (
    l && ((r = u), (u = f), (f = r), (t.s = -t.s)),
      o = u.length,
      i = f.length - o;
    i > 0;
    --i
  )
    u[o++] = 0;
  for (i = f.length; i > a; ) {
    if (u[--i] < f[i]) {
      for (s = i; s && u[--s] === 0; ) u[s] = H - 1;
      (--u[s], (u[i] += H));
    }
    u[i] -= f[i];
  }
  for (; u[--o] === 0; ) u.pop();
  for (; u[0] === 0; u.shift()) --n;
  return u[0] ? ((t.d = u), (t.e = n), N ? L(t, p) : t) : new h(0);
}
function Ce(e, t, r) {
  var n,
    i = U(e),
    s = se(e.d),
    a = s.length;
  return (
    t
      ? (r && (n = r - a) > 0
          ? (s = s.charAt(0) + '.' + s.slice(1) + me(n))
          : a > 1 && (s = s.charAt(0) + '.' + s.slice(1)),
        (s = s + (i < 0 ? 'e' : 'e+') + i))
      : i < 0
        ? ((s = '0.' + me(-i - 1) + s), r && (n = r - a) > 0 && (s += me(n)))
        : i >= a
          ? ((s += me(i + 1 - a)),
            r && (n = r - i - 1) > 0 && (s = s + '.' + me(n)))
          : ((n = i + 1) < a && (s = s.slice(0, n) + '.' + s.slice(n)),
            r && (n = r - a) > 0 && (i + 1 === a && (s += '.'), (s += me(n)))),
    e.s < 0 ? '-' + s : s
  );
}
function ni(e, t) {
  if (e.length > t) return ((e.length = t), !0);
}
function js(e) {
  var t, r, n;
  function i(s) {
    var a = this;
    if (!(a instanceof i)) return new i(s);
    if (((a.constructor = i), s instanceof i)) {
      ((a.s = s.s), (a.e = s.e), (a.d = (s = s.d) ? s.slice() : s));
      return;
    }
    if (typeof s == 'number') {
      if (s * 0 !== 0) throw Error(xe + s);
      if (s > 0) a.s = 1;
      else if (s < 0) ((s = -s), (a.s = -1));
      else {
        ((a.s = 0), (a.e = 0), (a.d = [0]));
        return;
      }
      if (s === ~~s && s < 1e7) {
        ((a.e = 0), (a.d = [s]));
        return;
      }
      return ri(a, s.toString());
    } else if (typeof s != 'string') throw Error(xe + s);
    if (
      (s.charCodeAt(0) === 45 ? ((s = s.slice(1)), (a.s = -1)) : (a.s = 1),
      Eb.test(s))
    )
      ri(a, s);
    else throw Error(xe + s);
  }
  if (
    ((i.prototype = _),
    (i.ROUND_UP = 0),
    (i.ROUND_DOWN = 1),
    (i.ROUND_CEIL = 2),
    (i.ROUND_FLOOR = 3),
    (i.ROUND_HALF_UP = 4),
    (i.ROUND_HALF_DOWN = 5),
    (i.ROUND_HALF_EVEN = 6),
    (i.ROUND_HALF_CEIL = 7),
    (i.ROUND_HALF_FLOOR = 8),
    (i.clone = js),
    (i.config = i.set = Ab),
    e === void 0 && (e = {}),
    e)
  )
    for (
      n = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'LN10'], t = 0;
      t < n.length;

    )
      e.hasOwnProperty((r = n[t++])) || (e[r] = this[r]);
  return (i.config(e), i);
}
function Ab(e) {
  if (!e || typeof e != 'object') throw Error(ee + 'Object expected');
  var t,
    r,
    n,
    i = [
      'precision',
      1,
      Qe,
      'rounding',
      0,
      8,
      'toExpNeg',
      -1 / 0,
      0,
      'toExpPos',
      0,
      1 / 0,
    ];
  for (t = 0; t < i.length; t += 3)
    if ((n = e[(r = i[t])]) !== void 0)
      if (ze(n) === n && n >= i[t + 1] && n <= i[t + 2]) this[r] = n;
      else throw Error(xe + r + ': ' + n);
  if ((n = e[(r = 'LN10')]) !== void 0)
    if (n == Math.LN10) this[r] = new this(n);
    else throw Error(xe + r + ': ' + n);
  return this;
}
var Hr = js(Ob);
Y = new Hr(1);
const E_ = Hr;
var Sb = 'Invariant failed';
function A_(e, t) {
  throw new Error(Sb);
}
function xb(e) {
  var t = e == null ? 0 : e.length;
  return t ? e[t - 1] : void 0;
}
var Cb = xb;
const S_ = M(Cb);
var Ns = { exports: {} },
  Pb = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED',
  Tb = Pb,
  Rb = Tb;
function qs() {}
function ks() {}
ks.resetWarningCache = qs;
var Lb = function () {
  function e(n, i, s, a, o, u) {
    if (u !== Rb) {
      var c = new Error(
        'Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types'
      );
      throw ((c.name = 'Invariant Violation'), c);
    }
  }
  e.isRequired = e;
  function t() {
    return e;
  }
  var r = {
    array: e,
    bigint: e,
    bool: e,
    func: e,
    number: e,
    object: e,
    string: e,
    symbol: e,
    any: e,
    arrayOf: t,
    element: e,
    elementType: e,
    instanceOf: t,
    node: e,
    objectOf: t,
    oneOf: t,
    oneOfType: t,
    shape: t,
    exact: t,
    checkPropTypes: ks,
    resetWarningCache: qs,
  };
  return ((r.PropTypes = r), r);
};
Ns.exports = Lb();
var Mb = Ns.exports;
const x_ = M(Mb);
var Ib = Object.getOwnPropertyNames,
  Fb = Object.getOwnPropertySymbols,
  Db = Object.prototype.hasOwnProperty;
function ii(e, t) {
  return function (n, i, s) {
    return e(n, i, s) && t(n, i, s);
  };
}
function vt(e) {
  return function (r, n, i) {
    if (!r || !n || typeof r != 'object' || typeof n != 'object')
      return e(r, n, i);
    var s = i.cache,
      a = s.get(r),
      o = s.get(n);
    if (a && o) return a === n && o === r;
    (s.set(r, n), s.set(n, r));
    var u = e(r, n, i);
    return (s.delete(r), s.delete(n), u);
  };
}
function si(e) {
  return Ib(e).concat(Fb(e));
}
var jb =
  Object.hasOwn ||
  function (e, t) {
    return Db.call(e, t);
  };
function Re(e, t) {
  return e === t || (!e && !t && e !== e && t !== t);
}
var Nb = '__v',
  qb = '__o',
  kb = '_owner',
  ai = Object.getOwnPropertyDescriptor,
  oi = Object.keys;
function Ub(e, t, r) {
  var n = e.length;
  if (t.length !== n) return !1;
  for (; n-- > 0; ) if (!r.equals(e[n], t[n], n, n, e, t, r)) return !1;
  return !0;
}
function Bb(e, t) {
  return Re(e.getTime(), t.getTime());
}
function Hb(e, t) {
  return (
    e.name === t.name &&
    e.message === t.message &&
    e.cause === t.cause &&
    e.stack === t.stack
  );
}
function Gb(e, t) {
  return e === t;
}
function ui(e, t, r) {
  var n = e.size;
  if (n !== t.size) return !1;
  if (!n) return !0;
  for (
    var i = new Array(n), s = e.entries(), a, o, u = 0;
    (a = s.next()) && !a.done;

  ) {
    for (var c = t.entries(), l = !1, f = 0; (o = c.next()) && !o.done; ) {
      if (i[f]) {
        f++;
        continue;
      }
      var h = a.value,
        p = o.value;
      if (
        r.equals(h[0], p[0], u, f, e, t, r) &&
        r.equals(h[1], p[1], h[0], p[0], e, t, r)
      ) {
        l = i[f] = !0;
        break;
      }
      f++;
    }
    if (!l) return !1;
    u++;
  }
  return !0;
}
var Wb = Re;
function Kb(e, t, r) {
  var n = oi(e),
    i = n.length;
  if (oi(t).length !== i) return !1;
  for (; i-- > 0; ) if (!Us(e, t, r, n[i])) return !1;
  return !0;
}
function Je(e, t, r) {
  var n = si(e),
    i = n.length;
  if (si(t).length !== i) return !1;
  for (var s, a, o; i-- > 0; )
    if (
      ((s = n[i]),
      !Us(e, t, r, s) ||
        ((a = ai(e, s)),
        (o = ai(t, s)),
        (a || o) &&
          (!a ||
            !o ||
            a.configurable !== o.configurable ||
            a.enumerable !== o.enumerable ||
            a.writable !== o.writable)))
    )
      return !1;
  return !0;
}
function Qb(e, t) {
  return Re(e.valueOf(), t.valueOf());
}
function zb(e, t) {
  return e.source === t.source && e.flags === t.flags;
}
function ci(e, t, r) {
  var n = e.size;
  if (n !== t.size) return !1;
  if (!n) return !0;
  for (
    var i = new Array(n), s = e.values(), a, o;
    (a = s.next()) && !a.done;

  ) {
    for (var u = t.values(), c = !1, l = 0; (o = u.next()) && !o.done; ) {
      if (!i[l] && r.equals(a.value, o.value, a.value, o.value, e, t, r)) {
        c = i[l] = !0;
        break;
      }
      l++;
    }
    if (!c) return !1;
  }
  return !0;
}
function Vb(e, t) {
  var r = e.length;
  if (t.length !== r) return !1;
  for (; r-- > 0; ) if (e[r] !== t[r]) return !1;
  return !0;
}
function Xb(e, t) {
  return (
    e.hostname === t.hostname &&
    e.pathname === t.pathname &&
    e.protocol === t.protocol &&
    e.port === t.port &&
    e.hash === t.hash &&
    e.username === t.username &&
    e.password === t.password
  );
}
function Us(e, t, r, n) {
  return (n === kb || n === qb || n === Nb) && (e.$$typeof || t.$$typeof)
    ? !0
    : jb(t, n) && r.equals(e[n], t[n], n, n, e, t, r);
}
var Yb = '[object Arguments]',
  Jb = '[object Boolean]',
  Zb = '[object Date]',
  e0 = '[object Error]',
  t0 = '[object Map]',
  r0 = '[object Number]',
  n0 = '[object Object]',
  i0 = '[object RegExp]',
  s0 = '[object Set]',
  a0 = '[object String]',
  o0 = '[object URL]',
  u0 = Array.isArray,
  li =
    typeof ArrayBuffer == 'function' && ArrayBuffer.isView
      ? ArrayBuffer.isView
      : null,
  fi = Object.assign,
  c0 = Object.prototype.toString.call.bind(Object.prototype.toString);
function l0(e) {
  var t = e.areArraysEqual,
    r = e.areDatesEqual,
    n = e.areErrorsEqual,
    i = e.areFunctionsEqual,
    s = e.areMapsEqual,
    a = e.areNumbersEqual,
    o = e.areObjectsEqual,
    u = e.arePrimitiveWrappersEqual,
    c = e.areRegExpsEqual,
    l = e.areSetsEqual,
    f = e.areTypedArraysEqual,
    h = e.areUrlsEqual;
  return function (g, d, v) {
    if (g === d) return !0;
    if (g == null || d == null) return !1;
    var y = typeof g;
    if (y !== typeof d) return !1;
    if (y !== 'object')
      return y === 'number' ? a(g, d, v) : y === 'function' ? i(g, d, v) : !1;
    var m = g.constructor;
    if (m !== d.constructor) return !1;
    if (m === Object) return o(g, d, v);
    if (u0(g)) return t(g, d, v);
    if (li != null && li(g)) return f(g, d, v);
    if (m === Date) return r(g, d, v);
    if (m === RegExp) return c(g, d, v);
    if (m === Map) return s(g, d, v);
    if (m === Set) return l(g, d, v);
    var w = c0(g);
    return w === Zb
      ? r(g, d, v)
      : w === i0
        ? c(g, d, v)
        : w === t0
          ? s(g, d, v)
          : w === s0
            ? l(g, d, v)
            : w === n0
              ? typeof g.then != 'function' &&
                typeof d.then != 'function' &&
                o(g, d, v)
              : w === o0
                ? h(g, d, v)
                : w === e0
                  ? n(g, d, v)
                  : w === Yb
                    ? o(g, d, v)
                    : w === Jb || w === r0 || w === a0
                      ? u(g, d, v)
                      : !1;
  };
}
function f0(e) {
  var t = e.circular,
    r = e.createCustomConfig,
    n = e.strict,
    i = {
      areArraysEqual: n ? Je : Ub,
      areDatesEqual: Bb,
      areErrorsEqual: Hb,
      areFunctionsEqual: Gb,
      areMapsEqual: n ? ii(ui, Je) : ui,
      areNumbersEqual: Wb,
      areObjectsEqual: n ? Je : Kb,
      arePrimitiveWrappersEqual: Qb,
      areRegExpsEqual: zb,
      areSetsEqual: n ? ii(ci, Je) : ci,
      areTypedArraysEqual: n ? Je : Vb,
      areUrlsEqual: Xb,
    };
  if ((r && (i = fi({}, i, r(i))), t)) {
    var s = vt(i.areArraysEqual),
      a = vt(i.areMapsEqual),
      o = vt(i.areObjectsEqual),
      u = vt(i.areSetsEqual);
    i = fi({}, i, {
      areArraysEqual: s,
      areMapsEqual: a,
      areObjectsEqual: o,
      areSetsEqual: u,
    });
  }
  return i;
}
function h0(e) {
  return function (t, r, n, i, s, a, o) {
    return e(t, r, o);
  };
}
function d0(e) {
  var t = e.circular,
    r = e.comparator,
    n = e.createState,
    i = e.equals,
    s = e.strict;
  if (n)
    return function (u, c) {
      var l = n(),
        f = l.cache,
        h = f === void 0 ? (t ? new WeakMap() : void 0) : f,
        p = l.meta;
      return r(u, c, { cache: h, equals: i, meta: p, strict: s });
    };
  if (t)
    return function (u, c) {
      return r(u, c, {
        cache: new WeakMap(),
        equals: i,
        meta: void 0,
        strict: s,
      });
    };
  var a = { cache: void 0, equals: i, meta: void 0, strict: s };
  return function (u, c) {
    return r(u, c, a);
  };
}
var C_ = $e();
$e({ strict: !0 });
$e({ circular: !0 });
$e({ circular: !0, strict: !0 });
$e({
  createInternalComparator: function () {
    return Re;
  },
});
$e({
  strict: !0,
  createInternalComparator: function () {
    return Re;
  },
});
$e({
  circular: !0,
  createInternalComparator: function () {
    return Re;
  },
});
$e({
  circular: !0,
  createInternalComparator: function () {
    return Re;
  },
  strict: !0,
});
function $e(e) {
  e === void 0 && (e = {});
  var t = e.circular,
    r = t === void 0 ? !1 : t,
    n = e.createInternalComparator,
    i = e.createState,
    s = e.strict,
    a = s === void 0 ? !1 : s,
    o = f0(e),
    u = l0(o),
    c = n ? n(u) : h0(u);
  return d0({
    circular: r,
    comparator: u,
    createState: i,
    equals: c,
    strict: a,
  });
}
var p0 = Nt,
  v0 = Rs,
  g0 = le;
function y0(e, t) {
  return e && e.length ? p0(e, g0(t), v0) : void 0;
}
var m0 = y0;
const P_ = M(m0);
var b0 = Nt,
  w0 = le,
  _0 = Ls;
function $0(e, t) {
  return e && e.length ? b0(e, w0(t), _0) : void 0;
}
var O0 = $0;
const T_ = M(O0);
var E0 = ms,
  A0 = E0(Object.getPrototypeOf, Object),
  S0 = A0,
  x0 = ge,
  C0 = S0,
  P0 = ye,
  T0 = '[object Object]',
  R0 = Function.prototype,
  L0 = Object.prototype,
  Bs = R0.toString,
  M0 = L0.hasOwnProperty,
  I0 = Bs.call(Object);
function F0(e) {
  if (!P0(e) || x0(e) != T0) return !1;
  var t = C0(e);
  if (t === null) return !0;
  var r = M0.call(t, 'constructor') && t.constructor;
  return typeof r == 'function' && r instanceof r && Bs.call(r) == I0;
}
var D0 = F0;
const R_ = M(D0);
var j0 = ge,
  N0 = ye,
  q0 = '[object Boolean]';
function k0(e) {
  return e === !0 || e === !1 || (N0(e) && j0(e) == q0);
}
var U0 = k0;
const L_ = M(U0);
var B0 = Math.ceil,
  H0 = Math.max;
function G0(e, t, r, n) {
  for (var i = -1, s = H0(B0((t - e) / (r || 1)), 0), a = Array(s); s--; )
    ((a[n ? s : ++i] = e), (e += r));
  return a;
}
var W0 = G0,
  K0 = Ts,
  Q0 = 1 / 0,
  z0 = 17976931348623157e292;
function V0(e) {
  if (!e) return e === 0 ? e : 0;
  if (((e = K0(e)), e === Q0 || e === -1 / 0)) {
    var t = e < 0 ? -1 : 1;
    return t * z0;
  }
  return e === e ? e : 0;
}
var Hs = V0,
  X0 = W0,
  Y0 = jt,
  er = Hs;
function J0(e) {
  return function (t, r, n) {
    return (
      n && typeof n != 'number' && Y0(t, r, n) && (r = n = void 0),
      (t = er(t)),
      r === void 0 ? ((r = t), (t = 0)) : (r = er(r)),
      (n = n === void 0 ? (t < r ? 1 : -1) : er(n)),
      X0(t, r, n, e)
    );
  };
}
var Z0 = J0,
  e1 = Z0,
  t1 = e1(),
  r1 = t1;
const M_ = M(r1);
var n1 = Ur;
function i1(e, t) {
  var r;
  return (
    n1(e, function (n, i, s) {
      return ((r = t(n, i, s)), !r);
    }),
    !!r
  );
}
var s1 = i1,
  a1 = ls,
  o1 = le,
  u1 = s1,
  c1 = K,
  l1 = jt;
function f1(e, t, r) {
  var n = c1(e) ? a1 : u1;
  return (r && l1(e, t, r) && (t = void 0), n(e, o1(t)));
}
var h1 = f1;
const I_ = M(h1);
var hi = Ps;
function d1(e, t, r) {
  t == '__proto__' && hi
    ? hi(e, t, { configurable: !0, enumerable: !0, value: r, writable: !0 })
    : (e[t] = r);
}
var p1 = d1,
  v1 = p1,
  g1 = xs,
  y1 = le;
function m1(e, t) {
  var r = {};
  return (
    (t = y1(t)),
    g1(e, function (n, i, s) {
      v1(r, i, t(n, i, s));
    }),
    r
  );
}
var b1 = m1;
const F_ = M(b1);
function w1(e, t) {
  for (var r = -1, n = e == null ? 0 : e.length; ++r < n; )
    if (!t(e[r], r, e)) return !1;
  return !0;
}
var _1 = w1,
  $1 = Ur;
function O1(e, t) {
  var r = !0;
  return (
    $1(e, function (n, i, s) {
      return ((r = !!t(n, i, s)), r);
    }),
    r
  );
}
var E1 = O1,
  A1 = _1,
  S1 = E1,
  x1 = le,
  C1 = K,
  P1 = jt;
function T1(e, t, r) {
  var n = C1(e) ? A1 : S1;
  return (r && P1(e, t, r) && (t = void 0), n(e, x1(t)));
}
var R1 = T1;
const D_ = M(R1);
var L1 = le,
  M1 = ut,
  I1 = Dt;
function F1(e) {
  return function (t, r, n) {
    var i = Object(t);
    if (!M1(t)) {
      var s = L1(r);
      ((t = I1(t)),
        (r = function (o) {
          return s(i[o], o, i);
        }));
    }
    var a = e(t, r, n);
    return a > -1 ? i[s ? t[a] : a] : void 0;
  };
}
var D1 = F1,
  j1 = Hs;
function N1(e) {
  var t = j1(e),
    r = t % 1;
  return t === t ? (r ? t - r : t) : 0;
}
var q1 = N1,
  k1 = Es,
  U1 = le,
  B1 = q1,
  H1 = Math.max;
function G1(e, t, r) {
  var n = e == null ? 0 : e.length;
  if (!n) return -1;
  var i = r == null ? 0 : B1(r);
  return (i < 0 && (i = H1(n + i, 0)), k1(e, U1(t), i));
}
var W1 = G1,
  K1 = D1,
  Q1 = W1,
  z1 = K1(Q1),
  V1 = z1;
const j_ = M(V1),
  X1 = ['top', 'right', 'bottom', 'left'],
  be = Math.min,
  X = Math.max,
  St = Math.round,
  gt = Math.floor,
  ae = e => ({ x: e, y: e }),
  Y1 = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' },
  J1 = { start: 'end', end: 'start' };
function mr(e, t, r) {
  return X(e, be(t, r));
}
function pe(e, t) {
  return typeof e == 'function' ? e(t) : e;
}
function ve(e) {
  return e.split('-')[0];
}
function Ve(e) {
  return e.split('-')[1];
}
function Gr(e) {
  return e === 'x' ? 'y' : 'x';
}
function Wr(e) {
  return e === 'y' ? 'height' : 'width';
}
function de(e) {
  return ['top', 'bottom'].includes(ve(e)) ? 'y' : 'x';
}
function Kr(e) {
  return Gr(de(e));
}
function Z1(e, t, r) {
  r === void 0 && (r = !1);
  const n = Ve(e),
    i = Kr(e),
    s = Wr(i);
  let a =
    i === 'x'
      ? n === (r ? 'end' : 'start')
        ? 'right'
        : 'left'
      : n === 'start'
        ? 'bottom'
        : 'top';
  return (t.reference[s] > t.floating[s] && (a = xt(a)), [a, xt(a)]);
}
function ew(e) {
  const t = xt(e);
  return [br(e), t, br(t)];
}
function br(e) {
  return e.replace(/start|end/g, t => J1[t]);
}
function tw(e, t, r) {
  const n = ['left', 'right'],
    i = ['right', 'left'],
    s = ['top', 'bottom'],
    a = ['bottom', 'top'];
  switch (e) {
    case 'top':
    case 'bottom':
      return r ? (t ? i : n) : t ? n : i;
    case 'left':
    case 'right':
      return t ? s : a;
    default:
      return [];
  }
}
function rw(e, t, r, n) {
  const i = Ve(e);
  let s = tw(ve(e), r === 'start', n);
  return (
    i && ((s = s.map(a => a + '-' + i)), t && (s = s.concat(s.map(br)))),
    s
  );
}
function xt(e) {
  return e.replace(/left|right|bottom|top/g, t => Y1[t]);
}
function nw(e) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...e };
}
function Gs(e) {
  return typeof e != 'number'
    ? nw(e)
    : { top: e, right: e, bottom: e, left: e };
}
function Ct(e) {
  const { x: t, y: r, width: n, height: i } = e;
  return {
    width: n,
    height: i,
    top: r,
    left: t,
    right: t + n,
    bottom: r + i,
    x: t,
    y: r,
  };
}
function di(e, t, r) {
  let { reference: n, floating: i } = e;
  const s = de(t),
    a = Kr(t),
    o = Wr(a),
    u = ve(t),
    c = s === 'y',
    l = n.x + n.width / 2 - i.width / 2,
    f = n.y + n.height / 2 - i.height / 2,
    h = n[o] / 2 - i[o] / 2;
  let p;
  switch (u) {
    case 'top':
      p = { x: l, y: n.y - i.height };
      break;
    case 'bottom':
      p = { x: l, y: n.y + n.height };
      break;
    case 'right':
      p = { x: n.x + n.width, y: f };
      break;
    case 'left':
      p = { x: n.x - i.width, y: f };
      break;
    default:
      p = { x: n.x, y: n.y };
  }
  switch (Ve(t)) {
    case 'start':
      p[a] -= h * (r && c ? -1 : 1);
      break;
    case 'end':
      p[a] += h * (r && c ? -1 : 1);
      break;
  }
  return p;
}
const iw = async (e, t, r) => {
  const {
      placement: n = 'bottom',
      strategy: i = 'absolute',
      middleware: s = [],
      platform: a,
    } = r,
    o = s.filter(Boolean),
    u = await (a.isRTL == null ? void 0 : a.isRTL(t));
  let c = await a.getElementRects({ reference: e, floating: t, strategy: i }),
    { x: l, y: f } = di(c, n, u),
    h = n,
    p = {},
    g = 0;
  for (let d = 0; d < o.length; d++) {
    const { name: v, fn: y } = o[d],
      {
        x: m,
        y: w,
        data: $,
        reset: O,
      } = await y({
        x: l,
        y: f,
        initialPlacement: n,
        placement: h,
        strategy: i,
        middlewareData: p,
        rects: c,
        platform: a,
        elements: { reference: e, floating: t },
      });
    ((l = m ?? l),
      (f = w ?? f),
      (p = { ...p, [v]: { ...p[v], ...$ } }),
      O &&
        g <= 50 &&
        (g++,
        typeof O == 'object' &&
          (O.placement && (h = O.placement),
          O.rects &&
            (c =
              O.rects === !0
                ? await a.getElementRects({
                    reference: e,
                    floating: t,
                    strategy: i,
                  })
                : O.rects),
          ({ x: l, y: f } = di(c, h, u))),
        (d = -1)));
  }
  return { x: l, y: f, placement: h, strategy: i, middlewareData: p };
};
async function nt(e, t) {
  var r;
  t === void 0 && (t = {});
  const { x: n, y: i, platform: s, rects: a, elements: o, strategy: u } = e,
    {
      boundary: c = 'clippingAncestors',
      rootBoundary: l = 'viewport',
      elementContext: f = 'floating',
      altBoundary: h = !1,
      padding: p = 0,
    } = pe(t, e),
    g = Gs(p),
    v = o[h ? (f === 'floating' ? 'reference' : 'floating') : f],
    y = Ct(
      await s.getClippingRect({
        element:
          (r = await (s.isElement == null ? void 0 : s.isElement(v))) == null ||
          r
            ? v
            : v.contextElement ||
              (await (s.getDocumentElement == null
                ? void 0
                : s.getDocumentElement(o.floating))),
        boundary: c,
        rootBoundary: l,
        strategy: u,
      })
    ),
    m =
      f === 'floating'
        ? { x: n, y: i, width: a.floating.width, height: a.floating.height }
        : a.reference,
    w = await (s.getOffsetParent == null
      ? void 0
      : s.getOffsetParent(o.floating)),
    $ = (await (s.isElement == null ? void 0 : s.isElement(w)))
      ? (await (s.getScale == null ? void 0 : s.getScale(w))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    O = Ct(
      s.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: o,
            rect: m,
            offsetParent: w,
            strategy: u,
          })
        : m
    );
  return {
    top: (y.top - O.top + g.top) / $.y,
    bottom: (O.bottom - y.bottom + g.bottom) / $.y,
    left: (y.left - O.left + g.left) / $.x,
    right: (O.right - y.right + g.right) / $.x,
  };
}
const sw = e => ({
    name: 'arrow',
    options: e,
    async fn(t) {
      const {
          x: r,
          y: n,
          placement: i,
          rects: s,
          platform: a,
          elements: o,
          middlewareData: u,
        } = t,
        { element: c, padding: l = 0 } = pe(e, t) || {};
      if (c == null) return {};
      const f = Gs(l),
        h = { x: r, y: n },
        p = Kr(i),
        g = Wr(p),
        d = await a.getDimensions(c),
        v = p === 'y',
        y = v ? 'top' : 'left',
        m = v ? 'bottom' : 'right',
        w = v ? 'clientHeight' : 'clientWidth',
        $ = s.reference[g] + s.reference[p] - h[p] - s.floating[g],
        O = h[p] - s.reference[p],
        x = await (a.getOffsetParent == null ? void 0 : a.getOffsetParent(c));
      let E = x ? x[w] : 0;
      (!E || !(await (a.isElement == null ? void 0 : a.isElement(x)))) &&
        (E = o.floating[w] || s.floating[g]);
      const C = $ / 2 - O / 2,
        I = E / 2 - d[g] / 2 - 1,
        j = be(f[y], I),
        R = be(f[m], I),
        P = j,
        W = E - d[g] - R,
        Q = E / 2 - d[g] / 2 + C,
        z = mr(P, Q, W),
        te =
          !u.arrow &&
          Ve(i) != null &&
          Q !== z &&
          s.reference[g] / 2 - (Q < P ? j : R) - d[g] / 2 < 0,
        V = te ? (Q < P ? Q - P : Q - W) : 0;
      return {
        [p]: h[p] + V,
        data: {
          [p]: z,
          centerOffset: Q - z - V,
          ...(te && { alignmentOffset: V }),
        },
        reset: te,
      };
    },
  }),
  aw = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'flip',
        options: e,
        async fn(t) {
          var r, n;
          const {
              placement: i,
              middlewareData: s,
              rects: a,
              initialPlacement: o,
              platform: u,
              elements: c,
            } = t,
            {
              mainAxis: l = !0,
              crossAxis: f = !0,
              fallbackPlacements: h,
              fallbackStrategy: p = 'bestFit',
              fallbackAxisSideDirection: g = 'none',
              flipAlignment: d = !0,
              ...v
            } = pe(e, t);
          if ((r = s.arrow) != null && r.alignmentOffset) return {};
          const y = ve(i),
            m = de(o),
            w = ve(o) === o,
            $ = await (u.isRTL == null ? void 0 : u.isRTL(c.floating)),
            O = h || (w || !d ? [xt(o)] : ew(o)),
            x = g !== 'none';
          !h && x && O.push(...rw(o, d, g, $));
          const E = [o, ...O],
            C = await nt(t, v),
            I = [];
          let j = ((n = s.flip) == null ? void 0 : n.overflows) || [];
          if ((l && I.push(C[y]), f)) {
            const z = Z1(i, a, $);
            I.push(C[z[0]], C[z[1]]);
          }
          if (
            ((j = [...j, { placement: i, overflows: I }]),
            !I.every(z => z <= 0))
          ) {
            var R, P;
            const z = (((R = s.flip) == null ? void 0 : R.index) || 0) + 1,
              te = E[z];
            if (te) {
              var W;
              const b = f === 'alignment' ? m !== de(te) : !1,
                A = ((W = j[0]) == null ? void 0 : W.overflows[0]) > 0;
              if (!b || A)
                return {
                  data: { index: z, overflows: j },
                  reset: { placement: te },
                };
            }
            let V =
              (P = j
                .filter(b => b.overflows[0] <= 0)
                .sort((b, A) => b.overflows[1] - A.overflows[1])[0]) == null
                ? void 0
                : P.placement;
            if (!V)
              switch (p) {
                case 'bestFit': {
                  var Q;
                  const b =
                    (Q = j
                      .filter(A => {
                        if (x) {
                          const S = de(A.placement);
                          return S === m || S === 'y';
                        }
                        return !0;
                      })
                      .map(A => [
                        A.placement,
                        A.overflows
                          .filter(S => S > 0)
                          .reduce((S, q) => S + q, 0),
                      ])
                      .sort((A, S) => A[1] - S[1])[0]) == null
                      ? void 0
                      : Q[0];
                  b && (V = b);
                  break;
                }
                case 'initialPlacement':
                  V = o;
                  break;
              }
            if (i !== V) return { reset: { placement: V } };
          }
          return {};
        },
      }
    );
  };
function pi(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width,
  };
}
function vi(e) {
  return X1.some(t => e[t] >= 0);
}
const ow = function (e) {
  return (
    e === void 0 && (e = {}),
    {
      name: 'hide',
      options: e,
      async fn(t) {
        const { rects: r } = t,
          { strategy: n = 'referenceHidden', ...i } = pe(e, t);
        switch (n) {
          case 'referenceHidden': {
            const s = await nt(t, { ...i, elementContext: 'reference' }),
              a = pi(s, r.reference);
            return {
              data: { referenceHiddenOffsets: a, referenceHidden: vi(a) },
            };
          }
          case 'escaped': {
            const s = await nt(t, { ...i, altBoundary: !0 }),
              a = pi(s, r.floating);
            return { data: { escapedOffsets: a, escaped: vi(a) } };
          }
          default:
            return {};
        }
      },
    }
  );
};
async function uw(e, t) {
  const { placement: r, platform: n, elements: i } = e,
    s = await (n.isRTL == null ? void 0 : n.isRTL(i.floating)),
    a = ve(r),
    o = Ve(r),
    u = de(r) === 'y',
    c = ['left', 'top'].includes(a) ? -1 : 1,
    l = s && u ? -1 : 1,
    f = pe(t, e);
  let {
    mainAxis: h,
    crossAxis: p,
    alignmentAxis: g,
  } = typeof f == 'number'
    ? { mainAxis: f, crossAxis: 0, alignmentAxis: null }
    : {
        mainAxis: f.mainAxis || 0,
        crossAxis: f.crossAxis || 0,
        alignmentAxis: f.alignmentAxis,
      };
  return (
    o && typeof g == 'number' && (p = o === 'end' ? g * -1 : g),
    u ? { x: p * l, y: h * c } : { x: h * c, y: p * l }
  );
}
const cw = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: 'offset',
        options: e,
        async fn(t) {
          var r, n;
          const { x: i, y: s, placement: a, middlewareData: o } = t,
            u = await uw(t, e);
          return a === ((r = o.offset) == null ? void 0 : r.placement) &&
            (n = o.arrow) != null &&
            n.alignmentOffset
            ? {}
            : { x: i + u.x, y: s + u.y, data: { ...u, placement: a } };
        },
      }
    );
  },
  lw = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'shift',
        options: e,
        async fn(t) {
          const { x: r, y: n, placement: i } = t,
            {
              mainAxis: s = !0,
              crossAxis: a = !1,
              limiter: o = {
                fn: v => {
                  let { x: y, y: m } = v;
                  return { x: y, y: m };
                },
              },
              ...u
            } = pe(e, t),
            c = { x: r, y: n },
            l = await nt(t, u),
            f = de(ve(i)),
            h = Gr(f);
          let p = c[h],
            g = c[f];
          if (s) {
            const v = h === 'y' ? 'top' : 'left',
              y = h === 'y' ? 'bottom' : 'right',
              m = p + l[v],
              w = p - l[y];
            p = mr(m, p, w);
          }
          if (a) {
            const v = f === 'y' ? 'top' : 'left',
              y = f === 'y' ? 'bottom' : 'right',
              m = g + l[v],
              w = g - l[y];
            g = mr(m, g, w);
          }
          const d = o.fn({ ...t, [h]: p, [f]: g });
          return {
            ...d,
            data: { x: d.x - r, y: d.y - n, enabled: { [h]: s, [f]: a } },
          };
        },
      }
    );
  },
  fw = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        options: e,
        fn(t) {
          const { x: r, y: n, placement: i, rects: s, middlewareData: a } = t,
            { offset: o = 0, mainAxis: u = !0, crossAxis: c = !0 } = pe(e, t),
            l = { x: r, y: n },
            f = de(i),
            h = Gr(f);
          let p = l[h],
            g = l[f];
          const d = pe(o, t),
            v =
              typeof d == 'number'
                ? { mainAxis: d, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...d };
          if (u) {
            const w = h === 'y' ? 'height' : 'width',
              $ = s.reference[h] - s.floating[w] + v.mainAxis,
              O = s.reference[h] + s.reference[w] - v.mainAxis;
            p < $ ? (p = $) : p > O && (p = O);
          }
          if (c) {
            var y, m;
            const w = h === 'y' ? 'width' : 'height',
              $ = ['top', 'left'].includes(ve(i)),
              O =
                s.reference[f] -
                s.floating[w] +
                (($ && ((y = a.offset) == null ? void 0 : y[f])) || 0) +
                ($ ? 0 : v.crossAxis),
              x =
                s.reference[f] +
                s.reference[w] +
                ($ ? 0 : ((m = a.offset) == null ? void 0 : m[f]) || 0) -
                ($ ? v.crossAxis : 0);
            g < O ? (g = O) : g > x && (g = x);
          }
          return { [h]: p, [f]: g };
        },
      }
    );
  },
  hw = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: 'size',
        options: e,
        async fn(t) {
          var r, n;
          const { placement: i, rects: s, platform: a, elements: o } = t,
            { apply: u = () => {}, ...c } = pe(e, t),
            l = await nt(t, c),
            f = ve(i),
            h = Ve(i),
            p = de(i) === 'y',
            { width: g, height: d } = s.floating;
          let v, y;
          f === 'top' || f === 'bottom'
            ? ((v = f),
              (y =
                h ===
                ((await (a.isRTL == null ? void 0 : a.isRTL(o.floating)))
                  ? 'start'
                  : 'end')
                  ? 'left'
                  : 'right'))
            : ((y = f), (v = h === 'end' ? 'top' : 'bottom'));
          const m = d - l.top - l.bottom,
            w = g - l.left - l.right,
            $ = be(d - l[v], m),
            O = be(g - l[y], w),
            x = !t.middlewareData.shift;
          let E = $,
            C = O;
          if (
            ((r = t.middlewareData.shift) != null && r.enabled.x && (C = w),
            (n = t.middlewareData.shift) != null && n.enabled.y && (E = m),
            x && !h)
          ) {
            const j = X(l.left, 0),
              R = X(l.right, 0),
              P = X(l.top, 0),
              W = X(l.bottom, 0);
            p
              ? (C = g - 2 * (j !== 0 || R !== 0 ? j + R : X(l.left, l.right)))
              : (E = d - 2 * (P !== 0 || W !== 0 ? P + W : X(l.top, l.bottom)));
          }
          await u({ ...t, availableWidth: C, availableHeight: E });
          const I = await a.getDimensions(o.floating);
          return g !== I.width || d !== I.height
            ? { reset: { rects: !0 } }
            : {};
        },
      }
    );
  };
function qt() {
  return typeof window < 'u';
}
function Xe(e) {
  return Ws(e) ? (e.nodeName || '').toLowerCase() : '#document';
}
function J(e) {
  var t;
  return (
    (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) ||
    window
  );
}
function fe(e) {
  var t;
  return (t = (Ws(e) ? e.ownerDocument : e.document) || window.document) == null
    ? void 0
    : t.documentElement;
}
function Ws(e) {
  return qt() ? e instanceof Node || e instanceof J(e).Node : !1;
}
function ne(e) {
  return qt() ? e instanceof Element || e instanceof J(e).Element : !1;
}
function ue(e) {
  return qt() ? e instanceof HTMLElement || e instanceof J(e).HTMLElement : !1;
}
function gi(e) {
  return !qt() || typeof ShadowRoot > 'u'
    ? !1
    : e instanceof ShadowRoot || e instanceof J(e).ShadowRoot;
}
function ct(e) {
  const { overflow: t, overflowX: r, overflowY: n, display: i } = ie(e);
  return (
    /auto|scroll|overlay|hidden|clip/.test(t + n + r) &&
    !['inline', 'contents'].includes(i)
  );
}
function dw(e) {
  return ['table', 'td', 'th'].includes(Xe(e));
}
function kt(e) {
  return [':popover-open', ':modal'].some(t => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
function Qr(e) {
  const t = zr(),
    r = ne(e) ? ie(e) : e;
  return (
    ['transform', 'translate', 'scale', 'rotate', 'perspective'].some(n =>
      r[n] ? r[n] !== 'none' : !1
    ) ||
    (r.containerType ? r.containerType !== 'normal' : !1) ||
    (!t && (r.backdropFilter ? r.backdropFilter !== 'none' : !1)) ||
    (!t && (r.filter ? r.filter !== 'none' : !1)) ||
    ['transform', 'translate', 'scale', 'rotate', 'perspective', 'filter'].some(
      n => (r.willChange || '').includes(n)
    ) ||
    ['paint', 'layout', 'strict', 'content'].some(n =>
      (r.contain || '').includes(n)
    )
  );
}
function pw(e) {
  let t = we(e);
  for (; ue(t) && !qe(t); ) {
    if (Qr(t)) return t;
    if (kt(t)) return null;
    t = we(t);
  }
  return null;
}
function zr() {
  return typeof CSS > 'u' || !CSS.supports
    ? !1
    : CSS.supports('-webkit-backdrop-filter', 'none');
}
function qe(e) {
  return ['html', 'body', '#document'].includes(Xe(e));
}
function ie(e) {
  return J(e).getComputedStyle(e);
}
function Ut(e) {
  return ne(e)
    ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
    : { scrollLeft: e.scrollX, scrollTop: e.scrollY };
}
function we(e) {
  if (Xe(e) === 'html') return e;
  const t = e.assignedSlot || e.parentNode || (gi(e) && e.host) || fe(e);
  return gi(t) ? t.host : t;
}
function Ks(e) {
  const t = we(e);
  return qe(t)
    ? e.ownerDocument
      ? e.ownerDocument.body
      : e.body
    : ue(t) && ct(t)
      ? t
      : Ks(t);
}
function it(e, t, r) {
  var n;
  (t === void 0 && (t = []), r === void 0 && (r = !0));
  const i = Ks(e),
    s = i === ((n = e.ownerDocument) == null ? void 0 : n.body),
    a = J(i);
  if (s) {
    const o = wr(a);
    return t.concat(
      a,
      a.visualViewport || [],
      ct(i) ? i : [],
      o && r ? it(o) : []
    );
  }
  return t.concat(i, it(i, [], r));
}
function wr(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function Qs(e) {
  const t = ie(e);
  let r = parseFloat(t.width) || 0,
    n = parseFloat(t.height) || 0;
  const i = ue(e),
    s = i ? e.offsetWidth : r,
    a = i ? e.offsetHeight : n,
    o = St(r) !== s || St(n) !== a;
  return (o && ((r = s), (n = a)), { width: r, height: n, $: o });
}
function Vr(e) {
  return ne(e) ? e : e.contextElement;
}
function Fe(e) {
  const t = Vr(e);
  if (!ue(t)) return ae(1);
  const r = t.getBoundingClientRect(),
    { width: n, height: i, $: s } = Qs(t);
  let a = (s ? St(r.width) : r.width) / n,
    o = (s ? St(r.height) : r.height) / i;
  return (
    (!a || !Number.isFinite(a)) && (a = 1),
    (!o || !Number.isFinite(o)) && (o = 1),
    { x: a, y: o }
  );
}
const vw = ae(0);
function zs(e) {
  const t = J(e);
  return !zr() || !t.visualViewport
    ? vw
    : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop };
}
function gw(e, t, r) {
  return (t === void 0 && (t = !1), !r || (t && r !== J(e)) ? !1 : t);
}
function Pe(e, t, r, n) {
  (t === void 0 && (t = !1), r === void 0 && (r = !1));
  const i = e.getBoundingClientRect(),
    s = Vr(e);
  let a = ae(1);
  t && (n ? ne(n) && (a = Fe(n)) : (a = Fe(e)));
  const o = gw(s, r, n) ? zs(s) : ae(0);
  let u = (i.left + o.x) / a.x,
    c = (i.top + o.y) / a.y,
    l = i.width / a.x,
    f = i.height / a.y;
  if (s) {
    const h = J(s),
      p = n && ne(n) ? J(n) : n;
    let g = h,
      d = wr(g);
    for (; d && n && p !== g; ) {
      const v = Fe(d),
        y = d.getBoundingClientRect(),
        m = ie(d),
        w = y.left + (d.clientLeft + parseFloat(m.paddingLeft)) * v.x,
        $ = y.top + (d.clientTop + parseFloat(m.paddingTop)) * v.y;
      ((u *= v.x),
        (c *= v.y),
        (l *= v.x),
        (f *= v.y),
        (u += w),
        (c += $),
        (g = J(d)),
        (d = wr(g)));
    }
  }
  return Ct({ width: l, height: f, x: u, y: c });
}
function Xr(e, t) {
  const r = Ut(e).scrollLeft;
  return t ? t.left + r : Pe(fe(e)).left + r;
}
function Vs(e, t, r) {
  r === void 0 && (r = !1);
  const n = e.getBoundingClientRect(),
    i = n.left + t.scrollLeft - (r ? 0 : Xr(e, n)),
    s = n.top + t.scrollTop;
  return { x: i, y: s };
}
function yw(e) {
  let { elements: t, rect: r, offsetParent: n, strategy: i } = e;
  const s = i === 'fixed',
    a = fe(n),
    o = t ? kt(t.floating) : !1;
  if (n === a || (o && s)) return r;
  let u = { scrollLeft: 0, scrollTop: 0 },
    c = ae(1);
  const l = ae(0),
    f = ue(n);
  if (
    (f || (!f && !s)) &&
    ((Xe(n) !== 'body' || ct(a)) && (u = Ut(n)), ue(n))
  ) {
    const p = Pe(n);
    ((c = Fe(n)), (l.x = p.x + n.clientLeft), (l.y = p.y + n.clientTop));
  }
  const h = a && !f && !s ? Vs(a, u, !0) : ae(0);
  return {
    width: r.width * c.x,
    height: r.height * c.y,
    x: r.x * c.x - u.scrollLeft * c.x + l.x + h.x,
    y: r.y * c.y - u.scrollTop * c.y + l.y + h.y,
  };
}
function mw(e) {
  return Array.from(e.getClientRects());
}
function bw(e) {
  const t = fe(e),
    r = Ut(e),
    n = e.ownerDocument.body,
    i = X(t.scrollWidth, t.clientWidth, n.scrollWidth, n.clientWidth),
    s = X(t.scrollHeight, t.clientHeight, n.scrollHeight, n.clientHeight);
  let a = -r.scrollLeft + Xr(e);
  const o = -r.scrollTop;
  return (
    ie(n).direction === 'rtl' && (a += X(t.clientWidth, n.clientWidth) - i),
    { width: i, height: s, x: a, y: o }
  );
}
function ww(e, t) {
  const r = J(e),
    n = fe(e),
    i = r.visualViewport;
  let s = n.clientWidth,
    a = n.clientHeight,
    o = 0,
    u = 0;
  if (i) {
    ((s = i.width), (a = i.height));
    const c = zr();
    (!c || (c && t === 'fixed')) && ((o = i.offsetLeft), (u = i.offsetTop));
  }
  return { width: s, height: a, x: o, y: u };
}
function _w(e, t) {
  const r = Pe(e, !0, t === 'fixed'),
    n = r.top + e.clientTop,
    i = r.left + e.clientLeft,
    s = ue(e) ? Fe(e) : ae(1),
    a = e.clientWidth * s.x,
    o = e.clientHeight * s.y,
    u = i * s.x,
    c = n * s.y;
  return { width: a, height: o, x: u, y: c };
}
function yi(e, t, r) {
  let n;
  if (t === 'viewport') n = ww(e, r);
  else if (t === 'document') n = bw(fe(e));
  else if (ne(t)) n = _w(t, r);
  else {
    const i = zs(e);
    n = { x: t.x - i.x, y: t.y - i.y, width: t.width, height: t.height };
  }
  return Ct(n);
}
function Xs(e, t) {
  const r = we(e);
  return r === t || !ne(r) || qe(r)
    ? !1
    : ie(r).position === 'fixed' || Xs(r, t);
}
function $w(e, t) {
  const r = t.get(e);
  if (r) return r;
  let n = it(e, [], !1).filter(o => ne(o) && Xe(o) !== 'body'),
    i = null;
  const s = ie(e).position === 'fixed';
  let a = s ? we(e) : e;
  for (; ne(a) && !qe(a); ) {
    const o = ie(a),
      u = Qr(a);
    (!u && o.position === 'fixed' && (i = null),
      (
        s
          ? !u && !i
          : (!u &&
              o.position === 'static' &&
              !!i &&
              ['absolute', 'fixed'].includes(i.position)) ||
            (ct(a) && !u && Xs(e, a))
      )
        ? (n = n.filter(l => l !== a))
        : (i = o),
      (a = we(a)));
  }
  return (t.set(e, n), n);
}
function Ow(e) {
  let { element: t, boundary: r, rootBoundary: n, strategy: i } = e;
  const a = [
      ...(r === 'clippingAncestors'
        ? kt(t)
          ? []
          : $w(t, this._c)
        : [].concat(r)),
      n,
    ],
    o = a[0],
    u = a.reduce(
      (c, l) => {
        const f = yi(t, l, i);
        return (
          (c.top = X(f.top, c.top)),
          (c.right = be(f.right, c.right)),
          (c.bottom = be(f.bottom, c.bottom)),
          (c.left = X(f.left, c.left)),
          c
        );
      },
      yi(t, o, i)
    );
  return {
    width: u.right - u.left,
    height: u.bottom - u.top,
    x: u.left,
    y: u.top,
  };
}
function Ew(e) {
  const { width: t, height: r } = Qs(e);
  return { width: t, height: r };
}
function Aw(e, t, r) {
  const n = ue(t),
    i = fe(t),
    s = r === 'fixed',
    a = Pe(e, !0, s, t);
  let o = { scrollLeft: 0, scrollTop: 0 };
  const u = ae(0);
  function c() {
    u.x = Xr(i);
  }
  if (n || (!n && !s))
    if (((Xe(t) !== 'body' || ct(i)) && (o = Ut(t)), n)) {
      const p = Pe(t, !0, s, t);
      ((u.x = p.x + t.clientLeft), (u.y = p.y + t.clientTop));
    } else i && c();
  s && !n && i && c();
  const l = i && !n && !s ? Vs(i, o) : ae(0),
    f = a.left + o.scrollLeft - u.x - l.x,
    h = a.top + o.scrollTop - u.y - l.y;
  return { x: f, y: h, width: a.width, height: a.height };
}
function tr(e) {
  return ie(e).position === 'static';
}
function mi(e, t) {
  if (!ue(e) || ie(e).position === 'fixed') return null;
  if (t) return t(e);
  let r = e.offsetParent;
  return (fe(e) === r && (r = r.ownerDocument.body), r);
}
function Ys(e, t) {
  const r = J(e);
  if (kt(e)) return r;
  if (!ue(e)) {
    let i = we(e);
    for (; i && !qe(i); ) {
      if (ne(i) && !tr(i)) return i;
      i = we(i);
    }
    return r;
  }
  let n = mi(e, t);
  for (; n && dw(n) && tr(n); ) n = mi(n, t);
  return n && qe(n) && tr(n) && !Qr(n) ? r : n || pw(e) || r;
}
const Sw = async function (e) {
  const t = this.getOffsetParent || Ys,
    r = this.getDimensions,
    n = await r(e.floating);
  return {
    reference: Aw(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: n.width, height: n.height },
  };
};
function xw(e) {
  return ie(e).direction === 'rtl';
}
const Cw = {
  convertOffsetParentRelativeRectToViewportRelativeRect: yw,
  getDocumentElement: fe,
  getClippingRect: Ow,
  getOffsetParent: Ys,
  getElementRects: Sw,
  getClientRects: mw,
  getDimensions: Ew,
  getScale: Fe,
  isElement: ne,
  isRTL: xw,
};
function Js(e, t) {
  return (
    e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height
  );
}
function Pw(e, t) {
  let r = null,
    n;
  const i = fe(e);
  function s() {
    var o;
    (clearTimeout(n), (o = r) == null || o.disconnect(), (r = null));
  }
  function a(o, u) {
    (o === void 0 && (o = !1), u === void 0 && (u = 1), s());
    const c = e.getBoundingClientRect(),
      { left: l, top: f, width: h, height: p } = c;
    if ((o || t(), !h || !p)) return;
    const g = gt(f),
      d = gt(i.clientWidth - (l + h)),
      v = gt(i.clientHeight - (f + p)),
      y = gt(l),
      w = {
        rootMargin: -g + 'px ' + -d + 'px ' + -v + 'px ' + -y + 'px',
        threshold: X(0, be(1, u)) || 1,
      };
    let $ = !0;
    function O(x) {
      const E = x[0].intersectionRatio;
      if (E !== u) {
        if (!$) return a();
        E
          ? a(!1, E)
          : (n = setTimeout(() => {
              a(!1, 1e-7);
            }, 1e3));
      }
      (E === 1 && !Js(c, e.getBoundingClientRect()) && a(), ($ = !1));
    }
    try {
      r = new IntersectionObserver(O, { ...w, root: i.ownerDocument });
    } catch {
      r = new IntersectionObserver(O, w);
    }
    r.observe(e);
  }
  return (a(!0), s);
}
function N_(e, t, r, n) {
  n === void 0 && (n = {});
  const {
      ancestorScroll: i = !0,
      ancestorResize: s = !0,
      elementResize: a = typeof ResizeObserver == 'function',
      layoutShift: o = typeof IntersectionObserver == 'function',
      animationFrame: u = !1,
    } = n,
    c = Vr(e),
    l = i || s ? [...(c ? it(c) : []), ...it(t)] : [];
  l.forEach(y => {
    (i && y.addEventListener('scroll', r, { passive: !0 }),
      s && y.addEventListener('resize', r));
  });
  const f = c && o ? Pw(c, r) : null;
  let h = -1,
    p = null;
  a &&
    ((p = new ResizeObserver(y => {
      let [m] = y;
      (m &&
        m.target === c &&
        p &&
        (p.unobserve(t),
        cancelAnimationFrame(h),
        (h = requestAnimationFrame(() => {
          var w;
          (w = p) == null || w.observe(t);
        }))),
        r());
    })),
    c && !u && p.observe(c),
    p.observe(t));
  let g,
    d = u ? Pe(e) : null;
  u && v();
  function v() {
    const y = Pe(e);
    (d && !Js(d, y) && r(), (d = y), (g = requestAnimationFrame(v)));
  }
  return (
    r(),
    () => {
      var y;
      (l.forEach(m => {
        (i && m.removeEventListener('scroll', r),
          s && m.removeEventListener('resize', r));
      }),
        f?.(),
        (y = p) == null || y.disconnect(),
        (p = null),
        u && cancelAnimationFrame(g));
    }
  );
}
const q_ = cw,
  k_ = lw,
  U_ = aw,
  B_ = hw,
  H_ = ow,
  G_ = sw,
  W_ = fw,
  K_ = (e, t, r) => {
    const n = new Map(),
      i = { platform: Cw, ...r },
      s = { ...i.platform, _c: n };
    return iw(e, t, { ...i, platform: s });
  };
var Tw = function (e) {
    if (typeof document > 'u') return null;
    var t = Array.isArray(e) ? e[0] : e;
    return t.ownerDocument.body;
  },
  Le = new WeakMap(),
  yt = new WeakMap(),
  mt = {},
  rr = 0,
  Zs = function (e) {
    return e && (e.host || Zs(e.parentNode));
  },
  Rw = function (e, t) {
    return t
      .map(function (r) {
        if (e.contains(r)) return r;
        var n = Zs(r);
        return n && e.contains(n)
          ? n
          : (console.error(
              'aria-hidden',
              r,
              'in not contained inside',
              e,
              '. Doing nothing'
            ),
            null);
      })
      .filter(function (r) {
        return !!r;
      });
  },
  Lw = function (e, t, r, n) {
    var i = Rw(t, Array.isArray(e) ? e : [e]);
    mt[r] || (mt[r] = new WeakMap());
    var s = mt[r],
      a = [],
      o = new Set(),
      u = new Set(i),
      c = function (f) {
        !f || o.has(f) || (o.add(f), c(f.parentNode));
      };
    i.forEach(c);
    var l = function (f) {
      !f ||
        u.has(f) ||
        Array.prototype.forEach.call(f.children, function (h) {
          if (o.has(h)) l(h);
          else
            try {
              var p = h.getAttribute(n),
                g = p !== null && p !== 'false',
                d = (Le.get(h) || 0) + 1,
                v = (s.get(h) || 0) + 1;
              (Le.set(h, d),
                s.set(h, v),
                a.push(h),
                d === 1 && g && yt.set(h, !0),
                v === 1 && h.setAttribute(r, 'true'),
                g || h.setAttribute(n, 'true'));
            } catch (y) {
              console.error('aria-hidden: cannot operate on ', h, y);
            }
        });
    };
    return (
      l(t),
      o.clear(),
      rr++,
      function () {
        (a.forEach(function (f) {
          var h = Le.get(f) - 1,
            p = s.get(f) - 1;
          (Le.set(f, h),
            s.set(f, p),
            h || (yt.has(f) || f.removeAttribute(n), yt.delete(f)),
            p || f.removeAttribute(r));
        }),
          rr--,
          rr ||
            ((Le = new WeakMap()),
            (Le = new WeakMap()),
            (yt = new WeakMap()),
            (mt = {})));
      }
    );
  },
  Q_ = function (e, t, r) {
    r === void 0 && (r = 'data-aria-hidden');
    var n = Array.from(Array.isArray(e) ? e : [e]),
      i = Tw(e);
    return i
      ? (n.push.apply(n, Array.from(i.querySelectorAll('[aria-live], script'))),
        Lw(n, i, r, 'aria-hidden'))
      : function () {
          return null;
        };
  },
  Pt = function () {
    return (
      (Pt =
        Object.assign ||
        function (t) {
          for (var r, n = 1, i = arguments.length; n < i; n++) {
            r = arguments[n];
            for (var s in r)
              Object.prototype.hasOwnProperty.call(r, s) && (t[s] = r[s]);
          }
          return t;
        }),
      Pt.apply(this, arguments)
    );
  };
function Mw(e, t) {
  var r = {};
  for (var n in e)
    Object.prototype.hasOwnProperty.call(e, n) &&
      t.indexOf(n) < 0 &&
      (r[n] = e[n]);
  if (e != null && typeof Object.getOwnPropertySymbols == 'function')
    for (var i = 0, n = Object.getOwnPropertySymbols(e); i < n.length; i++)
      t.indexOf(n[i]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(e, n[i]) &&
        (r[n[i]] = e[n[i]]);
  return r;
}
function z_(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, i = t.length, s; n < i; n++)
      (s || !(n in t)) &&
        (s || (s = Array.prototype.slice.call(t, 0, n)), (s[n] = t[n]));
  return e.concat(s || Array.prototype.slice.call(t));
}
function nr(e, t) {
  return (typeof e == 'function' ? e(t) : e && (e.current = t), e);
}
function Iw(e, t) {
  var r = k.useState(function () {
    return {
      value: e,
      callback: t,
      facade: {
        get current() {
          return r.value;
        },
        set current(n) {
          var i = r.value;
          i !== n && ((r.value = n), r.callback(n, i));
        },
      },
    };
  })[0];
  return ((r.callback = t), r.facade);
}
var Fw = typeof window < 'u' ? k.useLayoutEffect : k.useEffect,
  bi = new WeakMap();
function V_(e, t) {
  var r = Iw(null, function (n) {
    return e.forEach(function (i) {
      return nr(i, n);
    });
  });
  return (
    Fw(
      function () {
        var n = bi.get(r);
        if (n) {
          var i = new Set(n),
            s = new Set(e),
            a = r.current;
          (i.forEach(function (o) {
            s.has(o) || nr(o, null);
          }),
            s.forEach(function (o) {
              i.has(o) || nr(o, a);
            }));
        }
        bi.set(r, e);
      },
      [e]
    ),
    r
  );
}
function Dw(e) {
  return e;
}
function jw(e, t) {
  t === void 0 && (t = Dw);
  var r = [],
    n = !1,
    i = {
      read: function () {
        if (n)
          throw new Error(
            'Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.'
          );
        return r.length ? r[r.length - 1] : e;
      },
      useMedium: function (s) {
        var a = t(s, n);
        return (
          r.push(a),
          function () {
            r = r.filter(function (o) {
              return o !== a;
            });
          }
        );
      },
      assignSyncMedium: function (s) {
        for (n = !0; r.length; ) {
          var a = r;
          ((r = []), a.forEach(s));
        }
        r = {
          push: function (o) {
            return s(o);
          },
          filter: function () {
            return r;
          },
        };
      },
      assignMedium: function (s) {
        n = !0;
        var a = [];
        if (r.length) {
          var o = r;
          ((r = []), o.forEach(s), (a = r));
        }
        var u = function () {
            var l = a;
            ((a = []), l.forEach(s));
          },
          c = function () {
            return Promise.resolve().then(u);
          };
        (c(),
          (r = {
            push: function (l) {
              (a.push(l), c());
            },
            filter: function (l) {
              return ((a = a.filter(l)), r);
            },
          }));
      },
    };
  return i;
}
function X_(e) {
  e === void 0 && (e = {});
  var t = jw(null);
  return ((t.options = Pt({ async: !0, ssr: !1 }, e)), t);
}
var ea = function (e) {
  var t = e.sideCar,
    r = Mw(e, ['sideCar']);
  if (!t)
    throw new Error(
      'Sidecar: please provide `sideCar` property to import the right car'
    );
  var n = t.read();
  if (!n) throw new Error('Sidecar medium not found');
  return k.createElement(n, Pt({}, r));
};
ea.isSideCarExport = !0;
function Y_(e, t) {
  return (e.useMedium(t), ea);
}
var J_ = function () {
    if (typeof __webpack_nonce__ < 'u') return __webpack_nonce__;
  },
  Yr = { exports: {} },
  De = typeof Reflect == 'object' ? Reflect : null,
  wi =
    De && typeof De.apply == 'function'
      ? De.apply
      : function (t, r, n) {
          return Function.prototype.apply.call(t, r, n);
        },
  wt;
De && typeof De.ownKeys == 'function'
  ? (wt = De.ownKeys)
  : Object.getOwnPropertySymbols
    ? (wt = function (t) {
        return Object.getOwnPropertyNames(t).concat(
          Object.getOwnPropertySymbols(t)
        );
      })
    : (wt = function (t) {
        return Object.getOwnPropertyNames(t);
      });
function Nw(e) {
  console && console.warn && console.warn(e);
}
var ta =
  Number.isNaN ||
  function (t) {
    return t !== t;
  };
function T() {
  T.init.call(this);
}
Yr.exports = T;
Yr.exports.once = Bw;
T.EventEmitter = T;
T.prototype._events = void 0;
T.prototype._eventsCount = 0;
T.prototype._maxListeners = void 0;
var _i = 10;
function Bt(e) {
  if (typeof e != 'function')
    throw new TypeError(
      'The "listener" argument must be of type Function. Received type ' +
        typeof e
    );
}
Object.defineProperty(T, 'defaultMaxListeners', {
  enumerable: !0,
  get: function () {
    return _i;
  },
  set: function (e) {
    if (typeof e != 'number' || e < 0 || ta(e))
      throw new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
          e +
          '.'
      );
    _i = e;
  },
});
T.init = function () {
  ((this._events === void 0 ||
    this._events === Object.getPrototypeOf(this)._events) &&
    ((this._events = Object.create(null)), (this._eventsCount = 0)),
    (this._maxListeners = this._maxListeners || void 0));
};
T.prototype.setMaxListeners = function (t) {
  if (typeof t != 'number' || t < 0 || ta(t))
    throw new RangeError(
      'The value of "n" is out of range. It must be a non-negative number. Received ' +
        t +
        '.'
    );
  return ((this._maxListeners = t), this);
};
function ra(e) {
  return e._maxListeners === void 0 ? T.defaultMaxListeners : e._maxListeners;
}
T.prototype.getMaxListeners = function () {
  return ra(this);
};
T.prototype.emit = function (t) {
  for (var r = [], n = 1; n < arguments.length; n++) r.push(arguments[n]);
  var i = t === 'error',
    s = this._events;
  if (s !== void 0) i = i && s.error === void 0;
  else if (!i) return !1;
  if (i) {
    var a;
    if ((r.length > 0 && (a = r[0]), a instanceof Error)) throw a;
    var o = new Error('Unhandled error.' + (a ? ' (' + a.message + ')' : ''));
    throw ((o.context = a), o);
  }
  var u = s[t];
  if (u === void 0) return !1;
  if (typeof u == 'function') wi(u, this, r);
  else
    for (var c = u.length, l = oa(u, c), n = 0; n < c; ++n) wi(l[n], this, r);
  return !0;
};
function na(e, t, r, n) {
  var i, s, a;
  if (
    (Bt(r),
    (s = e._events),
    s === void 0
      ? ((s = e._events = Object.create(null)), (e._eventsCount = 0))
      : (s.newListener !== void 0 &&
          (e.emit('newListener', t, r.listener ? r.listener : r),
          (s = e._events)),
        (a = s[t])),
    a === void 0)
  )
    ((a = s[t] = r), ++e._eventsCount);
  else if (
    (typeof a == 'function'
      ? (a = s[t] = n ? [r, a] : [a, r])
      : n
        ? a.unshift(r)
        : a.push(r),
    (i = ra(e)),
    i > 0 && a.length > i && !a.warned)
  ) {
    a.warned = !0;
    var o = new Error(
      'Possible EventEmitter memory leak detected. ' +
        a.length +
        ' ' +
        String(t) +
        ' listeners added. Use emitter.setMaxListeners() to increase limit'
    );
    ((o.name = 'MaxListenersExceededWarning'),
      (o.emitter = e),
      (o.type = t),
      (o.count = a.length),
      Nw(o));
  }
  return e;
}
T.prototype.addListener = function (t, r) {
  return na(this, t, r, !1);
};
T.prototype.on = T.prototype.addListener;
T.prototype.prependListener = function (t, r) {
  return na(this, t, r, !0);
};
function qw() {
  if (!this.fired)
    return (
      this.target.removeListener(this.type, this.wrapFn),
      (this.fired = !0),
      arguments.length === 0
        ? this.listener.call(this.target)
        : this.listener.apply(this.target, arguments)
    );
}
function ia(e, t, r) {
  var n = { fired: !1, wrapFn: void 0, target: e, type: t, listener: r },
    i = qw.bind(n);
  return ((i.listener = r), (n.wrapFn = i), i);
}
T.prototype.once = function (t, r) {
  return (Bt(r), this.on(t, ia(this, t, r)), this);
};
T.prototype.prependOnceListener = function (t, r) {
  return (Bt(r), this.prependListener(t, ia(this, t, r)), this);
};
T.prototype.removeListener = function (t, r) {
  var n, i, s, a, o;
  if ((Bt(r), (i = this._events), i === void 0)) return this;
  if (((n = i[t]), n === void 0)) return this;
  if (n === r || n.listener === r)
    --this._eventsCount === 0
      ? (this._events = Object.create(null))
      : (delete i[t],
        i.removeListener && this.emit('removeListener', t, n.listener || r));
  else if (typeof n != 'function') {
    for (s = -1, a = n.length - 1; a >= 0; a--)
      if (n[a] === r || n[a].listener === r) {
        ((o = n[a].listener), (s = a));
        break;
      }
    if (s < 0) return this;
    (s === 0 ? n.shift() : kw(n, s),
      n.length === 1 && (i[t] = n[0]),
      i.removeListener !== void 0 && this.emit('removeListener', t, o || r));
  }
  return this;
};
T.prototype.off = T.prototype.removeListener;
T.prototype.removeAllListeners = function (t) {
  var r, n, i;
  if (((n = this._events), n === void 0)) return this;
  if (n.removeListener === void 0)
    return (
      arguments.length === 0
        ? ((this._events = Object.create(null)), (this._eventsCount = 0))
        : n[t] !== void 0 &&
          (--this._eventsCount === 0
            ? (this._events = Object.create(null))
            : delete n[t]),
      this
    );
  if (arguments.length === 0) {
    var s = Object.keys(n),
      a;
    for (i = 0; i < s.length; ++i)
      ((a = s[i]), a !== 'removeListener' && this.removeAllListeners(a));
    return (
      this.removeAllListeners('removeListener'),
      (this._events = Object.create(null)),
      (this._eventsCount = 0),
      this
    );
  }
  if (((r = n[t]), typeof r == 'function')) this.removeListener(t, r);
  else if (r !== void 0)
    for (i = r.length - 1; i >= 0; i--) this.removeListener(t, r[i]);
  return this;
};
function sa(e, t, r) {
  var n = e._events;
  if (n === void 0) return [];
  var i = n[t];
  return i === void 0
    ? []
    : typeof i == 'function'
      ? r
        ? [i.listener || i]
        : [i]
      : r
        ? Uw(i)
        : oa(i, i.length);
}
T.prototype.listeners = function (t) {
  return sa(this, t, !0);
};
T.prototype.rawListeners = function (t) {
  return sa(this, t, !1);
};
T.listenerCount = function (e, t) {
  return typeof e.listenerCount == 'function'
    ? e.listenerCount(t)
    : aa.call(e, t);
};
T.prototype.listenerCount = aa;
function aa(e) {
  var t = this._events;
  if (t !== void 0) {
    var r = t[e];
    if (typeof r == 'function') return 1;
    if (r !== void 0) return r.length;
  }
  return 0;
}
T.prototype.eventNames = function () {
  return this._eventsCount > 0 ? wt(this._events) : [];
};
function oa(e, t) {
  for (var r = new Array(t), n = 0; n < t; ++n) r[n] = e[n];
  return r;
}
function kw(e, t) {
  for (; t + 1 < e.length; t++) e[t] = e[t + 1];
  e.pop();
}
function Uw(e) {
  for (var t = new Array(e.length), r = 0; r < t.length; ++r)
    t[r] = e[r].listener || e[r];
  return t;
}
function Bw(e, t) {
  return new Promise(function (r, n) {
    function i(a) {
      (e.removeListener(t, s), n(a));
    }
    function s() {
      (typeof e.removeListener == 'function' && e.removeListener('error', i),
        r([].slice.call(arguments)));
    }
    (ua(e, t, s, { once: !0 }), t !== 'error' && Hw(e, i, { once: !0 }));
  });
}
function Hw(e, t, r) {
  typeof e.on == 'function' && ua(e, 'error', t, r);
}
function ua(e, t, r, n) {
  if (typeof e.on == 'function') n.once ? e.once(t, r) : e.on(t, r);
  else if (typeof e.addEventListener == 'function')
    e.addEventListener(t, function i(s) {
      (n.once && e.removeEventListener(t, i), r(s));
    });
  else
    throw new TypeError(
      'The "emitter" argument must be of type EventEmitter. Received type ' +
        typeof e
    );
}
var Z_ = Yr.exports;
export {
  V_ as $,
  I_ as A,
  Jw as B,
  zw as C,
  E_ as D,
  La as E,
  Qw as F,
  i_ as G,
  G as H,
  b_ as I,
  Z as J,
  Ne as K,
  Xw as L,
  C_ as M,
  wa as N,
  K_ as O,
  x_ as P,
  a_ as Q,
  q_ as R,
  k_ as S,
  U_ as T,
  B_ as U,
  H_ as V,
  W_ as W,
  G_ as X,
  N_ as Y,
  X_ as Z,
  Mw as _,
  d_ as a,
  Pt as a0,
  J_ as a1,
  z_ as a2,
  Y_ as a3,
  Q_ as a4,
  Me as a5,
  bt as a6,
  Or as a7,
  e_ as a8,
  t_ as a9,
  r_ as aa,
  n_ as ab,
  Zw as ac,
  s_ as ad,
  Z_ as ae,
  Yw as af,
  Vw as ag,
  p_ as b,
  o_ as c,
  f_ as d,
  u_ as e,
  g_ as f,
  l_ as g,
  A_ as h,
  h_ as i,
  w_ as j,
  $_ as k,
  O_ as l,
  __ as m,
  S_ as n,
  P_ as o,
  T_ as p,
  R_ as q,
  L_ as r,
  y_ as s,
  m_ as t,
  v_ as u,
  M_ as v,
  D_ as w,
  F_ as x,
  c_ as y,
  j_ as z,
};
