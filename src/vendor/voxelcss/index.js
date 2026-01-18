import './voxel.css';
import './voxelcss.js';

const voxelcss = typeof window !== 'undefined' ? window.voxelcss : null;

export default voxelcss;
export const {
  Scene,
  World,
  Voxel,
  Mesh,
  ColorFace,
  ImageFace,
  LightSource,
  Editor,
  Meshes,
} = voxelcss || {};
