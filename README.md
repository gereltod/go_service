# go_service

go ajiluulah dockerfile

docker build -t mywebcrt .
docker run -it -p 8080:8080 mywebcrt

docker-compose build --no-cache && docker-compose up -d

create ssl
./openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout d:\nginx-selfsigned.key -out d:\nginx-selfsigned.crt
