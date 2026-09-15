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

function getRequiredEnvironmentVariable(
  name: "RESEND_API_KEY" | "EMAIL_FROM",
): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function getResendClient(): Resend {
  return new Resend(
    getRequiredEnvironmentVariable(
      "RESEND_API_KEY",
    ),
  );
}

export async function sendWattUpVerificationEmail({
  name,
  email,
  verificationUrl,
}: VerificationEmailInput): Promise<string> {
  const resend = getResendClient();

  const from =
    getRequiredEnvironmentVariable(
      "EMAIL_FROM",
    );

  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(
    verificationUrl,
  );

  const { data, error } =
    await resend.emails.send({
      from,
      to: email,
      subject:
        "Verifikasi email WattUp kamu",

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
          <head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <meta charset="utf-8" />
            <title>Verifikasi email WattUp</title>
          </head>

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
                      letter-spacing: -0.03em;
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
                      color: #173b32;
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
      `RESEND_SEND_FAILED: ${error.message}`,
    );
  }

  if (!data?.id) {
    throw new Error(
      "RESEND_SEND_FAILED: Resend did not return an email ID",
    );
  }

  console.info(
    "VERIFICATION_EMAIL_SENT",
    {
      messageId: data.id,
    },
  );

  return data.id;
}