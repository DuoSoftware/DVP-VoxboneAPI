FROM ubuntu
RUN apt-get update
RUN apt-get install -y git nodejs npm
RUN git clone git://github.com/DuoSoftware/DVP-VoxboneAPI.git /usr/local/src/voxboneAPI
RUN cd /usr/local/src/voxboneAPI; npm install
CMD ["nodejs", "/usr/local/src/voxboneAPI/app.js"]

EXPOSE 8832