import { contactAckEmail } from "./templates";

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
  "https://spectrerex.com",
].join("\n");

export function contactAckHtml(): string {
  return contactAckEmail().html;
}
