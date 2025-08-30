# qsl

Generate a QR code to open your local dev server from another device on your LAN.

## Usage

Run directly with npx (no install required):

```bash
npx qsl 3000
```

Or link locally while developing:

```bash
npm link
qsl 3000
```

qsl waits until the given port is reachable on localhost, rewrites it to your LAN IP, prints a QR, and echoes the URL.
