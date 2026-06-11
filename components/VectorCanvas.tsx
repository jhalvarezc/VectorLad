
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { VectorData, AngleVisual, DimensionMode } from '../types';

interface VectorCanvasProps {
  vectors: VectorData[];
  angleVisual?: AngleVisual | null;
  dimensionMode: DimensionMode;
  onUpdateVector: (id: string, x: number, y: number, z: number) => void;
}

interface LabelPosition {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  visible: boolean;
}

const VectorCanvas: React.FC<VectorCanvasProps> = ({ vectors, angleVisual, dimensionMode, onUpdateVector }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const transformRef = useRef<TransformControls | null>(null);
  const arrowsRef = useRef<Map<string, THREE.Group>>(new Map());
  const handlesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);
  
  const vectorsRef = useRef<VectorData[]>(vectors);
  const dimensionModeRef = useRef<DimensionMode>(dimensionMode);

  useEffect(() => { vectorsRef.current = vectors; }, [vectors]);
  useEffect(() => { dimensionModeRef.current = dimensionMode; }, [dimensionMode]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.Fog(0x020617, 30, 150);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 15, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(transformControls.getHelper());
    transformRef.current = transformControls;

    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });

    transformControls.addEventListener('change', () => {
      const object = transformControls.object;
      if (object && object.userData.vectorId) {
        const id = object.userData.vectorId;
        const pos = object.position;
        onUpdateVector(id, 
          Number(pos.x.toFixed(2)), 
          Number(pos.y.toFixed(2)), 
          dimensionModeRef.current === '2D' ? 0 : Number(pos.z.toFixed(2))
        );
      }
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 25, 15);
    scene.add(dirLight);

    const gridXZ = new THREE.GridHelper(60, 60, 0x1e293b, 0x0f172a);
    scene.add(gridXZ);

    const gridXY = new THREE.GridHelper(60, 60, 0x334155, 0x0f172a);
    gridXY.rotation.x = Math.PI / 2;
    gridXY.visible = false;
    scene.add(gridXY);

    const axes = new THREE.AxesHelper(100);
    scene.add(axes);

    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      
      const curVects = vectorsRef.current;
      const curMode = dimensionModeRef.current;

      if (cameraRef.current && curVects.length > 0) {
        const newPositions = curVects.map(v => {
          const pos = new THREE.Vector3(v.x, v.y, v.z);
          pos.project(cameraRef.current!);
          const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
          const y = (pos.y * -0.5 + 0.5) * window.innerHeight;
          return { id: v.id, label: v.label, color: v.color, x, y, visible: pos.z < 1 };
        });
        setLabelPositions(newPositions);
      } else {
        setLabelPositions([]);
      }

      gridXZ.visible = curMode === '3D';
      gridXY.visible = curMode === '2D';

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const onMouseDown = (event: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(Array.from(handlesRef.current.values()));

      if (intersects.length > 0) {
        const object = intersects[0].object;
        transformControls.attach(object);
      } else if (!transformControls.dragging) {
        transformControls.detach();
      }
    };

    window.addEventListener('mousedown', onMouseDown);

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', onMouseDown);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || !transformRef.current) return;
    if (dimensionMode === '2D') {
      cameraRef.current.position.set(0, 0, 20);
      cameraRef.current.up.set(0, 1, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.enableRotate = false;
      transformRef.current.showZ = false;
    } else {
      cameraRef.current.position.set(15, 15, 15);
      cameraRef.current.up.set(0, 1, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.enableRotate = true;
      transformRef.current.showZ = true;
    }
    controlsRef.current.update();
  }, [dimensionMode]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const currentIds = new Set(vectors.map(v => v.id));
    
    arrowsRef.current.forEach((group, id) => {
      if (!currentIds.has(id)) {
        scene.remove(group);
        arrowsRef.current.delete(id);
        const handle = handlesRef.current.get(id);
        if (handle) {
          scene.remove(handle);
          handlesRef.current.delete(id);
          if (transformRef.current?.object === handle) transformRef.current.detach();
        }
      }
    });

    vectors.forEach(v => {
      let group = arrowsRef.current.get(v.id);
      let handle = handlesRef.current.get(v.id);

      if (group) scene.remove(group);
      if (handle && !transformRef.current?.dragging) {
        handle.position.set(v.x, v.y, v.z);
      } else if (!handle) {
        const handleGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const handleMat = new THREE.MeshBasicMaterial({ color: v.color, transparent: true, opacity: 0 });
        handle = new THREE.Mesh(handleGeo, handleMat);
        handle.userData.vectorId = v.id;
        handle.position.set(v.x, v.y, v.z);
        scene.add(handle);
        handlesRef.current.set(v.id, handle);
      }

      group = new THREE.Group();
      const dir = new THREE.Vector3(v.x, v.y, v.z);
      const len = dir.length();
      if (len > 0) {
        const arrow = new THREE.ArrowHelper(dir.clone().normalize(), new THREE.Vector3(0, 0, 0), len, v.color, 0.8, 0.4);
        group.add(arrow);
        if (dimensionMode === '3D') {
          const mat = new THREE.LineDashedMaterial({ color: v.color, dashSize: 0.2, gapSize: 0.1, opacity: 0.2, transparent: true });
          const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(v.x, v.y, v.z), new THREE.Vector3(v.x, 0, v.z), new THREE.Vector3(0, 0, 0)]);
          const line = new THREE.Line(g, mat); 
          line.computeLineDistances(); 
          group.add(line);
        }
      }
      scene.add(group);
      arrowsRef.current.set(v.id, group);
    });
  }, [vectors, dimensionMode]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div ref={containerRef} className="absolute inset-0 pointer-events-auto" />
      <div className="absolute inset-0 pointer-events-none">
        {labelPositions.map(lp => lp.visible && (
          <div key={lp.id} style={{ position: 'absolute', left: lp.x, top: lp.y, transform: 'translate(-50%, -50%)', color: lp.color }} className="bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-700 text-[9px] font-black shadow-lg pointer-events-none select-none uppercase tracking-tighter">
            {lp.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VectorCanvas;
