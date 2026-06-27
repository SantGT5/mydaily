import dayjs, { ConfigType, Dayjs } from "dayjs"

const dateTemplates = {
  long: "D MMMM YYYY",
  short: "D MMM YYYY",
  shorter: "D MMM",
  yyyy_mm_dd: "YYYY-MM-DD",
  custom: undefined,
} as const

const timeTemplates = {
  default: "HH:mm",
} as const

interface DayjsFormatProps {
  date: ConfigType
  withTime?: boolean
  customFormat?: string
  type?: keyof typeof dateTemplates
}

const dateToString = (date: Dayjs) => date.format(dateTemplates.yyyy_mm_dd)

/**
 * Checks if a given date is valid using the dayjs library.
 * @param date The date to validate
 */
const isDateValid = (date: ConfigType) => date && dayjs(date).isValid()

/**
 * Formats a date based on specified parameters.
 *
 * @param {DayjsFormatProps} props         - The formatting options.
 *
 * @param {string} [props.type='default']  - The type of predefined date format to use. Can be one of: 'default', 'long', 'short' or 'shorter'.
 * @param {ConfigType} props.date          - The date value, accepted by the `dayjs` library.
 * @param {string} [props.customFormat]    - Custom date format string for formatting the date.
 * @param {boolean} [props.withTime=false] - Indicates whether the `time` should be included in the formatted date string.
 *
 * @returns {string} The formatted date string based on the provided parameters.
 */
const dateFormatter = ({ type = "long", date, customFormat, withTime }: DayjsFormatProps) => {
  if (!isDateValid(date)) {
    return ""
  }

  if (customFormat) {
    return dayjs(date).format(customFormat)
  }

  if (type === "shorter" && dayjs(date).year() !== dayjs().year()) {
    // If the year is different than the current year, fall back to "short"
    type = "short"
  }

  const formatType = dateTemplates[type]

  const template = `${formatType}${withTime ? `, ${timeTemplates.default}` : ""}`

  return dayjs(date).format(template)
}

/**
 * @param {ConfigType} [date] - The date value, accepted by the `dayjs` library.
 *
 * @returns {Date | ""} An empty string is being returned if the date fails validation. Otherwise, the date is
 * being converted to a JavaScript Date object using the dayjs library and returned.
 *
 * @example
 * ```
 * convertToDate('2019-01-25') => Date | ""
 * ```
 */
const convertToDate = (date: ConfigType) => {
  if (!isDateValid(date)) {
    return ""
  }

  return dayjs(date).toDate()
}

const isWeekend = (date: Dayjs) => [0, 6].includes(date.get("day"))

export {
  convertToDate,
  dateFormatter,
  dateTemplates,
  dateToString,
  isDateValid,
  isWeekend,
  timeTemplates,
}
