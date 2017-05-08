import gensim
import numpy as np
import pandas as pd
def wordlayers(wordstr,model):
    assert type(wordstr) is str
    if wordstr not in model.wv.vocab.keys():
        return(-1)
    wordlist = model.most_similar(wordstr)
    words = [wordlist[x][0] for x in range(0,len(wordlist))]
    df = pd.DataFrame(columns=['Source','Target','Similarity'])
    count = 0
    for layer1 in wordlist:
        df.loc[count] = np.array([wordstr,layer1[0],str(layer1[1])])
        count += 1
        wordlist1 = model.most_similar(layer1[0])
        words1 = [wordlist1[x][0] for x in range(0,len(wordlist1))]
        for layer2 in wordlist1:
            if layer2[0] != wordstr:
                df.loc[count] = np.array([layer1[0],layer2[0],str(layer2[1])])
                count += 1
                if (layer2[0] not in words) and (layer2[0] not in [x for x in words1 if x != layer2[0]]):
                    wordlist2 = model.most_similar(layer2[0])
                    for layer3 in wordlist2:
                        if layer3[0] != layer1[0]:
                            df.loc[count] = np.array([layer2[0],layer3[0],str(layer3[1])])
                            count += 1
    return df

def wordfreq(words,model):
    freq = pd.DataFrame(columns=['Word','Count'])
    count = 0
    for word in words:
        if word not in model.wv.vocab:
            continue
        freq.loc[count] = np.array([word,model.wv.vocab[word].count])
        count += 1
    return freq
