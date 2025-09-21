import {Args, Command} from '@oclif/core'
import boxen from 'boxen'
import kleur from 'kleur'

export default class Affirmation extends Command {
  static override args = {
    file: Args.string({description: 'file to read'}),
  }
  static override description = 'get some affirmating words to motivate you'
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const url = 'https://api.realinspire.live/v1/quotes/random'
    const response = await fetch(url)
    const data = await response.json()
    const quote = data[0].content
    const author = data[0].author
    this.log(boxen(kleur.green(quote), {padding: 1, margin: 1, borderStyle: 'round', borderColor: 'green', title: `${kleur.bold().yellow(author)}`, titleAlignment: 'center', textAlignment: 'center'}))
  }
}
