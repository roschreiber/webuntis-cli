import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('overview', () => {
  it('runs overview cmd', async () => {
    const {stdout} = await runCommand('overview')
    expect(stdout).to.contain('hello world')
  })

  it('runs overview --name oclif', async () => {
    const {stdout} = await runCommand('overview --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
