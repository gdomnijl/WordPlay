# WordPlay Visualization
An Hoang, Minh N Tran, Jinlin He, Jun Taek Lee

Charlie Curtsinger, PhD

This visualization is featured on the website of Data Analysis and Social Inquiry Lab, Grinnell College, at http://dasil.grinnell.edu/visualizations/VisualizationCS395/WordPlay2/WordPlay/mock/index.html

We built this visualization as the final project of CSC ST395 Data Visualization class. We applied a natural language processing model (Word2vec) on wikipedia corpus (as of March 20th 2017) which computes a similarity score between any two words in the vocabularies.

This force graph translates the numerics between any two words into a network to better visualize the relationship amongst multiple words. While each node represents a word, each word connects to other words which share the most similar context. Several filter options are avaible to customize the visualization. For the purpose of this demo, we used 10 pre-generated word list. The actual model allows users to search for any word that appears in Wikipedia corpus. 

We would like to thank the instructor of the course Professor Charlie Curtsinger and the classmates for their support and feedback. We would also like to thank DASIL for displaying our work. If you have questions or suggestions, please reach out to us!

An Hoang (hoangan@grinnell.edu)
Minh N Tran (tranminh@grinnell.edu)
Jinlin He (hejinlin@grinnell.edu)
Jun Taek Lee (leejunta@grinnell.edu)

Citation: 
1. Wikipedia Downloads at https://dumps.wikimedia.org/ 
2. gensim package at https://radimrehurek.com/gensim/index.html
3. Force graph https://bl.ocks.org/mbostock/4062045
