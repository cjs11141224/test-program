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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAudioFrequency: { value: 0 },
      uBrightness: { value: 1.5 }, // 适度亮度
      uMousePosition: { value: new THREE.Vector2(0, 0) },
      uCenter: { value: new THREE.Vector2(0, 0) }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uAudioFrequency;
      uniform vec2 uMousePosition;
      uniform vec2 uCenter;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vDistanceToCenter;
      varying float vTime;
      
      // 简单的噪声函数
      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      // 卷曲噪声函数
      vec2 curlNoise(vec2 p, float t) {
        vec2 noise;
        noise.x = sin(p.x * 0.8 + t * 0.3) * cos(p.y * 0.6 + t * 0.25);
        noise.y = cos(p.x * 0.6 + t * 0.25) * sin(p.y * 0.8 + t * 0.3);
        return noise;
      }
      
      void main() {
        vColor = color;
        vTime = uTime;
        vec3 pos = position;
        
        // 计算粒子到中心的距离
        vec2 particlePos = vec2(pos.x, pos.y);
        float distanceToCenter = length(particlePos - uCenter);
        vDistanceToCenter = distanceToCenter;
        
        // 计算粒子到鼠标的距离
        float distanceToMouse = length(particlePos - uMousePosition);
        
        // 鼠标交互：鼠标附近的粒子突起
        float mouseInfluence = smoothstep(0.12, 0.02, distanceToMouse);
        pos.z += mouseInfluence * 0.3;
        
        // 弧形效果：让整体形成弧形
        float arcEffect = pos.y * 0.3 + sin(pos.x * 2.0 + uTime * 0.15) * 0.15;
        pos.z += arcEffect;
        
        // 卷曲噪声效果：自然的流体运动
        vec2 curl = curlNoise(particlePos * 1.5, uTime * 0.5);
        float curlStrength = 0.12 * (uAudioFrequency * 0.01 + 1.0);
        pos.x += curl.x * curlStrength;
        pos.y += curl.y * curlStrength;
        pos.z += (curl.x + curl.y) * 0.05 * curlStrength;
        
        // 粒子逃逸效果：边缘粒子向外逃逸
        if (distanceToCenter > 0.6) {
          vec2 direction = normalize(particlePos - uCenter);
          float escapeStrength = (distanceToCenter - 0.6) * 1.5;
          float audioInfluence = uAudioFrequency * 0.015 + 1.0;
          pos.x += direction.x * sin(uTime * 0.35 + distanceToCenter * 3.0) * 0.08 * escapeStrength * audioInfluence;
          pos.y += direction.y * cos(uTime * 0.35 + distanceToCenter * 3.0) * 0.08 * escapeStrength * audioInfluence;
          pos.z += sin(uTime * 0.25 + distanceToCenter * 4.0) * 0.05 * escapeStrength * audioInfluence;
        }
        
        // 鼠标驱动边缘飘散：鼠标在边缘时，粒子跟着鼠标方向飘散
        float mouseEdgeRange = 0.25;
        bool isNearMouse = distanceToMouse < mouseEdgeRange;
        bool isEdgeParticle = distanceToCenter > 0.5;
        
        if (isNearMouse && isEdgeParticle) {
          vec2 mouseDirection = normalize(uMousePosition - uCenter);
          float mouseInfluence = smoothstep(mouseEdgeRange, 0.0, distanceToMouse);
          float edgeInfluence = smoothstep(0.5, 1.2, distanceToCenter);
          float totalInfluence = mouseInfluence * edgeInfluence;
          float audioInfluence = uAudioFrequency * 0.01 + 1.0;
          
          // 粒子跟着鼠标方向飘散
          pos.x += mouseDirection.x * 0.12 * totalInfluence * audioInfluence;
          pos.y += mouseDirection.y * 0.12 * totalInfluence * audioInfluence;
          pos.z += (mouseDirection.x + mouseDirection.y) * 0.06 * totalInfluence * audioInfluence;
        }
        
        // 水流效果：添加类似水流的波动
        float waterWave1 = sin(pos.x * 4.0 + uTime * 1.2) * 0.05;
        float waterWave2 = cos(pos.y * 3.0 + uTime * 0.8) * 0.05;
        float waterWave3 = sin((pos.x + pos.y) * 2.0 + uTime * 0.6) * 0.03;
        pos.z += (waterWave1 + waterWave2 + waterWave3) * (uAudioFrequency * 0.02 + 1.0);
        
        // 随声音和时间波动的粒子算法
        float audioInfluence = uAudioFrequency * 0.02;
        float wave = sin(pos.x * 3.0 + uTime * 0.5) * 0.3;
        float wave2 = cos(pos.y * 2.0 + uTime * 0.3) * 0.2;
        pos.z += (wave + wave2) * (audioInfluence + 0.5);
        pos.y += sin(pos.z * 1.0 + uTime * 0.2) * (audioInfluence + 0.1);
        pos.x += cos(pos.y * 1.0 + uTime * 0.1) * (audioInfluence + 0.1);
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        // 粒子大小随音频律动，更大更圆润
        float sizeInfluence = uAudioFrequency * 0.02 + 1.0;
        gl_PointSize = (22.0 / -mvPosition.z) * sizeInfluence;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uBrightness;
      uniform float uTime;
      varying vec3 vColor;
      varying float vDistanceToCenter;
      varying float vTime;
      
      void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if (ll > 0.6) discard;
        
        // 使用平滑的圆形衰减来消除锯齿
        float alpha = smoothstep(0.6, 0.0, ll);
        // 稍微提高边缘的透明度，使其更加柔和
        alpha = pow(alpha, 0.8);
        // 边缘粒子更加透明，增强逃逸感
        float edgeFade = smoothstep(1.5, 0.8, vDistanceToCenter);
        alpha *= edgeFade;
        
        // 增加对比度和清晰度
        vec3 finalColor = vColor * uBrightness;
        // 增加对比度
        finalColor = (finalColor - 0.5) * 1.1 + 0.5;
        // 增加清晰度
        finalColor = clamp(finalColor, 0.0, 1.0);
        // 轻微的发光效果
        finalColor += vec3(0.05, 0.05, 0.05);
        
        gl_FragColor = vec4(finalColor, alpha * 0.95);
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
      const size = 200; 
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);
      
      const imgData = ctx.getImageData(0, 0, size, size).data;
      const positions = [];
      const colors = [];

      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          const idx = (y * size + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const a = imgData[idx + 3];

          // 计算粒子到中心的距离，创建规则的圆形区域
          const centerX = size / 2;
          const centerY = size / 2;
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          
          // 创建规则的圆形边界
          const radius = size / 2;
          
          if (a > 80 && distance <= radius) {
            // 调整粒子位置，让照片占据中间1/2的位置
            const posX = (x / size - 0.5) * 2.5; // 缩小到原来的1/2
            const posY = -(y / size - 0.5) * 2.5; // 缩小到原来的1/2
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

  // 添加鼠标移动事件监听器
  useEffect(() => {
    const handleMouseMove = (event) => {
      // 计算鼠标在Canvas中的相对位置
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const dataArray = useMemo(() => new Uint8Array(256), []);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
      
      // 更新鼠标位置到shader
      pointsRef.current.material.uniforms.uMousePosition.value.set(mousePosition.x, mousePosition.y);
      
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
  const [activeTab, setActiveTab] = useState('THE GARDEN');

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
      background: '#000000', 
      color: '#ffffff', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
    }}>
      
      {/* 顶部导航栏 */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', fontSize: '12px', letterSpacing: '2px', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginRight: '20px' }}>和秒的AI日记</div>
          <span 
            onClick={() => setActiveTab('THE GARDEN')}
            style={{ 
              cursor: 'pointer', 
              fontWeight: activeTab === 'THE GARDEN' ? '500' : 'normal',
              opacity: activeTab === 'THE GARDEN' ? 1 : 0.4 
            }}
          >THE GARDEN</span>
          <span 
            onClick={() => setActiveTab('MEMORY')}
            style={{ 
              cursor: 'pointer', 
              fontWeight: activeTab === 'MEMORY' ? '500' : 'normal',
              opacity: activeTab === 'MEMORY' ? 1 : 0.4 
            }}
          >MEMORY</span>
          <span 
            onClick={() => setActiveTab('MUSIC')}
            style={{ 
              cursor: 'pointer', 
              fontWeight: activeTab === 'MUSIC' ? '500' : 'normal',
              opacity: activeTab === 'MUSIC' ? 1 : 0.4 
            }}
          >MUSIC</span>
          <span 
            onClick={() => setActiveTab('INFO')}
            style={{ 
              cursor: 'pointer', 
              fontWeight: activeTab === 'INFO' ? '500' : 'normal',
              opacity: activeTab === 'INFO' ? 1 : 0.4 
            }}
          >INFO</span>
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
          position: 'relative', 
          marginTop: '40px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '15px', 
          zIndex: 10 
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '10px 25px',
            borderRadius: '30px', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(15px)'
          }}>
            <div style={{ 
              width: '10px', height: '10px', borderRadius: '50%', 
              backgroundColor: isRecording ? '#00ff66' : '#666', 
              boxShadow: isRecording ? '0 0 15px #00ff66' : 'none',
              transition: 'all 0.3s'
            }} />
            <span style={{ fontSize: '14px', letterSpacing: '1.5px', opacity: 0.9 }}>Gemini</span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '12px 30px',
            borderRadius: '25px', 
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(15px)'
          }}>
            <span style={{ fontSize: '14px', letterSpacing: '1px', opacity: 0.7 }}>对方正在输入 · · ·</span>
          </div>
        </div>

        {/* 标签页内容 */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          {activeTab === 'THE GARDEN' && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
                <>
                  <Canvas 
                    camera={{ position: [0, 0, 4], fov: 60 }} 
                    style={{ pointerEvents: 'none' }}
                  >
                    <ambientLight intensity={0.5} />
                    <ParticleCloud imageUrl={image} analyzer={analyzer} />
                  </Canvas>
                  {/* 透明的双击捕获层 */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                    onDoubleClick={(event) => {
                      // 双击时随机改变相机位置，实现3D移动效果
                      // 这里需要通过其他方式获取相机实例
                      // 由于Canvas的pointerEvents设置为none，我们需要使用其他方法
                      console.log('双击事件触发');
                    }}
                  />
                </>
              )}
            </div>
          )}
          
          {activeTab === 'MEMORY' && (
            <div style={{ 
              width: '100%', height: '100%', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              flexDirection: 'column', gap: '20px'
            }}>
              <h2 style={{ fontSize: '24px', letterSpacing: '2px', marginBottom: '40px' }}>记忆库</h2>
              <div style={{ 
                padding: '40px', 
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                maxWidth: '500px',
                textAlign: 'center'
              }}>
                <p style={{ opacity: 0.7, marginBottom: '20px' }}>这里将显示您保存的记忆</p>
                <p style={{ opacity: 0.4, fontSize: '14px' }}>点击 "Save Memory" 按钮保存当前记忆</p>
              </div>
            </div>
          )}
          
          {activeTab === 'MUSIC' && (
            <div style={{ 
              width: '100%', height: '100%', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              flexDirection: 'column', gap: '20px'
            }}>
              <h2 style={{ fontSize: '24px', letterSpacing: '2px', marginBottom: '40px' }}>音乐模式</h2>
              <div style={{ 
                padding: '40px', 
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                maxWidth: '500px',
                textAlign: 'center'
              }}>
                <p style={{ opacity: 0.7, marginBottom: '20px' }}>选择音乐文件来驱动粒子效果</p>
                <label style={{
                  padding: '12px 24px', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '30px', cursor: 'pointer', fontSize: '14px', letterSpacing: '1px'
                }}>
                  选择音乐文件
                  <input type="file" hidden accept="audio/*" />
                </label>
              </div>
            </div>
          )}
          
          {activeTab === 'INFO' && (
            <div style={{ 
              width: '100%', height: '100%', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              flexDirection: 'column', gap: '20px'
            }}>
              <h2 style={{ fontSize: '24px', letterSpacing: '2px', marginBottom: '40px' }}>关于</h2>
              <div style={{ 
                padding: '40px', 
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                maxWidth: '500px',
                textAlign: 'center'
              }}>
                <p style={{ opacity: 0.7, marginBottom: '20px' }}>粒子日记 v1.0</p>
                <p style={{ opacity: 0.5, fontSize: '14px', lineHeight: '1.6' }}>
                  一个基于 Three.js 的交互式粒子效果应用<br />
                  支持图片上传和音频响应<br />
                  保存您的美好记忆
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 底部控制台 */}
      <footer style={{ paddingBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 10 }}>
        
        {/* 麦克风录音键 */}
        <div onClick={handleMicrophoneClick} style={{
          width: '80px', height: '80px', borderRadius: '50%',
          border: `2px solid ${isRecording ? '#00ff66' : 'rgba(255, 255, 255, 0.6)'}`,
          boxShadow: isRecording ? '0 0 25px rgba(0, 255, 102, 0.3)' : '0 0 15px rgba(255, 255, 255, 0.1)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isRecording ? '#00ff66' : 'currentColor'} strokeWidth="1.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
        </div>

        {/* 状态操作行 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontSize: '13px', letterSpacing: '1px' }}>
          <span style={{ 
            opacity: 0.6, 
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '6px 12px',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>00:44</span>
          <span style={{ 
            cursor: 'pointer', 
            opacity: 0.9, 
            color: '#00ff66',
            fontWeight: '500',
            letterSpacing: '1.5px'
          }}>Save Memory &gt;</span>
          <div onClick={() => setImage(null)} style={{ 
             cursor: 'pointer', 
             color: '#ff4a4a', 
             width: '30px', 
             height: '30px', 
             borderRadius: '50%', 
             border: '1px solid rgba(255, 74, 74, 0.8)', 
             display: 'flex', 
             justifyContent: 'center', 
             alignItems: 'center', 
             fontSize: '12px',
             background: 'rgba(255, 74, 74, 0.1)'
          }}>✕</div>
        </div>

        {/* 重新上传入口 */}
        <label style={{ marginTop: '5px', fontSize: '11px', opacity: 0.4, cursor: 'pointer', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>&larr;</span> Upload Another
          <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
        </label>
      </footer>
    </div>
  );
}