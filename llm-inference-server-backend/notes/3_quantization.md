# Quantization and its Importance to ML and LLMs

### Quantization

The process of breaking a large quantity into a discrete number of small parts is known as quantization.

In the context of ML and computer science in general, quantization refers to reducing the accuracy of a given model whilst still retaining the overall structure of the model (say, reducing a 32 bit field to an 8 bit field, increasing the speed of computation). It can also be a reference to vector quantization (reducing dimensions of weight matrices through k-means clustering and other veector quantization techniques similar to those used in vector databases).

Quantization is **extremely** important. For example, a 175B parameter model requires over 300GB of RAM. This is a bottleneck on many systems.

#### Benefits

- Increased processing speed
- Lower memory requirements
- Allows models to run on different architectures and devices, including embedded systems and single gpu devices

#### Quantization in the Context of LLMs

Some common methods of quantization in LLMs:

- Post-training Quantization (PTQ): Aims to increase speed of inference. Done after training.
- Quantization-aware Training (QAT): Aims to simulate quantization effects during training, performing the reduction of complexity during training.

#### Some Math Concepts

`x_q = x\*S+Z`, where x_q is the quantized weight, x is the original weight, S is the scaling factor (32 bits to 16 bits implies S=2), and Z is the zero point (representation of 0 in quantized state)

**NOTE:** If comverting between different data types, a more complex method of quantization is applied.

#### Techniques:

- Post-training: Quantize after training. Dynamic - compute quantized properties during runtime. Static - compute before runtime.
- QAT: Computes quantized properties at activation layers during training, allowing the model to adjust weights during back-prop. Generally faster and more effective
- Weight: Specifically target weight matrices, significantly reducing memory usage and allowing activations to remain the same.

### Conclusions:

Various techniques can be used to quantize models, increasing performance speeds with (sometimes) negligible decreases in performance accuracy. Much more to this topic, this is an overview.
