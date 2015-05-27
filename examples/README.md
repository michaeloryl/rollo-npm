# How to run the example app

If you don't have it installed already, you should download and install Node.js or your computer type.

Once Node.js and its NPM companion app (which comes with it) are installed, you will need to run the following command to install the support programs that Rollo and this example require:

    npm install

That command should show you something like the following output:

    rollo@0.12.0 node_modules/rollo
    ├── async@0.9.2
    └── lodash@3.9.3

Now you need to edit the `runRolloFileExample.js` file so that it points to your particular Sphero.  On an OS X machine, you'd find that easily enough by running one of the following commands from a command shell / prompt.

    ls -lah /dev/tty.Sphero*

And you'd see output like the following:

    crw-rw-rw-  1 root  wheel   18,   4 May 16 22:17 /dev/tty.Sphero-ROB-AMP-SPP

You need to copy the `/dev/tty.Sphero-ROB-AMP-SPP` portion and paste it over top of the one that is already there in the Connections section of the Cylon object: 

        sphero: {adaptor: 'sphero', port: '/dev/tty.Sphero-ROB-AMP-SPP'}

Once that has been done, you should be able to run the script.  If you like, you can use the simple `sample.rol` script file that is already included.  You would do that with the following command:

    node runRolloFileExample sample.rol

## I need help for other platforms!

If you get Rollo running on a Windows or Linux platform and would like to help, I could use information on how to get it up and running.  You can either submit a pull request, or simply email me at `rollo@oryl.com` and let me know what you find out.  Thanks!
