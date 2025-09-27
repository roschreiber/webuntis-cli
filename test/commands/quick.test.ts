import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('quick', () => {
  it('runs quick cmd', async () => {
    const {stdout} = await runCommand('quick')
    expect(stdout).to.contain('hello world')
  })

  it('runs quick --name oclif', async () => {
    const {stdout} = await runCommand('quick --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
