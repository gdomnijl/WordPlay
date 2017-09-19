# Source: http://stackoverflow.com/questions/18346583/how-do-i-map-incoming-path-requests-when-using-httpserver
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import datetime
import random
import json
import gensim
import get_csv

#model = gensim.models.Word2Vec.load('/Volumes/Seagate Backup Plus Drive/MODELLLLL/wiki.en.text.model') #initialize model
port = 8000

class myHandler(BaseHTTPRequestHandler):
	def do_GET(self):
		if self.path == "/":
			self.do_html()
		elif self.path == "/css":
			self.do_css()
		elif self.path == "/mock_single_word.js":
			self.do_js()
		#elif self.path == "/server":
			#self.do_server()
		elif self.path.startswith("/model/"):
			#from after model/ to the end 
			word = self.path[len('/model/'):]
			#inputval = path[len('/model/'):]
			self.do_model(word)
		elif self.path == "/freq/":
			self.do_freq()

#Serving html file
	def do_html(self):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

		#global model 
		vocabulary = model.wv.vocab #USE THIS FOR DROPDOWN!!!
		code = open('/Users/apple/Desktop/csc395/WordPlay/mock/index.html')
		for line in code:
			self.wfile.write(line)
		code.close()

#Serving css file
	def do_css(self):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

		code = open('lab.css')
		for line in code:
			self.wfile.write(line)
		code.close()
#Serving js file
	def do_js(self):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

		code = open('/Users/apple/Desktop/csc395/WordPlay/mock/mock_single_word.js')
		# for line in code:
		# 	self.wfile.write(line)
		# code.close()
	#Serving the server file
	def do_server(self):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

	  
		
		code = open('wpserver.py')
		for line in code:
			self.wfile.write(line)
		code.close()
#Serving model
	def do_model(self,inputval):
		self.send_response(200)
		self.send_header('Content-type', 'text/html')
		self.end_headers()

		#JT

		df = get_csv.wordlayers(inputval,model) #source, target, similarity as pd data frame
		json = df.to_json(orient='records') #df as a json string
		unique_words = set(df.Source.tolist() + df.Target.tolist()) #list of all unique words in df (source AND target)
		freq = get_csv.wordfreq(unique_words,model).to_json(orient='records') #frequency of all the words in df
		data = "{" + "Relevance: " + json + ", Frequency: " + freq + "}"

		self.wfile.write(data)




server = HTTPServer(('', port), myHandler)
print 'Started httpserver on port', port

# Wait forever for incoming http requests
server.serve_forever()