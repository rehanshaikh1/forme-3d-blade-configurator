import React, { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, Html, Text, RoundedBox } from '@react-three/drei';
import { RotateCcw, Camera, Layers3, Eye, EyeOff, Check, ChevronRight, Sparkles, ShoppingBag, Download, Info, Move3D, Ruler, Box } from 'lucide-react';
import * as THREE from 'three';

const FACE = [
  { id: 'walnut', name: 'Smoked walnut', hex: '#795037', rough: .42, price: 0, weight: 0, grain: '#d2a47a' },
  { id: 'maple', name: 'Birdseye maple', hex: '#d5ae7b', rough: .36, price: 18, weight: -2, grain: '#f0d7ad' },
  { id: 'ebony', name: 'African ebony', hex: '#34251e', rough: .29, price: 34, weight: 5, grain: '#8e6b4d' },
  { id: 'rosewood', name: 'Rosewood', hex: '#743c32', rough: .34, price: 26, weight: 2, grain: '#c48a72' }
];
const CORE = [
  { id: 'ayous', name: 'Ayous core', hex: '#d9b98d', price: 0, weight: 0 },
  { id: 'kiri', name: 'Kiri core', hex: '#e7d7b9', price: 12, weight: -4 },
  { id: 'limba', name: 'Limba core', hex: '#b88b5d', price: 16, weight: 3 }
];
const GRIPS = [
  { id: 'cork', name: 'Natural cork', hex: '#b77e4e', price: 0, weight: 0 },
  { id: 'carbon', name: 'Carbon weave', hex: '#262b29', price: 22, weight: 4 },
  { id: 'ivory', name: 'Ivory composite', hex: '#e6dcc8', price: 14, weight: -1 },
  { id: 'oxblood', name: 'Oxblood stain', hex: '#5c2928', price: 18, weight: 2 }
];
const EDGE = [
  { id: 'black', name: 'Graphite', hex: '#272a28', price: 0 },
  { id: 'cream', name: 'Ivory', hex: '#e9dfca', price: 6 },
  { id: 'copper', name: 'Copper', hex: '#a66b43', price: 12 }
];
const FINISH = [
  { id: 'satin', name: 'Silk satin', rough: .43, coat: .16, price: 0 },
  { id: 'matte', name: 'Ultra matte', rough: .86, coat: 0, price: 0 },
  { id: 'gloss', name: 'Piano gloss', rough: .13, coat: .85, price: 15 }
];

function bladeShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -.16);
  s.bezierCurveTo(-.55, .03, -1.22, .60, -1.20, 1.42);
  s.bezierCurveTo(-1.18, 2.22, -.68, 2.84, 0, 2.96);
  s.bezierCurveTo(.68, 2.84, 1.18, 2.22, 1.20, 1.42);
  s.bezierCurveTo(1.22, .60, .55, .03, 0, -.16);
  return s;
}
function BladeGeometry({ depth = .07, bevel = .012 }) {
  const shape = useMemo(() => bladeShape(), []);
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 32 }), [shape, depth, bevel]);
  return geometry;
}
function GrainLines({ color, opacity = .16 }) {
  const lines = useMemo(() => Array.from({ length: 19 }, (_, i) => {
    const y = .10 + i * .145, w = .86 * Math.sin((y + .15) / 3.08 * Math.PI);
    return { y, w, x: Math.sin(i * 2.13) * .075, bend: Math.cos(i * 1.7) * .05 };
  }), []);
  return <group position={[0, 0, .168]}>
    {lines.map((l, i) => <mesh key={i} position={[l.x, l.y, 0]} rotation={[0, 0, l.bend]} scale={[l.w, .004 + (i % 3) * .001, 1]}>
      <planeGeometry args={[1, 1]} /><meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>)}
  </group>;
}
function BladeAssembly({ cfg, exploded, showGrain, showLogo }) {
  const face = FACE.find(x => x.id === cfg.face), core = CORE.find(x => x.id === cfg.core), grip = GRIPS.find(x => x.id === cfg.grip), edge = EDGE.find(x => x.id === cfg.edge), finish = FINISH.find(x => x.id === cfg.finish);
  const geo = useMemo(() => bladeShape(), []);
  const plyOffsets = [-.105, -.07, -.035, 0, .035, .07, .105];
  const plyColors = ['#b88b5d', core.hex, '#cba77c', face.hex, '#cba77c', core.hex, '#b88b5d'];
  return <group rotation={[-Math.PI / 2, 0, 0]}>
    {/* seven-ply laminated blade, each layer individually visible */}
    {plyOffsets.map((z, i) => <mesh key={i} position={[0, 0, z + (exploded ? (i - 3) * .055 : 0)]} castShadow receiveShadow>
      <extrudeGeometry args={[geo, { depth: .028, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: .009, bevelThickness: .006, curveSegments: 32 }]} />
      <meshPhysicalMaterial color={i === 3 ? face.hex : plyColors[i]} roughness={i === 3 ? finish.rough : .62} clearcoat={i === 3 ? finish.coat : .05} />
    </mesh>)}
    {/* top face overlay */}
    <mesh position={[0, 0, .145 + (exploded ? 0 : 0)]} castShadow>
      <shapeGeometry args={[geo, 32]} />
      <meshPhysicalMaterial
        color={face.hex}
        roughness={finish.rough}
        clearcoat={finish.coat}
        clearcoatRoughness={0.18}
      />
    </mesh>
    {showGrain && <GrainLines color={face.grain} opacity={cfg.finish === 'gloss' ? .10 : .22} />}
    {/* edge tape follows the silhouette */}
    <mesh position={[0, 0, -.004]} scale={[1.008, 1.008, 1]}>
      <shapeGeometry args={[geo, 32]} />
      <meshBasicMaterial color={edge.hex} side={THREE.BackSide} />
    </mesh>
    {/* handle neck and flared grip */}
    <mesh position={[0, -.57, .005]} castShadow>
      <boxGeometry args={[.47, .70, .22]} /><meshPhysicalMaterial color={core.hex} roughness={.52} />
    </mesh>
    <mesh position={[0, -1.22, .005]} castShadow>
      <boxGeometry args={[.40, .77, .23]} /><meshPhysicalMaterial color={grip.hex} roughness={cfg.grip === 'carbon' ? .35 : .72} metalness={cfg.grip === 'carbon' ? .28 : .02} />
    </mesh>
    {/* grip wrap bands */}
    {[-1.52, -1.34, -1.16, -.98].map((y, i) => <mesh key={i} position={[0, y, .126]}>
      <boxGeometry args={[.405, .025, .012]} /><meshStandardMaterial color={i % 2 ? '#5d4939' : '#d2b58b'} roughness={.65} />
    </mesh>)}
    {/* blade neck joint and branded medallion */}
    <mesh position={[0, -.27, .17]}><circleGeometry args={[.115, 32]} /><meshStandardMaterial color={edge.hex} metalness={0.55} roughness={0.3} /></mesh>
    <mesh position={[0, -.27, .176]}><circleGeometry args={[.077, 32]} /><meshStandardMaterial color={face.hex} metalness={0.18} roughness={0.35} /></mesh>
    {showLogo && <Text position={[0, 1.55, .177]} fontSize={.16} color="#f1dfc6" anchorX="center" anchorY="middle" outlineWidth={0.003} outlineColor="#3a291e">FORME</Text>}
    {/* small edge details */}
    <mesh position={[0, -1.72, .02]}><boxGeometry args={[.25, .035, .24]} /><meshStandardMaterial color={edge.hex} metalness={0.25} roughness={0.4} /></mesh>
  </group>;
}

function Scene({ cfg, exploded, showGrain, showLogo, view, setView }) {
  const controls = useRef();
  return <Canvas shadows dpr={[1, 2]} camera={{ position: [4.4, 4.0, 6.2], fov: 34 }}>
    <color attach="background" args={['#e8e8e1']} />
    <ambientLight intensity={.65} />
    <directionalLight position={[4, 7, 5]} intensity={2.5} castShadow shadow-mapSize={[2048, 2048]} />
    <directionalLight position={[-4, 3, -3]} intensity={1.1} />
    <Suspense fallback={<Html center>Preparing model…</Html>}>
      <Environment preset="studio" />
      <BladeAssembly cfg={cfg} exploded={exploded} showGrain={showGrain} showLogo={showLogo} />
      <ContactShadows position={[0, -2.08, 0]} opacity={.32} scale={7} blur={2.6} far={4} />
    </Suspense>
    <OrbitControls ref={controls} enablePan={false} minDistance={4.4} maxDistance={10} minPolarAngle={.35} maxPolarAngle={2.75} autoRotate={false} />
  </Canvas>;
}
function OptionCard({ item, active, onClick, kind = 'swatch' }) {
  return <button className={`option-card ${active ? 'selected' : ''}`} onClick={onClick}>
    <span className={`option-preview ${kind}`} style={{ background: item.hex || `linear-gradient(135deg,#c5a27b,#493124)` }} />
    <span className="option-copy"><b>{item.name}</b><small>{item.price ? `+₹${item.price}` : 'Included'}</small></span>
    {active && <Check size={15} className="option-check" />}
  </button>;
}
export default function App() {
  const [cfg, setCfg] = useState({ face: 'walnut', core: 'ayous', grip: 'cork', edge: 'black', finish: 'satin' });
  const [section, setSection] = useState('face'), [exploded, setExploded] = useState(false), [showGrain, setShowGrain] = useState(true), [showLogo, setShowLogo] = useState(true), [saved, setSaved] = useState(false), [view, setView] = useState('front');
  const set = (k, v) => { setCfg(p => ({ ...p, [k]: v })); setSaved(false) };
  const face = FACE.find(x => x.id === cfg.face), core = CORE.find(x => x.id === cfg.core), grip = GRIPS.find(x => x.id === cfg.grip), finish = FINISH.find(x => x.id === cfg.finish), edge = EDGE.find(x => x.id === cfg.edge);
  const price = 149 + face.price + core.price + grip.price + edge.price + finish.price;
  const weight = 88 + face.weight + core.weight + grip.weight;
  const reset = () => { setCfg({ face: 'walnut', core: 'ayous', grip: 'cork', edge: 'black', finish: 'satin' }); setExploded(false); setSaved(false) };
  const sections = [
    { id: 'face', n: '01', label: 'Face veneer', sub: 'Surface wood & grain' },
    { id: 'core', n: '02', label: 'Inner construction', sub: 'Core composition' },
    { id: 'grip', n: '03', label: 'Handle', sub: 'Grip material & feel' },
    { id: 'edge', n: '04', label: 'Edge & trim', sub: 'Blade perimeter' },
    { id: 'finish', n: '05', label: 'Surface finish', sub: 'Final surface treatment' }
  ];
  const items = { face: FACE, core: CORE, grip: GRIPS, edge: EDGE, finish: FINISH };
  return <div className="site">
    <header className="topbar">
      <a className="logo" href="#"><span className="logo-symbol">F</span><span>FORME<small>ATELIER / CUSTOM LAB</small></span></a>
      <nav><a className="active" href="#builder">CONFIGURE</a><a href="#craft">ENGINEERING</a><a href="#specs">SPECIFICATIONS</a></nav>
      <div className="top-actions"><span>INR / ₹</span><button className="bag"><ShoppingBag size={17} /><b>0</b></button></div>
    </header>
    <main>
      <section className="hero">
        <div><div className="kicker"><i /> PERFORMANCE EQUIPMENT, PERSONALLY BUILT</div><h1>Engineer your<br /><em>own advantage.</em></h1></div>
        <div className="hero-note"><span>THE ATELIER SERIES / 001</span><p>A blade is more than its shape. Tune every layer, material and detail to create a setup that feels unmistakably yours.</p></div>
      </section>
      <section className="workspace" id="builder">
        <div className="visual-column">
          <div className="viewer">
            <div className="viewer-head"><span><i className="live" /> LIVE CONFIGURATION</span><span>MODEL / AT-001</span></div>
            <Scene cfg={cfg} exploded={exploded} showGrain={showGrain} showLogo={showLogo} view={view} />
            <div className="viewer-controls">
              <button onClick={() => setExploded(!exploded)} className={exploded ? 'on' : ''}><Layers3 size={15} />{exploded ? 'ASSEMBLED VIEW' : 'EXPLODE LAYERS'}</button>
              <button onClick={() => setShowGrain(!showGrain)}>{showGrain ? <Eye size={15} /> : <EyeOff size={15} />} GRAIN</button>
              <button onClick={() => setShowLogo(!showLogo)}>{showLogo ? 'HIDE' : 'SHOW'} MARK</button>
            </div>
            <div className="viewer-foot"><span>DRAG TO ORBIT · SCROLL TO ZOOM</span><span>INTERACTIVE 3D / 360°</span></div>
          </div>
          <div className="quick-specs" id="specs">
            <div><small>ESTIMATED WEIGHT</small><b>{weight}<i> g</i></b><span>Calculated from selected materials</span></div>
            <div><small>BUILD PRICE</small><b>₹{price.toLocaleString('en-IN')}</b><span>Base + selected upgrades</span></div>
            <div><small>CONSTRUCTION</small><b>7 <i>PLY</i></b><span>Layered blade concept</span></div>
            <div><small>BUILD REFERENCE</small><b>AT-{cfg.face.slice(0, 2).toUpperCase()}{cfg.grip.slice(0, 2).toUpperCase()}</b><span>Configuration identifier</span></div>
          </div>
        </div>
        <aside className="builder">
          <div className="builder-head"><div><span className="kicker">YOUR BUILD / 01</span><h2>Custom blade <sup>ATELIER</sup></h2></div><button className="reset" onClick={reset}><RotateCcw size={14} /> RESET</button></div>
          <div className="builder-body">
            <div className="step-list">
              {sections.map(s => <button key={s.id} onClick={() => setSection(s.id)} className={`step ${section === s.id ? 'current' : ''}`}><span className="step-no">{s.n}</span><span className="step-txt"><b>{s.label}</b><small>{s.sub}</small></span><ChevronRight size={15} /></button>)}
            </div>
            <div className="option-area">
              <div className="option-heading"><div><h3>{sections.find(s => s.id === section).label}</h3><p>{sections.find(s => s.id === section).sub}</p></div><span>SELECT ONE</span></div>
              <div className="option-grid">{items[section].map(item => <OptionCard key={item.id} item={item} active={cfg[section] === item.id} onClick={() => set(section, item.id)} kind={section === 'face' ? 'wood' : section === 'finish' ? 'finish' : ''} />)}</div>
              {section === 'core' && <div className="info-strip"><Info size={14} /> Core choice influences the blade's balance and estimated weight.</div>}
              {section === 'face' && <div className="info-strip"><Sparkles size={14} /> Face veneer controls the visible wood character on the blade surface.</div>}
              {section === 'finish' && <div className="finish-preview"><span className={`finish-ball ${cfg.finish}`} /><div><b>{finish.name}</b><small>Surface response preview</small></div></div>}
            </div>
          </div>
          <div className="build-footer">
            <div className="summary"><span>YOUR SELECTED MATERIALS</span><p>{face.name} <i>·</i> {core.name} <i>·</i> {grip.name}</p></div>
            <button className="save" onClick={() => setSaved(true)}>{saved ? 'BUILD SAVED' : 'SAVE CONFIGURATION'} <ChevronRight size={17} /></button>
            {saved && <div className="saved-note"><Check size={14} /> Demo build saved in this session. Checkout is not connected.</div>}
            <div className="legal">Illustrative demo specifications and pricing. Production values require client-approved material data.</div>
          </div>
        </aside>
      </section>
      <section className="engineering" id="craft">
        <div className="engineering-title"><span className="kicker">DESIGNED WITH INTENTION</span><h2>Seven layers.<br /><em>One feeling.</em></h2></div>
        <div className="engineering-copy"><p>Our concept blade construction brings together a considered face veneer, balanced core and precision-finished handle. Explore the layer separation in the viewer to see how the build comes together.</p><div className="engineering-points"><span><b>01</b> MATERIAL SELECTION</span><span><b>02</b> LAYERED CONSTRUCTION</span><span><b>03</b> PERSONAL FINISH</span></div></div>
      </section>
    </main>
    <footer><span>FORME ATELIER © 2026</span><span>INTERACTIVE CONFIGURATOR CONCEPT</span><span>BUILT FOR THE DETAILS</span></footer>
  </div>;
}
