export function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  const visibleLength = Math.min(3, localPart.length);
  const visible = localPart.slice(0, visibleLength);
  const hidden = "*".repeat(Math.max(3, localPart.length - visibleLength));

  return `${visible}${hidden}@${domain}`;
}
