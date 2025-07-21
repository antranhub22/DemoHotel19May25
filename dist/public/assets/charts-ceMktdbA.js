import { c as U } from './css-utils-BkLtITBR.js';
import { r as N, a as Iu, R as w, A as Ne } from './react-core-C6DwaHZM.js';
import {
  i as Qe,
  a as ku,
  b as Ft,
  g as ye,
  c as Kt,
  d as H,
  e as V,
  u as In,
  f as Ti,
  s as ui,
  t as Wc,
  D as q,
  h as Je,
  m as kn,
  j as Me,
  k as Cu,
  l as et,
  n as Du,
  o as Mu,
  p as Bu,
  q as Nu,
  r as Lu,
  v as qr,
  w as Fc,
  x as Ru,
  y as zu,
  z as Wu,
  A as Fu,
} from './vendor-BXT5a8vO.js';
import {
  S as Ku,
  s as Vu,
  a as Xu,
  b as Gu,
  c as Hu,
  d as Uu,
  e as Yu,
  f as Kc,
  g as Ii,
  l as ki,
  p as Ur,
  h as Ci,
  i as qu,
  j as Zu,
  k as Qu,
  m as Ju,
  n as es,
  o as ts,
  q as Rr,
  r as rs,
  t as ns,
  u as as,
  v as is,
  w as os,
  x as cs,
  y as ls,
  z as Vc,
  A as us,
  B as ss,
  C as fs,
  D as ps,
  E as ds,
  F as vs,
} from './charts-utils-DdC1WR7j.js';
var ux =
  typeof globalThis < 'u'
    ? globalThis
    : typeof window < 'u'
      ? window
      : typeof global < 'u'
        ? global
        : typeof self < 'u'
          ? self
          : {};
function hs(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, 'default')
    ? t.default
    : t;
}
function sx(t) {
  if (t.__esModule) return t;
  var e = t.default;
  if (typeof e == 'function') {
    var r = function n() {
      return this instanceof n
        ? Reflect.construct(e, arguments, this.constructor)
        : e.apply(this, arguments);
    };
    r.prototype = e.prototype;
  } else r = {};
  return (
    Object.defineProperty(r, '__esModule', { value: !0 }),
    Object.keys(t).forEach(function (n) {
      var a = Object.getOwnPropertyDescriptor(t, n);
      Object.defineProperty(
        r,
        n,
        a.get
          ? a
          : {
              enumerable: !0,
              get: function () {
                return t[n];
              },
            }
      );
    }),
    r
  );
}
var fe = function (e) {
    return e === 0 ? 0 : e > 0 ? 1 : -1;
  },
  Ue = function (e) {
    return Qe(e) && e.indexOf('%') === e.length - 1;
  },
  M = function (e) {
    return ku(e) && !Ft(e);
  },
  ie = function (e) {
    return M(e) || Qe(e);
  },
  ys = 0,
  at = function (e) {
    var r = ++ys;
    return ''.concat(e || '').concat(r);
  },
  pe = function (e, r) {
    var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0,
      a = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1;
    if (!M(e) && !Qe(e)) return n;
    var i;
    if (Ue(e)) {
      var o = e.indexOf('%');
      i = (r * parseFloat(e.slice(0, o))) / 100;
    } else i = +e;
    return (Ft(i) && (i = n), a && i > r && (i = r), i);
  },
  De = function (e) {
    if (!e) return null;
    var r = Object.keys(e);
    return r && r.length ? e[r[0]] : null;
  },
  ms = function (e) {
    if (!Array.isArray(e)) return !1;
    for (var r = e.length, n = {}, a = 0; a < r; a++)
      if (!n[e[a]]) n[e[a]] = !0;
      else return !0;
    return !1;
  },
  ae = function (e, r) {
    return M(e) && M(r)
      ? function (n) {
          return e + n * (r - e);
        }
      : function () {
          return r;
        };
  };
function Zr(t, e, r) {
  return !t || !t.length
    ? null
    : t.find(function (n) {
        return n && (typeof e == 'function' ? e(n) : ye(n, e)) === r;
      });
}
var gs = function (e, r) {
  return M(e) && M(r)
    ? e - r
    : Qe(e) && Qe(r)
      ? e.localeCompare(r)
      : e instanceof Date && r instanceof Date
        ? e.getTime() - r.getTime()
        : String(e).localeCompare(String(r));
};
function gt(t, e) {
  for (var r in t)
    if (
      {}.hasOwnProperty.call(t, r) &&
      (!{}.hasOwnProperty.call(e, r) || t[r] !== e[r])
    )
      return !1;
  for (var n in e)
    if ({}.hasOwnProperty.call(e, n) && !{}.hasOwnProperty.call(t, n))
      return !1;
  return !0;
}
function ca(t) {
  '@babel/helpers - typeof';
  return (
    (ca =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    ca(t)
  );
}
var bs = ['viewBox', 'children'],
  xs = [
    'aria-activedescendant',
    'aria-atomic',
    'aria-autocomplete',
    'aria-busy',
    'aria-checked',
    'aria-colcount',
    'aria-colindex',
    'aria-colspan',
    'aria-controls',
    'aria-current',
    'aria-describedby',
    'aria-details',
    'aria-disabled',
    'aria-errormessage',
    'aria-expanded',
    'aria-flowto',
    'aria-haspopup',
    'aria-hidden',
    'aria-invalid',
    'aria-keyshortcuts',
    'aria-label',
    'aria-labelledby',
    'aria-level',
    'aria-live',
    'aria-modal',
    'aria-multiline',
    'aria-multiselectable',
    'aria-orientation',
    'aria-owns',
    'aria-placeholder',
    'aria-posinset',
    'aria-pressed',
    'aria-readonly',
    'aria-relevant',
    'aria-required',
    'aria-roledescription',
    'aria-rowcount',
    'aria-rowindex',
    'aria-rowspan',
    'aria-selected',
    'aria-setsize',
    'aria-sort',
    'aria-valuemax',
    'aria-valuemin',
    'aria-valuenow',
    'aria-valuetext',
    'className',
    'color',
    'height',
    'id',
    'lang',
    'max',
    'media',
    'method',
    'min',
    'name',
    'style',
    'target',
    'width',
    'role',
    'tabIndex',
    'accentHeight',
    'accumulate',
    'additive',
    'alignmentBaseline',
    'allowReorder',
    'alphabetic',
    'amplitude',
    'arabicForm',
    'ascent',
    'attributeName',
    'attributeType',
    'autoReverse',
    'azimuth',
    'baseFrequency',
    'baselineShift',
    'baseProfile',
    'bbox',
    'begin',
    'bias',
    'by',
    'calcMode',
    'capHeight',
    'clip',
    'clipPath',
    'clipPathUnits',
    'clipRule',
    'colorInterpolation',
    'colorInterpolationFilters',
    'colorProfile',
    'colorRendering',
    'contentScriptType',
    'contentStyleType',
    'cursor',
    'cx',
    'cy',
    'd',
    'decelerate',
    'descent',
    'diffuseConstant',
    'direction',
    'display',
    'divisor',
    'dominantBaseline',
    'dur',
    'dx',
    'dy',
    'edgeMode',
    'elevation',
    'enableBackground',
    'end',
    'exponent',
    'externalResourcesRequired',
    'fill',
    'fillOpacity',
    'fillRule',
    'filter',
    'filterRes',
    'filterUnits',
    'floodColor',
    'floodOpacity',
    'focusable',
    'fontFamily',
    'fontSize',
    'fontSizeAdjust',
    'fontStretch',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'format',
    'from',
    'fx',
    'fy',
    'g1',
    'g2',
    'glyphName',
    'glyphOrientationHorizontal',
    'glyphOrientationVertical',
    'glyphRef',
    'gradientTransform',
    'gradientUnits',
    'hanging',
    'horizAdvX',
    'horizOriginX',
    'href',
    'ideographic',
    'imageRendering',
    'in2',
    'in',
    'intercept',
    'k1',
    'k2',
    'k3',
    'k4',
    'k',
    'kernelMatrix',
    'kernelUnitLength',
    'kerning',
    'keyPoints',
    'keySplines',
    'keyTimes',
    'lengthAdjust',
    'letterSpacing',
    'lightingColor',
    'limitingConeAngle',
    'local',
    'markerEnd',
    'markerHeight',
    'markerMid',
    'markerStart',
    'markerUnits',
    'markerWidth',
    'mask',
    'maskContentUnits',
    'maskUnits',
    'mathematical',
    'mode',
    'numOctaves',
    'offset',
    'opacity',
    'operator',
    'order',
    'orient',
    'orientation',
    'origin',
    'overflow',
    'overlinePosition',
    'overlineThickness',
    'paintOrder',
    'panose1',
    'pathLength',
    'patternContentUnits',
    'patternTransform',
    'patternUnits',
    'pointerEvents',
    'pointsAtX',
    'pointsAtY',
    'pointsAtZ',
    'preserveAlpha',
    'preserveAspectRatio',
    'primitiveUnits',
    'r',
    'radius',
    'refX',
    'refY',
    'renderingIntent',
    'repeatCount',
    'repeatDur',
    'requiredExtensions',
    'requiredFeatures',
    'restart',
    'result',
    'rotate',
    'rx',
    'ry',
    'seed',
    'shapeRendering',
    'slope',
    'spacing',
    'specularConstant',
    'specularExponent',
    'speed',
    'spreadMethod',
    'startOffset',
    'stdDeviation',
    'stemh',
    'stemv',
    'stitchTiles',
    'stopColor',
    'stopOpacity',
    'strikethroughPosition',
    'strikethroughThickness',
    'string',
    'stroke',
    'strokeDasharray',
    'strokeDashoffset',
    'strokeLinecap',
    'strokeLinejoin',
    'strokeMiterlimit',
    'strokeOpacity',
    'strokeWidth',
    'surfaceScale',
    'systemLanguage',
    'tableValues',
    'targetX',
    'targetY',
    'textAnchor',
    'textDecoration',
    'textLength',
    'textRendering',
    'to',
    'transform',
    'u1',
    'u2',
    'underlinePosition',
    'underlineThickness',
    'unicode',
    'unicodeBidi',
    'unicodeRange',
    'unitsPerEm',
    'vAlphabetic',
    'values',
    'vectorEffect',
    'version',
    'vertAdvY',
    'vertOriginX',
    'vertOriginY',
    'vHanging',
    'vIdeographic',
    'viewTarget',
    'visibility',
    'vMathematical',
    'widths',
    'wordSpacing',
    'writingMode',
    'x1',
    'x2',
    'x',
    'xChannelSelector',
    'xHeight',
    'xlinkActuate',
    'xlinkArcrole',
    'xlinkHref',
    'xlinkRole',
    'xlinkShow',
    'xlinkTitle',
    'xlinkType',
    'xmlBase',
    'xmlLang',
    'xmlns',
    'xmlnsXlink',
    'xmlSpace',
    'y1',
    'y2',
    'y',
    'yChannelSelector',
    'z',
    'zoomAndPan',
    'ref',
    'key',
    'angle',
  ],
  Di = ['points', 'pathLength'],
  Zn = { svg: bs, polygon: Di, polyline: Di },
  si = [
    'dangerouslySetInnerHTML',
    'onCopy',
    'onCopyCapture',
    'onCut',
    'onCutCapture',
    'onPaste',
    'onPasteCapture',
    'onCompositionEnd',
    'onCompositionEndCapture',
    'onCompositionStart',
    'onCompositionStartCapture',
    'onCompositionUpdate',
    'onCompositionUpdateCapture',
    'onFocus',
    'onFocusCapture',
    'onBlur',
    'onBlurCapture',
    'onChange',
    'onChangeCapture',
    'onBeforeInput',
    'onBeforeInputCapture',
    'onInput',
    'onInputCapture',
    'onReset',
    'onResetCapture',
    'onSubmit',
    'onSubmitCapture',
    'onInvalid',
    'onInvalidCapture',
    'onLoad',
    'onLoadCapture',
    'onError',
    'onErrorCapture',
    'onKeyDown',
    'onKeyDownCapture',
    'onKeyPress',
    'onKeyPressCapture',
    'onKeyUp',
    'onKeyUpCapture',
    'onAbort',
    'onAbortCapture',
    'onCanPlay',
    'onCanPlayCapture',
    'onCanPlayThrough',
    'onCanPlayThroughCapture',
    'onDurationChange',
    'onDurationChangeCapture',
    'onEmptied',
    'onEmptiedCapture',
    'onEncrypted',
    'onEncryptedCapture',
    'onEnded',
    'onEndedCapture',
    'onLoadedData',
    'onLoadedDataCapture',
    'onLoadedMetadata',
    'onLoadedMetadataCapture',
    'onLoadStart',
    'onLoadStartCapture',
    'onPause',
    'onPauseCapture',
    'onPlay',
    'onPlayCapture',
    'onPlaying',
    'onPlayingCapture',
    'onProgress',
    'onProgressCapture',
    'onRateChange',
    'onRateChangeCapture',
    'onSeeked',
    'onSeekedCapture',
    'onSeeking',
    'onSeekingCapture',
    'onStalled',
    'onStalledCapture',
    'onSuspend',
    'onSuspendCapture',
    'onTimeUpdate',
    'onTimeUpdateCapture',
    'onVolumeChange',
    'onVolumeChangeCapture',
    'onWaiting',
    'onWaitingCapture',
    'onAuxClick',
    'onAuxClickCapture',
    'onClick',
    'onClickCapture',
    'onContextMenu',
    'onContextMenuCapture',
    'onDoubleClick',
    'onDoubleClickCapture',
    'onDrag',
    'onDragCapture',
    'onDragEnd',
    'onDragEndCapture',
    'onDragEnter',
    'onDragEnterCapture',
    'onDragExit',
    'onDragExitCapture',
    'onDragLeave',
    'onDragLeaveCapture',
    'onDragOver',
    'onDragOverCapture',
    'onDragStart',
    'onDragStartCapture',
    'onDrop',
    'onDropCapture',
    'onMouseDown',
    'onMouseDownCapture',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseMoveCapture',
    'onMouseOut',
    'onMouseOutCapture',
    'onMouseOver',
    'onMouseOverCapture',
    'onMouseUp',
    'onMouseUpCapture',
    'onSelect',
    'onSelectCapture',
    'onTouchCancel',
    'onTouchCancelCapture',
    'onTouchEnd',
    'onTouchEndCapture',
    'onTouchMove',
    'onTouchMoveCapture',
    'onTouchStart',
    'onTouchStartCapture',
    'onPointerDown',
    'onPointerDownCapture',
    'onPointerMove',
    'onPointerMoveCapture',
    'onPointerUp',
    'onPointerUpCapture',
    'onPointerCancel',
    'onPointerCancelCapture',
    'onPointerEnter',
    'onPointerEnterCapture',
    'onPointerLeave',
    'onPointerLeaveCapture',
    'onPointerOver',
    'onPointerOverCapture',
    'onPointerOut',
    'onPointerOutCapture',
    'onGotPointerCapture',
    'onGotPointerCaptureCapture',
    'onLostPointerCapture',
    'onLostPointerCaptureCapture',
    'onScroll',
    'onScrollCapture',
    'onWheel',
    'onWheelCapture',
    'onAnimationStart',
    'onAnimationStartCapture',
    'onAnimationEnd',
    'onAnimationEndCapture',
    'onAnimationIteration',
    'onAnimationIterationCapture',
    'onTransitionEnd',
    'onTransitionEndCapture',
  ],
  Qr = function (e, r) {
    if (!e || typeof e == 'function' || typeof e == 'boolean') return null;
    var n = e;
    if ((N.isValidElement(e) && (n = e.props), !Kt(n))) return null;
    var a = {};
    return (
      Object.keys(n).forEach(function (i) {
        si.includes(i) &&
          (a[i] =
            r ||
            function (o) {
              return n[i](n, o);
            });
      }),
      a
    );
  },
  Os = function (e, r, n) {
    return function (a) {
      return (e(r, n, a), null);
    };
  },
  tt = function (e, r, n) {
    if (!Kt(e) || ca(e) !== 'object') return null;
    var a = null;
    return (
      Object.keys(e).forEach(function (i) {
        var o = e[i];
        si.includes(i) &&
          typeof o == 'function' &&
          (a || (a = {}), (a[i] = Os(o, r, n)));
      }),
      a
    );
  },
  ws = ['children'],
  Ps = ['children'];
function Mi(t, e) {
  if (t == null) return {};
  var r = As(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function As(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function la(t) {
  '@babel/helpers - typeof';
  return (
    (la =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    la(t)
  );
}
var Bi = {
    click: 'onClick',
    mousedown: 'onMouseDown',
    mouseup: 'onMouseUp',
    mouseover: 'onMouseOver',
    mousemove: 'onMouseMove',
    mouseout: 'onMouseOut',
    mouseenter: 'onMouseEnter',
    mouseleave: 'onMouseLeave',
    touchcancel: 'onTouchCancel',
    touchend: 'onTouchEnd',
    touchmove: 'onTouchMove',
    touchstart: 'onTouchStart',
    contextmenu: 'onContextMenu',
    dblclick: 'onDoubleClick',
  },
  ke = function (e) {
    return typeof e == 'string'
      ? e
      : e
        ? e.displayName || e.name || 'Component'
        : '';
  },
  Ni = null,
  Qn = null,
  fi = function t(e) {
    if (e === Ni && Array.isArray(Qn)) return Qn;
    var r = [];
    return (
      N.Children.forEach(e, function (n) {
        H(n) ||
          (Iu.isFragment(n) ? (r = r.concat(t(n.props.children))) : r.push(n));
      }),
      (Qn = r),
      (Ni = e),
      r
    );
  };
function me(t, e) {
  var r = [],
    n = [];
  return (
    Array.isArray(e)
      ? (n = e.map(function (a) {
          return ke(a);
        }))
      : (n = [ke(e)]),
    fi(t).forEach(function (a) {
      var i = ye(a, 'type.displayName') || ye(a, 'type.name');
      n.indexOf(i) !== -1 && r.push(a);
    }),
    r
  );
}
function he(t, e) {
  var r = me(t, e);
  return r && r[0];
}
var Li = function (e) {
    if (!e || !e.props) return !1;
    var r = e.props,
      n = r.width,
      a = r.height;
    return !(!M(n) || n <= 0 || !M(a) || a <= 0);
  },
  Ss = [
    'a',
    'altGlyph',
    'altGlyphDef',
    'altGlyphItem',
    'animate',
    'animateColor',
    'animateMotion',
    'animateTransform',
    'circle',
    'clipPath',
    'color-profile',
    'cursor',
    'defs',
    'desc',
    'ellipse',
    'feBlend',
    'feColormatrix',
    'feComponentTransfer',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDistantLight',
    'feFlood',
    'feFuncA',
    'feFuncB',
    'feFuncG',
    'feFuncR',
    'feGaussianBlur',
    'feImage',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'fePointLight',
    'feSpecularLighting',
    'feSpotLight',
    'feTile',
    'feTurbulence',
    'filter',
    'font',
    'font-face',
    'font-face-format',
    'font-face-name',
    'font-face-url',
    'foreignObject',
    'g',
    'glyph',
    'glyphRef',
    'hkern',
    'image',
    'line',
    'lineGradient',
    'marker',
    'mask',
    'metadata',
    'missing-glyph',
    'mpath',
    'path',
    'pattern',
    'polygon',
    'polyline',
    'radialGradient',
    'rect',
    'script',
    'set',
    'stop',
    'style',
    'svg',
    'switch',
    'symbol',
    'text',
    'textPath',
    'title',
    'tref',
    'tspan',
    'use',
    'view',
    'vkern',
  ],
  js = function (e) {
    return e && e.type && Qe(e.type) && Ss.indexOf(e.type) >= 0;
  },
  Xc = function (e) {
    return e && la(e) === 'object' && 'clipDot' in e;
  },
  Es = function (e, r, n, a) {
    var i,
      o = (i = Zn?.[a]) !== null && i !== void 0 ? i : [];
    return (
      r.startsWith('data-') ||
      (!V(e) && ((a && o.includes(r)) || xs.includes(r))) ||
      (n && si.includes(r))
    );
  },
  W = function (e, r, n) {
    if (!e || typeof e == 'function' || typeof e == 'boolean') return null;
    var a = e;
    if ((N.isValidElement(e) && (a = e.props), !Kt(a))) return null;
    var i = {};
    return (
      Object.keys(a).forEach(function (o) {
        var c;
        Es((c = a) === null || c === void 0 ? void 0 : c[o], o, r, n) &&
          (i[o] = a[o]);
      }),
      i
    );
  },
  ua = function t(e, r) {
    if (e === r) return !0;
    var n = N.Children.count(e);
    if (n !== N.Children.count(r)) return !1;
    if (n === 0) return !0;
    if (n === 1)
      return Ri(Array.isArray(e) ? e[0] : e, Array.isArray(r) ? r[0] : r);
    for (var a = 0; a < n; a++) {
      var i = e[a],
        o = r[a];
      if (Array.isArray(i) || Array.isArray(o)) {
        if (!t(i, o)) return !1;
      } else if (!Ri(i, o)) return !1;
    }
    return !0;
  },
  Ri = function (e, r) {
    if (H(e) && H(r)) return !0;
    if (!H(e) && !H(r)) {
      var n = e.props || {},
        a = n.children,
        i = Mi(n, ws),
        o = r.props || {},
        c = o.children,
        l = Mi(o, Ps);
      return a && c ? gt(i, l) && ua(a, c) : !a && !c ? gt(i, l) : !1;
    }
    return !1;
  },
  zi = function (e, r) {
    var n = [],
      a = {};
    return (
      fi(e).forEach(function (i, o) {
        if (js(i)) n.push(i);
        else if (i) {
          var c = ke(i.type),
            l = r[c] || {},
            u = l.handler,
            s = l.once;
          if (u && (!s || !a[c])) {
            var f = u(i, c, o);
            (n.push(f), (a[c] = !0));
          }
        }
      }),
      n
    );
  },
  $s = function (e) {
    var r = e && e.type;
    return r && Bi[r] ? Bi[r] : null;
  },
  _s = function (e, r) {
    return fi(r).indexOf(e);
  },
  Ts = [
    'children',
    'width',
    'height',
    'viewBox',
    'className',
    'style',
    'title',
    'desc',
  ];
function sa() {
  return (
    (sa = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    sa.apply(this, arguments)
  );
}
function Is(t, e) {
  if (t == null) return {};
  var r = ks(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function ks(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function fa(t) {
  var e = t.children,
    r = t.width,
    n = t.height,
    a = t.viewBox,
    i = t.className,
    o = t.style,
    c = t.title,
    l = t.desc,
    u = Is(t, Ts),
    s = a || { width: r, height: n, x: 0, y: 0 },
    f = U('recharts-surface', i);
  return w.createElement(
    'svg',
    sa({}, W(u, !0, 'svg'), {
      className: f,
      width: r,
      height: n,
      style: o,
      viewBox: ''
        .concat(s.x, ' ')
        .concat(s.y, ' ')
        .concat(s.width, ' ')
        .concat(s.height),
    }),
    w.createElement('title', null, c),
    w.createElement('desc', null, l),
    e
  );
}
var Cs = ['children', 'className'];
function pa() {
  return (
    (pa = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    pa.apply(this, arguments)
  );
}
function Ds(t, e) {
  if (t == null) return {};
  var r = Ms(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function Ms(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
var Y = w.forwardRef(function (t, e) {
    var r = t.children,
      n = t.className,
      a = Ds(t, Cs),
      i = U('recharts-layer', n);
    return w.createElement('g', pa({ className: i }, W(a, !0), { ref: e }), r);
  }),
  Ae = function (e, r) {
    for (
      var n = arguments.length, a = new Array(n > 2 ? n - 2 : 0), i = 2;
      i < n;
      i++
    )
      a[i - 2] = arguments[i];
  };
function or(t) {
  '@babel/helpers - typeof';
  return (
    (or =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    or(t)
  );
}
var Bs = ['type', 'size', 'sizeType'];
function da() {
  return (
    (da = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    da.apply(this, arguments)
  );
}
function Wi(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Fi(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Wi(Object(r), !0).forEach(function (n) {
          Ns(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Wi(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Ns(t, e, r) {
  return (
    (e = Ls(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Ls(t) {
  var e = Rs(t, 'string');
  return or(e) == 'symbol' ? e : e + '';
}
function Rs(t, e) {
  if (or(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (or(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function zs(t, e) {
  if (t == null) return {};
  var r = Ws(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function Ws(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
var Gc = {
    symbolCircle: Kc,
    symbolCross: Yu,
    symbolDiamond: Uu,
    symbolSquare: Hu,
    symbolStar: Gu,
    symbolTriangle: Xu,
    symbolWye: Vu,
  },
  Fs = Math.PI / 180,
  Ks = function (e) {
    var r = 'symbol'.concat(In(e));
    return Gc[r] || Kc;
  },
  Vs = function (e, r, n) {
    if (r === 'area') return e;
    switch (n) {
      case 'cross':
        return (5 * e * e) / 9;
      case 'diamond':
        return (0.5 * e * e) / Math.sqrt(3);
      case 'square':
        return e * e;
      case 'star': {
        var a = 18 * Fs;
        return (
          1.25 *
          e *
          e *
          (Math.tan(a) - Math.tan(a * 2) * Math.pow(Math.tan(a), 2))
        );
      }
      case 'triangle':
        return (Math.sqrt(3) * e * e) / 4;
      case 'wye':
        return ((21 - 10 * Math.sqrt(3)) * e * e) / 8;
      default:
        return (Math.PI * e * e) / 4;
    }
  },
  Xs = function (e, r) {
    Gc['symbol'.concat(In(e))] = r;
  },
  pi = function (e) {
    var r = e.type,
      n = r === void 0 ? 'circle' : r,
      a = e.size,
      i = a === void 0 ? 64 : a,
      o = e.sizeType,
      c = o === void 0 ? 'area' : o,
      l = zs(e, Bs),
      u = Fi(Fi({}, l), {}, { type: n, size: i, sizeType: c }),
      s = function () {
        var y = Ks(n),
          O = Ku()
            .type(y)
            .size(Vs(i, c, n));
        return O();
      },
      f = u.className,
      p = u.cx,
      v = u.cy,
      h = W(u, !0);
    return p === +p && v === +v && i === +i
      ? w.createElement(
          'path',
          da({}, h, {
            className: U('recharts-symbols', f),
            transform: 'translate('.concat(p, ', ').concat(v, ')'),
            d: s(),
          })
        )
      : null;
  };
pi.registerSymbol = Xs;
function Ot(t) {
  '@babel/helpers - typeof';
  return (
    (Ot =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Ot(t)
  );
}
function va() {
  return (
    (va = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    va.apply(this, arguments)
  );
}
function Ki(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Gs(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Ki(Object(r), !0).forEach(function (n) {
          cr(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Ki(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Hs(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Us(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Uc(n.key), n));
  }
}
function Ys(t, e, r) {
  return (
    e && Us(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function qs(t, e, r) {
  return (
    (e = Jr(e)),
    Zs(
      t,
      Hc() ? Reflect.construct(e, r || [], Jr(t).constructor) : e.apply(t, r)
    )
  );
}
function Zs(t, e) {
  if (e && (Ot(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Qs(t);
}
function Qs(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function Hc() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (Hc = function () {
    return !!t;
  })();
}
function Jr(t) {
  return (
    (Jr = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    Jr(t)
  );
}
function Js(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && ha(t, e));
}
function ha(t, e) {
  return (
    (ha = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    ha(t, e)
  );
}
function cr(t, e, r) {
  return (
    (e = Uc(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Uc(t) {
  var e = ef(t, 'string');
  return Ot(e) == 'symbol' ? e : e + '';
}
function ef(t, e) {
  if (Ot(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Ot(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Oe = 32,
  di = (function (t) {
    function e() {
      return (Hs(this, e), qs(this, e, arguments));
    }
    return (
      Js(e, t),
      Ys(e, [
        {
          key: 'renderIcon',
          value: function (n) {
            var a = this.props.inactiveColor,
              i = Oe / 2,
              o = Oe / 6,
              c = Oe / 3,
              l = n.inactive ? a : n.color;
            if (n.type === 'plainline')
              return w.createElement('line', {
                strokeWidth: 4,
                fill: 'none',
                stroke: l,
                strokeDasharray: n.payload.strokeDasharray,
                x1: 0,
                y1: i,
                x2: Oe,
                y2: i,
                className: 'recharts-legend-icon',
              });
            if (n.type === 'line')
              return w.createElement('path', {
                strokeWidth: 4,
                fill: 'none',
                stroke: l,
                d: 'M0,'
                  .concat(i, 'h')
                  .concat(
                    c,
                    `
            A`
                  )
                  .concat(o, ',')
                  .concat(o, ',0,1,1,')
                  .concat(2 * c, ',')
                  .concat(
                    i,
                    `
            H`
                  )
                  .concat(Oe, 'M')
                  .concat(2 * c, ',')
                  .concat(
                    i,
                    `
            A`
                  )
                  .concat(o, ',')
                  .concat(o, ',0,1,1,')
                  .concat(c, ',')
                  .concat(i),
                className: 'recharts-legend-icon',
              });
            if (n.type === 'rect')
              return w.createElement('path', {
                stroke: 'none',
                fill: l,
                d: 'M0,'
                  .concat(Oe / 8, 'h')
                  .concat(Oe, 'v')
                  .concat((Oe * 3) / 4, 'h')
                  .concat(-32, 'z'),
                className: 'recharts-legend-icon',
              });
            if (w.isValidElement(n.legendIcon)) {
              var u = Gs({}, n);
              return (delete u.legendIcon, w.cloneElement(n.legendIcon, u));
            }
            return w.createElement(pi, {
              fill: l,
              cx: i,
              cy: i,
              size: Oe,
              sizeType: 'diameter',
              type: n.type,
            });
          },
        },
        {
          key: 'renderItems',
          value: function () {
            var n = this,
              a = this.props,
              i = a.payload,
              o = a.iconSize,
              c = a.layout,
              l = a.formatter,
              u = a.inactiveColor,
              s = { x: 0, y: 0, width: Oe, height: Oe },
              f = {
                display: c === 'horizontal' ? 'inline-block' : 'block',
                marginRight: 10,
              },
              p = {
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: 4,
              };
            return i.map(function (v, h) {
              var m = v.formatter || l,
                y = U(
                  cr(
                    cr(
                      { 'recharts-legend-item': !0 },
                      'legend-item-'.concat(h),
                      !0
                    ),
                    'inactive',
                    v.inactive
                  )
                );
              if (v.type === 'none') return null;
              var O = V(v.value) ? null : v.value;
              Ae(
                !V(v.value),
                `The name property is also required when using a function for the dataKey of a chart's cartesian components. Ex: <Bar name="Name of my Data"/>`
              );
              var b = v.inactive ? u : v.color;
              return w.createElement(
                'li',
                va(
                  { className: y, style: f, key: 'legend-item-'.concat(h) },
                  tt(n.props, v, h)
                ),
                w.createElement(
                  fa,
                  { width: o, height: o, viewBox: s, style: p },
                  n.renderIcon(v)
                ),
                w.createElement(
                  'span',
                  {
                    className: 'recharts-legend-item-text',
                    style: { color: b },
                  },
                  m ? m(O, v, h) : O
                )
              );
            });
          },
        },
        {
          key: 'render',
          value: function () {
            var n = this.props,
              a = n.payload,
              i = n.layout,
              o = n.align;
            if (!a || !a.length) return null;
            var c = {
              padding: 0,
              margin: 0,
              textAlign: i === 'horizontal' ? o : 'left',
            };
            return w.createElement(
              'ul',
              { className: 'recharts-default-legend', style: c },
              this.renderItems()
            );
          },
        },
      ])
    );
  })(N.PureComponent);
cr(di, 'displayName', 'Legend');
cr(di, 'defaultProps', {
  iconSize: 14,
  layout: 'horizontal',
  align: 'center',
  verticalAlign: 'middle',
  inactiveColor: '#ccc',
});
function Yc(t, e, r) {
  return e === !0 ? Ti(t, r) : V(e) ? Ti(t, e) : t;
}
function wt(t) {
  '@babel/helpers - typeof';
  return (
    (wt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    wt(t)
  );
}
var tf = ['ref'];
function Vi(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function $e(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Vi(Object(r), !0).forEach(function (n) {
          Cn(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Vi(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function rf(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Xi(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Zc(n.key), n));
  }
}
function nf(t, e, r) {
  return (
    e && Xi(t.prototype, e),
    r && Xi(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function af(t, e, r) {
  return (
    (e = en(e)),
    of(
      t,
      qc() ? Reflect.construct(e, r || [], en(t).constructor) : e.apply(t, r)
    )
  );
}
function of(t, e) {
  if (e && (wt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return cf(t);
}
function cf(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function qc() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (qc = function () {
    return !!t;
  })();
}
function en(t) {
  return (
    (en = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    en(t)
  );
}
function lf(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && ya(t, e));
}
function ya(t, e) {
  return (
    (ya = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    ya(t, e)
  );
}
function Cn(t, e, r) {
  return (
    (e = Zc(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Zc(t) {
  var e = uf(t, 'string');
  return wt(e) == 'symbol' ? e : e + '';
}
function uf(t, e) {
  if (wt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (wt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
function sf(t, e) {
  if (t == null) return {};
  var r = ff(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function ff(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function pf(t) {
  return t.value;
}
function df(t, e) {
  if (w.isValidElement(t)) return w.cloneElement(t, e);
  if (typeof t == 'function') return w.createElement(t, e);
  e.ref;
  var r = sf(e, tf);
  return w.createElement(di, r);
}
var Gi = 1,
  bt = (function (t) {
    function e() {
      var r;
      rf(this, e);
      for (var n = arguments.length, a = new Array(n), i = 0; i < n; i++)
        a[i] = arguments[i];
      return (
        (r = af(this, e, [].concat(a))),
        Cn(r, 'lastBoundingBox', { width: -1, height: -1 }),
        r
      );
    }
    return (
      lf(e, t),
      nf(
        e,
        [
          {
            key: 'componentDidMount',
            value: function () {
              this.updateBBox();
            },
          },
          {
            key: 'componentDidUpdate',
            value: function () {
              this.updateBBox();
            },
          },
          {
            key: 'getBBox',
            value: function () {
              if (this.wrapperNode && this.wrapperNode.getBoundingClientRect) {
                var n = this.wrapperNode.getBoundingClientRect();
                return (
                  (n.height = this.wrapperNode.offsetHeight),
                  (n.width = this.wrapperNode.offsetWidth),
                  n
                );
              }
              return null;
            },
          },
          {
            key: 'updateBBox',
            value: function () {
              var n = this.props.onBBoxUpdate,
                a = this.getBBox();
              a
                ? (Math.abs(a.width - this.lastBoundingBox.width) > Gi ||
                    Math.abs(a.height - this.lastBoundingBox.height) > Gi) &&
                  ((this.lastBoundingBox.width = a.width),
                  (this.lastBoundingBox.height = a.height),
                  n && n(a))
                : (this.lastBoundingBox.width !== -1 ||
                    this.lastBoundingBox.height !== -1) &&
                  ((this.lastBoundingBox.width = -1),
                  (this.lastBoundingBox.height = -1),
                  n && n(null));
            },
          },
          {
            key: 'getBBoxSnapshot',
            value: function () {
              return this.lastBoundingBox.width >= 0 &&
                this.lastBoundingBox.height >= 0
                ? $e({}, this.lastBoundingBox)
                : { width: 0, height: 0 };
            },
          },
          {
            key: 'getDefaultPosition',
            value: function (n) {
              var a = this.props,
                i = a.layout,
                o = a.align,
                c = a.verticalAlign,
                l = a.margin,
                u = a.chartWidth,
                s = a.chartHeight,
                f,
                p;
              if (
                !n ||
                ((n.left === void 0 || n.left === null) &&
                  (n.right === void 0 || n.right === null))
              )
                if (o === 'center' && i === 'vertical') {
                  var v = this.getBBoxSnapshot();
                  f = { left: ((u || 0) - v.width) / 2 };
                } else
                  f =
                    o === 'right'
                      ? { right: (l && l.right) || 0 }
                      : { left: (l && l.left) || 0 };
              if (
                !n ||
                ((n.top === void 0 || n.top === null) &&
                  (n.bottom === void 0 || n.bottom === null))
              )
                if (c === 'middle') {
                  var h = this.getBBoxSnapshot();
                  p = { top: ((s || 0) - h.height) / 2 };
                } else
                  p =
                    c === 'bottom'
                      ? { bottom: (l && l.bottom) || 0 }
                      : { top: (l && l.top) || 0 };
              return $e($e({}, f), p);
            },
          },
          {
            key: 'render',
            value: function () {
              var n = this,
                a = this.props,
                i = a.content,
                o = a.width,
                c = a.height,
                l = a.wrapperStyle,
                u = a.payloadUniqBy,
                s = a.payload,
                f = $e(
                  $e(
                    {
                      position: 'absolute',
                      width: o || 'auto',
                      height: c || 'auto',
                    },
                    this.getDefaultPosition(l)
                  ),
                  l
                );
              return w.createElement(
                'div',
                {
                  className: 'recharts-legend-wrapper',
                  style: f,
                  ref: function (v) {
                    n.wrapperNode = v;
                  },
                },
                df(i, $e($e({}, this.props), {}, { payload: Yc(s, u, pf) }))
              );
            },
          },
        ],
        [
          {
            key: 'getWithHeight',
            value: function (n, a) {
              var i = $e($e({}, this.defaultProps), n.props),
                o = i.layout;
              return o === 'vertical' && M(n.props.height)
                ? { height: n.props.height }
                : o === 'horizontal'
                  ? { width: n.props.width || a }
                  : null;
            },
          },
        ]
      )
    );
  })(N.PureComponent);
Cn(bt, 'displayName', 'Legend');
Cn(bt, 'defaultProps', {
  iconSize: 14,
  layout: 'horizontal',
  align: 'center',
  verticalAlign: 'bottom',
});
function lr(t) {
  '@babel/helpers - typeof';
  return (
    (lr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    lr(t)
  );
}
function ma() {
  return (
    (ma = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    ma.apply(this, arguments)
  );
}
function vf(t, e) {
  return gf(t) || mf(t, e) || yf(t, e) || hf();
}
function hf() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yf(t, e) {
  if (t) {
    if (typeof t == 'string') return Hi(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return Hi(t, e);
  }
}
function Hi(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function mf(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function gf(t) {
  if (Array.isArray(t)) return t;
}
function Ui(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Jn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Ui(Object(r), !0).forEach(function (n) {
          bf(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Ui(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function bf(t, e, r) {
  return (
    (e = xf(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function xf(t) {
  var e = Of(t, 'string');
  return lr(e) == 'symbol' ? e : e + '';
}
function Of(t, e) {
  if (lr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (lr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function wf(t) {
  return Array.isArray(t) && ie(t[0]) && ie(t[1]) ? t.join(' ~ ') : t;
}
var Pf = function (e) {
  var r = e.separator,
    n = r === void 0 ? ' : ' : r,
    a = e.contentStyle,
    i = a === void 0 ? {} : a,
    o = e.itemStyle,
    c = o === void 0 ? {} : o,
    l = e.labelStyle,
    u = l === void 0 ? {} : l,
    s = e.payload,
    f = e.formatter,
    p = e.itemSorter,
    v = e.wrapperClassName,
    h = e.labelClassName,
    m = e.label,
    y = e.labelFormatter,
    O = e.accessibilityLayer,
    b = O === void 0 ? !1 : O,
    x = function () {
      if (s && s.length) {
        var _ = { padding: 0, margin: 0 },
          k = (p ? ui(s, p) : s).map(function (C, I) {
            if (C.type === 'none') return null;
            var D = Jn(
                {
                  display: 'block',
                  paddingTop: 4,
                  paddingBottom: 4,
                  color: C.color || '#000',
                },
                c
              ),
              B = C.formatter || f || wf,
              L = C.value,
              z = C.name,
              F = L,
              X = z;
            if (B && F != null && X != null) {
              var R = B(L, z, C, I, s);
              if (Array.isArray(R)) {
                var G = vf(R, 2);
                ((F = G[0]), (X = G[1]));
              } else F = R;
            }
            return w.createElement(
              'li',
              {
                className: 'recharts-tooltip-item',
                key: 'tooltip-item-'.concat(I),
                style: D,
              },
              ie(X)
                ? w.createElement(
                    'span',
                    { className: 'recharts-tooltip-item-name' },
                    X
                  )
                : null,
              ie(X)
                ? w.createElement(
                    'span',
                    { className: 'recharts-tooltip-item-separator' },
                    n
                  )
                : null,
              w.createElement(
                'span',
                { className: 'recharts-tooltip-item-value' },
                F
              ),
              w.createElement(
                'span',
                { className: 'recharts-tooltip-item-unit' },
                C.unit || ''
              )
            );
          });
        return w.createElement(
          'ul',
          { className: 'recharts-tooltip-item-list', style: _ },
          k
        );
      }
      return null;
    },
    P = Jn(
      {
        margin: 0,
        padding: 10,
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        whiteSpace: 'nowrap',
      },
      i
    ),
    d = Jn({ margin: 0 }, u),
    g = !H(m),
    A = g ? m : '',
    S = U('recharts-default-tooltip', v),
    j = U('recharts-tooltip-label', h);
  g && y && s !== void 0 && s !== null && (A = y(m, s));
  var E = b ? { role: 'status', 'aria-live': 'assertive' } : {};
  return w.createElement(
    'div',
    ma({ className: S, style: P }, E),
    w.createElement(
      'p',
      { className: j, style: d },
      w.isValidElement(A) ? A : ''.concat(A)
    ),
    x()
  );
};
function ur(t) {
  '@babel/helpers - typeof';
  return (
    (ur =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    ur(t)
  );
}
function zr(t, e, r) {
  return (
    (e = Af(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Af(t) {
  var e = Sf(t, 'string');
  return ur(e) == 'symbol' ? e : e + '';
}
function Sf(t, e) {
  if (ur(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (ur(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var Zt = 'recharts-tooltip-wrapper',
  jf = { visibility: 'hidden' };
function Ef(t) {
  var e = t.coordinate,
    r = t.translateX,
    n = t.translateY;
  return U(
    Zt,
    zr(
      zr(
        zr(
          zr({}, ''.concat(Zt, '-right'), M(r) && e && M(e.x) && r >= e.x),
          ''.concat(Zt, '-left'),
          M(r) && e && M(e.x) && r < e.x
        ),
        ''.concat(Zt, '-bottom'),
        M(n) && e && M(e.y) && n >= e.y
      ),
      ''.concat(Zt, '-top'),
      M(n) && e && M(e.y) && n < e.y
    )
  );
}
function Yi(t) {
  var e = t.allowEscapeViewBox,
    r = t.coordinate,
    n = t.key,
    a = t.offsetTopLeft,
    i = t.position,
    o = t.reverseDirection,
    c = t.tooltipDimension,
    l = t.viewBox,
    u = t.viewBoxDimension;
  if (i && M(i[n])) return i[n];
  var s = r[n] - c - a,
    f = r[n] + a;
  if (e[n]) return o[n] ? s : f;
  if (o[n]) {
    var p = s,
      v = l[n];
    return p < v ? Math.max(f, l[n]) : Math.max(s, l[n]);
  }
  var h = f + c,
    m = l[n] + u;
  return h > m ? Math.max(s, l[n]) : Math.max(f, l[n]);
}
function $f(t) {
  var e = t.translateX,
    r = t.translateY,
    n = t.useTranslate3d;
  return {
    transform: n
      ? 'translate3d('.concat(e, 'px, ').concat(r, 'px, 0)')
      : 'translate('.concat(e, 'px, ').concat(r, 'px)'),
  };
}
function _f(t) {
  var e = t.allowEscapeViewBox,
    r = t.coordinate,
    n = t.offsetTopLeft,
    a = t.position,
    i = t.reverseDirection,
    o = t.tooltipBox,
    c = t.useTranslate3d,
    l = t.viewBox,
    u,
    s,
    f;
  return (
    o.height > 0 && o.width > 0 && r
      ? ((s = Yi({
          allowEscapeViewBox: e,
          coordinate: r,
          key: 'x',
          offsetTopLeft: n,
          position: a,
          reverseDirection: i,
          tooltipDimension: o.width,
          viewBox: l,
          viewBoxDimension: l.width,
        })),
        (f = Yi({
          allowEscapeViewBox: e,
          coordinate: r,
          key: 'y',
          offsetTopLeft: n,
          position: a,
          reverseDirection: i,
          tooltipDimension: o.height,
          viewBox: l,
          viewBoxDimension: l.height,
        })),
        (u = $f({ translateX: s, translateY: f, useTranslate3d: c })))
      : (u = jf),
    {
      cssProperties: u,
      cssClasses: Ef({ translateX: s, translateY: f, coordinate: r }),
    }
  );
}
function Pt(t) {
  '@babel/helpers - typeof';
  return (
    (Pt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Pt(t)
  );
}
function qi(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Zi(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? qi(Object(r), !0).forEach(function (n) {
          ba(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : qi(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Tf(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function If(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Jc(n.key), n));
  }
}
function kf(t, e, r) {
  return (
    e && If(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Cf(t, e, r) {
  return (
    (e = tn(e)),
    Df(
      t,
      Qc() ? Reflect.construct(e, r || [], tn(t).constructor) : e.apply(t, r)
    )
  );
}
function Df(t, e) {
  if (e && (Pt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Mf(t);
}
function Mf(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function Qc() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (Qc = function () {
    return !!t;
  })();
}
function tn(t) {
  return (
    (tn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    tn(t)
  );
}
function Bf(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && ga(t, e));
}
function ga(t, e) {
  return (
    (ga = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    ga(t, e)
  );
}
function ba(t, e, r) {
  return (
    (e = Jc(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Jc(t) {
  var e = Nf(t, 'string');
  return Pt(e) == 'symbol' ? e : e + '';
}
function Nf(t, e) {
  if (Pt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Pt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Qi = 1,
  Lf = (function (t) {
    function e() {
      var r;
      Tf(this, e);
      for (var n = arguments.length, a = new Array(n), i = 0; i < n; i++)
        a[i] = arguments[i];
      return (
        (r = Cf(this, e, [].concat(a))),
        ba(r, 'state', {
          dismissed: !1,
          dismissedAtCoordinate: { x: 0, y: 0 },
          lastBoundingBox: { width: -1, height: -1 },
        }),
        ba(r, 'handleKeyDown', function (o) {
          if (o.key === 'Escape') {
            var c, l, u, s;
            r.setState({
              dismissed: !0,
              dismissedAtCoordinate: {
                x:
                  (c =
                    (l = r.props.coordinate) === null || l === void 0
                      ? void 0
                      : l.x) !== null && c !== void 0
                    ? c
                    : 0,
                y:
                  (u =
                    (s = r.props.coordinate) === null || s === void 0
                      ? void 0
                      : s.y) !== null && u !== void 0
                    ? u
                    : 0,
              },
            });
          }
        }),
        r
      );
    }
    return (
      Bf(e, t),
      kf(e, [
        {
          key: 'updateBBox',
          value: function () {
            if (this.wrapperNode && this.wrapperNode.getBoundingClientRect) {
              var n = this.wrapperNode.getBoundingClientRect();
              (Math.abs(n.width - this.state.lastBoundingBox.width) > Qi ||
                Math.abs(n.height - this.state.lastBoundingBox.height) > Qi) &&
                this.setState({
                  lastBoundingBox: { width: n.width, height: n.height },
                });
            } else
              (this.state.lastBoundingBox.width !== -1 ||
                this.state.lastBoundingBox.height !== -1) &&
                this.setState({ lastBoundingBox: { width: -1, height: -1 } });
          },
        },
        {
          key: 'componentDidMount',
          value: function () {
            (document.addEventListener('keydown', this.handleKeyDown),
              this.updateBBox());
          },
        },
        {
          key: 'componentWillUnmount',
          value: function () {
            document.removeEventListener('keydown', this.handleKeyDown);
          },
        },
        {
          key: 'componentDidUpdate',
          value: function () {
            var n, a;
            (this.props.active && this.updateBBox(),
              this.state.dismissed &&
                (((n = this.props.coordinate) === null || n === void 0
                  ? void 0
                  : n.x) !== this.state.dismissedAtCoordinate.x ||
                  ((a = this.props.coordinate) === null || a === void 0
                    ? void 0
                    : a.y) !== this.state.dismissedAtCoordinate.y) &&
                (this.state.dismissed = !1));
          },
        },
        {
          key: 'render',
          value: function () {
            var n = this,
              a = this.props,
              i = a.active,
              o = a.allowEscapeViewBox,
              c = a.animationDuration,
              l = a.animationEasing,
              u = a.children,
              s = a.coordinate,
              f = a.hasPayload,
              p = a.isAnimationActive,
              v = a.offset,
              h = a.position,
              m = a.reverseDirection,
              y = a.useTranslate3d,
              O = a.viewBox,
              b = a.wrapperStyle,
              x = _f({
                allowEscapeViewBox: o,
                coordinate: s,
                offsetTopLeft: v,
                position: h,
                reverseDirection: m,
                tooltipBox: this.state.lastBoundingBox,
                useTranslate3d: y,
                viewBox: O,
              }),
              P = x.cssClasses,
              d = x.cssProperties,
              g = Zi(
                Zi(
                  {
                    transition:
                      p && i ? 'transform '.concat(c, 'ms ').concat(l) : void 0,
                  },
                  d
                ),
                {},
                {
                  pointerEvents: 'none',
                  visibility:
                    !this.state.dismissed && i && f ? 'visible' : 'hidden',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                b
              );
            return w.createElement(
              'div',
              {
                tabIndex: -1,
                className: P,
                style: g,
                ref: function (S) {
                  n.wrapperNode = S;
                },
              },
              u
            );
          },
        },
      ])
    );
  })(N.PureComponent),
  Rf = function () {
    return !(
      typeof window < 'u' &&
      window.document &&
      window.document.createElement &&
      window.setTimeout
    );
  },
  Le = { isSsr: Rf() };
function At(t) {
  '@babel/helpers - typeof';
  return (
    (At =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    At(t)
  );
}
function Ji(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function eo(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Ji(Object(r), !0).forEach(function (n) {
          vi(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Ji(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function zf(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Wf(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, tl(n.key), n));
  }
}
function Ff(t, e, r) {
  return (
    e && Wf(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Kf(t, e, r) {
  return (
    (e = rn(e)),
    Vf(
      t,
      el() ? Reflect.construct(e, r || [], rn(t).constructor) : e.apply(t, r)
    )
  );
}
function Vf(t, e) {
  if (e && (At(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Xf(t);
}
function Xf(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function el() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (el = function () {
    return !!t;
  })();
}
function rn(t) {
  return (
    (rn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    rn(t)
  );
}
function Gf(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && xa(t, e));
}
function xa(t, e) {
  return (
    (xa = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    xa(t, e)
  );
}
function vi(t, e, r) {
  return (
    (e = tl(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function tl(t) {
  var e = Hf(t, 'string');
  return At(e) == 'symbol' ? e : e + '';
}
function Hf(t, e) {
  if (At(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (At(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
function Uf(t) {
  return t.dataKey;
}
function Yf(t, e) {
  return w.isValidElement(t)
    ? w.cloneElement(t, e)
    : typeof t == 'function'
      ? w.createElement(t, e)
      : w.createElement(Pf, e);
}
var _e = (function (t) {
  function e() {
    return (zf(this, e), Kf(this, e, arguments));
  }
  return (
    Gf(e, t),
    Ff(e, [
      {
        key: 'render',
        value: function () {
          var n = this,
            a = this.props,
            i = a.active,
            o = a.allowEscapeViewBox,
            c = a.animationDuration,
            l = a.animationEasing,
            u = a.content,
            s = a.coordinate,
            f = a.filterNull,
            p = a.isAnimationActive,
            v = a.offset,
            h = a.payload,
            m = a.payloadUniqBy,
            y = a.position,
            O = a.reverseDirection,
            b = a.useTranslate3d,
            x = a.viewBox,
            P = a.wrapperStyle,
            d = h ?? [];
          f &&
            d.length &&
            (d = Yc(
              h.filter(function (A) {
                return (
                  A.value != null && (A.hide !== !0 || n.props.includeHidden)
                );
              }),
              m,
              Uf
            ));
          var g = d.length > 0;
          return w.createElement(
            Lf,
            {
              allowEscapeViewBox: o,
              animationDuration: c,
              animationEasing: l,
              isAnimationActive: p,
              active: i,
              coordinate: s,
              hasPayload: g,
              offset: v,
              position: y,
              reverseDirection: O,
              useTranslate3d: b,
              viewBox: x,
              wrapperStyle: P,
            },
            Yf(u, eo(eo({}, this.props), {}, { payload: d }))
          );
        },
      },
    ])
  );
})(N.PureComponent);
vi(_e, 'displayName', 'Tooltip');
vi(_e, 'defaultProps', {
  accessibilityLayer: !1,
  allowEscapeViewBox: { x: !1, y: !1 },
  animationDuration: 400,
  animationEasing: 'ease',
  contentStyle: {},
  coordinate: { x: 0, y: 0 },
  cursor: !0,
  cursorStyle: {},
  filterNull: !0,
  isAnimationActive: !Le.isSsr,
  itemStyle: {},
  labelStyle: {},
  offset: 10,
  reverseDirection: { x: !1, y: !1 },
  separator: ' : ',
  trigger: 'hover',
  useTranslate3d: !1,
  viewBox: { x: 0, y: 0, height: 0, width: 0 },
  wrapperStyle: {},
});
function sr(t) {
  '@babel/helpers - typeof';
  return (
    (sr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    sr(t)
  );
}
function to(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Wr(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? to(Object(r), !0).forEach(function (n) {
          qf(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : to(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function qf(t, e, r) {
  return (
    (e = Zf(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Zf(t) {
  var e = Qf(t, 'string');
  return sr(e) == 'symbol' ? e : e + '';
}
function Qf(t, e) {
  if (sr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (sr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function Jf(t, e) {
  return np(t) || rp(t, e) || tp(t, e) || ep();
}
function ep() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function tp(t, e) {
  if (t) {
    if (typeof t == 'string') return ro(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return ro(t, e);
  }
}
function ro(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function rp(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function np(t) {
  if (Array.isArray(t)) return t;
}
var fx = N.forwardRef(function (t, e) {
    var r = t.aspect,
      n = t.initialDimension,
      a = n === void 0 ? { width: -1, height: -1 } : n,
      i = t.width,
      o = i === void 0 ? '100%' : i,
      c = t.height,
      l = c === void 0 ? '100%' : c,
      u = t.minWidth,
      s = u === void 0 ? 0 : u,
      f = t.minHeight,
      p = t.maxHeight,
      v = t.children,
      h = t.debounce,
      m = h === void 0 ? 0 : h,
      y = t.id,
      O = t.className,
      b = t.onResize,
      x = t.style,
      P = x === void 0 ? {} : x,
      d = N.useRef(null),
      g = N.useRef();
    ((g.current = b),
      N.useImperativeHandle(e, function () {
        return Object.defineProperty(d.current, 'current', {
          get: function () {
            return (
              console.warn(
                'The usage of ref.current.current is deprecated and will no longer be supported.'
              ),
              d.current
            );
          },
          configurable: !0,
        });
      }));
    var A = N.useState({ containerWidth: a.width, containerHeight: a.height }),
      S = Jf(A, 2),
      j = S[0],
      E = S[1],
      $ = N.useCallback(function (k, C) {
        E(function (I) {
          var D = Math.round(k),
            B = Math.round(C);
          return I.containerWidth === D && I.containerHeight === B
            ? I
            : { containerWidth: D, containerHeight: B };
        });
      }, []);
    N.useEffect(
      function () {
        var k = function (z) {
          var F,
            X = z[0].contentRect,
            R = X.width,
            G = X.height;
          ($(R, G),
            (F = g.current) === null || F === void 0 || F.call(g, R, G));
        };
        m > 0 && (k = Wc(k, m, { trailing: !0, leading: !1 }));
        var C = new ResizeObserver(k),
          I = d.current.getBoundingClientRect(),
          D = I.width,
          B = I.height;
        return (
          $(D, B),
          C.observe(d.current),
          function () {
            C.disconnect();
          }
        );
      },
      [$, m]
    );
    var _ = N.useMemo(
      function () {
        var k = j.containerWidth,
          C = j.containerHeight;
        if (k < 0 || C < 0) return null;
        (Ae(
          Ue(o) || Ue(l),
          `The width(%s) and height(%s) are both fixed numbers,
       maybe you don't need to use a ResponsiveContainer.`,
          o,
          l
        ),
          Ae(!r || r > 0, 'The aspect(%s) must be greater than zero.', r));
        var I = Ue(o) ? k : o,
          D = Ue(l) ? C : l;
        (r &&
          r > 0 &&
          (I ? (D = I / r) : D && (I = D * r), p && D > p && (D = p)),
          Ae(
            I > 0 || D > 0,
            `The width(%s) and height(%s) of chart should be greater than 0,
       please check the style of container, or the props width(%s) and height(%s),
       or add a minWidth(%s) or minHeight(%s) or use aspect(%s) to control the
       height and width.`,
            I,
            D,
            o,
            l,
            s,
            f,
            r
          ));
        var B = !Array.isArray(v) && ke(v.type).endsWith('Chart');
        return w.Children.map(v, function (L) {
          return w.isValidElement(L)
            ? N.cloneElement(
                L,
                Wr(
                  { width: I, height: D },
                  B
                    ? {
                        style: Wr(
                          {
                            height: '100%',
                            width: '100%',
                            maxHeight: D,
                            maxWidth: I,
                          },
                          L.props.style
                        ),
                      }
                    : {}
                )
              )
            : L;
        });
      },
      [r, v, l, p, f, s, j, o]
    );
    return w.createElement(
      'div',
      {
        id: y ? ''.concat(y) : void 0,
        className: U('recharts-responsive-container', O),
        style: Wr(
          Wr({}, P),
          {},
          { width: o, height: l, minWidth: s, minHeight: f, maxHeight: p }
        ),
        ref: d,
      },
      _
    );
  }),
  hi = function (e) {
    return null;
  };
hi.displayName = 'Cell';
function fr(t) {
  '@babel/helpers - typeof';
  return (
    (fr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    fr(t)
  );
}
function no(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Oa(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? no(Object(r), !0).forEach(function (n) {
          ap(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : no(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function ap(t, e, r) {
  return (
    (e = ip(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function ip(t) {
  var e = op(t, 'string');
  return fr(e) == 'symbol' ? e : e + '';
}
function op(t, e) {
  if (fr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (fr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var st = { widthCache: {}, cacheCount: 0 },
  cp = 2e3,
  lp = {
    position: 'absolute',
    top: '-20000px',
    left: 0,
    padding: 0,
    margin: 0,
    border: 'none',
    whiteSpace: 'pre',
  },
  ao = 'recharts_measurement_span';
function up(t) {
  var e = Oa({}, t);
  return (
    Object.keys(e).forEach(function (r) {
      e[r] || delete e[r];
    }),
    e
  );
}
var tr = function (e) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (e == null || Le.isSsr) return { width: 0, height: 0 };
    var n = up(r),
      a = JSON.stringify({ text: e, copyStyle: n });
    if (st.widthCache[a]) return st.widthCache[a];
    try {
      var i = document.getElementById(ao);
      i ||
        ((i = document.createElement('span')),
        i.setAttribute('id', ao),
        i.setAttribute('aria-hidden', 'true'),
        document.body.appendChild(i));
      var o = Oa(Oa({}, lp), n);
      (Object.assign(i.style, o), (i.textContent = ''.concat(e)));
      var c = i.getBoundingClientRect(),
        l = { width: c.width, height: c.height };
      return (
        (st.widthCache[a] = l),
        ++st.cacheCount > cp && ((st.cacheCount = 0), (st.widthCache = {})),
        l
      );
    } catch {
      return { width: 0, height: 0 };
    }
  },
  sp = function (e) {
    return {
      top: e.top + window.scrollY - document.documentElement.clientTop,
      left: e.left + window.scrollX - document.documentElement.clientLeft,
    };
  };
function pr(t) {
  '@babel/helpers - typeof';
  return (
    (pr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    pr(t)
  );
}
function nn(t, e) {
  return vp(t) || dp(t, e) || pp(t, e) || fp();
}
function fp() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function pp(t, e) {
  if (t) {
    if (typeof t == 'string') return io(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return io(t, e);
  }
}
function io(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function dp(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e === 0)) {
        if (Object(r) !== r) return;
        l = !1;
      } else
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function vp(t) {
  if (Array.isArray(t)) return t;
}
function hp(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function oo(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, mp(n.key), n));
  }
}
function yp(t, e, r) {
  return (
    e && oo(t.prototype, e),
    r && oo(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function mp(t) {
  var e = gp(t, 'string');
  return pr(e) == 'symbol' ? e : e + '';
}
function gp(t, e) {
  if (pr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (pr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var co = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/,
  lo = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/,
  bp = /^px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q$/,
  xp = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/,
  rl = {
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    pt: 96 / 72,
    pc: 96 / 6,
    in: 96,
    Q: 96 / (2.54 * 40),
    px: 1,
  },
  Op = Object.keys(rl),
  dt = 'NaN';
function wp(t, e) {
  return t * rl[e];
}
var Fr = (function () {
  function t(e, r) {
    (hp(this, t),
      (this.num = e),
      (this.unit = r),
      (this.num = e),
      (this.unit = r),
      Number.isNaN(e) && (this.unit = ''),
      r !== '' && !bp.test(r) && ((this.num = NaN), (this.unit = '')),
      Op.includes(r) && ((this.num = wp(e, r)), (this.unit = 'px')));
  }
  return yp(
    t,
    [
      {
        key: 'add',
        value: function (r) {
          return this.unit !== r.unit
            ? new t(NaN, '')
            : new t(this.num + r.num, this.unit);
        },
      },
      {
        key: 'subtract',
        value: function (r) {
          return this.unit !== r.unit
            ? new t(NaN, '')
            : new t(this.num - r.num, this.unit);
        },
      },
      {
        key: 'multiply',
        value: function (r) {
          return this.unit !== '' && r.unit !== '' && this.unit !== r.unit
            ? new t(NaN, '')
            : new t(this.num * r.num, this.unit || r.unit);
        },
      },
      {
        key: 'divide',
        value: function (r) {
          return this.unit !== '' && r.unit !== '' && this.unit !== r.unit
            ? new t(NaN, '')
            : new t(this.num / r.num, this.unit || r.unit);
        },
      },
      {
        key: 'toString',
        value: function () {
          return ''.concat(this.num).concat(this.unit);
        },
      },
      {
        key: 'isNaN',
        value: function () {
          return Number.isNaN(this.num);
        },
      },
    ],
    [
      {
        key: 'parse',
        value: function (r) {
          var n,
            a = (n = xp.exec(r)) !== null && n !== void 0 ? n : [],
            i = nn(a, 3),
            o = i[1],
            c = i[2];
          return new t(parseFloat(o), c ?? '');
        },
      },
    ]
  );
})();
function nl(t) {
  if (t.includes(dt)) return dt;
  for (var e = t; e.includes('*') || e.includes('/'); ) {
    var r,
      n = (r = co.exec(e)) !== null && r !== void 0 ? r : [],
      a = nn(n, 4),
      i = a[1],
      o = a[2],
      c = a[3],
      l = Fr.parse(i ?? ''),
      u = Fr.parse(c ?? ''),
      s = o === '*' ? l.multiply(u) : l.divide(u);
    if (s.isNaN()) return dt;
    e = e.replace(co, s.toString());
  }
  for (; e.includes('+') || /.-\d+(?:\.\d+)?/.test(e); ) {
    var f,
      p = (f = lo.exec(e)) !== null && f !== void 0 ? f : [],
      v = nn(p, 4),
      h = v[1],
      m = v[2],
      y = v[3],
      O = Fr.parse(h ?? ''),
      b = Fr.parse(y ?? ''),
      x = m === '+' ? O.add(b) : O.subtract(b);
    if (x.isNaN()) return dt;
    e = e.replace(lo, x.toString());
  }
  return e;
}
var uo = /\(([^()]*)\)/;
function Pp(t) {
  for (var e = t; e.includes('('); ) {
    var r = uo.exec(e),
      n = nn(r, 2),
      a = n[1];
    e = e.replace(uo, nl(a));
  }
  return e;
}
function Ap(t) {
  var e = t.replace(/\s+/g, '');
  return ((e = Pp(e)), (e = nl(e)), e);
}
function Sp(t) {
  try {
    return Ap(t);
  } catch {
    return dt;
  }
}
function ea(t) {
  var e = Sp(t.slice(5, -1));
  return e === dt ? '' : e;
}
var jp = [
    'x',
    'y',
    'lineHeight',
    'capHeight',
    'scaleToFit',
    'textAnchor',
    'verticalAnchor',
    'fill',
  ],
  Ep = ['dx', 'dy', 'angle', 'className', 'breakAll'];
function wa() {
  return (
    (wa = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    wa.apply(this, arguments)
  );
}
function so(t, e) {
  if (t == null) return {};
  var r = $p(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function $p(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function fo(t, e) {
  return kp(t) || Ip(t, e) || Tp(t, e) || _p();
}
function _p() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Tp(t, e) {
  if (t) {
    if (typeof t == 'string') return po(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return po(t, e);
  }
}
function po(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Ip(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e === 0)) {
        if (Object(r) !== r) return;
        l = !1;
      } else
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function kp(t) {
  if (Array.isArray(t)) return t;
}
var al = /[ \f\n\r\t\v\u2028\u2029]+/,
  il = function (e) {
    var r = e.children,
      n = e.breakAll,
      a = e.style;
    try {
      var i = [];
      H(r) || (n ? (i = r.toString().split('')) : (i = r.toString().split(al)));
      var o = i.map(function (l) {
          return { word: l, width: tr(l, a).width };
        }),
        c = n ? 0 : tr(' ', a).width;
      return { wordsWithComputedWidth: o, spaceWidth: c };
    } catch {
      return null;
    }
  },
  Cp = function (e, r, n, a, i) {
    var o = e.maxLines,
      c = e.children,
      l = e.style,
      u = e.breakAll,
      s = M(o),
      f = c,
      p = function () {
        var I =
          arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
        return I.reduce(function (D, B) {
          var L = B.word,
            z = B.width,
            F = D[D.length - 1];
          if (F && (a == null || i || F.width + z + n < Number(a)))
            (F.words.push(L), (F.width += z + n));
          else {
            var X = { words: [L], width: z };
            D.push(X);
          }
          return D;
        }, []);
      },
      v = p(r),
      h = function (I) {
        return I.reduce(function (D, B) {
          return D.width > B.width ? D : B;
        });
      };
    if (!s) return v;
    for (
      var m = '…',
        y = function (I) {
          var D = f.slice(0, I),
            B = il({
              breakAll: u,
              style: l,
              children: D + m,
            }).wordsWithComputedWidth,
            L = p(B),
            z = L.length > o || h(L).width > Number(a);
          return [z, L];
        },
        O = 0,
        b = f.length - 1,
        x = 0,
        P;
      O <= b && x <= f.length - 1;

    ) {
      var d = Math.floor((O + b) / 2),
        g = d - 1,
        A = y(g),
        S = fo(A, 2),
        j = S[0],
        E = S[1],
        $ = y(d),
        _ = fo($, 1),
        k = _[0];
      if ((!j && !k && (O = d + 1), j && k && (b = d - 1), !j && k)) {
        P = E;
        break;
      }
      x++;
    }
    return P || v;
  },
  vo = function (e) {
    var r = H(e) ? [] : e.toString().split(al);
    return [{ words: r }];
  },
  Dp = function (e) {
    var r = e.width,
      n = e.scaleToFit,
      a = e.children,
      i = e.style,
      o = e.breakAll,
      c = e.maxLines;
    if ((r || n) && !Le.isSsr) {
      var l,
        u,
        s = il({ breakAll: o, children: a, style: i });
      if (s) {
        var f = s.wordsWithComputedWidth,
          p = s.spaceWidth;
        ((l = f), (u = p));
      } else return vo(a);
      return Cp(
        { breakAll: o, children: a, maxLines: c, style: i },
        l,
        u,
        r,
        n
      );
    }
    return vo(a);
  },
  ho = '#808080',
  rt = function (e) {
    var r = e.x,
      n = r === void 0 ? 0 : r,
      a = e.y,
      i = a === void 0 ? 0 : a,
      o = e.lineHeight,
      c = o === void 0 ? '1em' : o,
      l = e.capHeight,
      u = l === void 0 ? '0.71em' : l,
      s = e.scaleToFit,
      f = s === void 0 ? !1 : s,
      p = e.textAnchor,
      v = p === void 0 ? 'start' : p,
      h = e.verticalAnchor,
      m = h === void 0 ? 'end' : h,
      y = e.fill,
      O = y === void 0 ? ho : y,
      b = so(e, jp),
      x = N.useMemo(
        function () {
          return Dp({
            breakAll: b.breakAll,
            children: b.children,
            maxLines: b.maxLines,
            scaleToFit: f,
            style: b.style,
            width: b.width,
          });
        },
        [b.breakAll, b.children, b.maxLines, f, b.style, b.width]
      ),
      P = b.dx,
      d = b.dy,
      g = b.angle,
      A = b.className,
      S = b.breakAll,
      j = so(b, Ep);
    if (!ie(n) || !ie(i)) return null;
    var E = n + (M(P) ? P : 0),
      $ = i + (M(d) ? d : 0),
      _;
    switch (m) {
      case 'start':
        _ = ea('calc('.concat(u, ')'));
        break;
      case 'middle':
        _ = ea(
          'calc('
            .concat((x.length - 1) / 2, ' * -')
            .concat(c, ' + (')
            .concat(u, ' / 2))')
        );
        break;
      default:
        _ = ea('calc('.concat(x.length - 1, ' * -').concat(c, ')'));
        break;
    }
    var k = [];
    if (f) {
      var C = x[0].width,
        I = b.width;
      k.push('scale('.concat((M(I) ? I / C : 1) / C, ')'));
    }
    return (
      g && k.push('rotate('.concat(g, ', ').concat(E, ', ').concat($, ')')),
      k.length && (j.transform = k.join(' ')),
      w.createElement(
        'text',
        wa({}, W(j, !0), {
          x: E,
          y: $,
          className: U('recharts-text', A),
          textAnchor: v,
          fill: O.includes('url') ? ho : O,
        }),
        x.map(function (D, B) {
          var L = D.words.join(S ? '' : ' ');
          return w.createElement(
            'tspan',
            { x: E, dy: B === 0 ? _ : c, key: ''.concat(L, '-').concat(B) },
            L
          );
        })
      )
    );
  };
function Mp(t) {
  return Rp(t) || Lp(t) || Np(t) || Bp();
}
function Bp() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Np(t, e) {
  if (t) {
    if (typeof t == 'string') return Pa(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return Pa(t, e);
  }
}
function Lp(t) {
  if (typeof Symbol < 'u' && Symbol.iterator in Object(t)) return Array.from(t);
}
function Rp(t) {
  if (Array.isArray(t)) return Pa(t);
}
function Pa(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
var zp = function (e) {
    return e;
  },
  ol = {},
  cl = function (e) {
    return e === ol;
  },
  yo = function (e) {
    return function r() {
      return arguments.length === 0 ||
        (arguments.length === 1 &&
          cl(arguments.length <= 0 ? void 0 : arguments[0]))
        ? r
        : e.apply(void 0, arguments);
    };
  },
  Wp = function t(e, r) {
    return e === 1
      ? r
      : yo(function () {
          for (var n = arguments.length, a = new Array(n), i = 0; i < n; i++)
            a[i] = arguments[i];
          var o = a.filter(function (c) {
            return c !== ol;
          }).length;
          return o >= e
            ? r.apply(void 0, a)
            : t(
                e - o,
                yo(function () {
                  for (
                    var c = arguments.length, l = new Array(c), u = 0;
                    u < c;
                    u++
                  )
                    l[u] = arguments[u];
                  var s = a.map(function (f) {
                    return cl(f) ? l.shift() : f;
                  });
                  return r.apply(void 0, Mp(s).concat(l));
                })
              );
        });
  },
  Dn = function (e) {
    return Wp(e.length, e);
  },
  Aa = function (e, r) {
    for (var n = [], a = e; a < r; ++a) n[a - e] = a;
    return n;
  },
  Fp = Dn(function (t, e) {
    return Array.isArray(e)
      ? e.map(t)
      : Object.keys(e)
          .map(function (r) {
            return e[r];
          })
          .map(t);
  }),
  Kp = function () {
    for (var e = arguments.length, r = new Array(e), n = 0; n < e; n++)
      r[n] = arguments[n];
    if (!r.length) return zp;
    var a = r.reverse(),
      i = a[0],
      o = a.slice(1);
    return function () {
      return o.reduce(
        function (c, l) {
          return l(c);
        },
        i.apply(void 0, arguments)
      );
    };
  },
  Sa = function (e) {
    return Array.isArray(e) ? e.reverse() : e.split('').reverse.join('');
  },
  ll = function (e) {
    var r = null,
      n = null;
    return function () {
      for (var a = arguments.length, i = new Array(a), o = 0; o < a; o++)
        i[o] = arguments[o];
      return (
        (r &&
          i.every(function (c, l) {
            return c === r[l];
          })) ||
          ((r = i), (n = e.apply(void 0, i))),
        n
      );
    };
  };
function Vp(t) {
  var e;
  return (
    t === 0 ? (e = 1) : (e = Math.floor(new q(t).abs().log(10).toNumber()) + 1),
    e
  );
}
function Xp(t, e, r) {
  for (var n = new q(t), a = 0, i = []; n.lt(e) && a < 1e5; )
    (i.push(n.toNumber()), (n = n.add(r)), a++);
  return i;
}
var Gp = Dn(function (t, e, r) {
    var n = +t,
      a = +e;
    return n + r * (a - n);
  }),
  Hp = Dn(function (t, e, r) {
    var n = e - +t;
    return ((n = n || 1 / 0), (r - t) / n);
  }),
  Up = Dn(function (t, e, r) {
    var n = e - +t;
    return ((n = n || 1 / 0), Math.max(0, Math.min(1, (r - t) / n)));
  });
const Mn = {
  rangeStep: Xp,
  getDigitCount: Vp,
  interpolateNumber: Gp,
  uninterpolateNumber: Hp,
  uninterpolateTruncation: Up,
};
function ja(t) {
  return Zp(t) || qp(t) || ul(t) || Yp();
}
function Yp() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function qp(t) {
  if (typeof Symbol < 'u' && Symbol.iterator in Object(t)) return Array.from(t);
}
function Zp(t) {
  if (Array.isArray(t)) return Ea(t);
}
function dr(t, e) {
  return ed(t) || Jp(t, e) || ul(t, e) || Qp();
}
function Qp() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ul(t, e) {
  if (t) {
    if (typeof t == 'string') return Ea(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return Ea(t, e);
  }
}
function Ea(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Jp(t, e) {
  if (!(typeof Symbol > 'u' || !(Symbol.iterator in Object(t)))) {
    var r = [],
      n = !0,
      a = !1,
      i = void 0;
    try {
      for (
        var o = t[Symbol.iterator](), c;
        !(n = (c = o.next()).done) && (r.push(c.value), !(e && r.length === e));
        n = !0
      );
    } catch (l) {
      ((a = !0), (i = l));
    } finally {
      try {
        !n && o.return != null && o.return();
      } finally {
        if (a) throw i;
      }
    }
    return r;
  }
}
function ed(t) {
  if (Array.isArray(t)) return t;
}
function sl(t) {
  var e = dr(t, 2),
    r = e[0],
    n = e[1],
    a = r,
    i = n;
  return (r > n && ((a = n), (i = r)), [a, i]);
}
function fl(t, e, r) {
  if (t.lte(0)) return new q(0);
  var n = Mn.getDigitCount(t.toNumber()),
    a = new q(10).pow(n),
    i = t.div(a),
    o = n !== 1 ? 0.05 : 0.1,
    c = new q(Math.ceil(i.div(o).toNumber())).add(r).mul(o),
    l = c.mul(a);
  return e ? l : new q(Math.ceil(l));
}
function td(t, e, r) {
  var n = 1,
    a = new q(t);
  if (!a.isint() && r) {
    var i = Math.abs(t);
    i < 1
      ? ((n = new q(10).pow(Mn.getDigitCount(t) - 1)),
        (a = new q(Math.floor(a.div(n).toNumber())).mul(n)))
      : i > 1 && (a = new q(Math.floor(t)));
  } else
    t === 0
      ? (a = new q(Math.floor((e - 1) / 2)))
      : r || (a = new q(Math.floor(t)));
  var o = Math.floor((e - 1) / 2),
    c = Kp(
      Fp(function (l) {
        return a.add(new q(l - o).mul(n)).toNumber();
      }),
      Aa
    );
  return c(0, e);
}
function pl(t, e, r, n) {
  var a = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
  if (!Number.isFinite((e - t) / (r - 1)))
    return { step: new q(0), tickMin: new q(0), tickMax: new q(0) };
  var i = fl(new q(e).sub(t).div(r - 1), n, a),
    o;
  t <= 0 && e >= 0
    ? (o = new q(0))
    : ((o = new q(t).add(e).div(2)), (o = o.sub(new q(o).mod(i))));
  var c = Math.ceil(o.sub(t).div(i).toNumber()),
    l = Math.ceil(new q(e).sub(o).div(i).toNumber()),
    u = c + l + 1;
  return u > r
    ? pl(t, e, r, n, a + 1)
    : (u < r && ((l = e > 0 ? l + (r - u) : l), (c = e > 0 ? c : c + (r - u))),
      {
        step: i,
        tickMin: o.sub(new q(c).mul(i)),
        tickMax: o.add(new q(l).mul(i)),
      });
}
function rd(t) {
  var e = dr(t, 2),
    r = e[0],
    n = e[1],
    a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 6,
    i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
    o = Math.max(a, 2),
    c = sl([r, n]),
    l = dr(c, 2),
    u = l[0],
    s = l[1];
  if (u === -1 / 0 || s === 1 / 0) {
    var f =
      s === 1 / 0
        ? [u].concat(
            ja(
              Aa(0, a - 1).map(function () {
                return 1 / 0;
              })
            )
          )
        : [].concat(
            ja(
              Aa(0, a - 1).map(function () {
                return -1 / 0;
              })
            ),
            [s]
          );
    return r > n ? Sa(f) : f;
  }
  if (u === s) return td(u, a, i);
  var p = pl(u, s, o, i),
    v = p.step,
    h = p.tickMin,
    m = p.tickMax,
    y = Mn.rangeStep(h, m.add(new q(0.1).mul(v)), v);
  return r > n ? Sa(y) : y;
}
function nd(t, e) {
  var r = dr(t, 2),
    n = r[0],
    a = r[1],
    i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
    o = sl([n, a]),
    c = dr(o, 2),
    l = c[0],
    u = c[1];
  if (l === -1 / 0 || u === 1 / 0) return [n, a];
  if (l === u) return [l];
  var s = Math.max(e, 2),
    f = fl(new q(u).sub(l).div(s - 1), i, 0),
    p = [].concat(
      ja(Mn.rangeStep(new q(l), new q(u).sub(new q(0.99).mul(f)), f)),
      [u]
    );
  return n > a ? Sa(p) : p;
}
var ad = ll(rd),
  id = ll(nd),
  od = [
    'offset',
    'layout',
    'width',
    'dataKey',
    'data',
    'dataPointFormatter',
    'xAxis',
    'yAxis',
  ];
function St(t) {
  '@babel/helpers - typeof';
  return (
    (St =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    St(t)
  );
}
function an() {
  return (
    (an = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    an.apply(this, arguments)
  );
}
function cd(t, e) {
  return fd(t) || sd(t, e) || ud(t, e) || ld();
}
function ld() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function ud(t, e) {
  if (t) {
    if (typeof t == 'string') return mo(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return mo(t, e);
  }
}
function mo(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function sd(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function fd(t) {
  if (Array.isArray(t)) return t;
}
function pd(t, e) {
  if (t == null) return {};
  var r = dd(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function dd(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function vd(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function hd(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, hl(n.key), n));
  }
}
function yd(t, e, r) {
  return (
    e && hd(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function md(t, e, r) {
  return (
    (e = on(e)),
    gd(
      t,
      dl() ? Reflect.construct(e, r || [], on(t).constructor) : e.apply(t, r)
    )
  );
}
function gd(t, e) {
  if (e && (St(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return bd(t);
}
function bd(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function dl() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (dl = function () {
    return !!t;
  })();
}
function on(t) {
  return (
    (on = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    on(t)
  );
}
function xd(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && $a(t, e));
}
function $a(t, e) {
  return (
    ($a = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    $a(t, e)
  );
}
function vl(t, e, r) {
  return (
    (e = hl(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function hl(t) {
  var e = Od(t, 'string');
  return St(e) == 'symbol' ? e : e + '';
}
function Od(t, e) {
  if (St(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (St(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Cr = (function (t) {
  function e() {
    return (vd(this, e), md(this, e, arguments));
  }
  return (
    xd(e, t),
    yd(e, [
      {
        key: 'render',
        value: function () {
          var n = this.props,
            a = n.offset,
            i = n.layout,
            o = n.width,
            c = n.dataKey,
            l = n.data,
            u = n.dataPointFormatter,
            s = n.xAxis,
            f = n.yAxis,
            p = pd(n, od),
            v = W(p, !1);
          this.props.direction === 'x' && s.type !== 'number' && Je();
          var h = l.map(function (m) {
            var y = u(m, c),
              O = y.x,
              b = y.y,
              x = y.value,
              P = y.errorVal;
            if (!P) return null;
            var d = [],
              g,
              A;
            if (Array.isArray(P)) {
              var S = cd(P, 2);
              ((g = S[0]), (A = S[1]));
            } else g = A = P;
            if (i === 'vertical') {
              var j = s.scale,
                E = b + a,
                $ = E + o,
                _ = E - o,
                k = j(x - g),
                C = j(x + A);
              (d.push({ x1: C, y1: $, x2: C, y2: _ }),
                d.push({ x1: k, y1: E, x2: C, y2: E }),
                d.push({ x1: k, y1: $, x2: k, y2: _ }));
            } else if (i === 'horizontal') {
              var I = f.scale,
                D = O + a,
                B = D - o,
                L = D + o,
                z = I(x - g),
                F = I(x + A);
              (d.push({ x1: B, y1: F, x2: L, y2: F }),
                d.push({ x1: D, y1: z, x2: D, y2: F }),
                d.push({ x1: B, y1: z, x2: L, y2: z }));
            }
            return w.createElement(
              Y,
              an(
                {
                  className: 'recharts-errorBar',
                  key: 'bar-'.concat(
                    d.map(function (X) {
                      return ''
                        .concat(X.x1, '-')
                        .concat(X.x2, '-')
                        .concat(X.y1, '-')
                        .concat(X.y2);
                    })
                  ),
                },
                v
              ),
              d.map(function (X) {
                return w.createElement(
                  'line',
                  an({}, X, {
                    key: 'line-'
                      .concat(X.x1, '-')
                      .concat(X.x2, '-')
                      .concat(X.y1, '-')
                      .concat(X.y2),
                  })
                );
              })
            );
          });
          return w.createElement(Y, { className: 'recharts-errorBars' }, h);
        },
      },
    ])
  );
})(w.Component);
vl(Cr, 'defaultProps', {
  stroke: 'black',
  strokeWidth: 1.5,
  width: 5,
  offset: 0,
  layout: 'horizontal',
});
vl(Cr, 'displayName', 'ErrorBar');
function vr(t) {
  '@babel/helpers - typeof';
  return (
    (vr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    vr(t)
  );
}
function go(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Ve(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? go(Object(r), !0).forEach(function (n) {
          wd(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : go(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function wd(t, e, r) {
  return (
    (e = Pd(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Pd(t) {
  var e = Ad(t, 'string');
  return vr(e) == 'symbol' ? e : e + '';
}
function Ad(t, e) {
  if (vr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (vr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var yl = function (e) {
  var r = e.children,
    n = e.formattedGraphicalItems,
    a = e.legendWidth,
    i = e.legendContent,
    o = he(r, bt);
  if (!o) return null;
  var c = bt.defaultProps,
    l = c !== void 0 ? Ve(Ve({}, c), o.props) : {},
    u;
  return (
    o.props && o.props.payload
      ? (u = o.props && o.props.payload)
      : i === 'children'
        ? (u = (n || []).reduce(function (s, f) {
            var p = f.item,
              v = f.props,
              h = v.sectors || v.data || [];
            return s.concat(
              h.map(function (m) {
                return {
                  type: o.props.iconType || p.props.legendType,
                  value: m.name,
                  color: m.fill,
                  payload: m,
                };
              })
            );
          }, []))
        : (u = (n || []).map(function (s) {
            var f = s.item,
              p = f.type.defaultProps,
              v = p !== void 0 ? Ve(Ve({}, p), f.props) : {},
              h = v.dataKey,
              m = v.name,
              y = v.legendType,
              O = v.hide;
            return {
              inactive: O,
              dataKey: h,
              type: l.iconType || y || 'square',
              color: yi(f),
              value: m || h,
              payload: v,
            };
          })),
    Ve(Ve(Ve({}, l), bt.getWithHeight(o, a)), {}, { payload: u, item: o })
  );
};
function hr(t) {
  '@babel/helpers - typeof';
  return (
    (hr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    hr(t)
  );
}
function bo(t) {
  return $d(t) || Ed(t) || jd(t) || Sd();
}
function Sd() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function jd(t, e) {
  if (t) {
    if (typeof t == 'string') return _a(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return _a(t, e);
  }
}
function Ed(t) {
  if (
    (typeof Symbol < 'u' && t[Symbol.iterator] != null) ||
    t['@@iterator'] != null
  )
    return Array.from(t);
}
function $d(t) {
  if (Array.isArray(t)) return _a(t);
}
function _a(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function xo(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ee(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? xo(Object(r), !0).forEach(function (n) {
          xt(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : xo(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function xt(t, e, r) {
  return (
    (e = _d(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function _d(t) {
  var e = Td(t, 'string');
  return hr(e) == 'symbol' ? e : e + '';
}
function Td(t, e) {
  if (hr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (hr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function te(t, e, r) {
  return H(t) || H(e) ? r : ie(e) ? ye(t, e, r) : V(e) ? e(t) : r;
}
function rr(t, e, r, n) {
  var a = Cu(t, function (c) {
    return te(c, e);
  });
  if (r === 'number') {
    var i = a.filter(function (c) {
      return M(c) || parseFloat(c);
    });
    return i.length ? [kn(i), Me(i)] : [1 / 0, -1 / 0];
  }
  var o = n
    ? a.filter(function (c) {
        return !H(c);
      })
    : a;
  return o.map(function (c) {
    return ie(c) || c instanceof Date ? c : '';
  });
}
var Id = function (e) {
    var r,
      n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [],
      a = arguments.length > 2 ? arguments[2] : void 0,
      i = arguments.length > 3 ? arguments[3] : void 0,
      o = -1,
      c = (r = n?.length) !== null && r !== void 0 ? r : 0;
    if (c <= 1) return 0;
    if (
      i &&
      i.axisType === 'angleAxis' &&
      Math.abs(Math.abs(i.range[1] - i.range[0]) - 360) <= 1e-6
    )
      for (var l = i.range, u = 0; u < c; u++) {
        var s = u > 0 ? a[u - 1].coordinate : a[c - 1].coordinate,
          f = a[u].coordinate,
          p = u >= c - 1 ? a[0].coordinate : a[u + 1].coordinate,
          v = void 0;
        if (fe(f - s) !== fe(p - f)) {
          var h = [];
          if (fe(p - f) === fe(l[1] - l[0])) {
            v = p;
            var m = f + l[1] - l[0];
            ((h[0] = Math.min(m, (m + s) / 2)),
              (h[1] = Math.max(m, (m + s) / 2)));
          } else {
            v = s;
            var y = p + l[1] - l[0];
            ((h[0] = Math.min(f, (y + f) / 2)),
              (h[1] = Math.max(f, (y + f) / 2)));
          }
          var O = [Math.min(f, (v + f) / 2), Math.max(f, (v + f) / 2)];
          if ((e > O[0] && e <= O[1]) || (e >= h[0] && e <= h[1])) {
            o = a[u].index;
            break;
          }
        } else {
          var b = Math.min(s, p),
            x = Math.max(s, p);
          if (e > (b + f) / 2 && e <= (x + f) / 2) {
            o = a[u].index;
            break;
          }
        }
      }
    else
      for (var P = 0; P < c; P++)
        if (
          (P === 0 && e <= (n[P].coordinate + n[P + 1].coordinate) / 2) ||
          (P > 0 &&
            P < c - 1 &&
            e > (n[P].coordinate + n[P - 1].coordinate) / 2 &&
            e <= (n[P].coordinate + n[P + 1].coordinate) / 2) ||
          (P === c - 1 && e > (n[P].coordinate + n[P - 1].coordinate) / 2)
        ) {
          o = n[P].index;
          break;
        }
    return o;
  },
  yi = function (e) {
    var r,
      n = e,
      a = n.type.displayName,
      i =
        (r = e.type) !== null && r !== void 0 && r.defaultProps
          ? ee(ee({}, e.type.defaultProps), e.props)
          : e.props,
      o = i.stroke,
      c = i.fill,
      l;
    switch (a) {
      case 'Line':
        l = o;
        break;
      case 'Area':
      case 'Radar':
        l = o && o !== 'none' ? o : c;
        break;
      default:
        l = c;
        break;
    }
    return l;
  },
  kd = function (e) {
    var r = e.barSize,
      n = e.totalSize,
      a = e.stackGroups,
      i = a === void 0 ? {} : a;
    if (!i) return {};
    for (var o = {}, c = Object.keys(i), l = 0, u = c.length; l < u; l++)
      for (
        var s = i[c[l]].stackGroups, f = Object.keys(s), p = 0, v = f.length;
        p < v;
        p++
      ) {
        var h = s[f[p]],
          m = h.items,
          y = h.cateAxisId,
          O = m.filter(function (A) {
            return ke(A.type).indexOf('Bar') >= 0;
          });
        if (O && O.length) {
          var b = O[0].type.defaultProps,
            x = b !== void 0 ? ee(ee({}, b), O[0].props) : O[0].props,
            P = x.barSize,
            d = x[y];
          o[d] || (o[d] = []);
          var g = H(P) ? r : P;
          o[d].push({
            item: O[0],
            stackList: O.slice(1),
            barSize: H(g) ? void 0 : pe(g, n, 0),
          });
        }
      }
    return o;
  },
  Cd = function (e) {
    var r = e.barGap,
      n = e.barCategoryGap,
      a = e.bandSize,
      i = e.sizeList,
      o = i === void 0 ? [] : i,
      c = e.maxBarSize,
      l = o.length;
    if (l < 1) return null;
    var u = pe(r, a, 0, !0),
      s,
      f = [];
    if (o[0].barSize === +o[0].barSize) {
      var p = !1,
        v = a / l,
        h = o.reduce(function (P, d) {
          return P + d.barSize || 0;
        }, 0);
      ((h += (l - 1) * u),
        h >= a && ((h -= (l - 1) * u), (u = 0)),
        h >= a && v > 0 && ((p = !0), (v *= 0.9), (h = l * v)));
      var m = ((a - h) / 2) >> 0,
        y = { offset: m - u, size: 0 };
      s = o.reduce(function (P, d) {
        var g = {
            item: d.item,
            position: {
              offset: y.offset + y.size + u,
              size: p ? v : d.barSize,
            },
          },
          A = [].concat(bo(P), [g]);
        return (
          (y = A[A.length - 1].position),
          d.stackList &&
            d.stackList.length &&
            d.stackList.forEach(function (S) {
              A.push({ item: S, position: y });
            }),
          A
        );
      }, f);
    } else {
      var O = pe(n, a, 0, !0);
      a - 2 * O - (l - 1) * u <= 0 && (u = 0);
      var b = (a - 2 * O - (l - 1) * u) / l;
      b > 1 && (b >>= 0);
      var x = c === +c ? Math.min(b, c) : b;
      s = o.reduce(function (P, d, g) {
        var A = [].concat(bo(P), [
          {
            item: d.item,
            position: { offset: O + (b + u) * g + (b - x) / 2, size: x },
          },
        ]);
        return (
          d.stackList &&
            d.stackList.length &&
            d.stackList.forEach(function (S) {
              A.push({ item: S, position: A[A.length - 1].position });
            }),
          A
        );
      }, f);
    }
    return s;
  },
  Dd = function (e, r, n, a) {
    var i = n.children,
      o = n.width,
      c = n.margin,
      l = o - (c.left || 0) - (c.right || 0),
      u = yl({ children: i, legendWidth: l });
    if (u) {
      var s = a || {},
        f = s.width,
        p = s.height,
        v = u.align,
        h = u.verticalAlign,
        m = u.layout;
      if (
        (m === 'vertical' || (m === 'horizontal' && h === 'middle')) &&
        v !== 'center' &&
        M(e[v])
      )
        return ee(ee({}, e), {}, xt({}, v, e[v] + (f || 0)));
      if (
        (m === 'horizontal' || (m === 'vertical' && v === 'center')) &&
        h !== 'middle' &&
        M(e[h])
      )
        return ee(ee({}, e), {}, xt({}, h, e[h] + (p || 0)));
    }
    return e;
  },
  Md = function (e, r, n) {
    return H(r)
      ? !0
      : e === 'horizontal'
        ? r === 'yAxis'
        : e === 'vertical' || n === 'x'
          ? r === 'xAxis'
          : n === 'y'
            ? r === 'yAxis'
            : !0;
  },
  ml = function (e, r, n, a, i) {
    var o = r.props.children,
      c = me(o, Cr).filter(function (u) {
        return Md(a, i, u.props.direction);
      });
    if (c && c.length) {
      var l = c.map(function (u) {
        return u.props.dataKey;
      });
      return e.reduce(
        function (u, s) {
          var f = te(s, n);
          if (H(f)) return u;
          var p = Array.isArray(f) ? [kn(f), Me(f)] : [f, f],
            v = l.reduce(
              function (h, m) {
                var y = te(s, m, 0),
                  O = p[0] - Math.abs(Array.isArray(y) ? y[0] : y),
                  b = p[1] + Math.abs(Array.isArray(y) ? y[1] : y);
                return [Math.min(O, h[0]), Math.max(b, h[1])];
              },
              [1 / 0, -1 / 0]
            );
          return [Math.min(v[0], u[0]), Math.max(v[1], u[1])];
        },
        [1 / 0, -1 / 0]
      );
    }
    return null;
  },
  Bd = function (e, r, n, a, i) {
    var o = r
      .map(function (c) {
        return ml(e, c, n, i, a);
      })
      .filter(function (c) {
        return !H(c);
      });
    return o && o.length
      ? o.reduce(
          function (c, l) {
            return [Math.min(c[0], l[0]), Math.max(c[1], l[1])];
          },
          [1 / 0, -1 / 0]
        )
      : null;
  },
  gl = function (e, r, n, a, i) {
    var o = r.map(function (l) {
      var u = l.props.dataKey;
      return (n === 'number' && u && ml(e, l, u, a)) || rr(e, u, n, i);
    });
    if (n === 'number')
      return o.reduce(
        function (l, u) {
          return [Math.min(l[0], u[0]), Math.max(l[1], u[1])];
        },
        [1 / 0, -1 / 0]
      );
    var c = {};
    return o.reduce(function (l, u) {
      for (var s = 0, f = u.length; s < f; s++)
        c[u[s]] || ((c[u[s]] = !0), l.push(u[s]));
      return l;
    }, []);
  },
  bl = function (e, r) {
    return (
      (e === 'horizontal' && r === 'xAxis') ||
      (e === 'vertical' && r === 'yAxis') ||
      (e === 'centric' && r === 'angleAxis') ||
      (e === 'radial' && r === 'radiusAxis')
    );
  },
  xl = function (e, r, n, a) {
    if (a)
      return e.map(function (l) {
        return l.coordinate;
      });
    var i,
      o,
      c = e.map(function (l) {
        return (
          l.coordinate === r && (i = !0),
          l.coordinate === n && (o = !0),
          l.coordinate
        );
      });
    return (i || c.push(r), o || c.push(n), c);
  },
  Ie = function (e, r, n) {
    if (!e) return null;
    var a = e.scale,
      i = e.duplicateDomain,
      o = e.type,
      c = e.range,
      l = e.realScaleType === 'scaleBand' ? a.bandwidth() / 2 : 2,
      u = (r || n) && o === 'category' && a.bandwidth ? a.bandwidth() / l : 0;
    if (
      ((u =
        e.axisType === 'angleAxis' && c?.length >= 2
          ? fe(c[0] - c[1]) * 2 * u
          : u),
      r && (e.ticks || e.niceTicks))
    ) {
      var s = (e.ticks || e.niceTicks).map(function (f) {
        var p = i ? i.indexOf(f) : f;
        return { coordinate: a(p) + u, value: f, offset: u };
      });
      return s.filter(function (f) {
        return !Ft(f.coordinate);
      });
    }
    return e.isCategorical && e.categoricalDomain
      ? e.categoricalDomain.map(function (f, p) {
          return { coordinate: a(f) + u, value: f, index: p, offset: u };
        })
      : a.ticks && !n
        ? a.ticks(e.tickCount).map(function (f) {
            return { coordinate: a(f) + u, value: f, offset: u };
          })
        : a.domain().map(function (f, p) {
            return {
              coordinate: a(f) + u,
              value: i ? i[f] : f,
              index: p,
              offset: u,
            };
          });
  },
  ta = new WeakMap(),
  Kr = function (e, r) {
    if (typeof r != 'function') return e;
    ta.has(e) || ta.set(e, new WeakMap());
    var n = ta.get(e);
    if (n.has(r)) return n.get(r);
    var a = function () {
      (e.apply(void 0, arguments), r.apply(void 0, arguments));
    };
    return (n.set(r, a), a);
  },
  Ol = function (e, r, n) {
    var a = e.scale,
      i = e.type,
      o = e.layout,
      c = e.axisType;
    if (a === 'auto')
      return o === 'radial' && c === 'radiusAxis'
        ? { scale: Ii(), realScaleType: 'band' }
        : o === 'radial' && c === 'angleAxis'
          ? { scale: ki(), realScaleType: 'linear' }
          : i === 'category' &&
              r &&
              (r.indexOf('LineChart') >= 0 ||
                r.indexOf('AreaChart') >= 0 ||
                (r.indexOf('ComposedChart') >= 0 && !n))
            ? { scale: Ur(), realScaleType: 'point' }
            : i === 'category'
              ? { scale: Ii(), realScaleType: 'band' }
              : { scale: ki(), realScaleType: 'linear' };
    if (Qe(a)) {
      var l = 'scale'.concat(In(a));
      return { scale: (Ci[l] || Ur)(), realScaleType: Ci[l] ? l : 'point' };
    }
    return V(a) ? { scale: a } : { scale: Ur(), realScaleType: 'point' };
  },
  Oo = 1e-4,
  wl = function (e) {
    var r = e.domain();
    if (!(!r || r.length <= 2)) {
      var n = r.length,
        a = e.range(),
        i = Math.min(a[0], a[1]) - Oo,
        o = Math.max(a[0], a[1]) + Oo,
        c = e(r[0]),
        l = e(r[n - 1]);
      (c < i || c > o || l < i || l > o) && e.domain([r[0], r[n - 1]]);
    }
  },
  Nd = function (e, r) {
    if (!e) return null;
    for (var n = 0, a = e.length; n < a; n++)
      if (e[n].item === r) return e[n].position;
    return null;
  },
  Ld = function (e, r) {
    if (!r || r.length !== 2 || !M(r[0]) || !M(r[1])) return e;
    var n = Math.min(r[0], r[1]),
      a = Math.max(r[0], r[1]),
      i = [e[0], e[1]];
    return (
      (!M(e[0]) || e[0] < n) && (i[0] = n),
      (!M(e[1]) || e[1] > a) && (i[1] = a),
      i[0] > a && (i[0] = a),
      i[1] < n && (i[1] = n),
      i
    );
  },
  Rd = function (e) {
    var r = e.length;
    if (!(r <= 0))
      for (var n = 0, a = e[0].length; n < a; ++n)
        for (var i = 0, o = 0, c = 0; c < r; ++c) {
          var l = Ft(e[c][n][1]) ? e[c][n][0] : e[c][n][1];
          l >= 0
            ? ((e[c][n][0] = i), (e[c][n][1] = i + l), (i = e[c][n][1]))
            : ((e[c][n][0] = o), (e[c][n][1] = o + l), (o = e[c][n][1]));
        }
  },
  zd = function (e) {
    var r = e.length;
    if (!(r <= 0))
      for (var n = 0, a = e[0].length; n < a; ++n)
        for (var i = 0, o = 0; o < r; ++o) {
          var c = Ft(e[o][n][1]) ? e[o][n][0] : e[o][n][1];
          c >= 0
            ? ((e[o][n][0] = i), (e[o][n][1] = i + c), (i = e[o][n][1]))
            : ((e[o][n][0] = 0), (e[o][n][1] = 0));
        }
  },
  Wd = {
    sign: Rd,
    expand: ts,
    none: es,
    silhouette: Ju,
    wiggle: Qu,
    positive: zd,
  },
  Fd = function (e, r, n) {
    var a = r.map(function (c) {
        return c.props.dataKey;
      }),
      i = Wd[n],
      o = qu()
        .keys(a)
        .value(function (c, l) {
          return +te(c, l, 0);
        })
        .order(Zu)
        .offset(i);
    return o(e);
  },
  Kd = function (e, r, n, a, i, o) {
    if (!e) return null;
    var c = o ? r.reverse() : r,
      l = {},
      u = c.reduce(function (f, p) {
        var v,
          h =
            (v = p.type) !== null && v !== void 0 && v.defaultProps
              ? ee(ee({}, p.type.defaultProps), p.props)
              : p.props,
          m = h.stackId,
          y = h.hide;
        if (y) return f;
        var O = h[n],
          b = f[O] || { hasStack: !1, stackGroups: {} };
        if (ie(m)) {
          var x = b.stackGroups[m] || {
            numericAxisId: n,
            cateAxisId: a,
            items: [],
          };
          (x.items.push(p), (b.hasStack = !0), (b.stackGroups[m] = x));
        } else
          b.stackGroups[at('_stackId_')] = {
            numericAxisId: n,
            cateAxisId: a,
            items: [p],
          };
        return ee(ee({}, f), {}, xt({}, O, b));
      }, l),
      s = {};
    return Object.keys(u).reduce(function (f, p) {
      var v = u[p];
      if (v.hasStack) {
        var h = {};
        v.stackGroups = Object.keys(v.stackGroups).reduce(function (m, y) {
          var O = v.stackGroups[y];
          return ee(
            ee({}, m),
            {},
            xt({}, y, {
              numericAxisId: n,
              cateAxisId: a,
              items: O.items,
              stackedData: Fd(e, O.items, i),
            })
          );
        }, h);
      }
      return ee(ee({}, f), {}, xt({}, p, v));
    }, s);
  },
  Pl = function (e, r) {
    var n = r.realScaleType,
      a = r.type,
      i = r.tickCount,
      o = r.originalDomain,
      c = r.allowDecimals,
      l = n || r.scale;
    if (l !== 'auto' && l !== 'linear') return null;
    if (i && a === 'number' && o && (o[0] === 'auto' || o[1] === 'auto')) {
      var u = e.domain();
      if (!u.length) return null;
      var s = ad(u, i, c);
      return (e.domain([kn(s), Me(s)]), { niceTicks: s });
    }
    if (i && a === 'number') {
      var f = e.domain(),
        p = id(f, i, c);
      return { niceTicks: p };
    }
    return null;
  };
function cn(t) {
  var e = t.axis,
    r = t.ticks,
    n = t.bandSize,
    a = t.entry,
    i = t.index,
    o = t.dataKey;
  if (e.type === 'category') {
    if (!e.allowDuplicatedCategory && e.dataKey && !H(a[e.dataKey])) {
      var c = Zr(r, 'value', a[e.dataKey]);
      if (c) return c.coordinate + n / 2;
    }
    return r[i] ? r[i].coordinate + n / 2 : null;
  }
  var l = te(a, H(o) ? e.dataKey : o);
  return H(l) ? null : e.scale(l);
}
var wo = function (e) {
    var r = e.axis,
      n = e.ticks,
      a = e.offset,
      i = e.bandSize,
      o = e.entry,
      c = e.index;
    if (r.type === 'category') return n[c] ? n[c].coordinate + a : null;
    var l = te(o, r.dataKey, r.domain[c]);
    return H(l) ? null : r.scale(l) - i / 2 + a;
  },
  Vd = function (e) {
    var r = e.numericAxis,
      n = r.scale.domain();
    if (r.type === 'number') {
      var a = Math.min(n[0], n[1]),
        i = Math.max(n[0], n[1]);
      return a <= 0 && i >= 0 ? 0 : i < 0 ? i : a;
    }
    return n[0];
  },
  Xd = function (e, r) {
    var n,
      a =
        (n = e.type) !== null && n !== void 0 && n.defaultProps
          ? ee(ee({}, e.type.defaultProps), e.props)
          : e.props,
      i = a.stackId;
    if (ie(i)) {
      var o = r[i];
      if (o) {
        var c = o.items.indexOf(e);
        return c >= 0 ? o.stackedData[c] : null;
      }
    }
    return null;
  },
  Gd = function (e) {
    return e.reduce(
      function (r, n) {
        return [kn(n.concat([r[0]]).filter(M)), Me(n.concat([r[1]]).filter(M))];
      },
      [1 / 0, -1 / 0]
    );
  },
  Al = function (e, r, n) {
    return Object.keys(e)
      .reduce(
        function (a, i) {
          var o = e[i],
            c = o.stackedData,
            l = c.reduce(
              function (u, s) {
                var f = Gd(s.slice(r, n + 1));
                return [Math.min(u[0], f[0]), Math.max(u[1], f[1])];
              },
              [1 / 0, -1 / 0]
            );
          return [Math.min(l[0], a[0]), Math.max(l[1], a[1])];
        },
        [1 / 0, -1 / 0]
      )
      .map(function (a) {
        return a === 1 / 0 || a === -1 / 0 ? 0 : a;
      });
  },
  Po = /^dataMin[\s]*-[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/,
  Ao = /^dataMax[\s]*\+[\s]*([0-9]+([.]{1}[0-9]+){0,1})$/,
  Ta = function (e, r, n) {
    if (V(e)) return e(r, n);
    if (!Array.isArray(e)) return r;
    var a = [];
    if (M(e[0])) a[0] = n ? e[0] : Math.min(e[0], r[0]);
    else if (Po.test(e[0])) {
      var i = +Po.exec(e[0])[1];
      a[0] = r[0] - i;
    } else V(e[0]) ? (a[0] = e[0](r[0])) : (a[0] = r[0]);
    if (M(e[1])) a[1] = n ? e[1] : Math.max(e[1], r[1]);
    else if (Ao.test(e[1])) {
      var o = +Ao.exec(e[1])[1];
      a[1] = r[1] + o;
    } else V(e[1]) ? (a[1] = e[1](r[1])) : (a[1] = r[1]);
    return a;
  },
  ln = function (e, r, n) {
    if (e && e.scale && e.scale.bandwidth) {
      var a = e.scale.bandwidth();
      if (!n || a > 0) return a;
    }
    if (e && r && r.length >= 2) {
      for (
        var i = ui(r, function (f) {
            return f.coordinate;
          }),
          o = 1 / 0,
          c = 1,
          l = i.length;
        c < l;
        c++
      ) {
        var u = i[c],
          s = i[c - 1];
        o = Math.min((u.coordinate || 0) - (s.coordinate || 0), o);
      }
      return o === 1 / 0 ? 0 : o;
    }
    return n ? void 0 : 0;
  },
  So = function (e, r, n) {
    return !e || !e.length || et(e, ye(n, 'type.defaultProps.domain')) ? r : e;
  },
  Sl = function (e, r) {
    var n = e.type.defaultProps
        ? ee(ee({}, e.type.defaultProps), e.props)
        : e.props,
      a = n.dataKey,
      i = n.name,
      o = n.unit,
      c = n.formatter,
      l = n.tooltipType,
      u = n.chartType,
      s = n.hide;
    return ee(
      ee({}, W(e, !1)),
      {},
      {
        dataKey: a,
        unit: o,
        formatter: c,
        name: i || a,
        color: yi(e),
        value: te(r, a),
        type: l,
        payload: r,
        chartType: u,
        hide: s,
      }
    );
  };
function yr(t) {
  '@babel/helpers - typeof';
  return (
    (yr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    yr(t)
  );
}
function jo(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Te(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? jo(Object(r), !0).forEach(function (n) {
          jl(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : jo(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function jl(t, e, r) {
  return (
    (e = Hd(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Hd(t) {
  var e = Ud(t, 'string');
  return yr(e) == 'symbol' ? e : e + '';
}
function Ud(t, e) {
  if (yr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (yr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function Yd(t, e) {
  return Jd(t) || Qd(t, e) || Zd(t, e) || qd();
}
function qd() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Zd(t, e) {
  if (t) {
    if (typeof t == 'string') return Eo(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return Eo(t, e);
  }
}
function Eo(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Qd(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function Jd(t) {
  if (Array.isArray(t)) return t;
}
var un = Math.PI / 180,
  ev = function (e) {
    return (e * 180) / Math.PI;
  },
  Q = function (e, r, n, a) {
    return { x: e + Math.cos(-un * a) * n, y: r + Math.sin(-un * a) * n };
  },
  El = function (e, r) {
    var n =
      arguments.length > 2 && arguments[2] !== void 0
        ? arguments[2]
        : { top: 0, right: 0, bottom: 0, left: 0 };
    return (
      Math.min(
        Math.abs(e - (n.left || 0) - (n.right || 0)),
        Math.abs(r - (n.top || 0) - (n.bottom || 0))
      ) / 2
    );
  },
  tv = function (e, r, n, a, i) {
    var o = e.width,
      c = e.height,
      l = e.startAngle,
      u = e.endAngle,
      s = pe(e.cx, o, o / 2),
      f = pe(e.cy, c, c / 2),
      p = El(o, c, n),
      v = pe(e.innerRadius, p, 0),
      h = pe(e.outerRadius, p, p * 0.8),
      m = Object.keys(r);
    return m.reduce(function (y, O) {
      var b = r[O],
        x = b.domain,
        P = b.reversed,
        d;
      if (H(b.range))
        (a === 'angleAxis' ? (d = [l, u]) : a === 'radiusAxis' && (d = [v, h]),
          P && (d = [d[1], d[0]]));
      else {
        d = b.range;
        var g = d,
          A = Yd(g, 2);
        ((l = A[0]), (u = A[1]));
      }
      var S = Ol(b, i),
        j = S.realScaleType,
        E = S.scale;
      (E.domain(x).range(d), wl(E));
      var $ = Pl(E, Te(Te({}, b), {}, { realScaleType: j })),
        _ = Te(
          Te(Te({}, b), $),
          {},
          {
            range: d,
            radius: h,
            realScaleType: j,
            scale: E,
            cx: s,
            cy: f,
            innerRadius: v,
            outerRadius: h,
            startAngle: l,
            endAngle: u,
          }
        );
      return Te(Te({}, y), {}, jl({}, O, _));
    }, {});
  },
  rv = function (e, r) {
    var n = e.x,
      a = e.y,
      i = r.x,
      o = r.y;
    return Math.sqrt(Math.pow(n - i, 2) + Math.pow(a - o, 2));
  },
  nv = function (e, r) {
    var n = e.x,
      a = e.y,
      i = r.cx,
      o = r.cy,
      c = rv({ x: n, y: a }, { x: i, y: o });
    if (c <= 0) return { radius: c };
    var l = (n - i) / c,
      u = Math.acos(l);
    return (
      a > o && (u = 2 * Math.PI - u),
      { radius: c, angle: ev(u), angleInRadian: u }
    );
  },
  av = function (e) {
    var r = e.startAngle,
      n = e.endAngle,
      a = Math.floor(r / 360),
      i = Math.floor(n / 360),
      o = Math.min(a, i);
    return { startAngle: r - o * 360, endAngle: n - o * 360 };
  },
  iv = function (e, r) {
    var n = r.startAngle,
      a = r.endAngle,
      i = Math.floor(n / 360),
      o = Math.floor(a / 360),
      c = Math.min(i, o);
    return e + c * 360;
  },
  $o = function (e, r) {
    var n = e.x,
      a = e.y,
      i = nv({ x: n, y: a }, r),
      o = i.radius,
      c = i.angle,
      l = r.innerRadius,
      u = r.outerRadius;
    if (o < l || o > u) return !1;
    if (o === 0) return !0;
    var s = av(r),
      f = s.startAngle,
      p = s.endAngle,
      v = c,
      h;
    if (f <= p) {
      for (; v > p; ) v -= 360;
      for (; v < f; ) v += 360;
      h = v >= f && v <= p;
    } else {
      for (; v > f; ) v -= 360;
      for (; v < p; ) v += 360;
      h = v >= p && v <= f;
    }
    return h ? Te(Te({}, r), {}, { radius: o, angle: iv(v, r) }) : null;
  },
  $l = function (e) {
    return !N.isValidElement(e) && !V(e) && typeof e != 'boolean'
      ? e.className
      : '';
  };
function mr(t) {
  '@babel/helpers - typeof';
  return (
    (mr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    mr(t)
  );
}
var ov = ['offset'];
function cv(t) {
  return fv(t) || sv(t) || uv(t) || lv();
}
function lv() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function uv(t, e) {
  if (t) {
    if (typeof t == 'string') return Ia(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return Ia(t, e);
  }
}
function sv(t) {
  if (
    (typeof Symbol < 'u' && t[Symbol.iterator] != null) ||
    t['@@iterator'] != null
  )
    return Array.from(t);
}
function fv(t) {
  if (Array.isArray(t)) return Ia(t);
}
function Ia(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function pv(t, e) {
  if (t == null) return {};
  var r = dv(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function dv(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function _o(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ne(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? _o(Object(r), !0).forEach(function (n) {
          vv(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : _o(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function vv(t, e, r) {
  return (
    (e = hv(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function hv(t) {
  var e = yv(t, 'string');
  return mr(e) == 'symbol' ? e : e + '';
}
function yv(t, e) {
  if (mr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (mr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function gr() {
  return (
    (gr = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    gr.apply(this, arguments)
  );
}
var mv = function (e) {
    var r = e.value,
      n = e.formatter,
      a = H(e.children) ? r : e.children;
    return V(n) ? n(a) : a;
  },
  gv = function (e, r) {
    var n = fe(r - e),
      a = Math.min(Math.abs(r - e), 360);
    return n * a;
  },
  bv = function (e, r, n) {
    var a = e.position,
      i = e.viewBox,
      o = e.offset,
      c = e.className,
      l = i,
      u = l.cx,
      s = l.cy,
      f = l.innerRadius,
      p = l.outerRadius,
      v = l.startAngle,
      h = l.endAngle,
      m = l.clockWise,
      y = (f + p) / 2,
      O = gv(v, h),
      b = O >= 0 ? 1 : -1,
      x,
      P;
    (a === 'insideStart'
      ? ((x = v + b * o), (P = m))
      : a === 'insideEnd'
        ? ((x = h - b * o), (P = !m))
        : a === 'end' && ((x = h + b * o), (P = m)),
      (P = O <= 0 ? P : !P));
    var d = Q(u, s, y, x),
      g = Q(u, s, y, x + (P ? 1 : -1) * 359),
      A = 'M'
        .concat(d.x, ',')
        .concat(
          d.y,
          `
    A`
        )
        .concat(y, ',')
        .concat(y, ',0,1,')
        .concat(
          P ? 0 : 1,
          `,
    `
        )
        .concat(g.x, ',')
        .concat(g.y),
      S = H(e.id) ? at('recharts-radial-line-') : e.id;
    return w.createElement(
      'text',
      gr({}, n, {
        dominantBaseline: 'central',
        className: U('recharts-radial-bar-label', c),
      }),
      w.createElement('defs', null, w.createElement('path', { id: S, d: A })),
      w.createElement('textPath', { xlinkHref: '#'.concat(S) }, r)
    );
  },
  xv = function (e) {
    var r = e.viewBox,
      n = e.offset,
      a = e.position,
      i = r,
      o = i.cx,
      c = i.cy,
      l = i.innerRadius,
      u = i.outerRadius,
      s = i.startAngle,
      f = i.endAngle,
      p = (s + f) / 2;
    if (a === 'outside') {
      var v = Q(o, c, u + n, p),
        h = v.x,
        m = v.y;
      return {
        x: h,
        y: m,
        textAnchor: h >= o ? 'start' : 'end',
        verticalAnchor: 'middle',
      };
    }
    if (a === 'center')
      return { x: o, y: c, textAnchor: 'middle', verticalAnchor: 'middle' };
    if (a === 'centerTop')
      return { x: o, y: c, textAnchor: 'middle', verticalAnchor: 'start' };
    if (a === 'centerBottom')
      return { x: o, y: c, textAnchor: 'middle', verticalAnchor: 'end' };
    var y = (l + u) / 2,
      O = Q(o, c, y, p),
      b = O.x,
      x = O.y;
    return { x: b, y: x, textAnchor: 'middle', verticalAnchor: 'middle' };
  },
  Ov = function (e) {
    var r = e.viewBox,
      n = e.parentViewBox,
      a = e.offset,
      i = e.position,
      o = r,
      c = o.x,
      l = o.y,
      u = o.width,
      s = o.height,
      f = s >= 0 ? 1 : -1,
      p = f * a,
      v = f > 0 ? 'end' : 'start',
      h = f > 0 ? 'start' : 'end',
      m = u >= 0 ? 1 : -1,
      y = m * a,
      O = m > 0 ? 'end' : 'start',
      b = m > 0 ? 'start' : 'end';
    if (i === 'top') {
      var x = {
        x: c + u / 2,
        y: l - f * a,
        textAnchor: 'middle',
        verticalAnchor: v,
      };
      return ne(ne({}, x), n ? { height: Math.max(l - n.y, 0), width: u } : {});
    }
    if (i === 'bottom') {
      var P = {
        x: c + u / 2,
        y: l + s + p,
        textAnchor: 'middle',
        verticalAnchor: h,
      };
      return ne(
        ne({}, P),
        n ? { height: Math.max(n.y + n.height - (l + s), 0), width: u } : {}
      );
    }
    if (i === 'left') {
      var d = {
        x: c - y,
        y: l + s / 2,
        textAnchor: O,
        verticalAnchor: 'middle',
      };
      return ne(
        ne({}, d),
        n ? { width: Math.max(d.x - n.x, 0), height: s } : {}
      );
    }
    if (i === 'right') {
      var g = {
        x: c + u + y,
        y: l + s / 2,
        textAnchor: b,
        verticalAnchor: 'middle',
      };
      return ne(
        ne({}, g),
        n ? { width: Math.max(n.x + n.width - g.x, 0), height: s } : {}
      );
    }
    var A = n ? { width: u, height: s } : {};
    return i === 'insideLeft'
      ? ne(
          { x: c + y, y: l + s / 2, textAnchor: b, verticalAnchor: 'middle' },
          A
        )
      : i === 'insideRight'
        ? ne(
            {
              x: c + u - y,
              y: l + s / 2,
              textAnchor: O,
              verticalAnchor: 'middle',
            },
            A
          )
        : i === 'insideTop'
          ? ne(
              {
                x: c + u / 2,
                y: l + p,
                textAnchor: 'middle',
                verticalAnchor: h,
              },
              A
            )
          : i === 'insideBottom'
            ? ne(
                {
                  x: c + u / 2,
                  y: l + s - p,
                  textAnchor: 'middle',
                  verticalAnchor: v,
                },
                A
              )
            : i === 'insideTopLeft'
              ? ne({ x: c + y, y: l + p, textAnchor: b, verticalAnchor: h }, A)
              : i === 'insideTopRight'
                ? ne(
                    {
                      x: c + u - y,
                      y: l + p,
                      textAnchor: O,
                      verticalAnchor: h,
                    },
                    A
                  )
                : i === 'insideBottomLeft'
                  ? ne(
                      {
                        x: c + y,
                        y: l + s - p,
                        textAnchor: b,
                        verticalAnchor: v,
                      },
                      A
                    )
                  : i === 'insideBottomRight'
                    ? ne(
                        {
                          x: c + u - y,
                          y: l + s - p,
                          textAnchor: O,
                          verticalAnchor: v,
                        },
                        A
                      )
                    : Kt(i) && (M(i.x) || Ue(i.x)) && (M(i.y) || Ue(i.y))
                      ? ne(
                          {
                            x: c + pe(i.x, u),
                            y: l + pe(i.y, s),
                            textAnchor: 'end',
                            verticalAnchor: 'end',
                          },
                          A
                        )
                      : ne(
                          {
                            x: c + u / 2,
                            y: l + s / 2,
                            textAnchor: 'middle',
                            verticalAnchor: 'middle',
                          },
                          A
                        );
  },
  wv = function (e) {
    return 'cx' in e && M(e.cx);
  };
function ce(t) {
  var e = t.offset,
    r = e === void 0 ? 5 : e,
    n = pv(t, ov),
    a = ne({ offset: r }, n),
    i = a.viewBox,
    o = a.position,
    c = a.value,
    l = a.children,
    u = a.content,
    s = a.className,
    f = s === void 0 ? '' : s,
    p = a.textBreakAll;
  if (!i || (H(c) && H(l) && !N.isValidElement(u) && !V(u))) return null;
  if (N.isValidElement(u)) return N.cloneElement(u, a);
  var v;
  if (V(u)) {
    if (((v = N.createElement(u, a)), N.isValidElement(v))) return v;
  } else v = mv(a);
  var h = wv(i),
    m = W(a, !0);
  if (h && (o === 'insideStart' || o === 'insideEnd' || o === 'end'))
    return bv(a, v, m);
  var y = h ? xv(a) : Ov(a);
  return w.createElement(
    rt,
    gr({ className: U('recharts-label', f) }, m, y, { breakAll: p }),
    v
  );
}
ce.displayName = 'Label';
var _l = function (e) {
    var r = e.cx,
      n = e.cy,
      a = e.angle,
      i = e.startAngle,
      o = e.endAngle,
      c = e.r,
      l = e.radius,
      u = e.innerRadius,
      s = e.outerRadius,
      f = e.x,
      p = e.y,
      v = e.top,
      h = e.left,
      m = e.width,
      y = e.height,
      O = e.clockWise,
      b = e.labelViewBox;
    if (b) return b;
    if (M(m) && M(y)) {
      if (M(f) && M(p)) return { x: f, y: p, width: m, height: y };
      if (M(v) && M(h)) return { x: v, y: h, width: m, height: y };
    }
    return M(f) && M(p)
      ? { x: f, y: p, width: 0, height: 0 }
      : M(r) && M(n)
        ? {
            cx: r,
            cy: n,
            startAngle: i || a || 0,
            endAngle: o || a || 0,
            innerRadius: u || 0,
            outerRadius: s || l || c || 0,
            clockWise: O,
          }
        : e.viewBox
          ? e.viewBox
          : {};
  },
  Pv = function (e, r) {
    return e
      ? e === !0
        ? w.createElement(ce, { key: 'label-implicit', viewBox: r })
        : ie(e)
          ? w.createElement(ce, { key: 'label-implicit', viewBox: r, value: e })
          : N.isValidElement(e)
            ? e.type === ce
              ? N.cloneElement(e, { key: 'label-implicit', viewBox: r })
              : w.createElement(ce, {
                  key: 'label-implicit',
                  content: e,
                  viewBox: r,
                })
            : V(e)
              ? w.createElement(ce, {
                  key: 'label-implicit',
                  content: e,
                  viewBox: r,
                })
              : Kt(e)
                ? w.createElement(
                    ce,
                    gr({ viewBox: r }, e, { key: 'label-implicit' })
                  )
                : null
      : null;
  },
  Av = function (e, r) {
    var n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
    if (!e || (!e.children && n && !e.label)) return null;
    var a = e.children,
      i = _l(e),
      o = me(a, ce).map(function (l, u) {
        return N.cloneElement(l, { viewBox: r || i, key: 'label-'.concat(u) });
      });
    if (!n) return o;
    var c = Pv(e.label, r || i);
    return [c].concat(cv(o));
  };
ce.parseViewBox = _l;
ce.renderCallByParent = Av;
function br(t) {
  '@babel/helpers - typeof';
  return (
    (br =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    br(t)
  );
}
var Sv = ['valueAccessor'],
  jv = ['data', 'dataKey', 'clockWise', 'id', 'textBreakAll'];
function Ev(t) {
  return Iv(t) || Tv(t) || _v(t) || $v();
}
function $v() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _v(t, e) {
  if (t) {
    if (typeof t == 'string') return ka(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return ka(t, e);
  }
}
function Tv(t) {
  if (
    (typeof Symbol < 'u' && t[Symbol.iterator] != null) ||
    t['@@iterator'] != null
  )
    return Array.from(t);
}
function Iv(t) {
  if (Array.isArray(t)) return ka(t);
}
function ka(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function sn() {
  return (
    (sn = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    sn.apply(this, arguments)
  );
}
function To(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Io(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? To(Object(r), !0).forEach(function (n) {
          kv(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : To(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function kv(t, e, r) {
  return (
    (e = Cv(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Cv(t) {
  var e = Dv(t, 'string');
  return br(e) == 'symbol' ? e : e + '';
}
function Dv(t, e) {
  if (br(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (br(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function ko(t, e) {
  if (t == null) return {};
  var r = Mv(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function Mv(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
var Bv = function (e) {
  return Array.isArray(e.value) ? Du(e.value) : e.value;
};
function je(t) {
  var e = t.valueAccessor,
    r = e === void 0 ? Bv : e,
    n = ko(t, Sv),
    a = n.data,
    i = n.dataKey,
    o = n.clockWise,
    c = n.id,
    l = n.textBreakAll,
    u = ko(n, jv);
  return !a || !a.length
    ? null
    : w.createElement(
        Y,
        { className: 'recharts-label-list' },
        a.map(function (s, f) {
          var p = H(i) ? r(s, f) : te(s && s.payload, i),
            v = H(c) ? {} : { id: ''.concat(c, '-').concat(f) };
          return w.createElement(
            ce,
            sn({}, W(s, !0), u, v, {
              parentViewBox: s.parentViewBox,
              value: p,
              textBreakAll: l,
              viewBox: ce.parseViewBox(
                H(o) ? s : Io(Io({}, s), {}, { clockWise: o })
              ),
              key: 'label-'.concat(f),
              index: f,
            })
          );
        })
      );
}
je.displayName = 'LabelList';
function Nv(t, e) {
  return t
    ? t === !0
      ? w.createElement(je, { key: 'labelList-implicit', data: e })
      : w.isValidElement(t) || V(t)
        ? w.createElement(je, {
            key: 'labelList-implicit',
            data: e,
            content: t,
          })
        : Kt(t)
          ? w.createElement(
              je,
              sn({ data: e }, t, { key: 'labelList-implicit' })
            )
          : null
    : null;
}
function Lv(t, e) {
  var r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
  if (!t || (!t.children && r && !t.label)) return null;
  var n = t.children,
    a = me(n, je).map(function (o, c) {
      return N.cloneElement(o, { data: e, key: 'labelList-'.concat(c) });
    });
  if (!r) return a;
  var i = Nv(t.label, e);
  return [i].concat(Ev(a));
}
je.renderCallByParent = Lv;
function xr(t) {
  '@babel/helpers - typeof';
  return (
    (xr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    xr(t)
  );
}
function Ca() {
  return (
    (Ca = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Ca.apply(this, arguments)
  );
}
function Co(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Do(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Co(Object(r), !0).forEach(function (n) {
          Rv(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Co(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Rv(t, e, r) {
  return (
    (e = zv(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function zv(t) {
  var e = Wv(t, 'string');
  return xr(e) == 'symbol' ? e : e + '';
}
function Wv(t, e) {
  if (xr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (xr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var Fv = function (e, r) {
    var n = fe(r - e),
      a = Math.min(Math.abs(r - e), 359.999);
    return n * a;
  },
  Vr = function (e) {
    var r = e.cx,
      n = e.cy,
      a = e.radius,
      i = e.angle,
      o = e.sign,
      c = e.isExternal,
      l = e.cornerRadius,
      u = e.cornerIsExternal,
      s = l * (c ? 1 : -1) + a,
      f = Math.asin(l / s) / un,
      p = u ? i : i + o * f,
      v = Q(r, n, s, p),
      h = Q(r, n, a, p),
      m = u ? i - o * f : i,
      y = Q(r, n, s * Math.cos(f * un), m);
    return { center: v, circleTangency: h, lineTangency: y, theta: f };
  },
  Tl = function (e) {
    var r = e.cx,
      n = e.cy,
      a = e.innerRadius,
      i = e.outerRadius,
      o = e.startAngle,
      c = e.endAngle,
      l = Fv(o, c),
      u = o + l,
      s = Q(r, n, i, o),
      f = Q(r, n, i, u),
      p = 'M '
        .concat(s.x, ',')
        .concat(
          s.y,
          `
    A `
        )
        .concat(i, ',')
        .concat(
          i,
          `,0,
    `
        )
        .concat(+(Math.abs(l) > 180), ',')
        .concat(
          +(o > u),
          `,
    `
        )
        .concat(f.x, ',')
        .concat(
          f.y,
          `
  `
        );
    if (a > 0) {
      var v = Q(r, n, a, o),
        h = Q(r, n, a, u);
      p += 'L '
        .concat(h.x, ',')
        .concat(
          h.y,
          `
            A `
        )
        .concat(a, ',')
        .concat(
          a,
          `,0,
            `
        )
        .concat(+(Math.abs(l) > 180), ',')
        .concat(
          +(o <= u),
          `,
            `
        )
        .concat(v.x, ',')
        .concat(v.y, ' Z');
    } else p += 'L '.concat(r, ',').concat(n, ' Z');
    return p;
  },
  Kv = function (e) {
    var r = e.cx,
      n = e.cy,
      a = e.innerRadius,
      i = e.outerRadius,
      o = e.cornerRadius,
      c = e.forceCornerRadius,
      l = e.cornerIsExternal,
      u = e.startAngle,
      s = e.endAngle,
      f = fe(s - u),
      p = Vr({
        cx: r,
        cy: n,
        radius: i,
        angle: u,
        sign: f,
        cornerRadius: o,
        cornerIsExternal: l,
      }),
      v = p.circleTangency,
      h = p.lineTangency,
      m = p.theta,
      y = Vr({
        cx: r,
        cy: n,
        radius: i,
        angle: s,
        sign: -f,
        cornerRadius: o,
        cornerIsExternal: l,
      }),
      O = y.circleTangency,
      b = y.lineTangency,
      x = y.theta,
      P = l ? Math.abs(u - s) : Math.abs(u - s) - m - x;
    if (P < 0)
      return c
        ? 'M '
            .concat(h.x, ',')
            .concat(
              h.y,
              `
        a`
            )
            .concat(o, ',')
            .concat(o, ',0,0,1,')
            .concat(
              o * 2,
              `,0
        a`
            )
            .concat(o, ',')
            .concat(o, ',0,0,1,')
            .concat(
              -o * 2,
              `,0
      `
            )
        : Tl({
            cx: r,
            cy: n,
            innerRadius: a,
            outerRadius: i,
            startAngle: u,
            endAngle: s,
          });
    var d = 'M '
      .concat(h.x, ',')
      .concat(
        h.y,
        `
    A`
      )
      .concat(o, ',')
      .concat(o, ',0,0,')
      .concat(+(f < 0), ',')
      .concat(v.x, ',')
      .concat(
        v.y,
        `
    A`
      )
      .concat(i, ',')
      .concat(i, ',0,')
      .concat(+(P > 180), ',')
      .concat(+(f < 0), ',')
      .concat(O.x, ',')
      .concat(
        O.y,
        `
    A`
      )
      .concat(o, ',')
      .concat(o, ',0,0,')
      .concat(+(f < 0), ',')
      .concat(b.x, ',')
      .concat(
        b.y,
        `
  `
      );
    if (a > 0) {
      var g = Vr({
          cx: r,
          cy: n,
          radius: a,
          angle: u,
          sign: f,
          isExternal: !0,
          cornerRadius: o,
          cornerIsExternal: l,
        }),
        A = g.circleTangency,
        S = g.lineTangency,
        j = g.theta,
        E = Vr({
          cx: r,
          cy: n,
          radius: a,
          angle: s,
          sign: -f,
          isExternal: !0,
          cornerRadius: o,
          cornerIsExternal: l,
        }),
        $ = E.circleTangency,
        _ = E.lineTangency,
        k = E.theta,
        C = l ? Math.abs(u - s) : Math.abs(u - s) - j - k;
      if (C < 0 && o === 0)
        return ''.concat(d, 'L').concat(r, ',').concat(n, 'Z');
      d += 'L'
        .concat(_.x, ',')
        .concat(
          _.y,
          `
      A`
        )
        .concat(o, ',')
        .concat(o, ',0,0,')
        .concat(+(f < 0), ',')
        .concat($.x, ',')
        .concat(
          $.y,
          `
      A`
        )
        .concat(a, ',')
        .concat(a, ',0,')
        .concat(+(C > 180), ',')
        .concat(+(f > 0), ',')
        .concat(A.x, ',')
        .concat(
          A.y,
          `
      A`
        )
        .concat(o, ',')
        .concat(o, ',0,0,')
        .concat(+(f < 0), ',')
        .concat(S.x, ',')
        .concat(S.y, 'Z');
    } else d += 'L'.concat(r, ',').concat(n, 'Z');
    return d;
  },
  Vv = {
    cx: 0,
    cy: 0,
    innerRadius: 0,
    outerRadius: 0,
    startAngle: 0,
    endAngle: 0,
    cornerRadius: 0,
    forceCornerRadius: !1,
    cornerIsExternal: !1,
  },
  Il = function (e) {
    var r = Do(Do({}, Vv), e),
      n = r.cx,
      a = r.cy,
      i = r.innerRadius,
      o = r.outerRadius,
      c = r.cornerRadius,
      l = r.forceCornerRadius,
      u = r.cornerIsExternal,
      s = r.startAngle,
      f = r.endAngle,
      p = r.className;
    if (o < i || s === f) return null;
    var v = U('recharts-sector', p),
      h = o - i,
      m = pe(c, h, 0, !0),
      y;
    return (
      m > 0 && Math.abs(s - f) < 360
        ? (y = Kv({
            cx: n,
            cy: a,
            innerRadius: i,
            outerRadius: o,
            cornerRadius: Math.min(m, h / 2),
            forceCornerRadius: l,
            cornerIsExternal: u,
            startAngle: s,
            endAngle: f,
          }))
        : (y = Tl({
            cx: n,
            cy: a,
            innerRadius: i,
            outerRadius: o,
            startAngle: s,
            endAngle: f,
          })),
      w.createElement(
        'path',
        Ca({}, W(r, !0), { className: v, d: y, role: 'img' })
      )
    );
  };
function Or(t) {
  '@babel/helpers - typeof';
  return (
    (Or =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Or(t)
  );
}
function Da() {
  return (
    (Da = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Da.apply(this, arguments)
  );
}
function Mo(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Bo(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Mo(Object(r), !0).forEach(function (n) {
          Xv(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Mo(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Xv(t, e, r) {
  return (
    (e = Gv(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Gv(t) {
  var e = Hv(t, 'string');
  return Or(e) == 'symbol' ? e : e + '';
}
function Hv(t, e) {
  if (Or(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Or(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var No = {
    curveBasisClosed: vs,
    curveBasisOpen: ds,
    curveBasis: ps,
    curveBumpX: fs,
    curveBumpY: ss,
    curveLinearClosed: us,
    curveLinear: Vc,
    curveMonotoneX: ls,
    curveMonotoneY: cs,
    curveNatural: os,
    curveStep: is,
    curveStepAfter: as,
    curveStepBefore: ns,
  },
  Xr = function (e) {
    return e.x === +e.x && e.y === +e.y;
  },
  Qt = function (e) {
    return e.x;
  },
  Jt = function (e) {
    return e.y;
  },
  Uv = function (e, r) {
    if (V(e)) return e;
    var n = 'curve'.concat(In(e));
    return (n === 'curveMonotone' || n === 'curveBump') && r
      ? No[''.concat(n).concat(r === 'vertical' ? 'Y' : 'X')]
      : No[n] || Vc;
  },
  Yv = function (e) {
    var r = e.type,
      n = r === void 0 ? 'linear' : r,
      a = e.points,
      i = a === void 0 ? [] : a,
      o = e.baseLine,
      c = e.layout,
      l = e.connectNulls,
      u = l === void 0 ? !1 : l,
      s = Uv(n, c),
      f = u
        ? i.filter(function (m) {
            return Xr(m);
          })
        : i,
      p;
    if (Array.isArray(o)) {
      var v = u
          ? o.filter(function (m) {
              return Xr(m);
            })
          : o,
        h = f.map(function (m, y) {
          return Bo(Bo({}, m), {}, { base: v[y] });
        });
      return (
        c === 'vertical'
          ? (p = Rr()
              .y(Jt)
              .x1(Qt)
              .x0(function (m) {
                return m.base.x;
              }))
          : (p = Rr()
              .x(Qt)
              .y1(Jt)
              .y0(function (m) {
                return m.base.y;
              })),
        p.defined(Xr).curve(s),
        p(h)
      );
    }
    return (
      c === 'vertical' && M(o)
        ? (p = Rr().y(Jt).x1(Qt).x0(o))
        : M(o)
          ? (p = Rr().x(Qt).y1(Jt).y0(o))
          : (p = rs().x(Qt).y(Jt)),
      p.defined(Xr).curve(s),
      p(f)
    );
  },
  Ze = function (e) {
    var r = e.className,
      n = e.points,
      a = e.path,
      i = e.pathRef;
    if ((!n || !n.length) && !a) return null;
    var o = n && n.length ? Yv(e) : a;
    return w.createElement(
      'path',
      Da({}, W(e, !1), Qr(e), {
        className: U('recharts-curve', r),
        d: o,
        ref: i,
      })
    );
  };
function wr(t) {
  '@babel/helpers - typeof';
  return (
    (wr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    wr(t)
  );
}
function fn() {
  return (
    (fn = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    fn.apply(this, arguments)
  );
}
function qv(t, e) {
  return eh(t) || Jv(t, e) || Qv(t, e) || Zv();
}
function Zv() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Qv(t, e) {
  if (t) {
    if (typeof t == 'string') return Lo(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return Lo(t, e);
  }
}
function Lo(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Jv(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function eh(t) {
  if (Array.isArray(t)) return t;
}
function Ro(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function zo(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Ro(Object(r), !0).forEach(function (n) {
          th(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Ro(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function th(t, e, r) {
  return (
    (e = rh(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function rh(t) {
  var e = nh(t, 'string');
  return wr(e) == 'symbol' ? e : e + '';
}
function nh(t, e) {
  if (wr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (wr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var Wo = function (e, r, n, a, i) {
    var o = Math.min(Math.abs(n) / 2, Math.abs(a) / 2),
      c = a >= 0 ? 1 : -1,
      l = n >= 0 ? 1 : -1,
      u = (a >= 0 && n >= 0) || (a < 0 && n < 0) ? 1 : 0,
      s;
    if (o > 0 && i instanceof Array) {
      for (var f = [0, 0, 0, 0], p = 0, v = 4; p < v; p++)
        f[p] = i[p] > o ? o : i[p];
      ((s = 'M'.concat(e, ',').concat(r + c * f[0])),
        f[0] > 0 &&
          (s += 'A '
            .concat(f[0], ',')
            .concat(f[0], ',0,0,')
            .concat(u, ',')
            .concat(e + l * f[0], ',')
            .concat(r)),
        (s += 'L '.concat(e + n - l * f[1], ',').concat(r)),
        f[1] > 0 &&
          (s += 'A '
            .concat(f[1], ',')
            .concat(f[1], ',0,0,')
            .concat(
              u,
              `,
        `
            )
            .concat(e + n, ',')
            .concat(r + c * f[1])),
        (s += 'L '.concat(e + n, ',').concat(r + a - c * f[2])),
        f[2] > 0 &&
          (s += 'A '
            .concat(f[2], ',')
            .concat(f[2], ',0,0,')
            .concat(
              u,
              `,
        `
            )
            .concat(e + n - l * f[2], ',')
            .concat(r + a)),
        (s += 'L '.concat(e + l * f[3], ',').concat(r + a)),
        f[3] > 0 &&
          (s += 'A '
            .concat(f[3], ',')
            .concat(f[3], ',0,0,')
            .concat(
              u,
              `,
        `
            )
            .concat(e, ',')
            .concat(r + a - c * f[3])),
        (s += 'Z'));
    } else if (o > 0 && i === +i && i > 0) {
      var h = Math.min(o, i);
      s = 'M '
        .concat(e, ',')
        .concat(
          r + c * h,
          `
            A `
        )
        .concat(h, ',')
        .concat(h, ',0,0,')
        .concat(u, ',')
        .concat(e + l * h, ',')
        .concat(
          r,
          `
            L `
        )
        .concat(e + n - l * h, ',')
        .concat(
          r,
          `
            A `
        )
        .concat(h, ',')
        .concat(h, ',0,0,')
        .concat(u, ',')
        .concat(e + n, ',')
        .concat(
          r + c * h,
          `
            L `
        )
        .concat(e + n, ',')
        .concat(
          r + a - c * h,
          `
            A `
        )
        .concat(h, ',')
        .concat(h, ',0,0,')
        .concat(u, ',')
        .concat(e + n - l * h, ',')
        .concat(
          r + a,
          `
            L `
        )
        .concat(e + l * h, ',')
        .concat(
          r + a,
          `
            A `
        )
        .concat(h, ',')
        .concat(h, ',0,0,')
        .concat(u, ',')
        .concat(e, ',')
        .concat(r + a - c * h, ' Z');
    } else
      s = 'M '
        .concat(e, ',')
        .concat(r, ' h ')
        .concat(n, ' v ')
        .concat(a, ' h ')
        .concat(-n, ' Z');
    return s;
  },
  ah = function (e, r) {
    if (!e || !r) return !1;
    var n = e.x,
      a = e.y,
      i = r.x,
      o = r.y,
      c = r.width,
      l = r.height;
    if (Math.abs(c) > 0 && Math.abs(l) > 0) {
      var u = Math.min(i, i + c),
        s = Math.max(i, i + c),
        f = Math.min(o, o + l),
        p = Math.max(o, o + l);
      return n >= u && n <= s && a >= f && a <= p;
    }
    return !1;
  },
  ih = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 0,
    isAnimationActive: !1,
    isUpdateAnimationActive: !1,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
  },
  mi = function (e) {
    var r = zo(zo({}, ih), e),
      n = N.useRef(),
      a = N.useState(-1),
      i = qv(a, 2),
      o = i[0],
      c = i[1];
    N.useEffect(function () {
      if (n.current && n.current.getTotalLength)
        try {
          var P = n.current.getTotalLength();
          P && c(P);
        } catch {}
    }, []);
    var l = r.x,
      u = r.y,
      s = r.width,
      f = r.height,
      p = r.radius,
      v = r.className,
      h = r.animationEasing,
      m = r.animationDuration,
      y = r.animationBegin,
      O = r.isAnimationActive,
      b = r.isUpdateAnimationActive;
    if (l !== +l || u !== +u || s !== +s || f !== +f || s === 0 || f === 0)
      return null;
    var x = U('recharts-rectangle', v);
    return b
      ? w.createElement(
          Ne,
          {
            canBegin: o > 0,
            from: { width: s, height: f, x: l, y: u },
            to: { width: s, height: f, x: l, y: u },
            duration: m,
            animationEasing: h,
            isActive: b,
          },
          function (P) {
            var d = P.width,
              g = P.height,
              A = P.x,
              S = P.y;
            return w.createElement(
              Ne,
              {
                canBegin: o > 0,
                from: '0px '.concat(o === -1 ? 1 : o, 'px'),
                to: ''.concat(o, 'px 0px'),
                attributeName: 'strokeDasharray',
                begin: y,
                duration: m,
                isActive: O,
                easing: h,
              },
              w.createElement(
                'path',
                fn({}, W(r, !0), { className: x, d: Wo(A, S, d, g, p), ref: n })
              )
            );
          }
        )
      : w.createElement(
          'path',
          fn({}, W(r, !0), { className: x, d: Wo(l, u, s, f, p) })
        );
  },
  oh = ['points', 'className', 'baseLinePoints', 'connectNulls'];
function vt() {
  return (
    (vt = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    vt.apply(this, arguments)
  );
}
function ch(t, e) {
  if (t == null) return {};
  var r = lh(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function lh(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function Fo(t) {
  return ph(t) || fh(t) || sh(t) || uh();
}
function uh() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function sh(t, e) {
  if (t) {
    if (typeof t == 'string') return Ma(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return Ma(t, e);
  }
}
function fh(t) {
  if (
    (typeof Symbol < 'u' && t[Symbol.iterator] != null) ||
    t['@@iterator'] != null
  )
    return Array.from(t);
}
function ph(t) {
  if (Array.isArray(t)) return Ma(t);
}
function Ma(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
var Ko = function (e) {
    return e && e.x === +e.x && e.y === +e.y;
  },
  dh = function () {
    var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [],
      r = [[]];
    return (
      e.forEach(function (n) {
        Ko(n)
          ? r[r.length - 1].push(n)
          : r[r.length - 1].length > 0 && r.push([]);
      }),
      Ko(e[0]) && r[r.length - 1].push(e[0]),
      r[r.length - 1].length <= 0 && (r = r.slice(0, -1)),
      r
    );
  },
  nr = function (e, r) {
    var n = dh(e);
    r &&
      (n = [
        n.reduce(function (i, o) {
          return [].concat(Fo(i), Fo(o));
        }, []),
      ]);
    var a = n
      .map(function (i) {
        return i.reduce(function (o, c, l) {
          return ''
            .concat(o)
            .concat(l === 0 ? 'M' : 'L')
            .concat(c.x, ',')
            .concat(c.y);
        }, '');
      })
      .join('');
    return n.length === 1 ? ''.concat(a, 'Z') : a;
  },
  vh = function (e, r, n) {
    var a = nr(e, n);
    return ''
      .concat(a.slice(-1) === 'Z' ? a.slice(0, -1) : a, 'L')
      .concat(nr(r.reverse(), n).slice(1));
  },
  hh = function (e) {
    var r = e.points,
      n = e.className,
      a = e.baseLinePoints,
      i = e.connectNulls,
      o = ch(e, oh);
    if (!r || !r.length) return null;
    var c = U('recharts-polygon', n);
    if (a && a.length) {
      var l = o.stroke && o.stroke !== 'none',
        u = vh(r, a, i);
      return w.createElement(
        'g',
        { className: c },
        w.createElement(
          'path',
          vt({}, W(o, !0), {
            fill: u.slice(-1) === 'Z' ? o.fill : 'none',
            stroke: 'none',
            d: u,
          })
        ),
        l
          ? w.createElement(
              'path',
              vt({}, W(o, !0), { fill: 'none', d: nr(r, i) })
            )
          : null,
        l
          ? w.createElement(
              'path',
              vt({}, W(o, !0), { fill: 'none', d: nr(a, i) })
            )
          : null
      );
    }
    var s = nr(r, i);
    return w.createElement(
      'path',
      vt({}, W(o, !0), {
        fill: s.slice(-1) === 'Z' ? o.fill : 'none',
        className: c,
        d: s,
      })
    );
  };
function Ba() {
  return (
    (Ba = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Ba.apply(this, arguments)
  );
}
var Dr = function (e) {
  var r = e.cx,
    n = e.cy,
    a = e.r,
    i = e.className,
    o = U('recharts-dot', i);
  return r === +r && n === +n && a === +a
    ? w.createElement(
        'circle',
        Ba({}, W(e, !1), Qr(e), { className: o, cx: r, cy: n, r: a })
      )
    : null;
};
function Pr(t) {
  '@babel/helpers - typeof';
  return (
    (Pr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Pr(t)
  );
}
var yh = ['x', 'y', 'top', 'left', 'width', 'height', 'className'];
function Na() {
  return (
    (Na = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Na.apply(this, arguments)
  );
}
function Vo(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function mh(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Vo(Object(r), !0).forEach(function (n) {
          gh(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Vo(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function gh(t, e, r) {
  return (
    (e = bh(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function bh(t) {
  var e = xh(t, 'string');
  return Pr(e) == 'symbol' ? e : e + '';
}
function xh(t, e) {
  if (Pr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Pr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function Oh(t, e) {
  if (t == null) return {};
  var r = wh(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function wh(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
var Ph = function (e, r, n, a, i, o) {
    return 'M'
      .concat(e, ',')
      .concat(i, 'v')
      .concat(a, 'M')
      .concat(o, ',')
      .concat(r, 'h')
      .concat(n);
  },
  Ah = function (e) {
    var r = e.x,
      n = r === void 0 ? 0 : r,
      a = e.y,
      i = a === void 0 ? 0 : a,
      o = e.top,
      c = o === void 0 ? 0 : o,
      l = e.left,
      u = l === void 0 ? 0 : l,
      s = e.width,
      f = s === void 0 ? 0 : s,
      p = e.height,
      v = p === void 0 ? 0 : p,
      h = e.className,
      m = Oh(e, yh),
      y = mh({ x: n, y: i, top: c, left: u, width: f, height: v }, m);
    return !M(n) || !M(i) || !M(f) || !M(v) || !M(c) || !M(u)
      ? null
      : w.createElement(
          'path',
          Na({}, W(y, !0), {
            className: U('recharts-cross', h),
            d: Ph(n, i, f, v, c, u),
          })
        );
  },
  Sh = ['cx', 'cy', 'angle', 'ticks', 'axisLine'],
  jh = ['ticks', 'tick', 'angle', 'tickFormatter', 'stroke'];
function jt(t) {
  '@babel/helpers - typeof';
  return (
    (jt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    jt(t)
  );
}
function ar() {
  return (
    (ar = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    ar.apply(this, arguments)
  );
}
function Xo(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Xe(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Xo(Object(r), !0).forEach(function (n) {
          Bn(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Xo(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Go(t, e) {
  if (t == null) return {};
  var r = Eh(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function Eh(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function $h(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Ho(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Cl(n.key), n));
  }
}
function _h(t, e, r) {
  return (
    e && Ho(t.prototype, e),
    r && Ho(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Th(t, e, r) {
  return (
    (e = pn(e)),
    Ih(
      t,
      kl() ? Reflect.construct(e, r || [], pn(t).constructor) : e.apply(t, r)
    )
  );
}
function Ih(t, e) {
  if (e && (jt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return kh(t);
}
function kh(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function kl() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (kl = function () {
    return !!t;
  })();
}
function pn(t) {
  return (
    (pn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    pn(t)
  );
}
function Ch(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && La(t, e));
}
function La(t, e) {
  return (
    (La = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    La(t, e)
  );
}
function Bn(t, e, r) {
  return (
    (e = Cl(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Cl(t) {
  var e = Dh(t, 'string');
  return jt(e) == 'symbol' ? e : e + '';
}
function Dh(t, e) {
  if (jt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (jt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var Nn = (function (t) {
  function e() {
    return ($h(this, e), Th(this, e, arguments));
  }
  return (
    Ch(e, t),
    _h(
      e,
      [
        {
          key: 'getTickValueCoord',
          value: function (n) {
            var a = n.coordinate,
              i = this.props,
              o = i.angle,
              c = i.cx,
              l = i.cy;
            return Q(c, l, a, o);
          },
        },
        {
          key: 'getTickTextAnchor',
          value: function () {
            var n = this.props.orientation,
              a;
            switch (n) {
              case 'left':
                a = 'end';
                break;
              case 'right':
                a = 'start';
                break;
              default:
                a = 'middle';
                break;
            }
            return a;
          },
        },
        {
          key: 'getViewBox',
          value: function () {
            var n = this.props,
              a = n.cx,
              i = n.cy,
              o = n.angle,
              c = n.ticks,
              l = Mu(c, function (s) {
                return s.coordinate || 0;
              }),
              u = Bu(c, function (s) {
                return s.coordinate || 0;
              });
            return {
              cx: a,
              cy: i,
              startAngle: o,
              endAngle: o,
              innerRadius: u.coordinate || 0,
              outerRadius: l.coordinate || 0,
            };
          },
        },
        {
          key: 'renderAxisLine',
          value: function () {
            var n = this.props,
              a = n.cx,
              i = n.cy,
              o = n.angle,
              c = n.ticks,
              l = n.axisLine,
              u = Go(n, Sh),
              s = c.reduce(
                function (h, m) {
                  return [
                    Math.min(h[0], m.coordinate),
                    Math.max(h[1], m.coordinate),
                  ];
                },
                [1 / 0, -1 / 0]
              ),
              f = Q(a, i, s[0], o),
              p = Q(a, i, s[1], o),
              v = Xe(
                Xe(Xe({}, W(u, !1)), {}, { fill: 'none' }, W(l, !1)),
                {},
                { x1: f.x, y1: f.y, x2: p.x, y2: p.y }
              );
            return w.createElement(
              'line',
              ar({ className: 'recharts-polar-radius-axis-line' }, v)
            );
          },
        },
        {
          key: 'renderTicks',
          value: function () {
            var n = this,
              a = this.props,
              i = a.ticks,
              o = a.tick,
              c = a.angle,
              l = a.tickFormatter,
              u = a.stroke,
              s = Go(a, jh),
              f = this.getTickTextAnchor(),
              p = W(s, !1),
              v = W(o, !1),
              h = i.map(function (m, y) {
                var O = n.getTickValueCoord(m),
                  b = Xe(
                    Xe(
                      Xe(
                        Xe(
                          {
                            textAnchor: f,
                            transform: 'rotate('
                              .concat(90 - c, ', ')
                              .concat(O.x, ', ')
                              .concat(O.y, ')'),
                          },
                          p
                        ),
                        {},
                        { stroke: 'none', fill: u },
                        v
                      ),
                      {},
                      { index: y },
                      O
                    ),
                    {},
                    { payload: m }
                  );
                return w.createElement(
                  Y,
                  ar(
                    {
                      className: U('recharts-polar-radius-axis-tick', $l(o)),
                      key: 'tick-'.concat(m.coordinate),
                    },
                    tt(n.props, m, y)
                  ),
                  e.renderTickItem(o, b, l ? l(m.value, y) : m.value)
                );
              });
            return w.createElement(
              Y,
              { className: 'recharts-polar-radius-axis-ticks' },
              h
            );
          },
        },
        {
          key: 'render',
          value: function () {
            var n = this.props,
              a = n.ticks,
              i = n.axisLine,
              o = n.tick;
            return !a || !a.length
              ? null
              : w.createElement(
                  Y,
                  {
                    className: U(
                      'recharts-polar-radius-axis',
                      this.props.className
                    ),
                  },
                  i && this.renderAxisLine(),
                  o && this.renderTicks(),
                  ce.renderCallByParent(this.props, this.getViewBox())
                );
          },
        },
      ],
      [
        {
          key: 'renderTickItem',
          value: function (n, a, i) {
            var o;
            return (
              w.isValidElement(n)
                ? (o = w.cloneElement(n, a))
                : V(n)
                  ? (o = n(a))
                  : (o = w.createElement(
                      rt,
                      ar({}, a, {
                        className: 'recharts-polar-radius-axis-tick-value',
                      }),
                      i
                    )),
              o
            );
          },
        },
      ]
    )
  );
})(N.PureComponent);
Bn(Nn, 'displayName', 'PolarRadiusAxis');
Bn(Nn, 'axisType', 'radiusAxis');
Bn(Nn, 'defaultProps', {
  type: 'number',
  radiusAxisId: 0,
  cx: 0,
  cy: 0,
  angle: 0,
  orientation: 'right',
  stroke: '#ccc',
  axisLine: !0,
  tick: !0,
  tickCount: 5,
  allowDataOverflow: !1,
  scale: 'auto',
  allowDuplicatedCategory: !0,
});
function Et(t) {
  '@babel/helpers - typeof';
  return (
    (Et =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Et(t)
  );
}
function He() {
  return (
    (He = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    He.apply(this, arguments)
  );
}
function Uo(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Ge(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Uo(Object(r), !0).forEach(function (n) {
          Ln(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Uo(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Mh(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Yo(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Ml(n.key), n));
  }
}
function Bh(t, e, r) {
  return (
    e && Yo(t.prototype, e),
    r && Yo(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Nh(t, e, r) {
  return (
    (e = dn(e)),
    Lh(
      t,
      Dl() ? Reflect.construct(e, r || [], dn(t).constructor) : e.apply(t, r)
    )
  );
}
function Lh(t, e) {
  if (e && (Et(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Rh(t);
}
function Rh(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function Dl() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (Dl = function () {
    return !!t;
  })();
}
function dn(t) {
  return (
    (dn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    dn(t)
  );
}
function zh(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && Ra(t, e));
}
function Ra(t, e) {
  return (
    (Ra = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    Ra(t, e)
  );
}
function Ln(t, e, r) {
  return (
    (e = Ml(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Ml(t) {
  var e = Wh(t, 'string');
  return Et(e) == 'symbol' ? e : e + '';
}
function Wh(t, e) {
  if (Et(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Et(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var Fh = Math.PI / 180,
  Kh = 1e-5,
  Rn = (function (t) {
    function e() {
      return (Mh(this, e), Nh(this, e, arguments));
    }
    return (
      zh(e, t),
      Bh(
        e,
        [
          {
            key: 'getTickLineCoord',
            value: function (n) {
              var a = this.props,
                i = a.cx,
                o = a.cy,
                c = a.radius,
                l = a.orientation,
                u = a.tickSize,
                s = u || 8,
                f = Q(i, o, c, n.coordinate),
                p = Q(i, o, c + (l === 'inner' ? -1 : 1) * s, n.coordinate);
              return { x1: f.x, y1: f.y, x2: p.x, y2: p.y };
            },
          },
          {
            key: 'getTickTextAnchor',
            value: function (n) {
              var a = this.props.orientation,
                i = Math.cos(-n.coordinate * Fh),
                o;
              return (
                i > Kh
                  ? (o = a === 'outer' ? 'start' : 'end')
                  : i < -1e-5
                    ? (o = a === 'outer' ? 'end' : 'start')
                    : (o = 'middle'),
                o
              );
            },
          },
          {
            key: 'renderAxisLine',
            value: function () {
              var n = this.props,
                a = n.cx,
                i = n.cy,
                o = n.radius,
                c = n.axisLine,
                l = n.axisLineType,
                u = Ge(
                  Ge({}, W(this.props, !1)),
                  {},
                  { fill: 'none' },
                  W(c, !1)
                );
              if (l === 'circle')
                return w.createElement(
                  Dr,
                  He({ className: 'recharts-polar-angle-axis-line' }, u, {
                    cx: a,
                    cy: i,
                    r: o,
                  })
                );
              var s = this.props.ticks,
                f = s.map(function (p) {
                  return Q(a, i, o, p.coordinate);
                });
              return w.createElement(
                hh,
                He({ className: 'recharts-polar-angle-axis-line' }, u, {
                  points: f,
                })
              );
            },
          },
          {
            key: 'renderTicks',
            value: function () {
              var n = this,
                a = this.props,
                i = a.ticks,
                o = a.tick,
                c = a.tickLine,
                l = a.tickFormatter,
                u = a.stroke,
                s = W(this.props, !1),
                f = W(o, !1),
                p = Ge(Ge({}, s), {}, { fill: 'none' }, W(c, !1)),
                v = i.map(function (h, m) {
                  var y = n.getTickLineCoord(h),
                    O = n.getTickTextAnchor(h),
                    b = Ge(
                      Ge(
                        Ge({ textAnchor: O }, s),
                        {},
                        { stroke: 'none', fill: u },
                        f
                      ),
                      {},
                      { index: m, payload: h, x: y.x2, y: y.y2 }
                    );
                  return w.createElement(
                    Y,
                    He(
                      {
                        className: U('recharts-polar-angle-axis-tick', $l(o)),
                        key: 'tick-'.concat(h.coordinate),
                      },
                      tt(n.props, h, m)
                    ),
                    c &&
                      w.createElement(
                        'line',
                        He(
                          { className: 'recharts-polar-angle-axis-tick-line' },
                          p,
                          y
                        )
                      ),
                    o && e.renderTickItem(o, b, l ? l(h.value, m) : h.value)
                  );
                });
              return w.createElement(
                Y,
                { className: 'recharts-polar-angle-axis-ticks' },
                v
              );
            },
          },
          {
            key: 'render',
            value: function () {
              var n = this.props,
                a = n.ticks,
                i = n.radius,
                o = n.axisLine;
              return i <= 0 || !a || !a.length
                ? null
                : w.createElement(
                    Y,
                    {
                      className: U(
                        'recharts-polar-angle-axis',
                        this.props.className
                      ),
                    },
                    o && this.renderAxisLine(),
                    this.renderTicks()
                  );
            },
          },
        ],
        [
          {
            key: 'renderTickItem',
            value: function (n, a, i) {
              var o;
              return (
                w.isValidElement(n)
                  ? (o = w.cloneElement(n, a))
                  : V(n)
                    ? (o = n(a))
                    : (o = w.createElement(
                        rt,
                        He({}, a, {
                          className: 'recharts-polar-angle-axis-tick-value',
                        }),
                        i
                      )),
                o
              );
            },
          },
        ]
      )
    );
  })(N.PureComponent);
Ln(Rn, 'displayName', 'PolarAngleAxis');
Ln(Rn, 'axisType', 'angleAxis');
Ln(Rn, 'defaultProps', {
  type: 'category',
  angleAxisId: 0,
  scale: 'auto',
  cx: 0,
  cy: 0,
  orientation: 'outer',
  axisLine: !0,
  tickLine: !0,
  tickSize: 8,
  tick: !0,
  hide: !1,
  allowDuplicatedCategory: !0,
});
function Ar(t) {
  '@babel/helpers - typeof';
  return (
    (Ar =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Ar(t)
  );
}
function vn() {
  return (
    (vn = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    vn.apply(this, arguments)
  );
}
function Vh(t, e) {
  return Uh(t) || Hh(t, e) || Gh(t, e) || Xh();
}
function Xh() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Gh(t, e) {
  if (t) {
    if (typeof t == 'string') return qo(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return qo(t, e);
  }
}
function qo(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Hh(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function Uh(t) {
  if (Array.isArray(t)) return t;
}
function Zo(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Qo(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Zo(Object(r), !0).forEach(function (n) {
          Yh(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Zo(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Yh(t, e, r) {
  return (
    (e = qh(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function qh(t) {
  var e = Zh(t, 'string');
  return Ar(e) == 'symbol' ? e : e + '';
}
function Zh(t, e) {
  if (Ar(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Ar(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var Jo = function (e, r, n, a, i) {
    var o = n - a,
      c;
    return (
      (c = 'M '.concat(e, ',').concat(r)),
      (c += 'L '.concat(e + n, ',').concat(r)),
      (c += 'L '.concat(e + n - o / 2, ',').concat(r + i)),
      (c += 'L '.concat(e + n - o / 2 - a, ',').concat(r + i)),
      (c += 'L '.concat(e, ',').concat(r, ' Z')),
      c
    );
  },
  Qh = {
    x: 0,
    y: 0,
    upperWidth: 0,
    lowerWidth: 0,
    height: 0,
    isUpdateAnimationActive: !1,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
  },
  Jh = function (e) {
    var r = Qo(Qo({}, Qh), e),
      n = N.useRef(),
      a = N.useState(-1),
      i = Vh(a, 2),
      o = i[0],
      c = i[1];
    N.useEffect(function () {
      if (n.current && n.current.getTotalLength)
        try {
          var x = n.current.getTotalLength();
          x && c(x);
        } catch {}
    }, []);
    var l = r.x,
      u = r.y,
      s = r.upperWidth,
      f = r.lowerWidth,
      p = r.height,
      v = r.className,
      h = r.animationEasing,
      m = r.animationDuration,
      y = r.animationBegin,
      O = r.isUpdateAnimationActive;
    if (
      l !== +l ||
      u !== +u ||
      s !== +s ||
      f !== +f ||
      p !== +p ||
      (s === 0 && f === 0) ||
      p === 0
    )
      return null;
    var b = U('recharts-trapezoid', v);
    return O
      ? w.createElement(
          Ne,
          {
            canBegin: o > 0,
            from: { upperWidth: 0, lowerWidth: 0, height: p, x: l, y: u },
            to: { upperWidth: s, lowerWidth: f, height: p, x: l, y: u },
            duration: m,
            animationEasing: h,
            isActive: O,
          },
          function (x) {
            var P = x.upperWidth,
              d = x.lowerWidth,
              g = x.height,
              A = x.x,
              S = x.y;
            return w.createElement(
              Ne,
              {
                canBegin: o > 0,
                from: '0px '.concat(o === -1 ? 1 : o, 'px'),
                to: ''.concat(o, 'px 0px'),
                attributeName: 'strokeDasharray',
                begin: y,
                duration: m,
                easing: h,
              },
              w.createElement(
                'path',
                vn({}, W(r, !0), { className: b, d: Jo(A, S, P, d, g), ref: n })
              )
            );
          }
        )
      : w.createElement(
          'g',
          null,
          w.createElement(
            'path',
            vn({}, W(r, !0), { className: b, d: Jo(l, u, s, f, p) })
          )
        );
  },
  ey = [
    'option',
    'shapeType',
    'propTransformer',
    'activeClassName',
    'isActive',
  ];
function Sr(t) {
  '@babel/helpers - typeof';
  return (
    (Sr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Sr(t)
  );
}
function ty(t, e) {
  if (t == null) return {};
  var r = ry(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function ry(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function ec(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function hn(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? ec(Object(r), !0).forEach(function (n) {
          ny(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : ec(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function ny(t, e, r) {
  return (
    (e = ay(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function ay(t) {
  var e = iy(t, 'string');
  return Sr(e) == 'symbol' ? e : e + '';
}
function iy(t, e) {
  if (Sr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Sr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function oy(t, e) {
  return hn(hn({}, e), t);
}
function cy(t, e) {
  return t === 'symbols';
}
function tc(t) {
  var e = t.shapeType,
    r = t.elementProps;
  switch (e) {
    case 'rectangle':
      return w.createElement(mi, r);
    case 'trapezoid':
      return w.createElement(Jh, r);
    case 'sector':
      return w.createElement(Il, r);
    case 'symbols':
      if (cy(e)) return w.createElement(pi, r);
      break;
    default:
      return null;
  }
}
function ly(t) {
  return N.isValidElement(t) ? t.props : t;
}
function Bl(t) {
  var e = t.option,
    r = t.shapeType,
    n = t.propTransformer,
    a = n === void 0 ? oy : n,
    i = t.activeClassName,
    o = i === void 0 ? 'recharts-active-shape' : i,
    c = t.isActive,
    l = ty(t, ey),
    u;
  if (N.isValidElement(e)) u = N.cloneElement(e, hn(hn({}, l), ly(e)));
  else if (V(e)) u = e(l);
  else if (Nu(e) && !Lu(e)) {
    var s = a(e, l);
    u = w.createElement(tc, { shapeType: r, elementProps: s });
  } else {
    var f = l;
    u = w.createElement(tc, { shapeType: r, elementProps: f });
  }
  return c ? w.createElement(Y, { className: o }, u) : u;
}
function zn(t, e) {
  return e != null && 'trapezoids' in t.props;
}
function Wn(t, e) {
  return e != null && 'sectors' in t.props;
}
function jr(t, e) {
  return e != null && 'points' in t.props;
}
function uy(t, e) {
  var r,
    n,
    a =
      t.x ===
        (e == null || (r = e.labelViewBox) === null || r === void 0
          ? void 0
          : r.x) || t.x === e.x,
    i =
      t.y ===
        (e == null || (n = e.labelViewBox) === null || n === void 0
          ? void 0
          : n.y) || t.y === e.y;
  return a && i;
}
function sy(t, e) {
  var r = t.endAngle === e.endAngle,
    n = t.startAngle === e.startAngle;
  return r && n;
}
function fy(t, e) {
  var r = t.x === e.x,
    n = t.y === e.y,
    a = t.z === e.z;
  return r && n && a;
}
function py(t, e) {
  var r;
  return (zn(t, e) ? (r = uy) : Wn(t, e) ? (r = sy) : jr(t, e) && (r = fy), r);
}
function dy(t, e) {
  var r;
  return (
    zn(t, e)
      ? (r = 'trapezoids')
      : Wn(t, e)
        ? (r = 'sectors')
        : jr(t, e) && (r = 'points'),
    r
  );
}
function vy(t, e) {
  if (zn(t, e)) {
    var r;
    return (r = e.tooltipPayload) === null ||
      r === void 0 ||
      (r = r[0]) === null ||
      r === void 0 ||
      (r = r.payload) === null ||
      r === void 0
      ? void 0
      : r.payload;
  }
  if (Wn(t, e)) {
    var n;
    return (n = e.tooltipPayload) === null ||
      n === void 0 ||
      (n = n[0]) === null ||
      n === void 0 ||
      (n = n.payload) === null ||
      n === void 0
      ? void 0
      : n.payload;
  }
  return jr(t, e) ? e.payload : {};
}
function hy(t) {
  var e = t.activeTooltipItem,
    r = t.graphicalItem,
    n = t.itemData,
    a = dy(r, e),
    i = vy(r, e),
    o = n.filter(function (l, u) {
      var s = et(i, l),
        f = r.props[a].filter(function (h) {
          var m = py(r, e);
          return m(h, e);
        }),
        p = r.props[a].indexOf(f[f.length - 1]),
        v = u === p;
      return s && v;
    }),
    c = n.indexOf(o[o.length - 1]);
  return c;
}
var Yr;
function $t(t) {
  '@babel/helpers - typeof';
  return (
    ($t =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    $t(t)
  );
}
function ht() {
  return (
    (ht = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    ht.apply(this, arguments)
  );
}
function rc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Z(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? rc(Object(r), !0).forEach(function (n) {
          be(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : rc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function yy(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function nc(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Ll(n.key), n));
  }
}
function my(t, e, r) {
  return (
    e && nc(t.prototype, e),
    r && nc(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function gy(t, e, r) {
  return (
    (e = yn(e)),
    by(
      t,
      Nl() ? Reflect.construct(e, r || [], yn(t).constructor) : e.apply(t, r)
    )
  );
}
function by(t, e) {
  if (e && ($t(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return xy(t);
}
function xy(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function Nl() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (Nl = function () {
    return !!t;
  })();
}
function yn(t) {
  return (
    (yn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    yn(t)
  );
}
function Oy(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && za(t, e));
}
function za(t, e) {
  return (
    (za = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    za(t, e)
  );
}
function be(t, e, r) {
  return (
    (e = Ll(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Ll(t) {
  var e = wy(t, 'string');
  return $t(e) == 'symbol' ? e : e + '';
}
function wy(t, e) {
  if ($t(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if ($t(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Re = (function (t) {
  function e(r) {
    var n;
    return (
      yy(this, e),
      (n = gy(this, e, [r])),
      be(n, 'pieRef', null),
      be(n, 'sectorRefs', []),
      be(n, 'id', at('recharts-pie-')),
      be(n, 'handleAnimationEnd', function () {
        var a = n.props.onAnimationEnd;
        (n.setState({ isAnimationFinished: !0 }), V(a) && a());
      }),
      be(n, 'handleAnimationStart', function () {
        var a = n.props.onAnimationStart;
        (n.setState({ isAnimationFinished: !1 }), V(a) && a());
      }),
      (n.state = {
        isAnimationFinished: !r.isAnimationActive,
        prevIsAnimationActive: r.isAnimationActive,
        prevAnimationId: r.animationId,
        sectorToFocus: 0,
      }),
      n
    );
  }
  return (
    Oy(e, t),
    my(
      e,
      [
        {
          key: 'isActiveIndex',
          value: function (n) {
            var a = this.props.activeIndex;
            return Array.isArray(a) ? a.indexOf(n) !== -1 : n === a;
          },
        },
        {
          key: 'hasActiveIndex',
          value: function () {
            var n = this.props.activeIndex;
            return Array.isArray(n) ? n.length !== 0 : n || n === 0;
          },
        },
        {
          key: 'renderLabels',
          value: function (n) {
            var a = this.props.isAnimationActive;
            if (a && !this.state.isAnimationFinished) return null;
            var i = this.props,
              o = i.label,
              c = i.labelLine,
              l = i.dataKey,
              u = i.valueKey,
              s = W(this.props, !1),
              f = W(o, !1),
              p = W(c, !1),
              v = (o && o.offsetRadius) || 20,
              h = n.map(function (m, y) {
                var O = (m.startAngle + m.endAngle) / 2,
                  b = Q(m.cx, m.cy, m.outerRadius + v, O),
                  x = Z(
                    Z(Z(Z({}, s), m), {}, { stroke: 'none' }, f),
                    {},
                    { index: y, textAnchor: e.getTextAnchor(b.x, m.cx) },
                    b
                  ),
                  P = Z(
                    Z(Z(Z({}, s), m), {}, { fill: 'none', stroke: m.fill }, p),
                    {},
                    { index: y, points: [Q(m.cx, m.cy, m.outerRadius, O), b] }
                  ),
                  d = l;
                return (
                  H(l) && H(u) ? (d = 'value') : H(l) && (d = u),
                  w.createElement(
                    Y,
                    {
                      key: 'label-'
                        .concat(m.startAngle, '-')
                        .concat(m.endAngle, '-')
                        .concat(m.midAngle, '-')
                        .concat(y),
                    },
                    c && e.renderLabelLineItem(c, P, 'line'),
                    e.renderLabelItem(o, x, te(m, d))
                  )
                );
              });
            return w.createElement(Y, { className: 'recharts-pie-labels' }, h);
          },
        },
        {
          key: 'renderSectorsStatically',
          value: function (n) {
            var a = this,
              i = this.props,
              o = i.activeShape,
              c = i.blendStroke,
              l = i.inactiveShape;
            return n.map(function (u, s) {
              if (u?.startAngle === 0 && u?.endAngle === 0 && n.length !== 1)
                return null;
              var f = a.isActiveIndex(s),
                p = l && a.hasActiveIndex() ? l : null,
                v = f ? o : p,
                h = Z(
                  Z({}, u),
                  {},
                  { stroke: c ? u.fill : u.stroke, tabIndex: -1 }
                );
              return w.createElement(
                Y,
                ht(
                  {
                    ref: function (y) {
                      y && !a.sectorRefs.includes(y) && a.sectorRefs.push(y);
                    },
                    tabIndex: -1,
                    className: 'recharts-pie-sector',
                  },
                  tt(a.props, u, s),
                  {
                    key: 'sector-'
                      .concat(u?.startAngle, '-')
                      .concat(u?.endAngle, '-')
                      .concat(u.midAngle, '-')
                      .concat(s),
                  }
                ),
                w.createElement(
                  Bl,
                  ht({ option: v, isActive: f, shapeType: 'sector' }, h)
                )
              );
            });
          },
        },
        {
          key: 'renderSectorsWithAnimation',
          value: function () {
            var n = this,
              a = this.props,
              i = a.sectors,
              o = a.isAnimationActive,
              c = a.animationBegin,
              l = a.animationDuration,
              u = a.animationEasing,
              s = a.animationId,
              f = this.state,
              p = f.prevSectors,
              v = f.prevIsAnimationActive;
            return w.createElement(
              Ne,
              {
                begin: c,
                duration: l,
                isActive: o,
                easing: u,
                from: { t: 0 },
                to: { t: 1 },
                key: 'pie-'.concat(s, '-').concat(v),
                onAnimationStart: this.handleAnimationStart,
                onAnimationEnd: this.handleAnimationEnd,
              },
              function (h) {
                var m = h.t,
                  y = [],
                  O = i && i[0],
                  b = O.startAngle;
                return (
                  i.forEach(function (x, P) {
                    var d = p && p[P],
                      g = P > 0 ? ye(x, 'paddingAngle', 0) : 0;
                    if (d) {
                      var A = ae(
                          d.endAngle - d.startAngle,
                          x.endAngle - x.startAngle
                        ),
                        S = Z(
                          Z({}, x),
                          {},
                          { startAngle: b + g, endAngle: b + A(m) + g }
                        );
                      (y.push(S), (b = S.endAngle));
                    } else {
                      var j = x.endAngle,
                        E = x.startAngle,
                        $ = ae(0, j - E),
                        _ = $(m),
                        k = Z(
                          Z({}, x),
                          {},
                          { startAngle: b + g, endAngle: b + _ + g }
                        );
                      (y.push(k), (b = k.endAngle));
                    }
                  }),
                  w.createElement(Y, null, n.renderSectorsStatically(y))
                );
              }
            );
          },
        },
        {
          key: 'attachKeyboardHandlers',
          value: function (n) {
            var a = this;
            n.onkeydown = function (i) {
              if (!i.altKey)
                switch (i.key) {
                  case 'ArrowLeft': {
                    var o = ++a.state.sectorToFocus % a.sectorRefs.length;
                    (a.sectorRefs[o].focus(), a.setState({ sectorToFocus: o }));
                    break;
                  }
                  case 'ArrowRight': {
                    var c =
                      --a.state.sectorToFocus < 0
                        ? a.sectorRefs.length - 1
                        : a.state.sectorToFocus % a.sectorRefs.length;
                    (a.sectorRefs[c].focus(), a.setState({ sectorToFocus: c }));
                    break;
                  }
                  case 'Escape': {
                    (a.sectorRefs[a.state.sectorToFocus].blur(),
                      a.setState({ sectorToFocus: 0 }));
                    break;
                  }
                }
            };
          },
        },
        {
          key: 'renderSectors',
          value: function () {
            var n = this.props,
              a = n.sectors,
              i = n.isAnimationActive,
              o = this.state.prevSectors;
            return i && a && a.length && (!o || !et(o, a))
              ? this.renderSectorsWithAnimation()
              : this.renderSectorsStatically(a);
          },
        },
        {
          key: 'componentDidMount',
          value: function () {
            this.pieRef && this.attachKeyboardHandlers(this.pieRef);
          },
        },
        {
          key: 'render',
          value: function () {
            var n = this,
              a = this.props,
              i = a.hide,
              o = a.sectors,
              c = a.className,
              l = a.label,
              u = a.cx,
              s = a.cy,
              f = a.innerRadius,
              p = a.outerRadius,
              v = a.isAnimationActive,
              h = this.state.isAnimationFinished;
            if (i || !o || !o.length || !M(u) || !M(s) || !M(f) || !M(p))
              return null;
            var m = U('recharts-pie', c);
            return w.createElement(
              Y,
              {
                tabIndex: this.props.rootTabIndex,
                className: m,
                ref: function (O) {
                  n.pieRef = O;
                },
              },
              this.renderSectors(),
              l && this.renderLabels(o),
              ce.renderCallByParent(this.props, null, !1),
              (!v || h) && je.renderCallByParent(this.props, o, !1)
            );
          },
        },
      ],
      [
        {
          key: 'getDerivedStateFromProps',
          value: function (n, a) {
            return a.prevIsAnimationActive !== n.isAnimationActive
              ? {
                  prevIsAnimationActive: n.isAnimationActive,
                  prevAnimationId: n.animationId,
                  curSectors: n.sectors,
                  prevSectors: [],
                  isAnimationFinished: !0,
                }
              : n.isAnimationActive && n.animationId !== a.prevAnimationId
                ? {
                    prevAnimationId: n.animationId,
                    curSectors: n.sectors,
                    prevSectors: a.curSectors,
                    isAnimationFinished: !0,
                  }
                : n.sectors !== a.curSectors
                  ? { curSectors: n.sectors, isAnimationFinished: !0 }
                  : null;
          },
        },
        {
          key: 'getTextAnchor',
          value: function (n, a) {
            return n > a ? 'start' : n < a ? 'end' : 'middle';
          },
        },
        {
          key: 'renderLabelLineItem',
          value: function (n, a, i) {
            if (w.isValidElement(n)) return w.cloneElement(n, a);
            if (V(n)) return n(a);
            var o = U(
              'recharts-pie-label-line',
              typeof n != 'boolean' ? n.className : ''
            );
            return w.createElement(
              Ze,
              ht({}, a, { key: i, type: 'linear', className: o })
            );
          },
        },
        {
          key: 'renderLabelItem',
          value: function (n, a, i) {
            if (w.isValidElement(n)) return w.cloneElement(n, a);
            var o = i;
            if (V(n) && ((o = n(a)), w.isValidElement(o))) return o;
            var c = U(
              'recharts-pie-label-text',
              typeof n != 'boolean' && !V(n) ? n.className : ''
            );
            return w.createElement(
              rt,
              ht({}, a, { alignmentBaseline: 'middle', className: c }),
              o
            );
          },
        },
      ]
    )
  );
})(N.PureComponent);
Yr = Re;
be(Re, 'displayName', 'Pie');
be(Re, 'defaultProps', {
  stroke: '#fff',
  fill: '#808080',
  legendType: 'rect',
  cx: '50%',
  cy: '50%',
  startAngle: 0,
  endAngle: 360,
  innerRadius: 0,
  outerRadius: '80%',
  paddingAngle: 0,
  labelLine: !0,
  hide: !1,
  minAngle: 0,
  isAnimationActive: !Le.isSsr,
  animationBegin: 400,
  animationDuration: 1500,
  animationEasing: 'ease',
  nameKey: 'name',
  blendStroke: !1,
  rootTabIndex: 0,
});
be(Re, 'parseDeltaAngle', function (t, e) {
  var r = fe(e - t),
    n = Math.min(Math.abs(e - t), 360);
  return r * n;
});
be(Re, 'getRealPieData', function (t) {
  var e = t.data,
    r = t.children,
    n = W(t, !1),
    a = me(r, hi);
  return e && e.length
    ? e.map(function (i, o) {
        return Z(Z(Z({ payload: i }, n), i), a && a[o] && a[o].props);
      })
    : a && a.length
      ? a.map(function (i) {
          return Z(Z({}, n), i.props);
        })
      : [];
});
be(Re, 'parseCoordinateOfPie', function (t, e) {
  var r = e.top,
    n = e.left,
    a = e.width,
    i = e.height,
    o = El(a, i),
    c = n + pe(t.cx, a, a / 2),
    l = r + pe(t.cy, i, i / 2),
    u = pe(t.innerRadius, o, 0),
    s = pe(t.outerRadius, o, o * 0.8),
    f = t.maxRadius || Math.sqrt(a * a + i * i) / 2;
  return { cx: c, cy: l, innerRadius: u, outerRadius: s, maxRadius: f };
});
be(Re, 'getComposedData', function (t) {
  var e = t.item,
    r = t.offset,
    n =
      e.type.defaultProps !== void 0
        ? Z(Z({}, e.type.defaultProps), e.props)
        : e.props,
    a = Yr.getRealPieData(n);
  if (!a || !a.length) return null;
  var i = n.cornerRadius,
    o = n.startAngle,
    c = n.endAngle,
    l = n.paddingAngle,
    u = n.dataKey,
    s = n.nameKey,
    f = n.valueKey,
    p = n.tooltipType,
    v = Math.abs(n.minAngle),
    h = Yr.parseCoordinateOfPie(n, r),
    m = Yr.parseDeltaAngle(o, c),
    y = Math.abs(m),
    O = u;
  H(u) && H(f)
    ? (Ae(
        !1,
        `Use "dataKey" to specify the value of pie,
      the props "valueKey" will be deprecated in 1.1.0`
      ),
      (O = 'value'))
    : H(u) &&
      (Ae(
        !1,
        `Use "dataKey" to specify the value of pie,
      the props "valueKey" will be deprecated in 1.1.0`
      ),
      (O = f));
  var b = a.filter(function (S) {
      return te(S, O, 0) !== 0;
    }).length,
    x = (y >= 360 ? b : b - 1) * l,
    P = y - b * v - x,
    d = a.reduce(function (S, j) {
      var E = te(j, O, 0);
      return S + (M(E) ? E : 0);
    }, 0),
    g;
  if (d > 0) {
    var A;
    g = a.map(function (S, j) {
      var E = te(S, O, 0),
        $ = te(S, s, j),
        _ = (M(E) ? E : 0) / d,
        k;
      j ? (k = A.endAngle + fe(m) * l * (E !== 0 ? 1 : 0)) : (k = o);
      var C = k + fe(m) * ((E !== 0 ? v : 0) + _ * P),
        I = (k + C) / 2,
        D = (h.innerRadius + h.outerRadius) / 2,
        B = [{ name: $, value: E, payload: S, dataKey: O, type: p }],
        L = Q(h.cx, h.cy, D, I);
      return (
        (A = Z(
          Z(
            Z(
              {
                percent: _,
                cornerRadius: i,
                name: $,
                tooltipPayload: B,
                midAngle: I,
                middleRadius: D,
                tooltipPosition: L,
              },
              S
            ),
            h
          ),
          {},
          {
            value: te(S, O),
            startAngle: k,
            endAngle: C,
            payload: S,
            paddingAngle: fe(m) * l,
          }
        )),
        A
      );
    });
  }
  return Z(Z({}, h), {}, { sectors: g, data: a });
});
function Er(t) {
  '@babel/helpers - typeof';
  return (
    (Er =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Er(t)
  );
}
function ac(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ic(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? ac(Object(r), !0).forEach(function (n) {
          Rl(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : ac(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Rl(t, e, r) {
  return (
    (e = Py(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Py(t) {
  var e = Ay(t, 'string');
  return Er(e) == 'symbol' ? e : e + '';
}
function Ay(t, e) {
  if (Er(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Er(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var Sy = ['Webkit', 'Moz', 'O', 'ms'],
  jy = function (e, r) {
    var n = e.replace(/(\w)/, function (i) {
        return i.toUpperCase();
      }),
      a = Sy.reduce(function (i, o) {
        return ic(ic({}, i), {}, Rl({}, o + n, r));
      }, {});
    return ((a[e] = r), a);
  };
function _t(t) {
  '@babel/helpers - typeof';
  return (
    (_t =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    _t(t)
  );
}
function mn() {
  return (
    (mn = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    mn.apply(this, arguments)
  );
}
function oc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ra(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? oc(Object(r), !0).forEach(function (n) {
          ve(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : oc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Ey(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function cc(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Wl(n.key), n));
  }
}
function $y(t, e, r) {
  return (
    e && cc(t.prototype, e),
    r && cc(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function _y(t, e, r) {
  return (
    (e = gn(e)),
    Ty(
      t,
      zl() ? Reflect.construct(e, r || [], gn(t).constructor) : e.apply(t, r)
    )
  );
}
function Ty(t, e) {
  if (e && (_t(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Iy(t);
}
function Iy(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function zl() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (zl = function () {
    return !!t;
  })();
}
function gn(t) {
  return (
    (gn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    gn(t)
  );
}
function ky(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && Wa(t, e));
}
function Wa(t, e) {
  return (
    (Wa = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    Wa(t, e)
  );
}
function ve(t, e, r) {
  return (
    (e = Wl(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Wl(t) {
  var e = Cy(t, 'string');
  return _t(e) == 'symbol' ? e : e + '';
}
function Cy(t, e) {
  if (_t(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (_t(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Dy = function (e) {
    var r = e.data,
      n = e.startIndex,
      a = e.endIndex,
      i = e.x,
      o = e.width,
      c = e.travellerWidth;
    if (!r || !r.length) return {};
    var l = r.length,
      u = Ur()
        .domain(qr(0, l))
        .range([i, i + o - c]),
      s = u.domain().map(function (f) {
        return u(f);
      });
    return {
      isTextActive: !1,
      isSlideMoving: !1,
      isTravellerMoving: !1,
      isTravellerFocused: !1,
      startX: u(n),
      endX: u(a),
      scale: u,
      scaleValues: s,
    };
  },
  lc = function (e) {
    return e.changedTouches && !!e.changedTouches.length;
  },
  Tt = (function (t) {
    function e(r) {
      var n;
      return (
        Ey(this, e),
        (n = _y(this, e, [r])),
        ve(n, 'handleDrag', function (a) {
          (n.leaveTimer && (clearTimeout(n.leaveTimer), (n.leaveTimer = null)),
            n.state.isTravellerMoving
              ? n.handleTravellerMove(a)
              : n.state.isSlideMoving && n.handleSlideDrag(a));
        }),
        ve(n, 'handleTouchMove', function (a) {
          a.changedTouches != null &&
            a.changedTouches.length > 0 &&
            n.handleDrag(a.changedTouches[0]);
        }),
        ve(n, 'handleDragEnd', function () {
          (n.setState(
            { isTravellerMoving: !1, isSlideMoving: !1 },
            function () {
              var a = n.props,
                i = a.endIndex,
                o = a.onDragEnd,
                c = a.startIndex;
              o?.({ endIndex: i, startIndex: c });
            }
          ),
            n.detachDragEndListener());
        }),
        ve(n, 'handleLeaveWrapper', function () {
          (n.state.isTravellerMoving || n.state.isSlideMoving) &&
            (n.leaveTimer = window.setTimeout(
              n.handleDragEnd,
              n.props.leaveTimeOut
            ));
        }),
        ve(n, 'handleEnterSlideOrTraveller', function () {
          n.setState({ isTextActive: !0 });
        }),
        ve(n, 'handleLeaveSlideOrTraveller', function () {
          n.setState({ isTextActive: !1 });
        }),
        ve(n, 'handleSlideDragStart', function (a) {
          var i = lc(a) ? a.changedTouches[0] : a;
          (n.setState({
            isTravellerMoving: !1,
            isSlideMoving: !0,
            slideMoveStartX: i.pageX,
          }),
            n.attachDragEndListener());
        }),
        (n.travellerDragStartHandlers = {
          startX: n.handleTravellerDragStart.bind(n, 'startX'),
          endX: n.handleTravellerDragStart.bind(n, 'endX'),
        }),
        (n.state = {}),
        n
      );
    }
    return (
      ky(e, t),
      $y(
        e,
        [
          {
            key: 'componentWillUnmount',
            value: function () {
              (this.leaveTimer &&
                (clearTimeout(this.leaveTimer), (this.leaveTimer = null)),
                this.detachDragEndListener());
            },
          },
          {
            key: 'getIndex',
            value: function (n) {
              var a = n.startX,
                i = n.endX,
                o = this.state.scaleValues,
                c = this.props,
                l = c.gap,
                u = c.data,
                s = u.length - 1,
                f = Math.min(a, i),
                p = Math.max(a, i),
                v = e.getIndexInRange(o, f),
                h = e.getIndexInRange(o, p);
              return {
                startIndex: v - (v % l),
                endIndex: h === s ? s : h - (h % l),
              };
            },
          },
          {
            key: 'getTextOfTick',
            value: function (n) {
              var a = this.props,
                i = a.data,
                o = a.tickFormatter,
                c = a.dataKey,
                l = te(i[n], c, n);
              return V(o) ? o(l, n) : l;
            },
          },
          {
            key: 'attachDragEndListener',
            value: function () {
              (window.addEventListener('mouseup', this.handleDragEnd, !0),
                window.addEventListener('touchend', this.handleDragEnd, !0),
                window.addEventListener('mousemove', this.handleDrag, !0));
            },
          },
          {
            key: 'detachDragEndListener',
            value: function () {
              (window.removeEventListener('mouseup', this.handleDragEnd, !0),
                window.removeEventListener('touchend', this.handleDragEnd, !0),
                window.removeEventListener('mousemove', this.handleDrag, !0));
            },
          },
          {
            key: 'handleSlideDrag',
            value: function (n) {
              var a = this.state,
                i = a.slideMoveStartX,
                o = a.startX,
                c = a.endX,
                l = this.props,
                u = l.x,
                s = l.width,
                f = l.travellerWidth,
                p = l.startIndex,
                v = l.endIndex,
                h = l.onChange,
                m = n.pageX - i;
              m > 0
                ? (m = Math.min(m, u + s - f - c, u + s - f - o))
                : m < 0 && (m = Math.max(m, u - o, u - c));
              var y = this.getIndex({ startX: o + m, endX: c + m });
              ((y.startIndex !== p || y.endIndex !== v) && h && h(y),
                this.setState({
                  startX: o + m,
                  endX: c + m,
                  slideMoveStartX: n.pageX,
                }));
            },
          },
          {
            key: 'handleTravellerDragStart',
            value: function (n, a) {
              var i = lc(a) ? a.changedTouches[0] : a;
              (this.setState({
                isSlideMoving: !1,
                isTravellerMoving: !0,
                movingTravellerId: n,
                brushMoveStartX: i.pageX,
              }),
                this.attachDragEndListener());
            },
          },
          {
            key: 'handleTravellerMove',
            value: function (n) {
              var a = this.state,
                i = a.brushMoveStartX,
                o = a.movingTravellerId,
                c = a.endX,
                l = a.startX,
                u = this.state[o],
                s = this.props,
                f = s.x,
                p = s.width,
                v = s.travellerWidth,
                h = s.onChange,
                m = s.gap,
                y = s.data,
                O = { startX: this.state.startX, endX: this.state.endX },
                b = n.pageX - i;
              (b > 0
                ? (b = Math.min(b, f + p - v - u))
                : b < 0 && (b = Math.max(b, f - u)),
                (O[o] = u + b));
              var x = this.getIndex(O),
                P = x.startIndex,
                d = x.endIndex,
                g = function () {
                  var S = y.length - 1;
                  return (
                    (o === 'startX' && (c > l ? P % m === 0 : d % m === 0)) ||
                    (c < l && d === S) ||
                    (o === 'endX' && (c > l ? d % m === 0 : P % m === 0)) ||
                    (c > l && d === S)
                  );
                };
              this.setState(
                ve(ve({}, o, u + b), 'brushMoveStartX', n.pageX),
                function () {
                  h && g() && h(x);
                }
              );
            },
          },
          {
            key: 'handleTravellerMoveKeyboard',
            value: function (n, a) {
              var i = this,
                o = this.state,
                c = o.scaleValues,
                l = o.startX,
                u = o.endX,
                s = this.state[a],
                f = c.indexOf(s);
              if (f !== -1) {
                var p = f + n;
                if (!(p === -1 || p >= c.length)) {
                  var v = c[p];
                  (a === 'startX' && v >= u) ||
                    (a === 'endX' && v <= l) ||
                    this.setState(ve({}, a, v), function () {
                      i.props.onChange(
                        i.getIndex({
                          startX: i.state.startX,
                          endX: i.state.endX,
                        })
                      );
                    });
                }
              }
            },
          },
          {
            key: 'renderBackground',
            value: function () {
              var n = this.props,
                a = n.x,
                i = n.y,
                o = n.width,
                c = n.height,
                l = n.fill,
                u = n.stroke;
              return w.createElement('rect', {
                stroke: u,
                fill: l,
                x: a,
                y: i,
                width: o,
                height: c,
              });
            },
          },
          {
            key: 'renderPanorama',
            value: function () {
              var n = this.props,
                a = n.x,
                i = n.y,
                o = n.width,
                c = n.height,
                l = n.data,
                u = n.children,
                s = n.padding,
                f = N.Children.only(u);
              return f
                ? w.cloneElement(f, {
                    x: a,
                    y: i,
                    width: o,
                    height: c,
                    margin: s,
                    compact: !0,
                    data: l,
                  })
                : null;
            },
          },
          {
            key: 'renderTravellerLayer',
            value: function (n, a) {
              var i,
                o,
                c = this,
                l = this.props,
                u = l.y,
                s = l.travellerWidth,
                f = l.height,
                p = l.traveller,
                v = l.ariaLabel,
                h = l.data,
                m = l.startIndex,
                y = l.endIndex,
                O = Math.max(n, this.props.x),
                b = ra(
                  ra({}, W(this.props, !1)),
                  {},
                  { x: O, y: u, width: s, height: f }
                ),
                x =
                  v ||
                  'Min value: '
                    .concat(
                      (i = h[m]) === null || i === void 0 ? void 0 : i.name,
                      ', Max value: '
                    )
                    .concat(
                      (o = h[y]) === null || o === void 0 ? void 0 : o.name
                    );
              return w.createElement(
                Y,
                {
                  tabIndex: 0,
                  role: 'slider',
                  'aria-label': x,
                  'aria-valuenow': n,
                  className: 'recharts-brush-traveller',
                  onMouseEnter: this.handleEnterSlideOrTraveller,
                  onMouseLeave: this.handleLeaveSlideOrTraveller,
                  onMouseDown: this.travellerDragStartHandlers[a],
                  onTouchStart: this.travellerDragStartHandlers[a],
                  onKeyDown: function (d) {
                    ['ArrowLeft', 'ArrowRight'].includes(d.key) &&
                      (d.preventDefault(),
                      d.stopPropagation(),
                      c.handleTravellerMoveKeyboard(
                        d.key === 'ArrowRight' ? 1 : -1,
                        a
                      ));
                  },
                  onFocus: function () {
                    c.setState({ isTravellerFocused: !0 });
                  },
                  onBlur: function () {
                    c.setState({ isTravellerFocused: !1 });
                  },
                  style: { cursor: 'col-resize' },
                },
                e.renderTraveller(p, b)
              );
            },
          },
          {
            key: 'renderSlide',
            value: function (n, a) {
              var i = this.props,
                o = i.y,
                c = i.height,
                l = i.stroke,
                u = i.travellerWidth,
                s = Math.min(n, a) + u,
                f = Math.max(Math.abs(a - n) - u, 0);
              return w.createElement('rect', {
                className: 'recharts-brush-slide',
                onMouseEnter: this.handleEnterSlideOrTraveller,
                onMouseLeave: this.handleLeaveSlideOrTraveller,
                onMouseDown: this.handleSlideDragStart,
                onTouchStart: this.handleSlideDragStart,
                style: { cursor: 'move' },
                stroke: 'none',
                fill: l,
                fillOpacity: 0.2,
                x: s,
                y: o,
                width: f,
                height: c,
              });
            },
          },
          {
            key: 'renderText',
            value: function () {
              var n = this.props,
                a = n.startIndex,
                i = n.endIndex,
                o = n.y,
                c = n.height,
                l = n.travellerWidth,
                u = n.stroke,
                s = this.state,
                f = s.startX,
                p = s.endX,
                v = 5,
                h = { pointerEvents: 'none', fill: u };
              return w.createElement(
                Y,
                { className: 'recharts-brush-texts' },
                w.createElement(
                  rt,
                  mn(
                    {
                      textAnchor: 'end',
                      verticalAnchor: 'middle',
                      x: Math.min(f, p) - v,
                      y: o + c / 2,
                    },
                    h
                  ),
                  this.getTextOfTick(a)
                ),
                w.createElement(
                  rt,
                  mn(
                    {
                      textAnchor: 'start',
                      verticalAnchor: 'middle',
                      x: Math.max(f, p) + l + v,
                      y: o + c / 2,
                    },
                    h
                  ),
                  this.getTextOfTick(i)
                )
              );
            },
          },
          {
            key: 'render',
            value: function () {
              var n = this.props,
                a = n.data,
                i = n.className,
                o = n.children,
                c = n.x,
                l = n.y,
                u = n.width,
                s = n.height,
                f = n.alwaysShowText,
                p = this.state,
                v = p.startX,
                h = p.endX,
                m = p.isTextActive,
                y = p.isSlideMoving,
                O = p.isTravellerMoving,
                b = p.isTravellerFocused;
              if (
                !a ||
                !a.length ||
                !M(c) ||
                !M(l) ||
                !M(u) ||
                !M(s) ||
                u <= 0 ||
                s <= 0
              )
                return null;
              var x = U('recharts-brush', i),
                P = w.Children.count(o) === 1,
                d = jy('userSelect', 'none');
              return w.createElement(
                Y,
                {
                  className: x,
                  onMouseLeave: this.handleLeaveWrapper,
                  onTouchMove: this.handleTouchMove,
                  style: d,
                },
                this.renderBackground(),
                P && this.renderPanorama(),
                this.renderSlide(v, h),
                this.renderTravellerLayer(v, 'startX'),
                this.renderTravellerLayer(h, 'endX'),
                (m || y || O || b || f) && this.renderText()
              );
            },
          },
        ],
        [
          {
            key: 'renderDefaultTraveller',
            value: function (n) {
              var a = n.x,
                i = n.y,
                o = n.width,
                c = n.height,
                l = n.stroke,
                u = Math.floor(i + c / 2) - 1;
              return w.createElement(
                w.Fragment,
                null,
                w.createElement('rect', {
                  x: a,
                  y: i,
                  width: o,
                  height: c,
                  fill: l,
                  stroke: 'none',
                }),
                w.createElement('line', {
                  x1: a + 1,
                  y1: u,
                  x2: a + o - 1,
                  y2: u,
                  fill: 'none',
                  stroke: '#fff',
                }),
                w.createElement('line', {
                  x1: a + 1,
                  y1: u + 2,
                  x2: a + o - 1,
                  y2: u + 2,
                  fill: 'none',
                  stroke: '#fff',
                })
              );
            },
          },
          {
            key: 'renderTraveller',
            value: function (n, a) {
              var i;
              return (
                w.isValidElement(n)
                  ? (i = w.cloneElement(n, a))
                  : V(n)
                    ? (i = n(a))
                    : (i = e.renderDefaultTraveller(a)),
                i
              );
            },
          },
          {
            key: 'getDerivedStateFromProps',
            value: function (n, a) {
              var i = n.data,
                o = n.width,
                c = n.x,
                l = n.travellerWidth,
                u = n.updateId,
                s = n.startIndex,
                f = n.endIndex;
              if (i !== a.prevData || u !== a.prevUpdateId)
                return ra(
                  {
                    prevData: i,
                    prevTravellerWidth: l,
                    prevUpdateId: u,
                    prevX: c,
                    prevWidth: o,
                  },
                  i && i.length
                    ? Dy({
                        data: i,
                        width: o,
                        x: c,
                        travellerWidth: l,
                        startIndex: s,
                        endIndex: f,
                      })
                    : { scale: null, scaleValues: null }
                );
              if (
                a.scale &&
                (o !== a.prevWidth ||
                  c !== a.prevX ||
                  l !== a.prevTravellerWidth)
              ) {
                a.scale.range([c, c + o - l]);
                var p = a.scale.domain().map(function (v) {
                  return a.scale(v);
                });
                return {
                  prevData: i,
                  prevTravellerWidth: l,
                  prevUpdateId: u,
                  prevX: c,
                  prevWidth: o,
                  startX: a.scale(n.startIndex),
                  endX: a.scale(n.endIndex),
                  scaleValues: p,
                };
              }
              return null;
            },
          },
          {
            key: 'getIndexInRange',
            value: function (n, a) {
              for (var i = n.length, o = 0, c = i - 1; c - o > 1; ) {
                var l = Math.floor((o + c) / 2);
                n[l] > a ? (c = l) : (o = l);
              }
              return a >= n[c] ? c : o;
            },
          },
        ]
      )
    );
  })(N.PureComponent);
ve(Tt, 'displayName', 'Brush');
ve(Tt, 'defaultProps', {
  height: 40,
  travellerWidth: 5,
  gap: 1,
  fill: '#fff',
  stroke: '#666',
  padding: { top: 1, right: 1, bottom: 1, left: 1 },
  leaveTimeOut: 1e3,
  alwaysShowText: !1,
});
var Ee = function (e, r) {
    var n = e.alwaysShow,
      a = e.ifOverflow;
    return (n && (a = 'extendDomain'), a === r);
  },
  My = ['x', 'y'];
function $r(t) {
  '@babel/helpers - typeof';
  return (
    ($r =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    $r(t)
  );
}
function Fa() {
  return (
    (Fa = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Fa.apply(this, arguments)
  );
}
function uc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function er(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? uc(Object(r), !0).forEach(function (n) {
          By(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : uc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function By(t, e, r) {
  return (
    (e = Ny(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Ny(t) {
  var e = Ly(t, 'string');
  return $r(e) == 'symbol' ? e : e + '';
}
function Ly(t, e) {
  if ($r(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if ($r(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function Ry(t, e) {
  if (t == null) return {};
  var r = zy(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function zy(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function Wy(t, e) {
  var r = t.x,
    n = t.y,
    a = Ry(t, My),
    i = ''.concat(r),
    o = parseInt(i, 10),
    c = ''.concat(n),
    l = parseInt(c, 10),
    u = ''.concat(e.height || a.height),
    s = parseInt(u, 10),
    f = ''.concat(e.width || a.width),
    p = parseInt(f, 10);
  return er(
    er(er(er(er({}, e), a), o ? { x: o } : {}), l ? { y: l } : {}),
    {},
    { height: s, width: p, name: e.name, radius: e.radius }
  );
}
function sc(t) {
  return w.createElement(
    Bl,
    Fa(
      {
        shapeType: 'rectangle',
        propTransformer: Wy,
        activeClassName: 'recharts-active-bar',
      },
      t
    )
  );
}
var Fy = function (e) {
    var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    return function (n, a) {
      if (typeof e == 'number') return e;
      var i = typeof n == 'number';
      return i ? e(n, a) : (i || Je(), r);
    };
  },
  Ky = ['value', 'background'],
  Fl;
function It(t) {
  '@babel/helpers - typeof';
  return (
    (It =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    It(t)
  );
}
function Vy(t, e) {
  if (t == null) return {};
  var r = Xy(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function Xy(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function bn() {
  return (
    (bn = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    bn.apply(this, arguments)
  );
}
function fc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function re(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? fc(Object(r), !0).forEach(function (n) {
          Be(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : fc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Gy(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function pc(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Vl(n.key), n));
  }
}
function Hy(t, e, r) {
  return (
    e && pc(t.prototype, e),
    r && pc(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Uy(t, e, r) {
  return (
    (e = xn(e)),
    Yy(
      t,
      Kl() ? Reflect.construct(e, r || [], xn(t).constructor) : e.apply(t, r)
    )
  );
}
function Yy(t, e) {
  if (e && (It(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return qy(t);
}
function qy(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function Kl() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (Kl = function () {
    return !!t;
  })();
}
function xn(t) {
  return (
    (xn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    xn(t)
  );
}
function Zy(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && Ka(t, e));
}
function Ka(t, e) {
  return (
    (Ka = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    Ka(t, e)
  );
}
function Be(t, e, r) {
  return (
    (e = Vl(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Vl(t) {
  var e = Qy(t, 'string');
  return It(e) == 'symbol' ? e : e + '';
}
function Qy(t, e) {
  if (It(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (It(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Vt = (function (t) {
  function e() {
    var r;
    Gy(this, e);
    for (var n = arguments.length, a = new Array(n), i = 0; i < n; i++)
      a[i] = arguments[i];
    return (
      (r = Uy(this, e, [].concat(a))),
      Be(r, 'state', { isAnimationFinished: !1 }),
      Be(r, 'id', at('recharts-bar-')),
      Be(r, 'handleAnimationEnd', function () {
        var o = r.props.onAnimationEnd;
        (r.setState({ isAnimationFinished: !0 }), o && o());
      }),
      Be(r, 'handleAnimationStart', function () {
        var o = r.props.onAnimationStart;
        (r.setState({ isAnimationFinished: !1 }), o && o());
      }),
      r
    );
  }
  return (
    Zy(e, t),
    Hy(
      e,
      [
        {
          key: 'renderRectanglesStatically',
          value: function (n) {
            var a = this,
              i = this.props,
              o = i.shape,
              c = i.dataKey,
              l = i.activeIndex,
              u = i.activeBar,
              s = W(this.props, !1);
            return (
              n &&
              n.map(function (f, p) {
                var v = p === l,
                  h = v ? u : o,
                  m = re(
                    re(re({}, s), f),
                    {},
                    {
                      isActive: v,
                      option: h,
                      index: p,
                      dataKey: c,
                      onAnimationStart: a.handleAnimationStart,
                      onAnimationEnd: a.handleAnimationEnd,
                    }
                  );
                return w.createElement(
                  Y,
                  bn(
                    { className: 'recharts-bar-rectangle' },
                    tt(a.props, f, p),
                    {
                      key: 'rectangle-'
                        .concat(f?.x, '-')
                        .concat(f?.y, '-')
                        .concat(f?.value, '-')
                        .concat(p),
                    }
                  ),
                  w.createElement(sc, m)
                );
              })
            );
          },
        },
        {
          key: 'renderRectanglesWithAnimation',
          value: function () {
            var n = this,
              a = this.props,
              i = a.data,
              o = a.layout,
              c = a.isAnimationActive,
              l = a.animationBegin,
              u = a.animationDuration,
              s = a.animationEasing,
              f = a.animationId,
              p = this.state.prevData;
            return w.createElement(
              Ne,
              {
                begin: l,
                duration: u,
                isActive: c,
                easing: s,
                from: { t: 0 },
                to: { t: 1 },
                key: 'bar-'.concat(f),
                onAnimationEnd: this.handleAnimationEnd,
                onAnimationStart: this.handleAnimationStart,
              },
              function (v) {
                var h = v.t,
                  m = i.map(function (y, O) {
                    var b = p && p[O];
                    if (b) {
                      var x = ae(b.x, y.x),
                        P = ae(b.y, y.y),
                        d = ae(b.width, y.width),
                        g = ae(b.height, y.height);
                      return re(
                        re({}, y),
                        {},
                        { x: x(h), y: P(h), width: d(h), height: g(h) }
                      );
                    }
                    if (o === 'horizontal') {
                      var A = ae(0, y.height),
                        S = A(h);
                      return re(
                        re({}, y),
                        {},
                        { y: y.y + y.height - S, height: S }
                      );
                    }
                    var j = ae(0, y.width),
                      E = j(h);
                    return re(re({}, y), {}, { width: E });
                  });
                return w.createElement(
                  Y,
                  null,
                  n.renderRectanglesStatically(m)
                );
              }
            );
          },
        },
        {
          key: 'renderRectangles',
          value: function () {
            var n = this.props,
              a = n.data,
              i = n.isAnimationActive,
              o = this.state.prevData;
            return i && a && a.length && (!o || !et(o, a))
              ? this.renderRectanglesWithAnimation()
              : this.renderRectanglesStatically(a);
          },
        },
        {
          key: 'renderBackground',
          value: function () {
            var n = this,
              a = this.props,
              i = a.data,
              o = a.dataKey,
              c = a.activeIndex,
              l = W(this.props.background, !1);
            return i.map(function (u, s) {
              u.value;
              var f = u.background,
                p = Vy(u, Ky);
              if (!f) return null;
              var v = re(
                re(
                  re(re(re({}, p), {}, { fill: '#eee' }, f), l),
                  tt(n.props, u, s)
                ),
                {},
                {
                  onAnimationStart: n.handleAnimationStart,
                  onAnimationEnd: n.handleAnimationEnd,
                  dataKey: o,
                  index: s,
                  className: 'recharts-bar-background-rectangle',
                }
              );
              return w.createElement(
                sc,
                bn(
                  {
                    key: 'background-bar-'.concat(s),
                    option: n.props.background,
                    isActive: s === c,
                  },
                  v
                )
              );
            });
          },
        },
        {
          key: 'renderErrorBar',
          value: function (n, a) {
            if (this.props.isAnimationActive && !this.state.isAnimationFinished)
              return null;
            var i = this.props,
              o = i.data,
              c = i.xAxis,
              l = i.yAxis,
              u = i.layout,
              s = i.children,
              f = me(s, Cr);
            if (!f) return null;
            var p = u === 'vertical' ? o[0].height / 2 : o[0].width / 2,
              v = function (y, O) {
                var b = Array.isArray(y.value) ? y.value[1] : y.value;
                return { x: y.x, y: y.y, value: b, errorVal: te(y, O) };
              },
              h = { clipPath: n ? 'url(#clipPath-'.concat(a, ')') : null };
            return w.createElement(
              Y,
              h,
              f.map(function (m) {
                return w.cloneElement(m, {
                  key: 'error-bar-'.concat(a, '-').concat(m.props.dataKey),
                  data: o,
                  xAxis: c,
                  yAxis: l,
                  layout: u,
                  offset: p,
                  dataPointFormatter: v,
                });
              })
            );
          },
        },
        {
          key: 'render',
          value: function () {
            var n = this.props,
              a = n.hide,
              i = n.data,
              o = n.className,
              c = n.xAxis,
              l = n.yAxis,
              u = n.left,
              s = n.top,
              f = n.width,
              p = n.height,
              v = n.isAnimationActive,
              h = n.background,
              m = n.id;
            if (a || !i || !i.length) return null;
            var y = this.state.isAnimationFinished,
              O = U('recharts-bar', o),
              b = c && c.allowDataOverflow,
              x = l && l.allowDataOverflow,
              P = b || x,
              d = H(m) ? this.id : m;
            return w.createElement(
              Y,
              { className: O },
              b || x
                ? w.createElement(
                    'defs',
                    null,
                    w.createElement(
                      'clipPath',
                      { id: 'clipPath-'.concat(d) },
                      w.createElement('rect', {
                        x: b ? u : u - f / 2,
                        y: x ? s : s - p / 2,
                        width: b ? f : f * 2,
                        height: x ? p : p * 2,
                      })
                    )
                  )
                : null,
              w.createElement(
                Y,
                {
                  className: 'recharts-bar-rectangles',
                  clipPath: P ? 'url(#clipPath-'.concat(d, ')') : null,
                },
                h ? this.renderBackground() : null,
                this.renderRectangles()
              ),
              this.renderErrorBar(P, d),
              (!v || y) && je.renderCallByParent(this.props, i)
            );
          },
        },
      ],
      [
        {
          key: 'getDerivedStateFromProps',
          value: function (n, a) {
            return n.animationId !== a.prevAnimationId
              ? {
                  prevAnimationId: n.animationId,
                  curData: n.data,
                  prevData: a.curData,
                }
              : n.data !== a.curData
                ? { curData: n.data }
                : null;
          },
        },
      ]
    )
  );
})(N.PureComponent);
Fl = Vt;
Be(Vt, 'displayName', 'Bar');
Be(Vt, 'defaultProps', {
  xAxisId: 0,
  yAxisId: 0,
  legendType: 'rect',
  minPointSize: 0,
  hide: !1,
  data: [],
  layout: 'vertical',
  activeBar: !1,
  isAnimationActive: !Le.isSsr,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'ease',
});
Be(Vt, 'getComposedData', function (t) {
  var e = t.props,
    r = t.item,
    n = t.barPosition,
    a = t.bandSize,
    i = t.xAxis,
    o = t.yAxis,
    c = t.xAxisTicks,
    l = t.yAxisTicks,
    u = t.stackedData,
    s = t.dataStartIndex,
    f = t.displayedData,
    p = t.offset,
    v = Nd(n, r);
  if (!v) return null;
  var h = e.layout,
    m = r.type.defaultProps,
    y = m !== void 0 ? re(re({}, m), r.props) : r.props,
    O = y.dataKey,
    b = y.children,
    x = y.minPointSize,
    P = h === 'horizontal' ? o : i,
    d = u ? P.scale.domain() : null,
    g = Vd({ numericAxis: P }),
    A = me(b, hi),
    S = f.map(function (j, E) {
      var $, _, k, C, I, D;
      u
        ? ($ = Ld(u[s + E], d))
        : (($ = te(j, O)), Array.isArray($) || ($ = [g, $]));
      var B = Fy(x, Fl.defaultProps.minPointSize)($[1], E);
      if (h === 'horizontal') {
        var L,
          z = [o.scale($[0]), o.scale($[1])],
          F = z[0],
          X = z[1];
        ((_ = wo({
          axis: i,
          ticks: c,
          bandSize: a,
          offset: v.offset,
          entry: j,
          index: E,
        })),
          (k = (L = X ?? F) !== null && L !== void 0 ? L : void 0),
          (C = v.size));
        var R = F - X;
        if (
          ((I = Number.isNaN(R) ? 0 : R),
          (D = { x: _, y: o.y, width: C, height: o.height }),
          Math.abs(B) > 0 && Math.abs(I) < Math.abs(B))
        ) {
          var G = fe(I || B) * (Math.abs(B) - Math.abs(I));
          ((k -= G), (I += G));
        }
      } else {
        var J = [i.scale($[0]), i.scale($[1])],
          oe = J[0],
          xe = J[1];
        if (
          ((_ = oe),
          (k = wo({
            axis: o,
            ticks: l,
            bandSize: a,
            offset: v.offset,
            entry: j,
            index: E,
          })),
          (C = xe - oe),
          (I = v.size),
          (D = { x: i.x, y: k, width: i.width, height: I }),
          Math.abs(B) > 0 && Math.abs(C) < Math.abs(B))
        ) {
          var Gt = fe(C || B) * (Math.abs(B) - Math.abs(C));
          C += Gt;
        }
      }
      return re(
        re(
          re({}, j),
          {},
          {
            x: _,
            y: k,
            width: C,
            height: I,
            value: u ? $ : $[1],
            payload: j,
            background: D,
          },
          A && A[E] && A[E].props
        ),
        {},
        {
          tooltipPayload: [Sl(r, j)],
          tooltipPosition: { x: _ + C / 2, y: k + I / 2 },
        }
      );
    });
  return re({ data: S, layout: h }, p);
});
function _r(t) {
  '@babel/helpers - typeof';
  return (
    (_r =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    _r(t)
  );
}
function Jy(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function dc(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Xl(n.key), n));
  }
}
function em(t, e, r) {
  return (
    e && dc(t.prototype, e),
    r && dc(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function vc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function we(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? vc(Object(r), !0).forEach(function (n) {
          Fn(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : vc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Fn(t, e, r) {
  return (
    (e = Xl(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Xl(t) {
  var e = tm(t, 'string');
  return _r(e) == 'symbol' ? e : e + '';
}
function tm(t, e) {
  if (_r(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (_r(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var gi = function (e, r, n, a, i) {
    var o = e.width,
      c = e.height,
      l = e.layout,
      u = e.children,
      s = Object.keys(r),
      f = {
        left: n.left,
        leftMirror: n.left,
        right: o - n.right,
        rightMirror: o - n.right,
        top: n.top,
        topMirror: n.top,
        bottom: c - n.bottom,
        bottomMirror: c - n.bottom,
      },
      p = !!he(u, Vt);
    return s.reduce(function (v, h) {
      var m = r[h],
        y = m.orientation,
        O = m.domain,
        b = m.padding,
        x = b === void 0 ? {} : b,
        P = m.mirror,
        d = m.reversed,
        g = ''.concat(y).concat(P ? 'Mirror' : ''),
        A,
        S,
        j,
        E,
        $;
      if (
        m.type === 'number' &&
        (m.padding === 'gap' || m.padding === 'no-gap')
      ) {
        var _ = O[1] - O[0],
          k = 1 / 0,
          C = m.categoricalDomain.sort(gs);
        if (
          (C.forEach(function (J, oe) {
            oe > 0 && (k = Math.min((J || 0) - (C[oe - 1] || 0), k));
          }),
          Number.isFinite(k))
        ) {
          var I = k / _,
            D = m.layout === 'vertical' ? n.height : n.width;
          if (
            (m.padding === 'gap' && (A = (I * D) / 2), m.padding === 'no-gap')
          ) {
            var B = pe(e.barCategoryGap, I * D),
              L = (I * D) / 2;
            A = L - B - ((L - B) / D) * B;
          }
        }
      }
      (a === 'xAxis'
        ? (S = [
            n.left + (x.left || 0) + (A || 0),
            n.left + n.width - (x.right || 0) - (A || 0),
          ])
        : a === 'yAxis'
          ? (S =
              l === 'horizontal'
                ? [n.top + n.height - (x.bottom || 0), n.top + (x.top || 0)]
                : [
                    n.top + (x.top || 0) + (A || 0),
                    n.top + n.height - (x.bottom || 0) - (A || 0),
                  ])
          : (S = m.range),
        d && (S = [S[1], S[0]]));
      var z = Ol(m, i, p),
        F = z.scale,
        X = z.realScaleType;
      (F.domain(O).range(S), wl(F));
      var R = Pl(F, we(we({}, m), {}, { realScaleType: X }));
      a === 'xAxis'
        ? (($ = (y === 'top' && !P) || (y === 'bottom' && P)),
          (j = n.left),
          (E = f[g] - $ * m.height))
        : a === 'yAxis' &&
          (($ = (y === 'left' && !P) || (y === 'right' && P)),
          (j = f[g] - $ * m.width),
          (E = n.top));
      var G = we(
        we(we({}, m), R),
        {},
        {
          realScaleType: X,
          x: j,
          y: E,
          scale: F,
          width: a === 'xAxis' ? n.width : m.width,
          height: a === 'yAxis' ? n.height : m.height,
        }
      );
      return (
        (G.bandSize = ln(G, R)),
        !m.hide && a === 'xAxis'
          ? (f[g] += ($ ? -1 : 1) * G.height)
          : m.hide || (f[g] += ($ ? -1 : 1) * G.width),
        we(we({}, v), {}, Fn({}, h, G))
      );
    }, {});
  },
  Gl = function (e, r) {
    var n = e.x,
      a = e.y,
      i = r.x,
      o = r.y;
    return {
      x: Math.min(n, i),
      y: Math.min(a, o),
      width: Math.abs(i - n),
      height: Math.abs(o - a),
    };
  },
  rm = function (e) {
    var r = e.x1,
      n = e.y1,
      a = e.x2,
      i = e.y2;
    return Gl({ x: r, y: n }, { x: a, y: i });
  },
  Hl = (function () {
    function t(e) {
      (Jy(this, t), (this.scale = e));
    }
    return em(
      t,
      [
        {
          key: 'domain',
          get: function () {
            return this.scale.domain;
          },
        },
        {
          key: 'range',
          get: function () {
            return this.scale.range;
          },
        },
        {
          key: 'rangeMin',
          get: function () {
            return this.range()[0];
          },
        },
        {
          key: 'rangeMax',
          get: function () {
            return this.range()[1];
          },
        },
        {
          key: 'bandwidth',
          get: function () {
            return this.scale.bandwidth;
          },
        },
        {
          key: 'apply',
          value: function (r) {
            var n =
                arguments.length > 1 && arguments[1] !== void 0
                  ? arguments[1]
                  : {},
              a = n.bandAware,
              i = n.position;
            if (r !== void 0) {
              if (i)
                switch (i) {
                  case 'start':
                    return this.scale(r);
                  case 'middle': {
                    var o = this.bandwidth ? this.bandwidth() / 2 : 0;
                    return this.scale(r) + o;
                  }
                  case 'end': {
                    var c = this.bandwidth ? this.bandwidth() : 0;
                    return this.scale(r) + c;
                  }
                  default:
                    return this.scale(r);
                }
              if (a) {
                var l = this.bandwidth ? this.bandwidth() / 2 : 0;
                return this.scale(r) + l;
              }
              return this.scale(r);
            }
          },
        },
        {
          key: 'isInRange',
          value: function (r) {
            var n = this.range(),
              a = n[0],
              i = n[n.length - 1];
            return a <= i ? r >= a && r <= i : r >= i && r <= a;
          },
        },
      ],
      [
        {
          key: 'create',
          value: function (r) {
            return new t(r);
          },
        },
      ]
    );
  })();
Fn(Hl, 'EPS', 1e-4);
var bi = function (e) {
  var r = Object.keys(e).reduce(function (n, a) {
    return we(we({}, n), {}, Fn({}, a, Hl.create(e[a])));
  }, {});
  return we(
    we({}, r),
    {},
    {
      apply: function (a) {
        var i =
            arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
          o = i.bandAware,
          c = i.position;
        return Ru(a, function (l, u) {
          return r[u].apply(l, { bandAware: o, position: c });
        });
      },
      isInRange: function (a) {
        return Fc(a, function (i, o) {
          return r[o].isInRange(i);
        });
      },
    }
  );
};
function nm(t) {
  return ((t % 180) + 180) % 180;
}
var am = function (e) {
    var r = e.width,
      n = e.height,
      a = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0,
      i = nm(a),
      o = (i * Math.PI) / 180,
      c = Math.atan(n / r),
      l = o > c && o < Math.PI - c ? n / Math.sin(o) : r / Math.cos(o);
    return Math.abs(l);
  },
  im = zu(
    function (t) {
      return { x: t.left, y: t.top, width: t.width, height: t.height };
    },
    function (t) {
      return ['l', t.left, 't', t.top, 'w', t.width, 'h', t.height].join('');
    }
  ),
  xi = N.createContext(void 0),
  Oi = N.createContext(void 0),
  Ul = N.createContext(void 0),
  Yl = N.createContext({}),
  ql = N.createContext(void 0),
  Zl = N.createContext(0),
  Ql = N.createContext(0),
  hc = function (e) {
    var r = e.state,
      n = r.xAxisMap,
      a = r.yAxisMap,
      i = r.offset,
      o = e.clipPathId,
      c = e.children,
      l = e.width,
      u = e.height,
      s = im(i);
    return w.createElement(
      xi.Provider,
      { value: n },
      w.createElement(
        Oi.Provider,
        { value: a },
        w.createElement(
          Yl.Provider,
          { value: i },
          w.createElement(
            Ul.Provider,
            { value: s },
            w.createElement(
              ql.Provider,
              { value: o },
              w.createElement(
                Zl.Provider,
                { value: u },
                w.createElement(Ql.Provider, { value: l }, c)
              )
            )
          )
        )
      )
    );
  },
  om = function () {
    return N.useContext(ql);
  },
  Jl = function (e) {
    var r = N.useContext(xi);
    r == null && Je();
    var n = r[e];
    return (n == null && Je(), n);
  },
  cm = function () {
    var e = N.useContext(xi);
    return De(e);
  },
  lm = function () {
    var e = N.useContext(Oi),
      r = Wu(e, function (n) {
        return Fc(n.domain, Number.isFinite);
      });
    return r || De(e);
  },
  eu = function (e) {
    var r = N.useContext(Oi);
    r == null && Je();
    var n = r[e];
    return (n == null && Je(), n);
  },
  um = function () {
    var e = N.useContext(Ul);
    return e;
  },
  sm = function () {
    return N.useContext(Yl);
  },
  wi = function () {
    return N.useContext(Ql);
  },
  Pi = function () {
    return N.useContext(Zl);
  };
function kt(t) {
  '@babel/helpers - typeof';
  return (
    (kt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    kt(t)
  );
}
function fm(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function pm(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, ru(n.key), n));
  }
}
function dm(t, e, r) {
  return (
    e && pm(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function vm(t, e, r) {
  return (
    (e = On(e)),
    hm(
      t,
      tu() ? Reflect.construct(e, r || [], On(t).constructor) : e.apply(t, r)
    )
  );
}
function hm(t, e) {
  if (e && (kt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return ym(t);
}
function ym(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function tu() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (tu = function () {
    return !!t;
  })();
}
function On(t) {
  return (
    (On = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    On(t)
  );
}
function mm(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && Va(t, e));
}
function Va(t, e) {
  return (
    (Va = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    Va(t, e)
  );
}
function yc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function mc(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? yc(Object(r), !0).forEach(function (n) {
          Ai(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : yc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Ai(t, e, r) {
  return (
    (e = ru(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function ru(t) {
  var e = gm(t, 'string');
  return kt(e) == 'symbol' ? e : e + '';
}
function gm(t, e) {
  if (kt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (kt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
function bm(t, e) {
  return Pm(t) || wm(t, e) || Om(t, e) || xm();
}
function xm() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Om(t, e) {
  if (t) {
    if (typeof t == 'string') return gc(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return gc(t, e);
  }
}
function gc(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function wm(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function Pm(t) {
  if (Array.isArray(t)) return t;
}
function Xa() {
  return (
    (Xa = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Xa.apply(this, arguments)
  );
}
var Am = function (e, r) {
    var n;
    return (
      w.isValidElement(e)
        ? (n = w.cloneElement(e, r))
        : V(e)
          ? (n = e(r))
          : (n = w.createElement(
              'line',
              Xa({}, r, { className: 'recharts-reference-line-line' })
            )),
      n
    );
  },
  Sm = function (e, r, n, a, i, o, c, l, u) {
    var s = i.x,
      f = i.y,
      p = i.width,
      v = i.height;
    if (n) {
      var h = u.y,
        m = e.y.apply(h, { position: o });
      if (Ee(u, 'discard') && !e.y.isInRange(m)) return null;
      var y = [
        { x: s + p, y: m },
        { x: s, y: m },
      ];
      return l === 'left' ? y.reverse() : y;
    }
    if (r) {
      var O = u.x,
        b = e.x.apply(O, { position: o });
      if (Ee(u, 'discard') && !e.x.isInRange(b)) return null;
      var x = [
        { x: b, y: f + v },
        { x: b, y: f },
      ];
      return c === 'top' ? x.reverse() : x;
    }
    if (a) {
      var P = u.segment,
        d = P.map(function (g) {
          return e.apply(g, { position: o });
        });
      return Ee(u, 'discard') &&
        Fu(d, function (g) {
          return !e.isInRange(g);
        })
        ? null
        : d;
    }
    return null;
  };
function jm(t) {
  var e = t.x,
    r = t.y,
    n = t.segment,
    a = t.xAxisId,
    i = t.yAxisId,
    o = t.shape,
    c = t.className,
    l = t.alwaysShow,
    u = om(),
    s = Jl(a),
    f = eu(i),
    p = um();
  if (!u || !p) return null;
  Ae(
    l === void 0,
    'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.'
  );
  var v = bi({ x: s.scale, y: f.scale }),
    h = ie(e),
    m = ie(r),
    y = n && n.length === 2,
    O = Sm(v, h, m, y, p, t.position, s.orientation, f.orientation, t);
  if (!O) return null;
  var b = bm(O, 2),
    x = b[0],
    P = x.x,
    d = x.y,
    g = b[1],
    A = g.x,
    S = g.y,
    j = Ee(t, 'hidden') ? 'url(#'.concat(u, ')') : void 0,
    E = mc(mc({ clipPath: j }, W(t, !0)), {}, { x1: P, y1: d, x2: A, y2: S });
  return w.createElement(
    Y,
    { className: U('recharts-reference-line', c) },
    Am(o, E),
    ce.renderCallByParent(t, rm({ x1: P, y1: d, x2: A, y2: S }))
  );
}
var Si = (function (t) {
  function e() {
    return (fm(this, e), vm(this, e, arguments));
  }
  return (
    mm(e, t),
    dm(e, [
      {
        key: 'render',
        value: function () {
          return w.createElement(jm, this.props);
        },
      },
    ])
  );
})(w.Component);
Ai(Si, 'displayName', 'ReferenceLine');
Ai(Si, 'defaultProps', {
  isFront: !1,
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  fill: 'none',
  stroke: '#ccc',
  fillOpacity: 1,
  strokeWidth: 1,
  position: 'middle',
});
function Ga() {
  return (
    (Ga = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Ga.apply(this, arguments)
  );
}
function Ct(t) {
  '@babel/helpers - typeof';
  return (
    (Ct =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Ct(t)
  );
}
function bc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function xc(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? bc(Object(r), !0).forEach(function (n) {
          Kn(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : bc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Em(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function $m(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, au(n.key), n));
  }
}
function _m(t, e, r) {
  return (
    e && $m(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Tm(t, e, r) {
  return (
    (e = wn(e)),
    Im(
      t,
      nu() ? Reflect.construct(e, r || [], wn(t).constructor) : e.apply(t, r)
    )
  );
}
function Im(t, e) {
  if (e && (Ct(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return km(t);
}
function km(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function nu() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (nu = function () {
    return !!t;
  })();
}
function wn(t) {
  return (
    (wn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    wn(t)
  );
}
function Cm(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && Ha(t, e));
}
function Ha(t, e) {
  return (
    (Ha = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    Ha(t, e)
  );
}
function Kn(t, e, r) {
  return (
    (e = au(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function au(t) {
  var e = Dm(t, 'string');
  return Ct(e) == 'symbol' ? e : e + '';
}
function Dm(t, e) {
  if (Ct(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Ct(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Mm = function (e) {
    var r = e.x,
      n = e.y,
      a = e.xAxis,
      i = e.yAxis,
      o = bi({ x: a.scale, y: i.scale }),
      c = o.apply({ x: r, y: n }, { bandAware: !0 });
    return Ee(e, 'discard') && !o.isInRange(c) ? null : c;
  },
  Vn = (function (t) {
    function e() {
      return (Em(this, e), Tm(this, e, arguments));
    }
    return (
      Cm(e, t),
      _m(e, [
        {
          key: 'render',
          value: function () {
            var n = this.props,
              a = n.x,
              i = n.y,
              o = n.r,
              c = n.alwaysShow,
              l = n.clipPathId,
              u = ie(a),
              s = ie(i);
            if (
              (Ae(
                c === void 0,
                'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.'
              ),
              !u || !s)
            )
              return null;
            var f = Mm(this.props);
            if (!f) return null;
            var p = f.x,
              v = f.y,
              h = this.props,
              m = h.shape,
              y = h.className,
              O = Ee(this.props, 'hidden') ? 'url(#'.concat(l, ')') : void 0,
              b = xc(
                xc({ clipPath: O }, W(this.props, !0)),
                {},
                { cx: p, cy: v }
              );
            return w.createElement(
              Y,
              { className: U('recharts-reference-dot', y) },
              e.renderDot(m, b),
              ce.renderCallByParent(this.props, {
                x: p - o,
                y: v - o,
                width: 2 * o,
                height: 2 * o,
              })
            );
          },
        },
      ])
    );
  })(w.Component);
Kn(Vn, 'displayName', 'ReferenceDot');
Kn(Vn, 'defaultProps', {
  isFront: !1,
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  r: 10,
  fill: '#fff',
  stroke: '#ccc',
  fillOpacity: 1,
  strokeWidth: 1,
});
Kn(Vn, 'renderDot', function (t, e) {
  var r;
  return (
    w.isValidElement(t)
      ? (r = w.cloneElement(t, e))
      : V(t)
        ? (r = t(e))
        : (r = w.createElement(
            Dr,
            Ga({}, e, {
              cx: e.cx,
              cy: e.cy,
              className: 'recharts-reference-dot-dot',
            })
          )),
    r
  );
});
function Ua() {
  return (
    (Ua = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Ua.apply(this, arguments)
  );
}
function Dt(t) {
  '@babel/helpers - typeof';
  return (
    (Dt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Dt(t)
  );
}
function Oc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function wc(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Oc(Object(r), !0).forEach(function (n) {
          Xn(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Oc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Bm(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Nm(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, ou(n.key), n));
  }
}
function Lm(t, e, r) {
  return (
    e && Nm(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Rm(t, e, r) {
  return (
    (e = Pn(e)),
    zm(
      t,
      iu() ? Reflect.construct(e, r || [], Pn(t).constructor) : e.apply(t, r)
    )
  );
}
function zm(t, e) {
  if (e && (Dt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Wm(t);
}
function Wm(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function iu() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (iu = function () {
    return !!t;
  })();
}
function Pn(t) {
  return (
    (Pn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    Pn(t)
  );
}
function Fm(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && Ya(t, e));
}
function Ya(t, e) {
  return (
    (Ya = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    Ya(t, e)
  );
}
function Xn(t, e, r) {
  return (
    (e = ou(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function ou(t) {
  var e = Km(t, 'string');
  return Dt(e) == 'symbol' ? e : e + '';
}
function Km(t, e) {
  if (Dt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Dt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Vm = function (e, r, n, a, i) {
    var o = i.x1,
      c = i.x2,
      l = i.y1,
      u = i.y2,
      s = i.xAxis,
      f = i.yAxis;
    if (!s || !f) return null;
    var p = bi({ x: s.scale, y: f.scale }),
      v = {
        x: e ? p.x.apply(o, { position: 'start' }) : p.x.rangeMin,
        y: n ? p.y.apply(l, { position: 'start' }) : p.y.rangeMin,
      },
      h = {
        x: r ? p.x.apply(c, { position: 'end' }) : p.x.rangeMax,
        y: a ? p.y.apply(u, { position: 'end' }) : p.y.rangeMax,
      };
    return Ee(i, 'discard') && (!p.isInRange(v) || !p.isInRange(h))
      ? null
      : Gl(v, h);
  },
  Gn = (function (t) {
    function e() {
      return (Bm(this, e), Rm(this, e, arguments));
    }
    return (
      Fm(e, t),
      Lm(e, [
        {
          key: 'render',
          value: function () {
            var n = this.props,
              a = n.x1,
              i = n.x2,
              o = n.y1,
              c = n.y2,
              l = n.className,
              u = n.alwaysShow,
              s = n.clipPathId;
            Ae(
              u === void 0,
              'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.'
            );
            var f = ie(a),
              p = ie(i),
              v = ie(o),
              h = ie(c),
              m = this.props.shape;
            if (!f && !p && !v && !h && !m) return null;
            var y = Vm(f, p, v, h, this.props);
            if (!y && !m) return null;
            var O = Ee(this.props, 'hidden') ? 'url(#'.concat(s, ')') : void 0;
            return w.createElement(
              Y,
              { className: U('recharts-reference-area', l) },
              e.renderRect(m, wc(wc({ clipPath: O }, W(this.props, !0)), y)),
              ce.renderCallByParent(this.props, y)
            );
          },
        },
      ])
    );
  })(w.Component);
Xn(Gn, 'displayName', 'ReferenceArea');
Xn(Gn, 'defaultProps', {
  isFront: !1,
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  r: 10,
  fill: '#ccc',
  fillOpacity: 0.5,
  stroke: 'none',
  strokeWidth: 1,
});
Xn(Gn, 'renderRect', function (t, e) {
  var r;
  return (
    w.isValidElement(t)
      ? (r = w.cloneElement(t, e))
      : V(t)
        ? (r = t(e))
        : (r = w.createElement(
            mi,
            Ua({}, e, { className: 'recharts-reference-area-rect' })
          )),
    r
  );
});
function cu(t, e, r) {
  if (e < 1) return [];
  if (e === 1 && r === void 0) return t;
  for (var n = [], a = 0; a < t.length; a += e) n.push(t[a]);
  return n;
}
function Xm(t, e, r) {
  var n = { width: t.width + e.width, height: t.height + e.height };
  return am(n, r);
}
function Gm(t, e, r) {
  var n = r === 'width',
    a = t.x,
    i = t.y,
    o = t.width,
    c = t.height;
  return e === 1
    ? { start: n ? a : i, end: n ? a + o : i + c }
    : { start: n ? a + o : i + c, end: n ? a : i };
}
function An(t, e, r, n, a) {
  if (t * e < t * n || t * e > t * a) return !1;
  var i = r();
  return t * (e - (t * i) / 2 - n) >= 0 && t * (e + (t * i) / 2 - a) <= 0;
}
function Hm(t, e) {
  return cu(t, e + 1);
}
function Um(t, e, r, n, a) {
  for (
    var i = (n || []).slice(),
      o = e.start,
      c = e.end,
      l = 0,
      u = 1,
      s = o,
      f = function () {
        var h = n?.[l];
        if (h === void 0) return { v: cu(n, u) };
        var m = l,
          y,
          O = function () {
            return (y === void 0 && (y = r(h, m)), y);
          },
          b = h.coordinate,
          x = l === 0 || An(t, b, O, s, c);
        (x || ((l = 0), (s = o), (u += 1)),
          x && ((s = b + t * (O() / 2 + a)), (l += u)));
      },
      p;
    u <= i.length;

  )
    if (((p = f()), p)) return p.v;
  return [];
}
function Tr(t) {
  '@babel/helpers - typeof';
  return (
    (Tr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Tr(t)
  );
}
function Pc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function le(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Pc(Object(r), !0).forEach(function (n) {
          Ym(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Pc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Ym(t, e, r) {
  return (
    (e = qm(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function qm(t) {
  var e = Zm(t, 'string');
  return Tr(e) == 'symbol' ? e : e + '';
}
function Zm(t, e) {
  if (Tr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Tr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function Qm(t, e, r, n, a) {
  for (
    var i = (n || []).slice(),
      o = i.length,
      c = e.start,
      l = e.end,
      u = function (p) {
        var v = i[p],
          h,
          m = function () {
            return (h === void 0 && (h = r(v, p)), h);
          };
        if (p === o - 1) {
          var y = t * (v.coordinate + (t * m()) / 2 - l);
          i[p] = v = le(
            le({}, v),
            {},
            { tickCoord: y > 0 ? v.coordinate - y * t : v.coordinate }
          );
        } else i[p] = v = le(le({}, v), {}, { tickCoord: v.coordinate });
        var O = An(t, v.tickCoord, m, c, l);
        O &&
          ((l = v.tickCoord - t * (m() / 2 + a)),
          (i[p] = le(le({}, v), {}, { isShow: !0 })));
      },
      s = o - 1;
    s >= 0;
    s--
  )
    u(s);
  return i;
}
function Jm(t, e, r, n, a, i) {
  var o = (n || []).slice(),
    c = o.length,
    l = e.start,
    u = e.end;
  if (i) {
    var s = n[c - 1],
      f = r(s, c - 1),
      p = t * (s.coordinate + (t * f) / 2 - u);
    o[c - 1] = s = le(
      le({}, s),
      {},
      { tickCoord: p > 0 ? s.coordinate - p * t : s.coordinate }
    );
    var v = An(
      t,
      s.tickCoord,
      function () {
        return f;
      },
      l,
      u
    );
    v &&
      ((u = s.tickCoord - t * (f / 2 + a)),
      (o[c - 1] = le(le({}, s), {}, { isShow: !0 })));
  }
  for (
    var h = i ? c - 1 : c,
      m = function (b) {
        var x = o[b],
          P,
          d = function () {
            return (P === void 0 && (P = r(x, b)), P);
          };
        if (b === 0) {
          var g = t * (x.coordinate - (t * d()) / 2 - l);
          o[b] = x = le(
            le({}, x),
            {},
            { tickCoord: g < 0 ? x.coordinate - g * t : x.coordinate }
          );
        } else o[b] = x = le(le({}, x), {}, { tickCoord: x.coordinate });
        var A = An(t, x.tickCoord, d, l, u);
        A &&
          ((l = x.tickCoord + t * (d() / 2 + a)),
          (o[b] = le(le({}, x), {}, { isShow: !0 })));
      },
      y = 0;
    y < h;
    y++
  )
    m(y);
  return o;
}
function ji(t, e, r) {
  var n = t.tick,
    a = t.ticks,
    i = t.viewBox,
    o = t.minTickGap,
    c = t.orientation,
    l = t.interval,
    u = t.tickFormatter,
    s = t.unit,
    f = t.angle;
  if (!a || !a.length || !n) return [];
  if (M(l) || Le.isSsr) return Hm(a, typeof l == 'number' && M(l) ? l : 0);
  var p = [],
    v = c === 'top' || c === 'bottom' ? 'width' : 'height',
    h =
      s && v === 'width'
        ? tr(s, { fontSize: e, letterSpacing: r })
        : { width: 0, height: 0 },
    m = function (x, P) {
      var d = V(u) ? u(x.value, P) : x.value;
      return v === 'width'
        ? Xm(tr(d, { fontSize: e, letterSpacing: r }), h, f)
        : tr(d, { fontSize: e, letterSpacing: r })[v];
    },
    y = a.length >= 2 ? fe(a[1].coordinate - a[0].coordinate) : 1,
    O = Gm(i, y, v);
  return l === 'equidistantPreserveStart'
    ? Um(y, O, m, a, o)
    : (l === 'preserveStart' || l === 'preserveStartEnd'
        ? (p = Jm(y, O, m, a, o, l === 'preserveStartEnd'))
        : (p = Qm(y, O, m, a, o)),
      p.filter(function (b) {
        return b.isShow;
      }));
}
var eg = ['viewBox'],
  tg = ['viewBox'],
  rg = ['ticks'];
function Mt(t) {
  '@babel/helpers - typeof';
  return (
    (Mt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Mt(t)
  );
}
function yt() {
  return (
    (yt = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    yt.apply(this, arguments)
  );
}
function Ac(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function se(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Ac(Object(r), !0).forEach(function (n) {
          Ei(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Ac(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function na(t, e) {
  if (t == null) return {};
  var r = ng(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function ng(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function ag(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Sc(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, uu(n.key), n));
  }
}
function ig(t, e, r) {
  return (
    e && Sc(t.prototype, e),
    r && Sc(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function og(t, e, r) {
  return (
    (e = Sn(e)),
    cg(
      t,
      lu() ? Reflect.construct(e, r || [], Sn(t).constructor) : e.apply(t, r)
    )
  );
}
function cg(t, e) {
  if (e && (Mt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return lg(t);
}
function lg(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function lu() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (lu = function () {
    return !!t;
  })();
}
function Sn(t) {
  return (
    (Sn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    Sn(t)
  );
}
function ug(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && qa(t, e));
}
function qa(t, e) {
  return (
    (qa = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    qa(t, e)
  );
}
function Ei(t, e, r) {
  return (
    (e = uu(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function uu(t) {
  var e = sg(t, 'string');
  return Mt(e) == 'symbol' ? e : e + '';
}
function sg(t, e) {
  if (Mt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Mt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Xt = (function (t) {
  function e(r) {
    var n;
    return (
      ag(this, e),
      (n = og(this, e, [r])),
      (n.state = { fontSize: '', letterSpacing: '' }),
      n
    );
  }
  return (
    ug(e, t),
    ig(
      e,
      [
        {
          key: 'shouldComponentUpdate',
          value: function (n, a) {
            var i = n.viewBox,
              o = na(n, eg),
              c = this.props,
              l = c.viewBox,
              u = na(c, tg);
            return !gt(i, l) || !gt(o, u) || !gt(a, this.state);
          },
        },
        {
          key: 'componentDidMount',
          value: function () {
            var n = this.layerReference;
            if (n) {
              var a = n.getElementsByClassName(
                'recharts-cartesian-axis-tick-value'
              )[0];
              a &&
                this.setState({
                  fontSize: window.getComputedStyle(a).fontSize,
                  letterSpacing: window.getComputedStyle(a).letterSpacing,
                });
            }
          },
        },
        {
          key: 'getTickLineCoord',
          value: function (n) {
            var a = this.props,
              i = a.x,
              o = a.y,
              c = a.width,
              l = a.height,
              u = a.orientation,
              s = a.tickSize,
              f = a.mirror,
              p = a.tickMargin,
              v,
              h,
              m,
              y,
              O,
              b,
              x = f ? -1 : 1,
              P = n.tickSize || s,
              d = M(n.tickCoord) ? n.tickCoord : n.coordinate;
            switch (u) {
              case 'top':
                ((v = h = n.coordinate),
                  (y = o + +!f * l),
                  (m = y - x * P),
                  (b = m - x * p),
                  (O = d));
                break;
              case 'left':
                ((m = y = n.coordinate),
                  (h = i + +!f * c),
                  (v = h - x * P),
                  (O = v - x * p),
                  (b = d));
                break;
              case 'right':
                ((m = y = n.coordinate),
                  (h = i + +f * c),
                  (v = h + x * P),
                  (O = v + x * p),
                  (b = d));
                break;
              default:
                ((v = h = n.coordinate),
                  (y = o + +f * l),
                  (m = y + x * P),
                  (b = m + x * p),
                  (O = d));
                break;
            }
            return {
              line: { x1: v, y1: m, x2: h, y2: y },
              tick: { x: O, y: b },
            };
          },
        },
        {
          key: 'getTickTextAnchor',
          value: function () {
            var n = this.props,
              a = n.orientation,
              i = n.mirror,
              o;
            switch (a) {
              case 'left':
                o = i ? 'start' : 'end';
                break;
              case 'right':
                o = i ? 'end' : 'start';
                break;
              default:
                o = 'middle';
                break;
            }
            return o;
          },
        },
        {
          key: 'getTickVerticalAnchor',
          value: function () {
            var n = this.props,
              a = n.orientation,
              i = n.mirror,
              o = 'end';
            switch (a) {
              case 'left':
              case 'right':
                o = 'middle';
                break;
              case 'top':
                o = i ? 'start' : 'end';
                break;
              default:
                o = i ? 'end' : 'start';
                break;
            }
            return o;
          },
        },
        {
          key: 'renderAxisLine',
          value: function () {
            var n = this.props,
              a = n.x,
              i = n.y,
              o = n.width,
              c = n.height,
              l = n.orientation,
              u = n.mirror,
              s = n.axisLine,
              f = se(
                se(se({}, W(this.props, !1)), W(s, !1)),
                {},
                { fill: 'none' }
              );
            if (l === 'top' || l === 'bottom') {
              var p = +((l === 'top' && !u) || (l === 'bottom' && u));
              f = se(
                se({}, f),
                {},
                { x1: a, y1: i + p * c, x2: a + o, y2: i + p * c }
              );
            } else {
              var v = +((l === 'left' && !u) || (l === 'right' && u));
              f = se(
                se({}, f),
                {},
                { x1: a + v * o, y1: i, x2: a + v * o, y2: i + c }
              );
            }
            return w.createElement(
              'line',
              yt({}, f, {
                className: U(
                  'recharts-cartesian-axis-line',
                  ye(s, 'className')
                ),
              })
            );
          },
        },
        {
          key: 'renderTicks',
          value: function (n, a, i) {
            var o = this,
              c = this.props,
              l = c.tickLine,
              u = c.stroke,
              s = c.tick,
              f = c.tickFormatter,
              p = c.unit,
              v = ji(se(se({}, this.props), {}, { ticks: n }), a, i),
              h = this.getTickTextAnchor(),
              m = this.getTickVerticalAnchor(),
              y = W(this.props, !1),
              O = W(s, !1),
              b = se(se({}, y), {}, { fill: 'none' }, W(l, !1)),
              x = v.map(function (P, d) {
                var g = o.getTickLineCoord(P),
                  A = g.line,
                  S = g.tick,
                  j = se(
                    se(
                      se(
                        se({ textAnchor: h, verticalAnchor: m }, y),
                        {},
                        { stroke: 'none', fill: u },
                        O
                      ),
                      S
                    ),
                    {},
                    {
                      index: d,
                      payload: P,
                      visibleTicksCount: v.length,
                      tickFormatter: f,
                    }
                  );
                return w.createElement(
                  Y,
                  yt(
                    {
                      className: 'recharts-cartesian-axis-tick',
                      key: 'tick-'
                        .concat(P.value, '-')
                        .concat(P.coordinate, '-')
                        .concat(P.tickCoord),
                    },
                    tt(o.props, P, d)
                  ),
                  l &&
                    w.createElement(
                      'line',
                      yt({}, b, A, {
                        className: U(
                          'recharts-cartesian-axis-tick-line',
                          ye(l, 'className')
                        ),
                      })
                    ),
                  s &&
                    e.renderTickItem(
                      s,
                      j,
                      ''.concat(V(f) ? f(P.value, d) : P.value).concat(p || '')
                    )
                );
              });
            return w.createElement(
              'g',
              { className: 'recharts-cartesian-axis-ticks' },
              x
            );
          },
        },
        {
          key: 'render',
          value: function () {
            var n = this,
              a = this.props,
              i = a.axisLine,
              o = a.width,
              c = a.height,
              l = a.ticksGenerator,
              u = a.className,
              s = a.hide;
            if (s) return null;
            var f = this.props,
              p = f.ticks,
              v = na(f, rg),
              h = p;
            return (
              V(l) && (h = p && p.length > 0 ? l(this.props) : l(v)),
              o <= 0 || c <= 0 || !h || !h.length
                ? null
                : w.createElement(
                    Y,
                    {
                      className: U('recharts-cartesian-axis', u),
                      ref: function (y) {
                        n.layerReference = y;
                      },
                    },
                    i && this.renderAxisLine(),
                    this.renderTicks(
                      h,
                      this.state.fontSize,
                      this.state.letterSpacing
                    ),
                    ce.renderCallByParent(this.props)
                  )
            );
          },
        },
      ],
      [
        {
          key: 'renderTickItem',
          value: function (n, a, i) {
            var o;
            return (
              w.isValidElement(n)
                ? (o = w.cloneElement(n, a))
                : V(n)
                  ? (o = n(a))
                  : (o = w.createElement(
                      rt,
                      yt({}, a, {
                        className: 'recharts-cartesian-axis-tick-value',
                      }),
                      i
                    )),
              o
            );
          },
        },
      ]
    )
  );
})(N.Component);
Ei(Xt, 'displayName', 'CartesianAxis');
Ei(Xt, 'defaultProps', {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  viewBox: { x: 0, y: 0, width: 0, height: 0 },
  orientation: 'bottom',
  ticks: [],
  stroke: '#666',
  tickLine: !0,
  axisLine: !0,
  tick: !0,
  mirror: !1,
  minTickGap: 5,
  tickSize: 6,
  tickMargin: 2,
  interval: 'preserveEnd',
});
var fg = ['x1', 'y1', 'x2', 'y2', 'key'],
  pg = ['offset'];
function nt(t) {
  '@babel/helpers - typeof';
  return (
    (nt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    nt(t)
  );
}
function jc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function ue(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? jc(Object(r), !0).forEach(function (n) {
          dg(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : jc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function dg(t, e, r) {
  return (
    (e = vg(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function vg(t) {
  var e = hg(t, 'string');
  return nt(e) == 'symbol' ? e : e + '';
}
function hg(t, e) {
  if (nt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (nt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function Ye() {
  return (
    (Ye = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    Ye.apply(this, arguments)
  );
}
function Ec(t, e) {
  if (t == null) return {};
  var r = yg(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function yg(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
var mg = function (e) {
  var r = e.fill;
  if (!r || r === 'none') return null;
  var n = e.fillOpacity,
    a = e.x,
    i = e.y,
    o = e.width,
    c = e.height,
    l = e.ry;
  return w.createElement('rect', {
    x: a,
    y: i,
    ry: l,
    width: o,
    height: c,
    stroke: 'none',
    fill: r,
    fillOpacity: n,
    className: 'recharts-cartesian-grid-bg',
  });
};
function su(t, e) {
  var r;
  if (w.isValidElement(t)) r = w.cloneElement(t, e);
  else if (V(t)) r = t(e);
  else {
    var n = e.x1,
      a = e.y1,
      i = e.x2,
      o = e.y2,
      c = e.key,
      l = Ec(e, fg),
      u = W(l, !1);
    u.offset;
    var s = Ec(u, pg);
    r = w.createElement(
      'line',
      Ye({}, s, { x1: n, y1: a, x2: i, y2: o, fill: 'none', key: c })
    );
  }
  return r;
}
function gg(t) {
  var e = t.x,
    r = t.width,
    n = t.horizontal,
    a = n === void 0 ? !0 : n,
    i = t.horizontalPoints;
  if (!a || !i || !i.length) return null;
  var o = i.map(function (c, l) {
    var u = ue(
      ue({}, t),
      {},
      { x1: e, y1: c, x2: e + r, y2: c, key: 'line-'.concat(l), index: l }
    );
    return su(a, u);
  });
  return w.createElement(
    'g',
    { className: 'recharts-cartesian-grid-horizontal' },
    o
  );
}
function bg(t) {
  var e = t.y,
    r = t.height,
    n = t.vertical,
    a = n === void 0 ? !0 : n,
    i = t.verticalPoints;
  if (!a || !i || !i.length) return null;
  var o = i.map(function (c, l) {
    var u = ue(
      ue({}, t),
      {},
      { x1: c, y1: e, x2: c, y2: e + r, key: 'line-'.concat(l), index: l }
    );
    return su(a, u);
  });
  return w.createElement(
    'g',
    { className: 'recharts-cartesian-grid-vertical' },
    o
  );
}
function xg(t) {
  var e = t.horizontalFill,
    r = t.fillOpacity,
    n = t.x,
    a = t.y,
    i = t.width,
    o = t.height,
    c = t.horizontalPoints,
    l = t.horizontal,
    u = l === void 0 ? !0 : l;
  if (!u || !e || !e.length) return null;
  var s = c
    .map(function (p) {
      return Math.round(p + a - a);
    })
    .sort(function (p, v) {
      return p - v;
    });
  a !== s[0] && s.unshift(0);
  var f = s.map(function (p, v) {
    var h = !s[v + 1],
      m = h ? a + o - p : s[v + 1] - p;
    if (m <= 0) return null;
    var y = v % e.length;
    return w.createElement('rect', {
      key: 'react-'.concat(v),
      y: p,
      x: n,
      height: m,
      width: i,
      stroke: 'none',
      fill: e[y],
      fillOpacity: r,
      className: 'recharts-cartesian-grid-bg',
    });
  });
  return w.createElement(
    'g',
    { className: 'recharts-cartesian-gridstripes-horizontal' },
    f
  );
}
function Og(t) {
  var e = t.vertical,
    r = e === void 0 ? !0 : e,
    n = t.verticalFill,
    a = t.fillOpacity,
    i = t.x,
    o = t.y,
    c = t.width,
    l = t.height,
    u = t.verticalPoints;
  if (!r || !n || !n.length) return null;
  var s = u
    .map(function (p) {
      return Math.round(p + i - i);
    })
    .sort(function (p, v) {
      return p - v;
    });
  i !== s[0] && s.unshift(0);
  var f = s.map(function (p, v) {
    var h = !s[v + 1],
      m = h ? i + c - p : s[v + 1] - p;
    if (m <= 0) return null;
    var y = v % n.length;
    return w.createElement('rect', {
      key: 'react-'.concat(v),
      x: p,
      y: o,
      width: m,
      height: l,
      stroke: 'none',
      fill: n[y],
      fillOpacity: a,
      className: 'recharts-cartesian-grid-bg',
    });
  });
  return w.createElement(
    'g',
    { className: 'recharts-cartesian-gridstripes-vertical' },
    f
  );
}
var wg = function (e, r) {
    var n = e.xAxis,
      a = e.width,
      i = e.height,
      o = e.offset;
    return xl(
      ji(
        ue(
          ue(ue({}, Xt.defaultProps), n),
          {},
          { ticks: Ie(n, !0), viewBox: { x: 0, y: 0, width: a, height: i } }
        )
      ),
      o.left,
      o.left + o.width,
      r
    );
  },
  Pg = function (e, r) {
    var n = e.yAxis,
      a = e.width,
      i = e.height,
      o = e.offset;
    return xl(
      ji(
        ue(
          ue(ue({}, Xt.defaultProps), n),
          {},
          { ticks: Ie(n, !0), viewBox: { x: 0, y: 0, width: a, height: i } }
        )
      ),
      o.top,
      o.top + o.height,
      r
    );
  },
  ft = {
    horizontal: !0,
    vertical: !0,
    stroke: '#ccc',
    fill: 'none',
    verticalFill: [],
    horizontalFill: [],
  };
function Ag(t) {
  var e,
    r,
    n,
    a,
    i,
    o,
    c = wi(),
    l = Pi(),
    u = sm(),
    s = ue(
      ue({}, t),
      {},
      {
        stroke: (e = t.stroke) !== null && e !== void 0 ? e : ft.stroke,
        fill: (r = t.fill) !== null && r !== void 0 ? r : ft.fill,
        horizontal:
          (n = t.horizontal) !== null && n !== void 0 ? n : ft.horizontal,
        horizontalFill:
          (a = t.horizontalFill) !== null && a !== void 0
            ? a
            : ft.horizontalFill,
        vertical: (i = t.vertical) !== null && i !== void 0 ? i : ft.vertical,
        verticalFill:
          (o = t.verticalFill) !== null && o !== void 0 ? o : ft.verticalFill,
        x: M(t.x) ? t.x : u.left,
        y: M(t.y) ? t.y : u.top,
        width: M(t.width) ? t.width : u.width,
        height: M(t.height) ? t.height : u.height,
      }
    ),
    f = s.x,
    p = s.y,
    v = s.width,
    h = s.height,
    m = s.syncWithTicks,
    y = s.horizontalValues,
    O = s.verticalValues,
    b = cm(),
    x = lm();
  if (
    !M(v) ||
    v <= 0 ||
    !M(h) ||
    h <= 0 ||
    !M(f) ||
    f !== +f ||
    !M(p) ||
    p !== +p
  )
    return null;
  var P = s.verticalCoordinatesGenerator || wg,
    d = s.horizontalCoordinatesGenerator || Pg,
    g = s.horizontalPoints,
    A = s.verticalPoints;
  if ((!g || !g.length) && V(d)) {
    var S = y && y.length,
      j = d(
        {
          yAxis: x ? ue(ue({}, x), {}, { ticks: S ? y : x.ticks }) : void 0,
          width: c,
          height: l,
          offset: u,
        },
        S ? !0 : m
      );
    (Ae(
      Array.isArray(j),
      'horizontalCoordinatesGenerator should return Array but instead it returned ['.concat(
        nt(j),
        ']'
      )
    ),
      Array.isArray(j) && (g = j));
  }
  if ((!A || !A.length) && V(P)) {
    var E = O && O.length,
      $ = P(
        {
          xAxis: b ? ue(ue({}, b), {}, { ticks: E ? O : b.ticks }) : void 0,
          width: c,
          height: l,
          offset: u,
        },
        E ? !0 : m
      );
    (Ae(
      Array.isArray($),
      'verticalCoordinatesGenerator should return Array but instead it returned ['.concat(
        nt($),
        ']'
      )
    ),
      Array.isArray($) && (A = $));
  }
  return w.createElement(
    'g',
    { className: 'recharts-cartesian-grid' },
    w.createElement(mg, {
      fill: s.fill,
      fillOpacity: s.fillOpacity,
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
      ry: s.ry,
    }),
    w.createElement(
      gg,
      Ye({}, s, { offset: u, horizontalPoints: g, xAxis: b, yAxis: x })
    ),
    w.createElement(
      bg,
      Ye({}, s, { offset: u, verticalPoints: A, xAxis: b, yAxis: x })
    ),
    w.createElement(xg, Ye({}, s, { horizontalPoints: g })),
    w.createElement(Og, Ye({}, s, { verticalPoints: A }))
  );
}
Ag.displayName = 'CartesianGrid';
var Sg = ['type', 'layout', 'connectNulls', 'ref'],
  jg = ['key'];
function Bt(t) {
  '@babel/helpers - typeof';
  return (
    (Bt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Bt(t)
  );
}
function $c(t, e) {
  if (t == null) return {};
  var r = Eg(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function Eg(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function ir() {
  return (
    (ir = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    ir.apply(this, arguments)
  );
}
function _c(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function de(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? _c(Object(r), !0).forEach(function (n) {
          Pe(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : _c(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function pt(t) {
  return Ig(t) || Tg(t) || _g(t) || $g();
}
function $g() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function _g(t, e) {
  if (t) {
    if (typeof t == 'string') return Za(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return Za(t, e);
  }
}
function Tg(t) {
  if (
    (typeof Symbol < 'u' && t[Symbol.iterator] != null) ||
    t['@@iterator'] != null
  )
    return Array.from(t);
}
function Ig(t) {
  if (Array.isArray(t)) return Za(t);
}
function Za(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function kg(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Tc(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, pu(n.key), n));
  }
}
function Cg(t, e, r) {
  return (
    e && Tc(t.prototype, e),
    r && Tc(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Dg(t, e, r) {
  return (
    (e = jn(e)),
    Mg(
      t,
      fu() ? Reflect.construct(e, r || [], jn(t).constructor) : e.apply(t, r)
    )
  );
}
function Mg(t, e) {
  if (e && (Bt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Bg(t);
}
function Bg(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function fu() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (fu = function () {
    return !!t;
  })();
}
function jn(t) {
  return (
    (jn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    jn(t)
  );
}
function Ng(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && Qa(t, e));
}
function Qa(t, e) {
  return (
    (Qa = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    Qa(t, e)
  );
}
function Pe(t, e, r) {
  return (
    (e = pu(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function pu(t) {
  var e = Lg(t, 'string');
  return Bt(e) == 'symbol' ? e : e + '';
}
function Lg(t, e) {
  if (Bt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Bt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Hn = (function (t) {
  function e() {
    var r;
    kg(this, e);
    for (var n = arguments.length, a = new Array(n), i = 0; i < n; i++)
      a[i] = arguments[i];
    return (
      (r = Dg(this, e, [].concat(a))),
      Pe(r, 'state', { isAnimationFinished: !0, totalLength: 0 }),
      Pe(r, 'generateSimpleStrokeDasharray', function (o, c) {
        return ''.concat(c, 'px ').concat(o - c, 'px');
      }),
      Pe(r, 'getStrokeDasharray', function (o, c, l) {
        var u = l.reduce(function (O, b) {
          return O + b;
        });
        if (!u) return r.generateSimpleStrokeDasharray(c, o);
        for (
          var s = Math.floor(o / u), f = o % u, p = c - o, v = [], h = 0, m = 0;
          h < l.length;
          m += l[h], ++h
        )
          if (m + l[h] > f) {
            v = [].concat(pt(l.slice(0, h)), [f - m]);
            break;
          }
        var y = v.length % 2 === 0 ? [0, p] : [p];
        return []
          .concat(pt(e.repeat(l, s)), pt(v), y)
          .map(function (O) {
            return ''.concat(O, 'px');
          })
          .join(', ');
      }),
      Pe(r, 'id', at('recharts-line-')),
      Pe(r, 'pathRef', function (o) {
        r.mainCurve = o;
      }),
      Pe(r, 'handleAnimationEnd', function () {
        (r.setState({ isAnimationFinished: !0 }),
          r.props.onAnimationEnd && r.props.onAnimationEnd());
      }),
      Pe(r, 'handleAnimationStart', function () {
        (r.setState({ isAnimationFinished: !1 }),
          r.props.onAnimationStart && r.props.onAnimationStart());
      }),
      r
    );
  }
  return (
    Ng(e, t),
    Cg(
      e,
      [
        {
          key: 'componentDidMount',
          value: function () {
            if (this.props.isAnimationActive) {
              var n = this.getTotalLength();
              this.setState({ totalLength: n });
            }
          },
        },
        {
          key: 'componentDidUpdate',
          value: function () {
            if (this.props.isAnimationActive) {
              var n = this.getTotalLength();
              n !== this.state.totalLength && this.setState({ totalLength: n });
            }
          },
        },
        {
          key: 'getTotalLength',
          value: function () {
            var n = this.mainCurve;
            try {
              return (n && n.getTotalLength && n.getTotalLength()) || 0;
            } catch {
              return 0;
            }
          },
        },
        {
          key: 'renderErrorBar',
          value: function (n, a) {
            if (this.props.isAnimationActive && !this.state.isAnimationFinished)
              return null;
            var i = this.props,
              o = i.points,
              c = i.xAxis,
              l = i.yAxis,
              u = i.layout,
              s = i.children,
              f = me(s, Cr);
            if (!f) return null;
            var p = function (m, y) {
                return {
                  x: m.x,
                  y: m.y,
                  value: m.value,
                  errorVal: te(m.payload, y),
                };
              },
              v = { clipPath: n ? 'url(#clipPath-'.concat(a, ')') : null };
            return w.createElement(
              Y,
              v,
              f.map(function (h) {
                return w.cloneElement(h, {
                  key: 'bar-'.concat(h.props.dataKey),
                  data: o,
                  xAxis: c,
                  yAxis: l,
                  layout: u,
                  dataPointFormatter: p,
                });
              })
            );
          },
        },
        {
          key: 'renderDots',
          value: function (n, a, i) {
            var o = this.props.isAnimationActive;
            if (o && !this.state.isAnimationFinished) return null;
            var c = this.props,
              l = c.dot,
              u = c.points,
              s = c.dataKey,
              f = W(this.props, !1),
              p = W(l, !0),
              v = u.map(function (m, y) {
                var O = de(
                  de(de({ key: 'dot-'.concat(y), r: 3 }, f), p),
                  {},
                  {
                    index: y,
                    cx: m.x,
                    cy: m.y,
                    value: m.value,
                    dataKey: s,
                    payload: m.payload,
                    points: u,
                  }
                );
                return e.renderDotItem(l, O);
              }),
              h = {
                clipPath: n
                  ? 'url(#clipPath-'.concat(a ? '' : 'dots-').concat(i, ')')
                  : null,
              };
            return w.createElement(
              Y,
              ir({ className: 'recharts-line-dots', key: 'dots' }, h),
              v
            );
          },
        },
        {
          key: 'renderCurveStatically',
          value: function (n, a, i, o) {
            var c = this.props,
              l = c.type,
              u = c.layout,
              s = c.connectNulls;
            c.ref;
            var f = $c(c, Sg),
              p = de(
                de(
                  de({}, W(f, !0)),
                  {},
                  {
                    fill: 'none',
                    className: 'recharts-line-curve',
                    clipPath: a ? 'url(#clipPath-'.concat(i, ')') : null,
                    points: n,
                  },
                  o
                ),
                {},
                { type: l, layout: u, connectNulls: s }
              );
            return w.createElement(Ze, ir({}, p, { pathRef: this.pathRef }));
          },
        },
        {
          key: 'renderCurveWithAnimation',
          value: function (n, a) {
            var i = this,
              o = this.props,
              c = o.points,
              l = o.strokeDasharray,
              u = o.isAnimationActive,
              s = o.animationBegin,
              f = o.animationDuration,
              p = o.animationEasing,
              v = o.animationId,
              h = o.animateNewValues,
              m = o.width,
              y = o.height,
              O = this.state,
              b = O.prevPoints,
              x = O.totalLength;
            return w.createElement(
              Ne,
              {
                begin: s,
                duration: f,
                isActive: u,
                easing: p,
                from: { t: 0 },
                to: { t: 1 },
                key: 'line-'.concat(v),
                onAnimationEnd: this.handleAnimationEnd,
                onAnimationStart: this.handleAnimationStart,
              },
              function (P) {
                var d = P.t;
                if (b) {
                  var g = b.length / c.length,
                    A = c.map(function (_, k) {
                      var C = Math.floor(k * g);
                      if (b[C]) {
                        var I = b[C],
                          D = ae(I.x, _.x),
                          B = ae(I.y, _.y);
                        return de(de({}, _), {}, { x: D(d), y: B(d) });
                      }
                      if (h) {
                        var L = ae(m * 2, _.x),
                          z = ae(y / 2, _.y);
                        return de(de({}, _), {}, { x: L(d), y: z(d) });
                      }
                      return de(de({}, _), {}, { x: _.x, y: _.y });
                    });
                  return i.renderCurveStatically(A, n, a);
                }
                var S = ae(0, x),
                  j = S(d),
                  E;
                if (l) {
                  var $ = ''
                    .concat(l)
                    .split(/[,\s]+/gim)
                    .map(function (_) {
                      return parseFloat(_);
                    });
                  E = i.getStrokeDasharray(j, x, $);
                } else E = i.generateSimpleStrokeDasharray(x, j);
                return i.renderCurveStatically(c, n, a, { strokeDasharray: E });
              }
            );
          },
        },
        {
          key: 'renderCurve',
          value: function (n, a) {
            var i = this.props,
              o = i.points,
              c = i.isAnimationActive,
              l = this.state,
              u = l.prevPoints,
              s = l.totalLength;
            return c && o && o.length && ((!u && s > 0) || !et(u, o))
              ? this.renderCurveWithAnimation(n, a)
              : this.renderCurveStatically(o, n, a);
          },
        },
        {
          key: 'render',
          value: function () {
            var n,
              a = this.props,
              i = a.hide,
              o = a.dot,
              c = a.points,
              l = a.className,
              u = a.xAxis,
              s = a.yAxis,
              f = a.top,
              p = a.left,
              v = a.width,
              h = a.height,
              m = a.isAnimationActive,
              y = a.id;
            if (i || !c || !c.length) return null;
            var O = this.state.isAnimationFinished,
              b = c.length === 1,
              x = U('recharts-line', l),
              P = u && u.allowDataOverflow,
              d = s && s.allowDataOverflow,
              g = P || d,
              A = H(y) ? this.id : y,
              S =
                (n = W(o, !1)) !== null && n !== void 0
                  ? n
                  : { r: 3, strokeWidth: 2 },
              j = S.r,
              E = j === void 0 ? 3 : j,
              $ = S.strokeWidth,
              _ = $ === void 0 ? 2 : $,
              k = Xc(o) ? o : {},
              C = k.clipDot,
              I = C === void 0 ? !0 : C,
              D = E * 2 + _;
            return w.createElement(
              Y,
              { className: x },
              P || d
                ? w.createElement(
                    'defs',
                    null,
                    w.createElement(
                      'clipPath',
                      { id: 'clipPath-'.concat(A) },
                      w.createElement('rect', {
                        x: P ? p : p - v / 2,
                        y: d ? f : f - h / 2,
                        width: P ? v : v * 2,
                        height: d ? h : h * 2,
                      })
                    ),
                    !I &&
                      w.createElement(
                        'clipPath',
                        { id: 'clipPath-dots-'.concat(A) },
                        w.createElement('rect', {
                          x: p - D / 2,
                          y: f - D / 2,
                          width: v + D,
                          height: h + D,
                        })
                      )
                  )
                : null,
              !b && this.renderCurve(g, A),
              this.renderErrorBar(g, A),
              (b || o) && this.renderDots(g, I, A),
              (!m || O) && je.renderCallByParent(this.props, c)
            );
          },
        },
      ],
      [
        {
          key: 'getDerivedStateFromProps',
          value: function (n, a) {
            return n.animationId !== a.prevAnimationId
              ? {
                  prevAnimationId: n.animationId,
                  curPoints: n.points,
                  prevPoints: a.curPoints,
                }
              : n.points !== a.curPoints
                ? { curPoints: n.points }
                : null;
          },
        },
        {
          key: 'repeat',
          value: function (n, a) {
            for (
              var i = n.length % 2 !== 0 ? [].concat(pt(n), [0]) : n,
                o = [],
                c = 0;
              c < a;
              ++c
            )
              o = [].concat(pt(o), pt(i));
            return o;
          },
        },
        {
          key: 'renderDotItem',
          value: function (n, a) {
            var i;
            if (w.isValidElement(n)) i = w.cloneElement(n, a);
            else if (V(n)) i = n(a);
            else {
              var o = a.key,
                c = $c(a, jg),
                l = U(
                  'recharts-line-dot',
                  typeof n != 'boolean' ? n.className : ''
                );
              i = w.createElement(Dr, ir({ key: o }, c, { className: l }));
            }
            return i;
          },
        },
      ]
    )
  );
})(N.PureComponent);
Pe(Hn, 'displayName', 'Line');
Pe(Hn, 'defaultProps', {
  xAxisId: 0,
  yAxisId: 0,
  connectNulls: !1,
  activeDot: !0,
  dot: !0,
  legendType: 'line',
  stroke: '#3182bd',
  strokeWidth: 1,
  fill: '#fff',
  points: [],
  isAnimationActive: !Le.isSsr,
  animateNewValues: !0,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  hide: !1,
  label: !1,
});
Pe(Hn, 'getComposedData', function (t) {
  var e = t.props,
    r = t.xAxis,
    n = t.yAxis,
    a = t.xAxisTicks,
    i = t.yAxisTicks,
    o = t.dataKey,
    c = t.bandSize,
    l = t.displayedData,
    u = t.offset,
    s = e.layout,
    f = l.map(function (p, v) {
      var h = te(p, o);
      return s === 'horizontal'
        ? {
            x: cn({ axis: r, ticks: a, bandSize: c, entry: p, index: v }),
            y: H(h) ? null : n.scale(h),
            value: h,
            payload: p,
          }
        : {
            x: H(h) ? null : r.scale(h),
            y: cn({ axis: n, ticks: i, bandSize: c, entry: p, index: v }),
            value: h,
            payload: p,
          };
    });
  return de({ points: f, layout: s }, u);
});
var Rg = ['layout', 'type', 'stroke', 'connectNulls', 'isRange', 'ref'],
  zg = ['key'],
  du;
function Nt(t) {
  '@babel/helpers - typeof';
  return (
    (Nt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Nt(t)
  );
}
function vu(t, e) {
  if (t == null) return {};
  var r = Wg(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function Wg(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function qe() {
  return (
    (qe = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    qe.apply(this, arguments)
  );
}
function Ic(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Ce(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Ic(Object(r), !0).forEach(function (n) {
          Se(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Ic(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Fg(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function kc(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, yu(n.key), n));
  }
}
function Kg(t, e, r) {
  return (
    e && kc(t.prototype, e),
    r && kc(t, r),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Vg(t, e, r) {
  return (
    (e = En(e)),
    Xg(
      t,
      hu() ? Reflect.construct(e, r || [], En(t).constructor) : e.apply(t, r)
    )
  );
}
function Xg(t, e) {
  if (e && (Nt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Gg(t);
}
function Gg(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function hu() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (hu = function () {
    return !!t;
  })();
}
function En(t) {
  return (
    (En = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    En(t)
  );
}
function Hg(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && Ja(t, e));
}
function Ja(t, e) {
  return (
    (Ja = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    Ja(t, e)
  );
}
function Se(t, e, r) {
  return (
    (e = yu(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function yu(t) {
  var e = Ug(t, 'string');
  return Nt(e) == 'symbol' ? e : e + '';
}
function Ug(t, e) {
  if (Nt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Nt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var it = (function (t) {
  function e() {
    var r;
    Fg(this, e);
    for (var n = arguments.length, a = new Array(n), i = 0; i < n; i++)
      a[i] = arguments[i];
    return (
      (r = Vg(this, e, [].concat(a))),
      Se(r, 'state', { isAnimationFinished: !0 }),
      Se(r, 'id', at('recharts-area-')),
      Se(r, 'handleAnimationEnd', function () {
        var o = r.props.onAnimationEnd;
        (r.setState({ isAnimationFinished: !0 }), V(o) && o());
      }),
      Se(r, 'handleAnimationStart', function () {
        var o = r.props.onAnimationStart;
        (r.setState({ isAnimationFinished: !1 }), V(o) && o());
      }),
      r
    );
  }
  return (
    Hg(e, t),
    Kg(
      e,
      [
        {
          key: 'renderDots',
          value: function (n, a, i) {
            var o = this.props.isAnimationActive,
              c = this.state.isAnimationFinished;
            if (o && !c) return null;
            var l = this.props,
              u = l.dot,
              s = l.points,
              f = l.dataKey,
              p = W(this.props, !1),
              v = W(u, !0),
              h = s.map(function (y, O) {
                var b = Ce(
                  Ce(Ce({ key: 'dot-'.concat(O), r: 3 }, p), v),
                  {},
                  {
                    index: O,
                    cx: y.x,
                    cy: y.y,
                    dataKey: f,
                    value: y.value,
                    payload: y.payload,
                    points: s,
                  }
                );
                return e.renderDotItem(u, b);
              }),
              m = {
                clipPath: n
                  ? 'url(#clipPath-'.concat(a ? '' : 'dots-').concat(i, ')')
                  : null,
              };
            return w.createElement(
              Y,
              qe({ className: 'recharts-area-dots' }, m),
              h
            );
          },
        },
        {
          key: 'renderHorizontalRect',
          value: function (n) {
            var a = this.props,
              i = a.baseLine,
              o = a.points,
              c = a.strokeWidth,
              l = o[0].x,
              u = o[o.length - 1].x,
              s = n * Math.abs(l - u),
              f = Me(
                o.map(function (p) {
                  return p.y || 0;
                })
              );
            return (
              M(i) && typeof i == 'number'
                ? (f = Math.max(i, f))
                : i &&
                  Array.isArray(i) &&
                  i.length &&
                  (f = Math.max(
                    Me(
                      i.map(function (p) {
                        return p.y || 0;
                      })
                    ),
                    f
                  )),
              M(f)
                ? w.createElement('rect', {
                    x: l < u ? l : l - s,
                    y: 0,
                    width: s,
                    height: Math.floor(
                      f + (c ? parseInt(''.concat(c), 10) : 1)
                    ),
                  })
                : null
            );
          },
        },
        {
          key: 'renderVerticalRect',
          value: function (n) {
            var a = this.props,
              i = a.baseLine,
              o = a.points,
              c = a.strokeWidth,
              l = o[0].y,
              u = o[o.length - 1].y,
              s = n * Math.abs(l - u),
              f = Me(
                o.map(function (p) {
                  return p.x || 0;
                })
              );
            return (
              M(i) && typeof i == 'number'
                ? (f = Math.max(i, f))
                : i &&
                  Array.isArray(i) &&
                  i.length &&
                  (f = Math.max(
                    Me(
                      i.map(function (p) {
                        return p.x || 0;
                      })
                    ),
                    f
                  )),
              M(f)
                ? w.createElement('rect', {
                    x: 0,
                    y: l < u ? l : l - s,
                    width: f + (c ? parseInt(''.concat(c), 10) : 1),
                    height: Math.floor(s),
                  })
                : null
            );
          },
        },
        {
          key: 'renderClipRect',
          value: function (n) {
            var a = this.props.layout;
            return a === 'vertical'
              ? this.renderVerticalRect(n)
              : this.renderHorizontalRect(n);
          },
        },
        {
          key: 'renderAreaStatically',
          value: function (n, a, i, o) {
            var c = this.props,
              l = c.layout,
              u = c.type,
              s = c.stroke,
              f = c.connectNulls,
              p = c.isRange;
            c.ref;
            var v = vu(c, Rg);
            return w.createElement(
              Y,
              { clipPath: i ? 'url(#clipPath-'.concat(o, ')') : null },
              w.createElement(
                Ze,
                qe({}, W(v, !0), {
                  points: n,
                  connectNulls: f,
                  type: u,
                  baseLine: a,
                  layout: l,
                  stroke: 'none',
                  className: 'recharts-area-area',
                })
              ),
              s !== 'none' &&
                w.createElement(
                  Ze,
                  qe({}, W(this.props, !1), {
                    className: 'recharts-area-curve',
                    layout: l,
                    type: u,
                    connectNulls: f,
                    fill: 'none',
                    points: n,
                  })
                ),
              s !== 'none' &&
                p &&
                w.createElement(
                  Ze,
                  qe({}, W(this.props, !1), {
                    className: 'recharts-area-curve',
                    layout: l,
                    type: u,
                    connectNulls: f,
                    fill: 'none',
                    points: a,
                  })
                )
            );
          },
        },
        {
          key: 'renderAreaWithAnimation',
          value: function (n, a) {
            var i = this,
              o = this.props,
              c = o.points,
              l = o.baseLine,
              u = o.isAnimationActive,
              s = o.animationBegin,
              f = o.animationDuration,
              p = o.animationEasing,
              v = o.animationId,
              h = this.state,
              m = h.prevPoints,
              y = h.prevBaseLine;
            return w.createElement(
              Ne,
              {
                begin: s,
                duration: f,
                isActive: u,
                easing: p,
                from: { t: 0 },
                to: { t: 1 },
                key: 'area-'.concat(v),
                onAnimationEnd: this.handleAnimationEnd,
                onAnimationStart: this.handleAnimationStart,
              },
              function (O) {
                var b = O.t;
                if (m) {
                  var x = m.length / c.length,
                    P = c.map(function (S, j) {
                      var E = Math.floor(j * x);
                      if (m[E]) {
                        var $ = m[E],
                          _ = ae($.x, S.x),
                          k = ae($.y, S.y);
                        return Ce(Ce({}, S), {}, { x: _(b), y: k(b) });
                      }
                      return S;
                    }),
                    d;
                  if (M(l) && typeof l == 'number') {
                    var g = ae(y, l);
                    d = g(b);
                  } else if (H(l) || Ft(l)) {
                    var A = ae(y, 0);
                    d = A(b);
                  } else
                    d = l.map(function (S, j) {
                      var E = Math.floor(j * x);
                      if (y[E]) {
                        var $ = y[E],
                          _ = ae($.x, S.x),
                          k = ae($.y, S.y);
                        return Ce(Ce({}, S), {}, { x: _(b), y: k(b) });
                      }
                      return S;
                    });
                  return i.renderAreaStatically(P, d, n, a);
                }
                return w.createElement(
                  Y,
                  null,
                  w.createElement(
                    'defs',
                    null,
                    w.createElement(
                      'clipPath',
                      { id: 'animationClipPath-'.concat(a) },
                      i.renderClipRect(b)
                    )
                  ),
                  w.createElement(
                    Y,
                    { clipPath: 'url(#animationClipPath-'.concat(a, ')') },
                    i.renderAreaStatically(c, l, n, a)
                  )
                );
              }
            );
          },
        },
        {
          key: 'renderArea',
          value: function (n, a) {
            var i = this.props,
              o = i.points,
              c = i.baseLine,
              l = i.isAnimationActive,
              u = this.state,
              s = u.prevPoints,
              f = u.prevBaseLine,
              p = u.totalLength;
            return l &&
              o &&
              o.length &&
              ((!s && p > 0) || !et(s, o) || !et(f, c))
              ? this.renderAreaWithAnimation(n, a)
              : this.renderAreaStatically(o, c, n, a);
          },
        },
        {
          key: 'render',
          value: function () {
            var n,
              a = this.props,
              i = a.hide,
              o = a.dot,
              c = a.points,
              l = a.className,
              u = a.top,
              s = a.left,
              f = a.xAxis,
              p = a.yAxis,
              v = a.width,
              h = a.height,
              m = a.isAnimationActive,
              y = a.id;
            if (i || !c || !c.length) return null;
            var O = this.state.isAnimationFinished,
              b = c.length === 1,
              x = U('recharts-area', l),
              P = f && f.allowDataOverflow,
              d = p && p.allowDataOverflow,
              g = P || d,
              A = H(y) ? this.id : y,
              S =
                (n = W(o, !1)) !== null && n !== void 0
                  ? n
                  : { r: 3, strokeWidth: 2 },
              j = S.r,
              E = j === void 0 ? 3 : j,
              $ = S.strokeWidth,
              _ = $ === void 0 ? 2 : $,
              k = Xc(o) ? o : {},
              C = k.clipDot,
              I = C === void 0 ? !0 : C,
              D = E * 2 + _;
            return w.createElement(
              Y,
              { className: x },
              P || d
                ? w.createElement(
                    'defs',
                    null,
                    w.createElement(
                      'clipPath',
                      { id: 'clipPath-'.concat(A) },
                      w.createElement('rect', {
                        x: P ? s : s - v / 2,
                        y: d ? u : u - h / 2,
                        width: P ? v : v * 2,
                        height: d ? h : h * 2,
                      })
                    ),
                    !I &&
                      w.createElement(
                        'clipPath',
                        { id: 'clipPath-dots-'.concat(A) },
                        w.createElement('rect', {
                          x: s - D / 2,
                          y: u - D / 2,
                          width: v + D,
                          height: h + D,
                        })
                      )
                  )
                : null,
              b ? null : this.renderArea(g, A),
              (o || b) && this.renderDots(g, I, A),
              (!m || O) && je.renderCallByParent(this.props, c)
            );
          },
        },
      ],
      [
        {
          key: 'getDerivedStateFromProps',
          value: function (n, a) {
            return n.animationId !== a.prevAnimationId
              ? {
                  prevAnimationId: n.animationId,
                  curPoints: n.points,
                  curBaseLine: n.baseLine,
                  prevPoints: a.curPoints,
                  prevBaseLine: a.curBaseLine,
                }
              : n.points !== a.curPoints || n.baseLine !== a.curBaseLine
                ? { curPoints: n.points, curBaseLine: n.baseLine }
                : null;
          },
        },
      ]
    )
  );
})(N.PureComponent);
du = it;
Se(it, 'displayName', 'Area');
Se(it, 'defaultProps', {
  stroke: '#3182bd',
  fill: '#3182bd',
  fillOpacity: 0.6,
  xAxisId: 0,
  yAxisId: 0,
  legendType: 'line',
  connectNulls: !1,
  points: [],
  dot: !1,
  activeDot: !0,
  hide: !1,
  isAnimationActive: !Le.isSsr,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
});
Se(it, 'getBaseValue', function (t, e, r, n) {
  var a = t.layout,
    i = t.baseValue,
    o = e.props.baseValue,
    c = o ?? i;
  if (M(c) && typeof c == 'number') return c;
  var l = a === 'horizontal' ? n : r,
    u = l.scale.domain();
  if (l.type === 'number') {
    var s = Math.max(u[0], u[1]),
      f = Math.min(u[0], u[1]);
    return c === 'dataMin'
      ? f
      : c === 'dataMax' || s < 0
        ? s
        : Math.max(Math.min(u[0], u[1]), 0);
  }
  return c === 'dataMin' ? u[0] : c === 'dataMax' ? u[1] : u[0];
});
Se(it, 'getComposedData', function (t) {
  var e = t.props,
    r = t.item,
    n = t.xAxis,
    a = t.yAxis,
    i = t.xAxisTicks,
    o = t.yAxisTicks,
    c = t.bandSize,
    l = t.dataKey,
    u = t.stackedData,
    s = t.dataStartIndex,
    f = t.displayedData,
    p = t.offset,
    v = e.layout,
    h = u && u.length,
    m = du.getBaseValue(e, r, n, a),
    y = v === 'horizontal',
    O = !1,
    b = f.map(function (P, d) {
      var g;
      h
        ? (g = u[s + d])
        : ((g = te(P, l)), Array.isArray(g) ? (O = !0) : (g = [m, g]));
      var A = g[1] == null || (h && te(P, l) == null);
      return y
        ? {
            x: cn({ axis: n, ticks: i, bandSize: c, entry: P, index: d }),
            y: A ? null : a.scale(g[1]),
            value: g,
            payload: P,
          }
        : {
            x: A ? null : n.scale(g[1]),
            y: cn({ axis: a, ticks: o, bandSize: c, entry: P, index: d }),
            value: g,
            payload: P,
          };
    }),
    x;
  return (
    h || O
      ? (x = b.map(function (P) {
          var d = Array.isArray(P.value) ? P.value[0] : null;
          return y
            ? { x: P.x, y: d != null && P.y != null ? a.scale(d) : null }
            : { x: d != null ? n.scale(d) : null, y: P.y };
        }))
      : (x = y ? a.scale(m) : n.scale(m)),
    Ce({ points: b, baseLine: x, layout: v, isRange: O }, p)
  );
});
Se(it, 'renderDotItem', function (t, e) {
  var r;
  if (w.isValidElement(t)) r = w.cloneElement(t, e);
  else if (V(t)) r = t(e);
  else {
    var n = U('recharts-area-dot', typeof t != 'boolean' ? t.className : ''),
      a = e.key,
      i = vu(e, zg);
    r = w.createElement(Dr, qe({}, i, { key: a, className: n }));
  }
  return r;
});
function Lt(t) {
  '@babel/helpers - typeof';
  return (
    (Lt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Lt(t)
  );
}
function Yg(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function qg(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, bu(n.key), n));
  }
}
function Zg(t, e, r) {
  return (
    e && qg(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function Qg(t, e, r) {
  return (
    (e = $n(e)),
    Jg(
      t,
      mu() ? Reflect.construct(e, r || [], $n(t).constructor) : e.apply(t, r)
    )
  );
}
function Jg(t, e) {
  if (e && (Lt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return eb(t);
}
function eb(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function mu() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (mu = function () {
    return !!t;
  })();
}
function $n(t) {
  return (
    ($n = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    $n(t)
  );
}
function tb(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && ei(t, e));
}
function ei(t, e) {
  return (
    (ei = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    ei(t, e)
  );
}
function gu(t, e, r) {
  return (
    (e = bu(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function bu(t) {
  var e = rb(t, 'string');
  return Lt(e) == 'symbol' ? e : e + '';
}
function rb(t, e) {
  if (Lt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Lt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
function ti() {
  return (
    (ti = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    ti.apply(this, arguments)
  );
}
function nb(t) {
  var e = t.xAxisId,
    r = wi(),
    n = Pi(),
    a = Jl(e);
  return a == null
    ? null
    : w.createElement(
        Xt,
        ti({}, a, {
          className: U(
            'recharts-'.concat(a.axisType, ' ').concat(a.axisType),
            a.className
          ),
          viewBox: { x: 0, y: 0, width: r, height: n },
          ticksGenerator: function (o) {
            return Ie(o, !0);
          },
        })
      );
}
var Mr = (function (t) {
  function e() {
    return (Yg(this, e), Qg(this, e, arguments));
  }
  return (
    tb(e, t),
    Zg(e, [
      {
        key: 'render',
        value: function () {
          return w.createElement(nb, this.props);
        },
      },
    ])
  );
})(w.Component);
gu(Mr, 'displayName', 'XAxis');
gu(Mr, 'defaultProps', {
  allowDecimals: !0,
  hide: !1,
  orientation: 'bottom',
  width: 0,
  height: 30,
  mirror: !1,
  xAxisId: 0,
  tickCount: 5,
  type: 'category',
  padding: { left: 0, right: 0 },
  allowDataOverflow: !1,
  scale: 'auto',
  reversed: !1,
  allowDuplicatedCategory: !0,
});
function Rt(t) {
  '@babel/helpers - typeof';
  return (
    (Rt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Rt(t)
  );
}
function ab(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function ib(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, wu(n.key), n));
  }
}
function ob(t, e, r) {
  return (
    e && ib(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function cb(t, e, r) {
  return (
    (e = _n(e)),
    lb(
      t,
      xu() ? Reflect.construct(e, r || [], _n(t).constructor) : e.apply(t, r)
    )
  );
}
function lb(t, e) {
  if (e && (Rt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return ub(t);
}
function ub(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function xu() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (xu = function () {
    return !!t;
  })();
}
function _n(t) {
  return (
    (_n = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    _n(t)
  );
}
function sb(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && ri(t, e));
}
function ri(t, e) {
  return (
    (ri = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    ri(t, e)
  );
}
function Ou(t, e, r) {
  return (
    (e = wu(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function wu(t) {
  var e = fb(t, 'string');
  return Rt(e) == 'symbol' ? e : e + '';
}
function fb(t, e) {
  if (Rt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Rt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
function ni() {
  return (
    (ni = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    ni.apply(this, arguments)
  );
}
var pb = function (e) {
    var r = e.yAxisId,
      n = wi(),
      a = Pi(),
      i = eu(r);
    return i == null
      ? null
      : w.createElement(
          Xt,
          ni({}, i, {
            className: U(
              'recharts-'.concat(i.axisType, ' ').concat(i.axisType),
              i.className
            ),
            viewBox: { x: 0, y: 0, width: n, height: a },
            ticksGenerator: function (c) {
              return Ie(c, !0);
            },
          })
        );
  },
  Br = (function (t) {
    function e() {
      return (ab(this, e), cb(this, e, arguments));
    }
    return (
      sb(e, t),
      ob(e, [
        {
          key: 'render',
          value: function () {
            return w.createElement(pb, this.props);
          },
        },
      ])
    );
  })(w.Component);
Ou(Br, 'displayName', 'YAxis');
Ou(Br, 'defaultProps', {
  allowDuplicatedCategory: !0,
  allowDecimals: !0,
  hide: !1,
  orientation: 'left',
  width: 60,
  height: 0,
  mirror: !1,
  yAxisId: 0,
  tickCount: 5,
  type: 'number',
  padding: { top: 0, bottom: 0 },
  allowDataOverflow: !1,
  scale: 'auto',
  reversed: !1,
});
function Cc(t) {
  return yb(t) || hb(t) || vb(t) || db();
}
function db() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vb(t, e) {
  if (t) {
    if (typeof t == 'string') return ai(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return ai(t, e);
  }
}
function hb(t) {
  if (
    (typeof Symbol < 'u' && t[Symbol.iterator] != null) ||
    t['@@iterator'] != null
  )
    return Array.from(t);
}
function yb(t) {
  if (Array.isArray(t)) return ai(t);
}
function ai(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
var ii = function (e, r, n, a, i) {
    var o = me(e, Si),
      c = me(e, Vn),
      l = [].concat(Cc(o), Cc(c)),
      u = me(e, Gn),
      s = ''.concat(a, 'Id'),
      f = a[0],
      p = r;
    if (
      (l.length &&
        (p = l.reduce(function (m, y) {
          if (
            y.props[s] === n &&
            Ee(y.props, 'extendDomain') &&
            M(y.props[f])
          ) {
            var O = y.props[f];
            return [Math.min(m[0], O), Math.max(m[1], O)];
          }
          return m;
        }, p)),
      u.length)
    ) {
      var v = ''.concat(f, '1'),
        h = ''.concat(f, '2');
      p = u.reduce(function (m, y) {
        if (
          y.props[s] === n &&
          Ee(y.props, 'extendDomain') &&
          M(y.props[v]) &&
          M(y.props[h])
        ) {
          var O = y.props[v],
            b = y.props[h];
          return [Math.min(m[0], O, b), Math.max(m[1], O, b)];
        }
        return m;
      }, p);
    }
    return (
      i &&
        i.length &&
        (p = i.reduce(function (m, y) {
          return M(y) ? [Math.min(m[0], y), Math.max(m[1], y)] : m;
        }, p)),
      p
    );
  },
  Pu = { exports: {} };
(function (t) {
  var e = Object.prototype.hasOwnProperty,
    r = '~';
  function n() {}
  Object.create &&
    ((n.prototype = Object.create(null)), new n().__proto__ || (r = !1));
  function a(l, u, s) {
    ((this.fn = l), (this.context = u), (this.once = s || !1));
  }
  function i(l, u, s, f, p) {
    if (typeof s != 'function')
      throw new TypeError('The listener must be a function');
    var v = new a(s, f || l, p),
      h = r ? r + u : u;
    return (
      l._events[h]
        ? l._events[h].fn
          ? (l._events[h] = [l._events[h], v])
          : l._events[h].push(v)
        : ((l._events[h] = v), l._eventsCount++),
      l
    );
  }
  function o(l, u) {
    --l._eventsCount === 0 ? (l._events = new n()) : delete l._events[u];
  }
  function c() {
    ((this._events = new n()), (this._eventsCount = 0));
  }
  ((c.prototype.eventNames = function () {
    var u = [],
      s,
      f;
    if (this._eventsCount === 0) return u;
    for (f in (s = this._events)) e.call(s, f) && u.push(r ? f.slice(1) : f);
    return Object.getOwnPropertySymbols
      ? u.concat(Object.getOwnPropertySymbols(s))
      : u;
  }),
    (c.prototype.listeners = function (u) {
      var s = r ? r + u : u,
        f = this._events[s];
      if (!f) return [];
      if (f.fn) return [f.fn];
      for (var p = 0, v = f.length, h = new Array(v); p < v; p++)
        h[p] = f[p].fn;
      return h;
    }),
    (c.prototype.listenerCount = function (u) {
      var s = r ? r + u : u,
        f = this._events[s];
      return f ? (f.fn ? 1 : f.length) : 0;
    }),
    (c.prototype.emit = function (u, s, f, p, v, h) {
      var m = r ? r + u : u;
      if (!this._events[m]) return !1;
      var y = this._events[m],
        O = arguments.length,
        b,
        x;
      if (y.fn) {
        switch ((y.once && this.removeListener(u, y.fn, void 0, !0), O)) {
          case 1:
            return (y.fn.call(y.context), !0);
          case 2:
            return (y.fn.call(y.context, s), !0);
          case 3:
            return (y.fn.call(y.context, s, f), !0);
          case 4:
            return (y.fn.call(y.context, s, f, p), !0);
          case 5:
            return (y.fn.call(y.context, s, f, p, v), !0);
          case 6:
            return (y.fn.call(y.context, s, f, p, v, h), !0);
        }
        for (x = 1, b = new Array(O - 1); x < O; x++) b[x - 1] = arguments[x];
        y.fn.apply(y.context, b);
      } else {
        var P = y.length,
          d;
        for (x = 0; x < P; x++)
          switch (
            (y[x].once && this.removeListener(u, y[x].fn, void 0, !0), O)
          ) {
            case 1:
              y[x].fn.call(y[x].context);
              break;
            case 2:
              y[x].fn.call(y[x].context, s);
              break;
            case 3:
              y[x].fn.call(y[x].context, s, f);
              break;
            case 4:
              y[x].fn.call(y[x].context, s, f, p);
              break;
            default:
              if (!b)
                for (d = 1, b = new Array(O - 1); d < O; d++)
                  b[d - 1] = arguments[d];
              y[x].fn.apply(y[x].context, b);
          }
      }
      return !0;
    }),
    (c.prototype.on = function (u, s, f) {
      return i(this, u, s, f, !1);
    }),
    (c.prototype.once = function (u, s, f) {
      return i(this, u, s, f, !0);
    }),
    (c.prototype.removeListener = function (u, s, f, p) {
      var v = r ? r + u : u;
      if (!this._events[v]) return this;
      if (!s) return (o(this, v), this);
      var h = this._events[v];
      if (h.fn)
        h.fn === s && (!p || h.once) && (!f || h.context === f) && o(this, v);
      else {
        for (var m = 0, y = [], O = h.length; m < O; m++)
          (h[m].fn !== s || (p && !h[m].once) || (f && h[m].context !== f)) &&
            y.push(h[m]);
        y.length ? (this._events[v] = y.length === 1 ? y[0] : y) : o(this, v);
      }
      return this;
    }),
    (c.prototype.removeAllListeners = function (u) {
      var s;
      return (
        u
          ? ((s = r ? r + u : u), this._events[s] && o(this, s))
          : ((this._events = new n()), (this._eventsCount = 0)),
        this
      );
    }),
    (c.prototype.off = c.prototype.removeListener),
    (c.prototype.addListener = c.prototype.on),
    (c.prefixed = r),
    (c.EventEmitter = c),
    (t.exports = c));
})(Pu);
var mb = Pu.exports;
const gb = hs(mb);
var aa = new gb(),
  ia = 'recharts.syncMouseEvents';
function Ir(t) {
  '@babel/helpers - typeof';
  return (
    (Ir =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    Ir(t)
  );
}
function bb(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function xb(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, Au(n.key), n));
  }
}
function Ob(t, e, r) {
  return (
    e && xb(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function oa(t, e, r) {
  return (
    (e = Au(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function Au(t) {
  var e = wb(t, 'string');
  return Ir(e) == 'symbol' ? e : e + '';
}
function wb(t, e) {
  if (Ir(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (Ir(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return String(t);
}
var Pb = (function () {
  function t() {
    (bb(this, t),
      oa(this, 'activeIndex', 0),
      oa(this, 'coordinateList', []),
      oa(this, 'layout', 'horizontal'));
  }
  return Ob(t, [
    {
      key: 'setDetails',
      value: function (r) {
        var n,
          a = r.coordinateList,
          i = a === void 0 ? null : a,
          o = r.container,
          c = o === void 0 ? null : o,
          l = r.layout,
          u = l === void 0 ? null : l,
          s = r.offset,
          f = s === void 0 ? null : s,
          p = r.mouseHandlerCallback,
          v = p === void 0 ? null : p;
        ((this.coordinateList =
          (n = i ?? this.coordinateList) !== null && n !== void 0 ? n : []),
          (this.container = c ?? this.container),
          (this.layout = u ?? this.layout),
          (this.offset = f ?? this.offset),
          (this.mouseHandlerCallback = v ?? this.mouseHandlerCallback),
          (this.activeIndex = Math.min(
            Math.max(this.activeIndex, 0),
            this.coordinateList.length - 1
          )));
      },
    },
    {
      key: 'focus',
      value: function () {
        this.spoofMouse();
      },
    },
    {
      key: 'keyboardEvent',
      value: function (r) {
        if (this.coordinateList.length !== 0)
          switch (r.key) {
            case 'ArrowRight': {
              if (this.layout !== 'horizontal') return;
              ((this.activeIndex = Math.min(
                this.activeIndex + 1,
                this.coordinateList.length - 1
              )),
                this.spoofMouse());
              break;
            }
            case 'ArrowLeft': {
              if (this.layout !== 'horizontal') return;
              ((this.activeIndex = Math.max(this.activeIndex - 1, 0)),
                this.spoofMouse());
              break;
            }
          }
      },
    },
    {
      key: 'setIndex',
      value: function (r) {
        this.activeIndex = r;
      },
    },
    {
      key: 'spoofMouse',
      value: function () {
        var r, n;
        if (this.layout === 'horizontal' && this.coordinateList.length !== 0) {
          var a = this.container.getBoundingClientRect(),
            i = a.x,
            o = a.y,
            c = a.height,
            l = this.coordinateList[this.activeIndex].coordinate,
            u =
              ((r = window) === null || r === void 0 ? void 0 : r.scrollX) || 0,
            s =
              ((n = window) === null || n === void 0 ? void 0 : n.scrollY) || 0,
            f = i + l + u,
            p = o + this.offset.top + c / 2 + s;
          this.mouseHandlerCallback({ pageX: f, pageY: p });
        }
      },
    },
  ]);
})();
function Ab(t, e, r) {
  if (r === 'number' && e === !0 && Array.isArray(t)) {
    var n = t?.[0],
      a = t?.[1];
    if (n && a && M(n) && M(a)) return !0;
  }
  return !1;
}
function Sb(t, e, r, n) {
  var a = n / 2;
  return {
    stroke: 'none',
    fill: '#ccc',
    x: t === 'horizontal' ? e.x - a : r.left + 0.5,
    y: t === 'horizontal' ? r.top + 0.5 : e.y - a,
    width: t === 'horizontal' ? n : r.width - 1,
    height: t === 'horizontal' ? r.height - 1 : n,
  };
}
function Su(t) {
  var e = t.cx,
    r = t.cy,
    n = t.radius,
    a = t.startAngle,
    i = t.endAngle,
    o = Q(e, r, n, a),
    c = Q(e, r, n, i);
  return {
    points: [o, c],
    cx: e,
    cy: r,
    radius: n,
    startAngle: a,
    endAngle: i,
  };
}
function jb(t, e, r) {
  var n, a, i, o;
  if (t === 'horizontal')
    ((n = e.x), (i = n), (a = r.top), (o = r.top + r.height));
  else if (t === 'vertical')
    ((a = e.y), (o = a), (n = r.left), (i = r.left + r.width));
  else if (e.cx != null && e.cy != null)
    if (t === 'centric') {
      var c = e.cx,
        l = e.cy,
        u = e.innerRadius,
        s = e.outerRadius,
        f = e.angle,
        p = Q(c, l, u, f),
        v = Q(c, l, s, f);
      ((n = p.x), (a = p.y), (i = v.x), (o = v.y));
    } else return Su(e);
  return [
    { x: n, y: a },
    { x: i, y: o },
  ];
}
function kr(t) {
  '@babel/helpers - typeof';
  return (
    (kr =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    kr(t)
  );
}
function Dc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function Gr(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Dc(Object(r), !0).forEach(function (n) {
          Eb(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Dc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function Eb(t, e, r) {
  return (
    (e = $b(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function $b(t) {
  var e = _b(t, 'string');
  return kr(e) == 'symbol' ? e : e + '';
}
function _b(t, e) {
  if (kr(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (kr(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
function Tb(t) {
  var e,
    r,
    n = t.element,
    a = t.tooltipEventType,
    i = t.isActive,
    o = t.activeCoordinate,
    c = t.activePayload,
    l = t.offset,
    u = t.activeTooltipIndex,
    s = t.tooltipAxisBandSize,
    f = t.layout,
    p = t.chartName,
    v =
      (e = n.props.cursor) !== null && e !== void 0
        ? e
        : (r = n.type.defaultProps) === null || r === void 0
          ? void 0
          : r.cursor;
  if (!n || !v || !i || !o || (p !== 'ScatterChart' && a !== 'axis'))
    return null;
  var h,
    m = Ze;
  if (p === 'ScatterChart') ((h = o), (m = Ah));
  else if (p === 'BarChart') ((h = Sb(f, o, l, s)), (m = mi));
  else if (f === 'radial') {
    var y = Su(o),
      O = y.cx,
      b = y.cy,
      x = y.radius,
      P = y.startAngle,
      d = y.endAngle;
    ((h = {
      cx: O,
      cy: b,
      startAngle: P,
      endAngle: d,
      innerRadius: x,
      outerRadius: x,
    }),
      (m = Il));
  } else ((h = { points: jb(f, o, l) }), (m = Ze));
  var g = Gr(
    Gr(Gr(Gr({ stroke: '#ccc', pointerEvents: 'none' }, l), h), W(v, !1)),
    {},
    {
      payload: c,
      payloadIndex: u,
      className: U('recharts-tooltip-cursor', v.className),
    }
  );
  return N.isValidElement(v) ? N.cloneElement(v, g) : N.createElement(m, g);
}
var Ib = ['item'],
  kb = [
    'children',
    'className',
    'width',
    'height',
    'style',
    'compact',
    'title',
    'desc',
  ];
function zt(t) {
  '@babel/helpers - typeof';
  return (
    (zt =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == 'function' &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? 'symbol'
              : typeof e;
          }),
    zt(t)
  );
}
function mt() {
  return (
    (mt = Object.assign
      ? Object.assign.bind()
      : function (t) {
          for (var e = 1; e < arguments.length; e++) {
            var r = arguments[e];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (t[n] = r[n]);
          }
          return t;
        }),
    mt.apply(this, arguments)
  );
}
function Mc(t, e) {
  return Mb(t) || Db(t, e) || Eu(t, e) || Cb();
}
function Cb() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Db(t, e) {
  var r =
    t == null
      ? null
      : (typeof Symbol < 'u' && t[Symbol.iterator]) || t['@@iterator'];
  if (r != null) {
    var n,
      a,
      i,
      o,
      c = [],
      l = !0,
      u = !1;
    try {
      if (((i = (r = r.call(t)).next), e !== 0))
        for (
          ;
          !(l = (n = i.call(r)).done) && (c.push(n.value), c.length !== e);
          l = !0
        );
    } catch (s) {
      ((u = !0), (a = s));
    } finally {
      try {
        if (!l && r.return != null && ((o = r.return()), Object(o) !== o))
          return;
      } finally {
        if (u) throw a;
      }
    }
    return c;
  }
}
function Mb(t) {
  if (Array.isArray(t)) return t;
}
function Bc(t, e) {
  if (t == null) return {};
  var r = Bb(t, e),
    n,
    a;
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (a = 0; a < i.length; a++)
      ((n = i[a]),
        !(e.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(t, n) &&
          (r[n] = t[n]));
  }
  return r;
}
function Bb(t, e) {
  if (t == null) return {};
  var r = {};
  for (var n in t)
    if (Object.prototype.hasOwnProperty.call(t, n)) {
      if (e.indexOf(n) >= 0) continue;
      r[n] = t[n];
    }
  return r;
}
function Nb(t, e) {
  if (!(t instanceof e))
    throw new TypeError('Cannot call a class as a function');
}
function Lb(t, e) {
  for (var r = 0; r < e.length; r++) {
    var n = e[r];
    ((n.enumerable = n.enumerable || !1),
      (n.configurable = !0),
      'value' in n && (n.writable = !0),
      Object.defineProperty(t, $u(n.key), n));
  }
}
function Rb(t, e, r) {
  return (
    e && Lb(t.prototype, e),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    t
  );
}
function zb(t, e, r) {
  return (
    (e = Tn(e)),
    Wb(
      t,
      ju() ? Reflect.construct(e, r || [], Tn(t).constructor) : e.apply(t, r)
    )
  );
}
function Wb(t, e) {
  if (e && (zt(e) === 'object' || typeof e == 'function')) return e;
  if (e !== void 0)
    throw new TypeError(
      'Derived constructors may only return object or undefined'
    );
  return Fb(t);
}
function Fb(t) {
  if (t === void 0)
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  return t;
}
function ju() {
  try {
    var t = !Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
  } catch {}
  return (ju = function () {
    return !!t;
  })();
}
function Tn(t) {
  return (
    (Tn = Object.setPrototypeOf
      ? Object.getPrototypeOf.bind()
      : function (r) {
          return r.__proto__ || Object.getPrototypeOf(r);
        }),
    Tn(t)
  );
}
function Kb(t, e) {
  if (typeof e != 'function' && e !== null)
    throw new TypeError('Super expression must either be null or a function');
  ((t.prototype = Object.create(e && e.prototype, {
    constructor: { value: t, writable: !0, configurable: !0 },
  })),
    Object.defineProperty(t, 'prototype', { writable: !1 }),
    e && oi(t, e));
}
function oi(t, e) {
  return (
    (oi = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (n, a) {
          return ((n.__proto__ = a), n);
        }),
    oi(t, e)
  );
}
function Wt(t) {
  return Gb(t) || Xb(t) || Eu(t) || Vb();
}
function Vb() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Eu(t, e) {
  if (t) {
    if (typeof t == 'string') return ci(t, e);
    var r = Object.prototype.toString.call(t).slice(8, -1);
    if (
      (r === 'Object' && t.constructor && (r = t.constructor.name),
      r === 'Map' || r === 'Set')
    )
      return Array.from(t);
    if (r === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
      return ci(t, e);
  }
}
function Xb(t) {
  if (
    (typeof Symbol < 'u' && t[Symbol.iterator] != null) ||
    t['@@iterator'] != null
  )
    return Array.from(t);
}
function Gb(t) {
  if (Array.isArray(t)) return ci(t);
}
function ci(t, e) {
  (e == null || e > t.length) && (e = t.length);
  for (var r = 0, n = new Array(e); r < e; r++) n[r] = t[r];
  return n;
}
function Nc(t, e) {
  var r = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(t);
    (e &&
      (n = n.filter(function (a) {
        return Object.getOwnPropertyDescriptor(t, a).enumerable;
      })),
      r.push.apply(r, n));
  }
  return r;
}
function T(t) {
  for (var e = 1; e < arguments.length; e++) {
    var r = arguments[e] != null ? arguments[e] : {};
    e % 2
      ? Nc(Object(r), !0).forEach(function (n) {
          K(t, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(r))
        : Nc(Object(r)).forEach(function (n) {
            Object.defineProperty(t, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return t;
}
function K(t, e, r) {
  return (
    (e = $u(e)),
    e in t
      ? Object.defineProperty(t, e, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (t[e] = r),
    t
  );
}
function $u(t) {
  var e = Hb(t, 'string');
  return zt(e) == 'symbol' ? e : e + '';
}
function Hb(t, e) {
  if (zt(t) != 'object' || !t) return t;
  var r = t[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(t, e);
    if (zt(n) != 'object') return n;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }
  return (e === 'string' ? String : Number)(t);
}
var Ub = { xAxis: ['bottom', 'top'], yAxis: ['left', 'right'] },
  Yb = { width: '100%', height: '100%' },
  _u = { x: 0, y: 0 };
function Hr(t) {
  return t;
}
var qb = function (e, r) {
    return r === 'horizontal'
      ? e.x
      : r === 'vertical'
        ? e.y
        : r === 'centric'
          ? e.angle
          : e.radius;
  },
  Zb = function (e, r, n, a) {
    var i = r.find(function (s) {
      return s && s.index === n;
    });
    if (i) {
      if (e === 'horizontal') return { x: i.coordinate, y: a.y };
      if (e === 'vertical') return { x: a.x, y: i.coordinate };
      if (e === 'centric') {
        var o = i.coordinate,
          c = a.radius;
        return T(T(T({}, a), Q(a.cx, a.cy, c, o)), {}, { angle: o, radius: c });
      }
      var l = i.coordinate,
        u = a.angle;
      return T(T(T({}, a), Q(a.cx, a.cy, l, u)), {}, { angle: u, radius: l });
    }
    return _u;
  },
  Un = function (e, r) {
    var n = r.graphicalItems,
      a = r.dataStartIndex,
      i = r.dataEndIndex,
      o = (n ?? []).reduce(function (c, l) {
        var u = l.props.data;
        return u && u.length ? [].concat(Wt(c), Wt(u)) : c;
      }, []);
    return o.length > 0
      ? o
      : e && e.length && M(a) && M(i)
        ? e.slice(a, i + 1)
        : [];
  };
function Tu(t) {
  return t === 'number' ? [0, 'auto'] : void 0;
}
var li = function (e, r, n, a) {
    var i = e.graphicalItems,
      o = e.tooltipAxis,
      c = Un(r, e);
    return n < 0 || !i || !i.length || n >= c.length
      ? null
      : i.reduce(function (l, u) {
          var s,
            f = (s = u.props.data) !== null && s !== void 0 ? s : r;
          f &&
            e.dataStartIndex + e.dataEndIndex !== 0 &&
            e.dataEndIndex - e.dataStartIndex >= n &&
            (f = f.slice(e.dataStartIndex, e.dataEndIndex + 1));
          var p;
          if (o.dataKey && !o.allowDuplicatedCategory) {
            var v = f === void 0 ? c : f;
            p = Zr(v, o.dataKey, a);
          } else p = (f && f[n]) || c[n];
          return p ? [].concat(Wt(l), [Sl(u, p)]) : l;
        }, []);
  },
  Lc = function (e, r, n, a) {
    var i = a || { x: e.chartX, y: e.chartY },
      o = qb(i, n),
      c = e.orderedTooltipTicks,
      l = e.tooltipAxis,
      u = e.tooltipTicks,
      s = Id(o, c, u, l);
    if (s >= 0 && u) {
      var f = u[s] && u[s].value,
        p = li(e, r, s, f),
        v = Zb(n, c, s, i);
      return {
        activeTooltipIndex: s,
        activeLabel: f,
        activePayload: p,
        activeCoordinate: v,
      };
    }
    return null;
  },
  Qb = function (e, r) {
    var n = r.axes,
      a = r.graphicalItems,
      i = r.axisType,
      o = r.axisIdKey,
      c = r.stackGroups,
      l = r.dataStartIndex,
      u = r.dataEndIndex,
      s = e.layout,
      f = e.children,
      p = e.stackOffset,
      v = bl(s, i);
    return n.reduce(function (h, m) {
      var y,
        O =
          m.type.defaultProps !== void 0
            ? T(T({}, m.type.defaultProps), m.props)
            : m.props,
        b = O.type,
        x = O.dataKey,
        P = O.allowDataOverflow,
        d = O.allowDuplicatedCategory,
        g = O.scale,
        A = O.ticks,
        S = O.includeHidden,
        j = O[o];
      if (h[j]) return h;
      var E = Un(e.data, {
          graphicalItems: a.filter(function (R) {
            var G,
              J =
                o in R.props
                  ? R.props[o]
                  : (G = R.type.defaultProps) === null || G === void 0
                    ? void 0
                    : G[o];
            return J === j;
          }),
          dataStartIndex: l,
          dataEndIndex: u,
        }),
        $ = E.length,
        _,
        k,
        C;
      Ab(O.domain, P, b) &&
        ((_ = Ta(O.domain, null, P)),
        v && (b === 'number' || g !== 'auto') && (C = rr(E, x, 'category')));
      var I = Tu(b);
      if (!_ || _.length === 0) {
        var D,
          B = (D = O.domain) !== null && D !== void 0 ? D : I;
        if (x) {
          if (((_ = rr(E, x, b)), b === 'category' && v)) {
            var L = ms(_);
            d && L
              ? ((k = _), (_ = qr(0, $)))
              : d ||
                (_ = So(B, _, m).reduce(function (R, G) {
                  return R.indexOf(G) >= 0 ? R : [].concat(Wt(R), [G]);
                }, []));
          } else if (b === 'category')
            d
              ? (_ = _.filter(function (R) {
                  return R !== '' && !H(R);
                }))
              : (_ = So(B, _, m).reduce(function (R, G) {
                  return R.indexOf(G) >= 0 || G === '' || H(G)
                    ? R
                    : [].concat(Wt(R), [G]);
                }, []));
          else if (b === 'number') {
            var z = Bd(
              E,
              a.filter(function (R) {
                var G,
                  J,
                  oe =
                    o in R.props
                      ? R.props[o]
                      : (G = R.type.defaultProps) === null || G === void 0
                        ? void 0
                        : G[o],
                  xe =
                    'hide' in R.props
                      ? R.props.hide
                      : (J = R.type.defaultProps) === null || J === void 0
                        ? void 0
                        : J.hide;
                return oe === j && (S || !xe);
              }),
              x,
              i,
              s
            );
            z && (_ = z);
          }
          v && (b === 'number' || g !== 'auto') && (C = rr(E, x, 'category'));
        } else
          v
            ? (_ = qr(0, $))
            : c && c[j] && c[j].hasStack && b === 'number'
              ? (_ = p === 'expand' ? [0, 1] : Al(c[j].stackGroups, l, u))
              : (_ = gl(
                  E,
                  a.filter(function (R) {
                    var G = o in R.props ? R.props[o] : R.type.defaultProps[o],
                      J =
                        'hide' in R.props
                          ? R.props.hide
                          : R.type.defaultProps.hide;
                    return G === j && (S || !J);
                  }),
                  b,
                  s,
                  !0
                ));
        if (b === 'number') ((_ = ii(f, _, j, i, A)), B && (_ = Ta(B, _, P)));
        else if (b === 'category' && B) {
          var F = B,
            X = _.every(function (R) {
              return F.indexOf(R) >= 0;
            });
          X && (_ = F);
        }
      }
      return T(
        T({}, h),
        {},
        K(
          {},
          j,
          T(
            T({}, O),
            {},
            {
              axisType: i,
              domain: _,
              categoricalDomain: C,
              duplicateDomain: k,
              originalDomain: (y = O.domain) !== null && y !== void 0 ? y : I,
              isCategorical: v,
              layout: s,
            }
          )
        )
      );
    }, {});
  },
  Jb = function (e, r) {
    var n = r.graphicalItems,
      a = r.Axis,
      i = r.axisType,
      o = r.axisIdKey,
      c = r.stackGroups,
      l = r.dataStartIndex,
      u = r.dataEndIndex,
      s = e.layout,
      f = e.children,
      p = Un(e.data, { graphicalItems: n, dataStartIndex: l, dataEndIndex: u }),
      v = p.length,
      h = bl(s, i),
      m = -1;
    return n.reduce(function (y, O) {
      var b =
          O.type.defaultProps !== void 0
            ? T(T({}, O.type.defaultProps), O.props)
            : O.props,
        x = b[o],
        P = Tu('number');
      if (!y[x]) {
        m++;
        var d;
        return (
          h
            ? (d = qr(0, v))
            : c && c[x] && c[x].hasStack
              ? ((d = Al(c[x].stackGroups, l, u)), (d = ii(f, d, x, i)))
              : ((d = Ta(
                  P,
                  gl(
                    p,
                    n.filter(function (g) {
                      var A,
                        S,
                        j =
                          o in g.props
                            ? g.props[o]
                            : (A = g.type.defaultProps) === null || A === void 0
                              ? void 0
                              : A[o],
                        E =
                          'hide' in g.props
                            ? g.props.hide
                            : (S = g.type.defaultProps) === null || S === void 0
                              ? void 0
                              : S.hide;
                      return j === x && !E;
                    }),
                    'number',
                    s
                  ),
                  a.defaultProps.allowDataOverflow
                )),
                (d = ii(f, d, x, i))),
          T(
            T({}, y),
            {},
            K(
              {},
              x,
              T(
                T({ axisType: i }, a.defaultProps),
                {},
                {
                  hide: !0,
                  orientation: ye(Ub, ''.concat(i, '.').concat(m % 2), null),
                  domain: d,
                  originalDomain: P,
                  isCategorical: h,
                  layout: s,
                }
              )
            )
          )
        );
      }
      return y;
    }, {});
  },
  ex = function (e, r) {
    var n = r.axisType,
      a = n === void 0 ? 'xAxis' : n,
      i = r.AxisComp,
      o = r.graphicalItems,
      c = r.stackGroups,
      l = r.dataStartIndex,
      u = r.dataEndIndex,
      s = e.children,
      f = ''.concat(a, 'Id'),
      p = me(s, i),
      v = {};
    return (
      p && p.length
        ? (v = Qb(e, {
            axes: p,
            graphicalItems: o,
            axisType: a,
            axisIdKey: f,
            stackGroups: c,
            dataStartIndex: l,
            dataEndIndex: u,
          }))
        : o &&
          o.length &&
          (v = Jb(e, {
            Axis: i,
            graphicalItems: o,
            axisType: a,
            axisIdKey: f,
            stackGroups: c,
            dataStartIndex: l,
            dataEndIndex: u,
          })),
      v
    );
  },
  tx = function (e) {
    var r = De(e),
      n = Ie(r, !1, !0);
    return {
      tooltipTicks: n,
      orderedTooltipTicks: ui(n, function (a) {
        return a.coordinate;
      }),
      tooltipAxis: r,
      tooltipAxisBandSize: ln(r, n),
    };
  },
  Rc = function (e) {
    var r = e.children,
      n = e.defaultShowTooltip,
      a = he(r, Tt),
      i = 0,
      o = 0;
    return (
      e.data && e.data.length !== 0 && (o = e.data.length - 1),
      a &&
        a.props &&
        (a.props.startIndex >= 0 && (i = a.props.startIndex),
        a.props.endIndex >= 0 && (o = a.props.endIndex)),
      {
        chartX: 0,
        chartY: 0,
        dataStartIndex: i,
        dataEndIndex: o,
        activeTooltipIndex: -1,
        isTooltipActive: !!n,
      }
    );
  },
  rx = function (e) {
    return !e || !e.length
      ? !1
      : e.some(function (r) {
          var n = ke(r && r.type);
          return n && n.indexOf('Bar') >= 0;
        });
  },
  zc = function (e) {
    return e === 'horizontal'
      ? { numericAxisName: 'yAxis', cateAxisName: 'xAxis' }
      : e === 'vertical'
        ? { numericAxisName: 'xAxis', cateAxisName: 'yAxis' }
        : e === 'centric'
          ? { numericAxisName: 'radiusAxis', cateAxisName: 'angleAxis' }
          : { numericAxisName: 'angleAxis', cateAxisName: 'radiusAxis' };
  },
  nx = function (e, r) {
    var n = e.props,
      a = e.graphicalItems,
      i = e.xAxisMap,
      o = i === void 0 ? {} : i,
      c = e.yAxisMap,
      l = c === void 0 ? {} : c,
      u = n.width,
      s = n.height,
      f = n.children,
      p = n.margin || {},
      v = he(f, Tt),
      h = he(f, bt),
      m = Object.keys(l).reduce(
        function (d, g) {
          var A = l[g],
            S = A.orientation;
          return !A.mirror && !A.hide
            ? T(T({}, d), {}, K({}, S, d[S] + A.width))
            : d;
        },
        { left: p.left || 0, right: p.right || 0 }
      ),
      y = Object.keys(o).reduce(
        function (d, g) {
          var A = o[g],
            S = A.orientation;
          return !A.mirror && !A.hide
            ? T(T({}, d), {}, K({}, S, ye(d, ''.concat(S)) + A.height))
            : d;
        },
        { top: p.top || 0, bottom: p.bottom || 0 }
      ),
      O = T(T({}, y), m),
      b = O.bottom;
    (v && (O.bottom += v.props.height || Tt.defaultProps.height),
      h && r && (O = Dd(O, a, n, r)));
    var x = u - O.left - O.right,
      P = s - O.top - O.bottom;
    return T(
      T({ brushBottom: b }, O),
      {},
      { width: Math.max(x, 0), height: Math.max(P, 0) }
    );
  },
  ax = function (e, r) {
    if (r === 'xAxis') return e[r].width;
    if (r === 'yAxis') return e[r].height;
  },
  Yn = function (e) {
    var r = e.chartName,
      n = e.GraphicalChild,
      a = e.defaultTooltipEventType,
      i = a === void 0 ? 'axis' : a,
      o = e.validateTooltipEventTypes,
      c = o === void 0 ? ['axis'] : o,
      l = e.axisComponents,
      u = e.legendContent,
      s = e.formatAxisMap,
      f = e.defaultProps,
      p = function (O, b) {
        var x = b.graphicalItems,
          P = b.stackGroups,
          d = b.offset,
          g = b.updateId,
          A = b.dataStartIndex,
          S = b.dataEndIndex,
          j = O.barSize,
          E = O.layout,
          $ = O.barGap,
          _ = O.barCategoryGap,
          k = O.maxBarSize,
          C = zc(E),
          I = C.numericAxisName,
          D = C.cateAxisName,
          B = rx(x),
          L = [];
        return (
          x.forEach(function (z, F) {
            var X = Un(O.data, {
                graphicalItems: [z],
                dataStartIndex: A,
                dataEndIndex: S,
              }),
              R =
                z.type.defaultProps !== void 0
                  ? T(T({}, z.type.defaultProps), z.props)
                  : z.props,
              G = R.dataKey,
              J = R.maxBarSize,
              oe = R[''.concat(I, 'Id')],
              xe = R[''.concat(D, 'Id')],
              Gt = {},
              ge = l.reduce(function (Fe, Ke) {
                var qn = b[''.concat(Ke.axisType, 'Map')],
                  $i = R[''.concat(Ke.axisType, 'Id')];
                (qn && qn[$i]) || Ke.axisType === 'zAxis' || Je();
                var _i = qn[$i];
                return T(
                  T({}, Fe),
                  {},
                  K(
                    K({}, Ke.axisType, _i),
                    ''.concat(Ke.axisType, 'Ticks'),
                    Ie(_i)
                  )
                );
              }, Gt),
              ze = ge[D],
              Nr = ge[''.concat(D, 'Ticks')],
              ot = P && P[oe] && P[oe].hasStack && Xd(z, P[oe].stackGroups),
              Ht = ke(z.type).indexOf('Bar') >= 0,
              We = ln(ze, Nr),
              ct = [],
              Ut =
                B && kd({ barSize: j, stackGroups: P, totalSize: ax(ge, D) });
            if (Ht) {
              var Yt,
                lt,
                qt = H(J) ? k : J,
                ut =
                  (Yt =
                    (lt = ln(ze, Nr, !0)) !== null && lt !== void 0
                      ? lt
                      : qt) !== null && Yt !== void 0
                    ? Yt
                    : 0;
              ((ct = Cd({
                barGap: $,
                barCategoryGap: _,
                bandSize: ut !== We ? ut : We,
                sizeList: Ut[xe],
                maxBarSize: qt,
              })),
                ut !== We &&
                  (ct = ct.map(function (Fe) {
                    return T(
                      T({}, Fe),
                      {},
                      {
                        position: T(
                          T({}, Fe.position),
                          {},
                          { offset: Fe.position.offset - ut / 2 }
                        ),
                      }
                    );
                  })));
            }
            var Lr = z && z.type && z.type.getComposedData;
            Lr &&
              L.push({
                props: T(
                  T(
                    {},
                    Lr(
                      T(
                        T({}, ge),
                        {},
                        {
                          displayedData: X,
                          props: O,
                          dataKey: G,
                          item: z,
                          bandSize: We,
                          barPosition: ct,
                          offset: d,
                          stackedData: ot,
                          layout: E,
                          dataStartIndex: A,
                          dataEndIndex: S,
                        }
                      )
                    )
                  ),
                  {},
                  K(
                    K(
                      K({ key: z.key || 'item-'.concat(F) }, I, ge[I]),
                      D,
                      ge[D]
                    ),
                    'animationId',
                    g
                  )
                ),
                childIndex: _s(z, O.children),
                item: z,
              });
          }),
          L
        );
      },
      v = function (O, b) {
        var x = O.props,
          P = O.dataStartIndex,
          d = O.dataEndIndex,
          g = O.updateId;
        if (!Li({ props: x })) return null;
        var A = x.children,
          S = x.layout,
          j = x.stackOffset,
          E = x.data,
          $ = x.reverseStackOrder,
          _ = zc(S),
          k = _.numericAxisName,
          C = _.cateAxisName,
          I = me(A, n),
          D = Kd(E, I, ''.concat(k, 'Id'), ''.concat(C, 'Id'), j, $),
          B = l.reduce(function (R, G) {
            var J = ''.concat(G.axisType, 'Map');
            return T(
              T({}, R),
              {},
              K(
                {},
                J,
                ex(
                  x,
                  T(
                    T({}, G),
                    {},
                    {
                      graphicalItems: I,
                      stackGroups: G.axisType === k && D,
                      dataStartIndex: P,
                      dataEndIndex: d,
                    }
                  )
                )
              )
            );
          }, {}),
          L = nx(
            T(T({}, B), {}, { props: x, graphicalItems: I }),
            b?.legendBBox
          );
        Object.keys(B).forEach(function (R) {
          B[R] = s(x, B[R], L, R.replace('Map', ''), r);
        });
        var z = B[''.concat(C, 'Map')],
          F = tx(z),
          X = p(
            x,
            T(
              T({}, B),
              {},
              {
                dataStartIndex: P,
                dataEndIndex: d,
                updateId: g,
                graphicalItems: I,
                stackGroups: D,
                offset: L,
              }
            )
          );
        return T(
          T(
            {
              formattedGraphicalItems: X,
              graphicalItems: I,
              offset: L,
              stackGroups: D,
            },
            F
          ),
          B
        );
      },
      h = (function (y) {
        function O(b) {
          var x, P, d;
          return (
            Nb(this, O),
            (d = zb(this, O, [b])),
            K(d, 'eventEmitterSymbol', Symbol('rechartsEventEmitter')),
            K(d, 'accessibilityManager', new Pb()),
            K(d, 'handleLegendBBoxUpdate', function (g) {
              if (g) {
                var A = d.state,
                  S = A.dataStartIndex,
                  j = A.dataEndIndex,
                  E = A.updateId;
                d.setState(
                  T(
                    { legendBBox: g },
                    v(
                      {
                        props: d.props,
                        dataStartIndex: S,
                        dataEndIndex: j,
                        updateId: E,
                      },
                      T(T({}, d.state), {}, { legendBBox: g })
                    )
                  )
                );
              }
            }),
            K(d, 'handleReceiveSyncEvent', function (g, A, S) {
              if (d.props.syncId === g) {
                if (
                  S === d.eventEmitterSymbol &&
                  typeof d.props.syncMethod != 'function'
                )
                  return;
                d.applySyncEvent(A);
              }
            }),
            K(d, 'handleBrushChange', function (g) {
              var A = g.startIndex,
                S = g.endIndex;
              if (A !== d.state.dataStartIndex || S !== d.state.dataEndIndex) {
                var j = d.state.updateId;
                (d.setState(function () {
                  return T(
                    { dataStartIndex: A, dataEndIndex: S },
                    v(
                      {
                        props: d.props,
                        dataStartIndex: A,
                        dataEndIndex: S,
                        updateId: j,
                      },
                      d.state
                    )
                  );
                }),
                  d.triggerSyncEvent({ dataStartIndex: A, dataEndIndex: S }));
              }
            }),
            K(d, 'handleMouseEnter', function (g) {
              var A = d.getMouseInfo(g);
              if (A) {
                var S = T(T({}, A), {}, { isTooltipActive: !0 });
                (d.setState(S), d.triggerSyncEvent(S));
                var j = d.props.onMouseEnter;
                V(j) && j(S, g);
              }
            }),
            K(d, 'triggeredAfterMouseMove', function (g) {
              var A = d.getMouseInfo(g),
                S = A
                  ? T(T({}, A), {}, { isTooltipActive: !0 })
                  : { isTooltipActive: !1 };
              (d.setState(S), d.triggerSyncEvent(S));
              var j = d.props.onMouseMove;
              V(j) && j(S, g);
            }),
            K(d, 'handleItemMouseEnter', function (g) {
              d.setState(function () {
                return {
                  isTooltipActive: !0,
                  activeItem: g,
                  activePayload: g.tooltipPayload,
                  activeCoordinate: g.tooltipPosition || { x: g.cx, y: g.cy },
                };
              });
            }),
            K(d, 'handleItemMouseLeave', function () {
              d.setState(function () {
                return { isTooltipActive: !1 };
              });
            }),
            K(d, 'handleMouseMove', function (g) {
              (g.persist(), d.throttleTriggeredAfterMouseMove(g));
            }),
            K(d, 'handleMouseLeave', function (g) {
              d.throttleTriggeredAfterMouseMove.cancel();
              var A = { isTooltipActive: !1 };
              (d.setState(A), d.triggerSyncEvent(A));
              var S = d.props.onMouseLeave;
              V(S) && S(A, g);
            }),
            K(d, 'handleOuterEvent', function (g) {
              var A = $s(g),
                S = ye(d.props, ''.concat(A));
              if (A && V(S)) {
                var j, E;
                (/.*touch.*/i.test(A)
                  ? (E = d.getMouseInfo(g.changedTouches[0]))
                  : (E = d.getMouseInfo(g)),
                  S((j = E) !== null && j !== void 0 ? j : {}, g));
              }
            }),
            K(d, 'handleClick', function (g) {
              var A = d.getMouseInfo(g);
              if (A) {
                var S = T(T({}, A), {}, { isTooltipActive: !0 });
                (d.setState(S), d.triggerSyncEvent(S));
                var j = d.props.onClick;
                V(j) && j(S, g);
              }
            }),
            K(d, 'handleMouseDown', function (g) {
              var A = d.props.onMouseDown;
              if (V(A)) {
                var S = d.getMouseInfo(g);
                A(S, g);
              }
            }),
            K(d, 'handleMouseUp', function (g) {
              var A = d.props.onMouseUp;
              if (V(A)) {
                var S = d.getMouseInfo(g);
                A(S, g);
              }
            }),
            K(d, 'handleTouchMove', function (g) {
              g.changedTouches != null &&
                g.changedTouches.length > 0 &&
                d.throttleTriggeredAfterMouseMove(g.changedTouches[0]);
            }),
            K(d, 'handleTouchStart', function (g) {
              g.changedTouches != null &&
                g.changedTouches.length > 0 &&
                d.handleMouseDown(g.changedTouches[0]);
            }),
            K(d, 'handleTouchEnd', function (g) {
              g.changedTouches != null &&
                g.changedTouches.length > 0 &&
                d.handleMouseUp(g.changedTouches[0]);
            }),
            K(d, 'handleDoubleClick', function (g) {
              var A = d.props.onDoubleClick;
              if (V(A)) {
                var S = d.getMouseInfo(g);
                A(S, g);
              }
            }),
            K(d, 'handleContextMenu', function (g) {
              var A = d.props.onContextMenu;
              if (V(A)) {
                var S = d.getMouseInfo(g);
                A(S, g);
              }
            }),
            K(d, 'triggerSyncEvent', function (g) {
              d.props.syncId !== void 0 &&
                aa.emit(ia, d.props.syncId, g, d.eventEmitterSymbol);
            }),
            K(d, 'applySyncEvent', function (g) {
              var A = d.props,
                S = A.layout,
                j = A.syncMethod,
                E = d.state.updateId,
                $ = g.dataStartIndex,
                _ = g.dataEndIndex;
              if (g.dataStartIndex !== void 0 || g.dataEndIndex !== void 0)
                d.setState(
                  T(
                    { dataStartIndex: $, dataEndIndex: _ },
                    v(
                      {
                        props: d.props,
                        dataStartIndex: $,
                        dataEndIndex: _,
                        updateId: E,
                      },
                      d.state
                    )
                  )
                );
              else if (g.activeTooltipIndex !== void 0) {
                var k = g.chartX,
                  C = g.chartY,
                  I = g.activeTooltipIndex,
                  D = d.state,
                  B = D.offset,
                  L = D.tooltipTicks;
                if (!B) return;
                if (typeof j == 'function') I = j(L, g);
                else if (j === 'value') {
                  I = -1;
                  for (var z = 0; z < L.length; z++)
                    if (L[z].value === g.activeLabel) {
                      I = z;
                      break;
                    }
                }
                var F = T(T({}, B), {}, { x: B.left, y: B.top }),
                  X = Math.min(k, F.x + F.width),
                  R = Math.min(C, F.y + F.height),
                  G = L[I] && L[I].value,
                  J = li(d.state, d.props.data, I),
                  oe = L[I]
                    ? {
                        x: S === 'horizontal' ? L[I].coordinate : X,
                        y: S === 'horizontal' ? R : L[I].coordinate,
                      }
                    : _u;
                d.setState(
                  T(
                    T({}, g),
                    {},
                    {
                      activeLabel: G,
                      activeCoordinate: oe,
                      activePayload: J,
                      activeTooltipIndex: I,
                    }
                  )
                );
              } else d.setState(g);
            }),
            K(d, 'renderCursor', function (g) {
              var A,
                S = d.state,
                j = S.isTooltipActive,
                E = S.activeCoordinate,
                $ = S.activePayload,
                _ = S.offset,
                k = S.activeTooltipIndex,
                C = S.tooltipAxisBandSize,
                I = d.getTooltipEventType(),
                D = (A = g.props.active) !== null && A !== void 0 ? A : j,
                B = d.props.layout,
                L = g.key || '_recharts-cursor';
              return w.createElement(Tb, {
                key: L,
                activeCoordinate: E,
                activePayload: $,
                activeTooltipIndex: k,
                chartName: r,
                element: g,
                isActive: D,
                layout: B,
                offset: _,
                tooltipAxisBandSize: C,
                tooltipEventType: I,
              });
            }),
            K(d, 'renderPolarAxis', function (g, A, S) {
              var j = ye(g, 'type.axisType'),
                E = ye(d.state, ''.concat(j, 'Map')),
                $ = g.type.defaultProps,
                _ = $ !== void 0 ? T(T({}, $), g.props) : g.props,
                k = E && E[_[''.concat(j, 'Id')]];
              return N.cloneElement(
                g,
                T(
                  T({}, k),
                  {},
                  {
                    className: U(j, k.className),
                    key: g.key || ''.concat(A, '-').concat(S),
                    ticks: Ie(k, !0),
                  }
                )
              );
            }),
            K(d, 'renderPolarGrid', function (g) {
              var A = g.props,
                S = A.radialLines,
                j = A.polarAngles,
                E = A.polarRadius,
                $ = d.state,
                _ = $.radiusAxisMap,
                k = $.angleAxisMap,
                C = De(_),
                I = De(k),
                D = I.cx,
                B = I.cy,
                L = I.innerRadius,
                z = I.outerRadius;
              return N.cloneElement(g, {
                polarAngles: Array.isArray(j)
                  ? j
                  : Ie(I, !0).map(function (F) {
                      return F.coordinate;
                    }),
                polarRadius: Array.isArray(E)
                  ? E
                  : Ie(C, !0).map(function (F) {
                      return F.coordinate;
                    }),
                cx: D,
                cy: B,
                innerRadius: L,
                outerRadius: z,
                key: g.key || 'polar-grid',
                radialLines: S,
              });
            }),
            K(d, 'renderLegend', function () {
              var g = d.state.formattedGraphicalItems,
                A = d.props,
                S = A.children,
                j = A.width,
                E = A.height,
                $ = d.props.margin || {},
                _ = j - ($.left || 0) - ($.right || 0),
                k = yl({
                  children: S,
                  formattedGraphicalItems: g,
                  legendWidth: _,
                  legendContent: u,
                });
              if (!k) return null;
              var C = k.item,
                I = Bc(k, Ib);
              return N.cloneElement(
                C,
                T(
                  T({}, I),
                  {},
                  {
                    chartWidth: j,
                    chartHeight: E,
                    margin: $,
                    onBBoxUpdate: d.handleLegendBBoxUpdate,
                  }
                )
              );
            }),
            K(d, 'renderTooltip', function () {
              var g,
                A = d.props,
                S = A.children,
                j = A.accessibilityLayer,
                E = he(S, _e);
              if (!E) return null;
              var $ = d.state,
                _ = $.isTooltipActive,
                k = $.activeCoordinate,
                C = $.activePayload,
                I = $.activeLabel,
                D = $.offset,
                B = (g = E.props.active) !== null && g !== void 0 ? g : _;
              return N.cloneElement(E, {
                viewBox: T(T({}, D), {}, { x: D.left, y: D.top }),
                active: B,
                label: I,
                payload: B ? C : [],
                coordinate: k,
                accessibilityLayer: j,
              });
            }),
            K(d, 'renderBrush', function (g) {
              var A = d.props,
                S = A.margin,
                j = A.data,
                E = d.state,
                $ = E.offset,
                _ = E.dataStartIndex,
                k = E.dataEndIndex,
                C = E.updateId;
              return N.cloneElement(g, {
                key: g.key || '_recharts-brush',
                onChange: Kr(d.handleBrushChange, g.props.onChange),
                data: j,
                x: M(g.props.x) ? g.props.x : $.left,
                y: M(g.props.y)
                  ? g.props.y
                  : $.top + $.height + $.brushBottom - (S.bottom || 0),
                width: M(g.props.width) ? g.props.width : $.width,
                startIndex: _,
                endIndex: k,
                updateId: 'brush-'.concat(C),
              });
            }),
            K(d, 'renderReferenceElement', function (g, A, S) {
              if (!g) return null;
              var j = d,
                E = j.clipPathId,
                $ = d.state,
                _ = $.xAxisMap,
                k = $.yAxisMap,
                C = $.offset,
                I = g.type.defaultProps || {},
                D = g.props,
                B = D.xAxisId,
                L = B === void 0 ? I.xAxisId : B,
                z = D.yAxisId,
                F = z === void 0 ? I.yAxisId : z;
              return N.cloneElement(g, {
                key: g.key || ''.concat(A, '-').concat(S),
                xAxis: _[L],
                yAxis: k[F],
                viewBox: {
                  x: C.left,
                  y: C.top,
                  width: C.width,
                  height: C.height,
                },
                clipPathId: E,
              });
            }),
            K(d, 'renderActivePoints', function (g) {
              var A = g.item,
                S = g.activePoint,
                j = g.basePoint,
                E = g.childIndex,
                $ = g.isRange,
                _ = [],
                k = A.props.key,
                C =
                  A.item.type.defaultProps !== void 0
                    ? T(T({}, A.item.type.defaultProps), A.item.props)
                    : A.item.props,
                I = C.activeDot,
                D = C.dataKey,
                B = T(
                  T(
                    {
                      index: E,
                      dataKey: D,
                      cx: S.x,
                      cy: S.y,
                      r: 4,
                      fill: yi(A.item),
                      strokeWidth: 2,
                      stroke: '#fff',
                      payload: S.payload,
                      value: S.value,
                    },
                    W(I, !1)
                  ),
                  Qr(I)
                );
              return (
                _.push(
                  O.renderActiveDot(
                    I,
                    B,
                    ''.concat(k, '-activePoint-').concat(E)
                  )
                ),
                j
                  ? _.push(
                      O.renderActiveDot(
                        I,
                        T(T({}, B), {}, { cx: j.x, cy: j.y }),
                        ''.concat(k, '-basePoint-').concat(E)
                      )
                    )
                  : $ && _.push(null),
                _
              );
            }),
            K(d, 'renderGraphicChild', function (g, A, S) {
              var j = d.filterFormatItem(g, A, S);
              if (!j) return null;
              var E = d.getTooltipEventType(),
                $ = d.state,
                _ = $.isTooltipActive,
                k = $.tooltipAxis,
                C = $.activeTooltipIndex,
                I = $.activeLabel,
                D = d.props.children,
                B = he(D, _e),
                L = j.props,
                z = L.points,
                F = L.isRange,
                X = L.baseLine,
                R =
                  j.item.type.defaultProps !== void 0
                    ? T(T({}, j.item.type.defaultProps), j.item.props)
                    : j.item.props,
                G = R.activeDot,
                J = R.hide,
                oe = R.activeBar,
                xe = R.activeShape,
                Gt = !!(!J && _ && B && (G || oe || xe)),
                ge = {};
              E !== 'axis' && B && B.props.trigger === 'click'
                ? (ge = {
                    onClick: Kr(d.handleItemMouseEnter, g.props.onClick),
                  })
                : E !== 'axis' &&
                  (ge = {
                    onMouseLeave: Kr(
                      d.handleItemMouseLeave,
                      g.props.onMouseLeave
                    ),
                    onMouseEnter: Kr(
                      d.handleItemMouseEnter,
                      g.props.onMouseEnter
                    ),
                  });
              var ze = N.cloneElement(g, T(T({}, j.props), ge));
              function Nr(Ke) {
                return typeof k.dataKey == 'function'
                  ? k.dataKey(Ke.payload)
                  : null;
              }
              if (Gt)
                if (C >= 0) {
                  var ot, Ht;
                  if (k.dataKey && !k.allowDuplicatedCategory) {
                    var We =
                      typeof k.dataKey == 'function'
                        ? Nr
                        : 'payload.'.concat(k.dataKey.toString());
                    ((ot = Zr(z, We, I)), (Ht = F && X && Zr(X, We, I)));
                  } else ((ot = z?.[C]), (Ht = F && X && X[C]));
                  if (xe || oe) {
                    var ct =
                      g.props.activeIndex !== void 0 ? g.props.activeIndex : C;
                    return [
                      N.cloneElement(
                        g,
                        T(T(T({}, j.props), ge), {}, { activeIndex: ct })
                      ),
                      null,
                      null,
                    ];
                  }
                  if (!H(ot))
                    return [ze].concat(
                      Wt(
                        d.renderActivePoints({
                          item: j,
                          activePoint: ot,
                          basePoint: Ht,
                          childIndex: C,
                          isRange: F,
                        })
                      )
                    );
                } else {
                  var Ut,
                    Yt =
                      (Ut = d.getItemByXY(d.state.activeCoordinate)) !== null &&
                      Ut !== void 0
                        ? Ut
                        : { graphicalItem: ze },
                    lt = Yt.graphicalItem,
                    qt = lt.item,
                    ut = qt === void 0 ? g : qt,
                    Lr = lt.childIndex,
                    Fe = T(T(T({}, j.props), ge), {}, { activeIndex: Lr });
                  return [N.cloneElement(ut, Fe), null, null];
                }
              return F ? [ze, null, null] : [ze, null];
            }),
            K(d, 'renderCustomized', function (g, A, S) {
              return N.cloneElement(
                g,
                T(
                  T({ key: 'recharts-customized-'.concat(S) }, d.props),
                  d.state
                )
              );
            }),
            K(d, 'renderMap', {
              CartesianGrid: { handler: Hr, once: !0 },
              ReferenceArea: { handler: d.renderReferenceElement },
              ReferenceLine: { handler: Hr },
              ReferenceDot: { handler: d.renderReferenceElement },
              XAxis: { handler: Hr },
              YAxis: { handler: Hr },
              Brush: { handler: d.renderBrush, once: !0 },
              Bar: { handler: d.renderGraphicChild },
              Line: { handler: d.renderGraphicChild },
              Area: { handler: d.renderGraphicChild },
              Radar: { handler: d.renderGraphicChild },
              RadialBar: { handler: d.renderGraphicChild },
              Scatter: { handler: d.renderGraphicChild },
              Pie: { handler: d.renderGraphicChild },
              Funnel: { handler: d.renderGraphicChild },
              Tooltip: { handler: d.renderCursor, once: !0 },
              PolarGrid: { handler: d.renderPolarGrid, once: !0 },
              PolarAngleAxis: { handler: d.renderPolarAxis },
              PolarRadiusAxis: { handler: d.renderPolarAxis },
              Customized: { handler: d.renderCustomized },
            }),
            (d.clipPathId = ''.concat(
              (x = b.id) !== null && x !== void 0 ? x : at('recharts'),
              '-clip'
            )),
            (d.throttleTriggeredAfterMouseMove = Wc(
              d.triggeredAfterMouseMove,
              (P = b.throttleDelay) !== null && P !== void 0 ? P : 1e3 / 60
            )),
            (d.state = {}),
            d
          );
        }
        return (
          Kb(O, y),
          Rb(O, [
            {
              key: 'componentDidMount',
              value: function () {
                var x, P;
                (this.addListener(),
                  this.accessibilityManager.setDetails({
                    container: this.container,
                    offset: {
                      left:
                        (x = this.props.margin.left) !== null && x !== void 0
                          ? x
                          : 0,
                      top:
                        (P = this.props.margin.top) !== null && P !== void 0
                          ? P
                          : 0,
                    },
                    coordinateList: this.state.tooltipTicks,
                    mouseHandlerCallback: this.triggeredAfterMouseMove,
                    layout: this.props.layout,
                  }),
                  this.displayDefaultTooltip());
              },
            },
            {
              key: 'displayDefaultTooltip',
              value: function () {
                var x = this.props,
                  P = x.children,
                  d = x.data,
                  g = x.height,
                  A = x.layout,
                  S = he(P, _e);
                if (S) {
                  var j = S.props.defaultIndex;
                  if (
                    !(
                      typeof j != 'number' ||
                      j < 0 ||
                      j > this.state.tooltipTicks.length - 1
                    )
                  ) {
                    var E =
                        this.state.tooltipTicks[j] &&
                        this.state.tooltipTicks[j].value,
                      $ = li(this.state, d, j, E),
                      _ = this.state.tooltipTicks[j].coordinate,
                      k = (this.state.offset.top + g) / 2,
                      C = A === 'horizontal',
                      I = C ? { x: _, y: k } : { y: _, x: k },
                      D = this.state.formattedGraphicalItems.find(function (L) {
                        var z = L.item;
                        return z.type.name === 'Scatter';
                      });
                    D &&
                      ((I = T(T({}, I), D.props.points[j].tooltipPosition)),
                      ($ = D.props.points[j].tooltipPayload));
                    var B = {
                      activeTooltipIndex: j,
                      isTooltipActive: !0,
                      activeLabel: E,
                      activePayload: $,
                      activeCoordinate: I,
                    };
                    (this.setState(B),
                      this.renderCursor(S),
                      this.accessibilityManager.setIndex(j));
                  }
                }
              },
            },
            {
              key: 'getSnapshotBeforeUpdate',
              value: function (x, P) {
                if (!this.props.accessibilityLayer) return null;
                if (
                  (this.state.tooltipTicks !== P.tooltipTicks &&
                    this.accessibilityManager.setDetails({
                      coordinateList: this.state.tooltipTicks,
                    }),
                  this.props.layout !== x.layout &&
                    this.accessibilityManager.setDetails({
                      layout: this.props.layout,
                    }),
                  this.props.margin !== x.margin)
                ) {
                  var d, g;
                  this.accessibilityManager.setDetails({
                    offset: {
                      left:
                        (d = this.props.margin.left) !== null && d !== void 0
                          ? d
                          : 0,
                      top:
                        (g = this.props.margin.top) !== null && g !== void 0
                          ? g
                          : 0,
                    },
                  });
                }
                return null;
              },
            },
            {
              key: 'componentDidUpdate',
              value: function (x) {
                ua([he(x.children, _e)], [he(this.props.children, _e)]) ||
                  this.displayDefaultTooltip();
              },
            },
            {
              key: 'componentWillUnmount',
              value: function () {
                (this.removeListener(),
                  this.throttleTriggeredAfterMouseMove.cancel());
              },
            },
            {
              key: 'getTooltipEventType',
              value: function () {
                var x = he(this.props.children, _e);
                if (x && typeof x.props.shared == 'boolean') {
                  var P = x.props.shared ? 'axis' : 'item';
                  return c.indexOf(P) >= 0 ? P : i;
                }
                return i;
              },
            },
            {
              key: 'getMouseInfo',
              value: function (x) {
                if (!this.container) return null;
                var P = this.container,
                  d = P.getBoundingClientRect(),
                  g = sp(d),
                  A = {
                    chartX: Math.round(x.pageX - g.left),
                    chartY: Math.round(x.pageY - g.top),
                  },
                  S = d.width / P.offsetWidth || 1,
                  j = this.inRange(A.chartX, A.chartY, S);
                if (!j) return null;
                var E = this.state,
                  $ = E.xAxisMap,
                  _ = E.yAxisMap,
                  k = this.getTooltipEventType(),
                  C = Lc(this.state, this.props.data, this.props.layout, j);
                if (k !== 'axis' && $ && _) {
                  var I = De($).scale,
                    D = De(_).scale,
                    B = I && I.invert ? I.invert(A.chartX) : null,
                    L = D && D.invert ? D.invert(A.chartY) : null;
                  return T(T({}, A), {}, { xValue: B, yValue: L }, C);
                }
                return C ? T(T({}, A), C) : null;
              },
            },
            {
              key: 'inRange',
              value: function (x, P) {
                var d =
                    arguments.length > 2 && arguments[2] !== void 0
                      ? arguments[2]
                      : 1,
                  g = this.props.layout,
                  A = x / d,
                  S = P / d;
                if (g === 'horizontal' || g === 'vertical') {
                  var j = this.state.offset,
                    E =
                      A >= j.left &&
                      A <= j.left + j.width &&
                      S >= j.top &&
                      S <= j.top + j.height;
                  return E ? { x: A, y: S } : null;
                }
                var $ = this.state,
                  _ = $.angleAxisMap,
                  k = $.radiusAxisMap;
                if (_ && k) {
                  var C = De(_);
                  return $o({ x: A, y: S }, C);
                }
                return null;
              },
            },
            {
              key: 'parseEventsOfWrapper',
              value: function () {
                var x = this.props.children,
                  P = this.getTooltipEventType(),
                  d = he(x, _e),
                  g = {};
                d &&
                  P === 'axis' &&
                  (d.props.trigger === 'click'
                    ? (g = { onClick: this.handleClick })
                    : (g = {
                        onMouseEnter: this.handleMouseEnter,
                        onDoubleClick: this.handleDoubleClick,
                        onMouseMove: this.handleMouseMove,
                        onMouseLeave: this.handleMouseLeave,
                        onTouchMove: this.handleTouchMove,
                        onTouchStart: this.handleTouchStart,
                        onTouchEnd: this.handleTouchEnd,
                        onContextMenu: this.handleContextMenu,
                      }));
                var A = Qr(this.props, this.handleOuterEvent);
                return T(T({}, A), g);
              },
            },
            {
              key: 'addListener',
              value: function () {
                aa.on(ia, this.handleReceiveSyncEvent);
              },
            },
            {
              key: 'removeListener',
              value: function () {
                aa.removeListener(ia, this.handleReceiveSyncEvent);
              },
            },
            {
              key: 'filterFormatItem',
              value: function (x, P, d) {
                for (
                  var g = this.state.formattedGraphicalItems,
                    A = 0,
                    S = g.length;
                  A < S;
                  A++
                ) {
                  var j = g[A];
                  if (
                    j.item === x ||
                    j.props.key === x.key ||
                    (P === ke(j.item.type) && d === j.childIndex)
                  )
                    return j;
                }
                return null;
              },
            },
            {
              key: 'renderClipPath',
              value: function () {
                var x = this.clipPathId,
                  P = this.state.offset,
                  d = P.left,
                  g = P.top,
                  A = P.height,
                  S = P.width;
                return w.createElement(
                  'defs',
                  null,
                  w.createElement(
                    'clipPath',
                    { id: x },
                    w.createElement('rect', { x: d, y: g, height: A, width: S })
                  )
                );
              },
            },
            {
              key: 'getXScales',
              value: function () {
                var x = this.state.xAxisMap;
                return x
                  ? Object.entries(x).reduce(function (P, d) {
                      var g = Mc(d, 2),
                        A = g[0],
                        S = g[1];
                      return T(T({}, P), {}, K({}, A, S.scale));
                    }, {})
                  : null;
              },
            },
            {
              key: 'getYScales',
              value: function () {
                var x = this.state.yAxisMap;
                return x
                  ? Object.entries(x).reduce(function (P, d) {
                      var g = Mc(d, 2),
                        A = g[0],
                        S = g[1];
                      return T(T({}, P), {}, K({}, A, S.scale));
                    }, {})
                  : null;
              },
            },
            {
              key: 'getXScaleByAxisId',
              value: function (x) {
                var P;
                return (P = this.state.xAxisMap) === null ||
                  P === void 0 ||
                  (P = P[x]) === null ||
                  P === void 0
                  ? void 0
                  : P.scale;
              },
            },
            {
              key: 'getYScaleByAxisId',
              value: function (x) {
                var P;
                return (P = this.state.yAxisMap) === null ||
                  P === void 0 ||
                  (P = P[x]) === null ||
                  P === void 0
                  ? void 0
                  : P.scale;
              },
            },
            {
              key: 'getItemByXY',
              value: function (x) {
                var P = this.state,
                  d = P.formattedGraphicalItems,
                  g = P.activeItem;
                if (d && d.length)
                  for (var A = 0, S = d.length; A < S; A++) {
                    var j = d[A],
                      E = j.props,
                      $ = j.item,
                      _ =
                        $.type.defaultProps !== void 0
                          ? T(T({}, $.type.defaultProps), $.props)
                          : $.props,
                      k = ke($.type);
                    if (k === 'Bar') {
                      var C = (E.data || []).find(function (L) {
                        return ah(x, L);
                      });
                      if (C) return { graphicalItem: j, payload: C };
                    } else if (k === 'RadialBar') {
                      var I = (E.data || []).find(function (L) {
                        return $o(x, L);
                      });
                      if (I) return { graphicalItem: j, payload: I };
                    } else if (zn(j, g) || Wn(j, g) || jr(j, g)) {
                      var D = hy({
                          graphicalItem: j,
                          activeTooltipItem: g,
                          itemData: _.data,
                        }),
                        B = _.activeIndex === void 0 ? D : _.activeIndex;
                      return {
                        graphicalItem: T(T({}, j), {}, { childIndex: B }),
                        payload: jr(j, g) ? _.data[D] : j.props.data[D],
                      };
                    }
                  }
                return null;
              },
            },
            {
              key: 'render',
              value: function () {
                var x = this;
                if (!Li(this)) return null;
                var P = this.props,
                  d = P.children,
                  g = P.className,
                  A = P.width,
                  S = P.height,
                  j = P.style,
                  E = P.compact,
                  $ = P.title,
                  _ = P.desc,
                  k = Bc(P, kb),
                  C = W(k, !1);
                if (E)
                  return w.createElement(
                    hc,
                    {
                      state: this.state,
                      width: this.props.width,
                      height: this.props.height,
                      clipPathId: this.clipPathId,
                    },
                    w.createElement(
                      fa,
                      mt({}, C, { width: A, height: S, title: $, desc: _ }),
                      this.renderClipPath(),
                      zi(d, this.renderMap)
                    )
                  );
                if (this.props.accessibilityLayer) {
                  var I, D;
                  ((C.tabIndex =
                    (I = this.props.tabIndex) !== null && I !== void 0 ? I : 0),
                    (C.role =
                      (D = this.props.role) !== null && D !== void 0
                        ? D
                        : 'application'),
                    (C.onKeyDown = function (L) {
                      x.accessibilityManager.keyboardEvent(L);
                    }),
                    (C.onFocus = function () {
                      x.accessibilityManager.focus();
                    }));
                }
                var B = this.parseEventsOfWrapper();
                return w.createElement(
                  hc,
                  {
                    state: this.state,
                    width: this.props.width,
                    height: this.props.height,
                    clipPathId: this.clipPathId,
                  },
                  w.createElement(
                    'div',
                    mt(
                      {
                        className: U('recharts-wrapper', g),
                        style: T(
                          {
                            position: 'relative',
                            cursor: 'default',
                            width: A,
                            height: S,
                          },
                          j
                        ),
                      },
                      B,
                      {
                        ref: function (z) {
                          x.container = z;
                        },
                      }
                    ),
                    w.createElement(
                      fa,
                      mt({}, C, {
                        width: A,
                        height: S,
                        title: $,
                        desc: _,
                        style: Yb,
                      }),
                      this.renderClipPath(),
                      zi(d, this.renderMap)
                    ),
                    this.renderLegend(),
                    this.renderTooltip()
                  )
                );
              },
            },
          ])
        );
      })(N.Component);
    (K(h, 'displayName', r),
      K(
        h,
        'defaultProps',
        T(
          {
            layout: 'horizontal',
            stackOffset: 'none',
            barCategoryGap: '10%',
            barGap: 4,
            margin: { top: 5, right: 5, bottom: 5, left: 5 },
            reverseStackOrder: !1,
            syncMethod: 'index',
          },
          f
        )
      ),
      K(h, 'getDerivedStateFromProps', function (y, O) {
        var b = y.dataKey,
          x = y.data,
          P = y.children,
          d = y.width,
          g = y.height,
          A = y.layout,
          S = y.stackOffset,
          j = y.margin,
          E = O.dataStartIndex,
          $ = O.dataEndIndex;
        if (O.updateId === void 0) {
          var _ = Rc(y);
          return T(
            T(
              T({}, _),
              {},
              { updateId: 0 },
              v(T(T({ props: y }, _), {}, { updateId: 0 }), O)
            ),
            {},
            {
              prevDataKey: b,
              prevData: x,
              prevWidth: d,
              prevHeight: g,
              prevLayout: A,
              prevStackOffset: S,
              prevMargin: j,
              prevChildren: P,
            }
          );
        }
        if (
          b !== O.prevDataKey ||
          x !== O.prevData ||
          d !== O.prevWidth ||
          g !== O.prevHeight ||
          A !== O.prevLayout ||
          S !== O.prevStackOffset ||
          !gt(j, O.prevMargin)
        ) {
          var k = Rc(y),
            C = {
              chartX: O.chartX,
              chartY: O.chartY,
              isTooltipActive: O.isTooltipActive,
            },
            I = T(T({}, Lc(O, x, A)), {}, { updateId: O.updateId + 1 }),
            D = T(T(T({}, k), C), I);
          return T(
            T(T({}, D), v(T({ props: y }, D), O)),
            {},
            {
              prevDataKey: b,
              prevData: x,
              prevWidth: d,
              prevHeight: g,
              prevLayout: A,
              prevStackOffset: S,
              prevMargin: j,
              prevChildren: P,
            }
          );
        }
        if (!ua(P, O.prevChildren)) {
          var B,
            L,
            z,
            F,
            X = he(P, Tt),
            R =
              X &&
              (B =
                (L = X.props) === null || L === void 0
                  ? void 0
                  : L.startIndex) !== null &&
              B !== void 0
                ? B
                : E,
            G =
              X &&
              (z =
                (F = X.props) === null || F === void 0
                  ? void 0
                  : F.endIndex) !== null &&
              z !== void 0
                ? z
                : $,
            J = R !== E || G !== $,
            oe = !H(x),
            xe = oe && !J ? O.updateId : O.updateId + 1;
          return T(
            T(
              { updateId: xe },
              v(
                T(
                  T({ props: y }, O),
                  {},
                  { updateId: xe, dataStartIndex: R, dataEndIndex: G }
                ),
                O
              )
            ),
            {},
            { prevChildren: P, dataStartIndex: R, dataEndIndex: G }
          );
        }
        return null;
      }),
      K(h, 'renderActiveDot', function (y, O, b) {
        var x;
        return (
          N.isValidElement(y)
            ? (x = N.cloneElement(y, O))
            : V(y)
              ? (x = y(O))
              : (x = w.createElement(Dr, O)),
          w.createElement(Y, { className: 'recharts-active-dot', key: b }, x)
        );
      }));
    var m = N.forwardRef(function (O, b) {
      return w.createElement(h, mt({}, O, { ref: b }));
    });
    return ((m.displayName = h.displayName), m);
  },
  px = Yn({
    chartName: 'LineChart',
    GraphicalChild: Hn,
    axisComponents: [
      { axisType: 'xAxis', AxisComp: Mr },
      { axisType: 'yAxis', AxisComp: Br },
    ],
    formatAxisMap: gi,
  }),
  dx = Yn({
    chartName: 'BarChart',
    GraphicalChild: Vt,
    defaultTooltipEventType: 'axis',
    validateTooltipEventTypes: ['axis', 'item'],
    axisComponents: [
      { axisType: 'xAxis', AxisComp: Mr },
      { axisType: 'yAxis', AxisComp: Br },
    ],
    formatAxisMap: gi,
  }),
  vx = Yn({
    chartName: 'PieChart',
    GraphicalChild: Re,
    validateTooltipEventTypes: ['item'],
    defaultTooltipEventType: 'item',
    legendContent: 'children',
    axisComponents: [
      { axisType: 'angleAxis', AxisComp: Rn },
      { axisType: 'radiusAxis', AxisComp: Nn },
    ],
    formatAxisMap: tv,
    defaultProps: {
      layout: 'centric',
      startAngle: 0,
      endAngle: 360,
      cx: '50%',
      cy: '50%',
      innerRadius: 0,
      outerRadius: '80%',
    },
  }),
  hx = Yn({
    chartName: 'AreaChart',
    GraphicalChild: it,
    axisComponents: [
      { axisType: 'xAxis', AxisComp: Mr },
      { axisType: 'yAxis', AxisComp: Br },
    ],
    formatAxisMap: gi,
  });
export {
  hx as A,
  dx as B,
  hi as C,
  bt as L,
  vx as P,
  fx as R,
  _e as T,
  Mr as X,
  Br as Y,
  Re as a,
  Ag as b,
  Vt as c,
  px as d,
  Hn as e,
  it as f,
  sx as g,
  hs as h,
  ux as i,
};
