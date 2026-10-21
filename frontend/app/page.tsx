"use client";

import Image from "next/image";
import Marquee from "react-fast-marquee";
import Link from "next/link";
import { useRouter } from "next/navigation";

const software = [
  { name: "Python", src: "/images/python.svg" },
  { name: "R", src: "/images/R.svg" },
  { name: "Node.js", src: "/images/node.svg" },
  { name: "PyTorch", src: "/images/pytorch.svg" },
  { name: "TensorFlow", src: "/images/tensorFlow.svg" },
  { name: "LaTeX", src: "/images/latex.svg" },
];

export default function Home() {
  const router = useRouter()
  async function handleLogIn() {
    const res = await fetch("http://10.151.0.58:3000/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "john",
        password: "moosehead",
      }),

    
    });

    if (!res.ok) {
      return
    }

    router.push('/create-instance')

  
  }

  return (
    <main className="relative -mx-4 -my-10 min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#060816] sm:-mx-6">
      <div
        aria-hidden="true"
        className="starry-sky pointer-events-none absolute inset-0"
      />

      {/* Nebula background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 65% 60% at 50% 45%,
                rgba(139, 92, 246, 0.35) 0%,
                rgba(59, 130, 246, 0.20) 30%,
                rgba(168, 85, 247, 0.10) 55%,
                transparent 100%
              )
            `,
          }}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 text-center">
        {/* Main content - centred independently */}
        <div className="flex flex-col items-center">
          <h1 className="font-chalet bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text pb-4 text-6xl font-bold leading-normal text-transparent md:text-6xl">
            AlcesNova
          </h1>

          <p className="max-w-xl text-2xl text-gray-100">
            Launch your research environment in seconds. Ready when you are.
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleLogIn}
              className="mt-10 rounded-full border cursor-pointer border-purple-400 bg-white/10 px-8 py-3 font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Log In
            </button>
            <Link
              href="/instances"
              className="mt-10 rounded-full border cursor-pointer border-amber-300 bg-amber-400/10 px-8 py-3 font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Software carousel - positioned independently */}
        <div className="mt-14 w-full">
          <div className="mb-7 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-400">
              Your tools. Already installed.
            </p>
          </div>

          <div className="relative w-full overflow-hidden">
            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#060816] to-transparent md:w-40" />

            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#060816] to-transparent md:w-40" />

            <Marquee speed={30} gradient={false} autoFill>
              {software.map(({ name, src }) => (
                <div
                  key={name}
                  className="mx-7 flex h-20 w-40 items-center justify-center"
                >
                  <Image
                    src={src}
                    alt={`${name} logo`}
                    width={160}
                    height={64}
                    className={`max-h-16 w-auto max-w-full object-contain brightness-0 invert ${
                      name === "Python" ? "scale-200" : ""
                    }`}
                  />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </section>
    </main>
  );
}
