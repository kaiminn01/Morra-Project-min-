# Morra with C#

Build the client Docker container by executing `./build.sh`, then run like so:

```sh
$ ./reach rpc-run ./csharp.sh

cd ..

Warning! Using development RPC key: REACH_RPC_KEY=opensesame.
Warning! The current TLS certificate is only suitable for development purposes.
Verifying knowledge assertions
Verifying for generic connector
  Verifying when ALL participants are honest
  Verifying when NO participants are honest
Checked 86 theorems; No failures!

> app
> node --experimental-modules --unhandled-rejections=strict index.mjs

*** Warning! TLS verification disabled! ***
 This is highly insecure in Real Life applications and must
 only be permitted under controlled conditions (such as
 during development)...
Bob accepts the wager of 5
Alice played Scissors
Bob played Rock
Alice saw outcome Win
Bob saw outcome Win
Alice went from 100 to 94.992.
  Bob went from 100 to 104.997.
```
