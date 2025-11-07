import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Simple test endpoint to verify URLs work
 */
export async function GET() {
  // Test với các URLs mẫu
  const testImages = [
    {
      filename: 'test-1.jpg',
      url: 'https://lh3.googleusercontent.com/drive-storage/AJQWtBO0u4FVBGMlJvQduZqLPLcyf_T0hdDt4UdBF0dxvPVyhUfF4ymytLovv_rrClMul7rFV_HzEQoSeFamXn5J96Tc6njnLMdpKha_Bq0HcQD1cDU',
      icon: 'https://lh3.googleusercontent.com/drive-storage/AJQWtBO0u4FVBGMlJvQduZqLPLcyf_T0hdDt4UdBF0dxvPVyhUfF4ymytLovv_rrClMul7rFV_HzEQoSeFamXn5J96Tc6njnLMdpKha_Bq0HcQD1cDU=s100',
      thumbnail: 'https://lh3.googleusercontent.com/drive-storage/AJQWtBO0u4FVBGMlJvQduZqLPLcyf_T0hdDt4UdBF0dxvPVyhUfF4ymytLovv_rrClMul7rFV_HzEQoSeFamXn5J96Tc6njnLMdpKha_Bq0HcQD1cDU=s190',
      gallery: 'https://lh3.googleusercontent.com/drive-storage/AJQWtBO0u4FVBGMlJvQduZqLPLcyf_T0hdDt4UdBF0dxvPVyhUfF4ymytLovv_rrClMul7rFV_HzEQoSeFamXn5J96Tc6njnLMdpKha_Bq0HcQD1cDU=s400',
      detail: 'https://lh3.googleusercontent.com/drive-storage/AJQWtBO0u4FVBGMlJvQduZqLPLcyf_T0hdDt4UdBF0dxvPVyhUfF4ymytLovv_rrClMul7rFV_HzEQoSeFamXn5J96Tc6njnLMdpKha_Bq0HcQD1cDU=s800',
      fullHD: 'https://lh3.googleusercontent.com/drive-storage/AJQWtBO0u4FVBGMlJvQduZqLPLcyf_T0hdDt4UdBF0dxvPVyhUfF4ymytLovv_rrClMul7rFV_HzEQoSeFamXn5J96Tc6njnLMdpKha_Bq0HcQD1cDU=s0',
    },
  ];

  return NextResponse.json({
    message: 'Test endpoint with sample URLs from your Google Drive',
    count: testImages.length,
    images: testImages,
  });
}
