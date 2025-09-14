import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('today', () => {
  it('runs today cmd', async () => {
    const {stdout} = await runCommand('today')
    expect(stdout).to.contain('hello world')
  })

  it('runs today --name oclif', async () => {
    const {stdout} = await runCommand('today --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
