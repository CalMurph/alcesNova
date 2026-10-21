'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GiStripedSun } from "react-icons/gi";


const navItems = [
   { href: '/create-instance', label: 'Create Instance' },
   { href: '/instances', label: 'My Instances' },
];

function NavLinks({ items, pathname }) {
   return (
      <nav className="hidden items-center gap-5 lg:flex">
         {items.map((item) => {
            const isActive = pathname === item.href ||
               (item.href !== '/' && pathname?.startsWith(`${item.href}/`));

            return (
               <Link
                  key={item.href}
                  href={item.href}
                  className={[
                     'text-md font-medium transition',
                     isActive ? 'text-purple-400' : 'text-slate-200 hover:text-purple-300'
                  ].join(' ')}
               >
                  {item.label}
               </Link>
            );
         })}
      </nav>
   );
}

function HeaderNavigation() {
   const pathname = usePathname();

   return (
      <>
         {pathname !== "/" && <NavLinks items={navItems} pathname={pathname} />}

         <div className='flex items-center gap-4'>
            {pathname === "/" ? (
               <>
                  <Link
                     href="/create-instance"
                     className="font-sans text-lg transition-opacity hover:opacity-90"
                  >
                     Log In
                  </Link>
                  <Link
                     href="/create-instance"
                     className="font-sans rounded-full border border-purple-400 bg-purple-400 px-2 py-2 text-md font-medium text-black transition-opacity hover:opacity-90"
                  >
                     Sign Up
                  </Link>
               </>
            ) : (
               <Link
                  href="/"
                  className="font-sans text-lg transition-opacity hover:opacity-90"
               >
                  Calum Murphy
               </Link>
            )}
         </div>
      </>
   );
}

export default function Header() {

   return (
      <header className="sticky top-0 z-50 flex h-16 items-center border-b border-white/15 bg-[#060816]/80 px-4 font-sans backdrop-blur-md">
         <div className="w-full ">
            <div className="flex w-full items-center justify-between px-8 lg:px-14 py-4 shadow-xl backdrop-blur-xl">
              

               <Link
                  href="/"
                  className="font-chalet text-2xl transition-opacity hover:opacity-90"
               >
                     <svg width="0" height="0" aria-hidden="true">
                  <defs>
                     <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ec4899" />
                     </linearGradient>
                  </defs>
               </svg>
                  <span className="inline-flex items-center gap-1 font-bold">
                     AlcesNova
                     <GiStripedSun
                        className="relative top-[2px]"
                        style={{ fill: "url(#sun-gradient)" }}
                     />
                  </span>
               </Link>


               <Suspense fallback={null}>
                  <HeaderNavigation />
               </Suspense>


            </div>

         </div>
      </header>
   );
}



