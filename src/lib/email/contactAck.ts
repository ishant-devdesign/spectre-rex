/**
 * Acknowledgement sent to whoever submits the contact form.
 *
 * This exists because Zoho's group auto-responder cannot cover the form.
 * The form does not send mail *from* the visitor -- /api/contact relays a
 * message from no-reply@send.spectrerex.com to the studio group, carrying
 * the visitor only in Reply-To. Zoho therefore auto-replies to the relay
 * address, which has no inbox, and the person who filled in the form hears
 * nothing.
 *
 * Keeping the copy identical to email/autoreply.html is deliberate: someone
 * who uses the form and someone who emails hello@ directly should get the
 * same acknowledgement, in the same voice.
 */

const HTML = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b1014;margin:0;padding:0">
  <tr>
    <td align="center" style="padding:32px 12px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%">

        <!-- masthead -->
        <tr>
          <td style="background:#0b1014;padding:0 0 26px">
            <img src="https://www.spectrerex.com/assets/email/logo-paper.png"
                 alt="Spectre Rex"
                 width="200" height="50"
                 style="display:block;width:200px;height:auto;border:0;outline:none;text-decoration:none" />
          </td>
        </tr>

        <!-- accent rule -->
        <tr><td style="background:#35aee4;font-size:0;line-height:0;height:3px">&nbsp;</td></tr>

        <!-- body -->
        <tr>
          <td style="background:#f2f0ea;padding:38px 36px 8px">
            <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(36,36,36,0.45)">
              Transmission received
            </div>
            <h1 style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-0.035em;color:#242424">
              The dragon<br />is reading.
            </h1>
          </td>
        </tr>

        <tr>
          <td style="background:#f2f0ea;padding:0 36px 34px">
            <p style="margin:26px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:17px;line-height:1.62;color:rgba(36,36,36,0.78)">
              Your message reached the studio. It is in the pile, and the pile is guarded.
            </p>
            <p style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:17px;line-height:1.62;color:rgba(36,36,36,0.78)">
              A human replies to every line, usually within two working days. Occasionally
              the dragon naps. It has been a long century.
            </p>
            <p style="margin:16px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:17px;line-height:1.62;color:rgba(36,36,36,0.78)">
              Nothing is needed from you. If it is genuinely urgent, reply and say so and
              it moves up the pile.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px">
              <tr>
                <td style="background:#35aee4">
                  <a href="https://www.spectrerex.com"
                     style="display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#0b1014;padding:14px 24px;text-decoration:none">
                    Visit the studio
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="background:#0b1014;padding:24px 0 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(242,240,234,0.38)">
                  End of transmission
                </td>
                <td align="right" style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(242,240,234,0.28)">
                  Automated
                </td>
              </tr>
            </table>
            <div style="border-top:1px solid rgba(242,240,234,0.12);margin-top:16px;padding-top:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:rgba(242,240,234,0.34)">
              Spectre Rex Studios &middot; Gurugram, India<br />
              <a href="https://www.spectrerex.com" style="color:rgba(242,240,234,0.55);text-decoration:none;border-bottom:1px solid rgba(53,174,228,0.6)">spectrerex.com</a>
            </div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;

export const CONTACT_ACK_SUBJECT = "Received. The dragon is reading.";

export const CONTACT_ACK_TEXT = [
  "SPECTRE REX -- TRANSMISSION RECEIVED",
  "",
  "The dragon is reading.",
  "",
  "Your message reached the studio. It is in the pile, and the pile is guarded.",
  "",
  "A human replies to every line, usually within two working days.",
  "Occasionally the dragon naps. It has been a long century.",
  "",
  "Nothing is needed from you. If it is genuinely urgent, reply and say so",
  "and it moves up the pile.",
  "",
  "-- Automated response",
  "Spectre Rex Studios, Gurugram, India",
  "https://www.spectrerex.com",
].join("\n");

export function contactAckHtml(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${CONTACT_ACK_SUBJECT}</title></head>
<body style="margin:0;padding:0;background:#0b1014">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">A human replies to every line, usually within two working days.</div>
${HTML}
</body></html>`;
}
