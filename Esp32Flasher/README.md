# 👑 ESP32 KING · Web Flasher

Flash ESP32 / ESP8266 firmware (`.bin`) **directly from your browser** — no drivers, no installs.

🔗 **Live:** https://esp32king.github.io/

## Features
- ⚡ Web Serial connect (Chrome / Edge / Opera, desktop)
- 🧠 Auto chip detection (chip, MAC, features, crystal)
- 📁 3 default file slots (bootloader / partitions / app) — up to 6
- 🎯 Auto offset guess from file name + ESP32 preset
- 🚀 Program with per-file neon progress bars
- 🗑 Full flash erase · ↻ Hard reset
- 🖥 Colored output terminal (copy / clear / autoscroll)
- ⚙ Settings: baud, compression, erase-all, debug, auto reset
- 💎 Glassmorphism + neon UI

## Default offsets
| File | ESP32 | S3 / C3 / C6 / H2 |
|---|---|---|
| bootloader.bin | `0x1000` | `0x0` |
| partitions.bin | `0x8000` | `0x8000` |
| boot_app0.bin | `0xe000` | `0xe000` |
| firmware.bin | `0x10000` | `0x10000` |
| merged / factory .bin | `0x0` | `0x0` |

## Credits
Flashing engine: [esptool-js](https://github.com/espressif/esptool-js) by Espressif (Apache-2.0), bundled as `esptool.js`.
UI inspired by the idea of browser flashers like ESPWebTool.

Made with ❤️ by **ESP32 KING** (Krishna Rajput, UP61 🇮🇳)
