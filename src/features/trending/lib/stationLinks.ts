export function stationSlug(value?: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStationId(station: any, index: number, prefix = 'station'): string {
  const rawId = station?.id || station?._id || station?.slug || station?.permalink;
  if (rawId) return String(rawId);

  const titleSlug = stationSlug(station?.title);
  return titleSlug || `${prefix}-${index + 1}`;
}

export function getStationHref(station: any, index: number, prefix = 'station'): string {
  return `/discover/sets/${encodeURIComponent(getStationId(station, index, prefix))}`;
}

export function matchesStationId(station: any, index: number, setId: string, prefix = 'station'): boolean {
  const decoded = decodeURIComponent(setId);
  return (
    getStationId(station, index, prefix) === decoded ||
    stationSlug(station?.title) === decoded
  );
}
