g++ wp_server.cpp -std=c++17 -lpthread -o wp_server &&\
echo compile complete.&&\
(ps -ef | grep wp_server | grep -v grep | cut -c 10-16 | xargs kill -9
echo kill wp_server.&&\
(br wp_server)&&\
echo  run wp_server.)