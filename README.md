<p align="center">
  <img src="https://github.com/roschreiber/webuntis-cli/blob/main/mediakit/webuntis-cli.png?raw=true" width="400" alt="webuntis-cli's logo">
</p>

# webuntis-cli

**webuntis-cli** is a simple command-line interface (CLI) to interact with WebUntis, allowing you to fetch your timetable, absences and more directly from your terminal.
It gets data straight from WebUntis's JSON RPC API thanks to [this](https://github.com/SchoolUtils/WebUntis) wrapper.

---

## Features

> [!IMPORTANT]
> webuntis-cli currently does not account for substituted lessons or moved rooms.
> This will be added soon, but for the meantime, please double-check through WebUntis itself.

- Fetch your timetable for today, tomorrow and the entire week.
- View your absent, current, and next lessons.
- An easy to use, instructed and prompted setup.
- A nice dashboard to see some stats and information.

---

## Installation

webuntis-cli is made using [oclif](https://oclif.io/) which allows you to package your CLI tools directly into installers.
If you want to download webuntis-cli, please head to the Releases tab and download it for your platform.

> [!NOTE]
> We currently do not support mac. 
> webuntis-cli will soon also be published to npm once it is in a more stable state.

> [!IMPORTANT]
> You might get a error saying that your PATH is larger than 1024 bytes. This is done by NSIS and I can't fix it myself. If that happens, please add webuntis-cli to PATH manually.

After installing webuntis-cli, try running `webuntis setup`!

## TO-DO

Below is a quick to-do list with all the features that currently are in the cli, and ones that I plan to add soon.

- [x] Basic commands for viewing your timetable
    - [x] View your timetable for today, tomorrow & the entire week
    - [ ] View your timetable for a specific day
- [x] View your absences
    - [x] Filter your absent days through a start aswell as a enddate
    - [ ] View an exact list of all your absent days 
- [x] Basic Dashboard
    - [ ] Make the dashboard more 'about-you', include more information and not just 'basic' stuff like your current timetable (?)
- [ ] Teacher / Subject specific Commands 

## Building

### Prerequisites

Please make sure that you have npm & git installed, aswell node.js 18+ (I recommend LTS).
Make sure you have [oclif](https://oclif.io/) installed as well, or install it using `npm ci` in the step below.

### Clone & Install

```bash
git clone https://github.com/roschreiber/webuntis-cli.git
cd webuntis-cli
npm ci
```

### Building

Oclif has a premade script for building the CLI.

```bash
npm run build
```

If your build succeeded and you want to package & create a installer, oclif has a command for that aswell.

```bash
oclif pack [PLATFORM]
```

[PLATFORM] being `deb`, `win`, `macos` or `tarballs`.

## Notice

I am not affiliated with Untis GmbH nor with WebUntis API. Use this at your own risk.
