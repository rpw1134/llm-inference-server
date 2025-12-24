# SafeTensors and GGUF File Formats

### SafeTensors

A file format designed to improve security and performance when loading model weights from a downloaded model.

1. Does not execute arbitrary code when downloading
2. Does not store metadata with tensors, allowing decreased memory usage and increased performance
3. Has rich library support to allow for cross compatibility

### GGUF

A file format designed specifically to work efficiently with the llama.cpp library. Works well with quantized models.

1. Is not particularly concerned with security
2. Optimized for quantized models
3. Stores metadata for the quantized model

### File Naming Conventions for GGUF Quantized Models

In the form of `q[num_bits]_[k_quants?]_[modifier]`, where num_bits is the number of bits per parameter in the model, k_quants is an optional parameter to define the "sophistication level" of the model, and modifier defines any modifiers/metadata present about the model.

For example, q5_K_M defines a 5 bit model using k_quants with a medium modifier (medium level of precision/usage).
