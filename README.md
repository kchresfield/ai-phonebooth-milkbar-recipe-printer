# ai-phonebooth-milkbar-recipe-printer
Twilio Activation for Transform Together Chicago for the MilkBar recipe bot

## Steps to recreate:
1. Create an OpenAI Assistant https://platform.openai.com/assistants/asst_PCprm401vXRRkfQUsowEtgrp
    I kept the temperature at 0.05 for this.
2. Copy and pasete the prompt from prompt.md into the bot.
3. Add the recipe-w-tags.json to the file search portion of the assistant.
4. Printer Setup is its own thing.


### Printer Setup
For the printer, I used Epson TM-T20II.
Use the node-thermal-printer library, it makes life simpler. There is a slight mis-match. THe library is built for x86_64 but we have arm64 architecture (M1/M2 chip) so the package has to be rebuilt with for the ARM architecture. Follow these steps:

Navigate to the printer package directory:
```
cd node_modules/printer
```

Run node-gyp to rebuild the module:
```
node-gyp rebuild --arch=arm64
```

Return to your project root directory:
```
cd ../..
```

Try running your project again:
```
node server.js
```


Other edge cases important to remember for future implementation:
The `printer` library is very old. They hardcode "python" rather than python3, so a python shim that points to python3 must be created:
brew install python@3
sudo ln -s /usr/bin/python3 /usr/local/bin/python
or
sudo ln -s /opt/homebrew/bin/python3 /opt/homebrew/bin/python
