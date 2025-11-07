import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Debug endpoint to view raw Google Drive HTML
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || '1Twox6YsD_VyH_mHCivskyEtlAUK_uYna';

    const driveUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
    
    const response = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch', status: response.status },
        { status: response.status }
      );
    }

    const html = await response.text();
    
    // Extract URLs for debugging
    const urlPattern = /https:\/\/lh3\.googleusercontent\.com\/[^"'\s)]+/g;
    const urls = html.match(urlPattern) || [];
    
    return new NextResponse(
      `
<!DOCTYPE html>
<html>
<head>
  <title>Google Drive Debug</title>
  <style>
    body { font-family: monospace; padding: 20px; }
    pre { background: #f5f5f5; padding: 10px; overflow: auto; }
    .url { color: blue; word-break: break-all; }
    .section { margin: 20px 0; border: 1px solid #ddd; padding: 10px; }
  </style>
</head>
<body>
  <h1>Google Drive HTML Debug</h1>
  
  <div class="section">
    <h2>Folder ID: ${folderId}</h2>
    <p>URL: <a href="${driveUrl}" target="_blank">${driveUrl}</a></p>
  </div>
  
  <div class="section">
    <h2>Found URLs (${urls.length})</h2>
    ${urls.map((url, i) => `
      <div>
        <strong>${i + 1}.</strong> 
        <a href="${url}" target="_blank" class="url">${url}</a>
        <br/>
        <img src="${url.replace(/[=&]s\d+/, '=s200')}" style="max-width: 200px; margin: 10px 0;" />
      </div>
    `).join('<hr/>')}
  </div>
  
  <div class="section">
    <h2>Raw HTML (first 5000 chars)</h2>
    <pre>${html.substring(0, 5000).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
  
  <div class="section">
    <h2>Full HTML Length</h2>
    <p>${html.length} characters</p>
  </div>
</body>
</html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
