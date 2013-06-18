#!/bin/bash

b=`basename $1 .avi`
d=`dirname $1` 

ffmpeg -i $1  -vn -acodec pcm_s16le -ac 1 $2
