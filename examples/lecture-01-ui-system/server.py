#!/usr/bin/env python3
"""Навчальний HTTP-сервер; задачі зберігаються у пам'яті."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
import json
import time

ROOT = Path(__file__).resolve().parent
TASKS = [
    {"id": 41, "title": "Підготувати лекцію", "completed": False},
    {"id": 42, "title": "Перевірити лабораторну роботу", "completed": True},
]
NEXT_ID = 43
LOCK = Lock()


class Handler(SimpleHTTPRequestHandler):
    def json_response(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/tasks":
            with LOCK:
                result = [dict(task) for task in TASKS]
            self.json_response(200, result)
            return
        super().do_GET()

    def do_POST(self):
        global NEXT_ID
        if self.path != "/api/tasks":
            self.json_response(404, {"error": "Not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 1 or length > 10_000:
                self.json_response(400, {"error": "Invalid payload size"})
                return
            payload = json.loads(self.rfile.read(length))
            title = payload.get("title")
            if not isinstance(title, str) or not title.strip():
                self.json_response(400, {"error": "Title is required"})
                return
            if title.strip() == "__error__":
                time.sleep(.6)
                self.json_response(503, {"error": "Simulated server failure"})
                return
            time.sleep(.6)
            with LOCK:
                task = {"id": NEXT_ID, "title": title.strip(), "completed": False}
                if isinstance(payload.get("priority"), str):
                    task["priority"] = payload["priority"][:30]
                NEXT_ID += 1
                TASKS.append(task)
            self.json_response(201, task)
        except (ValueError, TypeError, AttributeError):
            self.json_response(400, {"error": "Malformed JSON"})


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8000), partial(Handler, directory=str(ROOT)))
    print("TaskApp: http://localhost:8000", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
