import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { X, Rotate3D, Plus, Check, ShieldCheck, Sun, Moon, Sparkles } from 'lucide-react';

interface Product3DModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export const Product3DModal: React.FC<Product3DModalProps> = ({ product, isOpen, onClose }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { addToCart } = useCart();
    const [lightingTheme, setLightingTheme] = useState<'STUDIO' | 'DARK' | 'CYBER'>('STUDIO');
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    useEffect(() => {
        if (!isOpen || !containerRef.current || !product) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // 1. Scene & Camera
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 7);

        // 2. Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        // 3. Lighting Rig
        const ambientLight = new THREE.AmbientLight(0xffffff, lightingTheme === 'DARK' ? 0.6 : 1.4);
        scene.add(ambientLight);

        const keyColor = lightingTheme === 'CYBER' ? 0x06b6d4 : 0xffffff;
        const keyLight = new THREE.DirectionalLight(keyColor, 3.0);
        keyLight.position.set(5, 5, 5);
        scene.add(keyLight);

        const rimColor = lightingTheme === 'CYBER' ? 0xec4899 : 0x60a5fa;
        const rimLight = new THREE.DirectionalLight(rimColor, 2.5);
        rimLight.position.set(-5, -3, -4);
        scene.add(rimLight);

        // 4. Procedural 3D Mesh Construction based on Category
        const productGroup = new THREE.Group();
        scene.add(productGroup);

        const primaryMat = new THREE.MeshStandardMaterial({
            color: lightingTheme === 'DARK' ? 0x1e293b : 0x334155,
            metalness: 0.9,
            roughness: 0.2,
        });

        const screenGlass = new THREE.MeshPhysicalMaterial({
            color: 0x0284c7,
            transmission: 0.6,
            opacity: 1,
            transparent: true,
            roughness: 0.1,
            ior: 1.5,
        });

        const accentMat = new THREE.MeshStandardMaterial({
            color: 0x2563eb,
            metalness: 0.95,
            roughness: 0.1,
        });

        const catName = product.categoryName?.toLowerCase() || '';

        if (catName.includes('phone') || catName.includes('tablet')) {
            // Smartphone / Tablet Model
            const bodyGeo = new THREE.BoxGeometry(2.0, 4.0, 0.22);
            const bodyMesh = new THREE.Mesh(bodyGeo, primaryMat);
            productGroup.add(bodyMesh);

            const screenGeo = new THREE.PlaneGeometry(1.85, 3.8);
            const screenMesh = new THREE.Mesh(screenGeo, screenGlass);
            screenMesh.position.z = 0.12;
            productGroup.add(screenMesh);

            // Camera Bump
            const bumpGeo = new THREE.BoxGeometry(0.7, 0.9, 0.08);
            const bumpMesh = new THREE.Mesh(bumpGeo, accentMat);
            bumpMesh.position.set(-0.55, 1.4, -0.15);
            productGroup.add(bumpMesh);
        } else if (catName.includes('laptop') || catName.includes('computer')) {
            // Laptop Open Shell Model
            const baseGeo = new THREE.BoxGeometry(3.6, 0.15, 2.4);
            const baseMesh = new THREE.Mesh(baseGeo, primaryMat);
            productGroup.add(baseMesh);

            const lidGeo = new THREE.BoxGeometry(3.6, 2.3, 0.08);
            const lidMesh = new THREE.Mesh(lidGeo, primaryMat);
            lidMesh.position.set(0, 1.1, -1.1);
            lidMesh.rotation.x = -0.3;
            productGroup.add(lidMesh);

            const screenGeo = new THREE.PlaneGeometry(3.4, 2.1);
            const screenMesh = new THREE.Mesh(screenGeo, screenGlass);
            screenMesh.position.set(0, 1.1, -1.05);
            screenMesh.rotation.x = -0.3;
            productGroup.add(screenMesh);
        } else if (catName.includes('watch') || catName.includes('wearable')) {
            // Smartwatch Model
            const caseGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.4, 36);
            const caseMesh = new THREE.Mesh(caseGeo, primaryMat);
            caseMesh.rotation.x = Math.PI / 2;
            productGroup.add(caseMesh);

            const screenGeo = new THREE.CircleGeometry(1.15, 36);
            const screenMesh = new THREE.Mesh(screenGeo, screenGlass);
            screenMesh.position.z = 0.21;
            productGroup.add(screenMesh);

            const strapGeo = new THREE.BoxGeometry(1.0, 3.8, 0.12);
            const strapMesh = new THREE.Mesh(strapGeo, accentMat);
            productGroup.add(strapMesh);
        } else {
            // Hardware Centerpiece / Audio Driver / Console
            const coreGeo = new THREE.TorusGeometry(1.5, 0.4, 24, 60);
            const coreMesh = new THREE.Mesh(coreGeo, primaryMat);
            productGroup.add(coreMesh);

            const discGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.2, 36);
            const discMesh = new THREE.Mesh(discGeo, accentMat);
            discMesh.rotation.x = Math.PI / 2;
            productGroup.add(discMesh);
        }

        // 5. Interactive Spherical Drag & Inertia
        let isDragging = false;
        let prevX = 0;
        let prevY = 0;
        let rotSpeedX = 0;
        let rotSpeedY = 0.005;

        const handleMouseDown = (e: MouseEvent) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaX = e.clientX - prevX;
            const deltaY = e.clientY - prevY;

            productGroup.rotation.y += deltaX * 0.01;
            productGroup.rotation.x += deltaY * 0.01;

            rotSpeedY = deltaX * 0.005;
            rotSpeedX = deltaY * 0.005;

            prevX = e.clientX;
            prevY = e.clientY;
        };

        const handleMouseUp = () => {
            isDragging = false;
        };

        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // 6. Animation Loop
        let animId: number;
        const animate = () => {
            animId = requestAnimationFrame(animate);

            if (!isDragging) {
                productGroup.rotation.y += rotSpeedY;
                productGroup.rotation.x += rotSpeedX;
                rotSpeedX *= 0.95;
                rotSpeedY = rotSpeedY * 0.98 + 0.002 * 0.02; // Gentle return to idle auto-spin
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animId);
            container.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [isOpen, product, lightingTheme]);

    if (!isOpen || !product) return null;

    const handleAddToCart = async () => {
        try {
            setIsAdding(true);
            await addToCart(product.id, 1);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 1500);
        } catch (err: any) {
            alert(err.message || 'Failed to add item to cart');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 z-20 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Left: 3D Viewport */}
                <div className="relative flex-1 h-[360px] md:h-[480px] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center cursor-grab active:cursor-grabbing border-b md:border-b-0 md:border-r border-gray-200">
                    <div ref={containerRef} className="w-full h-full" />

                    {/* Lighting Preset Controls */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 p-1 rounded-full bg-white/90 border border-gray-200 shadow-2xs backdrop-blur-xs">
                        <button
                            onClick={() => setLightingTheme('STUDIO')}
                            className={`p-1.5 rounded-full text-xs font-semibold transition-all ${lightingTheme === 'STUDIO' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            title="Studio Clean Light"
                        >
                            <Sun className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setLightingTheme('DARK')}
                            className={`p-1.5 rounded-full text-xs font-semibold transition-all ${lightingTheme === 'DARK' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            title="Titanium Studio"
                        >
                            <Moon className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setLightingTheme('CYBER')}
                            className={`p-1.5 rounded-full text-xs font-semibold transition-all ${lightingTheme === 'CYBER' ? 'bg-cyan-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            title="Neon Cyberpunk"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {/* Instruction Tag */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 border border-gray-200 text-[11px] font-semibold text-gray-600 flex items-center gap-1.5 shadow-2xs pointer-events-none">
                        <Rotate3D className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                        Drag to inspect in 360°
                    </div>
                </div>

                {/* Right: Product Details & Live Buy Bar */}
                <div className="w-full md:w-80 p-6 sm:p-8 flex flex-col justify-between bg-white">
                    <div>
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wide uppercase mb-2">
                            {product.categoryName}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">SKU: {product.sku}</p>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className="text-[10px] uppercase font-semibold text-gray-400 block tracking-wider">Price</span>
                            <span className="text-2xl font-extrabold text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-gray-600">
                            <p className="leading-relaxed">{product.description}</p>
                            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold pt-2">
                                <ShieldCheck className="h-4 w-4" />
                                <span>{product.availableStock} units ready for instant dispatch</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || product.availableStock <= 0}
                            className={`w-full py-3.5 rounded-full font-bold text-sm text-white shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 ${justAdded
                                ? 'bg-emerald-600'
                                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                }`}
                        >
                            {isAdding ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : justAdded ? (
                                <>
                                    <Check className="h-4 w-4 stroke-[2.5]" />
                                    Added to Cart!
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 stroke-[2.5]" />
                                    Add to Cart • ₹{Number(product.price).toLocaleString('en-IN')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
