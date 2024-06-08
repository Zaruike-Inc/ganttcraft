# GanttCraft

GanttCraft is an innovative initiative focused on automating the creation of Gantt charts from the output of a Git
repository, aiming to optimize project management by leveraging existing data in the development process. This project
aims to simplify the visualization of the timeline of tasks and facilitate collaboration within teams by allowing a
better understanding of the progress of the project.

### Key Features :

1. Intuitive Git Integration : GanttCraft seamlessly connects to chosen Git repositories, pulling
   automatically details numbers like descriptions, titles and managers.

   | Provider         | Supported | Demo URL                              |
   |------------------|-----------|---------------------------------------|
   | Portail          |           | https://ganttcraft.zaruike.dev        |
   | Github           | &#x2705;  | https://github.ganttcraft.zaruike.dev |
   | Gitlab           | &#x2705;  | https://gitlab.ganttcraft.zaruike.dev |
   | Gitlab Self Host | &#x2705;  | https://gitlab.ganttcraft.zaruike.dev |
   | Bitbucket        | &#x274C;  | `SOON`                                |
   | Gitea            | &#x274C;  | `SOON`                                |

3. Automated Gantt Chart Creation : By leveraging data from Git issues, GanttCraft generates
   automatically detailed Gantt charts, displaying the scheduling of tasks according to their due dates
   deadline and their relationships.

4. Collaborative visualization : GanttCraft's interactive interface allows team members to view
   progress of the project and understand the dependencies between tasks, which promotes coordination and
   collaboration.

5. Dynamic Synchronization : Changes to Git issues are automatically reflected in Git issues.
   Gantt charts, ensuring information stays up-to-date without the need for manual intervention.

6. Simplified Personalization : Although alerts and export are not yet supported, GanttCraft
   offers customization options to adjust the colors and styles of the tasks, thus adapting the interface to the
   user preferences.

### Benefits :

- Time saving : Eliminate the need to manually create Gantt charts, freeing up time for focus on development tasks.

- Transparency : A visual view of tasks helps the team better understand project priorities and status.

- Centralization of Information : Bringing project and development details together in one place improves
  co-ordination and communication.

- Error Reduction : Automation ensures information is accurate and up-to-date, minimizing risk
  of human errors.

## Todo :
- [ ] Implement pagination for prevent the limitation of 100 issues by Gitlab and Github
- [ ] Implement other provider
   - [ ] Bitbucket
   - [ ] Gitea
- [ ] Meta data in issues / milestone

# Installation / Deployment

## Prerequisite

- Node LTS or Latest
- Typescript (if you're using dev version or for building your prod version)

## Installation

Copy the `.env.example` in ``.env``

```yml
# You can choose your provider here , gitlab, github, bitbucket, gitea
GIT_PROVIDER="GITHUB"
# Secret IN your GIT
GIT_CLIENT_ID=
GIT_CLIENT_SECRET=
NEXT_PUBLIC_GIT_CALLBACK_DOMAIN=http://127.0.0.1:3081
# For cookie configuration
COOKIE_SECRET=
# Facultative field here
NEXT_PUBLIC_GIT_HOST="https://github.com"
# Site name
SITE_NAME="GanttCraft"
```

Start the dev server with nodemon
```bash
npx nodemon
```

Start the prod server with node.js
```bash
# If you have a dev version you need to build before with
# With yarn
yarn build
# With npm
npm run build
# With yarn
yarn start:prod
# With npm
npm run start:prod
```

## Contributing

GanttCraft is an open source project: your contribution is greatly appreciated! First make sure to have a look at the
[CONTRIBUTING guide](./CODE_OF_CONDUCT.md).

## Licence

GanttCraft application is distributed under the [Apache License, Version 2.0](./LICENSE). Please have look at the dependencies
licences. If you plan on using, building or distributing this application.
