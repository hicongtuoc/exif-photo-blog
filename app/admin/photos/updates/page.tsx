import AdminPhotosUpdateClient from '@/admin/AdminPhotosUpdateClient';
import { getPhotosInNeedOfUpdate } from '@/photo/query';

export const maxDuration = 60;

export default async function AdminUpdatesPage() {
  const photos = await getPhotosInNeedOfUpdate()
    .catch(() => []);

  return (
    <AdminPhotosUpdateClient {...{
      photos,
    }} />
  );
}
