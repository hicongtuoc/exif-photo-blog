import { useCallback, useState } from 'react';
import { PhotoFormData, formHasExistingAiTextContent } from '.';

export default function usePhotoFormParent({
  photoForm,
  imageThumbnailBase64,
}: {
  photoForm?: Partial<PhotoFormData>
  imageThumbnailBase64?: string,
}) {
  const [pending, setIsPending] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [shouldConfirmAiTextGeneration, _setShouldConfirmAiTextGeneration] =
    useState(formHasExistingAiTextContent(photoForm));

  const setShouldConfirmAiTextGeneration = useCallback(
    (updatedFormData: Partial<PhotoFormData>) => {
      _setShouldConfirmAiTextGeneration(
        formHasExistingAiTextContent(updatedFormData),
      );
    }, []);

  return {
    pending,
    setIsPending,
    updatedTitle,
    setUpdatedTitle,
    shouldConfirmAiTextGeneration,
    setShouldConfirmAiTextGeneration,
  };
}
