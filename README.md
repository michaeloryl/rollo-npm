# rollo-npm
The Rollo programming language for the Orbotix Sphero robot using Node.js and Cylon.js

## Rollo is still early code!

I'm still building out and designing Rollo.  While you certainly could start playing around with it in your own apps, expect a lot of breaking changes and new features for the time being.

## Pulling Rollo into your Cylon.js project and passing it some code

In order to make use of Rollo, you need to require it in your source code where it is accessible from your main Cylon.js work function:

    var Rollo = require('rollo');
    
To run a Rollo script/program, you need to pass Rollo's run function a reference to your Sphero, a string that contains your Rollo program's source code, and a callback. The callback will be executed when all of the Rollo commands have been run by your Sphero:

    Rollo.run(my.sphero, source, function() {
      console.log("ROLLO: Shutting down");
    });
    
If you prefer, you can pass a string with a full or relative file path to the source file:

    Rollo.runFile(my.sphero, "~/myScript.rol", function() {
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

Rollo is a simple language that is intended for kids and non-programmers. Commands are meant to be simple to understand and offer flexible syntax. The main structure is the command followed by 0 or more parameters.  For example:

    right
    
This causes the sphero to turn right.

#####Optional Parameters

Commands that take parameters often take optional units for those parameters that may be omitted:

    wait 1    
    wait 1 second

Those two lines are equivilent.  Basically units (seconds, degrees, times, %, and such) are ignored, so you can use them if they help make more sense to you, but Rollo doesn't care either way.

#####Words (strings) versus Numbers

Numbers and words are handled differently in Rollo, as in most languages.  If a parameter that you are giving to a command is a number, you can just type in the number (and the optional units).  If the parameter is made up of words, though, you have to put them in quotes.  You can use single or double quotes:

    color 'green'
    color "orange"

Both of those set the Sphero's color and work fine.  This one, however, is not fine:

    color 'green"
    
You can't mix and match quotes.  If you start with a ', you must end with '.  The same goes for ".

It might seem silly to have to put quotes around word parameters like 'green' and 'orange', but it makes more sense when your words have spaces in them:

    say "This will show up on the output log"
    
The say command, for instance, can have full sentences passed to it, which then get displayed in the output log. If we didn't have the quotes, it would make something like the following hard for Rollo to interpret:

    say We are going to wait 1 second
    
Rollo would get confused without the quotes because it would see the "wait 1 second" and might think it was a command. The quotes tell Rollo that the words all belong together, even it contains spaces or some of the words are actually numbers.

#####Command Blocks

There are some commands, like 'repeat' and 'if' (among others) that make use of curly braces to show that they control a block, or group, of commands:
 
    repeat 2 times {
      right
      wait 1 second
    }
    
This tells Rollo to turn right and wait a second, and do that process twice. The indentation for the lines inside the curly braces is entirely optional, but it makes the code much easier to read if you use some form of consistent indentation.

Rollo is pretty flexible on where you place your curly braces.  You can put them on the same line as an expression like this:
 
    if $var < 4 {
        color 'red'
    } else {
        color 'green'
    }

Or you can put them on their own lines, as in this example:

    if $var < 4 
    {
        color 'red'
    } 
    else 
    {
        color 'green'
    }

You can even indent them as you please:

    if $var < 4 
      {
        color 'red'
      } 
    else 
      {
        color 'green'
      }

But however you decide to do it, you should always do it the same way. This makes your program easier for everybody, including you, to read.
 
#####Condition Expressions
 
You might have noticed that the 'if' command examples above have an expression after the 'if' that makes use of some math.  Those are examples of condition expressions in Rollo.
 
Condition Expressions can make use of the following comparison operators:

_Equality_: **==** or **===** or **equal to** or **equals**

_Inequality_: **!=** or **!==** or **not equal** or **not equals**

_Less than or equal_: **<=**

_Greater than or equal_: **>=**

_Less than_: **<** or **less than**

_Greater than_: **>** or **greater than** OR **more than**

You can also use 'is' before the comparison.  So these are all valid and mean the same thing:

    2 == 1 + 1
    2 === 3 - 1
    2 is equal to 6 / 3
    2 equals 5 - 3

You can even do the following, though it looks quite strange:

    2 is == 8 / (2 * 2)

#####Subroutines
 
There are also subroutines in Rollo.  A subroutine is a group of lines that have a label (or name) associated with it that can then be run by referring to that name.  For example.

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
    
What this will do is change the sphero's color to blue, start rolling, and then call the sub myStuff 6 times. Each time myStuff is called with the gosub command, the sphero will turn right, flash red, and then wait 2 seconds. Finally, the sphero will turn green and stop rolling after myStuff has been run the sixth time.

The above program does exactly the same thing as the following, but is shorter and easier to read than this mess:

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

Subs can be put anywhere in your program _as long as they are not inside a block_.  The gosub command that calls a sub can, of course, be inside a block.  With that in mind, consider the following examples:

###### This is valid

    sub myStuff {
      flash 'red'
      wait 2 seconds
    }

    color 'blue'

    repeat 3 times {
      gosub myStuff
    }

    color 'green'

###### This is valid, too, and does the exact same thing

    color 'blue'

    repeat 3 times {
      gosub myStuff
    }

    color 'green'

    sub myStuff {
      flash 'red'
      wait 2 seconds
    }

###### This is NOT valid because the sub is inside the repeat block

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

**_glorb_** *duration*:number [*color*:string|*color*:number]

This means that the glorb command requires a number of seconds to be provided as a duration.  Anything inside square bracketc [ ] is optional.
And anything separated by a vertical line means 'or'.  So in this case you can, if you like, supply a second parameter that will be
the color glorb should use, and you can either specify the color as a string like 'blue' or as a number like 255. 

The real commands are as follows:

### Movement

#####GO
**_go_** [*duration*:number]

Makes the sphero start rolling.  If no duration is specified, it will keep going until stopped with a **stop** command.  If a duration is
given, then it will automatically stop after that many seconds have passed.

#####LEFT
_**left**_ [*degrees*:number]

As with **right**, changes the current or next heading of the Sphero, except in the opposite direction.  For example, "left 45" will cause the Sphero to veer to the left.  If no degree parameter is specified, the Sphero will turn 90 degrees.

Alias: *turnLeft*

#####REVERSE
_**reverse**_

Causes the Sphero's heading to shift 180 degrees so that it will move in the opposite direction from where it is currently heading.

Alias: *turnAround*

#####RIGHT
_**right**_ [*degrees*:number]

Changes the current or next heading of the Sphero.  Accepts only positive numbers.  For example, "right 45" will cause the Sphero to veer off to the right.  If no degree parameter is specified, the Sphero will turn 90 degrees.

Alias: *turnRight*

#####SPEED
**_speed_** *percent*:number

Sets the percentage of full speed the sphero will use when moving

#####TURN
_**turn**_ *degrees*:number

Changes the heading that the Sphero is travelling.  If moving, it will cause an immediate turn.  If still, it will adjust the heading used the next time the Sphero moves.  The degrees can be specified as a postive (clockwiswe) number or as a negative (counterclockwise) number.

### Variable Assignment

#####LET
_**let**_ *name*:variable_label = *expression*

The **let** commands allows a value to be assigned to a numeric variable.  All numeric variables in Rollo must start with the $ character and be followed by one or more letters or numbers.  The expression that is evaluated and assigned to the variable can consist of numbers or other variables and make use of addition, subtraction, multiplication, and division.  Parenthese may also be used.

Consider the following example, which assigns the value of $someVar times 2, plus 15 more to the variable $myVar:

    let $myVar = 2*$someVar + 15
    
Expressions need not be complex.  For example, the following line of code assigns the value in $myVar to a variable called $backup:

    let $backup = $myVar

### Flow Control

#####DO ... UNTIL
_**do**_ { block-of-commands } _**until**_ *condition*:expression

The **do ... until** command can be thought of as a combination of the **if** and **repeat** commands.  The code inside of the block will continue to repeat as long as the condition specified is **not** true.  That is the opposite effect of the **while** and **do ... while** loops!  Another thing to pay attention to is that no matter what the expression is, the block of code will always execute *at least once*.  The following example will cause the Sphero to move and turn three times:

    let $index = 1
    do {
        go 1 second
        left 45 degrees
        let $index = $index + 1
    } until $index > 3

It does so by increasing the value of $index by one each time through the loop, which causes the **do ... until** loop to stop after running three times.  The first time the condition is checked, $index will have a value of 2 since it starts at 1 and gets one added to it each time through the loop.  When the **do ... until** finishes, $index will have a value of 4.  If we hadn't set the initial value of $index to 1 in the first line, the loop would have run 4 times since uninitialized variables get a default value of 0.

In most cases you will want to use the **while** loop instead of **do ... until**, as you will only want the block of code to run if the comparison condition is true.  Use **do ... until** only when you want the block to run one time *no matter what*.

See **if** for more information on comparison expressions.

#####DO ... WHILE
_**do**_ { block-of-commands } _**while**_ *condition*:expression

The **do ... while** command can be thought of as a combination of the **if** and **repeat** commands.  The code inside of the block will continue to repeat as long as the condition specified evaluates to true.  The trick to pay attention to is that no matter what the expression is, the block of code will always execute *at least once*.  The following example will cause the Sphero to move and turn three times:

    let $index = 1
    do {
        go 1 second
        left 45 degrees
        let $index = $index + 1
    } while $index < 4

It does so by increasing the value of $index by one each time through the loop, which causes the **do ... while** loop to stop after running three times.  The first time the condition is checked, $index will have a value of 2 since it starts at 1 and gets one added to it each time through the loop.  When the **do ... until** finishes, $index will have a value of 4.  If we hadn't set the initial value of $index to 1 in the first line, the loop would have run 4 times since uninitialized variables get a default value of 0.

In most cases you will want to use the **while** loop instead of **do ... while**, as you will only want the block of code to run if the comparison condition is true.  Use **do ... while** only when you want the block to run one time *no matter what*.

See **if** for more information on comparison expressions.

#####GOSUB
_**gosub**_ *name*:sub_label

Causes Rollo to execute the named **sub** one time.  Unlike strings, labels should not be enclosed inside of double or single quotes.

Alias: *call*

#####IF
_**if**_ *condition*:expression** { block-of-commands }

The **if** command allows a block of commands to be executed only if the expression passed to it is evaluated to be true.  Consider the following example, which will set the Sphero's color to yellow only if the value of the variable $test is greater than 10:

    if $test > 10 {
        color 'yellow'
    }
    
Condition expressions consist of two mathematical expressions (which may or may not make use of variables) separated by a comparison operator.  Rollo currently understands the following: < (less than), > (greater than), <= (less than or equal), >= (greater than or equal), == or === (equal), != or !== (not equal).  This means the previous example could be written like the following:

    if $test * 2 > 10 + $anotherVar {
        color 'yellow'
    }

#####IF ELSE
_**if**_ *condition*:expression** { block-of-commands } _**else**_ { block-of-commands }

Same as the regular **if** command, except that there is a second block of lines that is run if the **if** condition expression is false.  Consider the following example, which will set the Sphero's color to yellow if the value of the variable $test is greater than 10, otherwise it will set the color to red:

    if $test > 10 {
        color 'yellow'
    } else {
        color 'red'
    }
    
#####REPEAT
_**repeat**_ *count*:number { block-of-commands }

The **repeat** command causes the group of lines inside the curly braces { } to be repeated the specified number of times.  For example, the following will cause the Sphero to drive in a square:

    repeat 4 times {
        go 2
        right
    }

Alias: *loop*

#####SUB
_**sub**_ *name*:sub_label { block-of-commands }

The **sub** command defines a named block of commands that can be executed by using the **gosub** command.  The **sub** command can only be used in the root level of the Rollo program, meaning that it cannot be used inside of any sort of block of code (though the **gosub** command that calls it certainly can).  Unlike with strings, a label should have neither single nor double quotes around it.

Here's an example sub named 'mySub' that causes the Sphero to go straight and then turn around.

    sub mySub {
        go 1
        reverse
    }

#####WAIT
**_wait_** *duration*:number

Tells Rollo to wait for a specified number of seconds before continuing.

    wait 2 seconds

Alias: *delay*

#####WAITFORTAP
**_waitForTap_** [**timeout**:number]

Causes the Rollo to wait until the Sphero has been hit by something (like a hand) or runs solidly into something (like a wall). The optional timeout parameter tells Rollo how many seconds it should wait for a tap before it gives up and moves on to the next command.

    waitForTap 8 seconds

Alias: *waitForHit*

#####WHILE
_**while**_ *condition*:expression { block-of-commands }

The **while** command can be thought of as a combination of the **if** and **repeat** commands.  The code inside of the block will continue to repeat as long as the condition specified evaluates to true.  The following example will cause the Sphero to move and turn three times:

    let $index = 1
    while $index < 4 {
        go 1 second
        left 45 degrees
        let $index = $index + 1
    }

It does so by increasing the value of $index by one each time through the loop, which causes the **while** loop to stop after running three times.  If we hadn't set the initial value of $index to 1 in the first line, the loop would have run 4 times since uninitialized variables get a default value of 0.

See **if** for more information on comparison expressions.

### Color

#####COLOR
_**color**_ *color-name*:string|*color-value*:hexadecimal

Sets the color of the Sphero.  If supplied a known string, such as "red" or 'green' or 'darkblue', Rollo will change the Sphero color accordingly.  If supplied a hexadecimal number, it will change to the color specified by the value.  Rollo understands HTML CSS-like colors, in that 0xff0000 is red, 0x00ff00 is green, and 0x0000ff is blue.

To set the Sphero to purple, you would use either of the following commands:
    color 'purple'
    color 0x800080
    
Rollo currently understands the following colors: red, darkred, green, darkgreen, blue, darkblue, orange, darkorange, purple, darkpurple, yellow, darkyellow, white, gray, darkgray, or none or off for no light at all.

#####FLASH
_**flash**_ *color-name*:string|*color-value*:hexadecimal

Causes the Sphero to shine the specified color for one second before reverting back to its original color.  Unlike most commands in Rollo that have a duration, the **flash** command does not cause Rollo to wait for it to finish before it proceeds.  This means that you can issue a flash on an impact, for example, and the color change will take place while you might be instructing Rollo to reverse direction.

**Flash** uses the same color parameters as the **color** command.

#####PULSE
_**pulse**_ *color-name*:string|*color-value*:hexadecimal

Nearly identical to **flash**, except that the chosen color fades in and out for a more subtle effect.

**Pulse** uses the same color parameters as the **color** command.


### Utility

#####POINTME
_**pointMe**_

Causes the Sphero to go into calibration mode with a blue light shining in the opposite direction that it will move.  Calibration mode is automatically stopped once a **go** command is received.  It is often useful to follow the **pointMe** command with a **waitForTap** command so that the Sphero can be oriented and then tapped to tell the Rollo program to continue.  For example:

    pointMe
    waitForTap 6
    go 3
    
This example will cause the Sphero to go into calibration mode and wait for a tap for a maximum of 6 seconds.  When tapped or the 6 second timeout expires, it will then proceed to **go** for three seconds (straight ahead).

Alias: *ALIAS*

#####SAY
_**say**_ *text*:string

The say command causes Rollo to output text.  This can be used to help with debugging.

    say 'This will go to the log'

Alias: *log*

## Rollo functions

Rollo supports a handful of built-in functions that you can use in expressions.  They can be used to assign a value to a variable, in a comparison, or as part of a math expression.

#####HEADING
_**getHeading()**_

Returns the current direction of the Sphero.  0 is the point that the Sphero was facing when the program started, 180 is the opposite direction.

Consider the following example, which sets the color of the Sphero to purple and then checks whether the heading is more than 180 degrees and, if so, sets the color instead to orange.

    color 'purple'
    if getHeading() > 180 {
        color 'orange'
    }

#####SPEED
_**getSpeed()**_

Returns the current rolling speed of the Sphero.  0 is stopped (or in the process of stopping), 100 is full speed.

The following code will set the speed to 50 and mame the Sphero roll for a second at that speed.  It will then loop, decreasing speed by 5 each time through the loop, as long as the speed is great than 25.  Once through the loop, it will stop.

    speed 50
    go 1
    while getSpeed() > 25 {
        let $speed = getSpeed() - 5
        speed $speed
        go 1
    }
    stop

#####DEFAULT SPEED
_**getDefaultSpeed()**_

Returns the default speed of the Sphero.  This is the speed that the Rollo will move at the next time it starts rolling (assuming that a **speed** command is not later used).

    if defaultSpeed() == 100 {
        say "Full speed ahead!"
    }
