# Google Drive Image API

API để fetch và parse HTML từ Google Drive, trích xuất các link ảnh với nhiều kích thước khác nhau.

## 🚀 Tính năng

- ✅ Fetch ảnh từ Google Drive folder public
- ✅ Tự động parse HTML và trích xuất image URLs
- ✅ Hỗ trợ nhiều kích thước ảnh (s100, s190, s400, s800, s0)
- ✅ API Route tối ưu với Edge Runtime
- ✅ TypeScript support đầy đủ
- ✅ Demo page để test

## 📋 Kích thước ảnh được hỗ trợ

| Tên | Kích thước | Mục đích sử dụng |
|-----|-----------|------------------|
| `icon` | s100 | Icon, avatar nhỏ |
| `thumbnail` | s190 | Thumbnail (mặc định của Drive) |
| `gallery` | s400 | Xem nhanh trong gallery |
| `detail` | s800 | Xem chi tiết |
| `fullhd` / `full` | s0 | Full HD/4K (kích thước gốc) |

## 🔧 Cách sử dụng

### 1. API Endpoint

```typescript
GET /api/google-drive?folderId=YOUR_FOLDER_ID&size=gallery
```

**Parameters:**
- `folderId` (required): Google Drive folder ID
- `size` (optional): Kích thước ảnh mong muốn (`icon` | `thumbnail` | `gallery` | `detail` | `fullhd` | `all`)
  - Mặc định: `gallery`
  - Nếu `size=all`: Trả về tất cả các size variants

**Response:**
```json
{
  "folderId": "1Twox6YsD_VyH_mHCivskyEtlAUK_uYna",
  "count": 6,
  "images": [
    {
      "url": "https://lh3.googleusercontent.com/drive-storage/...",
      "filename": "IMG_4688",
      "icon": "https://lh3.googleusercontent.com/drive-storage/...=s100",
      "thumbnail": "https://lh3.googleusercontent.com/drive-storage/...=s190",
      "gallery": "https://lh3.googleusercontent.com/drive-storage/...=s400",
      "detail": "https://lh3.googleusercontent.com/drive-storage/...=s800",
      "fullHD": "https://lh3.googleusercontent.com/drive-storage/...=s0"
    }
  ]
}
```

### 2. Client-side Usage

```typescript
import { fetchGoogleDriveImages, getGoogleDriveImageUrl } from '@/utility/google-drive';

// Fetch tất cả ảnh với all size variants
const images = await fetchGoogleDriveImages('YOUR_FOLDER_ID');

// Fetch ảnh với kích thước cụ thể
const galleryImages = await fetchGoogleDriveImages('YOUR_FOLDER_ID', 'gallery');

// Sử dụng trong component
{images.map(image => (
  <img 
    src={image.gallery} 
    alt={image.filename}
    loading="lazy"
  />
))}

// Hoặc dùng helper function
{images.map(image => (
  <img 
    src={getGoogleDriveImageUrl(image, 'detail')} 
    alt={image.filename}
  />
))}
```

### 3. Server-side Usage

```typescript
// In Server Component or API Route
export async function GET() {
  const response = await fetch(
    'http://localhost:3000/api/google-drive?folderId=YOUR_FOLDER_ID&size=gallery'
  );
  const data = await response.json();
  return data.images;
}
```

### 4. Custom Size

```typescript
import { createCustomSizeUrl } from '@/utility/google-drive';

const baseUrl = 'https://lh3.googleusercontent.com/drive-storage/...';

// Tạo URL với kích thước tùy chỉnh
const size600 = createCustomSizeUrl(baseUrl, 600);  // =s600
const size1200 = createCustomSizeUrl(baseUrl, 1200); // =s1200
const original = createCustomSizeUrl(baseUrl, 0);    // =s0
```

## 🎨 Demo Page

Truy cập `/google-drive-demo` để xem demo và test API.

Demo page bao gồm:
- Input để nhập Google Drive folder ID
- Nút chọn kích thước ảnh
- Grid hiển thị ảnh
- Xem tất cả URLs cho mỗi ảnh

## 📝 Lấy Google Drive Folder ID

Từ URL Google Drive folder, lấy phần ID:

```
https://drive.google.com/drive/folders/1Twox6YsD_VyH_mHCivskyEtlAUK_uYna
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        This is the folder ID
```

Hoặc sử dụng helper function:

```typescript
import { extractFolderId } from '@/utility/google-drive';

const folderId = extractFolderId(
  'https://drive.google.com/drive/folders/1Twox6YsD_VyH_mHCivskyEtlAUK_uYna'
);
// Returns: '1Twox6YsD_VyH_mHCivskyEtlAUK_uYna'
```

## ⚠️ Lưu ý

1. **Folder phải được set public**: Folder Google Drive cần được chia sẻ công khai (Anyone with the link can view)
2. **Rate limiting**: Google Drive có thể giới hạn số request, nên cache kết quả nếu cần
3. **CORS**: API route sử dụng server-side fetch nên không bị CORS issues
4. **Performance**: Sử dụng Edge Runtime để tối ưu performance

## 🔄 Responsive Images

Sử dụng các kích thước khác nhau cho responsive design:

```typescript
<picture>
  <source 
    media="(max-width: 640px)" 
    srcSet={image.thumbnail} 
  />
  <source 
    media="(max-width: 1024px)" 
    srcSet={image.gallery} 
  />
  <source 
    media="(min-width: 1025px)" 
    srcSet={image.detail} 
  />
  <img 
    src={image.gallery} 
    alt={image.filename}
    loading="lazy"
  />
</picture>
```

## 📦 Files Created

```
app/
  api/
    google-drive/
      route.ts              # API endpoint
  google-drive-demo/
    page.tsx               # Demo page

src/
  utility/
    google-drive.ts        # Helper functions
```

## 🤝 Integration với EXIF Photo Blog

Có thể tích hợp API này để:
1. Import ảnh từ Google Drive vào photo blog
2. Sử dụng làm CDN cho ảnh
3. Sync ảnh tự động từ Drive folder
4. Gallery backup/mirror

## 📄 License

Same as the main project.
