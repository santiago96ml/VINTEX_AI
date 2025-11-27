import React, { useEffect, useRef } from 'react';

// Definimos la interfaz para mejor seguridad de tipos
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const ParticleNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Configuración Cyber Tech
    const particles: Particle[] = []; // CORRECCIÓN 1: Inicialización correcta del array
    const particleCount = Math.min(width * 0.15, 100); 
    const connectionDistance = 150;
    const color = '0, 255, 153'; // #00FF99

    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Actualizar y dibujar partículas
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // CORRECCIÓN 2: Arreglado el operador OR (||) y los saltos de línea rotos
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Dibujar nodo (puntos)
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.7)`;
        ctx.fill();

        // Dibujar conexiones (Red Neuronal)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color}, ${1 - dist / connectionDistance})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(animate);
    };

    animate(); // Iniciar animación

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      // Opcional: Podrías querer reinicializar las partículas aquí si se deforma mucho
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // CORRECCIÓN 3: Array de dependencias vacío cerrado correctamente

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-40 bg-tech-black"
    />
  );
};