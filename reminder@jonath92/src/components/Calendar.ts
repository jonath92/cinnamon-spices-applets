import { DateTime } from "luxon";

const Cinnamon = imports.gi.Cinnamon;
const { Table, Label, Align, BoxLayout, Button } = imports.gi.St

const WEEKDAY_ABBREVATIONS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function createCalendar() {

    const now = DateTime.now()
    const currentMonth = now.monthLong
    const currentYear = now.year


    const table = new Table({ style_class: 'calendar', reactive: true, homogeneous: false });

    const topBoxMonth = new BoxLayout()
    const topBoxYear = new BoxLayout()

    table.add(topBoxMonth, { row: 0, col: 0, col_span: 5 })
    table.add(topBoxYear, { row: 0, col: 5, col_span: 3 })

    const monthBackBtn = new Button({ style_class: 'calendar-change-month-back' })
    const monthLabel = new Label({ style_class: 'calendar-month-label', text: currentMonth })
    const monthForwardBtn = new Button({ style_class: 'calendar-change-month-forward' });
    [monthBackBtn, monthLabel, monthForwardBtn].forEach(actor => topBoxMonth.add(actor))

    const yearBackBtn = new Button({ style_class: 'calendar-change-month-back' })
    const yearLabel = new Label({ style_class: 'calendar-month-label', text: currentYear.toString() })
    const yearForwardBtn = new Button({ style_class: 'calendar-change-month-forward' });
    [yearBackBtn, yearLabel, yearForwardBtn].forEach(actor => topBoxYear.add(actor))

    WEEKDAY_ABBREVATIONS.forEach((weekday, index) => {
        let style_class = 'calendar-day-base calendar-day-heading';
        const label = new Label({ style_class, text: weekday })

        table.add(label, {
            row: 1,
            col: index + 1,
            x_fill: false,
            x_align: Align.MIDDLE
        })
    })

    const beginDay = getBeginDate()

    for (let week = 0; week <= 5; week++) {
        for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
            const isWorkDay = (dayOfWeek !== 5 && dayOfWeek !== 6)
            const isLeft = dayOfWeek === 0
            const isTop = week == 0

            const date = beginDay.plus({week, days: dayOfWeek})

            const style_class = `calendar-day-base calendar-day ${isWorkDay ? ' calendar-work-day' : 'calendar-nonwork-day'}${isLeft ? ' calendar-day-left' : ''}${isTop ? ` calendar-day-top` :''}${date.monthLong === currentMonth ? '' : ' calendar-other-month-day'}${now.month === date.month && now.day=== date.day ? ' calendar-today' : ''}`;

            const button = new Button({ label: date.day.toString(), reactive: true, style_class })

            global.log('style_class', button.style_class)

            table.add(button, { row: week + 2, col: dayOfWeek + 1})
        }



    }


    return table
}



/**
 * returns the first weekday (i.e. Monday) before or equal to the first of the current Month, 
*/
function getBeginDate(): DateTime {
    const now = DateTime.now()

    const firstDayOfMonth = DateTime.fromObject({ year: now.year, month: now.month, day: 1 }).startOf('week')

    return firstDayOfMonth

}