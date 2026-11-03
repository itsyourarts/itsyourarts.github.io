# ShadowShare

Private browser-to-browser file sharing powered by WebRTC data channels and a small WebSocket signaling service.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4173` in two browser tabs/devices. Choose files in the sender tab, create the share, and give the invite link/code to the recipient. The sender must keep the page open until the transfer finishes.

## How it works

- The Node server serves the app and relays only WebRTC offer/answer/ICE signaling messages.
- File bytes are sent directly between browsers over an encrypted WebRTC data channel; they are not uploaded to this server.
- Google STUN is configured for NAT traversal. Some restrictive networks may still require a TURN relay (not bundled).
- Receiver files are assembled in browser memory before download, so very large transfers depend on available memory and browser limits.
- Room codes expire after six hours; closing the sender tab ends the share.

## Deployment notes

Deploy `server.js` on a public host that supports WebSocket upgrades and HTTPS. Use the same origin for the static app and signaling endpoint (the client connects to the page's current host). The deploy platform should provide TLS; browsers require a secure context for WebRTC outside localhost. For best connectivity across restrictive NATs, configure a TURN service and add its credentials to the `iceServers` list in `index.html`.
