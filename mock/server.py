# Source: http://stackoverflow.com/questions/18346583/how-do-i-map-incoming-path-requests-when-using-httpserver

from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import datetime
import random
import json

port = 8000

class myHandler(BaseHTTPRequestHandler):

  # This code is called whenever the browser requests a file
  def do_GET(self):
    if self.path == '/A':
      self.do_A()
    elif self.path == '/B':
      self.do_B()
    elif self.path == '/code':
      self.do_code()

  # This function responds with a random number to the browser, followed by a python object converted to JSON
  def do_A(self):
    self.send_response(200)
    self.send_header('Content-type','text/html')
    self.end_headers()
    # Send the html message
    
    self.wfile.write('Here\'s a random number: ' + str(random.random()))
    
    somedata = [(1, 2), (3, 4)]
    json.dump(somedata, self.wfile)
    
  # This function just responds with some text
  def do_B(self):
    self.send_response(200)
    self.send_header('Content-type','text/html')
    self.end_headers()
    # Send the html message
    self.wfile.write('This is the B path')
  
  # This function responds with the contents of a file (this file, in fact)
  # You'll need to do this to serve your html, css, and js files
  def do_code(self):
    self.send_response(200)
    self.send_header('Content-type','text/html')
    self.end_headers()
    
    code = open('server.py')
    for line in code:
      self.wfile.write(line)
    code.close()

server = HTTPServer(('', port), myHandler)
print 'Started httpserver on port', port

# Wait forever for incoming http requests
server.serve_forever()