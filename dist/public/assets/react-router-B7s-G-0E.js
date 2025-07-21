import { r as t, bC as _ } from './react-core-C6DwaHZM.js';
import {
  a5 as L,
  a6 as h,
  a7 as O,
  a8 as B,
  a9 as A,
  aa as F,
  ab as M,
  ac as V,
} from './vendor-BXT5a8vO.js';
/**
 * React Router v6.30.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function m() {
  return (
    (m = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var a = 1; a < arguments.length; a++) {
            var s = arguments[a];
            for (var n in s)
              Object.prototype.hasOwnProperty.call(s, n) && (e[n] = s[n]);
          }
          return e;
        }),
    m.apply(this, arguments)
  );
}
const y = t.createContext(null),
  g = t.createContext(null),
  d = t.createContext(null),
  p = t.createContext({ outlet: null, matches: [], isDataRoute: !1 });
function C() {
  return t.useContext(d) != null;
}
function j() {
  return (C() || h(!1), t.useContext(d).location);
}
function w(e) {
  t.useContext(g).static || t.useLayoutEffect(e);
}
function D() {
  let { isDataRoute: e } = t.useContext(p);
  return e ? z() : J();
}
function J() {
  C() || h(!1);
  let e = t.useContext(y),
    { basename: a, future: s, navigator: n } = t.useContext(g),
    { matches: u } = t.useContext(p),
    { pathname: r } = j(),
    o = JSON.stringify(A(u, s.v7_relativeSplatPath)),
    f = t.useRef(!1);
  return (
    w(() => {
      f.current = !0;
    }),
    t.useCallback(
      function (v, i) {
        if ((i === void 0 && (i = {}), !f.current)) return;
        if (typeof v == 'number') {
          n.go(v);
          return;
        }
        let l = F(v, JSON.parse(o), r, i.relative === 'path');
        (e == null &&
          a !== '/' &&
          (l.pathname = l.pathname === '/' ? a : M([a, l.pathname])),
          (i.replace ? n.replace : n.push)(l, i.state, i));
      },
      [a, n, o, r, e]
    )
  );
}
var E = (function (e) {
    return (
      (e.UseBlocker = 'useBlocker'),
      (e.UseRevalidator = 'useRevalidator'),
      (e.UseNavigateStable = 'useNavigate'),
      e
    );
  })(E || {}),
  I = (function (e) {
    return (
      (e.UseBlocker = 'useBlocker'),
      (e.UseLoaderData = 'useLoaderData'),
      (e.UseActionData = 'useActionData'),
      (e.UseRouteError = 'useRouteError'),
      (e.UseNavigation = 'useNavigation'),
      (e.UseRouteLoaderData = 'useRouteLoaderData'),
      (e.UseMatches = 'useMatches'),
      (e.UseRevalidator = 'useRevalidator'),
      (e.UseNavigateStable = 'useNavigate'),
      (e.UseRouteId = 'useRouteId'),
      e
    );
  })(I || {});
function $(e) {
  let a = t.useContext(y);
  return (a || h(!1), a);
}
function W(e) {
  let a = t.useContext(p);
  return (a || h(!1), a);
}
function q(e) {
  let a = W(),
    s = a.matches[a.matches.length - 1];
  return (s.route.id || h(!1), s.route.id);
}
function z() {
  let { router: e } = $(E.UseNavigateStable),
    a = q(I.UseNavigateStable),
    s = t.useRef(!1);
  return (
    w(() => {
      s.current = !0;
    }),
    t.useCallback(
      function (u, r) {
        (r === void 0 && (r = {}),
          s.current &&
            (typeof u == 'number'
              ? e.navigate(u)
              : e.navigate(u, m({ fromRouteId: a }, r))));
      },
      [e, a]
    )
  );
}
function G(e, a) {
  (e?.v7_startTransition, e?.v7_relativeSplatPath);
}
function K(e) {
  let {
    basename: a = '/',
    children: s = null,
    location: n,
    navigationType: u = L.Pop,
    navigator: r,
    static: o = !1,
    future: f,
  } = e;
  C() && h(!1);
  let c = a.replace(/^\/*/, '/'),
    v = t.useMemo(
      () => ({
        basename: c,
        navigator: r,
        static: o,
        future: m({ v7_relativeSplatPath: !1 }, f),
      }),
      [c, f, r, o]
    );
  typeof n == 'string' && (n = O(n));
  let {
      pathname: i = '/',
      search: l = '',
      hash: x = '',
      state: R = null,
      key: b = 'default',
    } = n,
    U = t.useMemo(() => {
      let N = B(i, c);
      return N == null
        ? null
        : {
            location: { pathname: N, search: l, hash: x, state: R, key: b },
            navigationType: u,
          };
    }, [c, i, l, x, R, b, u]);
  return U == null
    ? null
    : t.createElement(
        g.Provider,
        { value: v },
        t.createElement(d.Provider, { children: s, value: U })
      );
}
new Promise(() => {});
/**
 * React Router DOM v6.30.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ const Q = '6';
try {
  window.__reactRouterVersion = Q;
} catch {}
const X = 'startTransition',
  S = _[X];
function k(e) {
  let { basename: a, children: s, future: n, window: u } = e,
    r = t.useRef();
  r.current == null && (r.current = V({ window: u, v5Compat: !0 }));
  let o = r.current,
    [f, c] = t.useState({ action: o.action, location: o.location }),
    { v7_startTransition: v } = n || {},
    i = t.useCallback(
      l => {
        v && S ? S(() => c(l)) : c(l);
      },
      [c, v]
    );
  return (
    t.useLayoutEffect(() => o.listen(i), [o, i]),
    t.useEffect(() => G(n), [n]),
    t.createElement(K, {
      basename: a,
      children: s,
      location: f.location,
      navigationType: f.action,
      navigator: o,
      future: n,
    })
  );
}
var P;
(function (e) {
  ((e.UseScrollRestoration = 'useScrollRestoration'),
    (e.UseSubmit = 'useSubmit'),
    (e.UseSubmitFetcher = 'useSubmitFetcher'),
    (e.UseFetcher = 'useFetcher'),
    (e.useViewTransitionState = 'useViewTransitionState'));
})(P || (P = {}));
var T;
(function (e) {
  ((e.UseFetcher = 'useFetcher'),
    (e.UseFetchers = 'useFetchers'),
    (e.UseScrollRestoration = 'useScrollRestoration'));
})(T || (T = {}));
export { k as B, j as a, D as u };
