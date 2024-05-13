udi-ra2-poly.zip: nodes/lutronController.py
	cp README.md ../docs/udi-lutronra2-poly.md
	zip -r ../udi-ra2-poly.zip LICENSE Makefile POLYGLOT_CONFIG.md \
		README.md ra2.py install.sh nodes profile pylutron \
		requirements.txt
