# rx-observable
Reactive Extensions -  the non-backpressured, optionally multi-valued base reactive class that offers factory methods, intermediate operators and the ability to consume synchronous and/or asynchronous reactive dataflows. 

[![NPM](https://nodei.co/npm/rx-observable.png)](https://nodei.co/npm/rx-observable/)

[![](https://data.jsdelivr.com/v1/package/npm/rx-observable/badge)](https://www.jsdelivr.com/package/npm/rx-observable)
[![HitCount](http://hits.dwyl.io/lxsmnsyc/rx-observable.svg)](http://hits.dwyl.io/lxsmnsyc/rx-observable)

| Platform | Build Status |
| --- | --- |
| Linux | [![Build Status](https://travis-ci.org/LXSMNSYC/rx-observable.svg?branch=master)](https://travis-ci.org/LXSMNSYC/rx-observable) |
| Windows | [![Build status](https://ci.appveyor.com/api/projects/status/mkjwe462uk80axx4?svg=true)](https://ci.appveyor.com/project/LXSMNSYC/rx-observable) |


[![codecov](https://codecov.io/gh/LXSMNSYC/rx-observable/branch/master/graph/badge.svg)](https://codecov.io/gh/LXSMNSYC/rx-observable)
[![Known Vulnerabilities](https://snyk.io/test/github/LXSMNSYC/rx-observable/badge.svg?targetFile=package.json)](https://snyk.io/test/github/LXSMNSYC/rx-observable?targetFile=package.json)

## Install

NPM

```bash
npm i rx-observable
```

CDN

* jsDelivr
```html
<script src="https://cdn.jsdelivr.net/npm/rx-cancellable/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/rx-scheduler/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/rx-observable/dist/index.min.js"></script>
```

* unpkg
```html
<script src="https://unpkg.com/rx-cancellable/dist/index.min.js"></script>
<script src="https://unpkg.com/rx-scheduler/dist/index.min.js"></script>
<script src="https://unpkg.com/rx-observable/dist/index.min.js"></script>
```

## Usage

### Loading the module

#### CommonJS

```js
const Observable = require('rx-observable');
```

Loading the CommonJS module provides the Observable class.

#### Browser

Loading the JavaScript file for the rx-observable provides the Observable class

## Documentation

You can read the documentation at the [official doc site](https://lxsmnsyc.github.io/rx-observable/)

## Build

Clone the repo first, then run the following to install the dependencies

```bash
npm install
```

To build the coverages, run the test suite, the docs, and the distributable modules:

```bash
npm run build