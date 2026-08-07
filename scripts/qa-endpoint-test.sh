#!/bin/bash
# QA endpoint test script for palette-vault
set -e

PORT=3042
BASE="http://localhost:$PORT/api"

echo "=== 1. Register user ==="
REG_FILE=$(mktemp)
curl -s -X POST "$BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"username":"qatester","email":"qatester@palettevault.app","password":"TestPass123!"}' > "$REG_FILE"
python3 -m json.tool "$REG_FILE"
TOKEN=$(python3 -c "import json; print(json.load(open('$REG_FILE')).get('token','NO_TOKEN'))")
echo "Token obtained: ${TOKEN:0:20}..."
rm "$REG_FILE"

echo ""
echo "=== 2. Register with same user (expect 409) ==="
curl -s -X POST "$BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{"username":"qatester","email":"qatester@palettevault.app","password":"TestPass123!"}' \
  | python3 -m json.tool

echo ""
echo "=== 3. Login with username ==="
curl -s -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"login":"qatester","password":"TestPass123!"}' \
  | python3 -m json.tool

echo ""
echo "=== 4. Login with email ==="
curl -s -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"login":"qatester@palettevault.app","password":"TestPass123!"}' \
  | python3 -m json.tool

echo ""
echo "=== 5. Get /me with auth ==="
curl -s "$BASE/auth/me" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "=== 6. Get /me without auth (expect 401) ==="
curl -s "$BASE/auth/me" | python3 -m json.tool

echo ""
echo "=== 7. Login with wrong password (expect 401) ==="
curl -s -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"login":"qatester","password":"wrongpassword"}' \
  | python3 -m json.tool

echo ""
echo "=== 8. Test palettes list ==="
curl -s "$BASE/palettes" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Palettes count: {len(d)}')" 2>/dev/null || echo "(may need auth)"

echo ""
echo "=== 9. Test public palettes ==="
curl -s "$BASE/palettes/public" 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Public palettes count: {len(d)}')" 2>/dev/null || echo "NO /palettes/public endpoint"

echo ""
echo "=== 10. Test tags ==="
curl -s "$BASE/tags" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || echo "NO /tags endpoint"

echo ""
echo "=== ALL TESTS COMPLETE ==="
