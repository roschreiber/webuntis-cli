import {Args, Command, Flags} from '@oclif/core'
import enquirer from 'enquirer';
const { prompt } = enquirer;
import fsExtra from 'fs-extra'
import * as path from "path";
import kleur from 'kleur';

export default class Setup extends Command {
  static override description = 'setup the connection to the webuntis api'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]
  
  public async run(): Promise<void> {
    const configPath = path.join(this.config.configDir, 'config.json');

    this.log("\n✨ Welcome to " + kleur.italic("Webuntis-CLI!") + "\n");
    this.log("⚡ First, let's set up your connection to WebUntis:\n");

    await prompt([
    {
      type: 'input',  
      name: 'school',
      message: `🏫 School name (e.g. "my-school")`,
    },
    {
      type: 'input',
      name: 'username',
      message: `👤 Username (e.g. "my-username")`,
    },
    {
      type: 'password',
      name: 'password',
      message: `🔑 Password`,
    },
    {
      type: 'input',
      name: 'URL',
      message: `🌐 Schools URL (e.g. "https://cool-school.webuntis.com/")`,
      validate: input => input.startsWith('https://') ? true : 'Please enter a valid URL starting with "https://"!',
    },
  ]).then(answer => fsExtra.writeJson(configPath, answer), error => {
    this.log("❌ Failed to save config: " + error.message);
  }), this.log("\n✅ Everything's set up now! Have fun! :)");


    // to get data from congif: const { url, username, password } = await fs.readJSON(configPath);
  }
}
