interface StalePage {
  title: string;
  updatedAt: string;
  editorUrl: string;
}

interface ReviewReminderEmailProps {
  spaceName: string;
  stalePages: StalePage[];
  reviewDays: number;
}

export function reviewReminderHtml({ spaceName, stalePages, reviewDays }: ReviewReminderEmailProps): string {
  const count = stalePages.length;
  const pageRows = stalePages
    .map(
      (page) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #27272a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="${page.editorUrl}" style="color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;">${page.title}</a>
                    <p style="color:#71717a;font-size:12px;margin:2px 0 0;">
                      Last updated: ${new Date(page.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <a href="${page.editorUrl}" style="display:inline-block;padding:6px 14px;background:#3b82f6;color:#ffffff;font-size:12px;font-weight:600;text-decoration:none;border-radius:6px;white-space:nowrap;">
                      Review
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
    )
    .join('');

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
        <table width="520" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <div style="display:inline-block;width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);line-height:40px;text-align:center;font-size:18px;color:white;">B</div>
              <h1 style="color:#ffffff;font-size:20px;margin:16px 0 4px;">Pages Need Review</h1>
              <p style="color:#71717a;font-size:13px;margin:0;">${spaceName}</p>
            </td>
          </tr>
          <!-- Summary banner -->
          <tr>
            <td style="padding:24px 32px 0;">
              <div style="background:#1d2535;border:1px solid #1e3a5f;border-radius:10px;padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f59e0b;margin-right:8px;vertical-align:middle;"></span>
                      <span style="color:#d4d4d8;font-size:14px;vertical-align:middle;">
                        <strong style="color:#ffffff;">${count} ${count === 1 ? 'page' : 'pages'}</strong> ${count === 1 ? 'has' : 'have'} not been updated in over <strong style="color:#ffffff;">${reviewDays} days</strong>
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <!-- Page list -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="color:#a1a1aa;font-size:13px;margin:0 0 12px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Stale pages</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${pageRows}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <p style="color:#52525b;font-size:12px;margin:0;border-top:1px solid #27272a;padding-top:20px;line-height:1.6;">
                You're receiving this because review reminders are enabled for <strong style="color:#71717a;">${spaceName}</strong> on goBlink Book.
                You can disable these reminders in your space settings.
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
