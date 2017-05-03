import gensim
import numpy as np
import pandas as pd
import get_csv
model = gensim.models.Word2Vec.load('wiki.en.text.model')
get_csv.wordlayers('red',model,'red.csv',2)
