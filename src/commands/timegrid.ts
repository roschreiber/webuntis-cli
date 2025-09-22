import {Args, Command, Flags} from '@oclif/core'
import fsExtra from 'fs-extra'
import * as path from "path";
import {WebUntis} from "webuntis";
import boxen from 'boxen';
import Table from 'tty-table';
import kleur from 'kleur';
import { time } from 'console';

export default class Timegrid extends Command {
  static override description = 'show your schools timegrid'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]
  public async run(): Promise<void> {
    const configPath = path.join(this.config.configDir, 'config.json');
    const config = await fsExtra.readJSON(configPath);
    const { url, username, password, school } = config;

    const untis = new WebUntis(school, username, password, url);
    await untis.login();
    
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    const schoolWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    let header = [
      {
        value: "Day",
        headerColor: "cyan",
        color: "white",
        align: "left",
        width: 12,
      },
      {
        value: "Start Time", 
        headerColor: "cyan",
        color: "white",
        align: "center",
        width: 12,
      },
      {
        value: "End Time",
        headerColor: "cyan", 
        color: "white",
        align: "center",
        width: 12,
      },
    ];

    let rows = [];

    for (let i = 0; i < schoolWeek.length; i++) { 
      const dayDate = new Date();
      dayDate.setDate(todayDate.getDate() - dayOfWeek + 1 + i);
      const timetable = await untis.getOwnTimetableFor(dayDate);

      if (timetable.length === 0 || !timetable) {
        rows.push({
          Day: schoolWeek[i],
          "Start Time": 'N/A',
          "End Time": 'N/A',
        });
        continue;
      }

      const uniqueLessons = timetable.filter((lesson, index, self) => 
      index === self.findIndex(l => 
        l.startTime === lesson.startTime && l.endTime === lesson.endTime && 
        l.su.map(s => s.name).join(", ") === lesson.su.map(s => s.name).join(", ")
      )
    ).sort((a, b) => a.startTime - b.startTime);

    const firstLesson = uniqueLessons[0];
    const lastLesson = uniqueLessons[uniqueLessons.length - 1];

    const startTime = `${String(Math.floor(firstLesson.startTime / 100)).padStart(2, '0')}:${String(firstLesson.startTime % 100).padStart(2, '0')}`;
    const endTime = `${String(Math.floor(lastLesson.endTime / 100)).padStart(2, '0')}:${String(lastLesson.endTime % 100).padStart(2, '0')}`;

    rows.push({
      Day: schoolWeek[i],
      "Start Time": startTime,
      "End Time": endTime,
    });
    }

    const dateString = todayDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let ANSI = Table(header, rows);
    let table = ANSI.render();

    this.log(boxen(`📅 ${kleur.bold().blue("Week of " + dateString)}\n${table.toString()}`, { padding: 1, textAlignment: 'center', margin: 1, borderStyle: 'round', borderColor: 'green', title: `🏫 ${kleur.bold().green(school)}`, titleAlignment: 'center' }));

    await untis.logout();
    
    //this.log(boxen(`📅 ${kleur.bold().blue(dateString)}\n${table.toString()}`, { padding: 1, textAlignment: 'center', margin: 1, borderStyle: 'round', borderColor: 'green', title: `🏫 ${kleur.bold().green(school)}`, titleAlignment: 'center' }));
  }
}