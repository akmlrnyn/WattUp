import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { publicAppConfig } from "@/config/public-app";

export type DocumentNavigationItem = {
  id: string;
  label: string;
};

export function WattUpLogo() {
  return (
    <Link
      href="/"
      aria-label="Kembali ke halaman utama WattUp"
      className="inline-flex shrink-0 items-center transition-opacity hover:opacity-80"
    >
      <Image
        src="/brand/wattup-logo.png"
        alt="WattUp"
        width={960}
        height={412}
        priority
        className="h-auto w-[108px] sm:w-[124px]"
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
    <div className="min-h-screen overflow-x-clip bg-[#F7FAF8] font-sans text-[#102D24]">
      <header className="sticky top-0 z-50 border-b border-[#102D24]/10 bg-[#F7FAF8]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-6 lg:px-8">
          <WattUpLogo />

          <nav
            aria-label="Navigasi utama"
            className="hidden items-center gap-7 text-sm font-semibold text-[#52655E] lg:flex"
          >
            <Link
              href="/"
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
            href="/sign-in"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#102D24] px-4 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#087A4D] hover:shadow-lg sm:h-11 sm:px-5 sm:text-sm"
          >
            <span className="sm:hidden">Masuk</span>
            <span className="hidden sm:inline text-white">Buka WattUp</span>
          </Link>
        </div>
      </header>

      <main className="min-w-0">{children}</main>

      <footer className="border-t border-[#102D24]/10 bg-white">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div className="max-w-sm">
              <WattUpLogo />

              <p className="mt-5 text-sm leading-6 text-[#62736C]">
                Membantu pengguna kendaraan listrik membangun kebiasaan
                charging yang lebih terukur dan efisien.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-4 text-sm sm:grid-cols-2">
              <Link
                href="/"
                className="font-semibold transition-colors hover:text-[#087A4D]"
              >
                Tentang WattUp
              </Link>

              <Link
                href="/privacy"
                className="font-semibold transition-colors hover:text-[#087A4D]"
              >
                Kebijakan Privasi
              </Link>

              <Link
                href="/terms"
                className="font-semibold transition-colors hover:text-[#087A4D]"
              >
                Ketentuan Layanan
              </Link>

              <Link
                href="/data-deletion"
                className="font-semibold transition-colors hover:text-[#087A4D]"
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
              className="break-all transition-colors hover:text-[#087A4D]"
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
    <section className="relative overflow-hidden border-b border-[#102D24]/10 bg-white">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[360px] w-[360px] rounded-full bg-[#CFF7E3] blur-3xl sm:h-[440px] sm:w-[440px]" />

      <div className="pointer-events-none absolute -left-32 bottom-0 h-56 w-56 rounded-full bg-[#E9F8EF] blur-3xl sm:h-64 sm:w-64" />

      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="max-w-4xl">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#087A4D]/15 bg-[#EAF8F1] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#087A4D] sm:px-4 sm:text-xs sm:tracking-[0.16em]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#13C77A]" />
            <span className="truncate">{category}</span>
          </div>

          <h1 className="mt-6 max-w-3xl break-words text-4xl font-black tracking-[-0.045em] text-[#102D24] sm:mt-7 sm:text-6xl sm:tracking-[-0.055em] lg:text-7xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[#60716A] sm:mt-7 sm:text-xl sm:leading-8">
            {description}
          </p>

          <p className="mt-6 text-xs font-semibold text-[#7A8983] sm:mt-8 sm:text-sm">
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
    <section className="w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-20">
      <div className="mx-auto grid w-full max-w-[1240px] min-w-0 gap-8 lg:grid-cols-[220px_minmax(0,760px)] lg:justify-between lg:gap-12">
        <aside className="min-w-0 max-w-full">
          <div className="lg:sticky lg:top-28">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#87958F] lg:mb-4">
              Di halaman ini
            </p>

            <nav
              aria-label="Navigasi dokumen"
              className="flex max-w-full snap-x gap-2 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:space-y-1 lg:overflow-visible lg:pb-0"
            >
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 snap-start whitespace-nowrap rounded-full border border-[#102D24]/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#52655E] transition hover:border-[#087A4D]/30 hover:bg-[#EAF8F1] hover:text-[#087A4D] lg:block lg:whitespace-normal lg:rounded-xl lg:border-transparent lg:bg-transparent"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-8 hidden rounded-2xl bg-[#102D24] p-5 text-white lg:block">
              <p className="text-sm font-bold">Ada pertanyaan?</p>

              <p className="mt-2 text-xs leading-5 text-white/65">
                Hubungi kami mengenai akun, privasi, atau penggunaan
                data WattUp.
              </p>

              <a
                href={`mailto:${publicAppConfig.supportEmail}`}
                className="mt-4 inline-flex text-xs font-bold text-[#6EF0AF] transition-colors hover:text-white"
              >
                Hubungi WattUp →
              </a>
            </div>
          </div>
        </aside>

        <article className="min-w-0 w-full max-w-full overflow-hidden rounded-3xl border border-[#102D24]/10 bg-white px-4 shadow-[0_20px_60px_rgba(16,45,36,0.06)] sm:rounded-[28px] sm:px-8 lg:px-10 lg:shadow-[0_24px_80px_rgba(16,45,36,0.06)]">
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
      className="scroll-mt-28 border-b border-[#102D24]/10 py-7 first:pt-8 last:border-0 last:pb-8 sm:scroll-mt-32 sm:py-9 sm:first:pt-10 sm:last:pb-10"
    >
      <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3 sm:gap-6">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF8F1] text-xs font-black text-[#087A4D]">
          {number}
        </span>

        <div className="min-w-0">
          <h2 className="break-words text-lg font-black tracking-[-0.025em] text-[#102D24] sm:text-2xl">
            {title}
          </h2>

          <div className="mt-4 min-w-0 space-y-4 break-words text-[15px] leading-7 text-[#60716A] [overflow-wrap:anywhere] sm:text-base">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}