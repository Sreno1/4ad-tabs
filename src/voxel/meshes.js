import voxelcss from '../vendor/voxelcss/index.js';

const { Mesh, ColorFace, ImageFace } = voxelcss || {};

const stoneSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges">
  <rect width="64" height="64" fill="#5f6468" />
  <g stroke="#4b4f54" stroke-width="2">
    <line x1="0" y1="16" x2="64" y2="16" />
    <line x1="0" y1="32" x2="64" y2="32" />
    <line x1="0" y1="48" x2="64" y2="48" />
    <line x1="32" y1="0" x2="32" y2="16" />
    <line x1="16" y1="16" x2="16" y2="32" />
    <line x1="48" y1="16" x2="48" y2="32" />
    <line x1="32" y1="32" x2="32" y2="48" />
    <line x1="24" y1="48" x2="24" y2="64" />
    <line x1="56" y1="48" x2="56" y2="64" />
  </g>
  <g fill="#7a7f84" opacity="0.35">
    <rect x="4" y="4" width="8" height="6" />
    <rect x="38" y="6" width="10" height="7" />
    <rect x="8" y="22" width="12" height="6" />
    <rect x="40" y="22" width="12" height="7" />
    <rect x="6" y="40" width="10" height="6" />
    <rect x="36" y="40" width="14" height="6" />
    <rect x="8" y="54" width="10" height="6" />
    <rect x="40" y="54" width="12" height="6" />
  </g>
</svg>
`.trim();

const floorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges">
  <rect width="64" height="64" fill="#4b4f52" />
  <g fill="#3c4043" opacity="0.7">
    <rect x="0" y="0" width="16" height="16" />
    <rect x="32" y="0" width="16" height="16" />
    <rect x="16" y="16" width="16" height="16" />
    <rect x="48" y="16" width="16" height="16" />
    <rect x="0" y="32" width="16" height="16" />
    <rect x="32" y="32" width="16" height="16" />
    <rect x="16" y="48" width="16" height="16" />
    <rect x="48" y="48" width="16" height="16" />
  </g>
  <g stroke="#2e3235" stroke-width="1">
    <line x1="0" y1="16" x2="64" y2="16" />
    <line x1="0" y1="32" x2="64" y2="32" />
    <line x1="0" y1="48" x2="64" y2="48" />
    <line x1="16" y1="0" x2="16" y2="64" />
    <line x1="32" y1="0" x2="32" y2="64" />
    <line x1="48" y1="0" x2="48" y2="64" />
  </g>
</svg>
`.trim();

const toDataUri = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const makeImageMesh = (svg) => {
  if (!Mesh || !ImageFace) return null;
  const face = new ImageFace(toDataUri(svg));
  return new Mesh(face);
};

const makeTransparentFace = () => {
  if (!ImageFace) return null;
  return new ImageFace();
};

const makeOpenTopMesh = (svg) => {
  if (!Mesh || !ImageFace) return null;
  const textured = new ImageFace(toDataUri(svg));
  const top = makeTransparentFace();
  return new Mesh({
    top,
    bottom: textured,
    front: textured,
    back: textured,
    left: textured,
    right: textured,
  });
};

const makeColorFace = (hex, alpha) => {
  if (!ColorFace) return null;
  const face = new ColorFace(hex);
  if (typeof alpha === 'number') {
    const rgba = face.getRGBA();
    face.setColor(rgba.r, rgba.g, rgba.b, alpha);
  }
  return face;
};

const makeColorMesh = (hex, alpha) => {
  if (!Mesh || !ColorFace) return null;
  const face = makeColorFace(hex, alpha);
  return new Mesh(face);
};

export const createDungeonMeshes = () => {
  if (!Mesh) return null;
  const floor = makeImageMesh(floorSvg) || makeColorMesh('#1f2327');
  const wall = makeOpenTopMesh(stoneSvg) || makeColorMesh('#3a3f46');
  return {
    floor,
    wall,
    door: makeColorMesh('#6c4a2f'),
    marker: makeColorMesh('#b33a3a'),
    party: makeColorMesh('#3aa0ff'),
  };
};
