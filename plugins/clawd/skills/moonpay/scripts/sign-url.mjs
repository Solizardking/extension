#!/usr/bin/env node
/**
 * MoonPay on-ramp URL signer with IP matching.
 *
 * Required after 2026-08-07: hash the customer's public IP (HMAC-SHA256,
 * secret key, base64) as allowedIpAddress, then sign the full query string
 * (including the leading ?) with the same key. Append signature last.
 *
 * Secret comes from MOONPAY_SECRET_KEY. Never pass it on the CLI.
 *
 * Docs:
 *   https://dev.moonpay.com/widget/on-ramp/customization/ip-matching
 *   https://dev.moonpay.com/widget/on-ramp/customization/url-signing
 */

import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isIPv4, isIPv6 } from "node:net";

const SANDBOX_HOST = "https://buy-sandbox.moonpay.com";
const LIVE_HOST = "https://buy.moonpay.com";

const VECTOR = {
  secretKey: "sk_test_DocsVector00",
  url: "https://buy-sandbox.moonpay.com/?apiKey=pk_test_DocsVector00&currencyCode=eth&walletAddress=0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
  message:
    "?apiKey=pk_test_DocsVector00&currencyCode=eth&walletAddress=0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
  signature: "oIJxSghyzll/BLhUFdQZhkxf7DAS8REFaWr/ibO+K8Q=",
  encoded: "oIJxSghyzll%2FBLhUFdQZhkxf7DAS8REFaWr%2FibO%2BK8Q%3D",
};

function hmacB64(secret, message) {
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
}

function stripZone(ip) {
  const pct = ip.lastIndexOf("%");
  return pct !== -1 && ip.includes(":") ? ip.slice(0, pct) : ip;
}

export function canonicalizeIp(raw) {
  if (raw == null) return "";
  let ip = String(raw).trim();
  if (ip.startsWith("[") && ip.endsWith("]")) ip = ip.slice(1, -1);
  ip = stripZone(ip);
  if (isIPv4(ip)) return ip;
  if (!isIPv6(ip)) {
    throw new Error(`Not an IPv4/IPv6 address: ${JSON.stringify(raw)}`);
  }
  return canonicalizeIpv6(ip);
}

function canonicalizeIpv6(ip) {
  const lower = ip.toLowerCase();
  let ipv4Tail = null;
  let core = lower;
  const lastColon = lower.lastIndexOf(":");
  const maybeV4 = lower.slice(lastColon + 1);
  if (maybeV4.includes(".")) {
    if (!isIPv4(maybeV4)) throw new Error(`Invalid IPv4 tail in IPv6: ${ip}`);
    ipv4Tail = maybeV4;
    core = lower.slice(0, lastColon);
  }

  const dbl = core.indexOf("::");
  let left;
  let right;
  if (dbl === -1) {
    left = core ? core.split(":") : [];
    right = [];
  } else {
    if (core.indexOf("::", dbl + 2) !== -1) {
      throw new Error(`Invalid IPv6 (multiple ::): ${ip}`);
    }
    left = core.slice(0, dbl) ? core.slice(0, dbl).split(":") : [];
    right = core.slice(dbl + 2) ? core.slice(dbl + 2).split(":") : [];
  }
  left = left.filter((p) => p.length > 0);
  right = right.filter((p) => p.length > 0);

  const needed = 8 - left.length - right.length - (ipv4Tail ? 2 : 0);
  if (needed < 0 || (dbl === -1 && needed !== 0)) {
    throw new Error(`Invalid IPv6: ${ip}`);
  }
  const hexParts = [...left, ...Array(needed).fill("0"), ...right];
  if (ipv4Tail) {
    const [a, b, c, d] = ipv4Tail.split(".").map(Number);
    hexParts.push(((a << 8) | b).toString(16), ((c << 8) | d).toString(16));
  }
  if (hexParts.length !== 8) throw new Error(`Invalid IPv6: ${ip}`);

  const groups = hexParts.map((g) => {
    const n = Number.parseInt(g, 16);
    if (Number.isNaN(n) || n < 0 || n > 0xffff) {
      throw new Error(`Invalid IPv6 group in ${ip}`);
    }
    return n;
  });

  // RFC 5952: compress the longest run of 2+ zeros; leftmost on a tie.
  let bestStart = -1;
  let bestLen = 0;
  let i = 0;
  while (i < 8) {
    if (groups[i] === 0) {
      let j = i;
      while (j < 8 && groups[j] === 0) j += 1;
      const len = j - i;
      if (len > bestLen) {
        bestStart = i;
        bestLen = len;
      }
      i = j;
    } else {
      i += 1;
    }
  }

  const hex = groups.map((n) => n.toString(16));
  if (bestLen < 2) return hex.join(":");
  return `${hex.slice(0, bestStart).join(":")}::${hex.slice(bestStart + bestLen).join(":")}`;
}

function isPrivateIp(ip) {
  if (isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  if (isIPv6(ip)) {
    const c = canonicalizeIpv6(ip);
    if (c === "::1" || c === "::") return true;
    const expanded = expandIpv6(c);
    const first = Number.parseInt(expanded[0], 16);
    if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
    // IPv4-mapped private
    if (
      expanded[0] === "0" &&
      expanded[1] === "0" &&
      expanded[2] === "0" &&
      expanded[3] === "0" &&
      expanded[4] === "0" &&
      expanded[5] === "ffff"
    ) {
      const hi = Number.parseInt(expanded[6], 16);
      const lo = Number.parseInt(expanded[7], 16);
      return isPrivateIp(`${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`);
    }
    return false;
  }
  return true;
}

function expandIpv6(canonical) {
  const [left, right = ""] = canonical.split("::");
  const l = left ? left.split(":") : [];
  const r = right ? right.split(":") : [];
  const fill = 8 - l.length - r.length;
  return [...l, ...Array(Math.max(fill, 0)).fill("0"), ...r];
}

export function pickClientIp({ ip, trueClientIp, xForwardedFor } = {}) {
  const candidates = [];
  if (trueClientIp) candidates.push(trueClientIp);
  if (xForwardedFor) {
    for (const part of String(xForwardedFor).split(",")) {
      candidates.push(part.trim());
    }
  }
  if (ip) candidates.push(ip);

  for (const raw of candidates) {
    if (!raw) continue;
    let canonical;
    try {
      canonical = canonicalizeIp(raw);
    } catch {
      continue;
    }
    if (!isPrivateIp(canonical)) return canonical;
  }
  return null;
}

function encodePairs(pairs) {
  return pairs
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
}

export function buildSignedWidgetUrl({
  secretKey,
  apiKey,
  walletAddress,
  currencyCode = "sol",
  extraParams = {},
  customerIp = null,
  sandbox = true,
  baseUrl,
}) {
  if (!secretKey) throw new Error("MOONPAY_SECRET_KEY is required");
  if (!apiKey) throw new Error("publishable apiKey is required");
  if (!walletAddress) throw new Error("walletAddress is required");

  const host = baseUrl ?? (sandbox ? SANDBOX_HOST : LIVE_HOST);
  const pairs = [
    ["apiKey", apiKey],
    ["currencyCode", currencyCode],
    ["walletAddress", walletAddress],
    ...Object.entries(extraParams).filter(([, value]) => value != null && value !== ""),
  ];

  if (customerIp) {
    const canonical = canonicalizeIp(customerIp);
    pairs.push(["allowedIpAddress", hmacB64(secretKey, canonical)]);
  }

  const query = `?${encodePairs(pairs)}`;
  const signature = hmacB64(secretKey, query);
  return {
    url: `${host}${query}&signature=${encodeURIComponent(signature)}`,
    query,
    signature,
    ipMatching: Boolean(customerIp),
    canonicalIp: customerIp ? canonicalizeIp(customerIp) : null,
  };
}

function parseArgs(argv) {
  const out = {
    extraParams: {},
    sandbox: true,
    selfTest: false,
    omitIp: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      return argv[i];
    };
    switch (arg) {
      case "--self-test":
        out.selfTest = true;
        break;
      case "--live":
        out.sandbox = false;
        break;
      case "--sandbox":
        out.sandbox = true;
        break;
      case "--omit-ip":
        out.omitIp = true;
        break;
      case "--api-key":
        out.apiKey = next();
        break;
      case "--wallet":
        out.walletAddress = next();
        break;
      case "--currency":
        out.currencyCode = next();
        break;
      case "--ip":
        out.ip = next();
        break;
      case "--app-ip":
        out.appIp = next();
        break;
      case "--safari-ip":
        out.safariIp = next();
        break;
      case "--true-client-ip":
        out.trueClientIp = next();
        break;
      case "--xff":
        out.xForwardedFor = next();
        break;
      case "--base-url":
        out.baseUrl = next();
        break;
      case "--param": {
        const pair = next() ?? "";
        const eq = pair.indexOf("=");
        if (eq === -1) throw new Error(`--param expects key=value, got ${pair}`);
        out.extraParams[pair.slice(0, eq)] = pair.slice(eq + 1);
        break;
      }
      case "--json":
        out.json = true;
        break;
      case "--help":
      case "-h":
        out.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return out;
}

function help() {
  return `MoonPay signed on-ramp URL with IP matching.

Usage:
  MOONPAY_SECRET_KEY=sk_test_... node sign-url.mjs --sandbox \\
    --api-key pk_test_... --wallet <addr> --currency sol --ip 203.0.113.42

  node sign-url.mjs --self-test

Flags:
  --sandbox | --live     Widget host (default: sandbox)
  --api-key              Publishable key (or MOONPAY_PUBLISHABLE_KEY)
  --wallet               Destination walletAddress
  --currency             currencyCode (default: sol)
  --ip                   Customer public IP (already known)
  --true-client-ip       True-Client-IP header
  --xff                  X-Forwarded-For header (left-most public IP wins)
  --app-ip --safari-ip   Private Relay check; omit allowedIpAddress if they differ
  --omit-ip              Force omit allowedIpAddress (Safari / Private Relay)
  --param key=value      Extra widget query param (repeatable)
  --json                 Print JSON instead of the URL
  --self-test            Verify MoonPay's signing vector + IPv6 canonicalization
`;
}

function selfTest() {
  const failures = [];
  const signed = hmacB64(VECTOR.secretKey, new URL(VECTOR.url).search);
  if (signed !== VECTOR.signature) {
    failures.push(`signing vector: got ${signed}, expected ${VECTOR.signature}`);
  }
  if (encodeURIComponent(VECTOR.signature) !== VECTOR.encoded) {
    failures.push("signature URL-encoding does not match the docs vector");
  }
  const v6 = canonicalizeIp("2001:0DB8:0000:0000:0000:0000:0000:0001");
  if (v6 !== "2001:db8::1") {
    failures.push(`IPv6 RFC 5952: got ${v6}, expected 2001:db8::1`);
  }
  const v4 = canonicalizeIp("203.0.113.42");
  if (v4 !== "203.0.113.42") failures.push(`IPv4: got ${v4}`);

  const picked = pickClientIp({
    trueClientIp: "203.0.113.42",
    xForwardedFor: "10.0.0.1, 203.0.113.42",
  });
  if (picked !== "203.0.113.42") {
    failures.push(`pickClientIp: got ${picked}`);
  }

  const built = buildSignedWidgetUrl({
    secretKey: VECTOR.secretKey,
    apiKey: "pk_test_DocsVector00",
    walletAddress: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
    currencyCode: "eth",
    customerIp: "203.0.113.42",
    sandbox: true,
  });
  const search = new URL(built.url).search;
  if (!search.includes("allowedIpAddress=")) {
    failures.push("built URL missing allowedIpAddress");
  }
  if (!search.endsWith(`signature=${encodeURIComponent(built.signature)}`) &&
      !search.includes(`&signature=${encodeURIComponent(built.signature)}`)) {
    failures.push("signature is not the last query parameter");
  }
  const unsigned = search.slice(0, search.lastIndexOf("&signature="));
  const roundTrip = hmacB64(VECTOR.secretKey, unsigned);
  if (roundTrip !== built.signature) {
    failures.push("round-trip signature mismatch");
  }

  if (failures.length > 0) {
    console.error("self-test failed:");
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }
  console.log("self-test passed.");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(help());
    return;
  }
  if (args.selfTest) {
    selfTest();
    return;
  }

  const secretKey = process.env.MOONPAY_SECRET_KEY;
  const apiKey = args.apiKey || process.env.MOONPAY_PUBLISHABLE_KEY;
  if (!secretKey) {
    throw new Error("Set MOONPAY_SECRET_KEY (never pass the secret on the CLI)");
  }
  if (secretKey.startsWith("pk_")) {
    throw new Error("MOONPAY_SECRET_KEY must be sk_test_ / sk_live_, not the publishable key");
  }
  if (!args.sandbox && !secretKey.startsWith("sk_live_")) {
    console.error("warning: --live with a non-sk_live_ secret; widget will reject the signature");
  }
  if (args.sandbox && secretKey.startsWith("sk_live_")) {
    console.error("warning: --sandbox with an sk_live_ secret; use sk_test_ against buy-sandbox.moonpay.com");
  }

  let customerIp = null;
  let privateRelay = false;

  if (args.omitIp) {
    customerIp = null;
  } else if (args.appIp && args.safariIp) {
    const app = canonicalizeIp(args.appIp);
    const safari = canonicalizeIp(args.safariIp);
    if (app === safari) {
      customerIp = app;
    } else {
      privateRelay = true;
      customerIp = null;
      console.error(
        "Private Relay detected (app IP != Safari IP). Omitting allowedIpAddress; signature still applied."
      );
    }
  } else {
    customerIp = pickClientIp(args);
    if (!customerIp && (args.ip || args.trueClientIp || args.xForwardedFor)) {
      throw new Error("No public client IP found. Do not hash a server or RFC1918 address.");
    }
  }

  if (!customerIp && !args.omitIp && !privateRelay) {
    throw new Error("Pass --ip / --true-client-ip / --xff, or --omit-ip for Private Relay sessions");
  }

  const result = buildSignedWidgetUrl({
    secretKey,
    apiKey,
    walletAddress: args.walletAddress,
    currencyCode: args.currencyCode,
    extraParams: args.extraParams,
    customerIp,
    sandbox: args.sandbox,
    baseUrl: args.baseUrl,
  });

  if (args.json) {
    process.stdout.write(
      `${JSON.stringify(
        {
          url: result.url,
          ipMatching: result.ipMatching,
          canonicalIp: result.canonicalIp,
          privateRelay,
        },
        null,
        2
      )}\n`
    );
    return;
  }
  process.stdout.write(`${result.url}\n`);
}

const isDirect =
  Boolean(process.argv[1]) &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirect) {
  try {
    main();
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}
