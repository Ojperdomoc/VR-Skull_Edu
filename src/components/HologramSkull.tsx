import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { BONES } from '../data/craniumData';
import { sfx } from '../utils/sound';

interface Props {
  selectedBoneId: string | null;
  onSelectBone: (id: string) => void;
  explode: number; // 0..1.5
  activeBones?: string[]; // bones of current checkpoint (highlight)
  autoRotate?: boolean;
  identifyTarget?: string | null; // for quiz identify mode
  compact?: boolean;
}

function BoneMesh({
  id, color, position, explode, selected, dimmed, isTarget, onSelect, index,
}: {
  id: string; color: string; position: [number, number, number];
  explode: number; selected: boolean; dimmed: boolean; isTarget: boolean;
  onSelect: (id: string) => void; index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);

  const dir = useMemo(() => {
    const v = new THREE.Vector3(...position);
    if (v.length() === 0) v.set(0, 1, 0);
    v.normalize();
    return v;
  }, [position]);

  const exploded = useMemo((): [number, number, number] => {
    return [
      position[0] + dir.x * explode * 1.6,
      position[1] + dir.y * explode * 1.6,
      position[2] + dir.z * explode * 1.6,
    ];
  }, [position, dir, explode]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.position.lerp(new THREE.Vector3(...exploded), 0.08);
      meshRef.current.rotation.y = Math.sin(t * 0.6 + index) * 0.12;
      const s = selected || hover ? 1.18 : 1;
      const cur = meshRef.current.scale.x;
      meshRef.current.scale.setScalar(cur + (s - cur) * 0.15);
    }
    if (glowRef.current) {
      const pulse = selected || isTarget ? 1 + Math.sin(t * 5) * 0.12 : 1;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  const geometry = useMemo(() => {
    switch (id) {
      case 'frontal': return <sphereGeometry args={[0.85, 24, 18, -Math.PI / 3.2, Math.PI / 1.6, 0, Math.PI / 2.4]} />;
      case 'parietal': return <sphereGeometry args={[0.72, 20, 16, 0, Math.PI / 1.4, 0, Math.PI / 2.2]} />;
      case 'occipital': return <sphereGeometry args={[0.7, 20, 16, Math.PI * 0.7, Math.PI / 1.3, Math.PI / 3.5, Math.PI / 2.5]} />;
      case 'neurocraneo': return <torusGeometry args={[1.85, 0.03, 8, 64]} />;
      case 'temporal': return <cylinderGeometry args={[0.42, 0.5, 0.5, 18]} />;
      case 'esfenoides': return <boxGeometry args={[1.15, 0.32, 0.55]} />;
      case 'etmoides': return <boxGeometry args={[0.34, 0.34, 0.34]} />;
      case 'facial': return <sphereGeometry args={[0.95, 20, 14, -Math.PI / 2.6, Math.PI / 1.3, Math.PI / 2.1, Math.PI / 3.4]} />;
      case 'maxilar': return <boxGeometry args={[0.72, 0.42, 0.4]} />;
      case 'vomer': return <boxGeometry args={[0.08, 0.5, 0.4]} />;
      case 'conchas': return <torusGeometry args={[0.22, 0.09, 10, 20]} />;
      case 'paladar': return <boxGeometry args={[0.6, 0.1, 0.55]} />;
      case 'mandibula': return <torusGeometry args={[0.68, 0.16, 12, 28, Math.PI * 1.15]} />;
      case 'foramen': return <torusGeometry args={[0.3, 0.07, 10, 24]} />;
      case 'fosas': return <cylinderGeometry args={[0.55, 0.65, 0.22, 20]} />;
      case 'canales': return <torusGeometry args={[0.34, 0.05, 8, 20]} />;
      default: return <sphereGeometry args={[0.4, 16, 16]} />;
    }
  }, [id]);

  const bone = BONES.find(b => b.id === id);

  return (
    <group>
      <mesh
        ref={glowRef}
        position={exploded}
      >
        {id === 'mandibula' || id === 'foramen' || id === 'conchas' || id === 'canales' || id === 'neurocraneo'
          ? (id === 'neurocraneo'
              ? <torusGeometry args={[1.85, 0.07, 8, 64]} />
              : id === 'mandibula'
                ? <torusGeometry args={[0.68, 0.24, 12, 28, Math.PI * 1.15]} />
                : <torusGeometry args={[0.3, 0.13, 10, 24]} />)
          : <sphereGeometry args={[0.55, 12, 12]} />}
        <meshBasicMaterial color={color} transparent opacity={selected || hover || isTarget ? 0.25 : 0.06} depthWrite={false} />
      </mesh>
      <mesh
        ref={meshRef}
        position={exploded}
        onClick={(e) => { e.stopPropagation(); sfx.select(); onSelect(id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
        rotation={id === 'mandibula' ? [0.4, 0, Math.PI * 0.92] : id === 'temporal' ? [0, 0, Math.PI / 2] : id === 'neurocraneo' ? [Math.PI / 2.3, 0, 0] : [0, 0, 0]}
      >
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected || hover || isTarget ? 1.4 : dimmed ? 0.15 : 0.55}
          transparent
          opacity={dimmed ? 0.25 : selected || hover ? 0.95 : 0.75}
          roughness={0.25}
          metalness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {(selected || isTarget) && bone && (
        <Html position={[exploded[0], exploded[1] + 0.55, exploded[2]]} center distanceFactor={8} zIndexRange={[30, 0]}>
          <div
            className="pointer-events-none whitespace-nowrap rounded-lg border px-2.5 py-1 text-[11px] font-bold backdrop-blur-md"
            style={{ borderColor: color, background: 'rgba(2,6,23,0.85)', color, boxShadow: `0 0 18px ${color}66` }}
          >
            {isTarget ? '◎ OBJETIVO' : bone.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function BrainCore({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.25;
      const s = 0.85 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      ref.current.scale.setScalar(visible ? s : 0.001);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.72, 24, 20]} />
      <meshStandardMaterial color="#f9a8d4" emissive="#ec4899" emissiveIntensity={0.35} transparent opacity={0.5} roughness={0.9} wireframe />
    </mesh>
  );
}

function Rings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (r1.current) { r1.current.rotation.z = t * 0.15; r1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.15; }
    if (r2.current) { r2.current.rotation.z = -t * 0.1; r2.current.rotation.x = Math.PI / 2.4; }
  });
  return (
    <group>
      <mesh ref={r1}>
        <torusGeometry args={[2.5, 0.012, 8, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[2.85, 0.008, 8, 100]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Scene({ selectedBoneId, onSelectBone, explode, activeBones, identifyTarget }: Props) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={1.4} color="#22d3ee" />
      <pointLight position={[-5, -3, -4]} intensity={1} color="#a78bfa" />
      <pointLight position={[0, 4, -5]} intensity={0.7} color="#f472b6" />

      <BrainCore visible={explode < 0.9} />
      <Rings />

      {/* líneas de conexión al centro cuando explota */}
      {explode > 0.15 && BONES.map((b) => {
        const v = new THREE.Vector3(...b.pos3d).normalize();
        const end: [number, number, number] = [
          b.pos3d[0] + v.x * explode * 1.6,
          b.pos3d[1] + v.y * explode * 1.6,
          b.pos3d[2] + v.z * explode * 1.6,
        ];
        return (
          <Line
            key={'line-' + b.id}
            points={[[0, 0, 0], end]}
            color={b.color}
            transparent
            opacity={0.18}
            lineWidth={1}
          />
        );
      })}

      {BONES.filter(b => b.id !== 'facial' || true).map((b, i) => (
        <BoneMesh
          key={b.id}
          id={b.id}
          color={b.color}
          position={b.pos3d}
          explode={explode}
          selected={selectedBoneId === b.id}
          dimmed={activeBones ? !activeBones.includes(b.id) : false}
          isTarget={identifyTarget === b.id}
          onSelect={onSelectBone}
          index={i}
        />
      ))}
    </>
  );
}

export default function HologramSkull(props: Props) {
  return (
    <div className={`relative h-full w-full ${props.compact ? '' : 'min-h-[420px]'}`}>
      <Canvas camera={{ position: [0, 0.6, 5.4], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Scene {...props} />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={9}
          autoRotate={props.autoRotate ?? true}
          autoRotateSpeed={0.9}
        />
      </Canvas>
      {/* overlay HUD esquinas */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-300/70">
        <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
        Holo-Scan Activo
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 text-[10px] font-mono uppercase tracking-widest text-slate-500">
        Arrastra para rotar • Rueda para zoom
      </div>
    </div>
  );
}
