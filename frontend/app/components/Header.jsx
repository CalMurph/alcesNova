
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { GiStripedSun } from "react-icons/gi";
import { Galaxy, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { duneFont } from "../fonts";


const navItems = [
   { href: "/home", label: "Overview", position: "top" },
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
   const router = useRouter()
   const pathname = usePathname()

   async function handleLogOut() {
      try {
         const res = await fetch("/api/backend/v1/users/logout", {
            credentials: "include",
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
         });

         if (!res.ok) {
            throw new Error(`Logout failed: ${res.status}`);
         }

         setMenuOpen(false);
         router.replace("/");
         router.refresh();
      } catch (error) {
         console.error("Logout error:", error);
      }
   }

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
                  className={`group inline-flex items-center gap-2 ${duneFont.className} text-lg  text-white`}
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

               {pathname !== "/" && pathname !== "/login" && (
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
               )}
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


                        <h2 className={`${duneFont.className} text-center text-xl font-normal tracking-wider text-white transition-colors group-hover:text-purple-300 sm:text-4xl`}>
                           Alces Nova
                        </h2>
                     </Link>

                     {/* Orbital navigation links */}
                     <nav aria-label="Main">
                        {navItems.map((item, index) => {
                           const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                           return (
                              <div
                                 key={item.href}
                                 className={`absolute z-20 ${positions[item.position]}`}
                              >
                                 <Link
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`group relative flex items-center justify-center whitespace-nowrap rounded-full border bg-[#080b1c] px-3 py-2 font-chalet text-sm transition-[color,border-color,box-shadow,scale] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400 sm:px-6 sm:py-3 sm:text-2xl ${isActive ? "nova-link-enter-selected scale-110 border-purple-400 text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.35)]" : "nova-link-enter border-purple-400/45 text-slate-200 shadow-[0_0_16px_rgba(168,85,247,0.12)] hover:scale-110 hover:border-purple-400 hover:text-purple-300 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]"}`}
                                    style={{ animationDelay: `${150 + index * 100}ms` }}
                                 >
                                    {item.label}
                                 </Link>


                                 
                              </div>
                           );
                        })}

                        {/* Log out */}
                        <div
                           className={`absolute z-20 ${positions.bottom}`}
                        >
                           <button
                              type="button"
                              onClick={handleLogOut}
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
                     className="absolute right-6 top-6 cursor-pointer rounded-full p-2 text-slate-300 transition-all duration-300 hover:rotate-90 hover:text-purple-400 focus-visible:outline-2 border-2 border-purple-400 focus-visible:outline-none sm:right-10 sm:top-8"
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

               @keyframes nova-link-selected {
                from {
                  opacity: 0;
                  scale: 0.7;

                }
                to {
                  opacity: 1;
                  scale: 1.1;
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
                animation: nova-link-in 500ms ease-out backwards;
              }

               .nova-link-enter-selected {
                animation: nova-link-selected 500ms ease-out backwards;
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
                .nova-link-enter-selected,
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

