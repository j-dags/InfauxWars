import pandas as pd

df = pd.read_csv('/content/gdrive/My Drive/train_20210204_cleaned2.csv')
df

#@title Install libraries
!pip install -q keras-bert keras-rectified-adam
!pip install gast==0.2.2

%tensorflow_version 1.x

import os
import contextlib
import tensorflow as tf

USE_TPU = False
os.environ['TF_KERAS'] = '1'

# INSTALL LIBRARIES
# @title Initialize TPU Strategy
if USE_TPU:
  TPU_WORKER = 'grpc://' + os.environ['COLAB_TPU_ADDR']
  resolver = tf.contrib.cluster_resolver.TPUClusterResolver(TPU_WORKER)
  tf.contrib.distribute.initialize_tpu_system(resolver)
  strategy = tf.contrib.distribute.TPUStrategy(resolver)

# SET ENVIRONMENT VARIABLES
import os
import codecs
import numpy as np
from tqdm import tqdm

# Tensorflow Imports
import tensorflow as tf
from tensorflow.python import keras
import tensorflow.keras.backend as K

# Keras-bert imports
from keras_radam import RAdam
from keras_bert import Tokenizer
from keras_bert import get_custom_objects
from keras_bert import load_trained_model_from_checkpoint

os.environ['TF_KERAS'] = '1'

# DOWNLOAD MODELS AND DATA
# @title Download models and data
!wget -q https://storage.googleapis.com/bert_models/2018_10_18/uncased_L-12_H-768_A-12.zip
!unzip -o uncased_L-12_H-768_A-12.zip

# dataset = tf.keras.utils.get_file(
#     fname="20news-18828.tar.gz",
#     origin="http://qwone.com/~jason/20Newsgroups/20news-18828.tar.gz",
#     extract=True,
# )


# PREPARE TRAINING AND TEST DATA
#@title Prepare training and test data

# Bert Model Constants
SEQ_LEN = 256
BATCH_SIZE = 16
EPOCHS = 4
LR = 2e-5

pretrained_path = 'uncased_L-12_H-768_A-12'
config_path = os.path.join(pretrained_path, 'bert_config.json')
checkpoint_path = os.path.join(pretrained_path, 'bert_model.ckpt')
vocab_path = os.path.join(pretrained_path, 'vocab.txt')

token_dict = {}
with codecs.open(vocab_path, 'r', 'utf8') as reader:
    for line in reader:
        token = line.strip()
        token_dict[token] = len(token_dict)

tokenizer = Tokenizer(token_dict)


indices = []
labels = []
labelDict = {
    'fake': 0,
    'satire': 1,
    'reliable': 2,
    'unknown': 3
}
def appendId(text):
    ids, segments = tokenizer.encode(text, max_len=SEQ_LEN)
    indices.append(ids)

def appendLabel(key):
    labels.append(labelDict[key])

df['text'].apply(lambda x: appendId(x))
df['label'].apply(lambda x: appendLabel(x))

df['label']

tagset = [('fake', 0), ('political', 1), ('satire', 2), ('reliable', 3), ('unknown', 4)]
id_to_labels = {id_: label for label, id_ in tagset}

def load_data(tagset, indices = [], labels = []):
    """
    Input:
      path: Root directory where the categorical data sit in folders.
      tagset: List of folder-name, category tuples.
    Output:
      train_x / test_x: List with two items (viz token_input, seg_input)
      test_x / test_y: Output labels corresponding to trainx / train_y.
    """
    global tokenizer
    # indices, labels = [], []
    # for folder, label in tagset:
    #     folder = os.path.join(path, folder)
    #     for name in tqdm(os.listdir(folder)):
    #         with open(os.path.join(folder, name), 'r', encoding="utf-8", errors='ignore') as reader:
    #               text = reader.read()
    #               myText = text
    #         ids, segments = tokenizer.encode(text, max_len=SEQ_LEN)
    #         indices.append(ids)
    #         labels.append(label)

    items = list(zip(indices, labels))
    np.random.shuffle(items)
    indices, labels = zip(*items)
    indices = np.array(indices)
    mod = indices.shape[0] % BATCH_SIZE
    if mod > 0:
        indices, labels = indices[:-mod], labels[:-mod]
    # print(myText)
    return [indices, np.zeros_like(indices)], np.array(labels)


# path = os.path.join(os.path.dirname(dataset), '20news-18828')
# tagset = [(x, i) for i,x in enumerate(os.listdir(path))]
id_to_labels = {id_: label for label, id_ in tagset}

# Load data, split 80-20 for triaing/testing.
all_x, all_y = load_data(tagset, indices, labels)

train_perc = 0.8
total = len(all_y)

n_train = int(train_perc * total)
n_test = (total - n_train)

test_x = [all_x[0][n_train:], all_x[1][n_train:]]
train_x = [all_x[0][:n_train], all_x[1][:n_train]]

train_y, test_y = all_y[:n_train], all_y[n_train:]

print("# Total: %s, # Train: %s, # Test: %s" % (total, n_train, n_test))

all_x

# BUILD CUSTOM MODEL
# @title Build Custom (Fine-Tuned) Model

# Load pretrained model
with strategy.scope() if USE_TPU else contextlib.suppress():
  model = load_trained_model_from_checkpoint(
    config_path,
    checkpoint_path,
    training=True,
    trainable=True,
    seq_len=SEQ_LEN,
  )

  # Add dense layer for classification
  inputs = model.inputs[:2]
  dense = model.get_layer('NSP-Dense').output
  outputs = keras.layers.Dense(units=20, activation='softmax')(dense)
  model = keras.models.Model(inputs, outputs)

  model.compile(
      RAdam(lr=LR),
      loss='sparse_categorical_crossentropy',
      metrics=['sparse_categorical_accuracy'],
  )

print(model.summary())

# INITIALIZE VARIABLES
# @title Initialize Variables

sess = K.get_session()
uninitialized_variables = set([i.decode('ascii') for i in sess.run(tf.report_uninitialized_variables())])
init_op = tf.variables_initializer(
    [v for v in tf.global_variables() if v.name.split(':')[0] in uninitialized_variables]
)
sess.run(init_op)

#TRAIN
# @title Train
history = model.fit(
    train_x,
    train_y,
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    validation_split=0.20,
    shuffle=True,
)
model.save('BERT_FakeNews.h5')

# PLOT MODEL TRAINING PROGRESS
#@title Plot model training progress
#@markdown The model starts over-fitting after 3rd epoch

import matplotlib.pyplot as plt
import numpy
%matplotlib inline

# list all data in history
print(history.history.keys())
# summarize history for accuracy
plt.subplot(1, 2, 1)
plt.plot(history.history['val_sparse_categorical_accuracy'])
plt.plot(history.history['sparse_categorical_accuracy'])
plt.title('model sparse_categorical_accuracy')
plt.ylabel('sparse_categorical_accuracy')
plt.xlabel('epoch')
plt.legend(['train', 'test'], loc='upper left')

plt.subplot(1, 2, 2)
# summarize history for loss
plt.plot(history.history['loss'])
plt.plot(history.history['val_loss'])
plt.title('model loss')
plt.ylabel('loss')
plt.xlabel('epoch')
plt.legend(['train', 'test'], loc='upper left')
plt.show()

###
