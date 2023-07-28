cd /home/marucs/Development_OnArchHD/diet-next/
konsole -e /bin/bash --rcfile <(echo "yarn dev") & disown
konsole -e /bin/bash --rcfile <(echo "./run-db.sh") & disown