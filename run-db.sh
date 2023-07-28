REPO='https://github.com/marcuscastelo/marucs-diet-data'
IP='0.0.0.0'
PORT='8090'
mkdir -p database
cd database

# Clone the repo if it doesn't exist, otherwise pull
git remote get-url origin | grep "$REPO" &&
    git pull origin main ||
    git clone "$REPO" .

function no_changes {
    git diff --quiet HEAD
    return $?
}

function commit {
    no_changes && return
    git add .
    git commit --quiet -m "Update database"
    git push --quiet origin main
}

# Run commit on background every 5 minutes
while true; do
    sleep 10
    # sleep 300
    commit
done &

# Execute database
./pocketbase serve --http "$IP":"$PORT"
commit