import project from '../lib/project';

let paths = project.paths;

paths.js = {};
paths.js.dir = project.to('src'); // ../../src;
paths.js.src = project.to(paths.js.dir, '**/*.js'); // ../../src/**/*.js
paths.js.dest = project.to('lib'); // ../../lib

export default project;
