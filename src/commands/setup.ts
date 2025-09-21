import {Args, Command, Flags} from '@oclif/core'
import enquirer from 'enquirer'
const {prompt} = enquirer
import fsExtra from 'fs-extra'
import * as path from 'path'
import kleur from 'kleur'
import boxen from 'boxen'
import {WebUntis} from 'webuntis'

interface SetupConfig {
  school: string
  username: string
  password: string
  url: string
}

export default class Setup extends Command {
  static override description = 'setup the connection to the webuntis api'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    const configPath = path.join(this.config.configDir, 'config.json')

    const wlcMessage = `★ Welcome to ${kleur.bold().yellow('Webuntis-CLI!')}\n\n⚡ First, lets set up your connection to WebUntis:`
    const successMessage = `✅ ${kleur.bold().green('Setup Complete!')}\n\n🎉 Everything's configured and ready to go!\n💡 Try running: ${kleur.cyan('webuntis today')}`
    const errMessage = `❌ ${kleur.bold().red('Setup Failed')}\n`
    
    this.log(
      boxen(wlcMessage, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        title: `${kleur.bold().yellow('Webuntis-CLI')}`,
        titleAlignment: 'center',
        textAlignment: 'center'
      }),
    )

    await prompt([
      {
        type: 'input',
        name: 'school',
        message: `🏫 School name (e.g. "cool school")`,
      },
      {
        type: 'input',
        name: 'username',
        message: `👤 Username (e.g. "cool dude")`,
      },
      {
        type: 'password',
        name: 'password',
        message: `🔑 Password`,
      },
      {
        type: 'input',
        name: 'url',
        message: `🌐 Schools URL (e.g. "cool-school.webuntis.com/")`,
        validate: (input) => {
          if (input.startsWith('https://') || input.startsWith('http://')) {
            return 'Please don\'t include "https://" at the start of the URL!'
          }
          if (!input.endsWith('.webuntis.com')) {
            return 'Please enter a valid URL ending with ".webuntis.com"!'
          }
          return true
        },
      },
    ]).then(
      async (answer) => {
        const config = answer as SetupConfig
        const untis = new WebUntis(config.school, config.username, config.password, config.url)
        await untis.login()
        const validateSession = await untis.validateSession()

        if (!validateSession) {
          this.log(
            boxen(errMessage, {
              padding: 1,
              margin: 1,
              borderStyle: 'single',
              borderColor: 'red',
            }),
          )

          return
        }
        fsExtra.writeJson(configPath, config, {spaces: 2})

        this.log(
          boxen(successMessage, {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
          }),
        )
      },
      (error) => {
        this.log(
          boxen(errMessage, {
            padding: 1,
            margin: 1,
            borderStyle: 'single',
            borderColor: 'red',
          }),
        )
      },
    )

    // to get data from congif: const { url, username, password, school } = await fs.readJSON(configPath);
  }
}
