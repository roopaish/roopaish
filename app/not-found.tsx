"use client";

import { Button } from "@/components/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <>
      <div
        className={`
          dark:bg-background
          relative min-h-screen overflow-hidden bg-black
        `}
      >
        <div className="relative pt-40">
          <div>
            <div className="text-center text-gray-50">
              <div className="relative">
                <h1
                  style={{
                    textShadow: "-8px 0 0 rgb(102 123 242)",
                  }}
                  className={`
                    tracking-tighter-less text-shadow relative font-sans text-9xl font-bold
                  `}
                >
                  <span>4</span>
                  <span>0</span>
                  <span>4</span>
                </h1>
                <span className="absolute top-0 -ml-12 font-semibold text-gray-300">
                  Oops!
                </span>
              </div>
              <h5 className="relative -top-2 left-5 font-semibold text-gray-300">
                Page not found
              </h5>
              <p className="mt-2 mb-6 text-gray-100">
                We are sorry, but the page you requested was not found
              </p>
              <div className="flex items-center justify-center gap-2">
                <Link href={"/"}>
                  <Button>Go Home</Button>
                </Link>
                <Button
                  variant={"secondary"}
                  onClick={() => {
                    router.back();
                  }}
                >
                  Go back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
