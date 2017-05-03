import gensim
import numpy as np
import pandas as pd
def wordlayers(wordstr,model,filename,layer):
    assert type(wordstr) is str
    assert type(filename) is str
    if wordstr not in model.wv.vocab:
        return(-1)
    con = open(filename,'w')
    wordlist = model.most_similar(wordstr)
    df = pd.DataFrame(columns=['Source','Target','Similarity'])
    count = 0
    for layer1 in wordlist:
        df.loc[count] = np.array([wordstr,layer1[0].encode('utf-8'),str(layer1[1])])
        count += 1
        wordlist1 = model.most_similar(layer1[0])
        for layer2 in wordlist1:
            if layer2[0] != wordstr:
                df.loc[count] = np.array([layer1[0].encode('utf-8'),layer2[0].encode('utf-8'),str(layer2[1])])
                count += 1
                wordlist2 = model.most_similar(layer2[0])
                if layer == 3:
                    for layer3 in wordlist2:
                        if layer3[0] not in wordlist1:
                            df.loc[count] = np.array([layer2[0].encode('utf-8'),layer3[0].encode('utf-8'),str(layer3[1])])
                            count += 1
    df.to_json(filename,orient='records')

def wordfreq(words,model):
    freq = {}
    for word in words:
        if word not in model.wv.vocab:
            continue
        freq[word] = model.wv.vocab[word].count
    return freq

