var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-TyFDHU/checked-fetch.js
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
var bt = Object.defineProperty;
var Fe = /* @__PURE__ */ __name((e) => {
  throw TypeError(e);
}, "Fe");
var Rt = /* @__PURE__ */ __name((e, t, r) => t in e ? bt(e, t, { enumerable: true, configurable: true, writable: true, value: r }) : e[t] = r, "Rt");
var p = /* @__PURE__ */ __name((e, t, r) => Rt(e, typeof t != "symbol" ? t + "" : t, r), "p");
var Ne = /* @__PURE__ */ __name((e, t, r) => t.has(e) || Fe("Cannot " + r), "Ne");
var c = /* @__PURE__ */ __name((e, t, r) => (Ne(e, t, "read from private field"), r ? r.call(e) : t.get(e)), "c");
var g = /* @__PURE__ */ __name((e, t, r) => t.has(e) ? Fe("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), "g");
var f = /* @__PURE__ */ __name((e, t, r, s) => (Ne(e, t, "write to private field"), s ? s.call(e, r) : t.set(e, r), r), "f");
var E = /* @__PURE__ */ __name((e, t, r) => (Ne(e, t, "access private method"), r), "E");
var Ue = /* @__PURE__ */ __name((e, t, r, s) => ({ set _(n) {
  f(e, t, n, r);
}, get _() {
  return c(e, t, s);
} }), "Ue");
var $e = /* @__PURE__ */ __name((e, t, r) => (s, n) => {
  let i = -1;
  return a(0);
  async function a(l) {
    if (l <= i) throw new Error("next() called multiple times");
    i = l;
    let o, u = false, d;
    if (e[l] ? (d = e[l][0][0], s.req.routeIndex = l) : d = l === e.length && n || void 0, d) try {
      o = await d(s, () => a(l + 1));
    } catch (h) {
      if (h instanceof Error && t) s.error = h, o = await t(h, s), u = true;
      else throw h;
    }
    else s.finalized === false && r && (o = await r(s));
    return o && (s.finalized === false || u) && (s.res = o), s;
  }
  __name(a, "a");
}, "$e");
var Ot = Symbol();
var St = /* @__PURE__ */ __name(async (e, t = /* @__PURE__ */ Object.create(null)) => {
  const { all: r = false, dot: s = false } = t, i = (e instanceof at ? e.raw.headers : e.headers).get("Content-Type");
  return i != null && i.startsWith("multipart/form-data") || i != null && i.startsWith("application/x-www-form-urlencoded") ? Tt(e, { all: r, dot: s }) : {};
}, "St");
async function Tt(e, t) {
  const r = await e.formData();
  return r ? qt(r, t) : {};
}
__name(Tt, "Tt");
function qt(e, t) {
  const r = /* @__PURE__ */ Object.create(null);
  return e.forEach((s, n) => {
    t.all || n.endsWith("[]") ? jt(r, n, s) : r[n] = s;
  }), t.dot && Object.entries(r).forEach(([s, n]) => {
    s.includes(".") && (At(r, s, n), delete r[s]);
  }), r;
}
__name(qt, "qt");
var jt = /* @__PURE__ */ __name((e, t, r) => {
  e[t] !== void 0 ? Array.isArray(e[t]) ? e[t].push(r) : e[t] = [e[t], r] : t.endsWith("[]") ? e[t] = [r] : e[t] = r;
}, "jt");
var At = /* @__PURE__ */ __name((e, t, r) => {
  let s = e;
  const n = t.split(".");
  n.forEach((i, a) => {
    a === n.length - 1 ? s[i] = r : ((!s[i] || typeof s[i] != "object" || Array.isArray(s[i]) || s[i] instanceof File) && (s[i] = /* @__PURE__ */ Object.create(null)), s = s[i]);
  });
}, "At");
var rt = /* @__PURE__ */ __name((e) => {
  const t = e.split("/");
  return t[0] === "" && t.shift(), t;
}, "rt");
var Ct = /* @__PURE__ */ __name((e) => {
  const { groups: t, path: r } = It(e), s = rt(r);
  return Nt(s, t);
}, "Ct");
var It = /* @__PURE__ */ __name((e) => {
  const t = [];
  return e = e.replace(/\{[^}]+\}/g, (r, s) => {
    const n = `@${s}`;
    return t.push([n, r]), n;
  }), { groups: t, path: e };
}, "It");
var Nt = /* @__PURE__ */ __name((e, t) => {
  for (let r = t.length - 1; r >= 0; r--) {
    const [s] = t[r];
    for (let n = e.length - 1; n >= 0; n--) if (e[n].includes(s)) {
      e[n] = e[n].replace(s, t[r][1]);
      break;
    }
  }
  return e;
}, "Nt");
var be = {};
var Dt = /* @__PURE__ */ __name((e, t) => {
  if (e === "*") return "*";
  const r = e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (r) {
    const s = `${e}#${t}`;
    return be[s] || (r[2] ? be[s] = t && t[0] !== ":" && t[0] !== "*" ? [s, r[1], new RegExp(`^${r[2]}(?=/${t})`)] : [e, r[1], new RegExp(`^${r[2]}$`)] : be[s] = [e, r[1], true]), be[s];
  }
  return null;
}, "Dt");
var Le = /* @__PURE__ */ __name((e, t) => {
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
}, "Le");
var Mt = /* @__PURE__ */ __name((e) => Le(e, decodeURI), "Mt");
var st = /* @__PURE__ */ __name((e) => {
  const t = e.url, r = t.indexOf("/", t.indexOf(":") + 4);
  let s = r;
  for (; s < t.length; s++) {
    const n = t.charCodeAt(s);
    if (n === 37) {
      const i = t.indexOf("?", s), a = t.slice(r, i === -1 ? void 0 : i);
      return Mt(a.includes("%25") ? a.replace(/%25/g, "%2525") : a);
    } else if (n === 63) break;
  }
  return t.slice(r, s);
}, "st");
var Pt = /* @__PURE__ */ __name((e) => {
  const t = st(e);
  return t.length > 1 && t.at(-1) === "/" ? t.slice(0, -1) : t;
}, "Pt");
var se = /* @__PURE__ */ __name((e, t, ...r) => (r.length && (t = se(t, ...r)), `${(e == null ? void 0 : e[0]) === "/" ? "" : "/"}${e}${t === "/" ? "" : `${(e == null ? void 0 : e.at(-1)) === "/" ? "" : "/"}${(t == null ? void 0 : t[0]) === "/" ? t.slice(1) : t}`}`), "se");
var nt = /* @__PURE__ */ __name((e) => {
  if (e.charCodeAt(e.length - 1) !== 63 || !e.includes(":")) return null;
  const t = e.split("/"), r = [];
  let s = "";
  return t.forEach((n) => {
    if (n !== "" && !/\:/.test(n)) s += "/" + n;
    else if (/\:/.test(n)) if (/\?/.test(n)) {
      r.length === 0 && s === "" ? r.push("/") : r.push(s);
      const i = n.replace("?", "");
      s += "/" + i, r.push(s);
    } else s += "/" + n;
  }), r.filter((n, i, a) => a.indexOf(n) === i);
}, "nt");
var De = /* @__PURE__ */ __name((e) => /[%+]/.test(e) ? (e.indexOf("+") !== -1 && (e = e.replace(/\+/g, " ")), e.indexOf("%") !== -1 ? Le(e, ot) : e) : e, "De");
var it = /* @__PURE__ */ __name((e, t, r) => {
  let s;
  if (!r && t && !/[%+]/.test(t)) {
    let a = e.indexOf(`?${t}`, 8);
    for (a === -1 && (a = e.indexOf(`&${t}`, 8)); a !== -1; ) {
      const l = e.charCodeAt(a + t.length + 1);
      if (l === 61) {
        const o = a + t.length + 2, u = e.indexOf("&", o);
        return De(e.slice(o, u === -1 ? void 0 : u));
      } else if (l == 38 || isNaN(l)) return "";
      a = e.indexOf(`&${t}`, a + 1);
    }
    if (s = /[%+]/.test(e), !s) return;
  }
  const n = {};
  s ?? (s = /[%+]/.test(e));
  let i = e.indexOf("?", 8);
  for (; i !== -1; ) {
    const a = e.indexOf("&", i + 1);
    let l = e.indexOf("=", i);
    l > a && a !== -1 && (l = -1);
    let o = e.slice(i + 1, l === -1 ? a === -1 ? void 0 : a : l);
    if (s && (o = De(o)), i = a, o === "") continue;
    let u;
    l === -1 ? u = "" : (u = e.slice(l + 1, a === -1 ? void 0 : a), s && (u = De(u))), r ? (n[o] && Array.isArray(n[o]) || (n[o] = []), n[o].push(u)) : n[o] ?? (n[o] = u);
  }
  return t ? n[t] : n;
}, "it");
var Ht = it;
var Lt = /* @__PURE__ */ __name((e, t) => it(e, t, true), "Lt");
var ot = decodeURIComponent;
var We = /* @__PURE__ */ __name((e) => Le(e, ot), "We");
var oe;
var q;
var L;
var ct;
var lt;
var Pe;
var U;
var Ge;
var at = (Ge = class {
  static {
    __name(this, "Ge");
  }
  constructor(e, t = "/", r = [[]]) {
    g(this, L);
    p(this, "raw");
    g(this, oe);
    g(this, q);
    p(this, "routeIndex", 0);
    p(this, "path");
    p(this, "bodyCache", {});
    g(this, U, (e2) => {
      const { bodyCache: t2, raw: r2 } = this, s = t2[e2];
      if (s) return s;
      const n = Object.keys(t2)[0];
      return n ? t2[n].then((i) => (n === "json" && (i = JSON.stringify(i)), new Response(i)[e2]())) : t2[e2] = r2[e2]();
    });
    this.raw = e, this.path = t, f(this, q, r), f(this, oe, {});
  }
  param(e) {
    return e ? E(this, L, ct).call(this, e) : E(this, L, lt).call(this);
  }
  query(e) {
    return Ht(this.url, e);
  }
  queries(e) {
    return Lt(this.url, e);
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
    return (t = this.bodyCache).parsedBody ?? (t.parsedBody = await St(this, e));
  }
  json() {
    return c(this, U).call(this, "text").then((e) => JSON.parse(e));
  }
  text() {
    return c(this, U).call(this, "text");
  }
  arrayBuffer() {
    return c(this, U).call(this, "arrayBuffer");
  }
  blob() {
    return c(this, U).call(this, "blob");
  }
  formData() {
    return c(this, U).call(this, "formData");
  }
  addValidatedData(e, t) {
    c(this, oe)[e] = t;
  }
  valid(e) {
    return c(this, oe)[e];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [Ot]() {
    return c(this, q);
  }
  get matchedRoutes() {
    return c(this, q)[0].map(([[, e]]) => e);
  }
  get routePath() {
    return c(this, q)[0].map(([[, e]]) => e)[this.routeIndex].path;
  }
}, oe = /* @__PURE__ */ new WeakMap(), q = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakSet(), ct = /* @__PURE__ */ __name(function(e) {
  const t = c(this, q)[0][this.routeIndex][1][e], r = E(this, L, Pe).call(this, t);
  return r && /\%/.test(r) ? We(r) : r;
}, "ct"), lt = /* @__PURE__ */ __name(function() {
  const e = {}, t = Object.keys(c(this, q)[0][this.routeIndex][1]);
  for (const r of t) {
    const s = E(this, L, Pe).call(this, c(this, q)[0][this.routeIndex][1][r]);
    s !== void 0 && (e[r] = /\%/.test(s) ? We(s) : s);
  }
  return e;
}, "lt"), Pe = /* @__PURE__ */ __name(function(e) {
  return c(this, q)[1] ? c(this, q)[1][e] : e;
}, "Pe"), U = /* @__PURE__ */ new WeakMap(), Ge);
var kt = { Stringify: 1 };
var ut = /* @__PURE__ */ __name(async (e, t, r, s, n) => {
  typeof e == "object" && !(e instanceof String) && (e instanceof Promise || (e = e.toString()), e instanceof Promise && (e = await e));
  const i = e.callbacks;
  return i != null && i.length ? (n ? n[0] += e : n = [e], Promise.all(i.map((l) => l({ phase: t, buffer: n, context: s }))).then((l) => Promise.all(l.filter(Boolean).map((o) => ut(o, t, false, s, n))).then(() => n[0]))) : Promise.resolve(e);
}, "ut");
var Ft = "text/plain; charset=UTF-8";
var Me = /* @__PURE__ */ __name((e, t) => ({ "Content-Type": e, ...t }), "Me");
var Ee;
var we;
var D;
var ae;
var M;
var S;
var ye;
var ce;
var le;
var Y;
var xe;
var ve;
var $;
var ne;
var Je;
var Ut = (Je = class {
  static {
    __name(this, "Je");
  }
  constructor(e, t) {
    g(this, $);
    g(this, Ee);
    g(this, we);
    p(this, "env", {});
    g(this, D);
    p(this, "finalized", false);
    p(this, "error");
    g(this, ae);
    g(this, M);
    g(this, S);
    g(this, ye);
    g(this, ce);
    g(this, le);
    g(this, Y);
    g(this, xe);
    g(this, ve);
    p(this, "render", (...e2) => (c(this, ce) ?? f(this, ce, (t2) => this.html(t2)), c(this, ce).call(this, ...e2)));
    p(this, "setLayout", (e2) => f(this, ye, e2));
    p(this, "getLayout", () => c(this, ye));
    p(this, "setRenderer", (e2) => {
      f(this, ce, e2);
    });
    p(this, "header", (e2, t2, r) => {
      this.finalized && f(this, S, new Response(c(this, S).body, c(this, S)));
      const s = c(this, S) ? c(this, S).headers : c(this, Y) ?? f(this, Y, new Headers());
      t2 === void 0 ? s.delete(e2) : r != null && r.append ? s.append(e2, t2) : s.set(e2, t2);
    });
    p(this, "status", (e2) => {
      f(this, ae, e2);
    });
    p(this, "set", (e2, t2) => {
      c(this, D) ?? f(this, D, /* @__PURE__ */ new Map()), c(this, D).set(e2, t2);
    });
    p(this, "get", (e2) => c(this, D) ? c(this, D).get(e2) : void 0);
    p(this, "newResponse", (...e2) => E(this, $, ne).call(this, ...e2));
    p(this, "body", (e2, t2, r) => E(this, $, ne).call(this, e2, t2, r));
    p(this, "text", (e2, t2, r) => !c(this, Y) && !c(this, ae) && !t2 && !r && !this.finalized ? new Response(e2) : E(this, $, ne).call(this, e2, t2, Me(Ft, r)));
    p(this, "json", (e2, t2, r) => E(this, $, ne).call(this, JSON.stringify(e2), t2, Me("application/json", r)));
    p(this, "html", (e2, t2, r) => {
      const s = /* @__PURE__ */ __name((n) => E(this, $, ne).call(this, n, t2, Me("text/html; charset=UTF-8", r)), "s");
      return typeof e2 == "object" ? ut(e2, kt.Stringify, false, {}).then(s) : s(e2);
    });
    p(this, "redirect", (e2, t2) => {
      const r = String(e2);
      return this.header("Location", /[^\x00-\xFF]/.test(r) ? encodeURI(r) : r), this.newResponse(null, t2 ?? 302);
    });
    p(this, "notFound", () => (c(this, le) ?? f(this, le, () => new Response()), c(this, le).call(this, this)));
    f(this, Ee, e), t && (f(this, M, t.executionCtx), this.env = t.env, f(this, le, t.notFoundHandler), f(this, ve, t.path), f(this, xe, t.matchResult));
  }
  get req() {
    return c(this, we) ?? f(this, we, new at(c(this, Ee), c(this, ve), c(this, xe))), c(this, we);
  }
  get event() {
    if (c(this, M) && "respondWith" in c(this, M)) return c(this, M);
    throw Error("This context has no FetchEvent");
  }
  get executionCtx() {
    if (c(this, M)) return c(this, M);
    throw Error("This context has no ExecutionContext");
  }
  get res() {
    return c(this, S) || f(this, S, new Response(null, { headers: c(this, Y) ?? f(this, Y, new Headers()) }));
  }
  set res(e) {
    if (c(this, S) && e) {
      e = new Response(e.body, e);
      for (const [t, r] of c(this, S).headers.entries()) if (t !== "content-type") if (t === "set-cookie") {
        const s = c(this, S).headers.getSetCookie();
        e.headers.delete("set-cookie");
        for (const n of s) e.headers.append("set-cookie", n);
      } else e.headers.set(t, r);
    }
    f(this, S, e), this.finalized = true;
  }
  get var() {
    return c(this, D) ? Object.fromEntries(c(this, D)) : {};
  }
}, Ee = /* @__PURE__ */ new WeakMap(), we = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap(), ae = /* @__PURE__ */ new WeakMap(), M = /* @__PURE__ */ new WeakMap(), S = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap(), ce = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakMap(), Y = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ new WeakMap(), ve = /* @__PURE__ */ new WeakMap(), $ = /* @__PURE__ */ new WeakSet(), ne = /* @__PURE__ */ __name(function(e, t, r) {
  const s = c(this, S) ? new Headers(c(this, S).headers) : c(this, Y) ?? new Headers();
  if (typeof t == "object" && "headers" in t) {
    const i = t.headers instanceof Headers ? t.headers : new Headers(t.headers);
    for (const [a, l] of i) a.toLowerCase() === "set-cookie" ? s.append(a, l) : s.set(a, l);
  }
  if (r) for (const [i, a] of Object.entries(r)) if (typeof a == "string") s.set(i, a);
  else {
    s.delete(i);
    for (const l of a) s.append(i, l);
  }
  const n = typeof t == "number" ? t : (t == null ? void 0 : t.status) ?? c(this, ae);
  return new Response(e, { status: n, headers: s });
}, "ne"), Je);
var v = "ALL";
var $t = "all";
var Wt = ["get", "post", "put", "delete", "options", "patch"];
var dt = "Can not add a route since the matcher is already built.";
var ht = class extends Error {
  static {
    __name(this, "ht");
  }
};
var Bt = "__COMPOSED_HANDLER";
var zt = /* @__PURE__ */ __name((e) => e.text("404 Not Found", 404), "zt");
var Be = /* @__PURE__ */ __name((e, t) => {
  if ("getResponse" in e) {
    const r = e.getResponse();
    return t.newResponse(r.body, r);
  }
  return console.error(e), t.text("Internal Server Error", 500);
}, "Be");
var j;
var _;
var pt;
var A;
var G;
var Re;
var Oe;
var Ye;
var ft = (Ye = class {
  static {
    __name(this, "Ye");
  }
  constructor(t = {}) {
    g(this, _);
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
    g(this, j, "/");
    p(this, "routes", []);
    g(this, A, zt);
    p(this, "errorHandler", Be);
    p(this, "onError", (t2) => (this.errorHandler = t2, this));
    p(this, "notFound", (t2) => (f(this, A, t2), this));
    p(this, "fetch", (t2, ...r) => E(this, _, Oe).call(this, t2, r[1], r[0], t2.method));
    p(this, "request", (t2, r, s2, n2) => t2 instanceof Request ? this.fetch(r ? new Request(t2, r) : t2, s2, n2) : (t2 = t2.toString(), this.fetch(new Request(/^https?:\/\//.test(t2) ? t2 : `http://localhost${se("/", t2)}`, r), s2, n2)));
    p(this, "fire", () => {
      addEventListener("fetch", (t2) => {
        t2.respondWith(E(this, _, Oe).call(this, t2.request, t2, void 0, t2.request.method));
      });
    });
    [...Wt, $t].forEach((i) => {
      this[i] = (a, ...l) => (typeof a == "string" ? f(this, j, a) : E(this, _, G).call(this, i, c(this, j), a), l.forEach((o) => {
        E(this, _, G).call(this, i, c(this, j), o);
      }), this);
    }), this.on = (i, a, ...l) => {
      for (const o of [a].flat()) {
        f(this, j, o);
        for (const u of [i].flat()) l.map((d) => {
          E(this, _, G).call(this, u.toUpperCase(), c(this, j), d);
        });
      }
      return this;
    }, this.use = (i, ...a) => (typeof i == "string" ? f(this, j, i) : (f(this, j, "*"), a.unshift(i)), a.forEach((l) => {
      E(this, _, G).call(this, v, c(this, j), l);
    }), this);
    const { strict: s, ...n } = t;
    Object.assign(this, n), this.getPath = s ?? true ? t.getPath ?? st : Pt;
  }
  route(t, r) {
    const s = this.basePath(t);
    return r.routes.map((n) => {
      var a;
      let i;
      r.errorHandler === Be ? i = n.handler : (i = /* @__PURE__ */ __name(async (l, o) => (await $e([], r.errorHandler)(l, () => n.handler(l, o))).res, "i"), i[Bt] = n.handler), E(a = s, _, G).call(a, n.method, n.path, i);
    }), this;
  }
  basePath(t) {
    const r = E(this, _, pt).call(this);
    return r._basePath = se(this._basePath, t), r;
  }
  mount(t, r, s) {
    let n, i;
    s && (typeof s == "function" ? i = s : (i = s.optionHandler, s.replaceRequest === false ? n = /* @__PURE__ */ __name((o) => o, "n") : n = s.replaceRequest));
    const a = i ? (o) => {
      const u = i(o);
      return Array.isArray(u) ? u : [u];
    } : (o) => {
      let u;
      try {
        u = o.executionCtx;
      } catch {
      }
      return [o.env, u];
    };
    n || (n = (() => {
      const o = se(this._basePath, t), u = o === "/" ? 0 : o.length;
      return (d) => {
        const h = new URL(d.url);
        return h.pathname = h.pathname.slice(u) || "/", new Request(h, d);
      };
    })());
    const l = /* @__PURE__ */ __name(async (o, u) => {
      const d = await r(n(o.req.raw), ...a(o));
      if (d) return d;
      await u();
    }, "l");
    return E(this, _, G).call(this, v, se(t, "*"), l), this;
  }
}, j = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new WeakSet(), pt = /* @__PURE__ */ __name(function() {
  const t = new ft({ router: this.router, getPath: this.getPath });
  return t.errorHandler = this.errorHandler, f(t, A, c(this, A)), t.routes = this.routes, t;
}, "pt"), A = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ __name(function(t, r, s) {
  t = t.toUpperCase(), r = se(this._basePath, r);
  const n = { basePath: this._basePath, path: r, method: t, handler: s };
  this.router.add(t, r, [s, n]), this.routes.push(n);
}, "G"), Re = /* @__PURE__ */ __name(function(t, r) {
  if (t instanceof Error) return this.errorHandler(t, r);
  throw t;
}, "Re"), Oe = /* @__PURE__ */ __name(function(t, r, s, n) {
  if (n === "HEAD") return (async () => new Response(null, await E(this, _, Oe).call(this, t, r, s, "GET")))();
  const i = this.getPath(t, { env: s }), a = this.router.match(n, i), l = new Ut(t, { path: i, matchResult: a, env: s, executionCtx: r, notFoundHandler: c(this, A) });
  if (a[0].length === 1) {
    let u;
    try {
      u = a[0][0][0][0](l, async () => {
        l.res = await c(this, A).call(this, l);
      });
    } catch (d) {
      return E(this, _, Re).call(this, d, l);
    }
    return u instanceof Promise ? u.then((d) => d || (l.finalized ? l.res : c(this, A).call(this, l))).catch((d) => E(this, _, Re).call(this, d, l)) : u ?? c(this, A).call(this, l);
  }
  const o = $e(a[0], this.errorHandler, c(this, A));
  return (async () => {
    try {
      const u = await o(l);
      if (!u.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
      return u.res;
    } catch (u) {
      return E(this, _, Re).call(this, u, l);
    }
  })();
}, "Oe"), Ye);
var Te = "[^/]+";
var me = ".*";
var ge = "(?:|/.*)";
var ie = Symbol();
var Vt = new Set(".\\+*[^]$()");
function Gt(e, t) {
  return e.length === 1 ? t.length === 1 ? e < t ? -1 : 1 : -1 : t.length === 1 || e === me || e === ge ? 1 : t === me || t === ge ? -1 : e === Te ? 1 : t === Te ? -1 : e.length === t.length ? e < t ? -1 : 1 : t.length - e.length;
}
__name(Gt, "Gt");
var K;
var Q;
var C;
var Ke;
var He = (Ke = class {
  static {
    __name(this, "Ke");
  }
  constructor() {
    g(this, K);
    g(this, Q);
    g(this, C, /* @__PURE__ */ Object.create(null));
  }
  insert(t, r, s, n, i) {
    if (t.length === 0) {
      if (c(this, K) !== void 0) throw ie;
      if (i) return;
      f(this, K, r);
      return;
    }
    const [a, ...l] = t, o = a === "*" ? l.length === 0 ? ["", "", me] : ["", "", Te] : a === "/*" ? ["", "", ge] : a.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let u;
    if (o) {
      const d = o[1];
      let h = o[2] || Te;
      if (d && o[2] && (h === ".*" || (h = h.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:"), /\((?!\?:)/.test(h)))) throw ie;
      if (u = c(this, C)[h], !u) {
        if (Object.keys(c(this, C)).some((m) => m !== me && m !== ge)) throw ie;
        if (i) return;
        u = c(this, C)[h] = new He(), d !== "" && f(u, Q, n.varIndex++);
      }
      !i && d !== "" && s.push([d, c(u, Q)]);
    } else if (u = c(this, C)[a], !u) {
      if (Object.keys(c(this, C)).some((d) => d.length > 1 && d !== me && d !== ge)) throw ie;
      if (i) return;
      u = c(this, C)[a] = new He();
    }
    u.insert(l, r, s, n, i);
  }
  buildRegExpStr() {
    const r = Object.keys(c(this, C)).sort(Gt).map((s) => {
      const n = c(this, C)[s];
      return (typeof c(n, Q) == "number" ? `(${s})@${c(n, Q)}` : Vt.has(s) ? `\\${s}` : s) + n.buildRegExpStr();
    });
    return typeof c(this, K) == "number" && r.unshift(`#${c(this, K)}`), r.length === 0 ? "" : r.length === 1 ? r[0] : "(?:" + r.join("|") + ")";
  }
}, K = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), C = /* @__PURE__ */ new WeakMap(), Ke);
var qe;
var _e;
var Qe;
var Jt = (Qe = class {
  static {
    __name(this, "Qe");
  }
  constructor() {
    g(this, qe, { varIndex: 0 });
    g(this, _e, new He());
  }
  insert(e, t, r) {
    const s = [], n = [];
    for (let a = 0; ; ) {
      let l = false;
      if (e = e.replace(/\{[^}]+\}/g, (o) => {
        const u = `@\\${a}`;
        return n[a] = [u, o], a++, l = true, u;
      }), !l) break;
    }
    const i = e.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let a = n.length - 1; a >= 0; a--) {
      const [l] = n[a];
      for (let o = i.length - 1; o >= 0; o--) if (i[o].indexOf(l) !== -1) {
        i[o] = i[o].replace(l, n[a][1]);
        break;
      }
    }
    return c(this, _e).insert(i, t, s, c(this, qe), r), s;
  }
  buildRegExp() {
    let e = c(this, _e).buildRegExpStr();
    if (e === "") return [/^$/, [], []];
    let t = 0;
    const r = [], s = [];
    return e = e.replace(/#(\d+)|@(\d+)|\.\*\$/g, (n, i, a) => i !== void 0 ? (r[++t] = Number(i), "$()") : (a !== void 0 && (s[Number(a)] = ++t), "")), [new RegExp(`^${e}`), r, s];
  }
}, qe = /* @__PURE__ */ new WeakMap(), _e = /* @__PURE__ */ new WeakMap(), Qe);
var mt = [];
var Yt = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var Se = /* @__PURE__ */ Object.create(null);
function gt(e) {
  return Se[e] ?? (Se[e] = new RegExp(e === "*" ? "" : `^${e.replace(/\/\*$|([.\\+*[^\]$()])/g, (t, r) => r ? `\\${r}` : "(?:|/.*)")}$`));
}
__name(gt, "gt");
function Kt() {
  Se = /* @__PURE__ */ Object.create(null);
}
__name(Kt, "Kt");
function Qt(e) {
  var u;
  const t = new Jt(), r = [];
  if (e.length === 0) return Yt;
  const s = e.map((d) => [!/\*|\/:/.test(d[0]), ...d]).sort(([d, h], [m, x]) => d ? 1 : m ? -1 : h.length - x.length), n = /* @__PURE__ */ Object.create(null);
  for (let d = 0, h = -1, m = s.length; d < m; d++) {
    const [x, T, w] = s[d];
    x ? n[T] = [w.map(([O]) => [O, /* @__PURE__ */ Object.create(null)]), mt] : h++;
    let y;
    try {
      y = t.insert(T, h, x);
    } catch (O) {
      throw O === ie ? new ht(T) : O;
    }
    x || (r[h] = w.map(([O, te]) => {
      const he = /* @__PURE__ */ Object.create(null);
      for (te -= 1; te >= 0; te--) {
        const [I, Ce] = y[te];
        he[I] = Ce;
      }
      return [O, he];
    }));
  }
  const [i, a, l] = t.buildRegExp();
  for (let d = 0, h = r.length; d < h; d++) for (let m = 0, x = r[d].length; m < x; m++) {
    const T = (u = r[d][m]) == null ? void 0 : u[1];
    if (!T) continue;
    const w = Object.keys(T);
    for (let y = 0, O = w.length; y < O; y++) T[w[y]] = l[T[w[y]]];
  }
  const o = [];
  for (const d in a) o[d] = r[a[d]];
  return [i, o, n];
}
__name(Qt, "Qt");
function re(e, t) {
  if (e) {
    for (const r of Object.keys(e).sort((s, n) => n.length - s.length)) if (gt(r).test(t)) return [...e[r]];
  }
}
__name(re, "re");
var W;
var B;
var de;
var Et;
var wt;
var Xe;
var Xt = (Xe = class {
  static {
    __name(this, "Xe");
  }
  constructor() {
    g(this, de);
    p(this, "name", "RegExpRouter");
    g(this, W);
    g(this, B);
    f(this, W, { [v]: /* @__PURE__ */ Object.create(null) }), f(this, B, { [v]: /* @__PURE__ */ Object.create(null) });
  }
  add(e, t, r) {
    var l;
    const s = c(this, W), n = c(this, B);
    if (!s || !n) throw new Error(dt);
    s[e] || [s, n].forEach((o) => {
      o[e] = /* @__PURE__ */ Object.create(null), Object.keys(o[v]).forEach((u) => {
        o[e][u] = [...o[v][u]];
      });
    }), t === "/*" && (t = "*");
    const i = (t.match(/\/:/g) || []).length;
    if (/\*$/.test(t)) {
      const o = gt(t);
      e === v ? Object.keys(s).forEach((u) => {
        var d;
        (d = s[u])[t] || (d[t] = re(s[u], t) || re(s[v], t) || []);
      }) : (l = s[e])[t] || (l[t] = re(s[e], t) || re(s[v], t) || []), Object.keys(s).forEach((u) => {
        (e === v || e === u) && Object.keys(s[u]).forEach((d) => {
          o.test(d) && s[u][d].push([r, i]);
        });
      }), Object.keys(n).forEach((u) => {
        (e === v || e === u) && Object.keys(n[u]).forEach((d) => o.test(d) && n[u][d].push([r, i]));
      });
      return;
    }
    const a = nt(t) || [t];
    for (let o = 0, u = a.length; o < u; o++) {
      const d = a[o];
      Object.keys(n).forEach((h) => {
        var m;
        (e === v || e === h) && ((m = n[h])[d] || (m[d] = [...re(s[h], d) || re(s[v], d) || []]), n[h][d].push([r, i - u + o + 1]));
      });
    }
  }
  match(e, t) {
    Kt();
    const r = E(this, de, Et).call(this);
    return this.match = (s, n) => {
      const i = r[s] || r[v], a = i[2][n];
      if (a) return a;
      const l = n.match(i[0]);
      if (!l) return [[], mt];
      const o = l.indexOf("", 1);
      return [i[1][o], l];
    }, this.match(e, t);
  }
}, W = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap(), de = /* @__PURE__ */ new WeakSet(), Et = /* @__PURE__ */ __name(function() {
  const e = /* @__PURE__ */ Object.create(null);
  return Object.keys(c(this, B)).concat(Object.keys(c(this, W))).forEach((t) => {
    e[t] || (e[t] = E(this, de, wt).call(this, t));
  }), f(this, W, f(this, B, void 0)), e;
}, "Et"), wt = /* @__PURE__ */ __name(function(e) {
  const t = [];
  let r = e === v;
  return [c(this, W), c(this, B)].forEach((s) => {
    const n = s[e] ? Object.keys(s[e]).map((i) => [i, s[e][i]]) : [];
    n.length !== 0 ? (r || (r = true), t.push(...n)) : e !== v && t.push(...Object.keys(s[v]).map((i) => [i, s[v][i]]));
  }), r ? Qt(t) : null;
}, "wt"), Xe);
var z;
var P;
var Ze;
var Zt = (Ze = class {
  static {
    __name(this, "Ze");
  }
  constructor(e) {
    p(this, "name", "SmartRouter");
    g(this, z, []);
    g(this, P, []);
    f(this, z, e.routers);
  }
  add(e, t, r) {
    if (!c(this, P)) throw new Error(dt);
    c(this, P).push([e, t, r]);
  }
  match(e, t) {
    if (!c(this, P)) throw new Error("Fatal error");
    const r = c(this, z), s = c(this, P), n = r.length;
    let i = 0, a;
    for (; i < n; i++) {
      const l = r[i];
      try {
        for (let o = 0, u = s.length; o < u; o++) l.add(...s[o]);
        a = l.match(e, t);
      } catch (o) {
        if (o instanceof ht) continue;
        throw o;
      }
      this.match = l.match.bind(l), f(this, z, [l]), f(this, P, void 0);
      break;
    }
    if (i === n) throw new Error("Fatal error");
    return this.name = `SmartRouter + ${this.activeRouter.name}`, a;
  }
  get activeRouter() {
    if (c(this, P) || c(this, z).length !== 1) throw new Error("No active router has been determined yet.");
    return c(this, z)[0];
  }
}, z = /* @__PURE__ */ new WeakMap(), P = /* @__PURE__ */ new WeakMap(), Ze);
var pe = /* @__PURE__ */ Object.create(null);
var V;
var R;
var X;
var ue;
var b;
var H;
var J;
var et;
var yt = (et = class {
  static {
    __name(this, "et");
  }
  constructor(e, t, r) {
    g(this, H);
    g(this, V);
    g(this, R);
    g(this, X);
    g(this, ue, 0);
    g(this, b, pe);
    if (f(this, R, r || /* @__PURE__ */ Object.create(null)), f(this, V, []), e && t) {
      const s = /* @__PURE__ */ Object.create(null);
      s[e] = { handler: t, possibleKeys: [], score: 0 }, f(this, V, [s]);
    }
    f(this, X, []);
  }
  insert(e, t, r) {
    f(this, ue, ++Ue(this, ue)._);
    let s = this;
    const n = Ct(t), i = [];
    for (let a = 0, l = n.length; a < l; a++) {
      const o = n[a], u = n[a + 1], d = Dt(o, u), h = Array.isArray(d) ? d[0] : o;
      if (h in c(s, R)) {
        s = c(s, R)[h], d && i.push(d[1]);
        continue;
      }
      c(s, R)[h] = new yt(), d && (c(s, X).push(d), i.push(d[1])), s = c(s, R)[h];
    }
    return c(s, V).push({ [e]: { handler: r, possibleKeys: i.filter((a, l, o) => o.indexOf(a) === l), score: c(this, ue) } }), s;
  }
  search(e, t) {
    var l;
    const r = [];
    f(this, b, pe);
    let n = [this];
    const i = rt(t), a = [];
    for (let o = 0, u = i.length; o < u; o++) {
      const d = i[o], h = o === u - 1, m = [];
      for (let x = 0, T = n.length; x < T; x++) {
        const w = n[x], y = c(w, R)[d];
        y && (f(y, b, c(w, b)), h ? (c(y, R)["*"] && r.push(...E(this, H, J).call(this, c(y, R)["*"], e, c(w, b))), r.push(...E(this, H, J).call(this, y, e, c(w, b)))) : m.push(y));
        for (let O = 0, te = c(w, X).length; O < te; O++) {
          const he = c(w, X)[O], I = c(w, b) === pe ? {} : { ...c(w, b) };
          if (he === "*") {
            const F = c(w, R)["*"];
            F && (r.push(...E(this, H, J).call(this, F, e, c(w, b))), f(F, b, I), m.push(F));
            continue;
          }
          const [Ce, ke, fe] = he;
          if (!d && !(fe instanceof RegExp)) continue;
          const N = c(w, R)[Ce], _t = i.slice(o).join("/");
          if (fe instanceof RegExp) {
            const F = fe.exec(_t);
            if (F) {
              if (I[ke] = F[0], r.push(...E(this, H, J).call(this, N, e, c(w, b), I)), Object.keys(c(N, R)).length) {
                f(N, b, I);
                const Ie = ((l = F[0].match(/\//)) == null ? void 0 : l.length) ?? 0;
                (a[Ie] || (a[Ie] = [])).push(N);
              }
              continue;
            }
          }
          (fe === true || fe.test(d)) && (I[ke] = d, h ? (r.push(...E(this, H, J).call(this, N, e, I, c(w, b))), c(N, R)["*"] && r.push(...E(this, H, J).call(this, c(N, R)["*"], e, I, c(w, b)))) : (f(N, b, I), m.push(N)));
        }
      }
      n = m.concat(a.shift() ?? []);
    }
    return r.length > 1 && r.sort((o, u) => o.score - u.score), [r.map(({ handler: o, params: u }) => [o, u])];
  }
}, V = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakMap(), ue = /* @__PURE__ */ new WeakMap(), b = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakSet(), J = /* @__PURE__ */ __name(function(e, t, r, s) {
  const n = [];
  for (let i = 0, a = c(e, V).length; i < a; i++) {
    const l = c(e, V)[i], o = l[t] || l[v], u = {};
    if (o !== void 0 && (o.params = /* @__PURE__ */ Object.create(null), n.push(o), r !== pe || s && s !== pe)) for (let d = 0, h = o.possibleKeys.length; d < h; d++) {
      const m = o.possibleKeys[d], x = u[o.score];
      o.params[m] = s != null && s[m] && !x ? s[m] : r[m] ?? (s == null ? void 0 : s[m]), u[o.score] = true;
    }
  }
  return n;
}, "J"), et);
var Z;
var tt;
var er = (tt = class {
  static {
    __name(this, "tt");
  }
  constructor() {
    p(this, "name", "TrieRouter");
    g(this, Z);
    f(this, Z, new yt());
  }
  add(e, t, r) {
    const s = nt(t);
    if (s) {
      for (let n = 0, i = s.length; n < i; n++) c(this, Z).insert(e, s[n], r);
      return;
    }
    c(this, Z).insert(e, t, r);
  }
  match(e, t) {
    return c(this, Z).search(e, t);
  }
}, Z = /* @__PURE__ */ new WeakMap(), tt);
var je = class extends ft {
  static {
    __name(this, "je");
  }
  constructor(e = {}) {
    super(e), this.router = e.router ?? new Zt({ routers: [new Xt(), new er()] });
  }
};
var tr = /* @__PURE__ */ __name((e) => {
  const r = { ...{ origin: "*", allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"], allowHeaders: [], exposeHeaders: [] }, ...e }, s = /* @__PURE__ */ ((i) => typeof i == "string" ? i === "*" ? () => i : (a) => i === a ? a : null : typeof i == "function" ? i : (a) => i.includes(a) ? a : null)(r.origin), n = ((i) => typeof i == "function" ? i : Array.isArray(i) ? () => i : () => [])(r.allowMethods);
  return async function(a, l) {
    var d;
    function o(h, m) {
      a.res.headers.set(h, m);
    }
    __name(o, "o");
    const u = await s(a.req.header("origin") || "", a);
    if (u && o("Access-Control-Allow-Origin", u), r.origin !== "*") {
      const h = a.req.header("Vary");
      h ? o("Vary", h) : o("Vary", "Origin");
    }
    if (r.credentials && o("Access-Control-Allow-Credentials", "true"), (d = r.exposeHeaders) != null && d.length && o("Access-Control-Expose-Headers", r.exposeHeaders.join(",")), a.req.method === "OPTIONS") {
      r.maxAge != null && o("Access-Control-Max-Age", r.maxAge.toString());
      const h = await n(a.req.header("origin") || "", a);
      h.length && o("Access-Control-Allow-Methods", h.join(","));
      let m = r.allowHeaders;
      if (!(m != null && m.length)) {
        const x = a.req.header("Access-Control-Request-Headers");
        x && (m = x.split(/\s*,\s*/));
      }
      return m != null && m.length && (o("Access-Control-Allow-Headers", m.join(",")), a.res.headers.append("Vary", "Access-Control-Request-Headers")), a.res.headers.delete("Content-Length"), a.res.headers.delete("Content-Type"), new Response(null, { headers: a.res.headers, status: 204, statusText: "No Content" });
    }
    await l();
  };
}, "tr");
var rr = /^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
var ze = /* @__PURE__ */ __name((e, t = nr) => {
  const r = /\.([a-zA-Z0-9]+?)$/, s = e.match(r);
  if (!s) return;
  let n = t[s[1]];
  return n && n.startsWith("text") && (n += "; charset=utf-8"), n;
}, "ze");
var sr = { aac: "audio/aac", avi: "video/x-msvideo", avif: "image/avif", av1: "video/av1", bin: "application/octet-stream", bmp: "image/bmp", css: "text/css", csv: "text/csv", eot: "application/vnd.ms-fontobject", epub: "application/epub+zip", gif: "image/gif", gz: "application/gzip", htm: "text/html", html: "text/html", ico: "image/x-icon", ics: "text/calendar", jpeg: "image/jpeg", jpg: "image/jpeg", js: "text/javascript", json: "application/json", jsonld: "application/ld+json", map: "application/json", mid: "audio/x-midi", midi: "audio/x-midi", mjs: "text/javascript", mp3: "audio/mpeg", mp4: "video/mp4", mpeg: "video/mpeg", oga: "audio/ogg", ogv: "video/ogg", ogx: "application/ogg", opus: "audio/opus", otf: "font/otf", pdf: "application/pdf", png: "image/png", rtf: "application/rtf", svg: "image/svg+xml", tif: "image/tiff", tiff: "image/tiff", ts: "video/mp2t", ttf: "font/ttf", txt: "text/plain", wasm: "application/wasm", webm: "video/webm", weba: "audio/webm", webmanifest: "application/manifest+json", webp: "image/webp", woff: "font/woff", woff2: "font/woff2", xhtml: "application/xhtml+xml", xml: "application/xml", zip: "application/zip", "3gp": "video/3gpp", "3g2": "video/3gpp2", gltf: "model/gltf+json", glb: "model/gltf-binary" };
var nr = sr;
var ir = /* @__PURE__ */ __name((...e) => {
  let t = e.filter((n) => n !== "").join("/");
  t = t.replace(new RegExp("(?<=\\/)\\/+", "g"), "");
  const r = t.split("/"), s = [];
  for (const n of r) n === ".." && s.length > 0 && s.at(-1) !== ".." ? s.pop() : n !== "." && s.push(n);
  return s.join("/") || ".";
}, "ir");
var xt = { br: ".br", zstd: ".zst", gzip: ".gz" };
var or = Object.keys(xt);
var ar = "index.html";
var cr = /* @__PURE__ */ __name((e) => {
  const t = e.root ?? "./", r = e.path, s = e.join ?? ir;
  return async (n, i) => {
    var d, h, m, x;
    if (n.finalized) return i();
    let a;
    if (e.path) a = e.path;
    else try {
      if (a = decodeURIComponent(n.req.path), /(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(a)) throw new Error();
    } catch {
      return await ((d = e.onNotFound) == null ? void 0 : d.call(e, n.req.path, n)), i();
    }
    let l = s(t, !r && e.rewriteRequestPath ? e.rewriteRequestPath(a) : a);
    e.isDir && await e.isDir(l) && (l = s(l, ar));
    const o = e.getContent;
    let u = await o(l, n);
    if (u instanceof Response) return n.newResponse(u.body, u);
    if (u) {
      const T = e.mimes && ze(l, e.mimes) || ze(l);
      if (n.header("Content-Type", T || "application/octet-stream"), e.precompressed && (!T || rr.test(T))) {
        const w = new Set((h = n.req.header("Accept-Encoding")) == null ? void 0 : h.split(",").map((y) => y.trim()));
        for (const y of or) {
          if (!w.has(y)) continue;
          const O = await o(l + xt[y], n);
          if (O) {
            u = O, n.header("Content-Encoding", y), n.header("Vary", "Accept-Encoding", { append: true });
            break;
          }
        }
      }
      return await ((m = e.onFound) == null ? void 0 : m.call(e, l, n)), n.body(u);
    }
    await ((x = e.onNotFound) == null ? void 0 : x.call(e, l, n)), await i();
  };
}, "cr");
var lr = /* @__PURE__ */ __name(async (e, t) => {
  let r;
  t && t.manifest ? typeof t.manifest == "string" ? r = JSON.parse(t.manifest) : r = t.manifest : typeof __STATIC_CONTENT_MANIFEST == "string" ? r = JSON.parse(__STATIC_CONTENT_MANIFEST) : r = __STATIC_CONTENT_MANIFEST;
  let s;
  t && t.namespace ? s = t.namespace : s = __STATIC_CONTENT;
  const n = r[e] || e;
  if (!n) return null;
  const i = await s.get(n, { type: "stream" });
  return i || null;
}, "lr");
var ur = /* @__PURE__ */ __name((e) => async function(r, s) {
  return cr({ ...e, getContent: /* @__PURE__ */ __name(async (i) => lr(i, { manifest: e.manifest, namespace: e.namespace ? e.namespace : r.env ? r.env.__STATIC_CONTENT : void 0 }), "getContent") })(r, s);
}, "ur");
var dr = /* @__PURE__ */ __name((e) => ur(e), "dr");
var ee = new je();
ee.get("/questions/category/:category", async (e) => {
  try {
    const t = e.req.param("category"), r = parseInt(e.req.query("limit") || "10"), s = parseInt(e.req.query("offset") || "0"), i = await e.env.DB.prepare(`
      SELECT id, subject, category, difficulty, question_text, 
             options, correct_answer, explanation, learning_points, tips
      FROM questions 
      WHERE subject = ? OR category = ?
      LIMIT ? OFFSET ?
    `).bind(t, t, r, s).all();
    return e.json({ success: true, category: t, questions: i.results, total: i.results.length });
  } catch (t) {
    return console.error("Error fetching questions:", t), e.json({ error: "\u554F\u984C\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
ee.get("/questions/:id", async (e) => {
  try {
    const t = e.req.param("id"), s = await e.env.DB.prepare(`
      SELECT * FROM questions WHERE id = ?
    `).bind(t).first();
    return s ? (s.options = JSON.parse(s.options), s.learning_points = JSON.parse(s.learning_points), e.json({ success: true, question: s })) : e.json({ error: "\u554F\u984C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" }, 404);
  } catch (t) {
    return console.error("Error fetching question:", t), e.json({ error: "\u554F\u984C\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
ee.post("/answer", async (e) => {
  try {
    const { userId: t, questionId: r, selectedAnswer: s, timeSpent: n } = await e.req.json();
    if (!t || !r || s === void 0) return e.json({ error: "\u5FC5\u8981\u306A\u30D1\u30E9\u30E1\u30FC\u30BF\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059" }, 400);
    const i = e.env.DB, a = await i.prepare(`
      SELECT correct_answer FROM questions WHERE id = ?
    `).bind(r).first();
    if (!a) return e.json({ error: "\u554F\u984C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" }, 404);
    const l = s === a.correct_answer;
    await i.prepare(`
      INSERT INTO study_history (user_id, question_id, selected_answer, is_correct, time_spent)
      VALUES (?, ?, ?, ?, ?)
    `).bind(t, r, s, l ? 1 : 0, n || 0).run(), l || await i.prepare(`
        INSERT INTO weak_questions (user_id, question_id, incorrect_count)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, question_id) 
        DO UPDATE SET 
          incorrect_count = incorrect_count + 1,
          last_attempted_at = CURRENT_TIMESTAMP
      `).bind(t, r).run();
    const o = await i.prepare(`
      SELECT subject FROM questions WHERE id = ?
    `).bind(r).first();
    return o && await i.prepare(`
        INSERT INTO study_progress (user_id, category, total_questions, correct_answers, incorrect_answers)
        VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(user_id, category)
        DO UPDATE SET
          total_questions = total_questions + 1,
          correct_answers = correct_answers + ?,
          incorrect_answers = incorrect_answers + ?,
          last_studied_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `).bind(t, o.subject, l ? 1 : 0, l ? 0 : 1, l ? 1 : 0, l ? 0 : 1).run(), e.json({ success: true, isCorrect: l, correctAnswer: a.correct_answer, message: l ? "\u6B63\u89E3\u3067\u3059\uFF01" : "\u4E0D\u6B63\u89E3\u3067\u3059\u3002\u5FA9\u7FD2\u3057\u307E\u3057\u3087\u3046\u3002" });
  } catch (t) {
    return console.error("Error submitting answer:", t), e.json({ error: "\u56DE\u7B54\u306E\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
ee.post("/mock-exam/start", async (e) => {
  try {
    const { userId: t, examType: r = "full" } = await e.req.json();
    if (!t) return e.json({ error: "\u30E6\u30FC\u30B6\u30FCID\u304C\u5FC5\u8981\u3067\u3059" }, 400);
    const s = e.env.DB, n = r === "full" ? 50 : r === "mini" ? 25 : 10, i = await s.prepare(`
      SELECT id, subject, category, difficulty, question_text, 
             options, correct_answer, estimated_time
      FROM questions
      ORDER BY RANDOM()
      LIMIT ?
    `).bind(n).all(), a = i.results.map((u) => u.id), l = await s.prepare(`
      INSERT INTO mock_exam_sessions 
      (user_id, exam_type, total_questions, correct_answers, time_spent, score, questions_data, started_at)
      VALUES (?, ?, ?, 0, 0, 0, ?, CURRENT_TIMESTAMP)
    `).bind(t, r, n, JSON.stringify(a)).run(), o = i.results.map((u) => ({ ...u, options: JSON.parse(u.options) }));
    return e.json({ success: true, sessionId: l.meta.last_row_id, examType: r, questions: o, timeLimit: r === "full" ? 7200 : r === "mini" ? 3600 : 1800 });
  } catch (t) {
    return console.error("Error starting mock exam:", t), e.json({ error: "\u6A21\u64EC\u8A66\u9A13\u306E\u958B\u59CB\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
ee.post("/mock-exam/submit", async (e) => {
  try {
    const { sessionId: t, answers: r, timeSpent: s } = await e.req.json();
    if (!t || !r) return e.json({ error: "\u5FC5\u8981\u306A\u30D1\u30E9\u30E1\u30FC\u30BF\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059" }, 400);
    const n = e.env.DB, i = await n.prepare(`
      SELECT * FROM mock_exam_sessions WHERE id = ?
    `).bind(t).first();
    if (!i) return e.json({ error: "\u30BB\u30C3\u30B7\u30E7\u30F3\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" }, 404);
    let a = 0;
    const l = JSON.parse(i.questions_data);
    for (const [u, d] of Object.entries(r)) {
      const h = await n.prepare(`
        SELECT correct_answer FROM questions WHERE id = ?
      `).bind(u).first();
      h && h.correct_answer === d && a++;
    }
    const o = a / i.total_questions * 100;
    return await n.prepare(`
      UPDATE mock_exam_sessions 
      SET correct_answers = ?, time_spent = ?, score = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(a, s, o, t).run(), await n.prepare(`
      INSERT INTO mock_exam_results (user_id, score, total_questions, time_taken_seconds, exam_date)
      VALUES ((SELECT user_id FROM mock_exam_sessions WHERE id = ?), ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(t, Math.round(o), i.total_questions, s).run(), e.json({ success: true, result: { totalQuestions: i.total_questions, correctAnswers: a, incorrectAnswers: i.total_questions - a, score: Math.round(o), timeSpent: s, passed: o >= 70 } });
  } catch (t) {
    return console.error("Error submitting mock exam:", t), e.json({ error: "\u6A21\u64EC\u8A66\u9A13\u306E\u63D0\u51FA\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
ee.get("/statistics/:userId", async (e) => {
  try {
    const t = e.req.param("userId"), r = e.env.DB, s = await r.prepare(`
      SELECT category, total_questions, correct_answers, incorrect_answers,
             ROUND(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100, 1) as accuracy_rate
      FROM study_progress
      WHERE user_id = ?
      ORDER BY category
    `).bind(t).all(), n = await r.prepare(`
      SELECT score, total_questions, time_taken_seconds, exam_date
      FROM mock_exam_results
      WHERE user_id = ?
      ORDER BY exam_date DESC
      LIMIT 10
    `).bind(t).all(), i = await r.prepare(`
      SELECT wq.question_id, wq.incorrect_count, q.category, q.question_text
      FROM weak_questions wq
      JOIN questions q ON wq.question_id = q.id
      WHERE wq.user_id = ?
      ORDER BY wq.incorrect_count DESC
      LIMIT 10
    `).bind(t).all(), a = await r.prepare(`
      SELECT 
        SUM(total_questions) as total_studied,
        SUM(correct_answers) as total_correct,
        ROUND(AVG(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100), 1) as overall_accuracy
      FROM study_progress
      WHERE user_id = ?
    `).bind(t).first();
    return e.json({ success: true, statistics: { overall: a, categoryProgress: s.results, mockExamHistory: n.results, weakAreas: i.results } });
  } catch (t) {
    return console.error("Error fetching statistics:", t), e.json({ error: "\u7D71\u8A08\u60C5\u5831\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
var Ae = new je();
Ae.post("/analyze/weakness", async (e) => {
  try {
    const { userId: t } = await e.req.json();
    if (!t) return e.json({ error: "\u30E6\u30FC\u30B6\u30FCID\u304C\u5FC5\u8981\u3067\u3059" }, 400);
    const r = e.env.DB, s = await r.prepare(`
      SELECT 
        q.category,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN sh.is_correct = 0 THEN 1 ELSE 0 END) as incorrect_count,
        ROUND(SUM(CASE WHEN sh.is_correct = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as error_rate
      FROM study_history sh
      JOIN questions q ON sh.question_id = q.id
      WHERE sh.user_id = ?
      GROUP BY q.category
      HAVING error_rate > 30
      ORDER BY error_rate DESC
      LIMIT 5
    `).bind(t).all(), n = await r.prepare(`
      SELECT 
        q.category,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
        ROUND(SUM(CASE WHEN sh.is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as accuracy_rate
      FROM study_history sh
      JOIN questions q ON sh.question_id = q.id
      WHERE sh.user_id = ?
      GROUP BY q.category
      HAVING accuracy_rate > 70
      ORDER BY accuracy_rate DESC
      LIMIT 5
    `).bind(t).all(), i = s.results.map((d) => ({ category: d.category, priority: d.error_rate > 50 ? "high" : "medium", reason: `\u6B63\u7B54\u7387\u304C${100 - d.error_rate}%\u3068\u4F4E\u3044\u305F\u3081\u3001\u91CD\u70B9\u7684\u306A\u5FA9\u7FD2\u304C\u5FC5\u8981\u3067\u3059` })), a = await r.prepare(`
      SELECT 
        AVG(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as avg_accuracy
      FROM study_history
      WHERE user_id = ?
    `).bind(t).first(), l = (a == null ? void 0 : a.avg_accuracy) || 0, o = hr(s.results, n.results, l), u = await r.prepare(`
      INSERT INTO ai_analysis 
      (user_id, weak_categories, strength_categories, recommended_topics, 
       predicted_score, study_recommendations, next_review_date)
      VALUES (?, ?, ?, ?, ?, ?, date('now', '+7 days'))
    `).bind(t, JSON.stringify(s.results.map((d) => d.category)), JSON.stringify(n.results.map((d) => d.category)), JSON.stringify(i), l, o).run();
    return e.json({ success: true, analysis: { analysisId: u.meta.last_row_id, weakAreas: s.results, strongAreas: n.results, recommendedTopics: i, predictedScore: Math.round(l), studyRecommendations: o, nextReviewDate: new Date(Date.now() + 10080 * 60 * 1e3).toISOString() } });
  } catch (t) {
    return console.error("Error analyzing weakness:", t), e.json({ error: "AI\u5206\u6790\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
Ae.get("/optimize/path/:userId", async (e) => {
  try {
    const t = e.req.param("userId"), r = e.req.query("targetDate") || new Date(Date.now() + 2160 * 60 * 60 * 1e3).toISOString(), n = await e.env.DB.prepare(`
      SELECT 
        category,
        total_questions,
        correct_answers,
        ROUND(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100, 1) as accuracy_rate
      FROM study_progress
      WHERE user_id = ?
    `).bind(t).all(), i = ["\u610F\u601D\u8868\u793A", "\u4EE3\u7406", "\u6642\u52B9", "\u7269\u6A29", "\u62B5\u5F53\u6A29", "\u8CC3\u8CB8\u501F", "\u76F8\u7D9A", "\u5B85\u5EFA\u696D\u306E\u514D\u8A31", "\u5B85\u5730\u5EFA\u7269\u53D6\u5F15\u58EB", "\u91CD\u8981\u4E8B\u9805\u8AAC\u660E", "\u5951\u7D04\u66F8\u9762", "\u90FD\u5E02\u8A08\u753B\u6CD5", "\u5EFA\u7BC9\u57FA\u6E96\u6CD5", "\u56FD\u571F\u5229\u7528\u8A08\u753B\u6CD5", "\u4E0D\u52D5\u7523\u53D6\u5F97\u7A0E", "\u56FA\u5B9A\u8CC7\u7523\u7A0E", "\u6240\u5F97\u7A0E", "\u5370\u7D19\u7A0E"], a = new Set(n.results.map((u) => u.category)), l = i.filter((u) => !a.has(u)), o = pr(n.results, l, r);
    return e.json({ success: true, optimizedPath: { currentLevel: fr(n.results), targetDate: r, dailyGoals: o.dailyGoals, weeklyMilestones: o.weeklyMilestones, priorityOrder: o.priorityOrder, estimatedCompletionDate: o.estimatedCompletionDate } });
  } catch (t) {
    return console.error("Error optimizing path:", t), e.json({ error: "\u5B66\u7FD2\u30D1\u30B9\u306E\u6700\u9069\u5316\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
Ae.get("/recommend/questions/:userId", async (e) => {
  try {
    const t = e.req.param("userId"), r = parseInt(e.req.query("count") || "10"), s = e.env.DB, n = await s.prepare(`
      SELECT question_id, incorrect_count
      FROM weak_questions
      WHERE user_id = ?
      ORDER BY incorrect_count DESC
      LIMIT 20
    `).bind(t).all(), i = await s.prepare(`
      SELECT DISTINCT question_id
      FROM study_history
      WHERE user_id = ? AND is_correct = 0
      ORDER BY studied_at DESC
      LIMIT 10
    `).bind(t).all(), a = await s.prepare(`
      SELECT id
      FROM questions
      WHERE id NOT IN (
        SELECT question_id FROM study_history WHERE user_id = ?
      )
      ORDER BY RANDOM()
      LIMIT ?
    `).bind(t, Math.floor(r / 3)).all(), l = /* @__PURE__ */ new Set();
    n.results.slice(0, Math.ceil(r / 3)).forEach((u) => {
      l.add(u.question_id);
    }), i.results.slice(0, Math.ceil(r / 3)).forEach((u) => {
      l.add(u.question_id);
    }), a.results.forEach((u) => {
      l.add(u.id);
    });
    const o = [];
    for (const u of Array.from(l).slice(0, r)) {
      const d = await s.prepare(`
        SELECT id, subject, category, difficulty, question_text, options
        FROM questions
        WHERE id = ?
      `).bind(u).first();
      d && (d.options = JSON.parse(d.options), o.push(d));
    }
    return e.json({ success: true, recommendations: { questions: o, reason: "\u82E6\u624B\u5206\u91CE\u306E\u514B\u670D\u3068\u65B0\u898F\u5B66\u7FD2\u306E\u30D0\u30E9\u30F3\u30B9\u3092\u8003\u616E\u3057\u305F\u554F\u984C\u30BB\u30C3\u30C8\u3067\u3059", focusAreas: Array.from(new Set(o.map((u) => u.category))) } });
  } catch (t) {
    return console.error("Error recommending questions:", t), e.json({ error: "\u554F\u984C\u63A8\u85A6\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
function hr(e, t, r) {
  const s = [];
  if (r < 50 ? s.push("\u57FA\u790E\u304B\u3089\u306E\u5FA9\u7FD2\u304C\u5FC5\u8981\u3067\u3059\u3002\u307E\u305A\u306F\u5404\u30AB\u30C6\u30B4\u30EA\u30FC\u306E\u57FA\u672C\u554F\u984C\u304B\u3089\u59CB\u3081\u307E\u3057\u3087\u3046\u3002") : r < 70 ? s.push("\u5408\u683C\u30E9\u30A4\u30F3\u306B\u8FD1\u3065\u3044\u3066\u3044\u307E\u3059\u3002\u82E6\u624B\u5206\u91CE\u3092\u91CD\u70B9\u7684\u306B\u5B66\u7FD2\u3057\u307E\u3057\u3087\u3046\u3002") : s.push("\u826F\u597D\u306A\u6210\u7E3E\u3067\u3059\u3002\u3055\u3089\u306A\u308B\u5411\u4E0A\u306E\u305F\u3081\u3001\u5FDC\u7528\u554F\u984C\u306B\u3082\u6311\u6226\u3057\u307E\u3057\u3087\u3046\u3002"), e.length > 0) {
    const n = e[0];
    s.push(`\u7279\u306B\u300C${n.category}\u300D\u306E\u6B63\u7B54\u7387\u304C\u4F4E\u3044\u305F\u3081\u3001\u3053\u306E\u5206\u91CE\u306E\u5FA9\u7FD2\u3092\u512A\u5148\u3057\u3066\u304F\u3060\u3055\u3044\u3002`);
  }
  if (t.length > 0) {
    const n = t[0];
    s.push(`\u300C${n.category}\u300D\u306F\u5F97\u610F\u5206\u91CE\u3067\u3059\u3002\u3053\u306E\u8ABF\u5B50\u3092\u7DAD\u6301\u3057\u306A\u304C\u3089\u4ED6\u306E\u5206\u91CE\u3082\u5F37\u5316\u3057\u307E\u3057\u3087\u3046\u3002`);
  }
  return s.push("\u6BCE\u65E530\u5206\u4EE5\u4E0A\u306E\u5B66\u7FD2\u6642\u9593\u3092\u78BA\u4FDD\u3057\u3001\u7D99\u7D9A\u7684\u306B\u53D6\u308A\u7D44\u3080\u3053\u3068\u304C\u91CD\u8981\u3067\u3059\u3002"), s.join(" ");
}
__name(hr, "hr");
function fr(e) {
  if (e.length === 0) return "\u521D\u7D1A";
  const t = e.reduce((s, n) => s + (n.accuracy_rate || 0), 0) / e.length;
  return e.reduce((s, n) => s + n.total_questions, 0) < 50 || t < 50 ? "\u521D\u7D1A" : t < 70 ? "\u4E2D\u7D1A" : "\u4E0A\u7D1A";
}
__name(fr, "fr");
function pr(e, t, r) {
  const s = Math.floor((new Date(r).getTime() - Date.now()) / 864e5), n = { questions: Math.max(10, Math.floor(402 / s)), studyTime: 60, reviewTime: 30 }, i = [], a = Math.floor(s / 7);
  for (let o = 1; o <= Math.min(a, 12); o++) i.push({ week: o, targetQuestions: n.questions * 7 * o, targetAccuracy: Math.min(70 + o * 2, 90), focusCategories: t.slice((o - 1) * 2, o * 2) });
  const l = [...t, ...e.filter((o) => o.accuracy_rate < 70).sort((o, u) => o.accuracy_rate - u.accuracy_rate).map((o) => o.category)];
  return { dailyGoals: n, weeklyMilestones: i, priorityOrder: l, estimatedCompletionDate: new Date(Date.now() + 402 / n.questions * 24 * 60 * 60 * 1e3).toISOString() };
}
__name(pr, "pr");
var k = new je();
k.use("/api/*", tr());
k.route("/api/study", ee);
k.route("/api/ai", Ae);
k.use("/static/*", dr({ root: "./public" }));
k.get("/api/manual/sections", (e) => {
  const t = [{ id: "getting-started", title: "\u306F\u3058\u3081\u306B", icon: "fa-rocket", content: { overview: "\u5B85\u5EFABOOST\u306F\u3001AI\u642D\u8F09\u306E\u5B85\u5EFA\u8A66\u9A13\u5B66\u7FD2\u30A2\u30D7\u30EA\u3067\u3059\u3002402\u554F\u306E\u8A66\u9A13\u554F\u984C\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u3068\u3001\u52B9\u7387\u7684\u306A\u5B66\u7FD2\u6A5F\u80FD\u3092\u63D0\u4F9B\u3057\u307E\u3059\u3002", features: ["402\u554F\u306E\u8A66\u9A13\u554F\u984C\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9", "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2\uFF08\u6A29\u5229\u95A2\u4FC2\u30FB\u5B85\u5EFA\u696D\u6CD5\u30FB\u6CD5\u4EE4\u5236\u9650\u30FB\u7A0E/\u305D\u306E\u4ED6\uFF09", "\u6A21\u64EC\u8A66\u9A13\u6A5F\u80FD\uFF0850\u554F\u30FB2\u6642\u9593\u5236\u9650\uFF09", "\u82E6\u624B\u554F\u984C\u306E\u81EA\u52D5\u62BD\u51FA", "AI\u5F31\u70B9\u5206\u6790", "\u5B66\u7FD2\u9032\u6357\u306E\u53EF\u8996\u5316"] } }, { id: "user-registration", title: "\u30E6\u30FC\u30B6\u30FC\u767B\u9332\u30FB\u30ED\u30B0\u30A4\u30F3", icon: "fa-user", content: { steps: [{ title: "\u65B0\u898F\u767B\u9332", description: "\u30C8\u30C3\u30D7\u30DA\u30FC\u30B8\u304B\u3089\u300C\u65B0\u898F\u767B\u9332\u300D\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3001\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B\u3057\u307E\u3059\u3002", tips: ["\u30D1\u30B9\u30EF\u30FC\u30C9\u306F8\u6587\u5B57\u4EE5\u4E0A\u3067\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044", "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306F\u5F8C\u304B\u3089\u5909\u66F4\u53EF\u80FD\u3067\u3059"] }, { title: "\u30ED\u30B0\u30A4\u30F3", description: "\u767B\u9332\u6E08\u307F\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u307E\u3059\u3002", tips: ["\u300C\u30ED\u30B0\u30A4\u30F3\u72B6\u614B\u3092\u4FDD\u6301\u300D\u306B\u30C1\u30A7\u30C3\u30AF\u3092\u5165\u308C\u308B\u3068\u3001\u6B21\u56DE\u304B\u3089\u81EA\u52D5\u30ED\u30B0\u30A4\u30F3\u3055\u308C\u307E\u3059"] }, { title: "\u30B2\u30B9\u30C8\u30E2\u30FC\u30C9", description: "\u767B\u9332\u306A\u3057\u3067\u5229\u7528\u3057\u305F\u3044\u5834\u5408\u306F\u300C\u30B2\u30B9\u30C8\u3068\u3057\u3066\u7D9A\u884C\u300D\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059\u3002", tips: ["\u30B2\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u306F\u5B66\u7FD2\u5C65\u6B74\u304C\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093", "\u3044\u3064\u3067\u3082\u30E6\u30FC\u30B6\u30FC\u767B\u9332\u306B\u5207\u308A\u66FF\u3048\u3089\u308C\u307E\u3059"] }] } }, { id: "study-mode", title: "\u5B66\u7FD2\u30E2\u30FC\u30C9", icon: "fa-book", content: { modes: [{ name: "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2", description: "\u5206\u91CE\u3054\u3068\u306B\u554F\u984C\u3092\u89E3\u3044\u3066\u57FA\u790E\u529B\u3092\u8EAB\u306B\u3064\u3051\u307E\u3059", howTo: ["\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u300C\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2\u300D\u3092\u9078\u629E", "\u5B66\u7FD2\u3057\u305F\u3044\u30AB\u30C6\u30B4\u30EA\u30FC\uFF08\u6A29\u5229\u95A2\u4FC2/\u5B85\u5EFA\u696D\u6CD5/\u6CD5\u4EE4\u5236\u9650/\u7A0E\u30FB\u305D\u306E\u4ED6\uFF09\u3092\u9078\u629E", "\u554F\u984C\u304C\u8868\u793A\u3055\u308C\u308B\u306E\u3067\u30014\u3064\u306E\u9078\u629E\u80A2\u304B\u3089\u6B63\u89E3\u3092\u9078\u629E", "\u89E3\u7B54\u5F8C\u3001\u6B63\u89E3\u3068\u89E3\u8AAC\u304C\u8868\u793A\u3055\u308C\u307E\u3059", "\u300C\u6B21\u306E\u554F\u984C\u3078\u300D\u3067\u6B21\u306E\u554F\u984C\u306B\u9032\u307F\u307E\u3059"] }, { name: "\u82E6\u624B\u554F\u984C\u96C6\u4E2D\u5B66\u7FD2", description: "\u9593\u9055\u3048\u305F\u554F\u984C\u3092\u91CD\u70B9\u7684\u306B\u5FA9\u7FD2\u3057\u307E\u3059", howTo: ["\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u300C\u82E6\u624B\u554F\u984C\u300D\u3092\u9078\u629E", "\u904E\u53BB\u306B\u9593\u9055\u3048\u305F\u554F\u984C\u304C\u81EA\u52D5\u7684\u306B\u62BD\u51FA\u3055\u308C\u307E\u3059", "\u7E70\u308A\u8FD4\u3057\u89E3\u3044\u3066\u82E6\u624B\u3092\u514B\u670D\u3057\u307E\u3057\u3087\u3046", "\u6B63\u89E3\u7387\u304C\u4E0A\u304C\u308B\u3068\u81EA\u52D5\u7684\u306B\u82E6\u624B\u30EA\u30B9\u30C8\u304B\u3089\u5916\u308C\u307E\u3059"] }, { name: "\u30E9\u30F3\u30C0\u30E0\u5B66\u7FD2", description: "\u5168\u30AB\u30C6\u30B4\u30EA\u30FC\u304B\u3089\u30E9\u30F3\u30C0\u30E0\u306B\u51FA\u984C\u3055\u308C\u307E\u3059", howTo: ["\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u300C\u30E9\u30F3\u30C0\u30E0\u5B66\u7FD2\u300D\u3092\u9078\u629E", "\u5168402\u554F\u304B\u3089\u30E9\u30F3\u30C0\u30E0\u306B\u554F\u984C\u304C\u51FA\u984C\u3055\u308C\u307E\u3059", "\u7DCF\u5408\u7684\u306A\u5B9F\u529B\u3092\u8A66\u3059\u306E\u306B\u6700\u9069\u3067\u3059"] }] } }, { id: "mock-exam", title: "\u6A21\u64EC\u8A66\u9A13", icon: "fa-clock", content: { overview: "\u672C\u756A\u3068\u540C\u3058\u5F62\u5F0F\u306750\u554F\u30FB2\u6642\u9593\u306E\u6A21\u64EC\u8A66\u9A13\u3092\u53D7\u3051\u3089\u308C\u307E\u3059\u3002", features: [{ name: "\u8A66\u9A13\u5F62\u5F0F", details: ["\u554F\u984C\u6570\uFF1A50\u554F\uFF08\u672C\u756A\u3068\u540C\u3058\uFF09", "\u5236\u9650\u6642\u9593\uFF1A2\u6642\u9593\uFF08120\u5206\uFF09", "\u51FA\u984C\u7BC4\u56F2\uFF1A\u5168\u30AB\u30C6\u30B4\u30EA\u30FC\u304B\u3089\u5747\u7B49\u306B\u51FA\u984C", "\u5408\u683C\u30E9\u30A4\u30F3\uFF1A70%\uFF0835\u554F\u6B63\u89E3\uFF09"] }, { name: "\u30BF\u30A4\u30DE\u30FC\u6A5F\u80FD", details: ["\u30AB\u30A6\u30F3\u30C8\u30C0\u30A6\u30F3\u30BF\u30A4\u30DE\u30FC\u3067\u6B8B\u308A\u6642\u9593\u3092\u8868\u793A", "\u6B8B\u308A10\u5206\u30015\u5206\u30011\u5206\u3067\u8B66\u544A\u8868\u793A", "\u4E00\u6642\u505C\u6B62\u30FB\u518D\u958B\u6A5F\u80FD\u3042\u308A", "\u6642\u9593\u5207\u308C\u3067\u81EA\u52D5\u7D42\u4E86"] }, { name: "\u7D50\u679C\u5206\u6790", details: ["\u70B9\u6570\u3068\u6B63\u7B54\u7387\u3092\u8868\u793A", "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u306E\u6210\u7E3E\u5206\u6790", "\u9593\u9055\u3048\u305F\u554F\u984C\u306E\u78BA\u8A8D\u3068\u89E3\u8AAC", "\u82E6\u624B\u5206\u91CE\u306E\u7279\u5B9A\u3068\u30A2\u30C9\u30D0\u30A4\u30B9"] }], howTo: ["\u30E1\u30A4\u30F3\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u300C\u6A21\u64EC\u8A66\u9A13\u300D\u3092\u9078\u629E", "\u300C\u8A66\u9A13\u958B\u59CB\u300D\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30C3\u30AF", "50\u554F\u3059\u3079\u3066\u306B\u89E3\u7B54\uFF08\u9014\u4E2D\u4FDD\u5B58\u53EF\u80FD\uFF09", "\u300C\u63A1\u70B9\u3059\u308B\u300D\u30DC\u30BF\u30F3\u3067\u7D50\u679C\u3092\u78BA\u8A8D", "\u7D50\u679C\u753B\u9762\u3067\u8A73\u7D30\u306A\u5206\u6790\u3092\u78BA\u8A8D"] } }, { id: "progress-tracking", title: "\u5B66\u7FD2\u9032\u6357\u7BA1\u7406", icon: "fa-chart-line", content: { features: [{ name: "\u5B66\u7FD2\u7D71\u8A08", description: "\u7DCF\u5B66\u7FD2\u6642\u9593\u3001\u89E3\u7B54\u6570\u3001\u6B63\u7B54\u7387\u306A\u3069\u3092\u78BA\u8A8D\u3067\u304D\u307E\u3059", details: ["\u4ECA\u65E5\u306E\u5B66\u7FD2\u6642\u9593", "\u7D2F\u8A08\u89E3\u7B54\u554F\u984C\u6570", "\u5168\u4F53\u306E\u6B63\u7B54\u7387", "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u306E\u6B63\u7B54\u7387", "\u9023\u7D9A\u5B66\u7FD2\u65E5\u6570"] }, { name: "3D\u30D3\u30B8\u30E5\u30A2\u30E9\u30A4\u30BC\u30FC\u30B7\u30E7\u30F3", description: "\u5B66\u7FD2\u9032\u6357\u30923D\u30B0\u30E9\u30D5\u3067\u8996\u899A\u7684\u306B\u78BA\u8A8D", details: ["\u30EC\u30FC\u30C0\u30FC\u30C1\u30E3\u30FC\u30C8\u3067\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u306E\u7FD2\u719F\u5EA6\u3092\u8868\u793A", "\u6642\u7CFB\u5217\u30B0\u30E9\u30D5\u3067\u6210\u9577\u3092\u53EF\u8996\u5316", "\u76EE\u6A19\u9054\u6210\u5EA6\u3092\u30D7\u30ED\u30B0\u30EC\u30B9\u30D0\u30FC\u3067\u8868\u793A"] }, { name: "\u30AB\u30EC\u30F3\u30C0\u30FC\u6A5F\u80FD", description: "\u5B66\u7FD2\u30AB\u30EC\u30F3\u30C0\u30FC\u3067\u8A08\u753B\u7684\u306A\u5B66\u7FD2\u3092\u30B5\u30DD\u30FC\u30C8", details: ["\u8A66\u9A13\u65E5\u307E\u3067\u306E\u30AB\u30A6\u30F3\u30C8\u30C0\u30A6\u30F3", "\u5B66\u7FD2\u3057\u305F\u65E5\u306B\u30DE\u30FC\u30AF\u8868\u793A", "\u6708\u9593\u30FB\u9031\u9593\u306E\u5B66\u7FD2\u30B5\u30DE\u30EA\u30FC"] }] } }, { id: "ai-features", title: "AI\u6A5F\u80FD", icon: "fa-brain", content: { features: [{ name: "\u5F31\u70B9\u5206\u6790", description: "AI\u304C\u5B66\u7FD2\u30C7\u30FC\u30BF\u3092\u5206\u6790\u3057\u3001\u5F31\u70B9\u3092\u7279\u5B9A\u3057\u307E\u3059", benefits: ["\u9593\u9055\u3044\u30D1\u30BF\u30FC\u30F3\u306E\u81EA\u52D5\u691C\u51FA", "\u82E6\u624B\u5206\u91CE\u306E\u512A\u5148\u9806\u4F4D\u4ED8\u3051", "\u52B9\u7387\u7684\u306A\u5B66\u7FD2\u8A08\u753B\u306E\u63D0\u6848"] }, { name: "\u5B66\u7FD2\u30A2\u30C9\u30D0\u30A4\u30B9", description: "\u500B\u4EBA\u306E\u5B66\u7FD2\u72B6\u6CC1\u306B\u5FDC\u3058\u305F\u30A2\u30C9\u30D0\u30A4\u30B9\u3092\u63D0\u4F9B", benefits: ["\u6700\u9069\u306A\u5B66\u7FD2\u9806\u5E8F\u306E\u63D0\u6848", "\u5FA9\u7FD2\u30BF\u30A4\u30DF\u30F3\u30B0\u306E\u6700\u9069\u5316", "\u30E2\u30C1\u30D9\u30FC\u30B7\u30E7\u30F3\u7DAD\u6301\u306E\u30B5\u30DD\u30FC\u30C8"] }] } }, { id: "tips", title: "\u5B66\u7FD2\u306E\u30B3\u30C4", icon: "fa-lightbulb", content: { tips: [{ title: "\u6BCE\u65E5\u5C11\u3057\u305A\u3064", description: "1\u65E515\u5206\u3067\u3082\u826F\u3044\u306E\u3067\u3001\u6BCE\u65E5\u7D99\u7D9A\u3059\u308B\u3053\u3068\u304C\u5927\u5207\u3067\u3059\u3002" }, { title: "\u82E6\u624B\u5206\u91CE\u3092\u512A\u5148", description: "\u82E6\u624B\u306A\u5206\u91CE\u304B\u3089\u53D6\u308A\u7D44\u3080\u3053\u3068\u3067\u3001\u52B9\u7387\u7684\u306B\u5F97\u70B9\u3092\u4F38\u3070\u305B\u307E\u3059\u3002" }, { title: "\u89E3\u8AAC\u3092\u3057\u3063\u304B\u308A\u8AAD\u3080", description: "\u6B63\u89E3\u30FB\u4E0D\u6B63\u89E3\u306B\u95A2\u308F\u3089\u305A\u3001\u89E3\u8AAC\u3092\u8AAD\u3093\u3067\u7406\u89E3\u3092\u6DF1\u3081\u307E\u3057\u3087\u3046\u3002" }, { title: "\u6A21\u64EC\u8A66\u9A13\u3067\u5B9F\u529B\u30C1\u30A7\u30C3\u30AF", description: "\u9031\u306B1\u56DE\u306F\u6A21\u64EC\u8A66\u9A13\u3092\u53D7\u3051\u3066\u3001\u672C\u756A\u306E\u611F\u899A\u3092\u63B4\u307F\u307E\u3057\u3087\u3046\u3002" }, { title: "\u5FA9\u7FD2\u3092\u5FD8\u308C\u305A\u306B", description: "\u4E00\u5EA6\u89E3\u3044\u305F\u554F\u984C\u3082\u3001\u6642\u9593\u3092\u7A7A\u3051\u3066\u5FA9\u7FD2\u3059\u308B\u3053\u3068\u3067\u5B9A\u7740\u3057\u307E\u3059\u3002" }] } }, { id: "troubleshooting", title: "\u30C8\u30E9\u30D6\u30EB\u30B7\u30E5\u30FC\u30C6\u30A3\u30F3\u30B0", icon: "fa-tools", content: { issues: [{ problem: "\u30ED\u30B0\u30A4\u30F3\u3067\u304D\u306A\u3044", solutions: ["\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u3044\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306E\u5165\u529B\u30DF\u30B9\u304C\u306A\u3044\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", "\u30D1\u30B9\u30EF\u30FC\u30C9\u30EA\u30BB\u30C3\u30C8\u6A5F\u80FD\u3092\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044"] }, { problem: "\u554F\u984C\u304C\u8868\u793A\u3055\u308C\u306A\u3044", solutions: ["\u30A4\u30F3\u30BF\u30FC\u30CD\u30C3\u30C8\u63A5\u7D9A\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", "\u30D6\u30E9\u30A6\u30B6\u306E\u30AD\u30E3\u30C3\u30B7\u30E5\u3092\u30AF\u30EA\u30A2\u3057\u3066\u304F\u3060\u3055\u3044", "\u30DA\u30FC\u30B8\u3092\u518D\u8AAD\u307F\u8FBC\u307F\u3057\u3066\u304F\u3060\u3055\u3044\uFF08F5\u30AD\u30FC\uFF09"] }, { problem: "\u5B66\u7FD2\u5C65\u6B74\u304C\u4FDD\u5B58\u3055\u308C\u306A\u3044", solutions: ["\u30ED\u30B0\u30A4\u30F3\u72B6\u614B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044", "\u30B2\u30B9\u30C8\u30E2\u30FC\u30C9\u3067\u306F\u5C65\u6B74\u304C\u4FDD\u5B58\u3055\u308C\u307E\u305B\u3093", "\u30D6\u30E9\u30A6\u30B6\u306ECookie\u304C\u6709\u52B9\u306B\u306A\u3063\u3066\u3044\u308B\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044"] }] } }];
  return e.json(t);
});
k.get("/api/tutorial/steps", (e) => {
  const t = [{ id: 1, target: ".menu-button", title: "\u30E1\u30CB\u30E5\u30FC\u3078\u3088\u3046\u3053\u305D\uFF01", content: "\u3053\u3053\u304B\u3089\u5404\u5B66\u7FD2\u30E2\u30FC\u30C9\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u3059\u3002", position: "bottom" }, { id: 2, target: ".category-study", title: "\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2", content: "\u5206\u91CE\u3054\u3068\u306B\u554F\u984C\u3092\u89E3\u3044\u3066\u57FA\u790E\u529B\u3092\u8EAB\u306B\u3064\u3051\u307E\u3057\u3087\u3046\u3002", position: "right" }, { id: 3, target: ".mock-exam", title: "\u6A21\u64EC\u8A66\u9A13", content: "\u672C\u756A\u3068\u540C\u305850\u554F\u30FB2\u6642\u9593\u306E\u8A66\u9A13\u306B\u6311\u6226\u3067\u304D\u307E\u3059\u3002", position: "left" }, { id: 4, target: ".weak-points", title: "\u82E6\u624B\u554F\u984C", content: "\u9593\u9055\u3048\u305F\u554F\u984C\u3092\u91CD\u70B9\u7684\u306B\u5FA9\u7FD2\u3067\u304D\u307E\u3059\u3002", position: "bottom" }, { id: 5, target: ".progress-chart", title: "\u9032\u6357\u78BA\u8A8D", content: "\u3042\u306A\u305F\u306E\u5B66\u7FD2\u9032\u6357\u3092\u30B0\u30E9\u30D5\u3067\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002", position: "top" }];
  return e.json(t);
});
k.get("/api/faq", (e) => {
  const t = [{ id: 1, category: "\u57FA\u672C\u6A5F\u80FD", question: "\u7121\u6599\u3067\u4F7F\u3048\u307E\u3059\u304B\uFF1F", answer: "\u306F\u3044\u3001\u57FA\u672C\u6A5F\u80FD\u306F\u7121\u6599\u3067\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059\u3002" }, { id: 2, category: "\u57FA\u672C\u6A5F\u80FD", question: "\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u3082\u4F7F\u3048\u307E\u3059\u304B\uFF1F", answer: "PWA\u5BFE\u5FDC\u306B\u3088\u308A\u3001\u4E00\u5EA6\u8AAD\u307F\u8FBC\u3093\u3060\u30B3\u30F3\u30C6\u30F3\u30C4\u306F\u30AA\u30D5\u30E9\u30A4\u30F3\u3067\u3082\u5229\u7528\u53EF\u80FD\u3067\u3059\u3002" }, { id: 3, category: "\u5B66\u7FD2\u65B9\u6CD5", question: "\u52B9\u7387\u7684\u306A\u5B66\u7FD2\u65B9\u6CD5\u3092\u6559\u3048\u3066\u304F\u3060\u3055\u3044", answer: "\u307E\u305A\u82E6\u624B\u5206\u91CE\u3092\u7279\u5B9A\u3057\u3001\u30AB\u30C6\u30B4\u30EA\u30FC\u5225\u5B66\u7FD2\u3067\u57FA\u790E\u3092\u56FA\u3081\u305F\u5F8C\u3001\u6A21\u64EC\u8A66\u9A13\u3067\u5B9F\u529B\u3092\u78BA\u8A8D\u3059\u308B\u3053\u3068\u3092\u304A\u52E7\u3081\u3057\u307E\u3059\u3002" }, { id: 4, category: "\u5B66\u7FD2\u65B9\u6CD5", question: "1\u65E5\u3069\u306E\u304F\u3089\u3044\u5B66\u7FD2\u3059\u308C\u3070\u826F\u3044\u3067\u3059\u304B\uFF1F", answer: "\u500B\u4EBA\u5DEE\u306F\u3042\u308A\u307E\u3059\u304C\u3001\u6BCE\u65E530\u5206\u301C1\u6642\u9593\u306E\u5B66\u7FD2\u30923\u30F6\u6708\u7D99\u7D9A\u3059\u308B\u3053\u3068\u3067\u5408\u683C\u30EC\u30D9\u30EB\u306B\u5230\u9054\u3067\u304D\u307E\u3059\u3002" }, { id: 5, category: "\u30A2\u30AB\u30A6\u30F3\u30C8", question: "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u307E\u3057\u305F", answer: "\u30ED\u30B0\u30A4\u30F3\u753B\u9762\u306E\u300C\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5FD8\u308C\u305F\u65B9\u300D\u304B\u3089\u30EA\u30BB\u30C3\u30C8\u624B\u7D9A\u304D\u3092\u884C\u3063\u3066\u304F\u3060\u3055\u3044\u3002" }, { id: 6, category: "\u30A2\u30AB\u30A6\u30F3\u30C8", question: "\u8907\u6570\u30C7\u30D0\u30A4\u30B9\u3067\u4F7F\u3048\u307E\u3059\u304B\uFF1F", answer: "\u306F\u3044\u3001\u540C\u3058\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u30ED\u30B0\u30A4\u30F3\u3059\u308C\u3070\u3001\u3069\u306E\u30C7\u30D0\u30A4\u30B9\u304B\u3089\u3067\u3082\u5B66\u7FD2\u3092\u7D99\u7D9A\u3067\u304D\u307E\u3059\u3002" }, { id: 7, category: "\u6280\u8853\u7684\u306A\u554F\u984C", question: "\u52D5\u4F5C\u304C\u9045\u3044\u5834\u5408\u306F\u3069\u3046\u3059\u308C\u3070\u826F\u3044\u3067\u3059\u304B\uFF1F", answer: "\u30D6\u30E9\u30A6\u30B6\u306E\u30AD\u30E3\u30C3\u30B7\u30E5\u3092\u30AF\u30EA\u30A2\u3057\u3001\u4E0D\u8981\u306A\u30BF\u30D6\u3092\u9589\u3058\u3066\u304B\u3089\u518D\u5EA6\u30A2\u30AF\u30BB\u30B9\u3057\u3066\u304F\u3060\u3055\u3044\u3002" }, { id: 8, category: "\u6280\u8853\u7684\u306A\u554F\u984C", question: "\u63A8\u5968\u30D6\u30E9\u30A6\u30B6\u306F\u3042\u308A\u307E\u3059\u304B\uFF1F", answer: "Chrome\u3001Firefox\u3001Safari\u3001Edge\u306E\u6700\u65B0\u7248\u3092\u63A8\u5968\u3057\u3066\u3044\u307E\u3059\u3002" }];
  return e.json(t);
});
k.get("/", (e) => e.html(`
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
var Ve = new je();
var mr = Object.assign({ "/src/index.tsx": k });
var vt = false;
for (const [, e] of Object.entries(mr)) e && (Ve.route("/", e), Ve.notFound(e.notFoundHandler), vt = true);
if (!vt) throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");

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

// ../.wrangler/tmp/bundle-TyFDHU/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = Ve;

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

// ../.wrangler/tmp/bundle-TyFDHU/middleware-loader.entry.ts
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
//# sourceMappingURL=bundledWorker-0.7776108456157322.mjs.map
