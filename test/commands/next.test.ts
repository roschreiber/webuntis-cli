import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('next', () => {
  it('runs next cmd', async () => {
    const {stdout} = await runCommand('next')
    expect(stdout).to.contain('hello world')
  })

  it('runs next --name oclif', async () => {
    const {stdout} = await runCommand('next --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
