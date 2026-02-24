`/tmp/loadtest-linux -url ws://127.0.0.1:3000 -rooms 100 -players 4 -rampup 50`

```========================================
  TYPEDASH LOAD TEST
========================================
  Server:   ws://127.0.0.1:3000
  Rooms:    100
  Players:  4/room (400 total connections)
  Typing:   80ms delay (~12 chars/sec)
  Ramp-up:  50ms between rooms
========================================


========================================
  LOAD TEST RESULTS
========================================
  Rooms:              100
  Players/room:       4
  Total connections:  400
  Total duration:     18.961s
  Connect errors:     0
  Message errors:     0
  Dropped messages:   0
----------------------------------------
  Broadcast latency (200180 samples):
    avg:  109µs
    p50:  33µs
    p90:  98µs
    p95:  248µs
    p99:  1.633ms
    max:  13.759ms
  Throughput: 10557 msgs/sec
```
