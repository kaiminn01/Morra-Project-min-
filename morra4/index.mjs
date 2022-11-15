import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
// export REACH_CONNECTOR_MODE=ALGO-live
// export ALGO_SERVER='http://localhost:4001'
// export ALGO_TOKEN='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
// // export ALGO_SERVER='https://node.testnet.algoexplorerapi.io'

// export ALGO_TOKEN='2f3203f21e738a1de6110eba6984f9d03e5a95d7a577b34616854064cf2c0e7b'
// export ALGO_SERVER='https://academy-algod.dev.aws.algodev.network'

// export `http://hackathon.algodev.network`
// export ALGO_PORT=9100
// export ALGO_TOKEN='ef920e2e7e002953f4b29a8af720efe8e4ecc75ff102b165e0472834b25832c1'

// export ALGO_INDEXER_SERVER='https://algoindexer.testnet.algoexplorerapi.io'

const stdlib = loadStdlib(process.env);

// const alicePassphrase = "price clap dilemma swim genius fame lucky crack torch hunt maid palace ladder unlock symptom rubber scale load acoustic drop oval cabbage review abstract embark";
// // 7DCJZKC4JDUKM25W7TDJ5XRTWGUTH6DOG5WARVA47DOCXQOTB4GMLNVW7I

// const bobPassphrase = "unlock garage rack news treat bonus census describe stuff habit harvest imitate cheap lemon cost favorite seven tomato viable same exercise letter dune able add";
// // LXLRKA2GSHBGL4F4YCKQDBK6M7OVRDKM5YSQTIZG7G7HKPN6I7OJL24AG4
const alicePassphrase = "upon lava gift spell practice essay merit replace gossip mule six stem between blush fringe fancy require winter vessel exist silent gate acquire about certain";
// NMJLOP2WPGFYOGSTDYHDU7BNJN7LGAWOG5AC2FVYTMW23H33WMTKAFPNB4

const bobPassphrase = "book kitten crazy strike inquiry guard improve cat duty drift horse knife blanket truth suspect puzzle ring barely fantasy fatigue flag lion area absorb learn";
// V7EEYLD3P5LDI2TO3RXCK3Q5VLG4QZRKTIKUQG4NIQ7XRF3B7MEVJE5F3Q

(async () => {

  // const accAlice = await stdlib.getDefaultAccount();
  // const accBob = stdlib.getDefaultAccount("LXLRKA2GSHBGL4F4YCKQDBK6M7OVRDKM5YSQTIZG7G7HKPN6I7OJL24AG4"); 
  // const accAlice = await stdlib.connectAccount("7DCJZKC4JDUKM25W7TDJ5XRTWGUTH6DOG5WARVA47DOCXQOTB4GMLNVW7I");
  // const accBob = stdlib.connectAccount("LXLRKA2GSHBGL4F4YCKQDBK6M7OVRDKM5YSQTIZG7G7HKPN6I7OJL24AG4");
  // const startingBalance = stdlib.parseCurrency(10);
  const accAlice = await stdlib.newAccountFromMnemonic(alicePassphrase);
  // const accBob = await stdlib.getDefaultAccount('LXLRKA2GSHBGL4F4YCKQDBK6M7OVRDKM5YSQTIZG7G7HKPN6I7OJL24AG4');
  // const accBob = await stdlib.getDefaultAccount();
  const accBob = await stdlib.newAccountFromMnemonic(bobPassphrase); 
  // const howManyRounds = stdlib.connector === 'ALGO' ? 3 : 10;
  // console.log(howManyRounds); 


  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async (who) => fmt(await stdlib.balanceOf(who));
  const beforeAlice = await getBalance(accAlice);
  const beforeBob = await getBalance(accBob);

  const ctcAlice = accAlice.contract(backend);
  const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

  const FINGERS = [0, 1, 2, 3, 4, 5];
  const GUESS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  
  const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];

  const Player = (Who) => ({
    ...stdlib.hasRandom,
    getFingers: async () => {
     // const fingers = Math.floor(Math.random() * 3);
      const fingers = Math.floor(Math.random() * 6);         
      console.log(`${Who} shoots ${FINGERS[fingers]} fingers`);
     // build in occasional timeout
      // if ( Math.random() <= 0.01 ) {
      //   for ( let i = 0; i < 10; i++ ) {
      //     console.log(`  ${Who} takes their sweet time sending it back...`);
      //     await stdlib.wait(1);
      //   }
      // }     
      return fingers;
    },
    getGuess:  async (fingers) => {
     // guess should be greater than or equal to number of fingers thrown
     // const guess= Math.floor(Math.random() * 3);
      const guess= Math.floor(Math.random() * 6) + FINGERS[fingers];
     // occassional timeout
      if ( Math.random() <= 0.01 ) {
        for ( let i = 0; i < 10; i++ ) {
          console.log(`  ${Who} takes their sweet time sending it back...`);
          await stdlib.wait(1);
        }
      }
      console.log(`${Who} guessed total of ${guess}`);   
      return guess;
    },
    seeWinning: (winningNumber) => {    
      console.log(`Actual total fingers thrown: ${winningNumber}`);
      console.log(`----------------------------`);  
    },

    seeOutcome: (outcome) => {
      console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
    },
    informTimeout: () => {
      console.log(`${Who} observed a timeout`);
    },
  });

  await Promise.all([
    backend.Alice(ctcAlice, {
      ...Player('Alice'),
      wager: stdlib.parseCurrency(1),    
      ...stdlib.hasConsoleLogger,
    }),
    backend.Bob(ctcBob, {
      ...Player('Bob'),
      acceptWager: (amt) => {      
        console.log(`Bob accepts the wager of ${fmt(amt)}.`);
      },
      ...stdlib.hasConsoleLogger,      
    }),
  ]);
  const afterAlice = await getBalance(accAlice);
  const afterBob = await getBalance(accBob);

  console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
  console.log(`Bob went from ${beforeBob} to ${afterBob}.`);


})();
