# PlunderBot
A robot that steals doubly fake internet money

 I'm thinking a lambda that periodically checks Drain 
 address to keep their balance in a specific threshold, 
 and one that periodically checks Source addresses to see 
 if they can be sent to the faucet
 
### Steps to take:
- Get a Gitlab, Github, or Twitter account
- Get a Gitter account here https://gitter.im
- Sign in and get an API token here https://developer.gitter.im
- Create AWS Lambda function
  - pip3 install gitterpy --target lambda
  - cd lambda && zip -r9 ../function.zip ./* && cd ..
  - upload to aws lambda

https://kovan.etherscan.io/address/0xB0C89d94ed0a571C9a89d835524AfD83875F5441
https://kovan.etherscan.io/address/0x6383f3a4adef17831e87782b476c2670edf51568

https://etherconverter.online/

serverless create --template aws-python3 --path serverless-parrot

https://gitter.im/kovan-testnet/faucet
https://github.com/trufflesuite/ganache-cli


export MNEMONIC="pirates may plunder gold but ye plunder doubly fake internet gold arrrrrr"
export INFURA_KOVAN_ENDPOINT="https://kovan.infura.io/v3/036a25e03d7b4dabbfef8b00ac39e956"

cd treasure-chest
npm install
npm run test
npm run start

