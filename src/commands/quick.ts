import {Args, Command, Flags} from '@oclif/core'
import fsExtra from 'fs-extra'
import * as path from "path";
import {WebUntis} from "webuntis";
import boxen from 'boxen';
import Table from 'tty-table';
import kleur from 'kleur';

export default class Quick extends Command {
  static override description = 'quickly see your next lesson'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]
  public async run(): Promise<void> {
    const configPath = path.join(this.config.configDir, 'config.json');
    const config = await fsExtra.readJSON(configPath);
    const { url, username, password, school } = config;

    const untis = new WebUntis(school, username, password, url);
    await untis.login();
    const todayDate = new Date("2025-09-16T09:00:00");
    const timetable = await untis.getOwnTimetableFor(todayDate);

    const dateString = todayDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    //somehow, webuntis output is kinda scuffed and messy and doesn't sort lessons by time defaultly -> we need to do that manually...
    const uniqueLessons = timetable.filter((lesson, index, self) => 
      index === self.findIndex(l => 
        l.startTime === lesson.startTime && l.endTime === lesson.endTime && 
        l.su.map(s => s.name).join(", ") === lesson.su.map(s => s.name).join(", ")
      )
    ).sort((a, b) => a.startTime - b.startTime);

     const nextLesson = uniqueLessons.find(lesson => {
      const lessonStart = new Date();
      lessonStart.setHours(Math.floor(lesson.startTime / 100), lesson.startTime % 100);
      return lessonStart > todayDate;
    });

    if (timetable.length === 0 || !timetable || !nextLesson) {
      this.log(boxen(kleur.bold().yellow(`📅 ${kleur.bold().blue(dateString)}\n\n ${kleur.bold().red('👀 You don\'t have any upcoming lessons.')}`), { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green', title: `🏫 ${kleur.bold().green(school)}`, titleAlignment: 'center', textAlignment: 'center' }));
      return;
    }

      // for context, e.g 8:45 is lesson start
      // Mathe.floor(845 / 100) = Math.floor(8.45) = 8
      // 845 % 100 = 45
      // so we get 8:45
      // padStart just adds 0 to single digit hours, so 8 becomes 08

    const startTime = `${Math.floor(nextLesson.startTime / 100).toString().padStart(2, '0')}:${(nextLesson.startTime % 100).toString().padStart(2, '0')}`;
    const subject = nextLesson.su.map(s => s.longname).join(", ");
    const teacher = nextLesson.te.map(t => t.name).join(", ");
    const room = nextLesson.ro.map(r => r.name).join(", ");

    this.log(`${kleur.cyan('⏰')} ${kleur.bold(startTime)} ${kleur.green('│')} ${kleur.bold().blue(subject)} ${kleur.gray('in')} ${kleur.yellow(room)} ${kleur.gray('with')} ${kleur.magenta(teacher)}`);
    
    await untis.logout();
  }
}

