# BIM-GIS Viewer

Forked from https://github.com/helenkwok/bim-gis-viewer 

## Key Features

- All files in the '/static/ifc' folder can be viewed online via a specific url for the chosen file through a webserver built with Express
- Only the admin can upload an .ifc file, via a dedicated admin panel

## How To Use

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

