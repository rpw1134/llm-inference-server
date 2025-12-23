# Prefill and Decode Stages of LLM Text Generation

### KV-Caching

A KV-Cache is an in memory sta structure that stores the computed key and value vectors of token vectors at each attention block. This effectively reduces computation by 90%, but requires extra memory (context-window). Further data storage is available, but less common.

### Definitions

**Inference**: The process of generating outputs based on input prompts, broken into prefill and decode stages.
**Prefill Stage**: A first pass on input data. Passes input data through the network, storing intermediate attention values in the KV-Cache to improve performance in the decode stage. Fully leveragees the parallel capabilities of a GPU.
**Decode Stage**: The generation stage. Each newly generated output token is fed back into the decode stage and used for the next prediction **(autoregressive)**. Leverages the KV-Cache generated in the prefill stage. Modifies the KV-Cache to include new data. Underutilizes GPU resources due to sequential nature; thus, it is slower.

### Important Considerations:

- Prefill uses large amounts of compute
- Decode wastes compute and can be further optimized (see batching)
- KV only stores key and value vectors for tokens, not attention vectors. This is a memory optimization.
