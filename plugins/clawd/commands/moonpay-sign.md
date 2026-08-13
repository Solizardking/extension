---
name: moonpay-sign
description: Generate a MoonPay on-ramp widget URL with HMAC-SHA256 IP matching and query-string signature.
---

# MoonPay sign

1. Confirm `MOONPAY_SECRET_KEY` is in the environment (`sk_test_` for sandbox). Do not print it.
2. Capture the **device** public IP (`True-Client-IP` or left-most public `X-Forwarded-For`). Canonicalize IPv6 to RFC 5952.
3. Run the helper (sandbox first):

```bash
node plugins/clawd/skills/moonpay/scripts/sign-url.mjs --self-test

MOONPAY_SECRET_KEY="$MOONPAY_SECRET_KEY" node plugins/clawd/skills/moonpay/scripts/sign-url.mjs \
  --sandbox --json \
  --api-key "$MOONPAY_PUBLISHABLE_KEY" \
  --wallet "$WALLET" \
  --currency sol \
  --true-client-ip "$CLIENT_IP"
```

4. If the widget opens in `SFSafariViewController`, pass `--app-ip` and `--safari-ip`. On mismatch, the script omits `allowedIpAddress` (Private Relay). Prefer a WebView instead.
5. Return only the signed URL. Signature is last. Do not append query params after signing.
6. Matching IP → widget loads. Hash mismatch → **Unverified Connection**. Invalid HMAC → `Invalid signature`.
