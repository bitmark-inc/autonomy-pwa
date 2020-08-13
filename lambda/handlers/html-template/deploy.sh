#!/bin/bash
zip function.zip index.js index.html manifest.webmanifest
aws lambda update-function-code --function-name $LAMBDA_FUNC_NAME --zip-file fileb://function.zip --publish