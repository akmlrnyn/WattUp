import type { ReactNode } from "react";
import Link from "next/link";

import { publicAppConfig } from "@/config/public-app";
import { BrandWordmark } from "@/shared/presentation/components/brand-mark";

export type DocumentNavigationItem = {
  id: string;
  label: string;
};

interface WattUpLogoProps {
  priority?: boolean;
}

export function WattUpLogo({
  priority = false,
}: WattUpLogoProps) {
  return (
    <Link
      href="/about"
      aria-label="WattUp"
      className="group inline-flex items-center"
    >
      <BrandWordmark
        priority={priority}
        className="transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </Link>
  );
}

export function PublicPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FAF8] font-sans text-[#102D24]">
      <header className="sticky top-0 z-50 border-b border-[#102D24]/8 bg-[#F7FAF8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <WattUpLogo priority />

          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#52655E] md:flex">
            <Link
              href="/about"
              className="transition-colors hover:text-[#087A4D]"
            >
              Tentang
            </Link>

            <Link
              href="/privacy"
              className="transition-colors hover:text-[#087A4D]"
            >
              Privasi
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-[#087A4D]"
            >
              Ketentuan
            </Link>

            <Link
              href="/data-deletion"
              className="transition-colors hover:text-[#087A4D]"
            >
              Penghapusan data
            </Link>
          </nav>

          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#102D24] px-5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#087A4D] hover:shadow-lg"
          >
            Buka WattUp
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-[#102D24]/10 bg-white">
        <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-sm">
              <WattUpLogo />

              <p className="mt-5 text-sm leading-6 text-[#62736C]">
                Membantu pengguna kendaraan listrik membangun kebiasaan
                charging yang lebih terukur dan efisien.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
              <Link
                href="/about"
                className="font-semibold hover:text-[#087A4D]"
              >
                Tentang WattUp
              </Link>

              <Link
                href="/privacy"
                className="font-semibold hover:text-[#087A4D]"
              >
                Kebijakan Privasi
              </Link>

              <Link
                href="/terms"
                className="font-semibold hover:text-[#087A4D]"
              >
                Ketentuan Layanan
              </Link>

              <Link
                href="/data-deletion"
                className="font-semibold hover:text-[#087A4D]"
              >
                Penghapusan Data
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-3 border-t border-[#102D24]/10 pt-6 text-xs text-[#71817B] sm:flex-row">
            <p>
              © {new Date().getFullYear()} WattUp. All rights reserved.
            </p>

            <a
              href={`mailto:${publicAppConfig.supportEmail}`}
              className="hover:text-[#087A4D]"
            >
              {publicAppConfig.supportEmail}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

type DocumentHeroProps = {
  category: string;
  title: string;
  description: string;
};

export function DocumentHero({
  category,
  title,
  description,
}: DocumentHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#102D24]/8 bg-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-[#CFF7E3] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-[#E9F8EF] blur-3xl" />

      <div className="relative mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#087A4D]/15 bg-[#EAF8F1] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#087A4D]">
            <span className="h-2 w-2 rounded-full bg-[#13C77A]" />
            {category}
          </div>

          <h1 className="mt-7 max-w-3xl text-5xl font-black tracking-[-0.055em] text-[#102D24] sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#60716A] sm:text-xl">
            {description}
          </p>

          <p className="mt-8 text-sm font-semibold text-[#7A8983]">
            Terakhir diperbarui {publicAppConfig.lastUpdated}
          </p>
        </div>
      </div>
    </section>
  );
}

type DocumentLayoutProps = {
  navigation: DocumentNavigationItem[];
  children: ReactNode;
};

export function DocumentLayout({
  navigation,
  children,
}: DocumentLayoutProps) {
  return (
    <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,760px)] lg:justify-between">
        <aside>
          <div className="sticky top-28">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#87958F]">
              Di halaman ini
            </p>

            <nav className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-3 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 rounded-full border border-[#102D24]/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#52655E] transition hover:border-[#087A4D]/30 hover:bg-[#EAF8F1] hover:text-[#087A4D] lg:block lg:rounded-xl lg:border-transparent lg:bg-transparent"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-8 hidden rounded-2xl bg-[#102D24] p-5 text-white lg:block">
              <p className="text-sm font-bold">
                Ada pertanyaan?
              </p>

              <p className="mt-2 text-xs leading-5 text-white/65">
                Hubungi kami mengenai akun, privasi, atau penggunaan
                data WattUp.
              </p>

              <a
                href={`mailto:${publicAppConfig.supportEmail}`}
                className="mt-4 inline-flex text-xs font-bold text-[#6EF0AF] hover:text-white"
              >
                Hubungi WattUp →
              </a>
            </div>
          </div>
        </aside>

        <article className="rounded-[28px] border border-[#102D24]/10 bg-white px-6 shadow-[0_24px_80px_rgba(16,45,36,0.06)] sm:px-10">
          {children}
        </article>
      </div>
    </section>
  );
}

type LegalSectionProps = {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
};

export function LegalSection({
  id,
  number,
  title,
  children,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-b border-[#102D24]/10 py-9 first:pt-10 last:border-0 last:pb-10"
    >
      <div className="flex gap-4 sm:gap-6">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF8F1] text-xs font-black text-[#087A4D]">
          {number}
        </span>

        <div className="min-w-0">
          <h2 className="text-xl font-black tracking-[-0.025em] text-[#102D24] sm:text-2xl">
            {title}
          </h2>

          <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#60716A] sm:text-base">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}