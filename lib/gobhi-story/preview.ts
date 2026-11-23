import { journeyStops } from './journey';

/** The original scenes rendered ahead of time for browsers without WebGL. */
export function createStoryPreview(root: HTMLElement, scenes: readonly { name: string }[]) {
  const art = document.createElement('div');
  art.className = 'story-preview-art';
  art.setAttribute('aria-hidden', 'true');
  root.querySelector('.world')?.append(art);

  const mobile = matchMedia('(max-width: 1023px)');
  const frames = new Map<string, Promise<HTMLImageElement>>();
  let requested = '';
  let disposed = false;

  function load(device: string, name: string) {
    const src = `/gobhi/tour/${device}-${name}.webp`;
    const cached = frames.get(src);
    if (cached) return cached;

    const image = new Image();
    image.alt = '';
    image.src = src;
    const frame = image.decode().then(() => image, error => {
      frames.delete(src);
      throw error;
    });
    frames.set(src, frame);
    return frame;
  }

  return {
    show(progress: number, onReady: (index: number) => void, onUnavailable: () => void) {
      const next = journeyStops.findIndex((stop, i) => i > 0 && progress < (journeyStops[i - 1] + stop) / 2);
      const index = next === -1 ? journeyStops.length - 1 : next - 1;
      const device = mobile.matches ? 'mobile' : 'desktop';
      const key = `${device}-${scenes[index].name}`;
      if (requested === key) return;
      requested = key;

      void load(device, scenes[index].name).then(image => {
        if (disposed || requested !== key) return;
        art.replaceChildren(image);
        onReady(index);
        for (const neighbor of [scenes[index + 1], scenes[index - 1]]) {
          if (neighbor) void load(device, neighbor.name).catch(() => {});
        }
      }, () => {
        if (!disposed && requested === key) {
          requested = '';
          if (!art.firstChild) onUnavailable();
        }
      });
    },
    dispose() {
      disposed = true;
      frames.clear();
      art.remove();
    },
  };
}
