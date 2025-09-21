import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('now', () => {
  it('runs now cmd', async () => {
    const {stdout} = await runCommand('now')
    expect(stdout).to.contain('hello world')
  })

  it('runs now --name oclif', async () => {
    const {stdout} = await runCommand('now --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
