"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export type TerminalConnection = { type: "connect" };

export default function VMTerminal({
  socketRef,
  connection,
  jobID
}: {
  socketRef: RefObject<WebSocket | null>;
  connection: TerminalConnection;
  jobID: string
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
    });

    const fit = new FitAddon();
    terminal.loadAddon(fit);
    terminal.open(containerRef.current);
    fit.fit();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    const ws = new WebSocket(
      `${protocol}//${window.location.host}/api/backend/v1/ssh/connect?jobID=${jobID}`,
    );
    socketRef.current = ws;
    let disposed = false;

    function sendResize() {
      fit.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "resize",
            cols: terminal.cols,
            rows: terminal.rows,
          }),
        );
      }
    }

    ws.onopen = () => {
      ws.send(JSON.stringify(connection));
      sendResize();
    };

    // VM output -> terminal
    ws.onmessage = (event) => {
      if (!disposed) terminal.write(event.data);
    };

    ws.onerror = () => {
      if (!disposed) terminal.write("\r\nWeb terminal connection failed.\r\n");
    };

    ws.onclose = () => {
      if (!disposed) terminal.write("\r\nConnection closed.\r\n");
    };

    // Keyboard input -> VM
    const input = terminal.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "input",
            data,
          }),
        );
      }
    });

    const observer = new ResizeObserver(sendResize);
    observer.observe(containerRef.current);

    return () => {
      disposed = true;
      observer.disconnect();
      input.dispose();
      if (socketRef.current === ws) socketRef.current = null;
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Terminal closed");
      } else if (ws.readyState === WebSocket.CONNECTING) {
        ws.onopen = () => {
          ws.close(1000, "Terminal closed");
        };
      }
      terminal.dispose();
    };
  }, [socketRef, connection]);

  return <div ref={containerRef} style={{ height: "500px", width: "100%" }} />;
}
