# Prompt Caching and Prefix Reuse

### Prompt Caching (as outlined by Anthropic API)

Prompt Caching is a technique used by inference servers to significantly reduce latency and cost on commonly repeated prompts. Below outlines the steps to writing to the cache:

1. Receives a prompt marked for caching
2. Breaks prompt into blocks, as marked for caching
3. Caches this input by hashing block idententifiers with respect to all previous blocks that came before it in the prompt, computing KV cache, and storing in memory

When a user send a prompt:

1. Check where a user set the cache control breakpoint. If no breakpoint, set breakpoint to end of the static prompt.
2. Look backwards at blocks and take hashed representations. Match? Hit and return all blocks that came before it.
3. Miss? Look back to a max of 20 blocks.

Note here, hashes depending on previous blocks ensures that changing any block at time t will result in a miss at time t+n. This is a direct consequence of the attention mechanism.

### Prefix Reuse

As described above, prompt caching essentially searches for the longest cached prefix. Any change to your prompt will result in cache misses after your change.

### Conclusions

An incresibly powerful technique.

Notes: memory intensive. LRU and 5 minute TTl is common. Cache writes are costly, but generally made up for by common cache misses. Anthropic uses cache blocks, but can also cache differently.
