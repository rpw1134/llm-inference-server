# Attention and the Transformer Architecture

### Understanding Neural Networks versus Recurrent Neural Networks (RNN)

A standard neural network is _feed-forward_; this means each input only moves forward:
`input->layer1->layer2->...->layern-->output`
An RNN feeds inputs back into the network to preserve some sort of history. Each output of a layer is added as a weighted sum to the previous _history_state_ of the next layer. This becomes the new history state, and is used to compute the next output:
`input+prev_state0 -> layer1 => output1, output1+prev_state1 -> layer2 => output2...`

**An LLM is NOT a recurrent network. It is an _autoregressive_ model (computes new tokens one at a time) that functions based on the transformer architecture**

### Understanding the Problem

A RNN sounds great for prediction of language, but suffers when considering the sequential nature of computation. Each state depends on the last, making parallelization difficult. Transformers seek to solve this by the self-attention mechanism, allowing tokens at time step t_n to influence tokens at t_n+k for an arbitrary k, given proper parameters.

## Attention

### Encoder-decoder architecture

The transformer architecture is an encoder-decoder architecture

1. Given some input, encode the input into a vector V of reals
2. Given V, predict some output token T
3. Feed T, along with previous input, back to step 1.
4. Repeat

More specifically:

1. An encoder step takes your initial input ONCE, using attention and feed forward layers to create an initial context-rich set of vectors.
2. This set of vectors is then passed to the decoder, where a similar process occurs, using preciously computed input to attend to previously computed outputs.

### The attention mechanism

Each attention layer described above follows the following steps:

1. For each input vector into the attention layer, compute its Key and Query vectors with respect to the predefined (trained) key and query matrices K and Q for the given attention layer
2. For all vectors v and w in the layer, compute v_k dot w_q. This represents the "amount k influences w".
3. Optionally mask the outputs
4. Normalize each output
5. Compute a softmax distribution for each query vector (ie column wise softmax)
6. For each query vector v, set v=v+(w_i\*x_i + ...) where w_i is the influence score between vector i and vector v, and x_i is the value of vector i (computed same way as key query)

After all heads of attention complete, take vector v from each head and concatenate them together. Apply a linear tranformation W_O to this vector to "normalize" it.

**NOTE: the key, value, query space is dim_input/num_attention_heads to allow for concatenation later on**

### Feed-forward layer:

Between each layer of attention sits a feed forward layer. This layer serves as a normal NN (as described above) and applies a ReLU based function to each position in the attention output. In other words, if the input is of size n (n vectors), we pass each of n vectors, in parallel, into the exact same NN.

**NOTE: weights differ by layer. BUT, all weights of a given layer (across positions) are the same**

### Positional Encodings:

A small note. In RNN, the nature of the network allows it to learn positions via time series. In a transformer, work is done in parallel. To account for this and allow the model to learn positional encodings, we use a specfic positional encoding matrix when embedding inputs.
