import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('week', () => {
  it('runs week cmd', async () => {
    const {stdout} = await runCommand('week')
    expect(stdout).to.contain('hello world')
  })

  it('runs week --name oclif', async () => {
    const {stdout} = await runCommand('week --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
