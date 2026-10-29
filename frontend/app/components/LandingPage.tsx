"use client";

import Image from "next/image";
import Marquee from "react-fast-marquee";
import { MdLaunch } from "react-icons/md";
import Link from "next/link";

import SpaceBackground from "./SpaceBackground";
import MooseConstellation from "./MooseConstellation";
import { duneFont } from "../fonts";

const software = [
  { name: "Python", src: "/images/softwareLogos/python.svg" },
  { name: "R", src: "/images/softwareLogos/r.svg" },
  { name: "Node.js", src: "/images/softwareLogos/node.svg" },
  { name: "PyTorch", src: "/images/softwareLogos/pytorch.svg" },
  { name: "TensorFlow", src: "/images/softwareLogos/tensorFlow.svg" },
  { name: "LaTeX", src: "/images/softwareLogos/latex.svg" },
];

export default function LandingPage() {



  return (
    <main className="relative -mx-4 -my-10 min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#060816] sm:-mx-6">

      {/* Procedural background */}
      <SpaceBackground />

      {/* Hero */}
      <section className="relative z-10 flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 text-center">
        <MooseConstellation />

        {/* Main content */}
        <div className="relative z-10 flex mt-14 translate-y-[clamp(3rem,10vh,6rem)] flex-col items-center">
          <h1
            className={`${duneFont.className} pb-2 text-3xl font-normal leading-normal text-[#F7FAFF] md:text-5xl`}
            style={{ textShadow: "0 2px 18px rgba(4, 7, 19, 0.9)" }}
          >
            Alces Nova
          </h1>

          <p className="max-w-xl text-2xl text-gray-100">
            Launch your research environment in seconds. Ready when you are.
          </p>

          <div className="flex gap-4">

            <Link
            href="/login"
            
              className=" flex items-center gap-2 mt-4 cursor-pointer rounded-full border border-transparent bg-white text-black px-8 py-2 backdrop-blur-md transition font-bold hover:bg-white/20"
            >
             Launch your computer <MdLaunch />
             
            </Link>

            {/* <Link
              href="/instances"
              className="mt-10 cursor-pointer rounded-full border border-amber-300 bg-amber-400/10 px-8 py-3 font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Sign Up
            </Link> */}

          </div>
        </div>

        {/* Software carousel */}
        <div className="relative z-10 mt-14 w-full translate-y-[clamp(3rem,10vh,6rem)]">

          <div className="mb-7 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-400">
              Your tools. Ready to go.
            </p>
          </div>

          <div className="relative w-full overflow-hidden">

            {/* Fade edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#040713] to-transparent md:w-40" />

            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#040713] to-transparent md:w-40" />

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
