# Verification — standalone website v1.0

## Passed

- Chromium browser reads fixtures created by ORIGINAL Java app `ArchiveCodec`: SHDW 1, 2, 3 and 4, including UTF-8 paths/content and a multi-chunk ~3 MiB binary entry. Decrypted ZIP SHA-256 matches exactly.
- Browser creates password SHDW 3 and public normal SHDW 4; the original Java reader authenticates/decodes both and produces the original ZIP bytes exactly.
- Real UI: folder selection → standard ZIP download; protected/normal Shadow create; password prompt only when needed; wrong-password failure has no extracted result; normal restore; verified ZIP export.
- Python's standard ZIP reader validates browser-created and restored ZIP CRCs, nested names and exact file bytes.
- Wrong passwords, modified ciphertext/final tags, missing terminal frame, traversal paths, case-conflicting duplicates, file/folder collisions, symlinks and CRC corruption rejected.
- A REAL 27 MiB random/incompressible payload round-trips ZIP → chunked Shadow → ZIP with matching hash. This is NOT a multi-GB capacity test.
- A small forced-ZIP64 archive round-trips. NOT a >4 GiB ZIP64 test.
- UI cancellation publishes no partial download.
- Browser folder-write flow under MOCK File System Access handles preserves nested paths and cleans up a failed fresh directory. This does NOT verify actual OS picker permissions or filesystem/provider writes.
- GitHub-Pages-style `/project/` subpath loads relative CSS/scripts correctly under a local route simulation.
- 320, 390, 768 and 1280px light/dark layouts have no horizontal overflow; no uncaught page errors or external network requests in tested browser flows.
- SHA-256 content checks confirm all 82 previously existing project files in ShadowVault/, ShadowVaultPrivate/ and ShadowVaultNeon/ are unchanged.

## Not verified

- The site has NOT been pushed or deployed to a real GitHub repository.
- No Android device/emulator, actual mobile storage provider or multi-GB browser test.
- Real desktop folder-picker permissions were not exercised; mock handles only.
- No independent cryptographic/security audit. Normal mode is public; the website contains its compatibility key.

Keep original files/backups. Use localhost/HTTPS and a current browser.
