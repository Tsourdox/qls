#!/usr/bin/env bun
import net from "net";
import os from "os";
import qrcode from "qrcode-terminal";

function getLanIp(): string {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const netw of nets[name] || []) {
      if (netw.family === "IPv4" && !netw.internal) {
        return netw.address;
      }
    }
  }
  return "127.0.0.1";
}

function waitForPort(port: number, host = "127.0.0.1", timeout = 30_000) {
  return new Promise<boolean>((resolve) => {
    const end = Date.now() + timeout;
    (function check() {
      const socket = net.createConnection({ port, host }, () => {
        socket.destroy();
        resolve(true);
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() < end) setTimeout(check, 300);
        else resolve(false);
      });
    })();
  });
}

const args = process.argv.slice(2);
let port: number | null = null;
let url: string | null = null;
let https = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--port") port = Number(args[++i]);
  else if (args[i] === "--url") url = args[++i];
  else if (args[i] === "--https") https = true;
}

(async () => {
  const ip = getLanIp();

  if (port) {
    await waitForPort(port);
    const proto = https ? "https" : "http";
    url = `${proto}://${ip}:${port}`;
  } else if (url) {
    url = url.replace("localhost", ip).replace("127.0.0.1", ip);
  } else {
    console.error(
      "Usage: bun qr-dev.ts --port 3000  OR  --url http://localhost:3000"
    );
    process.exit(1);
  }

  console.log("Scan this QR with your phone:");
  qrcode.generate(url!, { small: true });
  console.log(url);
})();
