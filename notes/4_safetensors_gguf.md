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
