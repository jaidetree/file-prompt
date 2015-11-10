import ProjectPath from '../lib/project_path';

let paths = {
      cwd: process.env.INIT_CWD,
      gulp: {},
      dirs: {
        base: ''
      },
      js: {},
    },
    path = new ProjectPath(paths);


paths.js.dir = path.to('src');
paths.js.src = path.to(paths.js.dir, '**/*.js');
paths.js.dest = path.to('lib');

export default path;
