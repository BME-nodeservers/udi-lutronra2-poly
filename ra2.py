#!/usr/bin/env python
import udi_interface
import sys
from nodes.controller import LutronRA2Controller

LOGGER = udi_interface.LOGGER

if __name__ == "__main__":
    try:
        polyglot = udi_interface.Interface([])
        polyglot.start('1.0.0')
        LutronRA2Controller(polyglot)
        polyglot.runForever()
    except (KeyboardInterrupt, SystemExit):
        polyglot.stop()
        sys.exit(0)
