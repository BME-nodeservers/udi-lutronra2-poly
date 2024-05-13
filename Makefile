NS := $(shell basename `pwd`)
VERSION := $(shell cat server.json | jq -r '.credits[0].version')

clean: ./build
  @echo "Cleaning Build"
  rm -rf ./build
  @echo "Clean Dist"
  rm -rf ./dist

build:
  mkdir dist
  mkdir build
  chmod +x install.sh
  tar -X exclude_list --exclude-vcs -cvf - . | (cd build; tar xf -)
  cd build; zip ../dist/pg3_radiora2.zip -r .
