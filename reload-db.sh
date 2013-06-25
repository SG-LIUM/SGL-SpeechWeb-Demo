#!/usr/bin/env bash
play -Dconfig.file=conf/application.conf drop-create-schema
play -Dconfig.file=conf/application.conf load-fixtures
