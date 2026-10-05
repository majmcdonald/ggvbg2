#!/usr/bin/env python3
"""Local server for the game. Disables browser caching so every refresh loads the latest code.

Run: python3 serve.py   then open http://localhost:8000
"""
import http.server


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        # Also drop JS files a browser cached before this server was used.
        # Only the HTTP cache: saved progress in localStorage is untouched.
        if self.path in ('/', '/index.html'):
            self.send_header('Clear-Site-Data', '"cache"')
        super().end_headers()


if __name__ == '__main__':
    http.server.test(HandlerClass=NoCacheHandler, port=8000, bind='127.0.0.1')
