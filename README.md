# PlunderBot
A robot that steals doubly fake internet money


### Steps to take:
- Get a Gitlab, Github, or Twitter account
- Get a Gitter account here https://gitter.im
- Sign in and get an API token here https://developer.gitter.im
- Create AWS Lambda function
  - pip3 install gitterpy --target lambda
  - cd lambda && zip -r9 ../function.zip ./* && cd ..
  - upload to aws lambda


https://gitter.im/kovan-testnet/faucet


rm -rf build && truffle migrate --reset --all --clean --network development