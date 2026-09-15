import type { Metadata } from "next";
import Link from "next/link";

import {
  DocumentHero,
  DocumentLayout,
  LegalSection,
  PublicPageShell,
} from "@/components/public/public-page-shell";
import { publicAppConfig } from "@/config/public-app";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | WattUp",
  description:
    "Penjelasan mengenai cara WattUp mengakses, menggunakan, menyimpan, dan melindungi data pengguna.",
};

const navigation = [
  {
    id: "information",
    label: "Informasi yang dikumpulkan",
  },
  {
    id: "usage",
    label: "Penggunaan data",
  },
  {
    id: "google",
    label: "Data Google",
  },
  {
    id: "providers",
    label: "Penyedia layanan",
  },
  {
    id: "cookies",
    label: "Cookies dan session",
  },
  {
    id: "security",
    label: "Keamanan",
  },
  {
    id: "retention",
    label: "Retensi data",
  },
  {
    id: "rights",
    label: "Hak pengguna",
  },
  {
    id: "contact",
    label: "Kontak",
  },
];

export default function PrivacyPage() {
  return (
    <PublicPageShell>

      <DocumentLayout navigation={navigation}>
        <LegalSection
          id="information"
          number="1"
          title="Informasi yang kami kumpulkan"
        >
          <p>
            Ketika menggunakan Sign in with Google, WattUp dapat
            menerima identifier akun Google, nama, alamat email, status
            verifikasi email, dan foto profil apabila tersedia.
          </p>

          <p>
            Kamu juga dapat memberikan data kendaraan listrik,
            kapasitas baterai, tarif listrik, preferensi pengingat, dan
            catatan sesi charging.
          </p>

          <p>
            WattUp dapat mencatat informasi teknis terbatas seperti
            waktu autentikasi, session identifier, jenis perangkat, dan
            informasi error untuk keamanan serta pemeliharaan layanan.
          </p>
        </LegalSection>

        <LegalSection
          id="usage"
          number="2"
          title="Cara kami menggunakan data"
        >
          <ul className="list-disc space-y-2 pl-5 marker:text-[#13A868]">
            <li>Membuat dan mengamankan akun WattUp.</li>

            <li>Menyediakan autentikasi melalui Google.</li>

            <li>
              Menghubungkan sesi charging dengan akun pengguna.
            </li>

            <li>
              Menghitung penggunaan energi, off-peak rate, streak, dan
              estimasi penghematan.
            </li>

            <li>
              Menyediakan leaderboard dan fitur tantangan.
            </li>

            <li>
              Mengirimkan verifikasi atau informasi keamanan apabila
              diperlukan.
            </li>

            <li>
              Mendeteksi penyalahgunaan dan memperbaiki error.
            </li>
          </ul>
        </LegalSection>

        <LegalSection
          id="google"
          number="3"
          title="Penggunaan data Google"
        >
          <p>
            Data dasar Google digunakan hanya untuk autentikasi,
            identifikasi akun, dan menampilkan profil pengguna.
          </p>

          <p>
            WattUp tidak meminta akses ke Gmail, Google Drive, Google
            Calendar, kontak, atau isi layanan Google lainnya.
          </p>

          <div className="rounded-2xl border border-[#087A4D]/15 bg-[#EFFAF4] p-5 font-medium text-[#315D4C]">
            WattUp tidak menjual data Google, tidak menggunakannya
            untuk iklan, dan tidak menggunakannya untuk melatih model
            kecerdasan buatan.
          </div>
        </LegalSection>

        <LegalSection
          id="providers"
          number="4"
          title="Penyimpanan dan penyedia layanan"
        >
          <p>
            WattUp dapat menggunakan Vercel untuk hosting aplikasi dan
            Supabase untuk infrastruktur database. Penyedia layanan
            hanya memperoleh akses yang diperlukan untuk menjalankan
            fungsi teknis WattUp.
          </p>

          <p>
            Penyedia email transaksional dapat digunakan untuk
            verifikasi akun atau pemberitahuan keamanan. Data pengguna
            tidak dibagikan untuk pemasaran pihak ketiga.
          </p>
        </LegalSection>

        <LegalSection
          id="cookies"
          number="5"
          title="Cookies dan session"
        >
          <p>
            WattUp menggunakan cookie atau session yang diperlukan agar
            pengguna tetap masuk, melindungi akun, dan menjalankan
            fungsi aplikasi.
          </p>

          <p>
            Cookie autentikasi tidak digunakan oleh WattUp untuk
            periklanan lintas situs.
          </p>
        </LegalSection>

        <LegalSection
          id="security"
          number="6"
          title="Keamanan data"
        >
          <p>
            Kami menggunakan HTTPS, autentikasi, kontrol akses, dan
            pembatasan akses database untuk melindungi informasi
            pengguna.
          </p>

          <p>
            Meskipun berbagai langkah keamanan diterapkan, tidak ada
            metode penyimpanan atau transmisi elektronik yang dapat
            menjamin keamanan absolut.
          </p>
        </LegalSection>

        <LegalSection
          id="retention"
          number="7"
          title="Retensi dan penghapusan"
        >
          <p>
            Data disimpan selama akun aktif atau selama diperlukan
            untuk menyediakan layanan WattUp.
          </p>

          <p>
            Pengguna dapat meminta penghapusan akun melalui halaman{" "}
            <Link
              href="/data-deletion"
              className="font-bold text-[#087A4D] underline decoration-[#13C77A]/40 underline-offset-4"
            >
              Penghapusan Data
            </Link>
            .
          </p>

          <p>
            Data tertentu dapat tersimpan sementara dalam backup sistem
            dan akan dihapus mengikuti jadwal retensi infrastruktur,
            kecuali penyimpanan lebih lama diwajibkan oleh hukum atau
            diperlukan untuk keamanan.
          </p>
        </LegalSection>

        <LegalSection
          id="rights"
          number="8"
          title="Hak pengguna"
        >
          <p>
            Kamu dapat meminta akses, koreksi, atau penghapusan data
            pribadi dengan menghubungi kami.
          </p>

          <p>
            Kamu juga dapat mencabut akses WattUp melalui halaman
            koneksi pihak ketiga pada akun Google.
          </p>
        </LegalSection>

        <LegalSection
          id="contact"
          number="9"
          title="Perubahan dan kontak"
        >
          <p>
            Kebijakan ini dapat diperbarui apabila terdapat perubahan
            fungsi, teknologi, atau ketentuan hukum. Tanggal pembaruan
            terbaru akan ditampilkan pada bagian atas halaman.
          </p>

          <p>
            Pertanyaan mengenai privasi dan penggunaan data dapat
            dikirimkan ke{" "}
            <a
              href={`mailto:${publicAppConfig.supportEmail}`}
              className="font-bold text-[#087A4D] underline decoration-[#13C77A]/40 underline-offset-4"
            >
              {publicAppConfig.supportEmail}
            </a>
            .
          </p>
        </LegalSection>
      </DocumentLayout>
    </PublicPageShell>
  );
}