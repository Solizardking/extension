#!/usr/bin/env bash
set -euo pipefail
input=$(cat || true)
file_path=$(FILE_PATH_JSON="$input" node -e '
  try {
    const parsed = JSON.parse(process.env.FILE_PATH_JSON || "{}");
    process.stdout.write(String(parsed.file_path || parsed.path || parsed.file || ""));
  } catch { process.stdout.write(""); }
' 2>/dev/null || true)
if [[ "$file_path" == *.ts || "$file_path" == *.tsx ]] && command -v npx >/dev/null 2>&1; then
  npx --yes prettier --write "$file_path" >/dev/null 2>&1 || true
fi
exit 0
