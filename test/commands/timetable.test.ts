import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('timetable', () => {
  it('runs timetable cmd', async () => {
    const {stdout} = await runCommand('timetable')
    expect(stdout).to.contain('hello world')
  })

  it('runs timetable --name oclif', async () => {
    const {stdout} = await runCommand('timetable --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
