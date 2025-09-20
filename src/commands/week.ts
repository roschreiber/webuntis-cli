import {Args, Command, Flags} from '@oclif/core'
import fsExtra from 'fs-extra'
import * as path from "path";
import {WebUntis} from "webuntis";
import boxen from 'boxen';
import Table from 'tty-table';
import kleur from 'kleur';
import { time } from 'console';

export default class Week extends Command {
  static override description = 'get information from this weeks webuntis planner'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]
  public async run(): Promise<void> {
    const configPath = path.join(this.config.configDir, 'config.json');
    const config = await fsExtra.readJSON(configPath);
    const { url, username, password, school } = config;
    this.log(JSON.stringify(config, null, 2));

    const todayDate = new Date();

    const untis = new WebUntis(school, username, password, url);
    await untis.login();
    //the built in timetable function for getting the entire week is weird, so we need to do it one by one lol
    const dayOfWeek = todayDate.getDay();
    const schoolWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekData = [];
    
    for (let i = 0; i < schoolWeek.length; i++) { 
      const dayDate = new Date();
      dayDate.setDate(todayDate.getDate() - dayOfWeek + 1 + i);
      const timetable = await untis.getOwnTimetableFor(dayDate);
      
      weekData.push({
        dayName: schoolWeek[i],
        date: dayDate,
        timetable: timetable
      });
    }

    // Display each day
    for (const day of weekData) {
      const dateString = day.date.toLocaleDateString('en-Us', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (day.timetable.length === 0 || !day.timetable) {
        this.log(boxen(kleur.bold().yellow(`📅 ${kleur.bold().blue(dateString)}\n\n ${kleur.bold().red('👀 No lessons found for this day.')}`), { 
          padding: 1, 
          margin: 1, 
          borderStyle: 'round', 
          borderColor: 'green', 
          title: `🏫 ${kleur.bold().green(school)}`, 
          titleAlignment: 'center', 
          textAlignment: 'center' 
        }));
        continue;
      }
      let header = [
        {
          value: "time",
          headerColor: "cyan",
          color: "white",
          align: "left",
          width: 15,
        },
        {
          value: "subject",
          headerColor: "cyan",
          color: "white",
          align: "left",
          width: 10,
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
      const uniqueLessons = day.timetable.filter((lesson, index, self) => 
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

      this.log(boxen(`📅 ${kleur.bold().blue(dateString)}\n${table.toString()}`, { 
        padding: 1, 
        textAlignment: 'center', 
        margin: 1, 
        borderStyle: 'round', 
        borderColor: 'green', 
        title: `🏫 ${kleur.bold().green(school)}`, 
        titleAlignment: 'center' 
      }));
    }
  }
}
