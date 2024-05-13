
# Lutron Caseta Configuration

The Lutron Caseta node server has the following parameters:

 * lutron\_bridge\_ip: This is the IP of your Bridge Device.

 * username: This is your Lutron bridge username

 * password: This is your Lutron bridge password

Once all the configuration information is saved, the plug-in will attempt
to connect to the bridge.  With a connection to the bridge, it will then
query for all connected devices and create devices for each device found.

The Discover button may be used to force the node server to re-query the Bridge. Use this if you add additional devices to the Bridge using the Luton App.
