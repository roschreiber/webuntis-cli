import { Command, Flags } from '@oclif/core'
import fsExtra from 'fs-extra'
import * as path from 'path'
import { WebUntis } from 'webuntis'
import kleur from 'kleur'
import boxen from 'boxen'

export default class Absences extends Command {
  static override description = 'get all of the days you were absent'
  static override examples = ['<%= config.bin %> <%= command.id %>']
  static override aliases = ['ab']
  static override flags = {
    //flag for startdate (-s)
    startdate: Flags.string({ char: 's', description: 'start date in YYYY-MM-DD format' }),
    //flag for enddate (-e)
    enddate: Flags.string({ char: 'e', description: 'end date in YYYY-MM-DD format' }),
    //if the user has set no startdate it should just list all excuses? -> from the beginning of time lol
    //on the oghet hand, if they have no enddate set that should be today
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Absences)
    const configPath = path.join(this.config.configDir, 'config.json')
    const config = await fsExtra.readJSON(configPath)
    const { url, username, password, school, schoolyearstartdate } = config

    const untis = new WebUntis(school, username, password, url)
    await untis.login()
    //schoolyearstartdate in config.json is in MM-DD format
    //so to get the full date we need to add the current year
    const currentYear = new Date().getFullYear()
    const [month, day] = schoolyearstartdate.split('-')
    const startDate = new Date(`${currentYear}-${month}-${day}`)
    const endDate = flags.enddate ? new Date(flags.enddate) : new Date()
    const abslessons = await untis.getAbsentLesson(startDate, endDate)

    const absencecount = abslessons.absences.length
    const notexcusedcount = abslessons.absences.filter((Absences) => !Absences.isExcused).length
    const excusedcount = abslessons.absences.filter((Absences) => Absences.isExcused).length

    const dateStringStart = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const dateStringEnd = endDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    if (!flags.startdate && !flags.enddate) {
      this.log(
        /*kleur.bgRed().white().bold(' ! ') +
          kleur.reset(
            ` You have been absent ${kleur.red().bold(absencecount)} times since the start of the school year.\n`,
          ),*/
        boxen(
          kleur
            .bold()
            .yellow(`📅 ${kleur.bold().blue(dateStringEnd)}\n\n ${kleur.bold().reset("You have been absent " + kleur.red().bold(absencecount) + kleur.reset().bold(" times since the start of the school year."))}\n\n` +
              `${kleur.green().bold("✓ " + excusedcount)} ${kleur.reset().bold("of your absences have been excused.")}\n` +
              `${kleur.yellow().bold("i " + notexcusedcount)} ${kleur.reset().bold("of your absences have " + kleur.red().bold('not') + kleur.reset().bold(" been excused."))}`,
            ),
          {
            padding: 1,
            margin: { top: 1, bottom: 1, left: 2, right: 2 },
            borderStyle: 'round',
            borderColor: 'green',
            title: `🏫 ${kleur.bold().green(school)}`,
            titleAlignment: 'center',
            textAlignment: 'center',
          },
        ),
      )
    } else if (!flags.startdate && flags.enddate) {
      /*this.log(
        kleur.bgRed().white().bold(' ! ') +
          kleur.reset(
            ` You have been absent ${kleur
              .red()
              .bold(absencecount)} times since the start of the school year until ${kleur
              .yellow()
              .bold(endDate.toISOString().split('T')[0])}.\n`,
          ),
      )*/
      this.log(
        boxen(
          kleur
            .bold()
            .yellow(`📅 ${kleur.bold().blue(dateStringEnd)}\n\n ${kleur.bold().reset("You have been absent " + kleur.red().bold(absencecount) + kleur.reset().bold(" times since the start of the school year until " + kleur.yellow().bold(endDate.toISOString().split('T')[0]) + "."))}\n\n` +
              `${kleur.green().bold("✓ " + excusedcount)} ${kleur.reset().bold("of your absences have been excused.")}\n` +
              `${kleur.yellow().bold("i " + notexcusedcount)} ${kleur.reset().bold("of your absences have " + kleur.red().bold('not') + kleur.reset().bold(" been excused."))}`,
            ),
          {
            padding: 1,
            margin: { top: 1, bottom: 1, left: 2, right: 2 },
            borderStyle: 'round',
            borderColor: 'green',
            title: `🏫 ${kleur.bold().green(school)}`,
            titleAlignment: 'center',
            textAlignment: 'center',
          },
        ),
      )
    } else {
      /*this.log(
        kleur.bgRed().white().bold(' ! ') +
          kleur.reset(
            ` You have been absent ${kleur.red().bold(absencecount)} times between ${kleur
              .yellow()
              .bold(startDate.toISOString().split('T')[0])} and ${kleur
              .yellow()
              .bold(endDate.toISOString().split('T')[0])}.\n`,
          ),
      )*/
      this.log(
        boxen(
          kleur
            .bold()
            .yellow(`📅 ${kleur.bold().blue(dateStringStart + " - " + dateStringEnd)}\n\n ${kleur.bold().reset("You have been absent " + kleur.red().bold(absencecount) + kleur.reset().bold(" times between " + kleur.yellow().bold(startDate.toISOString().split('T')[0]) + " and " + kleur.yellow().bold(endDate.toISOString().split('T')[0]) + "."))}\n\n` +
              `${kleur.green().bold("✓ " + excusedcount)} ${kleur.reset().bold("of your absences have been excused.")}\n` +
              `${kleur.yellow().bold("i " + notexcusedcount)} ${kleur.reset().bold("of your absences have " + kleur.red().bold('not') + kleur.reset().bold(" been excused."))}`,
            ),
          {
            padding: 1,
            margin: { top: 1, bottom: 1, left: 2, right: 2 },
            borderStyle: 'round',
            borderColor: 'green',
            title: `🏫 ${kleur.bold().green(school)}`,
            titleAlignment: 'center',
            textAlignment: 'center',
          },
        ),
      )

      await untis.logout();
    }
  }
}