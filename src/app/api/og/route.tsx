import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') ?? 'Documentation';
  const description = searchParams.get('description') ?? '';
  const spaceName = searchParams.get('spaceName') ?? '';
  const theme = searchParams.get('theme') ?? '#3B82F6';

  const truncatedDesc = description.length > 120
    ? description.slice(0, 120) + '…'
    : description;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#09090b',
          position: 'relative',
        }}
      >
        {/* Gradient accent bar on left */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '8px',
            background: `linear-gradient(to bottom, ${theme}, ${theme}88)`,
          }}
        />

        {/* Content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 80px',
            flex: 1,
          }}
        >
          {spaceName && (
            <div
              style={{
                fontSize: '24px',
                color: theme,
                marginBottom: '16px',
                fontWeight: 500,
              }}
            >
              {spaceName}
            </div>
          )}

          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#fafafa',
              lineHeight: 1.15,
              marginBottom: truncatedDesc ? '24px' : '0',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </div>

          {truncatedDesc && (
            <div
              style={{
                fontSize: '22px',
                color: '#a1a1aa',
                lineHeight: 1.5,
              }}
            >
              {truncatedDesc}
            </div>
          )}
        </div>

        {/* "Built with goBlink Book" bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            right: '40px',
            fontSize: '16px',
            color: '#52525b',
          }}
        >
          Built with goBlink Book
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
