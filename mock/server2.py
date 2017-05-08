import BaseHTTPServer
import SimpleHTTPServer
import SocketServer

# This defines a new class, which the server will use to handle incoming requests
# It extends the SimpleHTTPRequsetHandler, which will load files from the current directory and send them out
class CustomRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  # This function is called on each request.
  def do_GET(self):
    # If the request asks for our model data, we'll handle that specially below.
    # Otherwise, just use SimpleHTTPRequestHandler to serve files as usual.
    if self.path.startswith('/model/'):
      self.sendModelOutput()
    else:
      SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
  
  # This is overriding a method in SimpleHTTPRequestHandler to add a couple options
  # that tell the browser not to cache the page.
  def end_headers(self):
    self.send_header('Pragma', 'no-cache')
    self.send_header('Cache-Control', 'no-cache')
    self.send_header('Expires', 0)
    SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)
  
  # This is the function that should send model output
  def sendModelOutput(self):
    self.send_response(200)
    self.send_header('Content-type', 'text/json')
    self.end_headers()
    
    # Instead of writing a boring message, call your model, produce some text, and write it.
    self.wfile.write("I am here")

# Start the server with our custom request handler
server = BaseHTTPServer.HTTPServer(('', 8080), CustomRequestHandler)
server.serve_forever()
