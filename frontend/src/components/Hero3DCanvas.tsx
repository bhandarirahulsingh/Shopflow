import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3D, Sparkles } from 'lucide-react';

export const Hero3DCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1. Scene & Camera Setup
        const scene = new THREE.Scene();
        const width = container.clientWidth || 450;
        const height = container.clientHeight || 350;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 8.5);

        // 2. WebGL Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // 3. Studio Lighting Rig (Google Store Crisp Aesthetic)
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        // Key Light (Crisp White)
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
        keyLight.position.set(5, 6, 6);
        scene.add(keyLight);

        // Fill Light (Subtle Cool Blue)
        const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.8);
        fillLight.position.set(-5, 3, 4);
        scene.add(fillLight);

        // Rim Light (Top Edge Glow)
        const rimLight = new THREE.DirectionalLight(0x60a5fa, 2.2);
        rimLight.position.set(0, 6, -4);
        scene.add(rimLight);

        // 4. Procedural 3D Headphone Master Group
        const headphoneGroup = new THREE.Group();
        scene.add(headphoneGroup);

        // Premium PBR Materials
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            metalness: 0.9,
            roughness: 0.25,
        });

        const chromeAccent = new THREE.MeshStandardMaterial({
            color: 0x3b82f6, // Google Blue Metallic Accent
            metalness: 0.95,
            roughness: 0.15,
        });

        const cushionMaterial = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            metalness: 0.1,
            roughness: 0.85,
        });

        const goldRingMaterial = new THREE.MeshStandardMaterial({
            color: 0x60a5fa,
            metalness: 0.9,
            roughness: 0.2,
        });

        // A. Headband Arc
        const headbandCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1.8, 0.4, 0),
            new THREE.Vector3(-1.5, 1.8, 0),
            new THREE.Vector3(0, 2.3, 0),
            new THREE.Vector3(1.5, 1.8, 0),
            new THREE.Vector3(1.8, 0.4, 0),
        ]);
        const headbandGeo = new THREE.TubeGeometry(headbandCurve, 64, 0.16, 16, false);
        const headbandMesh = new THREE.Mesh(headbandGeo, metalMaterial);
        headphoneGroup.add(headbandMesh);

        // Headband Top Cushion Pad
        const cushionCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1.1, 1.9, 0),
            new THREE.Vector3(0, 2.22, 0),
            new THREE.Vector3(1.1, 1.9, 0),
        ]);
        const padGeo = new THREE.TubeGeometry(cushionCurve, 32, 0.19, 16, false);
        const padMesh = new THREE.Mesh(padGeo, cushionMaterial);
        headphoneGroup.add(padMesh);

        // Helper to construct symmetric Left & Right Ear-cups
        const createEarCup = (isRight: boolean) => {
            const sideGroup = new THREE.Group();
            const posX = isRight ? 1.85 : -1.85;

            // Outer Metallic Shell
            const shellGeo = new THREE.CylinderGeometry(0.85, 0.9, 0.5, 36);
            const shellMesh = new THREE.Mesh(shellGeo, metalMaterial);
            shellMesh.rotation.z = Math.PI / 2;
            sideGroup.add(shellMesh);

            // Chrome Accent Ring
            const ringGeo = new THREE.TorusGeometry(0.86, 0.04, 16, 48);
            const ringMesh = new THREE.Mesh(ringGeo, chromeAccent);
            ringMesh.rotation.y = Math.PI / 2;
            ringMesh.position.x = isRight ? 0.1 : -0.1;
            sideGroup.add(ringMesh);

            // Inner Soft Memory Cushion
            const cushionGeo = new THREE.TorusGeometry(0.72, 0.22, 24, 48);
            const cupCushion = new THREE.Mesh(cushionGeo, cushionMaterial);
            cupCushion.rotation.y = Math.PI / 2;
            cupCushion.position.x = isRight ? -0.22 : 0.22;
            sideGroup.add(cupCushion);

            // Center Acoustic Grill Disc
            const grillGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.04, 32);
            const grillMesh = new THREE.Mesh(grillGeo, goldRingMaterial);
            grillMesh.rotation.z = Math.PI / 2;
            grillMesh.position.x = isRight ? -0.2 : 0.2;
            sideGroup.add(grillMesh);

            // Swivel Yoke Mount
            const yokeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.6, 16);
            const yokeMesh = new THREE.Mesh(yokeGeo, chromeAccent);
            yokeMesh.position.set(0, 0.65, 0);
            sideGroup.add(yokeMesh);

            sideGroup.position.set(posX, 0.2, 0);
            sideGroup.rotation.y = isRight ? -0.15 : 0.15;
            sideGroup.rotation.z = isRight ? -0.1 : 0.1;

            return sideGroup;
        };

        headphoneGroup.add(createEarCup(false)); // Left Cup
        headphoneGroup.add(createEarCup(true));  // Right Cup

        // 5. Floating Ambient Particle Dust Field
        const particleCount = 120;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 12;
            positions[i + 1] = (Math.random() - 0.5) * 8;
            positions[i + 2] = (Math.random() - 0.5) * 6;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0x93c5fd,
            size: 0.045,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Initial Pose
        headphoneGroup.rotation.y = 0.6;
        headphoneGroup.rotation.x = 0.2;

        // 6. Interactive Cursor Tracking & Drag Controls
        let targetRotX = 0.2;
        let targetRotY = 0.6;
        let isDragging = false;
        let prevMouseX = 0;
        let prevMouseY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = e.clientX - prevMouseX;
                const deltaY = e.clientY - prevMouseY;
                targetRotY += deltaX * 0.01;
                targetRotX += deltaY * 0.01;
                prevMouseX = e.clientX;
                prevMouseY = e.clientY;
                return;
            }

            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            targetRotY = 0.6 + x * 0.8;
            targetRotX = 0.2 - y * 0.5;
        };

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            setIsInteracting(true);
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
        };

        const handleMouseUp = () => {
            isDragging = false;
            setIsInteracting(false);
        };

        const handleResize = () => {
            if (!container) return;
            const newW = container.clientWidth;
            const newH = container.clientHeight;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('resize', handleResize);

        // 7. 60 FPS Render Loop with Smooth Physics
        let animationFrameId: number;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Smooth Interpolation (LERP) for Mouse Parallax
            headphoneGroup.rotation.y += (targetRotY - headphoneGroup.rotation.y) * 0.06;
            headphoneGroup.rotation.x += (targetRotX - headphoneGroup.rotation.x) * 0.06;

            // Idle Floating / Breathing Motion
            if (!isDragging) {
                headphoneGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
                headphoneGroup.rotation.z = Math.sin(elapsedTime * 0.8) * 0.05;
            }

            // Particle Subtle Rotation
            particles.rotation.y = elapsedTime * 0.03;
            particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

            renderer.render(scene, camera);
        };

        animate();

        // 8. Cleanup on Unmount
        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('resize', handleResize);

            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            // Dispose Three.js Resources to free GPU memory
            renderer.dispose();
            headbandGeo.dispose();
            padGeo.dispose();
            particleGeo.dispose();
            metalMaterial.dispose();
            chromeAccent.dispose();
            cushionMaterial.dispose();
            goldRingMaterial.dispose();
            particleMat.dispose();
        };
    }, []);

    return (
        <div
            className="relative w-full h-[340px] sm:h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 3D WebGL Canvas Mount Node */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Interactive Control Pill */}
            <div
                className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/90 border border-gray-200/80 shadow-xs backdrop-blur-md flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 pointer-events-none transition-all duration-300 ${isHovered || isInteracting ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'
                    }`}
            >
                <Rotate3D className={`h-3.5 w-3.5 text-blue-600 ${isInteracting ? 'animate-spin' : ''}`} />
                <span>{isInteracting ? 'Rotating 3D Space...' : 'Click & Drag to Rotate in 3D'}</span>
            </div>

            {/* Top 3D Badge */}
            <div className="absolute top-2 right-4 px-2.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/60 text-[10px] font-bold text-blue-700 flex items-center gap-1 shadow-2xs backdrop-blur-xs">
                <Sparkles className="h-3 w-3 text-blue-600" />
                WebGL 3D Interactive
            </div>
        </div>
    );
};
