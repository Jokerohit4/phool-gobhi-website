import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const alt = 'Phool Gobhi — Pay-Per-Session Gym Access, No Membership';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const mascot = await readFile(join(process.cwd(), 'public/broc-mascot.png'));
  const mascotSrc = `data:image/png;base64,${mascot.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbf8f1',
          backgroundImage: 'linear-gradient(135deg, #fbf8f1 0%, #f1ecdd 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mascotSrc} width={160} height={160} alt="" />
        <div
          style={{
            marginTop: 32,
            fontSize: 72,
            fontWeight: 700,
            color: '#16a34a',
            display: 'flex',
          }}
        >
          Phool Gobhi
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 34,
            color: '#a8432a',
            display: 'flex',
          }}
        >
          Pay Per Session. No Membership.
        </div>
      </div>
    ),
    { ...size },
  );
}
