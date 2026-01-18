import React, { useEffect, useMemo, useRef } from 'react';
import { Scene, World, Voxel, LightSource } from '../vendor/voxelcss/index.js';
import { createDungeonMeshes } from '../voxel/meshes.js';
import { buildVoxelDescriptors } from '../voxel/buildVoxelWorld.js';
import '../styles/voxelView.css';

export default function DungeonVoxelView({
  grid,
  doors = [],
  walls = [],
  partyPos,
  voxelSize = 24,
  className = '',
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const worldRef = useRef(null);
  const lightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const voxelMapRef = useRef(new Map());
  const voxelMetaRef = useRef(new Map());
  const lightPosRef = useRef(null);
  const ambientPosRef = useRef(null);

  const meshes = useMemo(() => createDungeonMeshes(), []);

  useEffect(() => {
    if (!Scene || !Voxel || !LightSource) return;
    if (!containerRef.current) return;

    const scene = new Scene();
    sceneRef.current = scene;
    scene.attach(containerRef.current);
    scene.setRotationX(-0.7);
    scene.setRotationY(0.8);
    scene.setRotationZ(0);
    scene.setZoom(0.85);
    scene.enableOrbit();
    scene.enablePan();
    scene.enableZoom();

    worldRef.current = new World(scene, 'dungeon-voxel');

    const light = new LightSource(0, voxelSize * 2, 0, voxelSize * 12, 0.15, 1);
    lightRef.current = light;
    scene.addLightSource(light);
    const ambient = new LightSource(0, voxelSize * 8, 0, voxelSize * 40, 0.4, 0.9);
    ambientLightRef.current = ambient;
    scene.addLightSource(ambient);

    return () => {
      try {
        scene.detach();
      } catch (err) {
        // ignore cleanup errors when already detached
      }
      sceneRef.current = null;
      worldRef.current = null;
      lightRef.current = null;
      ambientLightRef.current = null;
      voxelMapRef.current.clear();
      voxelMetaRef.current.clear();
      lightPosRef.current = null;
      ambientPosRef.current = null;
    };
  }, [voxelSize]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !Voxel || !meshes) return;

    const { descriptors, lightPosition, center, floorHeight } = buildVoxelDescriptors({
      grid,
      doors,
      walls,
      voxelSize,
      meshes,
      partyPos,
    });

    const voxelMap = voxelMapRef.current;
    const nextKeys = new Set();

    descriptors.forEach((desc) => {
      nextKeys.add(desc.key);
      const existing = voxelMap.get(desc.key);
      const prevMeta = voxelMetaRef.current.get(desc.key);
      const nextMeta = {
        x: desc.x,
        y: desc.y,
        z: desc.z,
        size: desc.size,
        mesh: desc.mesh,
      };
      if (existing) {
        if (!prevMeta || prevMeta.x !== desc.x || prevMeta.y !== desc.y || prevMeta.z !== desc.z) {
          existing.setPosition(desc.x, desc.y, desc.z);
        }
        if (!prevMeta || prevMeta.size !== desc.size) {
          existing.setDimension(desc.size);
        }
        if (!prevMeta || prevMeta.mesh !== desc.mesh) {
          existing.setMesh(desc.mesh);
        }
        voxelMetaRef.current.set(desc.key, nextMeta);
        return;
      }
      const voxel = new Voxel(desc.x, desc.y, desc.z, desc.size, { mesh: desc.mesh });
      scene.add(voxel);
      voxelMap.set(desc.key, voxel);
      voxelMetaRef.current.set(desc.key, nextMeta);
    });

    voxelMap.forEach((voxel, key) => {
      if (nextKeys.has(key)) return;
      scene.remove(voxel);
      voxelMap.delete(key);
      voxelMetaRef.current.delete(key);
    });

    if (lightRef.current && lightPosition) {
      const prev = lightPosRef.current;
      if (!prev || prev.x !== lightPosition.x || prev.y !== lightPosition.y || prev.z !== lightPosition.z) {
        lightRef.current.setPosition(lightPosition.x, lightPosition.y, lightPosition.z);
        lightPosRef.current = lightPosition;
      }
    }
    if (ambientLightRef.current) {
      const ambientHeight = Math.max(voxelSize * 6, floorHeight * 3);
      const ambientPos = { x: center.x, y: ambientHeight, z: center.z };
      const prev = ambientPosRef.current;
      if (!prev || prev.x !== ambientPos.x || prev.y !== ambientPos.y || prev.z !== ambientPos.z) {
        ambientLightRef.current.setPosition(ambientPos.x, ambientPos.y, ambientPos.z);
        ambientPosRef.current = ambientPos;
      }
    }
  }, [grid, meshes, partyPos, voxelSize, doors, walls]);

  return (
    <div
      ref={containerRef}
      className={`dungeon-voxel-view ${className}`.trim()}
    />
  );
}
