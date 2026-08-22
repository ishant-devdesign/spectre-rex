# Mail setup runbook

Operational checklist for `spectrerex.com`. Domain registered at GoDaddy, site on
Vercel. Architecture and reasoning live in [README.md](README.md#2-email-architecture);
this file is only the click-by-click.

Order matters. Do not start section 4 until section 2 verifies.

---

## 0. Confirmed state of this domain

Checked against the live zone. These are settled -- no need to re-derive them.

| Fact | Value |
|---|---|
| Nameservers | `ns21/ns22.domaincontrol.com` -- **GoDaddy is authoritative** |
| Edit records in | GoDaddy -> My Products -> Domain -> DNS |
| Zoho data centre | **India** (`zmverify.zoho.in`) |
| Zoho console | `mailadmin.zoho.in` |
| Zoho MX | `mx.zoho.in`, `mx2.zoho.in`, `mx3.zoho.in` |
| Zoho SPF include | `zoho.in` |
| Domain verification | done -- TXT `zoho-verification=zb67825336...` is live |

### What is still missing

As of the last zone check the domain had **no MX, no SPF, no DKIM**. Domain
verification proves ownership only; it does not route mail. Until section 2 is
done, everything sent to `@spectrerex.com` bounces.

### The one GoDaddy mistake that wastes an afternoon

GoDaddy appends the domain to whatever you type in **Name**. Providers give you
the full hostname; strip the domain off.

| Provider shows | Type in GoDaddy |
|---|---|
| `send.spectrerex.com` | `send` |
| `resend._domainkey.send.spectrerex.com` | `resend._domainkey.send` |
| `zmail._domainkey.spectrerex.com` | `zmail._domainkey` |
| `spectrerex.com` (root) | `@` |

Typing the full name creates `send.spectrerex.com.spectrerex.com`, which
resolves to nothing and verifies never.

---

## 1. Records to change before anything else

### 1.1 Fix the DMARC record -- do this first

GoDaddy pre-installed this:

```
v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;
```

It is actively harmful in the current state. DMARC passes only if SPF or DKIM
passes, and neither is published yet -- so `p=quarantine` instructs every
receiver to spam-folder your mail. The `rua` also sends reports to GoDaddy
rather than to you.

**Edit** (do not add a second one -- only one `_dmarc` record may exist):

| Type | Name | Value |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@spectrerex.com; adkim=r; aspf=r;` |

`p=none` reports without blocking. Raise it to `p=quarantine` only once SPF and
DKIM are verified and reports look clean.

The `rua` address must be **at spectrerex.com**. Pointing it at a Gmail address
requires an authorisation record inside Google's DNS that you cannot create, so
reports would be silently discarded. Make `dmarc@` an alias on your mailbox.

### 1.2 Leave these alone

`SOA`, both `NS` records, and `CNAME _domainconnect` are infrastructure. The
`zoho-verification` TXT must stay -- removing it can un-verify the domain.

### 1.3 The website is not on Vercel yet

The zone currently has:

```
a      @     WebsiteBuilder Site
cname  www   spectrerex.com
```

The domain serves **GoDaddy Website Builder**, and `www` inherits it. Nothing
deployed to Vercel will appear until this changes. Mail does not depend on it,
so leave it until the deploy -- then:

1. Unpublish the Website Builder site in GoDaddy, or it may re-add its A record
2. `A` `@` -> `76.76.21.21`
3. `CNAME` `www` -> `cname.vercel-dns.com`
4. Add the domain in Vercel -> Project -> Settings -> Domains

**Keep nameservers at GoDaddy.** Switching them to Vercel hands Vercel the whole
zone, MX records included, and would break the mail setup below.

### 1.4 Watch for conflicting MX

There are no MX records right now, which is clean. If GoDaddy Email Forwarding
or a "Professional Email" trial is ever enabled it will install its own MX --
delete those. Two mail providers on one domain means messages are delivered to
whichever wins, and are permanently lost.

---

## 2. Zoho Mail

### 2.1 Account and verification -- already done

Zoho account created, `spectrerex.com` verified on the India data centre.
Console: `mailadmin.zoho.in`. Skip to 2.3.

Values below are the India set. Copy the actual strings from your own console
rather than this file wherever one is account-specific.

### 2.3 MX records

Three records, all with Name `@`:

| Type | Name | Value | Priority |
|---|---|---|---|
| MX | `@` | `mx.zoho.in` | 10 |
| MX | `@` | `mx2.zoho.in` | 20 |
| MX | `@` | `mx3.zoho.in` | 50 |

Nothing receives mail until these exist. This is the highest-priority record in
the whole file.

### 2.4 SPF on the root

| Type | Name | Value |
|---|---|---|
| TXT | `@` | `v=spf1 include:zoho.in ~all` |

Only Zoho goes in this record. Resend gets its own SPF on the subdomain in
section 4 -- **do not merge them**. Separate hostnames, separate records.

### 2.5 DKIM

Admin Console -> Domains -> your domain -> **DKIM** -> Add. Selector `zmail`,
key length 2048. Zoho generates a value.

| Type | Name | Value |
|---|---|---|
| TXT | `zmail._domainkey` | `v=DKIM1; k=rsa; p=MIIBIjANBg...` |

Copy with the copy button. Never retype -- one wrong character and DKIM fails
with no useful error.

### 2.6 Users

Admin Console -> Users -> Add. One per team member, four total. The free plan
caps at **5**.

### 2.7 Groups

Admin Console -> **Groups** -> Create Group. Five of them. Groups, not aliases:
an alias points at one mailbox, a group has a membership list you edit as people
join and leave, and groups do not consume user seats.

| Group name | Email | Access type | Members |
|---|---|---|---|
| Hello | `hello@spectrerex.com` | Public | founders |
| Support | `support@spectrerex.com` | Public | HR |
| Press | `press@spectrerex.com` | Public | founders |
| Business | `work@spectrerex.com` | Public | founders |
| Team | `team@spectrerex.com` | **Organization** | everyone |

Descriptions, for the Description field:

- **Hello** -- General enquiries from the website. First point of contact for
  anything that is not press, business or support. Reply-to address for
  subscriber campaigns.
- **Support** -- Inbound support requests. Feeds Zoho Desk, where HR triages and
  assigns each ticket to an owner who then replies directly to the sender.
- **Press** -- Media enquiries, interview requests and press-kit access.
- **Business** -- Partnership, publishing and commercial enquiries. Work with
  the studio.
- **Team** -- Internal all-hands distribution list. Not published anywhere.
  Organisation members only.

**Access type matters.** The four public groups must accept mail from outside
the organisation or the website's published addresses silently reject strangers.
`team@` must be set to **Organization** members only -- leaving it public lets
anyone on the internet mail your entire staff at once.

Also add `dmarc@spectrerex.com` as an **alias** on your own mailbox, not a group.
It is one human reading machine-generated reports, and the DMARC record already
published points `rua` at it.

### 2.8 Verify before moving on

```powershell
nslookup -type=MX spectrerex.com
nslookup -type=TXT spectrerex.com
```

MX must return the three Zoho hosts and nothing else. Then send a real message
from a personal Gmail to `hello@spectrerex.com` and confirm it arrives.

**Do not continue until mail actually lands.** MX changes can take an hour or
two; SPF and DKIM up to 48.

---

## 3. Zoho Desk

1. Create a [Zoho Desk](https://www.zoho.com/desk/) account with the same Zoho
   login. **Free plan, 3 agents, no time limit.**
2. Setup -> Channels -> Email -> Add. Use `support@spectrerex.com`.
3. Desk will either ask you to forward that address into a Desk address, or give
   you its own records. Follow its instructions -- do **not** change the root MX,
   which belongs to Zoho Mail.
4. Add HR as an agent. HR triages and assigns; the assignee replies from inside
   the ticket.

---

## 4. Resend on a subdomain

### 4.1 What "making a subdomain" means here

Nothing is created anywhere. `send.spectrerex.com` is not a website, has no
hosting, and must **not** be added to Vercel. A subdomain exists the moment a DNS
record carries its name -- adding a TXT record named `send` *is* creating it.

So: no Vercel step, no GoDaddy "add subdomain" button. Just records.

The point is reputation isolation. Campaign mail signs as `send.spectrerex.com`.
If a blast ever gets spam-flagged, the damage lands on the subdomain and your
team's mail on the root domain is untouched.

### 4.2 Add the domain in Resend

[resend.com](https://resend.com) -> Domains -> Add Domain -> `send.spectrerex.com`.
Pick the region closest to your audience. Resend then shows three records.

### 4.3 The three records

Values are account-specific -- copy from your dashboard. Region appears in the MX
value.

| Type | Name (GoDaddy) | Value | Priority |
|---|---|---|---|
| MX | `send` | `feedback-smtp.ap-south-1.amazonses.com` | 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | -- |
| TXT | `resend._domainkey.send` | `p=MIGfMA0GCSq...` | -- |

Notes:

- The MX on `send` handles **bounces**. It does not conflict with the root MX --
  different hostname.
- This SPF is a second, separate record on a different hostname. The
  one-SPF-per-hostname rule is not violated.
- DKIM name is `resend._domainkey.send`, not `resend._domainkey`. Resend shows
  the full `resend._domainkey.send.spectrerex.com`; strip the domain.

Click **Verify** in Resend. Status must read **Verified** before it will send.

### 4.4 DMARC

One record, on the root, covering both senders:

Already handled in section 1.1 -- the record exists and only needed its policy
and `rua` corrected. One `_dmarc` record covers both Zoho and Resend.

### 4.5 Create the audience

Resend -> Audiences -> Create. Name it `Subscribers`. Copy the audience ID.

---

## 5. Final verification

```powershell
nslookup -type=MX spectrerex.com
nslookup -type=TXT spectrerex.com
nslookup -type=TXT zmail._domainkey.spectrerex.com
nslookup -type=MX send.spectrerex.com
nslookup -type=TXT send.spectrerex.com
nslookup -type=TXT resend._domainkey.send.spectrerex.com
nslookup -type=TXT _dmarc.spectrerex.com
```

Then:

- [mxtoolbox.com](https://mxtoolbox.com) -- MX and SPF lookups on the root
- Send a test from Resend to a Gmail, an Outlook and a Zoho address; confirm
  **Inbox**, not spam
- [mail-tester.com](https://mail-tester.com) -- aim for 9/10 or better

---

## 6. What to send back

Once section 4 verifies:

- Resend **audience ID**
- Confirmation `send.spectrerex.com` shows **Verified**
- Whether you are on the `.in` or `.com` Zoho data centre

Then the subscribe form, `subscribers` writes with honeypot and rate limiting,
the Resend audience sync, and the `/admin` broadcast composer get built.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Zoho verification never passes | Full hostname typed in GoDaddy's Name field |
| Mail to `hello@` bounces | Old MX record left behind, or group not created |
| Resend stuck "Pending" | DKIM value truncated on paste, or wrong Name |
| Campaign lands in spam | DMARC missing, or sending before Verified |
| Nothing resolves after an hour | Editing GoDaddy while nameservers point at Vercel (section 0) |
