# Fusion Tables Drive Export

## Description

Export Google Fusion Tables to Google Drive.

### Links

* Live: https://earth-voyager.appspot.com/

### Team

* PM Ubilabs: Patrick Mast <mast@ubilabs.net>
* DEV Ubilabs: Robert Katzki <katzki@ubilabs.net>

## Development

### Prerequisites
Make sure you have the following tools installed:

* git
* npm

### Installation

After cloning the repository, install all dependencies:

```sh
npm install # install dependencies
```

### Develop

Run the following command to start the server on localhost:

```sh
npm start # start the server
```

### Deploy

Create a [Google Cloud Platform project](https://console.cloud.google.com) and install the [Google Cloud SDK](https://cloud.google.com/sdk/).

Initialize the Cloud SDK by running:

```sh
gcloud init
```

Then run the following command to deploy the application:

```sh
npm run deploy
```

## Hosting

The project is hosted at [AppEngine](https://console.cloud.google.com/appengine?organizationId=793274810740&project=earth-voyager&serviceId=default&duration=PT1H)