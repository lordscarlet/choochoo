# Step 1: build
npm run build
# Step 2: deploy static files to S3
aws s3 cp ./src/client/index.html s3://www.choochoo.games/index.html --acl public-read
aws s3 cp ./dist/ s3://www.choochoo.games/dist/ --recursive --acl public-read
# Step 3: deploy API to server.
tar -cvzf ./builds/server.tar.gz ./bin
scp -i ~/Documents/choochoo.pem ./builds/server.tar.gz ec2-user@api.choochoo.games:~/dump/
ssh -i ~/Documents/choochoo.pem ec2-user@api.choochoo.games << EOF
  cd ~/choochoo/
  rm -rf ~/choochoo/bin
  tar -xzvf ~/dump/server.tar.gz
  npm install
  pm2 reload index
EOF
