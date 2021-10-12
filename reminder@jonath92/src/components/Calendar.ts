import { DateTime } from "luxon";
import clsx from 'clsx';

const Cinnamon = imports.gi.Cinnamon;
const { Table, Label, Align, BoxLayout, Button } = imports.gi.St

const WEEKDAY_ABBREVATIONS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const now = DateTime.now()
const today = DateTime.fromObject({year: now.year, day: now.day})

// I guess this will only work inside a table. 
function createPaginator(args: { text: string, onBack: () => void, onNext: () => void }) {
    const { text, onBack, onNext } = args

    const backBtn = new Button({ style_class: 'calendar-change-month-back' })
    backBtn.connect('button-press-event', onBack)
    const label = new Label({ style_class: 'calendar-month-label', text })
    const forwardBtn = new Button({ style_class: 'calendar-change-month-forward' })
    forwardBtn.connect('button-press-event', onNext)

    const box = new BoxLayout({ x_expand: true })
    box.add(backBtn)
    box.add(label, { expand: true, x_fill: false, x_align: Align.MIDDLE })
    box.add(forwardBtn)

    return {
        actor: box,
        setText: (newText: string) => label.text = newText
    }
}

// month 1 = Januar, 12 = december
function createHeader(month: number, year: number) {

    const date = DateTime.fromObject({ year, month })

    const monthPaginator = createPaginator({ text: date.monthLong, onBack: () => monthPaginator.setText('new'), onNext: function () { } })
    const yearPaginator = createPaginator({ text: date.year.toString(), onBack: function () { }, onNext: function () { } })

    const layout = new BoxLayout({ x_expand: true })

    layout.add_child(monthPaginator.actor)
    layout.add_child(yearPaginator.actor)

    return layout
}



export function createCalendar(month = today.month, year = today.year) {

    const table = new Table({ style_class: 'calendar', reactive: true, homogeneous: false });

    const header = createHeader(month, year)

    table.add(header, { row: 0, col: 0, col_span: 10 })

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

    const mondayBefore1st = DateTime.fromObject({ year, month, day: 1 }).startOf('week')


    for (let week = 0; week <= 5; week++) {
        for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
            const isWorkDay = (dayOfWeek !== 5 && dayOfWeek !== 6)
            const isLeft = dayOfWeek === 0
            const isTop = week == 0
            const date = mondayBefore1st.plus({ week, days: dayOfWeek })
            const isToday = date.equals(today)

            // some days before/and after the month in the list are shown
            const isOtherMonth = date.month !== today.month

            const style_class = clsx([
                'calendar-day-base', 
                isWorkDay ? 'calendar-work-day' : 'calendar-nonwork-day', 
                isLeft && 'calendar-day-left', 
                isTop && 'calendar-day-top', 
                isToday && 'calendar-today', 
                isOtherMonth && 'calendar-other-month-day'
            ])

            const button = new Button({ label: date.day.toString(), reactive: true, style_class })

            table.add(button, { row: week + 2, col: dayOfWeek + 1 })
        }
    }


    return table
}



