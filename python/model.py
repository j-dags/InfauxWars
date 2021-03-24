from tensorflow import keras
from keras_radam import RAdam
from keras_bert import get_custom_objects
from keras.models import load_model
from keras_radam import RAdam
from keras_bert import Tokenizer
import numpy as np
import codecs
import os

# !pip install gast==0.2.2
custom_objects = get_custom_objects()
my_objects = {'RAdam': RAdam}
custom_objects.update(my_objects)
model = load_model('../model/BERT_Binary.h5', custom_objects=custom_objects)


