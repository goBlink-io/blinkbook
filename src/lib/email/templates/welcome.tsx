interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
  docsUrl: string;
}

export function welcomeHtml({ name, dashboardUrl, docsUrl }: WelcomeEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <div style="display:inline-block;width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);line-height:40px;text-align:center;font-size:18px;color:white;">B</div>
              <h1 style="color:#ffffff;font-size:20px;margin:16px 0 0;">Welcome to BlinkBook</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 16px;">
                Hi <strong style="color:#ffffff;">${name}</strong>, thanks for joining BlinkBook! We're excited to have you on board.
              </p>
              <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px;">
                Here's what you can do with BlinkBook:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:10px;color:#3b82f6;font-size:16px;vertical-align:middle;">&#10003;</td>
                        <td style="color:#d4d4d8;font-size:14px;line-height:1.5;">Create beautiful documentation sites in minutes</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:10px;color:#3b82f6;font-size:16px;vertical-align:middle;">&#10003;</td>
                        <td style="color:#d4d4d8;font-size:14px;line-height:1.5;">Write with a rich block editor — code blocks, callouts, and more</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:10px;color:#3b82f6;font-size:16px;vertical-align:middle;">&#10003;</td>
                        <td style="color:#d4d4d8;font-size:14px;line-height:1.5;">Customize with themes to match your brand</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:10px;color:#3b82f6;font-size:16px;vertical-align:middle;">&#10003;</td>
                        <td style="color:#d4d4d8;font-size:14px;line-height:1.5;">Publish instantly and share with the world</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <a href="${dashboardUrl}" style="display:block;padding:12px 24px;background:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;text-align:center;text-decoration:none;border-radius:8px;margin-bottom:12px;">
                Go to Dashboard
              </a>
              <a href="${docsUrl}" style="display:block;padding:12px 24px;background:transparent;color:#3b82f6;font-size:13px;font-weight:500;text-align:center;text-decoration:none;border:1px solid #27272a;border-radius:8px;">
                Read the Docs
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="color:#52525b;font-size:12px;margin:0;border-top:1px solid #27272a;padding-top:16px;">
                You're receiving this because you signed up for BlinkBook. If you didn't create this account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
