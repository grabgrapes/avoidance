import { Robot } from "./robot";
import jsQR from "jsqr";

export function initiate() {
    startCamera();
}

const videoElement = document.getElementById('cameraView');
const canvasOverlay = document.getElementById('canvasOverlay');
let robot = new Robot();

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

                videoElement.onplaying = () => {
                    canvasOverlay.width = videoElement.videoWidth;
                    canvasOverlay.height = videoElement.videoHeight;
                    canvasOverlay.style.position = 'absolute';
                    canvasOverlay.style.top = videoElement.offsetTop + 'px';
                    canvasOverlay.style.left = videoElement.offsetLeft + 'px';
                    scanForQRCode();
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

function controlRobotBasedOnQRCodeCenter(center) {
    const screenWidth = videoElement.videoWidth;
    if (center.x < screenWidth * 0.45) {
        robot.left();
    } else if (center.x > screenWidth * 0.55) {
        robot.right();
    } else {
        robot.forward();
    }
}

function drawRectangleAroundQRCode(location) {
    const ctx = canvasOverlay.getContext('2d');
    ctx.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 4;
    ctx.strokeRect(location.x, location.y, location.width, location.height);
}

function scanForQRCode() {
    let { ctx, data } = captureCurrentFrame(videoElement);
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
        const center = computeCenterOfQRCode(location);
        controlRobotBasedOnQRCodeCenter(center);
        drawRectangleAroundQRCode(location);
    } else {
        const ctx = canvasOverlay.getContext('2d');
        ctx.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
    }
    setTimeout(scanForQRCode, 200);
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
