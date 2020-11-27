# Configuring this node server
- Multiple Control systems connecting to a main repeater or bridge using the same username/password is not supported by Lutron and will cause the main repeater/bridge to lock down the connection requiring a time-out period of 15 minutes or power cycle!

## RadioRA 2
- Enter the IP Address, Username, Password for your RadioRa 2 Main Repeater.

## RA2 Select
- Default username and password are lutron/integration and are the defaults for the NodeServer.
- The Lutron Integration Protocol does not report status of Occupancy sensors for RA 2 Select.  Occupancy sensors added as devices will not report status.
- Pico remotes are the only keypad available for RA 2 Select.

## Caseta Pro
- Default username and password are lutron/integration and are the defaults for the NodeServer.
- Telnet Support must be enabled from the mobile app
  - Settings -> Advanced -> Integration -> Telnet Suport
- The Integration Report is accessible from the mobile app.
  - Settings -> Advanced -> Integration
- The Lutron Integration Protocol does not report status of Occupancy sensors for Caseta Pro.  Occupancy sensors added as devices will not report status.
- Pico remotes are the only keypad available for Caseta Pro.

## Shades
- Shades are experimental and may not function correctly.
- Need test equipment or testers

### Adding Devices
Devices are added by clicking the 'Add Lutron Devices' button.

#### Parameters to configure.
- Display Name in Admin Console
- Lutron Integration ID Number
- Device Type

# Device Type Mapping Information

If device type is not setup correctly the device will be created wrong or not at all.

## Device Types:
- Occupancy Sensors (Wall/Ceiling)  | 2 
- Room Status                       | 3 
- Pico 2 Button                     | 4 
- Pico 2 Button Raise / Lower       | 5 
- Pico 3 Button                     | 6 
- Pico 3 Button Raise / Lower       | 7 
- Pico 4 Button                     | 8 
- Maestro / Caseta Switch           | 10 
- Maestro / Caseta Dimmer           | 11 
- Meastro / Caseta Fan Controller   | 12 
- Visor Control Receiver (VCRX)     | 13 
- Tabletop Keypad 5 Button          | 14 
- Tabletop Keypad 10 Button         | 15 
- Tabletop Keypad 15 Button         | 16 
- Sivoia QS Wireless Shades         | 30 
