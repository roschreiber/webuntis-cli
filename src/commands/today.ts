import {Args, Command, Flags} from '@oclif/core'
import fsExtra from 'fs-extra'
import * as path from "path";
import {WebUntis} from "webuntis";
import boxen from 'boxen';
import Table from 'tty-table';
import kleur from 'kleur';
import { time } from 'console';

export default class Today extends Command {
  static override description = 'get information from todays webuntis planner'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]
  public async run(): Promise<void> {
    const configPath = path.join(this.config.configDir, 'config.json');
    const config = await fsExtra.readJSON(configPath);
    const { url, username, password, school } = config;
    this.log(JSON.stringify(config, null, 2));

    const untis = new WebUntis(school, username, password, url);
    await untis.login();
    const timetable = await untis.getOwnTimetableForToday();
    this.log(JSON.stringify(timetable, null, 2));

    const todayDate = new Date();
    const dateString = todayDate.toLocaleDateString('en-Us', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    if (timetable.length === 0 || !timetable) {
      this.log(boxen(kleur.bold().yellow(`📅 ${kleur.bold().blue(dateString)}\n\n ${kleur.bold().red('👀 No lessons found for today.')}`), { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green', title: `🏫 ${kleur.bold().green(school)}`, titleAlignment: 'center', textAlignment: 'center' }));
      return;
    }
 
    let header = [
      {
        value: "time",
        headerColor: "cyan",
        color: "white",
        align: "center",
        width: 15,
      },
      {
        value: "subject",
        headerColor: "cyan",
        color: "white",
        align: "left",
        width: 12,
      },
      {
        value: "teacher",
        headerColor: "cyan",
        color: "white",
        align: "left",
        width: 10,
      },
      {
        value: "room",
        headerColor: "cyan",
        color: "white",
        align: "left",
        width: 8,
      }
    ]

    //somehow, webuntis output is kinda scuffed and messy and doesn't sort lessons by time defaultly -> we need to do that manually...
    const uniqueLessons = timetable.filter((lesson, index, self) => 
      index === self.findIndex(l => 
        l.startTime === lesson.startTime && l.endTime === lesson.endTime && 
        l.su.map(s => s.name).join(", ") === lesson.su.map(s => s.name).join(", ")
      )
    ).sort((a, b) => a.startTime - b.startTime);

    const rows = uniqueLessons.map(lesson => {

      // for context, e.g 8:45 is lesson start
      // Mathe.floor(845 / 100) = Math.floor(8.45) = 8
      // 845 % 100 = 45
      // so we get 8:45
      // padStart just adds 0 to single digit hours, so 8 becomes 08

      const startTime = `${String(Math.floor(lesson.startTime / 100)).padStart(2, '0')}:${String(lesson.startTime % 100).padStart(2, '0')}`;
      const endTime = `${String(Math.floor(lesson.endTime / 100)).padStart(2, '0')}:${String(lesson.endTime % 100).padStart(2, '0')}`;

      return {
        time: `${startTime}-${endTime}`,
        teacher: lesson.te.map(t => t.name).join(", "),
        subject: lesson.su.map(s => s.name).join(", "),
        room: lesson.ro.map(r => r.name).join(", "),
      }
    });

    let ANSI = Table(header, rows);
    let table = ANSI.render();

    this.log(boxen(`📅 ${kleur.bold().blue(dateString)}\n${table.toString()}`, { padding: 1, textAlignment: 'center', margin: 1, borderStyle: 'round', borderColor: 'green', title: `🏫 ${kleur.bold().green(school)}`, titleAlignment: 'center' }));
  }
}


//Output example, I want to use boxen / tty table to display this in a table. 
/*
[
  {
    "id": 321585,
    "date": 20250916,
    "startTime": 800,
    "endTime": 845,
    "kl": [
      {
        "id": 135,
        "name": "Jg1",
        "longname": "Jahrgangsstufe 1"
      }
    ],
    "te": [
      {
        "id": 70,
        "name": "Her",
        "longname": "Hermanutz, Stephanie"
      }
    ],
    "su": [
      {
        "id": 46,
        "name": "E",
        "longname": "Englisch"
      }
    ],
    "ro": [
      {
        "id": 58,
        "name": "FFR",
        "longname": "Französischfachraum"
      }
    ],
    "lsnumber": 131500,
    "sg": "E_Jg1_Her",
    "activityType": "Unterricht"
  },
  {
    "id": 321588,
    "date": 20250916,
    "startTime": 845,
    "endTime": 930,
    "kl": [
      {
        "id": 135,
        "name": "Jg1",
        "longname": "Jahrgangsstufe 1"
      }
    ],
    "te": [
      {
        "id": 70,
        "name": "Her",
        "longname": "Hermanutz, Stephanie"
      }
    ],
    "su": [
      {
        "id": 46,
        "name": "E",
        "longname": "Englisch"
      }
    ],
    "ro": [
      {
        "id": 58,
        "name": "FFR",
        "longname": "Französischfachraum"
      }
    ],
    "lsnumber": 131500,
    "sg": "E_Jg1_Her",
    "activityType": "Unterricht"
  },
*/