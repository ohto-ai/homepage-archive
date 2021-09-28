g++ homepage-api-test/main.cpp -std=c++17 -lpthread -o homepage-api-test/image_proxy &&\
echo compile complete.&&\
(ps -ef | grep image_proxy | grep -v grep | cut -c 10-16 | xargs kill -2
echo kill image_proxy.&&\
(cd homepage-api-test && br sudo ./image_proxy)&&\
ps -e | grep image_proxy &&\
echo  run image_proxy.)