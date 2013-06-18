# About

The goal of SG-SpeechWeb-Demo is to provide an online demonstration of various speech recognition systems. 

It provides a clean and well documented REST API to interact with. By default, LIUM_SpkDiarization will be used for the [diarisation step](http://en.wikipedia.org/wiki/Speaker_diarisation) and [CMU Shpinx](http://cmusphinx.sourceforge.net/) for the transcribing part.

# Installation

## API and docs

The REST API is developed with [Scala](http://en.wikipedia.org/wiki/Scala_%28programming_language%29) using [Play! Framework 2](http://www.playframework.com/).

All what you need is a JDK and Play! Framework. You will find how to install Play! [on the dedicated website](http://www.playframework.com/documentation/2.1.1/Installing).

Once `Play!` is installed just launch `play run` at the root of the project. When all the required libraries will have been downloaded, you should be able to access to the documentation of the API by accessing [http://localhost:9000](http://localhost:9000) in your browser.


## LIUM_SpkDiarization

The diarization tool used is available on the [official Wiki](http://lium3.univ-lemans.fr/diarization/doku.php). A version is packaged in ./bin/LIUM_SpkDiarization-4.2.jar. So you don't need to download anything.

## CMU Sphinx
_TODO_

# Developers

To enter the Play! (SBT) console just type `play` at the root of the project. Then you'll be able to run multiple commands:

- `compile` to compile the source code.
- `~compile` to watch the source code for changes and re-compile when needed.
- `clean` to ... clean the source code.
- `test` to launch the test suite.
- `~test` to watch the tests source code for changes and launch the test suite when needed.
- `test-only test.AudioFileApiControllerSpec` to only launch the test suite contained in the class `AudioFileApiControllerSpec` of the package named `test`.
- `run` to launch the webserver in order to access the app using [http://localhost:9000](http://localhost:9000) in your browser.
- `~run` to watch the source code for changes, re-compile when needed and to launch the webserver.
