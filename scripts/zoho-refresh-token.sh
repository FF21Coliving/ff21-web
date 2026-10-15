#!/bin/zsh
# Swaps a Zoho Self Client code for a refresh token (FF21 website leads).
# Reads the client secret and the code from the clipboard (copy, then press
# Enter), and puts the refresh token on the clipboard for Vercel. Nothing is
# saved to disk or sent anywhere except accounts.zoho.in.

CLIENT_ID="1000.FT68CC70IU35SUZU7P46AXCSSFQ5AR"

echo ""
echo "STEP 1  In Zoho API Console > your Self Client > Client Secret tab, COPY the Client Secret."
printf "        Then press Enter here... "
read -r _
SECRET=$(pbpaste | tr -d '[:space:]')
echo "        Got a secret ${#SECRET} characters long."

echo ""
echo "STEP 2  Generate Code tab: paste this scope (one line):"
echo "        ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.leads.UPDATE,ZohoCRM.modules.leads.READ,ZohoCRM.modules.contacts.READ,ZohoCRM.modules.deals.READ,ZohoCRM.coql.READ"
echo "        Time 10 minutes, Create, then COPY the code."
printf "        Then press Enter here... "
read -r _
CODE=$(pbpaste | tr -d '[:space:]')
# A code always looks like 1000.<32 hex>.<32 hex>; put back a dropped leading 1.
if [[ "$CODE" == 000.* ]]; then CODE="1$CODE"; echo "        (added the missing 1 at the start)"; fi
if [[ ! "$CODE" =~ '^1000\.[0-9a-f]{32}\.[0-9a-f]{32}$' ]]; then
  echo "        That doesn't look like a Zoho code (${#CODE} characters, starts ${CODE[1,6]})."
  echo "        Copy the whole code from Generate Code and run:  zsh ff21-web/scripts/zoho-refresh-token.sh"
  exit 1
fi
echo "        Got a code: ${CODE[1,9]}... (${#CODE} characters, looks right)"

REPLY=$(curl -s -X POST "https://accounts.zoho.in/oauth/v2/token" \
  -d "grant_type=authorization_code" \
  --data-urlencode "client_id=$CLIENT_ID" \
  --data-urlencode "client_secret=$SECRET" \
  --data-urlencode "code=$CODE")
unset SECRET CODE

TOKEN=$(printf '%s' "$REPLY" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("refresh_token",""))' 2>/dev/null)
echo ""
if [ -n "$TOKEN" ]; then
  printf '%s' "$TOKEN" | pbcopy
  echo "DONE   The refresh token is now on your clipboard."
  echo "       In Vercel > ff21-web > Settings > Environment Variables, edit ZOHO_REFRESH_TOKEN, paste, save."
else
  ERR=$(printf '%s' "$REPLY" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("error","unknown"))' 2>/dev/null)
  echo "Zoho said: ${ERR:-no reply}"
  echo "invalid_code   = the code expired or was already used: make a new one, run this again."
  echo "invalid_client = the secret doesn't match: copy it again from the Client Secret tab."
  echo "Run again with:  zsh ff21-web/scripts/zoho-refresh-token.sh"
fi
