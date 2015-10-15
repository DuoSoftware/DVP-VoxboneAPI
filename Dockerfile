FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-VoxboneAPI.git /usr/local/src/voxboneapi
RUN cd /usr/local/src/voxboneapi; npm install
CMD ["nodejs", "/usr/local/src/voxboneapi/app.js"]

EXPOSE 8832
