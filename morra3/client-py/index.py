# flake8: noqa

import random
from threading import Thread
from reach_rpc import mk_rpc

# opts = {
#     # "host": "https://localhost",
#     # "port": 8080,
#     # "key": "8024065d94521d253181cff008c44fa4ae4bdf44f028834cd4b4769a26282de1",
#     "verify": '0',
#     "timeout": 10
# }


def main():
    # use opts to override defaults
    # rpc, rpc_callbacks = mk_rpc(opts)
    rpc, rpc_callbacks = mk_rpc()
    starting_balance = rpc('/stdlib/parseCurrency', 10)
    acc_alice = rpc('/stdlib/newTestAccount', starting_balance)
    acc_bob = rpc('/stdlib/newTestAccount', starting_balance)

    def fmt(x):
        return rpc('/stdlib/formatCurrency', x, 4)

    def get_balance(w):
        return fmt(rpc('/stdlib/balanceOf', w))

    before_alice = get_balance(acc_alice)
    before_bob = get_balance(acc_bob)

    ctc_alice = rpc('/acc/contract', acc_alice)
    # ctc_bob = rpc('/acc/contract', acc_bob, rpc('/ctc/getInfo', ctc_alice))

    FINGERS = [0, 1, 2, 3, 4, 5]
    GUESS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    OUTCOME = ['Bob wins', 'Draw', 'Alice wins']

    def player(who):
        def getFingers():
            fingers = random.randint(0, 5)
            print('%s shoots %s fingers' % (who, FINGERS[fingers]))
            return rpc('/stdlib/bigNumberToNumber', fingers)

        def getGuess(fingers):
            guess = (random.randint(
                0, 5)) + FINGERS[rpc('/stdlib/bigNumberToNumber', fingers)]
            print('%s guessed total of %s' % (who, GUESS[guess]))
            return rpc('/stdlib/bigNumberToNumber', guess)

        def seeWinning(winningNumber):
            print('Actual total fingers thrown: %s' %
                  rpc('/stdlib/bigNumberToNumber', winningNumber))
            print('----------------------------') 
        def informTimeout():
            print('%s observed a timeout' % who)

        def seeOutcome(n):
            print('%s saw outcome %s'
                  % (who, OUTCOME[rpc('/stdlib/bigNumberToNumber', n)]))

        return {'stdlib.hasRandom': True,
                'getFingers':       getFingers,
                'getGuess':         getGuess,
                'seeWinning':       seeWinning,
                'informTimeout':    informTimeout,
                'seeOutcome':       seeOutcome,
                }

    def play_alice():
        rpc_callbacks(
            '/backend/Alice',
            ctc_alice,
            dict(wager=rpc('/stdlib/parseCurrency', 5), deadline=10, log=print ,  **player('Alice')))

    alice = Thread(target=play_alice)
    alice.start()

    def play_bob():
        def acceptWager(amt):
            print('Bob accepts the wager of %s ' %
                  rpc('/stdlib/bigNumberToNumber', fmt(amt)))
        ctc_bob = rpc('/acc/contract', acc_bob, rpc('/ctc/getInfo', ctc_alice))
           
        rpc_callbacks(
            '/backend/Bob',
            ctc_bob,
            dict(acceptWager=acceptWager, **player('Bob')))

    bob = Thread(target=play_bob)
    bob.start()

    alice.join()
    bob.join()

    after_alice = get_balance(acc_alice)
    after_bob = get_balance(acc_bob)

    print('Alice went from %s to %s' % (before_alice, after_alice))
    print('  Bob went from %s to %s' % (before_bob,   after_bob))

    rpc('/forget/acc', acc_alice, acc_bob)
    rpc('/forget/ctc', ctc_alice)


if __name__ == '__main__':
    main()
