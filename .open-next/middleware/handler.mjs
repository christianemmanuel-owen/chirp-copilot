
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.9.16";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie)) {
        const val = cookie[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie.name)) {
        throw new TypeError(`argument name is invalid: ${cookie.name}`);
      }
      const value = cookie.value ? enc(cookie.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie.value}`);
      }
      let str = cookie.name + "=" + value;
      if (cookie.maxAge !== void 0) {
        if (!Number.isInteger(cookie.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
        }
        str += "; Max-Age=" + cookie.maxAge;
      }
      if (cookie.domain) {
        if (!domainValueRegExp.test(cookie.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie.domain}`);
        }
        str += "; Domain=" + cookie.domain;
      }
      if (cookie.path) {
        if (!pathValueRegExp.test(cookie.path)) {
          throw new TypeError(`option path is invalid: ${cookie.path}`);
        }
        str += "; Path=" + cookie.path;
      }
      if (cookie.expires) {
        if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie.expires}`);
        }
        str += "; Expires=" + cookie.expires.toUTCString();
      }
      if (cookie.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie.secure) {
        str += "; Secure";
      }
      if (cookie.partitioned) {
        str += "; Partitioned";
      }
      if (cookie.priority) {
        const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie.priority}`);
        }
      }
      if (cookie.sameSite) {
        const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie.httpOnly = true;
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "partitioned":
            setCookie.partitioned = true;
            break;
          case "domain":
            setCookie.domain = val;
            break;
          case "path":
            setCookie.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "node_modules/@opennextjs/aws/dist/http/util.js"() {
    init_logger();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const body = shouldHaveBody ? Buffer2.from(await event.arrayBuffer()) : void 0;
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
function initializeOnce() {
  if (initialized)
    return;
  cachedOrigins = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
  const functions = globalThis.openNextConfig.functions ?? {};
  for (const key in functions) {
    if (key !== "default") {
      const value = functions[key];
      const regexes = [];
      for (const pattern of value.patterns) {
        const regexPattern = `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`;
        regexes.push(new RegExp(regexPattern));
      }
      cachedPatterns.push({
        key,
        patterns: value.patterns,
        regexes
      });
    }
  }
  initialized = true;
}
var cachedOrigins, cachedPatterns, initialized, envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    cachedPatterns = [];
    initialized = false;
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          initializeOnce();
          for (const { key, patterns, regexes } of cachedPatterns) {
            for (const regex of regexes) {
              if (regex.test(_path)) {
                debug("Using origin", key, patterns);
                return cachedOrigins[key];
              }
            }
          }
          if (_path.startsWith("/_next/image") && cachedOrigins.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return cachedOrigins.imageOptimizer;
          }
          if (cachedOrigins.default) {
            debug("Using default origin", cachedOrigins.default, _path);
            return cachedOrigins.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// node_modules/@opennextjs/aws/dist/utils/stream.js
import { ReadableStream as ReadableStream2 } from "node:stream/web";
function toReadableStream(value, isBase64) {
  return new ReadableStream2({
    pull(controller) {
      controller.enqueue(Buffer.from(value, isBase64 ? "base64" : "utf8"));
      controller.close();
    }
  }, { highWaterMark: 0 });
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return new ReadableStream2({
      pull(controller) {
        maybeSomethingBuffer ??= Buffer.from("SOMETHING");
        controller.enqueue(maybeSomethingBuffer);
        controller.close();
      }
    }, { highWaterMark: 0 });
  }
  return new ReadableStream2({
    start(controller) {
      controller.close();
    }
  });
}
var maybeSomethingBuffer;
var init_stream = __esm({
  "node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var a = {}, b = {};
      function c(d) {
        var e = b[d];
        if (void 0 !== e) return e.exports;
        var f = b[d] = { exports: {} }, g = true;
        try {
          a[d](f, f.exports, c), g = false;
        } finally {
          g && delete b[d];
        }
        return f.exports;
      }
      c.m = a, c.amdO = {}, (() => {
        var a2 = [];
        c.O = (b2, d, e, f) => {
          if (d) {
            f = f || 0;
            for (var g = a2.length; g > 0 && a2[g - 1][2] > f; g--) a2[g] = a2[g - 1];
            a2[g] = [d, e, f];
            return;
          }
          for (var h = 1 / 0, g = 0; g < a2.length; g++) {
            for (var [d, e, f] = a2[g], i = true, j = 0; j < d.length; j++) (false & f || h >= f) && Object.keys(c.O).every((a3) => c.O[a3](d[j])) ? d.splice(j--, 1) : (i = false, f < h && (h = f));
            if (i) {
              a2.splice(g--, 1);
              var k = e();
              void 0 !== k && (b2 = k);
            }
          }
          return b2;
        };
      })(), c.n = (a2) => {
        var b2 = a2 && a2.__esModule ? () => a2.default : () => a2;
        return c.d(b2, { a: b2 }), b2;
      }, c.d = (a2, b2) => {
        for (var d in b2) c.o(b2, d) && !c.o(a2, d) && Object.defineProperty(a2, d, { enumerable: true, get: b2[d] });
      }, c.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (a2) {
          if ("object" == typeof window) return window;
        }
      }(), c.o = (a2, b2) => Object.prototype.hasOwnProperty.call(a2, b2), c.r = (a2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(a2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a2, "__esModule", { value: true });
      }, (() => {
        var a2 = { 149: 0 };
        c.O.j = (b3) => 0 === a2[b3];
        var b2 = (b3, d2) => {
          var e, f, [g, h, i] = d2, j = 0;
          if (g.some((b4) => 0 !== a2[b4])) {
            for (e in h) c.o(h, e) && (c.m[e] = h[e]);
            if (i) var k = i(c);
          }
          for (b3 && b3(d2); j < g.length; j++) f = g[j], c.o(a2, f) && a2[f] && a2[f][0](), a2[f] = 0;
          return c.O(k);
        }, d = self.webpackChunk_N_E = self.webpackChunk_N_E || [];
        d.forEach(b2.bind(null, 0)), d.push = b2.bind(null, d.push.bind(d));
      })();
    })();
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// .next/server/middleware.js
var require_middleware = __commonJS({
  ".next/server/middleware.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[751], { 58: (a, b, c) => {
      "use strict";
      c.d(b, { xl: () => g });
      let d = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class e {
        disable() {
          throw d;
        }
        getStore() {
        }
        run() {
          throw d;
        }
        exit() {
          throw d;
        }
        enterWith() {
          throw d;
        }
        static bind(a2) {
          return a2;
        }
      }
      let f = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage;
      function g() {
        return f ? new f() : new e();
      }
    }, 66: (a, b, c) => {
      "use strict";
      c.d(b, { RM: () => f, s8: () => e });
      let d = new Set(Object.values({ NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 })), e = "NEXT_HTTP_ERROR_FALLBACK";
      function f(a2) {
        if ("object" != typeof a2 || null === a2 || !("digest" in a2) || "string" != typeof a2.digest) return false;
        let [b2, c2] = a2.digest.split(";");
        return b2 === e && d.has(Number(c2));
      }
    }, 107: (a, b, c) => {
      "use strict";
      c.d(b, { wi: () => m, I3: () => k, Ui: () => i, xI: () => g, Pk: () => h });
      var d = c(814), e = c(159);
      c(979), c(128), c(379), c(770), c(340), c(809);
      let f = "function" == typeof d.unstable_postpone;
      function g(a2, b2, c2) {
        let d2 = Object.defineProperty(new e.F(`Route ${b2.route} couldn't be rendered statically because it used \`${a2}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", { value: "E558", enumerable: false, configurable: true });
        throw c2.revalidate = 0, b2.dynamicUsageDescription = a2, b2.dynamicUsageStack = d2.stack, d2;
      }
      function h(a2) {
        switch (a2.type) {
          case "cache":
          case "unstable-cache":
          case "private-cache":
            return;
        }
      }
      function i(a2, b2, c2) {
        (function() {
          if (!f) throw Object.defineProperty(Error("Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E224", enumerable: false, configurable: true });
        })(), c2 && c2.dynamicAccesses.push({ stack: c2.isDebugDynamicAccesses ? Error().stack : void 0, expression: b2 }), d.unstable_postpone(j(a2, b2));
      }
      function j(a2, b2) {
        return `Route ${a2} needs to bail out of prerendering at this point because it used ${b2}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`;
      }
      function k(a2) {
        return "object" == typeof a2 && null !== a2 && "string" == typeof a2.message && l(a2.message);
      }
      function l(a2) {
        return a2.includes("needs to bail out of prerendering at this point because it used") && a2.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error");
      }
      if (false === l(j("%%%", "^^^"))) throw Object.defineProperty(Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E296", enumerable: false, configurable: true });
      function m(a2, b2) {
        return a2.runtimeStagePromise ? a2.runtimeStagePromise.then(() => b2) : b2;
      }
      RegExp(`\\n\\s+at Suspense \\(<anonymous>\\)(?:(?!\\n\\s+at (?:body|div|main|section|article|aside|header|footer|nav|form|p|span|h1|h2|h3|h4|h5|h6) \\(<anonymous>\\))[\\s\\S])*?\\n\\s+at __next_root_layout_boundary__ \\([^\\n]*\\)`), RegExp(`\\n\\s+at __next_metadata_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_viewport_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_outlet_boundary__[\\n\\s]`);
    }, 128: (a, b, c) => {
      "use strict";
      c.d(b, { M1: () => e, FP: () => d });
      let d = (0, c(58).xl)();
      function e(a2) {
        throw Object.defineProperty(Error(`\`${a2}\` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", { value: "E251", enumerable: false, configurable: true });
      }
    }, 159: (a, b, c) => {
      "use strict";
      c.d(b, { F: () => e, h: () => f });
      let d = "DYNAMIC_SERVER_USAGE";
      class e extends Error {
        constructor(a2) {
          super("Dynamic server usage: " + a2), this.description = a2, this.digest = d;
        }
      }
      function f(a2) {
        return "object" == typeof a2 && null !== a2 && "digest" in a2 && "string" == typeof a2.digest && a2.digest === d;
      }
    }, 165: (a, b, c) => {
      "use strict";
      var d = c(356).Buffer;
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { handleFetch: function() {
        return h;
      }, interceptFetch: function() {
        return i;
      }, reader: function() {
        return f;
      } });
      let e = c(392), f = { url: (a2) => a2.url, header: (a2, b2) => a2.headers.get(b2) };
      async function g(a2, b2) {
        let { url: c2, method: e2, headers: f2, body: g2, cache: h2, credentials: i2, integrity: j, mode: k, redirect: l, referrer: m, referrerPolicy: n } = b2;
        return { testData: a2, api: "fetch", request: { url: c2, method: e2, headers: [...Array.from(f2), ["next-test-stack", function() {
          let a3 = (Error().stack ?? "").split("\n");
          for (let b3 = 1; b3 < a3.length; b3++) if (a3[b3].length > 0) {
            a3 = a3.slice(b3);
            break;
          }
          return (a3 = (a3 = (a3 = a3.filter((a4) => !a4.includes("/next/dist/"))).slice(0, 5)).map((a4) => a4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: g2 ? d.from(await b2.arrayBuffer()).toString("base64") : null, cache: h2, credentials: i2, integrity: j, mode: k, redirect: l, referrer: m, referrerPolicy: n } };
      }
      async function h(a2, b2) {
        let c2 = (0, e.getTestReqInfo)(b2, f);
        if (!c2) return a2(b2);
        let { testData: h2, proxyPort: i2 } = c2, j = await g(h2, b2), k = await a2(`http://localhost:${i2}`, { method: "POST", body: JSON.stringify(j), next: { internal: true } });
        if (!k.ok) throw Object.defineProperty(Error(`Proxy request failed: ${k.status}`), "__NEXT_ERROR_CODE", { value: "E146", enumerable: false, configurable: true });
        let l = await k.json(), { api: m } = l;
        switch (m) {
          case "continue":
            return a2(b2);
          case "abort":
          case "unhandled":
            throw Object.defineProperty(Error(`Proxy request aborted [${b2.method} ${b2.url}]`), "__NEXT_ERROR_CODE", { value: "E145", enumerable: false, configurable: true });
          case "fetch":
            let { status: n, headers: o, body: p } = l.response;
            return new Response(p ? d.from(p, "base64") : null, { status: n, headers: new Headers(o) });
          default:
            return m;
        }
      }
      function i(a2) {
        return c.g.fetch = function(b2, c2) {
          var d2;
          return (null == c2 || null == (d2 = c2.next) ? void 0 : d2.internal) ? a2(b2, c2) : h(a2, new Request(b2, c2));
        }, () => {
          c.g.fetch = a2;
        };
      }
    }, 213: (a) => {
      (() => {
        "use strict";
        var b = { 993: (a2) => {
          var b2 = Object.prototype.hasOwnProperty, c2 = "~";
          function d2() {
          }
          function e2(a3, b3, c3) {
            this.fn = a3, this.context = b3, this.once = c3 || false;
          }
          function f(a3, b3, d3, f2, g2) {
            if ("function" != typeof d3) throw TypeError("The listener must be a function");
            var h2 = new e2(d3, f2 || a3, g2), i = c2 ? c2 + b3 : b3;
            return a3._events[i] ? a3._events[i].fn ? a3._events[i] = [a3._events[i], h2] : a3._events[i].push(h2) : (a3._events[i] = h2, a3._eventsCount++), a3;
          }
          function g(a3, b3) {
            0 == --a3._eventsCount ? a3._events = new d2() : delete a3._events[b3];
          }
          function h() {
            this._events = new d2(), this._eventsCount = 0;
          }
          Object.create && (d2.prototype = /* @__PURE__ */ Object.create(null), new d2().__proto__ || (c2 = false)), h.prototype.eventNames = function() {
            var a3, d3, e3 = [];
            if (0 === this._eventsCount) return e3;
            for (d3 in a3 = this._events) b2.call(a3, d3) && e3.push(c2 ? d3.slice(1) : d3);
            return Object.getOwnPropertySymbols ? e3.concat(Object.getOwnPropertySymbols(a3)) : e3;
          }, h.prototype.listeners = function(a3) {
            var b3 = c2 ? c2 + a3 : a3, d3 = this._events[b3];
            if (!d3) return [];
            if (d3.fn) return [d3.fn];
            for (var e3 = 0, f2 = d3.length, g2 = Array(f2); e3 < f2; e3++) g2[e3] = d3[e3].fn;
            return g2;
          }, h.prototype.listenerCount = function(a3) {
            var b3 = c2 ? c2 + a3 : a3, d3 = this._events[b3];
            return d3 ? d3.fn ? 1 : d3.length : 0;
          }, h.prototype.emit = function(a3, b3, d3, e3, f2, g2) {
            var h2 = c2 ? c2 + a3 : a3;
            if (!this._events[h2]) return false;
            var i, j, k = this._events[h2], l = arguments.length;
            if (k.fn) {
              switch (k.once && this.removeListener(a3, k.fn, void 0, true), l) {
                case 1:
                  return k.fn.call(k.context), true;
                case 2:
                  return k.fn.call(k.context, b3), true;
                case 3:
                  return k.fn.call(k.context, b3, d3), true;
                case 4:
                  return k.fn.call(k.context, b3, d3, e3), true;
                case 5:
                  return k.fn.call(k.context, b3, d3, e3, f2), true;
                case 6:
                  return k.fn.call(k.context, b3, d3, e3, f2, g2), true;
              }
              for (j = 1, i = Array(l - 1); j < l; j++) i[j - 1] = arguments[j];
              k.fn.apply(k.context, i);
            } else {
              var m, n = k.length;
              for (j = 0; j < n; j++) switch (k[j].once && this.removeListener(a3, k[j].fn, void 0, true), l) {
                case 1:
                  k[j].fn.call(k[j].context);
                  break;
                case 2:
                  k[j].fn.call(k[j].context, b3);
                  break;
                case 3:
                  k[j].fn.call(k[j].context, b3, d3);
                  break;
                case 4:
                  k[j].fn.call(k[j].context, b3, d3, e3);
                  break;
                default:
                  if (!i) for (m = 1, i = Array(l - 1); m < l; m++) i[m - 1] = arguments[m];
                  k[j].fn.apply(k[j].context, i);
              }
            }
            return true;
          }, h.prototype.on = function(a3, b3, c3) {
            return f(this, a3, b3, c3, false);
          }, h.prototype.once = function(a3, b3, c3) {
            return f(this, a3, b3, c3, true);
          }, h.prototype.removeListener = function(a3, b3, d3, e3) {
            var f2 = c2 ? c2 + a3 : a3;
            if (!this._events[f2]) return this;
            if (!b3) return g(this, f2), this;
            var h2 = this._events[f2];
            if (h2.fn) h2.fn !== b3 || e3 && !h2.once || d3 && h2.context !== d3 || g(this, f2);
            else {
              for (var i = 0, j = [], k = h2.length; i < k; i++) (h2[i].fn !== b3 || e3 && !h2[i].once || d3 && h2[i].context !== d3) && j.push(h2[i]);
              j.length ? this._events[f2] = 1 === j.length ? j[0] : j : g(this, f2);
            }
            return this;
          }, h.prototype.removeAllListeners = function(a3) {
            var b3;
            return a3 ? (b3 = c2 ? c2 + a3 : a3, this._events[b3] && g(this, b3)) : (this._events = new d2(), this._eventsCount = 0), this;
          }, h.prototype.off = h.prototype.removeListener, h.prototype.addListener = h.prototype.on, h.prefixed = c2, h.EventEmitter = h, a2.exports = h;
        }, 213: (a2) => {
          a2.exports = (a3, b2) => (b2 = b2 || (() => {
          }), a3.then((a4) => new Promise((a5) => {
            a5(b2());
          }).then(() => a4), (a4) => new Promise((a5) => {
            a5(b2());
          }).then(() => {
            throw a4;
          })));
        }, 574: (a2, b2) => {
          Object.defineProperty(b2, "__esModule", { value: true }), b2.default = function(a3, b3, c2) {
            let d2 = 0, e2 = a3.length;
            for (; e2 > 0; ) {
              let f = e2 / 2 | 0, g = d2 + f;
              0 >= c2(a3[g], b3) ? (d2 = ++g, e2 -= f + 1) : e2 = f;
            }
            return d2;
          };
        }, 821: (a2, b2, c2) => {
          Object.defineProperty(b2, "__esModule", { value: true });
          let d2 = c2(574);
          class e2 {
            constructor() {
              this._queue = [];
            }
            enqueue(a3, b3) {
              let c3 = { priority: (b3 = Object.assign({ priority: 0 }, b3)).priority, run: a3 };
              if (this.size && this._queue[this.size - 1].priority >= b3.priority) return void this._queue.push(c3);
              let e3 = d2.default(this._queue, c3, (a4, b4) => b4.priority - a4.priority);
              this._queue.splice(e3, 0, c3);
            }
            dequeue() {
              let a3 = this._queue.shift();
              return null == a3 ? void 0 : a3.run;
            }
            filter(a3) {
              return this._queue.filter((b3) => b3.priority === a3.priority).map((a4) => a4.run);
            }
            get size() {
              return this._queue.length;
            }
          }
          b2.default = e2;
        }, 816: (a2, b2, c2) => {
          let d2 = c2(213);
          class e2 extends Error {
            constructor(a3) {
              super(a3), this.name = "TimeoutError";
            }
          }
          let f = (a3, b3, c3) => new Promise((f2, g) => {
            if ("number" != typeof b3 || b3 < 0) throw TypeError("Expected `milliseconds` to be a positive number");
            if (b3 === 1 / 0) return void f2(a3);
            let h = setTimeout(() => {
              if ("function" == typeof c3) {
                try {
                  f2(c3());
                } catch (a4) {
                  g(a4);
                }
                return;
              }
              let d3 = "string" == typeof c3 ? c3 : `Promise timed out after ${b3} milliseconds`, h2 = c3 instanceof Error ? c3 : new e2(d3);
              "function" == typeof a3.cancel && a3.cancel(), g(h2);
            }, b3);
            d2(a3.then(f2, g), () => {
              clearTimeout(h);
            });
          });
          a2.exports = f, a2.exports.default = f, a2.exports.TimeoutError = e2;
        } }, c = {};
        function d(a2) {
          var e2 = c[a2];
          if (void 0 !== e2) return e2.exports;
          var f = c[a2] = { exports: {} }, g = true;
          try {
            b[a2](f, f.exports, d), g = false;
          } finally {
            g && delete c[a2];
          }
          return f.exports;
        }
        d.ab = "//";
        var e = {};
        (() => {
          Object.defineProperty(e, "__esModule", { value: true });
          let a2 = d(993), b2 = d(816), c2 = d(821), f = () => {
          }, g = new b2.TimeoutError();
          class h extends a2 {
            constructor(a3) {
              var b3, d2, e2, g2;
              if (super(), this._intervalCount = 0, this._intervalEnd = 0, this._pendingCount = 0, this._resolveEmpty = f, this._resolveIdle = f, !("number" == typeof (a3 = Object.assign({ carryoverConcurrencyCount: false, intervalCap: 1 / 0, interval: 0, concurrency: 1 / 0, autoStart: true, queueClass: c2.default }, a3)).intervalCap && a3.intervalCap >= 1)) throw TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null != (d2 = null == (b3 = a3.intervalCap) ? void 0 : b3.toString()) ? d2 : ""}\` (${typeof a3.intervalCap})`);
              if (void 0 === a3.interval || !(Number.isFinite(a3.interval) && a3.interval >= 0)) throw TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null != (g2 = null == (e2 = a3.interval) ? void 0 : e2.toString()) ? g2 : ""}\` (${typeof a3.interval})`);
              this._carryoverConcurrencyCount = a3.carryoverConcurrencyCount, this._isIntervalIgnored = a3.intervalCap === 1 / 0 || 0 === a3.interval, this._intervalCap = a3.intervalCap, this._interval = a3.interval, this._queue = new a3.queueClass(), this._queueClass = a3.queueClass, this.concurrency = a3.concurrency, this._timeout = a3.timeout, this._throwOnTimeout = true === a3.throwOnTimeout, this._isPaused = false === a3.autoStart;
            }
            get _doesIntervalAllowAnother() {
              return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
            }
            get _doesConcurrentAllowAnother() {
              return this._pendingCount < this._concurrency;
            }
            _next() {
              this._pendingCount--, this._tryToStartAnother(), this.emit("next");
            }
            _resolvePromises() {
              this._resolveEmpty(), this._resolveEmpty = f, 0 === this._pendingCount && (this._resolveIdle(), this._resolveIdle = f, this.emit("idle"));
            }
            _onResumeInterval() {
              this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
            }
            _isIntervalPaused() {
              let a3 = Date.now();
              if (void 0 === this._intervalId) {
                let b3 = this._intervalEnd - a3;
                if (!(b3 < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                  this._onResumeInterval();
                }, b3)), true;
                this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
              }
              return false;
            }
            _tryToStartAnother() {
              if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), this._intervalId = void 0, this._resolvePromises(), false;
              if (!this._isPaused) {
                let a3 = !this._isIntervalPaused();
                if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                  let b3 = this._queue.dequeue();
                  return !!b3 && (this.emit("active"), b3(), a3 && this._initializeIntervalIfNeeded(), true);
                }
              }
              return false;
            }
            _initializeIntervalIfNeeded() {
              this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
                this._onInterval();
              }, this._interval), this._intervalEnd = Date.now() + this._interval);
            }
            _onInterval() {
              0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, this._processQueue();
            }
            _processQueue() {
              for (; this._tryToStartAnother(); ) ;
            }
            get concurrency() {
              return this._concurrency;
            }
            set concurrency(a3) {
              if (!("number" == typeof a3 && a3 >= 1)) throw TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${a3}\` (${typeof a3})`);
              this._concurrency = a3, this._processQueue();
            }
            async add(a3, c3 = {}) {
              return new Promise((d2, e2) => {
                let f2 = async () => {
                  this._pendingCount++, this._intervalCount++;
                  try {
                    let f3 = void 0 === this._timeout && void 0 === c3.timeout ? a3() : b2.default(Promise.resolve(a3()), void 0 === c3.timeout ? this._timeout : c3.timeout, () => {
                      (void 0 === c3.throwOnTimeout ? this._throwOnTimeout : c3.throwOnTimeout) && e2(g);
                    });
                    d2(await f3);
                  } catch (a4) {
                    e2(a4);
                  }
                  this._next();
                };
                this._queue.enqueue(f2, c3), this._tryToStartAnother(), this.emit("add");
              });
            }
            async addAll(a3, b3) {
              return Promise.all(a3.map(async (a4) => this.add(a4, b3)));
            }
            start() {
              return this._isPaused && (this._isPaused = false, this._processQueue()), this;
            }
            pause() {
              this._isPaused = true;
            }
            clear() {
              this._queue = new this._queueClass();
            }
            async onEmpty() {
              if (0 !== this._queue.size) return new Promise((a3) => {
                let b3 = this._resolveEmpty;
                this._resolveEmpty = () => {
                  b3(), a3();
                };
              });
            }
            async onIdle() {
              if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise((a3) => {
                let b3 = this._resolveIdle;
                this._resolveIdle = () => {
                  b3(), a3();
                };
              });
            }
            get size() {
              return this._queue.size;
            }
            sizeBy(a3) {
              return this._queue.filter(a3).length;
            }
            get pending() {
              return this._pendingCount;
            }
            get isPaused() {
              return this._isPaused;
            }
            get timeout() {
              return this._timeout;
            }
            set timeout(a3) {
              this._timeout = a3;
            }
          }
          e.default = h;
        })(), a.exports = e;
      })();
    }, 242: (a, b, c) => {
      "use strict";
      let d, e, f, g, h, i, j;
      c.r(b), c.d(b, { default: () => q2 });
      var k = {};
      c.r(k), c.d(k, { brands: () => gW, brandsRelations: () => hf, categories: () => gX, categoriesRelations: () => hg, chatbotConversations: () => g7, chatbotConversationsRelations: () => hr, discountCampaignVariants: () => ha, discountCampaignVariantsRelations: () => ht, discountCampaigns: () => g9, discountCampaignsRelations: () => hs, instagramConnections: () => g5, instagramConnectionsRelations: () => ho, instagramMessages: () => g8, instagramMessagesRelations: () => hp, instagramOAuthSessions: () => g6, instagramOAuthSessionsRelations: () => hq, maintenanceOverrides: () => hc, orders: () => g0, ordersRelations: () => hl, paymentMethods: () => g2, paymentMethodsRelations: () => hn, productCategories: () => gZ, productCategoriesRelations: () => hi, productVariants: () => g$, productVariantsRelations: () => hj, products: () => gY, productsRelations: () => hh, projectFeatures: () => hb, projectFeaturesRelations: () => he, projects: () => gV, projectsRelations: () => hd, storefrontSettings: () => g1, storefrontSettingsRelations: () => hm, userProjects: () => g4, users: () => g3, variantSizes: () => g_, variantSizesRelations: () => hk });
      var l = {};
      c.r(l), c.d(l, { q: () => j_, l: () => j2 });
      var m = {};
      async function n() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      c.r(m), c.d(m, { config: () => q$, middleware: () => qZ });
      let o = null;
      async function p() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        o || (o = n());
        let a10 = await o;
        if (null == a10 ? void 0 : a10.register) try {
          await a10.register();
        } catch (a11) {
          throw a11.message = `An error occurred while loading instrumentation hook: ${a11.message}`, a11;
        }
      }
      async function q(...a10) {
        let b10 = await n();
        try {
          var c10;
          await (null == b10 || null == (c10 = b10.onRequestError) ? void 0 : c10.call(b10, ...a10));
        } catch (a11) {
          console.error("Error in instrumentation.onRequestError:", a11);
        }
      }
      let r = null;
      function s() {
        return r || (r = p()), r;
      }
      function t(a10) {
        return `The edge runtime does not support Node.js '${a10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== c.g.process && (process.env = c.g.process.env, c.g.process = process);
      try {
        Object.defineProperty(globalThis, "__import_unsupported", { value: function(a10) {
          let b10 = new Proxy(function() {
          }, { get(b11, c10) {
            if ("then" === c10) return {};
            throw Object.defineProperty(Error(t(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, construct() {
            throw Object.defineProperty(Error(t(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, apply(c10, d10, e10) {
            if ("function" == typeof e10[0]) return e10[0](b10);
            throw Object.defineProperty(Error(t(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          } });
          return new Proxy({}, { get: () => b10 });
        }, enumerable: false, configurable: false });
      } catch {
      }
      s();
      class u extends Error {
        constructor({ page: a10 }) {
          super(`The middleware "${a10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class v extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class w extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let x = "_N_T_", y = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", apiNode: "api-node", apiEdge: "api-edge", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", pagesDirBrowser: "pages-dir-browser", pagesDirEdge: "pages-dir-edge", pagesDirNode: "pages-dir-node" };
      function z(a10) {
        var b10, c10, d10, e10, f10, g10 = [], h10 = 0;
        function i10() {
          for (; h10 < a10.length && /\s/.test(a10.charAt(h10)); ) h10 += 1;
          return h10 < a10.length;
        }
        for (; h10 < a10.length; ) {
          for (b10 = h10, f10 = false; i10(); ) if ("," === (c10 = a10.charAt(h10))) {
            for (d10 = h10, h10 += 1, i10(), e10 = h10; h10 < a10.length && "=" !== (c10 = a10.charAt(h10)) && ";" !== c10 && "," !== c10; ) h10 += 1;
            h10 < a10.length && "=" === a10.charAt(h10) ? (f10 = true, h10 = e10, g10.push(a10.substring(b10, d10)), b10 = h10) : h10 = d10 + 1;
          } else h10 += 1;
          (!f10 || h10 >= a10.length) && g10.push(a10.substring(b10, a10.length));
        }
        return g10;
      }
      function A(a10) {
        let b10 = {}, c10 = [];
        if (a10) for (let [d10, e10] of a10.entries()) "set-cookie" === d10.toLowerCase() ? (c10.push(...z(e10)), b10[d10] = 1 === c10.length ? c10[0] : c10) : b10[d10] = e10;
        return b10;
      }
      function B(a10) {
        try {
          return String(new URL(String(a10)));
        } catch (b10) {
          throw Object.defineProperty(Error(`URL is malformed "${String(a10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: b10 }), "__NEXT_ERROR_CODE", { value: "E61", enumerable: false, configurable: true });
        }
      }
      ({ ...y, GROUP: { builtinReact: [y.reactServerComponents, y.actionBrowser], serverOnly: [y.reactServerComponents, y.actionBrowser, y.instrument, y.middleware], neutralTarget: [y.apiNode, y.apiEdge], clientOnly: [y.serverSideRendering, y.appPagesBrowser], bundled: [y.reactServerComponents, y.actionBrowser, y.serverSideRendering, y.appPagesBrowser, y.shared, y.instrument, y.middleware], appPages: [y.reactServerComponents, y.serverSideRendering, y.appPagesBrowser, y.actionBrowser] } });
      let C = Symbol("response"), D = Symbol("passThrough"), E = Symbol("waitUntil");
      class F {
        constructor(a10, b10) {
          this[D] = false, this[E] = b10 ? { kind: "external", function: b10 } : { kind: "internal", promises: [] };
        }
        respondWith(a10) {
          this[C] || (this[C] = Promise.resolve(a10));
        }
        passThroughOnException() {
          this[D] = true;
        }
        waitUntil(a10) {
          if ("external" === this[E].kind) return (0, this[E].function)(a10);
          this[E].promises.push(a10);
        }
      }
      class G extends F {
        constructor(a10) {
          var b10;
          super(a10.request, null == (b10 = a10.context) ? void 0 : b10.waitUntil), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new u({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new u({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      function H(a10) {
        return a10.replace(/\/$/, "") || "/";
      }
      function I(a10) {
        let b10 = a10.indexOf("#"), c10 = a10.indexOf("?"), d10 = c10 > -1 && (b10 < 0 || c10 < b10);
        return d10 || b10 > -1 ? { pathname: a10.substring(0, d10 ? c10 : b10), query: d10 ? a10.substring(c10, b10 > -1 ? b10 : void 0) : "", hash: b10 > -1 ? a10.slice(b10) : "" } : { pathname: a10, query: "", hash: "" };
      }
      function J(a10, b10) {
        if (!a10.startsWith("/") || !b10) return a10;
        let { pathname: c10, query: d10, hash: e10 } = I(a10);
        return "" + b10 + c10 + d10 + e10;
      }
      function K(a10, b10) {
        if (!a10.startsWith("/") || !b10) return a10;
        let { pathname: c10, query: d10, hash: e10 } = I(a10);
        return "" + c10 + b10 + d10 + e10;
      }
      function L(a10, b10) {
        if ("string" != typeof a10) return false;
        let { pathname: c10 } = I(a10);
        return c10 === b10 || c10.startsWith(b10 + "/");
      }
      let M = /* @__PURE__ */ new WeakMap();
      function N(a10, b10) {
        let c10;
        if (!b10) return { pathname: a10 };
        let d10 = M.get(b10);
        d10 || (d10 = b10.map((a11) => a11.toLowerCase()), M.set(b10, d10));
        let e10 = a10.split("/", 2);
        if (!e10[1]) return { pathname: a10 };
        let f10 = e10[1].toLowerCase(), g10 = d10.indexOf(f10);
        return g10 < 0 ? { pathname: a10 } : (c10 = b10[g10], { pathname: a10 = a10.slice(c10.length + 1) || "/", detectedLocale: c10 });
      }
      let O = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function P(a10, b10) {
        return new URL(String(a10).replace(O, "localhost"), b10 && String(b10).replace(O, "localhost"));
      }
      let Q = Symbol("NextURLInternal");
      class R {
        constructor(a10, b10, c10) {
          let d10, e10;
          "object" == typeof b10 && "pathname" in b10 || "string" == typeof b10 ? (d10 = b10, e10 = c10 || {}) : e10 = c10 || b10 || {}, this[Q] = { url: P(a10, d10 ?? e10.base), options: e10, basePath: "" }, this.analyze();
        }
        analyze() {
          var a10, b10, c10, d10, e10;
          let f10 = function(a11, b11) {
            var c11, d11;
            let { basePath: e11, i18n: f11, trailingSlash: g11 } = null != (c11 = b11.nextConfig) ? c11 : {}, h11 = { pathname: a11, trailingSlash: "/" !== a11 ? a11.endsWith("/") : g11 };
            e11 && L(h11.pathname, e11) && (h11.pathname = function(a12, b12) {
              if (!L(a12, b12)) return a12;
              let c12 = a12.slice(b12.length);
              return c12.startsWith("/") ? c12 : "/" + c12;
            }(h11.pathname, e11), h11.basePath = e11);
            let i10 = h11.pathname;
            if (h11.pathname.startsWith("/_next/data/") && h11.pathname.endsWith(".json")) {
              let a12 = h11.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
              h11.buildId = a12[0], i10 = "index" !== a12[1] ? "/" + a12.slice(1).join("/") : "/", true === b11.parseData && (h11.pathname = i10);
            }
            if (f11) {
              let a12 = b11.i18nProvider ? b11.i18nProvider.analyze(h11.pathname) : N(h11.pathname, f11.locales);
              h11.locale = a12.detectedLocale, h11.pathname = null != (d11 = a12.pathname) ? d11 : h11.pathname, !a12.detectedLocale && h11.buildId && (a12 = b11.i18nProvider ? b11.i18nProvider.analyze(i10) : N(i10, f11.locales)).detectedLocale && (h11.locale = a12.detectedLocale);
            }
            return h11;
          }(this[Q].url.pathname, { nextConfig: this[Q].options.nextConfig, parseData: true, i18nProvider: this[Q].options.i18nProvider }), g10 = function(a11, b11) {
            let c11;
            if ((null == b11 ? void 0 : b11.host) && !Array.isArray(b11.host)) c11 = b11.host.toString().split(":", 1)[0];
            else {
              if (!a11.hostname) return;
              c11 = a11.hostname;
            }
            return c11.toLowerCase();
          }(this[Q].url, this[Q].options.headers);
          this[Q].domainLocale = this[Q].options.i18nProvider ? this[Q].options.i18nProvider.detectDomainLocale(g10) : function(a11, b11, c11) {
            if (a11) for (let f11 of (c11 && (c11 = c11.toLowerCase()), a11)) {
              var d11, e11;
              if (b11 === (null == (d11 = f11.domain) ? void 0 : d11.split(":", 1)[0].toLowerCase()) || c11 === f11.defaultLocale.toLowerCase() || (null == (e11 = f11.locales) ? void 0 : e11.some((a12) => a12.toLowerCase() === c11))) return f11;
            }
          }(null == (b10 = this[Q].options.nextConfig) || null == (a10 = b10.i18n) ? void 0 : a10.domains, g10);
          let h10 = (null == (c10 = this[Q].domainLocale) ? void 0 : c10.defaultLocale) || (null == (e10 = this[Q].options.nextConfig) || null == (d10 = e10.i18n) ? void 0 : d10.defaultLocale);
          this[Q].url.pathname = f10.pathname, this[Q].defaultLocale = h10, this[Q].basePath = f10.basePath ?? "", this[Q].buildId = f10.buildId, this[Q].locale = f10.locale ?? h10, this[Q].trailingSlash = f10.trailingSlash;
        }
        formatPathname() {
          var a10;
          let b10;
          return b10 = function(a11, b11, c10, d10) {
            if (!b11 || b11 === c10) return a11;
            let e10 = a11.toLowerCase();
            return !d10 && (L(e10, "/api") || L(e10, "/" + b11.toLowerCase())) ? a11 : J(a11, "/" + b11);
          }((a10 = { basePath: this[Q].basePath, buildId: this[Q].buildId, defaultLocale: this[Q].options.forceLocale ? void 0 : this[Q].defaultLocale, locale: this[Q].locale, pathname: this[Q].url.pathname, trailingSlash: this[Q].trailingSlash }).pathname, a10.locale, a10.buildId ? void 0 : a10.defaultLocale, a10.ignorePrefix), (a10.buildId || !a10.trailingSlash) && (b10 = H(b10)), a10.buildId && (b10 = K(J(b10, "/_next/data/" + a10.buildId), "/" === a10.pathname ? "index.json" : ".json")), b10 = J(b10, a10.basePath), !a10.buildId && a10.trailingSlash ? b10.endsWith("/") ? b10 : K(b10, "/") : H(b10);
        }
        formatSearch() {
          return this[Q].url.search;
        }
        get buildId() {
          return this[Q].buildId;
        }
        set buildId(a10) {
          this[Q].buildId = a10;
        }
        get locale() {
          return this[Q].locale ?? "";
        }
        set locale(a10) {
          var b10, c10;
          if (!this[Q].locale || !(null == (c10 = this[Q].options.nextConfig) || null == (b10 = c10.i18n) ? void 0 : b10.locales.includes(a10))) throw Object.defineProperty(TypeError(`The NextURL configuration includes no locale "${a10}"`), "__NEXT_ERROR_CODE", { value: "E597", enumerable: false, configurable: true });
          this[Q].locale = a10;
        }
        get defaultLocale() {
          return this[Q].defaultLocale;
        }
        get domainLocale() {
          return this[Q].domainLocale;
        }
        get searchParams() {
          return this[Q].url.searchParams;
        }
        get host() {
          return this[Q].url.host;
        }
        set host(a10) {
          this[Q].url.host = a10;
        }
        get hostname() {
          return this[Q].url.hostname;
        }
        set hostname(a10) {
          this[Q].url.hostname = a10;
        }
        get port() {
          return this[Q].url.port;
        }
        set port(a10) {
          this[Q].url.port = a10;
        }
        get protocol() {
          return this[Q].url.protocol;
        }
        set protocol(a10) {
          this[Q].url.protocol = a10;
        }
        get href() {
          let a10 = this.formatPathname(), b10 = this.formatSearch();
          return `${this.protocol}//${this.host}${a10}${b10}${this.hash}`;
        }
        set href(a10) {
          this[Q].url = P(a10), this.analyze();
        }
        get origin() {
          return this[Q].url.origin;
        }
        get pathname() {
          return this[Q].url.pathname;
        }
        set pathname(a10) {
          this[Q].url.pathname = a10;
        }
        get hash() {
          return this[Q].url.hash;
        }
        set hash(a10) {
          this[Q].url.hash = a10;
        }
        get search() {
          return this[Q].url.search;
        }
        set search(a10) {
          this[Q].url.search = a10;
        }
        get password() {
          return this[Q].url.password;
        }
        set password(a10) {
          this[Q].url.password = a10;
        }
        get username() {
          return this[Q].url.username;
        }
        set username(a10) {
          this[Q].url.username = a10;
        }
        get basePath() {
          return this[Q].basePath;
        }
        set basePath(a10) {
          this[Q].basePath = a10.startsWith("/") ? a10 : `/${a10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new R(String(this), this[Q].options);
        }
      }
      var S = c(443);
      let T = Symbol("internal request");
      class U extends Request {
        constructor(a10, b10 = {}) {
          let c10 = "string" != typeof a10 && "url" in a10 ? a10.url : String(a10);
          B(c10), a10 instanceof Request ? super(a10, b10) : super(c10, b10);
          let d10 = new R(c10, { headers: A(this.headers), nextConfig: b10.nextConfig });
          this[T] = { cookies: new S.RequestCookies(this.headers), nextUrl: d10, url: d10.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[T].cookies;
        }
        get nextUrl() {
          return this[T].nextUrl;
        }
        get page() {
          throw new v();
        }
        get ua() {
          throw new w();
        }
        get url() {
          return this[T].url;
        }
      }
      class V {
        static get(a10, b10, c10) {
          let d10 = Reflect.get(a10, b10, c10);
          return "function" == typeof d10 ? d10.bind(a10) : d10;
        }
        static set(a10, b10, c10, d10) {
          return Reflect.set(a10, b10, c10, d10);
        }
        static has(a10, b10) {
          return Reflect.has(a10, b10);
        }
        static deleteProperty(a10, b10) {
          return Reflect.deleteProperty(a10, b10);
        }
      }
      let W = Symbol("internal response"), X = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function Y(a10, b10) {
        var c10;
        if (null == a10 || null == (c10 = a10.request) ? void 0 : c10.headers) {
          if (!(a10.request.headers instanceof Headers)) throw Object.defineProperty(Error("request.headers must be an instance of Headers"), "__NEXT_ERROR_CODE", { value: "E119", enumerable: false, configurable: true });
          let c11 = [];
          for (let [d10, e10] of a10.request.headers) b10.set("x-middleware-request-" + d10, e10), c11.push(d10);
          b10.set("x-middleware-override-headers", c11.join(","));
        }
      }
      class Z extends Response {
        constructor(a10, b10 = {}) {
          super(a10, b10);
          let c10 = this.headers, d10 = new Proxy(new S.ResponseCookies(c10), { get(a11, d11, e10) {
            switch (d11) {
              case "delete":
              case "set":
                return (...e11) => {
                  let f10 = Reflect.apply(a11[d11], a11, e11), g10 = new Headers(c10);
                  return f10 instanceof S.ResponseCookies && c10.set("x-middleware-set-cookie", f10.getAll().map((a12) => (0, S.stringifyCookie)(a12)).join(",")), Y(b10, g10), f10;
                };
              default:
                return V.get(a11, d11, e10);
            }
          } });
          this[W] = { cookies: d10, url: b10.url ? new R(b10.url, { headers: A(c10), nextConfig: b10.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[W].cookies;
        }
        static json(a10, b10) {
          let c10 = Response.json(a10, b10);
          return new Z(c10.body, c10);
        }
        static redirect(a10, b10) {
          let c10 = "number" == typeof b10 ? b10 : (null == b10 ? void 0 : b10.status) ?? 307;
          if (!X.has(c10)) throw Object.defineProperty(RangeError('Failed to execute "redirect" on "response": Invalid status code'), "__NEXT_ERROR_CODE", { value: "E529", enumerable: false, configurable: true });
          let d10 = "object" == typeof b10 ? b10 : {}, e10 = new Headers(null == d10 ? void 0 : d10.headers);
          return e10.set("Location", B(a10)), new Z(null, { ...d10, headers: e10, status: c10 });
        }
        static rewrite(a10, b10) {
          let c10 = new Headers(null == b10 ? void 0 : b10.headers);
          return c10.set("x-middleware-rewrite", B(a10)), Y(b10, c10), new Z(null, { ...b10, headers: c10 });
        }
        static next(a10) {
          let b10 = new Headers(null == a10 ? void 0 : a10.headers);
          return b10.set("x-middleware-next", "1"), Y(a10, b10), new Z(null, { ...a10, headers: b10 });
        }
      }
      function $(a10, b10) {
        let c10 = "string" == typeof b10 ? new URL(b10) : b10, d10 = new URL(a10, b10), e10 = d10.origin === c10.origin;
        return { url: e10 ? d10.toString().slice(c10.origin.length) : d10.toString(), isRelative: e10 };
      }
      let _ = "next-router-prefetch", aa = ["rsc", "next-router-state-tree", _, "next-hmr-refresh", "next-router-segment-prefetch"], ab = "_rsc";
      class ac extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new ac();
        }
      }
      class ad extends Headers {
        constructor(a10) {
          super(), this.headers = new Proxy(a10, { get(b10, c10, d10) {
            if ("symbol" == typeof c10) return V.get(b10, c10, d10);
            let e10 = c10.toLowerCase(), f10 = Object.keys(a10).find((a11) => a11.toLowerCase() === e10);
            if (void 0 !== f10) return V.get(b10, f10, d10);
          }, set(b10, c10, d10, e10) {
            if ("symbol" == typeof c10) return V.set(b10, c10, d10, e10);
            let f10 = c10.toLowerCase(), g10 = Object.keys(a10).find((a11) => a11.toLowerCase() === f10);
            return V.set(b10, g10 ?? c10, d10, e10);
          }, has(b10, c10) {
            if ("symbol" == typeof c10) return V.has(b10, c10);
            let d10 = c10.toLowerCase(), e10 = Object.keys(a10).find((a11) => a11.toLowerCase() === d10);
            return void 0 !== e10 && V.has(b10, e10);
          }, deleteProperty(b10, c10) {
            if ("symbol" == typeof c10) return V.deleteProperty(b10, c10);
            let d10 = c10.toLowerCase(), e10 = Object.keys(a10).find((a11) => a11.toLowerCase() === d10);
            return void 0 === e10 || V.deleteProperty(b10, e10);
          } });
        }
        static seal(a10) {
          return new Proxy(a10, { get(a11, b10, c10) {
            switch (b10) {
              case "append":
              case "delete":
              case "set":
                return ac.callable;
              default:
                return V.get(a11, b10, c10);
            }
          } });
        }
        merge(a10) {
          return Array.isArray(a10) ? a10.join(", ") : a10;
        }
        static from(a10) {
          return a10 instanceof Headers ? a10 : new ad(a10);
        }
        append(a10, b10) {
          let c10 = this.headers[a10];
          "string" == typeof c10 ? this.headers[a10] = [c10, b10] : Array.isArray(c10) ? c10.push(b10) : this.headers[a10] = b10;
        }
        delete(a10) {
          delete this.headers[a10];
        }
        get(a10) {
          let b10 = this.headers[a10];
          return void 0 !== b10 ? this.merge(b10) : null;
        }
        has(a10) {
          return void 0 !== this.headers[a10];
        }
        set(a10, b10) {
          this.headers[a10] = b10;
        }
        forEach(a10, b10) {
          for (let [c10, d10] of this.entries()) a10.call(b10, d10, c10, this);
        }
        *entries() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = a10.toLowerCase(), c10 = this.get(b10);
            yield [b10, c10];
          }
        }
        *keys() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = a10.toLowerCase();
            yield b10;
          }
        }
        *values() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = this.get(a10);
            yield b10;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      var ae = c(379);
      class af extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
        }
        static callable() {
          throw new af();
        }
      }
      class ag {
        static seal(a10) {
          return new Proxy(a10, { get(a11, b10, c10) {
            switch (b10) {
              case "clear":
              case "delete":
              case "set":
                return af.callable;
              default:
                return V.get(a11, b10, c10);
            }
          } });
        }
      }
      let ah = Symbol.for("next.mutated.cookies");
      class ai {
        static wrap(a10, b10) {
          let c10 = new S.ResponseCookies(new Headers());
          for (let b11 of a10.getAll()) c10.set(b11);
          let d10 = [], e10 = /* @__PURE__ */ new Set(), f10 = () => {
            let a11 = ae.J.getStore();
            if (a11 && (a11.pathWasRevalidated = true), d10 = c10.getAll().filter((a12) => e10.has(a12.name)), b10) {
              let a12 = [];
              for (let b11 of d10) {
                let c11 = new S.ResponseCookies(new Headers());
                c11.set(b11), a12.push(c11.toString());
              }
              b10(a12);
            }
          }, g10 = new Proxy(c10, { get(a11, b11, c11) {
            switch (b11) {
              case ah:
                return d10;
              case "delete":
                return function(...b12) {
                  e10.add("string" == typeof b12[0] ? b12[0] : b12[0].name);
                  try {
                    return a11.delete(...b12), g10;
                  } finally {
                    f10();
                  }
                };
              case "set":
                return function(...b12) {
                  e10.add("string" == typeof b12[0] ? b12[0] : b12[0].name);
                  try {
                    return a11.set(...b12), g10;
                  } finally {
                    f10();
                  }
                };
              default:
                return V.get(a11, b11, c11);
            }
          } });
          return g10;
        }
      }
      function aj(a10) {
        return "action" === a10.phase;
      }
      function ak(a10, b10) {
        if (!aj(a10)) throw new af();
      }
      var al = function(a10) {
        return a10.handleRequest = "BaseServer.handleRequest", a10.run = "BaseServer.run", a10.pipe = "BaseServer.pipe", a10.getStaticHTML = "BaseServer.getStaticHTML", a10.render = "BaseServer.render", a10.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", a10.renderToResponse = "BaseServer.renderToResponse", a10.renderToHTML = "BaseServer.renderToHTML", a10.renderError = "BaseServer.renderError", a10.renderErrorToResponse = "BaseServer.renderErrorToResponse", a10.renderErrorToHTML = "BaseServer.renderErrorToHTML", a10.render404 = "BaseServer.render404", a10;
      }(al || {}), am = function(a10) {
        return a10.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", a10.loadComponents = "LoadComponents.loadComponents", a10;
      }(am || {}), an = function(a10) {
        return a10.getRequestHandler = "NextServer.getRequestHandler", a10.getServer = "NextServer.getServer", a10.getServerRequestHandler = "NextServer.getServerRequestHandler", a10.createServer = "createServer.createServer", a10;
      }(an || {}), ao = function(a10) {
        return a10.compression = "NextNodeServer.compression", a10.getBuildId = "NextNodeServer.getBuildId", a10.createComponentTree = "NextNodeServer.createComponentTree", a10.clientComponentLoading = "NextNodeServer.clientComponentLoading", a10.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", a10.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", a10.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", a10.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", a10.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", a10.sendRenderResult = "NextNodeServer.sendRenderResult", a10.proxyRequest = "NextNodeServer.proxyRequest", a10.runApi = "NextNodeServer.runApi", a10.render = "NextNodeServer.render", a10.renderHTML = "NextNodeServer.renderHTML", a10.imageOptimizer = "NextNodeServer.imageOptimizer", a10.getPagePath = "NextNodeServer.getPagePath", a10.getRoutesManifest = "NextNodeServer.getRoutesManifest", a10.findPageComponents = "NextNodeServer.findPageComponents", a10.getFontManifest = "NextNodeServer.getFontManifest", a10.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", a10.getRequestHandler = "NextNodeServer.getRequestHandler", a10.renderToHTML = "NextNodeServer.renderToHTML", a10.renderError = "NextNodeServer.renderError", a10.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", a10.render404 = "NextNodeServer.render404", a10.startResponse = "NextNodeServer.startResponse", a10.route = "route", a10.onProxyReq = "onProxyReq", a10.apiResolver = "apiResolver", a10.internalFetch = "internalFetch", a10;
      }(ao || {}), ap = function(a10) {
        return a10.startServer = "startServer.startServer", a10;
      }(ap || {}), aq = function(a10) {
        return a10.getServerSideProps = "Render.getServerSideProps", a10.getStaticProps = "Render.getStaticProps", a10.renderToString = "Render.renderToString", a10.renderDocument = "Render.renderDocument", a10.createBodyResult = "Render.createBodyResult", a10;
      }(aq || {}), ar = function(a10) {
        return a10.renderToString = "AppRender.renderToString", a10.renderToReadableStream = "AppRender.renderToReadableStream", a10.getBodyResult = "AppRender.getBodyResult", a10.fetch = "AppRender.fetch", a10;
      }(ar || {}), as = function(a10) {
        return a10.executeRoute = "Router.executeRoute", a10;
      }(as || {}), at = function(a10) {
        return a10.runHandler = "Node.runHandler", a10;
      }(at || {}), au = function(a10) {
        return a10.runHandler = "AppRouteRouteHandlers.runHandler", a10;
      }(au || {}), av = function(a10) {
        return a10.generateMetadata = "ResolveMetadata.generateMetadata", a10.generateViewport = "ResolveMetadata.generateViewport", a10;
      }(av || {}), aw = function(a10) {
        return a10.execute = "Middleware.execute", a10;
      }(aw || {});
      let ax = ["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"], ay = ["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"];
      function az(a10) {
        return null !== a10 && "object" == typeof a10 && "then" in a10 && "function" == typeof a10.then;
      }
      let { context: aA, propagation: aB, trace: aC, SpanStatusCode: aD, SpanKind: aE, ROOT_CONTEXT: aF } = d = c(817);
      class aG extends Error {
        constructor(a10, b10) {
          super(), this.bubble = a10, this.result = b10;
        }
      }
      let aH = (a10, b10) => {
        (function(a11) {
          return "object" == typeof a11 && null !== a11 && a11 instanceof aG;
        })(b10) && b10.bubble ? a10.setAttribute("next.bubble", true) : (b10 && (a10.recordException(b10), a10.setAttribute("error.type", b10.name)), a10.setStatus({ code: aD.ERROR, message: null == b10 ? void 0 : b10.message })), a10.end();
      }, aI = /* @__PURE__ */ new Map(), aJ = d.createContextKey("next.rootSpanId"), aK = 0, aL = { set(a10, b10, c10) {
        a10.push({ key: b10, value: c10 });
      } };
      class aM {
        getTracerInstance() {
          return aC.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return aA;
        }
        getTracePropagationData() {
          let a10 = aA.active(), b10 = [];
          return aB.inject(a10, b10, aL), b10;
        }
        getActiveScopeSpan() {
          return aC.getSpan(null == aA ? void 0 : aA.active());
        }
        withPropagatedContext(a10, b10, c10) {
          let d10 = aA.active();
          if (aC.getSpanContext(d10)) return b10();
          let e10 = aB.extract(d10, a10, c10);
          return aA.with(e10, b10);
        }
        trace(...a10) {
          var b10;
          let [c10, d10, e10] = a10, { fn: f10, options: g10 } = "function" == typeof d10 ? { fn: d10, options: {} } : { fn: e10, options: { ...d10 } }, h10 = g10.spanName ?? c10;
          if (!ax.includes(c10) && "1" !== process.env.NEXT_OTEL_VERBOSE || g10.hideSpan) return f10();
          let i10 = this.getSpanContext((null == g10 ? void 0 : g10.parentSpan) ?? this.getActiveScopeSpan()), j10 = false;
          i10 ? (null == (b10 = aC.getSpanContext(i10)) ? void 0 : b10.isRemote) && (j10 = true) : (i10 = (null == aA ? void 0 : aA.active()) ?? aF, j10 = true);
          let k10 = aK++;
          return g10.attributes = { "next.span_name": h10, "next.span_type": c10, ...g10.attributes }, aA.with(i10.setValue(aJ, k10), () => this.getTracerInstance().startActiveSpan(h10, g10, (a11) => {
            let b11 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0, d11 = () => {
              aI.delete(k10), b11 && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && ay.includes(c10 || "") && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(c10.split(".").pop() || "").replace(/[A-Z]/g, (a12) => "-" + a12.toLowerCase())}`, { start: b11, end: performance.now() });
            };
            j10 && aI.set(k10, new Map(Object.entries(g10.attributes ?? {})));
            try {
              if (f10.length > 1) return f10(a11, (b13) => aH(a11, b13));
              let b12 = f10(a11);
              if (az(b12)) return b12.then((b13) => (a11.end(), b13)).catch((b13) => {
                throw aH(a11, b13), b13;
              }).finally(d11);
              return a11.end(), d11(), b12;
            } catch (b12) {
              throw aH(a11, b12), d11(), b12;
            }
          }));
        }
        wrap(...a10) {
          let b10 = this, [c10, d10, e10] = 3 === a10.length ? a10 : [a10[0], {}, a10[1]];
          return ax.includes(c10) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let a11 = d10;
            "function" == typeof a11 && "function" == typeof e10 && (a11 = a11.apply(this, arguments));
            let f10 = arguments.length - 1, g10 = arguments[f10];
            if ("function" != typeof g10) return b10.trace(c10, a11, () => e10.apply(this, arguments));
            {
              let d11 = b10.getContext().bind(aA.active(), g10);
              return b10.trace(c10, a11, (a12, b11) => (arguments[f10] = function(a13) {
                return null == b11 || b11(a13), d11.apply(this, arguments);
              }, e10.apply(this, arguments)));
            }
          } : e10;
        }
        startSpan(...a10) {
          let [b10, c10] = a10, d10 = this.getSpanContext((null == c10 ? void 0 : c10.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(b10, c10, d10);
        }
        getSpanContext(a10) {
          return a10 ? aC.setSpan(aA.active(), a10) : void 0;
        }
        getRootSpanAttributes() {
          let a10 = aA.active().getValue(aJ);
          return aI.get(a10);
        }
        setRootSpanAttribute(a10, b10) {
          let c10 = aA.active().getValue(aJ), d10 = aI.get(c10);
          d10 && d10.set(a10, b10);
        }
      }
      let aN = (() => {
        let a10 = new aM();
        return () => a10;
      })(), aO = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(aO);
      class aP {
        constructor(a10, b10, c10, d10) {
          var e10;
          let f10 = a10 && function(a11, b11) {
            let c11 = ad.from(a11.headers);
            return { isOnDemandRevalidate: c11.get("x-prerender-revalidate") === b11.previewModeId, revalidateOnlyGenerated: c11.has("x-prerender-revalidate-if-generated") };
          }(b10, a10).isOnDemandRevalidate, g10 = null == (e10 = c10.get(aO)) ? void 0 : e10.value;
          this._isEnabled = !!(!f10 && g10 && a10 && g10 === a10.previewModeId), this._previewModeId = null == a10 ? void 0 : a10.previewModeId, this._mutableCookies = d10;
        }
        get isEnabled() {
          return this._isEnabled;
        }
        enable() {
          if (!this._previewModeId) throw Object.defineProperty(Error("Invariant: previewProps missing previewModeId this should never happen"), "__NEXT_ERROR_CODE", { value: "E93", enumerable: false, configurable: true });
          this._mutableCookies.set({ name: aO, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" }), this._isEnabled = true;
        }
        disable() {
          this._mutableCookies.set({ name: aO, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) }), this._isEnabled = false;
        }
      }
      function aQ(a10, b10) {
        if ("x-middleware-set-cookie" in a10.headers && "string" == typeof a10.headers["x-middleware-set-cookie"]) {
          let c10 = a10.headers["x-middleware-set-cookie"], d10 = new Headers();
          for (let a11 of z(c10)) d10.append("set-cookie", a11);
          for (let a11 of new S.ResponseCookies(d10).getAll()) b10.set(a11);
        }
      }
      var aR = c(128), aS = c(213), aT = c.n(aS), aU = c(809);
      class aV {
        constructor(a10, b10, c10) {
          this.prev = null, this.next = null, this.key = a10, this.data = b10, this.size = c10;
        }
      }
      class aW {
        constructor() {
          this.prev = null, this.next = null;
        }
      }
      class aX {
        constructor(a10, b10) {
          this.cache = /* @__PURE__ */ new Map(), this.totalSize = 0, this.maxSize = a10, this.calculateSize = b10, this.head = new aW(), this.tail = new aW(), this.head.next = this.tail, this.tail.prev = this.head;
        }
        addToHead(a10) {
          a10.prev = this.head, a10.next = this.head.next, this.head.next.prev = a10, this.head.next = a10;
        }
        removeNode(a10) {
          a10.prev.next = a10.next, a10.next.prev = a10.prev;
        }
        moveToHead(a10) {
          this.removeNode(a10), this.addToHead(a10);
        }
        removeTail() {
          let a10 = this.tail.prev;
          return this.removeNode(a10), a10;
        }
        set(a10, b10) {
          let c10 = (null == this.calculateSize ? void 0 : this.calculateSize.call(this, b10)) ?? 1;
          if (c10 > this.maxSize) return void console.warn("Single item size exceeds maxSize");
          let d10 = this.cache.get(a10);
          if (d10) d10.data = b10, this.totalSize = this.totalSize - d10.size + c10, d10.size = c10, this.moveToHead(d10);
          else {
            let d11 = new aV(a10, b10, c10);
            this.cache.set(a10, d11), this.addToHead(d11), this.totalSize += c10;
          }
          for (; this.totalSize > this.maxSize && this.cache.size > 0; ) {
            let a11 = this.removeTail();
            this.cache.delete(a11.key), this.totalSize -= a11.size;
          }
        }
        has(a10) {
          return this.cache.has(a10);
        }
        get(a10) {
          let b10 = this.cache.get(a10);
          if (b10) return this.moveToHead(b10), b10.data;
        }
        *[Symbol.iterator]() {
          let a10 = this.head.next;
          for (; a10 && a10 !== this.tail; ) {
            let b10 = a10;
            yield [b10.key, b10.data], a10 = a10.next;
          }
        }
        remove(a10) {
          let b10 = this.cache.get(a10);
          b10 && (this.removeNode(b10), this.cache.delete(a10), this.totalSize -= b10.size);
        }
        get size() {
          return this.cache.size;
        }
        get currentSize() {
          return this.totalSize;
        }
      }
      c(356).Buffer, new aX(52428800, (a10) => a10.size), process.env.NEXT_PRIVATE_DEBUG_CACHE && console.debug.bind(console, "DefaultCacheHandler:"), process.env.NEXT_PRIVATE_DEBUG_CACHE && ((a10, ...b10) => {
        console.log(`use-cache: ${a10}`, ...b10);
      }), Symbol.for("@next/cache-handlers");
      let aY = Symbol.for("@next/cache-handlers-map"), aZ = Symbol.for("@next/cache-handlers-set"), a$ = globalThis;
      function a_() {
        if (a$[aY]) return a$[aY].entries();
      }
      async function a0(a10, b10) {
        if (!a10) return b10();
        let c10 = a1(a10);
        try {
          return await b10();
        } finally {
          let b11 = function(a11, b12) {
            let c11 = new Set(a11.pendingRevalidatedTags), d10 = new Set(a11.pendingRevalidateWrites);
            return { pendingRevalidatedTags: b12.pendingRevalidatedTags.filter((a12) => !c11.has(a12)), pendingRevalidates: Object.fromEntries(Object.entries(b12.pendingRevalidates).filter(([b13]) => !(b13 in a11.pendingRevalidates))), pendingRevalidateWrites: b12.pendingRevalidateWrites.filter((a12) => !d10.has(a12)) };
          }(c10, a1(a10));
          await a3(a10, b11);
        }
      }
      function a1(a10) {
        return { pendingRevalidatedTags: a10.pendingRevalidatedTags ? [...a10.pendingRevalidatedTags] : [], pendingRevalidates: { ...a10.pendingRevalidates }, pendingRevalidateWrites: a10.pendingRevalidateWrites ? [...a10.pendingRevalidateWrites] : [] };
      }
      async function a2(a10, b10) {
        if (0 === a10.length) return;
        let c10 = [];
        b10 && c10.push(b10.revalidateTag(a10));
        let d10 = function() {
          if (a$[aZ]) return a$[aZ].values();
        }();
        if (d10) for (let b11 of d10) c10.push(b11.expireTags(...a10));
        await Promise.all(c10);
      }
      async function a3(a10, b10) {
        let c10 = (null == b10 ? void 0 : b10.pendingRevalidatedTags) ?? a10.pendingRevalidatedTags ?? [], d10 = (null == b10 ? void 0 : b10.pendingRevalidates) ?? a10.pendingRevalidates ?? {}, e10 = (null == b10 ? void 0 : b10.pendingRevalidateWrites) ?? a10.pendingRevalidateWrites ?? [];
        return Promise.all([a2(c10, a10.incrementalCache), ...Object.values(d10), ...e10]);
      }
      let a4 = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class a5 {
        disable() {
          throw a4;
        }
        getStore() {
        }
        run() {
          throw a4;
        }
        exit() {
          throw a4;
        }
        enterWith() {
          throw a4;
        }
        static bind(a10) {
          return a10;
        }
      }
      let a6 = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage, a7 = a6 ? new a6() : new a5();
      class a8 {
        constructor({ waitUntil: a10, onClose: b10, onTaskError: c10 }) {
          this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = a10, this.onClose = b10, this.onTaskError = c10, this.callbackQueue = new (aT())(), this.callbackQueue.pause();
        }
        after(a10) {
          if (az(a10)) this.waitUntil || a9(), this.waitUntil(a10.catch((a11) => this.reportTaskError("promise", a11)));
          else if ("function" == typeof a10) this.addCallback(a10);
          else throw Object.defineProperty(Error("`after()`: Argument must be a promise or a function"), "__NEXT_ERROR_CODE", { value: "E50", enumerable: false, configurable: true });
        }
        addCallback(a10) {
          var b10;
          this.waitUntil || a9();
          let c10 = aR.FP.getStore();
          c10 && this.workUnitStores.add(c10);
          let d10 = a7.getStore(), e10 = d10 ? d10.rootTaskSpawnPhase : null == c10 ? void 0 : c10.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let f10 = (b10 = async () => {
            try {
              await a7.run({ rootTaskSpawnPhase: e10 }, () => a10());
            } catch (a11) {
              this.reportTaskError("function", a11);
            }
          }, a6 ? a6.bind(b10) : a5.bind(b10));
          this.callbackQueue.add(f10);
        }
        async runCallbacksOnClose() {
          return await new Promise((a10) => this.onClose(a10)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          for (let a11 of this.workUnitStores) a11.phase = "after";
          let a10 = ae.J.getStore();
          if (!a10) throw Object.defineProperty(new aU.z("Missing workStore in AfterContext.runCallbacks"), "__NEXT_ERROR_CODE", { value: "E547", enumerable: false, configurable: true });
          return a0(a10, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(a10, b10) {
          if (console.error("promise" === a10 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", b10), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, b10);
          } catch (a11) {
            console.error(Object.defineProperty(new aU.z("`onTaskError` threw while handling an error thrown from an `after` task", { cause: a11 }), "__NEXT_ERROR_CODE", { value: "E569", enumerable: false, configurable: true }));
          }
        }
      }
      function a9() {
        throw Object.defineProperty(Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment."), "__NEXT_ERROR_CODE", { value: "E91", enumerable: false, configurable: true });
      }
      function ba(a10) {
        let b10, c10 = { then: (d10, e10) => (b10 || (b10 = a10()), b10.then((a11) => {
          c10.value = a11;
        }).catch(() => {
        }), b10.then(d10, e10)) };
        return c10;
      }
      class bb {
        onClose(a10) {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot subscribe to a closed CloseController"), "__NEXT_ERROR_CODE", { value: "E365", enumerable: false, configurable: true });
          this.target.addEventListener("close", a10), this.listeners++;
        }
        dispatchClose() {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot close a CloseController multiple times"), "__NEXT_ERROR_CODE", { value: "E229", enumerable: false, configurable: true });
          this.listeners > 0 && this.target.dispatchEvent(new Event("close")), this.isClosed = true;
        }
        constructor() {
          this.target = new EventTarget(), this.listeners = 0, this.isClosed = false;
        }
      }
      function bc() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID || "", previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      let bd = Symbol.for("@next/request-context");
      async function be(a10, b10, c10) {
        let d10 = [], e10 = c10 && c10.size > 0;
        for (let b11 of ((a11) => {
          let b12 = ["/layout"];
          if (a11.startsWith("/")) {
            let c11 = a11.split("/");
            for (let a12 = 1; a12 < c11.length + 1; a12++) {
              let d11 = c11.slice(0, a12).join("/");
              d11 && (d11.endsWith("/page") || d11.endsWith("/route") || (d11 = `${d11}${!d11.endsWith("/") ? "/" : ""}layout`), b12.push(d11));
            }
          }
          return b12;
        })(a10)) b11 = `${x}${b11}`, d10.push(b11);
        if (b10.pathname && !e10) {
          let a11 = `${x}${b10.pathname}`;
          d10.push(a11);
        }
        return { tags: d10, expirationsByCacheKind: function(a11) {
          let b11 = /* @__PURE__ */ new Map(), c11 = a_();
          if (c11) for (let [d11, e11] of c11) "getExpiration" in e11 && b11.set(d11, ba(async () => e11.getExpiration(...a11)));
          return b11;
        }(d10) };
      }
      class bf extends U {
        constructor(a10) {
          super(a10.input, a10.init), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new u({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new u({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        waitUntil() {
          throw Object.defineProperty(new u({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      let bg = { keys: (a10) => Array.from(a10.keys()), get: (a10, b10) => a10.get(b10) ?? void 0 }, bh = (a10, b10) => aN().withPropagatedContext(a10.headers, b10, bg), bi = false;
      async function bj(a10) {
        var b10;
        let d10, e10;
        if (!bi && (bi = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
          let { interceptTestApis: a11, wrapRequestHandler: b11 } = c(720);
          a11(), bh = b11(bh);
        }
        await s();
        let f10 = void 0 !== globalThis.__BUILD_MANIFEST;
        a10.request.url = a10.request.url.replace(/\.rsc($|\?)/, "$1");
        let g10 = a10.bypassNextUrl ? new URL(a10.request.url) : new R(a10.request.url, { headers: a10.request.headers, nextConfig: a10.request.nextConfig });
        for (let a11 of [...g10.searchParams.keys()]) {
          let b11 = g10.searchParams.getAll(a11), c10 = function(a12) {
            for (let b12 of ["nxtP", "nxtI"]) if (a12 !== b12 && a12.startsWith(b12)) return a12.substring(b12.length);
            return null;
          }(a11);
          if (c10) {
            for (let a12 of (g10.searchParams.delete(c10), b11)) g10.searchParams.append(c10, a12);
            g10.searchParams.delete(a11);
          }
        }
        let h10 = process.env.__NEXT_BUILD_ID || "";
        "buildId" in g10 && (h10 = g10.buildId || "", g10.buildId = "");
        let i10 = function(a11) {
          let b11 = new Headers();
          for (let [c10, d11] of Object.entries(a11)) for (let a12 of Array.isArray(d11) ? d11 : [d11]) void 0 !== a12 && ("number" == typeof a12 && (a12 = a12.toString()), b11.append(c10, a12));
          return b11;
        }(a10.request.headers), j10 = i10.has("x-nextjs-data"), k10 = "1" === i10.get("rsc");
        j10 && "/index" === g10.pathname && (g10.pathname = "/");
        let l10 = /* @__PURE__ */ new Map();
        if (!f10) for (let a11 of aa) {
          let b11 = i10.get(a11);
          null !== b11 && (l10.set(a11, b11), i10.delete(a11));
        }
        let m10 = g10.searchParams.get(ab), n10 = new bf({ page: a10.page, input: function(a11) {
          let b11 = "string" == typeof a11, c10 = b11 ? new URL(a11) : a11;
          return c10.searchParams.delete(ab), b11 ? c10.toString() : c10;
        }(g10).toString(), init: { body: a10.request.body, headers: i10, method: a10.request.method, nextConfig: a10.request.nextConfig, signal: a10.request.signal } });
        j10 && Object.defineProperty(n10, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && a10.IncrementalCache && (globalThis.__incrementalCache = new a10.IncrementalCache({ CurCacheHandler: a10.incrementalCacheHandler, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: a10.request.headers, getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: bc() }) }));
        let o10 = a10.request.waitUntil ?? (null == (b10 = function() {
          let a11 = globalThis[bd];
          return null == a11 ? void 0 : a11.get();
        }()) ? void 0 : b10.waitUntil), p10 = new G({ request: n10, page: a10.page, context: o10 ? { waitUntil: o10 } : void 0 });
        if ((d10 = await bh(n10, () => {
          if ("/middleware" === a10.page || "/src/middleware" === a10.page) {
            let b11 = p10.waitUntil.bind(p10), c10 = new bb();
            return aN().trace(aw.execute, { spanName: `middleware ${n10.method} ${n10.nextUrl.pathname}`, attributes: { "http.target": n10.nextUrl.pathname, "http.method": n10.method } }, async () => {
              try {
                var d11, f11, g11, i11, j11, k11;
                let l11 = bc(), m11 = await be("/", n10.nextUrl, null), o11 = (j11 = n10.nextUrl, k11 = (a11) => {
                  e10 = a11;
                }, function(a11, b12, c11, d12, e11, f12, g12, h11, i12, j12, k12, l12) {
                  function m12(a12) {
                    c11 && c11.setHeader("Set-Cookie", a12);
                  }
                  let n11 = {};
                  return { type: "request", phase: a11, implicitTags: f12, url: { pathname: d12.pathname, search: d12.search ?? "" }, rootParams: e11, get headers() {
                    return n11.headers || (n11.headers = function(a12) {
                      let b13 = ad.from(a12);
                      for (let a13 of aa) b13.delete(a13);
                      return ad.seal(b13);
                    }(b12.headers)), n11.headers;
                  }, get cookies() {
                    if (!n11.cookies) {
                      let a12 = new S.RequestCookies(ad.from(b12.headers));
                      aQ(b12, a12), n11.cookies = ag.seal(a12);
                    }
                    return n11.cookies;
                  }, set cookies(value) {
                    n11.cookies = value;
                  }, get mutableCookies() {
                    if (!n11.mutableCookies) {
                      let a12 = function(a13, b13) {
                        let c12 = new S.RequestCookies(ad.from(a13));
                        return ai.wrap(c12, b13);
                      }(b12.headers, g12 || (c11 ? m12 : void 0));
                      aQ(b12, a12), n11.mutableCookies = a12;
                    }
                    return n11.mutableCookies;
                  }, get userspaceMutableCookies() {
                    return n11.userspaceMutableCookies || (n11.userspaceMutableCookies = function(a12) {
                      let b13 = new Proxy(a12.mutableCookies, { get(c12, d13, e12) {
                        switch (d13) {
                          case "delete":
                            return function(...d14) {
                              return ak(a12, "cookies().delete"), c12.delete(...d14), b13;
                            };
                          case "set":
                            return function(...d14) {
                              return ak(a12, "cookies().set"), c12.set(...d14), b13;
                            };
                          default:
                            return V.get(c12, d13, e12);
                        }
                      } });
                      return b13;
                    }(this)), n11.userspaceMutableCookies;
                  }, get draftMode() {
                    return n11.draftMode || (n11.draftMode = new aP(i12, b12, this.cookies, this.mutableCookies)), n11.draftMode;
                  }, renderResumeDataCache: h11 ?? null, isHmrRefresh: j12, serverComponentsHmrCache: k12 || globalThis.__serverComponentsHmrCache, devFallbackParams: null };
                }("action", n10, void 0, j11, {}, m11, k11, void 0, l11, false, void 0, null)), q4 = function({ page: a11, renderOpts: b12, isPrefetchRequest: c11, buildId: d12, previouslyRevalidatedTags: e11 }) {
                  var f12;
                  let g12 = !b12.shouldWaitOnAllReady && !b12.supportsDynamicResponse && !b12.isDraftMode && !b12.isPossibleServerAction, h11 = b12.dev ?? false, i12 = h11 || g12 && (!!process.env.NEXT_DEBUG_BUILD || "1" === process.env.NEXT_SSG_FETCH_METRICS), j12 = { isStaticGeneration: g12, page: a11, route: (f12 = a11.split("/").reduce((a12, b13, c12, d13) => b13 ? "(" === b13[0] && b13.endsWith(")") || "@" === b13[0] || ("page" === b13 || "route" === b13) && c12 === d13.length - 1 ? a12 : a12 + "/" + b13 : a12, "")).startsWith("/") ? f12 : "/" + f12, incrementalCache: b12.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: b12.cacheLifeProfiles, isRevalidate: b12.isRevalidate, isBuildTimePrerendering: b12.nextExport, hasReadableErrorStacks: b12.hasReadableErrorStacks, fetchCache: b12.fetchCache, isOnDemandRevalidate: b12.isOnDemandRevalidate, isDraftMode: b12.isDraftMode, isPrefetchRequest: c11, buildId: d12, reactLoadableManifest: (null == b12 ? void 0 : b12.reactLoadableManifest) || {}, assetPrefix: (null == b12 ? void 0 : b12.assetPrefix) || "", afterContext: function(a12) {
                    let { waitUntil: b13, onClose: c12, onAfterTaskError: d13 } = a12;
                    return new a8({ waitUntil: b13, onClose: c12, onTaskError: d13 });
                  }(b12), cacheComponentsEnabled: b12.experimental.cacheComponents, dev: h11, previouslyRevalidatedTags: e11, refreshTagsByCacheKind: function() {
                    let a12 = /* @__PURE__ */ new Map(), b13 = a_();
                    if (b13) for (let [c12, d13] of b13) "refreshTags" in d13 && a12.set(c12, ba(async () => d13.refreshTags()));
                    return a12;
                  }(), runInCleanSnapshot: a6 ? a6.snapshot() : function(a12, ...b13) {
                    return a12(...b13);
                  }, shouldTrackFetchMetrics: i12 };
                  return b12.store = j12, j12;
                }({ page: "/", renderOpts: { cacheLifeProfiles: null == (f11 = a10.request.nextConfig) || null == (d11 = f11.experimental) ? void 0 : d11.cacheLife, experimental: { isRoutePPREnabled: false, cacheComponents: false, authInterrupts: !!(null == (i11 = a10.request.nextConfig) || null == (g11 = i11.experimental) ? void 0 : g11.authInterrupts) }, supportsDynamicResponse: true, waitUntil: b11, onClose: c10.onClose.bind(c10), onAfterTaskError: void 0 }, isPrefetchRequest: "1" === n10.headers.get(_), buildId: h10 ?? "", previouslyRevalidatedTags: [] });
                return await ae.J.run(q4, () => aR.FP.run(o11, a10.handler, n10, p10));
              } finally {
                setTimeout(() => {
                  c10.dispatchClose();
                }, 0);
              }
            });
          }
          return a10.handler(n10, p10);
        })) && !(d10 instanceof Response)) throw Object.defineProperty(TypeError("Expected an instance of Response to be returned"), "__NEXT_ERROR_CODE", { value: "E567", enumerable: false, configurable: true });
        d10 && e10 && d10.headers.set("set-cookie", e10);
        let q3 = null == d10 ? void 0 : d10.headers.get("x-middleware-rewrite");
        if (d10 && q3 && (k10 || !f10)) {
          let b11 = new R(q3, { forceLocale: true, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          f10 || b11.host !== n10.nextUrl.host || (b11.buildId = h10 || b11.buildId, d10.headers.set("x-middleware-rewrite", String(b11)));
          let { url: c10, isRelative: e11 } = $(b11.toString(), g10.toString());
          !f10 && j10 && d10.headers.set("x-nextjs-rewrite", c10), k10 && e11 && (g10.pathname !== b11.pathname && d10.headers.set("x-nextjs-rewritten-path", b11.pathname), g10.search !== b11.search && d10.headers.set("x-nextjs-rewritten-query", b11.search.slice(1)));
        }
        if (d10 && q3 && k10 && m10) {
          let a11 = new URL(q3);
          a11.searchParams.has(ab) || (a11.searchParams.set(ab, m10), d10.headers.set("x-middleware-rewrite", a11.toString()));
        }
        let r2 = null == d10 ? void 0 : d10.headers.get("Location");
        if (d10 && r2 && !f10) {
          let b11 = new R(r2, { forceLocale: false, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          d10 = new Response(d10.body, d10), b11.host === g10.host && (b11.buildId = h10 || b11.buildId, d10.headers.set("Location", b11.toString())), j10 && (d10.headers.delete("Location"), d10.headers.set("x-nextjs-redirect", $(b11.toString(), g10.toString()).url));
        }
        let t2 = d10 || Z.next(), u2 = t2.headers.get("x-middleware-override-headers"), v2 = [];
        if (u2) {
          for (let [a11, b11] of l10) t2.headers.set(`x-middleware-request-${a11}`, b11), v2.push(a11);
          v2.length > 0 && t2.headers.set("x-middleware-override-headers", u2 + "," + v2.join(","));
        }
        return { response: t2, waitUntil: ("internal" === p10[E].kind ? Promise.all(p10[E].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: n10.fetchMetrics };
      }
      c(449), "undefined" == typeof URLPattern || URLPattern;
      var bk = c(107), bl = c(979), bm = c(770);
      function bn() {
        let a10 = a7.getStore();
        return (null == a10 ? void 0 : a10.rootTaskSpawnPhase) === "action";
      }
      c(918);
      let { env: bo, stdout: bp } = (null == (kA = globalThis) ? void 0 : kA.process) ?? {}, bq = bo && !bo.NO_COLOR && (bo.FORCE_COLOR || (null == bp ? void 0 : bp.isTTY) && !bo.CI && "dumb" !== bo.TERM), br = (a10, b10, c10, d10) => {
        let e10 = a10.substring(0, d10) + c10, f10 = a10.substring(d10 + b10.length), g10 = f10.indexOf(b10);
        return ~g10 ? e10 + br(f10, b10, c10, g10) : e10 + f10;
      }, bs = (a10, b10, c10 = a10) => bq ? (d10) => {
        let e10 = "" + d10, f10 = e10.indexOf(b10, a10.length);
        return ~f10 ? a10 + br(e10, b10, c10, f10) + b10 : a10 + e10 + b10;
      } : String, bt = bs("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m");
      bs("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"), bs("\x1B[3m", "\x1B[23m"), bs("\x1B[4m", "\x1B[24m"), bs("\x1B[7m", "\x1B[27m"), bs("\x1B[8m", "\x1B[28m"), bs("\x1B[9m", "\x1B[29m"), bs("\x1B[30m", "\x1B[39m");
      let bu = bs("\x1B[31m", "\x1B[39m"), bv = bs("\x1B[32m", "\x1B[39m"), bw = bs("\x1B[33m", "\x1B[39m");
      bs("\x1B[34m", "\x1B[39m");
      let bx = bs("\x1B[35m", "\x1B[39m");
      bs("\x1B[38;2;173;127;168m", "\x1B[39m"), bs("\x1B[36m", "\x1B[39m");
      let by = bs("\x1B[37m", "\x1B[39m");
      bs("\x1B[90m", "\x1B[39m"), bs("\x1B[40m", "\x1B[49m"), bs("\x1B[41m", "\x1B[49m"), bs("\x1B[42m", "\x1B[49m"), bs("\x1B[43m", "\x1B[49m"), bs("\x1B[44m", "\x1B[49m"), bs("\x1B[45m", "\x1B[49m"), bs("\x1B[46m", "\x1B[49m"), bs("\x1B[47m", "\x1B[49m"), by(bt("\u25CB")), bu(bt("\u2A2F")), bw(bt("\u26A0")), by(bt(" ")), bv(bt("\u2713")), bx(bt("\xBB")), new aX(1e4, (a10) => a10.length), /* @__PURE__ */ new WeakMap();
      let bz = (a10, b10) => {
        if (!a10) return b10;
        let c10 = Number.parseInt(a10, 10);
        return !Number.isFinite(c10) || c10 <= 0 ? b10 : c10;
      }, bA = bz(process.env.RATE_LIMIT_WINDOW_MS, 6e4), bB = bz(process.env.RATE_LIMIT_MAX_REQUESTS, 120), bC = /* @__PURE__ */ new Map(), bD = Symbol.for("__cloudflare-context__");
      function bE() {
        return globalThis[bD];
      }
      function bF() {
        let a10 = globalThis;
        return a10.__NEXT_DATA__?.nextExport === true;
      }
      async function bG() {
        let a10 = bE();
        if (a10) return a10;
        if (bF()) {
          var b10;
          let a11 = await bH();
          return b10 = a11, globalThis[bD] = b10, a11;
        }
        throw Error(bI);
      }
      async function bH(a10) {
        let { getPlatformProxy: b10 } = await import(`${"__wrangler".replaceAll("_", "")}`), c10 = a10?.environment ?? process.env.NEXT_DEV_WRANGLER_ENV, { env: d10, cf: e10, ctx: f10 } = await b10({ ...a10, envFiles: [], environment: c10 });
        return { env: d10, cf: e10, ctx: f10 };
      }
      let bI = '\n\nERROR: `getCloudflareContext` has been called without having called `initOpenNextCloudflareForDev` from the Next.js config file.\nYou should update your Next.js config file as shown below:\n\n   ```\n   // next.config.mjs\n\n   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";\n\n   initOpenNextCloudflareForDev();\n\n   const nextConfig = { ... };\n   export default nextConfig;\n   ```\n\n';
      async function bJ() {
        try {
          let a10 = await function(a11 = { async: false }) {
            return a11.async ? bG() : function() {
              let a12 = bE();
              if (a12) return a12;
              if (bF()) throw Error("\n\nERROR: `getCloudflareContext` has been called in sync mode in either a static route or at the top level of a non-static one, both cases are not allowed but can be solved by either:\n  - make sure that the call is not at the top level and that the route is not static\n  - call `getCloudflareContext({async: true})` to use the `async` mode\n  - avoid calling `getCloudflareContext` in the route\n");
              throw Error(bI);
            }();
          }({ async: true });
          if (!a10.env) return { ...a10, env: {} };
          return a10;
        } catch (a10) {
          return console.warn("[cloudflare-context] Failed to retrieve context (likely build time):", a10), { env: {}, cf: {}, ctx: {} };
        }
      }
      let bK = Symbol.for("drizzle:entityKind");
      function bL(a10, b10) {
        if (!a10 || "object" != typeof a10) return false;
        if (a10 instanceof b10) return true;
        if (!Object.prototype.hasOwnProperty.call(b10, bK)) throw Error(`Class "${b10.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`);
        let c10 = Object.getPrototypeOf(a10).constructor;
        if (c10) for (; c10; ) {
          if (bK in c10 && c10[bK] === b10[bK]) return true;
          c10 = Object.getPrototypeOf(c10);
        }
        return false;
      }
      Symbol.for("drizzle:hasOwnEntityKind");
      class bM {
        constructor(a10, b10) {
          this.table = a10, this.config = b10, this.name = b10.name, this.keyAsName = b10.keyAsName, this.notNull = b10.notNull, this.default = b10.default, this.defaultFn = b10.defaultFn, this.onUpdateFn = b10.onUpdateFn, this.hasDefault = b10.hasDefault, this.primary = b10.primaryKey, this.isUnique = b10.isUnique, this.uniqueName = b10.uniqueName, this.uniqueType = b10.uniqueType, this.dataType = b10.dataType, this.columnType = b10.columnType, this.generated = b10.generated, this.generatedIdentity = b10.generatedIdentity;
        }
        static [bK] = "Column";
        name;
        keyAsName;
        primary;
        notNull;
        default;
        defaultFn;
        onUpdateFn;
        hasDefault;
        isUnique;
        uniqueName;
        uniqueType;
        dataType;
        columnType;
        enumValues = void 0;
        generated = void 0;
        generatedIdentity = void 0;
        config;
        mapFromDriverValue(a10) {
          return a10;
        }
        mapToDriverValue(a10) {
          return a10;
        }
        shouldDisableInsert() {
          return void 0 !== this.config.generated && "byDefault" !== this.config.generated.type;
        }
      }
      let bN = Symbol.for("drizzle:Name"), bO = Symbol.for("drizzle:Schema"), bP = Symbol.for("drizzle:Columns"), bQ = Symbol.for("drizzle:ExtraConfigColumns"), bR = Symbol.for("drizzle:OriginalName"), bS = Symbol.for("drizzle:BaseName"), bT = Symbol.for("drizzle:IsAlias"), bU = Symbol.for("drizzle:ExtraConfigBuilder"), bV = Symbol.for("drizzle:IsDrizzleTable");
      class bW {
        static [bK] = "Table";
        static Symbol = { Name: bN, Schema: bO, OriginalName: bR, Columns: bP, ExtraConfigColumns: bQ, BaseName: bS, IsAlias: bT, ExtraConfigBuilder: bU };
        [bN];
        [bR];
        [bO];
        [bP];
        [bQ];
        [bS];
        [bT] = false;
        [bV] = true;
        [bU] = void 0;
        constructor(a10, b10, c10) {
          this[bN] = this[bR] = a10, this[bO] = b10, this[bS] = c10;
        }
      }
      function bX(a10) {
        return `${a10[bO] ?? "public"}.${a10[bN]}`;
      }
      class bY {
        static [bK] = "ColumnBuilder";
        config;
        constructor(a10, b10, c10) {
          this.config = { name: a10, keyAsName: "" === a10, notNull: false, default: void 0, hasDefault: false, primaryKey: false, isUnique: false, uniqueName: void 0, uniqueType: void 0, dataType: b10, columnType: c10, generated: void 0 };
        }
        $type() {
          return this;
        }
        notNull() {
          return this.config.notNull = true, this;
        }
        default(a10) {
          return this.config.default = a10, this.config.hasDefault = true, this;
        }
        $defaultFn(a10) {
          return this.config.defaultFn = a10, this.config.hasDefault = true, this;
        }
        $default = this.$defaultFn;
        $onUpdateFn(a10) {
          return this.config.onUpdateFn = a10, this.config.hasDefault = true, this;
        }
        $onUpdate = this.$onUpdateFn;
        primaryKey() {
          return this.config.primaryKey = true, this.config.notNull = true, this;
        }
        setName(a10) {
          "" === this.config.name && (this.config.name = a10);
        }
      }
      class bZ {
        static [bK] = "PgForeignKeyBuilder";
        reference;
        _onUpdate = "no action";
        _onDelete = "no action";
        constructor(a10, b10) {
          this.reference = () => {
            let { name: b11, columns: c10, foreignColumns: d10 } = a10();
            return { name: b11, columns: c10, foreignTable: d10[0].table, foreignColumns: d10 };
          }, b10 && (this._onUpdate = b10.onUpdate, this._onDelete = b10.onDelete);
        }
        onUpdate(a10) {
          return this._onUpdate = void 0 === a10 ? "no action" : a10, this;
        }
        onDelete(a10) {
          return this._onDelete = void 0 === a10 ? "no action" : a10, this;
        }
        build(a10) {
          return new b$(a10, this);
        }
      }
      class b$ {
        constructor(a10, b10) {
          this.table = a10, this.reference = b10.reference, this.onUpdate = b10._onUpdate, this.onDelete = b10._onDelete;
        }
        static [bK] = "PgForeignKey";
        reference;
        onUpdate;
        onDelete;
        getName() {
          let { name: a10, columns: b10, foreignColumns: c10 } = this.reference(), d10 = b10.map((a11) => a11.name), e10 = c10.map((a11) => a11.name), f10 = [this.table[bN], ...d10, c10[0].table[bN], ...e10];
          return a10 ?? `${f10.join("_")}_fk`;
        }
      }
      function b_(a10, ...b10) {
        return a10(...b10);
      }
      function b0(a10, b10) {
        return `${a10[bN]}_${b10.join("_")}_unique`;
      }
      class b1 {
        constructor(a10, b10) {
          this.name = b10, this.columns = a10;
        }
        static [bK] = null;
        columns;
        nullsNotDistinctConfig = false;
        nullsNotDistinct() {
          return this.nullsNotDistinctConfig = true, this;
        }
        build(a10) {
          return new b3(a10, this.columns, this.nullsNotDistinctConfig, this.name);
        }
      }
      class b2 {
        static [bK] = null;
        name;
        constructor(a10) {
          this.name = a10;
        }
        on(...a10) {
          return new b1(a10, this.name);
        }
      }
      class b3 {
        constructor(a10, b10, c10, d10) {
          this.table = a10, this.columns = b10, this.name = d10 ?? b0(this.table, this.columns.map((a11) => a11.name)), this.nullsNotDistinct = c10;
        }
        static [bK] = null;
        columns;
        name;
        nullsNotDistinct = false;
        getName() {
          return this.name;
        }
      }
      function b4(a10, b10, c10) {
        for (let d10 = b10; d10 < a10.length; d10++) {
          let e10 = a10[d10];
          if ("\\" === e10) {
            d10++;
            continue;
          }
          if ('"' === e10) return [a10.slice(b10, d10).replace(/\\/g, ""), d10 + 1];
          if (!c10 && ("," === e10 || "}" === e10)) return [a10.slice(b10, d10).replace(/\\/g, ""), d10];
        }
        return [a10.slice(b10).replace(/\\/g, ""), a10.length];
      }
      class b5 extends bY {
        foreignKeyConfigs = [];
        static [bK] = "PgColumnBuilder";
        array(a10) {
          return new b9(this.config.name, this, a10);
        }
        references(a10, b10 = {}) {
          return this.foreignKeyConfigs.push({ ref: a10, actions: b10 }), this;
        }
        unique(a10, b10) {
          return this.config.isUnique = true, this.config.uniqueName = a10, this.config.uniqueType = b10?.nulls, this;
        }
        generatedAlwaysAs(a10) {
          return this.config.generated = { as: a10, type: "always", mode: "stored" }, this;
        }
        buildForeignKeys(a10, b10) {
          return this.foreignKeyConfigs.map(({ ref: c10, actions: d10 }) => b_((c11, d11) => {
            let e10 = new bZ(() => ({ columns: [a10], foreignColumns: [c11()] }));
            return d11.onUpdate && e10.onUpdate(d11.onUpdate), d11.onDelete && e10.onDelete(d11.onDelete), e10.build(b10);
          }, c10, d10));
        }
        buildExtraConfigColumn(a10) {
          return new b7(a10, this.config);
        }
      }
      class b6 extends bM {
        constructor(a10, b10) {
          b10.uniqueName || (b10.uniqueName = b0(a10, [b10.name])), super(a10, b10), this.table = a10;
        }
        static [bK] = "PgColumn";
      }
      class b7 extends b6 {
        static [bK] = "ExtraConfigColumn";
        getSQLType() {
          return this.getSQLType();
        }
        indexConfig = { order: this.config.order ?? "asc", nulls: this.config.nulls ?? "last", opClass: this.config.opClass };
        defaultConfig = { order: "asc", nulls: "last", opClass: void 0 };
        asc() {
          return this.indexConfig.order = "asc", this;
        }
        desc() {
          return this.indexConfig.order = "desc", this;
        }
        nullsFirst() {
          return this.indexConfig.nulls = "first", this;
        }
        nullsLast() {
          return this.indexConfig.nulls = "last", this;
        }
        op(a10) {
          return this.indexConfig.opClass = a10, this;
        }
      }
      class b8 {
        static [bK] = null;
        constructor(a10, b10, c10, d10) {
          this.name = a10, this.keyAsName = b10, this.type = c10, this.indexConfig = d10;
        }
        name;
        keyAsName;
        type;
        indexConfig;
      }
      class b9 extends b5 {
        static [bK] = "PgArrayBuilder";
        constructor(a10, b10, c10) {
          super(a10, "array", "PgArray"), this.config.baseBuilder = b10, this.config.size = c10;
        }
        build(a10) {
          let b10 = this.config.baseBuilder.build(a10);
          return new ca(a10, this.config, b10);
        }
      }
      class ca extends b6 {
        constructor(a10, b10, c10, d10) {
          super(a10, b10), this.baseColumn = c10, this.range = d10, this.size = b10.size;
        }
        size;
        static [bK] = "PgArray";
        getSQLType() {
          return `${this.baseColumn.getSQLType()}[${"number" == typeof this.size ? this.size : ""}]`;
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 && (a10 = function(a11) {
            let [b10] = function a12(b11, c10 = 0) {
              let d10 = [], e10 = c10, f10 = false;
              for (; e10 < b11.length; ) {
                let g10 = b11[e10];
                if ("," === g10) {
                  (f10 || e10 === c10) && d10.push(""), f10 = true, e10++;
                  continue;
                }
                if (f10 = false, "\\" === g10) {
                  e10 += 2;
                  continue;
                }
                if ('"' === g10) {
                  let [a13, c11] = b4(b11, e10 + 1, true);
                  d10.push(a13), e10 = c11;
                  continue;
                }
                if ("}" === g10) return [d10, e10 + 1];
                if ("{" === g10) {
                  let [c11, f11] = a12(b11, e10 + 1);
                  d10.push(c11), e10 = f11;
                  continue;
                }
                let [h10, i10] = b4(b11, e10, false);
                d10.push(h10), e10 = i10;
              }
              return [d10, e10];
            }(a11, 1);
            return b10;
          }(a10)), a10.map((a11) => this.baseColumn.mapFromDriverValue(a11));
        }
        mapToDriverValue(a10, b10 = false) {
          let c10 = a10.map((a11) => null === a11 ? null : bL(this.baseColumn, ca) ? this.baseColumn.mapToDriverValue(a11, true) : this.baseColumn.mapToDriverValue(a11));
          return b10 ? c10 : function a11(b11) {
            return `{${b11.map((b12) => Array.isArray(b12) ? a11(b12) : "string" == typeof b12 ? `"${b12.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : `${b12}`).join(",")}}`;
          }(c10);
        }
      }
      class cb extends b5 {
        static [bK] = "PgEnumObjectColumnBuilder";
        constructor(a10, b10) {
          super(a10, "string", "PgEnumObjectColumn"), this.config.enum = b10;
        }
        build(a10) {
          return new cc(a10, this.config);
        }
      }
      class cc extends b6 {
        static [bK] = "PgEnumObjectColumn";
        enum;
        enumValues = this.config.enum.enumValues;
        constructor(a10, b10) {
          super(a10, b10), this.enum = b10.enum;
        }
        getSQLType() {
          return this.enum.enumName;
        }
      }
      let cd = Symbol.for("drizzle:isPgEnum");
      class ce extends b5 {
        static [bK] = "PgEnumColumnBuilder";
        constructor(a10, b10) {
          super(a10, "string", "PgEnumColumn"), this.config.enum = b10;
        }
        build(a10) {
          return new cf(a10, this.config);
        }
      }
      class cf extends b6 {
        static [bK] = "PgEnumColumn";
        enum = this.config.enum;
        enumValues = this.config.enum.enumValues;
        constructor(a10, b10) {
          super(a10, b10), this.enum = b10.enum;
        }
        getSQLType() {
          return this.enum.enumName;
        }
      }
      class cg {
        static [bK] = "Subquery";
        constructor(a10, b10, c10, d10 = false, e10 = []) {
          this._ = { brand: "Subquery", sql: a10, selectedFields: b10, alias: c10, isWith: d10, usedTables: e10 };
        }
      }
      class ch extends cg {
        static [bK] = "WithSubquery";
      }
      let ci = { startActiveSpan: (a10, b10) => e ? (f || (f = e.trace.getTracer("drizzle-orm", "0.45.1")), b_((c10, d10) => d10.startActiveSpan(a10, (a11) => {
        try {
          return b10(a11);
        } catch (b11) {
          throw a11.setStatus({ code: c10.SpanStatusCode.ERROR, message: b11 instanceof Error ? b11.message : "Unknown error" }), b11;
        } finally {
          a11.end();
        }
      }), e, f)) : b10() }, cj = Symbol.for("drizzle:ViewBaseConfig");
      class ck {
        static [bK] = null;
      }
      function cl(a10) {
        return null != a10 && "function" == typeof a10.getSQL;
      }
      class cm {
        static [bK] = "StringChunk";
        value;
        constructor(a10) {
          this.value = Array.isArray(a10) ? a10 : [a10];
        }
        getSQL() {
          return new cn([this]);
        }
      }
      class cn {
        constructor(a10) {
          for (let b10 of (this.queryChunks = a10, a10)) if (bL(b10, bW)) {
            let a11 = b10[bW.Symbol.Schema];
            this.usedTables.push(void 0 === a11 ? b10[bW.Symbol.Name] : a11 + "." + b10[bW.Symbol.Name]);
          }
        }
        static [bK] = "SQL";
        decoder = cp;
        shouldInlineParams = false;
        usedTables = [];
        append(a10) {
          return this.queryChunks.push(...a10.queryChunks), this;
        }
        toQuery(a10) {
          return ci.startActiveSpan("drizzle.buildSQL", (b10) => {
            let c10 = this.buildQueryFromSourceParams(this.queryChunks, a10);
            return b10?.setAttributes({ "drizzle.query.text": c10.sql, "drizzle.query.params": JSON.stringify(c10.params) }), c10;
          });
        }
        buildQueryFromSourceParams(a10, b10) {
          let c10 = Object.assign({}, b10, { inlineParams: b10.inlineParams || this.shouldInlineParams, paramStartIndex: b10.paramStartIndex || { value: 0 } }), { casing: d10, escapeName: e10, escapeParam: f10, prepareTyping: g10, inlineParams: h10, paramStartIndex: i10 } = c10;
          var j10 = a10.map((a11) => {
            if (bL(a11, cm)) return { sql: a11.value.join(""), params: [] };
            if (bL(a11, co)) return { sql: e10(a11.value), params: [] };
            if (void 0 === a11) return { sql: "", params: [] };
            if (Array.isArray(a11)) {
              let b11 = [new cm("(")];
              for (let [c11, d11] of a11.entries()) b11.push(d11), c11 < a11.length - 1 && b11.push(new cm(", "));
              return b11.push(new cm(")")), this.buildQueryFromSourceParams(b11, c10);
            }
            if (bL(a11, cn)) return this.buildQueryFromSourceParams(a11.queryChunks, { ...c10, inlineParams: h10 || a11.shouldInlineParams });
            if (bL(a11, bW)) {
              let b11 = a11[bW.Symbol.Schema], c11 = a11[bW.Symbol.Name];
              return { sql: void 0 === b11 || a11[bT] ? e10(c11) : e10(b11) + "." + e10(c11), params: [] };
            }
            if (bL(a11, bM)) {
              let c11 = d10.getColumnCasing(a11);
              if ("indexes" === b10.invokeSource) return { sql: e10(c11), params: [] };
              let f11 = a11.table[bW.Symbol.Schema];
              return { sql: a11.table[bT] || void 0 === f11 ? e10(a11.table[bW.Symbol.Name]) + "." + e10(c11) : e10(f11) + "." + e10(a11.table[bW.Symbol.Name]) + "." + e10(c11), params: [] };
            }
            if (bL(a11, cw)) {
              let b11 = a11[cj].schema, c11 = a11[cj].name;
              return { sql: void 0 === b11 || a11[cj].isAlias ? e10(c11) : e10(b11) + "." + e10(c11), params: [] };
            }
            if (bL(a11, cr)) {
              if (bL(a11.value, ct)) return { sql: f10(i10.value++, a11), params: [a11], typings: ["none"] };
              let b11 = null === a11.value ? null : a11.encoder.mapToDriverValue(a11.value);
              if (bL(b11, cn)) return this.buildQueryFromSourceParams([b11], c10);
              if (h10) return { sql: this.mapInlineParam(b11, c10), params: [] };
              let d11 = ["none"];
              return g10 && (d11 = [g10(a11.encoder)]), { sql: f10(i10.value++, b11), params: [b11], typings: d11 };
            }
            return bL(a11, ct) ? { sql: f10(i10.value++, a11), params: [a11], typings: ["none"] } : bL(a11, cn.Aliased) && void 0 !== a11.fieldAlias ? { sql: e10(a11.fieldAlias), params: [] } : bL(a11, cg) ? a11._.isWith ? { sql: e10(a11._.alias), params: [] } : this.buildQueryFromSourceParams([new cm("("), a11._.sql, new cm(") "), new co(a11._.alias)], c10) : a11 && "function" == typeof a11 && cd in a11 && true === a11[cd] ? a11.schema ? { sql: e10(a11.schema) + "." + e10(a11.enumName), params: [] } : { sql: e10(a11.enumName), params: [] } : cl(a11) ? a11.shouldOmitSQLParens?.() ? this.buildQueryFromSourceParams([a11.getSQL()], c10) : this.buildQueryFromSourceParams([new cm("("), a11.getSQL(), new cm(")")], c10) : h10 ? { sql: this.mapInlineParam(a11, c10), params: [] } : { sql: f10(i10.value++, a11), params: [a11], typings: ["none"] };
          });
          let k10 = { sql: "", params: [] };
          for (let a11 of j10) k10.sql += a11.sql, k10.params.push(...a11.params), a11.typings?.length && (k10.typings || (k10.typings = []), k10.typings.push(...a11.typings));
          return k10;
        }
        mapInlineParam(a10, { escapeString: b10 }) {
          if (null === a10) return "null";
          if ("number" == typeof a10 || "boolean" == typeof a10) return a10.toString();
          if ("string" == typeof a10) return b10(a10);
          if ("object" == typeof a10) {
            let c10 = a10.toString();
            return "[object Object]" === c10 ? b10(JSON.stringify(a10)) : b10(c10);
          }
          throw Error("Unexpected param value: " + a10);
        }
        getSQL() {
          return this;
        }
        as(a10) {
          return void 0 === a10 ? this : new cn.Aliased(this, a10);
        }
        mapWith(a10) {
          return this.decoder = "function" == typeof a10 ? { mapFromDriverValue: a10 } : a10, this;
        }
        inlineParams() {
          return this.shouldInlineParams = true, this;
        }
        if(a10) {
          return a10 ? this : void 0;
        }
      }
      class co {
        constructor(a10) {
          this.value = a10;
        }
        static [bK] = "Name";
        brand;
        getSQL() {
          return new cn([this]);
        }
      }
      let cp = { mapFromDriverValue: (a10) => a10 }, cq = { mapToDriverValue: (a10) => a10 };
      ({ ...cp, ...cq });
      class cr {
        constructor(a10, b10 = cq) {
          this.value = a10, this.encoder = b10;
        }
        static [bK] = "Param";
        brand;
        getSQL() {
          return new cn([this]);
        }
      }
      function cs(a10, ...b10) {
        let c10 = [];
        for (let [d10, e10] of ((b10.length > 0 || a10.length > 0 && "" !== a10[0]) && c10.push(new cm(a10[0])), b10.entries())) c10.push(e10, new cm(a10[d10 + 1]));
        return new cn(c10);
      }
      ((a10) => {
        a10.empty = function() {
          return new cn([]);
        }, a10.fromList = function(a11) {
          return new cn(a11);
        }, a10.raw = function(a11) {
          return new cn([new cm(a11)]);
        }, a10.join = function(a11, b10) {
          let c10 = [];
          for (let [d10, e10] of a11.entries()) d10 > 0 && void 0 !== b10 && c10.push(b10), c10.push(e10);
          return new cn(c10);
        }, a10.identifier = function(a11) {
          return new co(a11);
        }, a10.placeholder = function(a11) {
          return new ct(a11);
        }, a10.param = function(a11, b10) {
          return new cr(a11, b10);
        };
      })(cs || (cs = {})), ((a10) => {
        class b10 {
          constructor(a11, b11) {
            this.sql = a11, this.fieldAlias = b11;
          }
          static [bK] = "SQL.Aliased";
          isSelectionField = false;
          getSQL() {
            return this.sql;
          }
          clone() {
            return new b10(this.sql, this.fieldAlias);
          }
        }
        a10.Aliased = b10;
      })(cn || (cn = {}));
      class ct {
        constructor(a10) {
          this.name = a10;
        }
        static [bK] = "Placeholder";
        getSQL() {
          return new cn([this]);
        }
      }
      function cu(a10, b10) {
        return a10.map((a11) => {
          if (bL(a11, ct)) {
            if (!(a11.name in b10)) throw Error(`No value for placeholder "${a11.name}" was provided`);
            return b10[a11.name];
          }
          if (bL(a11, cr) && bL(a11.value, ct)) {
            if (!(a11.value.name in b10)) throw Error(`No value for placeholder "${a11.value.name}" was provided`);
            return a11.encoder.mapToDriverValue(b10[a11.value.name]);
          }
          return a11;
        });
      }
      let cv = Symbol.for("drizzle:IsDrizzleView");
      class cw {
        static [bK] = "View";
        [cj];
        [cv] = true;
        constructor({ name: a10, schema: b10, selectedFields: c10, query: d10 }) {
          this[cj] = { name: a10, originalName: a10, schema: b10, selectedFields: c10, query: d10, isExisting: !d10, isAlias: false };
        }
        getSQL() {
          return new cn([this]);
        }
      }
      function cx(a10, b10) {
        return "object" != typeof b10 || null === b10 || !("mapToDriverValue" in b10) || "function" != typeof b10.mapToDriverValue || cl(a10) || bL(a10, cr) || bL(a10, ct) || bL(a10, bM) || bL(a10, bW) || bL(a10, cw) ? a10 : new cr(a10, b10);
      }
      bM.prototype.getSQL = function() {
        return new cn([this]);
      }, bW.prototype.getSQL = function() {
        return new cn([this]);
      }, cg.prototype.getSQL = function() {
        return new cn([this]);
      };
      let cy = (a10, b10) => cs`${a10} = ${cx(b10, a10)}`, cz = (a10, b10) => cs`${a10} <> ${cx(b10, a10)}`;
      function cA(...a10) {
        let b10 = a10.filter((a11) => void 0 !== a11);
        if (0 !== b10.length) return new cn(1 === b10.length ? b10 : [new cm("("), cs.join(b10, new cm(" and ")), new cm(")")]);
      }
      function cB(...a10) {
        let b10 = a10.filter((a11) => void 0 !== a11);
        if (0 !== b10.length) return new cn(1 === b10.length ? b10 : [new cm("("), cs.join(b10, new cm(" or ")), new cm(")")]);
      }
      function cC(a10) {
        return cs`not ${a10}`;
      }
      let cD = (a10, b10) => cs`${a10} > ${cx(b10, a10)}`, cE = (a10, b10) => cs`${a10} >= ${cx(b10, a10)}`, cF = (a10, b10) => cs`${a10} < ${cx(b10, a10)}`, cG = (a10, b10) => cs`${a10} <= ${cx(b10, a10)}`;
      function cH(a10, b10) {
        return Array.isArray(b10) ? 0 === b10.length ? cs`false` : cs`${a10} in ${b10.map((b11) => cx(b11, a10))}` : cs`${a10} in ${cx(b10, a10)}`;
      }
      function cI(a10, b10) {
        return Array.isArray(b10) ? 0 === b10.length ? cs`true` : cs`${a10} not in ${b10.map((b11) => cx(b11, a10))}` : cs`${a10} not in ${cx(b10, a10)}`;
      }
      function cJ(a10) {
        return cs`${a10} is null`;
      }
      function cK(a10) {
        return cs`${a10} is not null`;
      }
      function cL(a10) {
        return cs`exists ${a10}`;
      }
      function cM(a10) {
        return cs`not exists ${a10}`;
      }
      function cN(a10, b10, c10) {
        return cs`${a10} between ${cx(b10, a10)} and ${cx(c10, a10)}`;
      }
      function cO(a10, b10, c10) {
        return cs`${a10} not between ${cx(b10, a10)} and ${cx(c10, a10)}`;
      }
      function cP(a10, b10) {
        return cs`${a10} like ${b10}`;
      }
      function cQ(a10, b10) {
        return cs`${a10} not like ${b10}`;
      }
      function cR(a10, b10) {
        return cs`${a10} ilike ${b10}`;
      }
      function cS(a10, b10) {
        return cs`${a10} not ilike ${b10}`;
      }
      class cT {
        static [bK] = "ConsoleLogWriter";
        write(a10) {
          console.log(a10);
        }
      }
      class cU {
        static [bK] = "DefaultLogger";
        writer;
        constructor(a10) {
          this.writer = a10?.writer ?? new cT();
        }
        logQuery(a10, b10) {
          let c10 = b10.map((a11) => {
            try {
              return JSON.stringify(a11);
            } catch {
              return String(a11);
            }
          }), d10 = c10.length ? ` -- params: [${c10.join(", ")}]` : "";
          this.writer.write(`Query: ${a10}${d10}`);
        }
      }
      class cV {
        static [bK] = "NoopLogger";
        logQuery() {
        }
      }
      function cW(a10, b10, c10) {
        let d10 = {}, e10 = a10.reduce((a11, { path: e11, field: f10 }, g10) => {
          let h10;
          h10 = bL(f10, bM) ? f10 : bL(f10, cn) ? f10.decoder : bL(f10, cg) ? f10._.sql.decoder : f10.sql.decoder;
          let i10 = a11;
          for (let [a12, j10] of e11.entries()) if (a12 < e11.length - 1) j10 in i10 || (i10[j10] = {}), i10 = i10[j10];
          else {
            let a13 = b10[g10], k10 = i10[j10] = null === a13 ? null : h10.mapFromDriverValue(a13);
            if (c10 && bL(f10, bM) && 2 === e11.length) {
              let a14 = e11[0];
              a14 in d10 ? "string" == typeof d10[a14] && d10[a14] !== f10.table[bN] && (d10[a14] = false) : d10[a14] = null === k10 && f10.table[bN];
            }
          }
          return a11;
        }, {});
        if (c10 && Object.keys(d10).length > 0) for (let [a11, b11] of Object.entries(d10)) "string" != typeof b11 || c10[b11] || (e10[a11] = null);
        return e10;
      }
      function cX(a10, b10) {
        return Object.entries(a10).reduce((a11, [c10, d10]) => {
          if ("string" != typeof c10) return a11;
          let e10 = b10 ? [...b10, c10] : [c10];
          return bL(d10, bM) || bL(d10, cn) || bL(d10, cn.Aliased) || bL(d10, cg) ? a11.push({ path: e10, field: d10 }) : bL(d10, bW) ? a11.push(...cX(d10[bW.Symbol.Columns], e10)) : a11.push(...cX(d10, e10)), a11;
        }, []);
      }
      function cY(a10, b10) {
        let c10 = Object.keys(a10), d10 = Object.keys(b10);
        if (c10.length !== d10.length) return false;
        for (let [a11, b11] of c10.entries()) if (b11 !== d10[a11]) return false;
        return true;
      }
      function cZ(a10, b10) {
        let c10 = Object.entries(b10).filter(([, a11]) => void 0 !== a11).map(([b11, c11]) => bL(c11, cn) || bL(c11, bM) ? [b11, c11] : [b11, new cr(c11, a10[bW.Symbol.Columns][b11])]);
        if (0 === c10.length) throw Error("No values to set");
        return Object.fromEntries(c10);
      }
      function c$(a10, b10) {
        for (let c10 of b10) for (let b11 of Object.getOwnPropertyNames(c10.prototype)) "constructor" !== b11 && Object.defineProperty(a10.prototype, b11, Object.getOwnPropertyDescriptor(c10.prototype, b11) || /* @__PURE__ */ Object.create(null));
      }
      function c_(a10) {
        return a10[bW.Symbol.Columns];
      }
      function c0(a10) {
        return bL(a10, cg) ? a10._.alias : bL(a10, cw) ? a10[cj].name : bL(a10, cn) ? void 0 : a10[bW.Symbol.IsAlias] ? a10[bW.Symbol.Name] : a10[bW.Symbol.BaseName];
      }
      function c1(a10, b10) {
        return { name: "string" == typeof a10 && a10.length > 0 ? a10 : "", config: "object" == typeof a10 ? a10 : b10 };
      }
      let c2 = "undefined" == typeof TextDecoder ? null : new TextDecoder();
      class c3 extends b5 {
        static [bK] = "PgIntColumnBaseBuilder";
        generatedAlwaysAsIdentity(a10) {
          if (a10) {
            let { name: b10, ...c10 } = a10;
            this.config.generatedIdentity = { type: "always", sequenceName: b10, sequenceOptions: c10 };
          } else this.config.generatedIdentity = { type: "always" };
          return this.config.hasDefault = true, this.config.notNull = true, this;
        }
        generatedByDefaultAsIdentity(a10) {
          if (a10) {
            let { name: b10, ...c10 } = a10;
            this.config.generatedIdentity = { type: "byDefault", sequenceName: b10, sequenceOptions: c10 };
          } else this.config.generatedIdentity = { type: "byDefault" };
          return this.config.hasDefault = true, this.config.notNull = true, this;
        }
      }
      class c4 extends c3 {
        static [bK] = "PgBigInt53Builder";
        constructor(a10) {
          super(a10, "number", "PgBigInt53");
        }
        build(a10) {
          return new c5(a10, this.config);
        }
      }
      class c5 extends b6 {
        static [bK] = "PgBigInt53";
        getSQLType() {
          return "bigint";
        }
        mapFromDriverValue(a10) {
          return "number" == typeof a10 ? a10 : Number(a10);
        }
      }
      class c6 extends c3 {
        static [bK] = "PgBigInt64Builder";
        constructor(a10) {
          super(a10, "bigint", "PgBigInt64");
        }
        build(a10) {
          return new c7(a10, this.config);
        }
      }
      class c7 extends b6 {
        static [bK] = "PgBigInt64";
        getSQLType() {
          return "bigint";
        }
        mapFromDriverValue(a10) {
          return BigInt(a10);
        }
      }
      function c8(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return "number" === d10.mode ? new c4(c10) : new c6(c10);
      }
      class c9 extends b5 {
        static [bK] = "PgBigSerial53Builder";
        constructor(a10) {
          super(a10, "number", "PgBigSerial53"), this.config.hasDefault = true, this.config.notNull = true;
        }
        build(a10) {
          return new da(a10, this.config);
        }
      }
      class da extends b6 {
        static [bK] = "PgBigSerial53";
        getSQLType() {
          return "bigserial";
        }
        mapFromDriverValue(a10) {
          return "number" == typeof a10 ? a10 : Number(a10);
        }
      }
      class db extends b5 {
        static [bK] = "PgBigSerial64Builder";
        constructor(a10) {
          super(a10, "bigint", "PgBigSerial64"), this.config.hasDefault = true;
        }
        build(a10) {
          return new dc(a10, this.config);
        }
      }
      class dc extends b6 {
        static [bK] = "PgBigSerial64";
        getSQLType() {
          return "bigserial";
        }
        mapFromDriverValue(a10) {
          return BigInt(a10);
        }
      }
      function dd(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return "number" === d10.mode ? new c9(c10) : new db(c10);
      }
      class de extends b5 {
        static [bK] = "PgBooleanBuilder";
        constructor(a10) {
          super(a10, "boolean", "PgBoolean");
        }
        build(a10) {
          return new df(a10, this.config);
        }
      }
      class df extends b6 {
        static [bK] = "PgBoolean";
        getSQLType() {
          return "boolean";
        }
      }
      function dg(a10) {
        return new de(a10 ?? "");
      }
      class dh extends b5 {
        static [bK] = "PgCharBuilder";
        constructor(a10, b10) {
          super(a10, "string", "PgChar"), this.config.length = b10.length, this.config.enumValues = b10.enum;
        }
        build(a10) {
          return new di(a10, this.config);
        }
      }
      class di extends b6 {
        static [bK] = "PgChar";
        length = this.config.length;
        enumValues = this.config.enumValues;
        getSQLType() {
          return void 0 === this.length ? "char" : `char(${this.length})`;
        }
      }
      function dj(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new dh(c10, d10);
      }
      class dk extends b5 {
        static [bK] = "PgCidrBuilder";
        constructor(a10) {
          super(a10, "string", "PgCidr");
        }
        build(a10) {
          return new dl(a10, this.config);
        }
      }
      class dl extends b6 {
        static [bK] = "PgCidr";
        getSQLType() {
          return "cidr";
        }
      }
      function dm(a10) {
        return new dk(a10 ?? "");
      }
      class dn extends b5 {
        static [bK] = "PgCustomColumnBuilder";
        constructor(a10, b10, c10) {
          super(a10, "custom", "PgCustomColumn"), this.config.fieldConfig = b10, this.config.customTypeParams = c10;
        }
        build(a10) {
          return new dp(a10, this.config);
        }
      }
      class dp extends b6 {
        static [bK] = "PgCustomColumn";
        sqlName;
        mapTo;
        mapFrom;
        constructor(a10, b10) {
          super(a10, b10), this.sqlName = b10.customTypeParams.dataType(b10.fieldConfig), this.mapTo = b10.customTypeParams.toDriver, this.mapFrom = b10.customTypeParams.fromDriver;
        }
        getSQLType() {
          return this.sqlName;
        }
        mapFromDriverValue(a10) {
          return "function" == typeof this.mapFrom ? this.mapFrom(a10) : a10;
        }
        mapToDriverValue(a10) {
          return "function" == typeof this.mapTo ? this.mapTo(a10) : a10;
        }
      }
      function dq(a10) {
        return (b10, c10) => {
          let { name: d10, config: e10 } = c1(b10, c10);
          return new dn(d10, e10, a10);
        };
      }
      class dr extends b5 {
        static [bK] = "PgDateColumnBaseBuilder";
        defaultNow() {
          return this.default(cs`now()`);
        }
      }
      class ds extends dr {
        static [bK] = "PgDateBuilder";
        constructor(a10) {
          super(a10, "date", "PgDate");
        }
        build(a10) {
          return new dt(a10, this.config);
        }
      }
      class dt extends b6 {
        static [bK] = "PgDate";
        getSQLType() {
          return "date";
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? new Date(a10) : a10;
        }
        mapToDriverValue(a10) {
          return a10.toISOString();
        }
      }
      class du extends dr {
        static [bK] = "PgDateStringBuilder";
        constructor(a10) {
          super(a10, "string", "PgDateString");
        }
        build(a10) {
          return new dv(a10, this.config);
        }
      }
      class dv extends b6 {
        static [bK] = "PgDateString";
        getSQLType() {
          return "date";
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? a10 : a10.toISOString().slice(0, -14);
        }
      }
      function dw(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode === "date" ? new ds(c10) : new du(c10);
      }
      class dx extends b5 {
        static [bK] = "PgDoublePrecisionBuilder";
        constructor(a10) {
          super(a10, "number", "PgDoublePrecision");
        }
        build(a10) {
          return new dy(a10, this.config);
        }
      }
      class dy extends b6 {
        static [bK] = "PgDoublePrecision";
        getSQLType() {
          return "double precision";
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? Number.parseFloat(a10) : a10;
        }
      }
      function dz(a10) {
        return new dx(a10 ?? "");
      }
      class dA extends b5 {
        static [bK] = "PgInetBuilder";
        constructor(a10) {
          super(a10, "string", "PgInet");
        }
        build(a10) {
          return new dB(a10, this.config);
        }
      }
      class dB extends b6 {
        static [bK] = "PgInet";
        getSQLType() {
          return "inet";
        }
      }
      function dC(a10) {
        return new dA(a10 ?? "");
      }
      class dD extends c3 {
        static [bK] = "PgIntegerBuilder";
        constructor(a10) {
          super(a10, "number", "PgInteger");
        }
        build(a10) {
          return new dE(a10, this.config);
        }
      }
      class dE extends b6 {
        static [bK] = "PgInteger";
        getSQLType() {
          return "integer";
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? Number.parseInt(a10) : a10;
        }
      }
      function dF(a10) {
        return new dD(a10 ?? "");
      }
      class dG extends b5 {
        static [bK] = "PgIntervalBuilder";
        constructor(a10, b10) {
          super(a10, "string", "PgInterval"), this.config.intervalConfig = b10;
        }
        build(a10) {
          return new dH(a10, this.config);
        }
      }
      class dH extends b6 {
        static [bK] = "PgInterval";
        fields = this.config.intervalConfig.fields;
        precision = this.config.intervalConfig.precision;
        getSQLType() {
          let a10 = this.fields ? ` ${this.fields}` : "", b10 = this.precision ? `(${this.precision})` : "";
          return `interval${a10}${b10}`;
        }
      }
      function dI(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new dG(c10, d10);
      }
      class dJ extends b5 {
        static [bK] = "PgJsonBuilder";
        constructor(a10) {
          super(a10, "json", "PgJson");
        }
        build(a10) {
          return new dK(a10, this.config);
        }
      }
      class dK extends b6 {
        static [bK] = "PgJson";
        constructor(a10, b10) {
          super(a10, b10);
        }
        getSQLType() {
          return "json";
        }
        mapToDriverValue(a10) {
          return JSON.stringify(a10);
        }
        mapFromDriverValue(a10) {
          if ("string" == typeof a10) try {
            return JSON.parse(a10);
          } catch {
          }
          return a10;
        }
      }
      function dL(a10) {
        return new dJ(a10 ?? "");
      }
      class dM extends b5 {
        static [bK] = "PgJsonbBuilder";
        constructor(a10) {
          super(a10, "json", "PgJsonb");
        }
        build(a10) {
          return new dN(a10, this.config);
        }
      }
      class dN extends b6 {
        static [bK] = "PgJsonb";
        constructor(a10, b10) {
          super(a10, b10);
        }
        getSQLType() {
          return "jsonb";
        }
        mapToDriverValue(a10) {
          return JSON.stringify(a10);
        }
        mapFromDriverValue(a10) {
          if ("string" == typeof a10) try {
            return JSON.parse(a10);
          } catch {
          }
          return a10;
        }
      }
      function dO(a10) {
        return new dM(a10 ?? "");
      }
      class dP extends b5 {
        static [bK] = "PgLineBuilder";
        constructor(a10) {
          super(a10, "array", "PgLine");
        }
        build(a10) {
          return new dQ(a10, this.config);
        }
      }
      class dQ extends b6 {
        static [bK] = "PgLine";
        getSQLType() {
          return "line";
        }
        mapFromDriverValue(a10) {
          let [b10, c10, d10] = a10.slice(1, -1).split(",");
          return [Number.parseFloat(b10), Number.parseFloat(c10), Number.parseFloat(d10)];
        }
        mapToDriverValue(a10) {
          return `{${a10[0]},${a10[1]},${a10[2]}}`;
        }
      }
      class dR extends b5 {
        static [bK] = "PgLineABCBuilder";
        constructor(a10) {
          super(a10, "json", "PgLineABC");
        }
        build(a10) {
          return new dS(a10, this.config);
        }
      }
      class dS extends b6 {
        static [bK] = "PgLineABC";
        getSQLType() {
          return "line";
        }
        mapFromDriverValue(a10) {
          let [b10, c10, d10] = a10.slice(1, -1).split(",");
          return { a: Number.parseFloat(b10), b: Number.parseFloat(c10), c: Number.parseFloat(d10) };
        }
        mapToDriverValue(a10) {
          return `{${a10.a},${a10.b},${a10.c}}`;
        }
      }
      function dT(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode && "tuple" !== d10.mode ? new dR(c10) : new dP(c10);
      }
      class dU extends b5 {
        static [bK] = "PgMacaddrBuilder";
        constructor(a10) {
          super(a10, "string", "PgMacaddr");
        }
        build(a10) {
          return new dV(a10, this.config);
        }
      }
      class dV extends b6 {
        static [bK] = "PgMacaddr";
        getSQLType() {
          return "macaddr";
        }
      }
      function dW(a10) {
        return new dU(a10 ?? "");
      }
      class dX extends b5 {
        static [bK] = "PgMacaddr8Builder";
        constructor(a10) {
          super(a10, "string", "PgMacaddr8");
        }
        build(a10) {
          return new dY(a10, this.config);
        }
      }
      class dY extends b6 {
        static [bK] = "PgMacaddr8";
        getSQLType() {
          return "macaddr8";
        }
      }
      function dZ(a10) {
        return new dX(a10 ?? "");
      }
      class d$ extends b5 {
        static [bK] = "PgNumericBuilder";
        constructor(a10, b10, c10) {
          super(a10, "string", "PgNumeric"), this.config.precision = b10, this.config.scale = c10;
        }
        build(a10) {
          return new d_(a10, this.config);
        }
      }
      class d_ extends b6 {
        static [bK] = "PgNumeric";
        precision;
        scale;
        constructor(a10, b10) {
          super(a10, b10), this.precision = b10.precision, this.scale = b10.scale;
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? a10 : String(a10);
        }
        getSQLType() {
          return void 0 !== this.precision && void 0 !== this.scale ? `numeric(${this.precision}, ${this.scale})` : void 0 === this.precision ? "numeric" : `numeric(${this.precision})`;
        }
      }
      class d0 extends b5 {
        static [bK] = "PgNumericNumberBuilder";
        constructor(a10, b10, c10) {
          super(a10, "number", "PgNumericNumber"), this.config.precision = b10, this.config.scale = c10;
        }
        build(a10) {
          return new d1(a10, this.config);
        }
      }
      class d1 extends b6 {
        static [bK] = "PgNumericNumber";
        precision;
        scale;
        constructor(a10, b10) {
          super(a10, b10), this.precision = b10.precision, this.scale = b10.scale;
        }
        mapFromDriverValue(a10) {
          return "number" == typeof a10 ? a10 : Number(a10);
        }
        mapToDriverValue = String;
        getSQLType() {
          return void 0 !== this.precision && void 0 !== this.scale ? `numeric(${this.precision}, ${this.scale})` : void 0 === this.precision ? "numeric" : `numeric(${this.precision})`;
        }
      }
      class d2 extends b5 {
        static [bK] = "PgNumericBigIntBuilder";
        constructor(a10, b10, c10) {
          super(a10, "bigint", "PgNumericBigInt"), this.config.precision = b10, this.config.scale = c10;
        }
        build(a10) {
          return new d3(a10, this.config);
        }
      }
      class d3 extends b6 {
        static [bK] = "PgNumericBigInt";
        precision;
        scale;
        constructor(a10, b10) {
          super(a10, b10), this.precision = b10.precision, this.scale = b10.scale;
        }
        mapFromDriverValue = BigInt;
        mapToDriverValue = String;
        getSQLType() {
          return void 0 !== this.precision && void 0 !== this.scale ? `numeric(${this.precision}, ${this.scale})` : void 0 === this.precision ? "numeric" : `numeric(${this.precision})`;
        }
      }
      function d4(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10), e10 = d10?.mode;
        return "number" === e10 ? new d0(c10, d10?.precision, d10?.scale) : "bigint" === e10 ? new d2(c10, d10?.precision, d10?.scale) : new d$(c10, d10?.precision, d10?.scale);
      }
      class d5 extends b5 {
        static [bK] = "PgPointTupleBuilder";
        constructor(a10) {
          super(a10, "array", "PgPointTuple");
        }
        build(a10) {
          return new d6(a10, this.config);
        }
      }
      class d6 extends b6 {
        static [bK] = "PgPointTuple";
        getSQLType() {
          return "point";
        }
        mapFromDriverValue(a10) {
          if ("string" == typeof a10) {
            let [b10, c10] = a10.slice(1, -1).split(",");
            return [Number.parseFloat(b10), Number.parseFloat(c10)];
          }
          return [a10.x, a10.y];
        }
        mapToDriverValue(a10) {
          return `(${a10[0]},${a10[1]})`;
        }
      }
      class d7 extends b5 {
        static [bK] = "PgPointObjectBuilder";
        constructor(a10) {
          super(a10, "json", "PgPointObject");
        }
        build(a10) {
          return new d8(a10, this.config);
        }
      }
      class d8 extends b6 {
        static [bK] = "PgPointObject";
        getSQLType() {
          return "point";
        }
        mapFromDriverValue(a10) {
          if ("string" == typeof a10) {
            let [b10, c10] = a10.slice(1, -1).split(",");
            return { x: Number.parseFloat(b10), y: Number.parseFloat(c10) };
          }
          return a10;
        }
        mapToDriverValue(a10) {
          return `(${a10.x},${a10.y})`;
        }
      }
      function d9(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode && "tuple" !== d10.mode ? new d7(c10) : new d5(c10);
      }
      function ea(a10, b10) {
        let c10 = new DataView(new ArrayBuffer(8));
        for (let d10 = 0; d10 < 8; d10++) c10.setUint8(d10, a10[b10 + d10]);
        return c10.getFloat64(0, true);
      }
      function eb(a10) {
        let b10 = function(a11) {
          let b11 = [];
          for (let c11 = 0; c11 < a11.length; c11 += 2) b11.push(Number.parseInt(a11.slice(c11, c11 + 2), 16));
          return new Uint8Array(b11);
        }(a10), c10 = 0, d10 = b10[0];
        c10 += 1;
        let e10 = new DataView(b10.buffer), f10 = e10.getUint32(c10, 1 === d10);
        if (c10 += 4, 536870912 & f10 && (e10.getUint32(c10, 1 === d10), c10 += 4), (65535 & f10) == 1) {
          let a11 = ea(b10, c10), d11 = ea(b10, c10 += 8);
          return c10 += 8, [a11, d11];
        }
        throw Error("Unsupported geometry type");
      }
      class ec extends b5 {
        static [bK] = "PgGeometryBuilder";
        constructor(a10) {
          super(a10, "array", "PgGeometry");
        }
        build(a10) {
          return new ed(a10, this.config);
        }
      }
      class ed extends b6 {
        static [bK] = "PgGeometry";
        getSQLType() {
          return "geometry(point)";
        }
        mapFromDriverValue(a10) {
          return eb(a10);
        }
        mapToDriverValue(a10) {
          return `point(${a10[0]} ${a10[1]})`;
        }
      }
      class ee extends b5 {
        static [bK] = "PgGeometryObjectBuilder";
        constructor(a10) {
          super(a10, "json", "PgGeometryObject");
        }
        build(a10) {
          return new ef(a10, this.config);
        }
      }
      class ef extends b6 {
        static [bK] = "PgGeometryObject";
        getSQLType() {
          return "geometry(point)";
        }
        mapFromDriverValue(a10) {
          let b10 = eb(a10);
          return { x: b10[0], y: b10[1] };
        }
        mapToDriverValue(a10) {
          return `point(${a10.x} ${a10.y})`;
        }
      }
      function eg(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode && "tuple" !== d10.mode ? new ee(c10) : new ec(c10);
      }
      class eh extends b5 {
        static [bK] = "PgRealBuilder";
        constructor(a10, b10) {
          super(a10, "number", "PgReal"), this.config.length = b10;
        }
        build(a10) {
          return new ei(a10, this.config);
        }
      }
      class ei extends b6 {
        static [bK] = "PgReal";
        constructor(a10, b10) {
          super(a10, b10);
        }
        getSQLType() {
          return "real";
        }
        mapFromDriverValue = (a10) => "string" == typeof a10 ? Number.parseFloat(a10) : a10;
      }
      function ej(a10) {
        return new eh(a10 ?? "");
      }
      class ek extends b5 {
        static [bK] = "PgSerialBuilder";
        constructor(a10) {
          super(a10, "number", "PgSerial"), this.config.hasDefault = true, this.config.notNull = true;
        }
        build(a10) {
          return new el(a10, this.config);
        }
      }
      class el extends b6 {
        static [bK] = "PgSerial";
        getSQLType() {
          return "serial";
        }
      }
      function em(a10) {
        return new ek(a10 ?? "");
      }
      class en extends c3 {
        static [bK] = "PgSmallIntBuilder";
        constructor(a10) {
          super(a10, "number", "PgSmallInt");
        }
        build(a10) {
          return new eo(a10, this.config);
        }
      }
      class eo extends b6 {
        static [bK] = "PgSmallInt";
        getSQLType() {
          return "smallint";
        }
        mapFromDriverValue = (a10) => "string" == typeof a10 ? Number(a10) : a10;
      }
      function ep(a10) {
        return new en(a10 ?? "");
      }
      class eq extends b5 {
        static [bK] = "PgSmallSerialBuilder";
        constructor(a10) {
          super(a10, "number", "PgSmallSerial"), this.config.hasDefault = true, this.config.notNull = true;
        }
        build(a10) {
          return new er(a10, this.config);
        }
      }
      class er extends b6 {
        static [bK] = "PgSmallSerial";
        getSQLType() {
          return "smallserial";
        }
      }
      function es(a10) {
        return new eq(a10 ?? "");
      }
      class et extends b5 {
        static [bK] = "PgTextBuilder";
        constructor(a10, b10) {
          super(a10, "string", "PgText"), this.config.enumValues = b10.enum;
        }
        build(a10) {
          return new eu(a10, this.config);
        }
      }
      class eu extends b6 {
        static [bK] = "PgText";
        enumValues = this.config.enumValues;
        getSQLType() {
          return "text";
        }
      }
      function ev(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new et(c10, d10);
      }
      class ew extends dr {
        constructor(a10, b10, c10) {
          super(a10, "string", "PgTime"), this.withTimezone = b10, this.precision = c10, this.config.withTimezone = b10, this.config.precision = c10;
        }
        static [bK] = "PgTimeBuilder";
        build(a10) {
          return new ex(a10, this.config);
        }
      }
      class ex extends b6 {
        static [bK] = "PgTime";
        withTimezone;
        precision;
        constructor(a10, b10) {
          super(a10, b10), this.withTimezone = b10.withTimezone, this.precision = b10.precision;
        }
        getSQLType() {
          let a10 = void 0 === this.precision ? "" : `(${this.precision})`;
          return `time${a10}${this.withTimezone ? " with time zone" : ""}`;
        }
      }
      function ey(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new ew(c10, d10.withTimezone ?? false, d10.precision);
      }
      class ez extends dr {
        static [bK] = "PgTimestampBuilder";
        constructor(a10, b10, c10) {
          super(a10, "date", "PgTimestamp"), this.config.withTimezone = b10, this.config.precision = c10;
        }
        build(a10) {
          return new eA(a10, this.config);
        }
      }
      class eA extends b6 {
        static [bK] = "PgTimestamp";
        withTimezone;
        precision;
        constructor(a10, b10) {
          super(a10, b10), this.withTimezone = b10.withTimezone, this.precision = b10.precision;
        }
        getSQLType() {
          let a10 = void 0 === this.precision ? "" : ` (${this.precision})`;
          return `timestamp${a10}${this.withTimezone ? " with time zone" : ""}`;
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? new Date(this.withTimezone ? a10 : a10 + "+0000") : a10;
        }
        mapToDriverValue = (a10) => a10.toISOString();
      }
      class eB extends dr {
        static [bK] = "PgTimestampStringBuilder";
        constructor(a10, b10, c10) {
          super(a10, "string", "PgTimestampString"), this.config.withTimezone = b10, this.config.precision = c10;
        }
        build(a10) {
          return new eC(a10, this.config);
        }
      }
      class eC extends b6 {
        static [bK] = "PgTimestampString";
        withTimezone;
        precision;
        constructor(a10, b10) {
          super(a10, b10), this.withTimezone = b10.withTimezone, this.precision = b10.precision;
        }
        getSQLType() {
          let a10 = void 0 === this.precision ? "" : `(${this.precision})`;
          return `timestamp${a10}${this.withTimezone ? " with time zone" : ""}`;
        }
        mapFromDriverValue(a10) {
          if ("string" == typeof a10) return a10;
          let b10 = a10.toISOString().slice(0, -1).replace("T", " ");
          if (this.withTimezone) {
            let c10 = a10.getTimezoneOffset();
            return `${b10}${c10 <= 0 ? "+" : "-"}${Math.floor(Math.abs(c10) / 60).toString().padStart(2, "0")}`;
          }
          return b10;
        }
      }
      function eD(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode === "string" ? new eB(c10, d10.withTimezone ?? false, d10.precision) : new ez(c10, d10?.withTimezone ?? false, d10?.precision);
      }
      class eE extends b5 {
        static [bK] = "PgUUIDBuilder";
        constructor(a10) {
          super(a10, "string", "PgUUID");
        }
        defaultRandom() {
          return this.default(cs`gen_random_uuid()`);
        }
        build(a10) {
          return new eF(a10, this.config);
        }
      }
      class eF extends b6 {
        static [bK] = "PgUUID";
        getSQLType() {
          return "uuid";
        }
      }
      function eG(a10) {
        return new eE(a10 ?? "");
      }
      class eH extends b5 {
        static [bK] = "PgVarcharBuilder";
        constructor(a10, b10) {
          super(a10, "string", "PgVarchar"), this.config.length = b10.length, this.config.enumValues = b10.enum;
        }
        build(a10) {
          return new eI(a10, this.config);
        }
      }
      class eI extends b6 {
        static [bK] = "PgVarchar";
        length = this.config.length;
        enumValues = this.config.enumValues;
        getSQLType() {
          return void 0 === this.length ? "varchar" : `varchar(${this.length})`;
        }
      }
      function eJ(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new eH(c10, d10);
      }
      class eK extends b5 {
        static [bK] = "PgBinaryVectorBuilder";
        constructor(a10, b10) {
          super(a10, "string", "PgBinaryVector"), this.config.dimensions = b10.dimensions;
        }
        build(a10) {
          return new eL(a10, this.config);
        }
      }
      class eL extends b6 {
        static [bK] = "PgBinaryVector";
        dimensions = this.config.dimensions;
        getSQLType() {
          return `bit(${this.dimensions})`;
        }
      }
      function eM(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new eK(c10, d10);
      }
      class eN extends b5 {
        static [bK] = "PgHalfVectorBuilder";
        constructor(a10, b10) {
          super(a10, "array", "PgHalfVector"), this.config.dimensions = b10.dimensions;
        }
        build(a10) {
          return new eO(a10, this.config);
        }
      }
      class eO extends b6 {
        static [bK] = "PgHalfVector";
        dimensions = this.config.dimensions;
        getSQLType() {
          return `halfvec(${this.dimensions})`;
        }
        mapToDriverValue(a10) {
          return JSON.stringify(a10);
        }
        mapFromDriverValue(a10) {
          return a10.slice(1, -1).split(",").map((a11) => Number.parseFloat(a11));
        }
      }
      function eP(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new eN(c10, d10);
      }
      class eQ extends b5 {
        static [bK] = "PgSparseVectorBuilder";
        constructor(a10, b10) {
          super(a10, "string", "PgSparseVector"), this.config.dimensions = b10.dimensions;
        }
        build(a10) {
          return new eR(a10, this.config);
        }
      }
      class eR extends b6 {
        static [bK] = "PgSparseVector";
        dimensions = this.config.dimensions;
        getSQLType() {
          return `sparsevec(${this.dimensions})`;
        }
      }
      function eS(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new eQ(c10, d10);
      }
      class eT extends b5 {
        static [bK] = "PgVectorBuilder";
        constructor(a10, b10) {
          super(a10, "array", "PgVector"), this.config.dimensions = b10.dimensions;
        }
        build(a10) {
          return new eU(a10, this.config);
        }
      }
      class eU extends b6 {
        static [bK] = "PgVector";
        dimensions = this.config.dimensions;
        getSQLType() {
          return `vector(${this.dimensions})`;
        }
        mapToDriverValue(a10) {
          return JSON.stringify(a10);
        }
        mapFromDriverValue(a10) {
          return a10.slice(1, -1).split(",").map((a11) => Number.parseFloat(a11));
        }
      }
      function eV(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new eT(c10, d10);
      }
      let eW = Symbol.for("drizzle:PgInlineForeignKeys"), eX = Symbol.for("drizzle:EnableRLS");
      class eY extends bW {
        static [bK] = "PgTable";
        static Symbol = Object.assign({}, bW.Symbol, { InlineForeignKeys: eW, EnableRLS: eX });
        [eW] = [];
        [eX] = false;
        [bW.Symbol.ExtraConfigBuilder] = void 0;
        [bW.Symbol.ExtraConfigColumns] = {};
      }
      let eZ = (a10, b10, c10) => function(a11, b11, c11, d10, e10 = a11) {
        let f10 = new eY(a11, d10, e10), g10 = "function" == typeof b11 ? b11({ bigint: c8, bigserial: dd, boolean: dg, char: dj, cidr: dm, customType: dq, date: dw, doublePrecision: dz, inet: dC, integer: dF, interval: dI, json: dL, jsonb: dO, line: dT, macaddr: dW, macaddr8: dZ, numeric: d4, point: d9, geometry: eg, real: ej, serial: em, smallint: ep, smallserial: es, text: ev, time: ey, timestamp: eD, uuid: eG, varchar: eJ, bit: eM, halfvec: eP, sparsevec: eS, vector: eV }) : b11, h10 = Object.fromEntries(Object.entries(g10).map(([a12, b12]) => {
          b12.setName(a12);
          let c12 = b12.build(f10);
          return f10[eW].push(...b12.buildForeignKeys(c12, f10)), [a12, c12];
        })), i10 = Object.fromEntries(Object.entries(g10).map(([a12, b12]) => (b12.setName(a12), [a12, b12.buildExtraConfigColumn(f10)]))), j10 = Object.assign(f10, h10);
        return j10[bW.Symbol.Columns] = h10, j10[bW.Symbol.ExtraConfigColumns] = i10, c11 && (j10[eY.Symbol.ExtraConfigBuilder] = c11), Object.assign(j10, { enableRLS: () => (j10[eY.Symbol.EnableRLS] = true, j10) });
      }(a10, b10, c10, void 0);
      function e$(...a10) {
        return a10[0].columns ? new e_(a10[0].columns, a10[0].name) : new e_(a10);
      }
      class e_ {
        static [bK] = "PgPrimaryKeyBuilder";
        columns;
        name;
        constructor(a10, b10) {
          this.columns = a10, this.name = b10;
        }
        build(a10) {
          return new e0(a10, this.columns, this.name);
        }
      }
      class e0 {
        constructor(a10, b10, c10) {
          this.table = a10, this.columns = b10, this.name = c10;
        }
        static [bK] = "PgPrimaryKey";
        columns;
        name;
        getName() {
          return this.name ?? `${this.table[eY.Symbol.Name]}_${this.columns.map((a10) => a10.name).join("_")}_pk`;
        }
      }
      function e1(a10) {
        return cs`${a10} asc`;
      }
      function e2(a10) {
        return cs`${a10} desc`;
      }
      class e3 {
        constructor(a10, b10, c10) {
          this.sourceTable = a10, this.referencedTable = b10, this.relationName = c10, this.referencedTableName = b10[bW.Symbol.Name];
        }
        static [bK] = "Relation";
        referencedTableName;
        fieldName;
      }
      class e4 {
        constructor(a10, b10) {
          this.table = a10, this.config = b10;
        }
        static [bK] = "Relations";
      }
      class e5 extends e3 {
        constructor(a10, b10, c10, d10) {
          super(a10, b10, c10?.relationName), this.config = c10, this.isNullable = d10;
        }
        static [bK] = "One";
        withFieldName(a10) {
          let b10 = new e5(this.sourceTable, this.referencedTable, this.config, this.isNullable);
          return b10.fieldName = a10, b10;
        }
      }
      class e6 extends e3 {
        constructor(a10, b10, c10) {
          super(a10, b10, c10?.relationName), this.config = c10;
        }
        static [bK] = "Many";
        withFieldName(a10) {
          let b10 = new e6(this.sourceTable, this.referencedTable, this.config);
          return b10.fieldName = a10, b10;
        }
      }
      function e7() {
        return { and: cA, between: cN, eq: cy, exists: cL, gt: cD, gte: cE, ilike: cR, inArray: cH, isNull: cJ, isNotNull: cK, like: cP, lt: cF, lte: cG, ne: cz, not: cC, notBetween: cO, notExists: cM, notLike: cQ, notIlike: cS, notInArray: cI, or: cB, sql: cs };
      }
      function e8() {
        return { sql: cs, asc: e1, desc: e2 };
      }
      function e9(a10, b10) {
        return new e4(a10, (a11) => Object.fromEntries(Object.entries(b10(a11)).map(([a12, b11]) => [a12, b11.withFieldName(a12)])));
      }
      function fa(a10, b10, c10) {
        if (bL(c10, e5) && c10.config) return { fields: c10.config.fields, references: c10.config.references };
        let d10 = b10[bX(c10.referencedTable)];
        if (!d10) throw Error(`Table "${c10.referencedTable[bW.Symbol.Name]}" not found in schema`);
        let e10 = a10[d10];
        if (!e10) throw Error(`Table "${d10}" not found in schema`);
        let f10 = c10.sourceTable, g10 = b10[bX(f10)];
        if (!g10) throw Error(`Table "${f10[bW.Symbol.Name]}" not found in schema`);
        let h10 = [];
        for (let a11 of Object.values(e10.relations)) (c10.relationName && c10 !== a11 && a11.relationName === c10.relationName || !c10.relationName && a11.referencedTable === c10.sourceTable) && h10.push(a11);
        if (h10.length > 1) throw c10.relationName ? Error(`There are multiple relations with name "${c10.relationName}" in table "${d10}"`) : Error(`There are multiple relations between "${d10}" and "${c10.sourceTable[bW.Symbol.Name]}". Please specify relation name`);
        if (h10[0] && bL(h10[0], e5) && h10[0].config) return { fields: h10[0].config.references, references: h10[0].config.fields };
        throw Error(`There is not enough information to infer relation "${g10}.${c10.fieldName}"`);
      }
      function fb(a10) {
        return { one: function(b10, c10) {
          return new e5(a10, b10, c10, c10?.fields.reduce((a11, b11) => a11 && b11.notNull, true) ?? false);
        }, many: function(b10, c10) {
          return new e6(a10, b10, c10);
        } };
      }
      function fc(a10, b10, c10, d10, e10 = (a11) => a11) {
        let f10 = {};
        for (let [g10, h10] of d10.entries()) if (h10.isJson) {
          let d11 = b10.relations[h10.tsKey], i10 = c10[g10], j10 = "string" == typeof i10 ? JSON.parse(i10) : i10;
          f10[h10.tsKey] = bL(d11, e5) ? j10 && fc(a10, a10[h10.relationTableTsKey], j10, h10.selection, e10) : j10.map((b11) => fc(a10, a10[h10.relationTableTsKey], b11, h10.selection, e10));
        } else {
          let a11, b11 = e10(c10[g10]), d11 = h10.field;
          a11 = bL(d11, bM) ? d11 : bL(d11, cn) ? d11.decoder : d11.sql.decoder, f10[h10.tsKey] = null === b11 ? null : a11.mapFromDriverValue(b11);
        }
        return f10;
      }
      class fd {
        constructor(a10) {
          this.table = a10;
        }
        static [bK] = "ColumnAliasProxyHandler";
        get(a10, b10) {
          return "table" === b10 ? this.table : a10[b10];
        }
      }
      class fe {
        constructor(a10, b10) {
          this.alias = a10, this.replaceOriginalName = b10;
        }
        static [bK] = "TableAliasProxyHandler";
        get(a10, b10) {
          if (b10 === bW.Symbol.IsAlias) return true;
          if (b10 === bW.Symbol.Name || this.replaceOriginalName && b10 === bW.Symbol.OriginalName) return this.alias;
          if (b10 === cj) return { ...a10[cj], name: this.alias, isAlias: true };
          if (b10 === bW.Symbol.Columns) {
            let b11 = a10[bW.Symbol.Columns];
            if (!b11) return b11;
            let c11 = {};
            return Object.keys(b11).map((d10) => {
              c11[d10] = new Proxy(b11[d10], new fd(new Proxy(a10, this)));
            }), c11;
          }
          let c10 = a10[b10];
          return bL(c10, bM) ? new Proxy(c10, new fd(new Proxy(a10, this))) : c10;
        }
      }
      class ff {
        constructor(a10) {
          this.alias = a10;
        }
        static [bK] = null;
        get(a10, b10) {
          return "sourceTable" === b10 ? fg(a10.sourceTable, this.alias) : a10[b10];
        }
      }
      function fg(a10, b10) {
        return new Proxy(a10, new fe(b10, false));
      }
      function fh(a10, b10) {
        return new Proxy(a10, new fd(new Proxy(a10.table, new fe(b10, false))));
      }
      function fi(a10, b10) {
        return new cn.Aliased(fj(a10.sql, b10), a10.fieldAlias);
      }
      function fj(a10, b10) {
        return cs.join(a10.queryChunks.map((a11) => bL(a11, bM) ? fh(a11, b10) : bL(a11, cn) ? fj(a11, b10) : bL(a11, cn.Aliased) ? fi(a11, b10) : a11));
      }
      class fk {
        static [bK] = "SelectionProxyHandler";
        config;
        constructor(a10) {
          this.config = { ...a10 };
        }
        get(a10, b10) {
          if ("_" === b10) return { ...a10._, selectedFields: new Proxy(a10._.selectedFields, this) };
          if (b10 === cj) return { ...a10[cj], selectedFields: new Proxy(a10[cj].selectedFields, this) };
          if ("symbol" == typeof b10) return a10[b10];
          let c10 = (bL(a10, cg) ? a10._.selectedFields : bL(a10, cw) ? a10[cj].selectedFields : a10)[b10];
          if (bL(c10, cn.Aliased)) {
            if ("sql" === this.config.sqlAliasedBehavior && !c10.isSelectionField) return c10.sql;
            let a11 = c10.clone();
            return a11.isSelectionField = true, a11;
          }
          if (bL(c10, cn)) {
            if ("sql" === this.config.sqlBehavior) return c10;
            throw Error(`You tried to reference "${b10}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`);
          }
          return bL(c10, bM) ? this.config.alias ? new Proxy(c10, new fd(new Proxy(c10.table, new fe(this.config.alias, this.config.replaceOriginalName ?? false)))) : c10 : "object" != typeof c10 || null === c10 ? c10 : new Proxy(c10, new fk(this.config));
        }
      }
      function fl(a10) {
        return (a10.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? []).map((a11) => a11.toLowerCase()).join("_");
      }
      function fm(a10) {
        return (a10.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? []).reduce((a11, b10, c10) => a11 + (0 === c10 ? b10.toLowerCase() : `${b10[0].toUpperCase()}${b10.slice(1)}`), "");
      }
      function fn(a10) {
        return a10;
      }
      class fo {
        static [bK] = "CasingCache";
        cache = {};
        cachedTables = {};
        convert;
        constructor(a10) {
          this.convert = "snake_case" === a10 ? fl : "camelCase" === a10 ? fm : fn;
        }
        getColumnCasing(a10) {
          if (!a10.keyAsName) return a10.name;
          let b10 = a10.table[bW.Symbol.Schema] ?? "public", c10 = a10.table[bW.Symbol.OriginalName], d10 = `${b10}.${c10}.${a10.name}`;
          return this.cache[d10] || this.cacheTable(a10.table), this.cache[d10];
        }
        cacheTable(a10) {
          let b10 = a10[bW.Symbol.Schema] ?? "public", c10 = a10[bW.Symbol.OriginalName], d10 = `${b10}.${c10}`;
          if (!this.cachedTables[d10]) {
            for (let b11 of Object.values(a10[bW.Symbol.Columns])) {
              let a11 = `${d10}.${b11.name}`;
              this.cache[a11] = this.convert(b11.name);
            }
            this.cachedTables[d10] = true;
          }
        }
        clearCache() {
          this.cache = {}, this.cachedTables = {};
        }
      }
      class fp extends Error {
        static [bK] = "DrizzleError";
        constructor({ message: a10, cause: b10 }) {
          super(a10), this.name = "DrizzleError", this.cause = b10;
        }
      }
      class fq extends Error {
        constructor(a10, b10, c10) {
          super(`Failed query: ${a10}
params: ${b10}`), this.query = a10, this.params = b10, this.cause = c10, Error.captureStackTrace(this, fq), c10 && (this.cause = c10);
        }
      }
      class fr extends fp {
        static [bK] = "TransactionRollbackError";
        constructor() {
          super({ message: "Rollback" });
        }
      }
      class fs {
        static [bK] = "SQLiteForeignKeyBuilder";
        reference;
        _onUpdate;
        _onDelete;
        constructor(a10, b10) {
          this.reference = () => {
            let { name: b11, columns: c10, foreignColumns: d10 } = a10();
            return { name: b11, columns: c10, foreignTable: d10[0].table, foreignColumns: d10 };
          }, b10 && (this._onUpdate = b10.onUpdate, this._onDelete = b10.onDelete);
        }
        onUpdate(a10) {
          return this._onUpdate = a10, this;
        }
        onDelete(a10) {
          return this._onDelete = a10, this;
        }
        build(a10) {
          return new ft(a10, this);
        }
      }
      class ft {
        constructor(a10, b10) {
          this.table = a10, this.reference = b10.reference, this.onUpdate = b10._onUpdate, this.onDelete = b10._onDelete;
        }
        static [bK] = "SQLiteForeignKey";
        reference;
        onUpdate;
        onDelete;
        getName() {
          let { name: a10, columns: b10, foreignColumns: c10 } = this.reference(), d10 = b10.map((a11) => a11.name), e10 = c10.map((a11) => a11.name), f10 = [this.table[bN], ...d10, c10[0].table[bN], ...e10];
          return a10 ?? `${f10.join("_")}_fk`;
        }
      }
      function fu(a10, b10) {
        return `${a10[bN]}_${b10.join("_")}_unique`;
      }
      class fv {
        constructor(a10, b10) {
          this.name = b10, this.columns = a10;
        }
        static [bK] = null;
        columns;
        build(a10) {
          return new fx(a10, this.columns, this.name);
        }
      }
      class fw {
        static [bK] = null;
        name;
        constructor(a10) {
          this.name = a10;
        }
        on(...a10) {
          return new fv(a10, this.name);
        }
      }
      class fx {
        constructor(a10, b10, c10) {
          this.table = a10, this.columns = b10, this.name = c10 ?? fu(this.table, this.columns.map((a11) => a11.name));
        }
        static [bK] = null;
        columns;
        name;
        getName() {
          return this.name;
        }
      }
      class fy extends bY {
        static [bK] = "SQLiteColumnBuilder";
        foreignKeyConfigs = [];
        references(a10, b10 = {}) {
          return this.foreignKeyConfigs.push({ ref: a10, actions: b10 }), this;
        }
        unique(a10) {
          return this.config.isUnique = true, this.config.uniqueName = a10, this;
        }
        generatedAlwaysAs(a10, b10) {
          return this.config.generated = { as: a10, type: "always", mode: b10?.mode ?? "virtual" }, this;
        }
        buildForeignKeys(a10, b10) {
          return this.foreignKeyConfigs.map(({ ref: c10, actions: d10 }) => ((c11, d11) => {
            let e10 = new fs(() => ({ columns: [a10], foreignColumns: [c11()] }));
            return d11.onUpdate && e10.onUpdate(d11.onUpdate), d11.onDelete && e10.onDelete(d11.onDelete), e10.build(b10);
          })(c10, d10));
        }
      }
      class fz extends bM {
        constructor(a10, b10) {
          b10.uniqueName || (b10.uniqueName = fu(a10, [b10.name])), super(a10, b10), this.table = a10;
        }
        static [bK] = "SQLiteColumn";
      }
      var fA = c(356).Buffer;
      class fB extends fy {
        static [bK] = "SQLiteBigIntBuilder";
        constructor(a10) {
          super(a10, "bigint", "SQLiteBigInt");
        }
        build(a10) {
          return new fC(a10, this.config);
        }
      }
      class fC extends fz {
        static [bK] = "SQLiteBigInt";
        getSQLType() {
          return "blob";
        }
        mapFromDriverValue(a10) {
          return void 0 !== fA && fA.from ? BigInt((fA.isBuffer(a10) ? a10 : a10 instanceof ArrayBuffer ? fA.from(a10) : a10.buffer ? fA.from(a10.buffer, a10.byteOffset, a10.byteLength) : fA.from(a10)).toString("utf8")) : BigInt(c2.decode(a10));
        }
        mapToDriverValue(a10) {
          return fA.from(a10.toString());
        }
      }
      class fD extends fy {
        static [bK] = "SQLiteBlobJsonBuilder";
        constructor(a10) {
          super(a10, "json", "SQLiteBlobJson");
        }
        build(a10) {
          return new fE(a10, this.config);
        }
      }
      class fE extends fz {
        static [bK] = "SQLiteBlobJson";
        getSQLType() {
          return "blob";
        }
        mapFromDriverValue(a10) {
          return void 0 !== fA && fA.from ? JSON.parse((fA.isBuffer(a10) ? a10 : a10 instanceof ArrayBuffer ? fA.from(a10) : a10.buffer ? fA.from(a10.buffer, a10.byteOffset, a10.byteLength) : fA.from(a10)).toString("utf8")) : JSON.parse(c2.decode(a10));
        }
        mapToDriverValue(a10) {
          return fA.from(JSON.stringify(a10));
        }
      }
      class fF extends fy {
        static [bK] = "SQLiteBlobBufferBuilder";
        constructor(a10) {
          super(a10, "buffer", "SQLiteBlobBuffer");
        }
        build(a10) {
          return new fG(a10, this.config);
        }
      }
      class fG extends fz {
        static [bK] = "SQLiteBlobBuffer";
        mapFromDriverValue(a10) {
          return fA.isBuffer(a10) ? a10 : fA.from(a10);
        }
        getSQLType() {
          return "blob";
        }
      }
      function fH(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode === "json" ? new fD(c10) : d10?.mode === "bigint" ? new fB(c10) : new fF(c10);
      }
      class fI extends fy {
        static [bK] = "SQLiteCustomColumnBuilder";
        constructor(a10, b10, c10) {
          super(a10, "custom", "SQLiteCustomColumn"), this.config.fieldConfig = b10, this.config.customTypeParams = c10;
        }
        build(a10) {
          return new fJ(a10, this.config);
        }
      }
      class fJ extends fz {
        static [bK] = "SQLiteCustomColumn";
        sqlName;
        mapTo;
        mapFrom;
        constructor(a10, b10) {
          super(a10, b10), this.sqlName = b10.customTypeParams.dataType(b10.fieldConfig), this.mapTo = b10.customTypeParams.toDriver, this.mapFrom = b10.customTypeParams.fromDriver;
        }
        getSQLType() {
          return this.sqlName;
        }
        mapFromDriverValue(a10) {
          return "function" == typeof this.mapFrom ? this.mapFrom(a10) : a10;
        }
        mapToDriverValue(a10) {
          return "function" == typeof this.mapTo ? this.mapTo(a10) : a10;
        }
      }
      function fK(a10) {
        return (b10, c10) => {
          let { name: d10, config: e10 } = c1(b10, c10);
          return new fI(d10, e10, a10);
        };
      }
      class fL extends fy {
        static [bK] = "SQLiteBaseIntegerBuilder";
        constructor(a10, b10, c10) {
          super(a10, b10, c10), this.config.autoIncrement = false;
        }
        primaryKey(a10) {
          return a10?.autoIncrement && (this.config.autoIncrement = true), this.config.hasDefault = true, super.primaryKey();
        }
      }
      class fM extends fz {
        static [bK] = "SQLiteBaseInteger";
        autoIncrement = this.config.autoIncrement;
        getSQLType() {
          return "integer";
        }
      }
      class fN extends fL {
        static [bK] = "SQLiteIntegerBuilder";
        constructor(a10) {
          super(a10, "number", "SQLiteInteger");
        }
        build(a10) {
          return new fO(a10, this.config);
        }
      }
      class fO extends fM {
        static [bK] = "SQLiteInteger";
      }
      class fP extends fL {
        static [bK] = "SQLiteTimestampBuilder";
        constructor(a10, b10) {
          super(a10, "date", "SQLiteTimestamp"), this.config.mode = b10;
        }
        defaultNow() {
          return this.default(cs`(cast((julianday('now') - 2440587.5)*86400000 as integer))`);
        }
        build(a10) {
          return new fQ(a10, this.config);
        }
      }
      class fQ extends fM {
        static [bK] = "SQLiteTimestamp";
        mode = this.config.mode;
        mapFromDriverValue(a10) {
          return new Date("timestamp" === this.config.mode ? 1e3 * a10 : a10);
        }
        mapToDriverValue(a10) {
          let b10 = a10.getTime();
          return "timestamp" === this.config.mode ? Math.floor(b10 / 1e3) : b10;
        }
      }
      class fR extends fL {
        static [bK] = "SQLiteBooleanBuilder";
        constructor(a10, b10) {
          super(a10, "boolean", "SQLiteBoolean"), this.config.mode = b10;
        }
        build(a10) {
          return new fS(a10, this.config);
        }
      }
      class fS extends fM {
        static [bK] = "SQLiteBoolean";
        mode = this.config.mode;
        mapFromDriverValue(a10) {
          return 1 === Number(a10);
        }
        mapToDriverValue(a10) {
          return +!!a10;
        }
      }
      function fT(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode === "timestamp" || d10?.mode === "timestamp_ms" ? new fP(c10, d10.mode) : d10?.mode === "boolean" ? new fR(c10, d10.mode) : new fN(c10);
      }
      class fU extends fy {
        static [bK] = "SQLiteNumericBuilder";
        constructor(a10) {
          super(a10, "string", "SQLiteNumeric");
        }
        build(a10) {
          return new fV(a10, this.config);
        }
      }
      class fV extends fz {
        static [bK] = "SQLiteNumeric";
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? a10 : String(a10);
        }
        getSQLType() {
          return "numeric";
        }
      }
      class fW extends fy {
        static [bK] = "SQLiteNumericNumberBuilder";
        constructor(a10) {
          super(a10, "number", "SQLiteNumericNumber");
        }
        build(a10) {
          return new fX(a10, this.config);
        }
      }
      class fX extends fz {
        static [bK] = "SQLiteNumericNumber";
        mapFromDriverValue(a10) {
          return "number" == typeof a10 ? a10 : Number(a10);
        }
        mapToDriverValue = String;
        getSQLType() {
          return "numeric";
        }
      }
      class fY extends fy {
        static [bK] = "SQLiteNumericBigIntBuilder";
        constructor(a10) {
          super(a10, "bigint", "SQLiteNumericBigInt");
        }
        build(a10) {
          return new fZ(a10, this.config);
        }
      }
      class fZ extends fz {
        static [bK] = "SQLiteNumericBigInt";
        mapFromDriverValue = BigInt;
        mapToDriverValue = String;
        getSQLType() {
          return "numeric";
        }
      }
      function f$(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10), e10 = d10?.mode;
        return "number" === e10 ? new fW(c10) : "bigint" === e10 ? new fY(c10) : new fU(c10);
      }
      class f_ extends fy {
        static [bK] = "SQLiteRealBuilder";
        constructor(a10) {
          super(a10, "number", "SQLiteReal");
        }
        build(a10) {
          return new f0(a10, this.config);
        }
      }
      class f0 extends fz {
        static [bK] = "SQLiteReal";
        getSQLType() {
          return "real";
        }
      }
      function f1(a10) {
        return new f_(a10 ?? "");
      }
      class f2 extends fy {
        static [bK] = "SQLiteTextBuilder";
        constructor(a10, b10) {
          super(a10, "string", "SQLiteText"), this.config.enumValues = b10.enum, this.config.length = b10.length;
        }
        build(a10) {
          return new f3(a10, this.config);
        }
      }
      class f3 extends fz {
        static [bK] = "SQLiteText";
        enumValues = this.config.enumValues;
        length = this.config.length;
        constructor(a10, b10) {
          super(a10, b10);
        }
        getSQLType() {
          return `text${this.config.length ? `(${this.config.length})` : ""}`;
        }
      }
      class f4 extends fy {
        static [bK] = "SQLiteTextJsonBuilder";
        constructor(a10) {
          super(a10, "json", "SQLiteTextJson");
        }
        build(a10) {
          return new f5(a10, this.config);
        }
      }
      class f5 extends fz {
        static [bK] = "SQLiteTextJson";
        getSQLType() {
          return "text";
        }
        mapFromDriverValue(a10) {
          return JSON.parse(a10);
        }
        mapToDriverValue(a10) {
          return JSON.stringify(a10);
        }
      }
      function f6(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return "json" === d10.mode ? new f4(c10) : new f2(c10, d10);
      }
      let f7 = Symbol.for("drizzle:SQLiteInlineForeignKeys");
      class f8 extends bW {
        static [bK] = "SQLiteTable";
        static Symbol = Object.assign({}, bW.Symbol, { InlineForeignKeys: f7 });
        [bW.Symbol.Columns];
        [f7] = [];
        [bW.Symbol.ExtraConfigBuilder] = void 0;
      }
      let f9 = (a10, b10, c10) => function(a11, b11, c11, d10, e10 = a11) {
        let f10 = new f8(a11, void 0, e10), g10 = Object.fromEntries(Object.entries("function" == typeof b11 ? b11({ blob: fH, customType: fK, integer: fT, numeric: f$, real: f1, text: f6 }) : b11).map(([a12, b12]) => {
          b12.setName(a12);
          let c12 = b12.build(f10);
          return f10[f7].push(...b12.buildForeignKeys(c12, f10)), [a12, c12];
        })), h10 = Object.assign(f10, g10);
        return h10[bW.Symbol.Columns] = g10, h10[bW.Symbol.ExtraConfigColumns] = g10, c11 && (h10[f8.Symbol.ExtraConfigBuilder] = c11), h10;
      }(a10, b10, c10);
      class ga extends cw {
        static [bK] = "SQLiteViewBase";
      }
      class gb {
        static [bK] = "SQLiteDialect";
        casing;
        constructor(a10) {
          this.casing = new fo(a10?.casing);
        }
        escapeName(a10) {
          return `"${a10}"`;
        }
        escapeParam(a10) {
          return "?";
        }
        escapeString(a10) {
          return `'${a10.replace(/'/g, "''")}'`;
        }
        buildWithCTE(a10) {
          if (!a10?.length) return;
          let b10 = [cs`with `];
          for (let [c10, d10] of a10.entries()) b10.push(cs`${cs.identifier(d10._.alias)} as (${d10._.sql})`), c10 < a10.length - 1 && b10.push(cs`, `);
          return b10.push(cs` `), cs.join(b10);
        }
        buildDeleteQuery({ table: a10, where: b10, returning: c10, withList: d10, limit: e10, orderBy: f10 }) {
          let g10 = this.buildWithCTE(d10), h10 = c10 ? cs` returning ${this.buildSelection(c10, { isSingleTable: true })}` : void 0, i10 = b10 ? cs` where ${b10}` : void 0, j10 = this.buildOrderBy(f10), k10 = this.buildLimit(e10);
          return cs`${g10}delete from ${a10}${i10}${h10}${j10}${k10}`;
        }
        buildUpdateSet(a10, b10) {
          let c10 = a10[bW.Symbol.Columns], d10 = Object.keys(c10).filter((a11) => void 0 !== b10[a11] || c10[a11]?.onUpdateFn !== void 0), e10 = d10.length;
          return cs.join(d10.flatMap((a11, d11) => {
            let f10 = c10[a11], g10 = f10.onUpdateFn?.(), h10 = b10[a11] ?? (bL(g10, cn) ? g10 : cs.param(g10, f10)), i10 = cs`${cs.identifier(this.casing.getColumnCasing(f10))} = ${h10}`;
            return d11 < e10 - 1 ? [i10, cs.raw(", ")] : [i10];
          }));
        }
        buildUpdateQuery({ table: a10, set: b10, where: c10, returning: d10, withList: e10, joins: f10, from: g10, limit: h10, orderBy: i10 }) {
          let j10 = this.buildWithCTE(e10), k10 = this.buildUpdateSet(a10, b10), l10 = g10 && cs.join([cs.raw(" from "), this.buildFromTable(g10)]), m10 = this.buildJoins(f10), n10 = d10 ? cs` returning ${this.buildSelection(d10, { isSingleTable: true })}` : void 0, o10 = c10 ? cs` where ${c10}` : void 0, p10 = this.buildOrderBy(i10), q3 = this.buildLimit(h10);
          return cs`${j10}update ${a10} set ${k10}${l10}${m10}${o10}${n10}${p10}${q3}`;
        }
        buildSelection(a10, { isSingleTable: b10 = false } = {}) {
          let c10 = a10.length, d10 = a10.flatMap(({ field: a11 }, d11) => {
            let e10 = [];
            if (bL(a11, cn.Aliased) && a11.isSelectionField) e10.push(cs.identifier(a11.fieldAlias));
            else if (bL(a11, cn.Aliased) || bL(a11, cn)) {
              let c11 = bL(a11, cn.Aliased) ? a11.sql : a11;
              b10 ? e10.push(new cn(c11.queryChunks.map((a12) => bL(a12, bM) ? cs.identifier(this.casing.getColumnCasing(a12)) : a12))) : e10.push(c11), bL(a11, cn.Aliased) && e10.push(cs` as ${cs.identifier(a11.fieldAlias)}`);
            } else if (bL(a11, bM)) {
              let c11 = a11.table[bW.Symbol.Name];
              "SQLiteNumericBigInt" === a11.columnType ? b10 ? e10.push(cs`cast(${cs.identifier(this.casing.getColumnCasing(a11))} as text)`) : e10.push(cs`cast(${cs.identifier(c11)}.${cs.identifier(this.casing.getColumnCasing(a11))} as text)`) : b10 ? e10.push(cs.identifier(this.casing.getColumnCasing(a11))) : e10.push(cs`${cs.identifier(c11)}.${cs.identifier(this.casing.getColumnCasing(a11))}`);
            } else if (bL(a11, cg)) {
              let b11 = Object.entries(a11._.selectedFields);
              if (1 === b11.length) {
                let c11 = b11[0][1], d12 = bL(c11, cn) ? c11.decoder : bL(c11, bM) ? { mapFromDriverValue: (a12) => c11.mapFromDriverValue(a12) } : c11.sql.decoder;
                d12 && (a11._.sql.decoder = d12);
              }
              e10.push(a11);
            }
            return d11 < c10 - 1 && e10.push(cs`, `), e10;
          });
          return cs.join(d10);
        }
        buildJoins(a10) {
          if (!a10 || 0 === a10.length) return;
          let b10 = [];
          if (a10) for (let [c10, d10] of a10.entries()) {
            0 === c10 && b10.push(cs` `);
            let e10 = d10.table, f10 = d10.on ? cs` on ${d10.on}` : void 0;
            if (bL(e10, f8)) {
              let a11 = e10[f8.Symbol.Name], c11 = e10[f8.Symbol.Schema], g10 = e10[f8.Symbol.OriginalName], h10 = a11 === g10 ? void 0 : d10.alias;
              b10.push(cs`${cs.raw(d10.joinType)} join ${c11 ? cs`${cs.identifier(c11)}.` : void 0}${cs.identifier(g10)}${h10 && cs` ${cs.identifier(h10)}`}${f10}`);
            } else b10.push(cs`${cs.raw(d10.joinType)} join ${e10}${f10}`);
            c10 < a10.length - 1 && b10.push(cs` `);
          }
          return cs.join(b10);
        }
        buildLimit(a10) {
          return "object" == typeof a10 || "number" == typeof a10 && a10 >= 0 ? cs` limit ${a10}` : void 0;
        }
        buildOrderBy(a10) {
          let b10 = [];
          if (a10) for (let [c10, d10] of a10.entries()) b10.push(d10), c10 < a10.length - 1 && b10.push(cs`, `);
          return b10.length > 0 ? cs` order by ${cs.join(b10)}` : void 0;
        }
        buildFromTable(a10) {
          return bL(a10, bW) && a10[bW.Symbol.IsAlias] ? cs`${cs`${cs.identifier(a10[bW.Symbol.Schema] ?? "")}.`.if(a10[bW.Symbol.Schema])}${cs.identifier(a10[bW.Symbol.OriginalName])} ${cs.identifier(a10[bW.Symbol.Name])}` : a10;
        }
        buildSelectQuery({ withList: a10, fields: b10, fieldsFlat: c10, where: d10, having: e10, table: f10, joins: g10, orderBy: h10, groupBy: i10, limit: j10, offset: k10, distinct: l10, setOperators: m10 }) {
          let n10 = c10 ?? cX(b10);
          for (let a11 of n10) {
            let b11;
            if (bL(a11.field, bM) && a11.field.table[bN] !== (bL(f10, cg) ? f10._.alias : bL(f10, ga) ? f10[cj].name : bL(f10, cn) ? void 0 : f10[bN]) && (b11 = a11.field.table, !g10?.some(({ alias: a12 }) => a12 === (b11[bW.Symbol.IsAlias] ? b11[bN] : b11[bW.Symbol.BaseName])))) {
              let b12 = a11.field.table[bN];
              throw Error(`Your "${a11.path.join("->")}" field references a column "${b12}"."${a11.field.name}", but the table "${b12}" is not part of the query! Did you forget to join it?`);
            }
          }
          let o10 = !g10 || 0 === g10.length, p10 = this.buildWithCTE(a10), q3 = l10 ? cs` distinct` : void 0, r2 = this.buildSelection(n10, { isSingleTable: o10 }), s2 = this.buildFromTable(f10), t2 = this.buildJoins(g10), u2 = d10 ? cs` where ${d10}` : void 0, v2 = e10 ? cs` having ${e10}` : void 0, w2 = [];
          if (i10) for (let [a11, b11] of i10.entries()) w2.push(b11), a11 < i10.length - 1 && w2.push(cs`, `);
          let x2 = w2.length > 0 ? cs` group by ${cs.join(w2)}` : void 0, y2 = this.buildOrderBy(h10), z2 = this.buildLimit(j10), A2 = k10 ? cs` offset ${k10}` : void 0, B2 = cs`${p10}select${q3} ${r2} from ${s2}${t2}${u2}${x2}${v2}${y2}${z2}${A2}`;
          return m10.length > 0 ? this.buildSetOperations(B2, m10) : B2;
        }
        buildSetOperations(a10, b10) {
          let [c10, ...d10] = b10;
          if (!c10) throw Error("Cannot pass undefined values to any set operator");
          return 0 === d10.length ? this.buildSetOperationQuery({ leftSelect: a10, setOperator: c10 }) : this.buildSetOperations(this.buildSetOperationQuery({ leftSelect: a10, setOperator: c10 }), d10);
        }
        buildSetOperationQuery({ leftSelect: a10, setOperator: { type: b10, isAll: c10, rightSelect: d10, limit: e10, orderBy: f10, offset: g10 } }) {
          let h10, i10 = cs`${a10.getSQL()} `, j10 = cs`${d10.getSQL()}`;
          if (f10 && f10.length > 0) {
            let a11 = [];
            for (let b11 of f10) if (bL(b11, fz)) a11.push(cs.identifier(b11.name));
            else if (bL(b11, cn)) {
              for (let a12 = 0; a12 < b11.queryChunks.length; a12++) {
                let c11 = b11.queryChunks[a12];
                bL(c11, fz) && (b11.queryChunks[a12] = cs.identifier(this.casing.getColumnCasing(c11)));
              }
              a11.push(cs`${b11}`);
            } else a11.push(cs`${b11}`);
            h10 = cs` order by ${cs.join(a11, cs`, `)}`;
          }
          let k10 = "object" == typeof e10 || "number" == typeof e10 && e10 >= 0 ? cs` limit ${e10}` : void 0, l10 = cs.raw(`${b10} ${c10 ? "all " : ""}`), m10 = g10 ? cs` offset ${g10}` : void 0;
          return cs`${i10}${l10}${j10}${h10}${k10}${m10}`;
        }
        buildInsertQuery({ table: a10, values: b10, onConflict: c10, returning: d10, withList: e10, select: f10 }) {
          let g10 = [], h10 = Object.entries(a10[bW.Symbol.Columns]).filter(([a11, b11]) => !b11.shouldDisableInsert()), i10 = h10.map(([, a11]) => cs.identifier(this.casing.getColumnCasing(a11)));
          if (f10) bL(b10, cn) ? g10.push(b10) : g10.push(b10.getSQL());
          else for (let [a11, c11] of (g10.push(cs.raw("values ")), b10.entries())) {
            let d11 = [];
            for (let [a12, b11] of h10) {
              let e11 = c11[a12];
              if (void 0 === e11 || bL(e11, cr) && void 0 === e11.value) {
                let a13;
                if (null !== b11.default && void 0 !== b11.default) a13 = bL(b11.default, cn) ? b11.default : cs.param(b11.default, b11);
                else if (void 0 !== b11.defaultFn) {
                  let c12 = b11.defaultFn();
                  a13 = bL(c12, cn) ? c12 : cs.param(c12, b11);
                } else if (b11.default || void 0 === b11.onUpdateFn) a13 = cs`null`;
                else {
                  let c12 = b11.onUpdateFn();
                  a13 = bL(c12, cn) ? c12 : cs.param(c12, b11);
                }
                d11.push(a13);
              } else d11.push(e11);
            }
            g10.push(d11), a11 < b10.length - 1 && g10.push(cs`, `);
          }
          let j10 = this.buildWithCTE(e10), k10 = cs.join(g10), l10 = d10 ? cs` returning ${this.buildSelection(d10, { isSingleTable: true })}` : void 0, m10 = c10?.length ? cs.join(c10) : void 0;
          return cs`${j10}insert into ${a10} ${i10} ${k10}${m10}${l10}`;
        }
        sqlToQuery(a10, b10) {
          return a10.toQuery({ casing: this.casing, escapeName: this.escapeName, escapeParam: this.escapeParam, escapeString: this.escapeString, invokeSource: b10 });
        }
        buildRelationalQuery({ fullSchema: a10, schema: b10, tableNamesMap: c10, table: d10, tableConfig: e10, queryConfig: f10, tableAlias: g10, nestedQueryRelation: h10, joinOn: i10 }) {
          let j10, k10 = [], l10, m10, n10 = [], o10, p10 = [];
          if (true === f10) k10 = Object.entries(e10.columns).map(([a11, b11]) => ({ dbKey: b11.name, tsKey: a11, field: fh(b11, g10), relationTableTsKey: void 0, isJson: false, selection: [] }));
          else {
            let d11 = Object.fromEntries(Object.entries(e10.columns).map(([a11, b11]) => [a11, fh(b11, g10)]));
            if (f10.where) {
              let a11 = "function" == typeof f10.where ? f10.where(d11, e7()) : f10.where;
              o10 = a11 && fj(a11, g10);
            }
            let h11 = [], i11 = [];
            if (f10.columns) {
              let a11 = false;
              for (let [b11, c11] of Object.entries(f10.columns)) void 0 !== c11 && b11 in e10.columns && (a11 || true !== c11 || (a11 = true), i11.push(b11));
              i11.length > 0 && (i11 = a11 ? i11.filter((a12) => f10.columns?.[a12] === true) : Object.keys(e10.columns).filter((a12) => !i11.includes(a12)));
            } else i11 = Object.keys(e10.columns);
            for (let a11 of i11) {
              let b11 = e10.columns[a11];
              h11.push({ tsKey: a11, value: b11 });
            }
            let j11 = [];
            if (f10.with && (j11 = Object.entries(f10.with).filter((a11) => !!a11[1]).map(([a11, b11]) => ({ tsKey: a11, queryConfig: b11, relation: e10.relations[a11] }))), f10.extras) for (let [a11, b11] of Object.entries("function" == typeof f10.extras ? f10.extras(d11, { sql: cs }) : f10.extras)) h11.push({ tsKey: a11, value: fi(b11, g10) });
            for (let { tsKey: a11, value: b11 } of h11) k10.push({ dbKey: bL(b11, cn.Aliased) ? b11.fieldAlias : e10.columns[a11].name, tsKey: a11, field: bL(b11, bM) ? fh(b11, g10) : b11, relationTableTsKey: void 0, isJson: false, selection: [] });
            let p11 = "function" == typeof f10.orderBy ? f10.orderBy(d11, e8()) : f10.orderBy ?? [];
            for (let { tsKey: d12, queryConfig: e11, relation: h12 } of (Array.isArray(p11) || (p11 = [p11]), n10 = p11.map((a11) => bL(a11, bM) ? fh(a11, g10) : fj(a11, g10)), l10 = f10.limit, m10 = f10.offset, j11)) {
              let f11 = fa(b10, c10, h12), i12 = c10[bX(h12.referencedTable)], j12 = `${g10}_${d12}`, l11 = cA(...f11.fields.map((a11, b11) => cy(fh(f11.references[b11], j12), fh(a11, g10)))), m11 = this.buildRelationalQuery({ fullSchema: a10, schema: b10, tableNamesMap: c10, table: a10[i12], tableConfig: b10[i12], queryConfig: bL(h12, e5) ? true === e11 ? { limit: 1 } : { ...e11, limit: 1 } : e11, tableAlias: j12, joinOn: l11, nestedQueryRelation: h12 }), n11 = cs`(${m11.sql})`.as(d12);
              k10.push({ dbKey: d12, tsKey: d12, field: n11, relationTableTsKey: i12, isJson: true, selection: m11.selection });
            }
          }
          if (0 === k10.length) throw new fp({ message: `No fields selected for table "${e10.tsName}" ("${g10}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.` });
          if (o10 = cA(i10, o10), h10) {
            let a11 = cs`json_array(${cs.join(k10.map(({ field: a12 }) => bL(a12, fz) ? cs.identifier(this.casing.getColumnCasing(a12)) : bL(a12, cn.Aliased) ? a12.sql : a12), cs`, `)})`;
            bL(h10, e6) && (a11 = cs`coalesce(json_group_array(${a11}), json_array())`);
            let b11 = [{ dbKey: "data", tsKey: "data", field: a11.as("data"), isJson: true, relationTableTsKey: e10.tsName, selection: k10 }];
            void 0 !== l10 || void 0 !== m10 || n10.length > 0 ? (j10 = this.buildSelectQuery({ table: fg(d10, g10), fields: {}, fieldsFlat: [{ path: [], field: cs.raw("*") }], where: o10, limit: l10, offset: m10, orderBy: n10, setOperators: [] }), o10 = void 0, l10 = void 0, m10 = void 0, n10 = void 0) : j10 = fg(d10, g10), j10 = this.buildSelectQuery({ table: bL(j10, f8) ? j10 : new cg(j10, {}, g10), fields: {}, fieldsFlat: b11.map(({ field: a12 }) => ({ path: [], field: bL(a12, bM) ? fh(a12, g10) : a12 })), joins: p10, where: o10, limit: l10, offset: m10, orderBy: n10, setOperators: [] });
          } else j10 = this.buildSelectQuery({ table: fg(d10, g10), fields: {}, fieldsFlat: k10.map(({ field: a11 }) => ({ path: [], field: bL(a11, bM) ? fh(a11, g10) : a11 })), joins: p10, where: o10, limit: l10, offset: m10, orderBy: n10, setOperators: [] });
          return { tableTsKey: e10.tsName, sql: j10, selection: k10 };
        }
      }
      class gc extends gb {
        static [bK] = "SQLiteSyncDialect";
        migrate(a10, b10, c10) {
          let d10 = void 0 === c10 || "string" == typeof c10 ? "__drizzle_migrations" : c10.migrationsTable ?? "__drizzle_migrations", e10 = cs`
			CREATE TABLE IF NOT EXISTS ${cs.identifier(d10)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
          b10.run(e10);
          let f10 = b10.values(cs`SELECT id, hash, created_at FROM ${cs.identifier(d10)} ORDER BY created_at DESC LIMIT 1`)[0] ?? void 0;
          b10.run(cs`BEGIN`);
          try {
            for (let c11 of a10) if (!f10 || Number(f10[2]) < c11.folderMillis) {
              for (let a11 of c11.sql) b10.run(cs.raw(a11));
              b10.run(cs`INSERT INTO ${cs.identifier(d10)} ("hash", "created_at") VALUES(${c11.hash}, ${c11.folderMillis})`);
            }
            b10.run(cs`COMMIT`);
          } catch (a11) {
            throw b10.run(cs`ROLLBACK`), a11;
          }
        }
      }
      class gd extends gb {
        static [bK] = "SQLiteAsyncDialect";
        async migrate(a10, b10, c10) {
          let d10 = void 0 === c10 || "string" == typeof c10 ? "__drizzle_migrations" : c10.migrationsTable ?? "__drizzle_migrations", e10 = cs`
			CREATE TABLE IF NOT EXISTS ${cs.identifier(d10)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at numeric
			)
		`;
          await b10.run(e10);
          let f10 = (await b10.values(cs`SELECT id, hash, created_at FROM ${cs.identifier(d10)} ORDER BY created_at DESC LIMIT 1`))[0] ?? void 0;
          await b10.transaction(async (b11) => {
            for (let c11 of a10) if (!f10 || Number(f10[2]) < c11.folderMillis) {
              for (let a11 of c11.sql) await b11.run(cs.raw(a11));
              await b11.run(cs`INSERT INTO ${cs.identifier(d10)} ("hash", "created_at") VALUES(${c11.hash}, ${c11.folderMillis})`);
            }
          });
        }
      }
      class ge {
        static [bK] = "TypedQueryBuilder";
        getSelectedFields() {
          return this._.selectedFields;
        }
      }
      class gf {
        static [bK] = "QueryPromise";
        [Symbol.toStringTag] = "QueryPromise";
        catch(a10) {
          return this.then(void 0, a10);
        }
        finally(a10) {
          return this.then((b10) => (a10?.(), b10), (b10) => {
            throw a10?.(), b10;
          });
        }
        then(a10, b10) {
          return this.execute().then(a10, b10);
        }
      }
      function gg(a10) {
        return bL(a10, f8) ? [`${a10[bW.Symbol.BaseName]}`] : bL(a10, cg) ? a10._.usedTables ?? [] : bL(a10, cn) ? a10.usedTables ?? [] : [];
      }
      class gh {
        static [bK] = "SQLiteSelectBuilder";
        fields;
        session;
        dialect;
        withList;
        distinct;
        constructor(a10) {
          this.fields = a10.fields, this.session = a10.session, this.dialect = a10.dialect, this.withList = a10.withList, this.distinct = a10.distinct;
        }
        from(a10) {
          let b10, c10 = !!this.fields;
          return b10 = this.fields ? this.fields : bL(a10, cg) ? Object.fromEntries(Object.keys(a10._.selectedFields).map((b11) => [b11, a10[b11]])) : bL(a10, ga) ? a10[cj].selectedFields : bL(a10, cn) ? {} : c_(a10), new gj({ table: a10, fields: b10, isPartialSelect: c10, session: this.session, dialect: this.dialect, withList: this.withList, distinct: this.distinct });
        }
      }
      class gi extends ge {
        static [bK] = "SQLiteSelectQueryBuilder";
        _;
        config;
        joinsNotNullableMap;
        tableName;
        isPartialSelect;
        session;
        dialect;
        cacheConfig = void 0;
        usedTables = /* @__PURE__ */ new Set();
        constructor({ table: a10, fields: b10, isPartialSelect: c10, session: d10, dialect: e10, withList: f10, distinct: g10 }) {
          for (let h10 of (super(), this.config = { withList: f10, table: a10, fields: { ...b10 }, distinct: g10, setOperators: [] }, this.isPartialSelect = c10, this.session = d10, this.dialect = e10, this._ = { selectedFields: b10, config: this.config }, this.tableName = c0(a10), this.joinsNotNullableMap = "string" == typeof this.tableName ? { [this.tableName]: true } : {}, gg(a10))) this.usedTables.add(h10);
        }
        getUsedTables() {
          return [...this.usedTables];
        }
        createJoin(a10) {
          return (b10, c10) => {
            let d10 = this.tableName, e10 = c0(b10);
            for (let a11 of gg(b10)) this.usedTables.add(a11);
            if ("string" == typeof e10 && this.config.joins?.some((a11) => a11.alias === e10)) throw Error(`Alias "${e10}" is already used in this query`);
            if (!this.isPartialSelect && (1 === Object.keys(this.joinsNotNullableMap).length && "string" == typeof d10 && (this.config.fields = { [d10]: this.config.fields }), "string" == typeof e10 && !bL(b10, cn))) {
              let a11 = bL(b10, cg) ? b10._.selectedFields : bL(b10, cw) ? b10[cj].selectedFields : b10[bW.Symbol.Columns];
              this.config.fields[e10] = a11;
            }
            if ("function" == typeof c10 && (c10 = c10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.joins || (this.config.joins = []), this.config.joins.push({ on: c10, table: b10, joinType: a10, alias: e10 }), "string" == typeof e10) switch (a10) {
              case "left":
                this.joinsNotNullableMap[e10] = false;
                break;
              case "right":
                this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([a11]) => [a11, false])), this.joinsNotNullableMap[e10] = true;
                break;
              case "cross":
              case "inner":
                this.joinsNotNullableMap[e10] = true;
                break;
              case "full":
                this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([a11]) => [a11, false])), this.joinsNotNullableMap[e10] = false;
            }
            return this;
          };
        }
        leftJoin = this.createJoin("left");
        rightJoin = this.createJoin("right");
        innerJoin = this.createJoin("inner");
        fullJoin = this.createJoin("full");
        crossJoin = this.createJoin("cross");
        createSetOperator(a10, b10) {
          return (c10) => {
            let d10 = "function" == typeof c10 ? c10(gl()) : c10;
            if (!cY(this.getSelectedFields(), d10.getSelectedFields())) throw Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
            return this.config.setOperators.push({ type: a10, isAll: b10, rightSelect: d10 }), this;
          };
        }
        union = this.createSetOperator("union", false);
        unionAll = this.createSetOperator("union", true);
        intersect = this.createSetOperator("intersect", false);
        except = this.createSetOperator("except", false);
        addSetOperators(a10) {
          return this.config.setOperators.push(...a10), this;
        }
        where(a10) {
          return "function" == typeof a10 && (a10 = a10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.where = a10, this;
        }
        having(a10) {
          return "function" == typeof a10 && (a10 = a10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.having = a10, this;
        }
        groupBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })));
            this.config.groupBy = Array.isArray(b10) ? b10 : [b10];
          } else this.config.groupBy = a10;
          return this;
        }
        orderBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" }))), c10 = Array.isArray(b10) ? b10 : [b10];
            this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).orderBy = c10 : this.config.orderBy = c10;
          } else this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).orderBy = a10 : this.config.orderBy = a10;
          return this;
        }
        limit(a10) {
          return this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).limit = a10 : this.config.limit = a10, this;
        }
        offset(a10) {
          return this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).offset = a10 : this.config.offset = a10, this;
        }
        getSQL() {
          return this.dialect.buildSelectQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        as(a10) {
          let b10 = [];
          if (b10.push(...gg(this.config.table)), this.config.joins) for (let a11 of this.config.joins) b10.push(...gg(a11.table));
          return new Proxy(new cg(this.getSQL(), this.config.fields, a10, false, [...new Set(b10)]), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
        }
        getSelectedFields() {
          return new Proxy(this.config.fields, new fk({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
        }
        $dynamic() {
          return this;
        }
      }
      class gj extends gi {
        static [bK] = "SQLiteSelect";
        _prepare(a10 = true) {
          if (!this.session) throw Error("Cannot execute a query on a query builder. Please use a database instance instead.");
          let b10 = cX(this.config.fields), c10 = this.session[a10 ? "prepareOneTimeQuery" : "prepareQuery"](this.dialect.sqlToQuery(this.getSQL()), b10, "all", true, void 0, { type: "select", tables: [...this.usedTables] }, this.cacheConfig);
          return c10.joinsNotNullableMap = this.joinsNotNullableMap, c10;
        }
        $withCache(a10) {
          return this.cacheConfig = void 0 === a10 ? { config: {}, enable: true, autoInvalidate: true } : false === a10 ? { enable: false } : { enable: true, autoInvalidate: true, ...a10 }, this;
        }
        prepare() {
          return this._prepare(false);
        }
        run = (a10) => this._prepare().run(a10);
        all = (a10) => this._prepare().all(a10);
        get = (a10) => this._prepare().get(a10);
        values = (a10) => this._prepare().values(a10);
        async execute() {
          return this.all();
        }
      }
      function gk(a10, b10) {
        return (c10, d10, ...e10) => {
          let f10 = [d10, ...e10].map((c11) => ({ type: a10, isAll: b10, rightSelect: c11 }));
          for (let a11 of f10) if (!cY(c10.getSelectedFields(), a11.rightSelect.getSelectedFields())) throw Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
          return c10.addSetOperators(f10);
        };
      }
      c$(gj, [gf]);
      let gl = () => ({ union: gm, unionAll: gn, intersect: go, except: gp }), gm = gk("union", false), gn = gk("union", true), go = gk("intersect", false), gp = gk("except", false);
      class gq {
        static [bK] = "SQLiteQueryBuilder";
        dialect;
        dialectConfig;
        constructor(a10) {
          this.dialect = bL(a10, gb) ? a10 : void 0, this.dialectConfig = bL(a10, gb) ? void 0 : a10;
        }
        $with = (a10, b10) => {
          let c10 = this;
          return { as: (d10) => ("function" == typeof d10 && (d10 = d10(c10)), new Proxy(new ch(d10.getSQL(), b10 ?? ("getSelectedFields" in d10 ? d10.getSelectedFields() ?? {} : {}), a10, true), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }))) };
        };
        with(...a10) {
          let b10 = this;
          return { select: function(c10) {
            return new gh({ fields: c10 ?? void 0, session: void 0, dialect: b10.getDialect(), withList: a10 });
          }, selectDistinct: function(c10) {
            return new gh({ fields: c10 ?? void 0, session: void 0, dialect: b10.getDialect(), withList: a10, distinct: true });
          } };
        }
        select(a10) {
          return new gh({ fields: a10 ?? void 0, session: void 0, dialect: this.getDialect() });
        }
        selectDistinct(a10) {
          return new gh({ fields: a10 ?? void 0, session: void 0, dialect: this.getDialect(), distinct: true });
        }
        getDialect() {
          return this.dialect || (this.dialect = new gc(this.dialectConfig)), this.dialect;
        }
      }
      class gr {
        constructor(a10, b10, c10, d10) {
          this.table = a10, this.session = b10, this.dialect = c10, this.withList = d10;
        }
        static [bK] = "SQLiteUpdateBuilder";
        set(a10) {
          return new gs(this.table, cZ(this.table, a10), this.session, this.dialect, this.withList);
        }
      }
      class gs extends gf {
        constructor(a10, b10, c10, d10, e10) {
          super(), this.session = c10, this.dialect = d10, this.config = { set: b10, table: a10, withList: e10, joins: [] };
        }
        static [bK] = "SQLiteUpdate";
        config;
        from(a10) {
          return this.config.from = a10, this;
        }
        createJoin(a10) {
          return (b10, c10) => {
            let d10 = c0(b10);
            if ("string" == typeof d10 && this.config.joins.some((a11) => a11.alias === d10)) throw Error(`Alias "${d10}" is already used in this query`);
            if ("function" == typeof c10) {
              let a11 = this.config.from ? bL(b10, f8) ? b10[bW.Symbol.Columns] : bL(b10, cg) ? b10._.selectedFields : bL(b10, ga) ? b10[cj].selectedFields : void 0 : void 0;
              c10 = c10(new Proxy(this.config.table[bW.Symbol.Columns], new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })), a11 && new Proxy(a11, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })));
            }
            return this.config.joins.push({ on: c10, table: b10, joinType: a10, alias: d10 }), this;
          };
        }
        leftJoin = this.createJoin("left");
        rightJoin = this.createJoin("right");
        innerJoin = this.createJoin("inner");
        fullJoin = this.createJoin("full");
        where(a10) {
          return this.config.where = a10, this;
        }
        orderBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.table[bW.Symbol.Columns], new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" }))), c10 = Array.isArray(b10) ? b10 : [b10];
            this.config.orderBy = c10;
          } else this.config.orderBy = a10;
          return this;
        }
        limit(a10) {
          return this.config.limit = a10, this;
        }
        returning(a10 = this.config.table[f8.Symbol.Columns]) {
          return this.config.returning = cX(a10), this;
        }
        getSQL() {
          return this.dialect.buildUpdateQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        _prepare(a10 = true) {
          return this.session[a10 ? "prepareOneTimeQuery" : "prepareQuery"](this.dialect.sqlToQuery(this.getSQL()), this.config.returning, this.config.returning ? "all" : "run", true, void 0, { type: "insert", tables: gg(this.config.table) });
        }
        prepare() {
          return this._prepare(false);
        }
        run = (a10) => this._prepare().run(a10);
        all = (a10) => this._prepare().all(a10);
        get = (a10) => this._prepare().get(a10);
        values = (a10) => this._prepare().values(a10);
        async execute() {
          return this.config.returning ? this.all() : this.run();
        }
        $dynamic() {
          return this;
        }
      }
      class gt {
        constructor(a10, b10, c10, d10) {
          this.table = a10, this.session = b10, this.dialect = c10, this.withList = d10;
        }
        static [bK] = "SQLiteInsertBuilder";
        values(a10) {
          if (0 === (a10 = Array.isArray(a10) ? a10 : [a10]).length) throw Error("values() must be called with at least one value");
          let b10 = a10.map((a11) => {
            let b11 = {}, c10 = this.table[bW.Symbol.Columns];
            for (let d10 of Object.keys(a11)) {
              let e10 = a11[d10];
              b11[d10] = bL(e10, cn) ? e10 : new cr(e10, c10[d10]);
            }
            return b11;
          });
          return new gu(this.table, b10, this.session, this.dialect, this.withList);
        }
        select(a10) {
          let b10 = "function" == typeof a10 ? a10(new gq()) : a10;
          if (!bL(b10, cn) && !cY(this.table[bP], b10._.selectedFields)) throw Error("Insert select error: selected fields are not the same or are in a different order compared to the table definition");
          return new gu(this.table, b10, this.session, this.dialect, this.withList, true);
        }
      }
      class gu extends gf {
        constructor(a10, b10, c10, d10, e10, f10) {
          super(), this.session = c10, this.dialect = d10, this.config = { table: a10, values: b10, withList: e10, select: f10 };
        }
        static [bK] = "SQLiteInsert";
        config;
        returning(a10 = this.config.table[f8.Symbol.Columns]) {
          return this.config.returning = cX(a10), this;
        }
        onConflictDoNothing(a10 = {}) {
          if (this.config.onConflict || (this.config.onConflict = []), void 0 === a10.target) this.config.onConflict.push(cs` on conflict do nothing`);
          else {
            let b10 = Array.isArray(a10.target) ? cs`${a10.target}` : cs`${[a10.target]}`, c10 = a10.where ? cs` where ${a10.where}` : cs``;
            this.config.onConflict.push(cs` on conflict ${b10} do nothing${c10}`);
          }
          return this;
        }
        onConflictDoUpdate(a10) {
          if (a10.where && (a10.targetWhere || a10.setWhere)) throw Error('You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.');
          this.config.onConflict || (this.config.onConflict = []);
          let b10 = a10.where ? cs` where ${a10.where}` : void 0, c10 = a10.targetWhere ? cs` where ${a10.targetWhere}` : void 0, d10 = a10.setWhere ? cs` where ${a10.setWhere}` : void 0, e10 = Array.isArray(a10.target) ? cs`${a10.target}` : cs`${[a10.target]}`, f10 = this.dialect.buildUpdateSet(this.config.table, cZ(this.config.table, a10.set));
          return this.config.onConflict.push(cs` on conflict ${e10}${c10} do update set ${f10}${b10}${d10}`), this;
        }
        getSQL() {
          return this.dialect.buildInsertQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        _prepare(a10 = true) {
          return this.session[a10 ? "prepareOneTimeQuery" : "prepareQuery"](this.dialect.sqlToQuery(this.getSQL()), this.config.returning, this.config.returning ? "all" : "run", true, void 0, { type: "insert", tables: gg(this.config.table) });
        }
        prepare() {
          return this._prepare(false);
        }
        run = (a10) => this._prepare().run(a10);
        all = (a10) => this._prepare().all(a10);
        get = (a10) => this._prepare().get(a10);
        values = (a10) => this._prepare().values(a10);
        async execute() {
          return this.config.returning ? this.all() : this.run();
        }
        $dynamic() {
          return this;
        }
      }
      class gv extends gf {
        constructor(a10, b10, c10, d10) {
          super(), this.table = a10, this.session = b10, this.dialect = c10, this.config = { table: a10, withList: d10 };
        }
        static [bK] = "SQLiteDelete";
        config;
        where(a10) {
          return this.config.where = a10, this;
        }
        orderBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.table[bW.Symbol.Columns], new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" }))), c10 = Array.isArray(b10) ? b10 : [b10];
            this.config.orderBy = c10;
          } else this.config.orderBy = a10;
          return this;
        }
        limit(a10) {
          return this.config.limit = a10, this;
        }
        returning(a10 = this.table[f8.Symbol.Columns]) {
          return this.config.returning = cX(a10), this;
        }
        getSQL() {
          return this.dialect.buildDeleteQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        _prepare(a10 = true) {
          return this.session[a10 ? "prepareOneTimeQuery" : "prepareQuery"](this.dialect.sqlToQuery(this.getSQL()), this.config.returning, this.config.returning ? "all" : "run", true, void 0, { type: "delete", tables: gg(this.config.table) });
        }
        prepare() {
          return this._prepare(false);
        }
        run = (a10) => this._prepare().run(a10);
        all = (a10) => this._prepare().all(a10);
        get = (a10) => this._prepare().get(a10);
        values = (a10) => this._prepare().values(a10);
        async execute(a10) {
          return this._prepare().execute(a10);
        }
        $dynamic() {
          return this;
        }
      }
      class gw extends cn {
        constructor(a10) {
          super(gw.buildEmbeddedCount(a10.source, a10.filters).queryChunks), this.params = a10, this.session = a10.session, this.sql = gw.buildCount(a10.source, a10.filters);
        }
        sql;
        static [bK] = "SQLiteCountBuilderAsync";
        [Symbol.toStringTag] = "SQLiteCountBuilderAsync";
        session;
        static buildEmbeddedCount(a10, b10) {
          return cs`(select count(*) from ${a10}${cs.raw(" where ").if(b10)}${b10})`;
        }
        static buildCount(a10, b10) {
          return cs`select count(*) from ${a10}${cs.raw(" where ").if(b10)}${b10}`;
        }
        then(a10, b10) {
          return Promise.resolve(this.session.count(this.sql)).then(a10, b10);
        }
        catch(a10) {
          return this.then(void 0, a10);
        }
        finally(a10) {
          return this.then((b10) => (a10?.(), b10), (b10) => {
            throw a10?.(), b10;
          });
        }
      }
      class gx {
        constructor(a10, b10, c10, d10, e10, f10, g10, h10) {
          this.mode = a10, this.fullSchema = b10, this.schema = c10, this.tableNamesMap = d10, this.table = e10, this.tableConfig = f10, this.dialect = g10, this.session = h10;
        }
        static [bK] = "SQLiteAsyncRelationalQueryBuilder";
        findMany(a10) {
          return "sync" === this.mode ? new gz(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, a10 || {}, "many") : new gy(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, a10 || {}, "many");
        }
        findFirst(a10) {
          return "sync" === this.mode ? new gz(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, a10 ? { ...a10, limit: 1 } : { limit: 1 }, "first") : new gy(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, a10 ? { ...a10, limit: 1 } : { limit: 1 }, "first");
        }
      }
      class gy extends gf {
        constructor(a10, b10, c10, d10, e10, f10, g10, h10, i10) {
          super(), this.fullSchema = a10, this.schema = b10, this.tableNamesMap = c10, this.table = d10, this.tableConfig = e10, this.dialect = f10, this.session = g10, this.config = h10, this.mode = i10;
        }
        static [bK] = "SQLiteAsyncRelationalQuery";
        mode;
        getSQL() {
          return this.dialect.buildRelationalQuery({ fullSchema: this.fullSchema, schema: this.schema, tableNamesMap: this.tableNamesMap, table: this.table, tableConfig: this.tableConfig, queryConfig: this.config, tableAlias: this.tableConfig.tsName }).sql;
        }
        _prepare(a10 = false) {
          let { query: b10, builtQuery: c10 } = this._toSQL();
          return this.session[a10 ? "prepareOneTimeQuery" : "prepareQuery"](c10, void 0, "first" === this.mode ? "get" : "all", true, (a11, c11) => {
            let d10 = a11.map((a12) => fc(this.schema, this.tableConfig, a12, b10.selection, c11));
            return "first" === this.mode ? d10[0] : d10;
          });
        }
        prepare() {
          return this._prepare(false);
        }
        _toSQL() {
          let a10 = this.dialect.buildRelationalQuery({ fullSchema: this.fullSchema, schema: this.schema, tableNamesMap: this.tableNamesMap, table: this.table, tableConfig: this.tableConfig, queryConfig: this.config, tableAlias: this.tableConfig.tsName }), b10 = this.dialect.sqlToQuery(a10.sql);
          return { query: a10, builtQuery: b10 };
        }
        toSQL() {
          return this._toSQL().builtQuery;
        }
        executeRaw() {
          return "first" === this.mode ? this._prepare(false).get() : this._prepare(false).all();
        }
        async execute() {
          return this.executeRaw();
        }
      }
      class gz extends gy {
        static [bK] = "SQLiteSyncRelationalQuery";
        sync() {
          return this.executeRaw();
        }
      }
      class gA extends gf {
        constructor(a10, b10, c10, d10, e10) {
          super(), this.execute = a10, this.getSQL = b10, this.dialect = d10, this.mapBatchResult = e10, this.config = { action: c10 };
        }
        static [bK] = "SQLiteRaw";
        config;
        getQuery() {
          return { ...this.dialect.sqlToQuery(this.getSQL()), method: this.config.action };
        }
        mapResult(a10, b10) {
          return b10 ? this.mapBatchResult(a10) : a10;
        }
        _prepare() {
          return this;
        }
        isResponseInArrayMode() {
          return false;
        }
      }
      class gB {
        constructor(a10, b10, c10, d10) {
          this.resultKind = a10, this.dialect = b10, this.session = c10, this._ = d10 ? { schema: d10.schema, fullSchema: d10.fullSchema, tableNamesMap: d10.tableNamesMap } : { schema: void 0, fullSchema: {}, tableNamesMap: {} }, this.query = {};
          let e10 = this.query;
          if (this._.schema) for (let [f10, g10] of Object.entries(this._.schema)) e10[f10] = new gx(a10, d10.fullSchema, this._.schema, this._.tableNamesMap, d10.fullSchema[f10], g10, b10, c10);
          this.$cache = { invalidate: async (a11) => {
          } };
        }
        static [bK] = "BaseSQLiteDatabase";
        query;
        $with = (a10, b10) => {
          let c10 = this;
          return { as: (d10) => ("function" == typeof d10 && (d10 = d10(new gq(c10.dialect))), new Proxy(new ch(d10.getSQL(), b10 ?? ("getSelectedFields" in d10 ? d10.getSelectedFields() ?? {} : {}), a10, true), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }))) };
        };
        $count(a10, b10) {
          return new gw({ source: a10, filters: b10, session: this.session });
        }
        with(...a10) {
          let b10 = this;
          return { select: function(c10) {
            return new gh({ fields: c10 ?? void 0, session: b10.session, dialect: b10.dialect, withList: a10 });
          }, selectDistinct: function(c10) {
            return new gh({ fields: c10 ?? void 0, session: b10.session, dialect: b10.dialect, withList: a10, distinct: true });
          }, update: function(c10) {
            return new gr(c10, b10.session, b10.dialect, a10);
          }, insert: function(c10) {
            return new gt(c10, b10.session, b10.dialect, a10);
          }, delete: function(c10) {
            return new gv(c10, b10.session, b10.dialect, a10);
          } };
        }
        select(a10) {
          return new gh({ fields: a10 ?? void 0, session: this.session, dialect: this.dialect });
        }
        selectDistinct(a10) {
          return new gh({ fields: a10 ?? void 0, session: this.session, dialect: this.dialect, distinct: true });
        }
        update(a10) {
          return new gr(a10, this.session, this.dialect);
        }
        $cache;
        insert(a10) {
          return new gt(a10, this.session, this.dialect);
        }
        delete(a10) {
          return new gv(a10, this.session, this.dialect);
        }
        run(a10) {
          let b10 = "string" == typeof a10 ? cs.raw(a10) : a10.getSQL();
          return "async" === this.resultKind ? new gA(async () => this.session.run(b10), () => b10, "run", this.dialect, this.session.extractRawRunValueFromBatchResult.bind(this.session)) : this.session.run(b10);
        }
        all(a10) {
          let b10 = "string" == typeof a10 ? cs.raw(a10) : a10.getSQL();
          return "async" === this.resultKind ? new gA(async () => this.session.all(b10), () => b10, "all", this.dialect, this.session.extractRawAllValueFromBatchResult.bind(this.session)) : this.session.all(b10);
        }
        get(a10) {
          let b10 = "string" == typeof a10 ? cs.raw(a10) : a10.getSQL();
          return "async" === this.resultKind ? new gA(async () => this.session.get(b10), () => b10, "get", this.dialect, this.session.extractRawGetValueFromBatchResult.bind(this.session)) : this.session.get(b10);
        }
        values(a10) {
          let b10 = "string" == typeof a10 ? cs.raw(a10) : a10.getSQL();
          return "async" === this.resultKind ? new gA(async () => this.session.values(b10), () => b10, "values", this.dialect, this.session.extractRawValuesValueFromBatchResult.bind(this.session)) : this.session.values(b10);
        }
        transaction(a10, b10) {
          return this.session.transaction(a10, b10);
        }
      }
      class gC {
        static [bK] = "Cache";
      }
      class gD extends gC {
        strategy() {
          return "all";
        }
        static [bK] = "NoopCache";
        async get(a10) {
        }
        async put(a10, b10, c10, d10) {
        }
        async onMutate(a10) {
        }
      }
      async function gE(a10, b10) {
        let c10 = `${a10}-${JSON.stringify(b10)}`, d10 = new TextEncoder().encode(c10);
        return [...new Uint8Array(await crypto.subtle.digest("SHA-256", d10))].map((a11) => a11.toString(16).padStart(2, "0")).join("");
      }
      class gF extends gf {
        constructor(a10) {
          super(), this.resultCb = a10;
        }
        static [bK] = "ExecuteResultSync";
        async execute() {
          return this.resultCb();
        }
        sync() {
          return this.resultCb();
        }
      }
      class gG {
        constructor(a10, b10, c10, d10, e10, f10) {
          this.mode = a10, this.executeMethod = b10, this.query = c10, this.cache = d10, this.queryMetadata = e10, this.cacheConfig = f10, d10 && "all" === d10.strategy() && void 0 === f10 && (this.cacheConfig = { enable: true, autoInvalidate: true }), this.cacheConfig?.enable || (this.cacheConfig = void 0);
        }
        static [bK] = "PreparedQuery";
        joinsNotNullableMap;
        async queryWithCache(a10, b10, c10) {
          if (void 0 === this.cache || bL(this.cache, gD) || void 0 === this.queryMetadata || this.cacheConfig && !this.cacheConfig.enable) try {
            return await c10();
          } catch (c11) {
            throw new fq(a10, b10, c11);
          }
          if (("insert" === this.queryMetadata.type || "update" === this.queryMetadata.type || "delete" === this.queryMetadata.type) && this.queryMetadata.tables.length > 0) try {
            let [a11] = await Promise.all([c10(), this.cache.onMutate({ tables: this.queryMetadata.tables })]);
            return a11;
          } catch (c11) {
            throw new fq(a10, b10, c11);
          }
          if (!this.cacheConfig) try {
            return await c10();
          } catch (c11) {
            throw new fq(a10, b10, c11);
          }
          if ("select" === this.queryMetadata.type) {
            let d10 = await this.cache.get(this.cacheConfig.tag ?? await gE(a10, b10), this.queryMetadata.tables, void 0 !== this.cacheConfig.tag, this.cacheConfig.autoInvalidate);
            if (void 0 === d10) {
              let d11;
              try {
                d11 = await c10();
              } catch (c11) {
                throw new fq(a10, b10, c11);
              }
              return await this.cache.put(this.cacheConfig.tag ?? await gE(a10, b10), d11, this.cacheConfig.autoInvalidate ? this.queryMetadata.tables : [], void 0 !== this.cacheConfig.tag, this.cacheConfig.config), d11;
            }
            return d10;
          }
          try {
            return await c10();
          } catch (c11) {
            throw new fq(a10, b10, c11);
          }
        }
        getQuery() {
          return this.query;
        }
        mapRunResult(a10, b10) {
          return a10;
        }
        mapAllResult(a10, b10) {
          throw Error("Not implemented");
        }
        mapGetResult(a10, b10) {
          throw Error("Not implemented");
        }
        execute(a10) {
          return "async" === this.mode ? this[this.executeMethod](a10) : new gF(() => this[this.executeMethod](a10));
        }
        mapResult(a10, b10) {
          switch (this.executeMethod) {
            case "run":
              return this.mapRunResult(a10, b10);
            case "all":
              return this.mapAllResult(a10, b10);
            case "get":
              return this.mapGetResult(a10, b10);
          }
        }
      }
      class gH {
        constructor(a10) {
          this.dialect = a10;
        }
        static [bK] = "SQLiteSession";
        prepareOneTimeQuery(a10, b10, c10, d10, e10, f10, g10) {
          return this.prepareQuery(a10, b10, c10, d10, e10, f10, g10);
        }
        run(a10) {
          let b10 = this.dialect.sqlToQuery(a10);
          try {
            return this.prepareOneTimeQuery(b10, void 0, "run", false).run();
          } catch (a11) {
            throw new fp({ cause: a11, message: `Failed to run the query '${b10.sql}'` });
          }
        }
        extractRawRunValueFromBatchResult(a10) {
          return a10;
        }
        all(a10) {
          return this.prepareOneTimeQuery(this.dialect.sqlToQuery(a10), void 0, "run", false).all();
        }
        extractRawAllValueFromBatchResult(a10) {
          throw Error("Not implemented");
        }
        get(a10) {
          return this.prepareOneTimeQuery(this.dialect.sqlToQuery(a10), void 0, "run", false).get();
        }
        extractRawGetValueFromBatchResult(a10) {
          throw Error("Not implemented");
        }
        values(a10) {
          return this.prepareOneTimeQuery(this.dialect.sqlToQuery(a10), void 0, "run", false).values();
        }
        async count(a10) {
          return (await this.values(a10))[0][0];
        }
        extractRawValuesValueFromBatchResult(a10) {
          throw Error("Not implemented");
        }
      }
      class gI extends gB {
        constructor(a10, b10, c10, d10, e10 = 0) {
          super(a10, b10, c10, d10), this.schema = d10, this.nestedIndex = e10;
        }
        static [bK] = "SQLiteTransaction";
        rollback() {
          throw new fr();
        }
      }
      class gJ extends gH {
        constructor(a10, b10, c10, d10 = {}) {
          super(b10), this.client = a10, this.schema = c10, this.options = d10, this.logger = d10.logger ?? new cV(), this.cache = d10.cache ?? new gD();
        }
        static [bK] = "SQLiteD1Session";
        logger;
        cache;
        prepareQuery(a10, b10, c10, d10, e10, f10, g10) {
          return new gM(this.client.prepare(a10.sql), a10, this.logger, this.cache, f10, g10, b10, c10, d10, e10);
        }
        async batch(a10) {
          let b10 = [], c10 = [];
          for (let d10 of a10) {
            let a11 = d10._prepare(), e10 = a11.getQuery();
            if (b10.push(a11), e10.params.length > 0) c10.push(a11.stmt.bind(...e10.params));
            else {
              let b11 = a11.getQuery();
              c10.push(this.client.prepare(b11.sql).bind(...b11.params));
            }
          }
          return (await this.client.batch(c10)).map((a11, c11) => b10[c11].mapResult(a11, true));
        }
        extractRawAllValueFromBatchResult(a10) {
          return a10.results;
        }
        extractRawGetValueFromBatchResult(a10) {
          return a10.results[0];
        }
        extractRawValuesValueFromBatchResult(a10) {
          return gL(a10.results);
        }
        async transaction(a10, b10) {
          let c10 = new gK("async", this.dialect, this, this.schema);
          await this.run(cs.raw(`begin${b10?.behavior ? " " + b10.behavior : ""}`));
          try {
            let b11 = await a10(c10);
            return await this.run(cs`commit`), b11;
          } catch (a11) {
            throw await this.run(cs`rollback`), a11;
          }
        }
      }
      class gK extends gI {
        static [bK] = "D1Transaction";
        async transaction(a10) {
          let b10 = `sp${this.nestedIndex}`, c10 = new gK("async", this.dialect, this.session, this.schema, this.nestedIndex + 1);
          await this.session.run(cs.raw(`savepoint ${b10}`));
          try {
            let d10 = await a10(c10);
            return await this.session.run(cs.raw(`release savepoint ${b10}`)), d10;
          } catch (a11) {
            throw await this.session.run(cs.raw(`rollback to savepoint ${b10}`)), a11;
          }
        }
      }
      function gL(a10) {
        let b10 = [];
        for (let c10 of a10) {
          let a11 = Object.keys(c10).map((a12) => c10[a12]);
          b10.push(a11);
        }
        return b10;
      }
      class gM extends gG {
        constructor(a10, b10, c10, d10, e10, f10, g10, h10, i10, j10) {
          super("async", h10, b10, d10, e10, f10), this.logger = c10, this._isResponseInArrayMode = i10, this.customResultMapper = j10, this.fields = g10, this.stmt = a10;
        }
        static [bK] = "D1PreparedQuery";
        customResultMapper;
        fields;
        stmt;
        async run(a10) {
          let b10 = cu(this.query.params, a10 ?? {});
          return this.logger.logQuery(this.query.sql, b10), await this.queryWithCache(this.query.sql, b10, async () => this.stmt.bind(...b10).run());
        }
        async all(a10) {
          let { fields: b10, query: c10, logger: d10, stmt: e10, customResultMapper: f10 } = this;
          if (!b10 && !f10) {
            let b11 = cu(c10.params, a10 ?? {});
            return d10.logQuery(c10.sql, b11), await this.queryWithCache(c10.sql, b11, async () => e10.bind(...b11).all().then(({ results: a11 }) => this.mapAllResult(a11)));
          }
          let g10 = await this.values(a10);
          return this.mapAllResult(g10);
        }
        mapAllResult(a10, b10) {
          return (b10 && (a10 = gL(a10.results)), this.fields || this.customResultMapper) ? this.customResultMapper ? this.customResultMapper(a10) : a10.map((a11) => cW(this.fields, a11, this.joinsNotNullableMap)) : a10;
        }
        async get(a10) {
          let { fields: b10, joinsNotNullableMap: c10, query: d10, logger: e10, stmt: f10, customResultMapper: g10 } = this;
          if (!b10 && !g10) {
            let b11 = cu(d10.params, a10 ?? {});
            return e10.logQuery(d10.sql, b11), await this.queryWithCache(d10.sql, b11, async () => f10.bind(...b11).all().then(({ results: a11 }) => a11[0]));
          }
          let h10 = await this.values(a10);
          if (h10[0]) return g10 ? g10(h10) : cW(b10, h10[0], c10);
        }
        mapGetResult(a10, b10) {
          return (b10 && (a10 = gL(a10.results)[0]), this.fields || this.customResultMapper) ? this.customResultMapper ? this.customResultMapper([a10]) : cW(this.fields, a10, this.joinsNotNullableMap) : a10;
        }
        async values(a10) {
          let b10 = cu(this.query.params, a10 ?? {});
          return this.logger.logQuery(this.query.sql, b10), await this.queryWithCache(this.query.sql, b10, async () => this.stmt.bind(...b10).raw());
        }
        isResponseInArrayMode() {
          return this._isResponseInArrayMode;
        }
      }
      class gN extends gB {
        static [bK] = "D1Database";
        async batch(a10) {
          return this.session.batch(a10);
        }
      }
      class gO {
        constructor(a10, b10) {
          this.name = a10, this.unique = b10;
        }
        static [bK] = "SQLiteIndexBuilderOn";
        on(...a10) {
          return new gP(this.name, a10, this.unique);
        }
      }
      class gP {
        static [bK] = "SQLiteIndexBuilder";
        config;
        constructor(a10, b10, c10) {
          this.config = { name: a10, columns: b10, unique: c10, where: void 0 };
        }
        where(a10) {
          return this.config.where = a10, this;
        }
        build(a10) {
          return new gQ(this.config, a10);
        }
      }
      class gQ {
        static [bK] = "SQLiteIndex";
        config;
        constructor(a10, b10) {
          this.config = { ...a10, table: b10 };
        }
      }
      function gR(a10) {
        return new gO(a10, true);
      }
      function gS(...a10) {
        return a10[0].columns ? new gT(a10[0].columns, a10[0].name) : new gT(a10);
      }
      class gT {
        static [bK] = "SQLitePrimaryKeyBuilder";
        columns;
        name;
        constructor(a10, b10) {
          this.columns = a10, this.name = b10;
        }
        build(a10) {
          return new gU(a10, this.columns, this.name);
        }
      }
      class gU {
        constructor(a10, b10, c10) {
          this.table = a10, this.columns = b10, this.name = c10;
        }
        static [bK] = "SQLitePrimaryKey";
        columns;
        name;
        getName() {
          return this.name ?? `${this.table[f8.Symbol.Name]}_${this.columns.map((a10) => a10.name).join("_")}_pk`;
        }
      }
      let gV = f9("projects", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), name: f6("name").notNull(), slug: f6("slug").notNull().unique(), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), gW = f9("brands", { id: fT("id").primaryKey({ autoIncrement: true }), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), name: f6("name").notNull(), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }, (a10) => ({ nameUnique: gR("brands_name_project_unique").on(a10.projectId, a10.name) })), gX = f9("categories", { id: fT("id").primaryKey({ autoIncrement: true }), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), name: f6("name").notNull(), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }, (a10) => ({ nameUnique: gR("categories_name_project_unique").on(a10.projectId, a10.name) })), gY = f9("products", { id: fT("id").primaryKey({ autoIncrement: true }), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), name: f6("name").notNull(), imageUrl: f6("image_url"), brandId: fT("brand_id").references(() => gW.id, { onDelete: "set null" }), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), gZ = f9("product_categories", { productId: fT("product_id").notNull().references(() => gY.id, { onDelete: "cascade" }), categoryId: fT("category_id").notNull().references(() => gX.id, { onDelete: "cascade" }) }, (a10) => ({ pk: gS({ columns: [a10.productId, a10.categoryId] }) })), g$ = f9("product_variants", { id: fT("id").primaryKey({ autoIncrement: true }), productId: fT("product_id").notNull().references(() => gY.id, { onDelete: "cascade" }), sku: f6("sku"), color: f6("color"), imageUrl: f6("image_url"), description: f6("description"), isPreorder: fT("is_preorder", { mode: "boolean" }).notNull().default(false), isActive: fT("is_active", { mode: "boolean" }).notNull().default(true), preorderDownPaymentType: f6("preorder_down_payment_type").notNull().default("none"), preorderDownPaymentValue: f1("preorder_down_payment_value"), preorderMessage: f6("preorder_message"), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), g_ = f9("variant_sizes", { id: fT("id").primaryKey({ autoIncrement: true }), variantId: fT("variant_id").notNull().references(() => g$.id, { onDelete: "cascade" }), size: f6("size"), price: f1("price").notNull(), stockQuantity: fT("stock_quantity").notNull().default(0), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), g0 = f9("orders", { id: f6("id").primaryKey(), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), paymentMethod: f6("payment_method").notNull(), proofOfPaymentUrl: f6("proof_of_payment_url"), customerFirstName: f6("customer_first_name").notNull(), customerLastName: f6("customer_last_name").notNull(), customerPhone: f6("customer_phone").notNull(), customerEmail: f6("customer_email").notNull(), instagramHandle: f6("instagram_handle"), deliveryUnit: f6("delivery_unit"), deliveryLot: f6("delivery_lot"), deliveryStreet: f6("delivery_street").notNull(), deliveryCity: f6("delivery_city").notNull(), deliveryRegion: f6("delivery_region").notNull(), deliveryZipCode: f6("delivery_zip_code").notNull(), deliveryCountry: f6("delivery_country").notNull(), fulfillmentMethod: f6("fulfillment_method").notNull().default("delivery"), pickupLocationName: f6("pickup_location_name"), pickupLocationUnit: f6("pickup_location_unit"), pickupLocationLot: f6("pickup_location_lot"), pickupLocationStreet: f6("pickup_location_street"), pickupLocationCity: f6("pickup_location_city"), pickupLocationRegion: f6("pickup_location_region"), pickupLocationZipCode: f6("pickup_location_zip_code"), pickupLocationCountry: f6("pickup_location_country").default("Philippines"), pickupLocationNotes: f6("pickup_location_notes"), pickupScheduledDate: f6("pickup_scheduled_date"), pickupScheduledTime: f6("pickup_scheduled_time"), orderItems: f6("order_items", { mode: "json" }).notNull().default("[]"), subtotal: f1("subtotal").notNull().default(0), vat: f1("vat").notNull().default(0), shippingFee: f1("shipping_fee").notNull().default(0), total: f1("total").notNull().default(0), trackingId: f6("tracking_id"), status: f6("status").notNull().default("For Evaluation"), isRead: fT("is_read", { mode: "boolean" }).notNull().default(false), inventoryAdjusted: fT("inventory_adjusted", { mode: "boolean" }).notNull().default(false), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), g1 = f9("storefront_settings", { projectId: f6("project_id").primaryKey().references(() => gV.id, { onDelete: "cascade" }), homeCollectionMode: f6("home_collection_mode").notNull().default("brand"), homeBannerManualProductIds: f6("home_banner_manual_product_ids", { mode: "json" }).notNull().default("[]"), highlightPopularHero: fT("highlight_popular_hero", { mode: "boolean" }).notNull().default(true), highlightLatestHero: fT("highlight_latest_hero", { mode: "boolean" }).notNull().default(true), navCollectionsEnabled: fT("nav_collections_enabled", { mode: "boolean" }).notNull().default(true), faviconUrl: f6("favicon_url"), themeConfig: f6("theme_config", { mode: "json" }).notNull().default("{}"), shippingDefaultFee: f1("shipping_default_fee").notNull().default(0), shippingRegionOverrides: f6("shipping_region_overrides", { mode: "json" }).notNull().default("{}"), vatEnabled: fT("vat_enabled", { mode: "boolean" }).notNull().default(true), pickupEnabled: fT("pickup_enabled", { mode: "boolean" }).notNull().default(false), pickupLocationName: f6("pickup_location_name"), pickupLocationUnit: f6("pickup_location_unit"), pickupLocationLot: f6("pickup_location_lot"), pickupLocationStreet: f6("pickup_location_street"), pickupLocationCity: f6("pickup_location_city"), pickupLocationRegion: f6("pickup_location_region"), pickupLocationZipCode: f6("pickup_location_zip_code"), pickupLocationCountry: f6("pickup_location_country").default("Philippines"), pickupLocationNotes: f6("pickup_location_notes"), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), g2 = f9("payment_methods", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), provider: f6("provider").notNull(), accountName: f6("account_name"), instructions: f6("instructions"), qrCodeUrl: f6("qr_code_url").notNull(), isActive: fT("is_active", { mode: "boolean" }).notNull().default(true), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }, (a10) => ({ providerUnique: gR("payment_methods_provider_project_unique").on(a10.projectId, a10.provider) })), g3 = f9("users", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), email: f6("email").notNull().unique(), name: f6("name"), hashedPassword: f6("hashed_password"), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), g4 = f9("user_projects", { userId: f6("user_id").notNull().references(() => g3.id, { onDelete: "cascade" }), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), role: f6("role").notNull().default("member") }, (a10) => ({ pk: gS({ columns: [a10.userId, a10.projectId] }) })), g5 = f9("instagram_connections", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), pageId: f6("page_id").notNull().unique(), pageName: f6("page_name"), pageAccessToken: f6("page_access_token").notNull(), instagramBusinessAccountId: f6("instagram_business_account_id").notNull().unique(), instagramUsername: f6("instagram_username"), userAccessToken: f6("user_access_token").notNull(), userAccessTokenExpiresAt: fT("user_access_token_expires_at", { mode: "timestamp" }), scopes: f6("scopes", { mode: "json" }).notNull().default("[]"), status: f6("status").notNull().default("connected"), metadata: f6("metadata", { mode: "json" }).notNull().default("{}"), connectedAt: fT("connected_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), g6 = f9("instagram_oauth_sessions", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), state: f6("state").notNull().unique(), longLivedUserToken: f6("long_lived_user_token").notNull(), longLivedUserTokenExpiresAt: fT("long_lived_user_token_expires_at", { mode: "timestamp" }), pages: f6("pages", { mode: "json" }).notNull(), metadata: f6("metadata", { mode: "json" }).notNull().default("{}"), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), expiresAt: fT("expires_at", { mode: "timestamp" }).notNull(), consumedAt: fT("consumed_at", { mode: "timestamp" }) }), g7 = f9("chatbot_conversations", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), connectionId: f6("connection_id").notNull().references(() => g5.id, { onDelete: "cascade" }), instagramUserId: f6("instagram_user_id").notNull(), instagramUsername: f6("instagram_username"), stage: f6("stage").notNull().default("initial"), context: f6("context", { mode: "json" }).notNull().default("{}"), cart: f6("cart", { mode: "json" }).notNull().default("[]"), lastUserMessage: f6("last_user_message"), lastBotMessage: f6("last_bot_message"), isActive: fT("is_active", { mode: "boolean" }).notNull().default(true), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), g8 = f9("instagram_messages", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), connectionId: f6("connection_id").notNull().references(() => g5.id, { onDelete: "cascade" }), conversationId: f6("conversation_id").notNull(), instagramMessageId: f6("instagram_message_id").notNull(), senderId: f6("sender_id").notNull(), senderName: f6("sender_name"), senderUsername: f6("sender_username"), isFromPage: fT("is_from_page", { mode: "boolean" }).notNull().default(false), messageText: f6("message_text"), attachments: f6("attachments", { mode: "json" }).notNull().default("[]"), sentAt: fT("sent_at", { mode: "timestamp" }).notNull(), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }, (a10) => ({ uniqueMsg: gR("instagram_messages_unique_msg").on(a10.connectionId, a10.instagramMessageId), conversationIdx: new gO("instagram_messages_conversation_idx", false).on(a10.connectionId, a10.conversationId), sentAtIdx: new gO("instagram_messages_sent_at_idx", false).on(a10.sentAt) })), g9 = f9("discount_campaigns", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), name: f6("name").notNull(), description: f6("description"), bannerImageUrl: f6("banner_image_url"), startDate: fT("start_date", { mode: "timestamp" }).notNull(), endDate: fT("end_date", { mode: "timestamp" }).notNull(), isActive: fT("is_active", { mode: "boolean" }).notNull().default(true), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), ha = f9("discount_campaign_variants", { id: fT("id").primaryKey({ autoIncrement: true }), campaignId: f6("campaign_id").notNull().references(() => g9.id, { onDelete: "cascade" }), variantId: fT("variant_id").notNull().references(() => g$.id, { onDelete: "cascade" }), discountPercent: f1("discount_percent").notNull(), createdAt: fT("created_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }, (a10) => ({ uniqueVariant: gR("dc_variant_unique").on(a10.campaignId, a10.variantId) })), hb = f9("project_features", { projectId: f6("project_id").notNull().references(() => gV.id, { onDelete: "cascade" }), featureKey: f6("feature_key").notNull(), isActive: fT("is_active", { mode: "boolean" }).notNull().default(false), expiresAt: fT("expires_at", { mode: "timestamp" }), metadata: f6("metadata", { mode: "json" }).notNull().default("{}"), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }, (a10) => ({ pk: gS({ columns: [a10.projectId, a10.featureKey] }) })), hc = f9("maintenance_overrides", { featureKey: f6("feature_key").primaryKey(), isDisabled: fT("is_disabled", { mode: "boolean" }).notNull().default(false), message: f6("message"), updatedAt: fT("updated_at", { mode: "timestamp" }).default(cs`(strftime('%s', 'now'))`) }), hd = e9(gV, ({ many: a10, one: b10 }) => ({ brands: a10(gW), categories: a10(gX), products: a10(gY), orders: a10(g0), storefrontSettings: b10(g1, { fields: [gV.id], references: [g1.projectId] }), paymentMethods: a10(g2), instagramConnections: a10(g5), instagramMessages: a10(g8), discountCampaigns: a10(g9), projectFeatures: a10(hb) })), he = e9(hb, ({ one: a10 }) => ({ project: a10(gV, { fields: [hb.projectId], references: [gV.id] }) })), hf = e9(gW, ({ one: a10, many: b10 }) => ({ project: a10(gV, { fields: [gW.projectId], references: [gV.id] }), products: b10(gY) })), hg = e9(gX, ({ one: a10, many: b10 }) => ({ project: a10(gV, { fields: [gX.projectId], references: [gV.id] }), productCategories: b10(gZ) })), hh = e9(gY, ({ one: a10, many: b10 }) => ({ project: a10(gV, { fields: [gY.projectId], references: [gV.id] }), brand: a10(gW, { fields: [gY.brandId], references: [gW.id] }), productCategories: b10(gZ), variants: b10(g$) })), hi = e9(gZ, ({ one: a10 }) => ({ product: a10(gY, { fields: [gZ.productId], references: [gY.id] }), category: a10(gX, { fields: [gZ.categoryId], references: [gX.id] }) })), hj = e9(g$, ({ one: a10, many: b10 }) => ({ product: a10(gY, { fields: [g$.productId], references: [gY.id] }), sizes: b10(g_), discountCampaignVariants: b10(ha) })), hk = e9(g_, ({ one: a10 }) => ({ variant: a10(g$, { fields: [g_.variantId], references: [g$.id] }) })), hl = e9(g0, ({ one: a10 }) => ({ project: a10(gV, { fields: [g0.projectId], references: [gV.id] }) })), hm = e9(g1, ({ one: a10 }) => ({ project: a10(gV, { fields: [g1.projectId], references: [gV.id] }) })), hn = e9(g2, ({ one: a10 }) => ({ project: a10(gV, { fields: [g2.projectId], references: [gV.id] }) })), ho = e9(g5, ({ one: a10, many: b10 }) => ({ project: a10(gV, { fields: [g5.projectId], references: [gV.id] }), chatbotConversations: b10(g7), messages: b10(g8) })), hp = e9(g8, ({ one: a10 }) => ({ project: a10(gV, { fields: [g8.projectId], references: [gV.id] }), connection: a10(g5, { fields: [g8.connectionId], references: [g5.id] }) })), hq = e9(g6, ({ one: a10 }) => ({ project: a10(gV, { fields: [g6.projectId], references: [gV.id] }) })), hr = e9(g7, ({ one: a10 }) => ({ project: a10(gV, { fields: [g7.projectId], references: [gV.id] }), connection: a10(g5, { fields: [g7.connectionId], references: [g5.id] }) })), hs = e9(g9, ({ one: a10, many: b10 }) => ({ project: a10(gV, { fields: [g9.projectId], references: [gV.id] }), variants: b10(ha) })), ht = e9(ha, ({ one: a10 }) => ({ campaign: a10(g9, { fields: [ha.campaignId], references: [g9.id] }), variant: a10(g$, { fields: [ha.variantId], references: [g$.id] }) }));
      function hu(a10) {
        return function(a11, b10 = {}) {
          let c10, d10, e10 = new gd({ casing: b10.casing });
          if (true === b10.logger ? c10 = new cU() : false !== b10.logger && (c10 = b10.logger), b10.schema) {
            let a12 = function(a13, b11) {
              1 === Object.keys(a13).length && "default" in a13 && !bL(a13.default, bW) && (a13 = a13.default);
              let c11 = {}, d11 = {}, e11 = {};
              for (let [f11, g11] of Object.entries(a13)) if (bL(g11, bW)) {
                let a14 = bX(g11), b12 = d11[a14];
                for (let d12 of (c11[a14] = f11, e11[f11] = { tsName: f11, dbName: g11[bW.Symbol.Name], schema: g11[bW.Symbol.Schema], columns: g11[bW.Symbol.Columns], relations: b12?.relations ?? {}, primaryKey: b12?.primaryKey ?? [] }, Object.values(g11[bW.Symbol.Columns]))) d12.primary && e11[f11].primaryKey.push(d12);
                let h10 = g11[bW.Symbol.ExtraConfigBuilder]?.(g11[bW.Symbol.ExtraConfigColumns]);
                if (h10) for (let a15 of Object.values(h10)) bL(a15, e_) && e11[f11].primaryKey.push(...a15.columns);
              } else if (bL(g11, e4)) {
                let a14, f12 = bX(g11.table), h10 = c11[f12];
                for (let [c12, i10] of Object.entries(g11.config(b11(g11.table)))) if (h10) {
                  let b12 = e11[h10];
                  b12.relations[c12] = i10, a14 && b12.primaryKey.push(...a14);
                } else f12 in d11 || (d11[f12] = { relations: {}, primaryKey: a14 }), d11[f12].relations[c12] = i10;
              }
              return { tables: e11, tableNamesMap: c11 };
            }(b10.schema, fb);
            d10 = { fullSchema: b10.schema, schema: a12.tables, tableNamesMap: a12.tableNamesMap };
          }
          let f10 = new gJ(a11, e10, d10, { logger: c10, cache: b10.cache }), g10 = new gN("async", e10, f10, d10);
          return g10.$client = a11, g10.$cache = b10.cache, g10.$cache && (g10.$cache.invalidate = b10.cache?.onMutate), g10;
        }(a10, { schema: k });
      }
      async function hv(a10, b10, c10) {
        let d10 = hu(a10), e10 = await d10.query.maintenanceOverrides.findFirst({ where: cB(cy(hc.featureKey, c10), cy(hc.featureKey, "all")) });
        if (e10?.isDisabled) return { isEnabled: false, reason: "maintenance", message: e10.message || `The ${c10} feature is currently down for maintenance.` };
        let f10 = /* @__PURE__ */ new Date(), g10 = await d10.query.projectFeatures.findFirst({ where: cA(cy(hb.projectId, b10), cy(hb.featureKey, c10)) });
        return g10 ? g10.isActive ? g10.expiresAt && g10.expiresAt < f10 ? { isEnabled: false, reason: "expired", message: `Your entitlement for ${c10} has expired.` } : { isEnabled: true } : { isEnabled: false, reason: "not-purchased", message: `The ${c10} feature is disabled for your project.` } : { isEnabled: false, reason: "not-purchased", message: `Your project does not have the ${c10} feature enabled.` };
      }
      var hw = function(a10, b10, c10, d10, e10) {
        if ("m" === d10) throw TypeError("Private method is not writable");
        if ("a" === d10 && !e10) throw TypeError("Private accessor was defined without a setter");
        if ("function" == typeof b10 ? a10 !== b10 || !e10 : !b10.has(a10)) throw TypeError("Cannot write private member to an object whose class did not declare it");
        return "a" === d10 ? e10.call(a10, c10) : e10 ? e10.value = c10 : b10.set(a10, c10), c10;
      }, hx = function(a10, b10, c10, d10) {
        if ("a" === c10 && !d10) throw TypeError("Private accessor was defined without a getter");
        if ("function" == typeof b10 ? a10 !== b10 || !d10 : !b10.has(a10)) throw TypeError("Cannot read private member from an object whose class did not declare it");
        return "m" === c10 ? d10 : "a" === c10 ? d10.call(a10) : d10 ? d10.value : b10.get(a10);
      };
      function hy(a10) {
        let b10 = a10 ? "__Secure-" : "";
        return { sessionToken: { name: `${b10}authjs.session-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10 } }, callbackUrl: { name: `${b10}authjs.callback-url`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10 } }, csrfToken: { name: `${a10 ? "__Host-" : ""}authjs.csrf-token`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10 } }, pkceCodeVerifier: { name: `${b10}authjs.pkce.code_verifier`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10, maxAge: 900 } }, state: { name: `${b10}authjs.state`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10, maxAge: 900 } }, nonce: { name: `${b10}authjs.nonce`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10 } }, webauthnChallenge: { name: `${b10}authjs.challenge`, options: { httpOnly: true, sameSite: "lax", path: "/", secure: a10, maxAge: 900 } } };
      }
      class hz {
        constructor(a10, b10, c10) {
          if (kB.add(this), kC.set(this, {}), kD.set(this, void 0), kE.set(this, void 0), hw(this, kE, c10, "f"), hw(this, kD, a10, "f"), !b10) return;
          let { name: d10 } = a10;
          for (let [a11, c11] of Object.entries(b10)) a11.startsWith(d10) && c11 && (hx(this, kC, "f")[a11] = c11);
        }
        get value() {
          return Object.keys(hx(this, kC, "f")).sort((a10, b10) => parseInt(a10.split(".").pop() || "0") - parseInt(b10.split(".").pop() || "0")).map((a10) => hx(this, kC, "f")[a10]).join("");
        }
        chunk(a10, b10) {
          let c10 = hx(this, kB, "m", kG).call(this);
          for (let d10 of hx(this, kB, "m", kF).call(this, { name: hx(this, kD, "f").name, value: a10, options: { ...hx(this, kD, "f").options, ...b10 } })) c10[d10.name] = d10;
          return Object.values(c10);
        }
        clean() {
          return Object.values(hx(this, kB, "m", kG).call(this));
        }
      }
      kC = /* @__PURE__ */ new WeakMap(), kD = /* @__PURE__ */ new WeakMap(), kE = /* @__PURE__ */ new WeakMap(), kB = /* @__PURE__ */ new WeakSet(), kF = function(a10) {
        let b10 = Math.ceil(a10.value.length / 3936);
        if (1 === b10) return hx(this, kC, "f")[a10.name] = a10.value, [a10];
        let c10 = [];
        for (let d10 = 0; d10 < b10; d10++) {
          let b11 = `${a10.name}.${d10}`, e10 = a10.value.substr(3936 * d10, 3936);
          c10.push({ ...a10, name: b11, value: e10 }), hx(this, kC, "f")[b11] = e10;
        }
        return hx(this, kE, "f").debug("CHUNKING_SESSION_COOKIE", { message: "Session cookie exceeds allowed 4096 bytes.", emptyCookieSize: 160, valueSize: a10.value.length, chunks: c10.map((a11) => a11.value.length + 160) }), c10;
      }, kG = function() {
        let a10 = {};
        for (let b10 in hx(this, kC, "f")) delete hx(this, kC, "f")?.[b10], a10[b10] = { name: b10, value: "", options: { ...hx(this, kD, "f").options, maxAge: 0 } };
        return a10;
      };
      class hA extends Error {
        constructor(a10, b10) {
          a10 instanceof Error ? super(void 0, { cause: { err: a10, ...a10.cause, ...b10 } }) : "string" == typeof a10 ? (b10 instanceof Error && (b10 = { err: b10, ...b10.cause }), super(a10, b10)) : super(void 0, a10), this.name = this.constructor.name, this.type = this.constructor.type ?? "AuthError", this.kind = this.constructor.kind ?? "error", Error.captureStackTrace?.(this, this.constructor);
          let c10 = `https://errors.authjs.dev#${this.type.toLowerCase()}`;
          this.message += `${this.message ? ". " : ""}Read more at ${c10}`;
        }
      }
      class hB extends hA {
      }
      hB.kind = "signIn";
      class hC extends hA {
      }
      hC.type = "AdapterError";
      class hD extends hA {
      }
      hD.type = "AccessDenied";
      class hE extends hA {
      }
      hE.type = "CallbackRouteError";
      class hF extends hA {
      }
      hF.type = "ErrorPageLoop";
      class hG extends hA {
      }
      hG.type = "EventError";
      class hH extends hA {
      }
      hH.type = "InvalidCallbackUrl";
      class hI extends hB {
        constructor() {
          super(...arguments), this.code = "credentials";
        }
      }
      hI.type = "CredentialsSignin";
      class hJ extends hA {
      }
      hJ.type = "InvalidEndpoints";
      class hK extends hA {
      }
      hK.type = "InvalidCheck";
      class hL extends hA {
      }
      hL.type = "JWTSessionError";
      class hM extends hA {
      }
      hM.type = "MissingAdapter";
      class hN extends hA {
      }
      hN.type = "MissingAdapterMethods";
      class hO extends hA {
      }
      hO.type = "MissingAuthorize";
      class hP extends hA {
      }
      hP.type = "MissingSecret";
      class hQ extends hB {
      }
      hQ.type = "OAuthAccountNotLinked";
      class hR extends hB {
      }
      hR.type = "OAuthCallbackError";
      class hS extends hA {
      }
      hS.type = "OAuthProfileParseError";
      class hT extends hA {
      }
      hT.type = "SessionTokenError";
      class hU extends hB {
      }
      hU.type = "OAuthSignInError";
      class hV extends hB {
      }
      hV.type = "EmailSignInError";
      class hW extends hA {
      }
      hW.type = "SignOutError";
      class hX extends hA {
      }
      hX.type = "UnknownAction";
      class hY extends hA {
      }
      hY.type = "UnsupportedStrategy";
      class hZ extends hA {
      }
      hZ.type = "InvalidProvider";
      class h$ extends hA {
      }
      h$.type = "UntrustedHost";
      class h_ extends hA {
      }
      h_.type = "Verification";
      class h0 extends hB {
      }
      h0.type = "MissingCSRF";
      let h1 = /* @__PURE__ */ new Set(["CredentialsSignin", "OAuthAccountNotLinked", "OAuthCallbackError", "AccessDenied", "Verification", "MissingCSRF", "AccountNotLinked", "WebAuthnVerificationError"]);
      class h2 extends hA {
      }
      h2.type = "DuplicateConditionalUI";
      class h3 extends hA {
      }
      h3.type = "MissingWebAuthnAutocomplete";
      class h4 extends hA {
      }
      h4.type = "WebAuthnVerificationError";
      class h5 extends hB {
      }
      h5.type = "AccountNotLinked";
      class h6 extends hA {
      }
      h6.type = "ExperimentalFeatureNotEnabled";
      let h7 = false;
      function h8(a10, b10) {
        try {
          return /^https?:/.test(new URL(a10, a10.startsWith("/") ? b10 : void 0).protocol);
        } catch {
          return false;
        }
      }
      let h9 = false, ia = false, ib = false, ic = ["createVerificationToken", "useVerificationToken", "getUserByEmail"], id = ["createUser", "getUser", "getUserByEmail", "getUserByAccount", "updateUser", "linkAccount", "createSession", "getSessionAndUser", "updateSession", "deleteSession"], ie = ["createUser", "getUser", "linkAccount", "getAccount", "getAuthenticator", "createAuthenticator", "listAuthenticatorsByUserId", "updateAuthenticatorCounter"], ig = async (a10, b10, c10, d10, e10) => {
        let { crypto: { subtle: f10 } } = (() => {
          if ("undefined" != typeof globalThis) return globalThis;
          if ("undefined" != typeof self) return self;
          if ("undefined" != typeof window) return window;
          throw Error("unable to locate global object");
        })();
        return new Uint8Array(await f10.deriveBits({ name: "HKDF", hash: `SHA-${a10.substr(3)}`, salt: c10, info: d10 }, await f10.importKey("raw", b10, "HKDF", false, ["deriveBits"]), e10 << 3));
      };
      function ih(a10, b10) {
        if ("string" == typeof a10) return new TextEncoder().encode(a10);
        if (!(a10 instanceof Uint8Array)) throw TypeError(`"${b10}"" must be an instance of Uint8Array or a string`);
        return a10;
      }
      async function ii(a10, b10, c10, d10, e10) {
        return ig(function(a11) {
          switch (a11) {
            case "sha256":
            case "sha384":
            case "sha512":
            case "sha1":
              return a11;
            default:
              throw TypeError('unsupported "digest" value');
          }
        }(a10), function(a11) {
          let b11 = ih(a11, "ikm");
          if (!b11.byteLength) throw TypeError('"ikm" must be at least one byte in length');
          return b11;
        }(b10), ih(c10, "salt"), function(a11) {
          let b11 = ih(a11, "info");
          if (b11.byteLength > 1024) throw TypeError('"info" must not contain more than 1024 bytes');
          return b11;
        }(d10), function(a11, b11) {
          if ("number" != typeof a11 || !Number.isInteger(a11) || a11 < 1) throw TypeError('"keylen" must be a positive integer');
          if (a11 > 255 * (parseInt(b11.substr(3), 10) >> 3 || 20)) throw TypeError('"keylen" too large');
          return a11;
        }(e10, a10));
      }
      let ij = new TextEncoder(), ik = new TextDecoder();
      function il(...a10) {
        let b10 = new Uint8Array(a10.reduce((a11, { length: b11 }) => a11 + b11, 0)), c10 = 0;
        for (let d10 of a10) b10.set(d10, c10), c10 += d10.length;
        return b10;
      }
      function im(a10, b10, c10) {
        if (b10 < 0 || b10 >= 4294967296) throw RangeError(`value must be >= 0 and <= ${4294967296 - 1}. Received ${b10}`);
        a10.set([b10 >>> 24, b10 >>> 16, b10 >>> 8, 255 & b10], c10);
      }
      function io(a10) {
        let b10 = Math.floor(a10 / 4294967296), c10 = new Uint8Array(8);
        return im(c10, b10, 0), im(c10, a10 % 4294967296, 4), c10;
      }
      function ip(a10) {
        let b10 = new Uint8Array(4);
        return im(b10, a10), b10;
      }
      function iq(a10) {
        let b10 = new Uint8Array(a10.length);
        for (let c10 = 0; c10 < a10.length; c10++) {
          let d10 = a10.charCodeAt(c10);
          if (d10 > 127) throw TypeError("non-ASCII string encountered in encode()");
          b10[c10] = d10;
        }
        return b10;
      }
      function ir(a10) {
        if (Uint8Array.fromBase64) return Uint8Array.fromBase64("string" == typeof a10 ? a10 : ik.decode(a10), { alphabet: "base64url" });
        let b10 = a10;
        b10 instanceof Uint8Array && (b10 = ik.decode(b10)), b10 = b10.replace(/-/g, "+").replace(/_/g, "/");
        try {
          var c10 = b10;
          if (Uint8Array.fromBase64) return Uint8Array.fromBase64(c10);
          let a11 = atob(c10), d10 = new Uint8Array(a11.length);
          for (let b11 = 0; b11 < a11.length; b11++) d10[b11] = a11.charCodeAt(b11);
          return d10;
        } catch {
          throw TypeError("The input to be decoded is not correctly encoded.");
        }
      }
      function is(a10) {
        let b10 = a10;
        return ("string" == typeof b10 && (b10 = ij.encode(b10)), Uint8Array.prototype.toBase64) ? b10.toBase64({ alphabet: "base64url", omitPadding: true }) : function(a11) {
          if (Uint8Array.prototype.toBase64) return a11.toBase64();
          let b11 = [];
          for (let c10 = 0; c10 < a11.length; c10 += 32768) b11.push(String.fromCharCode.apply(null, a11.subarray(c10, c10 + 32768)));
          return btoa(b11.join(""));
        }(b10).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      let it = Symbol();
      function iu(a10, b10) {
        if (a10) throw TypeError(`${b10} can only be called once`);
      }
      function iv(a10, b10, c10) {
        try {
          return ir(a10);
        } catch {
          throw new c10(`Failed to base64url decode the ${b10}`);
        }
      }
      async function iw(a10, b10) {
        let c10 = `SHA-${a10.slice(-3)}`;
        return new Uint8Array(await crypto.subtle.digest(c10, b10));
      }
      class ix extends Error {
        static code = "ERR_JOSE_GENERIC";
        code = "ERR_JOSE_GENERIC";
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class iy extends ix {
        static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        claim;
        reason;
        payload;
        constructor(a10, b10, c10 = "unspecified", d10 = "unspecified") {
          super(a10, { cause: { claim: c10, reason: d10, payload: b10 } }), this.claim = c10, this.reason = d10, this.payload = b10;
        }
      }
      class iz extends ix {
        static code = "ERR_JWT_EXPIRED";
        code = "ERR_JWT_EXPIRED";
        claim;
        reason;
        payload;
        constructor(a10, b10, c10 = "unspecified", d10 = "unspecified") {
          super(a10, { cause: { claim: c10, reason: d10, payload: b10 } }), this.claim = c10, this.reason = d10, this.payload = b10;
        }
      }
      class iA extends ix {
        static code = "ERR_JOSE_ALG_NOT_ALLOWED";
        code = "ERR_JOSE_ALG_NOT_ALLOWED";
      }
      class iB extends ix {
        static code = "ERR_JOSE_NOT_SUPPORTED";
        code = "ERR_JOSE_NOT_SUPPORTED";
      }
      class iC extends ix {
        static code = "ERR_JWE_DECRYPTION_FAILED";
        code = "ERR_JWE_DECRYPTION_FAILED";
        constructor(a10 = "decryption operation failed", b10) {
          super(a10, b10);
        }
      }
      class iD extends ix {
        static code = "ERR_JWE_INVALID";
        code = "ERR_JWE_INVALID";
      }
      class iE extends ix {
        static code = "ERR_JWT_INVALID";
        code = "ERR_JWT_INVALID";
      }
      class iF extends ix {
        static code = "ERR_JWK_INVALID";
        code = "ERR_JWK_INVALID";
      }
      class iG extends ix {
        [Symbol.asyncIterator];
        static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
        code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
        constructor(a10 = "multiple matching keys found in the JSON Web Key Set", b10) {
          super(a10, b10);
        }
      }
      function iH(a10) {
        if (!iI(a10)) throw Error("CryptoKey instance expected");
      }
      let iI = (a10) => {
        if (a10?.[Symbol.toStringTag] === "CryptoKey") return true;
        try {
          return a10 instanceof CryptoKey;
        } catch {
          return false;
        }
      }, iJ = (a10) => a10?.[Symbol.toStringTag] === "KeyObject", iK = (a10) => iI(a10) || iJ(a10);
      function iL(a10) {
        if ("object" != typeof a10 || null === a10 || "[object Object]" !== Object.prototype.toString.call(a10)) return false;
        if (null === Object.getPrototypeOf(a10)) return true;
        let b10 = a10;
        for (; null !== Object.getPrototypeOf(b10); ) b10 = Object.getPrototypeOf(b10);
        return Object.getPrototypeOf(a10) === b10;
      }
      function iM(...a10) {
        let b10, c10 = a10.filter(Boolean);
        if (0 === c10.length || 1 === c10.length) return true;
        for (let a11 of c10) {
          let c11 = Object.keys(a11);
          if (!b10 || 0 === b10.size) {
            b10 = new Set(c11);
            continue;
          }
          for (let a12 of c11) {
            if (b10.has(a12)) return false;
            b10.add(a12);
          }
        }
        return true;
      }
      let iN = (a10) => iL(a10) && "string" == typeof a10.kty;
      function iO(a10, b10, ...c10) {
        if ((c10 = c10.filter(Boolean)).length > 2) {
          let b11 = c10.pop();
          a10 += `one of type ${c10.join(", ")}, or ${b11}.`;
        } else 2 === c10.length ? a10 += `one of type ${c10[0]} or ${c10[1]}.` : a10 += `of type ${c10[0]}.`;
        return null == b10 ? a10 += ` Received ${b10}` : "function" == typeof b10 && b10.name ? a10 += ` Received function ${b10.name}` : "object" == typeof b10 && null != b10 && b10.constructor?.name && (a10 += ` Received an instance of ${b10.constructor.name}`), a10;
      }
      let iP = (a10, ...b10) => iO("Key must be ", a10, ...b10), iQ = (a10, b10, ...c10) => iO(`Key for the ${a10} algorithm must be `, b10, ...c10);
      async function iR(a10) {
        if (iJ(a10)) if ("secret" !== a10.type) return a10.export({ format: "jwk" });
        else a10 = a10.export();
        if (a10 instanceof Uint8Array) return { kty: "oct", k: is(a10) };
        if (!iI(a10)) throw TypeError(iP(a10, "CryptoKey", "KeyObject", "Uint8Array"));
        if (!a10.extractable) throw TypeError("non-extractable CryptoKey cannot be exported as a JWK");
        let { ext: b10, key_ops: c10, alg: d10, use: e10, ...f10 } = await crypto.subtle.exportKey("jwk", a10);
        return "AKP" === f10.kty && (f10.alg = d10), f10;
      }
      async function iS(a10) {
        return iR(a10);
      }
      let iT = (a10, b10) => {
        if ("string" != typeof a10 || !a10) throw new iF(`${b10} missing or invalid`);
      };
      async function iU(a10, b10) {
        let c10, d10;
        if (iN(a10)) c10 = a10;
        else if (iK(a10)) c10 = await iS(a10);
        else throw TypeError(iP(a10, "CryptoKey", "KeyObject", "JSON Web Key"));
        if ("sha256" !== (b10 ??= "sha256") && "sha384" !== b10 && "sha512" !== b10) throw TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
        switch (c10.kty) {
          case "AKP":
            iT(c10.alg, '"alg" (Algorithm) Parameter'), iT(c10.pub, '"pub" (Public key) Parameter'), d10 = { alg: c10.alg, kty: c10.kty, pub: c10.pub };
            break;
          case "EC":
            iT(c10.crv, '"crv" (Curve) Parameter'), iT(c10.x, '"x" (X Coordinate) Parameter'), iT(c10.y, '"y" (Y Coordinate) Parameter'), d10 = { crv: c10.crv, kty: c10.kty, x: c10.x, y: c10.y };
            break;
          case "OKP":
            iT(c10.crv, '"crv" (Subtype of Key Pair) Parameter'), iT(c10.x, '"x" (Public Key) Parameter'), d10 = { crv: c10.crv, kty: c10.kty, x: c10.x };
            break;
          case "RSA":
            iT(c10.e, '"e" (Exponent) Parameter'), iT(c10.n, '"n" (Modulus) Parameter'), d10 = { e: c10.e, kty: c10.kty, n: c10.n };
            break;
          case "oct":
            iT(c10.k, '"k" (Key Value) Parameter'), d10 = { k: c10.k, kty: c10.kty };
            break;
          default:
            throw new iB('"kty" (Key Type) Parameter missing or unsupported');
        }
        let e10 = iq(JSON.stringify(d10));
        return is(await iw(b10, e10));
      }
      let iV = (a10, b10 = "algorithm.name") => TypeError(`CryptoKey does not support this operation, its ${b10} must be ${a10}`);
      function iW(a10, b10, c10) {
        switch (b10) {
          case "A128GCM":
          case "A192GCM":
          case "A256GCM": {
            if ("AES-GCM" !== a10.algorithm.name) throw iV("AES-GCM");
            let c11 = parseInt(b10.slice(1, 4), 10);
            if (a10.algorithm.length !== c11) throw iV(c11, "algorithm.length");
            break;
          }
          case "A128KW":
          case "A192KW":
          case "A256KW": {
            if ("AES-KW" !== a10.algorithm.name) throw iV("AES-KW");
            let c11 = parseInt(b10.slice(1, 4), 10);
            if (a10.algorithm.length !== c11) throw iV(c11, "algorithm.length");
            break;
          }
          case "ECDH":
            switch (a10.algorithm.name) {
              case "ECDH":
              case "X25519":
                break;
              default:
                throw iV("ECDH or X25519");
            }
            break;
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW":
            if ("PBKDF2" !== a10.algorithm.name) throw iV("PBKDF2");
            break;
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            if ("RSA-OAEP" !== a10.algorithm.name) throw iV("RSA-OAEP");
            var d10 = a10.algorithm, e10 = parseInt(b10.slice(9), 10) || 1;
            if (parseInt(d10.hash.name.slice(4), 10) !== e10) throw iV(`SHA-${e10}`, "algorithm.hash");
            break;
          default:
            throw TypeError("CryptoKey does not support this operation");
        }
        if (c10 && !a10.usages.includes(c10)) throw TypeError(`CryptoKey does not support this operation, its usages must include ${c10}.`);
      }
      function iX(a10) {
        switch (a10) {
          case "A128GCM":
            return 128;
          case "A192GCM":
            return 192;
          case "A256GCM":
          case "A128CBC-HS256":
            return 256;
          case "A192CBC-HS384":
            return 384;
          case "A256CBC-HS512":
            return 512;
          default:
            throw new iB(`Unsupported JWE Algorithm: ${a10}`);
        }
      }
      let iY = (a10) => crypto.getRandomValues(new Uint8Array(iX(a10) >> 3));
      function iZ(a10, b10) {
        let c10 = a10.byteLength << 3;
        if (c10 !== b10) throw new iD(`Invalid Content Encryption Key length. Expected ${b10} bits, got ${c10} bits`);
      }
      function i$(a10) {
        switch (a10) {
          case "A128GCM":
          case "A128GCMKW":
          case "A192GCM":
          case "A192GCMKW":
          case "A256GCM":
          case "A256GCMKW":
            return 96;
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return 128;
          default:
            throw new iB(`Unsupported JWE Algorithm: ${a10}`);
        }
      }
      function i_(a10, b10) {
        if (b10.length << 3 !== i$(a10)) throw new iD("Invalid Initialization Vector length");
      }
      async function i0(a10, b10, c10) {
        if (!(b10 instanceof Uint8Array)) throw TypeError(iP(b10, "Uint8Array"));
        let d10 = parseInt(a10.slice(1, 4), 10);
        return { encKey: await crypto.subtle.importKey("raw", b10.subarray(d10 >> 3), "AES-CBC", false, [c10]), macKey: await crypto.subtle.importKey("raw", b10.subarray(0, d10 >> 3), { hash: `SHA-${d10 << 1}`, name: "HMAC" }, false, ["sign"]), keySize: d10 };
      }
      async function i1(a10, b10, c10) {
        return new Uint8Array((await crypto.subtle.sign("HMAC", a10, b10)).slice(0, c10 >> 3));
      }
      async function i2(a10, b10, c10, d10, e10) {
        let { encKey: f10, macKey: g10, keySize: h10 } = await i0(a10, c10, "encrypt"), i10 = new Uint8Array(await crypto.subtle.encrypt({ iv: d10, name: "AES-CBC" }, f10, b10)), j10 = il(e10, d10, i10, io(e10.length << 3));
        return { ciphertext: i10, tag: await i1(g10, j10, h10), iv: d10 };
      }
      async function i3(a10, b10) {
        if (!(a10 instanceof Uint8Array)) throw TypeError("First argument must be a buffer");
        if (!(b10 instanceof Uint8Array)) throw TypeError("Second argument must be a buffer");
        let c10 = { name: "HMAC", hash: "SHA-256" }, d10 = await crypto.subtle.generateKey(c10, false, ["sign"]), e10 = new Uint8Array(await crypto.subtle.sign(c10, d10, a10)), f10 = new Uint8Array(await crypto.subtle.sign(c10, d10, b10)), g10 = 0, h10 = -1;
        for (; ++h10 < 32; ) g10 |= e10[h10] ^ f10[h10];
        return 0 === g10;
      }
      async function i4(a10, b10, c10, d10, e10, f10) {
        let g10, h10, { encKey: i10, macKey: j10, keySize: k10 } = await i0(a10, b10, "decrypt"), l10 = il(f10, d10, c10, io(f10.length << 3)), m10 = await i1(j10, l10, k10);
        try {
          g10 = await i3(e10, m10);
        } catch {
        }
        if (!g10) throw new iC();
        try {
          h10 = new Uint8Array(await crypto.subtle.decrypt({ iv: d10, name: "AES-CBC" }, i10, c10));
        } catch {
        }
        if (!h10) throw new iC();
        return h10;
      }
      async function i5(a10, b10, c10, d10, e10) {
        let f10;
        c10 instanceof Uint8Array ? f10 = await crypto.subtle.importKey("raw", c10, "AES-GCM", false, ["encrypt"]) : (iW(c10, a10, "encrypt"), f10 = c10);
        let g10 = new Uint8Array(await crypto.subtle.encrypt({ additionalData: e10, iv: d10, name: "AES-GCM", tagLength: 128 }, f10, b10)), h10 = g10.slice(-16);
        return { ciphertext: g10.slice(0, -16), tag: h10, iv: d10 };
      }
      async function i6(a10, b10, c10, d10, e10, f10) {
        let g10;
        b10 instanceof Uint8Array ? g10 = await crypto.subtle.importKey("raw", b10, "AES-GCM", false, ["decrypt"]) : (iW(b10, a10, "decrypt"), g10 = b10);
        try {
          return new Uint8Array(await crypto.subtle.decrypt({ additionalData: f10, iv: d10, name: "AES-GCM", tagLength: 128 }, g10, il(c10, e10)));
        } catch {
          throw new iC();
        }
      }
      let i7 = "Unsupported JWE Content Encryption Algorithm";
      async function i8(a10, b10, c10, d10, e10) {
        if (!iI(c10) && !(c10 instanceof Uint8Array)) throw TypeError(iP(c10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        if (d10) i_(a10, d10);
        else d10 = crypto.getRandomValues(new Uint8Array(i$(a10) >> 3));
        switch (a10) {
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return c10 instanceof Uint8Array && iZ(c10, parseInt(a10.slice(-3), 10)), i2(a10, b10, c10, d10, e10);
          case "A128GCM":
          case "A192GCM":
          case "A256GCM":
            return c10 instanceof Uint8Array && iZ(c10, parseInt(a10.slice(1, 4), 10)), i5(a10, b10, c10, d10, e10);
          default:
            throw new iB(i7);
        }
      }
      async function i9(a10, b10, c10, d10, e10, f10) {
        if (!iI(b10) && !(b10 instanceof Uint8Array)) throw TypeError(iP(b10, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
        if (!d10) throw new iD("JWE Initialization Vector missing");
        if (!e10) throw new iD("JWE Authentication Tag missing");
        switch (i_(a10, d10), a10) {
          case "A128CBC-HS256":
          case "A192CBC-HS384":
          case "A256CBC-HS512":
            return b10 instanceof Uint8Array && iZ(b10, parseInt(a10.slice(-3), 10)), i4(a10, b10, c10, d10, e10, f10);
          case "A128GCM":
          case "A192GCM":
          case "A256GCM":
            return b10 instanceof Uint8Array && iZ(b10, parseInt(a10.slice(1, 4), 10)), i6(a10, b10, c10, d10, e10, f10);
          default:
            throw new iB(i7);
        }
      }
      function ja(a10, b10) {
        if (a10.algorithm.length !== parseInt(b10.slice(1, 4), 10)) throw TypeError(`Invalid key size for alg: ${b10}`);
      }
      function jb(a10, b10, c10) {
        return a10 instanceof Uint8Array ? crypto.subtle.importKey("raw", a10, "AES-KW", true, [c10]) : (iW(a10, b10, c10), a10);
      }
      async function jc(a10, b10, c10) {
        let d10 = await jb(b10, a10, "wrapKey");
        ja(d10, a10);
        let e10 = await crypto.subtle.importKey("raw", c10, { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.wrapKey("raw", e10, d10, "AES-KW"));
      }
      async function jd(a10, b10, c10) {
        let d10 = await jb(b10, a10, "unwrapKey");
        ja(d10, a10);
        let e10 = await crypto.subtle.unwrapKey("raw", c10, d10, "AES-KW", { hash: "SHA-256", name: "HMAC" }, true, ["sign"]);
        return new Uint8Array(await crypto.subtle.exportKey("raw", e10));
      }
      function je(a10) {
        return il(ip(a10.length), a10);
      }
      async function jf(a10, b10, c10) {
        let d10 = b10 >> 3, e10 = Math.ceil(d10 / 32), f10 = new Uint8Array(32 * e10);
        for (let b11 = 1; b11 <= e10; b11++) {
          let d11 = new Uint8Array(4 + a10.length + c10.length);
          d11.set(ip(b11), 0), d11.set(a10, 4), d11.set(c10, 4 + a10.length);
          let e11 = await iw("sha256", d11);
          f10.set(e11, (b11 - 1) * 32);
        }
        return f10.slice(0, d10);
      }
      async function jg(a10, b10, c10, d10, e10 = new Uint8Array(), f10 = new Uint8Array()) {
        var g10;
        iW(a10, "ECDH"), iW(b10, "ECDH", "deriveBits");
        let h10 = je(iq(c10)), i10 = je(e10), j10 = je(f10), k10 = il(h10, i10, j10, ip(d10), new Uint8Array());
        return jf(new Uint8Array(await crypto.subtle.deriveBits({ name: a10.algorithm.name, public: a10 }, b10, "X25519" === (g10 = a10).algorithm.name ? 256 : Math.ceil(parseInt(g10.algorithm.namedCurve.slice(-3), 10) / 8) << 3)), d10, k10);
      }
      function jh(a10) {
        switch (a10.algorithm.namedCurve) {
          case "P-256":
          case "P-384":
          case "P-521":
            return true;
          default:
            return "X25519" === a10.algorithm.name;
        }
      }
      async function ji(a10, b10, c10, d10) {
        if (!(a10 instanceof Uint8Array) || a10.length < 8) throw new iD("PBES2 Salt Input must be 8 or more octets");
        let e10 = il(iq(b10), Uint8Array.of(0), a10), f10 = parseInt(b10.slice(13, 16), 10), g10 = { hash: `SHA-${b10.slice(8, 11)}`, iterations: c10, name: "PBKDF2", salt: e10 }, h10 = await (d10 instanceof Uint8Array ? crypto.subtle.importKey("raw", d10, "PBKDF2", false, ["deriveBits"]) : (iW(d10, b10, "deriveBits"), d10));
        return new Uint8Array(await crypto.subtle.deriveBits(g10, h10, f10));
      }
      async function jj(a10, b10, c10, d10 = 2048, e10 = crypto.getRandomValues(new Uint8Array(16))) {
        let f10 = await ji(e10, a10, d10, b10);
        return { encryptedKey: await jc(a10.slice(-6), f10, c10), p2c: d10, p2s: is(e10) };
      }
      async function jk(a10, b10, c10, d10, e10) {
        let f10 = await ji(e10, a10, d10, b10);
        return jd(a10.slice(-6), f10, c10);
      }
      function jl(a10, b10) {
        if (a10.startsWith("RS") || a10.startsWith("PS")) {
          let { modulusLength: c10 } = b10.algorithm;
          if ("number" != typeof c10 || c10 < 2048) throw TypeError(`${a10} requires key modulusLength to be 2048 bits or larger`);
        }
      }
      let jm = (a10) => {
        switch (a10) {
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            return "RSA-OAEP";
          default:
            throw new iB(`alg ${a10} is not supported either by JOSE or your javascript runtime`);
        }
      };
      async function jn(a10, b10, c10) {
        return iW(b10, a10, "encrypt"), jl(a10, b10), new Uint8Array(await crypto.subtle.encrypt(jm(a10), b10, c10));
      }
      async function jo(a10, b10, c10) {
        return iW(b10, a10, "decrypt"), jl(a10, b10), new Uint8Array(await crypto.subtle.decrypt(jm(a10), b10, c10));
      }
      let jp = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
      async function jq(a10) {
        if (!a10.alg) throw TypeError('"alg" argument is required when "jwk.alg" is not present');
        let { algorithm: b10, keyUsages: c10 } = function(a11) {
          let b11, c11;
          switch (a11.kty) {
            case "AKP":
              switch (a11.alg) {
                case "ML-DSA-44":
                case "ML-DSA-65":
                case "ML-DSA-87":
                  b11 = { name: a11.alg }, c11 = a11.priv ? ["sign"] : ["verify"];
                  break;
                default:
                  throw new iB(jp);
              }
              break;
            case "RSA":
              switch (a11.alg) {
                case "PS256":
                case "PS384":
                case "PS512":
                  b11 = { name: "RSA-PSS", hash: `SHA-${a11.alg.slice(-3)}` }, c11 = a11.d ? ["sign"] : ["verify"];
                  break;
                case "RS256":
                case "RS384":
                case "RS512":
                  b11 = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${a11.alg.slice(-3)}` }, c11 = a11.d ? ["sign"] : ["verify"];
                  break;
                case "RSA-OAEP":
                case "RSA-OAEP-256":
                case "RSA-OAEP-384":
                case "RSA-OAEP-512":
                  b11 = { name: "RSA-OAEP", hash: `SHA-${parseInt(a11.alg.slice(-3), 10) || 1}` }, c11 = a11.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
                  break;
                default:
                  throw new iB(jp);
              }
              break;
            case "EC":
              switch (a11.alg) {
                case "ES256":
                case "ES384":
                case "ES512":
                  b11 = { name: "ECDSA", namedCurve: { ES256: "P-256", ES384: "P-384", ES512: "P-521" }[a11.alg] }, c11 = a11.d ? ["sign"] : ["verify"];
                  break;
                case "ECDH-ES":
                case "ECDH-ES+A128KW":
                case "ECDH-ES+A192KW":
                case "ECDH-ES+A256KW":
                  b11 = { name: "ECDH", namedCurve: a11.crv }, c11 = a11.d ? ["deriveBits"] : [];
                  break;
                default:
                  throw new iB(jp);
              }
              break;
            case "OKP":
              switch (a11.alg) {
                case "Ed25519":
                case "EdDSA":
                  b11 = { name: "Ed25519" }, c11 = a11.d ? ["sign"] : ["verify"];
                  break;
                case "ECDH-ES":
                case "ECDH-ES+A128KW":
                case "ECDH-ES+A192KW":
                case "ECDH-ES+A256KW":
                  b11 = { name: a11.crv }, c11 = a11.d ? ["deriveBits"] : [];
                  break;
                default:
                  throw new iB(jp);
              }
              break;
            default:
              throw new iB('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
          }
          return { algorithm: b11, keyUsages: c11 };
        }(a10), d10 = { ...a10 };
        return "AKP" !== d10.kty && delete d10.alg, delete d10.use, crypto.subtle.importKey("jwk", d10, b10, a10.ext ?? (!a10.d && !a10.priv), a10.key_ops ?? c10);
      }
      let jr = "given KeyObject instance cannot be used for this algorithm", js = async (a10, b10, c10, d10 = false) => {
        let e10 = (g ||= /* @__PURE__ */ new WeakMap()).get(a10);
        if (e10?.[c10]) return e10[c10];
        let f10 = await jq({ ...b10, alg: c10 });
        return d10 && Object.freeze(a10), e10 ? e10[c10] = f10 : g.set(a10, { [c10]: f10 }), f10;
      };
      async function jt(a10, b10) {
        if (a10 instanceof Uint8Array || iI(a10)) return a10;
        if (iJ(a10)) {
          if ("secret" === a10.type) return a10.export();
          if ("toCryptoKey" in a10 && "function" == typeof a10.toCryptoKey) try {
            return ((a11, b11) => {
              let c11, d10 = (g ||= /* @__PURE__ */ new WeakMap()).get(a11);
              if (d10?.[b11]) return d10[b11];
              let e10 = "public" === a11.type, f10 = !!e10;
              if ("x25519" === a11.asymmetricKeyType) {
                switch (b11) {
                  case "ECDH-ES":
                  case "ECDH-ES+A128KW":
                  case "ECDH-ES+A192KW":
                  case "ECDH-ES+A256KW":
                    break;
                  default:
                    throw TypeError(jr);
                }
                c11 = a11.toCryptoKey(a11.asymmetricKeyType, f10, e10 ? [] : ["deriveBits"]);
              }
              if ("ed25519" === a11.asymmetricKeyType) {
                if ("EdDSA" !== b11 && "Ed25519" !== b11) throw TypeError(jr);
                c11 = a11.toCryptoKey(a11.asymmetricKeyType, f10, [e10 ? "verify" : "sign"]);
              }
              switch (a11.asymmetricKeyType) {
                case "ml-dsa-44":
                case "ml-dsa-65":
                case "ml-dsa-87":
                  if (b11 !== a11.asymmetricKeyType.toUpperCase()) throw TypeError(jr);
                  c11 = a11.toCryptoKey(a11.asymmetricKeyType, f10, [e10 ? "verify" : "sign"]);
              }
              if ("rsa" === a11.asymmetricKeyType) {
                let d11;
                switch (b11) {
                  case "RSA-OAEP":
                    d11 = "SHA-1";
                    break;
                  case "RS256":
                  case "PS256":
                  case "RSA-OAEP-256":
                    d11 = "SHA-256";
                    break;
                  case "RS384":
                  case "PS384":
                  case "RSA-OAEP-384":
                    d11 = "SHA-384";
                    break;
                  case "RS512":
                  case "PS512":
                  case "RSA-OAEP-512":
                    d11 = "SHA-512";
                    break;
                  default:
                    throw TypeError(jr);
                }
                if (b11.startsWith("RSA-OAEP")) return a11.toCryptoKey({ name: "RSA-OAEP", hash: d11 }, f10, e10 ? ["encrypt"] : ["decrypt"]);
                c11 = a11.toCryptoKey({ name: b11.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5", hash: d11 }, f10, [e10 ? "verify" : "sign"]);
              }
              if ("ec" === a11.asymmetricKeyType) {
                let d11 = (/* @__PURE__ */ new Map([["prime256v1", "P-256"], ["secp384r1", "P-384"], ["secp521r1", "P-521"]])).get(a11.asymmetricKeyDetails?.namedCurve);
                if (!d11) throw TypeError(jr);
                let g10 = { ES256: "P-256", ES384: "P-384", ES512: "P-521" };
                g10[b11] && d11 === g10[b11] && (c11 = a11.toCryptoKey({ name: "ECDSA", namedCurve: d11 }, f10, [e10 ? "verify" : "sign"])), b11.startsWith("ECDH-ES") && (c11 = a11.toCryptoKey({ name: "ECDH", namedCurve: d11 }, f10, e10 ? [] : ["deriveBits"]));
              }
              if (!c11) throw TypeError(jr);
              return d10 ? d10[b11] = c11 : g.set(a11, { [b11]: c11 }), c11;
            })(a10, b10);
          } catch (a11) {
            if (a11 instanceof TypeError) throw a11;
          }
          let c10 = a10.export({ format: "jwk" });
          return js(a10, c10, b10);
        }
        if (iN(a10)) return a10.k ? ir(a10.k) : js(a10, a10, b10, true);
        throw Error("unreachable");
      }
      async function ju(a10, b10, c10) {
        let d10;
        if (!iL(a10)) throw TypeError("JWK must be an object");
        switch (b10 ??= a10.alg, d10 ??= c10?.extractable ?? a10.ext, a10.kty) {
          case "oct":
            if ("string" != typeof a10.k || !a10.k) throw TypeError('missing "k" (Key Value) Parameter value');
            return ir(a10.k);
          case "RSA":
            if ("oth" in a10 && void 0 !== a10.oth) throw new iB('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
            return jq({ ...a10, alg: b10, ext: d10 });
          case "AKP":
            if ("string" != typeof a10.alg || !a10.alg) throw TypeError('missing "alg" (Algorithm) Parameter value');
            if (void 0 !== b10 && b10 !== a10.alg) throw TypeError("JWK alg and alg option value mismatch");
            return jq({ ...a10, ext: d10 });
          case "EC":
          case "OKP":
            return jq({ ...a10, alg: b10, ext: d10 });
          default:
            throw new iB('Unsupported "kty" (Key Type) Parameter value');
        }
      }
      async function jv(a10, b10, c10, d10) {
        let e10 = a10.slice(0, 7), f10 = await i8(e10, c10, b10, d10, new Uint8Array());
        return { encryptedKey: f10.ciphertext, iv: is(f10.iv), tag: is(f10.tag) };
      }
      async function jw(a10, b10, c10, d10, e10) {
        return i9(a10.slice(0, 7), b10, c10, d10, e10, new Uint8Array());
      }
      let jx = 'Invalid or unsupported "alg" (JWE Algorithm) header value';
      function jy(a10) {
        if (void 0 === a10) throw new iD("JWE Encrypted Key missing");
      }
      async function jz(a10, b10, c10, d10, e10) {
        switch (a10) {
          case "dir":
            if (void 0 !== c10) throw new iD("Encountered unexpected JWE Encrypted Key");
            return b10;
          case "ECDH-ES":
            if (void 0 !== c10) throw new iD("Encountered unexpected JWE Encrypted Key");
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW": {
            let e11, f10;
            if (!iL(d10.epk)) throw new iD('JOSE Header "epk" (Ephemeral Public Key) missing or invalid');
            if (iH(b10), !jh(b10)) throw new iB("ECDH with the provided key is not allowed or not supported by your javascript runtime");
            let g10 = await ju(d10.epk, a10);
            if (iH(g10), void 0 !== d10.apu) {
              if ("string" != typeof d10.apu) throw new iD('JOSE Header "apu" (Agreement PartyUInfo) invalid');
              e11 = iv(d10.apu, "apu", iD);
            }
            if (void 0 !== d10.apv) {
              if ("string" != typeof d10.apv) throw new iD('JOSE Header "apv" (Agreement PartyVInfo) invalid');
              f10 = iv(d10.apv, "apv", iD);
            }
            let h10 = await jg(g10, b10, "ECDH-ES" === a10 ? d10.enc : a10, "ECDH-ES" === a10 ? iX(d10.enc) : parseInt(a10.slice(-5, -2), 10), e11, f10);
            if ("ECDH-ES" === a10) return h10;
            return jy(c10), jd(a10.slice(-6), h10, c10);
          }
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            return jy(c10), iH(b10), jo(a10, b10, c10);
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW": {
            let f10;
            if (jy(c10), "number" != typeof d10.p2c) throw new iD('JOSE Header "p2c" (PBES2 Count) missing or invalid');
            let g10 = e10?.maxPBES2Count || 1e4;
            if (d10.p2c > g10) throw new iD('JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds');
            if ("string" != typeof d10.p2s) throw new iD('JOSE Header "p2s" (PBES2 Salt) missing or invalid');
            return f10 = iv(d10.p2s, "p2s", iD), jk(a10, b10, c10, d10.p2c, f10);
          }
          case "A128KW":
          case "A192KW":
          case "A256KW":
            return jy(c10), jd(a10, b10, c10);
          case "A128GCMKW":
          case "A192GCMKW":
          case "A256GCMKW":
            if (jy(c10), "string" != typeof d10.iv) throw new iD('JOSE Header "iv" (Initialization Vector) missing or invalid');
            if ("string" != typeof d10.tag) throw new iD('JOSE Header "tag" (Authentication Tag) missing or invalid');
            return jw(a10, b10, c10, iv(d10.iv, "iv", iD), iv(d10.tag, "tag", iD));
          default:
            throw new iB(jx);
        }
      }
      async function jA(a10, b10, c10, d10, e10 = {}) {
        let f10, g10, h10;
        switch (a10) {
          case "dir":
            h10 = c10;
            break;
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW": {
            let i10;
            if (iH(c10), !jh(c10)) throw new iB("ECDH with the provided key is not allowed or not supported by your javascript runtime");
            let { apu: j10, apv: k10 } = e10;
            i10 = e10.epk ? await jt(e10.epk, a10) : (await crypto.subtle.generateKey(c10.algorithm, true, ["deriveBits"])).privateKey;
            let { x: l10, y: m10, crv: n10, kty: o10 } = await iS(i10), p10 = await jg(c10, i10, "ECDH-ES" === a10 ? b10 : a10, "ECDH-ES" === a10 ? iX(b10) : parseInt(a10.slice(-5, -2), 10), j10, k10);
            if (g10 = { epk: { x: l10, crv: n10, kty: o10 } }, "EC" === o10 && (g10.epk.y = m10), j10 && (g10.apu = is(j10)), k10 && (g10.apv = is(k10)), "ECDH-ES" === a10) {
              h10 = p10;
              break;
            }
            h10 = d10 || iY(b10);
            let q3 = a10.slice(-6);
            f10 = await jc(q3, p10, h10);
            break;
          }
          case "RSA-OAEP":
          case "RSA-OAEP-256":
          case "RSA-OAEP-384":
          case "RSA-OAEP-512":
            h10 = d10 || iY(b10), iH(c10), f10 = await jn(a10, c10, h10);
            break;
          case "PBES2-HS256+A128KW":
          case "PBES2-HS384+A192KW":
          case "PBES2-HS512+A256KW": {
            h10 = d10 || iY(b10);
            let { p2c: i10, p2s: j10 } = e10;
            ({ encryptedKey: f10, ...g10 } = await jj(a10, c10, h10, i10, j10));
            break;
          }
          case "A128KW":
          case "A192KW":
          case "A256KW":
            h10 = d10 || iY(b10), f10 = await jc(a10, c10, h10);
            break;
          case "A128GCMKW":
          case "A192GCMKW":
          case "A256GCMKW": {
            h10 = d10 || iY(b10);
            let { iv: i10 } = e10;
            ({ encryptedKey: f10, ...g10 } = await jv(a10, c10, h10, i10));
            break;
          }
          default:
            throw new iB(jx);
        }
        return { cek: h10, encryptedKey: f10, parameters: g10 };
      }
      function jB(a10, b10, c10, d10, e10) {
        let f10;
        if (void 0 !== e10.crit && d10?.crit === void 0) throw new a10('"crit" (Critical) Header Parameter MUST be integrity protected');
        if (!d10 || void 0 === d10.crit) return /* @__PURE__ */ new Set();
        if (!Array.isArray(d10.crit) || 0 === d10.crit.length || d10.crit.some((a11) => "string" != typeof a11 || 0 === a11.length)) throw new a10('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
        for (let g10 of (f10 = void 0 !== c10 ? new Map([...Object.entries(c10), ...b10.entries()]) : b10, d10.crit)) {
          if (!f10.has(g10)) throw new iB(`Extension Header Parameter "${g10}" is not recognized`);
          if (void 0 === e10[g10]) throw new a10(`Extension Header Parameter "${g10}" is missing`);
          if (f10.get(g10) && void 0 === d10[g10]) throw new a10(`Extension Header Parameter "${g10}" MUST be integrity protected`);
        }
        return new Set(d10.crit);
      }
      let jC = (a10) => a10?.[Symbol.toStringTag], jD = (a10, b10, c10) => {
        if (void 0 !== b10.use) {
          let a11;
          switch (c10) {
            case "sign":
            case "verify":
              a11 = "sig";
              break;
            case "encrypt":
            case "decrypt":
              a11 = "enc";
          }
          if (b10.use !== a11) throw TypeError(`Invalid key for this operation, its "use" must be "${a11}" when present`);
        }
        if (void 0 !== b10.alg && b10.alg !== a10) throw TypeError(`Invalid key for this operation, its "alg" must be "${a10}" when present`);
        if (Array.isArray(b10.key_ops)) {
          let d10;
          switch (true) {
            case ("sign" === c10 || "verify" === c10):
            case "dir" === a10:
            case a10.includes("CBC-HS"):
              d10 = c10;
              break;
            case a10.startsWith("PBES2"):
              d10 = "deriveBits";
              break;
            case /^A\d{3}(?:GCM)?(?:KW)?$/.test(a10):
              d10 = !a10.includes("GCM") && a10.endsWith("KW") ? "encrypt" === c10 ? "wrapKey" : "unwrapKey" : c10;
              break;
            case ("encrypt" === c10 && a10.startsWith("RSA")):
              d10 = "wrapKey";
              break;
            case "decrypt" === c10:
              d10 = a10.startsWith("RSA") ? "unwrapKey" : "deriveBits";
          }
          if (d10 && b10.key_ops?.includes?.(d10) === false) throw TypeError(`Invalid key for this operation, its "key_ops" must include "${d10}" when present`);
        }
        return true;
      };
      function jE(a10, b10, c10) {
        switch (a10.substring(0, 2)) {
          case "A1":
          case "A2":
          case "di":
          case "HS":
          case "PB":
            ((a11, b11, c11) => {
              if (!(b11 instanceof Uint8Array)) {
                if (iN(b11)) {
                  let d10;
                  if ("oct" === (d10 = b11).kty && "string" == typeof d10.k && jD(a11, b11, c11)) return;
                  throw TypeError('JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present');
                }
                if (!iK(b11)) throw TypeError(iQ(a11, b11, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
                if ("secret" !== b11.type) throw TypeError(`${jC(b11)} instances for symmetric algorithms must be of type "secret"`);
              }
            })(a10, b10, c10);
            break;
          default:
            ((a11, b11, c11) => {
              if (iN(b11)) switch (c11) {
                case "decrypt":
                case "sign":
                  let d10;
                  if ("oct" !== (d10 = b11).kty && ("AKP" === d10.kty && "string" == typeof d10.priv || "string" == typeof d10.d) && jD(a11, b11, c11)) return;
                  throw TypeError("JSON Web Key for this operation must be a private JWK");
                case "encrypt":
                case "verify":
                  let e10;
                  if ("oct" !== (e10 = b11).kty && void 0 === e10.d && void 0 === e10.priv && jD(a11, b11, c11)) return;
                  throw TypeError("JSON Web Key for this operation must be a public JWK");
              }
              if (!iK(b11)) throw TypeError(iQ(a11, b11, "CryptoKey", "KeyObject", "JSON Web Key"));
              if ("secret" === b11.type) throw TypeError(`${jC(b11)} instances for asymmetric algorithms must not be of type "secret"`);
              if ("public" === b11.type) switch (c11) {
                case "sign":
                  throw TypeError(`${jC(b11)} instances for asymmetric algorithm signing must be of type "private"`);
                case "decrypt":
                  throw TypeError(`${jC(b11)} instances for asymmetric algorithm decryption must be of type "private"`);
              }
              if ("private" === b11.type) switch (c11) {
                case "verify":
                  throw TypeError(`${jC(b11)} instances for asymmetric algorithm verifying must be of type "public"`);
                case "encrypt":
                  throw TypeError(`${jC(b11)} instances for asymmetric algorithm encryption must be of type "public"`);
              }
            })(a10, b10, c10);
        }
      }
      function jF(a10) {
        if (void 0 === globalThis[a10]) throw new iB(`JWE "zip" (Compression Algorithm) Header Parameter requires the ${a10} API.`);
      }
      async function jG(a10) {
        jF("CompressionStream");
        let b10 = new CompressionStream("deflate-raw"), c10 = b10.writable.getWriter();
        c10.write(a10), c10.close();
        let d10 = [], e10 = b10.readable.getReader();
        for (; ; ) {
          let { value: a11, done: b11 } = await e10.read();
          if (b11) break;
          d10.push(a11);
        }
        return il(...d10);
      }
      async function jH(a10, b10) {
        jF("DecompressionStream");
        let c10 = new DecompressionStream("deflate-raw"), d10 = c10.writable.getWriter();
        d10.write(a10), d10.close();
        let e10 = [], f10 = 0, g10 = c10.readable.getReader();
        for (; ; ) {
          let { value: a11, done: c11 } = await g10.read();
          if (c11) break;
          if (e10.push(a11), f10 += a11.byteLength, b10 !== 1 / 0 && f10 > b10) throw new iD("Decompressed plaintext exceeded the configured limit");
        }
        return il(...e10);
      }
      class jI {
        #a;
        #b;
        #c;
        #d;
        #e;
        #f;
        #g;
        #h;
        constructor(a10) {
          if (!(a10 instanceof Uint8Array)) throw TypeError("plaintext must be an instance of Uint8Array");
          this.#a = a10;
        }
        setKeyManagementParameters(a10) {
          return iu(this.#h, "setKeyManagementParameters"), this.#h = a10, this;
        }
        setProtectedHeader(a10) {
          return iu(this.#b, "setProtectedHeader"), this.#b = a10, this;
        }
        setSharedUnprotectedHeader(a10) {
          return iu(this.#c, "setSharedUnprotectedHeader"), this.#c = a10, this;
        }
        setUnprotectedHeader(a10) {
          return iu(this.#d, "setUnprotectedHeader"), this.#d = a10, this;
        }
        setAdditionalAuthenticatedData(a10) {
          return this.#e = a10, this;
        }
        setContentEncryptionKey(a10) {
          return iu(this.#f, "setContentEncryptionKey"), this.#f = a10, this;
        }
        setInitializationVector(a10) {
          return iu(this.#g, "setInitializationVector"), this.#g = a10, this;
        }
        async encrypt(a10, b10) {
          let c10, d10, e10, f10, g10, h10;
          if (!this.#b && !this.#d && !this.#c) throw new iD("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
          if (!iM(this.#b, this.#d, this.#c)) throw new iD("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
          let i10 = { ...this.#b, ...this.#d, ...this.#c };
          if (jB(iD, /* @__PURE__ */ new Map(), b10?.crit, this.#b, i10), void 0 !== i10.zip && "DEF" !== i10.zip) throw new iB('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
          if (void 0 !== i10.zip && !this.#b?.zip) throw new iD('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
          let { alg: j10, enc: k10 } = i10;
          if ("string" != typeof j10 || !j10) throw new iD('JWE "alg" (Algorithm) Header Parameter missing or invalid');
          if ("string" != typeof k10 || !k10) throw new iD('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
          if (this.#f && ("dir" === j10 || "ECDH-ES" === j10)) throw TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${j10}`);
          jE("dir" === j10 ? k10 : j10, a10, "encrypt");
          {
            let e11, f11 = await jt(a10, j10);
            ({ cek: d10, encryptedKey: c10, parameters: e11 } = await jA(j10, k10, f11, this.#f, this.#h)), e11 && (b10 && it in b10 ? this.#d ? this.#d = { ...this.#d, ...e11 } : this.setUnprotectedHeader(e11) : this.#b ? this.#b = { ...this.#b, ...e11 } : this.setProtectedHeader(e11));
          }
          if (this.#b ? g10 = iq(f10 = is(JSON.stringify(this.#b))) : (f10 = "", g10 = new Uint8Array()), this.#e) {
            let a11 = iq(h10 = is(this.#e));
            e10 = il(g10, iq("."), a11);
          } else e10 = g10;
          let l10 = this.#a;
          "DEF" === i10.zip && (l10 = await jG(l10));
          let { ciphertext: m10, tag: n10, iv: o10 } = await i8(k10, l10, d10, this.#g, e10), p10 = { ciphertext: is(m10) };
          return o10 && (p10.iv = is(o10)), n10 && (p10.tag = is(n10)), c10 && (p10.encrypted_key = is(c10)), h10 && (p10.aad = h10), this.#b && (p10.protected = f10), this.#c && (p10.unprotected = this.#c), this.#d && (p10.header = this.#d), p10;
        }
      }
      class jJ {
        #i;
        constructor(a10) {
          this.#i = new jI(a10);
        }
        setContentEncryptionKey(a10) {
          return this.#i.setContentEncryptionKey(a10), this;
        }
        setInitializationVector(a10) {
          return this.#i.setInitializationVector(a10), this;
        }
        setProtectedHeader(a10) {
          return this.#i.setProtectedHeader(a10), this;
        }
        setKeyManagementParameters(a10) {
          return this.#i.setKeyManagementParameters(a10), this;
        }
        async encrypt(a10, b10) {
          let c10 = await this.#i.encrypt(a10, b10);
          return [c10.protected, c10.encrypted_key, c10.iv, c10.ciphertext, c10.tag].join(".");
        }
      }
      let jK = (a10) => Math.floor(a10.getTime() / 1e3), jL = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
      function jM(a10) {
        let b10, c10 = jL.exec(a10);
        if (!c10 || c10[4] && c10[1]) throw TypeError("Invalid time period format");
        let d10 = parseFloat(c10[2]);
        switch (c10[3].toLowerCase()) {
          case "sec":
          case "secs":
          case "second":
          case "seconds":
          case "s":
            b10 = Math.round(d10);
            break;
          case "minute":
          case "minutes":
          case "min":
          case "mins":
          case "m":
            b10 = Math.round(60 * d10);
            break;
          case "hour":
          case "hours":
          case "hr":
          case "hrs":
          case "h":
            b10 = Math.round(3600 * d10);
            break;
          case "day":
          case "days":
          case "d":
            b10 = Math.round(86400 * d10);
            break;
          case "week":
          case "weeks":
          case "w":
            b10 = Math.round(604800 * d10);
            break;
          default:
            b10 = Math.round(31557600 * d10);
        }
        return "-" === c10[1] || "ago" === c10[4] ? -b10 : b10;
      }
      function jN(a10, b10) {
        if (!Number.isFinite(b10)) throw TypeError(`Invalid ${a10} input`);
        return b10;
      }
      let jO = (a10) => a10.includes("/") ? a10.toLowerCase() : `application/${a10.toLowerCase()}`;
      class jP {
        #j;
        constructor(a10) {
          if (!iL(a10)) throw TypeError("JWT Claims Set MUST be an object");
          this.#j = structuredClone(a10);
        }
        data() {
          return ij.encode(JSON.stringify(this.#j));
        }
        get iss() {
          return this.#j.iss;
        }
        set iss(a10) {
          this.#j.iss = a10;
        }
        get sub() {
          return this.#j.sub;
        }
        set sub(a10) {
          this.#j.sub = a10;
        }
        get aud() {
          return this.#j.aud;
        }
        set aud(a10) {
          this.#j.aud = a10;
        }
        set jti(a10) {
          this.#j.jti = a10;
        }
        set nbf(a10) {
          "number" == typeof a10 ? this.#j.nbf = jN("setNotBefore", a10) : a10 instanceof Date ? this.#j.nbf = jN("setNotBefore", jK(a10)) : this.#j.nbf = jK(/* @__PURE__ */ new Date()) + jM(a10);
        }
        set exp(a10) {
          "number" == typeof a10 ? this.#j.exp = jN("setExpirationTime", a10) : a10 instanceof Date ? this.#j.exp = jN("setExpirationTime", jK(a10)) : this.#j.exp = jK(/* @__PURE__ */ new Date()) + jM(a10);
        }
        set iat(a10) {
          void 0 === a10 ? this.#j.iat = jK(/* @__PURE__ */ new Date()) : a10 instanceof Date ? this.#j.iat = jN("setIssuedAt", jK(a10)) : "string" == typeof a10 ? this.#j.iat = jN("setIssuedAt", jK(/* @__PURE__ */ new Date()) + jM(a10)) : this.#j.iat = jN("setIssuedAt", a10);
        }
      }
      class jQ {
        #f;
        #g;
        #h;
        #b;
        #k;
        #l;
        #m;
        #n;
        constructor(a10 = {}) {
          this.#n = new jP(a10);
        }
        setIssuer(a10) {
          return this.#n.iss = a10, this;
        }
        setSubject(a10) {
          return this.#n.sub = a10, this;
        }
        setAudience(a10) {
          return this.#n.aud = a10, this;
        }
        setJti(a10) {
          return this.#n.jti = a10, this;
        }
        setNotBefore(a10) {
          return this.#n.nbf = a10, this;
        }
        setExpirationTime(a10) {
          return this.#n.exp = a10, this;
        }
        setIssuedAt(a10) {
          return this.#n.iat = a10, this;
        }
        setProtectedHeader(a10) {
          return iu(this.#b, "setProtectedHeader"), this.#b = a10, this;
        }
        setKeyManagementParameters(a10) {
          return iu(this.#h, "setKeyManagementParameters"), this.#h = a10, this;
        }
        setContentEncryptionKey(a10) {
          return iu(this.#f, "setContentEncryptionKey"), this.#f = a10, this;
        }
        setInitializationVector(a10) {
          return iu(this.#g, "setInitializationVector"), this.#g = a10, this;
        }
        replicateIssuerAsHeader() {
          return this.#k = true, this;
        }
        replicateSubjectAsHeader() {
          return this.#l = true, this;
        }
        replicateAudienceAsHeader() {
          return this.#m = true, this;
        }
        async encrypt(a10, b10) {
          let c10 = new jJ(this.#n.data());
          return this.#b && (this.#k || this.#l || this.#m) && (this.#b = { ...this.#b, iss: this.#k ? this.#n.iss : void 0, sub: this.#l ? this.#n.sub : void 0, aud: this.#m ? this.#n.aud : void 0 }), c10.setProtectedHeader(this.#b), this.#g && c10.setInitializationVector(this.#g), this.#f && c10.setContentEncryptionKey(this.#f), this.#h && c10.setKeyManagementParameters(this.#h), c10.encrypt(a10, b10);
        }
      }
      function jR(a10, b10) {
        if (void 0 !== b10 && (!Array.isArray(b10) || b10.some((a11) => "string" != typeof a11))) throw TypeError(`"${a10}" option must be an array of strings`);
        if (b10) return new Set(b10);
      }
      async function jS(a10, b10, c10) {
        let d10, e10, f10, g10, h10, i10;
        if (!iL(a10)) throw new iD("Flattened JWE must be an object");
        if (void 0 === a10.protected && void 0 === a10.header && void 0 === a10.unprotected) throw new iD("JOSE Header missing");
        if (void 0 !== a10.iv && "string" != typeof a10.iv) throw new iD("JWE Initialization Vector incorrect type");
        if ("string" != typeof a10.ciphertext) throw new iD("JWE Ciphertext missing or incorrect type");
        if (void 0 !== a10.tag && "string" != typeof a10.tag) throw new iD("JWE Authentication Tag incorrect type");
        if (void 0 !== a10.protected && "string" != typeof a10.protected) throw new iD("JWE Protected Header incorrect type");
        if (void 0 !== a10.encrypted_key && "string" != typeof a10.encrypted_key) throw new iD("JWE Encrypted Key incorrect type");
        if (void 0 !== a10.aad && "string" != typeof a10.aad) throw new iD("JWE AAD incorrect type");
        if (void 0 !== a10.header && !iL(a10.header)) throw new iD("JWE Shared Unprotected Header incorrect type");
        if (void 0 !== a10.unprotected && !iL(a10.unprotected)) throw new iD("JWE Per-Recipient Unprotected Header incorrect type");
        if (a10.protected) try {
          let b11 = ir(a10.protected);
          d10 = JSON.parse(ik.decode(b11));
        } catch {
          throw new iD("JWE Protected Header is invalid");
        }
        if (!iM(d10, a10.header, a10.unprotected)) throw new iD("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
        let j10 = { ...d10, ...a10.header, ...a10.unprotected };
        if (jB(iD, /* @__PURE__ */ new Map(), c10?.crit, d10, j10), void 0 !== j10.zip && "DEF" !== j10.zip) throw new iB('Unsupported JWE "zip" (Compression Algorithm) Header Parameter value.');
        if (void 0 !== j10.zip && !d10?.zip) throw new iD('JWE "zip" (Compression Algorithm) Header Parameter MUST be in a protected header.');
        let { alg: k10, enc: l10 } = j10;
        if ("string" != typeof k10 || !k10) throw new iD("missing JWE Algorithm (alg) in JWE Header");
        if ("string" != typeof l10 || !l10) throw new iD("missing JWE Encryption Algorithm (enc) in JWE Header");
        let m10 = c10 && jR("keyManagementAlgorithms", c10.keyManagementAlgorithms), n10 = c10 && jR("contentEncryptionAlgorithms", c10.contentEncryptionAlgorithms);
        if (m10 && !m10.has(k10) || !m10 && k10.startsWith("PBES2")) throw new iA('"alg" (Algorithm) Header Parameter value not allowed');
        if (n10 && !n10.has(l10)) throw new iA('"enc" (Encryption Algorithm) Header Parameter value not allowed');
        void 0 !== a10.encrypted_key && (e10 = iv(a10.encrypted_key, "encrypted_key", iD));
        let o10 = false;
        "function" == typeof b10 && (b10 = await b10(d10, a10), o10 = true), jE("dir" === k10 ? l10 : k10, b10, "decrypt");
        let p10 = await jt(b10, k10);
        try {
          f10 = await jz(k10, p10, e10, j10, c10);
        } catch (a11) {
          if (a11 instanceof TypeError || a11 instanceof iD || a11 instanceof iB) throw a11;
          f10 = iY(l10);
        }
        void 0 !== a10.iv && (g10 = iv(a10.iv, "iv", iD)), void 0 !== a10.tag && (h10 = iv(a10.tag, "tag", iD));
        let q3 = void 0 !== a10.protected ? iq(a10.protected) : new Uint8Array();
        i10 = void 0 !== a10.aad ? il(q3, iq("."), iq(a10.aad)) : q3;
        let r2 = iv(a10.ciphertext, "ciphertext", iD), s2 = await i9(l10, f10, r2, g10, h10, i10), t2 = { plaintext: s2 };
        if ("DEF" === j10.zip) {
          let a11 = c10?.maxDecompressedLength ?? 25e4;
          if (0 === a11) throw new iB('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
          if (a11 !== 1 / 0 && (!Number.isSafeInteger(a11) || a11 < 1)) throw TypeError("maxDecompressedLength must be 0, a positive safe integer, or Infinity");
          t2.plaintext = await jH(s2, a11);
        }
        return (void 0 !== a10.protected && (t2.protectedHeader = d10), void 0 !== a10.aad && (t2.additionalAuthenticatedData = iv(a10.aad, "aad", iD)), void 0 !== a10.unprotected && (t2.sharedUnprotectedHeader = a10.unprotected), void 0 !== a10.header && (t2.unprotectedHeader = a10.header), o10) ? { ...t2, key: p10 } : t2;
      }
      async function jT(a10, b10, c10) {
        if (a10 instanceof Uint8Array && (a10 = ik.decode(a10)), "string" != typeof a10) throw new iD("Compact JWE must be a string or Uint8Array");
        let { 0: d10, 1: e10, 2: f10, 3: g10, 4: h10, length: i10 } = a10.split(".");
        if (5 !== i10) throw new iD("Invalid Compact JWE");
        let j10 = await jS({ ciphertext: g10, iv: f10 || void 0, protected: d10, tag: h10 || void 0, encrypted_key: e10 || void 0 }, b10, c10), k10 = { plaintext: j10.plaintext, protectedHeader: j10.protectedHeader };
        return "function" == typeof b10 ? { ...k10, key: j10.key } : k10;
      }
      async function jU(a10, b10, c10) {
        let d10 = await jT(a10, b10, c10), e10 = function(a11, b11, c11 = {}) {
          var d11, e11;
          let f11, g11;
          try {
            f11 = JSON.parse(ik.decode(b11));
          } catch {
          }
          if (!iL(f11)) throw new iE("JWT Claims Set must be a top-level JSON object");
          let { typ: h10 } = c11;
          if (h10 && ("string" != typeof a11.typ || jO(a11.typ) !== jO(h10))) throw new iy('unexpected "typ" JWT header value', f11, "typ", "check_failed");
          let { requiredClaims: i10 = [], issuer: j10, subject: k10, audience: l10, maxTokenAge: m10 } = c11, n10 = [...i10];
          for (let a12 of (void 0 !== m10 && n10.push("iat"), void 0 !== l10 && n10.push("aud"), void 0 !== k10 && n10.push("sub"), void 0 !== j10 && n10.push("iss"), new Set(n10.reverse()))) if (!(a12 in f11)) throw new iy(`missing required "${a12}" claim`, f11, a12, "missing");
          if (j10 && !(Array.isArray(j10) ? j10 : [j10]).includes(f11.iss)) throw new iy('unexpected "iss" claim value', f11, "iss", "check_failed");
          if (k10 && f11.sub !== k10) throw new iy('unexpected "sub" claim value', f11, "sub", "check_failed");
          if (l10 && (d11 = f11.aud, e11 = "string" == typeof l10 ? [l10] : l10, "string" == typeof d11 ? !e11.includes(d11) : !(Array.isArray(d11) && e11.some(Set.prototype.has.bind(new Set(d11)))))) throw new iy('unexpected "aud" claim value', f11, "aud", "check_failed");
          switch (typeof c11.clockTolerance) {
            case "string":
              g11 = jM(c11.clockTolerance);
              break;
            case "number":
              g11 = c11.clockTolerance;
              break;
            case "undefined":
              g11 = 0;
              break;
            default:
              throw TypeError("Invalid clockTolerance option type");
          }
          let { currentDate: o10 } = c11, p10 = jK(o10 || /* @__PURE__ */ new Date());
          if ((void 0 !== f11.iat || m10) && "number" != typeof f11.iat) throw new iy('"iat" claim must be a number', f11, "iat", "invalid");
          if (void 0 !== f11.nbf) {
            if ("number" != typeof f11.nbf) throw new iy('"nbf" claim must be a number', f11, "nbf", "invalid");
            if (f11.nbf > p10 + g11) throw new iy('"nbf" claim timestamp check failed', f11, "nbf", "check_failed");
          }
          if (void 0 !== f11.exp) {
            if ("number" != typeof f11.exp) throw new iy('"exp" claim must be a number', f11, "exp", "invalid");
            if (f11.exp <= p10 - g11) throw new iz('"exp" claim timestamp check failed', f11, "exp", "check_failed");
          }
          if (m10) {
            let a12 = p10 - f11.iat;
            if (a12 - g11 > ("number" == typeof m10 ? m10 : jM(m10))) throw new iz('"iat" claim timestamp check failed (too far in the past)', f11, "iat", "check_failed");
            if (a12 < 0 - g11) throw new iy('"iat" claim timestamp check failed (it should be in the past)', f11, "iat", "check_failed");
          }
          return f11;
        }(d10.protectedHeader, d10.plaintext, c10), { protectedHeader: f10 } = d10;
        if (void 0 !== f10.iss && f10.iss !== e10.iss) throw new iy('replicated "iss" claim header parameter mismatch', e10, "iss", "mismatch");
        if (void 0 !== f10.sub && f10.sub !== e10.sub) throw new iy('replicated "sub" claim header parameter mismatch', e10, "sub", "mismatch");
        if (void 0 !== f10.aud && JSON.stringify(f10.aud) !== JSON.stringify(e10.aud)) throw new iy('replicated "aud" claim header parameter mismatch', e10, "aud", "mismatch");
        let g10 = { payload: e10, protectedHeader: f10 };
        return "function" == typeof b10 ? { ...g10, key: d10.key } : g10;
      }
      let jV = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/, jW = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/, jX = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, jY = /^[\u0020-\u003A\u003D-\u007E]*$/, jZ = Object.prototype.toString, j$ = (() => {
        let a10 = function() {
        };
        return a10.prototype = /* @__PURE__ */ Object.create(null), a10;
      })();
      function j_(a10, b10) {
        let c10 = new j$(), d10 = a10.length;
        if (d10 < 2) return c10;
        let e10 = b10?.decode || j3, f10 = 0;
        do {
          let b11 = a10.indexOf("=", f10);
          if (-1 === b11) break;
          let g10 = a10.indexOf(";", f10), h10 = -1 === g10 ? d10 : g10;
          if (b11 > h10) {
            f10 = a10.lastIndexOf(";", b11 - 1) + 1;
            continue;
          }
          let i10 = j0(a10, f10, b11), j10 = j1(a10, b11, i10), k10 = a10.slice(i10, j10);
          if (void 0 === c10[k10]) {
            let d11 = j0(a10, b11 + 1, h10), f11 = j1(a10, h10, d11), g11 = e10(a10.slice(d11, f11));
            c10[k10] = g11;
          }
          f10 = h10 + 1;
        } while (f10 < d10);
        return c10;
      }
      function j0(a10, b10, c10) {
        do {
          let c11 = a10.charCodeAt(b10);
          if (32 !== c11 && 9 !== c11) return b10;
        } while (++b10 < c10);
        return c10;
      }
      function j1(a10, b10, c10) {
        for (; b10 > c10; ) {
          let c11 = a10.charCodeAt(--b10);
          if (32 !== c11 && 9 !== c11) return b10 + 1;
        }
        return c10;
      }
      function j2(a10, b10, c10) {
        let d10 = c10?.encode || encodeURIComponent;
        if (!jV.test(a10)) throw TypeError(`argument name is invalid: ${a10}`);
        let e10 = d10(b10);
        if (!jW.test(e10)) throw TypeError(`argument val is invalid: ${b10}`);
        let f10 = a10 + "=" + e10;
        if (!c10) return f10;
        if (void 0 !== c10.maxAge) {
          if (!Number.isInteger(c10.maxAge)) throw TypeError(`option maxAge is invalid: ${c10.maxAge}`);
          f10 += "; Max-Age=" + c10.maxAge;
        }
        if (c10.domain) {
          if (!jX.test(c10.domain)) throw TypeError(`option domain is invalid: ${c10.domain}`);
          f10 += "; Domain=" + c10.domain;
        }
        if (c10.path) {
          if (!jY.test(c10.path)) throw TypeError(`option path is invalid: ${c10.path}`);
          f10 += "; Path=" + c10.path;
        }
        if (c10.expires) {
          var g10;
          if (g10 = c10.expires, "[object Date]" !== jZ.call(g10) || !Number.isFinite(c10.expires.valueOf())) throw TypeError(`option expires is invalid: ${c10.expires}`);
          f10 += "; Expires=" + c10.expires.toUTCString();
        }
        if (c10.httpOnly && (f10 += "; HttpOnly"), c10.secure && (f10 += "; Secure"), c10.partitioned && (f10 += "; Partitioned"), c10.priority) switch ("string" == typeof c10.priority ? c10.priority.toLowerCase() : void 0) {
          case "low":
            f10 += "; Priority=Low";
            break;
          case "medium":
            f10 += "; Priority=Medium";
            break;
          case "high":
            f10 += "; Priority=High";
            break;
          default:
            throw TypeError(`option priority is invalid: ${c10.priority}`);
        }
        if (c10.sameSite) switch ("string" == typeof c10.sameSite ? c10.sameSite.toLowerCase() : c10.sameSite) {
          case true:
          case "strict":
            f10 += "; SameSite=Strict";
            break;
          case "lax":
            f10 += "; SameSite=Lax";
            break;
          case "none":
            f10 += "; SameSite=None";
            break;
          default:
            throw TypeError(`option sameSite is invalid: ${c10.sameSite}`);
        }
        return f10;
      }
      function j3(a10) {
        if (-1 === a10.indexOf("%")) return a10;
        try {
          return decodeURIComponent(a10);
        } catch (b10) {
          return a10;
        }
      }
      let { q: j4 } = l, j5 = "A256CBC-HS512";
      async function j6(a10) {
        let { token: b10 = {}, secret: c10, maxAge: d10 = 2592e3, salt: e10 } = a10, f10 = Array.isArray(c10) ? c10 : [c10], g10 = await j8(j5, f10[0], e10), h10 = await iU({ kty: "oct", k: is(g10) }, `sha${g10.byteLength << 3}`);
        return await new jQ(b10).setProtectedHeader({ alg: "dir", enc: j5, kid: h10 }).setIssuedAt().setExpirationTime((Date.now() / 1e3 | 0) + d10).setJti(crypto.randomUUID()).encrypt(g10);
      }
      async function j7(a10) {
        let { token: b10, secret: c10, salt: d10 } = a10, e10 = Array.isArray(c10) ? c10 : [c10];
        if (!b10) return null;
        let { payload: f10 } = await jU(b10, async ({ kid: a11, enc: b11 }) => {
          for (let c11 of e10) {
            let e11 = await j8(b11, c11, d10);
            if (void 0 === a11 || a11 === await iU({ kty: "oct", k: is(e11) }, `sha${e11.byteLength << 3}`)) return e11;
          }
          throw Error("no matching decryption secret");
        }, { clockTolerance: 15, keyManagementAlgorithms: ["dir"], contentEncryptionAlgorithms: [j5, "A256GCM"] });
        return f10;
      }
      async function j8(a10, b10, c10) {
        let d10;
        switch (a10) {
          case "A256CBC-HS512":
            d10 = 64;
            break;
          case "A256GCM":
            d10 = 32;
            break;
          default:
            throw Error("Unsupported JWT Content Encryption Algorithm");
        }
        return await ii("sha256", b10, c10, `Auth.js Generated Encryption Key (${c10})`, d10);
      }
      async function j9({ options: a10, paramValue: b10, cookieValue: c10 }) {
        let { url: d10, callbacks: e10 } = a10, f10 = d10.origin;
        return b10 ? f10 = await e10.redirect({ url: b10, baseUrl: d10.origin }) : c10 && (f10 = await e10.redirect({ url: c10, baseUrl: d10.origin })), { callbackUrl: f10, callbackUrlCookie: f10 !== c10 ? f10 : void 0 };
      }
      let ka = "\x1B[31m", kb = "\x1B[0m", kc = { error(a10) {
        let b10 = a10 instanceof hA ? a10.type : a10.name;
        if (console.error(`${ka}[auth][error]${kb} ${b10}: ${a10.message}`), a10.cause && "object" == typeof a10.cause && "err" in a10.cause && a10.cause.err instanceof Error) {
          let { err: b11, ...c10 } = a10.cause;
          console.error(`${ka}[auth][cause]${kb}:`, b11.stack), c10 && console.error(`${ka}[auth][details]${kb}:`, JSON.stringify(c10, null, 2));
        } else a10.stack && console.error(a10.stack.replace(/.*/, "").substring(1));
      }, warn(a10) {
        console.warn(`\x1B[33m[auth][warn][${a10}]${kb}`, "Read more: https://warnings.authjs.dev");
      }, debug(a10, b10) {
        console.log(`\x1B[90m[auth][debug]:${kb} ${a10}`, JSON.stringify(b10, null, 2));
      } };
      function kd(a10) {
        let b10 = { ...kc };
        return a10.debug || (b10.debug = () => {
        }), a10.logger?.error && (b10.error = a10.logger.error), a10.logger?.warn && (b10.warn = a10.logger.warn), a10.logger?.debug && (b10.debug = a10.logger.debug), a10.logger ?? (a10.logger = b10), b10;
      }
      let ke = ["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error", "webauthn-options"], { q: kf, l: kg } = l;
      async function kh(a10) {
        if (!("body" in a10) || !a10.body || "POST" !== a10.method) return;
        let b10 = a10.headers.get("content-type");
        return b10?.includes("application/json") ? await a10.json() : b10?.includes("application/x-www-form-urlencoded") ? Object.fromEntries(new URLSearchParams(await a10.text())) : void 0;
      }
      async function ki(a10, b10) {
        try {
          if ("GET" !== a10.method && "POST" !== a10.method) throw new hX("Only GET and POST requests are supported");
          b10.basePath ?? (b10.basePath = "/auth");
          let c10 = new URL(a10.url), { action: d10, providerId: e10 } = function(a11, b11) {
            let c11 = a11.match(RegExp(`^${b11}(.+)`));
            if (null === c11) throw new hX(`Cannot parse action at ${a11}`);
            let d11 = c11.at(-1).replace(/^\//, "").split("/").filter(Boolean);
            if (1 !== d11.length && 2 !== d11.length) throw new hX(`Cannot parse action at ${a11}`);
            let [e11, f10] = d11;
            if (!ke.includes(e11) || f10 && !["signin", "callback", "webauthn-options"].includes(e11)) throw new hX(`Cannot parse action at ${a11}`);
            return { action: e11, providerId: "undefined" == f10 ? void 0 : f10 };
          }(c10.pathname, b10.basePath);
          return { url: c10, action: d10, providerId: e10, method: a10.method, headers: Object.fromEntries(a10.headers), body: a10.body ? await kh(a10) : void 0, cookies: kf(a10.headers.get("cookie") ?? "") ?? {}, error: c10.searchParams.get("error") ?? void 0, query: Object.fromEntries(c10.searchParams) };
        } catch (d10) {
          let c10 = kd(b10);
          c10.error(d10), c10.debug("request", a10);
        }
      }
      function kj(a10) {
        let b10 = new Headers(a10.headers);
        a10.cookies?.forEach((a11) => {
          let { name: c11, value: d11, options: e10 } = a11, f10 = kg(c11, d11, e10);
          b10.has("Set-Cookie") ? b10.append("Set-Cookie", f10) : b10.set("Set-Cookie", f10);
        });
        let c10 = a10.body;
        "application/json" === b10.get("content-type") ? c10 = JSON.stringify(a10.body) : "application/x-www-form-urlencoded" === b10.get("content-type") && (c10 = new URLSearchParams(a10.body).toString());
        let d10 = new Response(c10, { headers: b10, status: a10.redirect ? 302 : a10.status ?? 200 });
        return a10.redirect && d10.headers.set("Location", a10.redirect), d10;
      }
      async function kk(a10) {
        let b10 = new TextEncoder().encode(a10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b10))).map((a11) => a11.toString(16).padStart(2, "0")).join("").toString();
      }
      function kl(a10) {
        return Array.from(crypto.getRandomValues(new Uint8Array(a10))).reduce((a11, b10) => a11 + ("0" + b10.toString(16)).slice(-2), "");
      }
      async function km({ options: a10, cookieValue: b10, isPost: c10, bodyValue: d10 }) {
        if (b10) {
          let [e11, f11] = b10.split("|");
          if (f11 === await kk(`${e11}${a10.secret}`)) return { csrfTokenVerified: c10 && e11 === d10, csrfToken: e11 };
        }
        let e10 = kl(32), f10 = await kk(`${e10}${a10.secret}`);
        return { cookie: `${e10}|${f10}`, csrfToken: e10 };
      }
      function kn(a10, b10) {
        if (!b10) throw new h0(`CSRF token was missing during an action ${a10}`);
      }
      function ko(a10) {
        return null !== a10 && "object" == typeof a10;
      }
      function kp(a10, ...b10) {
        if (!b10.length) return a10;
        let c10 = b10.shift();
        if (ko(a10) && ko(c10)) for (let b11 in c10) ko(c10[b11]) ? (ko(a10[b11]) || (a10[b11] = Array.isArray(c10[b11]) ? [] : {}), kp(a10[b11], c10[b11])) : void 0 !== c10[b11] && (a10[b11] = c10[b11]);
        return kp(a10, ...b10);
      }
      let kq = Symbol("skip-csrf-check"), kr = Symbol("return-type-raw"), ks = Symbol("custom-fetch"), kt = Symbol("conform-internal"), ku = (a10) => kw({ id: a10.sub ?? a10.id ?? crypto.randomUUID(), name: a10.name ?? a10.nickname ?? a10.preferred_username, email: a10.email, image: a10.picture }), kv = (a10) => kw({ access_token: a10.access_token, id_token: a10.id_token, refresh_token: a10.refresh_token, expires_at: a10.expires_at, scope: a10.scope, token_type: a10.token_type, session_state: a10.session_state });
      function kw(a10) {
        let b10 = {};
        for (let [c10, d10] of Object.entries(a10)) void 0 !== d10 && (b10[c10] = d10);
        return b10;
      }
      function kx(a10, b10) {
        if (!a10 && b10) return;
        if ("string" == typeof a10) return { url: new URL(a10) };
        let c10 = new URL(a10?.url ?? "https://authjs.dev");
        if (a10?.params != null) for (let [b11, d10] of Object.entries(a10.params)) "claims" === b11 && (d10 = JSON.stringify(d10)), c10.searchParams.set(b11, String(d10));
        return { url: c10, request: a10?.request, conform: a10?.conform, ...a10?.clientPrivateKey ? { clientPrivateKey: a10?.clientPrivateKey } : null };
      }
      let ky = { signIn: () => true, redirect: ({ url: a10, baseUrl: b10 }) => a10.startsWith("/") ? `${b10}${a10}` : new URL(a10).origin === b10 ? a10 : b10, session: ({ session: a10 }) => ({ user: { name: a10.user?.name, email: a10.user?.email, image: a10.user?.image }, expires: a10.expires?.toISOString?.() ?? a10.expires }), jwt: ({ token: a10 }) => a10 };
      async function kz({ authOptions: a10, providerId: b10, action: c10, url: d10, cookies: e10, callbackUrl: f10, csrfToken: g10, csrfDisabled: h10, isPost: i10 }) {
        var j10, k10;
        let l10 = kd(a10), { providers: m10, provider: n10 } = function(a11) {
          let { providerId: b11, config: c11 } = a11, d11 = new URL(c11.basePath ?? "/auth", a11.url.origin), e11 = c11.providers.map((a12) => {
            let b12 = "function" == typeof a12 ? a12() : a12, { options: e12, ...f12 } = b12, g11 = e12?.id ?? f12.id, h11 = kp(f12, e12, { signinUrl: `${d11}/signin/${g11}`, callbackUrl: `${d11}/callback/${g11}` });
            if ("oauth" === b12.type || "oidc" === b12.type) {
              h11.redirectProxyUrl ?? (h11.redirectProxyUrl = e12?.redirectProxyUrl ?? c11.redirectProxyUrl);
              let a13 = function(a14) {
                a14.issuer && (a14.wellKnown ?? (a14.wellKnown = `${a14.issuer}/.well-known/openid-configuration`));
                let b13 = kx(a14.authorization, a14.issuer);
                b13 && !b13.url?.searchParams.has("scope") && b13.url.searchParams.set("scope", "openid profile email");
                let c12 = kx(a14.token, a14.issuer), d12 = kx(a14.userinfo, a14.issuer), e13 = a14.checks ?? ["pkce"];
                return a14.redirectProxyUrl && (e13.includes("state") || e13.push("state"), a14.redirectProxyUrl = `${a14.redirectProxyUrl}/callback/${a14.id}`), { ...a14, authorization: b13, token: c12, checks: e13, userinfo: d12, profile: a14.profile ?? ku, account: a14.account ?? kv };
              }(h11);
              return a13.authorization?.url.searchParams.get("response_mode") === "form_post" && delete a13.redirectProxyUrl, a13[ks] ?? (a13[ks] = e12?.[ks]), a13;
            }
            return h11;
          }), f11 = e11.find(({ id: a12 }) => a12 === b11);
          if (b11 && !f11) {
            let a12 = e11.map((a13) => a13.id).join(", ");
            throw Error(`Provider with id "${b11}" not found. Available providers: [${a12}].`);
          }
          return { providers: e11, provider: f11 };
        }({ url: d10, providerId: b10, config: a10 }), o10 = false;
        if ((n10?.type === "oauth" || n10?.type === "oidc") && n10.redirectProxyUrl) try {
          o10 = new URL(n10.redirectProxyUrl).origin === d10.origin;
        } catch {
          throw TypeError(`redirectProxyUrl must be a valid URL. Received: ${n10.redirectProxyUrl}`);
        }
        let p10 = { debug: false, pages: {}, theme: { colorScheme: "auto", logo: "", brandColor: "", buttonText: "" }, ...a10, url: d10, action: c10, provider: n10, cookies: kp(hy(a10.useSecureCookies ?? "https:" === d10.protocol), a10.cookies), providers: m10, session: { strategy: a10.adapter ? "database" : "jwt", maxAge: 2592e3, updateAge: 86400, generateSessionToken: () => crypto.randomUUID(), ...a10.session }, jwt: { secret: a10.secret, maxAge: a10.session?.maxAge ?? 2592e3, encode: j6, decode: j7, ...a10.jwt }, events: (j10 = a10.events ?? {}, k10 = l10, Object.keys(j10).reduce((a11, b11) => (a11[b11] = async (...a12) => {
          try {
            let c11 = j10[b11];
            return await c11(...a12);
          } catch (a13) {
            k10.error(new hG(a13));
          }
        }, a11), {})), adapter: function(a11, b11) {
          if (a11) return Object.keys(a11).reduce((c11, d11) => (c11[d11] = async (...c12) => {
            try {
              b11.debug(`adapter_${d11}`, { args: c12 });
              let e11 = a11[d11];
              return await e11(...c12);
            } catch (c13) {
              let a12 = new hC(c13);
              throw b11.error(a12), a12;
            }
          }, c11), {});
        }(a10.adapter, l10), callbacks: { ...ky, ...a10.callbacks }, logger: l10, callbackUrl: d10.origin, isOnRedirectProxy: o10, experimental: { ...a10.experimental } }, q3 = [];
        if (h10) p10.csrfTokenVerified = true;
        else {
          let { csrfToken: a11, cookie: b11, csrfTokenVerified: c11 } = await km({ options: p10, cookieValue: e10?.[p10.cookies.csrfToken.name], isPost: i10, bodyValue: g10 });
          p10.csrfToken = a11, p10.csrfTokenVerified = c11, b11 && q3.push({ name: p10.cookies.csrfToken.name, value: b11, options: p10.cookies.csrfToken.options });
        }
        let { callbackUrl: r2, callbackUrlCookie: s2 } = await j9({ options: p10, cookieValue: e10?.[p10.cookies.callbackUrl.name], paramValue: f10 });
        return p10.callbackUrl = r2, s2 && q3.push({ name: p10.cookies.callbackUrl.name, value: s2, options: p10.cookies.callbackUrl.options }), { options: p10, cookies: q3 };
      }
      var kA, kB, kC, kD, kE, kF, kG, kH, kI, kJ, kK, kL, kM, kN, kO, kP, kQ, kR = {}, kS = [], kT = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, kU = Array.isArray;
      function kV(a10, b10) {
        for (var c10 in b10) a10[c10] = b10[c10];
        return a10;
      }
      function kW(a10) {
        a10 && a10.parentNode && a10.parentNode.removeChild(a10);
      }
      function kX(a10, b10, c10, d10, e10) {
        var f10 = { type: a10, props: b10, key: c10, ref: d10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: null == e10 ? ++kJ : e10, __i: -1, __u: 0 };
        return null == e10 && null != kI.vnode && kI.vnode(f10), f10;
      }
      function kY(a10) {
        return a10.children;
      }
      function kZ(a10, b10) {
        this.props = a10, this.context = b10;
      }
      function k$(a10, b10) {
        if (null == b10) return a10.__ ? k$(a10.__, a10.__i + 1) : null;
        for (var c10; b10 < a10.__k.length; b10++) if (null != (c10 = a10.__k[b10]) && null != c10.__e) return c10.__e;
        return "function" == typeof a10.type ? k$(a10) : null;
      }
      function k_(a10) {
        (!a10.__d && (a10.__d = true) && kK.push(a10) && !k0.__r++ || kL !== kI.debounceRendering) && ((kL = kI.debounceRendering) || kM)(k0);
      }
      function k0() {
        var a10, b10, c10, d10, e10, f10, g10, h10;
        for (kK.sort(kN); a10 = kK.shift(); ) a10.__d && (b10 = kK.length, d10 = void 0, f10 = (e10 = (c10 = a10).__v).__e, g10 = [], h10 = [], c10.__P && ((d10 = kV({}, e10)).__v = e10.__v + 1, kI.vnode && kI.vnode(d10), k5(c10.__P, d10, e10, c10.__n, c10.__P.namespaceURI, 32 & e10.__u ? [f10] : null, g10, null == f10 ? k$(e10) : f10, !!(32 & e10.__u), h10), d10.__v = e10.__v, d10.__.__k[d10.__i] = d10, function(a11, b11, c11) {
          b11.__d = void 0;
          for (var d11 = 0; d11 < c11.length; d11++) k6(c11[d11], c11[++d11], c11[++d11]);
          kI.__c && kI.__c(b11, a11), a11.some(function(b12) {
            try {
              a11 = b12.__h, b12.__h = [], a11.some(function(a12) {
                a12.call(b12);
              });
            } catch (a12) {
              kI.__e(a12, b12.__v);
            }
          });
        }(g10, d10, h10), d10.__e != f10 && function a11(b11) {
          var c11, d11;
          if (null != (b11 = b11.__) && null != b11.__c) {
            for (b11.__e = b11.__c.base = null, c11 = 0; c11 < b11.__k.length; c11++) if (null != (d11 = b11.__k[c11]) && null != d11.__e) {
              b11.__e = b11.__c.base = d11.__e;
              break;
            }
            return a11(b11);
          }
        }(d10)), kK.length > b10 && kK.sort(kN));
        k0.__r = 0;
      }
      function k1(a10, b10, c10, d10, e10, f10, g10, h10, i10, j10, k10) {
        var l10, m10, n10, o10, p10, q3 = d10 && d10.__k || kS, r2 = b10.length;
        for (c10.__d = i10, function(a11, b11, c11) {
          var d11, e11, f11, g11, h11, i11 = b11.length, j11 = c11.length, k11 = j11, l11 = 0;
          for (a11.__k = [], d11 = 0; d11 < i11; d11++) null != (e11 = b11[d11]) && "boolean" != typeof e11 && "function" != typeof e11 ? (g11 = d11 + l11, (e11 = a11.__k[d11] = "string" == typeof e11 || "number" == typeof e11 || "bigint" == typeof e11 || e11.constructor == String ? kX(null, e11, null, null, null) : kU(e11) ? kX(kY, { children: e11 }, null, null, null) : void 0 === e11.constructor && e11.__b > 0 ? kX(e11.type, e11.props, e11.key, e11.ref ? e11.ref : null, e11.__v) : e11).__ = a11, e11.__b = a11.__b + 1, f11 = null, -1 !== (h11 = e11.__i = function(a12, b12, c12, d12) {
            var e12 = a12.key, f12 = a12.type, g12 = c12 - 1, h12 = c12 + 1, i12 = b12[c12];
            if (null === i12 || i12 && e12 == i12.key && f12 === i12.type && 0 == (131072 & i12.__u)) return c12;
            if (d12 > +(null != i12 && 0 == (131072 & i12.__u))) for (; g12 >= 0 || h12 < b12.length; ) {
              if (g12 >= 0) {
                if ((i12 = b12[g12]) && 0 == (131072 & i12.__u) && e12 == i12.key && f12 === i12.type) return g12;
                g12--;
              }
              if (h12 < b12.length) {
                if ((i12 = b12[h12]) && 0 == (131072 & i12.__u) && e12 == i12.key && f12 === i12.type) return h12;
                h12++;
              }
            }
            return -1;
          }(e11, c11, g11, k11)) && (k11--, (f11 = c11[h11]) && (f11.__u |= 131072)), null == f11 || null === f11.__v ? (-1 == h11 && l11--, "function" != typeof e11.type && (e11.__u |= 65536)) : h11 !== g11 && (h11 == g11 - 1 ? l11-- : h11 == g11 + 1 ? l11++ : (h11 > g11 ? l11-- : l11++, e11.__u |= 65536))) : e11 = a11.__k[d11] = null;
          if (k11) for (d11 = 0; d11 < j11; d11++) null != (f11 = c11[d11]) && 0 == (131072 & f11.__u) && (f11.__e == a11.__d && (a11.__d = k$(f11)), function a12(b12, c12, d12) {
            var e12, f12;
            if (kI.unmount && kI.unmount(b12), (e12 = b12.ref) && (e12.current && e12.current !== b12.__e || k6(e12, null, c12)), null != (e12 = b12.__c)) {
              if (e12.componentWillUnmount) try {
                e12.componentWillUnmount();
              } catch (a13) {
                kI.__e(a13, c12);
              }
              e12.base = e12.__P = null;
            }
            if (e12 = b12.__k) for (f12 = 0; f12 < e12.length; f12++) e12[f12] && a12(e12[f12], c12, d12 || "function" != typeof b12.type);
            d12 || kW(b12.__e), b12.__c = b12.__ = b12.__e = b12.__d = void 0;
          }(f11, f11));
        }(c10, b10, q3), i10 = c10.__d, l10 = 0; l10 < r2; l10++) null != (n10 = c10.__k[l10]) && (m10 = -1 === n10.__i ? kR : q3[n10.__i] || kR, n10.__i = l10, k5(a10, n10, m10, e10, f10, g10, h10, i10, j10, k10), o10 = n10.__e, n10.ref && m10.ref != n10.ref && (m10.ref && k6(m10.ref, null, n10), k10.push(n10.ref, n10.__c || o10, n10)), null == p10 && null != o10 && (p10 = o10), 65536 & n10.__u || m10.__k === n10.__k ? i10 = function a11(b11, c11, d11) {
          var e11, f11;
          if ("function" == typeof b11.type) {
            for (e11 = b11.__k, f11 = 0; e11 && f11 < e11.length; f11++) e11[f11] && (e11[f11].__ = b11, c11 = a11(e11[f11], c11, d11));
            return c11;
          }
          b11.__e != c11 && (c11 && b11.type && !d11.contains(c11) && (c11 = k$(b11)), d11.insertBefore(b11.__e, c11 || null), c11 = b11.__e);
          do
            c11 = c11 && c11.nextSibling;
          while (null != c11 && 8 === c11.nodeType);
          return c11;
        }(n10, i10, a10) : "function" == typeof n10.type && void 0 !== n10.__d ? i10 = n10.__d : o10 && (i10 = o10.nextSibling), n10.__d = void 0, n10.__u &= -196609);
        c10.__d = i10, c10.__e = p10;
      }
      function k2(a10, b10, c10) {
        "-" === b10[0] ? a10.setProperty(b10, null == c10 ? "" : c10) : a10[b10] = null == c10 ? "" : "number" != typeof c10 || kT.test(b10) ? c10 : c10 + "px";
      }
      function k3(a10, b10, c10, d10, e10) {
        var f10;
        a: if ("style" === b10) if ("string" == typeof c10) a10.style.cssText = c10;
        else {
          if ("string" == typeof d10 && (a10.style.cssText = d10 = ""), d10) for (b10 in d10) c10 && b10 in c10 || k2(a10.style, b10, "");
          if (c10) for (b10 in c10) d10 && c10[b10] === d10[b10] || k2(a10.style, b10, c10[b10]);
        }
        else if ("o" === b10[0] && "n" === b10[1]) f10 = b10 !== (b10 = b10.replace(/(PointerCapture)$|Capture$/i, "$1")), b10 = b10.toLowerCase() in a10 || "onFocusOut" === b10 || "onFocusIn" === b10 ? b10.toLowerCase().slice(2) : b10.slice(2), a10.l || (a10.l = {}), a10.l[b10 + f10] = c10, c10 ? d10 ? c10.u = d10.u : (c10.u = kO, a10.addEventListener(b10, f10 ? kQ : kP, f10)) : a10.removeEventListener(b10, f10 ? kQ : kP, f10);
        else {
          if ("http://www.w3.org/2000/svg" == e10) b10 = b10.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
          else if ("width" != b10 && "height" != b10 && "href" != b10 && "list" != b10 && "form" != b10 && "tabIndex" != b10 && "download" != b10 && "rowSpan" != b10 && "colSpan" != b10 && "role" != b10 && "popover" != b10 && b10 in a10) try {
            a10[b10] = null == c10 ? "" : c10;
            break a;
          } catch (a11) {
          }
          "function" == typeof c10 || (null == c10 || false === c10 && "-" !== b10[4] ? a10.removeAttribute(b10) : a10.setAttribute(b10, "popover" == b10 && 1 == c10 ? "" : c10));
        }
      }
      function k4(a10) {
        return function(b10) {
          if (this.l) {
            var c10 = this.l[b10.type + a10];
            if (null == b10.t) b10.t = kO++;
            else if (b10.t < c10.u) return;
            return c10(kI.event ? kI.event(b10) : b10);
          }
        };
      }
      function k5(a10, b10, c10, d10, e10, f10, g10, h10, i10, j10) {
        var k10, l10, m10, n10, o10, p10, q3, r2, s2, t2, u2, v2, w2, x2, y2, z2, A2 = b10.type;
        if (void 0 !== b10.constructor) return null;
        128 & c10.__u && (i10 = !!(32 & c10.__u), f10 = [h10 = b10.__e = c10.__e]), (k10 = kI.__b) && k10(b10);
        a: if ("function" == typeof A2) try {
          if (r2 = b10.props, s2 = "prototype" in A2 && A2.prototype.render, t2 = (k10 = A2.contextType) && d10[k10.__c], u2 = k10 ? t2 ? t2.props.value : k10.__ : d10, c10.__c ? q3 = (l10 = b10.__c = c10.__c).__ = l10.__E : (s2 ? b10.__c = l10 = new A2(r2, u2) : (b10.__c = l10 = new kZ(r2, u2), l10.constructor = A2, l10.render = k7), t2 && t2.sub(l10), l10.props = r2, l10.state || (l10.state = {}), l10.context = u2, l10.__n = d10, m10 = l10.__d = true, l10.__h = [], l10._sb = []), s2 && null == l10.__s && (l10.__s = l10.state), s2 && null != A2.getDerivedStateFromProps && (l10.__s == l10.state && (l10.__s = kV({}, l10.__s)), kV(l10.__s, A2.getDerivedStateFromProps(r2, l10.__s))), n10 = l10.props, o10 = l10.state, l10.__v = b10, m10) s2 && null == A2.getDerivedStateFromProps && null != l10.componentWillMount && l10.componentWillMount(), s2 && null != l10.componentDidMount && l10.__h.push(l10.componentDidMount);
          else {
            if (s2 && null == A2.getDerivedStateFromProps && r2 !== n10 && null != l10.componentWillReceiveProps && l10.componentWillReceiveProps(r2, u2), !l10.__e && (null != l10.shouldComponentUpdate && false === l10.shouldComponentUpdate(r2, l10.__s, u2) || b10.__v === c10.__v)) {
              for (b10.__v !== c10.__v && (l10.props = r2, l10.state = l10.__s, l10.__d = false), b10.__e = c10.__e, b10.__k = c10.__k, b10.__k.some(function(a11) {
                a11 && (a11.__ = b10);
              }), v2 = 0; v2 < l10._sb.length; v2++) l10.__h.push(l10._sb[v2]);
              l10._sb = [], l10.__h.length && g10.push(l10);
              break a;
            }
            null != l10.componentWillUpdate && l10.componentWillUpdate(r2, l10.__s, u2), s2 && null != l10.componentDidUpdate && l10.__h.push(function() {
              l10.componentDidUpdate(n10, o10, p10);
            });
          }
          if (l10.context = u2, l10.props = r2, l10.__P = a10, l10.__e = false, w2 = kI.__r, x2 = 0, s2) {
            for (l10.state = l10.__s, l10.__d = false, w2 && w2(b10), k10 = l10.render(l10.props, l10.state, l10.context), y2 = 0; y2 < l10._sb.length; y2++) l10.__h.push(l10._sb[y2]);
            l10._sb = [];
          } else do
            l10.__d = false, w2 && w2(b10), k10 = l10.render(l10.props, l10.state, l10.context), l10.state = l10.__s;
          while (l10.__d && ++x2 < 25);
          l10.state = l10.__s, null != l10.getChildContext && (d10 = kV(kV({}, d10), l10.getChildContext())), s2 && !m10 && null != l10.getSnapshotBeforeUpdate && (p10 = l10.getSnapshotBeforeUpdate(n10, o10)), k1(a10, kU(z2 = null != k10 && k10.type === kY && null == k10.key ? k10.props.children : k10) ? z2 : [z2], b10, c10, d10, e10, f10, g10, h10, i10, j10), l10.base = b10.__e, b10.__u &= -161, l10.__h.length && g10.push(l10), q3 && (l10.__E = l10.__ = null);
        } catch (a11) {
          if (b10.__v = null, i10 || null != f10) {
            for (b10.__u |= i10 ? 160 : 128; h10 && 8 === h10.nodeType && h10.nextSibling; ) h10 = h10.nextSibling;
            f10[f10.indexOf(h10)] = null, b10.__e = h10;
          } else b10.__e = c10.__e, b10.__k = c10.__k;
          kI.__e(a11, b10, c10);
        }
        else null == f10 && b10.__v === c10.__v ? (b10.__k = c10.__k, b10.__e = c10.__e) : b10.__e = function(a11, b11, c11, d11, e11, f11, g11, h11, i11) {
          var j11, k11, l11, m11, n11, o11, p11, q4 = c11.props, r3 = b11.props, s3 = b11.type;
          if ("svg" === s3 ? e11 = "http://www.w3.org/2000/svg" : "math" === s3 ? e11 = "http://www.w3.org/1998/Math/MathML" : e11 || (e11 = "http://www.w3.org/1999/xhtml"), null != f11) {
            for (j11 = 0; j11 < f11.length; j11++) if ((n11 = f11[j11]) && "setAttribute" in n11 == !!s3 && (s3 ? n11.localName === s3 : 3 === n11.nodeType)) {
              a11 = n11, f11[j11] = null;
              break;
            }
          }
          if (null == a11) {
            if (null === s3) return document.createTextNode(r3);
            a11 = document.createElementNS(e11, s3, r3.is && r3), h11 && (kI.__m && kI.__m(b11, f11), h11 = false), f11 = null;
          }
          if (null === s3) q4 === r3 || h11 && a11.data === r3 || (a11.data = r3);
          else {
            if (f11 = f11 && kH.call(a11.childNodes), q4 = c11.props || kR, !h11 && null != f11) for (q4 = {}, j11 = 0; j11 < a11.attributes.length; j11++) q4[(n11 = a11.attributes[j11]).name] = n11.value;
            for (j11 in q4) if (n11 = q4[j11], "children" == j11) ;
            else if ("dangerouslySetInnerHTML" == j11) l11 = n11;
            else if (!(j11 in r3)) {
              if ("value" == j11 && "defaultValue" in r3 || "checked" == j11 && "defaultChecked" in r3) continue;
              k3(a11, j11, null, n11, e11);
            }
            for (j11 in r3) n11 = r3[j11], "children" == j11 ? m11 = n11 : "dangerouslySetInnerHTML" == j11 ? k11 = n11 : "value" == j11 ? o11 = n11 : "checked" == j11 ? p11 = n11 : h11 && "function" != typeof n11 || q4[j11] === n11 || k3(a11, j11, n11, q4[j11], e11);
            if (k11) h11 || l11 && (k11.__html === l11.__html || k11.__html === a11.innerHTML) || (a11.innerHTML = k11.__html), b11.__k = [];
            else if (l11 && (a11.innerHTML = ""), k1(a11, kU(m11) ? m11 : [m11], b11, c11, d11, "foreignObject" === s3 ? "http://www.w3.org/1999/xhtml" : e11, f11, g11, f11 ? f11[0] : c11.__k && k$(c11, 0), h11, i11), null != f11) for (j11 = f11.length; j11--; ) kW(f11[j11]);
            h11 || (j11 = "value", "progress" === s3 && null == o11 ? a11.removeAttribute("value") : void 0 === o11 || o11 === a11[j11] && ("progress" !== s3 || o11) && ("option" !== s3 || o11 === q4[j11]) || k3(a11, j11, o11, q4[j11], e11), j11 = "checked", void 0 !== p11 && p11 !== a11[j11] && k3(a11, j11, p11, q4[j11], e11));
          }
          return a11;
        }(c10.__e, b10, c10, d10, e10, f10, g10, i10, j10);
        (k10 = kI.diffed) && k10(b10);
      }
      function k6(a10, b10, c10) {
        try {
          if ("function" == typeof a10) {
            var d10 = "function" == typeof a10.__u;
            d10 && a10.__u(), d10 && null == b10 || (a10.__u = a10(b10));
          } else a10.current = b10;
        } catch (a11) {
          kI.__e(a11, c10);
        }
      }
      function k7(a10, b10, c10) {
        return this.constructor(a10, c10);
      }
      kH = kS.slice, kI = { __e: function(a10, b10, c10, d10) {
        for (var e10, f10, g10; b10 = b10.__; ) if ((e10 = b10.__c) && !e10.__) try {
          if ((f10 = e10.constructor) && null != f10.getDerivedStateFromError && (e10.setState(f10.getDerivedStateFromError(a10)), g10 = e10.__d), null != e10.componentDidCatch && (e10.componentDidCatch(a10, d10 || {}), g10 = e10.__d), g10) return e10.__E = e10;
        } catch (b11) {
          a10 = b11;
        }
        throw a10;
      } }, kJ = 0, kZ.prototype.setState = function(a10, b10) {
        var c10;
        c10 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = kV({}, this.state), "function" == typeof a10 && (a10 = a10(kV({}, c10), this.props)), a10 && kV(c10, a10), null != a10 && this.__v && (b10 && this._sb.push(b10), k_(this));
      }, kZ.prototype.forceUpdate = function(a10) {
        this.__v && (this.__e = true, a10 && this.__h.push(a10), k_(this));
      }, kZ.prototype.render = kY, kK = [], kM = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, kN = function(a10, b10) {
        return a10.__v.__b - b10.__v.__b;
      }, k0.__r = 0, kO = 0, kP = k4(false), kQ = k4(true);
      var k8 = /[\s\n\\/='"\0<>]/, k9 = /^(xlink|xmlns|xml)([A-Z])/, la = /^accessK|^auto[A-Z]|^cell|^ch|^col|cont|cross|dateT|encT|form[A-Z]|frame|hrefL|inputM|maxL|minL|noV|playsI|popoverT|readO|rowS|src[A-Z]|tabI|useM|item[A-Z]/, lb = /^ac|^ali|arabic|basel|cap|clipPath$|clipRule$|color|dominant|enable|fill|flood|font|glyph[^R]|horiz|image|letter|lighting|marker[^WUH]|overline|panose|pointe|paint|rendering|shape|stop|strikethrough|stroke|text[^L]|transform|underline|unicode|units|^v[^i]|^w|^xH/, lc = /* @__PURE__ */ new Set(["draggable", "spellcheck"]), ld = /["&<]/;
      function le(a10) {
        if (0 === a10.length || false === ld.test(a10)) return a10;
        for (var b10 = 0, c10 = 0, d10 = "", e10 = ""; c10 < a10.length; c10++) {
          switch (a10.charCodeAt(c10)) {
            case 34:
              e10 = "&quot;";
              break;
            case 38:
              e10 = "&amp;";
              break;
            case 60:
              e10 = "&lt;";
              break;
            default:
              continue;
          }
          c10 !== b10 && (d10 += a10.slice(b10, c10)), d10 += e10, b10 = c10 + 1;
        }
        return c10 !== b10 && (d10 += a10.slice(b10, c10)), d10;
      }
      var lf = {}, lg = /* @__PURE__ */ new Set(["animation-iteration-count", "border-image-outset", "border-image-slice", "border-image-width", "box-flex", "box-flex-group", "box-ordinal-group", "column-count", "fill-opacity", "flex", "flex-grow", "flex-negative", "flex-order", "flex-positive", "flex-shrink", "flood-opacity", "font-weight", "grid-column", "grid-row", "line-clamp", "line-height", "opacity", "order", "orphans", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-miterlimit", "stroke-opacity", "stroke-width", "tab-size", "widows", "z-index", "zoom"]), lh = /[A-Z]/g;
      function li() {
        this.__d = true;
      }
      var lj, lk, ll, lm, ln = {}, lo = [], lp = Array.isArray, lq = Object.assign;
      function lr(a10, b10) {
        var c10, d10 = a10.type, e10 = true;
        return a10.__c ? (e10 = false, (c10 = a10.__c).state = c10.__s) : c10 = new d10(a10.props, b10), a10.__c = c10, c10.__v = a10, c10.props = a10.props, c10.context = b10, c10.__d = true, null == c10.state && (c10.state = ln), null == c10.__s && (c10.__s = c10.state), d10.getDerivedStateFromProps ? c10.state = lq({}, c10.state, d10.getDerivedStateFromProps(c10.props, c10.state)) : e10 && c10.componentWillMount ? (c10.componentWillMount(), c10.state = c10.__s !== c10.state ? c10.__s : c10.state) : !e10 && c10.componentWillUpdate && c10.componentWillUpdate(), ll && ll(a10), c10.render(c10.props, c10.state, b10);
      }
      var ls = /* @__PURE__ */ new Set(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]), lt = 0;
      function lu(a10, b10, c10, d10, e10, f10) {
        b10 || (b10 = {});
        var g10, h10, i10 = b10;
        "ref" in b10 && (g10 = b10.ref, delete b10.ref);
        var j10 = { type: a10, props: i10, key: c10, ref: g10, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --lt, __i: -1, __u: 0, __source: e10, __self: f10 };
        if ("function" == typeof a10 && (g10 = a10.defaultProps)) for (h10 in g10) void 0 === i10[h10] && (i10[h10] = g10[h10]);
        return kI.vnode && kI.vnode(j10), j10;
      }
      async function lv(a10, b10) {
        let c10 = window.SimpleWebAuthnBrowser;
        async function d10(c11) {
          let d11 = new URL(`${a10}/webauthn-options/${b10}`);
          c11 && d11.searchParams.append("action", c11), f10().forEach((a11) => {
            d11.searchParams.append(a11.name, a11.value);
          });
          let e11 = await fetch(d11);
          return e11.ok ? e11.json() : void console.error("Failed to fetch options", e11);
        }
        function e10() {
          let a11 = `#${b10}-form`, c11 = document.querySelector(a11);
          if (!c11) throw Error(`Form '${a11}' not found`);
          return c11;
        }
        function f10() {
          return Array.from(e10().querySelectorAll("input[data-form-field]"));
        }
        async function g10(a11, b11) {
          let c11 = e10();
          if (a11) {
            let b12 = document.createElement("input");
            b12.type = "hidden", b12.name = "action", b12.value = a11, c11.appendChild(b12);
          }
          if (b11) {
            let a12 = document.createElement("input");
            a12.type = "hidden", a12.name = "data", a12.value = JSON.stringify(b11), c11.appendChild(a12);
          }
          return c11.submit();
        }
        async function h10(a11, b11) {
          let d11 = await c10.startAuthentication(a11, b11);
          return await g10("authenticate", d11);
        }
        async function i10(a11) {
          f10().forEach((a12) => {
            if (a12.required && !a12.value) throw Error(`Missing required field: ${a12.name}`);
          });
          let b11 = await c10.startRegistration(a11);
          return await g10("register", b11);
        }
        async function j10() {
          if (!c10.browserSupportsWebAuthnAutofill()) return;
          let a11 = await d10("authenticate");
          if (!a11) return void console.error("Failed to fetch option for autofill authentication");
          try {
            await h10(a11.options, true);
          } catch (a12) {
            console.error(a12);
          }
        }
        (async function() {
          let a11 = e10();
          if (!c10.browserSupportsWebAuthn()) {
            a11.style.display = "none";
            return;
          }
          a11 && a11.addEventListener("submit", async (a12) => {
            a12.preventDefault();
            let b11 = await d10(void 0);
            if (!b11) return void console.error("Failed to fetch options for form submission");
            if ("authenticate" === b11.action) try {
              await h10(b11.options, false);
            } catch (a13) {
              console.error(a13);
            }
            else if ("register" === b11.action) try {
              await i10(b11.options);
            } catch (a13) {
              console.error(a13);
            }
          });
        })(), j10();
      }
      let lw = { default: "Unable to sign in.", Signin: "Try signing in with a different account.", OAuthSignin: "Try signing in with a different account.", OAuthCallbackError: "Try signing in with a different account.", OAuthCreateAccount: "Try signing in with a different account.", EmailCreateAccount: "Try signing in with a different account.", Callback: "Try signing in with a different account.", OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.", EmailSignin: "The e-mail could not be sent.", CredentialsSignin: "Sign in failed. Check the details you provided are correct.", SessionRequired: "Please sign in to access this page." }, lx = `:root {
  --border-width: 1px;
  --border-radius: 0.5rem;
  --color-error: #c94b4b;
  --color-info: #157efb;
  --color-info-hover: #0f6ddb;
  --color-info-text: #fff;
}

.__next-auth-theme-auto,
.__next-auth-theme-light {
  --color-background: #ececec;
  --color-background-hover: rgba(236, 236, 236, 0.8);
  --color-background-card: #fff;
  --color-text: #000;
  --color-primary: #444;
  --color-control-border: #bbb;
  --color-button-active-background: #f9f9f9;
  --color-button-active-border: #aaa;
  --color-separator: #ccc;
  --provider-bg: #fff;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #fff
  );
}

.__next-auth-theme-dark {
  --color-background: #161b22;
  --color-background-hover: rgba(22, 27, 34, 0.8);
  --color-background-card: #0d1117;
  --color-text: #fff;
  --color-primary: #ccc;
  --color-control-border: #555;
  --color-button-active-background: #060606;
  --color-button-active-border: #666;
  --color-separator: #444;
  --provider-bg: #161b22;
  --provider-bg-hover: color-mix(
    in srgb,
    var(--provider-brand-color) 30%,
    #000
  );
}

.__next-auth-theme-dark img[src$="42-school.svg"],
  .__next-auth-theme-dark img[src$="apple.svg"],
  .__next-auth-theme-dark img[src$="boxyhq-saml.svg"],
  .__next-auth-theme-dark img[src$="eveonline.svg"],
  .__next-auth-theme-dark img[src$="github.svg"],
  .__next-auth-theme-dark img[src$="mailchimp.svg"],
  .__next-auth-theme-dark img[src$="medium.svg"],
  .__next-auth-theme-dark img[src$="okta.svg"],
  .__next-auth-theme-dark img[src$="patreon.svg"],
  .__next-auth-theme-dark img[src$="ping-id.svg"],
  .__next-auth-theme-dark img[src$="roblox.svg"],
  .__next-auth-theme-dark img[src$="threads.svg"],
  .__next-auth-theme-dark img[src$="wikimedia.svg"] {
    filter: invert(1);
  }

.__next-auth-theme-dark #submitButton {
    background-color: var(--provider-bg, var(--color-info));
  }

@media (prefers-color-scheme: dark) {
  .__next-auth-theme-auto {
    --color-background: #161b22;
    --color-background-hover: rgba(22, 27, 34, 0.8);
    --color-background-card: #0d1117;
    --color-text: #fff;
    --color-primary: #ccc;
    --color-control-border: #555;
    --color-button-active-background: #060606;
    --color-button-active-border: #666;
    --color-separator: #444;
    --provider-bg: #161b22;
    --provider-bg-hover: color-mix(
      in srgb,
      var(--provider-brand-color) 30%,
      #000
    );
  }
    .__next-auth-theme-auto img[src$="42-school.svg"],
    .__next-auth-theme-auto img[src$="apple.svg"],
    .__next-auth-theme-auto img[src$="boxyhq-saml.svg"],
    .__next-auth-theme-auto img[src$="eveonline.svg"],
    .__next-auth-theme-auto img[src$="github.svg"],
    .__next-auth-theme-auto img[src$="mailchimp.svg"],
    .__next-auth-theme-auto img[src$="medium.svg"],
    .__next-auth-theme-auto img[src$="okta.svg"],
    .__next-auth-theme-auto img[src$="patreon.svg"],
    .__next-auth-theme-auto img[src$="ping-id.svg"],
    .__next-auth-theme-auto img[src$="roblox.svg"],
    .__next-auth-theme-auto img[src$="threads.svg"],
    .__next-auth-theme-auto img[src$="wikimedia.svg"] {
      filter: invert(1);
    }
    .__next-auth-theme-auto #submitButton {
      background-color: var(--provider-bg, var(--color-info));
    }
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif,
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji";
}

h1 {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  font-weight: 400;
  color: var(--color-text);
}

p {
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  color: var(--color-text);
}

form {
  margin: 0;
  padding: 0;
}

label {
  font-weight: 500;
  text-align: left;
  margin-bottom: 0.25rem;
  display: block;
  color: var(--color-text);
}

input[type] {
  box-sizing: border-box;
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: var(--border-width) solid var(--color-control-border);
  background: var(--color-background-card);
  font-size: 1rem;
  border-radius: var(--border-radius);
  color: var(--color-text);
}

p {
  font-size: 1.1rem;
  line-height: 2rem;
}

a.button {
  text-decoration: none;
  line-height: 1rem;
}

a.button:link,
  a.button:visited {
    background-color: var(--color-background);
    color: var(--color-primary);
  }

button,
a.button {
  padding: 0.75rem 1rem;
  color: var(--provider-color, var(--color-primary));
  background-color: var(--provider-bg, var(--color-background));
  border: 1px solid #00000031;
  font-size: 0.9rem;
  height: 50px;
  border-radius: var(--border-radius);
  transition: background-color 250ms ease-in-out;
  font-weight: 300;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:is(button,a.button):hover {
    background-color: var(--provider-bg-hover, var(--color-background-hover));
    cursor: pointer;
  }

:is(button,a.button):active {
    cursor: pointer;
  }

:is(button,a.button) span {
    color: var(--provider-bg);
  }

#submitButton {
  color: var(--button-text-color, var(--color-info-text));
  background-color: var(--brand-color, var(--color-info));
  width: 100%;
}

#submitButton:hover {
    background-color: var(
      --button-hover-bg,
      var(--color-info-hover)
    ) !important;
  }

a.site {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 1rem;
  line-height: 2rem;
}

a.site:hover {
    text-decoration: underline;
  }

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page > div {
    text-align: center;
  }

.error a.button {
    padding-left: 2rem;
    padding-right: 2rem;
    margin-top: 0.5rem;
  }

.error .message {
    margin-bottom: 1.5rem;
  }

.signin input[type="text"] {
    margin-left: auto;
    margin-right: auto;
    display: block;
  }

.signin hr {
    display: block;
    border: 0;
    border-top: 1px solid var(--color-separator);
    margin: 2rem auto 1rem auto;
    overflow: visible;
  }

.signin hr::before {
      content: "or";
      background: var(--color-background-card);
      color: #888;
      padding: 0 0.4rem;
      position: relative;
      top: -0.7rem;
    }

.signin .error {
    background: #f5f5f5;
    font-weight: 500;
    border-radius: 0.3rem;
    background: var(--color-error);
  }

.signin .error p {
      text-align: left;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      line-height: 1.2rem;
      color: var(--color-info-text);
    }

.signin > div,
  .signin form {
    display: block;
  }

.signin > div input[type], .signin form input[type] {
      margin-bottom: 0.5rem;
    }

.signin > div button, .signin form button {
      width: 100%;
    }

.signin .provider + .provider {
    margin-top: 1rem;
  }

.logo {
  display: inline-block;
  max-width: 150px;
  margin: 1.25rem 0;
  max-height: 70px;
}

.card {
  background-color: var(--color-background-card);
  border-radius: 1rem;
  padding: 1.25rem 2rem;
}

.card .header {
    color: var(--color-primary);
  }

.card input[type]::-moz-placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type]::placeholder {
    color: color-mix(
      in srgb,
      var(--color-text) 20%,
      var(--color-button-active-background)
    );
  }

.card input[type] {
    background: color-mix(in srgb, var(--color-background-card) 95%, black);
  }

.section-header {
  color: var(--color-text);
}

@media screen and (min-width: 450px) {
  .card {
    margin: 2rem 0;
    width: 368px;
  }
}

@media screen and (max-width: 450px) {
  .card {
    margin: 1rem 0;
    width: 343px;
  }
}
`;
      function ly({ html: a10, title: b10, status: c10, cookies: d10, theme: e10, headTags: f10 }) {
        return { cookies: d10, status: c10, headers: { "Content-Type": "text/html" }, body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${lx}</style><title>${b10}</title>${f10 ?? ""}</head><body class="__next-auth-theme-${e10?.colorScheme ?? "auto"}"><div class="page">${function(a11, b11, c11) {
          var d11 = kI.__s;
          kI.__s = true, lj = kI.__b, lk = kI.diffed, ll = kI.__r, lm = kI.unmount;
          var e11 = function(a12, b12, c12) {
            var d12, e12, f12, g10 = {};
            for (f12 in b12) "key" == f12 ? d12 = b12[f12] : "ref" == f12 ? e12 = b12[f12] : g10[f12] = b12[f12];
            if (arguments.length > 2 && (g10.children = arguments.length > 3 ? kH.call(arguments, 2) : c12), "function" == typeof a12 && null != a12.defaultProps) for (f12 in a12.defaultProps) void 0 === g10[f12] && (g10[f12] = a12.defaultProps[f12]);
            return kX(a12, g10, d12, e12, null);
          }(kY, null);
          e11.__k = [a11];
          try {
            var f11 = function a12(b12, c12, d12, e12, f12, g10, h10) {
              if (null == b12 || true === b12 || false === b12 || "" === b12) return "";
              var i10 = typeof b12;
              if ("object" != i10) return "function" == i10 ? "" : "string" == i10 ? le(b12) : b12 + "";
              if (lp(b12)) {
                var j10, k10 = "";
                f12.__k = b12;
                for (var l10 = 0; l10 < b12.length; l10++) {
                  var m10 = b12[l10];
                  if (null != m10 && "boolean" != typeof m10) {
                    var n10, o10 = a12(m10, c12, d12, e12, f12, g10, h10);
                    "string" == typeof o10 ? k10 += o10 : (j10 || (j10 = []), k10 && j10.push(k10), k10 = "", lp(o10) ? (n10 = j10).push.apply(n10, o10) : j10.push(o10));
                  }
                }
                return j10 ? (k10 && j10.push(k10), j10) : k10;
              }
              if (void 0 !== b12.constructor) return "";
              b12.__ = f12, lj && lj(b12);
              var p10 = b12.type, q3 = b12.props;
              if ("function" == typeof p10) {
                var r2, s2, t2, u2 = c12;
                if (p10 === kY) {
                  if ("tpl" in q3) {
                    for (var v2 = "", w2 = 0; w2 < q3.tpl.length; w2++) if (v2 += q3.tpl[w2], q3.exprs && w2 < q3.exprs.length) {
                      var x2 = q3.exprs[w2];
                      if (null == x2) continue;
                      "object" == typeof x2 && (void 0 === x2.constructor || lp(x2)) ? v2 += a12(x2, c12, d12, e12, b12, g10, h10) : v2 += x2;
                    }
                    return v2;
                  }
                  if ("UNSTABLE_comment" in q3) return "<!--" + le(q3.UNSTABLE_comment) + "-->";
                  s2 = q3.children;
                } else {
                  if (null != (r2 = p10.contextType)) {
                    var y2 = c12[r2.__c];
                    u2 = y2 ? y2.props.value : r2.__;
                  }
                  var z2 = p10.prototype && "function" == typeof p10.prototype.render;
                  if (z2) s2 = lr(b12, u2), t2 = b12.__c;
                  else {
                    b12.__c = t2 = { __v: b12, context: u2, props: b12.props, setState: li, forceUpdate: li, __d: true, __h: [] };
                    for (var A2 = 0; t2.__d && A2++ < 25; ) t2.__d = false, ll && ll(b12), s2 = p10.call(t2, q3, u2);
                    t2.__d = true;
                  }
                  if (null != t2.getChildContext && (c12 = lq({}, c12, t2.getChildContext())), z2 && kI.errorBoundaries && (p10.getDerivedStateFromError || t2.componentDidCatch)) {
                    s2 = null != s2 && s2.type === kY && null == s2.key && null == s2.props.tpl ? s2.props.children : s2;
                    try {
                      return a12(s2, c12, d12, e12, b12, g10, h10);
                    } catch (f13) {
                      return p10.getDerivedStateFromError && (t2.__s = p10.getDerivedStateFromError(f13)), t2.componentDidCatch && t2.componentDidCatch(f13, ln), t2.__d ? (s2 = lr(b12, c12), null != (t2 = b12.__c).getChildContext && (c12 = lq({}, c12, t2.getChildContext())), a12(s2 = null != s2 && s2.type === kY && null == s2.key && null == s2.props.tpl ? s2.props.children : s2, c12, d12, e12, b12, g10, h10)) : "";
                    } finally {
                      lk && lk(b12), b12.__ = null, lm && lm(b12);
                    }
                  }
                }
                s2 = null != s2 && s2.type === kY && null == s2.key && null == s2.props.tpl ? s2.props.children : s2;
                try {
                  var B2 = a12(s2, c12, d12, e12, b12, g10, h10);
                  return lk && lk(b12), b12.__ = null, kI.unmount && kI.unmount(b12), B2;
                } catch (f13) {
                  if (!g10 && h10 && h10.onError) {
                    var C2 = h10.onError(f13, b12, function(f14) {
                      return a12(f14, c12, d12, e12, b12, g10, h10);
                    });
                    if (void 0 !== C2) return C2;
                    var D2 = kI.__e;
                    return D2 && D2(f13, b12), "";
                  }
                  if (!g10 || !f13 || "function" != typeof f13.then) throw f13;
                  return f13.then(function f14() {
                    try {
                      return a12(s2, c12, d12, e12, b12, g10, h10);
                    } catch (i11) {
                      if (!i11 || "function" != typeof i11.then) throw i11;
                      return i11.then(function() {
                        return a12(s2, c12, d12, e12, b12, g10, h10);
                      }, f14);
                    }
                  });
                }
              }
              var E2, F2 = "<" + p10, G2 = "";
              for (var H2 in q3) {
                var I2 = q3[H2];
                if ("function" != typeof I2 || "class" === H2 || "className" === H2) {
                  switch (H2) {
                    case "children":
                      E2 = I2;
                      continue;
                    case "key":
                    case "ref":
                    case "__self":
                    case "__source":
                      continue;
                    case "htmlFor":
                      if ("for" in q3) continue;
                      H2 = "for";
                      break;
                    case "className":
                      if ("class" in q3) continue;
                      H2 = "class";
                      break;
                    case "defaultChecked":
                      H2 = "checked";
                      break;
                    case "defaultSelected":
                      H2 = "selected";
                      break;
                    case "defaultValue":
                    case "value":
                      switch (H2 = "value", p10) {
                        case "textarea":
                          E2 = I2;
                          continue;
                        case "select":
                          e12 = I2;
                          continue;
                        case "option":
                          e12 != I2 || "selected" in q3 || (F2 += " selected");
                      }
                      break;
                    case "dangerouslySetInnerHTML":
                      G2 = I2 && I2.__html;
                      continue;
                    case "style":
                      "object" == typeof I2 && (I2 = function(a13) {
                        var b13 = "";
                        for (var c13 in a13) {
                          var d13 = a13[c13];
                          if (null != d13 && "" !== d13) {
                            var e13 = "-" == c13[0] ? c13 : lf[c13] || (lf[c13] = c13.replace(lh, "-$&").toLowerCase()), f13 = ";";
                            "number" != typeof d13 || e13.startsWith("--") || lg.has(e13) || (f13 = "px;"), b13 = b13 + e13 + ":" + d13 + f13;
                          }
                        }
                        return b13 || void 0;
                      }(I2));
                      break;
                    case "acceptCharset":
                      H2 = "accept-charset";
                      break;
                    case "httpEquiv":
                      H2 = "http-equiv";
                      break;
                    default:
                      if (k9.test(H2)) H2 = H2.replace(k9, "$1:$2").toLowerCase();
                      else {
                        if (k8.test(H2)) continue;
                        ("-" === H2[4] || lc.has(H2)) && null != I2 ? I2 += "" : d12 ? lb.test(H2) && (H2 = "panose1" === H2 ? "panose-1" : H2.replace(/([A-Z])/g, "-$1").toLowerCase()) : la.test(H2) && (H2 = H2.toLowerCase());
                      }
                  }
                  null != I2 && false !== I2 && (F2 = true === I2 || "" === I2 ? F2 + " " + H2 : F2 + " " + H2 + '="' + ("string" == typeof I2 ? le(I2) : I2 + "") + '"');
                }
              }
              if (k8.test(p10)) throw Error(p10 + " is not a valid HTML tag name in " + F2 + ">");
              if (G2 || ("string" == typeof E2 ? G2 = le(E2) : null != E2 && false !== E2 && true !== E2 && (G2 = a12(E2, c12, "svg" === p10 || "foreignObject" !== p10 && d12, e12, b12, g10, h10))), lk && lk(b12), b12.__ = null, lm && lm(b12), !G2 && ls.has(p10)) return F2 + "/>";
              var J2 = "</" + p10 + ">", K2 = F2 + ">";
              return lp(G2) ? [K2].concat(G2, [J2]) : "string" != typeof G2 ? [K2, G2, J2] : K2 + G2 + J2;
            }(a11, ln, false, void 0, e11, false, void 0);
            return lp(f11) ? f11.join("") : f11;
          } catch (a12) {
            if (a12.then) throw Error('Use "renderToStringAsync" for suspenseful rendering.');
            throw a12;
          } finally {
            kI.__c && kI.__c(a11, lo), kI.__s = d11, lo.length = 0;
          }
        }(a10)}</div></body></html>` };
      }
      function lz(a10) {
        let { url: b10, theme: c10, query: d10, cookies: e10, pages: f10, providers: g10 } = a10;
        return { csrf: (a11, b11, c11) => a11 ? (b11.logger.warn("csrf-disabled"), c11.push({ name: b11.cookies.csrfToken.name, value: "", options: { ...b11.cookies.csrfToken.options, maxAge: 0 } }), { status: 404, cookies: c11 }) : { headers: { "Content-Type": "application/json", "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" }, body: { csrfToken: b11.csrfToken }, cookies: c11 }, providers: (a11) => ({ headers: { "Content-Type": "application/json" }, body: a11.reduce((a12, { id: b11, name: c11, type: d11, signinUrl: e11, callbackUrl: f11 }) => (a12[b11] = { id: b11, name: c11, type: d11, signinUrl: e11, callbackUrl: f11 }, a12), {}) }), signin(b11, h10) {
          if (b11) throw new hX("Unsupported action");
          if (f10?.signIn) {
            let b12 = `${f10.signIn}${f10.signIn.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: a10.callbackUrl ?? "/" })}`;
            return h10 && (b12 = `${b12}&${new URLSearchParams({ error: h10 })}`), { redirect: b12, cookies: e10 };
          }
          let i10 = g10?.find((a11) => "webauthn" === a11.type && a11.enableConditionalUI && !!a11.simpleWebAuthnBrowserVersion), j10 = "";
          if (i10) {
            let { simpleWebAuthnBrowserVersion: a11 } = i10;
            j10 = `<script src="https://unpkg.com/@simplewebauthn/browser@${a11}/dist/bundle/index.umd.min.js" crossorigin="anonymous"></script>`;
          }
          return ly({ cookies: e10, theme: c10, html: function(a11) {
            let { csrfToken: b12, providers: c11 = [], callbackUrl: d11, theme: e11, email: f11, error: g11 } = a11;
            "undefined" != typeof document && e11?.brandColor && document.documentElement.style.setProperty("--brand-color", e11.brandColor), "undefined" != typeof document && e11?.buttonText && document.documentElement.style.setProperty("--button-text-color", e11.buttonText);
            let h11 = g11 && (lw[g11] ?? lw.default), i11 = c11.find((a12) => "webauthn" === a12.type && a12.enableConditionalUI)?.id;
            return lu("div", { className: "signin", children: [e11?.brandColor && lu("style", { dangerouslySetInnerHTML: { __html: `:root {--brand-color: ${e11.brandColor}}` } }), e11?.buttonText && lu("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${e11.buttonText}
        }
      ` } }), lu("div", { className: "card", children: [h11 && lu("div", { className: "error", children: lu("p", { children: h11 }) }), e11?.logo && lu("img", { src: e11.logo, alt: "Logo", className: "logo" }), c11.map((a12, e12) => {
              let g12, h12, i12;
              ("oauth" === a12.type || "oidc" === a12.type) && ({ bg: g12 = "#fff", brandColor: h12, logo: i12 = `https://authjs.dev/img/providers/${a12.id}.svg` } = a12.style ?? {});
              let j11 = h12 ?? g12 ?? "#fff";
              return lu("div", { className: "provider", children: ["oauth" === a12.type || "oidc" === a12.type ? lu("form", { action: a12.signinUrl, method: "POST", children: [lu("input", { type: "hidden", name: "csrfToken", value: b12 }), d11 && lu("input", { type: "hidden", name: "callbackUrl", value: d11 }), lu("button", { type: "submit", className: "button", style: { "--provider-brand-color": j11 }, tabIndex: 0, children: [lu("span", { style: { filter: "invert(1) grayscale(1) brightness(1.3) contrast(9000)", "mix-blend-mode": "luminosity", opacity: 0.95 }, children: ["Sign in with ", a12.name] }), i12 && lu("img", { loading: "lazy", height: 24, src: i12 })] })] }) : null, ("email" === a12.type || "credentials" === a12.type || "webauthn" === a12.type) && e12 > 0 && "email" !== c11[e12 - 1].type && "credentials" !== c11[e12 - 1].type && "webauthn" !== c11[e12 - 1].type && lu("hr", {}), "email" === a12.type && lu("form", { action: a12.signinUrl, method: "POST", children: [lu("input", { type: "hidden", name: "csrfToken", value: b12 }), lu("label", { className: "section-header", htmlFor: `input-email-for-${a12.id}-provider`, children: "Email" }), lu("input", { id: `input-email-for-${a12.id}-provider`, autoFocus: true, type: "email", name: "email", value: f11, placeholder: "email@example.com", required: true }), lu("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", a12.name] })] }), "credentials" === a12.type && lu("form", { action: a12.callbackUrl, method: "POST", children: [lu("input", { type: "hidden", name: "csrfToken", value: b12 }), Object.keys(a12.credentials).map((b13) => lu("div", { children: [lu("label", { className: "section-header", htmlFor: `input-${b13}-for-${a12.id}-provider`, children: a12.credentials[b13].label ?? b13 }), lu("input", { name: b13, id: `input-${b13}-for-${a12.id}-provider`, type: a12.credentials[b13].type ?? "text", placeholder: a12.credentials[b13].placeholder ?? "", ...a12.credentials[b13] })] }, `input-group-${a12.id}`)), lu("button", { id: "submitButton", type: "submit", tabIndex: 0, children: ["Sign in with ", a12.name] })] }), "webauthn" === a12.type && lu("form", { action: a12.callbackUrl, method: "POST", id: `${a12.id}-form`, children: [lu("input", { type: "hidden", name: "csrfToken", value: b12 }), Object.keys(a12.formFields).map((b13) => lu("div", { children: [lu("label", { className: "section-header", htmlFor: `input-${b13}-for-${a12.id}-provider`, children: a12.formFields[b13].label ?? b13 }), lu("input", { name: b13, "data-form-field": true, id: `input-${b13}-for-${a12.id}-provider`, type: a12.formFields[b13].type ?? "text", placeholder: a12.formFields[b13].placeholder ?? "", ...a12.formFields[b13] })] }, `input-group-${a12.id}`)), lu("button", { id: `submitButton-${a12.id}`, type: "submit", tabIndex: 0, children: ["Sign in with ", a12.name] })] }), ("email" === a12.type || "credentials" === a12.type || "webauthn" === a12.type) && e12 + 1 < c11.length && lu("hr", {})] }, a12.id);
            })] }), i11 && lu(kY, { children: lu("script", { dangerouslySetInnerHTML: { __html: `
const currentURL = window.location.href;
const authURL = currentURL.substring(0, currentURL.lastIndexOf('/'));
(${lv})(authURL, "${i11}");
` } }) })] });
          }({ csrfToken: a10.csrfToken, providers: a10.providers?.filter((a11) => ["email", "oauth", "oidc"].includes(a11.type) || "credentials" === a11.type && a11.credentials || "webauthn" === a11.type && a11.formFields || false), callbackUrl: a10.callbackUrl, theme: a10.theme, error: h10, ...d10 }), title: "Sign In", headTags: j10 });
        }, signout: () => f10?.signOut ? { redirect: f10.signOut, cookies: e10 } : ly({ cookies: e10, theme: c10, html: function(a11) {
          let { url: b11, csrfToken: c11, theme: d11 } = a11;
          return lu("div", { className: "signout", children: [d11?.brandColor && lu("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${d11.brandColor}
        }
      ` } }), d11?.buttonText && lu("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${d11.buttonText}
        }
      ` } }), lu("div", { className: "card", children: [d11?.logo && lu("img", { src: d11.logo, alt: "Logo", className: "logo" }), lu("h1", { children: "Signout" }), lu("p", { children: "Are you sure you want to sign out?" }), lu("form", { action: b11?.toString(), method: "POST", children: [lu("input", { type: "hidden", name: "csrfToken", value: c11 }), lu("button", { id: "submitButton", type: "submit", children: "Sign out" })] })] })] });
        }({ csrfToken: a10.csrfToken, url: b10, theme: c10 }), title: "Sign Out" }), verifyRequest: (a11) => f10?.verifyRequest ? { redirect: `${f10.verifyRequest}${b10?.search ?? ""}`, cookies: e10 } : ly({ cookies: e10, theme: c10, html: function(a12) {
          let { url: b11, theme: c11 } = a12;
          return lu("div", { className: "verify-request", children: [c11.brandColor && lu("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${c11.brandColor}
        }
      ` } }), lu("div", { className: "card", children: [c11.logo && lu("img", { src: c11.logo, alt: "Logo", className: "logo" }), lu("h1", { children: "Check your email" }), lu("p", { children: "A sign in link has been sent to your email address." }), lu("p", { children: lu("a", { className: "site", href: b11.origin, children: b11.host }) })] })] });
        }({ url: b10, theme: c10, ...a11 }), title: "Verify Request" }), error: (a11) => f10?.error ? { redirect: `${f10.error}${f10.error.includes("?") ? "&" : "?"}error=${a11}`, cookies: e10 } : ly({ cookies: e10, theme: c10, ...function(a12) {
          let { url: b11, error: c11 = "default", theme: d11 } = a12, e11 = `${b11}/signin`, f11 = { default: { status: 200, heading: "Error", message: lu("p", { children: lu("a", { className: "site", href: b11?.origin, children: b11?.host }) }) }, Configuration: { status: 500, heading: "Server error", message: lu("div", { children: [lu("p", { children: "There is a problem with the server configuration." }), lu("p", { children: "Check the server logs for more information." })] }) }, AccessDenied: { status: 403, heading: "Access Denied", message: lu("div", { children: [lu("p", { children: "You do not have permission to sign in." }), lu("p", { children: lu("a", { className: "button", href: e11, children: "Sign in" }) })] }) }, Verification: { status: 403, heading: "Unable to sign in", message: lu("div", { children: [lu("p", { children: "The sign in link is no longer valid." }), lu("p", { children: "It may have been used already or it may have expired." })] }), signin: lu("a", { className: "button", href: e11, children: "Sign in" }) } }, { status: g11, heading: h10, message: i10, signin: j10 } = f11[c11] ?? f11.default;
          return { status: g11, html: lu("div", { className: "error", children: [d11?.brandColor && lu("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${d11?.brandColor}
        }
      ` } }), lu("div", { className: "card", children: [d11?.logo && lu("img", { src: d11?.logo, alt: "Logo", className: "logo" }), lu("h1", { children: h10 }), lu("div", { className: "message", children: i10 }), j10] })] }) };
        }({ url: b10, theme: c10, error: a11 }), title: "Error" }) };
      }
      function lA(a10, b10 = Date.now()) {
        return new Date(b10 + 1e3 * a10);
      }
      async function lB(a10, b10, c10, d10) {
        if (!c10?.providerAccountId || !c10.type) throw Error("Missing or invalid provider account");
        if (!["email", "oauth", "oidc", "webauthn"].includes(c10.type)) throw Error("Provider not supported");
        let { adapter: e10, jwt: f10, events: g10, session: { strategy: h10, generateSessionToken: i10 } } = d10;
        if (!e10) return { user: b10, account: c10 };
        let j10 = c10, { createUser: k10, updateUser: l10, getUser: m10, getUserByAccount: n10, getUserByEmail: o10, linkAccount: p10, createSession: q3, getSessionAndUser: r2, deleteSession: s2 } = e10, t2 = null, u2 = null, v2 = false, w2 = "jwt" === h10;
        if (a10) if (w2) try {
          let b11 = d10.cookies.sessionToken.name;
          (t2 = await f10.decode({ ...f10, token: a10, salt: b11 })) && "sub" in t2 && t2.sub && (u2 = await m10(t2.sub));
        } catch {
        }
        else {
          let b11 = await r2(a10);
          b11 && (t2 = b11.session, u2 = b11.user);
        }
        if ("email" === j10.type) {
          let c11 = await o10(b10.email);
          return c11 ? (u2?.id !== c11.id && !w2 && a10 && await s2(a10), u2 = await l10({ id: c11.id, emailVerified: /* @__PURE__ */ new Date() }), await g10.updateUser?.({ user: u2 })) : (u2 = await k10({ ...b10, emailVerified: /* @__PURE__ */ new Date() }), await g10.createUser?.({ user: u2 }), v2 = true), { session: t2 = w2 ? {} : await q3({ sessionToken: i10(), userId: u2.id, expires: lA(d10.session.maxAge) }), user: u2, isNewUser: v2 };
        }
        if ("webauthn" === j10.type) {
          let a11 = await n10({ providerAccountId: j10.providerAccountId, provider: j10.provider });
          if (a11) {
            if (u2) {
              if (a11.id === u2.id) {
                let a12 = { ...j10, userId: u2.id };
                return { session: t2, user: u2, isNewUser: v2, account: a12 };
              }
              throw new h5("The account is already associated with another user", { provider: j10.provider });
            }
            t2 = w2 ? {} : await q3({ sessionToken: i10(), userId: a11.id, expires: lA(d10.session.maxAge) });
            let b11 = { ...j10, userId: a11.id };
            return { session: t2, user: a11, isNewUser: v2, account: b11 };
          }
          {
            if (u2) {
              await p10({ ...j10, userId: u2.id }), await g10.linkAccount?.({ user: u2, account: j10, profile: b10 });
              let a13 = { ...j10, userId: u2.id };
              return { session: t2, user: u2, isNewUser: v2, account: a13 };
            }
            if (b10.email ? await o10(b10.email) : null) throw new h5("Another account already exists with the same e-mail address", { provider: j10.provider });
            u2 = await k10({ ...b10 }), await g10.createUser?.({ user: u2 }), await p10({ ...j10, userId: u2.id }), await g10.linkAccount?.({ user: u2, account: j10, profile: b10 }), t2 = w2 ? {} : await q3({ sessionToken: i10(), userId: u2.id, expires: lA(d10.session.maxAge) });
            let a12 = { ...j10, userId: u2.id };
            return { session: t2, user: u2, isNewUser: true, account: a12 };
          }
        }
        let x2 = await n10({ providerAccountId: j10.providerAccountId, provider: j10.provider });
        if (x2) {
          if (u2) {
            if (x2.id === u2.id) return { session: t2, user: u2, isNewUser: v2 };
            throw new hQ("The account is already associated with another user", { provider: j10.provider });
          }
          return { session: t2 = w2 ? {} : await q3({ sessionToken: i10(), userId: x2.id, expires: lA(d10.session.maxAge) }), user: x2, isNewUser: v2 };
        }
        {
          let { provider: a11 } = d10, { type: c11, provider: e11, providerAccountId: f11, userId: h11, ...l11 } = j10;
          if (j10 = Object.assign(a11.account(l11) ?? {}, { providerAccountId: f11, provider: e11, type: c11, userId: h11 }), u2) return await p10({ ...j10, userId: u2.id }), await g10.linkAccount?.({ user: u2, account: j10, profile: b10 }), { session: t2, user: u2, isNewUser: v2 };
          let m11 = b10.email ? await o10(b10.email) : null;
          if (m11) {
            let a12 = d10.provider;
            if (a12?.allowDangerousEmailAccountLinking) u2 = m11, v2 = false;
            else throw new hQ("Another account already exists with the same e-mail address", { provider: j10.provider });
          } else u2 = await k10({ ...b10, emailVerified: null }), v2 = true;
          return await g10.createUser?.({ user: u2 }), await p10({ ...j10, userId: u2.id }), await g10.linkAccount?.({ user: u2, account: j10, profile: b10 }), { session: t2 = w2 ? {} : await q3({ sessionToken: i10(), userId: u2.id, expires: lA(d10.session.maxAge) }), user: u2, isNewUser: v2 };
        }
      }
      function lC(a10, b10) {
        if (null == a10) return false;
        try {
          return a10 instanceof b10 || Object.getPrototypeOf(a10)[Symbol.toStringTag] === b10.prototype[Symbol.toStringTag];
        } catch {
          return false;
        }
      }
      "undefined" != typeof navigator && navigator.userAgent?.startsWith?.("Mozilla/5.0 ") || (h = "oauth4webapi/v3.8.5");
      let lD = "ERR_INVALID_ARG_VALUE", lE = "ERR_INVALID_ARG_TYPE";
      function lF(a10, b10, c10) {
        let d10 = TypeError(a10, { cause: c10 });
        return Object.assign(d10, { code: b10 }), d10;
      }
      let lG = Symbol(), lH = Symbol(), lI = Symbol(), lJ = Symbol(), lK = Symbol(), lL = Symbol();
      Symbol();
      let lM = new TextEncoder(), lN = new TextDecoder();
      function lO(a10) {
        return "string" == typeof a10 ? lM.encode(a10) : lN.decode(a10);
      }
      function lP(a10) {
        return "string" == typeof a10 ? j(a10) : i(a10);
      }
      i = Uint8Array.prototype.toBase64 ? (a10) => (a10 instanceof ArrayBuffer && (a10 = new Uint8Array(a10)), a10.toBase64({ alphabet: "base64url", omitPadding: true })) : (a10) => {
        a10 instanceof ArrayBuffer && (a10 = new Uint8Array(a10));
        let b10 = [];
        for (let c10 = 0; c10 < a10.byteLength; c10 += 32768) b10.push(String.fromCharCode.apply(null, a10.subarray(c10, c10 + 32768)));
        return btoa(b10.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }, j = Uint8Array.fromBase64 ? (a10) => {
        try {
          return Uint8Array.fromBase64(a10, { alphabet: "base64url" });
        } catch (a11) {
          throw lF("The input to be decoded is not correctly encoded.", lD, a11);
        }
      } : (a10) => {
        try {
          let b10 = atob(a10.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), c10 = new Uint8Array(b10.length);
          for (let a11 = 0; a11 < b10.length; a11++) c10[a11] = b10.charCodeAt(a11);
          return c10;
        } catch (a11) {
          throw lF("The input to be decoded is not correctly encoded.", lD, a11);
        }
      };
      class lQ extends Error {
        code;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, this.code = mR, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class lR extends Error {
        code;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, b10?.code && (this.code = b10?.code), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      function lS(a10, b10, c10) {
        return new lR(a10, { code: b10, cause: c10 });
      }
      function lT(a10) {
        return !(null === a10 || "object" != typeof a10 || Array.isArray(a10));
      }
      function lU(a10) {
        lC(a10, Headers) && (a10 = Object.fromEntries(a10.entries()));
        let b10 = new Headers(a10 ?? {});
        if (h && !b10.has("user-agent") && b10.set("user-agent", h), b10.has("authorization")) throw lF('"options.headers" must not include the "authorization" header name', lD);
        return b10;
      }
      function lV(a10, b10) {
        if (void 0 !== b10) {
          if ("function" == typeof b10 && (b10 = b10(a10.href)), !(b10 instanceof AbortSignal)) throw lF('"options.signal" must return or be an instance of AbortSignal', lE);
          return b10;
        }
      }
      function lW(a10) {
        return a10.includes("//") ? a10.replace("//", "/") : a10;
      }
      async function lX(a10, b10, c10, d10) {
        if (!(a10 instanceof URL)) throw lF(`"${b10}" must be an instance of URL`, lE);
        mb(a10, d10?.[lG] !== true);
        let e10 = c10(new URL(a10.href)), f10 = lU(d10?.headers);
        return f10.set("accept", "application/json"), (d10?.[lJ] || fetch)(e10.href, { body: void 0, headers: Object.fromEntries(f10.entries()), method: "GET", redirect: "manual", signal: lV(e10, d10?.signal) });
      }
      async function lY(a10, b10) {
        return lX(a10, "issuerIdentifier", (a11) => {
          switch (b10?.algorithm) {
            case void 0:
            case "oidc":
              a11.pathname = lW(`${a11.pathname}/.well-known/openid-configuration`);
              break;
            case "oauth2":
              !function(a12, b11, c10 = false) {
                "/" === a12.pathname ? a12.pathname = b11 : a12.pathname = lW(`${b11}/${c10 ? a12.pathname : a12.pathname.replace(/(\/)$/, "")}`);
              }(a11, ".well-known/oauth-authorization-server");
              break;
            default:
              throw lF('"options.algorithm" must be "oidc" (default), or "oauth2"', lD);
          }
          return a11;
        }, b10);
      }
      function lZ(a10, b10, c10, d10, e10) {
        try {
          if ("number" != typeof a10 || !Number.isFinite(a10)) throw lF(`${c10} must be a number`, lE, e10);
          if (a10 > 0) return;
          if (b10) {
            if (0 !== a10) throw lF(`${c10} must be a non-negative number`, lD, e10);
            return;
          }
          throw lF(`${c10} must be a positive number`, lD, e10);
        } catch (a11) {
          if (d10) throw lS(a11.message, d10, e10);
          throw a11;
        }
      }
      function l$(a10, b10, c10, d10) {
        try {
          if ("string" != typeof a10) throw lF(`${b10} must be a string`, lE, d10);
          if (0 === a10.length) throw lF(`${b10} must not be empty`, lD, d10);
        } catch (a11) {
          if (c10) throw lS(a11.message, c10, d10);
          throw a11;
        }
      }
      async function l_(a10, b10) {
        if (!(a10 instanceof URL) && a10 !== nb) throw lF('"expectedIssuerIdentifier" must be an instance of URL', lE);
        if (!lC(b10, Response)) throw lF('"response" must be an instance of Response', lE);
        if (200 !== b10.status) throw lS('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', mX, b10);
        m3(b10);
        let c10 = await na(b10);
        if (l$(c10.issuer, '"response" body "issuer" property', mV, { body: c10 }), a10 !== nb && new URL(c10.issuer).href !== a10.href) throw lS('"response" body "issuer" property does not match the expected value', m0, { expected: a10.href, body: c10, attribute: "issuer" });
        return c10;
      }
      function l0(a10) {
        var b10 = a10, c10 = "application/json";
        if (ms(b10) !== c10) throw function(a11, ...b11) {
          let c11 = '"response" content-type must be ';
          if (b11.length > 2) {
            let a12 = b11.pop();
            c11 += `${b11.join(", ")}, or ${a12}`;
          } else 2 === b11.length ? c11 += `${b11[0]} or ${b11[1]}` : c11 += b11[0];
          return lS(c11, mW, a11);
        }(b10, c10);
      }
      function l1() {
        return lP(crypto.getRandomValues(new Uint8Array(32)));
      }
      async function l2(a10) {
        return l$(a10, "codeVerifier"), lP(await crypto.subtle.digest("SHA-256", lO(a10)));
      }
      function l3(a10) {
        let b10 = a10?.[lH];
        return "number" == typeof b10 && Number.isFinite(b10) ? b10 : 0;
      }
      function l4(a10) {
        let b10 = a10?.[lI];
        return "number" == typeof b10 && Number.isFinite(b10) && -1 !== Math.sign(b10) ? b10 : 30;
      }
      function l5() {
        return Math.floor(Date.now() / 1e3);
      }
      function l6(a10) {
        if ("object" != typeof a10 || null === a10) throw lF('"as" must be an object', lE);
        l$(a10.issuer, '"as.issuer"');
      }
      function l7(a10) {
        if ("object" != typeof a10 || null === a10) throw lF('"client" must be an object', lE);
        l$(a10.client_id, '"client.client_id"');
      }
      function l8(a10, b10) {
        let c10 = l5() + l3(b10);
        return { jti: l1(), aud: a10.issuer, exp: c10 + 60, iat: c10, nbf: c10, iss: b10.client_id, sub: b10.client_id };
      }
      async function l9(a10, b10, c10) {
        if (!c10.usages.includes("sign")) throw lF('CryptoKey instances used for signing assertions must include "sign" in their "usages"', lD);
        let d10 = `${lP(lO(JSON.stringify(a10)))}.${lP(lO(JSON.stringify(b10)))}`, e10 = lP(await crypto.subtle.sign(function(a11) {
          switch (a11.algorithm.name) {
            case "ECDSA":
              return { name: a11.algorithm.name, hash: function(a12) {
                let { algorithm: b11 } = a12;
                switch (b11.namedCurve) {
                  case "P-256":
                    return "SHA-256";
                  case "P-384":
                    return "SHA-384";
                  case "P-521":
                    return "SHA-512";
                  default:
                    throw new lQ("unsupported ECDSA namedCurve", { cause: a12 });
                }
              }(a11) };
            case "RSA-PSS":
              switch (m4(a11), a11.algorithm.hash.name) {
                case "SHA-256":
                case "SHA-384":
                case "SHA-512":
                  return { name: a11.algorithm.name, saltLength: parseInt(a11.algorithm.hash.name.slice(-3), 10) >> 3 };
                default:
                  throw new lQ("unsupported RSA-PSS hash name", { cause: a11 });
              }
            case "RSASSA-PKCS1-v1_5":
              return m4(a11), a11.algorithm.name;
            case "ML-DSA-44":
            case "ML-DSA-65":
            case "ML-DSA-87":
            case "Ed25519":
              return a11.algorithm.name;
          }
          throw new lQ("unsupported CryptoKey algorithm name", { cause: a11 });
        }(c10), c10, lO(d10)));
        return `${d10}.${e10}`;
      }
      let ma = URL.parse ? (a10, b10) => URL.parse(a10, b10) : (a10, b10) => {
        try {
          return new URL(a10, b10);
        } catch {
          return null;
        }
      };
      function mb(a10, b10) {
        if (b10 && "https:" !== a10.protocol) throw lS("only requests to HTTPS are allowed", mY, a10);
        if ("https:" !== a10.protocol && "http:" !== a10.protocol) throw lS("only HTTP and HTTPS requests are allowed", mZ, a10);
      }
      function mc(a10, b10, c10, d10) {
        let e10;
        if ("string" != typeof a10 || !(e10 = ma(a10))) throw lS(`authorization server metadata does not contain a valid ${c10 ? `"as.mtls_endpoint_aliases.${b10}"` : `"as.${b10}"`}`, void 0 === a10 ? m1 : m2, { attribute: c10 ? `mtls_endpoint_aliases.${b10}` : b10 });
        return mb(e10, d10), e10;
      }
      function md(a10, b10, c10, d10) {
        return c10 && a10.mtls_endpoint_aliases && b10 in a10.mtls_endpoint_aliases ? mc(a10.mtls_endpoint_aliases[b10], b10, c10, d10) : mc(a10[b10], b10, c10, d10);
      }
      class me extends Error {
        cause;
        code;
        error;
        status;
        error_description;
        response;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, this.code = mQ, this.cause = b10.cause, this.error = b10.cause.error, this.status = b10.response.status, this.error_description = b10.cause.error_description, Object.defineProperty(this, "response", { enumerable: false, value: b10.response }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class mf extends Error {
        cause;
        code;
        error;
        error_description;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, this.code = mS, this.cause = b10.cause, this.error = b10.cause.get("error"), this.error_description = b10.cause.get("error_description") ?? void 0, Error.captureStackTrace?.(this, this.constructor);
        }
      }
      class mg extends Error {
        cause;
        code;
        response;
        status;
        constructor(a10, b10) {
          super(a10, b10), this.name = this.constructor.name, this.code = mP, this.cause = b10.cause, this.status = b10.response.status, this.response = b10.response, Object.defineProperty(this, "response", { enumerable: false }), Error.captureStackTrace?.(this, this.constructor);
        }
      }
      let mh = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+", mi = RegExp("^[,\\s]*(" + mh + ")"), mj = RegExp("^[,\\s]*(" + mh + ')\\s*=\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"[,\\s]*(.*)'), mk = RegExp("^[,\\s]*" + ("(" + mh + ")\\s*=\\s*(") + mh + ")[,\\s]*(.*)"), ml = RegExp("^([a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2})(?:$|[,\\s])(.*)");
      async function mm(a10) {
        if (a10.status > 399 && a10.status < 500) {
          m3(a10), l0(a10);
          try {
            let b10 = await a10.clone().json();
            if (lT(b10) && "string" == typeof b10.error && b10.error.length) return b10;
          } catch {
          }
        }
      }
      async function mn(a10, b10, c10) {
        if (a10.status !== b10) {
          let b11;
          if (mA(a10), b11 = await mm(a10)) throw await a10.body?.cancel(), new me("server responded with an error in the response body", { cause: b11, response: a10 });
          throw lS(`"response" is not a conform ${c10} response (unexpected HTTP status code)`, mX, a10);
        }
      }
      function mo(a10) {
        if (!mF.has(a10)) throw lF('"options.DPoP" is not a valid DPoPHandle', lD);
      }
      async function mp(a10, b10, c10, d10, e10, f10) {
        if (l$(a10, '"accessToken"'), !(c10 instanceof URL)) throw lF('"url" must be an instance of URL', lE);
        mb(c10, f10?.[lG] !== true), d10 = lU(d10), f10?.DPoP && (mo(f10.DPoP), await f10.DPoP.addProof(c10, d10, b10.toUpperCase(), a10)), d10.set("authorization", `${d10.has("dpop") ? "DPoP" : "Bearer"} ${a10}`);
        let g10 = await (f10?.[lJ] || fetch)(c10.href, { duplex: lC(e10, ReadableStream) ? "half" : void 0, body: e10, headers: Object.fromEntries(d10.entries()), method: b10, redirect: "manual", signal: lV(c10, f10?.signal) });
        return f10?.DPoP?.cacheNonce(g10, c10), g10;
      }
      async function mq(a10, b10, c10, d10) {
        l6(a10), l7(b10);
        let e10 = md(a10, "userinfo_endpoint", b10.use_mtls_endpoint_aliases, d10?.[lG] !== true), f10 = lU(d10?.headers);
        return b10.userinfo_signed_response_alg ? f10.set("accept", "application/jwt") : (f10.set("accept", "application/json"), f10.append("accept", "application/jwt")), mp(c10, "GET", e10, f10, null, { ...d10, [lH]: l3(b10) });
      }
      let mr = Symbol();
      function ms(a10) {
        return a10.headers.get("content-type")?.split(";")[0];
      }
      async function mt(a10, b10, c10, d10, e10) {
        let f10;
        if (l6(a10), l7(b10), !lC(d10, Response)) throw lF('"response" must be an instance of Response', lE);
        if (mA(d10), 200 !== d10.status) throw lS('"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)', mX, d10);
        if (m3(d10), "application/jwt" === ms(d10)) {
          let { claims: c11, jwt: g10 } = await m5(await d10.text(), m6.bind(void 0, b10.userinfo_signed_response_alg, a10.userinfo_signing_alg_values_supported, void 0), l3(b10), l4(b10), e10?.[lL]).then(mB.bind(void 0, b10.client_id)).then(mD.bind(void 0, a10));
          mx.set(d10, g10), f10 = c11;
        } else {
          if (b10.userinfo_signed_response_alg) throw lS("JWT UserInfo Response expected", mT, d10);
          f10 = await na(d10);
        }
        if (l$(f10.sub, '"response" body "sub" property', mV, { body: f10 }), c10 === mr) ;
        else if (l$(c10, '"expectedSubject"'), f10.sub !== c10) throw lS('unexpected "response" body "sub" property value', m0, { expected: c10, body: f10, attribute: "sub" });
        return f10;
      }
      async function mu(a10, b10, c10, d10, e10, f10, g10) {
        return await c10(a10, b10, e10, f10), f10.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"), (g10?.[lJ] || fetch)(d10.href, { body: e10, headers: Object.fromEntries(f10.entries()), method: "POST", redirect: "manual", signal: lV(d10, g10?.signal) });
      }
      async function mv(a10, b10, c10, d10, e10, f10) {
        let g10 = md(a10, "token_endpoint", b10.use_mtls_endpoint_aliases, f10?.[lG] !== true);
        e10.set("grant_type", d10);
        let h10 = lU(f10?.headers);
        h10.set("accept", "application/json"), f10?.DPoP !== void 0 && (mo(f10.DPoP), await f10.DPoP.addProof(g10, h10, "POST"));
        let i10 = await mu(a10, b10, c10, g10, e10, h10, f10);
        return f10?.DPoP?.cacheNonce(i10, g10), i10;
      }
      let mw = /* @__PURE__ */ new WeakMap(), mx = /* @__PURE__ */ new WeakMap();
      function my(a10) {
        if (!a10.id_token) return;
        let b10 = mw.get(a10);
        if (!b10) throw lF('"ref" was already garbage collected or did not resolve from the proper sources', lD);
        return b10;
      }
      async function mz(a10, b10, c10, d10, e10, f10) {
        if (l6(a10), l7(b10), !lC(c10, Response)) throw lF('"response" must be an instance of Response', lE);
        await mn(c10, 200, "Token Endpoint"), m3(c10);
        let g10 = await na(c10);
        if (l$(g10.access_token, '"response" body "access_token" property', mV, { body: g10 }), l$(g10.token_type, '"response" body "token_type" property', mV, { body: g10 }), g10.token_type = g10.token_type.toLowerCase(), void 0 !== g10.expires_in) {
          let a11 = "number" != typeof g10.expires_in ? parseFloat(g10.expires_in) : g10.expires_in;
          lZ(a11, true, '"response" body "expires_in" property', mV, { body: g10 }), g10.expires_in = a11;
        }
        if (void 0 !== g10.refresh_token && l$(g10.refresh_token, '"response" body "refresh_token" property', mV, { body: g10 }), void 0 !== g10.scope && "string" != typeof g10.scope) throw lS('"response" body "scope" property must be a string', mV, { body: g10 });
        if (void 0 !== g10.id_token) {
          l$(g10.id_token, '"response" body "id_token" property', mV, { body: g10 });
          let f11 = ["aud", "exp", "iat", "iss", "sub"];
          true === b10.require_auth_time && f11.push("auth_time"), void 0 !== b10.default_max_age && (lZ(b10.default_max_age, true, '"client.default_max_age"'), f11.push("auth_time")), d10?.length && f11.push(...d10);
          let { claims: h10, jwt: i10 } = await m5(g10.id_token, m6.bind(void 0, b10.id_token_signed_response_alg, a10.id_token_signing_alg_values_supported, "RS256"), l3(b10), l4(b10), e10).then(mJ.bind(void 0, f11)).then(mE.bind(void 0, a10)).then(mC.bind(void 0, b10.client_id));
          if (Array.isArray(h10.aud) && 1 !== h10.aud.length) {
            if (void 0 === h10.azp) throw lS('ID Token "aud" (audience) claim includes additional untrusted audiences', m_, { claims: h10, claim: "aud" });
            if (h10.azp !== b10.client_id) throw lS('unexpected ID Token "azp" (authorized party) claim value', m_, { expected: b10.client_id, claims: h10, claim: "azp" });
          }
          void 0 !== h10.auth_time && lZ(h10.auth_time, true, 'ID Token "auth_time" (authentication time)', mV, { claims: h10 }), mx.set(c10, i10), mw.set(g10, h10);
        }
        if (f10?.[g10.token_type] !== void 0) f10[g10.token_type](c10, g10);
        else if ("dpop" !== g10.token_type && "bearer" !== g10.token_type) throw new lQ("unsupported `token_type` value", { cause: { body: g10 } });
        return g10;
      }
      function mA(a10) {
        let b10;
        if (b10 = function(a11) {
          if (!lC(a11, Response)) throw lF('"response" must be an instance of Response', lE);
          let b11 = a11.headers.get("www-authenticate");
          if (null === b11) return;
          let c10 = [], d10 = b11;
          for (; d10; ) {
            let a12, b12 = d10.match(mi), e10 = b12?.["1"].toLowerCase();
            if (!e10) return;
            let f10 = d10.substring(b12[0].length);
            if (f10 && !f10.match(/^[\s,]/)) return;
            let g10 = f10.match(/^\s+(.*)$/), h10 = !!g10;
            d10 = g10 ? g10[1] : void 0;
            let i10 = {};
            if (h10) for (; d10; ) {
              let c11, e11;
              if (b12 = d10.match(mj)) {
                if ([, c11, e11, d10] = b12, e11.includes("\\")) try {
                  e11 = JSON.parse(`"${e11}"`);
                } catch {
                }
                i10[c11.toLowerCase()] = e11;
                continue;
              }
              if (b12 = d10.match(mk)) {
                [, c11, e11, d10] = b12, i10[c11.toLowerCase()] = e11;
                continue;
              }
              if (b12 = d10.match(ml)) {
                if (Object.keys(i10).length) break;
                [, a12, d10] = b12;
                break;
              }
              return;
            }
            else d10 = f10 || void 0;
            let j10 = { scheme: e10, parameters: i10 };
            a12 && (j10.token68 = a12), c10.push(j10);
          }
          if (c10.length) return c10;
        }(a10)) throw new mg("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: b10, response: a10 });
      }
      function mB(a10, b10) {
        return void 0 !== b10.claims.aud ? mC(a10, b10) : b10;
      }
      function mC(a10, b10) {
        if (Array.isArray(b10.claims.aud)) {
          if (!b10.claims.aud.includes(a10)) throw lS('unexpected JWT "aud" (audience) claim value', m_, { expected: a10, claims: b10.claims, claim: "aud" });
        } else if (b10.claims.aud !== a10) throw lS('unexpected JWT "aud" (audience) claim value', m_, { expected: a10, claims: b10.claims, claim: "aud" });
        return b10;
      }
      function mD(a10, b10) {
        return void 0 !== b10.claims.iss ? mE(a10, b10) : b10;
      }
      function mE(a10, b10) {
        let c10 = a10[nc]?.(b10) ?? a10.issuer;
        if (b10.claims.iss !== c10) throw lS('unexpected JWT "iss" (issuer) claim value', m_, { expected: c10, claims: b10.claims, claim: "iss" });
        return b10;
      }
      let mF = /* @__PURE__ */ new WeakSet(), mG = Symbol();
      async function mH(a10, b10, c10, d10, e10, f10, g10) {
        if (l6(a10), l7(b10), !mF.has(d10)) throw lF('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', lD);
        l$(e10, '"redirectUri"');
        let h10 = m7(d10, "code");
        if (!h10) throw lS('no authorization code in "callbackParameters"', mV);
        let i10 = new URLSearchParams(g10?.additionalParameters);
        return i10.set("redirect_uri", e10), i10.set("code", h10), f10 !== mG && (l$(f10, '"codeVerifier"'), i10.set("code_verifier", f10)), mv(a10, b10, c10, "authorization_code", i10, g10);
      }
      let mI = { aud: "audience", c_hash: "code hash", client_id: "client id", exp: "expiration time", iat: "issued at", iss: "issuer", jti: "jwt id", nonce: "nonce", s_hash: "state hash", sub: "subject", ath: "access token hash", htm: "http method", htu: "http uri", cnf: "confirmation", auth_time: "authentication time" };
      function mJ(a10, b10) {
        for (let c10 of a10) if (void 0 === b10.claims[c10]) throw lS(`JWT "${c10}" (${mI[c10]}) claim missing`, mV, { claims: b10.claims });
        return b10;
      }
      let mK = Symbol(), mL = Symbol();
      async function mM(a10, b10, c10, d10) {
        return "string" == typeof d10?.expectedNonce || "number" == typeof d10?.maxAge || d10?.requireIdToken ? mN(a10, b10, c10, d10.expectedNonce, d10.maxAge, d10[lL], d10.recognizedTokenTypes) : mO(a10, b10, c10, d10?.[lL], d10?.recognizedTokenTypes);
      }
      async function mN(a10, b10, c10, d10, e10, f10, g10) {
        let h10 = [];
        switch (d10) {
          case void 0:
            d10 = mK;
            break;
          case mK:
            break;
          default:
            l$(d10, '"expectedNonce" argument'), h10.push("nonce");
        }
        switch (e10 ??= b10.default_max_age) {
          case void 0:
            e10 = mL;
            break;
          case mL:
            break;
          default:
            lZ(e10, true, '"maxAge" argument'), h10.push("auth_time");
        }
        let i10 = await mz(a10, b10, c10, h10, f10, g10);
        l$(i10.id_token, '"response" body "id_token" property', mV, { body: i10 });
        let j10 = my(i10);
        if (e10 !== mL) {
          let a11 = l5() + l3(b10), c11 = l4(b10);
          if (j10.auth_time + e10 < a11 - c11) throw lS("too much time has elapsed since the last End-User authentication", m$, { claims: j10, now: a11, tolerance: c11, claim: "auth_time" });
        }
        if (d10 === mK) {
          if (void 0 !== j10.nonce) throw lS('unexpected ID Token "nonce" claim value', m_, { expected: void 0, claims: j10, claim: "nonce" });
        } else if (j10.nonce !== d10) throw lS('unexpected ID Token "nonce" claim value', m_, { expected: d10, claims: j10, claim: "nonce" });
        return i10;
      }
      async function mO(a10, b10, c10, d10, e10) {
        let f10 = await mz(a10, b10, c10, void 0, d10, e10), g10 = my(f10);
        if (g10) {
          if (void 0 !== b10.default_max_age) {
            lZ(b10.default_max_age, true, '"client.default_max_age"');
            let a11 = l5() + l3(b10), c11 = l4(b10);
            if (g10.auth_time + b10.default_max_age < a11 - c11) throw lS("too much time has elapsed since the last End-User authentication", m$, { claims: g10, now: a11, tolerance: c11, claim: "auth_time" });
          }
          if (void 0 !== g10.nonce) throw lS('unexpected ID Token "nonce" claim value', m_, { expected: void 0, claims: g10, claim: "nonce" });
        }
        return f10;
      }
      let mP = "OAUTH_WWW_AUTHENTICATE_CHALLENGE", mQ = "OAUTH_RESPONSE_BODY_ERROR", mR = "OAUTH_UNSUPPORTED_OPERATION", mS = "OAUTH_AUTHORIZATION_RESPONSE_ERROR", mT = "OAUTH_JWT_USERINFO_EXPECTED", mU = "OAUTH_PARSE_ERROR", mV = "OAUTH_INVALID_RESPONSE", mW = "OAUTH_RESPONSE_IS_NOT_JSON", mX = "OAUTH_RESPONSE_IS_NOT_CONFORM", mY = "OAUTH_HTTP_REQUEST_FORBIDDEN", mZ = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN", m$ = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED", m_ = "OAUTH_JWT_CLAIM_COMPARISON_FAILED", m0 = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED", m1 = "OAUTH_MISSING_SERVER_METADATA", m2 = "OAUTH_INVALID_SERVER_METADATA";
      function m3(a10) {
        if (a10.bodyUsed) throw lF('"response" body has been used already', lD);
      }
      function m4(a10) {
        let { algorithm: b10 } = a10;
        if ("number" != typeof b10.modulusLength || b10.modulusLength < 2048) throw new lQ(`unsupported ${b10.name} modulusLength`, { cause: a10 });
      }
      async function m5(a10, b10, c10, d10, e10) {
        let f10, g10, { 0: h10, 1: i10, length: j10 } = a10.split(".");
        if (5 === j10) if (void 0 !== e10) a10 = await e10(a10), { 0: h10, 1: i10, length: j10 } = a10.split(".");
        else throw new lQ("JWE decryption is not configured", { cause: a10 });
        if (3 !== j10) throw lS("Invalid JWT", mV, a10);
        try {
          f10 = JSON.parse(lO(lP(h10)));
        } catch (a11) {
          throw lS("failed to parse JWT Header body as base64url encoded JSON", mU, a11);
        }
        if (!lT(f10)) throw lS("JWT Header must be a top level object", mV, a10);
        if (b10(f10), void 0 !== f10.crit) throw new lQ('no JWT "crit" header parameter extensions are supported', { cause: { header: f10 } });
        try {
          g10 = JSON.parse(lO(lP(i10)));
        } catch (a11) {
          throw lS("failed to parse JWT Payload body as base64url encoded JSON", mU, a11);
        }
        if (!lT(g10)) throw lS("JWT Payload must be a top level object", mV, a10);
        let k10 = l5() + c10;
        if (void 0 !== g10.exp) {
          if ("number" != typeof g10.exp) throw lS('unexpected JWT "exp" (expiration time) claim type', mV, { claims: g10 });
          if (g10.exp <= k10 - d10) throw lS('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', m$, { claims: g10, now: k10, tolerance: d10, claim: "exp" });
        }
        if (void 0 !== g10.iat && "number" != typeof g10.iat) throw lS('unexpected JWT "iat" (issued at) claim type', mV, { claims: g10 });
        if (void 0 !== g10.iss && "string" != typeof g10.iss) throw lS('unexpected JWT "iss" (issuer) claim type', mV, { claims: g10 });
        if (void 0 !== g10.nbf) {
          if ("number" != typeof g10.nbf) throw lS('unexpected JWT "nbf" (not before) claim type', mV, { claims: g10 });
          if (g10.nbf > k10 + d10) throw lS('unexpected JWT "nbf" (not before) claim value', m$, { claims: g10, now: k10, tolerance: d10, claim: "nbf" });
        }
        if (void 0 !== g10.aud && "string" != typeof g10.aud && !Array.isArray(g10.aud)) throw lS('unexpected JWT "aud" (audience) claim type', mV, { claims: g10 });
        return { header: f10, claims: g10, jwt: a10 };
      }
      function m6(a10, b10, c10, d10) {
        if (void 0 !== a10) {
          if ("string" == typeof a10 ? d10.alg !== a10 : !a10.includes(d10.alg)) throw lS('unexpected JWT "alg" header parameter', mV, { header: d10, expected: a10, reason: "client configuration" });
          return;
        }
        if (Array.isArray(b10)) {
          if (!b10.includes(d10.alg)) throw lS('unexpected JWT "alg" header parameter', mV, { header: d10, expected: b10, reason: "authorization server metadata" });
          return;
        }
        if (void 0 !== c10) {
          if ("string" == typeof c10 ? d10.alg !== c10 : "function" == typeof c10 ? !c10(d10.alg) : !c10.includes(d10.alg)) throw lS('unexpected JWT "alg" header parameter', mV, { header: d10, expected: c10, reason: "default value" });
          return;
        }
        throw lS('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client: a10, issuer: b10, fallback: c10 });
      }
      function m7(a10, b10) {
        let { 0: c10, length: d10 } = a10.getAll(b10);
        if (d10 > 1) throw lS(`"${b10}" parameter must be provided only once`, mV);
        return c10;
      }
      let m8 = Symbol(), m9 = Symbol();
      async function na(a10, b10 = l0) {
        let c10;
        try {
          c10 = await a10.json();
        } catch (c11) {
          throw b10(a10), lS('failed to parse "response" body as JSON', mU, c11);
        }
        if (!lT(c10)) throw lS('"response" body must be a top level object', mV, { body: c10 });
        return c10;
      }
      let nb = Symbol(), nc = Symbol();
      async function nd(a10, b10, c10) {
        let { cookies: d10, logger: e10 } = c10, f10 = d10[a10], g10 = /* @__PURE__ */ new Date();
        g10.setTime(g10.getTime() + 9e5), e10.debug(`CREATE_${a10.toUpperCase()}`, { name: f10.name, payload: b10, COOKIE_TTL: 900, expires: g10 });
        let h10 = await j6({ ...c10.jwt, maxAge: 900, token: { value: b10 }, salt: f10.name }), i10 = { ...f10.options, expires: g10 };
        return { name: f10.name, value: h10, options: i10 };
      }
      async function ne(a10, b10, c10) {
        try {
          let { logger: d10, cookies: e10, jwt: f10 } = c10;
          if (d10.debug(`PARSE_${a10.toUpperCase()}`, { cookie: b10 }), !b10) throw new hK(`${a10} cookie was missing`);
          let g10 = await j7({ ...f10, token: b10, salt: e10[a10].name });
          if (g10?.value) return g10.value;
          throw Error("Invalid cookie");
        } catch (b11) {
          throw new hK(`${a10} value could not be parsed`, { cause: b11 });
        }
      }
      function nf(a10, b10, c10) {
        let { logger: d10, cookies: e10 } = b10, f10 = e10[a10];
        d10.debug(`CLEAR_${a10.toUpperCase()}`, { cookie: f10 }), c10.push({ name: f10.name, value: "", options: { ...e10[a10].options, maxAge: 0 } });
      }
      function ng(a10, b10) {
        return async function(c10, d10, e10) {
          let { provider: f10, logger: g10 } = e10;
          if (!f10?.checks?.includes(a10)) return;
          let h10 = c10?.[e10.cookies[b10].name];
          g10.debug(`USE_${b10.toUpperCase()}`, { value: h10 });
          let i10 = await ne(b10, h10, e10);
          return nf(b10, e10, d10), i10;
        };
      }
      let nh = { async create(a10) {
        let b10 = l1(), c10 = await l2(b10);
        return { cookie: await nd("pkceCodeVerifier", b10, a10), value: c10 };
      }, use: ng("pkce", "pkceCodeVerifier") }, ni = "encodedState", nj = { async create(a10, b10) {
        let { provider: c10 } = a10;
        if (!c10.checks.includes("state")) {
          if (b10) throw new hK("State data was provided but the provider is not configured to use state");
          return;
        }
        let d10 = { origin: b10, random: l1() }, e10 = await j6({ secret: a10.jwt.secret, token: d10, salt: ni, maxAge: 900 });
        return { cookie: await nd("state", e10, a10), value: e10 };
      }, use: ng("state", "state"), async decode(a10, b10) {
        try {
          b10.logger.debug("DECODE_STATE", { state: a10 });
          let c10 = await j7({ secret: b10.jwt.secret, token: a10, salt: ni });
          if (c10) return c10;
          throw Error("Invalid state");
        } catch (a11) {
          throw new hK("State could not be decoded", { cause: a11 });
        }
      } }, nk = { async create(a10) {
        if (!a10.provider.checks.includes("nonce")) return;
        let b10 = l1();
        return { cookie: await nd("nonce", b10, a10), value: b10 };
      }, use: ng("nonce", "nonce") }, nl = "encodedWebauthnChallenge", nm = { create: async (a10, b10, c10) => ({ cookie: await nd("webauthnChallenge", await j6({ secret: a10.jwt.secret, token: { challenge: b10, registerData: c10 }, salt: nl, maxAge: 900 }), a10) }), async use(a10, b10, c10) {
        let d10 = b10?.[a10.cookies.webauthnChallenge.name], e10 = await ne("webauthnChallenge", d10, a10), f10 = await j7({ secret: a10.jwt.secret, token: e10, salt: nl });
        if (nf("webauthnChallenge", a10, c10), !f10) throw new hK("WebAuthn challenge was missing");
        return f10;
      } };
      function nn(a10) {
        return encodeURIComponent(a10).replace(/%20/g, "+");
      }
      async function no(a10, b10, c10) {
        let d10, e10, f10, { logger: g10, provider: h10 } = c10, { token: i10, userinfo: j10 } = h10;
        if (i10?.url && "authjs.dev" !== i10.url.host || j10?.url && "authjs.dev" !== j10.url.host) d10 = { issuer: h10.issuer ?? "https://authjs.dev", token_endpoint: i10?.url.toString(), userinfo_endpoint: j10?.url.toString() };
        else {
          let a11 = new URL(h10.issuer), b11 = await lY(a11, { [lG]: true, [lJ]: h10[ks] });
          if (!(d10 = await l_(a11, b11)).token_endpoint) throw TypeError("TODO: Authorization server did not provide a token endpoint.");
          if (!d10.userinfo_endpoint) throw TypeError("TODO: Authorization server did not provide a userinfo endpoint.");
        }
        let k10 = { client_id: h10.clientId, ...h10.client };
        switch (k10.token_endpoint_auth_method) {
          case void 0:
          case "client_secret_basic":
            e10 = (a11, b11, c11, d11) => {
              d11.set("authorization", function(a12, b12) {
                let c12 = nn(a12), d12 = nn(b12), e11 = btoa(`${c12}:${d12}`);
                return `Basic ${e11}`;
              }(h10.clientId, h10.clientSecret));
            };
            break;
          case "client_secret_post":
            var l10;
            l$(l10 = h10.clientSecret, '"clientSecret"'), e10 = (a11, b11, c11, d11) => {
              c11.set("client_id", b11.client_id), c11.set("client_secret", l10);
            };
            break;
          case "client_secret_jwt":
            e10 = function(a11, b11) {
              let c11;
              l$(a11, '"clientSecret"');
              let d11 = void 0;
              return async (b12, e11, f11, g11) => {
                c11 ||= await crypto.subtle.importKey("raw", lO(a11), { hash: "SHA-256", name: "HMAC" }, false, ["sign"]);
                let h11 = { alg: "HS256" }, i11 = l8(b12, e11);
                d11?.(h11, i11);
                let j11 = `${lP(lO(JSON.stringify(h11)))}.${lP(lO(JSON.stringify(i11)))}`, k11 = await crypto.subtle.sign(c11.algorithm, c11, lO(j11));
                f11.set("client_id", e11.client_id), f11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), f11.set("client_assertion", `${j11}.${lP(new Uint8Array(k11))}`);
              };
            }(h10.clientSecret);
            break;
          case "private_key_jwt":
            e10 = function(a11, b11) {
              let { key: c11, kid: d11 } = a11 instanceof CryptoKey ? { key: a11 } : a11?.key instanceof CryptoKey ? (void 0 !== a11.kid && l$(a11.kid, '"kid"'), { key: a11.key, kid: a11.kid }) : {};
              var e11 = '"clientPrivateKey.key"';
              if (!(c11 instanceof CryptoKey)) throw lF(`${e11} must be a CryptoKey`, lE);
              if ("private" !== c11.type) throw lF(`${e11} must be a private CryptoKey`, lD);
              return async (a12, e12, f11, g11) => {
                let h11 = { alg: function(a13) {
                  switch (a13.algorithm.name) {
                    case "RSA-PSS":
                      switch (a13.algorithm.hash.name) {
                        case "SHA-256":
                          return "PS256";
                        case "SHA-384":
                          return "PS384";
                        case "SHA-512":
                          return "PS512";
                        default:
                          throw new lQ("unsupported RsaHashedKeyAlgorithm hash name", { cause: a13 });
                      }
                    case "RSASSA-PKCS1-v1_5":
                      switch (a13.algorithm.hash.name) {
                        case "SHA-256":
                          return "RS256";
                        case "SHA-384":
                          return "RS384";
                        case "SHA-512":
                          return "RS512";
                        default:
                          throw new lQ("unsupported RsaHashedKeyAlgorithm hash name", { cause: a13 });
                      }
                    case "ECDSA":
                      switch (a13.algorithm.namedCurve) {
                        case "P-256":
                          return "ES256";
                        case "P-384":
                          return "ES384";
                        case "P-521":
                          return "ES512";
                        default:
                          throw new lQ("unsupported EcKeyAlgorithm namedCurve", { cause: a13 });
                      }
                    case "Ed25519":
                    case "ML-DSA-44":
                    case "ML-DSA-65":
                    case "ML-DSA-87":
                      return a13.algorithm.name;
                    case "EdDSA":
                      return "Ed25519";
                    default:
                      throw new lQ("unsupported CryptoKey algorithm name", { cause: a13 });
                  }
                }(c11), kid: d11 }, i11 = l8(a12, e12);
                b11?.[lK]?.(h11, i11), f11.set("client_id", e12.client_id), f11.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), f11.set("client_assertion", await l9(h11, i11, c11));
              };
            }(h10.token.clientPrivateKey, { [lK](a11, b11) {
              b11.aud = [d10.issuer, d10.token_endpoint];
            } });
            break;
          case "none":
            e10 = (a11, b11, c11, d11) => {
              c11.set("client_id", b11.client_id);
            };
            break;
          default:
            throw Error("unsupported client authentication method");
        }
        let m10 = [], n10 = await nj.use(b10, m10, c10);
        try {
          f10 = function(a11, b11, c11, d11) {
            var e11;
            if (l6(a11), l7(b11), c11 instanceof URL && (c11 = c11.searchParams), !(c11 instanceof URLSearchParams)) throw lF('"parameters" must be an instance of URLSearchParams, or URL', lE);
            if (m7(c11, "response")) throw lS('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', mV, { parameters: c11 });
            let f11 = m7(c11, "iss"), g11 = m7(c11, "state");
            if (!f11 && a11.authorization_response_iss_parameter_supported) throw lS('response parameter "iss" (issuer) missing', mV, { parameters: c11 });
            if (f11 && f11 !== a11.issuer) throw lS('unexpected "iss" (issuer) response parameter value', mV, { expected: a11.issuer, parameters: c11 });
            switch (d11) {
              case void 0:
              case m9:
                if (void 0 !== g11) throw lS('unexpected "state" response parameter encountered', mV, { expected: void 0, parameters: c11 });
                break;
              case m8:
                break;
              default:
                if (l$(d11, '"expectedState" argument'), g11 !== d11) throw lS(void 0 === g11 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', mV, { expected: d11, parameters: c11 });
            }
            if (m7(c11, "error")) throw new mf("authorization response from the server is an error", { cause: c11 });
            let h11 = m7(c11, "id_token"), i11 = m7(c11, "token");
            if (void 0 !== h11 || void 0 !== i11) throw new lQ("implicit and hybrid flows are not supported");
            return e11 = new URLSearchParams(c11), mF.add(e11), e11;
          }(d10, k10, new URLSearchParams(a10), h10.checks.includes("state") ? n10 : m8);
        } catch (a11) {
          if (a11 instanceof mf) {
            let b11 = { providerId: h10.id, ...Object.fromEntries(a11.cause.entries()) };
            throw g10.debug("OAuthCallbackError", b11), new hR("OAuth Provider returned an error", b11);
          }
          throw a11;
        }
        let o10 = await nh.use(b10, m10, c10), p10 = h10.callbackUrl;
        !c10.isOnRedirectProxy && h10.redirectProxyUrl && (p10 = h10.redirectProxyUrl);
        let q3 = await mH(d10, k10, e10, f10, p10, o10 ?? "decoy", { [lG]: true, [lJ]: (...a11) => (h10.checks.includes("pkce") || a11[1].body.delete("code_verifier"), (h10[ks] ?? fetch)(...a11)) });
        h10.token?.conform && (q3 = await h10.token.conform(q3.clone()) ?? q3);
        let r2 = {}, s2 = "oidc" === h10.type;
        if (h10[kt]) switch (h10.id) {
          case "microsoft-entra-id":
          case "azure-ad": {
            let a11 = await q3.clone().json();
            if (a11.error) {
              let b12 = { providerId: h10.id, ...a11 };
              throw new hR(`OAuth Provider returned an error: ${a11.error}`, b12);
            }
            let { tid: b11 } = function(a12) {
              let b12, c11;
              if ("string" != typeof a12) throw new iE("JWTs must use Compact JWS serialization, JWT must be a string");
              let { 1: d11, length: e11 } = a12.split(".");
              if (5 === e11) throw new iE("Only JWTs using Compact JWS serialization can be decoded");
              if (3 !== e11) throw new iE("Invalid JWT");
              if (!d11) throw new iE("JWTs must contain a payload");
              try {
                b12 = ir(d11);
              } catch {
                throw new iE("Failed to base64url decode the payload");
              }
              try {
                c11 = JSON.parse(ik.decode(b12));
              } catch {
                throw new iE("Failed to parse the decoded payload as JSON");
              }
              if (!iL(c11)) throw new iE("Invalid JWT Claims Set");
              return c11;
            }(a11.id_token);
            if ("string" == typeof b11) {
              let a12 = d10.issuer?.match(/microsoftonline\.com\/(\w+)\/v2\.0/)?.[1] ?? "common", c11 = new URL(d10.issuer.replace(a12, b11)), e11 = await lY(c11, { [lJ]: h10[ks] });
              d10 = await l_(c11, e11);
            }
          }
        }
        let t2 = await mM(d10, k10, q3, { expectedNonce: await nk.use(b10, m10, c10), requireIdToken: s2 });
        if (s2) {
          let b11 = my(t2);
          if (r2 = b11, h10[kt] && "apple" === h10.id) try {
            r2.user = JSON.parse(a10?.user);
          } catch {
          }
          if (false === h10.idToken) {
            let a11 = await mq(d10, k10, t2.access_token, { [lJ]: h10[ks], [lG]: true });
            r2 = await mt(d10, k10, b11.sub, a11);
          }
        } else if (j10?.request) {
          let a11 = await j10.request({ tokens: t2, provider: h10 });
          a11 instanceof Object && (r2 = a11);
        } else if (j10?.url) {
          let a11 = await mq(d10, k10, t2.access_token, { [lJ]: h10[ks], [lG]: true });
          r2 = await a11.json();
        } else throw TypeError("No userinfo endpoint configured");
        return t2.expires_in && (t2.expires_at = Math.floor(Date.now() / 1e3) + Number(t2.expires_in)), { ...await np(r2, h10, t2, g10), profile: r2, cookies: m10 };
      }
      async function np(a10, b10, c10, d10) {
        try {
          let d11 = await b10.profile(a10, c10);
          return { user: { ...d11, id: crypto.randomUUID(), email: d11.email?.toLowerCase() }, account: { ...c10, provider: b10.id, type: b10.type, providerAccountId: d11.id ?? crypto.randomUUID() } };
        } catch (c11) {
          d10.debug("getProfile error details", a10), d10.error(new hS(c11, { provider: b10.id }));
        }
      }
      var nq = c(356).Buffer;
      async function nr(a10, b10, c10, d10) {
        let e10 = await nw(a10, b10, c10), { cookie: f10 } = await nm.create(a10, e10.challenge, c10);
        return { status: 200, cookies: [...d10 ?? [], f10], body: { action: "register", options: e10 }, headers: { "Content-Type": "application/json" } };
      }
      async function ns(a10, b10, c10, d10) {
        let e10 = await nv(a10, b10, c10), { cookie: f10 } = await nm.create(a10, e10.challenge);
        return { status: 200, cookies: [...d10 ?? [], f10], body: { action: "authenticate", options: e10 }, headers: { "Content-Type": "application/json" } };
      }
      async function nt(a10, b10, c10) {
        let d10, { adapter: e10, provider: f10 } = a10, g10 = b10.body && "string" == typeof b10.body.data ? JSON.parse(b10.body.data) : void 0;
        if (!g10 || "object" != typeof g10 || !("id" in g10) || "string" != typeof g10.id) throw new hA("Invalid WebAuthn Authentication response");
        let h10 = nz(ny(g10.id)), i10 = await e10.getAuthenticator(h10);
        if (!i10) throw new hA(`WebAuthn authenticator not found in database: ${JSON.stringify({ credentialID: h10 })}`);
        let { challenge: j10 } = await nm.use(a10, b10.cookies, c10);
        try {
          var k10;
          let c11 = f10.getRelayingParty(a10, b10);
          d10 = await f10.simpleWebAuthn.verifyAuthenticationResponse({ ...f10.verifyAuthenticationOptions, expectedChallenge: j10, response: g10, authenticator: { ...k10 = i10, credentialDeviceType: k10.credentialDeviceType, transports: nA(k10.transports), credentialID: ny(k10.credentialID), credentialPublicKey: ny(k10.credentialPublicKey) }, expectedOrigin: c11.origin, expectedRPID: c11.id });
        } catch (a11) {
          throw new h4(a11);
        }
        let { verified: l10, authenticationInfo: m10 } = d10;
        if (!l10) throw new h4("WebAuthn authentication response could not be verified");
        try {
          let { newCounter: a11 } = m10;
          await e10.updateAuthenticatorCounter(i10.credentialID, a11);
        } catch (a11) {
          throw new hC(`Failed to update authenticator counter. This may cause future authentication attempts to fail. ${JSON.stringify({ credentialID: h10, oldCounter: i10.counter, newCounter: m10.newCounter })}`, a11);
        }
        let n10 = await e10.getAccount(i10.providerAccountId, f10.id);
        if (!n10) throw new hA(`WebAuthn account not found in database: ${JSON.stringify({ credentialID: h10, providerAccountId: i10.providerAccountId })}`);
        let o10 = await e10.getUser(n10.userId);
        if (!o10) throw new hA(`WebAuthn user not found in database: ${JSON.stringify({ credentialID: h10, providerAccountId: i10.providerAccountId, userID: n10.userId })}`);
        return { account: n10, user: o10 };
      }
      async function nu(a10, b10, c10) {
        var d10;
        let e10, { provider: f10 } = a10, g10 = b10.body && "string" == typeof b10.body.data ? JSON.parse(b10.body.data) : void 0;
        if (!g10 || "object" != typeof g10 || !("id" in g10) || "string" != typeof g10.id) throw new hA("Invalid WebAuthn Registration response");
        let { challenge: h10, registerData: i10 } = await nm.use(a10, b10.cookies, c10);
        if (!i10) throw new hA("Missing user registration data in WebAuthn challenge cookie");
        try {
          let c11 = f10.getRelayingParty(a10, b10);
          e10 = await f10.simpleWebAuthn.verifyRegistrationResponse({ ...f10.verifyRegistrationOptions, expectedChallenge: h10, response: g10, expectedOrigin: c11.origin, expectedRPID: c11.id });
        } catch (a11) {
          throw new h4(a11);
        }
        if (!e10.verified || !e10.registrationInfo) throw new h4("WebAuthn registration response could not be verified");
        let j10 = { providerAccountId: nz(e10.registrationInfo.credentialID), provider: a10.provider.id, type: f10.type }, k10 = { providerAccountId: j10.providerAccountId, counter: e10.registrationInfo.counter, credentialID: nz(e10.registrationInfo.credentialID), credentialPublicKey: nz(e10.registrationInfo.credentialPublicKey), credentialBackedUp: e10.registrationInfo.credentialBackedUp, credentialDeviceType: e10.registrationInfo.credentialDeviceType, transports: (d10 = g10.response.transports, d10?.join(",")) };
        return { user: i10, account: j10, authenticator: k10 };
      }
      async function nv(a10, b10, c10) {
        let { provider: d10, adapter: e10 } = a10, f10 = c10 && c10.id ? await e10.listAuthenticatorsByUserId(c10.id) : null, g10 = d10.getRelayingParty(a10, b10);
        return await d10.simpleWebAuthn.generateAuthenticationOptions({ ...d10.authenticationOptions, rpID: g10.id, allowCredentials: f10?.map((a11) => ({ id: ny(a11.credentialID), type: "public-key", transports: nA(a11.transports) })) });
      }
      async function nw(a10, b10, c10) {
        let { provider: d10, adapter: e10 } = a10, f10 = c10.id ? await e10.listAuthenticatorsByUserId(c10.id) : null, g10 = kl(32), h10 = d10.getRelayingParty(a10, b10);
        return await d10.simpleWebAuthn.generateRegistrationOptions({ ...d10.registrationOptions, userID: g10, userName: c10.email, userDisplayName: c10.name ?? void 0, rpID: h10.id, rpName: h10.name, excludeCredentials: f10?.map((a11) => ({ id: ny(a11.credentialID), type: "public-key", transports: nA(a11.transports) })) });
      }
      function nx(a10) {
        let { provider: b10, adapter: c10 } = a10;
        if (!c10) throw new hM("An adapter is required for the WebAuthn provider");
        if (!b10 || "webauthn" !== b10.type) throw new hZ("Provider must be WebAuthn");
        return { ...a10, provider: b10, adapter: c10 };
      }
      function ny(a10) {
        return new Uint8Array(nq.from(a10, "base64"));
      }
      function nz(a10) {
        return nq.from(a10).toString("base64");
      }
      function nA(a10) {
        return a10 ? a10.split(",") : void 0;
      }
      async function nB(a10, b10, c10, d10) {
        if (!b10.provider) throw new hZ("Callback route called without provider");
        let { query: e10, body: f10, method: g10, headers: h10 } = a10, { provider: i10, adapter: j10, url: k10, callbackUrl: l10, pages: m10, jwt: n10, events: o10, callbacks: p10, session: { strategy: q3, maxAge: r2 }, logger: s2 } = b10, t2 = "jwt" === q3;
        try {
          if ("oauth" === i10.type || "oidc" === i10.type) {
            let g11, h11 = i10.authorization?.url.searchParams.get("response_mode") === "form_post" ? f10 : e10;
            if (b10.isOnRedirectProxy && h11?.state) {
              let a11 = await nj.decode(h11.state, b10);
              if (a11?.origin && new URL(a11.origin).origin !== b10.url.origin) {
                let b11 = `${a11.origin}?${new URLSearchParams(h11)}`;
                return s2.debug("Proxy redirecting to", b11), { redirect: b11, cookies: d10 };
              }
            }
            let q4 = await no(h11, a10.cookies, b10);
            q4.cookies.length && d10.push(...q4.cookies), s2.debug("authorization result", q4);
            let { user: u2, account: v2, profile: w2 } = q4;
            if (!u2 || !v2 || !w2) return { redirect: `${k10}/signin`, cookies: d10 };
            if (j10) {
              let { getUserByAccount: a11 } = j10;
              g11 = await a11({ providerAccountId: v2.providerAccountId, provider: i10.id });
            }
            let x2 = await nC({ user: g11 ?? u2, account: v2, profile: w2 }, b10);
            if (x2) return { redirect: x2, cookies: d10 };
            let { user: y2, session: z2, isNewUser: A2 } = await lB(c10.value, u2, v2, b10);
            if (t2) {
              let a11 = { name: y2.name, email: y2.email, picture: y2.image, sub: y2.id?.toString() }, e11 = await p10.jwt({ token: a11, user: y2, account: v2, profile: w2, isNewUser: A2, trigger: A2 ? "signUp" : "signIn" });
              if (null === e11) d10.push(...c10.clean());
              else {
                let a12 = b10.cookies.sessionToken.name, f11 = await n10.encode({ ...n10, token: e11, salt: a12 }), g12 = /* @__PURE__ */ new Date();
                g12.setTime(g12.getTime() + 1e3 * r2);
                let h12 = c10.chunk(f11, { expires: g12 });
                d10.push(...h12);
              }
            } else d10.push({ name: b10.cookies.sessionToken.name, value: z2.sessionToken, options: { ...b10.cookies.sessionToken.options, expires: z2.expires } });
            if (await o10.signIn?.({ user: y2, account: v2, profile: w2, isNewUser: A2 }), A2 && m10.newUser) return { redirect: `${m10.newUser}${m10.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: l10 })}`, cookies: d10 };
            return { redirect: l10, cookies: d10 };
          }
          if ("email" === i10.type) {
            let a11 = e10?.token, f11 = e10?.email;
            if (!a11) {
              let b11 = TypeError("Missing token. The sign-in URL was manually opened without token or the link was not sent correctly in the email.", { cause: { hasToken: !!a11 } });
              throw b11.name = "Configuration", b11;
            }
            let g11 = i10.secret ?? b10.secret, h11 = await j10.useVerificationToken({ identifier: f11, token: await kk(`${a11}${g11}`) }), k11 = !!h11, q4 = k11 && h11.expires.valueOf() < Date.now();
            if (!k11 || q4 || f11 && h11.identifier !== f11) throw new h_({ hasInvite: k11, expired: q4 });
            let { identifier: s3 } = h11, u2 = await j10.getUserByEmail(s3) ?? { id: crypto.randomUUID(), email: s3, emailVerified: null }, v2 = { providerAccountId: u2.email, userId: u2.id, type: "email", provider: i10.id }, w2 = await nC({ user: u2, account: v2 }, b10);
            if (w2) return { redirect: w2, cookies: d10 };
            let { user: x2, session: y2, isNewUser: z2 } = await lB(c10.value, u2, v2, b10);
            if (t2) {
              let a12 = { name: x2.name, email: x2.email, picture: x2.image, sub: x2.id?.toString() }, e11 = await p10.jwt({ token: a12, user: x2, account: v2, isNewUser: z2, trigger: z2 ? "signUp" : "signIn" });
              if (null === e11) d10.push(...c10.clean());
              else {
                let a13 = b10.cookies.sessionToken.name, f12 = await n10.encode({ ...n10, token: e11, salt: a13 }), g12 = /* @__PURE__ */ new Date();
                g12.setTime(g12.getTime() + 1e3 * r2);
                let h12 = c10.chunk(f12, { expires: g12 });
                d10.push(...h12);
              }
            } else d10.push({ name: b10.cookies.sessionToken.name, value: y2.sessionToken, options: { ...b10.cookies.sessionToken.options, expires: y2.expires } });
            if (await o10.signIn?.({ user: x2, account: v2, isNewUser: z2 }), z2 && m10.newUser) return { redirect: `${m10.newUser}${m10.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: l10 })}`, cookies: d10 };
            return { redirect: l10, cookies: d10 };
          }
          if ("credentials" === i10.type && "POST" === g10) {
            let a11 = f10 ?? {};
            Object.entries(e10 ?? {}).forEach(([a12, b11]) => k10.searchParams.set(a12, b11));
            let j11 = await i10.authorize(a11, new Request(k10, { headers: h10, method: g10, body: JSON.stringify(f10) }));
            if (j11) j11.id = j11.id?.toString() ?? crypto.randomUUID();
            else throw new hI();
            let m11 = { providerAccountId: j11.id, type: "credentials", provider: i10.id }, q4 = await nC({ user: j11, account: m11, credentials: a11 }, b10);
            if (q4) return { redirect: q4, cookies: d10 };
            let s3 = { name: j11.name, email: j11.email, picture: j11.image, sub: j11.id }, t3 = await p10.jwt({ token: s3, user: j11, account: m11, isNewUser: false, trigger: "signIn" });
            if (null === t3) d10.push(...c10.clean());
            else {
              let a12 = b10.cookies.sessionToken.name, e11 = await n10.encode({ ...n10, token: t3, salt: a12 }), f11 = /* @__PURE__ */ new Date();
              f11.setTime(f11.getTime() + 1e3 * r2);
              let g11 = c10.chunk(e11, { expires: f11 });
              d10.push(...g11);
            }
            return await o10.signIn?.({ user: j11, account: m11 }), { redirect: l10, cookies: d10 };
          } else if ("webauthn" === i10.type && "POST" === g10) {
            let e11, f11, g11, h11 = a10.body?.action;
            if ("string" != typeof h11 || "authenticate" !== h11 && "register" !== h11) throw new hA("Invalid action parameter");
            let i11 = nx(b10);
            switch (h11) {
              case "authenticate": {
                let b11 = await nt(i11, a10, d10);
                e11 = b11.user, f11 = b11.account;
                break;
              }
              case "register": {
                let c11 = await nu(b10, a10, d10);
                e11 = c11.user, f11 = c11.account, g11 = c11.authenticator;
              }
            }
            await nC({ user: e11, account: f11 }, b10);
            let { user: j11, isNewUser: k11, session: q4, account: s3 } = await lB(c10.value, e11, f11, b10);
            if (!s3) throw new hA("Error creating or finding account");
            if (g11 && j11.id && await i11.adapter.createAuthenticator({ ...g11, userId: j11.id }), t2) {
              let a11 = { name: j11.name, email: j11.email, picture: j11.image, sub: j11.id?.toString() }, e12 = await p10.jwt({ token: a11, user: j11, account: s3, isNewUser: k11, trigger: k11 ? "signUp" : "signIn" });
              if (null === e12) d10.push(...c10.clean());
              else {
                let a12 = b10.cookies.sessionToken.name, f12 = await n10.encode({ ...n10, token: e12, salt: a12 }), g12 = /* @__PURE__ */ new Date();
                g12.setTime(g12.getTime() + 1e3 * r2);
                let h12 = c10.chunk(f12, { expires: g12 });
                d10.push(...h12);
              }
            } else d10.push({ name: b10.cookies.sessionToken.name, value: q4.sessionToken, options: { ...b10.cookies.sessionToken.options, expires: q4.expires } });
            if (await o10.signIn?.({ user: j11, account: s3, isNewUser: k11 }), k11 && m10.newUser) return { redirect: `${m10.newUser}${m10.newUser.includes("?") ? "&" : "?"}${new URLSearchParams({ callbackUrl: l10 })}`, cookies: d10 };
            return { redirect: l10, cookies: d10 };
          }
          throw new hZ(`Callback for provider type (${i10.type}) is not supported`);
        } catch (b11) {
          if (b11 instanceof hA) throw b11;
          let a11 = new hE(b11, { provider: i10.id });
          throw s2.debug("callback route error details", { method: g10, query: e10, body: f10 }), a11;
        }
      }
      async function nC(a10, b10) {
        let c10, { signIn: d10, redirect: e10 } = b10.callbacks;
        try {
          c10 = await d10(a10);
        } catch (a11) {
          if (a11 instanceof hA) throw a11;
          throw new hD(a11);
        }
        if (!c10) throw new hD("AccessDenied");
        if ("string" == typeof c10) return await e10({ url: c10, baseUrl: b10.url.origin });
      }
      async function nD(a10, b10, c10, d10, e10) {
        let { adapter: f10, jwt: g10, events: h10, callbacks: i10, logger: j10, session: { strategy: k10, maxAge: l10 } } = a10, m10 = { body: null, headers: { "Content-Type": "application/json", ...!d10 && { "Cache-Control": "private, no-cache, no-store", Expires: "0", Pragma: "no-cache" } }, cookies: c10 }, n10 = b10.value;
        if (!n10) return m10;
        if ("jwt" === k10) {
          try {
            let c11 = a10.cookies.sessionToken.name, f11 = await g10.decode({ ...g10, token: n10, salt: c11 });
            if (!f11) throw Error("Invalid JWT");
            let j11 = await i10.jwt({ token: f11, ...d10 && { trigger: "update" }, session: e10 }), k11 = lA(l10);
            if (null !== j11) {
              let a11 = { user: { name: j11.name, email: j11.email, image: j11.picture }, expires: k11.toISOString() }, d11 = await i10.session({ session: a11, token: j11 });
              m10.body = d11;
              let e11 = await g10.encode({ ...g10, token: j11, salt: c11 }), f12 = b10.chunk(e11, { expires: k11 });
              m10.cookies?.push(...f12), await h10.session?.({ session: d11, token: j11 });
            } else m10.cookies?.push(...b10.clean());
          } catch (a11) {
            j10.error(new hL(a11)), m10.cookies?.push(...b10.clean());
          }
          return m10;
        }
        try {
          let { getSessionAndUser: c11, deleteSession: g11, updateSession: j11 } = f10, k11 = await c11(n10);
          if (k11 && k11.session.expires.valueOf() < Date.now() && (await g11(n10), k11 = null), k11) {
            let { user: b11, session: c12 } = k11, f11 = a10.session.updateAge, g12 = c12.expires.valueOf() - 1e3 * l10 + 1e3 * f11, o10 = lA(l10);
            g12 <= Date.now() && await j11({ sessionToken: n10, expires: o10 });
            let p10 = await i10.session({ session: { ...c12, user: b11 }, user: b11, newSession: e10, ...d10 ? { trigger: "update" } : {} });
            m10.body = p10, m10.cookies?.push({ name: a10.cookies.sessionToken.name, value: n10, options: { ...a10.cookies.sessionToken.options, expires: o10 } }), await h10.session?.({ session: p10 });
          } else n10 && m10.cookies?.push(...b10.clean());
        } catch (a11) {
          j10.error(new hT(a11));
        }
        return m10;
      }
      async function nE(a10, b10) {
        let c10, d10, { logger: e10, provider: f10 } = b10, g10 = f10.authorization?.url;
        if (!g10 || "authjs.dev" === g10.host) {
          let a11 = new URL(f10.issuer), b11 = await lY(a11, { [lJ]: f10[ks], [lG]: true }), c11 = await l_(a11, b11).catch((b12) => {
            if (!(b12 instanceof TypeError) || "Invalid URL" !== b12.message) throw b12;
            throw TypeError(`Discovery request responded with an invalid issuer. expected: ${a11}`);
          });
          if (!c11.authorization_endpoint) throw TypeError("Authorization server did not provide an authorization endpoint.");
          g10 = new URL(c11.authorization_endpoint);
        }
        let h10 = g10.searchParams, i10 = f10.callbackUrl;
        !b10.isOnRedirectProxy && f10.redirectProxyUrl && (i10 = f10.redirectProxyUrl, d10 = f10.callbackUrl, e10.debug("using redirect proxy", { redirect_uri: i10, data: d10 }));
        let j10 = Object.assign({ response_type: "code", client_id: f10.clientId, redirect_uri: i10, ...f10.authorization?.params }, Object.fromEntries(f10.authorization?.url.searchParams ?? []), a10);
        for (let a11 in j10) h10.set(a11, j10[a11]);
        let k10 = [];
        f10.authorization?.url.searchParams.get("response_mode") === "form_post" && (b10.cookies.state.options.sameSite = "none", b10.cookies.state.options.secure = true, b10.cookies.nonce.options.sameSite = "none", b10.cookies.nonce.options.secure = true);
        let l10 = await nj.create(b10, d10);
        if (l10 && (h10.set("state", l10.value), k10.push(l10.cookie)), f10.checks?.includes("pkce")) if (c10 && !c10.code_challenge_methods_supported?.includes("S256")) "oidc" === f10.type && (f10.checks = ["nonce"]);
        else {
          let { value: a11, cookie: c11 } = await nh.create(b10);
          h10.set("code_challenge", a11), h10.set("code_challenge_method", "S256"), k10.push(c11);
        }
        let m10 = await nk.create(b10);
        return m10 && (h10.set("nonce", m10.value), k10.push(m10.cookie)), "oidc" !== f10.type || g10.searchParams.has("scope") || g10.searchParams.set("scope", "openid profile email"), e10.debug("authorization url is ready", { url: g10, cookies: k10, provider: f10 }), { redirect: g10.toString(), cookies: k10 };
      }
      async function nF(a10, b10) {
        let c10, { body: d10 } = a10, { provider: e10, callbacks: f10, adapter: g10 } = b10, h10 = (e10.normalizeIdentifier ?? function(a11) {
          if (!a11) throw Error("Missing email from request body.");
          let [b11, c11] = a11.toLowerCase().trim().split("@");
          return c11 = c11.split(",")[0], `${b11}@${c11}`;
        })(d10?.email), i10 = { id: crypto.randomUUID(), email: h10, emailVerified: null }, j10 = await g10.getUserByEmail(h10) ?? i10, k10 = { providerAccountId: h10, userId: j10.id, type: "email", provider: e10.id };
        try {
          c10 = await f10.signIn({ user: j10, account: k10, email: { verificationRequest: true } });
        } catch (a11) {
          throw new hD(a11);
        }
        if (!c10) throw new hD("AccessDenied");
        if ("string" == typeof c10) return { redirect: await f10.redirect({ url: c10, baseUrl: b10.url.origin }) };
        let { callbackUrl: l10, theme: m10 } = b10, n10 = await e10.generateVerificationToken?.() ?? kl(32), o10 = new Date(Date.now() + (e10.maxAge ?? 86400) * 1e3), p10 = e10.secret ?? b10.secret, q3 = new URL(b10.basePath, b10.url.origin), r2 = e10.sendVerificationRequest({ identifier: h10, token: n10, expires: o10, url: `${q3}/callback/${e10.id}?${new URLSearchParams({ callbackUrl: l10, token: n10, email: h10 })}`, provider: e10, theme: m10, request: new Request(a10.url, { headers: a10.headers, method: a10.method, body: "POST" === a10.method ? JSON.stringify(a10.body ?? {}) : void 0 }) }), s2 = g10.createVerificationToken?.({ identifier: h10, token: await kk(`${n10}${p10}`), expires: o10 });
        return await Promise.all([r2, s2]), { redirect: `${q3}/verify-request?${new URLSearchParams({ provider: e10.id, type: e10.type })}` };
      }
      async function nG(a10, b10, c10) {
        let d10 = `${c10.url.origin}${c10.basePath}/signin`;
        if (!c10.provider) return { redirect: d10, cookies: b10 };
        switch (c10.provider.type) {
          case "oauth":
          case "oidc": {
            let { redirect: d11, cookies: e10 } = await nE(a10.query, c10);
            return e10 && b10.push(...e10), { redirect: d11, cookies: b10 };
          }
          case "email":
            return { ...await nF(a10, c10), cookies: b10 };
          default:
            return { redirect: d10, cookies: b10 };
        }
      }
      async function nH(a10, b10, c10) {
        let { jwt: d10, events: e10, callbackUrl: f10, logger: g10, session: h10 } = c10, i10 = b10.value;
        if (!i10) return { redirect: f10, cookies: a10 };
        try {
          if ("jwt" === h10.strategy) {
            let a11 = c10.cookies.sessionToken.name, b11 = await d10.decode({ ...d10, token: i10, salt: a11 });
            await e10.signOut?.({ token: b11 });
          } else {
            let a11 = await c10.adapter?.deleteSession(i10);
            await e10.signOut?.({ session: a11 });
          }
        } catch (a11) {
          g10.error(new hW(a11));
        }
        return a10.push(...b10.clean()), { redirect: f10, cookies: a10 };
      }
      async function nI(a10, b10) {
        let { adapter: c10, jwt: d10, session: { strategy: e10 } } = a10, f10 = b10.value;
        if (!f10) return null;
        if ("jwt" === e10) {
          let b11 = a10.cookies.sessionToken.name, c11 = await d10.decode({ ...d10, token: f10, salt: b11 });
          if (c11 && c11.sub) return { id: c11.sub, name: c11.name, email: c11.email, image: c11.picture };
        } else {
          let a11 = await c10?.getSessionAndUser(f10);
          if (a11) return a11.user;
        }
        return null;
      }
      async function nJ(a10, b10, c10, d10) {
        let e10 = nx(b10), { provider: f10 } = e10, { action: g10 } = a10.query ?? {};
        if ("register" !== g10 && "authenticate" !== g10 && void 0 !== g10) return { status: 400, body: { error: "Invalid action" }, cookies: d10, headers: { "Content-Type": "application/json" } };
        let h10 = await nI(b10, c10), i10 = h10 ? { user: h10, exists: true } : await f10.getUserInfo(b10, a10), j10 = i10?.user;
        switch (function(a11, b11, c11) {
          let { user: d11, exists: e11 = false } = c11 ?? {};
          switch (a11) {
            case "authenticate":
              return "authenticate";
            case "register":
              if (d11 && b11 === e11) return "register";
              break;
            case void 0:
              if (!b11) if (!d11) return "authenticate";
              else if (e11) return "authenticate";
              else return "register";
          }
          return null;
        }(g10, !!h10, i10)) {
          case "authenticate":
            return ns(e10, a10, j10, d10);
          case "register":
            if ("string" == typeof j10?.email) return nr(e10, a10, j10, d10);
            break;
          default:
            return { status: 400, body: { error: "Invalid request" }, cookies: d10, headers: { "Content-Type": "application/json" } };
        }
      }
      async function nK(a10, b10) {
        let { action: c10, providerId: d10, error: e10, method: f10 } = a10, g10 = b10.skipCSRFCheck === kq, { options: h10, cookies: i10 } = await kz({ authOptions: b10, action: c10, providerId: d10, url: a10.url, callbackUrl: a10.body?.callbackUrl ?? a10.query?.callbackUrl, csrfToken: a10.body?.csrfToken, cookies: a10.cookies, isPost: "POST" === f10, csrfDisabled: g10 }), j10 = new hz(h10.cookies.sessionToken, a10.cookies, h10.logger);
        if ("GET" === f10) {
          let b11 = lz({ ...h10, query: a10.query, cookies: i10 });
          switch (c10) {
            case "callback":
              return await nB(a10, h10, j10, i10);
            case "csrf":
              return b11.csrf(g10, h10, i10);
            case "error":
              return b11.error(e10);
            case "providers":
              return b11.providers(h10.providers);
            case "session":
              return await nD(h10, j10, i10);
            case "signin":
              return b11.signin(d10, e10);
            case "signout":
              return b11.signout();
            case "verify-request":
              return b11.verifyRequest();
            case "webauthn-options":
              return await nJ(a10, h10, j10, i10);
          }
        } else {
          let { csrfTokenVerified: b11 } = h10;
          switch (c10) {
            case "callback":
              return "credentials" === h10.provider.type && kn(c10, b11), await nB(a10, h10, j10, i10);
            case "session":
              return kn(c10, b11), await nD(h10, j10, i10, true, a10.body?.data);
            case "signin":
              return kn(c10, b11), await nG(a10, i10, h10);
            case "signout":
              return kn(c10, b11), await nH(i10, j10, h10);
          }
        }
        throw new hX(`Cannot handle action: ${c10}`);
      }
      function nL(a10, b10, c10, d10, e10) {
        let f10, g10 = e10?.basePath, h10 = d10.AUTH_URL ?? d10.NEXTAUTH_URL;
        if (h10) f10 = new URL(h10), g10 && "/" !== g10 && "/" !== f10.pathname && (f10.pathname !== g10 && kd(e10).warn("env-url-basepath-mismatch"), f10.pathname = "/");
        else {
          let a11 = c10.get("x-forwarded-host") ?? c10.get("host"), d11 = c10.get("x-forwarded-proto") ?? b10 ?? "https", e11 = d11.endsWith(":") ? d11 : d11 + ":";
          f10 = new URL(`${e11}//${a11}`);
        }
        let i10 = f10.toString().replace(/\/$/, "");
        if (g10) {
          let b11 = g10?.replace(/(^\/|\/$)/g, "") ?? "";
          return new URL(`${i10}/${b11}/${a10}`);
        }
        return new URL(`${i10}/${a10}`);
      }
      async function nM(a10, b10) {
        let c10 = kd(b10), d10 = await ki(a10, b10);
        if (!d10) return Response.json("Bad request.", { status: 400 });
        let e10 = function(a11, b11) {
          let { url: c11 } = a11, d11 = [];
          if (!h7 && b11.debug && d11.push("debug-enabled"), !b11.trustHost) return new h$(`Host must be trusted. URL was: ${a11.url}`);
          if (!b11.secret?.length) return new hP("Please define a `secret`");
          let e11 = a11.query?.callbackUrl;
          if (e11 && !h8(e11, c11.origin)) return new hH(`Invalid callback URL. Received: ${e11}`);
          let { callbackUrl: f11 } = hy(b11.useSecureCookies ?? "https:" === c11.protocol), g11 = a11.cookies?.[b11.cookies?.callbackUrl?.name ?? f11.name];
          if (g11 && !h8(g11, c11.origin)) return new hH(`Invalid callback URL. Received: ${g11}`);
          let h10 = false;
          for (let a12 of b11.providers) {
            let b12 = "function" == typeof a12 ? a12() : a12;
            if (("oauth" === b12.type || "oidc" === b12.type) && !(b12.issuer ?? b12.options?.issuer)) {
              let a13, { authorization: c12, token: d12, userinfo: e12 } = b12;
              if ("string" == typeof c12 || c12?.url ? "string" == typeof d12 || d12?.url ? "string" == typeof e12 || e12?.url || (a13 = "userinfo") : a13 = "token" : a13 = "authorization", a13) return new hJ(`Provider "${b12.id}" is missing both \`issuer\` and \`${a13}\` endpoint config. At least one of them is required`);
            }
            if ("credentials" === b12.type) h9 = true;
            else if ("email" === b12.type) ia = true;
            else if ("webauthn" === b12.type) {
              var i10;
              if (ib = true, b12.simpleWebAuthnBrowserVersion && (i10 = b12.simpleWebAuthnBrowserVersion, !/^v\d+(?:\.\d+){0,2}$/.test(i10))) return new hA(`Invalid provider config for "${b12.id}": simpleWebAuthnBrowserVersion "${b12.simpleWebAuthnBrowserVersion}" must be a valid semver string.`);
              if (b12.enableConditionalUI) {
                if (h10) return new h2("Multiple webauthn providers have 'enableConditionalUI' set to True. Only one provider can have this option enabled at a time");
                if (h10 = true, !Object.values(b12.formFields).some((a13) => a13.autocomplete && a13.autocomplete.toString().indexOf("webauthn") > -1)) return new h3(`Provider "${b12.id}" has 'enableConditionalUI' set to True, but none of its formFields have 'webauthn' in their autocomplete param`);
              }
            }
          }
          if (h9) {
            let a12 = b11.session?.strategy === "database", c12 = !b11.providers.some((a13) => "credentials" !== ("function" == typeof a13 ? a13() : a13).type);
            if (a12 && c12) return new hY("Signing in with credentials only supported if JWT strategy is enabled");
            if (b11.providers.some((a13) => {
              let b12 = "function" == typeof a13 ? a13() : a13;
              return "credentials" === b12.type && !b12.authorize;
            })) return new hO("Must define an authorize() handler to use credentials authentication provider");
          }
          let { adapter: j10, session: k10 } = b11, l10 = [];
          if (ia || k10?.strategy === "database" || !k10?.strategy && j10) if (ia) {
            if (!j10) return new hM("Email login requires an adapter");
            l10.push(...ic);
          } else {
            if (!j10) return new hM("Database session requires an adapter");
            l10.push(...id);
          }
          if (ib) {
            if (!b11.experimental?.enableWebAuthn) return new h6("WebAuthn is an experimental feature. To enable it, set `experimental.enableWebAuthn` to `true` in your config");
            if (d11.push("experimental-webauthn"), !j10) return new hM("WebAuthn requires an adapter");
            l10.push(...ie);
          }
          if (j10) {
            let a12 = l10.filter((a13) => !(a13 in j10));
            if (a12.length) return new hN(`Required adapter methods were missing: ${a12.join(", ")}`);
          }
          return h7 || (h7 = true), d11;
        }(d10, b10);
        if (Array.isArray(e10)) e10.forEach(c10.warn);
        else if (e10) {
          if (c10.error(e10), !(/* @__PURE__ */ new Set(["signin", "signout", "error", "verify-request"])).has(d10.action) || "GET" !== d10.method) return Response.json({ message: "There was a problem with the server configuration. Check the server logs for more information." }, { status: 500 });
          let { pages: a11, theme: f11 } = b10, g11 = a11?.error && d10.url.searchParams.get("callbackUrl")?.startsWith(a11.error);
          if (!a11?.error || g11) return g11 && c10.error(new hF(`The error page ${a11?.error} should not require authentication`)), kj(lz({ theme: f11 }).error("Configuration"));
          let h10 = `${d10.url.origin}${a11.error}?error=Configuration`;
          return Response.redirect(h10);
        }
        let f10 = a10.headers?.has("X-Auth-Return-Redirect"), g10 = b10.raw === kr;
        try {
          let a11 = await nK(d10, b10);
          if (g10) return a11;
          let c11 = kj(a11), e11 = c11.headers.get("Location");
          if (!f10 || !e11) return c11;
          return Response.json({ url: e11 }, { headers: c11.headers });
        } catch (l10) {
          c10.error(l10);
          let e11 = l10 instanceof hA;
          if (e11 && g10 && !f10) throw l10;
          if ("POST" === a10.method && "session" === d10.action) return Response.json(null, { status: 400 });
          let h10 = new URLSearchParams({ error: l10 instanceof hA && h1.has(l10.type) ? l10.type : "Configuration" });
          l10 instanceof hI && h10.set("code", l10.code);
          let i10 = e11 && l10.kind || "error", j10 = b10.pages?.[i10] ?? `${b10.basePath}/${i10.toLowerCase()}`, k10 = `${d10.url.origin}${j10}?${h10}`;
          if (f10) return Response.json({ url: k10 });
          return Response.redirect(k10);
        }
      }
      function nN(a10) {
        let b10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
        if (!b10) return a10;
        let { origin: c10 } = new URL(b10), { href: d10, origin: e10 } = a10.nextUrl;
        return new U(d10.replace(e10, c10), a10);
      }
      function nO(a10) {
        try {
          a10.secret ?? (a10.secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET);
          let b10 = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
          if (!b10) return;
          let { pathname: c10 } = new URL(b10);
          if ("/" === c10) return;
          a10.basePath || (a10.basePath = c10);
        } catch {
        } finally {
          a10.basePath || (a10.basePath = "/api/auth"), function(a11, b10, c10 = false) {
            try {
              let d10 = a11.AUTH_URL;
              d10 && (b10.basePath ? c10 || kd(b10).warn("env-url-basepath-redundant") : b10.basePath = new URL(d10).pathname);
            } catch {
            } finally {
              b10.basePath ?? (b10.basePath = "/auth");
            }
            if (!b10.secret?.length) {
              b10.secret = [];
              let c11 = a11.AUTH_SECRET;
              for (let d10 of (c11 && b10.secret.push(c11), [1, 2, 3])) {
                let c12 = a11[`AUTH_SECRET_${d10}`];
                c12 && b10.secret.unshift(c12);
              }
            }
            b10.redirectProxyUrl ?? (b10.redirectProxyUrl = a11.AUTH_REDIRECT_PROXY_URL), b10.trustHost ?? (b10.trustHost = !!(a11.AUTH_URL ?? a11.AUTH_TRUST_HOST ?? a11.VERCEL ?? a11.CF_PAGES ?? "production" !== a11.NODE_ENV)), b10.providers = b10.providers.map((b11) => {
              let { id: c11 } = "function" == typeof b11 ? b11({}) : b11, d10 = c11.toUpperCase().replace(/-/g, "_"), e10 = a11[`AUTH_${d10}_ID`], f10 = a11[`AUTH_${d10}_SECRET`], g10 = a11[`AUTH_${d10}_ISSUER`], h10 = a11[`AUTH_${d10}_KEY`], i10 = "function" == typeof b11 ? b11({ clientId: e10, clientSecret: f10, issuer: g10, apiKey: h10 }) : b11;
              return "oauth" === i10.type || "oidc" === i10.type ? (i10.clientId ?? (i10.clientId = e10), i10.clientSecret ?? (i10.clientSecret = f10), i10.issuer ?? (i10.issuer = g10)) : "email" === i10.type && (i10.apiKey ?? (i10.apiKey = h10)), i10;
            });
          }(process.env, a10, true);
        }
      }
      var nP = c(814);
      let nQ = { current: null }, nR = "function" == typeof nP.cache ? nP.cache : (a10) => a10, nS = console.warn;
      function nT(a10) {
        return function(...b10) {
          nS(a10(...b10));
        };
      }
      function nU() {
        let a10 = "cookies", b10 = ae.J.getStore(), c10 = aR.FP.getStore();
        if (b10) {
          if (c10 && "after" === c10.phase && !bn()) throw Object.defineProperty(Error(`Route ${b10.route} used "cookies" inside "after(...)". This is not supported. If you need this data inside an "after" callback, use "cookies" outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", { value: "E88", enumerable: false, configurable: true });
          if (b10.forceStatic) return nW(ag.seal(new S.RequestCookies(new Headers({}))));
          if (b10.dynamicShouldError) throw Object.defineProperty(new bl.f(`Route ${b10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`cookies\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E549", enumerable: false, configurable: true });
          if (c10) switch (c10.type) {
            case "cache":
              let f10 = Object.defineProperty(Error(`Route ${b10.route} used "cookies" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "cookies" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E398", enumerable: false, configurable: true });
              throw Error.captureStackTrace(f10, nU), b10.invalidDynamicUsageError ??= f10, f10;
            case "unstable-cache":
              throw Object.defineProperty(Error(`Route ${b10.route} used "cookies" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "cookies" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E157", enumerable: false, configurable: true });
            case "prerender":
              var d10 = b10, e10 = c10;
              let g10 = nV.get(e10);
              if (g10) return g10;
              let h10 = (0, bm.W5)(e10.renderSignal, d10.route, "`cookies()`");
              return nV.set(e10, h10), h10;
            case "prerender-client":
              let i10 = "`cookies`";
              throw Object.defineProperty(new aU.z(`${i10} must not be used within a client component. Next.js should be preventing ${i10} from being included in client components statically, but did not in this case.`), "__NEXT_ERROR_CODE", { value: "E693", enumerable: false, configurable: true });
            case "prerender-ppr":
              return (0, bk.Ui)(b10.route, a10, c10.dynamicTracking);
            case "prerender-legacy":
              return (0, bk.xI)(a10, b10, c10);
            case "prerender-runtime":
              return (0, bk.wi)(c10, function(a11) {
                let b11 = nV.get(a11);
                if (b11) return b11;
                let c11 = Promise.resolve(a11);
                return nV.set(a11, c11), c11;
              }(c10.cookies));
            case "private-cache":
              return nW(c10.cookies);
            case "request":
              return (0, bk.Pk)(c10), nW(aj(c10) ? c10.userspaceMutableCookies : c10.cookies);
          }
        }
        (0, aR.M1)(a10);
      }
      nR((a10) => {
        try {
          nS(nQ.current);
        } finally {
          nQ.current = null;
        }
      });
      let nV = /* @__PURE__ */ new WeakMap();
      function nW(a10) {
        let b10 = nV.get(a10);
        if (b10) return b10;
        let c10 = Promise.resolve(a10);
        return nV.set(a10, c10), Object.defineProperties(c10, { [Symbol.iterator]: { value: a10[Symbol.iterator] ? a10[Symbol.iterator].bind(a10) : nX.bind(a10) }, size: { get: () => a10.size }, get: { value: a10.get.bind(a10) }, getAll: { value: a10.getAll.bind(a10) }, has: { value: a10.has.bind(a10) }, set: { value: a10.set.bind(a10) }, delete: { value: a10.delete.bind(a10) }, clear: { value: "function" == typeof a10.clear ? a10.clear.bind(a10) : nY.bind(a10, c10) }, toString: { value: a10.toString.bind(a10) } }), c10;
      }
      function nX() {
        return this.getAll().map((a10) => [a10.name, a10]).values();
      }
      function nY(a10) {
        for (let a11 of this.getAll()) this.delete(a11.name);
        return a10;
      }
      function nZ() {
        let a10 = "headers", b10 = ae.J.getStore(), c10 = aR.FP.getStore();
        if (b10) {
          if (c10 && "after" === c10.phase && !bn()) throw Object.defineProperty(Error(`Route ${b10.route} used "headers" inside "after(...)". This is not supported. If you need this data inside an "after" callback, use "headers" outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", { value: "E367", enumerable: false, configurable: true });
          if (b10.forceStatic) return n_(ad.seal(new Headers({})));
          if (c10) switch (c10.type) {
            case "cache": {
              let a11 = Object.defineProperty(Error(`Route ${b10.route} used "headers" inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E304", enumerable: false, configurable: true });
              throw Error.captureStackTrace(a11, nZ), b10.invalidDynamicUsageError ??= a11, a11;
            }
            case "private-cache": {
              let a11 = Object.defineProperty(Error(`Route ${b10.route} used "headers" inside "use cache: private". Accessing "headers" inside a private cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", { value: "E742", enumerable: false, configurable: true });
              throw Error.captureStackTrace(a11, nZ), b10.invalidDynamicUsageError ??= a11, a11;
            }
            case "unstable-cache":
              throw Object.defineProperty(Error(`Route ${b10.route} used "headers" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", { value: "E127", enumerable: false, configurable: true });
          }
          if (b10.dynamicShouldError) throw Object.defineProperty(new bl.f(`Route ${b10.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`headers\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", { value: "E525", enumerable: false, configurable: true });
          if (c10) switch (c10.type) {
            case "prerender":
            case "prerender-runtime":
              var d10 = b10, e10 = c10;
              let f10 = n$.get(e10);
              if (f10) return f10;
              let g10 = (0, bm.W5)(e10.renderSignal, d10.route, "`headers()`");
              return n$.set(e10, g10), g10;
            case "prerender-client":
              let h10 = "`headers`";
              throw Object.defineProperty(new aU.z(`${h10} must not be used within a client component. Next.js should be preventing ${h10} from being included in client components statically, but did not in this case.`), "__NEXT_ERROR_CODE", { value: "E693", enumerable: false, configurable: true });
            case "prerender-ppr":
              return (0, bk.Ui)(b10.route, a10, c10.dynamicTracking);
            case "prerender-legacy":
              return (0, bk.xI)(a10, b10, c10);
            case "request":
              return (0, bk.Pk)(c10), n_(c10.headers);
          }
        }
        (0, aR.M1)(a10);
      }
      nT(function(a10, b10) {
        let c10 = a10 ? `Route "${a10}" ` : "This route ";
        return Object.defineProperty(Error(`${c10}used ${b10}. \`cookies()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E223", enumerable: false, configurable: true });
      });
      let n$ = /* @__PURE__ */ new WeakMap();
      function n_(a10) {
        let b10 = n$.get(a10);
        if (b10) return b10;
        let c10 = Promise.resolve(a10);
        return n$.set(a10, c10), Object.defineProperties(c10, { append: { value: a10.append.bind(a10) }, delete: { value: a10.delete.bind(a10) }, get: { value: a10.get.bind(a10) }, has: { value: a10.has.bind(a10) }, set: { value: a10.set.bind(a10) }, getSetCookie: { value: a10.getSetCookie.bind(a10) }, forEach: { value: a10.forEach.bind(a10) }, keys: { value: a10.keys.bind(a10) }, values: { value: a10.values.bind(a10) }, entries: { value: a10.entries.bind(a10) }, [Symbol.iterator]: { value: a10[Symbol.iterator].bind(a10) } }), c10;
      }
      async function n0(a10, b10) {
        return nM(new Request(nL("session", a10.get("x-forwarded-proto"), a10, process.env, b10), { headers: { cookie: a10.get("cookie") ?? "" } }), { ...b10, callbacks: { ...b10.callbacks, async session(...a11) {
          let c10 = await b10.callbacks?.session?.(...a11) ?? { ...a11[0].session, expires: a11[0].session.expires?.toISOString?.() ?? a11[0].session.expires };
          return { user: a11[0].user ?? a11[0].token, ...c10 };
        } } });
      }
      function n1(a10) {
        return "function" == typeof a10;
      }
      function n2(a10, b10) {
        return "function" == typeof a10 ? async (...c10) => {
          if (!c10.length) {
            let c11 = await nZ(), d11 = await a10(void 0);
            return b10?.(d11), n0(c11, d11).then((a11) => a11.json());
          }
          if (c10[0] instanceof Request) {
            let d11 = c10[0], e11 = c10[1], f11 = await a10(d11);
            return b10?.(f11), n3([d11, e11], f11);
          }
          if (n1(c10[0])) {
            let d11 = c10[0];
            return async (...c11) => {
              let e11 = await a10(c11[0]);
              return b10?.(e11), n3(c11, e11, d11);
            };
          }
          let d10 = "req" in c10[0] ? c10[0].req : c10[0], e10 = "res" in c10[0] ? c10[0].res : c10[1], f10 = await a10(d10);
          return b10?.(f10), n0(new Headers(d10.headers), f10).then(async (a11) => {
            let b11 = await a11.json();
            for (let b12 of a11.headers.getSetCookie()) "headers" in e10 ? e10.headers.append("set-cookie", b12) : e10.appendHeader("set-cookie", b12);
            return b11;
          });
        } : (...b11) => {
          if (!b11.length) return Promise.resolve(nZ()).then((b12) => n0(b12, a10).then((a11) => a11.json()));
          if (b11[0] instanceof Request) return n3([b11[0], b11[1]], a10);
          if (n1(b11[0])) {
            let c11 = b11[0];
            return async (...b12) => n3(b12, a10, c11).then((a11) => a11);
          }
          let c10 = "req" in b11[0] ? b11[0].req : b11[0], d10 = "res" in b11[0] ? b11[0].res : b11[1];
          return n0(new Headers(c10.headers), a10).then(async (a11) => {
            let b12 = await a11.json();
            for (let b13 of a11.headers.getSetCookie()) "headers" in d10 ? d10.headers.append("set-cookie", b13) : d10.appendHeader("set-cookie", b13);
            return b12;
          });
        };
      }
      async function n3(a10, b10, c10) {
        let d10 = nN(a10[0]), e10 = await n0(d10.headers, b10), f10 = await e10.json(), g10 = true;
        b10.callbacks?.authorized && (g10 = await b10.callbacks.authorized({ request: d10, auth: f10 }));
        let h10 = Z.next?.();
        if (g10 instanceof Response) {
          h10 = g10;
          let a11 = g10.headers.get("Location"), { pathname: c11 } = d10.nextUrl;
          a11 && function(a12, b11, c12) {
            let d11 = b11.replace(`${a12}/`, ""), e11 = Object.values(c12.pages ?? {});
            return (n4.has(d11) || e11.includes(b11)) && b11 === a12;
          }(c11, new URL(a11).pathname, b10) && (g10 = true);
        } else if (c10) d10.auth = f10, h10 = await c10(d10, a10[1]) ?? Z.next();
        else if (!g10) {
          let a11 = b10.pages?.signIn ?? `${b10.basePath}/signin`;
          if (d10.nextUrl.pathname !== a11) {
            let b11 = d10.nextUrl.clone();
            b11.pathname = a11, b11.searchParams.set("callbackUrl", d10.nextUrl.href), h10 = Z.redirect(b11);
          }
        }
        let i10 = new Response(h10?.body, h10);
        for (let a11 of e10.headers.getSetCookie()) i10.headers.append("set-cookie", a11);
        return i10;
      }
      nT(function(a10, b10) {
        let c10 = a10 ? `Route "${a10}" ` : "This route ";
        return Object.defineProperty(Error(`${c10}used ${b10}. \`headers()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E277", enumerable: false, configurable: true });
      }), c(159), /* @__PURE__ */ new WeakMap(), nT(function(a10, b10) {
        let c10 = a10 ? `Route "${a10}" ` : "This route ";
        return Object.defineProperty(Error(`${c10}used ${b10}. \`draftMode()\` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", { value: "E377", enumerable: false, configurable: true });
      });
      let n4 = /* @__PURE__ */ new Set(["providers", "session", "csrf", "signin", "signout", "callback", "verify-request", "error"]);
      var n5 = c(378), n6 = c(944);
      let n7 = c(918).s;
      function n8(a10, b10) {
        var c10;
        throw null != b10 || (b10 = (null == n7 || null == (c10 = n7.getStore()) ? void 0 : c10.isAction) ? n6.zB.push : n6.zB.replace), function(a11, b11, c11) {
          void 0 === c11 && (c11 = n5.Q.TemporaryRedirect);
          let d10 = Object.defineProperty(Error(n6.oJ), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          return d10.digest = n6.oJ + ";" + b11 + ";" + a11 + ";" + c11 + ";", d10;
        }(a10, b10, n5.Q.TemporaryRedirect);
      }
      var n9 = c(66);
      async function oa(a10, b10 = {}, c10, d10) {
        let e10 = new Headers(await nZ()), { redirect: f10 = true, redirectTo: g10, ...h10 } = b10 instanceof FormData ? Object.fromEntries(b10) : b10, i10 = g10?.toString() ?? e10.get("Referer") ?? "/", j10 = nL("signin", e10.get("x-forwarded-proto"), e10, process.env, d10);
        if (!a10) return j10.searchParams.append("callbackUrl", i10), f10 && n8(j10.toString()), j10.toString();
        let k10 = `${j10}/${a10}?${new URLSearchParams(c10)}`, l10 = {};
        for (let b11 of d10.providers) {
          let { options: c11, ...d11 } = "function" == typeof b11 ? b11() : b11, e11 = c11?.id ?? d11.id;
          if (e11 === a10) {
            l10 = { id: e11, type: c11?.type ?? d11.type };
            break;
          }
        }
        if (!l10.id) {
          let a11 = `${j10}?${new URLSearchParams({ callbackUrl: i10 })}`;
          return f10 && n8(a11), a11;
        }
        "credentials" === l10.type && (k10 = k10.replace("signin", "callback")), e10.set("Content-Type", "application/x-www-form-urlencoded");
        let m10 = new Request(k10, { method: "POST", headers: e10, body: new URLSearchParams({ ...h10, callbackUrl: i10 }) }), n10 = await nM(m10, { ...d10, raw: kr, skipCSRFCheck: kq }), o10 = await nU();
        for (let a11 of n10?.cookies ?? []) o10.set(a11.name, a11.value, a11.options);
        let p10 = (n10 instanceof Response ? n10.headers.get("Location") : n10.redirect) ?? k10;
        return f10 ? n8(p10) : p10;
      }
      async function ob(a10, b10) {
        let c10 = new Headers(await nZ());
        c10.set("Content-Type", "application/x-www-form-urlencoded");
        let d10 = nL("signout", c10.get("x-forwarded-proto"), c10, process.env, b10), e10 = new URLSearchParams({ callbackUrl: a10?.redirectTo ?? c10.get("Referer") ?? "/" }), f10 = new Request(d10, { method: "POST", headers: c10, body: e10 }), g10 = await nM(f10, { ...b10, raw: kr, skipCSRFCheck: kq }), h10 = await nU();
        for (let a11 of g10?.cookies ?? []) h10.set(a11.name, a11.value, a11.options);
        return a10?.redirect ?? true ? n8(g10.redirect) : g10;
      }
      async function oc(a10, b10) {
        let c10 = new Headers(await nZ());
        c10.set("Content-Type", "application/json");
        let d10 = new Request(nL("session", c10.get("x-forwarded-proto"), c10, process.env, b10), { method: "POST", headers: c10, body: JSON.stringify({ data: a10 }) }), e10 = await nM(d10, { ...b10, raw: kr, skipCSRFCheck: kq }), f10 = await nU();
        for (let a11 of e10?.cookies ?? []) f10.set(a11.name, a11.value, a11.options);
        return e10.body;
      }
      n9.s8, n9.s8, n9.s8, c(515).X;
      class od extends cn {
        constructor(a10) {
          super(od.buildEmbeddedCount(a10.source, a10.filters).queryChunks), this.params = a10, this.mapWith(Number), this.session = a10.session, this.sql = od.buildCount(a10.source, a10.filters);
        }
        sql;
        static [bK] = "MySqlCountBuilder";
        [Symbol.toStringTag] = "MySqlCountBuilder";
        session;
        static buildEmbeddedCount(a10, b10) {
          return cs`(select count(*) from ${a10}${cs.raw(" where ").if(b10)}${b10})`;
        }
        static buildCount(a10, b10) {
          return cs`select count(*) as count from ${a10}${cs.raw(" where ").if(b10)}${b10}`;
        }
        then(a10, b10) {
          return Promise.resolve(this.session.count(this.sql)).then(a10, b10);
        }
        catch(a10) {
          return this.then(void 0, a10);
        }
        finally(a10) {
          return this.then((b10) => (a10?.(), b10), (b10) => {
            throw a10?.(), b10;
          });
        }
      }
      class oe {
        static [bK] = "MySqlForeignKeyBuilder";
        reference;
        _onUpdate;
        _onDelete;
        constructor(a10, b10) {
          this.reference = () => {
            let { name: b11, columns: c10, foreignColumns: d10 } = a10();
            return { name: b11, columns: c10, foreignTable: d10[0].table, foreignColumns: d10 };
          }, b10 && (this._onUpdate = b10.onUpdate, this._onDelete = b10.onDelete);
        }
        onUpdate(a10) {
          return this._onUpdate = a10, this;
        }
        onDelete(a10) {
          return this._onDelete = a10, this;
        }
        build(a10) {
          return new of(a10, this);
        }
      }
      class of {
        constructor(a10, b10) {
          this.table = a10, this.reference = b10.reference, this.onUpdate = b10._onUpdate, this.onDelete = b10._onDelete;
        }
        static [bK] = "MySqlForeignKey";
        reference;
        onUpdate;
        onDelete;
        getName() {
          let { name: a10, columns: b10, foreignColumns: c10 } = this.reference(), d10 = b10.map((a11) => a11.name), e10 = c10.map((a11) => a11.name), f10 = [this.table[bN], ...d10, c10[0].table[bN], ...e10];
          return a10 ?? `${f10.join("_")}_fk`;
        }
      }
      function og(a10, b10) {
        return `${a10[bN]}_${b10.join("_")}_unique`;
      }
      class oh {
        constructor(a10, b10) {
          this.name = b10, this.columns = a10;
        }
        static [bK] = null;
        columns;
        build(a10) {
          return new oj(a10, this.columns, this.name);
        }
      }
      class oi {
        static [bK] = null;
        name;
        constructor(a10) {
          this.name = a10;
        }
        on(...a10) {
          return new oh(a10, this.name);
        }
      }
      class oj {
        constructor(a10, b10, c10) {
          this.table = a10, this.columns = b10, this.name = c10 ?? og(this.table, this.columns.map((a11) => a11.name));
        }
        static [bK] = null;
        columns;
        name;
        nullsNotDistinct = false;
        getName() {
          return this.name;
        }
      }
      class ok extends bY {
        static [bK] = "MySqlColumnBuilder";
        foreignKeyConfigs = [];
        references(a10, b10 = {}) {
          return this.foreignKeyConfigs.push({ ref: a10, actions: b10 }), this;
        }
        unique(a10) {
          return this.config.isUnique = true, this.config.uniqueName = a10, this;
        }
        generatedAlwaysAs(a10, b10) {
          return this.config.generated = { as: a10, type: "always", mode: b10?.mode ?? "virtual" }, this;
        }
        buildForeignKeys(a10, b10) {
          return this.foreignKeyConfigs.map(({ ref: c10, actions: d10 }) => ((c11, d11) => {
            let e10 = new oe(() => ({ columns: [a10], foreignColumns: [c11()] }));
            return d11.onUpdate && e10.onUpdate(d11.onUpdate), d11.onDelete && e10.onDelete(d11.onDelete), e10.build(b10);
          })(c10, d10));
        }
      }
      class ol extends bM {
        constructor(a10, b10) {
          b10.uniqueName || (b10.uniqueName = og(a10, [b10.name])), super(a10, b10), this.table = a10;
        }
        static [bK] = "MySqlColumn";
      }
      class om extends ok {
        static [bK] = "MySqlColumnBuilderWithAutoIncrement";
        constructor(a10, b10, c10) {
          super(a10, b10, c10), this.config.autoIncrement = false;
        }
        autoincrement() {
          return this.config.autoIncrement = true, this.config.hasDefault = true, this;
        }
      }
      class on extends ol {
        static [bK] = "MySqlColumnWithAutoIncrement";
        autoIncrement = this.config.autoIncrement;
      }
      class oo extends om {
        static [bK] = "MySqlBigInt53Builder";
        constructor(a10, b10 = false) {
          super(a10, "number", "MySqlBigInt53"), this.config.unsigned = b10;
        }
        build(a10) {
          return new op(a10, this.config);
        }
      }
      class op extends on {
        static [bK] = "MySqlBigInt53";
        getSQLType() {
          return `bigint${this.config.unsigned ? " unsigned" : ""}`;
        }
        mapFromDriverValue(a10) {
          return "number" == typeof a10 ? a10 : Number(a10);
        }
      }
      class oq extends om {
        static [bK] = "MySqlBigInt64Builder";
        constructor(a10, b10 = false) {
          super(a10, "bigint", "MySqlBigInt64"), this.config.unsigned = b10;
        }
        build(a10) {
          return new or(a10, this.config);
        }
      }
      class or extends on {
        static [bK] = "MySqlBigInt64";
        getSQLType() {
          return `bigint${this.config.unsigned ? " unsigned" : ""}`;
        }
        mapFromDriverValue(a10) {
          return BigInt(a10);
        }
      }
      function os(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return "number" === d10.mode ? new oo(c10, d10.unsigned) : new oq(c10, d10.unsigned);
      }
      var ot = c(356).Buffer;
      class ou extends ok {
        static [bK] = "MySqlBinaryBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlBinary"), this.config.length = b10;
        }
        build(a10) {
          return new ov(a10, this.config);
        }
      }
      class ov extends ol {
        static [bK] = "MySqlBinary";
        length = this.config.length;
        mapFromDriverValue(a10) {
          if ("string" == typeof a10) return a10;
          if (ot.isBuffer(a10)) return a10.toString();
          let b10 = [];
          for (let c10 of a10) b10.push(49 === c10 ? "1" : "0");
          return b10.join("");
        }
        getSQLType() {
          return void 0 === this.length ? "binary" : `binary(${this.length})`;
        }
      }
      function ow(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new ou(c10, d10.length);
      }
      class ox extends ok {
        static [bK] = "MySqlBooleanBuilder";
        constructor(a10) {
          super(a10, "boolean", "MySqlBoolean");
        }
        build(a10) {
          return new oy(a10, this.config);
        }
      }
      class oy extends ol {
        static [bK] = "MySqlBoolean";
        getSQLType() {
          return "boolean";
        }
        mapFromDriverValue(a10) {
          return "boolean" == typeof a10 ? a10 : 1 === a10;
        }
      }
      function oz(a10) {
        return new ox(a10 ?? "");
      }
      class oA extends ok {
        static [bK] = "MySqlCharBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlChar"), this.config.length = b10.length, this.config.enum = b10.enum;
        }
        build(a10) {
          return new oB(a10, this.config);
        }
      }
      class oB extends ol {
        static [bK] = "MySqlChar";
        length = this.config.length;
        enumValues = this.config.enum;
        getSQLType() {
          return void 0 === this.length ? "char" : `char(${this.length})`;
        }
      }
      function oC(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new oA(c10, d10);
      }
      class oD extends ok {
        static [bK] = "MySqlCustomColumnBuilder";
        constructor(a10, b10, c10) {
          super(a10, "custom", "MySqlCustomColumn"), this.config.fieldConfig = b10, this.config.customTypeParams = c10;
        }
        build(a10) {
          return new oE(a10, this.config);
        }
      }
      class oE extends ol {
        static [bK] = "MySqlCustomColumn";
        sqlName;
        mapTo;
        mapFrom;
        constructor(a10, b10) {
          super(a10, b10), this.sqlName = b10.customTypeParams.dataType(b10.fieldConfig), this.mapTo = b10.customTypeParams.toDriver, this.mapFrom = b10.customTypeParams.fromDriver;
        }
        getSQLType() {
          return this.sqlName;
        }
        mapFromDriverValue(a10) {
          return "function" == typeof this.mapFrom ? this.mapFrom(a10) : a10;
        }
        mapToDriverValue(a10) {
          return "function" == typeof this.mapTo ? this.mapTo(a10) : a10;
        }
      }
      function oF(a10) {
        return (b10, c10) => {
          let { name: d10, config: e10 } = c1(b10, c10);
          return new oD(d10, e10, a10);
        };
      }
      class oG extends ok {
        static [bK] = "MySqlDateBuilder";
        constructor(a10) {
          super(a10, "date", "MySqlDate");
        }
        build(a10) {
          return new oH(a10, this.config);
        }
      }
      class oH extends ol {
        static [bK] = "MySqlDate";
        constructor(a10, b10) {
          super(a10, b10);
        }
        getSQLType() {
          return "date";
        }
        mapFromDriverValue(a10) {
          return new Date(a10);
        }
      }
      class oI extends ok {
        static [bK] = "MySqlDateStringBuilder";
        constructor(a10) {
          super(a10, "string", "MySqlDateString");
        }
        build(a10) {
          return new oJ(a10, this.config);
        }
      }
      class oJ extends ol {
        static [bK] = "MySqlDateString";
        constructor(a10, b10) {
          super(a10, b10);
        }
        getSQLType() {
          return "date";
        }
      }
      function oK(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode === "string" ? new oI(c10) : new oG(c10);
      }
      class oL extends ok {
        static [bK] = "MySqlDateTimeBuilder";
        constructor(a10, b10) {
          super(a10, "date", "MySqlDateTime"), this.config.fsp = b10?.fsp;
        }
        build(a10) {
          return new oM(a10, this.config);
        }
      }
      class oM extends ol {
        static [bK] = "MySqlDateTime";
        fsp;
        constructor(a10, b10) {
          super(a10, b10), this.fsp = b10.fsp;
        }
        getSQLType() {
          let a10 = void 0 === this.fsp ? "" : `(${this.fsp})`;
          return `datetime${a10}`;
        }
        mapToDriverValue(a10) {
          return a10.toISOString().replace("T", " ").replace("Z", "");
        }
        mapFromDriverValue(a10) {
          return /* @__PURE__ */ new Date(a10.replace(" ", "T") + "Z");
        }
      }
      class oN extends ok {
        static [bK] = "MySqlDateTimeStringBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlDateTimeString"), this.config.fsp = b10?.fsp;
        }
        build(a10) {
          return new oO(a10, this.config);
        }
      }
      class oO extends ol {
        static [bK] = "MySqlDateTimeString";
        fsp;
        constructor(a10, b10) {
          super(a10, b10), this.fsp = b10.fsp;
        }
        getSQLType() {
          let a10 = void 0 === this.fsp ? "" : `(${this.fsp})`;
          return `datetime${a10}`;
        }
      }
      function oP(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode === "string" ? new oN(c10, d10) : new oL(c10, d10);
      }
      class oQ extends om {
        static [bK] = "MySqlDecimalBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlDecimal"), this.config.precision = b10?.precision, this.config.scale = b10?.scale, this.config.unsigned = b10?.unsigned;
        }
        build(a10) {
          return new oR(a10, this.config);
        }
      }
      class oR extends on {
        static [bK] = "MySqlDecimal";
        precision = this.config.precision;
        scale = this.config.scale;
        unsigned = this.config.unsigned;
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? a10 : String(a10);
        }
        getSQLType() {
          let a10 = "";
          return void 0 !== this.precision && void 0 !== this.scale ? a10 += `decimal(${this.precision},${this.scale})` : void 0 === this.precision ? a10 += "decimal" : a10 += `decimal(${this.precision})`, a10 = "decimal(10,0)" === a10 || "decimal(10)" === a10 ? "decimal" : a10, this.unsigned ? `${a10} unsigned` : a10;
        }
      }
      class oS extends om {
        static [bK] = "MySqlDecimalNumberBuilder";
        constructor(a10, b10) {
          super(a10, "number", "MySqlDecimalNumber"), this.config.precision = b10?.precision, this.config.scale = b10?.scale, this.config.unsigned = b10?.unsigned;
        }
        build(a10) {
          return new oT(a10, this.config);
        }
      }
      class oT extends on {
        static [bK] = "MySqlDecimalNumber";
        precision = this.config.precision;
        scale = this.config.scale;
        unsigned = this.config.unsigned;
        mapFromDriverValue(a10) {
          return "number" == typeof a10 ? a10 : Number(a10);
        }
        mapToDriverValue = String;
        getSQLType() {
          let a10 = "";
          return void 0 !== this.precision && void 0 !== this.scale ? a10 += `decimal(${this.precision},${this.scale})` : void 0 === this.precision ? a10 += "decimal" : a10 += `decimal(${this.precision})`, a10 = "decimal(10,0)" === a10 || "decimal(10)" === a10 ? "decimal" : a10, this.unsigned ? `${a10} unsigned` : a10;
        }
      }
      class oU extends om {
        static [bK] = "MySqlDecimalBigIntBuilder";
        constructor(a10, b10) {
          super(a10, "bigint", "MySqlDecimalBigInt"), this.config.precision = b10?.precision, this.config.scale = b10?.scale, this.config.unsigned = b10?.unsigned;
        }
        build(a10) {
          return new oV(a10, this.config);
        }
      }
      class oV extends on {
        static [bK] = "MySqlDecimalBigInt";
        precision = this.config.precision;
        scale = this.config.scale;
        unsigned = this.config.unsigned;
        mapFromDriverValue = BigInt;
        mapToDriverValue = String;
        getSQLType() {
          let a10 = "";
          return void 0 !== this.precision && void 0 !== this.scale ? a10 += `decimal(${this.precision},${this.scale})` : void 0 === this.precision ? a10 += "decimal" : a10 += `decimal(${this.precision})`, a10 = "decimal(10,0)" === a10 || "decimal(10)" === a10 ? "decimal" : a10, this.unsigned ? `${a10} unsigned` : a10;
        }
      }
      function oW(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10), e10 = d10?.mode;
        return "number" === e10 ? new oS(c10, d10) : "bigint" === e10 ? new oU(c10, d10) : new oQ(c10, d10);
      }
      class oX extends om {
        static [bK] = "MySqlDoubleBuilder";
        constructor(a10, b10) {
          super(a10, "number", "MySqlDouble"), this.config.precision = b10?.precision, this.config.scale = b10?.scale, this.config.unsigned = b10?.unsigned;
        }
        build(a10) {
          return new oY(a10, this.config);
        }
      }
      class oY extends on {
        static [bK] = "MySqlDouble";
        precision = this.config.precision;
        scale = this.config.scale;
        unsigned = this.config.unsigned;
        getSQLType() {
          let a10 = "";
          return void 0 !== this.precision && void 0 !== this.scale ? a10 += `double(${this.precision},${this.scale})` : void 0 === this.precision ? a10 += "double" : a10 += `double(${this.precision})`, this.unsigned ? `${a10} unsigned` : a10;
        }
      }
      function oZ(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new oX(c10, d10);
      }
      class o$ extends ok {
        static [bK] = "MySqlEnumColumnBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlEnumColumn"), this.config.enumValues = b10;
        }
        build(a10) {
          return new o_(a10, this.config);
        }
      }
      class o_ extends ol {
        static [bK] = "MySqlEnumColumn";
        enumValues = this.config.enumValues;
        getSQLType() {
          return `enum(${this.enumValues.map((a10) => `'${a10}'`).join(",")})`;
        }
      }
      class o0 extends ok {
        static [bK] = "MySqlEnumObjectColumnBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlEnumObjectColumn"), this.config.enumValues = b10;
        }
        build(a10) {
          return new o1(a10, this.config);
        }
      }
      class o1 extends ol {
        static [bK] = "MySqlEnumObjectColumn";
        enumValues = this.config.enumValues;
        getSQLType() {
          return `enum(${this.enumValues.map((a10) => `'${a10}'`).join(",")})`;
        }
      }
      function o2(a10, b10) {
        if ("string" == typeof a10 && Array.isArray(b10) || Array.isArray(a10)) {
          let c10 = "string" == typeof a10 && a10.length > 0 ? a10 : "", d10 = ("string" == typeof a10 ? b10 : a10) ?? [];
          if (0 === d10.length) throw Error(`You have an empty array for "${c10}" enum values`);
          return new o$(c10, d10);
        }
        if ("string" == typeof a10 && "object" == typeof b10 || "object" == typeof a10) {
          let c10 = "object" == typeof a10 ? "" : a10, d10 = "object" == typeof a10 ? Object.values(a10) : "object" == typeof b10 ? Object.values(b10) : [];
          if (0 === d10.length) throw Error(`You have an empty array for "${c10}" enum values`);
          return new o0(c10, d10);
        }
      }
      class o3 extends om {
        static [bK] = "MySqlFloatBuilder";
        constructor(a10, b10) {
          super(a10, "number", "MySqlFloat"), this.config.precision = b10?.precision, this.config.scale = b10?.scale, this.config.unsigned = b10?.unsigned;
        }
        build(a10) {
          return new o4(a10, this.config);
        }
      }
      class o4 extends on {
        static [bK] = "MySqlFloat";
        precision = this.config.precision;
        scale = this.config.scale;
        unsigned = this.config.unsigned;
        getSQLType() {
          let a10 = "";
          return void 0 !== this.precision && void 0 !== this.scale ? a10 += `float(${this.precision},${this.scale})` : void 0 === this.precision ? a10 += "float" : a10 += `float(${this.precision})`, this.unsigned ? `${a10} unsigned` : a10;
        }
      }
      function o5(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new o3(c10, d10);
      }
      class o6 extends om {
        static [bK] = "MySqlIntBuilder";
        constructor(a10, b10) {
          super(a10, "number", "MySqlInt"), this.config.unsigned = !!b10 && b10.unsigned;
        }
        build(a10) {
          return new o7(a10, this.config);
        }
      }
      class o7 extends on {
        static [bK] = "MySqlInt";
        getSQLType() {
          return `int${this.config.unsigned ? " unsigned" : ""}`;
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? Number(a10) : a10;
        }
      }
      function o8(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new o6(c10, d10);
      }
      class o9 extends ok {
        static [bK] = "MySqlJsonBuilder";
        constructor(a10) {
          super(a10, "json", "MySqlJson");
        }
        build(a10) {
          return new pa(a10, this.config);
        }
      }
      class pa extends ol {
        static [bK] = "MySqlJson";
        getSQLType() {
          return "json";
        }
        mapToDriverValue(a10) {
          return JSON.stringify(a10);
        }
      }
      function pb(a10) {
        return new o9(a10 ?? "");
      }
      class pc extends om {
        static [bK] = "MySqlMediumIntBuilder";
        constructor(a10, b10) {
          super(a10, "number", "MySqlMediumInt"), this.config.unsigned = !!b10 && b10.unsigned;
        }
        build(a10) {
          return new pd(a10, this.config);
        }
      }
      class pd extends on {
        static [bK] = "MySqlMediumInt";
        getSQLType() {
          return `mediumint${this.config.unsigned ? " unsigned" : ""}`;
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? Number(a10) : a10;
        }
      }
      function pe(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new pc(c10, d10);
      }
      class pf extends om {
        static [bK] = "MySqlRealBuilder";
        constructor(a10, b10) {
          super(a10, "number", "MySqlReal"), this.config.precision = b10?.precision, this.config.scale = b10?.scale;
        }
        build(a10) {
          return new pg(a10, this.config);
        }
      }
      class pg extends on {
        static [bK] = "MySqlReal";
        precision = this.config.precision;
        scale = this.config.scale;
        getSQLType() {
          return void 0 !== this.precision && void 0 !== this.scale ? `real(${this.precision}, ${this.scale})` : void 0 === this.precision ? "real" : `real(${this.precision})`;
        }
      }
      function ph(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new pf(c10, d10);
      }
      class pi extends om {
        static [bK] = "MySqlSerialBuilder";
        constructor(a10) {
          super(a10, "number", "MySqlSerial"), this.config.hasDefault = true, this.config.autoIncrement = true;
        }
        build(a10) {
          return new pj(a10, this.config);
        }
      }
      class pj extends on {
        static [bK] = "MySqlSerial";
        getSQLType() {
          return "serial";
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? Number(a10) : a10;
        }
      }
      function pk(a10) {
        return new pi(a10 ?? "");
      }
      class pl extends om {
        static [bK] = "MySqlSmallIntBuilder";
        constructor(a10, b10) {
          super(a10, "number", "MySqlSmallInt"), this.config.unsigned = !!b10 && b10.unsigned;
        }
        build(a10) {
          return new pm(a10, this.config);
        }
      }
      class pm extends on {
        static [bK] = "MySqlSmallInt";
        getSQLType() {
          return `smallint${this.config.unsigned ? " unsigned" : ""}`;
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? Number(a10) : a10;
        }
      }
      function pn(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new pl(c10, d10);
      }
      class po extends ok {
        static [bK] = "MySqlTextBuilder";
        constructor(a10, b10, c10) {
          super(a10, "string", "MySqlText"), this.config.textType = b10, this.config.enumValues = c10.enum;
        }
        build(a10) {
          return new pp(a10, this.config);
        }
      }
      class pp extends ol {
        static [bK] = "MySqlText";
        textType = this.config.textType;
        enumValues = this.config.enumValues;
        getSQLType() {
          return this.textType;
        }
      }
      function pq(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new po(c10, "text", d10);
      }
      function pr(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new po(c10, "tinytext", d10);
      }
      function ps(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new po(c10, "mediumtext", d10);
      }
      function pt(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new po(c10, "longtext", d10);
      }
      class pu extends ok {
        static [bK] = "MySqlTimeBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlTime"), this.config.fsp = b10?.fsp;
        }
        build(a10) {
          return new pv(a10, this.config);
        }
      }
      class pv extends ol {
        static [bK] = "MySqlTime";
        fsp = this.config.fsp;
        getSQLType() {
          let a10 = void 0 === this.fsp ? "" : `(${this.fsp})`;
          return `time${a10}`;
        }
      }
      function pw(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new pu(c10, d10);
      }
      class px extends ok {
        static [bK] = "MySqlDateColumnBuilder";
        defaultNow() {
          return this.default(cs`(now())`);
        }
        onUpdateNow() {
          return this.config.hasOnUpdateNow = true, this.config.hasDefault = true, this;
        }
      }
      class py extends ol {
        static [bK] = "MySqlDateColumn";
        hasOnUpdateNow = this.config.hasOnUpdateNow;
      }
      class pz extends px {
        static [bK] = "MySqlTimestampBuilder";
        constructor(a10, b10) {
          super(a10, "date", "MySqlTimestamp"), this.config.fsp = b10?.fsp;
        }
        build(a10) {
          return new pA(a10, this.config);
        }
      }
      class pA extends py {
        static [bK] = "MySqlTimestamp";
        fsp = this.config.fsp;
        getSQLType() {
          let a10 = void 0 === this.fsp ? "" : `(${this.fsp})`;
          return `timestamp${a10}`;
        }
        mapFromDriverValue(a10) {
          return /* @__PURE__ */ new Date(a10 + "+0000");
        }
        mapToDriverValue(a10) {
          return a10.toISOString().slice(0, -1).replace("T", " ");
        }
      }
      class pB extends px {
        static [bK] = "MySqlTimestampStringBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlTimestampString"), this.config.fsp = b10?.fsp;
        }
        build(a10) {
          return new pC(a10, this.config);
        }
      }
      class pC extends py {
        static [bK] = "MySqlTimestampString";
        fsp = this.config.fsp;
        getSQLType() {
          let a10 = void 0 === this.fsp ? "" : `(${this.fsp})`;
          return `timestamp${a10}`;
        }
      }
      function pD(a10, b10 = {}) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return d10?.mode === "string" ? new pB(c10, d10) : new pz(c10, d10);
      }
      class pE extends om {
        static [bK] = "MySqlTinyIntBuilder";
        constructor(a10, b10) {
          super(a10, "number", "MySqlTinyInt"), this.config.unsigned = !!b10 && b10.unsigned;
        }
        build(a10) {
          return new pF(a10, this.config);
        }
      }
      class pF extends on {
        static [bK] = "MySqlTinyInt";
        getSQLType() {
          return `tinyint${this.config.unsigned ? " unsigned" : ""}`;
        }
        mapFromDriverValue(a10) {
          return "string" == typeof a10 ? Number(a10) : a10;
        }
      }
      function pG(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new pE(c10, d10);
      }
      var pH = c(356).Buffer;
      class pI extends ok {
        static [bK] = "MySqlVarBinaryBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlVarBinary"), this.config.length = b10?.length;
        }
        build(a10) {
          return new pJ(a10, this.config);
        }
      }
      class pJ extends ol {
        static [bK] = "MySqlVarBinary";
        length = this.config.length;
        mapFromDriverValue(a10) {
          if ("string" == typeof a10) return a10;
          if (pH.isBuffer(a10)) return a10.toString();
          let b10 = [];
          for (let c10 of a10) b10.push(49 === c10 ? "1" : "0");
          return b10.join("");
        }
        getSQLType() {
          return void 0 === this.length ? "varbinary" : `varbinary(${this.length})`;
        }
      }
      function pK(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new pI(c10, d10);
      }
      class pL extends ok {
        static [bK] = "MySqlVarCharBuilder";
        constructor(a10, b10) {
          super(a10, "string", "MySqlVarChar"), this.config.length = b10.length, this.config.enum = b10.enum;
        }
        build(a10) {
          return new pM(a10, this.config);
        }
      }
      class pM extends ol {
        static [bK] = "MySqlVarChar";
        length = this.config.length;
        enumValues = this.config.enum;
        getSQLType() {
          return void 0 === this.length ? "varchar" : `varchar(${this.length})`;
        }
      }
      function pN(a10, b10) {
        let { name: c10, config: d10 } = c1(a10, b10);
        return new pL(c10, d10);
      }
      class pO extends ok {
        static [bK] = "MySqlYearBuilder";
        constructor(a10) {
          super(a10, "number", "MySqlYear");
        }
        build(a10) {
          return new pP(a10, this.config);
        }
      }
      class pP extends ol {
        static [bK] = "MySqlYear";
        getSQLType() {
          return "year";
        }
      }
      function pQ(a10) {
        return new pO(a10 ?? "");
      }
      let pR = Symbol.for("drizzle:MySqlInlineForeignKeys");
      class pS extends bW {
        static [bK] = "MySqlTable";
        static Symbol = Object.assign({}, bW.Symbol, { InlineForeignKeys: pR });
        [bW.Symbol.Columns];
        [pR] = [];
        [bW.Symbol.ExtraConfigBuilder] = void 0;
      }
      let pT = (a10, b10, c10) => function(a11, b11, c11, d10, e10 = a11) {
        let f10 = new pS(a11, d10, e10), g10 = Object.fromEntries(Object.entries("function" == typeof b11 ? b11({ bigint: os, binary: ow, boolean: oz, char: oC, customType: oF, date: oK, datetime: oP, decimal: oW, double: oZ, mysqlEnum: o2, float: o5, int: o8, json: pb, mediumint: pe, real: ph, serial: pk, smallint: pn, text: pq, time: pw, timestamp: pD, tinyint: pG, varbinary: pK, varchar: pN, year: pQ, longtext: pt, mediumtext: ps, tinytext: pr }) : b11).map(([a12, b12]) => {
          b12.setName(a12);
          let c12 = b12.build(f10);
          return f10[pR].push(...b12.buildForeignKeys(c12, f10)), [a12, c12];
        })), h10 = Object.assign(f10, g10);
        return h10[bW.Symbol.Columns] = g10, h10[bW.Symbol.ExtraConfigColumns] = g10, c11 && (h10[pS.Symbol.ExtraConfigBuilder] = c11), h10;
      }(a10, b10, c10, void 0, a10);
      class pU extends cw {
        static [bK] = "MySqlViewBase";
      }
      class pV {
        static [bK] = "MySqlDialect";
        casing;
        constructor(a10) {
          this.casing = new fo(a10?.casing);
        }
        async migrate(a10, b10, c10) {
          let d10 = c10.migrationsTable ?? "__drizzle_migrations", e10 = cs`
			create table if not exists ${cs.identifier(d10)} (
				id serial primary key,
				hash text not null,
				created_at bigint
			)
		`;
          await b10.execute(e10);
          let f10 = (await b10.all(cs`select id, hash, created_at from ${cs.identifier(d10)} order by created_at desc limit 1`))[0];
          await b10.transaction(async (b11) => {
            for (let c11 of a10) if (!f10 || Number(f10.created_at) < c11.folderMillis) {
              for (let a11 of c11.sql) await b11.execute(cs.raw(a11));
              await b11.execute(cs`insert into ${cs.identifier(d10)} (\`hash\`, \`created_at\`) values(${c11.hash}, ${c11.folderMillis})`);
            }
          });
        }
        escapeName(a10) {
          return `\`${a10}\``;
        }
        escapeParam(a10) {
          return "?";
        }
        escapeString(a10) {
          return `'${a10.replace(/'/g, "''")}'`;
        }
        buildWithCTE(a10) {
          if (!a10?.length) return;
          let b10 = [cs`with `];
          for (let [c10, d10] of a10.entries()) b10.push(cs`${cs.identifier(d10._.alias)} as (${d10._.sql})`), c10 < a10.length - 1 && b10.push(cs`, `);
          return b10.push(cs` `), cs.join(b10);
        }
        buildDeleteQuery({ table: a10, where: b10, returning: c10, withList: d10, limit: e10, orderBy: f10 }) {
          let g10 = this.buildWithCTE(d10), h10 = c10 ? cs` returning ${this.buildSelection(c10, { isSingleTable: true })}` : void 0, i10 = b10 ? cs` where ${b10}` : void 0, j10 = this.buildOrderBy(f10), k10 = this.buildLimit(e10);
          return cs`${g10}delete from ${a10}${i10}${j10}${k10}${h10}`;
        }
        buildUpdateSet(a10, b10) {
          let c10 = a10[bW.Symbol.Columns], d10 = Object.keys(c10).filter((a11) => void 0 !== b10[a11] || c10[a11]?.onUpdateFn !== void 0), e10 = d10.length;
          return cs.join(d10.flatMap((a11, d11) => {
            let f10 = c10[a11], g10 = f10.onUpdateFn?.(), h10 = b10[a11] ?? (bL(g10, cn) ? g10 : cs.param(g10, f10)), i10 = cs`${cs.identifier(this.casing.getColumnCasing(f10))} = ${h10}`;
            return d11 < e10 - 1 ? [i10, cs.raw(", ")] : [i10];
          }));
        }
        buildUpdateQuery({ table: a10, set: b10, where: c10, returning: d10, withList: e10, limit: f10, orderBy: g10 }) {
          let h10 = this.buildWithCTE(e10), i10 = this.buildUpdateSet(a10, b10), j10 = d10 ? cs` returning ${this.buildSelection(d10, { isSingleTable: true })}` : void 0, k10 = c10 ? cs` where ${c10}` : void 0, l10 = this.buildOrderBy(g10), m10 = this.buildLimit(f10);
          return cs`${h10}update ${a10} set ${i10}${k10}${l10}${m10}${j10}`;
        }
        buildSelection(a10, { isSingleTable: b10 = false } = {}) {
          let c10 = a10.length, d10 = a10.flatMap(({ field: a11 }, d11) => {
            let e10 = [];
            if (bL(a11, cn.Aliased) && a11.isSelectionField) e10.push(cs.identifier(a11.fieldAlias));
            else if (bL(a11, cn.Aliased) || bL(a11, cn)) {
              let c11 = bL(a11, cn.Aliased) ? a11.sql : a11;
              b10 ? e10.push(new cn(c11.queryChunks.map((a12) => bL(a12, ol) ? cs.identifier(this.casing.getColumnCasing(a12)) : a12))) : e10.push(c11), bL(a11, cn.Aliased) && e10.push(cs` as ${cs.identifier(a11.fieldAlias)}`);
            } else if (bL(a11, bM)) b10 ? e10.push(cs.identifier(this.casing.getColumnCasing(a11))) : e10.push(a11);
            else if (bL(a11, cg)) {
              let b11 = Object.entries(a11._.selectedFields);
              if (1 === b11.length) {
                let c11 = b11[0][1], d12 = bL(c11, cn) ? c11.decoder : bL(c11, bM) ? { mapFromDriverValue: (a12) => c11.mapFromDriverValue(a12) } : c11.sql.decoder;
                d12 && (a11._.sql.decoder = d12);
              }
              e10.push(a11);
            }
            return d11 < c10 - 1 && e10.push(cs`, `), e10;
          });
          return cs.join(d10);
        }
        buildLimit(a10) {
          return "object" == typeof a10 || "number" == typeof a10 && a10 >= 0 ? cs` limit ${a10}` : void 0;
        }
        buildOrderBy(a10) {
          return a10 && a10.length > 0 ? cs` order by ${cs.join(a10, cs`, `)}` : void 0;
        }
        buildIndex({ indexes: a10, indexFor: b10 }) {
          return a10 && a10.length > 0 ? cs` ${cs.raw(b10)} INDEX (${cs.raw(a10.join(", "))})` : void 0;
        }
        buildSelectQuery({ withList: a10, fields: b10, fieldsFlat: c10, where: d10, having: e10, table: f10, joins: g10, orderBy: h10, groupBy: i10, limit: j10, offset: k10, lockingClause: l10, distinct: m10, setOperators: n10, useIndex: o10, forceIndex: p10, ignoreIndex: q3 }) {
          let r2, s2 = c10 ?? cX(b10);
          for (let a11 of s2) {
            let b11;
            if (bL(a11.field, bM) && a11.field.table[bN] !== (bL(f10, cg) ? f10._.alias : bL(f10, pU) ? f10[cj].name : bL(f10, cn) ? void 0 : f10[bN]) && (b11 = a11.field.table, !g10?.some(({ alias: a12 }) => a12 === (b11[bW.Symbol.IsAlias] ? b11[bN] : b11[bW.Symbol.BaseName])))) {
              let b12 = a11.field.table[bN];
              throw Error(`Your "${a11.path.join("->")}" field references a column "${b12}"."${a11.field.name}", but the table "${b12}" is not part of the query! Did you forget to join it?`);
            }
          }
          let t2 = !g10 || 0 === g10.length, u2 = this.buildWithCTE(a10), v2 = m10 ? cs` distinct` : void 0, w2 = this.buildSelection(s2, { isSingleTable: t2 }), x2 = bL(f10, bW) && f10[bW.Symbol.IsAlias] ? cs`${cs`${cs.identifier(f10[bW.Symbol.Schema] ?? "")}.`.if(f10[bW.Symbol.Schema])}${cs.identifier(f10[bW.Symbol.OriginalName])} ${cs.identifier(f10[bW.Symbol.Name])}` : f10, y2 = [];
          if (g10) for (let [a11, b11] of g10.entries()) {
            0 === a11 && y2.push(cs` `);
            let c11 = b11.table, d11 = b11.lateral ? cs` lateral` : void 0, e11 = b11.on ? cs` on ${b11.on}` : void 0;
            if (bL(c11, pS)) {
              let a12 = c11[pS.Symbol.Name], f11 = c11[pS.Symbol.Schema], g11 = c11[pS.Symbol.OriginalName], h11 = a12 === g11 ? void 0 : b11.alias, i11 = this.buildIndex({ indexes: b11.useIndex, indexFor: "USE" }), j11 = this.buildIndex({ indexes: b11.forceIndex, indexFor: "FORCE" }), k11 = this.buildIndex({ indexes: b11.ignoreIndex, indexFor: "IGNORE" });
              y2.push(cs`${cs.raw(b11.joinType)} join${d11} ${f11 ? cs`${cs.identifier(f11)}.` : void 0}${cs.identifier(g11)}${i11}${j11}${k11}${h11 && cs` ${cs.identifier(h11)}`}${e11}`);
            } else if (bL(c11, cw)) {
              let a12 = c11[cj].name, f11 = c11[cj].schema, g11 = c11[cj].originalName, h11 = a12 === g11 ? void 0 : b11.alias;
              y2.push(cs`${cs.raw(b11.joinType)} join${d11} ${f11 ? cs`${cs.identifier(f11)}.` : void 0}${cs.identifier(g11)}${h11 && cs` ${cs.identifier(h11)}`}${e11}`);
            } else y2.push(cs`${cs.raw(b11.joinType)} join${d11} ${c11}${e11}`);
            a11 < g10.length - 1 && y2.push(cs` `);
          }
          let z2 = cs.join(y2), A2 = d10 ? cs` where ${d10}` : void 0, B2 = e10 ? cs` having ${e10}` : void 0, C2 = this.buildOrderBy(h10), D2 = i10 && i10.length > 0 ? cs` group by ${cs.join(i10, cs`, `)}` : void 0, E2 = this.buildLimit(j10), F2 = k10 ? cs` offset ${k10}` : void 0, G2 = this.buildIndex({ indexes: o10, indexFor: "USE" }), H2 = this.buildIndex({ indexes: p10, indexFor: "FORCE" }), I2 = this.buildIndex({ indexes: q3, indexFor: "IGNORE" });
          if (l10) {
            let { config: a11, strength: b11 } = l10;
            r2 = cs` for ${cs.raw(b11)}`, a11.noWait ? r2.append(cs` nowait`) : a11.skipLocked && r2.append(cs` skip locked`);
          }
          let J2 = cs`${u2}select${v2} ${w2} from ${x2}${G2}${H2}${I2}${z2}${A2}${D2}${B2}${C2}${E2}${F2}${r2}`;
          return n10.length > 0 ? this.buildSetOperations(J2, n10) : J2;
        }
        buildSetOperations(a10, b10) {
          let [c10, ...d10] = b10;
          if (!c10) throw Error("Cannot pass undefined values to any set operator");
          return 0 === d10.length ? this.buildSetOperationQuery({ leftSelect: a10, setOperator: c10 }) : this.buildSetOperations(this.buildSetOperationQuery({ leftSelect: a10, setOperator: c10 }), d10);
        }
        buildSetOperationQuery({ leftSelect: a10, setOperator: { type: b10, isAll: c10, rightSelect: d10, limit: e10, orderBy: f10, offset: g10 } }) {
          let h10, i10 = cs`(${a10.getSQL()}) `, j10 = cs`(${d10.getSQL()})`;
          if (f10 && f10.length > 0) {
            let a11 = [];
            for (let b11 of f10) if (bL(b11, ol)) a11.push(cs.identifier(this.casing.getColumnCasing(b11)));
            else if (bL(b11, cn)) {
              for (let a12 = 0; a12 < b11.queryChunks.length; a12++) {
                let c11 = b11.queryChunks[a12];
                bL(c11, ol) && (b11.queryChunks[a12] = cs.identifier(this.casing.getColumnCasing(c11)));
              }
              a11.push(cs`${b11}`);
            } else a11.push(cs`${b11}`);
            h10 = cs` order by ${cs.join(a11, cs`, `)} `;
          }
          let k10 = "object" == typeof e10 || "number" == typeof e10 && e10 >= 0 ? cs` limit ${e10}` : void 0, l10 = cs.raw(`${b10} ${c10 ? "all " : ""}`), m10 = g10 ? cs` offset ${g10}` : void 0;
          return cs`${i10}${l10}${j10}${h10}${k10}${m10}`;
        }
        buildInsertQuery({ table: a10, values: b10, ignore: c10, onConflict: d10, select: e10 }) {
          let f10 = [], g10 = Object.entries(a10[bW.Symbol.Columns]).filter(([a11, b11]) => !b11.shouldDisableInsert()), h10 = g10.map(([, a11]) => cs.identifier(this.casing.getColumnCasing(a11))), i10 = [];
          if (e10) bL(b10, cn) ? f10.push(b10) : f10.push(b10.getSQL());
          else for (let [a11, c11] of (f10.push(cs.raw("values ")), b10.entries())) {
            let d11 = {}, e11 = [];
            for (let [a12, b11] of g10) {
              let f11 = c11[a12];
              if (void 0 === f11 || bL(f11, cr) && void 0 === f11.value) if (void 0 !== b11.defaultFn) {
                let c12 = b11.defaultFn();
                d11[a12] = c12;
                let f12 = bL(c12, cn) ? c12 : cs.param(c12, b11);
                e11.push(f12);
              } else if (b11.default || void 0 === b11.onUpdateFn) e11.push(cs`default`);
              else {
                let a13 = b11.onUpdateFn(), c12 = bL(a13, cn) ? a13 : cs.param(a13, b11);
                e11.push(c12);
              }
              else b11.defaultFn && bL(f11, cr) && (d11[a12] = f11.value), e11.push(f11);
            }
            i10.push(d11), f10.push(e11), a11 < b10.length - 1 && f10.push(cs`, `);
          }
          let j10 = cs.join(f10), k10 = c10 ? cs` ignore` : void 0, l10 = d10 ? cs` on duplicate key ${d10}` : void 0;
          return { sql: cs`insert${k10} into ${a10} ${h10} ${j10}${l10}`, generatedIds: i10 };
        }
        sqlToQuery(a10, b10) {
          return a10.toQuery({ casing: this.casing, escapeName: this.escapeName, escapeParam: this.escapeParam, escapeString: this.escapeString, invokeSource: b10 });
        }
        buildRelationalQuery({ fullSchema: a10, schema: b10, tableNamesMap: c10, table: d10, tableConfig: e10, queryConfig: f10, tableAlias: g10, nestedQueryRelation: h10, joinOn: i10 }) {
          let j10, k10, l10, m10, n10, o10 = [], p10 = [];
          if (true === f10) o10 = Object.entries(e10.columns).map(([a11, b11]) => ({ dbKey: b11.name, tsKey: a11, field: fh(b11, g10), relationTableTsKey: void 0, isJson: false, selection: [] }));
          else {
            let d11 = Object.fromEntries(Object.entries(e10.columns).map(([a11, b11]) => [a11, fh(b11, g10)]));
            if (f10.where) {
              let a11 = "function" == typeof f10.where ? f10.where(d11, e7()) : f10.where;
              m10 = a11 && fj(a11, g10);
            }
            let h11 = [], i11 = [];
            if (f10.columns) {
              let a11 = false;
              for (let [b11, c11] of Object.entries(f10.columns)) void 0 !== c11 && b11 in e10.columns && (a11 || true !== c11 || (a11 = true), i11.push(b11));
              i11.length > 0 && (i11 = a11 ? i11.filter((a12) => f10.columns?.[a12] === true) : Object.keys(e10.columns).filter((a12) => !i11.includes(a12)));
            } else i11 = Object.keys(e10.columns);
            for (let a11 of i11) {
              let b11 = e10.columns[a11];
              h11.push({ tsKey: a11, value: b11 });
            }
            let n11 = [];
            if (f10.with && (n11 = Object.entries(f10.with).filter((a11) => !!a11[1]).map(([a11, b11]) => ({ tsKey: a11, queryConfig: b11, relation: e10.relations[a11] }))), f10.extras) for (let [a11, b11] of Object.entries("function" == typeof f10.extras ? f10.extras(d11, { sql: cs }) : f10.extras)) h11.push({ tsKey: a11, value: fi(b11, g10) });
            for (let { tsKey: a11, value: b11 } of h11) o10.push({ dbKey: bL(b11, cn.Aliased) ? b11.fieldAlias : e10.columns[a11].name, tsKey: a11, field: bL(b11, bM) ? fh(b11, g10) : b11, relationTableTsKey: void 0, isJson: false, selection: [] });
            let q3 = "function" == typeof f10.orderBy ? f10.orderBy(d11, e8()) : f10.orderBy ?? [];
            for (let { tsKey: d12, queryConfig: e11, relation: h12 } of (Array.isArray(q3) || (q3 = [q3]), l10 = q3.map((a11) => bL(a11, bM) ? fh(a11, g10) : fj(a11, g10)), j10 = f10.limit, k10 = f10.offset, n11)) {
              let f11 = fa(b10, c10, h12), i12 = c10[bX(h12.referencedTable)], j11 = `${g10}_${d12}`, k11 = cA(...f11.fields.map((a11, b11) => cy(fh(f11.references[b11], j11), fh(a11, g10)))), l11 = this.buildRelationalQuery({ fullSchema: a10, schema: b10, tableNamesMap: c10, table: a10[i12], tableConfig: b10[i12], queryConfig: bL(h12, e5) ? true === e11 ? { limit: 1 } : { ...e11, limit: 1 } : e11, tableAlias: j11, joinOn: k11, nestedQueryRelation: h12 }), m11 = cs`${cs.identifier(j11)}.${cs.identifier("data")}`.as(d12);
              p10.push({ on: cs`true`, table: new cg(l11.sql, {}, j11), alias: j11, joinType: "left", lateral: true }), o10.push({ dbKey: d12, tsKey: d12, field: m11, relationTableTsKey: i12, isJson: true, selection: l11.selection });
            }
          }
          if (0 === o10.length) throw new fp({ message: `No fields selected for table "${e10.tsName}" ("${g10}")` });
          if (m10 = cA(i10, m10), h10) {
            let a11 = cs`json_array(${cs.join(o10.map(({ field: a12, tsKey: b12, isJson: c11 }) => c11 ? cs`${cs.identifier(`${g10}_${b12}`)}.${cs.identifier("data")}` : bL(a12, cn.Aliased) ? a12.sql : a12), cs`, `)})`;
            bL(h10, e6) && (a11 = cs`coalesce(json_arrayagg(${a11}), json_array())`);
            let b11 = [{ dbKey: "data", tsKey: "data", field: a11.as("data"), isJson: true, relationTableTsKey: e10.tsName, selection: o10 }];
            void 0 !== j10 || void 0 !== k10 || (l10?.length ?? 0) > 0 ? (n10 = this.buildSelectQuery({ table: fg(d10, g10), fields: {}, fieldsFlat: [{ path: [], field: cs.raw("*") }, ...(l10?.length ?? 0) > 0 ? [{ path: [], field: cs`row_number() over (order by ${cs.join(l10, cs`, `)})` }] : []], where: m10, limit: j10, offset: k10, setOperators: [] }), m10 = void 0, j10 = void 0, k10 = void 0, l10 = void 0) : n10 = fg(d10, g10), n10 = this.buildSelectQuery({ table: bL(n10, pS) ? n10 : new cg(n10, {}, g10), fields: {}, fieldsFlat: b11.map(({ field: a12 }) => ({ path: [], field: bL(a12, bM) ? fh(a12, g10) : a12 })), joins: p10, where: m10, limit: j10, offset: k10, orderBy: l10, setOperators: [] });
          } else n10 = this.buildSelectQuery({ table: fg(d10, g10), fields: {}, fieldsFlat: o10.map(({ field: a11 }) => ({ path: [], field: bL(a11, bM) ? fh(a11, g10) : a11 })), joins: p10, where: m10, limit: j10, offset: k10, orderBy: l10, setOperators: [] });
          return { tableTsKey: e10.tsName, sql: n10, selection: o10 };
        }
        buildRelationalQueryWithoutLateralSubqueries({ fullSchema: a10, schema: b10, tableNamesMap: c10, table: d10, tableConfig: e10, queryConfig: f10, tableAlias: g10, nestedQueryRelation: h10, joinOn: i10 }) {
          let j10, k10 = [], l10, m10, n10 = [], o10;
          if (true === f10) k10 = Object.entries(e10.columns).map(([a11, b11]) => ({ dbKey: b11.name, tsKey: a11, field: fh(b11, g10), relationTableTsKey: void 0, isJson: false, selection: [] }));
          else {
            let d11 = Object.fromEntries(Object.entries(e10.columns).map(([a11, b11]) => [a11, fh(b11, g10)]));
            if (f10.where) {
              let a11 = "function" == typeof f10.where ? f10.where(d11, e7()) : f10.where;
              o10 = a11 && fj(a11, g10);
            }
            let h11 = [], i11 = [];
            if (f10.columns) {
              let a11 = false;
              for (let [b11, c11] of Object.entries(f10.columns)) void 0 !== c11 && b11 in e10.columns && (a11 || true !== c11 || (a11 = true), i11.push(b11));
              i11.length > 0 && (i11 = a11 ? i11.filter((a12) => f10.columns?.[a12] === true) : Object.keys(e10.columns).filter((a12) => !i11.includes(a12)));
            } else i11 = Object.keys(e10.columns);
            for (let a11 of i11) {
              let b11 = e10.columns[a11];
              h11.push({ tsKey: a11, value: b11 });
            }
            let j11 = [];
            if (f10.with && (j11 = Object.entries(f10.with).filter((a11) => !!a11[1]).map(([a11, b11]) => ({ tsKey: a11, queryConfig: b11, relation: e10.relations[a11] }))), f10.extras) for (let [a11, b11] of Object.entries("function" == typeof f10.extras ? f10.extras(d11, { sql: cs }) : f10.extras)) h11.push({ tsKey: a11, value: fi(b11, g10) });
            for (let { tsKey: a11, value: b11 } of h11) k10.push({ dbKey: bL(b11, cn.Aliased) ? b11.fieldAlias : e10.columns[a11].name, tsKey: a11, field: bL(b11, bM) ? fh(b11, g10) : b11, relationTableTsKey: void 0, isJson: false, selection: [] });
            let p10 = "function" == typeof f10.orderBy ? f10.orderBy(d11, e8()) : f10.orderBy ?? [];
            for (let { tsKey: d12, queryConfig: e11, relation: h12 } of (Array.isArray(p10) || (p10 = [p10]), n10 = p10.map((a11) => bL(a11, bM) ? fh(a11, g10) : fj(a11, g10)), l10 = f10.limit, m10 = f10.offset, j11)) {
              let f11 = fa(b10, c10, h12), i12 = c10[bX(h12.referencedTable)], j12 = `${g10}_${d12}`, l11 = cA(...f11.fields.map((a11, b11) => cy(fh(f11.references[b11], j12), fh(a11, g10)))), m11 = this.buildRelationalQueryWithoutLateralSubqueries({ fullSchema: a10, schema: b10, tableNamesMap: c10, table: a10[i12], tableConfig: b10[i12], queryConfig: bL(h12, e5) ? true === e11 ? { limit: 1 } : { ...e11, limit: 1 } : e11, tableAlias: j12, joinOn: l11, nestedQueryRelation: h12 }), n11 = cs`(${m11.sql})`;
              bL(h12, e6) && (n11 = cs`coalesce(${n11}, json_array())`);
              let o11 = n11.as(d12);
              k10.push({ dbKey: d12, tsKey: d12, field: o11, relationTableTsKey: i12, isJson: true, selection: m11.selection });
            }
          }
          if (0 === k10.length) throw new fp({ message: `No fields selected for table "${e10.tsName}" ("${g10}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.` });
          if (o10 = cA(i10, o10), h10) {
            let a11 = cs`json_array(${cs.join(k10.map(({ field: a12 }) => bL(a12, ol) ? cs.identifier(this.casing.getColumnCasing(a12)) : bL(a12, cn.Aliased) ? a12.sql : a12), cs`, `)})`;
            bL(h10, e6) && (a11 = cs`json_arrayagg(${a11})`);
            let b11 = [{ dbKey: "data", tsKey: "data", field: a11, isJson: true, relationTableTsKey: e10.tsName, selection: k10 }];
            void 0 !== l10 || void 0 !== m10 || n10.length > 0 ? (j10 = this.buildSelectQuery({ table: fg(d10, g10), fields: {}, fieldsFlat: [{ path: [], field: cs.raw("*") }, ...n10.length > 0 ? [{ path: [], field: cs`row_number() over (order by ${cs.join(n10, cs`, `)})` }] : []], where: o10, limit: l10, offset: m10, setOperators: [] }), o10 = void 0, l10 = void 0, m10 = void 0, n10 = void 0) : j10 = fg(d10, g10), j10 = this.buildSelectQuery({ table: bL(j10, pS) ? j10 : new cg(j10, {}, g10), fields: {}, fieldsFlat: b11.map(({ field: a12 }) => ({ path: [], field: bL(a12, bM) ? fh(a12, g10) : a12 })), where: o10, limit: l10, offset: m10, orderBy: n10, setOperators: [] });
          } else j10 = this.buildSelectQuery({ table: fg(d10, g10), fields: {}, fieldsFlat: k10.map(({ field: a11 }) => ({ path: [], field: bL(a11, bM) ? fh(a11, g10) : a11 })), where: o10, limit: l10, offset: m10, orderBy: n10, setOperators: [] });
          return { tableTsKey: e10.tsName, sql: j10, selection: k10 };
        }
      }
      function pW(a10) {
        return bL(a10, pS) ? [`${a10[bW.Symbol.BaseName]}`] : bL(a10, cg) ? a10._.usedTables ?? [] : bL(a10, cn) ? a10.usedTables ?? [] : [];
      }
      function pX(a10) {
        return a10.map((a11) => "object" == typeof a11 ? a11.config.name : a11);
      }
      function pY(a10) {
        return Array.isArray(a10) ? a10 : [a10];
      }
      class pZ {
        static [bK] = "MySqlSelectBuilder";
        fields;
        session;
        dialect;
        withList = [];
        distinct;
        constructor(a10) {
          this.fields = a10.fields, this.session = a10.session, this.dialect = a10.dialect, a10.withList && (this.withList = a10.withList), this.distinct = a10.distinct;
        }
        from(a10, b10) {
          let c10, d10 = !!this.fields;
          c10 = this.fields ? this.fields : bL(a10, cg) ? Object.fromEntries(Object.keys(a10._.selectedFields).map((b11) => [b11, a10[b11]])) : bL(a10, pU) ? a10[cj].selectedFields : bL(a10, cn) ? {} : c_(a10);
          let e10 = [], f10 = [], g10 = [];
          return bL(a10, pS) && b10 && "string" != typeof b10 && (b10.useIndex && (e10 = pX(pY(b10.useIndex))), b10.forceIndex && (f10 = pX(pY(b10.forceIndex))), b10.ignoreIndex && (g10 = pX(pY(b10.ignoreIndex)))), new p_({ table: a10, fields: c10, isPartialSelect: d10, session: this.session, dialect: this.dialect, withList: this.withList, distinct: this.distinct, useIndex: e10, forceIndex: f10, ignoreIndex: g10 });
        }
      }
      class p$ extends ge {
        static [bK] = "MySqlSelectQueryBuilder";
        _;
        config;
        joinsNotNullableMap;
        tableName;
        isPartialSelect;
        session;
        dialect;
        cacheConfig = void 0;
        usedTables = /* @__PURE__ */ new Set();
        constructor({ table: a10, fields: b10, isPartialSelect: c10, session: d10, dialect: e10, withList: f10, distinct: g10, useIndex: h10, forceIndex: i10, ignoreIndex: j10 }) {
          for (let k10 of (super(), this.config = { withList: f10, table: a10, fields: { ...b10 }, distinct: g10, setOperators: [], useIndex: h10, forceIndex: i10, ignoreIndex: j10 }, this.isPartialSelect = c10, this.session = d10, this.dialect = e10, this._ = { selectedFields: b10, config: this.config }, this.tableName = c0(a10), this.joinsNotNullableMap = "string" == typeof this.tableName ? { [this.tableName]: true } : {}, pW(a10))) this.usedTables.add(k10);
        }
        getUsedTables() {
          return [...this.usedTables];
        }
        createJoin(a10, b10) {
          return (c10, d10, e10) => {
            let f10 = "cross" === a10, g10 = f10 ? void 0 : d10, h10 = f10 ? d10 : e10, i10 = this.tableName, j10 = c0(c10);
            for (let a11 of pW(c10)) this.usedTables.add(a11);
            if ("string" == typeof j10 && this.config.joins?.some((a11) => a11.alias === j10)) throw Error(`Alias "${j10}" is already used in this query`);
            if (!this.isPartialSelect && (1 === Object.keys(this.joinsNotNullableMap).length && "string" == typeof i10 && (this.config.fields = { [i10]: this.config.fields }), "string" == typeof j10 && !bL(c10, cn))) {
              let a11 = bL(c10, cg) ? c10._.selectedFields : bL(c10, cw) ? c10[cj].selectedFields : c10[bW.Symbol.Columns];
              this.config.fields[j10] = a11;
            }
            "function" == typeof g10 && (g10 = g10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.joins || (this.config.joins = []);
            let k10 = [], l10 = [], m10 = [];
            if (bL(c10, pS) && h10 && "string" != typeof h10 && (h10.useIndex && (k10 = pX(pY(h10.useIndex))), h10.forceIndex && (l10 = pX(pY(h10.forceIndex))), h10.ignoreIndex && (m10 = pX(pY(h10.ignoreIndex)))), this.config.joins.push({ on: g10, table: c10, joinType: a10, alias: j10, useIndex: k10, forceIndex: l10, ignoreIndex: m10, lateral: b10 }), "string" == typeof j10) switch (a10) {
              case "left":
                this.joinsNotNullableMap[j10] = false;
                break;
              case "right":
                this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([a11]) => [a11, false])), this.joinsNotNullableMap[j10] = true;
                break;
              case "cross":
              case "inner":
                this.joinsNotNullableMap[j10] = true;
            }
            return this;
          };
        }
        leftJoin = this.createJoin("left", false);
        leftJoinLateral = this.createJoin("left", true);
        rightJoin = this.createJoin("right", false);
        innerJoin = this.createJoin("inner", false);
        innerJoinLateral = this.createJoin("inner", true);
        crossJoin = this.createJoin("cross", false);
        crossJoinLateral = this.createJoin("cross", true);
        createSetOperator(a10, b10) {
          return (c10) => {
            let d10 = "function" == typeof c10 ? c10(p1()) : c10;
            if (!cY(this.getSelectedFields(), d10.getSelectedFields())) throw Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
            return this.config.setOperators.push({ type: a10, isAll: b10, rightSelect: d10 }), this;
          };
        }
        union = this.createSetOperator("union", false);
        unionAll = this.createSetOperator("union", true);
        intersect = this.createSetOperator("intersect", false);
        intersectAll = this.createSetOperator("intersect", true);
        except = this.createSetOperator("except", false);
        exceptAll = this.createSetOperator("except", true);
        addSetOperators(a10) {
          return this.config.setOperators.push(...a10), this;
        }
        where(a10) {
          return "function" == typeof a10 && (a10 = a10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.where = a10, this;
        }
        having(a10) {
          return "function" == typeof a10 && (a10 = a10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.having = a10, this;
        }
        groupBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })));
            this.config.groupBy = Array.isArray(b10) ? b10 : [b10];
          } else this.config.groupBy = a10;
          return this;
        }
        orderBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" }))), c10 = Array.isArray(b10) ? b10 : [b10];
            this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).orderBy = c10 : this.config.orderBy = c10;
          } else this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).orderBy = a10 : this.config.orderBy = a10;
          return this;
        }
        limit(a10) {
          return this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).limit = a10 : this.config.limit = a10, this;
        }
        offset(a10) {
          return this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).offset = a10 : this.config.offset = a10, this;
        }
        for(a10, b10 = {}) {
          return this.config.lockingClause = { strength: a10, config: b10 }, this;
        }
        getSQL() {
          return this.dialect.buildSelectQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        as(a10) {
          let b10 = [];
          if (b10.push(...pW(this.config.table)), this.config.joins) for (let a11 of this.config.joins) b10.push(...pW(a11.table));
          return new Proxy(new cg(this.getSQL(), this.config.fields, a10, false, [...new Set(b10)]), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
        }
        getSelectedFields() {
          return new Proxy(this.config.fields, new fk({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
        }
        $dynamic() {
          return this;
        }
        $withCache(a10) {
          return this.cacheConfig = void 0 === a10 ? { config: {}, enable: true, autoInvalidate: true } : false === a10 ? { enable: false } : { enable: true, autoInvalidate: true, ...a10 }, this;
        }
      }
      class p_ extends p$ {
        static [bK] = "MySqlSelect";
        prepare() {
          if (!this.session) throw Error("Cannot execute a query on a query builder. Please use a database instance instead.");
          let a10 = cX(this.config.fields), b10 = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), a10, void 0, void 0, void 0, { type: "select", tables: [...this.usedTables] }, this.cacheConfig);
          return b10.joinsNotNullableMap = this.joinsNotNullableMap, b10;
        }
        execute = (a10) => this.prepare().execute(a10);
        createIterator = () => {
          let a10 = this;
          return async function* (b10) {
            yield* a10.prepare().iterator(b10);
          };
        };
        iterator = this.createIterator();
      }
      function p0(a10, b10) {
        return (c10, d10, ...e10) => {
          let f10 = [d10, ...e10].map((c11) => ({ type: a10, isAll: b10, rightSelect: c11 }));
          for (let a11 of f10) if (!cY(c10.getSelectedFields(), a11.rightSelect.getSelectedFields())) throw Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
          return c10.addSetOperators(f10);
        };
      }
      c$(p_, [gf]);
      let p1 = () => ({ union: p2, unionAll: p3, intersect: p4, intersectAll: p5, except: p6, exceptAll: p7 }), p2 = p0("union", false), p3 = p0("union", true), p4 = p0("intersect", false), p5 = p0("intersect", true), p6 = p0("except", false), p7 = p0("except", true);
      class p8 {
        static [bK] = "MySqlQueryBuilder";
        dialect;
        dialectConfig;
        constructor(a10) {
          this.dialect = bL(a10, pV) ? a10 : void 0, this.dialectConfig = bL(a10, pV) ? void 0 : a10;
        }
        $with = (a10, b10) => {
          let c10 = this;
          return { as: (d10) => ("function" == typeof d10 && (d10 = d10(c10)), new Proxy(new ch(d10.getSQL(), b10 ?? ("getSelectedFields" in d10 ? d10.getSelectedFields() ?? {} : {}), a10, true), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }))) };
        };
        with(...a10) {
          let b10 = this;
          return { select: function(c10) {
            return new pZ({ fields: c10 ?? void 0, session: void 0, dialect: b10.getDialect(), withList: a10 });
          }, selectDistinct: function(c10) {
            return new pZ({ fields: c10 ?? void 0, session: void 0, dialect: b10.getDialect(), withList: a10, distinct: true });
          } };
        }
        select(a10) {
          return new pZ({ fields: a10 ?? void 0, session: void 0, dialect: this.getDialect() });
        }
        selectDistinct(a10) {
          return new pZ({ fields: a10 ?? void 0, session: void 0, dialect: this.getDialect(), distinct: true });
        }
        getDialect() {
          return this.dialect || (this.dialect = new pV(this.dialectConfig)), this.dialect;
        }
      }
      class p9 {
        constructor(a10, b10, c10, d10) {
          this.table = a10, this.session = b10, this.dialect = c10, this.withList = d10;
        }
        static [bK] = "MySqlUpdateBuilder";
        set(a10) {
          return new qa(this.table, cZ(this.table, a10), this.session, this.dialect, this.withList);
        }
      }
      class qa extends gf {
        constructor(a10, b10, c10, d10, e10) {
          super(), this.session = c10, this.dialect = d10, this.config = { set: b10, table: a10, withList: e10 };
        }
        static [bK] = "MySqlUpdate";
        config;
        cacheConfig;
        where(a10) {
          return this.config.where = a10, this;
        }
        orderBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.table[bW.Symbol.Columns], new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" }))), c10 = Array.isArray(b10) ? b10 : [b10];
            this.config.orderBy = c10;
          } else this.config.orderBy = a10;
          return this;
        }
        limit(a10) {
          return this.config.limit = a10, this;
        }
        getSQL() {
          return this.dialect.buildUpdateQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        prepare() {
          return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), void 0, void 0, void 0, this.config.returning, { type: "insert", tables: pW(this.config.table) }, this.cacheConfig);
        }
        execute = (a10) => this.prepare().execute(a10);
        createIterator = () => {
          let a10 = this;
          return async function* (b10) {
            yield* a10.prepare().iterator(b10);
          };
        };
        iterator = this.createIterator();
        $dynamic() {
          return this;
        }
      }
      class qb extends gf {
        constructor(a10, b10, c10, d10) {
          super(), this.table = a10, this.session = b10, this.dialect = c10, this.config = { table: a10, withList: d10 };
        }
        static [bK] = "MySqlDelete";
        config;
        where(a10) {
          return this.config.where = a10, this;
        }
        orderBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.table[bW.Symbol.Columns], new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" }))), c10 = Array.isArray(b10) ? b10 : [b10];
            this.config.orderBy = c10;
          } else this.config.orderBy = a10;
          return this;
        }
        limit(a10) {
          return this.config.limit = a10, this;
        }
        getSQL() {
          return this.dialect.buildDeleteQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        prepare() {
          return this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, void 0, void 0, void 0, { type: "delete", tables: pW(this.config.table) });
        }
        execute = (a10) => this.prepare().execute(a10);
        createIterator = () => {
          let a10 = this;
          return async function* (b10) {
            yield* a10.prepare().iterator(b10);
          };
        };
        iterator = this.createIterator();
        $dynamic() {
          return this;
        }
      }
      class qc {
        constructor(a10, b10, c10) {
          this.table = a10, this.session = b10, this.dialect = c10;
        }
        static [bK] = "MySqlInsertBuilder";
        shouldIgnore = false;
        ignore() {
          return this.shouldIgnore = true, this;
        }
        values(a10) {
          if (0 === (a10 = Array.isArray(a10) ? a10 : [a10]).length) throw Error("values() must be called with at least one value");
          let b10 = a10.map((a11) => {
            let b11 = {}, c10 = this.table[bW.Symbol.Columns];
            for (let d10 of Object.keys(a11)) {
              let e10 = a11[d10];
              b11[d10] = bL(e10, cn) ? e10 : new cr(e10, c10[d10]);
            }
            return b11;
          });
          return new qd(this.table, b10, this.shouldIgnore, this.session, this.dialect);
        }
        select(a10) {
          let b10 = "function" == typeof a10 ? a10(new p8()) : a10;
          if (!bL(b10, cn) && !cY(this.table[bP], b10._.selectedFields)) throw Error("Insert select error: selected fields are not the same or are in a different order compared to the table definition");
          return new qd(this.table, b10, this.shouldIgnore, this.session, this.dialect, true);
        }
      }
      class qd extends gf {
        constructor(a10, b10, c10, d10, e10, f10) {
          super(), this.session = d10, this.dialect = e10, this.config = { table: a10, values: b10, select: f10, ignore: c10 };
        }
        static [bK] = "MySqlInsert";
        config;
        cacheConfig;
        onDuplicateKeyUpdate(a10) {
          let b10 = this.dialect.buildUpdateSet(this.config.table, cZ(this.config.table, a10.set));
          return this.config.onConflict = cs`update ${b10}`, this;
        }
        $returningId() {
          let a10 = [];
          for (let [b10, c10] of Object.entries(this.config.table[bW.Symbol.Columns])) c10.primary && a10.push({ field: c10, path: [b10] });
          return this.config.returning = a10, this;
        }
        getSQL() {
          return this.dialect.buildInsertQuery(this.config).sql;
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        prepare() {
          let { sql: a10, generatedIds: b10 } = this.dialect.buildInsertQuery(this.config);
          return this.session.prepareQuery(this.dialect.sqlToQuery(a10), void 0, void 0, b10, this.config.returning, { type: "insert", tables: pW(this.config.table) }, this.cacheConfig);
        }
        execute = (a10) => this.prepare().execute(a10);
        createIterator = () => {
          let a10 = this;
          return async function* (b10) {
            yield* a10.prepare().iterator(b10);
          };
        };
        iterator = this.createIterator();
        $dynamic() {
          return this;
        }
      }
      class qe {
        constructor(a10, b10, c10, d10, e10, f10, g10, h10) {
          this.fullSchema = a10, this.schema = b10, this.tableNamesMap = c10, this.table = d10, this.tableConfig = e10, this.dialect = f10, this.session = g10, this.mode = h10;
        }
        static [bK] = "MySqlRelationalQueryBuilder";
        findMany(a10) {
          return new qf(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, a10 || {}, "many", this.mode);
        }
        findFirst(a10) {
          return new qf(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, a10 ? { ...a10, limit: 1 } : { limit: 1 }, "first", this.mode);
        }
      }
      class qf extends gf {
        constructor(a10, b10, c10, d10, e10, f10, g10, h10, i10, j10) {
          super(), this.fullSchema = a10, this.schema = b10, this.tableNamesMap = c10, this.table = d10, this.tableConfig = e10, this.dialect = f10, this.session = g10, this.config = h10, this.queryMode = i10, this.mode = j10;
        }
        static [bK] = "MySqlRelationalQuery";
        prepare() {
          let { query: a10, builtQuery: b10 } = this._toSQL();
          return this.session.prepareQuery(b10, void 0, (b11) => {
            let c10 = b11.map((b12) => fc(this.schema, this.tableConfig, b12, a10.selection));
            return "first" === this.queryMode ? c10[0] : c10;
          });
        }
        _getQuery() {
          return "planetscale" === this.mode ? this.dialect.buildRelationalQueryWithoutLateralSubqueries({ fullSchema: this.fullSchema, schema: this.schema, tableNamesMap: this.tableNamesMap, table: this.table, tableConfig: this.tableConfig, queryConfig: this.config, tableAlias: this.tableConfig.tsName }) : this.dialect.buildRelationalQuery({ fullSchema: this.fullSchema, schema: this.schema, tableNamesMap: this.tableNamesMap, table: this.table, tableConfig: this.tableConfig, queryConfig: this.config, tableAlias: this.tableConfig.tsName });
        }
        _toSQL() {
          let a10 = this._getQuery();
          return { builtQuery: this.dialect.sqlToQuery(a10.sql), query: a10 };
        }
        getSQL() {
          return this._getQuery().sql;
        }
        toSQL() {
          return this._toSQL().builtQuery;
        }
        execute() {
          return this.prepare().execute();
        }
      }
      class qg {
        constructor(a10, b10, c10, d10) {
          if (this.dialect = a10, this.session = b10, this.mode = d10, this._ = c10 ? { schema: c10.schema, fullSchema: c10.fullSchema, tableNamesMap: c10.tableNamesMap } : { schema: void 0, fullSchema: {}, tableNamesMap: {} }, this.query = {}, this._.schema) for (let [d11, e10] of Object.entries(this._.schema)) this.query[d11] = new qe(c10.fullSchema, this._.schema, this._.tableNamesMap, c10.fullSchema[d11], e10, a10, b10, this.mode);
          this.$cache = { invalidate: async (a11) => {
          } };
        }
        static [bK] = "MySqlDatabase";
        query;
        $with = (a10, b10) => {
          let c10 = this;
          return { as: (d10) => ("function" == typeof d10 && (d10 = d10(new p8(c10.dialect))), new Proxy(new ch(d10.getSQL(), b10 ?? ("getSelectedFields" in d10 ? d10.getSelectedFields() ?? {} : {}), a10, true), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }))) };
        };
        $count(a10, b10) {
          return new od({ source: a10, filters: b10, session: this.session });
        }
        $cache;
        with(...a10) {
          let b10 = this;
          return { select: function(c10) {
            return new pZ({ fields: c10 ?? void 0, session: b10.session, dialect: b10.dialect, withList: a10 });
          }, selectDistinct: function(c10) {
            return new pZ({ fields: c10 ?? void 0, session: b10.session, dialect: b10.dialect, withList: a10, distinct: true });
          }, update: function(c10) {
            return new p9(c10, b10.session, b10.dialect, a10);
          }, delete: function(c10) {
            return new qb(c10, b10.session, b10.dialect, a10);
          } };
        }
        select(a10) {
          return new pZ({ fields: a10 ?? void 0, session: this.session, dialect: this.dialect });
        }
        selectDistinct(a10) {
          return new pZ({ fields: a10 ?? void 0, session: this.session, dialect: this.dialect, distinct: true });
        }
        update(a10) {
          return new p9(a10, this.session, this.dialect);
        }
        insert(a10) {
          return new qc(a10, this.session, this.dialect);
        }
        delete(a10) {
          return new qb(a10, this.session, this.dialect);
        }
        execute(a10) {
          return this.session.execute("string" == typeof a10 ? cs.raw(a10) : a10.getSQL());
        }
        transaction(a10, b10) {
          return this.session.transaction(a10, b10);
        }
      }
      class qh extends cw {
        static [bK] = "PgViewBase";
      }
      class qi {
        static [bK] = "PgDialect";
        casing;
        constructor(a10) {
          this.casing = new fo(a10?.casing);
        }
        async migrate(a10, b10, c10) {
          let d10 = "string" == typeof c10 ? "__drizzle_migrations" : c10.migrationsTable ?? "__drizzle_migrations", e10 = "string" == typeof c10 ? "drizzle" : c10.migrationsSchema ?? "drizzle", f10 = cs`
			CREATE TABLE IF NOT EXISTS ${cs.identifier(e10)}.${cs.identifier(d10)} (
				id SERIAL PRIMARY KEY,
				hash text NOT NULL,
				created_at bigint
			)
		`;
          await b10.execute(cs`CREATE SCHEMA IF NOT EXISTS ${cs.identifier(e10)}`), await b10.execute(f10);
          let g10 = (await b10.all(cs`select id, hash, created_at from ${cs.identifier(e10)}.${cs.identifier(d10)} order by created_at desc limit 1`))[0];
          await b10.transaction(async (b11) => {
            for await (let c11 of a10) if (!g10 || Number(g10.created_at) < c11.folderMillis) {
              for (let a11 of c11.sql) await b11.execute(cs.raw(a11));
              await b11.execute(cs`insert into ${cs.identifier(e10)}.${cs.identifier(d10)} ("hash", "created_at") values(${c11.hash}, ${c11.folderMillis})`);
            }
          });
        }
        escapeName(a10) {
          return `"${a10}"`;
        }
        escapeParam(a10) {
          return `$${a10 + 1}`;
        }
        escapeString(a10) {
          return `'${a10.replace(/'/g, "''")}'`;
        }
        buildWithCTE(a10) {
          if (!a10?.length) return;
          let b10 = [cs`with `];
          for (let [c10, d10] of a10.entries()) b10.push(cs`${cs.identifier(d10._.alias)} as (${d10._.sql})`), c10 < a10.length - 1 && b10.push(cs`, `);
          return b10.push(cs` `), cs.join(b10);
        }
        buildDeleteQuery({ table: a10, where: b10, returning: c10, withList: d10 }) {
          let e10 = this.buildWithCTE(d10), f10 = c10 ? cs` returning ${this.buildSelection(c10, { isSingleTable: true })}` : void 0, g10 = b10 ? cs` where ${b10}` : void 0;
          return cs`${e10}delete from ${a10}${g10}${f10}`;
        }
        buildUpdateSet(a10, b10) {
          let c10 = a10[bW.Symbol.Columns], d10 = Object.keys(c10).filter((a11) => void 0 !== b10[a11] || c10[a11]?.onUpdateFn !== void 0), e10 = d10.length;
          return cs.join(d10.flatMap((a11, d11) => {
            let f10 = c10[a11], g10 = f10.onUpdateFn?.(), h10 = b10[a11] ?? (bL(g10, cn) ? g10 : cs.param(g10, f10)), i10 = cs`${cs.identifier(this.casing.getColumnCasing(f10))} = ${h10}`;
            return d11 < e10 - 1 ? [i10, cs.raw(", ")] : [i10];
          }));
        }
        buildUpdateQuery({ table: a10, set: b10, where: c10, returning: d10, withList: e10, from: f10, joins: g10 }) {
          let h10 = this.buildWithCTE(e10), i10 = a10[eY.Symbol.Name], j10 = a10[eY.Symbol.Schema], k10 = a10[eY.Symbol.OriginalName], l10 = i10 === k10 ? void 0 : i10, m10 = cs`${j10 ? cs`${cs.identifier(j10)}.` : void 0}${cs.identifier(k10)}${l10 && cs` ${cs.identifier(l10)}`}`, n10 = this.buildUpdateSet(a10, b10), o10 = f10 && cs.join([cs.raw(" from "), this.buildFromTable(f10)]), p10 = this.buildJoins(g10), q3 = d10 ? cs` returning ${this.buildSelection(d10, { isSingleTable: !f10 })}` : void 0, r2 = c10 ? cs` where ${c10}` : void 0;
          return cs`${h10}update ${m10} set ${n10}${o10}${p10}${r2}${q3}`;
        }
        buildSelection(a10, { isSingleTable: b10 = false } = {}) {
          let c10 = a10.length, d10 = a10.flatMap(({ field: a11 }, d11) => {
            let e10 = [];
            if (bL(a11, cn.Aliased) && a11.isSelectionField) e10.push(cs.identifier(a11.fieldAlias));
            else if (bL(a11, cn.Aliased) || bL(a11, cn)) {
              let c11 = bL(a11, cn.Aliased) ? a11.sql : a11;
              b10 ? e10.push(new cn(c11.queryChunks.map((a12) => bL(a12, b6) ? cs.identifier(this.casing.getColumnCasing(a12)) : a12))) : e10.push(c11), bL(a11, cn.Aliased) && e10.push(cs` as ${cs.identifier(a11.fieldAlias)}`);
            } else if (bL(a11, bM)) b10 ? e10.push(cs.identifier(this.casing.getColumnCasing(a11))) : e10.push(a11);
            else if (bL(a11, cg)) {
              let b11 = Object.entries(a11._.selectedFields);
              if (1 === b11.length) {
                let c11 = b11[0][1], d12 = bL(c11, cn) ? c11.decoder : bL(c11, bM) ? { mapFromDriverValue: (a12) => c11.mapFromDriverValue(a12) } : c11.sql.decoder;
                d12 && (a11._.sql.decoder = d12);
              }
              e10.push(a11);
            }
            return d11 < c10 - 1 && e10.push(cs`, `), e10;
          });
          return cs.join(d10);
        }
        buildJoins(a10) {
          if (!a10 || 0 === a10.length) return;
          let b10 = [];
          for (let [c10, d10] of a10.entries()) {
            0 === c10 && b10.push(cs` `);
            let e10 = d10.table, f10 = d10.lateral ? cs` lateral` : void 0, g10 = d10.on ? cs` on ${d10.on}` : void 0;
            if (bL(e10, eY)) {
              let a11 = e10[eY.Symbol.Name], c11 = e10[eY.Symbol.Schema], h10 = e10[eY.Symbol.OriginalName], i10 = a11 === h10 ? void 0 : d10.alias;
              b10.push(cs`${cs.raw(d10.joinType)} join${f10} ${c11 ? cs`${cs.identifier(c11)}.` : void 0}${cs.identifier(h10)}${i10 && cs` ${cs.identifier(i10)}`}${g10}`);
            } else if (bL(e10, cw)) {
              let a11 = e10[cj].name, c11 = e10[cj].schema, h10 = e10[cj].originalName, i10 = a11 === h10 ? void 0 : d10.alias;
              b10.push(cs`${cs.raw(d10.joinType)} join${f10} ${c11 ? cs`${cs.identifier(c11)}.` : void 0}${cs.identifier(h10)}${i10 && cs` ${cs.identifier(i10)}`}${g10}`);
            } else b10.push(cs`${cs.raw(d10.joinType)} join${f10} ${e10}${g10}`);
            c10 < a10.length - 1 && b10.push(cs` `);
          }
          return cs.join(b10);
        }
        buildFromTable(a10) {
          if (bL(a10, bW) && a10[bW.Symbol.IsAlias]) {
            let b10 = cs`${cs.identifier(a10[bW.Symbol.OriginalName])}`;
            return a10[bW.Symbol.Schema] && (b10 = cs`${cs.identifier(a10[bW.Symbol.Schema])}.${b10}`), cs`${b10} ${cs.identifier(a10[bW.Symbol.Name])}`;
          }
          return a10;
        }
        buildSelectQuery({ withList: a10, fields: b10, fieldsFlat: c10, where: d10, having: e10, table: f10, joins: g10, orderBy: h10, groupBy: i10, limit: j10, offset: k10, lockingClause: l10, distinct: m10, setOperators: n10 }) {
          let o10, p10, q3, r2 = c10 ?? cX(b10);
          for (let a11 of r2) {
            let b11;
            if (bL(a11.field, bM) && a11.field.table[bN] !== (bL(f10, cg) ? f10._.alias : bL(f10, qh) ? f10[cj].name : bL(f10, cn) ? void 0 : f10[bN]) && (b11 = a11.field.table, !g10?.some(({ alias: a12 }) => a12 === (b11[bW.Symbol.IsAlias] ? b11[bN] : b11[bW.Symbol.BaseName])))) {
              let b12 = a11.field.table[bN];
              throw Error(`Your "${a11.path.join("->")}" field references a column "${b12}"."${a11.field.name}", but the table "${b12}" is not part of the query! Did you forget to join it?`);
            }
          }
          let s2 = !g10 || 0 === g10.length, t2 = this.buildWithCTE(a10);
          m10 && (o10 = true === m10 ? cs` distinct` : cs` distinct on (${cs.join(m10.on, cs`, `)})`);
          let u2 = this.buildSelection(r2, { isSingleTable: s2 }), v2 = this.buildFromTable(f10), w2 = this.buildJoins(g10), x2 = d10 ? cs` where ${d10}` : void 0, y2 = e10 ? cs` having ${e10}` : void 0;
          h10 && h10.length > 0 && (p10 = cs` order by ${cs.join(h10, cs`, `)}`), i10 && i10.length > 0 && (q3 = cs` group by ${cs.join(i10, cs`, `)}`);
          let z2 = "object" == typeof j10 || "number" == typeof j10 && j10 >= 0 ? cs` limit ${j10}` : void 0, A2 = k10 ? cs` offset ${k10}` : void 0, B2 = cs.empty();
          if (l10) {
            let a11 = cs` for ${cs.raw(l10.strength)}`;
            l10.config.of && a11.append(cs` of ${cs.join(Array.isArray(l10.config.of) ? l10.config.of : [l10.config.of], cs`, `)}`), l10.config.noWait ? a11.append(cs` nowait`) : l10.config.skipLocked && a11.append(cs` skip locked`), B2.append(a11);
          }
          let C2 = cs`${t2}select${o10} ${u2} from ${v2}${w2}${x2}${q3}${y2}${p10}${z2}${A2}${B2}`;
          return n10.length > 0 ? this.buildSetOperations(C2, n10) : C2;
        }
        buildSetOperations(a10, b10) {
          let [c10, ...d10] = b10;
          if (!c10) throw Error("Cannot pass undefined values to any set operator");
          return 0 === d10.length ? this.buildSetOperationQuery({ leftSelect: a10, setOperator: c10 }) : this.buildSetOperations(this.buildSetOperationQuery({ leftSelect: a10, setOperator: c10 }), d10);
        }
        buildSetOperationQuery({ leftSelect: a10, setOperator: { type: b10, isAll: c10, rightSelect: d10, limit: e10, orderBy: f10, offset: g10 } }) {
          let h10, i10 = cs`(${a10.getSQL()}) `, j10 = cs`(${d10.getSQL()})`;
          if (f10 && f10.length > 0) {
            let a11 = [];
            for (let b11 of f10) if (bL(b11, b6)) a11.push(cs.identifier(b11.name));
            else if (bL(b11, cn)) {
              for (let a12 = 0; a12 < b11.queryChunks.length; a12++) {
                let c11 = b11.queryChunks[a12];
                bL(c11, b6) && (b11.queryChunks[a12] = cs.identifier(c11.name));
              }
              a11.push(cs`${b11}`);
            } else a11.push(cs`${b11}`);
            h10 = cs` order by ${cs.join(a11, cs`, `)} `;
          }
          let k10 = "object" == typeof e10 || "number" == typeof e10 && e10 >= 0 ? cs` limit ${e10}` : void 0, l10 = cs.raw(`${b10} ${c10 ? "all " : ""}`), m10 = g10 ? cs` offset ${g10}` : void 0;
          return cs`${i10}${l10}${j10}${h10}${k10}${m10}`;
        }
        buildInsertQuery({ table: a10, values: b10, onConflict: c10, returning: d10, withList: e10, select: f10, overridingSystemValue_: g10 }) {
          let h10 = [], i10 = Object.entries(a10[bW.Symbol.Columns]).filter(([a11, b11]) => !b11.shouldDisableInsert()), j10 = i10.map(([, a11]) => cs.identifier(this.casing.getColumnCasing(a11)));
          if (f10) bL(b10, cn) ? h10.push(b10) : h10.push(b10.getSQL());
          else for (let [a11, c11] of (h10.push(cs.raw("values ")), b10.entries())) {
            let d11 = [];
            for (let [a12, b11] of i10) {
              let e11 = c11[a12];
              if (void 0 === e11 || bL(e11, cr) && void 0 === e11.value) if (void 0 !== b11.defaultFn) {
                let a13 = b11.defaultFn(), c12 = bL(a13, cn) ? a13 : cs.param(a13, b11);
                d11.push(c12);
              } else if (b11.default || void 0 === b11.onUpdateFn) d11.push(cs`default`);
              else {
                let a13 = b11.onUpdateFn(), c12 = bL(a13, cn) ? a13 : cs.param(a13, b11);
                d11.push(c12);
              }
              else d11.push(e11);
            }
            h10.push(d11), a11 < b10.length - 1 && h10.push(cs`, `);
          }
          let k10 = this.buildWithCTE(e10), l10 = cs.join(h10), m10 = d10 ? cs` returning ${this.buildSelection(d10, { isSingleTable: true })}` : void 0, n10 = c10 ? cs` on conflict ${c10}` : void 0, o10 = true === g10 ? cs`overriding system value ` : void 0;
          return cs`${k10}insert into ${a10} ${j10} ${o10}${l10}${n10}${m10}`;
        }
        buildRefreshMaterializedViewQuery({ view: a10, concurrently: b10, withNoData: c10 }) {
          let d10 = b10 ? cs` concurrently` : void 0, e10 = c10 ? cs` with no data` : void 0;
          return cs`refresh materialized view${d10} ${a10}${e10}`;
        }
        prepareTyping(a10) {
          if (bL(a10, dN) || bL(a10, dK)) return "json";
          if (bL(a10, d_)) return "decimal";
          if (bL(a10, ex)) return "time";
          if (bL(a10, eA) || bL(a10, eC)) return "timestamp";
          if (bL(a10, dt) || bL(a10, dv)) return "date";
          else if (bL(a10, eF)) return "uuid";
          else return "none";
        }
        sqlToQuery(a10, b10) {
          return a10.toQuery({ casing: this.casing, escapeName: this.escapeName, escapeParam: this.escapeParam, escapeString: this.escapeString, prepareTyping: this.prepareTyping, invokeSource: b10 });
        }
        buildRelationalQueryWithoutPK({ fullSchema: a10, schema: b10, tableNamesMap: c10, table: d10, tableConfig: e10, queryConfig: f10, tableAlias: g10, nestedQueryRelation: h10, joinOn: i10 }) {
          let j10, k10 = [], l10, m10, n10 = [], o10, p10 = [];
          if (true === f10) k10 = Object.entries(e10.columns).map(([a11, b11]) => ({ dbKey: b11.name, tsKey: a11, field: fh(b11, g10), relationTableTsKey: void 0, isJson: false, selection: [] }));
          else {
            let d11 = Object.fromEntries(Object.entries(e10.columns).map(([a11, b11]) => [a11, fh(b11, g10)]));
            if (f10.where) {
              let a11 = "function" == typeof f10.where ? f10.where(d11, e7()) : f10.where;
              o10 = a11 && fj(a11, g10);
            }
            let h11 = [], i11 = [];
            if (f10.columns) {
              let a11 = false;
              for (let [b11, c11] of Object.entries(f10.columns)) void 0 !== c11 && b11 in e10.columns && (a11 || true !== c11 || (a11 = true), i11.push(b11));
              i11.length > 0 && (i11 = a11 ? i11.filter((a12) => f10.columns?.[a12] === true) : Object.keys(e10.columns).filter((a12) => !i11.includes(a12)));
            } else i11 = Object.keys(e10.columns);
            for (let a11 of i11) {
              let b11 = e10.columns[a11];
              h11.push({ tsKey: a11, value: b11 });
            }
            let j11 = [];
            if (f10.with && (j11 = Object.entries(f10.with).filter((a11) => !!a11[1]).map(([a11, b11]) => ({ tsKey: a11, queryConfig: b11, relation: e10.relations[a11] }))), f10.extras) for (let [a11, b11] of Object.entries("function" == typeof f10.extras ? f10.extras(d11, { sql: cs }) : f10.extras)) h11.push({ tsKey: a11, value: fi(b11, g10) });
            for (let { tsKey: a11, value: b11 } of h11) k10.push({ dbKey: bL(b11, cn.Aliased) ? b11.fieldAlias : e10.columns[a11].name, tsKey: a11, field: bL(b11, bM) ? fh(b11, g10) : b11, relationTableTsKey: void 0, isJson: false, selection: [] });
            let q3 = "function" == typeof f10.orderBy ? f10.orderBy(d11, e8()) : f10.orderBy ?? [];
            for (let { tsKey: d12, queryConfig: e11, relation: h12 } of (Array.isArray(q3) || (q3 = [q3]), n10 = q3.map((a11) => bL(a11, bM) ? fh(a11, g10) : fj(a11, g10)), l10 = f10.limit, m10 = f10.offset, j11)) {
              let f11 = fa(b10, c10, h12), i12 = c10[bX(h12.referencedTable)], j12 = `${g10}_${d12}`, l11 = cA(...f11.fields.map((a11, b11) => cy(fh(f11.references[b11], j12), fh(a11, g10)))), m11 = this.buildRelationalQueryWithoutPK({ fullSchema: a10, schema: b10, tableNamesMap: c10, table: a10[i12], tableConfig: b10[i12], queryConfig: bL(h12, e5) ? true === e11 ? { limit: 1 } : { ...e11, limit: 1 } : e11, tableAlias: j12, joinOn: l11, nestedQueryRelation: h12 }), n11 = cs`${cs.identifier(j12)}.${cs.identifier("data")}`.as(d12);
              p10.push({ on: cs`true`, table: new cg(m11.sql, {}, j12), alias: j12, joinType: "left", lateral: true }), k10.push({ dbKey: d12, tsKey: d12, field: n11, relationTableTsKey: i12, isJson: true, selection: m11.selection });
            }
          }
          if (0 === k10.length) throw new fp({ message: `No fields selected for table "${e10.tsName}" ("${g10}")` });
          if (o10 = cA(i10, o10), h10) {
            let a11 = cs`json_build_array(${cs.join(k10.map(({ field: a12, tsKey: b12, isJson: c11 }) => c11 ? cs`${cs.identifier(`${g10}_${b12}`)}.${cs.identifier("data")}` : bL(a12, cn.Aliased) ? a12.sql : a12), cs`, `)})`;
            bL(h10, e6) && (a11 = cs`coalesce(json_agg(${a11}${n10.length > 0 ? cs` order by ${cs.join(n10, cs`, `)}` : void 0}), '[]'::json)`);
            let b11 = [{ dbKey: "data", tsKey: "data", field: a11.as("data"), isJson: true, relationTableTsKey: e10.tsName, selection: k10 }];
            void 0 !== l10 || void 0 !== m10 || n10.length > 0 ? (j10 = this.buildSelectQuery({ table: fg(d10, g10), fields: {}, fieldsFlat: [{ path: [], field: cs.raw("*") }], where: o10, limit: l10, offset: m10, orderBy: n10, setOperators: [] }), o10 = void 0, l10 = void 0, m10 = void 0, n10 = []) : j10 = fg(d10, g10), j10 = this.buildSelectQuery({ table: bL(j10, eY) ? j10 : new cg(j10, {}, g10), fields: {}, fieldsFlat: b11.map(({ field: a12 }) => ({ path: [], field: bL(a12, bM) ? fh(a12, g10) : a12 })), joins: p10, where: o10, limit: l10, offset: m10, orderBy: n10, setOperators: [] });
          } else j10 = this.buildSelectQuery({ table: fg(d10, g10), fields: {}, fieldsFlat: k10.map(({ field: a11 }) => ({ path: [], field: bL(a11, bM) ? fh(a11, g10) : a11 })), joins: p10, where: o10, limit: l10, offset: m10, orderBy: n10, setOperators: [] });
          return { tableTsKey: e10.tsName, sql: j10, selection: k10 };
        }
      }
      function qj(a10) {
        return bL(a10, eY) ? [a10[bO] ? `${a10[bO]}.${a10[bW.Symbol.BaseName]}` : a10[bW.Symbol.BaseName]] : bL(a10, cg) ? a10._.usedTables ?? [] : bL(a10, cn) ? a10.usedTables ?? [] : [];
      }
      class qk {
        static [bK] = "PgSelectBuilder";
        fields;
        session;
        dialect;
        withList = [];
        distinct;
        constructor(a10) {
          this.fields = a10.fields, this.session = a10.session, this.dialect = a10.dialect, a10.withList && (this.withList = a10.withList), this.distinct = a10.distinct;
        }
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        from(a10) {
          let b10, c10 = !!this.fields;
          return b10 = this.fields ? this.fields : bL(a10, cg) ? Object.fromEntries(Object.keys(a10._.selectedFields).map((b11) => [b11, a10[b11]])) : bL(a10, qh) ? a10[cj].selectedFields : bL(a10, cn) ? {} : c_(a10), new qm({ table: a10, fields: b10, isPartialSelect: c10, session: this.session, dialect: this.dialect, withList: this.withList, distinct: this.distinct }).setToken(this.authToken);
        }
      }
      class ql extends ge {
        static [bK] = "PgSelectQueryBuilder";
        _;
        config;
        joinsNotNullableMap;
        tableName;
        isPartialSelect;
        session;
        dialect;
        cacheConfig = void 0;
        usedTables = /* @__PURE__ */ new Set();
        constructor({ table: a10, fields: b10, isPartialSelect: c10, session: d10, dialect: e10, withList: f10, distinct: g10 }) {
          for (let h10 of (super(), this.config = { withList: f10, table: a10, fields: { ...b10 }, distinct: g10, setOperators: [] }, this.isPartialSelect = c10, this.session = d10, this.dialect = e10, this._ = { selectedFields: b10, config: this.config }, this.tableName = c0(a10), this.joinsNotNullableMap = "string" == typeof this.tableName ? { [this.tableName]: true } : {}, qj(a10))) this.usedTables.add(h10);
        }
        getUsedTables() {
          return [...this.usedTables];
        }
        createJoin(a10, b10) {
          return (c10, d10) => {
            let e10 = this.tableName, f10 = c0(c10);
            for (let a11 of qj(c10)) this.usedTables.add(a11);
            if ("string" == typeof f10 && this.config.joins?.some((a11) => a11.alias === f10)) throw Error(`Alias "${f10}" is already used in this query`);
            if (!this.isPartialSelect && (1 === Object.keys(this.joinsNotNullableMap).length && "string" == typeof e10 && (this.config.fields = { [e10]: this.config.fields }), "string" == typeof f10 && !bL(c10, cn))) {
              let a11 = bL(c10, cg) ? c10._.selectedFields : bL(c10, cw) ? c10[cj].selectedFields : c10[bW.Symbol.Columns];
              this.config.fields[f10] = a11;
            }
            if ("function" == typeof d10 && (d10 = d10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.joins || (this.config.joins = []), this.config.joins.push({ on: d10, table: c10, joinType: a10, alias: f10, lateral: b10 }), "string" == typeof f10) switch (a10) {
              case "left":
                this.joinsNotNullableMap[f10] = false;
                break;
              case "right":
                this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([a11]) => [a11, false])), this.joinsNotNullableMap[f10] = true;
                break;
              case "cross":
              case "inner":
                this.joinsNotNullableMap[f10] = true;
                break;
              case "full":
                this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([a11]) => [a11, false])), this.joinsNotNullableMap[f10] = false;
            }
            return this;
          };
        }
        leftJoin = this.createJoin("left", false);
        leftJoinLateral = this.createJoin("left", true);
        rightJoin = this.createJoin("right", false);
        innerJoin = this.createJoin("inner", false);
        innerJoinLateral = this.createJoin("inner", true);
        fullJoin = this.createJoin("full", false);
        crossJoin = this.createJoin("cross", false);
        crossJoinLateral = this.createJoin("cross", true);
        createSetOperator(a10, b10) {
          return (c10) => {
            let d10 = "function" == typeof c10 ? c10(qo()) : c10;
            if (!cY(this.getSelectedFields(), d10.getSelectedFields())) throw Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
            return this.config.setOperators.push({ type: a10, isAll: b10, rightSelect: d10 }), this;
          };
        }
        union = this.createSetOperator("union", false);
        unionAll = this.createSetOperator("union", true);
        intersect = this.createSetOperator("intersect", false);
        intersectAll = this.createSetOperator("intersect", true);
        except = this.createSetOperator("except", false);
        exceptAll = this.createSetOperator("except", true);
        addSetOperators(a10) {
          return this.config.setOperators.push(...a10), this;
        }
        where(a10) {
          return "function" == typeof a10 && (a10 = a10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.where = a10, this;
        }
        having(a10) {
          return "function" == typeof a10 && (a10 = a10(new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })))), this.config.having = a10, this;
        }
        groupBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })));
            this.config.groupBy = Array.isArray(b10) ? b10 : [b10];
          } else this.config.groupBy = a10;
          return this;
        }
        orderBy(...a10) {
          if ("function" == typeof a10[0]) {
            let b10 = a10[0](new Proxy(this.config.fields, new fk({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" }))), c10 = Array.isArray(b10) ? b10 : [b10];
            this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).orderBy = c10 : this.config.orderBy = c10;
          } else this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).orderBy = a10 : this.config.orderBy = a10;
          return this;
        }
        limit(a10) {
          return this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).limit = a10 : this.config.limit = a10, this;
        }
        offset(a10) {
          return this.config.setOperators.length > 0 ? this.config.setOperators.at(-1).offset = a10 : this.config.offset = a10, this;
        }
        for(a10, b10 = {}) {
          return this.config.lockingClause = { strength: a10, config: b10 }, this;
        }
        getSQL() {
          return this.dialect.buildSelectQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        as(a10) {
          let b10 = [];
          if (b10.push(...qj(this.config.table)), this.config.joins) for (let a11 of this.config.joins) b10.push(...qj(a11.table));
          return new Proxy(new cg(this.getSQL(), this.config.fields, a10, false, [...new Set(b10)]), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
        }
        getSelectedFields() {
          return new Proxy(this.config.fields, new fk({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" }));
        }
        $dynamic() {
          return this;
        }
        $withCache(a10) {
          return this.cacheConfig = void 0 === a10 ? { config: {}, enable: true, autoInvalidate: true } : false === a10 ? { enable: false } : { enable: true, autoInvalidate: true, ...a10 }, this;
        }
      }
      class qm extends ql {
        static [bK] = "PgSelect";
        _prepare(a10) {
          let { session: b10, config: c10, dialect: d10, joinsNotNullableMap: e10, authToken: f10, cacheConfig: g10, usedTables: h10 } = this;
          if (!b10) throw Error("Cannot execute a query on a query builder. Please use a database instance instead.");
          let { fields: i10 } = c10;
          return ci.startActiveSpan("drizzle.prepareQuery", () => {
            let c11 = cX(i10), j10 = b10.prepareQuery(d10.sqlToQuery(this.getSQL()), c11, a10, true, void 0, { type: "select", tables: [...h10] }, g10);
            return j10.joinsNotNullableMap = e10, j10.setToken(f10);
          });
        }
        prepare(a10) {
          return this._prepare(a10);
        }
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        execute = (a10) => ci.startActiveSpan("drizzle.operation", () => this._prepare().execute(a10, this.authToken));
      }
      function qn(a10, b10) {
        return (c10, d10, ...e10) => {
          let f10 = [d10, ...e10].map((c11) => ({ type: a10, isAll: b10, rightSelect: c11 }));
          for (let a11 of f10) if (!cY(c10.getSelectedFields(), a11.rightSelect.getSelectedFields())) throw Error("Set operator error (union / intersect / except): selected fields are not the same or are in a different order");
          return c10.addSetOperators(f10);
        };
      }
      c$(qm, [gf]);
      let qo = () => ({ union: qp, unionAll: qq, intersect: qr, intersectAll: qs, except: qt, exceptAll: qu }), qp = qn("union", false), qq = qn("union", true), qr = qn("intersect", false), qs = qn("intersect", true), qt = qn("except", false), qu = qn("except", true);
      class qv {
        static [bK] = "PgQueryBuilder";
        dialect;
        dialectConfig;
        constructor(a10) {
          this.dialect = bL(a10, qi) ? a10 : void 0, this.dialectConfig = bL(a10, qi) ? void 0 : a10;
        }
        $with = (a10, b10) => {
          let c10 = this;
          return { as: (d10) => ("function" == typeof d10 && (d10 = d10(c10)), new Proxy(new ch(d10.getSQL(), b10 ?? ("getSelectedFields" in d10 ? d10.getSelectedFields() ?? {} : {}), a10, true), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }))) };
        };
        with(...a10) {
          let b10 = this;
          return { select: function(c10) {
            return new qk({ fields: c10 ?? void 0, session: void 0, dialect: b10.getDialect(), withList: a10 });
          }, selectDistinct: function(a11) {
            return new qk({ fields: a11 ?? void 0, session: void 0, dialect: b10.getDialect(), distinct: true });
          }, selectDistinctOn: function(a11, c10) {
            return new qk({ fields: c10 ?? void 0, session: void 0, dialect: b10.getDialect(), distinct: { on: a11 } });
          } };
        }
        select(a10) {
          return new qk({ fields: a10 ?? void 0, session: void 0, dialect: this.getDialect() });
        }
        selectDistinct(a10) {
          return new qk({ fields: a10 ?? void 0, session: void 0, dialect: this.getDialect(), distinct: true });
        }
        selectDistinctOn(a10, b10) {
          return new qk({ fields: b10 ?? void 0, session: void 0, dialect: this.getDialect(), distinct: { on: a10 } });
        }
        getDialect() {
          return this.dialect || (this.dialect = new qi(this.dialectConfig)), this.dialect;
        }
      }
      class qw {
        constructor(a10, b10, c10, d10) {
          this.table = a10, this.session = b10, this.dialect = c10, this.withList = d10;
        }
        static [bK] = "PgUpdateBuilder";
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        set(a10) {
          return new qx(this.table, cZ(this.table, a10), this.session, this.dialect, this.withList).setToken(this.authToken);
        }
      }
      class qx extends gf {
        constructor(a10, b10, c10, d10, e10) {
          super(), this.session = c10, this.dialect = d10, this.config = { set: b10, table: a10, withList: e10, joins: [] }, this.tableName = c0(a10), this.joinsNotNullableMap = "string" == typeof this.tableName ? { [this.tableName]: true } : {};
        }
        static [bK] = "PgUpdate";
        config;
        tableName;
        joinsNotNullableMap;
        cacheConfig;
        from(a10) {
          let b10 = c0(a10);
          return "string" == typeof b10 && (this.joinsNotNullableMap[b10] = true), this.config.from = a10, this;
        }
        getTableLikeFields(a10) {
          return bL(a10, eY) ? a10[bW.Symbol.Columns] : bL(a10, cg) ? a10._.selectedFields : a10[cj].selectedFields;
        }
        createJoin(a10) {
          return (b10, c10) => {
            let d10 = c0(b10);
            if ("string" == typeof d10 && this.config.joins.some((a11) => a11.alias === d10)) throw Error(`Alias "${d10}" is already used in this query`);
            if ("function" == typeof c10) {
              let a11 = this.config.from && !bL(this.config.from, cn) ? this.getTableLikeFields(this.config.from) : void 0;
              c10 = c10(new Proxy(this.config.table[bW.Symbol.Columns], new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })), a11 && new Proxy(a11, new fk({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })));
            }
            if (this.config.joins.push({ on: c10, table: b10, joinType: a10, alias: d10 }), "string" == typeof d10) switch (a10) {
              case "left":
                this.joinsNotNullableMap[d10] = false;
                break;
              case "right":
                this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([a11]) => [a11, false])), this.joinsNotNullableMap[d10] = true;
                break;
              case "inner":
                this.joinsNotNullableMap[d10] = true;
                break;
              case "full":
                this.joinsNotNullableMap = Object.fromEntries(Object.entries(this.joinsNotNullableMap).map(([a11]) => [a11, false])), this.joinsNotNullableMap[d10] = false;
            }
            return this;
          };
        }
        leftJoin = this.createJoin("left");
        rightJoin = this.createJoin("right");
        innerJoin = this.createJoin("inner");
        fullJoin = this.createJoin("full");
        where(a10) {
          return this.config.where = a10, this;
        }
        returning(a10) {
          if (!a10 && (a10 = Object.assign({}, this.config.table[bW.Symbol.Columns]), this.config.from)) {
            let b10 = c0(this.config.from);
            if ("string" == typeof b10 && this.config.from && !bL(this.config.from, cn)) {
              let c10 = this.getTableLikeFields(this.config.from);
              a10[b10] = c10;
            }
            for (let b11 of this.config.joins) {
              let c10 = c0(b11.table);
              if ("string" == typeof c10 && !bL(b11.table, cn)) {
                let d10 = this.getTableLikeFields(b11.table);
                a10[c10] = d10;
              }
            }
          }
          return this.config.returningFields = a10, this.config.returning = cX(a10), this;
        }
        getSQL() {
          return this.dialect.buildUpdateQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        _prepare(a10) {
          let b10 = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, a10, true, void 0, { type: "insert", tables: qj(this.config.table) }, this.cacheConfig);
          return b10.joinsNotNullableMap = this.joinsNotNullableMap, b10;
        }
        prepare(a10) {
          return this._prepare(a10);
        }
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        execute = (a10) => this._prepare().execute(a10, this.authToken);
        getSelectedFields() {
          return this.config.returningFields ? new Proxy(this.config.returningFields, new fk({ alias: this.config.table[bN], sqlAliasedBehavior: "alias", sqlBehavior: "error" })) : void 0;
        }
        $dynamic() {
          return this;
        }
      }
      class qy {
        constructor(a10, b10, c10, d10, e10) {
          this.table = a10, this.session = b10, this.dialect = c10, this.withList = d10, this.overridingSystemValue_ = e10;
        }
        static [bK] = "PgInsertBuilder";
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        overridingSystemValue() {
          return this.overridingSystemValue_ = true, this;
        }
        values(a10) {
          if (0 === (a10 = Array.isArray(a10) ? a10 : [a10]).length) throw Error("values() must be called with at least one value");
          let b10 = a10.map((a11) => {
            let b11 = {}, c10 = this.table[bW.Symbol.Columns];
            for (let d10 of Object.keys(a11)) {
              let e10 = a11[d10];
              b11[d10] = bL(e10, cn) ? e10 : new cr(e10, c10[d10]);
            }
            return b11;
          });
          return new qz(this.table, b10, this.session, this.dialect, this.withList, false, this.overridingSystemValue_).setToken(this.authToken);
        }
        select(a10) {
          let b10 = "function" == typeof a10 ? a10(new qv()) : a10;
          if (!bL(b10, cn) && !cY(this.table[bP], b10._.selectedFields)) throw Error("Insert select error: selected fields are not the same or are in a different order compared to the table definition");
          return new qz(this.table, b10, this.session, this.dialect, this.withList, true);
        }
      }
      class qz extends gf {
        constructor(a10, b10, c10, d10, e10, f10, g10) {
          super(), this.session = c10, this.dialect = d10, this.config = { table: a10, values: b10, withList: e10, select: f10, overridingSystemValue_: g10 };
        }
        static [bK] = "PgInsert";
        config;
        cacheConfig;
        returning(a10 = this.config.table[bW.Symbol.Columns]) {
          return this.config.returningFields = a10, this.config.returning = cX(a10), this;
        }
        onConflictDoNothing(a10 = {}) {
          if (void 0 === a10.target) this.config.onConflict = cs`do nothing`;
          else {
            let b10 = "";
            b10 = Array.isArray(a10.target) ? a10.target.map((a11) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(a11))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(a10.target));
            let c10 = a10.where ? cs` where ${a10.where}` : void 0;
            this.config.onConflict = cs`(${cs.raw(b10)})${c10} do nothing`;
          }
          return this;
        }
        onConflictDoUpdate(a10) {
          if (a10.where && (a10.targetWhere || a10.setWhere)) throw Error('You cannot use both "where" and "targetWhere"/"setWhere" at the same time - "where" is deprecated, use "targetWhere" or "setWhere" instead.');
          let b10 = a10.where ? cs` where ${a10.where}` : void 0, c10 = a10.targetWhere ? cs` where ${a10.targetWhere}` : void 0, d10 = a10.setWhere ? cs` where ${a10.setWhere}` : void 0, e10 = this.dialect.buildUpdateSet(this.config.table, cZ(this.config.table, a10.set)), f10 = "";
          return f10 = Array.isArray(a10.target) ? a10.target.map((a11) => this.dialect.escapeName(this.dialect.casing.getColumnCasing(a11))).join(",") : this.dialect.escapeName(this.dialect.casing.getColumnCasing(a10.target)), this.config.onConflict = cs`(${cs.raw(f10)})${c10} do update set ${e10}${b10}${d10}`, this;
        }
        getSQL() {
          return this.dialect.buildInsertQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        _prepare(a10) {
          return ci.startActiveSpan("drizzle.prepareQuery", () => this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, a10, true, void 0, { type: "insert", tables: qj(this.config.table) }, this.cacheConfig));
        }
        prepare(a10) {
          return this._prepare(a10);
        }
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        execute = (a10) => ci.startActiveSpan("drizzle.operation", () => this._prepare().execute(a10, this.authToken));
        getSelectedFields() {
          return this.config.returningFields ? new Proxy(this.config.returningFields, new fk({ alias: this.config.table[bN], sqlAliasedBehavior: "alias", sqlBehavior: "error" })) : void 0;
        }
        $dynamic() {
          return this;
        }
      }
      class qA extends gf {
        constructor(a10, b10, c10, d10) {
          super(), this.session = b10, this.dialect = c10, this.config = { table: a10, withList: d10 };
        }
        static [bK] = "PgDelete";
        config;
        cacheConfig;
        where(a10) {
          return this.config.where = a10, this;
        }
        returning(a10 = this.config.table[bW.Symbol.Columns]) {
          return this.config.returningFields = a10, this.config.returning = cX(a10), this;
        }
        getSQL() {
          return this.dialect.buildDeleteQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        _prepare(a10) {
          return ci.startActiveSpan("drizzle.prepareQuery", () => this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), this.config.returning, a10, true, void 0, { type: "delete", tables: qj(this.config.table) }, this.cacheConfig));
        }
        prepare(a10) {
          return this._prepare(a10);
        }
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        execute = (a10) => ci.startActiveSpan("drizzle.operation", () => this._prepare().execute(a10, this.authToken));
        getSelectedFields() {
          return this.config.returningFields ? new Proxy(this.config.returningFields, new fk({ alias: this.config.table[bN], sqlAliasedBehavior: "alias", sqlBehavior: "error" })) : void 0;
        }
        $dynamic() {
          return this;
        }
      }
      class qB extends cn {
        constructor(a10) {
          super(qB.buildEmbeddedCount(a10.source, a10.filters).queryChunks), this.params = a10, this.mapWith(Number), this.session = a10.session, this.sql = qB.buildCount(a10.source, a10.filters);
        }
        sql;
        token;
        static [bK] = "PgCountBuilder";
        [Symbol.toStringTag] = "PgCountBuilder";
        session;
        static buildEmbeddedCount(a10, b10) {
          return cs`(select count(*) from ${a10}${cs.raw(" where ").if(b10)}${b10})`;
        }
        static buildCount(a10, b10) {
          return cs`select count(*) as count from ${a10}${cs.raw(" where ").if(b10)}${b10};`;
        }
        setToken(a10) {
          return this.token = a10, this;
        }
        then(a10, b10) {
          return Promise.resolve(this.session.count(this.sql, this.token)).then(a10, b10);
        }
        catch(a10) {
          return this.then(void 0, a10);
        }
        finally(a10) {
          return this.then((b10) => (a10?.(), b10), (b10) => {
            throw a10?.(), b10;
          });
        }
      }
      class qC {
        constructor(a10, b10, c10, d10, e10, f10, g10) {
          this.fullSchema = a10, this.schema = b10, this.tableNamesMap = c10, this.table = d10, this.tableConfig = e10, this.dialect = f10, this.session = g10;
        }
        static [bK] = "PgRelationalQueryBuilder";
        findMany(a10) {
          return new qD(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, a10 || {}, "many");
        }
        findFirst(a10) {
          return new qD(this.fullSchema, this.schema, this.tableNamesMap, this.table, this.tableConfig, this.dialect, this.session, a10 ? { ...a10, limit: 1 } : { limit: 1 }, "first");
        }
      }
      class qD extends gf {
        constructor(a10, b10, c10, d10, e10, f10, g10, h10, i10) {
          super(), this.fullSchema = a10, this.schema = b10, this.tableNamesMap = c10, this.table = d10, this.tableConfig = e10, this.dialect = f10, this.session = g10, this.config = h10, this.mode = i10;
        }
        static [bK] = "PgRelationalQuery";
        _prepare(a10) {
          return ci.startActiveSpan("drizzle.prepareQuery", () => {
            let { query: b10, builtQuery: c10 } = this._toSQL();
            return this.session.prepareQuery(c10, void 0, a10, true, (a11, c11) => {
              let d10 = a11.map((a12) => fc(this.schema, this.tableConfig, a12, b10.selection, c11));
              return "first" === this.mode ? d10[0] : d10;
            });
          });
        }
        prepare(a10) {
          return this._prepare(a10);
        }
        _getQuery() {
          return this.dialect.buildRelationalQueryWithoutPK({ fullSchema: this.fullSchema, schema: this.schema, tableNamesMap: this.tableNamesMap, table: this.table, tableConfig: this.tableConfig, queryConfig: this.config, tableAlias: this.tableConfig.tsName });
        }
        getSQL() {
          return this._getQuery().sql;
        }
        _toSQL() {
          let a10 = this._getQuery(), b10 = this.dialect.sqlToQuery(a10.sql);
          return { query: a10, builtQuery: b10 };
        }
        toSQL() {
          return this._toSQL().builtQuery;
        }
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        execute() {
          return ci.startActiveSpan("drizzle.operation", () => this._prepare().execute(void 0, this.authToken));
        }
      }
      class qE extends gf {
        constructor(a10, b10, c10, d10) {
          super(), this.execute = a10, this.sql = b10, this.query = c10, this.mapBatchResult = d10;
        }
        static [bK] = "PgRaw";
        getSQL() {
          return this.sql;
        }
        getQuery() {
          return this.query;
        }
        mapResult(a10, b10) {
          return b10 ? this.mapBatchResult(a10) : a10;
        }
        _prepare() {
          return this;
        }
        isResponseInArrayMode() {
          return false;
        }
      }
      class qF extends gf {
        constructor(a10, b10, c10) {
          super(), this.session = b10, this.dialect = c10, this.config = { view: a10 };
        }
        static [bK] = "PgRefreshMaterializedView";
        config;
        concurrently() {
          if (void 0 !== this.config.withNoData) throw Error("Cannot use concurrently and withNoData together");
          return this.config.concurrently = true, this;
        }
        withNoData() {
          if (void 0 !== this.config.concurrently) throw Error("Cannot use concurrently and withNoData together");
          return this.config.withNoData = true, this;
        }
        getSQL() {
          return this.dialect.buildRefreshMaterializedViewQuery(this.config);
        }
        toSQL() {
          let { typings: a10, ...b10 } = this.dialect.sqlToQuery(this.getSQL());
          return b10;
        }
        _prepare(a10) {
          return ci.startActiveSpan("drizzle.prepareQuery", () => this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), void 0, a10, true));
        }
        prepare(a10) {
          return this._prepare(a10);
        }
        authToken;
        setToken(a10) {
          return this.authToken = a10, this;
        }
        execute = (a10) => ci.startActiveSpan("drizzle.operation", () => this._prepare().execute(a10, this.authToken));
      }
      class qG {
        constructor(a10, b10, c10) {
          if (this.dialect = a10, this.session = b10, this._ = c10 ? { schema: c10.schema, fullSchema: c10.fullSchema, tableNamesMap: c10.tableNamesMap, session: b10 } : { schema: void 0, fullSchema: {}, tableNamesMap: {}, session: b10 }, this.query = {}, this._.schema) for (let [d10, e10] of Object.entries(this._.schema)) this.query[d10] = new qC(c10.fullSchema, this._.schema, this._.tableNamesMap, c10.fullSchema[d10], e10, a10, b10);
          this.$cache = { invalidate: async (a11) => {
          } };
        }
        static [bK] = "PgDatabase";
        query;
        $with = (a10, b10) => {
          let c10 = this;
          return { as: (d10) => ("function" == typeof d10 && (d10 = d10(new qv(c10.dialect))), new Proxy(new ch(d10.getSQL(), b10 ?? ("getSelectedFields" in d10 ? d10.getSelectedFields() ?? {} : {}), a10, true), new fk({ alias: a10, sqlAliasedBehavior: "alias", sqlBehavior: "error" }))) };
        };
        $count(a10, b10) {
          return new qB({ source: a10, filters: b10, session: this.session });
        }
        $cache;
        with(...a10) {
          let b10 = this;
          return { select: function(c10) {
            return new qk({ fields: c10 ?? void 0, session: b10.session, dialect: b10.dialect, withList: a10 });
          }, selectDistinct: function(c10) {
            return new qk({ fields: c10 ?? void 0, session: b10.session, dialect: b10.dialect, withList: a10, distinct: true });
          }, selectDistinctOn: function(c10, d10) {
            return new qk({ fields: d10 ?? void 0, session: b10.session, dialect: b10.dialect, withList: a10, distinct: { on: c10 } });
          }, update: function(c10) {
            return new qw(c10, b10.session, b10.dialect, a10);
          }, insert: function(c10) {
            return new qy(c10, b10.session, b10.dialect, a10);
          }, delete: function(c10) {
            return new qA(c10, b10.session, b10.dialect, a10);
          } };
        }
        select(a10) {
          return new qk({ fields: a10 ?? void 0, session: this.session, dialect: this.dialect });
        }
        selectDistinct(a10) {
          return new qk({ fields: a10 ?? void 0, session: this.session, dialect: this.dialect, distinct: true });
        }
        selectDistinctOn(a10, b10) {
          return new qk({ fields: b10 ?? void 0, session: this.session, dialect: this.dialect, distinct: { on: a10 } });
        }
        update(a10) {
          return new qw(a10, this.session, this.dialect);
        }
        insert(a10) {
          return new qy(a10, this.session, this.dialect);
        }
        delete(a10) {
          return new qA(a10, this.session, this.dialect);
        }
        refreshMaterializedView(a10) {
          return new qF(a10, this.session, this.dialect);
        }
        authToken;
        execute(a10) {
          let b10 = "string" == typeof a10 ? cs.raw(a10) : a10.getSQL(), c10 = this.dialect.sqlToQuery(b10), d10 = this.session.prepareQuery(c10, void 0, void 0, false);
          return new qE(() => d10.execute(void 0, this.authToken), b10, c10, (a11) => d10.mapResult(a11, true));
        }
        transaction(a10, b10) {
          return this.session.transaction(a10, b10);
        }
      }
      function qH(...a10) {
        return a10[0].columns ? new qI(a10[0].columns, a10[0].name) : new qI(a10);
      }
      class qI {
        static [bK] = "MySqlPrimaryKeyBuilder";
        columns;
        name;
        constructor(a10, b10) {
          this.columns = a10, this.name = b10;
        }
        build(a10) {
          return new qJ(a10, this.columns, this.name);
        }
      }
      class qJ {
        constructor(a10, b10, c10) {
          this.table = a10, this.columns = b10, this.name = c10;
        }
        static [bK] = "MySqlPrimaryKey";
        columns;
        name;
        getName() {
          return this.name ?? `${this.table[pS.Symbol.Name]}_${this.columns.map((a10) => a10.name).join("_")}_pk`;
        }
      }
      function qK(a10) {
        return { id: "credentials", name: "Credentials", type: "credentials", credentials: {}, authorize: () => null, options: a10 };
      }
      let qL = { providers: [qK({ authorize: async () => null })], session: { strategy: "jwt" }, callbacks: { jwt: async ({ token: a10, user: b10 }) => a10, session: async ({ session: a10, token: b10 }) => (b10.sub && a10.user && (a10.user.id = b10.sub, a10.user.projects = b10.projects), a10) }, pages: { signIn: "/login" } }, qM = "object" == typeof scheduler && "function" == typeof scheduler.postTask ? scheduler.postTask.bind(scheduler) : setTimeout, qN = [..."./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"], qO = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, -1, -1, -1, -1, -1, -1, -1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, -1, -1, -1, -1, -1, -1, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, -1, -1, -1, -1, -1], qP = [608135816, 2242054355, 320440878, 57701188, 2752067618, 698298832, 137296536, 3964562569, 1160258022, 953160567, 3193202383, 887688300, 3232508343, 3380367581, 1065670069, 3041331479, 2450970073, 2306472731], qQ = [3509652390, 2564797868, 805139163, 3491422135, 3101798381, 1780907670, 3128725573, 4046225305, 614570311, 3012652279, 134345442, 2240740374, 1667834072, 1901547113, 2757295779, 4103290238, 227898511, 1921955416, 1904987480, 2182433518, 2069144605, 3260701109, 2620446009, 720527379, 3318853667, 677414384, 3393288472, 3101374703, 2390351024, 1614419982, 1822297739, 2954791486, 3608508353, 3174124327, 2024746970, 1432378464, 3864339955, 2857741204, 1464375394, 1676153920, 1439316330, 715854006, 3033291828, 289532110, 2706671279, 2087905683, 3018724369, 1668267050, 732546397, 1947742710, 3462151702, 2609353502, 2950085171, 1814351708, 2050118529, 680887927, 999245976, 1800124847, 3300911131, 1713906067, 1641548236, 4213287313, 1216130144, 1575780402, 4018429277, 3917837745, 3693486850, 3949271944, 596196993, 3549867205, 258830323, 2213823033, 772490370, 2760122372, 1774776394, 2652871518, 566650946, 4142492826, 1728879713, 2882767088, 1783734482, 3629395816, 2517608232, 2874225571, 1861159788, 326777828, 3124490320, 2130389656, 2716951837, 967770486, 1724537150, 2185432712, 2364442137, 1164943284, 2105845187, 998989502, 3765401048, 2244026483, 1075463327, 1455516326, 1322494562, 910128902, 469688178, 1117454909, 936433444, 3490320968, 3675253459, 1240580251, 122909385, 2157517691, 634681816, 4142456567, 3825094682, 3061402683, 2540495037, 79693498, 3249098678, 1084186820, 1583128258, 426386531, 1761308591, 1047286709, 322548459, 995290223, 1845252383, 2603652396, 3431023940, 2942221577, 3202600964, 3727903485, 1712269319, 422464435, 3234572375, 1170764815, 3523960633, 3117677531, 1434042557, 442511882, 3600875718, 1076654713, 1738483198, 4213154764, 2393238008, 3677496056, 1014306527, 4251020053, 793779912, 2902807211, 842905082, 4246964064, 1395751752, 1040244610, 2656851899, 3396308128, 445077038, 3742853595, 3577915638, 679411651, 2892444358, 2354009459, 1767581616, 3150600392, 3791627101, 3102740896, 284835224, 4246832056, 1258075500, 768725851, 2589189241, 3069724005, 3532540348, 1274779536, 3789419226, 2764799539, 1660621633, 3471099624, 4011903706, 913787905, 3497959166, 737222580, 2514213453, 2928710040, 3937242737, 1804850592, 3499020752, 2949064160, 2386320175, 2390070455, 2415321851, 4061277028, 2290661394, 2416832540, 1336762016, 1754252060, 3520065937, 3014181293, 791618072, 3188594551, 3933548030, 2332172193, 3852520463, 3043980520, 413987798, 3465142937, 3030929376, 4245938359, 2093235073, 3534596313, 375366246, 2157278981, 2479649556, 555357303, 3870105701, 2008414854, 3344188149, 4221384143, 3956125452, 2067696032, 3594591187, 2921233993, 2428461, 544322398, 577241275, 1471733935, 610547355, 4027169054, 1432588573, 1507829418, 2025931657, 3646575487, 545086370, 48609733, 2200306550, 1653985193, 298326376, 1316178497, 3007786442, 2064951626, 458293330, 2589141269, 3591329599, 3164325604, 727753846, 2179363840, 146436021, 1461446943, 4069977195, 705550613, 3059967265, 3887724982, 4281599278, 3313849956, 1404054877, 2845806497, 146425753, 1854211946, 1266315497, 3048417604, 3681880366, 3289982499, 290971e4, 1235738493, 2632868024, 2414719590, 3970600049, 1771706367, 1449415276, 3266420449, 422970021, 1963543593, 2690192192, 3826793022, 1062508698, 1531092325, 1804592342, 2583117782, 2714934279, 4024971509, 1294809318, 4028980673, 1289560198, 2221992742, 1669523910, 35572830, 157838143, 1052438473, 1016535060, 1802137761, 1753167236, 1386275462, 3080475397, 2857371447, 1040679964, 2145300060, 2390574316, 1461121720, 2956646967, 4031777805, 4028374788, 33600511, 2920084762, 1018524850, 629373528, 3691585981, 3515945977, 2091462646, 2486323059, 586499841, 988145025, 935516892, 3367335476, 2599673255, 2839830854, 265290510, 3972581182, 2759138881, 3795373465, 1005194799, 847297441, 406762289, 1314163512, 1332590856, 1866599683, 4127851711, 750260880, 613907577, 1450815602, 3165620655, 3734664991, 3650291728, 3012275730, 3704569646, 1427272223, 778793252, 1343938022, 2676280711, 2052605720, 1946737175, 3164576444, 3914038668, 3967478842, 3682934266, 1661551462, 3294938066, 4011595847, 840292616, 3712170807, 616741398, 312560963, 711312465, 1351876610, 322626781, 1910503582, 271666773, 2175563734, 1594956187, 70604529, 3617834859, 1007753275, 1495573769, 4069517037, 2549218298, 2663038764, 504708206, 2263041392, 3941167025, 2249088522, 1514023603, 1998579484, 1312622330, 694541497, 2582060303, 2151582166, 1382467621, 776784248, 2618340202, 3323268794, 2497899128, 2784771155, 503983604, 4076293799, 907881277, 423175695, 432175456, 1378068232, 4145222326, 3954048622, 3938656102, 3820766613, 2793130115, 2977904593, 26017576, 3274890735, 3194772133, 1700274565, 1756076034, 4006520079, 3677328699, 720338349, 1533947780, 354530856, 688349552, 3973924725, 1637815568, 332179504, 3949051286, 53804574, 2852348879, 3044236432, 1282449977, 3583942155, 3416972820, 4006381244, 1617046695, 2628476075, 3002303598, 1686838959, 431878346, 2686675385, 1700445008, 1080580658, 1009431731, 832498133, 3223435511, 2605976345, 2271191193, 2516031870, 1648197032, 4164389018, 2548247927, 300782431, 375919233, 238389289, 3353747414, 2531188641, 2019080857, 1475708069, 455242339, 2609103871, 448939670, 3451063019, 1395535956, 2413381860, 1841049896, 1491858159, 885456874, 4264095073, 4001119347, 1565136089, 3898914787, 1108368660, 540939232, 1173283510, 2745871338, 3681308437, 4207628240, 3343053890, 4016749493, 1699691293, 1103962373, 3625875870, 2256883143, 3830138730, 1031889488, 3479347698, 1535977030, 4236805024, 3251091107, 2132092099, 1774941330, 1199868427, 1452454533, 157007616, 2904115357, 342012276, 595725824, 1480756522, 206960106, 497939518, 591360097, 863170706, 2375253569, 3596610801, 1814182875, 2094937945, 3421402208, 1082520231, 3463918190, 2785509508, 435703966, 3908032597, 1641649973, 2842273706, 3305899714, 1510255612, 2148256476, 2655287854, 3276092548, 4258621189, 236887753, 3681803219, 274041037, 1734335097, 3815195456, 3317970021, 1899903192, 1026095262, 4050517792, 356393447, 2410691914, 3873677099, 3682840055, 3913112168, 2491498743, 4132185628, 2489919796, 1091903735, 1979897079, 3170134830, 3567386728, 3557303409, 857797738, 1136121015, 1342202287, 507115054, 2535736646, 337727348, 3213592640, 1301675037, 2528481711, 1895095763, 1721773893, 3216771564, 62756741, 2142006736, 835421444, 2531993523, 1442658625, 3659876326, 2882144922, 676362277, 1392781812, 170690266, 3921047035, 1759253602, 3611846912, 1745797284, 664899054, 1329594018, 3901205900, 3045908486, 2062866102, 2865634940, 3543621612, 3464012697, 1080764994, 553557557, 3656615353, 3996768171, 991055499, 499776247, 1265440854, 648242737, 3940784050, 980351604, 3713745714, 1749149687, 3396870395, 4211799374, 3640570775, 1161844396, 3125318951, 1431517754, 545492359, 4268468663, 3499529547, 1437099964, 2702547544, 3433638243, 2581715763, 2787789398, 1060185593, 1593081372, 2418618748, 4260947970, 69676912, 2159744348, 86519011, 2512459080, 3838209314, 1220612927, 3339683548, 133810670, 1090789135, 1078426020, 1569222167, 845107691, 3583754449, 4072456591, 1091646820, 628848692, 1613405280, 3757631651, 526609435, 236106946, 48312990, 2942717905, 3402727701, 1797494240, 859738849, 992217954, 4005476642, 2243076622, 3870952857, 3732016268, 765654824, 3490871365, 2511836413, 1685915746, 3888969200, 1414112111, 2273134842, 3281911079, 4080962846, 172450625, 2569994100, 980381355, 4109958455, 2819808352, 2716589560, 2568741196, 3681446669, 3329971472, 1835478071, 660984891, 3704678404, 4045999559, 3422617507, 3040415634, 1762651403, 1719377915, 3470491036, 2693910283, 3642056355, 3138596744, 1364962596, 2073328063, 1983633131, 926494387, 3423689081, 2150032023, 4096667949, 1749200295, 3328846651, 309677260, 2016342300, 1779581495, 3079819751, 111262694, 1274766160, 443224088, 298511866, 1025883608, 3806446537, 1145181785, 168956806, 3641502830, 3584813610, 1689216846, 3666258015, 3200248200, 1692713982, 2646376535, 4042768518, 1618508792, 1610833997, 3523052358, 4130873264, 2001055236, 3610705100, 2202168115, 4028541809, 2961195399, 1006657119, 2006996926, 3186142756, 1430667929, 3210227297, 1314452623, 4074634658, 4101304120, 2273951170, 1399257539, 3367210612, 3027628629, 1190975929, 2062231137, 2333990788, 2221543033, 2438960610, 1181637006, 548689776, 2362791313, 3372408396, 3104550113, 3145860560, 296247880, 1970579870, 3078560182, 3769228297, 1714227617, 3291629107, 3898220290, 166772364, 1251581989, 493813264, 448347421, 195405023, 2709975567, 677966185, 3703036547, 1463355134, 2715995803, 1338867538, 1343315457, 2802222074, 2684532164, 233230375, 2599980071, 2000651841, 3277868038, 1638401717, 4028070440, 3237316320, 6314154, 819756386, 300326615, 590932579, 1405279636, 3267499572, 3150704214, 2428286686, 3959192993, 3461946742, 1862657033, 1266418056, 963775037, 2089974820, 2263052895, 1917689273, 448879540, 3550394620, 3981727096, 150775221, 3627908307, 1303187396, 508620638, 2975983352, 2726630617, 1817252668, 1876281319, 1457606340, 908771278, 3720792119, 3617206836, 2455994898, 1729034894, 1080033504, 976866871, 3556439503, 2881648439, 1522871579, 1555064734, 1336096578, 3548522304, 2579274686, 3574697629, 3205460757, 3593280638, 3338716283, 3079412587, 564236357, 2993598910, 1781952180, 1464380207, 3163844217, 3332601554, 1699332808, 1393555694, 1183702653, 3581086237, 1288719814, 691649499, 2847557200, 2895455976, 3193889540, 2717570544, 1781354906, 1676643554, 2592534050, 3230253752, 1126444790, 2770207658, 2633158820, 2210423226, 2615765581, 2414155088, 3127139286, 673620729, 2805611233, 1269405062, 4015350505, 3341807571, 4149409754, 1057255273, 2012875353, 2162469141, 2276492801, 2601117357, 993977747, 3918593370, 2654263191, 753973209, 36408145, 2530585658, 25011837, 3520020182, 2088578344, 530523599, 2918365339, 1524020338, 1518925132, 3760827505, 3759777254, 1202760957, 3985898139, 3906192525, 674977740, 4174734889, 2031300136, 2019492241, 3983892565, 4153806404, 3822280332, 352677332, 2297720250, 60907813, 90501309, 3286998549, 1016092578, 2535922412, 2839152426, 457141659, 509813237, 4120667899, 652014361, 1966332200, 2975202805, 55981186, 2327461051, 676427537, 3255491064, 2882294119, 3433927263, 1307055953, 942726286, 933058658, 2468411793, 3933900994, 4215176142, 1361170020, 2001714738, 2830558078, 3274259782, 1222529897, 1679025792, 2729314320, 3714953764, 1770335741, 151462246, 3013232138, 1682292957, 1483529935, 471910574, 1539241949, 458788160, 3436315007, 1807016891, 3718408830, 978976581, 1043663428, 3165965781, 1927990952, 4200891579, 2372276910, 3208408903, 3533431907, 1412390302, 2931980059, 4132332400, 1947078029, 3881505623, 4168226417, 2941484381, 1077988104, 1320477388, 886195818, 18198404, 3786409e3, 2509781533, 112762804, 3463356488, 1866414978, 891333506, 18488651, 661792760, 1628790961, 3885187036, 3141171499, 876946877, 2693282273, 1372485963, 791857591, 2686433993, 3759982718, 3167212022, 3472953795, 2716379847, 445679433, 3561995674, 3504004811, 3574258232, 54117162, 3331405415, 2381918588, 3769707343, 4154350007, 1140177722, 4074052095, 668550556, 3214352940, 367459370, 261225585, 2610173221, 4209349473, 3468074219, 3265815641, 314222801, 3066103646, 3808782860, 282218597, 3406013506, 3773591054, 379116347, 1285071038, 846784868, 2669647154, 3771962079, 3550491691, 2305946142, 453669953, 1268987020, 3317592352, 3279303384, 3744833421, 2610507566, 3859509063, 266596637, 3847019092, 517658769, 3462560207, 3443424879, 370717030, 4247526661, 2224018117, 4143653529, 4112773975, 2788324899, 2477274417, 1456262402, 2901442914, 1517677493, 1846949527, 2295493580, 3734397586, 2176403920, 1280348187, 1908823572, 3871786941, 846861322, 1172426758, 3287448474, 3383383037, 1655181056, 3139813346, 901632758, 1897031941, 2986607138, 3066810236, 3447102507, 1393639104, 373351379, 950779232, 625454576, 3124240540, 4148612726, 2007998917, 544563296, 2244738638, 2330496472, 2058025392, 1291430526, 424198748, 50039436, 29584100, 3605783033, 2429876329, 2791104160, 1057563949, 3255363231, 3075367218, 3463963227, 1469046755, 985887462], qR = [1332899944, 1700884034, 1701343084, 1684370003, 1668446532, 1869963892], qS = (a10, b10) => {
        if (b10 <= 0 || b10 > a10.length) throw Error(`Illegal length: ${b10}`);
        let c10 = 0, d10, e10, f10 = [];
        for (; c10 < b10; ) {
          if (d10 = 255 & a10[c10++], f10.push(qN[d10 >> 2 & 63]), d10 = (3 & d10) << 4, c10 >= b10 || (d10 |= (e10 = 255 & a10[c10++]) >> 4 & 15, f10.push(qN[63 & d10]), d10 = (15 & e10) << 2, c10 >= b10)) {
            f10.push(qN[63 & d10]);
            break;
          }
          d10 |= (e10 = 255 & a10[c10++]) >> 6 & 3, f10.push(qN[63 & d10]), f10.push(qN[63 & e10]);
        }
        return f10.join("");
      }, qT = (a10, b10, c10, d10) => {
        let e10 = a10[b10], f10 = a10[b10 + 1];
        return e10 ^= c10[0], f10 ^= (d10[e10 >>> 24] + d10[256 | e10 >> 16 & 255] ^ d10[512 | e10 >> 8 & 255]) + d10[768 | 255 & e10] ^ c10[1], e10 ^= (d10[f10 >>> 24] + d10[256 | f10 >> 16 & 255] ^ d10[512 | f10 >> 8 & 255]) + d10[768 | 255 & f10] ^ c10[2], f10 ^= (d10[e10 >>> 24] + d10[256 | e10 >> 16 & 255] ^ d10[512 | e10 >> 8 & 255]) + d10[768 | 255 & e10] ^ c10[3], e10 ^= (d10[f10 >>> 24] + d10[256 | f10 >> 16 & 255] ^ d10[512 | f10 >> 8 & 255]) + d10[768 | 255 & f10] ^ c10[4], f10 ^= (d10[e10 >>> 24] + d10[256 | e10 >> 16 & 255] ^ d10[512 | e10 >> 8 & 255]) + d10[768 | 255 & e10] ^ c10[5], e10 ^= (d10[f10 >>> 24] + d10[256 | f10 >> 16 & 255] ^ d10[512 | f10 >> 8 & 255]) + d10[768 | 255 & f10] ^ c10[6], f10 ^= (d10[e10 >>> 24] + d10[256 | e10 >> 16 & 255] ^ d10[512 | e10 >> 8 & 255]) + d10[768 | 255 & e10] ^ c10[7], e10 ^= (d10[f10 >>> 24] + d10[256 | f10 >> 16 & 255] ^ d10[512 | f10 >> 8 & 255]) + d10[768 | 255 & f10] ^ c10[8], f10 ^= (d10[e10 >>> 24] + d10[256 | e10 >> 16 & 255] ^ d10[512 | e10 >> 8 & 255]) + d10[768 | 255 & e10] ^ c10[9], e10 ^= (d10[f10 >>> 24] + d10[256 | f10 >> 16 & 255] ^ d10[512 | f10 >> 8 & 255]) + d10[768 | 255 & f10] ^ c10[10], f10 ^= (d10[e10 >>> 24] + d10[256 | e10 >> 16 & 255] ^ d10[512 | e10 >> 8 & 255]) + d10[768 | 255 & e10] ^ c10[11], e10 ^= (d10[f10 >>> 24] + d10[256 | f10 >> 16 & 255] ^ d10[512 | f10 >> 8 & 255]) + d10[768 | 255 & f10] ^ c10[12], f10 ^= (d10[e10 >>> 24] + d10[256 | e10 >> 16 & 255] ^ d10[512 | e10 >> 8 & 255]) + d10[768 | 255 & e10] ^ c10[13], e10 ^= (d10[f10 >>> 24] + d10[256 | f10 >> 16 & 255] ^ d10[512 | f10 >> 8 & 255]) + d10[768 | 255 & f10] ^ c10[14], f10 ^= (d10[e10 >>> 24] + d10[256 | e10 >> 16 & 255] ^ d10[512 | e10 >> 8 & 255]) + d10[768 | 255 & e10] ^ c10[15], e10 ^= (d10[f10 >>> 24] + d10[256 | f10 >> 16 & 255] ^ d10[512 | f10 >> 8 & 255]) + d10[768 | 255 & f10] ^ c10[16], a10[b10] = f10 ^ c10[17], a10[b10 + 1] = e10, a10;
      }, qU = (a10, b10) => {
        let c10 = 0;
        for (let d10 = 0; d10 < 4; ++d10) c10 = c10 << 8 | 255 & a10[b10], b10 = (b10 + 1) % a10.length;
        return { key: c10, offp: b10 };
      }, qV = (a10, b10, c10) => {
        let d10 = b10.length, e10 = c10.length, f10 = 0, g10 = new Int32Array([0, 0]), h10;
        for (let c11 = 0; c11 < d10; c11++) h10 = qU(a10, f10), { offp: f10 } = h10, b10[c11] ^= h10.key;
        for (let a11 = 0; a11 < d10; a11 += 2) g10 = qT(g10, 0, b10, c10), b10[a11] = g10[0], b10[a11 + 1] = g10[1];
        for (let a11 = 0; a11 < e10; a11 += 2) g10 = qT(g10, 0, b10, c10), c10[a11] = g10[0], c10[a11 + 1] = g10[1];
      }, qW = (a10, b10, c10, d10, e10) => {
        let f10, g10 = new Int32Array(qR), h10 = g10.length;
        c10 = 1 << c10 >>> 0;
        let i10 = new Int32Array(qP), j10 = new Int32Array(qQ);
        ((a11, b11, c11, d11) => {
          let e11 = c11.length, f11 = d11.length, g11 = 0, h11 = new Int32Array([0, 0]), i11;
          for (let a12 = 0; a12 < e11; a12++) i11 = qU(b11, g11), { offp: g11 } = i11, c11[a12] ^= i11.key;
          g11 = 0;
          for (let b12 = 0; b12 < e11; b12 += 2) i11 = qU(a11, g11), { offp: g11 } = i11, h11[0] ^= i11.key, i11 = qU(a11, g11), { offp: g11 } = i11, h11[1] ^= i11.key, h11 = qT(h11, 0, c11, d11), c11[b12] = h11[0], c11[b12 + 1] = h11[1];
          for (let b12 = 0; b12 < f11; b12 += 2) i11 = qU(a11, g11), { offp: g11 } = i11, h11[0] ^= i11.key, i11 = qU(a11, g11), { offp: g11 } = i11, h11[1] ^= i11.key, h11 = qT(h11, 0, c11, d11), d11[b12] = h11[0], d11[b12 + 1] = h11[1];
        })(b10, a10, i10, j10);
        let k10 = 0, l10 = () => {
          if (e10 && e10(k10 / c10), k10 < c10) {
            let d11 = Date.now();
            for (; k10 < c10 && (k10 += 1, qV(a10, i10, j10), qV(b10, i10, j10), !(Date.now() - d11 > 100)); ) ;
          } else {
            for (let a12 = 0; a12 < 64; a12++) for (let a13 = 0; a13 < h10 >> 1; a13++) qT(g10, a13 << 1, i10, j10);
            let a11 = [];
            for (let b11 = 0; b11 < h10; b11++) a11.push(g10[b11] >> 24 & 255), a11.push(g10[b11] >> 16 & 255), a11.push(g10[b11] >> 8 & 255), a11.push(255 & g10[b11]);
            return d10 ? a11 : Promise.resolve(a11);
          }
          if (!d10) return new Promise((a11) => qM(() => {
            l10().then(a11);
          }));
        };
        if (!d10) return l10();
        do
          f10 = l10();
        while (!f10);
        return f10;
      }, qX = async (a10, b10, c10) => ((a11, b11, c11, d10) => {
        let e10, f10;
        if ("string" != typeof a11 || "string" != typeof b11) {
          let a12 = Error("Invalid content / salt: not a string");
          if (!c11) return Promise.reject(a12);
          throw a12;
        }
        if ("$" !== b11.charAt(0) || "2" !== b11.charAt(1)) {
          let a12 = Error(`Invalid salt version: ${b11.slice(0, 2)}`);
          if (!c11) return Promise.reject(a12);
          throw a12;
        }
        if ("$" === b11.charAt(2)) e10 = `\0`, f10 = 3;
        else {
          if ("a" !== (e10 = b11.charAt(2)) && "b" !== e10 && "y" !== e10 || "$" !== b11.charAt(3)) {
            let a12 = Error(`Invalid salt revision: ${b11.slice(2, 4)}`);
            if (!c11) return Promise.reject(a12);
            throw a12;
          }
          f10 = 4;
        }
        let g10 = b11.slice(f10, f10 + 2), h10 = /\d\d/.test(g10) ? Number(g10) : null;
        if (null === h10) {
          let a12 = Error("Missing salt rounds");
          if (!c11) return Promise.reject(a12);
          throw a12;
        }
        if (h10 < 4 || h10 > 31) {
          let a12 = Error(`Illegal number of rounds (4-31): ${h10}`);
          if (!c11) return Promise.reject(a12);
          throw a12;
        }
        let i10 = b11.slice(f10 + 3, f10 + 25), j10 = ((a12) => {
          let b12 = 0, c12, d11, e11 = Array(((a13) => {
            let b13 = 0, c13 = 0;
            for (let d12 = 0; d12 < a13.length; ++d12) (b13 = a13.charCodeAt(d12)) < 128 ? c13 += 1 : b13 < 2048 ? c13 += 2 : (64512 & b13) == 55296 && (64512 & a13.charCodeAt(d12 + 1)) == 56320 ? (d12++, c13 += 4) : c13 += 3;
            return c13;
          })(a12));
          for (let f11 = 0, g11 = a12.length; f11 < g11; ++f11) (c12 = a12.charCodeAt(f11)) < 128 ? e11[b12++] = c12 : (c12 < 2048 ? e11[b12++] = c12 >> 6 | 192 : ((64512 & c12) == 55296 && (64512 & (d11 = a12.charCodeAt(f11 + 1))) == 56320 ? (c12 = 65536 + ((1023 & c12) << 10) + (1023 & d11), ++f11, e11[b12++] = c12 >> 18 | 240, e11[b12++] = c12 >> 12 & 63 | 128) : e11[b12++] = c12 >> 12 | 224, e11[b12++] = c12 >> 6 & 63 | 128), e11[b12++] = 63 & c12 | 128);
          return e11;
        })(a11 += e10 >= "a" ? `\0` : ""), k10 = ((a12, b12) => {
          if (b12 <= 0) throw Error(`Illegal length: ${b12}`);
          let c12 = a12.length, d11 = 0, e11 = 0, f11, g11, h11, i11, j11 = [];
          for (; d11 < c12 - 1 && e11 < b12 && (f11 = (i11 = a12.charCodeAt(d11++)) < qO.length ? qO[i11] : -1, g11 = (i11 = a12.charCodeAt(d11++)) < qO.length ? qO[i11] : -1, !(-1 === f11 || -1 === g11 || (j11.push(String.fromCharCode(f11 << 2 >>> 0 | (48 & g11) >> 4)), ++e11 >= b12 || d11 >= c12) || -1 === (h11 = (i11 = a12.charCodeAt(d11++)) < qO.length ? qO[i11] : -1) || (j11.push(String.fromCharCode((15 & g11) << 4 >>> 0 | (60 & h11) >> 2)), ++e11 >= b12 || d11 >= c12))); ) j11.push(String.fromCharCode((3 & h11) << 6 >>> 0 | ((i11 = a12.charCodeAt(d11++)) < qO.length ? qO[i11] : -1))), ++e11;
          return j11.map((a13) => a13.charCodeAt(0));
        })(i10, 16);
        if (16 !== k10.length) {
          let a12 = Error(`Illegal salt: ${i10}`);
          if (!c11) return Promise.reject(a12);
          throw a12;
        }
        let l10 = (a12) => `$2${e10 >= "a" ? e10 : ""}$${h10 < 10 ? "0" : ""}${h10}$${qS(k10, 16)}${qS(a12, 4 * qR.length - 1)}`;
        return c11 ? l10(qW(j10, k10, h10, true, d10)) : qW(j10, k10, h10, false, d10).then((a12) => l10(a12));
      })(a10, "number" == typeof b10 ? await ((a11 = 10) => new Promise((b11, c11) => qM(() => {
        try {
          b11(((a12 = 10) => {
            if ("number" != typeof a12) throw ((...a13) => Error(`Illegal arguments: ${a13.map((a14) => typeof a14).join(", ")}`))(a12);
            return a12 = a12 < 4 ? 4 : Math.min(31, a12), `$2b$${a12 < 10 ? "0" : ""}${a12}$${qS(((a13) => {
              try {
                let b12 = new Uint32Array(a13);
                return globalThis.crypto.getRandomValues(b12), [...b12];
              } catch {
                throw Error("WebCryptoAPI / globalThis is not available");
              }
            })(16), 16)}`;
          })(a11));
        } catch (a12) {
          c11(a12);
        }
      })))(b10) : b10, false, c10), qY = ["www", "admin", "api", "auth", "my", "chirp-copilot", "chirp-mvp"];
      async function qZ(a10) {
        let { pathname: b10 } = a10.nextUrl, c10 = a10.headers.get("host") || "";
        if (b10.startsWith("/_next") || b10.includes("favicon.ico") || b10.includes("robots.txt") || b10.includes(".") && !b10.startsWith("/api")) return Z.next();
        let { env: d10 } = await bJ(), { auth: e10 } = function(a11, b11) {
          if (!a11) throw Error("Cloudflare environment (env) is required to initialize Auth.js");
          a11.AUTH_SECRET && (process.env.AUTH_SECRET = a11.AUTH_SECRET);
          let c11 = b11?.endsWith(".chirpcopilot.com") ? ".chirpcopilot.com" : void 0;
          var d11 = { ...qL, cookies: { sessionToken: { name: "authjs.session-token", options: { httpOnly: true, sameSite: "lax", path: "/", domain: c11, secure: true } } }, secret: a11.AUTH_SECRET || "placeholder-secret-for-boot", adapter: function(a12, b12) {
            if (bL(a12, qg)) {
              let { usersTable: b13, accountsTable: c12, sessionsTable: d12, verificationTokensTable: e12, authenticatorsTable: f10 } = function(a13 = {}) {
                let b14 = a13.usersTable ?? pT("user", { id: pN("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()), name: pN("name", { length: 255 }), email: pN("email", { length: 255 }).unique(), emailVerified: pD("emailVerified", { mode: "date", fsp: 3 }), image: pN("image", { length: 255 }) }), c13 = a13.accountsTable ?? pT("account", { userId: pN("userId", { length: 255 }).notNull().references(() => b14.id, { onDelete: "cascade" }), type: pN("type", { length: 255 }).$type().notNull(), provider: pN("provider", { length: 255 }).notNull(), providerAccountId: pN("providerAccountId", { length: 255 }).notNull(), refresh_token: pN("refresh_token", { length: 255 }), access_token: pN("access_token", { length: 255 }), expires_at: o8("expires_at"), token_type: pN("token_type", { length: 255 }), scope: pN("scope", { length: 255 }), id_token: pN("id_token", { length: 2048 }), session_state: pN("session_state", { length: 255 }) }, (a14) => ({ compositePk: qH({ columns: [a14.provider, a14.providerAccountId] }) })), d13 = a13.sessionsTable ?? pT("session", { sessionToken: pN("sessionToken", { length: 255 }).primaryKey(), userId: pN("userId", { length: 255 }).notNull().references(() => b14.id, { onDelete: "cascade" }), expires: pD("expires", { mode: "date" }).notNull() }), e13 = a13.verificationTokensTable ?? pT("verificationToken", { identifier: pN("identifier", { length: 255 }).notNull(), token: pN("token", { length: 255 }).notNull(), expires: pD("expires", { mode: "date" }).notNull() }, (a14) => ({ compositePk: qH({ columns: [a14.identifier, a14.token] }) })), f11 = a13.authenticatorsTable ?? pT("authenticator", { credentialID: pN("credentialID", { length: 255 }).notNull().unique(), userId: pN("userId", { length: 255 }).notNull().references(() => b14.id, { onDelete: "cascade" }), providerAccountId: pN("providerAccountId", { length: 255 }).notNull(), credentialPublicKey: pN("credentialPublicKey", { length: 255 }).notNull(), counter: o8("counter").notNull(), credentialDeviceType: pN("credentialDeviceType", { length: 255 }).notNull(), credentialBackedUp: oz("credentialBackedUp").notNull(), transports: pN("transports", { length: 255 }) }, (a14) => ({ compositePk: qH({ columns: [a14.userId, a14.credentialID] }) }));
                return { usersTable: b14, accountsTable: c13, sessionsTable: d13, verificationTokensTable: e13, authenticatorsTable: f11 };
              }(void 0);
              return { async createUser(c13) {
                let { id: d13, ...e13 } = c13, f11 = c_(b13).id.defaultFn, [g10] = await a12.insert(b13).values(f11 ? e13 : { ...e13, id: d13 }).$returningId();
                return a12.select().from(b13).where(cy(b13.id, g10 ? g10.id : d13)).then((a13) => a13[0]);
              }, getUser: async (c13) => a12.select().from(b13).where(cy(b13.id, c13)).then((a13) => a13.length > 0 ? a13[0] : null), getUserByEmail: async (c13) => a12.select().from(b13).where(cy(b13.email, c13)).then((a13) => a13.length > 0 ? a13[0] : null), createSession: async (b14) => (await a12.insert(d12).values(b14), a12.select().from(d12).where(cy(d12.sessionToken, b14.sessionToken)).then((a13) => a13[0])), getSessionAndUser: async (c13) => a12.select({ session: d12, user: b13 }).from(d12).where(cy(d12.sessionToken, c13)).innerJoin(b13, cy(b13.id, d12.userId)).then((a13) => a13.length > 0 ? a13[0] : null), async updateUser(c13) {
                if (!c13.id) throw Error("No user id.");
                await a12.update(b13).set(c13).where(cy(b13.id, c13.id));
                let [d13] = await a12.select().from(b13).where(cy(b13.id, c13.id));
                if (!d13) throw Error("No user found.");
                return d13;
              }, updateSession: async (b14) => (await a12.update(d12).set(b14).where(cy(d12.sessionToken, b14.sessionToken)), a12.select().from(d12).where(cy(d12.sessionToken, b14.sessionToken)).then((a13) => a13[0])), async linkAccount(b14) {
                await a12.insert(c12).values(b14);
              }, async getUserByAccount(d13) {
                let e13 = await a12.select({ account: c12, user: b13 }).from(c12).innerJoin(b13, cy(c12.userId, b13.id)).where(cA(cy(c12.provider, d13.provider), cy(c12.providerAccountId, d13.providerAccountId))).then((a13) => a13[0]);
                return e13?.user ?? null;
              }, async deleteSession(b14) {
                await a12.delete(d12).where(cy(d12.sessionToken, b14));
              }, createVerificationToken: async (b14) => (await a12.insert(e12).values(b14), a12.select().from(e12).where(cy(e12.identifier, b14.identifier)).then((a13) => a13[0])), async useVerificationToken(b14) {
                let c13 = await a12.select().from(e12).where(cA(cy(e12.identifier, b14.identifier), cy(e12.token, b14.token))).then((a13) => a13.length > 0 ? a13[0] : null);
                return c13 && await a12.delete(e12).where(cA(cy(e12.identifier, b14.identifier), cy(e12.token, b14.token))), c13;
              }, async deleteUser(c13) {
                await a12.delete(b13).where(cy(b13.id, c13));
              }, async unlinkAccount(b14) {
                await a12.delete(c12).where(cA(cy(c12.provider, b14.provider), cy(c12.providerAccountId, b14.providerAccountId)));
              }, getAccount: async (b14, d13) => a12.select().from(c12).where(cA(cy(c12.provider, d13), cy(c12.providerAccountId, b14))).then((a13) => a13[0] ?? null), createAuthenticator: async (b14) => (await a12.insert(f10).values(b14), await a12.select().from(f10).where(cy(f10.credentialID, b14.credentialID)).then((a13) => a13[0] ?? null)), getAuthenticator: async (b14) => await a12.select().from(f10).where(cy(f10.credentialID, b14)).then((a13) => a13[0] ?? null), listAuthenticatorsByUserId: async (b14) => await a12.select().from(f10).where(cy(f10.userId, b14)).then((a13) => a13), async updateAuthenticatorCounter(b14, c13) {
                await a12.update(f10).set({ counter: c13 }).where(cy(f10.credentialID, b14));
                let d13 = await a12.select().from(f10).where(cy(f10.credentialID, b14)).then((a13) => a13[0]);
                if (!d13) throw Error("Authenticator not found.");
                return d13;
              } };
            }
            if (bL(a12, qG)) {
              let { usersTable: b13, accountsTable: c12, sessionsTable: d12, verificationTokensTable: e12, authenticatorsTable: f10 } = function(a13 = {}) {
                let b14 = a13.usersTable ?? eZ("user", { id: ev("id").primaryKey().$defaultFn(() => crypto.randomUUID()), name: ev("name"), email: ev("email").unique(), emailVerified: eD("emailVerified", { mode: "date" }), image: ev("image") }), c13 = a13.accountsTable ?? eZ("account", { userId: ev("userId").notNull().references(() => b14.id, { onDelete: "cascade" }), type: ev("type").$type().notNull(), provider: ev("provider").notNull(), providerAccountId: ev("providerAccountId").notNull(), refresh_token: ev("refresh_token"), access_token: ev("access_token"), expires_at: dF("expires_at"), token_type: ev("token_type"), scope: ev("scope"), id_token: ev("id_token"), session_state: ev("session_state") }, (a14) => ({ compositePk: e$({ columns: [a14.provider, a14.providerAccountId] }) })), d13 = a13.sessionsTable ?? eZ("session", { sessionToken: ev("sessionToken").primaryKey(), userId: ev("userId").notNull().references(() => b14.id, { onDelete: "cascade" }), expires: eD("expires", { mode: "date" }).notNull() }), e13 = a13.verificationTokensTable ?? eZ("verificationToken", { identifier: ev("identifier").notNull(), token: ev("token").notNull(), expires: eD("expires", { mode: "date" }).notNull() }, (a14) => ({ compositePk: e$({ columns: [a14.identifier, a14.token] }) })), f11 = a13.authenticatorsTable ?? eZ("authenticator", { credentialID: ev("credentialID").notNull().unique(), userId: ev("userId").notNull().references(() => b14.id, { onDelete: "cascade" }), providerAccountId: ev("providerAccountId").notNull(), credentialPublicKey: ev("credentialPublicKey").notNull(), counter: dF("counter").notNull(), credentialDeviceType: ev("credentialDeviceType").notNull(), credentialBackedUp: dg("credentialBackedUp").notNull(), transports: ev("transports") }, (a14) => ({ compositePK: e$({ columns: [a14.userId, a14.credentialID] }) }));
                return { usersTable: b14, accountsTable: c13, sessionsTable: d13, verificationTokensTable: e13, authenticatorsTable: f11 };
              }(void 0);
              return { async createUser(c13) {
                let { id: d13, ...e13 } = c13, f11 = c_(b13).id.hasDefault;
                return a12.insert(b13).values(f11 ? e13 : { ...e13, id: d13 }).returning().then((a13) => a13[0]);
              }, getUser: async (c13) => a12.select().from(b13).where(cy(b13.id, c13)).then((a13) => a13.length > 0 ? a13[0] : null), getUserByEmail: async (c13) => a12.select().from(b13).where(cy(b13.email, c13)).then((a13) => a13.length > 0 ? a13[0] : null), createSession: async (b14) => a12.insert(d12).values(b14).returning().then((a13) => a13[0]), getSessionAndUser: async (c13) => a12.select({ session: d12, user: b13 }).from(d12).where(cy(d12.sessionToken, c13)).innerJoin(b13, cy(b13.id, d12.userId)).then((a13) => a13.length > 0 ? a13[0] : null), async updateUser(c13) {
                if (!c13.id) throw Error("No user id.");
                let [d13] = await a12.update(b13).set(c13).where(cy(b13.id, c13.id)).returning();
                if (!d13) throw Error("No user found.");
                return d13;
              }, updateSession: async (b14) => a12.update(d12).set(b14).where(cy(d12.sessionToken, b14.sessionToken)).returning().then((a13) => a13[0]), async linkAccount(b14) {
                await a12.insert(c12).values(b14);
              }, async getUserByAccount(d13) {
                let e13 = await a12.select({ account: c12, user: b13 }).from(c12).innerJoin(b13, cy(c12.userId, b13.id)).where(cA(cy(c12.provider, d13.provider), cy(c12.providerAccountId, d13.providerAccountId))).then((a13) => a13[0]);
                return e13?.user ?? null;
              }, async deleteSession(b14) {
                await a12.delete(d12).where(cy(d12.sessionToken, b14));
              }, createVerificationToken: async (b14) => a12.insert(e12).values(b14).returning().then((a13) => a13[0]), useVerificationToken: async (b14) => a12.delete(e12).where(cA(cy(e12.identifier, b14.identifier), cy(e12.token, b14.token))).returning().then((a13) => a13.length > 0 ? a13[0] : null), async deleteUser(c13) {
                await a12.delete(b13).where(cy(b13.id, c13));
              }, async unlinkAccount(b14) {
                await a12.delete(c12).where(cA(cy(c12.provider, b14.provider), cy(c12.providerAccountId, b14.providerAccountId)));
              }, getAccount: async (b14, d13) => a12.select().from(c12).where(cA(cy(c12.provider, d13), cy(c12.providerAccountId, b14))).then((a13) => a13[0] ?? null), createAuthenticator: async (b14) => a12.insert(f10).values(b14).returning().then((a13) => a13[0] ?? null), getAuthenticator: async (b14) => a12.select().from(f10).where(cy(f10.credentialID, b14)).then((a13) => a13[0] ?? null), listAuthenticatorsByUserId: async (b14) => a12.select().from(f10).where(cy(f10.userId, b14)).then((a13) => a13), async updateAuthenticatorCounter(b14, c13) {
                let d13 = await a12.update(f10).set({ counter: c13 }).where(cy(f10.credentialID, b14)).returning().then((a13) => a13[0]);
                if (!d13) throw Error("Authenticator not found.");
                return d13;
              } };
            }
            if (bL(a12, gB)) {
              let { usersTable: c12, accountsTable: d12, sessionsTable: e12, verificationTokensTable: f10, authenticatorsTable: g10 } = function(a13 = {}) {
                let b13 = a13.usersTable ?? f9("user", { id: f6("id").primaryKey().$defaultFn(() => crypto.randomUUID()), name: f6("name"), email: f6("email").unique(), emailVerified: fT("emailVerified", { mode: "timestamp_ms" }), image: f6("image") }), c13 = a13.accountsTable ?? f9("account", { userId: f6("userId").notNull().references(() => b13.id, { onDelete: "cascade" }), type: f6("type").$type().notNull(), provider: f6("provider").notNull(), providerAccountId: f6("providerAccountId").notNull(), refresh_token: f6("refresh_token"), access_token: f6("access_token"), expires_at: fT("expires_at"), token_type: f6("token_type"), scope: f6("scope"), id_token: f6("id_token"), session_state: f6("session_state") }, (a14) => ({ compositePk: gS({ columns: [a14.provider, a14.providerAccountId] }) })), d13 = a13.sessionsTable ?? f9("session", { sessionToken: f6("sessionToken").primaryKey(), userId: f6("userId").notNull().references(() => b13.id, { onDelete: "cascade" }), expires: fT("expires", { mode: "timestamp_ms" }).notNull() }), e13 = a13.verificationTokensTable ?? f9("verificationToken", { identifier: f6("identifier").notNull(), token: f6("token").notNull(), expires: fT("expires", { mode: "timestamp_ms" }).notNull() }, (a14) => ({ compositePk: gS({ columns: [a14.identifier, a14.token] }) })), f11 = a13.authenticatorsTable ?? f9("authenticator", { credentialID: f6("credentialID").notNull().unique(), userId: f6("userId").notNull().references(() => b13.id, { onDelete: "cascade" }), providerAccountId: f6("providerAccountId").notNull(), credentialPublicKey: f6("credentialPublicKey").notNull(), counter: fT("counter").notNull(), credentialDeviceType: f6("credentialDeviceType").notNull(), credentialBackedUp: fT("credentialBackedUp", { mode: "boolean" }).notNull(), transports: f6("transports") }, (a14) => ({ compositePK: gS({ columns: [a14.userId, a14.credentialID] }) }));
                return { usersTable: b13, accountsTable: c13, sessionsTable: d13, verificationTokensTable: e13, authenticatorsTable: f11 };
              }(b12);
              return { async createUser(b13) {
                let { id: d13, ...e13 } = b13, f11 = c_(c12).id.hasDefault;
                return a12.insert(c12).values(f11 ? e13 : { ...e13, id: d13 }).returning().get();
              }, getUser: async (b13) => await a12.select().from(c12).where(cy(c12.id, b13)).get() ?? null, getUserByEmail: async (b13) => await a12.select().from(c12).where(cy(c12.email, b13)).get() ?? null, createSession: async (b13) => a12.insert(e12).values(b13).returning().get(), getSessionAndUser: async (b13) => await a12.select({ session: e12, user: c12 }).from(e12).where(cy(e12.sessionToken, b13)).innerJoin(c12, cy(c12.id, e12.userId)).get() ?? null, async updateUser(b13) {
                if (!b13.id) throw Error("No user id.");
                let d13 = await a12.update(c12).set(b13).where(cy(c12.id, b13.id)).returning().get();
                if (!d13) throw Error("User not found.");
                return d13;
              }, updateSession: async (b13) => await a12.update(e12).set(b13).where(cy(e12.sessionToken, b13.sessionToken)).returning().get() ?? null, async linkAccount(b13) {
                await a12.insert(d12).values(b13).run();
              }, async getUserByAccount(b13) {
                let e13 = await a12.select({ account: d12, user: c12 }).from(d12).innerJoin(c12, cy(d12.userId, c12.id)).where(cA(cy(d12.provider, b13.provider), cy(d12.providerAccountId, b13.providerAccountId))).get();
                return e13?.user ?? null;
              }, async deleteSession(b13) {
                await a12.delete(e12).where(cy(e12.sessionToken, b13)).run();
              }, createVerificationToken: async (b13) => a12.insert(f10).values(b13).returning().get(), useVerificationToken: async (b13) => await a12.delete(f10).where(cA(cy(f10.identifier, b13.identifier), cy(f10.token, b13.token))).returning().get() ?? null, async deleteUser(b13) {
                await a12.delete(c12).where(cy(c12.id, b13)).run();
              }, async unlinkAccount(b13) {
                await a12.delete(d12).where(cA(cy(d12.provider, b13.provider), cy(d12.providerAccountId, b13.providerAccountId))).run();
              }, getAccount: async (b13, c13) => a12.select().from(d12).where(cA(cy(d12.provider, c13), cy(d12.providerAccountId, b13))).then((a13) => a13[0] ?? null), createAuthenticator: async (b13) => a12.insert(g10).values(b13).returning().then((a13) => a13[0] ?? null), getAuthenticator: async (b13) => a12.select().from(g10).where(cy(g10.credentialID, b13)).then((a13) => a13[0] ?? null), listAuthenticatorsByUserId: async (b13) => a12.select().from(g10).where(cy(g10.userId, b13)).then((a13) => a13), async updateAuthenticatorCounter(b13, c13) {
                let d13 = await a12.update(g10).set({ counter: c13 }).where(cy(g10.credentialID, b13)).returning().then((a13) => a13[0]);
                if (!d13) throw Error("Authenticator not found.");
                return d13;
              } };
            }
            throw Error(`Unsupported database type (${typeof a12}) in Auth.js Drizzle adapter.`);
          }(hu(a11.DB)), providers: [...qL.providers.filter((a12) => "credentials" !== a12.id), qK({ async authorize(b12) {
            let c12, d12, e12;
            if (!b12?.email || !b12?.password) return null;
            let f10 = hu(a11.DB), g10 = await f10.query.users.findFirst({ where: cy(g3.email, b12.email) });
            if (!g10 || !g10.hashedPassword || !await (c12 = b12.password, d12 = g10.hashedPassword, new Promise((a12, b13) => "string" != typeof c12 || "string" != typeof d12 ? void qM(() => b13(Error(`Illegal arguments: ${typeof c12}, ${typeof d12}`))) : 60 !== d12.length ? void qM(() => a12(false)) : void qX(c12, d12.slice(0, 29), e12).then((b14) => a12(b14 === d12)).catch((a13) => b13(a13))))) return null;
            let h10 = await f10.query.userProjects.findMany({ where: cy(g3.id, g10.id), with: { project: true } });
            return { id: g10.id, email: g10.email, name: g10.name, projects: h10.map((a12) => a12.project) };
          } })], callbacks: { ...qL.callbacks, jwt: async ({ token: a12, user: b12 }) => (b12 && (a12.projects = b12.projects), a12), session: async ({ session: a12, token: b12 }) => (a12.user && (a12.user.id = b12.sub, a12.user.projects = b12.projects), a12) } };
          if ("function" == typeof d11) {
            let a12 = async (a13) => {
              let b12 = await d11(a13);
              return nO(b12), nM(nN(a13), b12);
            };
            return { handlers: { GET: a12, POST: a12 }, auth: n2(d11, (a13) => nO(a13)), signIn: async (a13, b12, c12) => {
              let e12 = await d11(void 0);
              return nO(e12), oa(a13, b12, c12, e12);
            }, signOut: async (a13) => {
              let b12 = await d11(void 0);
              return nO(b12), ob(a13, b12);
            }, unstable_update: async (a13) => {
              let b12 = await d11(void 0);
              return nO(b12), oc(a13, b12);
            } };
          }
          nO(d11);
          let e11 = (a12) => nM(nN(a12), d11);
          return { handlers: { GET: e11, POST: e11 }, auth: n2(d11), signIn: (a12, b12, c12) => oa(a12, b12, c12, d11), signOut: (a12) => ob(a12, d11), unstable_update: (a12) => oc(a12, d11) };
        }(d10, c10);
        return e10(async (e11) => {
          let f10 = e11.auth, g10 = c10.split("."), h10 = null;
          if ("my.chirpcopilot.com" === c10 || c10.startsWith("my.localhost")) {
            let a11 = b10.split("/");
            a11[1] && !qY.includes(a11[1]) && (h10 = a11[1]);
          } else if (c10.includes("localhost") && g10.length > 1) h10 = g10[0];
          else if (c10.endsWith(".pages.dev")) 4 === g10.length && (h10 = g10[0]);
          else if (g10.length > 2) {
            let a11 = g10[0];
            qY.includes(a11) || (h10 = a11);
          }
          let i10 = a10.nextUrl.searchParams.get("tenant") || a10.nextUrl.searchParams.get("store");
          i10 && (h10 = i10), h10 && (qY.includes(h10) || h10.match(/^[a-f0-9]{8}$/)) && (h10 = null);
          let j10 = new Headers(a10.headers);
          if (h10 && j10.set("x-tenant-slug", h10), c10.startsWith("my.") && h10 && b10.startsWith(`/${h10}`)) {
            let c11 = b10.replace(`/${h10}`, "") || "/", d11 = a10.nextUrl.clone();
            return d11.pathname = c11, Z.rewrite(d11, { request: { headers: j10 } });
          }
          if (("/login" === b10 || "/signup" === b10) && f10) {
            let b11 = f10.user?.projects || [];
            if (b11.length > 0) {
              let a11 = b11[0].slug, d11 = c10.replace(h10 || "www", a11);
              return Z.redirect(new URL("/admin", `https://${d11}`));
            }
            return Z.redirect(new URL("/admin", a10.url));
          }
          let k10 = b10.startsWith("/admin"), l10 = b10.startsWith("/api/");
          if (k10 && !f10) {
            let c11 = new URL("/login", a10.url), d11 = `${b10}${a10.nextUrl.search}`;
            return c11.searchParams.set("redirectTo", d11), Z.redirect(c11);
          }
          if (l10 && b10.startsWith("/api/admin") && !f10) return Z.json({ error: "Unauthorized" }, { status: 401 });
          if (h10 && (b10.startsWith("/admin/messages") || b10.startsWith("/api/admin/instagram"))) {
            let a11 = hu(d10.DB), b11 = await a11.query.projects.findFirst({ where: cy(gV.slug, h10) });
            if (b11) {
              let a12 = await hv(d10.DB, b11.id, "omnichannel");
              if (!a12.isEnabled) return l10 ? Z.json({ error: "Feature Disabled", reason: a12.reason, message: a12.message }, { status: 403 }) : new Z(a12.message, { status: 403 });
            }
          }
          if (l10) {
            let { allowed: b11, resetAt: c11 } = function(a11) {
              let b12 = Date.now(), c12 = bC.get(a11);
              return !c12 || c12.expiresAt <= b12 ? (bC.set(a11, { count: 1, expiresAt: b12 + bA }), { allowed: true, remaining: bB - 1, resetAt: b12 + bA }) : c12.count >= bB ? { allowed: false, remaining: 0, resetAt: c12.expiresAt } : (c12.count += 1, bC.set(a11, c12), { allowed: true, remaining: bB - c12.count, resetAt: c12.expiresAt });
            }(function(a11, b12) {
              if (a11 && a11.trim().length > 0) return a11.trim();
              if (!b12) return "unknown";
              let [c12] = b12.split(",");
              if (!c12) return "unknown";
              let d11 = c12.trim();
              return d11.length > 0 ? d11 : "unknown";
            }(a10.ip, a10.headers.get("x-forwarded-for")));
            if (!b11) {
              let a11 = Math.max(1, Math.ceil((c11 - Date.now()) / 1e3)), b12 = Z.json({ error: "Too many requests", message: "You have sent too many requests. Please try again later." }, { status: 429 });
              return b12.headers.set("Retry-After", a11.toString()), b12;
            }
          }
          return Z.next({ request: { headers: j10 } });
        })(a10, {});
      }
      let q$ = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
      c(747);
      let q_ = { ...m }, q0 = q_.middleware || q_.default, q1 = "/middleware";
      if ("function" != typeof q0) throw Object.defineProperty(Error(`The Middleware "${q1}" must export a \`middleware\` or a \`default\` function`), "__NEXT_ERROR_CODE", { value: "E120", enumerable: false, configurable: true });
      function q2(a10) {
        return bj({ ...a10, page: q1, handler: async (...a11) => {
          try {
            return await q0(...a11);
          } catch (e10) {
            let b10 = a11[0], c10 = new URL(b10.url), d10 = c10.pathname + c10.search;
            throw await q(e10, { path: d10, method: b10.method, headers: Object.fromEntries(b10.headers.entries()) }, { routerKind: "Pages Router", routePath: "/middleware", routeType: "middleware", revalidateReason: void 0 }), e10;
          }
        } });
      }
    }, 340: (a, b, c) => {
      "use strict";
      function d(a2) {
        return "object" == typeof a2 && null !== a2 && "digest" in a2 && "BAILOUT_TO_CLIENT_SIDE_RENDERING" === a2.digest;
      }
      c.d(b, { C: () => d });
    }, 356: (a) => {
      "use strict";
      a.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 378: (a, b, c) => {
      "use strict";
      c.d(b, { Q: () => d });
      var d = function(a2) {
        return a2[a2.SeeOther = 303] = "SeeOther", a2[a2.TemporaryRedirect = 307] = "TemporaryRedirect", a2[a2.PermanentRedirect = 308] = "PermanentRedirect", a2;
      }({});
    }, 379: (a, b, c) => {
      "use strict";
      c.d(b, { J: () => d });
      let d = (0, c(58).xl)();
    }, 392: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { getTestReqInfo: function() {
        return g;
      }, withRequest: function() {
        return f;
      } });
      let d = new (c(521)).AsyncLocalStorage();
      function e(a2, b2) {
        let c2 = b2.header(a2, "next-test-proxy-port");
        if (!c2) return;
        let d2 = b2.url(a2);
        return { url: d2, proxyPort: Number(c2), testData: b2.header(a2, "next-test-data") || "" };
      }
      function f(a2, b2, c2) {
        let f2 = e(a2, b2);
        return f2 ? d.run(f2, c2) : c2();
      }
      function g(a2, b2) {
        let c2 = d.getStore();
        return c2 || (a2 && b2 ? e(a2, b2) : void 0);
      }
    }, 440: (a, b) => {
      "use strict";
      var c = { H: null, A: null };
      function d(a2) {
        var b2 = "https://react.dev/errors/" + a2;
        if (1 < arguments.length) {
          b2 += "?args[]=" + encodeURIComponent(arguments[1]);
          for (var c2 = 2; c2 < arguments.length; c2++) b2 += "&args[]=" + encodeURIComponent(arguments[c2]);
        }
        return "Minified React error #" + a2 + "; visit " + b2 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var e = Array.isArray;
      function f() {
      }
      var g = Symbol.for("react.transitional.element"), h = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), j = Symbol.for("react.strict_mode"), k = Symbol.for("react.profiler"), l = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), n = Symbol.for("react.memo"), o = Symbol.for("react.lazy"), p = Symbol.iterator, q = Object.prototype.hasOwnProperty, r = Object.assign;
      function s(a2, b2, c2) {
        var d2 = c2.ref;
        return { $$typeof: g, type: a2, key: b2, ref: void 0 !== d2 ? d2 : null, props: c2 };
      }
      function t(a2) {
        return "object" == typeof a2 && null !== a2 && a2.$$typeof === g;
      }
      var u = /\/+/g;
      function v(a2, b2) {
        var c2, d2;
        return "object" == typeof a2 && null !== a2 && null != a2.key ? (c2 = "" + a2.key, d2 = { "=": "=0", ":": "=2" }, "$" + c2.replace(/[=:]/g, function(a3) {
          return d2[a3];
        })) : b2.toString(36);
      }
      function w(a2, b2, c2) {
        if (null == a2) return a2;
        var i2 = [], j2 = 0;
        return !function a3(b3, c3, i3, j3, k2) {
          var l2, m2, n2, q2 = typeof b3;
          ("undefined" === q2 || "boolean" === q2) && (b3 = null);
          var r2 = false;
          if (null === b3) r2 = true;
          else switch (q2) {
            case "bigint":
            case "string":
            case "number":
              r2 = true;
              break;
            case "object":
              switch (b3.$$typeof) {
                case g:
                case h:
                  r2 = true;
                  break;
                case o:
                  return a3((r2 = b3._init)(b3._payload), c3, i3, j3, k2);
              }
          }
          if (r2) return k2 = k2(b3), r2 = "" === j3 ? "." + v(b3, 0) : j3, e(k2) ? (i3 = "", null != r2 && (i3 = r2.replace(u, "$&/") + "/"), a3(k2, c3, i3, "", function(a4) {
            return a4;
          })) : null != k2 && (t(k2) && (l2 = k2, m2 = i3 + (null == k2.key || b3 && b3.key === k2.key ? "" : ("" + k2.key).replace(u, "$&/") + "/") + r2, k2 = s(l2.type, m2, l2.props)), c3.push(k2)), 1;
          r2 = 0;
          var w2 = "" === j3 ? "." : j3 + ":";
          if (e(b3)) for (var x2 = 0; x2 < b3.length; x2++) q2 = w2 + v(j3 = b3[x2], x2), r2 += a3(j3, c3, i3, q2, k2);
          else if ("function" == typeof (x2 = null === (n2 = b3) || "object" != typeof n2 ? null : "function" == typeof (n2 = p && n2[p] || n2["@@iterator"]) ? n2 : null)) for (b3 = x2.call(b3), x2 = 0; !(j3 = b3.next()).done; ) q2 = w2 + v(j3 = j3.value, x2++), r2 += a3(j3, c3, i3, q2, k2);
          else if ("object" === q2) {
            if ("function" == typeof b3.then) return a3(function(a4) {
              switch (a4.status) {
                case "fulfilled":
                  return a4.value;
                case "rejected":
                  throw a4.reason;
                default:
                  switch ("string" == typeof a4.status ? a4.then(f, f) : (a4.status = "pending", a4.then(function(b4) {
                    "pending" === a4.status && (a4.status = "fulfilled", a4.value = b4);
                  }, function(b4) {
                    "pending" === a4.status && (a4.status = "rejected", a4.reason = b4);
                  })), a4.status) {
                    case "fulfilled":
                      return a4.value;
                    case "rejected":
                      throw a4.reason;
                  }
              }
              throw a4;
            }(b3), c3, i3, j3, k2);
            throw Error(d(31, "[object Object]" === (c3 = String(b3)) ? "object with keys {" + Object.keys(b3).join(", ") + "}" : c3));
          }
          return r2;
        }(a2, i2, "", "", function(a3) {
          return b2.call(c2, a3, j2++);
        }), i2;
      }
      function x(a2) {
        if (-1 === a2._status) {
          var b2 = a2._result;
          (b2 = b2()).then(function(b3) {
            (0 === a2._status || -1 === a2._status) && (a2._status = 1, a2._result = b3);
          }, function(b3) {
            (0 === a2._status || -1 === a2._status) && (a2._status = 2, a2._result = b3);
          }), -1 === a2._status && (a2._status = 0, a2._result = b2);
        }
        if (1 === a2._status) return a2._result.default;
        throw a2._result;
      }
      function y() {
        return /* @__PURE__ */ new WeakMap();
      }
      function z() {
        return { s: 0, v: void 0, o: null, p: null };
      }
      b.Children = { map: w, forEach: function(a2, b2, c2) {
        w(a2, function() {
          b2.apply(this, arguments);
        }, c2);
      }, count: function(a2) {
        var b2 = 0;
        return w(a2, function() {
          b2++;
        }), b2;
      }, toArray: function(a2) {
        return w(a2, function(a3) {
          return a3;
        }) || [];
      }, only: function(a2) {
        if (!t(a2)) throw Error(d(143));
        return a2;
      } }, b.Fragment = i, b.Profiler = k, b.StrictMode = j, b.Suspense = m, b.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = c, b.cache = function(a2) {
        return function() {
          var b2 = c.A;
          if (!b2) return a2.apply(null, arguments);
          var d2 = b2.getCacheForType(y);
          void 0 === (b2 = d2.get(a2)) && (b2 = z(), d2.set(a2, b2)), d2 = 0;
          for (var e2 = arguments.length; d2 < e2; d2++) {
            var f2 = arguments[d2];
            if ("function" == typeof f2 || "object" == typeof f2 && null !== f2) {
              var g2 = b2.o;
              null === g2 && (b2.o = g2 = /* @__PURE__ */ new WeakMap()), void 0 === (b2 = g2.get(f2)) && (b2 = z(), g2.set(f2, b2));
            } else null === (g2 = b2.p) && (b2.p = g2 = /* @__PURE__ */ new Map()), void 0 === (b2 = g2.get(f2)) && (b2 = z(), g2.set(f2, b2));
          }
          if (1 === b2.s) return b2.v;
          if (2 === b2.s) throw b2.v;
          try {
            var h2 = a2.apply(null, arguments);
            return (d2 = b2).s = 1, d2.v = h2;
          } catch (a3) {
            throw (h2 = b2).s = 2, h2.v = a3, a3;
          }
        };
      }, b.cacheSignal = function() {
        var a2 = c.A;
        return a2 ? a2.cacheSignal() : null;
      }, b.captureOwnerStack = function() {
        return null;
      }, b.cloneElement = function(a2, b2, c2) {
        if (null == a2) throw Error(d(267, a2));
        var e2 = r({}, a2.props), f2 = a2.key;
        if (null != b2) for (g2 in void 0 !== b2.key && (f2 = "" + b2.key), b2) q.call(b2, g2) && "key" !== g2 && "__self" !== g2 && "__source" !== g2 && ("ref" !== g2 || void 0 !== b2.ref) && (e2[g2] = b2[g2]);
        var g2 = arguments.length - 2;
        if (1 === g2) e2.children = c2;
        else if (1 < g2) {
          for (var h2 = Array(g2), i2 = 0; i2 < g2; i2++) h2[i2] = arguments[i2 + 2];
          e2.children = h2;
        }
        return s(a2.type, f2, e2);
      }, b.createElement = function(a2, b2, c2) {
        var d2, e2 = {}, f2 = null;
        if (null != b2) for (d2 in void 0 !== b2.key && (f2 = "" + b2.key), b2) q.call(b2, d2) && "key" !== d2 && "__self" !== d2 && "__source" !== d2 && (e2[d2] = b2[d2]);
        var g2 = arguments.length - 2;
        if (1 === g2) e2.children = c2;
        else if (1 < g2) {
          for (var h2 = Array(g2), i2 = 0; i2 < g2; i2++) h2[i2] = arguments[i2 + 2];
          e2.children = h2;
        }
        if (a2 && a2.defaultProps) for (d2 in g2 = a2.defaultProps) void 0 === e2[d2] && (e2[d2] = g2[d2]);
        return s(a2, f2, e2);
      }, b.createRef = function() {
        return { current: null };
      }, b.forwardRef = function(a2) {
        return { $$typeof: l, render: a2 };
      }, b.isValidElement = t, b.lazy = function(a2) {
        return { $$typeof: o, _payload: { _status: -1, _result: a2 }, _init: x };
      }, b.memo = function(a2, b2) {
        return { $$typeof: n, type: a2, compare: void 0 === b2 ? null : b2 };
      }, b.use = function(a2) {
        return c.H.use(a2);
      }, b.useCallback = function(a2, b2) {
        return c.H.useCallback(a2, b2);
      }, b.useDebugValue = function() {
      }, b.useId = function() {
        return c.H.useId();
      }, b.useMemo = function(a2, b2) {
        return c.H.useMemo(a2, b2);
      }, b.version = "19.2.0-canary-0bdb9206-20250818";
    }, 443: (a) => {
      "use strict";
      var b = Object.defineProperty, c = Object.getOwnPropertyDescriptor, d = Object.getOwnPropertyNames, e = Object.prototype.hasOwnProperty, f = {};
      function g(a2) {
        var b2;
        let c2 = ["path" in a2 && a2.path && `Path=${a2.path}`, "expires" in a2 && (a2.expires || 0 === a2.expires) && `Expires=${("number" == typeof a2.expires ? new Date(a2.expires) : a2.expires).toUTCString()}`, "maxAge" in a2 && "number" == typeof a2.maxAge && `Max-Age=${a2.maxAge}`, "domain" in a2 && a2.domain && `Domain=${a2.domain}`, "secure" in a2 && a2.secure && "Secure", "httpOnly" in a2 && a2.httpOnly && "HttpOnly", "sameSite" in a2 && a2.sameSite && `SameSite=${a2.sameSite}`, "partitioned" in a2 && a2.partitioned && "Partitioned", "priority" in a2 && a2.priority && `Priority=${a2.priority}`].filter(Boolean), d2 = `${a2.name}=${encodeURIComponent(null != (b2 = a2.value) ? b2 : "")}`;
        return 0 === c2.length ? d2 : `${d2}; ${c2.join("; ")}`;
      }
      function h(a2) {
        let b2 = /* @__PURE__ */ new Map();
        for (let c2 of a2.split(/; */)) {
          if (!c2) continue;
          let a3 = c2.indexOf("=");
          if (-1 === a3) {
            b2.set(c2, "true");
            continue;
          }
          let [d2, e2] = [c2.slice(0, a3), c2.slice(a3 + 1)];
          try {
            b2.set(d2, decodeURIComponent(null != e2 ? e2 : "true"));
          } catch {
          }
        }
        return b2;
      }
      function i(a2) {
        if (!a2) return;
        let [[b2, c2], ...d2] = h(a2), { domain: e2, expires: f2, httponly: g2, maxage: i2, path: l2, samesite: m2, secure: n, partitioned: o, priority: p } = Object.fromEntries(d2.map(([a3, b3]) => [a3.toLowerCase().replace(/-/g, ""), b3]));
        {
          var q, r, s = { name: b2, value: decodeURIComponent(c2), domain: e2, ...f2 && { expires: new Date(f2) }, ...g2 && { httpOnly: true }, ..."string" == typeof i2 && { maxAge: Number(i2) }, path: l2, ...m2 && { sameSite: j.includes(q = (q = m2).toLowerCase()) ? q : void 0 }, ...n && { secure: true }, ...p && { priority: k.includes(r = (r = p).toLowerCase()) ? r : void 0 }, ...o && { partitioned: true } };
          let a3 = {};
          for (let b3 in s) s[b3] && (a3[b3] = s[b3]);
          return a3;
        }
      }
      ((a2, c2) => {
        for (var d2 in c2) b(a2, d2, { get: c2[d2], enumerable: true });
      })(f, { RequestCookies: () => l, ResponseCookies: () => m, parseCookie: () => h, parseSetCookie: () => i, stringifyCookie: () => g }), a.exports = ((a2, f2, g2, h2) => {
        if (f2 && "object" == typeof f2 || "function" == typeof f2) for (let i2 of d(f2)) e.call(a2, i2) || i2 === g2 || b(a2, i2, { get: () => f2[i2], enumerable: !(h2 = c(f2, i2)) || h2.enumerable });
        return a2;
      })(b({}, "__esModule", { value: true }), f);
      var j = ["strict", "lax", "none"], k = ["low", "medium", "high"], l = class {
        constructor(a2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a2;
          let b2 = a2.get("cookie");
          if (b2) for (let [a3, c2] of h(b2)) this._parsed.set(a3, { name: a3, value: c2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...a2) {
          let b2 = "string" == typeof a2[0] ? a2[0] : a2[0].name;
          return this._parsed.get(b2);
        }
        getAll(...a2) {
          var b2;
          let c2 = Array.from(this._parsed);
          if (!a2.length) return c2.map(([a3, b3]) => b3);
          let d2 = "string" == typeof a2[0] ? a2[0] : null == (b2 = a2[0]) ? void 0 : b2.name;
          return c2.filter(([a3]) => a3 === d2).map(([a3, b3]) => b3);
        }
        has(a2) {
          return this._parsed.has(a2);
        }
        set(...a2) {
          let [b2, c2] = 1 === a2.length ? [a2[0].name, a2[0].value] : a2, d2 = this._parsed;
          return d2.set(b2, { name: b2, value: c2 }), this._headers.set("cookie", Array.from(d2).map(([a3, b3]) => g(b3)).join("; ")), this;
        }
        delete(a2) {
          let b2 = this._parsed, c2 = Array.isArray(a2) ? a2.map((a3) => b2.delete(a3)) : b2.delete(a2);
          return this._headers.set("cookie", Array.from(b2).map(([a3, b3]) => g(b3)).join("; ")), c2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((a2) => `${a2.name}=${encodeURIComponent(a2.value)}`).join("; ");
        }
      }, m = class {
        constructor(a2) {
          var b2, c2, d2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a2;
          let e2 = null != (d2 = null != (c2 = null == (b2 = a2.getSetCookie) ? void 0 : b2.call(a2)) ? c2 : a2.get("set-cookie")) ? d2 : [];
          for (let a3 of Array.isArray(e2) ? e2 : function(a4) {
            if (!a4) return [];
            var b3, c3, d3, e3, f2, g2 = [], h2 = 0;
            function i2() {
              for (; h2 < a4.length && /\s/.test(a4.charAt(h2)); ) h2 += 1;
              return h2 < a4.length;
            }
            for (; h2 < a4.length; ) {
              for (b3 = h2, f2 = false; i2(); ) if ("," === (c3 = a4.charAt(h2))) {
                for (d3 = h2, h2 += 1, i2(), e3 = h2; h2 < a4.length && "=" !== (c3 = a4.charAt(h2)) && ";" !== c3 && "," !== c3; ) h2 += 1;
                h2 < a4.length && "=" === a4.charAt(h2) ? (f2 = true, h2 = e3, g2.push(a4.substring(b3, d3)), b3 = h2) : h2 = d3 + 1;
              } else h2 += 1;
              (!f2 || h2 >= a4.length) && g2.push(a4.substring(b3, a4.length));
            }
            return g2;
          }(e2)) {
            let b3 = i(a3);
            b3 && this._parsed.set(b3.name, b3);
          }
        }
        get(...a2) {
          let b2 = "string" == typeof a2[0] ? a2[0] : a2[0].name;
          return this._parsed.get(b2);
        }
        getAll(...a2) {
          var b2;
          let c2 = Array.from(this._parsed.values());
          if (!a2.length) return c2;
          let d2 = "string" == typeof a2[0] ? a2[0] : null == (b2 = a2[0]) ? void 0 : b2.name;
          return c2.filter((a3) => a3.name === d2);
        }
        has(a2) {
          return this._parsed.has(a2);
        }
        set(...a2) {
          let [b2, c2, d2] = 1 === a2.length ? [a2[0].name, a2[0].value, a2[0]] : a2, e2 = this._parsed;
          return e2.set(b2, function(a3 = { name: "", value: "" }) {
            return "number" == typeof a3.expires && (a3.expires = new Date(a3.expires)), a3.maxAge && (a3.expires = new Date(Date.now() + 1e3 * a3.maxAge)), (null === a3.path || void 0 === a3.path) && (a3.path = "/"), a3;
          }({ name: b2, value: c2, ...d2 })), function(a3, b3) {
            for (let [, c3] of (b3.delete("set-cookie"), a3)) {
              let a4 = g(c3);
              b3.append("set-cookie", a4);
            }
          }(e2, this._headers), this;
        }
        delete(...a2) {
          let [b2, c2] = "string" == typeof a2[0] ? [a2[0]] : [a2[0].name, a2[0]];
          return this.set({ ...c2, name: b2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(g).join("; ");
        }
      };
    }, 449: (a, b, c) => {
      var d;
      (() => {
        var e = { 226: function(e2, f2) {
          !function(g2, h) {
            "use strict";
            var i = "function", j = "undefined", k = "object", l = "string", m = "major", n = "model", o = "name", p = "type", q = "vendor", r = "version", s = "architecture", t = "console", u = "mobile", v = "tablet", w = "smarttv", x = "wearable", y = "embedded", z = "Amazon", A = "Apple", B = "ASUS", C = "BlackBerry", D = "Browser", E = "Chrome", F = "Firefox", G = "Google", H = "Huawei", I = "Microsoft", J = "Motorola", K = "Opera", L = "Samsung", M = "Sharp", N = "Sony", O = "Xiaomi", P = "Zebra", Q = "Facebook", R = "Chromium OS", S = "Mac OS", T = function(a2, b2) {
              var c2 = {};
              for (var d2 in a2) b2[d2] && b2[d2].length % 2 == 0 ? c2[d2] = b2[d2].concat(a2[d2]) : c2[d2] = a2[d2];
              return c2;
            }, U = function(a2) {
              for (var b2 = {}, c2 = 0; c2 < a2.length; c2++) b2[a2[c2].toUpperCase()] = a2[c2];
              return b2;
            }, V = function(a2, b2) {
              return typeof a2 === l && -1 !== W(b2).indexOf(W(a2));
            }, W = function(a2) {
              return a2.toLowerCase();
            }, X = function(a2, b2) {
              if (typeof a2 === l) return a2 = a2.replace(/^\s\s*/, ""), typeof b2 === j ? a2 : a2.substring(0, 350);
            }, Y = function(a2, b2) {
              for (var c2, d2, e3, f3, g3, j2, l2 = 0; l2 < b2.length && !g3; ) {
                var m2 = b2[l2], n2 = b2[l2 + 1];
                for (c2 = d2 = 0; c2 < m2.length && !g3 && m2[c2]; ) if (g3 = m2[c2++].exec(a2)) for (e3 = 0; e3 < n2.length; e3++) j2 = g3[++d2], typeof (f3 = n2[e3]) === k && f3.length > 0 ? 2 === f3.length ? typeof f3[1] == i ? this[f3[0]] = f3[1].call(this, j2) : this[f3[0]] = f3[1] : 3 === f3.length ? typeof f3[1] !== i || f3[1].exec && f3[1].test ? this[f3[0]] = j2 ? j2.replace(f3[1], f3[2]) : void 0 : this[f3[0]] = j2 ? f3[1].call(this, j2, f3[2]) : void 0 : 4 === f3.length && (this[f3[0]] = j2 ? f3[3].call(this, j2.replace(f3[1], f3[2])) : h) : this[f3] = j2 || h;
                l2 += 2;
              }
            }, Z = function(a2, b2) {
              for (var c2 in b2) if (typeof b2[c2] === k && b2[c2].length > 0) {
                for (var d2 = 0; d2 < b2[c2].length; d2++) if (V(b2[c2][d2], a2)) return "?" === c2 ? h : c2;
              } else if (V(b2[c2], a2)) return "?" === c2 ? h : c2;
              return a2;
            }, $ = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, _ = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [r, [o, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [r, [o, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [o, r], [/opios[\/ ]+([\w\.]+)/i], [r, [o, K + " Mini"]], [/\bopr\/([\w\.]+)/i], [r, [o, K]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [o, r], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [r, [o, "UC" + D]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [r, [o, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [r, [o, "WeChat"]], [/konqueror\/([\w\.]+)/i], [r, [o, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [r, [o, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [r, [o, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[o, /(.+)/, "$1 Secure " + D], r], [/\bfocus\/([\w\.]+)/i], [r, [o, F + " Focus"]], [/\bopt\/([\w\.]+)/i], [r, [o, K + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [r, [o, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [r, [o, "Dolphin"]], [/coast\/([\w\.]+)/i], [r, [o, K + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [r, [o, "MIUI " + D]], [/fxios\/([-\w\.]+)/i], [r, [o, F]], [/\bqihu|(qi?ho?o?|360)browser/i], [[o, "360 " + D]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[o, /(.+)/, "$1 " + D], r], [/(comodo_dragon)\/([\w\.]+)/i], [[o, /_/g, " "], r], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [o, r], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [o], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[o, Q], r], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [o, r], [/\bgsa\/([\w\.]+) .*safari\//i], [r, [o, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [r, [o, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [r, [o, E + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[o, E + " WebView"], r], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [r, [o, "Android " + D]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [o, r], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [r, [o, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [r, o], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [o, [r, Z, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [o, r], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[o, "Netscape"], r], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [r, [o, F + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [o, r], [/(cobalt)\/([\w\.]+)/i], [o, [r, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[s, "amd64"]], [/(ia32(?=;))/i], [[s, W]], [/((?:i[346]|x)86)[;\)]/i], [[s, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[s, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[s, "armhf"]], [/windows (ce|mobile); ppc;/i], [[s, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[s, /ower/, "", W]], [/(sun4\w)[;\)]/i], [[s, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[s, W]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [n, [q, L], [p, v]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [n, [q, L], [p, u]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [n, [q, A], [p, u]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [n, [q, A], [p, v]], [/(macintosh);/i], [n, [q, A]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [n, [q, M], [p, u]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [n, [q, H], [p, v]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [n, [q, H], [p, u]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[n, /_/g, " "], [q, O], [p, u]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[n, /_/g, " "], [q, O], [p, v]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [n, [q, "OPPO"], [p, u]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [n, [q, "Vivo"], [p, u]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [n, [q, "Realme"], [p, u]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [n, [q, J], [p, u]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [n, [q, J], [p, v]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [n, [q, "LG"], [p, v]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [n, [q, "LG"], [p, u]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [n, [q, "Lenovo"], [p, v]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[n, /_/g, " "], [q, "Nokia"], [p, u]], [/(pixel c)\b/i], [n, [q, G], [p, v]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [n, [q, G], [p, u]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [n, [q, N], [p, u]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[n, "Xperia Tablet"], [q, N], [p, v]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [n, [q, "OnePlus"], [p, u]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [n, [q, z], [p, v]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[n, /(.+)/g, "Fire Phone $1"], [q, z], [p, u]], [/(playbook);[-\w\),; ]+(rim)/i], [n, q, [p, v]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [n, [q, C], [p, u]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [n, [q, B], [p, v]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [n, [q, B], [p, u]], [/(nexus 9)/i], [n, [q, "HTC"], [p, v]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [q, [n, /_/g, " "], [p, u]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [n, [q, "Acer"], [p, v]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [n, [q, "Meizu"], [p, u]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [q, n, [p, u]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [q, n, [p, v]], [/(surface duo)/i], [n, [q, I], [p, v]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [n, [q, "Fairphone"], [p, u]], [/(u304aa)/i], [n, [q, "AT&T"], [p, u]], [/\bsie-(\w*)/i], [n, [q, "Siemens"], [p, u]], [/\b(rct\w+) b/i], [n, [q, "RCA"], [p, v]], [/\b(venue[\d ]{2,7}) b/i], [n, [q, "Dell"], [p, v]], [/\b(q(?:mv|ta)\w+) b/i], [n, [q, "Verizon"], [p, v]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [n, [q, "Barnes & Noble"], [p, v]], [/\b(tm\d{3}\w+) b/i], [n, [q, "NuVision"], [p, v]], [/\b(k88) b/i], [n, [q, "ZTE"], [p, v]], [/\b(nx\d{3}j) b/i], [n, [q, "ZTE"], [p, u]], [/\b(gen\d{3}) b.+49h/i], [n, [q, "Swiss"], [p, u]], [/\b(zur\d{3}) b/i], [n, [q, "Swiss"], [p, v]], [/\b((zeki)?tb.*\b) b/i], [n, [q, "Zeki"], [p, v]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[q, "Dragon Touch"], n, [p, v]], [/\b(ns-?\w{0,9}) b/i], [n, [q, "Insignia"], [p, v]], [/\b((nxa|next)-?\w{0,9}) b/i], [n, [q, "NextBook"], [p, v]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[q, "Voice"], n, [p, u]], [/\b(lvtel\-)?(v1[12]) b/i], [[q, "LvTel"], n, [p, u]], [/\b(ph-1) /i], [n, [q, "Essential"], [p, u]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [n, [q, "Envizen"], [p, v]], [/\b(trio[-\w\. ]+) b/i], [n, [q, "MachSpeed"], [p, v]], [/\btu_(1491) b/i], [n, [q, "Rotor"], [p, v]], [/(shield[\w ]+) b/i], [n, [q, "Nvidia"], [p, v]], [/(sprint) (\w+)/i], [q, n, [p, u]], [/(kin\.[onetw]{3})/i], [[n, /\./g, " "], [q, I], [p, u]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [n, [q, P], [p, v]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [n, [q, P], [p, u]], [/smart-tv.+(samsung)/i], [q, [p, w]], [/hbbtv.+maple;(\d+)/i], [[n, /^/, "SmartTV"], [q, L], [p, w]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[q, "LG"], [p, w]], [/(apple) ?tv/i], [q, [n, A + " TV"], [p, w]], [/crkey/i], [[n, E + "cast"], [q, G], [p, w]], [/droid.+aft(\w)( bui|\))/i], [n, [q, z], [p, w]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [n, [q, M], [p, w]], [/(bravia[\w ]+)( bui|\))/i], [n, [q, N], [p, w]], [/(mitv-\w{5}) bui/i], [n, [q, O], [p, w]], [/Hbbtv.*(technisat) (.*);/i], [q, n, [p, w]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[q, X], [n, X], [p, w]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[p, w]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [q, n, [p, t]], [/droid.+; (shield) bui/i], [n, [q, "Nvidia"], [p, t]], [/(playstation [345portablevi]+)/i], [n, [q, N], [p, t]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [n, [q, I], [p, t]], [/((pebble))app/i], [q, n, [p, x]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [n, [q, A], [p, x]], [/droid.+; (glass) \d/i], [n, [q, G], [p, x]], [/droid.+; (wt63?0{2,3})\)/i], [n, [q, P], [p, x]], [/(quest( 2| pro)?)/i], [n, [q, Q], [p, x]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [q, [p, y]], [/(aeobc)\b/i], [n, [q, z], [p, y]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [n, [p, u]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [n, [p, v]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[p, v]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[p, u]], [/(android[-\w\. ]{0,9});.+buil/i], [n, [q, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [r, [o, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [r, [o, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [o, r], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [r, o]], os: [[/microsoft (windows) (vista|xp)/i], [o, r], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [o, [r, Z, $]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[o, "Windows"], [r, Z, $]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[r, /_/g, "."], [o, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[o, S], [r, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [r, o], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [o, r], [/\(bb(10);/i], [r, [o, C]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [r, [o, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [r, [o, F + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [r, [o, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [r, [o, "watchOS"]], [/crkey\/([\d\.]+)/i], [r, [o, E + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[o, R], r], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [o, r], [/(sunos) ?([\w\.\d]*)/i], [[o, "Solaris"], r], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [o, r]] }, aa = function(a2, b2) {
              if (typeof a2 === k && (b2 = a2, a2 = h), !(this instanceof aa)) return new aa(a2, b2).getResult();
              var c2 = typeof g2 !== j && g2.navigator ? g2.navigator : h, d2 = a2 || (c2 && c2.userAgent ? c2.userAgent : ""), e3 = c2 && c2.userAgentData ? c2.userAgentData : h, f3 = b2 ? T(_, b2) : _, t2 = c2 && c2.userAgent == d2;
              return this.getBrowser = function() {
                var a3, b3 = {};
                return b3[o] = h, b3[r] = h, Y.call(b3, d2, f3.browser), b3[m] = typeof (a3 = b3[r]) === l ? a3.replace(/[^\d\.]/g, "").split(".")[0] : h, t2 && c2 && c2.brave && typeof c2.brave.isBrave == i && (b3[o] = "Brave"), b3;
              }, this.getCPU = function() {
                var a3 = {};
                return a3[s] = h, Y.call(a3, d2, f3.cpu), a3;
              }, this.getDevice = function() {
                var a3 = {};
                return a3[q] = h, a3[n] = h, a3[p] = h, Y.call(a3, d2, f3.device), t2 && !a3[p] && e3 && e3.mobile && (a3[p] = u), t2 && "Macintosh" == a3[n] && c2 && typeof c2.standalone !== j && c2.maxTouchPoints && c2.maxTouchPoints > 2 && (a3[n] = "iPad", a3[p] = v), a3;
              }, this.getEngine = function() {
                var a3 = {};
                return a3[o] = h, a3[r] = h, Y.call(a3, d2, f3.engine), a3;
              }, this.getOS = function() {
                var a3 = {};
                return a3[o] = h, a3[r] = h, Y.call(a3, d2, f3.os), t2 && !a3[o] && e3 && "Unknown" != e3.platform && (a3[o] = e3.platform.replace(/chrome os/i, R).replace(/macos/i, S)), a3;
              }, this.getResult = function() {
                return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
              }, this.getUA = function() {
                return d2;
              }, this.setUA = function(a3) {
                return d2 = typeof a3 === l && a3.length > 350 ? X(a3, 350) : a3, this;
              }, this.setUA(d2), this;
            };
            aa.VERSION = "1.0.35", aa.BROWSER = U([o, r, m]), aa.CPU = U([s]), aa.DEVICE = U([n, q, p, t, u, w, v, x, y]), aa.ENGINE = aa.OS = U([o, r]), typeof f2 !== j ? (e2.exports && (f2 = e2.exports = aa), f2.UAParser = aa) : c.amdO ? void 0 === (d = function() {
              return aa;
            }.call(b, c, b, a)) || (a.exports = d) : typeof g2 !== j && (g2.UAParser = aa);
            var ab = typeof g2 !== j && (g2.jQuery || g2.Zepto);
            if (ab && !ab.ua) {
              var ac = new aa();
              ab.ua = ac.getResult(), ab.ua.get = function() {
                return ac.getUA();
              }, ab.ua.set = function(a2) {
                ac.setUA(a2);
                var b2 = ac.getResult();
                for (var c2 in b2) ab.ua[c2] = b2[c2];
              };
            }
          }("object" == typeof window ? window : this);
        } }, f = {};
        function g(a2) {
          var b2 = f[a2];
          if (void 0 !== b2) return b2.exports;
          var c2 = f[a2] = { exports: {} }, d2 = true;
          try {
            e[a2].call(c2.exports, c2, c2.exports, g), d2 = false;
          } finally {
            d2 && delete f[a2];
          }
          return c2.exports;
        }
        g.ab = "//", a.exports = g(226);
      })();
    }, 515: (a, b, c) => {
      "use strict";
      c.d(b, { X: () => function a2(b2) {
        if ((0, g.p)(b2) || (0, f.C)(b2) || (0, i.h)(b2) || (0, h.I3)(b2) || "object" == typeof b2 && null !== b2 && b2.$$typeof === e || (0, d.Ts)(b2)) throw b2;
        b2 instanceof Error && "cause" in b2 && a2(b2.cause);
      } });
      var d = c(770);
      let e = Symbol.for("react.postpone");
      var f = c(340), g = c(747), h = c(107), i = c(159);
    }, 521: (a) => {
      "use strict";
      a.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 663: (a) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var b = {};
        (() => {
          b.parse = function(b2, c2) {
            if ("string" != typeof b2) throw TypeError("argument str must be a string");
            for (var e2 = {}, f = b2.split(d), g = (c2 || {}).decode || a2, h = 0; h < f.length; h++) {
              var i = f[h], j = i.indexOf("=");
              if (!(j < 0)) {
                var k = i.substr(0, j).trim(), l = i.substr(++j, i.length).trim();
                '"' == l[0] && (l = l.slice(1, -1)), void 0 == e2[k] && (e2[k] = function(a3, b3) {
                  try {
                    return b3(a3);
                  } catch (b4) {
                    return a3;
                  }
                }(l, g));
              }
            }
            return e2;
          }, b.serialize = function(a3, b2, d2) {
            var f = d2 || {}, g = f.encode || c;
            if ("function" != typeof g) throw TypeError("option encode is invalid");
            if (!e.test(a3)) throw TypeError("argument name is invalid");
            var h = g(b2);
            if (h && !e.test(h)) throw TypeError("argument val is invalid");
            var i = a3 + "=" + h;
            if (null != f.maxAge) {
              var j = f.maxAge - 0;
              if (isNaN(j) || !isFinite(j)) throw TypeError("option maxAge is invalid");
              i += "; Max-Age=" + Math.floor(j);
            }
            if (f.domain) {
              if (!e.test(f.domain)) throw TypeError("option domain is invalid");
              i += "; Domain=" + f.domain;
            }
            if (f.path) {
              if (!e.test(f.path)) throw TypeError("option path is invalid");
              i += "; Path=" + f.path;
            }
            if (f.expires) {
              if ("function" != typeof f.expires.toUTCString) throw TypeError("option expires is invalid");
              i += "; Expires=" + f.expires.toUTCString();
            }
            if (f.httpOnly && (i += "; HttpOnly"), f.secure && (i += "; Secure"), f.sameSite) switch ("string" == typeof f.sameSite ? f.sameSite.toLowerCase() : f.sameSite) {
              case true:
              case "strict":
                i += "; SameSite=Strict";
                break;
              case "lax":
                i += "; SameSite=Lax";
                break;
              case "none":
                i += "; SameSite=None";
                break;
              default:
                throw TypeError("option sameSite is invalid");
            }
            return i;
          };
          var a2 = decodeURIComponent, c = encodeURIComponent, d = /; */, e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        })(), a.exports = b;
      })();
    }, 720: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { interceptTestApis: function() {
        return f;
      }, wrapRequestHandler: function() {
        return g;
      } });
      let d = c(392), e = c(165);
      function f() {
        return (0, e.interceptFetch)(c.g.fetch);
      }
      function g(a2) {
        return (b2, c2) => (0, d.withRequest)(b2, e.reader, () => a2(b2, c2));
      }
    }, 747: (a, b, c) => {
      "use strict";
      c.d(b, { p: () => f });
      var d = c(66), e = c(944);
      function f(a2) {
        return (0, e.nJ)(a2) || (0, d.RM)(a2);
      }
    }, 770: (a, b, c) => {
      "use strict";
      function d(a2) {
        return "object" == typeof a2 && null !== a2 && "digest" in a2 && a2.digest === e;
      }
      c.d(b, { Ts: () => d, W5: () => h });
      let e = "HANGING_PROMISE_REJECTION";
      class f extends Error {
        constructor(a2, b2) {
          super(`During prerendering, ${b2} rejects when the prerender is complete. Typically these errors are handled by React but if you move ${b2} to a different context by using \`setTimeout\`, \`after\`, or similar functions you may observe this error and you should handle it in that context. This occurred at route "${a2}".`), this.route = a2, this.expression = b2, this.digest = e;
        }
      }
      let g = /* @__PURE__ */ new WeakMap();
      function h(a2, b2, c2) {
        if (a2.aborted) return Promise.reject(new f(b2, c2));
        {
          let d2 = new Promise((d3, e2) => {
            let h2 = e2.bind(null, new f(b2, c2)), i2 = g.get(a2);
            if (i2) i2.push(h2);
            else {
              let b3 = [h2];
              g.set(a2, b3), a2.addEventListener("abort", () => {
                for (let a3 = 0; a3 < b3.length; a3++) b3[a3]();
              }, { once: true });
            }
          });
          return d2.catch(i), d2;
        }
      }
      function i() {
      }
    }, 809: (a, b, c) => {
      "use strict";
      c.d(b, { z: () => d });
      class d extends Error {
        constructor(a2, b2) {
          super("Invariant: " + (a2.endsWith(".") ? a2 : a2 + ".") + " This is a bug in Next.js.", b2), this.name = "InvariantError";
        }
      }
    }, 814: (a, b, c) => {
      "use strict";
      a.exports = c(440);
    }, 817: (a, b, c) => {
      (() => {
        "use strict";
        var b2 = { 491: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ContextAPI = void 0;
          let d2 = c2(223), e2 = c2(172), f2 = c2(930), g = "context", h = new d2.NoopContextManager();
          class i {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new i()), this._instance;
            }
            setGlobalContextManager(a3) {
              return (0, e2.registerGlobal)(g, a3, f2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(a3, b4, c3, ...d3) {
              return this._getContextManager().with(a3, b4, c3, ...d3);
            }
            bind(a3, b4) {
              return this._getContextManager().bind(a3, b4);
            }
            _getContextManager() {
              return (0, e2.getGlobal)(g) || h;
            }
            disable() {
              this._getContextManager().disable(), (0, e2.unregisterGlobal)(g, f2.DiagAPI.instance());
            }
          }
          b3.ContextAPI = i;
        }, 930: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagAPI = void 0;
          let d2 = c2(56), e2 = c2(912), f2 = c2(957), g = c2(172);
          class h {
            constructor() {
              function a3(a4) {
                return function(...b5) {
                  let c3 = (0, g.getGlobal)("diag");
                  if (c3) return c3[a4](...b5);
                };
              }
              let b4 = this;
              b4.setLogger = (a4, c3 = { logLevel: f2.DiagLogLevel.INFO }) => {
                var d3, h2, i;
                if (a4 === b4) {
                  let a5 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return b4.error(null != (d3 = a5.stack) ? d3 : a5.message), false;
                }
                "number" == typeof c3 && (c3 = { logLevel: c3 });
                let j = (0, g.getGlobal)("diag"), k = (0, e2.createLogLevelDiagLogger)(null != (h2 = c3.logLevel) ? h2 : f2.DiagLogLevel.INFO, a4);
                if (j && !c3.suppressOverrideMessage) {
                  let a5 = null != (i = Error().stack) ? i : "<failed to generate stacktrace>";
                  j.warn(`Current logger will be overwritten from ${a5}`), k.warn(`Current logger will overwrite one already registered from ${a5}`);
                }
                return (0, g.registerGlobal)("diag", k, b4, true);
              }, b4.disable = () => {
                (0, g.unregisterGlobal)("diag", b4);
              }, b4.createComponentLogger = (a4) => new d2.DiagComponentLogger(a4), b4.verbose = a3("verbose"), b4.debug = a3("debug"), b4.info = a3("info"), b4.warn = a3("warn"), b4.error = a3("error");
            }
            static instance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
          }
          b3.DiagAPI = h;
        }, 653: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.MetricsAPI = void 0;
          let d2 = c2(660), e2 = c2(172), f2 = c2(930), g = "metrics";
          class h {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
            setGlobalMeterProvider(a3) {
              return (0, e2.registerGlobal)(g, a3, f2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, e2.getGlobal)(g) || d2.NOOP_METER_PROVIDER;
            }
            getMeter(a3, b4, c3) {
              return this.getMeterProvider().getMeter(a3, b4, c3);
            }
            disable() {
              (0, e2.unregisterGlobal)(g, f2.DiagAPI.instance());
            }
          }
          b3.MetricsAPI = h;
        }, 181: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.PropagationAPI = void 0;
          let d2 = c2(172), e2 = c2(874), f2 = c2(194), g = c2(277), h = c2(369), i = c2(930), j = "propagation", k = new e2.NoopTextMapPropagator();
          class l {
            constructor() {
              this.createBaggage = h.createBaggage, this.getBaggage = g.getBaggage, this.getActiveBaggage = g.getActiveBaggage, this.setBaggage = g.setBaggage, this.deleteBaggage = g.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new l()), this._instance;
            }
            setGlobalPropagator(a3) {
              return (0, d2.registerGlobal)(j, a3, i.DiagAPI.instance());
            }
            inject(a3, b4, c3 = f2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(a3, b4, c3);
            }
            extract(a3, b4, c3 = f2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(a3, b4, c3);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, d2.unregisterGlobal)(j, i.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, d2.getGlobal)(j) || k;
            }
          }
          b3.PropagationAPI = l;
        }, 997: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceAPI = void 0;
          let d2 = c2(172), e2 = c2(846), f2 = c2(139), g = c2(607), h = c2(930), i = "trace";
          class j {
            constructor() {
              this._proxyTracerProvider = new e2.ProxyTracerProvider(), this.wrapSpanContext = f2.wrapSpanContext, this.isSpanContextValid = f2.isSpanContextValid, this.deleteSpan = g.deleteSpan, this.getSpan = g.getSpan, this.getActiveSpan = g.getActiveSpan, this.getSpanContext = g.getSpanContext, this.setSpan = g.setSpan, this.setSpanContext = g.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new j()), this._instance;
            }
            setGlobalTracerProvider(a3) {
              let b4 = (0, d2.registerGlobal)(i, this._proxyTracerProvider, h.DiagAPI.instance());
              return b4 && this._proxyTracerProvider.setDelegate(a3), b4;
            }
            getTracerProvider() {
              return (0, d2.getGlobal)(i) || this._proxyTracerProvider;
            }
            getTracer(a3, b4) {
              return this.getTracerProvider().getTracer(a3, b4);
            }
            disable() {
              (0, d2.unregisterGlobal)(i, h.DiagAPI.instance()), this._proxyTracerProvider = new e2.ProxyTracerProvider();
            }
          }
          b3.TraceAPI = j;
        }, 277: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.deleteBaggage = b3.setBaggage = b3.getActiveBaggage = b3.getBaggage = void 0;
          let d2 = c2(491), e2 = (0, c2(780).createContextKey)("OpenTelemetry Baggage Key");
          function f2(a3) {
            return a3.getValue(e2) || void 0;
          }
          b3.getBaggage = f2, b3.getActiveBaggage = function() {
            return f2(d2.ContextAPI.getInstance().active());
          }, b3.setBaggage = function(a3, b4) {
            return a3.setValue(e2, b4);
          }, b3.deleteBaggage = function(a3) {
            return a3.deleteValue(e2);
          };
        }, 993: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.BaggageImpl = void 0;
          class c2 {
            constructor(a3) {
              this._entries = a3 ? new Map(a3) : /* @__PURE__ */ new Map();
            }
            getEntry(a3) {
              let b4 = this._entries.get(a3);
              if (b4) return Object.assign({}, b4);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([a3, b4]) => [a3, b4]);
            }
            setEntry(a3, b4) {
              let d2 = new c2(this._entries);
              return d2._entries.set(a3, b4), d2;
            }
            removeEntry(a3) {
              let b4 = new c2(this._entries);
              return b4._entries.delete(a3), b4;
            }
            removeEntries(...a3) {
              let b4 = new c2(this._entries);
              for (let c3 of a3) b4._entries.delete(c3);
              return b4;
            }
            clear() {
              return new c2();
            }
          }
          b3.BaggageImpl = c2;
        }, 830: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.baggageEntryMetadataSymbol = void 0, b3.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 369: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.baggageEntryMetadataFromString = b3.createBaggage = void 0;
          let d2 = c2(930), e2 = c2(993), f2 = c2(830), g = d2.DiagAPI.instance();
          b3.createBaggage = function(a3 = {}) {
            return new e2.BaggageImpl(new Map(Object.entries(a3)));
          }, b3.baggageEntryMetadataFromString = function(a3) {
            return "string" != typeof a3 && (g.error(`Cannot create baggage metadata from unknown type: ${typeof a3}`), a3 = ""), { __TYPE__: f2.baggageEntryMetadataSymbol, toString: () => a3 };
          };
        }, 67: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.context = void 0, b3.context = c2(491).ContextAPI.getInstance();
        }, 223: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopContextManager = void 0;
          let d2 = c2(780);
          class e2 {
            active() {
              return d2.ROOT_CONTEXT;
            }
            with(a3, b4, c3, ...d3) {
              return b4.call(c3, ...d3);
            }
            bind(a3, b4) {
              return b4;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          }
          b3.NoopContextManager = e2;
        }, 780: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ROOT_CONTEXT = b3.createContextKey = void 0, b3.createContextKey = function(a3) {
            return Symbol.for(a3);
          };
          class c2 {
            constructor(a3) {
              let b4 = this;
              b4._currentContext = a3 ? new Map(a3) : /* @__PURE__ */ new Map(), b4.getValue = (a4) => b4._currentContext.get(a4), b4.setValue = (a4, d2) => {
                let e2 = new c2(b4._currentContext);
                return e2._currentContext.set(a4, d2), e2;
              }, b4.deleteValue = (a4) => {
                let d2 = new c2(b4._currentContext);
                return d2._currentContext.delete(a4), d2;
              };
            }
          }
          b3.ROOT_CONTEXT = new c2();
        }, 506: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.diag = void 0, b3.diag = c2(930).DiagAPI.instance();
        }, 56: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagComponentLogger = void 0;
          let d2 = c2(172);
          class e2 {
            constructor(a3) {
              this._namespace = a3.namespace || "DiagComponentLogger";
            }
            debug(...a3) {
              return f2("debug", this._namespace, a3);
            }
            error(...a3) {
              return f2("error", this._namespace, a3);
            }
            info(...a3) {
              return f2("info", this._namespace, a3);
            }
            warn(...a3) {
              return f2("warn", this._namespace, a3);
            }
            verbose(...a3) {
              return f2("verbose", this._namespace, a3);
            }
          }
          function f2(a3, b4, c3) {
            let e3 = (0, d2.getGlobal)("diag");
            if (e3) return c3.unshift(b4), e3[a3](...c3);
          }
          b3.DiagComponentLogger = e2;
        }, 972: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagConsoleLogger = void 0;
          let c2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          class d2 {
            constructor() {
              for (let a3 = 0; a3 < c2.length; a3++) this[c2[a3].n] = /* @__PURE__ */ function(a4) {
                return function(...b4) {
                  if (console) {
                    let c3 = console[a4];
                    if ("function" != typeof c3 && (c3 = console.log), "function" == typeof c3) return c3.apply(console, b4);
                  }
                };
              }(c2[a3].c);
            }
          }
          b3.DiagConsoleLogger = d2;
        }, 912: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createLogLevelDiagLogger = void 0;
          let d2 = c2(957);
          b3.createLogLevelDiagLogger = function(a3, b4) {
            function c3(c4, d3) {
              let e2 = b4[c4];
              return "function" == typeof e2 && a3 >= d3 ? e2.bind(b4) : function() {
              };
            }
            return a3 < d2.DiagLogLevel.NONE ? a3 = d2.DiagLogLevel.NONE : a3 > d2.DiagLogLevel.ALL && (a3 = d2.DiagLogLevel.ALL), b4 = b4 || {}, { error: c3("error", d2.DiagLogLevel.ERROR), warn: c3("warn", d2.DiagLogLevel.WARN), info: c3("info", d2.DiagLogLevel.INFO), debug: c3("debug", d2.DiagLogLevel.DEBUG), verbose: c3("verbose", d2.DiagLogLevel.VERBOSE) };
          };
        }, 957: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagLogLevel = void 0, function(a3) {
            a3[a3.NONE = 0] = "NONE", a3[a3.ERROR = 30] = "ERROR", a3[a3.WARN = 50] = "WARN", a3[a3.INFO = 60] = "INFO", a3[a3.DEBUG = 70] = "DEBUG", a3[a3.VERBOSE = 80] = "VERBOSE", a3[a3.ALL = 9999] = "ALL";
          }(b3.DiagLogLevel || (b3.DiagLogLevel = {}));
        }, 172: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.unregisterGlobal = b3.getGlobal = b3.registerGlobal = void 0;
          let d2 = c2(200), e2 = c2(521), f2 = c2(130), g = e2.VERSION.split(".")[0], h = Symbol.for(`opentelemetry.js.api.${g}`), i = d2._globalThis;
          b3.registerGlobal = function(a3, b4, c3, d3 = false) {
            var f3;
            let g2 = i[h] = null != (f3 = i[h]) ? f3 : { version: e2.VERSION };
            if (!d3 && g2[a3]) {
              let b5 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${a3}`);
              return c3.error(b5.stack || b5.message), false;
            }
            if (g2.version !== e2.VERSION) {
              let b5 = Error(`@opentelemetry/api: Registration of version v${g2.version} for ${a3} does not match previously registered API v${e2.VERSION}`);
              return c3.error(b5.stack || b5.message), false;
            }
            return g2[a3] = b4, c3.debug(`@opentelemetry/api: Registered a global for ${a3} v${e2.VERSION}.`), true;
          }, b3.getGlobal = function(a3) {
            var b4, c3;
            let d3 = null == (b4 = i[h]) ? void 0 : b4.version;
            if (d3 && (0, f2.isCompatible)(d3)) return null == (c3 = i[h]) ? void 0 : c3[a3];
          }, b3.unregisterGlobal = function(a3, b4) {
            b4.debug(`@opentelemetry/api: Unregistering a global for ${a3} v${e2.VERSION}.`);
            let c3 = i[h];
            c3 && delete c3[a3];
          };
        }, 130: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.isCompatible = b3._makeCompatibilityCheck = void 0;
          let d2 = c2(521), e2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function f2(a3) {
            let b4 = /* @__PURE__ */ new Set([a3]), c3 = /* @__PURE__ */ new Set(), d3 = a3.match(e2);
            if (!d3) return () => false;
            let f3 = { major: +d3[1], minor: +d3[2], patch: +d3[3], prerelease: d3[4] };
            if (null != f3.prerelease) return function(b5) {
              return b5 === a3;
            };
            function g(a4) {
              return c3.add(a4), false;
            }
            return function(a4) {
              if (b4.has(a4)) return true;
              if (c3.has(a4)) return false;
              let d4 = a4.match(e2);
              if (!d4) return g(a4);
              let h = { major: +d4[1], minor: +d4[2], patch: +d4[3], prerelease: d4[4] };
              if (null != h.prerelease || f3.major !== h.major) return g(a4);
              if (0 === f3.major) return f3.minor === h.minor && f3.patch <= h.patch ? (b4.add(a4), true) : g(a4);
              return f3.minor <= h.minor ? (b4.add(a4), true) : g(a4);
            };
          }
          b3._makeCompatibilityCheck = f2, b3.isCompatible = f2(d2.VERSION);
        }, 886: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.metrics = void 0, b3.metrics = c2(653).MetricsAPI.getInstance();
        }, 901: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ValueType = void 0, function(a3) {
            a3[a3.INT = 0] = "INT", a3[a3.DOUBLE = 1] = "DOUBLE";
          }(b3.ValueType || (b3.ValueType = {}));
        }, 102: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createNoopMeter = b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = b3.NOOP_OBSERVABLE_GAUGE_METRIC = b3.NOOP_OBSERVABLE_COUNTER_METRIC = b3.NOOP_UP_DOWN_COUNTER_METRIC = b3.NOOP_HISTOGRAM_METRIC = b3.NOOP_COUNTER_METRIC = b3.NOOP_METER = b3.NoopObservableUpDownCounterMetric = b3.NoopObservableGaugeMetric = b3.NoopObservableCounterMetric = b3.NoopObservableMetric = b3.NoopHistogramMetric = b3.NoopUpDownCounterMetric = b3.NoopCounterMetric = b3.NoopMetric = b3.NoopMeter = void 0;
          class c2 {
            constructor() {
            }
            createHistogram(a3, c3) {
              return b3.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(a3, c3) {
              return b3.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(a3, c3) {
              return b3.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(a3, c3) {
              return b3.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(a3, c3) {
              return b3.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(a3, c3) {
              return b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(a3, b4) {
            }
            removeBatchObservableCallback(a3) {
            }
          }
          b3.NoopMeter = c2;
          class d2 {
          }
          b3.NoopMetric = d2;
          class e2 extends d2 {
            add(a3, b4) {
            }
          }
          b3.NoopCounterMetric = e2;
          class f2 extends d2 {
            add(a3, b4) {
            }
          }
          b3.NoopUpDownCounterMetric = f2;
          class g extends d2 {
            record(a3, b4) {
            }
          }
          b3.NoopHistogramMetric = g;
          class h {
            addCallback(a3) {
            }
            removeCallback(a3) {
            }
          }
          b3.NoopObservableMetric = h;
          class i extends h {
          }
          b3.NoopObservableCounterMetric = i;
          class j extends h {
          }
          b3.NoopObservableGaugeMetric = j;
          class k extends h {
          }
          b3.NoopObservableUpDownCounterMetric = k, b3.NOOP_METER = new c2(), b3.NOOP_COUNTER_METRIC = new e2(), b3.NOOP_HISTOGRAM_METRIC = new g(), b3.NOOP_UP_DOWN_COUNTER_METRIC = new f2(), b3.NOOP_OBSERVABLE_COUNTER_METRIC = new i(), b3.NOOP_OBSERVABLE_GAUGE_METRIC = new j(), b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new k(), b3.createNoopMeter = function() {
            return b3.NOOP_METER;
          };
        }, 660: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NOOP_METER_PROVIDER = b3.NoopMeterProvider = void 0;
          let d2 = c2(102);
          class e2 {
            getMeter(a3, b4, c3) {
              return d2.NOOP_METER;
            }
          }
          b3.NoopMeterProvider = e2, b3.NOOP_METER_PROVIDER = new e2();
        }, 200: function(a2, b3, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a3, d3, { enumerable: true, get: function() {
              return b4[c3];
            } });
          } : function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), a3[d3] = b4[c3];
          }), e2 = this && this.__exportStar || function(a3, b4) {
            for (var c3 in a3) "default" === c3 || Object.prototype.hasOwnProperty.call(b4, c3) || d2(b4, a3, c3);
          };
          Object.defineProperty(b3, "__esModule", { value: true }), e2(c2(46), b3);
        }, 651: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3._globalThis = void 0, b3._globalThis = "object" == typeof globalThis ? globalThis : c.g;
        }, 46: function(a2, b3, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a3, d3, { enumerable: true, get: function() {
              return b4[c3];
            } });
          } : function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), a3[d3] = b4[c3];
          }), e2 = this && this.__exportStar || function(a3, b4) {
            for (var c3 in a3) "default" === c3 || Object.prototype.hasOwnProperty.call(b4, c3) || d2(b4, a3, c3);
          };
          Object.defineProperty(b3, "__esModule", { value: true }), e2(c2(651), b3);
        }, 939: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.propagation = void 0, b3.propagation = c2(181).PropagationAPI.getInstance();
        }, 874: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTextMapPropagator = void 0;
          class c2 {
            inject(a3, b4) {
            }
            extract(a3, b4) {
              return a3;
            }
            fields() {
              return [];
            }
          }
          b3.NoopTextMapPropagator = c2;
        }, 194: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.defaultTextMapSetter = b3.defaultTextMapGetter = void 0, b3.defaultTextMapGetter = { get(a3, b4) {
            if (null != a3) return a3[b4];
          }, keys: (a3) => null == a3 ? [] : Object.keys(a3) }, b3.defaultTextMapSetter = { set(a3, b4, c2) {
            null != a3 && (a3[b4] = c2);
          } };
        }, 845: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.trace = void 0, b3.trace = c2(997).TraceAPI.getInstance();
        }, 403: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NonRecordingSpan = void 0;
          let d2 = c2(476);
          class e2 {
            constructor(a3 = d2.INVALID_SPAN_CONTEXT) {
              this._spanContext = a3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(a3, b4) {
              return this;
            }
            setAttributes(a3) {
              return this;
            }
            addEvent(a3, b4) {
              return this;
            }
            setStatus(a3) {
              return this;
            }
            updateName(a3) {
              return this;
            }
            end(a3) {
            }
            isRecording() {
              return false;
            }
            recordException(a3, b4) {
            }
          }
          b3.NonRecordingSpan = e2;
        }, 614: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTracer = void 0;
          let d2 = c2(491), e2 = c2(607), f2 = c2(403), g = c2(139), h = d2.ContextAPI.getInstance();
          class i {
            startSpan(a3, b4, c3 = h.active()) {
              var d3;
              if (null == b4 ? void 0 : b4.root) return new f2.NonRecordingSpan();
              let i2 = c3 && (0, e2.getSpanContext)(c3);
              return "object" == typeof (d3 = i2) && "string" == typeof d3.spanId && "string" == typeof d3.traceId && "number" == typeof d3.traceFlags && (0, g.isSpanContextValid)(i2) ? new f2.NonRecordingSpan(i2) : new f2.NonRecordingSpan();
            }
            startActiveSpan(a3, b4, c3, d3) {
              let f3, g2, i2;
              if (arguments.length < 2) return;
              2 == arguments.length ? i2 = b4 : 3 == arguments.length ? (f3 = b4, i2 = c3) : (f3 = b4, g2 = c3, i2 = d3);
              let j = null != g2 ? g2 : h.active(), k = this.startSpan(a3, f3, j), l = (0, e2.setSpan)(j, k);
              return h.with(l, i2, void 0, k);
            }
          }
          b3.NoopTracer = i;
        }, 124: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTracerProvider = void 0;
          let d2 = c2(614);
          class e2 {
            getTracer(a3, b4, c3) {
              return new d2.NoopTracer();
            }
          }
          b3.NoopTracerProvider = e2;
        }, 125: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ProxyTracer = void 0;
          let d2 = new (c2(614)).NoopTracer();
          class e2 {
            constructor(a3, b4, c3, d3) {
              this._provider = a3, this.name = b4, this.version = c3, this.options = d3;
            }
            startSpan(a3, b4, c3) {
              return this._getTracer().startSpan(a3, b4, c3);
            }
            startActiveSpan(a3, b4, c3, d3) {
              let e3 = this._getTracer();
              return Reflect.apply(e3.startActiveSpan, e3, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let a3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return a3 ? (this._delegate = a3, this._delegate) : d2;
            }
          }
          b3.ProxyTracer = e2;
        }, 846: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ProxyTracerProvider = void 0;
          let d2 = c2(125), e2 = new (c2(124)).NoopTracerProvider();
          class f2 {
            getTracer(a3, b4, c3) {
              var e3;
              return null != (e3 = this.getDelegateTracer(a3, b4, c3)) ? e3 : new d2.ProxyTracer(this, a3, b4, c3);
            }
            getDelegate() {
              var a3;
              return null != (a3 = this._delegate) ? a3 : e2;
            }
            setDelegate(a3) {
              this._delegate = a3;
            }
            getDelegateTracer(a3, b4, c3) {
              var d3;
              return null == (d3 = this._delegate) ? void 0 : d3.getTracer(a3, b4, c3);
            }
          }
          b3.ProxyTracerProvider = f2;
        }, 996: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SamplingDecision = void 0, function(a3) {
            a3[a3.NOT_RECORD = 0] = "NOT_RECORD", a3[a3.RECORD = 1] = "RECORD", a3[a3.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
          }(b3.SamplingDecision || (b3.SamplingDecision = {}));
        }, 607: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.getSpanContext = b3.setSpanContext = b3.deleteSpan = b3.setSpan = b3.getActiveSpan = b3.getSpan = void 0;
          let d2 = c2(780), e2 = c2(403), f2 = c2(491), g = (0, d2.createContextKey)("OpenTelemetry Context Key SPAN");
          function h(a3) {
            return a3.getValue(g) || void 0;
          }
          function i(a3, b4) {
            return a3.setValue(g, b4);
          }
          b3.getSpan = h, b3.getActiveSpan = function() {
            return h(f2.ContextAPI.getInstance().active());
          }, b3.setSpan = i, b3.deleteSpan = function(a3) {
            return a3.deleteValue(g);
          }, b3.setSpanContext = function(a3, b4) {
            return i(a3, new e2.NonRecordingSpan(b4));
          }, b3.getSpanContext = function(a3) {
            var b4;
            return null == (b4 = h(a3)) ? void 0 : b4.spanContext();
          };
        }, 325: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceStateImpl = void 0;
          let d2 = c2(564);
          class e2 {
            constructor(a3) {
              this._internalState = /* @__PURE__ */ new Map(), a3 && this._parse(a3);
            }
            set(a3, b4) {
              let c3 = this._clone();
              return c3._internalState.has(a3) && c3._internalState.delete(a3), c3._internalState.set(a3, b4), c3;
            }
            unset(a3) {
              let b4 = this._clone();
              return b4._internalState.delete(a3), b4;
            }
            get(a3) {
              return this._internalState.get(a3);
            }
            serialize() {
              return this._keys().reduce((a3, b4) => (a3.push(b4 + "=" + this.get(b4)), a3), []).join(",");
            }
            _parse(a3) {
              !(a3.length > 512) && (this._internalState = a3.split(",").reverse().reduce((a4, b4) => {
                let c3 = b4.trim(), e3 = c3.indexOf("=");
                if (-1 !== e3) {
                  let f2 = c3.slice(0, e3), g = c3.slice(e3 + 1, b4.length);
                  (0, d2.validateKey)(f2) && (0, d2.validateValue)(g) && a4.set(f2, g);
                }
                return a4;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let a3 = new e2();
              return a3._internalState = new Map(this._internalState), a3;
            }
          }
          b3.TraceStateImpl = e2;
        }, 564: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.validateValue = b3.validateKey = void 0;
          let c2 = "[_0-9a-z-*/]", d2 = `[a-z]${c2}{0,255}`, e2 = `[a-z0-9]${c2}{0,240}@[a-z]${c2}{0,13}`, f2 = RegExp(`^(?:${d2}|${e2})$`), g = /^[ -~]{0,255}[!-~]$/, h = /,|=/;
          b3.validateKey = function(a3) {
            return f2.test(a3);
          }, b3.validateValue = function(a3) {
            return g.test(a3) && !h.test(a3);
          };
        }, 98: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createTraceState = void 0;
          let d2 = c2(325);
          b3.createTraceState = function(a3) {
            return new d2.TraceStateImpl(a3);
          };
        }, 476: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.INVALID_SPAN_CONTEXT = b3.INVALID_TRACEID = b3.INVALID_SPANID = void 0;
          let d2 = c2(475);
          b3.INVALID_SPANID = "0000000000000000", b3.INVALID_TRACEID = "00000000000000000000000000000000", b3.INVALID_SPAN_CONTEXT = { traceId: b3.INVALID_TRACEID, spanId: b3.INVALID_SPANID, traceFlags: d2.TraceFlags.NONE };
        }, 357: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SpanKind = void 0, function(a3) {
            a3[a3.INTERNAL = 0] = "INTERNAL", a3[a3.SERVER = 1] = "SERVER", a3[a3.CLIENT = 2] = "CLIENT", a3[a3.PRODUCER = 3] = "PRODUCER", a3[a3.CONSUMER = 4] = "CONSUMER";
          }(b3.SpanKind || (b3.SpanKind = {}));
        }, 139: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.wrapSpanContext = b3.isSpanContextValid = b3.isValidSpanId = b3.isValidTraceId = void 0;
          let d2 = c2(476), e2 = c2(403), f2 = /^([0-9a-f]{32})$/i, g = /^[0-9a-f]{16}$/i;
          function h(a3) {
            return f2.test(a3) && a3 !== d2.INVALID_TRACEID;
          }
          function i(a3) {
            return g.test(a3) && a3 !== d2.INVALID_SPANID;
          }
          b3.isValidTraceId = h, b3.isValidSpanId = i, b3.isSpanContextValid = function(a3) {
            return h(a3.traceId) && i(a3.spanId);
          }, b3.wrapSpanContext = function(a3) {
            return new e2.NonRecordingSpan(a3);
          };
        }, 847: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SpanStatusCode = void 0, function(a3) {
            a3[a3.UNSET = 0] = "UNSET", a3[a3.OK = 1] = "OK", a3[a3.ERROR = 2] = "ERROR";
          }(b3.SpanStatusCode || (b3.SpanStatusCode = {}));
        }, 475: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceFlags = void 0, function(a3) {
            a3[a3.NONE = 0] = "NONE", a3[a3.SAMPLED = 1] = "SAMPLED";
          }(b3.TraceFlags || (b3.TraceFlags = {}));
        }, 521: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.VERSION = void 0, b3.VERSION = "1.6.0";
        } }, d = {};
        function e(a2) {
          var c2 = d[a2];
          if (void 0 !== c2) return c2.exports;
          var f2 = d[a2] = { exports: {} }, g = true;
          try {
            b2[a2].call(f2.exports, f2, f2.exports, e), g = false;
          } finally {
            g && delete d[a2];
          }
          return f2.exports;
        }
        e.ab = "//";
        var f = {};
        (() => {
          Object.defineProperty(f, "__esModule", { value: true }), f.trace = f.propagation = f.metrics = f.diag = f.context = f.INVALID_SPAN_CONTEXT = f.INVALID_TRACEID = f.INVALID_SPANID = f.isValidSpanId = f.isValidTraceId = f.isSpanContextValid = f.createTraceState = f.TraceFlags = f.SpanStatusCode = f.SpanKind = f.SamplingDecision = f.ProxyTracerProvider = f.ProxyTracer = f.defaultTextMapSetter = f.defaultTextMapGetter = f.ValueType = f.createNoopMeter = f.DiagLogLevel = f.DiagConsoleLogger = f.ROOT_CONTEXT = f.createContextKey = f.baggageEntryMetadataFromString = void 0;
          var a2 = e(369);
          Object.defineProperty(f, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
            return a2.baggageEntryMetadataFromString;
          } });
          var b3 = e(780);
          Object.defineProperty(f, "createContextKey", { enumerable: true, get: function() {
            return b3.createContextKey;
          } }), Object.defineProperty(f, "ROOT_CONTEXT", { enumerable: true, get: function() {
            return b3.ROOT_CONTEXT;
          } });
          var c2 = e(972);
          Object.defineProperty(f, "DiagConsoleLogger", { enumerable: true, get: function() {
            return c2.DiagConsoleLogger;
          } });
          var d2 = e(957);
          Object.defineProperty(f, "DiagLogLevel", { enumerable: true, get: function() {
            return d2.DiagLogLevel;
          } });
          var g = e(102);
          Object.defineProperty(f, "createNoopMeter", { enumerable: true, get: function() {
            return g.createNoopMeter;
          } });
          var h = e(901);
          Object.defineProperty(f, "ValueType", { enumerable: true, get: function() {
            return h.ValueType;
          } });
          var i = e(194);
          Object.defineProperty(f, "defaultTextMapGetter", { enumerable: true, get: function() {
            return i.defaultTextMapGetter;
          } }), Object.defineProperty(f, "defaultTextMapSetter", { enumerable: true, get: function() {
            return i.defaultTextMapSetter;
          } });
          var j = e(125);
          Object.defineProperty(f, "ProxyTracer", { enumerable: true, get: function() {
            return j.ProxyTracer;
          } });
          var k = e(846);
          Object.defineProperty(f, "ProxyTracerProvider", { enumerable: true, get: function() {
            return k.ProxyTracerProvider;
          } });
          var l = e(996);
          Object.defineProperty(f, "SamplingDecision", { enumerable: true, get: function() {
            return l.SamplingDecision;
          } });
          var m = e(357);
          Object.defineProperty(f, "SpanKind", { enumerable: true, get: function() {
            return m.SpanKind;
          } });
          var n = e(847);
          Object.defineProperty(f, "SpanStatusCode", { enumerable: true, get: function() {
            return n.SpanStatusCode;
          } });
          var o = e(475);
          Object.defineProperty(f, "TraceFlags", { enumerable: true, get: function() {
            return o.TraceFlags;
          } });
          var p = e(98);
          Object.defineProperty(f, "createTraceState", { enumerable: true, get: function() {
            return p.createTraceState;
          } });
          var q = e(139);
          Object.defineProperty(f, "isSpanContextValid", { enumerable: true, get: function() {
            return q.isSpanContextValid;
          } }), Object.defineProperty(f, "isValidTraceId", { enumerable: true, get: function() {
            return q.isValidTraceId;
          } }), Object.defineProperty(f, "isValidSpanId", { enumerable: true, get: function() {
            return q.isValidSpanId;
          } });
          var r = e(476);
          Object.defineProperty(f, "INVALID_SPANID", { enumerable: true, get: function() {
            return r.INVALID_SPANID;
          } }), Object.defineProperty(f, "INVALID_TRACEID", { enumerable: true, get: function() {
            return r.INVALID_TRACEID;
          } }), Object.defineProperty(f, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
            return r.INVALID_SPAN_CONTEXT;
          } });
          let s = e(67);
          Object.defineProperty(f, "context", { enumerable: true, get: function() {
            return s.context;
          } });
          let t = e(506);
          Object.defineProperty(f, "diag", { enumerable: true, get: function() {
            return t.diag;
          } });
          let u = e(886);
          Object.defineProperty(f, "metrics", { enumerable: true, get: function() {
            return u.metrics;
          } });
          let v = e(939);
          Object.defineProperty(f, "propagation", { enumerable: true, get: function() {
            return v.propagation;
          } });
          let w = e(845);
          Object.defineProperty(f, "trace", { enumerable: true, get: function() {
            return w.trace;
          } }), f.default = { context: s.context, diag: t.diag, metrics: u.metrics, propagation: v.propagation, trace: w.trace };
        })(), a.exports = f;
      })();
    }, 918: (a, b, c) => {
      "use strict";
      c.d(b, { s: () => d });
      let d = (0, c(58).xl)();
    }, 944: (a, b, c) => {
      "use strict";
      c.d(b, { nJ: () => g, oJ: () => e, zB: () => f });
      var d = c(378);
      let e = "NEXT_REDIRECT";
      var f = function(a2) {
        return a2.push = "push", a2.replace = "replace", a2;
      }({});
      function g(a2) {
        if ("object" != typeof a2 || null === a2 || !("digest" in a2) || "string" != typeof a2.digest) return false;
        let b2 = a2.digest.split(";"), [c2, f2] = b2, g2 = b2.slice(2, -2).join(";"), h = Number(b2.at(-2));
        return c2 === e && ("replace" === f2 || "push" === f2) && "string" == typeof g2 && !isNaN(h) && h in d.Q;
      }
    }, 979: (a, b, c) => {
      "use strict";
      c.d(b, { f: () => d });
      class d extends Error {
        constructor(...a2) {
          super(...a2), this.code = "NEXT_STATIC_GEN_BAILOUT";
        }
      }
    } }, (a) => {
      var b = a(a.s = 242);
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES).middleware_middleware = b;
    }]);
  }
});

// node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico).*))(\\.json)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";

// node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": true }, "typescript": { "ignoreBuildErrors": true, "tsconfigPath": "tsconfig.json" }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.mjs", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "maximumResponseBody": 5e7, "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "remotePatterns": [], "unoptimized": true }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/Users/Chan/Documents/chirp-mvp-page-editor", "experimental": { "useSkewCookie": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 4294967294 } }, "cacheHandlers": {}, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientSegmentCache": false, "clientParamParsing": false, "dynamicOnHover": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 7, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "imgOptSkipMetadata": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "viewTransition": false, "routerBFCache": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "cacheComponents": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "devtoolSegmentExplorer": true, "browserDebugInfoInTerminal": false, "optimizeRouterScrolling": false, "middlewareClientMaxBodySize": 10485760, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.mjs", "turbopack": { "root": "/Users/Chan/Documents/chirp-mvp-page-editor" } };
var BuildId = "bT6rIKzhKogF_RB9pA0US";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/admin", "regex": "^/admin(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin(?:/)?$" }, { "page": "/admin/analytics", "regex": "^/admin/analytics(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/analytics(?:/)?$" }, { "page": "/admin/checkout-links", "regex": "^/admin/checkout\\-links(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/checkout\\-links(?:/)?$" }, { "page": "/admin/discounts", "regex": "^/admin/discounts(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/discounts(?:/)?$" }, { "page": "/admin/editor", "regex": "^/admin/editor(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/editor(?:/)?$" }, { "page": "/admin/inventory", "regex": "^/admin/inventory(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/inventory(?:/)?$" }, { "page": "/admin/messages", "regex": "^/admin/messages(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/messages(?:/)?$" }, { "page": "/admin/orders", "regex": "^/admin/orders(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/orders(?:/)?$" }, { "page": "/admin/settings", "regex": "^/admin/settings(?:/)?$", "routeKeys": {}, "namedRegex": "^/admin/settings(?:/)?$" }, { "page": "/catalog", "regex": "^/catalog(?:/)?$", "routeKeys": {}, "namedRegex": "^/catalog(?:/)?$" }, { "page": "/checkout", "regex": "^/checkout(?:/)?$", "routeKeys": {}, "namedRegex": "^/checkout(?:/)?$" }, { "page": "/experimental-catalog", "regex": "^/experimental\\-catalog(?:/)?$", "routeKeys": {}, "namedRegex": "^/experimental\\-catalog(?:/)?$" }, { "page": "/experimental-home", "regex": "^/experimental\\-home(?:/)?$", "routeKeys": {}, "namedRegex": "^/experimental\\-home(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }, { "page": "/signup", "regex": "^/signup(?:/)?$", "routeKeys": {}, "namedRegex": "^/signup(?:/)?$" }, { "page": "/thank-you", "regex": "^/thank\\-you(?:/)?$", "routeKeys": {}, "namedRegex": "^/thank\\-you(?:/)?$" }], "dynamic": [{ "page": "/admin/orders/[id]", "regex": "^/admin/orders/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/admin/orders/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/admin/instagram/conversations/[conversationId]/messages", "regex": "^/api/admin/instagram/conversations/([^/]+?)/messages(?:/)?$", "routeKeys": { "nxtPconversationId": "nxtPconversationId" }, "namedRegex": "^/api/admin/instagram/conversations/(?<nxtPconversationId>[^/]+?)/messages(?:/)?$" }, { "page": "/api/admin/instagram/conversations/[conversationId]/send", "regex": "^/api/admin/instagram/conversations/([^/]+?)/send(?:/)?$", "routeKeys": { "nxtPconversationId": "nxtPconversationId" }, "namedRegex": "^/api/admin/instagram/conversations/(?<nxtPconversationId>[^/]+?)/send(?:/)?$" }, { "page": "/api/auth/[...nextauth]", "regex": "^/api/auth/(.+?)(?:/)?$", "routeKeys": { "nxtPnextauth": "nxtPnextauth" }, "namedRegex": "^/api/auth/(?<nxtPnextauth>.+?)(?:/)?$" }, { "page": "/api/brands/[id]", "regex": "^/api/brands/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/brands/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/categories/[id]", "regex": "^/api/categories/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/categories/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/discounts/[id]", "regex": "^/api/discounts/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/discounts/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/orders/[id]", "regex": "^/api/orders/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/orders/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/payment-methods/[id]", "regex": "^/api/payment\\-methods/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/payment\\-methods/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/products/[id]", "regex": "^/api/products/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/products/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/api/products/[id]/variants", "regex": "^/api/products/([^/]+?)/variants(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/api/products/(?<nxtPid>[^/]+?)/variants(?:/)?$" }, { "page": "/api/products/[id]/variants/[variantId]", "regex": "^/api/products/([^/]+?)/variants/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid", "nxtPvariantId": "nxtPvariantId" }, "namedRegex": "^/api/products/(?<nxtPid>[^/]+?)/variants/(?<nxtPvariantId>[^/]+?)(?:/)?$" }, { "page": "/api/uploads/[category]", "regex": "^/api/uploads/([^/]+?)(?:/)?$", "routeKeys": { "nxtPcategory": "nxtPcategory" }, "namedRegex": "^/api/uploads/(?<nxtPcategory>[^/]+?)(?:/)?$" }, { "page": "/receipt/[id]", "regex": "^/receipt/([^/]+?)(?:/)?$", "routeKeys": { "nxtPid": "nxtPid" }, "namedRegex": "^/receipt/(?<nxtPid>[^/]+?)(?:/)?$" }, { "page": "/shop/[variantSlug]", "regex": "^/shop/([^/]+?)(?:/)?$", "routeKeys": { "nxtPvariantSlug": "nxtPvariantSlug" }, "namedRegex": "^/shop/(?<nxtPvariantSlug>[^/]+?)(?:/)?$" }], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [];
var PrerenderManifest = { "version": 4, "routes": {}, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "c91c727dd5007f38798d36f15bb46b8f", "previewModeSigningKey": "eb24c917449836d82f32af7ff77c73ce532581244c76bac7d638b2786468b44f", "previewModeEncryptionKey": "dc2039f8eae38a82c19dcce92a378ae4ac2d64e62a2d938f92c8b289bdb0ffa8" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/middleware.js"], "name": "middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico).*))(\\.json)?[\\/#\\?]?$", "originalSource": "/((?!_next/static|_next/image|favicon.ico).*)" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "bT6rIKzhKogF_RB9pA0US", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "lBP1hT1+Vdh7k6F5vua9PE9JbxCgH54PShkCECTJ2QE=", "__NEXT_PREVIEW_MODE_ID": "c91c727dd5007f38798d36f15bb46b8f", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "eb24c917449836d82f32af7ff77c73ce532581244c76bac7d638b2786468b44f", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "dc2039f8eae38a82c19dcce92a378ae4ac2d64e62a2d938f92c8b289bdb0ffa8" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/api/admin/instagram/connection-status/route": "/api/admin/instagram/connection-status", "/api/admin/instagram/conversations/[conversationId]/messages/route": "/api/admin/instagram/conversations/[conversationId]/messages", "/api/admin/instagram/conversations/[conversationId]/send/route": "/api/admin/instagram/conversations/[conversationId]/send", "/api/admin/instagram/conversations/route": "/api/admin/instagram/conversations", "/api/admin/instagram/check-pages/route": "/api/admin/instagram/check-pages", "/api/admin/instagram/disconnect/route": "/api/admin/instagram/disconnect", "/api/admin/instagram/debug/route": "/api/admin/instagram/debug", "/api/admin/instagram/inspect-session/route": "/api/admin/instagram/inspect-session", "/api/admin/instagram/sync/route": "/api/admin/instagram/sync", "/api/admin/instagram/finalize/route": "/api/admin/instagram/finalize", "/api/admin/instagram/test-flow/route": "/api/admin/instagram/test-flow", "/api/auth/instagram/login/route": "/api/auth/instagram/login", "/api/auth/instagram/callback/route": "/api/auth/instagram/callback", "/api/brands/route": "/api/brands", "/api/auth/logout/route": "/api/auth/logout", "/api/auth/login/route": "/api/auth/login", "/api/brands/[id]/route": "/api/brands/[id]", "/api/auth/[...nextauth]/route": "/api/auth/[...nextauth]", "/api/discounts/[id]/route": "/api/discounts/[id]", "/api/categories/[id]/route": "/api/categories/[id]", "/api/categories/route": "/api/categories", "/api/discounts/route": "/api/discounts", "/api/orders/route": "/api/orders", "/api/catalog-data/route": "/api/catalog-data", "/api/payment-methods/route": "/api/payment-methods", "/api/products/[id]/route": "/api/products/[id]", "/api/auth/signup/route": "/api/auth/signup", "/api/orders/[id]/route": "/api/orders/[id]", "/api/products/[id]/variants/[variantId]/route": "/api/products/[id]/variants/[variantId]", "/api/products/route": "/api/products", "/api/uploads/[category]/route": "/api/uploads/[category]", "/api/storefront-settings/route": "/api/storefront-settings", "/api/payment-methods/[id]/route": "/api/payment-methods/[id]", "/api/products/[id]/variants/route": "/api/products/[id]/variants", "/api/instagram/webhook/route": "/api/instagram/webhook", "/checkout/page": "/checkout", "/receipt/[id]/page": "/receipt/[id]", "/signup/page": "/signup", "/login/page": "/login", "/shop/[variantSlug]/page": "/shop/[variantSlug]", "/thank-you/page": "/thank-you", "/catalog/page": "/catalog", "/experimental-catalog/page": "/experimental-catalog", "/page": "/", "/experimental-home/page": "/experimental-home", "/admin/checkout-links/page": "/admin/checkout-links", "/admin/settings/page": "/admin/settings", "/admin/page": "/admin", "/admin/discounts/page": "/admin/discounts", "/admin/analytics/page": "/admin/analytics", "/admin/inventory/page": "/admin/inventory", "/admin/orders/page": "/admin/orders", "/admin/editor/page": "/admin/editor", "/admin/messages/page": "/admin/messages", "/admin/orders/[id]/page": "/admin/orders/[id]" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/_error": "pages/_error.js", "/_app": "pages/_app.js", "/_document": "pages/_document.js" };
process.env.NEXT_BUILD_ID = BuildId;
process.env.NEXT_PREVIEW_MODE_ID = PrerenderManifest?.preview?.previewModeId;

// node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();
import { ReadableStream as ReadableStream3 } from "node:stream/web";

// node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType.split(";")[0];
  return commonBinaryMimeTypes.has(value);
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (!pattern.test(url))
    return false;
  if (host) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.host !== host;
    } catch {
      return !url.includes(host);
    }
  }
  return true;
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  return new ReadableStream3({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
var NEXT_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
var NEXT_PRERENDER_HEADER = "x-nextjs-prerender";
var NEXT_POSTPONED_HEADER = "x-nextjs-postponed";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest?.routes ?? {}).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
function getBodyForAppRouter(event, cachedValue) {
  if (cachedValue.type !== "app") {
    throw new Error("getBodyForAppRouter called with non-app cache value");
  }
  try {
    const segmentHeader = `${event.headers[NEXT_SEGMENT_PREFETCH_HEADER]}`;
    const isSegmentResponse = Boolean(segmentHeader) && segmentHeader in (cachedValue.segmentData || {});
    const body = isSegmentResponse ? cachedValue.segmentData[segmentHeader] : cachedValue.rsc;
    return {
      body,
      additionalHeaders: isSegmentResponse ? { [NEXT_PRERENDER_HEADER]: "1", [NEXT_POSTPONED_HEADER]: "2" } : {}
    };
  } catch (e) {
    error("Error while getting body for app router from cache:", e);
    return { body: cachedValue.rsc, additionalHeaders: {} };
  }
}
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  let additionalHeaders = {};
  if (cachedValue.type === "app") {
    isDataRequest = Boolean(event.headers.rsc);
    if (isDataRequest) {
      const { body: appRouterBody, additionalHeaders: appHeaders } = getBodyForAppRouter(event, cachedValue);
      body = appRouterBody;
      additionalHeaders = appHeaders;
    } else {
      body = cachedValue.html;
    }
    type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
  } else if (cachedValue.type === "page") {
    isDataRequest = Boolean(event.query.__nextDataReq);
    body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
    type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
  } else {
    throw new Error("generateResult called with unsupported cache value type, only 'app' and 'page' are supported");
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER,
      ...additionalHeaders
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest?.routes ?? {}).includes(localizedPath ?? "/") || Object.values(PrerenderManifest?.dynamicRoutes ?? {}).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => (route.startsWith("/api/") || route === "/api") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes = {}, routes = {} } = prerenderManifest ?? {};
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest?.preview?.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
