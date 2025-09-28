var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-BzDvnK/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// _worker.js
var yt = Object.defineProperty;
var $e = /* @__PURE__ */ __name((e) => {
  throw TypeError(e);
}, "$e");
var Et = /* @__PURE__ */ __name((e, t, r) => t in e ? yt(e, t, { enumerable: true, configurable: true, writable: true, value: r }) : e[t] = r, "Et");
var p = /* @__PURE__ */ __name((e, t, r) => Et(e, typeof t != "symbol" ? t + "" : t, r), "p");
var Pe = /* @__PURE__ */ __name((e, t, r) => t.has(e) || $e("Cannot " + r), "Pe");
var a = /* @__PURE__ */ __name((e, t, r) => (Pe(e, t, "read from private field"), r ? r.call(e) : t.get(e)), "a");
var m = /* @__PURE__ */ __name((e, t, r) => t.has(e) ? $e("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), "m");
var f = /* @__PURE__ */ __name((e, t, r, s) => (Pe(e, t, "write to private field"), s ? s.call(e, r) : t.set(e, r), r), "f");
var x = /* @__PURE__ */ __name((e, t, r) => (Pe(e, t, "access private method"), r), "x");
var Me = /* @__PURE__ */ __name((e, t, r, s) => ({ set _(i) {
  f(e, t, i, r);
}, get _() {
  return a(e, t, s);
} }), "Me");
var Fe = /* @__PURE__ */ __name((e, t, r) => (s, i) => {
  let n = -1;
  return o(0);
  async function o(l) {
    if (l <= n) throw new Error("next() called multiple times");
    n = l;
    let c, h = false, d;
    if (e[l] ? (d = e[l][0][0], s.req.routeIndex = l) : d = l === e.length && i || void 0, d) try {
      c = await d(s, () => o(l + 1));
    } catch (u) {
      if (u instanceof Error && t) s.error = u, c = await t(u, s), h = true;
      else throw u;
    }
    else s.finalized === false && r && (c = await r(s));
    return c && (s.finalized === false || h) && (s.res = c), s;
  }
  __name(o, "o");
}, "Fe");
var jt = Symbol();
var Rt = /* @__PURE__ */ __name(async (e, t = /* @__PURE__ */ Object.create(null)) => {
  const { all: r = false, dot: s = false } = t, n = (e instanceof it ? e.raw.headers : e.headers).get("Content-Type");
  return n != null && n.startsWith("multipart/form-data") || n != null && n.startsWith("application/x-www-form-urlencoded") ? Ot(e, { all: r, dot: s }) : {};
}, "Rt");
async function Ot(e, t) {
  const r = await e.formData();
  return r ? At(r, t) : {};
}
__name(Ot, "Ot");
function At(e, t) {
  const r = /* @__PURE__ */ Object.create(null);
  return e.forEach((s, i) => {
    t.all || i.endsWith("[]") ? St(r, i, s) : r[i] = s;
  }), t.dot && Object.entries(r).forEach(([s, i]) => {
    s.includes(".") && (Tt(r, s, i), delete r[s]);
  }), r;
}
__name(At, "At");
var St = /* @__PURE__ */ __name((e, t, r) => {
  e[t] !== void 0 ? Array.isArray(e[t]) ? e[t].push(r) : e[t] = [e[t], r] : t.endsWith("[]") ? e[t] = [r] : e[t] = r;
}, "St");
var Tt = /* @__PURE__ */ __name((e, t, r) => {
  let s = e;
  const i = t.split(".");
  i.forEach((n, o) => {
    o === i.length - 1 ? s[n] = r : ((!s[n] || typeof s[n] != "object" || Array.isArray(s[n]) || s[n] instanceof File) && (s[n] = /* @__PURE__ */ Object.create(null)), s = s[n]);
  });
}, "Tt");
var Ze = /* @__PURE__ */ __name((e) => {
  const t = e.split("/");
  return t[0] === "" && t.shift(), t;
}, "Ze");
var Ct = /* @__PURE__ */ __name((e) => {
  const { groups: t, path: r } = Pt(e), s = Ze(r);
  return _t(s, t);
}, "Ct");
var Pt = /* @__PURE__ */ __name((e) => {
  const t = [];
  return e = e.replace(/\{[^}]+\}/g, (r, s) => {
    const i = `@${s}`;
    return t.push([i, r]), i;
  }), { groups: t, path: e };
}, "Pt");
var _t = /* @__PURE__ */ __name((e, t) => {
  for (let r = t.length - 1; r >= 0; r--) {
    const [s] = t[r];
    for (let i = e.length - 1; i >= 0; i--) if (e[i].includes(s)) {
      e[i] = e[i].replace(s, t[r][1]);
      break;
    }
  }
  return e;
}, "_t");
var Ee = {};
var Nt = /* @__PURE__ */ __name((e, t) => {
  if (e === "*") return "*";
  const r = e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (r) {
    const s = `${e}#${t}`;
    return Ee[s] || (r[2] ? Ee[s] = t && t[0] !== ":" && t[0] !== "*" ? [s, r[1], new RegExp(`^${r[2]}(?=/${t})`)] : [e, r[1], new RegExp(`^${r[2]}$`)] : Ee[s] = [e, r[1], true]), Ee[s];
  }
  return null;
}, "Nt");
var De = /* @__PURE__ */ __name((e, t) => {
  try {
    return t(e);
  } catch {
    return e.replace(/(?:%[0-9A-Fa-f]{2})+/g, (r) => {
      try {
        return t(r);
      } catch {
        return r;
      }
    });
  }
}, "De");
var Ht = /* @__PURE__ */ __name((e) => De(e, decodeURI), "Ht");
var et = /* @__PURE__ */ __name((e) => {
  const t = e.url, r = t.indexOf("/", t.indexOf(":") + 4);
  let s = r;
  for (; s < t.length; s++) {
    const i = t.charCodeAt(s);
    if (i === 37) {
      const n = t.indexOf("?", s), o = t.slice(r, n === -1 ? void 0 : n);
      return Ht(o.includes("%25") ? o.replace(/%25/g, "%2525") : o);
    } else if (i === 63) break;
  }
  return t.slice(r, s);
}, "et");
var It = /* @__PURE__ */ __name((e) => {
  const t = et(e);
  return t.length > 1 && t.at(-1) === "/" ? t.slice(0, -1) : t;
}, "It");
var re = /* @__PURE__ */ __name((e, t, ...r) => (r.length && (t = re(t, ...r)), `${(e == null ? void 0 : e[0]) === "/" ? "" : "/"}${e}${t === "/" ? "" : `${(e == null ? void 0 : e.at(-1)) === "/" ? "" : "/"}${(t == null ? void 0 : t[0]) === "/" ? t.slice(1) : t}`}`), "re");
var tt = /* @__PURE__ */ __name((e) => {
  if (e.charCodeAt(e.length - 1) !== 63 || !e.includes(":")) return null;
  const t = e.split("/"), r = [];
  let s = "";
  return t.forEach((i) => {
    if (i !== "" && !/\:/.test(i)) s += "/" + i;
    else if (/\:/.test(i)) if (/\?/.test(i)) {
      r.length === 0 && s === "" ? r.push("/") : r.push(s);
      const n = i.replace("?", "");
      s += "/" + n, r.push(s);
    } else s += "/" + i;
  }), r.filter((i, n, o) => o.indexOf(i) === n);
}, "tt");
var _e = /* @__PURE__ */ __name((e) => /[%+]/.test(e) ? (e.indexOf("+") !== -1 && (e = e.replace(/\+/g, " ")), e.indexOf("%") !== -1 ? De(e, st) : e) : e, "_e");
var rt = /* @__PURE__ */ __name((e, t, r) => {
  let s;
  if (!r && t && !/[%+]/.test(t)) {
    let o = e.indexOf(`?${t}`, 8);
    for (o === -1 && (o = e.indexOf(`&${t}`, 8)); o !== -1; ) {
      const l = e.charCodeAt(o + t.length + 1);
      if (l === 61) {
        const c = o + t.length + 2, h = e.indexOf("&", c);
        return _e(e.slice(c, h === -1 ? void 0 : h));
      } else if (l == 38 || isNaN(l)) return "";
      o = e.indexOf(`&${t}`, o + 1);
    }
    if (s = /[%+]/.test(e), !s) return;
  }
  const i = {};
  s ?? (s = /[%+]/.test(e));
  let n = e.indexOf("?", 8);
  for (; n !== -1; ) {
    const o = e.indexOf("&", n + 1);
    let l = e.indexOf("=", n);
    l > o && o !== -1 && (l = -1);
    let c = e.slice(n + 1, l === -1 ? o === -1 ? void 0 : o : l);
    if (s && (c = _e(c)), n = o, c === "") continue;
    let h;
    l === -1 ? h = "" : (h = e.slice(l + 1, o === -1 ? void 0 : o), s && (h = _e(h))), r ? (i[c] && Array.isArray(i[c]) || (i[c] = []), i[c].push(h)) : i[c] ?? (i[c] = h);
  }
  return t ? i[t] : i;
}, "rt");
var Dt = rt;
var kt = /* @__PURE__ */ __name((e, t) => rt(e, t, true), "kt");
var st = decodeURIComponent;
var qe = /* @__PURE__ */ __name((e) => De(e, st), "qe");
var ne;
var T;
var M;
var nt;
var at;
var He;
var q;
var Be;
var it = (Be = class {
  static {
    __name(this, "Be");
  }
  constructor(e, t = "/", r = [[]]) {
    m(this, M);
    p(this, "raw");
    m(this, ne);
    m(this, T);
    p(this, "routeIndex", 0);
    p(this, "path");
    p(this, "bodyCache", {});
    m(this, q, (e2) => {
      const { bodyCache: t2, raw: r2 } = this, s = t2[e2];
      if (s) return s;
      const i = Object.keys(t2)[0];
      return i ? t2[i].then((n) => (i === "json" && (n = JSON.stringify(n)), new Response(n)[e2]())) : t2[e2] = r2[e2]();
    });
    this.raw = e, this.path = t, f(this, T, r), f(this, ne, {});
  }
  param(e) {
    return e ? x(this, M, nt).call(this, e) : x(this, M, at).call(this);
  }
  query(e) {
    return Dt(this.url, e);
  }
  queries(e) {
    return kt(this.url, e);
  }
  header(e) {
    if (e) return this.raw.headers.get(e) ?? void 0;
    const t = {};
    return this.raw.headers.forEach((r, s) => {
      t[s] = r;
    }), t;
  }
  async parseBody(e) {
    var t;
    return (t = this.bodyCache).parsedBody ?? (t.parsedBody = await Rt(this, e));
  }
  json() {
    return a(this, q).call(this, "text").then((e) => JSON.parse(e));
  }
  text() {
    return a(this, q).call(this, "text");
  }
  arrayBuffer() {
    return a(this, q).call(this, "arrayBuffer");
  }
  blob() {
    return a(this, q).call(this, "blob");
  }
  formData() {
    return a(this, q).call(this, "formData");
  }
  addValidatedData(e, t) {
    a(this, ne)[e] = t;
  }
  valid(e) {
    return a(this, ne)[e];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [jt]() {
    return a(this, T);
  }
  get matchedRoutes() {
    return a(this, T)[0].map(([[, e]]) => e);
  }
  get routePath() {
    return a(this, T)[0].map(([[, e]]) => e)[this.routeIndex].path;
  }
}, ne = /* @__PURE__ */ new WeakMap(), T = /* @__PURE__ */ new WeakMap(), M = /* @__PURE__ */ new WeakSet(), nt = /* @__PURE__ */ __name(function(e) {
  const t = a(this, T)[0][this.routeIndex][1][e], r = x(this, M, He).call(this, t);
  return r && /\%/.test(r) ? qe(r) : r;
}, "nt"), at = /* @__PURE__ */ __name(function() {
  const e = {}, t = Object.keys(a(this, T)[0][this.routeIndex][1]);
  for (const r of t) {
    const s = x(this, M, He).call(this, a(this, T)[0][this.routeIndex][1][r]);
    s !== void 0 && (e[r] = /\%/.test(s) ? qe(s) : s);
  }
  return e;
}, "at"), He = /* @__PURE__ */ __name(function(e) {
  return a(this, T)[1] ? a(this, T)[1][e] : e;
}, "He"), q = /* @__PURE__ */ new WeakMap(), Be);
var $t = { Stringify: 1 };
var ot = /* @__PURE__ */ __name(async (e, t, r, s, i) => {
  typeof e == "object" && !(e instanceof String) && (e instanceof Promise || (e = e.toString()), e instanceof Promise && (e = await e));
  const n = e.callbacks;
  return n != null && n.length ? (i ? i[0] += e : i = [e], Promise.all(n.map((l) => l({ phase: t, buffer: i, context: s }))).then((l) => Promise.all(l.filter(Boolean).map((c) => ot(c, t, false, s, i))).then(() => i[0]))) : Promise.resolve(e);
}, "ot");
var Mt = "text/plain; charset=UTF-8";
var Ne = /* @__PURE__ */ __name((e, t) => ({ "Content-Type": e, ...t }), "Ne");
var me;
var xe;
var I;
var ae;
var D;
var A;
var ve;
var oe;
var ce;
var G;
var we;
var be;
var L;
var se;
var Ve;
var Ft = (Ve = class {
  static {
    __name(this, "Ve");
  }
  constructor(e, t) {
    m(this, L);
    m(this, me);
    m(this, xe);
    p(this, "env", {});
    m(this, I);
    p(this, "finalized", false);
    p(this, "error");
    m(this, ae);
    m(this, D);
    m(this, A);
    m(this, ve);
    m(this, oe);
    m(this, ce);
    m(this, G);
    m(this, we);
    m(this, be);
    p(this, "render", (...e2) => (a(this, oe) ?? f(this, oe, (t2) => this.html(t2)), a(this, oe).call(this, ...e2)));
    p(this, "setLayout", (e2) => f(this, ve, e2));
    p(this, "getLayout", () => a(this, ve));
    p(this, "setRenderer", (e2) => {
      f(this, oe, e2);
    });
    p(this, "header", (e2, t2, r) => {
      this.finalized && f(this, A, new Response(a(this, A).body, a(this, A)));
      const s = a(this, A) ? a(this, A).headers : a(this, G) ?? f(this, G, new Headers());
      t2 === void 0 ? s.delete(e2) : r != null && r.append ? s.append(e2, t2) : s.set(e2, t2);
    });
    p(this, "status", (e2) => {
      f(this, ae, e2);
    });
    p(this, "set", (e2, t2) => {
      a(this, I) ?? f(this, I, /* @__PURE__ */ new Map()), a(this, I).set(e2, t2);
    });
    p(this, "get", (e2) => a(this, I) ? a(this, I).get(e2) : void 0);
    p(this, "newResponse", (...e2) => x(this, L, se).call(this, ...e2));
    p(this, "body", (e2, t2, r) => x(this, L, se).call(this, e2, t2, r));
    p(this, "text", (e2, t2, r) => !a(this, G) && !a(this, ae) && !t2 && !r && !this.finalized ? new Response(e2) : x(this, L, se).call(this, e2, t2, Ne(Mt, r)));
    p(this, "json", (e2, t2, r) => x(this, L, se).call(this, JSON.stringify(e2), t2, Ne("application/json", r)));
    p(this, "html", (e2, t2, r) => {
      const s = /* @__PURE__ */ __name((i) => x(this, L, se).call(this, i, t2, Ne("text/html; charset=UTF-8", r)), "s");
      return typeof e2 == "object" ? ot(e2, $t.Stringify, false, {}).then(s) : s(e2);
    });
    p(this, "redirect", (e2, t2) => {
      const r = String(e2);
      return this.header("Location", /[^\x00-\xFF]/.test(r) ? encodeURI(r) : r), this.newResponse(null, t2 ?? 302);
    });
    p(this, "notFound", () => (a(this, ce) ?? f(this, ce, () => new Response()), a(this, ce).call(this, this)));
    f(this, me, e), t && (f(this, D, t.executionCtx), this.env = t.env, f(this, ce, t.notFoundHandler), f(this, be, t.path), f(this, we, t.matchResult));
  }
  get req() {
    return a(this, xe) ?? f(this, xe, new it(a(this, me), a(this, be), a(this, we))), a(this, xe);
  }
  get event() {
    if (a(this, D) && "respondWith" in a(this, D)) return a(this, D);
    throw Error("This context has no FetchEvent");
  }
  get executionCtx() {
    if (a(this, D)) return a(this, D);
    throw Error("This context has no ExecutionContext");
  }
  get res() {
    return a(this, A) || f(this, A, new Response(null, { headers: a(this, G) ?? f(this, G, new Headers()) }));
  }
  set res(e) {
    if (a(this, A) && e) {
      e = new Response(e.body, e);
      for (const [t, r] of a(this, A).headers.entries()) if (t !== "content-type") if (t === "set-cookie") {
        const s = a(this, A).headers.getSetCookie();
        e.headers.delete("set-cookie");
        for (const i of s) e.headers.append("set-cookie", i);
      } else e.headers.set(t, r);
    }
    f(this, A, e), this.finalized = true;
  }
  get var() {
    return a(this, I) ? Object.fromEntries(a(this, I)) : {};
  }
}, me = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ new WeakMap(), I = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap(), ve = /* @__PURE__ */ new WeakMap(), oe = /* @__PURE__ */ new WeakMap(), ce = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakSet(), se = /* @__PURE__ */ __name(function(e, t, r) {
  const s = a(this, A) ? new Headers(a(this, A).headers) : a(this, G) ?? new Headers();
  if (typeof t == "object" && "headers" in t) {
    const n = t.headers instanceof Headers ? t.headers : new Headers(t.headers);
    for (const [o, l] of n) o.toLowerCase() === "set-cookie" ? s.append(o, l) : s.set(o, l);
  }
  if (r) for (const [n, o] of Object.entries(r)) if (typeof o == "string") s.set(n, o);
  else {
    s.delete(n);
    for (const l of o) s.append(n, l);
  }
  const i = typeof t == "number" ? t : (t == null ? void 0 : t.status) ?? a(this, ae);
  return new Response(e, { status: i, headers: s });
}, "se"), Ve);
var y = "ALL";
var qt = "all";
var Lt = ["get", "post", "put", "delete", "options", "patch"];
var ct = "Can not add a route since the matcher is already built.";
var lt = class extends Error {
  static {
    __name(this, "lt");
  }
};
var zt = "__COMPOSED_HANDLER";
var Ut = /* @__PURE__ */ __name((e) => e.text("404 Not Found", 404), "Ut");
var Le = /* @__PURE__ */ __name((e, t) => {
  if ("getResponse" in e) {
    const r = e.getResponse();
    return t.newResponse(r.body, r);
  }
  return console.error(e), t.text("Internal Server Error", 500);
}, "Le");
var C;
var E;
var dt;
var P;
var W;
var je;
var Re;
var We;
var ht = (We = class {
  static {
    __name(this, "We");
  }
  constructor(t = {}) {
    m(this, E);
    p(this, "get");
    p(this, "post");
    p(this, "put");
    p(this, "delete");
    p(this, "options");
    p(this, "patch");
    p(this, "all");
    p(this, "on");
    p(this, "use");
    p(this, "router");
    p(this, "getPath");
    p(this, "_basePath", "/");
    m(this, C, "/");
    p(this, "routes", []);
    m(this, P, Ut);
    p(this, "errorHandler", Le);
    p(this, "onError", (t2) => (this.errorHandler = t2, this));
    p(this, "notFound", (t2) => (f(this, P, t2), this));
    p(this, "fetch", (t2, ...r) => x(this, E, Re).call(this, t2, r[1], r[0], t2.method));
    p(this, "request", (t2, r, s2, i2) => t2 instanceof Request ? this.fetch(r ? new Request(t2, r) : t2, s2, i2) : (t2 = t2.toString(), this.fetch(new Request(/^https?:\/\//.test(t2) ? t2 : `http://localhost${re("/", t2)}`, r), s2, i2)));
    p(this, "fire", () => {
      addEventListener("fetch", (t2) => {
        t2.respondWith(x(this, E, Re).call(this, t2.request, t2, void 0, t2.request.method));
      });
    });
    [...Lt, qt].forEach((n) => {
      this[n] = (o, ...l) => (typeof o == "string" ? f(this, C, o) : x(this, E, W).call(this, n, a(this, C), o), l.forEach((c) => {
        x(this, E, W).call(this, n, a(this, C), c);
      }), this);
    }), this.on = (n, o, ...l) => {
      for (const c of [o].flat()) {
        f(this, C, c);
        for (const h of [n].flat()) l.map((d) => {
          x(this, E, W).call(this, h.toUpperCase(), a(this, C), d);
        });
      }
      return this;
    }, this.use = (n, ...o) => (typeof n == "string" ? f(this, C, n) : (f(this, C, "*"), o.unshift(n)), o.forEach((l) => {
      x(this, E, W).call(this, y, a(this, C), l);
    }), this);
    const { strict: s, ...i } = t;
    Object.assign(this, i), this.getPath = s ?? true ? t.getPath ?? et : It;
  }
  route(t, r) {
    const s = this.basePath(t);
    return r.routes.map((i) => {
      var o;
      let n;
      r.errorHandler === Le ? n = i.handler : (n = /* @__PURE__ */ __name(async (l, c) => (await Fe([], r.errorHandler)(l, () => i.handler(l, c))).res, "n"), n[zt] = i.handler), x(o = s, E, W).call(o, i.method, i.path, n);
    }), this;
  }
  basePath(t) {
    const r = x(this, E, dt).call(this);
    return r._basePath = re(this._basePath, t), r;
  }
  mount(t, r, s) {
    let i, n;
    s && (typeof s == "function" ? n = s : (n = s.optionHandler, s.replaceRequest === false ? i = /* @__PURE__ */ __name((c) => c, "i") : i = s.replaceRequest));
    const o = n ? (c) => {
      const h = n(c);
      return Array.isArray(h) ? h : [h];
    } : (c) => {
      let h;
      try {
        h = c.executionCtx;
      } catch {
      }
      return [c.env, h];
    };
    i || (i = (() => {
      const c = re(this._basePath, t), h = c === "/" ? 0 : c.length;
      return (d) => {
        const u = new URL(d.url);
        return u.pathname = u.pathname.slice(h) || "/", new Request(u, d);
      };
    })());
    const l = /* @__PURE__ */ __name(async (c, h) => {
      const d = await r(i(c.req.raw), ...o(c));
      if (d) return d;
      await h();
    }, "l");
    return x(this, E, W).call(this, y, re(t, "*"), l), this;
  }
}, C = /* @__PURE__ */ new WeakMap(), E = /* @__PURE__ */ new WeakSet(), dt = /* @__PURE__ */ __name(function() {
  const t = new ht({ router: this.router, getPath: this.getPath });
  return t.errorHandler = this.errorHandler, f(t, P, a(this, P)), t.routes = this.routes, t;
}, "dt"), P = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ __name(function(t, r, s) {
  t = t.toUpperCase(), r = re(this._basePath, r);
  const i = { basePath: this._basePath, path: r, method: t, handler: s };
  this.router.add(t, r, [s, i]), this.routes.push(i);
}, "W"), je = /* @__PURE__ */ __name(function(t, r) {
  if (t instanceof Error) return this.errorHandler(t, r);
  throw t;
}, "je"), Re = /* @__PURE__ */ __name(function(t, r, s, i) {
  if (i === "HEAD") return (async () => new Response(null, await x(this, E, Re).call(this, t, r, s, "GET")))();
  const n = this.getPath(t, { env: s }), o = this.router.match(i, n), l = new Ft(t, { path: n, matchResult: o, env: s, executionCtx: r, notFoundHandler: a(this, P) });
  if (o[0].length === 1) {
    let h;
    try {
      h = o[0][0][0][0](l, async () => {
        l.res = await a(this, P).call(this, l);
      });
    } catch (d) {
      return x(this, E, je).call(this, d, l);
    }
    return h instanceof Promise ? h.then((d) => d || (l.finalized ? l.res : a(this, P).call(this, l))).catch((d) => x(this, E, je).call(this, d, l)) : h ?? a(this, P).call(this, l);
  }
  const c = Fe(o[0], this.errorHandler, a(this, P));
  return (async () => {
    try {
      const h = await c(l);
      if (!h.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
      return h.res;
    } catch (h) {
      return x(this, E, je).call(this, h, l);
    }
  })();
}, "Re"), We);
var Ae = "[^/]+";
var pe = ".*";
var ge = "(?:|/.*)";
var ie = Symbol();
var Bt = new Set(".\\+*[^]$()");
function Vt(e, t) {
  return e.length === 1 ? t.length === 1 ? e < t ? -1 : 1 : -1 : t.length === 1 || e === pe || e === ge ? 1 : t === pe || t === ge ? -1 : e === Ae ? 1 : t === Ae ? -1 : e.length === t.length ? e < t ? -1 : 1 : t.length - e.length;
}
__name(Vt, "Vt");
var J;
var X;
var _;
var Ke;
var Ie = (Ke = class {
  static {
    __name(this, "Ke");
  }
  constructor() {
    m(this, J);
    m(this, X);
    m(this, _, /* @__PURE__ */ Object.create(null));
  }
  insert(t, r, s, i, n) {
    if (t.length === 0) {
      if (a(this, J) !== void 0) throw ie;
      if (n) return;
      f(this, J, r);
      return;
    }
    const [o, ...l] = t, c = o === "*" ? l.length === 0 ? ["", "", pe] : ["", "", Ae] : o === "/*" ? ["", "", ge] : o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let h;
    if (c) {
      const d = c[1];
      let u = c[2] || Ae;
      if (d && c[2] && (u === ".*" || (u = u.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:"), /\((?!\?:)/.test(u)))) throw ie;
      if (h = a(this, _)[u], !h) {
        if (Object.keys(a(this, _)).some((g) => g !== pe && g !== ge)) throw ie;
        if (n) return;
        h = a(this, _)[u] = new Ie(), d !== "" && f(h, X, i.varIndex++);
      }
      !n && d !== "" && s.push([d, a(h, X)]);
    } else if (h = a(this, _)[o], !h) {
      if (Object.keys(a(this, _)).some((d) => d.length > 1 && d !== pe && d !== ge)) throw ie;
      if (n) return;
      h = a(this, _)[o] = new Ie();
    }
    h.insert(l, r, s, i, n);
  }
  buildRegExpStr() {
    const r = Object.keys(a(this, _)).sort(Vt).map((s) => {
      const i = a(this, _)[s];
      return (typeof a(i, X) == "number" ? `(${s})@${a(i, X)}` : Bt.has(s) ? `\\${s}` : s) + i.buildRegExpStr();
    });
    return typeof a(this, J) == "number" && r.unshift(`#${a(this, J)}`), r.length === 0 ? "" : r.length === 1 ? r[0] : "(?:" + r.join("|") + ")";
  }
}, J = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new WeakMap(), Ke);
var Se;
var ye;
var Ge;
var Wt = (Ge = class {
  static {
    __name(this, "Ge");
  }
  constructor() {
    m(this, Se, { varIndex: 0 });
    m(this, ye, new Ie());
  }
  insert(e, t, r) {
    const s = [], i = [];
    for (let o = 0; ; ) {
      let l = false;
      if (e = e.replace(/\{[^}]+\}/g, (c) => {
        const h = `@\\${o}`;
        return i[o] = [h, c], o++, l = true, h;
      }), !l) break;
    }
    const n = e.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let o = i.length - 1; o >= 0; o--) {
      const [l] = i[o];
      for (let c = n.length - 1; c >= 0; c--) if (n[c].indexOf(l) !== -1) {
        n[c] = n[c].replace(l, i[o][1]);
        break;
      }
    }
    return a(this, ye).insert(n, t, s, a(this, Se), r), s;
  }
  buildRegExp() {
    let e = a(this, ye).buildRegExpStr();
    if (e === "") return [/^$/, [], []];
    let t = 0;
    const r = [], s = [];
    return e = e.replace(/#(\d+)|@(\d+)|\.\*\$/g, (i, n, o) => n !== void 0 ? (r[++t] = Number(n), "$()") : (o !== void 0 && (s[Number(o)] = ++t), "")), [new RegExp(`^${e}`), r, s];
  }
}, Se = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap(), Ge);
var ut = [];
var Kt = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var Oe = /* @__PURE__ */ Object.create(null);
function ft(e) {
  return Oe[e] ?? (Oe[e] = new RegExp(e === "*" ? "" : `^${e.replace(/\/\*$|([.\\+*[^\]$()])/g, (t, r) => r ? `\\${r}` : "(?:|/.*)")}$`));
}
__name(ft, "ft");
function Gt() {
  Oe = /* @__PURE__ */ Object.create(null);
}
__name(Gt, "Gt");
function Jt(e) {
  var h;
  const t = new Wt(), r = [];
  if (e.length === 0) return Kt;
  const s = e.map((d) => [!/\*|\/:/.test(d[0]), ...d]).sort(([d, u], [g, b]) => d ? 1 : g ? -1 : u.length - b.length), i = /* @__PURE__ */ Object.create(null);
  for (let d = 0, u = -1, g = s.length; d < g; d++) {
    const [b, S, v] = s[d];
    b ? i[S] = [v.map(([O]) => [O, /* @__PURE__ */ Object.create(null)]), ut] : u++;
    let w;
    try {
      w = t.insert(S, u, b);
    } catch (O) {
      throw O === ie ? new lt(S) : O;
    }
    b || (r[u] = v.map(([O, ee]) => {
      const de = /* @__PURE__ */ Object.create(null);
      for (ee -= 1; ee >= 0; ee--) {
        const [N, Te] = w[ee];
        de[N] = Te;
      }
      return [O, de];
    }));
  }
  const [n, o, l] = t.buildRegExp();
  for (let d = 0, u = r.length; d < u; d++) for (let g = 0, b = r[d].length; g < b; g++) {
    const S = (h = r[d][g]) == null ? void 0 : h[1];
    if (!S) continue;
    const v = Object.keys(S);
    for (let w = 0, O = v.length; w < O; w++) S[v[w]] = l[S[v[w]]];
  }
  const c = [];
  for (const d in o) c[d] = r[o[d]];
  return [n, c, i];
}
__name(Jt, "Jt");
function te(e, t) {
  if (e) {
    for (const r of Object.keys(e).sort((s, i) => i.length - s.length)) if (ft(r).test(t)) return [...e[r]];
  }
}
__name(te, "te");
var z;
var U;
var he;
var pt;
var gt;
var Je;
var Xt = (Je = class {
  static {
    __name(this, "Je");
  }
  constructor() {
    m(this, he);
    p(this, "name", "RegExpRouter");
    m(this, z);
    m(this, U);
    f(this, z, { [y]: /* @__PURE__ */ Object.create(null) }), f(this, U, { [y]: /* @__PURE__ */ Object.create(null) });
  }
  add(e, t, r) {
    var l;
    const s = a(this, z), i = a(this, U);
    if (!s || !i) throw new Error(ct);
    s[e] || [s, i].forEach((c) => {
      c[e] = /* @__PURE__ */ Object.create(null), Object.keys(c[y]).forEach((h) => {
        c[e][h] = [...c[y][h]];
      });
    }), t === "/*" && (t = "*");
    const n = (t.match(/\/:/g) || []).length;
    if (/\*$/.test(t)) {
      const c = ft(t);
      e === y ? Object.keys(s).forEach((h) => {
        var d;
        (d = s[h])[t] || (d[t] = te(s[h], t) || te(s[y], t) || []);
      }) : (l = s[e])[t] || (l[t] = te(s[e], t) || te(s[y], t) || []), Object.keys(s).forEach((h) => {
        (e === y || e === h) && Object.keys(s[h]).forEach((d) => {
          c.test(d) && s[h][d].push([r, n]);
        });
      }), Object.keys(i).forEach((h) => {
        (e === y || e === h) && Object.keys(i[h]).forEach((d) => c.test(d) && i[h][d].push([r, n]));
      });
      return;
    }
    const o = tt(t) || [t];
    for (let c = 0, h = o.length; c < h; c++) {
      const d = o[c];
      Object.keys(i).forEach((u) => {
        var g;
        (e === y || e === u) && ((g = i[u])[d] || (g[d] = [...te(s[u], d) || te(s[y], d) || []]), i[u][d].push([r, n - h + c + 1]));
      });
    }
  }
  match(e, t) {
    Gt();
    const r = x(this, he, pt).call(this);
    return this.match = (s, i) => {
      const n = r[s] || r[y], o = n[2][i];
      if (o) return o;
      const l = i.match(n[0]);
      if (!l) return [[], ut];
      const c = l.indexOf("", 1);
      return [n[1][c], l];
    }, this.match(e, t);
  }
}, z = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakSet(), pt = /* @__PURE__ */ __name(function() {
  const e = /* @__PURE__ */ Object.create(null);
  return Object.keys(a(this, U)).concat(Object.keys(a(this, z))).forEach((t) => {
    e[t] || (e[t] = x(this, he, gt).call(this, t));
  }), f(this, z, f(this, U, void 0)), e;
}, "pt"), gt = /* @__PURE__ */ __name(function(e) {
  const t = [];
  let r = e === y;
  return [a(this, z), a(this, U)].forEach((s) => {
    const i = s[e] ? Object.keys(s[e]).map((n) => [n, s[e][n]]) : [];
    i.length !== 0 ? (r || (r = true), t.push(...i)) : e !== y && t.push(...Object.keys(s[y]).map((n) => [n, s[y][n]]));
  }), r ? Jt(t) : null;
}, "gt"), Je);
var B;
var k;
var Xe;
var Yt = (Xe = class {
  static {
    __name(this, "Xe");
  }
  constructor(e) {
    p(this, "name", "SmartRouter");
    m(this, B, []);
    m(this, k, []);
    f(this, B, e.routers);
  }
  add(e, t, r) {
    if (!a(this, k)) throw new Error(ct);
    a(this, k).push([e, t, r]);
  }
  match(e, t) {
    if (!a(this, k)) throw new Error("Fatal error");
    const r = a(this, B), s = a(this, k), i = r.length;
    let n = 0, o;
    for (; n < i; n++) {
      const l = r[n];
      try {
        for (let c = 0, h = s.length; c < h; c++) l.add(...s[c]);
        o = l.match(e, t);
      } catch (c) {
        if (c instanceof lt) continue;
        throw c;
      }
      this.match = l.match.bind(l), f(this, B, [l]), f(this, k, void 0);
      break;
    }
    if (n === i) throw new Error("Fatal error");
    return this.name = `SmartRouter + ${this.activeRouter.name}`, o;
  }
  get activeRouter() {
    if (a(this, k) || a(this, B).length !== 1) throw new Error("No active router has been determined yet.");
    return a(this, B)[0];
  }
}, B = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap(), Xe);
var fe = /* @__PURE__ */ Object.create(null);
var V;
var R;
var Y;
var le;
var j;
var $;
var K;
var Ye;
var mt = (Ye = class {
  static {
    __name(this, "Ye");
  }
  constructor(e, t, r) {
    m(this, $);
    m(this, V);
    m(this, R);
    m(this, Y);
    m(this, le, 0);
    m(this, j, fe);
    if (f(this, R, r || /* @__PURE__ */ Object.create(null)), f(this, V, []), e && t) {
      const s = /* @__PURE__ */ Object.create(null);
      s[e] = { handler: t, possibleKeys: [], score: 0 }, f(this, V, [s]);
    }
    f(this, Y, []);
  }
  insert(e, t, r) {
    f(this, le, ++Me(this, le)._);
    let s = this;
    const i = Ct(t), n = [];
    for (let o = 0, l = i.length; o < l; o++) {
      const c = i[o], h = i[o + 1], d = Nt(c, h), u = Array.isArray(d) ? d[0] : c;
      if (u in a(s, R)) {
        s = a(s, R)[u], d && n.push(d[1]);
        continue;
      }
      a(s, R)[u] = new mt(), d && (a(s, Y).push(d), n.push(d[1])), s = a(s, R)[u];
    }
    return a(s, V).push({ [e]: { handler: r, possibleKeys: n.filter((o, l, c) => c.indexOf(o) === l), score: a(this, le) } }), s;
  }
  search(e, t) {
    var l;
    const r = [];
    f(this, j, fe);
    let i = [this];
    const n = Ze(t), o = [];
    for (let c = 0, h = n.length; c < h; c++) {
      const d = n[c], u = c === h - 1, g = [];
      for (let b = 0, S = i.length; b < S; b++) {
        const v = i[b], w = a(v, R)[d];
        w && (f(w, j, a(v, j)), u ? (a(w, R)["*"] && r.push(...x(this, $, K).call(this, a(w, R)["*"], e, a(v, j))), r.push(...x(this, $, K).call(this, w, e, a(v, j)))) : g.push(w));
        for (let O = 0, ee = a(v, Y).length; O < ee; O++) {
          const de = a(v, Y)[O], N = a(v, j) === fe ? {} : { ...a(v, j) };
          if (de === "*") {
            const F = a(v, R)["*"];
            F && (r.push(...x(this, $, K).call(this, F, e, a(v, j))), f(F, j, N), g.push(F));
            continue;
          }
          const [Te, ke, ue] = de;
          if (!d && !(ue instanceof RegExp)) continue;
          const H = a(v, R)[Te], bt = n.slice(c).join("/");
          if (ue instanceof RegExp) {
            const F = ue.exec(bt);
            if (F) {
              if (N[ke] = F[0], r.push(...x(this, $, K).call(this, H, e, a(v, j), N)), Object.keys(a(H, R)).length) {
                f(H, j, N);
                const Ce = ((l = F[0].match(/\//)) == null ? void 0 : l.length) ?? 0;
                (o[Ce] || (o[Ce] = [])).push(H);
              }
              continue;
            }
          }
          (ue === true || ue.test(d)) && (N[ke] = d, u ? (r.push(...x(this, $, K).call(this, H, e, N, a(v, j))), a(H, R)["*"] && r.push(...x(this, $, K).call(this, a(H, R)["*"], e, N, a(v, j)))) : (f(H, j, N), g.push(H)));
        }
      }
      i = g.concat(o.shift() ?? []);
    }
    return r.length > 1 && r.sort((c, h) => c.score - h.score), [r.map(({ handler: c, params: h }) => [c, h])];
  }
}, V = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap(), Y = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap(), $ = /* @__PURE__ */ new WeakSet(), K = /* @__PURE__ */ __name(function(e, t, r, s) {
  const i = [];
  for (let n = 0, o = a(e, V).length; n < o; n++) {
    const l = a(e, V)[n], c = l[t] || l[y], h = {};
    if (c !== void 0 && (c.params = /* @__PURE__ */ Object.create(null), i.push(c), r !== fe || s && s !== fe)) for (let d = 0, u = c.possibleKeys.length; d < u; d++) {
      const g = c.possibleKeys[d], b = h[c.score];
      c.params[g] = s != null && s[g] && !b ? s[g] : r[g] ?? (s == null ? void 0 : s[g]), h[c.score] = true;
    }
  }
  return i;
}, "K"), Ye);
var Q;
var Qe;
var Qt = (Qe = class {
  static {
    __name(this, "Qe");
  }
  constructor() {
    p(this, "name", "TrieRouter");
    m(this, Q);
    f(this, Q, new mt());
  }
  add(e, t, r) {
    const s = tt(t);
    if (s) {
      for (let i = 0, n = s.length; i < n; i++) a(this, Q).insert(e, s[i], r);
      return;
    }
    a(this, Q).insert(e, t, r);
  }
  match(e, t) {
    return a(this, Q).search(e, t);
  }
}, Q = /* @__PURE__ */ new WeakMap(), Qe);
var xt = class extends ht {
  static {
    __name(this, "xt");
  }
  constructor(e = {}) {
    super(e), this.router = e.router ?? new Yt({ routers: [new Xt(), new Qt()] });
  }
};
var Zt = /* @__PURE__ */ __name((e) => {
  const r = { ...{ origin: "*", allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"], allowHeaders: [], exposeHeaders: [] }, ...e }, s = /* @__PURE__ */ ((n) => typeof n == "string" ? n === "*" ? () => n : (o) => n === o ? o : null : typeof n == "function" ? n : (o) => n.includes(o) ? o : null)(r.origin), i = ((n) => typeof n == "function" ? n : Array.isArray(n) ? () => n : () => [])(r.allowMethods);
  return async function(o, l) {
    var d;
    function c(u, g) {
      o.res.headers.set(u, g);
    }
    __name(c, "c");
    const h = await s(o.req.header("origin") || "", o);
    if (h && c("Access-Control-Allow-Origin", h), r.origin !== "*") {
      const u = o.req.header("Vary");
      u ? c("Vary", u) : c("Vary", "Origin");
    }
    if (r.credentials && c("Access-Control-Allow-Credentials", "true"), (d = r.exposeHeaders) != null && d.length && c("Access-Control-Expose-Headers", r.exposeHeaders.join(",")), o.req.method === "OPTIONS") {
      r.maxAge != null && c("Access-Control-Max-Age", r.maxAge.toString());
      const u = await i(o.req.header("origin") || "", o);
      u.length && c("Access-Control-Allow-Methods", u.join(","));
      let g = r.allowHeaders;
      if (!(g != null && g.length)) {
        const b = o.req.header("Access-Control-Request-Headers");
        b && (g = b.split(/\s*,\s*/));
      }
      return g != null && g.length && (c("Access-Control-Allow-Headers", g.join(",")), o.res.headers.append("Vary", "Access-Control-Request-Headers")), o.res.headers.delete("Content-Length"), o.res.headers.delete("Content-Type"), new Response(null, { headers: o.res.headers, status: 204, statusText: "No Content" });
    }
    await l();
  };
}, "Zt");
var er = /^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
var ze = /* @__PURE__ */ __name((e, t = rr) => {
  const r = /\.([a-zA-Z0-9]+?)$/, s = e.match(r);
  if (!s) return;
  let i = t[s[1]];
  return i && i.startsWith("text") && (i += "; charset=utf-8"), i;
}, "ze");
var tr = { aac: "audio/aac", avi: "video/x-msvideo", avif: "image/avif", av1: "video/av1", bin: "application/octet-stream", bmp: "image/bmp", css: "text/css", csv: "text/csv", eot: "application/vnd.ms-fontobject", epub: "application/epub+zip", gif: "image/gif", gz: "application/gzip", htm: "text/html", html: "text/html", ico: "image/x-icon", ics: "text/calendar", jpeg: "image/jpeg", jpg: "image/jpeg", js: "text/javascript", json: "application/json", jsonld: "application/ld+json", map: "application/json", mid: "audio/x-midi", midi: "audio/x-midi", mjs: "text/javascript", mp3: "audio/mpeg", mp4: "video/mp4", mpeg: "video/mpeg", oga: "audio/ogg", ogv: "video/ogg", ogx: "application/ogg", opus: "audio/opus", otf: "font/otf", pdf: "application/pdf", png: "image/png", rtf: "application/rtf", svg: "image/svg+xml", tif: "image/tiff", tiff: "image/tiff", ts: "video/mp2t", ttf: "font/ttf", txt: "text/plain", wasm: "application/wasm", webm: "video/webm", weba: "audio/webm", webmanifest: "application/manifest+json", webp: "image/webp", woff: "font/woff", woff2: "font/woff2", xhtml: "application/xhtml+xml", xml: "application/xml", zip: "application/zip", "3gp": "video/3gpp", "3g2": "video/3gpp2", gltf: "model/gltf+json", glb: "model/gltf-binary" };
var rr = tr;
var sr = /* @__PURE__ */ __name((...e) => {
  let t = e.filter((i) => i !== "").join("/");
  t = t.replace(new RegExp("(?<=\\/)\\/+", "g"), "");
  const r = t.split("/"), s = [];
  for (const i of r) i === ".." && s.length > 0 && s.at(-1) !== ".." ? s.pop() : i !== "." && s.push(i);
  return s.join("/") || ".";
}, "sr");
var vt = { br: ".br", zstd: ".zst", gzip: ".gz" };
var ir = Object.keys(vt);
var nr = "index.html";
var ar = /* @__PURE__ */ __name((e) => {
  const t = e.root ?? "./", r = e.path, s = e.join ?? sr;
  return async (i, n) => {
    var d, u, g, b;
    if (i.finalized) return n();
    let o;
    if (e.path) o = e.path;
    else try {
      if (o = decodeURIComponent(i.req.path), /(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o)) throw new Error();
    } catch {
      return await ((d = e.onNotFound) == null ? void 0 : d.call(e, i.req.path, i)), n();
    }
    let l = s(t, !r && e.rewriteRequestPath ? e.rewriteRequestPath(o) : o);
    e.isDir && await e.isDir(l) && (l = s(l, nr));
    const c = e.getContent;
    let h = await c(l, i);
    if (h instanceof Response) return i.newResponse(h.body, h);
    if (h) {
      const S = e.mimes && ze(l, e.mimes) || ze(l);
      if (i.header("Content-Type", S || "application/octet-stream"), e.precompressed && (!S || er.test(S))) {
        const v = new Set((u = i.req.header("Accept-Encoding")) == null ? void 0 : u.split(",").map((w) => w.trim()));
        for (const w of ir) {
          if (!v.has(w)) continue;
          const O = await c(l + vt[w], i);
          if (O) {
            h = O, i.header("Content-Encoding", w), i.header("Vary", "Accept-Encoding", { append: true });
            break;
          }
        }
      }
      return await ((g = e.onFound) == null ? void 0 : g.call(e, l, i)), i.body(h);
    }
    await ((b = e.onNotFound) == null ? void 0 : b.call(e, l, i)), await n();
  };
}, "ar");
var or = /* @__PURE__ */ __name(async (e, t) => {
  let r;
  t && t.manifest ? typeof t.manifest == "string" ? r = JSON.parse(t.manifest) : r = t.manifest : typeof __STATIC_CONTENT_MANIFEST == "string" ? r = JSON.parse(__STATIC_CONTENT_MANIFEST) : r = __STATIC_CONTENT_MANIFEST;
  let s;
  t && t.namespace ? s = t.namespace : s = __STATIC_CONTENT;
  const i = r[e] || e;
  if (!i) return null;
  const n = await s.get(i, { type: "stream" });
  return n || null;
}, "or");
var cr = /* @__PURE__ */ __name((e) => async function(r, s) {
  return ar({ ...e, getContent: /* @__PURE__ */ __name(async (n) => or(n, { manifest: e.manifest, namespace: e.namespace ? e.namespace : r.env ? r.env.__STATIC_CONTENT : void 0 }), "getContent") })(r, s);
}, "cr");
var lr = /* @__PURE__ */ __name((e) => cr(e), "lr");
var Z = new xt();
Z.use("/api/*", Zt());
Z.use("/static/*", lr({ root: "./public" }));
Z.get("/api/manual/sections", (e) => {
  const t = [{ id: "getting-started", title: "\u306F\u3058\u3081\u306B", icon: "fa-rocket", content: { overview: "\u5B85\u5EFABOOST\u306F\u3001AI\u642D\u8F09\u306E\u5B85\u5EFA\u8A66\u9A13\u5B66\u7FD2\u30A2\u30D7\u30EA\u3067\u3059\u3002402\u554F\u306E\u8A66\u9A13\u554F\u984C\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u3068\u3001\u52B9\u7387\u7684\u306A\u5B66\u7FD2\u6A5F\u80FD\u3092\u63D0\u4F9B\u3057\u307E\u3059\u3002", features: ["402\u554F\u306E\u8A66\u9A13\u554F\u984C\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9", "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2\uFF08\u6A29\u5229\u95A2\u4FC2\u30FB\u5B85\u5EFA\u696D\u6CD5\u30FB\u6CD5\u4EE4\u5236\u9650\u30FB\u7A0E/\u305D\u306E\u4ED6\uFF09", "\u6A21\u64EC\u8A66\u9A13\u6A5F\u80FD\uFF0850\u554F\u30FB2\u6642\u9593\u5236\u9650\uFF09", "\u82E6\u624B\u554F\u984C\u306E\u81EA\u52D5\u62BD\u51FA", "AI\u5F31\u70B9\u5206\u6790", "\u5B66\u7FD2\u9032\u6357\u306E\u53EF\u8996\u5316"] } }, { id: "user-registration", title: "\u30E6\u30FC\u30B6\u30FC\u767B\u9332\u30FB\u30ED\u30B0\u30A4\u30F3", icon: "fa-user", content: { steps: [{ title: "\u65B0\u898F\u767B\u9332", description: "\u30C8\u30C3\u30D7\u30DA\u30FC\u30B8\u304B\u3089\u300C\u65B0\u898F\u767B\u9332\u300D\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3001\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B\u3057\u307E\u3059\u3002", tips: ["\u30D1\u30B9\u30EF\u30FC\u30C9\u306F8\u6587\u5B57\u4EE5\u4E0A\u3067\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044", "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306F\u5F8C\u304B\u3089\u5909\u66F4\u53EF\u80FD\u3067\u3059"] }, { title: "\u30ED\u30B0\u30A4\u30F3", description: "\u767B\u9332\u6E08\u307F\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u307E\u3059\u3002", tips: ["\u300C\u30ED\u30B0\u30A4\u30F3\u72B6\u614B\u3092\u4FDD\u6301\u300D\u306B\u30C1\u30A7\u30C3\u30AF\u3092\u5165\u308C\u308B\u3068\u3001\u6B21\u56DE\u304B\u3089\u81EA\u52D5\u30ED\u30B0\u30A4\u30F3\u3055\u308C\u307E\u3059"] }, { title: "\u30B2\u30B9\u30C8\u30E2\u30FC\u30C9", description: "\u767B\u9332\u306A\u3057\u3067\u5229\u7528\u3057\u305F\u3044\u5834\u5408\u306F\u300C\u30B2\u30B9\u30C8\u3068\u3057\u3066\u7D9A\u884C\u300D\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002", tips: ["\u30B2\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u306F\u5B66\u7FD2\u5C65\u6B74\u304C\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093", "\u3044\u3064\u3067\u3082\u30E6\u30FC\u30B6\u30FC\u767B\u9332\u306B\u5207\u308A\u66FF\u3048\u3089\u308C\u307E\u3059"] }] } }, { id: "study-mode", title: "\u5B66\u7FD2\u30E2\u30FC\u30C9", icon: "fa-book", content: { modes: [{ name: "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2", description: "\u5206\u91CE\u3054\u3068\u306B\u554F\u984C\u3092\u89E3\u3044\u3066\u57FA\u790E\u529B\u3092\u8EAB\u306B\u3064\u3051\u307E\u3059", howTo: ["\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u300C\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2\u300D\u3092\u9078\u629E", "\u5B66\u7FD2\u3057\u305F\u3044\u30AB\u30C6\u30B4\u30EA\u30FC\uFF08\u6A29\u5229\u95A2\u4FC2/\u5B85\u5EFA\u696D\u6CD5/\u6CD5\u4EE4\u5236\u9650/\u7A0E\u30FB\u305D\u306E\u4ED6\uFF09\u3092\u9078\u629E", "\u554F\u984C\u304C\u8868\u793A\u3055\u308C\u308B\u306E\u3067\u30014\u3064\u306E\u9078\u629E\u80A2\u304B\u3089\u6B63\u89E3\u3092\u9078\u629E", "\u89E3\u7B54\u5F8C\u3001\u6B63\u89E3\u3068\u89E3\u8AAC\u304C\u8868\u793A\u3055\u308C\u307E\u3059", "\u300C\u6B21\u306E\u554F\u984C\u3078\u300D\u3067\u6B21\u306E\u554F\u984C\u306B\u9032\u307F\u307E\u3059"] }, { name: "\u82E6\u624B\u554F\u984C\u96C6\u4E2D\u5B66\u7FD2", description: "\u9593\u9055\u3048\u305F\u554F\u984C\u3092\u91CD\u70B9\u7684\u306B\u5FA9\u7FD2\u3057\u307E\u3059", howTo: ["\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u300C\u82E6\u624B\u554F\u984C\u300D\u3092\u9078\u629E", "\u904E\u53BB\u306B\u9593\u9055\u3048\u305F\u554F\u984C\u304C\u81EA\u52D5\u7684\u306B\u62BD\u51FA\u3055\u308C\u307E\u3059", "\u7E70\u308A\u8FD4\u3057\u89E3\u3044\u3066\u82E6\u624B\u3092\u514B\u670D\u3057\u307E\u3057\u3087\u3046", "\u6B63\u89E3\u7387\u304C\u4E0A\u304C\u308B\u3068\u81EA\u52D5\u7684\u306B\u82E6\u624B\u30EA\u30B9\u30C8\u304B\u3089\u5916\u308C\u307E\u3059"] }, { name: "\u30E9\u30F3\u30C0\u30E0\u5B66\u7FD2", description: "\u5168\u30AB\u30C6\u30B4\u30EA\u30FC\u304B\u3089\u30E9\u30F3\u30C0\u30E0\u306B\u51FA\u984C\u3055\u308C\u307E\u3059", howTo: ["\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u300C\u30E9\u30F3\u30C0\u30E0\u5B66\u7FD2\u300D\u3092\u9078\u629E", "\u5168402\u554F\u304B\u3089\u30E9\u30F3\u30C0\u30E0\u306B\u554F\u984C\u304C\u51FA\u984C\u3055\u308C\u307E\u3059", "\u7DCF\u5408\u7684\u306A\u5B9F\u529B\u3092\u8A66\u3059\u306E\u306B\u6700\u9069\u3067\u3059"] }] } }, { id: "mock-exam", title: "\u6A21\u64EC\u8A66\u9A13", icon: "fa-clock", content: { overview: "\u672C\u756A\u3068\u540C\u3058\u5F62\u5F0F\u306750\u554F\u30FB2\u6642\u9593\u306E\u6A21\u64EC\u8A66\u9A13\u3092\u53D7\u3051\u3089\u308C\u307E\u3059\u3002", features: [{ name: "\u8A66\u9A13\u5F62\u5F0F", details: ["\u554F\u984C\u6570\uFF1A50\u554F\uFF08\u672C\u756A\u3068\u540C\u3058\uFF09", "\u5236\u9650\u6642\u9593\uFF1A2\u6642\u9593\uFF08120\u5206\uFF09", "\u51FA\u984C\u7BC4\u56F2\uFF1A\u5168\u30AB\u30C6\u30B4\u30EA\u30FC\u304B\u3089\u5747\u7B49\u306B\u51FA\u984C", "\u5408\u683C\u30E9\u30A4\u30F3\uFF1A70%\uFF0835\u554F\u6B63\u89E3\uFF09"] }, { name: "\u30BF\u30A4\u30DE\u30FC\u6A5F\u80FD", details: ["\u30AB\u30A6\u30F3\u30C8\u30C0\u30A6\u30F3\u30BF\u30A4\u30DE\u30FC\u3067\u6B8B\u308A\u6642\u9593\u3092\u8868\u793A", "\u6B8B\u308A10\u5206\u30015\u5206\u30011\u5206\u3067\u8B66\u544A\u8868\u793A", "\u4E00\u6642\u505C\u6B62\u30FB\u518D\u958B\u6A5F\u80FD\u3042\u308A", "\u6642\u9593\u5207\u308C\u3067\u81EA\u52D5\u7D42\u4E86"] }, { name: "\u7D50\u679C\u5206\u6790", details: ["\u70B9\u6570\u3068\u6B63\u7B54\u7387\u3092\u8868\u793A", "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u306E\u6210\u7E3E\u5206\u6790", "\u9593\u9055\u3048\u305F\u554F\u984C\u306E\u78BA\u8A8D\u3068\u89E3\u8AAC", "\u82E6\u624B\u5206\u91CE\u306E\u7279\u5B9A\u3068\u30A2\u30C9\u30D0\u30A4\u30B9"] }], howTo: ["\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u300C\u6A21\u64EC\u8A66\u9A13\u300D\u3092\u9078\u629E", "\u300C\u8A66\u9A13\u958B\u59CB\u300D\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF", "50\u554F\u3059\u3079\u3066\u306B\u89E3\u7B54\uFF08\u9014\u4E2D\u4FDD\u5B58\u53EF\u80FD\uFF09", "\u300C\u63A1\u70B9\u3059\u308B\u300D\u30DC\u30BF\u30F3\u3067\u7D50\u679C\u3092\u78BA\u8A8D", "\u7D50\u679C\u753B\u9762\u3067\u8A73\u7D30\u306A\u5206\u6790\u3092\u78BA\u8A8D"] } }, { id: "progress-tracking", title: "\u5B66\u7FD2\u9032\u6357\u7BA1\u7406", icon: "fa-chart-line", content: { features: [{ name: "\u5B66\u7FD2\u7D71\u8A08", description: "\u7DCF\u5B66\u7FD2\u6642\u9593\u3001\u89E3\u7B54\u6570\u3001\u6B63\u7B54\u7387\u306A\u3069\u3092\u78BA\u8A8D\u3067\u304D\u307E\u3059", details: ["\u4ECA\u65E5\u306E\u5B66\u7FD2\u6642\u9593", "\u7D2F\u8A08\u89E3\u7B54\u554F\u984C\u6570", "\u5168\u4F53\u306E\u6B63\u7B54\u7387", "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u306E\u6B63\u7B54\u7387", "\u9023\u7D9A\u5B66\u7FD2\u65E5\u6570"] }, { name: "3D\u30D3\u30B8\u30E5\u30A2\u30E9\u30A4\u30BC\u30FC\u30B7\u30E7\u30F3", description: "\u5B66\u7FD2\u9032\u6357\u30923D\u30B0\u30E9\u30D5\u3067\u8996\u899A\u7684\u306B\u78BA\u8A8D", details: ["\u30EC\u30FC\u30C0\u30FC\u30C1\u30E3\u30FC\u30C8\u3067\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u306E\u7FD2\u719F\u5EA6\u3092\u8868\u793A", "\u6642\u7CFB\u5217\u30B0\u30E9\u30D5\u3067\u6210\u9577\u3092\u53EF\u8996\u5316", "\u76EE\u6A19\u9054\u6210\u5EA6\u3092\u30D7\u30ED\u30B0\u30EC\u30B9\u30D0\u30FC\u3067\u8868\u793A"] }, { name: "\u30AB\u30EC\u30F3\u30C0\u30FC\u6A5F\u80FD", description: "\u5B66\u7FD2\u30AB\u30EC\u30F3\u30C0\u30FC\u3067\u8A08\u753B\u7684\u306A\u5B66\u7FD2\u3092\u30B5\u30DD\u30FC\u30C8", details: ["\u8A66\u9A13\u65E5\u307E\u3067\u306E\u30AB\u30A6\u30F3\u30C8\u30C0\u30A6\u30F3", "\u5B66\u7FD2\u3057\u305F\u65E5\u306B\u30DE\u30FC\u30AF\u8868\u793A", "\u6708\u9593\u30FB\u9031\u9593\u306E\u5B66\u7FD2\u30B5\u30DE\u30EA\u30FC"] }] } }, { id: "ai-features", title: "AI\u6A5F\u80FD", icon: "fa-brain", content: { features: [{ name: "\u5F31\u70B9\u5206\u6790", description: "AI\u304C\u5B66\u7FD2\u30C7\u30FC\u30BF\u3092\u5206\u6790\u3057\u3001\u5F31\u70B9\u3092\u7279\u5B9A\u3057\u307E\u3059", benefits: ["\u9593\u9055\u3044\u30D1\u30BF\u30FC\u30F3\u306E\u81EA\u52D5\u691C\u51FA", "\u82E6\u624B\u5206\u91CE\u306E\u512A\u5148\u9806\u4F4D\u4ED8\u3051", "\u52B9\u7387\u7684\u306A\u5B66\u7FD2\u8A08\u753B\u306E\u63D0\u6848"] }, { name: "\u5B66\u7FD2\u30A2\u30C9\u30D0\u30A4\u30B9", description: "\u500B\u4EBA\u306E\u5B66\u7FD2\u72B6\u6CC1\u306B\u5FDC\u3058\u305F\u30A2\u30C9\u30D0\u30A4\u30B9\u3092\u63D0\u4F9B", benefits: ["\u6700\u9069\u306A\u5B66\u7FD2\u9806\u5E8F\u306E\u63D0\u6848", "\u5FA9\u7FD2\u30BF\u30A4\u30DF\u30F3\u30B0\u306E\u6700\u9069\u5316", "\u30E2\u30C1\u30D9\u30FC\u30B7\u30E7\u30F3\u7DAD\u6301\u306E\u30B5\u30DD\u30FC\u30C8"] }] } }, { id: "tips", title: "\u5B66\u7FD2\u306E\u30B3\u30C4", icon: "fa-lightbulb", content: { tips: [{ title: "\u6BCE\u65E5\u5C11\u3057\u305A\u3064", description: "1\u65E515\u5206\u3067\u3082\u826F\u3044\u306E\u3067\u3001\u6BCE\u65E5\u7D99\u7D9A\u3059\u308B\u3053\u3068\u304C\u5927\u5207\u3067\u3059\u3002" }, { title: "\u82E6\u624B\u5206\u91CE\u3092\u512A\u5148", description: "\u82E6\u624B\u306A\u5206\u91CE\u304B\u3089\u53D6\u308A\u7D44\u3080\u3053\u3068\u3067\u3001\u52B9\u7387\u7684\u306B\u5F97\u70B9\u3092\u4F38\u3070\u305B\u307E\u3059\u3002" }, { title: "\u89E3\u8AAC\u3092\u3057\u3063\u304B\u308A\u8AAD\u3080", description: "\u6B63\u89E3\u30FB\u4E0D\u6B63\u89E3\u306B\u95A2\u308F\u3089\u305A\u3001\u89E3\u8AAC\u3092\u8AAD\u3093\u3067\u7406\u89E3\u3092\u6DF1\u3081\u307E\u3057\u3087\u3046\u3002" }, { title: "\u6A21\u64EC\u8A66\u9A13\u3067\u5B9F\u529B\u30C1\u30A7\u30C3\u30AF", description: "\u9031\u306B1\u56DE\u306F\u6A21\u64EC\u8A66\u9A13\u3092\u53D7\u3051\u3066\u3001\u672C\u756A\u306E\u611F\u899A\u3092\u63B4\u307F\u307E\u3057\u3087\u3046\u3002" }, { title: "\u5FA9\u7FD2\u3092\u5FD8\u308C\u305A\u306B", description: "\u4E00\u5EA6\u89E3\u3044\u305F\u554F\u984C\u3082\u3001\u6642\u9593\u3092\u7A7A\u3051\u3066\u5FA9\u7FD2\u3059\u308B\u3053\u3068\u3067\u5B9A\u7740\u3057\u307E\u3059\u3002" }] } }, { id: "troubleshooting", title: "\u30C8\u30E9\u30D6\u30EB\u30B7\u30E5\u30FC\u30C6\u30A3\u30F3\u30B0", icon: "fa-tools", content: { issues: [{ problem: "\u30ED\u30B0\u30A4\u30F3\u3067\u304D\u306A\u3044", solutions: ["\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u3044\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306E\u5165\u529B\u30DF\u30B9\u304C\u306A\u3044\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", "\u30D1\u30B9\u30EF\u30FC\u30C9\u30EA\u30BB\u30C3\u30C8\u6A5F\u80FD\u3092\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044"] }, { problem: "\u554F\u984C\u304C\u8868\u793A\u3055\u308C\u306A\u3044", solutions: ["\u30A4\u30F3\u30BF\u30FC\u30CD\u30C3\u30C8\u63A5\u7D9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", "\u30D6\u30E9\u30A6\u30B6\u306E\u30AD\u30E3\u30C3\u30B7\u30E5\u3092\u30AF\u30EA\u30A2\u3057\u3066\u304F\u3060\u3055\u3044", "\u30DA\u30FC\u30B8\u3092\u518D\u8AAD\u307F\u8FBC\u307F\u3057\u3066\u304F\u3060\u3055\u3044\uFF08F5\u30AD\u30FC\uFF09"] }, { problem: "\u5B66\u7FD2\u5C65\u6B74\u304C\u4FDD\u5B58\u3055\u308C\u306A\u3044", solutions: ["\u30ED\u30B0\u30A4\u30F3\u72B6\u614B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", "\u30B2\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u306F\u5C65\u6B74\u304C\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093", "\u30D6\u30E9\u30A6\u30B6\u306ECookie\u304C\u6709\u52B9\u306B\u306A\u3063\u3066\u3044\u308B\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044"] }] } }];
  return e.json(t);
});
Z.get("/api/tutorial/steps", (e) => {
  const t = [{ id: 1, target: ".menu-button", title: "\u30E1\u30CB\u30E5\u30FC\u3078\u3088\u3046\u3053\u305D\uFF01", content: "\u3053\u3053\u304B\u3089\u5404\u5B66\u7FD2\u30E2\u30FC\u30C9\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u3059\u3002", position: "bottom" }, { id: 2, target: ".category-study", title: "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2", content: "\u5206\u91CE\u3054\u3068\u306B\u554F\u984C\u3092\u89E3\u3044\u3066\u57FA\u790E\u529B\u3092\u8EAB\u306B\u3064\u3051\u307E\u3057\u3087\u3046\u3002", position: "right" }, { id: 3, target: ".mock-exam", title: "\u6A21\u64EC\u8A66\u9A13", content: "\u672C\u756A\u3068\u540C\u305850\u554F\u30FB2\u6642\u9593\u306E\u8A66\u9A13\u306B\u6311\u6226\u3067\u304D\u307E\u3059\u3002", position: "left" }, { id: 4, target: ".weak-points", title: "\u82E6\u624B\u554F\u984C", content: "\u9593\u9055\u3048\u305F\u554F\u984C\u3092\u91CD\u70B9\u7684\u306B\u5FA9\u7FD2\u3067\u304D\u307E\u3059\u3002", position: "bottom" }, { id: 5, target: ".progress-chart", title: "\u9032\u6357\u78BA\u8A8D", content: "\u3042\u306A\u305F\u306E\u5B66\u7FD2\u9032\u6357\u3092\u30B0\u30E9\u30D5\u3067\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002", position: "top" }];
  return e.json(t);
});
Z.get("/api/faq", (e) => {
  const t = [{ id: 1, category: "\u57FA\u672C\u6A5F\u80FD", question: "\u7121\u6599\u3067\u4F7F\u3048\u307E\u3059\u304B\uFF1F", answer: "\u306F\u3044\u3001\u57FA\u672C\u6A5F\u80FD\u306F\u7121\u6599\u3067\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059\u3002" }, { id: 2, category: "\u57FA\u672C\u6A5F\u80FD", question: "\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u3082\u4F7F\u3048\u307E\u3059\u304B\uFF1F", answer: "PWA\u5BFE\u5FDC\u306B\u3088\u308A\u3001\u4E00\u5EA6\u8AAD\u307F\u8FBC\u3093\u3060\u30B3\u30F3\u30C6\u30F3\u30C4\u306F\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u3082\u5229\u7528\u53EF\u80FD\u3067\u3059\u3002" }, { id: 3, category: "\u5B66\u7FD2\u65B9\u6CD5", question: "\u52B9\u7387\u7684\u306A\u5B66\u7FD2\u65B9\u6CD5\u3092\u6559\u3048\u3066\u304F\u3060\u3055\u3044", answer: "\u307E\u305A\u82E6\u624B\u5206\u91CE\u3092\u7279\u5B9A\u3057\u3001\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2\u3067\u57FA\u790E\u3092\u56FA\u3081\u305F\u5F8C\u3001\u6A21\u64EC\u8A66\u9A13\u3067\u5B9F\u529B\u3092\u78BA\u8A8D\u3059\u308B\u3053\u3068\u3092\u304A\u52E7\u3081\u3057\u307E\u3059\u3002" }, { id: 4, category: "\u5B66\u7FD2\u65B9\u6CD5", question: "1\u65E5\u3069\u306E\u304F\u3089\u3044\u5B66\u7FD2\u3059\u308C\u3070\u826F\u3044\u3067\u3059\u304B\uFF1F", answer: "\u500B\u4EBA\u5DEE\u306F\u3042\u308A\u307E\u3059\u304C\u3001\u6BCE\u65E530\u5206\u301C1\u6642\u9593\u306E\u5B66\u7FD2\u30923\u30F6\u6708\u7D99\u7D9A\u3059\u308B\u3053\u3068\u3067\u5408\u683C\u30EC\u30D9\u30EB\u306B\u5230\u9054\u3067\u304D\u307E\u3059\u3002" }, { id: 5, category: "\u30A2\u30AB\u30A6\u30F3\u30C8", question: "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u307E\u3057\u305F", answer: "\u30ED\u30B0\u30A4\u30F3\u753B\u9762\u306E\u300C\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u305F\u65B9\u300D\u304B\u3089\u30EA\u30BB\u30C3\u30C8\u624B\u7D9A\u304D\u3092\u884C\u3063\u3066\u304F\u3060\u3055\u3044\u3002" }, { id: 6, category: "\u30A2\u30AB\u30A6\u30F3\u30C8", question: "\u8907\u6570\u30C7\u30D0\u30A4\u30B9\u3067\u4F7F\u3048\u307E\u3059\u304B\uFF1F", answer: "\u306F\u3044\u3001\u540C\u3058\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u30ED\u30B0\u30A4\u30F3\u3059\u308C\u3070\u3001\u3069\u306E\u30C7\u30D0\u30A4\u30B9\u304B\u3089\u3067\u3082\u5B66\u7FD2\u3092\u7D99\u7D9A\u3067\u304D\u307E\u3059\u3002" }, { id: 7, category: "\u6280\u8853\u7684\u306A\u554F\u984C", question: "\u52D5\u4F5C\u304C\u9045\u3044\u5834\u5408\u306F\u3069\u3046\u3059\u308C\u3070\u826F\u3044\u3067\u3059\u304B\uFF1F", answer: "\u30D6\u30E9\u30A6\u30B6\u306E\u30AD\u30E3\u30C3\u30B7\u30E5\u3092\u30AF\u30EA\u30A2\u3057\u3001\u4E0D\u8981\u306A\u30BF\u30D6\u3092\u9589\u3058\u3066\u304B\u3089\u518D\u5EA6\u30A2\u30AF\u30BB\u30B9\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }, { id: 8, category: "\u6280\u8853\u7684\u306A\u554F\u984C", question: "\u63A8\u5968\u30D6\u30E9\u30A6\u30B6\u306F\u3042\u308A\u307E\u3059\u304B\uFF1F", answer: "Chrome\u3001Firefox\u3001Safari\u3001Edge\u306E\u6700\u65B0\u7248\u3092\u63A8\u5968\u3057\u3066\u3044\u307E\u3059\u3002" }];
  return e.json(t);
});
Z.get("/", (e) => e.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>\u5B85\u5EFABOOST - AI\u642D\u8F09\u5B85\u5EFA\u8A66\u9A13\u5B66\u7FD2\u30A2\u30D7\u30EA</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
        <!-- \u30D8\u30EB\u30D7\u30DC\u30BF\u30F3\uFF08\u56FA\u5B9A\u4F4D\u7F6E\uFF09 -->
        <div class="fixed bottom-6 right-6 z-50">
            <button id="help-button" class="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 pulse-animation">
                <i class="fas fa-question-circle text-2xl"></i>
            </button>
        </div>

        <!-- \u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB\u30DC\u30BF\u30F3\uFF08\u56FA\u5B9A\u4F4D\u7F6E\uFF09 -->
        <div class="fixed bottom-6 left-6 z-50">
            <button id="tutorial-button" class="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110">
                <i class="fas fa-graduation-cap text-2xl"></i>
            </button>
        </div>

        <!-- \u30E1\u30A4\u30F3\u30B3\u30F3\u30C6\u30F3\u30C4 -->
        <div class="container mx-auto px-4 py-8">
            <!-- \u30D8\u30C3\u30C0\u30FC -->
            <header class="text-center mb-12">
                <h1 class="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 mb-4 animate-gradient">
                    \u5B85\u5EFABOOST
                </h1>
                <p class="text-xl text-gray-300">AI\u642D\u8F09\u5B85\u5EFA\u8A66\u9A13\u5B66\u7FD2\u30A2\u30D7\u30EA</p>
            </header>

            <!-- \u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <!-- \u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2 -->
                <div class="category-study glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-book text-3xl text-blue-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2</h2>
                    </div>
                    <p class="text-gray-300">\u5206\u91CE\u3054\u3068\u306B\u554F\u984C\u3092\u89E3\u3044\u3066\u57FA\u790E\u529B\u3092\u8EAB\u306B\u3064\u3051\u307E\u3059</p>
                </div>

                <!-- \u6A21\u64EC\u8A66\u9A13 -->
                <div class="mock-exam glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-clock text-3xl text-green-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">\u6A21\u64EC\u8A66\u9A13</h2>
                    </div>
                    <p class="text-gray-300">\u672C\u756A\u5F62\u5F0F50\u554F\u30FB2\u6642\u9593\u306E\u8A66\u9A13\u306B\u6311\u6226</p>
                </div>

                <!-- \u82E6\u624B\u554F\u984C -->
                <div class="weak-points glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-exclamation-triangle text-3xl text-red-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">\u82E6\u624B\u554F\u984C</h2>
                    </div>
                    <p class="text-gray-300">\u9593\u9055\u3048\u305F\u554F\u984C\u3092\u91CD\u70B9\u7684\u306B\u5FA9\u7FD2</p>
                </div>

                <!-- \u5B66\u7FD2\u7D71\u8A08 -->
                <div class="progress-chart glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-chart-line text-3xl text-purple-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">\u5B66\u7FD2\u7D71\u8A08</h2>
                    </div>
                    <p class="text-gray-300">\u9032\u6357\u3068\u6210\u7E3E\u3092\u53EF\u8996\u5316</p>
                </div>

                <!-- AI\u5206\u6790 -->
                <div class="glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-brain text-3xl text-pink-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">AI\u5206\u6790</h2>
                    </div>
                    <p class="text-gray-300">\u5F31\u70B9\u3092\u7279\u5B9A\u3057\u5B66\u7FD2\u3092\u30B5\u30DD\u30FC\u30C8</p>
                </div>

                <!-- \u30AB\u30EC\u30F3\u30C0\u30FC -->
                <div class="glass-morphism p-6 rounded-2xl hover:transform hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-calendar text-3xl text-yellow-400 mr-4"></i>
                        <h2 class="text-2xl font-bold text-white">\u30AB\u30EC\u30F3\u30C0\u30FC</h2>
                    </div>
                    <p class="text-gray-300">\u8A66\u9A13\u65E5\u307E\u3067\u306E\u5B66\u7FD2\u8A08\u753B</p>
                </div>
            </div>
        </div>

        <!-- \u30D8\u30EB\u30D7\u30E2\u30FC\u30C0\u30EB -->
        <div id="help-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden">
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-4xl max-h-[80vh] overflow-auto shadow-2xl">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-3xl font-bold text-white">
                            <i class="fas fa-book-open mr-3"></i>\u53D6\u6271\u8AAC\u660E\u66F8
                        </h2>
                        <button id="close-help" class="text-gray-400 hover:text-white text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div id="help-content" class="space-y-4">
                        <!-- \u30D8\u30EB\u30D7\u30B3\u30F3\u30C6\u30F3\u30C4\u304C\u3053\u3053\u306B\u52D5\u7684\u306B\u633F\u5165\u3055\u308C\u307E\u3059 -->
                    </div>
                </div>
            </div>
        </div>

        <!-- \u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB\u30AA\u30FC\u30D0\u30FC\u30EC\u30A4 -->
        <div id="tutorial-overlay" class="fixed inset-0 bg-black bg-opacity-75 z-40 hidden">
            <div id="tutorial-tooltip" class="absolute bg-white rounded-lg p-4 shadow-2xl max-w-sm hidden">
                <h3 id="tutorial-title" class="text-lg font-bold mb-2"></h3>
                <p id="tutorial-content" class="text-gray-700 mb-4"></p>
                <div class="flex justify-between">
                    <button id="tutorial-skip" class="text-gray-500 hover:text-gray-700">
                        \u30B9\u30AD\u30C3\u30D7
                    </button>
                    <div class="space-x-2">
                        <button id="tutorial-prev" class="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded">
                            \u524D\u3078
                        </button>
                        <button id="tutorial-next" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                            \u6B21\u3078
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"><\/script>
        <script src="/static/app.js"><\/script>
        <script src="/static/help-system.js"><\/script>
        <script src="/static/tutorial.js"><\/script>
    </body>
    </html>
  `));
var Ue = new xt();
var hr = Object.assign({ "/src/index.tsx": Z });
var wt = false;
for (const [, e] of Object.entries(hr)) e && (Ue.route("/", e), Ue.notFound(e.notFoundHandler), wt = true);
if (!wt) throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-BzDvnK/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = Ue;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-BzDvnK/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=bundledWorker-0.4196519500638336.mjs.map
