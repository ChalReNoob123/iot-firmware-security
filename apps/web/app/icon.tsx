import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: '#08080A',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00F0FF',
          borderRadius: '6px',
          border: '1px solid #00F0FF',
          fontFamily: 'monospace',
          fontWeight: 900,
        }}
      >
        SF
      </div>
    ),
    {
      ...size,
    }
  );
}
