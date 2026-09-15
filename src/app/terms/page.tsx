import type { Metadata } from "next";

import {
  DocumentHero,
  DocumentLayout,
  LegalSection,
  PublicPageShell,
} from "@/components/public/public-page-shell";
import { publicAppConfig } from "@/config/public-app";

export const metadata: Metadata = {
  title: "Ketentuan Layanan | WattUp",
  description:
    "Ketentuan yang berlaku ketika menggunakan aplikasi WattUp.",
};

const navigation = [
  { id: "service", label: "Tentang layanan" },
  { id: "account", label: "Akun pengguna" },
  { id: "acceptable-use", label: "Penggunaan layanan" },
  { id: "estimation", label: "Estimasi WattUp" },
  { id: "availability", label: "Ketersediaan" },
  { id: "ownership", label: "Hak kepemilikan" },
  { id: "termination", label: "Penghentian akun" },
  { id: "liability", label: "Tanggung jawab" },
  { id: "contact", label: "Kontak" },
];

export default function TermsPage() {
  return (
    <PublicPageShell>
      

      <DocumentLayout navigation={navigation}>
        <LegalSection
          id="service"
          number="1"
          title="Tentang layanan"
        >
          <p>
            WattUp menyediakan pencatatan sesi charging kendaraan
            listrik, analisis energi, statistik off-peak, estimasi
            penghematan, leaderboard, dan fitur pendukung lainnya.
          </p>
        </LegalSection>

        <LegalSection
          id="account"
          number="2"
          title="Akun pengguna"
        >
          <p>
            Pengguna wajib memberikan informasi yang akurat dan menjaga
            keamanan akun. Kamu bertanggung jawab atas aktivitas yang
            dilakukan melalui akunmu.
          </p>

          <p>
            WattUp dapat menggunakan Google atau metode autentikasi lain
            untuk memverifikasi identitas akun.
          </p>
        </LegalSection>

        <LegalSection
          id="acceptable-use"
          number="3"
          title="Penggunaan yang diperbolehkan"
        >
          <p>Kamu setuju untuk tidak:</p>

          <ul className="list-disc space-y-2 pl-5 marker:text-[#13A868]">
            <li>Menggunakan WattUp untuk aktivitas melanggar hukum.</li>
            <li>Mengakses akun atau data pengguna lain tanpa izin.</li>
            <li>Mengganggu keamanan atau ketersediaan aplikasi.</li>
            <li>Memasukkan data palsu untuk memanipulasi statistik.</li>
            <li>
              Melakukan scraping atau eksploitasi yang merugikan
              layanan.
            </li>
          </ul>
        </LegalSection>

        <LegalSection
          id="estimation"
          number="4"
          title="Estimasi energi dan penghematan"
        >
          <p>
            Informasi energi, biaya, off-peak rate, dan penghematan
            merupakan estimasi berdasarkan data pengguna serta
            konfigurasi aplikasi.
          </p>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
            WattUp bukan layanan resmi PLN, operator charging,
            produsen kendaraan, atau lembaga pemerintah. Hasil
            perhitungan tidak menggantikan tagihan maupun meter listrik
            resmi.
          </div>
        </LegalSection>

        <LegalSection
          id="availability"
          number="5"
          title="Ketersediaan layanan"
        >
          <p>
            Kami berusaha menjaga WattUp tetap tersedia dan akurat,
            tetapi tidak menjamin bahwa layanan akan selalu bebas
            error, gangguan, atau kehilangan data.
          </p>

          <p>
            Fitur dapat ditambah, diubah, atau dihentikan untuk
            kebutuhan pengembangan, keamanan, maupun operasional.
          </p>
        </LegalSection>

        <LegalSection
          id="ownership"
          number="6"
          title="Hak kekayaan intelektual"
        >
          <p>
            Nama, logo, desain, perangkat lunak, dan materi WattUp
            dilindungi oleh hak yang berlaku. Pengguna tetap memiliki
            data yang mereka masukkan ke aplikasi.
          </p>
        </LegalSection>

        <LegalSection
          id="termination"
          number="7"
          title="Penangguhan dan penghentian akun"
        >
          <p>
            WattUp dapat membatasi akun yang melakukan penyalahgunaan,
            membahayakan pengguna lain, atau melanggar ketentuan.
            Pengguna dapat berhenti menggunakan WattUp dan meminta
            penghapusan akun kapan saja.
          </p>
        </LegalSection>

        <LegalSection
          id="liability"
          number="8"
          title="Batasan tanggung jawab"
        >
          <p>
            Sejauh diperbolehkan hukum, WattUp tidak bertanggung jawab
            atas keputusan yang hanya didasarkan pada estimasi
            aplikasi, data pengguna yang tidak akurat, atau gangguan
            layanan pihak ketiga.
          </p>
        </LegalSection>

        <LegalSection
          id="contact"
          number="9"
          title="Perubahan, hukum, dan kontak"
        >
          <p>
            Ketentuan dapat diperbarui seiring perkembangan layanan dan
            ditafsirkan berdasarkan hukum Republik Indonesia.
          </p>

          <p>
            Pertanyaan dapat dikirimkan ke{" "}
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