/** Determine if two vectors are approximately equal within some threshold. */
export function vectorEquals(a, b, eps) {
    return (
        Math.abs(a.x - b.x) < eps &&
        Math.abs(a.y - b.y) < eps &&
        Math.abs(a.z - b.z) < eps
    );
}
