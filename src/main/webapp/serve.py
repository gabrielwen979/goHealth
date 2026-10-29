#!/usr/bin/env python3
import http.server
import socketserver
import os

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

os.chdir(os.path.dirname(__file__))
PORT = 8765

with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"✓ Serving at http://localhost:{PORT}")
    print(f"✓ Cache headers disabled")
    httpd.serve_forever()
