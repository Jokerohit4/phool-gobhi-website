type Vector = number[];
type CameraKey = { p: number; eye: Vector; target: Vector; me: Vector; mt: Vector };

/** Monotone cubic interpolation: continuous velocity without overshooting the model. */
export function sampleCameraPath(keys: CameraKey[], progress: number, mobile: boolean) {
  const p = Math.max(keys[0].p, Math.min(keys[keys.length - 1].p, progress));
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1].p) i++;
  const h = keys[i + 1].p - keys[i].p, t = (p - keys[i].p) / h;
  function track(field: 'eye' | 'target' | 'me' | 'mt') {
    return keys[i][field].map((a, axis) => {
      const value = (n: number) => keys[n][field][axis];
      const slope = (n: number) => (value(n + 1) - value(n)) / (keys[n + 1].p - keys[n].p);
      const tangent = (n: number) => {
        if (n === 0) return slope(0);
        if (n === keys.length - 1) return slope(n - 1);
        const left = slope(n - 1), right = slope(n);
        if (left * right <= 0) return 0;
        const h0 = keys[n].p - keys[n - 1].p, h1 = keys[n + 1].p - keys[n].p;
        const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0;
        return (w0 + w1) / (w0 / left + w1 / right);
      };
      return (2*t*t*t-3*t*t+1)*a + (t*t*t-2*t*t+t)*h*tangent(i)
        + (-2*t*t*t+3*t*t)*value(i+1) + (t*t*t-t*t)*h*tangent(i+1);
    });
  }
  return { eye: track(mobile ? 'me' : 'eye'), target: track(mobile ? 'mt' : 'target') };
}
