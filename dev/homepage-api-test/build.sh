g++ homepage-api-test/main.cpp -std=c++17 -O3 -lpthread -o ../../plugin/bin/image_proxy &&\
echo compile complete.&&\
(ps -ef | grep image_proxy | grep -v grep | cut -c 10-16 | xargs sudo kill -15
echo kill image_proxy.&&\
(cd ../../plugin/bin/ && br image_proxy)&&\
echo  run image_proxy.)
