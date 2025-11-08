"use client";

import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

interface CanvasRevealEffectProps {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
}

const DotMatrix = ({
  colors = [[0, 0, 0]],
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  totalSize = 4,
  dotSize = 2,
  animationSpeed = 1,
}: {
  colors?: number[][];
  opacities?: number[];
  totalSize?: number;
  dotSize?: number;
  animationSpeed?: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const { size } = useThree();

  const positions = useMemo(() => {
    const pos: [number, number, number][] = [];
    const half = totalSize / 2;
    const gap = totalSize / 20;

    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const x = -half + i * gap;
        const y = -half + j * gap;
        pos.push([x, y, 0]);
      }
    }
    return pos;
  }, [totalSize]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * animationSpeed * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {positions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <circleGeometry args={[dotSize / 100, 32]} />
          <meshBasicMaterial
            color={new THREE.Color(...colors[idx % colors.length])}
            transparent
            opacity={opacities[idx % opacities.length]}
          />
        </mesh>
      ))}
    </group>
  );
};

export const CanvasRevealEffect = ({
  animationSpeed = 0.4,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[59, 130, 246]], // Blue color for Curious Quench
  containerClassName,
  dotSize = 2,
  showGradient = true,
}: CanvasRevealEffectProps) => {
  return (
    <div className={cn("h-full relative bg-white w-full", containerClassName)}>
      <div className="h-full w-full">
        <Canvas
          camera={{
            position: [0, 0, 5],
            fov: 50,
          }}
        >
          <DotMatrix
            colors={colors}
            dotSize={dotSize}
            opacities={opacities}
            animationSpeed={animationSpeed}
          />
        </Canvas>
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-[84%] pointer-events-none" />
      )}
    </div>
  );
};

export const Card = ({
  title,
  icon,
  children,
  revealChildren,
}: {
  title?: string | React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  revealChildren?: React.ReactNode;
}) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-black/[0.2] group/canvas-card flex items-center justify-center dark:border-white/[0.2] max-w-sm w-full mx-auto p-4 relative h-[30rem] relative"
    >
      <Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full absolute inset-0"
          >
            {revealChildren}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20">
        <div className="text-center group-hover/canvas-card:-translate-y-4 group-hover/canvas-card:opacity-0 transition duration-200 w-full mx-auto flex items-center justify-center">
          {icon}
        </div>
        <h2 className="dark:text-white text-xl opacity-0 group-hover/canvas-card:opacity-100 relative z-10 text-black mt-4 font-bold group-hover/canvas-card:text-white group-hover/canvas-card:-translate-y-2 transition duration-200">
          {title}
        </h2>
        <div className="opacity-0 group-hover/canvas-card:opacity-100 relative z-10 mt-4 group-hover/canvas-card:text-white transition duration-200">
          {children}
        </div>
      </div>
    </div>
  );
};

const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

import { motion, AnimatePresence } from "framer-motion";
