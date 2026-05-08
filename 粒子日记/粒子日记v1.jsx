import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ==========================================
// 1. 麦克风音频分析 Hook
// ==========================================
const useAudioAnalyzer = () => {
  const [analyzer, setAnalyzer] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const startAudio = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzerNode = audioCtx.createAnalyser();
      
      analyzerNode.fftSize = 256;
      source.connect(analyzerNode);
      setAnalyzer(analyzerNode);
      setIsRecording(true);
    } catch (err) {
      console.error("麦克风权限获取失败:", err);
    }
  };

  const stopAudio = () => {
    setIsRecording(false);
    setAnalyzer(null);
  };

  return { analyzer, isRecording, startAudio, stopAudio };
};

// ==========================================
// 2. Three.js 核心粒子系统
// ==========================================
const ParticleCloud = ({ imageUrl, analyzer }) => {
  const pointsRef = useRef();
  
  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAudioFrequency: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uAudioFrequency;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec3 pos = position;
        
        // 核心：随声音和时间波动的粒子算法
        float wave = sin(pos.x * 5.0 + uTime) * 0.5;
        pos.z += wave * uAudioFrequency * 0.03; 
        pos.y += cos(pos.z * 2.0 + uTime) * uAudioFrequency * 0.015;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (12.0 / -mvPosition.z); 
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if (ll > 0.5) discard;
        gl_FragColor = vec4(vColor, 1.0 - (ll * 2.0));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending 
  }), []);

  const [particlesData, setParticlesData] = useState(null);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 150; 
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      
      const imgData = ctx.getImageData(0, 0, size, size).data;
      const positions = [];
      const colors = [];

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3];

          if (a > 100) {
            const posX = (x / size - 0.5) * 5;
            const posY = -(y / size - 0.5) * 5; 
            positions.push(posX, posY, 0);
            colors.push(r / 255, g / 255, b / 255);
          }
        }
      }
      setParticlesData({
        positions: new Float32Array(positions),
        colors: new Float32Array(colors)
      });
    };
  }, [imageUrl]);

  const dataArray = useMemo(() => new Uint8Array(256), []);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
      
      let avgFreq = 0;
      if (analyzer) {
        analyzer.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 64; i++) sum += dataArray[i];
        avgFreq = sum / 64.0;
      }
      
      const currentFreq = pointsRef.current.material.uniforms.uAudioFrequency.value;
      pointsRef.current.material.uniforms.uAudioFrequency.value = THREE.MathUtils.lerp(currentFreq, avgFreq, 0.15);
    }
  });

  if (!particlesData) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesData.positions.length / 3} array={particlesData.positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particlesData.colors.length / 3} array={particlesData.colors} itemSize={3} />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
};

// ==========================================
// 3. 主界面布局 (完美复刻视频UI)
// ==========================================
export default function ParticleDiaryApp() {
  const { analyzer, isRecording, startAudio, stopAudio } = useAudioAnalyzer();
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleMicrophoneClick = () => {
    if (!image) return alert("请先上传一张照片作为记忆载体");
    isRecording ? stopAudio() : startAudio();
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)', 
      color: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
    }}>
      
      {/* 顶部导航栏 */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '30px 50px', fontSize: '12px', letterSpacing: '2px', zIndex: 10
      }}>
        <div style={{ display: 'flex', gap: '40px' }}>
          <span style={{ cursor: 'pointer', fontWeight: '500' }}>THE GARDEN</span>
          <span style={{ cursor: 'pointer', opacity: 0.4 }}>MEMORY</span>
          <span style={{ cursor: 'pointer', opacity: 0.4 }}>MUSIC</span>
          <span style={{ cursor: 'pointer', opacity: 0.4 }}>INFO</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', opacity: 0.6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>
      </header>

      {/* 中心视觉区 */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        
        {/* Gemini 状态指示灯 */}
        <div style={{
          marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255, 255, 255, 0.03)', padding: '8px 20px',
          borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)', zIndex: 10
        }}>
          <div style={{ 
            width: '8px', height: '8px', borderRadius: '50%', 
            backgroundColor: isRecording ? '#00ff66' : '#666', 
            boxShadow: isRecording ? '0 0 12px #00ff66' : 'none',
            transition: 'all 0.3s'
          }} />
          <span style={{ fontSize: '14px', letterSpacing: '1.5px', opacity: 0.9 }}>Gemini</span>
        </div>

        {/* 粒子画布底层 */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
           {!image && (
             <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <label style={{
                 padding: '12px 24px', border: '1px solid rgba(255,255,255,0.2)',
                 borderRadius: '30px', cursor: 'pointer', fontSize: '14px', letterSpacing: '1px'
               }}>
                 选择照片开启体验
                 <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
               </label>
             </div>
           )}
           {image && (
             <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
               <ambientLight intensity={0.5} />
               <ParticleCloud imageUrl={image} analyzer={analyzer} />
             </Canvas>
           )}
        </div>
      </main>

      {/* 底部控制台 */}
      <footer style={{ paddingBottom: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', zIndex: 10 }}>
        
        {/* 麦克风录音键 */}
        <div onClick={handleMicrophoneClick} style={{
          width: '72px', height: '72px', borderRadius: '50%',
          border: `1px solid ${isRecording ? '#00ff66' : 'rgba(255, 255, 255, 0.4)'}`,
          boxShadow: isRecording ? '0 0 20px rgba(0, 255, 102, 0.2)' : 'none',
          display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isRecording ? '#00ff66' : 'currentColor'} strokeWidth="1.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
        </div>

        {/* 状态操作行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontSize: '13px', letterSpacing: '1px' }}>
          <span style={{ opacity: 0.6 }}>00:00</span>
          <span style={{ cursor: 'pointer', opacity: 0.9 }}>Save Memory <span style={{ opacity: 0.5 }}>&gt;</span></span>
          <div onClick={() => setImage(null)} style={{ 
             cursor: 'pointer', color: '#ff4a4a', width: '24px', height: '24px', 
             borderRadius: '50%', border: '1px solid rgba(255, 74, 74, 0.5)', 
             display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px'
          }}>✕</div>
        </div>

        {/* 重新上传入口 */}
        <label style={{ marginTop: '10px', fontSize: '11px', opacity: 0.4, cursor: 'pointer', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>&larr;</span> Upload Another
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </label>
      </footer>
    </div>
  );
}