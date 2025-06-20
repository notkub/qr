
import React, { useEffect, forwardRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeCanvasProps {
  value: string;
  size?: number;
}

const QRCodeCanvas = forwardRef<HTMLCanvasElement, QRCodeCanvasProps>(
  ({ value, size = 200 }, ref) => {
    useEffect(() => {
      if (!ref || typeof ref === 'function') return;
      
      const canvas = ref.current;
      if (!canvas || !value) return;

      QRCode.toCanvas(canvas, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }, [value, size, ref]);

    return (
      <canvas
        ref={ref}
        className="border border-gray-200 rounded shadow-sm"
      />
    );
  }
);

QRCodeCanvas.displayName = 'QRCodeCanvas';

export default QRCodeCanvas;
