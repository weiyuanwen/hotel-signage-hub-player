export type UiLocale = "vi" | "en";

export type ThanksLines = {
  lead: string;
  wish: string;
};

const WISH_VI = "Chúc quý khách có những trải nghiệm tuyệt vời.";
const WISH_EN = "We wish you a wonderful stay.";

export function asUiLocale(value: string | null | undefined): UiLocale {
  return value?.toLowerCase().startsWith("en") ? "en" : "vi";
}

export type Headline = {
  greeting: string;
  name: string;
};

export function headline(locale: UiLocale, name: string, variant: "banner" | "letter" = "banner"): Headline {
  if (variant === "letter") {
    return {
      greeting: locale === "vi" ? "Chào mừng," : "Welcome,",
      name: name.trim(),
    };
  }
  return {
    greeting: locale === "vi" ? "CHÀO MỪNG" : "WELCOME",
    name: name.trim().toLocaleUpperCase(locale === "vi" ? "vi-VN" : "en-GB"),
  };
}

export function thanks(locale: UiLocale, hotel: string, custom: string | null): ThanksLines {
  const trimmed = custom?.trim() ?? "";
  if (trimmed) {
    const split = splitThanks(trimmed, locale, hotel);
    if (split) return split;
  }
  return defaultThanks(locale, hotel);
}

export function wifiPasswordLabel(locale: UiLocale): string {
  return locale === "vi" ? "Mật khẩu" : "Password";
}

export function vacantTitle(locale: UiLocale, hotel: string): string {
  const name = hotel.trim().toLocaleUpperCase(locale === "vi" ? "vi-VN" : "en-GB");
  return locale === "vi" ? `CHÀO MỪNG ĐẾN ${name}` : `WELCOME TO ${name}`;
}

export function vacantBody(locale: UiLocale, hotel: string): ThanksLines {
  return defaultThanks(locale, hotel);
}

function defaultThanks(locale: UiLocale, hotel: string): ThanksLines {
  if (locale === "vi") {
    return {
      lead: `Cảm ơn quý khách đã chọn ${hotel}.`,
      wish: WISH_VI,
    };
  }
  return {
    lead: `Thank you for choosing ${hotel}.`,
    wish: WISH_EN,
  };
}

function splitThanks(value: string, locale: UiLocale, hotel: string): ThanksLines | null {
  const match = value.match(/^(.*?[.!?])\s+((?:Chúc quý khách|We wish you).+)$/i);
  if (match) {
    return { lead: match[1].trim(), wish: match[2].trim() };
  }
  if (looksEnglish(value) === (locale === "en")) {
    return { lead: value, wish: locale === "vi" ? WISH_VI : WISH_EN };
  }
  return defaultThanks(locale, hotel);
}

function looksEnglish(value: string): boolean {
  return /[A-Za-z]/.test(value) && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(value);
}
