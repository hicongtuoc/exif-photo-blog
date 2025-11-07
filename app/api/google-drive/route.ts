import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface GoogleDriveImage {
  url: string;
  filename: string;
  thumbnail: string;
  gallery: string;
  detail: string;
  fullHD: string;
  icon: string;
}

/**
 * API Route to fetch and parse Google Drive folder images
 * 
 * Query parameters:
 * - folderId: Google Drive folder ID (required)
 * - size: Image size preset (optional) - 'icon' | 'thumbnail' | 'gallery' | 'detail' | 'fullhd'
 * 
 * Returns array of image objects with different size variants
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const sizePreset = searchParams.get('size') || 'gallery';

    if (!folderId) {
      return NextResponse.json(
        { error: 'folderId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch HTML from Google Drive embedded folder view
    const driveUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
    const response = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Google Drive folder' },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Extract image URLs from HTML
    const images = parseGoogleDriveImages(html);

    // If size parameter is provided, return URLs with that specific size
    if (sizePreset !== 'all') {
      const sizedImages = images.map(img => ({
        filename: img.filename,
        url: getSizedUrl(img.url, sizePreset),
      }));
      return NextResponse.json({
        folderId,
        size: sizePreset,
        count: sizedImages.length,
        images: sizedImages,
      });
    }

    // Return all size variants
    return NextResponse.json({
      folderId,
      count: images.length,
      images,
    });

  } catch (error) {
    console.error('Error fetching Google Drive images:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Parse Google Drive HTML to extract image URLs
 */
function parseGoogleDriveImages(html: string): GoogleDriveImage[] {
  const images: GoogleDriveImage[] = [];
  
  // Multiple patterns to match Google Drive image URLs
  const patterns = [
    // Pattern 1: googleusercontent.com with drive-storage
    /https:\/\/lh3\.googleusercontent\.com\/drive-storage\/[^"'\s)]+/g,
    // Pattern 2: googleusercontent.com with other paths
    /https:\/\/lh3\.googleusercontent\.com\/[^"'\s)]+/g,
    // Pattern 3: drive.google.com thumbnail URLs
    /https:\/\/drive\.google\.com\/thumbnail\?[^"'\s)]+/g,
  ];
  
  // Pattern to extract filenames - more flexible
  const filenamePatterns = [
    /(?:JPEG Image|PNG Image|Image)\s+([^<]+?)(?:\.jpg|\.jpeg|\.png|\.gif|\.JPG|\.JPEG|\.PNG|\.GIF)/gi,
    /alt="([^"]+\.(?:jpg|jpeg|png|gif))"/gi,
    /title="([^"]+\.(?:jpg|jpeg|png|gif))"/gi,
  ];
  
  let urls: string[] = [];
  
  // Try all URL patterns
  for (const pattern of patterns) {
    const matches = html.match(pattern) || [];
    if (matches.length > 0) {
      urls = [...urls, ...matches];
    }
  }
  
  // Remove duplicate URLs
  const uniqueUrls = [...new Set(urls)];
  
  // Extract filenames
  let filenames: string[] = [];
  for (const pattern of filenamePatterns) {
    const matches = [...html.matchAll(pattern)];
    if (matches.length > 0) {
      filenames = matches.map(m => m[1]);
      break;
    }
  }
  
  console.log(`Found ${uniqueUrls.length} unique image URLs`);
  console.log(`Found ${filenames.length} filenames`);
  
  if (uniqueUrls.length === 0) {
    console.warn('No image URLs found in HTML');
    console.log('HTML length:', html.length);
    console.log('First 1000 chars:', html.substring(0, 1000));
  } else {
    console.log('Sample URLs:', uniqueUrls.slice(0, 2));
  }
  
  uniqueUrls.forEach((url, index) => {
    // Extract base URL (remove size parameter)
    let baseUrl = url.replace(/[=&]s\d+$/, '').replace(/[=&]w\d+$/, '').replace(/[=&]h\d+$/, '');
    
    // Make sure URL doesn't end with = or &
    baseUrl = baseUrl.replace(/[=&]$/, '');
    
    const filename = filenames[index] || `image-${index + 1}`;
    
    // Build size URLs - ensure proper parameter separator
    const buildSizeUrl = (size: string) => {
      if (baseUrl.includes('?')) {
        return `${baseUrl}&${size}`;
      }
      return `${baseUrl}=${size}`;
    };
    
    images.push({
      url: baseUrl,
      filename,
      icon: buildSizeUrl('s100'),           // Icon size
      thumbnail: buildSizeUrl('s190'),      // Thumbnail (default Drive size)
      gallery: buildSizeUrl('s400'),        // Gallery view
      detail: buildSizeUrl('s800'),         // Detail view
      fullHD: buildSizeUrl('s0'),           // Full HD/4K (original size)
    });
  });
  
  return images;
}

/**
 * Get URL with specific size parameter
 */
function getSizedUrl(baseUrl: string, size: string): string {
  const cleanUrl = baseUrl.replace(/=s\d+$/, '');
  
  const sizeMap: Record<string, string> = {
    'icon': 's100',
    'thumbnail': 's190',
    'gallery': 's400',
    'detail': 's800',
    'fullhd': 's0',
    'full': 's0',
  };
  
  const sizeParam = sizeMap[size.toLowerCase()] || 's400';
  return `${cleanUrl}=${sizeParam}`;
}
