#!/usr/bin/env python3
"""Set the app lock password:  python3 tools/set_password.py 'newpassword'

Updates the SHA-256 (primary, used on secure contexts) and FNV-1a (fallback, used
where crypto.subtle is unavailable) constants inside tools/build_dashboard.py,
then you rebuild:  python3 tools/build_dashboard.py
"""
import hashlib
import re
import sys

def fnv1a(s: str) -> str:
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return f"{h:08x}"

def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    pw = sys.argv[1]
    sha = hashlib.sha256(pw.encode()).hexdigest()
    fnv = fnv1a(pw)
    path = __file__.replace("set_password.py", "build_dashboard.py")
    s = open(path, encoding="utf-8").read()
    s = re.sub(r'LOCK_SHA = "[0-9a-f]+"', f'LOCK_SHA = "{sha}"', s)
    s = re.sub(r'LOCK_FNV = "[0-9a-f]+"', f'LOCK_FNV = "{fnv}"', s)
    open(path, "w", encoding="utf-8").write(s)
    print(f"password updated (sha {sha[:12]}…, fnv {fnv}) — now rebuild the app")

if __name__ == "__main__":
    main()
