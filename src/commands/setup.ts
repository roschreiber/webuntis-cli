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
  static override flags = {
    //flag for reset (-r)
    reset: Flags.boolean({ char: 'r', description: 'reset the configuration' }),
    //flag for test (-t)
    test: Flags.boolean({ char: 't', description: 'test connection to webuntis' }),
  }

  public async run(): Promise<void> {
    const configPath = path.join(this.config.configDir, 'config.json')
    const { flags } = await this.parse(Setup)

    await fsExtra.ensureDir(this.config.configDir)

    const wlcMessage = `★ Welcome to ${kleur.bold().yellow('Webuntis-CLI!')}\n\n⚡ First, lets set up your connection to WebUntis:`
    const successMessage = `✅ ${kleur.bold().green('Setup Complete!')}\n\n🎉 Everything's configured and ready to go!\n💡 Try running: ${kleur.cyan('webuntis today')}`
    const errMessage = `❌ ${kleur.bold().red('Setup Failed')}\n`

    if (flags.reset) {
      await fsExtra.remove(configPath)
      this.log(
        boxen(
          `🔄 ${kleur.bold().yellow('Configuration Reset')}\n\n${kleur.reset().bold('Your configuration has been reset. Please run the setup again.')}`,
          {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
          },
        ),
      )
      return
    } else if (flags.test) {
      if (!(await fsExtra.pathExists(configPath))) {
        this.log(
          boxen(
            `⚠️  ${kleur.bold().yellow('No Configuration Found')}\n\n${kleur.reset().bold('Please run the setup first using')} ${kleur.cyan('webuntis setup')}`,
              {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green',
                title: `${kleur.bold().yellow('Webuntis-CLI')}`,
                titleAlignment: 'center',
                textAlignment: 'center'
              }
          ),
        )
        return
      }
      const config = await fsExtra.readJSON(configPath)
      const {url, username, password, school} = config

      const untis = new WebUntis(school, username, password, url)
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
        } else {
          this.log(
            boxen(
              `✅ ${kleur.bold().green('Connection Successful!')}\n\n🎉 Successfully connected to WebUntis as ${kleur.bold().cyan(username)} at ${kleur.bold().cyan(school)}`,
              {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green',
                title: `${kleur.bold().yellow('Webuntis-CLI')}`,
                titleAlignment: 'center',
                textAlignment: 'center'
              }
            ),
          )
        }
    } else {
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
        message: `🌐 Schools URL (e.g. "cool-school.webuntis.com")`,
        validate: (input) => {
          if (input.startsWith('https://') || input.startsWith('http://')) {
            return 'Please don\'t include "https://" at the start of the URL!'
          }
          if (!input.endsWith('.webuntis.com')) {
            return 'Please enter a valid URL ending with ".webuntis.com"!'
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'schoolyearstartdate',
        message: `📅 Schoolyear start date (e.g. "09-19" -> 19th of September)`,
        validate: (input) => {
          const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
            if (!regex.test(input)) {
              return 'Please enter a valid date in the format "MM-DD"!'
            }
            return true
          }
      }
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
}
