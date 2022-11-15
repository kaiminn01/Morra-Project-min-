using System;
using System.Collections.Generic;
using System.Web;
using System.Text.Json;
using System.Threading.Tasks;
using Reach.RPC;

namespace client_cs
{
public class Program {
  public static async Task Main() {
    Options opts = new Options();
    Client rpc = new Client(opts);
    var startingBalance = await rpc.Call("/stdlib/parseCurrency", Client.AsJson("10"));
    var accAlice = await rpc.Call("/stdlib/newTestAccount", startingBalance);
    var accBob = await rpc.Call("/stdlib/newTestAccount", startingBalance);

    var fmt = async (JsonElement x) =>
      await rpc.Call("/stdlib/formatCurrency", x, Client.AsJson("4"));
    var getBalance = async (JsonElement who) =>
      await fmt(await rpc.Call("/stdlib/balanceOf", who));
    var beforeAlice = await getBalance(accAlice);
    var beforeBob = await getBalance(accBob);

    var ctcAlice = await rpc.Call("/acc/contract", accAlice);

    int[] FINGERS = new int[6]{0, 1, 2, 3, 4, 5};
    string[] OUTCOME = new string[3]{"Bob wins", "Draw", "Alice wins"};

    var Player = (string who) => {
      var rand = new Random();
      var cbs = new Callbacks();
      cbs.Methods("stdlib.hasRandom");
      cbs.Method("getFingers", async (args) => {
          var fingers = rand.Next(FINGERS.Length);
          Console.WriteLine($"{who} played {FINGERS[fingers]}");
          return Client.AsJson((fingers.ToString()));
      });
      cbs.Method("getGuess", async (args) => {
        var fingersBN = args[0];  
        var fingersJE = await rpc.Call("/stdlib/bigNumbertoNumber", fingersBN); 
        var fingers = fingersJE.GetInt64();             
        var guess = rand.Next(FINGERS.Length) + FINGERS[fingers];
        Console.WriteLine($"{who} guessed total of {guess}");
        return Client.AsJson(guess.ToString());
      });
      cbs.Method("seeWinning", async (args) => {
      var winningNumberBN = args[0];
      var winningNumberJE = await rpc.Call("/stdlib/bigNumbertoNumber", winningNumberBN);
      var winningNumber = winningNumberJE.GetInt64();
      Console.WriteLine($"Actual total fingers thrown: {winningNumber}");
      Console.WriteLine($"----------------------------");   
      return Client.AsJson("null");
      });
      cbs.Method("seeOutcome", async (args) => {
          var outcomeBN = args[0];
          var outcomeJE = await rpc.Call("/stdlib/bigNumbertoNumber", outcomeBN);
          var outcome = outcomeJE.GetInt64();
          Console.WriteLine($"{who} saw outcome {OUTCOME[outcome]}");
          return Client.AsJson("null");
      });
      cbs.Method("informTimeout", async (args) => {
          Console.WriteLine($"{who} observed a timeout");
          return Client.AsJson("null");
      });
      return cbs;
    };

    var aliceCbs = Player("Alice");
    aliceCbs.Value("wager", await rpc.Call("/stdlib/parseCurrency", Client.AsJson("5")));
    aliceCbs.Value("deadline", Client.AsJson("10"));
    var alice = rpc.Callbacks("/backend/Alice", ctcAlice, aliceCbs);

    var bobCbs = Player("Bob");
    bobCbs.Method("acceptWager", async (args) => {
        var amt = args[0];
        var famt = await fmt(amt);
        Console.WriteLine($"Bob accepts the wager of {famt}");
        return Client.AsJson("null");
    });
    var doBob = async () => {
        var info = await rpc.Call("/ctc/getInfo", ctcAlice);
        var ctcBob = await rpc.Call("/acc/contract", accBob, info);
        await rpc.Callbacks("/backend/Bob", ctcBob, bobCbs);
        await rpc.Call("/forget/ctc", ctcBob);
        return;
    };
    var bob = doBob();

    await bob;
    await alice;

    var afterAlice = await getBalance(accAlice);
    var afterBob = await getBalance(accBob);

    Console.WriteLine($"Alice went from {beforeAlice} to {afterAlice}.");
    Console.WriteLine($"  Bob went from {beforeBob} to {afterBob}.");

    await rpc.Call("/forget/acc", accAlice, accBob);
    await rpc.Call("/forget/ctc", ctcAlice);
    await rpc.Call("/stop");

    return;
  }
}
}
