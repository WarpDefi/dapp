import dayjs from 'dayjs'

export const formatDate = (time: dayjs.Dayjs, typeFormat?: string) => time.format(typeFormat || 'MMM D YYYY hh:mm A')
