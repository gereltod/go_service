FROM golang:alpine as builder

WORKDIR /app 

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" .

RUN mv my_webrtc /usr/bin/

ENTRYPOINT ["my_webrtc"]