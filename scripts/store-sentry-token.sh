#!/bin/zsh
set -euo pipefail

printf "Sentry tokenini yapıştır ve Enter'a bas (ekranda görünmez): "
IFS= read -rs token
printf "\n"

if [[ -z "$token" ]]; then
  printf "Token boş; hiçbir değişiklik yapılmadı.\n" >&2
  exit 1
fi

security add-generic-password \
  -U \
  -a "borcama-monitoring" \
  -s "borcama-sentry-token" \
  -w "$token" >/dev/null

unset token
printf "Sentry tokeni macOS Keychain'e güvenle kaydedildi.\n"
