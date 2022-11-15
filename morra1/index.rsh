'reach 0.1';

const [ isOutcome, B_WINS, DRAW, A_WINS ] = makeEnum(3);

// interface methods coded in frontend
const Player =
      { getFingers: Fun([], UInt),
        getGuess: Fun([UInt], UInt),
        seeWinning: Fun([UInt], Null),
        seeOutcome: Fun([UInt], Null) };

export const main =
  Reach.App(
    {},
    [Participant('Alice', Player), Participant('Bob', Player)],
    (A, B) => {
      // for Alice only
      A.only(() => {
        // interact methods w front end for Alice
        const _fingersA = interact.getFingers();
        const _guessA =  interact.getGuess(_fingersA); 
       
        // bind the value of the result of interacting with Alice through the 
        // getFingers and getGuess methods, which are in JavaScript frontend.
        const fingersA = declassify(_fingersA); 
        const guessA = declassify(_guessA);
      });
     
      A.publish(fingersA);
      commit();    
      
      A.publish(guessA);
      commit();

      // for Bob only
      B.only(() => {

        // interact methods w front end for Bob
        const _fingersB = interact.getFingers();
        const _guessB = interact.getGuess(_fingersB);
       
        // bind the value of the result of interacting with Bob through the 
        // getFingers and getGuess methods, which are in JavaScript frontend.
        const fingersB = declassify(_fingersB); 
        const guessB = declassify(_guessB);   
 
        });

      B.publish(fingersB);
      commit(); // writes to blockchain, commits the state 
      B.publish(guessB);
      
      commit();
      A.only(() => {        
        const WinningNumber = fingersA + fingersB;
        interact.seeWinning(WinningNumber);
      });
     
      A.publish(WinningNumber)
      commit();

      // logic for game
      const matchoutcome = () => {   
      if ( guessA == guessB ) 
      {
        const myoutcome = DRAW; //tie
        return myoutcome;
      } else {
        if ( ((fingersA + fingersB) == guessA ) ) {
          const myoutcome = A_WINS;
          return myoutcome;// player A wins
        } 
          else {
            if (  ((fingersA + fingersB) == guessB)) {
              const myoutcome = B_WINS;
              return myoutcome;// player B wins
          } 
            else {
              const myoutcome = DRAW; // tie
              return myoutcome;
            }
          
          }
        }
      }
      // see outcome for game for each player - both of them
      each([A, B], () => {
        
        interact.seeOutcome(matchoutcome()); });
      exit(); });
