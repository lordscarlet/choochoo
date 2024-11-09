# Step 1: build
npm run build-server
# Step 2: deploy API to server.
tar -cvzf ./builds/server.tar.gz ./bin
scp -i ~/Documents/choochoo.pem ./builds/server.tar.gz ec2-user@api.choochoo.games:~/dump/
scp -i ~/Documents/choochoo.pem package.json ec2-user@api.choochoo.games:~/choochoo/package.json
ssh -i ~/Documents/choochoo.pem ec2-user@api.choochoo.games << EOF
  cd ~/choochoo/
  rm -rf ~/choochoo/bin
  tar -xzvf ~/dump/server.tar.gz
  npm install
  pm2 reload index
EOF
