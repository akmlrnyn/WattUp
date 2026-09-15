import type { Metadata } from "next";

import {
  DocumentHero,
  PublicPageShell,
} from "@/components/public/public-page-shell";
import { publicAppConfig } from "@/config/public-app";

export const metadata: Metadata = {
  title: "Penghapusan Data | WattUp",
  description:
    "Ajukan permintaan penghapusan akun dan data WattUp.",
};

const steps = [
  {
    number: "01",
    title: "Kirim permintaan",
    description:
      "Hubungi WattUp menggunakan alamat email yang terhubung dengan akunmu.",
  },
  {
    number: "02",
    title: "Verifikasi akun",
    description:
      "Kami akan memastikan bahwa permintaan berasal dari pemilik akun yang sah.",
  },
  {
    number: "03",
    title: "Data dihapus",
    description:
      "Profil, kendaraan, sesi charging, dan statistik terkait akan diproses untuk dihapus.",
  },
];

export default function DataDeletionPage() {
  const subject = encodeURIComponent(
    "Permintaan penghapusan akun WattUp",
  );

  const body = encodeURIComponent(
    [
      "Halo tim WattUp,",
      "",
      "Saya ingin meminta penghapusan akun dan data WattUp saya.",
      "",
      "Nama:",
      "Email akun:",
      "",
      "Terima kasih.",
    ].join("\n"),
  );

  const deletionEmailHref =
    `mailto:${publicAppConfig.supportEmail}` +
    `?subject=${subject}&body=${body}`;

  return (
    <PublicPageShell>
      <DocumentHero
        category="Kontrol Data"
        title="Hapus akun dan datamu kapan saja."
        description="Kami membuat proses penghapusan data tetap sederhana, transparan, dan aman dari permintaan pihak yang tidak berwenang."
      />

      <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-[28px] border border-[#102D24]/10 bg-white p-7 shadow-[0_20px_60px_rgba(16,45,36,0.05)]"
            >
              <span className="text-xs font-black tracking-[0.16em] text-[#13A868]">
                {step.number}
              </span>

              <h2 className="mt-10 text-xl font-black tracking-[-0.03em]">
                {step.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#60716A]">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid overflow-hidden rounded-[36px] bg-[#102D24] text-white lg:grid-cols-[1fr_0.8fr]">
          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6EF0AF]">
              Mulai permintaan
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Gunakan email yang sama dengan akun WattUp.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-white/65">
              Cantumkan nama dan email akun. Kami dapat meminta
              verifikasi tambahan untuk melindungi akun dari
              penghapusan oleh pihak lain.
            </p>

            <a
              href={deletionEmailHref}
              className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-[#6EF0AF] px-7 text-sm font-black text-[#102D24] transition hover:-translate-y-0.5 hover:bg-white"
            >
              Ajukan penghapusan
            </a>
          </div>

          <div className="border-t border-white/10 bg-white/5 p-8 sm:p-12 lg:border-l lg:border-t-0">
            <p className="text-sm font-bold">
              Data yang akan diproses
            </p>

            <ul className="mt-5 space-y-4 text-sm text-white/65">
              {[
                "Profil dan preferensi akun",
                "Informasi kendaraan listrik",
                "Catatan sesi charging",
                "Statistik dan progress",
                "Hubungan autentikasi Google",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6EF0AF] text-[10px] font-black text-[#102D24]">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#102D24]/10 bg-white p-7 sm:p-8">
            <h2 className="text-xl font-black tracking-[-0.03em]">
              Bagaimana dengan backup?
            </h2>

            <p className="mt-3 leading-7 text-[#60716A]">
              Data tertentu mungkin tersimpan sementara dalam backup
              sistem dan akan dihapus mengikuti jadwal retensi
              infrastruktur, kecuali penyimpanan diwajibkan oleh hukum
              atau diperlukan untuk keamanan.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#087A4D]/15 bg-[#EAF8F1] p-7 sm:p-8">
            <h2 className="text-xl font-black tracking-[-0.03em]">
              Cabut akses Google
            </h2>

            <p className="mt-3 leading-7 text-[#526A61]">
              Kamu juga dapat memutuskan koneksi WattUp dari pengaturan
              akun Google. Tindakan ini tidak selalu otomatis menghapus
              data yang telah tersimpan di WattUp.
            </p>

            <a
              href="https://myaccount.google.com/connections"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#087A4D]"
            >
              Buka koneksi akun Google
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}