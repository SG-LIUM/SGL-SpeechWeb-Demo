About
=====

The goal of SG-SpeechWeb-Demo is to provide an online demonstration of various speech recognition systems. 

It provides a clean and well documented REST API to interact with. By default, LIUM_SpkDiarization will be used for the [diarisation step](http://en.wikipedia.org/wiki/Speaker_diarisation) and [CMU Shpinx](http://cmusphinx.sourceforge.net/) for the transcribing part.

Installation
============

The REST API is developed with [Scala](http://en.wikipedia.org/wiki/Scala_%28programming_language%29) using [Play! Framework 2](http://www.playframework.com/).

All what you need is a JDK and Play! Framework. You will find how to install Play! [on the dedicated website](http://www.playframework.com/documentation/2.1.1/Installing).

Once `Play!` is installed just launch `play run` at the root of the project. When all the required libraries will have been downloaded, you should be able to access to the documentation of the API by accessing [http://localhost:9000](http://localhost:9000) in your browser.
