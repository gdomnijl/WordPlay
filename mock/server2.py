import BaseHTTPServer
import SimpleHTTPServer
import SocketServer
import pandas
import gensim
import json
import get_csv

word = ""
model = gensim.models.Word2Vec.load('../MODELLLLL/wiki.en.text.model')

# This defines a new class, which the server will use to handle incoming requests
# It extends the SimpleHTTPRequsetHandler, which will load files from the current directory and send them out
class CustomRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  # This function is called on each request.
  def do_GET(self):
    # If the request asks for our model data, we'll handle that specially below.
    # Otherwise, just use SimpleHTTPRequestHandler to serve files as usual.
    if self.path.startswith('/model/'):
      global word
      word = str(self.path[len('/model/'):])
      self.sendModelOutput()
    else:
      #model = gensim.models.Word2Vec.load('/Users/minhntran/Documents/csc395/WordPlay/mock/MODELLLLL/wiki.en.text.model') #initialize model
      #vocabulary = model.wv.vocab #USE THIS FOR DROPDOWN!!!
      SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
      #model = gensim.models.Word2Vec.load('/Users/minhntran/Documents/csc395/WordPlay/mock/MODELLLLL/wiki.en.text.model') #initialize model
      #
      #vocabulary = model.wv.vocab #USE THIS FOR DROPDOWN!!!
  
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

    df = get_csv.wordlayers(word,model) #source, target, similarity as pd data frame
    json = df.to_json(orient='records') #df as a json string
    unique_words = set(df.Source.tolist() + df.Target.tolist()) #list of all unique words in df (source AND target)
    freq = get_csv.wordfreq(unique_words,model).to_json(orient='records') #frequency of all the words in df
    data = "{" + "Relevance: " + json + ", Frequency: " + freq + "}"

    #self.wfile.write(data)
    self.wfile.write(json)

    # Instead of writing a boring message, call your model, produce some text, and write it.
    #self.wfile.write("I am here")

# Start the server with our custom request handler
server = BaseHTTPServer.HTTPServer(('', 8000), CustomRequestHandler)
print 'Started httpserver on port', 8000
server.serve_forever()
