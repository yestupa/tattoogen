export function getDiscountDisplayName(
  discount: { displayNameEn: string; displayNameZh?: string | null },
  locale: string
) {
  if (locale === 'zh') {
    return discount.displayNameZh?.trim() || discount.displayNameEn.trim();
  }
  return discount.displayNameEn.trim();
}
