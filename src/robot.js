import DeviceController from "@espruino-tools/device-controller";

export class Robot extends DeviceController {
  constructor() {
    super();
    this.speed = 600;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  forward() {
    this.UART.write("go(100,100,600)\n");
  }
  backward() {
    this.UART.write("go(-100,-100,600)\n");
  }
  left() {
    this.UART.write("go(100,50,600)\n");
  }
  right() {
    this.UART.write("go(50,100,600)\n");
  }
  spin() {
    this.UART.write("go(100,0,600)\n");
  }
  stop(){
    this.UART.write("go(0,0,0)\n");
  }
}