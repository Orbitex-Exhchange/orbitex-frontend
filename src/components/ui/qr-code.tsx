'use client';

import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  data: string;
  size?: number;
  className?: string;
}

/**
 * Real, scannable QR code rendered to a canvas via the `qrcode` library.
 * Used for crypto deposit addresses.
 */
export const QRCode: React.FC<QRCodeProps> = ({ data, size = 176, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    QRCodeLib.toCanvas(
      canvasRef.current,
      data,
      {
        width: size,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#ffffff' },
      },
      (err) => {
        if (err) console.error('QR render error:', err);
      }
    );
  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`rounded-lg bg-white ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
      aria-label="Deposit address QR code"
    />
  );
};

export default QRCode;
