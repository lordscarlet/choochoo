# Step 1: build
npm run build-client
# Step 2: deploy static files to S3
aws s3 cp ./src/client/index.html s3://www.choochoo.games/index.html
aws s3 cp ./dist/ s3://www.choochoo.games/dist/ --recursive