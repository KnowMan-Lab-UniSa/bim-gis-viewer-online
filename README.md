# BIM-GIS Viewer Online

This project is forked from https://github.com/helenkwok/bim-gis-viewer 

## Key Features

- All files in the '/static/ifc' folder can be viewed online via a specific url for the chosen file through a webserver built with Express
- Only the admin can upload an .ifc file, via a dedicated admin panel

## How To Use

### Basic Usage

```bash
# 1. Clone this repository
$ git clone https://github.com/KnowMan-Lab-UniSa/bim-gis-viewer-online.git

# 2. Go into the repository
$ cd bim-gis-viewer-online

# 3. Install dependencies
$ npm install

# 4. Run Rollup
$ npm run build

# 5. Run Webserver
$ node server.js

# 6. Access the admin panel on localhost:3000/admin with (admin, admin) - From the admin panel you can change both username and password

# 7. Upload an .ifc file using the form on the admin panel, then access it at localhost:3000/<filename.ifc> 
```
### Docker Compose Usage

Folder Structure
The project structure is as follows:
```bash
bim-gis-viewer-online/
├── bim-gis-viewer-online/
│   ├── Dockerfile
├── db/
│   ├── users.db
├── Projects/
├── .env
├── docker-compose.yml

```

Docker Compose file Example

```yaml
services:
  bim-gis-viewer-online:
    container_name: bim-gis-viewer-online
    build: ./bim-gis-viewer-online
    ports:
      - "8080:3000"
    environment:
      PUID: $PUID
      PGID: $PGID
      TZ: $TZ
    restart: always
    volumes:
     - "./projects:/bim-gis-viewer-online/static/ifc"
     - "./db:/bim-gis-viewer-online/db" 
```

Docker File Example
```dockerfile
FROM node:23

RUN git clone https://github.com/KnowMan-Lab-UniSa/bim-gis-viewer-online.git /bim-gis-viewer-online/

WORKDIR /bim-gis-viewer-online

RUN npm install

CMD [ "node", "server.js" ]

EXPOSE 3000

```

ENV file Example
```bash
# Timezone
TZ=Europe/Rome

# User
PUID=1000
PGID=1000

```
Don't forget to upload the original db file (```db\users.db```), which contains the default username and password (admin, admin) for starting to use the project.