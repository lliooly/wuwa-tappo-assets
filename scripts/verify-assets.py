#!/usr/bin/env python3
"""Verify archived file hashes, catalog paths and name aliases using stdlib only."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "data/files.json").read_text(encoding="utf-8"))
expected = {item["path"]: item for item in manifest["files"]}
for rel, item in expected.items():
    path = root / rel
    if path.is_symlink() or not path.is_file():
        raise SystemExit(f"Missing or symbolic link: {rel}")
    data = path.read_bytes()
    if len(data) != item["size"] or hashlib.sha256(data).hexdigest() != item["sha256"]:
        raise SystemExit(f"Content mismatch: {rel}")
catalog = json.loads((root / "data/catalog.json").read_text(encoding="utf-8"))
if len(catalog["items"]) != catalog["itemCount"]:
    raise SystemExit("Catalog item count mismatch")
for item in catalog["items"]:
    for part in item["files"].values():
        if part["path"] not in expected or expected[part["path"]]["sha256"] != part["sha256"]:
            raise SystemExit(f"Catalog path/hash mismatch: {part['path']}")
aliases = json.loads((root / "data/aliases.json").read_text(encoding="utf-8"))
if len(aliases["aliases"]) != aliases["aliasCount"]:
    raise SystemExit("Alias count mismatch")
for name, target in aliases["aliases"].items():
    if target not in expected:
        raise SystemExit(f"Alias target missing: {name} -> {target}")
print(f"Verified {len(expected)} files, {len(catalog['items'])} catalog items and {len(aliases['aliases'])} aliases")
