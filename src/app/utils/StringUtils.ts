// reference https://github.com/hv0905/NekoImageGallery.App/blob/master/src/Utils/StringUtils.ts
export function humanReadableBytes(bytes: number) {
  const unit = ['', 'K', 'M', 'G', 'T'];
  let current = 0;
  while (current < unit.length && bytes > 1024) {
    bytes /= 1024;
    current++;
  }

  return `${bytes.toFixed(2)} ${unit[current]}B`;
}
