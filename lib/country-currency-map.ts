export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  AU: "AUD",
  NZ: "NZD",
  JP: "JPY",
  CN: "CNY",
  IN: "INR",
  LK: "LKR",
  PK: "PKR",
  BD: "BDT",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  IE: "EUR",
  GR: "EUR",
  SG: "SGD",
  MY: "MYR",
  TH: "THB",
  ID: "IDR",
  PH: "PHP",
  VN: "VND",
  KR: "KRW",
  HK: "HKD",
  TW: "TWD",
  MX: "MXN",
  BR: "BRL",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",
  ZA: "ZAR",
  NG: "NGN",
  KE: "KES",
  EG: "EGP",
  MA: "MAD",
  RU: "RUB",
  TR: "TRY",
  IL: "ILS",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
}

export function getCurrencyFromCountry(countryCode: string): string {
  return COUNTRY_CURRENCY_MAP[countryCode] || "USD"
}

export function getCountryName(countryCode: string): string {
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" })
    return regionNames.of(countryCode) || countryCode
  } catch {
    return countryCode
  }
}
