---
name: moonpay
description: Sign MoonPay on-ramp widget URLs with HMAC-SHA256 IP matching (allowedIpAddress). Use when the user mentions MoonPay, buy.moonpay.com, Unverified Connection, signed widget URLs, or the August 7 IP-validation requirement.
---

# MoonPay signed URLs (IP matching)

IP matching is **required** for live on-ramp widgets. Hash the customer's public IP, add `allowedIpAddress`, then sign the full query string. A mismatch shows **Unverified Connection** and the widget does not load.

Official docs: [IP matching](https://dev.moonpay.com/widget/on-ramp/customization/ip-matching) · [URL signing](https://dev.moonpay.com/widget/on-ramp/customization/url-signing)

## When to use

- Generating `buy.moonpay.com` / `buy-sandbox.moonpay.com` widget URLs
- MoonPay notice that IP validation is required to keep service after 7 August
- Debugging `Unverified Connection` / `Invalid signature` / `Missing signature`

## Binding constraints

- Sign **only on the backend**. Never ship `sk_test_` / `sk_live_` to the browser, a WebView, or chat.
- Secret from `MOONPAY_SECRET_KEY`. Publishable key (`pk_test_` / `pk_live_`) is `apiKey` only — it never signs.
- Same environment for both keys: sandbox secret + `buy-sandbox.moonpay.com`, live secret + `buy.moonpay.com`.
- Generate the URL as close as possible to widget open (VPN / cellular / proxy can change the IP).
- Signature is the **last** query parameter. Do not append anything after it.
- Prefer **WKWebView / Android WebView**. `SFSafariViewController` + iCloud Private Relay is a guaranteed IP mismatch.

## Two-step flow

1. Capture the **device** public IP (`True-Client-IP`, else left-most public `X-Forwarded-For`). Not a server or RFC1918 address.
2. Canonicalize, then HMAC-SHA256 with the secret key, base64 → `allowedIpAddress`.
3. URL-encode every query **value**, then HMAC-SHA256 the query string **including the leading `?`**.
4. Append `&signature=` + `encodeURIComponent(signature)`.

IPv6 must be [RFC 5952](https://www.rfc-editor.org/rfc/rfc5952) before hashing: lowercase, no leading zeros in a group, longest all-zero run collapsed to `::`. Example: `2001:0DB8:0000:0000:0000:0000:0000:0001` → `2001:db8::1`. Matching is an **exact hash string compare**, not a semantic IP compare.

## Private Relay

If the widget opens in Safari / `SFSafariViewController`:

- Compare app HTTPS IP vs IP seen from a request inside the Safari view.
- Same → include `allowedIpAddress`. Different → **omit** it (still sign). Do **not** hash the relay egress IP.

WebView traffic is not relayed; include IP matching as usual.

## Helper

```bash
node plugins/clawd/skills/moonpay/scripts/sign-url.mjs --self-test

MOONPAY_SECRET_KEY=sk_test_... node plugins/clawd/skills/moonpay/scripts/sign-url.mjs \
  --sandbox --api-key pk_test_... --wallet <addr> --currency sol \
  --true-client-ip "$CLIENT_IP"
```

`--app-ip` + `--safari-ip` omits `allowedIpAddress` when they differ. `--omit-ip` forces that. `--json` prints metadata without the secret.

## Signing test vector

If this fails, the algorithm is wrong (usually missing `?`, or not URL-encoding the signature):

| Input | Value |
|---|---|
| Secret | `sk_test_DocsVector00` |
| Message | `?apiKey=pk_test_DocsVector00&currencyCode=eth&walletAddress=0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe` |
| Signature | `oIJxSghyzll/BLhUFdQZhkxf7DAS8REFaWr/ibO+K8Q=` |

A result of `z2PF5gVnemAZat6jSnLdgG7MB9SNX1TCrRc2bkHq8DQ=` means the `?` was dropped.

## Go-live

1. Sandbox: matching IP loads; mismatched IP errors.
2. Notify the MoonPay integration contact.
3. MoonPay confirms enforcement on the account before production.

Cheshire `pump-fun` may proxy MoonPay APIs; widget URLs still need this backend signer. Do not treat the proxy as a substitute for signed URLs.
