import * as dayjs from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone';
dayjs.extend(timezonePlugin);

export function toDateStr(date) {
    const dateFormat = 'YYYY-MM-DD';
    return date.format(dateFormat, { timeZone: dayjs.tz.guess()})
}

export function toDateTimeStr(datetime) {
    return dayjs(datetime).format('YYYY-MM-DD HH:mm', { timeZone: dayjs.tz.guess() });
}

export function toDateTimeStrWithAmPm(datetime) {
    return dayjs(datetime).format('YYYY-MM-DD hh:mm A', { timeZone: dayjs.tz.guess() });
}