import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('teachers', () => {
  it('runs teachers cmd', async () => {
    const {stdout} = await runCommand('teachers')
    expect(stdout).to.contain('hello world')
  })

  it('runs teachers --name oclif', async () => {
    const {stdout} = await runCommand('teachers --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
