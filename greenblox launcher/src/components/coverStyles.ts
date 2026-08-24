/** Роблокс-подобные стили обложки профиля. Общие для своего профиля
 *  (SocialProfileView) и профиля друга (FriendProfileView), чтобы выбранный
 *  в настройках coverStyle выглядел одинаково везде. */
export const COVER_STYLES: Record<string, string> = {
  emerald:
    "radial-gradient(ellipse_at_50%_30%, rgba(30,215,96,0.18), transparent 62%), linear-gradient(180deg,#151515 0%,#101010 100%)",
  cyberpunk:
    "radial-gradient(ellipse_at_50%_30%, rgba(0,229,163,0.2), transparent 62%), linear-gradient(180deg,#0d1f1a 0%,#0a0914 100%)",
  sunset:
    "radial-gradient(ellipse_at_50%_30%, rgba(244,114,182,0.2), transparent 62%), linear-gradient(180deg,#1c1418 0%,#0f0a12 100%)",
  midnight:
    "radial-gradient(ellipse_at_50%_30%, rgba(56,189,248,0.16), transparent 62%), linear-gradient(180deg,#0d1624 0%,#080d16 100%)",
  ruby:
    "radial-gradient(ellipse_at_50%_30%, rgba(239,68,68,0.18), transparent 62%), linear-gradient(180deg,#1c1010 0%,#100a0a 100%)",
};

export function coverStyleOf(style: string | undefined): string {
  return COVER_STYLES[style ?? "emerald"] ?? COVER_STYLES.emerald;
}
