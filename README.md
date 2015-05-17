# rollo-npm
The Rollo programming language for the Orbotix Sphero robot using Node.js and Cylon.js

## Pulling Rollo into your Cylon.js project and passing it some code

In order to make use of Rollo, you need to require it in your source code where it is accessible from your main Cylon.js work function:

    var Rollo = require('rollo');
    
To run a Rollo script/program, you need to pass Rollo's run function a reference to your sphero, a string that contains your Rollo program's source code, and a callback. The callback will be executed when all of the Rollo commands have been run by your Sphero:

    Rollo.run(my.sphero, source, function() {
      console.log("ROLLO: Shutting down");
    });

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

## Rollo syntax

Rollo is a simple language that is intended for kids and non-programmers.
Commands are meant to be simple to understand and offer flexible syntax.
The main structure is the command followed by 0 or more parameters.  For example:

    right
    
This causes the sphero to turn right.

Commands that take parameters often take optional units for those parameters that may be omitted:

    wait 1    
    wait 1 second

Those two lines are equivilent.  Basically units (seconds, degrees, times, %, and such) are ignored, so you can use them if they help make more sense to you, but Rollo doesn't
care either way.

Numbers and words are handled differently in Rollo, as in most languages.  If a parameter that you are
giving to a command is a number, you can just type in the number (and the optional units).  If the parameter
is made up of words, though, you have to put them in quotes.  You can use single or double quotes:

    color 'green'
    color "orange"

Both of those set the spher's color and work fine.  This one, however, is not fine:

    color 'green"
    
You can't mix and match quotes.  If you start with a ', you must end with '.  Same goes for ".

It might seem silly to have to put quotes around word parameters like 'green' and 'orange', but it makes more
sense when your words have spaces in them:

    say "This will show up on the output log"
    
The say command, for instance, can have full sentences passed to it, which then get displayed in the output log.
If we didn't have the quotes, it would make something like the following hard for Rollo to interpret:

    say "We are going to wait 1 second"
    
Rollo would get confused without the quotes because it would see the "wait 1 second" and might think it was a command.
The quotes tell Rollo that the words all belong together, even if some of the are numbers.

There are some commands, like 'repeat' that make use of curly braces to show that they control a block, or group, of commands:

    repeat 2 times {
      right
      wait 1 second
    }
    
This tells Rollo to turn right and wait a second, and do that process twice.
The indentation for the lines inside the curly braces is entirely optional, but it
makes the code much easier to read if you use some form of consistent indentation.

There are also subroutines in Rollo.  A subroutine is a group of lines that have a label
(or name) associated with them that can then be run as a group.  For example.

    sub myStuff {
      flash 'red'
      wait 2 seconds
    }

This defines a block of sub (a block of code) called "myStuff" that can be run with the gosub command:

    color 'blue'
    go
    
    repeat 6 times {
      gosub myStuff
    }
    
    color 'green'
    stop

    sub myStuff {
      right
      flash 'red'
      wait 2 seconds
    }
    
What this will do is change the sphero's color to blue, start rolling, and then call the sub myStuff 6 times.
Each time myStuff is called with the gosub command, the sphero will turn right, flash red, and then wait 2 seconds.
Finally, the sphero will turn green and stop rolling after myStuff has been run the sixth time.

The above program does exactly the same thing as the following, but is a lot shorter and easier to maintain that this mess:

    color 'blue'
    go
    
    right
    flash 'red'
    wait 2 seconds
    right
    flash 'red'
    wait 2 seconds
    right
    flash 'red'
    wait 2 seconds
    right
    flash 'red'
    wait 2 seconds
    right
    flash 'red'
    wait 2 seconds
    right
    flash 'red'
    wait 2 seconds
    
    color 'green'
    stop

Subs can be put anywhere in your program _as long as they are not inside a block_.  The gosub command that
calls a sub can, of course, be inside a block.  With that in mind, consider the following examples:

### This is valid

    sub myStuff {
      flash 'red'
      wait 2 seconds
    }

    color 'blue'

    repeat 3 times {
      gosub myStuff
    }

    color 'green'

### This is valid, too, and does the exact same thing

    color 'blue'

    repeat 3 times {
      gosub myStuff
    }

    color 'green'

    sub myStuff {
      flash 'red'
      wait 2 seconds
    }

### This is NOT valid because the sub is inside the repeat block

    color 'blue'

    repeat 3 times {
      gosub myStuff
      
      sub myStuff {
        flash 'red'
        wait 2 seconds
      }
    }

    color 'green'
    
## Rollo commands

The commands that you can use in a Rollo program are listed below.  I've tried to group them logically.

Each command is followed by the type of parameters it requires.  As an example, consider the fictional command definition below:

**_glorb_** **duration**:number [**color**:string | **color**:number]

This means that the glorb command requires a number of seconds to be provided as a duration.  Anything inside square bracketc [ ] is optional.
And anything separated by a vertical line means 'or'.  So in this case you can, if you like, supply a second parameter that will be
the color glorb should use, and you can either specify the color as a string like 'blue' or as a number like 255. 

The real commands are as follows:

**_speed_** **percent**:number

Sets the percentage of full speed the sphero will use when moving

**_waitForTap_** [**timeout**:number]

Causes the Rollo to wait until the sphero has been hit by something (like a hand) or runs solidly into something (like a wall).
The timeout parameter tells Rollo how many seconds it should wait for a tap before it gives up and moves on to the next command.

Alias: *waitForHit*

**_wait_** **duration**:number

Tells Rollo to wait for a specified number of seconds before continuing.

Alias: *delay*

**_go_** [**duration**:number]

Makes the sphero start rolling.  If no durtion is specified, it will keep going until stopped with a stop command.  If a duration is
given, then it will stop after that many seconds have passed.


