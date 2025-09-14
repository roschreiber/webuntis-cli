import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('setup', () => {
  it('runs setup cmd', async () => {
    const {stdout} = await runCommand('setup')
    expect(stdout).to.contain('hello world')
  })

  it('runs setup --name oclif', async () => {
    const {stdout} = await runCommand('setup --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
