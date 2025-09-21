import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('affirmation', () => {
  it('runs affirmation cmd', async () => {
    const {stdout} = await runCommand('affirmation')
    expect(stdout).to.contain('hello world')
  })

  it('runs affirmation --name oclif', async () => {
    const {stdout} = await runCommand('affirmation --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
