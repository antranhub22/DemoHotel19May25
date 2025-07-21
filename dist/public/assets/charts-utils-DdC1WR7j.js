import { I as te } from './vendor-BXT5a8vO.js';
function S(n) {
  return function () {
    return n;
  };
}
const Re = Math.cos,
  In = Math.sin,
  B = Math.sqrt,
  Rn = Math.PI,
  tt = 2 * Rn,
  xt = Math.PI,
  Mt = 2 * xt,
  sn = 1e-6,
  Qr = Mt - sn;
function We(n) {
  this._ += n[0];
  for (let t = 1, e = n.length; t < e; ++t) this._ += arguments[t] + n[t];
}
function Xr(n) {
  let t = Math.floor(n);
  if (!(t >= 0)) throw new Error(`invalid digits: ${n}`);
  if (t > 15) return We;
  const e = 10 ** t;
  return function (r) {
    this._ += r[0];
    for (let o = 1, i = r.length; o < i; ++o)
      this._ += Math.round(arguments[o] * e) / e + r[o];
  };
}
class Vr {
  constructor(t) {
    ((this._x0 = this._y0 = this._x1 = this._y1 = null),
      (this._ = ''),
      (this._append = t == null ? We : Xr(t)));
  }
  moveTo(t, e) {
    this._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +e)}`;
  }
  closePath() {
    this._x1 !== null &&
      ((this._x1 = this._x0), (this._y1 = this._y0), this._append`Z`);
  }
  lineTo(t, e) {
    this._append`L${(this._x1 = +t)},${(this._y1 = +e)}`;
  }
  quadraticCurveTo(t, e, r, o) {
    this._append`Q${+t},${+e},${(this._x1 = +r)},${(this._y1 = +o)}`;
  }
  bezierCurveTo(t, e, r, o, i, u) {
    this
      ._append`C${+t},${+e},${+r},${+o},${(this._x1 = +i)},${(this._y1 = +u)}`;
  }
  arcTo(t, e, r, o, i) {
    if (((t = +t), (e = +e), (r = +r), (o = +o), (i = +i), i < 0))
      throw new Error(`negative radius: ${i}`);
    let u = this._x1,
      a = this._y1,
      f = r - t,
      s = o - e,
      h = u - t,
      c = a - e,
      l = h * h + c * c;
    if (this._x1 === null) this._append`M${(this._x1 = t)},${(this._y1 = e)}`;
    else if (l > sn)
      if (!(Math.abs(c * f - s * h) > sn) || !i)
        this._append`L${(this._x1 = t)},${(this._y1 = e)}`;
      else {
        let m = r - u,
          d = o - a,
          y = f * f + s * s,
          w = m * m + d * d,
          b = Math.sqrt(y),
          A = Math.sqrt(l),
          k = i * Math.tan((xt - Math.acos((y + l - w) / (2 * b * A))) / 2),
          C = k / A,
          $ = k / b;
        (Math.abs(C - 1) > sn && this._append`L${t + C * h},${e + C * c}`,
          this
            ._append`A${i},${i},0,0,${+(c * m > h * d)},${(this._x1 = t + $ * f)},${(this._y1 = e + $ * s)}`);
      }
  }
  arc(t, e, r, o, i, u) {
    if (((t = +t), (e = +e), (r = +r), (u = !!u), r < 0))
      throw new Error(`negative radius: ${r}`);
    let a = r * Math.cos(o),
      f = r * Math.sin(o),
      s = t + a,
      h = e + f,
      c = 1 ^ u,
      l = u ? o - i : i - o;
    (this._x1 === null
      ? this._append`M${s},${h}`
      : (Math.abs(this._x1 - s) > sn || Math.abs(this._y1 - h) > sn) &&
        this._append`L${s},${h}`,
      r &&
        (l < 0 && (l = (l % Mt) + Mt),
        l > Qr
          ? this
              ._append`A${r},${r},0,1,${c},${t - a},${e - f}A${r},${r},0,1,${c},${(this._x1 = s)},${(this._y1 = h)}`
          : l > sn &&
            this
              ._append`A${r},${r},0,${+(l >= xt)},${c},${(this._x1 = t + r * Math.cos(i))},${(this._y1 = e + r * Math.sin(i))}`));
  }
  rect(t, e, r, o) {
    this
      ._append`M${(this._x0 = this._x1 = +t)},${(this._y0 = this._y1 = +e)}h${(r = +r)}v${+o}h${-r}Z`;
  }
  toString() {
    return this._;
  }
}
function $t(n) {
  let t = 3;
  return (
    (n.digits = function (e) {
      if (!arguments.length) return t;
      if (e == null) t = null;
      else {
        const r = Math.floor(e);
        if (!(r >= 0)) throw new RangeError(`invalid digits: ${e}`);
        t = r;
      }
      return n;
    }),
    () => new Vr(t)
  );
}
function Ut(n) {
  return typeof n == 'object' && 'length' in n ? n : Array.from(n);
}
function ze(n) {
  this._context = n;
}
ze.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    this._point = 0;
  },
  lineEnd: function () {
    ((this._line || (this._line !== 0 && this._point === 1)) &&
      this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (n, t) {
    switch (((n = +n), (t = +t), this._point)) {
      case 0:
        ((this._point = 1),
          this._line ? this._context.lineTo(n, t) : this._context.moveTo(n, t));
        break;
      case 1:
        this._point = 2;
      default:
        this._context.lineTo(n, t);
        break;
    }
  },
};
function Ze(n) {
  return new ze(n);
}
function Be(n) {
  return n[0];
}
function Qe(n) {
  return n[1];
}
function Gr(n, t) {
  var e = S(!0),
    r = null,
    o = Ze,
    i = null,
    u = $t(a);
  ((n = typeof n == 'function' ? n : n === void 0 ? Be : S(n)),
    (t = typeof t == 'function' ? t : t === void 0 ? Qe : S(t)));
  function a(f) {
    var s,
      h = (f = Ut(f)).length,
      c,
      l = !1,
      m;
    for (r == null && (i = o((m = u()))), s = 0; s <= h; ++s)
      (!(s < h && e((c = f[s]), s, f)) === l &&
        ((l = !l) ? i.lineStart() : i.lineEnd()),
        l && i.point(+n(c, s, f), +t(c, s, f)));
    if (m) return ((i = null), m + '' || null);
  }
  return (
    (a.x = function (f) {
      return arguments.length
        ? ((n = typeof f == 'function' ? f : S(+f)), a)
        : n;
    }),
    (a.y = function (f) {
      return arguments.length
        ? ((t = typeof f == 'function' ? f : S(+f)), a)
        : t;
    }),
    (a.defined = function (f) {
      return arguments.length
        ? ((e = typeof f == 'function' ? f : S(!!f)), a)
        : e;
    }),
    (a.curve = function (f) {
      return arguments.length ? ((o = f), r != null && (i = o(r)), a) : o;
    }),
    (a.context = function (f) {
      return arguments.length
        ? (f == null ? (r = i = null) : (i = o((r = f))), a)
        : r;
    }),
    a
  );
}
function Au(n, t, e) {
  var r = null,
    o = S(!0),
    i = null,
    u = Ze,
    a = null,
    f = $t(s);
  ((n = typeof n == 'function' ? n : n === void 0 ? Be : S(+n)),
    (t = typeof t == 'function' ? t : S(t === void 0 ? 0 : +t)),
    (e = typeof e == 'function' ? e : e === void 0 ? Qe : S(+e)));
  function s(c) {
    var l,
      m,
      d,
      y = (c = Ut(c)).length,
      w,
      b = !1,
      A,
      k = new Array(y),
      C = new Array(y);
    for (i == null && (a = u((A = f()))), l = 0; l <= y; ++l) {
      if (!(l < y && o((w = c[l]), l, c)) === b)
        if ((b = !b)) ((m = l), a.areaStart(), a.lineStart());
        else {
          for (a.lineEnd(), a.lineStart(), d = l - 1; d >= m; --d)
            a.point(k[d], C[d]);
          (a.lineEnd(), a.areaEnd());
        }
      b &&
        ((k[l] = +n(w, l, c)),
        (C[l] = +t(w, l, c)),
        a.point(r ? +r(w, l, c) : k[l], e ? +e(w, l, c) : C[l]));
    }
    if (A) return ((a = null), A + '' || null);
  }
  function h() {
    return Gr().defined(o).curve(u).context(i);
  }
  return (
    (s.x = function (c) {
      return arguments.length
        ? ((n = typeof c == 'function' ? c : S(+c)), (r = null), s)
        : n;
    }),
    (s.x0 = function (c) {
      return arguments.length
        ? ((n = typeof c == 'function' ? c : S(+c)), s)
        : n;
    }),
    (s.x1 = function (c) {
      return arguments.length
        ? ((r = c == null ? null : typeof c == 'function' ? c : S(+c)), s)
        : r;
    }),
    (s.y = function (c) {
      return arguments.length
        ? ((t = typeof c == 'function' ? c : S(+c)), (e = null), s)
        : t;
    }),
    (s.y0 = function (c) {
      return arguments.length
        ? ((t = typeof c == 'function' ? c : S(+c)), s)
        : t;
    }),
    (s.y1 = function (c) {
      return arguments.length
        ? ((e = c == null ? null : typeof c == 'function' ? c : S(+c)), s)
        : e;
    }),
    (s.lineX0 = s.lineY0 =
      function () {
        return h().x(n).y(t);
      }),
    (s.lineY1 = function () {
      return h().x(n).y(e);
    }),
    (s.lineX1 = function () {
      return h().x(r).y(t);
    }),
    (s.defined = function (c) {
      return arguments.length
        ? ((o = typeof c == 'function' ? c : S(!!c)), s)
        : o;
    }),
    (s.curve = function (c) {
      return arguments.length ? ((u = c), i != null && (a = u(i)), s) : u;
    }),
    (s.context = function (c) {
      return arguments.length
        ? (c == null ? (i = a = null) : (a = u((i = c))), s)
        : i;
    }),
    s
  );
}
class Xe {
  constructor(t, e) {
    ((this._context = t), (this._x = e));
  }
  areaStart() {
    this._line = 0;
  }
  areaEnd() {
    this._line = NaN;
  }
  lineStart() {
    this._point = 0;
  }
  lineEnd() {
    ((this._line || (this._line !== 0 && this._point === 1)) &&
      this._context.closePath(),
      (this._line = 1 - this._line));
  }
  point(t, e) {
    switch (((t = +t), (e = +e), this._point)) {
      case 0: {
        ((this._point = 1),
          this._line ? this._context.lineTo(t, e) : this._context.moveTo(t, e));
        break;
      }
      case 1:
        this._point = 2;
      default: {
        this._x
          ? this._context.bezierCurveTo(
              (this._x0 = (this._x0 + t) / 2),
              this._y0,
              this._x0,
              e,
              t,
              e
            )
          : this._context.bezierCurveTo(
              this._x0,
              (this._y0 = (this._y0 + e) / 2),
              t,
              this._y0,
              t,
              e
            );
        break;
      }
    }
    ((this._x0 = t), (this._y0 = e));
  }
}
function Fu(n) {
  return new Xe(n, !0);
}
function qu(n) {
  return new Xe(n, !1);
}
const Jr = {
    draw(n, t) {
      const e = B(t / Rn);
      (n.moveTo(e, 0), n.arc(0, 0, e, 0, tt));
    },
  },
  Yu = {
    draw(n, t) {
      const e = B(t / 5) / 2;
      (n.moveTo(-3 * e, -e),
        n.lineTo(-e, -e),
        n.lineTo(-e, -3 * e),
        n.lineTo(e, -3 * e),
        n.lineTo(e, -e),
        n.lineTo(3 * e, -e),
        n.lineTo(3 * e, e),
        n.lineTo(e, e),
        n.lineTo(e, 3 * e),
        n.lineTo(-e, 3 * e),
        n.lineTo(-e, e),
        n.lineTo(-3 * e, e),
        n.closePath());
    },
  },
  Ve = B(1 / 3),
  jr = Ve * 2,
  Hu = {
    draw(n, t) {
      const e = B(t / jr),
        r = e * Ve;
      (n.moveTo(0, -e),
        n.lineTo(r, 0),
        n.lineTo(0, e),
        n.lineTo(-r, 0),
        n.closePath());
    },
  },
  Pu = {
    draw(n, t) {
      const e = B(t),
        r = -e / 2;
      n.rect(r, r, e, e);
    },
  },
  Kr = 0.8908130915292852,
  Ge = In(Rn / 10) / In((7 * Rn) / 10),
  ni = In(tt / 10) * Ge,
  ti = -Re(tt / 10) * Ge,
  Lu = {
    draw(n, t) {
      const e = B(t * Kr),
        r = ni * e,
        o = ti * e;
      (n.moveTo(0, -e), n.lineTo(r, o));
      for (let i = 1; i < 5; ++i) {
        const u = (tt * i) / 5,
          a = Re(u),
          f = In(u);
        (n.lineTo(f * e, -a * e), n.lineTo(a * r - f * o, f * r + a * o));
      }
      n.closePath();
    },
  },
  ct = B(3),
  Eu = {
    draw(n, t) {
      const e = -B(t / (ct * 3));
      (n.moveTo(0, e * 2),
        n.lineTo(-ct * e, -e),
        n.lineTo(ct * e, -e),
        n.closePath());
    },
  },
  O = -0.5,
  I = B(3) / 2,
  wt = 1 / B(12),
  ei = (wt / 2 + 1) * 3,
  Ou = {
    draw(n, t) {
      const e = B(t / ei),
        r = e / 2,
        o = e * wt,
        i = r,
        u = e * wt + e,
        a = -i,
        f = u;
      (n.moveTo(r, o),
        n.lineTo(i, u),
        n.lineTo(a, f),
        n.lineTo(O * r - I * o, I * r + O * o),
        n.lineTo(O * i - I * u, I * i + O * u),
        n.lineTo(O * a - I * f, I * a + O * f),
        n.lineTo(O * r + I * o, O * o - I * r),
        n.lineTo(O * i + I * u, O * u - I * i),
        n.lineTo(O * a + I * f, O * f - I * a),
        n.closePath());
    },
  };
function Iu(n, t) {
  let e = null,
    r = $t(o);
  ((n = typeof n == 'function' ? n : S(n || Jr)),
    (t = typeof t == 'function' ? t : S(t === void 0 ? 64 : +t)));
  function o() {
    let i;
    if (
      (e || (e = i = r()),
      n.apply(this, arguments).draw(e, +t.apply(this, arguments)),
      i)
    )
      return ((e = null), i + '' || null);
  }
  return (
    (o.type = function (i) {
      return arguments.length
        ? ((n = typeof i == 'function' ? i : S(i)), o)
        : n;
    }),
    (o.size = function (i) {
      return arguments.length
        ? ((t = typeof i == 'function' ? i : S(+i)), o)
        : t;
    }),
    (o.context = function (i) {
      return arguments.length ? ((e = i ?? null), o) : e;
    }),
    o
  );
}
function Wn() {}
function zn(n, t, e) {
  n._context.bezierCurveTo(
    (2 * n._x0 + n._x1) / 3,
    (2 * n._y0 + n._y1) / 3,
    (n._x0 + 2 * n._x1) / 3,
    (n._y0 + 2 * n._y1) / 3,
    (n._x0 + 4 * n._x1 + t) / 6,
    (n._y0 + 4 * n._y1 + e) / 6
  );
}
function Je(n) {
  this._context = n;
}
Je.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = NaN), (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 3:
        zn(this, this._x1, this._y1);
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    ((this._line || (this._line !== 0 && this._point === 1)) &&
      this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (n, t) {
    switch (((n = +n), (t = +t), this._point)) {
      case 0:
        ((this._point = 1),
          this._line ? this._context.lineTo(n, t) : this._context.moveTo(n, t));
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        ((this._point = 3),
          this._context.lineTo(
            (5 * this._x0 + this._x1) / 6,
            (5 * this._y0 + this._y1) / 6
          ));
      default:
        zn(this, n, t);
        break;
    }
    ((this._x0 = this._x1),
      (this._x1 = n),
      (this._y0 = this._y1),
      (this._y1 = t));
  },
};
function Ru(n) {
  return new Je(n);
}
function je(n) {
  this._context = n;
}
je.prototype = {
  areaStart: Wn,
  areaEnd: Wn,
  lineStart: function () {
    ((this._x0 =
      this._x1 =
      this._x2 =
      this._x3 =
      this._x4 =
      this._y0 =
      this._y1 =
      this._y2 =
      this._y3 =
      this._y4 =
        NaN),
      (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 1: {
        (this._context.moveTo(this._x2, this._y2), this._context.closePath());
        break;
      }
      case 2: {
        (this._context.moveTo(
          (this._x2 + 2 * this._x3) / 3,
          (this._y2 + 2 * this._y3) / 3
        ),
          this._context.lineTo(
            (this._x3 + 2 * this._x2) / 3,
            (this._y3 + 2 * this._y2) / 3
          ),
          this._context.closePath());
        break;
      }
      case 3: {
        (this.point(this._x2, this._y2),
          this.point(this._x3, this._y3),
          this.point(this._x4, this._y4));
        break;
      }
    }
  },
  point: function (n, t) {
    switch (((n = +n), (t = +t), this._point)) {
      case 0:
        ((this._point = 1), (this._x2 = n), (this._y2 = t));
        break;
      case 1:
        ((this._point = 2), (this._x3 = n), (this._y3 = t));
        break;
      case 2:
        ((this._point = 3),
          (this._x4 = n),
          (this._y4 = t),
          this._context.moveTo(
            (this._x0 + 4 * this._x1 + n) / 6,
            (this._y0 + 4 * this._y1 + t) / 6
          ));
        break;
      default:
        zn(this, n, t);
        break;
    }
    ((this._x0 = this._x1),
      (this._x1 = n),
      (this._y0 = this._y1),
      (this._y1 = t));
  },
};
function Wu(n) {
  return new je(n);
}
function Ke(n) {
  this._context = n;
}
Ke.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = NaN), (this._point = 0));
  },
  lineEnd: function () {
    ((this._line || (this._line !== 0 && this._point === 3)) &&
      this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (n, t) {
    switch (((n = +n), (t = +t), this._point)) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        var e = (this._x0 + 4 * this._x1 + n) / 6,
          r = (this._y0 + 4 * this._y1 + t) / 6;
        this._line ? this._context.lineTo(e, r) : this._context.moveTo(e, r);
        break;
      case 3:
        this._point = 4;
      default:
        zn(this, n, t);
        break;
    }
    ((this._x0 = this._x1),
      (this._x1 = n),
      (this._y0 = this._y1),
      (this._y1 = t));
  },
};
function zu(n) {
  return new Ke(n);
}
function nr(n) {
  this._context = n;
}
nr.prototype = {
  areaStart: Wn,
  areaEnd: Wn,
  lineStart: function () {
    this._point = 0;
  },
  lineEnd: function () {
    this._point && this._context.closePath();
  },
  point: function (n, t) {
    ((n = +n),
      (t = +t),
      this._point
        ? this._context.lineTo(n, t)
        : ((this._point = 1), this._context.moveTo(n, t)));
  },
};
function Zu(n) {
  return new nr(n);
}
function ee(n) {
  return n < 0 ? -1 : 1;
}
function re(n, t, e) {
  var r = n._x1 - n._x0,
    o = t - n._x1,
    i = (n._y1 - n._y0) / (r || (o < 0 && -0)),
    u = (e - n._y1) / (o || (r < 0 && -0)),
    a = (i * o + u * r) / (r + o);
  return (
    (ee(i) + ee(u)) * Math.min(Math.abs(i), Math.abs(u), 0.5 * Math.abs(a)) || 0
  );
}
function ie(n, t) {
  var e = n._x1 - n._x0;
  return e ? ((3 * (n._y1 - n._y0)) / e - t) / 2 : t;
}
function lt(n, t, e) {
  var r = n._x0,
    o = n._y0,
    i = n._x1,
    u = n._y1,
    a = (i - r) / 3;
  n._context.bezierCurveTo(r + a, o + a * t, i - a, u - a * e, i, u);
}
function Zn(n) {
  this._context = n;
}
Zn.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN),
      (this._point = 0));
  },
  lineEnd: function () {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        lt(this, this._t0, ie(this, this._t0));
        break;
    }
    ((this._line || (this._line !== 0 && this._point === 1)) &&
      this._context.closePath(),
      (this._line = 1 - this._line));
  },
  point: function (n, t) {
    var e = NaN;
    if (((n = +n), (t = +t), !(n === this._x1 && t === this._y1))) {
      switch (this._point) {
        case 0:
          ((this._point = 1),
            this._line
              ? this._context.lineTo(n, t)
              : this._context.moveTo(n, t));
          break;
        case 1:
          this._point = 2;
          break;
        case 2:
          ((this._point = 3), lt(this, ie(this, (e = re(this, n, t))), e));
          break;
        default:
          lt(this, this._t0, (e = re(this, n, t)));
          break;
      }
      ((this._x0 = this._x1),
        (this._x1 = n),
        (this._y0 = this._y1),
        (this._y1 = t),
        (this._t0 = e));
    }
  },
};
function tr(n) {
  this._context = new er(n);
}
(tr.prototype = Object.create(Zn.prototype)).point = function (n, t) {
  Zn.prototype.point.call(this, t, n);
};
function er(n) {
  this._context = n;
}
er.prototype = {
  moveTo: function (n, t) {
    this._context.moveTo(t, n);
  },
  closePath: function () {
    this._context.closePath();
  },
  lineTo: function (n, t) {
    this._context.lineTo(t, n);
  },
  bezierCurveTo: function (n, t, e, r, o, i) {
    this._context.bezierCurveTo(t, n, r, e, i, o);
  },
};
function Bu(n) {
  return new Zn(n);
}
function Qu(n) {
  return new tr(n);
}
function rr(n) {
  this._context = n;
}
rr.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x = []), (this._y = []));
  },
  lineEnd: function () {
    var n = this._x,
      t = this._y,
      e = n.length;
    if (e)
      if (
        (this._line
          ? this._context.lineTo(n[0], t[0])
          : this._context.moveTo(n[0], t[0]),
        e === 2)
      )
        this._context.lineTo(n[1], t[1]);
      else
        for (var r = oe(n), o = oe(t), i = 0, u = 1; u < e; ++i, ++u)
          this._context.bezierCurveTo(
            r[0][i],
            o[0][i],
            r[1][i],
            o[1][i],
            n[u],
            t[u]
          );
    ((this._line || (this._line !== 0 && e === 1)) && this._context.closePath(),
      (this._line = 1 - this._line),
      (this._x = this._y = null));
  },
  point: function (n, t) {
    (this._x.push(+n), this._y.push(+t));
  },
};
function oe(n) {
  var t,
    e = n.length - 1,
    r,
    o = new Array(e),
    i = new Array(e),
    u = new Array(e);
  for (o[0] = 0, i[0] = 2, u[0] = n[0] + 2 * n[1], t = 1; t < e - 1; ++t)
    ((o[t] = 1), (i[t] = 4), (u[t] = 4 * n[t] + 2 * n[t + 1]));
  for (
    o[e - 1] = 2, i[e - 1] = 7, u[e - 1] = 8 * n[e - 1] + n[e], t = 1;
    t < e;
    ++t
  )
    ((r = o[t] / i[t - 1]), (i[t] -= r), (u[t] -= r * u[t - 1]));
  for (o[e - 1] = u[e - 1] / i[e - 1], t = e - 2; t >= 0; --t)
    o[t] = (u[t] - o[t + 1]) / i[t];
  for (i[e - 1] = (n[e] + o[e - 1]) / 2, t = 0; t < e - 1; ++t)
    i[t] = 2 * n[t + 1] - o[t + 1];
  return [o, i];
}
function Xu(n) {
  return new rr(n);
}
function et(n, t) {
  ((this._context = n), (this._t = t));
}
et.prototype = {
  areaStart: function () {
    this._line = 0;
  },
  areaEnd: function () {
    this._line = NaN;
  },
  lineStart: function () {
    ((this._x = this._y = NaN), (this._point = 0));
  },
  lineEnd: function () {
    (0 < this._t &&
      this._t < 1 &&
      this._point === 2 &&
      this._context.lineTo(this._x, this._y),
      (this._line || (this._line !== 0 && this._point === 1)) &&
        this._context.closePath(),
      this._line >= 0 &&
        ((this._t = 1 - this._t), (this._line = 1 - this._line)));
  },
  point: function (n, t) {
    switch (((n = +n), (t = +t), this._point)) {
      case 0:
        ((this._point = 1),
          this._line ? this._context.lineTo(n, t) : this._context.moveTo(n, t));
        break;
      case 1:
        this._point = 2;
      default: {
        if (this._t <= 0)
          (this._context.lineTo(this._x, t), this._context.lineTo(n, t));
        else {
          var e = this._x * (1 - this._t) + n * this._t;
          (this._context.lineTo(e, this._y), this._context.lineTo(e, t));
        }
        break;
      }
    }
    ((this._x = n), (this._y = t));
  },
};
function Vu(n) {
  return new et(n, 0.5);
}
function Gu(n) {
  return new et(n, 0);
}
function Ju(n) {
  return new et(n, 1);
}
function Sn(n, t) {
  if ((u = n.length) > 1)
    for (var e = 1, r, o, i = n[t[0]], u, a = i.length; e < u; ++e)
      for (o = i, i = n[t[e]], r = 0; r < a; ++r)
        i[r][1] += i[r][0] = isNaN(o[r][1]) ? o[r][0] : o[r][1];
}
function ue(n) {
  for (var t = n.length, e = new Array(t); --t >= 0; ) e[t] = t;
  return e;
}
function ri(n, t) {
  return n[t];
}
function ii(n) {
  const t = [];
  return ((t.key = n), t);
}
function ju() {
  var n = S([]),
    t = ue,
    e = Sn,
    r = ri;
  function o(i) {
    var u = Array.from(n.apply(this, arguments), ii),
      a,
      f = u.length,
      s = -1,
      h;
    for (const c of i)
      for (a = 0, ++s; a < f; ++a)
        (u[a][s] = [0, +r(c, u[a].key, s, i)]).data = c;
    for (a = 0, h = Ut(t(u)); a < f; ++a) u[h[a]].index = a;
    return (e(u, h), u);
  }
  return (
    (o.keys = function (i) {
      return arguments.length
        ? ((n = typeof i == 'function' ? i : S(Array.from(i))), o)
        : n;
    }),
    (o.value = function (i) {
      return arguments.length
        ? ((r = typeof i == 'function' ? i : S(+i)), o)
        : r;
    }),
    (o.order = function (i) {
      return arguments.length
        ? ((t = i == null ? ue : typeof i == 'function' ? i : S(Array.from(i))),
          o)
        : t;
    }),
    (o.offset = function (i) {
      return arguments.length ? ((e = i ?? Sn), o) : e;
    }),
    o
  );
}
function Ku(n, t) {
  if ((r = n.length) > 0) {
    for (var e, r, o = 0, i = n[0].length, u; o < i; ++o) {
      for (u = e = 0; e < r; ++e) u += n[e][o][1] || 0;
      if (u) for (e = 0; e < r; ++e) n[e][o][1] /= u;
    }
    Sn(n, t);
  }
}
function na(n, t) {
  if ((o = n.length) > 0) {
    for (var e = 0, r = n[t[0]], o, i = r.length; e < i; ++e) {
      for (var u = 0, a = 0; u < o; ++u) a += n[u][e][1] || 0;
      r[e][1] += r[e][0] = -a / 2;
    }
    Sn(n, t);
  }
}
function ta(n, t) {
  if (!(!((u = n.length) > 0) || !((i = (o = n[t[0]]).length) > 0))) {
    for (var e = 0, r = 1, o, i, u; r < i; ++r) {
      for (var a = 0, f = 0, s = 0; a < u; ++a) {
        for (
          var h = n[t[a]],
            c = h[r][1] || 0,
            l = h[r - 1][1] || 0,
            m = (c - l) / 2,
            d = 0;
          d < a;
          ++d
        ) {
          var y = n[t[d]],
            w = y[r][1] || 0,
            b = y[r - 1][1] || 0;
          m += w - b;
        }
        ((f += c), (s += m * c));
      }
      ((o[r - 1][1] += o[r - 1][0] = e), f && (e -= s / f));
    }
    ((o[r - 1][1] += o[r - 1][0] = e), Sn(n, t));
  }
}
function en(n, t) {
  return n == null || t == null
    ? NaN
    : n < t
      ? -1
      : n > t
        ? 1
        : n >= t
          ? 0
          : NaN;
}
function oi(n, t) {
  return n == null || t == null
    ? NaN
    : t < n
      ? -1
      : t > n
        ? 1
        : t >= n
          ? 0
          : NaN;
}
function Dt(n) {
  let t, e, r;
  n.length !== 2
    ? ((t = en), (e = (a, f) => en(n(a), f)), (r = (a, f) => n(a) - f))
    : ((t = n === en || n === oi ? n : ui), (e = n), (r = n));
  function o(a, f, s = 0, h = a.length) {
    if (s < h) {
      if (t(f, f) !== 0) return h;
      do {
        const c = (s + h) >>> 1;
        e(a[c], f) < 0 ? (s = c + 1) : (h = c);
      } while (s < h);
    }
    return s;
  }
  function i(a, f, s = 0, h = a.length) {
    if (s < h) {
      if (t(f, f) !== 0) return h;
      do {
        const c = (s + h) >>> 1;
        e(a[c], f) <= 0 ? (s = c + 1) : (h = c);
      } while (s < h);
    }
    return s;
  }
  function u(a, f, s = 0, h = a.length) {
    const c = o(a, f, s, h - 1);
    return c > s && r(a[c - 1], f) > -r(a[c], f) ? c - 1 : c;
  }
  return { left: o, center: u, right: i };
}
function ui() {
  return 0;
}
function ir(n) {
  return n === null ? NaN : +n;
}
function* ai(n, t) {
  for (let e of n) e != null && (e = +e) >= e && (yield e);
}
const si = Dt(en),
  An = si.right;
Dt(ir).center;
function fi(n = en) {
  if (n === en) return or;
  if (typeof n != 'function') throw new TypeError('compare is not a function');
  return (t, e) => {
    const r = n(t, e);
    return r || r === 0 ? r : (n(e, e) === 0) - (n(t, t) === 0);
  };
}
function or(n, t) {
  return (
    (n == null || !(n >= n)) - (t == null || !(t >= t)) ||
    (n < t ? -1 : n > t ? 1 : 0)
  );
}
const ci = Math.sqrt(50),
  li = Math.sqrt(10),
  hi = Math.sqrt(2);
function Bn(n, t, e) {
  const r = (t - n) / Math.max(0, e),
    o = Math.floor(Math.log10(r)),
    i = r / Math.pow(10, o),
    u = i >= ci ? 10 : i >= li ? 5 : i >= hi ? 2 : 1;
  let a, f, s;
  return (
    o < 0
      ? ((s = Math.pow(10, -o) / u),
        (a = Math.round(n * s)),
        (f = Math.round(t * s)),
        a / s < n && ++a,
        f / s > t && --f,
        (s = -s))
      : ((s = Math.pow(10, o) * u),
        (a = Math.round(n / s)),
        (f = Math.round(t / s)),
        a * s < n && ++a,
        f * s > t && --f),
    f < a && 0.5 <= e && e < 2 ? Bn(n, t, e * 2) : [a, f, s]
  );
}
function bt(n, t, e) {
  if (((t = +t), (n = +n), (e = +e), !(e > 0))) return [];
  if (n === t) return [n];
  const r = t < n,
    [o, i, u] = r ? Bn(t, n, e) : Bn(n, t, e);
  if (!(i >= o)) return [];
  const a = i - o + 1,
    f = new Array(a);
  if (r)
    if (u < 0) for (let s = 0; s < a; ++s) f[s] = (i - s) / -u;
    else for (let s = 0; s < a; ++s) f[s] = (i - s) * u;
  else if (u < 0) for (let s = 0; s < a; ++s) f[s] = (o + s) / -u;
  else for (let s = 0; s < a; ++s) f[s] = (o + s) * u;
  return f;
}
function vt(n, t, e) {
  return ((t = +t), (n = +n), (e = +e), Bn(n, t, e)[2]);
}
function Tt(n, t, e) {
  ((t = +t), (n = +n), (e = +e));
  const r = t < n,
    o = r ? vt(t, n, e) : vt(n, t, e);
  return (r ? -1 : 1) * (o < 0 ? 1 / -o : o);
}
function ae(n, t) {
  let e;
  for (const r of n)
    r != null && (e < r || (e === void 0 && r >= r)) && (e = r);
  return e;
}
function se(n, t) {
  let e;
  for (const r of n)
    r != null && (e > r || (e === void 0 && r >= r)) && (e = r);
  return e;
}
function ur(n, t, e = 0, r = 1 / 0, o) {
  if (
    ((t = Math.floor(t)),
    (e = Math.floor(Math.max(0, e))),
    (r = Math.floor(Math.min(n.length - 1, r))),
    !(e <= t && t <= r))
  )
    return n;
  for (o = o === void 0 ? or : fi(o); r > e; ) {
    if (r - e > 600) {
      const f = r - e + 1,
        s = t - e + 1,
        h = Math.log(f),
        c = 0.5 * Math.exp((2 * h) / 3),
        l = 0.5 * Math.sqrt((h * c * (f - c)) / f) * (s - f / 2 < 0 ? -1 : 1),
        m = Math.max(e, Math.floor(t - (s * c) / f + l)),
        d = Math.min(r, Math.floor(t + ((f - s) * c) / f + l));
      ur(n, t, m, d, o);
    }
    const i = n[t];
    let u = e,
      a = r;
    for (vn(n, e, t), o(n[r], i) > 0 && vn(n, e, r); u < a; ) {
      for (vn(n, u, a), ++u, --a; o(n[u], i) < 0; ) ++u;
      for (; o(n[a], i) > 0; ) --a;
    }
    (o(n[e], i) === 0 ? vn(n, e, a) : (++a, vn(n, a, r)),
      a <= t && (e = a + 1),
      t <= a && (r = a - 1));
  }
  return n;
}
function vn(n, t, e) {
  const r = n[t];
  ((n[t] = n[e]), (n[e] = r));
}
function gi(n, t, e) {
  if (((n = Float64Array.from(ai(n))), !(!(r = n.length) || isNaN((t = +t))))) {
    if (t <= 0 || r < 2) return se(n);
    if (t >= 1) return ae(n);
    var r,
      o = (r - 1) * t,
      i = Math.floor(o),
      u = ae(ur(n, i).subarray(0, i + 1)),
      a = se(n.subarray(i + 1));
    return u + (a - u) * (o - i);
  }
}
function mi(n, t, e = ir) {
  if (!(!(r = n.length) || isNaN((t = +t)))) {
    if (t <= 0 || r < 2) return +e(n[0], 0, n);
    if (t >= 1) return +e(n[r - 1], r - 1, n);
    var r,
      o = (r - 1) * t,
      i = Math.floor(o),
      u = +e(n[i], i, n),
      a = +e(n[i + 1], i + 1, n);
    return u + (a - u) * (o - i);
  }
}
function pi(n, t, e) {
  ((n = +n),
    (t = +t),
    (e = (o = arguments.length) < 2 ? ((t = n), (n = 0), 1) : o < 3 ? 1 : +e));
  for (
    var r = -1, o = Math.max(0, Math.ceil((t - n) / e)) | 0, i = new Array(o);
    ++r < o;

  )
    i[r] = n + r * e;
  return i;
}
function W(n, t) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(n);
      break;
    default:
      this.range(t).domain(n);
      break;
  }
  return this;
}
function nn(n, t) {
  switch (arguments.length) {
    case 0:
      break;
    case 1: {
      typeof n == 'function' ? this.interpolator(n) : this.range(n);
      break;
    }
    default: {
      (this.domain(n),
        typeof t == 'function' ? this.interpolator(t) : this.range(t));
      break;
    }
  }
  return this;
}
const kt = Symbol('implicit');
function At() {
  var n = new te(),
    t = [],
    e = [],
    r = kt;
  function o(i) {
    let u = n.get(i);
    if (u === void 0) {
      if (r !== kt) return r;
      n.set(i, (u = t.push(i) - 1));
    }
    return e[u % e.length];
  }
  return (
    (o.domain = function (i) {
      if (!arguments.length) return t.slice();
      ((t = []), (n = new te()));
      for (const u of i) n.has(u) || n.set(u, t.push(u) - 1);
      return o;
    }),
    (o.range = function (i) {
      return arguments.length ? ((e = Array.from(i)), o) : e.slice();
    }),
    (o.unknown = function (i) {
      return arguments.length ? ((r = i), o) : r;
    }),
    (o.copy = function () {
      return At(t, e).unknown(r);
    }),
    W.apply(o, arguments),
    o
  );
}
function Ft() {
  var n = At().unknown(void 0),
    t = n.domain,
    e = n.range,
    r = 0,
    o = 1,
    i,
    u,
    a = !1,
    f = 0,
    s = 0,
    h = 0.5;
  delete n.unknown;
  function c() {
    var l = t().length,
      m = o < r,
      d = m ? o : r,
      y = m ? r : o;
    ((i = (y - d) / Math.max(1, l - f + s * 2)),
      a && (i = Math.floor(i)),
      (d += (y - d - i * (l - f)) * h),
      (u = i * (1 - f)),
      a && ((d = Math.round(d)), (u = Math.round(u))));
    var w = pi(l).map(function (b) {
      return d + i * b;
    });
    return e(m ? w.reverse() : w);
  }
  return (
    (n.domain = function (l) {
      return arguments.length ? (t(l), c()) : t();
    }),
    (n.range = function (l) {
      return arguments.length
        ? (([r, o] = l), (r = +r), (o = +o), c())
        : [r, o];
    }),
    (n.rangeRound = function (l) {
      return (([r, o] = l), (r = +r), (o = +o), (a = !0), c());
    }),
    (n.bandwidth = function () {
      return u;
    }),
    (n.step = function () {
      return i;
    }),
    (n.round = function (l) {
      return arguments.length ? ((a = !!l), c()) : a;
    }),
    (n.padding = function (l) {
      return arguments.length ? ((f = Math.min(1, (s = +l))), c()) : f;
    }),
    (n.paddingInner = function (l) {
      return arguments.length ? ((f = Math.min(1, l)), c()) : f;
    }),
    (n.paddingOuter = function (l) {
      return arguments.length ? ((s = +l), c()) : s;
    }),
    (n.align = function (l) {
      return arguments.length ? ((h = Math.max(0, Math.min(1, l))), c()) : h;
    }),
    (n.copy = function () {
      return Ft(t(), [r, o]).round(a).paddingInner(f).paddingOuter(s).align(h);
    }),
    W.apply(c(), arguments)
  );
}
function ar(n) {
  var t = n.copy;
  return (
    (n.padding = n.paddingOuter),
    delete n.paddingInner,
    delete n.paddingOuter,
    (n.copy = function () {
      return ar(t());
    }),
    n
  );
}
function di() {
  return ar(Ft.apply(null, arguments).paddingInner(1));
}
function qt(n, t, e) {
  ((n.prototype = t.prototype = e), (e.constructor = n));
}
function sr(n, t) {
  var e = Object.create(n.prototype);
  for (var r in t) e[r] = t[r];
  return e;
}
function Fn() {}
var Cn = 0.7,
  Qn = 1 / Cn,
  _n = '\\s*([+-]?\\d+)\\s*',
  $n = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*',
  Q = '\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*',
  yi = /^#([0-9a-f]{3,8})$/,
  _i = new RegExp(`^rgb\\(${_n},${_n},${_n}\\)$`),
  xi = new RegExp(`^rgb\\(${Q},${Q},${Q}\\)$`),
  Mi = new RegExp(`^rgba\\(${_n},${_n},${_n},${$n}\\)$`),
  wi = new RegExp(`^rgba\\(${Q},${Q},${Q},${$n}\\)$`),
  bi = new RegExp(`^hsl\\(${$n},${Q},${Q}\\)$`),
  vi = new RegExp(`^hsla\\(${$n},${Q},${Q},${$n}\\)$`),
  fe = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074,
  };
qt(Fn, Un, {
  copy(n) {
    return Object.assign(new this.constructor(), this, n);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: ce,
  formatHex: ce,
  formatHex8: Ti,
  formatHsl: ki,
  formatRgb: le,
  toString: le,
});
function ce() {
  return this.rgb().formatHex();
}
function Ti() {
  return this.rgb().formatHex8();
}
function ki() {
  return fr(this).formatHsl();
}
function le() {
  return this.rgb().formatRgb();
}
function Un(n) {
  var t, e;
  return (
    (n = (n + '').trim().toLowerCase()),
    (t = yi.exec(n))
      ? ((e = t[1].length),
        (t = parseInt(t[1], 16)),
        e === 6
          ? he(t)
          : e === 3
            ? new P(
                ((t >> 8) & 15) | ((t >> 4) & 240),
                ((t >> 4) & 15) | (t & 240),
                ((t & 15) << 4) | (t & 15),
                1
              )
            : e === 8
              ? Ln(
                  (t >> 24) & 255,
                  (t >> 16) & 255,
                  (t >> 8) & 255,
                  (t & 255) / 255
                )
              : e === 4
                ? Ln(
                    ((t >> 12) & 15) | ((t >> 8) & 240),
                    ((t >> 8) & 15) | ((t >> 4) & 240),
                    ((t >> 4) & 15) | (t & 240),
                    (((t & 15) << 4) | (t & 15)) / 255
                  )
                : null)
      : (t = _i.exec(n))
        ? new P(t[1], t[2], t[3], 1)
        : (t = xi.exec(n))
          ? new P((t[1] * 255) / 100, (t[2] * 255) / 100, (t[3] * 255) / 100, 1)
          : (t = Mi.exec(n))
            ? Ln(t[1], t[2], t[3], t[4])
            : (t = wi.exec(n))
              ? Ln(
                  (t[1] * 255) / 100,
                  (t[2] * 255) / 100,
                  (t[3] * 255) / 100,
                  t[4]
                )
              : (t = bi.exec(n))
                ? pe(t[1], t[2] / 100, t[3] / 100, 1)
                : (t = vi.exec(n))
                  ? pe(t[1], t[2] / 100, t[3] / 100, t[4])
                  : fe.hasOwnProperty(n)
                    ? he(fe[n])
                    : n === 'transparent'
                      ? new P(NaN, NaN, NaN, 0)
                      : null
  );
}
function he(n) {
  return new P((n >> 16) & 255, (n >> 8) & 255, n & 255, 1);
}
function Ln(n, t, e, r) {
  return (r <= 0 && (n = t = e = NaN), new P(n, t, e, r));
}
function Ni(n) {
  return (
    n instanceof Fn || (n = Un(n)),
    n ? ((n = n.rgb()), new P(n.r, n.g, n.b, n.opacity)) : new P()
  );
}
function Nt(n, t, e, r) {
  return arguments.length === 1 ? Ni(n) : new P(n, t, e, r ?? 1);
}
function P(n, t, e, r) {
  ((this.r = +n), (this.g = +t), (this.b = +e), (this.opacity = +r));
}
qt(
  P,
  Nt,
  sr(Fn, {
    brighter(n) {
      return (
        (n = n == null ? Qn : Math.pow(Qn, n)),
        new P(this.r * n, this.g * n, this.b * n, this.opacity)
      );
    },
    darker(n) {
      return (
        (n = n == null ? Cn : Math.pow(Cn, n)),
        new P(this.r * n, this.g * n, this.b * n, this.opacity)
      );
    },
    rgb() {
      return this;
    },
    clamp() {
      return new P(ln(this.r), ln(this.g), ln(this.b), Xn(this.opacity));
    },
    displayable() {
      return (
        -0.5 <= this.r &&
        this.r < 255.5 &&
        -0.5 <= this.g &&
        this.g < 255.5 &&
        -0.5 <= this.b &&
        this.b < 255.5 &&
        0 <= this.opacity &&
        this.opacity <= 1
      );
    },
    hex: ge,
    formatHex: ge,
    formatHex8: Si,
    formatRgb: me,
    toString: me,
  })
);
function ge() {
  return `#${fn(this.r)}${fn(this.g)}${fn(this.b)}`;
}
function Si() {
  return `#${fn(this.r)}${fn(this.g)}${fn(this.b)}${fn((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function me() {
  const n = Xn(this.opacity);
  return `${n === 1 ? 'rgb(' : 'rgba('}${ln(this.r)}, ${ln(this.g)}, ${ln(this.b)}${n === 1 ? ')' : `, ${n})`}`;
}
function Xn(n) {
  return isNaN(n) ? 1 : Math.max(0, Math.min(1, n));
}
function ln(n) {
  return Math.max(0, Math.min(255, Math.round(n) || 0));
}
function fn(n) {
  return ((n = ln(n)), (n < 16 ? '0' : '') + n.toString(16));
}
function pe(n, t, e, r) {
  return (
    r <= 0
      ? (n = t = e = NaN)
      : e <= 0 || e >= 1
        ? (n = t = NaN)
        : t <= 0 && (n = NaN),
    new Z(n, t, e, r)
  );
}
function fr(n) {
  if (n instanceof Z) return new Z(n.h, n.s, n.l, n.opacity);
  if ((n instanceof Fn || (n = Un(n)), !n)) return new Z();
  if (n instanceof Z) return n;
  n = n.rgb();
  var t = n.r / 255,
    e = n.g / 255,
    r = n.b / 255,
    o = Math.min(t, e, r),
    i = Math.max(t, e, r),
    u = NaN,
    a = i - o,
    f = (i + o) / 2;
  return (
    a
      ? (t === i
          ? (u = (e - r) / a + (e < r) * 6)
          : e === i
            ? (u = (r - t) / a + 2)
            : (u = (t - e) / a + 4),
        (a /= f < 0.5 ? i + o : 2 - i - o),
        (u *= 60))
      : (a = f > 0 && f < 1 ? 0 : u),
    new Z(u, a, f, n.opacity)
  );
}
function Ci(n, t, e, r) {
  return arguments.length === 1 ? fr(n) : new Z(n, t, e, r ?? 1);
}
function Z(n, t, e, r) {
  ((this.h = +n), (this.s = +t), (this.l = +e), (this.opacity = +r));
}
qt(
  Z,
  Ci,
  sr(Fn, {
    brighter(n) {
      return (
        (n = n == null ? Qn : Math.pow(Qn, n)),
        new Z(this.h, this.s, this.l * n, this.opacity)
      );
    },
    darker(n) {
      return (
        (n = n == null ? Cn : Math.pow(Cn, n)),
        new Z(this.h, this.s, this.l * n, this.opacity)
      );
    },
    rgb() {
      var n = (this.h % 360) + (this.h < 0) * 360,
        t = isNaN(n) || isNaN(this.s) ? 0 : this.s,
        e = this.l,
        r = e + (e < 0.5 ? e : 1 - e) * t,
        o = 2 * e - r;
      return new P(
        ht(n >= 240 ? n - 240 : n + 120, o, r),
        ht(n, o, r),
        ht(n < 120 ? n + 240 : n - 120, o, r),
        this.opacity
      );
    },
    clamp() {
      return new Z(de(this.h), En(this.s), En(this.l), Xn(this.opacity));
    },
    displayable() {
      return (
        ((0 <= this.s && this.s <= 1) || isNaN(this.s)) &&
        0 <= this.l &&
        this.l <= 1 &&
        0 <= this.opacity &&
        this.opacity <= 1
      );
    },
    formatHsl() {
      const n = Xn(this.opacity);
      return `${n === 1 ? 'hsl(' : 'hsla('}${de(this.h)}, ${En(this.s) * 100}%, ${En(this.l) * 100}%${n === 1 ? ')' : `, ${n})`}`;
    },
  })
);
function de(n) {
  return ((n = (n || 0) % 360), n < 0 ? n + 360 : n);
}
function En(n) {
  return Math.max(0, Math.min(1, n || 0));
}
function ht(n, t, e) {
  return (
    (n < 60
      ? t + ((e - t) * n) / 60
      : n < 180
        ? e
        : n < 240
          ? t + ((e - t) * (240 - n)) / 60
          : t) * 255
  );
}
const Yt = n => () => n;
function $i(n, t) {
  return function (e) {
    return n + e * t;
  };
}
function Ui(n, t, e) {
  return (
    (n = Math.pow(n, e)),
    (t = Math.pow(t, e) - n),
    (e = 1 / e),
    function (r) {
      return Math.pow(n + r * t, e);
    }
  );
}
function Di(n) {
  return (n = +n) == 1
    ? cr
    : function (t, e) {
        return e - t ? Ui(t, e, n) : Yt(isNaN(t) ? e : t);
      };
}
function cr(n, t) {
  var e = t - n;
  return e ? $i(n, e) : Yt(isNaN(n) ? t : n);
}
const ye = (function n(t) {
  var e = Di(t);
  function r(o, i) {
    var u = e((o = Nt(o)).r, (i = Nt(i)).r),
      a = e(o.g, i.g),
      f = e(o.b, i.b),
      s = cr(o.opacity, i.opacity);
    return function (h) {
      return (
        (o.r = u(h)),
        (o.g = a(h)),
        (o.b = f(h)),
        (o.opacity = s(h)),
        o + ''
      );
    };
  }
  return ((r.gamma = n), r);
})(1);
function Ai(n, t) {
  t || (t = []);
  var e = n ? Math.min(t.length, n.length) : 0,
    r = t.slice(),
    o;
  return function (i) {
    for (o = 0; o < e; ++o) r[o] = n[o] * (1 - i) + t[o] * i;
    return r;
  };
}
function Fi(n) {
  return ArrayBuffer.isView(n) && !(n instanceof DataView);
}
function qi(n, t) {
  var e = t ? t.length : 0,
    r = n ? Math.min(e, n.length) : 0,
    o = new Array(r),
    i = new Array(e),
    u;
  for (u = 0; u < r; ++u) o[u] = bn(n[u], t[u]);
  for (; u < e; ++u) i[u] = t[u];
  return function (a) {
    for (u = 0; u < r; ++u) i[u] = o[u](a);
    return i;
  };
}
function Yi(n, t) {
  var e = new Date();
  return (
    (n = +n),
    (t = +t),
    function (r) {
      return (e.setTime(n * (1 - r) + t * r), e);
    }
  );
}
function Vn(n, t) {
  return (
    (n = +n),
    (t = +t),
    function (e) {
      return n * (1 - e) + t * e;
    }
  );
}
function Hi(n, t) {
  var e = {},
    r = {},
    o;
  ((n === null || typeof n != 'object') && (n = {}),
    (t === null || typeof t != 'object') && (t = {}));
  for (o in t) o in n ? (e[o] = bn(n[o], t[o])) : (r[o] = t[o]);
  return function (i) {
    for (o in e) r[o] = e[o](i);
    return r;
  };
}
var St = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
  gt = new RegExp(St.source, 'g');
function Pi(n) {
  return function () {
    return n;
  };
}
function Li(n) {
  return function (t) {
    return n(t) + '';
  };
}
function Ei(n, t) {
  var e = (St.lastIndex = gt.lastIndex = 0),
    r,
    o,
    i,
    u = -1,
    a = [],
    f = [];
  for (n = n + '', t = t + ''; (r = St.exec(n)) && (o = gt.exec(t)); )
    ((i = o.index) > e &&
      ((i = t.slice(e, i)), a[u] ? (a[u] += i) : (a[++u] = i)),
      (r = r[0]) === (o = o[0])
        ? a[u]
          ? (a[u] += o)
          : (a[++u] = o)
        : ((a[++u] = null), f.push({ i: u, x: Vn(r, o) })),
      (e = gt.lastIndex));
  return (
    e < t.length && ((i = t.slice(e)), a[u] ? (a[u] += i) : (a[++u] = i)),
    a.length < 2
      ? f[0]
        ? Li(f[0].x)
        : Pi(t)
      : ((t = f.length),
        function (s) {
          for (var h = 0, c; h < t; ++h) a[(c = f[h]).i] = c.x(s);
          return a.join('');
        })
  );
}
function bn(n, t) {
  var e = typeof t,
    r;
  return t == null || e === 'boolean'
    ? Yt(t)
    : (e === 'number'
        ? Vn
        : e === 'string'
          ? (r = Un(t))
            ? ((t = r), ye)
            : Ei
          : t instanceof Un
            ? ye
            : t instanceof Date
              ? Yi
              : Fi(t)
                ? Ai
                : Array.isArray(t)
                  ? qi
                  : (typeof t.valueOf != 'function' &&
                        typeof t.toString != 'function') ||
                      isNaN(t)
                    ? Hi
                    : Vn)(n, t);
}
function Ht(n, t) {
  return (
    (n = +n),
    (t = +t),
    function (e) {
      return Math.round(n * (1 - e) + t * e);
    }
  );
}
function Oi(n, t) {
  t === void 0 && ((t = n), (n = bn));
  for (
    var e = 0, r = t.length - 1, o = t[0], i = new Array(r < 0 ? 0 : r);
    e < r;

  )
    i[e] = n(o, (o = t[++e]));
  return function (u) {
    var a = Math.max(0, Math.min(r - 1, Math.floor((u *= r))));
    return i[a](u - a);
  };
}
function Ii(n) {
  return function () {
    return n;
  };
}
function Gn(n) {
  return +n;
}
var _e = [0, 1];
function q(n) {
  return n;
}
function Ct(n, t) {
  return (t -= n = +n)
    ? function (e) {
        return (e - n) / t;
      }
    : Ii(isNaN(t) ? NaN : 0.5);
}
function Ri(n, t) {
  var e;
  return (
    n > t && ((e = n), (n = t), (t = e)),
    function (r) {
      return Math.max(n, Math.min(t, r));
    }
  );
}
function Wi(n, t, e) {
  var r = n[0],
    o = n[1],
    i = t[0],
    u = t[1];
  return (
    o < r ? ((r = Ct(o, r)), (i = e(u, i))) : ((r = Ct(r, o)), (i = e(i, u))),
    function (a) {
      return i(r(a));
    }
  );
}
function zi(n, t, e) {
  var r = Math.min(n.length, t.length) - 1,
    o = new Array(r),
    i = new Array(r),
    u = -1;
  for (
    n[r] < n[0] && ((n = n.slice().reverse()), (t = t.slice().reverse()));
    ++u < r;

  )
    ((o[u] = Ct(n[u], n[u + 1])), (i[u] = e(t[u], t[u + 1])));
  return function (a) {
    var f = An(n, a, 1, r) - 1;
    return i[f](o[f](a));
  };
}
function qn(n, t) {
  return t
    .domain(n.domain())
    .range(n.range())
    .interpolate(n.interpolate())
    .clamp(n.clamp())
    .unknown(n.unknown());
}
function rt() {
  var n = _e,
    t = _e,
    e = bn,
    r,
    o,
    i,
    u = q,
    a,
    f,
    s;
  function h() {
    var l = Math.min(n.length, t.length);
    return (
      u !== q && (u = Ri(n[0], n[l - 1])),
      (a = l > 2 ? zi : Wi),
      (f = s = null),
      c
    );
  }
  function c(l) {
    return l == null || isNaN((l = +l))
      ? i
      : (f || (f = a(n.map(r), t, e)))(r(u(l)));
  }
  return (
    (c.invert = function (l) {
      return u(o((s || (s = a(t, n.map(r), Vn)))(l)));
    }),
    (c.domain = function (l) {
      return arguments.length ? ((n = Array.from(l, Gn)), h()) : n.slice();
    }),
    (c.range = function (l) {
      return arguments.length ? ((t = Array.from(l)), h()) : t.slice();
    }),
    (c.rangeRound = function (l) {
      return ((t = Array.from(l)), (e = Ht), h());
    }),
    (c.clamp = function (l) {
      return arguments.length ? ((u = l ? !0 : q), h()) : u !== q;
    }),
    (c.interpolate = function (l) {
      return arguments.length ? ((e = l), h()) : e;
    }),
    (c.unknown = function (l) {
      return arguments.length ? ((i = l), c) : i;
    }),
    function (l, m) {
      return ((r = l), (o = m), h());
    }
  );
}
function Pt() {
  return rt()(q, q);
}
function Zi(n) {
  return Math.abs((n = Math.round(n))) >= 1e21
    ? n.toLocaleString('en').replace(/,/g, '')
    : n.toString(10);
}
function Jn(n, t) {
  if (
    (e = (n = t ? n.toExponential(t - 1) : n.toExponential()).indexOf('e')) < 0
  )
    return null;
  var e,
    r = n.slice(0, e);
  return [r.length > 1 ? r[0] + r.slice(2) : r, +n.slice(e + 1)];
}
function xn(n) {
  return ((n = Jn(Math.abs(n))), n ? n[1] : NaN);
}
function Bi(n, t) {
  return function (e, r) {
    for (
      var o = e.length, i = [], u = 0, a = n[0], f = 0;
      o > 0 &&
      a > 0 &&
      (f + a + 1 > r && (a = Math.max(1, r - f)),
      i.push(e.substring((o -= a), o + a)),
      !((f += a + 1) > r));

    )
      a = n[(u = (u + 1) % n.length)];
    return i.reverse().join(t);
  };
}
function Qi(n) {
  return function (t) {
    return t.replace(/[0-9]/g, function (e) {
      return n[+e];
    });
  };
}
var Xi =
  /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function Dn(n) {
  if (!(t = Xi.exec(n))) throw new Error('invalid format: ' + n);
  var t;
  return new Lt({
    fill: t[1],
    align: t[2],
    sign: t[3],
    symbol: t[4],
    zero: t[5],
    width: t[6],
    comma: t[7],
    precision: t[8] && t[8].slice(1),
    trim: t[9],
    type: t[10],
  });
}
Dn.prototype = Lt.prototype;
function Lt(n) {
  ((this.fill = n.fill === void 0 ? ' ' : n.fill + ''),
    (this.align = n.align === void 0 ? '>' : n.align + ''),
    (this.sign = n.sign === void 0 ? '-' : n.sign + ''),
    (this.symbol = n.symbol === void 0 ? '' : n.symbol + ''),
    (this.zero = !!n.zero),
    (this.width = n.width === void 0 ? void 0 : +n.width),
    (this.comma = !!n.comma),
    (this.precision = n.precision === void 0 ? void 0 : +n.precision),
    (this.trim = !!n.trim),
    (this.type = n.type === void 0 ? '' : n.type + ''));
}
Lt.prototype.toString = function () {
  return (
    this.fill +
    this.align +
    this.sign +
    this.symbol +
    (this.zero ? '0' : '') +
    (this.width === void 0 ? '' : Math.max(1, this.width | 0)) +
    (this.comma ? ',' : '') +
    (this.precision === void 0 ? '' : '.' + Math.max(0, this.precision | 0)) +
    (this.trim ? '~' : '') +
    this.type
  );
};
function Vi(n) {
  n: for (var t = n.length, e = 1, r = -1, o; e < t; ++e)
    switch (n[e]) {
      case '.':
        r = o = e;
        break;
      case '0':
        (r === 0 && (r = e), (o = e));
        break;
      default:
        if (!+n[e]) break n;
        r > 0 && (r = 0);
        break;
    }
  return r > 0 ? n.slice(0, r) + n.slice(o + 1) : n;
}
var lr;
function Gi(n, t) {
  var e = Jn(n, t);
  if (!e) return n + '';
  var r = e[0],
    o = e[1],
    i = o - (lr = Math.max(-8, Math.min(8, Math.floor(o / 3))) * 3) + 1,
    u = r.length;
  return i === u
    ? r
    : i > u
      ? r + new Array(i - u + 1).join('0')
      : i > 0
        ? r.slice(0, i) + '.' + r.slice(i)
        : '0.' + new Array(1 - i).join('0') + Jn(n, Math.max(0, t + i - 1))[0];
}
function xe(n, t) {
  var e = Jn(n, t);
  if (!e) return n + '';
  var r = e[0],
    o = e[1];
  return o < 0
    ? '0.' + new Array(-o).join('0') + r
    : r.length > o + 1
      ? r.slice(0, o + 1) + '.' + r.slice(o + 1)
      : r + new Array(o - r.length + 2).join('0');
}
const Me = {
  '%': (n, t) => (n * 100).toFixed(t),
  b: n => Math.round(n).toString(2),
  c: n => n + '',
  d: Zi,
  e: (n, t) => n.toExponential(t),
  f: (n, t) => n.toFixed(t),
  g: (n, t) => n.toPrecision(t),
  o: n => Math.round(n).toString(8),
  p: (n, t) => xe(n * 100, t),
  r: xe,
  s: Gi,
  X: n => Math.round(n).toString(16).toUpperCase(),
  x: n => Math.round(n).toString(16),
};
function we(n) {
  return n;
}
var be = Array.prototype.map,
  ve = [
    'y',
    'z',
    'a',
    'f',
    'p',
    'n',
    'µ',
    'm',
    '',
    'k',
    'M',
    'G',
    'T',
    'P',
    'E',
    'Z',
    'Y',
  ];
function Ji(n) {
  var t =
      n.grouping === void 0 || n.thousands === void 0
        ? we
        : Bi(be.call(n.grouping, Number), n.thousands + ''),
    e = n.currency === void 0 ? '' : n.currency[0] + '',
    r = n.currency === void 0 ? '' : n.currency[1] + '',
    o = n.decimal === void 0 ? '.' : n.decimal + '',
    i = n.numerals === void 0 ? we : Qi(be.call(n.numerals, String)),
    u = n.percent === void 0 ? '%' : n.percent + '',
    a = n.minus === void 0 ? '−' : n.minus + '',
    f = n.nan === void 0 ? 'NaN' : n.nan + '';
  function s(c) {
    c = Dn(c);
    var l = c.fill,
      m = c.align,
      d = c.sign,
      y = c.symbol,
      w = c.zero,
      b = c.width,
      A = c.comma,
      k = c.precision,
      C = c.trim,
      $ = c.type;
    ($ === 'n'
      ? ((A = !0), ($ = 'g'))
      : Me[$] || (k === void 0 && (k = 12), (C = !0), ($ = 'g')),
      (w || (l === '0' && m === '=')) && ((w = !0), (l = '0'), (m = '=')));
    var _ =
        y === '$'
          ? e
          : y === '#' && /[boxX]/.test($)
            ? '0' + $.toLowerCase()
            : '',
      F = y === '$' ? r : /[%p]/.test($) ? u : '',
      un = Me[$],
      ft = /[defgprs%]/.test($);
    k =
      k === void 0
        ? 6
        : /[gprs]/.test($)
          ? Math.max(1, Math.min(21, k))
          : Math.max(0, Math.min(20, k));
    function Hn(M) {
      var X = _,
        Y = F,
        tn,
        Pn,
        mn;
      if ($ === 'c') ((Y = un(M) + Y), (M = ''));
      else {
        M = +M;
        var pn = M < 0 || 1 / M < 0;
        if (
          ((M = isNaN(M) ? f : un(Math.abs(M), k)),
          C && (M = Vi(M)),
          pn && +M == 0 && d !== '+' && (pn = !1),
          (X =
            (pn ? (d === '(' ? d : a) : d === '-' || d === '(' ? '' : d) + X),
          (Y =
            ($ === 's' ? ve[8 + lr / 3] : '') +
            Y +
            (pn && d === '(' ? ')' : '')),
          ft)
        ) {
          for (tn = -1, Pn = M.length; ++tn < Pn; )
            if (((mn = M.charCodeAt(tn)), 48 > mn || mn > 57)) {
              ((Y = (mn === 46 ? o + M.slice(tn + 1) : M.slice(tn)) + Y),
                (M = M.slice(0, tn)));
              break;
            }
        }
      }
      A && !w && (M = t(M, 1 / 0));
      var dn = X.length + M.length + Y.length,
        z = dn < b ? new Array(b - dn + 1).join(l) : '';
      switch (
        (A && w && ((M = t(z + M, z.length ? b - Y.length : 1 / 0)), (z = '')),
        m)
      ) {
        case '<':
          M = X + M + Y + z;
          break;
        case '=':
          M = X + z + M + Y;
          break;
        case '^':
          M = z.slice(0, (dn = z.length >> 1)) + X + M + Y + z.slice(dn);
          break;
        default:
          M = z + X + M + Y;
          break;
      }
      return i(M);
    }
    return (
      (Hn.toString = function () {
        return c + '';
      }),
      Hn
    );
  }
  function h(c, l) {
    var m = s(((c = Dn(c)), (c.type = 'f'), c)),
      d = Math.max(-8, Math.min(8, Math.floor(xn(l) / 3))) * 3,
      y = Math.pow(10, -d),
      w = ve[8 + d / 3];
    return function (b) {
      return m(y * b) + w;
    };
  }
  return { format: s, formatPrefix: h };
}
var On, Et, hr;
ji({ thousands: ',', grouping: [3], currency: ['$', ''] });
function ji(n) {
  return ((On = Ji(n)), (Et = On.format), (hr = On.formatPrefix), On);
}
function Ki(n) {
  return Math.max(0, -xn(Math.abs(n)));
}
function no(n, t) {
  return Math.max(
    0,
    Math.max(-8, Math.min(8, Math.floor(xn(t) / 3))) * 3 - xn(Math.abs(n))
  );
}
function to(n, t) {
  return (
    (n = Math.abs(n)),
    (t = Math.abs(t) - n),
    Math.max(0, xn(t) - xn(n)) + 1
  );
}
function gr(n, t, e, r) {
  var o = Tt(n, t, e),
    i;
  switch (((r = Dn(r ?? ',f')), r.type)) {
    case 's': {
      var u = Math.max(Math.abs(n), Math.abs(t));
      return (
        r.precision == null && !isNaN((i = no(o, u))) && (r.precision = i),
        hr(r, u)
      );
    }
    case '':
    case 'e':
    case 'g':
    case 'p':
    case 'r': {
      r.precision == null &&
        !isNaN((i = to(o, Math.max(Math.abs(n), Math.abs(t))))) &&
        (r.precision = i - (r.type === 'e'));
      break;
    }
    case 'f':
    case '%': {
      r.precision == null &&
        !isNaN((i = Ki(o))) &&
        (r.precision = i - (r.type === '%') * 2);
      break;
    }
  }
  return Et(r);
}
function rn(n) {
  var t = n.domain;
  return (
    (n.ticks = function (e) {
      var r = t();
      return bt(r[0], r[r.length - 1], e ?? 10);
    }),
    (n.tickFormat = function (e, r) {
      var o = t();
      return gr(o[0], o[o.length - 1], e ?? 10, r);
    }),
    (n.nice = function (e) {
      e == null && (e = 10);
      var r = t(),
        o = 0,
        i = r.length - 1,
        u = r[o],
        a = r[i],
        f,
        s,
        h = 10;
      for (
        a < u && ((s = u), (u = a), (a = s), (s = o), (o = i), (i = s));
        h-- > 0;

      ) {
        if (((s = vt(u, a, e)), s === f)) return ((r[o] = u), (r[i] = a), t(r));
        if (s > 0) ((u = Math.floor(u / s) * s), (a = Math.ceil(a / s) * s));
        else if (s < 0)
          ((u = Math.ceil(u * s) / s), (a = Math.floor(a * s) / s));
        else break;
        f = s;
      }
      return n;
    }),
    n
  );
}
function mr() {
  var n = Pt();
  return (
    (n.copy = function () {
      return qn(n, mr());
    }),
    W.apply(n, arguments),
    rn(n)
  );
}
function pr(n) {
  var t;
  function e(r) {
    return r == null || isNaN((r = +r)) ? t : r;
  }
  return (
    (e.invert = e),
    (e.domain = e.range =
      function (r) {
        return arguments.length ? ((n = Array.from(r, Gn)), e) : n.slice();
      }),
    (e.unknown = function (r) {
      return arguments.length ? ((t = r), e) : t;
    }),
    (e.copy = function () {
      return pr(n).unknown(t);
    }),
    (n = arguments.length ? Array.from(n, Gn) : [0, 1]),
    rn(e)
  );
}
function dr(n, t) {
  n = n.slice();
  var e = 0,
    r = n.length - 1,
    o = n[e],
    i = n[r],
    u;
  return (
    i < o && ((u = e), (e = r), (r = u), (u = o), (o = i), (i = u)),
    (n[e] = t.floor(o)),
    (n[r] = t.ceil(i)),
    n
  );
}
function Te(n) {
  return Math.log(n);
}
function ke(n) {
  return Math.exp(n);
}
function eo(n) {
  return -Math.log(-n);
}
function ro(n) {
  return -Math.exp(-n);
}
function io(n) {
  return isFinite(n) ? +('1e' + n) : n < 0 ? 0 : n;
}
function oo(n) {
  return n === 10 ? io : n === Math.E ? Math.exp : t => Math.pow(n, t);
}
function uo(n) {
  return n === Math.E
    ? Math.log
    : (n === 10 && Math.log10) ||
        (n === 2 && Math.log2) ||
        ((n = Math.log(n)), t => Math.log(t) / n);
}
function Ne(n) {
  return (t, e) => -n(-t, e);
}
function Ot(n) {
  const t = n(Te, ke),
    e = t.domain;
  let r = 10,
    o,
    i;
  function u() {
    return (
      (o = uo(r)),
      (i = oo(r)),
      e()[0] < 0 ? ((o = Ne(o)), (i = Ne(i)), n(eo, ro)) : n(Te, ke),
      t
    );
  }
  return (
    (t.base = function (a) {
      return arguments.length ? ((r = +a), u()) : r;
    }),
    (t.domain = function (a) {
      return arguments.length ? (e(a), u()) : e();
    }),
    (t.ticks = a => {
      const f = e();
      let s = f[0],
        h = f[f.length - 1];
      const c = h < s;
      c && ([s, h] = [h, s]);
      let l = o(s),
        m = o(h),
        d,
        y;
      const w = a == null ? 10 : +a;
      let b = [];
      if (!(r % 1) && m - l < w) {
        if (((l = Math.floor(l)), (m = Math.ceil(m)), s > 0)) {
          for (; l <= m; ++l)
            for (d = 1; d < r; ++d)
              if (((y = l < 0 ? d / i(-l) : d * i(l)), !(y < s))) {
                if (y > h) break;
                b.push(y);
              }
        } else
          for (; l <= m; ++l)
            for (d = r - 1; d >= 1; --d)
              if (((y = l > 0 ? d / i(-l) : d * i(l)), !(y < s))) {
                if (y > h) break;
                b.push(y);
              }
        b.length * 2 < w && (b = bt(s, h, w));
      } else b = bt(l, m, Math.min(m - l, w)).map(i);
      return c ? b.reverse() : b;
    }),
    (t.tickFormat = (a, f) => {
      if (
        (a == null && (a = 10),
        f == null && (f = r === 10 ? 's' : ','),
        typeof f != 'function' &&
          (!(r % 1) && (f = Dn(f)).precision == null && (f.trim = !0),
          (f = Et(f))),
        a === 1 / 0)
      )
        return f;
      const s = Math.max(1, (r * a) / t.ticks().length);
      return h => {
        let c = h / i(Math.round(o(h)));
        return (c * r < r - 0.5 && (c *= r), c <= s ? f(h) : '');
      };
    }),
    (t.nice = () =>
      e(
        dr(e(), {
          floor: a => i(Math.floor(o(a))),
          ceil: a => i(Math.ceil(o(a))),
        })
      )),
    t
  );
}
function yr() {
  const n = Ot(rt()).domain([1, 10]);
  return (
    (n.copy = () => qn(n, yr()).base(n.base())),
    W.apply(n, arguments),
    n
  );
}
function Se(n) {
  return function (t) {
    return Math.sign(t) * Math.log1p(Math.abs(t / n));
  };
}
function Ce(n) {
  return function (t) {
    return Math.sign(t) * Math.expm1(Math.abs(t)) * n;
  };
}
function It(n) {
  var t = 1,
    e = n(Se(t), Ce(t));
  return (
    (e.constant = function (r) {
      return arguments.length ? n(Se((t = +r)), Ce(t)) : t;
    }),
    rn(e)
  );
}
function _r() {
  var n = It(rt());
  return (
    (n.copy = function () {
      return qn(n, _r()).constant(n.constant());
    }),
    W.apply(n, arguments)
  );
}
function $e(n) {
  return function (t) {
    return t < 0 ? -Math.pow(-t, n) : Math.pow(t, n);
  };
}
function ao(n) {
  return n < 0 ? -Math.sqrt(-n) : Math.sqrt(n);
}
function so(n) {
  return n < 0 ? -n * n : n * n;
}
function Rt(n) {
  var t = n(q, q),
    e = 1;
  function r() {
    return e === 1 ? n(q, q) : e === 0.5 ? n(ao, so) : n($e(e), $e(1 / e));
  }
  return (
    (t.exponent = function (o) {
      return arguments.length ? ((e = +o), r()) : e;
    }),
    rn(t)
  );
}
function Wt() {
  var n = Rt(rt());
  return (
    (n.copy = function () {
      return qn(n, Wt()).exponent(n.exponent());
    }),
    W.apply(n, arguments),
    n
  );
}
function fo() {
  return Wt.apply(null, arguments).exponent(0.5);
}
function Ue(n) {
  return Math.sign(n) * n * n;
}
function co(n) {
  return Math.sign(n) * Math.sqrt(Math.abs(n));
}
function xr() {
  var n = Pt(),
    t = [0, 1],
    e = !1,
    r;
  function o(i) {
    var u = co(n(i));
    return isNaN(u) ? r : e ? Math.round(u) : u;
  }
  return (
    (o.invert = function (i) {
      return n.invert(Ue(i));
    }),
    (o.domain = function (i) {
      return arguments.length ? (n.domain(i), o) : n.domain();
    }),
    (o.range = function (i) {
      return arguments.length
        ? (n.range((t = Array.from(i, Gn)).map(Ue)), o)
        : t.slice();
    }),
    (o.rangeRound = function (i) {
      return o.range(i).round(!0);
    }),
    (o.round = function (i) {
      return arguments.length ? ((e = !!i), o) : e;
    }),
    (o.clamp = function (i) {
      return arguments.length ? (n.clamp(i), o) : n.clamp();
    }),
    (o.unknown = function (i) {
      return arguments.length ? ((r = i), o) : r;
    }),
    (o.copy = function () {
      return xr(n.domain(), t).round(e).clamp(n.clamp()).unknown(r);
    }),
    W.apply(o, arguments),
    rn(o)
  );
}
function Mr() {
  var n = [],
    t = [],
    e = [],
    r;
  function o() {
    var u = 0,
      a = Math.max(1, t.length);
    for (e = new Array(a - 1); ++u < a; ) e[u - 1] = mi(n, u / a);
    return i;
  }
  function i(u) {
    return u == null || isNaN((u = +u)) ? r : t[An(e, u)];
  }
  return (
    (i.invertExtent = function (u) {
      var a = t.indexOf(u);
      return a < 0
        ? [NaN, NaN]
        : [a > 0 ? e[a - 1] : n[0], a < e.length ? e[a] : n[n.length - 1]];
    }),
    (i.domain = function (u) {
      if (!arguments.length) return n.slice();
      n = [];
      for (let a of u) a != null && !isNaN((a = +a)) && n.push(a);
      return (n.sort(en), o());
    }),
    (i.range = function (u) {
      return arguments.length ? ((t = Array.from(u)), o()) : t.slice();
    }),
    (i.unknown = function (u) {
      return arguments.length ? ((r = u), i) : r;
    }),
    (i.quantiles = function () {
      return e.slice();
    }),
    (i.copy = function () {
      return Mr().domain(n).range(t).unknown(r);
    }),
    W.apply(i, arguments)
  );
}
function wr() {
  var n = 0,
    t = 1,
    e = 1,
    r = [0.5],
    o = [0, 1],
    i;
  function u(f) {
    return f != null && f <= f ? o[An(r, f, 0, e)] : i;
  }
  function a() {
    var f = -1;
    for (r = new Array(e); ++f < e; )
      r[f] = ((f + 1) * t - (f - e) * n) / (e + 1);
    return u;
  }
  return (
    (u.domain = function (f) {
      return arguments.length
        ? (([n, t] = f), (n = +n), (t = +t), a())
        : [n, t];
    }),
    (u.range = function (f) {
      return arguments.length
        ? ((e = (o = Array.from(f)).length - 1), a())
        : o.slice();
    }),
    (u.invertExtent = function (f) {
      var s = o.indexOf(f);
      return s < 0
        ? [NaN, NaN]
        : s < 1
          ? [n, r[0]]
          : s >= e
            ? [r[e - 1], t]
            : [r[s - 1], r[s]];
    }),
    (u.unknown = function (f) {
      return (arguments.length && (i = f), u);
    }),
    (u.thresholds = function () {
      return r.slice();
    }),
    (u.copy = function () {
      return wr().domain([n, t]).range(o).unknown(i);
    }),
    W.apply(rn(u), arguments)
  );
}
function br() {
  var n = [0.5],
    t = [0, 1],
    e,
    r = 1;
  function o(i) {
    return i != null && i <= i ? t[An(n, i, 0, r)] : e;
  }
  return (
    (o.domain = function (i) {
      return arguments.length
        ? ((n = Array.from(i)), (r = Math.min(n.length, t.length - 1)), o)
        : n.slice();
    }),
    (o.range = function (i) {
      return arguments.length
        ? ((t = Array.from(i)), (r = Math.min(n.length, t.length - 1)), o)
        : t.slice();
    }),
    (o.invertExtent = function (i) {
      var u = t.indexOf(i);
      return [n[u - 1], n[u]];
    }),
    (o.unknown = function (i) {
      return arguments.length ? ((e = i), o) : e;
    }),
    (o.copy = function () {
      return br().domain(n).range(t).unknown(e);
    }),
    W.apply(o, arguments)
  );
}
const mt = new Date(),
  pt = new Date();
function U(n, t, e, r) {
  function o(i) {
    return (n((i = arguments.length === 0 ? new Date() : new Date(+i))), i);
  }
  return (
    (o.floor = i => (n((i = new Date(+i))), i)),
    (o.ceil = i => (n((i = new Date(i - 1))), t(i, 1), n(i), i)),
    (o.round = i => {
      const u = o(i),
        a = o.ceil(i);
      return i - u < a - i ? u : a;
    }),
    (o.offset = (i, u) => (
      t((i = new Date(+i)), u == null ? 1 : Math.floor(u)),
      i
    )),
    (o.range = (i, u, a) => {
      const f = [];
      if (
        ((i = o.ceil(i)),
        (a = a == null ? 1 : Math.floor(a)),
        !(i < u) || !(a > 0))
      )
        return f;
      let s;
      do (f.push((s = new Date(+i))), t(i, a), n(i));
      while (s < i && i < u);
      return f;
    }),
    (o.filter = i =>
      U(
        u => {
          if (u >= u) for (; n(u), !i(u); ) u.setTime(u - 1);
        },
        (u, a) => {
          if (u >= u)
            if (a < 0) for (; ++a <= 0; ) for (; t(u, -1), !i(u); );
            else for (; --a >= 0; ) for (; t(u, 1), !i(u); );
        }
      )),
    e &&
      ((o.count = (i, u) => (
        mt.setTime(+i),
        pt.setTime(+u),
        n(mt),
        n(pt),
        Math.floor(e(mt, pt))
      )),
      (o.every = i => (
        (i = Math.floor(i)),
        !isFinite(i) || !(i > 0)
          ? null
          : i > 1
            ? o.filter(r ? u => r(u) % i === 0 : u => o.count(0, u) % i === 0)
            : o
      ))),
    o
  );
}
const jn = U(
  () => {},
  (n, t) => {
    n.setTime(+n + t);
  },
  (n, t) => t - n
);
jn.every = n => (
  (n = Math.floor(n)),
  !isFinite(n) || !(n > 0)
    ? null
    : n > 1
      ? U(
          t => {
            t.setTime(Math.floor(t / n) * n);
          },
          (t, e) => {
            t.setTime(+t + e * n);
          },
          (t, e) => (e - t) / n
        )
      : jn
);
jn.range;
const V = 1e3,
  R = V * 60,
  G = R * 60,
  J = G * 24,
  zt = J * 7,
  De = J * 30,
  dt = J * 365,
  cn = U(
    n => {
      n.setTime(n - n.getMilliseconds());
    },
    (n, t) => {
      n.setTime(+n + t * V);
    },
    (n, t) => (t - n) / V,
    n => n.getUTCSeconds()
  );
cn.range;
const Zt = U(
  n => {
    n.setTime(n - n.getMilliseconds() - n.getSeconds() * V);
  },
  (n, t) => {
    n.setTime(+n + t * R);
  },
  (n, t) => (t - n) / R,
  n => n.getMinutes()
);
Zt.range;
const Bt = U(
  n => {
    n.setUTCSeconds(0, 0);
  },
  (n, t) => {
    n.setTime(+n + t * R);
  },
  (n, t) => (t - n) / R,
  n => n.getUTCMinutes()
);
Bt.range;
const Qt = U(
  n => {
    n.setTime(
      n - n.getMilliseconds() - n.getSeconds() * V - n.getMinutes() * R
    );
  },
  (n, t) => {
    n.setTime(+n + t * G);
  },
  (n, t) => (t - n) / G,
  n => n.getHours()
);
Qt.range;
const Xt = U(
  n => {
    n.setUTCMinutes(0, 0, 0);
  },
  (n, t) => {
    n.setTime(+n + t * G);
  },
  (n, t) => (t - n) / G,
  n => n.getUTCHours()
);
Xt.range;
const Yn = U(
  n => n.setHours(0, 0, 0, 0),
  (n, t) => n.setDate(n.getDate() + t),
  (n, t) => (t - n - (t.getTimezoneOffset() - n.getTimezoneOffset()) * R) / J,
  n => n.getDate() - 1
);
Yn.range;
const it = U(
  n => {
    n.setUTCHours(0, 0, 0, 0);
  },
  (n, t) => {
    n.setUTCDate(n.getUTCDate() + t);
  },
  (n, t) => (t - n) / J,
  n => n.getUTCDate() - 1
);
it.range;
const vr = U(
  n => {
    n.setUTCHours(0, 0, 0, 0);
  },
  (n, t) => {
    n.setUTCDate(n.getUTCDate() + t);
  },
  (n, t) => (t - n) / J,
  n => Math.floor(n / J)
);
vr.range;
function hn(n) {
  return U(
    t => {
      (t.setDate(t.getDate() - ((t.getDay() + 7 - n) % 7)),
        t.setHours(0, 0, 0, 0));
    },
    (t, e) => {
      t.setDate(t.getDate() + e * 7);
    },
    (t, e) => (e - t - (e.getTimezoneOffset() - t.getTimezoneOffset()) * R) / zt
  );
}
const ot = hn(0),
  Kn = hn(1),
  lo = hn(2),
  ho = hn(3),
  Mn = hn(4),
  go = hn(5),
  mo = hn(6);
ot.range;
Kn.range;
lo.range;
ho.range;
Mn.range;
go.range;
mo.range;
function gn(n) {
  return U(
    t => {
      (t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 7 - n) % 7)),
        t.setUTCHours(0, 0, 0, 0));
    },
    (t, e) => {
      t.setUTCDate(t.getUTCDate() + e * 7);
    },
    (t, e) => (e - t) / zt
  );
}
const ut = gn(0),
  nt = gn(1),
  po = gn(2),
  yo = gn(3),
  wn = gn(4),
  _o = gn(5),
  xo = gn(6);
ut.range;
nt.range;
po.range;
yo.range;
wn.range;
_o.range;
xo.range;
const Vt = U(
  n => {
    (n.setDate(1), n.setHours(0, 0, 0, 0));
  },
  (n, t) => {
    n.setMonth(n.getMonth() + t);
  },
  (n, t) =>
    t.getMonth() - n.getMonth() + (t.getFullYear() - n.getFullYear()) * 12,
  n => n.getMonth()
);
Vt.range;
const Gt = U(
  n => {
    (n.setUTCDate(1), n.setUTCHours(0, 0, 0, 0));
  },
  (n, t) => {
    n.setUTCMonth(n.getUTCMonth() + t);
  },
  (n, t) =>
    t.getUTCMonth() -
    n.getUTCMonth() +
    (t.getUTCFullYear() - n.getUTCFullYear()) * 12,
  n => n.getUTCMonth()
);
Gt.range;
const j = U(
  n => {
    (n.setMonth(0, 1), n.setHours(0, 0, 0, 0));
  },
  (n, t) => {
    n.setFullYear(n.getFullYear() + t);
  },
  (n, t) => t.getFullYear() - n.getFullYear(),
  n => n.getFullYear()
);
j.every = n =>
  !isFinite((n = Math.floor(n))) || !(n > 0)
    ? null
    : U(
        t => {
          (t.setFullYear(Math.floor(t.getFullYear() / n) * n),
            t.setMonth(0, 1),
            t.setHours(0, 0, 0, 0));
        },
        (t, e) => {
          t.setFullYear(t.getFullYear() + e * n);
        }
      );
j.range;
const K = U(
  n => {
    (n.setUTCMonth(0, 1), n.setUTCHours(0, 0, 0, 0));
  },
  (n, t) => {
    n.setUTCFullYear(n.getUTCFullYear() + t);
  },
  (n, t) => t.getUTCFullYear() - n.getUTCFullYear(),
  n => n.getUTCFullYear()
);
K.every = n =>
  !isFinite((n = Math.floor(n))) || !(n > 0)
    ? null
    : U(
        t => {
          (t.setUTCFullYear(Math.floor(t.getUTCFullYear() / n) * n),
            t.setUTCMonth(0, 1),
            t.setUTCHours(0, 0, 0, 0));
        },
        (t, e) => {
          t.setUTCFullYear(t.getUTCFullYear() + e * n);
        }
      );
K.range;
function Tr(n, t, e, r, o, i) {
  const u = [
    [cn, 1, V],
    [cn, 5, 5 * V],
    [cn, 15, 15 * V],
    [cn, 30, 30 * V],
    [i, 1, R],
    [i, 5, 5 * R],
    [i, 15, 15 * R],
    [i, 30, 30 * R],
    [o, 1, G],
    [o, 3, 3 * G],
    [o, 6, 6 * G],
    [o, 12, 12 * G],
    [r, 1, J],
    [r, 2, 2 * J],
    [e, 1, zt],
    [t, 1, De],
    [t, 3, 3 * De],
    [n, 1, dt],
  ];
  function a(s, h, c) {
    const l = h < s;
    l && ([s, h] = [h, s]);
    const m = c && typeof c.range == 'function' ? c : f(s, h, c),
      d = m ? m.range(s, +h + 1) : [];
    return l ? d.reverse() : d;
  }
  function f(s, h, c) {
    const l = Math.abs(h - s) / c,
      m = Dt(([, , w]) => w).right(u, l);
    if (m === u.length) return n.every(Tt(s / dt, h / dt, c));
    if (m === 0) return jn.every(Math.max(Tt(s, h, c), 1));
    const [d, y] = u[l / u[m - 1][2] < u[m][2] / l ? m - 1 : m];
    return d.every(y);
  }
  return [a, f];
}
const [Mo, wo] = Tr(K, Gt, ut, vr, Xt, Bt),
  [bo, vo] = Tr(j, Vt, ot, Yn, Qt, Zt);
function yt(n) {
  if (0 <= n.y && n.y < 100) {
    var t = new Date(-1, n.m, n.d, n.H, n.M, n.S, n.L);
    return (t.setFullYear(n.y), t);
  }
  return new Date(n.y, n.m, n.d, n.H, n.M, n.S, n.L);
}
function _t(n) {
  if (0 <= n.y && n.y < 100) {
    var t = new Date(Date.UTC(-1, n.m, n.d, n.H, n.M, n.S, n.L));
    return (t.setUTCFullYear(n.y), t);
  }
  return new Date(Date.UTC(n.y, n.m, n.d, n.H, n.M, n.S, n.L));
}
function Tn(n, t, e) {
  return { y: n, m: t, d: e, H: 0, M: 0, S: 0, L: 0 };
}
function To(n) {
  var t = n.dateTime,
    e = n.date,
    r = n.time,
    o = n.periods,
    i = n.days,
    u = n.shortDays,
    a = n.months,
    f = n.shortMonths,
    s = kn(o),
    h = Nn(o),
    c = kn(i),
    l = Nn(i),
    m = kn(u),
    d = Nn(u),
    y = kn(a),
    w = Nn(a),
    b = kn(f),
    A = Nn(f),
    k = {
      a: pn,
      A: dn,
      b: z,
      B: Lr,
      c: null,
      d: Pe,
      e: Pe,
      f: Qo,
      g: ru,
      G: ou,
      H: zo,
      I: Zo,
      j: Bo,
      L: kr,
      m: Xo,
      M: Vo,
      p: Er,
      q: Or,
      Q: Oe,
      s: Ie,
      S: Go,
      u: Jo,
      U: jo,
      V: Ko,
      w: nu,
      W: tu,
      x: null,
      X: null,
      y: eu,
      Y: iu,
      Z: uu,
      '%': Ee,
    },
    C = {
      a: Ir,
      A: Rr,
      b: Wr,
      B: zr,
      c: null,
      d: Le,
      e: Le,
      f: cu,
      g: Mu,
      G: bu,
      H: au,
      I: su,
      j: fu,
      L: Sr,
      m: lu,
      M: hu,
      p: Zr,
      q: Br,
      Q: Oe,
      s: Ie,
      S: gu,
      u: mu,
      U: pu,
      V: du,
      w: yu,
      W: _u,
      x: null,
      X: null,
      y: xu,
      Y: wu,
      Z: vu,
      '%': Ee,
    },
    $ = {
      a: Hn,
      A: M,
      b: X,
      B: Y,
      c: tn,
      d: Ye,
      e: Ye,
      f: Oo,
      g: qe,
      G: Fe,
      H: He,
      I: He,
      j: Ho,
      L: Eo,
      m: Yo,
      M: Po,
      p: ft,
      q: qo,
      Q: Ro,
      s: Wo,
      S: Lo,
      u: $o,
      U: Uo,
      V: Do,
      w: Co,
      W: Ao,
      x: Pn,
      X: mn,
      y: qe,
      Y: Fe,
      Z: Fo,
      '%': Io,
    };
  ((k.x = _(e, k)),
    (k.X = _(r, k)),
    (k.c = _(t, k)),
    (C.x = _(e, C)),
    (C.X = _(r, C)),
    (C.c = _(t, C)));
  function _(p, x) {
    return function (v) {
      var g = [],
        H = -1,
        N = 0,
        L = p.length,
        E,
        an,
        ne;
      for (v instanceof Date || (v = new Date(+v)); ++H < L; )
        p.charCodeAt(H) === 37 &&
          (g.push(p.slice(N, H)),
          (an = Ae[(E = p.charAt(++H))]) != null
            ? (E = p.charAt(++H))
            : (an = E === 'e' ? ' ' : '0'),
          (ne = x[E]) && (E = ne(v, an)),
          g.push(E),
          (N = H + 1));
      return (g.push(p.slice(N, H)), g.join(''));
    };
  }
  function F(p, x) {
    return function (v) {
      var g = Tn(1900, void 0, 1),
        H = un(g, p, (v += ''), 0),
        N,
        L;
      if (H != v.length) return null;
      if ('Q' in g) return new Date(g.Q);
      if ('s' in g) return new Date(g.s * 1e3 + ('L' in g ? g.L : 0));
      if (
        (x && !('Z' in g) && (g.Z = 0),
        'p' in g && (g.H = (g.H % 12) + g.p * 12),
        g.m === void 0 && (g.m = 'q' in g ? g.q : 0),
        'V' in g)
      ) {
        if (g.V < 1 || g.V > 53) return null;
        ('w' in g || (g.w = 1),
          'Z' in g
            ? ((N = _t(Tn(g.y, 0, 1))),
              (L = N.getUTCDay()),
              (N = L > 4 || L === 0 ? nt.ceil(N) : nt(N)),
              (N = it.offset(N, (g.V - 1) * 7)),
              (g.y = N.getUTCFullYear()),
              (g.m = N.getUTCMonth()),
              (g.d = N.getUTCDate() + ((g.w + 6) % 7)))
            : ((N = yt(Tn(g.y, 0, 1))),
              (L = N.getDay()),
              (N = L > 4 || L === 0 ? Kn.ceil(N) : Kn(N)),
              (N = Yn.offset(N, (g.V - 1) * 7)),
              (g.y = N.getFullYear()),
              (g.m = N.getMonth()),
              (g.d = N.getDate() + ((g.w + 6) % 7))));
      } else
        ('W' in g || 'U' in g) &&
          ('w' in g || (g.w = 'u' in g ? g.u % 7 : 'W' in g ? 1 : 0),
          (L =
            'Z' in g
              ? _t(Tn(g.y, 0, 1)).getUTCDay()
              : yt(Tn(g.y, 0, 1)).getDay()),
          (g.m = 0),
          (g.d =
            'W' in g
              ? ((g.w + 6) % 7) + g.W * 7 - ((L + 5) % 7)
              : g.w + g.U * 7 - ((L + 6) % 7)));
      return 'Z' in g
        ? ((g.H += (g.Z / 100) | 0), (g.M += g.Z % 100), _t(g))
        : yt(g);
    };
  }
  function un(p, x, v, g) {
    for (var H = 0, N = x.length, L = v.length, E, an; H < N; ) {
      if (g >= L) return -1;
      if (((E = x.charCodeAt(H++)), E === 37)) {
        if (
          ((E = x.charAt(H++)),
          (an = $[E in Ae ? x.charAt(H++) : E]),
          !an || (g = an(p, v, g)) < 0)
        )
          return -1;
      } else if (E != v.charCodeAt(g++)) return -1;
    }
    return g;
  }
  function ft(p, x, v) {
    var g = s.exec(x.slice(v));
    return g ? ((p.p = h.get(g[0].toLowerCase())), v + g[0].length) : -1;
  }
  function Hn(p, x, v) {
    var g = m.exec(x.slice(v));
    return g ? ((p.w = d.get(g[0].toLowerCase())), v + g[0].length) : -1;
  }
  function M(p, x, v) {
    var g = c.exec(x.slice(v));
    return g ? ((p.w = l.get(g[0].toLowerCase())), v + g[0].length) : -1;
  }
  function X(p, x, v) {
    var g = b.exec(x.slice(v));
    return g ? ((p.m = A.get(g[0].toLowerCase())), v + g[0].length) : -1;
  }
  function Y(p, x, v) {
    var g = y.exec(x.slice(v));
    return g ? ((p.m = w.get(g[0].toLowerCase())), v + g[0].length) : -1;
  }
  function tn(p, x, v) {
    return un(p, t, x, v);
  }
  function Pn(p, x, v) {
    return un(p, e, x, v);
  }
  function mn(p, x, v) {
    return un(p, r, x, v);
  }
  function pn(p) {
    return u[p.getDay()];
  }
  function dn(p) {
    return i[p.getDay()];
  }
  function z(p) {
    return f[p.getMonth()];
  }
  function Lr(p) {
    return a[p.getMonth()];
  }
  function Er(p) {
    return o[+(p.getHours() >= 12)];
  }
  function Or(p) {
    return 1 + ~~(p.getMonth() / 3);
  }
  function Ir(p) {
    return u[p.getUTCDay()];
  }
  function Rr(p) {
    return i[p.getUTCDay()];
  }
  function Wr(p) {
    return f[p.getUTCMonth()];
  }
  function zr(p) {
    return a[p.getUTCMonth()];
  }
  function Zr(p) {
    return o[+(p.getUTCHours() >= 12)];
  }
  function Br(p) {
    return 1 + ~~(p.getUTCMonth() / 3);
  }
  return {
    format: function (p) {
      var x = _((p += ''), k);
      return (
        (x.toString = function () {
          return p;
        }),
        x
      );
    },
    parse: function (p) {
      var x = F((p += ''), !1);
      return (
        (x.toString = function () {
          return p;
        }),
        x
      );
    },
    utcFormat: function (p) {
      var x = _((p += ''), C);
      return (
        (x.toString = function () {
          return p;
        }),
        x
      );
    },
    utcParse: function (p) {
      var x = F((p += ''), !0);
      return (
        (x.toString = function () {
          return p;
        }),
        x
      );
    },
  };
}
var Ae = { '-': '', _: ' ', 0: '0' },
  D = /^\s*\d+/,
  ko = /^%/,
  No = /[\\^$*+?|[\]().{}]/g;
function T(n, t, e) {
  var r = n < 0 ? '-' : '',
    o = (r ? -n : n) + '',
    i = o.length;
  return r + (i < e ? new Array(e - i + 1).join(t) + o : o);
}
function So(n) {
  return n.replace(No, '\\$&');
}
function kn(n) {
  return new RegExp('^(?:' + n.map(So).join('|') + ')', 'i');
}
function Nn(n) {
  return new Map(n.map((t, e) => [t.toLowerCase(), e]));
}
function Co(n, t, e) {
  var r = D.exec(t.slice(e, e + 1));
  return r ? ((n.w = +r[0]), e + r[0].length) : -1;
}
function $o(n, t, e) {
  var r = D.exec(t.slice(e, e + 1));
  return r ? ((n.u = +r[0]), e + r[0].length) : -1;
}
function Uo(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.U = +r[0]), e + r[0].length) : -1;
}
function Do(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.V = +r[0]), e + r[0].length) : -1;
}
function Ao(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.W = +r[0]), e + r[0].length) : -1;
}
function Fe(n, t, e) {
  var r = D.exec(t.slice(e, e + 4));
  return r ? ((n.y = +r[0]), e + r[0].length) : -1;
}
function qe(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.y = +r[0] + (+r[0] > 68 ? 1900 : 2e3)), e + r[0].length) : -1;
}
function Fo(n, t, e) {
  var r = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(t.slice(e, e + 6));
  return r
    ? ((n.Z = r[1] ? 0 : -(r[2] + (r[3] || '00'))), e + r[0].length)
    : -1;
}
function qo(n, t, e) {
  var r = D.exec(t.slice(e, e + 1));
  return r ? ((n.q = r[0] * 3 - 3), e + r[0].length) : -1;
}
function Yo(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.m = r[0] - 1), e + r[0].length) : -1;
}
function Ye(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.d = +r[0]), e + r[0].length) : -1;
}
function Ho(n, t, e) {
  var r = D.exec(t.slice(e, e + 3));
  return r ? ((n.m = 0), (n.d = +r[0]), e + r[0].length) : -1;
}
function He(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.H = +r[0]), e + r[0].length) : -1;
}
function Po(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.M = +r[0]), e + r[0].length) : -1;
}
function Lo(n, t, e) {
  var r = D.exec(t.slice(e, e + 2));
  return r ? ((n.S = +r[0]), e + r[0].length) : -1;
}
function Eo(n, t, e) {
  var r = D.exec(t.slice(e, e + 3));
  return r ? ((n.L = +r[0]), e + r[0].length) : -1;
}
function Oo(n, t, e) {
  var r = D.exec(t.slice(e, e + 6));
  return r ? ((n.L = Math.floor(r[0] / 1e3)), e + r[0].length) : -1;
}
function Io(n, t, e) {
  var r = ko.exec(t.slice(e, e + 1));
  return r ? e + r[0].length : -1;
}
function Ro(n, t, e) {
  var r = D.exec(t.slice(e));
  return r ? ((n.Q = +r[0]), e + r[0].length) : -1;
}
function Wo(n, t, e) {
  var r = D.exec(t.slice(e));
  return r ? ((n.s = +r[0]), e + r[0].length) : -1;
}
function Pe(n, t) {
  return T(n.getDate(), t, 2);
}
function zo(n, t) {
  return T(n.getHours(), t, 2);
}
function Zo(n, t) {
  return T(n.getHours() % 12 || 12, t, 2);
}
function Bo(n, t) {
  return T(1 + Yn.count(j(n), n), t, 3);
}
function kr(n, t) {
  return T(n.getMilliseconds(), t, 3);
}
function Qo(n, t) {
  return kr(n, t) + '000';
}
function Xo(n, t) {
  return T(n.getMonth() + 1, t, 2);
}
function Vo(n, t) {
  return T(n.getMinutes(), t, 2);
}
function Go(n, t) {
  return T(n.getSeconds(), t, 2);
}
function Jo(n) {
  var t = n.getDay();
  return t === 0 ? 7 : t;
}
function jo(n, t) {
  return T(ot.count(j(n) - 1, n), t, 2);
}
function Nr(n) {
  var t = n.getDay();
  return t >= 4 || t === 0 ? Mn(n) : Mn.ceil(n);
}
function Ko(n, t) {
  return ((n = Nr(n)), T(Mn.count(j(n), n) + (j(n).getDay() === 4), t, 2));
}
function nu(n) {
  return n.getDay();
}
function tu(n, t) {
  return T(Kn.count(j(n) - 1, n), t, 2);
}
function eu(n, t) {
  return T(n.getFullYear() % 100, t, 2);
}
function ru(n, t) {
  return ((n = Nr(n)), T(n.getFullYear() % 100, t, 2));
}
function iu(n, t) {
  return T(n.getFullYear() % 1e4, t, 4);
}
function ou(n, t) {
  var e = n.getDay();
  return (
    (n = e >= 4 || e === 0 ? Mn(n) : Mn.ceil(n)),
    T(n.getFullYear() % 1e4, t, 4)
  );
}
function uu(n) {
  var t = n.getTimezoneOffset();
  return (
    (t > 0 ? '-' : ((t *= -1), '+')) +
    T((t / 60) | 0, '0', 2) +
    T(t % 60, '0', 2)
  );
}
function Le(n, t) {
  return T(n.getUTCDate(), t, 2);
}
function au(n, t) {
  return T(n.getUTCHours(), t, 2);
}
function su(n, t) {
  return T(n.getUTCHours() % 12 || 12, t, 2);
}
function fu(n, t) {
  return T(1 + it.count(K(n), n), t, 3);
}
function Sr(n, t) {
  return T(n.getUTCMilliseconds(), t, 3);
}
function cu(n, t) {
  return Sr(n, t) + '000';
}
function lu(n, t) {
  return T(n.getUTCMonth() + 1, t, 2);
}
function hu(n, t) {
  return T(n.getUTCMinutes(), t, 2);
}
function gu(n, t) {
  return T(n.getUTCSeconds(), t, 2);
}
function mu(n) {
  var t = n.getUTCDay();
  return t === 0 ? 7 : t;
}
function pu(n, t) {
  return T(ut.count(K(n) - 1, n), t, 2);
}
function Cr(n) {
  var t = n.getUTCDay();
  return t >= 4 || t === 0 ? wn(n) : wn.ceil(n);
}
function du(n, t) {
  return ((n = Cr(n)), T(wn.count(K(n), n) + (K(n).getUTCDay() === 4), t, 2));
}
function yu(n) {
  return n.getUTCDay();
}
function _u(n, t) {
  return T(nt.count(K(n) - 1, n), t, 2);
}
function xu(n, t) {
  return T(n.getUTCFullYear() % 100, t, 2);
}
function Mu(n, t) {
  return ((n = Cr(n)), T(n.getUTCFullYear() % 100, t, 2));
}
function wu(n, t) {
  return T(n.getUTCFullYear() % 1e4, t, 4);
}
function bu(n, t) {
  var e = n.getUTCDay();
  return (
    (n = e >= 4 || e === 0 ? wn(n) : wn.ceil(n)),
    T(n.getUTCFullYear() % 1e4, t, 4)
  );
}
function vu() {
  return '+0000';
}
function Ee() {
  return '%';
}
function Oe(n) {
  return +n;
}
function Ie(n) {
  return Math.floor(+n / 1e3);
}
var yn, $r, Ur;
Tu({
  dateTime: '%x, %X',
  date: '%-m/%-d/%Y',
  time: '%-I:%M:%S %p',
  periods: ['AM', 'PM'],
  days: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  shortMonths: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
});
function Tu(n) {
  return (
    (yn = To(n)),
    ($r = yn.format),
    yn.parse,
    (Ur = yn.utcFormat),
    yn.utcParse,
    yn
  );
}
function ku(n) {
  return new Date(n);
}
function Nu(n) {
  return n instanceof Date ? +n : +new Date(+n);
}
function Jt(n, t, e, r, o, i, u, a, f, s) {
  var h = Pt(),
    c = h.invert,
    l = h.domain,
    m = s('.%L'),
    d = s(':%S'),
    y = s('%I:%M'),
    w = s('%I %p'),
    b = s('%a %d'),
    A = s('%b %d'),
    k = s('%B'),
    C = s('%Y');
  function $(_) {
    return (
      f(_) < _
        ? m
        : a(_) < _
          ? d
          : u(_) < _
            ? y
            : i(_) < _
              ? w
              : r(_) < _
                ? o(_) < _
                  ? b
                  : A
                : e(_) < _
                  ? k
                  : C
    )(_);
  }
  return (
    (h.invert = function (_) {
      return new Date(c(_));
    }),
    (h.domain = function (_) {
      return arguments.length ? l(Array.from(_, Nu)) : l().map(ku);
    }),
    (h.ticks = function (_) {
      var F = l();
      return n(F[0], F[F.length - 1], _ ?? 10);
    }),
    (h.tickFormat = function (_, F) {
      return F == null ? $ : s(F);
    }),
    (h.nice = function (_) {
      var F = l();
      return (
        (!_ || typeof _.range != 'function') &&
          (_ = t(F[0], F[F.length - 1], _ ?? 10)),
        _ ? l(dr(F, _)) : h
      );
    }),
    (h.copy = function () {
      return qn(h, Jt(n, t, e, r, o, i, u, a, f, s));
    }),
    h
  );
}
function Su() {
  return W.apply(
    Jt(bo, vo, j, Vt, ot, Yn, Qt, Zt, cn, $r).domain([
      new Date(2e3, 0, 1),
      new Date(2e3, 0, 2),
    ]),
    arguments
  );
}
function Cu() {
  return W.apply(
    Jt(Mo, wo, K, Gt, ut, it, Xt, Bt, cn, Ur).domain([
      Date.UTC(2e3, 0, 1),
      Date.UTC(2e3, 0, 2),
    ]),
    arguments
  );
}
function at() {
  var n = 0,
    t = 1,
    e,
    r,
    o,
    i,
    u = q,
    a = !1,
    f;
  function s(c) {
    return c == null || isNaN((c = +c))
      ? f
      : u(
          o === 0
            ? 0.5
            : ((c = (i(c) - e) * o), a ? Math.max(0, Math.min(1, c)) : c)
        );
  }
  ((s.domain = function (c) {
    return arguments.length
      ? (([n, t] = c),
        (e = i((n = +n))),
        (r = i((t = +t))),
        (o = e === r ? 0 : 1 / (r - e)),
        s)
      : [n, t];
  }),
    (s.clamp = function (c) {
      return arguments.length ? ((a = !!c), s) : a;
    }),
    (s.interpolator = function (c) {
      return arguments.length ? ((u = c), s) : u;
    }));
  function h(c) {
    return function (l) {
      var m, d;
      return arguments.length ? (([m, d] = l), (u = c(m, d)), s) : [u(0), u(1)];
    };
  }
  return (
    (s.range = h(bn)),
    (s.rangeRound = h(Ht)),
    (s.unknown = function (c) {
      return arguments.length ? ((f = c), s) : f;
    }),
    function (c) {
      return (
        (i = c),
        (e = c(n)),
        (r = c(t)),
        (o = e === r ? 0 : 1 / (r - e)),
        s
      );
    }
  );
}
function on(n, t) {
  return t
    .domain(n.domain())
    .interpolator(n.interpolator())
    .clamp(n.clamp())
    .unknown(n.unknown());
}
function Dr() {
  var n = rn(at()(q));
  return (
    (n.copy = function () {
      return on(n, Dr());
    }),
    nn.apply(n, arguments)
  );
}
function Ar() {
  var n = Ot(at()).domain([1, 10]);
  return (
    (n.copy = function () {
      return on(n, Ar()).base(n.base());
    }),
    nn.apply(n, arguments)
  );
}
function Fr() {
  var n = It(at());
  return (
    (n.copy = function () {
      return on(n, Fr()).constant(n.constant());
    }),
    nn.apply(n, arguments)
  );
}
function jt() {
  var n = Rt(at());
  return (
    (n.copy = function () {
      return on(n, jt()).exponent(n.exponent());
    }),
    nn.apply(n, arguments)
  );
}
function $u() {
  return jt.apply(null, arguments).exponent(0.5);
}
function qr() {
  var n = [],
    t = q;
  function e(r) {
    if (r != null && !isNaN((r = +r)))
      return t((An(n, r, 1) - 1) / (n.length - 1));
  }
  return (
    (e.domain = function (r) {
      if (!arguments.length) return n.slice();
      n = [];
      for (let o of r) o != null && !isNaN((o = +o)) && n.push(o);
      return (n.sort(en), e);
    }),
    (e.interpolator = function (r) {
      return arguments.length ? ((t = r), e) : t;
    }),
    (e.range = function () {
      return n.map((r, o) => t(o / (n.length - 1)));
    }),
    (e.quantiles = function (r) {
      return Array.from({ length: r + 1 }, (o, i) => gi(n, i / r));
    }),
    (e.copy = function () {
      return qr(t).domain(n);
    }),
    nn.apply(e, arguments)
  );
}
function st() {
  var n = 0,
    t = 0.5,
    e = 1,
    r = 1,
    o,
    i,
    u,
    a,
    f,
    s = q,
    h,
    c = !1,
    l;
  function m(y) {
    return isNaN((y = +y))
      ? l
      : ((y = 0.5 + ((y = +h(y)) - i) * (r * y < r * i ? a : f)),
        s(c ? Math.max(0, Math.min(1, y)) : y));
  }
  ((m.domain = function (y) {
    return arguments.length
      ? (([n, t, e] = y),
        (o = h((n = +n))),
        (i = h((t = +t))),
        (u = h((e = +e))),
        (a = o === i ? 0 : 0.5 / (i - o)),
        (f = i === u ? 0 : 0.5 / (u - i)),
        (r = i < o ? -1 : 1),
        m)
      : [n, t, e];
  }),
    (m.clamp = function (y) {
      return arguments.length ? ((c = !!y), m) : c;
    }),
    (m.interpolator = function (y) {
      return arguments.length ? ((s = y), m) : s;
    }));
  function d(y) {
    return function (w) {
      var b, A, k;
      return arguments.length
        ? (([b, A, k] = w), (s = Oi(y, [b, A, k])), m)
        : [s(0), s(0.5), s(1)];
    };
  }
  return (
    (m.range = d(bn)),
    (m.rangeRound = d(Ht)),
    (m.unknown = function (y) {
      return arguments.length ? ((l = y), m) : l;
    }),
    function (y) {
      return (
        (h = y),
        (o = y(n)),
        (i = y(t)),
        (u = y(e)),
        (a = o === i ? 0 : 0.5 / (i - o)),
        (f = i === u ? 0 : 0.5 / (u - i)),
        (r = i < o ? -1 : 1),
        m
      );
    }
  );
}
function Yr() {
  var n = rn(st()(q));
  return (
    (n.copy = function () {
      return on(n, Yr());
    }),
    nn.apply(n, arguments)
  );
}
function Hr() {
  var n = Ot(st()).domain([0.1, 1, 10]);
  return (
    (n.copy = function () {
      return on(n, Hr()).base(n.base());
    }),
    nn.apply(n, arguments)
  );
}
function Pr() {
  var n = It(st());
  return (
    (n.copy = function () {
      return on(n, Pr()).constant(n.constant());
    }),
    nn.apply(n, arguments)
  );
}
function Kt() {
  var n = Rt(st());
  return (
    (n.copy = function () {
      return on(n, Kt()).exponent(n.exponent());
    }),
    nn.apply(n, arguments)
  );
}
function Uu() {
  return Kt.apply(null, arguments).exponent(0.5);
}
const ea = Object.freeze(
  Object.defineProperty(
    {
      __proto__: null,
      scaleBand: Ft,
      scaleDiverging: Yr,
      scaleDivergingLog: Hr,
      scaleDivergingPow: Kt,
      scaleDivergingSqrt: Uu,
      scaleDivergingSymlog: Pr,
      scaleIdentity: pr,
      scaleImplicit: kt,
      scaleLinear: mr,
      scaleLog: yr,
      scaleOrdinal: At,
      scalePoint: di,
      scalePow: Wt,
      scaleQuantile: Mr,
      scaleQuantize: wr,
      scaleRadial: xr,
      scaleSequential: Dr,
      scaleSequentialLog: Ar,
      scaleSequentialPow: jt,
      scaleSequentialQuantile: qr,
      scaleSequentialSqrt: $u,
      scaleSequentialSymlog: Fr,
      scaleSqrt: fo,
      scaleSymlog: _r,
      scaleThreshold: br,
      scaleTime: Su,
      scaleUtc: Cu,
      tickFormat: gr,
    },
    Symbol.toStringTag,
    { value: 'Module' }
  )
);
export {
  Zu as A,
  qu as B,
  Fu as C,
  Ru as D,
  zu as E,
  Wu as F,
  Iu as S,
  Eu as a,
  Lu as b,
  Pu as c,
  Hu as d,
  Yu as e,
  Jr as f,
  Ft as g,
  ea as h,
  ju as i,
  ue as j,
  ta as k,
  mr as l,
  na as m,
  Sn as n,
  Ku as o,
  di as p,
  Au as q,
  Gr as r,
  Ou as s,
  Gu as t,
  Ju as u,
  Vu as v,
  Xu as w,
  Qu as x,
  Bu as y,
  Ze as z,
};
