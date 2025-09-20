import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('timegrid', () => {
  it('runs timegrid cmd', async () => {
    const {stdout} = await runCommand('timegrid')
    expect(stdout).to.contain('hello world')
  })

  it('runs timegrid --name oclif', async () => {
    const {stdout} = await runCommand('timegrid --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
