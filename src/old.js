import { Robot } from "./robot";
import { BrowserQRCodeReader } from '@zxing/library';

export function initiate() {
    startCamera();
}

const videoElement = document.getElementById('cameraView');
let robot = new Robot();
let lastDirection = null;

function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let constraints = {
            video: {
                facingMode: 'environment' // 使用后置摄像头
            }
        };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();

                // Start scanning after the video has started playing
                videoElement.onplaying = () => {
                    scanForQRCodes();
                };
            })
            .catch(error => {
                console.error("Error accessing the camera:", error);
            });
    } else {
        alert("Your browser does not support accessing the camera.");
    }
}

function captureCurrentFrame(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return { ctx, canvas }; // We'll return canvas for zxing
}

function computeCenterOfQRCode(location) {
    return {
        x: location.x + location.width / 2,
        y: location.y + location.height / 2
    };
}

function controlRobotBasedOnQRCodeCenters(centers) {
    const screenWidth = videoElement.videoWidth;
    const centerLineX = (centers[0].x + centers[1].x) / 2;

    if (centerLineX < screenWidth * 0.45) {
        robot.left();
        lastDirection = 'left';
    } else if (centerLineX > screenWidth * 0.55) {
        robot.right();
        lastDirection = 'right';
    } else {
        robot.forward();
        lastDirection = 'forward';
    }
}

function scanForQRCodes() {
    const { ctx, canvas } = captureCurrentFrame(videoElement);
    let detectedCodes = [];
    let maxAttempts = 2;

    const qrCodeReader = new BrowserQRCodeReader();
    for (let i = 0; i < maxAttempts; i++) {
        qrCodeReader.decodeFromImage(canvas)
            .then(result => {
                if (result) {
                    const location = {
                        x: result.resultPoints[0].x,
                        y: result.resultPoints[0].y,
                        width: result.resultPoints[2].x - result.resultPoints[0].x,
                        height: result.resultPoints[3].y - result.resultPoints[0].y
                    };
                    detectedCodes.push(location);
                    ctx.fillStyle = 'white';
                    ctx.fillRect(location.x, location.y, location.width, location.height);

                    // 更新canvas内容
                    canvas.getContext("2d").drawImage(ctx.canvas, 0, 0);
                }
            })
            .catch(() => {
                // Intentionally left empty to suppress errors when no QR code is detected
            });
    }

    if (detectedCodes.length !== 2) {
        if (lastDirection) {
            robot[lastDirection]();
        } else {
            robot.spin();
        }
    } else {
        const centers = detectedCodes.map(computeCenterOfQRCode);
        controlRobotBasedOnQRCodeCenters(centers);
    }

    setTimeout(scanForQRCodes, 1000);
}

export function connectRobot() {
    robot.connect(function () {
        console.log("connected");
    });
}

window.connectRobot = connectRobot;
window.initiate = initiate;

export function forward() {
  robot.forward();
}

export function backward() {
  robot.backward();
}

export function right() {
  robot.right();
}

export function left() {
  robot.left();
}

export function spin() {
  robot.spin();
}

export function stop() {
  robot.stop();
}