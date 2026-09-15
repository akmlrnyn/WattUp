import { Resend } from "resend";

interface VerificationEmailInput {
  name: string;
  email: string;
  verificationUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured",
    );
  }

  return new Resend(apiKey);
}

function getEmailFrom(): string {
  return (
    process.env.EMAIL_FROM ??
    "WattUp <onboarding@resend.dev>"
  );
}

export async function sendWattUpVerificationEmail({
  name,
  email,
  verificationUrl,
}: VerificationEmailInput): Promise<void> {
  const resend = getResendClient();

  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(verificationUrl);

  const { error } = await resend.emails.send({
    from: getEmailFrom(),
    to: email,
    subject: "Verifikasi email WattUp kamu",

    text: [
      `Halo ${name},`,
      "",
      "Verifikasi email kamu untuk mulai menggunakan WattUp.",
      verificationUrl,
      "",
      "Link ini hanya digunakan untuk memverifikasi akunmu.",
      "Jika kamu tidak membuat akun WattUp, abaikan email ini.",
    ].join("\n"),

    html: `
      <!doctype html>
      <html lang="id">
        <body
          style="
            margin: 0;
            padding: 0;
            background: #f2f8f5;
            color: #173b32;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              width: 100%;
              padding: 40px 16px;
              box-sizing: border-box;
            "
          >
            <div
              style="
                max-width: 520px;
                margin: 0 auto;
                overflow: hidden;
                background: #ffffff;
                border: 1px solid #dce9e3;
                border-radius: 20px;
              "
            >
              <div
                style="
                  padding: 28px 30px;
                  background: #0f9154;
                  color: #ffffff;
                "
              >
                <div
                  style="
                    font-size: 27px;
                    font-weight: 800;
                  "
                >
                  WattUp
                </div>

                <div
                  style="
                    margin-top: 6px;
                    font-size: 13px;
                    opacity: 0.86;
                  "
                >
                  Charging lebih cerdas, hemat lebih nyata.
                </div>
              </div>

              <div style="padding: 30px;">
                <h1
                  style="
                    margin: 0 0 14px;
                    font-size: 22px;
                    line-height: 1.3;
                  "
                >
                  Verifikasi email kamu
                </h1>

                <p
                  style="
                    margin: 0 0 12px;
                    color: #557169;
                    font-size: 14px;
                    line-height: 1.65;
                  "
                >
                  Halo ${safeName},
                </p>

                <p
                  style="
                    margin: 0 0 24px;
                    color: #557169;
                    font-size: 14px;
                    line-height: 1.65;
                  "
                >
                  Klik tombol berikut untuk memverifikasi
                  email dan melanjutkan setup akun WattUp.
                </p>

                <a
                  href="${safeUrl}"
                  style="
                    display: inline-block;
                    padding: 13px 20px;
                    color: #ffffff;
                    background: #0f9154;
                    border-radius: 11px;
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                  "
                >
                  Verifikasi Email
                </a>

                <p
                  style="
                    margin: 25px 0 0;
                    color: #81958f;
                    font-size: 12px;
                    line-height: 1.6;
                  "
                >
                  Jika kamu tidak membuat akun WattUp,
                  abaikan email ini.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(
      `Failed to send verification email: ${error.message}`,
    );
  }
}