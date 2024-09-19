# udi-poly-lutron-st-radiora2

Lutron NodeServer for Polyglot

- Polyglot V2 (On-premise installation).
- Testing Platform
    - ISY FW 5.3
    - Polisy Polyglot 2.2.9
    - Lutron RadioRA 2 Main Repeater 12.8.0

To get started with an on-premise installation: 
- NodeServer is availble in the Polyglot Store

[Lutron RadioRA 2 Information](https://www.lutron.com/en-US/Products/Pages/WholeHomeSystems/RadioRA2/Overview.aspx)

[Lutron RadioRA 2 Components](https://www.lutron.com/en-US/Products/Pages/WholeHomeSystems/RadioRA2/Components.aspx)

[Lutron RA2 Select Information](https://www.lutron.com/en-US/Products/Pages/WholeHomeSystems/RA2Select/Overview.aspx)

[Lutron RA2 Select System Design](https://www.lutron.com/en-US/Products/Pages/WholeHomeSystems/RA2Select/Components.aspx)

[Lutron Caseta Pro Information](https://www.casetawireless.com/proproducts)

### Currently Supported Components
- Occupancy Sensors
    - Ceiling
    - Wall
- Room Occupancy
- Dimmer
- Switch
- Visor Control Receiver (VCRX)
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
- Wall Keypads
    - 1RLD
    - 2RLD
    - 3BD
    - 3BRL
    - 3BSRL
    - 4S
    - 5BRL
    - 5BRLIR
    - 6BRL
    - 7B
    
### In-Development Components
- Hybrid Keypads
- Temperature Control
    - Pending demand
- Shades
    - Pending demand

## Notes
- Keypad raise/lower functionality is not presented to the Admin Console as there's no percentage of scene status available to manipulate.

# Configuring this node server
- Multiple Control systems connecting to a main repeater or bridge using the same username/password is not supported by Lutron and will cause the main repeater/bridge to lock down the connection requiring a time-out period of 15 minutes or power cycle!

## RadioRA 2
- Enter the IP Address, Username, Password for your RadioRA 2 Main Repeater.

## Adding Devices
- Devices are added by clicking the 'Add Lutron Devices' button.
- Three parameters to configure.
  - Display Name in Admin Console
  - Lutron Integration ID Number
  - Retrieved from Integration Report

# Device Type Mapping Information
- If device type is not setup correctly the device will be created wrong or not at all.

## Device Types:
| Device    | Value |
|-----------|-------|
| Occupancy Sensors (Wall/Ceiling)  | 2 |
| Room Status                       | 3 |
| Pico 2 Button                     | 4 |
| Pico 2 Button Raise / Lower       | 5 |
| Pico 3 Button                     | 6 |
| Pico 3 Button Raise / Lower       | 7 |
| Pico 4 Button                     | 8 |
| Maestro / Caseta Switch           | 10 |
| Maestro / Caseta Dimmer           | 11 |
| Maestro / Caseta Fan Controller   | 12 |
| Visor Control Receiver (VCRX)     | 13 |
| Tabletop Keypad 5 Button          | 14 |
| Tabletop Keypad 10 Button         | 15 |
| Tabletop Keypad 15 Button         | 16 |
- SeeTouch 1RLD Keypad              | 18 |
- SeeTouch 2RLD Keypad              | 19 |
- SeeTouch 3BD Keypad               | 20 |
- SeeTouch 3BRL Keypad              | 21 |
- SeeTouch 3BSRL Keypad             | 22 |
- SeeTouch 4S Keypad                | 23 |
- SeeTouch 5BRL Keypad              | 24 |
- SeeTouch 5BRLIR Keypad            | 25 |
- SeeTouch 6BRL Keypad              | 26 |
- SeeTouch 7B Keypad                | 27 |
| Sivoia QS Wireless Shades         | 30 |
