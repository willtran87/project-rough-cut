// Joe navigation grid neighbour offsets and the binary heap used by its path search.
export const JOE_NAVIGATION_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

export const JOE_NAVIGATION_REVERSE_OFFSET =
  [7, 6, 5, 4, 3, 2, 1, 0];

export function pushNavigationHeap(
  heap,
  entry,
) {
  heap.push(entry);
  let index = heap.length - 1;
  while (index > 0) {
    const parentIndex = Math.floor(
      (index - 1) / 2,
    );
    if (
      heap[parentIndex].estimate <=
      entry.estimate
    ) {
      break;
    }
    heap[index] = heap[parentIndex];
    index = parentIndex;
  }
  heap[index] = entry;
}

export function popNavigationHeap(heap) {
  const first = heap[0];
  const last = heap.pop();
  if (heap.length === 0) {
    return first;
  }
  let index = 0;
  while (true) {
    const left = index * 2 + 1;
    if (left >= heap.length) {
      break;
    }
    const right = left + 1;
    const child =
      right < heap.length &&
      heap[right].estimate <
        heap[left].estimate
        ? right
        : left;
    if (
      heap[child].estimate >=
      last.estimate
    ) {
      break;
    }
    heap[index] = heap[child];
    index = child;
  }
  heap[index] = last;
  return first;
}
