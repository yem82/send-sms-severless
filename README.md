# Send SMS using AWS with Serverless Framework

This service sends SMS to a phone number provided by a client request. The app is built with AWS Lambda and API Gateway using the Serverless Framework. The flow is documented [here](https://miro.com/app/board/uXjVPmSByMM=/).

## Contents

- [Github Actions](#github-actions)
- [Progress](#progress)

## Github Actions

Github Actions is used to build and deploy the app to AWS.

Following commands are used in the pipeline:

### Install Dependacies

```
npm ci
```

### Linting

```
npm run lint
```

### Tests

```
npm run test
```

### Deployment

```
npm run build
```

The app is deployed to the `eu-west-2` region on IAM user AWS account.

## Progress

### Done

- create IAM user account with MFA
- create lambda to receive request including phone number and message
- deploy to `eu-west-2` region using Github Actions
- send request payload to SNS Topic
- subscribe SQS Queue to SNS Topic
- create lambda to listen to SQS Queue event
- send message to SNS Topic
- validated phone number in AWS sandbox for SNS

### Todo

- use webapack
- invoke lambdas locally using serverless offline
- use middleware
- see why SMS is not being sent via SNS Topic
- refactor using an architectural pattern (e.g hexagonal architecture)
