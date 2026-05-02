"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

import ProductGallery from "@/components/product-gallery";
import StoreBadge from "@/components/store-badge";
import { projects } from "@/data/projects";
import { useBreakpoints } from "@/hooks/use-breakpoints";
import { cn } from "@/lib/utils";

export default function ProductsLaunched() {
  const AUTOPLAY_INTERVAL_MS = 5000;
  const { isMdUp } = useBreakpoints();
  const shouldReduceMotion = useReducedMotion();
  const [currentProduct, setCurrentProduct] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [openGalleryProduct, setOpenGalleryProduct] = useState<number | null>(
    null,
  );
  const canGoPrev = currentProduct > 0;
  const canGoNext = currentProduct < projects.length - 1;
  const activeGalleryProduct =
    openGalleryProduct !== null ? projects[openGalleryProduct] : null;
  const isCurrentProductAppOnly = projects[currentProduct].links.every(
    (link) => link.platform !== "web",
  );

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: isMdUp ? 0.68 : 0.52, ease: [0.25, 0.46, 0.45, 0.94] as const };
  const shouldAutoplay =
    !shouldReduceMotion && !isHovered && openGalleryProduct === null;

  useEffect(() => {
    if (!shouldAutoplay) return;

    const intervalId = window.setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % projects.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [AUTOPLAY_INTERVAL_MS, shouldAutoplay]);

  function onPrevProduct() {
    if (!canGoPrev) return;
    setCurrentProduct((prev) => prev - 1);
    setOpenGalleryProduct(null);
  }

  function onNextProduct() {
    if (!canGoNext) return;
    setCurrentProduct((prev) => prev + 1);
    setOpenGalleryProduct(null);
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative min-h-52.5 overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentProduct * 100}%` }}
          transition={transition}
          style={{ willChange: "transform" }}
        >
          {projects.map((product, index) => {
            const images = product.images.length
              ? product.images
              : [product.image];
            return (
              <div
                key={product.name}
                className="w-full shrink-0 grow-0 basis-full"
              >
                <div className="flex md:flex-row flex-col items-start gap-4">
                  <Image
                    src={images[0]}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="aspect-square rounded-xl h-50 w-auto object-cover border border-black/10"
                  />

                  <div className="flex-1">
                    <h3 className="text-sm md:text-base leading-tight font-medium text-black/90">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs md:text-sm text-black/55">
                      {product.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.links.map((link) => (
                        <a
                          key={`${product.name}-${link.platform}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex"
                          aria-label={link.platform}
                        >
                          <StoreBadge
                            platform={link.platform}
                            comingSoon={link.comingSoon}
                          />
                        </a>
                      ))}
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setOpenGalleryProduct(index)}
                        className="text-xs md:text-sm underline underline-offset-4 text-black/80 hover:text-black transition-colors"
                      >
                        Open gallery
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="md:absolute mt-4 md:mt-0 right-0 bottom-0 flex items-center justify-end gap-1.5">
        <span className="text-xs">
          {currentProduct + 1} of {projects.length}
        </span>
        <button
          type="button"
          aria-label="Previous product"
          onClick={onPrevProduct}
          disabled={!canGoPrev}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full transition-colors",
            canGoPrev ? "bg-black text-white" : "bg-transparent text-black/30",
          )}
        >
          <ArrowLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next product"
          onClick={onNextProduct}
          disabled={!canGoNext}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full transition-colors",
            canGoNext ? "bg-black text-white" : "bg-transparent text-black/30",
          )}
        >
          <ArrowRightIcon className="size-4" />
        </button>
      </div>

      <ProductGallery
        name={activeGalleryProduct?.name ?? ""}
        images={activeGalleryProduct?.images ?? []}
        isOpen={openGalleryProduct !== null}
        onClose={() => setOpenGalleryProduct(null)}
        grid={isCurrentProductAppOnly ? 2 : 1}
      />
    </div>
  );
}
