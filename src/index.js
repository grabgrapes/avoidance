import { Robot } from "./robot";
import jsQR from "jsqr";

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
    return { ctx, data: ctx.getImageData(0, 0, canvas.width, canvas.height) };
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
    setInterval(() => {
        const { ctx, data } = captureCurrentFrame(videoElement);
        let detectedCodes = [];
        let maxAttempts = 2;

        for (let i = 0; i < maxAttempts; i++) {
            const code = jsQR(data.data, data.width, data.height);
            if (code) {
                let TopLeftX = code.location.topLeftCorner.x;
                let TopLeftY = code.location.topLeftCorner.y;
                let TopRightX = code.location.topRightCorner.x;
                let BottomLeftY = code.location.bottomLeftCorner.y;
                let location = {
                    x: TopLeftX,
                    y: TopLeftY,
                    width: TopRightX - TopLeftX,
                    height: BottomLeftY - TopLeftY
                };
                detectedCodes.push(location);
                ctx.fillStyle = 'white';
                ctx.fillRect(location.x, location.y, location.width, location.height);
                data.data.set(ctx.getImageData(0, 0, data.width, data.height).data);
            } else {
                break;
            }
        }

        if (detectedCodes.length !== 2) {
            if (lastDirection) {
                robot[lastDirection](); // Continue moving in the last known direction
            } else {
                robot.spin();  // Only spin if we never had a direction
            }
        } else {
            const centers = detectedCodes.map(computeCenterOfQRCode);
            controlRobotBasedOnQRCodeCenters(centers);
        }

    }, 600); // Check every second
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
