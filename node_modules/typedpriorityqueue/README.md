# TypedPriorityQueue : a fast heap-based priority queue in TypeScript

In a priority queue, you can...

- query or remove (poll) the smallest element quickly
- insert elements quickly

In practice, "quickly" often means in logarithmic time (O(log n)).

A heap can be used to implement a priority queue.

TypedPriorityQueue is an attempt to implement a performance-oriented priority queue
in TypeScript. It can be several times faster than other similar libraries.
It is ideal when performance matters.

License: Apache License 2.0

Usage
===

```typescript
const x = new TypedPriorityQueue<number>();
x.add(1);
x.add(0);
x.add(5);
x.add(4);
x.add(3);
x.peek(); // should return 0, leaves x unchanged
x.size; // should return 5, leaves x unchanged
while(!x.isEmpty()) {
  console.log(x.poll());
} // will print 0 1 3 4 5
x.trim(); // (optional) optimizes memory usage
```

You can also provide the constructor with a comparator function.


```typescript
const x = new TypedPriorityQueue<number>(function(a,b) {return a > b});
x.add(1);
x.add(0);
x.add(5);
x.add(4);
x.add(3);
while(!x.isEmpty()) {
  console.log(x.poll());
} // will print 5 4 3 1 0 
```

If you are using node.js, you need to import the module:

```typescript
import {TypedPriorityQueue} from 'typedpriorityqueue';
const b = new TypedPriorityQueue();// initially empty
b.add(1);// add the value "1"
```

The ``replaceTop`` function allows you to add and poll in one integrated operation, which is useful fast top-k queries. See [Top speed for top-k queries](http://lemire.me/blog/2017/06/21/top-speed-for-top-k-queries/).

npm install
===

      $ npm install typedpriorityqueue

Computational complexity
===

The function calls "add" and "poll" have logarithmic complexity with respect
to the size of the data structure (attribute size). Looking at the top value
is a constant time operation.



Testing
===

Using node.js (npm), you can test the code as follows...

      $ npm install mocha
      $ npm test

Is it faster?
===

It tends to fare well against the competition.
In some tests, it can be five times faster than any other 
JavaScript implementation we could find.

```
$ node test.js
Platform: darwin 17.4.0 x64
Intel(R) Core(TM) i7-4770HQ CPU @ 2.20GHz
Node version 8.5.0, v8 version 6.0.287.53

Comparing against:
js-priority-queue: https://github.com/adamhooper/js-priority-queue 0.1.5
stablepriorityqueue: https://github.com/lemire/StablePriorityQueue.js 0.1.0
heap.js: https://github.com/qiao/heap.js 0.2.6
binaryheapx: https://github.com/xudafeng/BinaryHeap 0.1.1
priority_queue: https://github.com/agnat/js_priority_queue 0.1.3
js-heap: https://github.com/thauburger/js-heap 0.3.1
queue-priority: https://github.com/augustohp/Priority-Queue-NodeJS 1.0.0
priorityqueuejs: https://github.com/janogonzalez/priorityqueuejs 1.0.0
qheap: https://github.com/andrasq/node-qheap 1.4.0
yabh: https://github.com/jmdobry/yabh 1.2.0

starting dynamic queue/enqueue benchmark
TypedPriorityQueue x 27,029 ops/sec ±1.47% (83 runs sampled)
TypedPriorityQueue---replaceTop x 81,952 ops/sec ±2.18% (84 runs sampled)
sort x 6,835 ops/sec ±1.62% (85 runs sampled)
StablePriorityQueue x 2,414 ops/sec ±0.98% (85 runs sampled)
js-priority-queue x 4,096 ops/sec ±0.95% (88 runs sampled)
heap.js x 5,757 ops/sec ±0.80% (89 runs sampled)
binaryheapx x 3,186 ops/sec ±1.13% (85 runs sampled)
priority_queue x 2,555 ops/sec ±2.64% (82 runs sampled)
js-heap x 431 ops/sec ±1.24% (84 runs sampled)
queue-priority x 293 ops/sec ±4.03% (74 runs sampled)
priorityqueuejs x 6,191 ops/sec ±1.46% (86 runs sampled)
qheap x 23,370 ops/sec ±1.00% (86 runs sampled)
yabh x 3,653 ops/sec ±0.96% (88 runs sampled)

starting dynamic queue/enqueue benchmark
TypedPriorityQueue x 2,394 ops/sec ±1.59% (85 runs sampled)
TypedPriorityQueue---replaceTop x 9,449 ops/sec ±1.21% (86 runs sampled)
sort x 616 ops/sec ±0.93% (84 runs sampled)
StablePriorityQueue x 217 ops/sec ±1.84% (77 runs sampled)
js-priority-queue x 410 ops/sec ±1.04% (85 runs sampled)
heap.js x 461 ops/sec ±1.39% (81 runs sampled)
binaryheapx x 323 ops/sec ±1.25% (84 runs sampled)
priority_queue x 279 ops/sec ±1.16% (84 runs sampled)
js-heap x 41.28 ops/sec ±1.50% (53 runs sampled)
queue-priority x 31.40 ops/sec ±1.20% (55 runs sampled)
priorityqueuejs x 536 ops/sec ±1.13% (83 runs sampled)
qheap x 2,130 ops/sec ±1.15% (86 runs sampled)
yabh x 356 ops/sec ±1.63% (80 runs sampled)
```

Note that ``qheap`` has been updated following the introduction of ``TypedPriorityQueue``, with a reference to ``TypedPriorityQueue`` which might explains the fact that its performance is comparable to ``TypedPriorityQueue``.

Insertion order
===

A binary heap does not keep track of the insertion order. 

You might also like...
===

If you like this library, you might also like
- https://github.com/lemire/FastBitSet.js
- https://github.com/lemire/StablePriorityQueue.js
- https://github.com/lemire/FastIntegerCompression.js
