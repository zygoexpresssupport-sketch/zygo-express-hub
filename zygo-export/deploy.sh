#!/usr/bin/env bash
# Zygo Express — one-shot deploy to external Supabase project
# Usage:  bash deploy.sh
# Requires: supabase CLI installed and logged in (`supabase login`)

set -euo pipefail

PROJECT_REF="hdskkfdtosgfznjscemz"
FUNCTIONS=(submit-quote paystack-init paystack-webhook calculate-delivery-cost osrm-route)

echo "==> Linking to project $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo
echo "==> Step 1/3: Run the SQL schema"
echo "    Open: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "    Paste the contents of zygo-export/01_schema.sql and click Run."
read -rp "Press ENTER once the SQL has run successfully..."

echo
echo "==> Step 2/3: Setting edge function secrets"
prompt_secret() {
  local name=$1
  local val
  read -rsp "Enter value for $name (input hidden, leave blank to skip): " val
  echo
  if [[ -n "$val" ]]; then
    supabase secrets set "$name=$val" --project-ref "$PROJECT_REF"
  else
    echo "  -> skipped $name"
  fi
}

for s in PAYSTACK_SECRET_KEY TELEGRAM_API_KEY TELEGRAM_ADMIN_CHAT_ID \
         TWILIO_API_KEY TWILIO_FROM_NUMBER TWILIO_ADMIN_NUMBER; do
  prompt_secret "$s"
done

echo
echo "==> Step 3/3: Deploying ${#FUNCTIONS[@]} edge functions (no JWT verification)"
for fn in "${FUNCTIONS[@]}"; do
  echo "  - deploying $fn"
  supabase functions deploy "$fn" --project-ref "$PROJECT_REF" --no-verify-jwt
done

echo
echo "✅ Done."
echo "Next: sign up at your app's /auth page, then in SQL Editor run:"
echo "     select public.claim_first_admin();"
echo
echo "Paystack webhook URL (paste into Paystack dashboard):"
echo "  https://$PROJECT_REF.supabase.co/functions/v1/paystack-webhook"
