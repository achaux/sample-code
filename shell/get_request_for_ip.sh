#!/bin/bash
# Test an IP address for validity:
# Usage:
#      valid_ip IP_ADDRESS
#      if [[ $? -eq 0 ]]; then echo good; else echo bad; fi
#   OR
#      if valid_ip IP_ADDRESS; then echo good; else echo bad; fi
#
function valid_ip()
{
    local  ip=$1
    local  stat=1

    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        OIFS=$IFS
        IFS='.'
        ip=($ip)
        IFS=$OIFS
        [[ ${ip[0]} -le 255 && ${ip[1]} -le 255 \
            && ${ip[2]} -le 255 && ${ip[3]} -le 255 ]]
        stat=$?
    fi
    return $stat
}

# Where does the log file reside?
if [ "$2" == "" ]; then
  LOG_FILE='/var/log/httpd/access_log'
else
  if [ ! -f $2 ]
  then
    echo "Error: Log file $LOG_FILE does not exist.  Exiting."
    exit
  else
    LOG_FILE=$2
  fi
fi

# What IP address are we searching form?
if [ "$1" == "" ];
then
  echo "Error: No IP address specified.  Exiting."
  exit
else
  if valid_ip $1;
  then
    IP=$1
    echo "Checking $IP against $LOG_FILE";
  else
    echo "Error: $1 is not a valid IP address.  Exiting."
    exit;
  fi
fi

BACKUP_DIR='/tmp/backup'
# Sanity checks
if [ ! -d $BACKUP_DIR ]
then
   echo "Error: Backup directory $BACKUP_DIR does not exist.  Exiting."
   exit
fi

grep $IP $LOG_FILE | awk '{ print $3, $4, $5, $6 }' > $BACKUP_DIR/requests.csv

# Replace space between ip and forwarded-for ip
# ls -al | sed 's/\([rot]*\)*\([0-9]*\)/\1\1\2\2/g'
sed -i.bak 's|\([0-9\.]*\), \([0-9\.]*\)|\1-\2|g' $BACKUP_DIR/requests.csv

# Remove space after GET or POST
# ls -al | sed 's/\([rot]*\)*\([0-9]*\)/\1\1\2\2/g'
#sed -i.bak 's|\([GETPOS]*\) |\1 |g' $BACKUP_DIR/requests.csv

# Replace all double quotes with NULL
sed -i.bak 's/"//g' $BACKUP_DIR/requests.csv

# Replace all commas with NULL
sed -i.bak 's/,//g' $BACKUP_DIR/requests.csv

sort $BACKUP_DIR/requests.csv | uniq -c | sort -nr > $BACKUP_DIR/requests_sorted.csv

awk ' { print $1 "," $2 "," $3 "," $4 } ' $BACKUP_DIR/requests_sorted.csv > $BACKUP_DIR/requests_sorted.csv.2

# Replace all spaces with comma
sort -nr $BACKUP_DIR/requests_sorted.csv.2 > $BACKUP_DIR/requests_sorted.csv

sed -i '1i Requests,"IP address(s)",Method,URL' $BACKUP_DIR/requests_sorted.csv

cat $BACKUP_DIR/requests_sorted.csv

mutt -e "set from=user@example.com" -s "Requests from $IP" -a $BACKUP_DIR/requests_sorted.csv -- "achaux@educause.edu" <<< "Attached"

rm -f $BACKUP_DIR/requests.csv
rm -f $BACKUP_DIR/requests.csv.bak
rm -f $BACKUP_DIR/requests_sorted.csv
rm -f $BACKUP_DIR/requests_sorted.csv.2