import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('absences', () => {
  it('runs absences cmd', async () => {
    const {stdout} = await runCommand('absences')
    expect(stdout).to.contain('hello world')
  })

  it('runs absences --name oclif', async () => {
    const {stdout} = await runCommand('absences --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
