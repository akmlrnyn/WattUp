import type { Metadata } from "next";
import Link from "next/link";

import { PublicPageShell } from "@/components/public/public-page-shell";
import { publicAppConfig } from "@/config/public-app";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "WattUp membantu pengguna kendaraan listrik memahami kebiasaan charging, penggunaan energi, dan potensi penghematan.",
  alternates: {
    canonical: "/",
  },
};

const features = [
  {
    number: "01",
    title: "Catat charging",
    description:
      "Simpan waktu, durasi, dan energi dari setiap sesi charging kendaraan listrik.",
  },
  {
    number: "02",
    title: "Pahami pola",
    description:
      "Lihat distribusi charging pada waktu off-peak dan peak secara lebih jelas.",
  },
  {
    number: "03",
    title: "Ukur dampak",
    description:
      "Pantau energi yang berhasil dialihkan dan estimasi penghematan biaya listrik.",
  },
];

const chartValues = [34, 52, 45, 72, 58, 84, 66];
const chartLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -right-44 -top-52 h-[600px] w-[600px] rounded-full bg-[#C9F8E0] blur-3xl" />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#087A4D]/15 bg-[#EAF8F1] px-4 py-2 text-xs font-bold text-[#087A4D]">
              <span className="h-2 w-2 rounded-full bg-[#13C77A]" />

              <span>
                Charging smarter, one session at a time
              </span>
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.06em] text-[#102D24] sm:text-6xl lg:text-[76px]">
              Kenali energi yang menggerakkan perjalananmu.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#60716A]">
              WattUp membantu pengguna kendaraan listrik mencatat sesi
              charging, memahami pola konsumsi, dan membangun kebiasaan
              charging yang lebih efisien.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
  href="/sign-in"
  className="inline-flex h-12 items-center justify-center rounded-full bg-[#087A4D] px-7 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#06633E] hover:shadow-xl"
>
 <p className="text-white">Mulai dengan WattUp</p> 
</Link>

              <Link
                href="/privacy"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#102D24]/15 bg-white px-7 text-sm font-bold text-[#102D24] transition-colors hover:border-[#087A4D]/40 hover:bg-[#F1FAF5]"
              >
                Cara kami menjaga data
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px]">
            <div className="absolute -inset-6 rounded-[44px] bg-[#E3F8EC]" />

            <div className="relative overflow-hidden rounded-[36px] bg-[#102D24] p-7 text-white shadow-[0_40px_100px_rgba(16,45,36,0.24)] sm:p-9">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6EF0AF] text-[#102D24]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 3v4m8-4v4M6 7h12v2.5a6 6 0 0 1-6 6v5.5m-3 0h6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <span className="text-lg font-black tracking-tight">
                    WattUp
                  </span>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                  Minggu ini
                </span>
              </div>

              <div className="mt-14">
                <p className="text-sm font-medium text-white/55">
                  Energi dialihkan
                </p>

                <p className="mt-2 text-6xl font-black tracking-[-0.06em]">
                  55
                  <span className="ml-2 text-2xl tracking-normal text-[#6EF0AF]">
                    kWh
                  </span>
                </p>
              </div>

              <div className="mt-10 flex h-44 items-end gap-3">
                {chartValues.map((height, index) => (
                  <div
                    key={`${chartLabels[index]}-${height}`}
                    className="flex-1 rounded-t-xl bg-gradient-to-t from-[#0EA968] to-[#6EF0AF]"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-7 text-center text-[10px] font-semibold text-white/40">
                {chartLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <div>
                  <p className="text-xs text-white/50">
                    Off-peak rate
                  </p>

                  <p className="mt-1 text-xl font-black">
                    63,2%
                  </p>
                </div>

                <span className="rounded-full bg-[#6EF0AF] px-3 py-1.5 text-xs font-black text-[#102D24]">
                  On track
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#087A4D]">
            Dibuat untuk kejelasan
          </p>

          <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#102D24] sm:text-5xl">
            Dari catatan sederhana menjadi kebiasaan yang lebih baik.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group rounded-[28px] border border-[#102D24]/10 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#087A4D]/25 hover:shadow-[0_24px_70px_rgba(16,45,36,0.08)]"
            >
              <span className="text-xs font-black tracking-[0.16em] text-[#13A868]">
                {feature.number}
              </span>

              <h3 className="mt-12 text-2xl font-black tracking-[-0.035em] text-[#102D24]">
                {feature.title}
              </h3>

              <p className="mt-3 leading-7 text-[#60716A]">
                {feature.description}
              </p>

              <div className="mt-8 h-1 w-10 rounded-full bg-[#DDF5E8] transition-all duration-300 group-hover:w-20 group-hover:bg-[#13C77A]" />
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="grid overflow-hidden rounded-[36px] bg-[#DDF7E9] lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#087A4D]">
              Privacy by design
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#102D24]">
              Datamu tetap menjadi milikmu.
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-[#526A61]">
              WattUp menggunakan informasi akun hanya untuk
              autentikasi, personalisasi, keamanan, dan menjalankan
              fungsi utama aplikasi. Kami tidak menjual data pribadi
              pengguna.
            </p>

            <Link
              href="/privacy"
              className="mt-8 inline-flex items-center gap-2 text-sm font-black text-[#087A4D] transition-all hover:gap-3"
            >
              Pelajari kebijakan kami
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="flex min-h-80 items-center justify-center bg-[#0B7B4E] p-10">
            <div className="w-full max-w-sm rounded-[28px] border border-white/15 bg-white/10 p-7 text-white backdrop-blur">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6EF0AF] text-[#102D24]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    d="M7 10V8a5 5 0 0 1 10 0v2m-9 0h8a2 2 0 0 1 2 2v7H6v-7a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="mt-8 text-2xl font-black tracking-tight">
                Informasi dasar saja.
              </p>

              <p className="mt-3 leading-7 text-white/65">
                Google digunakan untuk login dengan scope dasar berupa
                identitas akun, nama, email, dan foto profil.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#102D24]/10 bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-[#102D24]">
              WattUp dikembangkan secara independen.
            </p>

            <p className="mt-1 text-sm text-[#71817B]">
              WattUp bukan layanan resmi PLN atau produsen kendaraan.
            </p>
          </div>

          <a
            href={`mailto:${publicAppConfig.supportEmail}`}
            className="text-sm font-bold text-[#087A4D]"
          >
            {publicAppConfig.supportEmail}
          </a>
        </div>
      </section>
    </PublicPageShell>
  );
}
