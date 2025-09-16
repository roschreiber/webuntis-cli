import {Command, Flags} from '@oclif/core'
import fsExtra from 'fs-extra'
import * as path from "path";
import { WebUntis } from 'webuntis';
import kleur from 'kleur';

export default class Absences extends Command {
  static override description = 'get all of the days you were absent'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]
  static override flags = {
    //flag for startdate (-s)
    startdate: Flags.string({char: 's', description: 'start date in YYYY-MM-DD format'}),
    //flag for enddate (-e)
    enddate: Flags.string({char: 'e', description: 'end date in YYYY-MM-DD format'}),
    //if the user has set no startdate it should just list all excuses? -> from the beginning of time lol
    //on the oghet hand, if they have no enddate set that should be today
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Absences)
     const configPath = path.join(this.config.configDir, 'config.json');
      const config = await fsExtra.readJSON(configPath);
      const { url, username, password, school } = config;

    const untis = new WebUntis(school, username, password, url);
    await untis.login();
    const startDate = flags.startdate ? new Date(flags.startdate) : new Date('2000-01-01');
    const endDate = flags.enddate ? new Date(flags.enddate) : new Date();
    const abslessons = await untis.getAbsentLesson(startDate, endDate);

    const absencecount = abslessons.absences.length;
    const notexcusedcount = abslessons.absences.filter(Absences => !Absences.isExcused).length;
    const excusedcount = abslessons.absences.filter(Absences => Absences.isExcused).length;

    if(!flags.startdate && !flags.enddate) {
      this.log(kleur.bgRed().white().bold(" ! ") + kleur.reset(` You have been absent ${kleur.red().bold(absencecount)} times since the start of the school year.\n`));
    } else if(!flags.startdate && flags.enddate) {
      this.log(kleur.bgRed().white().bold(" ! ") + kleur.reset(` You have been absent ${kleur.red().bold(absencecount)} times since the start of the school year until ${kleur.yellow().bold(endDate.toISOString().split('T')[0])}.\n`));
    } else {
      this.log(kleur.bgRed().white().bold(" ! ") + kleur.reset(` You have been absent ${kleur.red().bold(absencecount)} times between ${kleur.yellow().bold(startDate.toISOString().split('T')[0])} and ${kleur.yellow().bold(endDate.toISOString().split('T')[0])}.\n`));
    }

    this.log(kleur.bgGreen().white().bold(" ✓ ") + kleur.reset(` ${kleur.green().bold(excusedcount)} of your absences have been excused.`));

    this.log(kleur.bgYellow().black().bold(" i ") + kleur.reset(` ${kleur.yellow().bold(notexcusedcount)} of your absences have ${kleur.red().bold("not")} been excused.`));

  }
}

/*output:
    {
      "id": 1828,
      "startDate": 20240924,
      "endDate": 20240924,
      "startTime": 1555,
      "endTime": 1730,
      "createDate": 1727270121967,
      "lastUpdate": 1727335909751,
      "createdUser": "Süt",
      "updatedUser": "Her",
      "reasonId": 40,
      "reason": "sonstiger Grund (z.B. Krankheit)",
      "text": "",
      "interruptions": [],
      "canEdit": false,
      "studentName": "Schreiber Robin",
      "excuseStatus": "entschuldigt",
      "isExcused": true,
      "excuse": {
        "id": 462,
        "text": "",
        "excuseDate": 20240926,
        "excuseStatus": "entschuldigt",
        "isExcused": true,
        "userId": 77,
        "username": "Her"
      }
    },
*/