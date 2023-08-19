import { Robot } from "./robot";

export function initiate() {
    startCamera();
}

const videoElement = document.getElementById('cameraView');
let robot = new Robot();
let lastDirection = null;

window.onOpenCvReady = function() {
    console.log('OpenCV ready');
    // startCamera();
}

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
                // videoElement.onplaying = function() {
                //     requestAnimationFrame(scanForQRCodes);
                // };
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

function scanForQRCodes() {
    let detectedCodes = detectQRWithOpenCV(videoElement);
    console.log(detectedCodes); // 输出detectedCodes数组的内容

    if (detectedCodes.length !== 2) {
        if (lastDirection) {
            robot[lastDirection](); // Continue moving in the last known direction
        } else {
            robot.spin();  // Only spin if we never had a direction
        }
    } else {
        const centers = detectedCodes.map(computeCenterOfQRCode);
        controlRobotBasedOnQRCodeCenters(centers);
        console.log("calculated center and robot moved as instructed")
    }

    // 在1秒后再次运行此函数
    setTimeout(scanForQRCodes, 10000);
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

function detectQRWithOpenCV(videoElement) {
    videoElement.height = videoElement.videoHeight;
    videoElement.width = videoElement.videoWidth;
    const src = new cv.Mat(videoElement.videoHeight, videoElement.videoWidth, cv.CV_8UC4);
    const cap = new cv.VideoCapture(videoElement);
    cap.read(src);

    let qrDecoder = new cv.QRCodeDetector();
    let decodedInfo = new cv.MatVector();
    let points = new cv.MatVector();
    let straightQrcode = new cv.Mat();

    console.log("before detect");
    const detected = qrDecoder.detectAndDecodeMulti(src, decodedInfo, points, straightQrcode);
    console.log("after detect");
    let detectedCodes = [];

    if (detected) {
        for (let i = 0; i < points.size(); i++) {
            let qrCorners = points.get(i);
            const rect = cv.boundingRect(qrCorners);
            detectedCodes.push(rect);
        }
    }

    src.delete();
    decodedInfo.delete();
    points.delete();
    straightQrcode.delete();

    return detectedCodes;
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