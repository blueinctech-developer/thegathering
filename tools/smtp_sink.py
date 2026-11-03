"""Minimal local SMTP server for testing. Saves every message it receives as an .eml file.
Usage: python -I tools/smtp_sink.py <port> <output_dir> [--fail]
--fail makes it reject every message (to test failed-email handling).
"""
import asyncio, os, sys, time

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 2525
OUT = sys.argv[2] if len(sys.argv) > 2 else "mail_out"
FAIL = "--fail" in sys.argv
os.makedirs(OUT, exist_ok=True)
counter = 0


async def handle(reader, writer):
    global counter
    def send(line):
        writer.write((line + "\r\n").encode())
    send("220 localhost test SMTP")
    await writer.drain()
    rcpt, data_mode, buf = [], False, []
    while True:
        raw = await reader.readline()
        if not raw:
            break
        line = raw.decode("utf-8", "replace").rstrip("\r\n")
        if data_mode:
            if line == ".":
                data_mode = False
                counter += 1
                name = os.path.join(OUT, f"{int(time.time()*1000)}-{counter}.eml")
                with open(name, "w", encoding="utf-8") as f:
                    f.write("X-Rcpt: " + ",".join(rcpt) + "\n" + "\n".join(buf))
                buf, rcpt = [], []
                send("250 OK queued")
            else:
                buf.append(line[1:] if line.startswith("..") else line)
            await writer.drain()
            continue
        cmd = line[:4].upper()
        if cmd in ("EHLO", "HELO"):
            send("250-localhost")
            send("250 8BITMIME")
        elif cmd == "MAIL":
            send("550 rejected for testing" if FAIL else "250 OK")
        elif cmd == "RCPT":
            rcpt.append(line[8:].strip("<> "))
            send("250 OK")
        elif cmd == "DATA":
            data_mode = True
            send("354 End data with <CR><LF>.<CR><LF>")
        elif cmd == "QUIT":
            send("221 Bye")
            await writer.drain()
            break
        else:
            send("250 OK")
        await writer.drain()
    writer.close()


async def main():
    server = await asyncio.start_server(handle, "127.0.0.1", PORT)
    print(f"SMTP sink on 127.0.0.1:{PORT} -> {OUT} {'(FAIL MODE)' if FAIL else ''}", flush=True)
    async with server:
        await server.serve_forever()

asyncio.run(main())
