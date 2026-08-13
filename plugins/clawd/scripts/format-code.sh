#!/usr/bin/env bash
set -euo pipefail

input=$(cat || true)
file_path=$(FILE_PATH_JSON="$input" node -e '
  let raw = process.env.FILE_PATH_JSON || "";
  try {
    const parsed = JSON.parse(raw || "{}");
    process.stdout.write(String(parsed.file_path || parsed.path || parsed.file || ""));
  } catch {
    process.stdout.write("");
  }
' 2>/dev/null || true)

if [[ "$file_path" == *.go ]] && command -v gofmt >/dev/null 2>&1; then
  gofmt -w "$file_path" >/dev/null 2>&1 || true
fi

exit 0
