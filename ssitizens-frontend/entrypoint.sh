#!/bin/sh
 
# escape '//' of "https://"
#VAL_VITE_API_URL="${VITE_API_URL/\/\//\\/\\/}"
VAL_VITE_API_URL=${VITE_API_URL//\//\\/}
echo "VAL_VITE_API_URL: $VAL_VITE_API_URL"
 
# replace in indexXXXX.js In heroku.xml set temporal value, how replace with the value of the environment variable.
sed -i "s/__VITE_API_URL__/$VAL_VITE_API_URL/g" /usr/share/nginx/html/assets/*
 
# change port default for nginx
sed -i "s/listen  .*/listen $PORT;/g" /etc/nginx/conf.d/default.conf
 
exec nginx -g 'daemon off;'