#!/bin/bash
if [ $# -eq 0 ];then
  echo "Usage: $0 <author> <image_path_1> [img_path_2...]"
  exit 0
fi
for ((i=2; i<=$#;i++))
do
    echo -e "https:\c"
    curl -F "image=@${!i}" 'http://ohtoai.top/api/img?op=upload&ret=text&author='${1}
    echo -e ""
done
