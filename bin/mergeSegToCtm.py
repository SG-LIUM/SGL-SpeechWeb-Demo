#!/usr/bin/python
# vim : set fileencoding=utf-8 :
 
#
# mergeSegToCtm.py
#
# Enhance the CTM file by adding extra fields with the diarisation
# information
#
# First argument is the seg file
# Second argument is the ctm file
#
import sys

with open(sys.argv[1], 'r', encoding='iso-8859-1') as seg:
    with open(sys.argv[2], 'r', encoding='iso-8859-1') as ctm:

        # For each frame, we will create an entry in a dictionnary
        # It will help the lookup later on
        # We don't really care about memory issues here, should we?
        frames = {}

        for line in seg:
            values = line.split()
            start = int(values[2])
            duration = int(values[3])

            for i in range(start, start + duration):
                frames[i] = values[4], values[5], values[7]

        for line in ctm:
            values = line.split()
            # Use the same start format than in the .seg file
            start = int(float(values[2])*100)
            print(line.strip(), end="")
            if start in frames:
                print(" " + frames[start][0] + " " + frames[start][1] + " " + frames[start][2])
            else:
                print(" N/A N/A N/A")
