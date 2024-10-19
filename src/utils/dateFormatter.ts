import moment from "moment";

/**
 * 日時を年月日にフォーマットする
 *
 * @param {string} datetime 日時
 * @returns {string} ○○○○年○月○日(○) ○○:○○ (0パディングなし)
 */
export const getJpnDateTimeDisplay = (datetime: string) => {
  moment.locale("ja");
  return moment(datetime).isValid()
    ? moment(datetime).format("YYYY年M月D日(ddd) H:mm")
    : "";
};

export const formatYearDate = (date: string) => {
  return moment(date).format("Y/M/D");
};

export const formatDate = (date: string, format = "M/D(ddd)") => {
  moment.locale("ja", {
    weekdaysShort: ["日", "月", "火", "水", "木", "金", "土"],
  });
  return moment(date).isValid() ? moment(date).format(format) : "";
};
