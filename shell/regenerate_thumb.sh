
#!bin/sh
path=$1
thumb=$2
for file in $path*
do
    if [ -f $file ]; then
        echo "Generate $file thumb."
        python thumb.py $file $thumb
    fi
done