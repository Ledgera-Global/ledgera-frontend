#!/usr/bin/env bash
#
# Post-deploy verification for the Ledgera front end.
#
# A deploy is only finished when production is serving the build we think it is.
# A green build in the dashboard does not prove that: an older deployment can
# keep serving traffic after a failed or skipped rollout, and the site looks
# completely healthy while it does. This script asks the running deployment two
# questions that only a correct rollout can answer:
#
#   1. Which commit are you?           (GET /api/health -> deployment.commit)
#   2. Does the password-reset page    (GET /reset-password?token=...)
#      carry the hidden username field?
#
# Question 2 is a per-change contract check. When a deploy introduces a new
# contract test, add it here so the rollout gate grows with the page instead of
# being re-invented by hand each time.
#
# Usage:
#   scripts/verify-deploy.sh [base-url] [expected-commit-sha]
#
#   scripts/verify-deploy.sh                                  # prod, no SHA pin
#   scripts/verify-deploy.sh https://ledgerahq.com abc1234    # prod, pinned
#   scripts/verify-deploy.sh http://localhost:3111            # local build
#
# Exit codes: 0 = verified, 1 = verification failed, 2 = bad usage.
#
set -uo pipefail

BASE_URL="${1:-https://ledgerahq.com}"
EXPECTED_COMMIT="${2:-}"
BASE_URL="${BASE_URL%/}"

failures=0

pass() { printf '  PASS  %s\n' "$1"; }
fail() { printf '  FAIL  %s\n' "$1"; failures=$((failures + 1)); }
info() { printf '        %s\n' "$1"; }

printf '\nLedgera deploy verification\n'
printf '  target : %s\n' "$BASE_URL"
[ -n "$EXPECTED_COMMIT" ] && printf '  expect : %s\n' "$EXPECTED_COMMIT"
printf '\n'

# --- 1. Health and build provenance -----------------------------------------
health_body="$(curl -fsS --max-time 25 "$BASE_URL/api/health" 2>/dev/null)"
health_status=$?

if [ $health_status -ne 0 ] || [ -z "$health_body" ]; then
  fail "/api/health unreachable (curl exit $health_status)"
  info "The deployment is not answering at all: check the Vercel build log."
else
  if printf '%s' "$health_body" | grep -q '"status":"ok"'; then
    pass "/api/health reports ok"
  else
    fail "/api/health did not report status ok"
    info "body: $(printf '%s' "$health_body" | head -c 300)"
  fi

  live_commit="$(printf '%s' "$health_body" | sed -n 's/.*"commit":"\([^"]*\)".*/\1/p')"
  live_short="$(printf '%s' "$health_body" | sed -n 's/.*"commitShort":"\([^"]*\)".*/\1/p')"
  live_env="$(printf '%s' "$health_body" | sed -n 's/.*"environment":"\([^"]*\)".*/\1/p')"

  if [ -n "$live_short" ] && [ "$live_short" != "unknown" ]; then
    pass "deployed commit ${live_short} (${live_env:-unknown env})"
  else
    fail "deployed commit is unreported"
    info "This build predates build provenance in /api/health, so it cannot"
    info "be proven to be the current commit. Redeploy to establish provenance."
  fi

  if [ -n "$EXPECTED_COMMIT" ] && [ -n "$live_commit" ]; then
    case "$live_commit" in
      "$EXPECTED_COMMIT"*)
        pass "deployed commit matches expected ${EXPECTED_COMMIT}" ;;
      *)
        fail "commit mismatch: serving ${live_commit}, expected ${EXPECTED_COMMIT}"
        info "Production is running an older build than the one pushed." ;;
    esac
  fi
fi

# --- 2. Password-reset page contract ----------------------------------------
# The reset form must carry a hidden username field so password managers file
# the new credential under the account instead of creating an orphan entry.
# The field is populated from the token's email claim, so the request must carry
# a decodable token or the page renders its invalid-link state instead.
token_payload="$(printf '%s' '{"email":"deploy-check@example.com","exp":9999999999}' \
  | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')"
check_token="eyJhbGciOiJIUzI1NiJ9.${token_payload}"

reset_html="$(curl -fsS --max-time 25 "$BASE_URL/reset-password?token=${check_token}" 2>/dev/null)"
reset_status=$?

if [ $reset_status -ne 0 ] || [ -z "$reset_html" ]; then
  fail "/reset-password unreachable (curl exit $reset_status)"
else
  if printf '%s' "$reset_html" | grep -qi 'name="username"'; then
    pass "/reset-password carries the hidden username field"
  else
    fail "/reset-password is missing the hidden username field"
    info "Password managers cannot associate the new password with an account."
    info "The deployment is serving a build that predates this fix."
  fi

  if printf '%s' "$reset_html" | grep -qi 'autocomplete="username"'; then
    pass "/reset-password marks the field autocomplete=username"
  else
    fail "/reset-password does not mark the field autocomplete=username"
    info "Without this hint browsers ignore the field even when it is present."
  fi

  # The password inputs must still be there: the fix adds a field, it must not
  # displace the form the user actually fills in.
  if printf '%s' "$reset_html" | grep -qi 'id="password"'; then
    pass "/reset-password still renders the new-password field"
  else
    fail "/reset-password no longer renders the new-password field"
  fi
fi

# --- Summary ----------------------------------------------------------------
printf '\n'
if [ "$failures" -eq 0 ]; then
  printf 'VERIFIED: %s is serving the expected build.\n\n' "$BASE_URL"
  exit 0
fi

printf 'NOT VERIFIED: %d check(s) failed against %s.\n' "$failures" "$BASE_URL"
printf 'See the Vercel deployment log for the commit before treating this as live.\n\n'
exit 1
