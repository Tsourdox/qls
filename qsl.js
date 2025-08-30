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
  .name("qsl")
  .description(
    "QR Server Link - Generate a QR code for accessing your local dev server from another device on your LAN."
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

    console.log("Scan this QR with your phone:");
    qrcode.generate(url, { small: true });
    console.log(url);
  });

program.parseAsync(process.argv);
