# -*- coding: utf-8 -*-
# Part of Modeem. See LICENSE file for full copyright and licensing details.

import serial.tools.list_ports

from modeem.addons.hw_drivers.interface import Interface


class SerialInterface(Interface):
    connection_type = 'serial'

    def get_devices(self):
        serial_devices = {}
        for port in serial.tools.list_ports.comports():
            serial_devices[port.device] = {
                'identifier': port.device
            }
        return serial_devices
