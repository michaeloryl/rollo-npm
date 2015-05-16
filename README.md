# rollo-npm
The Rollo programming language for the Orbotix Sphero robot using Node.js and Cylon.js

## Sample Rollo program

The following Rollo program will cause the Sphero to make a 'C' shape, reverse direction, and retrace its steps.

    color 'darkgray'
    flash 'green'
    waitForTap 3 seconds
    
    speed 25
    go 2
    
    repeat 2 times {
      gosub rightAndGo
    }
    
    reverse
    go 2
    
    repeat 2 times {
      gosub leftAndGo
    }
    
    sub rightAndGo {
      right
      go 2
    }
    
    sub leftAndGo {
      left
      go 2
    }

## Pulling Rollo into your Cylon.js project and passing it some code

In order to make use of Rollo, you need to require it in your source code where it is accessible from your main Cylon.js work function:

    var Rollo = require('rollo');
    
You then need to pass Rollo a reference to your sphero along with your Rollo program source code and a callback to run your program:

    Rollo.run(my.sphero, source, function() {
      console.log("ROLLO: Shutting down");
    });
