import { DeviceController } from "@espruino-tools/core";
const device = new DeviceController();

var elements = [];

export const showTemplate = () => {
  let root = document.getElementById("page-root");

  createImage();
  createTitle();
  createSubText();
  createConnectionButton();
  createDisconnectionButton();

  elements.map((element) => {
    root.appendChild(element);
  });
};

const createImage = () => {
  let imageContainer = document.createElement("div");
  imageContainer.className = "image-container";
  elements.push(imageContainer);
};

const createTitle = () => {
  let titleContainer = document.createElement("h1");
  titleContainer.innerText = "Espruino Tools";
  titleContainer.className = "title-container";
  elements.push(titleContainer);
};

const createSubText = () => {
  let subtextContainer = document.createElement("p");
  subtextContainer.className = "subtext-container";
  subtextContainer.innerHTML =
    'Get started quick by looking at the documentation <a id="documentation-link" href="https://documentation-xi-liard.vercel.app">here</a>';
  elements.push(subtextContainer);
};

const createDisconnectionButton = () => {
  const disconnectCallback = () => {
    let root = document.getElementById("page-root");

    let statusPopup = document.createElement("div");
    statusPopup.className = "connection-notification";
    statusPopup.innerHTML = "<p>Disconnected Successfully</p>";
    root.appendChild(statusPopup);
    setTimeout(function () {
      statusPopup.parentElement.removeChild(statusPopup);
    }, 2000);
  };

  let disconnectButton = document.createElement("button");
  disconnectButton.className = "esp-btn hidden";
  disconnectButton.id = "esp-disconnect";
  disconnectButton.classList += " red";
  disconnectButton.innerText = "Disconnect";
  disconnectButton.onclick = function () {
    device.disconnect().then(() => {
      disconnectCallback();
      let connectBtn = document.getElementById("esp-connect");
      disconnectButton.className = "hidden";
      connectBtn.classList = "esp-btn green";
    });
  };
  elements.push(disconnectButton);
};

const createConnectionButton = () => {
  const connectCallback = () => {
    let root = document.getElementById("page-root");

    let statusPopup = document.createElement("div");
    statusPopup.className = "connection-notification";
    statusPopup.innerHTML = "<p>Connected Successfully</p>";
    root.appendChild(statusPopup);
    setTimeout(function () {
      statusPopup.parentElement.removeChild(statusPopup);
    }, 2000);
  };

  let connectButton = document.createElement("button");
  connectButton.className = "esp-btn";
  connectButton.classList += " green";
  connectButton.id = "esp-connect";
  connectButton.innerText = "Connect";
  connectButton.onclick = function () {
    device.connect().then(() => {
      if (device.connected) {
        connectCallback();
        let disconnectBtn = document.getElementById("esp-disconnect");
        connectButton.className = "hidden";
        disconnectBtn.classList = "esp-btn red";
      }
    });
  };
  elements.push(connectButton);
};
