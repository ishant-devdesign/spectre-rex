DNS zone files for spectrerex.com
=================================

GoDaddy accepts BIND-format zone files (RFC 1035) at:

  Domain Portfolio -> spectrerex.com -> DNS -> Actions/More -> Import Zone File
  -> Browse files -> Apply Zone File

Two things to know about GoDaddy's importer:

  1. Records are ADDED to the existing zone. Nothing is replaced or wiped.
  2. The whole import FAILS if any record conflicts with one already present.

That second rule is why these files contain only the records that are missing.
The A, CNAME, NS, SOA, _dmarc and zoho-verification records already exist and
are deliberately absent -- including them would abort the import.


godaddy-zoho-mail.txt   READY TO IMPORT
------------------------------------------------------------------
Three Zoho India MX records and the SPF record. Verified with
named-checkzone before shipping. Nothing in it is account-specific,
so it can be imported as-is.


NOT provided as zone files, add these by hand
------------------------------------------------------------------
DKIM (Zoho) and the three Resend records are deliberately left out:

  - Their values are account-specific and do not exist yet.
  - A 2048-bit DKIM key is longer than 255 characters, which BIND
    requires be split into several quoted strings. Getting that
    split wrong produces a record that looks fine and fails
    verification with no useful error.

The GoDaddy web UI handles long TXT values automatically, so paste
DKIM there instead:

  Zoho DKIM    TXT   zmail._domainkey             (value from mailadmin.zoho.in)
  Resend MX    MX    send                  pri 10 (value from Resend dashboard)
  Resend SPF   TXT   send                         v=spf1 include:amazonses.com ~all
  Resend DKIM  TXT   resend._domainkey.send       (value from Resend dashboard)

Remember GoDaddy appends the domain to the Name field -- type "send",
never "send.spectrerex.com".
