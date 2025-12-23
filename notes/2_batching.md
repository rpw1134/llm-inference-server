# Batching to Improve Performance (but possibly increase latency)

### Batching

#### Intro and Pros

Batching is the process of grouping multiple user requests into a singular request. In the context of LLMs, this allows us to take advantage of the parallel nature of GPUs reduce the impact of the decoding bottleneck described in notes 1.

#### Cons

Batching has the critical drawback that the batch only completes when the longest individual request completes (ie: the batch waits for everyone to finish before returning any results). This leads to a sub-logarithmic growth in throughput for each increase in batch size, on average.

Batching significantly increases the GPU memory usages (mutliple KV Caches that grow quikcly with decodes). If this isn't a bottleneck, prefills can.

### Batching Methods

- Naive: Process all prefills, then all decodes. Once every request finishes, return the batch.

* Seperate Batching: Prefills batch, then decodes batch.
* Bin Based Batching: Predict output lengths and batch similar length requests together.
* Continuous Batching: When a new request arrives, add it to an existing batch. As soon as a request is done, remove it from the batch to make new room. Significantly better than all other methods.
