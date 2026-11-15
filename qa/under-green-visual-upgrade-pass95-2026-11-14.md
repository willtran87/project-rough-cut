# Pass 95: shoreline varying packing experiment

Packed three shader varyings into one vec4 in a routed candidate only. Native2560x1600 near/crossing/flood frames were PNG-byte-identical and resource counts unchanged. Timing differences are small/mixed, with near-view p95 worse; this does not establish a useful optimization. Candidate not installed. No runtime change. Full visual/performance scope remains open.

{
  "near": {
    "baselineMedian": 19.19999998807907,
    "candidateMedian": 18.899999976158142,
    "baselineP95": 20.80000001192093,
    "candidateP95": 22.399999976158142
  },
  "crossing": {
    "baselineMedian": 20.100000023841858,
    "candidateMedian": 19.600000023841858,
    "baselineP95": 22.5,
    "candidateP95": 21.5
  },
  "flood": {
    "baselineMedian": 15.399999976158142,
    "candidateMedian": 15.299999952316284,
    "baselineP95": 17.299999952316284,
    "candidateP95": 17.30000001192093
  }
}
