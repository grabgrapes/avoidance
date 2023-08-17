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

// function drawBoxAroundQRCode(ctx, location) {
//     ctx.strokeStyle = 'lime';  // 设置线条颜色为绿色
//     ctx.lineWidth = 5;  // 设置线条宽度
//     ctx.strokeRect(location.x, location.y, location.width, location.height);
// }

// function setToWhite(imageDataArray, location, width) {
//     const imageDataWidth = width;
//     const imageDataHeight = imageDataArray.length / (width * 4);  // Assuming RGBA data
//
//     for (let y = location.y; y < location.y + location.height && y < imageDataHeight; y++) {
//         for (let x = location.x; x < location.x + location.width && x < imageDataWidth; x++) {
//             const index = (y * width + x) * 4;
//
//             if (index + 3 < imageDataArray.length) {  // Ensure we don't go out of bounds
//                 imageDataArray[index] = 255;     // R
//                 imageDataArray[index + 1] = 255; // G
//                 imageDataArray[index + 2] = 255; // B
//                 imageDataArray[index + 3] = 255; // A
//             }
//         }
//     }
// }

// function setToWhite(imageData, location) {
//     for (let y = location.y; y < location.y + location.height; y++) {
//         for (let x = location.x; x < location.x + location.width; x++) {
//             const index = (y * imageData.width + x) * 4;
//
//             if (index + 3 < imageData.data.length) {
//                 imageData.data[index] = 255;     // R
//                 imageData.data[index + 1] = 255; // G
//                 imageData.data[index + 2] = 255; // B
//                 imageData.data[index + 3] = 255; // A
//             }
//         }
//     }
// }

const dataBeforeElement = document.getElementById('dataBefore');
const dataAfterElement = document.getElementById('dataAfter');

function compareData() {
    const dataBefore = document.getElementById('dataBefore').value;
    const dataAfter = document.getElementById('dataAfter').value;

    if (dataBefore === dataAfter) {
        console.log("The data is the same.");
        alert("The data is the same.");
    } else {
        console.log("The data has changed.");
        alert("The data has changed.");
    }
}

function scanForQRCodes() {
    let { ctx, data } = captureCurrentFrame(videoElement);
    let detectedCodes = [];
    let maxAttempts = 2;

    for (let i = 0; i < maxAttempts; i++) {
        const code = jsQR(data.data, data.width, data.height);
        console.log(code);
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
            // drawBoxAroundQRCode(ctx, location);  // 在此处添加绘制框的代码
            // setToWhite(data.data, location, data.width);  // 把二维码区域设置为白色
            // setToWhite(data, location);
            dataBeforeElement.value = Array.from(data.data).toString();
            ctx.fillStyle = 'white';
            ctx.fillRect(location.x, location.y, location.width, location.height);
            data = ctx.getImageData(0, 0, data.width, data.height)
            dataAfterElement.value = Array.from(data.data).toString();
            compareData();
            // data.data.set(ctx.getImageData(0, 0, data.width, data.height).data);

            console.log("find a QRcode");
        } else {
            break;
        }
    }

    console.log(detectedCodes); // 输出detectedCodes数组的内容

    if (detectedCodes.length !== 2) {
        if (lastDirection) {
            robot[lastDirection](); // Continue moving in the last known direction
        } else {
            robot.spin();  // Only spin if we never had a direction
        }
    } else {
        const centers = detectedCodes.map(computeCenterOfQRCode);
        controlRobotBasedOnQRCodeCenters(centers); // 注意函数名的修改
        console.log("calculated center and robot moved as instructed")
    }

    // 在1秒后再次运行此函数
    setTimeout(scanForQRCodes, 10000);
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
