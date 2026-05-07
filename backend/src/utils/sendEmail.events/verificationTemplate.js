// Email templates used when an admin approves or rejects a user's identity
// verification. The visual style mirrors `template.js` (the OTP email) so
// branding stays consistent across all UNIFY transactional mails.

const baseTemplate = ({ headline, body, accentColor = "#630E2B", ctaLabel, ctaUrl }) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F3F3;font-family:Arial,Helvetica,sans-serif;color:#333;">
  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="background-color:#F3F3F3;padding:30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="560" style="background-color:#ffffff;border:1px solid ${accentColor};border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background-color:${accentColor};color:#fff;padding:24px 32px;font-size:22px;font-weight:bold;letter-spacing:0.5px;">
              UNIFY
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="font-size:22px;color:${accentColor};margin:0 0 16px;">${headline}</h1>
              <div style="font-size:15px;line-height:1.7;color:#444;">${body}</div>
              ${ctaLabel && ctaUrl ? `<p style="margin-top:32px;text-align:center;">
                <a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;border-radius:8px;background-color:${accentColor};color:#ffffff;text-decoration:none;font-weight:bold;">${ctaLabel}</a>
              </p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;font-size:12px;color:#888;background-color:#fafafa;border-top:1px solid #eee;">
              You are receiving this email because you registered an account on UNIFY.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const verificationApprovedTemplate = ({ name, loginUrl }) =>
  baseTemplate({
    headline: "Your account has been verified",
    body: `<p>Hi <strong>${name}</strong>,</p>
           <p>Great news — our team has reviewed your identity document and your UNIFY account has been <strong>verified</strong>. You can now log in and start using all features of the platform.</p>
           <p>Thank you for helping us keep the community safe.</p>`,
    ctaLabel: "Log in to UNIFY",
    ctaUrl: loginUrl || "http://localhost:5173/login",
  });

export const verificationRejectedTemplate = ({ name, reason }) =>
  baseTemplate({
    headline: "Account verification update",
    body: `<p>Hi <strong>${name}</strong>,</p>
           <p>We've reviewed the identity document you submitted, but unfortunately we were unable to verify your account at this time.</p>
           ${reason ? `<p><strong>Reason from our team:</strong><br/>${reason}</p>` : ""}
           <p>Please re-register with a clearer copy of a valid ID. We're happy to take another look.</p>`,
    accentColor: "#9E2A2B",
  });
