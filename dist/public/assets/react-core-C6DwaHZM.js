import {
  F as w1,
  G as S1,
  H as x1,
  J as Hu,
  K as C1,
  Q as E1,
  M as k1,
  P as V,
  N as P1,
  O as _1,
  R as R1,
  S as T1,
  T as M1,
  U as N1,
  V as A1,
  W as I1,
  X as Wu,
  Y as O1,
  Z as D1,
  _ as j1,
  $ as L1,
  a0 as An,
  a1 as b1,
  a2 as F1,
  a3 as $1,
  a4 as gs,
} from './vendor-BXT5a8vO.js';
import { c as M, a as Ku } from './ui-vendor-BQCqNqg0.js';
import { h as jd } from './charts-ceMktdbA.js';
function z1(e, t) {
  for (var n = 0; n < t.length; n++) {
    const r = t[n];
    if (typeof r != 'string' && !Array.isArray(r)) {
      for (const o in r)
        if (o !== 'default' && !(o in e)) {
          const i = Object.getOwnPropertyDescriptor(r, o);
          i &&
            Object.defineProperty(
              e,
              o,
              i.get ? i : { enumerable: !0, get: () => r[o] }
            );
        }
    }
  }
  return Object.freeze(
    Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' })
  );
}
var Ld = { exports: {} },
  Ai = {},
  bd = { exports: {} },
  z = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var no = Symbol.for('react.element'),
  B1 = Symbol.for('react.portal'),
  U1 = Symbol.for('react.fragment'),
  V1 = Symbol.for('react.strict_mode'),
  H1 = Symbol.for('react.profiler'),
  W1 = Symbol.for('react.provider'),
  K1 = Symbol.for('react.context'),
  G1 = Symbol.for('react.forward_ref'),
  Q1 = Symbol.for('react.suspense'),
  Y1 = Symbol.for('react.memo'),
  X1 = Symbol.for('react.lazy'),
  Gu = Symbol.iterator;
function q1(e) {
  return e === null || typeof e != 'object'
    ? null
    : ((e = (Gu && e[Gu]) || e['@@iterator']),
      typeof e == 'function' ? e : null);
}
var Fd = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  $d = Object.assign,
  zd = {};
function lr(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = zd),
    (this.updater = n || Fd));
}
lr.prototype.isReactComponent = {};
lr.prototype.setState = function (e, t) {
  if (typeof e != 'object' && typeof e != 'function' && e != null)
    throw Error(
      'setState(...): takes an object of state variables to update or a function which returns an object of state variables.'
    );
  this.updater.enqueueSetState(this, e, t, 'setState');
};
lr.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, 'forceUpdate');
};
function Bd() {}
Bd.prototype = lr.prototype;
function ws(e, t, n) {
  ((this.props = e),
    (this.context = t),
    (this.refs = zd),
    (this.updater = n || Fd));
}
var Ss = (ws.prototype = new Bd());
Ss.constructor = ws;
$d(Ss, lr.prototype);
Ss.isPureReactComponent = !0;
var Qu = Array.isArray,
  Ud = Object.prototype.hasOwnProperty,
  xs = { current: null },
  Vd = { key: !0, ref: !0, __self: !0, __source: !0 };
function Hd(e, t, n) {
  var r,
    o = {},
    i = null,
    l = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (l = t.ref),
    t.key !== void 0 && (i = '' + t.key),
    t))
      Ud.call(t, r) && !Vd.hasOwnProperty(r) && (o[r] = t[r]);
  var a = arguments.length - 2;
  if (a === 1) o.children = n;
  else if (1 < a) {
    for (var s = Array(a), u = 0; u < a; u++) s[u] = arguments[u + 2];
    o.children = s;
  }
  if (e && e.defaultProps)
    for (r in ((a = e.defaultProps), a)) o[r] === void 0 && (o[r] = a[r]);
  return {
    $$typeof: no,
    type: e,
    key: i,
    ref: l,
    props: o,
    _owner: xs.current,
  };
}
function Z1(e, t) {
  return {
    $$typeof: no,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function Cs(e) {
  return typeof e == 'object' && e !== null && e.$$typeof === no;
}
function J1(e) {
  var t = { '=': '=0', ':': '=2' };
  return (
    '$' +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var Yu = /\/+/g;
function kl(e, t) {
  return typeof e == 'object' && e !== null && e.key != null
    ? J1('' + e.key)
    : t.toString(36);
}
function jo(e, t, n, r, o) {
  var i = typeof e;
  (i === 'undefined' || i === 'boolean') && (e = null);
  var l = !1;
  if (e === null) l = !0;
  else
    switch (i) {
      case 'string':
      case 'number':
        l = !0;
        break;
      case 'object':
        switch (e.$$typeof) {
          case no:
          case B1:
            l = !0;
        }
    }
  if (l)
    return (
      (l = e),
      (o = o(l)),
      (e = r === '' ? '.' + kl(l, 0) : r),
      Qu(o)
        ? ((n = ''),
          e != null && (n = e.replace(Yu, '$&/') + '/'),
          jo(o, t, n, '', function (u) {
            return u;
          }))
        : o != null &&
          (Cs(o) &&
            (o = Z1(
              o,
              n +
                (!o.key || (l && l.key === o.key)
                  ? ''
                  : ('' + o.key).replace(Yu, '$&/') + '/') +
                e
            )),
          t.push(o)),
      1
    );
  if (((l = 0), (r = r === '' ? '.' : r + ':'), Qu(e)))
    for (var a = 0; a < e.length; a++) {
      i = e[a];
      var s = r + kl(i, a);
      l += jo(i, t, n, s, o);
    }
  else if (((s = q1(e)), typeof s == 'function'))
    for (e = s.call(e), a = 0; !(i = e.next()).done; )
      ((i = i.value), (s = r + kl(i, a++)), (l += jo(i, t, n, s, o)));
  else if (i === 'object')
    throw (
      (t = String(e)),
      Error(
        'Objects are not valid as a React child (found: ' +
          (t === '[object Object]'
            ? 'object with keys {' + Object.keys(e).join(', ') + '}'
            : t) +
          '). If you meant to render a collection of children, use an array instead.'
      )
    );
  return l;
}
function mo(e, t, n) {
  if (e == null) return e;
  var r = [],
    o = 0;
  return (
    jo(e, r, '', '', function (i) {
      return t.call(n, i, o++);
    }),
    r
  );
}
function ey(e) {
  if (e._status === -1) {
    var t = e._result;
    ((t = t()),
      t.then(
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 1), (e._result = n));
        },
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 2), (e._result = n));
        }
      ),
      e._status === -1 && ((e._status = 0), (e._result = t)));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Ie = { current: null },
  Lo = { transition: null },
  ty = {
    ReactCurrentDispatcher: Ie,
    ReactCurrentBatchConfig: Lo,
    ReactCurrentOwner: xs,
  };
function Wd() {
  throw Error('act(...) is not supported in production builds of React.');
}
z.Children = {
  map: mo,
  forEach: function (e, t, n) {
    mo(
      e,
      function () {
        t.apply(this, arguments);
      },
      n
    );
  },
  count: function (e) {
    var t = 0;
    return (
      mo(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      mo(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!Cs(e))
      throw Error(
        'React.Children.only expected to receive a single React element child.'
      );
    return e;
  },
};
z.Component = lr;
z.Fragment = U1;
z.Profiler = H1;
z.PureComponent = ws;
z.StrictMode = V1;
z.Suspense = Q1;
z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ty;
z.act = Wd;
z.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      'React.cloneElement(...): The argument must be a React element, but you passed ' +
        e +
        '.'
    );
  var r = $d({}, e.props),
    o = e.key,
    i = e.ref,
    l = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((i = t.ref), (l = xs.current)),
      t.key !== void 0 && (o = '' + t.key),
      e.type && e.type.defaultProps)
    )
      var a = e.type.defaultProps;
    for (s in t)
      Ud.call(t, s) &&
        !Vd.hasOwnProperty(s) &&
        (r[s] = t[s] === void 0 && a !== void 0 ? a[s] : t[s]);
  }
  var s = arguments.length - 2;
  if (s === 1) r.children = n;
  else if (1 < s) {
    a = Array(s);
    for (var u = 0; u < s; u++) a[u] = arguments[u + 2];
    r.children = a;
  }
  return { $$typeof: no, type: e.type, key: o, ref: i, props: r, _owner: l };
};
z.createContext = function (e) {
  return (
    (e = {
      $$typeof: K1,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: W1, _context: e }),
    (e.Consumer = e)
  );
};
z.createElement = Hd;
z.createFactory = function (e) {
  var t = Hd.bind(null, e);
  return ((t.type = e), t);
};
z.createRef = function () {
  return { current: null };
};
z.forwardRef = function (e) {
  return { $$typeof: G1, render: e };
};
z.isValidElement = Cs;
z.lazy = function (e) {
  return { $$typeof: X1, _payload: { _status: -1, _result: e }, _init: ey };
};
z.memo = function (e, t) {
  return { $$typeof: Y1, type: e, compare: t === void 0 ? null : t };
};
z.startTransition = function (e) {
  var t = Lo.transition;
  Lo.transition = {};
  try {
    e();
  } finally {
    Lo.transition = t;
  }
};
z.unstable_act = Wd;
z.useCallback = function (e, t) {
  return Ie.current.useCallback(e, t);
};
z.useContext = function (e) {
  return Ie.current.useContext(e);
};
z.useDebugValue = function () {};
z.useDeferredValue = function (e) {
  return Ie.current.useDeferredValue(e);
};
z.useEffect = function (e, t) {
  return Ie.current.useEffect(e, t);
};
z.useId = function () {
  return Ie.current.useId();
};
z.useImperativeHandle = function (e, t, n) {
  return Ie.current.useImperativeHandle(e, t, n);
};
z.useInsertionEffect = function (e, t) {
  return Ie.current.useInsertionEffect(e, t);
};
z.useLayoutEffect = function (e, t) {
  return Ie.current.useLayoutEffect(e, t);
};
z.useMemo = function (e, t) {
  return Ie.current.useMemo(e, t);
};
z.useReducer = function (e, t, n) {
  return Ie.current.useReducer(e, t, n);
};
z.useRef = function (e) {
  return Ie.current.useRef(e);
};
z.useState = function (e) {
  return Ie.current.useState(e);
};
z.useSyncExternalStore = function (e, t, n) {
  return Ie.current.useSyncExternalStore(e, t, n);
};
z.useTransition = function () {
  return Ie.current.useTransition();
};
z.version = '18.3.1';
bd.exports = z;
var c = bd.exports;
const Ee = jd(c),
  Es = z1({ __proto__: null, default: Ee }, [c]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ny = c,
  ry = Symbol.for('react.element'),
  oy = Symbol.for('react.fragment'),
  iy = Object.prototype.hasOwnProperty,
  ly = ny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  ay = { key: !0, ref: !0, __self: !0, __source: !0 };
function Kd(e, t, n) {
  var r,
    o = {},
    i = null,
    l = null;
  (n !== void 0 && (i = '' + n),
    t.key !== void 0 && (i = '' + t.key),
    t.ref !== void 0 && (l = t.ref));
  for (r in t) iy.call(t, r) && !ay.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps)
    for (r in ((t = e.defaultProps), t)) o[r] === void 0 && (o[r] = t[r]);
  return {
    $$typeof: ry,
    type: e,
    key: i,
    ref: l,
    props: o,
    _owner: ly.current,
  };
}
Ai.Fragment = oy;
Ai.jsx = Kd;
Ai.jsxs = Kd;
Ld.exports = Ai;
var g = Ld.exports,
  Xu = {},
  Gd = { exports: {} },
  Ge = {};
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var sy = c,
  Ke = w1;
function R(e) {
  for (
    var t = 'https://reactjs.org/docs/error-decoder.html?invariant=' + e, n = 1;
    n < arguments.length;
    n++
  )
    t += '&args[]=' + encodeURIComponent(arguments[n]);
  return (
    'Minified React error #' +
    e +
    '; visit ' +
    t +
    ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
  );
}
var Qd = new Set(),
  jr = {};
function En(e, t) {
  (Zn(e, t), Zn(e + 'Capture', t));
}
function Zn(e, t) {
  for (jr[e] = t, e = 0; e < t.length; e++) Qd.add(t[e]);
}
var Rt = !(
    typeof window > 'u' ||
    typeof window.document > 'u' ||
    typeof window.document.createElement > 'u'
  ),
  ia = Object.prototype.hasOwnProperty,
  uy =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  qu = {},
  Zu = {};
function cy(e) {
  return ia.call(Zu, e)
    ? !0
    : ia.call(qu, e)
      ? !1
      : uy.test(e)
        ? (Zu[e] = !0)
        : ((qu[e] = !0), !1);
}
function dy(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case 'function':
    case 'symbol':
      return !0;
    case 'boolean':
      return r
        ? !1
        : n !== null
          ? !n.acceptsBooleans
          : ((e = e.toLowerCase().slice(0, 5)), e !== 'data-' && e !== 'aria-');
    default:
      return !1;
  }
}
function fy(e, t, n, r) {
  if (t === null || typeof t > 'u' || dy(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null)
    switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
  return !1;
}
function Oe(e, t, n, r, o, i, l) {
  ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = o),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = i),
    (this.removeEmptyString = l));
}
var Se = {};
'children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
  .split(' ')
  .forEach(function (e) {
    Se[e] = new Oe(e, 0, !1, e, null, !1, !1);
  });
[
  ['acceptCharset', 'accept-charset'],
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['httpEquiv', 'http-equiv'],
].forEach(function (e) {
  var t = e[0];
  Se[t] = new Oe(t, 1, !1, e[1], null, !1, !1);
});
['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (e) {
  Se[e] = new Oe(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
[
  'autoReverse',
  'externalResourcesRequired',
  'focusable',
  'preserveAlpha',
].forEach(function (e) {
  Se[e] = new Oe(e, 2, !1, e, null, !1, !1);
});
'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
  .split(' ')
  .forEach(function (e) {
    Se[e] = new Oe(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
  Se[e] = new Oe(e, 3, !0, e, null, !1, !1);
});
['capture', 'download'].forEach(function (e) {
  Se[e] = new Oe(e, 4, !1, e, null, !1, !1);
});
['cols', 'rows', 'size', 'span'].forEach(function (e) {
  Se[e] = new Oe(e, 6, !1, e, null, !1, !1);
});
['rowSpan', 'start'].forEach(function (e) {
  Se[e] = new Oe(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var ks = /[\-:]([a-z])/g;
function Ps(e) {
  return e[1].toUpperCase();
}
'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
  .split(' ')
  .forEach(function (e) {
    var t = e.replace(ks, Ps);
    Se[t] = new Oe(t, 1, !1, e, null, !1, !1);
  });
'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'
  .split(' ')
  .forEach(function (e) {
    var t = e.replace(ks, Ps);
    Se[t] = new Oe(t, 1, !1, e, 'http://www.w3.org/1999/xlink', !1, !1);
  });
['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
  var t = e.replace(ks, Ps);
  Se[t] = new Oe(t, 1, !1, e, 'http://www.w3.org/XML/1998/namespace', !1, !1);
});
['tabIndex', 'crossOrigin'].forEach(function (e) {
  Se[e] = new Oe(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
Se.xlinkHref = new Oe(
  'xlinkHref',
  1,
  !1,
  'xlink:href',
  'http://www.w3.org/1999/xlink',
  !0,
  !1
);
['src', 'href', 'action', 'formAction'].forEach(function (e) {
  Se[e] = new Oe(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function _s(e, t, n, r) {
  var o = Se.hasOwnProperty(t) ? Se[t] : null;
  (o !== null
    ? o.type !== 0
    : r ||
      !(2 < t.length) ||
      (t[0] !== 'o' && t[0] !== 'O') ||
      (t[1] !== 'n' && t[1] !== 'N')) &&
    (fy(t, n, o, r) && (n = null),
    r || o === null
      ? cy(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, '' + n))
      : o.mustUseProperty
        ? (e[o.propertyName] = n === null ? (o.type === 3 ? !1 : '') : n)
        : ((t = o.attributeName),
          (r = o.attributeNamespace),
          n === null
            ? e.removeAttribute(t)
            : ((o = o.type),
              (n = o === 3 || (o === 4 && n === !0) ? '' : '' + n),
              r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var It = sy.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  vo = Symbol.for('react.element'),
  In = Symbol.for('react.portal'),
  On = Symbol.for('react.fragment'),
  Rs = Symbol.for('react.strict_mode'),
  la = Symbol.for('react.profiler'),
  Yd = Symbol.for('react.provider'),
  Xd = Symbol.for('react.context'),
  Ts = Symbol.for('react.forward_ref'),
  aa = Symbol.for('react.suspense'),
  sa = Symbol.for('react.suspense_list'),
  Ms = Symbol.for('react.memo'),
  bt = Symbol.for('react.lazy'),
  qd = Symbol.for('react.offscreen'),
  Ju = Symbol.iterator;
function cr(e) {
  return e === null || typeof e != 'object'
    ? null
    : ((e = (Ju && e[Ju]) || e['@@iterator']),
      typeof e == 'function' ? e : null);
}
var ie = Object.assign,
  Pl;
function gr(e) {
  if (Pl === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      Pl = (t && t[1]) || '';
    }
  return (
    `
` +
    Pl +
    e
  );
}
var _l = !1;
function Rl(e, t) {
  if (!e || _l) return '';
  _l = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t)
      if (
        ((t = function () {
          throw Error();
        }),
        Object.defineProperty(t.prototype, 'props', {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == 'object' && Reflect.construct)
      ) {
        try {
          Reflect.construct(t, []);
        } catch (u) {
          var r = u;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (u) {
          r = u;
        }
        e.call(t.prototype);
      }
    else {
      try {
        throw Error();
      } catch (u) {
        r = u;
      }
      e();
    }
  } catch (u) {
    if (u && r && typeof u.stack == 'string') {
      for (
        var o = u.stack.split(`
`),
          i = r.stack.split(`
`),
          l = o.length - 1,
          a = i.length - 1;
        1 <= l && 0 <= a && o[l] !== i[a];

      )
        a--;
      for (; 1 <= l && 0 <= a; l--, a--)
        if (o[l] !== i[a]) {
          if (l !== 1 || a !== 1)
            do
              if ((l--, a--, 0 > a || o[l] !== i[a])) {
                var s =
                  `
` + o[l].replace(' at new ', ' at ');
                return (
                  e.displayName &&
                    s.includes('<anonymous>') &&
                    (s = s.replace('<anonymous>', e.displayName)),
                  s
                );
              }
            while (1 <= l && 0 <= a);
          break;
        }
    }
  } finally {
    ((_l = !1), (Error.prepareStackTrace = n));
  }
  return (e = e ? e.displayName || e.name : '') ? gr(e) : '';
}
function py(e) {
  switch (e.tag) {
    case 5:
      return gr(e.type);
    case 16:
      return gr('Lazy');
    case 13:
      return gr('Suspense');
    case 19:
      return gr('SuspenseList');
    case 0:
    case 2:
    case 15:
      return ((e = Rl(e.type, !1)), e);
    case 11:
      return ((e = Rl(e.type.render, !1)), e);
    case 1:
      return ((e = Rl(e.type, !0)), e);
    default:
      return '';
  }
}
function ua(e) {
  if (e == null) return null;
  if (typeof e == 'function') return e.displayName || e.name || null;
  if (typeof e == 'string') return e;
  switch (e) {
    case On:
      return 'Fragment';
    case In:
      return 'Portal';
    case la:
      return 'Profiler';
    case Rs:
      return 'StrictMode';
    case aa:
      return 'Suspense';
    case sa:
      return 'SuspenseList';
  }
  if (typeof e == 'object')
    switch (e.$$typeof) {
      case Xd:
        return (e.displayName || 'Context') + '.Consumer';
      case Yd:
        return (e._context.displayName || 'Context') + '.Provider';
      case Ts:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ''),
            (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
          e
        );
      case Ms:
        return (
          (t = e.displayName || null),
          t !== null ? t : ua(e.type) || 'Memo'
        );
      case bt:
        ((t = e._payload), (e = e._init));
        try {
          return ua(e(t));
        } catch {}
    }
  return null;
}
function my(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return 'Cache';
    case 9:
      return (t.displayName || 'Context') + '.Consumer';
    case 10:
      return (t._context.displayName || 'Context') + '.Provider';
    case 18:
      return 'DehydratedFragment';
    case 11:
      return (
        (e = t.render),
        (e = e.displayName || e.name || ''),
        t.displayName || (e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')
      );
    case 7:
      return 'Fragment';
    case 5:
      return t;
    case 4:
      return 'Portal';
    case 3:
      return 'Root';
    case 6:
      return 'Text';
    case 16:
      return ua(t);
    case 8:
      return t === Rs ? 'StrictMode' : 'Mode';
    case 22:
      return 'Offscreen';
    case 12:
      return 'Profiler';
    case 21:
      return 'Scope';
    case 13:
      return 'Suspense';
    case 19:
      return 'SuspenseList';
    case 25:
      return 'TracingMarker';
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == 'function') return t.displayName || t.name || null;
      if (typeof t == 'string') return t;
  }
  return null;
}
function Zt(e) {
  switch (typeof e) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'undefined':
      return e;
    case 'object':
      return e;
    default:
      return '';
  }
}
function Zd(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === 'input' &&
    (t === 'checkbox' || t === 'radio')
  );
}
function vy(e) {
  var t = Zd(e) ? 'checked' : 'value',
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = '' + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof n < 'u' &&
    typeof n.get == 'function' &&
    typeof n.set == 'function'
  ) {
    var o = n.get,
      i = n.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return o.call(this);
        },
        set: function (l) {
          ((r = '' + l), i.call(this, l));
        },
      }),
      Object.defineProperty(e, t, { enumerable: n.enumerable }),
      {
        getValue: function () {
          return r;
        },
        setValue: function (l) {
          r = '' + l;
        },
        stopTracking: function () {
          ((e._valueTracker = null), delete e[t]);
        },
      }
    );
  }
}
function ho(e) {
  e._valueTracker || (e._valueTracker = vy(e));
}
function Jd(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = '';
  return (
    e && (r = Zd(e) ? (e.checked ? 'true' : 'false') : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function Xo(e) {
  if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u'))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function ca(e, t) {
  var n = t.checked;
  return ie({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function ec(e, t) {
  var n = t.defaultValue == null ? '' : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  ((n = Zt(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled:
        t.type === 'checkbox' || t.type === 'radio'
          ? t.checked != null
          : t.value != null,
    }));
}
function ef(e, t) {
  ((t = t.checked), t != null && _s(e, 'checked', t, !1));
}
function da(e, t) {
  ef(e, t);
  var n = Zt(t.value),
    r = t.type;
  if (n != null)
    r === 'number'
      ? ((n === 0 && e.value === '') || e.value != n) && (e.value = '' + n)
      : e.value !== '' + n && (e.value = '' + n);
  else if (r === 'submit' || r === 'reset') {
    e.removeAttribute('value');
    return;
  }
  (t.hasOwnProperty('value')
    ? fa(e, t.type, n)
    : t.hasOwnProperty('defaultValue') && fa(e, t.type, Zt(t.defaultValue)),
    t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked));
}
function tc(e, t, n) {
  if (t.hasOwnProperty('value') || t.hasOwnProperty('defaultValue')) {
    var r = t.type;
    if (
      !(
        (r !== 'submit' && r !== 'reset') ||
        (t.value !== void 0 && t.value !== null)
      )
    )
      return;
    ((t = '' + e._wrapperState.initialValue),
      n || t === e.value || (e.value = t),
      (e.defaultValue = t));
  }
  ((n = e.name),
    n !== '' && (e.name = ''),
    (e.defaultChecked = !!e._wrapperState.initialChecked),
    n !== '' && (e.name = n));
}
function fa(e, t, n) {
  (t !== 'number' || Xo(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = '' + e._wrapperState.initialValue)
      : e.defaultValue !== '' + n && (e.defaultValue = '' + n));
}
var wr = Array.isArray;
function Hn(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var o = 0; o < n.length; o++) t['$' + n[o]] = !0;
    for (n = 0; n < e.length; n++)
      ((o = t.hasOwnProperty('$' + e[n].value)),
        e[n].selected !== o && (e[n].selected = o),
        o && r && (e[n].defaultSelected = !0));
  } else {
    for (n = '' + Zt(n), t = null, o = 0; o < e.length; o++) {
      if (e[o].value === n) {
        ((e[o].selected = !0), r && (e[o].defaultSelected = !0));
        return;
      }
      t !== null || e[o].disabled || (t = e[o]);
    }
    t !== null && (t.selected = !0);
  }
}
function pa(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(R(91));
  return ie({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: '' + e._wrapperState.initialValue,
  });
}
function nc(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(R(92));
      if (wr(n)) {
        if (1 < n.length) throw Error(R(93));
        n = n[0];
      }
      t = n;
    }
    (t == null && (t = ''), (n = t));
  }
  e._wrapperState = { initialValue: Zt(n) };
}
function tf(e, t) {
  var n = Zt(t.value),
    r = Zt(t.defaultValue);
  (n != null &&
    ((n = '' + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = '' + r));
}
function rc(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== '' && t !== null && (e.value = t);
}
function nf(e) {
  switch (e) {
    case 'svg':
      return 'http://www.w3.org/2000/svg';
    case 'math':
      return 'http://www.w3.org/1998/Math/MathML';
    default:
      return 'http://www.w3.org/1999/xhtml';
  }
}
function ma(e, t) {
  return e == null || e === 'http://www.w3.org/1999/xhtml'
    ? nf(t)
    : e === 'http://www.w3.org/2000/svg' && t === 'foreignObject'
      ? 'http://www.w3.org/1999/xhtml'
      : e;
}
var yo,
  rf = (function (e) {
    return typeof MSApp < 'u' && MSApp.execUnsafeLocalFunction
      ? function (t, n, r, o) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(t, n, r, o);
          });
        }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== 'http://www.w3.org/2000/svg' || 'innerHTML' in e)
      e.innerHTML = t;
    else {
      for (
        yo = yo || document.createElement('div'),
          yo.innerHTML = '<svg>' + t.valueOf().toString() + '</svg>',
          t = yo.firstChild;
        e.firstChild;

      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function Lr(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Pr = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  hy = ['Webkit', 'ms', 'Moz', 'O'];
Object.keys(Pr).forEach(function (e) {
  hy.forEach(function (t) {
    ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Pr[t] = Pr[e]));
  });
});
function of(e, t, n) {
  return t == null || typeof t == 'boolean' || t === ''
    ? ''
    : n || typeof t != 'number' || t === 0 || (Pr.hasOwnProperty(e) && Pr[e])
      ? ('' + t).trim()
      : t + 'px';
}
function lf(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf('--') === 0,
        o = of(n, t[n], r);
      (n === 'float' && (n = 'cssFloat'), r ? e.setProperty(n, o) : (e[n] = o));
    }
}
var yy = ie(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  }
);
function va(e, t) {
  if (t) {
    if (yy[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
      throw Error(R(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(R(60));
      if (
        typeof t.dangerouslySetInnerHTML != 'object' ||
        !('__html' in t.dangerouslySetInnerHTML)
      )
        throw Error(R(61));
    }
    if (t.style != null && typeof t.style != 'object') throw Error(R(62));
  }
}
function ha(e, t) {
  if (e.indexOf('-') === -1) return typeof t.is == 'string';
  switch (e) {
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return !1;
    default:
      return !0;
  }
}
var ya = null;
function Ns(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var ga = null,
  Wn = null,
  Kn = null;
function oc(e) {
  if ((e = io(e))) {
    if (typeof ga != 'function') throw Error(R(280));
    var t = e.stateNode;
    t && ((t = Li(t)), ga(e.stateNode, e.type, t));
  }
}
function af(e) {
  Wn ? (Kn ? Kn.push(e) : (Kn = [e])) : (Wn = e);
}
function sf() {
  if (Wn) {
    var e = Wn,
      t = Kn;
    if (((Kn = Wn = null), oc(e), t)) for (e = 0; e < t.length; e++) oc(t[e]);
  }
}
function uf(e, t) {
  return e(t);
}
function cf() {}
var Tl = !1;
function df(e, t, n) {
  if (Tl) return e(t, n);
  Tl = !0;
  try {
    return uf(e, t, n);
  } finally {
    ((Tl = !1), (Wn !== null || Kn !== null) && (cf(), sf()));
  }
}
function br(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Li(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
    case 'onMouseEnter':
      ((r = !r.disabled) ||
        ((e = e.type),
        (r = !(
          e === 'button' ||
          e === 'input' ||
          e === 'select' ||
          e === 'textarea'
        ))),
        (e = !r));
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != 'function') throw Error(R(231, t, typeof n));
  return n;
}
var wa = !1;
if (Rt)
  try {
    var dr = {};
    (Object.defineProperty(dr, 'passive', {
      get: function () {
        wa = !0;
      },
    }),
      window.addEventListener('test', dr, dr),
      window.removeEventListener('test', dr, dr));
  } catch {
    wa = !1;
  }
function gy(e, t, n, r, o, i, l, a, s) {
  var u = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, u);
  } catch (f) {
    this.onError(f);
  }
}
var _r = !1,
  qo = null,
  Zo = !1,
  Sa = null,
  wy = {
    onError: function (e) {
      ((_r = !0), (qo = e));
    },
  };
function Sy(e, t, n, r, o, i, l, a, s) {
  ((_r = !1), (qo = null), gy.apply(wy, arguments));
}
function xy(e, t, n, r, o, i, l, a, s) {
  if ((Sy.apply(this, arguments), _r)) {
    if (_r) {
      var u = qo;
      ((_r = !1), (qo = null));
    } else throw Error(R(198));
    Zo || ((Zo = !0), (Sa = u));
  }
}
function kn(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function ff(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (
      (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
      t !== null)
    )
      return t.dehydrated;
  }
  return null;
}
function ic(e) {
  if (kn(e) !== e) throw Error(R(188));
}
function Cy(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = kn(e)), t === null)) throw Error(R(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var o = n.return;
    if (o === null) break;
    var i = o.alternate;
    if (i === null) {
      if (((r = o.return), r !== null)) {
        n = r;
        continue;
      }
      break;
    }
    if (o.child === i.child) {
      for (i = o.child; i; ) {
        if (i === n) return (ic(o), e);
        if (i === r) return (ic(o), t);
        i = i.sibling;
      }
      throw Error(R(188));
    }
    if (n.return !== r.return) ((n = o), (r = i));
    else {
      for (var l = !1, a = o.child; a; ) {
        if (a === n) {
          ((l = !0), (n = o), (r = i));
          break;
        }
        if (a === r) {
          ((l = !0), (r = o), (n = i));
          break;
        }
        a = a.sibling;
      }
      if (!l) {
        for (a = i.child; a; ) {
          if (a === n) {
            ((l = !0), (n = i), (r = o));
            break;
          }
          if (a === r) {
            ((l = !0), (r = i), (n = o));
            break;
          }
          a = a.sibling;
        }
        if (!l) throw Error(R(189));
      }
    }
    if (n.alternate !== r) throw Error(R(190));
  }
  if (n.tag !== 3) throw Error(R(188));
  return n.stateNode.current === n ? e : t;
}
function pf(e) {
  return ((e = Cy(e)), e !== null ? mf(e) : null);
}
function mf(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = mf(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var vf = Ke.unstable_scheduleCallback,
  lc = Ke.unstable_cancelCallback,
  Ey = Ke.unstable_shouldYield,
  ky = Ke.unstable_requestPaint,
  se = Ke.unstable_now,
  Py = Ke.unstable_getCurrentPriorityLevel,
  As = Ke.unstable_ImmediatePriority,
  hf = Ke.unstable_UserBlockingPriority,
  Jo = Ke.unstable_NormalPriority,
  _y = Ke.unstable_LowPriority,
  yf = Ke.unstable_IdlePriority,
  Ii = null,
  gt = null;
function Ry(e) {
  if (gt && typeof gt.onCommitFiberRoot == 'function')
    try {
      gt.onCommitFiberRoot(Ii, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var ct = Math.clz32 ? Math.clz32 : Ny,
  Ty = Math.log,
  My = Math.LN2;
function Ny(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((Ty(e) / My) | 0)) | 0);
}
var go = 64,
  wo = 4194304;
function Sr(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function ei(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    o = e.suspendedLanes,
    i = e.pingedLanes,
    l = n & 268435455;
  if (l !== 0) {
    var a = l & ~o;
    a !== 0 ? (r = Sr(a)) : ((i &= l), i !== 0 && (r = Sr(i)));
  } else ((l = n & ~o), l !== 0 ? (r = Sr(l)) : i !== 0 && (r = Sr(i)));
  if (r === 0) return 0;
  if (
    t !== 0 &&
    t !== r &&
    !(t & o) &&
    ((o = r & -r), (i = t & -t), o >= i || (o === 16 && (i & 4194240) !== 0))
  )
    return t;
  if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= r; 0 < t; )
      ((n = 31 - ct(t)), (o = 1 << n), (r |= e[n]), (t &= ~o));
  return r;
}
function Ay(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Iy(e, t) {
  for (
    var n = e.suspendedLanes,
      r = e.pingedLanes,
      o = e.expirationTimes,
      i = e.pendingLanes;
    0 < i;

  ) {
    var l = 31 - ct(i),
      a = 1 << l,
      s = o[l];
    (s === -1
      ? (!(a & n) || a & r) && (o[l] = Ay(a, t))
      : s <= t && (e.expiredLanes |= a),
      (i &= ~a));
  }
}
function xa(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function gf() {
  var e = go;
  return ((go <<= 1), !(go & 4194240) && (go = 64), e);
}
function Ml(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function ro(e, t, n) {
  ((e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - ct(t)),
    (e[t] = n));
}
function Oy(e, t) {
  var n = e.pendingLanes & ~t;
  ((e.pendingLanes = t),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.expiredLanes &= t),
    (e.mutableReadLanes &= t),
    (e.entangledLanes &= t),
    (t = e.entanglements));
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var o = 31 - ct(n),
      i = 1 << o;
    ((t[o] = 0), (r[o] = -1), (e[o] = -1), (n &= ~i));
  }
}
function Is(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - ct(n),
      o = 1 << r;
    ((o & t) | (e[r] & t) && (e[r] |= t), (n &= ~o));
  }
}
var W = 0;
function wf(e) {
  return (
    (e &= -e),
    1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1
  );
}
var Sf,
  Os,
  xf,
  Cf,
  Ef,
  Ca = !1,
  So = [],
  Vt = null,
  Ht = null,
  Wt = null,
  Fr = new Map(),
  $r = new Map(),
  $t = [],
  Dy =
    'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
      ' '
    );
function ac(e, t) {
  switch (e) {
    case 'focusin':
    case 'focusout':
      Vt = null;
      break;
    case 'dragenter':
    case 'dragleave':
      Ht = null;
      break;
    case 'mouseover':
    case 'mouseout':
      Wt = null;
      break;
    case 'pointerover':
    case 'pointerout':
      Fr.delete(t.pointerId);
      break;
    case 'gotpointercapture':
    case 'lostpointercapture':
      $r.delete(t.pointerId);
  }
}
function fr(e, t, n, r, o, i) {
  return e === null || e.nativeEvent !== i
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: i,
        targetContainers: [o],
      }),
      t !== null && ((t = io(t)), t !== null && Os(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      o !== null && t.indexOf(o) === -1 && t.push(o),
      e);
}
function jy(e, t, n, r, o) {
  switch (t) {
    case 'focusin':
      return ((Vt = fr(Vt, e, t, n, r, o)), !0);
    case 'dragenter':
      return ((Ht = fr(Ht, e, t, n, r, o)), !0);
    case 'mouseover':
      return ((Wt = fr(Wt, e, t, n, r, o)), !0);
    case 'pointerover':
      var i = o.pointerId;
      return (Fr.set(i, fr(Fr.get(i) || null, e, t, n, r, o)), !0);
    case 'gotpointercapture':
      return (
        (i = o.pointerId),
        $r.set(i, fr($r.get(i) || null, e, t, n, r, o)),
        !0
      );
  }
  return !1;
}
function kf(e) {
  var t = un(e.target);
  if (t !== null) {
    var n = kn(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = ff(n)), t !== null)) {
          ((e.blockedOn = t),
            Ef(e.priority, function () {
              xf(n);
            }));
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function bo(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Ea(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ((ya = r), n.target.dispatchEvent(r), (ya = null));
    } else return ((t = io(n)), t !== null && Os(t), (e.blockedOn = n), !1);
    t.shift();
  }
  return !0;
}
function sc(e, t, n) {
  bo(e) && n.delete(t);
}
function Ly() {
  ((Ca = !1),
    Vt !== null && bo(Vt) && (Vt = null),
    Ht !== null && bo(Ht) && (Ht = null),
    Wt !== null && bo(Wt) && (Wt = null),
    Fr.forEach(sc),
    $r.forEach(sc));
}
function pr(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    Ca ||
      ((Ca = !0),
      Ke.unstable_scheduleCallback(Ke.unstable_NormalPriority, Ly)));
}
function zr(e) {
  function t(o) {
    return pr(o, e);
  }
  if (0 < So.length) {
    pr(So[0], e);
    for (var n = 1; n < So.length; n++) {
      var r = So[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    Vt !== null && pr(Vt, e),
      Ht !== null && pr(Ht, e),
      Wt !== null && pr(Wt, e),
      Fr.forEach(t),
      $r.forEach(t),
      n = 0;
    n < $t.length;
    n++
  )
    ((r = $t[n]), r.blockedOn === e && (r.blockedOn = null));
  for (; 0 < $t.length && ((n = $t[0]), n.blockedOn === null); )
    (kf(n), n.blockedOn === null && $t.shift());
}
var Gn = It.ReactCurrentBatchConfig,
  ti = !0;
function by(e, t, n, r) {
  var o = W,
    i = Gn.transition;
  Gn.transition = null;
  try {
    ((W = 1), Ds(e, t, n, r));
  } finally {
    ((W = o), (Gn.transition = i));
  }
}
function Fy(e, t, n, r) {
  var o = W,
    i = Gn.transition;
  Gn.transition = null;
  try {
    ((W = 4), Ds(e, t, n, r));
  } finally {
    ((W = o), (Gn.transition = i));
  }
}
function Ds(e, t, n, r) {
  if (ti) {
    var o = Ea(e, t, n, r);
    if (o === null) ($l(e, t, r, ni, n), ac(e, r));
    else if (jy(o, e, t, n, r)) r.stopPropagation();
    else if ((ac(e, r), t & 4 && -1 < Dy.indexOf(e))) {
      for (; o !== null; ) {
        var i = io(o);
        if (
          (i !== null && Sf(i),
          (i = Ea(e, t, n, r)),
          i === null && $l(e, t, r, ni, n),
          i === o)
        )
          break;
        o = i;
      }
      o !== null && r.stopPropagation();
    } else $l(e, t, r, null, n);
  }
}
var ni = null;
function Ea(e, t, n, r) {
  if (((ni = null), (e = Ns(r)), (e = un(e)), e !== null))
    if (((t = kn(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = ff(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return ((ni = e), null);
}
function Pf(e) {
  switch (e) {
    case 'cancel':
    case 'click':
    case 'close':
    case 'contextmenu':
    case 'copy':
    case 'cut':
    case 'auxclick':
    case 'dblclick':
    case 'dragend':
    case 'dragstart':
    case 'drop':
    case 'focusin':
    case 'focusout':
    case 'input':
    case 'invalid':
    case 'keydown':
    case 'keypress':
    case 'keyup':
    case 'mousedown':
    case 'mouseup':
    case 'paste':
    case 'pause':
    case 'play':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'ratechange':
    case 'reset':
    case 'resize':
    case 'seeked':
    case 'submit':
    case 'touchcancel':
    case 'touchend':
    case 'touchstart':
    case 'volumechange':
    case 'change':
    case 'selectionchange':
    case 'textInput':
    case 'compositionstart':
    case 'compositionend':
    case 'compositionupdate':
    case 'beforeblur':
    case 'afterblur':
    case 'beforeinput':
    case 'blur':
    case 'fullscreenchange':
    case 'focus':
    case 'hashchange':
    case 'popstate':
    case 'select':
    case 'selectstart':
      return 1;
    case 'drag':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'scroll':
    case 'toggle':
    case 'touchmove':
    case 'wheel':
    case 'mouseenter':
    case 'mouseleave':
    case 'pointerenter':
    case 'pointerleave':
      return 4;
    case 'message':
      switch (Py()) {
        case As:
          return 1;
        case hf:
          return 4;
        case Jo:
        case _y:
          return 16;
        case yf:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Bt = null,
  js = null,
  Fo = null;
function _f() {
  if (Fo) return Fo;
  var e,
    t = js,
    n = t.length,
    r,
    o = 'value' in Bt ? Bt.value : Bt.textContent,
    i = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++);
  var l = n - e;
  for (r = 1; r <= l && t[n - r] === o[i - r]; r++);
  return (Fo = o.slice(e, 1 < r ? 1 - r : void 0));
}
function $o(e) {
  var t = e.keyCode;
  return (
    'charCode' in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function xo() {
  return !0;
}
function uc() {
  return !1;
}
function Qe(e) {
  function t(n, r, o, i, l) {
    ((this._reactName = n),
      (this._targetInst = o),
      (this.type = r),
      (this.nativeEvent = i),
      (this.target = l),
      (this.currentTarget = null));
    for (var a in e)
      e.hasOwnProperty(a) && ((n = e[a]), (this[a] = n ? n(i) : i[a]));
    return (
      (this.isDefaultPrevented = (
        i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1
      )
        ? xo
        : uc),
      (this.isPropagationStopped = uc),
      this
    );
  }
  return (
    ie(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != 'unknown' && (n.returnValue = !1),
          (this.isDefaultPrevented = xo));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != 'unknown' && (n.cancelBubble = !0),
          (this.isPropagationStopped = xo));
      },
      persist: function () {},
      isPersistent: xo,
    }),
    t
  );
}
var ar = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  Ls = Qe(ar),
  oo = ie({}, ar, { view: 0, detail: 0 }),
  $y = Qe(oo),
  Nl,
  Al,
  mr,
  Oi = ie({}, oo, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: bs,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return 'movementX' in e
        ? e.movementX
        : (e !== mr &&
            (mr && e.type === 'mousemove'
              ? ((Nl = e.screenX - mr.screenX), (Al = e.screenY - mr.screenY))
              : (Al = Nl = 0),
            (mr = e)),
          Nl);
    },
    movementY: function (e) {
      return 'movementY' in e ? e.movementY : Al;
    },
  }),
  cc = Qe(Oi),
  zy = ie({}, Oi, { dataTransfer: 0 }),
  By = Qe(zy),
  Uy = ie({}, oo, { relatedTarget: 0 }),
  Il = Qe(Uy),
  Vy = ie({}, ar, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Hy = Qe(Vy),
  Wy = ie({}, ar, {
    clipboardData: function (e) {
      return 'clipboardData' in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Ky = Qe(Wy),
  Gy = ie({}, ar, { data: 0 }),
  dc = Qe(Gy),
  Qy = {
    Esc: 'Escape',
    Spacebar: ' ',
    Left: 'ArrowLeft',
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Del: 'Delete',
    Win: 'OS',
    Menu: 'ContextMenu',
    Apps: 'ContextMenu',
    Scroll: 'ScrollLock',
    MozPrintableKey: 'Unidentified',
  },
  Yy = {
    8: 'Backspace',
    9: 'Tab',
    12: 'Clear',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    19: 'Pause',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    45: 'Insert',
    46: 'Delete',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    144: 'NumLock',
    145: 'ScrollLock',
    224: 'Meta',
  },
  Xy = {
    Alt: 'altKey',
    Control: 'ctrlKey',
    Meta: 'metaKey',
    Shift: 'shiftKey',
  };
function qy(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Xy[e]) ? !!t[e] : !1;
}
function bs() {
  return qy;
}
var Zy = ie({}, oo, {
    key: function (e) {
      if (e.key) {
        var t = Qy[e.key] || e.key;
        if (t !== 'Unidentified') return t;
      }
      return e.type === 'keypress'
        ? ((e = $o(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
        : e.type === 'keydown' || e.type === 'keyup'
          ? Yy[e.keyCode] || 'Unidentified'
          : '';
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: bs,
    charCode: function (e) {
      return e.type === 'keypress' ? $o(e) : 0;
    },
    keyCode: function (e) {
      return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === 'keypress'
        ? $o(e)
        : e.type === 'keydown' || e.type === 'keyup'
          ? e.keyCode
          : 0;
    },
  }),
  Jy = Qe(Zy),
  eg = ie({}, Oi, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  fc = Qe(eg),
  tg = ie({}, oo, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: bs,
  }),
  ng = Qe(tg),
  rg = ie({}, ar, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  og = Qe(rg),
  ig = ie({}, Oi, {
    deltaX: function (e) {
      return 'deltaX' in e ? e.deltaX : 'wheelDeltaX' in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return 'deltaY' in e
        ? e.deltaY
        : 'wheelDeltaY' in e
          ? -e.wheelDeltaY
          : 'wheelDelta' in e
            ? -e.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  lg = Qe(ig),
  ag = [9, 13, 27, 32],
  Fs = Rt && 'CompositionEvent' in window,
  Rr = null;
Rt && 'documentMode' in document && (Rr = document.documentMode);
var sg = Rt && 'TextEvent' in window && !Rr,
  Rf = Rt && (!Fs || (Rr && 8 < Rr && 11 >= Rr)),
  pc = ' ',
  mc = !1;
function Tf(e, t) {
  switch (e) {
    case 'keyup':
      return ag.indexOf(t.keyCode) !== -1;
    case 'keydown':
      return t.keyCode !== 229;
    case 'keypress':
    case 'mousedown':
    case 'focusout':
      return !0;
    default:
      return !1;
  }
}
function Mf(e) {
  return ((e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null);
}
var Dn = !1;
function ug(e, t) {
  switch (e) {
    case 'compositionend':
      return Mf(t);
    case 'keypress':
      return t.which !== 32 ? null : ((mc = !0), pc);
    case 'textInput':
      return ((e = t.data), e === pc && mc ? null : e);
    default:
      return null;
  }
}
function cg(e, t) {
  if (Dn)
    return e === 'compositionend' || (!Fs && Tf(e, t))
      ? ((e = _f()), (Fo = js = Bt = null), (Dn = !1), e)
      : null;
  switch (e) {
    case 'paste':
      return null;
    case 'keypress':
      if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case 'compositionend':
      return Rf && t.locale !== 'ko' ? null : t.data;
    default:
      return null;
  }
}
var dg = {
  color: !0,
  date: !0,
  datetime: !0,
  'datetime-local': !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function vc(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === 'input' ? !!dg[e.type] : t === 'textarea';
}
function Nf(e, t, n, r) {
  (af(r),
    (t = ri(t, 'onChange')),
    0 < t.length &&
      ((n = new Ls('onChange', 'change', null, n, r)),
      e.push({ event: n, listeners: t })));
}
var Tr = null,
  Br = null;
function fg(e) {
  Bf(e, 0);
}
function Di(e) {
  var t = bn(e);
  if (Jd(t)) return e;
}
function pg(e, t) {
  if (e === 'change') return t;
}
var Af = !1;
if (Rt) {
  var Ol;
  if (Rt) {
    var Dl = 'oninput' in document;
    if (!Dl) {
      var hc = document.createElement('div');
      (hc.setAttribute('oninput', 'return;'),
        (Dl = typeof hc.oninput == 'function'));
    }
    Ol = Dl;
  } else Ol = !1;
  Af = Ol && (!document.documentMode || 9 < document.documentMode);
}
function yc() {
  Tr && (Tr.detachEvent('onpropertychange', If), (Br = Tr = null));
}
function If(e) {
  if (e.propertyName === 'value' && Di(Br)) {
    var t = [];
    (Nf(t, Br, e, Ns(e)), df(fg, t));
  }
}
function mg(e, t, n) {
  e === 'focusin'
    ? (yc(), (Tr = t), (Br = n), Tr.attachEvent('onpropertychange', If))
    : e === 'focusout' && yc();
}
function vg(e) {
  if (e === 'selectionchange' || e === 'keyup' || e === 'keydown')
    return Di(Br);
}
function hg(e, t) {
  if (e === 'click') return Di(t);
}
function yg(e, t) {
  if (e === 'input' || e === 'change') return Di(t);
}
function gg(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var ft = typeof Object.is == 'function' ? Object.is : gg;
function Ur(e, t) {
  if (ft(e, t)) return !0;
  if (typeof e != 'object' || e === null || typeof t != 'object' || t === null)
    return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var o = n[r];
    if (!ia.call(t, o) || !ft(e[o], t[o])) return !1;
  }
  return !0;
}
function gc(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function wc(e, t) {
  var n = gc(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (((r = e + n.textContent.length), e <= t && r >= t))
        return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = gc(n);
  }
}
function Of(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? Of(e, t.parentNode)
          : 'contains' in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function Df() {
  for (var e = window, t = Xo(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == 'string';
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Xo(e.document);
  }
  return t;
}
function $s(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === 'input' &&
      (e.type === 'text' ||
        e.type === 'search' ||
        e.type === 'tel' ||
        e.type === 'url' ||
        e.type === 'password')) ||
      t === 'textarea' ||
      e.contentEditable === 'true')
  );
}
function wg(e) {
  var t = Df(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (
    t !== n &&
    n &&
    n.ownerDocument &&
    Of(n.ownerDocument.documentElement, n)
  ) {
    if (r !== null && $s(n)) {
      if (
        ((t = r.start),
        (e = r.end),
        e === void 0 && (e = t),
        'selectionStart' in n)
      )
        ((n.selectionStart = t),
          (n.selectionEnd = Math.min(e, n.value.length)));
      else if (
        ((e = ((t = n.ownerDocument || document) && t.defaultView) || window),
        e.getSelection)
      ) {
        e = e.getSelection();
        var o = n.textContent.length,
          i = Math.min(r.start, o);
        ((r = r.end === void 0 ? i : Math.min(r.end, o)),
          !e.extend && i > r && ((o = r), (r = i), (i = o)),
          (o = wc(n, i)));
        var l = wc(n, r);
        o &&
          l &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== o.node ||
            e.anchorOffset !== o.offset ||
            e.focusNode !== l.node ||
            e.focusOffset !== l.offset) &&
          ((t = t.createRange()),
          t.setStart(o.node, o.offset),
          e.removeAllRanges(),
          i > r
            ? (e.addRange(t), e.extend(l.node, l.offset))
            : (t.setEnd(l.node, l.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; (e = e.parentNode); )
      e.nodeType === 1 &&
        t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == 'function' && n.focus(), n = 0; n < t.length; n++)
      ((e = t[n]),
        (e.element.scrollLeft = e.left),
        (e.element.scrollTop = e.top));
  }
}
var Sg = Rt && 'documentMode' in document && 11 >= document.documentMode,
  jn = null,
  ka = null,
  Mr = null,
  Pa = !1;
function Sc(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Pa ||
    jn == null ||
    jn !== Xo(r) ||
    ((r = jn),
    'selectionStart' in r && $s(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = (
          (r.ownerDocument && r.ownerDocument.defaultView) ||
          window
        ).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (Mr && Ur(Mr, r)) ||
      ((Mr = r),
      (r = ri(ka, 'onSelect')),
      0 < r.length &&
        ((t = new Ls('onSelect', 'select', null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = jn))));
}
function Co(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n['Webkit' + e] = 'webkit' + t),
    (n['Moz' + e] = 'moz' + t),
    n
  );
}
var Ln = {
    animationend: Co('Animation', 'AnimationEnd'),
    animationiteration: Co('Animation', 'AnimationIteration'),
    animationstart: Co('Animation', 'AnimationStart'),
    transitionend: Co('Transition', 'TransitionEnd'),
  },
  jl = {},
  jf = {};
Rt &&
  ((jf = document.createElement('div').style),
  'AnimationEvent' in window ||
    (delete Ln.animationend.animation,
    delete Ln.animationiteration.animation,
    delete Ln.animationstart.animation),
  'TransitionEvent' in window || delete Ln.transitionend.transition);
function ji(e) {
  if (jl[e]) return jl[e];
  if (!Ln[e]) return e;
  var t = Ln[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in jf) return (jl[e] = t[n]);
  return e;
}
var Lf = ji('animationend'),
  bf = ji('animationiteration'),
  Ff = ji('animationstart'),
  $f = ji('transitionend'),
  zf = new Map(),
  xc =
    'abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
      ' '
    );
function en(e, t) {
  (zf.set(e, t), En(t, [e]));
}
for (var Ll = 0; Ll < xc.length; Ll++) {
  var bl = xc[Ll],
    xg = bl.toLowerCase(),
    Cg = bl[0].toUpperCase() + bl.slice(1);
  en(xg, 'on' + Cg);
}
en(Lf, 'onAnimationEnd');
en(bf, 'onAnimationIteration');
en(Ff, 'onAnimationStart');
en('dblclick', 'onDoubleClick');
en('focusin', 'onFocus');
en('focusout', 'onBlur');
en($f, 'onTransitionEnd');
Zn('onMouseEnter', ['mouseout', 'mouseover']);
Zn('onMouseLeave', ['mouseout', 'mouseover']);
Zn('onPointerEnter', ['pointerout', 'pointerover']);
Zn('onPointerLeave', ['pointerout', 'pointerover']);
En(
  'onChange',
  'change click focusin focusout input keydown keyup selectionchange'.split(' ')
);
En(
  'onSelect',
  'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(
    ' '
  )
);
En('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste']);
En(
  'onCompositionEnd',
  'compositionend focusout keydown keypress keyup mousedown'.split(' ')
);
En(
  'onCompositionStart',
  'compositionstart focusout keydown keypress keyup mousedown'.split(' ')
);
En(
  'onCompositionUpdate',
  'compositionupdate focusout keydown keypress keyup mousedown'.split(' ')
);
var xr =
    'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
      ' '
    ),
  Eg = new Set('cancel close invalid load scroll toggle'.split(' ').concat(xr));
function Cc(e, t, n) {
  var r = e.type || 'unknown-event';
  ((e.currentTarget = n), xy(r, t, void 0, e), (e.currentTarget = null));
}
function Bf(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      o = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t)
        for (var l = r.length - 1; 0 <= l; l--) {
          var a = r[l],
            s = a.instance,
            u = a.currentTarget;
          if (((a = a.listener), s !== i && o.isPropagationStopped())) break e;
          (Cc(o, a, u), (i = s));
        }
      else
        for (l = 0; l < r.length; l++) {
          if (
            ((a = r[l]),
            (s = a.instance),
            (u = a.currentTarget),
            (a = a.listener),
            s !== i && o.isPropagationStopped())
          )
            break e;
          (Cc(o, a, u), (i = s));
        }
    }
  }
  if (Zo) throw ((e = Sa), (Zo = !1), (Sa = null), e);
}
function J(e, t) {
  var n = t[Na];
  n === void 0 && (n = t[Na] = new Set());
  var r = e + '__bubble';
  n.has(r) || (Uf(t, e, 2, !1), n.add(r));
}
function Fl(e, t, n) {
  var r = 0;
  (t && (r |= 4), Uf(n, e, r, t));
}
var Eo = '_reactListening' + Math.random().toString(36).slice(2);
function Vr(e) {
  if (!e[Eo]) {
    ((e[Eo] = !0),
      Qd.forEach(function (n) {
        n !== 'selectionchange' && (Eg.has(n) || Fl(n, !1, e), Fl(n, !0, e));
      }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Eo] || ((t[Eo] = !0), Fl('selectionchange', !1, t));
  }
}
function Uf(e, t, n, r) {
  switch (Pf(t)) {
    case 1:
      var o = by;
      break;
    case 4:
      o = Fy;
      break;
    default:
      o = Ds;
  }
  ((n = o.bind(null, t, n, e)),
    (o = void 0),
    !wa ||
      (t !== 'touchstart' && t !== 'touchmove' && t !== 'wheel') ||
      (o = !0),
    r
      ? o !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: o })
        : e.addEventListener(t, n, !0)
      : o !== void 0
        ? e.addEventListener(t, n, { passive: o })
        : e.addEventListener(t, n, !1));
}
function $l(e, t, n, r, o) {
  var i = r;
  if (!(t & 1) && !(t & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var l = r.tag;
      if (l === 3 || l === 4) {
        var a = r.stateNode.containerInfo;
        if (a === o || (a.nodeType === 8 && a.parentNode === o)) break;
        if (l === 4)
          for (l = r.return; l !== null; ) {
            var s = l.tag;
            if (
              (s === 3 || s === 4) &&
              ((s = l.stateNode.containerInfo),
              s === o || (s.nodeType === 8 && s.parentNode === o))
            )
              return;
            l = l.return;
          }
        for (; a !== null; ) {
          if (((l = un(a)), l === null)) return;
          if (((s = l.tag), s === 5 || s === 6)) {
            r = i = l;
            continue e;
          }
          a = a.parentNode;
        }
      }
      r = r.return;
    }
  df(function () {
    var u = i,
      f = Ns(n),
      m = [];
    e: {
      var y = zf.get(e);
      if (y !== void 0) {
        var S = Ls,
          C = e;
        switch (e) {
          case 'keypress':
            if ($o(n) === 0) break e;
          case 'keydown':
          case 'keyup':
            S = Jy;
            break;
          case 'focusin':
            ((C = 'focus'), (S = Il));
            break;
          case 'focusout':
            ((C = 'blur'), (S = Il));
            break;
          case 'beforeblur':
          case 'afterblur':
            S = Il;
            break;
          case 'click':
            if (n.button === 2) break e;
          case 'auxclick':
          case 'dblclick':
          case 'mousedown':
          case 'mousemove':
          case 'mouseup':
          case 'mouseout':
          case 'mouseover':
          case 'contextmenu':
            S = cc;
            break;
          case 'drag':
          case 'dragend':
          case 'dragenter':
          case 'dragexit':
          case 'dragleave':
          case 'dragover':
          case 'dragstart':
          case 'drop':
            S = By;
            break;
          case 'touchcancel':
          case 'touchend':
          case 'touchmove':
          case 'touchstart':
            S = ng;
            break;
          case Lf:
          case bf:
          case Ff:
            S = Hy;
            break;
          case $f:
            S = og;
            break;
          case 'scroll':
            S = $y;
            break;
          case 'wheel':
            S = lg;
            break;
          case 'copy':
          case 'cut':
          case 'paste':
            S = Ky;
            break;
          case 'gotpointercapture':
          case 'lostpointercapture':
          case 'pointercancel':
          case 'pointerdown':
          case 'pointermove':
          case 'pointerout':
          case 'pointerover':
          case 'pointerup':
            S = fc;
        }
        var h = (t & 4) !== 0,
          w = !h && e === 'scroll',
          p = h ? (y !== null ? y + 'Capture' : null) : y;
        h = [];
        for (var d = u, v; d !== null; ) {
          v = d;
          var x = v.stateNode;
          if (
            (v.tag === 5 &&
              x !== null &&
              ((v = x),
              p !== null && ((x = br(d, p)), x != null && h.push(Hr(d, x, v)))),
            w)
          )
            break;
          d = d.return;
        }
        0 < h.length &&
          ((y = new S(y, C, null, n, f)), m.push({ event: y, listeners: h }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((y = e === 'mouseover' || e === 'pointerover'),
          (S = e === 'mouseout' || e === 'pointerout'),
          y &&
            n !== ya &&
            (C = n.relatedTarget || n.fromElement) &&
            (un(C) || C[Tt]))
        )
          break e;
        if (
          (S || y) &&
          ((y =
            f.window === f
              ? f
              : (y = f.ownerDocument)
                ? y.defaultView || y.parentWindow
                : window),
          S
            ? ((C = n.relatedTarget || n.toElement),
              (S = u),
              (C = C ? un(C) : null),
              C !== null &&
                ((w = kn(C)), C !== w || (C.tag !== 5 && C.tag !== 6)) &&
                (C = null))
            : ((S = null), (C = u)),
          S !== C)
        ) {
          if (
            ((h = cc),
            (x = 'onMouseLeave'),
            (p = 'onMouseEnter'),
            (d = 'mouse'),
            (e === 'pointerout' || e === 'pointerover') &&
              ((h = fc),
              (x = 'onPointerLeave'),
              (p = 'onPointerEnter'),
              (d = 'pointer')),
            (w = S == null ? y : bn(S)),
            (v = C == null ? y : bn(C)),
            (y = new h(x, d + 'leave', S, n, f)),
            (y.target = w),
            (y.relatedTarget = v),
            (x = null),
            un(f) === u &&
              ((h = new h(p, d + 'enter', C, n, f)),
              (h.target = v),
              (h.relatedTarget = w),
              (x = h)),
            (w = x),
            S && C)
          )
            t: {
              for (h = S, p = C, d = 0, v = h; v; v = Tn(v)) d++;
              for (v = 0, x = p; x; x = Tn(x)) v++;
              for (; 0 < d - v; ) ((h = Tn(h)), d--);
              for (; 0 < v - d; ) ((p = Tn(p)), v--);
              for (; d--; ) {
                if (h === p || (p !== null && h === p.alternate)) break t;
                ((h = Tn(h)), (p = Tn(p)));
              }
              h = null;
            }
          else h = null;
          (S !== null && Ec(m, y, S, h, !1),
            C !== null && w !== null && Ec(m, w, C, h, !0));
        }
      }
      e: {
        if (
          ((y = u ? bn(u) : window),
          (S = y.nodeName && y.nodeName.toLowerCase()),
          S === 'select' || (S === 'input' && y.type === 'file'))
        )
          var E = pg;
        else if (vc(y))
          if (Af) E = yg;
          else {
            E = vg;
            var P = mg;
          }
        else
          (S = y.nodeName) &&
            S.toLowerCase() === 'input' &&
            (y.type === 'checkbox' || y.type === 'radio') &&
            (E = hg);
        if (E && (E = E(e, u))) {
          Nf(m, E, n, f);
          break e;
        }
        (P && P(e, y, u),
          e === 'focusout' &&
            (P = y._wrapperState) &&
            P.controlled &&
            y.type === 'number' &&
            fa(y, 'number', y.value));
      }
      switch (((P = u ? bn(u) : window), e)) {
        case 'focusin':
          (vc(P) || P.contentEditable === 'true') &&
            ((jn = P), (ka = u), (Mr = null));
          break;
        case 'focusout':
          Mr = ka = jn = null;
          break;
        case 'mousedown':
          Pa = !0;
          break;
        case 'contextmenu':
        case 'mouseup':
        case 'dragend':
          ((Pa = !1), Sc(m, n, f));
          break;
        case 'selectionchange':
          if (Sg) break;
        case 'keydown':
        case 'keyup':
          Sc(m, n, f);
      }
      var k;
      if (Fs)
        e: {
          switch (e) {
            case 'compositionstart':
              var _ = 'onCompositionStart';
              break e;
            case 'compositionend':
              _ = 'onCompositionEnd';
              break e;
            case 'compositionupdate':
              _ = 'onCompositionUpdate';
              break e;
          }
          _ = void 0;
        }
      else
        Dn
          ? Tf(e, n) && (_ = 'onCompositionEnd')
          : e === 'keydown' && n.keyCode === 229 && (_ = 'onCompositionStart');
      (_ &&
        (Rf &&
          n.locale !== 'ko' &&
          (Dn || _ !== 'onCompositionStart'
            ? _ === 'onCompositionEnd' && Dn && (k = _f())
            : ((Bt = f),
              (js = 'value' in Bt ? Bt.value : Bt.textContent),
              (Dn = !0))),
        (P = ri(u, _)),
        0 < P.length &&
          ((_ = new dc(_, e, null, n, f)),
          m.push({ event: _, listeners: P }),
          k ? (_.data = k) : ((k = Mf(n)), k !== null && (_.data = k)))),
        (k = sg ? ug(e, n) : cg(e, n)) &&
          ((u = ri(u, 'onBeforeInput')),
          0 < u.length &&
            ((f = new dc('onBeforeInput', 'beforeinput', null, n, f)),
            m.push({ event: f, listeners: u }),
            (f.data = k))));
    }
    Bf(m, t);
  });
}
function Hr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function ri(e, t) {
  for (var n = t + 'Capture', r = []; e !== null; ) {
    var o = e,
      i = o.stateNode;
    (o.tag === 5 &&
      i !== null &&
      ((o = i),
      (i = br(e, n)),
      i != null && r.unshift(Hr(e, i, o)),
      (i = br(e, t)),
      i != null && r.push(Hr(e, i, o))),
      (e = e.return));
  }
  return r;
}
function Tn(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Ec(e, t, n, r, o) {
  for (var i = t._reactName, l = []; n !== null && n !== r; ) {
    var a = n,
      s = a.alternate,
      u = a.stateNode;
    if (s !== null && s === r) break;
    (a.tag === 5 &&
      u !== null &&
      ((a = u),
      o
        ? ((s = br(n, i)), s != null && l.unshift(Hr(n, s, a)))
        : o || ((s = br(n, i)), s != null && l.push(Hr(n, s, a)))),
      (n = n.return));
  }
  l.length !== 0 && e.push({ event: t, listeners: l });
}
var kg = /\r\n?/g,
  Pg = /\u0000|\uFFFD/g;
function kc(e) {
  return (typeof e == 'string' ? e : '' + e)
    .replace(
      kg,
      `
`
    )
    .replace(Pg, '');
}
function ko(e, t, n) {
  if (((t = kc(t)), kc(e) !== t && n)) throw Error(R(425));
}
function oi() {}
var _a = null,
  Ra = null;
function Ta(e, t) {
  return (
    e === 'textarea' ||
    e === 'noscript' ||
    typeof t.children == 'string' ||
    typeof t.children == 'number' ||
    (typeof t.dangerouslySetInnerHTML == 'object' &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var Ma = typeof setTimeout == 'function' ? setTimeout : void 0,
  _g = typeof clearTimeout == 'function' ? clearTimeout : void 0,
  Pc = typeof Promise == 'function' ? Promise : void 0,
  Rg =
    typeof queueMicrotask == 'function'
      ? queueMicrotask
      : typeof Pc < 'u'
        ? function (e) {
            return Pc.resolve(null).then(e).catch(Tg);
          }
        : Ma;
function Tg(e) {
  setTimeout(function () {
    throw e;
  });
}
function zl(e, t) {
  var n = t,
    r = 0;
  do {
    var o = n.nextSibling;
    if ((e.removeChild(n), o && o.nodeType === 8))
      if (((n = o.data), n === '/$')) {
        if (r === 0) {
          (e.removeChild(o), zr(t));
          return;
        }
        r--;
      } else (n !== '$' && n !== '$?' && n !== '$!') || r++;
    n = o;
  } while (n);
  zr(t);
}
function Kt(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (((t = e.data), t === '$' || t === '$!' || t === '$?')) break;
      if (t === '/$') return null;
    }
  }
  return e;
}
function _c(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === '$' || n === '$!' || n === '$?') {
        if (t === 0) return e;
        t--;
      } else n === '/$' && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var sr = Math.random().toString(36).slice(2),
  yt = '__reactFiber$' + sr,
  Wr = '__reactProps$' + sr,
  Tt = '__reactContainer$' + sr,
  Na = '__reactEvents$' + sr,
  Mg = '__reactListeners$' + sr,
  Ng = '__reactHandles$' + sr;
function un(e) {
  var t = e[yt];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[Tt] || n[yt])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = _c(e); e !== null; ) {
          if ((n = e[yt])) return n;
          e = _c(e);
        }
      return t;
    }
    ((e = n), (n = e.parentNode));
  }
  return null;
}
function io(e) {
  return (
    (e = e[yt] || e[Tt]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function bn(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(R(33));
}
function Li(e) {
  return e[Wr] || null;
}
var Aa = [],
  Fn = -1;
function tn(e) {
  return { current: e };
}
function ee(e) {
  0 > Fn || ((e.current = Aa[Fn]), (Aa[Fn] = null), Fn--);
}
function X(e, t) {
  (Fn++, (Aa[Fn] = e.current), (e.current = t));
}
var Jt = {},
  Pe = tn(Jt),
  Fe = tn(!1),
  mn = Jt;
function Jn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Jt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
    return r.__reactInternalMemoizedMaskedChildContext;
  var o = {},
    i;
  for (i in n) o[i] = t[i];
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = o)),
    o
  );
}
function $e(e) {
  return ((e = e.childContextTypes), e != null);
}
function ii() {
  (ee(Fe), ee(Pe));
}
function Rc(e, t, n) {
  if (Pe.current !== Jt) throw Error(R(168));
  (X(Pe, t), X(Fe, n));
}
function Vf(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != 'function'))
    return n;
  r = r.getChildContext();
  for (var o in r) if (!(o in t)) throw Error(R(108, my(e) || 'Unknown', o));
  return ie({}, n, r);
}
function li(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || Jt),
    (mn = Pe.current),
    X(Pe, e),
    X(Fe, Fe.current),
    !0
  );
}
function Tc(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(R(169));
  (n
    ? ((e = Vf(e, t, mn)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      ee(Fe),
      ee(Pe),
      X(Pe, e))
    : ee(Fe),
    X(Fe, n));
}
var Et = null,
  bi = !1,
  Bl = !1;
function Hf(e) {
  Et === null ? (Et = [e]) : Et.push(e);
}
function Ag(e) {
  ((bi = !0), Hf(e));
}
function nn() {
  if (!Bl && Et !== null) {
    Bl = !0;
    var e = 0,
      t = W;
    try {
      var n = Et;
      for (W = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      ((Et = null), (bi = !1));
    } catch (o) {
      throw (Et !== null && (Et = Et.slice(e + 1)), vf(As, nn), o);
    } finally {
      ((W = t), (Bl = !1));
    }
  }
  return null;
}
var $n = [],
  zn = 0,
  ai = null,
  si = 0,
  Xe = [],
  qe = 0,
  vn = null,
  kt = 1,
  Pt = '';
function an(e, t) {
  (($n[zn++] = si), ($n[zn++] = ai), (ai = e), (si = t));
}
function Wf(e, t, n) {
  ((Xe[qe++] = kt), (Xe[qe++] = Pt), (Xe[qe++] = vn), (vn = e));
  var r = kt;
  e = Pt;
  var o = 32 - ct(r) - 1;
  ((r &= ~(1 << o)), (n += 1));
  var i = 32 - ct(t) + o;
  if (30 < i) {
    var l = o - (o % 5);
    ((i = (r & ((1 << l) - 1)).toString(32)),
      (r >>= l),
      (o -= l),
      (kt = (1 << (32 - ct(t) + o)) | (n << o) | r),
      (Pt = i + e));
  } else ((kt = (1 << i) | (n << o) | r), (Pt = e));
}
function zs(e) {
  e.return !== null && (an(e, 1), Wf(e, 1, 0));
}
function Bs(e) {
  for (; e === ai; )
    ((ai = $n[--zn]), ($n[zn] = null), (si = $n[--zn]), ($n[zn] = null));
  for (; e === vn; )
    ((vn = Xe[--qe]),
      (Xe[qe] = null),
      (Pt = Xe[--qe]),
      (Xe[qe] = null),
      (kt = Xe[--qe]),
      (Xe[qe] = null));
}
var We = null,
  He = null,
  ne = !1,
  ut = null;
function Kf(e, t) {
  var n = Ze(5, null, null, 0);
  ((n.elementType = 'DELETED'),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n));
}
function Mc(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t =
          t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
            ? null
            : t),
        t !== null
          ? ((e.stateNode = t), (We = e), (He = Kt(t.firstChild)), !0)
          : !1
      );
    case 6:
      return (
        (t = e.pendingProps === '' || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (We = e), (He = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = vn !== null ? { id: kt, overflow: Pt } : null),
            (e.memoizedState = {
              dehydrated: t,
              treeContext: n,
              retryLane: 1073741824,
            }),
            (n = Ze(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (We = e),
            (He = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function Ia(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Oa(e) {
  if (ne) {
    var t = He;
    if (t) {
      var n = t;
      if (!Mc(e, t)) {
        if (Ia(e)) throw Error(R(418));
        t = Kt(n.nextSibling);
        var r = We;
        t && Mc(e, t)
          ? Kf(r, n)
          : ((e.flags = (e.flags & -4097) | 2), (ne = !1), (We = e));
      }
    } else {
      if (Ia(e)) throw Error(R(418));
      ((e.flags = (e.flags & -4097) | 2), (ne = !1), (We = e));
    }
  }
}
function Nc(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
    e = e.return;
  We = e;
}
function Po(e) {
  if (e !== We) return !1;
  if (!ne) return (Nc(e), (ne = !0), !1);
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== 'head' && t !== 'body' && !Ta(e.type, e.memoizedProps))),
    t && (t = He))
  ) {
    if (Ia(e)) throw (Gf(), Error(R(418)));
    for (; t; ) (Kf(e, t), (t = Kt(t.nextSibling)));
  }
  if ((Nc(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(R(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === '/$') {
            if (t === 0) {
              He = Kt(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== '$' && n !== '$!' && n !== '$?') || t++;
        }
        e = e.nextSibling;
      }
      He = null;
    }
  } else He = We ? Kt(e.stateNode.nextSibling) : null;
  return !0;
}
function Gf() {
  for (var e = He; e; ) e = Kt(e.nextSibling);
}
function er() {
  ((He = We = null), (ne = !1));
}
function Us(e) {
  ut === null ? (ut = [e]) : ut.push(e);
}
var Ig = It.ReactCurrentBatchConfig;
function vr(e, t, n) {
  if (
    ((e = n.ref), e !== null && typeof e != 'function' && typeof e != 'object')
  ) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(R(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(R(147, e));
      var o = r,
        i = '' + e;
      return t !== null &&
        t.ref !== null &&
        typeof t.ref == 'function' &&
        t.ref._stringRef === i
        ? t.ref
        : ((t = function (l) {
            var a = o.refs;
            l === null ? delete a[i] : (a[i] = l);
          }),
          (t._stringRef = i),
          t);
    }
    if (typeof e != 'string') throw Error(R(284));
    if (!n._owner) throw Error(R(290, e));
  }
  return e;
}
function _o(e, t) {
  throw (
    (e = Object.prototype.toString.call(t)),
    Error(
      R(
        31,
        e === '[object Object]'
          ? 'object with keys {' + Object.keys(t).join(', ') + '}'
          : e
      )
    )
  );
}
function Ac(e) {
  var t = e._init;
  return t(e._payload);
}
function Qf(e) {
  function t(p, d) {
    if (e) {
      var v = p.deletions;
      v === null ? ((p.deletions = [d]), (p.flags |= 16)) : v.push(d);
    }
  }
  function n(p, d) {
    if (!e) return null;
    for (; d !== null; ) (t(p, d), (d = d.sibling));
    return null;
  }
  function r(p, d) {
    for (p = new Map(); d !== null; )
      (d.key !== null ? p.set(d.key, d) : p.set(d.index, d), (d = d.sibling));
    return p;
  }
  function o(p, d) {
    return ((p = Xt(p, d)), (p.index = 0), (p.sibling = null), p);
  }
  function i(p, d, v) {
    return (
      (p.index = v),
      e
        ? ((v = p.alternate),
          v !== null
            ? ((v = v.index), v < d ? ((p.flags |= 2), d) : v)
            : ((p.flags |= 2), d))
        : ((p.flags |= 1048576), d)
    );
  }
  function l(p) {
    return (e && p.alternate === null && (p.flags |= 2), p);
  }
  function a(p, d, v, x) {
    return d === null || d.tag !== 6
      ? ((d = Ql(v, p.mode, x)), (d.return = p), d)
      : ((d = o(d, v)), (d.return = p), d);
  }
  function s(p, d, v, x) {
    var E = v.type;
    return E === On
      ? f(p, d, v.props.children, x, v.key)
      : d !== null &&
          (d.elementType === E ||
            (typeof E == 'object' &&
              E !== null &&
              E.$$typeof === bt &&
              Ac(E) === d.type))
        ? ((x = o(d, v.props)), (x.ref = vr(p, d, v)), (x.return = p), x)
        : ((x = Ko(v.type, v.key, v.props, null, p.mode, x)),
          (x.ref = vr(p, d, v)),
          (x.return = p),
          x);
  }
  function u(p, d, v, x) {
    return d === null ||
      d.tag !== 4 ||
      d.stateNode.containerInfo !== v.containerInfo ||
      d.stateNode.implementation !== v.implementation
      ? ((d = Yl(v, p.mode, x)), (d.return = p), d)
      : ((d = o(d, v.children || [])), (d.return = p), d);
  }
  function f(p, d, v, x, E) {
    return d === null || d.tag !== 7
      ? ((d = pn(v, p.mode, x, E)), (d.return = p), d)
      : ((d = o(d, v)), (d.return = p), d);
  }
  function m(p, d, v) {
    if ((typeof d == 'string' && d !== '') || typeof d == 'number')
      return ((d = Ql('' + d, p.mode, v)), (d.return = p), d);
    if (typeof d == 'object' && d !== null) {
      switch (d.$$typeof) {
        case vo:
          return (
            (v = Ko(d.type, d.key, d.props, null, p.mode, v)),
            (v.ref = vr(p, null, d)),
            (v.return = p),
            v
          );
        case In:
          return ((d = Yl(d, p.mode, v)), (d.return = p), d);
        case bt:
          var x = d._init;
          return m(p, x(d._payload), v);
      }
      if (wr(d) || cr(d))
        return ((d = pn(d, p.mode, v, null)), (d.return = p), d);
      _o(p, d);
    }
    return null;
  }
  function y(p, d, v, x) {
    var E = d !== null ? d.key : null;
    if ((typeof v == 'string' && v !== '') || typeof v == 'number')
      return E !== null ? null : a(p, d, '' + v, x);
    if (typeof v == 'object' && v !== null) {
      switch (v.$$typeof) {
        case vo:
          return v.key === E ? s(p, d, v, x) : null;
        case In:
          return v.key === E ? u(p, d, v, x) : null;
        case bt:
          return ((E = v._init), y(p, d, E(v._payload), x));
      }
      if (wr(v) || cr(v)) return E !== null ? null : f(p, d, v, x, null);
      _o(p, v);
    }
    return null;
  }
  function S(p, d, v, x, E) {
    if ((typeof x == 'string' && x !== '') || typeof x == 'number')
      return ((p = p.get(v) || null), a(d, p, '' + x, E));
    if (typeof x == 'object' && x !== null) {
      switch (x.$$typeof) {
        case vo:
          return (
            (p = p.get(x.key === null ? v : x.key) || null),
            s(d, p, x, E)
          );
        case In:
          return (
            (p = p.get(x.key === null ? v : x.key) || null),
            u(d, p, x, E)
          );
        case bt:
          var P = x._init;
          return S(p, d, v, P(x._payload), E);
      }
      if (wr(x) || cr(x)) return ((p = p.get(v) || null), f(d, p, x, E, null));
      _o(d, x);
    }
    return null;
  }
  function C(p, d, v, x) {
    for (
      var E = null, P = null, k = d, _ = (d = 0), L = null;
      k !== null && _ < v.length;
      _++
    ) {
      k.index > _ ? ((L = k), (k = null)) : (L = k.sibling);
      var A = y(p, k, v[_], x);
      if (A === null) {
        k === null && (k = L);
        break;
      }
      (e && k && A.alternate === null && t(p, k),
        (d = i(A, d, _)),
        P === null ? (E = A) : (P.sibling = A),
        (P = A),
        (k = L));
    }
    if (_ === v.length) return (n(p, k), ne && an(p, _), E);
    if (k === null) {
      for (; _ < v.length; _++)
        ((k = m(p, v[_], x)),
          k !== null &&
            ((d = i(k, d, _)),
            P === null ? (E = k) : (P.sibling = k),
            (P = k)));
      return (ne && an(p, _), E);
    }
    for (k = r(p, k); _ < v.length; _++)
      ((L = S(k, p, _, v[_], x)),
        L !== null &&
          (e && L.alternate !== null && k.delete(L.key === null ? _ : L.key),
          (d = i(L, d, _)),
          P === null ? (E = L) : (P.sibling = L),
          (P = L)));
    return (
      e &&
        k.forEach(function ($) {
          return t(p, $);
        }),
      ne && an(p, _),
      E
    );
  }
  function h(p, d, v, x) {
    var E = cr(v);
    if (typeof E != 'function') throw Error(R(150));
    if (((v = E.call(v)), v == null)) throw Error(R(151));
    for (
      var P = (E = null), k = d, _ = (d = 0), L = null, A = v.next();
      k !== null && !A.done;
      _++, A = v.next()
    ) {
      k.index > _ ? ((L = k), (k = null)) : (L = k.sibling);
      var $ = y(p, k, A.value, x);
      if ($ === null) {
        k === null && (k = L);
        break;
      }
      (e && k && $.alternate === null && t(p, k),
        (d = i($, d, _)),
        P === null ? (E = $) : (P.sibling = $),
        (P = $),
        (k = L));
    }
    if (A.done) return (n(p, k), ne && an(p, _), E);
    if (k === null) {
      for (; !A.done; _++, A = v.next())
        ((A = m(p, A.value, x)),
          A !== null &&
            ((d = i(A, d, _)),
            P === null ? (E = A) : (P.sibling = A),
            (P = A)));
      return (ne && an(p, _), E);
    }
    for (k = r(p, k); !A.done; _++, A = v.next())
      ((A = S(k, p, _, A.value, x)),
        A !== null &&
          (e && A.alternate !== null && k.delete(A.key === null ? _ : A.key),
          (d = i(A, d, _)),
          P === null ? (E = A) : (P.sibling = A),
          (P = A)));
    return (
      e &&
        k.forEach(function (G) {
          return t(p, G);
        }),
      ne && an(p, _),
      E
    );
  }
  function w(p, d, v, x) {
    if (
      (typeof v == 'object' &&
        v !== null &&
        v.type === On &&
        v.key === null &&
        (v = v.props.children),
      typeof v == 'object' && v !== null)
    ) {
      switch (v.$$typeof) {
        case vo:
          e: {
            for (var E = v.key, P = d; P !== null; ) {
              if (P.key === E) {
                if (((E = v.type), E === On)) {
                  if (P.tag === 7) {
                    (n(p, P.sibling),
                      (d = o(P, v.props.children)),
                      (d.return = p),
                      (p = d));
                    break e;
                  }
                } else if (
                  P.elementType === E ||
                  (typeof E == 'object' &&
                    E !== null &&
                    E.$$typeof === bt &&
                    Ac(E) === P.type)
                ) {
                  (n(p, P.sibling),
                    (d = o(P, v.props)),
                    (d.ref = vr(p, P, v)),
                    (d.return = p),
                    (p = d));
                  break e;
                }
                n(p, P);
                break;
              } else t(p, P);
              P = P.sibling;
            }
            v.type === On
              ? ((d = pn(v.props.children, p.mode, x, v.key)),
                (d.return = p),
                (p = d))
              : ((x = Ko(v.type, v.key, v.props, null, p.mode, x)),
                (x.ref = vr(p, d, v)),
                (x.return = p),
                (p = x));
          }
          return l(p);
        case In:
          e: {
            for (P = v.key; d !== null; ) {
              if (d.key === P)
                if (
                  d.tag === 4 &&
                  d.stateNode.containerInfo === v.containerInfo &&
                  d.stateNode.implementation === v.implementation
                ) {
                  (n(p, d.sibling),
                    (d = o(d, v.children || [])),
                    (d.return = p),
                    (p = d));
                  break e;
                } else {
                  n(p, d);
                  break;
                }
              else t(p, d);
              d = d.sibling;
            }
            ((d = Yl(v, p.mode, x)), (d.return = p), (p = d));
          }
          return l(p);
        case bt:
          return ((P = v._init), w(p, d, P(v._payload), x));
      }
      if (wr(v)) return C(p, d, v, x);
      if (cr(v)) return h(p, d, v, x);
      _o(p, v);
    }
    return (typeof v == 'string' && v !== '') || typeof v == 'number'
      ? ((v = '' + v),
        d !== null && d.tag === 6
          ? (n(p, d.sibling), (d = o(d, v)), (d.return = p), (p = d))
          : (n(p, d), (d = Ql(v, p.mode, x)), (d.return = p), (p = d)),
        l(p))
      : n(p, d);
  }
  return w;
}
var tr = Qf(!0),
  Yf = Qf(!1),
  ui = tn(null),
  ci = null,
  Bn = null,
  Vs = null;
function Hs() {
  Vs = Bn = ci = null;
}
function Ws(e) {
  var t = ui.current;
  (ee(ui), (e._currentValue = t));
}
function Da(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
        : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
      e === n)
    )
      break;
    e = e.return;
  }
}
function Qn(e, t) {
  ((ci = e),
    (Vs = Bn = null),
    (e = e.dependencies),
    e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && (be = !0), (e.firstContext = null)));
}
function tt(e) {
  var t = e._currentValue;
  if (Vs !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), Bn === null)) {
      if (ci === null) throw Error(R(308));
      ((Bn = e), (ci.dependencies = { lanes: 0, firstContext: e }));
    } else Bn = Bn.next = e;
  return t;
}
var cn = null;
function Ks(e) {
  cn === null ? (cn = [e]) : cn.push(e);
}
function Xf(e, t, n, r) {
  var o = t.interleaved;
  return (
    o === null ? ((n.next = n), Ks(t)) : ((n.next = o.next), (o.next = n)),
    (t.interleaved = n),
    Mt(e, r)
  );
}
function Mt(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
    ((e.childLanes |= t),
      (n = e.alternate),
      n !== null && (n.childLanes |= t),
      (n = e),
      (e = e.return));
  return n.tag === 3 ? n.stateNode : null;
}
var Ft = !1;
function Gs(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function qf(e, t) {
  ((e = e.updateQueue),
    t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      }));
}
function _t(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function Gt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), U & 2)) {
    var o = r.pending;
    return (
      o === null ? (t.next = t) : ((t.next = o.next), (o.next = t)),
      (r.pending = t),
      Mt(e, n)
    );
  }
  return (
    (o = r.interleaved),
    o === null ? ((t.next = t), Ks(r)) : ((t.next = o.next), (o.next = t)),
    (r.interleaved = t),
    Mt(e, n)
  );
}
function zo(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
  ) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), Is(e, n));
  }
}
function Ic(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && ((r = r.updateQueue), n === r)) {
    var o = null,
      i = null;
    if (((n = n.firstBaseUpdate), n !== null)) {
      do {
        var l = {
          eventTime: n.eventTime,
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: n.callback,
          next: null,
        };
        (i === null ? (o = i = l) : (i = i.next = l), (n = n.next));
      } while (n !== null);
      i === null ? (o = i = t) : (i = i.next = t);
    } else o = i = t;
    ((n = {
      baseState: r.baseState,
      firstBaseUpdate: o,
      lastBaseUpdate: i,
      shared: r.shared,
      effects: r.effects,
    }),
      (e.updateQueue = n));
    return;
  }
  ((e = n.lastBaseUpdate),
    e === null ? (n.firstBaseUpdate = t) : (e.next = t),
    (n.lastBaseUpdate = t));
}
function di(e, t, n, r) {
  var o = e.updateQueue;
  Ft = !1;
  var i = o.firstBaseUpdate,
    l = o.lastBaseUpdate,
    a = o.shared.pending;
  if (a !== null) {
    o.shared.pending = null;
    var s = a,
      u = s.next;
    ((s.next = null), l === null ? (i = u) : (l.next = u), (l = s));
    var f = e.alternate;
    f !== null &&
      ((f = f.updateQueue),
      (a = f.lastBaseUpdate),
      a !== l &&
        (a === null ? (f.firstBaseUpdate = u) : (a.next = u),
        (f.lastBaseUpdate = s)));
  }
  if (i !== null) {
    var m = o.baseState;
    ((l = 0), (f = u = s = null), (a = i));
    do {
      var y = a.lane,
        S = a.eventTime;
      if ((r & y) === y) {
        f !== null &&
          (f = f.next =
            {
              eventTime: S,
              lane: 0,
              tag: a.tag,
              payload: a.payload,
              callback: a.callback,
              next: null,
            });
        e: {
          var C = e,
            h = a;
          switch (((y = t), (S = n), h.tag)) {
            case 1:
              if (((C = h.payload), typeof C == 'function')) {
                m = C.call(S, m, y);
                break e;
              }
              m = C;
              break e;
            case 3:
              C.flags = (C.flags & -65537) | 128;
            case 0:
              if (
                ((C = h.payload),
                (y = typeof C == 'function' ? C.call(S, m, y) : C),
                y == null)
              )
                break e;
              m = ie({}, m, y);
              break e;
            case 2:
              Ft = !0;
          }
        }
        a.callback !== null &&
          a.lane !== 0 &&
          ((e.flags |= 64),
          (y = o.effects),
          y === null ? (o.effects = [a]) : y.push(a));
      } else
        ((S = {
          eventTime: S,
          lane: y,
          tag: a.tag,
          payload: a.payload,
          callback: a.callback,
          next: null,
        }),
          f === null ? ((u = f = S), (s = m)) : (f = f.next = S),
          (l |= y));
      if (((a = a.next), a === null)) {
        if (((a = o.shared.pending), a === null)) break;
        ((y = a),
          (a = y.next),
          (y.next = null),
          (o.lastBaseUpdate = y),
          (o.shared.pending = null));
      }
    } while (!0);
    if (
      (f === null && (s = m),
      (o.baseState = s),
      (o.firstBaseUpdate = u),
      (o.lastBaseUpdate = f),
      (t = o.shared.interleaved),
      t !== null)
    ) {
      o = t;
      do ((l |= o.lane), (o = o.next));
      while (o !== t);
    } else i === null && (o.shared.lanes = 0);
    ((yn |= l), (e.lanes = l), (e.memoizedState = m));
  }
}
function Oc(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        o = r.callback;
      if (o !== null) {
        if (((r.callback = null), (r = n), typeof o != 'function'))
          throw Error(R(191, o));
        o.call(r);
      }
    }
}
var lo = {},
  wt = tn(lo),
  Kr = tn(lo),
  Gr = tn(lo);
function dn(e) {
  if (e === lo) throw Error(R(174));
  return e;
}
function Qs(e, t) {
  switch ((X(Gr, t), X(Kr, e), X(wt, lo), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : ma(null, '');
      break;
    default:
      ((e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = ma(t, e)));
  }
  (ee(wt), X(wt, t));
}
function nr() {
  (ee(wt), ee(Kr), ee(Gr));
}
function Zf(e) {
  dn(Gr.current);
  var t = dn(wt.current),
    n = ma(t, e.type);
  t !== n && (X(Kr, e), X(wt, n));
}
function Ys(e) {
  Kr.current === e && (ee(wt), ee(Kr));
}
var re = tn(0);
function fi(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (
        n !== null &&
        ((n = n.dehydrated), n === null || n.data === '$?' || n.data === '$!')
      )
        return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      ((t.child.return = t), (t = t.child));
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    ((t.sibling.return = t.return), (t = t.sibling));
  }
  return null;
}
var Ul = [];
function Xs() {
  for (var e = 0; e < Ul.length; e++)
    Ul[e]._workInProgressVersionPrimary = null;
  Ul.length = 0;
}
var Bo = It.ReactCurrentDispatcher,
  Vl = It.ReactCurrentBatchConfig,
  hn = 0,
  oe = null,
  fe = null,
  me = null,
  pi = !1,
  Nr = !1,
  Qr = 0,
  Og = 0;
function xe() {
  throw Error(R(321));
}
function qs(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!ft(e[n], t[n])) return !1;
  return !0;
}
function Zs(e, t, n, r, o, i) {
  if (
    ((hn = i),
    (oe = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (Bo.current = e === null || e.memoizedState === null ? bg : Fg),
    (e = n(r, o)),
    Nr)
  ) {
    i = 0;
    do {
      if (((Nr = !1), (Qr = 0), 25 <= i)) throw Error(R(301));
      ((i += 1),
        (me = fe = null),
        (t.updateQueue = null),
        (Bo.current = $g),
        (e = n(r, o)));
    } while (Nr);
  }
  if (
    ((Bo.current = mi),
    (t = fe !== null && fe.next !== null),
    (hn = 0),
    (me = fe = oe = null),
    (pi = !1),
    t)
  )
    throw Error(R(300));
  return e;
}
function Js() {
  var e = Qr !== 0;
  return ((Qr = 0), e);
}
function ht() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return (me === null ? (oe.memoizedState = me = e) : (me = me.next = e), me);
}
function nt() {
  if (fe === null) {
    var e = oe.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = fe.next;
  var t = me === null ? oe.memoizedState : me.next;
  if (t !== null) ((me = t), (fe = e));
  else {
    if (e === null) throw Error(R(310));
    ((fe = e),
      (e = {
        memoizedState: fe.memoizedState,
        baseState: fe.baseState,
        baseQueue: fe.baseQueue,
        queue: fe.queue,
        next: null,
      }),
      me === null ? (oe.memoizedState = me = e) : (me = me.next = e));
  }
  return me;
}
function Yr(e, t) {
  return typeof t == 'function' ? t(e) : t;
}
function Hl(e) {
  var t = nt(),
    n = t.queue;
  if (n === null) throw Error(R(311));
  n.lastRenderedReducer = e;
  var r = fe,
    o = r.baseQueue,
    i = n.pending;
  if (i !== null) {
    if (o !== null) {
      var l = o.next;
      ((o.next = i.next), (i.next = l));
    }
    ((r.baseQueue = o = i), (n.pending = null));
  }
  if (o !== null) {
    ((i = o.next), (r = r.baseState));
    var a = (l = null),
      s = null,
      u = i;
    do {
      var f = u.lane;
      if ((hn & f) === f)
        (s !== null &&
          (s = s.next =
            {
              lane: 0,
              action: u.action,
              hasEagerState: u.hasEagerState,
              eagerState: u.eagerState,
              next: null,
            }),
          (r = u.hasEagerState ? u.eagerState : e(r, u.action)));
      else {
        var m = {
          lane: f,
          action: u.action,
          hasEagerState: u.hasEagerState,
          eagerState: u.eagerState,
          next: null,
        };
        (s === null ? ((a = s = m), (l = r)) : (s = s.next = m),
          (oe.lanes |= f),
          (yn |= f));
      }
      u = u.next;
    } while (u !== null && u !== i);
    (s === null ? (l = r) : (s.next = a),
      ft(r, t.memoizedState) || (be = !0),
      (t.memoizedState = r),
      (t.baseState = l),
      (t.baseQueue = s),
      (n.lastRenderedState = r));
  }
  if (((e = n.interleaved), e !== null)) {
    o = e;
    do ((i = o.lane), (oe.lanes |= i), (yn |= i), (o = o.next));
    while (o !== e);
  } else o === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Wl(e) {
  var t = nt(),
    n = t.queue;
  if (n === null) throw Error(R(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    o = n.pending,
    i = t.memoizedState;
  if (o !== null) {
    n.pending = null;
    var l = (o = o.next);
    do ((i = e(i, l.action)), (l = l.next));
    while (l !== o);
    (ft(i, t.memoizedState) || (be = !0),
      (t.memoizedState = i),
      t.baseQueue === null && (t.baseState = i),
      (n.lastRenderedState = i));
  }
  return [i, r];
}
function Jf() {}
function ep(e, t) {
  var n = oe,
    r = nt(),
    o = t(),
    i = !ft(r.memoizedState, o);
  if (
    (i && ((r.memoizedState = o), (be = !0)),
    (r = r.queue),
    eu(rp.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || i || (me !== null && me.memoizedState.tag & 1))
  ) {
    if (
      ((n.flags |= 2048),
      Xr(9, np.bind(null, n, r, o, t), void 0, null),
      ve === null)
    )
      throw Error(R(349));
    hn & 30 || tp(n, t, o);
  }
  return o;
}
function tp(e, t, n) {
  ((e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = oe.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (oe.updateQueue = t),
        (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
}
function np(e, t, n, r) {
  ((t.value = n), (t.getSnapshot = r), op(t) && ip(e));
}
function rp(e, t, n) {
  return n(function () {
    op(t) && ip(e);
  });
}
function op(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !ft(e, n);
  } catch {
    return !0;
  }
}
function ip(e) {
  var t = Mt(e, 1);
  t !== null && dt(t, e, 1, -1);
}
function Dc(e) {
  var t = ht();
  return (
    typeof e == 'function' && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Yr,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = Lg.bind(null, oe, e)),
    [t.memoizedState, e]
  );
}
function Xr(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = oe.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (oe.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function lp() {
  return nt().memoizedState;
}
function Uo(e, t, n, r) {
  var o = ht();
  ((oe.flags |= e),
    (o.memoizedState = Xr(1 | t, n, void 0, r === void 0 ? null : r)));
}
function Fi(e, t, n, r) {
  var o = nt();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (fe !== null) {
    var l = fe.memoizedState;
    if (((i = l.destroy), r !== null && qs(r, l.deps))) {
      o.memoizedState = Xr(t, n, i, r);
      return;
    }
  }
  ((oe.flags |= e), (o.memoizedState = Xr(1 | t, n, i, r)));
}
function jc(e, t) {
  return Uo(8390656, 8, e, t);
}
function eu(e, t) {
  return Fi(2048, 8, e, t);
}
function ap(e, t) {
  return Fi(4, 2, e, t);
}
function sp(e, t) {
  return Fi(4, 4, e, t);
}
function up(e, t) {
  if (typeof t == 'function')
    return (
      (e = e()),
      t(e),
      function () {
        t(null);
      }
    );
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function cp(e, t, n) {
  return (
    (n = n != null ? n.concat([e]) : null),
    Fi(4, 4, up.bind(null, t, e), n)
  );
}
function tu() {}
function dp(e, t) {
  var n = nt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && qs(t, r[1])
    ? r[0]
    : ((n.memoizedState = [e, t]), e);
}
function fp(e, t) {
  var n = nt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && qs(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function pp(e, t, n) {
  return hn & 21
    ? (ft(n, t) || ((n = gf()), (oe.lanes |= n), (yn |= n), (e.baseState = !0)),
      t)
    : (e.baseState && ((e.baseState = !1), (be = !0)), (e.memoizedState = n));
}
function Dg(e, t) {
  var n = W;
  ((W = n !== 0 && 4 > n ? n : 4), e(!0));
  var r = Vl.transition;
  Vl.transition = {};
  try {
    (e(!1), t());
  } finally {
    ((W = n), (Vl.transition = r));
  }
}
function mp() {
  return nt().memoizedState;
}
function jg(e, t, n) {
  var r = Yt(e);
  if (
    ((n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    vp(e))
  )
    hp(t, n);
  else if (((n = Xf(e, t, n, r)), n !== null)) {
    var o = Ne();
    (dt(n, e, r, o), yp(n, t, r));
  }
}
function Lg(e, t, n) {
  var r = Yt(e),
    o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (vp(e)) hp(t, o);
  else {
    var i = e.alternate;
    if (
      e.lanes === 0 &&
      (i === null || i.lanes === 0) &&
      ((i = t.lastRenderedReducer), i !== null)
    )
      try {
        var l = t.lastRenderedState,
          a = i(l, n);
        if (((o.hasEagerState = !0), (o.eagerState = a), ft(a, l))) {
          var s = t.interleaved;
          (s === null
            ? ((o.next = o), Ks(t))
            : ((o.next = s.next), (s.next = o)),
            (t.interleaved = o));
          return;
        }
      } catch {
      } finally {
      }
    ((n = Xf(e, t, o, r)),
      n !== null && ((o = Ne()), dt(n, e, r, o), yp(n, t, r)));
  }
}
function vp(e) {
  var t = e.alternate;
  return e === oe || (t !== null && t === oe);
}
function hp(e, t) {
  Nr = pi = !0;
  var n = e.pending;
  (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t));
}
function yp(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), Is(e, n));
  }
}
var mi = {
    readContext: tt,
    useCallback: xe,
    useContext: xe,
    useEffect: xe,
    useImperativeHandle: xe,
    useInsertionEffect: xe,
    useLayoutEffect: xe,
    useMemo: xe,
    useReducer: xe,
    useRef: xe,
    useState: xe,
    useDebugValue: xe,
    useDeferredValue: xe,
    useTransition: xe,
    useMutableSource: xe,
    useSyncExternalStore: xe,
    useId: xe,
    unstable_isNewReconciler: !1,
  },
  bg = {
    readContext: tt,
    useCallback: function (e, t) {
      return ((ht().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: tt,
    useEffect: jc,
    useImperativeHandle: function (e, t, n) {
      return (
        (n = n != null ? n.concat([e]) : null),
        Uo(4194308, 4, up.bind(null, t, e), n)
      );
    },
    useLayoutEffect: function (e, t) {
      return Uo(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return Uo(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = ht();
      return (
        (t = t === void 0 ? null : t),
        (e = e()),
        (n.memoizedState = [e, t]),
        e
      );
    },
    useReducer: function (e, t, n) {
      var r = ht();
      return (
        (t = n !== void 0 ? n(t) : t),
        (r.memoizedState = r.baseState = t),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t,
        }),
        (r.queue = e),
        (e = e.dispatch = jg.bind(null, oe, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = ht();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: Dc,
    useDebugValue: tu,
    useDeferredValue: function (e) {
      return (ht().memoizedState = e);
    },
    useTransition: function () {
      var e = Dc(!1),
        t = e[0];
      return ((e = Dg.bind(null, e[1])), (ht().memoizedState = e), [t, e]);
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = oe,
        o = ht();
      if (ne) {
        if (n === void 0) throw Error(R(407));
        n = n();
      } else {
        if (((n = t()), ve === null)) throw Error(R(349));
        hn & 30 || tp(r, t, n);
      }
      o.memoizedState = n;
      var i = { value: n, getSnapshot: t };
      return (
        (o.queue = i),
        jc(rp.bind(null, r, i, e), [e]),
        (r.flags |= 2048),
        Xr(9, np.bind(null, r, i, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = ht(),
        t = ve.identifierPrefix;
      if (ne) {
        var n = Pt,
          r = kt;
        ((n = (r & ~(1 << (32 - ct(r) - 1))).toString(32) + n),
          (t = ':' + t + 'R' + n),
          (n = Qr++),
          0 < n && (t += 'H' + n.toString(32)),
          (t += ':'));
      } else ((n = Og++), (t = ':' + t + 'r' + n.toString(32) + ':'));
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  Fg = {
    readContext: tt,
    useCallback: dp,
    useContext: tt,
    useEffect: eu,
    useImperativeHandle: cp,
    useInsertionEffect: ap,
    useLayoutEffect: sp,
    useMemo: fp,
    useReducer: Hl,
    useRef: lp,
    useState: function () {
      return Hl(Yr);
    },
    useDebugValue: tu,
    useDeferredValue: function (e) {
      var t = nt();
      return pp(t, fe.memoizedState, e);
    },
    useTransition: function () {
      var e = Hl(Yr)[0],
        t = nt().memoizedState;
      return [e, t];
    },
    useMutableSource: Jf,
    useSyncExternalStore: ep,
    useId: mp,
    unstable_isNewReconciler: !1,
  },
  $g = {
    readContext: tt,
    useCallback: dp,
    useContext: tt,
    useEffect: eu,
    useImperativeHandle: cp,
    useInsertionEffect: ap,
    useLayoutEffect: sp,
    useMemo: fp,
    useReducer: Wl,
    useRef: lp,
    useState: function () {
      return Wl(Yr);
    },
    useDebugValue: tu,
    useDeferredValue: function (e) {
      var t = nt();
      return fe === null ? (t.memoizedState = e) : pp(t, fe.memoizedState, e);
    },
    useTransition: function () {
      var e = Wl(Yr)[0],
        t = nt().memoizedState;
      return [e, t];
    },
    useMutableSource: Jf,
    useSyncExternalStore: ep,
    useId: mp,
    unstable_isNewReconciler: !1,
  };
function at(e, t) {
  if (e && e.defaultProps) {
    ((t = ie({}, t)), (e = e.defaultProps));
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function ja(e, t, n, r) {
  ((t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : ie({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n));
}
var $i = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? kn(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ne(),
      o = Yt(e),
      i = _t(r, o);
    ((i.payload = t),
      n != null && (i.callback = n),
      (t = Gt(e, i, o)),
      t !== null && (dt(t, e, o, r), zo(t, e, o)));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ne(),
      o = Yt(e),
      i = _t(r, o);
    ((i.tag = 1),
      (i.payload = t),
      n != null && (i.callback = n),
      (t = Gt(e, i, o)),
      t !== null && (dt(t, e, o, r), zo(t, e, o)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = Ne(),
      r = Yt(e),
      o = _t(n, r);
    ((o.tag = 2),
      t != null && (o.callback = t),
      (t = Gt(e, o, r)),
      t !== null && (dt(t, e, r, n), zo(t, e, r)));
  },
};
function Lc(e, t, n, r, o, i, l) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == 'function'
      ? e.shouldComponentUpdate(r, i, l)
      : t.prototype && t.prototype.isPureReactComponent
        ? !Ur(n, r) || !Ur(o, i)
        : !0
  );
}
function gp(e, t, n) {
  var r = !1,
    o = Jt,
    i = t.contextType;
  return (
    typeof i == 'object' && i !== null
      ? (i = tt(i))
      : ((o = $e(t) ? mn : Pe.current),
        (r = t.contextTypes),
        (i = (r = r != null) ? Jn(e, o) : Jt)),
    (t = new t(n, i)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = $i),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = o),
      (e.__reactInternalMemoizedMaskedChildContext = i)),
    t
  );
}
function bc(e, t, n, r) {
  ((e = t.state),
    typeof t.componentWillReceiveProps == 'function' &&
      t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == 'function' &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && $i.enqueueReplaceState(t, t.state, null));
}
function La(e, t, n, r) {
  var o = e.stateNode;
  ((o.props = n), (o.state = e.memoizedState), (o.refs = {}), Gs(e));
  var i = t.contextType;
  (typeof i == 'object' && i !== null
    ? (o.context = tt(i))
    : ((i = $e(t) ? mn : Pe.current), (o.context = Jn(e, i))),
    (o.state = e.memoizedState),
    (i = t.getDerivedStateFromProps),
    typeof i == 'function' && (ja(e, t, i, n), (o.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == 'function' ||
      typeof o.getSnapshotBeforeUpdate == 'function' ||
      (typeof o.UNSAFE_componentWillMount != 'function' &&
        typeof o.componentWillMount != 'function') ||
      ((t = o.state),
      typeof o.componentWillMount == 'function' && o.componentWillMount(),
      typeof o.UNSAFE_componentWillMount == 'function' &&
        o.UNSAFE_componentWillMount(),
      t !== o.state && $i.enqueueReplaceState(o, o.state, null),
      di(e, n, o, r),
      (o.state = e.memoizedState)),
    typeof o.componentDidMount == 'function' && (e.flags |= 4194308));
}
function rr(e, t) {
  try {
    var n = '',
      r = t;
    do ((n += py(r)), (r = r.return));
    while (r);
    var o = n;
  } catch (i) {
    o =
      `
Error generating stack: ` +
      i.message +
      `
` +
      i.stack;
  }
  return { value: e, source: t, stack: o, digest: null };
}
function Kl(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function ba(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var zg = typeof WeakMap == 'function' ? WeakMap : Map;
function wp(e, t, n) {
  ((n = _t(-1, n)), (n.tag = 3), (n.payload = { element: null }));
  var r = t.value;
  return (
    (n.callback = function () {
      (hi || ((hi = !0), (Ga = r)), ba(e, t));
    }),
    n
  );
}
function Sp(e, t, n) {
  ((n = _t(-1, n)), (n.tag = 3));
  var r = e.type.getDerivedStateFromError;
  if (typeof r == 'function') {
    var o = t.value;
    ((n.payload = function () {
      return r(o);
    }),
      (n.callback = function () {
        ba(e, t);
      }));
  }
  var i = e.stateNode;
  return (
    i !== null &&
      typeof i.componentDidCatch == 'function' &&
      (n.callback = function () {
        (ba(e, t),
          typeof r != 'function' &&
            (Qt === null ? (Qt = new Set([this])) : Qt.add(this)));
        var l = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: l !== null ? l : '',
        });
      }),
    n
  );
}
function Fc(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new zg();
    var o = new Set();
    r.set(t, o);
  } else ((o = r.get(t)), o === void 0 && ((o = new Set()), r.set(t, o)));
  o.has(n) || (o.add(n), (e = e0.bind(null, e, t, n)), t.then(e, e));
}
function $c(e) {
  do {
    var t;
    if (
      ((t = e.tag === 13) &&
        ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)),
      t)
    )
      return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function zc(e, t, n, r, o) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = o), e)
    : (e === t
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (n.flags |= 131072),
          (n.flags &= -52805),
          n.tag === 1 &&
            (n.alternate === null
              ? (n.tag = 17)
              : ((t = _t(-1, 1)), (t.tag = 2), Gt(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var Bg = It.ReactCurrentOwner,
  be = !1;
function Me(e, t, n, r) {
  t.child = e === null ? Yf(t, null, n, r) : tr(t, e.child, n, r);
}
function Bc(e, t, n, r, o) {
  n = n.render;
  var i = t.ref;
  return (
    Qn(t, o),
    (r = Zs(e, t, n, r, i, o)),
    (n = Js()),
    e !== null && !be
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        Nt(e, t, o))
      : (ne && n && zs(t), (t.flags |= 1), Me(e, t, r, o), t.child)
  );
}
function Uc(e, t, n, r, o) {
  if (e === null) {
    var i = n.type;
    return typeof i == 'function' &&
      !uu(i) &&
      i.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = i), xp(e, t, i, r, o))
      : ((e = Ko(n.type, null, r, t, t.mode, o)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((i = e.child), !(e.lanes & o))) {
    var l = i.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : Ur), n(l, r) && e.ref === t.ref)
    )
      return Nt(e, t, o);
  }
  return (
    (t.flags |= 1),
    (e = Xt(i, r)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function xp(e, t, n, r, o) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (Ur(i, r) && e.ref === t.ref)
      if (((be = !1), (t.pendingProps = r = i), (e.lanes & o) !== 0))
        e.flags & 131072 && (be = !0);
      else return ((t.lanes = e.lanes), Nt(e, t, o));
  }
  return Fa(e, t, n, r, o);
}
function Cp(e, t, n) {
  var r = t.pendingProps,
    o = r.children,
    i = e !== null ? e.memoizedState : null;
  if (r.mode === 'hidden')
    if (!(t.mode & 1))
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        X(Vn, Ve),
        (Ve |= n));
    else {
      if (!(n & 1073741824))
        return (
          (e = i !== null ? i.baseLanes | n : n),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = {
            baseLanes: e,
            cachePool: null,
            transitions: null,
          }),
          (t.updateQueue = null),
          X(Vn, Ve),
          (Ve |= e),
          null
        );
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = i !== null ? i.baseLanes : n),
        X(Vn, Ve),
        (Ve |= r));
    }
  else
    (i !== null ? ((r = i.baseLanes | n), (t.memoizedState = null)) : (r = n),
      X(Vn, Ve),
      (Ve |= r));
  return (Me(e, t, o, n), t.child);
}
function Ep(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function Fa(e, t, n, r, o) {
  var i = $e(n) ? mn : Pe.current;
  return (
    (i = Jn(t, i)),
    Qn(t, o),
    (n = Zs(e, t, n, r, i, o)),
    (r = Js()),
    e !== null && !be
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        Nt(e, t, o))
      : (ne && r && zs(t), (t.flags |= 1), Me(e, t, n, o), t.child)
  );
}
function Vc(e, t, n, r, o) {
  if ($e(n)) {
    var i = !0;
    li(t);
  } else i = !1;
  if ((Qn(t, o), t.stateNode === null))
    (Vo(e, t), gp(t, n, r), La(t, n, r, o), (r = !0));
  else if (e === null) {
    var l = t.stateNode,
      a = t.memoizedProps;
    l.props = a;
    var s = l.context,
      u = n.contextType;
    typeof u == 'object' && u !== null
      ? (u = tt(u))
      : ((u = $e(n) ? mn : Pe.current), (u = Jn(t, u)));
    var f = n.getDerivedStateFromProps,
      m =
        typeof f == 'function' ||
        typeof l.getSnapshotBeforeUpdate == 'function';
    (m ||
      (typeof l.UNSAFE_componentWillReceiveProps != 'function' &&
        typeof l.componentWillReceiveProps != 'function') ||
      ((a !== r || s !== u) && bc(t, l, r, u)),
      (Ft = !1));
    var y = t.memoizedState;
    ((l.state = y),
      di(t, r, l, o),
      (s = t.memoizedState),
      a !== r || y !== s || Fe.current || Ft
        ? (typeof f == 'function' && (ja(t, n, f, r), (s = t.memoizedState)),
          (a = Ft || Lc(t, n, a, r, y, s, u))
            ? (m ||
                (typeof l.UNSAFE_componentWillMount != 'function' &&
                  typeof l.componentWillMount != 'function') ||
                (typeof l.componentWillMount == 'function' &&
                  l.componentWillMount(),
                typeof l.UNSAFE_componentWillMount == 'function' &&
                  l.UNSAFE_componentWillMount()),
              typeof l.componentDidMount == 'function' && (t.flags |= 4194308))
            : (typeof l.componentDidMount == 'function' && (t.flags |= 4194308),
              (t.memoizedProps = r),
              (t.memoizedState = s)),
          (l.props = r),
          (l.state = s),
          (l.context = u),
          (r = a))
        : (typeof l.componentDidMount == 'function' && (t.flags |= 4194308),
          (r = !1)));
  } else {
    ((l = t.stateNode),
      qf(e, t),
      (a = t.memoizedProps),
      (u = t.type === t.elementType ? a : at(t.type, a)),
      (l.props = u),
      (m = t.pendingProps),
      (y = l.context),
      (s = n.contextType),
      typeof s == 'object' && s !== null
        ? (s = tt(s))
        : ((s = $e(n) ? mn : Pe.current), (s = Jn(t, s))));
    var S = n.getDerivedStateFromProps;
    ((f =
      typeof S == 'function' ||
      typeof l.getSnapshotBeforeUpdate == 'function') ||
      (typeof l.UNSAFE_componentWillReceiveProps != 'function' &&
        typeof l.componentWillReceiveProps != 'function') ||
      ((a !== m || y !== s) && bc(t, l, r, s)),
      (Ft = !1),
      (y = t.memoizedState),
      (l.state = y),
      di(t, r, l, o));
    var C = t.memoizedState;
    a !== m || y !== C || Fe.current || Ft
      ? (typeof S == 'function' && (ja(t, n, S, r), (C = t.memoizedState)),
        (u = Ft || Lc(t, n, u, r, y, C, s) || !1)
          ? (f ||
              (typeof l.UNSAFE_componentWillUpdate != 'function' &&
                typeof l.componentWillUpdate != 'function') ||
              (typeof l.componentWillUpdate == 'function' &&
                l.componentWillUpdate(r, C, s),
              typeof l.UNSAFE_componentWillUpdate == 'function' &&
                l.UNSAFE_componentWillUpdate(r, C, s)),
            typeof l.componentDidUpdate == 'function' && (t.flags |= 4),
            typeof l.getSnapshotBeforeUpdate == 'function' && (t.flags |= 1024))
          : (typeof l.componentDidUpdate != 'function' ||
              (a === e.memoizedProps && y === e.memoizedState) ||
              (t.flags |= 4),
            typeof l.getSnapshotBeforeUpdate != 'function' ||
              (a === e.memoizedProps && y === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = C)),
        (l.props = r),
        (l.state = C),
        (l.context = s),
        (r = u))
      : (typeof l.componentDidUpdate != 'function' ||
          (a === e.memoizedProps && y === e.memoizedState) ||
          (t.flags |= 4),
        typeof l.getSnapshotBeforeUpdate != 'function' ||
          (a === e.memoizedProps && y === e.memoizedState) ||
          (t.flags |= 1024),
        (r = !1));
  }
  return $a(e, t, n, r, i, o);
}
function $a(e, t, n, r, o, i) {
  Ep(e, t);
  var l = (t.flags & 128) !== 0;
  if (!r && !l) return (o && Tc(t, n, !1), Nt(e, t, i));
  ((r = t.stateNode), (Bg.current = t));
  var a =
    l && typeof n.getDerivedStateFromError != 'function' ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && l
      ? ((t.child = tr(t, e.child, null, i)), (t.child = tr(t, null, a, i)))
      : Me(e, t, a, i),
    (t.memoizedState = r.state),
    o && Tc(t, n, !0),
    t.child
  );
}
function kp(e) {
  var t = e.stateNode;
  (t.pendingContext
    ? Rc(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && Rc(e, t.context, !1),
    Qs(e, t.containerInfo));
}
function Hc(e, t, n, r, o) {
  return (er(), Us(o), (t.flags |= 256), Me(e, t, n, r), t.child);
}
var za = { dehydrated: null, treeContext: null, retryLane: 0 };
function Ba(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Pp(e, t, n) {
  var r = t.pendingProps,
    o = re.current,
    i = !1,
    l = (t.flags & 128) !== 0,
    a;
  if (
    ((a = l) ||
      (a = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
    a
      ? ((i = !0), (t.flags &= -129))
      : (e === null || e.memoizedState !== null) && (o |= 1),
    X(re, o & 1),
    e === null)
  )
    return (
      Oa(t),
      (e = t.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (t.mode & 1
            ? e.data === '$!'
              ? (t.lanes = 8)
              : (t.lanes = 1073741824)
            : (t.lanes = 1),
          null)
        : ((l = r.children),
          (e = r.fallback),
          i
            ? ((r = t.mode),
              (i = t.child),
              (l = { mode: 'hidden', children: l }),
              !(r & 1) && i !== null
                ? ((i.childLanes = 0), (i.pendingProps = l))
                : (i = Ui(l, r, 0, null)),
              (e = pn(e, r, n, null)),
              (i.return = t),
              (e.return = t),
              (i.sibling = e),
              (t.child = i),
              (t.child.memoizedState = Ba(n)),
              (t.memoizedState = za),
              e)
            : nu(t, l))
    );
  if (((o = e.memoizedState), o !== null && ((a = o.dehydrated), a !== null)))
    return Ug(e, t, l, r, a, o, n);
  if (i) {
    ((i = r.fallback), (l = t.mode), (o = e.child), (a = o.sibling));
    var s = { mode: 'hidden', children: r.children };
    return (
      !(l & 1) && t.child !== o
        ? ((r = t.child),
          (r.childLanes = 0),
          (r.pendingProps = s),
          (t.deletions = null))
        : ((r = Xt(o, s)), (r.subtreeFlags = o.subtreeFlags & 14680064)),
      a !== null ? (i = Xt(a, i)) : ((i = pn(i, l, n, null)), (i.flags |= 2)),
      (i.return = t),
      (r.return = t),
      (r.sibling = i),
      (t.child = r),
      (r = i),
      (i = t.child),
      (l = e.child.memoizedState),
      (l =
        l === null
          ? Ba(n)
          : {
              baseLanes: l.baseLanes | n,
              cachePool: null,
              transitions: l.transitions,
            }),
      (i.memoizedState = l),
      (i.childLanes = e.childLanes & ~n),
      (t.memoizedState = za),
      r
    );
  }
  return (
    (i = e.child),
    (e = i.sibling),
    (r = Xt(i, { mode: 'visible', children: r.children })),
    !(t.mode & 1) && (r.lanes = n),
    (r.return = t),
    (r.sibling = null),
    e !== null &&
      ((n = t.deletions),
      n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
    (t.child = r),
    (t.memoizedState = null),
    r
  );
}
function nu(e, t) {
  return (
    (t = Ui({ mode: 'visible', children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function Ro(e, t, n, r) {
  return (
    r !== null && Us(r),
    tr(t, e.child, null, n),
    (e = nu(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function Ug(e, t, n, r, o, i, l) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = Kl(Error(R(422)))), Ro(e, t, l, r))
      : t.memoizedState !== null
        ? ((t.child = e.child), (t.flags |= 128), null)
        : ((i = r.fallback),
          (o = t.mode),
          (r = Ui({ mode: 'visible', children: r.children }, o, 0, null)),
          (i = pn(i, o, l, null)),
          (i.flags |= 2),
          (r.return = t),
          (i.return = t),
          (r.sibling = i),
          (t.child = r),
          t.mode & 1 && tr(t, e.child, null, l),
          (t.child.memoizedState = Ba(l)),
          (t.memoizedState = za),
          i);
  if (!(t.mode & 1)) return Ro(e, t, l, null);
  if (o.data === '$!') {
    if (((r = o.nextSibling && o.nextSibling.dataset), r)) var a = r.dgst;
    return (
      (r = a),
      (i = Error(R(419))),
      (r = Kl(i, r, void 0)),
      Ro(e, t, l, r)
    );
  }
  if (((a = (l & e.childLanes) !== 0), be || a)) {
    if (((r = ve), r !== null)) {
      switch (l & -l) {
        case 4:
          o = 2;
          break;
        case 16:
          o = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          o = 32;
          break;
        case 536870912:
          o = 268435456;
          break;
        default:
          o = 0;
      }
      ((o = o & (r.suspendedLanes | l) ? 0 : o),
        o !== 0 &&
          o !== i.retryLane &&
          ((i.retryLane = o), Mt(e, o), dt(r, e, o, -1)));
    }
    return (su(), (r = Kl(Error(R(421)))), Ro(e, t, l, r));
  }
  return o.data === '$?'
    ? ((t.flags |= 128),
      (t.child = e.child),
      (t = t0.bind(null, e)),
      (o._reactRetry = t),
      null)
    : ((e = i.treeContext),
      (He = Kt(o.nextSibling)),
      (We = t),
      (ne = !0),
      (ut = null),
      e !== null &&
        ((Xe[qe++] = kt),
        (Xe[qe++] = Pt),
        (Xe[qe++] = vn),
        (kt = e.id),
        (Pt = e.overflow),
        (vn = t)),
      (t = nu(t, r.children)),
      (t.flags |= 4096),
      t);
}
function Wc(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  (r !== null && (r.lanes |= t), Da(e.return, t, n));
}
function Gl(e, t, n, r, o) {
  var i = e.memoizedState;
  i === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: n,
        tailMode: o,
      })
    : ((i.isBackwards = t),
      (i.rendering = null),
      (i.renderingStartTime = 0),
      (i.last = r),
      (i.tail = n),
      (i.tailMode = o));
}
function _p(e, t, n) {
  var r = t.pendingProps,
    o = r.revealOrder,
    i = r.tail;
  if ((Me(e, t, r.children, n), (r = re.current), r & 2))
    ((r = (r & 1) | 2), (t.flags |= 128));
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Wc(e, n, t);
        else if (e.tag === 19) Wc(e, n, t);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    r &= 1;
  }
  if ((X(re, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (o) {
      case 'forwards':
        for (n = t.child, o = null; n !== null; )
          ((e = n.alternate),
            e !== null && fi(e) === null && (o = n),
            (n = n.sibling));
        ((n = o),
          n === null
            ? ((o = t.child), (t.child = null))
            : ((o = n.sibling), (n.sibling = null)),
          Gl(t, !1, o, n, i));
        break;
      case 'backwards':
        for (n = null, o = t.child, t.child = null; o !== null; ) {
          if (((e = o.alternate), e !== null && fi(e) === null)) {
            t.child = o;
            break;
          }
          ((e = o.sibling), (o.sibling = n), (n = o), (o = e));
        }
        Gl(t, !0, n, null, i);
        break;
      case 'together':
        Gl(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function Vo(e, t) {
  !(t.mode & 1) &&
    e !== null &&
    ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function Nt(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (yn |= t.lanes),
    !(n & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(R(153));
  if (t.child !== null) {
    for (
      e = t.child, n = Xt(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;

    )
      ((e = e.sibling),
        (n = n.sibling = Xt(e, e.pendingProps)),
        (n.return = t));
    n.sibling = null;
  }
  return t.child;
}
function Vg(e, t, n) {
  switch (t.tag) {
    case 3:
      (kp(t), er());
      break;
    case 5:
      Zf(t);
      break;
    case 1:
      $e(t.type) && li(t);
      break;
    case 4:
      Qs(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        o = t.memoizedProps.value;
      (X(ui, r._currentValue), (r._currentValue = o));
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (X(re, re.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
            ? Pp(e, t, n)
            : (X(re, re.current & 1),
              (e = Nt(e, t, n)),
              e !== null ? e.sibling : null);
      X(re, re.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return _p(e, t, n);
        t.flags |= 128;
      }
      if (
        ((o = t.memoizedState),
        o !== null &&
          ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
        X(re, re.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return ((t.lanes = 0), Cp(e, t, n));
  }
  return Nt(e, t, n);
}
var Rp, Ua, Tp, Mp;
Rp = function (e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      ((n.child.return = n), (n = n.child));
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    ((n.sibling.return = n.return), (n = n.sibling));
  }
};
Ua = function () {};
Tp = function (e, t, n, r) {
  var o = e.memoizedProps;
  if (o !== r) {
    ((e = t.stateNode), dn(wt.current));
    var i = null;
    switch (n) {
      case 'input':
        ((o = ca(e, o)), (r = ca(e, r)), (i = []));
        break;
      case 'select':
        ((o = ie({}, o, { value: void 0 })),
          (r = ie({}, r, { value: void 0 })),
          (i = []));
        break;
      case 'textarea':
        ((o = pa(e, o)), (r = pa(e, r)), (i = []));
        break;
      default:
        typeof o.onClick != 'function' &&
          typeof r.onClick == 'function' &&
          (e.onclick = oi);
    }
    va(n, r);
    var l;
    n = null;
    for (u in o)
      if (!r.hasOwnProperty(u) && o.hasOwnProperty(u) && o[u] != null)
        if (u === 'style') {
          var a = o[u];
          for (l in a) a.hasOwnProperty(l) && (n || (n = {}), (n[l] = ''));
        } else
          u !== 'dangerouslySetInnerHTML' &&
            u !== 'children' &&
            u !== 'suppressContentEditableWarning' &&
            u !== 'suppressHydrationWarning' &&
            u !== 'autoFocus' &&
            (jr.hasOwnProperty(u)
              ? i || (i = [])
              : (i = i || []).push(u, null));
    for (u in r) {
      var s = r[u];
      if (
        ((a = o?.[u]),
        r.hasOwnProperty(u) && s !== a && (s != null || a != null))
      )
        if (u === 'style')
          if (a) {
            for (l in a)
              !a.hasOwnProperty(l) ||
                (s && s.hasOwnProperty(l)) ||
                (n || (n = {}), (n[l] = ''));
            for (l in s)
              s.hasOwnProperty(l) &&
                a[l] !== s[l] &&
                (n || (n = {}), (n[l] = s[l]));
          } else (n || (i || (i = []), i.push(u, n)), (n = s));
        else
          u === 'dangerouslySetInnerHTML'
            ? ((s = s ? s.__html : void 0),
              (a = a ? a.__html : void 0),
              s != null && a !== s && (i = i || []).push(u, s))
            : u === 'children'
              ? (typeof s != 'string' && typeof s != 'number') ||
                (i = i || []).push(u, '' + s)
              : u !== 'suppressContentEditableWarning' &&
                u !== 'suppressHydrationWarning' &&
                (jr.hasOwnProperty(u)
                  ? (s != null && u === 'onScroll' && J('scroll', e),
                    i || a === s || (i = []))
                  : (i = i || []).push(u, s));
    }
    n && (i = i || []).push('style', n);
    var u = i;
    (t.updateQueue = u) && (t.flags |= 4);
  }
};
Mp = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function hr(e, t) {
  if (!ne)
    switch (e.tailMode) {
      case 'hidden':
        t = e.tail;
        for (var n = null; t !== null; )
          (t.alternate !== null && (n = t), (t = t.sibling));
        n === null ? (e.tail = null) : (n.sibling = null);
        break;
      case 'collapsed':
        n = e.tail;
        for (var r = null; n !== null; )
          (n.alternate !== null && (r = n), (n = n.sibling));
        r === null
          ? t || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (r.sibling = null);
    }
}
function Ce(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t)
    for (var o = e.child; o !== null; )
      ((n |= o.lanes | o.childLanes),
        (r |= o.subtreeFlags & 14680064),
        (r |= o.flags & 14680064),
        (o.return = e),
        (o = o.sibling));
  else
    for (o = e.child; o !== null; )
      ((n |= o.lanes | o.childLanes),
        (r |= o.subtreeFlags),
        (r |= o.flags),
        (o.return = e),
        (o = o.sibling));
  return ((e.subtreeFlags |= r), (e.childLanes = n), t);
}
function Hg(e, t, n) {
  var r = t.pendingProps;
  switch ((Bs(t), t.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return (Ce(t), null);
    case 1:
      return ($e(t.type) && ii(), Ce(t), null);
    case 3:
      return (
        (r = t.stateNode),
        nr(),
        ee(Fe),
        ee(Pe),
        Xs(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (Po(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), ut !== null && (Xa(ut), (ut = null)))),
        Ua(e, t),
        Ce(t),
        null
      );
    case 5:
      Ys(t);
      var o = dn(Gr.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        (Tp(e, t, n, r, o),
          e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(R(166));
          return (Ce(t), null);
        }
        if (((e = dn(wt.current)), Po(t))) {
          ((r = t.stateNode), (n = t.type));
          var i = t.memoizedProps;
          switch (((r[yt] = t), (r[Wr] = i), (e = (t.mode & 1) !== 0), n)) {
            case 'dialog':
              (J('cancel', r), J('close', r));
              break;
            case 'iframe':
            case 'object':
            case 'embed':
              J('load', r);
              break;
            case 'video':
            case 'audio':
              for (o = 0; o < xr.length; o++) J(xr[o], r);
              break;
            case 'source':
              J('error', r);
              break;
            case 'img':
            case 'image':
            case 'link':
              (J('error', r), J('load', r));
              break;
            case 'details':
              J('toggle', r);
              break;
            case 'input':
              (ec(r, i), J('invalid', r));
              break;
            case 'select':
              ((r._wrapperState = { wasMultiple: !!i.multiple }),
                J('invalid', r));
              break;
            case 'textarea':
              (nc(r, i), J('invalid', r));
          }
          (va(n, i), (o = null));
          for (var l in i)
            if (i.hasOwnProperty(l)) {
              var a = i[l];
              l === 'children'
                ? typeof a == 'string'
                  ? r.textContent !== a &&
                    (i.suppressHydrationWarning !== !0 &&
                      ko(r.textContent, a, e),
                    (o = ['children', a]))
                  : typeof a == 'number' &&
                    r.textContent !== '' + a &&
                    (i.suppressHydrationWarning !== !0 &&
                      ko(r.textContent, a, e),
                    (o = ['children', '' + a]))
                : jr.hasOwnProperty(l) &&
                  a != null &&
                  l === 'onScroll' &&
                  J('scroll', r);
            }
          switch (n) {
            case 'input':
              (ho(r), tc(r, i, !0));
              break;
            case 'textarea':
              (ho(r), rc(r));
              break;
            case 'select':
            case 'option':
              break;
            default:
              typeof i.onClick == 'function' && (r.onclick = oi);
          }
          ((r = o), (t.updateQueue = r), r !== null && (t.flags |= 4));
        } else {
          ((l = o.nodeType === 9 ? o : o.ownerDocument),
            e === 'http://www.w3.org/1999/xhtml' && (e = nf(n)),
            e === 'http://www.w3.org/1999/xhtml'
              ? n === 'script'
                ? ((e = l.createElement('div')),
                  (e.innerHTML = '<script><\/script>'),
                  (e = e.removeChild(e.firstChild)))
                : typeof r.is == 'string'
                  ? (e = l.createElement(n, { is: r.is }))
                  : ((e = l.createElement(n)),
                    n === 'select' &&
                      ((l = e),
                      r.multiple
                        ? (l.multiple = !0)
                        : r.size && (l.size = r.size)))
              : (e = l.createElementNS(e, n)),
            (e[yt] = t),
            (e[Wr] = r),
            Rp(e, t, !1, !1),
            (t.stateNode = e));
          e: {
            switch (((l = ha(n, r)), n)) {
              case 'dialog':
                (J('cancel', e), J('close', e), (o = r));
                break;
              case 'iframe':
              case 'object':
              case 'embed':
                (J('load', e), (o = r));
                break;
              case 'video':
              case 'audio':
                for (o = 0; o < xr.length; o++) J(xr[o], e);
                o = r;
                break;
              case 'source':
                (J('error', e), (o = r));
                break;
              case 'img':
              case 'image':
              case 'link':
                (J('error', e), J('load', e), (o = r));
                break;
              case 'details':
                (J('toggle', e), (o = r));
                break;
              case 'input':
                (ec(e, r), (o = ca(e, r)), J('invalid', e));
                break;
              case 'option':
                o = r;
                break;
              case 'select':
                ((e._wrapperState = { wasMultiple: !!r.multiple }),
                  (o = ie({}, r, { value: void 0 })),
                  J('invalid', e));
                break;
              case 'textarea':
                (nc(e, r), (o = pa(e, r)), J('invalid', e));
                break;
              default:
                o = r;
            }
            (va(n, o), (a = o));
            for (i in a)
              if (a.hasOwnProperty(i)) {
                var s = a[i];
                i === 'style'
                  ? lf(e, s)
                  : i === 'dangerouslySetInnerHTML'
                    ? ((s = s ? s.__html : void 0), s != null && rf(e, s))
                    : i === 'children'
                      ? typeof s == 'string'
                        ? (n !== 'textarea' || s !== '') && Lr(e, s)
                        : typeof s == 'number' && Lr(e, '' + s)
                      : i !== 'suppressContentEditableWarning' &&
                        i !== 'suppressHydrationWarning' &&
                        i !== 'autoFocus' &&
                        (jr.hasOwnProperty(i)
                          ? s != null && i === 'onScroll' && J('scroll', e)
                          : s != null && _s(e, i, s, l));
              }
            switch (n) {
              case 'input':
                (ho(e), tc(e, r, !1));
                break;
              case 'textarea':
                (ho(e), rc(e));
                break;
              case 'option':
                r.value != null && e.setAttribute('value', '' + Zt(r.value));
                break;
              case 'select':
                ((e.multiple = !!r.multiple),
                  (i = r.value),
                  i != null
                    ? Hn(e, !!r.multiple, i, !1)
                    : r.defaultValue != null &&
                      Hn(e, !!r.multiple, r.defaultValue, !0));
                break;
              default:
                typeof o.onClick == 'function' && (e.onclick = oi);
            }
            switch (n) {
              case 'button':
              case 'input':
              case 'select':
              case 'textarea':
                r = !!r.autoFocus;
                break e;
              case 'img':
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
      }
      return (Ce(t), null);
    case 6:
      if (e && t.stateNode != null) Mp(e, t, e.memoizedProps, r);
      else {
        if (typeof r != 'string' && t.stateNode === null) throw Error(R(166));
        if (((n = dn(Gr.current)), dn(wt.current), Po(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[yt] = t),
            (i = r.nodeValue !== n) && ((e = We), e !== null))
          )
            switch (e.tag) {
              case 3:
                ko(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  ko(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          i && (t.flags |= 4);
        } else
          ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[yt] = t),
            (t.stateNode = r));
      }
      return (Ce(t), null);
    case 13:
      if (
        (ee(re),
        (r = t.memoizedState),
        e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (ne && He !== null && t.mode & 1 && !(t.flags & 128))
          (Gf(), er(), (t.flags |= 98560), (i = !1));
        else if (((i = Po(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!i) throw Error(R(318));
            if (
              ((i = t.memoizedState),
              (i = i !== null ? i.dehydrated : null),
              !i)
            )
              throw Error(R(317));
            i[yt] = t;
          } else
            (er(),
              !(t.flags & 128) && (t.memoizedState = null),
              (t.flags |= 4));
          (Ce(t), (i = !1));
        } else (ut !== null && (Xa(ut), (ut = null)), (i = !0));
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || re.current & 1 ? pe === 0 && (pe = 3) : su())),
          t.updateQueue !== null && (t.flags |= 4),
          Ce(t),
          null);
    case 4:
      return (
        nr(),
        Ua(e, t),
        e === null && Vr(t.stateNode.containerInfo),
        Ce(t),
        null
      );
    case 10:
      return (Ws(t.type._context), Ce(t), null);
    case 17:
      return ($e(t.type) && ii(), Ce(t), null);
    case 19:
      if ((ee(re), (i = t.memoizedState), i === null)) return (Ce(t), null);
      if (((r = (t.flags & 128) !== 0), (l = i.rendering), l === null))
        if (r) hr(i, !1);
        else {
          if (pe !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((l = fi(e)), l !== null)) {
                for (
                  t.flags |= 128,
                    hr(i, !1),
                    r = l.updateQueue,
                    r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                    t.subtreeFlags = 0,
                    r = n,
                    n = t.child;
                  n !== null;

                )
                  ((i = n),
                    (e = r),
                    (i.flags &= 14680066),
                    (l = i.alternate),
                    l === null
                      ? ((i.childLanes = 0),
                        (i.lanes = e),
                        (i.child = null),
                        (i.subtreeFlags = 0),
                        (i.memoizedProps = null),
                        (i.memoizedState = null),
                        (i.updateQueue = null),
                        (i.dependencies = null),
                        (i.stateNode = null))
                      : ((i.childLanes = l.childLanes),
                        (i.lanes = l.lanes),
                        (i.child = l.child),
                        (i.subtreeFlags = 0),
                        (i.deletions = null),
                        (i.memoizedProps = l.memoizedProps),
                        (i.memoizedState = l.memoizedState),
                        (i.updateQueue = l.updateQueue),
                        (i.type = l.type),
                        (e = l.dependencies),
                        (i.dependencies =
                          e === null
                            ? null
                            : {
                                lanes: e.lanes,
                                firstContext: e.firstContext,
                              })),
                    (n = n.sibling));
                return (X(re, (re.current & 1) | 2), t.child);
              }
              e = e.sibling;
            }
          i.tail !== null &&
            se() > or &&
            ((t.flags |= 128), (r = !0), hr(i, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = fi(l)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              hr(i, !0),
              i.tail === null && i.tailMode === 'hidden' && !l.alternate && !ne)
            )
              return (Ce(t), null);
          } else
            2 * se() - i.renderingStartTime > or &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), hr(i, !1), (t.lanes = 4194304));
        i.isBackwards
          ? ((l.sibling = t.child), (t.child = l))
          : ((n = i.last),
            n !== null ? (n.sibling = l) : (t.child = l),
            (i.last = l));
      }
      return i.tail !== null
        ? ((t = i.tail),
          (i.rendering = t),
          (i.tail = t.sibling),
          (i.renderingStartTime = se()),
          (t.sibling = null),
          (n = re.current),
          X(re, r ? (n & 1) | 2 : n & 1),
          t)
        : (Ce(t), null);
    case 22:
    case 23:
      return (
        au(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? Ve & 1073741824 && (Ce(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : Ce(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(R(156, t.tag));
}
function Wg(e, t) {
  switch ((Bs(t), t.tag)) {
    case 1:
      return (
        $e(t.type) && ii(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        nr(),
        ee(Fe),
        ee(Pe),
        Xs(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return (Ys(t), null);
    case 13:
      if (
        (ee(re), (e = t.memoizedState), e !== null && e.dehydrated !== null)
      ) {
        if (t.alternate === null) throw Error(R(340));
        er();
      }
      return (
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return (ee(re), null);
    case 4:
      return (nr(), null);
    case 10:
      return (Ws(t.type._context), null);
    case 22:
    case 23:
      return (au(), null);
    case 24:
      return null;
    default:
      return null;
  }
}
var To = !1,
  ke = !1,
  Kg = typeof WeakSet == 'function' ? WeakSet : Set,
  N = null;
function Un(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == 'function')
      try {
        n(null);
      } catch (r) {
        le(e, t, r);
      }
    else n.current = null;
}
function Va(e, t, n) {
  try {
    n();
  } catch (r) {
    le(e, t, r);
  }
}
var Kc = !1;
function Gg(e, t) {
  if (((_a = ti), (e = Df()), $s(e))) {
    if ('selectionStart' in e)
      var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var o = r.anchorOffset,
            i = r.focusNode;
          r = r.focusOffset;
          try {
            (n.nodeType, i.nodeType);
          } catch {
            n = null;
            break e;
          }
          var l = 0,
            a = -1,
            s = -1,
            u = 0,
            f = 0,
            m = e,
            y = null;
          t: for (;;) {
            for (
              var S;
              m !== n || (o !== 0 && m.nodeType !== 3) || (a = l + o),
                m !== i || (r !== 0 && m.nodeType !== 3) || (s = l + r),
                m.nodeType === 3 && (l += m.nodeValue.length),
                (S = m.firstChild) !== null;

            )
              ((y = m), (m = S));
            for (;;) {
              if (m === e) break t;
              if (
                (y === n && ++u === o && (a = l),
                y === i && ++f === r && (s = l),
                (S = m.nextSibling) !== null)
              )
                break;
              ((m = y), (y = m.parentNode));
            }
            m = S;
          }
          n = a === -1 || s === -1 ? null : { start: a, end: s };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Ra = { focusedElem: e, selectionRange: n }, ti = !1, N = t; N !== null; )
    if (((t = N), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), (N = e));
    else
      for (; N !== null; ) {
        t = N;
        try {
          var C = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (C !== null) {
                  var h = C.memoizedProps,
                    w = C.memoizedState,
                    p = t.stateNode,
                    d = p.getSnapshotBeforeUpdate(
                      t.elementType === t.type ? h : at(t.type, h),
                      w
                    );
                  p.__reactInternalSnapshotBeforeUpdate = d;
                }
                break;
              case 3:
                var v = t.stateNode.containerInfo;
                v.nodeType === 1
                  ? (v.textContent = '')
                  : v.nodeType === 9 &&
                    v.documentElement &&
                    v.removeChild(v.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(R(163));
            }
        } catch (x) {
          le(t, t.return, x);
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), (N = e));
          break;
        }
        N = t.return;
      }
  return ((C = Kc), (Kc = !1), C);
}
function Ar(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var o = (r = r.next);
    do {
      if ((o.tag & e) === e) {
        var i = o.destroy;
        ((o.destroy = void 0), i !== void 0 && Va(t, n, i));
      }
      o = o.next;
    } while (o !== r);
  }
}
function zi(e, t) {
  if (
    ((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)
  ) {
    var n = (t = t.next);
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function Ha(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == 'function' ? t(e) : (t.current = e);
  }
}
function Np(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), Np(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[yt], delete t[Wr], delete t[Na], delete t[Mg], delete t[Ng])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null));
}
function Ap(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Gc(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || Ap(e.return)) return null;
      e = e.return;
    }
    for (
      e.sibling.return = e.return, e = e.sibling;
      e.tag !== 5 && e.tag !== 6 && e.tag !== 18;

    ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      ((e.child.return = e), (e = e.child));
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Wa(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode),
      t
        ? n.nodeType === 8
          ? n.parentNode.insertBefore(e, t)
          : n.insertBefore(e, t)
        : (n.nodeType === 8
            ? ((t = n.parentNode), t.insertBefore(e, n))
            : ((t = n), t.appendChild(e)),
          (n = n._reactRootContainer),
          n != null || t.onclick !== null || (t.onclick = oi)));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Wa(e, t, n), e = e.sibling; e !== null; )
      (Wa(e, t, n), (e = e.sibling));
}
function Ka(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Ka(e, t, n), e = e.sibling; e !== null; )
      (Ka(e, t, n), (e = e.sibling));
}
var ge = null,
  st = !1;
function jt(e, t, n) {
  for (n = n.child; n !== null; ) (Ip(e, t, n), (n = n.sibling));
}
function Ip(e, t, n) {
  if (gt && typeof gt.onCommitFiberUnmount == 'function')
    try {
      gt.onCommitFiberUnmount(Ii, n);
    } catch {}
  switch (n.tag) {
    case 5:
      ke || Un(n, t);
    case 6:
      var r = ge,
        o = st;
      ((ge = null),
        jt(e, t, n),
        (ge = r),
        (st = o),
        ge !== null &&
          (st
            ? ((e = ge),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : ge.removeChild(n.stateNode)));
      break;
    case 18:
      ge !== null &&
        (st
          ? ((e = ge),
            (n = n.stateNode),
            e.nodeType === 8
              ? zl(e.parentNode, n)
              : e.nodeType === 1 && zl(e, n),
            zr(e))
          : zl(ge, n.stateNode));
      break;
    case 4:
      ((r = ge),
        (o = st),
        (ge = n.stateNode.containerInfo),
        (st = !0),
        jt(e, t, n),
        (ge = r),
        (st = o));
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (
        !ke &&
        ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))
      ) {
        o = r = r.next;
        do {
          var i = o,
            l = i.destroy;
          ((i = i.tag),
            l !== void 0 && (i & 2 || i & 4) && Va(n, t, l),
            (o = o.next));
        } while (o !== r);
      }
      jt(e, t, n);
      break;
    case 1:
      if (
        !ke &&
        (Un(n, t),
        (r = n.stateNode),
        typeof r.componentWillUnmount == 'function')
      )
        try {
          ((r.props = n.memoizedProps),
            (r.state = n.memoizedState),
            r.componentWillUnmount());
        } catch (a) {
          le(n, t, a);
        }
      jt(e, t, n);
      break;
    case 21:
      jt(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((ke = (r = ke) || n.memoizedState !== null), jt(e, t, n), (ke = r))
        : jt(e, t, n);
      break;
    default:
      jt(e, t, n);
  }
}
function Qc(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    (n === null && (n = e.stateNode = new Kg()),
      t.forEach(function (r) {
        var o = n0.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(o, o));
      }));
  }
}
function ot(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var o = n[r];
      try {
        var i = e,
          l = t,
          a = l;
        e: for (; a !== null; ) {
          switch (a.tag) {
            case 5:
              ((ge = a.stateNode), (st = !1));
              break e;
            case 3:
              ((ge = a.stateNode.containerInfo), (st = !0));
              break e;
            case 4:
              ((ge = a.stateNode.containerInfo), (st = !0));
              break e;
          }
          a = a.return;
        }
        if (ge === null) throw Error(R(160));
        (Ip(i, l, o), (ge = null), (st = !1));
        var s = o.alternate;
        (s !== null && (s.return = null), (o.return = null));
      } catch (u) {
        le(o, t, u);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null; ) (Op(t, e), (t = t.sibling));
}
function Op(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((ot(t, e), vt(e), r & 4)) {
        try {
          (Ar(3, e, e.return), zi(3, e));
        } catch (h) {
          le(e, e.return, h);
        }
        try {
          Ar(5, e, e.return);
        } catch (h) {
          le(e, e.return, h);
        }
      }
      break;
    case 1:
      (ot(t, e), vt(e), r & 512 && n !== null && Un(n, n.return));
      break;
    case 5:
      if (
        (ot(t, e),
        vt(e),
        r & 512 && n !== null && Un(n, n.return),
        e.flags & 32)
      ) {
        var o = e.stateNode;
        try {
          Lr(o, '');
        } catch (h) {
          le(e, e.return, h);
        }
      }
      if (r & 4 && ((o = e.stateNode), o != null)) {
        var i = e.memoizedProps,
          l = n !== null ? n.memoizedProps : i,
          a = e.type,
          s = e.updateQueue;
        if (((e.updateQueue = null), s !== null))
          try {
            (a === 'input' && i.type === 'radio' && i.name != null && ef(o, i),
              ha(a, l));
            var u = ha(a, i);
            for (l = 0; l < s.length; l += 2) {
              var f = s[l],
                m = s[l + 1];
              f === 'style'
                ? lf(o, m)
                : f === 'dangerouslySetInnerHTML'
                  ? rf(o, m)
                  : f === 'children'
                    ? Lr(o, m)
                    : _s(o, f, m, u);
            }
            switch (a) {
              case 'input':
                da(o, i);
                break;
              case 'textarea':
                tf(o, i);
                break;
              case 'select':
                var y = o._wrapperState.wasMultiple;
                o._wrapperState.wasMultiple = !!i.multiple;
                var S = i.value;
                S != null
                  ? Hn(o, !!i.multiple, S, !1)
                  : y !== !!i.multiple &&
                    (i.defaultValue != null
                      ? Hn(o, !!i.multiple, i.defaultValue, !0)
                      : Hn(o, !!i.multiple, i.multiple ? [] : '', !1));
            }
            o[Wr] = i;
          } catch (h) {
            le(e, e.return, h);
          }
      }
      break;
    case 6:
      if ((ot(t, e), vt(e), r & 4)) {
        if (e.stateNode === null) throw Error(R(162));
        ((o = e.stateNode), (i = e.memoizedProps));
        try {
          o.nodeValue = i;
        } catch (h) {
          le(e, e.return, h);
        }
      }
      break;
    case 3:
      if (
        (ot(t, e), vt(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          zr(t.containerInfo);
        } catch (h) {
          le(e, e.return, h);
        }
      break;
    case 4:
      (ot(t, e), vt(e));
      break;
    case 13:
      (ot(t, e),
        vt(e),
        (o = e.child),
        o.flags & 8192 &&
          ((i = o.memoizedState !== null),
          (o.stateNode.isHidden = i),
          !i ||
            (o.alternate !== null && o.alternate.memoizedState !== null) ||
            (iu = se())),
        r & 4 && Qc(e));
      break;
    case 22:
      if (
        ((f = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((ke = (u = ke) || f), ot(t, e), (ke = u)) : ot(t, e),
        vt(e),
        r & 8192)
      ) {
        if (
          ((u = e.memoizedState !== null),
          (e.stateNode.isHidden = u) && !f && e.mode & 1)
        )
          for (N = e, f = e.child; f !== null; ) {
            for (m = N = f; N !== null; ) {
              switch (((y = N), (S = y.child), y.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Ar(4, y, y.return);
                  break;
                case 1:
                  Un(y, y.return);
                  var C = y.stateNode;
                  if (typeof C.componentWillUnmount == 'function') {
                    ((r = y), (n = y.return));
                    try {
                      ((t = r),
                        (C.props = t.memoizedProps),
                        (C.state = t.memoizedState),
                        C.componentWillUnmount());
                    } catch (h) {
                      le(r, n, h);
                    }
                  }
                  break;
                case 5:
                  Un(y, y.return);
                  break;
                case 22:
                  if (y.memoizedState !== null) {
                    Xc(m);
                    continue;
                  }
              }
              S !== null ? ((S.return = y), (N = S)) : Xc(m);
            }
            f = f.sibling;
          }
        e: for (f = null, m = e; ; ) {
          if (m.tag === 5) {
            if (f === null) {
              f = m;
              try {
                ((o = m.stateNode),
                  u
                    ? ((i = o.style),
                      typeof i.setProperty == 'function'
                        ? i.setProperty('display', 'none', 'important')
                        : (i.display = 'none'))
                    : ((a = m.stateNode),
                      (s = m.memoizedProps.style),
                      (l =
                        s != null && s.hasOwnProperty('display')
                          ? s.display
                          : null),
                      (a.style.display = of('display', l))));
              } catch (h) {
                le(e, e.return, h);
              }
            }
          } else if (m.tag === 6) {
            if (f === null)
              try {
                m.stateNode.nodeValue = u ? '' : m.memoizedProps;
              } catch (h) {
                le(e, e.return, h);
              }
          } else if (
            ((m.tag !== 22 && m.tag !== 23) ||
              m.memoizedState === null ||
              m === e) &&
            m.child !== null
          ) {
            ((m.child.return = m), (m = m.child));
            continue;
          }
          if (m === e) break e;
          for (; m.sibling === null; ) {
            if (m.return === null || m.return === e) break e;
            (f === m && (f = null), (m = m.return));
          }
          (f === m && (f = null),
            (m.sibling.return = m.return),
            (m = m.sibling));
        }
      }
      break;
    case 19:
      (ot(t, e), vt(e), r & 4 && Qc(e));
      break;
    case 21:
      break;
    default:
      (ot(t, e), vt(e));
  }
}
function vt(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Ap(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(R(160));
      }
      switch (r.tag) {
        case 5:
          var o = r.stateNode;
          r.flags & 32 && (Lr(o, ''), (r.flags &= -33));
          var i = Gc(e);
          Ka(e, i, o);
          break;
        case 3:
        case 4:
          var l = r.stateNode.containerInfo,
            a = Gc(e);
          Wa(e, a, l);
          break;
        default:
          throw Error(R(161));
      }
    } catch (s) {
      le(e, e.return, s);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function Qg(e, t, n) {
  ((N = e), Dp(e));
}
function Dp(e, t, n) {
  for (var r = (e.mode & 1) !== 0; N !== null; ) {
    var o = N,
      i = o.child;
    if (o.tag === 22 && r) {
      var l = o.memoizedState !== null || To;
      if (!l) {
        var a = o.alternate,
          s = (a !== null && a.memoizedState !== null) || ke;
        a = To;
        var u = ke;
        if (((To = l), (ke = s) && !u))
          for (N = o; N !== null; )
            ((l = N),
              (s = l.child),
              l.tag === 22 && l.memoizedState !== null
                ? qc(o)
                : s !== null
                  ? ((s.return = l), (N = s))
                  : qc(o));
        for (; i !== null; ) ((N = i), Dp(i), (i = i.sibling));
        ((N = o), (To = a), (ke = u));
      }
      Yc(e);
    } else
      o.subtreeFlags & 8772 && i !== null ? ((i.return = o), (N = i)) : Yc(e);
  }
}
function Yc(e) {
  for (; N !== null; ) {
    var t = N;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              ke || zi(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !ke)
                if (n === null) r.componentDidMount();
                else {
                  var o =
                    t.elementType === t.type
                      ? n.memoizedProps
                      : at(t.type, n.memoizedProps);
                  r.componentDidUpdate(
                    o,
                    n.memoizedState,
                    r.__reactInternalSnapshotBeforeUpdate
                  );
                }
              var i = t.updateQueue;
              i !== null && Oc(t, i, r);
              break;
            case 3:
              var l = t.updateQueue;
              if (l !== null) {
                if (((n = null), t.child !== null))
                  switch (t.child.tag) {
                    case 5:
                      n = t.child.stateNode;
                      break;
                    case 1:
                      n = t.child.stateNode;
                  }
                Oc(t, l, n);
              }
              break;
            case 5:
              var a = t.stateNode;
              if (n === null && t.flags & 4) {
                n = a;
                var s = t.memoizedProps;
                switch (t.type) {
                  case 'button':
                  case 'input':
                  case 'select':
                  case 'textarea':
                    s.autoFocus && n.focus();
                    break;
                  case 'img':
                    s.src && (n.src = s.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var u = t.alternate;
                if (u !== null) {
                  var f = u.memoizedState;
                  if (f !== null) {
                    var m = f.dehydrated;
                    m !== null && zr(m);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(R(163));
          }
        ke || (t.flags & 512 && Ha(t));
      } catch (y) {
        le(t, t.return, y);
      }
    }
    if (t === e) {
      N = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      ((n.return = t.return), (N = n));
      break;
    }
    N = t.return;
  }
}
function Xc(e) {
  for (; N !== null; ) {
    var t = N;
    if (t === e) {
      N = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      ((n.return = t.return), (N = n));
      break;
    }
    N = t.return;
  }
}
function qc(e) {
  for (; N !== null; ) {
    var t = N;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            zi(4, t);
          } catch (s) {
            le(t, n, s);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == 'function') {
            var o = t.return;
            try {
              r.componentDidMount();
            } catch (s) {
              le(t, o, s);
            }
          }
          var i = t.return;
          try {
            Ha(t);
          } catch (s) {
            le(t, i, s);
          }
          break;
        case 5:
          var l = t.return;
          try {
            Ha(t);
          } catch (s) {
            le(t, l, s);
          }
      }
    } catch (s) {
      le(t, t.return, s);
    }
    if (t === e) {
      N = null;
      break;
    }
    var a = t.sibling;
    if (a !== null) {
      ((a.return = t.return), (N = a));
      break;
    }
    N = t.return;
  }
}
var Yg = Math.ceil,
  vi = It.ReactCurrentDispatcher,
  ru = It.ReactCurrentOwner,
  Je = It.ReactCurrentBatchConfig,
  U = 0,
  ve = null,
  ce = null,
  we = 0,
  Ve = 0,
  Vn = tn(0),
  pe = 0,
  qr = null,
  yn = 0,
  Bi = 0,
  ou = 0,
  Ir = null,
  Le = null,
  iu = 0,
  or = 1 / 0,
  Ct = null,
  hi = !1,
  Ga = null,
  Qt = null,
  Mo = !1,
  Ut = null,
  yi = 0,
  Or = 0,
  Qa = null,
  Ho = -1,
  Wo = 0;
function Ne() {
  return U & 6 ? se() : Ho !== -1 ? Ho : (Ho = se());
}
function Yt(e) {
  return e.mode & 1
    ? U & 2 && we !== 0
      ? we & -we
      : Ig.transition !== null
        ? (Wo === 0 && (Wo = gf()), Wo)
        : ((e = W),
          e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : Pf(e.type))),
          e)
    : 1;
}
function dt(e, t, n, r) {
  if (50 < Or) throw ((Or = 0), (Qa = null), Error(R(185)));
  (ro(e, n, r),
    (!(U & 2) || e !== ve) &&
      (e === ve && (!(U & 2) && (Bi |= n), pe === 4 && zt(e, we)),
      ze(e, r),
      n === 1 && U === 0 && !(t.mode & 1) && ((or = se() + 500), bi && nn())));
}
function ze(e, t) {
  var n = e.callbackNode;
  Iy(e, t);
  var r = ei(e, e === ve ? we : 0);
  if (r === 0)
    (n !== null && lc(n), (e.callbackNode = null), (e.callbackPriority = 0));
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && lc(n), t === 1))
      (e.tag === 0 ? Ag(Zc.bind(null, e)) : Hf(Zc.bind(null, e)),
        Rg(function () {
          !(U & 6) && nn();
        }),
        (n = null));
    else {
      switch (wf(r)) {
        case 1:
          n = As;
          break;
        case 4:
          n = hf;
          break;
        case 16:
          n = Jo;
          break;
        case 536870912:
          n = yf;
          break;
        default:
          n = Jo;
      }
      n = Up(n, jp.bind(null, e));
    }
    ((e.callbackPriority = t), (e.callbackNode = n));
  }
}
function jp(e, t) {
  if (((Ho = -1), (Wo = 0), U & 6)) throw Error(R(327));
  var n = e.callbackNode;
  if (Yn() && e.callbackNode !== n) return null;
  var r = ei(e, e === ve ? we : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = gi(e, r);
  else {
    t = r;
    var o = U;
    U |= 2;
    var i = bp();
    (ve !== e || we !== t) && ((Ct = null), (or = se() + 500), fn(e, t));
    do
      try {
        Zg();
        break;
      } catch (a) {
        Lp(e, a);
      }
    while (!0);
    (Hs(),
      (vi.current = i),
      (U = o),
      ce !== null ? (t = 0) : ((ve = null), (we = 0), (t = pe)));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((o = xa(e)), o !== 0 && ((r = o), (t = Ya(e, o)))), t === 1)
    )
      throw ((n = qr), fn(e, 0), zt(e, r), ze(e, se()), n);
    if (t === 6) zt(e, r);
    else {
      if (
        ((o = e.current.alternate),
        !(r & 30) &&
          !Xg(o) &&
          ((t = gi(e, r)),
          t === 2 && ((i = xa(e)), i !== 0 && ((r = i), (t = Ya(e, i)))),
          t === 1))
      )
        throw ((n = qr), fn(e, 0), zt(e, r), ze(e, se()), n);
      switch (((e.finishedWork = o), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(R(345));
        case 2:
          sn(e, Le, Ct);
          break;
        case 3:
          if (
            (zt(e, r), (r & 130023424) === r && ((t = iu + 500 - se()), 10 < t))
          ) {
            if (ei(e, 0) !== 0) break;
            if (((o = e.suspendedLanes), (o & r) !== r)) {
              (Ne(), (e.pingedLanes |= e.suspendedLanes & o));
              break;
            }
            e.timeoutHandle = Ma(sn.bind(null, e, Le, Ct), t);
            break;
          }
          sn(e, Le, Ct);
          break;
        case 4:
          if ((zt(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, o = -1; 0 < r; ) {
            var l = 31 - ct(r);
            ((i = 1 << l), (l = t[l]), l > o && (o = l), (r &= ~i));
          }
          if (
            ((r = o),
            (r = se() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                  ? 480
                  : 1080 > r
                    ? 1080
                    : 1920 > r
                      ? 1920
                      : 3e3 > r
                        ? 3e3
                        : 4320 > r
                          ? 4320
                          : 1960 * Yg(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = Ma(sn.bind(null, e, Le, Ct), r);
            break;
          }
          sn(e, Le, Ct);
          break;
        case 5:
          sn(e, Le, Ct);
          break;
        default:
          throw Error(R(329));
      }
    }
  }
  return (ze(e, se()), e.callbackNode === n ? jp.bind(null, e) : null);
}
function Ya(e, t) {
  var n = Ir;
  return (
    e.current.memoizedState.isDehydrated && (fn(e, t).flags |= 256),
    (e = gi(e, t)),
    e !== 2 && ((t = Le), (Le = n), t !== null && Xa(t)),
    e
  );
}
function Xa(e) {
  Le === null ? (Le = e) : Le.push.apply(Le, e);
}
function Xg(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var o = n[r],
            i = o.getSnapshot;
          o = o.value;
          try {
            if (!ft(i(), o)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((n = t.child), t.subtreeFlags & 16384 && n !== null))
      ((n.return = t), (t = n));
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
  }
  return !0;
}
function zt(e, t) {
  for (
    t &= ~ou,
      t &= ~Bi,
      e.suspendedLanes |= t,
      e.pingedLanes &= ~t,
      e = e.expirationTimes;
    0 < t;

  ) {
    var n = 31 - ct(t),
      r = 1 << n;
    ((e[n] = -1), (t &= ~r));
  }
}
function Zc(e) {
  if (U & 6) throw Error(R(327));
  Yn();
  var t = ei(e, 0);
  if (!(t & 1)) return (ze(e, se()), null);
  var n = gi(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = xa(e);
    r !== 0 && ((t = r), (n = Ya(e, r)));
  }
  if (n === 1) throw ((n = qr), fn(e, 0), zt(e, t), ze(e, se()), n);
  if (n === 6) throw Error(R(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    sn(e, Le, Ct),
    ze(e, se()),
    null
  );
}
function lu(e, t) {
  var n = U;
  U |= 1;
  try {
    return e(t);
  } finally {
    ((U = n), U === 0 && ((or = se() + 500), bi && nn()));
  }
}
function gn(e) {
  Ut !== null && Ut.tag === 0 && !(U & 6) && Yn();
  var t = U;
  U |= 1;
  var n = Je.transition,
    r = W;
  try {
    if (((Je.transition = null), (W = 1), e)) return e();
  } finally {
    ((W = r), (Je.transition = n), (U = t), !(U & 6) && nn());
  }
}
function au() {
  ((Ve = Vn.current), ee(Vn));
}
function fn(e, t) {
  ((e.finishedWork = null), (e.finishedLanes = 0));
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), _g(n)), ce !== null))
    for (n = ce.return; n !== null; ) {
      var r = n;
      switch ((Bs(r), r.tag)) {
        case 1:
          ((r = r.type.childContextTypes), r != null && ii());
          break;
        case 3:
          (nr(), ee(Fe), ee(Pe), Xs());
          break;
        case 5:
          Ys(r);
          break;
        case 4:
          nr();
          break;
        case 13:
          ee(re);
          break;
        case 19:
          ee(re);
          break;
        case 10:
          Ws(r.type._context);
          break;
        case 22:
        case 23:
          au();
      }
      n = n.return;
    }
  if (
    ((ve = e),
    (ce = e = Xt(e.current, null)),
    (we = Ve = t),
    (pe = 0),
    (qr = null),
    (ou = Bi = yn = 0),
    (Le = Ir = null),
    cn !== null)
  ) {
    for (t = 0; t < cn.length; t++)
      if (((n = cn[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var o = r.next,
          i = n.pending;
        if (i !== null) {
          var l = i.next;
          ((i.next = o), (r.next = l));
        }
        n.pending = r;
      }
    cn = null;
  }
  return e;
}
function Lp(e, t) {
  do {
    var n = ce;
    try {
      if ((Hs(), (Bo.current = mi), pi)) {
        for (var r = oe.memoizedState; r !== null; ) {
          var o = r.queue;
          (o !== null && (o.pending = null), (r = r.next));
        }
        pi = !1;
      }
      if (
        ((hn = 0),
        (me = fe = oe = null),
        (Nr = !1),
        (Qr = 0),
        (ru.current = null),
        n === null || n.return === null)
      ) {
        ((pe = 1), (qr = t), (ce = null));
        break;
      }
      e: {
        var i = e,
          l = n.return,
          a = n,
          s = t;
        if (
          ((t = we),
          (a.flags |= 32768),
          s !== null && typeof s == 'object' && typeof s.then == 'function')
        ) {
          var u = s,
            f = a,
            m = f.tag;
          if (!(f.mode & 1) && (m === 0 || m === 11 || m === 15)) {
            var y = f.alternate;
            y
              ? ((f.updateQueue = y.updateQueue),
                (f.memoizedState = y.memoizedState),
                (f.lanes = y.lanes))
              : ((f.updateQueue = null), (f.memoizedState = null));
          }
          var S = $c(l);
          if (S !== null) {
            ((S.flags &= -257),
              zc(S, l, a, i, t),
              S.mode & 1 && Fc(i, u, t),
              (t = S),
              (s = u));
            var C = t.updateQueue;
            if (C === null) {
              var h = new Set();
              (h.add(s), (t.updateQueue = h));
            } else C.add(s);
            break e;
          } else {
            if (!(t & 1)) {
              (Fc(i, u, t), su());
              break e;
            }
            s = Error(R(426));
          }
        } else if (ne && a.mode & 1) {
          var w = $c(l);
          if (w !== null) {
            (!(w.flags & 65536) && (w.flags |= 256),
              zc(w, l, a, i, t),
              Us(rr(s, a)));
            break e;
          }
        }
        ((i = s = rr(s, a)),
          pe !== 4 && (pe = 2),
          Ir === null ? (Ir = [i]) : Ir.push(i),
          (i = l));
        do {
          switch (i.tag) {
            case 3:
              ((i.flags |= 65536), (t &= -t), (i.lanes |= t));
              var p = wp(i, s, t);
              Ic(i, p);
              break e;
            case 1:
              a = s;
              var d = i.type,
                v = i.stateNode;
              if (
                !(i.flags & 128) &&
                (typeof d.getDerivedStateFromError == 'function' ||
                  (v !== null &&
                    typeof v.componentDidCatch == 'function' &&
                    (Qt === null || !Qt.has(v))))
              ) {
                ((i.flags |= 65536), (t &= -t), (i.lanes |= t));
                var x = Sp(i, a, t);
                Ic(i, x);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      $p(n);
    } catch (E) {
      ((t = E), ce === n && n !== null && (ce = n = n.return));
      continue;
    }
    break;
  } while (!0);
}
function bp() {
  var e = vi.current;
  return ((vi.current = mi), e === null ? mi : e);
}
function su() {
  ((pe === 0 || pe === 3 || pe === 2) && (pe = 4),
    ve === null || (!(yn & 268435455) && !(Bi & 268435455)) || zt(ve, we));
}
function gi(e, t) {
  var n = U;
  U |= 2;
  var r = bp();
  (ve !== e || we !== t) && ((Ct = null), fn(e, t));
  do
    try {
      qg();
      break;
    } catch (o) {
      Lp(e, o);
    }
  while (!0);
  if ((Hs(), (U = n), (vi.current = r), ce !== null)) throw Error(R(261));
  return ((ve = null), (we = 0), pe);
}
function qg() {
  for (; ce !== null; ) Fp(ce);
}
function Zg() {
  for (; ce !== null && !Ey(); ) Fp(ce);
}
function Fp(e) {
  var t = Bp(e.alternate, e, Ve);
  ((e.memoizedProps = e.pendingProps),
    t === null ? $p(e) : (ce = t),
    (ru.current = null));
}
function $p(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = Wg(n, t)), n !== null)) {
        ((n.flags &= 32767), (ce = n));
        return;
      }
      if (e !== null)
        ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
      else {
        ((pe = 6), (ce = null));
        return;
      }
    } else if (((n = Hg(n, t, Ve)), n !== null)) {
      ce = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      ce = t;
      return;
    }
    ce = t = e;
  } while (t !== null);
  pe === 0 && (pe = 5);
}
function sn(e, t, n) {
  var r = W,
    o = Je.transition;
  try {
    ((Je.transition = null), (W = 1), Jg(e, t, n, r));
  } finally {
    ((Je.transition = o), (W = r));
  }
  return null;
}
function Jg(e, t, n, r) {
  do Yn();
  while (Ut !== null);
  if (U & 6) throw Error(R(327));
  n = e.finishedWork;
  var o = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
    throw Error(R(177));
  ((e.callbackNode = null), (e.callbackPriority = 0));
  var i = n.lanes | n.childLanes;
  if (
    (Oy(e, i),
    e === ve && ((ce = ve = null), (we = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      Mo ||
      ((Mo = !0),
      Up(Jo, function () {
        return (Yn(), null);
      })),
    (i = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || i)
  ) {
    ((i = Je.transition), (Je.transition = null));
    var l = W;
    W = 1;
    var a = U;
    ((U |= 4),
      (ru.current = null),
      Gg(e, n),
      Op(n, e),
      wg(Ra),
      (ti = !!_a),
      (Ra = _a = null),
      (e.current = n),
      Qg(n),
      ky(),
      (U = a),
      (W = l),
      (Je.transition = i));
  } else e.current = n;
  if (
    (Mo && ((Mo = !1), (Ut = e), (yi = o)),
    (i = e.pendingLanes),
    i === 0 && (Qt = null),
    Ry(n.stateNode),
    ze(e, se()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      ((o = t[n]), r(o.value, { componentStack: o.stack, digest: o.digest }));
  if (hi) throw ((hi = !1), (e = Ga), (Ga = null), e);
  return (
    yi & 1 && e.tag !== 0 && Yn(),
    (i = e.pendingLanes),
    i & 1 ? (e === Qa ? Or++ : ((Or = 0), (Qa = e))) : (Or = 0),
    nn(),
    null
  );
}
function Yn() {
  if (Ut !== null) {
    var e = wf(yi),
      t = Je.transition,
      n = W;
    try {
      if (((Je.transition = null), (W = 16 > e ? 16 : e), Ut === null))
        var r = !1;
      else {
        if (((e = Ut), (Ut = null), (yi = 0), U & 6)) throw Error(R(331));
        var o = U;
        for (U |= 4, N = e.current; N !== null; ) {
          var i = N,
            l = i.child;
          if (N.flags & 16) {
            var a = i.deletions;
            if (a !== null) {
              for (var s = 0; s < a.length; s++) {
                var u = a[s];
                for (N = u; N !== null; ) {
                  var f = N;
                  switch (f.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Ar(8, f, i);
                  }
                  var m = f.child;
                  if (m !== null) ((m.return = f), (N = m));
                  else
                    for (; N !== null; ) {
                      f = N;
                      var y = f.sibling,
                        S = f.return;
                      if ((Np(f), f === u)) {
                        N = null;
                        break;
                      }
                      if (y !== null) {
                        ((y.return = S), (N = y));
                        break;
                      }
                      N = S;
                    }
                }
              }
              var C = i.alternate;
              if (C !== null) {
                var h = C.child;
                if (h !== null) {
                  C.child = null;
                  do {
                    var w = h.sibling;
                    ((h.sibling = null), (h = w));
                  } while (h !== null);
                }
              }
              N = i;
            }
          }
          if (i.subtreeFlags & 2064 && l !== null) ((l.return = i), (N = l));
          else
            e: for (; N !== null; ) {
              if (((i = N), i.flags & 2048))
                switch (i.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Ar(9, i, i.return);
                }
              var p = i.sibling;
              if (p !== null) {
                ((p.return = i.return), (N = p));
                break e;
              }
              N = i.return;
            }
        }
        var d = e.current;
        for (N = d; N !== null; ) {
          l = N;
          var v = l.child;
          if (l.subtreeFlags & 2064 && v !== null) ((v.return = l), (N = v));
          else
            e: for (l = d; N !== null; ) {
              if (((a = N), a.flags & 2048))
                try {
                  switch (a.tag) {
                    case 0:
                    case 11:
                    case 15:
                      zi(9, a);
                  }
                } catch (E) {
                  le(a, a.return, E);
                }
              if (a === l) {
                N = null;
                break e;
              }
              var x = a.sibling;
              if (x !== null) {
                ((x.return = a.return), (N = x));
                break e;
              }
              N = a.return;
            }
        }
        if (
          ((U = o), nn(), gt && typeof gt.onPostCommitFiberRoot == 'function')
        )
          try {
            gt.onPostCommitFiberRoot(Ii, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      ((W = n), (Je.transition = t));
    }
  }
  return !1;
}
function Jc(e, t, n) {
  ((t = rr(n, t)),
    (t = wp(e, t, 1)),
    (e = Gt(e, t, 1)),
    (t = Ne()),
    e !== null && (ro(e, 1, t), ze(e, t)));
}
function le(e, t, n) {
  if (e.tag === 3) Jc(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        Jc(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == 'function' ||
          (typeof r.componentDidCatch == 'function' &&
            (Qt === null || !Qt.has(r)))
        ) {
          ((e = rr(n, e)),
            (e = Sp(t, e, 1)),
            (t = Gt(t, e, 1)),
            (e = Ne()),
            t !== null && (ro(t, 1, e), ze(t, e)));
          break;
        }
      }
      t = t.return;
    }
}
function e0(e, t, n) {
  var r = e.pingCache;
  (r !== null && r.delete(t),
    (t = Ne()),
    (e.pingedLanes |= e.suspendedLanes & n),
    ve === e &&
      (we & n) === n &&
      (pe === 4 || (pe === 3 && (we & 130023424) === we && 500 > se() - iu)
        ? fn(e, 0)
        : (ou |= n)),
    ze(e, t));
}
function zp(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = wo), (wo <<= 1), !(wo & 130023424) && (wo = 4194304))
      : (t = 1));
  var n = Ne();
  ((e = Mt(e, t)), e !== null && (ro(e, t, n), ze(e, n)));
}
function t0(e) {
  var t = e.memoizedState,
    n = 0;
  (t !== null && (n = t.retryLane), zp(e, n));
}
function n0(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        o = e.memoizedState;
      o !== null && (n = o.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(R(314));
  }
  (r !== null && r.delete(t), zp(e, n));
}
var Bp;
Bp = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || Fe.current) be = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return ((be = !1), Vg(e, t, n));
      be = !!(e.flags & 131072);
    }
  else ((be = !1), ne && t.flags & 1048576 && Wf(t, si, t.index));
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      (Vo(e, t), (e = t.pendingProps));
      var o = Jn(t, Pe.current);
      (Qn(t, n), (o = Zs(null, t, r, e, o, n)));
      var i = Js();
      return (
        (t.flags |= 1),
        typeof o == 'object' &&
        o !== null &&
        typeof o.render == 'function' &&
        o.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            $e(r) ? ((i = !0), li(t)) : (i = !1),
            (t.memoizedState =
              o.state !== null && o.state !== void 0 ? o.state : null),
            Gs(t),
            (o.updater = $i),
            (t.stateNode = o),
            (o._reactInternals = t),
            La(t, r, e, n),
            (t = $a(null, t, r, !0, i, n)))
          : ((t.tag = 0), ne && i && zs(t), Me(null, t, o, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (Vo(e, t),
          (e = t.pendingProps),
          (o = r._init),
          (r = o(r._payload)),
          (t.type = r),
          (o = t.tag = o0(r)),
          (e = at(r, e)),
          o)
        ) {
          case 0:
            t = Fa(null, t, r, e, n);
            break e;
          case 1:
            t = Vc(null, t, r, e, n);
            break e;
          case 11:
            t = Bc(null, t, r, e, n);
            break e;
          case 14:
            t = Uc(null, t, r, at(r.type, e), n);
            break e;
        }
        throw Error(R(306, r, ''));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : at(r, o)),
        Fa(e, t, r, o, n)
      );
    case 1:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : at(r, o)),
        Vc(e, t, r, o, n)
      );
    case 3:
      e: {
        if ((kp(t), e === null)) throw Error(R(387));
        ((r = t.pendingProps),
          (i = t.memoizedState),
          (o = i.element),
          qf(e, t),
          di(t, r, null, n));
        var l = t.memoizedState;
        if (((r = l.element), i.isDehydrated))
          if (
            ((i = {
              element: r,
              isDehydrated: !1,
              cache: l.cache,
              pendingSuspenseBoundaries: l.pendingSuspenseBoundaries,
              transitions: l.transitions,
            }),
            (t.updateQueue.baseState = i),
            (t.memoizedState = i),
            t.flags & 256)
          ) {
            ((o = rr(Error(R(423)), t)), (t = Hc(e, t, r, n, o)));
            break e;
          } else if (r !== o) {
            ((o = rr(Error(R(424)), t)), (t = Hc(e, t, r, n, o)));
            break e;
          } else
            for (
              He = Kt(t.stateNode.containerInfo.firstChild),
                We = t,
                ne = !0,
                ut = null,
                n = Yf(t, null, r, n),
                t.child = n;
              n;

            )
              ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
        else {
          if ((er(), r === o)) {
            t = Nt(e, t, n);
            break e;
          }
          Me(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        Zf(t),
        e === null && Oa(t),
        (r = t.type),
        (o = t.pendingProps),
        (i = e !== null ? e.memoizedProps : null),
        (l = o.children),
        Ta(r, o) ? (l = null) : i !== null && Ta(r, i) && (t.flags |= 32),
        Ep(e, t),
        Me(e, t, l, n),
        t.child
      );
    case 6:
      return (e === null && Oa(t), null);
    case 13:
      return Pp(e, t, n);
    case 4:
      return (
        Qs(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = tr(t, null, r, n)) : Me(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : at(r, o)),
        Bc(e, t, r, o, n)
      );
    case 7:
      return (Me(e, t, t.pendingProps, n), t.child);
    case 8:
      return (Me(e, t, t.pendingProps.children, n), t.child);
    case 12:
      return (Me(e, t, t.pendingProps.children, n), t.child);
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (o = t.pendingProps),
          (i = t.memoizedProps),
          (l = o.value),
          X(ui, r._currentValue),
          (r._currentValue = l),
          i !== null)
        )
          if (ft(i.value, l)) {
            if (i.children === o.children && !Fe.current) {
              t = Nt(e, t, n);
              break e;
            }
          } else
            for (i = t.child, i !== null && (i.return = t); i !== null; ) {
              var a = i.dependencies;
              if (a !== null) {
                l = i.child;
                for (var s = a.firstContext; s !== null; ) {
                  if (s.context === r) {
                    if (i.tag === 1) {
                      ((s = _t(-1, n & -n)), (s.tag = 2));
                      var u = i.updateQueue;
                      if (u !== null) {
                        u = u.shared;
                        var f = u.pending;
                        (f === null
                          ? (s.next = s)
                          : ((s.next = f.next), (f.next = s)),
                          (u.pending = s));
                      }
                    }
                    ((i.lanes |= n),
                      (s = i.alternate),
                      s !== null && (s.lanes |= n),
                      Da(i.return, n, t),
                      (a.lanes |= n));
                    break;
                  }
                  s = s.next;
                }
              } else if (i.tag === 10) l = i.type === t.type ? null : i.child;
              else if (i.tag === 18) {
                if (((l = i.return), l === null)) throw Error(R(341));
                ((l.lanes |= n),
                  (a = l.alternate),
                  a !== null && (a.lanes |= n),
                  Da(l, n, t),
                  (l = i.sibling));
              } else l = i.child;
              if (l !== null) l.return = i;
              else
                for (l = i; l !== null; ) {
                  if (l === t) {
                    l = null;
                    break;
                  }
                  if (((i = l.sibling), i !== null)) {
                    ((i.return = l.return), (l = i));
                    break;
                  }
                  l = l.return;
                }
              i = l;
            }
        (Me(e, t, o.children, n), (t = t.child));
      }
      return t;
    case 9:
      return (
        (o = t.type),
        (r = t.pendingProps.children),
        Qn(t, n),
        (o = tt(o)),
        (r = r(o)),
        (t.flags |= 1),
        Me(e, t, r, n),
        t.child
      );
    case 14:
      return (
        (r = t.type),
        (o = at(r, t.pendingProps)),
        (o = at(r.type, o)),
        Uc(e, t, r, o, n)
      );
    case 15:
      return xp(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : at(r, o)),
        Vo(e, t),
        (t.tag = 1),
        $e(r) ? ((e = !0), li(t)) : (e = !1),
        Qn(t, n),
        gp(t, r, o),
        La(t, r, o, n),
        $a(null, t, r, !0, e, n)
      );
    case 19:
      return _p(e, t, n);
    case 22:
      return Cp(e, t, n);
  }
  throw Error(R(156, t.tag));
};
function Up(e, t) {
  return vf(e, t);
}
function r0(e, t, n, r) {
  ((this.tag = e),
    (this.key = n),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = t),
    (this.dependencies =
      this.memoizedState =
      this.updateQueue =
      this.memoizedProps =
        null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null));
}
function Ze(e, t, n, r) {
  return new r0(e, t, n, r);
}
function uu(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function o0(e) {
  if (typeof e == 'function') return uu(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === Ts)) return 11;
    if (e === Ms) return 14;
  }
  return 2;
}
function Xt(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = Ze(e.tag, t, e.key, e.mode)),
        (n.elementType = e.elementType),
        (n.type = e.type),
        (n.stateNode = e.stateNode),
        (n.alternate = e),
        (e.alternate = n))
      : ((n.pendingProps = t),
        (n.type = e.type),
        (n.flags = 0),
        (n.subtreeFlags = 0),
        (n.deletions = null)),
    (n.flags = e.flags & 14680064),
    (n.childLanes = e.childLanes),
    (n.lanes = e.lanes),
    (n.child = e.child),
    (n.memoizedProps = e.memoizedProps),
    (n.memoizedState = e.memoizedState),
    (n.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (n.dependencies =
      t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (n.sibling = e.sibling),
    (n.index = e.index),
    (n.ref = e.ref),
    n
  );
}
function Ko(e, t, n, r, o, i) {
  var l = 2;
  if (((r = e), typeof e == 'function')) uu(e) && (l = 1);
  else if (typeof e == 'string') l = 5;
  else
    e: switch (e) {
      case On:
        return pn(n.children, o, i, t);
      case Rs:
        ((l = 8), (o |= 8));
        break;
      case la:
        return (
          (e = Ze(12, n, t, o | 2)),
          (e.elementType = la),
          (e.lanes = i),
          e
        );
      case aa:
        return ((e = Ze(13, n, t, o)), (e.elementType = aa), (e.lanes = i), e);
      case sa:
        return ((e = Ze(19, n, t, o)), (e.elementType = sa), (e.lanes = i), e);
      case qd:
        return Ui(n, o, i, t);
      default:
        if (typeof e == 'object' && e !== null)
          switch (e.$$typeof) {
            case Yd:
              l = 10;
              break e;
            case Xd:
              l = 9;
              break e;
            case Ts:
              l = 11;
              break e;
            case Ms:
              l = 14;
              break e;
            case bt:
              ((l = 16), (r = null));
              break e;
          }
        throw Error(R(130, e == null ? e : typeof e, ''));
    }
  return (
    (t = Ze(l, n, t, o)),
    (t.elementType = e),
    (t.type = r),
    (t.lanes = i),
    t
  );
}
function pn(e, t, n, r) {
  return ((e = Ze(7, e, r, t)), (e.lanes = n), e);
}
function Ui(e, t, n, r) {
  return (
    (e = Ze(22, e, r, t)),
    (e.elementType = qd),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function Ql(e, t, n) {
  return ((e = Ze(6, e, null, t)), (e.lanes = n), e);
}
function Yl(e, t, n) {
  return (
    (t = Ze(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function i0(e, t, n, r, o) {
  ((this.tag = t),
    (this.containerInfo = e),
    (this.finishedWork =
      this.pingCache =
      this.current =
      this.pendingChildren =
        null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = Ml(0)),
    (this.expirationTimes = Ml(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = Ml(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = o),
    (this.mutableSourceEagerHydrationData = null));
}
function cu(e, t, n, r, o, i, l, a, s) {
  return (
    (e = new i0(e, t, n, a, s)),
    t === 1 ? ((t = 1), i === !0 && (t |= 8)) : (t = 0),
    (i = Ze(3, null, null, t)),
    (e.current = i),
    (i.stateNode = e),
    (i.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    Gs(i),
    e
  );
}
function l0(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: In,
    key: r == null ? null : '' + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function Vp(e) {
  if (!e) return Jt;
  e = e._reactInternals;
  e: {
    if (kn(e) !== e || e.tag !== 1) throw Error(R(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if ($e(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(R(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if ($e(n)) return Vf(e, n, t);
  }
  return t;
}
function Hp(e, t, n, r, o, i, l, a, s) {
  return (
    (e = cu(n, r, !0, e, o, i, l, a, s)),
    (e.context = Vp(null)),
    (n = e.current),
    (r = Ne()),
    (o = Yt(n)),
    (i = _t(r, o)),
    (i.callback = t ?? null),
    Gt(n, i, o),
    (e.current.lanes = o),
    ro(e, o, r),
    ze(e, r),
    e
  );
}
function Vi(e, t, n, r) {
  var o = t.current,
    i = Ne(),
    l = Yt(o);
  return (
    (n = Vp(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = _t(i, l)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = Gt(o, t, l)),
    e !== null && (dt(e, o, l, i), zo(e, o, l)),
    l
  );
}
function wi(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function ed(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function du(e, t) {
  (ed(e, t), (e = e.alternate) && ed(e, t));
}
function a0() {
  return null;
}
var Wp =
  typeof reportError == 'function'
    ? reportError
    : function (e) {
        console.error(e);
      };
function fu(e) {
  this._internalRoot = e;
}
Hi.prototype.render = fu.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(R(409));
  Vi(e, t, null, null);
};
Hi.prototype.unmount = fu.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (gn(function () {
      Vi(null, e, null, null);
    }),
      (t[Tt] = null));
  }
};
function Hi(e) {
  this._internalRoot = e;
}
Hi.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = Cf();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < $t.length && t !== 0 && t < $t[n].priority; n++);
    ($t.splice(n, 0, e), n === 0 && kf(e));
  }
};
function pu(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function Wi(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== ' react-mount-point-unstable '))
  );
}
function td() {}
function s0(e, t, n, r, o) {
  if (o) {
    if (typeof r == 'function') {
      var i = r;
      r = function () {
        var u = wi(l);
        i.call(u);
      };
    }
    var l = Hp(t, r, e, 0, null, !1, !1, '', td);
    return (
      (e._reactRootContainer = l),
      (e[Tt] = l.current),
      Vr(e.nodeType === 8 ? e.parentNode : e),
      gn(),
      l
    );
  }
  for (; (o = e.lastChild); ) e.removeChild(o);
  if (typeof r == 'function') {
    var a = r;
    r = function () {
      var u = wi(s);
      a.call(u);
    };
  }
  var s = cu(e, 0, !1, null, null, !1, !1, '', td);
  return (
    (e._reactRootContainer = s),
    (e[Tt] = s.current),
    Vr(e.nodeType === 8 ? e.parentNode : e),
    gn(function () {
      Vi(t, s, n, r);
    }),
    s
  );
}
function Ki(e, t, n, r, o) {
  var i = n._reactRootContainer;
  if (i) {
    var l = i;
    if (typeof o == 'function') {
      var a = o;
      o = function () {
        var s = wi(l);
        a.call(s);
      };
    }
    Vi(t, l, e, o);
  } else l = s0(n, t, e, o, r);
  return wi(l);
}
Sf = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Sr(t.pendingLanes);
        n !== 0 &&
          (Is(t, n | 1), ze(t, se()), !(U & 6) && ((or = se() + 500), nn()));
      }
      break;
    case 13:
      (gn(function () {
        var r = Mt(e, 1);
        if (r !== null) {
          var o = Ne();
          dt(r, e, 1, o);
        }
      }),
        du(e, 1));
  }
};
Os = function (e) {
  if (e.tag === 13) {
    var t = Mt(e, 134217728);
    if (t !== null) {
      var n = Ne();
      dt(t, e, 134217728, n);
    }
    du(e, 134217728);
  }
};
xf = function (e) {
  if (e.tag === 13) {
    var t = Yt(e),
      n = Mt(e, t);
    if (n !== null) {
      var r = Ne();
      dt(n, e, t, r);
    }
    du(e, t);
  }
};
Cf = function () {
  return W;
};
Ef = function (e, t) {
  var n = W;
  try {
    return ((W = e), t());
  } finally {
    W = n;
  }
};
ga = function (e, t, n) {
  switch (t) {
    case 'input':
      if ((da(e, n), (t = n.name), n.type === 'radio' && t != null)) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (
          n = n.querySelectorAll(
            'input[name=' + JSON.stringify('' + t) + '][type="radio"]'
          ),
            t = 0;
          t < n.length;
          t++
        ) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var o = Li(r);
            if (!o) throw Error(R(90));
            (Jd(r), da(r, o));
          }
        }
      }
      break;
    case 'textarea':
      tf(e, n);
      break;
    case 'select':
      ((t = n.value), t != null && Hn(e, !!n.multiple, t, !1));
  }
};
uf = lu;
cf = gn;
var u0 = { usingClientEntryPoint: !1, Events: [io, bn, Li, af, sf, lu] },
  yr = {
    findFiberByHostInstance: un,
    bundleType: 0,
    version: '18.3.1',
    rendererPackageName: 'react-dom',
  },
  c0 = {
    bundleType: yr.bundleType,
    version: yr.version,
    rendererPackageName: yr.rendererPackageName,
    rendererConfig: yr.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: It.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = pf(e)), e === null ? null : e.stateNode);
    },
    findFiberByHostInstance: yr.findFiberByHostInstance || a0,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: '18.3.1-next-f1338f8080-20240426',
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
  var No = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!No.isDisabled && No.supportsFiber)
    try {
      ((Ii = No.inject(c0)), (gt = No));
    } catch {}
}
Ge.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = u0;
Ge.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!pu(t)) throw Error(R(200));
  return l0(e, t, null, n);
};
Ge.createRoot = function (e, t) {
  if (!pu(e)) throw Error(R(299));
  var n = !1,
    r = '',
    o = Wp;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (o = t.onRecoverableError)),
    (t = cu(e, 1, !1, null, null, n, !1, r, o)),
    (e[Tt] = t.current),
    Vr(e.nodeType === 8 ? e.parentNode : e),
    new fu(t)
  );
};
Ge.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == 'function'
      ? Error(R(188))
      : ((e = Object.keys(e).join(',')), Error(R(268, e)));
  return ((e = pf(t)), (e = e === null ? null : e.stateNode), e);
};
Ge.flushSync = function (e) {
  return gn(e);
};
Ge.hydrate = function (e, t, n) {
  if (!Wi(t)) throw Error(R(200));
  return Ki(null, e, t, !0, n);
};
Ge.hydrateRoot = function (e, t, n) {
  if (!pu(e)) throw Error(R(405));
  var r = (n != null && n.hydratedSources) || null,
    o = !1,
    i = '',
    l = Wp;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (o = !0),
      n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (l = n.onRecoverableError)),
    (t = Hp(t, null, e, 1, n ?? null, o, !1, i, l)),
    (e[Tt] = t.current),
    Vr(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      ((n = r[e]),
        (o = n._getVersion),
        (o = o(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, o])
          : t.mutableSourceEagerHydrationData.push(n, o));
  return new Hi(t);
};
Ge.render = function (e, t, n) {
  if (!Wi(t)) throw Error(R(200));
  return Ki(null, e, t, !1, n);
};
Ge.unmountComponentAtNode = function (e) {
  if (!Wi(e)) throw Error(R(40));
  return e._reactRootContainer
    ? (gn(function () {
        Ki(null, null, e, !1, function () {
          ((e._reactRootContainer = null), (e[Tt] = null));
        });
      }),
      !0)
    : !1;
};
Ge.unstable_batchedUpdates = lu;
Ge.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!Wi(n)) throw Error(R(200));
  if (e == null || e._reactInternals === void 0) throw Error(R(38));
  return Ki(e, t, n, !1, r);
};
Ge.version = '18.3.1-next-f1338f8080-20240426';
function Kp() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Kp);
    } catch (e) {
      console.error(e);
    }
}
(Kp(), (Gd.exports = Ge));
var Pn = Gd.exports;
const d0 = jd(Pn);
var nd = Pn;
((Xu.createRoot = nd.createRoot), (Xu.hydrateRoot = nd.hydrateRoot));
const f0 = Es.useInsertionEffect,
  p0 =
    typeof window < 'u' &&
    typeof window.document < 'u' &&
    typeof window.document.createElement < 'u',
  m0 = p0 ? c.useLayoutEffect : c.useEffect,
  v0 = f0 || m0,
  sE = e => {
    const t = c.useRef([e, (...n) => t[0](...n)]).current;
    return (
      v0(() => {
        t[0] = e;
      }),
      t[1]
    );
  };
function rd(e, t) {
  if (typeof e == 'function') return e(t);
  e != null && (e.current = t);
}
function mu(...e) {
  return t => {
    let n = !1;
    const r = e.map(o => {
      const i = rd(o, t);
      return (!n && typeof i == 'function' && (n = !0), i);
    });
    if (n)
      return () => {
        for (let o = 0; o < r.length; o++) {
          const i = r[o];
          typeof i == 'function' ? i() : rd(e[o], null);
        }
      };
  };
}
function B(...e) {
  return c.useCallback(mu(...e), e);
}
function h0(e, t) {
  const n = c.createContext(t),
    r = i => {
      const { children: l, ...a } = i,
        s = c.useMemo(() => a, Object.values(a));
      return g.jsx(n.Provider, { value: s, children: l });
    };
  r.displayName = e + 'Provider';
  function o(i) {
    const l = c.useContext(n);
    if (l) return l;
    if (t !== void 0) return t;
    throw new Error(`\`${i}\` must be used within \`${e}\``);
  }
  return [r, o];
}
function Be(e, t = []) {
  let n = [];
  function r(i, l) {
    const a = c.createContext(l),
      s = n.length;
    n = [...n, l];
    const u = m => {
      const { scope: y, children: S, ...C } = m,
        h = y?.[e]?.[s] || a,
        w = c.useMemo(() => C, Object.values(C));
      return g.jsx(h.Provider, { value: w, children: S });
    };
    u.displayName = i + 'Provider';
    function f(m, y) {
      const S = y?.[e]?.[s] || a,
        C = c.useContext(S);
      if (C) return C;
      if (l !== void 0) return l;
      throw new Error(`\`${m}\` must be used within \`${i}\``);
    }
    return [u, f];
  }
  const o = () => {
    const i = n.map(l => c.createContext(l));
    return function (a) {
      const s = a?.[e] || i;
      return c.useMemo(() => ({ [`__scope${e}`]: { ...a, [e]: s } }), [a, s]);
    };
  };
  return ((o.scopeName = e), [r, y0(o, ...t)]);
}
function y0(...e) {
  const t = e[0];
  if (e.length === 1) return t;
  const n = () => {
    const r = e.map(o => ({ useScope: o(), scopeName: o.scopeName }));
    return function (i) {
      const l = r.reduce((a, { useScope: s, scopeName: u }) => {
        const m = s(i)[`__scope${u}`];
        return { ...a, ...m };
      }, {});
      return c.useMemo(() => ({ [`__scope${t.scopeName}`]: l }), [l]);
    };
  };
  return ((n.scopeName = t.scopeName), n);
}
function wn(e) {
  const t = g0(e),
    n = c.forwardRef((r, o) => {
      const { children: i, ...l } = r,
        a = c.Children.toArray(i),
        s = a.find(S0);
      if (s) {
        const u = s.props.children,
          f = a.map(m =>
            m === s
              ? c.Children.count(u) > 1
                ? c.Children.only(null)
                : c.isValidElement(u)
                  ? u.props.children
                  : null
              : m
          );
        return g.jsx(t, {
          ...l,
          ref: o,
          children: c.isValidElement(u) ? c.cloneElement(u, void 0, f) : null,
        });
      }
      return g.jsx(t, { ...l, ref: o, children: i });
    });
  return ((n.displayName = `${e}.Slot`), n);
}
var uE = wn('Slot');
function g0(e) {
  const t = c.forwardRef((n, r) => {
    const { children: o, ...i } = n,
      l = c.isValidElement(o) ? C0(o) : void 0,
      a = B(l, r);
    if (c.isValidElement(o)) {
      const s = x0(i, o.props);
      return (o.type !== c.Fragment && (s.ref = a), c.cloneElement(o, s));
    }
    return c.Children.count(o) > 1 ? c.Children.only(null) : null;
  });
  return ((t.displayName = `${e}.SlotClone`), t);
}
var Gp = Symbol('radix.slottable');
function w0(e) {
  const t = ({ children: n }) => g.jsx(g.Fragment, { children: n });
  return ((t.displayName = `${e}.Slottable`), (t.__radixId = Gp), t);
}
function S0(e) {
  return (
    c.isValidElement(e) &&
    typeof e.type == 'function' &&
    '__radixId' in e.type &&
    e.type.__radixId === Gp
  );
}
function x0(e, t) {
  const n = { ...t };
  for (const r in t) {
    const o = e[r],
      i = t[r];
    /^on[A-Z]/.test(r)
      ? o && i
        ? (n[r] = (...a) => {
            const s = i(...a);
            return (o(...a), s);
          })
        : o && (n[r] = o)
      : r === 'style'
        ? (n[r] = { ...o, ...i })
        : r === 'className' && (n[r] = [o, i].filter(Boolean).join(' '));
  }
  return { ...e, ...n };
}
function C0(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, 'ref')?.get,
    n = t && 'isReactWarning' in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, 'ref')?.get),
      (n = t && 'isReactWarning' in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
function Gi(e) {
  const t = e + 'CollectionProvider',
    [n, r] = Be(t),
    [o, i] = n(t, { collectionRef: { current: null }, itemMap: new Map() }),
    l = h => {
      const { scope: w, children: p } = h,
        d = Ee.useRef(null),
        v = Ee.useRef(new Map()).current;
      return g.jsx(o, { scope: w, itemMap: v, collectionRef: d, children: p });
    };
  l.displayName = t;
  const a = e + 'CollectionSlot',
    s = wn(a),
    u = Ee.forwardRef((h, w) => {
      const { scope: p, children: d } = h,
        v = i(a, p),
        x = B(w, v.collectionRef);
      return g.jsx(s, { ref: x, children: d });
    });
  u.displayName = a;
  const f = e + 'CollectionItemSlot',
    m = 'data-radix-collection-item',
    y = wn(f),
    S = Ee.forwardRef((h, w) => {
      const { scope: p, children: d, ...v } = h,
        x = Ee.useRef(null),
        E = B(w, x),
        P = i(f, p);
      return (
        Ee.useEffect(
          () => (
            P.itemMap.set(x, { ref: x, ...v }),
            () => void P.itemMap.delete(x)
          )
        ),
        g.jsx(y, { [m]: '', ref: E, children: d })
      );
    });
  S.displayName = f;
  function C(h) {
    const w = i(e + 'CollectionConsumer', h);
    return Ee.useCallback(() => {
      const d = w.collectionRef.current;
      if (!d) return [];
      const v = Array.from(d.querySelectorAll(`[${m}]`));
      return Array.from(w.itemMap.values()).sort(
        (P, k) => v.indexOf(P.ref.current) - v.indexOf(k.ref.current)
      );
    }, [w.collectionRef, w.itemMap]);
  }
  return [{ Provider: l, Slot: u, ItemSlot: S }, C, r];
}
var E0 = [
    'a',
    'button',
    'div',
    'form',
    'h2',
    'h3',
    'img',
    'input',
    'label',
    'li',
    'nav',
    'ol',
    'p',
    'select',
    'span',
    'svg',
    'ul',
  ],
  D = E0.reduce((e, t) => {
    const n = wn(`Primitive.${t}`),
      r = c.forwardRef((o, i) => {
        const { asChild: l, ...a } = o,
          s = l ? n : t;
        return (
          typeof window < 'u' && (window[Symbol.for('radix-ui')] = !0),
          g.jsx(s, { ...a, ref: i })
        );
      });
    return ((r.displayName = `Primitive.${t}`), { ...e, [t]: r });
  }, {});
function vu(e, t) {
  e && Pn.flushSync(() => e.dispatchEvent(t));
}
function Ae(e) {
  const t = c.useRef(e);
  return (
    c.useEffect(() => {
      t.current = e;
    }),
    c.useMemo(
      () =>
        (...n) =>
          t.current?.(...n),
      []
    )
  );
}
function k0(e, t = globalThis?.document) {
  const n = Ae(e);
  c.useEffect(() => {
    const r = o => {
      o.key === 'Escape' && n(o);
    };
    return (
      t.addEventListener('keydown', r, { capture: !0 }),
      () => t.removeEventListener('keydown', r, { capture: !0 })
    );
  }, [n, t]);
}
var P0 = 'DismissableLayer',
  qa = 'dismissableLayer.update',
  _0 = 'dismissableLayer.pointerDownOutside',
  R0 = 'dismissableLayer.focusOutside',
  od,
  Qp = c.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  ao = c.forwardRef((e, t) => {
    const {
        disableOutsidePointerEvents: n = !1,
        onEscapeKeyDown: r,
        onPointerDownOutside: o,
        onFocusOutside: i,
        onInteractOutside: l,
        onDismiss: a,
        ...s
      } = e,
      u = c.useContext(Qp),
      [f, m] = c.useState(null),
      y = f?.ownerDocument ?? globalThis?.document,
      [, S] = c.useState({}),
      C = B(t, k => m(k)),
      h = Array.from(u.layers),
      [w] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1),
      p = h.indexOf(w),
      d = f ? h.indexOf(f) : -1,
      v = u.layersWithOutsidePointerEventsDisabled.size > 0,
      x = d >= p,
      E = M0(k => {
        const _ = k.target,
          L = [...u.branches].some(A => A.contains(_));
        !x || L || (o?.(k), l?.(k), k.defaultPrevented || a?.());
      }, y),
      P = N0(k => {
        const _ = k.target;
        [...u.branches].some(A => A.contains(_)) ||
          (i?.(k), l?.(k), k.defaultPrevented || a?.());
      }, y);
    return (
      k0(k => {
        d === u.layers.size - 1 &&
          (r?.(k), !k.defaultPrevented && a && (k.preventDefault(), a()));
      }, y),
      c.useEffect(() => {
        if (f)
          return (
            n &&
              (u.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((od = y.body.style.pointerEvents),
                (y.body.style.pointerEvents = 'none')),
              u.layersWithOutsidePointerEventsDisabled.add(f)),
            u.layers.add(f),
            id(),
            () => {
              n &&
                u.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (y.body.style.pointerEvents = od);
            }
          );
      }, [f, y, n, u]),
      c.useEffect(
        () => () => {
          f &&
            (u.layers.delete(f),
            u.layersWithOutsidePointerEventsDisabled.delete(f),
            id());
        },
        [f, u]
      ),
      c.useEffect(() => {
        const k = () => S({});
        return (
          document.addEventListener(qa, k),
          () => document.removeEventListener(qa, k)
        );
      }, []),
      g.jsx(D.div, {
        ...s,
        ref: C,
        style: {
          pointerEvents: v ? (x ? 'auto' : 'none') : void 0,
          ...e.style,
        },
        onFocusCapture: M(e.onFocusCapture, P.onFocusCapture),
        onBlurCapture: M(e.onBlurCapture, P.onBlurCapture),
        onPointerDownCapture: M(e.onPointerDownCapture, E.onPointerDownCapture),
      })
    );
  });
ao.displayName = P0;
var T0 = 'DismissableLayerBranch',
  Yp = c.forwardRef((e, t) => {
    const n = c.useContext(Qp),
      r = c.useRef(null),
      o = B(t, r);
    return (
      c.useEffect(() => {
        const i = r.current;
        if (i)
          return (
            n.branches.add(i),
            () => {
              n.branches.delete(i);
            }
          );
      }, [n.branches]),
      g.jsx(D.div, { ...e, ref: o })
    );
  });
Yp.displayName = T0;
function M0(e, t = globalThis?.document) {
  const n = Ae(e),
    r = c.useRef(!1),
    o = c.useRef(() => {});
  return (
    c.useEffect(() => {
      const i = a => {
          if (a.target && !r.current) {
            let s = function () {
              Xp(_0, n, u, { discrete: !0 });
            };
            const u = { originalEvent: a };
            a.pointerType === 'touch'
              ? (t.removeEventListener('click', o.current),
                (o.current = s),
                t.addEventListener('click', o.current, { once: !0 }))
              : s();
          } else t.removeEventListener('click', o.current);
          r.current = !1;
        },
        l = window.setTimeout(() => {
          t.addEventListener('pointerdown', i);
        }, 0);
      return () => {
        (window.clearTimeout(l),
          t.removeEventListener('pointerdown', i),
          t.removeEventListener('click', o.current));
      };
    }, [t, n]),
    { onPointerDownCapture: () => (r.current = !0) }
  );
}
function N0(e, t = globalThis?.document) {
  const n = Ae(e),
    r = c.useRef(!1);
  return (
    c.useEffect(() => {
      const o = i => {
        i.target &&
          !r.current &&
          Xp(R0, n, { originalEvent: i }, { discrete: !1 });
      };
      return (
        t.addEventListener('focusin', o),
        () => t.removeEventListener('focusin', o)
      );
    }, [t, n]),
    {
      onFocusCapture: () => (r.current = !0),
      onBlurCapture: () => (r.current = !1),
    }
  );
}
function id() {
  const e = new CustomEvent(qa);
  document.dispatchEvent(e);
}
function Xp(e, t, n, { discrete: r }) {
  const o = n.originalEvent.target,
    i = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: n });
  (t && o.addEventListener(e, t, { once: !0 }),
    r ? vu(o, i) : o.dispatchEvent(i));
}
var A0 = ao,
  I0 = Yp,
  de = globalThis?.document ? c.useLayoutEffect : () => {},
  O0 = 'Portal',
  so = c.forwardRef((e, t) => {
    const { container: n, ...r } = e,
      [o, i] = c.useState(!1);
    de(() => i(!0), []);
    const l = n || (o && globalThis?.document?.body);
    return l ? d0.createPortal(g.jsx(D.div, { ...r, ref: t }), l) : null;
  });
so.displayName = O0;
function D0(e, t) {
  return c.useReducer((n, r) => t[n][r] ?? n, e);
}
var pt = e => {
  const { present: t, children: n } = e,
    r = j0(t),
    o =
      typeof n == 'function' ? n({ present: r.isPresent }) : c.Children.only(n),
    i = B(r.ref, L0(o));
  return typeof n == 'function' || r.isPresent
    ? c.cloneElement(o, { ref: i })
    : null;
};
pt.displayName = 'Presence';
function j0(e) {
  const [t, n] = c.useState(),
    r = c.useRef(null),
    o = c.useRef(e),
    i = c.useRef('none'),
    l = e ? 'mounted' : 'unmounted',
    [a, s] = D0(l, {
      mounted: { UNMOUNT: 'unmounted', ANIMATION_OUT: 'unmountSuspended' },
      unmountSuspended: { MOUNT: 'mounted', ANIMATION_END: 'unmounted' },
      unmounted: { MOUNT: 'mounted' },
    });
  return (
    c.useEffect(() => {
      const u = Ao(r.current);
      i.current = a === 'mounted' ? u : 'none';
    }, [a]),
    de(() => {
      const u = r.current,
        f = o.current;
      if (f !== e) {
        const y = i.current,
          S = Ao(u);
        (e
          ? s('MOUNT')
          : S === 'none' || u?.display === 'none'
            ? s('UNMOUNT')
            : s(f && y !== S ? 'ANIMATION_OUT' : 'UNMOUNT'),
          (o.current = e));
      }
    }, [e, s]),
    de(() => {
      if (t) {
        let u;
        const f = t.ownerDocument.defaultView ?? window,
          m = S => {
            const h = Ao(r.current).includes(S.animationName);
            if (S.target === t && h && (s('ANIMATION_END'), !o.current)) {
              const w = t.style.animationFillMode;
              ((t.style.animationFillMode = 'forwards'),
                (u = f.setTimeout(() => {
                  t.style.animationFillMode === 'forwards' &&
                    (t.style.animationFillMode = w);
                })));
            }
          },
          y = S => {
            S.target === t && (i.current = Ao(r.current));
          };
        return (
          t.addEventListener('animationstart', y),
          t.addEventListener('animationcancel', m),
          t.addEventListener('animationend', m),
          () => {
            (f.clearTimeout(u),
              t.removeEventListener('animationstart', y),
              t.removeEventListener('animationcancel', m),
              t.removeEventListener('animationend', m));
          }
        );
      } else s('ANIMATION_END');
    }, [t, s]),
    {
      isPresent: ['mounted', 'unmountSuspended'].includes(a),
      ref: c.useCallback(u => {
        ((r.current = u ? getComputedStyle(u) : null), n(u));
      }, []),
    }
  );
}
function Ao(e) {
  return e?.animationName || 'none';
}
function L0(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, 'ref')?.get,
    n = t && 'isReactWarning' in t && t.isReactWarning;
  return n
    ? e.ref
    : ((t = Object.getOwnPropertyDescriptor(e, 'ref')?.get),
      (n = t && 'isReactWarning' in t && t.isReactWarning),
      n ? e.props.ref : e.props.ref || e.ref);
}
var b0 = Es[' useInsertionEffect '.trim().toString()] || de;
function At({ prop: e, defaultProp: t, onChange: n = () => {}, caller: r }) {
  const [o, i, l] = F0({ defaultProp: t, onChange: n }),
    a = e !== void 0,
    s = a ? e : o;
  {
    const f = c.useRef(e !== void 0);
    c.useEffect(() => {
      const m = f.current;
      (m !== a &&
        console.warn(
          `${r} is changing from ${m ? 'controlled' : 'uncontrolled'} to ${a ? 'controlled' : 'uncontrolled'}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        ),
        (f.current = a));
    }, [a, r]);
  }
  const u = c.useCallback(
    f => {
      if (a) {
        const m = $0(f) ? f(e) : f;
        m !== e && l.current?.(m);
      } else i(f);
    },
    [a, e, i, l]
  );
  return [s, u];
}
function F0({ defaultProp: e, onChange: t }) {
  const [n, r] = c.useState(e),
    o = c.useRef(n),
    i = c.useRef(t);
  return (
    b0(() => {
      i.current = t;
    }, [t]),
    c.useEffect(() => {
      o.current !== n && (i.current?.(n), (o.current = n));
    }, [n, o]),
    [n, r, i]
  );
}
function $0(e) {
  return typeof e == 'function';
}
var qp = Object.freeze({
    position: 'absolute',
    border: 0,
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
  }),
  z0 = 'VisuallyHidden',
  hu = c.forwardRef((e, t) =>
    g.jsx(D.span, { ...e, ref: t, style: { ...qp, ...e.style } })
  );
hu.displayName = z0;
var yu = 'ToastProvider',
  [gu, B0, U0] = Gi('Toast'),
  [Zp, cE] = Be('Toast', [U0]),
  [V0, Qi] = Zp(yu),
  Jp = e => {
    const {
        __scopeToast: t,
        label: n = 'Notification',
        duration: r = 5e3,
        swipeDirection: o = 'right',
        swipeThreshold: i = 50,
        children: l,
      } = e,
      [a, s] = c.useState(null),
      [u, f] = c.useState(0),
      m = c.useRef(!1),
      y = c.useRef(!1);
    return (
      n.trim() ||
        console.error(
          `Invalid prop \`label\` supplied to \`${yu}\`. Expected non-empty \`string\`.`
        ),
      g.jsx(gu.Provider, {
        scope: t,
        children: g.jsx(V0, {
          scope: t,
          label: n,
          duration: r,
          swipeDirection: o,
          swipeThreshold: i,
          toastCount: u,
          viewport: a,
          onViewportChange: s,
          onToastAdd: c.useCallback(() => f(S => S + 1), []),
          onToastRemove: c.useCallback(() => f(S => S - 1), []),
          isFocusedToastEscapeKeyDownRef: m,
          isClosePausedRef: y,
          children: l,
        }),
      })
    );
  };
Jp.displayName = yu;
var em = 'ToastViewport',
  H0 = ['F8'],
  Za = 'toast.viewportPause',
  Ja = 'toast.viewportResume',
  tm = c.forwardRef((e, t) => {
    const {
        __scopeToast: n,
        hotkey: r = H0,
        label: o = 'Notifications ({hotkey})',
        ...i
      } = e,
      l = Qi(em, n),
      a = B0(n),
      s = c.useRef(null),
      u = c.useRef(null),
      f = c.useRef(null),
      m = c.useRef(null),
      y = B(t, m, l.onViewportChange),
      S = r.join('+').replace(/Key/g, '').replace(/Digit/g, ''),
      C = l.toastCount > 0;
    (c.useEffect(() => {
      const w = p => {
        r.length !== 0 &&
          r.every(v => p[v] || p.code === v) &&
          m.current?.focus();
      };
      return (
        document.addEventListener('keydown', w),
        () => document.removeEventListener('keydown', w)
      );
    }, [r]),
      c.useEffect(() => {
        const w = s.current,
          p = m.current;
        if (C && w && p) {
          const d = () => {
              if (!l.isClosePausedRef.current) {
                const P = new CustomEvent(Za);
                (p.dispatchEvent(P), (l.isClosePausedRef.current = !0));
              }
            },
            v = () => {
              if (l.isClosePausedRef.current) {
                const P = new CustomEvent(Ja);
                (p.dispatchEvent(P), (l.isClosePausedRef.current = !1));
              }
            },
            x = P => {
              !w.contains(P.relatedTarget) && v();
            },
            E = () => {
              w.contains(document.activeElement) || v();
            };
          return (
            w.addEventListener('focusin', d),
            w.addEventListener('focusout', x),
            w.addEventListener('pointermove', d),
            w.addEventListener('pointerleave', E),
            window.addEventListener('blur', d),
            window.addEventListener('focus', v),
            () => {
              (w.removeEventListener('focusin', d),
                w.removeEventListener('focusout', x),
                w.removeEventListener('pointermove', d),
                w.removeEventListener('pointerleave', E),
                window.removeEventListener('blur', d),
                window.removeEventListener('focus', v));
            }
          );
        }
      }, [C, l.isClosePausedRef]));
    const h = c.useCallback(
      ({ tabbingDirection: w }) => {
        const d = a().map(v => {
          const x = v.ref.current,
            E = [x, ...r2(x)];
          return w === 'forwards' ? E : E.reverse();
        });
        return (w === 'forwards' ? d.reverse() : d).flat();
      },
      [a]
    );
    return (
      c.useEffect(() => {
        const w = m.current;
        if (w) {
          const p = d => {
            const v = d.altKey || d.ctrlKey || d.metaKey;
            if (d.key === 'Tab' && !v) {
              const E = document.activeElement,
                P = d.shiftKey;
              if (d.target === w && P) {
                u.current?.focus();
                return;
              }
              const L = h({ tabbingDirection: P ? 'backwards' : 'forwards' }),
                A = L.findIndex($ => $ === E);
              Xl(L.slice(A + 1))
                ? d.preventDefault()
                : P
                  ? u.current?.focus()
                  : f.current?.focus();
            }
          };
          return (
            w.addEventListener('keydown', p),
            () => w.removeEventListener('keydown', p)
          );
        }
      }, [a, h]),
      g.jsxs(I0, {
        ref: s,
        role: 'region',
        'aria-label': o.replace('{hotkey}', S),
        tabIndex: -1,
        style: { pointerEvents: C ? void 0 : 'none' },
        children: [
          C &&
            g.jsx(es, {
              ref: u,
              onFocusFromOutsideViewport: () => {
                const w = h({ tabbingDirection: 'forwards' });
                Xl(w);
              },
            }),
          g.jsx(gu.Slot, {
            scope: n,
            children: g.jsx(D.ol, { tabIndex: -1, ...i, ref: y }),
          }),
          C &&
            g.jsx(es, {
              ref: f,
              onFocusFromOutsideViewport: () => {
                const w = h({ tabbingDirection: 'backwards' });
                Xl(w);
              },
            }),
        ],
      })
    );
  });
tm.displayName = em;
var nm = 'ToastFocusProxy',
  es = c.forwardRef((e, t) => {
    const { __scopeToast: n, onFocusFromOutsideViewport: r, ...o } = e,
      i = Qi(nm, n);
    return g.jsx(hu, {
      'aria-hidden': !0,
      tabIndex: 0,
      ...o,
      ref: t,
      style: { position: 'fixed' },
      onFocus: l => {
        const a = l.relatedTarget;
        !i.viewport?.contains(a) && r();
      },
    });
  });
es.displayName = nm;
var uo = 'Toast',
  W0 = 'toast.swipeStart',
  K0 = 'toast.swipeMove',
  G0 = 'toast.swipeCancel',
  Q0 = 'toast.swipeEnd',
  rm = c.forwardRef((e, t) => {
    const { forceMount: n, open: r, defaultOpen: o, onOpenChange: i, ...l } = e,
      [a, s] = At({ prop: r, defaultProp: o ?? !0, onChange: i, caller: uo });
    return g.jsx(pt, {
      present: n || a,
      children: g.jsx(q0, {
        open: a,
        ...l,
        ref: t,
        onClose: () => s(!1),
        onPause: Ae(e.onPause),
        onResume: Ae(e.onResume),
        onSwipeStart: M(e.onSwipeStart, u => {
          u.currentTarget.setAttribute('data-swipe', 'start');
        }),
        onSwipeMove: M(e.onSwipeMove, u => {
          const { x: f, y: m } = u.detail.delta;
          (u.currentTarget.setAttribute('data-swipe', 'move'),
            u.currentTarget.style.setProperty(
              '--radix-toast-swipe-move-x',
              `${f}px`
            ),
            u.currentTarget.style.setProperty(
              '--radix-toast-swipe-move-y',
              `${m}px`
            ));
        }),
        onSwipeCancel: M(e.onSwipeCancel, u => {
          (u.currentTarget.setAttribute('data-swipe', 'cancel'),
            u.currentTarget.style.removeProperty('--radix-toast-swipe-move-x'),
            u.currentTarget.style.removeProperty('--radix-toast-swipe-move-y'),
            u.currentTarget.style.removeProperty('--radix-toast-swipe-end-x'),
            u.currentTarget.style.removeProperty('--radix-toast-swipe-end-y'));
        }),
        onSwipeEnd: M(e.onSwipeEnd, u => {
          const { x: f, y: m } = u.detail.delta;
          (u.currentTarget.setAttribute('data-swipe', 'end'),
            u.currentTarget.style.removeProperty('--radix-toast-swipe-move-x'),
            u.currentTarget.style.removeProperty('--radix-toast-swipe-move-y'),
            u.currentTarget.style.setProperty(
              '--radix-toast-swipe-end-x',
              `${f}px`
            ),
            u.currentTarget.style.setProperty(
              '--radix-toast-swipe-end-y',
              `${m}px`
            ),
            s(!1));
        }),
      }),
    });
  });
rm.displayName = uo;
var [Y0, X0] = Zp(uo, { onClose() {} }),
  q0 = c.forwardRef((e, t) => {
    const {
        __scopeToast: n,
        type: r = 'foreground',
        duration: o,
        open: i,
        onClose: l,
        onEscapeKeyDown: a,
        onPause: s,
        onResume: u,
        onSwipeStart: f,
        onSwipeMove: m,
        onSwipeCancel: y,
        onSwipeEnd: S,
        ...C
      } = e,
      h = Qi(uo, n),
      [w, p] = c.useState(null),
      d = B(t, j => p(j)),
      v = c.useRef(null),
      x = c.useRef(null),
      E = o || h.duration,
      P = c.useRef(0),
      k = c.useRef(E),
      _ = c.useRef(0),
      { onToastAdd: L, onToastRemove: A } = h,
      $ = Ae(() => {
        (w?.contains(document.activeElement) && h.viewport?.focus(), l());
      }),
      G = c.useCallback(
        j => {
          !j ||
            j === 1 / 0 ||
            (window.clearTimeout(_.current),
            (P.current = new Date().getTime()),
            (_.current = window.setTimeout($, j)));
        },
        [$]
      );
    (c.useEffect(() => {
      const j = h.viewport;
      if (j) {
        const H = () => {
            (G(k.current), u?.());
          },
          F = () => {
            const Y = new Date().getTime() - P.current;
            ((k.current = k.current - Y),
              window.clearTimeout(_.current),
              s?.());
          };
        return (
          j.addEventListener(Za, F),
          j.addEventListener(Ja, H),
          () => {
            (j.removeEventListener(Za, F), j.removeEventListener(Ja, H));
          }
        );
      }
    }, [h.viewport, E, s, u, G]),
      c.useEffect(() => {
        i && !h.isClosePausedRef.current && G(E);
      }, [i, E, h.isClosePausedRef, G]),
      c.useEffect(() => (L(), () => A()), [L, A]));
    const Q = c.useMemo(() => (w ? cm(w) : null), [w]);
    return h.viewport
      ? g.jsxs(g.Fragment, {
          children: [
            Q &&
              g.jsx(Z0, {
                __scopeToast: n,
                role: 'status',
                'aria-live': r === 'foreground' ? 'assertive' : 'polite',
                'aria-atomic': !0,
                children: Q,
              }),
            g.jsx(Y0, {
              scope: n,
              onClose: $,
              children: Pn.createPortal(
                g.jsx(gu.ItemSlot, {
                  scope: n,
                  children: g.jsx(A0, {
                    asChild: !0,
                    onEscapeKeyDown: M(a, () => {
                      (h.isFocusedToastEscapeKeyDownRef.current || $(),
                        (h.isFocusedToastEscapeKeyDownRef.current = !1));
                    }),
                    children: g.jsx(D.li, {
                      role: 'status',
                      'aria-live': 'off',
                      'aria-atomic': !0,
                      tabIndex: 0,
                      'data-state': i ? 'open' : 'closed',
                      'data-swipe-direction': h.swipeDirection,
                      ...C,
                      ref: d,
                      style: {
                        userSelect: 'none',
                        touchAction: 'none',
                        ...e.style,
                      },
                      onKeyDown: M(e.onKeyDown, j => {
                        j.key === 'Escape' &&
                          (a?.(j.nativeEvent),
                          j.nativeEvent.defaultPrevented ||
                            ((h.isFocusedToastEscapeKeyDownRef.current = !0),
                            $()));
                      }),
                      onPointerDown: M(e.onPointerDown, j => {
                        j.button === 0 &&
                          (v.current = { x: j.clientX, y: j.clientY });
                      }),
                      onPointerMove: M(e.onPointerMove, j => {
                        if (!v.current) return;
                        const H = j.clientX - v.current.x,
                          F = j.clientY - v.current.y,
                          Y = !!x.current,
                          b = ['left', 'right'].includes(h.swipeDirection),
                          I = ['left', 'up'].includes(h.swipeDirection)
                            ? Math.min
                            : Math.max,
                          ae = b ? I(0, H) : 0,
                          he = b ? 0 : I(0, F),
                          _e = j.pointerType === 'touch' ? 10 : 2,
                          je = { x: ae, y: he },
                          Re = { originalEvent: j, delta: je };
                        Y
                          ? ((x.current = je), Io(K0, m, Re, { discrete: !1 }))
                          : ld(je, h.swipeDirection, _e)
                            ? ((x.current = je),
                              Io(W0, f, Re, { discrete: !1 }),
                              j.target.setPointerCapture(j.pointerId))
                            : (Math.abs(H) > _e || Math.abs(F) > _e) &&
                              (v.current = null);
                      }),
                      onPointerUp: M(e.onPointerUp, j => {
                        const H = x.current,
                          F = j.target;
                        if (
                          (F.hasPointerCapture(j.pointerId) &&
                            F.releasePointerCapture(j.pointerId),
                          (x.current = null),
                          (v.current = null),
                          H)
                        ) {
                          const Y = j.currentTarget,
                            b = { originalEvent: j, delta: H };
                          (ld(H, h.swipeDirection, h.swipeThreshold)
                            ? Io(Q0, S, b, { discrete: !0 })
                            : Io(G0, y, b, { discrete: !0 }),
                            Y.addEventListener(
                              'click',
                              I => I.preventDefault(),
                              { once: !0 }
                            ));
                        }
                      }),
                    }),
                  }),
                }),
                h.viewport
              ),
            }),
          ],
        })
      : null;
  }),
  Z0 = e => {
    const { __scopeToast: t, children: n, ...r } = e,
      o = Qi(uo, t),
      [i, l] = c.useState(!1),
      [a, s] = c.useState(!1);
    return (
      t2(() => l(!0)),
      c.useEffect(() => {
        const u = window.setTimeout(() => s(!0), 1e3);
        return () => window.clearTimeout(u);
      }, []),
      a
        ? null
        : g.jsx(so, {
            asChild: !0,
            children: g.jsx(hu, {
              ...r,
              children:
                i && g.jsxs(g.Fragment, { children: [o.label, ' ', n] }),
            }),
          })
    );
  },
  J0 = 'ToastTitle',
  om = c.forwardRef((e, t) => {
    const { __scopeToast: n, ...r } = e;
    return g.jsx(D.div, { ...r, ref: t });
  });
om.displayName = J0;
var e2 = 'ToastDescription',
  im = c.forwardRef((e, t) => {
    const { __scopeToast: n, ...r } = e;
    return g.jsx(D.div, { ...r, ref: t });
  });
im.displayName = e2;
var lm = 'ToastAction',
  am = c.forwardRef((e, t) => {
    const { altText: n, ...r } = e;
    return n.trim()
      ? g.jsx(um, {
          altText: n,
          asChild: !0,
          children: g.jsx(wu, { ...r, ref: t }),
        })
      : (console.error(
          `Invalid prop \`altText\` supplied to \`${lm}\`. Expected non-empty \`string\`.`
        ),
        null);
  });
am.displayName = lm;
var sm = 'ToastClose',
  wu = c.forwardRef((e, t) => {
    const { __scopeToast: n, ...r } = e,
      o = X0(sm, n);
    return g.jsx(um, {
      asChild: !0,
      children: g.jsx(D.button, {
        type: 'button',
        ...r,
        ref: t,
        onClick: M(e.onClick, o.onClose),
      }),
    });
  });
wu.displayName = sm;
var um = c.forwardRef((e, t) => {
  const { __scopeToast: n, altText: r, ...o } = e;
  return g.jsx(D.div, {
    'data-radix-toast-announce-exclude': '',
    'data-radix-toast-announce-alt': r || void 0,
    ...o,
    ref: t,
  });
});
function cm(e) {
  const t = [];
  return (
    Array.from(e.childNodes).forEach(r => {
      if (
        (r.nodeType === r.TEXT_NODE && r.textContent && t.push(r.textContent),
        n2(r))
      ) {
        const o = r.ariaHidden || r.hidden || r.style.display === 'none',
          i = r.dataset.radixToastAnnounceExclude === '';
        if (!o)
          if (i) {
            const l = r.dataset.radixToastAnnounceAlt;
            l && t.push(l);
          } else t.push(...cm(r));
      }
    }),
    t
  );
}
function Io(e, t, n, { discrete: r }) {
  const o = n.originalEvent.currentTarget,
    i = new CustomEvent(e, { bubbles: !0, cancelable: !0, detail: n });
  (t && o.addEventListener(e, t, { once: !0 }),
    r ? vu(o, i) : o.dispatchEvent(i));
}
var ld = (e, t, n = 0) => {
  const r = Math.abs(e.x),
    o = Math.abs(e.y),
    i = r > o;
  return t === 'left' || t === 'right' ? i && r > n : !i && o > n;
};
function t2(e = () => {}) {
  const t = Ae(e);
  de(() => {
    let n = 0,
      r = 0;
    return (
      (n = window.requestAnimationFrame(
        () => (r = window.requestAnimationFrame(t))
      )),
      () => {
        (window.cancelAnimationFrame(n), window.cancelAnimationFrame(r));
      }
    );
  }, [t]);
}
function n2(e) {
  return e.nodeType === e.ELEMENT_NODE;
}
function r2(e) {
  const t = [],
    n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: r => {
        const o = r.tagName === 'INPUT' && r.type === 'hidden';
        return r.disabled || r.hidden || o
          ? NodeFilter.FILTER_SKIP
          : r.tabIndex >= 0
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
      },
    });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Xl(e) {
  const t = document.activeElement;
  return e.some(n =>
    n === t ? !0 : (n.focus(), document.activeElement !== t)
  );
}
var dE = Jp,
  fE = tm,
  pE = rm,
  mE = om,
  vE = im,
  hE = am,
  yE = wu;
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const o2 = e => e.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
  dm = (...e) => e.filter((t, n, r) => !!t && r.indexOf(t) === n).join(' ');
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ var i2 = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const l2 = c.forwardRef(
  (
    {
      color: e = 'currentColor',
      size: t = 24,
      strokeWidth: n = 2,
      absoluteStrokeWidth: r,
      className: o = '',
      children: i,
      iconNode: l,
      ...a
    },
    s
  ) =>
    c.createElement(
      'svg',
      {
        ref: s,
        ...i2,
        width: t,
        height: t,
        stroke: e,
        strokeWidth: r ? (Number(n) * 24) / Number(t) : n,
        className: dm('lucide', o),
        ...a,
      },
      [
        ...l.map(([u, f]) => c.createElement(u, f)),
        ...(Array.isArray(i) ? i : [i]),
      ]
    )
);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const T = (e, t) => {
  const n = c.forwardRef(({ className: r, ...o }, i) =>
    c.createElement(l2, {
      ref: i,
      iconNode: t,
      className: dm(`lucide-${o2(e)}`, r),
      ...o,
    })
  );
  return ((n.displayName = `${e}`), n);
};
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const gE = T('Activity', [
  [
    'path',
    {
      d: 'M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2',
      key: '169zse',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const wE = T('ArrowLeft', [
  ['path', { d: 'm12 19-7-7 7-7', key: '1l729n' }],
  ['path', { d: 'M19 12H5', key: 'x3x0zl' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const SE = T('ArrowRight', [
  ['path', { d: 'M5 12h14', key: '1ays0h' }],
  ['path', { d: 'm12 5 7 7-7 7', key: 'xquz4c' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const xE = T('Bell', [
  ['path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', key: '1qo2s2' }],
  ['path', { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0', key: 'qgo35s' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const CE = T('Bot', [
  ['path', { d: 'M12 8V4H8', key: 'hb8ula' }],
  [
    'rect',
    { width: '16', height: '12', x: '4', y: '8', rx: '2', key: 'enze0r' },
  ],
  ['path', { d: 'M2 14h2', key: 'vft8re' }],
  ['path', { d: 'M20 14h2', key: '4cs60a' }],
  ['path', { d: 'M15 13v2', key: '1xurst' }],
  ['path', { d: 'M9 13v2', key: 'rq6x2g' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const EE = T('Building2', [
  ['path', { d: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z', key: '1b4qmf' }],
  ['path', { d: 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2', key: 'i71pzd' }],
  ['path', { d: 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2', key: '10jefs' }],
  ['path', { d: 'M10 6h4', key: '1itunk' }],
  ['path', { d: 'M10 10h4', key: 'tcdvrf' }],
  ['path', { d: 'M10 14h4', key: 'kelpxr' }],
  ['path', { d: 'M10 18h4', key: '1ulq68' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const kE = T('Calendar', [
  ['path', { d: 'M8 2v4', key: '1cmpym' }],
  ['path', { d: 'M16 2v4', key: '4m81vk' }],
  [
    'rect',
    { width: '18', height: '18', x: '3', y: '4', rx: '2', key: '1hopcy' },
  ],
  ['path', { d: 'M3 10h18', key: '8toen8' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const PE = T('ChartColumn', [
  ['path', { d: 'M3 3v16a2 2 0 0 0 2 2h16', key: 'c24i48' }],
  ['path', { d: 'M18 17V9', key: '2bz60n' }],
  ['path', { d: 'M13 17V5', key: '1frdt8' }],
  ['path', { d: 'M8 17v-3', key: '17ska0' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _E = T('ChartNoAxesColumnIncreasing', [
  ['line', { x1: '12', x2: '12', y1: '20', y2: '10', key: '1vz5eb' }],
  ['line', { x1: '18', x2: '18', y1: '20', y2: '4', key: 'cun8e5' }],
  ['line', { x1: '6', x2: '6', y1: '20', y2: '16', key: 'hq0ia6' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const RE = T('Check', [['path', { d: 'M20 6 9 17l-5-5', key: '1gmf2c' }]]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const TE = T('ChevronDown', [
  ['path', { d: 'm6 9 6 6 6-6', key: 'qrunsl' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ME = T('ChevronRight', [
  ['path', { d: 'm9 18 6-6-6-6', key: 'mthhwq' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const NE = T('ChevronUp', [
  ['path', { d: 'm18 15-6-6-6 6', key: '153udz' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const AE = T('CircleAlert', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['line', { x1: '12', x2: '12', y1: '8', y2: '12', key: '1pkeuh' }],
  ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16', key: '4dfq90' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const IE = T('CircleCheckBig', [
  ['path', { d: 'M21.801 10A10 10 0 1 1 17 3.335', key: 'yps3ct' }],
  ['path', { d: 'm9 11 3 3L22 4', key: '1pflzl' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const OE = T('CircleCheck', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'm9 12 2 2 4-4', key: 'dzmm74' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const DE = T('CircleHelp', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', key: '1u773s' }],
  ['path', { d: 'M12 17h.01', key: 'p32p05' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const jE = T('CircleX', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'm15 9-6 6', key: '1uzhvr' }],
  ['path', { d: 'm9 9 6 6', key: 'z0biqf' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const LE = T('Circle', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const bE = T('ClipboardList', [
  [
    'rect',
    {
      width: '8',
      height: '4',
      x: '8',
      y: '2',
      rx: '1',
      ry: '1',
      key: 'tgr4d6',
    },
  ],
  [
    'path',
    {
      d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
      key: '116196',
    },
  ],
  ['path', { d: 'M12 11h4', key: '1jrz19' }],
  ['path', { d: 'M12 16h4', key: 'n85exb' }],
  ['path', { d: 'M8 11h.01', key: '1dfujw' }],
  ['path', { d: 'M8 16h.01', key: '18s6g9' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const FE = T('Clock', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['polyline', { points: '12 6 12 12 16 14', key: '68esgv' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $E = T('Cpu', [
  [
    'rect',
    { width: '16', height: '16', x: '4', y: '4', rx: '2', key: '14l7u7' },
  ],
  ['rect', { width: '6', height: '6', x: '9', y: '9', rx: '1', key: '5aljv4' }],
  ['path', { d: 'M15 2v2', key: '13l42r' }],
  ['path', { d: 'M15 20v2', key: '15mkzm' }],
  ['path', { d: 'M2 15h2', key: '1gxd5l' }],
  ['path', { d: 'M2 9h2', key: '1bbxkp' }],
  ['path', { d: 'M20 15h2', key: '19e6y8' }],
  ['path', { d: 'M20 9h2', key: '19tzq7' }],
  ['path', { d: 'M9 2v2', key: '165o2o' }],
  ['path', { d: 'M9 20v2', key: 'i2bqo8' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const zE = T('CreditCard', [
  [
    'rect',
    { width: '20', height: '14', x: '2', y: '5', rx: '2', key: 'ynyp8z' },
  ],
  ['line', { x1: '2', x2: '22', y1: '10', y2: '10', key: '1b3vmo' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const BE = T('Database', [
  ['ellipse', { cx: '12', cy: '5', rx: '9', ry: '3', key: 'msslwz' }],
  ['path', { d: 'M3 5V19A9 3 0 0 0 21 19V5', key: '1wlel7' }],
  ['path', { d: 'M3 12A9 3 0 0 0 21 12', key: 'mv7ke4' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const UE = T('Download', [
  ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', key: 'ih7n3h' }],
  ['polyline', { points: '7 10 12 15 17 10', key: '2ggqvy' }],
  ['line', { x1: '12', x2: '12', y1: '15', y2: '3', key: '1vk2je' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const VE = T('ExternalLink', [
  ['path', { d: 'M15 3h6v6', key: '1q9fwt' }],
  ['path', { d: 'M10 14 21 3', key: 'gplh6r' }],
  [
    'path',
    {
      d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
      key: 'a6xqqp',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const HE = T('EyeOff', [
  [
    'path',
    {
      d: 'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
      key: 'ct8e1f',
    },
  ],
  ['path', { d: 'M14.084 14.158a3 3 0 0 1-4.242-4.242', key: '151rxh' }],
  [
    'path',
    {
      d: 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143',
      key: '13bj9a',
    },
  ],
  ['path', { d: 'm2 2 20 20', key: '1ooewy' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const WE = T('Eye', [
  [
    'path',
    {
      d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
      key: '1nclc0',
    },
  ],
  ['circle', { cx: '12', cy: '12', r: '3', key: '1v7zrd' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const KE = T('FileText', [
  [
    'path',
    {
      d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z',
      key: '1rqfz7',
    },
  ],
  ['path', { d: 'M14 2v4a2 2 0 0 0 2 2h4', key: 'tnqrlb' }],
  ['path', { d: 'M10 9H8', key: 'b1mrlr' }],
  ['path', { d: 'M16 13H8', key: 't4e002' }],
  ['path', { d: 'M16 17H8', key: 'z1uh3a' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const GE = T('Filter', [
  [
    'polygon',
    { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3', key: '1yg77f' },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const QE = T('Globe', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  [
    'path',
    { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20', key: '13o1zl' },
  ],
  ['path', { d: 'M2 12h20', key: '9i4pu4' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const YE = T('HardDrive', [
  ['line', { x1: '22', x2: '2', y1: '12', y2: '12', key: '1y58io' }],
  [
    'path',
    {
      d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
      key: 'oot6mr',
    },
  ],
  ['line', { x1: '6', x2: '6.01', y1: '16', y2: '16', key: 'sgf278' }],
  ['line', { x1: '10', x2: '10.01', y1: '16', y2: '16', key: '1l4acy' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const XE = T('Hotel', [
  ['path', { d: 'M10 22v-6.57', key: '1wmca3' }],
  ['path', { d: 'M12 11h.01', key: 'z322tv' }],
  ['path', { d: 'M12 7h.01', key: '1ivr5q' }],
  ['path', { d: 'M14 15.43V22', key: '1q2vjd' }],
  ['path', { d: 'M15 16a5 5 0 0 0-6 0', key: 'o9wqvi' }],
  ['path', { d: 'M16 11h.01', key: 'xkw8gn' }],
  ['path', { d: 'M16 7h.01', key: '1kdx03' }],
  ['path', { d: 'M8 11h.01', key: '1dfujw' }],
  ['path', { d: 'M8 7h.01', key: '1vti4s' }],
  [
    'rect',
    { x: '4', y: '2', width: '16', height: '20', rx: '2', key: '1uxh74' },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const qE = T('House', [
  ['path', { d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', key: '5wwlr5' }],
  [
    'path',
    {
      d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
      key: '1d0kgt',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ZE = T('Info', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'M12 16v-4', key: '1dtifu' }],
  ['path', { d: 'M12 8h.01', key: 'e9boi3' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const JE = T('Key', [
  [
    'path',
    {
      d: 'm15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4',
      key: 'g0fldk',
    },
  ],
  ['path', { d: 'm21 2-9.6 9.6', key: '1j0ho8' }],
  ['circle', { cx: '7.5', cy: '15.5', r: '5.5', key: 'yqb3hr' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ek = T('Link', [
  [
    'path',
    {
      d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
      key: '1cjeqo',
    },
  ],
  [
    'path',
    {
      d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
      key: '19qd67',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const tk = T('LoaderCircle', [
  ['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56', key: '13zald' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const nk = T('LockOpen', [
  [
    'rect',
    {
      width: '18',
      height: '11',
      x: '3',
      y: '11',
      rx: '2',
      ry: '2',
      key: '1w4ew1',
    },
  ],
  ['path', { d: 'M7 11V7a5 5 0 0 1 9.9-1', key: '1mm8w8' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const rk = T('Lock', [
  [
    'rect',
    {
      width: '18',
      height: '11',
      x: '3',
      y: '11',
      rx: '2',
      ry: '2',
      key: '1w4ew1',
    },
  ],
  ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4', key: 'fwvmzm' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ok = T('LogOut', [
  ['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', key: '1uf3rs' }],
  ['polyline', { points: '16 17 21 12 16 7', key: '1gabdz' }],
  ['line', { x1: '21', x2: '9', y1: '12', y2: '12', key: '1uyos4' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ik = T('Mail', [
  [
    'rect',
    { width: '20', height: '16', x: '2', y: '4', rx: '2', key: '18n3k1' },
  ],
  ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7', key: '1ocrg3' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const lk = T('MapPin', [
  [
    'path',
    {
      d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
      key: '1r0f0z',
    },
  ],
  ['circle', { cx: '12', cy: '10', r: '3', key: 'ilqhr7' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ak = T('Menu', [
  ['line', { x1: '4', x2: '20', y1: '12', y2: '12', key: '1e0a9i' }],
  ['line', { x1: '4', x2: '20', y1: '6', y2: '6', key: '1owob3' }],
  ['line', { x1: '4', x2: '20', y1: '18', y2: '18', key: 'yk5zj1' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const sk = T('MessageSquare', [
  [
    'path',
    {
      d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      key: '1lielz',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const uk = T('Mic', [
  [
    'path',
    {
      d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z',
      key: '131961',
    },
  ],
  ['path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2', key: '1vc78b' }],
  ['line', { x1: '12', x2: '12', y1: '19', y2: '22', key: 'x3vr5v' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const ck = T('Monitor', [
  [
    'rect',
    { width: '20', height: '14', x: '2', y: '3', rx: '2', key: '48i651' },
  ],
  ['line', { x1: '8', x2: '16', y1: '21', y2: '21', key: '1svkeh' }],
  ['line', { x1: '12', x2: '12', y1: '17', y2: '21', key: 'vw1qmm' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const dk = T('Palette', [
  [
    'circle',
    { cx: '13.5', cy: '6.5', r: '.5', fill: 'currentColor', key: '1okk4w' },
  ],
  [
    'circle',
    { cx: '17.5', cy: '10.5', r: '.5', fill: 'currentColor', key: 'f64h9f' },
  ],
  [
    'circle',
    { cx: '8.5', cy: '7.5', r: '.5', fill: 'currentColor', key: 'fotxhn' },
  ],
  [
    'circle',
    { cx: '6.5', cy: '12.5', r: '.5', fill: 'currentColor', key: 'qy21gx' },
  ],
  [
    'path',
    {
      d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z',
      key: '12rzf8',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const fk = T('Phone', [
  [
    'path',
    {
      d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
      key: 'foiqr5',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const pk = T('Play', [
  ['polygon', { points: '6 3 20 12 6 21 6 3', key: '1oa8hb' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const mk = T('Plus', [
  ['path', { d: 'M5 12h14', key: '1ays0h' }],
  ['path', { d: 'M12 5v14', key: 's699le' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const vk = T('RefreshCw', [
  [
    'path',
    { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', key: 'v9h5vc' },
  ],
  ['path', { d: 'M21 3v5h-5', key: '1q7to0' }],
  [
    'path',
    { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', key: '3uifl3' },
  ],
  ['path', { d: 'M8 16H3v5', key: '1cv678' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const hk = T('Save', [
  [
    'path',
    {
      d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
      key: '1c8476',
    },
  ],
  ['path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7', key: '1ydtos' }],
  ['path', { d: 'M7 3v4a1 1 0 0 0 1 1h7', key: 't51u73' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const yk = T('Search', [
  ['circle', { cx: '11', cy: '11', r: '8', key: '4ej97u' }],
  ['path', { d: 'm21 21-4.3-4.3', key: '1qie3q' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const gk = T('Send', [
  [
    'path',
    {
      d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z',
      key: '1ffxy3',
    },
  ],
  ['path', { d: 'm21.854 2.147-10.94 10.939', key: '12cjpa' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const wk = T('Server', [
  [
    'rect',
    {
      width: '20',
      height: '8',
      x: '2',
      y: '2',
      rx: '2',
      ry: '2',
      key: 'ngkwjq',
    },
  ],
  [
    'rect',
    {
      width: '20',
      height: '8',
      x: '2',
      y: '14',
      rx: '2',
      ry: '2',
      key: 'iecqi9',
    },
  ],
  ['line', { x1: '6', x2: '6.01', y1: '6', y2: '6', key: '16zg32' }],
  ['line', { x1: '6', x2: '6.01', y1: '18', y2: '18', key: 'nzw8ys' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Sk = T('Settings', [
  [
    'path',
    {
      d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
      key: '1qme2f',
    },
  ],
  ['circle', { cx: '12', cy: '12', r: '3', key: '1v7zrd' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const xk = T('Shield', [
  [
    'path',
    {
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      key: 'oel41y',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ck = T('SquarePen', [
  [
    'path',
    {
      d: 'M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
      key: '1m0v6g',
    },
  ],
  [
    'path',
    {
      d: 'M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z',
      key: 'ohrbg2',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ek = T('Star', [
  [
    'polygon',
    {
      points:
        '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
      key: '8f66p6',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const kk = T('Terminal', [
  ['polyline', { points: '4 17 10 11 4 5', key: 'akl6gq' }],
  ['line', { x1: '12', x2: '20', y1: '19', y2: '19', key: 'q2wloq' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Pk = T('Trash2', [
  ['path', { d: 'M3 6h18', key: 'd0wm0j' }],
  ['path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6', key: '4alrt4' }],
  ['path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2', key: 'v07s0e' }],
  ['line', { x1: '10', x2: '10', y1: '11', y2: '17', key: '1uufr5' }],
  ['line', { x1: '14', x2: '14', y1: '11', y2: '17', key: 'xtxkd' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const _k = T('TrendingDown', [
  ['polyline', { points: '22 17 13.5 8.5 8.5 13.5 2 7', key: '1r2t7k' }],
  ['polyline', { points: '16 17 22 17 22 11', key: '11uiuu' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Rk = T('TrendingUp', [
  ['polyline', { points: '22 7 13.5 15.5 8.5 10.5 2 17', key: '126l90' }],
  ['polyline', { points: '16 7 22 7 22 13', key: 'kwv8wd' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Tk = T('TriangleAlert', [
  [
    'path',
    {
      d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
      key: 'wmoenq',
    },
  ],
  ['path', { d: 'M12 9v4', key: 'juzpu7' }],
  ['path', { d: 'M12 17h.01', key: 'p32p05' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Mk = T('Upload', [
  ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', key: 'ih7n3h' }],
  ['polyline', { points: '17 8 12 3 7 8', key: 't8dd8p' }],
  ['line', { x1: '12', x2: '12', y1: '3', y2: '15', key: 'widbto' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Nk = T('UserCog', [
  ['circle', { cx: '18', cy: '15', r: '3', key: 'gjjjvw' }],
  ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
  ['path', { d: 'M10 15H6a4 4 0 0 0-4 4v2', key: '1nfge6' }],
  ['path', { d: 'm21.7 16.4-.9-.3', key: '12j9ji' }],
  ['path', { d: 'm15.2 13.9-.9-.3', key: '1fdjdi' }],
  ['path', { d: 'm16.6 18.7.3-.9', key: 'heedtr' }],
  ['path', { d: 'm19.1 12.2.3-.9', key: '1af3ki' }],
  ['path', { d: 'm19.6 18.7-.4-1', key: '1x9vze' }],
  ['path', { d: 'm16.8 12.3-.4-1', key: 'vqeiwj' }],
  ['path', { d: 'm14.3 16.6 1-.4', key: '1qlj63' }],
  ['path', { d: 'm20.7 13.8 1-.4', key: '1v5t8k' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ak = T('UserPlus', [
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
  ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
  ['line', { x1: '19', x2: '19', y1: '8', y2: '14', key: '1bvyxn' }],
  ['line', { x1: '22', x2: '16', y1: '11', y2: '11', key: '1shjgl' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ik = T('User', [
  ['path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', key: '975kel' }],
  ['circle', { cx: '12', cy: '7', r: '4', key: '17ys0d' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Ok = T('Users', [
  ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', key: '1yyitq' }],
  ['circle', { cx: '9', cy: '7', r: '4', key: 'nufk8' }],
  ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87', key: 'kshegd' }],
  ['path', { d: 'M16 3.13a4 4 0 0 1 0 7.75', key: '1da9ce' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Dk = T('Volume2', [
  [
    'path',
    {
      d: 'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z',
      key: 'uqj9uw',
    },
  ],
  ['path', { d: 'M16 9a5 5 0 0 1 0 6', key: '1q6k2b' }],
  ['path', { d: 'M19.364 18.364a9 9 0 0 0 0-12.728', key: 'ijwkga' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const jk = T('Webhook', [
  [
    'path',
    {
      d: 'M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2',
      key: 'q3hayz',
    },
  ],
  [
    'path',
    {
      d: 'm6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06',
      key: '1go1hn',
    },
  ],
  [
    'path',
    {
      d: 'm12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8',
      key: 'qlwsc0',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Lk = T('Wifi', [
  ['path', { d: 'M12 20h.01', key: 'zekei9' }],
  ['path', { d: 'M2 8.82a15 15 0 0 1 20 0', key: 'dnpr2z' }],
  ['path', { d: 'M5 12.859a10 10 0 0 1 14 0', key: '1x1e6c' }],
  ['path', { d: 'M8.5 16.429a5 5 0 0 1 7 0', key: '1bycff' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const bk = T('Wrench', [
  [
    'path',
    {
      d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
      key: 'cbrjhi',
    },
  ],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const Fk = T('X', [
  ['path', { d: 'M18 6 6 18', key: '1bl5f8' }],
  ['path', { d: 'm6 6 12 12', key: 'd8bk6v' }],
]);
/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $k = T('Zap', [
  [
    'path',
    {
      d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
      key: '1xq2db',
    },
  ],
]);
var a2 = c.createContext(void 0),
  s2 = e => {
    const t = c.useContext(a2);
    if (!t)
      throw new Error('No QueryClient set, use QueryClientProvider to set one');
    return t;
  },
  fm = c.createContext(!1),
  u2 = () => c.useContext(fm);
fm.Provider;
function c2() {
  let e = !1;
  return {
    clearReset: () => {
      e = !1;
    },
    reset: () => {
      e = !0;
    },
    isReset: () => e,
  };
}
var d2 = c.createContext(c2()),
  f2 = () => c.useContext(d2),
  p2 = (e, t) => {
    (e.suspense || e.throwOnError || e.experimental_prefetchInRender) &&
      (t.isReset() || (e.retryOnMount = !1));
  },
  m2 = e => {
    c.useEffect(() => {
      e.clearReset();
    }, [e]);
  },
  v2 = ({
    result: e,
    errorResetBoundary: t,
    throwOnError: n,
    query: r,
    suspense: o,
  }) =>
    e.isError &&
    !t.isReset() &&
    !e.isFetching &&
    r &&
    ((o && e.data === void 0) || S1(n, [e.error, r])),
  h2 = e => {
    const t = e.staleTime;
    e.suspense &&
      ((e.staleTime =
        typeof t == 'function'
          ? (...n) => Math.max(t(...n), 1e3)
          : Math.max(t ?? 1e3, 1e3)),
      typeof e.gcTime == 'number' && (e.gcTime = Math.max(e.gcTime, 1e3)));
  },
  y2 = (e, t) => e.isLoading && e.isFetching && !t,
  g2 = (e, t) => e?.suspense && t.isPending,
  ad = (e, t, n) =>
    t.fetchOptimistic(e).catch(() => {
      n.clearReset();
    });
function w2(e, t, n) {
  const r = s2(),
    o = u2(),
    i = f2(),
    l = r.defaultQueryOptions(e);
  (r.getDefaultOptions().queries?._experimental_beforeQuery?.(l),
    (l._optimisticResults = o ? 'isRestoring' : 'optimistic'),
    h2(l),
    p2(l, i),
    m2(i));
  const a = !r.getQueryCache().get(l.queryHash),
    [s] = c.useState(() => new t(r, l)),
    u = s.getOptimisticResult(l),
    f = !o && e.subscribed !== !1;
  if (
    (c.useSyncExternalStore(
      c.useCallback(
        m => {
          const y = f ? s.subscribe(x1.batchCalls(m)) : Hu;
          return (s.updateResult(), y);
        },
        [s, f]
      ),
      () => s.getCurrentResult(),
      () => s.getCurrentResult()
    ),
    c.useEffect(() => {
      s.setOptions(l);
    }, [l, s]),
    g2(l, u))
  )
    throw ad(l, s, i);
  if (
    v2({
      result: u,
      errorResetBoundary: i,
      throwOnError: l.throwOnError,
      query: r.getQueryCache().get(l.queryHash),
      suspense: l.suspense,
    })
  )
    throw u.error;
  return (
    r.getDefaultOptions().queries?._experimental_afterQuery?.(l, u),
    l.experimental_prefetchInRender &&
      !C1 &&
      y2(u, o) &&
      (a ? ad(l, s, i) : r.getQueryCache().get(l.queryHash)?.promise)
        ?.catch(Hu)
        .finally(() => {
          s.updateResult();
        }),
    l.notifyOnChangeProps ? u : s.trackResult(u)
  );
}
function zk(e, t) {
  return w2(e, E1);
}
var pm = {
    color: void 0,
    size: void 0,
    className: void 0,
    style: void 0,
    attr: void 0,
  },
  sd = Ee.createContext && Ee.createContext(pm),
  S2 = ['attr', 'size', 'title'];
function x2(e, t) {
  if (e == null) return {};
  var n = C2(e, t),
    r,
    o;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (o = 0; o < i.length; o++)
      ((r = i[o]),
        !(t.indexOf(r) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(e, r) &&
          (n[r] = e[r]));
  }
  return n;
}
function C2(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if (Object.prototype.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) >= 0) continue;
      n[r] = e[r];
    }
  return n;
}
function Si() {
  return (
    (Si = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Si.apply(this, arguments)
  );
}
function ud(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function xi(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? ud(Object(n), !0).forEach(function (r) {
          E2(e, r, n[r]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : ud(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
          });
  }
  return e;
}
function E2(e, t, n) {
  return (
    (t = k2(t)),
    t in e
      ? Object.defineProperty(e, t, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[t] = n),
    e
  );
}
function k2(e) {
  var t = P2(e, 'string');
  return typeof t == 'symbol' ? t : t + '';
}
function P2(e, t) {
  if (typeof e != 'object' || !e) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (typeof r != 'object') return r;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function mm(e) {
  return (
    e &&
    e.map((t, n) =>
      Ee.createElement(t.tag, xi({ key: n }, t.attr), mm(t.child))
    )
  );
}
function Ot(e) {
  return t =>
    Ee.createElement(_2, Si({ attr: xi({}, e.attr) }, t), mm(e.child));
}
function _2(e) {
  var t = n => {
    var { attr: r, size: o, title: i } = e,
      l = x2(e, S2),
      a = o || n.size || '1em',
      s;
    return (
      n.className && (s = n.className),
      e.className && (s = (s ? s + ' ' : '') + e.className),
      Ee.createElement(
        'svg',
        Si(
          { stroke: 'currentColor', fill: 'currentColor', strokeWidth: '0' },
          n.attr,
          r,
          l,
          {
            className: s,
            style: xi(xi({ color: e.color || n.color }, n.style), e.style),
            height: a,
            width: a,
            xmlns: 'http://www.w3.org/2000/svg',
          }
        ),
        i && Ee.createElement('title', null, i),
        e.children
      )
    );
  };
  return sd !== void 0 ? Ee.createElement(sd.Consumer, null, n => t(n)) : t(pm);
}
function Bk(e) {
  return Ot({
    attr: { viewBox: '0 0 640 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M176 256c44.11 0 80-35.89 80-80s-35.89-80-80-80-80 35.89-80 80 35.89 80 80 80zm352-128H304c-8.84 0-16 7.16-16 16v144H64V80c0-8.84-7.16-16-16-16H16C7.16 64 0 71.16 0 80v352c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-48h512v48c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V240c0-61.86-50.14-112-112-112z',
        },
        child: [],
      },
    ],
  })(e);
}
function Uk(e) {
  return Ot({
    attr: { viewBox: '0 0 512 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M288 130.54V112h16c8.84 0 16-7.16 16-16V80c0-8.84-7.16-16-16-16h-96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h16v18.54C115.49 146.11 32 239.18 32 352h448c0-112.82-83.49-205.89-192-221.46zM496 384H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h480c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z',
        },
        child: [],
      },
    ],
  })(e);
}
function Vk(e) {
  return Ot({
    attr: { viewBox: '0 0 512 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M502.05 57.6C523.3 36.34 508.25 0 478.2 0H33.8C3.75 0-11.3 36.34 9.95 57.6L224 271.64V464h-56c-22.09 0-40 17.91-40 40 0 4.42 3.58 8 8 8h240c4.42 0 8-3.58 8-8 0-22.09-17.91-40-40-40h-56V271.64L502.05 57.6z',
        },
        child: [],
      },
    ],
  })(e);
}
function Hk(e) {
  return Ot({
    attr: { viewBox: '0 0 576 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M288 0c-69.59 0-126 56.41-126 126 0 56.26 82.35 158.8 113.9 196.02 6.39 7.54 17.82 7.54 24.2 0C331.65 284.8 414 182.26 414 126 414 56.41 357.59 0 288 0zm0 168c-23.2 0-42-18.8-42-42s18.8-42 42-42 42 18.8 42 42-18.8 42-42 42zM20.12 215.95A32.006 32.006 0 0 0 0 245.66v250.32c0 11.32 11.43 19.06 21.94 14.86L160 448V214.92c-8.84-15.98-16.07-31.54-21.25-46.42L20.12 215.95zM288 359.67c-14.07 0-27.38-6.18-36.51-16.96-19.66-23.2-40.57-49.62-59.49-76.72v182l192 64V266c-18.92 27.09-39.82 53.52-59.49 76.72-9.13 10.77-22.44 16.95-36.51 16.95zm266.06-198.51L416 224v288l139.88-55.95A31.996 31.996 0 0 0 576 426.34V176.02c0-11.32-11.43-19.06-21.94-14.86z',
        },
        child: [],
      },
    ],
  })(e);
}
function Wk(e) {
  return Ot({
    attr: { viewBox: '0 0 512 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z',
        },
        child: [],
      },
    ],
  })(e);
}
function Kk(e) {
  return Ot({
    attr: { viewBox: '0 0 576 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M568.25 192c-29.04.13-135.01 6.16-213.84 83-33.12 29.63-53.36 63.3-66.41 94.86-13.05-31.56-33.29-65.23-66.41-94.86-78.83-76.84-184.8-82.87-213.84-83-4.41-.02-7.79 3.4-7.75 7.82.23 27.92 7.14 126.14 88.77 199.3C172.79 480.94 256 480 288 480s115.19.95 199.23-80.88c81.64-73.17 88.54-171.38 88.77-199.3.04-4.42-3.34-7.84-7.75-7.82zM287.98 302.6c12.82-18.85 27.6-35.78 44.09-50.52 19.09-18.61 39.58-33.3 60.26-45.18-16.44-70.5-51.72-133.05-96.73-172.22-4.11-3.58-11.02-3.58-15.14 0-44.99 39.14-80.27 101.63-96.74 172.07 20.37 11.7 40.5 26.14 59.22 44.39a282.768 282.768 0 0 1 45.04 51.46z',
        },
        child: [],
      },
    ],
  })(e);
}
function Gk(e) {
  return Ot({
    attr: { viewBox: '0 0 640 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M624 416h-16c-26.04 0-45.8-8.42-56.09-17.9-8.9-8.21-19.66-14.1-31.77-14.1h-16.3c-12.11 0-22.87 5.89-31.77 14.1C461.8 407.58 442.04 416 416 416s-45.8-8.42-56.09-17.9c-8.9-8.21-19.66-14.1-31.77-14.1h-16.3c-12.11 0-22.87 5.89-31.77 14.1C269.8 407.58 250.04 416 224 416s-45.8-8.42-56.09-17.9c-8.9-8.21-19.66-14.1-31.77-14.1h-16.3c-12.11 0-22.87 5.89-31.77 14.1C77.8 407.58 58.04 416 32 416H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h16c38.62 0 72.72-12.19 96-31.84 23.28 19.66 57.38 31.84 96 31.84s72.72-12.19 96-31.84c23.28 19.66 57.38 31.84 96 31.84s72.72-12.19 96-31.84c23.28 19.66 57.38 31.84 96 31.84h16c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm-400-32v-96h192v96c19.12 0 30.86-6.16 34.39-9.42 9.17-8.46 19.2-14.34 29.61-18.07V128c0-17.64 14.36-32 32-32s32 14.36 32 32v16c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-16c0-52.94-43.06-96-96-96s-96 43.06-96 96v96H224v-96c0-17.64 14.36-32 32-32s32 14.36 32 32v16c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-16c0-52.94-43.06-96-96-96s-96 43.06-96 96v228.5c10.41 3.73 20.44 9.62 29.61 18.07 3.53 3.27 15.27 9.43 34.39 9.43z',
        },
        child: [],
      },
    ],
  })(e);
}
function Qk(e) {
  return Ot({
    attr: { viewBox: '0 0 512 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M462 241.64l-22-84.84c-9.6-35.2-41.6-60.8-76.8-60.8H352V64c0-17.67-14.33-32-32-32H192c-17.67 0-32 14.33-32 32v32h-11.2c-35.2 0-67.2 25.6-76.8 60.8l-22 84.84C21.41 248.04 0 273.47 0 304v48c0 23.63 12.95 44.04 32 55.12V448c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-40.88c19.05-11.09 32-31.5 32-55.12v-48c0-30.53-21.41-55.96-50-62.36zM96 352c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm20.55-112l17.2-66.36c2.23-8.16 9.59-13.64 15.06-13.64h214.4c5.47 0 12.83 5.48 14.85 12.86L395.45 240h-278.9zM416 352c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z',
        },
        child: [],
      },
    ],
  })(e);
}
function Yk(e) {
  return Ot({
    attr: { viewBox: '0 0 416 512' },
    child: [
      {
        tag: 'path',
        attr: {
          d: 'M207.9 15.2c.8 4.7 16.1 94.5 16.1 128.8 0 52.3-27.8 89.6-68.9 104.6L168 486.7c.7 13.7-10.2 25.3-24 25.3H80c-13.7 0-24.7-11.5-24-25.3l12.9-238.1C27.7 233.6 0 196.2 0 144 0 109.6 15.3 19.9 16.1 15.2 19.3-5.1 61.4-5.4 64 16.3v141.2c1.3 3.4 15.1 3.2 16 0 1.4-25.3 7.9-139.2 8-141.8 3.3-20.8 44.7-20.8 47.9 0 .2 2.7 6.6 116.5 8 141.8.9 3.2 14.8 3.4 16 0V16.3c2.6-21.6 44.8-21.4 48-1.1zm119.2 285.7l-15 185.1c-1.2 14 9.9 26 23.9 26h56c13.3 0 24-10.7 24-24V24c0-13.2-10.7-24-24-24-82.5 0-221.4 178.5-64.9 300.9z',
        },
        child: [],
      },
    ],
  })(e);
}
var vm = { exports: {} },
  K = {};
/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Su = Symbol.for('react.element'),
  xu = Symbol.for('react.portal'),
  Yi = Symbol.for('react.fragment'),
  Xi = Symbol.for('react.strict_mode'),
  qi = Symbol.for('react.profiler'),
  Zi = Symbol.for('react.provider'),
  Ji = Symbol.for('react.context'),
  R2 = Symbol.for('react.server_context'),
  el = Symbol.for('react.forward_ref'),
  tl = Symbol.for('react.suspense'),
  nl = Symbol.for('react.suspense_list'),
  rl = Symbol.for('react.memo'),
  ol = Symbol.for('react.lazy'),
  T2 = Symbol.for('react.offscreen'),
  hm;
hm = Symbol.for('react.module.reference');
function rt(e) {
  if (typeof e == 'object' && e !== null) {
    var t = e.$$typeof;
    switch (t) {
      case Su:
        switch (((e = e.type), e)) {
          case Yi:
          case qi:
          case Xi:
          case tl:
          case nl:
            return e;
          default:
            switch (((e = e && e.$$typeof), e)) {
              case R2:
              case Ji:
              case el:
              case ol:
              case rl:
              case Zi:
                return e;
              default:
                return t;
            }
        }
      case xu:
        return t;
    }
  }
}
K.ContextConsumer = Ji;
K.ContextProvider = Zi;
K.Element = Su;
K.ForwardRef = el;
K.Fragment = Yi;
K.Lazy = ol;
K.Memo = rl;
K.Portal = xu;
K.Profiler = qi;
K.StrictMode = Xi;
K.Suspense = tl;
K.SuspenseList = nl;
K.isAsyncMode = function () {
  return !1;
};
K.isConcurrentMode = function () {
  return !1;
};
K.isContextConsumer = function (e) {
  return rt(e) === Ji;
};
K.isContextProvider = function (e) {
  return rt(e) === Zi;
};
K.isElement = function (e) {
  return typeof e == 'object' && e !== null && e.$$typeof === Su;
};
K.isForwardRef = function (e) {
  return rt(e) === el;
};
K.isFragment = function (e) {
  return rt(e) === Yi;
};
K.isLazy = function (e) {
  return rt(e) === ol;
};
K.isMemo = function (e) {
  return rt(e) === rl;
};
K.isPortal = function (e) {
  return rt(e) === xu;
};
K.isProfiler = function (e) {
  return rt(e) === qi;
};
K.isStrictMode = function (e) {
  return rt(e) === Xi;
};
K.isSuspense = function (e) {
  return rt(e) === tl;
};
K.isSuspenseList = function (e) {
  return rt(e) === nl;
};
K.isValidElementType = function (e) {
  return (
    typeof e == 'string' ||
    typeof e == 'function' ||
    e === Yi ||
    e === qi ||
    e === Xi ||
    e === tl ||
    e === nl ||
    e === T2 ||
    (typeof e == 'object' &&
      e !== null &&
      (e.$$typeof === ol ||
        e.$$typeof === rl ||
        e.$$typeof === Zi ||
        e.$$typeof === Ji ||
        e.$$typeof === el ||
        e.$$typeof === hm ||
        e.getModuleId !== void 0))
  );
};
K.typeOf = rt;
vm.exports = K;
var Xk = vm.exports;
function M2(e) {
  typeof requestAnimationFrame < 'u' && requestAnimationFrame(e);
}
function cd(e) {
  var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
    n = -1,
    r = function o(i) {
      (n < 0 && (n = i), i - n > t ? (e(i), (n = -1)) : M2(o));
    };
  requestAnimationFrame(r);
}
function ts(e) {
  '@babel/helpers - typeof';
  return (
    (ts =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t &&
              typeof Symbol == 'function' &&
              t.constructor === Symbol &&
              t !== Symbol.prototype
              ? 'symbol'
              : typeof t;
          }),
    ts(e)
  );
}
function N2(e) {
  return D2(e) || O2(e) || I2(e) || A2();
}
function A2() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function I2(e, t) {
  if (e) {
    if (typeof e == 'string') return dd(e, t);
    var n = Object.prototype.toString.call(e).slice(8, -1);
    if (
      (n === 'Object' && e.constructor && (n = e.constructor.name),
      n === 'Map' || n === 'Set')
    )
      return Array.from(e);
    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return dd(e, t);
  }
}
function dd(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function O2(e) {
  if (
    (typeof Symbol < 'u' && e[Symbol.iterator] != null) ||
    e['@@iterator'] != null
  )
    return Array.from(e);
}
function D2(e) {
  if (Array.isArray(e)) return e;
}
function j2() {
  var e = {},
    t = function () {
      return null;
    },
    n = !1,
    r = function o(i) {
      if (!n) {
        if (Array.isArray(i)) {
          if (!i.length) return;
          var l = i,
            a = N2(l),
            s = a[0],
            u = a.slice(1);
          if (typeof s == 'number') {
            cd(o.bind(null, u), s);
            return;
          }
          (o(s), cd(o.bind(null, u)));
          return;
        }
        (ts(i) === 'object' && ((e = i), t(e)), typeof i == 'function' && i());
      }
    };
  return {
    stop: function () {
      n = !0;
    },
    start: function (i) {
      ((n = !1), r(i));
    },
    subscribe: function (i) {
      return (
        (t = i),
        function () {
          t = function () {
            return null;
          };
        }
      );
    },
  };
}
function Zr(e) {
  '@babel/helpers - typeof';
  return (
    (Zr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t &&
              typeof Symbol == 'function' &&
              t.constructor === Symbol &&
              t !== Symbol.prototype
              ? 'symbol'
              : typeof t;
          }),
    Zr(e)
  );
}
function fd(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function pd(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? fd(Object(n), !0).forEach(function (r) {
          ym(e, r, n[r]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : fd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
          });
  }
  return e;
}
function ym(e, t, n) {
  return (
    (t = L2(t)),
    t in e
      ? Object.defineProperty(e, t, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[t] = n),
    e
  );
}
function L2(e) {
  var t = b2(e, 'string');
  return Zr(t) === 'symbol' ? t : String(t);
}
function b2(e, t) {
  if (Zr(e) !== 'object' || e === null) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Zr(r) !== 'object') return r;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
var F2 = function (t, n) {
    return [Object.keys(t), Object.keys(n)].reduce(function (r, o) {
      return r.filter(function (i) {
        return o.includes(i);
      });
    });
  },
  $2 = function (t) {
    return t;
  },
  z2 = function (t) {
    return t.replace(/([A-Z])/g, function (n) {
      return '-'.concat(n.toLowerCase());
    });
  },
  Dr = function (t, n) {
    return Object.keys(n).reduce(function (r, o) {
      return pd(pd({}, r), {}, ym({}, o, t(o, n[o])));
    }, {});
  },
  md = function (t, n, r) {
    return t
      .map(function (o) {
        return ''.concat(z2(o), ' ').concat(n, 'ms ').concat(r);
      })
      .join(',');
  };
function B2(e, t) {
  return H2(e) || V2(e, t) || gm(e, t) || U2();
}
function U2() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function V2(e, t) {
  var n =
    e == null
      ? null
      : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (n != null) {
    var r,
      o,
      i,
      l,
      a = [],
      s = !0,
      u = !1;
    try {
      if (((i = (n = n.call(e)).next), t !== 0))
        for (
          ;
          !(s = (r = i.call(n)).done) && (a.push(r.value), a.length !== t);
          s = !0
        );
    } catch (f) {
      ((u = !0), (o = f));
    } finally {
      try {
        if (!s && n.return != null && ((l = n.return()), Object(l) !== l))
          return;
      } finally {
        if (u) throw o;
      }
    }
    return a;
  }
}
function H2(e) {
  if (Array.isArray(e)) return e;
}
function W2(e) {
  return Q2(e) || G2(e) || gm(e) || K2();
}
function K2() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function gm(e, t) {
  if (e) {
    if (typeof e == 'string') return ns(e, t);
    var n = Object.prototype.toString.call(e).slice(8, -1);
    if (
      (n === 'Object' && e.constructor && (n = e.constructor.name),
      n === 'Map' || n === 'Set')
    )
      return Array.from(e);
    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return ns(e, t);
  }
}
function G2(e) {
  if (
    (typeof Symbol < 'u' && e[Symbol.iterator] != null) ||
    e['@@iterator'] != null
  )
    return Array.from(e);
}
function Q2(e) {
  if (Array.isArray(e)) return ns(e);
}
function ns(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
  return r;
}
var Ci = 1e-4,
  wm = function (t, n) {
    return [0, 3 * t, 3 * n - 6 * t, 3 * t - 3 * n + 1];
  },
  Sm = function (t, n) {
    return t
      .map(function (r, o) {
        return r * Math.pow(n, o);
      })
      .reduce(function (r, o) {
        return r + o;
      });
  },
  vd = function (t, n) {
    return function (r) {
      var o = wm(t, n);
      return Sm(o, r);
    };
  },
  Y2 = function (t, n) {
    return function (r) {
      var o = wm(t, n),
        i = [].concat(
          W2(
            o
              .map(function (l, a) {
                return l * a;
              })
              .slice(1)
          ),
          [0]
        );
      return Sm(i, r);
    };
  },
  hd = function () {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
      n[r] = arguments[r];
    var o = n[0],
      i = n[1],
      l = n[2],
      a = n[3];
    if (n.length === 1)
      switch (n[0]) {
        case 'linear':
          ((o = 0), (i = 0), (l = 1), (a = 1));
          break;
        case 'ease':
          ((o = 0.25), (i = 0.1), (l = 0.25), (a = 1));
          break;
        case 'ease-in':
          ((o = 0.42), (i = 0), (l = 1), (a = 1));
          break;
        case 'ease-out':
          ((o = 0.42), (i = 0), (l = 0.58), (a = 1));
          break;
        case 'ease-in-out':
          ((o = 0), (i = 0), (l = 0.58), (a = 1));
          break;
        default: {
          var s = n[0].split('(');
          if (
            s[0] === 'cubic-bezier' &&
            s[1].split(')')[0].split(',').length === 4
          ) {
            var u = s[1]
                .split(')')[0]
                .split(',')
                .map(function (w) {
                  return parseFloat(w);
                }),
              f = B2(u, 4);
            ((o = f[0]), (i = f[1]), (l = f[2]), (a = f[3]));
          }
        }
      }
    var m = vd(o, l),
      y = vd(i, a),
      S = Y2(o, l),
      C = function (p) {
        return p > 1 ? 1 : p < 0 ? 0 : p;
      },
      h = function (p) {
        for (var d = p > 1 ? 1 : p, v = d, x = 0; x < 8; ++x) {
          var E = m(v) - d,
            P = S(v);
          if (Math.abs(E - d) < Ci || P < Ci) return y(v);
          v = C(v - E / P);
        }
        return y(v);
      };
    return ((h.isStepper = !1), h);
  },
  X2 = function () {
    var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {},
      n = t.stiff,
      r = n === void 0 ? 100 : n,
      o = t.damping,
      i = o === void 0 ? 8 : o,
      l = t.dt,
      a = l === void 0 ? 17 : l,
      s = function (f, m, y) {
        var S = -(f - m) * r,
          C = y * i,
          h = y + ((S - C) * a) / 1e3,
          w = (y * a) / 1e3 + f;
        return Math.abs(w - m) < Ci && Math.abs(h) < Ci ? [m, 0] : [w, h];
      };
    return ((s.isStepper = !0), (s.dt = a), s);
  },
  q2 = function () {
    for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
      n[r] = arguments[r];
    var o = n[0];
    if (typeof o == 'string')
      switch (o) {
        case 'ease':
        case 'ease-in-out':
        case 'ease-out':
        case 'ease-in':
        case 'linear':
          return hd(o);
        case 'spring':
          return X2();
        default:
          if (o.split('(')[0] === 'cubic-bezier') return hd(o);
      }
    return typeof o == 'function' ? o : null;
  };
function Jr(e) {
  '@babel/helpers - typeof';
  return (
    (Jr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t &&
              typeof Symbol == 'function' &&
              t.constructor === Symbol &&
              t !== Symbol.prototype
              ? 'symbol'
              : typeof t;
          }),
    Jr(e)
  );
}
function yd(e) {
  return ew(e) || J2(e) || xm(e) || Z2();
}
function Z2() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function J2(e) {
  if (
    (typeof Symbol < 'u' && e[Symbol.iterator] != null) ||
    e['@@iterator'] != null
  )
    return Array.from(e);
}
function ew(e) {
  if (Array.isArray(e)) return os(e);
}
function gd(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function ye(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? gd(Object(n), !0).forEach(function (r) {
          rs(e, r, n[r]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : gd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
          });
  }
  return e;
}
function rs(e, t, n) {
  return (
    (t = tw(t)),
    t in e
      ? Object.defineProperty(e, t, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[t] = n),
    e
  );
}
function tw(e) {
  var t = nw(e, 'string');
  return Jr(t) === 'symbol' ? t : String(t);
}
function nw(e, t) {
  if (Jr(e) !== 'object' || e === null) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (Jr(r) !== 'object') return r;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function rw(e, t) {
  return lw(e) || iw(e, t) || xm(e, t) || ow();
}
function ow() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function xm(e, t) {
  if (e) {
    if (typeof e == 'string') return os(e, t);
    var n = Object.prototype.toString.call(e).slice(8, -1);
    if (
      (n === 'Object' && e.constructor && (n = e.constructor.name),
      n === 'Map' || n === 'Set')
    )
      return Array.from(e);
    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return os(e, t);
  }
}
function os(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function iw(e, t) {
  var n =
    e == null
      ? null
      : (typeof Symbol < 'u' && e[Symbol.iterator]) || e['@@iterator'];
  if (n != null) {
    var r,
      o,
      i,
      l,
      a = [],
      s = !0,
      u = !1;
    try {
      if (((i = (n = n.call(e)).next), t !== 0))
        for (
          ;
          !(s = (r = i.call(n)).done) && (a.push(r.value), a.length !== t);
          s = !0
        );
    } catch (f) {
      ((u = !0), (o = f));
    } finally {
      try {
        if (!s && n.return != null && ((l = n.return()), Object(l) !== l))
          return;
      } finally {
        if (u) throw o;
      }
    }
    return a;
  }
}
function lw(e) {
  if (Array.isArray(e)) return e;
}
var Ei = function (t, n, r) {
    return t + (n - t) * r;
  },
  is = function (t) {
    var n = t.from,
      r = t.to;
    return n !== r;
  },
  aw = function e(t, n, r) {
    var o = Dr(function (i, l) {
      if (is(l)) {
        var a = t(l.from, l.to, l.velocity),
          s = rw(a, 2),
          u = s[0],
          f = s[1];
        return ye(ye({}, l), {}, { from: u, velocity: f });
      }
      return l;
    }, n);
    return r < 1
      ? Dr(function (i, l) {
          return is(l)
            ? ye(
                ye({}, l),
                {},
                {
                  velocity: Ei(l.velocity, o[i].velocity, r),
                  from: Ei(l.from, o[i].from, r),
                }
              )
            : l;
        }, n)
      : e(t, o, r - 1);
  };
const sw = function (e, t, n, r, o) {
  var i = F2(e, t),
    l = i.reduce(function (w, p) {
      return ye(ye({}, w), {}, rs({}, p, [e[p], t[p]]));
    }, {}),
    a = i.reduce(function (w, p) {
      return ye(
        ye({}, w),
        {},
        rs({}, p, { from: e[p], velocity: 0, to: t[p] })
      );
    }, {}),
    s = -1,
    u,
    f,
    m = function () {
      return null;
    },
    y = function () {
      return Dr(function (p, d) {
        return d.from;
      }, a);
    },
    S = function () {
      return !Object.values(a).filter(is).length;
    },
    C = function (p) {
      u || (u = p);
      var d = p - u,
        v = d / n.dt;
      ((a = aw(n, a, v)),
        o(ye(ye(ye({}, e), t), y())),
        (u = p),
        S() || (s = requestAnimationFrame(m)));
    },
    h = function (p) {
      f || (f = p);
      var d = (p - f) / r,
        v = Dr(function (E, P) {
          return Ei.apply(void 0, yd(P).concat([n(d)]));
        }, l);
      if ((o(ye(ye(ye({}, e), t), v)), d < 1)) s = requestAnimationFrame(m);
      else {
        var x = Dr(function (E, P) {
          return Ei.apply(void 0, yd(P).concat([n(1)]));
        }, l);
        o(ye(ye(ye({}, e), t), x));
      }
    };
  return (
    (m = n.isStepper ? C : h),
    function () {
      return (
        requestAnimationFrame(m),
        function () {
          cancelAnimationFrame(s);
        }
      );
    }
  );
};
function ir(e) {
  '@babel/helpers - typeof';
  return (
    (ir =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t &&
              typeof Symbol == 'function' &&
              t.constructor === Symbol &&
              t !== Symbol.prototype
              ? 'symbol'
              : typeof t;
          }),
    ir(e)
  );
}
var uw = [
  'children',
  'begin',
  'duration',
  'attributeName',
  'easing',
  'isActive',
  'steps',
  'from',
  'to',
  'canBegin',
  'onAnimationEnd',
  'shouldReAnimate',
  'onAnimationReStart',
];
function cw(e, t) {
  if (e == null) return {};
  var n = dw(e, t),
    r,
    o;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (o = 0; o < i.length; o++)
      ((r = i[o]),
        !(t.indexOf(r) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(e, r) &&
          (n[r] = e[r]));
  }
  return n;
}
function dw(e, t) {
  if (e == null) return {};
  var n = {},
    r = Object.keys(e),
    o,
    i;
  for (i = 0; i < r.length; i++)
    ((o = r[i]), !(t.indexOf(o) >= 0) && (n[o] = e[o]));
  return n;
}
function ql(e) {
  return vw(e) || mw(e) || pw(e) || fw();
}
function fw() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pw(e, t) {
  if (e) {
    if (typeof e == 'string') return ls(e, t);
    var n = Object.prototype.toString.call(e).slice(8, -1);
    if (
      (n === 'Object' && e.constructor && (n = e.constructor.name),
      n === 'Map' || n === 'Set')
    )
      return Array.from(e);
    if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return ls(e, t);
  }
}
function mw(e) {
  if (
    (typeof Symbol < 'u' && e[Symbol.iterator] != null) ||
    e['@@iterator'] != null
  )
    return Array.from(e);
}
function vw(e) {
  if (Array.isArray(e)) return ls(e);
}
function ls(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
  return r;
}
function wd(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    (t &&
      (r = r.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable;
      })),
      n.push.apply(n, r));
  }
  return n;
}
function it(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? wd(Object(n), !0).forEach(function (r) {
          Cr(e, r, n[r]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
        : wd(Object(n)).forEach(function (r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
          });
  }
  return e;
}
function Cr(e, t, n) {
  return (
    (t = Cm(t)),
    t in e
      ? Object.defineProperty(e, t, {
          value: n,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[t] = n),
    e
  );
}
function hw(e, t) {
  if (!(e instanceof t))
    throw new TypeError('Cannot call a class as a function');
}
function yw(e, t) {
  for (var n = 0; n < t.length; n++) {
    var r = t[n];
    ((r.enumerable = r.enumerable || !1),
      (r.configurable = !0),
      'value' in r && (r.writable = !0),
      Object.defineProperty(e, Cm(r.key), r));
  }
}
function gw(e, t, n) {
  return (
    t && yw(e.prototype, t),
    Object.defineProperty(e, 'prototype', { writable: !1 }),
    e
  );
}
function Cm(e) {
  var t = ww(e, 'string');
  return ir(t) === 'symbol' ? t : String(t);
}
function ww(e, t) {
  if (ir(e) !== 'object' || e === null) return e;
  var n = e[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(e, t);
    if (ir(r) !== 'object') return r;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (t === 'string' ? String : Number)(e);
}
function Sw(e, t) {
  if (typeof t != 'function' && t !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((e.prototype = Object.create(t && t.prototype, {
    constructor: { value: e, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(e, 'prototype', { writable: !1 }),
    t && as(e, t));
}
function as(e, t) {
  return (
    (as = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (r, o) {
          return ((r.__proto__ = o), r);
        }),
    as(e, t)
  );
}
function xw(e) {
  var t = Cw();
  return function () {
    var r = ki(e),
      o;
    if (t) {
      var i = ki(this).constructor;
      o = Reflect.construct(r, arguments, i);
    } else o = r.apply(this, arguments);
    return ss(this, o);
  };
}
function ss(e, t) {
  if (t && (ir(t) === 'object' || typeof t == 'function')) return t;
  if (t !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return us(e);
}
function us(e) {
  if (e === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return e;
}
function Cw() {
  if (typeof Reflect > 'u' || !Reflect.construct || Reflect.construct.sham)
    return !1;
  if (typeof Proxy == 'function') return !0;
  try {
    return (
      Boolean.prototype.valueOf.call(
        Reflect.construct(Boolean, [], function () {})
      ),
      !0
    );
  } catch {
    return !1;
  }
}
function ki(e) {
  return (
    (ki = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (n) {
          return n.__proto__ || Object.getPrototypeOf(n);
        }),
    ki(e)
  );
}
var Cu = (function (e) {
  Sw(n, e);
  var t = xw(n);
  function n(r, o) {
    var i;
    (hw(this, n), (i = t.call(this, r, o)));
    var l = i.props,
      a = l.isActive,
      s = l.attributeName,
      u = l.from,
      f = l.to,
      m = l.steps,
      y = l.children,
      S = l.duration;
    if (
      ((i.handleStyleChange = i.handleStyleChange.bind(us(i))),
      (i.changeStyle = i.changeStyle.bind(us(i))),
      !a || S <= 0)
    )
      return (
        (i.state = { style: {} }),
        typeof y == 'function' && (i.state = { style: f }),
        ss(i)
      );
    if (m && m.length) i.state = { style: m[0].style };
    else if (u) {
      if (typeof y == 'function') return ((i.state = { style: u }), ss(i));
      i.state = { style: s ? Cr({}, s, u) : u };
    } else i.state = { style: {} };
    return i;
  }
  return (
    gw(n, [
      {
        key: 'componentDidMount',
        value: function () {
          var o = this.props,
            i = o.isActive,
            l = o.canBegin;
          ((this.mounted = !0), !(!i || !l) && this.runAnimation(this.props));
        },
      },
      {
        key: 'componentDidUpdate',
        value: function (o) {
          var i = this.props,
            l = i.isActive,
            a = i.canBegin,
            s = i.attributeName,
            u = i.shouldReAnimate,
            f = i.to,
            m = i.from,
            y = this.state.style;
          if (a) {
            if (!l) {
              var S = { style: s ? Cr({}, s, f) : f };
              this.state &&
                y &&
                ((s && y[s] !== f) || (!s && y !== f)) &&
                this.setState(S);
              return;
            }
            if (!(k1(o.to, f) && o.canBegin && o.isActive)) {
              var C = !o.canBegin || !o.isActive;
              (this.manager && this.manager.stop(),
                this.stopJSAnimation && this.stopJSAnimation());
              var h = C || u ? m : o.to;
              if (this.state && y) {
                var w = { style: s ? Cr({}, s, h) : h };
                ((s && y[s] !== h) || (!s && y !== h)) && this.setState(w);
              }
              this.runAnimation(
                it(it({}, this.props), {}, { from: h, begin: 0 })
              );
            }
          }
        },
      },
      {
        key: 'componentWillUnmount',
        value: function () {
          this.mounted = !1;
          var o = this.props.onAnimationEnd;
          (this.unSubscribe && this.unSubscribe(),
            this.manager && (this.manager.stop(), (this.manager = null)),
            this.stopJSAnimation && this.stopJSAnimation(),
            o && o());
        },
      },
      {
        key: 'handleStyleChange',
        value: function (o) {
          this.changeStyle(o);
        },
      },
      {
        key: 'changeStyle',
        value: function (o) {
          this.mounted && this.setState({ style: o });
        },
      },
      {
        key: 'runJSAnimation',
        value: function (o) {
          var i = this,
            l = o.from,
            a = o.to,
            s = o.duration,
            u = o.easing,
            f = o.begin,
            m = o.onAnimationEnd,
            y = o.onAnimationStart,
            S = sw(l, a, q2(u), s, this.changeStyle),
            C = function () {
              i.stopJSAnimation = S();
            };
          this.manager.start([y, f, C, s, m]);
        },
      },
      {
        key: 'runStepAnimation',
        value: function (o) {
          var i = this,
            l = o.steps,
            a = o.begin,
            s = o.onAnimationStart,
            u = l[0],
            f = u.style,
            m = u.duration,
            y = m === void 0 ? 0 : m,
            S = function (h, w, p) {
              if (p === 0) return h;
              var d = w.duration,
                v = w.easing,
                x = v === void 0 ? 'ease' : v,
                E = w.style,
                P = w.properties,
                k = w.onAnimationEnd,
                _ = p > 0 ? l[p - 1] : w,
                L = P || Object.keys(E);
              if (typeof x == 'function' || x === 'spring')
                return [].concat(ql(h), [
                  i.runJSAnimation.bind(i, {
                    from: _.style,
                    to: E,
                    duration: d,
                    easing: x,
                  }),
                  d,
                ]);
              var A = md(L, d, x),
                $ = it(it(it({}, _.style), E), {}, { transition: A });
              return [].concat(ql(h), [$, d, k]).filter($2);
            };
          return this.manager.start(
            [s].concat(ql(l.reduce(S, [f, Math.max(y, a)])), [o.onAnimationEnd])
          );
        },
      },
      {
        key: 'runAnimation',
        value: function (o) {
          this.manager || (this.manager = j2());
          var i = o.begin,
            l = o.duration,
            a = o.attributeName,
            s = o.to,
            u = o.easing,
            f = o.onAnimationStart,
            m = o.onAnimationEnd,
            y = o.steps,
            S = o.children,
            C = this.manager;
          if (
            ((this.unSubscribe = C.subscribe(this.handleStyleChange)),
            typeof u == 'function' || typeof S == 'function' || u === 'spring')
          ) {
            this.runJSAnimation(o);
            return;
          }
          if (y.length > 1) {
            this.runStepAnimation(o);
            return;
          }
          var h = a ? Cr({}, a, s) : s,
            w = md(Object.keys(h), l, u);
          C.start([f, i, it(it({}, h), {}, { transition: w }), l, m]);
        },
      },
      {
        key: 'render',
        value: function () {
          var o = this.props,
            i = o.children;
          o.begin;
          var l = o.duration;
          (o.attributeName, o.easing);
          var a = o.isActive;
          (o.steps,
            o.from,
            o.to,
            o.canBegin,
            o.onAnimationEnd,
            o.shouldReAnimate,
            o.onAnimationReStart);
          var s = cw(o, uw),
            u = c.Children.count(i),
            f = this.state.style;
          if (typeof i == 'function') return i(f);
          if (!a || u === 0 || l <= 0) return i;
          var m = function (S) {
            var C = S.props,
              h = C.style,
              w = h === void 0 ? {} : h,
              p = C.className,
              d = c.cloneElement(
                S,
                it(it({}, s), {}, { style: it(it({}, w), f), className: p })
              );
            return d;
          };
          return u === 1
            ? m(c.Children.only(i))
            : Ee.createElement(
                'div',
                null,
                c.Children.map(i, function (y) {
                  return m(y);
                })
              );
        },
      },
    ]),
    n
  );
})(c.PureComponent);
Cu.displayName = 'Animate';
Cu.defaultProps = {
  begin: 0,
  duration: 1e3,
  from: '',
  to: '',
  attributeName: '',
  easing: 'ease',
  isActive: !0,
  canBegin: !0,
  steps: [],
  onAnimationEnd: function () {},
  onAnimationStart: function () {},
};
Cu.propTypes = {
  from: V.oneOfType([V.object, V.string]),
  to: V.oneOfType([V.object, V.string]),
  attributeName: V.string,
  duration: V.number,
  begin: V.number,
  easing: V.oneOfType([V.string, V.func]),
  steps: V.arrayOf(
    V.shape({
      duration: V.number.isRequired,
      style: V.object.isRequired,
      easing: V.oneOfType([
        V.oneOf(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']),
        V.func,
      ]),
      properties: V.arrayOf('string'),
      onAnimationEnd: V.func,
    })
  ),
  children: V.oneOfType([V.node, V.func]),
  isActive: V.bool,
  canBegin: V.bool,
  onAnimationEnd: V.func,
  shouldReAnimate: V.bool,
  onAnimationStart: V.func,
  onAnimationReStart: V.func,
};
function Ew() {
  return P1.useSyncExternalStore(
    kw,
    () => !0,
    () => !1
  );
}
function kw() {
  return () => {};
}
var Eu = 'Avatar',
  [Pw, qk] = Be(Eu),
  [_w, Em] = Pw(Eu),
  km = c.forwardRef((e, t) => {
    const { __scopeAvatar: n, ...r } = e,
      [o, i] = c.useState('idle');
    return g.jsx(_w, {
      scope: n,
      imageLoadingStatus: o,
      onImageLoadingStatusChange: i,
      children: g.jsx(D.span, { ...r, ref: t }),
    });
  });
km.displayName = Eu;
var Pm = 'AvatarImage',
  _m = c.forwardRef((e, t) => {
    const {
        __scopeAvatar: n,
        src: r,
        onLoadingStatusChange: o = () => {},
        ...i
      } = e,
      l = Em(Pm, n),
      a = Rw(r, i),
      s = Ae(u => {
        (o(u), l.onImageLoadingStatusChange(u));
      });
    return (
      de(() => {
        a !== 'idle' && s(a);
      }, [a, s]),
      a === 'loaded' ? g.jsx(D.img, { ...i, ref: t, src: r }) : null
    );
  });
_m.displayName = Pm;
var Rm = 'AvatarFallback',
  Tm = c.forwardRef((e, t) => {
    const { __scopeAvatar: n, delayMs: r, ...o } = e,
      i = Em(Rm, n),
      [l, a] = c.useState(r === void 0);
    return (
      c.useEffect(() => {
        if (r !== void 0) {
          const s = window.setTimeout(() => a(!0), r);
          return () => window.clearTimeout(s);
        }
      }, [r]),
      l && i.imageLoadingStatus !== 'loaded'
        ? g.jsx(D.span, { ...o, ref: t })
        : null
    );
  });
Tm.displayName = Rm;
function Sd(e, t) {
  return e
    ? t
      ? (e.src !== t && (e.src = t),
        e.complete && e.naturalWidth > 0 ? 'loaded' : 'loading')
      : 'error'
    : 'idle';
}
function Rw(e, { referrerPolicy: t, crossOrigin: n }) {
  const r = Ew(),
    o = c.useRef(null),
    i = r ? (o.current || (o.current = new window.Image()), o.current) : null,
    [l, a] = c.useState(() => Sd(i, e));
  return (
    de(() => {
      a(Sd(i, e));
    }, [i, e]),
    de(() => {
      const s = m => () => {
        a(m);
      };
      if (!i) return;
      const u = s('loaded'),
        f = s('error');
      return (
        i.addEventListener('load', u),
        i.addEventListener('error', f),
        t && (i.referrerPolicy = t),
        typeof n == 'string' && (i.crossOrigin = n),
        () => {
          (i.removeEventListener('load', u), i.removeEventListener('error', f));
        }
      );
    }, [i, n, t]),
    l
  );
}
var Zk = km,
  Jk = _m,
  e4 = Tm,
  Tw = c.createContext(void 0);
function il(e) {
  const t = c.useContext(Tw);
  return e || t || 'ltr';
}
var Zl = 0;
function ku() {
  c.useEffect(() => {
    const e = document.querySelectorAll('[data-radix-focus-guard]');
    return (
      document.body.insertAdjacentElement('afterbegin', e[0] ?? xd()),
      document.body.insertAdjacentElement('beforeend', e[1] ?? xd()),
      Zl++,
      () => {
        (Zl === 1 &&
          document
            .querySelectorAll('[data-radix-focus-guard]')
            .forEach(t => t.remove()),
          Zl--);
      }
    );
  }, []);
}
function xd() {
  const e = document.createElement('span');
  return (
    e.setAttribute('data-radix-focus-guard', ''),
    (e.tabIndex = 0),
    (e.style.outline = 'none'),
    (e.style.opacity = '0'),
    (e.style.position = 'fixed'),
    (e.style.pointerEvents = 'none'),
    e
  );
}
var Jl = 'focusScope.autoFocusOnMount',
  ea = 'focusScope.autoFocusOnUnmount',
  Cd = { bubbles: !1, cancelable: !0 },
  Mw = 'FocusScope',
  ll = c.forwardRef((e, t) => {
    const {
        loop: n = !1,
        trapped: r = !1,
        onMountAutoFocus: o,
        onUnmountAutoFocus: i,
        ...l
      } = e,
      [a, s] = c.useState(null),
      u = Ae(o),
      f = Ae(i),
      m = c.useRef(null),
      y = B(t, h => s(h)),
      S = c.useRef({
        paused: !1,
        pause() {
          this.paused = !0;
        },
        resume() {
          this.paused = !1;
        },
      }).current;
    (c.useEffect(() => {
      if (r) {
        let h = function (v) {
            if (S.paused || !a) return;
            const x = v.target;
            a.contains(x) ? (m.current = x) : Lt(m.current, { select: !0 });
          },
          w = function (v) {
            if (S.paused || !a) return;
            const x = v.relatedTarget;
            x !== null && (a.contains(x) || Lt(m.current, { select: !0 }));
          },
          p = function (v) {
            if (document.activeElement === document.body)
              for (const E of v) E.removedNodes.length > 0 && Lt(a);
          };
        (document.addEventListener('focusin', h),
          document.addEventListener('focusout', w));
        const d = new MutationObserver(p);
        return (
          a && d.observe(a, { childList: !0, subtree: !0 }),
          () => {
            (document.removeEventListener('focusin', h),
              document.removeEventListener('focusout', w),
              d.disconnect());
          }
        );
      }
    }, [r, a, S.paused]),
      c.useEffect(() => {
        if (a) {
          kd.add(S);
          const h = document.activeElement;
          if (!a.contains(h)) {
            const p = new CustomEvent(Jl, Cd);
            (a.addEventListener(Jl, u),
              a.dispatchEvent(p),
              p.defaultPrevented ||
                (Nw(jw(Mm(a)), { select: !0 }),
                document.activeElement === h && Lt(a)));
          }
          return () => {
            (a.removeEventListener(Jl, u),
              setTimeout(() => {
                const p = new CustomEvent(ea, Cd);
                (a.addEventListener(ea, f),
                  a.dispatchEvent(p),
                  p.defaultPrevented || Lt(h ?? document.body, { select: !0 }),
                  a.removeEventListener(ea, f),
                  kd.remove(S));
              }, 0));
          };
        }
      }, [a, u, f, S]));
    const C = c.useCallback(
      h => {
        if ((!n && !r) || S.paused) return;
        const w = h.key === 'Tab' && !h.altKey && !h.ctrlKey && !h.metaKey,
          p = document.activeElement;
        if (w && p) {
          const d = h.currentTarget,
            [v, x] = Aw(d);
          v && x
            ? !h.shiftKey && p === x
              ? (h.preventDefault(), n && Lt(v, { select: !0 }))
              : h.shiftKey &&
                p === v &&
                (h.preventDefault(), n && Lt(x, { select: !0 }))
            : p === d && h.preventDefault();
        }
      },
      [n, r, S.paused]
    );
    return g.jsx(D.div, { tabIndex: -1, ...l, ref: y, onKeyDown: C });
  });
ll.displayName = Mw;
function Nw(e, { select: t = !1 } = {}) {
  const n = document.activeElement;
  for (const r of e)
    if ((Lt(r, { select: t }), document.activeElement !== n)) return;
}
function Aw(e) {
  const t = Mm(e),
    n = Ed(t, e),
    r = Ed(t.reverse(), e);
  return [n, r];
}
function Mm(e) {
  const t = [],
    n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: r => {
        const o = r.tagName === 'INPUT' && r.type === 'hidden';
        return r.disabled || r.hidden || o
          ? NodeFilter.FILTER_SKIP
          : r.tabIndex >= 0
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
      },
    });
  for (; n.nextNode(); ) t.push(n.currentNode);
  return t;
}
function Ed(e, t) {
  for (const n of e) if (!Iw(n, { upTo: t })) return n;
}
function Iw(e, { upTo: t }) {
  if (getComputedStyle(e).visibility === 'hidden') return !0;
  for (; e; ) {
    if (t !== void 0 && e === t) return !1;
    if (getComputedStyle(e).display === 'none') return !0;
    e = e.parentElement;
  }
  return !1;
}
function Ow(e) {
  return e instanceof HTMLInputElement && 'select' in e;
}
function Lt(e, { select: t = !1 } = {}) {
  if (e && e.focus) {
    const n = document.activeElement;
    (e.focus({ preventScroll: !0 }), e !== n && Ow(e) && t && e.select());
  }
}
var kd = Dw();
function Dw() {
  let e = [];
  return {
    add(t) {
      const n = e[0];
      (t !== n && n?.pause(), (e = Pd(e, t)), e.unshift(t));
    },
    remove(t) {
      ((e = Pd(e, t)), e[0]?.resume());
    },
  };
}
function Pd(e, t) {
  const n = [...e],
    r = n.indexOf(t);
  return (r !== -1 && n.splice(r, 1), n);
}
function jw(e) {
  return e.filter(t => t.tagName !== 'A');
}
var Lw = Es[' useId '.trim().toString()] || (() => {}),
  bw = 0;
function St(e) {
  const [t, n] = c.useState(Lw());
  return (
    de(() => {
      n(r => r ?? String(bw++));
    }, [e]),
    t ? `radix-${t}` : ''
  );
}
var Go = typeof document < 'u' ? c.useLayoutEffect : c.useEffect;
function Pi(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (typeof e == 'function' && e.toString() === t.toString()) return !0;
  let n, r, o;
  if (e && t && typeof e == 'object') {
    if (Array.isArray(e)) {
      if (((n = e.length), n !== t.length)) return !1;
      for (r = n; r-- !== 0; ) if (!Pi(e[r], t[r])) return !1;
      return !0;
    }
    if (((o = Object.keys(e)), (n = o.length), n !== Object.keys(t).length))
      return !1;
    for (r = n; r-- !== 0; ) if (!{}.hasOwnProperty.call(t, o[r])) return !1;
    for (r = n; r-- !== 0; ) {
      const i = o[r];
      if (!(i === '_owner' && e.$$typeof) && !Pi(e[i], t[i])) return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Nm(e) {
  return typeof window > 'u'
    ? 1
    : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function _d(e, t) {
  const n = Nm(e);
  return Math.round(t * n) / n;
}
function ta(e) {
  const t = c.useRef(e);
  return (
    Go(() => {
      t.current = e;
    }),
    t
  );
}
function Fw(e) {
  e === void 0 && (e = {});
  const {
      placement: t = 'bottom',
      strategy: n = 'absolute',
      middleware: r = [],
      platform: o,
      elements: { reference: i, floating: l } = {},
      transform: a = !0,
      whileElementsMounted: s,
      open: u,
    } = e,
    [f, m] = c.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1,
    }),
    [y, S] = c.useState(r);
  Pi(y, r) || S(r);
  const [C, h] = c.useState(null),
    [w, p] = c.useState(null),
    d = c.useCallback(b => {
      b !== P.current && ((P.current = b), h(b));
    }, []),
    v = c.useCallback(b => {
      b !== k.current && ((k.current = b), p(b));
    }, []),
    x = i || C,
    E = l || w,
    P = c.useRef(null),
    k = c.useRef(null),
    _ = c.useRef(f),
    L = s != null,
    A = ta(s),
    $ = ta(o),
    G = ta(u),
    Q = c.useCallback(() => {
      if (!P.current || !k.current) return;
      const b = { placement: t, strategy: n, middleware: y };
      ($.current && (b.platform = $.current),
        _1(P.current, k.current, b).then(I => {
          const ae = { ...I, isPositioned: G.current !== !1 };
          j.current &&
            !Pi(_.current, ae) &&
            ((_.current = ae),
            Pn.flushSync(() => {
              m(ae);
            }));
        }));
    }, [y, t, n, $, G]);
  Go(() => {
    u === !1 &&
      _.current.isPositioned &&
      ((_.current.isPositioned = !1), m(b => ({ ...b, isPositioned: !1 })));
  }, [u]);
  const j = c.useRef(!1);
  (Go(
    () => (
      (j.current = !0),
      () => {
        j.current = !1;
      }
    ),
    []
  ),
    Go(() => {
      if ((x && (P.current = x), E && (k.current = E), x && E)) {
        if (A.current) return A.current(x, E, Q);
        Q();
      }
    }, [x, E, Q, A, L]));
  const H = c.useMemo(
      () => ({ reference: P, floating: k, setReference: d, setFloating: v }),
      [d, v]
    ),
    F = c.useMemo(() => ({ reference: x, floating: E }), [x, E]),
    Y = c.useMemo(() => {
      const b = { position: n, left: 0, top: 0 };
      if (!F.floating) return b;
      const I = _d(F.floating, f.x),
        ae = _d(F.floating, f.y);
      return a
        ? {
            ...b,
            transform: 'translate(' + I + 'px, ' + ae + 'px)',
            ...(Nm(F.floating) >= 1.5 && { willChange: 'transform' }),
          }
        : { position: n, left: I, top: ae };
    }, [n, a, F.floating, f.x, f.y]);
  return c.useMemo(
    () => ({ ...f, update: Q, refs: H, elements: F, floatingStyles: Y }),
    [f, Q, H, F, Y]
  );
}
const $w = e => {
    function t(n) {
      return {}.hasOwnProperty.call(n, 'current');
    }
    return {
      name: 'arrow',
      options: e,
      fn(n) {
        const { element: r, padding: o } = typeof e == 'function' ? e(n) : e;
        return r && t(r)
          ? r.current != null
            ? Wu({ element: r.current, padding: o }).fn(n)
            : {}
          : r
            ? Wu({ element: r, padding: o }).fn(n)
            : {};
      },
    };
  },
  zw = (e, t) => ({ ...R1(e), options: [e, t] }),
  Bw = (e, t) => ({ ...T1(e), options: [e, t] }),
  Uw = (e, t) => ({ ...I1(e), options: [e, t] }),
  Vw = (e, t) => ({ ...M1(e), options: [e, t] }),
  Hw = (e, t) => ({ ...N1(e), options: [e, t] }),
  Ww = (e, t) => ({ ...A1(e), options: [e, t] }),
  Kw = (e, t) => ({ ...$w(e), options: [e, t] });
var Gw = 'Arrow',
  Am = c.forwardRef((e, t) => {
    const { children: n, width: r = 10, height: o = 5, ...i } = e;
    return g.jsx(D.svg, {
      ...i,
      ref: t,
      width: r,
      height: o,
      viewBox: '0 0 30 10',
      preserveAspectRatio: 'none',
      children: e.asChild ? n : g.jsx('polygon', { points: '0,0 30,0 15,10' }),
    });
  });
Am.displayName = Gw;
var Qw = Am;
function Pu(e) {
  const [t, n] = c.useState(void 0);
  return (
    de(() => {
      if (e) {
        n({ width: e.offsetWidth, height: e.offsetHeight });
        const r = new ResizeObserver(o => {
          if (!Array.isArray(o) || !o.length) return;
          const i = o[0];
          let l, a;
          if ('borderBoxSize' in i) {
            const s = i.borderBoxSize,
              u = Array.isArray(s) ? s[0] : s;
            ((l = u.inlineSize), (a = u.blockSize));
          } else ((l = e.offsetWidth), (a = e.offsetHeight));
          n({ width: l, height: a });
        });
        return (r.observe(e, { box: 'border-box' }), () => r.unobserve(e));
      } else n(void 0);
    }, [e]),
    t
  );
}
var _u = 'Popper',
  [Im, al] = Be(_u),
  [Yw, Om] = Im(_u),
  Dm = e => {
    const { __scopePopper: t, children: n } = e,
      [r, o] = c.useState(null);
    return g.jsx(Yw, { scope: t, anchor: r, onAnchorChange: o, children: n });
  };
Dm.displayName = _u;
var jm = 'PopperAnchor',
  Lm = c.forwardRef((e, t) => {
    const { __scopePopper: n, virtualRef: r, ...o } = e,
      i = Om(jm, n),
      l = c.useRef(null),
      a = B(t, l);
    return (
      c.useEffect(() => {
        i.onAnchorChange(r?.current || l.current);
      }),
      r ? null : g.jsx(D.div, { ...o, ref: a })
    );
  });
Lm.displayName = jm;
var Ru = 'PopperContent',
  [Xw, qw] = Im(Ru),
  bm = c.forwardRef((e, t) => {
    const {
        __scopePopper: n,
        side: r = 'bottom',
        sideOffset: o = 0,
        align: i = 'center',
        alignOffset: l = 0,
        arrowPadding: a = 0,
        avoidCollisions: s = !0,
        collisionBoundary: u = [],
        collisionPadding: f = 0,
        sticky: m = 'partial',
        hideWhenDetached: y = !1,
        updatePositionStrategy: S = 'optimized',
        onPlaced: C,
        ...h
      } = e,
      w = Om(Ru, n),
      [p, d] = c.useState(null),
      v = B(t, O => d(O)),
      [x, E] = c.useState(null),
      P = Pu(x),
      k = P?.width ?? 0,
      _ = P?.height ?? 0,
      L = r + (i !== 'center' ? '-' + i : ''),
      A =
        typeof f == 'number'
          ? f
          : { top: 0, right: 0, bottom: 0, left: 0, ...f },
      $ = Array.isArray(u) ? u : [u],
      G = $.length > 0,
      Q = { padding: A, boundary: $.filter(Jw), altBoundary: G },
      {
        refs: j,
        floatingStyles: H,
        placement: F,
        isPositioned: Y,
        middlewareData: b,
      } = Fw({
        strategy: 'fixed',
        placement: L,
        whileElementsMounted: (...O) =>
          O1(...O, { animationFrame: S === 'always' }),
        elements: { reference: w.anchor },
        middleware: [
          zw({ mainAxis: o + _, alignmentAxis: l }),
          s &&
            Bw({
              mainAxis: !0,
              crossAxis: !1,
              limiter: m === 'partial' ? Uw() : void 0,
              ...Q,
            }),
          s && Vw({ ...Q }),
          Hw({
            ...Q,
            apply: ({
              elements: O,
              rects: q,
              availableWidth: Te,
              availableHeight: Z,
            }) => {
              const { width: te, height: ue } = q.reference,
                Ye = O.floating.style;
              (Ye.setProperty('--radix-popper-available-width', `${Te}px`),
                Ye.setProperty('--radix-popper-available-height', `${Z}px`),
                Ye.setProperty('--radix-popper-anchor-width', `${te}px`),
                Ye.setProperty('--radix-popper-anchor-height', `${ue}px`));
            },
          }),
          x && Kw({ element: x, padding: a }),
          eS({ arrowWidth: k, arrowHeight: _ }),
          y && Ww({ strategy: 'referenceHidden', ...Q }),
        ],
      }),
      [I, ae] = zm(F),
      he = Ae(C);
    de(() => {
      Y && he?.();
    }, [Y, he]);
    const _e = b.arrow?.x,
      je = b.arrow?.y,
      Re = b.arrow?.centerOffset !== 0,
      [xt, Ue] = c.useState();
    return (
      de(() => {
        p && Ue(window.getComputedStyle(p).zIndex);
      }, [p]),
      g.jsx('div', {
        ref: j.setFloating,
        'data-radix-popper-content-wrapper': '',
        style: {
          ...H,
          transform: Y ? H.transform : 'translate(0, -200%)',
          minWidth: 'max-content',
          zIndex: xt,
          '--radix-popper-transform-origin': [
            b.transformOrigin?.x,
            b.transformOrigin?.y,
          ].join(' '),
          ...(b.hide?.referenceHidden && {
            visibility: 'hidden',
            pointerEvents: 'none',
          }),
        },
        dir: e.dir,
        children: g.jsx(Xw, {
          scope: n,
          placedSide: I,
          onArrowChange: E,
          arrowX: _e,
          arrowY: je,
          shouldHideArrow: Re,
          children: g.jsx(D.div, {
            'data-side': I,
            'data-align': ae,
            ...h,
            ref: v,
            style: { ...h.style, animation: Y ? void 0 : 'none' },
          }),
        }),
      })
    );
  });
bm.displayName = Ru;
var Fm = 'PopperArrow',
  Zw = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' },
  $m = c.forwardRef(function (t, n) {
    const { __scopePopper: r, ...o } = t,
      i = qw(Fm, r),
      l = Zw[i.placedSide];
    return g.jsx('span', {
      ref: i.onArrowChange,
      style: {
        position: 'absolute',
        left: i.arrowX,
        top: i.arrowY,
        [l]: 0,
        transformOrigin: {
          top: '',
          right: '0 0',
          bottom: 'center 0',
          left: '100% 0',
        }[i.placedSide],
        transform: {
          top: 'translateY(100%)',
          right: 'translateY(50%) rotate(90deg) translateX(-50%)',
          bottom: 'rotate(180deg)',
          left: 'translateY(50%) rotate(-90deg) translateX(50%)',
        }[i.placedSide],
        visibility: i.shouldHideArrow ? 'hidden' : void 0,
      },
      children: g.jsx(Qw, {
        ...o,
        ref: n,
        style: { ...o.style, display: 'block' },
      }),
    });
  });
$m.displayName = Fm;
function Jw(e) {
  return e !== null;
}
var eS = e => ({
  name: 'transformOrigin',
  options: e,
  fn(t) {
    const { placement: n, rects: r, middlewareData: o } = t,
      l = o.arrow?.centerOffset !== 0,
      a = l ? 0 : e.arrowWidth,
      s = l ? 0 : e.arrowHeight,
      [u, f] = zm(n),
      m = { start: '0%', center: '50%', end: '100%' }[f],
      y = (o.arrow?.x ?? 0) + a / 2,
      S = (o.arrow?.y ?? 0) + s / 2;
    let C = '',
      h = '';
    return (
      u === 'bottom'
        ? ((C = l ? m : `${y}px`), (h = `${-s}px`))
        : u === 'top'
          ? ((C = l ? m : `${y}px`), (h = `${r.floating.height + s}px`))
          : u === 'right'
            ? ((C = `${-s}px`), (h = l ? m : `${S}px`))
            : u === 'left' &&
              ((C = `${r.floating.width + s}px`), (h = l ? m : `${S}px`)),
      { data: { x: C, y: h } }
    );
  },
});
function zm(e) {
  const [t, n = 'center'] = e.split('-');
  return [t, n];
}
var Bm = Dm,
  Um = Lm,
  Vm = bm,
  Hm = $m,
  na = 'rovingFocusGroup.onEntryFocus',
  tS = { bubbles: !1, cancelable: !0 },
  co = 'RovingFocusGroup',
  [cs, Wm, nS] = Gi(co),
  [rS, sl] = Be(co, [nS]),
  [oS, iS] = rS(co),
  Km = c.forwardRef((e, t) =>
    g.jsx(cs.Provider, {
      scope: e.__scopeRovingFocusGroup,
      children: g.jsx(cs.Slot, {
        scope: e.__scopeRovingFocusGroup,
        children: g.jsx(lS, { ...e, ref: t }),
      }),
    })
  );
Km.displayName = co;
var lS = c.forwardRef((e, t) => {
    const {
        __scopeRovingFocusGroup: n,
        orientation: r,
        loop: o = !1,
        dir: i,
        currentTabStopId: l,
        defaultCurrentTabStopId: a,
        onCurrentTabStopIdChange: s,
        onEntryFocus: u,
        preventScrollOnEntryFocus: f = !1,
        ...m
      } = e,
      y = c.useRef(null),
      S = B(t, y),
      C = il(i),
      [h, w] = At({ prop: l, defaultProp: a ?? null, onChange: s, caller: co }),
      [p, d] = c.useState(!1),
      v = Ae(u),
      x = Wm(n),
      E = c.useRef(!1),
      [P, k] = c.useState(0);
    return (
      c.useEffect(() => {
        const _ = y.current;
        if (_)
          return (
            _.addEventListener(na, v),
            () => _.removeEventListener(na, v)
          );
      }, [v]),
      g.jsx(oS, {
        scope: n,
        orientation: r,
        dir: C,
        loop: o,
        currentTabStopId: h,
        onItemFocus: c.useCallback(_ => w(_), [w]),
        onItemShiftTab: c.useCallback(() => d(!0), []),
        onFocusableItemAdd: c.useCallback(() => k(_ => _ + 1), []),
        onFocusableItemRemove: c.useCallback(() => k(_ => _ - 1), []),
        children: g.jsx(D.div, {
          tabIndex: p || P === 0 ? -1 : 0,
          'data-orientation': r,
          ...m,
          ref: S,
          style: { outline: 'none', ...e.style },
          onMouseDown: M(e.onMouseDown, () => {
            E.current = !0;
          }),
          onFocus: M(e.onFocus, _ => {
            const L = !E.current;
            if (_.target === _.currentTarget && L && !p) {
              const A = new CustomEvent(na, tS);
              if ((_.currentTarget.dispatchEvent(A), !A.defaultPrevented)) {
                const $ = x().filter(F => F.focusable),
                  G = $.find(F => F.active),
                  Q = $.find(F => F.id === h),
                  H = [G, Q, ...$].filter(Boolean).map(F => F.ref.current);
                Ym(H, f);
              }
            }
            E.current = !1;
          }),
          onBlur: M(e.onBlur, () => d(!1)),
        }),
      })
    );
  }),
  Gm = 'RovingFocusGroupItem',
  Qm = c.forwardRef((e, t) => {
    const {
        __scopeRovingFocusGroup: n,
        focusable: r = !0,
        active: o = !1,
        tabStopId: i,
        children: l,
        ...a
      } = e,
      s = St(),
      u = i || s,
      f = iS(Gm, n),
      m = f.currentTabStopId === u,
      y = Wm(n),
      {
        onFocusableItemAdd: S,
        onFocusableItemRemove: C,
        currentTabStopId: h,
      } = f;
    return (
      c.useEffect(() => {
        if (r) return (S(), () => C());
      }, [r, S, C]),
      g.jsx(cs.ItemSlot, {
        scope: n,
        id: u,
        focusable: r,
        active: o,
        children: g.jsx(D.span, {
          tabIndex: m ? 0 : -1,
          'data-orientation': f.orientation,
          ...a,
          ref: t,
          onMouseDown: M(e.onMouseDown, w => {
            r ? f.onItemFocus(u) : w.preventDefault();
          }),
          onFocus: M(e.onFocus, () => f.onItemFocus(u)),
          onKeyDown: M(e.onKeyDown, w => {
            if (w.key === 'Tab' && w.shiftKey) {
              f.onItemShiftTab();
              return;
            }
            if (w.target !== w.currentTarget) return;
            const p = uS(w, f.orientation, f.dir);
            if (p !== void 0) {
              if (w.metaKey || w.ctrlKey || w.altKey || w.shiftKey) return;
              w.preventDefault();
              let v = y()
                .filter(x => x.focusable)
                .map(x => x.ref.current);
              if (p === 'last') v.reverse();
              else if (p === 'prev' || p === 'next') {
                p === 'prev' && v.reverse();
                const x = v.indexOf(w.currentTarget);
                v = f.loop ? cS(v, x + 1) : v.slice(x + 1);
              }
              setTimeout(() => Ym(v));
            }
          }),
          children:
            typeof l == 'function'
              ? l({ isCurrentTabStop: m, hasTabStop: h != null })
              : l,
        }),
      })
    );
  });
Qm.displayName = Gm;
var aS = {
  ArrowLeft: 'prev',
  ArrowUp: 'prev',
  ArrowRight: 'next',
  ArrowDown: 'next',
  PageUp: 'first',
  Home: 'first',
  PageDown: 'last',
  End: 'last',
};
function sS(e, t) {
  return t !== 'rtl'
    ? e
    : e === 'ArrowLeft'
      ? 'ArrowRight'
      : e === 'ArrowRight'
        ? 'ArrowLeft'
        : e;
}
function uS(e, t, n) {
  const r = sS(e.key, n);
  if (
    !(t === 'vertical' && ['ArrowLeft', 'ArrowRight'].includes(r)) &&
    !(t === 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(r))
  )
    return aS[r];
}
function Ym(e, t = !1) {
  const n = document.activeElement;
  for (const r of e)
    if (
      r === n ||
      (r.focus({ preventScroll: t }), document.activeElement !== n)
    )
      return;
}
function cS(e, t) {
  return e.map((n, r) => e[(t + r) % e.length]);
}
var Xm = Km,
  qm = Qm,
  Qo = 'right-scroll-bar-position',
  Yo = 'width-before-scroll-bar',
  dS = 'with-scroll-bars-hidden',
  fS = '--removed-body-scroll-bar-size',
  Zm = D1(),
  ra = function () {},
  ul = c.forwardRef(function (e, t) {
    var n = c.useRef(null),
      r = c.useState({
        onScrollCapture: ra,
        onWheelCapture: ra,
        onTouchMoveCapture: ra,
      }),
      o = r[0],
      i = r[1],
      l = e.forwardProps,
      a = e.children,
      s = e.className,
      u = e.removeScrollBar,
      f = e.enabled,
      m = e.shards,
      y = e.sideCar,
      S = e.noRelative,
      C = e.noIsolation,
      h = e.inert,
      w = e.allowPinchZoom,
      p = e.as,
      d = p === void 0 ? 'div' : p,
      v = e.gapMode,
      x = j1(e, [
        'forwardProps',
        'children',
        'className',
        'removeScrollBar',
        'enabled',
        'shards',
        'sideCar',
        'noRelative',
        'noIsolation',
        'inert',
        'allowPinchZoom',
        'as',
        'gapMode',
      ]),
      E = y,
      P = L1([n, t]),
      k = An(An({}, x), o);
    return c.createElement(
      c.Fragment,
      null,
      f &&
        c.createElement(E, {
          sideCar: Zm,
          removeScrollBar: u,
          shards: m,
          noRelative: S,
          noIsolation: C,
          inert: h,
          setCallbacks: i,
          allowPinchZoom: !!w,
          lockRef: n,
          gapMode: v,
        }),
      l
        ? c.cloneElement(c.Children.only(a), An(An({}, k), { ref: P }))
        : c.createElement(d, An({}, k, { className: s, ref: P }), a)
    );
  });
ul.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
ul.classNames = { fullWidth: Yo, zeroRight: Qo };
function pS() {
  if (!document) return null;
  var e = document.createElement('style');
  e.type = 'text/css';
  var t = b1();
  return (t && e.setAttribute('nonce', t), e);
}
function mS(e, t) {
  e.styleSheet
    ? (e.styleSheet.cssText = t)
    : e.appendChild(document.createTextNode(t));
}
function vS(e) {
  var t = document.head || document.getElementsByTagName('head')[0];
  t.appendChild(e);
}
var hS = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        (e == 0 && (t = pS()) && (mS(t, n), vS(t)), e++);
      },
      remove: function () {
        (e--,
          !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null)));
      },
    };
  },
  yS = function () {
    var e = hS();
    return function (t, n) {
      c.useEffect(
        function () {
          return (
            e.add(t),
            function () {
              e.remove();
            }
          );
        },
        [t && n]
      );
    };
  },
  Jm = function () {
    var e = yS(),
      t = function (n) {
        var r = n.styles,
          o = n.dynamic;
        return (e(r, o), null);
      };
    return t;
  },
  gS = { left: 0, top: 0, right: 0, gap: 0 },
  oa = function (e) {
    return parseInt(e || '', 10) || 0;
  },
  wS = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === 'padding' ? 'paddingLeft' : 'marginLeft'],
      r = t[e === 'padding' ? 'paddingTop' : 'marginTop'],
      o = t[e === 'padding' ? 'paddingRight' : 'marginRight'];
    return [oa(n), oa(r), oa(o)];
  },
  SS = function (e) {
    if ((e === void 0 && (e = 'margin'), typeof window > 'u')) return gS;
    var t = wS(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth;
    return {
      left: t[0],
      top: t[1],
      right: t[2],
      gap: Math.max(0, r - n + t[2] - t[0]),
    };
  },
  xS = Jm(),
  Xn = 'data-scroll-locked',
  CS = function (e, t, n, r) {
    var o = e.left,
      i = e.top,
      l = e.right,
      a = e.gap;
    return (
      n === void 0 && (n = 'margin'),
      `
  .`
        .concat(
          dS,
          ` {
   overflow: hidden `
        )
        .concat(
          r,
          `;
   padding-right: `
        )
        .concat(a, 'px ')
        .concat(
          r,
          `;
  }
  body[`
        )
        .concat(
          Xn,
          `] {
    overflow: hidden `
        )
        .concat(
          r,
          `;
    overscroll-behavior: contain;
    `
        )
        .concat(
          [
            t && 'position: relative '.concat(r, ';'),
            n === 'margin' &&
              `
    padding-left: `
                .concat(
                  o,
                  `px;
    padding-top: `
                )
                .concat(
                  i,
                  `px;
    padding-right: `
                )
                .concat(
                  l,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `
                )
                .concat(a, 'px ')
                .concat(
                  r,
                  `;
    `
                ),
            n === 'padding' &&
              'padding-right: '.concat(a, 'px ').concat(r, ';'),
          ]
            .filter(Boolean)
            .join(''),
          `
  }
  
  .`
        )
        .concat(
          Qo,
          ` {
    right: `
        )
        .concat(a, 'px ')
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(
          Yo,
          ` {
    margin-right: `
        )
        .concat(a, 'px ')
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(Qo, ' .')
        .concat(
          Qo,
          ` {
    right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(Yo, ' .')
        .concat(
          Yo,
          ` {
    margin-right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  body[`
        )
        .concat(
          Xn,
          `] {
    `
        )
        .concat(fS, ': ')
        .concat(
          a,
          `px;
  }
`
        )
    );
  },
  Rd = function () {
    var e = parseInt(document.body.getAttribute(Xn) || '0', 10);
    return isFinite(e) ? e : 0;
  },
  ES = function () {
    c.useEffect(function () {
      return (
        document.body.setAttribute(Xn, (Rd() + 1).toString()),
        function () {
          var e = Rd() - 1;
          e <= 0
            ? document.body.removeAttribute(Xn)
            : document.body.setAttribute(Xn, e.toString());
        }
      );
    }, []);
  },
  kS = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      o = r === void 0 ? 'margin' : r;
    ES();
    var i = c.useMemo(
      function () {
        return SS(o);
      },
      [o]
    );
    return c.createElement(xS, { styles: CS(i, !t, o, n ? '' : '!important') });
  },
  ds = !1;
if (typeof window < 'u')
  try {
    var Oo = Object.defineProperty({}, 'passive', {
      get: function () {
        return ((ds = !0), !0);
      },
    });
    (window.addEventListener('test', Oo, Oo),
      window.removeEventListener('test', Oo, Oo));
  } catch {
    ds = !1;
  }
var Mn = ds ? { passive: !1 } : !1,
  PS = function (e) {
    return e.tagName === 'TEXTAREA';
  },
  ev = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return (
      n[t] !== 'hidden' &&
      !(n.overflowY === n.overflowX && !PS(e) && n[t] === 'visible')
    );
  },
  _S = function (e) {
    return ev(e, 'overflowY');
  },
  RS = function (e) {
    return ev(e, 'overflowX');
  },
  Td = function (e, t) {
    var n = t.ownerDocument,
      r = t;
    do {
      typeof ShadowRoot < 'u' && r instanceof ShadowRoot && (r = r.host);
      var o = tv(e, r);
      if (o) {
        var i = nv(e, r),
          l = i[1],
          a = i[2];
        if (l > a) return !0;
      }
      r = r.parentNode;
    } while (r && r !== n.body);
    return !1;
  },
  TS = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight;
    return [t, n, r];
  },
  MS = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth;
    return [t, n, r];
  },
  tv = function (e, t) {
    return e === 'v' ? _S(t) : RS(t);
  },
  nv = function (e, t) {
    return e === 'v' ? TS(t) : MS(t);
  },
  NS = function (e, t) {
    return e === 'h' && t === 'rtl' ? -1 : 1;
  },
  AS = function (e, t, n, r, o) {
    var i = NS(e, window.getComputedStyle(t).direction),
      l = i * r,
      a = n.target,
      s = t.contains(a),
      u = !1,
      f = l > 0,
      m = 0,
      y = 0;
    do {
      var S = nv(e, a),
        C = S[0],
        h = S[1],
        w = S[2],
        p = h - w - i * C;
      ((C || p) && tv(e, a) && ((m += p), (y += C)),
        (a = a.parentNode.host || a.parentNode));
    } while ((!s && a !== document.body) || (s && (t.contains(a) || t === a)));
    return (((f && Math.abs(m) < 1) || (!f && Math.abs(y) < 1)) && (u = !0), u);
  },
  Do = function (e) {
    return 'changedTouches' in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  Md = function (e) {
    return [e.deltaX, e.deltaY];
  },
  Nd = function (e) {
    return e && 'current' in e ? e.current : e;
  },
  IS = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  OS = function (e) {
    return `
  .block-interactivity-`
      .concat(
        e,
        ` {pointer-events: none;}
  .allow-interactivity-`
      )
      .concat(
        e,
        ` {pointer-events: all;}
`
      );
  },
  DS = 0,
  Nn = [];
function jS(e) {
  var t = c.useRef([]),
    n = c.useRef([0, 0]),
    r = c.useRef(),
    o = c.useState(DS++)[0],
    i = c.useState(Jm)[0],
    l = c.useRef(e);
  (c.useEffect(
    function () {
      l.current = e;
    },
    [e]
  ),
    c.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add('block-interactivity-'.concat(o));
          var h = F1([e.lockRef.current], (e.shards || []).map(Nd), !0).filter(
            Boolean
          );
          return (
            h.forEach(function (w) {
              return w.classList.add('allow-interactivity-'.concat(o));
            }),
            function () {
              (document.body.classList.remove('block-interactivity-'.concat(o)),
                h.forEach(function (w) {
                  return w.classList.remove('allow-interactivity-'.concat(o));
                }));
            }
          );
        }
      },
      [e.inert, e.lockRef.current, e.shards]
    ));
  var a = c.useCallback(function (h, w) {
      if (
        ('touches' in h && h.touches.length === 2) ||
        (h.type === 'wheel' && h.ctrlKey)
      )
        return !l.current.allowPinchZoom;
      var p = Do(h),
        d = n.current,
        v = 'deltaX' in h ? h.deltaX : d[0] - p[0],
        x = 'deltaY' in h ? h.deltaY : d[1] - p[1],
        E,
        P = h.target,
        k = Math.abs(v) > Math.abs(x) ? 'h' : 'v';
      if ('touches' in h && k === 'h' && P.type === 'range') return !1;
      var _ = Td(k, P);
      if (!_) return !0;
      if ((_ ? (E = k) : ((E = k === 'v' ? 'h' : 'v'), (_ = Td(k, P))), !_))
        return !1;
      if (
        (!r.current && 'changedTouches' in h && (v || x) && (r.current = E), !E)
      )
        return !0;
      var L = r.current || E;
      return AS(L, w, h, L === 'h' ? v : x);
    }, []),
    s = c.useCallback(function (h) {
      var w = h;
      if (!(!Nn.length || Nn[Nn.length - 1] !== i)) {
        var p = 'deltaY' in w ? Md(w) : Do(w),
          d = t.current.filter(function (E) {
            return (
              E.name === w.type &&
              (E.target === w.target || w.target === E.shadowParent) &&
              IS(E.delta, p)
            );
          })[0];
        if (d && d.should) {
          w.cancelable && w.preventDefault();
          return;
        }
        if (!d) {
          var v = (l.current.shards || [])
              .map(Nd)
              .filter(Boolean)
              .filter(function (E) {
                return E.contains(w.target);
              }),
            x = v.length > 0 ? a(w, v[0]) : !l.current.noIsolation;
          x && w.cancelable && w.preventDefault();
        }
      }
    }, []),
    u = c.useCallback(function (h, w, p, d) {
      var v = { name: h, delta: w, target: p, should: d, shadowParent: LS(p) };
      (t.current.push(v),
        setTimeout(function () {
          t.current = t.current.filter(function (x) {
            return x !== v;
          });
        }, 1));
    }, []),
    f = c.useCallback(function (h) {
      ((n.current = Do(h)), (r.current = void 0));
    }, []),
    m = c.useCallback(function (h) {
      u(h.type, Md(h), h.target, a(h, e.lockRef.current));
    }, []),
    y = c.useCallback(function (h) {
      u(h.type, Do(h), h.target, a(h, e.lockRef.current));
    }, []);
  c.useEffect(function () {
    return (
      Nn.push(i),
      e.setCallbacks({
        onScrollCapture: m,
        onWheelCapture: m,
        onTouchMoveCapture: y,
      }),
      document.addEventListener('wheel', s, Mn),
      document.addEventListener('touchmove', s, Mn),
      document.addEventListener('touchstart', f, Mn),
      function () {
        ((Nn = Nn.filter(function (h) {
          return h !== i;
        })),
          document.removeEventListener('wheel', s, Mn),
          document.removeEventListener('touchmove', s, Mn),
          document.removeEventListener('touchstart', f, Mn));
      }
    );
  }, []);
  var S = e.removeScrollBar,
    C = e.inert;
  return c.createElement(
    c.Fragment,
    null,
    C ? c.createElement(i, { styles: OS(o) }) : null,
    S
      ? c.createElement(kS, { noRelative: e.noRelative, gapMode: e.gapMode })
      : null
  );
}
function LS(e) {
  for (var t = null; e !== null; )
    (e instanceof ShadowRoot && ((t = e.host), (e = e.host)),
      (e = e.parentNode));
  return t;
}
const bS = $1(Zm, jS);
var cl = c.forwardRef(function (e, t) {
  return c.createElement(ul, An({}, e, { ref: t, sideCar: bS }));
});
cl.classNames = ul.classNames;
var fs = ['Enter', ' '],
  FS = ['ArrowDown', 'PageUp', 'Home'],
  rv = ['ArrowUp', 'PageDown', 'End'],
  $S = [...FS, ...rv],
  zS = { ltr: [...fs, 'ArrowRight'], rtl: [...fs, 'ArrowLeft'] },
  BS = { ltr: ['ArrowLeft'], rtl: ['ArrowRight'] },
  fo = 'Menu',
  [eo, US, VS] = Gi(fo),
  [_n, ov] = Be(fo, [VS, al, sl]),
  dl = al(),
  iv = sl(),
  [HS, Rn] = _n(fo),
  [WS, po] = _n(fo),
  lv = e => {
    const {
        __scopeMenu: t,
        open: n = !1,
        children: r,
        dir: o,
        onOpenChange: i,
        modal: l = !0,
      } = e,
      a = dl(t),
      [s, u] = c.useState(null),
      f = c.useRef(!1),
      m = Ae(i),
      y = il(o);
    return (
      c.useEffect(() => {
        const S = () => {
            ((f.current = !0),
              document.addEventListener('pointerdown', C, {
                capture: !0,
                once: !0,
              }),
              document.addEventListener('pointermove', C, {
                capture: !0,
                once: !0,
              }));
          },
          C = () => (f.current = !1);
        return (
          document.addEventListener('keydown', S, { capture: !0 }),
          () => {
            (document.removeEventListener('keydown', S, { capture: !0 }),
              document.removeEventListener('pointerdown', C, { capture: !0 }),
              document.removeEventListener('pointermove', C, { capture: !0 }));
          }
        );
      }, []),
      g.jsx(Bm, {
        ...a,
        children: g.jsx(HS, {
          scope: t,
          open: n,
          onOpenChange: m,
          content: s,
          onContentChange: u,
          children: g.jsx(WS, {
            scope: t,
            onClose: c.useCallback(() => m(!1), [m]),
            isUsingKeyboardRef: f,
            dir: y,
            modal: l,
            children: r,
          }),
        }),
      })
    );
  };
lv.displayName = fo;
var KS = 'MenuAnchor',
  Tu = c.forwardRef((e, t) => {
    const { __scopeMenu: n, ...r } = e,
      o = dl(n);
    return g.jsx(Um, { ...o, ...r, ref: t });
  });
Tu.displayName = KS;
var Mu = 'MenuPortal',
  [GS, av] = _n(Mu, { forceMount: void 0 }),
  sv = e => {
    const { __scopeMenu: t, forceMount: n, children: r, container: o } = e,
      i = Rn(Mu, t);
    return g.jsx(GS, {
      scope: t,
      forceMount: n,
      children: g.jsx(pt, {
        present: n || i.open,
        children: g.jsx(so, { asChild: !0, container: o, children: r }),
      }),
    });
  };
sv.displayName = Mu;
var et = 'MenuContent',
  [QS, Nu] = _n(et),
  uv = c.forwardRef((e, t) => {
    const n = av(et, e.__scopeMenu),
      { forceMount: r = n.forceMount, ...o } = e,
      i = Rn(et, e.__scopeMenu),
      l = po(et, e.__scopeMenu);
    return g.jsx(eo.Provider, {
      scope: e.__scopeMenu,
      children: g.jsx(pt, {
        present: r || i.open,
        children: g.jsx(eo.Slot, {
          scope: e.__scopeMenu,
          children: l.modal
            ? g.jsx(YS, { ...o, ref: t })
            : g.jsx(XS, { ...o, ref: t }),
        }),
      }),
    });
  }),
  YS = c.forwardRef((e, t) => {
    const n = Rn(et, e.__scopeMenu),
      r = c.useRef(null),
      o = B(t, r);
    return (
      c.useEffect(() => {
        const i = r.current;
        if (i) return gs(i);
      }, []),
      g.jsx(Au, {
        ...e,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: n.open,
        disableOutsideScroll: !0,
        onFocusOutside: M(e.onFocusOutside, i => i.preventDefault(), {
          checkForDefaultPrevented: !1,
        }),
        onDismiss: () => n.onOpenChange(!1),
      })
    );
  }),
  XS = c.forwardRef((e, t) => {
    const n = Rn(et, e.__scopeMenu);
    return g.jsx(Au, {
      ...e,
      ref: t,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      disableOutsideScroll: !1,
      onDismiss: () => n.onOpenChange(!1),
    });
  }),
  qS = wn('MenuContent.ScrollLock'),
  Au = c.forwardRef((e, t) => {
    const {
        __scopeMenu: n,
        loop: r = !1,
        trapFocus: o,
        onOpenAutoFocus: i,
        onCloseAutoFocus: l,
        disableOutsidePointerEvents: a,
        onEntryFocus: s,
        onEscapeKeyDown: u,
        onPointerDownOutside: f,
        onFocusOutside: m,
        onInteractOutside: y,
        onDismiss: S,
        disableOutsideScroll: C,
        ...h
      } = e,
      w = Rn(et, n),
      p = po(et, n),
      d = dl(n),
      v = iv(n),
      x = US(n),
      [E, P] = c.useState(null),
      k = c.useRef(null),
      _ = B(t, k, w.onContentChange),
      L = c.useRef(0),
      A = c.useRef(''),
      $ = c.useRef(0),
      G = c.useRef(null),
      Q = c.useRef('right'),
      j = c.useRef(0),
      H = C ? cl : c.Fragment,
      F = C ? { as: qS, allowPinchZoom: !0 } : void 0,
      Y = I => {
        const ae = A.current + I,
          he = x().filter(O => !O.disabled),
          _e = document.activeElement,
          je = he.find(O => O.ref.current === _e)?.textValue,
          Re = he.map(O => O.textValue),
          xt = ux(Re, ae, je),
          Ue = he.find(O => O.textValue === xt)?.ref.current;
        ((function O(q) {
          ((A.current = q),
            window.clearTimeout(L.current),
            q !== '' && (L.current = window.setTimeout(() => O(''), 1e3)));
        })(ae),
          Ue && setTimeout(() => Ue.focus()));
      };
    (c.useEffect(() => () => window.clearTimeout(L.current), []), ku());
    const b = c.useCallback(
      I => Q.current === G.current?.side && dx(I, G.current?.area),
      []
    );
    return g.jsx(QS, {
      scope: n,
      searchRef: A,
      onItemEnter: c.useCallback(
        I => {
          b(I) && I.preventDefault();
        },
        [b]
      ),
      onItemLeave: c.useCallback(
        I => {
          b(I) || (k.current?.focus(), P(null));
        },
        [b]
      ),
      onTriggerLeave: c.useCallback(
        I => {
          b(I) && I.preventDefault();
        },
        [b]
      ),
      pointerGraceTimerRef: $,
      onPointerGraceIntentChange: c.useCallback(I => {
        G.current = I;
      }, []),
      children: g.jsx(H, {
        ...F,
        children: g.jsx(ll, {
          asChild: !0,
          trapped: o,
          onMountAutoFocus: M(i, I => {
            (I.preventDefault(), k.current?.focus({ preventScroll: !0 }));
          }),
          onUnmountAutoFocus: l,
          children: g.jsx(ao, {
            asChild: !0,
            disableOutsidePointerEvents: a,
            onEscapeKeyDown: u,
            onPointerDownOutside: f,
            onFocusOutside: m,
            onInteractOutside: y,
            onDismiss: S,
            children: g.jsx(Xm, {
              asChild: !0,
              ...v,
              dir: p.dir,
              orientation: 'vertical',
              loop: r,
              currentTabStopId: E,
              onCurrentTabStopIdChange: P,
              onEntryFocus: M(s, I => {
                p.isUsingKeyboardRef.current || I.preventDefault();
              }),
              preventScrollOnEntryFocus: !0,
              children: g.jsx(Vm, {
                role: 'menu',
                'aria-orientation': 'vertical',
                'data-state': Pv(w.open),
                'data-radix-menu-content': '',
                dir: p.dir,
                ...d,
                ...h,
                ref: _,
                style: { outline: 'none', ...h.style },
                onKeyDown: M(h.onKeyDown, I => {
                  const he =
                      I.target.closest('[data-radix-menu-content]') ===
                      I.currentTarget,
                    _e = I.ctrlKey || I.altKey || I.metaKey,
                    je = I.key.length === 1;
                  he &&
                    (I.key === 'Tab' && I.preventDefault(),
                    !_e && je && Y(I.key));
                  const Re = k.current;
                  if (I.target !== Re || !$S.includes(I.key)) return;
                  I.preventDefault();
                  const Ue = x()
                    .filter(O => !O.disabled)
                    .map(O => O.ref.current);
                  (rv.includes(I.key) && Ue.reverse(), ax(Ue));
                }),
                onBlur: M(e.onBlur, I => {
                  I.currentTarget.contains(I.target) ||
                    (window.clearTimeout(L.current), (A.current = ''));
                }),
                onPointerMove: M(
                  e.onPointerMove,
                  to(I => {
                    const ae = I.target,
                      he = j.current !== I.clientX;
                    if (I.currentTarget.contains(ae) && he) {
                      const _e = I.clientX > j.current ? 'right' : 'left';
                      ((Q.current = _e), (j.current = I.clientX));
                    }
                  })
                ),
              }),
            }),
          }),
        }),
      }),
    });
  });
uv.displayName = et;
var ZS = 'MenuGroup',
  Iu = c.forwardRef((e, t) => {
    const { __scopeMenu: n, ...r } = e;
    return g.jsx(D.div, { role: 'group', ...r, ref: t });
  });
Iu.displayName = ZS;
var JS = 'MenuLabel',
  cv = c.forwardRef((e, t) => {
    const { __scopeMenu: n, ...r } = e;
    return g.jsx(D.div, { ...r, ref: t });
  });
cv.displayName = JS;
var _i = 'MenuItem',
  Ad = 'menu.itemSelect',
  fl = c.forwardRef((e, t) => {
    const { disabled: n = !1, onSelect: r, ...o } = e,
      i = c.useRef(null),
      l = po(_i, e.__scopeMenu),
      a = Nu(_i, e.__scopeMenu),
      s = B(t, i),
      u = c.useRef(!1),
      f = () => {
        const m = i.current;
        if (!n && m) {
          const y = new CustomEvent(Ad, { bubbles: !0, cancelable: !0 });
          (m.addEventListener(Ad, S => r?.(S), { once: !0 }),
            vu(m, y),
            y.defaultPrevented ? (u.current = !1) : l.onClose());
        }
      };
    return g.jsx(dv, {
      ...o,
      ref: s,
      disabled: n,
      onClick: M(e.onClick, f),
      onPointerDown: m => {
        (e.onPointerDown?.(m), (u.current = !0));
      },
      onPointerUp: M(e.onPointerUp, m => {
        u.current || m.currentTarget?.click();
      }),
      onKeyDown: M(e.onKeyDown, m => {
        const y = a.searchRef.current !== '';
        n ||
          (y && m.key === ' ') ||
          (fs.includes(m.key) && (m.currentTarget.click(), m.preventDefault()));
      }),
    });
  });
fl.displayName = _i;
var dv = c.forwardRef((e, t) => {
    const { __scopeMenu: n, disabled: r = !1, textValue: o, ...i } = e,
      l = Nu(_i, n),
      a = iv(n),
      s = c.useRef(null),
      u = B(t, s),
      [f, m] = c.useState(!1),
      [y, S] = c.useState('');
    return (
      c.useEffect(() => {
        const C = s.current;
        C && S((C.textContent ?? '').trim());
      }, [i.children]),
      g.jsx(eo.ItemSlot, {
        scope: n,
        disabled: r,
        textValue: o ?? y,
        children: g.jsx(qm, {
          asChild: !0,
          ...a,
          focusable: !r,
          children: g.jsx(D.div, {
            role: 'menuitem',
            'data-highlighted': f ? '' : void 0,
            'aria-disabled': r || void 0,
            'data-disabled': r ? '' : void 0,
            ...i,
            ref: u,
            onPointerMove: M(
              e.onPointerMove,
              to(C => {
                r
                  ? l.onItemLeave(C)
                  : (l.onItemEnter(C),
                    C.defaultPrevented ||
                      C.currentTarget.focus({ preventScroll: !0 }));
              })
            ),
            onPointerLeave: M(
              e.onPointerLeave,
              to(C => l.onItemLeave(C))
            ),
            onFocus: M(e.onFocus, () => m(!0)),
            onBlur: M(e.onBlur, () => m(!1)),
          }),
        }),
      })
    );
  }),
  ex = 'MenuCheckboxItem',
  fv = c.forwardRef((e, t) => {
    const { checked: n = !1, onCheckedChange: r, ...o } = e;
    return g.jsx(yv, {
      scope: e.__scopeMenu,
      checked: n,
      children: g.jsx(fl, {
        role: 'menuitemcheckbox',
        'aria-checked': Ri(n) ? 'mixed' : n,
        ...o,
        ref: t,
        'data-state': Du(n),
        onSelect: M(o.onSelect, () => r?.(Ri(n) ? !0 : !n), {
          checkForDefaultPrevented: !1,
        }),
      }),
    });
  });
fv.displayName = ex;
var pv = 'MenuRadioGroup',
  [tx, nx] = _n(pv, { value: void 0, onValueChange: () => {} }),
  mv = c.forwardRef((e, t) => {
    const { value: n, onValueChange: r, ...o } = e,
      i = Ae(r);
    return g.jsx(tx, {
      scope: e.__scopeMenu,
      value: n,
      onValueChange: i,
      children: g.jsx(Iu, { ...o, ref: t }),
    });
  });
mv.displayName = pv;
var vv = 'MenuRadioItem',
  hv = c.forwardRef((e, t) => {
    const { value: n, ...r } = e,
      o = nx(vv, e.__scopeMenu),
      i = n === o.value;
    return g.jsx(yv, {
      scope: e.__scopeMenu,
      checked: i,
      children: g.jsx(fl, {
        role: 'menuitemradio',
        'aria-checked': i,
        ...r,
        ref: t,
        'data-state': Du(i),
        onSelect: M(r.onSelect, () => o.onValueChange?.(n), {
          checkForDefaultPrevented: !1,
        }),
      }),
    });
  });
hv.displayName = vv;
var Ou = 'MenuItemIndicator',
  [yv, rx] = _n(Ou, { checked: !1 }),
  gv = c.forwardRef((e, t) => {
    const { __scopeMenu: n, forceMount: r, ...o } = e,
      i = rx(Ou, n);
    return g.jsx(pt, {
      present: r || Ri(i.checked) || i.checked === !0,
      children: g.jsx(D.span, { ...o, ref: t, 'data-state': Du(i.checked) }),
    });
  });
gv.displayName = Ou;
var ox = 'MenuSeparator',
  wv = c.forwardRef((e, t) => {
    const { __scopeMenu: n, ...r } = e;
    return g.jsx(D.div, {
      role: 'separator',
      'aria-orientation': 'horizontal',
      ...r,
      ref: t,
    });
  });
wv.displayName = ox;
var ix = 'MenuArrow',
  Sv = c.forwardRef((e, t) => {
    const { __scopeMenu: n, ...r } = e,
      o = dl(n);
    return g.jsx(Hm, { ...o, ...r, ref: t });
  });
Sv.displayName = ix;
var lx = 'MenuSub',
  [t4, xv] = _n(lx),
  Er = 'MenuSubTrigger',
  Cv = c.forwardRef((e, t) => {
    const n = Rn(Er, e.__scopeMenu),
      r = po(Er, e.__scopeMenu),
      o = xv(Er, e.__scopeMenu),
      i = Nu(Er, e.__scopeMenu),
      l = c.useRef(null),
      { pointerGraceTimerRef: a, onPointerGraceIntentChange: s } = i,
      u = { __scopeMenu: e.__scopeMenu },
      f = c.useCallback(() => {
        (l.current && window.clearTimeout(l.current), (l.current = null));
      }, []);
    return (
      c.useEffect(() => f, [f]),
      c.useEffect(() => {
        const m = a.current;
        return () => {
          (window.clearTimeout(m), s(null));
        };
      }, [a, s]),
      g.jsx(Tu, {
        asChild: !0,
        ...u,
        children: g.jsx(dv, {
          id: o.triggerId,
          'aria-haspopup': 'menu',
          'aria-expanded': n.open,
          'aria-controls': o.contentId,
          'data-state': Pv(n.open),
          ...e,
          ref: mu(t, o.onTriggerChange),
          onClick: m => {
            (e.onClick?.(m),
              !(e.disabled || m.defaultPrevented) &&
                (m.currentTarget.focus(), n.open || n.onOpenChange(!0)));
          },
          onPointerMove: M(
            e.onPointerMove,
            to(m => {
              (i.onItemEnter(m),
                !m.defaultPrevented &&
                  !e.disabled &&
                  !n.open &&
                  !l.current &&
                  (i.onPointerGraceIntentChange(null),
                  (l.current = window.setTimeout(() => {
                    (n.onOpenChange(!0), f());
                  }, 100))));
            })
          ),
          onPointerLeave: M(
            e.onPointerLeave,
            to(m => {
              f();
              const y = n.content?.getBoundingClientRect();
              if (y) {
                const S = n.content?.dataset.side,
                  C = S === 'right',
                  h = C ? -5 : 5,
                  w = y[C ? 'left' : 'right'],
                  p = y[C ? 'right' : 'left'];
                (i.onPointerGraceIntentChange({
                  area: [
                    { x: m.clientX + h, y: m.clientY },
                    { x: w, y: y.top },
                    { x: p, y: y.top },
                    { x: p, y: y.bottom },
                    { x: w, y: y.bottom },
                  ],
                  side: S,
                }),
                  window.clearTimeout(a.current),
                  (a.current = window.setTimeout(
                    () => i.onPointerGraceIntentChange(null),
                    300
                  )));
              } else {
                if ((i.onTriggerLeave(m), m.defaultPrevented)) return;
                i.onPointerGraceIntentChange(null);
              }
            })
          ),
          onKeyDown: M(e.onKeyDown, m => {
            const y = i.searchRef.current !== '';
            e.disabled ||
              (y && m.key === ' ') ||
              (zS[r.dir].includes(m.key) &&
                (n.onOpenChange(!0), n.content?.focus(), m.preventDefault()));
          }),
        }),
      })
    );
  });
Cv.displayName = Er;
var Ev = 'MenuSubContent',
  kv = c.forwardRef((e, t) => {
    const n = av(et, e.__scopeMenu),
      { forceMount: r = n.forceMount, ...o } = e,
      i = Rn(et, e.__scopeMenu),
      l = po(et, e.__scopeMenu),
      a = xv(Ev, e.__scopeMenu),
      s = c.useRef(null),
      u = B(t, s);
    return g.jsx(eo.Provider, {
      scope: e.__scopeMenu,
      children: g.jsx(pt, {
        present: r || i.open,
        children: g.jsx(eo.Slot, {
          scope: e.__scopeMenu,
          children: g.jsx(Au, {
            id: a.contentId,
            'aria-labelledby': a.triggerId,
            ...o,
            ref: u,
            align: 'start',
            side: l.dir === 'rtl' ? 'left' : 'right',
            disableOutsidePointerEvents: !1,
            disableOutsideScroll: !1,
            trapFocus: !1,
            onOpenAutoFocus: f => {
              (l.isUsingKeyboardRef.current && s.current?.focus(),
                f.preventDefault());
            },
            onCloseAutoFocus: f => f.preventDefault(),
            onFocusOutside: M(e.onFocusOutside, f => {
              f.target !== a.trigger && i.onOpenChange(!1);
            }),
            onEscapeKeyDown: M(e.onEscapeKeyDown, f => {
              (l.onClose(), f.preventDefault());
            }),
            onKeyDown: M(e.onKeyDown, f => {
              const m = f.currentTarget.contains(f.target),
                y = BS[l.dir].includes(f.key);
              m &&
                y &&
                (i.onOpenChange(!1), a.trigger?.focus(), f.preventDefault());
            }),
          }),
        }),
      }),
    });
  });
kv.displayName = Ev;
function Pv(e) {
  return e ? 'open' : 'closed';
}
function Ri(e) {
  return e === 'indeterminate';
}
function Du(e) {
  return Ri(e) ? 'indeterminate' : e ? 'checked' : 'unchecked';
}
function ax(e) {
  const t = document.activeElement;
  for (const n of e)
    if (n === t || (n.focus(), document.activeElement !== t)) return;
}
function sx(e, t) {
  return e.map((n, r) => e[(t + r) % e.length]);
}
function ux(e, t, n) {
  const o = t.length > 1 && Array.from(t).every(u => u === t[0]) ? t[0] : t,
    i = n ? e.indexOf(n) : -1;
  let l = sx(e, Math.max(i, 0));
  o.length === 1 && (l = l.filter(u => u !== n));
  const s = l.find(u => u.toLowerCase().startsWith(o.toLowerCase()));
  return s !== n ? s : void 0;
}
function cx(e, t) {
  const { x: n, y: r } = e;
  let o = !1;
  for (let i = 0, l = t.length - 1; i < t.length; l = i++) {
    const a = t[i],
      s = t[l],
      u = a.x,
      f = a.y,
      m = s.x,
      y = s.y;
    f > r != y > r && n < ((m - u) * (r - f)) / (y - f) + u && (o = !o);
  }
  return o;
}
function dx(e, t) {
  if (!t) return !1;
  const n = { x: e.clientX, y: e.clientY };
  return cx(n, t);
}
function to(e) {
  return t => (t.pointerType === 'mouse' ? e(t) : void 0);
}
var fx = lv,
  px = Tu,
  mx = sv,
  vx = uv,
  hx = Iu,
  yx = cv,
  gx = fl,
  wx = fv,
  Sx = mv,
  xx = hv,
  Cx = gv,
  Ex = wv,
  kx = Sv,
  Px = Cv,
  _x = kv,
  pl = 'DropdownMenu',
  [Rx, n4] = Be(pl, [ov]),
  De = ov(),
  [Tx, _v] = Rx(pl),
  Rv = e => {
    const {
        __scopeDropdownMenu: t,
        children: n,
        dir: r,
        open: o,
        defaultOpen: i,
        onOpenChange: l,
        modal: a = !0,
      } = e,
      s = De(t),
      u = c.useRef(null),
      [f, m] = At({ prop: o, defaultProp: i ?? !1, onChange: l, caller: pl });
    return g.jsx(Tx, {
      scope: t,
      triggerId: St(),
      triggerRef: u,
      contentId: St(),
      open: f,
      onOpenChange: m,
      onOpenToggle: c.useCallback(() => m(y => !y), [m]),
      modal: a,
      children: g.jsx(fx, {
        ...s,
        open: f,
        onOpenChange: m,
        dir: r,
        modal: a,
        children: n,
      }),
    });
  };
Rv.displayName = pl;
var Tv = 'DropdownMenuTrigger',
  Mv = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, disabled: r = !1, ...o } = e,
      i = _v(Tv, n),
      l = De(n);
    return g.jsx(px, {
      asChild: !0,
      ...l,
      children: g.jsx(D.button, {
        type: 'button',
        id: i.triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': i.open,
        'aria-controls': i.open ? i.contentId : void 0,
        'data-state': i.open ? 'open' : 'closed',
        'data-disabled': r ? '' : void 0,
        disabled: r,
        ...o,
        ref: mu(t, i.triggerRef),
        onPointerDown: M(e.onPointerDown, a => {
          !r &&
            a.button === 0 &&
            a.ctrlKey === !1 &&
            (i.onOpenToggle(), i.open || a.preventDefault());
        }),
        onKeyDown: M(e.onKeyDown, a => {
          r ||
            (['Enter', ' '].includes(a.key) && i.onOpenToggle(),
            a.key === 'ArrowDown' && i.onOpenChange(!0),
            ['Enter', ' ', 'ArrowDown'].includes(a.key) && a.preventDefault());
        }),
      }),
    });
  });
Mv.displayName = Tv;
var Mx = 'DropdownMenuPortal',
  Nv = e => {
    const { __scopeDropdownMenu: t, ...n } = e,
      r = De(t);
    return g.jsx(mx, { ...r, ...n });
  };
Nv.displayName = Mx;
var Av = 'DropdownMenuContent',
  Iv = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = _v(Av, n),
      i = De(n),
      l = c.useRef(!1);
    return g.jsx(vx, {
      id: o.contentId,
      'aria-labelledby': o.triggerId,
      ...i,
      ...r,
      ref: t,
      onCloseAutoFocus: M(e.onCloseAutoFocus, a => {
        (l.current || o.triggerRef.current?.focus(),
          (l.current = !1),
          a.preventDefault());
      }),
      onInteractOutside: M(e.onInteractOutside, a => {
        const s = a.detail.originalEvent,
          u = s.button === 0 && s.ctrlKey === !0,
          f = s.button === 2 || u;
        (!o.modal || f) && (l.current = !0);
      }),
      style: {
        ...e.style,
        '--radix-dropdown-menu-content-transform-origin':
          'var(--radix-popper-transform-origin)',
        '--radix-dropdown-menu-content-available-width':
          'var(--radix-popper-available-width)',
        '--radix-dropdown-menu-content-available-height':
          'var(--radix-popper-available-height)',
        '--radix-dropdown-menu-trigger-width':
          'var(--radix-popper-anchor-width)',
        '--radix-dropdown-menu-trigger-height':
          'var(--radix-popper-anchor-height)',
      },
    });
  });
Iv.displayName = Av;
var Nx = 'DropdownMenuGroup',
  Ax = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(hx, { ...o, ...r, ref: t });
  });
Ax.displayName = Nx;
var Ix = 'DropdownMenuLabel',
  Ov = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(yx, { ...o, ...r, ref: t });
  });
Ov.displayName = Ix;
var Ox = 'DropdownMenuItem',
  Dv = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(gx, { ...o, ...r, ref: t });
  });
Dv.displayName = Ox;
var Dx = 'DropdownMenuCheckboxItem',
  jv = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(wx, { ...o, ...r, ref: t });
  });
jv.displayName = Dx;
var jx = 'DropdownMenuRadioGroup',
  Lx = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(Sx, { ...o, ...r, ref: t });
  });
Lx.displayName = jx;
var bx = 'DropdownMenuRadioItem',
  Lv = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(xx, { ...o, ...r, ref: t });
  });
Lv.displayName = bx;
var Fx = 'DropdownMenuItemIndicator',
  bv = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(Cx, { ...o, ...r, ref: t });
  });
bv.displayName = Fx;
var $x = 'DropdownMenuSeparator',
  Fv = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(Ex, { ...o, ...r, ref: t });
  });
Fv.displayName = $x;
var zx = 'DropdownMenuArrow',
  Bx = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(kx, { ...o, ...r, ref: t });
  });
Bx.displayName = zx;
var Ux = 'DropdownMenuSubTrigger',
  $v = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(Px, { ...o, ...r, ref: t });
  });
$v.displayName = Ux;
var Vx = 'DropdownMenuSubContent',
  zv = c.forwardRef((e, t) => {
    const { __scopeDropdownMenu: n, ...r } = e,
      o = De(n);
    return g.jsx(_x, {
      ...o,
      ...r,
      ref: t,
      style: {
        ...e.style,
        '--radix-dropdown-menu-content-transform-origin':
          'var(--radix-popper-transform-origin)',
        '--radix-dropdown-menu-content-available-width':
          'var(--radix-popper-available-width)',
        '--radix-dropdown-menu-content-available-height':
          'var(--radix-popper-available-height)',
        '--radix-dropdown-menu-trigger-width':
          'var(--radix-popper-anchor-width)',
        '--radix-dropdown-menu-trigger-height':
          'var(--radix-popper-anchor-height)',
      },
    });
  });
zv.displayName = Vx;
var r4 = Rv,
  o4 = Mv,
  i4 = Nv,
  l4 = Iv,
  a4 = Ov,
  s4 = Dv,
  u4 = jv,
  c4 = Lv,
  d4 = bv,
  f4 = Fv,
  p4 = $v,
  m4 = zv,
  ju = 'Progress',
  Lu = 100,
  [Hx, v4] = Be(ju),
  [Wx, Kx] = Hx(ju),
  Bv = c.forwardRef((e, t) => {
    const {
      __scopeProgress: n,
      value: r = null,
      max: o,
      getValueLabel: i = Gx,
      ...l
    } = e;
    (o || o === 0) && !Id(o) && console.error(Qx(`${o}`, 'Progress'));
    const a = Id(o) ? o : Lu;
    r !== null && !Od(r, a) && console.error(Yx(`${r}`, 'Progress'));
    const s = Od(r, a) ? r : null,
      u = Ti(s) ? i(s, a) : void 0;
    return g.jsx(Wx, {
      scope: n,
      value: s,
      max: a,
      children: g.jsx(D.div, {
        'aria-valuemax': a,
        'aria-valuemin': 0,
        'aria-valuenow': Ti(s) ? s : void 0,
        'aria-valuetext': u,
        role: 'progressbar',
        'data-state': Hv(s, a),
        'data-value': s ?? void 0,
        'data-max': a,
        ...l,
        ref: t,
      }),
    });
  });
Bv.displayName = ju;
var Uv = 'ProgressIndicator',
  Vv = c.forwardRef((e, t) => {
    const { __scopeProgress: n, ...r } = e,
      o = Kx(Uv, n);
    return g.jsx(D.div, {
      'data-state': Hv(o.value, o.max),
      'data-value': o.value ?? void 0,
      'data-max': o.max,
      ...r,
      ref: t,
    });
  });
Vv.displayName = Uv;
function Gx(e, t) {
  return `${Math.round((e / t) * 100)}%`;
}
function Hv(e, t) {
  return e == null ? 'indeterminate' : e === t ? 'complete' : 'loading';
}
function Ti(e) {
  return typeof e == 'number';
}
function Id(e) {
  return Ti(e) && !isNaN(e) && e > 0;
}
function Od(e, t) {
  return Ti(e) && !isNaN(e) && e <= t && e >= 0;
}
function Qx(e, t) {
  return `Invalid prop \`max\` of value \`${e}\` supplied to \`${t}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${Lu}\`.`;
}
function Yx(e, t) {
  return `Invalid prop \`value\` of value \`${e}\` supplied to \`${t}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${Lu} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var h4 = Bv,
  y4 = Vv,
  Xx = 'Label',
  Wv = c.forwardRef((e, t) =>
    g.jsx(D.label, {
      ...e,
      ref: t,
      onMouseDown: n => {
        n.target.closest('button, input, select, textarea') ||
          (e.onMouseDown?.(n),
          !n.defaultPrevented && n.detail > 1 && n.preventDefault());
      },
    })
  );
Wv.displayName = Xx;
var g4 = Wv;
function bu(e) {
  const t = c.useRef({ value: e, previous: e });
  return c.useMemo(
    () => (
      t.current.value !== e &&
        ((t.current.previous = t.current.value), (t.current.value = e)),
      t.current.previous
    ),
    [e]
  );
}
var qx = [' ', 'Enter', 'ArrowUp', 'ArrowDown'],
  Zx = [' ', 'Enter'],
  Sn = 'Select',
  [ml, vl, Jx] = Gi(Sn),
  [ur, w4] = Be(Sn, [Jx, al]),
  hl = al(),
  [eC, rn] = ur(Sn),
  [tC, nC] = ur(Sn),
  Kv = e => {
    const {
        __scopeSelect: t,
        children: n,
        open: r,
        defaultOpen: o,
        onOpenChange: i,
        value: l,
        defaultValue: a,
        onValueChange: s,
        dir: u,
        name: f,
        autoComplete: m,
        disabled: y,
        required: S,
        form: C,
      } = e,
      h = hl(t),
      [w, p] = c.useState(null),
      [d, v] = c.useState(null),
      [x, E] = c.useState(!1),
      P = il(u),
      [k, _] = At({ prop: r, defaultProp: o ?? !1, onChange: i, caller: Sn }),
      [L, A] = At({ prop: l, defaultProp: a, onChange: s, caller: Sn }),
      $ = c.useRef(null),
      G = w ? C || !!w.closest('form') : !0,
      [Q, j] = c.useState(new Set()),
      H = Array.from(Q)
        .map(F => F.props.value)
        .join(';');
    return g.jsx(Bm, {
      ...h,
      children: g.jsxs(eC, {
        required: S,
        scope: t,
        trigger: w,
        onTriggerChange: p,
        valueNode: d,
        onValueNodeChange: v,
        valueNodeHasChildren: x,
        onValueNodeHasChildrenChange: E,
        contentId: St(),
        value: L,
        onValueChange: A,
        open: k,
        onOpenChange: _,
        dir: P,
        triggerPointerDownPosRef: $,
        disabled: y,
        children: [
          g.jsx(ml.Provider, {
            scope: t,
            children: g.jsx(tC, {
              scope: e.__scopeSelect,
              onNativeOptionAdd: c.useCallback(F => {
                j(Y => new Set(Y).add(F));
              }, []),
              onNativeOptionRemove: c.useCallback(F => {
                j(Y => {
                  const b = new Set(Y);
                  return (b.delete(F), b);
                });
              }, []),
              children: n,
            }),
          }),
          G
            ? g.jsxs(
                hh,
                {
                  'aria-hidden': !0,
                  required: S,
                  tabIndex: -1,
                  name: f,
                  autoComplete: m,
                  value: L,
                  onChange: F => A(F.target.value),
                  disabled: y,
                  form: C,
                  children: [
                    L === void 0 ? g.jsx('option', { value: '' }) : null,
                    Array.from(Q),
                  ],
                },
                H
              )
            : null,
        ],
      }),
    });
  };
Kv.displayName = Sn;
var Gv = 'SelectTrigger',
  Qv = c.forwardRef((e, t) => {
    const { __scopeSelect: n, disabled: r = !1, ...o } = e,
      i = hl(n),
      l = rn(Gv, n),
      a = l.disabled || r,
      s = B(t, l.onTriggerChange),
      u = vl(n),
      f = c.useRef('touch'),
      [m, y, S] = gh(h => {
        const w = u().filter(v => !v.disabled),
          p = w.find(v => v.value === l.value),
          d = wh(w, h, p);
        d !== void 0 && l.onValueChange(d.value);
      }),
      C = h => {
        (a || (l.onOpenChange(!0), S()),
          h &&
            (l.triggerPointerDownPosRef.current = {
              x: Math.round(h.pageX),
              y: Math.round(h.pageY),
            }));
      };
    return g.jsx(Um, {
      asChild: !0,
      ...i,
      children: g.jsx(D.button, {
        type: 'button',
        role: 'combobox',
        'aria-controls': l.contentId,
        'aria-expanded': l.open,
        'aria-required': l.required,
        'aria-autocomplete': 'none',
        dir: l.dir,
        'data-state': l.open ? 'open' : 'closed',
        disabled: a,
        'data-disabled': a ? '' : void 0,
        'data-placeholder': yh(l.value) ? '' : void 0,
        ...o,
        ref: s,
        onClick: M(o.onClick, h => {
          (h.currentTarget.focus(), f.current !== 'mouse' && C(h));
        }),
        onPointerDown: M(o.onPointerDown, h => {
          f.current = h.pointerType;
          const w = h.target;
          (w.hasPointerCapture(h.pointerId) &&
            w.releasePointerCapture(h.pointerId),
            h.button === 0 &&
              h.ctrlKey === !1 &&
              h.pointerType === 'mouse' &&
              (C(h), h.preventDefault()));
        }),
        onKeyDown: M(o.onKeyDown, h => {
          const w = m.current !== '';
          (!(h.ctrlKey || h.altKey || h.metaKey) &&
            h.key.length === 1 &&
            y(h.key),
            !(w && h.key === ' ') &&
              qx.includes(h.key) &&
              (C(), h.preventDefault()));
        }),
      }),
    });
  });
Qv.displayName = Gv;
var Yv = 'SelectValue',
  Xv = c.forwardRef((e, t) => {
    const {
        __scopeSelect: n,
        className: r,
        style: o,
        children: i,
        placeholder: l = '',
        ...a
      } = e,
      s = rn(Yv, n),
      { onValueNodeHasChildrenChange: u } = s,
      f = i !== void 0,
      m = B(t, s.onValueNodeChange);
    return (
      de(() => {
        u(f);
      }, [u, f]),
      g.jsx(D.span, {
        ...a,
        ref: m,
        style: { pointerEvents: 'none' },
        children: yh(s.value) ? g.jsx(g.Fragment, { children: l }) : i,
      })
    );
  });
Xv.displayName = Yv;
var rC = 'SelectIcon',
  qv = c.forwardRef((e, t) => {
    const { __scopeSelect: n, children: r, ...o } = e;
    return g.jsx(D.span, {
      'aria-hidden': !0,
      ...o,
      ref: t,
      children: r || '▼',
    });
  });
qv.displayName = rC;
var oC = 'SelectPortal',
  Zv = e => g.jsx(so, { asChild: !0, ...e });
Zv.displayName = oC;
var xn = 'SelectContent',
  Jv = c.forwardRef((e, t) => {
    const n = rn(xn, e.__scopeSelect),
      [r, o] = c.useState();
    if (
      (de(() => {
        o(new DocumentFragment());
      }, []),
      !n.open)
    ) {
      const i = r;
      return i
        ? Pn.createPortal(
            g.jsx(eh, {
              scope: e.__scopeSelect,
              children: g.jsx(ml.Slot, {
                scope: e.__scopeSelect,
                children: g.jsx('div', { children: e.children }),
              }),
            }),
            i
          )
        : null;
    }
    return g.jsx(th, { ...e, ref: t });
  });
Jv.displayName = xn;
var lt = 10,
  [eh, on] = ur(xn),
  iC = 'SelectContentImpl',
  lC = wn('SelectContent.RemoveScroll'),
  th = c.forwardRef((e, t) => {
    const {
        __scopeSelect: n,
        position: r = 'item-aligned',
        onCloseAutoFocus: o,
        onEscapeKeyDown: i,
        onPointerDownOutside: l,
        side: a,
        sideOffset: s,
        align: u,
        alignOffset: f,
        arrowPadding: m,
        collisionBoundary: y,
        collisionPadding: S,
        sticky: C,
        hideWhenDetached: h,
        avoidCollisions: w,
        ...p
      } = e,
      d = rn(xn, n),
      [v, x] = c.useState(null),
      [E, P] = c.useState(null),
      k = B(t, O => x(O)),
      [_, L] = c.useState(null),
      [A, $] = c.useState(null),
      G = vl(n),
      [Q, j] = c.useState(!1),
      H = c.useRef(!1);
    (c.useEffect(() => {
      if (v) return gs(v);
    }, [v]),
      ku());
    const F = c.useCallback(
        O => {
          const [q, ...Te] = G().map(ue => ue.ref.current),
            [Z] = Te.slice(-1),
            te = document.activeElement;
          for (const ue of O)
            if (
              ue === te ||
              (ue?.scrollIntoView({ block: 'nearest' }),
              ue === q && E && (E.scrollTop = 0),
              ue === Z && E && (E.scrollTop = E.scrollHeight),
              ue?.focus(),
              document.activeElement !== te)
            )
              return;
        },
        [G, E]
      ),
      Y = c.useCallback(() => F([_, v]), [F, _, v]);
    c.useEffect(() => {
      Q && Y();
    }, [Q, Y]);
    const { onOpenChange: b, triggerPointerDownPosRef: I } = d;
    (c.useEffect(() => {
      if (v) {
        let O = { x: 0, y: 0 };
        const q = Z => {
            O = {
              x: Math.abs(Math.round(Z.pageX) - (I.current?.x ?? 0)),
              y: Math.abs(Math.round(Z.pageY) - (I.current?.y ?? 0)),
            };
          },
          Te = Z => {
            (O.x <= 10 && O.y <= 10
              ? Z.preventDefault()
              : v.contains(Z.target) || b(!1),
              document.removeEventListener('pointermove', q),
              (I.current = null));
          };
        return (
          I.current !== null &&
            (document.addEventListener('pointermove', q),
            document.addEventListener('pointerup', Te, {
              capture: !0,
              once: !0,
            })),
          () => {
            (document.removeEventListener('pointermove', q),
              document.removeEventListener('pointerup', Te, { capture: !0 }));
          }
        );
      }
    }, [v, b, I]),
      c.useEffect(() => {
        const O = () => b(!1);
        return (
          window.addEventListener('blur', O),
          window.addEventListener('resize', O),
          () => {
            (window.removeEventListener('blur', O),
              window.removeEventListener('resize', O));
          }
        );
      }, [b]));
    const [ae, he] = gh(O => {
        const q = G().filter(te => !te.disabled),
          Te = q.find(te => te.ref.current === document.activeElement),
          Z = wh(q, O, Te);
        Z && setTimeout(() => Z.ref.current.focus());
      }),
      _e = c.useCallback(
        (O, q, Te) => {
          const Z = !H.current && !Te;
          ((d.value !== void 0 && d.value === q) || Z) &&
            (L(O), Z && (H.current = !0));
        },
        [d.value]
      ),
      je = c.useCallback(() => v?.focus(), [v]),
      Re = c.useCallback(
        (O, q, Te) => {
          const Z = !H.current && !Te;
          ((d.value !== void 0 && d.value === q) || Z) && $(O);
        },
        [d.value]
      ),
      xt = r === 'popper' ? ps : nh,
      Ue =
        xt === ps
          ? {
              side: a,
              sideOffset: s,
              align: u,
              alignOffset: f,
              arrowPadding: m,
              collisionBoundary: y,
              collisionPadding: S,
              sticky: C,
              hideWhenDetached: h,
              avoidCollisions: w,
            }
          : {};
    return g.jsx(eh, {
      scope: n,
      content: v,
      viewport: E,
      onViewportChange: P,
      itemRefCallback: _e,
      selectedItem: _,
      onItemLeave: je,
      itemTextRefCallback: Re,
      focusSelectedItem: Y,
      selectedItemText: A,
      position: r,
      isPositioned: Q,
      searchRef: ae,
      children: g.jsx(cl, {
        as: lC,
        allowPinchZoom: !0,
        children: g.jsx(ll, {
          asChild: !0,
          trapped: d.open,
          onMountAutoFocus: O => {
            O.preventDefault();
          },
          onUnmountAutoFocus: M(o, O => {
            (d.trigger?.focus({ preventScroll: !0 }), O.preventDefault());
          }),
          children: g.jsx(ao, {
            asChild: !0,
            disableOutsidePointerEvents: !0,
            onEscapeKeyDown: i,
            onPointerDownOutside: l,
            onFocusOutside: O => O.preventDefault(),
            onDismiss: () => d.onOpenChange(!1),
            children: g.jsx(xt, {
              role: 'listbox',
              id: d.contentId,
              'data-state': d.open ? 'open' : 'closed',
              dir: d.dir,
              onContextMenu: O => O.preventDefault(),
              ...p,
              ...Ue,
              onPlaced: () => j(!0),
              ref: k,
              style: {
                display: 'flex',
                flexDirection: 'column',
                outline: 'none',
                ...p.style,
              },
              onKeyDown: M(p.onKeyDown, O => {
                const q = O.ctrlKey || O.altKey || O.metaKey;
                if (
                  (O.key === 'Tab' && O.preventDefault(),
                  !q && O.key.length === 1 && he(O.key),
                  ['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(O.key))
                ) {
                  let Z = G()
                    .filter(te => !te.disabled)
                    .map(te => te.ref.current);
                  if (
                    (['ArrowUp', 'End'].includes(O.key) &&
                      (Z = Z.slice().reverse()),
                    ['ArrowUp', 'ArrowDown'].includes(O.key))
                  ) {
                    const te = O.target,
                      ue = Z.indexOf(te);
                    Z = Z.slice(ue + 1);
                  }
                  (setTimeout(() => F(Z)), O.preventDefault());
                }
              }),
            }),
          }),
        }),
      }),
    });
  });
th.displayName = iC;
var aC = 'SelectItemAlignedPosition',
  nh = c.forwardRef((e, t) => {
    const { __scopeSelect: n, onPlaced: r, ...o } = e,
      i = rn(xn, n),
      l = on(xn, n),
      [a, s] = c.useState(null),
      [u, f] = c.useState(null),
      m = B(t, k => f(k)),
      y = vl(n),
      S = c.useRef(!1),
      C = c.useRef(!0),
      {
        viewport: h,
        selectedItem: w,
        selectedItemText: p,
        focusSelectedItem: d,
      } = l,
      v = c.useCallback(() => {
        if (i.trigger && i.valueNode && a && u && h && w && p) {
          const k = i.trigger.getBoundingClientRect(),
            _ = u.getBoundingClientRect(),
            L = i.valueNode.getBoundingClientRect(),
            A = p.getBoundingClientRect();
          if (i.dir !== 'rtl') {
            const te = A.left - _.left,
              ue = L.left - te,
              Ye = k.left - ue,
              ln = k.width + Ye,
              xl = Math.max(ln, _.width),
              Cl = window.innerWidth - lt,
              El = Ku(ue, [lt, Math.max(lt, Cl - xl)]);
            ((a.style.minWidth = ln + 'px'), (a.style.left = El + 'px'));
          } else {
            const te = _.right - A.right,
              ue = window.innerWidth - L.right - te,
              Ye = window.innerWidth - k.right - ue,
              ln = k.width + Ye,
              xl = Math.max(ln, _.width),
              Cl = window.innerWidth - lt,
              El = Ku(ue, [lt, Math.max(lt, Cl - xl)]);
            ((a.style.minWidth = ln + 'px'), (a.style.right = El + 'px'));
          }
          const $ = y(),
            G = window.innerHeight - lt * 2,
            Q = h.scrollHeight,
            j = window.getComputedStyle(u),
            H = parseInt(j.borderTopWidth, 10),
            F = parseInt(j.paddingTop, 10),
            Y = parseInt(j.borderBottomWidth, 10),
            b = parseInt(j.paddingBottom, 10),
            I = H + F + Q + b + Y,
            ae = Math.min(w.offsetHeight * 5, I),
            he = window.getComputedStyle(h),
            _e = parseInt(he.paddingTop, 10),
            je = parseInt(he.paddingBottom, 10),
            Re = k.top + k.height / 2 - lt,
            xt = G - Re,
            Ue = w.offsetHeight / 2,
            O = w.offsetTop + Ue,
            q = H + F + O,
            Te = I - q;
          if (q <= Re) {
            const te = $.length > 0 && w === $[$.length - 1].ref.current;
            a.style.bottom = '0px';
            const ue = u.clientHeight - h.offsetTop - h.offsetHeight,
              Ye = Math.max(xt, Ue + (te ? je : 0) + ue + Y),
              ln = q + Ye;
            a.style.height = ln + 'px';
          } else {
            const te = $.length > 0 && w === $[0].ref.current;
            a.style.top = '0px';
            const Ye = Math.max(Re, H + h.offsetTop + (te ? _e : 0) + Ue) + Te;
            ((a.style.height = Ye + 'px'),
              (h.scrollTop = q - Re + h.offsetTop));
          }
          ((a.style.margin = `${lt}px 0`),
            (a.style.minHeight = ae + 'px'),
            (a.style.maxHeight = G + 'px'),
            r?.(),
            requestAnimationFrame(() => (S.current = !0)));
        }
      }, [y, i.trigger, i.valueNode, a, u, h, w, p, i.dir, r]);
    de(() => v(), [v]);
    const [x, E] = c.useState();
    de(() => {
      u && E(window.getComputedStyle(u).zIndex);
    }, [u]);
    const P = c.useCallback(
      k => {
        k && C.current === !0 && (v(), d?.(), (C.current = !1));
      },
      [v, d]
    );
    return g.jsx(uC, {
      scope: n,
      contentWrapper: a,
      shouldExpandOnScrollRef: S,
      onScrollButtonChange: P,
      children: g.jsx('div', {
        ref: s,
        style: {
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          zIndex: x,
        },
        children: g.jsx(D.div, {
          ...o,
          ref: m,
          style: { boxSizing: 'border-box', maxHeight: '100%', ...o.style },
        }),
      }),
    });
  });
nh.displayName = aC;
var sC = 'SelectPopperPosition',
  ps = c.forwardRef((e, t) => {
    const {
        __scopeSelect: n,
        align: r = 'start',
        collisionPadding: o = lt,
        ...i
      } = e,
      l = hl(n);
    return g.jsx(Vm, {
      ...l,
      ...i,
      ref: t,
      align: r,
      collisionPadding: o,
      style: {
        boxSizing: 'border-box',
        ...i.style,
        '--radix-select-content-transform-origin':
          'var(--radix-popper-transform-origin)',
        '--radix-select-content-available-width':
          'var(--radix-popper-available-width)',
        '--radix-select-content-available-height':
          'var(--radix-popper-available-height)',
        '--radix-select-trigger-width': 'var(--radix-popper-anchor-width)',
        '--radix-select-trigger-height': 'var(--radix-popper-anchor-height)',
      },
    });
  });
ps.displayName = sC;
var [uC, Fu] = ur(xn, {}),
  ms = 'SelectViewport',
  rh = c.forwardRef((e, t) => {
    const { __scopeSelect: n, nonce: r, ...o } = e,
      i = on(ms, n),
      l = Fu(ms, n),
      a = B(t, i.onViewportChange),
      s = c.useRef(0);
    return g.jsxs(g.Fragment, {
      children: [
        g.jsx('style', {
          dangerouslySetInnerHTML: {
            __html:
              '[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}',
          },
          nonce: r,
        }),
        g.jsx(ml.Slot, {
          scope: n,
          children: g.jsx(D.div, {
            'data-radix-select-viewport': '',
            role: 'presentation',
            ...o,
            ref: a,
            style: {
              position: 'relative',
              flex: 1,
              overflow: 'hidden auto',
              ...o.style,
            },
            onScroll: M(o.onScroll, u => {
              const f = u.currentTarget,
                { contentWrapper: m, shouldExpandOnScrollRef: y } = l;
              if (y?.current && m) {
                const S = Math.abs(s.current - f.scrollTop);
                if (S > 0) {
                  const C = window.innerHeight - lt * 2,
                    h = parseFloat(m.style.minHeight),
                    w = parseFloat(m.style.height),
                    p = Math.max(h, w);
                  if (p < C) {
                    const d = p + S,
                      v = Math.min(C, d),
                      x = d - v;
                    ((m.style.height = v + 'px'),
                      m.style.bottom === '0px' &&
                        ((f.scrollTop = x > 0 ? x : 0),
                        (m.style.justifyContent = 'flex-end')));
                  }
                }
              }
              s.current = f.scrollTop;
            }),
          }),
        }),
      ],
    });
  });
rh.displayName = ms;
var oh = 'SelectGroup',
  [cC, dC] = ur(oh),
  fC = c.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e,
      o = St();
    return g.jsx(cC, {
      scope: n,
      id: o,
      children: g.jsx(D.div, {
        role: 'group',
        'aria-labelledby': o,
        ...r,
        ref: t,
      }),
    });
  });
fC.displayName = oh;
var ih = 'SelectLabel',
  lh = c.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e,
      o = dC(ih, n);
    return g.jsx(D.div, { id: o.id, ...r, ref: t });
  });
lh.displayName = ih;
var Mi = 'SelectItem',
  [pC, ah] = ur(Mi),
  sh = c.forwardRef((e, t) => {
    const {
        __scopeSelect: n,
        value: r,
        disabled: o = !1,
        textValue: i,
        ...l
      } = e,
      a = rn(Mi, n),
      s = on(Mi, n),
      u = a.value === r,
      [f, m] = c.useState(i ?? ''),
      [y, S] = c.useState(!1),
      C = B(t, d => s.itemRefCallback?.(d, r, o)),
      h = St(),
      w = c.useRef('touch'),
      p = () => {
        o || (a.onValueChange(r), a.onOpenChange(!1));
      };
    if (r === '')
      throw new Error(
        'A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.'
      );
    return g.jsx(pC, {
      scope: n,
      value: r,
      disabled: o,
      textId: h,
      isSelected: u,
      onItemTextChange: c.useCallback(d => {
        m(v => v || (d?.textContent ?? '').trim());
      }, []),
      children: g.jsx(ml.ItemSlot, {
        scope: n,
        value: r,
        disabled: o,
        textValue: f,
        children: g.jsx(D.div, {
          role: 'option',
          'aria-labelledby': h,
          'data-highlighted': y ? '' : void 0,
          'aria-selected': u && y,
          'data-state': u ? 'checked' : 'unchecked',
          'aria-disabled': o || void 0,
          'data-disabled': o ? '' : void 0,
          tabIndex: o ? void 0 : -1,
          ...l,
          ref: C,
          onFocus: M(l.onFocus, () => S(!0)),
          onBlur: M(l.onBlur, () => S(!1)),
          onClick: M(l.onClick, () => {
            w.current !== 'mouse' && p();
          }),
          onPointerUp: M(l.onPointerUp, () => {
            w.current === 'mouse' && p();
          }),
          onPointerDown: M(l.onPointerDown, d => {
            w.current = d.pointerType;
          }),
          onPointerMove: M(l.onPointerMove, d => {
            ((w.current = d.pointerType),
              o
                ? s.onItemLeave?.()
                : w.current === 'mouse' &&
                  d.currentTarget.focus({ preventScroll: !0 }));
          }),
          onPointerLeave: M(l.onPointerLeave, d => {
            d.currentTarget === document.activeElement && s.onItemLeave?.();
          }),
          onKeyDown: M(l.onKeyDown, d => {
            (s.searchRef?.current !== '' && d.key === ' ') ||
              (Zx.includes(d.key) && p(), d.key === ' ' && d.preventDefault());
          }),
        }),
      }),
    });
  });
sh.displayName = Mi;
var kr = 'SelectItemText',
  uh = c.forwardRef((e, t) => {
    const { __scopeSelect: n, className: r, style: o, ...i } = e,
      l = rn(kr, n),
      a = on(kr, n),
      s = ah(kr, n),
      u = nC(kr, n),
      [f, m] = c.useState(null),
      y = B(
        t,
        p => m(p),
        s.onItemTextChange,
        p => a.itemTextRefCallback?.(p, s.value, s.disabled)
      ),
      S = f?.textContent,
      C = c.useMemo(
        () =>
          g.jsx(
            'option',
            { value: s.value, disabled: s.disabled, children: S },
            s.value
          ),
        [s.disabled, s.value, S]
      ),
      { onNativeOptionAdd: h, onNativeOptionRemove: w } = u;
    return (
      de(() => (h(C), () => w(C)), [h, w, C]),
      g.jsxs(g.Fragment, {
        children: [
          g.jsx(D.span, { id: s.textId, ...i, ref: y }),
          s.isSelected && l.valueNode && !l.valueNodeHasChildren
            ? Pn.createPortal(i.children, l.valueNode)
            : null,
        ],
      })
    );
  });
uh.displayName = kr;
var ch = 'SelectItemIndicator',
  dh = c.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return ah(ch, n).isSelected
      ? g.jsx(D.span, { 'aria-hidden': !0, ...r, ref: t })
      : null;
  });
dh.displayName = ch;
var vs = 'SelectScrollUpButton',
  fh = c.forwardRef((e, t) => {
    const n = on(vs, e.__scopeSelect),
      r = Fu(vs, e.__scopeSelect),
      [o, i] = c.useState(!1),
      l = B(t, r.onScrollButtonChange);
    return (
      de(() => {
        if (n.viewport && n.isPositioned) {
          let a = function () {
            const u = s.scrollTop > 0;
            i(u);
          };
          const s = n.viewport;
          return (
            a(),
            s.addEventListener('scroll', a),
            () => s.removeEventListener('scroll', a)
          );
        }
      }, [n.viewport, n.isPositioned]),
      o
        ? g.jsx(mh, {
            ...e,
            ref: l,
            onAutoScroll: () => {
              const { viewport: a, selectedItem: s } = n;
              a && s && (a.scrollTop = a.scrollTop - s.offsetHeight);
            },
          })
        : null
    );
  });
fh.displayName = vs;
var hs = 'SelectScrollDownButton',
  ph = c.forwardRef((e, t) => {
    const n = on(hs, e.__scopeSelect),
      r = Fu(hs, e.__scopeSelect),
      [o, i] = c.useState(!1),
      l = B(t, r.onScrollButtonChange);
    return (
      de(() => {
        if (n.viewport && n.isPositioned) {
          let a = function () {
            const u = s.scrollHeight - s.clientHeight,
              f = Math.ceil(s.scrollTop) < u;
            i(f);
          };
          const s = n.viewport;
          return (
            a(),
            s.addEventListener('scroll', a),
            () => s.removeEventListener('scroll', a)
          );
        }
      }, [n.viewport, n.isPositioned]),
      o
        ? g.jsx(mh, {
            ...e,
            ref: l,
            onAutoScroll: () => {
              const { viewport: a, selectedItem: s } = n;
              a && s && (a.scrollTop = a.scrollTop + s.offsetHeight);
            },
          })
        : null
    );
  });
ph.displayName = hs;
var mh = c.forwardRef((e, t) => {
    const { __scopeSelect: n, onAutoScroll: r, ...o } = e,
      i = on('SelectScrollButton', n),
      l = c.useRef(null),
      a = vl(n),
      s = c.useCallback(() => {
        l.current !== null &&
          (window.clearInterval(l.current), (l.current = null));
      }, []);
    return (
      c.useEffect(() => () => s(), [s]),
      de(() => {
        a()
          .find(f => f.ref.current === document.activeElement)
          ?.ref.current?.scrollIntoView({ block: 'nearest' });
      }, [a]),
      g.jsx(D.div, {
        'aria-hidden': !0,
        ...o,
        ref: t,
        style: { flexShrink: 0, ...o.style },
        onPointerDown: M(o.onPointerDown, () => {
          l.current === null && (l.current = window.setInterval(r, 50));
        }),
        onPointerMove: M(o.onPointerMove, () => {
          (i.onItemLeave?.(),
            l.current === null && (l.current = window.setInterval(r, 50)));
        }),
        onPointerLeave: M(o.onPointerLeave, () => {
          s();
        }),
      })
    );
  }),
  mC = 'SelectSeparator',
  vh = c.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e;
    return g.jsx(D.div, { 'aria-hidden': !0, ...r, ref: t });
  });
vh.displayName = mC;
var ys = 'SelectArrow',
  vC = c.forwardRef((e, t) => {
    const { __scopeSelect: n, ...r } = e,
      o = hl(n),
      i = rn(ys, n),
      l = on(ys, n);
    return i.open && l.position === 'popper'
      ? g.jsx(Hm, { ...o, ...r, ref: t })
      : null;
  });
vC.displayName = ys;
var hC = 'SelectBubbleInput',
  hh = c.forwardRef(({ __scopeSelect: e, value: t, ...n }, r) => {
    const o = c.useRef(null),
      i = B(r, o),
      l = bu(t);
    return (
      c.useEffect(() => {
        const a = o.current;
        if (!a) return;
        const s = window.HTMLSelectElement.prototype,
          f = Object.getOwnPropertyDescriptor(s, 'value').set;
        if (l !== t && f) {
          const m = new Event('change', { bubbles: !0 });
          (f.call(a, t), a.dispatchEvent(m));
        }
      }, [l, t]),
      g.jsx(D.select, {
        ...n,
        style: { ...qp, ...n.style },
        ref: i,
        defaultValue: t,
      })
    );
  });
hh.displayName = hC;
function yh(e) {
  return e === '' || e === void 0;
}
function gh(e) {
  const t = Ae(e),
    n = c.useRef(''),
    r = c.useRef(0),
    o = c.useCallback(
      l => {
        const a = n.current + l;
        (t(a),
          (function s(u) {
            ((n.current = u),
              window.clearTimeout(r.current),
              u !== '' && (r.current = window.setTimeout(() => s(''), 1e3)));
          })(a));
      },
      [t]
    ),
    i = c.useCallback(() => {
      ((n.current = ''), window.clearTimeout(r.current));
    }, []);
  return (
    c.useEffect(() => () => window.clearTimeout(r.current), []),
    [n, o, i]
  );
}
function wh(e, t, n) {
  const o = t.length > 1 && Array.from(t).every(u => u === t[0]) ? t[0] : t,
    i = n ? e.indexOf(n) : -1;
  let l = yC(e, Math.max(i, 0));
  o.length === 1 && (l = l.filter(u => u !== n));
  const s = l.find(u => u.textValue.toLowerCase().startsWith(o.toLowerCase()));
  return s !== n ? s : void 0;
}
function yC(e, t) {
  return e.map((n, r) => e[(t + r) % e.length]);
}
var S4 = Kv,
  x4 = Qv,
  C4 = Xv,
  E4 = qv,
  k4 = Zv,
  P4 = Jv,
  _4 = rh,
  R4 = lh,
  T4 = sh,
  M4 = uh,
  N4 = dh,
  A4 = fh,
  I4 = ph,
  O4 = vh,
  yl = 'Checkbox',
  [gC, D4] = Be(yl),
  [wC, $u] = gC(yl);
function SC(e) {
  const {
      __scopeCheckbox: t,
      checked: n,
      children: r,
      defaultChecked: o,
      disabled: i,
      form: l,
      name: a,
      onCheckedChange: s,
      required: u,
      value: f = 'on',
      internal_do_not_use_render: m,
    } = e,
    [y, S] = At({ prop: n, defaultProp: o ?? !1, onChange: s, caller: yl }),
    [C, h] = c.useState(null),
    [w, p] = c.useState(null),
    d = c.useRef(!1),
    v = C ? !!l || !!C.closest('form') : !0,
    x = {
      checked: y,
      disabled: i,
      setChecked: S,
      control: C,
      setControl: h,
      name: a,
      form: l,
      value: f,
      hasConsumerStoppedPropagationRef: d,
      required: u,
      defaultChecked: qt(o) ? !1 : o,
      isFormControl: v,
      bubbleInput: w,
      setBubbleInput: p,
    };
  return g.jsx(wC, { scope: t, ...x, children: EC(m) ? m(x) : r });
}
var Sh = 'CheckboxTrigger',
  xh = c.forwardRef(
    ({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...r }, o) => {
      const {
          control: i,
          value: l,
          disabled: a,
          checked: s,
          required: u,
          setControl: f,
          setChecked: m,
          hasConsumerStoppedPropagationRef: y,
          isFormControl: S,
          bubbleInput: C,
        } = $u(Sh, e),
        h = B(o, f),
        w = c.useRef(s);
      return (
        c.useEffect(() => {
          const p = i?.form;
          if (p) {
            const d = () => m(w.current);
            return (
              p.addEventListener('reset', d),
              () => p.removeEventListener('reset', d)
            );
          }
        }, [i, m]),
        g.jsx(D.button, {
          type: 'button',
          role: 'checkbox',
          'aria-checked': qt(s) ? 'mixed' : s,
          'aria-required': u,
          'data-state': Ph(s),
          'data-disabled': a ? '' : void 0,
          disabled: a,
          value: l,
          ...r,
          ref: h,
          onKeyDown: M(t, p => {
            p.key === 'Enter' && p.preventDefault();
          }),
          onClick: M(n, p => {
            (m(d => (qt(d) ? !0 : !d)),
              C &&
                S &&
                ((y.current = p.isPropagationStopped()),
                y.current || p.stopPropagation()));
          }),
        })
      );
    }
  );
xh.displayName = Sh;
var xC = c.forwardRef((e, t) => {
  const {
    __scopeCheckbox: n,
    name: r,
    checked: o,
    defaultChecked: i,
    required: l,
    disabled: a,
    value: s,
    onCheckedChange: u,
    form: f,
    ...m
  } = e;
  return g.jsx(SC, {
    __scopeCheckbox: n,
    checked: o,
    defaultChecked: i,
    disabled: a,
    required: l,
    onCheckedChange: u,
    name: r,
    form: f,
    value: s,
    internal_do_not_use_render: ({ isFormControl: y }) =>
      g.jsxs(g.Fragment, {
        children: [
          g.jsx(xh, { ...m, ref: t, __scopeCheckbox: n }),
          y && g.jsx(kh, { __scopeCheckbox: n }),
        ],
      }),
  });
});
xC.displayName = yl;
var Ch = 'CheckboxIndicator',
  CC = c.forwardRef((e, t) => {
    const { __scopeCheckbox: n, forceMount: r, ...o } = e,
      i = $u(Ch, n);
    return g.jsx(pt, {
      present: r || qt(i.checked) || i.checked === !0,
      children: g.jsx(D.span, {
        'data-state': Ph(i.checked),
        'data-disabled': i.disabled ? '' : void 0,
        ...o,
        ref: t,
        style: { pointerEvents: 'none', ...e.style },
      }),
    });
  });
CC.displayName = Ch;
var Eh = 'CheckboxBubbleInput',
  kh = c.forwardRef(({ __scopeCheckbox: e, ...t }, n) => {
    const {
        control: r,
        hasConsumerStoppedPropagationRef: o,
        checked: i,
        defaultChecked: l,
        required: a,
        disabled: s,
        name: u,
        value: f,
        form: m,
        bubbleInput: y,
        setBubbleInput: S,
      } = $u(Eh, e),
      C = B(n, S),
      h = bu(i),
      w = Pu(r);
    c.useEffect(() => {
      const d = y;
      if (!d) return;
      const v = window.HTMLInputElement.prototype,
        E = Object.getOwnPropertyDescriptor(v, 'checked').set,
        P = !o.current;
      if (h !== i && E) {
        const k = new Event('click', { bubbles: P });
        ((d.indeterminate = qt(i)),
          E.call(d, qt(i) ? !1 : i),
          d.dispatchEvent(k));
      }
    }, [y, h, i, o]);
    const p = c.useRef(qt(i) ? !1 : i);
    return g.jsx(D.input, {
      type: 'checkbox',
      'aria-hidden': !0,
      defaultChecked: l ?? p.current,
      required: a,
      disabled: s,
      name: u,
      value: f,
      form: m,
      ...t,
      tabIndex: -1,
      ref: C,
      style: {
        ...t.style,
        ...w,
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0,
        margin: 0,
        transform: 'translateX(-100%)',
      },
    });
  });
kh.displayName = Eh;
function EC(e) {
  return typeof e == 'function';
}
function qt(e) {
  return e === 'indeterminate';
}
function Ph(e) {
  return qt(e) ? 'indeterminate' : e ? 'checked' : 'unchecked';
}
var gl = 'Switch',
  [kC, j4] = Be(gl),
  [PC, _C] = kC(gl),
  _h = c.forwardRef((e, t) => {
    const {
        __scopeSwitch: n,
        name: r,
        checked: o,
        defaultChecked: i,
        required: l,
        disabled: a,
        value: s = 'on',
        onCheckedChange: u,
        form: f,
        ...m
      } = e,
      [y, S] = c.useState(null),
      C = B(t, v => S(v)),
      h = c.useRef(!1),
      w = y ? f || !!y.closest('form') : !0,
      [p, d] = At({ prop: o, defaultProp: i ?? !1, onChange: u, caller: gl });
    return g.jsxs(PC, {
      scope: n,
      checked: p,
      disabled: a,
      children: [
        g.jsx(D.button, {
          type: 'button',
          role: 'switch',
          'aria-checked': p,
          'aria-required': l,
          'data-state': Nh(p),
          'data-disabled': a ? '' : void 0,
          disabled: a,
          value: s,
          ...m,
          ref: C,
          onClick: M(e.onClick, v => {
            (d(x => !x),
              w &&
                ((h.current = v.isPropagationStopped()),
                h.current || v.stopPropagation()));
          }),
        }),
        w &&
          g.jsx(Mh, {
            control: y,
            bubbles: !h.current,
            name: r,
            value: s,
            checked: p,
            required: l,
            disabled: a,
            form: f,
            style: { transform: 'translateX(-100%)' },
          }),
      ],
    });
  });
_h.displayName = gl;
var Rh = 'SwitchThumb',
  Th = c.forwardRef((e, t) => {
    const { __scopeSwitch: n, ...r } = e,
      o = _C(Rh, n);
    return g.jsx(D.span, {
      'data-state': Nh(o.checked),
      'data-disabled': o.disabled ? '' : void 0,
      ...r,
      ref: t,
    });
  });
Th.displayName = Rh;
var RC = 'SwitchBubbleInput',
  Mh = c.forwardRef(
    (
      { __scopeSwitch: e, control: t, checked: n, bubbles: r = !0, ...o },
      i
    ) => {
      const l = c.useRef(null),
        a = B(l, i),
        s = bu(n),
        u = Pu(t);
      return (
        c.useEffect(() => {
          const f = l.current;
          if (!f) return;
          const m = window.HTMLInputElement.prototype,
            S = Object.getOwnPropertyDescriptor(m, 'checked').set;
          if (s !== n && S) {
            const C = new Event('click', { bubbles: r });
            (S.call(f, n), f.dispatchEvent(C));
          }
        }, [s, n, r]),
        g.jsx('input', {
          type: 'checkbox',
          'aria-hidden': !0,
          defaultChecked: n,
          ...o,
          tabIndex: -1,
          ref: a,
          style: {
            ...o.style,
            ...u,
            position: 'absolute',
            pointerEvents: 'none',
            opacity: 0,
            margin: 0,
          },
        })
      );
    }
  );
Mh.displayName = RC;
function Nh(e) {
  return e ? 'checked' : 'unchecked';
}
var L4 = _h,
  b4 = Th,
  wl = 'Tabs',
  [TC, F4] = Be(wl, [sl]),
  Ah = sl(),
  [MC, zu] = TC(wl),
  Ih = c.forwardRef((e, t) => {
    const {
        __scopeTabs: n,
        value: r,
        onValueChange: o,
        defaultValue: i,
        orientation: l = 'horizontal',
        dir: a,
        activationMode: s = 'automatic',
        ...u
      } = e,
      f = il(a),
      [m, y] = At({ prop: r, onChange: o, defaultProp: i ?? '', caller: wl });
    return g.jsx(MC, {
      scope: n,
      baseId: St(),
      value: m,
      onValueChange: y,
      orientation: l,
      dir: f,
      activationMode: s,
      children: g.jsx(D.div, { dir: f, 'data-orientation': l, ...u, ref: t }),
    });
  });
Ih.displayName = wl;
var Oh = 'TabsList',
  Dh = c.forwardRef((e, t) => {
    const { __scopeTabs: n, loop: r = !0, ...o } = e,
      i = zu(Oh, n),
      l = Ah(n);
    return g.jsx(Xm, {
      asChild: !0,
      ...l,
      orientation: i.orientation,
      dir: i.dir,
      loop: r,
      children: g.jsx(D.div, {
        role: 'tablist',
        'aria-orientation': i.orientation,
        ...o,
        ref: t,
      }),
    });
  });
Dh.displayName = Oh;
var jh = 'TabsTrigger',
  Lh = c.forwardRef((e, t) => {
    const { __scopeTabs: n, value: r, disabled: o = !1, ...i } = e,
      l = zu(jh, n),
      a = Ah(n),
      s = $h(l.baseId, r),
      u = zh(l.baseId, r),
      f = r === l.value;
    return g.jsx(qm, {
      asChild: !0,
      ...a,
      focusable: !o,
      active: f,
      children: g.jsx(D.button, {
        type: 'button',
        role: 'tab',
        'aria-selected': f,
        'aria-controls': u,
        'data-state': f ? 'active' : 'inactive',
        'data-disabled': o ? '' : void 0,
        disabled: o,
        id: s,
        ...i,
        ref: t,
        onMouseDown: M(e.onMouseDown, m => {
          !o && m.button === 0 && m.ctrlKey === !1
            ? l.onValueChange(r)
            : m.preventDefault();
        }),
        onKeyDown: M(e.onKeyDown, m => {
          [' ', 'Enter'].includes(m.key) && l.onValueChange(r);
        }),
        onFocus: M(e.onFocus, () => {
          const m = l.activationMode !== 'manual';
          !f && !o && m && l.onValueChange(r);
        }),
      }),
    });
  });
Lh.displayName = jh;
var bh = 'TabsContent',
  Fh = c.forwardRef((e, t) => {
    const { __scopeTabs: n, value: r, forceMount: o, children: i, ...l } = e,
      a = zu(bh, n),
      s = $h(a.baseId, r),
      u = zh(a.baseId, r),
      f = r === a.value,
      m = c.useRef(f);
    return (
      c.useEffect(() => {
        const y = requestAnimationFrame(() => (m.current = !1));
        return () => cancelAnimationFrame(y);
      }, []),
      g.jsx(pt, {
        present: o || f,
        children: ({ present: y }) =>
          g.jsx(D.div, {
            'data-state': f ? 'active' : 'inactive',
            'data-orientation': a.orientation,
            role: 'tabpanel',
            'aria-labelledby': s,
            hidden: !y,
            id: u,
            tabIndex: 0,
            ...l,
            ref: t,
            style: { ...e.style, animationDuration: m.current ? '0s' : void 0 },
            children: y && i,
          }),
      })
    );
  });
Fh.displayName = bh;
function $h(e, t) {
  return `${e}-trigger-${t}`;
}
function zh(e, t) {
  return `${e}-content-${t}`;
}
var $4 = Ih,
  z4 = Dh,
  B4 = Lh,
  U4 = Fh,
  Sl = 'Dialog',
  [Bh, Uh] = Be(Sl),
  [NC, mt] = Bh(Sl),
  Vh = e => {
    const {
        __scopeDialog: t,
        children: n,
        open: r,
        defaultOpen: o,
        onOpenChange: i,
        modal: l = !0,
      } = e,
      a = c.useRef(null),
      s = c.useRef(null),
      [u, f] = At({ prop: r, defaultProp: o ?? !1, onChange: i, caller: Sl });
    return g.jsx(NC, {
      scope: t,
      triggerRef: a,
      contentRef: s,
      contentId: St(),
      titleId: St(),
      descriptionId: St(),
      open: u,
      onOpenChange: f,
      onOpenToggle: c.useCallback(() => f(m => !m), [f]),
      modal: l,
      children: n,
    });
  };
Vh.displayName = Sl;
var Hh = 'DialogTrigger',
  Wh = c.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = mt(Hh, n),
      i = B(t, o.triggerRef);
    return g.jsx(D.button, {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': o.open,
      'aria-controls': o.contentId,
      'data-state': Vu(o.open),
      ...r,
      ref: i,
      onClick: M(e.onClick, o.onOpenToggle),
    });
  });
Wh.displayName = Hh;
var Bu = 'DialogPortal',
  [AC, Kh] = Bh(Bu, { forceMount: void 0 }),
  Gh = e => {
    const { __scopeDialog: t, forceMount: n, children: r, container: o } = e,
      i = mt(Bu, t);
    return g.jsx(AC, {
      scope: t,
      forceMount: n,
      children: c.Children.map(r, l =>
        g.jsx(pt, {
          present: n || i.open,
          children: g.jsx(so, { asChild: !0, container: o, children: l }),
        })
      ),
    });
  };
Gh.displayName = Bu;
var Ni = 'DialogOverlay',
  Qh = c.forwardRef((e, t) => {
    const n = Kh(Ni, e.__scopeDialog),
      { forceMount: r = n.forceMount, ...o } = e,
      i = mt(Ni, e.__scopeDialog);
    return i.modal
      ? g.jsx(pt, {
          present: r || i.open,
          children: g.jsx(OC, { ...o, ref: t }),
        })
      : null;
  });
Qh.displayName = Ni;
var IC = wn('DialogOverlay.RemoveScroll'),
  OC = c.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = mt(Ni, n);
    return g.jsx(cl, {
      as: IC,
      allowPinchZoom: !0,
      shards: [o.contentRef],
      children: g.jsx(D.div, {
        'data-state': Vu(o.open),
        ...r,
        ref: t,
        style: { pointerEvents: 'auto', ...r.style },
      }),
    });
  }),
  Cn = 'DialogContent',
  Yh = c.forwardRef((e, t) => {
    const n = Kh(Cn, e.__scopeDialog),
      { forceMount: r = n.forceMount, ...o } = e,
      i = mt(Cn, e.__scopeDialog);
    return g.jsx(pt, {
      present: r || i.open,
      children: i.modal
        ? g.jsx(DC, { ...o, ref: t })
        : g.jsx(jC, { ...o, ref: t }),
    });
  });
Yh.displayName = Cn;
var DC = c.forwardRef((e, t) => {
    const n = mt(Cn, e.__scopeDialog),
      r = c.useRef(null),
      o = B(t, n.contentRef, r);
    return (
      c.useEffect(() => {
        const i = r.current;
        if (i) return gs(i);
      }, []),
      g.jsx(Xh, {
        ...e,
        ref: o,
        trapFocus: n.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: M(e.onCloseAutoFocus, i => {
          (i.preventDefault(), n.triggerRef.current?.focus());
        }),
        onPointerDownOutside: M(e.onPointerDownOutside, i => {
          const l = i.detail.originalEvent,
            a = l.button === 0 && l.ctrlKey === !0;
          (l.button === 2 || a) && i.preventDefault();
        }),
        onFocusOutside: M(e.onFocusOutside, i => i.preventDefault()),
      })
    );
  }),
  jC = c.forwardRef((e, t) => {
    const n = mt(Cn, e.__scopeDialog),
      r = c.useRef(!1),
      o = c.useRef(!1);
    return g.jsx(Xh, {
      ...e,
      ref: t,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      onCloseAutoFocus: i => {
        (e.onCloseAutoFocus?.(i),
          i.defaultPrevented ||
            (r.current || n.triggerRef.current?.focus(), i.preventDefault()),
          (r.current = !1),
          (o.current = !1));
      },
      onInteractOutside: i => {
        (e.onInteractOutside?.(i),
          i.defaultPrevented ||
            ((r.current = !0),
            i.detail.originalEvent.type === 'pointerdown' && (o.current = !0)));
        const l = i.target;
        (n.triggerRef.current?.contains(l) && i.preventDefault(),
          i.detail.originalEvent.type === 'focusin' &&
            o.current &&
            i.preventDefault());
      },
    });
  }),
  Xh = c.forwardRef((e, t) => {
    const {
        __scopeDialog: n,
        trapFocus: r,
        onOpenAutoFocus: o,
        onCloseAutoFocus: i,
        ...l
      } = e,
      a = mt(Cn, n),
      s = c.useRef(null),
      u = B(t, s);
    return (
      ku(),
      g.jsxs(g.Fragment, {
        children: [
          g.jsx(ll, {
            asChild: !0,
            loop: !0,
            trapped: r,
            onMountAutoFocus: o,
            onUnmountAutoFocus: i,
            children: g.jsx(ao, {
              role: 'dialog',
              id: a.contentId,
              'aria-describedby': a.descriptionId,
              'aria-labelledby': a.titleId,
              'data-state': Vu(a.open),
              ...l,
              ref: u,
              onDismiss: () => a.onOpenChange(!1),
            }),
          }),
          g.jsxs(g.Fragment, {
            children: [
              g.jsx(bC, { titleId: a.titleId }),
              g.jsx($C, { contentRef: s, descriptionId: a.descriptionId }),
            ],
          }),
        ],
      })
    );
  }),
  Uu = 'DialogTitle',
  qh = c.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = mt(Uu, n);
    return g.jsx(D.h2, { id: o.titleId, ...r, ref: t });
  });
qh.displayName = Uu;
var Zh = 'DialogDescription',
  Jh = c.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = mt(Zh, n);
    return g.jsx(D.p, { id: o.descriptionId, ...r, ref: t });
  });
Jh.displayName = Zh;
var e1 = 'DialogClose',
  t1 = c.forwardRef((e, t) => {
    const { __scopeDialog: n, ...r } = e,
      o = mt(e1, n);
    return g.jsx(D.button, {
      type: 'button',
      ...r,
      ref: t,
      onClick: M(e.onClick, () => o.onOpenChange(!1)),
    });
  });
t1.displayName = e1;
function Vu(e) {
  return e ? 'open' : 'closed';
}
var n1 = 'DialogTitleWarning',
  [LC, r1] = h0(n1, { contentName: Cn, titleName: Uu, docsSlug: 'dialog' }),
  bC = ({ titleId: e }) => {
    const t = r1(n1),
      n = `\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;
    return (
      c.useEffect(() => {
        e && (document.getElementById(e) || console.error(n));
      }, [n, e]),
      null
    );
  },
  FC = 'DialogDescriptionWarning',
  $C = ({ contentRef: e, descriptionId: t }) => {
    const r = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${r1(FC).contentName}}.`;
    return (
      c.useEffect(() => {
        const o = e.current?.getAttribute('aria-describedby');
        t && o && (document.getElementById(t) || console.warn(r));
      }, [r, e, t]),
      null
    );
  },
  zC = Vh,
  BC = Wh,
  UC = Gh,
  VC = Qh,
  HC = Yh,
  WC = qh,
  KC = Jh,
  o1 = t1,
  i1 = 'AlertDialog',
  [GC, V4] = Be(i1, [Uh]),
  Dt = Uh(),
  l1 = e => {
    const { __scopeAlertDialog: t, ...n } = e,
      r = Dt(t);
    return g.jsx(zC, { ...r, ...n, modal: !0 });
  };
l1.displayName = i1;
var QC = 'AlertDialogTrigger',
  a1 = c.forwardRef((e, t) => {
    const { __scopeAlertDialog: n, ...r } = e,
      o = Dt(n);
    return g.jsx(BC, { ...o, ...r, ref: t });
  });
a1.displayName = QC;
var YC = 'AlertDialogPortal',
  s1 = e => {
    const { __scopeAlertDialog: t, ...n } = e,
      r = Dt(t);
    return g.jsx(UC, { ...r, ...n });
  };
s1.displayName = YC;
var XC = 'AlertDialogOverlay',
  u1 = c.forwardRef((e, t) => {
    const { __scopeAlertDialog: n, ...r } = e,
      o = Dt(n);
    return g.jsx(VC, { ...o, ...r, ref: t });
  });
u1.displayName = XC;
var qn = 'AlertDialogContent',
  [qC, ZC] = GC(qn),
  JC = w0('AlertDialogContent'),
  c1 = c.forwardRef((e, t) => {
    const { __scopeAlertDialog: n, children: r, ...o } = e,
      i = Dt(n),
      l = c.useRef(null),
      a = B(t, l),
      s = c.useRef(null);
    return g.jsx(LC, {
      contentName: qn,
      titleName: d1,
      docsSlug: 'alert-dialog',
      children: g.jsx(qC, {
        scope: n,
        cancelRef: s,
        children: g.jsxs(HC, {
          role: 'alertdialog',
          ...i,
          ...o,
          ref: a,
          onOpenAutoFocus: M(o.onOpenAutoFocus, u => {
            (u.preventDefault(), s.current?.focus({ preventScroll: !0 }));
          }),
          onPointerDownOutside: u => u.preventDefault(),
          onInteractOutside: u => u.preventDefault(),
          children: [g.jsx(JC, { children: r }), g.jsx(tE, { contentRef: l })],
        }),
      }),
    });
  });
c1.displayName = qn;
var d1 = 'AlertDialogTitle',
  f1 = c.forwardRef((e, t) => {
    const { __scopeAlertDialog: n, ...r } = e,
      o = Dt(n);
    return g.jsx(WC, { ...o, ...r, ref: t });
  });
f1.displayName = d1;
var p1 = 'AlertDialogDescription',
  m1 = c.forwardRef((e, t) => {
    const { __scopeAlertDialog: n, ...r } = e,
      o = Dt(n);
    return g.jsx(KC, { ...o, ...r, ref: t });
  });
m1.displayName = p1;
var eE = 'AlertDialogAction',
  v1 = c.forwardRef((e, t) => {
    const { __scopeAlertDialog: n, ...r } = e,
      o = Dt(n);
    return g.jsx(o1, { ...o, ...r, ref: t });
  });
v1.displayName = eE;
var h1 = 'AlertDialogCancel',
  y1 = c.forwardRef((e, t) => {
    const { __scopeAlertDialog: n, ...r } = e,
      { cancelRef: o } = ZC(h1, n),
      i = Dt(n),
      l = B(t, o);
    return g.jsx(o1, { ...i, ...r, ref: l });
  });
y1.displayName = h1;
var tE = ({ contentRef: e }) => {
    const t = `\`${qn}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${qn}\` by passing a \`${p1}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${qn}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
    return (
      c.useEffect(() => {
        document.getElementById(e.current?.getAttribute('aria-describedby')) ||
          console.warn(t);
      }, [t, e]),
      null
    );
  },
  H4 = l1,
  W4 = a1,
  K4 = s1,
  G4 = u1,
  Q4 = c1,
  Y4 = v1,
  X4 = y1,
  q4 = f1,
  Z4 = m1,
  nE = 'Separator',
  Dd = 'horizontal',
  rE = ['horizontal', 'vertical'],
  g1 = c.forwardRef((e, t) => {
    const { decorative: n, orientation: r = Dd, ...o } = e,
      i = oE(r) ? r : Dd,
      a = n
        ? { role: 'none' }
        : {
            'aria-orientation': i === 'vertical' ? i : void 0,
            role: 'separator',
          };
    return g.jsx(D.div, { 'data-orientation': i, ...a, ...o, ref: t });
  });
g1.displayName = nE;
function oE(e) {
  return rE.includes(e);
}
var J4 = g1;
export {
  R4 as $,
  Cu as A,
  f4 as B,
  yE as C,
  vE as D,
  r4 as E,
  Bk as F,
  o4 as G,
  h4 as H,
  Jk as I,
  y4 as J,
  g4 as K,
  a4 as L,
  x4 as M,
  E4 as N,
  TE as O,
  dE as P,
  A4 as Q,
  Ee as R,
  uE as S,
  mE as T,
  NE as U,
  fE as V,
  I4 as W,
  Fk as X,
  k4 as Y,
  P4 as Z,
  _4 as _,
  Xk as a,
  VE as a$,
  T4 as a0,
  N4 as a1,
  M4 as a2,
  O4 as a3,
  S4 as a4,
  C4 as a5,
  xC as a6,
  CC as a7,
  L4 as a8,
  b4 as a9,
  HC as aA,
  o1 as aB,
  WC as aC,
  KC as aD,
  zC as aE,
  G4 as aF,
  K4 as aG,
  Q4 as aH,
  q4 as aI,
  Z4 as aJ,
  Y4 as aK,
  X4 as aL,
  H4 as aM,
  W4 as aN,
  J4 as aO,
  AE as aP,
  vk as aQ,
  fk as aR,
  FE as aS,
  Rk as aT,
  QE as aU,
  gE as aV,
  OE as aW,
  yk as aX,
  tk as aY,
  wE as aZ,
  XE as a_,
  z4 as aa,
  B4 as ab,
  U4 as ac,
  $4 as ad,
  rk as ae,
  xk as af,
  ak as ag,
  xE as ah,
  qE as ai,
  CE as aj,
  _E as ak,
  zE as al,
  Ok as am,
  Sk as an,
  bE as ao,
  Nk as ap,
  PE as aq,
  sk as ar,
  ck as as,
  bk as at,
  BE as au,
  EE as av,
  DE as aw,
  ok as ax,
  VC as ay,
  UC as az,
  pE as b,
  Ek as b0,
  Lk as b1,
  lk as b2,
  SE as b3,
  dk as b4,
  Dk as b5,
  uk as b6,
  hk as b7,
  pk as b8,
  kE as b9,
  jk as bA,
  zk as bB,
  Es as bC,
  sE as bD,
  Xu as bE,
  UE as ba,
  GE as bb,
  ik as bc,
  JE as bd,
  wk as be,
  IE as bf,
  Pk as bg,
  Ik as bh,
  WE as bi,
  Ck as bj,
  gk as bk,
  _k as bl,
  Ak as bm,
  nk as bn,
  HE as bo,
  kk as bp,
  $E as bq,
  YE as br,
  Tk as bs,
  jE as bt,
  ZE as bu,
  mk as bv,
  KE as bw,
  Mk as bx,
  $k as by,
  ek as bz,
  hE as c,
  Yk as d,
  Uk as e,
  Gk as f,
  Kk as g,
  Vk as h,
  Qk as i,
  g as j,
  Hk as k,
  Wk as l,
  Zk as m,
  e4 as n,
  p4 as o,
  ME as p,
  m4 as q,
  c as r,
  i4 as s,
  l4 as t,
  s4 as u,
  u4 as v,
  d4 as w,
  RE as x,
  c4 as y,
  LE as z,
};
