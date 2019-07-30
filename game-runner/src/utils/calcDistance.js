export function calcDistance(pos1, pos2) {
  return Math.sqrt(
    ((pos1[0] - pos2[0]) ** 2) + ((pos1[1] - pos2[1]) ** 2),
  );
}
