import {Args, Command, Flags} from '@oclif/core'
import fsExtra from 'fs-extra'
import * as path from 'path'
import {WebUntis} from 'webuntis'
import boxen from 'boxen'
import Table from 'tty-table'
import kleur from 'kleur'
import {time} from 'console'

export default class Dashboard extends Command {
  static override description = 'get an overview of your day and stats about you'
  static override examples = ['<%= config.bin %> <%= command.id %>']
  static override aliases = ['db']
  public async run(): Promise<void> {
    const configPath = path.join(this.config.configDir, 'config.json')
    const config = await fsExtra.readJSON(configPath)
    const {url, username, password, school, schoolyearstartdate} = config

    const untis = new WebUntis(school, username, password, url)
    await untis.login()
    const timetable = await untis.getOwnTimetableForToday()

    //schoolyearstartdate in config.json is in MM-DD format
    //so to get the full date we need to add the current year
    const currentYear = new Date().getFullYear()
    const [month, day] = schoolyearstartdate.split('-')
    const startDate = new Date(`${currentYear}-${month}-${day}`)
    const endDate = new Date()

    const abslessons = await untis.getAbsentLesson(startDate, endDate)

    const absencecount = abslessons.absences.length
    const notexcusedcount = abslessons.absences.filter((Absences) => !Absences.isExcused).length
    const excusedcount = abslessons.absences.filter((Absences) => Absences.isExcused).length

    const todayDate = new Date()
    const dateString = todayDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    if (timetable.length === 0 || !timetable) {
      this.log(
        boxen(
          kleur
            .bold()
            .yellow(`📅 ${kleur.bold().blue(dateString)}\n\n ${kleur.bold().red('👀 No lessons found for today, dashboard can\'t be shown.')}`),
          {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
            title: `🏫 ${kleur.bold().green(school)}`,
            titleAlignment: 'center',
            textAlignment: 'center',
          },
        ),
      )
      return
    }

    let header = [
      {
        value: 'time',
        headerColor: 'cyan',
        color: 'white',
        align: 'left',
        width: 15,
      },
      {
        value: 'subject',
        headerColor: 'cyan',
        color: 'white',
        align: 'left',
        width: 10,
      },
      {
        value: 'teacher',
        headerColor: 'cyan',
        color: 'white',
        align: 'left',
        width: 10,
      },
      {
        value: 'room',
        headerColor: 'cyan',
        color: 'white',
        align: 'left',
        width: 8,
      },
    ]

    //somehow, webuntis output is kinda scuffed and messy and doesn't sort lessons by time defaultly -> we need to do that manually...
    const uniqueLessons = timetable
      .filter(
        (lesson, index, self) =>
          index ===
          self.findIndex(
            (l) =>
              l.startTime === lesson.startTime &&
              l.endTime === lesson.endTime &&
              l.su.map((s) => s.name).join(', ') === lesson.su.map((s) => s.name).join(', '),
          ),
      )
      .sort((a, b) => a.startTime - b.startTime)

    const rows = uniqueLessons.map((lesson) => {
      // for context, e.g 8:45 is lesson start
      // Mathe.floor(845 / 100) = Math.floor(8.45) = 8
      // 845 % 100 = 45
      // so we get 8:45
      // padStart just adds 0 to single digit hours, so 8 becomes 08

      const startTime = `${String(Math.floor(lesson.startTime / 100)).padStart(2, '0')}:${String(
        lesson.startTime % 100,
      ).padStart(2, '0')}`
      const endTime = `${String(Math.floor(lesson.endTime / 100)).padStart(2, '0')}:${String(
        lesson.endTime % 100,
      ).padStart(2, '0')}`

      return {
        time: `${startTime}-${endTime}`,
        teacher: lesson.te.map((t) => t.name).join(', '),
        subject: lesson.su.map((s) => s.name).join(', '),
        room: lesson.ro.map((r) => r.name).join(', '),
      }
    })

    let ANSI = Table(header, rows)
    let table = ANSI.render()

    //this.log(boxen(`📅 ${kleur.bold().blue(dateString)}\n${table.toString()}`, { padding: 1, textAlignment: 'center', margin: 1, borderStyle: 'round', borderColor: 'green', title: `🏫 ${kleur.bold().green(school)}`, titleAlignment: 'center' }));

    const headerBox = boxen(`📅 ${kleur.bold().blue(dateString)}`, {
      padding: {top: 0, bottom: 0, left: 2, right: 2},
      margin: {top: 1, bottom: 0, left: 11.5, right: 1},
      borderStyle: 'round',
      borderColor: 'cyan',
      textAlignment: 'center',
    })

    const timetableBox = boxen(table.toString(), {
      padding: 1,
      margin: {top: 0, bottom: 1, left: 1, right: 1},
      borderStyle: 'round',
      borderColor: 'green',
      title: `🏫 ${kleur.bold().green(school)}`,
      titleAlignment: 'center',
    })

    const uniqueSubjects = [...new Set(uniqueLessons.flatMap((lesson) => lesson.su.map((s) => s.name)))]

    this.log(headerBox)
    this.log(timetableBox)
    const todayBox = boxen(
      `📚 ${kleur.bold().yellow(`${uniqueLessons.length} lessons`)} • ` +
        `📖 ${kleur.bold().magenta(`${uniqueSubjects.length} subjects`)}`,
      {
        padding: 1,
        margin: {top: 0, bottom: 1, left: 1, right: 1},
        borderStyle: 'round',
        borderColor: 'blue',
        textAlignment: 'center',
        title: `⏳ ${kleur.bold().green('TODAY')}`,
        titleAlignment: 'center',
      },
    )

    const aboutYOuBox = boxen(
      `❌ ${kleur.bold().red(`${absencecount} total absences`)} • ` +
        `✅ ${kleur.bold().green(`${excusedcount} excused`)}` +
        ` • ` +
        `❎ ${kleur.bold().yellow(`${notexcusedcount} unexcused`)}`,
      {
        padding: 1,
        margin: {top: 0, bottom: 1, left: 1, right: 1},
        borderStyle: 'round',
        borderColor: 'red',
        textAlignment: 'center',
        title: `👤 ${kleur.bold().green('ABOUT YOU')}`,
        titleAlignment: 'center',
      },
    )

    this.log(todayBox)
    this.log(aboutYOuBox)

    await untis.logout();
  }
}
