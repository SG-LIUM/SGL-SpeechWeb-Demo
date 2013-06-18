b=`basename $1 .wav`

/usr/bin/java -Xmx2024m -jar ./LIUM_SpkDiarization-4.2.jar --fInputMask=$1 --sOutputMask=./$b.seg --doCEClustering $b
