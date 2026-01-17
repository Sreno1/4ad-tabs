// Convert a track URL or filename into a human-friendly title.
// Rule: decode percent-encoding, strip extension, and return the substring
// after a leading track number + space (e.g. "01 The Emperor" -> "The Emperor").
export default function formatTrackTitle(url) {
  if (!url) return '';
  try {
    const seg = String(url).split('/').pop().split('?')[0];
    const decoded = decodeURIComponent(seg);
    const noExt = decoded.replace(/\.[^/.]+$/, '').trim();
    // find the first occurrence of a number followed by a space anywhere in the filename
    const match = noExt.match(/\d+\s+/);
    const titlePart = match ? noExt.slice(match.index + match[0].length) : noExt;
    return titlePart.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return String(url).split('/').pop();
  }
}
