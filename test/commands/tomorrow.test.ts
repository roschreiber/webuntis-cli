import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('tomorrow', () => {
  it('runs tomorrow cmd', async () => {
    const {stdout} = await runCommand('tomorrow')
    expect(stdout).to.contain('hello world')
  })

  it('runs tomorrow --name oclif', async () => {
    const {stdout} = await runCommand('tomorrow --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
