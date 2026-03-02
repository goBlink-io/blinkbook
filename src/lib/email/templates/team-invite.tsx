interface TeamInviteEmailProps {
  spaceName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
}

export function teamInviteHtml({ spaceName, inviterName, role, acceptUrl }: TeamInviteEmailProps): string {
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
              <h1 style="color:#ffffff;font-size:20px;margin:16px 0 0;">You've been invited</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;">
              <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 16px;">
                <strong style="color:#ffffff;">${inviterName}</strong> has invited you to collaborate on
                <strong style="color:#ffffff;">${spaceName}</strong> as a <strong style="color:#ffffff;">${role}</strong>.
              </p>
              <a href="${acceptUrl}" style="display:block;padding:12px 24px;background:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;text-align:center;text-decoration:none;border-radius:8px;">
                Accept Invitation
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="color:#52525b;font-size:12px;margin:0;border-top:1px solid #27272a;padding-top:16px;">
                This invitation was sent by BlinkBook. If you didn't expect this, you can safely ignore it.
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
