#!/usr/bin/env node
const net = require("net");
const os = require("os");
const qrcode = require("qrcode-terminal");
const { Command } = require("commander");

function getLanIp() {
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

function waitForPort(port, host = "127.0.0.1", timeout = 30_000) {
  return new Promise((resolve) => {
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

const program = new Command();

program
  .name("qls")
  .description(
    "QR Link Server - Generate a QR code to open your local dev server on another device on your LAN."
  )
  .argument("<port>", "Local dev server port to wait for and expose")
  .action(async (portArg) => {
    const ip = getLanIp();
    const port = Number(portArg);
    if (!Number.isFinite(port) || port <= 0) {
      console.error("Error: <port> must be a positive number.");
      process.exit(1);
    }

    await waitForPort(port);
    const url = `http://${ip}:${port}`;

    console.log("\n", url);
    qrcode.generate(url, { small: true });
  });

program.parseAsync(process.argv);
