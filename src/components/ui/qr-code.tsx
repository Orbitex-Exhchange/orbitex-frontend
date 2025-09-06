import React, { useEffect, useRef } from 'react';

interface QRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({ 
  data, 
  size = 128, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!canvasRef.current || !data) return;

      try {
        // Simple QR code generation using a basic algorithm
        // In a real implementation, you would use a proper QR code library like qrcode
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);
        
        // Draw placeholder QR code pattern
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        
        // Draw white squares in a grid pattern
        ctx.fillStyle = '#fff';
        const gridSize = size / 8;
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 0) {
              ctx.fillRect(i * gridSize, j * gridSize, gridSize, gridSize);
            }
          }
        }
        
        // Add text
        ctx.fillStyle = '#000';
        ctx.font = `${size / 16}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', size / 2, size / 2);
        
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};
