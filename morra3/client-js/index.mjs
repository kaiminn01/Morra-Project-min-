import { mkRPC } from '@reach-sh/rpc-client';
const { rpc, rpcCallbacks } = await mkRPC();


// var opts = {
//   // host: "http://localhost",
//   // port: 4001,
//   // key: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
//   verify: '0',
//   timeout: 10
// };
// const { rpc, rpcCallbacks } = await mkRPC(opts);

const startingBalance = await rpc(`/stdlib/parseCurrency`,  10);
const accAlice        = await rpc(`/stdlib/newTestAccount`, startingBalance);
const accBob          = await rpc(`/stdlib/newTestAccount`, startingBalance);

const fmt = async x =>
    await rpc(`/stdlib/formatCurrency`, x, 4);

const getBalance = async who =>
  fmt(await rpc(`/stdlib/balanceOf`, who));

const beforeAlice = await getBalance(accAlice);
const beforeBob = await getBalance(accBob);

const ctcAlice    =  await rpc(`/acc/contract`, accAlice);


const FINGERS = [0, 1, 2, 3, 4, 5];
const GUESS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  
const OUTCOME = ['Bob wins', 'Draw', 'Alice wins'];

const Player = (Who) => ({
  "stdlib.hasRandom": true,  
  getFingers: async () => {
    const fingers = Math.floor(Math.random() * 6);         
    console.log(`${Who} shoots ${FINGERS[fingers]} fingers`);     
    return fingers;
  },
  getGuess:  async (fingersBN) => {
    //const guess= Math.floor(Math.random() * 6) + FINGERS[fingers];
    const fingers = await rpc(`/stdlib/bigNumbertoNumber`, fingersBN);
    const guess= Math.floor(Math.random() * 6) + FINGERS[fingers];
    console.log(`${Who} guessed total of ${guess}`);   
    return guess;
  },
  seeWinning: async (winningNumberBN) => {    
    const winningNumber = await rpc(`/stdlib/bigNumbertoNumber`, winningNumberBN);
    console.log(`Actual total fingers thrown: ${winningNumber}`);
    console.log(`----------------------------`); 
  },
  seeOutcome: async (outcomeBN) => {
    const outcome = await rpc(`/stdlib/bigNumbertoNumber`, outcomeBN);
    console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
  },

  informTimeout: () => {
    console.log(`${Who} observed a timeout`);
  },
});
  //  log: console.log,
await Promise.all([
  rpcCallbacks(`/backend/Alice`, ctcAlice, {  
    ...Player('Alice'),
    wager: await rpc(`/stdlib/parseCurrency`, 5),
    // log: console.log,
    deadline: 10,
  }),

rpc(`/ctc/getInfo`, ctcAlice).then(async (info) => {
  const ctcBob = await rpc(`/acc/contract`, accBob, info);
  rpcCallbacks(`/backend/Bob`, ctcBob, {
    ...Player('Bob'),
    acceptWager: async (amt) => {
      console.log(`Bob accepts the wager of ${await fmt(amt)}.`);
    },
    // log: console.log,      
  });
  return await rpc(`/forget/ctc`, ctcBob);
  }),
]);

const afterAlice = await getBalance(accAlice);
const afterBob =  await getBalance(accBob);

console.log(`Alice went from ${beforeAlice} to ${afterAlice}.`);
console.log(`Bob went from ${beforeBob} to ${afterBob}.`);

await Promise.all([
  await rpc(`/forget/acc`, accAlice, accBob),
  await rpc(`/forget/ctc`, ctcAlice),
  // await rpc(`/stop`),
]);

