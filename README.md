# udi-poly-lutron-radiora2

Lutron RadioRA 2 NodeServer for Polyglot

- Polyglot V2 (On-premise installation).
- Testing Platform
    - ISY FW 5.3
    - Polisy Polyglot 2.2.9
    - Lutron RadioRA 2 Main Repeater 12.8.0

To get started with an on-premise installation: 
- NodeServer is availble in the Polyglot Store

[Lutron RadioRA 2 Information](https://www.lutron.com/en-US/Products/Pages/WholeHomeSystems/RadioRA2/Overview.aspx)

[Lutron RadioRA 2 Components](https://www.lutron.com/en-US/Products/Pages/WholeHomeSystems/RadioRA2/Components.aspx)

### Currently Supported Components
- Occupancy Sensors
    - Ceiling
    - Wall
- Room Occupancy
- Dimmer
- Switch
- Pico Remotes
    - 2 Button
    - 2 Button Raise/Lower
    - 3 Button
    - 3 Button Raise/Lower
    - 4 Button
- Tabletop Keypad
    - 5 Button Tabletop
    - 10 Button Tabletop
    - 15 Button Tabletop

### In-Development Components
- Wall Keypads
- Hybrid Keypads
- Visor Control Receiver (VCRX)
- Temperature Control
    - Pending demand
- Shades
    - Pending demand

## Notes
- Keypad raise/lower functionality is not presented to the Admin Console as there's no percentage of scene status available to manipulate.


# Configuring this node server

Enter the IP Address, Username, Password for your RadioRa 2 Main Repeater.  If
you have multiple systems connecting to your main repeater you should add a new
account to the system.  Only one(1) session is allowed per named account.

Devices can be added by clicking the 'Add Lutron Devices' button.  
Each device has 3 parameters to configure.
- Display Name in Admin Console
- Lutron Integration ID Number
    - Retrieved from Integration Report
- Device Type  

See below for the device type mapping information

If device type is not setup correctly the device will be created wrong or not at all.

### Device Types:

#### Occupancy Sensors
- Ceiling,Wall(90/180)  = 2
- Room Status           = 3

#### Pico Remotes
- 2 Button              = 4
- 2 Button Raise Lower  = 5
- 3 Button              = 6
- 3 Button Raise Lower  = 7
- 4 Button Pico         = 8

#### Switch / Dimmer
- Switch                = 10
- Dimmer                = 11
- Fan Controller        = 12

#### Key Pads
- 5 Button Tabletop     = 14
- 10 Button Tabletop    = 15
- 15 Button Tabletop    = 16

#### Visor Control Receiver (VCRX)
- VCRX                  = 13

#### Temperature Controls
- Depends on requests

#### Shades
- Sivoia QS Wireless Shades = 20