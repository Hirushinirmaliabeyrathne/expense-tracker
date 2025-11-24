import { parsePhoneNumber, type CountryCode } from "libphonenumber-js"
import { getCurrencyFromCountry } from "./country-currency-map"

export interface PhoneInfo {
  isValid: boolean
  countryCode?: CountryCode
  flag?: string
  currency?: string
  formattedNumber?: string
}

export function parseAndAnalyzePhone(phoneNumber: string): PhoneInfo {
  try {
    const parsed = parsePhoneNumber(phoneNumber)

    if (!parsed || !parsed.country) {
      return { isValid: false }
    }

    const countryCode = parsed.country
    const currency = getCurrencyFromCountry(countryCode)
    const flag = getCountryFlag(countryCode)

    return {
      isValid: parsed.isValid(),
      countryCode,
      flag,
      currency,
      formattedNumber: parsed.formatInternational(),
    }
  } catch (error) {
    return { isValid: false }
  }
}

function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
