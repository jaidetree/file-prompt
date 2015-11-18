import readline from 'readline';
import Prompt from './prompt';

function basic () {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.setPrompt(">", 2);

  rl.on('line', (line) => {
    console.log(line);
    rl.output.end();
    rl.close();
  });

  rl.on('close', () => {
    process.exit(1);
  });

  process.stdout.write('\n');
  rl.prompt();
}

function adv () {
  let prompt = new Prompt();

  prompt.beckon('What is up?')
    .then((answer) => {
      console.log(answer);
    });
}

adv();
