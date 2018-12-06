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


https://gitter.im/kovan-testnet/faucet

ganache-cli --networkId 25624 --allowUnlimitedContractSize --gasLimit 6500000 -m "pirates may plunder gold but i plunder doubly fake internet gold arrrrrr" -f "https://kovan.infura.io/v3/036a25e03d7b4dabbfef8b00ac39e956@9125810"
rm -rf build && truffle migrate --reset --all --clean --network development

