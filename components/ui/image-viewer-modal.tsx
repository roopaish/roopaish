"use client";

import { useEffect } from "react";
import Image from "next/image";

type ImageViewerModalProps = {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
};

export default function ImageViewerModal({
  isOpen,
  imageSrc,
  imageAlt,
  onClose,
}: ImageViewerModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div
        className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-md bg-black/60 px-3 py-1 text-sm font-medium text-white"
        >
          Close
        </button>

        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1600}
          height={1000}
          className="h-[75vh] w-full object-contain"
        />
      </div>
    </div>
  );
}
