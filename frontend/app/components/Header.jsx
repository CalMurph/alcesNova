// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { GiStripedSun } from "react-icons/gi";
// import { Galaxy } from 'lucide-react';

// const navItems = [
//    { href: '/create-instance', label: 'Create Instance' },
//    { href: '/instances', label: 'All Instances' },
// ];

// export default function Header() {
//    const [menuOpen, setMenuOpen] = useState(false);

//    return (
//       <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b border-white/15 bg-[#060816]/80 font-semibold backdrop-blur-md">
//          <div className="w-full ">
//             <div className="flex w-full items-center justify-between px-8 lg:px-14 py-4 shadow-xl backdrop-blur-xl">


//                <Link
//                   href="/"
//                   className="font-dune text-lg transition-opacity "
//                >
//                   <svg width="0" height="5" aria-hidden="true">
//                      <defs>
//                         <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                            <stop offset="0%" stopColor="#3b82f6" />
//                            <stop offset="50%" stopColor="#a855f7" />
//                            <stop offset="100%" stopColor="#ec4899" />
//                         </linearGradient>
//                      </defs>
//                   </svg>
//                   <span className="inline-flex items-center gap-1 font-bold">
//                      <p className='transition-opacity hover:opacity-[0.8]'>Alces Nova</p>
//                      <GiStripedSun

//                         style={{ fill: "url(#sun-gradient)" }}
//                      />
//                   </span>
//                </Link>


//                <button
//                   type="button"
//                   aria-label={menuOpen ? "Close menu" : "Open menu"}
//                   aria-expanded={menuOpen}
//                   onClick={() => setMenuOpen((open) => !open)}
//                   className="rounded-full p-1 text-white/90 transition-colors hover:text-purple-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400"
//                >
//                   <Galaxy size={35} strokeWidth={1} aria-hidden="true" className="transition-transform duration-800 hover:rotate-180"  />
//                </button>


//             </div>

//          </div>

//          {menuOpen && (
//             <div
//                id="header-menu"
//                aria-label="Main menu"
//                className="fixed inset-0 z-50 flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#080b1c]"
//             >
//                {/* Background glow */}



//                <div className="relative flex h-[320px] w-[320px] items-center  justify-center sm:h-[600px] sm:w-[600px]">


//                   <div className="pointer-events-none absolute inset-[0%]  rounded-full border border-dotted border-6 border-purple-400/60" />


//                   <div className="relative z-10 flex items-center justify-center rounded-full  ">
//                      <h2 className="font-dune  text-center text-xl font-bold text-white sm:text-4xl">
//                         Alces Nova
//                      </h2>
//                   </div>


//                   <Link
//                      href="#"
//                      className="absolute left-1/2 top-[-10] -translate-x-1/2 bg-[#080b1c] border rounded-full py-1 px-3 font-chalet text-2xl text-slate-200 transition hover:scale-110 hover:text-purple-400"
//                   >
//                      Overview
//                   </Link>


//                   <Link
//                      href="#"
//                      className="absolute right-[-70] top-1/2 -translate-y-1/2 bg-[#080b1c] border rounded-full px-3  py-1 font-chalet text-2xl text-slate-200 transition hover:scale-110 hover:text-purple-400"
//                   >
//                      Instances
//                   </Link>


//                   <Link
//                      href="#"
//                      className="absolute bottom-[-10] left-1/2 -translate-x-1/2 border rounded-full py-1 px-3   bg-[#080b1c] px-3 font-chalet text-2xl text-amber-200/70  transition hover:scale-110 hover:text-amber-400"
//                   >
//                      Log Out
//                   </Link>


//                   <Link
//                      href="/create-instance"
//                      onClick={() => setMenuOpen(false)}
//                      className="absolute left-[-60] top-1/2 -translate-y-1/2 bg-[#080b1c]  border rounded-full py-1 px-3  font-chalet text-2xl text-slate-200 transition hover:scale-110 hover:text-purple-400"
//                   >
//                      Launch
//                   </Link>
//                </div>

//                {/* Close button */}
//                <button
//                   type="button"
//                   onClick={() => setMenuOpen(false)}
//                   aria-label="Close menu"
//                   className="absolute right-8 top-8 cursor-pointer text-3xl text-slate-300 transition hover:text-purple-400"
//                >
//                   ×
//                </button>
//             </div>
//          )}

//       </header>
//    );
// }



"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { GiStripedSun } from "react-icons/gi";
import { Galaxy, X } from "lucide-react";

const navItems = [
   { href: "/", label: "Overview", position: "top" },
   { href: "/instances", label: "Instances", position: "right" },
   { href: "/create-instance", label: "Launch", position: "left" },
];

const positions = {
   top: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
   right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
   bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
   left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

export default function Header() {
   const [menuOpen, setMenuOpen] = useState(false);
   const closeButtonRef = useRef(null);

   useEffect(() => {
      if (!menuOpen) return;

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      closeButtonRef.current?.focus();

      function handleKeyDown(event) {
         if (event.key === "Escape") {
            setMenuOpen(false);
         }
      }

      window.addEventListener("keydown", handleKeyDown);

      return () => {
         document.body.style.overflow = previousOverflow;
         window.removeEventListener("keydown", handleKeyDown);
      };
   }, [menuOpen]);

   return (
      <>
         <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-white/15 bg-[#060816]/80 font-semibold backdrop-blur-md">
            <div className="flex w-full items-center justify-between px-6 lg:px-14">
               <Link
                  href="/"
                  className="group inline-flex items-center gap-2 font-dune text-lg text-white"
               >
                  <svg
                     width="0"
                     height="0"
                     className="absolute"
                     aria-hidden="true"
                  >
                     <defs>
                        <linearGradient
                           id="sun-gradient"
                           x1="0%"
                           y1="0%"
                           x2="100%"
                           y2="100%"
                        >
                           <stop offset="0%" stopColor="#3b82f6" />
                           <stop offset="50%" stopColor="#a855f7" />
                           <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                     </defs>
                  </svg>

                  <span className="transition-opacity group-hover:opacity-70">
                     Alces Nova
                  </span>

                  <GiStripedSun
                     size={20}
                     style={{ fill: "url(#sun-gradient)" }}
                     aria-hidden="true"
                  />
               </Link>

               <button
                  type="button"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                  aria-controls="header-menu"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="group cursor-pointer rounded-full p-2 text-white/90 transition-colors hover:text-purple-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400"
               >
                  <Galaxy
                     size={35}
                     strokeWidth={1}
                     aria-hidden="true"
                     className="transition-transform duration-700 group-hover:rotate-180"
                  />
               </button>
            </div>
         </header>

         {menuOpen &&
            typeof document !== "undefined" &&
            createPortal(
               <div
                  id="header-menu"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Main navigation"
                  className="nova-menu-enter fixed inset-0 z-[100] flex h-dvh w-full items-center justify-center overflow-hidden bg-[#080b1c] text-white"
               >
                  {/* Ambient background glow */}
                  <div
                     aria-hidden="true"
                     className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[110px]"
                  />

                  {/* Orbit container */}
                  <div className="relative flex aspect-square w-[min(62vw,490px)] min-w-[190px] items-center justify-center sm:w-[min(65vw,580px)]">
                     {/* Rotating dotted orbit */}
                     <div
                        aria-hidden="true"
                        className="nova-orbit-spin pointer-events-none absolute inset-0 rounded-full"
                        style={{
                           background:
                              "conic-gradient(from 0deg, #3b82f6, #a855f7, #ec4899, #a855f7, #3b82f6)",
                           mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
                           WebkitMask:
                              "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
                        }}
                     />

                     {/* Dotted ring overlay */}
                     <div
                        aria-hidden="true"
                        className="nova-orbit-spin-reverse pointer-events-none absolute inset-[7px] rounded-full border-2 border-dotted border-purple-400/35"
                     />

                     {/* Central branding */}
                     <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className="nova-centre-enter group relative z-10 flex flex-col items-center gap-3"
                     >
                      

                        <h2 className="font-dune text-center text-xl font-bold tracking-wider text-white transition-colors group-hover:text-purple-300 sm:text-4xl">
                           Alces Nova
                        </h2>
                     </Link>

                     {/* Orbital navigation links */}
                     <nav aria-label="Main">
                        {navItems.map((item, index) => (
                           <div
                              key={item.href}
                              className={`absolute z-20 ${positions[item.position]}`}
                           >
                              <Link
                                 href={item.href}
                                 onClick={() => setMenuOpen(false)}
                                 className="nova-link-enter group relative flex items-center justify-center whitespace-nowrap rounded-full border border-purple-400/45 bg-[#080b1c] px-3 py-2 font-chalet text-sm text-slate-200 shadow-[0_0_16px_rgba(168,85,247,0.12)] transition-[color,border-color,box-shadow,scale] duration-300 hover:scale-110 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 sm:px-6 sm:py-3 sm:text-2xl"
                                 style={{
                                    animationDelay: `${150 + index * 100}ms`,
                                 }}
                              >
                                 {item.label}
                              </Link>
                           </div>
                        ))}

                        {/* Log out */}
                        <div
                           className={`absolute z-20 ${positions.bottom}`}
                        >
                           <button
                              type="button"
                              onClick={() => {
                                 // Connect this to your authentication sign-out action.
                                 setMenuOpen(false);
                              }}
                              className="nova-link-enter cursor-pointer whitespace-nowrap rounded-full border border-amber-400/60 bg-[#080b1c] px-3 py-2 font-chalet text-sm text-amber-200 transition-all duration-300 hover:scale-110 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.2)] sm:px-6 sm:py-3 sm:text-2xl" style={{ animationDelay: "450ms" }}
                           >
                              Log Out
                           </button>
                        </div>
                     </nav>
                  </div>

                  {/* Close button */}
                  <button
                     ref={closeButtonRef}
                     type="button"
                     onClick={() => setMenuOpen(false)}
                     aria-label="Close menu"
                     className="absolute right-6 top-6 cursor-pointer rounded-full p-2 text-slate-300 transition-all duration-300 hover:rotate-90 hover:text-purple-400 focus-visible:outline-2 focus-visible:outline-purple-400 sm:right-10 sm:top-8"
                  >
                     <X size={30} strokeWidth={1.5} />
                  </button>

                  <style jsx global>{`
              @keyframes nova-menu-in {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }

              @keyframes nova-centre-in {
                from {
                  opacity: 0;
                  transform: scale(0.85);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              @keyframes nova-link-in {
                from {
                  opacity: 0;
                  scale: 0.7;
                  
                }
                to {
                  opacity: 1;
                  scale: 1;
                  filter: blur(0);
                }
              }

              @keyframes nova-spin {
                to {
                  transform: rotate(360deg);
                }
              }

              @keyframes nova-spin-reverse {
                to {
                  transform: rotate(-360deg);
                }
              }

              .nova-menu-enter {
                animation: nova-menu-in 350ms ease-out both;
              }

              .nova-centre-enter {
                animation: nova-centre-in 600ms ease-out both;
              }

              .nova-link-enter {
                animation: nova-link-in 500ms ease-out both;
              }

              .nova-orbit-spin {
                animation: nova-spin 90s linear infinite;
              }

              .nova-orbit-spin-reverse {
                animation: nova-spin-reverse 120s linear infinite;
              }

              @media (prefers-reduced-motion: reduce) {
                .nova-menu-enter,
                .nova-centre-enter,
                .nova-link-enter,
                .nova-orbit-spin,
                .nova-orbit-spin-reverse {
                  animation: none;
                }
              }
            `}</style>
               </div>,
               document.body
            )}
      </>
   );
}

