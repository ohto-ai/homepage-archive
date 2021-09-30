#!/bin/bash
if [ $# -eq 0 ];then
  echo "Usage: $0 <image_path_1> [img_path_2...]"
  exit 0
fi
for i in $@
do
    echo -e "https:\c"
    curl -F "image=@$1" 'http://ohtoai.top/api/img?op=upload&ret=text'
    echo -e ""
done