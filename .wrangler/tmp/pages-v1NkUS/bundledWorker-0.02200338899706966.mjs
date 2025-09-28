var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-KBlR0C/checked-fetch.js
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
var Rt = Object.defineProperty;
var Ue = /* @__PURE__ */ __name((e) => {
  throw TypeError(e);
}, "Ue");
var St = /* @__PURE__ */ __name((e, t, s) => t in e ? Rt(e, t, { enumerable: true, configurable: true, writable: true, value: s }) : e[t] = s, "St");
var p = /* @__PURE__ */ __name((e, t, s) => St(e, typeof t != "symbol" ? t + "" : t, s), "p");
var ke = /* @__PURE__ */ __name((e, t, s) => t.has(e) || Ue("Cannot " + s), "ke");
var c = /* @__PURE__ */ __name((e, t, s) => (ke(e, t, "read from private field"), s ? s.call(e) : t.get(e)), "c");
var g = /* @__PURE__ */ __name((e, t, s) => t.has(e) ? Ue("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), "g");
var f = /* @__PURE__ */ __name((e, t, s, r) => (ke(e, t, "write to private field"), r ? r.call(e, s) : t.set(e, s), s), "f");
var x = /* @__PURE__ */ __name((e, t, s) => (ke(e, t, "access private method"), s), "x");
var We = /* @__PURE__ */ __name((e, t, s, r) => ({ set _(n) {
  f(e, t, n, s);
}, get _() {
  return c(e, t, r);
} }), "We");
var $e = /* @__PURE__ */ __name((e, t, s) => (r, n) => {
  let i = -1;
  return o(0);
  async function o(l) {
    if (l <= i) throw new Error("next() called multiple times");
    i = l;
    let a, d = false, u;
    if (e[l] ? (u = e[l][0][0], r.req.routeIndex = l) : u = l === e.length && n || void 0, u) try {
      a = await u(r, () => o(l + 1));
    } catch (h) {
      if (h instanceof Error && t) r.error = h, a = await t(h, r), d = true;
      else throw h;
    }
    else r.finalized === false && s && (a = await s(r));
    return a && (r.finalized === false || d) && (r.res = a), r;
  }
  __name(o, "o");
}, "$e");
var Ot = Symbol();
var Tt = /* @__PURE__ */ __name(async (e, t = /* @__PURE__ */ Object.create(null)) => {
  const { all: s = false, dot: r = false } = t, i = (e instanceof ct ? e.raw.headers : e.headers).get("Content-Type");
  return i != null && i.startsWith("multipart/form-data") || i != null && i.startsWith("application/x-www-form-urlencoded") ? jt(e, { all: s, dot: r }) : {};
}, "Tt");
async function jt(e, t) {
  const s = await e.formData();
  return s ? At(s, t) : {};
}
__name(jt, "jt");
function At(e, t) {
  const s = /* @__PURE__ */ Object.create(null);
  return e.forEach((r, n) => {
    t.all || n.endsWith("[]") ? Ct(s, n, r) : s[n] = r;
  }), t.dot && Object.entries(s).forEach(([r, n]) => {
    r.includes(".") && (qt(s, r, n), delete s[r]);
  }), s;
}
__name(At, "At");
var Ct = /* @__PURE__ */ __name((e, t, s) => {
  e[t] !== void 0 ? Array.isArray(e[t]) ? e[t].push(s) : e[t] = [e[t], s] : t.endsWith("[]") ? e[t] = [s] : e[t] = s;
}, "Ct");
var qt = /* @__PURE__ */ __name((e, t, s) => {
  let r = e;
  const n = t.split(".");
  n.forEach((i, o) => {
    o === n.length - 1 ? r[i] = s : ((!r[i] || typeof r[i] != "object" || Array.isArray(r[i]) || r[i] instanceof File) && (r[i] = /* @__PURE__ */ Object.create(null)), r = r[i]);
  });
}, "qt");
var rt = /* @__PURE__ */ __name((e) => {
  const t = e.split("/");
  return t[0] === "" && t.shift(), t;
}, "rt");
var It = /* @__PURE__ */ __name((e) => {
  const { groups: t, path: s } = Nt(e), r = rt(s);
  return kt(r, t);
}, "It");
var Nt = /* @__PURE__ */ __name((e) => {
  const t = [];
  return e = e.replace(/\{[^}]+\}/g, (s, r) => {
    const n = `@${r}`;
    return t.push([n, s]), n;
  }), { groups: t, path: e };
}, "Nt");
var kt = /* @__PURE__ */ __name((e, t) => {
  for (let s = t.length - 1; s >= 0; s--) {
    const [r] = t[s];
    for (let n = e.length - 1; n >= 0; n--) if (e[n].includes(r)) {
      e[n] = e[n].replace(r, t[s][1]);
      break;
    }
  }
  return e;
}, "kt");
var Re = {};
var Dt = /* @__PURE__ */ __name((e, t) => {
  if (e === "*") return "*";
  const s = e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (s) {
    const r = `${e}#${t}`;
    return Re[r] || (s[2] ? Re[r] = t && t[0] !== ":" && t[0] !== "*" ? [r, s[1], new RegExp(`^${s[2]}(?=/${t})`)] : [e, s[1], new RegExp(`^${s[2]}$`)] : Re[r] = [e, s[1], true]), Re[r];
  }
  return null;
}, "Dt");
var He = /* @__PURE__ */ __name((e, t) => {
  try {
    return t(e);
  } catch {
    return e.replace(/(?:%[0-9A-Fa-f]{2})+/g, (s) => {
      try {
        return t(s);
      } catch {
        return s;
      }
    });
  }
}, "He");
var Mt = /* @__PURE__ */ __name((e) => He(e, decodeURI), "Mt");
var nt = /* @__PURE__ */ __name((e) => {
  const t = e.url, s = t.indexOf("/", t.indexOf(":") + 4);
  let r = s;
  for (; r < t.length; r++) {
    const n = t.charCodeAt(r);
    if (n === 37) {
      const i = t.indexOf("?", r), o = t.slice(s, i === -1 ? void 0 : i);
      return Mt(o.includes("%25") ? o.replace(/%25/g, "%2525") : o);
    } else if (n === 63) break;
  }
  return t.slice(s, r);
}, "nt");
var Pt = /* @__PURE__ */ __name((e) => {
  const t = nt(e);
  return t.length > 1 && t.at(-1) === "/" ? t.slice(0, -1) : t;
}, "Pt");
var ne = /* @__PURE__ */ __name((e, t, ...s) => (s.length && (t = ne(t, ...s)), `${(e == null ? void 0 : e[0]) === "/" ? "" : "/"}${e}${t === "/" ? "" : `${(e == null ? void 0 : e.at(-1)) === "/" ? "" : "/"}${(t == null ? void 0 : t[0]) === "/" ? t.slice(1) : t}`}`), "ne");
var it = /* @__PURE__ */ __name((e) => {
  if (e.charCodeAt(e.length - 1) !== 63 || !e.includes(":")) return null;
  const t = e.split("/"), s = [];
  let r = "";
  return t.forEach((n) => {
    if (n !== "" && !/\:/.test(n)) r += "/" + n;
    else if (/\:/.test(n)) if (/\?/.test(n)) {
      s.length === 0 && r === "" ? s.push("/") : s.push(r);
      const i = n.replace("?", "");
      r += "/" + i, s.push(r);
    } else r += "/" + n;
  }), s.filter((n, i, o) => o.indexOf(n) === i);
}, "it");
var De = /* @__PURE__ */ __name((e) => /[%+]/.test(e) ? (e.indexOf("+") !== -1 && (e = e.replace(/\+/g, " ")), e.indexOf("%") !== -1 ? He(e, ot) : e) : e, "De");
var at = /* @__PURE__ */ __name((e, t, s) => {
  let r;
  if (!s && t && !/[%+]/.test(t)) {
    let o = e.indexOf(`?${t}`, 8);
    for (o === -1 && (o = e.indexOf(`&${t}`, 8)); o !== -1; ) {
      const l = e.charCodeAt(o + t.length + 1);
      if (l === 61) {
        const a = o + t.length + 2, d = e.indexOf("&", a);
        return De(e.slice(a, d === -1 ? void 0 : d));
      } else if (l == 38 || isNaN(l)) return "";
      o = e.indexOf(`&${t}`, o + 1);
    }
    if (r = /[%+]/.test(e), !r) return;
  }
  const n = {};
  r ?? (r = /[%+]/.test(e));
  let i = e.indexOf("?", 8);
  for (; i !== -1; ) {
    const o = e.indexOf("&", i + 1);
    let l = e.indexOf("=", i);
    l > o && o !== -1 && (l = -1);
    let a = e.slice(i + 1, l === -1 ? o === -1 ? void 0 : o : l);
    if (r && (a = De(a)), i = o, a === "") continue;
    let d;
    l === -1 ? d = "" : (d = e.slice(l + 1, o === -1 ? void 0 : o), r && (d = De(d))), s ? (n[a] && Array.isArray(n[a]) || (n[a] = []), n[a].push(d)) : n[a] ?? (n[a] = d);
  }
  return t ? n[t] : n;
}, "at");
var Lt = at;
var Ht = /* @__PURE__ */ __name((e, t) => at(e, t, true), "Ht");
var ot = decodeURIComponent;
var Be = /* @__PURE__ */ __name((e) => He(e, ot), "Be");
var oe;
var j;
var H;
var lt;
var dt;
var Pe;
var U;
var Je;
var ct = (Je = class {
  static {
    __name(this, "Je");
  }
  constructor(e, t = "/", s = [[]]) {
    g(this, H);
    p(this, "raw");
    g(this, oe);
    g(this, j);
    p(this, "routeIndex", 0);
    p(this, "path");
    p(this, "bodyCache", {});
    g(this, U, (e2) => {
      const { bodyCache: t2, raw: s2 } = this, r = t2[e2];
      if (r) return r;
      const n = Object.keys(t2)[0];
      return n ? t2[n].then((i) => (n === "json" && (i = JSON.stringify(i)), new Response(i)[e2]())) : t2[e2] = s2[e2]();
    });
    this.raw = e, this.path = t, f(this, j, s), f(this, oe, {});
  }
  param(e) {
    return e ? x(this, H, lt).call(this, e) : x(this, H, dt).call(this);
  }
  query(e) {
    return Lt(this.url, e);
  }
  queries(e) {
    return Ht(this.url, e);
  }
  header(e) {
    if (e) return this.raw.headers.get(e) ?? void 0;
    const t = {};
    return this.raw.headers.forEach((s, r) => {
      t[r] = s;
    }), t;
  }
  async parseBody(e) {
    var t;
    return (t = this.bodyCache).parsedBody ?? (t.parsedBody = await Tt(this, e));
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
    return c(this, j);
  }
  get matchedRoutes() {
    return c(this, j)[0].map(([[, e]]) => e);
  }
  get routePath() {
    return c(this, j)[0].map(([[, e]]) => e)[this.routeIndex].path;
  }
}, oe = /* @__PURE__ */ new WeakMap(), j = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakSet(), lt = /* @__PURE__ */ __name(function(e) {
  const t = c(this, j)[0][this.routeIndex][1][e], s = x(this, H, Pe).call(this, t);
  return s && /\%/.test(s) ? Be(s) : s;
}, "lt"), dt = /* @__PURE__ */ __name(function() {
  const e = {}, t = Object.keys(c(this, j)[0][this.routeIndex][1]);
  for (const s of t) {
    const r = x(this, H, Pe).call(this, c(this, j)[0][this.routeIndex][1][s]);
    r !== void 0 && (e[s] = /\%/.test(r) ? Be(r) : r);
  }
  return e;
}, "dt"), Pe = /* @__PURE__ */ __name(function(e) {
  return c(this, j)[1] ? c(this, j)[1][e] : e;
}, "Pe"), U = /* @__PURE__ */ new WeakMap(), Je);
var Ft = { Stringify: 1 };
var ut = /* @__PURE__ */ __name(async (e, t, s, r, n) => {
  typeof e == "object" && !(e instanceof String) && (e instanceof Promise || (e = e.toString()), e instanceof Promise && (e = await e));
  const i = e.callbacks;
  return i != null && i.length ? (n ? n[0] += e : n = [e], Promise.all(i.map((l) => l({ phase: t, buffer: n, context: r }))).then((l) => Promise.all(l.filter(Boolean).map((a) => ut(a, t, false, r, n))).then(() => n[0]))) : Promise.resolve(e);
}, "ut");
var Ut = "text/plain; charset=UTF-8";
var Me = /* @__PURE__ */ __name((e, t) => ({ "Content-Type": e, ...t }), "Me");
var we;
var ve;
var D;
var ce;
var M;
var O;
var be;
var le;
var de;
var Y;
var Ee;
var ye;
var W;
var ie;
var Ye;
var Wt = (Ye = class {
  static {
    __name(this, "Ye");
  }
  constructor(e, t) {
    g(this, W);
    g(this, we);
    g(this, ve);
    p(this, "env", {});
    g(this, D);
    p(this, "finalized", false);
    p(this, "error");
    g(this, ce);
    g(this, M);
    g(this, O);
    g(this, be);
    g(this, le);
    g(this, de);
    g(this, Y);
    g(this, Ee);
    g(this, ye);
    p(this, "render", (...e2) => (c(this, le) ?? f(this, le, (t2) => this.html(t2)), c(this, le).call(this, ...e2)));
    p(this, "setLayout", (e2) => f(this, be, e2));
    p(this, "getLayout", () => c(this, be));
    p(this, "setRenderer", (e2) => {
      f(this, le, e2);
    });
    p(this, "header", (e2, t2, s) => {
      this.finalized && f(this, O, new Response(c(this, O).body, c(this, O)));
      const r = c(this, O) ? c(this, O).headers : c(this, Y) ?? f(this, Y, new Headers());
      t2 === void 0 ? r.delete(e2) : s != null && s.append ? r.append(e2, t2) : r.set(e2, t2);
    });
    p(this, "status", (e2) => {
      f(this, ce, e2);
    });
    p(this, "set", (e2, t2) => {
      c(this, D) ?? f(this, D, /* @__PURE__ */ new Map()), c(this, D).set(e2, t2);
    });
    p(this, "get", (e2) => c(this, D) ? c(this, D).get(e2) : void 0);
    p(this, "newResponse", (...e2) => x(this, W, ie).call(this, ...e2));
    p(this, "body", (e2, t2, s) => x(this, W, ie).call(this, e2, t2, s));
    p(this, "text", (e2, t2, s) => !c(this, Y) && !c(this, ce) && !t2 && !s && !this.finalized ? new Response(e2) : x(this, W, ie).call(this, e2, t2, Me(Ut, s)));
    p(this, "json", (e2, t2, s) => x(this, W, ie).call(this, JSON.stringify(e2), t2, Me("application/json", s)));
    p(this, "html", (e2, t2, s) => {
      const r = /* @__PURE__ */ __name((n) => x(this, W, ie).call(this, n, t2, Me("text/html; charset=UTF-8", s)), "r");
      return typeof e2 == "object" ? ut(e2, Ft.Stringify, false, {}).then(r) : r(e2);
    });
    p(this, "redirect", (e2, t2) => {
      const s = String(e2);
      return this.header("Location", /[^\x00-\xFF]/.test(s) ? encodeURI(s) : s), this.newResponse(null, t2 ?? 302);
    });
    p(this, "notFound", () => (c(this, de) ?? f(this, de, () => new Response()), c(this, de).call(this, this)));
    f(this, we, e), t && (f(this, M, t.executionCtx), this.env = t.env, f(this, de, t.notFoundHandler), f(this, ye, t.path), f(this, Ee, t.matchResult));
  }
  get req() {
    return c(this, ve) ?? f(this, ve, new ct(c(this, we), c(this, ye), c(this, Ee))), c(this, ve);
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
    return c(this, O) || f(this, O, new Response(null, { headers: c(this, Y) ?? f(this, Y, new Headers()) }));
  }
  set res(e) {
    if (c(this, O) && e) {
      e = new Response(e.body, e);
      for (const [t, s] of c(this, O).headers.entries()) if (t !== "content-type") if (t === "set-cookie") {
        const r = c(this, O).headers.getSetCookie();
        e.headers.delete("set-cookie");
        for (const n of r) e.headers.append("set-cookie", n);
      } else e.headers.set(t, s);
    }
    f(this, O, e), this.finalized = true;
  }
  get var() {
    return c(this, D) ? Object.fromEntries(c(this, D)) : {};
  }
}, we = /* @__PURE__ */ new WeakMap(), ve = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap(), ce = /* @__PURE__ */ new WeakMap(), M = /* @__PURE__ */ new WeakMap(), O = /* @__PURE__ */ new WeakMap(), be = /* @__PURE__ */ new WeakMap(), le = /* @__PURE__ */ new WeakMap(), de = /* @__PURE__ */ new WeakMap(), Y = /* @__PURE__ */ new WeakMap(), Ee = /* @__PURE__ */ new WeakMap(), ye = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ new WeakSet(), ie = /* @__PURE__ */ __name(function(e, t, s) {
  const r = c(this, O) ? new Headers(c(this, O).headers) : c(this, Y) ?? new Headers();
  if (typeof t == "object" && "headers" in t) {
    const i = t.headers instanceof Headers ? t.headers : new Headers(t.headers);
    for (const [o, l] of i) o.toLowerCase() === "set-cookie" ? r.append(o, l) : r.set(o, l);
  }
  if (s) for (const [i, o] of Object.entries(s)) if (typeof o == "string") r.set(i, o);
  else {
    r.delete(i);
    for (const l of o) r.append(i, l);
  }
  const n = typeof t == "number" ? t : (t == null ? void 0 : t.status) ?? c(this, ce);
  return new Response(e, { status: n, headers: r });
}, "ie"), Ye);
var E = "ALL";
var $t = "all";
var Bt = ["get", "post", "put", "delete", "options", "patch"];
var ht = "Can not add a route since the matcher is already built.";
var ft = class extends Error {
  static {
    __name(this, "ft");
  }
};
var zt = "__COMPOSED_HANDLER";
var Vt = /* @__PURE__ */ __name((e) => e.text("404 Not Found", 404), "Vt");
var ze = /* @__PURE__ */ __name((e, t) => {
  if ("getResponse" in e) {
    const s = e.getResponse();
    return t.newResponse(s.body, s);
  }
  return console.error(e), t.text("Internal Server Error", 500);
}, "ze");
var C;
var y;
var mt;
var q;
var G;
var Se;
var Oe;
var Ke;
var pt = (Ke = class {
  static {
    __name(this, "Ke");
  }
  constructor(t = {}) {
    g(this, y);
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
    g(this, C, "/");
    p(this, "routes", []);
    g(this, q, Vt);
    p(this, "errorHandler", ze);
    p(this, "onError", (t2) => (this.errorHandler = t2, this));
    p(this, "notFound", (t2) => (f(this, q, t2), this));
    p(this, "fetch", (t2, ...s) => x(this, y, Oe).call(this, t2, s[1], s[0], t2.method));
    p(this, "request", (t2, s, r2, n2) => t2 instanceof Request ? this.fetch(s ? new Request(t2, s) : t2, r2, n2) : (t2 = t2.toString(), this.fetch(new Request(/^https?:\/\//.test(t2) ? t2 : `http://localhost${ne("/", t2)}`, s), r2, n2)));
    p(this, "fire", () => {
      addEventListener("fetch", (t2) => {
        t2.respondWith(x(this, y, Oe).call(this, t2.request, t2, void 0, t2.request.method));
      });
    });
    [...Bt, $t].forEach((i) => {
      this[i] = (o, ...l) => (typeof o == "string" ? f(this, C, o) : x(this, y, G).call(this, i, c(this, C), o), l.forEach((a) => {
        x(this, y, G).call(this, i, c(this, C), a);
      }), this);
    }), this.on = (i, o, ...l) => {
      for (const a of [o].flat()) {
        f(this, C, a);
        for (const d of [i].flat()) l.map((u) => {
          x(this, y, G).call(this, d.toUpperCase(), c(this, C), u);
        });
      }
      return this;
    }, this.use = (i, ...o) => (typeof i == "string" ? f(this, C, i) : (f(this, C, "*"), o.unshift(i)), o.forEach((l) => {
      x(this, y, G).call(this, E, c(this, C), l);
    }), this);
    const { strict: r, ...n } = t;
    Object.assign(this, n), this.getPath = r ?? true ? t.getPath ?? nt : Pt;
  }
  route(t, s) {
    const r = this.basePath(t);
    return s.routes.map((n) => {
      var o;
      let i;
      s.errorHandler === ze ? i = n.handler : (i = /* @__PURE__ */ __name(async (l, a) => (await $e([], s.errorHandler)(l, () => n.handler(l, a))).res, "i"), i[zt] = n.handler), x(o = r, y, G).call(o, n.method, n.path, i);
    }), this;
  }
  basePath(t) {
    const s = x(this, y, mt).call(this);
    return s._basePath = ne(this._basePath, t), s;
  }
  mount(t, s, r) {
    let n, i;
    r && (typeof r == "function" ? i = r : (i = r.optionHandler, r.replaceRequest === false ? n = /* @__PURE__ */ __name((a) => a, "n") : n = r.replaceRequest));
    const o = i ? (a) => {
      const d = i(a);
      return Array.isArray(d) ? d : [d];
    } : (a) => {
      let d;
      try {
        d = a.executionCtx;
      } catch {
      }
      return [a.env, d];
    };
    n || (n = (() => {
      const a = ne(this._basePath, t), d = a === "/" ? 0 : a.length;
      return (u) => {
        const h = new URL(u.url);
        return h.pathname = h.pathname.slice(d) || "/", new Request(h, u);
      };
    })());
    const l = /* @__PURE__ */ __name(async (a, d) => {
      const u = await s(n(a.req.raw), ...o(a));
      if (u) return u;
      await d();
    }, "l");
    return x(this, y, G).call(this, E, ne(t, "*"), l), this;
  }
}, C = /* @__PURE__ */ new WeakMap(), y = /* @__PURE__ */ new WeakSet(), mt = /* @__PURE__ */ __name(function() {
  const t = new pt({ router: this.router, getPath: this.getPath });
  return t.errorHandler = this.errorHandler, f(t, q, c(this, q)), t.routes = this.routes, t;
}, "mt"), q = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ __name(function(t, s, r) {
  t = t.toUpperCase(), s = ne(this._basePath, s);
  const n = { basePath: this._basePath, path: s, method: t, handler: r };
  this.router.add(t, s, [r, n]), this.routes.push(n);
}, "G"), Se = /* @__PURE__ */ __name(function(t, s) {
  if (t instanceof Error) return this.errorHandler(t, s);
  throw t;
}, "Se"), Oe = /* @__PURE__ */ __name(function(t, s, r, n) {
  if (n === "HEAD") return (async () => new Response(null, await x(this, y, Oe).call(this, t, s, r, "GET")))();
  const i = this.getPath(t, { env: r }), o = this.router.match(n, i), l = new Wt(t, { path: i, matchResult: o, env: r, executionCtx: s, notFoundHandler: c(this, q) });
  if (o[0].length === 1) {
    let d;
    try {
      d = o[0][0][0][0](l, async () => {
        l.res = await c(this, q).call(this, l);
      });
    } catch (u) {
      return x(this, y, Se).call(this, u, l);
    }
    return d instanceof Promise ? d.then((u) => u || (l.finalized ? l.res : c(this, q).call(this, l))).catch((u) => x(this, y, Se).call(this, u, l)) : d ?? c(this, q).call(this, l);
  }
  const a = $e(o[0], this.errorHandler, c(this, q));
  return (async () => {
    try {
      const d = await a(l);
      if (!d.finalized) throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");
      return d.res;
    } catch (d) {
      return x(this, y, Se).call(this, d, l);
    }
  })();
}, "Oe"), Ke);
var je = "[^/]+";
var ge = ".*";
var xe = "(?:|/.*)";
var ae = Symbol();
var Gt = new Set(".\\+*[^]$()");
function Jt(e, t) {
  return e.length === 1 ? t.length === 1 ? e < t ? -1 : 1 : -1 : t.length === 1 || e === ge || e === xe ? 1 : t === ge || t === xe ? -1 : e === je ? 1 : t === je ? -1 : e.length === t.length ? e < t ? -1 : 1 : t.length - e.length;
}
__name(Jt, "Jt");
var K;
var Q;
var I;
var Qe;
var Le = (Qe = class {
  static {
    __name(this, "Qe");
  }
  constructor() {
    g(this, K);
    g(this, Q);
    g(this, I, /* @__PURE__ */ Object.create(null));
  }
  insert(t, s, r, n, i) {
    if (t.length === 0) {
      if (c(this, K) !== void 0) throw ae;
      if (i) return;
      f(this, K, s);
      return;
    }
    const [o, ...l] = t, a = o === "*" ? l.length === 0 ? ["", "", ge] : ["", "", je] : o === "/*" ? ["", "", xe] : o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let d;
    if (a) {
      const u = a[1];
      let h = a[2] || je;
      if (u && a[2] && (h === ".*" || (h = h.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:"), /\((?!\?:)/.test(h)))) throw ae;
      if (d = c(this, I)[h], !d) {
        if (Object.keys(c(this, I)).some((m) => m !== ge && m !== xe)) throw ae;
        if (i) return;
        d = c(this, I)[h] = new Le(), u !== "" && f(d, Q, n.varIndex++);
      }
      !i && u !== "" && r.push([u, c(d, Q)]);
    } else if (d = c(this, I)[o], !d) {
      if (Object.keys(c(this, I)).some((u) => u.length > 1 && u !== ge && u !== xe)) throw ae;
      if (i) return;
      d = c(this, I)[o] = new Le();
    }
    d.insert(l, s, r, n, i);
  }
  buildRegExpStr() {
    const s = Object.keys(c(this, I)).sort(Jt).map((r) => {
      const n = c(this, I)[r];
      return (typeof c(n, Q) == "number" ? `(${r})@${c(n, Q)}` : Gt.has(r) ? `\\${r}` : r) + n.buildRegExpStr();
    });
    return typeof c(this, K) == "number" && s.unshift(`#${c(this, K)}`), s.length === 0 ? "" : s.length === 1 ? s[0] : "(?:" + s.join("|") + ")";
  }
}, K = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), I = /* @__PURE__ */ new WeakMap(), Qe);
var Ae;
var _e;
var Xe;
var Yt = (Xe = class {
  static {
    __name(this, "Xe");
  }
  constructor() {
    g(this, Ae, { varIndex: 0 });
    g(this, _e, new Le());
  }
  insert(e, t, s) {
    const r = [], n = [];
    for (let o = 0; ; ) {
      let l = false;
      if (e = e.replace(/\{[^}]+\}/g, (a) => {
        const d = `@\\${o}`;
        return n[o] = [d, a], o++, l = true, d;
      }), !l) break;
    }
    const i = e.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let o = n.length - 1; o >= 0; o--) {
      const [l] = n[o];
      for (let a = i.length - 1; a >= 0; a--) if (i[a].indexOf(l) !== -1) {
        i[a] = i[a].replace(l, n[o][1]);
        break;
      }
    }
    return c(this, _e).insert(i, t, r, c(this, Ae), s), r;
  }
  buildRegExp() {
    let e = c(this, _e).buildRegExpStr();
    if (e === "") return [/^$/, [], []];
    let t = 0;
    const s = [], r = [];
    return e = e.replace(/#(\d+)|@(\d+)|\.\*\$/g, (n, i, o) => i !== void 0 ? (s[++t] = Number(i), "$()") : (o !== void 0 && (r[Number(o)] = ++t), "")), [new RegExp(`^${e}`), s, r];
  }
}, Ae = /* @__PURE__ */ new WeakMap(), _e = /* @__PURE__ */ new WeakMap(), Xe);
var gt = [];
var Kt = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var Te = /* @__PURE__ */ Object.create(null);
function xt(e) {
  return Te[e] ?? (Te[e] = new RegExp(e === "*" ? "" : `^${e.replace(/\/\*$|([.\\+*[^\]$()])/g, (t, s) => s ? `\\${s}` : "(?:|/.*)")}$`));
}
__name(xt, "xt");
function Qt() {
  Te = /* @__PURE__ */ Object.create(null);
}
__name(Qt, "Qt");
function Xt(e) {
  var d;
  const t = new Yt(), s = [];
  if (e.length === 0) return Kt;
  const r = e.map((u) => [!/\*|\/:/.test(u[0]), ...u]).sort(([u, h], [m, b]) => u ? 1 : m ? -1 : h.length - b.length), n = /* @__PURE__ */ Object.create(null);
  for (let u = 0, h = -1, m = r.length; u < m; u++) {
    const [b, T, w] = r[u];
    b ? n[T] = [w.map(([S]) => [S, /* @__PURE__ */ Object.create(null)]), gt] : h++;
    let v;
    try {
      v = t.insert(T, h, b);
    } catch (S) {
      throw S === ae ? new ft(T) : S;
    }
    b || (s[h] = w.map(([S, se]) => {
      const fe = /* @__PURE__ */ Object.create(null);
      for (se -= 1; se >= 0; se--) {
        const [N, Ie] = v[se];
        fe[N] = Ie;
      }
      return [S, fe];
    }));
  }
  const [i, o, l] = t.buildRegExp();
  for (let u = 0, h = s.length; u < h; u++) for (let m = 0, b = s[u].length; m < b; m++) {
    const T = (d = s[u][m]) == null ? void 0 : d[1];
    if (!T) continue;
    const w = Object.keys(T);
    for (let v = 0, S = w.length; v < S; v++) T[w[v]] = l[T[w[v]]];
  }
  const a = [];
  for (const u in o) a[u] = s[o[u]];
  return [i, a, n];
}
__name(Xt, "Xt");
function re(e, t) {
  if (e) {
    for (const s of Object.keys(e).sort((r, n) => n.length - r.length)) if (xt(s).test(t)) return [...e[s]];
  }
}
__name(re, "re");
var $;
var B;
var he;
var wt;
var vt;
var Ze;
var Zt = (Ze = class {
  static {
    __name(this, "Ze");
  }
  constructor() {
    g(this, he);
    p(this, "name", "RegExpRouter");
    g(this, $);
    g(this, B);
    f(this, $, { [E]: /* @__PURE__ */ Object.create(null) }), f(this, B, { [E]: /* @__PURE__ */ Object.create(null) });
  }
  add(e, t, s) {
    var l;
    const r = c(this, $), n = c(this, B);
    if (!r || !n) throw new Error(ht);
    r[e] || [r, n].forEach((a) => {
      a[e] = /* @__PURE__ */ Object.create(null), Object.keys(a[E]).forEach((d) => {
        a[e][d] = [...a[E][d]];
      });
    }), t === "/*" && (t = "*");
    const i = (t.match(/\/:/g) || []).length;
    if (/\*$/.test(t)) {
      const a = xt(t);
      e === E ? Object.keys(r).forEach((d) => {
        var u;
        (u = r[d])[t] || (u[t] = re(r[d], t) || re(r[E], t) || []);
      }) : (l = r[e])[t] || (l[t] = re(r[e], t) || re(r[E], t) || []), Object.keys(r).forEach((d) => {
        (e === E || e === d) && Object.keys(r[d]).forEach((u) => {
          a.test(u) && r[d][u].push([s, i]);
        });
      }), Object.keys(n).forEach((d) => {
        (e === E || e === d) && Object.keys(n[d]).forEach((u) => a.test(u) && n[d][u].push([s, i]));
      });
      return;
    }
    const o = it(t) || [t];
    for (let a = 0, d = o.length; a < d; a++) {
      const u = o[a];
      Object.keys(n).forEach((h) => {
        var m;
        (e === E || e === h) && ((m = n[h])[u] || (m[u] = [...re(r[h], u) || re(r[E], u) || []]), n[h][u].push([s, i - d + a + 1]));
      });
    }
  }
  match(e, t) {
    Qt();
    const s = x(this, he, wt).call(this);
    return this.match = (r, n) => {
      const i = s[r] || s[E], o = i[2][n];
      if (o) return o;
      const l = n.match(i[0]);
      if (!l) return [[], gt];
      const a = l.indexOf("", 1);
      return [i[1][a], l];
    }, this.match(e, t);
  }
}, $ = /* @__PURE__ */ new WeakMap(), B = /* @__PURE__ */ new WeakMap(), he = /* @__PURE__ */ new WeakSet(), wt = /* @__PURE__ */ __name(function() {
  const e = /* @__PURE__ */ Object.create(null);
  return Object.keys(c(this, B)).concat(Object.keys(c(this, $))).forEach((t) => {
    e[t] || (e[t] = x(this, he, vt).call(this, t));
  }), f(this, $, f(this, B, void 0)), e;
}, "wt"), vt = /* @__PURE__ */ __name(function(e) {
  const t = [];
  let s = e === E;
  return [c(this, $), c(this, B)].forEach((r) => {
    const n = r[e] ? Object.keys(r[e]).map((i) => [i, r[e][i]]) : [];
    n.length !== 0 ? (s || (s = true), t.push(...n)) : e !== E && t.push(...Object.keys(r[E]).map((i) => [i, r[E][i]]));
  }), s ? Xt(t) : null;
}, "vt"), Ze);
var z;
var P;
var et;
var es = (et = class {
  static {
    __name(this, "et");
  }
  constructor(e) {
    p(this, "name", "SmartRouter");
    g(this, z, []);
    g(this, P, []);
    f(this, z, e.routers);
  }
  add(e, t, s) {
    if (!c(this, P)) throw new Error(ht);
    c(this, P).push([e, t, s]);
  }
  match(e, t) {
    if (!c(this, P)) throw new Error("Fatal error");
    const s = c(this, z), r = c(this, P), n = s.length;
    let i = 0, o;
    for (; i < n; i++) {
      const l = s[i];
      try {
        for (let a = 0, d = r.length; a < d; a++) l.add(...r[a]);
        o = l.match(e, t);
      } catch (a) {
        if (a instanceof ft) continue;
        throw a;
      }
      this.match = l.match.bind(l), f(this, z, [l]), f(this, P, void 0);
      break;
    }
    if (i === n) throw new Error("Fatal error");
    return this.name = `SmartRouter + ${this.activeRouter.name}`, o;
  }
  get activeRouter() {
    if (c(this, P) || c(this, z).length !== 1) throw new Error("No active router has been determined yet.");
    return c(this, z)[0];
  }
}, z = /* @__PURE__ */ new WeakMap(), P = /* @__PURE__ */ new WeakMap(), et);
var me = /* @__PURE__ */ Object.create(null);
var V;
var R;
var X;
var ue;
var _;
var L;
var J;
var tt;
var bt = (tt = class {
  static {
    __name(this, "tt");
  }
  constructor(e, t, s) {
    g(this, L);
    g(this, V);
    g(this, R);
    g(this, X);
    g(this, ue, 0);
    g(this, _, me);
    if (f(this, R, s || /* @__PURE__ */ Object.create(null)), f(this, V, []), e && t) {
      const r = /* @__PURE__ */ Object.create(null);
      r[e] = { handler: t, possibleKeys: [], score: 0 }, f(this, V, [r]);
    }
    f(this, X, []);
  }
  insert(e, t, s) {
    f(this, ue, ++We(this, ue)._);
    let r = this;
    const n = It(t), i = [];
    for (let o = 0, l = n.length; o < l; o++) {
      const a = n[o], d = n[o + 1], u = Dt(a, d), h = Array.isArray(u) ? u[0] : a;
      if (h in c(r, R)) {
        r = c(r, R)[h], u && i.push(u[1]);
        continue;
      }
      c(r, R)[h] = new bt(), u && (c(r, X).push(u), i.push(u[1])), r = c(r, R)[h];
    }
    return c(r, V).push({ [e]: { handler: s, possibleKeys: i.filter((o, l, a) => a.indexOf(o) === l), score: c(this, ue) } }), r;
  }
  search(e, t) {
    var l;
    const s = [];
    f(this, _, me);
    let n = [this];
    const i = rt(t), o = [];
    for (let a = 0, d = i.length; a < d; a++) {
      const u = i[a], h = a === d - 1, m = [];
      for (let b = 0, T = n.length; b < T; b++) {
        const w = n[b], v = c(w, R)[u];
        v && (f(v, _, c(w, _)), h ? (c(v, R)["*"] && s.push(...x(this, L, J).call(this, c(v, R)["*"], e, c(w, _))), s.push(...x(this, L, J).call(this, v, e, c(w, _)))) : m.push(v));
        for (let S = 0, se = c(w, X).length; S < se; S++) {
          const fe = c(w, X)[S], N = c(w, _) === me ? {} : { ...c(w, _) };
          if (fe === "*") {
            const F = c(w, R)["*"];
            F && (s.push(...x(this, L, J).call(this, F, e, c(w, _))), f(F, _, N), m.push(F));
            continue;
          }
          const [Ie, Fe, pe] = fe;
          if (!u && !(pe instanceof RegExp)) continue;
          const k = c(w, R)[Ie], _t = i.slice(a).join("/");
          if (pe instanceof RegExp) {
            const F = pe.exec(_t);
            if (F) {
              if (N[Fe] = F[0], s.push(...x(this, L, J).call(this, k, e, c(w, _), N)), Object.keys(c(k, R)).length) {
                f(k, _, N);
                const Ne = ((l = F[0].match(/\//)) == null ? void 0 : l.length) ?? 0;
                (o[Ne] || (o[Ne] = [])).push(k);
              }
              continue;
            }
          }
          (pe === true || pe.test(u)) && (N[Fe] = u, h ? (s.push(...x(this, L, J).call(this, k, e, N, c(w, _))), c(k, R)["*"] && s.push(...x(this, L, J).call(this, c(k, R)["*"], e, N, c(w, _)))) : (f(k, _, N), m.push(k)));
        }
      }
      n = m.concat(o.shift() ?? []);
    }
    return s.length > 1 && s.sort((a, d) => a.score - d.score), [s.map(({ handler: a, params: d }) => [a, d])];
  }
}, V = /* @__PURE__ */ new WeakMap(), R = /* @__PURE__ */ new WeakMap(), X = /* @__PURE__ */ new WeakMap(), ue = /* @__PURE__ */ new WeakMap(), _ = /* @__PURE__ */ new WeakMap(), L = /* @__PURE__ */ new WeakSet(), J = /* @__PURE__ */ __name(function(e, t, s, r) {
  const n = [];
  for (let i = 0, o = c(e, V).length; i < o; i++) {
    const l = c(e, V)[i], a = l[t] || l[E], d = {};
    if (a !== void 0 && (a.params = /* @__PURE__ */ Object.create(null), n.push(a), s !== me || r && r !== me)) for (let u = 0, h = a.possibleKeys.length; u < h; u++) {
      const m = a.possibleKeys[u], b = d[a.score];
      a.params[m] = r != null && r[m] && !b ? r[m] : s[m] ?? (r == null ? void 0 : r[m]), d[a.score] = true;
    }
  }
  return n;
}, "J"), tt);
var Z;
var st;
var ts = (st = class {
  static {
    __name(this, "st");
  }
  constructor() {
    p(this, "name", "TrieRouter");
    g(this, Z);
    f(this, Z, new bt());
  }
  add(e, t, s) {
    const r = it(t);
    if (r) {
      for (let n = 0, i = r.length; n < i; n++) c(this, Z).insert(e, r[n], s);
      return;
    }
    c(this, Z).insert(e, t, s);
  }
  match(e, t) {
    return c(this, Z).search(e, t);
  }
}, Z = /* @__PURE__ */ new WeakMap(), st);
var Ce = class extends pt {
  static {
    __name(this, "Ce");
  }
  constructor(e = {}) {
    super(e), this.router = e.router ?? new es({ routers: [new Zt(), new ts()] });
  }
};
var ss = /* @__PURE__ */ __name((e) => {
  const s = { ...{ origin: "*", allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"], allowHeaders: [], exposeHeaders: [] }, ...e }, r = /* @__PURE__ */ ((i) => typeof i == "string" ? i === "*" ? () => i : (o) => i === o ? o : null : typeof i == "function" ? i : (o) => i.includes(o) ? o : null)(s.origin), n = ((i) => typeof i == "function" ? i : Array.isArray(i) ? () => i : () => [])(s.allowMethods);
  return async function(o, l) {
    var u;
    function a(h, m) {
      o.res.headers.set(h, m);
    }
    __name(a, "a");
    const d = await r(o.req.header("origin") || "", o);
    if (d && a("Access-Control-Allow-Origin", d), s.origin !== "*") {
      const h = o.req.header("Vary");
      h ? a("Vary", h) : a("Vary", "Origin");
    }
    if (s.credentials && a("Access-Control-Allow-Credentials", "true"), (u = s.exposeHeaders) != null && u.length && a("Access-Control-Expose-Headers", s.exposeHeaders.join(",")), o.req.method === "OPTIONS") {
      s.maxAge != null && a("Access-Control-Max-Age", s.maxAge.toString());
      const h = await n(o.req.header("origin") || "", o);
      h.length && a("Access-Control-Allow-Methods", h.join(","));
      let m = s.allowHeaders;
      if (!(m != null && m.length)) {
        const b = o.req.header("Access-Control-Request-Headers");
        b && (m = b.split(/\s*,\s*/));
      }
      return m != null && m.length && (a("Access-Control-Allow-Headers", m.join(",")), o.res.headers.append("Vary", "Access-Control-Request-Headers")), o.res.headers.delete("Content-Length"), o.res.headers.delete("Content-Type"), new Response(null, { headers: o.res.headers, status: 204, statusText: "No Content" });
    }
    await l();
  };
}, "ss");
var rs = /^\s*(?:text\/(?!event-stream(?:[;\s]|$))[^;\s]+|application\/(?:javascript|json|xml|xml-dtd|ecmascript|dart|postscript|rtf|tar|toml|vnd\.dart|vnd\.ms-fontobject|vnd\.ms-opentype|wasm|x-httpd-php|x-javascript|x-ns-proxy-autoconfig|x-sh|x-tar|x-virtualbox-hdd|x-virtualbox-ova|x-virtualbox-ovf|x-virtualbox-vbox|x-virtualbox-vdi|x-virtualbox-vhd|x-virtualbox-vmdk|x-www-form-urlencoded)|font\/(?:otf|ttf)|image\/(?:bmp|vnd\.adobe\.photoshop|vnd\.microsoft\.icon|vnd\.ms-dds|x-icon|x-ms-bmp)|message\/rfc822|model\/gltf-binary|x-shader\/x-fragment|x-shader\/x-vertex|[^;\s]+?\+(?:json|text|xml|yaml))(?:[;\s]|$)/i;
var Ve = /* @__PURE__ */ __name((e, t = is) => {
  const s = /\.([a-zA-Z0-9]+?)$/, r = e.match(s);
  if (!r) return;
  let n = t[r[1]];
  return n && n.startsWith("text") && (n += "; charset=utf-8"), n;
}, "Ve");
var ns = { aac: "audio/aac", avi: "video/x-msvideo", avif: "image/avif", av1: "video/av1", bin: "application/octet-stream", bmp: "image/bmp", css: "text/css", csv: "text/csv", eot: "application/vnd.ms-fontobject", epub: "application/epub+zip", gif: "image/gif", gz: "application/gzip", htm: "text/html", html: "text/html", ico: "image/x-icon", ics: "text/calendar", jpeg: "image/jpeg", jpg: "image/jpeg", js: "text/javascript", json: "application/json", jsonld: "application/ld+json", map: "application/json", mid: "audio/x-midi", midi: "audio/x-midi", mjs: "text/javascript", mp3: "audio/mpeg", mp4: "video/mp4", mpeg: "video/mpeg", oga: "audio/ogg", ogv: "video/ogg", ogx: "application/ogg", opus: "audio/opus", otf: "font/otf", pdf: "application/pdf", png: "image/png", rtf: "application/rtf", svg: "image/svg+xml", tif: "image/tiff", tiff: "image/tiff", ts: "video/mp2t", ttf: "font/ttf", txt: "text/plain", wasm: "application/wasm", webm: "video/webm", weba: "audio/webm", webmanifest: "application/manifest+json", webp: "image/webp", woff: "font/woff", woff2: "font/woff2", xhtml: "application/xhtml+xml", xml: "application/xml", zip: "application/zip", "3gp": "video/3gpp", "3g2": "video/3gpp2", gltf: "model/gltf+json", glb: "model/gltf-binary" };
var is = ns;
var as = /* @__PURE__ */ __name((...e) => {
  let t = e.filter((n) => n !== "").join("/");
  t = t.replace(new RegExp("(?<=\\/)\\/+", "g"), "");
  const s = t.split("/"), r = [];
  for (const n of s) n === ".." && r.length > 0 && r.at(-1) !== ".." ? r.pop() : n !== "." && r.push(n);
  return r.join("/") || ".";
}, "as");
var Et = { br: ".br", zstd: ".zst", gzip: ".gz" };
var os = Object.keys(Et);
var cs = "index.html";
var ls = /* @__PURE__ */ __name((e) => {
  const t = e.root ?? "./", s = e.path, r = e.join ?? as;
  return async (n, i) => {
    var u, h, m, b;
    if (n.finalized) return i();
    let o;
    if (e.path) o = e.path;
    else try {
      if (o = decodeURIComponent(n.req.path), /(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(o)) throw new Error();
    } catch {
      return await ((u = e.onNotFound) == null ? void 0 : u.call(e, n.req.path, n)), i();
    }
    let l = r(t, !s && e.rewriteRequestPath ? e.rewriteRequestPath(o) : o);
    e.isDir && await e.isDir(l) && (l = r(l, cs));
    const a = e.getContent;
    let d = await a(l, n);
    if (d instanceof Response) return n.newResponse(d.body, d);
    if (d) {
      const T = e.mimes && Ve(l, e.mimes) || Ve(l);
      if (n.header("Content-Type", T || "application/octet-stream"), e.precompressed && (!T || rs.test(T))) {
        const w = new Set((h = n.req.header("Accept-Encoding")) == null ? void 0 : h.split(",").map((v) => v.trim()));
        for (const v of os) {
          if (!w.has(v)) continue;
          const S = await a(l + Et[v], n);
          if (S) {
            d = S, n.header("Content-Encoding", v), n.header("Vary", "Accept-Encoding", { append: true });
            break;
          }
        }
      }
      return await ((m = e.onFound) == null ? void 0 : m.call(e, l, n)), n.body(d);
    }
    await ((b = e.onNotFound) == null ? void 0 : b.call(e, l, n)), await i();
  };
}, "ls");
var ds = /* @__PURE__ */ __name(async (e, t) => {
  let s;
  t && t.manifest ? typeof t.manifest == "string" ? s = JSON.parse(t.manifest) : s = t.manifest : typeof __STATIC_CONTENT_MANIFEST == "string" ? s = JSON.parse(__STATIC_CONTENT_MANIFEST) : s = __STATIC_CONTENT_MANIFEST;
  let r;
  t && t.namespace ? r = t.namespace : r = __STATIC_CONTENT;
  const n = s[e] || e;
  if (!n) return null;
  const i = await r.get(n, { type: "stream" });
  return i || null;
}, "ds");
var us = /* @__PURE__ */ __name((e) => async function(s, r) {
  return ls({ ...e, getContent: /* @__PURE__ */ __name(async (i) => ds(i, { manifest: e.manifest, namespace: e.namespace ? e.namespace : s.env ? s.env.__STATIC_CONTENT : void 0 }), "getContent") })(s, r);
}, "us");
var ee = /* @__PURE__ */ __name((e) => us(e), "ee");
var te = new Ce();
te.get("/questions/category/:category", async (e) => {
  try {
    const t = e.req.param("category"), s = parseInt(e.req.query("limit") || "10"), r = parseInt(e.req.query("offset") || "0"), i = await e.env.DB.prepare(`
      SELECT id, subject, category, difficulty, question_text, 
             options, correct_answer, explanation, learning_points, tips
      FROM questions 
      WHERE subject = ? OR category = ?
      LIMIT ? OFFSET ?
    `).bind(t, t, s, r).all();
    return e.json({ success: true, category: t, questions: i.results, total: i.results.length });
  } catch (t) {
    return console.error("Error fetching questions:", t), e.json({ error: "\u554F\u984C\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
te.get("/questions/:id", async (e) => {
  try {
    const t = e.req.param("id"), r = await e.env.DB.prepare(`
      SELECT * FROM questions WHERE id = ?
    `).bind(t).first();
    return r ? (r.options = JSON.parse(r.options), r.learning_points = JSON.parse(r.learning_points), e.json({ success: true, question: r })) : e.json({ error: "\u554F\u984C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" }, 404);
  } catch (t) {
    return console.error("Error fetching question:", t), e.json({ error: "\u554F\u984C\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
te.post("/answer", async (e) => {
  try {
    const { userId: t, questionId: s, selectedAnswer: r, timeSpent: n } = await e.req.json();
    if (!t || !s || r === void 0) return e.json({ error: "\u5FC5\u8981\u306A\u30D1\u30E9\u30E1\u30FC\u30BF\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059" }, 400);
    const i = e.env.DB, o = await i.prepare(`
      SELECT correct_answer FROM questions WHERE id = ?
    `).bind(s).first();
    if (!o) return e.json({ error: "\u554F\u984C\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" }, 404);
    const l = r === o.correct_answer;
    await i.prepare(`
      INSERT INTO study_history (user_id, question_id, selected_answer, is_correct, time_spent)
      VALUES (?, ?, ?, ?, ?)
    `).bind(t, s, r, l ? 1 : 0, n || 0).run(), l || await i.prepare(`
        INSERT INTO weak_questions (user_id, question_id, incorrect_count)
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, question_id) 
        DO UPDATE SET 
          incorrect_count = incorrect_count + 1,
          last_attempted_at = CURRENT_TIMESTAMP
      `).bind(t, s).run();
    const a = await i.prepare(`
      SELECT subject FROM questions WHERE id = ?
    `).bind(s).first();
    return a && await i.prepare(`
        INSERT INTO study_progress (user_id, category, total_questions, correct_answers, incorrect_answers)
        VALUES (?, ?, 1, ?, ?)
        ON CONFLICT(user_id, category)
        DO UPDATE SET
          total_questions = total_questions + 1,
          correct_answers = correct_answers + ?,
          incorrect_answers = incorrect_answers + ?,
          last_studied_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      `).bind(t, a.subject, l ? 1 : 0, l ? 0 : 1, l ? 1 : 0, l ? 0 : 1).run(), e.json({ success: true, isCorrect: l, correctAnswer: o.correct_answer, message: l ? "\u6B63\u89E3\u3067\u3059\uFF01" : "\u4E0D\u6B63\u89E3\u3067\u3059\u3002\u5FA9\u7FD2\u3057\u307E\u3057\u3087\u3046\u3002" });
  } catch (t) {
    return console.error("Error submitting answer:", t), e.json({ error: "\u56DE\u7B54\u306E\u9001\u4FE1\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
te.post("/mock-exam/start", async (e) => {
  try {
    const { userId: t, examType: s = "full" } = await e.req.json();
    if (!t) return e.json({ error: "\u30E6\u30FC\u30B6\u30FCID\u304C\u5FC5\u8981\u3067\u3059" }, 400);
    const r = e.env.DB, n = s === "full" ? 50 : s === "mini" ? 25 : 10, i = await r.prepare(`
      SELECT id, subject, category, difficulty, question_text, 
             options, correct_answer, estimated_time
      FROM questions
      ORDER BY RANDOM()
      LIMIT ?
    `).bind(n).all(), o = i.results.map((d) => d.id), l = await r.prepare(`
      INSERT INTO mock_exam_sessions 
      (user_id, exam_type, total_questions, correct_answers, time_spent, score, questions_data, started_at)
      VALUES (?, ?, ?, 0, 0, 0, ?, CURRENT_TIMESTAMP)
    `).bind(t, s, n, JSON.stringify(o)).run(), a = i.results.map((d) => ({ ...d, options: JSON.parse(d.options) }));
    return e.json({ success: true, sessionId: l.meta.last_row_id, examType: s, questions: a, timeLimit: s === "full" ? 7200 : s === "mini" ? 3600 : 1800 });
  } catch (t) {
    return console.error("Error starting mock exam:", t), e.json({ error: "\u6A21\u64EC\u8A66\u9A13\u306E\u958B\u59CB\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
te.post("/mock-exam/submit", async (e) => {
  try {
    const { sessionId: t, answers: s, timeSpent: r } = await e.req.json();
    if (!t || !s) return e.json({ error: "\u5FC5\u8981\u306A\u30D1\u30E9\u30E1\u30FC\u30BF\u304C\u4E0D\u8DB3\u3057\u3066\u3044\u307E\u3059" }, 400);
    const n = e.env.DB, i = await n.prepare(`
      SELECT * FROM mock_exam_sessions WHERE id = ?
    `).bind(t).first();
    if (!i) return e.json({ error: "\u30BB\u30C3\u30B7\u30E7\u30F3\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" }, 404);
    let o = 0;
    const l = JSON.parse(i.questions_data);
    for (const [d, u] of Object.entries(s)) {
      const h = await n.prepare(`
        SELECT correct_answer FROM questions WHERE id = ?
      `).bind(d).first();
      h && h.correct_answer === u && o++;
    }
    const a = o / i.total_questions * 100;
    return await n.prepare(`
      UPDATE mock_exam_sessions 
      SET correct_answers = ?, time_spent = ?, score = ?, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(o, r, a, t).run(), await n.prepare(`
      INSERT INTO mock_exam_results (user_id, score, total_questions, time_taken_seconds, exam_date)
      VALUES ((SELECT user_id FROM mock_exam_sessions WHERE id = ?), ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(t, Math.round(a), i.total_questions, r).run(), e.json({ success: true, result: { totalQuestions: i.total_questions, correctAnswers: o, incorrectAnswers: i.total_questions - o, score: Math.round(a), timeSpent: r, passed: a >= 70 } });
  } catch (t) {
    return console.error("Error submitting mock exam:", t), e.json({ error: "\u6A21\u64EC\u8A66\u9A13\u306E\u63D0\u51FA\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
te.get("/statistics/:userId", async (e) => {
  try {
    const t = e.req.param("userId"), s = e.env.DB, r = await s.prepare(`
      SELECT category, total_questions, correct_answers, incorrect_answers,
             ROUND(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100, 1) as accuracy_rate
      FROM study_progress
      WHERE user_id = ?
      ORDER BY category
    `).bind(t).all(), n = await s.prepare(`
      SELECT score, total_questions, time_taken_seconds, exam_date
      FROM mock_exam_results
      WHERE user_id = ?
      ORDER BY exam_date DESC
      LIMIT 10
    `).bind(t).all(), i = await s.prepare(`
      SELECT wq.question_id, wq.incorrect_count, q.category, q.question_text
      FROM weak_questions wq
      JOIN questions q ON wq.question_id = q.id
      WHERE wq.user_id = ?
      ORDER BY wq.incorrect_count DESC
      LIMIT 10
    `).bind(t).all(), o = await s.prepare(`
      SELECT 
        SUM(total_questions) as total_studied,
        SUM(correct_answers) as total_correct,
        ROUND(AVG(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100), 1) as overall_accuracy
      FROM study_progress
      WHERE user_id = ?
    `).bind(t).first();
    return e.json({ success: true, statistics: { overall: o, categoryProgress: r.results, mockExamHistory: n.results, weakAreas: i.results } });
  } catch (t) {
    return console.error("Error fetching statistics:", t), e.json({ error: "\u7D71\u8A08\u60C5\u5831\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
var qe = new Ce();
qe.post("/analyze/weakness", async (e) => {
  try {
    const { userId: t } = await e.req.json();
    if (!t) return e.json({ error: "\u30E6\u30FC\u30B6\u30FCID\u304C\u5FC5\u8981\u3067\u3059" }, 400);
    const s = e.env.DB, r = await s.prepare(`
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
    `).bind(t).all(), n = await s.prepare(`
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
    `).bind(t).all(), i = r.results.map((u) => ({ category: u.category, priority: u.error_rate > 50 ? "high" : "medium", reason: `\u6B63\u7B54\u7387\u304C${100 - u.error_rate}%\u3068\u4F4E\u3044\u305F\u3081\u3001\u91CD\u70B9\u7684\u306A\u5FA9\u7FD2\u304C\u5FC5\u8981\u3067\u3059` })), o = await s.prepare(`
      SELECT 
        AVG(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as avg_accuracy
      FROM study_history
      WHERE user_id = ?
    `).bind(t).first(), l = (o == null ? void 0 : o.avg_accuracy) || 0, a = hs(r.results, n.results, l), d = await s.prepare(`
      INSERT INTO ai_analysis 
      (user_id, weak_categories, strength_categories, recommended_topics, 
       predicted_score, study_recommendations, next_review_date)
      VALUES (?, ?, ?, ?, ?, ?, date('now', '+7 days'))
    `).bind(t, JSON.stringify(r.results.map((u) => u.category)), JSON.stringify(n.results.map((u) => u.category)), JSON.stringify(i), l, a).run();
    return e.json({ success: true, analysis: { analysisId: d.meta.last_row_id, weakAreas: r.results, strongAreas: n.results, recommendedTopics: i, predictedScore: Math.round(l), studyRecommendations: a, nextReviewDate: new Date(Date.now() + 10080 * 60 * 1e3).toISOString() } });
  } catch (t) {
    return console.error("Error analyzing weakness:", t), e.json({ error: "AI\u5206\u6790\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
qe.get("/optimize/path/:userId", async (e) => {
  try {
    const t = e.req.param("userId"), s = e.req.query("targetDate") || new Date(Date.now() + 2160 * 60 * 60 * 1e3).toISOString(), n = await e.env.DB.prepare(`
      SELECT 
        category,
        total_questions,
        correct_answers,
        ROUND(CAST(correct_answers AS REAL) / NULLIF(total_questions, 0) * 100, 1) as accuracy_rate
      FROM study_progress
      WHERE user_id = ?
    `).bind(t).all(), i = ["\u610F\u601D\u8868\u793A", "\u4EE3\u7406", "\u6642\u52B9", "\u7269\u6A29", "\u62B5\u5F53\u6A29", "\u8CC3\u8CB8\u501F", "\u76F8\u7D9A", "\u5B85\u5EFA\u696D\u306E\u514D\u8A31", "\u5B85\u5730\u5EFA\u7269\u53D6\u5F15\u58EB", "\u91CD\u8981\u4E8B\u9805\u8AAC\u660E", "\u5951\u7D04\u66F8\u9762", "\u90FD\u5E02\u8A08\u753B\u6CD5", "\u5EFA\u7BC9\u57FA\u6E96\u6CD5", "\u56FD\u571F\u5229\u7528\u8A08\u753B\u6CD5", "\u4E0D\u52D5\u7523\u53D6\u5F97\u7A0E", "\u56FA\u5B9A\u8CC7\u7523\u7A0E", "\u6240\u5F97\u7A0E", "\u5370\u7D19\u7A0E"], o = new Set(n.results.map((d) => d.category)), l = i.filter((d) => !o.has(d)), a = ps(n.results, l, s);
    return e.json({ success: true, optimizedPath: { currentLevel: fs(n.results), targetDate: s, dailyGoals: a.dailyGoals, weeklyMilestones: a.weeklyMilestones, priorityOrder: a.priorityOrder, estimatedCompletionDate: a.estimatedCompletionDate } });
  } catch (t) {
    return console.error("Error optimizing path:", t), e.json({ error: "\u5B66\u7FD2\u30D1\u30B9\u306E\u6700\u9069\u5316\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
qe.get("/recommend/questions/:userId", async (e) => {
  try {
    const t = e.req.param("userId"), s = parseInt(e.req.query("count") || "10"), r = e.env.DB, n = await r.prepare(`
      SELECT question_id, incorrect_count
      FROM weak_questions
      WHERE user_id = ?
      ORDER BY incorrect_count DESC
      LIMIT 20
    `).bind(t).all(), i = await r.prepare(`
      SELECT DISTINCT question_id
      FROM study_history
      WHERE user_id = ? AND is_correct = 0
      ORDER BY studied_at DESC
      LIMIT 10
    `).bind(t).all(), o = await r.prepare(`
      SELECT id
      FROM questions
      WHERE id NOT IN (
        SELECT question_id FROM study_history WHERE user_id = ?
      )
      ORDER BY RANDOM()
      LIMIT ?
    `).bind(t, Math.floor(s / 3)).all(), l = /* @__PURE__ */ new Set();
    n.results.slice(0, Math.ceil(s / 3)).forEach((d) => {
      l.add(d.question_id);
    }), i.results.slice(0, Math.ceil(s / 3)).forEach((d) => {
      l.add(d.question_id);
    }), o.results.forEach((d) => {
      l.add(d.id);
    });
    const a = [];
    for (const d of Array.from(l).slice(0, s)) {
      const u = await r.prepare(`
        SELECT id, subject, category, difficulty, question_text, options
        FROM questions
        WHERE id = ?
      `).bind(d).first();
      u && (u.options = JSON.parse(u.options), a.push(u));
    }
    return e.json({ success: true, recommendations: { questions: a, reason: "\u82E6\u624B\u5206\u91CE\u306E\u514B\u670D\u3068\u65B0\u898F\u5B66\u7FD2\u306E\u30D0\u30E9\u30F3\u30B9\u3092\u8003\u616E\u3057\u305F\u554F\u984C\u30BB\u30C3\u30C8\u3067\u3059", focusAreas: Array.from(new Set(a.map((d) => d.category))) } });
  } catch (t) {
    return console.error("Error recommending questions:", t), e.json({ error: "\u554F\u984C\u63A8\u85A6\u306B\u5931\u6557\u3057\u307E\u3057\u305F" }, 500);
  }
});
function hs(e, t, s) {
  const r = [];
  if (s < 50 ? r.push("\u57FA\u790E\u304B\u3089\u306E\u5FA9\u7FD2\u304C\u5FC5\u8981\u3067\u3059\u3002\u307E\u305A\u306F\u5404\u30AB\u30C6\u30B4\u30EA\u30FC\u306E\u57FA\u672C\u554F\u984C\u304B\u3089\u59CB\u3081\u307E\u3057\u3087\u3046\u3002") : s < 70 ? r.push("\u5408\u683C\u30E9\u30A4\u30F3\u306B\u8FD1\u3065\u3044\u3066\u3044\u307E\u3059\u3002\u82E6\u624B\u5206\u91CE\u3092\u91CD\u70B9\u7684\u306B\u5B66\u7FD2\u3057\u307E\u3057\u3087\u3046\u3002") : r.push("\u826F\u597D\u306A\u6210\u7E3E\u3067\u3059\u3002\u3055\u3089\u306A\u308B\u5411\u4E0A\u306E\u305F\u3081\u3001\u5FDC\u7528\u554F\u984C\u306B\u3082\u6311\u6226\u3057\u307E\u3057\u3087\u3046\u3002"), e.length > 0) {
    const n = e[0];
    r.push(`\u7279\u306B\u300C${n.category}\u300D\u306E\u6B63\u7B54\u7387\u304C\u4F4E\u3044\u305F\u3081\u3001\u3053\u306E\u5206\u91CE\u306E\u5FA9\u7FD2\u3092\u512A\u5148\u3057\u3066\u304F\u3060\u3055\u3044\u3002`);
  }
  if (t.length > 0) {
    const n = t[0];
    r.push(`\u300C${n.category}\u300D\u306F\u5F97\u610F\u5206\u91CE\u3067\u3059\u3002\u3053\u306E\u8ABF\u5B50\u3092\u7DAD\u6301\u3057\u306A\u304C\u3089\u4ED6\u306E\u5206\u91CE\u3082\u5F37\u5316\u3057\u307E\u3057\u3087\u3046\u3002`);
  }
  return r.push("\u6BCE\u65E530\u5206\u4EE5\u4E0A\u306E\u5B66\u7FD2\u6642\u9593\u3092\u78BA\u4FDD\u3057\u3001\u7D99\u7D9A\u7684\u306B\u53D6\u308A\u7D44\u3080\u3053\u3068\u304C\u91CD\u8981\u3067\u3059\u3002"), r.join(" ");
}
__name(hs, "hs");
function fs(e) {
  if (e.length === 0) return "\u521D\u7D1A";
  const t = e.reduce((r, n) => r + (n.accuracy_rate || 0), 0) / e.length;
  return e.reduce((r, n) => r + n.total_questions, 0) < 50 || t < 50 ? "\u521D\u7D1A" : t < 70 ? "\u4E2D\u7D1A" : "\u4E0A\u7D1A";
}
__name(fs, "fs");
function ps(e, t, s) {
  const r = Math.floor((new Date(s).getTime() - Date.now()) / 864e5), n = { questions: Math.max(10, Math.floor(402 / r)), studyTime: 60, reviewTime: 30 }, i = [], o = Math.floor(r / 7);
  for (let a = 1; a <= Math.min(o, 12); a++) i.push({ week: a, targetQuestions: n.questions * 7 * a, targetAccuracy: Math.min(70 + a * 2, 90), focusCategories: t.slice((a - 1) * 2, a * 2) });
  const l = [...t, ...e.filter((a) => a.accuracy_rate < 70).sort((a, d) => a.accuracy_rate - d.accuracy_rate).map((a) => a.category)];
  return { dailyGoals: n, weeklyMilestones: i, priorityOrder: l, estimatedCompletionDate: new Date(Date.now() + 402 / n.questions * 24 * 60 * 60 * 1e3).toISOString() };
}
__name(ps, "ps");
var A = new Ce();
A.use("/api/*", ss());
A.route("/api/study", te);
A.route("/api/ai", qe);
A.use("/static/*", ee({ root: "./public" }));
A.get("/sw.js", ee({ root: "./public", path: "/sw.js" }));
A.get("/manifest.json", ee({ root: "./public", path: "/manifest.json" }));
A.use("/icons/*", ee({ root: "./public" }));
A.use("/manifest.json", ee({ root: "./public" }));
A.use("/sw.js", ee({ root: "./public" }));
A.use("/icons/*", ee({ root: "./public" }));
A.get("/", (e) => e.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>\u5B85\u5EFABOOST - AI\u642D\u8F09\u5B85\u5EFA\u8A66\u9A13\u5B66\u7FD2\u30A2\u30D7\u30EA</title>
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#764ba2">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="\u5B85\u5EFABOOST">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="\u5B85\u5EFABOOST">
    <meta name="msapplication-TileColor" content="#764ba2">
    <meta name="msapplication-navbutton-color" content="#764ba2">
    <meta name="msapplication-starturl" content="/">
    
    <!-- PWA Links -->
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
    <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#764ba2">
    
    <!-- Styles -->
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap');
        
        * {
            font-family: 'Noto Sans JP', sans-serif;
        }
        
        /* \u30B0\u30E9\u30C7\u30FC\u30B7\u30E7\u30F3\u80CC\u666F\u30A2\u30CB\u30E1\u30FC\u30B7\u30E7\u30F3 */
        body {
            background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* \u30B0\u30E9\u30B9\u30E2\u30FC\u30D5\u30A3\u30BA\u30E0\u52B9\u679C */
        .glass-card {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            transition: all 0.3s ease;
        }
        
        .glass-card:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 15px 35px 0 rgba(31, 38, 135, 0.5);
        }
        
        /* \u30D1\u30EB\u30B9\u30A2\u30CB\u30E1\u30FC\u30B7\u30E7\u30F3 */
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        .pulse-animation {
            animation: pulse 2s ease-in-out infinite;
        }
        
        /* 3D\u30AB\u30FC\u30C9\u52B9\u679C */
        .card-3d {
            transform-style: preserve-3d;
            transition: transform 0.6s;
        }
        
        .card-3d:hover {
            transform: rotateY(5deg) rotateX(5deg);
        }
        
        /* \u30CD\u30AA\u30F3\u30C6\u30AD\u30B9\u30C8\u52B9\u679C */
        .neon-text {
            text-shadow: 
                0 0 10px rgba(255, 255, 255, 0.8),
                0 0 20px rgba(255, 255, 255, 0.8),
                0 0 30px rgba(118, 75, 162, 0.8),
                0 0 40px rgba(118, 75, 162, 0.8);
        }
        
        /* \u30D1\u30FC\u30C6\u30A3\u30AF\u30EB\u80CC\u666F */
        #particles-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        }
        
        /* \u30D5\u30ED\u30FC\u30C6\u30A3\u30F3\u30B0\u30A2\u30CB\u30E1\u30FC\u30B7\u30E7\u30F3 */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .floating {
            animation: float 4s ease-in-out infinite;
        }
        
        /* \u30B9\u30AF\u30ED\u30FC\u30EB\u30D0\u30FC\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 10px;
        }
        
        /* \u30E2\u30D0\u30A4\u30EB\u7528\u8ABF\u6574 */
        @media (max-width: 768px) {
            .glass-card {
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }
        }
        
        /* PWA\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u30DC\u30BF\u30F3 */
        .install-button {
            display: none;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .install-button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 20px rgba(118, 75, 162, 0.4);
        }
    </style>
</head>
<body>
    <!-- \u30D1\u30FC\u30C6\u30A3\u30AF\u30EB\u80CC\u666F -->
    <canvas id="particles-bg"></canvas>
    
    <!-- 3D\u30ED\u30B4\u30B3\u30F3\u30C6\u30CA -->
    <div id="logo-3d-container" class="fixed top-4 right-4 w-24 h-24 md:w-32 md:h-32 z-30"></div>
    
    <!-- \u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u30DC\u30BF\u30F3 -->
    <button id="install-btn" class="install-button fixed top-4 left-4 z-50">
        <i class="fas fa-download mr-2"></i>\u30A2\u30D7\u30EA\u3092\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB
    </button>
    
    <!-- \u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3\u30D0\u30FC -->
    <nav class="glass-card fixed top-0 left-0 right-0 z-40 p-4 md:relative md:mb-8">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <i class="fas fa-home text-white"></i>
                </div>
                <span class="text-white font-bold text-lg hidden md:inline">\u5B85\u5EFABOOST</span>
            </div>
            
            <div class="flex space-x-4">
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-user-circle text-xl"></i>
                </button>
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-cog text-xl"></i>
                </button>
                <button id="theme-toggle" class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-moon text-xl"></i>
                </button>
            </div>
        </div>
    </nav>
    
    <!-- \u30E1\u30A4\u30F3\u30B3\u30F3\u30C6\u30F3\u30C4 -->
    <div class="container mx-auto px-4 py-20 md:py-8 relative z-10">
        <!-- \u30D2\u30FC\u30ED\u30FC\u30BB\u30AF\u30B7\u30E7\u30F3 -->
        <header class="text-center mb-12 floating">
            <h1 class="text-5xl md:text-7xl font-black text-white mb-4 neon-text">
                \u5B85\u5EFABOOST
            </h1>
            <p class="text-xl md:text-2xl text-white/90 mb-8">
                AI\u642D\u8F09\u6B21\u4E16\u4EE3\u5B66\u7FD2\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0
            </p>
            
            <!-- \u30B9\u30C6\u30FC\u30BF\u30B9\u30AB\u30FC\u30C9 -->
            <div class="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div class="glass-card rounded-xl p-4">
                    <div class="text-3xl font-bold text-white">402</div>
                    <div class="text-xs text-white/70">\u554F\u984C\u6570</div>
                </div>
                <div class="glass-card rounded-xl p-4">
                    <div class="text-3xl font-bold text-white">98%</div>
                    <div class="text-xs text-white/70">\u5408\u683C\u7387</div>
                </div>
                <div class="glass-card rounded-xl p-4">
                    <div class="text-3xl font-bold text-white">AI</div>
                    <div class="text-xs text-white/70">\u5206\u6790\u642D\u8F09</div>
                </div>
            </div>
        </header>
        
        <!-- \u30E1\u30A4\u30F3\u6A5F\u80FD\u30AB\u30FC\u30C9 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <!-- \u30AB\u30C6\u30B4\u30EA\u30FC\u5B66\u7FD2 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="startCategoryStudy()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-book-open text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">\u30AB\u30C6\u30B4\u30EA\u30FC\u5B66\u7FD2</h3>
                        <p class="text-xs text-white/70">\u5206\u91CE\u5225\u30C8\u30EC\u30FC\u30CB\u30F3\u30B0</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">\u6A29\u5229\u95A2\u4FC2\u3001\u5B85\u5EFA\u696D\u6CD5\u3001\u6CD5\u4EE4\u5236\u9650\u3001\u7A0E\u305D\u306E\u4ED6\u3092\u500B\u5225\u306B\u5B66\u7FD2</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">4\u30AB\u30C6\u30B4\u30EA\u30FC</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- \u6A21\u64EC\u8A66\u9A13 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="startMockExam()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-clipboard-check text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">\u6A21\u64EC\u8A66\u9A13</h3>
                        <p class="text-xs text-white/70">\u672C\u756A\u5F62\u5F0F\u30C6\u30B9\u30C8</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">50\u554F\u30FB2\u6642\u9593\u306E\u672C\u756A\u5F62\u5F0F\u3067\u5B9F\u529B\u3092\u30C1\u30A7\u30C3\u30AF</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">\u5236\u9650\u6642\u9593\u3042\u308A</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- AI\u5206\u6790 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="showAIAnalysis()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition pulse-animation">
                        <i class="fas fa-brain text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">AI\u5206\u6790</h3>
                        <p class="text-xs text-white/70">\u5F31\u70B9\u514B\u670D\u30B5\u30DD\u30FC\u30C8</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">\u5B66\u7FD2\u30C7\u30FC\u30BF\u3092\u5206\u6790\u3057\u3066\u6700\u9069\u306A\u5B66\u7FD2\u30D7\u30E9\u30F3\u3092\u63D0\u6848</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u5206\u6790</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- \u5B66\u7FD2\u7D71\u8A08 -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="showStatistics()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-chart-line text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">\u5B66\u7FD2\u7D71\u8A08</h3>
                        <p class="text-xs text-white/70">\u9032\u6357\u30EC\u30DD\u30FC\u30C8</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">\u8A73\u7D30\u306A\u7D71\u8A08\u30B0\u30E9\u30D5\u3067\u5B66\u7FD2\u9032\u6357\u3092\u53EF\u8996\u5316</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">\u30B0\u30E9\u30D5\u8868\u793A</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- \u82E6\u624B\u514B\u670D -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="startWeakPointStudy()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-exclamation-triangle text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">\u82E6\u624B\u514B\u670D</h3>
                        <p class="text-xs text-white/70">\u91CD\u70B9\u30C8\u30EC\u30FC\u30CB\u30F3\u30B0</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">\u9593\u9055\u3048\u305F\u554F\u984C\u3092\u96C6\u4E2D\u7684\u306B\u5FA9\u7FD2</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">\u81EA\u52D5\u62BD\u51FA</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
            
            <!-- \u5B66\u7FD2\u30AB\u30EC\u30F3\u30C0\u30FC -->
            <div class="glass-card rounded-2xl p-6 card-3d group cursor-pointer" onclick="showCalendar()">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition">
                        <i class="fas fa-calendar-alt text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">\u5B66\u7FD2\u8A08\u753B</h3>
                        <p class="text-xs text-white/70">\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u7BA1\u7406</p>
                    </div>
                </div>
                <p class="text-white/80 text-sm">\u8A66\u9A13\u65E5\u307E\u3067\u306E\u5B66\u7FD2\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB\u3092\u6700\u9069\u5316</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-xs text-white/60">\u76EE\u6A19\u8A2D\u5B9A</span>
                    <i class="fas fa-arrow-right text-white/60 group-hover:translate-x-2 transition"></i>
                </div>
            </div>
        </div>
        
        <!-- \u30AF\u30A4\u30C3\u30AF\u30A2\u30AF\u30B7\u30E7\u30F3\u30D0\u30FC -->
        <div class="fixed bottom-0 left-0 right-0 glass-card p-4 md:hidden z-40">
            <div class="flex justify-around">
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-home text-xl"></i>
                </button>
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-book text-xl"></i>
                </button>
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-chart-bar text-xl"></i>
                </button>
                <button class="text-white hover:text-purple-300 transition">
                    <i class="fas fa-user text-xl"></i>
                </button>
            </div>
        </div>
    </div>
    
    <!-- \u30D5\u30ED\u30FC\u30C6\u30A3\u30F3\u30B0\u30D8\u30EB\u30D7\u30DC\u30BF\u30F3 -->
    <button id="help-button" class="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 pulse-animation">
        <i class="fas fa-question text-xl"></i>
    </button>
    
    <!-- \u30D5\u30ED\u30FC\u30C6\u30A3\u30F3\u30B0\u30C1\u30E5\u30FC\u30C8\u30EA\u30A2\u30EB\u30DC\u30BF\u30F3 -->
    <button id="tutorial-button" class="fixed bottom-20 md:bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110">
        <i class="fas fa-graduation-cap text-xl"></i>
    </button>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"><\/script>
    <script src="https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js"><\/script>
    <script src="/static/3d-icon.js"><\/script>
    <script src="/static/animations.js"><\/script>
    <script src="/static/particles.js"><\/script>
    <script src="/static/app-enhanced.js"><\/script>
    
    <!-- PWA Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('Service Worker registered'))
                    .catch(err => console.error('Service Worker registration failed:', err));
            });
        }
        
        // PWA\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u30D7\u30ED\u30F3\u30D7\u30C8
        let deferredPrompt;
        const installBtn = document.getElementById('install-btn');
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.style.display = 'block';
        });
        
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('User response:', outcome);
                deferredPrompt = null;
                installBtn.style.display = 'none';
            }
        });
        
        // \u30A2\u30D7\u30EA\u8D77\u52D5\u95A2\u6570
        function startCategoryStudy() {
            window.location.href = '/study/category';
        }
        
        function startMockExam() {
            window.location.href = '/exam/mock';
        }
        
        function showAIAnalysis() {
            window.location.href = '/ai/analysis';
        }
        
        function showStatistics() {
            window.location.href = '/statistics';
        }
        
        function startWeakPointStudy() {
            window.location.href = '/study/weak';
        }
        
        function showCalendar() {
            window.location.href = '/calendar';
        }
    <\/script>
</body>
</html>
  `));
var Ge = new Ce();
var ms = Object.assign({ "/src/index.tsx": A });
var yt = false;
for (const [, e] of Object.entries(ms)) e && (Ge.route("/", e), Ge.notFound(e.notFoundHandler), yt = true);
if (!yt) throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");

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

// ../.wrangler/tmp/bundle-KBlR0C/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = Ge;

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

// ../.wrangler/tmp/bundle-KBlR0C/middleware-loader.entry.ts
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
//# sourceMappingURL=bundledWorker-0.02200338899706966.mjs.map
