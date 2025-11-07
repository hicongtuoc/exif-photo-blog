import { redirect } from 'next/navigation';
import {
  getPhotoNoStore,
  getUniqueFilmsCached,
  getUniqueRecipesCached,
  getUniqueTagsCached,
} from '@/photo/cache';
import { PATH_ADMIN } from '@/app/path';
import PhotoEditPageClient from '@/photo/PhotoEditPageClient';
import {
  BLUR_ENABLED,
  IS_PREVIEW,
} from '@/app/config';
import { blurImageFromUrl, resizeImageFromUrl } from '@/photo/server';
import {
  getOptimizedPhotoUrlForManipulation,
  getStorageUrlsForPhoto,
} from '@/photo/storage';
import { getAlbumsWithMeta, getAlbumTitlesForPhoto } from '@/album/query';

export default async function PhotoEditPage({
  params,
}: {
  params: Promise<{ photoId: string }>
}) {
  const { photoId } = await params;

  const [
    photo,
    photoAlbumTitles,
    albums,
    uniqueTags,
    uniqueRecipes,
    uniqueFilms,
  ] = await Promise.all([
    getPhotoNoStore(photoId, true),
    getAlbumTitlesForPhoto(photoId),
    getAlbumsWithMeta(),
    getUniqueTagsCached(),
    getUniqueRecipesCached(),
    getUniqueFilmsCached(),
  ]);

  if (!photo) { redirect(PATH_ADMIN); }

  const photoStorageUrls = await getStorageUrlsForPhoto(photo);

  const blurData = BLUR_ENABLED
    ? await blurImageFromUrl(
      getOptimizedPhotoUrlForManipulation(photo.url, IS_PREVIEW),
    )
    : '';

  return (
    <PhotoEditPageClient {...{
      photo,
      photoStorageUrls,
      photoAlbumTitles,
      albums,
      uniqueTags,
      uniqueRecipes,
      uniqueFilms,
      blurData,
    }} />
  );
};
