import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = await loadStdlib(process.env);
//const reach = loadStdlib(process.env);
(async () => {

  const startingBalance = stdlib.parseCurrency(10);
  
  const accAlice = await stdlib.newTestAccount(startingBalance);
  const accBob = await stdlib.newTestAccount(startingBalance);

// Alice deploys the application to backend
  const ctcAlice = accAlice.contract(backend);
// Bob attaches to it (opt_in)  
  const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

// Create some arrays for fingers, outcome and guess
  const FINGERS = [0, 1, 2];
  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];
  const GUESS = [0, 1, 2, 3, 4];

// Define our player functions  
  const Player = (Who) => ({
    getFingers:  () => {
      const fingers = Math.floor(Math.random() * 3);
      console.log(`${Who} shoots ${FINGERS[fingers]} fingers`);
      return fingers;
    },
    getGuess:  (fingers) => {
      const guess= Math.floor(Math.random() * 3) + FINGERS[fingers];
      // need a total guess
     console.log(`${Who} guessed total of ${guess}`);   
     return guess;
    },

    seeWinning: (winningNumber) => {    
      console.log(`Actual total fingers thrown:  ${winningNumber}`);
    },
    seeOutcome: (outcome) => {   
      console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
    },
  });
// initialize a backend for Alice and Bob
  await Promise.all([
    backend.Alice(
      ctcAlice,
      Player('Alice'),
    ),
    backend.Bob(
      ctcBob,
      Player('Bob'),
    ),
  ]);
})();
