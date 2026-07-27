import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

export interface PreviewImage {
  src: string;
  alt?: string;
  name?: string;
}

export interface ImageAnnotationSubmission {
  source: PreviewImage;
  guide: File;
}

interface PreviewPaneState {
  open: boolean;
  setOpen: (v: boolean) => void;
  image: PreviewImage | null;
  images: PreviewImage[];
  setImages: (images: PreviewImage[]) => void;
  openImage: (image: PreviewImage) => void;
  clearImage: () => void;
  annotationHandler: ((submission: ImageAnnotationSubmission) => void) | null;
  setAnnotationHandler: (
    handler: ((submission: ImageAnnotationSubmission) => void) | null
  ) => void;
}

const PreviewPaneCtx = createContext<PreviewPaneState | null>(null);

export function PreviewPaneProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<PreviewImage | null>(null);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [annotationHandler, setAnnotationHandlerState] = useState<
    ((submission: ImageAnnotationSubmission) => void) | null
  >(null);
  const openImage = useCallback((nextImage: PreviewImage) => {
    setImage(nextImage);
    setOpen(true);
  }, []);
  const clearImage = useCallback(() => setImage(null), []);
  const setAnnotationHandler = useCallback(
    (handler: ((submission: ImageAnnotationSubmission) => void) | null) => {
      setAnnotationHandlerState(() => handler);
    },
    []
  );
  const value = useMemo(
    () => ({
      open,
      setOpen,
      image,
      images,
      setImages,
      openImage,
      clearImage,
      annotationHandler,
      setAnnotationHandler,
    }),
    [
      open,
      image,
      images,
      openImage,
      clearImage,
      annotationHandler,
      setAnnotationHandler,
    ]
  );
  return (
    <PreviewPaneCtx.Provider value={value}>{children}</PreviewPaneCtx.Provider>
  );
}

export function usePreviewPane(): PreviewPaneState {
  return (
    useContext(PreviewPaneCtx) ?? {
      open: false,
      setOpen: () => {},
      image: null,
      images: [],
      setImages: () => {},
      openImage: () => {},
      clearImage: () => {},
      annotationHandler: null,
      setAnnotationHandler: () => {},
    }
  );
}
