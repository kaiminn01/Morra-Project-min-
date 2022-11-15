package main

import (
  "fmt"
  "sync"
  "time"
  "math/rand"
  // "strconv"
)

// This example imports a copied version of `reachrpc` directly from the
// filesystem in order to remain in-sync with the repository's client code, but
// frontend authors will normally import from GitHub like so:
import reachrpc "github.com/reach-sh/reach-lang/rpc-client/go"

// import "reachrpc"

type jsono = map[string]interface {}

// opts := map[string]string{
//   "host": <host>,
//   "port":  <port>,
//   "verify": <verify>,
//   "timeout": <timeout>,
//   "key": <API key>,
// }
func main() {
  // rpc, rpcCallbacks := reachrpc.Mk(opts)
  rpc, rpcCallbacks := reachrpc.Mk()

  fmtc := func(i jsono) string {
    return rpc("/stdlib/formatCurrency", i, 4).(string)
  }

  getBalance := func(w string) string {
    return fmtc(rpc(
      ", w).(jsono))
  }

  startingBalance := rpc("/stdlib/parseCurrency", 10).(jsono)
  accAlice        := rpc("/stdlib/newTestAccount", startingBalance).(string)
  accBob          := rpc("/stdlib/newTestAccount", startingBalance).(string)

  beforeAlice     := getBalance(accAlice)
  beforeBob       := getBalance(accBob)

  ctcAlice        := rpc("/acc/contract",  accAlice).(string)
  
  FINGERS         := [6]int{0, 1, 2, 3, 4, 5}
  GUESS           := [11]int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10}  
  OUTCOME         := [3]string{"Bob wins", "Draw", "Alice wins"}


  player := func(who string) map[string]interface{} {
    getFingers := func() int {
      // https://golang.org/pkg/math/rand/#example_Intn
      rand.Seed(time.Now().UnixNano())
      fingers := rand.Intn(6)
      // fmt.Printf("%s fingers %d\n", who, fingers)
      fmt.Printf("%s fingers %d\n", who, FINGERS[fingers])    
      return fingers
    }

    getGuess := func(fingers jsono) int {
      // https://golang.org/pkg/math/rand/#example_Intn
      fingerstostart := int(rpc("/stdlib/bigNumberToNumber", fingers).(float64))
      rand.Seed(time.Now().UnixNano())
      guess := rand.Intn(6) + FINGERS[fingerstostart]
      fmt.Printf("%s guessed %d\n", who, GUESS[guess])
      return guess
    }
    seeWinning := func (winningNumber jsono) {
      o := int(rpc("/stdlib/bigNumberToNumber", winningNumber).(float64))
      fmt.Printf("Actual total fingers thrown:  %d\n", GUESS[o])
      fmt.Printf("----------------------------\n")     
 
    }

    informTimeout := func() {
      fmt.Printf("%s observed a timeout\n", who)

    }

    seeOutcome := func(n jsono) {
      o := int(rpc("/stdlib/bigNumberToNumber", n).(float64))
      fmt.Printf("%s saw outcome %s\n", who, OUTCOME[o])
      
    }

    return map[string]interface{} {
      "stdlib.hasRandom": true,
      "getFingers":       getFingers,
      "getGuess":         getGuess,
      "seeWinning":       seeWinning,
      "informTimeout":    informTimeout,
      "seeOutcome":       seeOutcome,
    }
  }
  // localPrint := func(n jsono) {
  //   fmt.Println(n)    
  // }
  wg := new(sync.WaitGroup)
  wg.Add(2)

  playAlice := func() {
    defer wg.Done()
    d := player("Alice")
    // startingWager := int(rpc("/stdlib/bigNumberToNumber", 5).(float64))
    d["wager"] = rpc("/stdlib/parseCurrency", 5).(jsono)
    // d["wager"] = rpc("/stdlib/parseCurrency", startingWager).(jsono)   
 
    d["deadline"] = 10
    // d["log"] = localPrint.(jsono)
    rpcCallbacks("/backend/Alice", ctcAlice, d)
  }

  playBob := func() {
    defer wg.Done()

    d := player("Bob")
    d["acceptWager"] = func(amt jsono) {  
      fmt.Printf("Bob accepts the wager of %s\n", fmtc(amt))
    }
    aliceInfo := rpc("/ctc/getInfo", ctcAlice).(interface{})
    ctcBob := rpc("/acc/contract",  accBob, aliceInfo).(string)

    rpcCallbacks("/backend/Bob", ctcBob, d)
    rpc("/forget/ctc", ctcBob)
  }

  go playAlice()
  go playBob()
  wg.Wait()

  afterAlice := getBalance(accAlice)
  afterBob   := getBalance(accBob)

  fmt.Printf("Alice went from %s to %s\n", beforeAlice, afterAlice)
  fmt.Printf("  Bob went from %s to %s\n", beforeBob,   afterBob)

  rpc("/forget/acc", accAlice, accBob)
  rpc("/forget/ctc", ctcAlice)
}
